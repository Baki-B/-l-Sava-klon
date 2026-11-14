// SAHNE VE REKABET ZEMİNİ — TESTLER (Görev 08 / Adım 0).
//
// Adım 0 ekranda hiçbir şey değiştirmiyor: yalnızca denge sayıları, husumet tablosu ve
// kararlar konuyor. Buradaki testler de o yüzden DAVRANIŞ değil, ZEMİN sınıyor —
// sonraki adımlar bu zeminin üstüne yazılacak ve zemin sessizce kaymamalı.
//
// İki şey özellikle kilitleniyor:
//   1. Husumet tablosunun BİÇİMİ. Baki bu dosyayı elle dolduruyor; bozuk bir satır
//      düellonun oyunun ortasında sessizce tetiklenmemesi demek.
//   2. "Satır eklemek YALNIZCA veri değişikliği" (görev belgesi §9). Kodun içine tek bir
//      savaş adı sızarsa bu kural sessizce ölür — aşağıdaki test onu yakalıyor.

const { test, dogru, esit, savasYaz } = require('./yardimci');
const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { HUSUMETLER } = require('../veri/husumetler.js');

const S = DENGE.SAHNE;
const R = DENGE.REKABET;
const T = DENGE.ZEKA.TAKVIYE;
const IL_KODLARI = Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, '0'));

// ============================================================
// HUSUMET TABLOSU
// ============================================================

test('husumet tablosu dizi ve dolu', () => {
  dogru(Array.isArray(HUSUMETLER), 'HUSUMETLER dizi değil');
  dogru(HUSUMETLER.length > 0, 'husumet tablosu boş');
});

test('husumet satırlarının dört alanı da dolu', () => {
  for (const h of HUSUMETLER)
    for (const alan of ['ilA', 'ilB', 'konu', 'ad'])
      dogru(
        typeof h[alan] === 'string' && h[alan].trim() !== '',
        JSON.stringify(h) + " satırında '" + alan + "' boş"
      );
});

test('husumet il kodları geçerli ve bir il kendisiyle hasım değil', () => {
  for (const h of HUSUMETLER) {
    dogru(IL_KODLARI.includes(h.ilA), "geçersiz il kodu '" + h.ilA + "'");
    dogru(IL_KODLARI.includes(h.ilB), "geçersiz il kodu '" + h.ilB + "'");
    dogru(h.ilA !== h.ilB, h.ilA + ' kendisiyle hasım gösterilmiş');
  }
});

// Çift YÖNSÜZ: A–B ile B–A aynı husumettir. İkisi de yazılırsa düello iki kez tetiklenir.
test('aynı hasım çifti iki kez yazılmamış', () => {
  const gorulen = new Set();
  for (const h of HUSUMETLER) {
    const anahtar = [h.ilA, h.ilB].sort().join('-');
    dogru(!gorulen.has(anahtar), anahtar + ' çifti tekrar ediyor');
    gorulen.add(anahtar);
  }
});

// Savaşın ADI kimliğidir — tur raporunda "Fıstık Savaşı" yazınca hangisi olduğu belli olmalı.
test('savaş adları benzersiz', () => {
  const gorulen = new Set();
  for (const h of HUSUMETLER) {
    dogru(!gorulen.has(h.ad), "'" + h.ad + "' adı iki husumette birden kullanılmış");
    gorulen.add(h.ad);
  }
});

// GÖREV BELGESİ §9'UN AÇIK ŞARTI: "Husumet tablosuna satır eklemek YALNIZCA veri
// değişikliği — kod değişmiyor." Bir savaş adı ya da konusu koda sızarsa bu kural ölür
// ve kimse fark etmez; tek yakalama yolu bu.
test('hiçbir savaş adı/konusu src/ içine gömülmemiş', () => {
  const dosyalar = [];
  (function tara(k) {
    for (const g of fs.readdirSync(k, { withFileTypes: true })) {
      const tam = path.join(k, g.name);
      if (g.isDirectory()) tara(tam);
      else if (g.name.endsWith('.js')) dosyalar.push(tam);
    }
  })(path.join(__dirname, '..', 'src'));

  for (const d of dosyalar) {
    const metin = fs.readFileSync(d, 'utf8');
    for (const h of HUSUMETLER) {
      dogru(!metin.includes(h.ad), path.basename(d) + " içinde savaş adı gömülü: '" + h.ad + "'");
      dogru(
        !metin.includes("'" + h.konu + "'"),
        path.basename(d) + " içinde husumet konusu gömülü: '" + h.konu + "'"
      );
    }
  }
});

