// MUHAREBE REFERANS ÖLÇÜMÜ — Görev 05 / Adım 0–1, Görev 06 / Adım 1'de genişletildi.
// Çalıştırma:  node scripts/muharebe-referans.js     (İKİ rapor birden yazar)
//
// Bu betik iki ayrı soruyu aynı hakeme —tasarım §3.7'nin 15 satırlık doğrulama tablosuna—
// sorar. İkisi de tahminle değil ölçümle cevaplanıyor:
//
//   1) Görev 05: "zırhlı arazi çarpanı neye uygulanır?"  → veri/muharebe-referans.md
//
// ---- SORU 1 (Görev 05) ----
// Tasarım §3.5'teki "zırhlı birim çarpanı" NEYE uygulanıyor? Belge söylemiyor.
// Üç olasılık var:
//   hasar         → zırhlı birimin VERDİĞİ hasarı çarpar
//   dayaniklilik  → zırhlı birimin dayanıklılığını (canını) çarpar
//   ikisi         → her ikisini birden
//
// HAKEM: tasarım §3.7'deki 15 satırlık doğrulama tablosu. Tahmin yürütmüyoruz; üç yorum
// da kodlanıp tabloya karşı çalıştırılıyor, tabloyu yeniden üreten yorum doğru sayılıyor.
//
// Bu betik AYNI ZAMANDA §3.7'nin arkasındaki SÜREKLİ MODELİ yeniden kuruyor. Tablo
// "sürekli modelin ham çıktısı" diyor ama modelin kendisi hiçbir yerde yazılı değildi;
// tablo sayılarından geri çözüldü (aşağıdaki `surekliCoz`). Oyunun asıl motoru
// (`src/oyun/muharebe.js`) TAM SAYI birimlerle ve hasar havuzuyla çalışır — bu model
// onun yerine geçmez, ÖLÇÜTÜDÜR: motorun kazananları bununla karşılaştırılır
// (`testler/muharebe.test.js`).
//
// ---- ARAŞTIRMA TAVANI ÖLÇÜMÜ NEREYE GİTTİ ----
// Görev 06'da bu dosyanın içindeydi. Görev 07'de araştırma ağacı BİRİM BAŞINA ayrılınca
// (Baki'nin isteği) ölçüm de dal başına yapılır oldu ve kendi dosyasına taşındı:
// `scripts/arastirma-olcum.js`. Bu dosyanın `tabloyuKosturt`/`motorlaKosturt`/`bant`
// fonksiyonlarını oradan (ve `moral-olcum.js`'ten) `require` ediliyor — §3.7'nin tablosu
// TEK YERDE duruyor, üç ölçüm de aynı hakeme soruyor.
//
// Çıktı: veri/muharebe-referans.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz } = require('../src/oyun/muharebe.js');

const PROJ = path.join(__dirname, '..');
const M = DENGE.MUHAREBE;

// ---- §3.3 ETKİNLİK EĞRİLERİ ----
function kis(x, alt, ust) {
  return Math.min(ust, Math.max(alt, x));
}

// Bir ordunun ortalama zırhı — "tipik birimi ne kadar zırhlı".
// `statlar` verilmezse temel tablo kullanılır; araştırma ölçümü kaydırılmış tablo geçirir.
function zOrt(birimler, statlar) {
  const S = statlar || DENGE.BIRIMLER;
  let zirh = 0,
    sayi = 0;
  for (const t of DENGE.BIRIM_SIRASI) {
    const n = birimler[t] || 0;
    zirh += S[t].zirh * n;
    sayi += n;
  }
  return sayi === 0 ? 0 : zirh / sayi;
}

// ⚠ MOTORUN `etkinlik`İNİN İKİZİ. Sürekli model motoru DEĞİL, ÖLÇÜTÜ olduğu için kendi
// kopyasını taşıyor; formül değişince İKİSİ BİRDEN değişmek zorunda (2026-08-11'de ağır
// vuruş delicilik modeline geçildi — gerekçe `denge.js AGIR_DELICILIK`).
function etkinlik(z) {
  const hafif = kis(1 - z / M.HAFIF_BOLEN, M.HAFIF_ALT, 1);
  const kalanZirh = z * (1 - M.AGIR_DELICILIK);
  return { agir: kis(M.AGIR_VERIM * (1 - kalanZirh / M.HAFIF_BOLEN), M.AGIR_ALT, 1), hafif };
}

