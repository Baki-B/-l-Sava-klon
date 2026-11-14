// KAYIT / YÜKLEME — oyunu cihaz belleğine yazar ve geri okur (Görev 03 §7 Adım 5).
//
// ---- ÜÇ YUVA (Görev 09 / Soru 5 → Baki'nin cevabı A) ----
//
// Görev 03'ten beri tek yuva vardı ve mod sistemine kadar yetiyordu. Artık yetmiyor:
// oyuncu farklı modlarda farklı maçlar oynayacak ve tek yuva, yeni maç başlatmayı
// "eskisini GERİ DÖNÜLMEZ biçimde sil" hâline getirirdi — §8.1 kayıt/yüklemeyi çekirdek
// özellik ilan etmişken kötü bir tercih.
//
// YUVA SAYISI `DENGE.MOD.YUVA_SAYISI`'nda ve ÜCRETSİZ KALACAK: §12.3 bunu 2026-07-23'te
// karara bağladı ("kayıt yuvası satılabilirler listesinden çıkarıldı"). Görev 10'un para
// kazanma katmanı buraya dokunmayacak.
//
// ---- ÖZET AYRI ANAHTARDA TUTULMUYOR ----
// Ana menünün yuva listesi (mod, tur, ilerleme) kaydın KENDİSİNDEN okunuyor. İkinci bir
// "özet" kaydı tutmak, iki kaydın ayrışabileceği ilk yer olurdu (§10/4): menüde "tur 30"
// yazarken yüklenen oyun tur 12'de olabilirdi. Bedeli üç kaydı okumak — her biri ~22 KB,
// yalnızca menü açılırken ve tek seferlik.
//
// Metne çevirme ve doğrulama işi `kayitVerisi.js`'te (telefonsuz test edilebilsin diye);
// burada yalnızca depolama var.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DENGE } from '../denge.js';
import { kayitMetni, metinCoz } from './kayitVerisi.js';
import { modBilgisi } from './mod.js';
import { SENARYOLAR } from './senaryolar.js';

// Yuva anahtarları. ESKİ TEK YUVANIN ANAHTARI KORUNMUYOR (`ilsavasi.kayit.tek`): sürüm 9
// zaten sürüm 8 kayıtlarını reddediyor, yani o anahtarda okunabilir bir şey kalmadı.
const ANAHTAR = (yuva) => 'ilsavasi.kayit.' + yuva;
// "Devam et" hangi yuvayı açacak — en son oynanan (§6/10).
const SON_YUVA = 'ilsavasi.kayit.son';

export function yuvalar() {
  return Array.from({ length: DENGE.MOD.YUVA_SAYISI }, (_, i) => i);
}

function gecerliYuva(yuva) {
  return Number.isInteger(yuva) && yuva >= 0 && yuva < DENGE.MOD.YUVA_SAYISI;
}

// Dönen: { ok: true, boyutKB } veya { ok: false, hata }
export async function kaydet(durum, yuva) {
  const y = gecerliYuva(yuva) ? yuva : 0;
  try {
    const metin = kayitMetni(durum);
    await AsyncStorage.setItem(ANAHTAR(y), metin);
    await AsyncStorage.setItem(SON_YUVA, String(y));
    return { ok: true, boyutKB: metin.length / 1024, yuva: y };
  } catch (e) {
    return { ok: false, hata: 'Kaydedilemedi: ' + e.message };
  }
}

// Dönen: { ok: true, durum } veya { ok: false, hata }
export async function yukle(yuva) {
  const y = gecerliYuva(yuva) ? yuva : 0;
  try {
    const metin = await AsyncStorage.getItem(ANAHTAR(y));
    if (metin === null) return { ok: false, hata: 'Bu yuva boş.' };
    const s = metinCoz(metin);
    // YÜKLENEN YUVA "SON OYNANAN" OLUR. Yoksa oyuncu 2. yuvayı açıp oynadıktan sonra
    // "devam et" onu değil 1. yuvayı açardı — sessiz ve can sıkıcı bir hata.
    if (s.ok) await AsyncStorage.setItem(SON_YUVA, String(y));
    return s;
  } catch (e) {
    return { ok: false, hata: 'Kayıt okunamadı: ' + e.message };
  }
}

// Ana menünün yuva listesi. Her yuva için: dolu mu, hangi mod, kaçıncı tur, ilerleme.
// BOZUK KAYIT YUVAYI YUTMUYOR: okunamayan yuva `hata` alanıyla dönüyor ki oyuncu neden
// açılmadığını görsün ve üstüne yazabilsin (sessizce "boş" göstermek, kaydı yok saymaktır).
export async function yuvaOzetleri() {
  const cikti = [];
  for (const y of yuvalar()) {
    try {
      const metin = await AsyncStorage.getItem(ANAHTAR(y));
      if (metin === null) {
        cikti.push({ yuva: y, dolu: false });
        continue;
      }
      const s = metinCoz(metin);
      if (!s.ok) {
        cikti.push({ yuva: y, dolu: true, okunamiyor: true, hata: s.hata });
        continue;
      }
      const m = modBilgisi(s.durum);
      const kapsam = SENARYOLAR[m.kapsam];
      let benim = 0;
      for (const sahip of Object.values(s.durum.parcaSahipligi))
        if (sahip === s.durum.oyuncuAktorId) benim++;
      cikti.push({
        yuva: y,
        dolu: true,
        modAdi: m.ad,
        kapsamAdi: kapsam ? kapsam.ad : m.kapsam,
        tur: s.durum.tur,
        turSiniri: m.turSiniri,
        parca: benim,
        toplamParca: m.toplamParca,
        sonuc: s.durum.sonuc || null,
        boyutKB: metin.length / 1024,
      });
    } catch (e) {
      cikti.push({ yuva: y, dolu: false, hata: e.message });
    }
  }
  return cikti;
}

// "Devam et" hangi yuvayı açacak? Yuva yoksa null — düğme pasif olur ve sebebi yazılır
// (§6/10: "yuva yoksa düğme pasif ve sebebi yazılı").
export async function sonYuva() {
  try {
    const ham = await AsyncStorage.getItem(SON_YUVA);
    const y = ham === null ? null : Number(ham);
    if (y === null || !gecerliYuva(y)) return null;
    return (await AsyncStorage.getItem(ANAHTAR(y))) === null ? null : y;
  } catch (e) {
    return null;
  }
}

export async function kayitVarMi(yuva) {
  try {
    return (await AsyncStorage.getItem(ANAHTAR(gecerliYuva(yuva) ? yuva : 0))) !== null;
  } catch (e) {
    return false;
  }
}

export async function kaydiSil(yuva) {
  try {
    await AsyncStorage.removeItem(ANAHTAR(gecerliYuva(yuva) ? yuva : 0));
    return { ok: true };
  } catch (e) {
    return { ok: false, hata: 'Silinemedi: ' + e.message };
  }
}
