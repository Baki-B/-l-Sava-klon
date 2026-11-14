// ARAŞTIRMA TESTLERİ (Görev 06 / Adım 3).
//
// Asıl sorular: araştırma 0'da motor gerçekten HİÇ değişmiyor mu, eğitim puanı var olan
// parça bölüşümünden mi geliyor, seviye TÜM birimlerin statını mı kaydırıyor, tavan
// aşılabiliyor mu, sabitler koda gömülü mü, sonuç hâlâ belirlenimci mi?
//
// EN ÖNEMLİ BAŞLIK "GERİ GİDİŞ KİLİDİ": bu görevin muharebeye tek dokunuşu motorun
// imzasıydı. Araştırma yokken tablonun BİREBİR eskisi dönmezse §3.7'nin 15 satırı ve
// Görev 05'in 40 muharebe testi sessizce kayardı.

const { test, dogru, esit, yakin, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { muharebeCoz } = require('../src/oyun/muharebe.js');
const { parcaEgitimi, parcaDegerleri, aktorGeliri } = require('../src/oyun/uretim.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { siparisGecerliMi } = require('../src/oyun/ordu.js');
const { kullanilabilirButce, arastirmayaAyrilabilir } = require('../src/oyun/butce.js');
const { PARCALAR, ILLER } = require('../src/oyun/veri.js');
const {
  birimStatlari,
  dalSeviyesi,
  arastirmaVarMi,
  aktorArastirmasi,
  aktorStatlari,
  egitimPuani,
  arastirmaVerimi,
  turPuani,
  seviyeMaliyeti,
  dalDurumu,
  seviyeAtla,
  ayrilaniAyarla,
  seviyeYukselt,
  seviyeGeriAl,
  dalEtkisi,
  tumDallar,
  ozelEtkiler,
  seferberlikBedava,
  dalTavani,
  ozelAcikMi,
} = require('../src/oyun/arastirma.js');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const A = DENGE.ARASTIRMA;
const BEN = '16';

function sahne() {
  // BEN herkesle savaşta: bu dosya araştırmayı ölçüyor, savaş hali ön koşul (Görev 11).
  return hepsiyleSavas({ ...oyunKur({ senaryo: 'turkiye', tohum: 20260730 }), ordular: {} }, '16');
}

function paraVer(d, aktorId, nufus, ekonomi) {
  return {
    ...d,
    aktorler: {
      ...d.aktorler,
      [aktorId]: { ...d.aktorler[aktorId], nufusHavuzu: nufus, ekonomiHavuzu: ekonomi },
    },
  };
}

// ---- GERİ GİDİŞ KİLİDİ ----

test("KİLİT: araştırma yokken stat tablosu DENGE.BIRIMLER'in KENDİSİ", () => {
  esit(birimStatlari(null), DENGE.BIRIMLER, 'kayıt yok');
  esit(birimStatlari({}), DENGE.BIRIMLER, 'boş kayıt');
  esit(birimStatlari({ zirh: 0, agir: 0, hafif: 0 }), DENGE.BIRIMLER, 'hepsi sıfır');
  esit(birimStatlari({ puan: 12.5 }), DENGE.BIRIMLER, 'puanı var, seviyesi yok');
});

test('KİLİT: motora tablo verilmesi ile verilmemesi AYNI sonucu üretiyor', () => {
  const girdi = {
    saldiran: { birimler: { piyade: 3, topcu: 1, zirhli: 1 } },
    savunan: { birimler: { topcu: 5 } },
    arazi: 'ova',
    tohum: 4242,
  };
  const eski = muharebeCoz(girdi);
  const yeni = muharebeCoz({
    ...girdi,
    statlar: { saldiran: birimStatlari(null), savunan: birimStatlari({}) },
  });
  esit(JSON.stringify(yeni), JSON.stringify(eski), 'motorun çıktısı birebir aynı olmalı');
});

// ---- STAT KAYDIRMA ----

test('KAYDIRMA: seviye YALNIZCA kendi biriminin statını kaydırıyor', () => {
  // Görev 06'da tek "Zırh" dalı ÜÇ birimin zırhını birden kaydırıyordu ve tavanı zırhlı
  // tek başına Sv.2'de tutuyordu. Görev 07'de ağaç birime ayrıldı; bu test o ayrımı kilitler.
  const t = birimStatlari({ 'piyade.zirh': 2 });
  esit(t.piyade.zirh, Math.round(DENGE.BIRIMLER.piyade.zirh * (1 + A.ARTIS * 2)), 'piyade kaydı');
  esit(t.topcu.zirh, DENGE.BIRIMLER.topcu.zirh, 'topçunun zırhı DEĞİŞMEMELİ');
  esit(t.zirhli.zirh, DENGE.BIRIMLER.zirhli.zirh, 'zırhlının zırhı DEĞİŞMEMELİ');
});

test('KAYDIRMA: yalnızca o dalın statı değişiyor, ötekiler duruyor', () => {
  const t = birimStatlari({ 'piyade.zirh': 3 });
  for (const tur of DENGE.BIRIM_SIRASI) {
    esit(t[tur].agirVurus, DENGE.BIRIMLER[tur].agirVurus, tur + ' ağır vuruş');
    esit(t[tur].hafifVurus, DENGE.BIRIMLER[tur].hafifVurus, tur + ' hafif vuruş');
    esit(t[tur].dayaniklilik, DENGE.BIRIMLER[tur].dayaniklilik, tur + ' dayanıklılık');
  }
});

test('KAYDIRMA: farklı ağaçlardan dallar birden uygulanabiliyor', () => {
  // Sonuç YUVARLANIYOR (statlar iki basamaklı, 2026-08-08); beklenen değer de öyle.
  const yuv = (tur, stat, sv) => Math.round(DENGE.BIRIMLER[tur][stat] * (1 + A.ARTIS * sv));
  const t = birimStatlari({ 'piyade.zirh': 1, 'piyade.agir': 2, 'topcu.hafif': 3 });
  esit(t.piyade.zirh, yuv('piyade', 'zirh', 1));
  esit(t.piyade.agirVurus, yuv('piyade', 'agirVurus', 2));
  esit(t.topcu.hafifVurus, yuv('topcu', 'hafifVurus', 3));
  esit(t.topcu.zirh, DENGE.BIRIMLER.topcu.zirh, 'topçunun zırhı piyadeninkinden bağımsız');
});

test('KAYDIRMA: temel tabloyu KİRLETMİYOR (kopya üstünde çalışıyor)', () => {
  const once = DENGE.BIRIMLER.piyade.zirh;
  birimStatlari({ 'piyade.zirh': 3 });
  birimStatlari({ 'piyade.agir': 3 });
  esit(DENGE.BIRIMLER.piyade.zirh, once, 'DENGE.BIRIMLER değişmemeli');
});

test("KAYDIRMA: artış oranı DENGE'den okunuyor (değiştir → sonuç değişsin)", () => {
  const eski = A.ARTIS;
  try {
    A.ARTIS = 0.5;
    yakin(birimStatlari({ 'piyade.zirh': 2 }).piyade.zirh, DENGE.BIRIMLER.piyade.zirh * 2, 1e-9);
  } finally {
    A.ARTIS = eski;
  }
});

// ---- ARAŞTIRMA TEK YÖNLÜ MÜ (2026-08-11, Baki: "statlar geliştirildikçe kalitesinin
// azalma durumu gibi şeyler olmasın") ----
//
// ⚠ BU TEST 2026-08-11 ÖNCESİNDE GEÇMEZDİ ve geçmemesi bir kaza değildi: ağır vuruşun
// etkinliği hedefin zırhıyla BİRLİKTE BÜYÜYORDU, yani zırh dalını yükseltmek gelen ağır
// ateşi güçlendiriyordu. En net kırılma noktası aşağıdaki topçu düellosu.
//
// Tarama `scripts/delicilik-olcum.js`'ten `require` ediliyor — 6144 muharebelik listeyi
// iki yere yazmak, birinin sessizce eskimesi demekti (projenin 5. yasağı).

test('TEK YÖNLÜLÜK: zırh dalı gelen ağır vuruşu ARTIRMIYOR (eski hatanın kilidi)', () => {
  // Somut olay: 3 topçu vs 3 topçu (ova). Savunan topçu zırhını Sv.1'e çıkarınca eski
  // modelde KAZANDIĞI savaşı kaybediyordu — 60 puan ödeyip zayıflamak.
  const kur = (sv) =>
    muharebeCoz({
      saldiran: { birimler: { topcu: 3 } },
      savunan: { birimler: { topcu: 3 } },
      arazi: 'ova',
      tohum: null,
      statlar: { savunan: birimStatlari(sv === 0 ? null : { 'topcu.zirh': sv }) },
    });
  const temel = kur(0);
  for (let sv = 1; sv <= A.TAVAN; sv++)
    dogru(
      kur(sv).kazanan === temel.kazanan,
      'topçu zırh Sv.' + sv + ' savaşın sonucunu ters çevirdi'
    );
});

test('TEK YÖNLÜLÜK: hiçbir stat dalı KAZANILAN savaşı kaybettirmiyor (6144 muharebe)', () => {
  const { tekYonlulukTaramasi } = require('../scripts/delicilik-olcum.js');
  const { denenen, geriTepmeler } = tekYonlulukTaramasi();
  dogru(denenen > 5000, 'tarama beklenenden dar: yalnızca ' + denenen + ' muharebe');
  const zafer = geriTepmeler.filter((g) => g.tip === 'zafer-kaybi');
  dogru(
    zafer.length === 0,
    'yükseltme zaferi yenilgiye çevirdi: ' +
      zafer.map((g) => g.birim + '.' + g.dal + ' Sv.' + g.seviye + ' · ' + g.senaryo).join(' | ')
  );

  // KUVVET KAYBI AYRI BİR BAŞLIK: sonuç değişmiyor ama araştıran taraf daha az birimle
  // çıkıyor. Bilinen tek sebebi bozgunun kademeli olması — daha dayanıklı ordu, ZATEN
  // KAYBETTİĞİ savaşta bozgun eşiğine bir raunt geç varıp bir raunt fazla hasar yiyor.
  // Sayı ölçülmüş bir üst sınır olarak kilitleniyor: yeni bir tür geri tepme doğarsa öter.
  // Ayrıntı `veri/delicilik-olcum.md` §3.
  const kuvvet = geriTepmeler.filter((g) => g.tip === 'kuvvet-kaybi');
  dogru(
    kuvvet.length <= 1,
    'kuvvet kaybı ölçülen sınırı aştı (' +
      kuvvet.length +
      '): ' +
      kuvvet.map((g) => g.birim + '.' + g.dal + ' · ' + g.senaryo).join(' | ')
  );
});

// ---- ARAŞTIRMA SAVAŞI ÇEVİRİYOR MU (2026-08-11, Baki: "araştırmaları yapılan birlikler
// savaşları kesinlikle değiştirebilsin; sınırdan kaybedilen savaşlar sınırdan kazanmaya
// veya ezmeye başlasın") ----
//
// Tarama `scripts/arastirma-olcum.js`'ten geliyor; test daha KÜÇÜK bir ordu listesi
// geçiriyor (tam tarama 4500 eşleşme, test saniyeler içinde bitmeli). Ölçüm ile testin
// aynı fonksiyondan geçmesi şart: iki ayrı tarama yazılsaydı biri sessizce eskirdi.
const TARAMA_ORDULARI = [
  { piyade: 3 },
  { piyade: 4 },
  { piyade: 6 },
  { topcu: 2 },
  { topcu: 3 },
  { topcu: 4 },
  { zirhli: 1 },
  { zirhli: 2 },
  { zirhli: 3 },
  { piyade: 4, topcu: 2 },
  { piyade: 2, topcu: 2, zirhli: 1 },
  { piyade: 3, zirhli: 2 },
];

test('ARAŞTIRMA ÇEVİRİYOR: yakın kaybedilen savaşlar dönüyor — İKİ ROLDE DE', () => {
  const { sinirTaramasi } = require('../scripts/arastirma-olcum.js');
  const bantlar = sinirTaramasi(TARAMA_ORDULARI);

  // "Kıl payı" ve "yakın" bantları BİRLEŞTİRİLİYOR (marj ≥ 0.40). Sebep örneklem:
  // savunan tarafın arazi avantajı olduğu için kıl payı KAYBETTİĞİ savaş az çıkıyor,
  // tek başına o bant istatistik taşımıyor.
  for (const taraf of ['saldiran', 'savunan']) {
    const yakinlar = bantlar.filter(
      (b) => b.taraf === taraf && (b.ad === 'kıl payı' || b.ad === 'yakın')
    );
    const topla = (alan) => yakinlar.reduce((a, b) => a + b[alan], 0);
    const n = topla('n');
    dogru(n >= 10, taraf + ' için yakın savaş örneği yetersiz: ' + n);

    const yuzde = (alan) => topla(alan) / n;
    dogru(
      yuzde('sv3') >= 0.75,
      taraf +
        ' araştırdığında yakın kaybedilen savaşların yalnızca %' +
        (yuzde('sv3') * 100).toFixed(0) +
        "'i tek dal Sv.3 ile dönüyor — araştırma savaşı çevirmiyor"
    );
    dogru(
      yuzde('tam') >= 0.9,
      taraf +
        ' için tam teçhizat bile yakın savaşların yalnızca %' +
        (yuzde('tam') * 100).toFixed(0) +
        "'ini çeviriyor"
    );
    dogru(
      yuzde('sv1') >= 0.2,
      taraf + ' için ilk seviye hiçbir şey yapmıyor (%' + (yuzde('sv1') * 100).toFixed(0) + ')'
    );
  }
});

test('ARAŞTIRMA ÇEVİRMİYOR: ezilerek kaybedilen savaş araştırmayla kazanılmıyor', () => {
  // Ölçütün öteki yarısı. Araştırma umutsuz savaşı kazandırsaydı ordu büyüklüğü anlamını
  // yitirir ve oyun "kim daha çok araştırdı"ya inerdi.
  const { sinirTaramasi } = require('../scripts/arastirma-olcum.js');
  for (const b of sinirTaramasi(TARAMA_ORDULARI).filter((x) => x.ad === 'ezildim')) {
    dogru(b.n >= 10, b.taraf + ' için ezilen savaş örneği yetersiz: ' + b.n);
    dogru(
      b.tam / b.n <= 0.35,
      b.taraf +
        ' araştırdığında tam teçhizat ezilen savaşların %' +
        ((b.tam / b.n) * 100).toFixed(0) +
        "'ini çeviriyor — araştırma ordu büyüklüğünün yerine geçiyor"
    );
  }
});

test('OKUMA: dalSeviyesi bozuk/eksik kaydı 0 sayıyor', () => {
  esit(dalSeviyesi(null, 'piyade', 'zirh'), 0);
  esit(dalSeviyesi({}, 'piyade', 'zirh'), 0);
  esit(dalSeviyesi({ 'piyade.zirh': -3 }, 'piyade', 'zirh'), 0);
  esit(dalSeviyesi({ 'piyade.zirh': 2 }, 'piyade', 'zirh'), 2);
  esit(dalSeviyesi({ 'piyade.zirh': 2 }, 'topcu', 'zirh'), 0, 'ağaçlar karışmamalı');
  esit(arastirmaVarMi({ puan: 9 }), false, 'puan biriktirmek araştırma yapmak değildir');
});

// ---- EĞİTİM PUANI ----

test('EĞİTİM: parça değerleri ilin statını TAM koruyor (81 ilin tamamında)', () => {
  const ilinParcalari = {};
  for (const pid of Object.keys(PARCALAR))
    (ilinParcalari[PARCALAR[pid].kod] = ilinParcalari[PARCALAR[pid].kod] || []).push(pid);

  let toplamHepsi = 0,
    statHepsi = 0;
  for (const kod of Object.keys(ilinParcalari)) {
    const toplam = ilinParcalari[kod].reduce((a, pid) => a + parcaEgitimi(pid), 0);
    const stat = ILLER[kod].statlar.egitim;
    esit(toplam, stat, kod + ' (' + ILLER[kod].ad + ') eğitim toplamı');
    toplamHepsi += toplam;
    statHepsi += stat;
  }
  esit(toplamHepsi, statHepsi, 'Türkiye toplamı');
});

test('EĞİTİM: "her parça en az 1" kuralı eğitimde KAPALI (sapma üretiyordu)', () => {
  // Kural açıkken parça sayısı statından çok olan 9 ilde toplam şişiyordu (318 → 331) ve
  // en çok eğitimi ZAYIF iller kazanıyordu (Şanlıurfa 1 → 4) — eğitim statının ayırt etme
  // işi tersine dönüyordu. Kural kapalı: parçası statından çok olan ilin bazı parçaları 0.
  esit(
    parcaDegerleri([0.25, 0.25, 0.25, 0.25], 1, false).reduce((a, b) => a + b, 0),
    1,
    'kapalıyken toplam tam korunur'
  );
  esit(
    parcaDegerleri([0.25, 0.25, 0.25, 0.25], 1, true).reduce((a, b) => a + b, 0),
    4,
    'açıkken 4 parçanın hepsi en az 1 alır, toplam şişer'
  );
});

test('EĞİTİM: nüfus ve ekonomide "en az 1" kuralı HÂLÂ açık (geri gidiş yok)', () => {
  const { parcaGeliri } = require('../src/oyun/uretim.js');
  for (const pid of Object.keys(PARCALAR)) {
    const g = parcaGeliri(pid);
    dogru(g.nufus >= 1, pid + ' nüfus geliri 0 olmamalı');
    dogru(g.ekonomi >= 1, pid + ' ekonomi geliri 0 olmamalı');
  }
});

test('EĞİTİM: aktörün gücü elindeki parçaların TOPLAMI, fetihle büyüyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 20260730 });
  const ben = d.oyuncuAktorId;
  const once = egitimPuani(d, ben);
  const kapilacak = Object.keys(d.parcaSahipligi).find((p) => d.parcaSahipligi[p] !== ben);
  const sonra = egitimPuani(
    { ...d, parcaSahipligi: { ...d.parcaSahipligi, [kapilacak]: ben } },
    ben
  );
  esit(sonra, once + parcaEgitimi(kapilacak), 'fethedilen parçanın eğitimi eklenmeli');
});

test('EĞİTİM: parçası olmayan aktörün eğitimi 0', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 20260730 });
  esit(egitimPuani({ ...d, parcaSahipligi: {} }, d.oyuncuAktorId), 0);
});

