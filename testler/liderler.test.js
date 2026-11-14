// LİDER ADLARI TESTLERİ (Görev 16 / Adım 1).
//
// Ölçülen asıl sorular:
//   1. Aynı tohum aynı lideri veriyor mu (kayıt bunun üstünde duruyor)?
//   2. Lakap BİLGİ taşıyor mu — baskın huyun havuzundan mı geliyor?
//   3. Unvan ilin bölgesinden mi geliyor?
//   4. Hasım çiftlerinin 14 ili elle yazılmış sabit adı mı taşıyor?
//   5. Veri ile kod ayrışmış mı (havuzlar DENGE.ZEKA.AGIRLIKLAR ile birebir mi)?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { ILLER } = require('../src/oyun/veri.js');
const { liderAdi, liderleriUret, baskinHuy, unvanAl } = require('../src/oyun/liderler.js');
const { LAKAPLAR, UNVANLAR, HASIM_LIDERLERI } = require('../veri/liderler.js');
const { HUSUMETLER } = require('../veri/husumetler.js');

const TOHUM = 20260920;
const kisilik = (yama) => ({
  saldirganlik: 0.2,
  acgozluluk: 0.2,
  husumet: 0.2,
  temkin: 0.2,
  ...yama,
});

// ---- 1. BELİRLENİMCİ ----

test('LİDER: aynı tohum aynı adı veriyor', () => {
  const k = kisilik({ saldirganlik: 0.9 });
  esit(liderAdi(TOHUM, '42', k).tamAd, liderAdi(TOHUM, '42', k).tamAd, 'aynı tohum');
});

test('LİDER: farklı tohum genelde farklı lakap veriyor', () => {
  const k = kisilik({ saldirganlik: 0.9 });
  const lakaplar = new Set();
  for (let t = 1; t <= 40; t++) lakaplar.add(liderAdi(t, '42', k).lakap);
  dogru(lakaplar.size > 1, 'tohum lakabı hiç değiştirmiyor');
});

test('LİDER: aynı tohumda iki farklı il aynı lakaba kilitlenmiyor', () => {
  const k = kisilik({ saldirganlik: 0.9 });
  const lakaplar = new Set();
  for (const kod of ['42', '06', '35', '01', '55', '21'])
    lakaplar.add(liderAdi(TOHUM, kod, k).lakap);
  dogru(lakaplar.size > 1, 'bütün iller aynı lakabı aldı — il kodu karışıma girmiyor');
});

// ---- 2. LAKAP BİLGİ TAŞIYOR ----

test('LAKAP: baskın huyun havuzundan geliyor', () => {
  const denemeler = [
    ['saldirganlik', kisilik({ saldirganlik: 0.95 })],
    ['acgozluluk', kisilik({ acgozluluk: 0.95 })],
    ['husumet', kisilik({ husumet: 0.95 })],
    ['temkin', kisilik({ temkin: 0.95 })],
  ];
  for (const [huy, k] of denemeler) {
    // Hasım olmayan bir il seçiliyor: onların lakabı elle yazılı (§3.4).
    const lider = liderAdi(TOHUM, '42', k);
    dogru(
      LAKAPLAR[huy].includes(lider.lakap),
      huy + ' için havuz dışı lakap geldi: ' + lider.lakap
    );
  }
});

test('BASKIN HUY: en yüksek ağırlık seçiliyor, eşitlikte sıra karar veriyor', () => {
  esit(baskinHuy(kisilik({ temkin: 0.9 })), 'temkin');
  // Hepsi eşitse `DENGE.ZEKA.AGIRLIKLAR` sırasının ilki gelir — belirlenimci olsun diye.
  esit(baskinHuy(kisilik()), DENGE.ZEKA.AGIRLIKLAR[0], 'eşitlikte ilk ağırlık');
  esit(baskinHuy(null), DENGE.ZEKA.AGIRLIKLAR[0], 'kişiliksizde çökmemeli');
});

