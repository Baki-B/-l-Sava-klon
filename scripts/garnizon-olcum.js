// GARNİZON DENGESİ ÖLÇÜMÜ — Görev 07 / Adım 2.
// Çalıştırma:  node scripts/garnizon-olcum.js     → veri/garnizon-olcum.md
//
// SORU: bir ili fethetmenin KÂRLILIĞI illere göre ne kadar dalgalanıyor?
// Ölçü, Görev 06 §13/1c'nin ölçüsü: **değer ÷ savunma**.
//   değer   = ilin nüfus + ekonomi statı (fethedince kazandığın şey)
//   savunma = ilin toplam garnizon birimi (ödediğin bedel)
// Oran ne kadar yüksekse il o kadar kârlı hedef. Yayılım genişse oyun "en kolay lokmayı
// bul" oyununa dönüşür ve harita okunmaz olur.
//
// ESKİ KURAL (Görev 05–06): garnizon PARÇA BAŞINA, `⌈(nüfus+sanayi)/BOLEN⌉`; ilin toplamı
// parça sayısıyla çarpılıyordu. Parça sayısı §7'ye göre YÜZÖLÇÜMÜNDEN geliyor, güçten
// değil — İstanbul Türkiye'nin en değerli ili ama fiziksel olarak küçük, 2 parça.
//
// YENİ KURAL (Soru 3 → cevap A): bütçe İL DÜZEYİNDE, değere orantılı; parçalara bölüşüm
// §7'nin üç kuralıyla. Kod `src/oyun/garnizon.js`'te; bu betik onu ÇAĞIRIYOR, formülü
// kopyalamıyor. Eski formül yalnızca karşılaştırma için burada duruyor (artık tarihte).
//
// BİTİŞ ÖLÇÜTÜ (görev belgesi §Adım 2a): en yüksek ve en düşük oran arasındaki fark
// bugünkü 6.67 kattan belirgin şekilde daralmalı.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { ILLER, PARCALAR } = require('../src/oyun/veri.js');
const {
  ilGarnizonBoyu,
  ilParcaGarnizonlari,
  garnizonBirimleri,
} = require('../src/oyun/garnizon.js');

const PROJ = path.join(__dirname, '..');

// ---- ESKİ FORMÜL (yalnız karşılaştırma için) ----
// Görev 05'ten Görev 07'ye kadar yürürlükteydi: parça başına ⌈(nüfus+sanayi)/4⌉.
const ESKI_BOLEN = 4;
function eskiIlSavunmasi(kod) {
  const s = ILLER[kod].statlar;
  return Math.max(1, Math.ceil((s.nufus + s.sanayi) / ESKI_BOLEN)) * ILLER[kod].parcaSayisi;
}

function ilDegeri(kod) {
  const s = ILLER[kod].statlar;
  return s.nufus + s.ekonomi;
}

// ---- ÖLÇÜM ----
const kodlar = Object.keys(ILLER).sort();
const satirlar = kodlar.map((kod) => {
  const deger = ilDegeri(kod);
  const eski = eskiIlSavunmasi(kod);
  const yeni = ilGarnizonBoyu(kod);
  return {
    kod,
    ad: ILLER[kod].ad,
    deger,
    parca: ILLER[kod].parcaSayisi,
    eski,
    yeni,
    eskiOran: deger / eski,
    yeniOran: deger / yeni,
  };
});

function yayilim(alan) {
  const oranlar = satirlar.map((s) => s[alan]).sort((a, b) => a - b);
  const enAz = oranlar[0];
  const enCok = oranlar[oranlar.length - 1];
  const ort = oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
  // Standart sapma: yayılımın uçlara değil geneline bakan ölçüsü. Tek bir aykırı il
  // "en yüksek ÷ en düşük" oranını şişirebilir; sapma tabloyu bir bütün olarak anlatır.
  const sapma = Math.sqrt(oranlar.reduce((a, x) => a + (x - ort) ** 2, 0) / oranlar.length);
  return { enAz, enCok, kat: enCok / enAz, ort, sapma };
}

const eskiY = yayilim('eskiOran');
const yeniY = yayilim('yeniOran');

const eskiToplam = satirlar.reduce((a, s) => a + s.eski, 0);
const yeniToplam = satirlar.reduce((a, s) => a + s.yeni, 0);

