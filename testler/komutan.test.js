// KOMUTAN TESTLERİ (Görev 16 / Adım 4).
//
// Ölçülen asıl sorular:
//   1. Komutan yalnızca KENDİ ordunun başına geçiyor mu, turluk hak işliyor mu?
//   2. Moral kalemi gerçekten ekleniyor mu (kutsal düellonun kanalı)?
//   3. Orduyla birlikte taşınıyor mu — ve yalnızca istenirse mi?
//   4. Bozgunda düşüp bekleme cezası alıyor mu? Savunan tarafta da işliyor mu?
//   5. Yapay zekâ en kalabalık ordusunu mu seçiyor?
//   6. Kayıt gidiş-dönüşünde korunuyor mu, boş kayıt yazılmıyor mu?

const { test, dogru, esit, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { hamleUygula, moralBonuslari } = require('../src/oyun/cozum.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const {
  komutanAta,
  komutanAl,
  komutanBurada,
  komutanKalemi,
  atamaGecerliMi,
  komutanTuruBitir,
  kayitKomutanlari,
  zekaKomutanParcasi,
} = require('../src/oyun/komutan.js');

const TOHUM = 20260920;
const BEN = '16';
const DURGUN = { zekaKapali: true };

function sahne() {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  return hepsiyleSavas({ ...d, ordular: {} }, BEN);
}
function orduKoy(d, pid, sahip, birimler) {
  return { ...d, ordular: { ...d.ordular, [pid]: { sahip, birimler } } };
}
const ata = (d, pid, aktorId) => {
  const s = komutanAta(d, aktorId || BEN, pid);
  dogru(s.ok, 'komutan atanamadı: ' + s.sebep);
  return s.durum;
};

// ---- 1. ATAMA ----

test('ATAMA: komutan kendi ordusunun başına geçiyor', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 3 });
  d = ata(d, '16-3');
  esit(komutanAl(d, BEN).parcaId, '16-3');
  dogru(komutanBurada(d, BEN, '16-3'), 'komutan orada sayılmıyor');
});

test('ATAMA: başkasının parçasına ya da boş parçaya atanamıyor', () => {
  let d = orduKoy(sahne(), '11-1', '11', { piyade: 2 });
  esit(atamaGecerliMi(d, BEN, '11-1').kod, 'sahiplik', 'başkasının parçası');
  esit(atamaGecerliMi(d, BEN, '16-2').kod, 'sahiplik', 'ordusuz parça');
});

test('ATAMA: turluk hak — aynı tur ikinci atama reddediliyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 3 }), '16-1', BEN, { piyade: 2 });
  d = ata(d, '16-3');
  esit(atamaGecerliMi(d, BEN, '16-1').kod, 'hak', 'ikinci atama geçti');
});

test('ATAMA: tur bitince hak yenileniyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 3 }), '16-1', BEN, { piyade: 2 });
  d = ata(d, '16-3');
  d = turuBitir(d, DURGUN);
  dogru(atamaGecerliMi(d, BEN, '16-1').ok, 'tur sonrası atama hakkı gelmedi');
});

// ---- 2. MORAL KALEMİ ----

test('MORAL: komutan bulunduğu tarafa BİR KALEM ekliyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 4 }), '11-1', '11', { piyade: 2 });
  const once = moralBonuslari(d, '16-3', '11-1', BEN, '11');
  d = ata(d, '16-3');
  const sonra = moralBonuslari(d, '16-3', '11-1', BEN, '11');
  esit(
    sonra.saldiran.kalem - once.saldiran.kalem,
    DENGE.KOMUTAN.MORAL_KALEMI,
    'saldıran kalemi artmadı'
  );
  esit(sonra.savunan.kalem, once.savunan.kalem, 'savunanın kalemi de artmış');
});

test('MORAL: savunan tarafta da işliyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 4 }), '11-1', '11', { piyade: 2 });
  const once = moralBonuslari(d, '16-3', '11-1', BEN, '11');
  d = ata(d, '11-1', '11');
  const sonra = moralBonuslari(d, '16-3', '11-1', BEN, '11');
  esit(sonra.savunan.kalem - once.savunan.kalem, DENGE.KOMUTAN.MORAL_KALEMI, 'savunan kalemi');
});

test('MORAL: komutansız parçada kalem YOK', () => {
  const d = ata(orduKoy(sahne(), '16-3', BEN, { piyade: 3 }), '16-3');
  esit(komutanKalemi(d, BEN, '16-1'), 0, 'başka parçada kalem çıktı');
});

// ---- 3. TAŞINMA ----

test('TAŞIMA: "komutan da gitsin" işaretliyse hedefe geçiyor', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 4 });
  d = ata(d, '16-3');
  const s = hamleUygula(d, BEN, '16-3', '11-1', { piyade: 4 }, { komutan: true });
  dogru(s.ok, 'hamle reddedildi: ' + s.sebep);
  esit(s.durum.parcaSahipligi['11-1'], BEN, 'parça alınmalı');
  esit(komutanAl(s.durum, BEN).parcaId, '11-1', 'komutan taşınmadı');
});

test('TAŞIMA: işaretsizse komutan yerinde kalıyor', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 4 });
  d = ata(d, '16-3');
  const s = hamleUygula(d, BEN, '16-3', '11-1', { piyade: 4 });
  dogru(s.ok, 'hamle reddedildi: ' + s.sebep);
  esit(komutanAl(s.durum, BEN).parcaId, '16-3', 'komutan istenmeden taşındı');
});

