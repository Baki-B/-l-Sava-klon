// PARÇA ÖLÇÜM BETİĞİ — Görev 03B / Adım 3.
// Çalıştırma:  node scripts/parca-olcum.js
//
// SORU: Görev 04'te gelecek ordu rozeti (sayı balonu) hangi parçalara sığmıyor?
//
// ÖLÇÜ: parçanın içine sığan EN BÜYÜK DAİRENİN ÇAPI ("iç çember"). Alan kullanılmaz —
// uzun ince bir kıyı şeridi büyük alana sahip olabilir ama rozeti taşıyamaz.
// İç çember yarıçapı zaten hesapladığımız polylabel algoritmasından geliyor:
// polylabel, sınırlara en uzak iç noktayı verirken o uzaklığı da döndürüyor.
//
// ADALAR: ölçüm parçanın EN BÜYÜK KARA GÖVDESİ üzerinde yapılır, ada üzerinde değil
// (rozet anakarada durmalı; ör. Çanakkale 3'ün Gökçeada'sı ölçüme girmez).
//
// Çıktılar:
//   veri/parca-olcum.md          — 192 parça, en küçükten büyüğe sıralı tablo
//   onizleme/rozet-testi.html    — tarayıcıda açılan görsel önizleme (rozetli harita)

const fs = require('fs');
const path = require('path');
const polylabel = require('polylabel').default || require('polylabel');

const PROJ = path.join(__dirname, '..');
const parcalarDosya = require(path.join(PROJ, 'veri', 'parcalar.json'));
const P = parcalarDosya.parcalar;
const ILLER = require(path.join(PROJ, 'veri', 'iller.json'));
const META = parcalarDosya.meta;

// ---- Referanslar (görev tanımı §7.2) ----
const ROZET_CAP = 26; // px — Risk tarzı sayı rozeti için makul başlangıç (Görev 04'te kesinleşir)
const TELEFON_G = 412; // dp — referans telefon genişliği (dik tutuş)
const TELEFON_Y = 915; // dp — referans telefon yüksekliği
// Uygulamada harita `viewBox="0 0 GENISLIK YUKSEKLIK"` ile ekrana SIĞDIRILARAK çizilir.
// 1× yakınlaştırma = tüm Türkiye ekranda; ölçek iki kenardan küçüğüne göre belirlenir.
const BIRIM_PX = Math.min(TELEFON_G / META.genislik, TELEFON_Y / META.yukseklik);
// Telefon yatay tutulunca harita çok daha büyük çizilir — strateji haritası için asıl
// oynanacak tutuş bu. İki tutuşu da raporluyoruz.
const BIRIM_PX_YATAY = Math.min(TELEFON_Y / META.genislik, TELEFON_G / META.yukseklik);

// ---- yol -> halkalar ----
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

function alan(r) {
  let a = 0;
  for (let i = 0, n = r.length, j = n - 1; i < n; j = i++)
    a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return Math.abs(a / 2);
}

// Parçanın en büyük kara gövdesi üzerinde iç çember: {x, y, yaricap, cap}
function icCember(pid) {
  const rings = halkalar(P[pid].yol);
  if (rings.length === 0) return null;
  let enBuyuk = rings[0],
    enAlan = alan(rings[0]);
  for (const r of rings) {
    const a = alan(r);
    if (a > enAlan) {
      enAlan = a;
      enBuyuk = r;
    }
  }
  const nokta = polylabel([enBuyuk], 0.05);
  return {
    x: +nokta[0].toFixed(1),
    y: +nokta[1].toFixed(1),
    yaricap: nokta.distance,
    cap: nokta.distance * 2,
    govdeSayisi: rings.length,
    govdeAlani: enAlan,
  };
}