// ---- PARÇA DÜZEYİ DOĞRULAMALARI ----
// §7'nin üç kuralı bölüşümde de tutmalı: toplam korunur, hiçbir parça 0 almaz,
// payı büyük parça payı küçükten az almaz.
let toplamKorunuyor = true;
let sifirParca = 0;
let tekduzelikKirik = 0;
let parcaToplami = 0;
for (const kod of kodlar) {
  const dagilim = ilParcaGarnizonlari(kod);
  const ids = Object.keys(dagilim).sort();
  const toplam = ids.reduce((a, id) => a + dagilim[id], 0);
  parcaToplami += toplam;
  if (toplam !== ilGarnizonBoyu(kod)) toplamKorunuyor = false;
  for (const id of ids) if (dagilim[id] <= 0) sifirParca++;
  // Tekdüzelik: payı büyük olan az almamalı.
  const sirali = ids
    .map((id) => ({ id, pay: (PARCALAR[id].nufus + PARCALAR[id].ekonomi) / 2 }))
    .sort((a, b) => b.pay - a.pay);
  for (let i = 1; i < sirali.length; i++)
    if (dagilim[sirali[i].id] > dagilim[sirali[i - 1].id]) tekduzelikKirik++;
}

// ---- RAPOR ----
const f = (x) => x.toFixed(2);

let md = '# GARNİZON DENGESİ ÖLÇÜMÜ (Görev 07 / Adım 2)\n\n';
md += '> Üretildi: `node scripts/garnizon-olcum.js` — ELLE DÜZENLEME.\n';
md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n\n';
md += "Görev 06 §13/1c devri, Baki: *\"Ankara'da 20 asker var ama İstanbul'da 10,\n";
md += "Şanlıurfa'da İstanbul'dan fazla\"*. Ölçüldü, doğruydu.\n\n";

md += '## SONUÇ\n\n';
md += '| | Eski (parça başına) | **Yeni (il düzeyinde)** |\n|---|---|---|\n';
md += '| Yayılım (en yüksek ÷ en düşük oran) | **' + f(eskiY.kat) + ' kat** | **';
md += f(yeniY.kat) + ' kat** |\n';
md += '| Oranların standart sapması | ' + f(eskiY.sapma) + ' | **' + f(yeniY.sapma) + '** |\n';
md += '| En kârlı il | ' + f(eskiY.enCok) + ' | ' + f(yeniY.enCok) + ' |\n';
md += '| En sert il | ' + f(eskiY.enAz) + ' | ' + f(yeniY.enAz) + ' |\n';
md += '| Toplam garnizon birimi | ' + eskiToplam + ' | **' + yeniToplam + '** |\n\n';
md += 'Oyun açılışının SERTLİĞİ bilerek korundu (toplam birim yakın); değişen tek şey\n';
md += 'DAĞILIM. `DENGE.GARNIZON.KATSAYI = ' + DENGE.GARNIZON.KATSAYI + '`.\n\n';

md += "## Parça bölüşümü — §7'nin üç kuralı\n\n";
md += 'Bölüşüm `uretim.js parcaDegerleri` ile yapılıyor; üretimde ne yapıyorsa burada da\n';
md += 'onu yapıyor. Yeni bir bölüşüm mantığı YAZILMADI.\n\n';
md += '| Kural | Durum |\n|---|---|\n';
md += '| Toplam korunuyor (parça toplamı = il bütçesi) | ' + (toplamKorunuyor ? '✓' : '✗') + ' |\n';
md +=
  '| Hiçbir parça 0 almıyor | ' + (sifirParca === 0 ? '✓' : '✗ ' + sifirParca + ' parça') + ' |\n';
md += '| Tekdüzelik (payı büyük olan az almıyor) | ';
md += (tekduzelikKirik === 0 ? '✓' : '✗ ' + tekduzelikKirik + ' yerde kırık') + ' |\n';
md += '| Haritadaki toplam birim | ' + parcaToplami + ' |\n\n';

md += '## En kârlı ve en sert on il\n\n';
md += '`oran = değer ÷ savunma` — yüksekse ucuz lokma, düşükse sert ceviz.\n\n';
const enKarli = satirlar.slice().sort((a, b) => b.yeniOran - a.yeniOran);
md += '### Yeni dağılımda en kârlı beş\n\n';
md += '| İl | Değer | Parça | Eski savunma | Yeni savunma | Eski oran | **Yeni oran** |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const s of enKarli.slice(0, 5))
  md +=
    '| ' +
    s.ad +
    ' | ' +
    s.deger +
    ' | ' +
    s.parca +
    ' | ' +
    s.eski +
    ' | ' +
    s.yeni +
    ' | ' +
    f(s.eskiOran) +
    ' | **' +
    f(s.yeniOran) +
    '** |\n';
