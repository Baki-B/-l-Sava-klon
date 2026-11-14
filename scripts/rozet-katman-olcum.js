// ROZET KATMAN ÖLÇÜMÜ — Görev 04 / Adım 2.
// Çalıştırma:  node scripts/rozet-katman-olcum.js
//
// SORU: üç katmanlı rozet gösteriminin sınırları hangi yakınlaştırmada olmalı?
//   Uzak  → yalnızca harita, rozet yok
//   Orta  → il başına tek rozet (o ildeki toplam birim)
//   Yakın → parça başına rozet
//
// Görev 03B'deki `scripts/parca-olcum.js` ölçümü DİK tutuş referanslıydı ve yalnızca
// parçaları ölçüyordu. Oyun Görev 04'te yatay tutuşa kilitlendi, ayrıca orta katman için
// İL rozeti de ölçülmeli. Bu betik ikisini de yapar ve gerçek yakınlaştırma aralığını
// tarar. Eski betik tarihsel kayıt olarak duruyor, ona dokunulmadı.
//
// ÖLÇÜ: iç çember çapı (parçanın/ilin içine sığan en büyük dairenin çapı). Alan ölçü
// değildir — uzun ince bir kıyı şeridi büyük alana sahip olup rozeti taşıyamaz.
// Adalar hariç: ölçüm her şeklin EN BÜYÜK kara gövdesi üzerinde yapılır.
//
// KRİTİK KURAL: rozet haritayla BİRLİKTE BÜYÜMEZ (Baki'nin kararı). Ekranda hep aynı
// piksel boyutunda kalır. Yani yakınlaştıkça şekil büyür, rozet sabit kalır, sığması
// kolaylaşır. Bu yüzden "sığar mı" hesabı:  iççember(birim) × birimPx × zoom ≥ rozetPx
//
// Çıktılar:
//   veri/rozet-katman-olcum.md          — ölçüm tablosu + eşik önerileri
//   onizleme/rozet-katman-testi.html    — kaydırıcılı görsel önizleme (Baki bunu açacak)

const fs = require('fs');
const path = require('path');
const polylabel = require('polylabel').default || require('polylabel');

const PROJ = path.join(__dirname, '..');
const parcalarDosya = require(path.join(PROJ, 'veri', 'parcalar.json'));
const haritaDosya = require(path.join(PROJ, 'veri', 'harita.json'));
const ILLER = require(path.join(PROJ, 'veri', 'iller.json'));
const P = parcalarDosya.parcalar;
const IL_GEOM = haritaDosya.iller;
const META = parcalarDosya.meta;

// ---- Sabitler ----
const ROZET_CAP = 26; // px — iki haneli sayı ("99+") için ölçülen boy
// Yatay telefon referansı. Kısa kenar 412 dp (olcu.js'e göre "telefon"), uzun kenar 915 dp.
const EKRAN_G = 915;
const EKRAN_Y = 412;
// Uygulamada harita viewBox ile ekrana SIĞDIRILARAK çizilir (Harita.js: Math.min(LW/W, LH/H)).
const BIRIM_PX = Math.min(EKRAN_G / META.genislik, EKRAN_Y / META.yukseklik);
// Dik tutuş — yalnızca karşılaştırma için (oyun artık yataya kilitli).
const BIRIM_PX_DIK = Math.min(EKRAN_Y / META.genislik, EKRAN_G / META.yukseklik);
// GERÇEK yakınlaştırma aralığı — koddan okundu: src/bilesenler/Harita.js pinch sınırları.
const ZOOM_MIN = 0.9;
const ZOOM_MAX = 7;

// ---- geometri yardımcıları ----
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

// En büyük kara gövdesinin iç çemberi: { x, y, cap }
function icCember(yol) {
  const rings = halkalar(yol);
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
  const n = polylabel([enBuyuk], 0.05);
  return { x: +n[0].toFixed(1), y: +n[1].toFixed(1), cap: n.distance * 2 };
}

// Bir şekle rozetin sığması için gereken EN AZ yakınlaştırma.
const gerekenZoom = (cap) => ROZET_CAP / (cap * BIRIM_PX);

// ---- ölçümler ----
const parcalar = Object.keys(P)
  .map((pid) => {
    const c = icCember(P[pid].yol);
    return {
      pid,
      ad: P[pid].ad,
      il: P[pid].il,
      kod: P[pid].kod,
      tekParcali: ILLER[P[pid].kod].parcaSayisi === 1,
      x: c.x,
      y: c.y,
      cap: c.cap,
      zoom: gerekenZoom(c.cap),
      yol: P[pid].yol,
      renk: P[pid].renkIl,
    };
  })
  .sort((a, b) => a.cap - b.cap);

