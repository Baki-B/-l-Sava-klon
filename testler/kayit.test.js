// KAYIT / YÜKLEME TESTLERİ (Görev 03 / Adım 5).
//
// Burada test edilen: durumun metne çevrilip geri okunması, bozuk/eksik kayıtların
// oyunu çökertmeden reddedilmesi ve kayıt boyutu. Cihaz belleği (AsyncStorage) katmanı
// `kayit.js`'te ve telefonda test edilir; dönüşüm mantığı buradan geçer.

const { test, dogru, esit, yakin, hepsiyleSavas } = require('./yardimci');
const { oyunKur, KAYIT_SURUMU } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const { DENGE } = require('../src/denge.js');
const parcalarData = require('../veri/parcalar.json');
const illerData = require('../veri/iller.json');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const TOHUM = 20260725;

// Birkaç tur oynanmış, sahipliği değişmiş bir oyun kur (gerçekçi kayıt).
function oynanmisOyun() {
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '17-1': '16', '41-1': '16' } };
  for (let i = 0; i < 7; i++) d = turuBitir(d, DURGUN);
  // Oyuncu herkesle savaşta: aşağıdaki testler MUHAREBE DÖKÜMÜNÜN kayda sızmadığını
  // ölçüyor, yani önce muharebe olması gerekiyor (Görev 11: barıştakine saldırılamaz).
  return hepsiyleSavas(d, d.oyuncuAktorId);
}

// Tur raporu kayda GİRMEZ (bir turluk gösterim verisi, bkz. kayitVerisi.js). Gidiş-dönüş
// karşılaştırmaları bu tek alan hariç yapılır; raporun kendisi aşağıda ayrıca test ediliyor.
const raporsuz = (d) => JSON.stringify({ ...d, sonTurRaporu: null });

test('GİDİŞ-DÖNÜŞ: kaydedilip yüklenen oyun birebir aynı (rapor hariç)', () => {
  const once = oynanmisOyun();
  const sonuc = metinCoz(kayitMetni(once));
  dogru(sonuc.ok, 'kayıt okunamadı: ' + sonuc.hata);
  esit(JSON.stringify(sonuc.durum), raporsuz(once), 'gidiş-dönüş');
});

// ---- GÖREV 06: KADRO VE ARAŞTIRMA ----

test('BOYUT: yıpranmamış oyunda kayıtta HİÇ `kadro` alanı yok', () => {
  // Kayıt kuralı: kadro yalnızca mevcuttan FARKLIYSA yazılır. Oyunun başında 181
  // garnizonun hiçbiri yıpranmamış olduğu için kayıt ilk turda hiç büyümemeli.
  const metin = kayitMetni(oyunKur({ senaryo: 'turkiye', tohum: TOHUM }));
  esit(metin.indexOf('"kadro"'), -1, 'kadro alanı sızmış');
  const kb = Buffer.byteLength(metin, 'utf8') / 1024;
  dogru(kb < 22, 'başlangıç kaydı büyümüş: ' + kb.toFixed(1) + ' KB');
});

test('BOYUT: yalnızca YIPRANMIŞ ordular kadro alanı yazıyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const pid = Object.keys(d.ordular)[0];
  const yipranmis = {
    ...d,
    ordular: {
      ...d.ordular,
      [pid]: { ...d.ordular[pid], kadro: { ...d.ordular[pid].birimler, piyade: 9 } },
    },
  };
  esit(kayitMetni(yipranmis).split('"kadro"').length - 1, 1, 'tek ordu kadro yazmalı');
});

test('GİDİŞ-DÖNÜŞ: kadro ve araştırma korunuyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const pid = Object.keys(d.ordular)[0];
  const once = {
    ...d,
    ordular: {
      ...d.ordular,
      [pid]: { ...d.ordular[pid], kadro: { ...d.ordular[pid].birimler, piyade: 9 } },
    },
    // Puan KESİRLİ saklanıyor (§6.4) — gidiş-dönüşte yuvarlanmamalı.
    arastirma: { 16: { zirh: 2, agir: 1, hafif: 0, puan: 7.25 } },
  };
  const sonra = metinCoz(kayitMetni(once)).durum;
  esit(sonra.ordular[pid].kadro.piyade, 9, 'kadro');
  esit(sonra.arastirma['16'].zirh, 2, 'araştırma seviyesi');
  yakin(sonra.arastirma['16'].puan, 7.25, 1e-9, 'kesirli puan');
});