// ---- PUAN KAZANIMI ----

test("VERİM: eğitim 0'da taban verim, eğitim arttıkça AZALARAK büyüyor", () => {
  yakin(arastirmaVerimi(0), A.VERIM_TABANI);
  const a = arastirmaVerimi(10) - arastirmaVerimi(0);
  const b = arastirmaVerimi(110) - arastirmaVerimi(100);
  dogru(b < a, 'ikinci 10 eğitim, ilk 10 kadar katkı yapmamalı (kartopu freni)');
  dogru(arastirmaVerimi(100) > arastirmaVerimi(10), 'yine de artmalı');
});

test("VERİM: sabitler DENGE'den okunuyor (gömülü değil)", () => {
  const eskiTaban = A.VERIM_TABANI;
  const eskiK = A.EGITIM_KATSAYISI;
  try {
    A.VERIM_TABANI = 2;
    A.EGITIM_KATSAYISI = 0;
    yakin(arastirmaVerimi(400), 2, 1e-9, 'katsayı 0 → eğitim etkisiz');
    yakin(turPuani(5, 400), 10);
  } finally {
    A.VERIM_TABANI = eskiTaban;
    A.EGITIM_KATSAYISI = eskiK;
  }
});

test('PUAN: TAM SAYI birikiyor (2026-07-31, Baki: ondalık istemiyorum)', () => {
  // Görev 06'da puan KESİRLİ birikiyordu; gerekçe 'her tur biraz kaynak buharlaşmasın'dı.
  // Puan ölçeği 10× büyütülünce (MALIYET_TABANI 6 → 60) yuvarlama kaybı kazancın ~%1'ine
  // düştü ve gerekçe ortadan kalktı. Ekranda artık hiçbir yerde ondalık görünmüyor.
  const p = turPuani(3, 14);
  esit(p % 1, 0, 'tam sayı olmalı: ' + p);
  yakin(p, Math.round(3 * (A.VERIM_TABANI + A.EGITIM_KATSAYISI * Math.sqrt(14))), 1e-9);
});