// ---- SÜREKLİ MODEL ----
// Tur tur, EŞZAMANLI hasar. Her tarafın verdiği hasar, tur başındaki kalan kuvvet
// oranıyla ölçeklenir; kayıp kompozisyona orantılı olduğu için zOrt sabit kalır.
// "Kalan kuvvet" = başlangıç birim sayısı × kalan can oranı (tablodaki sayı budur).
//
// `statlar` = { saldiran, savunan } — taraf başına birim stat tablosu. Verilmezse ikisi de
// DENGE.BIRIMLER olur ve fonksiyon Görev 05'teki davranışını birebir gösterir. Her taraf
// KENDİ tablosuyla vurur, kendi tablosuyla dayanır ve kendi zırhıyla korunur; araştırmanın
// tek taraflı olabilmesi için ayrımın burada yapılması şart.
function surekliCoz(saldiran, savunan, arazi, yorum, statlar) {
  const A = DENGE.ARAZI[arazi];
  const sSaldiran = (statlar && statlar.saldiran) || DENGE.BIRIMLER;
  const sSavunan = (statlar && statlar.savunan) || DENGE.BIRIMLER;
  const zSaldiran = zOrt(saldiran, sSaldiran),
    zSavunan = zOrt(savunan, sSavunan);

  // Bir ordunun tam kadroyla verdiği hasar (arazi uygulanmış).
  const hasar = (birimler, hedefZ, savunanMi, S) => {
    const e = etkinlik(hedefZ);
    let toplam = 0;
    for (const t of DENGE.BIRIM_SIRASI) {
      const n = birimler[t] || 0;
      if (n === 0) continue;
      const b = S[t];
      let d = n * (b.agirVurus * e.agir + b.hafifVurus * e.hafif);
      if (t === 'zirhli' && (yorum === 'hasar' || yorum === 'ikisi')) d *= A.zirhli;
      toplam += d;
    }
    return savunanMi ? toplam * A.savunan : toplam;
  };

  // Bir ordunun toplam canı.
  const can = (birimler, S) => {
    let toplam = 0;
    for (const t of DENGE.BIRIM_SIRASI) {
      const n = birimler[t] || 0;
      if (n === 0) continue;
      let d = S[t].dayaniklilik;
      if (t === 'zirhli' && (yorum === 'dayaniklilik' || yorum === 'ikisi')) d *= A.zirhli;
      toplam += n * d;
    }
    return toplam;
  };

  const sayi = (birimler) => DENGE.BIRIM_SIRASI.reduce((a, t) => a + (birimler[t] || 0), 0);

  const dA = hasar(saldiran, zSavunan, false, sSaldiran),
    dB = hasar(savunan, zSaldiran, true, sSavunan);
  const canA0 = can(saldiran, sSaldiran),
    canB0 = can(savunan, sSavunan);
  let canA = canA0,
    canB = canB0;

  for (let t = 0; t < 500 && canA > 0 && canB > 0; t++) {
    const oranA = canA / canA0,
      oranB = canB / canB0;
    canB -= dA * oranA;
    canA -= dB * oranB;
  }
  const kalanA = Math.max(0, canA / canA0) * sayi(saldiran);
  const kalanB = Math.max(0, canB / canB0) * sayi(savunan);
  return {
    kalanSaldiran: kalanA,
    kalanSavunan: kalanB,
    kazanan: kalanA > kalanB ? 'saldiran' : kalanB > kalanA ? 'savunan' : 'berabere',
  };
}

// ---- §3.7 DOĞRULAMA TABLOSU (tasarım belgesinden birebir) ----
const p = (n) => ({ piyade: n });
const t = (n) => ({ topcu: n });
const z = (n) => ({ zirhli: n });
const karma = { piyade: 3, topcu: 1, zirhli: 1 };

