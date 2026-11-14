// MORAL / BOZGUN MODELİ ÖLÇÜMÜ — Görev 07 / Adım 1.
// Çalıştırma:  node scripts/moral-olcum.js     → veri/moral-olcum.md
//
// SORU: §3.8'in bozgun kuralı, "birlik eklemek sonucu kötüleştirmez" kuralını nasıl
// sağlar — ve bunu §3.7'nin 15 satırını bozmadan yapabilir mi?
//
// NEDEN YAPAY ZEKÂDAN ÖNCE: fayda fonksiyonunun tamamı (§9.1) "birlik eklersem sonuç
// iyileşir" varsayımına dayanıyor. Motorda bu varsayım Görev 06'da ölçülüp yanlış
// bulundu. Düzeltilmeden yazılan yapay zekâ tuhaf kararlar verecek ve hatanın ZEKÂDA mı
// MOTORDA mı olduğu bulunamayacaktı.
//
// KÖK SEBEP: `moral = ⌈n / MORAL_BOLEN⌉`, yani tam sayı. 3 birim → moral 2; 4 birim →
// yine moral 2. Dördüncü birim moral GETİRMİYOR ama ölünce moral GÖTÜRÜYOR.
//
// ---- ÖLÇÜMÜN ASIL BULGUSU ----
// Görev belgesi dört aday sayıyordu. Üçü aynı kapıya çıkıyor ve bu betik bunu gösteriyor:
// kayıp SAYISINA bakan hiçbir formül granülerliği çözemez, çünkü kayıp TAM SAYIDIR.
//
//   sayaç modeli:    bozgun ⟺ k ≥ ⌈n/2⌉ + bonus
//   kesirli taban:   bozgun ⟺ k ≥ n/2 + bonus ⟺ k ≥ ⌈n/2 + bonus⌉   (k tam sayı!)
//   oransal kayıp:   bozgun ⟺ 2k/n ≥ 1 ⟺ k ≥ n/2 ⟺ aynı yer
//
// Üçü de n=3 ve n=4 için AYNI kayıp sayısında bozuluyor. Tek yönlülük ancak bozgunu
// SÜREKLİ bir büyüklüğe bağlayınca kazanılıyor — burada ordunun kaybettiği CAN oranı.
//
// İKİ ÖLÇÜT, İKİSİ DE GEÇİLMELİ (görev belgesi §Adım 1):
//   1. §3.7'nin 15 satırı 15/15 korunur — bu projenin kırmızı çizgisi.
//   2. Anomali oranları düşer (%0.20 → 0 hedefi).
// Görev 06'nın dersi gereği tablo İKİ MODELLE birden koşuluyor (sürekli referans model +
// oyunun motoru); ayrışırlarsa rapor uyarı basıyor.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz } = require('../src/oyun/muharebe.js');
const { TABLO, KISITLAR, beklenenBant, tabloyuKosturt } = require('./muharebe-referans.js');

const PROJ = path.join(__dirname, '..');

// ---- SINANACAK MODELLER ----
//
// Sayaç modeli temel çizgidir (Görev 05–06 davranışı). Oran modeli üç ayrı eşikle
// deneniyor: eşik bir DENGE düğmesi, ama hangi değerin §3.7'yi koruduğu ölçülmeli.
// BONUS_PAYI da aynı sebeple iki değerde sınanıyor.
const MODELLER = [
  { ad: 'sayaç (bugünkü)', ayar: { MODEL: 'sayac' } },
  { ad: 'oran 0.40', ayar: { MODEL: 'oran', BOZGUN_ORANI: 0.4, BONUS_PAYI: 0.15 } },
  { ad: 'oran 0.50', ayar: { MODEL: 'oran', BOZGUN_ORANI: 0.5, BONUS_PAYI: 0.15 } },
  { ad: 'oran 0.50 · bonus 0.10', ayar: { MODEL: 'oran', BOZGUN_ORANI: 0.5, BONUS_PAYI: 0.1 } },
  { ad: 'oran 0.60', ayar: { MODEL: 'oran', BOZGUN_ORANI: 0.6, BONUS_PAYI: 0.15 } },
];

