// ÖDÜL MOTORU — ödüllü reklamın oyun tarafı (Görev 19 / Adım 1).
//
// ┌─ YENİ KIRMIZI ÇİZGİ: ÜSTÜNLÜK SATILMAZ, İKİNCİ ŞANS SATILIR ────────────────────────┐
// │ `reklam.js`'in eski çizgisi "ödül asla oyun içi güç olamaz"dı ve ödüller ona göre     │
// │ seçilmişti (savaş tekrarı, tur analizi, kozmetik deneme). Baki 2026-09-17'de bunu     │
// │ OYUNCU GÖZÜYLE reddetti: o ödüller reklam izlemeye değmiyor.                          │
// │                                                                                      │
// │ Yeni çizgi: ödül HATA YAPAN oyuncuya hatasını düzeltme imkânı verir; kalıcı güç,      │
// │ kalıcı bonus, kalıcı bilgi vermez. "Geri al" bir üstünlük değil, bir ikinci şanstır.  │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ÜÇ KORUMA (üçü de bu dosyada, tek kapıda) ----
//
//   1. YALNIZCA TEK OYUNCULU. İnsan rakipli maçta ikinci şans adaleti bozar.
//   2. MAÇ BAŞINA SINIR (`DENGE.ODUL.MAC_BASINA`). İkinci şansın değeri kıtlığından gelir.
//   3. MEYDAN OKUMA VE DERECELİ KAPALI (`DENGE.ODUL.KAPALI_MODLAR`). Orada herkesin aynı
//      şartta olması ölçümün kendisi.
//
// ⚠ BU DOSYA REKLAMI TANIMAZ. Reklamın gösterilmesi `reklam.js`'in işi (SDK, anahtar);
// burada yalnızca "ödül kullanılabilir mi" ve "kullanıldı" var. Ayrım bilinçli: reklam
// SDK'sı gelmeden ödüllerin kuralı yazılabilsin ve test edilebilsin.

import { DENGE } from '../denge.js';

const O = DENGE.ODUL;

// Dört ödül. `etki` alanı ekranda yazacak tek cümle — metin uydurulmasın diye burada.
//
// ⚠ HER ÖDÜL "İKİNCİ ŞANS" SINAVINDAN GEÇTİ: bu ödül bana kalıcı bir üstünlük veriyor mu?
// Cevap "evet" olan hiçbir şey listeye girmedi (bkz. `reklam.js` YASAK_ODULLER).
export const ODULLER = {
  yenilgidenDon: {
    ad: 'Yenilgiden dön',
    etki: 'Kaybettiğin maçta ' + O.GERI_TUR + ' tur öncesine dönersin.',
    // Yalnızca maç kaybedilmişken anlamlı: sonuç ekranından açılıyor.
    yenilgide: true,
  },
  turuGeriAl: {
    ad: 'Turu geri al',
    etki: 'Son turun başına dönersin; hamlelerini yeniden yaparsın.',
  },
  casusRaporu: {
    ad: 'Casus raporu',
    etki: 'Bir rakibin ordusunu ve araştırmasını görürsün.',
  },
  acilSeferberlik: {
    ad: 'Acil seferberlik',
    etki: 'Bu tur üretim sınırını bir kez aşarsın.',
  },
};

// Bu maçta kaç ödül kullanıldı.
export function kullanilanOdul(durum) {
  return ((durum && durum.sayaclar) || {}).odul || 0;
}

// Kalan hak.
export function kalanOdul(durum) {
  return Math.max(0, O.MAC_BASINA - kullanilanOdul(durum));
}

// Maçın modu ödüllere kapalı mı? Kapsam ve kazanma koşulu değil, MOD TİPİ sorgulanıyor —
// meydan okuma ve dereceli ileride bu ad altında gelecek (`DENGE.ODUL.KAPALI_MODLAR`).
export function modKapaliMi(durum) {
  const tip = ((durum && durum.mod) || {}).tip;
  return !!tip && O.KAPALI_MODLAR.includes(tip);
}

