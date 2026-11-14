// YENİDEN TOPLANMA VE KADRO TESTLERİ (Görev 06 / Adım 2).
//
// Asıl sorular: kadro ile mevcut hiçbir yolda ayrışıyor mu, toplanma bedeli gerçekten
// DENGE'den mi türüyor, kaynak yetmeyince karışım bozuluyor mu, imha olan ordunun kadrosu
// siliniyor mu, kasten kaybedip doldurmak kârlı mı?
//
// EN ÖNEMLİ TEST GRUBU "DEĞİŞMEZ KURAL" başlığı altında: her tür için kadro ≥ mevcut.
// Bu görevin en olası sessiz hatası kadro ile mevcudun karışması — yanlış olan çökmez,
// sadece yanlış sayı yazar. O yüzden beş yolun (üretim · kayıp · bölünme · birleşme ·
// toplanma) her biri ayrı ayrı sınanıyor.

const { test, dogru, esit, yakin, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { birimSayisi, birimUret, kadroAl, kayitKadrosu } = require('../src/oyun/ordu.js');
const {
  orduBol,
  emirKaldir,
  kullanilabilirBirimler,
  hareketGecerliMi,
  toplanmaEmriVer,
} = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { emirleriCoz } = require('../src/oyun/cozum.js');
const { muharebeCoz } = require('../src/oyun/muharebe.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { aktorGeliri } = require('../src/oyun/uretim.js');
const { kullanilabilirButce } = require('../src/oyun/butce.js');
const {
  eksikKadro,
  toplanabilirMi,
  toplanmaMaliyeti,
  birimToplanmaBedeli,
  birimIyilestirmeBedeli,
  toplanmaCoz,
  kadroBol,
  kadroBirlestir,
  kadroGecerliMi,
  eksikDokumu,
} = require('../src/oyun/toplanma.js');
const { siparisMaliyeti } = require('../src/oyun/ordu.js');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const TOHUM = 20260730;
const BEN = '16';

function sahne() {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  // BEN herkesle savaşta — bu dosya toplanma/kadro kurallarını ölçüyor (Görev 11).
  return hepsiyleSavas({ ...d, ordular: {} }, BEN);
}

function orduKoy(d, pid, sahip, birimler, kadro, havuz, yarali) {
  const o = { sahip, birimler };
  if (kadro) o.kadro = kadro;
  if (havuz) o.hasarHavuzu = havuz;
  if (yarali) o.yarali = yarali;
  return { ...d, ordular: { ...d.ordular, [pid]: o } };
}

// Emir ekle ve gerçekten eklendiğini doğrula (`hamleUygula` { ok, durum } döndürüyor).
function emret(d, aktorId, kaynak, hedef, birimler) {
  const s = hamleUygula(d, aktorId, kaynak, hedef, birimler);
  dogru(s.ok, 'emir eklenemedi: ' + s.sebep);
  return s.durum;
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

// ---- MALİYET: TÜRETİLİYOR MU, TASARIMLA TUTUYOR MU ----

test('MALİYET: türetilen tablo tasarım §3.9/3 ile birebir tutuyor', () => {
  const p = birimToplanmaBedeli('piyade');
  esit(p.nufus, 2, 'piyade nüfus');
  esit(p.ekonomi, 1, 'piyade ekonomi');
  const t = birimToplanmaBedeli('topcu');
  esit(t.nufus, 1, 'topçu nüfus');
  esit(t.ekonomi, 2, 'topçu ekonomi');
  const z = birimToplanmaBedeli('zirhli');
  esit(z.nufus, 1, 'zırhlı nüfus');
  esit(z.ekonomi, 3, 'zırhlı ekonomi');
});

test('MALİYET: bedel DENGE.TOPLANMA.INDIRIM ile değişiyor (gömülü değil)', () => {
  const eski = DENGE.TOPLANMA.INDIRIM;
  try {
    DENGE.TOPLANMA.INDIRIM = 1;
    const z = birimToplanmaBedeli('zirhli');
    esit(z.ekonomi, DENGE.BIRIMLER.zirhli.ekonomi, 'indirim 1 → tam fiyat');
    DENGE.TOPLANMA.INDIRIM = 0.25;
    esit(birimToplanmaBedeli('zirhli').ekonomi, 2, 'indirim 0.25 → ⌈6×0.25⌉ = 2');
  } finally {
    DENGE.TOPLANMA.INDIRIM = eski;
  }
});

test('MALİYET: toplanma sıfırdan basmaktan UCUZ ama bedava değil', () => {
  for (const tur of DENGE.BIRIM_SIRASI) {
    const tam = siparisMaliyeti({ [tur]: 1 });
    const yari = birimToplanmaBedeli(tur);
    dogru(
      yari.nufus + yari.ekonomi < tam.nufus + tam.ekonomi,
      tur + ': toplanma tam fiyattan ucuz olmalı'
    );
    dogru(yari.nufus + yari.ekonomi > 0, tur + ': toplanma bedava olamaz');
  }
});

test('SÖMÜRÜ (§3.9/4): kaybedip doldurmak, hiç kaybetmemekten PAHALI', () => {
  // "Hiç kaybetmemek" bedavadır. Kaybedip doldurmak her türde pozitif bedel ister,
  // yani kasten kayıp vermenin kârlı olduğu bir durum yok.
  const eksik = { piyade: 1, topcu: 1, zirhli: 1 };
  const m = toplanmaMaliyeti(eksik);
  dogru(m.nufus > 0 && m.ekonomi > 0, 'doldurmak hem nüfus hem ekonomi ister');
  esit(m.nufus, 2 + 1 + 1, 'toplam nüfus');
  esit(m.ekonomi, 1 + 2 + 3, 'toplam ekonomi');
});

// ---- EKSİK VE OKUMA ----

test('KADRO: alan yoksa kadro = mevcut (yıpranmamış ordu)', () => {
  const o = { sahip: BEN, birimler: { piyade: 3 } };
  esit(kadroAl(o).piyade, 3);
  esit(toplanabilirMi(o), false);
  esit(birimSayisi(eksikKadro(o)), 0);
});

test('KADRO: eksik = kadro − mevcut, yalnızca pozitifler', () => {
  const o = { sahip: BEN, birimler: { piyade: 3, topcu: 1 }, kadro: { piyade: 5, topcu: 2 } };
  const e = eksikKadro(o);
  esit(e.piyade, 2);
  esit(e.topcu, 1);
  esit(e.zirhli, undefined, 'hiç zırhlısı yoktu, eksik listesine girmemeli');
  esit(toplanabilirMi(o), true);
});

test('KAYIT: kadro yalnızca mevcuttan FARKLIYSA yazılıyor (boyut kuralı)', () => {
  esit(kayitKadrosu({ piyade: 3 }, { piyade: 3 }), undefined, 'aynıysa alan yazılmaz');
  dogru(kayitKadrosu({ piyade: 3 }, { piyade: 5 }), 'farklıysa yazılır');
});

test('OKUNABİLİRLİK: eksik dökümü sade Türkçe yazıyor', () => {
  esit(eksikDokumu({ piyade: 3, topcu: 1 }), '3 piyade, 1 topçu');
  esit(eksikDokumu({}), '');
});

// ---- TOPLANMANIN ÇÖZÜMÜ ----

test('TOPLANMA: mevcudu kadroya çıkarıyor ve hasar havuzunu SIFIRLIYOR', () => {
  const o = {
    sahip: BEN,
    birimler: { piyade: 3, topcu: 1 },
    kadro: { piyade: 5, topcu: 2 },
    hasarHavuzu: 7,
  };
  const s = toplanmaCoz(o, { nufus: 99, ekonomi: 99 });
  esit(s.yeniOrdu.birimler.piyade, 5);
  esit(s.yeniOrdu.birimler.topcu, 2);
  esit(s.yeniOrdu.hasarHavuzu, 0, 'hasar havuzu sıfırlanmalı (§3.9/2)');
  esit(s.yeniOrdu.kadro, undefined, 'tam dolan ordunun kadro alanı artık yazılmaz');
  esit(birimSayisi(s.basilamayan), 0);
  esit(s.harcanan.nufus, 2 * 2 + 1 * 1, '2 piyade + 1 topçu nüfusu');
  esit(s.harcanan.ekonomi, 2 * 1 + 1 * 2, '2 piyade + 1 topçu ekonomisi');
});

test('TOPLANMA: kadroyu AŞAMAZ — ordu kağıt üstündeki mevcudundan büyüyemez', () => {
  const o = { sahip: BEN, birimler: { piyade: 4 }, kadro: { piyade: 5 } };
  const s = toplanmaCoz(o, { nufus: 999, ekonomi: 999 });
  esit(s.yeniOrdu.birimler.piyade, 5, 'sınırsız bütçeyle bile kadro kadar');
});

test('TOPLANMA: kaynak yetmezse KISMİ dolar, karışımın oranı korunur', () => {
  // Eksik: 3 piyade + 3 zırhlı. Bütçe yalnızca 4 birime yetiyor.
  // Tek türü sonuna kadar doldursaydık "3 piyade + 1 zırhlı" olurdu; sırayla dolunca 2+2.
  const o = {
    sahip: BEN,
    birimler: { piyade: 1, zirhli: 1 },
    kadro: { piyade: 4, zirhli: 4 },
  };
  const s = toplanmaCoz(o, { nufus: 6, ekonomi: 8 });
  esit(s.dolan.piyade, 2, 'piyade');
  esit(s.dolan.zirhli, 2, 'zırhlı');
  esit(s.basilamayan.piyade, 1);
  esit(s.basilamayan.zirhli, 1);
  esit(s.harcanan.nufus, 2 * 2 + 2 * 1);
  esit(s.harcanan.ekonomi, 2 * 1 + 2 * 3);
});

test('TOPLANMA: bütçe hiç yetmezse ORDUYA DOKUNULMAZ, kaynak harcanmaz', () => {
  const o = { sahip: BEN, birimler: { zirhli: 1 }, kadro: { zirhli: 3 }, hasarHavuzu: 9 };
  const s = toplanmaCoz(o, { nufus: 0, ekonomi: 0 });
  esit(s.yeniOrdu, o, 'aynı nesne dönmeli — hiçbir şey olmadı');
  esit(s.harcanan.nufus, 0);
  esit(s.harcanan.ekonomi, 0);
  esit(s.yeniOrdu.hasarHavuzu, 9, 'bedava hasar temizliği olmamalı');
  esit(s.basilamayan.zirhli, 2);
});

test('TOPLANMA: bütçe kesirliyse AŞAĞI yuvarlanır (üretimdeki kuralın aynısı)', () => {
  const o = { sahip: BEN, birimler: { piyade: 1 }, kadro: { piyade: 2 } };
  const az = toplanmaCoz(o, { nufus: 1.9, ekonomi: 5 });
  esit(birimSayisi(az.dolan), 0, '1.9 nüfus, 2 nüfusluk piyadeye yetmez');
  const yeter = toplanmaCoz(o, { nufus: 2.9, ekonomi: 5 });
  esit(yeter.dolan.piyade, 1);
});

test('TOPLANMA: eksiği olmayan ordu toplanamaz (boşuna para gitmez)', () => {
  const o = { sahip: BEN, birimler: { piyade: 3 } };
  const s = toplanmaCoz(o, { nufus: 99, ekonomi: 99 });
  esit(s.harcanan.nufus, 0);
  esit(s.harcanan.ekonomi, 0);
  esit(s.yeniOrdu, o);
});

// ---- KADRO BÖLÜŞÜMÜ VE BİRLEŞMESİ ----

test('BÖLÜNME: kadro birim sayısına ORANLA bölünüyor (hasar havuzuyla aynı kural)', () => {
  // 4 birim, 4 eksik. Yarısı gidiyorsa eksik de yarı yarıya bölünmeli.
  const o = {
    sahip: BEN,
    birimler: { piyade: 2, zirhli: 2 },
    kadro: { piyade: 4, zirhli: 4 },
    hasarHavuzu: 8,
  };
  const k = kadroBol(o, { piyade: 1, zirhli: 1 });
  esit(birimSayisi(k.giden), 4, 'giden kadro: 2 birim + 2 eksik payı');
  esit(birimSayisi(k.kalan), 4, 'kalan kadro: 2 birim + 2 eksik payı');
  const b = orduBol(o, { piyade: 1, zirhli: 1 });
  yakin(b.giden.hasarHavuzu, 4, 1e-9, 'hasar havuzu da yarı yarıya');
  yakin(b.kalan.hasarHavuzu, 4, 1e-9);
});

test('BÖLÜNME: kadronun TOPLAMI korunuyor (hiç kaybolmuyor, üremiyor)', () => {
  const o = {
    sahip: BEN,
    birimler: { piyade: 3, topcu: 2, zirhli: 1 },
    kadro: { piyade: 7, topcu: 3, zirhli: 4 },
  };
  for (const giden of [
    { piyade: 1 },
    { piyade: 3 },
    { topcu: 2 },
    { piyade: 2, zirhli: 1 },
    { piyade: 3, topcu: 2, zirhli: 1 },
  ]) {
    const k = kadroBol(o, giden);
    esit(
      birimSayisi(k.giden) + birimSayisi(k.kalan),
      birimSayisi(o.kadro),
      'giden ' + JSON.stringify(giden) + ' → toplam kadro korunmalı'
    );
  }
});

test('BÖLÜNME: ordunun TAMAMI giderse kadronun tamamı da gider', () => {
  const o = { sahip: BEN, birimler: { piyade: 2 }, kadro: { piyade: 6 } };
  const k = kadroBol(o, { piyade: 2 });
  esit(k.giden.piyade, 6, 'arkada kadro bırakmak onu buharlaştırmak olurdu');
  esit(birimSayisi(k.kalan), 0);
});

test('BÖLÜNME: bölünme kadroyu ÜRETMEZ — sömürü yolu yok', () => {
  const o = { sahip: BEN, birimler: { piyade: 4 }, kadro: { piyade: 4 } };
  const k = kadroBol(o, { piyade: 2 });
  esit(k.giden.piyade, 2);
  esit(k.kalan.piyade, 2);
});

test('BİRLEŞME: kadrolar toplanıyor (§5/2)', () => {
  const a = { sahip: BEN, birimler: { piyade: 2 }, kadro: { piyade: 5 } };
  const b = { sahip: BEN, birimler: { topcu: 1, piyade: 1 } };
  const k = kadroBirlestir(a, b);
  esit(k.piyade, 6);
  esit(k.topcu, 1);
});

// ---- DEĞİŞMEZ KURAL: kadro ≥ mevcut, BEŞ YOLDA ----

test('DEĞİŞMEZ 1/5 — ÜRETİM: takviye kadroyu da artırıyor, eksik korunuyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 1 }, { piyade: 3 });
  d = paraVer(d, BEN, 100, 100);
  const s = birimUret(d, '16-1', BEN, { piyade: 2 });
  dogru(s.ok, 'üretim geçerli olmalı');
  const o = s.durum.ordular['16-1'];
  esit(o.birimler.piyade, 3, 'mevcut 1 → 3');
  esit(kadroAl(o).piyade, 5, 'kadro 3 → 5: ödenmiş birim kadroya girer');
  esit(birimSayisi(eksikKadro(o)), 2, 'eksik değişmemeli — takviye toplanma değildir');
  dogru(kadroGecerliMi(o), 'kadro ≥ mevcut');
});

test('DEĞİŞMEZ 1/5 — ÜRETİM: yıpranmamış orduya üretim kadro alanı YAZMIYOR', () => {
  let d = sahne();
  d = paraVer(d, BEN, 100, 100);
  const s = birimUret(d, '16-1', BEN, { piyade: 2 });
  esit(s.durum.ordular['16-1'].kadro, undefined, 'kayıt boyutu büyümemeli');
});

test('DEĞİŞMEZ 1/5 — ÜRETİM: yıpranmış orduya üretim hasar havuzunu SİLMİYOR', () => {
  // Eskiden `birimUret` orduyu yeniden kurarken hasar havuzunu düşürüyordu: yıpranmış
  // orduya 1 piyade basmak havuzu bedavaya temizliyordu. Görev 06'da düzeltildi.
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 }, null, 9);
  d = paraVer(d, BEN, 100, 100);
  const s = birimUret(d, '16-1', BEN, { piyade: 1 });
  esit(s.durum.ordular['16-1'].hasarHavuzu, 9, 'havuz korunmalı');
});

