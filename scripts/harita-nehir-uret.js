// NEHİRLER VE GÖLLER (Görev 21 · H8 — Baki, 2026-09-24: "indir").
//
// Çalıştırma:  node scripts/harita-nehir-uret.js <Natural Earth klasörü>
// Girdi:       ne_10m_rivers_lake_centerlines.{shp,dbf} ve ne_10m_lakes.{shp,dbf} — Natural
//              Earth 10m fiziksel veri (kamu malı, https://www.naturalearthdata.com). Zip'ler
//              depoya GİRMEZ; indirip açtığın klasörü argüman olarak ver.
// Çıktı:       veri/harita-nehirler.json
//
// NE YAPIYOR
//   1. HARİTANIN YERLEŞİMİNİ GERİ BULUR. Parçalar (`scripts/parca-uret.js`) enlem/boylamı
//      Lambert konik izdüşümüyle (`projeksiyon.js`) düzleme alıp sadeleşmiş geometrinin sınır
//      kutusuna göre 1000 birime sığdırıyor; o ölçek ve kayma bir yere yazılmamış. Burada
//      81 ilin ham sınır kutusu (veri/ham, aynı izdüşüm) ile oyundaki parçalarının sınır
//      kutusu eşleştirilip en küçük kareler yöntemiyle ölçek + kayma çözülüyor (324 denklem,
//      3 bilinmeyen). Artık hata raporlanır — birim altında olmalı.
//   2. SHAPEFILE OKUR (ek paket yok: .shp çoklu çizgi/çokgen + .dbf öznitelik).
//   3. Türkiye'nin kutusundaki nehirleri KARAYA kırpar (parçaların içinde kalan kısımlar),
//      gölleri (içi ülkede olanlar) alır, ikisini de sadeleştirir.

const fs = require('fs');
const path = require('path');
const { lcc } = require('./projeksiyon');
const { dokunmaGeometrisi, parcaBul } = require('../src/haritaDonusum.js');

const KOK = path.join(__dirname, '..');
const KAYNAK = process.argv[2];
if (!KAYNAK) {
  console.error('Kullanım: node scripts/harita-nehir-uret.js <Natural Earth klasörü>');
  process.exit(1);
}
const CIKTI = path.join(KOK, 'veri', 'harita-nehirler.json');
const PARCALAR = require('../veri/parcalar.json').parcalar;
const ADM1 = JSON.parse(
  fs.readFileSync(path.join(KOK, 'veri/ham/geoBoundaries-TUR-ADM1.geojson'), 'utf8')
);

// ---- AYARLAR ----
const KUTU = { lon0: 25.3, lon1: 45, lat0: 35.6, lat1: 42.3 }; // Türkiye'nin kabaca kutusu
const SADELIK = 0.35; // Douglas–Peucker toleransı (harita birimi)
const EN_KUCUK_GOL = 2.5; // bundan küçük göl (birim²) atlanır — haritada bir leke
const EN_KISA_NEHIR = 6; // karada bundan kısa kalan nehir parçası atlanır (birim)

