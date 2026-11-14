// BÖLÜMLEME ÖNİZLEMESİ — Görev 03C / yeniden bölümleme.
// Çalıştırma:  node scripts/bolumleme-onizleme.js
//
// 81 il için ESKİ ve YENİ bölümlemeyi yan yana çizer: onizleme/bolumleme-yeni.html
// Her parçanın etiket noktasına, parçayla AYNI ÖLÇEKTE bir ordu rozeti konur —
// rozetin parçaya sığıp sığmadığı böylece gözle görülür.
//
// Girdi: veri/ham/ilce-hazir.json (ilçe geometrileri + eski parça bilgisi)
//        veri/ham/parca-tablo-yeni.json (aday bölümleme)

const fs = require('fs');
const path = require('path');
const polylabel = require('polylabel').default || require('polylabel');

const PROJ = path.join(__dirname, '..');
const ilceler = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/ham/ilce-hazir.json'), 'utf8'));
const yeniTablo = JSON.parse(
  fs.readFileSync(path.join(PROJ, 'veri/ham/parca-tablo-yeni.json'), 'utf8')
);
const eskiTablo = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/ham/parca-tablo.json'), 'utf8'));

const KM_PER_BIRIM = 1.6;
const ESIK_BIRIM = 14.25;
const RENKLER = ['#b0904f', '#7593b0', '#82a87e', '#c58a8a', '#a897b5'];

// ilçe adı -> yeni parça no (il bazında)
const yeniHarita = {};
yeniTablo.forEach((p) => {
  p.ilceler.forEach((ad) => (yeniHarita[p.kod + '|' + ad] = p.parcaNo));
});

function kmNokta(c, ortLat) {
  return [c[0] * 111.32 * Math.cos((ortLat * Math.PI) / 180), c[1] * 110.57];
}

// Bir grubun (parçanın) en büyük gövdesinde iç çember: {x, y, cap} — km düzleminde
function icCember(grup, ortLat) {
  let en = null;
  for (const d of grup) {
    const g = d.geom;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      const halka = poly[0].map((c) => kmNokta(c, ortLat));
      let alan = 0;
      for (let i = 0, n = halka.length, j = n - 1; i < n; j = i++)
        alan += halka[j][0] * halka[i][1] - halka[i][0] * halka[j][1];
      if (Math.abs(alan / 2) < 30) continue;
      const nk = polylabel([halka], 0.4);
      if (!en || nk.distance > en.distance) en = { pt: nk, distance: nk.distance };
    }
  }
  // Not: parçanın tamamı yerine en büyük İLÇE gövdesinde ölçülüyor (birleşim maliyetli);
  // asıl ölçüm scripts/parca-olcum.js'te, gerçek parça geometrisi üzerinde yapılır.
  return en ? { x: en.pt[0], y: en.pt[1], cap: en.distance * 2 } : null;
}

const ilKodlari = [...new Set(ilceler.map((d) => d.kod))].sort();
const bloklar = [];

