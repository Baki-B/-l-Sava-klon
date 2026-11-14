// Ortak harita projeksiyonu — hem il hem parça haritası aynı projeksiyonu kullanır.
// Lambert Conformal Conic (Türkiye enlemine uygun konik projeksiyon).
// Ham enlem/boylam doğrudan çizilirse Türkiye yatay basık görünür; bu düzeltir.

const D2R = Math.PI / 180;
const f1 = 37 * D2R,
  f2 = 41 * D2R,
  f0 = 39 * D2R,
  l0 = 35 * D2R;
const nLcc =
  Math.log(Math.cos(f1) / Math.cos(f2)) /
  Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
const Flcc = (Math.cos(f1) * Math.pow(Math.tan(Math.PI / 4 + f1 / 2), nLcc)) / nLcc;
const rho0 = Flcc / Math.pow(Math.tan(Math.PI / 4 + f0 / 2), nLcc);

// [lon,lat] -> [x,y]  (y yukarı)
function lcc(lon, lat) {
  const phi = lat * D2R,
    lam = lon * D2R;
  const rho = Flcc / Math.pow(Math.tan(Math.PI / 4 + phi / 2), nLcc);
  const theta = nLcc * (lam - l0);
  return [rho * Math.sin(theta), rho0 - rho * Math.cos(theta)];
}

module.exports = { lcc, aciklama: 'Lambert Conformal Conic (parallels 37/41, merkez 35°D 39°K)' };
