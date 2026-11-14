// PARÇA ÜRETİM BETİĞİ — 195 parça geometrisi + komşuluk grafiği
//
// Ne yapar:
//   1. İlçe (ADM2) sınırlarını okur, her ilçeyi konumundan iline bağlar.
//   2. Parça tablosundaki ilçe adlarını gerçek ilçelerle eşleştirir (+ elle 5 atama).
//   3. İlçeleri parçalara göre BİRLEŞTİRİR (topolojik → parça sınırı çıkar).
//   4. Parça komşuluğunu hesaplar (ortak sınır) + 3 deniz geçişini ekler.
//   5. İl komşuluk grafiğiyle DOĞRULAR (komşu parçalar ya aynı il ya da illeri komşu).
//   6. Konik projeksiyon + sadeleştirme + polylabel ile çizim yolları üretir.
//   7. veri/parcalar.json + veri/parca-komsuluk.json yazar.
//
// Çalıştırma:  node scripts/parca-uret.js

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const topoServer = require('topojson-server');
const topoClient = require('topojson-client');
const topoSimplify = require('topojson-simplify');
const polylabel = require('polylabel').default || require('polylabel');
const kanonik = require('./iller-kanonik');
const { lcc, aciklama: projAciklama } = require('./projeksiyon');
const { ilRenkleri } = require('./renkler');
const IL_RENK = ilRenkleri();

const PROJ = path.join(__dirname, '..');
const ADM1 = path.join(PROJ, 'veri/ham/geoBoundaries-TUR-ADM1.geojson');
const ADM2 = path.join(PROJ, 'veri/ham/geoBoundaries-TUR-ADM2.geojson');
const TABLO = path.join(PROJ, 'veri/ham/parca-tablo.json');

// ---- parametreler ----
const MIN_ADA_KM2 = 6;
const QUANT = 1e5; // ilçe topolojisi quantization (komşuluk için ince)
const SADELIK = 0.2; // parça çizim sadeleştirme (düşük = daha sade)
const GENISLIK = 1000,
  PAD = 12;

// ELLE ATAMALAR ARTIK GEREKSİZ (2026-07-26 yeniden bölümlemesi).
// Eskiden tablo bazı ilçeleri (Sarıyer, Bakırköy, Adalar, Karayazı, Gürün) hiç saymıyordu
// ve Gölbaşı elle taşınıyordu. Yeni bölümleme 973 ilçenin TAMAMINI kümeleyerek üretildi,
// yani tabloda eksik ilçe yok. Eski listeler burada kalsaydı olmayan parça numaralarına
// atama yapıp hayalet parça yaratırlardı (Adalar → 34-3, Gölbaşı → 06-5 gibi).
const ELLE = {};
const ELLE_TASI = {};

// Deniz geçişleri: aynı il içinde kara bağı olmayan parça çiftleri.
// 2026-07-26 yeniden bölümlemesiyle kimlikler değişti:
//   • İstanbul: Avrupa 34-1, Anadolu 34-2 (boğaz)
//   • Çanakkale: Gelibolu 17-1, karşı yaka 17-2 / 17-3
//   • Kocaeli: artık gerekmiyor — Gebze (41-1) ile İzmit (41-2) kara komşusu,
//     körfezin güney yakası İzmit parçasının içinde kaldı.
const DENIZ_GECISLERI = [
  ['34-1', '34-2'], // İstanbul Boğazı
  ['17-1', '17-2'],
  ['17-1', '17-3'], // Çanakkale Boğazı
];
// ELLE EKLENEN KISA KARA SINIRLARI (Görev 03B / Adım 0, 2026-07-26).
// Topolojiden çıkan komşuluk çok kısa sınırları kaçırabiliyor (ortak kenar sadeleştirmede
// eriyor). Aşağıdakiler HAM VERİDEN doğrulanmış gerçek kara sınırlarıdır:
//   34-1 ~ 39-2 : Çatalca (İstanbul) – Vize (Kırklareli). Ham ilçe verisinde temas EVET.
// Yoksa oyunda İstanbul'dan Kırklareli'ye ordu geçemez — gözle fark edilmeyen bir hatadır.
// Liste `parca-ayarlar.js`'te; iki betik de oradan okur.
const { EK_KARA_SINIRI } = require('./parca-ayarlar');