for (const kod of ilKodlari) {
  const D = ilceler.filter((d) => d.kod === kod);
  const ortLat = D.reduce((a, d) => a + d.pt[1], 0) / D.length;
  const ilAd = D[0] ? (eskiTablo.find((p) => p.kod === kod) || {}).ilAd || kod : kod;

  // km düzleminde çiz
  const yollar = D.map((d) => {
    const g = d.geom;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const yol = polys
      .map(
        (poly) =>
          'M' +
          poly[0]
            .map((c) => {
              const k = kmNokta(c, ortLat);
              return k[0].toFixed(2) + ',' + (-k[1]).toFixed(2);
            })
            .join('L') +
          'Z'
      )
      .join('');
    return { ad: d.ad, yol, eski: d.eskiParca, yeni: yeniHarita[kod + '|' + d.ad] || 0 };
  });

  const tumNokta = [];
  D.forEach((d) => {
    const g = d.geom;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    polys.forEach((poly) =>
      poly[0].forEach((c) => {
        const k = kmNokta(c, ortLat);
        tumNokta.push([k[0], -k[1]]);
      })
    );
  });
  const minX = Math.min(...tumNokta.map((p) => p[0])),
    maxX = Math.max(...tumNokta.map((p) => p[0])),
    minY = Math.min(...tumNokta.map((p) => p[1])),
    maxY = Math.max(...tumNokta.map((p) => p[1]));

  function parcaBilgi(tablo, alan) {
    const gruplar = {};
    D.forEach((d) => {
      const no = alan === 'eski' ? d.eskiParca : yeniHarita[kod + '|' + d.ad] || 0;
      (gruplar[no] = gruplar[no] || []).push(d);
    });
    return Object.keys(gruplar)
      .sort()
      .map((no) => {
        const satir = tablo.find((p) => p.kod === kod && String(p.parcaNo) === String(no));
        const c = icCember(gruplar[no], ortLat);
        return {
          no,
          ad: satir ? satir.parcaAd : '(?)',
          arazi: satir ? satir.arazi : '?',
          nufus: satir ? satir.nufus : 0,
          ekonomi: satir ? satir.ekonomi : 0,
          cap: c ? c.cap : 0,
          x: c ? c.x : 0,
          y: c ? -c.y : 0,
        };
      });
  }

  bloklar.push({
    kod,
    ad: ilAd,
    yollar,
    kutu: [minX, minY, maxX - minX, maxY - minY],
    eski: parcaBilgi(eskiTablo, 'eski'),
    yeni: parcaBilgi(yeniTablo, 'yeni'),
  });
}

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><title>Yeni bölümleme — eski/yeni karşılaştırma</title>
<style>
 body{margin:0;font-family:system-ui,sans-serif;background:#1b2026;color:#e7e1d1}
 header{padding:14px 18px;border-bottom:1px solid #3a444d;position:sticky;top:0;background:#1b2026;z-index:5}
 h1{margin:0 0 6px;font-size:18px}
 .alt{font-size:12.5px;color:#9a9585;line-height:1.55}
 input{background:#262d33;border:1px solid #4a5560;color:#e7e1d1;border-radius:8px;padding:7px 11px;font-size:13px;width:220px}
 .il{border-bottom:1px solid #2b3238;padding:16px 18px}
 .basl{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
 .basl h2{margin:0;font-size:16px;color:#b0904f}
 .rozet-uyari{color:#e07a5f;font-size:12px}
 .ikili{display:flex;gap:22px;flex-wrap:wrap}
 .yan{flex:1;min-width:330px}
 .etiket{font-size:11px;letter-spacing:1.6px;color:#9a9585;margin-bottom:6px}
 svg{background:#7d8f9c;border-radius:10px;width:100%;height:230px}
 table{border-collapse:collapse;width:100%;font-size:12px;margin-top:8px}
 td,th{padding:3px 6px;border-bottom:1px solid #2b3238;text-align:left}
 th{color:#9a9585}
 .kirmizi{color:#e07a5f;font-weight:700}
 .sayi{text-align:right;font-variant-numeric:tabular-nums}
 .nokta{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:middle}
</style></head><body>
<header>
 <h1>YENİ BÖLÜMLEME — eski / yeni karşılaştırma</h1>
 <div class="alt">
  Rozetler parçayla <b>aynı ölçekte</b> çizildi: rozet parçanın içine sığmıyorsa o parça oyunda okunmaz.
  <b class="kirmizi">Kırmızı</b> = iç çember ${ESIK_BIRIM} birimin altında.
  Arama kutusuna il adı yazarak süzebilirsin.
 </div>
 <div style="margin-top:8px"><input id="ara" placeholder="il ara… (ör. Kayseri)"></div>
</header>
<div id="liste"></div>
<script>
const BLOKLAR = ${JSON.stringify(bloklar)};
const RENKLER = ${JSON.stringify(RENKLER)};
const ESIK = ${ESIK_BIRIM}, KMB = ${KM_PER_BIRIM};
const ROZET_BIRIM = 26 / (0.912 * 2); // yatay tutuş 2× — Baki'nin eşiği (birim cinsinden çap)

function harita(b, alan) {
  const [x, y, w, h] = b.kutu;
  const parcalar = b[alan];
  const rozetYaricap = (ROZET_BIRIM * KMB) / 2; // km cinsinden
  let s = '<svg viewBox="' + (x - w*0.03) + ' ' + (y - h*0.03) + ' ' + w*1.06 + ' ' + h*1.06 + '">';
  for (const yol of b.yollar) {
    const no = alan === 'eski' ? yol.eski : yol.yeni;
    const i = parcalar.findIndex(p => String(p.no) === String(no));
    s += '<path d="' + yol.yol + '" fill="' + (RENKLER[i] || '#888') + '" stroke="#33404d" stroke-width="' + (w/400) + '"/>';
  }
  for (const p of parcalar) {
    if (!p.cap) continue;
    const sigar = (p.cap / KMB) >= ESIK;
    s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + rozetYaricap + '" fill="' + (sigar ? '#20241a' : '#c0392b') +
         '" stroke="#e7e1d1" stroke-width="' + (w/500) + '"/>';
    s += '<text x="' + p.x + '" y="' + (p.y + rozetYaricap*0.38) + '" text-anchor="middle" fill="#fff" font-size="' + rozetYaricap + '" font-weight="700">12</text>';
  }
  return s + '</svg>';
}
function tablo(parcalar) {
  return '<table><thead><tr><th>Parça</th><th>Arazi</th><th class="sayi">nüfus</th><th class="sayi">ekonomi</th><th class="sayi">iç çember</th></tr></thead><tbody>' +
   parcalar.map((p,i) => {
     const birim = (p.cap / KMB);
     return '<tr><td><span class="nokta" style="background:'+(RENKLER[i]||'#888')+'"></span>' + p.ad + '</td><td>' + p.arazi +
     '</td><td class="sayi">' + p.nufus + '</td><td class="sayi">' + p.ekonomi +
     '</td><td class="sayi ' + (birim < ESIK ? 'kirmizi' : '') + '">' + birim.toFixed(1) + '</td></tr>';
   }).join('') + '</tbody></table>';
}
function ciz(sz) {
  const q = (sz||'').toLocaleLowerCase('tr');
  document.getElementById('liste').innerHTML = BLOKLAR.filter(b => !q || b.ad.toLocaleLowerCase('tr').includes(q) || b.kod.includes(q)).map(b => {
    const degisti = b.eski.length !== b.yeni.length;
    const kucuk = b.yeni.filter(p => (p.cap/KMB) < ESIK).length;
    return '<div class="il"><div class="basl"><h2>' + b.kod + ' ' + b.ad + '</h2>' +
      '<span class="alt">' + b.eski.length + ' parça → <b>' + b.yeni.length + ' parça</b>' + (degisti ? ' (değişti)' : '') + '</span>' +
      (kucuk ? '<span class="rozet-uyari">' + kucuk + ' parçada rozet sığmıyor</span>' : '') + '</div>' +
      '<div class="ikili"><div class="yan"><div class="etiket">ESKİ</div>' + harita(b,'eski') + tablo(b.eski) + '</div>' +
      '<div class="yan"><div class="etiket">YENİ</div>' + harita(b,'yeni') + tablo(b.yeni) + '</div></div></div>';
  }).join('');
}
document.getElementById('ara').oninput = e => ciz(e.target.value);
ciz('');
</script></body></html>`;

fs.writeFileSync(path.join(PROJ, 'onizleme/bolumleme-yeni.html'), html, 'utf8');
console.log('onizleme/bolumleme-yeni.html yazıldı (' + bloklar.length + ' il).');
