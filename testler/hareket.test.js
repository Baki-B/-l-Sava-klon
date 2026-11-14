// HAREKET, ÇÖZÜM VE FETİH TESTLERİ (Görev 05 / Adım 2–4).
//
// Asıl sorular: yalnızca sınırdaş parçaya gidiliyor mu, bir birim turda iki kez hareket
// edebiliyor mu, kısmi gönderimde geride kalan savunuyor mu, il ancak tüm parçaları
// alınınca mı el değiştiriyor, ganimet doğru mu, bozgunda çekilme kuralı sırayla mı
// işliyor, yok olan birimlerin nüfusu havuza dönüyor mu?
//
// SAHNE KURULUMU: oyun kurulup saha TEMİZLENİYOR (kuruluş garnizonları siliniyor) ve
// ordular elle konuyor. Sebep: bu testler kuralları ölçüyor, garnizon sayılarını değil;
// garnizonlar `testler/garnizon.test.js`'te sınanıyor.
//
// Kullanılan gerçek komşuluk (veri/parca-komsuluk.json):
//   16-1 Bursa Ovası (ova)      → 16-2, 16-3, 16-4          — başka ile sınırı YOK
//   16-3 Doğu (tepelik)         → 11-1, 16-1, 16-2, 16-4, 41-2, 43-2, 77-1
//   16-4 Uludağ Güneyi (dağlık) → 10-4, 16-1, 16-2, 16-3, 43-2
//   11-1 Bilecik (tepelik)      — Bilecik'in TEK parçası, il fethi için birebir
// Bursa ve Bilecik komşu İLLER, ama 16-1'den 11-1'e geçilemez: hareket İL komşuluğuna
// değil PARÇA komşuluğuna bakar (§7). Aşağıda bu ayrıca test ediliyor.

const { test, dogru, esit, yakin, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur, parcayiVer, aktorOzeti } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { parcaGeliri } = require('../src/oyun/uretim.js');
const { birimSayisi, parcaBirimSayisi } = require('../src/oyun/ordu.js');
const {
  hareketGecerliMi,
  hedefGecerliMi,
  gecerliHedefler,
  hedefleriAyir,
  emirKaldir,
  kullanilabilirBirimler,
  rezerveBirimler,
  parcaninEmirleri,
  savunmasizKalirMi,
  orduBol,
  komsuMu,
} = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { ozetCikar, emirleriCoz } = require('../src/oyun/cozum.js');
const { ilTamamMi, fetihGanimeti, parcayiFethet } = require('../src/oyun/fetih.js');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const TOHUM = 20260727;
const BEN = '16'; // oyuncu: Bursa

function sahne() {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  // Saha temiz (ordular elle konuyor) + BEN herkesle SAVAŞTA.
  // Görev 11'den beri barıştakine saldırılamıyor; bu dosya muharebe/fetih/çekilme
  // kurallarını ölçüyor, savaş hali onların ön koşulu. İlan kuralının kendisi
  // diplomasi.test.js'te sınanıyor.
  return hepsiyleSavas({ ...d, ordular: {} }, BEN);
}

function orduKoy(d, pid, sahip, birimler, havuz) {
  const o = { sahip, birimler };
  if (havuz) o.hasarHavuzu = havuz;
  return { ...d, ordular: { ...d.ordular, [pid]: o } };
}

function paraVer(d, aktorId, nufus) {
  return {
    ...d,
    aktorler: { ...d.aktorler, [aktorId]: { ...d.aktorler[aktorId], nufusHavuzu: nufus } },
  };
}

// ---- GÖREV 15: HAMLE VERİLDİĞİ AN ÇÖZÜLÜYOR ----
// Eskiden `emret` kuyruğa yazar, `coz` tur sonunu taklit ederdi. Artık `hamleUygula`
// doğrulayıp hemen çözüyor. İki yardımcı korunuyor ki testlerin okunuşu değişmesin:
// `emret` hamleyi yapar ve satırları biriktirir, `coz` o satırları eski rapor biçiminde
// geri verir.
let sonSatirlar = [];
function emret(d, kaynak, hedef, birimler, aktorId) {
  const s = hamleUygula(d, aktorId || BEN, kaynak, hedef, birimler);
  dogru(s.ok, 'emir kurulamadı: ' + s.sebep);
  sonSatirlar = sonSatirlar.concat(s.satirlar);
  return s.durum;
}
function coz(d) {
  const satirlar = sonSatirlar;
  sonSatirlar = [];
  return { durum: d, rapor: { tur: d.tur, satirlar, ozet: ozetCikar(satirlar) } };
}

// ---- KOMŞULUK (§7) ----

test('KOMŞULUK: yalnızca sınırdaş parçaya hareket edilebiliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  esit(hareketGecerliMi(d, BEN, '16-3', '11-1', { piyade: 1 }).ok, true, 'komşuya gidilmeli');
  esit(hareketGecerliMi(d, BEN, '16-3', '10-1', { piyade: 1 }).kod, 'komsuluk', 'uzak parçaya');
});

test('KOMŞULUK: İL komşuluğu bir hareket kuralı DEĞİL', () => {
  // Bursa ile Bilecik komşu iller ama 16-1 ile 11-1 sınırdaş parçalar değil.
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  dogru(!komsuMu('16-1', '11-1'), 'veri değişmiş: 16-1 ile 11-1 komşu görünüyor');
  esit(hareketGecerliMi(d, BEN, '16-1', '11-1', { piyade: 1 }).kod, 'komsuluk');
});

test('KOMŞULUK: gecerliHedefler yalnızca komşuluk listesinden çıkıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  const hedefler = gecerliHedefler(d, BEN, '16-3');
  dogru(hedefler.length > 0, 'hiç hedef bulunamadı');
  for (const h of hedefler) dogru(komsuMu('16-3', h), h + ' komşu değil ama hedef sayıldı');
});