test('ARAŞTIRMA: kayıt yalnızca araştırması OLAN aktörler için tutuluyor', () => {
  const metin = kayitMetni(oyunKur({ senaryo: 'turkiye', tohum: TOHUM }));
  esit(
    metin.indexOf('"arastirma":{}'),
    metin.indexOf('"arastirma"'),
    '81 aktör için boş nesne yazılmamalı'
  );
});

test('GİDİŞ-DÖNÜŞ: tur, havuzlar ve sahiplik korunuyor', () => {
  const once = oynanmisOyun();
  const sonra = metinCoz(kayitMetni(once)).durum;

  esit(sonra.tur, 8, 'tur');
  yakin(sonra.aktorler['16'].nufusHavuzu, once.aktorler['16'].nufusHavuzu, 1e-12, 'nüfus havuzu');
  yakin(
    sonra.aktorler['16'].ekonomiHavuzu,
    once.aktorler['16'].ekonomiHavuzu,
    1e-12,
    'ekonomi havuzu'
  );
  esit(sonra.parcaSahipligi['17-1'], '16', 'fethedilen parçanın sahibi');
  esit(sonra.parcaSahipligi['41-1'], '16', 'fethedilen ikinci parça');
  esit(
    Object.keys(sonra.parcaSahipligi).length,
    require('../veri/parcalar.json').meta.parcaSayisi,
    'parça sayısı'
  );
  esit(Object.keys(sonra.aktorler).length, 81, 'aktör sayısı');
});

test('KESİR KORUNUMU: kayıttan dönen havuz yuvarlanmamış', () => {
  // Üretim tam sayı ama havuz kesirli olabilir (üretim çarpanı kesirliyse).
  // Kayıt bu kesri bozmadan taşımalı.
  const eskiCarpan = DENGE.URETIM_CARPANI;
  DENGE.URETIM_CARPANI = 0.5;
  try {
    let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
    for (const pid of Object.keys(d.parcaSahipligi)) d.parcaSahipligi[pid] = '34';
    d.parcaSahipligi['16-1'] = '16'; // temel 3 nüfus × 0.5 = 1.5
    for (let i = 0; i < 5; i++) d = turuBitir(d, DURGUN);

    const sonra = metinCoz(kayitMetni(d)).durum;
    yakin(sonra.aktorler['16'].nufusHavuzu, 7.5, 1e-9, '5 turluk kesirli birikim');
  } finally {
    DENGE.URETIM_CARPANI = eskiCarpan;
  }
});

test('RASTGELELİK: üretecin durumu kayıtta duruyor', () => {
  const d = oynanmisOyun();
  const sonra = metinCoz(kayitMetni(d)).durum;
  esit(sonra.rastgele.tohum, d.rastgele.tohum, 'tohum');
  esit(sonra.rastgele.durum, d.rastgele.durum, 'üretecin durumu');
});

test('SÜRÜM: kayıtta sürüm alanı var ve güncel sürümü söylüyor', () => {
  const sonra = metinCoz(kayitMetni(oynanmisOyun())).durum;
  esit(sonra.surum, KAYIT_SURUMU, 'sürüm');
  // 16: raunt ölçüsü, ivme ve araştırma artışı (2026-08-08). Biçim değişmedi ama aynı
  // kayıt başka bir oyun oynatıyor; gerekçe oyunDurumu.js'teki sürüm notunda.
  esit(KAYIT_SURUMU, 19, 'güncel kayıt sürümü');
});

test('ESKİ KAYIT: sürüm 1–5 reddediliyor, sebebi söyleniyor', () => {
  // 1–2: harita değişti, parça kimlikleri artık yok. 3: orduların olmadığı sürüm —
  // yüklenirse oyuncu ordusuz bir oyuna düşer ve neden asker basamadığını anlamaz.
  // 4: hareketin olmadığı sürüm — garnizonlar yok, oyuncu kimsenin savunmadığı bir
  // haritada yürür ve muharebeyi hiç göremez.
  // 5: toplanma ve araştırmanın olmadığı sürüm — oyun çalışıyor GÖRÜNÜR ama hiçbir ordu
  // toplanamaz (kadro alanı yok) ve araştırma bomboş açılır. En sinsisi bu.
  // Sessizce bozuk yüklemek yerine açıkça reddedilmeli.
  for (const eskiSurum of [1, 2, 3, 4, 5]) {
    const sonuc = metinCoz(JSON.stringify({ ...oynanmisOyun(), surum: eskiSurum }));
    dogru(!sonuc.ok, 'sürüm ' + eskiSurum + ' kaydı kabul edildi');
    dogru(sonuc.hata.indexOf('eski') !== -1, 'mesaj: ' + sonuc.hata);
    dogru(sonuc.hata.indexOf('Yeni oyun') !== -1, 'ne yapılacağı söylenmiyor: ' + sonuc.hata);
  }
});

