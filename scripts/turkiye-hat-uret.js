// TÜRKİYE'NİN TEK DIŞ HATTI — 81 il birleştirilip ülkenin silueti çıkarılır.
//
// NEDEN GEREKLİ. `harita.json` illeri ayrı ayrı tutuyor; bu oyun haritası için doğru ama
// LOGO/MÜHÜR/AMBLEM için yanlış: 81 ili tek tek konturlarsan ülke değil bir karalama
// çıkıyor (bütün il sınırları da çizilir). Amblemde gereken tek şey DIŞ HAT.
//
// ---- NEDEN TURF DEĞİL ----
// Önce `@turf/turf` union'ı denendi ve ÇÖP ÜRETTİ. Sebep: turf koordinatları enlem/boylam
// sanıyor, bizimkiler ise projekte edilmiş düzlem koordinatları (0–1000 × 0–452). Geçerli
// enlem aralığı ±90 olduğu için turf'ün geodezik hesapları anlamsız sonuç veriyor.
//
// Bu yüzden koordinat sisteminden BAĞIMSIZ bir yol izleniyor:
//   1. Bütün halkalar bir ızgaraya taranarak doldurulur (birleşim = "herhangi birinin içi")
//   2. Marching squares ile ikili ızgaranın sınırı çıkarılır
//   3. Parçalar birleştirilip Douglas-Peucker ile sadeleştirilir
// Sonuç piksel ızgarasından geldiği için topolojik olarak her zaman kapalı ve tutarlı.
//
// Çıktı `veri/turkiye-hat.json`. Üretim TEK SEFERLİK; ekranlar bu JSON'u okur, birleştirmeyi
// çalışma anında yapmaz (81 poligonun birleşimi telefonda her açılışta yapılacak iş değil).
//
// Çalıştırma:  node scripts/turkiye-hat-uret.js

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const harita = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'harita.json'), 'utf8'));
const META = harita.meta;
const KODLAR = Object.keys(harita.iller).sort();

// Izgara çözünürlüğü. 3 = harita biriminin üçte biri; kıyı girintileri korunuyor ama
// dosya makul kalıyor. Büyütmek ayrıntıyı artırır, üretim süresini de.
const OLCEK = 3;
const GW = Math.ceil(META.genislik * OLCEK) + 2;
const GH = Math.ceil(META.yukseklik * OLCEK) + 2;

function halkalar(yol) {
  return yol
    .split('M')
    .filter(Boolean)
    .map((p) =>
      p
        .replace('Z', '')
        .split('L')
        .map((n) => {
          const q = n.split(',');
          return [+q[0] * OLCEK + 1, +q[1] * OLCEK + 1];
        })
        .filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]))
    )
    .filter((r) => r.length >= 3);
}

// ---- 1. TARAMALI DOLDURMA ----
const ic = new Uint8Array(GW * GH);
let halkaSayisi = 0;
for (const kod of KODLAR)
  for (const r of halkalar(harita.iller[kod].yol)) {
    halkaSayisi++;
    let y0 = Infinity,
      y1 = -Infinity;
    for (const p of r) {
      if (p[1] < y0) y0 = p[1];
      if (p[1] > y1) y1 = p[1];
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(GH - 1, Math.ceil(y1)); y++) {
      const kesim = [];
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const yi = r[i][1],
          yj = r[j][1];
        if (yi > y !== yj > y) kesim.push(((r[j][0] - r[i][0]) * (y - yi)) / (yj - yi) + r[i][0]);
      }
      kesim.sort((a, b) => a - b);
      for (let k = 0; k + 1 < kesim.length; k += 2) {
        const a = Math.max(0, Math.ceil(kesim[k])),
          b = Math.min(GW - 1, Math.floor(kesim[k + 1]));
        for (let x = a; x <= b; x++) ic[y * GW + x] = 1;
      }
    }
  }
console.log('halka: ' + halkaSayisi + ' · ızgara: ' + GW + '×' + GH);

// ---- 2. MARCHING SQUARES ----
// Her hücre için dört köşenin içerideliği bir 0–15 durumu veriyor; durumun karşılığı olan
// kenar parçaları üretiliyor. Parçaların uçları hücre kenarlarının TAM ORTASINA düştüğü
// için birleştirme kayan nokta hatası olmadan, tam eşleşmeyle yapılabiliyor.
const IC = (x, y) => (x < 0 || y < 0 || x >= GW || y >= GH ? 0 : ic[y * GW + x]);
const parcalar = new Map(); // "x,y" -> [bitişUcu]
const anahtar = (p) => p[0] + ',' + p[1];
function ekle(a, b) {
  const k = anahtar(a);
  if (!parcalar.has(k)) parcalar.set(k, []);
  parcalar.get(k).push(b);
}
for (let y = -1; y < GH; y++)
  for (let x = -1; x < GW; x++) {
    const tl = IC(x, y),
      tr = IC(x + 1, y),
      br = IC(x + 1, y + 1),
      bl = IC(x, y + 1);
    const durum = (tl << 3) | (tr << 2) | (br << 1) | bl;
    if (durum === 0 || durum === 15) continue;
    const U = [x + 0.5, y],
      S = [x + 1, y + 0.5],
      A = [x + 0.5, y + 1],
      B = [x, y + 0.5];
    // Yön: dolu alan SOLDA kalacak şekilde — böylece elde edilen halkalar tutarlı yönlü.
    const ciz = {
      1: [[A, B]],
      2: [[S, A]],
      3: [[S, B]],
      4: [[U, S]],
      5: [
        [U, B],
        [A, S],
      ],
      6: [[U, A]],
      7: [[U, B]],
      8: [[B, U]],
      9: [[A, U]],
      10: [
        [B, A],
        [S, U],
      ],
      11: [[S, U]],
      12: [[B, S]],
      13: [[A, S]],
      14: [[B, A]],
    }[durum];
    for (const [a, b] of ciz) ekle(a, b);
  }

