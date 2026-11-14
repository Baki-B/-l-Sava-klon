// SAHİPLİK TEST ARACI TESTLERİ (Görev 03 / Adım 8).
// Muharebe Görev 05'te geliyor; o zamana kadar sahiplik elle değiştirilebilmeli.
// Asıl soru: parça el değiştirdiğinde gelir ve sayaçlar ANINDA doğru güncelleniyor mu?

const { test, dogru, esit } = require('./yardimci');
const {
  oyunKur,
  parcayiVer,
  iliVer,
  parcayiEskiHaline,
  iliEskiHaline,
  aktorOzeti,
} = require('../src/oyun/oyunDurumu.js');
const { aktorGeliri, parcaGeliri } = require('../src/oyun/uretim.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const TOHUM = 20260726;
const yeni = () => oyunKur({ senaryo: 'turkiye', tohum: TOHUM });

test('parçayı sahiplenince GELİR ANINDA artıyor', () => {
  const d = yeni();
  const once = aktorGeliri(d, '16').nufus; // Bursa 7
  const kazanc = parcaGeliri('06-1').nufus; // Ankara Doğu

  const sonra = parcayiVer(d, '06-1', '16');
  esit(aktorGeliri(sonra, '16').nufus, once + kazanc, 'sahiplenme sonrası gelir');
  esit(sonra.parcaSahipligi['06-1'], '16', 'yeni sahip');
  // Ankara'nın geliri aynı miktarda düşmeli
  esit(aktorGeliri(sonra, '06').nufus, aktorGeliri(d, '06').nufus - kazanc, 'Ankara geliri');
});

test('parça sayısı ve TAM İL sayacı doğru güncelleniyor', () => {
  let d = yeni();
  esit(aktorOzeti(d, '16').parca, 4, 'başlangıç parça');
  esit(aktorOzeti(d, '16').tamIl, 1, 'başlangıç tam il');

  d = parcayiVer(d, '77-1', '16'); // Yalova tek parçalı → hem parça hem tam il artar
  esit(aktorOzeti(d, '16').parca, 5, 'parça');
  esit(aktorOzeti(d, '16').tamIl, 2, 'tam il (Bursa + Yalova)');

  d = parcayiVer(d, '06-1', '16'); // Ankara'nın 1 parçası → tam il artmaz
  esit(aktorOzeti(d, '16').parca, 6, 'parça');
  esit(aktorOzeti(d, '16').tamIl, 2, 'yarım il tam sayılmamalı');
});

test('TÜM İLİ AL: ilin bütün parçaları geçiyor, tam il sayacı artıyor', () => {
  const d = iliVer(yeni(), '06', '16'); // Ankara'nın 5 parçası
  const o = aktorOzeti(d, '16');
  esit(o.parca, 8, 'Bursa 4 + Ankara 4');
  esit(o.tamIl, 2, 'tam il');
  esit(aktorGeliri(d, '06').nufus, 0, 'Ankara aktörünün geliri sıfırlanmalı');
});

test('GERİ VER: parça kendi iline döner', () => {
  let d = parcayiVer(yeni(), '06-1', '16');
  esit(d.parcaSahipligi['06-1'], '16', 'alındı');
  d = parcayiEskiHaline(d, '06-1');
  esit(d.parcaSahipligi['06-1'], '06', 'geri verildi');
  esit(aktorGeliri(d, '16').nufus, 7, 'Bursa geliri eski hâline döndü');
});

test('TÜM İLİ GERİ VER: ilin bütün parçaları kendi iline döner', () => {
  let d = iliVer(yeni(), '06', '16'); // Ankara'nın 5 parçası alındı
  esit(aktorOzeti(d, '16').parca, 8, 'alındıktan sonra');

  d = iliEskiHaline(d, '06');
  esit(aktorOzeti(d, '16').parca, 4, 'Bursa yine 4 parça');
  esit(aktorOzeti(d, '06').tamIl, 1, 'Ankara yine tam il');
  esit(aktorGeliri(d, '16').nufus, 7, 'Bursa geliri eski hâline döndü');
  dogru(iliEskiHaline(d, '06') === d, 'zaten yerindeyken aynı nesne dönmeli');
});

test('eski durum DEĞİŞMİYOR (yeni durum dönüyor)', () => {
  const d = yeni();
  const kopya = JSON.stringify(d);
  const sonra = parcayiVer(d, '06-1', '16');
  esit(JSON.stringify(d), kopya, 'eski durum korunmalı');
  dogru(sonra !== d, 'aynı nesne dönmüş');
  dogru(sonra.parcaSahipligi !== d.parcaSahipligi, 'sahiplik tablosu paylaşılıyor');
});

test('gereksiz değişiklikte AYNI nesne dönüyor (ekran boşuna tazelenmesin)', () => {
  const d = yeni();
  dogru(parcayiVer(d, '16-1', '16') === d, 'zaten sahibi olan parça');
  dogru(iliVer(d, '16', '16') === d, 'zaten tamamı elinde olan il');
  dogru(parcayiVer(d, '16-1', '99') === d, 'olmayan aktör');
});

test('KAPSAM KORUMASI: senaryo dışı parça sahiplenilemez', () => {
  const kd = oyunKur({ senaryo: 'karadeniz', tohum: TOHUM });
  const sonra = parcayiVer(kd, '07-1', '55'); // Antalya, Karadeniz oyununda yok
  dogru(sonra === kd, 'kapsam dışı parça alınabilmiş');
  dogru(sonra.parcaSahipligi['07-1'] === undefined, 'kapsam dışı parça tabloya girmiş');
});

test('sahiplik değişikliği tur döngüsüne ve kayda doğru yansıyor', () => {
  let d = parcayiVer(yeni(), '06-1', '16'); // Bursa 7 + Ankara Doğu 3 = 10
  const beklenen = aktorGeliri(d, '16').nufus;
  d = turuBitir(d, DURGUN);
  esit(d.aktorler['16'].nufusHavuzu, beklenen, 'tur sonunda havuz');

  const geri = metinCoz(kayitMetni(d)).durum;
  esit(geri.parcaSahipligi['06-1'], '16', 'kayıt/yükleme sahipliği korumalı');
  esit(geri.aktorler['16'].nufusHavuzu, d.aktorler['16'].nufusHavuzu, 'havuz korunmalı');
});
