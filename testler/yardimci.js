// KÜÇÜK TEST YARDIMCISI — dışarıdan hiçbir kütüphane kurmadan çalışır.
// Test dosyaları bunu `require` edip `test(...)` ile kontrol yazar,
// `testler/calistir.js` hepsini toplayıp Türkçe özet basar.

const sonuclar = [];

// Tek bir kontrol. Gövde hata fırlatmazsa test geçmiş sayılır.
function test(ad, govde) {
  try {
    govde();
    sonuclar.push({ ad, ok: true });
  } catch (e) {
    sonuclar.push({ ad, ok: false, mesaj: e.message });
  }
}

function dogru(kosul, mesaj) {
  if (!kosul) throw new Error(mesaj || 'koşul sağlanmadı');
}

function esit(bulunan, beklenen, mesaj) {
  if (!Object.is(bulunan, beklenen))
    throw new Error((mesaj ? mesaj + ': ' : '') + 'beklenen ' + beklenen + ', bulunan ' + bulunan);
}

// Kesirli sayılar için: kayan nokta hatası yüzünden birebir eşitlik aranmaz.
function yakin(bulunan, beklenen, tolerans, mesaj) {
  const t = tolerans === undefined ? 1e-9 : tolerans;
  if (!(Math.abs(bulunan - beklenen) <= t))
    throw new Error((mesaj ? mesaj + ': ' : '') + 'beklenen ~' + beklenen + ', bulunan ' + bulunan);
}

// İki dizi birebir aynı mı (ilk farklı öğeyi söyler).
function diziEsit(a, b, mesaj) {
  if (a.length !== b.length)
    throw new Error((mesaj ? mesaj + ': ' : '') + 'uzunluk ' + a.length + ' ≠ ' + b.length);
  for (let i = 0; i < a.length; i++)
    if (!Object.is(a[i], b[i]))
      throw new Error((mesaj ? mesaj + ': ' : '') + i + '. öğe farklı — ' + a[i] + ' ≠ ' + b[i]);
}

// ---- SAVAŞ HALİ KURGUSU (Görev 11) ----
//
// Görev 11'den beri BARIŞ VARSAYILAN ve barıştakine saldırılamıyor (`hareket.js`).
// Muharebe, fetih, çekilme gibi mekanikleri ölçen testlerin ÖN KOŞULU savaş halidir;
// her testin başında savaş ilan etmek ölçülen kuralı gizlerdi.
//
// İlişki satırı DOĞRUDAN yazılıyor, `savasIlanEt` çağrılmıyor. Sebep: ilan kapısının
// kendi kuralları var (ilk turlarda yasak, ittifak varsa yasak) ve o kurallar
// `diplomasi.test.js`'te ayrıca ölçülüyor. Burada gereken şey kuralın kendisi değil,
// SONUCU — yani "bu iki taraf savaşta".
function savasYaz(durum, a, b) {
  const k = a < b ? a + '|' + b : b + '|' + a;
  return {
    ...durum,
    iliskiler: {
      ...(durum.iliskiler || {}),
      [k]: { tip: 'savas', turdan: durum.tur, son: durum.tur },
    },
  };
}

// Bu aktörü haritadaki HERKESLE savaş hâline sokar — mekanik testlerinin ortak zemini.
function hepsiyleSavas(durum, aktorId) {
  let d = durum;
  for (const id of Object.keys(durum.aktorler || {}))
    if (id !== aktorId) d = savasYaz(d, aktorId, id);
  return d;
}

module.exports = { test, dogru, esit, yakin, diziEsit, sonuclar, savasYaz, hepsiyleSavas };