test('DEĞİŞMEZ 2/5 — KAYIP: muharebe kadroyu düşürmüyor, eksik doğuyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 5 });
  d = orduKoy(d, '16-3', '11', { piyade: 3 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': '11' } };
  d = emret(d, BEN, '16-1', '16-3', { piyade: 5 });
  const { durum } = emirleriCoz(d);
  const o = durum.ordular['16-3'];
  dogru(o && o.sahip === BEN, 'saldıran hedefi almalı');
  dogru(birimSayisi(o.birimler) < 5, 'kayıp vermiş olmalı');
  esit(birimSayisi(kadroAl(o)), 5, 'kadro muharebede DEĞİŞMEZ');
  dogru(kadroGecerliMi(o), 'kadro ≥ mevcut');
  dogru(toplanabilirMi(o), 'yıpranmış ordu toplanabilir olmalı');
});

test('DEĞİŞMEZ 3/5 — BÖLÜNME: iki parçada da kadro ≥ mevcut', () => {
  const o = {
    sahip: BEN,
    birimler: { piyade: 3, zirhli: 1 },
    kadro: { piyade: 6, zirhli: 2 },
  };
  const b = orduBol(o, { piyade: 2 });
  dogru(kadroGecerliMi(b.giden), 'giden');
  dogru(kadroGecerliMi(b.kalan), 'kalan');
});

test('DEĞİŞMEZ 4/5 — BİRLEŞME: birleşik orduda kadro ≥ mevcut', () => {
  const a = { sahip: BEN, birimler: { piyade: 2 }, kadro: { piyade: 5 } };
  const b = { sahip: BEN, birimler: { piyade: 3 } };
  const birlesik = {
    sahip: BEN,
    birimler: { piyade: 5 },
    kadro: kadroBirlestir(a, b),
  };
  dogru(kadroGecerliMi(birlesik));
  esit(birlesik.kadro.piyade, 8);
});

test('DEĞİŞMEZ 5/5 — TOPLANMA: dolduktan sonra da kadro ≥ mevcut', () => {
  const o = { sahip: BEN, birimler: { piyade: 1 }, kadro: { piyade: 4 } };
  for (const butce of [
    { nufus: 0, ekonomi: 0 },
    { nufus: 3, ekonomi: 3 },
    { nufus: 99, ekonomi: 99 },
  ]) {
    dogru(kadroGecerliMi(toplanmaCoz(o, butce).yeniOrdu), 'bütçe ' + butce.nufus);
  }
});

// ---- EMİR KUYRUĞU VE TUR DÖNGÜSÜ (Adım 4) ----

test('EMİR: toplanma emri kuyruğa giriyor ve bedeli üstünde yazıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 }, { piyade: 5 });
  const s = toplanmaEmriVer(d, BEN, '16-1');
  dogru(s.ok, s.sebep);
  const e = s.durum.emirler[0];
  esit(e.tip, 'toplanma');
  esit(e.kaynak, '16-1');
  esit(e.bedel.nufus, 3 * 2, '3 piyade × 2 nüfus');
  esit(e.bedel.ekonomi, 3 * 1);
});