// ---- TABLO GÖREV 12'DE YENİDEN ÖLÇÜLDÜ (2026-08-06) ----
// Arazi çarpanları bir tık yumuşadı (dağlık savunma 1.35 → 1.30, tepelik 1.15 → 1.10;
// bkz. `denge.js ARAZI`), bu yüzden dört satırın KALAN KUVVET sayısı kaydı. Aşağıdaki
// sayılar tahmin değil, yeni ayarla yeniden koşulan sürekli modelin çıktısı.
//
// ⚠ KAZANAN HİÇBİR SATIRDA DEĞİŞMEDİ ve §3.7'nin dört tasarım kısıtı da ayakta:
// bu, yumuşatmanın nerede kesileceğini belirleyen ölçüt oldu (daha cesur bir yumuşatmada
// "1 zırhlı vs 1 topçu (dağlık)" ters dönüyor ve topçu her arazide zırhlıdan kötü bir
// birime düşüyordu). Değişen sayılar: 1.46→1.45 · 0.53→0.55 · 0.18→0.12 · 1.76→1.49 ·
// 3.93→3.90. Eski sayılar `docs/il-savasi-tasarim.md` §3.7'nin tarih kaydında.
// ---- ⚠ TABLO 2026-08-08'DE YENİDEN ÇİVİLENDİ ----
//
// Baki mimariyi sıfırdan istedi (*"statlarımızın her birini dengeleyelim… baştan aşağı
// dengeli bir mimari oluştur, ama kazanımlarımızı sağlam bir matematiğe oturtarak"*) ve
// birim statlarının dokuzu birden değişti. Eski tablo ESKİ statlara ait kalan-kuvvet
// sayılarını taşıyordu; 15 satırın 14'ü anında kırıldı.
//
// ---- BİÇİM DEĞİŞTİ: ARTIK BEKLENEN KAZANAN AÇIKÇA YAZILI ----
//
// Eskiden beklenen kazanan, sürekli modelin ürettiği iki kalan-kuvvet sayısından
// TÜRETİLİYORDU (`bant()`). Yeni mimaride bu yol tıkandı ve sebebi öğretici:
//
//   Sürekli model BOZGUN BİLMİYOR. Motor ise Görev 07'den beri oran modeliyle çalışıyor
//   ve orada TEK BİRİMLİK ORDU DAĞILAMAZ — bozgun için "en az bir birim kaybı" şartı var,
//   tek birimlik ordu ya savaşır ya imha olur. Sürekli model kesirli can gördüğü için o
//   orduyu da dağıtıyor. Dayanıklılıklar 4× büyüyüp savaşlar uzayınca fark belirginleşti:
//   "1 zırhlı vs 2 piyade" satırında sürekli model piyadeyi, motor zırhlıyı kazandırıyor.
//
// Yani sürekli model artık oyunu temsil eden bir ölçüt DEĞİL. Emekliye ayrılmadı ama
// terfi de etmedi: aşağıda ikincil çapraz kontrol olarak koşmaya devam ediyor.
//
// ⚠ "MOTORDAN ÜRETİP MOTORA SORMAK" TUZAĞINA DÜŞÜLMEDİ. Tablonun BEKLENEN KAZANANLARI
// motordan türetilmiyor — dördü de aşağıdaki KISITLAR listesinden geliyor ve o liste
// tasarım kararlarının ta kendisi (Görev 05'ten beri elle yazılı, oyunun kimliği).
// Motordan gelen tek şey `kalanOrani`: bir REGRESYON çıpası. Gelecekte biri bir statı
// oynatırsa o sayı kayar ve ölçüm öter.
//
// Satır biçimi: [ad, saldıran, savunan, arazi, beklenenKazanan, kalanOrani]
//   kalanOrani = kazananın başlangıç kuvvetinin kaçta kaçıyla ayakta kaldığı (0–1).
const TABLO = [
  ['1 zırhlı vs 1 piyade (ova)', z(1), p(1), 'ova', 'saldiran', 1.0],
  // "Dar kazanır" burada: zırhlı ayakta ama iki piyadeden biri de sağ çıkıyor.
  ['1 zırhlı vs 2 piyade (ova)', z(1), p(2), 'ova', 'saldiran', 1.0],
  ['1 zırhlı vs 3 piyade (ova)', z(1), p(3), 'ova', 'savunan', 1.0],
  ['1 zırhlı vs 2 piyade (dağlık)', z(1), p(2), 'daglik', 'savunan', 1.0],
  ['1 zırhlı vs 1 topçu (ova)', z(1), t(1), 'ova', 'saldiran', 1.0],
  ['1 zırhlı vs 1 topçu (tepelik)', z(1), t(1), 'tepelik', 'saldiran', 1.0],
  // §3.7 kısıt 3'ün taşıyıcısı: "topçunun tek şansı coğrafya". Arazi yumuşatmasının
  // sınırını çizen satır budur — dağlık savunma çarpanı düşürülürse ilk buradan kırılır.
  ['1 zırhlı vs 1 topçu (dağlık)', z(1), t(1), 'daglik', 'savunan', 1.0],
  ['4 zırhlı vs 6 topçu (ova)', z(4), t(6), 'ova', 'saldiran', 0.5],
  ['4 zırhlı vs 6 topçu (tepelik)', z(4), t(6), 'tepelik', 'savunan', 0.5],
  ['4 zırhlı vs 6 topçu (dağlık)', z(4), t(6), 'daglik', 'savunan', 0.83],
  ['1 piyade vs 1 topçu (ova)', p(1), t(1), 'ova', 'savunan', 1.0],
  ['2 piyade vs 1 topçu (ova)', p(2), t(1), 'ova', 'saldiran', 1.0],
  ['3 piyade vs 2 topçu (ova)', p(3), t(2), 'ova', 'saldiran', 0.67],
  ['3p+1t+1z vs 5 topçu (ova)', karma, t(5), 'ova', 'saldiran', 0.4],
  ['3p+1t+1z vs 8 piyade (ova)', karma, p(8), 'ova', 'savunan', 0.75],
];