// Ödül şu an kullanılabilir mi?
//
// Dönen: { ok: true } | { ok: false, kod, sebep }
//   yok      → böyle bir ödül tanımlı değil
//   mod      → bu maç türünde ödüller kapalı
//   hak      → maç başına sınır doldu
//   yenilgi  → "yenilgiden dön" yalnızca maç kaybedilmişken kullanılabilir
export function odulKullanilabilirMi(durum, anahtar) {
  const odul = ODULLER[anahtar];
  if (!odul) return { ok: false, kod: 'yok', sebep: 'Böyle bir ödül yok.' };

  if (modKapaliMi(durum))
    return {
      ok: false,
      kod: 'mod',
      sebep: 'Bu maç türünde ödüller kapalı — herkes aynı şartlarda oynuyor.',
    };

  if (kalanOdul(durum) <= 0)
    return {
      ok: false,
      kod: 'hak',
      sebep: 'Bu maçta ödül hakkın doldu (' + O.MAC_BASINA + ' kullanım).',
    };

  // Maç kaybedilmiş mi: `durum.sonuc` bir METİNDİR — 'kazandi' | 'yenildi' (`turDongusu.js`
  // `sonucKontrol`un `sonuc` alanını yazıyor). ⚠ `basarimlar.js` bunu bir nesne sanıyordu ve
  // yedi mühür yüzünden hiç kazanılamıyordu; aynı tuzağa düşülmesin diye burada yazılı.
  const yenilgi = durum.sonuc === 'yenildi';
  if (odul.yenilgide && !yenilgi)
    return {
      ok: false,
      kod: 'yenilgi',
      sebep: 'Bu ödül yalnızca maçı kaybettiğinde kullanılabilir.',
    };

  return { ok: true };
}

// Ödül kullanıldı: sayacı bir artırır ve YENİ durum döndürür.
//
// ⚠ ÖDÜLÜN KENDİ ETKİSİ BURADA UYGULANMAZ. Sayaç ile etki ayrı tutuluyor çünkü etkiler
// birbirine hiç benzemiyor: "turu geri al" bir anlık görüntüye dönüyor (kanca), "casus
// raporu" bir ekran açıyor, "acil seferberlik" üretim kapısını bir kez gevşetiyor. Tek
// fonksiyona sığdırmak dört ayrı kuralı tek yere yığmak olurdu.
export function odulKullan(durum, anahtar) {
  const gecerli = odulKullanilabilirMi(durum, anahtar);
  if (!gecerli.ok) return { ok: false, kod: gecerli.kod, sebep: gecerli.sebep, durum };

  const sayaclar = { ...(durum.sayaclar || {}), odul: kullanilanOdul(durum) + 1 };
  return { ok: true, durum: { ...durum, sayaclar } };
}

// ---- ⚠ SAYAÇ GERİ SARILMAZ ----
//
// "Turu geri al" ve "yenilgiden dön" eski bir ANLIK GÖRÜNTÜYE dönüyor — ve o görüntüde
// ödül sayacı da eski hâlinde. Olduğu gibi bırakılsaydı ödül kendi bedelini silerdi:
// geri al → sayaç eski → sınırsız geri alma. Bu fonksiyon sayacı ileri taşıyor.
//
// Aynı mantık casus raporuna da uygulanıyor: geri dönülen turda kazanılmış bilgi
// silinmemeli (`casus` listesi de taşınıyor) — oyuncu ödülünü iki kez ödemesin.
export function sayaciTasi(hedefDurum, kaynakDurum) {
  const sayaclar = {
    ...(hedefDurum.sayaclar || {}),
    odul: Math.max(kullanilanOdul(hedefDurum), kullanilanOdul(kaynakDurum)),
  };
  const casus = Array.from(new Set([...(hedefDurum.casus || []), ...(kaynakDurum.casus || [])]));
  return { ...hedefDurum, sayaclar, casus };
}

// Bu maçta hiç ödül kullanılmadı mı? TEMİZ ZAFER mührünün ölçüsü.
export function temizMi(durum) {
  return kullanilanOdul(durum) === 0;
}
