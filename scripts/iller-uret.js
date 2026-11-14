// İL STATLARI ÜRETİCİ — veri/iller.json (81 il × 7 stat) üretir.
// Çalıştırma:  node scripts/iller-uret.js
//
// 7 stat = 5 sayısal stat (nüfus, ekonomi, eğitim, sanayi, moral) + arazi + parça sayısı.
// ALTYAPI STATI 2026-07-25'te KALDIRILDI (tasarım §5, Görev 03 / Karar 3): parça haritada
// fiziksel bölge olunca hareket menzilini coğrafyanın kendisi belirliyor.
//
// STATLARIN KAYNAĞI:
//   nufus    : GERÇEK — TÜİK ADNKS 2023 il nüfusu, logaritmik ölçek 1–10.
//   ekonomi  : GERÇEK — toplam GSYİH = nüfus × kişi başı GSYİH (2024, TL), logaritmik ölçek 1–10.
//   arazi    : GERÇEK — parcalar.json'dan, parça ekonomi payına göre ağırlıklı baskın arazi.
//   parcaSayisi: GERÇEK — parcalar.json'dan sayılır.
//   egitim/sanayi/moral: TAHMİN (ilk taslak). Kişi başı gelir + nüfus + (sanayi için)
//     elle sanayi katsayısından türetilir. Ölçülmüş veri DEĞİLDİR; oyun dengesi test edilirken
//     elle ayarlanacaktır. Bkz. veri/URETIM-NOTU.md.
//
// HAM VERİ KAYNAKLARI:
//   Nüfus (2023): Wikipedia "Provinces of Turkey by population" (TÜİK ADNKS 2023).
//   Kişi başı GSYİH (2024, TL): Wikipedia "List of Turkish provinces by GDP" (TÜİK).
//   İki tablo da 2026-07-25'te çekildi.

const fs = require('fs');
const path = require('path');

// kod: [ad, nufus2023, kisiBasiGsyihTL2024]
const HAM = {
  '01': ['Adana', 2270298, 350981],
  '02': ['Adıyaman', 604978, 327509],
  '03': ['Afyonkarahisar', 751344, 336256],
  '04': ['Ağrı', 511238, 194660],
  '05': ['Amasya', 339529, 346376],
  '06': ['Ankara', 5803482, 788859],
  '07': ['Antalya', 2696249, 561429],
  '08': ['Artvin', 172356, 390108],
  '09': ['Aydın', 1161702, 387277],
  '10': ['Balıkesir', 1273519, 459714],
  '11': ['Bilecik', 228058, 527473],
  '12': ['Bingöl', 285655, 276713],
  '13': ['Bitlis', 359747, 231869],
  '14': ['Bolu', 324789, 548317],
  '15': ['Burdur', 277452, 392276],
  '16': ['Bursa', 3214571, 492876],
  '17': ['Çanakkale', 570499, 482680],
  '18': ['Çankırı', 205501, 430386],
  '19': ['Çorum', 528351, 328605],
  '20': ['Denizli', 1059082, 411046],
  '21': ['Diyarbakır', 1818133, 245024],
  '22': ['Edirne', 419913, 417266],
  '23': ['Elazığ', 604411, 349939],
  '24': ['Erzincan', 243399, 394311],
  '25': ['Erzurum', 749993, 321146],
  '26': ['Eskişehir', 915418, 530834],
  '27': ['Gaziantep', 2164134, 318204],
  '28': ['Giresun', 461712, 307828],
  '29': ['Gümüşhane', 148539, 287458],
  '30': ['Hakkari', 287625, 304752],
  '31': ['Hatay', 1544640, 346978],
  '32': ['Isparta', 449777, 388226],
  '33': ['Mersin', 1938389, 444761],
  '34': ['İstanbul', 15655924, 802669],
  '35': ['İzmir', 4479525, 556376],
  '36': ['Kars', 278335, 302089],
  '37': ['Kastamonu', 388990, 395056],
  '38': ['Kayseri', 1445683, 403635],
  '39': ['Kırklareli', 377156, 531388],
  '40': ['Kırşehir', 247179, 347041],
  '41': ['Kocaeli', 2102907, 788873],
  '42': ['Konya', 2320241, 388841],
  '43': ['Kütahya', 575674, 406533],
  '44': ['Malatya', 742725, 365880],
  '45': ['Manisa', 1475716, 454705],
  '46': ['Kahramanmaraş', 1116618, 342387],
  '47': ['Mardin', 888874, 247416],
  '48': ['Muğla', 1066736, 526553],
  '49': ['Muş', 399879, 230300],
  '50': ['Nevşehir', 315994, 365241],
  '51': ['Niğde', 377080, 362804],
  '52': ['Ordu', 775800, 293783],
  '53': ['Rize', 350506, 355740],
  '54': ['Sakarya', 1098115, 479426],
  '55': ['Samsun', 1377546, 369415],
  '56': ['Siirt', 347412, 261810],
  '57': ['Sinop', 229716, 321023],
  '58': ['Sivas', 650401, 351134],
  '59': ['Tekirdağ', 1167059, 604226],
  '60': ['Tokat', 606934, 264527],
  '61': ['Trabzon', 824352, 345969],
  '62': ['Tunceli', 89317, 478675],
  '63': ['Şanlıurfa', 2213964, 188144],
  '64': ['Uşak', 377001, 397680],
  '65': ['Van', 1127612, 230049],
  '66': ['Yozgat', 420699, 303087],
  '67': ['Zonguldak', 591492, 364851],
  '68': ['Aksaray', 438504, 404383],
  '69': ['Bayburt', 86047, 331432],
  '70': ['Karaman', 263960, 471850],
  '71': ['Kırıkkale', 285744, 436061],
  '72': ['Batman', 647205, 236422],
  '73': ['Şırnak', 570745, 306150],
  '74': ['Bartın', 207238, 318484],
  '75': ['Ardahan', 92819, 385104],
  '76': ['Iğdır', 209738, 264690],
  '77': ['Yalova', 304780, 501231],
  '78': ['Karabük', 255242, 369785],
  '79': ['Kilis', 155179, 253567],
  '80': ['Osmaniye', 557666, 316158],
  '81': ['Düzce', 409865, 450404],
};