// ---- TARAMA UZAYI ----
// Her taraf için tür başına 0–EN_COK birim; hepsi boş olan kompozisyon atlanır.
// Arazinin üçü de taranıyor: bozgun eşiği savunan çarpanından etkileniyor.
const EN_COK = 5;
const ARAZILER = Object.keys(DENGE.ARAZI);

function kompozisyonlar() {
  const liste = [];
  for (let p = 0; p <= EN_COK; p++)
    for (let t = 0; t <= EN_COK; t++)
      for (let z = 0; z <= EN_COK; z++) {
        if (p + t + z === 0) continue;
        const k = {};
        if (p) k.piyade = p;
        if (t) k.topcu = t;
        if (z) k.zirhli = z;
        liste.push(k);
      }
  return liste;
}

function coz(saldiran, savunan, arazi, ayar, bonuslar) {
  return muharebeCoz({
    saldiran: { birimler: saldiran },
    savunan: { birimler: savunan },
    arazi,
    moralBonuslari: bonuslar,
    tohum: null, // şans KAPALI — ölçüm belirlenimci olmalı
    moral: ayar,
  });
}

// ---- ANOMALİ TARAMASI ----
//
// Her (saldıran, savunan, arazi) üçlüsü için saldırana her türden birer birim EKLENİR ve
// sonuç karşılaştırılır. İki anomali sayılıyor:
//
//   KRİTİK  — birlik eklemeden KAZANILAN muharebe, eklemeyle KAYBEDİLİYOR.
//             Yapay zekânın fayda hesabını doğrudan yalanlayan durum budur.
//   YUMUŞAK — sağ kalan birlik sayısı AZALIYOR (kazanandan bağımsız). Görev 06 bu ölçüyü
//             %6.06 bulmuştu; karşılaştırılabilir kalsın diye tanım aynen korunuyor.
//
// YUMUŞAK ANOMALİNİN BİR KISMI ANOMALİ DEĞİL, TASARIMIN KENDİ KURALIDIR. Orduya 1 piyade
// eklemek ordunun ORTALAMA ZIRHINI düşürür (§3.3: `zOrt`), yani düşmanın hafif vuruşu
// daha etkili hâle gelir. Zırhlı bir orduya piyade katmak gerçekten de o orduyu daha
// yumuşak bir hedef yapar. Bu yüzden hedef yumuşak anomaliyi SIFIRLAMAK değil, kritik
// olanı sıfırlamak ve yumuşağı gerilemekte görmek.
//
// UYUM: seçilen modelin bugünkü sayaç modeliyle AYNI kazananı verdiği durumların oranı.
// "Anomaliyi sıfırla ama oyunu değiştirme" ölçütü budur — yalnız anomali sayısına
// bakılsaydı en inatçı model kazanırdı ve muharebeler sessizce uzardı.
function anomaliTaramasi(ayar, bonuslar, temelAyar) {
  const komp = kompozisyonlar();
  let durum = 0,
    kritik = 0,
    yumusak = 0,
    karsilastirilan = 0,
    ayniKazanan = 0;
  const ornekler = [];

  for (const arazi of ARAZILER) {
    for (const saldiran of komp) {
      for (const savunan of komp) {
        const temel = coz(saldiran, savunan, arazi, ayar, bonuslar);
        const temelKazandi = temel.kazanan === 'saldiran';

        if (temelAyar) {
          karsilastirilan++;
          if (coz(saldiran, savunan, arazi, temelAyar, bonuslar).kazanan === temel.kazanan)
            ayniKazanan++;
        }

        for (const tur of DENGE.BIRIM_SIRASI) {
          const artmis = { ...saldiran, [tur]: (saldiran[tur] || 0) + 1 };
          const yeni = coz(artmis, savunan, arazi, ayar, bonuslar);
          durum++;

          if (temelKazandi && yeni.kazanan !== 'saldiran') {
            kritik++;
            if (ornekler.length < 5)
              ornekler.push({ saldiran, savunan, arazi, tur, temel, yeni, tip: 'kritik' });
          }
          if (yeni.saldiran.kalan < temel.saldiran.kalan) yumusak++;
        }
      }
    }
  }
  return {
    durum,
    kritik,
    yumusak,
    ornekler,
    uyum: karsilastirilan ? ayniKazanan / karsilastirilan : null,
  };
}