// ============================================================
// SAHNE DÜĞMELERİ
// ============================================================

test('varsayılan kapsam, kapsam listesinin içinde', () => {
  dogru(S.KAPSAM_SIRASI.includes(S.VARSAYILAN_KAPSAM), 'varsayılan kapsam listede yok');
  esit(S.VARSAYILAN_KAPSAM, 'cephem', 'Baki cephesindeki savaşları izlemek istedi');
});

test('bütün olay süreleri pozitif ve hız çarpanı geçerli', () => {
  dogru(S.HIZ_CARPANI > 0, 'hız çarpanı pozitif olmalı');
  for (const anahtar of Object.keys(S.SURE))
    dogru(S.SURE[anahtar] > 0, anahtar + ' süresi pozitif değil');
});

// Kamera durduğunda PARÇA BAŞINA rozet görünmeli, yoksa sahne rozetlerin hiç
// olmadığı ya da il başına tek rozetin olduğu kademede oynar ve savaş görünmez.
// Üst sınır haritanın gerçek yakınlaştırma tavanı (Harita.js pinch sınırı 7×).
test('kamera yakınlığı rozet katmanının ve harita sınırlarının içinde', () => {
  dogru(
    S.KAMERA.YAKINLIK > DENGE.ROZET.YAKIN_SINIR,
    'kamera yakınlığı YAKIN_SINIR üstünde olmalı (parça başına rozet)'
  );
  dogru(S.KAMERA.YAKINLIK <= 7, 'kamera yakınlığı haritanın 7× tavanını aşıyor');
});

// §6/4: kamera cephedeki en önemli olaya BİR KEZ gider. Her olay için ayrı kaydırma
// baş döndürür — sayı 1'in üstüne çıkarılacaksa bilinçli bir karar olmalı.
test('kamera tur başına en fazla bir kez kayıyor', () => {
  esit(S.KAMERA.EN_COK, 1, 'kamera tur başına bir kez kaymalı');
});

test('tekrar kısaltması olayı kısaltıyor, uzatmıyor', () => {
  dogru(S.TEKRAR_KISALTMA > 0 && S.TEKRAR_KISALTMA < 1, 'kısaltma 0–1 arasında olmalı');
  dogru(S.TEKRAR_ESIGI >= 1, 'tekrar eşiği en az 1 olmalı');
});

// ============================================================
// REKABET
// ============================================================

test('üçüncü taraf kısıtı tanınan bir değer', () => {
  dogru(
    ['kapali', 'cephe', 'topraklar'].includes(R.UCUNCU_TARAF),
    "tanınmayan kısıt: '" + R.UCUNCU_TARAF + "'"
  );
});

// Düello süresi ölçüm koşusundan (15 tur) KISA olmalı, yoksa `scripts/zeka-olcum.js`
// hiçbir düellonun bittiğini göremez ve §6/6'nın bitiş kuralı ölçülemez.
test('düello süresi 15 turluk ölçüm koşusuna sığıyor', () => {
  dogru(R.DUELLO_SURESI > 0, 'düello süresi pozitif olmalı');
  dogru(R.DUELLO_SURESI < 15, 'düello süresi ölçüm koşusundan kısa olmalı');
});

// Kayıt 15 turda 25.2 KB, sınır 26 KB — yani ~0.8 KB pay var (Görev 07 §11/4).
// Düello kaydı `durum.duellolar`a girecek; EN_COK_ETKIN o payın GARANTİ kapağı.
test('etkin düello kapağı kayıt payının altında kalıyor', () => {
  const KAYIT_BASINA_BYTE = 30; // {"a":"52","b":"28","tur":7},
  const PAY_KB = 0.8;
  const enCokKB = (R.EN_COK_ETKIN * KAYIT_BASINA_BYTE) / 1024;
  dogru(
    enCokKB < PAY_KB,
    'en kötü durumda düello kaydı ' + enCokKB.toFixed(2) + ' KB, pay ' + PAY_KB + ' KB'
  );
});

// ============================================================
// YAPAY ZEKÂ TAKVİYESİ
// ============================================================

