// docs/il-savasi-parca-bolumleme-v2.md içindeki 195 parça tablosunu ayrıştırır.
// Çıktı: veri/ham/parca-tablo.json — her parça için:
//   { kod, ilAd, parcaNo, parcaAd, ilceler:[...], arazi, nufus, ekonomi }
// Bu, parça geometrisi/komşuluğu üretiminin girdisidir.

const fs = require('fs');
const path = require('path');
const kanonik = require('./iller-kanonik');

const PROJ = path.join(__dirname, '..');
const MD = path.join(PROJ, 'docs/il-savasi-parca-bolumleme-v2.md');

const satirlar = fs.readFileSync(MD, 'utf8').split(/\r?\n/);
const parcalar = [];
let aktifKod = null,
  aktifAd = null;

// il başlığı: "## 34 İSTANBUL — 3 parça"
const ilBaslik = /^##\s+(\d{2})\s+(.+?)\s+—\s+(\d+)\s+par[cç]a/i;
// tablo satırı ilk hücresi 1..5 olan veri satırı
function hucreler(line) {
  if (!line.trim().startsWith('|')) return null;
  const parts = line.split('|').map((s) => s.trim());
  // baş/son boş hücreleri at
  if (parts[0] === '') parts.shift();
  if (parts[parts.length - 1] === '') parts.pop();
  return parts;
}

for (const line of satirlar) {
  const m = ilBaslik.exec(line);
  if (m) {
    aktifKod = m[1];
    aktifAd = kanonik[aktifKod] ? kanonik[aktifKod].ad : m[2];
    continue;
  }
  if (!aktifKod) continue;
  const c = hucreler(line);
  if (!c) continue;
  // veri satırı mı? ilk hücre 1..5 sayı, 6 sütun
  if (c.length >= 6 && /^[1-5]$/.test(c[0])) {
    const [no, parcaAd, ilcelerRaw, arazi, nufus, ekonomi] = c;
    const ilceler = ilcelerRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    parcalar.push({
      kod: aktifKod,
      ilAd: aktifAd,
      parcaNo: parseInt(no, 10),
      parcaAd,
      ilceler,
      araziRaw: arazi,
      arazi: arazi.toLowerCase().replace('ı', 'i'), // ova/tepelik/daglik normalize
      nufus: parseFloat(nufus),
      ekonomi: parseFloat(ekonomi),
    });
  }
}

// arazi normalize: ova/tepelik/daglik
parcalar.forEach((p) => {
  const a = p.araziRaw.toLocaleLowerCase('tr-TR');
  p.arazi = a.startsWith('ova') ? 'ova' : a.startsWith('tepe') ? 'tepelik' : 'daglik';
  delete p.araziRaw;
});

fs.writeFileSync(path.join(PROJ, 'veri/ham/parca-tablo.json'), JSON.stringify(parcalar, null, 1));

// ---- DOĞRULAMA ----
const ilBasi = {};
parcalar.forEach((p) => {
  ilBasi[p.kod] = (ilBasi[p.kod] || 0) + 1;
});
const dagilim = {};
Object.values(ilBasi).forEach((n) => {
  dagilim[n] = (dagilim[n] || 0) + 1;
});

console.log('Toplam parça:', parcalar.length, '(beklenen 195)');
console.log('İl sayısı:', Object.keys(ilBasi).length, '(beklenen 81)');
console.log(
  'Parça sayısı dağılımı:',
  JSON.stringify(dagilim),
  '(beklenen {"1":17,"2":32,"3":18,"4":10,"5":4})'
);

// beklenen parça sayısı tutmayan iller
parcalar.forEach(() => {});
const gorulenParca = {};
parcalar.forEach((p) => {
  gorulenParca[p.kod] = Math.max(gorulenParca[p.kod] || 0, p.parcaNo);
});
// pay toplamları ~1 mi
let payHatasi = [];
Object.keys(ilBasi).forEach((kod) => {
  const ps = parcalar.filter((p) => p.kod === kod);
  const nT = ps.reduce((s, p) => s + p.nufus, 0);
  const eT = ps.reduce((s, p) => s + p.ekonomi, 0);
  if (Math.abs(nT - 1) > 0.02 || Math.abs(eT - 1) > 0.02)
    payHatasi.push(
      kod + ' ' + kanonik[kod].ad + ' nüfus=' + nT.toFixed(2) + ' ekonomi=' + eT.toFixed(2)
    );
});
console.log(
  'Pay toplamı ~1 olmayan iller:',
  payHatasi.length ? '\n  ' + payHatasi.join('\n  ') : 'YOK'
);

// "Tüm ilçeler" içeren parçalar (tek parçalı iller)
const tumIlce = parcalar.filter((p) => p.ilceler.some((i) => /tüm il[çc]e/i.test(i)));
console.log('"Tüm ilçeler" ile tanımlı parça:', tumIlce.length, '(1 parçalı 17 il beklenir)');

const toplamIlce = parcalar.reduce(
  (s, p) => s + (p.ilceler.some((i) => /tüm/i.test(i)) ? 0 : p.ilceler.length),
  0
);
console.log('Açıkça listelenen ilçe adı sayısı (Tüm ilçeler hariç):', toplamIlce);
