// HARİTA SÜSLERİ ÜRETİCİSİ (Görev 20 · Baki, 2026-09-24: "B olsun" + "denizde hafif dalga
// çizgileri olabilir").
//
// Çalıştırma:  node scripts/harita-sus-uret.js
// Çıktı:       veri/harita-susleri.json
//
// Haritanın "veri haritası" gibi durmaması için eski atlaslardaki gibi ARAZİ ÇİZİMİ (dağlık
// bölgede dağ, tepelik bölgede tepe) ve denizde DALGA çizgileri. Bu betik yalnızca NEREYE
// konacaklarını hesaplıyor; çizimi `src/haritaCizim.js susGeometrisiKur` yapıyor.
//
// NİYE ÖNDEN HESAPLANIYOR: yerleşim her parça için bir ızgarayı gezip her noktayı
// "parçanın içinde mi, sınırdan yeterince uzakta mı, rozetin yerinden uzakta mı" diye
// sınıyor (~100 bin nokta sınaması). Telefonda maç başında bunu yapmak saniyeler sürerdi;
// sonuç değişmediği için bir kez burada hesaplanıp veriye yazılıyor.
//
// ⚠ `veri/parcalar.json` ya da `veri/turkiye-hat.json` değişirse bu betik YENİDEN koşulur
// (`harita-seviye-uret.js` gibi) — yoksa dağlar sınırların üstüne taşar.
// ⚠ NEHİR VE GÖLLER (Görev 21): dağ ve tepe gölün İÇİNE ve nehrin ÜSTÜNE konmuyor;
// `veri/harita-nehirler.json` değişirse (`harita-nehir-uret.js`) bu betik de yeniden koşulur.
//
// YERLEŞİM BELİRLENİMCİ: "rastgele" kayma parça kimliğinden türetilen bir sayı. Aynı veri
// her koşuşta aynı dosyayı üretir.

const fs = require('fs');
const path = require('path');
const { dokunmaGeometrisi, parcaBul } = require('../src/haritaDonusum.js');
const { DENGE } = require('../src/denge.js');

const KOK = path.join(__dirname, '..');
const parcaVerisi = require('../veri/parcalar.json');
const hat = require('../veri/turkiye-hat.json');
const CIKTI = path.join(KOK, 'veri', 'harita-susleri.json');
const NEHIRLER = require('../veri/harita-nehirler.json');

// ---- AYARLAR (harita birimi; harita 1000 × 452) ----
// Izgara adımı: dağlar sık, tepeler seyrek (tepelik daha yumuşak bir arazi).
const ADIM = { dag: 9, tepe: 11, dalga: 19 };
// Glifin boyu (yarı genişlik) ve ±%20 çeşitlilik.
const BOY = { dag: 3.3, tepe: 2.7, dalga: 2.6 };
// Parça sınırından en az bu kadar içeride (glif sınır çizgisine binmesin).
const SINIR_PAYI = { dag: 2.8, tepe: 2.6 };
// Kıyıdan en az bu kadar açıkta (dalga kıyı çizgisine binmesin).
const KIYI_PAYI = 3.5;
// ROZETİN YERİ BOŞ KALSIN: parça rozetinin harita birimindeki boyu, telefonun ekranına
// göre (yatay 915 × 412 dp: f = 0.9115). Tablette f büyür, rozet küçülür — pay yeterli kalır.
const TELEFON_F = Math.min(915 / 1000, 412 / 452);
const ROZET_PAYI = (0.95 * DENGE.ROZET.CAP) / (DENGE.ROZET.YAKIN_SINIR * TELEFON_F);

// DENİZ ALANLARI — dalga yalnızca GERÇEK DENİZDE. Haritada Türkiye'nin dışı baştan sona deniz
// renginde; oysa doğu ve güneydoğuda orası kara (Gürcistan, İran, Irak, Suriye), Trakya'nın
// batısında Yunanistan ve Bulgaristan. Kutular kabaca çizildi ve Türkiye'nin içine taşabilir:
// bir nokta ancak kutunun içinde VE Türkiye'nin dışındaysa deniz sayılıyor.
const DENIZLER = [
  { ad: 'Karadeniz + Marmara', x0: 92, y0: 0, x1: 862, y1: 200 },
  { ad: 'Ege', x0: 0, y0: 105, x1: 150, y1: 452 },
  { ad: 'Akdeniz', x0: 0, y0: 340, x1: 545, y1: 452 },
];