// Takviyede kuvvet bölünmez: gönderen parçanın düşman komşusu yok, savunacak cephesi de
// yok. Aday listesi büyürse hamle uzayı ikiye katlanır — Adım 1 bunu ölçecek.
test('takviye tek kuvvet adayı kullanıyor', () => {
  dogru(Array.isArray(T.KUVVET_ADAYLARI), 'kuvvet adayları dizi değil');
  esit(T.KUVVET_ADAYLARI.length, 1, 'takviyede tek aday olmalı (tümü)');
  esit(T.KUVVET_ADAYLARI[0], 1, 'takviye kuvvetin tümünü gönderir');
});

test('takviye eşikleri anlamlı', () => {
  dogru(T.EN_AZ_KUVVET >= 2, 'tek birimlik takviye emri verilmemeli');
  dogru(T.EN_AZ_PUAN > 0, 'eşik 0 olursa her kıl payı hamle oynanır');
  dogru(T.TEHDIT_TAVANI > 0, 'tehdit tavanı pozitif olmalı');
  dogru(T.TERIM.TEHDIT > 0 && T.TERIM.YAKINLIK > 0, 'iki terim de pozitif olmalı');
});

// ═══════════════════════════════════════════════════════════════════════
// DÜELLO — TETİKLEME, BİTİŞ, KISIT (Görev 08 / Adım 7)
// ═══════════════════════════════════════════════════════════════════════
//
// Sahne gerçek haritadan kuruluyor: Ordu (52) ile Giresun (28) hem tabloda hasım hem de
// parçaları sınırdaş (52-1 ↔ 28-1). Uydurma bir harita kurulsaydı "tabloda olmayan çift
// tetiklemiyor" testi bir şey kanıtlamazdı.

const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { emirleriCoz } = require('../src/oyun/cozum.js');
const { hareketGecerliMi } = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { moralBonuslari } = require('../src/oyun/cozum.js');
const {
  husumetBul,
  duelloBul,
  duelloDene,
  duellolariGuncelle,
  duelloEngeli,
  duelloGanimetCarpani,
  duelloMoralBonusu,
} = require('../src/oyun/rekabet.js');
const { muttefikler, savasIlanEt } = require('../src/oyun/diplomasi.js');

const ORDU = '52';
const GIRESUN = '28';
const TRABZON = '61'; // üçüncü taraf — 28-1'e komşu ama tabloda Ordu/Giresun ile ilgisi yok

// ---- ⚠ SAVAŞ HALİ YALNIZCA GEREKEN ÇİFTLER ARASINDA (Görev 11) ----
// Düello ilk SALDIRIYLA tetikleniyor ve saldırı artık savaş halini gerektiriyor. Ama
// "herkesle savaş" BURADA KULLANILAMAZ: düellonun giriş şartı tam olarak "tarafların
// BAŞKA savaşı olmasın" (`REKABET.GIRIS_SARTI`). Herkesle savaş yazılsaydı hiçbir düello
// başlamaz ve bu dosyanın tamamı yanlış sebeple yeşile dönerdi.
// O yüzden yalnızca ölçülen çift savaşa sokuluyor; üçüncü taraf testleri kendi çiftini
// ayrıca ekliyor.
function sahne() {
  return savasYaz(oyunKur({ senaryo: 'turkiye', tohum: 20260801 }), ORDU, GIRESUN);
}
function orduKoy(d, parcaId, sahip, birimler) {
  return { ...d, ordular: { ...d.ordular, [parcaId]: { sahip, birimler } } };
}

test('DÜELLO: tabloda olan çift saldırınca tetikleniyor', () => {
  let d = sahne();
  d = orduKoy(d, '52-1', ORDU, { piyade: 4 });
  const e = hamleUygula(d, ORDU, '52-1', '28-1', { piyade: 4 });
  dogru(e.ok, 'emir verilemedi: ' + e.sebep);
  const { durum } = emirleriCoz(e.durum);
  dogru(duelloBul(durum, ORDU, GIRESUN), 'düello başlamadı');
});

