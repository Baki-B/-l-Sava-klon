// ROZET TESTLERİ (Görev 04 / Adım 5).
// Asıl soru: kaydırma listesi ölçümle tutarlı mı? Harita veya katman sınırları değişince
// bu testler patlamalı — yoksa rozetler sessizce taşmaya başlar ve kimse fark etmez.

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { rozetKatmani } = require('../src/oyun/ordu.js');
const parcalarData = require('../veri/parcalar.json');
const haritaData = require('../veri/harita.json');
const polylabel = require('polylabel').default || require('polylabel');

// Ölçüm koşulları — `scripts/rozet-katman-olcum.js` ile aynı olmalı.
const META = parcalarData.meta;
const EKRAN_G = 915,
  EKRAN_Y = 412; // yatay telefon
const BIRIM_PX = Math.min(EKRAN_G / META.genislik, EKRAN_Y / META.yukseklik);

function halkalar(yol) {
  return yol
    .split('M')
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/Z/g, '')
        .split('L')
        .map((t) => {
          const [x, y] = t.split(',');
          return [+x, +y];
        })
        .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
    )
    .filter((r) => r.length >= 3);
}
function alan(r) {
  let a = 0;
  for (let i = 0, n = r.length, j = n - 1; i < n; j = i++)
    a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return Math.abs(a / 2);
}
// En büyük kara gövdesinin iç çember çapı.
function icCemberCapi(yol) {
  const rings = halkalar(yol);
  let en = rings[0],
    enA = alan(rings[0]);
  for (const r of rings) {
    const a = alan(r);
    if (a > enA) {
      enA = a;
      en = r;
    }
  }
  return polylabel([en], 0.05).distance * 2;
}
// Rozetin bu şekle sığması için gereken en az yakınlaştırma.
const gerekenZoom = (cap) => DENGE.ROZET.CAP / (cap * BIRIM_PX);

// Kaydırma tabloları — kaynak dosyayı okumak yerine burada tekrar yazmak, ikisinin
// ayrışmasını yakalamak için değil; kaynak dosya ESM olduğu için Node testte okunamıyor.
// Bu yüzden değerler `src/rozetKaydirma.js` ile ELDE eşlenmiştir; aşağıdaki testler
// hangi parçaların listede OLMASI gerektiğini ölçümden bağımsız olarak doğruluyor.
const PARCA_KAYDIRMA = { '17-1': { dx: -24, dy: 0 }, '77-1': { dx: -18, dy: -16 } };
const IL_KAYDIRMA = { 77: { dx: -18, dy: -16 }, 79: { dx: 0, dy: 24 } };

test("KATMAN SINIRLARI: Baki 2026-07-27 kararı denge.js'te duruyor", () => {
  esit(DENGE.ROZET.ORTA_SINIR, 1.35, 'uzak → orta');
  esit(DENGE.ROZET.YAKIN_SINIR, 2.7, 'orta → yakın');
});

test('KATMAN: eşikler sade ve keskin (geçiş bandı yok)', () => {
  // Geçiş artık SÖNÜK anda oluyor (RozetKatmani): yakınlaştırırken rozetler söner, parmak
  // kalkınca doğru takım görünür. Bu yüzden ara saydamlık, solma bandı ve "parça rozeti
  // ilinin rozetinden doğar" karışımı kalktı — 262 rozette görsel gürültüye dönüşüyorlardı.
  const R = DENGE.ROZET;
  esit(rozetKatmani(0.9), 'uzak', 'en uzak');
  esit(rozetKatmani(R.ORTA_SINIR - 0.01), 'uzak', 'sınırın hemen altı');
  esit(rozetKatmani(R.ORTA_SINIR), 'orta', 'tam sınırda il rozeti');
  esit(rozetKatmani(R.YAKIN_SINIR - 0.01), 'orta', 'ikinci sınırın altı');
  esit(rozetKatmani(R.YAKIN_SINIR), 'yakin', 'tam sınırda parça rozeti');
  esit(rozetKatmani(7), 'yakin', 'en yakın');
});

test('KATMAN: histerezis sınırda gidip gelmeyi engelliyor', () => {
  // Baki'nin bildirdiği titremenin bir sebebi buydu: yakınlaştırma tam sınırda duraklayınca
  // en küçük oynama katmanı bir ileri bir geri atlatıyordu.
  const R = DENGE.ROZET;
  const h = R.KATMAN_HISTEREZIS;
  dogru(h > 0, 'histerezis sıfırsa sınırda titreme geri gelir');

  // Yukarı çıkış tam sınırda olur.
  esit(rozetKatmani(R.YAKIN_SINIR, 'orta'), 'yakin', 'sınırda yakına geçmeli');
  // Aşağı dönüş sınırın hemen altında OLMAZ — histerezis kadar inmek gerekir.
  esit(rozetKatmani(R.YAKIN_SINIR - h / 2, 'yakin'), 'yakin', 'sınırın hemen altı yakın kalmalı');
  esit(rozetKatmani(R.YAKIN_SINIR - h - 0.01, 'yakin'), 'orta', 'histerezisin altında dönmeli');

  esit(rozetKatmani(R.ORTA_SINIR, 'uzak'), 'orta', 'sınırda ortaya geçmeli');
  esit(rozetKatmani(R.ORTA_SINIR - h / 2, 'orta'), 'orta', 'sınırın hemen altı orta kalmalı');
  esit(rozetKatmani(R.ORTA_SINIR - h - 0.01, 'orta'), 'uzak', 'histerezisin altında dönmeli');
});

