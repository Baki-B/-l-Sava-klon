// TİTREŞİM — hissiyat katmanının en ucuz ve en doğrudan parçası (Görev 08 / Adım 3).
//
// ---- ⚠ SES ARTIK PLANDA YOK (2026-08-12, Baki: "oyuna ses eklemeyeceğim") ----
// 2026-08-01'de ses "ertelenmişti"; artık kalıcı karar. Yani titreşim, oyunun TEK duyusal
// kanalı — ertelenmiş bir şeyin yerine bakan geçici çözüm değil. Hissiyat bütçesinin
// tamamı buraya harcanıyor ve dosya o gözle yeniden yazıldı.
//
// ---- ÜÇ KURAL ----
//
// 1. HİÇBİR ÇAĞRI OYUNU DÜŞÜREMEZ. `expo-haptics` bazı cihazlarda ve web'de sessizce
//    çalışmıyor ya da hata fırlatıyor. Hepsi yutuluyor: titreşim bir SÜS, bir kanal değil.
//    Bir efektin içinden oyun durumunu değiştirmek yasak olduğu gibi (§10/7), bir efektin
//    oyunu çökertmesi de olacak şey değil.
//
// 2. AYAR KAPALIYSA HİÇ ÇAĞRILMAZ. Kapalıyken "hiç titreşim yok" §9'un bitiş ölçütü.
//
// 3. "NE HİSSEDİLMELİ" KARARI BU DOSYADA DEĞİL. Karar `titresimDeseni.js`'te ve orası
//    saf: hiçbir şey içe aktarmıyor, Node ile test edilebiliyor. Bu dosya yalnızca o
//    kararı CİHAZA ÇALIYOR. Ayrımın sebebi ölçülebilirlik — mantık burada dururken
//    `expo-haptics` yüzünden hiçbir testten erişilemiyordu.

import * as Haptics from 'expo-haptics';
import { olayDeseni, EN_COK_DARBE } from './titresimDeseni.js';

// Niyetten cihaz karşılığına. Tablonun kendisi `titresimDeseni.js`'te; burası çeviri.
function calistir(bicim) {
  switch (bicim) {
    case 'hafif':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'orta':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'agir':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    case 'uyari':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    case 'basari':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'hata':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    case 'secim':
      return Haptics.selectionAsync();
    default:
      return null;
  }
}

// Güvenli çağrı: hiçbir koşulda dışarı hata sızmaz (kural 1).
function guvenli(bicim) {
  try {
    const sonuc = calistir(bicim);
    if (sonuc && typeof sonuc.catch === 'function') sonuc.catch(() => {});
  } catch (e) {
    // Cihaz desteklemiyor ya da izin yok — titreşim susar, oyun devam eder.
  }
}

// ---- DESEN: BÜYÜK ANLAR TEK DARBEYLE ANLATILMIYOR ----
//
// Elde hissedilen fark yalnızca "ne kadar sert" değil, RİTİM: iki tok darbe "bitti" der,
// tek darbe "oldu" der. İl fethi, ordu imhası ve düello bu yüzden çok darbeli.
//
// ⚠ ZAMANLAYICI OYUN DURUMUNA DOKUNMAZ ve iptal edilmesi gerekmez: çıktısı yok, en kötü
// ihtimalle sahne kapandıktan sonra boşa bir titreşim olur. Kural 1'in devamı.
const DARBE_ARASI_MS = 90;

function desen(bicimler) {
  bicimler.slice(0, EN_COK_DARBE).forEach((bicim, i) => {
    if (i === 0) guvenli(bicim);
    else setTimeout(() => guvenli(bicim), i * DARBE_ARASI_MS);
  });
}

// Bir sahne olayının titreşimi. Hangi desenin çalınacağına `titresimDeseni.js` karar verir;
// sessiz geçen olaylar da onun kararı (kayıpsız raunt, uzaktaki bozgun).
export function olayTitresimi(olay, acik) {
  if (!acik || !olay) return;
  const d = olayDeseni(olay);
  if (d.length > 0) desen(d);
}

// ---- SAHNE DIŞI TİTREŞİMLER ----
// Emir vermek bir sahne olayı değil, ama §4.3/Katman 1'in ilk maddesi tam olarak bu:
// "emir verince hafif tık". Oyunun elde hissini asıl değiştiren şey burası — oyuncu
// gösteriyi kapatsa bile bu duruyor.
export function emirTitresimi(acik) {
  if (acik) guvenli('secim');
}

// Geçersiz emir / yetmeyen kaynak — kısa bir ret.
export function retTitresimi(acik) {
  if (acik) guvenli('uyari');
}

// ---- TURU BİTİR: TURUN AĞIRLIĞI ELDE HİSSEDİLSİN (2026-08-12) ----
// Turu bitirmek oyunun en büyük tek kararı — verdiğin bütün emirler aynı anda işliyor.
// Sıradan bir düğme tık'ıyla geçiyordu. İki darbelik "mühür" hissi veriyor.
export function turBitisTitresimi(acik) {
  if (acik) desen(['orta', 'agir']);
}