const iller = Object.keys(IL_GEOM)
  .map((kod) => {
    const c = icCember(IL_GEOM[kod].yol);
    return {
      kod,
      ad: ILLER[kod].ad,
      parcaSayisi: ILLER[kod].parcaSayisi,
      x: c.x,
      y: c.y,
      cap: c.cap,
      zoom: gerekenZoom(c.cap),
    };
  })
  .sort((a, b) => a.cap - b.cap);

// Belli bir yakınlaştırmada kaç tanesine rozet sığıyor?
const sigan = (liste, z) => liste.filter((o) => o.cap * BIRIM_PX * z >= ROZET_CAP).length;

// ÇAKIŞMA — asıl okunabilirlik ölçüsü.
// "Rozet şeklin İÇİNE sığıyor mu" ile "rozet KOMŞUSUNUN rozetini eziyor mu" ayrı sorular.
// İkincisi ölçülmezse orta katman 1×'te kalabalıktan okunmaz hâle gelebilir.
// İki rozet merkezi ekranda ROZET_CAP pikselden yakınsa daireler üst üste biner.
function cakisanlar(liste, z) {
  const px = BIRIM_PX * z;
  const carpisan = new Set();
  for (let i = 0; i < liste.length; i++) {
    for (let j = i + 1; j < liste.length; j++) {
      const dx = (liste[i].x - liste[j].x) * px,
        dy = (liste[i].y - liste[j].y) * px;
      if (dx * dx + dy * dy < ROZET_CAP * ROZET_CAP) {
        carpisan.add(i);
        carpisan.add(j);
      }
    }
  }
  return carpisan.size;
}

// Listenin tamamı çizildiğinde hiçbir rozet komşusunu ezmemesi için gereken yakınlaştırma.
function cakismasizZoom(liste) {
  let enYakin = Infinity;
  for (let i = 0; i < liste.length; i++)
    for (let j = i + 1; j < liste.length; j++) {
      const d = Math.hypot(liste[i].x - liste[j].x, liste[i].y - liste[j].y);
      if (d < enYakin) enYakin = d;
    }
  return ROZET_CAP / (enYakin * BIRIM_PX);
}

// Listenin %yuzde'sine rozet sığması için gereken yakınlaştırma.
function yuzdeIcinZoom(liste, yuzde) {
  const sirali = liste.map((o) => o.zoom).sort((a, b) => a - b);
  const i = Math.min(sirali.length - 1, Math.ceil((yuzde / 100) * sirali.length) - 1);
  return sirali[Math.max(0, i)];
}

// Yakınlaştırma taraması — gerçek aralık boyunca 0.25 adımlarla.
const adimlar = [];
for (let z = ZOOM_MIN; z <= ZOOM_MAX + 1e-9; z += z < 3 ? 0.25 : 0.5) {
  adimlar.push({
    z: +z.toFixed(2),
    il: sigan(iller, z),
    parca: sigan(parcalar, z),
    ilCakisan: cakisanlar(iller, z),
    parcaCakisan: cakisanlar(parcalar, z),
  });
}
const ilCakismasiz = cakismasizZoom(iller);
const parcaCakismasiz = cakismasizZoom(parcalar);

// ---- ÖNERİ ----
// İki ölçütü BİRLİKTE karşılayan en küçük yakınlaştırma: rozet şekle sığsın (≥%90) VE
// komşusunu ezmesin (çakışma 0). Tarama adımlarından ilk uyanı seçeriz — böylece öneri
// elle yazılmış bir sayı değil, ölçümden TÜREYEN bir sayı olur.
function ilkUyan(siganAlan, toplam, cakisanAlan) {
  const a = adimlar.find((x) => x[siganAlan] / toplam >= 0.9 && x[cakisanAlan] === 0);
  return a ? a.z : ZOOM_MAX;
}

const ONERI_ORTA = ilkUyan('il', iller.length, 'ilCakisan');
const ONERI_YAKIN = ilkUyan('parca', parcalar.length, 'parcaCakisan');
// Öneri sınırında rozeti hâlâ taşan parçalar → bunların rozeti elle kaydırılacak.
const KAYDIRILACAK = parcalar.filter((o) => o.cap * BIRIM_PX * ONERI_YAKIN < ROZET_CAP);

const yuzdeler = [50, 75, 90, 95, 100];
const ilEsik = {},
  parcaEsik = {};
for (const y of yuzdeler) {
  ilEsik[y] = yuzdeIcinZoom(iller, y);
  parcaEsik[y] = yuzdeIcinZoom(parcalar, y);
}

