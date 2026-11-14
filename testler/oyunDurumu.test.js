// Oyun durumu + senaryo kapsamı testleri (Görev 03 / Adım 2).
// Asıl sorular: doğru sayıda aktör kuruluyor mu, her parçanın sahibi kendi ili mi,
// kapsam dışı yerler gerçekten dışarıda mı, ve durum kaydedilebilir düz veri mi?

const { test, dogru, esit } = require('./yardimci');
const {
  oyunKur,
  aktorParcalari,
  kapsamdaMi,
  aktorOzeti,
  parcayiVer,
  iliVer,
  parcayiEskiHaline,
  KAYIT_SURUMU,
} = require('../src/oyun/oyunDurumu.js');
const parcalarData = require('../veri/parcalar.json');
const illerData = require('../veri/iller.json');

const TOHUM = 20260725;
const turkiye = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
const karadeniz = oyunKur({ senaryo: 'karadeniz', tohum: TOHUM });

// Parça sayıları VERİDEN okunur — harita revizyonlarında testler kendiliğinden uyum sağlasın
// (Görev 03B / Adım 6: "sabit sayı yazan test varsa veriden okumaya çevir").
const TOPLAM_PARCA = parcalarData.meta.parcaSayisi;
const KARADENIZ_PARCA = Object.keys(parcalarData.parcalar).filter(
  (pid) => illerData[parcalarData.parcalar[pid].kod].bolge === 'Karadeniz'
).length;

test('Türkiye senaryosu: 81 il, tüm parçalar, 81 aktör', () => {
  esit(turkiye.senaryo.kapsamIller.length, 81, 'il sayısı');
  esit(turkiye.senaryo.kapsamParcalar.length, TOPLAM_PARCA, 'parça sayısı');
  esit(Object.keys(turkiye.aktorler).length, 81, 'aktör sayısı');
});

test('Karadeniz senaryosu: 18 il, bölgenin parçaları, 18 aktör', () => {
  esit(karadeniz.senaryo.kapsamIller.length, 18, 'il sayısı');
  esit(karadeniz.senaryo.kapsamParcalar.length, KARADENIZ_PARCA, 'parça sayısı');
  esit(Object.keys(karadeniz.aktorler).length, 18, 'aktör sayısı');
});

test('Karadeniz senaryosundaki her il gerçekten Karadeniz bölgesinde', () => {
  for (const kod of karadeniz.senaryo.kapsamIller)
    esit(illerData[kod].bolge, 'Karadeniz', kod + ' ilinin bölgesi');
});

test('oyun başında her parçanın sahibi KENDİ İLİ (81 bağımsız aktör)', () => {
  for (const pid of Object.keys(turkiye.parcaSahipligi))
    esit(turkiye.parcaSahipligi[pid], parcalarData.parcalar[pid].kod, pid + ' parçasının sahibi');
});

test('KAPSAM DIŞI SIZINTI YOK: Karadeniz oyununda Antalya parçaları hiç yok', () => {
  const antalya = Object.keys(parcalarData.parcalar).filter(
    (pid) => parcalarData.parcalar[pid].kod === '07'
  );
  dogru(antalya.length > 0, 'Antalya parçası bulunamadı (veri hatası)');
  for (const pid of antalya) {
    dogru(!kapsamdaMi(karadeniz, pid), pid + ' kapsam dışı olmalıydı');
    dogru(karadeniz.parcaSahipligi[pid] === undefined, pid + ' sahiplik tablosunda görünüyor');
  }
  dogru(karadeniz.aktorler['07'] === undefined, 'Antalya aktörü oluşturulmamalıydı');
});

test('her ilin parçalarının hepsi başlangıçta o ilin elinde', () => {
  const bursa = aktorParcalari(turkiye, '16');
  esit(bursa.length, illerData['16'].parcaSayisi, 'Bursa parça sayısı');
  const samsun = aktorParcalari(karadeniz, '55');
  esit(samsun.length, illerData['55'].parcaSayisi, 'Samsun parça sayısı');
});

test('oyuncu aktörü kapsam içinde ve "insan", diğerleri "yapayZeka"', () => {
  dogru(turkiye.aktorler[turkiye.oyuncuAktorId] !== undefined, 'oyuncu aktörü kapsamda değil');
  esit(turkiye.aktorler[turkiye.oyuncuAktorId].tur, 'insan', 'oyuncunun türü');
  const insanlar = Object.keys(turkiye.aktorler).filter((k) => turkiye.aktorler[k].tur === 'insan');
  esit(insanlar.length, 1, 'insan aktör sayısı');
  dogru(
    karadeniz.aktorler[karadeniz.oyuncuAktorId] !== undefined,
    'Karadeniz oyuncusu kapsamda değil'
  );
});

test('havuzlar 0, tur 1, sürüm alanı var', () => {
  esit(turkiye.surum, KAYIT_SURUMU, 'kayıt sürümü');
  esit(turkiye.tur, 1, 'tur');
  for (const k of Object.keys(turkiye.aktorler)) {
    esit(turkiye.aktorler[k].nufusHavuzu, 0, k + ' nüfus havuzu');
    esit(turkiye.aktorler[k].ekonomiHavuzu, 0, k + ' ekonomi havuzu');
  }
  esit(turkiye.turGecmisi.length, 0, 'tur geçmişi');
});

test('rastgelelik durumu tohumla başlıyor', () => {
  esit(turkiye.rastgele.tohum, TOHUM, 'tohum');
  esit(turkiye.rastgele.durum, TOHUM, 'üretecin başlangıç durumu');
});