// ---- 3. UNVAN BÖLGEDEN ----

test('UNVAN: ilin bölgesinden geliyor', () => {
  // 53 Rize → Karadeniz → Reis · 35 İzmir → Ege → Efe
  esit(unvanAl('53').ad, 'Reis', 'Karadeniz');
  esit(unvanAl('35').ad, 'Efe', 'Ege');
  dogru(
    liderAdi(TOHUM, '53', kisilik()).tamAd.startsWith('Rize Reisi'),
    'ad "Rize Reisi" ile başlamalı'
  );
});

test('UNVAN: tanımsız bölge varsayılana düşüyor, çökmüyor', () => {
  esit(unvanAl('9999').ad, 'Komutan', 'bilinmeyen il');
});

test('UNVAN: haritadaki HER ilin bir unvanı var', () => {
  for (const kod of Object.keys(ILLER)) {
    const u = unvanAl(kod);
    dogru(u && u.iyelik, kod + ' (' + ILLER[kod].bolge + ') için unvan yok');
  }
});

// ---- 4. HASIM ÇİFTLERİ ----

test('HASIM: husumet tablosundaki 14 ilin hepsinin elle yazılmış lideri var', () => {
  for (const h of HUSUMETLER) {
    for (const kod of [h.ilA, h.ilB]) {
      dogru(HASIM_LIDERLERI[kod], kod + ' hasım ama lideri yazılmamış (' + h.ad + ')');
      const lider = liderAdi(TOHUM, kod, kisilik({ saldirganlik: 0.95 }));
      esit(lider.lakap, HASIM_LIDERLERI[kod], kod + ' hasım lakabı kişilikten üretilmiş');
      esit(lider.hasim, true, kod + ' hasım işareti yok');
    }
  }
});

test('HASIM: sabit lakap kişilik değişse de değişmiyor', () => {
  const a = liderAdi(TOHUM, '53', kisilik({ saldirganlik: 0.95 })).lakap;
  const b = liderAdi(TOHUM + 999, '53', kisilik({ temkin: 0.95 })).lakap;
  esit(a, b, 'hasım lakabı tohuma ya da kişiliğe kaymış');
});

// ---- 5. VERİ İLE KOD AYRIŞMASIN ----

test('VERİ: lakap havuzları DENGE.ZEKA.AGIRLIKLAR ile birebir', () => {
  for (const huy of DENGE.ZEKA.AGIRLIKLAR)
    dogru(Array.isArray(LAKAPLAR[huy]) && LAKAPLAR[huy].length > 0, huy + ' için lakap havuzu yok');
  for (const huy of Object.keys(LAKAPLAR))
    dogru(DENGE.ZEKA.AGIRLIKLAR.includes(huy), huy + ' bir ağırlık değil ama havuzu var');
});

test('VERİ: hiçbir lakap ya da unvan koda gömülmemiş', () => {
  const kaynak = require('fs').readFileSync(
    require('path').join(__dirname, '../src/oyun/liderler.js'),
    'utf8'
  );
  for (const huy of Object.keys(LAKAPLAR))
    for (const lakap of LAKAPLAR[huy])
      dogru(!kaynak.includes("'" + lakap + "'"), lakap + ' koda gömülmüş');
  for (const bolge of Object.keys(UNVANLAR))
    dogru(!kaynak.includes("'" + UNVANLAR[bolge].iyelik + "'"), bolge + ' unvanı koda gömülmüş');
});

// ---- TOPLU ÜRETİM ----

test('TOPLU: liderleriUret her aktör için ad veriyor', () => {
  const kisilikler = { 42: kisilik({ saldirganlik: 0.9 }), 53: kisilik({ temkin: 0.9 }) };
  const liderler = liderleriUret(TOHUM, kisilikler);
  esit(Object.keys(liderler).length, 2);
  dogru(liderler['42'].tamAd.includes('—'), 'ad lakapsız kalmış');
});
