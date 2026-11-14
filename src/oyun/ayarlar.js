// CİHAZ AYARLARI — gösterim, titreşim, ses (Görev 08 / §6/10 ve §7).
//
// ┌─ KAYITTAN AYRI TUTULUYOR ───────────────────────────────────────────────────────────┐
// │ Görev belgesi §7: *"Ayarlar (ses, titreşim, hız) kayıttan ayrı tutulur: farklı       │
// │ oyunlar arasında taşınmalı, kayıt boyutuna girmemeli."*                              │
// │                                                                                      │
// │ İki gerekçe de somut:                                                                │
// │   • Bunlar OYUN DURUMU değil CİHAZ TERCİHİ. Titreşimi kapatan biri yeni oyuna        │
// │     başlayınca titreşimin geri gelmesini beklemez.                                   │
// │   • Kayıt 15 turda 25.2 KB ve sınır 26 (Görev 07 §11/4). Her alan o sınırı zorluyor. │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// Depolama `kayit.js`'in kalıbının aynısı: AsyncStorage, ayrı anahtar, hata yutuluyor.
// Ayar okunamazsa oyun varsayılanlarla açılır — bir tercihin kaybolması oyunu durdurmaz.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DENGE } from '../denge.js';
import { SES_HAZIR } from '../sahne/ses.js';

const ANAHTAR = 'ilsavasi.ayarlar';

// gosterim: 'kapali' | 'cephem' | 'hepsi'  (DENGE.SAHNE.KAPSAM_SIRASI)
// titresim: açık/kapalı
// ses:      açık/kapalı — ses katmanı hazır DEĞİLKEN her zaman kapalı (bkz. sahne/ses.js)
//
// ⚠ `emirIpucu` KALKTI (Görev 20 / Adım 0). Savaş odasındaki "emirler tur bitince çözülür"
// notunu bir kez göstermek içindi; not Görev 15'ten beri yanlıştı ve kaldırıldı. Eski
// cihazlarda kayıtlı değer zararsız: `temizle` tanımadığı alanı zaten okumuyor.
//
// ⚠ `haritaMotoru` KALKTI (GOREV-20 Adım 9, 2026-09-25): eski SVG haritası emekliye ayrıldı,
// tek harita Skia. Eski cihazlarda kayıtlı değer zararsız: `temizle` onu okumuyor.

export const VARSAYILAN_AYARLAR = {
  gosterim: DENGE.SAHNE.VARSAYILAN_KAPSAM,
  titresim: true,
  ses: SES_HAZIR,
};

// Okunan değerleri DOĞRULAR. Eski bir sürümden kalan ya da elle bozulmuş bir ayar
// (`gosterim: 'hizli'` gibi) sahneyi sessizce kapatırdı; tanınmayan değer varsayılana düşer.
function temizle(ham) {
  if (!ham || typeof ham !== 'object') return { ...VARSAYILAN_AYARLAR };
  return {
    gosterim: DENGE.SAHNE.KAPSAM_SIRASI.includes(ham.gosterim)
      ? ham.gosterim
      : VARSAYILAN_AYARLAR.gosterim,
    titresim: typeof ham.titresim === 'boolean' ? ham.titresim : VARSAYILAN_AYARLAR.titresim,
    ses: SES_HAZIR && typeof ham.ses === 'boolean' ? ham.ses : VARSAYILAN_AYARLAR.ses,
  };
}

export async function ayarlariOku() {
  try {
    const metin = await AsyncStorage.getItem(ANAHTAR);
    return temizle(metin ? JSON.parse(metin) : null);
  } catch (e) {
    return { ...VARSAYILAN_AYARLAR };
  }
}

export async function ayarlariYaz(ayarlar) {
  try {
    await AsyncStorage.setItem(ANAHTAR, JSON.stringify(temizle(ayarlar)));
    return true;
  } catch (e) {
    return false;
  }
}

// ---- AYAR MENÜSÜNÜN METİNLERİ (2026-08-01, yayın için sadeleştirildi) ----
//
// > Baki: *"Ayarlar kısmında seninle teknik tasarımda konuştuğumuz cümleler var, onları
// > oyuncuya sunulacak cinsten cümlelere çevir."*
//
// Metinler burada, ekranda değil: aynı cümle hem düğmede hem açıklamada geçiyor ve iki
// yerde tutmak ilkini değiştirip ötekini unutmanın kestirme yolu.
//
// ÜÇ KURAL (`docs/il-savasi-tasarim.md` sade dil tercihi):
//   • Oyuncuya SAYI değil HİS anlatılır — "2 saniye" değil, "ne izleyeceğin".
//   • Geliştirici gerekçesi ekrana çıkmaz. "Sonuç değişmez", "gizli bonus yok", "manşet"
//     gibi ifadeler bana konuşan cümlelerdi; oyuncu onları merak etmiyor.
//   • Oyunun kendi kelimeleri kullanılır: BÖLGE (parça değil), İL, ORDU, TUR.
export const GOSTERIM_ETIKETLERI = {
  kapali: {
    ad: 'KAPALI',
    aciklama: 'Savaşlar bir anda biter. Sonucu doğrudan raporda okursun.',
  },
  cephem: {
    ad: 'CEPHEM',
    aciklama: 'Kendi savaşlarını baştan sona izlersin. Uzaktakiler rapora yazılır.',
  },
  hepsi: {
    ad: 'HEPSİ',
    aciklama: 'Rakiplerin savaşlarını da haritada görürsün. Turlar daha uzun sürer.',
  },
};
