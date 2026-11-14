// TELEFONDA AÇ — sunucuyu başlatır VE bundle'ı önden ısıtır (2026-08-06).
//
// ┌─ NEDEN VAR ─────────────────────────────────────────────────────────────────────────┐
// │ Baki: *"QR okuttum, yüklenme ekranı 1 dk döndü, sonra 'something went wrong' dedi."* │
// │                                                                                      │
// │ ÖLÇÜLDÜ: bu projenin geliştirme bundle'ı SOĞUK derlemede 59.4 saniye sürüyor ve       │
// │ 12.2 MB. Expo Go o kadar beklemiyor — telefon bağlanıyor, çubuk dönüyor, sonra        │
// │ vazgeçiyor. SICAK istek ise 0.13 saniye: yani sorun derlemenin kendisi, ağ değil.     │
// │                                                                                      │
// │ Sebep tek bir dosyada değil: harita verisi (parcalar 1.5 MB + harita 848 KB + menü    │
// │ geometrisi) geliştirme modunda tek tek modüle çevriliyor.                             │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ⚠ ÇIKTI YAKALANMAZ (Baki, 2026-08-06: "bunlar qr üretmiyor") ----
//
// İlk sürüm Expo'nun çıktısını `pipe` ile yakalayıp yeniden basıyordu ve QR KODU
// KAYBOLDU: Expo, çıktısının bir terminale mi yoksa bir boruya mı gittiğine bakıyor;
// boruya giderken QR çizimini ve klavye kısayollarını (r = yenile, m = menü) kapatıyor.
//
// Artık çıktı DOĞRUDAN terminale gidiyor (`stdio: 'inherit'`), ısıtma da çıktıyı okuyarak
// değil SUNUCUYU YOKLAYARAK yapılıyor: Metro'nun `/status` ucu cevap verince bundle bir
// kez isteniyor. Böylece hem QR duruyor hem ısıtma çalışıyor.
//
// Çalıştırma:  npm.cmd run telefon        (tünel için: npm.cmd run telefon -- --tunnel)

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// ---- ⚠ KOMUT TEK PARÇA VERİLİYOR, DİZİ OLARAK DEĞİL ----
//
// İki tuzak üst üste bindi ve çözümü aynı satırda:
//
//   1. Windows'ta `.cmd` dosyası doğrudan spawn EDİLEMİYOR (Node 20'den beri `EINVAL`);
//      kabuk üzerinden çalıştırılması gerekiyor.
//   2. Ama `shell: true` ile birlikte argümanları DİZİ olarak geçirmek Node'un
//      DEP0190 uyarısını bastırıyor: "argümanlar kaçışlanmıyor, yalnızca birleştiriliyor."
//      Uyarı haklı — kabuk komutu tek bir metin olarak görüyor.
//
// Çözüm ikisini de kapatıyor: komut ZATEN tek bir metin olarak kuruluyor, boşluk içeren
// argümanlar tırnaklanıyor. Dizi yok, uyarı yok, `.cmd` de kabuktan çalışıyor.
const ekArgumanlar = process.argv.slice(2).map((a) => (a.includes(' ') ? '"' + a + '"' : a));
const komut = ['npx', 'expo', 'start', ...ekArgumanlar].join(' ');

const sunucu = spawn(komut, {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
});

// Expo 8081 doluysa 8082'ye kayabiliyor; ikisini de yokluyoruz.
const PORTLAR = [8081, 8082];
const YOKLAMA_ARALIGI = 1500;
const EN_COK_YOKLAMA = 60; // 90 saniye

let yoklama = 0;
let isitildi = false;

function yokla() {
  if (isitildi) return;
  if (++yoklama > EN_COK_YOKLAMA) {
    console.log('\n⚠ Sunucu bulunamadı; ısıtma atlandı. QR yine de çalışıyor olabilir.\n');
    return;
  }
  let kalan = PORTLAR.length;
  for (const port of PORTLAR) {
    const istek = http.get({ host: 'localhost', port, path: '/status', timeout: 1200 }, (c) => {
      c.resume();
      if (!isitildi) isit(port);
    });
    const yeniden = () => {
      if (--kalan === 0 && !isitildi) setTimeout(yokla, YOKLAMA_ARALIGI);
    };
    istek.on('error', yeniden);
    istek.on('timeout', () => {
      istek.destroy();
      yeniden();
    });
  }
}

// Bundle'ı bir kez isteyip bekliyoruz. Metro derlemeyi bitirene kadar cevap vermiyor,
// yani bu istek TAM OLARAK telefonun beklediği süre kadar sürüyor — farkı, burada
// beklemenin kimseyi zaman aşımına düşürmemesi.
function isit(port) {
  if (isitildi) return;
  isitildi = true;
  const yol = '/index.bundle?platform=android&dev=true&hot=false';
  const bas = Date.now();
  console.log(
    '\n⏳ Bundle önden derleniyor (ilk seferde bir dakikayı bulabilir).' +
      '\n   Bitince "HAZIR" yazacak — QR kodu O ZAMAN okut.\n'
  );

  const istek = http.get({ host: 'localhost', port, path: yol }, (cevap) => {
    let bayt = 0;
    cevap.on('data', (parca) => (bayt += parca.length));
    cevap.on('end', () => {
      const sn = ((Date.now() - bas) / 1000).toFixed(1);
      if (cevap.statusCode === 200) {
        console.log(
          '\n✓ HAZIR — bundle derlendi (' +
            sn +
            ' sn, ' +
            (bayt / 1024 / 1024).toFixed(1) +
            ' MB).' +
            '\n  ŞİMDİ QR KODU OKUT. Telefon paketi hazır bulacağı için anında açılır.\n'
        );
      } else {
        console.log('\n✗ Bundle derlenemedi (HTTP ' + cevap.statusCode + ').\n');
      }
    });
  });
  // Isıtma başarısız olursa sunucu yine ayakta — yalnızca hızlandırma kaçar.
  istek.on('error', (e) => console.log('\n⚠ Isıtma isteği başarısız: ' + e.message + '\n'));
  istek.setTimeout(300000, () => istek.destroy(new Error('ısıtma 5 dakikayı aştı')));
}

setTimeout(yokla, 3000);
sunucu.on('exit', (kod) => process.exit(kod === null ? 0 : kod));
