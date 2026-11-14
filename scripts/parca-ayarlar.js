// PARÇA ÜRETİM AYARLARI — elle verilmiş kararlar tek yerde.
// Hem `parca-uret.js` (asıl boru hattı) hem `parca-yeniden-bol.js` (yeniden bölümleme)
// buradan okur; ikisi ayrı listeler tutarsa er geç birbirinden kopar.

// BİRLEŞTİRME LİSTESİ BOŞ — 2026-07-26 yeniden bölümlemesinden sonra gerek kalmadı.
// Eski liste (Rize, Muğla, İstanbul + Görev 03B'nin 7 birleştirmesi) `parca-tablo.json`'ın
// içine işlendi: tablo artık 181 parçalık NİHAİ bölümlemeyi tutuyor, düzeltmeleri değil.
// Eski 195 parçalık tablo `veri/ham/parca-tablo-eski-195.json` olarak duruyor.
//
// Buraya yeni satır eklemek yerine bölümlemeyi `scripts/parca-yeniden-bol*.js` ile
// yeniden üretmek daha doğru — kaynak tek yerde kalsın.
const BIRLESTIR = {};

// Ad değişikliği de tabloya işlendi; liste boş.
const AD_DEGISTIR = {};

// Arazi elle geçersiz kılma (gerekçe: Rize'nin kimliği dağdır, tasarım §3.5/§5).
const ARAZI_ZORLA = {
  '53-1': 'daglik',
};

// Elle eklenen kısa kara sınırları (ham veriden doğrulandı — Görev 03B / Adım 0).
// Çatalca (İstanbul, 34-1 Avrupa Yakası) – Vize (Kırklareli, 39-2 Istranca).
// Not: yeniden bölümlemede İstanbul'un Avrupa parçası 34-2 iken 34-1 oldu.
const EK_KARA_SINIRI = [['34-1', '39-2']];

// Kopuk-parça temizliğinden muaf iller.
const KOPUK_ISTISNA = ['06']; // Ankara

module.exports = { BIRLESTIR, AD_DEGISTIR, ARAZI_ZORLA, EK_KARA_SINIRI, KOPUK_ISTISNA };