test('TEK KAYNAK KURALI: arayüzün sorduğu ile motorun cevabı aynı', () => {
  // Arayüz "bu hedef seçilebilir mi" diye `hedefGecerliMi`ye sorar, motor emri
  // `hareketGecerliMi` ile sınar. İkisi ayrışırsa oyuncu seçebildiği hedefe emir
  // veremez. Görev 04'te `eklenebilirMi`/`siparisGecerliMi` bu yüzden testle kilitlenmişti.
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 2, zirhli: 1 });
  d = orduKoy(d, '11-1', '11', { topcu: 2 });
  const tumParcalar = Object.keys(d.parcaSahipligi);
  let sinanan = 0;
  for (const hedef of tumParcalar) {
    const secilebilir = hedefGecerliMi(d, BEN, '16-3', hedef).ok;
    const emirVerilebilir = hareketGecerliMi(d, BEN, '16-3', hedef, {
      piyade: 2,
      zirhli: 1,
    }).ok;
    esit(secilebilir, emirVerilebilir, hedef + ' için iki kontrol ayrıştı');
    sinanan++;
  }
  esit(sinanan, 181, 'tüm parçalar taranmalı');
});

// ---- SAHİPLİK VE KAPSAM ----

test('SAHİPLİK: başkasının parçasından emir verilemez', () => {
  let d = sahne();
  d = orduKoy(d, '11-1', '11', { piyade: 3 });
  esit(hareketGecerliMi(d, BEN, '11-1', '16-3', { piyade: 1 }).kod, 'sahiplik');
});

test('SAHİPLİK: kendi parçan ama ordun yoksa emir verilemez', () => {
  const d = sahne();
  esit(hareketGecerliMi(d, BEN, '16-1', '16-2', { piyade: 1 }).kod, 'sahiplik');
});

test('KAPSAM: senaryo dışı parçaya hareket edilemez', () => {
  let d = oyunKur({ senaryo: 'karadeniz', tohum: TOHUM });
  d = { ...d, ordular: {} };
  const oyuncu = d.oyuncuAktorId;
  const icerideki = Object.keys(d.parcaSahipligi).find((p) => d.parcaSahipligi[p] === oyuncu);
  d = orduKoy(d, icerideki, oyuncu, { piyade: 3 });
  // Bursa Karadeniz senaryosunda yok.
  esit(hareketGecerliMi(d, oyuncu, icerideki, '16-1', { piyade: 1 }).kod, 'kapsam');
});

test('KUVVET: boş emir reddediliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  esit(hareketGecerliMi(d, BEN, '16-1', '16-2', {}).kod, 'kuvvet');
});

// ---- HAMLE HAKKI = DEFTER (Görev 15) ----
// Rezervasyon kalktı: hamle anında çözülüyor, hak `ordu.hamle` defterinde tutuluyor.
// Piyade ve topçu turda BİR, zırhlı İKİ kez hareket eder (DENGE.HAREKET.HAMLE_HAKKI).

test('HAMLE HAKKI: piyade vardığı yerden aynı tur bir daha gidemez', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '16-1', { piyade: 3 }); // hepsi gitti, kaynak boşaldı
  esit(parcaBirimSayisi(d, '16-1'), 3, 'birlikler hedefe geçmeli');
  esit(hareketGecerliMi(d, BEN, '16-3', '16-2', { piyade: 1 }).kod, 'sahiplik', 'kaynak boş');
  esit(hareketGecerliMi(d, BEN, '16-1', '16-2', { piyade: 1 }).kod, 'hak', 'ikinci hamle');
  esit(birimSayisi(kullanilabilirBirimler(d, '16-1')), 0, 'hakkı kalan birim olmamalı');
});

test('HAMLE HAKKI: kısmen gönderilince kalanı hâlâ emredilebilir', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '16-1', { piyade: 1 });
  esit(kullanilabilirBirimler(d, '16-3').piyade, 2, 'kalan');
  esit(hareketGecerliMi(d, BEN, '16-3', '16-2', { piyade: 2 }).ok, true);
  esit(hareketGecerliMi(d, BEN, '16-3', '16-2', { piyade: 3 }).kod, 'hak', 'fazlası');
});

test('HAMLE HAKKI: hamle kuyruğa girmiyor — iptal edilecek emir kalmıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '16-1', { piyade: 3 });
  esit(d.emirler.length, 0, 'hareket emri kuyrukta beklememeli');
  esit(parcaninEmirleri(d, '16-3').length, 0, 'parçanın bekleyen emri olmamalı');
});

test('HAMLE HAKKI: toplanmaya ayrılmış yaralı gönderilemiyor, sebebi ayrı söyleniyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  // Toplanma emri kuyrukta kalan TEK emir türü; rezervasyon oradan geliyor.
  d = { ...d, emirler: [{ tip: 'toplanma', sahip: BEN, kaynak: '16-3', birimler: { piyade: 3 } }] };
  const g = hareketGecerliMi(d, BEN, '16-3', '16-1', { piyade: 1 });
  esit(g.kod, 'hak', 'reddedilmeli');
  dogru(g.sebep.includes('toplanma'), 'sebep toplanmayı söylemeli: ' + g.sebep);
});

test('HAMLE HAKKI: tur bitince defter siliniyor, hak yenileniyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  d = emret(d, '16-1', '16-2', { piyade: 3 });
  esit(kullanilabilirBirimler(d, '16-2').piyade, undefined, 'bu tur hakkı yok');
  d = turuBitir(d, DURGUN);
  esit(d.ordular['16-2'].hamle, undefined, 'defter silinmeli');
  esit(kullanilabilirBirimler(d, '16-2').piyade, 3, 'varılan yerden yeni emir verilebilmeli');
});