test('aktör renkleri geçerli renk kodu (#rrggbb)', () => {
  for (const k of Object.keys(turkiye.aktorler))
    dogru(/^#[0-9a-f]{6}$/i.test(turkiye.aktorler[k].renk), k + ' rengi geçersiz');
});

test("KAYIT: durum düz veri — JSON'a çevrilip geri okununca birebir aynı", () => {
  const metin = JSON.stringify(turkiye);
  const geri = JSON.parse(metin);
  esit(JSON.stringify(geri), metin, 'gidiş-dönüş');
});

test('KAYIT: geometri sızmamış, boyut birkaç on KB', () => {
  const metin = JSON.stringify(turkiye);
  dogru(metin.indexOf('"yol"') === -1, 'duruma çizim yolu (geometri) sızmış');
  dogru(metin.indexOf('M1') === -1 && metin.indexOf('L1') === -1, 'duruma çizim verisi sızmış');
  const kb = metin.length / 1024;
  dogru(kb < 50, 'durum çok büyük: ' + kb.toFixed(1) + ' KB (50 KB altı bekleniyor)');
});

test('aynı tohumla kurulan iki oyun birebir aynı', () => {
  const a = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const b = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  esit(JSON.stringify(a), JSON.stringify(b), 'iki oyun');
});

// --- HUD özeti (Adım 6): kaç parça, kaç TAM il ---
// 2026-07-31, Baki: "Kocaeli'yi aldım ama askerleri ilde kaldı, bana geçmediler."
// Senin parçanda başkasının ordusu — oyunun hiçbir yerinde oluşamayacak bir durumdu.
test('GELİŞTİRİCİ: parça el değiştirince ORDUSU da el değiştiriyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const pid = '41-1'; // Kocaeli
  dogru(d.ordular[pid], 'kuruluş garnizonu olmalı');
  esit(d.ordular[pid].sahip, '41', 'başlangıçta kendi ilinin');

  const sonra = parcayiVer(d, pid, '16');
  esit(sonra.parcaSahipligi[pid], '16', 'toprak geçti');
  esit(sonra.ordular[pid].sahip, '16', 'ordu da geçmeli — sahipsiz asker kalmasın');
  esit(
    JSON.stringify(sonra.ordular[pid].birimler),
    JSON.stringify(d.ordular[pid].birimler),
    'birlikler aynen duruyor, yok edilmiyor'
  );

  const geri = parcayiEskiHaline(sonra, pid);
  esit(geri.parcaSahipligi[pid], '41');
  esit(geri.ordular[pid].sahip, '41', 'geri verince ordu da geri dönmeli');
});

test('GELİŞTİRİCİ: tüm il alınınca her parçanın ordusu da geçiyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const sonra = iliVer(d, '41', '16');
  for (const pid of Object.keys(sonra.parcaSahipligi)) {
    if (parcalarData.parcalar[pid].kod !== '41') continue;
    esit(sonra.parcaSahipligi[pid], '16', pid + ' toprak');
    if (sonra.ordular[pid]) esit(sonra.ordular[pid].sahip, '16', pid + ' ordu');
  }
});

test('aktörOzeti: oyun başında Bursa 4 parça · 1 tam il', () => {
  const o = aktorOzeti(turkiye, '16');
  esit(o.parca, 4, 'parça');
  esit(o.toplamParca, TOPLAM_PARCA, 'toplam parça');
  esit(o.tamIl, 1, 'tam il');
  esit(o.toplamIl, 81, 'toplam il');
});

test('aktörOzeti: bir parça kaybedilince TAM İL sayacı düşüyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  d.parcaSahipligi['16-4'] = '34'; // Bursa'nın en küçük parçası gitti
  const o = aktorOzeti(d, '16');
  esit(o.parca, 3, 'parça');
  esit(o.tamIl, 0, 'tek parça eksikken il TAM sayılmamalı');
});

test('aktörOzeti: bir ilin tüm parçaları alınınca tam il sayacı artıyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(d.parcaSahipligi))
    if (d.parcaSahipligi[pid] === '77') d.parcaSahipligi[pid] = '16'; // Yalova (1 parça) alındı
  const o = aktorOzeti(d, '16');
  esit(o.tamIl, 2, 'Bursa + Yalova');
  esit(o.parca, 5, 'parça');
});

test('aktörOzeti: Karadeniz senaryosunda payda bölgenin parçaları / 18 il', () => {
  const o = aktorOzeti(karadeniz, '55');
  esit(o.toplamParca, KARADENIZ_PARCA, 'toplam parça');
  esit(o.toplamIl, 18, 'toplam il');
  esit(o.tamIl, 1, 'Samsun');
});

test('aktörOzeti: hiç parçası olmayan aktör 0 parça · 0 tam il', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(d.parcaSahipligi))
    if (d.parcaSahipligi[pid] === '16') d.parcaSahipligi[pid] = '34';
  const o = aktorOzeti(d, '16');
  esit(o.parca, 0, 'parça');
  esit(o.tamIl, 0, 'tam il');
});

test('bilinmeyen senaryo adı anlaşılır hata veriyor', () => {
  let hata = null;
  try {
    oyunKur({ senaryo: 'akdenizx' });
  } catch (e) {
    hata = e.message;
  }
  dogru(hata !== null, 'hata fırlatılmadı');
  dogru(hata.indexOf('denge.js') !== -1, 'hata mesajı nereye bakılacağını söylemiyor: ' + hata);
});
