// RÜTBE TESTLERİ (Görev 16 / Adım 3).
//
// Ölçülen asıl sorular:
//   1. Rütbe mühürlerden TÜRETİLİYOR mu (ayrı kayıt yok)?
//   2. Merdiven tutarlı mı — eşikler artıyor mu, 14 kademe var mı?
//   3. Orgeneral tavandan ÖNCE ulaşılabiliyor mu (son puanlar Mareşal'in)?
//   4. Mareşal yalnızca BÜTÜN mühürler toplanınca geliyor mu?
//   5. Mühür listesi büyürse eşikler kayar mı — oran kilitli mi?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { BASARIMLAR } = require('../src/oyun/basarimlar.js');
const { rutbeHesapla, puanHesapla, tavanPuan, rutbeYazisi } = require('../src/oyun/rutbe.js');

const hepsi = () => {
  const m = {};
  for (const b of BASARIMLAR) m[b.id] = Date.now();
  return m;
};
const bazilari = (adet) => {
  const m = {};
  for (const b of BASARIMLAR.slice(0, adet)) m[b.id] = Date.now();
  return m;
};

// ---- 1. TÜRETME ----

test('RÜTBE: mühürsüz oyuncu Er', () => {
  const r = rutbeHesapla({});
  esit(r.ad, 'Er');
  esit(r.sira, 1);
  esit(r.puan, 0);
  esit(r.onur, null, 'mühürsüz oyuncuya onur unvanı verilmiş');
});

test('RÜTBE: kayıt bozuksa (null) çökmüyor', () => {
  esit(rutbeHesapla(null).ad, 'Er');
  esit(puanHesapla(null), 0);
});

test('PUAN: bronz 1 · gümüş 2 · altın 3', () => {
  const bronz = BASARIMLAR.find((b) => b.kademe === 'bronz');
  const altin = BASARIMLAR.find((b) => b.kademe === 'altin');
  esit(puanHesapla({ [bronz.id]: 1 }), DENGE.RUTBE.PUAN.bronz, 'bronz');
  esit(puanHesapla({ [altin.id]: 1 }), DENGE.RUTBE.PUAN.altin, 'altın');
});

// ---- 2. MERDİVEN ----

test('MERDİVEN: 14 kademe ve eşikler ARTIYOR', () => {
  const k = DENGE.RUTBE.KADEMELER;
  esit(k.length, 14, 'kademe sayısı');
  esit(k[0].esik, 0, 'ilk kademe sıfırdan başlamalı');
  for (let i = 1; i < k.length; i++)
    dogru(k[i].esik > k[i - 1].esik, k[i].ad + ' eşiği bir öncekinden büyük değil');
});

test('MERDİVEN: puan arttıkça rütbe geri gitmiyor', () => {
  let oncekiSira = 0;
  for (let puan = 0; puan <= tavanPuan(); puan++) {
    // Puanı doğrudan veremiyoruz (mühürden türüyor), o yüzden eşik mantığı ayrıca sınanıyor.
    const kademe = DENGE.RUTBE.KADEMELER.filter((x) => puan >= x.esik).length;
    dogru(kademe >= oncekiSira, puan + ' puanda rütbe geriledi');
    oncekiSira = kademe;
  }
});

// ---- 3. TAVAN VE ORGENERAL ----

test('TAVAN: bütün mühürlerin puanı listeden sayılıyor, koda yazılı değil', () => {
  let elle = 0;
  for (const b of BASARIMLAR) elle += DENGE.RUTBE.PUAN[b.kademe] || 0;
  esit(tavanPuan(), elle, 'tavan listeden gelmiyor');
});

test('ORGENERAL: tavandan ÖNCE ulaşılabiliyor ama kolay değil (%80–%97 bandı)', () => {
  // Mühür listesi büyüyüp eşikler eskirse bu test öter — kilidin amacı bu.
  const sonEsik = DENGE.RUTBE.KADEMELER[DENGE.RUTBE.KADEMELER.length - 1].esik;
  const tavan = tavanPuan();
  dogru(sonEsik < tavan, 'Orgeneral eşiği tavanı aşıyor — kimse ulaşamaz');
  const oran = sonEsik / tavan;
  dogru(oran >= 0.8 && oran <= 0.97, 'Orgeneral eşiği tavanın %' + Math.round(oran * 100) + "'i");
});

test('ORGENERAL: bütün mühürlerle en üst kademeye çıkılıyor', () => {
  const r = rutbeHesapla(hepsi());
  esit(r.sira, DENGE.RUTBE.KADEMELER.length, 'en üst kademe');
  esit(r.ad, 'Orgeneral');
  esit(r.sonraki, null, 'tepede sonraki kademe olmamalı');
  esit(r.kalan, 0);
});

// ---- 4. MAREŞAL ----

test('MAREŞAL: yalnızca BÜTÜN mühürler toplanınca geliyor', () => {
  esit(rutbeHesapla(hepsi()).onur, DENGE.RUTBE.ONUR_UNVANI, 'hepsi toplandı');
  const eksik = hepsi();
  delete eksik[BASARIMLAR[0].id];
  esit(rutbeHesapla(eksik).onur, null, 'bir mühür eksikken onur unvanı verilmiş');
});

test('MAREŞAL: rütbenin yerine yazılıyor, yanına değil', () => {
  esit(rutbeYazisi(rutbeHesapla(hepsi())), DENGE.RUTBE.ONUR_UNVANI);
  esit(rutbeYazisi(rutbeHesapla({})), 'Er');
  esit(rutbeYazisi(null), '', 'rütbesiz çağrı çökmemeli');
});

// ---- 5. SONRAKİ KADEME ----

test('SONRAKİ: bir sonraki kademe ve kalan puan doğru', () => {
  const r = rutbeHesapla(bazilari(3));
  dogru(r.sonraki, 'sonraki kademe yazılmalı');
  const sonrakiEsik = DENGE.RUTBE.KADEMELER.find((k) => k.ad === r.sonraki).esik;
  esit(r.kalan, sonrakiEsik - r.puan, 'kalan puan');
});

test('SAYIM: kaç mühür / kaç mühür var doğru sayılıyor', () => {
  const r = rutbeHesapla(bazilari(4));
  esit(r.muhur, 4, 'kazanılan');
  esit(r.toplamMuhur, BASARIMLAR.length, 'toplam');
});