test('PUAN: ayrılan 0 ise puan 0, negatif ayırma yok sayılıyor', () => {
  esit(turPuani(0, 50), 0);
  esit(turPuani(-5, 50), 0);
});

// ---- SEVİYE ATLAMA VE TAVAN ----

test('MALİYET: Sv.N = MALIYET_TABANI × N (6, 12, 18 …)', () => {
  for (let n = 1; n <= A.TAVAN; n++) esit(seviyeMaliyeti(n), A.MALIYET_TABANI * n, 'Sv.' + n);
  esit(seviyeMaliyeti(A.TAVAN + 1), Infinity, 'tavan üstü satın alınamaz');
  esit(seviyeMaliyeti(0), Infinity, 'sıfırıncı seviye diye bir şey yok');
});

test('AĞAÇ: 3 ağaç × 4 dal = 12 dal, her ağacın son dalı kendine özgü', () => {
  const dallar = tumDallar();
  esit(dallar.length, 12, 'üç ağaç, dörder dal');
  for (const birim of A.AGAC_SIRASI) {
    const kendi = dallar.filter((d) => d.birim === birim);
    esit(kendi.length, 4, birim + ' dal sayısı');
    esit(kendi.filter((d) => d.tanim.tip === 'ozel').length >= 1, true, birim + ' özel dalı yok');
  }
  // ---- ZIRHLININ SAVUNMA DALI YOK — GEREKÇE 2026-08-11'DE DEĞİŞTİ ----
  // Eski gerekçe: "ölçüm Sv.0 verdi", yani zırhlının zırhını kaydırmak §3.7'yi anında
  // kırıyordu. O ölçüt emekli oldu (araştırmanın tabloyu kaydırması artık İSTENEN şey).
  // Yeni gerekçe ÖLÇÜLDÜ (`veri/arastirma-olcum.md` §5): zırhlıya zırh ya da dayanıklılık
  // dalı eklemek tam teçhizat dengesini DÜZELTMİYOR, yalnızca kayan satırı değiştiriyor —
  // yani dal eklemenin bir karşılığı yok. Zırhlının üçüncü dalı bu yüzden savunma değil
  // paletli üstünlük: gerçek zayıflığı arazi (§3.5), zırhı değil.
  const zirhliStatlari = dallar
    .filter((d) => d.birim === 'zirhli' && d.tanim.tip === 'stat')
    .map((d) => d.tanim.stat);
  esit(zirhliStatlari.includes('zirh'), false, 'zırhlının zırh dalı olmamalı');
  esit(zirhliStatlari.includes('dayaniklilik'), false, 'zırhlının dayanıklılık dalı olmamalı');
});

