// İL KOMŞULUK GRAFİĞİ ÜRETİCİ — veri/komsuluk.json üretir.
// Çalıştırma:  node scripts/komsuluk-uret.js
//
// Yöntem: Temel birim artık parça (tasarım §7). Bu yüzden il komşuluğunu doğrudan
// PARÇA komşuluğundan türetiyoruz: iki ilin herhangi iki parçası komşuysa, o iki il komşudur.
// Böylece komsuluk.json ile parca-komsuluk.json birbiriyle tutarlı kalır.
//
// ELLE EKLENEN KISA SINIR YOK — hepsi parça grafiğinden türüyor (Görev 03B / Adım 0).
// Tarihçe: Görev 02'de iki çift elle eklenmişti.
//   • İstanbul–Kırklareli: GERÇEK sınır (Çatalca–Vize). Artık parça grafiğinde
//     (parca-uret.js EK_KARA_SINIRI: 34-2 ~ 39-2), buradan otomatik türüyor.
//   • Kilis–Hatay: SINIR DEĞİLMİŞ. Ham veride aralarında 3.69 km boşluk var, araya
//     Gaziantep giriyor (Kilis–Antep ve Hatay–Antep temas ediyor, Kilis–Hatay etmiyor).
//     Baki'nin onayıyla 2026-07-26'da kaldırıldı.
//
// Kullanımı: (1) harita uzaklaşınca il seviyesi gösterim, (2) parça verisi değişirse
// veri-dogrula.js'in çapraz kontrolü. Oyun kuralı DEĞİL (saldırı kuralı parça komşuluğudur).

const fs = require('fs');
const path = require('path');

const VERI = path.join(__dirname, '..', 'veri');
const parcaKomsu = require(path.join(VERI, 'parca-komsuluk.json'));

// Elle eklenen il komşuluğu (boş — yukarıdaki nota bak).
const EK_KOMSU = [];

// parça komşuluğundan il komşuluğu türet
const g = {};
const ekle = (a, b) => {
  if (!g[a]) g[a] = new Set();
  g[a].add(b);
};
for (const a of Object.keys(parcaKomsu)) {
  const ka = a.split('-')[0];
  for (const b of parcaKomsu[a]) {
    const kb = b.split('-')[0];
    if (ka !== kb) {
      ekle(ka, kb);
      ekle(kb, ka);
    }
  }
}
for (const [a, b] of EK_KOMSU) {
  ekle(a, b);
  ekle(b, a);
}

// 01..81 sıralı, komşu listeleri de sıralı
const kodlar = Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, '0'));
const out = {};
for (const k of kodlar) out[k] = [...(g[k] || [])].sort();

// sıralı yaz (JS sayısal-string anahtarları yeniden sıralar; gövdeyi elle kur)
const govde = kodlar
  .map((k) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(out[k]))
  .join(',\n');
fs.writeFileSync(path.join(VERI, 'komsuluk.json'), '{\n' + govde + '\n}\n', 'utf8');

// özet
const ciftler = new Set();
let izole = 0;
for (const k of kodlar) {
  if (out[k].length === 0) izole++;
  for (const n of out[k]) ciftler.add([k, n].sort().join('~'));
}
console.log(
  'komsuluk.json yazıldı: ' + kodlar.length + ' il, ' + ciftler.size + ' komşuluk çifti.'
);
console.log(
  'Elle eklenen il komşuluğu: ' +
    (EK_KOMSU.length ? EK_KOMSU.map((e) => e.join('–')).join(', ') : 'yok (hepsi parçadan türüyor)')
);
console.log('İzole (komşusuz) il: ' + izole + ' (0 olmalı).');
