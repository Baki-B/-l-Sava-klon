// MOD KARTLARININ MİNİ HARİTA KÜMELERİ.
// Çalıştırma:  node scripts/mod-hedefleri-uret.js
// Çıktı:       veri/mod-hedefleri.json
//
// Mod seçme ekranındaki üç kart, o modun KAZANMA HÂLİNİ gösteren mini haritalar taşıyor
// (karar belgesi "Kartlar" bölümü): fetihte 181 parçanın hepsi oyuncunun, %50'de tam 91'i,
// güç yarışında üç blok ve en büyüğü oyuncunun.
//
// ---- KAYNAK: ONAYLANAN ÖNİZLEME, ALGORİTMA DEĞİL ----
// Kümeler `onizleme/mod-ekrani.html`'den çıkarılıyor — Baki'nin gördüğü ve onayladığı
// karelerden. Kural setinden yeniden türetmek DENENDİ ve tutmadı: %50 kümesi için düz
// BFS (Bursa'dan halka halka büyü, en yakın 91) onaylanan kümeyle 88/91 örtüşüyor;
// önizlemedeki "fazlalığı Bursa'dan en uzaktakinden geri ver" adımı beraberlikleri başka
// kırmış. Piksel piksel aynı görüntü isteniyorsa kaynak onaylanan görüntünün kendisidir.
//
// Önizleme değişirse bu betik yeniden çalıştırılır; sayılar tutmazsa aşağıdaki denetimler
// bağırır (91 eşiği `denge.js`'ten geliyor — "ekran sayı uyduramaz").

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const { DENGE } = require(path.join(KOK, 'src', 'denge.js'));
const { karis, askeriTon, MENU_RENK } = require(path.join(KOK, 'src', 'tema.js'));
const parcaVerisi = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'parcalar.json'), 'utf8'));
const PARCALAR = parcaVerisi.parcalar;

// Önizlemedeki p0..p180 sırası = parcalar.json'daki EKLEME sırası (doğrulandı:
// ana menü önizlemesinin durum-0 dolguları bu sırayla birebir örtüşüyor).
const IDLER = Object.keys(PARCALAR);

const html = fs.readFileSync(path.join(KOK, 'onizleme', 'mod-ekrani.html'), 'utf8');

// 181 parçalık mozaik satırları: arka plan + üç kart. Son üçü kartlar (FETİH · %50 · GÜÇ).
const mozaikler = html
  .split('\n')
  .map((satir) => [...satir.matchAll(/href="#p(\d+)" fill="(#[0-9a-fA-F]{6})"/g)])
  .filter((eslesme) => eslesme.length === IDLER.length);
if (mozaikler.length !== 4)
  throw new Error(
    'önizlemede 4 mozaik bekleniyordu (arka plan + 3 kart), ' + mozaikler.length + ' bulundu'
  );
const [fetihK, yarimK, puanK] = mozaikler.slice(1);

// Bir mozaik satırını renk → parça listesi tablosuna çevir.
function gruplar(eslesmeler) {
  const g = {};
  for (const e of eslesmeler)
    (g[e[2].toLowerCase()] = g[e[2].toLowerCase()] || []).push(IDLER[+e[1]]);
  return g;
}

// İl tonları — ekranın kullandığı formüllerle AYNI kaynaktan (tema.js). Önizleme bu
// formüllerle üretilmişti; tutmazsa ya formül ya önizleme değişmiş demektir, ikisi de
// sessiz geçilecek şey değil.
const ilRengi = (kod) => PARCALAR[IDLER.find((pid) => PARCALAR[pid].kod === kod)].renkIl;
const OYUNCU_IL = '16'; // Bursa — mini haritalarda "sen"
const oyuncuTonu = karis(MENU_RENK.kara, askeriTon(ilRengi(OYUNCU_IL)), 0.92).toLowerCase();
const ton62 = (kod) => karis(MENU_RENK.kara, askeriTon(ilRengi(kod)), 0.62).toLowerCase();

const hatalar = [];

// ---- FETİH: 181/181 oyuncu tonu ----
const fetihG = gruplar(fetihK);
if (!fetihG[oyuncuTonu] || fetihG[oyuncuTonu].length !== IDLER.length)
  hatalar.push(
    'fetih kartı tek renk değil ya da oyuncu tonu tutmuyor (beklenen ' +
      oyuncuTonu +
      ' × ' +
      IDLER.length +
      ')'
  );

// ---- %50: tam eşik kadar parça oyuncunun ----
const yarimG = gruplar(yarimK);
const yarimOyuncu = (yarimG[oyuncuTonu] || []).sort();
// Eşik denge.js'ten: DENGE.MOD ayarlanırsa buradaki denetim de onunla birlikte kayar.
const esik = Math.ceil(DENGE.MOD.TIPLER.yarim.ESIK_ORANI * IDLER.length);
if (yarimOyuncu.length !== esik)
  hatalar.push('%50 kartı ' + yarimOyuncu.length + ' parça gösteriyor, eşik ' + esik);

// ---- GÜÇ YARIŞI: üç blok, en büyüğü oyuncunun ----
const puanG = gruplar(puanK);
const bloklar = {
  [OYUNCU_IL]: (puanG[oyuncuTonu] || []).sort(),
  '07': (puanG[ton62('07')] || []).sort(),
  '25': (puanG[ton62('25')] || []).sort(),
};
const boyutlar = Object.fromEntries(Object.entries(bloklar).map(([k, v]) => [k, v.length]));
const enBuyuk = Math.max(...Object.values(boyutlar));
if (boyutlar[OYUNCU_IL] !== enBuyuk)
  hatalar.push('güç yarışı kartında en büyük blok oyuncunun değil: ' + JSON.stringify(boyutlar));
const tumu = [...bloklar[OYUNCU_IL], ...bloklar['07'], ...bloklar['25']];
if (new Set(tumu).size !== tumu.length) hatalar.push('güç yarışı blokları kesişiyor');

console.log('MOD HEDEFLERİ (onaylanan önizlemeden)');
console.log('  fetih : ' + IDLER.length + '/' + IDLER.length + ' oyuncu');
console.log('  %50   : ' + yarimOyuncu.length + ' oyuncu (eşik ' + esik + ')');
console.log(
  '  puan  : ' +
    Object.entries(boyutlar)
      .map(([k, v]) => k + ':' + v)
      .join(' · ') +
    ' · bağımsız:' +
    (IDLER.length - tumu.length)
);

if (hatalar.length) {
  for (const h of hatalar) console.log('  ✗ ' + h);
  process.exit(1);
}

fs.writeFileSync(
  path.join(KOK, 'veri', 'mod-hedefleri.json'),
  JSON.stringify({
    aciklama:
      'Mod seçme ekranı kartlarının mini harita kümeleri — her modun KAZANMA HÂLİ. ' +
      "Baki'nin onayladığı onizleme/mod-ekrani.html'den çıkarıldı " +
      '(scripts/mod-hedefleri-uret.js; kural setinden türetme denendi, beraberlik ' +
      'kırılımları tutmadı). Fetih kartının listesi yok: 181 parçanın hepsi oyuncunun.',
    oyuncuIl: OYUNCU_IL,
    yarim: { oyuncu: yarimOyuncu },
    puan: { bloklar },
  })
);
console.log('yazıldı: veri/mod-hedefleri.json');