// Elle verilen kararlar `parca-ayarlar.js`'te tutulur (yeniden bölümleme betiği de
// oradan okur). 2026-07-26 yeniden bölümlemesinden sonra BIRLESTIR/AD_DEGISTIR boş:
// bölümlemenin tamamı `veri/ham/parca-tablo.json`'ın kendisinde.
const { BIRLESTIR, AD_DEGISTIR, ARAZI_ZORLA } = require('./parca-ayarlar');

const KOPUK_ISTISNA = new Set(['06']); // Ankara — Güney Bozkır bilerek tek parça

function norm(s) {
  return String(s)
    .toLocaleLowerCase('tr-TR')
    .replace(/[çc]/g, 'c')
    .replace(/[ğg]/g, 'g')
    .replace(/[ıi̇i]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[şs]/g, 's')
    .replace(/[üu]/g, 'u')
    .replace(/[âa]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[û]/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}
const ALIAS = { gokceada: 'imbros' };

console.log('== 1. Veri okunuyor ==');
const adm1 = JSON.parse(fs.readFileSync(ADM1, 'utf8'));
const adm2 = JSON.parse(fs.readFileSync(ADM2, 'utf8'));
const tablo = JSON.parse(fs.readFileSync(TABLO, 'utf8'));

// il poligonları + kod + bbox
const iller = adm1.features.map((f) => {
  const kod = String(parseInt((f.properties.shapeISO || '').replace('TR-', ''), 10)).padStart(
    2,
    '0'
  );
  return { kod, feat: f, bbox: turf.bbox(f) };
});

console.log('== 2. İlçeler illere bağlanıyor (konum) ==');
adm2.features.forEach((d) => {
  let pt;
  try {
    pt = turf.pointOnFeature(d);
  } catch (e) {
    pt = turf.centroid(d);
  }
  const [x, y] = pt.geometry.coordinates;
  let bulunan = null;
  for (const il of iller) {
    const b = il.bbox;
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    if (turf.booleanPointInPolygon(pt, il.feat)) {
      bulunan = il.kod;
      break;
    }
  }
  d.properties._kod = bulunan;
  d.properties._n = norm(d.properties.shapeName);
  d.properties._merkez = /merkez/.test(d.properties._n);
});

console.log('== 3. İlçeler parçalara eşleştiriliyor ==');
const ilAdm2 = {};
adm2.features.forEach((d) => {
  if (d.properties._kod) (ilAdm2[d.properties._kod] = ilAdm2[d.properties._kod] || []).push(d);
});
const ilParca = {};
tablo.forEach((p) => {
  (ilParca[p.kod] = ilParca[p.kod] || []).push(p);
});

let eslesmeyen = [];
adm2.features.forEach((d) => (d.properties._parca = null));
Object.keys(ilParca).forEach((kod) => {
  const dList = ilAdm2[kod] || [];
  const nIndex = {};
  dList.forEach((d) => {
    (nIndex[d.properties._n] = nIndex[d.properties._n] || []).push(d);
  });
  const merkezler = dList.filter((d) => d.properties._merkez);
  const nIlAd = norm(kanonik[kod].ad);
  ilParca[kod].forEach((p) => {
    if (p.ilceler.some((i) => /tüm il[çc]e/i.test(i))) {
      dList.forEach((d) => (d.properties._parca = p.parcaNo));
      return;
    }
    p.ilceler.forEach((ad) => {
      const n = ALIAS[norm(ad)] || norm(ad);
      let hedef = null;
      if (n === 'merkez') {
        hedef =
          merkezler[0] ||
          dList.find((d) => d.properties._n === nIlAd) ||
          dList.find((d) => d.properties._n === nIlAd + 'district') ||
          dList.find((d) => d.properties._n.startsWith(nIlAd));
      } else if (nIndex[n]) hedef = nIndex[n][0];
      else hedef = dList.find((d) => d.properties._n === n + 'merkez'); // ör. tablo "Gediz" -> ADM2 "Gediz Merkez"
      if (hedef) hedef.properties._parca = p.parcaNo;
      else eslesmeyen.push(kod + ' ' + kanonik[kod].ad + ' : ' + ad);
    });
  });
});
// elle atamalar (5 unutulan ilçe + Baki'nin taşımaları)
[ELLE, ELLE_TASI].forEach((tablo) =>
  Object.entries(tablo).forEach(([anahtar, no]) => {
    const [kod, nad] = anahtar.split('|');
    const d = (ilAdm2[kod] || []).find((x) => x.properties._n === nad);
    if (d) d.properties._parca = no;
    else console.log('  ELLE ATAMA BULUNAMADI:', anahtar);
  })
);

const atanmayan = adm2.features.filter((d) => d.properties._kod && d.properties._parca == null);
console.log(
  '  Eşleşmeyen tablo adı:',
  eslesmeyen.length,
  eslesmeyen.length ? eslesmeyen.join('; ') : ''
);
console.log(
  '  Parçaya atanmayan ilçe:',
  atanmayan.length,
  atanmayan.length
    ? atanmayan.map((d) => d.properties._kod + ':' + d.properties.shapeName).join(', ')
    : '(hepsi atandı)'
);

// her ilçeye partId ver
adm2.features.forEach((d) => {
  d.properties._pid =
    d.properties._kod && d.properties._parca != null
      ? d.properties._kod + '-' + d.properties._parca
      : null;
});

console.log('== 4. İlçe topolojisi + kopuk parça temizliği + komşuluk ==');
const atanmisFeats = adm2.features.filter((d) => d.properties._pid);
const topo2 = topoServer.topology(
  {
    ilce: {
      type: 'FeatureCollection',
      features: atanmisFeats.map((f) => ({
        type: 'Feature',
        properties: { pid: f.properties._pid },
        geometry: f.geometry,
      })),
    },
  },
  QUANT
);
const geoms = topo2.objects.ilce.geometries;
const komsu = topoClient.neighbors(geoms);

// (a) Baki'nin istediği tam birleştirmeler (Rize gibi)
geoms.forEach((g) => {
  if (BIRLESTIR[g.properties.pid]) g.properties.pid = BIRLESTIR[g.properties.pid];
});

// (b) KOPUK PARÇA TEMİZLİĞİ: bir parçanın kara olarak kopuk (başka parçanın içinde
// kalan) bölümlerini, en çok sınır paylaştığı komşu parçaya (aynı il) devret.
// Deniz adaları (kara komşusu olmayan) dokunulmaz.
function kopukTemizle() {
  let toplamDevir = 0;
  for (let tur = 0; tur < 12; tur++) {
    const pIdx = {};
    geoms.forEach((g, i) => {
      (pIdx[g.properties.pid] = pIdx[g.properties.pid] || []).push(i);
    });
    let degisti = false;
    for (const pid of Object.keys(pIdx)) {
      if (KOPUK_ISTISNA.has(pid.split('-')[0])) continue; // muaf iller dokunulmaz
      const idxs = pIdx[pid],
        kume = new Set(idxs),
        gorulen = new Set(),
        bilesenler = [];
      for (const s of idxs) {
        if (gorulen.has(s)) continue;
        const b = [],
          yigin = [s];
        gorulen.add(s);
        while (yigin.length) {
          const c = yigin.pop();
          b.push(c);
          komsu[c].forEach((n) => {
            if (kume.has(n) && !gorulen.has(n)) {
              gorulen.add(n);
              yigin.push(n);
            }
          });
        }
        bilesenler.push(b);
      }
      if (bilesenler.length <= 1) continue;
      bilesenler.sort((a, b) => b.length - a.length); // en büyük kalır
      for (let ci = 1; ci < bilesenler.length; ci++) {
        const b = bilesenler[ci],
          kod = pid.split('-')[0],
          sayac = {};
        b.forEach((c) =>
          komsu[c].forEach((n) => {
            const np = geoms[n].properties.pid;
            if (np && np !== pid && np.split('-')[0] === kod) sayac[np] = (sayac[np] || 0) + 1;
          })
        );
        const aday = Object.entries(sayac).sort((x, y) => y[1] - x[1])[0];
        if (aday) {
          b.forEach((c) => (geoms[c].properties.pid = aday[0]));
          degisti = true;
          toplamDevir += b.length;
        }
        // aday yoksa: kara komşusu olmayan ada -> bırak
      }
    }
    if (!degisti) break;
  }
  return toplamDevir;
}
const oncePid = geoms.map((g) => g.properties.pid);
const devir = kopukTemizle();
console.log('  Kopuk bölüm temizliği: ' + devir + ' ilçe uygun komşu parçaya devredildi.');
// DEBUG: hangi ilçeler hangi ilde taşındı
const degisimIl = {};
geoms.forEach((g, i) => {
  if (oncePid[i] !== g.properties.pid) {
    const kod = atanmisFeats[i].properties._kod;
    (degisimIl[kod] = degisimIl[kod] || []).push(
      atanmisFeats[i].properties.shapeName + ' ' + oncePid[i] + '→' + g.properties.pid
    );
  }
});
Object.keys(degisimIl)
  .sort()
  .forEach((k) => console.log('    ' + k + ' ' + kanonik[k].ad + ': ' + degisimIl[k].join(', ')));

// parça -> ilçe index listesi (düzeltilmiş pid'lerle)
const parcaGeomIdx = {};
geoms.forEach((g, i) => {
  const pid = g.properties.pid;
  (parcaGeomIdx[pid] = parcaGeomIdx[pid] || []).push(i);
});
const pidListesi = Object.keys(parcaGeomIdx);
console.log('  Parça sayısı:', pidListesi.length);

// İlçe -> parça eşlemesini dosyaya yaz. Buradaki hâl, tüm düzeltmelerden (birleştirme,
// elle atama, kopuk parça temizliği) SONRAKİ gerçek durumdur. Yeniden bölümleme betiği
// (parca-yeniden-bol.js) başlangıç noktası olarak bunu okur — tabloyu değil.
fs.writeFileSync(
  path.join(PROJ, 'veri/ham/ilce-parca.json'),
  JSON.stringify(
    // geoms ile atanmisFeats aynı sırada; ilçe adı yalnızca ikincisinde var.
    geoms
      .map((g, i) => ({
        kod: g.properties.pid ? g.properties.pid.split('-')[0] : null,
        ilce: atanmisFeats[i].properties.shapeName,
        pid: g.properties.pid,
      }))
      .filter((x) => x.pid),
    null,
    0
  ),
  'utf8'
);
console.log('  veri/ham/ilce-parca.json yazıldı (ilçe -> parça, gerçek durum)');

// ilçe komşuluğu -> parça komşuluğu
const parcaKomsu = {};
pidListesi.forEach((p) => (parcaKomsu[p] = new Set()));
geoms.forEach((g, i) => {
  const pi = g.properties.pid;
  komsu[i].forEach((j) => {
    const pj = geoms[j].properties.pid;
    if (pj && pj !== pi) parcaKomsu[pi].add(pj);
  });
});

// deniz geçişleri
DENIZ_GECISLERI.forEach(([a, b]) => {
  if (parcaKomsu[a] && parcaKomsu[b]) {
    parcaKomsu[a].add(b);
    parcaKomsu[b].add(a);
  } else console.log('  DENİZ GEÇİŞİ pid bulunamadı:', a, b);
});

// elle eklenen kısa kara sınırları (Görev 03B / Adım 0)
EK_KARA_SINIRI.forEach(([a, b]) => {
  if (parcaKomsu[a] && parcaKomsu[b]) {
    parcaKomsu[a].add(b);
    parcaKomsu[b].add(a);
  } else console.log('  EK KARA SINIRI pid bulunamadı:', a, b);
});

console.log('== 5. İl komşuluk grafiğiyle doğrulama ==');
const topoIl = topoServer.topology({ il: adm1 }, QUANT);
const ilGeoms = topoIl.objects.il.geometries;
ilGeoms.forEach(
  (g) =>
    (g.properties.kod = String(
      parseInt((g.properties.shapeISO || '').replace('TR-', ''), 10)
    ).padStart(2, '0'))
);
const ilKomsuArr = topoClient.neighbors(ilGeoms);
const ilKomsu = {};
ilGeoms.forEach((g, i) => {
  ilKomsu[g.properties.kod] = new Set(ilKomsuArr[i].map((j) => ilGeoms[j].properties.kod));
});

// Elle eklenen kısa sınırlar bu kontrolden muaf: il grafiği de aynı sebeple (çok kısa
// ortak kenar) o sınırı kaçırıyor. Zaten ham veriden doğrulandıkları için ekleniyorlar.
const ekSinirKume = new Set(EK_KARA_SINIRI.flatMap(([a, b]) => [a + '~' + b, b + '~' + a]));
let ihlal = [];
Object.entries(parcaKomsu).forEach(([a, set]) => {
  const ka = a.split('-')[0];
  set.forEach((b) => {
    const kb = b.split('-')[0];
    if (ka !== kb && !ilKomsu[ka].has(kb) && !ekSinirKume.has(a + '~' + b))
      ihlal.push(a + ' ~ ' + b + ' ama ' + ka + ' ile ' + kb + ' il komşusu değil');
  });
});
console.log('  İl grafiğine aykırı parça komşuluğu:', ihlal.length);
ihlal.slice(0, 30).forEach((x) => console.log('    ! ' + x));
console.log(
  '  Elle eklenen kısa kara sınırı: ' +
    EK_KARA_SINIRI.map((e) => e.join(' ~ ')).join(', ') +
    ' (ham veriden doğrulandı)'
);

// toplam çift
let ciftSet = new Set();
Object.entries(parcaKomsu).forEach(([a, set]) =>
  set.forEach((b) => ciftSet.add([a, b].sort().join('~')))
);
console.log('  Toplam parça komşuluk çifti:', ciftSet.size);
const komsusuz = pidListesi.filter((p) => parcaKomsu[p].size === 0);
console.log('  Komşusuz parça:', komsusuz.length, komsusuz.join(', '));

console.log('== 6. Sadeleştir (ilçe düzeyinde) + parça birleştir ==');
// ÖNEMLİ: sadeleştirmeyi İLÇE topolojisinde yap, sonra birleştir. Birleşmiş
// parçalardan ikinci topoloji kurup sadeleştirmek İstanbul gibi karmaşık
// geometrileri bozuyordu; bu yol ortak sınırları tutarlı tutar.
let stopo = topoSimplify.presimplify(topo2, topoSimplify.sphericalTriangleArea);
stopo = topoSimplify.simplify(stopo, topoSimplify.quantile(stopo, SADELIK));
const sgeoms = stopo.objects.ilce.geometries;
let sadeFeats = pidListesi.map((pid) => ({
  type: 'Feature',
  properties: { pid },
  geometry: topoClient.merge(
    stopo,
    parcaGeomIdx[pid].map((i) => sgeoms[i])
  ),
}));

// küçük ada temizliği (birleşmiş parçalarda)
// NOT: topojson merge halkaları KAPALI değil (ilk≠son nokta); turf.polygon bunu
// reddediyordu → ana gövde 0 alan sanılıp eleniyordu. Halkayı kapatarak hesapla.
function alanKm2(ring) {
  const a = ring[0],
    z = ring[ring.length - 1];
  const r = a[0] === z[0] && a[1] === z[1] ? ring : ring.concat([a]);
  try {
    return turf.area({ type: 'Polygon', coordinates: [r] }) / 1e6;
  } catch (e) {
    return 0;
  }
}
let atilanAda = 0;
sadeFeats.forEach((f) => {
  if (f.geometry.type !== 'MultiPolygon') return;
  const al = f.geometry.coordinates.map((poly) => ({ poly, a: alanKm2(poly[0]) }));
  al.sort((x, y) => y.a - x.a);
  const tut = al.filter((p, i) => i === 0 || p.a >= MIN_ADA_KM2);
  atilanAda += al.length - tut.length;
  f.geometry.coordinates = tut.map((p) => p.poly);
  if (f.geometry.coordinates.length === 1)
    f.geometry = { type: 'Polygon', coordinates: f.geometry.coordinates[0] };
});
console.log('  Atılan küçük kayalık:', atilanAda);

// İL SINIRLARI (haritada iller-arası beyaz çizgi için): parçaları ile göre birleştir
const ilGeomIdx = {};
geoms.forEach((g, i) => {
  const kod = g.properties.pid.split('-')[0];
  (ilGeomIdx[kod] = ilGeomIdx[kod] || []).push(i);
});
let ilFeats = Object.keys(ilGeomIdx)
  .sort()
  .map((kod) => ({
    type: 'Feature',
    properties: { kod },
    geometry: topoClient.merge(
      stopo,
      ilGeomIdx[kod].map((i) => sgeoms[i])
    ),
  }));
ilFeats.forEach((f) => {
  if (f.geometry.type !== 'MultiPolygon') return;
  const al = f.geometry.coordinates.map((poly) => ({ poly, a: alanKm2(poly[0]) }));
  al.sort((x, y) => y.a - x.a);
  const tut = al.filter((p, i) => i === 0 || p.a >= MIN_ADA_KM2);
  f.geometry.coordinates = tut.map((p) => p.poly);
  if (f.geometry.coordinates.length === 1)
    f.geometry = { type: 'Polygon', coordinates: f.geometry.coordinates[0] };
});

// projeksiyon + bbox
let minX = Infinity,
  maxX = -Infinity,
  minY = Infinity,
  maxY = -Infinity;
function projeCoords(coords) {
  if (typeof coords[0] === 'number') {
    const [x, y] = lcc(coords[0], coords[1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    return [x, y];
  }
  return coords.map(projeCoords);
}
const projeli = sadeFeats.map((f) => ({
  pid: f.properties.pid,
  geom: { type: f.geometry.type, coordinates: projeCoords(f.geometry.coordinates) },
}));
const projeliIl = ilFeats.map((f) => ({
  kod: f.properties.kod,
  geom: { type: f.geometry.type, coordinates: projeCoords(f.geometry.coordinates) },
}));

const scale = (GENISLIK - 2 * PAD) / (maxX - minX);
const YUKSEKLIK = Math.round((maxY - minY) * scale + 2 * PAD);
function ekranaCoords(coords) {
  if (typeof coords[0] === 'number')
    return [
      +(PAD + (coords[0] - minX) * scale).toFixed(1),
      +(PAD + (maxY - coords[1]) * scale).toFixed(1),
    ];
  return coords.map(ekranaCoords);
}
function halkaAlan(r) {
  let a = 0;
  for (let i = 0, n = r.length, j = n - 1; i < n; j = i++)
    a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return a / 2;
}

// parça bilgisi (pay); BIRLESTIR uygulanmış (birleşen parçanın payı hedefe eklenir)
const pay = {};
tablo.forEach((p) => {
  pay[p.kod + '-' + p.parcaNo] = {
    parcaNo: p.parcaNo,
    parcaAd: p.parcaAd,
    arazi: p.arazi,
    nufus: p.nufus,
    ekonomi: p.ekonomi,
  };
});
Object.entries(BIRLESTIR).forEach(([src, dst]) => {
  if (pay[src] && pay[dst]) {
    // 2 haneye yuvarla: 0.18+0.47 kayan nokta yüzünden 0.6499999… çıkıyor,
    // il payları toplamının TAM 1.00 kalması gerekiyor.
    pay[dst].nufus = +(pay[dst].nufus + pay[src].nufus).toFixed(2);
    pay[dst].ekonomi = +(pay[dst].ekonomi + pay[src].ekonomi).toFixed(2);
    delete pay[src];
  }
});
// ad değiştirme (gerekçeler AD_DEGISTIR tanımının başında)
Object.entries(AD_DEGISTIR).forEach(([pid, ad]) => {
  if (pay[pid]) {
    console.log('  AD DEĞİŞTİ: ' + pid + ' "' + pay[pid].parcaAd + '" -> "' + ad + '"');
    pay[pid].parcaAd = ad;
  } else console.log('  AD DEĞİŞTİ: pid bulunamadı: ' + pid);
});
// arazi elle geçersiz kılma (gerekçeler ARAZI_ZORLA tanımının başında)
Object.entries(ARAZI_ZORLA).forEach(([pid, arazi]) => {
  if (pay[pid]) {
    console.log('  ARAZİ ELLE: ' + pid + ' ' + pay[pid].arazi + ' -> ' + arazi);
    pay[pid].arazi = arazi;
  } else console.log('  ARAZİ ELLE: pid bulunamadı: ' + pid);
});
const tabloIndex = pay;

const parcalarOut = {};
let toplamNokta = 0;
projeli.forEach((pf) => {
  const g = { type: pf.geom.type, coordinates: ekranaCoords(pf.geom.coordinates) };
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let yol = '';
  polys.forEach((poly) =>
    poly.forEach((ring) => {
      toplamNokta += ring.length;
      yol += 'M' + ring.map((p) => p.join(',')).join('L') + 'Z';
    })
  );
  // etiket: en büyük poligon polylabel
  let enB = polys[0],
    enBA = -1;
  polys.forEach((poly) => {
    const a = Math.abs(halkaAlan(poly[0]));
    if (a > enBA) {
      enBA = a;
      enB = poly;
    }
  });
  const [ex, ey] = polylabel(enB, 1.0);
  const t = tabloIndex[pf.pid];
  const kod = pf.pid.split('-')[0];
  parcalarOut[pf.pid] = {
    kod,
    il: kanonik[kod].ad,
    bolge: kanonik[kod].bolge,
    no: t ? t.parcaNo : null,
    ad: t ? t.parcaAd : pf.pid,
    arazi: t ? t.arazi : null,
    nufus: t ? t.nufus : null,
    ekonomi: t ? t.ekonomi : null,
    renkIl: IL_RENK[kod],
    yol,
    etiket: { x: +ex.toFixed(1), y: +ey.toFixed(1) },
  };
});

// İL sınır yolları (beyaz sınır katmanı)
const illerOut = {};
projeliIl.forEach((pf) => {
  const g = { type: pf.geom.type, coordinates: ekranaCoords(pf.geom.coordinates) };
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let yol = '';
  polys.forEach((poly) =>
    poly.forEach((ring) => {
      yol += 'M' + ring.map((p) => p.join(',')).join('L') + 'Z';
    })
  );
  illerOut[pf.kod] = { ad: kanonik[pf.kod].ad, bolge: kanonik[pf.kod].bolge, yol };
});

console.log('== 7. Dosyalar yazılıyor ==');
const parcalarJson = {
  meta: {
    genislik: GENISLIK,
    yukseklik: YUKSEKLIK,
    projeksiyon: projAciklama,
    kaynak: 'geoBoundaries TUR ADM1+ADM2 (OSM); parça tablosu il-savasi-parca-bolumleme-v2.md',
    uretim: 'scripts/parca-uret.js',
    tarih: new Date().toISOString().slice(0, 10),
    parcaSayisi: pidListesi.length,
  },
  parcalar: parcalarOut,
  iller: illerOut,
};
fs.writeFileSync(path.join(PROJ, 'veri/parcalar.json'), JSON.stringify(parcalarJson));
const komsuOut = {};
Object.keys(parcaKomsu)
  .sort()
  .forEach((p) => (komsuOut[p] = [...parcaKomsu[p]].sort()));
fs.writeFileSync(path.join(PROJ, 'veri/parca-komsuluk.json'), JSON.stringify(komsuOut, null, 0));

const kb = Math.round(fs.statSync(path.join(PROJ, 'veri/parcalar.json')).size / 1024);
console.log(
  '  veri/parcalar.json: ' +
    kb +
    ' KB, ' +
    GENISLIK +
    'x' +
    YUKSEKLIK +
    ', ' +
    toplamNokta +
    ' nokta'
);
console.log('  veri/parca-komsuluk.json yazıldı (' + ciftSet.size + ' çift)');
console.log('BİTTİ.');