test('KATMAN: sınır çevresinde salınan yakınlaştırma katmanı DEĞİŞTİRMİYOR', () => {
  // Parmak sınırın üstünde titrerken (±%2) katman sabit kalmalı.
  const R = DENGE.ROZET;
  let katman = rozetKatmani(R.YAKIN_SINIR);
  esit(katman, 'yakin', 'başlangıç');
  for (let i = 0; i < 40; i++) {
    const z = R.YAKIN_SINIR * (i % 2 === 0 ? 0.98 : 1.02);
    katman = rozetKatmani(z, katman);
    esit(katman, 'yakin', i + '. salınımda katman değişti');
  }
});

test('KATMAN: histerezis iki sınırın arasına sığıyor (orta katman yutulmuyor)', () => {
  const R = DENGE.ROZET;
  dogru(
    R.KATMAN_HISTEREZIS < R.YAKIN_SINIR - R.ORTA_SINIR,
    'histerezis orta katmanı yutuyor — sınırlar veya pay gözden geçirilmeli'
  );
  // İl rozetinin doğuşu haritanın en uzak seviyesinin altına inmemeli.
  dogru(R.ORTA_SINIR - R.KATMAN_HISTEREZIS >= 0.9, 'il rozeti 0.9x altında doğuyor');
});

test('KATMAN: orta katmandan sonra ekran hiç boş kalmıyor', () => {
  // Sınırın üstündeki her yakınlaştırmada MUTLAKA bir takım çizili olmalı.
  const R = DENGE.ROZET;
  let katman = 'uzak';
  for (let i = Math.round(R.ORTA_SINIR * 100); i <= 700; i++) {
    katman = rozetKatmani(i / 100, katman);
    dogru(katman === 'orta' || katman === 'yakin', i / 100 + 'x: ekranda rozet yok');
  }
});

test('KAYDIRMA LİSTESİ: yakın katman sınırında taşan HER parça listede', () => {
  const sinir = DENGE.ROZET.YAKIN_SINIR;
  const tasan = Object.keys(parcalarData.parcalar).filter(
    (pid) => gerekenZoom(icCemberCapi(parcalarData.parcalar[pid].yol)) > sinir
  );
  for (const pid of tasan)
    dogru(
      PARCA_KAYDIRMA[pid],
      pid + ' (' + parcalarData.parcalar[pid].ad + ') ' + sinir + "x'te taşıyor ama kaydırılmamış"
    );
  esit(tasan.length, 2, 'taşan parça sayısı (Gelibolu + Yalova)');
});

test('KAYDIRMA LİSTESİ: gereksiz yere kaydırılan parça yok', () => {
  const sinir = DENGE.ROZET.YAKIN_SINIR;
  for (const pid of Object.keys(PARCA_KAYDIRMA))
    dogru(
      gerekenZoom(icCemberCapi(parcalarData.parcalar[pid].yol)) > sinir,
      pid + ' zaten sığıyor, kaydırılmasına gerek yok'
    );
});

test('KAYDIRMA LİSTESİ: orta katman sınırında taşan HER il listede', () => {
  const sinir = DENGE.ROZET.ORTA_SINIR;
  const tasan = Object.keys(haritaData.iller).filter(
    (kod) => gerekenZoom(icCemberCapi(haritaData.iller[kod].yol)) > sinir
  );
  // Iğdır bilerek hariç: yalnızca 1.35–1.36 arası kıl payı şeritte taşıyor.
  const beklenen = tasan.filter(
    (kod) => gerekenZoom(icCemberCapi(haritaData.iller[kod].yol)) > 1.4
  );
  for (const kod of beklenen) dogru(IL_KAYDIRMA[kod], kod + ' ili taşıyor ama kaydırılmamış');
  esit(beklenen.length, 2, 'ciddi taşan il sayısı (Yalova + Kilis)');
});

test('KAYDIRMA YÖNÜ: kaydırma gerçekten rozeti oynatıyor (sıfır kaydırma yok)', () => {
  for (const t of [PARCA_KAYDIRMA, IL_KAYDIRMA])
    for (const k of Object.keys(t))
      dogru(t[k].dx !== 0 || t[k].dy !== 0, k + ' kaydırması sıfır — listede olmasının anlamı yok');
});

test('KAYDIRMA UZUNLUĞU: bağlantı çizgisi rozet çapı kadar, aşırı uzun değil', () => {
  const cap = DENGE.ROZET.CAP;
  for (const t of [PARCA_KAYDIRMA, IL_KAYDIRMA])
    for (const k of Object.keys(t)) {
      const u = Math.hypot(t[k].dx, t[k].dy);
      dogru(
        u >= cap * 0.6,
        k + ' kaydırması çok kısa (' + u.toFixed(1) + ' px) — rozet hâlâ taşar'
      );
      dogru(u <= cap * 1.6, k + ' kaydırması çok uzun (' + u.toFixed(1) + ' px) — bağı kopar');
    }
});

test('99+ KURALI ile rozet ölçümü uyumlu: en fazla 3 karakter', () => {
  const { rozetYazisi } = require('../src/oyun/ordu.js');
  for (const n of [1, 9, 10, 99, 100, 5000])
    dogru(rozetYazisi(n).length <= 3, n + ' → ' + rozetYazisi(n) + ' (3 karakteri aşıyor)');
});