// ---- 3. PARÇALARI HALKAYA DİZ ----
const halkaListesi = [];
while (parcalar.size) {
  const bas = parcalar.keys().next().value;
  let su = bas.split(',').map(Number);
  const halka = [su];
  for (;;) {
    const k = anahtar(su);
    const cikis = parcalar.get(k);
    if (!cikis || !cikis.length) break;
    const sonraki = cikis.pop();
    if (!cikis.length) parcalar.delete(k);
    halka.push(sonraki);
    su = sonraki;
    if (anahtar(su) === bas) break;
  }
  if (halka.length > 8) halkaListesi.push(halka);
}
console.log('halka (marching squares): ' + halkaListesi.length);

// ---- 4. SADELEŞTİR (Douglas–Peucker) ----
function dp(nokta, tol) {
  if (nokta.length < 3) return nokta;
  let enUzak = 0,
    dizin = 0;
  const [ax, ay] = nokta[0],
    [bx, by] = nokta[nokta.length - 1];
  const uz = Math.hypot(bx - ax, by - ay) || 1;
  for (let i = 1; i < nokta.length - 1; i++) {
    const d = Math.abs((bx - ax) * (ay - nokta[i][1]) - (ax - nokta[i][0]) * (by - ay)) / uz;
    if (d > enUzak) {
      enUzak = d;
      dizin = i;
    }
  }
  if (enUzak <= tol) return [nokta[0], nokta[nokta.length - 1]];
  return [...dp(nokta.slice(0, dizin + 1), tol).slice(0, -1), ...dp(nokta.slice(dizin), tol)];
}

// ⚠ KAPALI HALKAYA DOĞRUDAN DP UYGULANAMAZ. Başlangıç ve bitiş noktası AYNI olduğu için
// aradaki "doğru" sıfır uzunlukta çıkıyor, bütün mesafeler anlamsızlaşıyor ve halka iki
// noktaya çöküyordu (ilk denemede 19 halkanın 19'u da elendi). Çözüm: halka, başlangıçtan
// EN UZAK noktadan ikiye bölünüp iki açık parça ayrı ayrı sadeleştiriliyor.
function dpHalka(r, tol) {
  const [ax, ay] = r[0];
  let uzak = 0,
    dizin = 0;
  for (let i = 1; i < r.length; i++) {
    const d = Math.hypot(r[i][0] - ax, r[i][1] - ay);
    if (d > uzak) {
      uzak = d;
      dizin = i;
    }
  }
  const a = dp(r.slice(0, dizin + 1), tol);
  const b = dp(r.slice(dizin), tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

const TOL = 1.1; // ızgara birimi
const alanHesap = (r) =>
  Math.abs(
    r.reduce((t, p, i) => {
      const q = r[(i + 1) % r.length];
      return t + (p[0] * q[1] - q[0] * p[1]);
    }, 0) / 2
  );

const EN_AZ_ALAN = 40 * OLCEK * OLCEK; // adacıklar amblemde görünmez, dosyayı şişirir
const secilen = halkaListesi
  .map((r) => dpHalka(r, TOL))
  .filter((r) => r.length >= 4 && alanHesap(r) >= EN_AZ_ALAN)
  .sort((a, b) => alanHesap(b) - alanHesap(a));

const yol = secilen
  .map(
    (r) =>
      'M' +
      r
        .map((p) => ((p[0] - 1) / OLCEK).toFixed(1) + ',' + ((p[1] - 1) / OLCEK).toFixed(1))
        .join('L') +
      'Z'
  )
  .join('');

// ---- 5. KARANIN EN ÜST NOKTASI ----
// Ana menü ve mod ekranının başlığı karaya DEĞMEMELİ; konumu göz kararı değil hesapla
// bulunuyor (uygulama belgesi §1). Hesap "karanın ekrandaki en üst noktası"nı istiyor,
// yani dış hattın en küçük y'sini. Ekran her açılışta 2262 noktayı taramasın diye
// buraya bir kez yazılıyor.
const enUstY = +Math.min(
  ...secilen.map((r) => Math.min(...r.map((p) => (p[1] - 1) / OLCEK)))
).toFixed(1);

fs.writeFileSync(
  path.join(KOK, 'veri', 'turkiye-hat.json'),
  JSON.stringify({
    aciklama:
      'Türkiye dış hattı — 81 ilin birleşimi (rasterleştirme + marching squares). ' +
      'scripts/turkiye-hat-uret.js ile üretildi. Amblem/logo/mühür çizimlerinde kullanılır; ' +
      'oyun haritası için harita.json kullanılır.',
    meta: { ...META, enUstY },
    yol,
  })
);
console.log('yazıldı: veri/turkiye-hat.json');
console.log(
  '  parça: ' +
    secilen.length +
    ' · nokta: ' +
    secilen.reduce((t, r) => t + r.length, 0) +
    ' · ' +
    (yol.length / 1024).toFixed(1) +
    ' KB'
);
