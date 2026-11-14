// TİTREŞİM DESENİ — "bu olayda ne hissedilmeli" sorusunun SAF cevabı (2026-08-12).
//
// ---- NEDEN AYRI DOSYA ----
//
// Bu mantık `titresim.js`'in içindeydi ve o dosya `expo-haptics`'i içe aktarıyor. Node
// `node_modules` altındaki TypeScript'i çözemediği için dosya testten ERİŞİLEMEZ durumdaydı:
// hissiyatın bütün kuralları yazılıydı ama hiçbiri denetlenmiyordu.
//
// Ayrım projenin kendi kuralının aynısı (CLAUDE.md §3): saf mantık React'i ve cihazı
// tanımaz, o yüzden Node ile test edilebilir. Burada HİÇBİR içe aktarma yok — bilerek.
// `titresim.js` yalnızca bu dosyanın söylediğini cihaza çalıyor.
//
// ---- ÜÇ EKSEN ----
//
// Eski hâli tek eksenliydi: olay türü → tek titreşim. Kars'ta bir yapay zekânın parça
// alması ile senin ordunun dağılması aynı tık'tı. Artık üç şeye birden bakılıyor:
//
//   1. TÜR      → ne oldu
//   2. BÜYÜKLÜK → kaç birim düştü (raundun ağırlığı elde hissedilsin)
//   3. KİM      → benim başıma mı geldi (`benim` / `bana` damgaları `olaylar.js`'ten)

// Olay türünden temel titreşim biçimine. Yalnızca NİYET yazılı; cihaz karşılıkları
// `titresim.js`'te çözülüyor.
//
//   hafif  → oldu bittiyi bildirir (yürüyüş, takviye, uzaktaki fetih)
//   orta   → kayda değer bir şey oldu (tur açılışı, savaş başladı)
//   agir   → geri dönüşü olmayan bir şey oldu (ordu imha)
//   uyari  → kötü ama telafi edilebilir (bozgun, çekilme)
//   basari → senin lehine kapanan büyük an
//   hata   → senin aleyhine kapanan büyük an
export const OLAY_TITRESIMI = {
  turAcilisi: 'orta',
  yurus: 'hafif',
  takviye: 'hafif',
  savas: 'orta',
  vurus: 'hafif',
  bozgun: 'uyari',
  cekilme: 'uyari',
  imha: 'agir',
  fetih: 'orta',
  ilTamamlandi: 'basari',
  ilKaybedildi: 'hata',
  duello: 'agir',
  // `kamera` bilerek listede yok: kamera bir OLAY değil, bakış değişikliği.
};

// ---- ⚠ UZAKTAKİ OLAY ELDE ZİL OLMASIN ----
//
// `hepsi` kapsamında bu baştan da gürültülüydü; 2026-08-12'de yapay zekânın fetih sayısı
// **241'den 925'e** çıkınca (bkz. `veri/mod-simulasyon.md`) telefon tur başına onlarca kez
// titreyecek hâle geldi. Hissiyatı artırmanın ilk şartı, hissettirilecek şeyi SEÇMEK:
// her şey titrerse hiçbir şey titremiyor demektir.
const UZAKTA_SUS = ['fetih', 'bozgun', 'cekilme', 'imha'];

// Şiddet merdiveni. `uyari`/`basari`/`hata` merdivende DEĞİL — onlar bildirim türü,
// şiddet kademesi değil; bir kademe "yukarısı" yok.
const MERDIVEN = ['hafif', 'orta', 'agir'];
export function kademe(bicim, adim) {
  const i = MERDIVEN.indexOf(bicim);
  if (i < 0) return bicim;
  return MERDIVEN[Math.min(MERDIVEN.length - 1, Math.max(0, i + adim))];
}

// ---- ŞİDDET KAYIPLA ÖLÇEKLENİYOR ----
// `vurus` her raunt 'hafif' idi: 1 birimin düştüğü çarpışma ile 6 birimin düştüğü raunt
// aynı tık. Muharebenin ağırlığı elde hiç hissedilmiyordu.
//
// Eşikler BURADA, `denge.js`'te değil: bunlar oyunun matematiğine girmiyor, yalnızca aynı
// olayın ne kadar sert DUYULACAĞINI söylüyorlar. `denge.js` oyunu tutar, bu dosya hissi.
export const VURUS_ORTA = 2;
export const VURUS_AGIR = 4;

// Bir desende en fazla kaç darbe olur. Desen bir tremolo değil, bir VURGU: üçten fazlası
// "titreşim" olmaktan çıkıp "alarm" oluyor.
export const EN_COK_DARBE = 3;

// Olayın deseni: sırayla çalınacak biçimler. Boş dizi = titreşim yok.
//
// TABLO DEĞİL FONKSİYON, çünkü üç eksene birden bakıyor (yukarıdaki nota bak). Sabit bir
// tablo "6 birim düştü" ile "1 birim düştü" arasındaki farkı anlatamaz.
export function olayDeseni(olay) {
  if (!olay) return [];
  const temel = OLAY_TITRESIMI[olay.tip];
  if (!temel) return [];

  // 1. UZAKTAKİ OLAY: seni ilgilendirmiyorsa ya sön ya sus.
  // ⚠ `olay.benim === false` diye bakılıyor, `!olay.benim` diye DEĞİL: damga yoksa
  // (eski kayıt, elle kurulmuş olay) olayı susturmak yerine eski davranış korunuyor.
  if (UZAKTA_SUS.includes(olay.tip) && olay.benim === false) {
    // Fetih uzakta da olsa dünyanın döndüğünü hissettirir — ama en hafifinden, tek darbe.
    return olay.tip === 'fetih' ? ['hafif'] : [];
  }

  switch (olay.tip) {
    // 2. ŞİDDET KAYIPLA: raundun ağırlığı elde hissedilsin.
    case 'vurus': {
      const dusen = (olay.saldiranKayip || 0) + (olay.savunanKayip || 0);
      if (dusen === 0) return []; // kayıpsız raunt = "bir şey olmadı"
      if (dusen >= VURUS_AGIR) return ['agir'];
      if (dusen >= VURUS_ORTA) return ['orta'];
      return ['hafif'];
    }

    // 3. KİMİN BAŞINA GELDİ: senin ordunun yok olmasıyla düşmanınkinin yok olması aynı
    // şey değil. İkisi de 'agir' bir tık'tı; artık biri yıkım, öteki zafer.
    case 'imha':
      return olay.bana ? ['agir', 'agir'] : ['basari', 'orta'];
    case 'bozgun':
    case 'cekilme':
      return olay.bana ? ['uyari'] : ['hafif'];

    // 4. İL ANLARI: oyunun en duygusal iki olayı (§4.4: "il duygusal birim"), vurgulu desen.
    case 'ilTamamlandi':
      return ['basari', 'agir'];
    case 'ilKaybedildi':
      return ['hata', 'agir'];

    // 5. DÜELLO: iki rakip, iki darbe.
    case 'duello':
      return ['agir', 'agir'];

    // 6. SAVAŞ: senin savaşın bir kademe daha sert açılıyor.
    case 'savas':
      return [olay.benim ? kademe(temel, +1) : temel];

    default:
      return [temel];
  }
}