test('SEVİYE: yeterli puanla atlanıyor, puan düşüyor', () => {
  // Puan MALIYET_TABANI'ndan türetiliyor, elle yazılmıyor — ölçek değişirse test kaymasın.
  const kese = A.MALIYET_TABANI * 3;
  const s = seviyeAtla({ puan: kese }, 'piyade', 'zirh');
  dogru(s.ok, s.sebep);
  esit(s.arastirma['piyade.zirh'], 1);
  esit(s.arastirma.puan, kese - A.MALIYET_TABANI);
});

test('SEVİYE: puan yetmezse REDDEDİLİYOR ve sebebi yazılı', () => {
  const s = seviyeAtla({ puan: 1 }, 'piyade', 'zirh');
  esit(s.ok, false);
  esit(s.kod, 'puan');
  dogru(s.sebep.length > 0, 'sebep boş olmamalı');
});

test('TAVAN: aşılamıyor, tavandaki dal pasif ve sebebi yazılı', () => {
  const dolu = { 'piyade.zirh': A.TAVAN, 'puan': 9999 };
  const d = dalDurumu(dolu, 'piyade', 'zirh');
  esit(d.tavanda, true);
  esit(d.sonraki, null, 'ekranda gösterilecek sonraki seviye yok');
  esit(d.yeter, false, 'düğme pasif olmalı');
  const s = seviyeAtla(dolu, 'piyade', 'zirh');
  esit(s.ok, false);
  esit(s.kod, 'tavan');
  dogru(s.sebep.indexOf(String(A.TAVAN)) >= 0, 'sebep tavanı söylemeli: ' + s.sebep);
});

test("TAVAN: DENGE'den okunuyor (değiştir → sınır değişiyor)", () => {
  const eski = A.TAVAN;
  try {
    A.TAVAN = 1;
    esit(seviyeAtla({ 'piyade.zirh': 1, 'puan': 9999 }, 'piyade', 'zirh').kod, 'tavan');
    A.TAVAN = 5;
    dogru(seviyeAtla({ 'piyade.zirh': 1, 'puan': 9999 }, 'piyade', 'zirh').ok);
  } finally {
    A.TAVAN = eski;
  }
});

test('SEVİYE: bilinmeyen dal reddediliyor', () => {
  esit(seviyeAtla({ puan: 9999 }, 'piyade', 'dayaniklilik').kod, 'dal');
  esit(seviyeAtla({ puan: 9999 }, 'zirhli', 'zirh').kod, 'dal', 'zırhlının zırh dalı yok');
});

test('SEVİYE: art arda atlamada bedel ARTIYOR (maliyet eğrisi)', () => {
  // Tavana kadar çıkmaya yetecek kese: 1+2+…+TAVAN katı.
  let a = { puan: A.MALIYET_TABANI * ((A.TAVAN * (A.TAVAN + 1)) / 2) };
  const bedeller = [];
  for (let i = 0; i < A.TAVAN; i++) {
    const oncekiPuan = a.puan;
    const s = seviyeAtla(a, 'piyade', 'agir');
    dogru(s.ok, 'seviye ' + (i + 1) + ': ' + s.sebep);
    bedeller.push(oncekiPuan - s.arastirma.puan);
    a = s.arastirma;
  }
  esit(a['piyade.agir'], A.TAVAN);
  for (let i = 1; i < bedeller.length; i++)
    dogru(bedeller[i] > bedeller[i - 1], 'her seviye bir öncekinden pahalı olmalı');
});

// ---- ETKİNİN SOMUT ANLATIMI (arayüz) ----

test('ETKİ: ekranda yazılacak sayılar GERÇEK hesaptan çıkıyor, uydurulmuyor', () => {
  const e = dalEtkisi({ 'piyade.zirh': 2 }, 'piyade', 'zirh');
  esit(e.tip, 'stat');
  esit(e.stat, 'zirh');
  yakin(e.once, DENGE.BIRIMLER.piyade.zirh * (1 + A.ARTIS * 2), 1e-9, 'şu anki değer');
  yakin(e.sonra, DENGE.BIRIMLER.piyade.zirh * (1 + A.ARTIS * 3), 1e-9, 'yükseltince');
  dogru(e.cumle.length > 0, 'ekrana yazılacak cümle boş olmamalı');
});

test('ETKİ: kendine özgü dal cümleyle anlatılıyor (stat sütunu yok)', () => {
  for (const d of tumDallar().filter((x) => x.tanim.tip === 'ozel')) {
    const e = dalEtkisi(null, d.birim, d.dal);
    esit(e.tip, 'ozel', d.anahtar);
    dogru(e.cumle.length > 0, d.anahtar + ' cümlesi boş');
    esit(e.stat, undefined, d.anahtar + ' özel dalın stat sütunu olmamalı');
  }
});

test("ÖZEL: dört dal AÇIK/KAPALI ve etkileri DENGE'den okunuyor", () => {
  // 2026-08-08: dördü de tek seviyeli oldu. Ölçülen şey artık "seviyeyle büyüyor mu"
  // değil, "açıkken DENGE'deki değeri veriyor, kapalıyken hiç yok mu".
  const kapali = ozelEtkiler({});
  esit(kapali.baraj, 0);
  esit(kapali.palet, null);
  esit(kapali.yarma, false);
  esit(seferberlikBedava({}), false);

  const acik = ozelEtkiler({ 'topcu.baraj': 1, 'zirhli.palet': 1, 'zirhli.yarma': 1 });
  yakin(acik.baraj, A.OZEL.BARAJ_ON_VURUS, 1e-9);
  yakin(acik.palet.tepelik, A.OZEL.PALET_TELAFI.tepelik, 1e-9);
  yakin(acik.palet.daglik, A.OZEL.PALET_TELAFI.daglik, 1e-9);
  esit(acik.yarma, true);
  esit(seferberlikBedava({ 'piyade.seferberlik': 1 }), true);
});

