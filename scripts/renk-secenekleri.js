// RENK SEÇENEKLERİ (Görev 21 · Baki, 2026-09-24: "bazı arayüz ekranlarında açık sarı gibi
// renkler var, o renkleri beğenmiyorum, daha farklı renkler kullanmak istiyorum").
//
// Çalıştırma:  node scripts/renk-secenekleri.js
// Çıktı:       onizleme/renk-secenekleri.html  (tek dosya: yazı tipleri içine gömülü)
//
// Bu bir KARAR SAYFASI, oyun kodu değil (CLAUDE.md §7: cevapsız tasarım sorusuyla kod
// yazılmaz). Aday renkler yalnızca burada; Baki birini seçince `src/tema.js`'e geçer ve
// `scripts/tema-olcum.js` hepsini yeniden ölçer.
//
// İKİ SORU:
//   1. KÂĞIT YÜZEY (asıl şüpheli): tur raporu, tur perdesi, başarımlar/mühürler, ordularım,
//      komutan, yardım ve ana menüdeki Harekât Arşivi parşömen renginde (#E8E0CE) — açık
//      sarıya çalan bu. Bugünkü + dört aday, iki örnek ekranda ve ölçülmüş kontrastla.
//   2. PİRİNÇ VURGU (ikinci şüpheli): araştırma ağacının çizgileri, bedel sayıları,
//      diplomasideki teklif zarfı, hamle çubuğunda "kıl payı" — koyu lacivertin üstünde
//      altın sarısı. Bugünkü + iki aday.

const fs = require('fs');
const path = require('path');
const T = require('../src/tema.js');

const KOK = path.join(__dirname, '..');
const CIKTI = path.join(KOK, 'onizleme', 'renk-secenekleri.html');

