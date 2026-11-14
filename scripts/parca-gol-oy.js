// GÖLLERİ PARÇALARDAN OY (Görev 21 · Baki, 2026-09-24: "göller parçaların içinde olmasın,
// parçalardan başka olarak yalnızca dekoratif amaçlı dursunlar, il sınırlarını yeniden çiz").
//
// Çalıştırma:  node scripts/parca-gol-oy.js [--dene]
// Girdi:       veri/parcalar.json, veri/harita.json (il yolları), veri/harita-nehirler.json
//              (göller — scripts/harita-nehir-uret.js)
// Çıktı:       veri/parcalar.json ve veri/harita.json YERİNDE güncellenir (göller delik olur).
//              --dene: hiçbir şey yazmaz, yalnızca raporlar.
//
// NE OLUYOR
//   • Her parçanın çokgeninden gölleri çıkarır: göl artık HİÇBİR parçanın değil. Dokunma testi
//     (çift-tek kuralı) deliği tanıyor — göle dokunmak bir şey seçmez; kademeli geometri
//     (`harita-seviye-uret.js`) göl kıyısını ayrı bir kıyı hattı olarak çıkarır, yani il
//     sınırı artık gölün ÜSTÜNDEN geçmiyor, kıyısını dolaşıyor.
//   • Rozetin yeri (etiket noktası) göle ya da kıyısına düşmüşse yeni çokgenin "en iç"
//     noktasına (polylabel) taşınır. İl rozetinin yeri (harita.json) de aynı.
//   • KOMŞULUK DEĞİŞMEZ ama raporlanır: yalnızca göl üstünden komşu olan parça çifti varsa
//     yazılır (oyun kuralına dokunmak ayrı bir karar).
//
// SIRA (bir kaynak veri değişirse): parca-uret → harita-nehir-uret → parca-gol-oy →
// harita-seviye-uret → harita-sus-uret → menu-geometri-uret. Betik tekrar koşulursa zararı yok:
// göl zaten delikse çıkarılacak bir şey kalmaz.

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const polylabel = require('polylabel').default || require('polylabel');

const KOK = path.join(__dirname, '..');
const DENE = process.argv.includes('--dene');
const PARCA_DOSYA = path.join(KOK, 'veri', 'parcalar.json');
const HARITA_DOSYA = path.join(KOK, 'veri', 'harita.json');
const parcaVerisi = JSON.parse(fs.readFileSync(PARCA_DOSYA, 'utf8'));
const haritaVerisi = JSON.parse(fs.readFileSync(HARITA_DOSYA, 'utf8'));
const nehir = require('../veri/harita-nehirler.json');

// Rozetin yeri göle bu kadar yakınsa taşınır (harita birimi; parça rozeti ~10 birim).
const ETIKET_PAYI = 4;

