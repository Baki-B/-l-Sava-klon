// ÖDÜL MOTORU TESTLERİ (Görev 19 / Adım 1).
//
// Ölçülen asıl sorular:
//   1. Üç koruma da tek kapıdan mı geçiyor (mod · maç başına sınır · yenilgi şartı)?
//   2. Sayaç maçın içinde mi ve kayıttan dönüyor mu?
//   3. "Temiz zafer" ölçüsü doğru mu?
//   4. Ödül listesi ile yasak listesi ÇAKIŞMIYOR mu (eski kırmızı çizginin kalıntısı)?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const {
  ODULLER,
  sayaciTasi,
  odulKullanilabilirMi,
  odulKullan,
  kalanOdul,
  kullanilanOdul,
  temizMi,
  modKapaliMi,
} = require('../src/para/odul.js');
const { YASAK_ODULLER } = require('../src/para/reklam.js');

const kur = () => oyunKur({ senaryo: 'turkiye', tohum: 20260920 });

// ---- 1. ÜÇ KORUMA ----

test('ÖDÜL: yeni maçta kullanılabiliyor ve hak tam', () => {
  const d = kur();
  esit(kalanOdul(d), DENGE.ODUL.MAC_BASINA, 'başlangıç hakkı');
  dogru(odulKullanilabilirMi(d, 'turuGeriAl').ok, 'ödül kapalı geldi');
});

test('ÖDÜL: tanımsız anahtar reddediliyor', () => {
  esit(odulKullanilabilirMi(kur(), 'ekstraOrdu').kod, 'yok');
});

test('SINIR: maç başına hak dolunca reddediliyor', () => {
  let d = kur();
  for (let i = 0; i < DENGE.ODUL.MAC_BASINA; i++) {
    const s = odulKullan(d, 'turuGeriAl');
    dogru(s.ok, i + 1 + '. kullanım reddedildi: ' + s.sebep);
    d = s.durum;
  }
  esit(kullanilanOdul(d), DENGE.ODUL.MAC_BASINA, 'sayaç');
  esit(kalanOdul(d), 0, 'kalan hak');
  esit(odulKullanilabilirMi(d, 'turuGeriAl').kod, 'hak', 'sınır aşıldı');
  esit(odulKullan(d, 'turuGeriAl').ok, false, 'sınırdan sonra kullanım geçti');
});

test('MOD: kapalı modlarda ödül yok', () => {
  const d = kur();
  for (const tip of DENGE.ODUL.KAPALI_MODLAR) {
    const kapali = { ...d, mod: { ...(d.mod || {}), tip } };
    dogru(modKapaliMi(kapali), tip + ' kapalı sayılmadı');
    esit(odulKullanilabilirMi(kapali, 'turuGeriAl').kod, 'mod', tip);
  }
  dogru(!modKapaliMi(d), 'normal maç kapalı sayıldı');
});

test('YENİLGİ ŞARTI: "yenilgiden dön" yalnızca kaybedilmiş maçta', () => {
  const d = kur();
  esit(odulKullanilabilirMi(d, 'yenilgidenDon').kod, 'yenilgi', 'maç sürerken açıldı');
  // `durum.sonuc` bir METİN: 'yenildi' | 'kazandi'.
  const yenilmis = { ...d, sonuc: 'yenildi' };
  dogru(odulKullanilabilirMi(yenilmis, 'yenilgidenDon').ok, 'yenilgide kapalı kaldı');
  const kazanmis = { ...d, sonuc: 'kazandi' };
  esit(odulKullanilabilirMi(kazanmis, 'yenilgidenDon').kod, 'yenilgi', 'kazanınca açıldı');
});

// ---- 2. SAYAÇ MAÇIN İÇİNDE ----

test('SAYAÇ: kayıttan dönüyor (maça ait, cihaza değil)', () => {
  const s = odulKullan(kur(), 'casusRaporu');
  dogru(s.ok);
  const sonra = metinCoz(kayitMetni(s.durum)).durum;
  esit(kullanilanOdul(sonra), 1, 'sayaç kayıttan dönmedi');
});

test('SAYAÇ: ödül reddedilirse durum DEĞİŞMİYOR', () => {
  const d = kur();
  const s = odulKullan(d, 'ekstraOrdu');
  esit(s.ok, false);
  esit(s.durum, d, 'reddedilen ödül durumu değiştirdi');
});

// ---- 3. TEMİZ ZAFER ----

test('TEMİZ: hiç ödül kullanılmadıysa temiz, kullanıldıysa değil', () => {
  const d = kur();
  dogru(temizMi(d), 'yeni maç temiz sayılmadı');
  dogru(!temizMi(odulKullan(d, 'acilSeferberlik').durum), 'ödül sonrası hâlâ temiz');
});

// ---- 4. LİSTELER ÇAKIŞMIYOR ----

test('LİSTE: dört ödül tanımlı ve hepsinin adı/etkisi yazılı', () => {
  const anahtarlar = Object.keys(ODULLER);
  esit(anahtarlar.length, 4, 'ödül sayısı');
  for (const a of anahtarlar) {
    dogru(ODULLER[a].ad, a + ' adsız');
    dogru(ODULLER[a].etki, a + ' etkisi yazılmamış');
  }
});

test('LİSTE: hiçbir ödül YASAK listesinde değil', () => {
  for (const a of Object.keys(ODULLER))
    dogru(!YASAK_ODULLER[a], a + ' hem ödül hem yasak listesinde');
});

// ---- 5. SAYAÇ GERİ SARILMIYOR ----

test('GERİ ALMA: ödül sayacı geri sarılmıyor (sınırsız geri alma olmasın)', () => {
  const eski = kur(); // anlık görüntü: sayaç 0
  const simdi = odulKullan(odulKullan(kur(), 'turuGeriAl').durum, 'turuGeriAl').durum; // 2
  const geri = sayaciTasi(eski, simdi);
  esit(kullanilanOdul(geri), 2, 'sayaç eski hâline döndü — sınır anlamını yitirir');
});

test('GERİ ALMA: casus raporu geri dönünce kaybolmuyor', () => {
  const { casusAc, casusluMu } = require('../src/para/odulEtki.js');
  const eski = kur();
  const simdi = casusAc(kur(), '11');
  const geri = sayaciTasi(eski, simdi);
  dogru(casusluMu(geri, '11'), 'ödülle alınan bilgi geri dönünce silindi');
});