// Tablonun ALTINDAKİ dört tasarım kısıtı (§3.7). Tablo satırlarının kazananları bunları
// zaten kodluyor; burada hangi satırın hangi kısıtı taşıdığı yazılı, çünkü araştırma
// ölçümünde "hangi kural kırıldı" cümlesini kurabilmek gerekiyor.
const KISITLAR = [
  { ad: 'Piyade denk sayıda zırhlıyı/topçuyu asla yenmez', satirlar: [0, 10] },
  { ad: 'Zırhlı piyadeyi 1v1 ezer · 2v1 dar kazanır · 3v1 kaybeder', satirlar: [0, 1, 2] },
  { ad: 'Zırhlı topçuyu ovada yener; topçunun tek şansı coğrafya', satirlar: [4, 5, 6] },
  { ad: 'Zırhlı 4v6 ölçeğinde ovada kazanır, dağlıkta ezilir', satirlar: [7, 8, 9] },
];

// ---- KESİNLİK BANDI — "kazanan değişti mi" YETERLİ BİR ÖLÇÜT DEĞİL ----
//
// İlk deneme "kazananı koru" ölçütüyle yapıldı ve saçma bir cevap verdi: tavan Sv.0.
// Sebep, tablonun kendisinde: üç satır KIL PAYI bitiyor — kazanan kendi kuvvetinin
// yalnızca %7–18'iyle ayakta kalıyor (#1, #6, #10). Bunlar Görev 05'te tam sayı sınırında
// beraberlik bozma kuralını yazdıran satırların ta kendisi. Böyle bir satırda kazananın
// değişmesi "denge bozuldu" demek değil, "yazı-tura öbür yüzüne düştü" demektir.
//
// Bu yüzden her satır ÜÇ BANTTAN birine konuyor ve ölçüt şu: KESİN bir sonuç TERSİNE
// dönmüş mü? Yazı-turanın öbür yüze düşmesi bozulma sayılmaz; kesin bir sonucun yazı-turaya
// düşmesi ayrıca (yumuşama olarak) raporlanır ama tavanı belirlemez.
//
// EŞİK 0.25 TAHMİN DEĞİL, TABLONUN KENDİ VERİSİNDEKİ BOŞLUK. Tasarım §3.7'nin 15 satırında
// kazananın kalan kuvvet oranları sıralandığında şöyle bir boşluk var:
//     0.07 · 0.15 · 0.18   ← kıl payı biten üç satır
//     ————— BOŞLUK —————
//     0.29 · 0.30 · 0.31 · 0.50 …  ← kesin biten on iki satır
// Eşik bu boş bandın ortasına konuyor; hiçbir satıra uydurulmadı.
const KESINLIK_ESIGI = 0.25;