test('ÖZEL: baraj ateşi savaştan ÖNCE ve KARŞILIKSIZ vuruyor', () => {
  const girdi = {
    saldiran: { birimler: { topcu: 4 } },
    savunan: { birimler: { piyade: 4 } },
    arazi: 'ova',
    tohum: null,
  };
  const temel = muharebeCoz(girdi);
  const barajli = muharebeCoz({
    ...girdi,
    etkiler: { saldiran: { baraj: A.OZEL.BARAJ_ON_VURUS } },
  });

  // Barajlı muharebe fazladan bir RAUNT 0 ile başlıyor; temelde öyle bir satır yok.
  esit(temel.turlar[0].tur, 1);
  esit(barajli.turlar[0].tur, 0);
  dogru(barajli.turlar[0].baraj === true, 'ilk satır baraj satırı olmalı');

  // KARŞILIKSIZ: baraj satırında savunan hiç vurmuyor.
  esit(barajli.turlar[0].savunanVurus, 0);
  dogru(barajli.turlar[0].saldiranVurus > 0, 'baraj hasar vermeli');

  // Savunanın barajı yoksa savunan tarafta ön vuruş doğmuyor; iki taraf da barajlıysa
  // ikisi de ateş ediyor (eşzamanlılık kuralı burada da geçerli).
  const ciftBaraj = muharebeCoz({
    ...girdi,
    savunan: { birimler: { topcu: 4 } },
    etkiler: {
      saldiran: { baraj: A.OZEL.BARAJ_ON_VURUS },
      savunan: { baraj: A.OZEL.BARAJ_ON_VURUS },
    },
  });
  dogru(ciftBaraj.turlar[0].savunanVurus > 0, 'iki taraf da barajlıysa savunan da vurmalı');
});

test('ÖZEL: baraj karşılıksız ve ciddi bir hasar veriyor — ama tek başına savaş kazandırmıyor', () => {
  // ┌─ ⚠ ÖLÇÜT 2026-08-12'DE DEĞİŞTİ ────────────────────────────────────────────────────┐
  // │ Eski test Baki'nin 2026-08-08 cümlesini sınıyordu: "1 topçu, 1 piyadeyi savaşın    │
  // │ başında YARI DAYANIKLILIĞA indirsin." O ayarda ölçüm barajın yakın kaybedilen      │
  // │ savaşların **%95'ini** çevirdiğini gösterdi — 12 puanlık bir dal, 360 puanlık stat │
  // │ dalı kadar iş yapıyordu. Baki: *"hepsini %50 seviyesine yaklaştır."*               │
  // │ İki cümle aynı anda tutmuyor; yeni ve açık olan seçildi (BARAJ_ON_VURUS 0.69→0.20).│
  // └────────────────────────────────────────────────────────────────────────────────────┘
  //
  // Testin sınadığı iki şey kaldı ve ikisi de dalın KİMLİĞİ:
  //   1. Baraj muharebe başlamadan vuruyor ve karşı taraf o an cevap veremiyor.
  //   2. Verdiği hasar ciddi ama tek raundluk normal vuruştan az — "hazırlık ateşi".
  const s = muharebeCoz({
    saldiran: { birimler: { topcu: 1 } },
    savunan: { birimler: { piyade: 1 } },
    arazi: 'ova',
    tohum: null,
    etkiler: { saldiran: { baraj: A.OZEL.BARAJ_ON_VURUS } },
  });
  const raunt0 = s.turlar[0];
  dogru(raunt0.baraj === true, 'ilk satır baraj raundu olmalı');
  esit(raunt0.savunanVurus, 0, 'baraj KARŞILIKSIZ olmalı — savunan cevap veremez');

  const can = DENGE.BIRIMLER.piyade.dayaniklilik;
  const vurus = raunt0.saldiranVurus;
  dogru(
    vurus > can * 0.05,
    'baraj hissedilir olmalı, şu an canın %' + ((vurus / can) * 100).toFixed(0)
  );
  dogru(
    vurus < can * 0.5,
    'baraj yarı canı geçmemeli (2026-08-12 kararı): canın %' + ((vurus / can) * 100).toFixed(0)
  );
  // Oran DENGE'den okunuyor — sayı değişirse hasar da değişmeli, test çivilenmiş olmasın.
  yakin(vurus / A.OZEL.BARAJ_ON_VURUS, vurus / DENGE.ARASTIRMA.OZEL.BARAJ_ON_VURUS, 1e-9);
});

test('ÖZEL: paletli üstünlük cezayı yumuşatıyor ama AVANTAJI büyütmüyor', () => {
  const kur = (arazi, etki) =>
    muharebeCoz({
      saldiran: { birimler: { zirhli: 3 } },
      savunan: { birimler: { piyade: 5 } },
      arazi,
      tohum: null,
      etkiler: { saldiran: etki },
    });
  const P = A.OZEL.PALET_TELAFI;

  // Dağlıkta zırhlının çarpanı 0.5 — ceza var, telafi işlemeli ama TAM kapatmamalı.
  const dagTemel = kur('daglik', undefined);
  const dagPalet = kur('daglik', { palet: P });
  dogru(
    dagPalet.turlar[0].saldiranVurus > dagTemel.turlar[0].saldiranVurus,
    'dağlıkta vuruş artmalı'
  );
  const dagDuz = kur('ova', undefined).turlar[0].saldiranVurus / DENGE.ARAZI.ova.zirhli;
  dogru(
    dagPalet.turlar[0].saldiranVurus < dagDuz,
    'dağlıkta ceza TAMAMEN kalkmamalı (bitmeye yakın, bitmiş değil)'
  );

  // ---- TEPELİKTE CEZA TAMAMEN BİTİYOR (2026-08-08, Baki'nin şartı) ----
  // Ölçüt: paletli zırhlının tepelikteki vuruşu, arazi çarpanı 1.0 olsaydı çıkacak
  // vuruşun aynısı olmalı. Referans ovadan türetiliyor (ova çarpanı 1.15'e bölünerek),
  // böylece beklenen sayı elle yazılmıyor.
  // Tolerans 0.01: rapordaki vuruş iki haneye yuvarlanıyor (`muharebe.js kisalt`),
  // referans ise ham sayıdan türetiliyor. Ölçülen şey eşitlik, yuvarlama değil.
  const tepePalet = kur('tepelik', { palet: P });
  yakin(tepePalet.turlar[0].saldiranVurus, dagDuz, 0.01, 'tepelikte ceza tamamen bitmeli');

  // Ovada çarpan 1.15 — ceza YOK, dal dokunmamalı.
  const ovaTemel = kur('ova', undefined);
  const ovaPalet = kur('ova', { palet: P });
  yakin(
    ovaPalet.turlar[0].saldiranVurus,
    ovaTemel.turlar[0].saldiranVurus,
    1e-9,
    'ovada değişmemeli'
  );
});

test('ÖZEL: dallar tek seviyeli, stat dalları üç seviyeli ve bedeller ayrı', () => {
  esit(dalTavani('topcu', 'baraj'), A.OZEL_TAVAN);
  esit(dalTavani('zirhli', 'yarma'), A.OZEL_TAVAN);
  esit(dalTavani('piyade', 'zirh'), A.TAVAN);

  esit(seviyeMaliyeti(1, 'topcu', 'baraj'), A.OZEL_MALIYET);
  esit(seviyeMaliyeti(1, 'piyade', 'zirh'), A.MALIYET_TABANI);
  esit(seviyeMaliyeti(2, 'piyade', 'zirh'), A.MALIYET_TABANI * 2);
  // Tavanı aşan seviye alınamaz: özel dalın ikinci seviyesi yok.
  esit(seviyeMaliyeti(2, 'topcu', 'baraj'), Infinity);
});