// ---- eşiğin altında kalan parçalar (rozeti kaydırılacaklar) ----
// En yakın yakınlaştırmada (7×) bile sığmayan var mı?
const enYakindaSigmayan = parcalar.filter((o) => o.cap * BIRIM_PX * ZOOM_MAX < ROZET_CAP);
// Görev belgesi §7.2'nin adıyla andığı beş küçük parça.
const SORUNLU = ['17-1', '77-1', '31-2', '41-1', '79-1'];

// =====================  A) veri/rozet-katman-olcum.md  =====================
const t1 = (n) => n.toFixed(1);
const t2 = (n) => n.toFixed(2);

const md = [
  '# ROZET KATMAN ÖLÇÜMÜ — üç katmanın sınırı nerede?',
  '',
  '> Üreten: `scripts/rozet-katman-olcum.js` (Görev 04 / Adım 2). **Elle düzenleme yok.**',
  '> Görsel karşılığı: `onizleme/rozet-katman-testi.html`',
  '>',
  "> Görev 03B'deki `veri/parca-olcum.md` **dik tutuş** referanslıydı ve yalnızca parçaları",
  '> ölçüyordu. Oyun yatay tutuşa kilitlendi (Görev 04 / Adım 1) ve orta katman için **il**',
  '> rozeti de gerekiyor. Bu belge ikisini de kapsar ve o belgenin yerini alır.',
  '',
  '## Ölçüm koşulları',
  '',
  '| | Değer | Nereden |',
  '|---|---|---|',
  '| Harita kutusu | ' +
    META.genislik +
    ' × ' +
    META.yukseklik +
    ' birim | `veri/parcalar.json` meta |',
  '| Referans ekran | ' +
    EKRAN_G +
    ' × ' +
    EKRAN_Y +
    ' dp (yatay telefon) | `src/olcu.js` — kısa kenar < 600 dp |',
  '| 1 harita birimi | **' +
    BIRIM_PX.toFixed(4) +
    ' piksel** | `Math.min(915/1000, 412/452)` — `Harita.js` sığdırma mantığı |',
  '| (dik tutuşta) | ' +
    BIRIM_PX_DIK.toFixed(4) +
    ' piksel | yatay tutuş ' +
    (BIRIM_PX / BIRIM_PX_DIK).toFixed(2) +
    ' kat büyük |',
  '| Rozet çapı | ' + ROZET_CAP + ' piksel | iki haneli sayı / "99+" için ölçülen boy |',
  '| **Yakınlaştırma aralığı** | **' +
    ZOOM_MIN +
    '× – ' +
    ZOOM_MAX +
    '×** | `src/bilesenler/Harita.js` pinch sınırları (koddan okundu) |',
  '',
  '**Rozet haritayla büyümez** (Baki kararı) — ekranda sabit ' + ROZET_CAP + ' px kalır.',
  'Bu yüzden sığma ölçütü: `iç çember (birim) × ' +
    BIRIM_PX.toFixed(4) +
    ' × yakınlaştırma ≥ ' +
    ROZET_CAP +
    '`',
  '',
  '## Yakınlaştırma taraması',
  '',
  'Her yakınlaştırma adımında kaç ile / kaç parçaya rozet sığıyor:',
  '',
  '**Sığan** = rozet şeklin içine sığıyor. **Çakışan** = rozet komşusunun rozetiyle üst üste',
  'biniyor (hepsinde ordu varsayımıyla, en kötü durum). İkisi ayrı sorudur; okunabilirliği',
  'çoğu zaman ikincisi belirler.',
  '',
  '| Yakınlaştırma | İl: sığan (81) | İl: çakışan | Parça: sığan (' +
    parcalar.length +
    ') | Parça: çakışan |',
  '|---|---|---|---|---|',
  ...adimlar.map(
    (a) =>
      '| ' +
      a.z +
      '× | ' +
      a.il +
      ' (%' +
      Math.round((a.il / iller.length) * 100) +
      ') | ' +
      a.ilCakisan +
      ' | ' +
      a.parca +
      ' (%' +
      Math.round((a.parca / parcalar.length) * 100) +
      ') | ' +
      a.parcaCakisan +
      ' |'
  ),
  '',
  'Hiç çakışma kalmaması için gereken yakınlaştırma: **il ' +
    t2(ilCakismasiz) +
    '×**, **parça ' +
    t2(parcaCakismasiz) +
    '×**.',
  '',
  '## Eşik önerileri — bu tablo kararın kendisi',
  '',
  '"Şeklin yüzde kaçına rozet sığarsa o katman açılsın?" sorusunun karşılığı:',
  '',
  '| Kapsama | İl rozeti için gereken yakınlaştırma | Parça rozeti için gereken |',
  '|---|---|---|',
  ...yuzdeler.map(
    (y) => '| %' + y + " ' ine sığar | **" + t2(ilEsik[y]) + '×** | **' + t2(parcaEsik[y]) + '×** |'
  ),
  '',
  '## ÖNERİ — ölçümden türeyen sınırlar',
  '',
  'Ölçüt: rozet şekle sığsın (**≥%90**) **VE** komşusunun rozetini ezmesin (**çakışma 0**).',
  'Tarama adımları içinde bu iki koşulu birlikte karşılayan ilk yakınlaştırma:',
  '',
  '| Katman | Aralık | Ne görünür |',
  '|---|---|---|',
  '| **Uzak** | ' + ZOOM_MIN + '× – ' + ONERI_ORTA + '× | yalnızca harita, rozet yok |',
  '| **Orta** | ' + ONERI_ORTA + '× – ' + ONERI_YAKIN + '× | il başına tek rozet |',
  '| **Yakın** | ' + ONERI_YAKIN + '× – ' + ZOOM_MAX + '× | parça başına rozet |',
  '',
  '**Dikkat çeken bulgu:** uzak katman DAR bir şerit. En uzak seviyede (' + ZOOM_MIN + '×) bile',
  iller.length ? '' : '',
  'il rozetlerinin %' +
    Math.round((sigan(iller, ZOOM_MIN) / iller.length) * 100) +
    "'i zaten sığıyor ve yalnızca " +
    cakisanlar(iller, ZOOM_MIN) +
    ' tanesi çakışıyor. Yani',
  '"uzak katmanda harita temiz kalsın" kararı okunabilirlik ZORUNLULUĞU değil, **tercih**.',
  'Haritanın daha uzun süre temiz kalmasını istersen ilk sınırı yukarı çekmek serbest.',
  '',
  '### Bunu okuma kılavuzu',
  '',
  '- **Uzak → Orta sınırı** = il rozetlerinin okunur olduğu yakınlaştırma. Yukarıdaki',
  '  "İl rozeti" sütunundan seçilir.',
  '- **Orta → Yakın sınırı** = parça rozetlerinin okunur olduğu yakınlaştırma. "Parça',
  '  rozeti" sütunundan seçilir.',
  '- %100 aramak pahalıdır: en küçük birkaç şekil bütün eşiği yukarı çeker. %90–95 seçip',
  '  kalan birkaç şeklin rozetini **kaydırmak** (aşağıya bak) daha ucuz.',
  '',
  '## Kaydırma gereken parçalar',
  '',
  'En yakın yakınlaştırmada (' +
    ZOOM_MAX +
    '×) bile rozeti sığmayan parça: **' +
    enYakindaSigmayan.length +
    '**',
  ...(enYakindaSigmayan.length
    ? [
        '',
        '| Parça | Ad | İl | İç çember | ' + ZOOM_MAX + "×'te px |",
        '|---|---|---|---|---|',
        ...enYakindaSigmayan.map(
          (o) =>
            '| ' +
            o.pid +
            ' | ' +
            o.ad +
            ' | ' +
            o.il +
            ' | ' +
            t1(o.cap) +
            ' | ' +
            t1(o.cap * BIRIM_PX * ZOOM_MAX) +
            ' |'
        ),
      ]
    : ['', 'Yok — yeterince yaklaşınca hepsine sığıyor.']),
  '',
  "Görev belgesi §7.2'nin adıyla andığı beş küçük parça, gereken yakınlaştırmayla:",
  '',
  '| Parça | Ad | İç çember | Rozetin sığması için gereken yakınlaştırma |',
  '|---|---|---|---|',
  ...SORUNLU.map((pid) => {
    const o = parcalar.find((x) => x.pid === pid);
    return (
      '| ' +
      o.pid +
      ' | ' +
      o.ad +
      ' | ' +
      t1(o.cap) +
      ' | **' +
      t2(o.zoom) +
      '×**' +
      (o.zoom > ZOOM_MAX ? ' — ⛔ aralığın dışında, kaydırma ŞART' : '') +
      ' |'
    );
  }),
  '',
  '## En küçük 25 il (orta katman rozeti)',
  '',
  "| İl | Parça | İç çember (birim) | 1×'te px | Gereken yakınlaştırma |",
  '|---|---|---|---|---|',
  ...iller
    .slice(0, 25)
    .map(
      (o) =>
        '| ' +
        o.ad +
        ' | ' +
        o.parcaSayisi +
        ' | ' +
        t1(o.cap) +
        ' | ' +
        t1(o.cap * BIRIM_PX) +
        ' | ' +
        t2(o.zoom) +
        '× |'
    ),
  '',
  '## En küçük 25 parça (yakın katman rozeti)',
  '',
  "| Parça | Ad | İl | İç çember (birim) | 1×'te px | Gereken yakınlaştırma |",
  '|---|---|---|---|---|---|',
  ...parcalar
    .slice(0, 25)
    .map(
      (o) =>
        '| ' +
        o.pid +
        ' | ' +
        o.ad +
        (o.tekParcali ? ' *(tek parçalı il)*' : '') +
        ' | ' +
        o.il +
        ' | ' +
        t1(o.cap) +
        ' | ' +
        t1(o.cap * BIRIM_PX) +
        ' | ' +
        t2(o.zoom) +
        '× |'
    ),
  '',
];
fs.writeFileSync(path.join(PROJ, 'veri', 'rozet-katman-olcum.md'), md.join('\n'), 'utf8');