test('DÜELLO: tabloda OLMAYAN çift düello tetiklemiyor', () => {
  // Trabzon–Giresun savaşta (saldırının ön koşulu) ama HASIM DEĞİL — düello çıkmamalı.
  let d = savasYaz(sahne(), TRABZON, GIRESUN);
  d = orduKoy(d, '61-1', TRABZON, { piyade: 4 });
  const e = hamleUygula(d, TRABZON, '61-1', '28-1', { piyade: 4 });
  dogru(e.ok, 'emir verilemedi: ' + e.sebep);
  const { durum } = emirleriCoz(e.durum);
  esit(etkinSayi(durum), 0, 'hasım olmayan çift düello başlatmış');
});

function etkinSayi(d) {
  return (d.duellolar || []).length;
}

test('DÜELLO: aynı çift ikinci kez düello başlatmıyor', () => {
  const d = sahne();
  const bir = duelloDene(d, ORDU, GIRESUN);
  const iki = duelloDene(bir.durum, GIRESUN, ORDU); // ters yön — aynı husumet
  esit(iki.duello, null, 'aynı çift ikinci düelloyu başlatmış');
  esit(etkinSayi(iki.durum), 1, 'düello listesi iki kayıt tutuyor');
});

test('DÜELLO: süresi dolunca düşüyor', () => {
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  const sure = DENGE.REKABET.DUELLO_SURESI;
  esit(etkinSayi(duellolariGuncelle({ ...d, tur: d.tur + sure - 1 })), 1, 'süre dolmadan düştü');
  esit(etkinSayi(duellolariGuncelle({ ...d, tur: d.tur + sure })), 0, 'süre dolunca düşmedi');
});

test('DÜELLO: tarafı elenince düşüyor (tüm illerini kaybetti)', () => {
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  // Giresun'un bütün parçaları el değiştiriyor.
  const sahiplik = { ...d.parcaSahipligi };
  for (const pid of Object.keys(sahiplik)) if (sahiplik[pid] === GIRESUN) sahiplik[pid] = ORDU;
  esit(etkinSayi(duellolariGuncelle({ ...d, parcaSahipligi: sahiplik })), 0, 'düello sürüyor');
});

test('DÜELLO: kapak dolunca yeni düello başlamıyor', () => {
  let d = sahne();
  d = { ...d, duellolar: [] };
  for (let i = 0; i < DENGE.REKABET.EN_COK_ETKIN; i++)
    d = { ...d, duellolar: d.duellolar.concat([{ a: 'x' + i, b: 'y' + i, tur: 1 }]) };
  const s = duelloDene(d, ORDU, GIRESUN);
  esit(s.duello, null, 'kapak dolu ama yeni düello başlamış');
});

// ---- ÜÇÜNCÜ TARAF KISITI ----

test('KISIT: üçüncü taraf düello cephesine saldıramıyor', () => {
  let d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  d = orduKoy(d, '61-1', TRABZON, { piyade: 4 });
  // 28-1, Ordu'nun 52-1'iyle sınırdaş → düello cephesi.
  const g = hareketGecerliMi(d, TRABZON, '61-1', '28-1', { piyade: 4 });
  esit(g.ok, false, 'üçüncü taraf cepheye saldırabildi');
  esit(g.kod, 'duello', 'ret sebebi düello değil: ' + g.kod);
});

test('KISIT: düellonun TARAFLARI birbirine saldırabiliyor', () => {
  let d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  d = orduKoy(d, '52-1', ORDU, { piyade: 4 });
  const g = hareketGecerliMi(d, ORDU, '52-1', '28-1', { piyade: 4 });
  dogru(g.ok, 'düellonun tarafı kendi savaşına giremedi: ' + g.sebep);
});

test('KISIT: kapalıyken kimse engellenmiyor', () => {
  const asil = DENGE.REKABET.UCUNCU_TARAF;
  DENGE.REKABET.UCUNCU_TARAF = 'kapali';
  try {
    const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
    esit(duelloEngeli(d, TRABZON, '28-1'), null, 'kapalıyken engel çıktı');
  } finally {
    DENGE.REKABET.UCUNCU_TARAF = asil;
  }
});

// ---- MORAL VE GANİMET ----

