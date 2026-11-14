// MOD, KAZANMA KOŞULU VE ÇERÇEVE TESTLERİ (Görev 09 / Adım 5–6 — görev belgesi §9).
//
// Bu adımların bitiş ölçütü: MAÇ BİTİYOR. Sekiz görevdir oyun oynanıyordu ama
// bitirilemiyordu. Testler dört şeyi kilitliyor:
//   1. Kazanma kontrolü TEK YERDE — moda göre değişen koşul ikinci bir yerde yaşamıyor.
//   2. Üç modun üçünde de hem kazanma hem yenilgi tetikleniyor.
//   3. Hedef göstergesi kazanma kontrolüyle AYNI sayılardan besleniyor.
//   4. Menü ↔ maç gidiş dönüşünde oyun durumu bozulmuyor (§10/8'in "en olası sessiz hatası").

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const { modBilgisi, sonucKontrol, sonucMetni, hedefDurumu } = require('../src/oyun/mod.js');
const {
  senaryoKapsami,
  modTurSiniri,
  modKazanmaEsigi,
  SENARYOLAR,
} = require('../src/oyun/senaryolar.js');

const kur = (sec) => oyunKur({ senaryo: 'karadeniz', tohum: 20260801, ...(sec || {}) });

// Oyuncuya n parça verir — eşik sınamaları için. Kalan parçalar KENDİ İLLERİNDE kalır
// (oyuncunun eski parçaları '99'a). Eskiden kalanın hepsi tek bir '99'a gidiyordu; rakip
// eşiği bitirmeye başlayınca (Görev 20) o '99' her %50 sınamasında hedefe ulaşmış bir dev
// oldu ve oyuncunun eşiğini ölçen testler rakibin zaferini ölçer hâle geldi.
function parcaVer(d, n) {
  const sahiplik = { ...d.parcaSahipligi };
  const pidler = Object.keys(sahiplik).sort();
  const baskasi = '99';
  let verilen = 0;
  for (const pid of pidler) {
    const eski = d.parcaSahipligi[pid];
    sahiplik[pid] = verilen < n ? d.oyuncuAktorId : eski === d.oyuncuAktorId ? baskasi : eski;
    verilen++;
  }
  return { ...d, parcaSahipligi: sahiplik };
}

// Bir RAKİBE n parça verir, kalanı kendi illerinde (oyuncu kendi parçalarını korur).
function rakibeVer(d, rakip, n) {
  const sahiplik = { ...d.parcaSahipligi };
  let verilen = 0;
  for (const pid of Object.keys(sahiplik).sort()) {
    if (sahiplik[pid] === d.oyuncuAktorId || verilen >= n) continue;
    sahiplik[pid] = rakip;
    verilen++;
  }
  return { ...d, parcaSahipligi: sahiplik };
}

// ---- MOD TANIMI ----

test('MOD: kayda yalnızca tip ve kapsam giriyor, sınır ve eşik TÜRETİLİYOR', () => {
  const d = kur({ mod: 'yarim' });
  esit(d.mod.tip, 'yarim', 'mod tipi duruma yazılmamış');
  esit(d.mod.kapsam, 'karadeniz', 'kapsam duruma yazılmamış');
  const metin = kayitMetni(d);
  esit(metin.includes('turSiniri'), false, 'tur sınırı kayda girmiş (türetilmeliydi)');
  esit(metin.includes('kazanmaEsigi'), false, 'kazanma eşiği kayda girmiş (türetilmeliydi)');
});

test('MOD: tur sınırı KAPSAM BÜYÜKLÜĞÜNE göre ölçekleniyor', () => {
  // 2026-08-08: fetih ve %50 hâkimiyet SINIRSIZ oldu, ölçekleme kuralı artık yalnızca
  // Güç Yarışı'nda görünüyor — orada tur sınırı bir üst sınır değil, maçın kendisi.
  const buyuk = modTurSiniri('puan', 'turkiye');
  const kucuk = modTurSiniri('puan', 'karadeniz');
  dogru(buyuk > kucuk, 'Türkiye maçı bölge maçından uzun olmalı: ' + buyuk + ' vs ' + kucuk);
  // Sabit sayı olsaydı bölge maçı sınırın çok altında biter ve kalanı formalite olurdu.
  dogru(kucuk >= 12 && kucuk <= 45, 'bölge maçı ' + kucuk + ' tur — makul aralıkta değil');
});