// ---- ölç ----
const olcumler = Object.keys(P)
  .map((pid) => {
    const c = icCember(pid);
    const il = ILLER[P[pid].kod];
    return {
      pid,
      ad: P[pid].ad,
      il: P[pid].il,
      ilKod: P[pid].kod,
      tekParcali: il.parcaSayisi === 1,
      x: c.x,
      y: c.y,
      cap: c.cap,
      capPx1: c.cap * BIRIM_PX,
      capPx2: c.cap * BIRIM_PX * 2,
      capPx3: c.cap * BIRIM_PX * 3,
      govdeSayisi: c.govdeSayisi,
    };
  })
  .sort((a, b) => a.cap - b.cap);

const sigar = (px) => px >= ROZET_CAP;

// ---- A) veri/parca-olcum.md ----
const satir = (o) =>
  '| ' +
  [
    o.pid,
    o.ad + (o.tekParcali ? ' *(tek parçalı il)*' : ''),
    o.il,
    o.cap.toFixed(1),
    o.capPx1.toFixed(1),
    o.capPx2.toFixed(1),
    o.capPx3.toFixed(1),
    (sigar(o.capPx1) ? '✅' : '❌') +
      ' / ' +
      (sigar(o.capPx2) ? '✅' : '❌') +
      ' / ' +
      (sigar(o.capPx3) ? '✅' : '❌'),
  ].join(' | ') +
  ' |';

