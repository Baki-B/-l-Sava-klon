// KOMUTAN — haritadaki tek işaret (Görev 16 / Adım 4).
//
// ┌─ BİR BİRİM DEĞİL, BİR İŞARET ───────────────────────────────────────────────────────┐
// │ Yeni birim türü açılmadı. Her aktörün TEK komutanı var; bir parçada durur, oradan     │
// │ çıkan orduyla birlikte gider ve bulunduğu orduya MORAL KALEMİ verir. Etki, kutsal     │
// │ düellonun kullandığı kanalın aynısından geçiyor (§3.8) — yeni muharebe formülü YOK.  │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// VERİ YAPISI (durum.komutanlar):
//
//   komutanlar['16'] = { parcaId: '16-1', bekleme: 0, atama: 1 }
//                        │              │           └── bu tur kaç kez atandı (turluk hak)
//                        │              └── ordusu bozulduysa kaç tur atanamaz
//                        └── hangi parçada duruyor (null olamaz: kayıt varsa parça var)
//
// Yetenekler (dört çeşit × üç kademe) Adım 5'in işi; bu adımda komutanın kendisi var,
// yeteneği yok. `yetenek` alanı bilerek yazılmıyor — kullanılmayan alan kayıtta durmaz.
//
// ---- ÜÇ DEĞİŞMEZ KURAL ----
//
//   1. KOMUTAN ORDUSUZ PARÇADA DURMAZ. Atama ordunun olduğu parçaya yapılır; ordu giderse
//      komutan onunla gider ya da (gitmiyorsa) yerinde kalır — ama parça elden çıkarsa
//      kayıt düşer (`komutanDustu`).
//   2. BEKLEME SIFIRLANMADAN ATAMA YOK. Bozulan ordunun komutanı ceza süresini bitirmeli.
//   3. TURLUK HAK. `atama` sayacı tur sonunda sıfırlanır (`komutanTuruBitir`).

import { DENGE } from '../denge.js';
import { parcaOrdusu } from './ordu.js';

const K = DENGE.KOMUTAN;

// Aktörün komutan kaydı (yoksa null).
export function komutanAl(durum, aktorId) {
  return ((durum && durum.komutanlar) || {})[aktorId] || null;
}

// Komutan bu parçada mı?
export function komutanBurada(durum, aktorId, parcaId) {
  const k = komutanAl(durum, aktorId);
  return !!k && k.parcaId === parcaId;
}

// Muharebeye giren tarafa komutandan gelen MORAL KALEMİ. Tek kapı: hem çözüm hem savaş
// odasındaki tahmin buradan geçiyor, yani ekranda görünen ile olan şey ayrışamaz.
export function komutanKalemi(durum, aktorId, parcaId) {
  if (!K.ACIK) return 0;
  return komutanBurada(durum, aktorId, parcaId) ? K.MORAL_KALEMI : 0;
}

// Komutan atanabilir mi?
//
// Dönen: { ok: true } | { ok: false, kod, sebep }
//   sahiplik → parça senin değil ya da orada ordun yok
//   bekleme  → ordusu bozulan komutan ceza süresini bitirmedi
//   hak      → bu tur atama hakkı doldu
export function atamaGecerliMi(durum, aktorId, parcaId) {
  // Anahtar kapalıysa komutan diye bir şey yok (Adım 7 ölçümü).
  if (!K.ACIK) return { ok: false, kod: 'kapali', sebep: 'Komutan bu oyunda kapalı.' };
  // ---- SIRA ÖNEMLİ: ÖNCE KOMUTANIN DURUMU, SONRA PARÇA ----
  // Komutan cezalıyken oyuncunun hangi parçaya dokunduğu ikincildir; "burada ordun yok"
  // demek soruyu yanlış cevaplamak olur. Test bu sırayı kilitliyor (bozgundan sonra
  // ordunun çıktığı parça zaten boşalıyor).
  const k = komutanAl(durum, aktorId);
  if (k && k.bekleme > 0)
    return {
      ok: false,
      kod: 'bekleme',
      sebep: 'Komutanın ordusu bozuldu. ' + k.bekleme + ' tur sonra yeniden atayabilirsin.',
    };
  if (k && (k.atama || 0) >= K.TUR_BASINA_ATAMA)
    return {
      ok: false,
      kod: 'hak',
      sebep: 'Komutanı bu tur bir kez yerleştirdin. Sonraki tur yeniden atayabilirsin.',
    };

  const ordu = parcaOrdusu(durum, parcaId);
  if (durum.parcaSahipligi[parcaId] !== aktorId || !ordu || ordu.sahip !== aktorId)
    return { ok: false, kod: 'sahiplik', sebep: 'Komutan ancak kendi ordunun başına geçer.' };

  return { ok: true };
}