// Belirlenimci "rastgele" (FNV-1a): 0–1.
function kar(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
const yuvarla = (x) => Math.round(x * 10) / 10;

const PARCALAR = parcaVerisi.parcalar;
const geom = dokunmaGeometrisi(PARCALAR);
// Türkiye'nin dış hattı da aynı dokunma testiyle: tek "parça" olarak.
const kara = dokunmaGeometrisi({ tr: { yol: hat.yol } });

// Nokta ve çevresindeki dört nokta aynı parçada mı (sınırdan `pay` kadar içeride mi)?
function icinde(pid, x, y, pay) {
  return (
    parcaBul(geom, x, y) === pid &&
    parcaBul(geom, x + pay, y) === pid &&
    parcaBul(geom, x - pay, y) === pid &&
    parcaBul(geom, x, y + pay) === pid &&
    parcaBul(geom, x, y - pay) === pid
  );
}
// Nokta ve çevresi Türkiye'nin dışında mı? Hem ülke hattına hem parçaların kendisine
// bakılıyor: ülke hattı parçalardan biraz daha sade, Muğla'nın girintili kıyısında bir dalga
// hattın dışında ama parçanın İÇİNDE kalmıştı (test yakaladı).
function denizde(x, y, pay) {
  const d = (a, b) => parcaBul(kara, a, b) === null && parcaBul(geom, a, b) === null;
  return d(x, y) && d(x + pay, y) && d(x - pay, y) && d(x, y + pay) && d(x, y - pay);
}

// ---- NEHİR VE GÖL: süsün girmeyeceği yerler ----
// Göller dokunma testiyle (halka = bir "parça"), nehirler noktanın çizgiye uzaklığıyla.
const NEHIR_PAYI = 1.6; // nehir çizgisinden bu kadar uzak (harita birimi)
const golGeom = dokunmaGeometrisi(
  Object.fromEntries(
    NEHIRLER.goller.flatMap((g, i) =>
      g.halkalar.map((h, j) => {
        let yol = 'M' + h[0] + ',' + h[1];
        for (let k = 2; k < h.length; k += 2) yol += 'L' + h[k] + ',' + h[k + 1];
        return ['g' + i + '-' + j, { yol: yol + 'Z' }];
      })
    )
  )
);
const nehirParcalari = [];
for (const r of NEHIRLER.nehirler)
  for (let k = 2; k < r.n.length; k += 2)
    nehirParcalari.push([r.n[k - 2], r.n[k - 1], r.n[k], r.n[k + 1]]);
// Göl: merkez ve dört yandaki nokta (glif kıyıya taşmasın).
function golde(x, y, pay) {
  for (const [ox, oy] of [
    [0, 0],
    [pay, 0],
    [-pay, 0],
    [0, pay],
    [0, -pay],
  ])
    if (parcaBul(golGeom, x + ox, y + oy) !== null) return true;
  return false;
}
// Dağ ve tepe gölden de nehirden de uzak.
function suda(x, y, pay) {
  if (golde(x, y, pay)) return true;
  for (const [ax, ay, bx, by] of nehirParcalari) {
    if (x < Math.min(ax, bx) - pay || x > Math.max(ax, bx) + pay) continue;
    if (y < Math.min(ay, by) - pay || y > Math.max(ay, by) + pay) continue;
    const dx = bx - ax,
      dy = by - ay;
    const l2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2));
    if (Math.hypot(x - ax - t * dx, y - ay - t * dy) < pay) return true;
  }
  return false;
}

// ---- ARAZİ: parça başına dağ / tepe noktaları ----
const dag = {};
const tepe = {};
let dagSayisi = 0,
  tepeSayisi = 0;