const say = (f) => olcumler.filter(f).length;
const md = [
  '# PARÇA ÖLÇÜMÜ — ordu rozeti sığıyor mu?',
  '',
  '> Üreten: `scripts/parca-olcum.js` (Görev 03B / Adım 3). **Elle düzenleme yok** — veri değişince yeniden üret.',
  '> Görsel karşılığı: `onizleme/rozet-testi.html`',
  '>',
  '> ⚠️ **GÜNCEL ÖLÇÜM BURASI DEĞİL.** Bu belge **dik tutuş** referanslıdır ve yalnızca',
  "> parçaları ölçer. Oyun Görev 04 / Adım 1'de **yatay tutuşa kilitlendi**; ayrıca rozet",
  '> katmanları için **il** ölçümü de gerekiyor. Güncel ölçüm ve katman sınırları:',
  '> **`veri/rozet-katman-olcum.md`** (`node scripts/rozet-katman-olcum.js`).',
  "> Bu belge Görev 03B'nin bölümleme kararlarının tarihsel dayanağı olarak duruyor.",
  '',
  '## Yöntem',
  '',
  '**Ölçü: iç çember çapı.** Parçanın içine sığan en büyük dairenin çapı. Alan kullanılmadı:',
  'uzun ve ince bir kıyı şeridi büyük alana sahip olabilir ama üstüne rozet konamaz.',
  'Değer, etiket noktası için kullanılan **polylabel** algoritmasının döndürdüğü',
  '"sınıra en uzak iç nokta" uzaklığının iki katıdır.',
  '',
  '**Adalar hariç:** ölçüm her parçanın **en büyük kara gövdesi** üzerinde yapıldı.',
  '',
  '**Piksele çevirme:** harita ' +
    META.genislik +
    '×' +
    META.yukseklik +
    ' birim; referans telefon ' +
    TELEFON_G +
    '×' +
    TELEFON_Y +
    ' dp (dik tutuş).',
  '1× = tüm Türkiye ekranda → **1 harita birimi = ' + BIRIM_PX.toFixed(3) + ' piksel**.',
  '',
  '**Rozet çapı: ' +
    ROZET_CAP +
    " piksel** (iki haneli sayı için makul başlangıç; Görev 04'te kesinleşecek).",
  '',
  '## Özet',
  '',
  '| Yakınlaştırma | Rozet sığan | Sığmayan |',
  '|---|---|---|',
  '| 1× (tüm Türkiye) | ' +
    say((o) => sigar(o.capPx1)) +
    ' | ' +
    say((o) => !sigar(o.capPx1)) +
    ' |',
  '| 2× | ' + say((o) => sigar(o.capPx2)) + ' | ' + say((o) => !sigar(o.capPx2)) + ' |',
  '| 3× | ' + say((o) => sigar(o.capPx3)) + ' | ' + say((o) => !sigar(o.capPx3)) + ' |',
  '',
  'Toplam **' +
    olcumler.length +
    ' parça**. Bunların **' +
    say((o) => o.tekParcali) +
    ' tanesi tek parçalı ilin tek parçası** — küçük olsalar bile birleştirilemezler (bir il 1 parçanın altına inemez).',
  '',
  '### Yatay tutuş (telefon yan çevrilince)',
  '',
  'Harita yatayda çok daha büyük çizilir: **1 harita birimi = ' +
    BIRIM_PX_YATAY.toFixed(3) +
    ' piksel** (dik tutuşun ' +
    (BIRIM_PX_YATAY / BIRIM_PX).toFixed(1) +
    ' katı).',
  '',
  '| Yakınlaştırma | Rozet sığan | Sığmayan |',
  '|---|---|---|',
  '| 1× | ' +
    say((o) => sigar(o.cap * BIRIM_PX_YATAY)) +
    ' | ' +
    say((o) => !sigar(o.cap * BIRIM_PX_YATAY)) +
    ' |',
  '| 2× | ' +
    say((o) => sigar(o.cap * BIRIM_PX_YATAY * 2)) +
    ' | ' +
    say((o) => !sigar(o.cap * BIRIM_PX_YATAY * 2)) +
    ' |',
  '| 3× | ' +
    say((o) => sigar(o.cap * BIRIM_PX_YATAY * 3)) +
    ' | ' +
    say((o) => !sigar(o.cap * BIRIM_PX_YATAY * 3)) +
    ' |',
  '',
  '## Eşik seçenekleri — kaç parça birleşir?',
  '',
  'Karar "hangi yakınlaştırmada okunsun" sorusuna denk gelir. Aşağıdaki tablo, seçilecek',
  '**en küçük iç çember** değerine göre kaç parçanın eşiğin altında kaldığını gösterir.',
  'Tek parçalı illerin parçaları birleştirilemez (bir il 1 parçanın altına inemez), o yüzden',
  'ayrı sayıldı.',
  '',
  '| Eşik (birim) | Dik 1×'.padEnd(10) +
    ' | Yatay 1× | Eşiğin altında | Birleştirilebilir | Kalan parça |',
  '|---|---|---|---|---|---|',
  ...[10, 12, 14, 16, 18, 20, 22, 25].map((esik) => {
    const altinda = olcumler.filter((o) => o.cap < esik);
    const birlesir = altinda.filter((o) => !o.tekParcali);
    return (
      '| ' +
      esik +
      ' | ' +
      (esik * BIRIM_PX).toFixed(1) +
      ' px | ' +
      (esik * BIRIM_PX_YATAY).toFixed(1) +
      ' px | ' +
      altinda.length +
      ' | ' +
      birlesir.length +
      ' | **' +
      (olcumler.length - birlesir.length) +
      '** |'
    );
  }),
  '',
  '> Not: "Kalan parça" en iyi durumdur — zincirleme birleşmede birleşen parça hâlâ eşiğin',
  '> altında kalabilir ve tekrar birleşir; gerçek sayı biraz daha düşük çıkabilir.',
  '',
  '## En küçük 30 parça',
  '',
  '| Parça | Ad | İl | İç çember (birim) | 1× px | 2× px | 3× px | Sığar mı (1×/2×/3×) |',
  '|---|---|---|---|---|---|---|---|',
  ...olcumler.slice(0, 30).map(satir),
  '',
  '## Tüm parçalar (en küçükten büyüğe)',
  '',
  '| Parça | Ad | İl | İç çember (birim) | 1× px | 2× px | 3× px | Sığar mı (1×/2×/3×) |',
  '|---|---|---|---|---|---|---|---|',
  ...olcumler.map(satir),
  '',
];
fs.writeFileSync(path.join(PROJ, 'veri', 'parca-olcum.md'), md.join('\n'), 'utf8');

