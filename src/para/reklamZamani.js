// REKLAM ZAMANI — ara reklam ne zaman gösterilir (Görev 19 / Adım 3).
//
// ┌─ SDK YOK, KURAL VAR ────────────────────────────────────────────────────────────────┐
// │ Bu dosya hiçbir reklam göstermez; yalnızca "şimdi gösterilebilir mi" sorusunu         │
// │ cevaplar. Reklamın kendisi `reklam.js`'in işi ve o hâlâ kapalı (`REKLAM_HAZIR`).      │
// │ Ayrım bilinçli: kural SDK'dan önce yazılıp test edilebilsin, SDK gelince yalnızca     │
// │ "göster" satırı eklensin.                                                            │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ⚠ İKİ ŞART BİRDEN (Baki, 2026-09-17: "5–10 turda bir reklam") ----
//
// "En az N tur" VE "en az M saniye". Tek başına tur sayısına bakılsaydı hızlı oynayan biri
// üç dakikada iki reklam görürdü; tek başına süreye bakılsaydı tek turu uzun süren oyuncu
// turun ortasında reklam yerdi. İkisi birden, ikisi de `DENGE.REKLAM`'da.
//
// ---- NEREDE GÖSTERİLİR ----
//
// TUR PERDESİNDE (`TurPerdesi`): tur gösterisi bitmiş, yeni tur başlamamıştır — oyuncu
// zaten bekliyordur. Bir kararın ortasında ya da savaş gösterisinin üstünde ASLA.
//
// ---- DURUM NEREDE TUTULUYOR ----
//
// `durum` değil, CİHAZ tarafında (kancanın belleği): son reklamın turu ve zamanı bir maça
// değil oturuma ait. Kayda girmiyor — kaydı yükleyen oyuncuya "borcun var" demek anlamsız.

import { DENGE } from '../denge.js';

const R = DENGE.REKLAM;

// Boş takip kaydı. `turuBitir`den sonra kancadan çağrılır.
export function yeniTakip() {
  return { sonTur: 0, sonZaman: 0 };
}

// Ara reklam şimdi gösterilebilir mi?
//
//   takip     → { sonTur, sonZaman }  (yeniTakip)
//   tur       → oyunun şu anki turu
//   simdi     → Date.now() (test edilebilsin diye dışarıdan veriliyor)
//   macSayisi → cihazda bitirilen maç sayısı (ilk maç reklamsız)
//   paket     → Komutan Paketi alındı mı (reklamsız sürüm)
//
// Dönen: { ok: true } | { ok: false, kod }
//   paket  → reklamsız sürüm
//   ilkMac → ilk maçta reklam yok
//   tur    → yeterli tur geçmedi
//   sure   → yeterli süre geçmedi
export function araReklamGosterilebilirMi({ takip, tur, simdi, macSayisi, paket }) {
  if (paket) return { ok: false, kod: 'paket' };
  if (R.ILK_MAC_REKLAMSIZ && (macSayisi || 0) < 1) return { ok: false, kod: 'ilkMac' };

  const t = takip || yeniTakip();
  // İLK REKLAM DA ŞARTA TABİ: `sonTur` 0'ken "8 tur geçti mi" sorusu turun kendisine
  // bakıyor, yani maçın ilk sekiz turu da reklamsız. Bu bilinçli — maça reklamla
  // başlamak, ilk izlenimi harcamanın en hızlı yolu.
  if (tur - t.sonTur < R.EN_AZ_TUR) return { ok: false, kod: 'tur' };
  if (((simdi || 0) - (t.sonZaman || 0)) / 1000 < R.EN_AZ_SANIYE) return { ok: false, kod: 'sure' };
  return { ok: true };
}

// Reklam gösterildi: takip kaydını ilerlet.
export function reklamGosterildi(takip, tur, simdi) {
  return { sonTur: tur, sonZaman: simdi || 0 };
}

// Maç sonu reklamı ayrı bir sorudur: sonuç ekranından ana menüye dönerken gösterilir ve
// TUR SINIRINA TAKILMAZ (maç sonu zaten doğal bir duraktır). Yalnızca iki şey engeller:
// reklamsız paket ve "ilk maç reklamsız" kuralı.
export function macSonuGosterilebilirMi({ macSayisi, paket }) {
  if (!R.MAC_SONU_ACIK) return { ok: false, kod: 'kapali' };
  if (paket) return { ok: false, kod: 'paket' };
  if (R.ILK_MAC_REKLAMSIZ && (macSayisi || 0) < 1) return { ok: false, kod: 'ilkMac' };
  return { ok: true };
}