test('EMİR: tam güçteki orduya toplanma emri verilemiyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  esit(toplanmaEmriVer(d, BEN, '16-1').kod, 'gereksiz');
});

test('EMİR: yaralısı olan ordu, eksiği olmasa da toplanabiliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 }, null, null, { piyade: 2 });
  const s = toplanmaEmriVer(d, BEN, '16-1');
  dogru(s.ok, s.sebep);
  esit(birimSayisi(s.durum.emirler[0].yarali), 2);
});

test('EMİR: aynı orduya İKİ KEZ toplanma emri verilemiyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 }, { piyade: 5 });
  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  esit(toplanmaEmriVer(d, BEN, '16-1').kod, 'emirvar');
});

// ---- YARALI BİRLİKLER (2026-07-31) ----
//
// Baki: "savaşlarda bazı birlikler ölsün bazıları yaralansın bazılarına bir şey olmasın
// (bir şey olmama durumu savaş kazanıldığında geçerli olur)."

test('YARALI: EZİCİ zaferde kimse yaralanmıyor', () => {
  const s = muharebeCoz({
    saldiran: { birimler: { zirhli: 6 } },
    savunan: { birimler: { piyade: 1 } },
    arazi: 'ova',
    tohum: null,
  });
  esit(s.kazanan, 'saldiran');
  esit(birimSayisi(s.saldiran.yarali), 0, 'ezici kazanan yara almamalı');
});