// ---- İKİNCİ HAMLE ARTIK ZIRHLININ HAKKI (Görev 15, Baki 2026-09-19) ----
// Görev 11'de hak birim türüne bakmadan ikiydi ve zincir emriyle veriliyordu. Artık
// hak türe göre ve ikinci hamle FİİLEN VARILAN parçadan veriliyor.

test('İKİNCİ HAMLE: zırhlı fethettiği parçadan aynı tur devam edebiliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { zirhli: 4 });
  d = emret(d, '16-3', '11-1', { zirhli: 4 }); // boş düşman parçası — anında fetih
  esit(d.parcaSahipligi['11-1'], BEN, 'parça hemen el değiştirmeli');
  esit(parcaBirimSayisi(d, '11-1'), 4, 'ordu oraya geçmeli');

  // Baki'nin kararı: ikinci hamle ikinci bir SALDIRI da olabilir.
  const g = hareketGecerliMi(d, BEN, '11-1', '43-1', { zirhli: 4 });
  dogru(g.ok, 'ikinci hamle reddedildi: ' + g.sebep);

  // Ama üçüncü hamle yok: iki hamlesini harcayan zırhlı durur.
  const ikinci = emret(d, '11-1', '43-1', { zirhli: 4 });
  esit(hareketGecerliMi(ikinci, BEN, '43-1', '43-2', { zirhli: 1 }).kod, 'hak', 'üçüncü hamle');
});

// ---- ⚠ REGRESYON: MUHAREBEDEN SAĞ ÇIKAN HAKKINI GERİ KAZANMAZ (2026-09-20) ----
// Baki telefonda yakaladı: *"piyade ile 2 kere hareket edip 1 piyadeyle 2 yer ele
// geçirdim."* Sebep `cozum.js`'te muharebe sonrası ordunun SIFIRDAN kurulması ve `hamle`
// alanının taşınmamasıydı. Boş parçaya yürüyüşte hata yoktu — yalnızca SAVAŞ yolunda.
// Bu test o yolu kilitliyor.

test('REGRESYON: muharebe kazanan piyade aynı tur BİR DAHA saldıramaz', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 6 });
  d = orduKoy(d, '11-1', '11', { piyade: 1 }); // zayıf savunma: muharebe olur ve kazanılır
  d = emret(d, '16-3', '11-1', { piyade: 6 });
  esit(d.parcaSahipligi['11-1'], BEN, 'muharebe kazanılıp parça alınmalı');
  dogru(d.ordular['11-1'] && d.ordular['11-1'].hamle, 'kazanan ordunun defteri taşınmalı');
  esit(
    hareketGecerliMi(d, BEN, '11-1', '43-1', { piyade: 1 }).kod,
    'hak',
    'muharebeden çıkan piyade hakkını geri kazandı'
  );
});

test('REGRESYON: muharebe kazanan zırhlının İKİNCİ hakkı duruyor, üçüncüsü yok', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { zirhli: 6 });
  d = orduKoy(d, '11-1', '11', { piyade: 1 });
  d = emret(d, '16-3', '11-1', { zirhli: 6 });
  esit(d.parcaSahipligi['11-1'], BEN, 'parça alınmalı');
  dogru(hareketGecerliMi(d, BEN, '11-1', '43-1', { zirhli: 6 }).ok, 'ikinci hamle olmalı');
  const ikinci = emret(d, '11-1', '43-1', { zirhli: 6 });
  esit(
    hareketGecerliMi(ikinci, BEN, '43-1', '43-2', { zirhli: 1 }).kod,
    'hak',
    'üçüncü hamle doğdu'
  );
});

test('İKİNCİ HAMLE: piyade fethettiği parçadan devam EDEMEZ', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 4 });
  d = emret(d, '16-3', '11-1', { piyade: 4 });
  esit(d.parcaSahipligi['11-1'], BEN, 'parça alınmalı');
  esit(
    hareketGecerliMi(d, BEN, '11-1', '43-1', { piyade: 1 }).kod,
    'hak',
    'piyadenin tek hakkı var'
  );
});

test('İKİNCİ HAMLE: taze birlik gider, yorgun kaynakta kalır', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { zirhli: 2 });
  d = emret(d, '16-3', '16-1', { zirhli: 2 }); // ikisi de bir hamle harcadı
  d = orduKoy(d, '16-1', BEN, { ...d.ordular['16-1'].birimler, piyade: 2 });
  // 16-1'de artık 2 yorgun zırhlı + 2 taze piyade var; piyadeler gidebilir.
  esit(kullanilabilirBirimler(d, '16-1').piyade, 2, 'taze piyade gidebilmeli');
});

// ---- TAŞIMA / SALDIRI AYRIMI (2026-07-30) ----

test('AYRIM: hedefler SAHİPLİĞE göre dost ve düşman diye bölünüyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 4 });
  const a = hedefleriAyir(d, BEN, '16-3');
  // 16-3'ün komşuları: 11-1, 16-1, 16-2, 16-4, 41-2, 43-2, 77-1 → üçü Bursa'nın.
  esit(a.dost.sort().join(','), '16-1,16-2,16-4', 'kendi parçaları');
  dogru(a.dusman.length > 0, 'düşman parçası da olmalı');
  for (const h of a.dost) esit(d.parcaSahipligi[h], BEN, h + ' dost sayıldı ama senin değil');
  for (const h of a.dusman) dogru(d.parcaSahipligi[h] !== BEN, h + ' düşman sayıldı ama senin');
});

