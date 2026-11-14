// PARÇA GEOMETRİ YARDIMCILARI — ölçüm ve birleştirme önerisi ortak kullanır.
// (scripts/parca-olcum.js ve scripts/birlestirme-oner.js)

const polylabel = require('polylabel').default || require('polylabel');

// SVG çizim yolunu halkalara (kapalı nokta dizilerine) çevirir.
function halkalar(yol) {
  return yol
    .split('M')
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/Z/g, '')
        .split('L')
        .map((t) => {
          const [x, y] = t.split(',');
          return [+x, +y];
        })
        .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
    )
    .filter((r) => r.length >= 3);
}

// Halkanın alanı (işaretsiz).
function alan(r) {
  let a = 0;
  for (let i = 0, n = r.length, j = n - 1; i < n; j = i++)
    a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return Math.abs(a / 2);
}

// En büyük kara gövdesi (adalar değil).
function enBuyukGovde(rings) {
  let en = rings[0],
    enA = alan(rings[0]);
  for (const r of rings) {
    const a = alan(r);
    if (a > enA) {
      enA = a;
      en = r;
    }
  }
  return { halka: en, alan: enA };
}

// İç çember: parçanın içine sığan en büyük dairenin merkezi ve çapı.
// polylabel sınıra en uzak iç noktayı ve o uzaklığı verir; çap = 2 × uzaklık.
function icCember(rings) {
  if (!rings || rings.length === 0) return null;
  const g = enBuyukGovde(rings);
  const nokta = polylabel([g.halka], 0.05);
  return {
    x: +nokta[0].toFixed(1),
    y: +nokta[1].toFixed(1),
    cap: nokta.distance * 2,
    govdeSayisi: rings.length,
    govdeAlani: g.alan,
  };
}

// İki parçanın ORTAK SINIR uzunluğu (harita birimi).
// Parçalar aynı topolojiden üretildiği için ortak kenarların köşe noktaları birebir aynıdır;
// kenarları kanonik anahtara çevirip kesişimlerini toplamak yeterli ve kesindir.
// Deniz geçişlerinde ortak kenar YOKTUR → 0 döner (bu, "kara bağlantısı yok" demektir).
function kenarKumesi(rings) {
  const m = new Map();
  for (const r of rings) {
    for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
      const a = r[j],
        b = r[i];
      const ax = a[0].toFixed(1),
        ay = a[1].toFixed(1),
        bx = b[0].toFixed(1),
        by = b[1].toFixed(1);
      const k1 = ax + ',' + ay + '|' + bx + ',' + by;
      const k2 = bx + ',' + by + '|' + ax + ',' + ay;
      const anahtar = k1 < k2 ? k1 : k2;
      const uzunluk = Math.hypot(b[0] - a[0], b[1] - a[1]);
      m.set(anahtar, (m.get(anahtar) || 0) + uzunluk);
    }
  }
  return m;
}

function ortakSinir(kenarA, kenarB) {
  let toplam = 0;
  for (const [k, u] of kenarA) if (kenarB.has(k)) toplam += u;
  return toplam;
}

module.exports = { halkalar, alan, enBuyukGovde, icCember, kenarKumesi, ortakSinir };