test('YARALI: KANLI muharebede sağ kalanların bir kısmı yaralı çıkıyor', () => {
  const s = muharebeCoz({
    saldiran: { birimler: { piyade: 8 } },
    savunan: { birimler: { piyade: 6 } },
    arazi: 'ova',
    tohum: null,
  });
  const kalan = birimSayisi(s.saldiran.birimler);
  const yarali = birimSayisi(s.saldiran.yarali);
  dogru(kalan > 0, 'saldıran hayatta kalmalı');
  dogru(yarali > 0, 'kanlı muharebede yaralı çıkmalı');
  dogru(yarali <= kalan, 'yaralı sayısı mevcudu aşamaz');
});

test('YARALI: sayı hiçbir sonuçta mevcudu AŞMIYOR (değişmez kural)', () => {
  const senaryolar = [
    [{ piyade: 5 }, { topcu: 3 }, 'ova'],
    [{ zirhli: 2 }, { piyade: 6 }, 'daglik'],
    [{ topcu: 4 }, { zirhli: 4 }, 'tepelik'],
    [{ piyade: 3, topcu: 1, zirhli: 1 }, { piyade: 8 }, 'ova'],
  ];
  for (const [a, b, arazi] of senaryolar) {
    const s = muharebeCoz({
      saldiran: { birimler: a },
      savunan: { birimler: b },
      arazi,
      tohum: null,
    });
    for (const taraf of [s.saldiran, s.savunan])
      for (const tur of DENGE.BIRIM_SIRASI)
        dogru(
          (taraf.yarali[tur] || 0) <= (taraf.birimler[tur] || 0),
          arazi + ' ' + tur + ': yaralı > mevcut'
        );
  }
});

