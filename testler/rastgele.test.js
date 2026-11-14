// Tohumlu rastgele üretecin testleri (Görev 03 / Adım 1).
// Asıl soru: AYNI TOHUM AYNI SAYILARI VERİYOR MU? Kayıt/yükleme ve hata ayıklama buna dayanır.

const { test, dogru, esit, diziEsit } = require('./yardimci');
const { rastgeleKur, yeniTohum } = require('../src/oyun/rastgele.js');

const TOHUM = 123456;
const yuzSayi = (r) => Array.from({ length: 100 }, () => r.sonraki());

test('aynı tohumla kurulan iki üreteç ilk 100 sayıda birebir aynı', () => {
  const a = yuzSayi(rastgeleKur(TOHUM));
  const b = yuzSayi(rastgeleKur(TOHUM));
  diziEsit(a, b, '100 sayı');
});

test('farklı tohum farklı dizi üretir', () => {
  const a = yuzSayi(rastgeleKur(TOHUM));
  const b = yuzSayi(rastgeleKur(TOHUM + 1));
  let ayni = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) ayni++;
  dogru(ayni === 0, 'iki farklı tohum ' + ayni + ' sayıda çakıştı');
});

test('üretilen sayılar 0 ile 1 arasında (1 dahil değil)', () => {
  const r = rastgeleKur(TOHUM);
  for (let i = 0; i < 5000; i++) {
    const x = r.sonraki();
    dogru(x >= 0 && x < 1, i + '. sayı aralık dışı: ' + x);
  }
});

test('dağılım dengeli — 20.000 sayının ortalaması ~0.5', () => {
  const r = rastgeleKur(TOHUM);
  let toplam = 0;
  for (let i = 0; i < 20000; i++) toplam += r.sonraki();
  const ort = toplam / 20000;
  dogru(Math.abs(ort - 0.5) < 0.01, 'ortalama ' + ort.toFixed(4) + ' (0.49–0.51 bekleniyordu)');
});

test('KAYIT/YÜKLEME: durum kaydedilip yüklenince dizi kaldığı yerden devam eder', () => {
  // 20 sayı çek (oyun oynanıyor), sonra "kaydet".
  const oyun = rastgeleKur(TOHUM);
  for (let i = 0; i < 20; i++) oyun.sonraki();
  const kayit = { tohum: oyun.tohum, durum: oyun.durumAl() };

  // Oyun devam etseydi bunlar gelecekti:
  const devam = Array.from({ length: 10 }, () => oyun.sonraki());

  // "Uygulamayı kapat, aç, yükle" — kayıttan yeni üreteç kur.
  const yuklenen = rastgeleKur(kayit.tohum, kayit.durum);
  const yuklenenSonrasi = Array.from({ length: 10 }, () => yuklenen.sonraki());

  diziEsit(yuklenenSonrasi, devam, 'yüklenen oyun');
});

test('durumuYukle ile üreteç geri sarılabilir', () => {
  const r = rastgeleKur(TOHUM);
  for (let i = 0; i < 7; i++) r.sonraki();
  const isaret = r.durumAl();
  const once = Array.from({ length: 5 }, () => r.sonraki());
  r.durumuYukle(isaret);
  const sonra = Array.from({ length: 5 }, () => r.sonraki());
  diziEsit(sonra, once, 'geri sarılan üreteç');
});

test('durum tek bir sayıdır (kayıt dosyasına sığar)', () => {
  const r = rastgeleKur(TOHUM);
  r.sonraki();
  const d = r.durumAl();
  dogru(Number.isInteger(d) && d >= 0 && d <= 4294967295, 'durum geçersiz: ' + d);
});

test('tamsayi(1,6) sınırların içinde kalır ve her yüzü üretir', () => {
  const r = rastgeleKur(TOHUM);
  const gorulen = new Set();
  for (let i = 0; i < 600; i++) {
    const n = r.tamsayi(1, 6);
    dogru(Number.isInteger(n) && n >= 1 && n <= 6, 'zar dışarı çıktı: ' + n);
    gorulen.add(n);
  }
  esit(gorulen.size, 6, 'zarın kaç farklı yüzü geldi');
});

test('aralik(0.9, 1.1) sınırların içinde kalır — muharebe şans bandı için', () => {
  const r = rastgeleKur(TOHUM);
  for (let i = 0; i < 2000; i++) {
    const x = r.aralik(0.9, 1.1);
    dogru(x >= 0.9 && x < 1.1, 'bant dışı: ' + x);
  }
});

test('yeniTohum() geçerli bir tohum döndürür', () => {
  const t = yeniTohum();
  dogru(Number.isInteger(t) && t >= 0 && t <= 4294967295, 'geçersiz tohum: ' + t);
  // Tohum ne olursa olsun üreteç çalışmalı.
  dogru(rastgeleKur(t).sonraki() < 1, 'yeni tohumla üreteç çalışmadı');
});