md += '\n### Yeni dağılımda en sert beş\n\n';
md += '| İl | Değer | Parça | Eski savunma | Yeni savunma | Eski oran | **Yeni oran** |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const s of enKarli.slice(-5).reverse())
  md +=
    '| ' +
    s.ad +
    ' | ' +
    s.deger +
    ' | ' +
    s.parca +
    ' | ' +
    s.eski +
    ' | ' +
    s.yeni +
    ' | ' +
    f(s.eskiOran) +
    ' | **' +
    f(s.yeniOran) +
    '** |\n';

md += "\n## Görev 06'nın şikâyet tablosu, yeni sayılarla\n\n";
md += '| İl | Değer | Eski savunma | **Yeni savunma** | Eski oran | **Yeni oran** |\n';
md += '|---|---|---|---|---|---|\n';
for (const ad of ['İstanbul', 'Kocaeli', 'Şanlıurfa', 'Ankara', 'Iğdır']) {
  const s = satirlar.find((x) => x.ad === ad);
  if (!s) continue;
  md +=
    '| **' +
    s.ad +
    '** | ' +
    s.deger +
    ' | ' +
    s.eski +
    ' | **' +
    s.yeni +
    '** | ' +
    f(s.eskiOran) +
    ' | **' +
    f(s.yeniOran) +
    '** |\n';
}

md += '\n## 81 ilin tamamı\n\n';
md +=
  '| İl | Değer | Parça | Eski | Yeni | Eski oran | Yeni oran |\n|---|---|---|---|---|---|---|\n';
for (const s of satirlar.slice().sort((a, b) => a.ad.localeCompare(b.ad, 'tr')))
  md +=
    '| ' +
    s.ad +
    ' | ' +
    s.deger +
    ' | ' +
    s.parca +
    ' | ' +
    s.eski +
    ' | ' +
    s.yeni +
    ' | ' +
    f(s.eskiOran) +
    ' | ' +
    f(s.yeniOran) +
    ' |\n';

md += '\n## Ölçümün kuralları\n\n';
md += '- Yeni savunma sayıları oyunun kendi `garnizon.js` fonksiyonlarından okunuyor;\n';
md += '  formül bu betikte KOPYALANMADI. Eski formül yalnızca karşılaştırma için burada.\n';
md += "- Karışım (hangi birim tipi) bu ölçümün konusu değil — o §4.5'ten geliyor ve\n";
md += '  değişmedi. Ölçülen şey KAÇ birim olduğu.\n';
md += '- Yayılım iki ölçüyle veriliyor: uçların oranı (kat) ve standart sapma. İlki tek bir\n';
md += '  aykırı ile kayabilir, ikincisi tabloyu bütün olarak anlatır.\n';

fs.writeFileSync(path.join(PROJ, 'veri', 'garnizon-olcum.md'), md, 'utf8');

console.log('GARNİZON DENGESİ ÖLÇÜMÜ');
console.log('  yayılım   : ' + f(eskiY.kat) + ' kat  →  ' + f(yeniY.kat) + ' kat');
console.log('  std sapma : ' + f(eskiY.sapma) + '      →  ' + f(yeniY.sapma));
console.log('  toplam    : ' + eskiToplam + ' birim  →  ' + yeniToplam + ' birim');
console.log(
  '  §7 kuralları: toplam ' +
    (toplamKorunuyor ? '✓' : '✗') +
    ' · sıfır parça ' +
    (sifirParca === 0 ? '✓' : '✗') +
    ' · tekdüzelik ' +
    (tekduzelikKirik === 0 ? '✓' : '✗')
);
console.log('Yazıldı: veri/garnizon-olcum.md');

// Örnek: İstanbul'un parça dağılımı — bölüşümün gözle görülür hâli.
const ist = ilParcaGarnizonlari('34');
console.log(
  '\nÖrnek — İstanbul (' +
    ilGarnizonBoyu('34') +
    ' birim): ' +
    Object.keys(ist)
      .sort()
      .map((id) => id + '→' + ist[id])
      .join(' · ')
);
console.log(
  '  birimler: ' +
    Object.keys(ist)
      .sort()
      .map((id) => id + ' ' + JSON.stringify(garnizonBirimleri(id)))
      .join(' · ')
);