test('TAŞIMA: atama hakkını harcamıyor (taşıma atama değildir)', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 4 });
  d = ata(d, '16-3');
  const s = hamleUygula(d, BEN, '16-3', '11-1', { piyade: 4 }, { komutan: true });
  esit(komutanAl(s.durum, BEN).atama, 1, 'taşıma ikinci atama gibi sayılmış');
});

// ---- 4. BOZGUN ----

test('BOZGUN: saldırı kırılınca orduyla giden komutan düşüyor ve bekleme başlıyor', () => {
  // 2 piyade → 6 zırhlıya saldırıyor: saldırı kesin kırılır.
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 2 }), '11-1', '11', { zirhli: 6 });
  d = ata(d, '16-3');
  const s = hamleUygula(d, BEN, '16-3', '11-1', { piyade: 2 }, { komutan: true });
  dogru(s.ok, 'hamle reddedildi: ' + s.sebep);
  const k = komutanAl(s.durum, BEN);
  esit(k.parcaId, null, 'komutan sahada kalmış');
  esit(k.bekleme, DENGE.KOMUTAN.BEKLEME, 'bekleme cezası yazılmamış');
  esit(atamaGecerliMi(s.durum, BEN, '16-3').kod, 'bekleme', 'cezalıyken atama geçti');
});

test('BOZGUN: savunan parçasını kaybederse komutanı düşüyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { zirhli: 8 }), '11-1', '11', { piyade: 1 });
  d = ata(d, '11-1', '11');
  const s = hamleUygula(d, BEN, '16-3', '11-1', { zirhli: 8 });
  dogru(s.ok, 'hamle reddedildi: ' + s.sebep);
  esit(s.durum.parcaSahipligi['11-1'], BEN, 'parça alınmalı');
  esit(komutanAl(s.durum, '11').parcaId, null, 'savunanın komutanı hâlâ sahada');
  dogru(komutanAl(s.durum, '11').bekleme > 0, 'savunanın komutanı ceza almadı');
});

test('BEKLEME: her turda bir azalıyor ve bitince atama açılıyor', () => {
  let d = orduKoy(orduKoy(sahne(), '16-3', BEN, { piyade: 2 }), '11-1', '11', { zirhli: 6 });
  d = ata(d, '16-3');
  d = hamleUygula(d, BEN, '16-3', '11-1', { piyade: 2 }, { komutan: true }).durum;
  let bekleme = komutanAl(d, BEN).bekleme;
  esit(bekleme, DENGE.KOMUTAN.BEKLEME);
  for (let i = 0; i < DENGE.KOMUTAN.BEKLEME; i++) {
    d = { ...d, ordular: { ...d.ordular, '16-1': { sahip: BEN, birimler: { piyade: 1 } } } };
    d = turuBitir(d, DURGUN);
    const yeni = komutanAl(d, BEN).bekleme;
    dogru(yeni < bekleme, 'bekleme azalmadı');
    bekleme = yeni;
  }
  esit(bekleme, 0, 'bekleme sıfırlanmadı');
  dogru(atamaGecerliMi(d, BEN, '16-1').ok, 'bekleme bitti ama atama açılmadı');
});

// ---- 5. YAPAY ZEKÂ ----

test('ZEKÂ: en kalabalık ordunun başına geçiyor (belirlenimci)', () => {
  let d = orduKoy(orduKoy(sahne(), '16-1', BEN, { piyade: 2 }), '16-3', BEN, { piyade: 5 });
  esit(zekaKomutanParcasi(d, BEN), '16-3');
  esit(zekaKomutanParcasi(d, '11'), null, 'ordusu olmayan aktöre yer bulunmuş');
});

test('ZEKÂ: gerçek turda botlar komutanlarını atıyor', () => {
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  d = turuBitir(d);
  const atanan = Object.keys(d.komutanlar || {}).filter((id) => (d.komutanlar[id] || {}).parcaId);
  dogru(atanan.length > 10, 'yalnızca ' + atanan.length + ' bot komutan atadı');
});

// ---- 6. KAYIT ----

test('KAYIT: komutan gidiş-dönüşte korunuyor', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 3 });
  d = ata(d, '16-3');
  const sonra = metinCoz(kayitMetni(d)).durum;
  esit(komutanAl(sonra, BEN).parcaId, '16-3', 'komutan kayıttan dönmedi');
});

test('KAYIT: sahada da cezada da olmayan komutan kayda YAZILMIYOR', () => {
  esit(kayitKomutanlari({ 16: { parcaId: null, bekleme: 0, atama: 0 } }), undefined, 'boş kayıt');
  const dolu = kayitKomutanlari({ 16: { parcaId: '16-1', bekleme: 0, atama: 1 } });
  esit(dolu['16'].parcaId, '16-1');
  esit(dolu['16'].bekleme, undefined, 'sıfır bekleme yazılmış');
});

test('TUR SONU: parçası elden çıkan komutan düşüyor', () => {
  let d = orduKoy(sahne(), '16-3', BEN, { piyade: 3 });
  d = ata(d, '16-3');
  // Parça el değiştirdi (ör. başka bir aktör aldı) — komutan orada duramaz.
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-3': '11' } };
  const sonra = komutanTuruBitir(d);
  esit(komutanAl(sonra, BEN).parcaId, null, 'komutan elden çıkan parçada kalmış');
});
