// TEMA KONTRAST ÖLÇÜMÜ
// Çalıştırma:  node scripts/tema-olcum.js
// Çıktı:       veri/tema-olcum.md  (+ ekrana özet)
//
// NİYE VAR. Görev 10A'nın en pahalı dersi: **zemin rengi değişince üstündeki HER ŞEYİN
// kontrastı yeniden ölçülmeli.** Bir turda ayraç çizgileri 1.21:1'e düşmüştü ve kimse fark
// etmedi — kutular kaldırıldığı için bilgiyi gruplayan tek şey o çizgilerdi, yani panel
// sessizce okunamaz hâle gelmişti. Gözle bakınca "biraz soluk" görünüyordu, o kadar.
//
// Bu yüzden oranlar artık yorumda YAZILI DEĞİL, ÖLÇÜLÜ. `tema.js`'te bir renk değişince
// bu betik çalıştırılır ve `veri/tema-olcum.md` yenilenir.
//
// ÖLÇÜ: WCAG 2.1 kontrast oranı. 1.0 = aynı renk, 21 = siyah/beyaz.
//   4.5:1  normal yazı için asgari (AA)
//   3.0:1  büyük yazı ve arayüz öğesi için asgari (AA)
//   7.0:1  normal yazı için en katı eşik (AAA)
// Çizgiler ve zemin katmanları bu eşiklerin ALTINDA olabilir — onlar okunacak yazı değil,
// "burada bir kenar var" diyen işaretler. Onlarda aranan şey 1.0'dan yeterince uzak olmak.

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const tema = require(path.join(KOK, 'src', 'tema.js'));
const { ZEMIN, CIZGI, YAZI_RENK, VURGU, DURUM, MENU_RENK, KAGIT, METAL } = tema;