// ======================================================================================
// 1) YERLEŞİM: ham il sınır kutuları ↔ oyundaki il sınır kutuları
// ======================================================================================
function kutuBul(noktalar, k) {
  for (const [x, y] of noktalar) {
    if (x < k.x0) k.x0 = x;
    if (x > k.x1) k.x1 = x;
    if (y < k.y0) k.y0 = y;
    if (y > k.y1) k.y1 = y;
  }
  return k;
}
const yeniKutu = () => ({ x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });
function halkalar(geom) {
  if (geom.type === 'Polygon') return geom.coordinates;
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat();
  return [];
}
// Ham: izdüşümlü (y yukarı).
const hamKutu = {};
for (const f of ADM1.features) {
  const m = /^TR-?(\d{1,2})$/.exec(f.properties.shapeISO || '');
  if (!m) continue;
  const kod = String(parseInt(m[1], 10)).padStart(2, '0');
  const k = yeniKutu();
  for (const h of halkalar(f.geometry))
    kutuBul(
      h.map(([lon, lat]) => lcc(lon, lat)),
      k
    );
  hamKutu[kod] = k;
}
// Oyun: parça yollarından (y aşağı).
function yolNoktalari(yol) {
  const n = [];
  for (const p of yol.replace(/[MZ]/g, ' ').split(/[ L]+/)) {
    if (!p) continue;
    const [x, y] = p.split(',').map(Number);
    if (Number.isFinite(x) && Number.isFinite(y)) n.push([x, y]);
  }
  return n;
}
const oyunKutu = {};
for (const pid of Object.keys(PARCALAR)) {
  const kod = PARCALAR[pid].kod;
  kutuBul(yolNoktalari(PARCALAR[pid].yol), (oyunKutu[kod] = oyunKutu[kod] || yeniKutu()));
}
// x_oyun = a·x + b ; y_oyun = −a·y + c  → en küçük kareler (normal denklemler, 3×3).
const denklem = []; // [katsayı a, katsayı b, katsayı c, sağ taraf]
for (const kod of Object.keys(oyunKutu)) {
  const h = hamKutu[kod],
    o = oyunKutu[kod];
  if (!h) continue;
  denklem.push([h.x0, 1, 0, o.x0], [h.x1, 1, 0, o.x1]);
  denklem.push([-h.y1, 0, 1, o.y0], [-h.y0, 0, 1, o.y1]);
}
function coz(satirlar) {
  const A = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const B = [0, 0, 0];
  for (const [p, q, r, s] of satirlar) {
    const v = [p, q, r];
    for (let i = 0; i < 3; i++) {
      B[i] += v[i] * s;
      for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j];
    }
  }
  // Gauss eleme.
  for (let i = 0; i < 3; i++) {
    let enb = i;
    for (let k = i + 1; k < 3; k++) if (Math.abs(A[k][i]) > Math.abs(A[enb][i])) enb = k;
    [A[i], A[enb]] = [A[enb], A[i]];
    [B[i], B[enb]] = [B[enb], B[i]];
    for (let k = i + 1; k < 3; k++) {
      const c = A[k][i] / A[i][i];
      for (let j = i; j < 3; j++) A[k][j] -= c * A[i][j];
      B[k] -= c * B[i];
    }
  }
  const x = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let t = B[i];
    for (let j = i + 1; j < 3; j++) t -= A[i][j] * x[j];
    x[i] = t / A[i][i];
  }
  return x;
}
const [OLCEK, KAY_X, KAY_Y] = coz(denklem);
const artiklar = denklem.map(([p, q, r, s]) => Math.abs(p * OLCEK + q * KAY_X + r * KAY_Y - s));
artiklar.sort((a, b) => a - b);
const ortanca = artiklar[Math.floor(artiklar.length / 2)];
const enKotu = artiklar[artiklar.length - 1];
const haritaya = (lon, lat) => {
  const [x, y] = lcc(lon, lat);
  return [OLCEK * x + KAY_X, -OLCEK * y + KAY_Y];
};

// ======================================================================================
// 2) SHAPEFILE (yalnızca gereken kadarı)
// ======================================================================================
function shpOku(dosya) {
  const b = fs.readFileSync(dosya);
  const sekiller = [];
  let o = 100;
  while (o < b.length) {
    const uzunluk = b.readInt32BE(o + 4) * 2;
    const tip = b.readInt32LE(o + 8);
    const s = o + 8;
    if (tip === 3 || tip === 5) {
      const parcaSayisi = b.readInt32LE(s + 36);
      const noktaSayisi = b.readInt32LE(s + 40);
      const parcaBas = [];
      for (let i = 0; i < parcaSayisi; i++) parcaBas.push(b.readInt32LE(s + 44 + 4 * i));
      const nb = s + 44 + 4 * parcaSayisi;
      const parcalar = parcaBas.map((bas, i) => {
        const son = i + 1 < parcaSayisi ? parcaBas[i + 1] : noktaSayisi;
        const n = [];
        for (let k = bas; k < son; k++)
          n.push([b.readDoubleLE(nb + 16 * k), b.readDoubleLE(nb + 16 * k + 8)]);
        return n;
      });
      sekiller.push(parcalar);
    } else sekiller.push([]);
    o += 8 + uzunluk;
  }
  return sekiller;
}
function dbfOku(dosya) {
  const b = fs.readFileSync(dosya);
  const kayitSayisi = b.readInt32LE(4);
  const basBoy = b.readInt16LE(8);
  const kayitBoy = b.readInt16LE(10);
  const alanlar = [];
  for (let o = 32; b[o] !== 0x0d; o += 32) {
    alanlar.push({
      ad: b.toString('latin1', o, o + 11).replace(/\0.*$/, ''),
      boy: b[o + 16],
    });
  }
  const kayitlar = [];
  for (let i = 0; i < kayitSayisi; i++) {
    let o = basBoy + i * kayitBoy + 1;
    const k = {};
    for (const a of alanlar) {
      k[a.ad] = b
        .toString('utf8', o, o + a.boy)
        .replace(/\0/g, '')
        .trim();
      o += a.boy;
    }
    kayitlar.push(k);
  }
  return kayitlar;
}