test('MOD: fetih ve %50 hâkimiyet SINIRSIZ, güç yarışı sınırlı', () => {
  // Baki'nin isteği (2026-08-08): iki fetih modunda üst tur sınırı yok. Güç Yarışı'nın
  // sınırı DURUYOR — o modda tur sınırı kazanma koşulunun kendisi, kaldırılamaz.
  esit(modTurSiniri('fetih', 'turkiye'), Infinity);
  esit(modTurSiniri('yarim', 'turkiye'), Infinity);
  dogru(isFinite(modTurSiniri('puan', 'turkiye')), 'güç yarışı sınırlı kalmalı');
});

test('MOD: üç modun eşiği farklı ve büyüklük sırası doğru', () => {
  const toplam = senaryoKapsami('turkiye').kapsamParcalar.length;
  esit(modKazanmaEsigi('fetih', 'turkiye'), toplam, 'tam fetih eşiği kapsamın tamamı olmalı');
  esit(modKazanmaEsigi('yarim', 'turkiye'), Math.ceil(toplam / 2), 'yarım fetih eşiği yanlış');
  esit(modKazanmaEsigi('puan', 'turkiye'), null, 'güç yarışında eşik olmamalı (sıralama belirler)');
});

test('MOD: bilinmeyen mod anlaşılır hata veriyor', () => {
  let hata = null;
  try {
    modTurSiniri('yokboyle', 'turkiye');
  } catch (e) {
    hata = e.message;
  }
  dogru(hata !== null && hata.includes('yokboyle'), 'hata mesajı modu söylemiyor: ' + hata);
});

// ---- KAZANMA VE YENİLGİ: ÜÇ MODUN ÜÇÜNDE DE ----

test('KAZANMA: FETİH — kapsamın tamamı alınınca kazanılıyor', () => {
  const d = kur({ mod: 'fetih' });
  const toplam = Object.keys(d.parcaSahipligi).length;
  esit(sonucKontrol(parcaVer(d, toplam - 1)), null, 'eksik parçayla kazanılmış');
  const s = sonucKontrol(parcaVer(d, toplam));
  esit(s && s.sonuc, 'kazandi', 'tamamı alındığı hâlde kazanılmadı');
  esit(s.sebep, 'esik', 'kazanma sebebi eşik değil');
});

test('KAZANMA: YARIM FETİH — yarısında kazanılıyor, tamamı beklenmiyor', () => {
  const d = kur({ mod: 'yarim' });
  const esik = modKazanmaEsigi('yarim', 'karadeniz');
  esit(sonucKontrol(parcaVer(d, esik - 1)), null, 'eşiğin altında kazanılmış');
  esit(sonucKontrol(parcaVer(d, esik)).sonuc, 'kazandi', 'eşikte kazanılmadı');
});

test('YENİLGİ: %50 HÂKİMİYET — rakip eşiğe senden önce ulaşırsa maç biter', () => {
  const d = kur({ mod: 'yarim' });
  const esik = modKazanmaEsigi('yarim', 'karadeniz');
  const rakip = Object.keys(d.aktorler).find((id) => id !== d.oyuncuAktorId);
  esit(sonucKontrol(rakibeVer(d, rakip, esik - 1)), null, 'eşiğin altındaki rakip bitirdi');
  const s = sonucKontrol(rakibeVer(d, rakip, esik));
  esit(s && s.sonuc, 'yenildi', 'eşiğe ulaşan rakip maçı bitirmedi');
  esit(s.sebep, 'rakip');
  esit(s.kazanan, rakip, 'kazanan rakip yanlış');
  // Cümlede rakibin adı var — kime kaybettiğin belli.
  dogru(sonucMetni(d, s).alt.includes(d.aktorler[rakip].ad), 'rakibin adı yok');
});