test('YARALI: yaralı ordu aynı savaşta DAHA KÖTÜ sonuç alıyor', () => {
  const temel = {
    savunan: { birimler: { piyade: 4 } },
    arazi: 'ova',
    tohum: null,
  };
  const saglam = muharebeCoz({ ...temel, saldiran: { birimler: { piyade: 5 } } });
  const yarali = muharebeCoz({
    ...temel,
    saldiran: { birimler: { piyade: 5 }, yarali: { piyade: 3 } },
  });
  dogru(
    yarali.saldiran.kalan < saglam.saldiran.kalan || yarali.kazanan !== saglam.kazanan,
    'yaralı orduyla savaşa girmek pahalıya patlamalı'
  );
});

test('YARALI: kayıpları ÖNCE yaralılar veriyor', () => {
  const s = muharebeCoz({
    saldiran: { birimler: { piyade: 6 }, yarali: { piyade: 3 } },
    savunan: { birimler: { piyade: 4 } },
    arazi: 'ova',
    tohum: null,
  });
  const olen = birimSayisi(s.saldiran.kayiplar);
  dogru(olen > 0, 'kayıp olmalı');
  // Ölenler yaralılardan sayıldığı için kalan yaralı sayısı 3'ten az olmalı.
  dogru(
    birimSayisi(s.saldiran.yarali) <= 3 || birimSayisi(s.saldiran.birimler) === 0,
    'yaralı sayısı artmamalı, önce onlar düşmeli'
  );
});

test('İYİLEŞTİRME: yaralıya bakmak, ölenin yerine yenisini koymaktan UCUZ', () => {
  for (const tur of DENGE.BIRIM_SIRASI) {
    const olen = birimToplanmaBedeli(tur);
    const yarali = birimIyilestirmeBedeli(tur);
    dogru(
      yarali.nufus + yarali.ekonomi <= olen.nufus + olen.ekonomi,
      tur + ': iyileştirme daha pahalı olamaz'
    );
    dogru(yarali.nufus + yarali.ekonomi > 0, tur + ': iyileştirme bedava olamaz');
  }
});

test('TOPLANMA: yaralıları iyileştiriyor ve eksiği dolduruyor', () => {
  const o = {
    sahip: BEN,
    birimler: { piyade: 4 },
    kadro: { piyade: 6 },
    yarali: { piyade: 3 },
    hasarHavuzu: 5,
  };
  const s = toplanmaCoz(o, { nufus: 99, ekonomi: 99 });
  esit(s.iyilesen.piyade, 3, '3 yaralı iyileşmeli');
  esit(s.dolan.piyade, 2, '2 ölünün yeri dolmalı');
  esit(s.yeniOrdu.birimler.piyade, 6);
  esit(s.yeniOrdu.yarali, undefined, 'hiç yaralı kalmamalı');
  esit(s.yeniOrdu.hasarHavuzu, 0);
});

