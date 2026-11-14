// HAMLE HAKKI DEFTERİ TESTLERİ (Görev 15 / Adım 1).
//
// Ölçülen asıl sorular:
//   1. Hak türe göre mi okunuyor (piyade 1 · topçu 1 · zırhlı 2)?
//   2. Hakkı tükenen birim gerçekten hareket edemiyor mu?
//   3. Yola çıkan HAKKI EN ÇOK KALAN mı — yani zırhlı fethettiği yerden devam edebiliyor mu?
//   4. Kayıptan sonra defter eldeki birim sayısını aşıyor mu?
//   5. Tur sonunda hak yenileniyor mu ve kayıt boş alanla şişiyor mu?

const { test, dogru, esit } = require('./yardimci');
const {
  hamleHakki,
  hareketEdebilir,
  hareketEdebilirBirimler,
  hamleHarca,
  hamleBirlestir,
  hamleYaz,
  defterKirp,
  hamleleriSifirla,
  kayitHamlesi,
} = require('../src/oyun/hamle.js');

const ordu = (birimler, hamle) => ({ sahip: '16', birimler, ...(hamle ? { hamle } : {}) });

// ---- 1. HAK TÜRE GÖRE ----

test('hamle hakkı: piyade 1, topçu 1, zırhlı 2', () => {
  esit(hamleHakki('piyade'), 1, 'piyade');
  esit(hamleHakki('topcu'), 1, 'topçu');
  esit(hamleHakki('zirhli'), 2, 'zırhlı');
});

test('tanımsız birim türü güvenli varsayılana (1) düşer', () => {
  esit(hamleHakki('suvari'), 1, 'bilinmeyen tür');
});

// ---- 2. TÜKENEN HAREKET EDEMEZ ----

test('hiç hareket etmemiş ordunun bütün birimleri hareket edebilir', () => {
  const o = ordu({ piyade: 3, topcu: 1, zirhli: 2 });
  esit(hareketEdebilir(o, 'piyade'), 3, 'piyade');
  esit(hareketEdebilir(o, 'topcu'), 1, 'topçu');
  esit(hareketEdebilir(o, 'zirhli'), 2, 'zırhlı');
});

test('bir hamle yapan piyade bir daha hareket edemez', () => {
  const o = ordu({ piyade: 3 }, { piyade: { 1: 2 } });
  esit(hareketEdebilir(o, 'piyade'), 1, 'geriye 1 taze piyade kalır');
});

test('bir hamle yapan zırhlı HÂLÂ hareket edebilir, iki hamle yapan edemez', () => {
  const birHamle = ordu({ zirhli: 2 }, { zirhli: { 1: 2 } });
  esit(hareketEdebilir(birHamle, 'zirhli'), 2, 'bir hamle harcamış zırhlı yine gidebilir');
  const ikiHamle = ordu({ zirhli: 2 }, { zirhli: { 2: 2 } });
  esit(hareketEdebilir(ikiHamle, 'zirhli'), 0, 'hakkı tükendi');
});

test('hareket edebilir birimler listesinde sıfır olan tür yazılmaz', () => {
  const o = ordu({ piyade: 1, zirhli: 1 }, { piyade: { 1: 1 } });
  const k = hareketEdebilirBirimler(o);
  esit(k.piyade, undefined, 'tükenmiş piyade listede olmamalı');
  esit(k.zirhli, 1, 'zırhlı listede');
});

// ---- 3. HAKKI EN ÇOK KALAN GİDER ----

test('yola çıkan taze birimdir: giden defteri 1 harcamayla varır', () => {
  const o = ordu({ zirhli: 2 }, { zirhli: { 1: 1 } }); // biri bir hamle yapmış, biri taze
  const s = hamleHarca(o, { zirhli: 1 });
  esit(s.gidenHamle.zirhli[1], 1, 'giden zırhlı 1 harcamış hâlde varır');
  esit(s.gidenHamle.zirhli[2], undefined, 'yorgun olan gönderilmedi');
  esit(s.kaynakHamle.zirhli[1], 1, 'yorgun zırhlı kaynakta kaldı');
});