test('MORAL: düello bonusu mevcut listeye KALEM olarak giriyor', () => {
  const d = sahne();
  const oncesi = moralBonuslari(d, '52-1', '28-1', ORDU, GIRESUN);
  const sonrasi = moralBonuslari(duelloDene(d, ORDU, GIRESUN).durum, '52-1', '28-1', ORDU, GIRESUN);
  const B = DENGE.REKABET.MORAL_BONUSU;
  // 2026-08-08: bonus artık `{ moral, kalem }` nesnesi — ilin moral statı sürekli
  // katkı veriyor, düello ise KALEM olarak biniyor. Ölçülen şey kalem sayısı.
  esit(sonrasi.saldiran.kalem, oncesi.saldiran.kalem + B, 'saldıran kalemi değişmedi');
  esit(sonrasi.savunan.kalem, oncesi.savunan.kalem + B, 'savunan kalemi değişmedi');
  esit(sonrasi.saldiran.moral, oncesi.saldiran.moral, 'düello moral statını oynatmamalı');
});

test('MORAL: düellosu olmayan çiftin bonusu değişmiyor', () => {
  const d = sahne();
  const oncesi = moralBonuslari(d, '61-1', '28-1', TRABZON, GIRESUN);
  const sonrasi = moralBonuslari(
    duelloDene(d, ORDU, GIRESUN).durum,
    '61-1',
    '28-1',
    TRABZON,
    GIRESUN
  );
  esit(sonrasi.saldiran.kalem, oncesi.saldiran.kalem, 'ilgisiz tarafa bonus sızmış');
  esit(sonrasi.savunan.kalem, oncesi.savunan.kalem, 'ilgisiz tarafa bonus sızmış');
});

test('GANİMET: düello çarpanı yalnızca taraflar arasında işliyor', () => {
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  esit(duelloGanimetCarpani(d, ORDU, GIRESUN), 1 + DENGE.REKABET.GANIMET_BONUSU, 'çarpan yok');
  esit(duelloGanimetCarpani(d, ORDU, TRABZON), 1, 'ilgisiz taraftan alınana bonus verilmiş');
});

test('HUSUMET: çift yönsüz — A–B ile B–A aynı satırı buluyor', () => {
  const a = husumetBul(ORDU, GIRESUN);
  const b = husumetBul(GIRESUN, ORDU);
  dogru(a && b, 'husumet bulunamadı');
  esit(a.ad, b.ad, 'iki yön farklı satır döndürdü');
});

// ---- KURAL DENETİMİ (2026-08-08, Baki: "kutsal savaşların kurallara uyup uymadığını
// kontrol et") ----
//
// Aşağıdakiler Baki'nin tek tek saydığı kuralların HER BİRİNİ ayrı ayrı sorguluyor.
// Var olan testler davranışı ölçüyordu; bunlar AYARIN KENDİSİNİN de yerinde olduğunu
// kilitliyor — yani biri `denge.js`'te sayıyı değiştirirse kural sessizce ölmesin.

test('DENETİM: düello ömrü tam DUELLO_SURESI tur (5) sürüyor', () => {
  esit(DENGE.REKABET.DUELLO_SURESI, 5, 'Bakinin kararı 5 turdu');
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  const basladi = d.tur;

  // Son geçerli tur: başlangıç + (süre − 1). O turda hâlâ ayakta olmalı.
  const son = duellolariGuncelle({ ...d, tur: basladi + DENGE.REKABET.DUELLO_SURESI - 1 });
  dogru(duelloBul(son, ORDU, GIRESUN), 'düello süresinden önce düştü');

  // Bir tur sonrası: düşmeli.
  const bitti = duellolariGuncelle({ ...d, tur: basladi + DENGE.REKABET.DUELLO_SURESI });
  dogru(!duelloBul(bitti, ORDU, GIRESUN), 'düello süresi dolduğu hâlde ayakta');
});

test('DENETİM: giriş şartı İKİ TARAFI da kesiyor (baskaSavasYok)', () => {
  esit(DENGE.REKABET.GIRIS_SARTI, 'baskaSavasYok', 'Bakinin kararı iki taraf da temiz olsundu');

  // 1) İkisi de temiz → düello başlıyor.
  dogru(duelloDene(sahne(), ORDU, GIRESUN).duello, 'temiz çiftte düello başlamadı');

  // 2) SALDIRANIN başka savaşı var → başlamıyor.
  const saldiranKirli = savasYaz(sahne(), ORDU, TRABZON);
  esit(duelloDene(saldiranKirli, ORDU, GIRESUN).duello, null, 'saldıranın cephesi elenmedi');

  // 3) SAVUNANIN başka savaşı var → yine başlamıyor. 'saldiranTemiz' olsaydı bu geçerdi;
  //    ayrımı ölçen tek test bu.
  const savunanKirli = savasYaz(sahne(), GIRESUN, TRABZON);
  esit(duelloDene(savunanKirli, ORDU, GIRESUN).duello, null, 'savunanın cephesi elenmedi');
});