test('ESKİ KAYIT: sürüm 11 reddediliyor ve sebebi İSTATİSTİĞİ söylüyor', () => {
  // Sürüm 11 kaydında `sayaclar` alanı yok: oyun çalışır ama o maçta ne olduğu bilinmez,
  // istatistik boş çıkar ve kazanılması gereken mühürler kazanılmaz.
  const sonuc = metinCoz(JSON.stringify({ ...oynanmisOyun(), surum: 11 }));
  dogru(!sonuc.ok, 'sürüm 11 kaydı kabul edildi');
  dogru(sonuc.hata.indexOf('istatistik') !== -1, 'sebep istatistiği anmıyor: ' + sonuc.hata);
  dogru(sonuc.hata.indexOf('Yeni oyun') !== -1, 'ne yapılacağı söylenmiyor: ' + sonuc.hata);
});

test('ESKİ KAYIT: sürüm 10 reddediliyor ve sebebi KARAKTERLERİ söylüyor', () => {
  // Görev 12 / Adım 2'nin sinsiliği: sürüm 10 kaydı yüklenirse oyun ÇALIŞIR. Kişilik
  // kayda girmiyor, yüklerken yeniden türetiliyor ve türetim artık aktör başına fazladan
  // bir sayı çekiyor (karakter çekilişi) — yani bütün rakiplerin huyu sessizce değişir.
  // Ret mesajı bunu oyuncunun diliyle söylemeli, yoksa "neden açılmadı" sorusu kalır.
  const sonuc = metinCoz(JSON.stringify({ ...oynanmisOyun(), surum: 10 }));
  dogru(!sonuc.ok, 'sürüm 10 kaydı kabul edildi');
  dogru(sonuc.hata.indexOf('karakter') !== -1, 'sebep karakterleri anmıyor: ' + sonuc.hata);
  dogru(sonuc.hata.indexOf('Yeni oyun') !== -1, 'ne yapılacağı söylenmiyor: ' + sonuc.hata);
});

test('KAYIT: ordular gidiş-dönüşte korunuyor', () => {
  const { birimUret, parcaBirimSayisi } = require('../src/oyun/ordu.js');
  let d = oynanmisOyun();
  const id = d.oyuncuAktorId;
  d = {
    ...d,
    aktorler: {
      ...d.aktorler,
      [id]: { ...d.aktorler[id], nufusHavuzu: 99, ekonomiHavuzu: 99 },
    },
  };
  const pid = Object.keys(d.parcaSahipligi).find((p) => d.parcaSahipligi[p] === id);
  // Parçada zaten kuruluş garnizonu duruyor (Görev 05); üretim onun ÜSTÜNE ekleniyor.
  const oncekiSayi = parcaBirimSayisi(d, pid);
  const oncekiPiyade = d.ordular[pid].birimler.piyade || 0;
  d = birimUret(d, pid, id, { piyade: 2, zirhli: 1 }).durum;

  const sonra = metinCoz(kayitMetni(d)).durum;
  esit(parcaBirimSayisi(sonra, pid), oncekiSayi + 3, 'birim sayısı');
  esit(sonra.ordular[pid].sahip, id, 'sahip');
  esit(sonra.ordular[pid].birimler.piyade, oncekiPiyade + 2, 'piyade');
  esit(JSON.stringify(sonra.ordular[pid]), JSON.stringify(d.ordular[pid]), 'ordu kaydı birebir');
  esit(sonra.buTurUretim[id][pid.slice(0, 2)], 3, 'sanayi sayacı da korunuyor');
});