// Sanayi (TAHMİN) için elle katsayı: bilinen sanayi illeri +, tarım/düşük-sanayi doğu illeri -.
// Sadece belirgin olanlar; gerisi 0 (nüfus+gelişmişlik karışımından düşer).
const SANAYI_BONUS = {
  '41': 2.5,
  '16': 2,
  '54': 2,
  '59': 1.5,
  '45': 1.5,
  '11': 1.5, // Kocaeli, Bursa, Sakarya, Tekirdağ, Manisa, Bilecik
  '27': 1.5,
  '20': 1.5,
  '38': 1,
  '26': 1,
  '19': 1,
  '64': 1,
  '78': 1, // Gaziantep, Denizli, Kayseri, Eskişehir, Çorum, Uşak, Karabük
  '34': 1,
  '35': 0.5,
  '06': 0.5,
  '70': 0.5,
  '14': 0.5, // İstanbul, İzmir, Ankara, Karaman, Bolu
  '04': -1.5,
  '49': -1.5,
  '30': -1.5,
  '75': -1.5,
  '76': -1,
  '73': -1, // Ağrı, Muş, Hakkâri, Ardahan, Iğdır, Şırnak
  '13': -1,
  '65': -1,
  '36': -1,
  '66': -1,
  '56': -1,
  '63': -0.5,
  '47': -0.5, // Bitlis, Van, Kars, Yozgat, Siirt, Şanlıurfa, Mardin
};

// ---- yardımcı ölçekler ----
const round = (x) => Math.max(1, Math.min(10, Math.round(x)));

// Logaritmik ölçek: [minD,maxD] log aralığını 1–10'a oturt (büyükleri sıkıştırır).
function logOlcek(deger, minD, maxD) {
  const t = (Math.log(deger) - Math.log(minD)) / (Math.log(maxD) - Math.log(minD));
  return round(1 + t * 9);
}
// Doğrusal ölçek (gelişmişlik indeksi için, sürekli 1–10 döner).
function linOlcek(deger, minD, maxD) {
  const t = (deger - minD) / (maxD - minD);
  return 1 + t * 9;
}

// ---- parça verisinden arazi + parça sayısı ----
const parcalar = require(path.join('..', 'veri', 'parcalar.json'));
const P = parcalar.parcalar;
const ILLER = parcalar.iller;

const parcaSay = {};
const araziAgirlik = {}; // kod -> {ova, tepelik, daglik} (ekonomi payı ağırlıklı)
for (const id of Object.keys(P)) {
  const p = P[id];
  parcaSay[p.kod] = (parcaSay[p.kod] || 0) + 1;
  if (!araziAgirlik[p.kod]) araziAgirlik[p.kod] = { ova: 0, tepelik: 0, daglik: 0 };
  araziAgirlik[p.kod][p.arazi] += p.ekonomi;
}
function baskinArazi(kod) {
  const a = araziAgirlik[kod];
  let en = 'ova',
    enD = -1;
  for (const t of ['ova', 'tepelik', 'daglik']) {
    if (a[t] > enD) {
      enD = a[t];
      en = t;
    }
  }
  return en;
}

