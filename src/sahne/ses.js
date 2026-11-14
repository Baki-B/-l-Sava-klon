// SES — BİLEREK BOŞ BIRAKILAN KATMAN (Görev 08 / Adım 3).
//
// ┌─ NEDEN BOŞ ─────────────────────────────────────────────────────────────────────────┐
// │ Baki, Soru 2'ye **A** (ses + titreşim) demişti; sonra sesi erteledi:                 │
// │                                                                                      │
// │   *"Ses işini şu anlık boş ver, titreşimlerle ilerle."* (2026-08-01)                  │
// │                                                                                      │
// │ Görev belgesi §Soru 2 bu ihtimali baştan yazmıştı: *"B ile başlayıp sesi sonradan    │
// │ eklemek de mümkün — ses katmanı ayrı tutulacağı için sonradan takmak ucuz."*         │
// │ Bu dosya o sözün tutulduğu yer.                                                      │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- SES GELDİĞİNDE YAPILACAK ÜÇ ŞEY ----
//
// 1. Dosyalar `assets/ses/` altına konur. Hangi ses, kaç saniye, nerede çalar:
//    `docs/GOREV-08-SES-LISTESI.md` (12 dosya, öncelik sıralı).
// 2. `npx expo install expo-audio` — Expo SDK 54'te ses paketi bu. Görev belgesi `expo-av`
//    diyordu ama SDK 54'te o paket artık önerilmiyor; belgeyi ölçüm değil sürüm çürüttü.
// 3. Aşağıdaki `OLAY_SESI` tablosu dosya adlarına bağlanır ve `sesCal` doldurulur.
//    ÇAĞIRAN YER DEĞİŞMEZ: `useSahne` zaten her olayda `sesCal(olay, acik)` çağırıyor.
//
// Yani ses eklemek bugün TEK DOSYALIK bir iş. Sahne, olay listesi, ayarlar ve titreşim
// katmanı buna hazır duruyor — bekleyen tek şey ses dosyalarının kendisi.

// Olay türünden ses dosyasına. Tablo ŞİMDİDEN dolu: dosya adları ses listesindeki adlarla
// birebir aynı, yani dosyalar gelince eşleme yeniden düşünülmeyecek.
export const OLAY_SESI = {
  turAcilisi: 'tur-acilisi',
  yurus: 'yurus',
  takviye: 'yurus',
  savas: 'vurus-agir',
  vurus: 'vurus-hafif',
  bozgun: 'bozgun',
  cekilme: 'bozgun',
  imha: 'imha',
  fetih: 'fetih-parca',
  ilTamamlandi: 'fetih-il',
  ilKaybedildi: 'kayip-il',
  duello: 'duello',
};

// ---- ⚠ SES OYUNA GİRMEYECEK (2026-08-12, Baki: "oyuna ses eklemeyeceğim") ----
//
// 2026-08-01'de ses ERTELENMİŞTİ (*"şimdilik boş ver, titreşimlerle ilerle"*); artık
// kalıcı karar. `docs/GOREV-08-SES-LISTESI.md`'teki 12 dosyalık liste ARANMAYACAK.
//
// DOSYA NEDEN DURUYOR: `SES_HAZIR` bayrağı bütün katmanı kapalı tutuyor — ayar menüsü
// çalışmayan bir düğme göstermiyor, `ayarlar.js` sesi hep false yapıyor, `useSahne` boş
// fonksiyonu çağırıp geçiyor. Yani burası ölü kod değil, bir KAPALI ANAHTAR: silmek
// `useSahne`'i, ayar menüsünü ve ayar şemasını birden değiştirmeyi gerektirirdi, kazancı
// da yalnızca üç boş fonksiyon olurdu. Hissiyatın tamamı artık `titresim.js`'te.
//
// Bir sahne olayının sesi. HİÇBİR ŞEY YAPMIYOR ve bu bir eksiklik değil, karar.
//
// Boş bir fonksiyon bırakmanın alternatifi çağrı yerlerini de boş bırakmaktı; o zaman ses
// eklendiğinde `useSahne`, ayar menüsü ve testler birden değişmek zorunda kalırdı.
// eslint-disable-next-line no-unused-vars
export function sesCal(olay, acik) {
  // Ses dosyaları gelince: acik && OLAY_SESI[olay.tip] → o dosyayı çal.
}

// Ses dosyalarını belleğe alma / bırakma. Sahne açılışında ve kapanışında çağrılıyor;
// bugün ikisi de boş, yarın `expo-audio` oynatıcıları burada kurulup burada bırakılacak.
export function sesleriHazirla() {}
export function sesleriBirak() {}

// Ses katmanı çalışır durumda mı — ayar menüsü bunu okuyor ve ses YOKKEN düğmeyi
// "yakında" diye gösteriyor. Çalışmayan düğme koymuyoruz (AyarMenusu.js'in kuralı).
export const SES_HAZIR = false;
