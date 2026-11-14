// MENÜ EKRANLARININ SADELEŞTİRİLMİŞ GEOMETRİSİ.
// Çalıştırma:  node scripts/menu-geometri-uret.js
// Çıktı:       veri/menu-geometri.json
//
// ---- NİYE GEREKLİ (Baki, 2026-08-03: "yeni sefere basınca 3-4 saniye bekliyor") ----
// Menü ekranları haritayı OYUNUN tam çözünürlüklü verisiyle çiziyordu. Oyun haritası 7×
// yakınlaştığı için o ayrıntıya muhtaç; menü HİÇ yakınlaşmıyor ve harita ekranda ~0.9
// piksel/birim ölçekte duruyor. Ölçüldü: mod ekranı açılırken ayrıştırılan yol verisi
// (arka harita + sınır + 3 mini kart) 6.6 MB, il seçimi 824 KB. Gecikmenin kaynağı bu.
//
// Bu betik menü için ayrı bir geometri üretir: aynı şekiller, ~1 birim (≈1 piksel)
// toleransla sadeleştirilmiş. Oyun haritası (Harita.js) tam çözünürlükte KALIR.
//
// ---- TOPOLOJİK SADELEŞTİRME (algoritma: scripts/topoloji.js) — her parça ayrı ayrı SADELEŞTİRİLMEZ ----
// Komşu parçalar sınırlarını nokta nokta paylaşıyor (bkz. veri/URETIM-NOTU.md,
// parca-kenarlari bölümü). Her parça KENDİ BAŞINA sadeleştirilse iki taraf farklı
// noktaları atar, ortak sınır iki farklı çizgiye ayrışır: kıl aralıklar + üst üste
// binmeler. Bunun yerine:
//   1. Her halka, komşusu değiştiği yerlerden PARÇALARA (koşulara) bölünür.
//   2. Her koşu BİR KEZ sadeleştirilir (iki sahibi de aynı sonucu kullanır).
//   3. Halkalar sadeleşmiş koşulardan yeniden dikilir.
// Douglas–Peucker nokta SİLER, asla kaydırmaz — kalan noktalar orijinal metinlerin
// birebir kendisi. Paylaşılan kenarlar bu yüzden iki tarafta hâlâ birebir aynı.
//
// Çıktıya `ciftler` de yazılıyor (komşu çifti → aralarındaki sadeleşmiş çizgi) —
// "koyu çizgi yalnızca düşman kenarında" kuralının verisi. Bu dosya, daha önce üretilen
// tam çözünürlüklü `veri/parca-kenarlari.json`un YERİNİ ALIR.

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const parcaVerisi = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'parcalar.json'), 'utf8'));
const haritaVerisi = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'harita.json'), 'utf8'));

// Menü ~0.9 piksel/birim çiziyor; 1 birimlik sapma 1 pikselin altında kalır.
const TOLERANS = 1.0;

const say = (obj) => Object.values(obj).reduce((t, y) => t + y.length, 0);

// Algoritma artık ortak dosyada (Görev 20): oyun haritasının kademeli geometrisi de aynı
// sadeleştiriciyi kullanıyor. Taşıma bu dosyanın çıktısını birebir korudu (sha256).
const { topolojikSadelestir } = require('./topoloji');

// ---- 181 PARÇA + 81 İL ----
const parcaYollari = {};
for (const [pid, p] of Object.entries(parcaVerisi.parcalar)) parcaYollari[pid] = p.yol;
const ilYollari = {};
for (const [kod, i] of Object.entries(haritaVerisi.iller)) ilYollari[kod] = i.yol;

const oncekiParca = say(parcaYollari);
const oncekiIl = say(ilYollari);

const parca = topolojikSadelestir(parcaYollari, TOLERANS);
const il = topolojikSadelestir(ilYollari, TOLERANS);

const sonrakiParca = say(parca.yollar);
const sonrakiIl = say(il.yollar);
const ciftBoyut = say(parca.ciftler);

console.log('MENÜ GEOMETRİSİ — tolerans ' + TOLERANS + ' birim');
console.log(
  '  181 parça : ' +
    (oncekiParca / 1024).toFixed(0) +
    ' KB → ' +
    (sonrakiParca / 1024).toFixed(0) +
    ' KB (%' +
    Math.round((100 * sonrakiParca) / oncekiParca) +
    ') · paylaşılan kenar ' +
    parca.paylasilan
);
console.log(
  '  81 il     : ' +
    (oncekiIl / 1024).toFixed(0) +
    ' KB → ' +
    (sonrakiIl / 1024).toFixed(0) +
    ' KB (%' +
    Math.round((100 * sonrakiIl) / oncekiIl) +
    ') · paylaşılan kenar ' +
    il.paylasilan
);
console.log(
  '  parça çiftleri: ' +
    Object.keys(parca.ciftler).length +
    ' · ' +
    (ciftBoyut / 1024).toFixed(0) +
    ' KB'
);

// Emniyet: sadeleştirme hiçbir birimi düşürmemeli.
if (Object.keys(parca.yollar).length !== 181) throw new Error('parça sayısı 181 değil!');
if (Object.keys(il.yollar).length !== 81) throw new Error('il sayısı 81 değil!');

fs.writeFileSync(
  path.join(KOK, 'veri', 'menu-geometri.json'),
  JSON.stringify({
    aciklama:
      'MENÜ ekranlarının sadeleştirilmiş geometrisi (tolerans ' +
      TOLERANS +
      ' birim, topolojik: paylaşılan kenarlar iki tarafta birebir aynı). Oyun haritası ' +
      'tam çözünürlüklü parcalar.json/harita.json kullanmaya devam eder; menü, mod ekranı ' +
      've il seçimi bunu kullanır. scripts/menu-geometri-uret.js ile üretildi.',
    meta: { ...parcaVerisi.meta, tolerans: TOLERANS },
    parcalar: parca.yollar,
    // Komşu parça çifti → aralarındaki sınır çizgisi ("koyu çizgi yalnız düşman
    // kenarında" kuralının verisi; tam çözünürlüklü parca-kenarlari.json'un yerini aldı).
    ciftler: parca.ciftler,
    iller: il.yollar,
  })
);
console.log('yazıldı: veri/menu-geometri.json');
