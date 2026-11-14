// ÖDÜLLERİN OYUN TARAFI (Görev 19 / Adım 2).
//
// `odul.js` "kullanılabilir mi" ve "kullanıldı"yı tutar; BURASI ödülün oyuna ne yaptığını
// yazar. İkisi ayrı çünkü dört ödülün etkisi birbirine hiç benzemiyor:
//
//   turuGeriAl / yenilgidenDon → ANLIK GÖRÜNTÜYE dönmek. Durumun kendisi değişmiyor,
//     yerine eskisi geliyor; o yüzden bu ikisi kancada yaşıyor (`oyunKancasi.js`),
//     burada değil. Anlık görüntüler YALNIZCA BELLEKTE (kayıt sınırı — `DENGE.ODUL`).
//   casusRaporu     → bir rakip KALICI olarak görünür oluyor (maç boyunca).
//   acilSeferberlik → o tur üretim sınırı bir kez aşılabiliyor.
//
// Bu iki etki durumun içinde yaşıyor, yani kayda giriyor: maçın ortasında kaydedip
// yükleyen oyuncu casus raporunu ya da seferberliği kaybetmemeli — parasını (ya da
// reklamını) ödediği şey buhar olmaz.

import { DENGE } from '../denge.js';

const O = DENGE.ODUL;

// ---- CASUS RAPORU ----
//
// Bir rakip "tanınır" hâle geliyor: ordusu ve araştırması il panelinde görünüyor.
// ⚠ KALICI VE TEK TARAFLI: rapor bir kez alınır, maç boyunca geçerlidir. Turluk olsaydı
// oyuncu aynı bilgi için ikinci kez reklam izlemek zorunda kalırdı — "ikinci şans" değil
// "abonelik" olurdu.
export function casusAc(durum, hedefAktorId) {
  const mevcut = durum.casus || [];
  if (mevcut.includes(hedefAktorId)) return durum;
  return { ...durum, casus: mevcut.concat([hedefAktorId]) };
}

export function casusluMu(durum, aktorId) {
  return ((durum && durum.casus) || []).includes(aktorId);
}

// ---- ACİL SEFERBERLİK ----
//
// O TUR üretim sınırı `EK_SANAYI` kadar genişliyor. Sınırı tamamen kaldırmak değil
// genişletmek: kaldırmak, parası olan oyuncuyu tek turda ordu fabrikasına çevirirdi ve
// "zaman satıyoruz, güç değil" cümlesini ters yüz ederdi.
//
// Tur numarası yazılıyor, bayrak değil: tur dönünce kendiliğinden sönüyor, ayrı bir
// sıfırlama adımı gerekmiyor (`turDongusu`da bir satır daha olmasın).
export function seferberlikAc(durum) {
  return { ...durum, seferberlikTuru: durum.tur };
}

export function seferberlikAcikMi(durum) {
  return !!durum && durum.seferberlikTuru === durum.tur;
}

// Bu turda üretim sınırına eklenecek pay (0 ya da EK_SANAYI).
// `ordu.js → ilUretimHakki` bunu okuyor: sınır hesabı TEK YERDE kalsın.
export function seferberlikPayi(durum, aktorId) {
  if (!seferberlikAcikMi(durum)) return 0;
  // Seferberlik yalnızca OYUNCUNUN ödülü. Botlar reklam izlemiyor; bir gün zekâya
  // verilecekse o ayrı bir karar ve ayrı bir ölçüm olur.
  return aktorId === durum.oyuncuAktorId ? O.EK_SANAYI : 0;
}