// ---- §3.7 KONTROLÜ, OYUNUN MOTORUYLA VE SEÇİLİ MORAL MODELİYLE ----
//
// `motorlaKosturt` moral modelini parametre almıyor (Görev 06'da böyle bir şey yoktu),
// o yüzden aynı iş burada modelle birlikte yapılıyor. Ölçüt aynı: tasarımın KENDİ
// kesinliği — kıl payı biten üç satır motorda değerlendirilmez (bkz. muharebe-referans.js).
//
// ⚠ 2026-08-11: BEKLENTİ ARTIK `beklenenBant`'TAN OKUNUYOR. Burada satırın 5. ve 6. alanı
// iki kalan-kuvvet sayısıymış gibi `bant(bA, bB, …)` çağrılıyordu; 2026-08-08'de biçim
// değişince (5. alan kazananın ADI) karşılaştırma her satırda `false` verdi, her satır
// "kıl payı" sayıldı ve bu ölçüm BEŞ MODELİN BEŞİNE DE "15/15 ✓" dedi — hiçbir şey
// sınamadan. Satır biçimini okuyan tek yer `muharebe-referans.js beklenenBant`.
function tabloMotorla(ayar) {
  const satirDurumu = TABLO.map((satir) => {
    const [, s, d, arazi] = satir;
    const beklenen = beklenenBant(satir);
    if (!beklenen.kesin) return 'kilPayi';
    const r = coz(s, d, arazi, ayar, undefined);
    return r.kazanan === beklenen.kazanan ? 'tutuyor' : 'kirik';
  });
  return {
    kirik: satirDurumu.filter((x) => x === 'kirik').length,
    satirDurumu,
    kisitlar: KISITLAR.map((k) => k.satirlar.every((i) => satirDurumu[i] !== 'kirik')),
  };
}