// ---- WCAG 2.1 ----
const dogrusal = (k) => {
  k /= 255;
  return k <= 0.03928 ? k / 12.92 : Math.pow((k + 0.055) / 1.055, 2.4);
};
function parlaklik(hex) {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const r = parseInt(s.slice(0, 2), 16),
    g = parseInt(s.slice(2, 4), 16),
    b = parseInt(s.slice(4, 6), 16);
  return 0.2126 * dogrusal(r) + 0.7152 * dogrusal(g) + 0.0722 * dogrusal(b);
}
function oran(a, b) {
  const x = parlaklik(a),
    y = parlaklik(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// Ton farkı — düşük parlaklık kontrastını NEYİN taşıdığını gösterir. Kiremit vurgusu
// lacivert zeminde 1.76:1 ile zayıf görünüyor ama aralarında 161° var; göz onları
// parlaklıktan değil TONDAN ayırıyor. Bu sütun olmadan tablo yanlış alarm verir.
function tonAcisi(hex) {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  const r = parseInt(s.slice(0, 2), 16) / 255,
    g = parseInt(s.slice(2, 4), 16) / 255,
    b = parseInt(s.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  if (d === 0) return null; // gri — tonu yok
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60);
}
function tonFarki(a, b) {
  const x = tonAcisi(a),
    y = tonAcisi(b);
  if (x === null || y === null) return null;
  const d = Math.abs(x - y);
  return d > 180 ? 360 - d : d;
}

// ---- ÖLÇÜLECEKLER ----
// Her satır: ad · renk · hangi zeminin üstünde duruyor · beklenen asgari · ne olduğu
const ZEMIN_ADI = { cukur: 'ZEMIN.cukur', taban: 'ZEMIN.taban', yuzey: 'ZEMIN.yuzey' };
const OLCUMLER = [
  ['YAZI_RENK.birincil', YAZI_RENK.birincil, ZEMIN.yuzey, 7.0, 'başlık, sayı, karar'],
  ['YAZI_RENK.ikincil', YAZI_RENK.ikincil, ZEMIN.yuzey, 4.5, 'etiket, açıklama'],
  ['YAZI_RENK.soluk', YAZI_RENK.soluk, ZEMIN.yuzey, 3.0, 'birim, dipnot (bilerek zayıf)'],
  ['YAZI_RENK.birincil', YAZI_RENK.birincil, ZEMIN.cukur, 7.0, 'oyuk satırda başlık'],
  ['YAZI_RENK.ikincil', YAZI_RENK.ikincil, ZEMIN.cukur, 4.5, 'oyuk satırda etiket'],
  ['YAZI_RENK.soluk', YAZI_RENK.soluk, ZEMIN.cukur, 3.0, 'oyuk satırda dipnot'],

  // ---- KÂĞIT YÜZEY (Görev 12) ----
  // Bilgi ekranları parşömene taşındı; kâğıdın kendi yazı renkleri AYRI ölçülüyor.
  // Koyu zeminin oranları burada hiçbir şey söylemez — zemin değişti, hepsi yeniden ölçülür.
  ['KAGIT.yazi', KAGIT.yazi, KAGIT.yuzey, 7.0, 'kâğıtta başlık ve karar'],
  ['KAGIT.yaziIkincil', KAGIT.yaziIkincil, KAGIT.yuzey, 4.5, 'kâğıtta etiket ve açıklama'],
  ['KAGIT.yaziSoluk', KAGIT.yaziSoluk, KAGIT.yuzey, 3.0, 'kâğıtta dipnot (bilerek zayıf)'],
  ['KAGIT.yazi', KAGIT.yazi, KAGIT.cukur, 7.0, 'kâğıt oyuk satırda başlık'],
  ['KAGIT.yaziIkincil', KAGIT.yaziIkincil, KAGIT.cukur, 4.5, 'kâğıt oyuk satırda etiket'],
  ['KAGIT.murekkep', KAGIT.murekkep, KAGIT.yuzey, 4.5, 'mühür ve ikon çizimi'],
  ['KAGIT.murekkepSoluk', KAGIT.murekkepSoluk, KAGIT.yuzey, 2.0, 'kazanılmamış mühür'],
  ['KAGIT.arti', KAGIT.arti, KAGIT.yuzey, 4.5, 'kâğıtta kazanç/olumlu'],
  ['KAGIT.eksi', KAGIT.eksi, KAGIT.yuzey, 4.5, 'kâğıtta kayıp/uyarı'],

  // ---- MÜHÜR METALLERİ (Görev 12) ----
  // Ölçülen şey GÖVDE tonu: mührün ana çizgisi o. Parlak ton yalnızca ışık vurgusu,
  // tek başına okunması gerekmiyor. Eşik 3.0 — mühür yazı değil, arayüz öğesi (AA).
  ['METAL.bronz', METAL.bronz.govde, KAGIT.yuzey, 3.0, 'bronz mühür gövdesi'],
  ['METAL.gumus', METAL.gumus.govde, KAGIT.yuzey, 3.0, 'gümüş mühür gövdesi'],
  ['METAL.altin', METAL.altin.govde, KAGIT.yuzey, 3.0, 'altın mühür gövdesi'],
  ['DURUM.arti', DURUM.arti, ZEMIN.yuzey, 4.5, 'gelir +'],
  ['DURUM.eksi', DURUM.eksi, ZEMIN.yuzey, 4.5, 'gider − (YAZI, okunmalı)'],
  ['DURUM.eksi', DURUM.eksi, ZEMIN.cukur, 4.5, 'oyuk satırda gider −'],
  ['DURUM.arti', DURUM.arti, ZEMIN.cukur, 4.5, 'oyuk satırda gelir +'],
  ['VURGU.saldiri', VURGU.saldiri, ZEMIN.yuzey, 1.5, 'saldırı dolgusu (tonla ayrışır)'],
  ['VURGU.uzeriYazi', VURGU.uzeriYazi, VURGU.saldiri, 4.5, 'saldırı düğmesinin YAZISI'],
  ['CIZGI.ince', CIZGI.ince, ZEMIN.yuzey, 1.4, 'kutu kenarı'],
  ['CIZGI.ayrac', CIZGI.ayrac, ZEMIN.yuzey, 1.3, 'panel içi ayraç'],
  ['ZEMIN.cukur', ZEMIN.cukur, ZEMIN.yuzey, 1.2, 'oyuk satır (gömülü dursun)'],
  ['ZEMIN.taban', ZEMIN.taban, ZEMIN.yuzey, 1.1, 'alt katman'],
  ['ZEMIN.kabartma', ZEMIN.kabartma, ZEMIN.yuzey, 1.2, 'seçili yüzey (üstte dursun)'],
  ['MENU_RENK.yazi', MENU_RENK.yazi, MENU_RENK.panel, 7.0, 'menü paneli başlığı'],
  ['MENU_RENK.yaziSolu', MENU_RENK.yaziSolu, MENU_RENK.panel, 4.5, 'menü köşe parantezi'],
  ['MENU_RENK.kara', MENU_RENK.kara, MENU_RENK.deniz, 1.5, 'kara/deniz ayrımı'],
  ['MENU_RENK.kiyi', MENU_RENK.kiyi, MENU_RENK.deniz, 1.5, 'kıyı çizgisi'],
  ['MENU_RENK.sinir', MENU_RENK.sinir, MENU_RENK.kara, 1.5, 'parça sınırı (siyah)'],
];

// ---- MERDİVEN DENETİMİ ----
// Zemin katmanlarının SIRASI bozulursa derinlik kaybolur: yüzey tabandan açık olmalı ki
// panel "üstte" dursun, çukur yüzeyden koyu olmalı ki içeri gömülü dursun.
function merdiven() {
  const p = (h) => parlaklik(h);
  const sorun = [];
  if (!(p(ZEMIN.cukur) < p(ZEMIN.taban))) sorun.push('cukur, taban’dan koyu değil');
  if (!(p(ZEMIN.taban) < p(ZEMIN.yuzey))) sorun.push('taban, yuzey’den koyu değil');
  if (!(p(ZEMIN.yuzey) < p(ZEMIN.kabartma))) sorun.push('kabartma, yuzey’den açık değil');
  return sorun;
}

// ---- ÖLÇ ----
const satirlar = OLCUMLER.map(([ad, renk, zemin, asgari, ne]) => {
  const k = oran(renk, zemin);
  const t = tonFarki(renk, zemin);
  return { ad, renk, zemin, asgari, ne, k, t, gecti: k >= asgari };
});

const zeminAdi = (hex) => {
  for (const a of Object.keys(ZEMIN_ADI)) if (ZEMIN[a] === hex) return ZEMIN_ADI[a];
  for (const a of Object.keys(MENU_RENK)) if (MENU_RENK[a] === hex) return 'MENU_RENK.' + a;
  if (hex === VURGU.saldiri) return 'VURGU.saldiri';
  return hex;
};

console.log('TEMA KONTRAST ÖLÇÜMÜ — ' + new Date().toISOString().slice(0, 10) + '\n');
let dusuk = 0;
for (const s of satirlar) {
  const isaret = s.gecti ? '✓' : '✗';
  if (!s.gecti) dusuk++;
  console.log(
    '  ' +
      isaret +
      ' ' +
      s.ad.padEnd(22) +
      s.k.toFixed(2).padStart(5) +
      ':1  (asgari ' +
      s.asgari +
      ')' +
      (s.t !== null ? '  ton ' + s.t + '°' : '')
  );
}
const merdivenSorun = merdiven();
console.log('');
if (merdivenSorun.length) for (const m of merdivenSorun) console.log('  ✗ MERDİVEN: ' + m);
else console.log('  ✓ zemin merdiveni sağlam (cukur < taban < yuzey < kabartma)');

const md = [
  '# TEMA KONTRAST ÖLÇÜMÜ',
  '',
  '> Üreten: `scripts/tema-olcum.js` · Tarih: ' + new Date().toISOString().slice(0, 10),
  '>',
  "> Bu dosya ELLE YAZILMAZ. `src/tema.js`'te bir renk değişince betik yeniden çalıştırılır.",
  '',
  'Ölçü: WCAG 2.1 kontrast oranı (1.0 = aynı renk, 21 = siyah/beyaz).',
  'Ton sütunu, düşük parlaklık kontrastını neyin taşıdığını gösterir — iki renk arasında',
  'yeterli ton farkı varsa göz onları parlaklıktan değil renkten ayırır.',
  '',
  '| Renk | Zemin | Oran | Asgari | Ton farkı | Ne için |',
  '|---|---|---|---|---|---|',
  ...satirlar.map(
    (s) =>
      '| `' +
      s.ad +
      '` | `' +
      zeminAdi(s.zemin) +
      '` | ' +
      (s.gecti ? '' : '⚠ ') +
      s.k.toFixed(2) +
      ':1 | ' +
      s.asgari +
      ' | ' +
      (s.t !== null ? s.t + '°' : '—') +
      ' | ' +
      s.ne +
      ' |'
  ),
  '',
  '## Zemin merdiveni',
  '',
  merdivenSorun.length
    ? '⚠ **BOZUK:** ' + merdivenSorun.join(' · ')
    : '✓ `cukur` < `taban` < `yuzey` < `kabartma` — derinlik sırası sağlam.',
  '',
  'Merdiven bozulursa panel "üstte" durmayı bırakır ve oyuk satırlar gömülü görünmez.',
  '',
].join('\n');

fs.writeFileSync(path.join(KOK, 'veri', 'tema-olcum.md'), md);
console.log('\nyazıldı: veri/tema-olcum.md');
if (dusuk) console.log('⚠ ' + dusuk + ' ölçüm asgarinin altında — tabloya bak.');
process.exit(dusuk || merdivenSorun.length ? 1 : 0);
