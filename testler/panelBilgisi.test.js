// PANEL BİLGİSİ TESTLERİ (Görev 03 / Adım 7).
// Panelde gösterilen sahiplik + gelir bilgileri doğru mu? Panelin kendisi sadece yazdırır;
// hesap buradaki fonksiyonlarda, doğruluğu burada denetlenir.

const { test, dogru, esit, yakin } = require('./yardimci');
const { oyunKur, ilSahiplikDagilimi } = require('../src/oyun/oyunDurumu.js');
const { parcaGeliri, ilGeliri, aktorGeliri } = require('../src/oyun/uretim.js');
const illerData = require('../veri/iller.json');

const TOHUM = 20260725;
const yeni = () => oyunKur({ senaryo: 'turkiye', tohum: TOHUM });

test('parça sahibi başlangıçta kendi ili', () => {
  const d = yeni();
  esit(d.parcaSahipligi['16-1'], '16', 'Bursa Ovası');
  esit(d.aktorler[d.parcaSahipligi['16-1']].ad, 'Bursa', 'sahip adı');
  esit(d.parcaSahipligi['06-1'], '06', 'Ankara parçası');
});

test('"bu parçayı alırsan" satırı = parçanın gerçek getirisi (tam sayı)', () => {
  const g = parcaGeliri('16-1');
  esit(g.nufus, 3, 'nüfus'); // payı 0.55, Bursa statı 7 → tam sayı 3
  esit(g.ekonomi, 3, 'ekonomi');
  // Sahip değişse de parçanın getirisi değişmez (kime giderse gitsin aynı).
  const d = yeni();
  d.parcaSahipligi['16-1'] = '34';
  esit(parcaGeliri('16-1').nufus, g.nufus, 'sahip değişince getiri');
});

test('il dağılımı: oyun başında tek sahip, tüm parçalar onda', () => {
  const d = yeni();
  const dag = ilSahiplikDagilimi(d, '16');
  esit(dag.toplam, 4, 'Bursa parça sayısı');
  esit(dag.sahipler.length, 1, 'sahip sayısı');
  esit(dag.sahipler[0].aktorId, '16', 'sahip');
  esit(dag.sahipler[0].sayi, 4, 'parça');
  dogru(/^#[0-9a-f]{6}$/i.test(dag.sahipler[0].renk), 'sahip rengi geçersiz');
});

test('il dağılımı: parçalar bölününce çoktan aza sıralı geliyor', () => {
  const d = yeni();
  d.parcaSahipligi['16-1'] = '34'; // 1 parça İstanbul'a
  const dag = ilSahiplikDagilimi(d, '16');
  esit(dag.toplam, 4, 'toplam');
  esit(dag.sahipler.length, 2, 'iki sahip');
  esit(dag.sahipler[0].aktorId, '16', 'çoğunluk hâlâ Bursa');
  esit(dag.sahipler[0].sayi, 3, 'Bursa parça');
  esit(dag.sahipler[1].ad, 'İstanbul', 'ikinci sahip');
  esit(dag.sahipler[1].sayi, 1, 'İstanbul parça');
});

test('"sana geliri": oyuncunun o ilden aldığı pay', () => {
  const d = yeni();
  const tam = ilGeliri(d, '16', '16');
  esit(tam.nufus, illerData['16'].statlar.nufus, 'tam il geliri');
  esit(tam.parca, 4, 'parça');
  esit(tam.aktorId, '16', 'kime ait');

  d.parcaSahipligi['16-1'] = '34'; // 3 nüfusluk parça
  const kalan = ilGeliri(d, '16', '16');
  esit(kalan.nufus, 4, 'kalan gelir (7 − 3)');
  esit(kalan.parca, 3, 'kalan parça');

  // Aynı ilden İstanbul'un aldığı pay
  const rakip = ilGeliri(d, '16', '34');
  esit(rakip.nufus, 3, 'İstanbul bu ilden ne alıyor');
  esit(rakip.parca, 1, 'İstanbul parça');
});

test('panelde gösterilen il gelirleri toplamı, aktör gelirleriyle tutarlı', () => {
  const d = yeni();
  d.parcaSahipligi['17-1'] = '16'; // Çanakkale'den bir parça alındı

  const bursaToplam = aktorGeliri(d, '16');
  const kendiIli = ilGeliri(d, '16', '16');
  const fethedilen = ilGeliri(d, '17', '16');

  yakin(
    kendiIli.nufus + fethedilen.nufus,
    bursaToplam.nufus,
    1e-9,
    'illerden gelenlerin toplamı = aktörün geliri'
  );
});

test('yabancı parçada "alırsan" satırı, kendi parçanda çıkmaz', () => {
  // Panelin kararı: sahip.benimMi === false ise kutu gösterilir.
  const d = yeni();
  const benimMi = (pid) => d.parcaSahipligi[pid] === d.oyuncuAktorId;
  dogru(benimMi('16-1'), 'Bursa parçası oyuncunun olmalı');
  dogru(!benimMi('06-1'), 'Ankara parçası oyuncunun olmamalı');
});