test('TOPLANMA: bütçe kısıtlıysa ÖNCE yaralıya bakılıyor (ucuz olan)', () => {
  const o = {
    sahip: BEN,
    birimler: { piyade: 2 },
    kadro: { piyade: 4 },
    yarali: { piyade: 2 },
  };
  // Piyade: iyileştirme 1 nüfus/1 ekonomi, yerine koyma 2 nüfus/1 ekonomi.
  const s = toplanmaCoz(o, { nufus: 2, ekonomi: 2 });
  esit(s.iyilesen.piyade, 2, 'iki yaralı da iyileşmeli');
  esit(birimSayisi(s.dolan), 0, 'para ölülere kalmamalı');
  esit(s.yeniOrdu.yarali, undefined);
  esit(s.yeniOrdu.kadro.piyade, 4, 'eksik duruyor, sonraki tur doldurulabilir');
});

test('TOPLANMA: iyileşemeyen yaralılar kayıtta kalıyor', () => {
  const o = { sahip: BEN, birimler: { piyade: 4 }, yarali: { piyade: 4 } };
  const s = toplanmaCoz(o, { nufus: 2, ekonomi: 2 });
  esit(s.iyilesen.piyade, 2);
  esit(s.iyilesemeyen.piyade, 2);
  esit(s.yeniOrdu.yarali.piyade, 2);
});

// ---- SEFERBERLİK: PİYADE YARALISI BEDAVA VE ANINDA (2026-08-08, Baki) ----

test('SEFERBERLİK: piyade yaralısının bedeli SIFIR, ötekiler tam bedel', () => {
  const acik = birimIyilestirmeBedeli('piyade', true);
  esit(acik.nufus, 0);
  esit(acik.ekonomi, 0);

  // Yalnız piyade — topçu ve zırhlı yaralısı dala rağmen tam bedel ödüyor.
  for (const tur of ['topcu', 'zirhli']) {
    const b = birimIyilestirmeBedeli(tur, true);
    const temel = birimIyilestirmeBedeli(tur, false);
    esit(b.nufus, temel.nufus, tur + ' nüfus bedeli değişmemeli');
    esit(b.ekonomi, temel.ekonomi, tur + ' ekonomi bedeli değişmemeli');
  }
});

test('SEFERBERLİK: parası SIFIR olan oyuncunun bile piyadesi ayağa kalkıyor', () => {
  const o = { sahip: BEN, birimler: { piyade: 5 }, yarali: { piyade: 5 } };

  // Dalsız: beş kuruşu olmayan hiçbir yaralıyı iyileştiremiyor.
  const dalsiz = toplanmaCoz(o, { nufus: 0, ekonomi: 0 }, false);
  esit(birimSayisi(dalsiz.iyilesen), 0, 'dal yokken bütçesiz iyileşme olmamalı');

  // Dallı: hepsi bedava iyileşiyor — Baki'nin "o tur direkt toparlansın" şartı.
  const dalli = toplanmaCoz(o, { nufus: 0, ekonomi: 0 }, true);
  esit(dalli.iyilesen.piyade, 5, 'beş yaralının hepsi iyileşmeli');
  esit(dalli.yeniOrdu.yarali, undefined, 'hiç yaralı kalmamalı');
  esit(dalli.harcanan.nufus, 0);
  esit(dalli.harcanan.ekonomi, 0);
});

test('SEFERBERLİK: ÖLEN birimin yerine koymayı ucuzlatmıyor', () => {
  // Dal yalnızca YARALIYA bakıyor. Kadrosu eksik ama yaralısı olmayan ordu, dal açıkken
  // de tam bedel ödemeli — yoksa dal "bedava ordu" hâline gelirdi.
  const o = { sahip: BEN, birimler: { piyade: 2 }, kadro: { piyade: 5 } };
  const s = toplanmaCoz(o, { nufus: 0, ekonomi: 0 }, true);
  esit(birimSayisi(s.dolan), 0, 'bütçesiz ölü yerine konamaz');
});

test('SEFERBERLİK: gösterilen bedel ile harcanan bedel AYNI', () => {
  // 2026-08-08'de kapatılan ayrışma: `toplanmaMaliyeti` indirimi hesaba katıyordu ama
  // `toplanmaCoz` katmıyordu. İkisi artık aynı yoldan geçiyor.
  const o = { sahip: BEN, birimler: { piyade: 3 }, yarali: { piyade: 3 } };
  const gosterilen = toplanmaMaliyeti({}, { piyade: 3 }, true);
  const s = toplanmaCoz(o, { nufus: 99, ekonomi: 99 }, true);
  esit(s.harcanan.nufus, gosterilen.nufus);
  esit(s.harcanan.ekonomi, gosterilen.ekonomi);
});

// ---- BAKİ'NİN İSTEĞİ (2026-07-31): SAĞLAMLAR SAVAŞMAYA DEVAM ETSİN ----