// Komutanı bir parçaya atar. YENİ durum döndürür; reddedilirse durum değişmez.
//
// `secim` (Görev 16 / Adım 5): { yetenek, kademe, birim }. Verilmezse komutanın mevcut
// yeteneği korunur — atama yer değiştirmektir, yetenek sıfırlamak değil.
//
// ⚠ KADEME BURADA DOĞRULANMIYOR. Hangi kademenin açık olduğu MÜHÜRLERE bakıyor, mühürler
// ise `durum`un dışında (cihazda). Motor onu bilemez ve bilmemeli — `src/oyun/*` depolamayı
// tanımaz (CLAUDE.md §3). Kademeyi kanca seçip buraya veri olarak geçiriyor; motor yalnızca
// aralığa kırpıyor (`yetenek.js kademeKirp`). Gerekçe: `docs/HATA-AVI-2026-09-20.md` §3.
export function komutanAta(durum, aktorId, parcaId, secim) {
  const gecerli = atamaGecerliMi(durum, aktorId, parcaId);
  if (!gecerli.ok) return { ok: false, kod: gecerli.kod, sebep: gecerli.sebep, durum };

  const k = komutanAl(durum, aktorId);
  const s = secim || {};
  const yeni = {
    parcaId,
    bekleme: 0,
    atama: ((k && k.atama) || 0) + 1,
    yetenek: s.yetenek !== undefined ? s.yetenek : (k && k.yetenek) || null,
    kademe: s.kademe !== undefined ? s.kademe : (k && k.kademe) || 1,
    birim: s.birim !== undefined ? s.birim : (k && k.birim) || null,
  };
  return {
    ok: true,
    durum: { ...durum, komutanlar: { ...(durum.komutanlar || {}), [aktorId]: yeni } },
  };
}

// Komutanı başka bir parçaya TAŞIR — atama hakkı harcanmaz.
//
// ⚠ ATAMA İLE TAŞIMA AYRI: atama oyuncunun kararı ve turluk hakkı var; taşıma ordunun
// hareketinin sonucu ("komutan da gitsin" işaretliyse). İkisi tek fonksiyon olsaydı
// komutanla hareket eden oyuncu atama hakkını da yakardı.
export function komutanTasi(durum, aktorId, hedefParca) {
  const k = komutanAl(durum, aktorId);
  if (!k) return durum;
  return {
    ...durum,
    komutanlar: { ...(durum.komutanlar || {}), [aktorId]: { ...k, parcaId: hedefParca } },
  };
}

// Komutanın ordusu bozuldu ya da imha oldu: komutan sahadan çekilir ve bekleme başlar.
// Esir düşme / ölme YOK (Baki'nin kararı) — bekleme cezanın tamamı.
// ⚠ YETENEK KORUNUYOR (`...k` ile). Kayıt burada sıfırdan kurulsaydı yetenek sessizce
// düşerdi: komutanın ordusu bir kez bozulan oyuncu, yeniden atadığında yeteneğini kaybetmiş
// olurdu. Ceza BEKLEME'dir, yeteneği unutmak değil.
export function komutanDustu(durum, aktorId) {
  const k = komutanAl(durum, aktorId);
  if (!k) return durum;
  return {
    ...durum,
    komutanlar: {
      ...(durum.komutanlar || {}),
      [aktorId]: { ...k, parcaId: null, bekleme: K.BEKLEME, atama: k.atama || 0 },
    },
  };
}