function birimAdedi(birimler) {
  return DENGE.BIRIM_SIRASI.reduce((a, t) => a + (birimler[t] || 0), 0);
}

// Bir sonucun okunuşu: kim kazandı ve sonuç KESİN mi?
// Kazanan KENDİ başlangıç kuvvetinin eşikten azıyla ayakta kaldıysa sonuç "kıl payı"dır.
function bant(kalanA, kalanB, sayiA, sayiB) {
  if (kalanA > kalanB) return { kazanan: 'saldiran', kesin: kalanA / sayiA >= KESINLIK_ESIGI };
  if (kalanB > kalanA) return { kazanan: 'savunan', kesin: kalanB / sayiB >= KESINLIK_ESIGI };
  return { kazanan: 'berabere', kesin: false };
}

// Tablonun BEKLENTİSİ. 2026-08-08'den beri kazanan tablodan doğrudan okunuyor (tasarım
// kararı), kesinlik ise kaydedilmiş kalan orandan çıkıyor.
//
// ⚠ SATIRIN BİÇİMİNİ OKUYAN TEK YER BURASI OLMALI ve bu kural 2026-08-11'de kanla yazıldı.
// 2026-08-08'de biçim değişti (5. alan sayı değil, kazananın adı) ve DÖRT ayrı çağrı yeri
// eski biçimde kaldı: bu dosyanın rapor özeti, `arastirma-olcum.js`, `moral-olcum.js` (iki
// yerde) ve bir test. Hepsi `sayı > 'saldiran'` karşılaştırması yapıp sessizce `false`
// üretiyordu — üç rapor yanlış sonuç yazıyor, bir test hiçbir şey sınamıyordu. Dışa
// açılmasının sebebi bu: biçimi bilen tek fonksiyon olsun, bir daha kopyalanmasın.
function beklenenBant(satir) {
  const [, , , , kazanan, oran] = satir;
  return { kazanan, kesin: oran >= KESINLIK_ESIGI };
}

// 15 satırı verilen stat tablolarıyla koşturur ve sonucu tasarımın KENDİ sayılarıyla
// karşılaştırır (hakem yine tasarım belgesi, bizim modelimiz değil). Üç sonuç:
//
//   'kirik'   → kazanan değişti VE taraflardan en az biri için sonuç KESİNDİ.
//               Aradığımız bozulma budur: ya kesin bir zafer kaybedildi, ya da kıl payı
//               kazanılan bir muharebe artık kesin bir yenilgi.
//   'yumusak' → kazanan aynı ama kesin zafer kıl payına düştü. Bilgi olarak sayılır,
//               tavanı belirlemez: taş-kağıt-makas hâlâ ayakta, sadece daha kanlı.
//   'tutuyor' → kazanan aynı; ya da iki tarafta da kıl payıydı, yazı-tura öbür yüze düştü.
//
// Dönen: { kirik, yumusak, satirDurumu: ('tutuyor'|'kirik'|'yumusak')[], kisitlar: bool[] }
function tabloyuKosturt(statSaldiran, statSavunan) {
  const statlar = { saldiran: statSaldiran, savunan: statSavunan };
  const satirDurumu = TABLO.map((satir) => {
    const [, s, d, arazi] = satir;
    const nA = birimAdedi(s),
      nB = birimAdedi(d);
    const beklenen = beklenenBant(satir);
    const r = surekliCoz(s, d, arazi, 'hasar', statlar);
    const bulunan = bant(r.kalanSaldiran, r.kalanSavunan, nA, nB);
    if (bulunan.kazanan === beklenen.kazanan)
      return beklenen.kesin && !bulunan.kesin ? 'yumusak' : 'tutuyor';
    return beklenen.kesin || bulunan.kesin ? 'kirik' : 'tutuyor';
  });
  return {
    kirik: satirDurumu.filter((d) => d === 'kirik').length,
    yumusak: satirDurumu.filter((d) => d === 'yumusak').length,
    satirDurumu,
    kisitlar: KISITLAR.map((k) => k.satirlar.every((i) => satirDurumu[i] !== 'kirik')),
  };
}