test('AYRIM: ikisinin toplamı geçerli hedeflerin TAMAMI (hedef kaybolmuyor)', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 4 });
  const a = hedefleriAyir(d, BEN, '16-3');
  const hepsi = gecerliHedefler(d, BEN, '16-3');
  esit(a.dost.length + a.dusman.length, hepsi.length, 'toplam eşleşmeli');
  for (const h of hepsi)
    dogru(a.dost.includes(h) || a.dusman.includes(h), h + ' iki listeden birinde olmalı');
});

test('AYRIM: BOŞ düşman parçası da SALDIRI sayılıyor (toprak el değiştiriyor)', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 4 });
  // 11-1'de hiç ordu yok ama Bilecik'in; burası taşıma değil saldırıdır.
  esit(parcaBirimSayisi(d, '11-1'), 0, 'sahne kurulumu: 11-1 boş olmalı');
  dogru(hedefleriAyir(d, BEN, '16-3').dusman.includes('11-1'), 'boş düşman parçası saldırı');
  dogru(!hedefleriAyir(d, BEN, '16-3').dost.includes('11-1'), 'taşıma listesine girmemeli');
});

test('AYRIM: emredilecek birim yoksa iki liste de boş kalır', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 2 });
  d = emret(d, '16-3', '11-1', { piyade: 2 }); // hepsi rezerve
  const a = hedefleriAyir(d, BEN, '16-3');
  esit(a.dost.length, 0, 'dost');
  esit(a.dusman.length, 0, 'düşman');
});

// ---- SAVUNMASIZ BIRAKMA UYARISI (§4.4'ün borcu) ----

test('UYARI: bütün ordu gönderilir ve düşmana sınırdaşsa uyarı çıkıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 }); // 16-3 düşman parçalarına sınırdaş
  dogru(savunmasizKalirMi(d, BEN, '16-3', { piyade: 3 }), 'uyarı çıkmalı');
  dogru(!savunmasizKalirMi(d, BEN, '16-3', { piyade: 2 }), 'geride birim kalınca çıkmamalı');
});

test('UYARI: iç parçada (düşman sınırı yoksa) uyarı çıkmıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 }); // 16-1'in komşuları hep Bursa
  dogru(!savunmasizKalirMi(d, BEN, '16-1', { piyade: 3 }), 'iç parçada uyarı olmamalı');
});

test('UYARI ENGELLEMEZ: uyarı çıkan emir yine de verilebiliyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  esit(hareketGecerliMi(d, BEN, '16-3', '11-1', { piyade: 3 }).ok, true);
});

// ---- ORDU BÖLME VE HASAR HAVUZU (boşluk 7) ----

test('BÖLME: hasar havuzu birim sayısına ORANLA bölünüyor', () => {
  const ordu = { sahip: BEN, birimler: { piyade: 4 }, hasarHavuzu: 20 };
  const b = orduBol(ordu, { piyade: 1 });
  yakin(b.giden.hasarHavuzu, 5, 1e-9, 'giden pay');
  yakin(b.kalan.hasarHavuzu, 15, 1e-9, 'kalan pay');
  esit(b.kalan.birimler.piyade, 3, 'kalan birim');
});

test('BÖLME: hepsi giderse geride kayıt kalmıyor', () => {
  const b = orduBol({ sahip: BEN, birimler: { piyade: 2 }, hasarHavuzu: 9 }, { piyade: 2 });
  esit(b.kalan, null, 'boş parça kayıt tutmamalı');
  yakin(b.giden.hasarHavuzu, 9, 1e-9);
});

test('BÖLME: "yarısını gönder, hasarı geride bırak" sömürüsü kapalı', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 4 }, 20);
  d = emret(d, '16-1', '16-2', { piyade: 2 });
  const s = coz(d);
  yakin(s.durum.ordular['16-1'].hasarHavuzu, 10, 0.01, 'geride kalan havuz');
  yakin(s.durum.ordular['16-2'].hasarHavuzu, 10, 0.01, 'giden havuz');
});

// ---- MUHAREBESİZ HAREKET ----

test('BOŞ PARÇAYA GİRİŞ: muharebe yok, parça el değiştiriyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '11-1', { piyade: 3 });
  const s = coz(d);
  esit(s.rapor.satirlar[0].tip, 'giris', 'muharebe olmamalı');
  esit(s.durum.parcaSahipligi['11-1'], BEN, 'parça alınmalı');
  esit(parcaBirimSayisi(s.durum, '11-1'), 3, 'ordu hedefe geçmeli');
  esit(s.durum.ordular['16-3'], undefined, 'kaynak boşalmalı');
});

test('DOST PARÇAYA TAKVİYE: ordular birleşiyor, fetih sayılmıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 });
  d = orduKoy(d, '16-2', BEN, { topcu: 1 });
  d = emret(d, '16-1', '16-2', { piyade: 2 });
  const s = coz(d);
  esit(s.rapor.satirlar[0].fethedildi, false, 'kendi parçan fetih değil');
  esit(s.durum.ordular['16-2'].birimler.piyade, 2, 'piyade geldi');
  esit(s.durum.ordular['16-2'].birimler.topcu, 1, 'topçu duruyor');
});

test('KISMİ GÖNDERİM: geride kalanlar parçayı savunuyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 4 });
  d = orduKoy(d, '11-1', '11', { piyade: 1 });
  d = emret(d, '16-3', '11-1', { piyade: 2 });
  const s = coz(d);
  esit(parcaBirimSayisi(s.durum, '16-3'), 2, 'geride kalanlar yerinde durmalı');
  esit(s.durum.ordular['16-3'].sahip, BEN, 've hâlâ savunuyor olmalı');
});

// ---- MUHAREBE VE FETİH ----