for (const g of geom) {
  const p = PARCALAR[g.pid];
  if (p.arazi !== 'daglik' && p.arazi !== 'tepelik') continue;
  const tur = p.arazi === 'daglik' ? 'dag' : 'tepe';
  const adim = ADIM[tur];
  const [x0, y0, x1, y1] = g.kutu;
  const liste = [];
  let i = 0;
  for (let y = y0 + adim / 2; y < y1; y += adim)
    for (let x = x0 + adim / 2; x < x1; x += adim) {
      i++;
      const jx = x + (kar(g.pid + 'x' + i) - 0.5) * adim * 0.7;
      const jy = y + (kar(g.pid + 'y' + i) - 0.5) * adim * 0.7;
      if (Math.hypot(jx - p.etiket.x, jy - p.etiket.y) < ROZET_PAYI) continue;
      if (suda(jx, jy, NEHIR_PAYI + BOY[tur])) continue;
      if (!icinde(g.pid, jx, jy, SINIR_PAYI[tur])) continue;
      const s = BOY[tur] * (0.8 + kar(g.pid + 's' + i) * 0.4);
      liste.push(yuvarla(jx), yuvarla(jy), yuvarla(s));
    }
  if (liste.length === 0) continue;
  (tur === 'dag' ? dag : tepe)[g.pid] = liste;
  if (tur === 'dag') dagSayisi += liste.length / 3;
  else tepeSayisi += liste.length / 3;
}

// ---- DENİZ: dalga noktaları ----
const dalga = [];
const gorulen = new Set();
for (const alan of DENIZLER) {
  let i = 0;
  for (let y = alan.y0 + ADIM.dalga / 2; y < alan.y1; y += ADIM.dalga * 0.8)
    for (let x = alan.x0 + ADIM.dalga / 2; x < alan.x1; x += ADIM.dalga) {
      i++;
      // Sıra kaydırması: dalgalar ızgara gibi değil, tuğla gibi dizilsin.
      const sira = Math.round((y - alan.y0) / (ADIM.dalga * 0.8));
      const jx = x + (sira % 2) * ADIM.dalga * 0.5 + (kar(alan.ad + 'x' + i) - 0.5) * 6;
      const jy = y + (kar(alan.ad + 'y' + i) - 0.5) * 4;
      const anahtar = Math.round(jx / 5) + '|' + Math.round(jy / 5);
      if (gorulen.has(anahtar)) continue; // iki kutunun kesiştiği yerde çift dalga olmasın
      if (jx < 0 || jx > 1000 || jy < 0 || jy > 452) continue;
      if (!denizde(jx, jy, KIYI_PAYI + BOY.dalga)) continue;
      gorulen.add(anahtar);
      dalga.push(
        yuvarla(jx),
        yuvarla(jy),
        yuvarla(BOY.dalga * (0.8 + kar(alan.ad + 's' + i) * 0.4))
      );
    }
}

const cikti = {
  aciklama:
    'Harita süsleri: dağlık/tepelik parçalarda dağ ve tepe çizimlerinin, denizde dalga ' +
    'çizgilerinin yerleri. Her üçlü [x, y, boy] (harita birimi). Çizim src/haritaCizim.js ' +
    'susGeometrisiKur. ' +
    'scripts/harita-sus-uret.js ile üretildi — parcalar.json ya da turkiye-hat.json ' +
    'değişirse yeniden koşulur.',
  meta: {
    uretim: 'scripts/harita-sus-uret.js',
    tarih: new Date().toISOString().slice(0, 10),
    rozetPayi: yuvarla(ROZET_PAYI),
    dag: dagSayisi,
    tepe: tepeSayisi,
    dalga: dalga.length / 3,
  },
  dag,
  tepe,
  dalga,
};
fs.writeFileSync(CIKTI, JSON.stringify(cikti));
console.log(
  'Yazıldı: veri/harita-susleri.json · dağ ' +
    dagSayisi +
    ' · tepe ' +
    tepeSayisi +
    ' · dalga ' +
    dalga.length / 3 +
    ' · ' +
    Math.round(fs.statSync(CIKTI).size / 1024) +
    ' KB'
);
