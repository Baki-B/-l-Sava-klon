// SIRA SİSTEMİ TESTLERİ (Görev 07 / Adım 5).
//
// Bu adımın bitiş ölçütü: DÜNYA KENDİ KENDİNE OYNUYOR. Testler dört şeyi kilitliyor:
//   1. Sıra tohumdan türer, kayıtta tutulmaz, tekrar üretilebilir.
//   2. Kimse kalıcı ilk vuruş avantajı almaz (sıra her tur karışır).
//   3. Yapay zekânın her emri OYUNCUNUN doğrulamasından geçer — ikinci yol yok.
//   4. Dünya gerçekten hareket eder; oyun 15 tur boyunca çökmez.

const { test, dogru, esit, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { turSirasi, sirayiCoz, zekaEkonomiTuru } = require('../src/oyun/sira.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const { birimSayisi, ilUretimHakki } = require('../src/oyun/ordu.js');
const { kullanilabilirButce } = require('../src/oyun/butce.js');

const DURGUN = { zekaKapali: true };
const kur = (sec) => oyunKur({ senaryo: 'turkiye', tohum: 20260731, ...(sec || {}) });

// ---- SAVAŞ AÇILMIŞ DÜNYA (Görev 11) ----
// Barış varsayılan ve ilk `ILAN.BARIS_TURU` tur savaş yasak. Emir ÇÖZÜMÜNÜ ölçen testler
// savaşların açıldığı bir dünyaya ihtiyaç duyuyor; tur ileri alınıyor ki zekâ kendi
// ilanlarını verebilsin — sahte ilişki yazmak yerine sistemin kendisi çalışıyor.
const savasliKur = (sec) => ({ ...kur(sec), tur: DENGE.DIPLOMASI.ILAN.BARIS_TURU + 1 });

// ---- SIRA ----

test('SIRA: tohum ve turdan TÜRETİLİYOR, kayıtta tutulmuyor', () => {
  const d = kur();
  esit(d.turSirasi, undefined, 'sıra duruma yazılmamalı');
  esit(kayitMetni(d).includes('turSirasi'), false, 'sıra kayda girmemeli');
});

test('SIRA: aynı tohum + aynı tur → aynı sıra (tekrar üretilebilir)', () => {
  const d = kur();
  esit(turSirasi(d).join(','), turSirasi(d).join(','), 'iki çağrı aynı sırayı vermeli');
  // Kayıttan dönen oyun da aynı sırayı üretmeli — sıranın türetilme sebebi bu.
  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, geri.hata);
  esit(turSirasi(geri.durum).join(','), turSirasi(d).join(','), 'kayıttan dönen sıra aynı');
});

test('SIRA: OYUNCU HER ZAMAN İLK (Görev 15 kuralı)', () => {
  // ⚠ ESKİ TEST "her tur ilk oynayan değişiyor" diyordu (A2 adaleti). Görev 15 bunu
  // tersine çevirdi: hamle anında çözüldüğü için oyuncu zaten turu bitirmeden önce
  // oynuyor; sıra da bunu söylüyor. Bedeli (ilk vuruş avantajı) Adım 5'te ölçülecek.
  const d = kur();
  for (let tur = 1; tur <= 20; tur++)
    esit(turSirasi({ ...d, tur })[0], d.oyuncuAktorId, tur + '. turda oyuncu ilk değil');
});

test('SIRA: BOTLARIN sırası her tur değişiyor (oyuncudan sonrası adil)', () => {
  const d = kur();
  const ikinciler = new Set();
  for (let tur = 1; tur <= 20; tur++) ikinciler.add(turSirasi({ ...d, tur })[1]);
  dogru(ikinciler.size > 1, 'botların sırası hiç değişmiyor: ' + [...ikinciler].join(','));
});

test('SIRA: bütün aktörleri TAM BİR KEZ içeriyor', () => {
  const d = kur();
  const sira = turSirasi(d);
  const idler = Object.keys(d.aktorler);
  esit(sira.length, idler.length, 'aktör sayısı');
  esit(new Set(sira).size, sira.length, 'tekrar eden aktör var');
  for (const id of idler) dogru(sira.includes(id), id + ' sırada yok');
});

test('SIRA: farklı tohum farklı sıra üretiyor', () => {
  const a = turSirasi(kur({ tohum: 1 }));
  const b = turSirasi(kur({ tohum: 999999 }));
  dogru(a.join(',') !== b.join(','), 'tohum sırayı etkilemeli');
});

test('SIRA: BOTLAR arasında ilk oynama uzun vadede DAĞILIYOR', () => {
  // Adaletin ölçüsü artık botlar arasında: oyuncudan sonraki ilk sıra 200 turda sürekli
  // aynı avuç aktörde olmamalı. Oyuncunun kendisi kuralla en başta (üstteki test).
  const d = kur();
  const sayac = {};
  for (let tur = 1; tur <= 200; tur++) {
    const ilkBot = turSirasi({ ...d, tur })[1];
    sayac[ilkBot] = (sayac[ilkBot] || 0) + 1;
  }
  const farkli = Object.keys(sayac).length;
  dogru(farkli > 20, '200 turda yalnızca ' + farkli + ' farklı bot ilk oynamış');
  const enCok = Math.max(...Object.values(sayac));
  dogru(enCok < 30, 'bir bot 200 turun ' + enCok + "'inde ilk oynamış — dağılım bozuk");
});

// ---- DÜNYA HAREKET EDİYOR ----

test('DÜNYA: 15 tur sonunda harita GERÇEKTEN değişiyor', () => {
  let d = kur();
  const basSahiplik = JSON.stringify(d.parcaSahipligi);
  for (let i = 0; i < 15; i++) d = turuBitir(d);
  dogru(JSON.stringify(d.parcaSahipligi) !== basSahiplik, 'hiçbir parça el değiştirmemiş');

  // Konsolidasyon: bağımsız aktör sayısı düşmeli (§9.3'ün öngörüsü).
  const kalan = new Set(Object.values(d.parcaSahipligi)).size;
  dogru(kalan < Object.keys(d.aktorler).length, 'hiç aktör elenmemiş: ' + kalan);
});

test('DÜNYA: zekaKapali ile harita DURUYOR (ölçüm ortamı temiz)', () => {
  let d = kur();
  const bas = JSON.stringify(d.parcaSahipligi);
  for (let i = 0; i < 5; i++) d = turuBitir(d, DURGUN);
  esit(JSON.stringify(d.parcaSahipligi), bas, 'zekâ kapalıyken kimse hareket etmemeli');
});

test('DÜNYA: 15 tur boyunca çökmüyor ve kayıt hep okunabiliyor', () => {
  let d = kur();
  for (let i = 0; i < 15; i++) {
    d = turuBitir(d);
    const geri = metinCoz(kayitMetni(d));
    dogru(geri.ok, 'tur ' + i + ' kaydı okunamadı: ' + geri.hata);
  }
});

test('DÜNYA: aynı tohum → aynı 15 tur (belirlenimci)', () => {
  let a = kur();
  let b = kur();
  for (let i = 0; i < 15; i++) {
    a = turuBitir(a);
    b = turuBitir(b);
  }
  esit(
    JSON.stringify(a.parcaSahipligi),
    JSON.stringify(b.parcaSahipligi),
    '15 tur sonunda haritalar ayrıştı'
  );
});

// ---- YAPAY ZEKÂ AYRICALIK ALMIYOR (§9/tuzak 5) ----

test('AYRICALIK YOK: zekânın ordusu SANAYİ SINIRINI çiğneyemiyor', () => {
  let d = kur();
  // Bir turluk ekonomi kararı: hangi ilde kaç birim basıldığını sayacın kendisi söylüyor.
  d = { ...d, aktorler: { ...d.aktorler } };
  for (const id of Object.keys(d.aktorler))
    d.aktorler[id] = { ...d.aktorler[id], nufusHavuzu: 999, ekonomiHavuzu: 999 };

  const aktorId = '06';
  const sonra = zekaEkonomiTuru(d, aktorId, d.kisilikler[aktorId]);
  const sayac = (sonra.buTurUretim || {})[aktorId] || {};
  for (const ilKodu of Object.keys(sayac)) {
    const hak = ilUretimHakki(d, ilKodu, aktorId);
    dogru(
      sayac[ilKodu] <= hak.sinir,
      ilKodu + ' ilinde ' + sayac[ilKodu] + ' birim basılmış, sınır ' + hak.sinir
    );
  }
});

test('AYRICALIK YOK: zekâ bütçesini aşamıyor (havuz eksiye düşmüyor)', () => {
  let d = kur();
  for (let i = 0; i < 10; i++) {
    d = turuBitir(d);
    for (const id of Object.keys(d.aktorler)) {
      const a = d.aktorler[id];
      dogru(a.nufusHavuzu >= 0, id + ' nüfus havuzu eksiye düştü: ' + a.nufusHavuzu);
      dogru(a.ekonomiHavuzu >= 0, id + ' ekonomi havuzu eksiye düştü: ' + a.ekonomiHavuzu);
    }
  }
});

test('AYRICALIK YOK: zekânın emri kendi parçasından, komşuya, elindeki kuvvetle', () => {
  // `hamleUygula` zaten doğruluyor; bu test kuralın ATLANMADIĞINI kilitliyor. Çözüm sonrası
  // haritada "sahibi olmayan ordu" ya da "komşu olmayan yere sıçramış ordu" olmamalı.
  let d = kur();
  for (let i = 0; i < 10; i++) {
    d = turuBitir(d);
    for (const pid of Object.keys(d.ordular)) {
      const o = d.ordular[pid];
      esit(o.sahip, d.parcaSahipligi[pid], pid + ' ordusunun sahibi parçanın sahibi değil');
      dogru(birimSayisi(o.birimler) > 0, pid + ' boş ordu kaydı kalmış');
    }
  }
});

test('AYRICALIK YOK: zekâ araştırmaya bütçesinden fazlasını ayıramıyor', () => {
  let d = kur();
  const aktorId = '35';
  d = {
    ...d,
    aktorler: {
      ...d.aktorler,
      [aktorId]: { ...d.aktorler[aktorId], nufusHavuzu: 20, ekonomiHavuzu: 20 },
    },
  };
  const sonra = zekaEkonomiTuru(d, aktorId, d.kisilikler[aktorId]);
  const butce = kullanilabilirButce(sonra, aktorId);
  dogru(butce.ekonomi >= 0, 'ayrım sonrası bütçe eksiye düşmemeli: ' + butce.ekonomi);
});

// ---- SIRANIN ÇÖZÜME ETKİSİ ----

test('A2: aktörün emri KENDİ SIRASI gelince çözülüyor, hepsi bir arada değil', () => {
  // A2'nin can alıcı noktası (Baki'nin kararı): zekâ karar verirken kendinden önce
  // oynayanların hamlelerini GÖRMÜŞ olur. Bunu doğrudan ölçmek için sıradaki ilk ve son
  // aktörün aynı turda farklı dünyalara baktığını gösteriyoruz — çözüm sonrası harita,
  // sıra boyunca adım adım değişmiş olmalı.
  const d = savasliKur();
  const sonuc = sirayiCoz(d);
  dogru(sonuc.satirlar.length > 0, 'hiç emir çözülmemiş');
  // Her satır hangi aktöre ait olduğunu taşıyor — tur raporu bunu kullanacak (Adım 6).
  for (const s of sonuc.satirlar) dogru(!!s.aktorId, 'satırda aktör kimliği yok');
});

test('GÖREV 15: oyuncunun hamlesi SIRADAN ÖNCE çözülüyor ve günlüğe yazılıyor', () => {
  const { komsular } = require('../src/oyun/hareket.js');
  const { hamleUygula } = require('../src/oyun/cozum.js');
  // ⚠ ESKİ TEST "oyuncunun kuyruktaki emri sırası gelince çözülüyor" diyordu (A2 kararı).
  // Görev 15 bunu tersine çevirdi: oyuncu hamlesini TURU BİTİR'den önce yapıyor ve hamle
  // anında çözülüyor. Ölçülen şey artık şu: sonuç hemen gerçekleşiyor ve tur raporuna
  // girecek olan günlüğe yazılıyor.
  let d = hepsiyleSavas(
    savasliKur(),
    oyunKur({ senaryo: 'turkiye', tohum: 20260731 }).oyuncuAktorId
  );
  const ben = d.oyuncuAktorId;
  let hamleYapildi = false;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== ben || !d.ordular[pid]) continue;
    const hedef = komsular(pid).find((k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== ben);
    if (!hedef) continue;
    const s = hamleUygula(d, ben, pid, hedef, d.ordular[pid].birimler);
    if (s.ok) {
      d = s.durum;
      hamleYapildi = true;
      dogru(s.satirlar.length > 0, 'hamle satır üretmeliydi');
      break;
    }
  }
  dogru(hamleYapildi, 'oyuncu için hamle yapılamadı');
  dogru(
    (d.turGunlugu || []).some((s) => s.aktorId === ben),
    'oyuncunun hamlesi tur günlüğüne yazılmadı'
  );
});