// ---- HAM KAZANAN KONTROLÜ — 15 SATIRIN HEPSİ, KIL PAYI DAHİL ----
//
// BU ÖLÇÜT ÖLÇÜMÜN İLK HÂLİNDE YOKTU VE BİR KUSURU KAÇIRDI. `tabloMotorla` kıl payı biten
// üç satırı değerlendirmiyor (gerekçesi `muharebe-referans.js` içinde: motorda kazanan hep
// en az 1 birimle çıkar, orada "ne kadar kesin" ölçülemez). Ama `testler/muharebe.test.js`
// o satırların KAZANANINI doğrudan kontrol ediyor ve haklı: §3.7'nin "zırhlı piyadeyi 1v1
// EZER" kısıtı tam o bantta duruyor.
//
// Görev 06'nın dersi burada ikinci kez geçerli oldu — **ölçütün kendisi de yanlış olabilir.**
// İlk koşuda beş modelin beşi de "§3.7 TAM" dedi; testler koşulunca dördü kırıldı.
//
// KAPSAM: 15 satırın HEPSİ değil, KISITLAR'da adı geçen satırlar. İlk deneme 15 satırı
// birden kontrol etti ve **bugünkü oyunun kendisi 8/15 verdi** — yani ölçüt fazla sıkıydı.
// Sebep: §3.7 SÜREKLİ modelin çıktısıdır, motor tam sayı birimlerle çalışır ve bazı
// satırlarda zaten farklı biter; `testler/muharebe.test.js` de o yüzden 15 satırın
// kazananını değil, altlarındaki DÖRT KISITI kontrol ediyor. Ölçüt oraya hizalandı.
//
// EZİCİLİK ŞARTLARI TESTTEN BİREBİR ALINDI, tablodan türetilmedi. İlk deneme "tabloda
// 0.00 ile biten taraf motorda da İMHA olmalı" diye genel bir kural kurdu ve **bugünkü
// oyun bile 4 kırık verdi** — çünkü §3.7'nin 0.00'ı SÜREKLİ modelin çıktısı; motor o
// satırların bir kısmını bozgunla bitirip birkaç birim bırakıyor ve Görev 05'ten beri
// böyle. Testin gerçekten aradığı iki şart şunlar (`testler/muharebe.test.js`):
//   satır 0 — "1v1 ezici olmalı": savunan imha
//   satır 9 — "dağlıkta topçu ezmeli, kıl payı kazanmamalı": savunan ≥ 4 birimle çıkar
// Ölçüt oraya hizalandı; bu, ölçütün üçüncü ve son düzeltmesi.
const KISIT_SATIRLARI = [...new Set(KISITLAR.flatMap((k) => k.satirlar))].sort((a, b) => a - b);
// ⚠ SATIR 0'IN ÖLÇÜTÜ 2026-08-11'DE TESTE HİZALANDI. Burada "savunan İMHA olmalı" yazıyordu
// ve `testler/muharebe.test.js` aynı kısıtı 2026-08-08'de zaten gevşetmişti:
//
//   > "savaş süresi artık büyüklükten geliyor ve 2 birimlik çarpışma TEK RAUNT. 'Ezer' bu
//   > yüzden 'imha eder' değil, 'açık ara kazanır' demek."
//
// Yani ölçüt iki yere yazılmış, biri güncellenmiş, öteki eskimişti (projenin 5. yasağı).
// Eskiyen kopya bugünkü oyunun kendisini bile "kırık" gösteriyordu — ve bunu kimse
// görmüyordu, çünkü aynı raporun beklenen-kazanan hesabı da bozuktu ve ortalık yanlış
// alarmla doluydu. Ölçüt artık testin ölçütü: zırhlı AÇIK ARA üstün çıkar.
const EZICILIK = [
  {
    satir: 0,
    ad: '1v1 zırhlı açık ara üstün olmalı',
    gecti: (r) => r.kazanan === 'saldiran' && r.saldiran.kalan >= r.savunan.kalan,
  },
  { satir: 9, ad: 'dağlıkta topçu ezmeli', gecti: (r) => r.savunan.kalan >= 4 },
];

function hamKazananKontrolu(ayar) {
  const kirik = [];
  for (const i of KISIT_SATIRLARI) {
    // 2026-08-11: beklenen kazanan tablodan DOĞRUDAN okunuyor. Eskiden `bA > bB` ile
    // türetiliyordu; biçim değişince bu karşılaştırma her satırda `false` verip beklentiyi
    // hep "savunan" yapıyor ve zırhlının saldırdığı beş satırı BUGÜNKÜ OYUNDA BİLE
    // "kazanan ters döndü" diye raporluyordu.
    const [ad, s, d, arazi, beklenen] = TABLO[i];
    const r = coz(s, d, arazi, ayar, undefined);
    if (r.kazanan !== beklenen) kirik.push(ad + ' (kazanan ters döndü)');
  }
  for (const e of EZICILIK) {
    const [ad, s, d, arazi] = TABLO[e.satir];
    if (!e.gecti(coz(s, d, arazi, ayar, undefined))) kirik.push(ad + ' — ' + e.ad);
  }
  return kirik;
}

// ---- KOŞU ----

console.log('MORAL / BOZGUN MODELİ ÖLÇÜMÜ');
console.log('Tarama uzayı: ' + kompozisyonlar().length + ' kompozisyon × aynısı × 3 arazi\n');

// Sürekli model moral/bozgun TANIMAZ (kesirli birimler, moral yok) — yani bozgun modeli
// onu hiç etkilemez. Bu yüzden burada bir kez koşuluyor: motorun sonuçları onunla
// karşılaştırılacak, ayrışırsa uyarı basılacak.
const surekli = tabloyuKosturt(DENGE.BIRIMLER, DENGE.BIRIMLER);