test('giden zırhlının hakkı kalır — fethettiği yerden devam edebilir', () => {
  const o = ordu({ zirhli: 1 });
  const s = hamleHarca(o, { zirhli: 1 });
  const varan = hamleYaz(ordu({ zirhli: 1 }), s.gidenHamle);
  esit(hareketEdebilir(varan, 'zirhli'), 1, 'varışta bir hamlesi daha var');
  // İkinci hamleden sonra biter.
  const ikinci = hamleHarca(varan, { zirhli: 1 });
  const ikinciVaran = hamleYaz(ordu({ zirhli: 1 }), ikinci.gidenHamle);
  esit(hareketEdebilir(ikinciVaran, 'zirhli'), 0, 'ikinci hamleden sonra hak bitti');
});

test('piyade tek hamlesini harcayınca varışta hareket edemez', () => {
  const s = hamleHarca(ordu({ piyade: 2 }), { piyade: 2 });
  const varan = hamleYaz(ordu({ piyade: 2 }), s.gidenHamle);
  esit(hareketEdebilir(varan, 'piyade'), 0, 'varan piyade yorgun');
});

test('hakkı tükenmiş birim istenirse eksik bildirilir, sessizce gönderilmez', () => {
  const o = ordu({ piyade: 2 }, { piyade: { 1: 2 } });
  const s = hamleHarca(o, { piyade: 2 });
  esit(s.eksik.piyade, 2, 'iki piyade de gönderilemedi');
  esit(s.gidenHamle.piyade, undefined, 'giden yok');
});

test('gelen birlikler hedefteki orduyla birleşince defterler toplanır', () => {
  // Hedefte 1 piyade (bir hamle harcamış), oraya 2 piyade daha geliyor (onlar da harcamış).
  const birlesik = hamleBirlestir({ piyade: { 1: 1 } }, { piyade: { 1: 2 } });
  esit(birlesik.piyade[1], 3, 'üç piyade de yorgun sayılmalı');
  // Farklı harcamalar ayrı satırda kalır: zırhlının kalan hakkı karışmasın.
  const karisik = hamleBirlestir({ zirhli: { 1: 1 } }, { zirhli: { 2: 1 } });
  esit(karisik.zirhli[1], 1, 'bir hamlelik zırhlı');
  esit(karisik.zirhli[2], 1, 'iki hamlelik zırhlı');
});

// ---- 4. KAYIP SONRASI KIRPMA ----

test('defter eldeki birim sayısını aşamaz', () => {
  const kirpik = defterKirp({ piyade: 1 }, { piyade: { 1: 3 } });
  esit(kirpik.piyade[1], 1, 'üç yazılıydı, bir birim kaldı');
});

test('kayıptan sağ çıkan, hamlesini DAHA ÇOK harcamış sayılır', () => {
  // 2 zırhlı: biri 1 hamle, biri 2 hamle harcamış. Biri öldü.
  const kirpik = defterKirp({ zirhli: 1 }, { zirhli: { 1: 1, 2: 1 } });
  esit(kirpik.zirhli[2], 1, 'kalan, hakkını tüketmiş olan sayılır');
  esit(kirpik.zirhli[1], undefined, 'taze olan düştü — kaybettikçe hızlanan ordu olamaz');
});

// ---- 5. TUR SONU VE KAYIT ----

test('tur sonunda bütün defterler silinir', () => {
  const ordular = {
    '16-1': ordu({ piyade: 2 }, { piyade: { 1: 2 } }),
    '34-1': ordu({ zirhli: 1 }),
  };
  const yeni = hamleleriSifirla(ordular);
  esit(yeni['16-1'].hamle, undefined, 'defter silindi');
  esit(yeni['16-1'].birimler.piyade, 2, 'birimlere dokunulmadı');
});

test('defteri olmayan durumda AYNI nesne döner (ekran boşuna yeniden çizmesin)', () => {
  const ordular = { '16-1': ordu({ piyade: 2 }) };
  dogru(hamleleriSifirla(ordular) === ordular, 'kimlik korunmalı');
});

test('boş defter alan bırakmaz', () => {
  const o = hamleYaz(ordu({ piyade: 1 }, { piyade: { 1: 1 } }), {});
  esit(o.hamle, undefined, 'alan silinmeli');
  esit(kayitHamlesi({}), undefined, 'kayda boş defter yazılmaz');
  esit(kayitHamlesi({ piyade: { 1: 1 } }).piyade[1], 1, 'dolu defter kayda girer');
});
