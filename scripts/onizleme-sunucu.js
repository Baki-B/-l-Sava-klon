// ONIZLEME SUNUCUSU — yalnızca geliştirme aracı, oyuna girmez.
// `onizleme/*.html` dosyalarını ve `node_modules` içindeki yazı tiplerini tarayıcıya sunar.
// İkon/logo çalışmalarında gerekiyor: tarayıcı dosya sisteminden yazı tipi yükleyemiyor.
//
// Harita hız ölçümü (`onizleme/harita-hiz.html`, Görev 20) oyunun `src/` modüllerini ve
// Skia'nın tarayıcı sürümünü (CanvasKit) doğrudan yüklüyor. Bu yüzden:
//   • .js / .wasm doğru türle sunuluyor (tarayıcı modülü ve wasm'ı türüne bakarak açıyor);
//   • uzantısız içe aktarma (`./JsiSkPaint`, `../types`) `.js` ya da `/index.js` diye
//     çözülüyor — react-native-skia'nın modülleri uzantı yazmıyor.
const http = require('http');
const fs = require('fs');
const path = require('path');
const KOK = path.join(__dirname, '..');
const TIP = {
  '.html': 'text/html; charset=utf-8',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
  '.png': 'image/png',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
};

// Uzantısız yolu dosyaya çevirir: önce kendisi, sonra `.js`, sonra `/index.js`.
function coz(dosya, geri) {
  const adaylar = path.extname(dosya)
    ? [dosya]
    : [dosya, dosya + '.js', path.join(dosya, 'index.js')];
  const dene = (i) => {
    if (i >= adaylar.length) return geri(null);
    fs.stat(adaylar[i], (h, st) => (!h && st.isFile() ? geri(adaylar[i]) : dene(i + 1)));
  };
  dene(0);
}

http
  .createServer((istek, cevap) => {
    // ---- KAYDET: tuvalden gelen PNG'yi diske yazar ----
    // Tarayıcı canvas'ı doğrudan dosyaya yazamıyor; ikon/logo çalışmasında üretilen
    // görseli almanın yolu bu. YALNIZCA `assets/` altına ve yalnızca .png yazar.
    if (istek.method === 'POST' && istek.url.startsWith('/kaydet')) {
      const ad = new URL(istek.url, 'http://x').searchParams.get('ad') || '';
      if (!/^[a-z0-9-]+\.png$/i.test(ad)) return cevap.writeHead(400).end('geçersiz ad');
      let gövde = '';
      istek.on('data', (p) => (gövde += p));
      istek.on('end', () => {
        const b64 = gövde.replace(/^data:image\/png;base64,/, '');
        fs.writeFile(path.join(KOK, 'assets', ad), Buffer.from(b64, 'base64'), (h) => {
          cevap.writeHead(h ? 500 : 200).end(h ? String(h) : 'yazıldı: assets/' + ad);
        });
      });
      return;
    }
    const yol = decodeURIComponent(istek.url.split('?')[0]);
    const istenen = path.join(KOK, yol === '/' ? 'onizleme/ikon.html' : yol);
    if (!istenen.startsWith(KOK)) return cevap.writeHead(403).end();
    coz(istenen, (dosya) => {
      if (!dosya) return cevap.writeHead(404).end('yok: ' + yol);
      // Klasörün index.js'i: tarayıcı içindeki göreli yolları (./Picture) doğru klasörden
      // çözsün diye tam adrese yönlendirilir.
      if (path.basename(dosya) === 'index.js' && !yol.endsWith('index.js')) {
        return cevap.writeHead(302, { Location: yol.replace(/\/?$/, '/index.js') }).end();
      }
      fs.readFile(dosya, (h, veri) => {
        if (h) return cevap.writeHead(404).end('yok: ' + yol);
        cevap.writeHead(200, {
          'Content-Type': TIP[path.extname(dosya)] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        cevap.end(veri);
      });
    });
  })
  .listen(4173, () => console.log('onizleme sunucusu: http://localhost:4173'));
