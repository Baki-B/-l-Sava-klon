// KİŞİLİK VE KARAKTER TESTLERİ (Görev 12 / Adım 2).
//
// Asıl sorular: karakter gerçekten dağılıyor mu, ağırlıklar zorluk bandının İÇİNDE mi
// kalıyor, karakterler birbirinden AYRIŞIYOR mu, üretim belirlenimci mi, zorluk karışımı
// kaydırıyor mu?
//
// Neden bu testler önemli: karakter kayda yazılmıyor, her yüklemede yeniden türetiliyor.
// Türetimin belirlenimciliği bozulursa oyuncu kaydını her açtığında başka rakiplerle
// karşılaşır ve hiçbir yerde hata görünmez.

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { kisilikUret, karakterAdi, agirlik } = require('../src/oyun/kisilik.js');

const Z = DENGE.ZEKA;
const IDLER = [];
for (let i = 1; i <= 81; i++) IDLER.push(String(i).padStart(2, '0'));

function say(kisilikler) {
  const sayac = { saldirgan: 0, dengeli: 0, cekimser: 0 };
  for (const id of Object.keys(kisilikler)) sayac[kisilikler[id].karakter]++;
  return sayac;
}

// ---- DAĞILIM ----

test('KARAKTER: her aktör üç karakterden birini alıyor', () => {
  const k = kisilikUret(12345, IDLER, 'orta');
  esit(Object.keys(k).length, 81, 'aktör sayısı tutmuyor');
  for (const id of Object.keys(k)) {
    dogru(
      Z.KARAKTER_SIRASI.includes(k[id].karakter),
      id + ' tanımsız karakter aldı: ' + k[id].karakter
    );
  }
});

test('KARAKTER: üç karakter de haritada var (tek karaktere düşmüyor)', () => {
  // Beş ayrı tohumda da üçü birden çıkmalı; biri hiç çıkmıyorsa karışım tablosu ölü
  // demektir ve "her oyun farklı hissettirsin" isteği kâğıt üstünde kalır.
  for (const tohum of [1, 7, 4242, 99991, 123456]) {
    const s = say(kisilikUret(tohum, IDLER, 'orta'));
    for (const ad of Z.KARAKTER_SIRASI) {
      dogru(s[ad] > 0, 'tohum ' + tohum + ': hiç ' + ad + ' çıkmadı');
    }
  }
});

test('KARAKTER: zorluk karışımı kaydırıyor — zorda saldırgan çok, kolayda çekimser', () => {
  // Tek tohumda gürültü olabilir; beş tohumun toplamına bakılıyor.
  const topla = (zorluk) => {
    const t = { saldirgan: 0, dengeli: 0, cekimser: 0 };
    for (const tohum of [1, 7, 4242, 99991, 123456]) {
      const s = say(kisilikUret(tohum, IDLER, zorluk));
      for (const ad of Z.KARAKTER_SIRASI) t[ad] += s[ad];
    }
    return t;
  };
  const kolay = topla('kolay');
  const zor = topla('zor');
  dogru(zor.saldirgan > kolay.saldirgan, 'zorda saldırgan daha çok olmalıydı');
  dogru(kolay.cekimser > zor.cekimser, 'kolayda çekimser daha çok olmalıydı');
});

// ---- BANT VE DİLİM ----

test('KARAKTER: ağırlıklar zorluk bandının DIŞINA çıkmıyor', () => {
  // Dilim bandın içinde bir alt aralık açıyor; bandın dışına taşarsa zorluk kademesi
  // anlamını yitirir (kolay kademe zor gibi oynar).
  for (const zorluk of Z.ZORLUK_SIRASI) {
    const kademe = Z.ZORLUK[zorluk];
    const k = kisilikUret(2024, IDLER, zorluk);
    for (const id of Object.keys(k)) {
      for (const ad of Z.AGIRLIKLAR) {
        if (ad === 'husumet') continue;
        const bant = kademe.aralik[ad];
        if (!bant) continue;
        const v = agirlik(k[id], ad);
        dogru(
          v >= bant[0] - 0.001 && v <= bant[1] + 0.001,
          zorluk + '/' + id + '/' + ad + ' bant dışında: ' + v
        );
      }
    }
  }
});

test('KARAKTER: saldırgan gerçekten saldırgan, çekimser gerçekten temkinli', () => {
  // Karakterler AYRIŞMALI. Ayrışmıyorlarsa üç ayrı ad tek bir davranışın süsü olur.
  const k = kisilikUret(31337, IDLER, 'orta');
  const ort = (karakter, alan) => {
    const v = Object.keys(k)
      .filter((id) => k[id].karakter === karakter)
      .map((id) => agirlik(k[id], alan));
    return v.reduce((a, b) => a + b, 0) / v.length;
  };
  dogru(
    ort('saldirgan', 'saldirganlik') > ort('cekimser', 'saldirganlik') + 0.15,
    'saldırganın saldırganlığı çekimserden belirgin yüksek olmalıydı'
  );
  dogru(
    ort('cekimser', 'temkin') > ort('saldirgan', 'temkin') + 0.15,
    'çekimserin temkini saldırgandan belirgin yüksek olmalıydı'
  );
  dogru(
    ort('saldirgan', 'acgozluluk') > ort('cekimser', 'acgozluluk'),
    'saldırgan daha açgözlü olmalıydı'
  );
});

// ---- BELİRLENİMCİLİK ----

test('KARAKTER: aynı tohum aynı karakterleri veriyor (kayıt bunun üstünde duruyor)', () => {
  const a = kisilikUret(555, IDLER, 'orta');
  const b = kisilikUret(555, IDLER, 'orta');
  for (const id of Object.keys(a)) {
    esit(b[id].karakter, a[id].karakter, id + ' karakteri değişti');
    esit(b[id].saldirganlik, a[id].saldirganlik, id + ' saldırganlığı değişti');
  }
});

test('KARAKTER: aktör sırası karışsa da sonuç aynı', () => {
  const ters = [...IDLER].reverse();
  const a = kisilikUret(777, IDLER, 'zor');
  const b = kisilikUret(777, ters, 'zor');
  for (const id of Object.keys(a)) esit(b[id].karakter, a[id].karakter, id + ' sıraya bağlı çıktı');
});

test('KARAKTER: farklı tohum farklı harita veriyor', () => {
  const a = kisilikUret(1, IDLER, 'orta');
  const b = kisilikUret(2, IDLER, 'orta');
  const ayni = Object.keys(a).filter((id) => a[id].karakter === b[id].karakter).length;
  dogru(ayni < 70, 'iki maç neredeyse aynı çıktı (' + ayni + '/81 aynı karakter)');
});

// ---- EKRAN ADI ----

test('KARAKTER: ekran adı denge tablosundan geliyor, kişiliksizde null', () => {
  const k = kisilikUret(9, IDLER, 'orta');
  const ad = karakterAdi(k['06']);
  dogru(
    Object.values(Z.KARAKTERLER)
      .map((x) => x.ad)
      .includes(ad),
    'ekran adı tabloda yok: ' + ad
  );
  esit(karakterAdi(null), null, 'kişiliksiz aktör için ad üretildi');
  esit(karakterAdi({}), null, 'karakteri olmayan kişilik için ad üretildi');
});
