// ÇIPLAK RENK DENETİMİ (Görev 10A / Adım 2).
//
// KURAL: renk kararı YALNIZCA `src/tema.js`'te verilir. Bileşen dosyasının içinde
// `#rrggbb` veya `rgba(...)` yazılmaz. Sebep basit: renk üç ekrana dağılmışken
// "paneli açık yap" demek üç ekranı tek tek gezmek demektir; jetonlaştırılmışken
// tek satır. Görev 10A'nın ilk kusuru ("oyunda üç ayrı dünya var") tam bu yüzden doğdu.
//
// `tema.js` MUAF — renklerin yaşadığı yer orası.
// `scripts/renkler.js` MUAF — harita üretim betiği, Node tarafı, arayüz değil.

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const TARANAN = path.join(KOK, 'src');
const MUAF = new Set([path.join(TARANAN, 'tema.js')]);

// #abc · #abcdef · #abcdef12 · rgb(…) · rgba(…)
const DESEN = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*[0-9]/g;

function dosyalar(klasor) {
  const out = [];
  for (const ad of fs.readdirSync(klasor)) {
    const tam = path.join(klasor, ad);
    if (fs.statSync(tam).isDirectory()) out.push(...dosyalar(tam));
    else if (ad.endsWith('.js')) out.push(tam);
  }
  return out;
}

const bulgular = [];
for (const dosya of dosyalar(TARANAN)) {
  if (MUAF.has(dosya)) continue;
  const satirlar = fs.readFileSync(dosya, 'utf8').split('\n');
  satirlar.forEach((satir, i) => {
    const eslesme = satir.match(DESEN);
    if (eslesme) {
      bulgular.push({
        yer: path.relative(KOK, dosya).replace(/\\/g, '/') + ':' + (i + 1),
        renkler: eslesme.join(' '),
        satir: satir.trim(),
      });
    }
  });
}

console.log('Taranan: src/ (tema.js muaf)');
if (bulgular.length === 0) {
  console.log('  ✓ Çıplak renk sayısı: 0');
  process.exit(0);
}

console.log('  ✗ Çıplak renk sayısı: ' + bulgular.length + '\n');
for (const b of bulgular) {
  console.log('  ' + b.yer + '  →  ' + b.renkler);
  console.log('      ' + (b.satir.length > 96 ? b.satir.slice(0, 93) + '...' : b.satir));
}
console.log("\n  Çözüm: rengi src/tema.js'e bir ad altında taşı, burada o adı kullan.");
process.exit(1);
