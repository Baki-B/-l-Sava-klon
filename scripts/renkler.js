// Ortak renk mantığı — hem parça üretimi (renkIl'i parcalar.json'a gömer) hem
// önizleme hem de gerekirse uygulama aynı renkleri kullansın.
// Savaş teması / mat tonlar: hue'lar korunur, doygunluk düşük.

const kanonik = require('./iller-kanonik');

const ARAZI_RENK = { ova: '#cfe0a8', tepelik: '#d8b781', daglik: '#a9805f' };
const ARAZI_AD = { ova: 'Düzlük', tepelik: 'Tepelik', daglik: 'Dağlık' };
const BOLGE_RENK = {
  'Marmara': '#7593b0',
  'Ege': '#529a93',
  'Karadeniz': '#82a87e',
  'İç Anadolu': '#ccbf7a',
  'Akdeniz': '#d59860',
  'Güneydoğu Anadolu': '#c58a8a',
  'Doğu Anadolu': '#a897b5',
};

function hexHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255,
    g = parseInt(hex.slice(3, 5), 16) / 255,
    b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hslHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;
    const t = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = t(h + 1 / 3);
    g = t(h);
    b = t(h - 1 / 3);
  }
  const x = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}
// Her ile bölge tonundan türetilmiş, komşulardan ayrık, mat bir renk.
function ilRenkleri() {
  const DL = [24, 6, -10, -26, 16, -18, 34, 0, -34, 12, -6];
  const DH = [0, 22, -18, 12, -26, 30, -8, 16, 6, -14, 26];
  const DS = [0, -16, 14, -8, 18, -22, 8, -12, 22, -6, 4];
  const perRegion = {},
    out = {};
  Object.keys(kanonik)
    .sort()
    .forEach((kod) => {
      const b = kanonik[kod].bolge;
      perRegion[b] = perRegion[b] || 0;
      const idx = perRegion[b]++;
      const [h, s, l] = hexHsl(BOLGE_RENK[b] || '#aaaaaa');
      const i = idx % 11;
      out[kod] = hslHex(
        (h + DH[i] + 360) % 360,
        Math.max(14, Math.min(52, s + DS[i])),
        Math.max(27, Math.min(84, l + DL[i]))
      );
    });
  return out;
}

module.exports = { ARAZI_RENK, ARAZI_AD, BOLGE_RENK, hexHsl, hslHex, ilRenkleri };