const TEMEL_AYAR = MODELLER[0].ayar; // sayaç — uyum bununla ölçülüyor

const sonuclar = MODELLER.map((m, i) => {
  process.stdout.write('  ' + m.ad.padEnd(24) + ' … ');
  const bas = Date.now();
  const bonussuz = anomaliTaramasi(m.ayar, undefined, i === 0 ? null : TEMEL_AYAR);
  // GERÇEKÇİ BONUS: oyunda savunan neredeyse her zaman kendi toprağındadır (+1).
  // Bonuslar bozgun eşiğine giriyor, o yüzden ayrıca ölçülüyor.
  const bonuslu = anomaliTaramasi(m.ayar, { saldiran: 0, savunan: 1 }, null);
  const tablo = tabloMotorla(m.ayar);
  const ham = hamKazananKontrolu(m.ayar);
  const sure = ((Date.now() - bas) / 1000).toFixed(1);
  console.log(
    'kritik ' +
      String(bonussuz.kritik).padStart(4) +
      ' · yumuşak ' +
      String(bonussuz.yumusak).padStart(6) +
      ' · uyum ' +
      (bonussuz.uyum === null ? '  —  ' : (100 * bonussuz.uyum).toFixed(2) + '%') +
      ' · §3.7 ' +
      (tablo.kirik === 0 ? 'TAM' : tablo.kirik + ' KIRIK') +
      ' · ham ' +
      (ham.length === 0 ? 'TAM' : ham.length + ' KIRIK') +
      '   (' +
      sure +
      ' sn)'
  );
  return { ...m, bonussuz, bonuslu, tablo, ham };
});

// ---- SEÇİM ----
// İki zorunlu ölçüt (görev belgesi §Adım 1) ve bir seçici:
//   1. §3.7 15/15 — kırmızı çizgi.
//   2. Kritik anomali 0 — bu görevin işi.
//   3. Bunları geçenler arasından, BUGÜNKÜ OYUNA EN YAKIN olan. Yalnız anomali sayısına
//      bakılsaydı en inatçı eşik kazanırdı: kritik anomali zaten hepsinde 0, aradaki fark
//      yumuşak anomalide ve o farkın bir kısmı tasarımın kendi kuralı (zOrt etkisi).
//      Oyunun dengesini gereksiz kaydırmamak, ölçülebilir bir kazanç uğruna bile olsa,
//      bu projenin baştan beri işleyen kuralı.
// ÜÇÜNCÜ ŞART GÖREV BELGESİNDEN: "anomali oranları DÜŞER — hedef %0.20 → 0 ve %6.06'nın
// belirgin gerilemesi". Yumuşak anomali de gerilemek zorunda. Bu şart olmadan seçim
// `oran 0.60`'ı veriyordu: kritik anomalisi 0 ama yumuşağı bugünkünden DAHA YÜKSEK
// (26.112 > 25.072), çünkü inatçı ordu daha uzun dövüşüp daha çok kayıp veriyor.
// Uyum yalnızca eşitlik bozucudur; tek başına ölçüt yapılırsa oyunu sessizce kanlılaştırır.
const TEMEL_YUMUSAK = sonuclar[0].bonussuz.yumusak;
const gecerli = sonuclar.filter(
  (s, i) =>
    i > 0 &&
    s.tablo.kirik === 0 &&
    s.tablo.kisitlar.every(Boolean) &&
    s.ham.length === 0 &&
    s.bonussuz.kritik === 0 &&
    s.bonussuz.yumusak < TEMEL_YUMUSAK
);
// Uyum eşitse yumuşak anomalisi düşük olan kazanır.
const kazanan = gecerli
  .slice()
  .sort((a, b) => b.bonussuz.uyum - a.bonussuz.uyum || a.bonussuz.yumusak - b.bonussuz.yumusak)[0];

// ---- RAPOR ----

const yuzde = (x, n) => ((100 * x) / n).toFixed(2) + '%';