test('REZERVASYON: toplanma YALNIZCA yaralıları bağlar, sağlamlar savaşabilir', () => {
  let d = sahne();
  // 5 piyade, ikisi yaralı, kadro 6 (bir de ölü var).
  d = orduKoy(d, '16-1', BEN, { piyade: 5 }, { piyade: 6 }, null, { piyade: 2 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': BEN } };
  esit(birimSayisi(kullanilabilirBirimler(d, '16-1')), 5, 'emirden önce hepsi serbest');

  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  esit(birimSayisi(kullanilabilirBirimler(d, '16-1')), 3, 'yalnızca 2 yaralı bağlanmalı');
  dogru(
    hareketGecerliMi(d, BEN, '16-1', '16-3', { piyade: 3 }).ok,
    '3 sağlam birlik hâlâ hareket edebilmeli'
  );
  esit(
    hareketGecerliMi(d, BEN, '16-1', '16-3', { piyade: 4 }).kod,
    'hak',
    '4. birlik yaralı, gidemez'
  );
});

test('REZERVASYON: yalnızca ÖLÜ eksiği olan ordu tam güçle savaşabiliyor', () => {
  // Toplanma emri verildi ama sahada yaralı yok — takviye tur sonunda geliyor,
  // kimseyi meşgul etmiyor. Ordu tam güçle saldırabilmeli.
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 }, { piyade: 7 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': BEN } };
  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  esit(birimSayisi(kullanilabilirBirimler(d, '16-1')), 3, 'hiçbiri bağlanmamalı');
  dogru(hareketGecerliMi(d, BEN, '16-1', '16-3', { piyade: 3 }).ok);
});

test('REZERVASYON: sağlamları gönderdikten SONRA yaralılar toplanabiliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 5 }, { piyade: 5 }, null, { piyade: 2 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': BEN } };
  d = emret(d, BEN, '16-1', '16-3', { piyade: 3 }); // sağlamlar sefere
  const s = toplanmaEmriVer(d, BEN, '16-1');
  dogru(s.ok, 'geride kalan yaralılar toplanabilmeli: ' + s.sebep);
});

test('GÖREV 15: yaralı gidince geride toplanacak kimse kalmıyor', () => {
  // ⚠ ESKİ TEST "yaralılar hareket EMRİNDEYSE toplanma reddediliyor" diyordu; rezervasyon
  // kuyruktan geliyordu. Kuyruk kalktı: hamle anında çözülüyor, yani yaralı gerçekten
  // gidiyor. Kural aynı yere çıkıyor — gitmiş birlik toplanamaz — ama artık sebebi
  // "meşgul" değil, "orada değil".
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 5 }, { piyade: 5 }, null, { piyade: 2 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': BEN } };
  d = emret(d, BEN, '16-1', '16-3', { piyade: 5 }); // hepsi gitti (3 sağlam + 2 yaralı)
  esit(d.ordular['16-1'], undefined, 'kaynak boşalmalı');
  dogru(toplanmaEmriVer(d, BEN, '16-1').ok !== true, 'boş parçada toplanma emri kurulmamalı');

  // Yaralılar YERİNDE kalırsa toplanma hâlâ kurulabiliyor.
  let e = sahne();
  e = orduKoy(e, '16-1', BEN, { piyade: 5 }, { piyade: 5 }, null, { piyade: 2 });
  e = { ...e, parcaSahipligi: { ...e.parcaSahipligi, '16-1': BEN, '16-3': BEN } };
  e = emret(e, BEN, '16-1', '16-3', { piyade: 3 }); // yalnızca sağlamlar gitti
  dogru(toplanmaEmriVer(e, BEN, '16-1').ok, 'geride kalan yaralılar toplanabilmeli');
});

test('HAREKET: SAĞLAMLAR önce gider, yaralılar geride kalır', () => {
  const ordu = { sahip: BEN, birimler: { piyade: 5 }, yarali: { piyade: 2 } };
  const b = orduBol(ordu, { piyade: 3 });
  esit(birimSayisi(b.giden.yarali), 0, 'giden kuvvet tamamen sağlam olmalı');
  esit(b.kalan.yarali.piyade, 2, 'yaralılar geride');

  // Sağlamlardan fazlası isteniyorsa aradaki fark yaralılardan tamamlanır.
  const c = orduBol(ordu, { piyade: 4 });
  esit(c.giden.yarali.piyade, 1);
  esit(c.kalan.yarali.piyade, 1);
});

test('İPTAL: toplanma emri iptal edilebiliyor, kaynak harcanmamış oluyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 }, { piyade: 5 });
  d = paraVer(d, BEN, 50, 50);
  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  esit(kullanilabilirButce(d, BEN).nufus, 50 - 6, 'emir bütçeden düşüyor (ayrılmış)');

  d = emirKaldir(d, 0);
  esit(d.emirler.length, 0);
  esit(kullanilabilirButce(d, BEN).nufus, 50, 'iptalde ayrım geri geliyor');
  esit(d.aktorler[BEN].nufusHavuzu, 50, 'havuza hiç dokunulmamış olmalı');
  esit(birimSayisi(kullanilabilirBirimler(d, '16-1')), 2, 'birimler yeniden serbest');
});