test('YENİLGİ: rakip eşiği kapatılınca eski davranış (yalnızca elenince kaybedilir)', () => {
  const d = kur({ mod: 'yarim' });
  const esik = modKazanmaEsigi('yarim', 'karadeniz');
  const rakip = Object.keys(d.aktorler).find((id) => id !== d.oyuncuAktorId);
  const eski = DENGE.MOD.RAKIP_ESIGI_BITIRIR;
  try {
    DENGE.MOD.RAKIP_ESIGI_BITIRIR = false;
    esit(sonucKontrol(rakibeVer(d, rakip, esik)), null, 'anahtar kapalıyken maç bitti');
  } finally {
    DENGE.MOD.RAKIP_ESIGI_BITIRIR = eski;
  }
});

test('KAZANMA: GÜÇ YARIŞI — süre dolmadan kazanılmıyor, dolunca toprağa bakılıyor', () => {
  const d = kur({ mod: 'puan' });
  const sinir = modTurSiniri('puan', 'karadeniz');
  const toplam = Object.keys(d.parcaSahipligi).length;

  // Süre dolmadan: her şeyi alsa bile maç sürüyor (eşik yok).
  esit(sonucKontrol(parcaVer(d, toplam)), null, 'güç yarışı süre dolmadan bitti');

  // Süre dolunca: en çok toprağı olan kazanır.
  const bitti = { ...parcaVer(d, toplam - 1), tur: sinir + 1 };
  esit(sonucKontrol(bitti).sonuc, 'kazandi', 'en büyük güç olduğu hâlde kazanmadı');
  esit(sonucKontrol(bitti).sebep, 'toprak', 'sebep toprak değil');

  const kaybetti = { ...parcaVer(d, 1), tur: sinir + 1 };
  esit(sonucKontrol(kaybetti).sonuc, 'yenildi', 'küçük kaldığı hâlde kaybetmedi');
});

test('YENİLGİ: elinde parça kalmayan oyuncu her modda eleniyor', () => {
  for (const mod of Object.keys(DENGE.MOD.TIPLER)) {
    const d = parcaVer(kur({ mod }), 0);
    const s = sonucKontrol(d);
    esit(s && s.sonuc, 'yenildi', mod + ' modunda elenme yakalanmadı');
    esit(s.sebep, 'elendin', mod + ' modunda yenilgi sebebi yanlış');
  }
});

// SIRA ÖNEMLİ: elenmiş oyuncu "toprakla kazanamaz". Süre dolduğunda hem parçası 0 hem
// tur sınırı aşılmışsa YENİLGİ çıkmalı, "en büyük güç" hesabına hiç girilmemeli.
test('YENİLGİ: elenme, süre kontrolünden ÖNCE bakılıyor', () => {
  const d = kur({ mod: 'puan' });
  const bitti = { ...parcaVer(d, 0), tur: modTurSiniri('puan', 'karadeniz') + 5 };
  esit(sonucKontrol(bitti).sebep, 'elendin', 'elenmiş oyuncu için süre sebebi döndü');
});

test('SONUÇ METNİ: MODA GÖRE değişiyor ve motordan geliyor', () => {
  // Metnin KENDİSİ sınanmıyor (yazım değişebilir), MODA GÖRE DEĞİŞTİĞİ sınanıyor:
  // ortak bir kalıba sıkıştırılırsa bu test kalır.
  const fetih = sonucMetni(kur({ mod: 'fetih' }), { sonuc: 'kazandi', sebep: 'esik' });
  const yarim = sonucMetni(kur({ mod: 'yarim' }), { sonuc: 'kazandi', sebep: 'esik' });
  dogru(fetih.alt !== yarim.alt, 'iki modun zafer cümlesi aynı');
  esit(fetih.baslik, 'KAZANDIN', 'zafer başlığı yanlış');

  const yenildi = sonucMetni(kur({ mod: 'yarim' }), { sonuc: 'yenildi', sebep: 'elendin' });
  esit(yenildi.baslik, 'YENİLDİN', 'yenilgi başlığı yanlış');
  // Oyuncunun kelimesi BÖLGE, "parça" bir geliştirme terimi (2026-08-01).
  esit(yenildi.alt.includes('parça'), false, 'yenilgi cümlesinde "parça" geçiyor');

  // Süre dolunca gelen cümle, eşikle kazanmadan FARKLI olmalı — ikisi ayrı his.
  const sureyle = sonucMetni(kur({ mod: 'yarim' }), { sonuc: 'kazandi', sebep: 'toprak' });
  dogru(sureyle.alt !== yarim.alt, 'süreyle kazanma ile eşikle kazanma aynı cümle');
});

