// TÜM TESTLERİ ÇALIŞTIR — `npm run test` bunu çağırır (kontrol.js de çağırıyor).
// testler/ klasöründeki her *.test.js dosyasını sırayla çalıştırır, Türkçe özet basar.
// Baki için: her satırın başında ✓ varsa sorun yok.

const fs = require('fs');
const path = require('path');
const { sonuclar } = require('./yardimci');

const KLASOR = __dirname;
const dosyalar = fs
  .readdirSync(KLASOR)
  .filter((d) => d.endsWith('.test.js'))
  .sort();

console.log('TESTLER — ' + new Date().toISOString().slice(0, 10));

if (dosyalar.length === 0) {
  console.log('\n  (testler/ içinde .test.js dosyası yok)');
  process.exit(0);
}

let gecen = 0,
  kalan = 0;

for (const dosya of dosyalar) {
  const oncekiSayi = sonuclar.length;
  console.log('\n=== ' + dosya + ' ===');
  try {
    require(path.join(KLASOR, dosya));
  } catch (e) {
    console.log('  ✗ dosya çalıştırılamadı: ' + e.message);
    kalan++;
    continue;
  }
  for (let i = oncekiSayi; i < sonuclar.length; i++) {
    const s = sonuclar[i];
    if (s.ok) {
      gecen++;
      console.log('  ✓ ' + s.ad);
    } else {
      kalan++;
      console.log('  ✗ ' + s.ad);
      console.log('      ' + s.mesaj);
    }
  }
}

console.log('\n' + '='.repeat(48));
if (kalan === 0) {
  console.log('SONUÇ: ✓ ' + gecen + ' testin hepsi geçti.');
} else {
  console.log('SONUÇ: ✗ ' + kalan + ' test KALDI (' + gecen + ' geçti).');
}
console.log('='.repeat(48));
process.exit(kalan === 0 ? 0 : 1);
