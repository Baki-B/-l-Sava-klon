// PARÇA YENİDEN BÖLÜMLEME — Baki'nin 2026-07-26 karar değişikliği.
// Çalıştırma:  node scripts/parca-yeniden-bol.js
//
// YENİ KURALLAR (eski "coğrafi kontrast" kuralının yerine geçer):
//   1. Parça sayısı 1–4. Az parça = az karmaşa, daha okunaklı harita.
//   2. BİRİNCİL ÖLÇÜT: parça haritada düzgün (tıknaz) dursun ve üstüne konan
//      ordu rozeti okunabilsin → iç çember çapı eşiğin üstünde olsun.
//   3. İKİNCİL ÖLÇÜT: nüfus/ekonomi dağılımı dengeli olsun — eşitlik aranmaz,
//      "ölü parça" (payı çok küçük) olmasın.
//   4. ARAZİ artık bölmeyi belirlemez: parçanın içindeki baskın arazi, parçanın arazisi olur.
//      İSTİSNA: arazisi üçe yakın eşit dağılmış illerde arazi BİRİNCİL ölçüt olur.
//
// Bu betik veriyi DEĞİŞTİRMEZ; aday tabloyu ve önizlemeyi üretir:
//   veri/ham/parca-tablo-yeni.json     — aday bölümleme (onaydan sonra asıl tablonun yerine geçer)
//   onizleme/bolumleme-yeni.html       — il il eski/yeni karşılaştırma
//
// PAYLAR NASIL HESAPLANIYOR: ilçe bazında nüfus verisi yok (Baki: "payları sen takdir et,
// tek ölçüt nüfus değil"). Her ilçe, bugünkü parçasının payını o parçadaki ilçe sayısına
// bölerek devralır; yeni parçanın payı bu ilçe paylarının toplamıdır. Yani bugünkü elle
// verilmiş paylar korunur, sadece yeniden gruplanır. Sonuç TAHMİNDİR.

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const polylabel = require('polylabel').default || require('polylabel');
const kanonik = require('./iller-kanonik');

const PROJ = path.join(__dirname, '..');
const ADM1 = path.join(PROJ, 'veri/ham/geoBoundaries-TUR-ADM1.geojson');
const ADM2 = path.join(PROJ, 'veri/ham/geoBoundaries-TUR-ADM2.geojson');
const TABLO = path.join(PROJ, 'veri/ham/parca-tablo.json');

// ---- ayarlar ----
const MAX_PARCA = 4; // Baki: parça sayısı 1–4
const ESIK_BIRIM = 14.25; // iç çember eşiği (harita birimi) — rozet okunabilirliği
const KM_PER_BIRIM = 1.6; // 1000 birim ≈ 1600 km
const ESIK_KM = ESIK_BIRIM * KM_PER_BIRIM; // ≈ 22.8 km çap
const HEDEF_MIN_PAY = 0.1; // "ölü parça" olmasın — yumuşak denge hedefi
const ALT_SINIR_PAY = 0.06; // bunun altına düşen bölme kabul edilmez
const DENGESIZ_ARAZI = 0.28; // her arazi tipi ≥ %28 ise "üçe bölünmüş arazi" sayılır