test('KAYIT: hasar havuzu gidiş-dönüşte korunuyor (§3.4)', () => {
  // Havuz turlar arası hatırlanır; kayıtta kaybolursa yıpranmış ordu sihirle iyileşir.
  let d = oynanmisOyun();
  const pid = Object.keys(d.ordular)[0];
  d = { ...d, ordular: { ...d.ordular, [pid]: { ...d.ordular[pid], hasarHavuzu: 13.25 } } };
  const sonra = metinCoz(kayitMetni(d)).durum;
  esit(sonra.ordular[pid].hasarHavuzu, 13.25, 'havuz');
});

test('KAYIT: hamle defteri ve toplanma emri gidiş-dönüşte korunuyor', () => {
  // ⚠ GÖREV 15: HAREKET EMRİ ARTIK KUYRUKTA BEKLEMİYOR (anında çözülüyor). Kayıtta
  // korunması gereken iki şey kaldı: TOPLANMA emirleri ve hamle hakkı DEFTERİ.
  const { gecerliHedefler, kullanilabilirBirimler } = require('../src/oyun/hareket.js');
  const { hamleUygula } = require('../src/oyun/cozum.js');
  let d = oynanmisOyun();
  const id = d.oyuncuAktorId;
  const kaynak = Object.keys(d.parcaSahipligi).find(
    (p) => d.parcaSahipligi[p] === id && gecerliHedefler(d, id, p).length > 0
  );
  const hedef = gecerliHedefler(d, id, kaynak)[0];
  const s = hamleUygula(d, id, kaynak, hedef, kullanilabilirBirimler(d, kaynak));
  dogru(s.ok, 'hamle yapılamadı: ' + s.sebep);
  esit(s.durum.emirler.length, 0, 'hareket emri kuyrukta beklememeli');

  const varan = s.durum.ordular[hedef];
  dogru(varan && varan.hamle, 'varan ordunun defteri yazılmalı');

  const sonra = metinCoz(kayitMetni(s.durum)).durum;
  const sonraki = sonra.ordular[hedef];
  dogru(sonraki && sonraki.hamle, 'defter kayıttan dönmedi');
  esit(JSON.stringify(sonraki.hamle), JSON.stringify(varan.hamle), 'defter gidiş-dönüşte değişti');
});

test('BOZUK KAYIT: emir alanı olmayan veya bozuk emir taşıyan kayıt reddediliyor', () => {
  const d = oynanmisOyun();

  const emirsiz = { ...d };
  delete emirsiz.emirler;
  const s1 = metinCoz(JSON.stringify(emirsiz));
  dogru(!s1.ok, 'emir alanı olmayan kayıt kabul edildi');

  const bozuk = { ...d, emirler: [{ kaynak: '16-1' }] }; // hedef ve birimler yok
  const s2 = metinCoz(JSON.stringify(bozuk));
  dogru(!s2.ok, 'bozuk emir taşıyan kayıt kabul edildi');
  dogru(s2.hata.indexOf('emir') !== -1, 'mesaj emirden bahsetmiyor: ' + s2.hata);
});

test('EKSİK KAYIT: ordu alanı olmayan kayıt reddediliyor', () => {
  const d = oynanmisOyun();

  const ordusuz = { ...d };
  delete ordusuz.ordular;
  dogru(!metinCoz(JSON.stringify(ordusuz)).ok, 'ordusuz kayıt kabul edildi');

  // Ama BOŞ ordu nesnesi geçerli — oyun başında hiç ordu yoktur.
  dogru(metinCoz(JSON.stringify({ ...d, ordular: {} })).ok, 'boş ordu listesi reddedildi');
});

test('BOYUT: kayıt birkaç on KB — geometri sızmamış', () => {
  const metin = kayitMetni(oynanmisOyun());
  const kb = metin.length / 1024;
  dogru(kb < 50, 'kayıt ' + kb.toFixed(1) + ' KB (50 KB altı bekleniyor)');
  dogru(metin.indexOf('"yol"') === -1, 'kayda çizim yolu (geometri) sızmış');
});

test('Karadeniz oyunu da kaydedilip yüklenebiliyor', () => {
  let d = oyunKur({ senaryo: 'karadeniz', tohum: TOHUM });
  d = turuBitir(d, DURGUN);
  const sonra = metinCoz(kayitMetni(d)).durum;
  esit(sonra.senaryo.anahtar, 'karadeniz', 'senaryo');
  // Karadeniz parça sayısı veriden okunur (harita revizyonlarında kendiliğinden uysun).
  const karadenizParca = Object.keys(parcalarData.parcalar).filter(
    (pid) => illerData[parcalarData.parcalar[pid].kod].bolge === 'Karadeniz'
  ).length;
  esit(sonra.senaryo.kapsamParcalar.length, karadenizParca, 'kapsam parça sayısı');
  esit(Object.keys(sonra.parcaSahipligi).length, karadenizParca, 'sahiplik tablosu');
});