// =====================  B) onizleme/rozet-katman-testi.html  =====================
const parcaVeri = parcalar.map((o) => ({
  id: o.pid,
  ad: o.ad,
  kod: o.kod,
  x: o.x,
  y: o.y,
  cap: +o.cap.toFixed(2),
  yol: o.yol,
  renk: o.renk,
}));
const ilVeri = iller.map((o) => ({
  kod: o.kod,
  ad: o.ad,
  x: o.x,
  y: o.y,
  cap: +o.cap.toFixed(2),
}));

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rozet katman testi — üç katmanın sınırı</title>
<style>
  :root { --zemin:#1b2026; --panel:#262d33; --cerceve:#3a444d; --metin:#e7e1d1;
          --ikincil:#9a9585; --pirinc:#b0904f; --kirmizi:#c0492f; --yesil:#8aa356; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,sans-serif; background:var(--zemin);
         color:var(--metin); font-size:14px; }
  header { padding:14px 18px; border-bottom:1px solid var(--cerceve); }
  h1 { margin:0 0 5px; font-size:17px; letter-spacing:.4px; }
  .alt { font-size:12.5px; color:var(--ikincil); line-height:1.6; }
  .duzen { display:flex; gap:18px; padding:18px; align-items:flex-start; flex-wrap:wrap; }
  .sol { flex:1 1 700px; min-width:340px; }
  .yan { flex:0 1 330px; min-width:280px; }
  .telefon { border:9px solid #333c45; border-radius:22px; background:#7d8f9c;
             width:100%; aspect-ratio:915/412; overflow:hidden; position:relative;
             touch-action:none; cursor:grab; }
  .telefon:active { cursor:grabbing; }
  .kutu { background:var(--panel); border:1px solid var(--cerceve); border-radius:10px;
          padding:13px; margin-bottom:12px; }
  .kutu h2 { margin:0 0 9px; font-size:12px; letter-spacing:1.6px; color:var(--pirinc); }
  label { display:block; font-size:12.5px; color:var(--ikincil); margin:11px 0 4px; }
  label b { color:var(--metin); font-variant-numeric:tabular-nums; }
  input[type=range] { width:100%; accent-color:var(--pirinc); }
  .katmanlar { display:flex; gap:6px; margin-top:6px; }
  .katman { flex:1; text-align:center; padding:8px 4px; border-radius:8px; font-size:11.5px;
            border:1px solid var(--cerceve); background:#2f373f; color:var(--ikincil); }
  .katman.aktif { background:var(--pirinc); color:#20241a; border-color:var(--pirinc); font-weight:700; }
  .katman.aktif .alt { color:#3d3418; }
  table { border-collapse:collapse; width:100%; font-size:12.5px; }
  th,td { text-align:left; padding:4px 6px; border-bottom:1px solid #333c45; }
  th { color:var(--ikincil); font-weight:600; }
  .sayi { text-align:right; font-variant-numeric:tabular-nums; }
  .iyi { color:var(--yesil); font-weight:700; }
  .kotu { color:var(--kirmizi); font-weight:700; }
  .ipucu { font-size:11.5px; color:var(--ikincil); margin-top:8px; line-height:1.55; }
  button { background:#2f373f; color:var(--metin); border:1px solid #4a5560; border-radius:8px;
           padding:7px 12px; font-size:12.5px; cursor:pointer; }
  button:hover { border-color:var(--pirinc); }
</style></head><body>
<header>
  <h1>ROZET KATMAN TESTİ — üç katmanın sınırı nerede olsun?</h1>
  <div class="alt">
    Çerçeve = telefonun yatay hâli (${EKRAN_G}×${EKRAN_Y} dp). Rozet <b>${ROZET_CAP} piksel</b> ve
    <b>haritayla büyümüyor</b> — yakınlaştırdıkça parça büyür, rozet aynı kalır.
    <b class="kotu">Kırmızı rozet</b> = şekle sığmıyor, taşıyor.
    Haritayı sürükleyebilirsin. Aşağıdaki kaydırıcılarla üç katmanın sınırını dene;
    beğendiğin iki sayıyı bana söyle.
  </div>
</header>
<div class="duzen">
  <div class="sol">
    <div class="telefon" id="telefon">
      <svg id="harita" width="100%" height="100%" viewBox="0 0 ${META.genislik} ${META.yukseklik}"></svg>
    </div>
    <div class="kutu" style="margin-top:12px">
      <label>Yakınlaştırma: <b id="zEt">1.00×</b>  <span class="alt">(oyunun gerçek aralığı ${ZOOM_MIN}× – ${ZOOM_MAX}×)</span></label>
      <input type="range" autocomplete="off" id="z" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="0.05" value="1">
      <div class="katmanlar">
        <div class="katman" id="kUzak">UZAK<br><span class="alt">rozet yok</span></div>
        <div class="katman" id="kOrta">ORTA<br><span class="alt">il rozeti</span></div>
        <div class="katman" id="kYakin">YAKIN<br><span class="alt">parça rozeti</span></div>
      </div>
    </div>
  </div>
  <div class="yan">
    <div class="kutu">
      <h2>KATMAN SINIRLARI</h2>
      <label>Uzak → Orta (il rozetleri açılsın): <b id="e1Et">—</b></label>
      <input type="range" autocomplete="off" id="e1" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="0.05" value="${ONERI_ORTA}">
      <label>Orta → Yakın (parça rozetlerine geç): <b id="e2Et">—</b></label>
      <input type="range" autocomplete="off" id="e2" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="0.05" value="${ONERI_YAKIN}">
      <div class="ipucu">İkinci sınır birinciden küçük olamaz — otomatik itilir.</div>
      <div style="margin-top:10px"><button id="oner">Öneriye dön (${ONERI_ORTA}× / ${ONERI_YAKIN}×)</button></div>
    </div>
    <div class="kutu">
      <h2>ŞU ANKİ DURUM</h2>
      <table><tbody id="durum"></tbody></table>
    </div>
    <div class="kutu">
      <h2>ORDU DAĞILIMI</h2>
      <label>Kaç parçada ordu var: <b id="dEt">%35</b></label>
      <input type="range" autocomplete="off" id="doluluk" min="0" max="100" step="5" value="35">
      <div class="ipucu">
        Gerçek oyunda <b>boş parçada rozet yoktur</b>. Parçaların çoğu boş olacağı için
        kalabalık, ölçümün gösterdiğinden azdır. Bu kaydırıcı onu taklit eder.
      </div>
    </div>
  </div>
</div>
<script>
const PARCALAR = ${JSON.stringify(parcaVeri)};
const ILLER = ${JSON.stringify(ilVeri)};
const ROZET = ${ROZET_CAP}, GEN = ${META.genislik}, YUK = ${META.yukseklik};
const ONERI = { e1: ${ONERI_ORTA}, e2: ${ONERI_YAKIN} };

const cerceve = document.getElementById('telefon');
const svg = document.getElementById('harita');
const $ = (id) => document.getElementById(id);
let z = 1, kx = 0, ky = 0;

// Sahte ordu dağılımı — tohumlu, böylece kaydırıcı oynatınca zıplamaz.
let tohum = 12345;
function rast() { tohum = (tohum * 1664525 + 1013904223) % 4294967296; return tohum / 4294967296; }
let ORDU = {};
function orduDagit(yuzde) {
  tohum = 12345; ORDU = {};
  for (const p of PARCALAR) if (rast() * 100 < yuzde) ORDU[p.id] = 1 + Math.floor(rast() * 24);
}

// Ekranda 1 harita biriminin kaç piksel ettiği (uygulamadaki sığdırma mantığının aynısı).
function birimPx() {
  return Math.min(cerceve.clientWidth / GEN, cerceve.clientHeight / YUK) * z;
}
function katman(e1, e2) { return z < e1 ? 'uzak' : z < e2 ? 'orta' : 'yakin'; }

function ciz() {
  const e1 = +$('e1').value, e2 = Math.max(+$('e2').value, +$('e1').value);
  const bp = birimPx();
  const k = katman(e1, e2);
  const rY = (ROZET / 2) / bp;                 // rozet yarıçapı, harita birimi cinsinden
  const cizgi = 1 / bp;

  let s = '<g transform="translate(' + kx + ',' + ky + ') scale(' + z + ')">';
  for (const p of PARCALAR)
    s += '<path d="' + p.yol + '" fill="' + p.renk + '" stroke="#33404d" stroke-width="' + (0.8 / z) + '"/>';

  let cizilen = 0, tasan = 0;
  if (k === 'yakin') {
    for (const p of PARCALAR) {
      const n = ORDU[p.id]; if (!n) continue;          // BOŞ PARÇADA ROZET YOK
      cizilen++;
      const sigar = p.cap * bp >= ROZET; if (!sigar) tasan++;
      s += rozet(p.x, p.y, rY, cizgi, n, sigar);
    }
  } else if (k === 'orta') {
    const toplam = {};
    for (const p of PARCALAR) { const n = ORDU[p.id]; if (n) toplam[p.kod] = (toplam[p.kod] || 0) + n; }
    for (const il of ILLER) {
      const n = toplam[il.kod]; if (!n) continue;      // BOŞ İLDE ROZET YOK
      cizilen++;
      const sigar = il.cap * bp >= ROZET; if (!sigar) tasan++;
      s += rozet(il.x, il.y, rY, cizgi, n, sigar);
    }
  }
  s += '</g>';
  svg.innerHTML = s;

  $('zEt').textContent = z.toFixed(2) + '×';
  $('e1Et').textContent = e1.toFixed(2) + '×';
  $('e2Et').textContent = e2.toFixed(2) + '×';
  $('kUzak').classList.toggle('aktif', k === 'uzak');
  $('kOrta').classList.toggle('aktif', k === 'orta');
  $('kYakin').classList.toggle('aktif', k === 'yakin');

  const ilSigan = ILLER.filter(o => o.cap * bp >= ROZET).length;
  const parcaSigan = PARCALAR.filter(o => o.cap * bp >= ROZET).length;
  $('durum').innerHTML = [
    ['Katman', k === 'uzak' ? 'UZAK — rozet yok' : k === 'orta' ? 'ORTA — il rozeti' : 'YAKIN — parça rozeti'],
    ['Ekranda çizilen rozet', cizilen],
    ['Bunlardan taşan', tasan ? '<span class="kotu">' + tasan + '</span>' : '<span class="iyi">0</span>'],
    ['Rozet sığan il', ilSigan + ' / ' + ILLER.length],
    ['Rozet sığan parça', parcaSigan + ' / ' + PARCALAR.length],
  ].map(r => '<tr><td>' + r[0] + '</td><td class="sayi">' + r[1] + '</td></tr>').join('');
}

function rozet(x, y, r, cizgi, sayi, sigar) {
  const yazi = sayi > 99 ? '99+' : String(sayi);
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (sigar ? '#20241a' : '#c0492f') +
         '" stroke="' + (sigar ? '#e7e1d1' : '#ffd2c8') + '" stroke-width="' + (cizgi * 1.5) + '"/>' +
         '<text x="' + x + '" y="' + (y + r * 0.36) + '" text-anchor="middle" fill="#fff" font-size="' +
         (r * (yazi.length > 2 ? 0.85 : 1.1)) + '" font-family="system-ui" font-weight="700">' + yazi + '</text>';
}

// Yakınlaştırırken ekranın ORTASI sabit kalsın — yoksa harita kaydırıcıyla birlikte kaçar.
function zoomla(yeni) {
  const eski = z; z = yeni;
  const cx = cerceve.clientWidth / 2, cy = cerceve.clientHeight / 2;
  kx = cx - (cx - kx) * (z / eski);
  ky = cy - (cy - ky) * (z / eski);
}
['z','e1','e2'].forEach(id => $(id).oninput = () => {
  if (id === 'z') zoomla(+$('z').value);
  if (id === 'e1' && +$('e2').value < +$('e1').value) $('e2').value = $('e1').value;
  ciz();
});
$('doluluk').oninput = () => { $('dEt').textContent = '%' + $('doluluk').value; orduDagit(+$('doluluk').value); ciz(); };
$('oner').onclick = () => { $('e1').value = ONERI.e1; $('e2').value = ONERI.e2; ciz(); };

let suruklu = false, sx = 0, sy = 0;
cerceve.onpointerdown = e => { suruklu = true; sx = e.clientX; sy = e.clientY; cerceve.setPointerCapture(e.pointerId); };
cerceve.onpointermove = e => { if (!suruklu) return; kx += e.clientX - sx; ky += e.clientY - sy; sx = e.clientX; sy = e.clientY; ciz(); };
cerceve.onpointerup = () => { suruklu = false; };
window.onresize = ciz;

orduDagit(35);
ciz();
</script></body></html>`;
fs.writeFileSync(path.join(PROJ, 'onizleme', 'rozet-katman-testi.html'), html, 'utf8');

// =====================  konsol özeti  =====================
console.log('ROZET KATMAN ÖLÇÜMÜ — Görev 04 / Adım 2\n');
console.log('  Referans ekran : ' + EKRAN_G + '×' + EKRAN_Y + ' dp (yatay telefon)');
console.log(
  '  1 harita birimi: ' +
    BIRIM_PX.toFixed(4) +
    ' px   (dik tutuşta ' +
    BIRIM_PX_DIK.toFixed(4) +
    ' — yatay ' +
    (BIRIM_PX / BIRIM_PX_DIK).toFixed(2) +
    ' kat büyük)'
);
console.log('  Rozet çapı     : ' + ROZET_CAP + ' px (haritayla BÜYÜMEZ)');
console.log(
  '  GERÇEK ZOOM ARALIĞI: ' + ZOOM_MIN + '× – ' + ZOOM_MAX + '×  (Harita.js pinch sınırları)\n'
);

console.log('YAKINLAŞTIRMA TARAMASI   (sığan = şekle sığıyor, çakışan = komşusunu eziyor)');
console.log('  zoom      il sığan   il çakışan    parça sığan   parça çakışan');
for (const a of adimlar)
  console.log(
    '  ' +
      (a.z + '×').padStart(6) +
      (a.il + '/' + iller.length).padStart(12) +
      ('%' + Math.round((a.il / iller.length) * 100)).padStart(6) +
      String(a.ilCakisan).padStart(9) +
      (a.parca + '/' + parcalar.length).padStart(14) +
      ('%' + Math.round((a.parca / parcalar.length) * 100)).padStart(6) +
      String(a.parcaCakisan).padStart(10)
  );
console.log(
  '\n  Hiç çakışma kalmaması için: il ' +
    t2(ilCakismasiz) +
    '× , parça ' +
    t2(parcaCakismasiz) +
    '×'
);

console.log('\nEŞİK ÖNERİLERİ (kapsama → gereken yakınlaştırma)');
console.log('  kapsama        il rozeti     parça rozeti');
for (const y of yuzdeler)
  console.log(
    '  %' +
      String(y).padEnd(12) +
      (t2(ilEsik[y]) + '×').padStart(9) +
      (t2(parcaEsik[y]) + '×').padStart(15)
  );

console.log('\nÖNERİLEN KATMAN SINIRLARI (≥%90 sığar + 0 çakışma):');
console.log('  UZAK  : ' + ZOOM_MIN + '× – ' + ONERI_ORTA + '×    (yalnızca harita)');
console.log('  ORTA  : ' + ONERI_ORTA + '× – ' + ONERI_YAKIN + '×    (il başına tek rozet)');
console.log('  YAKIN : ' + ONERI_YAKIN + '× – ' + ZOOM_MAX + '×      (parça başına rozet)');
console.log(
  '\n  Öneri sınırında rozeti hâlâ taşan parça: ' +
    KAYDIRILACAK.length +
    (KAYDIRILACAK.length ? ' → ' + KAYDIRILACAK.map((o) => o.ad).join(', ') : '')
);

console.log('\n' + ZOOM_MAX + "×'te bile sığmayan parça: " + enYakindaSigmayan.length);
for (const o of enYakindaSigmayan)
  console.log(
    '  ' +
      o.pid.padEnd(7) +
      o.ad.padEnd(26) +
      'iç çember ' +
      t1(o.cap) +
      '  →  ' +
      t1(o.cap * BIRIM_PX * ZOOM_MAX) +
      ' px'
  );

console.log('\nBELGEDE ADI GEÇEN BEŞ KÜÇÜK PARÇA (gereken yakınlaştırma):');
for (const pid of SORUNLU) {
  const o = parcalar.find((x) => x.pid === pid);
  console.log(
    '  ' +
      o.pid.padEnd(7) +
      o.ad.padEnd(26) +
      t1(o.cap).padStart(6) +
      ' birim  →  ' +
      (t2(o.zoom) + '×').padStart(7) +
      (o.zoom > ZOOM_MAX ? '   ⛔ ARALIK DIŞI — kaydırma şart' : '')
  );
}

console.log('\nEN KÜÇÜK 8 İL (orta katman):');
for (const o of iller.slice(0, 8))
  console.log(
    '  ' + o.ad.padEnd(14) + t1(o.cap).padStart(6) + ' birim  →  ' + (t2(o.zoom) + '×').padStart(7)
  );

console.log('\nYazıldı: veri/rozet-katman-olcum.md + onizleme/rozet-katman-testi.html');