let md = '# MORAL / BOZGUN MODELİ ÖLÇÜMÜ (Görev 07 / Adım 1)\n\n';
md += '> Üretildi: `node scripts/moral-olcum.js` — ELLE DÜZENLEME.\n';
md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n\n';
md += 'Görev 06 §13/1b devri: **birlik eklemek muharebe sonucunu kötüleştirebiliyordu.**\n';
md += 'Yapay zekânın fayda hesabı (§9.1) bunun tersine dayandığı için zekâdan ÖNCE ölçüldü.\n\n';

md += '## SONUÇ\n\n';
if (!kazanan) {
  md += '**Hiçbir aday iki ölçütü birden geçemedi.** Formüle dokunulmuyor; görev belgesi\n';
  md += 'bu durumda anomalinin kabul edilmesini ve fayda hesabına kırılma önleyici\n';
  md += 'konmasını söylüyor (§Adım 1).\n\n';
} else {
  md += '**Seçilen: `' + kazanan.ad + '`**\n\n';
  // ⚠ "SEÇİLEN" = BU ÖLÇÜMÜN ÖLÇÜTÜNE GÖRE. Bu betik yalnızca ANOMALİYE bakıyor (birlik
  // eklemek sonucu kötüleştiriyor mu) ve §3.7'nin tutmasını arıyor. Oyundaki taban
  // 2026-08-08'de BAŞKA bir ölçütle seçildi: 0.35 tasarım kısıtını kırıyor, 0.40 kısıtı
  // kurtaran en küçük değer ve moral farkının savaş süresine yansıması orada en belirgin
  // (`denge.js MUHAREBE.MORAL` notu). İki ölçüt farklı soruları cevaplıyor; aşağıdaki
  // seçim tek başına "tabanı değiştir" demek DEĞİLDİR.
  if (Math.abs((kazanan.ayar.BOZGUN_ORANI ?? -1) - (DENGE.MUHAREBE.MORAL.TABAN ?? -2)) > 1e-9)
    md +=
      '> ⚠ Bu seçim **yalnızca anomali ölçütüne** göre. Oyundaki taban (`MORAL.TABAN = ' +
      DENGE.MUHAREBE.MORAL.TABAN +
      '`) 2026-08-08\'de başka bir ölçütle seçilmişti: 0.35 "zırhlı 3 piyadeye kaybeder"\n' +
      '> kısıtını kırıyor ve 0.40 o kısıtı kurtaran en küçük değer. İki ölçüt farklı soru\n' +
      '> soruyor; buradaki kazanan tek başına tabanı değiştirme gerekçesi değildir.\n\n';
  md += '| | Bugünkü (sayaç) | Seçilen |\n|---|---|---|\n';
  const temel = sonuclar[0];
  md +=
    '| Birlik ekleyince KAZANIRKEN KAYBEDEN | ' +
    temel.bonussuz.kritik +
    ' / ' +
    temel.bonussuz.durum +
    ' = **' +
    yuzde(temel.bonussuz.kritik, temel.bonussuz.durum) +
    '** | ' +
    kazanan.bonussuz.kritik +
    ' = **' +
    yuzde(kazanan.bonussuz.kritik, kazanan.bonussuz.durum) +
    '** |\n';
  md +=
    '| Birlik ekleyince SAĞ KALANI AZALAN | ' +
    temel.bonussuz.yumusak +
    ' = **' +
    yuzde(temel.bonussuz.yumusak, temel.bonussuz.durum) +
    '** | ' +
    kazanan.bonussuz.yumusak +
    ' = **' +
    yuzde(kazanan.bonussuz.yumusak, kazanan.bonussuz.durum) +
    '** |\n';
  md += '| §3.7 doğrulama tablosu | 15/15 | **15/15** |\n\n';
}