// ---- WCAG 2.1 kontrastı (scripts/tema-olcum.js ile aynı formül) ----
function kanal(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function parlaklik(hex) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}
function kontrast(a, b) {
  const x = parlaklik(a),
    y = parlaklik(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

// ---- 1. KÂĞIT YÜZEY: bugünkü + dört aday ----
// Açık adaylarda mühür metalleri bugünkü koyu tonlarla (METAL.*.govde), koyu adaylarda
// parlak tonlarıyla çiziliyor — koyu zeminde koyu altın kaybolur.
const KAGIT_SECENEK = [
  // ESKİ: seçimden önceki parşömen (Baki 2026-09-24'te A'yı seçti; tema.js artık A).
  // Karşılaştırma kalsın diye değerleri burada, sabit.
  {
    kim: 'ESKİ',
    ad: 'Parşömen',
    not: 'Seçimden önceki renk. Sararmış kâğıt — "açık sarı gibi" dediğin bu.',
    koyu: false,
    r: {
      yuzey: '#E8E0CE',
      cukur: '#DBD1BA',
      kabartma: '#F2ECDD',
      yazi: '#22303C',
      yaziIkincil: '#3E4E5C',
      yaziSoluk: '#6B7A87',
      cizgi: '#B9AC91',
      murekkep: '#2A3A46',
      murekkepSoluk: '#8C9AA4',
      arti: '#2F6B45',
      eksi: '#9B3B22',
    },
  },
  {
    kim: 'A',
    ad: 'Kırık beyaz (SEÇİLDİ)',
    not: 'Resmî evrak gibi, soğuk ve temiz. Sarılık tamamen gider; harita mavisiyle akraba.',
    koyu: false,
    r: {
      yuzey: '#E4E8EB',
      cukur: '#D5DBE0',
      kabartma: '#F1F4F6',
      yazi: '#1E2A35',
      yaziIkincil: '#3A4A57',
      yaziSoluk: '#5F6D79',
      cizgi: '#AAB5BE',
      murekkep: '#27384A',
      murekkepSoluk: '#8C9AA4',
      arti: '#2F6B45',
      eksi: '#9B3B22',
    },
  },
  {
    kim: 'B',
    ad: 'Adaçayı',
    not: 'Haritadaki karanın rengi, hafif yeşil. Sıcaklık kalır, sarılık gider — "atlas kâğıdı".',
    koyu: false,
    r: {
      yuzey: '#DCE3D6',
      cukur: '#CDD6C6',
      kabartma: '#E9EEE4',
      yazi: '#1F2B22',
      yaziIkincil: '#3A4A3E',
      yaziSoluk: '#5C6B5D',
      cizgi: '#A3B199',
      murekkep: '#26382C',
      murekkepSoluk: '#8E9C8C',
      arti: '#2C6A3F',
      eksi: '#9B3B22',
    },
  },
  {
    kim: 'C',
    ad: 'Haki dosya',
    not: 'Koyu asker yeşili, açık yazı — harekât dosyası. Lacivertten ayrı ama o kadar koyu.',
    koyu: true,
    r: {
      yuzey: '#394130',
      cukur: '#2F3627',
      kabartma: '#465039',
      yazi: '#EEF1E6',
      yaziIkincil: '#CBD3BE',
      yaziSoluk: '#A5AF97',
      cizgi: '#5D6A4C',
      murekkep: '#E3E8D8',
      murekkepSoluk: '#7D8970',
      arti: '#9ED3A6',
      eksi: '#EDB29A',
    },
  },
  {
    kim: 'D',
    ad: 'Grafit',
    not: 'Koyu gri, açık yazı. En sade ve modern; oyunda renk çeşidi en az bu.',
    koyu: true,
    r: {
      yuzey: '#30353A',
      cukur: '#272B2F',
      kabartma: '#3C4248',
      yazi: '#F1F3F5',
      yaziIkincil: '#C6CCD2',
      yaziSoluk: '#9CA4AC',
      cizgi: '#535B63',
      murekkep: '#E6EAEE',
      murekkepSoluk: '#6C747C',
      arti: '#95D0A9',
      eksi: '#E7B598',
    },
  },
];

// ---- 2. PİRİNÇ VURGU (lacivert ekranlarda) ----
const PIRINC_SECENEK = [
  { kim: 'BUGÜN', ad: 'Pirinç', renk: T.PANEL.pirinc, not: 'Altın sarısı.' },
  { kim: 'P1', ad: 'Açık gümüş', renk: '#C3D2DE', not: 'Sarılık yok; lacivertle aynı aile.' },
  { kim: 'P2', ad: 'Deniz yeşili', renk: '#6FB7A4', not: 'Soğuk, canlı; kiremitten ayrı.' },
];

// ---- Yazı tipleri (sayfanın içine) ----
const yaziTipi = (dosya) =>
  fs.readFileSync(path.join(KOK, 'node_modules/@expo-google-fonts', dosya)).toString('base64');
const FONT = {
  baslik: yaziTipi('black-ops-one/400Regular/BlackOpsOne_400Regular.ttf'),
  govde: yaziTipi('chakra-petch/400Regular/ChakraPetch_400Regular.ttf'),
  kalin: yaziTipi('chakra-petch/700Bold/ChakraPetch_700Bold.ttf'),
};

const oran = (a, b) => kontrast(a, b).toFixed(1);
const esikRenk = (x, esik) => (x >= esik ? T.DURUM.arti : T.DURUM.eksi);

// Örnek ekran 1: tur raporu (başlık, üç satır, düğme).
function turRaporu(r) {
  return `<div class="ekran" style="background:${r.yuzey};border-color:${r.cizgi}">
  <div class="bas" style="color:${r.yazi}">TUR 12 · RAPOR</div>
  <div class="alt" style="color:${r.yaziSoluk}">Bursa · Kış seferi</div>
  <div class="satir" style="background:${r.cukur};color:${r.yaziIkincil}"><span>Alınan bölge</span><b style="color:${r.arti}">+3</b></div>
  <div class="satir" style="color:${r.yaziIkincil};border-bottom:1px solid ${r.cizgi}"><span>Kayıp asker</span><b style="color:${r.eksi}">−4</b></div>
  <div class="satir" style="color:${r.yaziIkincil}"><span>Gelir</span><b style="color:${r.yazi}">18</b></div>
  <div class="dugme" style="background:${r.yazi};color:${r.yuzey}">DEVAM</div>
</div>`;
}

// Örnek ekran 2: mühürler (üç kazanılmış, bir kazanılmamış).
function muhurler(r, koyu) {
  const metal = (m) => (koyu ? m.parlak : m.govde);
  const muhur = (renk, ad, kazanildi) => `<div class="muhur">
    <div class="halka" style="border-color:${kazanildi ? renk : r.murekkepSoluk};color:${
      kazanildi ? renk : r.murekkepSoluk
    }">★</div>
    <div class="mad" style="color:${kazanildi ? r.yaziIkincil : r.yaziSoluk}">${ad}</div></div>`;
  return `<div class="ekran" style="background:${r.yuzey};border-color:${r.cizgi}">
  <div class="bas" style="color:${r.yazi}">MÜHÜRLER</div>
  <div class="muhurler">
    ${muhur(metal(T.METAL.altin), 'FATİH', true)}
    ${muhur(metal(T.METAL.gumus), 'KALKAN', true)}
    ${muhur(metal(T.METAL.bronz), 'İLK KAN', true)}
    ${muhur(null, 'ASLAN', false)}
  </div>
  <div class="satir" style="background:${r.kabartma};color:${r.yazi}"><span>Seçili satır</span><b>7/24</b></div>
</div>`;
}

function kagitKarti(s) {
  const r = s.r;
  const k1 = kontrast(r.yazi, r.yuzey),
    k2 = kontrast(r.yaziIkincil, r.yuzey),
    k3 = kontrast(r.yaziSoluk, r.yuzey),
    k4 = kontrast(r.arti, r.yuzey),
    k5 = kontrast(r.eksi, r.yuzey);
  const olc = (ad, k, esik) =>
    `<span style="color:${esikRenk(k, esik)}">${ad} ${k.toFixed(1)}</span>`;
  return `<div class="secenek">
  <div class="kim">${s.kim}</div><div class="sad">${s.ad}</div>
  <div class="snot">${s.not}</div>
  ${turRaporu(r)}
  ${muhurler(r, s.koyu)}
  <div class="olcu">okunurluk (en az 4.5 / soluk 3.5): ${olc('başlık', k1, 4.5)} · ${olc(
    'etiket',
    k2,
    4.5
  )} · ${olc('soluk', k3, 3.5)} · ${olc('artı', k4, 4.5)} · ${olc('eksi', k5, 4.5)}</div>
</div>`;
}

function pirincKarti(s) {
  const z = T.ZEMIN.yuzey;
  return `<div class="secenek dar">
  <div class="kim">${s.kim}</div><div class="sad">${s.ad}</div><div class="snot">${s.not}</div>
  <div class="ekran" style="background:${z};border-color:${T.CIZGI.ince}">
    <div class="bas" style="color:${T.YAZI_RENK.birincil}">ARAŞTIRMA</div>
    <div class="agac">
      <div class="dugum dolu" style="background:${s.renk};border-color:${s.renk}"></div>
      <div class="bag" style="background:${s.renk}"></div>
      <div class="dugum" style="border-color:${s.renk}"></div>
      <div class="bag soluk" style="background:${T.CIZGI.ince}"></div>
      <div class="dugum" style="border-color:${T.CIZGI.ince}"></div>
    </div>
    <div class="satir" style="color:${T.YAZI_RENK.ikincil}"><span>Bedel</span><b style="color:${s.renk}">12</b></div>
  </div>
  <div class="olcu">lacivertte ${oran(s.renk, z)} : 1</div>
</div>`;
}

// ---- Nerede: sarıya çalan bütün renkler ----
const NEREDE = [
  [
    T.KAGIT.yuzey,
    'Kâğıt yüzey (parşömen)',
    'Tur raporu · tur perdesi · başarımlar / mühürler · ordularım · komutan · yardım · ana menüde Harekât Arşivi',
    'asıl şüpheli',
  ],
  ['#F2ECDD', 'Kâğıdın açık tonu', 'Aynı ekranlarda seçili satır', ''],
  ['#DBD1BA', 'Kâğıdın koyu tonu', 'Aynı ekranlarda tablo şeridi', ''],
  [
    T.PANEL.pirinc,
    'Pirinç',
    'Araştırma ağacı (çizgi, düğüm, bedel) · diplomasi teklif zarfı · hamle çubuğu "kıl payı" · kalkanların üst şeridi',
    'ikinci şüpheli',
  ],
  [
    T.ITTIFAK_RENK.ben,
    'Senin toprağın (ittifak haritası)',
    'İttifak harita tipinde senin bölgelerin · diplomasi haritasında senin sınırın',
    'haritada',
  ],
  [
    T.PANEL.metin,
    'Krem kemik',
    'Kadro şeridindeki sayılar · rozet bağlantı çizgisi',
    'haritada, küçük',
  ],
  [T.METAL.altin.parlak, 'Altın mühür', 'Kazanılmış altın mühür', 'ödül işareti'],
];

const kagitBolum = KAGIT_SECENEK.map(kagitKarti).join('\n');
const pirincBolum = PIRINC_SECENEK.map(pirincKarti).join('\n');
const neredeSatir = NEREDE.map(
  ([renk, ad, yer, not]) =>
    `<tr><td><span class="ornek" style="background:${renk}"></span></td><td>${ad}<div class="kod">${renk}</div></td><td>${yer}</td><td class="notlar">${not}</td></tr>`
).join('\n');

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Renk seçenekleri</title>
<style>
@font-face { font-family: Baslik; src: url(data:font/ttf;base64,${FONT.baslik}); }
@font-face { font-family: Govde; src: url(data:font/ttf;base64,${FONT.govde}); }
@font-face { font-family: Govde; font-weight: 700; src: url(data:font/ttf;base64,${FONT.kalin}); }
body { margin: 0; background: ${T.ZEMIN.taban}; color: ${T.YAZI_RENK.birincil}; font: 14px/1.45 Govde, sans-serif; }
main { max-width: 1400px; margin: 0 auto; padding: 16px; }
h1 { font-family: Baslik; font-weight: 400; letter-spacing: 1px; margin: 8px 0 4px; }
h2 { font-family: Baslik; font-weight: 400; letter-spacing: 1px; margin: 28px 0 6px; }
p { color: ${T.YAZI_RENK.ikincil}; max-width: 900px; }
table { border-collapse: collapse; width: 100%; }
td { padding: 6px 8px; border-bottom: 1px solid ${T.CIZGI.ayrac}; vertical-align: top; }
.ornek { display: inline-block; width: 38px; height: 26px; border-radius: 4px; border: 1px solid ${T.CIZGI.ince}; }
.kod { font-size: 11px; color: ${T.YAZI_RENK.soluk}; }
.notlar { color: ${T.PANEL.pirinc}; white-space: nowrap; }
.secenekler { display: flex; flex-wrap: wrap; gap: 14px; }
.secenek { flex: 1 1 250px; max-width: 272px; background: ${T.ZEMIN.cukur}; border-radius: 8px; padding: 10px; }
.secenek.dar { max-width: 300px; }
.kim { font-family: Baslik; font-size: 22px; }
.sad { font-weight: 700; }
.snot { font-size: 12px; color: ${T.YAZI_RENK.ikincil}; min-height: 52px; }
.ekran { border: 1px solid; border-radius: 3px; padding: 10px; margin-top: 8px; }
.bas { font-family: Baslik; font-size: 17px; letter-spacing: 0.5px; }
.alt { font-size: 11px; margin-bottom: 6px; }
.satir { display: flex; justify-content: space-between; padding: 4px 6px; font-size: 13px; }
.satir b { font-weight: 700; }
.dugme { margin-top: 8px; text-align: center; font-family: Baslik; padding: 6px; border-radius: 5px; letter-spacing: 1px; }
.muhurler { display: flex; justify-content: space-between; margin: 8px 0; }
.muhur { text-align: center; width: 25%; }
.halka { width: 36px; height: 36px; margin: 0 auto; border: 3px solid; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mad { font-size: 10px; margin-top: 3px; letter-spacing: 0.5px; }
.olcu { font-size: 11px; margin-top: 8px; color: ${T.YAZI_RENK.soluk}; }
.agac { display: flex; align-items: center; margin: 12px 4px; }
.dugum { width: 18px; height: 18px; border: 2px solid; border-radius: 50%; }
.bag { flex: 1; height: 3px; }
</style></head><body><main>
<h1>RENK SEÇENEKLERİ</h1>
<p>Baki: <i>"Bazı arayüz ekranlarında açık sarı gibi renkler var, o renkleri beğenmiyorum."</i> Oyunda sarıya çalan renkler aşağıda. En büyük yeri kaplayan, belge ekranlarının <b>kâğıt rengi</b> (parşömen). Ondan sonra araştırma ağacının <b>pirinç</b> rengi geliyor. Seçtiğin renk yalnızca bu ekranlara geçer; haritanın renkleri değişmez.</p>

<h2>1. SARIYA ÇALAN RENKLER NEREDE</h2>
<table>${neredeSatir}</table>

<h2>2. KÂĞIT EKRANLAR İÇİN SEÇENEKLER</h2>
<p>Her seçenekte iki örnek: tur raporu ve mühürler. Altındaki sayılar yazının okunurluğu (WCAG kontrast oranı; yeşil = yeterli). Açık seçeneklerde (A, B) ekranlar bugünkü gibi "kâğıt" kalır. Koyu seçeneklerde (C, D) ise belgeler de koyulaşır; lacivertten yalnızca tonuyla ayrılır.</p>
<div class="secenekler">${kagitBolum}</div>

<h2>3. PİRİNÇ VURGU (lacivert ekranlarda)</h2>
<p>Bu da seni rahatsız ediyorsa: araştırma ağacının çizgileri, bedel sayısı, diplomasi teklifi. Kalkanların üst şeridi haritanın parçası; o ayrıca sorulur.</p>
<div class="secenekler">${pirincBolum}</div>

<h2>NASIL SEÇİLİR</h2>
<p>Harf söylemen yeter: örneğin <b>"B, pirinç kalsın"</b> ya da <b>"A ve P1"</b>. Hiçbiri olmazsa "daha …" diye tarif et; yeni adaylar hazırlarım.</p>
</main></body></html>`;

fs.writeFileSync(CIKTI, html);
console.log(
  'Yazıldı: onizleme/renk-secenekleri.html · ' +
    KAGIT_SECENEK.length +
    ' kâğıt · ' +
    PIRINC_SECENEK.length +
    ' pirinç · ' +
    Math.round(fs.statSync(CIKTI).size / 1024) +
    ' KB'
);
for (const s of KAGIT_SECENEK) {
  const r = s.r;
  console.log(
    '  ' +
      s.kim.padEnd(6) +
      ' başlık ' +
      oran(r.yazi, r.yuzey) +
      ' · etiket ' +
      oran(r.yaziIkincil, r.yuzey) +
      ' · soluk ' +
      oran(r.yaziSoluk, r.yuzey) +
      ' · artı ' +
      oran(r.arti, r.yuzey) +
      ' · eksi ' +
      oran(r.eksi, r.yuzey)
  );
}