test('TUR: toplanma TUR SONUNDA doluyor ve bedeli o an düşüyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 }, { piyade: 5 }, 6);
  d = paraVer(d, BEN, 50, 50);
  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  esit(d.aktorler[BEN].nufusHavuzu, 50, 'emir verirken havuza dokunulmaz');

  const gelir = aktorGeliri(d, BEN); // oyuncu ilinin TÜM parçalarına sahip
  const sonra = turuBitir(d, DURGUN);
  const o = sonra.ordular['16-1'];
  esit(o.birimler.piyade, 5, 'kadroya doldu');
  esit(o.kadro, undefined, 'artık eksiği yok');
  esit(o.hasarHavuzu, undefined, 'hasar havuzu sıfırlandı, alan yazılmadı');
  // Havuz: 50 + o turun geliri − 6 nüfus (3 piyade × 2) − 3 ekonomi
  yakin(sonra.aktorler[BEN].nufusHavuzu, 50 + gelir.nufus - 6, 1e-9, 'nüfus');
  yakin(sonra.aktorler[BEN].ekonomiHavuzu, 50 + gelir.ekonomi - 3, 1e-9, 'ekonomi');
  esit(sonra.emirler.length, 0, 'kuyruk boşaldı');
});

test('SORU 2/B: ordu O TUR YIPRANMIŞ hâliyle savunuyor, sonra doluyor', () => {
  let d = sahne();
  // Oyuncunun 16-3'teki ordusu 2 piyadeye düşmüş ama kadrosu 8.
  d = orduKoy(d, '16-3', BEN, { piyade: 2 }, { piyade: 8 });
  d = orduKoy(d, '11-1', '11', { piyade: 3 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-3': BEN, '11-1': '11' } };
  d = paraVer(d, BEN, 99, 99);
  d = toplanmaEmriVer(d, BEN, '16-3').durum;
  d = emret(d, '11', '11-1', '16-3', { piyade: 3 });

  const sonra = turuBitir(d, DURGUN);
  const muharebe = sonra.sonTurRaporu.satirlar.find((s) => s.tip === 'muharebe');
  dogru(muharebe, 'muharebe olmalı');
  esit(
    birimSayisi(muharebe.savunanGiren),
    2,
    'savunan muharebeye YIPRANMIŞ girmeli (8 değil) — toplanma çözümden sonra işler'
  );
});

test('SORU 2/B: ordu o tur İMHA olduysa hiçbir şey harcanmıyor', () => {
  function kur(emirVer) {
    let d = sahne();
    d = orduKoy(d, '16-3', BEN, { piyade: 1 }, { piyade: 9 });
    d = orduKoy(d, '11-1', '11', { zirhli: 5 });
    d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-3': BEN, '11-1': '11' } };
    d = paraVer(d, BEN, 99, 99);
    if (emirVer) d = toplanmaEmriVer(d, BEN, '16-3').durum;
    d = emret(d, '11', '11-1', '16-3', { zirhli: 5 });
    return turuBitir(d, DURGUN);
  }
  const emirli = kur(true);
  const emirsiz = kur(false);
  esit(emirli.ordular['16-3'].sahip, '11', 'savunan imha olmalı');
  yakin(
    emirli.aktorler[BEN].nufusHavuzu,
    emirsiz.aktorler[BEN].nufusHavuzu,
    1e-9,
    'para buharlaşmamalı'
  );
  const satir = emirli.sonTurRaporu.satirlar.find((s) => s.tip === 'toplanma');
  esit(satir.olmadi, 'ordu-yok');
});

test('TUR: bütçe yetmezse kısmen doluyor ve raporda ne kalmadığı yazıyor', () => {
  let d = sahne();
  // Eksik 19 piyade = 38 nüfus. Havuz sıfır; yalnızca o turun geliri kadarı dolabilir.
  d = orduKoy(d, '16-1', BEN, { piyade: 1 }, { piyade: 20 });
  d = paraVer(d, BEN, 0, 0);
  d = toplanmaEmriVer(d, BEN, '16-1').durum;
  const sonra = turuBitir(d, DURGUN);
  const o = sonra.ordular['16-1'];
  dogru(o.birimler.piyade > 1 && o.birimler.piyade < 20, 'kısmen dolmalı: ' + o.birimler.piyade);
  esit(kadroAl(o).piyade, 20, 'kadro durmalı — kalan eksik sonraki tur doldurulabilir');
  const satir = sonra.sonTurRaporu.satirlar.find((s) => s.tip === 'toplanma');
  dogru(satir.basilamayan, 'basılamayanlar raporda yazmalı');
});

// ---- İMHA ----

test('İMHA (§3.9/6): yok olan ordunun kaydı VE kadrosu tamamen siliniyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 1 }, { piyade: 9 }); // kadrosu şişkin, mevcudu 1
  d = orduKoy(d, '16-3', '11', { zirhli: 4 });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': BEN, '16-3': '11' } };
  d = emret(d, BEN, '16-1', '16-3', { piyade: 1 });
  const { durum } = emirleriCoz(d);
  esit(durum.ordular['16-1'], undefined, 'kaynak boşaldı, kayıt kalmamalı');
  const hedef = durum.ordular['16-3'];
  esit(hedef.sahip, '11', 'savunan tuttu');
  dogru(!hedef.kadro || hedef.kadro.piyade === undefined, 'imha olanın kadrosu taşınmaz');
});