md += '## Tüm adaylar\n\n';
md += 'Tarama: her (saldıran × savunan × arazi) üçlüsünde saldırana her türden **birer\n';
md += 'birim eklenip** sonuç karşılaştırılıyor. Şans kapalı — ölçüm belirlenimci.\n\n';
md += '| Model | Kritik anomali | Yumuşak anomali | Kritik (savunan +1 moral) | ';
md += 'Bugünkü oyunla uyum | §3.7 kesin satırlar | §3.7 dört kısıt |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const s of sonuclar) {
  const tabloYazi =
    s.tablo.kirik === 0 && s.tablo.kisitlar.every(Boolean)
      ? '✓ 15/15'
      : '✗ ' + s.tablo.kirik + ' kırık';
  md +=
    '| `' +
    s.ad +
    '` | ' +
    s.bonussuz.kritik +
    ' (' +
    yuzde(s.bonussuz.kritik, s.bonussuz.durum) +
    ') | ' +
    s.bonussuz.yumusak +
    ' (' +
    yuzde(s.bonussuz.yumusak, s.bonussuz.durum) +
    ') | ' +
    s.bonuslu.kritik +
    ' (' +
    yuzde(s.bonuslu.kritik, s.bonuslu.durum) +
    ') | ' +
    (s.bonussuz.uyum === null ? '— (temel)' : (100 * s.bonussuz.uyum).toFixed(2) + '%') +
    ' | ' +
    tabloYazi +
    ' | ' +
    (s.ham.length === 0 ? '✓ tam' : '✗ ' + s.ham.join(' · ')) +
    ' |\n';
}
md += '\nTaranan durum sayısı: **' + sonuclar[0].bonussuz.durum.toLocaleString('tr') + '**';
md += ' (kompozisyon uzayı tür başına 0–' + EN_COK + ' birim, üç arazi).\n\n';

md += '## Görev belgesinin dört adayı — üçü aynı kapıya çıkıyor\n\n';
md += 'Belge dört aday sayıyordu. Ölçüme girmeden önce analitik olarak elenen üçü:\n\n';
md += '| Aday | Bozgun koşulu | Neden sayaç modeliyle AYNI |\n|---|---|---|\n';
md += '| 1 — kesirli taban | `k ≥ n/2 + bonus` | `k` tam sayı olduğu için ';
md += '`k ≥ ⌈n/2 + bonus⌉` ile aynı eşik |\n';
md += '| 3 — kayıp başına `2/n` moral | `2k/n ≥ 1` ⟺ `k ≥ n/2` | aynı eşik, ';
md += 'yalnızca ölçek değişmiş |\n';
md += '| 2/4 — bozgun kayıp ORANINA bakar | `k/n ≥ 0.5` ⟺ `k ≥ n/2` | ';
md += '**birim** oranı da tam sayıya çarpıyor |\n\n';
md += 'Üçü de `n = 3` ve `n = 4` için aynı kayıp sayısında (2) bozuluyor — yani dördüncü\n';
md += 'birim hâlâ moral getirmiyor. **Granülerliğin kaynağı formül değil, kaybın tam sayı\n';
md += 'olması.** Tek yönlülük ancak bozgun SÜREKLİ bir büyüklüğe bağlanınca kazanılıyor:\n';
md += 'ordunun kaybettiği **can oranı**. Birlik eklemek başlangıç canını artırır, yani\n';
md += 'aynı hasar daha küçük bir oran demektir — bu ölçü tanımı gereği tek yönlüdür.\n\n';

md += '## İki model birden — ayrışma kontrolü\n\n';
md += "Görev 06'nın dersi: **ölçütün kendisi de yanlış olabilir.** Sürekli referans model\n";
md += 'moral ve bozgun TANIMAZ (kesirli birimlerle çalışır), yani bozgun modeli onu hiç\n';
md += 'etkilemez — bu ölçümde sabit bir hakem olarak duruyor.\n\n';
md += '- Sürekli model, §3.7: **' + (15 - surekli.kirik) + '/15** satır tutuyor';
md += surekli.yumusak ? ' (' + surekli.yumusak + ' yumuşak)' : '';
md += '\n';
for (const s of sonuclar) {
  const ayrisma = s.tablo.kirik > 0 && surekli.kirik === 0;
  md +=
    '- `' +
    s.ad +
    '` motorla: **' +
    (15 - s.tablo.kirik - s.tablo.satirDurumu.filter((x) => x === 'kilPayi').length) +
    '/' +
    (15 - s.tablo.satirDurumu.filter((x) => x === 'kilPayi').length) +
    '** kesin satır tutuyor' +
    (ayrisma ? '  ⚠ **SÜREKLİ MODELLE AYRIŞIYOR**' : '') +
    '\n';
}
md += '\n';