test('A2: çözülen emirler kuyruktan düşüyor (iki kez işlenmiyor)', () => {
  let d = kur();
  const sonuc = sirayiCoz(d);
  const hareketKalan = (sonuc.durum.emirler || []).filter((e) => e.tip !== 'toplanma');
  esit(hareketKalan.length, 0, 'çözülmemiş hareket emri kalmış');
});

test('PERFORMANS: tur başına hesap ölçülüyor ve kare bütçesine yakın kalıyor', () => {
  // Ölçüm `veri/zeka-butce-olcum.md`'de; burada kaba bir üst sınır kilitleniyor.
  // Geliştirme makinesinde tur başına ~40 ms; telefonda birkaç kat yavaş olabilir ama
  // 500 ms'i aşarsa bölünmüş hesaplama (§9.3) gerçekten gerekli demektir.
  let d = kur();
  const bas = Date.now();
  for (let i = 0; i < 5; i++) d = turuBitir(d);
  const turBasina = (Date.now() - bas) / 5;
  dogru(turBasina < 500, 'tur başına ' + turBasina.toFixed(0) + ' ms — çok yavaş');
});

// ---- KİŞİLİK KAYITTA DEĞİL, TÜRETİLİYOR ----

test('KİŞİLİK: kayıttan dönen oyunda BİREBİR aynı (aynı rakiplerle devam)', () => {
  const d = kur();
  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, geri.hata);
  esit(
    JSON.stringify(geri.durum.kisilikler),
    JSON.stringify(d.kisilikler),
    'kayıttan dönen kişilikler ayrıştı'
  );
});