// ---- AYNI ÖLÇÜM, OYUNUN GERÇEK MOTORUYLA ----
//
// Sürekli model bir ÖLÇÜTTÜR, oyun değildir: kesirli birim tanır, moral ve bozgun bilmez.
// Oyunun motoru tam sayı birimlerle, hasar havuzuyla ve bozgunla çalışır ve bu yüzden
// DAHA HASSASTIR — sürekli modelde "kıl payı"na düşen bir sonuç motorda tam bir zafere
// veya yenilgiye dönüşür. Tavan ikisinin de sağlam olduğu yerden seçilmeli, yoksa ölçüm
// oyunun kendisinde tutmayan bir sayı üretir.
//
// KIL PAYI SATIRLAR MOTORDA DEĞERLENDİRİLMEZ. Motorda kazanan her zaman en az 1 birimle
// çıkar, yani "kalan kuvvet oranı" küçük muharebelerde kesinliği ölçemez. Bu yüzden ölçüt
// TASARIMIN kendi kesinliği: §3.7'de kıl payı biten üç satırda (0.07 · 0.15 · 0.18) motorun
// hangi tarafı seçtiği bağlayıcı sayılmaz — Görev 05'te o üç satır için ayrı bir beraberlik
// bozma kuralı yazmak zorunda kalınmıştı, tam da temsil edilemedikleri için.
function motorlaKosturt(statSaldiran, statSavunan) {
  const statlar = { saldiran: statSaldiran, savunan: statSavunan };
  const satirDurumu = TABLO.map((satir) => {
    const [, s, d, arazi] = satir;
    const beklenen = beklenenBant(satir);
    if (!beklenen.kesin) return 'kilPayi';
    const r = muharebeCoz({
      saldiran: { birimler: s },
      savunan: { birimler: d },
      arazi,
      tohum: null, // şans kapalı: ölçüm belirlenimci olmalı
      statlar,
    });
    return r.kazanan === beklenen.kazanan ? 'tutuyor' : 'kirik';
  });
  return {
    kirik: satirDurumu.filter((x) => x === 'kirik').length,
    satirDurumu,
    kisitlar: KISITLAR.map((k) => k.satirlar.every((i) => satirDurumu[i] !== 'kirik')),
  };
}

module.exports = {
  TABLO,
  KISITLAR,
  KESINLIK_ESIGI,
  surekliCoz,
  etkinlik,
  zOrt,
  bant,
  beklenenBant,
  tabloyuKosturt,
  motorlaKosturt,
};