// ---- B) onizleme/rozet-testi.html ----
const parcaVeri = olcumler.map((o) => ({
  id: o.pid,
  ad: o.ad,
  il: o.il,
  x: o.x,
  y: o.y,
  cap: +o.cap.toFixed(2),
  tek: o.tekParcali,
  yol: P[o.pid].yol,
  renk: P[o.pid].renkIl,
}));

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<title>Rozet testi — ${olcumler.length} parça</title>
<style>
  body { margin:0; font-family: system-ui, sans-serif; background:#1b2026; color:#e7e1d1; }
  header { padding:12px 16px; border-bottom:1px solid #3a444d; }
  h1 { margin:0 0 4px; font-size:17px; letter-spacing:.5px; }
  .alt { font-size:12.5px; color:#9a9585; line-height:1.5; }
  .duzen { display:flex; gap:16px; padding:16px; align-items:flex-start; flex-wrap:wrap; }
  .telefon { border:10px solid #333c45; border-radius:26px; background:#7d8f9c;
             width:412px; height:915px; overflow:hidden; position:relative; flex:none;
             transform-origin: top left; }
  .arac { display:flex; gap:8px; align-items:center; margin-bottom:10px; flex-wrap:wrap; }
  button { background:#2f373f; color:#e7e1d1; border:1px solid #4a5560; border-radius:8px;
           padding:8px 13px; font-size:13px; cursor:pointer; }
  button.aktif { background:#b0904f; color:#20241a; border-color:#b0904f; font-weight:700; }
  .yan { flex:1; min-width:320px; }
  .kutu { background:#262d33; border:1px solid #3a444d; border-radius:10px; padding:12px; margin-bottom:12px; }
  .kutu h2 { margin:0 0 8px; font-size:13px; letter-spacing:1.5px; color:#b0904f; }
  table { border-collapse:collapse; width:100%; font-size:12.5px; }
  th,td { text-align:left; padding:4px 6px; border-bottom:1px solid #333c45; }
  th { color:#9a9585; font-weight:600; }
  .kirmizi { color:#e07a5f; font-weight:700; }
  .sayi { text-align:right; font-variant-numeric: tabular-nums; }
  .ipucu { font-size:12px; color:#9a9585; margin-top:6px; line-height:1.5; }
</style></head><body>
<header>
  <h1>ORDU ROZETİ TESTİ — ${olcumler.length} parça</h1>
  <div class="alt">
    Çerçeve = referans telefon (${TELEFON_G}×${TELEFON_Y} dp). Her parçanın etiket noktasına
    <b>${ROZET_CAP} piksellik</b> örnek rozet konuldu (iki haneli sayı en kötü durum).
    <b class="kirmizi">Kırmızı rozet</b> = parçaya sığmıyor, taşıyor.
    Haritayı sürükleyerek gezebilirsin.
  </div>
</header>
<div class="duzen">
  <div>
    <div class="arac">
      <span class="alt">Yakınlaştırma:</span>
      <button data-z="1" class="aktif">1× (tüm Türkiye)</button>
      <button data-z="2">2×</button>
      <button data-z="3">3×</button>
      <button data-z="4">4×</button>
      <span class="alt">| Tutuş:</span>
      <button id="dik" class="aktif">Dik</button>
      <button id="yatay">Yatay</button>
      <span class="alt" id="ozet"></span>
    </div>
    <div class="telefon" id="telefon">
      <svg id="harita" width="100%" height="100%" viewBox="0 0 ${META.genislik} ${META.yukseklik}"></svg>
    </div>
  </div>
  <div class="yan">
    <div class="kutu">
      <h2>SIĞMAYAN PARÇALAR</h2>
      <div id="liste"></div>
      <div class="ipucu">Tek parçalı illerin parçaları <b>birleştirilemez</b> (bir il 1 parçanın altına inemez) — listede işaretli.</div>
    </div>
    <div class="kutu">
      <h2>EN KÜÇÜK 30 PARÇA</h2>
      <table><thead><tr><th>Parça</th><th>İl</th><th class="sayi">iç çember (birim)</th><th class="sayi">px</th></tr></thead>
      <tbody id="kucukler"></tbody></table>
    </div>
  </div>
</div>
<script>
const PARCALAR = ${JSON.stringify(parcaVeri)};
const ROZET = ${ROZET_CAP}, GEN = ${META.genislik}, YUK = ${META.yukseklik};
const cerceve = document.getElementById('telefon');
const svg = document.getElementById('harita');
let z = 1, kx = 0, ky = 0;

// Ekrandaki 1 pikselin kaç harita birimi ettiği (uygulamadaki çizimle aynı mantık)
function birimPx() {
  return Math.min(cerceve.clientWidth / GEN, cerceve.clientHeight / YUK) * z;
}
function ciz() {
  const bp = birimPx();
  const rozetYaricap = (ROZET / 2) / bp;      // harita birimi cinsinden
  const cizgi = 1 / bp;
  let s = '<g transform="translate(' + kx + ',' + ky + ') scale(' + z + ')">';
  for (const p of PARCALAR) s += '<path d="' + p.yol + '" fill="' + p.renk + '" stroke="#33404d" stroke-width="' + (0.8 / z) + '"/>';
  let sigmaz = 0;
  for (const p of PARCALAR) {
    const sigar = p.cap * bp >= ROZET;
    if (!sigar) sigmaz++;
    s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + rozetYaricap + '" fill="' + (sigar ? '#20241a' : '#c0392b') +
         '" stroke="' + (sigar ? '#e7e1d1' : '#ffd2c8') + '" stroke-width="' + (cizgi * 1.5) + '"/>';
    s += '<text x="' + p.x + '" y="' + (p.y + rozetYaricap * 0.35) + '" text-anchor="middle" fill="#fff" font-size="' + (rozetYaricap * 1.1) +
         '" font-family="system-ui" font-weight="700">12</text>';
  }
  s += '</g>';
  svg.innerHTML = s;
  document.getElementById('ozet').textContent = sigmaz + ' parçada rozet sığmıyor (' + (PARCALAR.length - sigmaz) + ' sığıyor)';
  listeYaz(bp);
}
function listeYaz(bp) {
  const sigmayan = PARCALAR.filter(p => p.cap * bp < ROZET);
  document.getElementById('liste').innerHTML = sigmayan.length === 0
    ? '<div class="alt">Bu yakınlaştırmada hepsi sığıyor.</div>'
    : '<table><thead><tr><th>Parça</th><th>İl</th><th class="sayi">px</th></tr></thead><tbody>' +
      sigmayan.map(p => '<tr><td class="kirmizi">' + p.ad + (p.tek ? ' ⛔' : '') + '</td><td>' + p.il +
        '</td><td class="sayi">' + (p.cap * bp).toFixed(1) + '</td></tr>').join('') + '</tbody></table>';
}
document.getElementById('kucukler').innerHTML = PARCALAR.slice(0, 30).map(p =>
  '<tr><td>' + p.ad + (p.tek ? ' ⛔' : '') + '</td><td>' + p.il + '</td><td class="sayi">' + p.cap.toFixed(1) +
  '</td><td class="sayi" data-px="' + p.cap + '">-</td></tr>').join('');
document.querySelectorAll('button[data-z]').forEach(b => b.onclick = () => {
  document.querySelectorAll('button[data-z]').forEach(x => x.classList.remove('aktif'));
  b.classList.add('aktif');
  const eski = z; z = +b.dataset.z;
  // yakınlaştırma merkezi ekranın ortası kalsın
  const cx = cerceve.clientWidth / 2, cy = cerceve.clientHeight / 2;
  kx = cx - (cx - kx) * (z / eski); ky = cy - (cy - ky) * (z / eski);
  ciz();
  document.querySelectorAll('#kucukler td[data-px]').forEach(td => td.textContent = (+td.dataset.px * birimPx()).toFixed(1));
});
// Tutuş değiştirme — telefonu yan çevirmek haritayı ~2.2 kat büyütür.
function tutus(genislik, yukseklik, aktifId) {
  cerceve.style.width = genislik + 'px';
  cerceve.style.height = yukseklik + 'px';
  document.getElementById('dik').classList.toggle('aktif', aktifId === 'dik');
  document.getElementById('yatay').classList.toggle('aktif', aktifId === 'yatay');
  kx = 0; ky = 0;
  ciz();
  document.querySelectorAll('#kucukler td[data-px]').forEach(td => td.textContent = (+td.dataset.px * birimPx()).toFixed(1));
}
document.getElementById('dik').onclick = () => tutus(${TELEFON_G}, ${TELEFON_Y}, 'dik');
document.getElementById('yatay').onclick = () => tutus(${TELEFON_Y}, ${TELEFON_G}, 'yatay');

let suruklüyor = false, sx = 0, sy = 0;
cerceve.onpointerdown = e => { suruklüyor = true; sx = e.clientX; sy = e.clientY; cerceve.setPointerCapture(e.pointerId); };
cerceve.onpointermove = e => { if (!suruklüyor) return; kx += e.clientX - sx; ky += e.clientY - sy; sx = e.clientX; sy = e.clientY; ciz(); };
cerceve.onpointerup = () => { suruklüyor = false; };
ciz();
document.querySelectorAll('#kucukler td[data-px]').forEach(td => td.textContent = (+td.dataset.px * birimPx()).toFixed(1));
</script></body></html>`;
fs.writeFileSync(path.join(PROJ, 'onizleme', 'rozet-testi.html'), html, 'utf8');

// ---- konsol özeti ----
console.log('PARÇA ÖLÇÜMÜ — ' + olcumler.length + ' parça');
console.log(
  '  1 harita birimi = ' +
    BIRIM_PX.toFixed(3) +
    ' px (telefon ' +
    TELEFON_G +
    '×' +
    TELEFON_Y +
    ', 1×)'
);
console.log('  Rozet çapı: ' + ROZET_CAP + ' px\n');
console.log(
  '  Rozet sığan parça:  1× → ' +
    say((o) => sigar(o.capPx1)) +
    ' / 2× → ' +
    say((o) => sigar(o.capPx2)) +
    ' / 3× → ' +
    say((o) => sigar(o.capPx3))
);
console.log(
  '  Sığmayan:           1× → ' +
    say((o) => !sigar(o.capPx1)) +
    ' / 2× → ' +
    say((o) => !sigar(o.capPx2)) +
    ' / 3× → ' +
    say((o) => !sigar(o.capPx3))
);
console.log(
  '\n  YATAY TUTUŞ (1 birim = ' +
    BIRIM_PX_YATAY.toFixed(3) +
    ' px):  1× → ' +
    say((o) => sigar(o.cap * BIRIM_PX_YATAY)) +
    ' sığıyor / ' +
    say((o) => !sigar(o.cap * BIRIM_PX_YATAY)) +
    ' sığmıyor'
);
console.log('\nEŞİK SEÇENEKLERİ:');
console.log('  eşik(birim)  eşik altı  birleşebilir  kalan parça');
for (const esik of [10, 12, 14, 16, 18, 20, 22, 25]) {
  const altinda = olcumler.filter((o) => o.cap < esik);
  const birlesir = altinda.filter((o) => !o.tekParcali);
  console.log(
    '  ' +
      String(esik).padStart(6) +
      String(altinda.length).padStart(12) +
      String(birlesir.length).padStart(14) +
      String(olcumler.length - birlesir.length).padStart(13)
  );
}
console.log('\nEN KÜÇÜK 15 PARÇA:');
console.log('  parça   ad                          il             çap(birim)  1×px   2×px   3×px');
for (const o of olcumler.slice(0, 15))
  console.log(
    '  ' +
      o.pid.padEnd(7) +
      (o.ad + (o.tekParcali ? ' *' : '')).padEnd(28) +
      o.il.padEnd(14) +
      o.cap.toFixed(1).padStart(8) +
      o.capPx1.toFixed(1).padStart(8) +
      o.capPx2.toFixed(1).padStart(7) +
      o.capPx3.toFixed(1).padStart(7)
  );
console.log('\n  (* = tek parçalı ilin tek parçası; birleştirilemez)');
console.log('\nYazıldı: veri/parca-olcum.md + onizleme/rozet-testi.html');