// ---- HEDEF GÖSTERGESİ ----

test('HEDEF: gösterge kazanma kontrolüyle AYNI sayıları kullanıyor', () => {
  const d = kur({ mod: 'yarim' });
  const esik = modKazanmaEsigi('yarim', 'karadeniz');
  const tam = parcaVer(d, esik);
  const h = hedefDurumu(tam);
  esit(h.benim, esik, 'gösterge parça sayısını yanlış okuyor');
  esit(h.esik, esik, 'gösterge eşiği yanlış okuyor');
  // Gösterge hedefe ulaştığını söylüyorsa kontrol de kazandı demeli.
  esit(sonucKontrol(tam).sonuc, 'kazandi', 'gösterge ile kontrol ayrıştı');
});

test('HEDEF: güç yarışında SIRALAMA yazıyor, eşik değil', () => {
  const h = hedefDurumu(kur({ mod: 'puan' }));
  esit(h.esik, null, 'güç yarışında eşik döndü');
  dogru(h.sira >= 1, 'sıra hesaplanmamış');
  // ⚠ `toLowerCase()` KULLANILMIYOR: JavaScript Türkçe'yi bilmiyor ve 'SIRADASIN' →
  // 'siradasin' veriyor (noktalı i), yani 'sırada' araması tutmaz. Metin zaten büyük
  // harfle üretiliyor, olduğu gibi aranıyor.
  dogru(h.metin.includes('SIRADA'), 'metin sıralamadan bahsetmiyor: ' + h.metin);
  // Mod adı metne GİRMEMELİ: oyuncu modu kurulumda seçti, her tur tekrarı şeridi uzatıyor.
  esit(h.metin.includes(h.ad), false, 'hedef şeridinde mod adı tekrar ediyor: ' + h.metin);
});

test('HEDEF: kalan tur doğru sayılıyor ve eksiye düşmüyor', () => {
  const d = kur({ mod: 'puan' });
  const sinir = modTurSiniri('puan', 'karadeniz');
  esit(hedefDurumu({ ...d, tur: 1 }).kalanTur, sinir, 'ilk turda kalan tur yanlış');
  esit(hedefDurumu({ ...d, tur: sinir + 99 }).kalanTur, 0, 'kalan tur eksiye düştü');
});

// ---- GERÇEK OYUN: MAÇ GERÇEKTEN BİTİYOR ----

test('GERÇEK OYUN: süre dolunca maç kendiliğinden sonuçlanıyor', () => {
  let d = kur({ mod: 'puan', zorluk: 'zor' });
  const sinir = modTurSiniri('puan', 'karadeniz');
  for (let i = 0; i < sinir + 2 && !d.sonuc; i++) d = turuBitir(d);
  dogru(d.sonuc !== null, sinir + ' turluk maç ' + d.tur + '. turda hâlâ bitmedi');
});

test('GERÇEK OYUN: sonuç bir kez yazılıyor, sonraki turlar EZMİYOR (devam et)', () => {
  let d = kur({ mod: 'puan', zorluk: 'zor' });
  const sinir = modTurSiniri('puan', 'karadeniz');
  for (let i = 0; i < sinir + 2 && !d.sonuc; i++) d = turuBitir(d);
  const ilk = d.sonuc;
  dogru(ilk !== null, 'maç bitmedi');
  // "Devam et" (§6/7): oyuncu haritayı temizlemeye devam edebilir, sonuç değişmez.
  for (let i = 0; i < 3; i++) d = turuBitir(d);
  esit(d.sonuc, ilk, 'maç bittikten sonra sonuç değişti');
});

// ---- ÇERÇEVE: MENÜ ↔ MAÇ (§10/8 "bu görevin en olası sessiz hatası") ----