// ⚠ DÜZLEM ÖLÇÜLERİ. turf'ün alan / uzaklık fonksiyonları koordinatı enlem-boylam sanıp küre
// üstünde hesaplıyor; harita birimi (y 0–452) öyle değil. Çıkarma, kesişme ve "içinde mi"
// düzlemde çalışıyor (turf'ten); alan ve uzaklık burada düzlemde.
function halkaAlani(h) {
  let a = 0;
  for (let i = 0; i < h.length - 1; i++) a += h[i][0] * h[i + 1][1] - h[i + 1][0] * h[i][1];
  return Math.abs(a / 2);
}
function alan(geom) {
  const cok = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return cok.reduce(
    (t, c) => t + halkaAlani(c[0]) - c.slice(1).reduce((d, h) => d + halkaAlani(h), 0),
    0
  );
}
function parcaUzakligi(x, y, h) {
  let en = Infinity;
  for (let i = 0; i < h.length - 1; i++) {
    const [ax, ay] = h[i],
      [bx, by] = h[i + 1];
    const dx = bx - ax,
      dy = by - ay;
    const l2 = dx * dx + dy * dy || 1e-12;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    en = Math.min(en, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return en;
}

// "M x,y L x,y … Z M …" → halkalar [[x, y], …] (kapalı: ilk nokta sonda tekrar)
function halkalariOku(yol) {
  return yol
    .split('M')
    .filter((s) => s.trim())
    .map((s) => {
      const n = s
        .replace(/Z/g, '')
        .split('L')
        .map((t) => t.split(',').map(Number))
        .filter((p) => p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (n.length && (n[0][0] !== n[n.length - 1][0] || n[0][1] !== n[n.length - 1][1]))
        n.push([n[0][0], n[0][1]]);
      return n;
    })
    .filter((n) => n.length >= 4);
}
// Halkaları çokgenlere grupla: içi dolu halka + içindeki delikler (çift-tek: bir halka kaç
// halkanın içindeyse o kadar derin; çiftse dış, tekse delik).
function cokgeneCevir(halkalar) {
  const derinlik = halkalar.map(
    (h, i) =>
      halkalar.filter(
        (o, j) => j !== i && turf.booleanPointInPolygon(turf.point(h[0]), turf.polygon([o]))
      ).length
  );
  const dislar = halkalar
    .map((h, i) => ({ h, i }))
    .filter(({ i }) => derinlik[i] % 2 === 0)
    .map(({ h, i }) => ({ dis: h, delik: [], i }));
  halkalar.forEach((h, i) => {
    if (derinlik[i] % 2 === 0) return;
    const sahip = dislar.find(
      (d) =>
        derinlik[d.i] === derinlik[i] - 1 &&
        turf.booleanPointInPolygon(turf.point(h[0]), turf.polygon([d.dis]))
    );
    if (sahip) sahip.delik.push(h);
  });
  const cok = dislar.map((d) => [d.dis, ...d.delik]);
  return cok.length === 1 ? turf.polygon(cok[0]) : turf.multiPolygon(cok);
}
const yuvarla = (x) => Math.round(x * 10) / 10;
// Göl kenarı parça sınırını sıyırınca birkaç köşelik KIRINTI halkalar doğuyor (en büyüğü
// 0.2 birim²). Kademeli geometri kaba seviyede onları siliyor ve seviyeler ayrışıyordu
// (`harita-seviye-uret.js` öz denetimi yakaladı). Bu alandan küçük halka yazılmaz.
const KIRINTI = 1;
function yolYaz(geom) {
  const cokgenler = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let yol = '';
  for (const c of cokgenler) {
    if (halkaAlani(c[0]) < KIRINTI) continue;
    for (const h of c) {
      if (halkaAlani(h) < KIRINTI) continue;
      const n = h.slice(0, -1).map(([x, y]) => [yuvarla(x), yuvarla(y)]);
      yol += 'M' + n.map((p) => p[0] + ',' + p[1]).join('L') + 'Z';
    }
  }
  return yol;
}
function enIcNokta(geom) {
  const cokgenler = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  // En büyük parçanın içinde.
  let enb = cokgenler[0],
    enbAlan = 0;
  for (const c of cokgenler) {
    const a = alan({ type: 'Polygon', coordinates: c });
    if (a > enbAlan) {
      enbAlan = a;
      enb = c;
    }
  }
  const p = polylabel(enb, 0.1);
  return { x: yuvarla(p[0]), y: yuvarla(p[1]) };
}

// ---- Göller ----
const golCokgenleri = nehir.goller.flatMap((g) =>
  g.halkalar.map((h) => {
    const n = [];
    for (let i = 0; i < h.length; i += 2) n.push([h[i], h[i + 1]]);
    n.push([h[0], h[1]]);
    return { ad: g.ad, cok: turf.polygon([n]) };
  })
);
const golYakin = (x, y) =>
  golCokgenleri.some(
    (g) =>
      turf.booleanPointInPolygon(turf.point([x, y]), g.cok) ||
      parcaUzakligi(x, y, g.cok.geometry.coordinates[0]) < ETIKET_PAYI
  );

function oy(yol) {
  let cok = cokgeneCevir(halkalariOku(yol));
  let degisti = false;
  for (const g of golCokgenleri) {
    if (!turf.booleanIntersects(cok, g.cok)) continue;
    const fark = turf.difference(turf.featureCollection([cok, g.cok]));
    if (!fark) continue;
    const once = alan(cok.geometry),
      sonra = alan(fark.geometry);
    if (Math.abs(once - sonra) < 1e-9 * once) continue;
    cok = fark;
    degisti = true;
  }
  return { cok, degisti };
}

const rapor = { parca: [], etiket: [], il: [], ilEtiket: [] };
const yeniParca = {};
for (const pid of Object.keys(parcaVerisi.parcalar)) {
  const p = parcaVerisi.parcalar[pid];
  const { cok, degisti } = oy(p.yol);
  yeniParca[pid] = { ...p };
  if (!degisti) continue;
  yeniParca[pid].yol = yolYaz(cok.geometry);
  rapor.parca.push(pid);
  if (
    golYakin(p.etiket.x, p.etiket.y) ||
    !turf.booleanPointInPolygon(turf.point([p.etiket.x, p.etiket.y]), cok)
  ) {
    yeniParca[pid].etiket = enIcNokta(cok.geometry);
    rapor.etiket.push(
      pid + ' ' + JSON.stringify(p.etiket) + ' → ' + JSON.stringify(yeniParca[pid].etiket)
    );
  }
}
const yeniIl = {};
for (const kod of Object.keys(haritaVerisi.iller)) {
  const il = haritaVerisi.iller[kod];
  const { cok, degisti } = oy(il.yol);
  yeniIl[kod] = { ...il };
  if (!degisti) continue;
  yeniIl[kod].yol = yolYaz(cok.geometry);
  rapor.il.push(kod);
  if (
    golYakin(il.etiket.x, il.etiket.y) ||
    !turf.booleanPointInPolygon(turf.point([il.etiket.x, il.etiket.y]), cok)
  ) {
    yeniIl[kod].etiket = enIcNokta(cok.geometry);
    rapor.ilEtiket.push(
      kod + ' ' + JSON.stringify(il.etiket) + ' → ' + JSON.stringify(yeniIl[kod].etiket)
    );
  }
}

// ---- Komşuluk denetimi: göl oyulunca ortak kenarı KALMAYAN komşu çiftler ----
// Parçalar aynı kaynaktan ve köşeleri birebir ortak: iki parçanın ORTAK KÖŞE sayısı < 2 ise
// ortak bir kenarları yok (tek köşe = yalnızca bir noktada değiyor).
const komsuluk = require('../veri/parca-komsuluk.json');
const etkilenen = new Set(rapor.parca);
const kopan = [];
const koseler = {};
const koseAl = (pid) =>
  koseler[pid] ||
  (koseler[pid] = new Set(
    halkalariOku(yeniParca[pid].yol)
      .flat()
      .map(([x, y]) => yuvarla(x) + ',' + yuvarla(y))
  ));
for (const a of Object.keys(komsuluk))
  for (const b of komsuluk[a]) {
    if (a >= b || (!etkilenen.has(a) && !etkilenen.has(b))) continue;
    const kb = koseAl(b);
    let ortak = 0;
    for (const k of koseAl(a)) if (kb.has(k)) ortak++;
    if (ortak < 2) kopan.push(a + '|' + b);
  }

console.log('Göller: ' + golCokgenleri.map((g) => g.ad).join(', '));
console.log('Oyulan parça ' + rapor.parca.length + ': ' + rapor.parca.join(' '));
console.log(
  'Rozet yeri taşınan parça ' +
    rapor.etiket.length +
    (rapor.etiket.length ? ':\n  ' + rapor.etiket.join('\n  ') : '')
);
console.log('Oyulan il ' + rapor.il.length + ': ' + rapor.il.join(' '));
console.log(
  'Rozet yeri taşınan il ' +
    rapor.ilEtiket.length +
    (rapor.ilEtiket.length ? ':\n  ' + rapor.ilEtiket.join('\n  ') : '')
);
console.log(
  'Yalnızca göl üstünden komşu kalan çift ' +
    kopan.length +
    (kopan.length ? ': ' + kopan.join(', ') : '')
);

if (DENE) {
  console.log('(--dene: hiçbir dosya yazılmadı)');
} else {
  parcaVerisi.parcalar = yeniParca;
  parcaVerisi.meta.golOyma = {
    uretim: 'scripts/parca-gol-oy.js',
    tarih: new Date().toISOString().slice(0, 10),
    goller: golCokgenleri.length,
    // SU ÜSTÜNDEN KOMŞULAR: oyunda komşu (parca-komsuluk.json DEĞİŞMEDİ) ama aralarında
    // artık yalnızca göl var — boğaz komşulukları gibi. `veri-dogrula.js` bunları biliyor.
    suUstuKomsu: kopan,
  };
  haritaVerisi.iller = yeniIl;
  haritaVerisi.meta.golOyma = parcaVerisi.meta.golOyma;
  fs.writeFileSync(PARCA_DOSYA, JSON.stringify(parcaVerisi));
  fs.writeFileSync(HARITA_DOSYA, JSON.stringify(haritaVerisi));
  console.log('Yazıldı: veri/parcalar.json, veri/harita.json');
}