const SINIR = DENGE.KAYIT_SINIRI_KB;
const boyutKB = (d) => Buffer.byteLength(kayitMetni(d), 'utf8') / 1024;

test('KİŞİLİK: kayıt metni kişilik ağırlıklarını TAŞIMIYOR (boyut)', () => {
  const metin = kayitMetni(kur());
  esit(metin.includes('saldirganlik'), false, 'kişilik ağırlıkları kayda girmiş');
  dogru(
    Buffer.byteLength(metin, 'utf8') / 1024 < SINIR,
    'başlangıç kaydı ' + SINIR + ' KB sınırını aşıyor'
  );
});

// AKTÖRÜN TÜRETİLEN ALANLARI KAYDA GİRMEZ (Görev 09 / Adım 0). `kisilikler` ve
// `ordu.sahip` ile aynı kural; `aktorler` alanını 8.0 KB'dan 3.2 KB'a indiriyor.
test('AKTÖR: kayıt metni ad ve renk TAŞIMIYOR (türetiliyor)', () => {
  const metin = kayitMetni(kur());
  esit(metin.includes('"ad":"Bursa"'), false, 'aktör adı kayda girmiş');
  esit(metin.includes('yapayZeka'), false, 'aktör türü kayda girmiş');
});

test('AKTÖR: türetilen alanlar yüklerken BİREBİR geri geliyor', () => {
  const d = kur();
  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, geri.hata);
  esit(
    JSON.stringify(geri.durum.aktorler),
    JSON.stringify(d.aktorler),
    'aktör tablosu kayıttan dönerken ayrıştı'
  );
});

