// İkon yollarını gerçek harita geometrisinden üretir (SADELEŞTİRİLMİŞ, 24x24):
//   İller ikonu = Ankara ili şekli   |   Bölge ikonu = Marmara bölgesi silueti
// Çıktı: src/ikon-yollari.js
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const PROJ = path.join(__dirname, '..');
const parcalar = require(path.join(PROJ, 'veri/parcalar.json'));

const MARMARA = ['34', '16', '10', '41', '59', '17', '54', '22', '39', '11', '77'];

function parseRings(d) {
  return d
    .split('M')
    .filter(Boolean)
    .map((s) =>
      s
        .replace('Z', '')
        .split('L')
        .map((t) => {
          const p = t.split(',');
          return [+p[0], +p[1]];
        })
    );
}
function kapali(r) {
  const a = r[0],
    z = r[r.length - 1];
  return a[0] === z[0] && a[1] === z[1] ? r : r.concat([a]);
}
function sadelestir(r, tol) {
  try {
    return turf.simplify(turf.polygon([kapali(r)]), { tolerance: tol, highQuality: true }).geometry
      .coordinates[0];
  } catch (e) {
    return kapali(r);
  }
}
function acikligi(r) {
  let a = 1e9,
    b = 1e9,
    c = -1e9,
    d = -1e9;
  r.forEach((p) => {
    if (p[0] < a) a = p[0];
    if (p[0] > c) c = p[0];
    if (p[1] < b) b = p[1];
    if (p[1] > d) d = p[1];
  });
  return Math.max(c - a, d - b);
}
function ikonYol(d, tol, minAcik) {
  const rings = parseRings(d)
    .map((r) => sadelestir(r, tol))
    .filter((r) => r.length >= 4 && acikligi(r) >= minAcik);
  return rings
    .map((r) => 'M' + r.map((p) => (+p[0]).toFixed(1) + ',' + (+p[1]).toFixed(1)).join('L') + 'Z')
    .join('');
}
function normalize(d, size = 24, pad = 2.5) {
  const nums = (d.match(/-?\d+\.?\d*/g) || []).map(Number);
  let minx = 1e9,
    miny = 1e9,
    maxx = -1e9,
    maxy = -1e9;
  for (let i = 0; i < nums.length; i += 2) {
    const x = nums[i],
      y = nums[i + 1];
    if (x < minx) minx = x;
    if (x > maxx) maxx = x;
    if (y < miny) miny = y;
    if (y > maxy) maxy = y;
  }
  const w = maxx - minx,
    h = maxy - miny,
    s = (size - 2 * pad) / Math.max(w, h);
  const ox = pad + (size - 2 * pad - w * s) / 2,
    oy = pad + (size - 2 * pad - h * s) / 2;
  return d.replace(
    /(-?\d+\.?\d*),(-?\d+\.?\d*)/g,
    (m, xs, ys) => ((+xs - minx) * s + ox).toFixed(2) + ',' + ((+ys - miny) * s + oy).toFixed(2)
  );
}

const ankara = normalize(ikonYol(parcalar.iller['06'].yol, 2.2, 4));
const marmara = normalize(ikonYol(MARMARA.map((k) => parcalar.iller[k].yol).join(''), 3.2, 8));

fs.writeFileSync(
  path.join(PROJ, 'src/ikon-yollari.js'),
  '// Otomatik üretildi (scripts/ikon-uret.js) — Ankara ve Marmara ikon şekilleri (sade, 24x24).\n' +
    'export const ANKARA_YOL = ' +
    JSON.stringify(ankara) +
    ';\n' +
    'export const MARMARA_YOL = ' +
    JSON.stringify(marmara) +
    ';\n'
);
console.log('yazıldı — Ankara yol:', ankara.length, 'krkt, Marmara yol:', marmara.length, 'krkt');