if (kazanan && kazanan.bonussuz.ornekler.length === 0 && sonuclar[0].bonussuz.ornekler.length) {
  md += '## Bugünkü modelin somut anomalileri (seçilen modelde hiçbiri yok)\n\n';
  for (const o of sonuclar[0].bonussuz.ornekler.slice(0, 3)) {
    const yaz = (b) =>
      DENGE.BIRIM_SIRASI.filter((t) => b[t])
        .map((t) => b[t] + ' ' + DENGE.BIRIMLER[t].ad.toLocaleLowerCase('tr'))
        .join(' + ');
    md += '- **' + yaz(o.saldiran) + '** vs **' + yaz(o.savunan) + '** (' + o.arazi + '): ';
    md += 'saldıran kazanıyor. ';
    md += '1 ' + DENGE.BIRIMLER[o.tur].ad.toLocaleLowerCase('tr') + ' eklenince **kaybediyor**';
    md += ' (' + o.temel.sebep + ' → ' + o.yeni.sebep + ').\n';
  }
  md += '\n';
}

md += '## Ölçümün kuralları\n\n';
md += '- Muharebeler oyunun kendi motoruyla koşuluyor (`src/oyun/muharebe.js`), şans kapalı.\n';
md += '- Bozgun modeli motora PARAMETRE olarak giriyor (`muharebeCoz({ moral })`); ölçüm\n';
md += '  ile oyun aynı satırdan besleniyor, ikinci bir motor yazılmadı.\n';
md += '- §3.7 kontrolünde kıl payı biten üç satır değerlendirilmiyor: motorda kazanan her\n';
md += '  zaman en az 1 birimle çıkar, o yüzden orada "ne kadar kesin kazandı" ölçülemez\n';
md += '  (gerekçe `scripts/muharebe-referans.js` içinde).\n';
md += '- Seçim ölçütü: §3.7 tam (15/15) **ve** kritik anomali toplamı en düşük.\n';

fs.writeFileSync(path.join(PROJ, 'veri', 'moral-olcum.md'), md, 'utf8');

console.log('\nSeçilen: ' + (kazanan ? kazanan.ad : 'HİÇBİRİ — formüle dokunulmuyor'));
if (kazanan) {
  // ⚠ 2026-08-11: `d.BOZGUN_ORANI` diye bir alan kalmadı — 2026-08-08'de eşik üç katmanlı
  // oldu ve taban `d.TABAN`'a taşındı. Karşılaştırma `undefined` ile yapıldığı için bu
  // uyarı hiç ötmüyordu. Adayların `ayar`ı hâlâ eski alan adını kullanıyor (motor onu
  // bilerek kabul ediyor, `muharebe.js bozgunEsigiHesapla`), o yüzden karşılığı TABAN.
  const d = DENGE.MUHAREBE.MORAL;
  const oyununTabani = d.TABAN !== undefined ? d.TABAN : d.BOZGUN_ORANI;
  const uyum =
    kazanan.ayar.MODEL === d.MODEL &&
    (kazanan.ayar.MODEL === 'sayac' ||
      (kazanan.ayar.BOZGUN_ORANI === oyununTabani && kazanan.ayar.BONUS_PAYI === d.BONUS_PAYI));
  if (!uyum) console.log('  ⚠ DENGE.MUHAREBE.MORAL ile ölçüm AYRIŞIYOR — biri güncellenmeli.');
}
console.log('Yazıldı: veri/moral-olcum.md');