test('FETİH: muharebe kazanılınca parça el değiştiriyor, kalanlar hedefe geçiyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 6 });
  d = orduKoy(d, '11-1', '11', { piyade: 1 });
  d = emret(d, '16-3', '11-1', { piyade: 6 });
  const s = coz(d);
  const satir = s.rapor.satirlar[0];
  esit(satir.tip, 'muharebe');
  esit(satir.kazanan, 'saldiran');
  esit(s.durum.parcaSahipligi['11-1'], BEN, 'fetih');
  dogru(parcaBirimSayisi(s.durum, '11-1') > 0, 'hayatta kalanlar hedefe geçmeli');
  esit(s.durum.ordular['11-1'].sahip, BEN, 'sahibi');
});

test('FETİH: kaybedilen muharebede parça el değiştirmiyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 1 });
  d = orduKoy(d, '11-1', '11', { zirhli: 3 });
  d = emret(d, '16-3', '11-1', { piyade: 1 });
  const s = coz(d);
  esit(s.rapor.satirlar[0].kazanan, 'savunan');
  esit(s.durum.parcaSahipligi['11-1'], '11', 'parça savunanda kalmalı');
});

test('GANİMET: fetihte parçanın nüfus payının %60ı kadar TEK SEFERLİK nüfus geliyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 0);
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '11-1', { piyade: 3 });
  const s = coz(d);
  // GANİMET TAM SAYIYA YUVARLANIR (2026-07-31, Baki: "ondalıklı hiçbir şey istemiyorum").
  // Ham oran %60; sonuç en az 1 olacak şekilde yuvarlanıyor — bir parçayı fethetmek her
  // zaman gözle görülür bir şey kazandırmalı.
  const ham = parcaGeliri('11-1').nufus * DENGE.FETIH.NUFUS_ORANI;
  const beklenen = Math.max(1, Math.round(ham));
  esit(s.durum.aktorler[BEN].nufusHavuzu, beklenen, 'ganimet');
  esit(fetihGanimeti('11-1'), beklenen, 'ganimet hesabı');
  esit(beklenen % 1, 0, 'ganimet TAM SAYI olmalı');
  dogru(beklenen > 0, 'ganimet sıfır çıkmamalı');
});

test('GANİMET: oran denge.jsten okunuyor (koda gömülü değil)', () => {
  const eski = DENGE.FETIH.NUFUS_ORANI;
  const once = fetihGanimeti('11-1');
  DENGE.FETIH.NUFUS_ORANI = eski * 2;
  const sonra = fetihGanimeti('11-1');
  DENGE.FETIH.NUFUS_ORANI = eski;
  yakin(sonra, once * 2, 1e-9, 'oran değişince ganimet de değişmeli');
});

test('GANİMET: aynı parça iki kez alınırsa iki kez veriyor (bilinçli)', () => {
  // Sürekli el değiştiren cephe, her seferinde yeni bir seferberlik demektir.
  let d = sahne();
  d = paraVer(d, BEN, 0);
  const bir = parcayiFethet(d, '11-1', BEN);
  const geri = parcayiFethet(bir.durum, '11-1', '11');
  const iki = parcayiFethet(geri.durum, '11-1', BEN);
  yakin(iki.durum.aktorler[BEN].nufusHavuzu, fetihGanimeti('11-1') * 2, 1e-9);
});

test('GANİMET: zaten senin olan parça ganimet vermiyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 0);
  const f = parcayiFethet(d, '16-1', BEN);
  esit(f.fethedildi, false);
  esit(f.ganimet, 0);
  esit(f.durum.aktorler[BEN].nufusHavuzu, 0);
});

// ---- İL EL DEĞİŞTİRMESİ (§7) ----

test('İL: ancak TÜM parçaları alınınca el değiştiriyor', () => {
  let d = sahne();
  // Balıkesir'in (10) parçaları — biri hariç hepsi bende.
  const balikesir = Object.keys(d.parcaSahipligi).filter((p) => p.startsWith('10-'));
  dogru(balikesir.length >= 2, 'çok parçalı il gerekli');
  for (const p of balikesir.slice(0, -1)) d = parcayiVer(d, p, BEN);
  const son = balikesir[balikesir.length - 1];

  dogru(!ilTamamMi(d, '10', BEN), 'eksik parçayla il tamam sayılmamalı');
  const f = parcayiFethet(d, son, BEN);
  dogru(ilTamamMi(f.durum, '10', BEN), 'son parça alınınca il tamam olmalı');
  esit(f.ilTamamlandi, true, 'rapor "il tamamlandı" demeli');
});

test('İL: tek parçalı ilde fetih ili de tamamlıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  d = emret(d, '16-3', '11-1', { piyade: 3 });
  const s = coz(d);
  esit(s.rapor.satirlar[0].ilTamamlandi, true, 'Bilecik tek parçalı');
  esit(aktorOzeti(s.durum, BEN).tamIl, 2, 'Bursa + Bilecik');
});

test('İL: aynı fetih ili ikinci kez "tamamlandı" saymıyor', () => {
  let d = sahne();
  const f = parcayiFethet(d, '11-1', BEN);
  esit(f.ilTamamlandi, true);
  const g = parcayiFethet(f.durum, '11-1', BEN); // zaten onun
  esit(g.ilTamamlandi, false);
});

// ---- BOZGUN VE ÇEKİLME (§3.9) ----

test('ÇEKİLME: bozulan saldıran ÇIKTIĞI parçaya dönüyor ve 1 birim daha kaybediyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 6 });
  d = orduKoy(d, '11-1', '11', { zirhli: 3 });
  d = emret(d, '16-3', '11-1', { piyade: 5 }); // 1 piyade geride kalsın (parça bizde kalsın)
  const s = coz(d);
  const satir = s.rapor.satirlar[0];
  esit(satir.kazanan, 'savunan', 'bu kuvvetle saldırı kırılmalı');
  if (satir.sebep === 'bozgun') {
    esit(satir.cekilme.taraf, 'saldiran');
    esit(satir.cekilme.kayip, DENGE.MUHAREBE.CEKILME_KAYBI, 'çekilme kaybı');
    if (!satir.cekilme.yokOldu) esit(satir.cekilme.hedef, '16-3', 'çıktığı parçaya dönmeli');
  }
});