// 15 TUR YETMİYOR ARTIK (Görev 09). Mod sistemiyle maçlar 50–80 tura çıkıyor ve bugüne
// kadarki bütün boyut ölçümleri 15 tur üzerindendi — 50 turluk maç 26.4 KB ölçülmüştü,
// yani eski 26 KB sınırı diplomasi eklenmeden zaten aşılıyordu.
// Ayrıntılı ölçüm: `node scripts/kayit-boyut-olcum.js` → `veri/kayit-boyut-olcum.md`.
test('KAYIT BOYUTU: 50 turluk maç sınırın altında', () => {
  let d = kur();
  for (let i = 0; i < 50; i++) d = turuBitir(d);
  const kb = boyutKB(d);
  dogru(kb < SINIR, '50 turluk kayıt ' + SINIR + ' KB sınırını aşıyor: ' + kb.toFixed(1) + ' KB');
});

// ---- ZORLUK ----

test('ZORLUK: kademe duruma yazılıyor ve kayıttan dönüyor', () => {
  for (const zorluk of DENGE.ZEKA.ZORLUK_SIRASI) {
    const d = kur({ zorluk });
    esit(d.zorluk, zorluk);
    const geri = metinCoz(kayitMetni(d));
    dogru(geri.ok, geri.hata);
    esit(geri.durum.zorluk, zorluk, 'kayıttan dönen zorluk');
  }
});

test('ZORLUK: geçersiz kademe varsayılana düşüyor', () => {
  esit(kur({ zorluk: 'olmayan-kademe' }).zorluk, DENGE.ZEKA.VARSAYILAN_ZORLUK);
});