test('BOZUK KAYIT: oyun çökmüyor, anlaşılır mesaj dönüyor', () => {
  const bozuk = metinCoz('{bu json değil');
  dogru(!bozuk.ok, 'bozuk kayıt kabul edildi');
  dogru(bozuk.hata.indexOf('bozuk') !== -1, 'mesaj: ' + bozuk.hata);

  const bos = metinCoz('');
  dogru(!bos.ok, 'boş kayıt kabul edildi');
});

test('EKSİK KAYIT: alanı eksik kayıt reddediliyor', () => {
  const d = oynanmisOyun();

  const surumsuz = { ...d };
  delete surumsuz.surum;
  dogru(!metinCoz(JSON.stringify(surumsuz)).ok, 'sürümsüz kayıt kabul edildi');

  const aktorsuz = { ...d, aktorler: {} };
  dogru(!metinCoz(JSON.stringify(aktorsuz)).ok, 'aktörsüz kayıt kabul edildi');

  const sahipsiz = { ...d, parcaSahipligi: {} };
  dogru(!metinCoz(JSON.stringify(sahipsiz)).ok, 'sahipliksiz kayıt kabul edildi');

  const oyuncusuz = { ...d, oyuncuAktorId: '99' };
  dogru(!metinCoz(JSON.stringify(oyuncusuz)).ok, 'olmayan oyuncu kabul edildi');
});

test('İLERİ SÜRÜM: daha yeni bir kayıt açılmıyor, sebebi söyleniyor', () => {
  const d = { ...oynanmisOyun(), surum: 99 };
  const sonuc = metinCoz(JSON.stringify(d));
  dogru(!sonuc.ok, 'ileri sürümlü kayıt kabul edildi');
  dogru(sonuc.hata.indexOf('yeni') !== -1, 'mesaj: ' + sonuc.hata);
});

test('yüklenen oyun kaldığı yerden devam ediyor (tur döngüsü bozulmuyor)', () => {
  const once = oynanmisOyun();
  const yuklenen = metinCoz(kayitMetni(once)).durum;
  const a = turuBitir(once, DURGUN);
  const b = turuBitir(yuklenen, DURGUN);
  esit(raporsuz(b), raporsuz(a), 'kayıttan devam eden oyun');
});

test('TUR RAPORU KAYDA GİRMİYOR — kayıt tek turluk dökümle şişmiyor', () => {
  const { gecerliHedefler, kullanilabilirBirimler } = require('../src/oyun/hareket.js');
  const { hamleUygula } = require('../src/oyun/cozum.js');
  let d = oynanmisOyun();
  const id = d.oyuncuAktorId;
  // Elde ne varsa saldırıya çıkar; birkaç muharebe olsun ki rapor dolsun.
  for (const kaynak of Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === id)) {
    const hedef = gecerliHedefler(d, id, kaynak).find((h) => d.parcaSahipligi[h] !== id);
    if (!hedef) continue;
    const s = hamleUygula(d, id, kaynak, hedef, kullanilabilirBirimler(d, kaynak));
    if (s.ok) d = s.durum;
  }
  d = turuBitir(d, DURGUN);
  dogru(d.sonTurRaporu !== null, 'rapor üretilmiş olmalı');
  dogru(
    d.sonTurRaporu.satirlar.some((x) => x.dokum),
    'raporda tur tur döküm olmalı'
  );

  const metin = kayitMetni(d);
  dogru(metin.indexOf('"sonTurRaporu":null') !== -1, 'rapor alanı boş yazılmalı');
  dogru(metin.indexOf('dokum') === -1, 'tur tur döküm kayda sızmış');
  dogru(metin.indexOf('saldiranKayiplar') === -1, 'muharebe dökümü kayda sızmış');
  esit(metinCoz(metin).durum.sonTurRaporu, null, 'yüklenen oyunda rapor null olmalı');

  const kb = Buffer.byteLength(metin, 'utf8') / 1024;
  dogru(kb < 26, 'kayıt beklenenden büyük: ' + kb.toFixed(1) + ' KB');
});