test('ÇEKİLME: gidecek yer yoksa ordu YOK OLUYOR', () => {
  let d = sahne();
  // 11-1 tamamen kuşatılmış: komşularının hiçbiri Bilecik'in değil ve tek parçalı il.
  d = orduKoy(d, '11-1', '11', { piyade: 4 });
  d = orduKoy(d, '16-3', BEN, { zirhli: 6 });
  d = emret(d, '16-3', '11-1', { zirhli: 6 });
  const s = coz(d);
  const satir = s.rapor.satirlar[0];
  esit(satir.kazanan, 'saldiran');
  if (satir.cekilme) {
    esit(satir.cekilme.taraf, 'savunan');
    esit(satir.cekilme.yokOldu, true, 'çekilecek dost parçası yok, ordu yok olmalı');
  }
  esit(s.durum.ordular['11-1'].sahip, BEN, 'parça ve üstündeki ordu saldırana geçmeli');
});

test('ÇEKİLME: kaynak elden çıkmışsa EN ÇOK BİRİMİ olan dost komşuya çekiliyor', () => {
  let d = sahne();
  // Savunan Bursa; 16-4 düşüyor, komşularından 16-1'de 5, 16-2'de 1 birim var.
  d = orduKoy(d, '16-4', BEN, { piyade: 4 });
  d = orduKoy(d, '16-1', BEN, { piyade: 5 });
  d = orduKoy(d, '16-2', BEN, { piyade: 1 });
  d = parcayiVer(d, '43-2', '43');
  d = orduKoy(d, '43-2', '43', { zirhli: 8 });
  d = emret(d, '43-2', '16-4', { zirhli: 8 }, '43');
  const s = coz(d);
  const satir = s.rapor.satirlar[0];
  esit(satir.kazanan, 'saldiran', 'savunma kırılmalı');
  if (satir.cekilme && !satir.cekilme.yokOldu)
    esit(satir.cekilme.hedef, '16-1', 'en kalabalık dost komşuya çekilmeli');
});

// ---- YARMA: BOZGUNA UĞRAYAN ORDU ÇEKİLEMİYOR (2026-08-08, Baki) ----
//
// > *"Yendiği düşmanlar yaralanmasın, direkt yok olsunlar; toparlanmaya izin vermesin."*
//
// Ölçüt tek cümle: AYNI muharebe, yalnızca kazanan tarafın zırhlı araştırması farklı.
// Dalsızken bozulan ordu kaynağına çekiliyor, dallıyken yok oluyor.

function yarmaVer(durum, aktorId) {
  return { ...durum, arastirma: { ...(durum.arastirma || {}), [aktorId]: { 'zirhli.yarma': 1 } } };
}

function yarmaSahnesi(dalli) {
  // Kuvvetler ÖLÇÜMLE seçildi (6 topçu → 8 zırhlı, Bursa 16-4). İki şart birden gerekiyor:
  //   1. Kaybeden taraf BOZULMALI, imha OLMAMALI — imha edilen orduda çekilme diye bir
  //      aşama yoktur, yani yarmanın etkisi ölçülemez.
  //   2. Kaybedenin gidecek dost parçası OLMALI (saldıran için çıktığı 43-2) — yoksa ordu
  //      yarma olmadan da yok olur ve test hiçbir şey kanıtlamaz.
  // Burada SALDIRAN bozuluyor, yani yarmayı SAVUNAN (BEN) kullanıyor. Dal iki tarafta da
  // aynı yoldan geçiyor (`cozum.js` ikisi için de aynı `cekil` çağrısını yapıyor).
  let d = sahne();
  //   3. Kaybeden BOZULMALI, "süre doldu" ile bitmemeli — yarma yalnızca bozgunda işliyor
  //      (2026-08-08: raunt tavanı geldi, küçük savaşlar bozgunsuz bitebiliyor).
  d = orduKoy(d, '16-4', BEN, { zirhli: 8 });
  d = parcayiVer(d, '43-2', '43');
  d = orduKoy(d, '43-2', '43', { topcu: 6 });
  // ⚠ GÖREV 15: DAL HAMLEDEN ÖNCE VERİLİYOR. Hamle artık verildiği an çözüldüğü için
  // muharebeden sonra dal eklemenin hiçbir etkisi olmaz — eskiden kuyruk sayesinde
  // sahneyi kurup sonra dal vermek işe yarıyordu.
  if (dalli) d = yarmaVer(d, BEN);
  return emret(d, '43-2', '16-4', { topcu: 6 }, '43');
}

test('YARMA: dal YOKKEN bozulan ordu çıktığı parçaya çekiliyor (taban davranış)', () => {
  const satir = coz(yarmaSahnesi()).rapor.satirlar[0];
  esit(satir.kazanan, 'savunan');
  esit(satir.cekilme.taraf, 'saldiran');
  esit(satir.cekilme.yokOldu, false, 'gidecek yeri var, yok olmamalı');
  esit(satir.cekilme.hedef, '43-2');
});

test('YARMA: dal VARKEN bozulan ordu çekilemiyor, YOK OLUYOR', () => {
  const satir = coz(yarmaSahnesi(true)).rapor.satirlar[0];
  esit(satir.kazanan, 'savunan');
  esit(satir.cekilme.yokOldu, true, 'yarma varken çekilme olmamalı');
  esit(satir.cekilme.hedef, null, 'gidecek yer yazılmamalı');
  dogru(satir.cekilme.kayip >= 1, 'ordunun tamamı kayıp sayılmalı');
});