// Tur sonu bakımı: bekleme bir azalır, atama hakkı yenilenir.
// Parçası elden çıkmış komutan da burada düşer — kayıt gerçeğe uymayan bir yer göstermesin.
export function komutanTuruBitir(durum) {
  const mevcut = durum.komutanlar || {};
  const idler = Object.keys(mevcut);
  if (idler.length === 0) return durum;

  const yeni = {};
  for (const id of idler) {
    const k = mevcut[id];
    const parcaBizde = k.parcaId && durum.parcaSahipligi[k.parcaId] === id;
    // `...k` ŞART: yetenek/kademe/birim tur dönünce düşmesin (Adım 5). Sıfırdan kurulan
    // kayıt her tur yeteneği siler ve yetenek yalnızca atandığı turda çalışırdı.
    yeni[id] = {
      ...k,
      parcaId: parcaBizde ? k.parcaId : null,
      bekleme: Math.max(0, (k.bekleme || 0) - 1),
      atama: 0,
    };
  }
  return { ...durum, komutanlar: yeni };
}

// Kayda yazılacak komutan kaydı: hiçbir alanı anlamlı değilse `undefined`.
// (`kayitKadrosu` / `kayitHamlesi` kalıbı — boş alan kayıtta durmaz.)
export function kayitKomutanlari(komutanlar) {
  const mevcut = komutanlar || {};
  const yeni = {};
  for (const id of Object.keys(mevcut)) {
    const k = mevcut[id];
    if (!k) continue;
    if (!k.parcaId && !(k.bekleme > 0)) continue; // ne sahada ne cezada: kayda gerek yok
    const satir = { parcaId: k.parcaId || null };
    if (k.bekleme > 0) satir.bekleme = k.bekleme;
    if (k.atama > 0) satir.atama = k.atama;
    // YETENEK (Adım 5): yalnızca varsa yazılıyor — `kayitKadrosu`/`kayitHamlesi` kalıbı,
    // boş alan kayıtta durmaz. `birim` yalnızca Silah Ustası için anlamlı, o yüzden
    // yeteneğe bağlı yazılıyor: diğer üç yetenekte kayda hiç girmiyor.
    if (k.yetenek) {
      satir.yetenek = k.yetenek;
      satir.kademe = k.kademe || 1;
      if (k.yetenek === 'silahUstasi' && k.birim) satir.birim = k.birim;
    }
    yeni[id] = satir;
  }
  return Object.keys(yeni).length > 0 ? yeni : undefined;
}

// ---- YAPAY ZEKÂNIN KOMUTAN KARARI ----
//
// TEK KURAL: en kalabalık ordunun başına geç. Gizli bonus yok, oyuncuyla aynı kapıdan
// (`komutanAta`) geçiyor — "tek beyin" kuralı (§9.1).
// Eşitlikte parça kimliği sırası karar veriyor: belirlenimci kalsın.
export function zekaKomutanParcasi(durum, aktorId) {
  let en = null,
    enSayi = 0;
  for (const parcaId of Object.keys(durum.ordular || {}).sort()) {
    const o = durum.ordular[parcaId];
    if (!o || o.sahip !== aktorId) continue;
    if (durum.parcaSahipligi[parcaId] !== aktorId) continue;
    let sayi = 0;
    for (const tur of DENGE.BIRIM_SIRASI) sayi += o.birimler[tur] || 0;
    if (sayi > enSayi) {
      enSayi = sayi;
      en = parcaId;
    }
  }
  return en;
}
