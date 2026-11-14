// HARİTA ÜRETİM BETİĞİ — Görev 01 / Adım 2
//
// Ne yapar:
//   1. veri/ham/geoBoundaries-TUR-ADM1.geojson ham sınır verisini okur.
//   2. Çok küçük ada parçalarını (kayalıklar) eler; anlamlı adaları korur.
//   3. TOPOLOJİK sadeleştirme yapar (komşu illerin ortak sınırı birlikte
//      sadeleşir → iller arasında boşluk açılmaz).
//   4. Türkiye enlemine uygun KONİK (Lambert Conformal Conic) projeksiyon uygular
//      (yoksa harita yatay basık görünür).
//   5. Her il için etiket noktası hesaplar (polylabel = sınırlara en uzak iç nokta;
//      centroid içbükey illerde denize düşer).
//   6. veri/harita.json (SVG çizim yolları + etiket noktaları) yazar.
//   7. onizleme/harita.html (tarayıcıda/tablette açılan kontrol sayfası) yazar.
//
// Çalıştırma:  node scripts/harita-uret.js
// TypeScript yok, düz JavaScript.

const fs = require('fs');
const path = require('path');

const topoServer = require('topojson-server');
const topoSimplify = require('topojson-simplify');
const topoClient = require('topojson-client');
const turf = require('@turf/turf');
const polylabel = require('polylabel').default || require('polylabel');
const kanonik = require('./iller-kanonik');

const PROJ = path.join(__dirname, '..');
const HAM = path.join(PROJ, 'veri/ham/geoBoundaries-TUR-ADM1.geojson');
const OUT_JSON = path.join(PROJ, 'veri/harita.json');

// ---- Ayarlanabilir parametreler ----
const MIN_ADA_KM2 = 6; // bundan küçük ayrık parçalar (kayalıklar) elenir
const QUANT = 2e4; // topoloji quantization (ince ızgara)
const SADELIK = 0.25; // topojson quantile eşiği: DÜŞÜK = daha sade (az nokta)
const GENISLIK = 1000; // çıktı SVG genişliği (px)
const PAD = 12; // kenar boşluğu (px)

// =================== 1. HAM VERİYİ OKU + KOD/AD EKLE ===================
const gj = JSON.parse(fs.readFileSync(HAM, 'utf8'));
let atlanan = [];
gj.features.forEach((f) => {
  const iso = f.properties.shapeISO || '';
  const m = /^TR-?(\d{1,2})$/.exec(iso);
  const kod = m ? String(parseInt(m[1], 10)).padStart(2, '0') : null;
  if (!kod || !kanonik[kod]) {
    atlanan.push(f.properties.shapeName + ' (' + iso + ')');
    return;
  }
  f.properties.kod = kod;
  f.properties.ad = kanonik[kod].ad; // kanonik yazım (Afyonkarahisar, Hakkari)
  f.properties.bolge = kanonik[kod].bolge;
});
if (atlanan.length) console.log('UYARI — eşleşmeyen feature:', atlanan.join(', '));

// =================== 2. KÜÇÜK ADALARI ELE ===================
function poligonAlanKm2(ring) {
  try {
    return turf.area(turf.polygon([ring])) / 1e6;
  } catch (e) {
    return 0;
  }
}
let toplamAtilanAda = 0,
  korunanAda = 0;
gj.features.forEach((f) => {
  const g = f.geometry;
  if (g.type !== 'MultiPolygon') return;
  // her poligonun dış halka alanını bul
  const alanli = g.coordinates.map((poly) => ({ poly, alan: poligonAlanKm2(poly[0]) }));
  alanli.sort((a, b) => b.alan - a.alan);
  const enBuyuk = alanli[0];
  const tutulan = alanli.filter((p) => p === enBuyuk || p.alan >= MIN_ADA_KM2);
  const atilan = alanli.length - tutulan.length;
  toplamAtilanAda += atilan;
  korunanAda += tutulan.length - 1; // ana kara hariç korunan ada
  g.coordinates = tutulan.map((p) => p.poly);
  if (g.coordinates.length === 1) f.geometry = { type: 'Polygon', coordinates: g.coordinates[0] };
});
console.log(
  'Adalar: ' +
    korunanAda +
    ' anlamlı ada korundu, ' +
    toplamAtilanAda +
    ' küçük kayalık elendi (eşik ' +
    MIN_ADA_KM2 +
    ' km²).'
);