// Doğrudan çalıştırıldıysa raporu üret (testten `require` edilince üretmez).
if (require.main === module) {
  const YORUMLAR = ['hasar', 'dayaniklilik', 'ikisi'];

  // ---- ⚠ ÖLÇÜT 2026-08-11'DE ONARILDI: SAYI DEĞİL, KAZANAN ----
  //
  // Bu blok TABLO'nun ESKİ biçimine göre yazılmıştı: satırın 5. ve 6. alanı iki KALAN
  // KUVVET sayısıydı ve yorumlar onlara ±0.02 ile karşılaştırılıyordu. 2026-08-08'de
  // biçim değişti (5. alan artık beklenen KAZANAN, 6. alan tek bir kalan oran) ama bu
  // blok güncellenmedi: `Math.abs(sayı − 'saldiran')` her satırda NaN veriyor, NaN her
  // karşılaştırmayı false yapıyordu. Sonuç, rapor üç yorumu da 0/15 gösteriyor ve
  // "model gözden geçirilmeli" diye BİTİYORDU — hiçbir şey bozuk olmadığı hâlde.
  //
  // Sessiz kalmasının sebebi: raporun bu bölümünü hiçbir test okumuyor (testler
  // `tabloyuKosturt`/`motorlaKosturt`'tan geçiyor, onlar doğru alanları kullanıyor).
  //
  // Yeni ölçüt tablonun bugünkü biçimine uyuyor: KAZANAN doğru mu? Kalan kuvvet sayıları
  // referans olmaktan çıktı (tasarım tablosundaki ondalıklar eski statlara aitti), o
  // yüzden tek sütun kaldı.
  const sonuc = {};
  for (const y of YORUMLAR) {
    sonuc[y] = TABLO.map(([ad, s, d, arazi, beklenenKazanan]) => {
      const r = surekliCoz(s, d, arazi, y);
      return { ad, r, kazananTutuyor: r.kazanan === beklenenKazanan };
    });
  }

  const say = (y, alan) => sonuc[y].filter((x) => x[alan]).length;

  let md = '# MUHAREBE REFERANS ÖLÇÜMÜ\n\n';
  md += '> Üretildi: `node scripts/muharebe-referans.js` — ELLE DÜZENLEME.\n';
  md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n\n';
  md += 'Tasarım §3.5 "zırhlı birim çarpanı"nın neye uygulandığı belirsizdi. Üç yorum da\n';
  md += 'kodlanıp §3.7 doğrulama tablosuna karşı çalıştırıldı. Hakem tablodur.\n\n';
  md += '## Özet\n\n| Yorum | Kazananı tutan satır |\n|---|---|\n';
  for (const y of YORUMLAR)
    md += '| `' + y + '` | **' + say(y, 'kazananTutuyor') + '/' + TABLO.length + '** |\n';
  const enIyi = Math.max(...YORUMLAR.map((y) => say(y, 'kazananTutuyor')));
  const kazanan =
    enIyi > 0 && YORUMLAR.filter((y) => say(y, 'kazananTutuyor') === enIyi).length === 1
      ? YORUMLAR.find((y) => say(y, 'kazananTutuyor') === enIyi)
      : null;
  md +=
    '\n**Sonuç: ' +
    (kazanan
      ? '`' +
        kazanan +
        '` — zırhlı arazi çarpanı, zırhlı birimin VERDİĞİ HASARA uygulanır.\n' +
        'Bu değer `denge.js DENGE.ARAZI[...].zirhli` altında duruyor ve `muharebe.js` onu\n' +
        'birimin hasar katkısına çarparak uyguluyor.'
      : 'ÖLÇÜT ARTIK AYIRMIYOR — üç yorum da aynı sayıda satırda kazananı tutturuyor.') +
    '**\n\n';

  if (!kazanan)
    md +=
      "> ⚠ **Bu bir bozulma değil, ölçütün körelmesi.** Görev 05'te kararı veren şey\n" +
      "> kazananlar değil, tasarım §3.7'nin KALAN KUVVET ONDALIKLARIYDI (±0.02): üç yorum\n" +
      '> ancak o hassasiyette ayrışıyordu. O ondalıklar eski birim statlarına aitti ve\n' +
      "> 2026-08-08'de mimari yenilenince tablodan çıkarıldı; geriye beklenen KAZANAN kaldı.\n" +
      '> Kazanan, üç yorumu ayırmaya yetecek kadar ince bir ölçü değil.\n' +
      '>\n' +
      '> Kararın kendisi ayakta: `hasar` yorumu tasarım belgesine ve motora yazılı\n' +
      '> (`docs/il-savasi-tasarim.md` §3.5, `muharebe.js araziliHasar`). Bu bölüm artık o\n' +
      '> kararı YENİDEN ÖLÇMÜYOR, yalnızca üç yorumun bugünkü davranışını gösteriyor.\n\n';

  md += '## Satır satır\n\n';
  md += '`beklenen` = tasarımın kararı (kazanan) ve motorda ölçülmüş kalan oran.\n';
  md += 'Sütunlardaki sayılar sürekli modelin "kalan kuvveti" (birim cinsinden, kesirli).\n\n';
  md += '| Senaryo | Beklenen | `hasar` | `dayaniklilik` | `ikisi` |\n|---|---|---|---|---|\n';
  const yaz = (r) => r.kalanSaldiran.toFixed(2) + ' – ' + r.kalanSavunan.toFixed(2);
  TABLO.forEach(([ad, , , , kazanan, oran], i) => {
    md +=
      '| ' +
      ad +
      ' | **' +
      (kazanan === 'saldiran' ? 'saldıran' : 'savunan') +
      ' (' +
      oran.toFixed(2) +
      ')** | ' +
      YORUMLAR.map((y) => yaz(sonuc[y][i].r) + (sonuc[y][i].kazananTutuyor ? ' ✓' : ' ✗')).join(
        ' | '
      ) +
      ' |\n';
  });

  md += '\n## Sürekli modelin kendisi\n\n';
  md += 'Tablo "sürekli modelin ham çıktısıdır" diyordu ama model yazılı değildi; tablo\n';
  md += 'sayılarından geri çözüldü. Kuralları:\n\n';
  md += '1. Her tarafın bir CAN HAVUZU var (birimlerin dayanıklılık toplamı).\n';
  md += '2. Tur tur ve EŞZAMANLI: iki taraf da TUR BAŞINDAKİ durumuna göre hasar verir.\n';
  md += '3. Bir tarafın verdiği hasar, kalan can oranıyla ölçeklenir (yarısı ölmüş ordu\n';
  md += '   yarı hasar verir). Kayıp kompozisyona orantılı olduğu için zOrt sabit kalır.\n';
  md += '4. Bir taraf 0 cana inince biter. "Kalan kuvvet" = başlangıç birim sayısı ×\n';
  md += '   kalan can oranı — kesirli, çünkü model kesirli birim tanıyor.\n\n';
  md += '**Oyunun motoru bu değildir.** Motor tam sayı birimlerle, hasar havuzuyla ve\n';
  md += 'moral/bozgunla çalışır (§3.4, §3.8); burası yalnızca ölçüttür.\n\n';

  md += '## Etkinlik tablosu (§3.3 ile karşılaştırma)\n\n';
  md += '| Hedef | zOrt | Ağır net | Hafif net |\n|---|---|---|---|\n';
  for (const tur of DENGE.BIRIM_SIRASI) {
    const zz = DENGE.BIRIMLER[tur].zirh;
    const e = etkinlik(zz);
    md +=
      '| ' +
      DENGE.BIRIMLER[tur].ad +
      ' | ' +
      zz +
      ' | ' +
      e.agir.toFixed(2) +
      ' | ' +
      e.hafif.toFixed(2) +
      ' |\n';
  }

  const hedef = path.join(PROJ, 'veri', 'muharebe-referans.md');
  fs.writeFileSync(hedef, md, 'utf8');
  console.log('MUHAREBE REFERANS ÖLÇÜMÜ');
  for (const y of YORUMLAR)
    console.log(
      '  ' +
        y.padEnd(14) +
        say(y, 'kazananTutuyor') +
        '/' +
        TABLO.length +
        ' satırda kazananı tutturdu'
    );
  console.log(
    '\nSonuç: ' + (kazanan || 'BELİRSİZ — yorumlar eşit çıktı, model gözden geçirilmeli')
  );
  console.log('Yazıldı: veri/muharebe-referans.md');

  if (!kazanan) process.exit(1);
}