test('ÖZEL: bir kez alınıyor, ikinci kez alınamıyor', () => {
  // Önkoşul (Görev 20): topçunun bir ortak dalı 2. kademede.
  const bir = seviyeAtla({ 'puan': 999, 'topcu.agir': A.OZEL_ONKOSUL }, 'topcu', 'baraj');
  esit(bir.ok, true);
  esit(bir.arastirma['topcu.baraj'], 1);
  esit(bir.arastirma.puan, 999 - A.OZEL_MALIYET, 'bedel özel fiyattan düşmeli');

  const iki = seviyeAtla(bir.arastirma, 'topcu', 'baraj');
  esit(iki.ok, false);
  esit(iki.kod, 'tavan');
});

// ---- ÖZEL YETENEK AĞACIN UCU (Görev 20 · Baki: "evet") ----

test('ÖNKOŞUL: özel yetenek, birliğin bir ortak dalı 2. kademeye çıkmadan alınamıyor', () => {
  for (const [birim, ozel] of [
    ['piyade', 'seferberlik'],
    ['topcu', 'baraj'],
    ['zirhli', 'palet'],
    ['zirhli', 'yarma'],
  ]) {
    const bos = dalDurumu({ puan: 9999 }, birim, ozel);
    esit(bos.kilitli, true, birim + ' ' + ozel + ' başta kilitli');
    esit(bos.yeter, false, 'kilitliyken puan yetse de alınamaz');
    esit(seviyeAtla({ puan: 9999 }, birim, ozel).kod, 'kilit', birim + ' ' + ozel);

    // Kapının bir altı yetmez, kapının kendisi yeter — ve HANGİ ortak dal olduğu fark etmez.
    for (const dal of A.DAL_SIRASI[birim].filter((x) => A.AGACLAR[birim][x].tip !== 'ozel')) {
      const eksik = { puan: 9999, [birim + '.' + dal]: A.OZEL_ONKOSUL - 1 };
      esit(ozelAcikMi(eksik, birim), false, birim + '.' + dal + ' bir eksik');
      const tam = { puan: 9999, [birim + '.' + dal]: A.OZEL_ONKOSUL };
      esit(ozelAcikMi(tam, birim), true, birim + '.' + dal + ' kapıda');
      esit(seviyeAtla(tam, birim, ozel).ok, true, birim + ' ' + ozel + ' ← ' + dal);
    }
  }
});

test('ÖNKOŞUL: başka birliğin dalı kapıyı açmıyor, başka özel yetenek de saymıyor', () => {
  esit(ozelAcikMi({ 'topcu.agir': 3 }, 'piyade'), false, 'topçu dalı piyadeyi açmaz');
  // Zırhlının iki özel yeteneği var; biri ötekinin kapısı sayılmıyor.
  esit(ozelAcikMi({ 'zirhli.palet': 1 }, 'zirhli'), false, 'palet yarmayı açmaz');
});

test('ÖNKOŞUL: eski kayıtta önkoşulsuz alınmış yetenek açık kalıyor', () => {
  const eski = { 'piyade.seferberlik': 1, 'puan': 0 };
  esit(seferberlikBedava(eski), true, 'etkisi sürüyor');
  esit(dalDurumu(eski, 'piyade', 'seferberlik').tavanda, true);
  esit(dalDurumu(eski, 'piyade', 'seferberlik').kilitli, false, 'alınmış düğüm kilitli çizilmez');
});

test('ÖNKOŞUL: aynı tur içinde kapıyı açıp yeteneği almak ve geri almak tutarlı', () => {
  let d = sahne();
  d = {
    ...d,
    arastirma: { [BEN]: { 'puan': 9999, 'piyade.zirh': A.OZEL_ONKOSUL - 1 } },
  };
  esit(seviyeYukselt(d, BEN, 'piyade', 'seferberlik').ok, false, 'kapı kapalı');
  d = seviyeYukselt(d, BEN, 'piyade', 'zirh').durum;
  const s = seviyeYukselt(d, BEN, 'piyade', 'seferberlik');
  esit(s.ok, true, 'kapı açıldı');
  // Geri alma yığın: önce yetenek, sonra kapı — kapısı kapanmış bir yetenek kalamaz.
  let g = seviyeGeriAl(s.durum, BEN).durum;
  esit(dalSeviyesi(aktorArastirmasi(g, BEN), 'piyade', 'seferberlik'), 0, 'önce yetenek');
  g = seviyeGeriAl(g, BEN).durum;
  esit(dalSeviyesi(aktorArastirmasi(g, BEN), 'piyade', 'zirh'), A.OZEL_ONKOSUL - 1, 'sonra kapı');
  esit(aktorArastirmasi(g, BEN).puan, 9999, 'puan eksiksiz geri');
});

// ---- TEK HAVUZ, ÜÇ MUSLUK (Adım 4 / §9/7) ----

test('BÜTÇE: araştırmaya ayrılan ekonomi ORDU BÜTÇESİNDEN düşüyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 40, 40);
  esit(kullanilabilirButce(d, BEN).ekonomi, 40);

  d = ayrilaniAyarla(d, BEN, 15);
  esit(kullanilabilirButce(d, BEN).ekonomi, 25, 'ayrılan pay artık harcanamaz');
  esit(kullanilabilirButce(d, BEN).nufus, 40, 'nüfusa dokunmuyor');
  esit(d.aktorler[BEN].ekonomiHavuzu, 40, 'havuzun kendisi tur sonuna kadar durur');
});

test('BÜTÇE: ayrılan pay yüzünden basılamayan birim SESSİZCE reddedilmiyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 40, 6);
  dogru(siparisGecerliMi(d, '16-1', BEN, { zirhli: 1 }).ok, 'ayrım yokken 6 ekonomi yeter');
  d = ayrilaniAyarla(d, BEN, 4);
  const s = siparisGecerliMi(d, '16-1', BEN, { zirhli: 1 });
  esit(s.ok, false);
  esit(s.kod, 'ekonomi', 'ret sebebi ekonomi olmalı');
});

test('BÜTÇE: ayrım geri çekilebiliyor (sayaç aşağı da iner)', () => {
  let d = sahne();
  d = paraVer(d, BEN, 40, 10);
  d = ayrilaniAyarla(d, BEN, 10);
  esit(arastirmayaAyrilabilir(d, BEN), 10, 'mevcut ayrım yok sayılarak hesaplanır');
  d = ayrilaniAyarla(d, BEN, 3);
  esit(kullanilabilirButce(d, BEN).ekonomi, 7);
  d = ayrilaniAyarla(d, BEN, -5);
  esit(kullanilabilirButce(d, BEN).ekonomi, 10, 'negatif ayrım 0 sayılır');
});

// ---- TUR DÖNGÜSÜNÜN 2. AŞAMASI ----