// =================== 3. TOPOLOJİK SADELEŞTİRME ===================
let topo = topoServer.topology({ iller: gj }, QUANT);
topo = topoSimplify.presimplify(topo, topoSimplify.sphericalTriangleArea);
const minW = topoSimplify.quantile(topo, SADELIK);
topo = topoSimplify.simplify(topo, minW);
const feats = topoClient.feature(topo, topo.objects.iller).features;

// =================== 4. KONİK PROJEKSİYON (Lambert Conformal Conic) ===================
const D2R = Math.PI / 180;
const f1 = 37 * D2R,
  f2 = 41 * D2R,
  f0 = 39 * D2R,
  l0 = 35 * D2R;
const nLcc =
  Math.log(Math.cos(f1) / Math.cos(f2)) /
  Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
const Flcc = (Math.cos(f1) * Math.pow(Math.tan(Math.PI / 4 + f1 / 2), nLcc)) / nLcc;
const rho0 = Flcc / Math.pow(Math.tan(Math.PI / 4 + f0 / 2), nLcc);
function lcc(lon, lat) {
  const φ = lat * D2R,
    λ = lon * D2R;
  const ρ = Flcc / Math.pow(Math.tan(Math.PI / 4 + φ / 2), nLcc);
  const θ = nLcc * (λ - l0);
  return [ρ * Math.sin(θ), rho0 - ρ * Math.cos(θ)]; // y yukarı
}

// tüm noktaları projekte et + global bbox bul
let minX = Infinity,
  maxX = -Infinity,
  minY = Infinity,
  maxY = -Infinity;
function projeRings(rings) {
  return rings.map((ring) =>
    ring.map(([lon, lat]) => {
      const [x, y] = lcc(lon, lat);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      return [x, y];
    })
  );
}
const projeliIller = feats.map((f) => {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return {
    kod: f.properties.kod,
    ad: f.properties.ad,
    bolge: f.properties.bolge,
    polys: polys.map(projeRings),
  };
});

// =================== 5. EKRANA SIĞDIR (ölçek + Y ters çevir) ===================
const scale = (GENISLIK - 2 * PAD) / (maxX - minX);
const YUKSEKLIK = Math.round((maxY - minY) * scale + 2 * PAD);
function ekrana([x, y]) {
  return [
    +(PAD + (x - minX) * scale).toFixed(1),
    +(PAD + (maxY - y) * scale).toFixed(1), // flip
  ];
}

// =================== 6. SVG YOLU + ETİKET NOKTASI ===================
const iller = {};
let toplamNokta = 0;
projeliIller.forEach((il) => {
  let yol = '';
  const ekranPolys = il.polys.map((poly) => poly.map((ring) => ring.map(ekrana)));
  ekranPolys.forEach((poly) => {
    poly.forEach((ring) => {
      toplamNokta += ring.length;
      yol += 'M' + ring.map((p) => p.join(',')).join('L') + 'Z';
    });
  });
  // etiket: en büyük poligonun polylabel'i (ekran koordinatında)
  let enBuyuk = ekranPolys[0],
    enBuyukAlan = -1;
  ekranPolys.forEach((poly) => {
    const a = Math.abs(halkaAlan(poly[0]));
    if (a > enBuyukAlan) {
      enBuyukAlan = a;
      enBuyuk = poly;
    }
  });
  const [ex, ey] = polylabel(enBuyuk, 1.0);
  iller[il.kod] = { yol, etiket: { x: +ex.toFixed(1), y: +ey.toFixed(1) } };
});

function halkaAlan(ring) {
  let a = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++)
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  return a / 2;
}

// =================== 7. harita.json YAZ ===================
const haritaJson = {
  meta: {
    genislik: GENISLIK,
    yukseklik: YUKSEKLIK,
    projeksiyon: 'Lambert Conformal Conic (parallels 37/41, merkez 35°D 39°K)',
    kaynak: 'geoBoundaries TUR ADM1 (CC BY-SA 2.0, OSM)',
    uretim: 'scripts/harita-uret.js',
    tarih: new Date().toISOString().slice(0, 10),
  },
  iller,
};
fs.writeFileSync(OUT_JSON, JSON.stringify(haritaJson));
const boyutKB = Math.round(fs.statSync(OUT_JSON).size / 1024);
console.log(
  'harita.json yazıldı: ' +
    boyutKB +
    ' KB, ' +
    GENISLIK +
    'x' +
    YUKSEKLIK +
    ', toplam ' +
    toplamNokta +
    ' nokta.'
);

// =================== 8. ÖNİZLEME SAYFALARINI ÜRET ===================
require('./onizleme-uret').uret();