test('YARMA: kaçan ordu kaynağına HİÇ DÖNMÜYOR (toparlanacak kadro kalmıyor)', () => {
  // Baki'nin "toparlanmaya izin vermesin" şartının gerçek ölçüsü bu: dalsızken çekilen
  // ordu 43-2'de duruyor ve sonraki tur toplanabiliyor, dallıyken orada hiçbir şey yok.
  const say = (s) => birimSayisi(((s.durum.ordular || {})['43-2'] || {}).birimler || {});
  dogru(say(coz(yarmaSahnesi())) > 0, 'dalsızken çekilen ordu kaynağında durmalı');
  esit(say(coz(yarmaSahnesi(true))), 0, 'dallıyken kaynakta ordu kalmamalı');
});

test('KAYIP KALICI: yok olan birimlerin nüfusu havuza DÖNMÜYOR (§3.9/6)', () => {
  let d = sahne();
  d = paraVer(d, BEN, 100);
  d = orduKoy(d, '16-3', BEN, { piyade: 5 });
  d = orduKoy(d, '11-1', '11', { zirhli: 4 });
  d = emret(d, '16-3', '11-1', { piyade: 5 });
  const s = coz(d);
  const satir = s.rapor.satirlar[0];
  dogru(satir.saldiranKayip > 0, 'kayıp olmalı');
  esit(satir.kazanan, 'savunan', 'saldırı kırılmalı ki ganimet karışmasın');
  esit(s.durum.aktorler[BEN].nufusHavuzu, 100, 'kaybedilen birimler nüfus iade etmemeli');
});

// ---- ARAZİ VE MORAL BONUSLARI ÇÖZÜME BAĞLI MI (boşluk 6) ----

test('ARAZİ: aynı kuvvet dağlık parçada ovadakinden daha zor kırılıyor', () => {
  function saldir(hedef) {
    let d = sahne();
    d = orduKoy(d, '16-3', BEN, { zirhli: 3 });
    d = parcayiVer(d, hedef, '43');
    d = orduKoy(d, hedef, '43', { piyade: 4 });
    d = emret(d, '16-3', hedef, { zirhli: 3 });
    return coz(d).rapor.satirlar[0];
  }
  const ova = saldir('16-2'); // ova
  const daglik = saldir('16-4'); // dağlık
  dogru(
    daglik.saldiranKayip >= ova.saldiranKayip,
    'dağlıkta saldıran en az ova kadar kayıp vermeli'
  );
  dogru(daglik.savunanKalan >= ova.savunanKalan, 'dağlıkta savunan daha çok kalmalı');
});

// ---- TUR DÖNGÜSÜNDEKİ YER ----

test('TUR: gelir ÖNCE hesaplanıyor — fethedilen parça o tur gelir vermiyor', () => {
  let d = sahne();
  d = paraVer(d, BEN, 0);
  d = { ...d, aktorler: { ...d.aktorler, [BEN]: { ...d.aktorler[BEN], ekonomiHavuzu: 0 } } };
  d = orduKoy(d, '16-3', BEN, { piyade: 3 });
  const oncekiGelir = Object.keys(d.parcaSahipligi)
    .filter((p) => d.parcaSahipligi[p] === BEN)
    .reduce((a, p) => a + parcaGeliri(p).ekonomi, 0);
  d = emret(d, '16-3', '11-1', { piyade: 3 });
  d = turuBitir(d, DURGUN);
  esit(d.parcaSahipligi['11-1'], BEN, 'parça alınmış olmalı');
  yakin(d.aktorler[BEN].ekonomiHavuzu, oncekiGelir, 1e-9, 'ekonomi FETİHTEN ÖNCEKİ topraktan');
});

test('TUR: rapor tur sonunda duruyor, emir yoksa null', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  esit(turuBitir(d, DURGUN).sonTurRaporu, null, 'emir yokken rapor olmamalı');
  d = emret(d, '16-1', '16-2', { piyade: 3 });
  const sonra = turuBitir(d, DURGUN);
  dogru(sonra.sonTurRaporu !== null, 'emir varken rapor olmalı');
  esit(sonra.sonTurRaporu.satirlar.length, 1);
  esit(sonra.sonTurRaporu.ozet.emir, 1);
});

// ---- DAYANIKLILIK ----

test('ÇÖZÜM: gelen durum DEĞİŞMİYOR (yeni durum dönüyor)', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 3 });
  d = emret(d, '16-1', '16-2', { piyade: 3 });
  const kopya = JSON.stringify(d);
  coz(d);
  esit(JSON.stringify(d), kopya, 'çözüm eski durumu değiştirmemeli');
});

test('ÇÖZÜM: dayanaksız emir İPTAL satırı yazıyor, çökmüyor', () => {
  // ⚠ GÖREV 15: oyunda artık dayanaksız emir DOĞMUYOR (hamle anında çözülüyor, arada
  // dünya değişmiyor). Kontrol yine de duruyor: bozuk bir kayıt ya da ileride doğacak
  // beklemeli bir emir türü motoru çökertmemeli. O yüzden emir kuyruğa ELLE konuyor.
  let d = sahne();
  d = { ...d, emirler: [{ sahip: BEN, kaynak: '16-3', hedef: '11-1', birimler: { piyade: 3 } }] };
  const s = emirleriCoz(d);
  esit(s.rapor.satirlar[0].tip, 'iptal');
  esit(s.rapor.ozet.iptal, 1);
  esit(s.durum.parcaSahipligi['11-1'], '11', 'iptal olan emir fetih yapmamalı');
});