test('TUR: ayrılan ekonomi tur sonunda düşüyor ve PUANA dönüşüyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 40, 40);
  d = ayrilaniAyarla(d, BEN, 10);
  const egitim = egitimPuani(d, BEN);
  const gelir = aktorGeliri(d, BEN);

  const sonra = turuBitir(d, DURGUN);
  yakin(sonra.aktorler[BEN].ekonomiHavuzu, 40 + gelir.ekonomi - 10, 1e-9, 'ekonomi düştü');
  yakin(sonra.arastirma[BEN].puan, turPuani(10, egitim), 1e-9, 'puan eklendi');
  esit(sonra.arastirma[BEN].puan % 1, 0, 'puan TAM SAYI birikmeli');
  esit(sonra.arastirma[BEN].buTurAyrilan, undefined, 'turluk sayaç sıfırlandı');
});

test('TUR: ayrım havuzdan büyükse olan kadarı harcanıyor, eksiye düşmüyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 0, 0);
  d = ayrilaniAyarla(d, BEN, 999);
  const sonra = turuBitir(d, DURGUN);
  dogru(sonra.aktorler[BEN].ekonomiHavuzu >= 0, 'havuz eksiye düşmemeli');
});

test('TUR: ayrım yoksa araştırma kaydı büyümüyor, puan da eklenmiyor', () => {
  const sonra = turuBitir(sahne(), DURGUN);
  esit(Object.keys(sonra.arastirma).length, 0, '81 aktör için boş kayıt yazılmamalı');
});

// ---- TUR İÇİ GERİ ALMA (§5/9) ----

test('GERİ ALMA: tur içinde son yükseltme geri alınıyor, puan iade ediliyor', () => {
  let d = sahne();
  d = { ...d, arastirma: { [BEN]: { puan: A.MALIYET_TABANI * 4 } } };
  d = seviyeYukselt(d, BEN, 'piyade', 'zirh').durum;
  d = seviyeYukselt(d, BEN, 'piyade', 'agir').durum;
  esit(d.arastirma[BEN]['piyade.zirh'], 1);
  esit(d.arastirma[BEN]['piyade.agir'], 1);
  const puanOnce = d.arastirma[BEN].puan;

  const geri = seviyeGeriAl(d, BEN);
  dogru(geri.ok, geri.sebep);
  esit(geri.durum.arastirma[BEN]['piyade.agir'], 0, 'en son atlanan geri alınmalı');
  esit(geri.durum.arastirma[BEN]['piyade.zirh'], 1, 'öteki dal durmalı');
  esit(geri.durum.arastirma[BEN].puan, puanOnce + A.MALIYET_TABANI, 'puan iade');
});

test("GERİ ALMA: TURU BİTİR'den sonra geri alınamıyor", () => {
  let d = sahne();
  d = { ...d, arastirma: { [BEN]: { puan: A.MALIYET_TABANI * 2 } } };
  d = seviyeYukselt(d, BEN, 'piyade', 'zirh').durum;
  const sonra = turuBitir(d, DURGUN);
  esit(sonra.arastirma[BEN]['piyade.zirh'], 1, 'seviye duruyor');
  esit(sonra.arastirma[BEN].buTurAtlanan, undefined, 'geri alma listesi sıfırlandı');
  esit(seviyeGeriAl(sonra, BEN).ok, false, 'artık geri alınamaz');
});

test('GERİ ALMA: hiç yükseltme yapılmadıysa reddediliyor', () => {
  esit(seviyeGeriAl(sahne(), BEN).ok, false);
});

// ---- OYUNA BAĞLANMA ----

test('FETİH (§5/6): araştırma AKTÖRE ait, toprakla el değiştirmiyor', () => {
  let d = sahne();
  d = { ...d, arastirma: { 11: { 'piyade.zirh': 2, 'puan': 50 } } };
  d = { ...d, ordular: {} };
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-3': BEN, '11-1': '11' } };
  d = { ...d, ordular: { '16-3': { sahip: BEN, birimler: { zirhli: 6 } } } };
  const s = hamleUygula(d, BEN, '16-3', '11-1', { zirhli: 6 });
  dogru(s.ok, s.sebep);
  const sonra = turuBitir(s.durum, DURGUN);
  esit(sonra.parcaSahipligi['11-1'], BEN, 'parça fethedilmeli');
  esit(aktorArastirmasi(sonra, BEN), null, 'fetheden araştırma devralmaz');
  esit(sonra.arastirma['11']['piyade.zirh'], 2, 'fethedilenin araştırması kendinde kalır');
});

test('TARAFSIZ (§5/7): araştırması olmayan aktör temel tabloyu alıyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 20260730 });
  esit(aktorArastirmasi(d, '34'), null, 'kurulumda kimsenin araştırması yok');
  esit(aktorStatlari(d, '34'), DENGE.BIRIMLER, 'garnizon belirlenimci kalmalı');
});

test('BELİRLENİMCİ: aynı tohum + aynı araştırma → aynı muharebe sonucu', () => {
  const girdi = {
    saldiran: { birimler: { piyade: 4, zirhli: 1 } },
    savunan: { birimler: { topcu: 3 } },
    arazi: 'tepelik',
    tohum: 777,
    statlar: {
      saldiran: birimStatlari({ 'piyade.agir': 2 }),
      savunan: birimStatlari({ 'topcu.zirh': 1 }),
    },
  };
  esit(JSON.stringify(muharebeCoz(girdi)), JSON.stringify(muharebeCoz(girdi)));
});

test('ETKİ GERÇEK: araştırma muharebenin KAZANANINI değiştirebiliyor', () => {
  // Araştırmanın gerçekten SONUCU çevirdiğini ölçüyor. Artış oransal ve küçük olduğu için
  // dönme ancak yakın eşleşmelerde oluyor — "azar azar buff" isteğinin ölçülebilir karşılığı.
  //
  // ⚠ EŞLEŞME 2026-08-08'DE DEĞİŞTİ. Eskiden "3 piyade → 3 topçu, piyadenin AĞIR vuruşu"
  // kullanılıyordu; Baki'nin isteğiyle piyadenin ağır vuruşu 10'a indi ("hard hasarı az
  // olsun") ve tavanda bile o satırı çeviremiyor — dalın zayıflığı değil, birimin rolü.
  // Ölçülen kural aynı: dal kazananı değiştirebilmeli. Piyadenin ASIL dalıyla ölçülüyor.
  const temel = {
    saldiran: { birimler: { piyade: 4 } },
    savunan: { birimler: { piyade: 4 } },
    arazi: 'ova',
    tohum: null,
  };
  esit(muharebeCoz(temel).kazanan, 'savunan', 'eşit kuvvette toprak savunanda kalmalı');
  const sonra = muharebeCoz({
    ...temel,
    statlar: { saldiran: birimStatlari({ 'piyade.hafif': A.TAVAN }), savunan: DENGE.BIRIMLER },
  });
  esit(sonra.kazanan, 'saldiran', 'hafif vuruş Sv.' + A.TAVAN + ' ile saldıran kazanmalı');
});

