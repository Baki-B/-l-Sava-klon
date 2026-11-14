// REKLAM ZAMANI TESTLERİ (Görev 19 / Adım 3).
//
// Ölçülen asıl sorular:
//   1. İKİ ŞART BİRDEN mi işliyor (tur VE süre)?
//   2. İlk maç gerçekten reklamsız mı?
//   3. Komutan Paketi reklamları kapatıyor mu?
//   4. Maç sonu reklamı tur sınırına takılmıyor mu?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const {
  yeniTakip,
  araReklamGosterilebilirMi,
  reklamGosterildi,
  macSonuGosterilebilirMi,
} = require('../src/para/reklamZamani.js');

const R = DENGE.REKLAM;
const SANIYE = 1000;
const temel = (yama) => ({
  takip: yeniTakip(),
  tur: R.EN_AZ_TUR + 1,
  simdi: (R.EN_AZ_SANIYE + 1) * SANIYE,
  macSayisi: 5,
  paket: false,
  ...yama,
});

// ---- 1. İKİ ŞART BİRDEN ----

test('İKİ ŞART: ikisi de sağlanınca gösteriliyor', () => {
  dogru(araReklamGosterilebilirMi(temel()).ok, 'şartlar tamken reklam kapalı');
});

test('İKİ ŞART: tur yetmezse gösterilmiyor (hızlı oynayan üç dakikada iki reklam görmesin)', () => {
  esit(araReklamGosterilebilirMi(temel({ tur: R.EN_AZ_TUR - 1 })).kod, 'tur');
});

test('İKİ ŞART: süre yetmezse gösterilmiyor (tur uzun sürse bile)', () => {
  esit(araReklamGosterilebilirMi(temel({ simdi: 10 * SANIYE })).kod, 'sure');
});

test('İKİ ŞART: gösterimden sonra sayaç sıfırlanıyor', () => {
  const t = reklamGosterildi(yeniTakip(), 20, 100000);
  esit(t.sonTur, 20);
  esit(t.sonZaman, 100000);
  // Hemen ardından ikinci reklam çıkmamalı.
  esit(araReklamGosterilebilirMi(temel({ takip: t, tur: 21, simdi: 101000 })).kod, 'tur');
});

test('İKİ ŞART: maçın ilk turlarında reklam yok', () => {
  esit(araReklamGosterilebilirMi(temel({ tur: 2 })).kod, 'tur', 'maça reklamla başlanıyor');
});

// ---- 2. İLK MAÇ ----

test('İLK MAÇ: hiç maç bitirmemiş oyuncuya reklam gösterilmiyor', () => {
  esit(araReklamGosterilebilirMi(temel({ macSayisi: 0 })).kod, 'ilkMac');
  esit(macSonuGosterilebilirMi({ macSayisi: 0, paket: false }).kod, 'ilkMac');
});

// ---- 3. KOMUTAN PAKETİ ----

test('PAKET: reklamsız sürümde ara reklam da maç sonu reklamı da kapalı', () => {
  esit(araReklamGosterilebilirMi(temel({ paket: true })).kod, 'paket');
  esit(macSonuGosterilebilirMi({ macSayisi: 9, paket: true }).kod, 'paket');
});

// ---- 4. MAÇ SONU ----

test('MAÇ SONU: tur ve süre sınırına TAKILMIYOR (doğal durak)', () => {
  dogru(macSonuGosterilebilirMi({ macSayisi: 3, paket: false }).ok, 'maç sonu kapalı geldi');
});