// ======================================================================================
// 3) SÜZ, KIRP, SADELEŞTİR
// ======================================================================================
const geom = dokunmaGeometrisi(PARCALAR);
const karada = (x, y) => parcaBul(geom, x, y) !== null;
// ÜLKENİN İÇİ (göl testi için): Görev 21'den beri göller parçalardan OYULMUŞ
// (`parca-gol-oy.js`), yani göl noktaları artık hiçbir parçanın içinde değil. "Bu göl
// Türkiye'nin mi" sorusu bu yüzden parçalara değil, ülkenin dış hattına soruluyor.
const ulke = dokunmaGeometrisi({ tr: { yol: require('../veri/turkiye-hat.json').yol } });
const ulkede = (x, y) => parcaBul(ulke, x, y) !== null;
const kutuda = (n) =>
  n.some(([lon, lat]) => lon > KUTU.lon0 && lon < KUTU.lon1 && lat > KUTU.lat0 && lat < KUTU.lat1);

function dp(noktalar, tol) {
  if (noktalar.length < 3) return noktalar;
  const tut = new Uint8Array(noktalar.length);
  tut[0] = tut[noktalar.length - 1] = 1;
  const yigin = [[0, noktalar.length - 1]];
  while (yigin.length) {
    const [a, b] = yigin.pop();
    const [ax, ay] = noktalar[a],
      [bx, by] = noktalar[b];
    const dx = bx - ax,
      dy = by - ay;
    const l = Math.hypot(dx, dy);
    let enUzak = -1,
      i = -1;
    for (let k = a + 1; k < b; k++) {
      // Kapalı halkada (göl) iki uç AYNI nokta: doğruya uzaklık yerine o noktaya uzaklık —
      // yoksa bütün uzaklıklar sıfır çıkıyor ve göl iki noktaya iniyordu.
      const d =
        l < 1e-9
          ? Math.hypot(noktalar[k][0] - ax, noktalar[k][1] - ay)
          : Math.abs((noktalar[k][0] - ax) * dy - (noktalar[k][1] - ay) * dx) / l;
      if (d > enUzak) {
        enUzak = d;
        i = k;
      }
    }
    if (enUzak > tol) {
      tut[i] = 1;
      yigin.push([a, i], [i, b]);
    }
  }
  return noktalar.filter((_, k) => tut[k]);
}
const uzunluk = (n) =>
  n.reduce((t, p, i) => (i ? t + Math.hypot(p[0] - n[i - 1][0], p[1] - n[i - 1][1]) : 0), 0);