test('ÇERÇEVE: farklı modda kurulan maçlar birbirini ETKİLEMİYOR', () => {
  const a = oyunKur({ senaryo: 'karadeniz', mod: 'fetih', tohum: 1 });
  const b = oyunKur({ senaryo: 'turkiye', mod: 'puan', tohum: 2 });
  esit(a.mod.tip, 'fetih', 'ilk maçın modu bozuldu');
  esit(a.mod.kapsam, 'karadeniz', 'ilk maçın kapsamı bozuldu');
  esit(b.mod.tip, 'puan', 'ikinci maçın modu bozuldu');
  dogru(
    Object.keys(a.parcaSahipligi).length < Object.keys(b.parcaSahipligi).length,
    'kapsamlar ayrışmamış — bölge maçı Türkiye kadar büyük'
  );
});

test('ÇERÇEVE: kaydedilip yüklenen maç BİREBİR aynı (menü → maç → menü)', () => {
  let d = kur({ mod: 'yarim', zorluk: 'zor' });
  for (let i = 0; i < 5; i++) d = turuBitir(d);
  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, geri.hata);
  esit(kayitMetni(geri.durum), kayitMetni(d), 'gidiş dönüşte durum değişti');
  esit(geri.durum.mod.tip, 'yarim', 'mod kayıttan dönmedi');
  esit(geri.durum.mod.kapsam, 'karadeniz', 'kapsam kayıttan dönmedi');
  // Hedef ve sonuç da aynı çıkmalı — yüklenen maç başka bir maç olmamalı.
  esit(hedefDurumu(geri.durum).metin, hedefDurumu(d).metin, 'yüklenen maçın hedefi ayrıştı');
});

test('ÇERÇEVE: modsuz kayıt REDDEDİLİYOR (sürüm 8 sinsiliği)', () => {
  const bozuk = JSON.parse(kayitMetni(kur()));
  delete bozuk.mod;
  const s = metinCoz(JSON.stringify(bozuk));
  esit(s.ok, false, 'modsuz kayıt kabul edildi — maç hiç bitmezdi');
  dogru(s.hata.includes('mod'), 'hata mesajı modu söylemiyor: ' + s.hata);
});

test('ÇERÇEVE: kapsam listesi TEK YERDE — senaryolar DENGE.MOD.KAPSAMLAR ile birebir', () => {
  esit(
    Object.keys(SENARYOLAR).sort().join(','),
    DENGE.MOD.KAPSAMLAR.map((k) => k.anahtar)
      .sort()
      .join(','),
    'kapsam listesi iki yerde ayrışmış (§10/4)'
  );
  // Her kapsamın varsayılan oyuncusu KENDİ kapsamında olmalı; değilse maç başlar başlamaz
  // yenilgi tetiklenirdi.
  for (const k of DENGE.MOD.KAPSAMLAR) {
    const kapsam = senaryoKapsami(k.anahtar);
    dogru(
      kapsam.kapsamIller.includes(k.varsayilanOyuncu),
      k.ad + ' kapsamının varsayılan oyuncusu kapsam dışında'
    );
  }
});

test('ÇERÇEVE: bölge maçında kapsam dışı iller AKTÖR DEĞİL', () => {
  const d = kur();
  const kapsam = new Set(senaryoKapsami('karadeniz').kapsamIller);
  for (const id of Object.keys(d.aktorler))
    dogru(kapsam.has(id), 'kapsam dışı il aktör olmuş: ' + id);
  // ...ve kapsam dışı parçalar sahiplik tablosunda hiç yok (gelir üretmiyor, zekâ görmüyor).
  for (const pid of Object.keys(d.parcaSahipligi))
    dogru(kapsam.has(d.parcaSahipligi[pid]), 'kapsam dışı parça sahiplenilmiş: ' + pid);
});

test('MOD BİLGİSİ: modsuz eski duruma da çalışıyor (varsayılana düşüyor)', () => {
  const d = kur();
  const modsuz = { ...d };
  delete modsuz.mod;
  const m = modBilgisi(modsuz);
  esit(m.tip, DENGE.MOD.VARSAYILAN_TIP, 'varsayılan moda düşmedi');
  esit(m.kapsam, 'karadeniz', 'kapsam senaryodan okunmadı');
});
