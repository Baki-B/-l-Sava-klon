// KOMŞULUK DENETİMİ — Görev 03B / Adım 0.
// Çalıştırma:  node scripts/komsuluk-denetim.js
//
// İki soruyu cevaplar:
//   1) İl grafiğinde (komsuluk.json) komşu görünen ama PARÇA grafiğinde
//      (parca-komsuluk.json) hiçbir parça çifti bağlantısı olmayan il çiftleri hangileri?
//      Oyunun saldırı kuralı parça komşuluğu olduğu için bunlar GERÇEK HATADIR:
//      harita doğru görünür ama o sınırdan ordu geçemez.
//   2) Eksik çıkan her çift için, o sınıra fiilen değen parça çifti hangisi?
//      Tahmin yok: iki ilin parçalarının çizim noktaları arasındaki en kısa mesafe ölçülür.
//
// Bu betik hiçbir dosyayı DEĞİŞTİRMEZ, yalnızca rapor basar.

const path = require('path');

const VERI = path.join(__dirname, '..', 'veri');
const parcalarDosya = require(path.join(VERI, 'parcalar.json'));
const P = parcalarDosya.parcalar;
const ilKomsu = require(path.join(VERI, 'komsuluk.json'));
const parcaKomsu = require(path.join(VERI, 'parca-komsuluk.json'));
const ILLER = parcalarDosya.iller;

// Harita ölçeği: çizim genişliği 1000 birim ≈ Türkiye'nin doğu-batı genişliği (~1600 km).
const KM_PER_BIRIM = 1600 / (parcalarDosya.meta.genislik || 1000);

// ---- parça yolundan nokta listesi ----
function noktalar(pid) {
  const dizi = [];
  P[pid].yol
    .split('M')
    .filter(Boolean)
    .forEach((parca) => {
      parca
        .replace(/Z/g, '')
        .split('L')
        .forEach((t) => {
          const [x, y] = t.split(',');
          const nx = +x,
            ny = +y;
          if (Number.isFinite(nx) && Number.isFinite(ny)) dizi.push([nx, ny]);
        });
    });
  return dizi;
}
const NOKTA = {};
for (const pid of Object.keys(P)) NOKTA[pid] = noktalar(pid);

// İki parçanın çizim noktaları arasındaki en kısa mesafe (harita birimi).
function enKisaMesafe(a, b) {
  const A = NOKTA[a],
    B = NOKTA[b];
  let en = Infinity;
  for (let i = 0; i < A.length; i++) {
    const ax = A[i][0],
      ay = A[i][1];
    for (let j = 0; j < B.length; j++) {
      const dx = ax - B[j][0],
        dy = ay - B[j][1];
      const d = dx * dx + dy * dy;
      if (d < en) en = d;
    }
  }
  return Math.sqrt(en);
}

const ilParcalari = {};
for (const pid of Object.keys(P)) (ilParcalari[P[pid].kod] ||= []).push(pid);

// ---- 1) Parça grafiğinden il komşuluğu türet ----
const parcadanIl = {};
for (const a of Object.keys(parcaKomsu)) {
  const ka = a.split('-')[0];
  for (const b of parcaKomsu[a]) {
    const kb = b.split('-')[0];
    if (ka === kb) continue;
    (parcadanIl[ka] ||= new Set()).add(kb);
    (parcadanIl[kb] ||= new Set()).add(ka);
  }
}

// ---- 2) İl grafiğinde olup parça grafiğinde olmayanlar ----
const eksik = [];
for (const kod of Object.keys(ilKomsu)) {
  for (const komsuKod of ilKomsu[kod]) {
    if (kod >= komsuKod) continue; // her çifti bir kez
    const varMi = parcadanIl[kod] && parcadanIl[kod].has(komsuKod);
    if (!varMi) eksik.push([kod, komsuKod]);
  }
}

const ad = (k) => (ILLER[k] ? ILLER[k].ad : k);

console.log('KOMŞULUK DENETİMİ — Görev 03B / Adım 0\n');
console.log('İl grafiği (komsuluk.json) çift sayısı: ' + sayCift(ilKomsu));
console.log('Parça grafiğinden türeyen il çifti sayısı: ' + sayCift(parcadanIl) + '\n');

if (eksik.length === 0) {
  console.log('✓ İl grafiğinde komşu olup parça grafiğinde bağlantısı olmayan çift YOK.');
} else {
  console.log('EKSİK ÇİFTLER (' + eksik.length + ' adet) — parça grafiğinde bağlantı yok:\n');
  for (const [a, b] of eksik) {
    console.log('  ' + a + ' ' + ad(a) + ' ↔ ' + b + ' ' + ad(b));
    // Hangi parça çifti o sınıra en yakın?
    const adaylar = [];
    for (const pa of ilParcalari[a] || [])
      for (const pb of ilParcalari[b] || []) adaylar.push([pa, pb, enKisaMesafe(pa, pb)]);
    adaylar.sort((x, y) => x[2] - y[2]);
    for (const [pa, pb, d] of adaylar.slice(0, 3)) {
      console.log(
        '      ' +
          pa.padEnd(6) +
          P[pa].ad.padEnd(24) +
          ' ↔ ' +
          pb.padEnd(6) +
          P[pb].ad.padEnd(24) +
          ' mesafe ' +
          d.toFixed(2) +
          ' birim (~' +
          (d * KM_PER_BIRIM).toFixed(1) +
          ' km)'
      );
    }
    console.log('');
  }
}

// ---- 3) Kalibrasyon: gerçekten komşu olan il-arası parça çiftlerinde mesafe ne? ----
// (Sıfıra yakın çıkmalı; "yakın ama komşu değil" ile "komşu" arasındaki farkı gösterir.)
let ornek = 0,
  toplam = 0,
  enBuyuk = 0;
for (const a of Object.keys(parcaKomsu)) {
  for (const b of parcaKomsu[a]) {
    if (a >= b) continue;
    if (a.split('-')[0] === b.split('-')[0]) continue;
    const d = enKisaMesafe(a, b);
    toplam += d;
    if (d > enBuyuk) enBuyuk = d;
    ornek++;
  }
}
console.log('KALİBRASYON — hâlihazırda komşu olan il-arası parça çiftleri (' + ornek + ' çift):');
console.log('  ortalama mesafe ' + (toplam / ornek).toFixed(3) + ' birim');
console.log('  en büyük mesafe ' + enBuyuk.toFixed(3) + ' birim');
console.log('  (komşu parçalar sınırı paylaştığı için bu değerler ~0 olmalı)');

function sayCift(g) {
  const s = new Set();
  for (const k of Object.keys(g)) for (const n of g[k]) s.add([k, n].sort().join('~'));
  return s.size;
}