const alan = (n) => {
  let a = 0;
  for (let i = 0; i < n.length; i++) {
    const [x1, y1] = n[i],
      [x2, y2] = n[(i + 1) % n.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
};
const yuvarla = (n) => n.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);

// ---- Nehirler ----
const nSekil = shpOku(path.join(KAYNAK, 'ne_10m_rivers_lake_centerlines.shp'));
const nKayit = dbfOku(path.join(KAYNAK, 'ne_10m_rivers_lake_centerlines.dbf'));
const nehirler = [];
nSekil.forEach((parcalar, i) => {
  const k = nKayit[i];
  // Göl orta çizgileri (featurecla "Lake Centerline") göl zaten çizildiği için atlanır.
  if (/Lake/i.test(k.featurecla || '')) return;
  for (const p of parcalar) {
    if (!kutuda(p)) continue;
    // Karada kalan ardışık noktalar birer parça.
    let parca = [];
    const bitir = () => {
      if (parca.length >= 2) {
        const s = dp(parca, SADELIK);
        if (uzunluk(s) >= EN_KISA_NEHIR)
          nehirler.push({ ad: k.name || '', rank: +k.scalerank || 9, n: s });
      }
      parca = [];
    };
    for (const [lon, lat] of p) {
      const [x, y] = haritaya(lon, lat);
      if (karada(x, y)) parca.push([x, y]);
      else bitir();
    }
    bitir();
  }
});

// ---- Göller ----
const gSekil = shpOku(path.join(KAYNAK, 'ne_10m_lakes.shp'));
const gKayit = dbfOku(path.join(KAYNAK, 'ne_10m_lakes.dbf'));
const goller = [];
gSekil.forEach((parcalar, i) => {
  const k = gKayit[i];
  const halkalar2 = [];
  for (const p of parcalar) {
    if (!kutuda(p)) continue;
    const n = p.map(([lon, lat]) => haritaya(lon, lat));
    // İçindeki noktaların çoğu karadaysa Türkiye'nin gölü (sınır gölleri kıyıdan taşar).
    const icerde = n.filter(([x, y]) => ulkede(x, y)).length / n.length;
    if (icerde < 0.6) continue;
    const s = dp(n, SADELIK);
    if (s.length >= 4 && alan(s) >= EN_KUCUK_GOL) halkalar2.push(s);
  }
  if (halkalar2.length)
    goller.push({ ad: k.name || '', rank: +k.scalerank || 9, halkalar: halkalar2 });
});

const cikti = {
  aciklama:
    'Nehirler ve göller (Görev 21 · H8). Kaynak Natural Earth 10m (kamu malı): ' +
    'ne_10m_rivers_lake_centerlines, ne_10m_lakes. Koordinatlar harita birimi (parcalar.json ' +
    'ile aynı yerleşim). nehirler: [{ ad, rank, n: [x, y, …] }] (karaya kırpılmış), ' +
    'goller: [{ ad, rank, halkalar: [[x, y, …]] }]. scripts/harita-nehir-uret.js ile üretildi.',
  meta: {
    uretim: 'scripts/harita-nehir-uret.js',
    tarih: new Date().toISOString().slice(0, 10),
    yerlesim: {
      olcek: +OLCEK.toFixed(6),
      kayX: +KAY_X.toFixed(4),
      kayY: +KAY_Y.toFixed(4),
      ortancaHata: +ortanca.toFixed(3),
      enKotuHata: +enKotu.toFixed(3),
    },
    nehir: nehirler.length,
    gol: goller.length,
  },
  nehirler: nehirler.map((r) => ({ ad: r.ad, rank: r.rank, n: yuvarla(r.n) })),
  goller: goller.map((g) => ({ ad: g.ad, rank: g.rank, halkalar: g.halkalar.map(yuvarla) })),
};
fs.writeFileSync(CIKTI, JSON.stringify(cikti));
console.log(
  'Yerleşim: ölçek ' +
    OLCEK.toFixed(4) +
    ' · kayma (' +
    KAY_X.toFixed(2) +
    ', ' +
    KAY_Y.toFixed(2) +
    ') · il kutusu hatası ortanca ' +
    ortanca.toFixed(2) +
    ' / en kötü ' +
    enKotu.toFixed(2) +
    ' birim'
);
const adlar = (l) => [...new Set(l.map((x) => x.ad).filter(Boolean))].join(', ');
console.log('Nehir parçası ' + nehirler.length + ': ' + adlar(nehirler));
console.log('Göl ' + goller.length + ': ' + adlar(goller));
console.log(
  'Yazıldı: veri/harita-nehirler.json · ' + Math.round(fs.statSync(CIKTI).size / 1024) + ' KB'
);