test('ÇÖZÜM: emirler VERİLİŞ SIRASINA göre işleniyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-1', BEN, { piyade: 2 });
  d = orduKoy(d, '16-2', BEN, { piyade: 2 });
  d = emret(d, '16-1', '16-3', { piyade: 2 });
  d = emret(d, '16-2', '16-3', { piyade: 2 });
  const s = coz(d);
  esit(s.rapor.satirlar[0].kaynak, '16-1');
  esit(s.rapor.satirlar[1].kaynak, '16-2');
  esit(parcaBirimSayisi(s.durum, '16-3'), 4, 'ikisi de varmalı');
});

test('UZUN OYUN: 15 tur boyunca saldırıp durmak çökmüyor, kayıt hep okunuyor', () => {
  // Motorun tamamı bir arada: garnizonlu gerçek harita, her tur elde ne varsa saldırıya
  // çıkarma, muharebe, çekilme, fetih, kayıt gidiş-dönüşü. Tek tek doğru olan parçaların
  // BİRLİKTE de ayakta kaldığını gösteren tek test bu.
  const { metinCoz, kayitMetni } = require('../src/oyun/kayitVerisi.js');
  const { birimUret, ilUretimHakki } = require('../src/oyun/ordu.js');
  const { PARCALAR } = require('../src/oyun/veri.js');
  let d = oyunKur({ senaryo: 'turkiye', tohum: 31337 });
  let toplamEmir = 0,
    toplamMuharebe = 0,
    toplamFetih = 0;

  for (let tur = 0; tur < 15; tur++) {
    // BEN her tur herkesle savaşta: Görev 11'den beri barıştakine saldırılamıyor ve bu
    // test saldırının kendisini değil, 15 tur boyunca motorun ayakta kaldığını ölçüyor.
    d = hepsiyleSavas(d, BEN);
    // Bütçe her tur dolduruluyor: test hareketi ölçüyor, ekonomiyi değil. Üretim yine
    // gerçek yoldan (sanayi sınırı dahil) yapılıyor ki ordu üretimi de zincire girsin.
    d = paraVer(d, BEN, 300);
    d = {
      ...d,
      aktorler: { ...d.aktorler, [BEN]: { ...d.aktorler[BEN], ekonomiHavuzu: 300 } },
    };
    const benim = Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === BEN);
    for (const p of benim) {
      const hak = ilUretimHakki(d, PARCALAR[p].kod, BEN).kalan;
      if (hak <= 0) continue;
      const s = birimUret(d, p, BEN, { piyade: Math.min(3, hak) });
      if (s.ok) d = s.durum;
    }
    for (const kaynak of benim) {
      const eldeki = kullanilabilirBirimler(d, kaynak);
      if (birimSayisi(eldeki) < 2) continue; // en az bir birim geride kalsın
      // Düşman komşusu varsa saldır, yoksa dur.
      const hedef = gecerliHedefler(d, BEN, kaynak).find((h) => d.parcaSahipligi[h] !== BEN);
      if (!hedef) continue;
      // Bir birim geride kalsın (parça savunmasız kalmasın), gerisi sefere çıksın.
      const gonderilecek = { ...eldeki };
      const ilkTur = DENGE.BIRIM_SIRASI.find((t) => gonderilecek[t] > 0);
      if (gonderilecek[ilkTur] === 1) delete gonderilecek[ilkTur];
      else gonderilecek[ilkTur] -= 1;
      const s = hamleUygula(d, BEN, kaynak, hedef, gonderilecek);
      if (s.ok) {
        d = s.durum;
        toplamEmir++;
      }
    }
    d = turuBitir(d, DURGUN);
    if (d.sonTurRaporu) {
      toplamMuharebe += d.sonTurRaporu.ozet.muharebe;
      toplamFetih += d.sonTurRaporu.ozet.fetih;
    }

    // Her turda kayıt okunabilir kalmalı. Tur raporu kayda girmiyor (kayitVerisi.js),
    // o yüzden karşılaştırma o alan hariç yapılıyor.
    const geri = metinCoz(kayitMetni(d));
    dogru(geri.ok, 'tur ' + tur + ' kaydı okunamadı: ' + geri.hata);
    esit(
      JSON.stringify(geri.durum),
      JSON.stringify({ ...d, sonTurRaporu: null }),
      'tur ' + tur + ' gidiş-dönüş'
    );
  }

  dogru(toplamEmir > 10, 'anlamlı sayıda emir verilmeli, verilen ' + toplamEmir);
  dogru(toplamMuharebe > 0, 'hiç muharebe olmadı — garnizonlar çalışmıyor olabilir');
  dogru(toplamFetih > 0, 'hiç fetih olmadı, alınan ' + toplamFetih);
  esit(d.tur, 16, 'tur sayacı');

  // Hiçbir parçada boş ordu kaydı kalmamalı ve sahipsiz ordu olmamalı.
  for (const pid of Object.keys(d.ordular)) {
    dogru(birimSayisi(d.ordular[pid].birimler) > 0, pid + ' boş ordu kaydı bırakmış');
    dogru(d.aktorler[d.ordular[pid].sahip] !== undefined, pid + ' bilinmeyen sahip');
  }
});

test('ÖZET: rapor özeti muharebe, fetih ve kayıpları sayıyor', () => {
  let d = sahne();
  d = orduKoy(d, '16-3', BEN, { piyade: 8 });
  d = orduKoy(d, '11-1', '11', { piyade: 1 });
  d = emret(d, '16-3', '11-1', { piyade: 8 });
  const o = coz(d).rapor.ozet;
  esit(o.emir, 1);
  esit(o.muharebe, 1);
  esit(o.kazanilan, 1);
  esit(o.fetih, 1);
  dogru(o.dusmanKaybi > 0, 'düşman kaybı sayılmalı');
  dogru(o.ganimetNufus > 0, 'ganimet özetlenmeli');
});
