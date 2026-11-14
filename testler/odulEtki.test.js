// ÖDÜL ETKİLERİ TESTLERİ (Görev 19 / Adım 2).
//
// Ölçülen asıl sorular:
//   1. Casus raporu kalıcı mı ve kayıttan dönüyor mu?
//   2. Acil seferberlik O TUR üretim sınırını açıyor, sonraki tur kendiliğinden sönüyor mu?
//   3. Seferberlik yalnızca OYUNCUYA mı işliyor (botlar reklam izlemiyor)?
//   4. Temiz/Kirli Zafer mühürleri ödül sayacını doğru okuyor mu?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { ilUretimHakki } = require('../src/oyun/ordu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const { basarimBaglami, BASARIMLAR } = require('../src/oyun/basarimlar.js');
const { casusAc, casusluMu, seferberlikAc, seferberlikAcikMi } = require('../src/para/odulEtki.js');

const DURGUN = { zekaKapali: true };
const kur = () => oyunKur({ senaryo: 'turkiye', tohum: 20260920 });

// ---- 1. CASUS RAPORU ----

test('CASUS: rapor alınan rakip görünür oluyor, ötekiler görünmüyor', () => {
  const d = casusAc(kur(), '11');
  dogru(casusluMu(d, '11'), 'rapor alınan görünmüyor');
  dogru(!casusluMu(d, '34'), 'rapor alınmayan görünüyor');
});

test('CASUS: aynı rakip iki kez eklenmiyor (durum da değişmiyor)', () => {
  const bir = casusAc(kur(), '11');
  const iki = casusAc(bir, '11');
  esit(iki, bir, 'ikinci rapor yeni durum üretti');
  esit(iki.casus.length, 1);
});

test('CASUS: KALICI — kayıttan dönüyor ve tur bitince silinmiyor', () => {
  let d = casusAc(kur(), '11');
  d = turuBitir(d, DURGUN);
  dogru(casusluMu(d, '11'), 'tur bitince rapor kaybolmuş');
  const sonra = metinCoz(kayitMetni(d)).durum;
  dogru(casusluMu(sonra, '11'), 'rapor kayıttan dönmedi');
});

// ---- 2. ACİL SEFERBERLİK ----

test('SEFERBERLİK: o tur üretim sınırı EK_SANAYI kadar açılıyor', () => {
  const d = kur();
  const ben = d.oyuncuAktorId;
  const once = ilUretimHakki(d, '16', ben).sinir;
  const s = seferberlikAc(d);
  esit(ilUretimHakki(s, '16', ben).sinir, once + DENGE.ODUL.EK_SANAYI, 'sınır açılmadı');
});

test('SEFERBERLİK: SONRAKİ tur kendiliğinden sönüyor (ayrı sıfırlama yok)', () => {
  let d = seferberlikAc(kur());
  const ben = d.oyuncuAktorId;
  dogru(seferberlikAcikMi(d), 'kullanıldığı turda kapalı');
  d = turuBitir(d, DURGUN);
  dogru(!seferberlikAcikMi(d), 'sonraki turda hâlâ açık');
  esit(ilUretimHakki(d, '16', ben).sinir, ilUretimHakki(kur(), '16', ben).sinir, 'sınır dönmedi');
});

test('SEFERBERLİK: yalnızca oyuncuya işliyor, botlara işlemiyor', () => {
  const s = seferberlikAc(kur());
  const bot = Object.keys(s.aktorler).find((id) => id !== s.oyuncuAktorId);
  esit(ilUretimHakki(s, '16', bot).sinir, ilUretimHakki(kur(), '16', bot).sinir, 'bota da açıldı');
});

// ---- 3. TEMİZ / KİRLİ ZAFER ----

test('MÜHÜR: iki yeni mühür listede ve koşulları ödül sayacına bakıyor', () => {
  const temiz = BASARIMLAR.find((b) => b.id === 'temizZafer');
  const kirli = BASARIMLAR.find((b) => b.id === 'kirliZafer');
  dogru(temiz && kirli, 'mühürler listede yok');
  const kazanan = (odul) => ({ kazandi: true, odul });
  dogru(temiz.kosul(kazanan(0)), 'ödülsüz zafer Temiz Zafer vermedi');
  dogru(!temiz.kosul(kazanan(2)), 'ödüllü zafer Temiz Zafer verdi');
  dogru(kirli.kosul(kazanan(2)), 'ödüllü zafer Kirli Zafer vermedi');
  dogru(!kirli.kosul(kazanan(0)), 'ödülsüz zafer Kirli Zafer verdi');
});

test('BAĞLAM: ödül sayacı maç sayaçlarından okunuyor', () => {
  const d = kur();
  esit(basarimBaglami(d).odul, 0, 'yeni maçta sıfır olmalı');
  const kullanilmis = { ...d, sayaclar: { ...d.sayaclar, odul: 2 } };
  esit(basarimBaglami(kullanilmis).odul, 2, 'sayaç bağlama geçmiyor');
});

test('MÜHÜR: kaybedilen maçta ikisi de gelmiyor', () => {
  const temiz = BASARIMLAR.find((b) => b.id === 'temizZafer');
  const kirli = BASARIMLAR.find((b) => b.id === 'kirliZafer');
  dogru(!temiz.kosul({ kazandi: false, odul: 0 }), 'yenilgide Temiz Zafer geldi');
  dogru(!kirli.kosul({ kazandi: false, odul: 3 }), 'yenilgide Kirli Zafer geldi');
});