test('DENETİM: üçüncü taraf TÜM topraklara giremiyor (topraklar kısıtı)', () => {
  esit(DENGE.REKABET.UCUNCU_TARAF, 'topraklar', 'Bakinin kararı topraklardı');
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;

  // Düello tarafının HER parçası korunuyor — cephede olsun olmasın. 'cephe' ayarında
  // yalnızca sınır hattı korunurdu; ayrımı ölçen test bu.
  let korunan = 0;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    const sahip = d.parcaSahipligi[pid];
    if (sahip !== ORDU && sahip !== GIRESUN) continue;
    korunan++;
    dogru(duelloEngeli(d, TRABZON, pid), pid + ' korunmadı — topraklar kısıtı delik');
  }
  dogru(korunan > 0, 'düello taraflarının hiç parçası bulunamadı');
});

test('DENETİM: düello tarafları BİRBİRİNİN toprağına girebiliyor', () => {
  // Kısıt üçüncü tarafa; kavganın kendisini durdurmamalı, yoksa kutsal savaş
  // "iki ilin birbirine dokunamadığı" bir dokunulmazlığa dönerdi.
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== GIRESUN) continue;
    esit(duelloEngeli(d, ORDU, pid), null, 'düello tarafı kendi savaşına giremedi: ' + pid);
  }
});

test('DENETİM: moral bonusu İKİ TARAFA da işliyor, üçüncüye işlemiyor', () => {
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  esit(duelloMoralBonusu(d, ORDU, GIRESUN), DENGE.REKABET.MORAL_BONUSU, 'saldıran yönü');
  esit(duelloMoralBonusu(d, GIRESUN, ORDU), DENGE.REKABET.MORAL_BONUSU, 'savunan yönü');
  esit(duelloMoralBonusu(d, TRABZON, GIRESUN), 0, 'üçüncü tarafa bonus sızdı');
});

test('DENETİM: ganimet bonusu yalnızca düello çiftinde', () => {
  const d = duelloDene(sahne(), ORDU, GIRESUN).durum;
  esit(duelloGanimetCarpani(d, ORDU, GIRESUN), 1 + DENGE.REKABET.GANIMET_BONUSU);
  esit(duelloGanimetCarpani(d, TRABZON, GIRESUN), 1, 'üçüncü tarafa ganimet sızdı');
});

test('DENETİM: savaş İLANI zincirinden sonra düello hâlâ tetiklenebiliyor', () => {
  // ⚠ GÖREV 11 İLE KESİŞEN YER. Barış varsayılan olduğu için hasım A, hasım B'ye
  // saldırmadan önce savaş İLAN etmek zorunda; ilan da ittifak zincirini yayıyor.
  // Zincir A'yı üçüncü bir devletle savaşa sokarsa düellonun giriş şartı ("başka savaşı
  // olmasın") kendiliğinden bozulur ve kutsal savaş hiç başlamaz.
  //
  // Bu test o yolun temiz hâlini kilitliyor: müttefiksiz iki hasım ilan edip saldırınca
  // düello başlamalı.
  let d = oyunKur({ senaryo: 'turkiye', tohum: 20260801 });
  esit(muttefikler(d, ORDU).length, 0, 'senaryo müttefikli başlamamalı');
  esit(muttefikler(d, GIRESUN).length, 0, 'senaryo müttefikli başlamamalı');

  const ilan = savasIlanEt(d, ORDU, GIRESUN);
  dogru(ilan.ok, 'ilan edilemedi: ' + ilan.sebep);
  d = orduKoy(ilan.durum, '52-1', ORDU, { piyade: 4 });

  const e = hamleUygula(d, ORDU, '52-1', '28-1', { piyade: 4 });
  dogru(e.ok, 'ilandan sonra saldırı emri verilemedi: ' + e.sebep);
  const { durum } = emirleriCoz(e.durum);
  dogru(duelloBul(durum, ORDU, GIRESUN), 'ilan → saldırı yolunda düello başlamadı');
});
