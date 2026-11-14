// GÜÇ SIRALAMASI TESTLERİ (Görev 20 — formül Baki'nin tarifiyle yeniden kuruldu).
//
// Baki, 2026-09-23: "sahadaki aktif askeri güç, ekonomi ve bölge sayıları etkili olsun;
// İstanbul 1., Ankara 2. olacak şekilde". Formül ve ağırlıkların gerekçesi `DENGE.GUC`'te.

const { test, dogru, esit, yakin } = require('./yardimci');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { gucSiralamasi, savasDegeri } = require('../src/oyun/guc.js');
const { DENGE } = require('../src/denge.js');

const BAS = oyunKur({ senaryo: 'turkiye', tohum: 7, zorluk: 'orta' });

test('GÜÇ: maç başında İstanbul 1., Ankara 2. (her tohumda)', () => {
  for (const tohum of [1, 7, 42, 2026]) {
    const s = gucSiralamasi(oyunKur({ senaryo: 'turkiye', tohum, zorluk: 'orta' }));
    esit(s[0].ad, 'İstanbul', 'tohum ' + tohum + ' birinci');
    esit(s[1].ad, 'Ankara', 'tohum ' + tohum + ' ikinci');
  }
});

test("GÜÇ: puan Türkiye'deki gücün yüzdesi — bütün satırların toplamı 100", () => {
  const s = gucSiralamasi(BAS);
  yakin(
    s.reduce((a, x) => a + x.puan, 0),
    100,
    1e-6,
    'toplam'
  );
  yakin(DENGE.GUC.ASKER + DENGE.GUC.EKONOMI + DENGE.GUC.TOPRAK, 1, 1e-12, 'ağırlıklar');
});

test('GÜÇ: askeri güç birim sayısı değil savaş değeri — zırhlı piyadeden ağır', () => {
  dogru(
    savasDegeri(DENGE.BIRIMLER, 'zirhli') > 2 * savasDegeri(DENGE.BIRIMLER, 'piyade'),
    'zırhlı'
  );
  esit(savasDegeri(DENGE.BIRIMLER, 'piyade'), 1, 'piyade birim');
});

test('GÜÇ: yaralı birim askeri güce sayılmıyor', () => {
  const pid = Object.keys(BAS.ordular).find((p) => BAS.ordular[p].birimler.piyade > 0);
  const o = BAS.ordular[pid];
  const yarali = {
    ...BAS,
    ordular: { ...BAS.ordular, [pid]: { ...o, yarali: { piyade: o.birimler.piyade } } },
  };
  const once = gucSiralamasi(BAS).find((x) => x.id === o.sahip);
  const sonra = gucSiralamasi(yarali).find((x) => x.id === o.sahip);
  dogru(sonra.askeri < once.askeri, 'yaralı piyade askeri gücü düşürmeli');
  esit(sonra.ordu, once.ordu, 'birim sayısı (ekranda) aynı');
});

test('GÜÇ: sıralama belirlenimci ve elenmiş aktör yok', () => {
  const a = gucSiralamasi(BAS)
    .map((x) => x.id)
    .join(',');
  const b = gucSiralamasi(BAS)
    .map((x) => x.id)
    .join(',');
  esit(a, b, 'aynı durum aynı sıra');
  for (const x of gucSiralamasi(BAS)) dogru(x.parca > 0, x.ad);
});