// ---- min/max değerler (ölçek çapaları) ----
// Kodları 01..81 sıralı üret (HAM anahtar sırasına bağlı kalma) → iller.json düzenli çıksın.
const kodlar = Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, '0'));
const nufuslar = kodlar.map((k) => HAM[k][1]);
const gsyihToplam = kodlar.map((k) => HAM[k][1] * HAM[k][2]); // toplam GSYİH
const kbGsyih = kodlar.map((k) => HAM[k][2]);
const minN = Math.min(...nufuslar),
  maxN = Math.max(...nufuslar);
const minG = Math.min(...gsyihToplam),
  maxG = Math.max(...gsyihToplam);
const minKb = Math.min(...kbGsyih),
  maxKb = Math.max(...kbGsyih);

// ---- üret ----
const uyari = [];
const iller = {};
for (const kod of kodlar) {
  const [adHam, nufus, kb] = HAM[kod];
  const ilRef = ILLER[kod];
  if (!ilRef) {
    uyari.push('parcalar.json iller[' + kod + '] yok');
    continue;
  }
  if (ilRef.ad !== adHam)
    uyari.push('ad uyuşmuyor ' + kod + ': HAM "' + adHam + '" vs parça "' + ilRef.ad + '"');

  const nufusStat = logOlcek(nufus, minN, maxN);
  const ekonomiStat = logOlcek(nufus * kb, minG, maxG);
  const dev = linOlcek(kb, minKb, maxKb); // sürekli gelişmişlik 1–10 (kişi başı gelir)

  // TAHMİN statları:
  const egitim = round(dev);
  const moral = round(5 + (dev - 5.5) * 0.5);
  const sanayi = round(0.45 * nufusStat + 0.45 * dev + (SANAYI_BONUS[kod] || 0));

  iller[kod] = {
    kod,
    ad: ilRef.ad,
    bolge: ilRef.bolge,
    arazi: baskinArazi(kod),
    parcaSayisi: parcaSay[kod] || 0,
    statlar: { nufus: nufusStat, ekonomi: ekonomiStat, egitim, sanayi, moral },
  };
}

// ---- yaz ----
const cikti = path.join(__dirname, '..', 'veri', 'iller.json');
// Anahtarları 01..81 sıralı yaz (JS objesi sayısal-string anahtarları kendiliğinden
// yeniden sıralar; okunabilir çıktı için gövdeyi elle kuruyoruz).
const govde = kodlar
  .filter((k) => iller[k])
  .map(
    (k) =>
      '  ' + JSON.stringify(k) + ': ' + JSON.stringify(iller[k], null, 2).replace(/\n/g, '\n  ')
  )
  .join(',\n');
fs.writeFileSync(cikti, '{\n' + govde + '\n}\n', 'utf8');

// ---- özet ----
console.log('iller.json yazıldı: ' + Object.keys(iller).length + ' il -> ' + cikti);
if (uyari.length) {
  console.log('\nUYARILAR:');
  uyari.forEach((u) => console.log('  ⚠ ' + u));
} else {
  console.log('Ad/bölge tutarlılığı: parcalar.json ile tam uyumlu.');
}

const ornek = ['34', '53', '42', '69', '27', '62'];
console.log('\nÖRNEK İLLER (Baki kontrolü):');
console.log('kod  ad            böl.        arazi    prç  nüf eko eğt san mrl');
for (const k of ornek) {
  const o = iller[k],
    s = o.statlar;
  console.log(
    k +
      '   ' +
      o.ad.padEnd(13) +
      ' ' +
      o.bolge.slice(0, 10).padEnd(11) +
      ' ' +
      o.arazi.padEnd(8) +
      ' ' +
      String(o.parcaSayisi).padStart(2) +
      '   ' +
      [s.nufus, s.ekonomi, s.egitim, s.sanayi, s.moral].map((v) => String(v).padStart(2)).join('  ')
  );
}

// dağılım histogramı (her stat 1–10 kaç il)
function hist(alan) {
  const h = Array(11).fill(0);
  for (const k of kodlar) if (iller[k]) h[iller[k].statlar[alan]]++;
  return h
    .slice(1)
    .map((n, i) => i + 1 + ':' + n)
    .join(' ');
}
console.log('\nDAĞILIM (stat değeri : kaç il):');
for (const a of ['nufus', 'ekonomi', 'egitim', 'sanayi', 'moral']) {
  console.log('  ' + a.padEnd(8) + ' ' + hist(a));
}
const toplamParca = kodlar.reduce((a, k) => a + (parcaSay[k] || 0), 0);
console.log(
  '\nToplam parça (kontrol): ' +
    toplamParca +
    ' (parcalar.json meta: ' +
    parcalar.meta.parcaSayisi +
    ')'
);
