// TEK KOMUTLUK KONTROL — `npm run kontrol` bunu çağırır.
// Altı şeyi sırayla çalıştırır ve sonunda sade bir özet verir:
//   1) VERİ    — veri/ JSON'ları tutarlı mı (veri-dogrula.js)
//   2) KOD     — koddaki hatalar (ESLint)
//   3) BİÇİM   — kod tek tip biçimlenmiş mi (Prettier)
//   4) RENK    — bileşenlerde çıplak renk kodu kalmış mı (renk-denetim.js)
//   5) KONTRAST— yazılar zeminlerinin üstünde okunuyor mu (tema-olcum.js)
//   6) TESTLER — oyun mantığı doğru mu (testler/calistir.js)
// Baki için: ÖZET'te hepsi ✓ ise sorun yok. ✗ varsa altındaki satırları oku ya da bana getir.
//
// 5) NİYE KAPIYA EKLENDİ (2026-08-03). Zemin rengi iki kez değişti, iki kez de üstündeki
// yazıların okunurluğu sessizce düştü — bir keresinde ayraçlar 1.21:1'e inmişti, bir
// keresinde kayıp sayıları 1.76:1'e. İkisi de gözle fark edilmedi, ikisi de ölçünce
// ortaya çıktı. Renk kararı gözle verilir ama okunurluk ÖLÇÜLÜR.
//
// Not: araçlar (eslint, prettier) doğrudan Node ile çağrılır — Windows'ta npx.cmd'yi
// spawn etmek yeni Node sürümlerinde sorun çıkarıyor, bu yol her yerde güvenli.

const { spawnSync } = require('child_process');
const path = require('path');

const KOK = path.join(__dirname, '..');
const NODE = process.execPath;
const ESLINT = path.join(KOK, 'node_modules', 'eslint', 'bin', 'eslint.js');
const PRETTIER = path.join(KOK, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
const BICIM_HEDEF = ['src/**/*.js', 'scripts/**/*.js', 'testler/**/*.js'];
const TESTLER = path.join(KOK, 'testler', 'calistir.js');

function calistir(baslik, args) {
  console.log('\n──────── ' + baslik + ' ────────');
  const r = spawnSync(NODE, args, { cwd: KOK, stdio: 'inherit', shell: false });
  if (r.error) {
    console.log('  (çalıştırma hatası: ' + r.error.message + ')');
    return false;
  }
  return r.status === 0;
}

const sonuc = [];
sonuc.push(['Veri tutarlılığı', calistir('1) VERİ', [path.join(__dirname, 'veri-dogrula.js')])]);
sonuc.push(['Kod hataları (ESLint)', calistir('2) KOD', [ESLINT, '.'])]);
sonuc.push(['Biçim (Prettier)', calistir('3) BİÇİM', [PRETTIER, '--check', ...BICIM_HEDEF])]);
sonuc.push(['Çıplak renk kodu', calistir('4) RENK', [path.join(__dirname, 'renk-denetim.js')])]);
sonuc.push(['Yazı okunurluğu', calistir('5) KONTRAST', [path.join(__dirname, 'tema-olcum.js')])]);
sonuc.push(['Oyun mantığı testleri', calistir('6) TESTLER', [TESTLER])]);

console.log('\n' + '='.repeat(48));
console.log('ÖZET');
let hepsi = true;
for (const [ad, ok] of sonuc) {
  console.log((ok ? '  ✓ ' : '  ✗ ') + ad + (ok ? ' — temiz' : ' — SORUN VAR'));
  if (!ok) hepsi = false;
}
console.log('='.repeat(48));
if (hepsi) {
  console.log('✓ Hepsi geçti. Kod ve veri sağlam, gönül rahatlığıyla devam.');
} else {
  console.log('✗ Yukarıda ✗ olan(lar)a bak.');
  console.log('  • Biçim sorunuysa otomatik düzelt:  npm run bicimle');
  console.log('  • Veri/kod hatasıysa satırları bana getir, çözerim.');
}
process.exit(hepsi ? 0 : 1);