function norm(s) {
  return String(s)
    .toLocaleLowerCase('tr-TR')
    .replace(/[çc]/g, 'c')
    .replace(/[ğg]/g, 'g')
    .replace(/[ıi̇i]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[şs]/g, 's')
    .replace(/[üu]/g, 'u')
    .replace(/[âa]/g, 'a')
    .replace(/[î]/g, 'i')
    .replace(/[û]/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}
const ALIAS = { gokceada: 'imbros' };

console.log('== 1. Veri okunuyor ==');
const adm1 = JSON.parse(fs.readFileSync(ADM1, 'utf8'));
const adm2 = JSON.parse(fs.readFileSync(ADM2, 'utf8'));
const tablo = JSON.parse(fs.readFileSync(TABLO, 'utf8'));

const iller = adm1.features.map((f) => ({
  kod: String(parseInt((f.properties.shapeISO || '').replace('TR-', ''), 10)).padStart(2, '0'),
  feat: f,
  bbox: turf.bbox(f),
}));

console.log('== 2. İlçeler illere bağlanıyor ==');
adm2.features.forEach((d) => {
  let pt;
  try {
    pt = turf.pointOnFeature(d);
  } catch (e) {
    pt = turf.centroid(d);
  }
  const [x, y] = pt.geometry.coordinates;
  let bulunan = null;
  for (const il of iller) {
    const b = il.bbox;
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    if (turf.booleanPointInPolygon(pt, il.feat)) {
      bulunan = il.kod;
      break;
    }
  }
  d.properties._kod = bulunan;
  d.properties._n = norm(d.properties.shapeName);
  d.properties._merkez = /merkez/.test(d.properties._n);
  d.properties._pt = [x, y];
});

console.log('== 3. Bugünkü parçalar ilçelere devrediliyor (pay + arazi mirası) ==');
const ilAdm2 = {};
adm2.features.forEach((d) => {
  if (d.properties._kod) (ilAdm2[d.properties._kod] = ilAdm2[d.properties._kod] || []).push(d);
});

// ÖNEMLİ: ham tablo, Görev 03B'deki birleştirmelerden ÖNCEKİ hâli tutuyor.
// Yeniden bölümlemenin başlangıç noktası OYUNDAKİ GÜNCEL bölümleme olmalı — yoksa
// bilerek birleştirdiğimiz parçalar (İstanbul Suriçi gibi) geri dirilir.
// Bu yüzden BIRLESTIR ayarını tabloya burada uyguluyoruz.
const { BIRLESTIR, AD_DEGISTIR, ARAZI_ZORLA } = require('./parca-ayarlar');
const birlesikTablo = [];
{
  const indeks = {};
  tablo.forEach((p) => (indeks[p.kod + '-' + p.parcaNo] = { ...p, ilceler: [...p.ilceler] }));
  Object.entries(BIRLESTIR).forEach(([src, dst]) => {
    const a = indeks[src],
      b = indeks[dst];
    if (!a || !b) return;
    b.ilceler = b.ilceler.concat(a.ilceler);
    b.nufus = +(b.nufus + a.nufus).toFixed(2);
    b.ekonomi = +(b.ekonomi + a.ekonomi).toFixed(2);
    delete indeks[src];
  });
  Object.entries(AD_DEGISTIR).forEach(([pid, ad]) => indeks[pid] && (indeks[pid].parcaAd = ad));
  Object.entries(ARAZI_ZORLA).forEach(([pid, ar]) => indeks[pid] && (indeks[pid].arazi = ar));
  Object.values(indeks).forEach((p) => birlesikTablo.push(p));
  console.log(
    '  ham tablo ' + tablo.length + ' parça → güncel bölümleme ' + birlesikTablo.length + ' parça'
  );
}
const ilParca = {};
birlesikTablo.forEach((p) => (ilParca[p.kod] = ilParca[p.kod] || []).push(p));

const eslesmeyen = [];
Object.keys(ilParca).forEach((kod) => {
  const dList = ilAdm2[kod] || [];
  const nIndex = {};
  dList.forEach((d) => (nIndex[d.properties._n] = nIndex[d.properties._n] || []).push(d));
  const merkezler = dList.filter((d) => d.properties._merkez);
  const nIlAd = norm(kanonik[kod].ad);

  ilParca[kod].forEach((p) => {
    const hedefler = [];
    if (p.ilceler.some((i) => /tüm il[çc]e/i.test(i))) {
      dList.forEach((d) => hedefler.push(d));
    } else {
      p.ilceler.forEach((ad) => {
        const n = ALIAS[norm(ad)] || norm(ad);
        let hedef = null;
        if (n === 'merkez') {
          hedef =
            merkezler[0] ||
            dList.find((d) => d.properties._n === nIlAd) ||
            dList.find((d) => d.properties._n === nIlAd + 'district') ||
            dList.find((d) => d.properties._n.startsWith(nIlAd));
        } else if (nIndex[n]) hedef = nIndex[n][0];
        else hedef = dList.find((d) => d.properties._n === n + 'merkez');
        if (hedef) hedefler.push(hedef);
        else eslesmeyen.push(kod + ' ' + kanonik[kod].ad + ' : ' + ad);
      });
    }
    // pay eşit bölünerek devredilir (ilçe nüfus verisi yok — bkz. dosya başı notu)
    const n = hedefler.length || 1;
    hedefler.forEach((d) => {
      d.properties._payN = p.nufus / n;
      d.properties._payE = p.ekonomi / n;
      d.properties._arazi = p.arazi;
      d.properties._eskiParca = p.parcaNo;
      d.properties._eskiAd = p.parcaAd;
    });
  });
});

// Tabloda adı geçmeyen 5 ilçe: asıl boru hattında (parca-uret.js ELLE) elle atanıyor.
// Aynı atamayı burada da yap ki payları/arazileri kaybolmasın.
const ELLE = {
  '25|karayazi': 3,
  '34|bakirkoy': 2,
  '34|sariyer': 1,
  '58|gurun': 2,
  '34|princeislands': 3,
};
Object.entries(ELLE).forEach(([anahtar, no]) => {
  const [kod, nad] = anahtar.split('|');
  const d = (ilAdm2[kod] || []).find((x) => x.properties._n === nad);
  const p = (ilParca[kod] || []).find((x) => x.parcaNo === no);
  if (!d || !p) return console.log('  ELLE ATAMA BULUNAMADI: ' + anahtar);
  // O parçadaki ilçe sayısı bir artıyor; payı yeniden bölmek yerine ortalama pay verilir.
  const kardes = (ilAdm2[kod] || []).filter((x) => x.properties._eskiParca === no);
  const n = kardes.length || 1;
  d.properties._payN = p.nufus / n;
  d.properties._payE = p.ekonomi / n;
  d.properties._arazi = p.arazi;
  d.properties._eskiParca = no;
  d.properties._eskiAd = p.parcaAd;
});

// GERÇEK EŞLEME: yukarıdaki tablo eşleştirmesi başlangıç noktası olarak yetmez —
// asıl boru hattı ayrıca kopuk kalan ilçeleri komşu parçaya taşıyor (Trabzon'da Maçka,
// Şalpazarı, Tonya, Düzköy gibi) ve tabloda adı geçmeyen ilçeleri elle atıyor (Sarıyer,
// Bakırköy, Adalar...). `veri/ham/ilce-parca.json` (parca-uret.js yazar) oyundaki GERÇEK
// ilçe→parça eşlemesidir; mirası doğrudan ondan kuruyoruz.
const gercek = require(path.join(PROJ, 'veri/ham/ilce-parca.json'));
const gercekHarita = {};
gercek.forEach((g) => (gercekHarita[g.kod + '|' + norm(g.ilce)] = g.pid));

// her canlı parçanın ilçe sayısı (pay eşit bölünecek)
const parcaIlceSayisi = {};
adm2.features.forEach((d) => {
  const pid = gercekHarita[d.properties._kod + '|' + d.properties._n];
  if (pid) parcaIlceSayisi[pid] = (parcaIlceSayisi[pid] || 0) + 1;
});

let esiz = 0;
adm2.features.forEach((d) => {
  if (!d.properties._kod) return;
  const pid = gercekHarita[d.properties._kod + '|' + d.properties._n];
  const no = pid ? Number(pid.split('-')[1]) : null;
  const p = no ? (ilParca[d.properties._kod] || []).find((x) => x.parcaNo === no) : null;
  if (!p) {
    // gerçek eşlemede yoksa (olmamalı) pay verme, ama bölümlemeye girsin
    d.properties._payN = 0;
    d.properties._payE = 0;
    d.properties._arazi = d.properties._arazi || 'tepelik';
    d.properties._eskiParca = d.properties._eskiParca || 0;
    d.properties._eskiAd = d.properties._eskiAd || '(eşleşmedi)';
    esiz++;
    return;
  }
  const n = parcaIlceSayisi[pid] || 1;
  d.properties._payN = p.nufus / n;
  d.properties._payE = p.ekonomi / n;
  d.properties._arazi = p.arazi;
  d.properties._eskiParca = no;
  d.properties._eskiAd = p.parcaAd;
});
console.log(
  '  eşleşmeyen tablo satırı: ' + eslesmeyen.length + ', gerçek eşlemede bulunamayan ilçe: ' + esiz
);

// ---- yardımcılar ----
// Düzlem koordinat (km): enlem ortalamasına göre boylam düzeltmesi.
function kmDuzlem(lon, lat, ortLat) {
  return [lon * 111.32 * Math.cos((ortLat * Math.PI) / 180), lat * 110.57];
}

// İki ilçe sınır paylaşıyor mu?
function komsuMu(a, b) {
  const ba = turf.bbox(a),
    bb = turf.bbox(b);
  if (ba[0] > bb[2] + 0.01 || bb[0] > ba[2] + 0.01 || ba[1] > bb[3] + 0.01 || bb[1] > ba[3] + 0.01)
    return false;
  try {
    return turf.booleanIntersects(a, b);
  } catch (e) {
    return false;
  }
}

// Kümenin birleşik geometrisinde iç çember çapı (km).
function icCemberKm(ilceler, ortLat) {
  let birlesik = null;
  for (const d of ilceler) {
    try {
      birlesik = birlesik ? turf.union(turf.featureCollection([birlesik, d])) : d;
    } catch (e) {
      /* birleşemezse mevcut hâliyle devam */
    }
  }
  if (!birlesik) return 0;
  const geom = birlesik.geometry;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let enIyi = 0;
  for (const poly of polys) {
    const halka = poly[0].map(([lon, lat]) => kmDuzlem(lon, lat, ortLat));
    const alan = Math.abs(
      halka.reduce((a, p, i, arr) => {
        const q = arr[(i + 1) % arr.length];
        return a + (p[0] * q[1] - q[0] * p[1]);
      }, 0) / 2
    );
    if (alan < 30) continue; // küçük adalar rozet taşımaz
    const nokta = polylabel([halka], 0.3);
    if (nokta.distance * 2 > enIyi) enIyi = nokta.distance * 2;
  }
  return enIyi;
}

// Küme bağlantılı mı (kara olarak bütün)?
function bagliMi(indeksler, komsuluk) {
  if (indeksler.length <= 1) return true;
  const kume = new Set(indeksler);
  const gorulen = new Set([indeksler[0]]);
  const yigin = [indeksler[0]];
  while (yigin.length) {
    const x = yigin.pop();
    for (const y of komsuluk[x]) {
      if (kume.has(y) && !gorulen.has(y)) {
        gorulen.add(y);
        yigin.push(y);
      }
    }
  }
  return gorulen.size === indeksler.length;
}

module.exports = { norm, kmDuzlem, komsuMu, icCemberKm, bagliMi };

// Geri kalan (kümeleme + çıktı) ikinci dosyada: parca-yeniden-bol-2.js
console.log('\n== HAZIRLIK TAMAM ==');
console.log('  ' + adm2.features.filter((d) => d.properties._kod).length + ' ilçe illere bağlandı');
console.log('  Kümeleme ve çıktı için: node scripts/parca-yeniden-bol-2.js');

// Hazırlanan veriyi ara dosyaya yaz (ikinci aşama okusun; ADM2 yeniden işlenmesin)
const hazir = adm2.features
  .filter((d) => d.properties._kod)
  .map((d) => ({
    kod: d.properties._kod,
    ad: d.properties.shapeName,
    n: d.properties._n,
    merkez: d.properties._merkez,
    pt: d.properties._pt,
    payN: d.properties._payN,
    payE: d.properties._payE,
    arazi: d.properties._arazi,
    eskiParca: d.properties._eskiParca,
    eskiAd: d.properties._eskiAd,
    geom: d.geometry,
  }));
fs.writeFileSync(path.join(PROJ, 'veri/ham/ilce-hazir.json'), JSON.stringify(hazir), 'utf8');
console.log('  veri/ham/ilce-hazir.json yazıldı (' + hazir.length + ' ilçe)');