test('ETKİ GERÇEK: araştırma KENDİ birimini güçlendiriyor, ötekini değil', () => {
  // Görev 07'nin ana ayrımı. Piyade ağacına yatırım yapan oyuncunun TOPÇUSU aynı kalmalı.
  const girdi = {
    saldiran: { birimler: { topcu: 3 } },
    savunan: { birimler: { piyade: 4 } },
    arazi: 'ova',
    tohum: null,
  };
  const temel = muharebeCoz(girdi);
  const piyadeYatirimi = muharebeCoz({
    ...girdi,
    statlar: { saldiran: birimStatlari({ 'piyade.agir': A.TAVAN }), savunan: DENGE.BIRIMLER },
  });
  esit(
    JSON.stringify(piyadeYatirimi.saldiran),
    JSON.stringify(temel.saldiran),
    'piyade araştırması topçu ordusunu etkilememeli'
  );
});

// ┌─ ⚠ BU TEST 2026-08-11'DE TERSİNE ÇEVRİLDİ ──────────────────────────────────────────┐
// │ Eski hâli şunu sınıyordu: "§3.7'nin 15 satırı SİMETRİK araştırmada tavana kadar     │
// │ TUTUYOR." Baki'nin isteği o şartı geçersiz kıldı:                                   │
// │                                                                                     │
// │ > *"Araştırmaları yapılan birlikler savaşları kesinlikle değiştirebilsin."*          │
// │                                                                                     │
// │ Tablonun kayması artık kusur değil, istenen sonuç. Üstelik eski test HİÇBİR ŞEY     │
// │ SINAMIYORDU: satırın beklentisini eski tablo biçimiyle (`bant(bA, bB, …)`) okuyordu │
// │ ve 2026-08-08'de biçim değişince her satır "kıl payı" sayılıp atlanıyordu. Yani     │
// │ yeşil yanan bir boşluktu.                                                           │
// │                                                                                     │
// │ Yerine geçen şart, oyunun gerçekten korunması gereken hâli: HERKES HER ŞEYİ         │
// │ araştırdığında taş-kağıt-makas hâlâ dönüyor mu?                                     │
// └─────────────────────────────────────────────────────────────────────────────────────┘
test('TAM TEÇHİZAT: herkes her şeyi araştırınca taş-kağıt-makas hâlâ dönüyor', () => {
  const { tamTechizat } = require('../scripts/arastirma-olcum.js');
  const st = birimStatlari(tamTechizat());
  const bedel = (t) => DENGE.BIRIMLER[t].nufus + DENGE.BIRIMLER[t].ekonomi;
  const butce = Math.max(...DENGE.BIRIM_SIRASI.map(bedel)) * 6;

  // Her birim EN AZ BİR eşleşmeyi kazanmalı ve EN AZ BİR eşleşmeyi kaybetmeli — üçgenin
  // tanımı bu. Ölçü eşit para: sayıları eşitlemek fiyatı yok saymak olurdu.
  const galip = {},
    maglup = {};
  for (const a of DENGE.BIRIM_SIRASI)
    for (const s of DENGE.BIRIM_SIRASI)
      for (const arazi of ['ova', 'tepelik', 'daglik']) {
        const r = muharebeCoz({
          saldiran: { birimler: { [a]: Math.max(1, Math.floor(butce / bedel(a))) } },
          savunan: { birimler: { [s]: Math.max(1, Math.floor(butce / bedel(s))) } },
          arazi,
          tohum: null,
          statlar: { saldiran: st, savunan: st },
        });
        if (r.kazanan === 'saldiran') galip[a] = (galip[a] || 0) + 1;
        else if (r.kazanan === 'savunan') maglup[a] = (maglup[a] || 0) + 1;
      }
  for (const t of DENGE.BIRIM_SIRASI) {
    dogru((galip[t] || 0) > 0, DENGE.BIRIMLER[t].ad + ' tam teçhizatta hiçbir eşleşme kazanmıyor');
    dogru(
      (maglup[t] || 0) > 0,
      DENGE.BIRIMLER[t].ad + ' tam teçhizatta hiçbir eşleşme kaybetmiyor'
    );
  }
});

test('TAVAN: sınır keyfi değil — bir kademe yukarısı umutsuz savaşı da çevirmeye başlıyor', () => {
  // ---- TAVANI BAĞLAYAN ŞART 2026-08-11'DE DEĞİŞTİ ----
  //
  // Eskiden tavanın gerekçesi "§3.7 tablosu kırılmasın"dı. Baki'nin isteğiyle tablonun
  // kayması artık istenen sonuç, dolayısıyla tavanı o şart bağlayamaz. Ama tavan yine de
  // gerekli — ÖTEKİ UÇTAN: araştırma UMUTSUZ savaşı da kazandırmaya başlarsa ordu
  // büyüklüğü anlamını yitirir ve oyun "kim çok araştırdı"ya iner.
  //
  // Test bunu sınıyor: tavanı bir kademe aşmak, ezilerek kaybedilen savaşlardaki dönüş
  // oranını YUKARI taşımalı. Taşımıyorsa tavan gereksiz bir kısıtlamadır.
  const { sinirTaramasi } = require('../scripts/arastirma-olcum.js');

  // Tek rol yeter: sorulan şey tavanın bir işe yarayıp yaramadığı, rol farkı değil.
  const ezilenDonus = () => {
    const b = sinirTaramasi(TARAMA_ORDULARI, ['saldiran']).find((x) => x.ad === 'ezildim');
    return { n: b.n, oran: b.tam / b.n };
  };
  const simdi = ezilenDonus();
  const eskiTavan = A.TAVAN;
  let yukari;
  try {
    A.TAVAN = eskiTavan + 2;
    yukari = ezilenDonus();
  } finally {
    A.TAVAN = eskiTavan;
  }

  dogru(simdi.n >= 10, 'ezilen savaş örneği yetersiz: ' + simdi.n);
  dogru(
    yukari.oran > simdi.oran + 1e-9,
    'tavanı 2 kademe yükseltmek umutsuz savaşlarda hiçbir şeyi değiştirmiyor (' +
      (simdi.oran * 100).toFixed(0) +
      '% → ' +
      (yukari.oran * 100).toFixed(0) +
      '%) — tavan gereksiz bir kısıtlama olurdu'
  );
});

test('TAVAN: zırhlının savunma dalları YOK — ölçüm Sv.0 verdiği için', () => {
  // Görev 06'nın tek tavanını Sv.2'de tutan şeyin ta kendisi. Zırhlının zırhı 8, hafif
  // vuruş etkinliği clamp(1 − zOrt/12, 0.10, 1.00); artırınca taban geliyor ve
  // "3 piyade 1 zırhlıyı yener" satırı ters dönüyor. Ölçüm her artış oranında Sv.0 verdi,
  // o yüzden zırhlının üçüncü ana dalı savunma değil PALETLİ ÜSTÜNLÜK.
  const t = birimStatlari({ 'zirhli.zirh': 1 });
  esit(t.zirhli.zirh, DENGE.BIRIMLER.zirhli.zirh, 'olmayan dal statı kaydırmamalı');
  esit(seviyeAtla({ puan: 9999 }, 'zirhli', 'zirh').kod, 'dal');
  esit(seviyeAtla({ puan: 9999 }, 'zirhli', 'dayaniklilik').kod, 'dal');
  // Zırhlının gerçek üçüncü dalı çalışıyor mu (önkoşulu sağlanınca — Görev 20):
  dogru(
    seviyeAtla({ 'puan': 9999, 'zirhli.hafif': A.OZEL_ONKOSUL }, 'zirhli', 'palet').ok,
    'paletli üstünlük açılabilmeli'
  );
});
