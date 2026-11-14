// YAPAY ZEKÂ KARAR FONKSİYONU TESTLERİ (Görev 07 / Adım 3).
//
// BİTİŞ ÖLÇÜTÜ (görev belgesi §Adım 3): elle kurulmuş durumlarda zekânın DOĞRU OLDUĞU
// APAÇIK kararı verdiği doğrulanıyor. Sebebi §9/tuzak 7: zekâ saçma oynadığında ilk
// şüpheli fayda formülü olur, ama hata ölçütte de olabilir. Bu testleri geçiyorsa sorun
// ağırlıklarda, geçemiyorsa formülde — teşhis ancak böyle ayrışır.
//
// Ayrıca kilitlenen üç değişmez: belirlenimcilik, `Math.random` yokluğu, katsayıların
// DENGE'den okunması.

const { test, dogru, esit } = require('./yardimci');
const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { birimSayisi } = require('../src/oyun/ordu.js');
const { komsular } = require('../src/oyun/hareket.js');
const {
  kisilikUret,
  uretimKarari,
  arastirmaKarari,
  arastirmaDali,
  toparlanmaKarari,
  adayHamleler,
  hamlePuani,
  zekaEmirleri,
  hedefDegeri,
  kuvvetBedeli,
  aciktaKalmaCezasi,
  hamleUstunlugu,
  agirlik,
} = require('../src/oyun/zeka.js');

const Z = DENGE.ZEKA;
const BEN = '16'; // Bursa

// Elle kurulmuş sahne: bütün ordular silinir, yalnızca teste gerekenler konur.
// Garnizonlar dursaydı her testte 181 parçalık gürültüyle uğraşmak gerekirdi.
function sahne() {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 20260731 });
  return { ...d, ordular: {} };
}

function sahiplik(d, esleme) {
  return { ...d, parcaSahipligi: { ...d.parcaSahipligi, ...esleme } };
}

function orduKoy(d, parcaId, sahip, birimler) {
  return { ...d, ordular: { ...d.ordular, [parcaId]: { sahip, birimler } } };
}

// Bir aktörün parçasını ve o parçanın bir düşman komşusunu bulur.
function cephe(d, aktorId) {
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== aktorId) continue;
    const hedef = komsular(pid).find((k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== aktorId);
    if (hedef) return { kaynak: pid, hedef };
  }
  return null;
}

const KISILIK = { saldirganlik: 0.5, acgozluluk: 0.5, husumet: 0, temkin: 0.5 };

// Parça kimliğinden il kodu — sanayi hakkı ve karışım sorguları için.
const PARCA_IL = (parcaId) => parcaId.split('-')[0];

// ---- APAÇIK KARARLAR ----

test('APAÇIK: 1 birlik, 10 birliklik garnizona saldırmıyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  dogru(!!c, 'cephe bulunamadı');
  d = orduKoy(d, c.kaynak, BEN, { piyade: 1 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 6, zirhli: 4 });

  const { hareketler } = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  esit(hareketler.length, 0, 'umutsuz saldırı emri verilmemeli');
});

test('APAÇIK: bedava duran boş komşu parça alınıyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 4 });
  // Hedefte ordu YOK — savunmasız düşman toprağı.

  const { hareketler } = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  dogru(hareketler.length > 0, 'bedava toprak alınmalı');
  esit(hareketler[0].hedef, c.hedef);
});

test('APAÇIK: iki boş hedeften DEĞERLİSİ seçiliyor', () => {
  let d = sahne();
  // Aynı kaynaktan iki boş düşman komşusu bulup değerlerini karşılaştırıyoruz.
  let kur = null;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== BEN) continue;
    const dusmanlar = komsular(pid).filter(
      (k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== BEN
    );
    if (dusmanlar.length >= 2) {
      const sirali = dusmanlar
        .map((h) => ({ h, deger: hedefDegeri(d, BEN, h) }))
        .sort((a, b) => b.deger - a.deger);
      if (sirali[0].deger > sirali[sirali.length - 1].deger) {
        kur = { kaynak: pid, iyi: sirali[0].h, kotu: sirali[sirali.length - 1].h };
        break;
      }
    }
  }
  dogru(!!kur, 'değerleri farklı iki komşusu olan parça bulunamadı');

  // Yalnızca bu iki hedefi bırak: kaynağın öteki komşularını KENDİ parçamız yapıyoruz.
  const digerleri = {};
  for (const k of komsular(kur.kaynak)) if (k !== kur.iyi && k !== kur.kotu) digerleri[k] = BEN;
  d = sahiplik(d, digerleri);
  d = orduKoy(d, kur.kaynak, BEN, { piyade: 6 });

  const { hareketler } = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  dogru(hareketler.length > 0, 'emir verilmeli');
  esit(hareketler[0].hedef, kur.iyi, 'değerli hedef seçilmeliydi');
});

test('APAÇIK: güçlü savunmaya karşı zayıf saldırı, boş hedefe yeğlenmiyor', () => {
  let d = sahne();
  let kur = null;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== BEN) continue;
    const dusmanlar = komsular(pid).filter(
      (k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== BEN
    );
    if (dusmanlar.length >= 2) {
      kur = { kaynak: pid, bos: dusmanlar[0], dolu: dusmanlar[1] };
      break;
    }
  }
  dogru(!!kur, 'iki düşman komşusu olan parça bulunamadı');

  const digerleri = {};
  for (const k of komsular(kur.kaynak)) if (k !== kur.bos && k !== kur.dolu) digerleri[k] = BEN;
  d = sahiplik(d, digerleri);
  d = orduKoy(d, kur.kaynak, BEN, { piyade: 5 });
  d = orduKoy(d, kur.dolu, d.parcaSahipligi[kur.dolu], { zirhli: 8 });

  const { hareketler } = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  dogru(hareketler.length > 0, 'boş hedefe emir verilmeliydi');
  esit(hareketler[0].hedef, kur.bos, 'zırhlı yuvasına değil boş parçaya gitmeliydi');
});

test('APAÇIK: kendini savunmasız bırakan hamle, denk alternatif varken seçilmiyor', () => {
  // Aynı hedefe iki aday üretiliyor: "tümü" ve "yarısı". Kaynağın yanında büyük bir
  // düşman kuvveti varsa, hepsini gönderip arkayı açık bırakmak cezalandırılmalı.
  let d = sahne();
  let kur = null;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== BEN) continue;
    const dusmanlar = komsular(pid).filter(
      (k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== BEN
    );
    if (dusmanlar.length >= 2) {
      kur = { kaynak: pid, hedef: dusmanlar[0], tehdit: dusmanlar[1] };
      break;
    }
  }
  dogru(!!kur, 'uygun parça bulunamadı');
  d = orduKoy(d, kur.kaynak, BEN, { piyade: 8 });
  d = orduKoy(d, kur.tehdit, d.parcaSahipligi[kur.tehdit], { piyade: 10, zirhli: 5 });

  const hepsi = { kaynak: kur.kaynak, hedef: kur.hedef, birlikler: { piyade: 8 } };
  const yarisi = { kaynak: kur.kaynak, hedef: kur.hedef, birlikler: { piyade: 4 } };
  const cezaHepsi = aciktaKalmaCezasi(d, BEN, kur.kaynak, hepsi.birlikler);
  const cezaYarisi = aciktaKalmaCezasi(d, BEN, kur.kaynak, yarisi.birlikler);
  dogru(cezaHepsi > cezaYarisi, 'hepsini göndermek daha çok ceza almalı');
});

// ---- FAYDA FORMÜLÜNÜN TERİMLERİ ----

test('DEĞER: ili TAMAMLAYAN parça daha değerli', () => {
  const d = sahne();
  // BAŞKA bir ilin parçaları kullanılıyor: oyun kurulumunda her il kendi parçalarını
  // tutuyor ve BEN zaten Bursa — kendi ilim üstünde ölçseydim il baştan tamam olurdu.
  const kod = '06'; // Ankara
  const parcalar = Object.keys(d.parcaSahipligi).filter((p) => p.startsWith(kod + '-'));
  dogru(parcalar.length >= 2, 'çok parçalı il gerekli');
  const son = parcalar[parcalar.length - 1];

  // 1) Yalnızca son parçayı alıyorum — il tamamlanmıyor, ötekiler hâlâ Ankara'nın.
  const yalniz = hedefDegeri(d, BEN, son);
  // 2) Ötekilerin hepsi bende — son parça ili TAMAMLIYOR.
  const digerleri = {};
  for (const p of parcalar) if (p !== son) digerleri[p] = BEN;
  const tamamlayan = hedefDegeri(sahiplik(d, digerleri), BEN, son);

  dogru(tamamlayan > yalniz, 'il tamamlayan parça daha değerli olmalı');
  esit(tamamlayan - yalniz, Z.IL_BONUSU, 'fark tam olarak il bonusu kadar');
});

test('BEDEL: gönderilen kuvvetin bedeli DENGE.BIRIMLER fiyatlarından türüyor', () => {
  const b = DENGE.BIRIMLER;
  esit(
    kuvvetBedeli({ piyade: 2, zirhli: 1 }),
    2 * (b.piyade.nufus + b.piyade.ekonomi) + (b.zirhli.nufus + b.zirhli.ekonomi)
  );
  esit(kuvvetBedeli({}), 0);
});

test('ÜSTÜNLÜK: motordan geliyor, ikinci bir tahmin yazılmamış', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 10 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 1 });
  const ezici = hamleUstunlugu(d, BEN, c.kaynak, c.hedef, { piyade: 10 });

  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { zirhli: 9 });
  const umutsuz = hamleUstunlugu(d, BEN, c.kaynak, c.hedef, { piyade: 1 });

  dogru(ezici > 0.9, 'ezici saldırıda üstünlük 1e yakın olmalı: ' + ezici);
  dogru(umutsuz < 0.5, 'umutsuz saldırıda üstünlük düşük olmalı: ' + umutsuz);
  dogru(ezici > umutsuz, 'sıralama doğru olmalı');
});

test('ÜSTÜNLÜK: boş hedefte muharebe yok, oran 1.00', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 2 });
  esit(hamleUstunlugu(d, BEN, c.kaynak, c.hedef, { piyade: 2 }), 1);
});

// ---- KİŞİLİK ----

test('KİŞİLİK: saldırgan ve temkinli aktör aynı durumda FARKLI karar veriyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 4 });
  // Riskli hedef: kazanma ihtimali var ama düşük.
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 4, topcu: 1 });

  const saldirgan = { saldirganlik: 1, acgozluluk: 1, husumet: 0, temkin: 0.1 };
  const temkinli = { saldirganlik: 0.1, acgozluluk: 0.2, husumet: 0, temkin: 1 };
  const hamle = { kaynak: c.kaynak, hedef: c.hedef, birlikler: { piyade: 4 } };

  const pS = hamlePuani(d, BEN, hamle, saldirgan);
  const pT = hamlePuani(d, BEN, hamle, temkinli);
  dogru(pS > pT, 'saldırgan aktör riskli hamleyi daha yüksek puanlamalı: ' + pS + ' vs ' + pT);
});

test('KİŞİLİK: eksik ağırlık orta değer sayılıyor (karar veremez hâle gelmiyor)', () => {
  esit(agirlik(null, 'temkin'), 0.5);
  esit(agirlik({}, 'saldirganlik'), 0.5);
  esit(agirlik({ temkin: 0.9 }, 'temkin'), 0.9);
});

// ---- HAMLE UZAYI ----

test('ADAY: yalnızca DÜŞMAN komşulara, kullanılabilir kuvvetle üretiliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 6 });
  const adaylar = adayHamleler(d, BEN);
  dogru(adaylar.length > 0, 'aday üretilmeli');
  for (const a of adaylar) {
    dogru(d.parcaSahipligi[a.hedef] !== BEN, 'kendi parçasına aday üretilmemeli');
    dogru(komsular(a.kaynak).includes(a.hedef), 'hedef komşu olmalı');
    dogru(birimSayisi(a.birlikler) > 0, 'boş kuvvetle aday olmaz');
    dogru(birimSayisi(a.birlikler) <= 6, 'elindekinden fazlası gönderilemez');
  }
});

test('ADAY: ordusu olmayan parçadan hamle üretilmiyor', () => {
  const d = sahne(); // hiç ordu yok
  esit(adayHamleler(d, BEN).length, 0);
});

test('ADAY: aynı bölüşüm iki kez puanlanmıyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 1 }); // 1.0 ve 0.5 aynı sonucu verir
  const ayni = adayHamleler(d, BEN).filter((a) => a.hedef === c.hedef);
  esit(ayni.length, 1, 'tek birlikte tek aday olmalı');
});

// ---- DEĞİŞMEZLER ----

test('BELİRLENİMCİ: aynı tohum + aynı durum → aynı karar (10 koşu)', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 5, topcu: 2 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 3 });

  const ilk = JSON.stringify(zekaEmirleri(d, BEN, KISILIK, 4242, 'orta'));
  for (let i = 0; i < 10; i++)
    esit(JSON.stringify(zekaEmirleri(d, BEN, KISILIK, 4242, 'orta')), ilk, i + '. koşu ayrıştı');
});

test('BELİRLENİMCİ: farklı tohum farklı gürültü veriyor (üreteç gerçekten kullanılıyor)', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 5 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 4 });
  const puanlar = new Set();
  for (let t = 1; t <= 30; t++) {
    const r = zekaEmirleri(d, BEN, KISILIK, t, 'kolay');
    if (r.hareketler.length) puanlar.add(r.hareketler[0].puan.toFixed(6));
  }
  dogru(puanlar.size > 1, 'kolay kademede tohum puanı etkilemeli');
});

test('BELİRLENİMCİ: oyun kodunun hiçbir yerinde Math.random ÇAĞRISI yok', () => {
  // YORUMLAR ELENİYOR: `rastgele.js`'in başlığında "Math.random() kullanılmaz" yazıyor ve
  // bu kuralın ihlali değil, ta kendisi. Yorumu elemeyen ilk deneme tam oraya takıldı.
  //
  // Tarama tek dosyayla sınırlı değil — belirlenimcilik en kolay kaybedilen özellik
  // (§9/tuzak 4) ve sızıntı zeka.js dışından da gelebilir.
  //
  // ---- ⚠ `\r` ELENMEK ZORUNDA (2026-09-20'de bir saat yedi) ----
  //
  // Eski ayıklayıcı `/\/\/.*$/` idi ve CRLF satır sonlu bir dosyada HİÇ ÇALIŞMIYORDU:
  // JavaScript'te `.` bir satır sonlandırıcıyla eşleşmez ve `\r` satır sonlandırıcıdır.
  // Yani `"// ... `Math.random` yok.\r"` satırında `.*` `\r`'ye takılıyor, `$` (çok satır
  // kipi yok) dizginin sonuna denk gelmiyor ve eşleşme olmuyor — yorum OLDUĞU GİBİ kalıyor.
  //
  // Sonuç sinsi: `sira.js` bir düzenlemede CRLF'e döndü ve test, kendi başlığında
  // "`Math.random` yok" YAZAN bir yorumu ihlal sandı. Satır sonu artık baştan siliniyor.
  const dizin = path.join(__dirname, '..', 'src', 'oyun');
  const kirli = [];
  for (const ad of fs.readdirSync(dizin)) {
    if (!ad.endsWith('.js')) continue;
    const kod = fs
      .readFileSync(path.join(dizin, ad), 'utf8')
      .split(/\r?\n/)
      .map((satir) => satir.replace(/\/\/.*$/, ''))
      .join('\n');
    if (kod.includes('Math.random')) kirli.push(ad);
  }
  dogru(kirli.length === 0, 'Math.random çağrısı bulundu: ' + kirli.join(', '));
});

test('ZORLUK: zor kademede gürültü yok — aynı durum hep aynı puanı verir', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 5 });
  const a = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  const b = zekaEmirleri(d, BEN, KISILIK, 999, 'zor');
  esit(JSON.stringify(a), JSON.stringify(b), 'zor kademede tohum sonucu değiştirmemeli');
});

test('KATSAYI: fayda terimleri koda gömülü değil (değiştir → karar değişsin)', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 4 });
  const hamle = { kaynak: c.kaynak, hedef: c.hedef, birlikler: { piyade: 4 } };

  const eski = Z.TERIM.DEGER;
  try {
    const once = hamlePuani(d, BEN, hamle, KISILIK);
    Z.TERIM.DEGER = eski * 5;
    const sonra = hamlePuani(d, BEN, hamle, KISILIK);
    dogru(sonra > once, 'DEGER katsayısı büyüyünce puan artmalı');
  } finally {
    Z.TERIM.DEGER = eski;
  }
});

test('KATSAYI: EN_AZ_PUAN eşiği emir verilip verilmemesini belirliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 4 });

  const eski = Z.EN_AZ_PUAN;
  try {
    Z.EN_AZ_PUAN = -Infinity;
    dogru(zekaEmirleri(d, BEN, KISILIK, 1, 'zor').hareketler.length > 0, 'eşik dipteyken emir var');
    Z.EN_AZ_PUAN = 1e9;
    esit(
      zekaEmirleri(d, BEN, KISILIK, 1, 'zor').hareketler.length,
      0,
      'eşik tavandayken emir olmamalı'
    );
  } finally {
    Z.EN_AZ_PUAN = eski;
  }
});

// GÖREV 08'DE AÇILDI. Görev 07'de bu test "husumet verisi yokken terim sessizce düşüyor"
// diyordu ve o zaman doğruydu; artık tablo var (`veri/husumetler.js`). Test tersine
// çevrilmedi, İKİ YÖNÜ DE sınıyor: hasım OLMAYAN hedefte terim hâlâ düşüyor, hasım olanda
// ağırlık kararı değiştiriyor. Terimin "yerinde ama sessiz" durması Görev 07'nin sözüydü.
test('HUSUMET: hasım olmayan hedefte terim hâlâ sessizce düşüyor', () => {
  esit(Z.HUSUMET_ACIK, true, 'husumet Görev 08de açıldı');
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 3 });
  const hamle = { kaynak: c.kaynak, hedef: c.hedef, birlikler: { piyade: 3 } };
  // Bursa'nın (16) hasmı yok — tabloda geçmiyor.
  const husumetli = hamlePuani(d, BEN, hamle, { ...KISILIK, husumet: 1 });
  const husumetsiz = hamlePuani(d, BEN, hamle, { ...KISILIK, husumet: 0 });
  esit(husumetli, husumetsiz, 'hasım olmayan hedefte husumet ağırlığı sonucu değiştirmemeli');
});

test('BOŞ TUR: emir vermeyen aktör çökmüyor', () => {
  const d = sahne();
  const r = zekaEmirleri(d, '06', KISILIK, 1, 'orta'); // hiç ordusu yok
  esit(r.hareketler.length, 0);
});

test('TEK KAYNAK TEK EMİR: bir parçanın ordusu ikiye bölünüp iki yere gitmiyor', () => {
  let d = sahne();
  let kur = null;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== BEN) continue;
    const dusmanlar = komsular(pid).filter(
      (k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== BEN
    );
    if (dusmanlar.length >= 2) {
      kur = pid;
      break;
    }
  }
  dogru(!!kur, 'iki düşman komşulu parça gerekli');
  d = orduKoy(d, kur, BEN, { piyade: 10 });
  const { hareketler } = zekaEmirleri(d, BEN, KISILIK, 1, 'zor');
  const kaynaklar = hareketler.map((h) => h.kaynak);
  esit(new Set(kaynaklar).size, kaynaklar.length, 'her kaynak en fazla bir emir vermeli');
});

// ═══════════════════════════════════════════════════════════════════════════════════
// EKONOMİ KARARLARI (Adım 4)
// ═══════════════════════════════════════════════════════════════════════════════════

const { siparisGecerliMi, ilUretimHakki, siparisMaliyeti } = require('../src/oyun/ordu.js');
const { kullanilabilirButce } = require('../src/oyun/butce.js');
const { dusmanaSinirdasMi } = require('../src/oyun/hareket.js');
const { ilTipi } = require('../src/oyun/garnizon.js');

function paraVer(d, aktorId, nufus, ekonomi) {
  return {
    ...d,
    aktorler: {
      ...d.aktorler,
      [aktorId]: { ...d.aktorler[aktorId], nufusHavuzu: nufus, ekonomiHavuzu: ekonomi },
    },
  };
}

// ---- KİŞİLİK ÜRETİMİ ----

test('KİŞİLİK: tohumdan BELİRLENİMCİ üretiliyor (aynı tohum → aynı kişilikler)', () => {
  const d = sahne();
  const idler = Object.keys(d.aktorler);
  const a = kisilikUret(20260731, idler, 'orta');
  const b = kisilikUret(20260731, idler, 'orta');
  esit(JSON.stringify(a), JSON.stringify(b), 'aynı tohum aynı kişilikleri vermeli');
  dogru(JSON.stringify(a) !== JSON.stringify(kisilikUret(999, idler, 'orta')), 'tohum etkili');
});

test('KİŞİLİK: anahtar sırasından bağımsız (kayıt sırası değişse de aynı)', () => {
  const d = sahne();
  const idler = Object.keys(d.aktorler);
  esit(
    JSON.stringify(kisilikUret(7, [...idler].reverse(), 'orta')),
    JSON.stringify(kisilikUret(7, idler, 'orta')),
    'sıra kişiliği etkilememeli'
  );
});

test('KİŞİLİK: ağırlıklar zorluk kademesinin ARALIĞINDA kalıyor', () => {
  const d = sahne();
  const idler = Object.keys(d.aktorler);
  for (const zorluk of Z.ZORLUK_SIRASI) {
    const k = kisilikUret(11, idler, zorluk);
    const aralik = Z.ZORLUK[zorluk].aralik;
    for (const id of idler)
      for (const ad of Object.keys(aralik)) {
        const v = k[id][ad];
        dogru(
          v >= aralik[ad][0] - 1e-9 && v <= aralik[ad][1] + 1e-9,
          zorluk + '/' + id + '/' + ad + ' = ' + v + ' aralık dışı'
        );
      }
  }
});

test('KİŞİLİK: zor kademe saldırgan, kolay kademe temkinli üretiyor', () => {
  const d = sahne();
  const idler = Object.keys(d.aktorler);
  const ort = (k, ad) => idler.reduce((a, id) => a + k[id][ad], 0) / idler.length;
  const kolay = kisilikUret(5, idler, 'kolay');
  const zor = kisilikUret(5, idler, 'zor');
  dogru(ort(zor, 'saldirganlik') > ort(kolay, 'saldirganlik'), 'zor daha saldırgan olmalı');
  dogru(ort(zor, 'temkin') < ort(kolay, 'temkin'), 'kolay daha temkinli olmalı');
});

// GÖREV 08: husumet ağırlığı artık üretiliyor. Zorluk kademesine BAĞLI DEĞİL — husumet
// bir karakter özelliği, zorluk ayarı değil; her kademede 0–1 arasında dağılıyor.
test('KİŞİLİK: husumet ağırlığı 0–1 arasında ve gerçekten değişiyor', () => {
  const d = sahne();
  const k = kisilikUret(3, Object.keys(d.aktorler), 'orta');
  const degerler = Object.keys(k).map((id) => k[id].husumet);
  for (const v of degerler) dogru(v >= 0 && v <= 1, 'husumet 0–1 dışında: ' + v);
  dogru(new Set(degerler).size > 1, 'bütün aktörlerin husumeti aynı çıkmış');
});

test('KİŞİLİK: ağırlıklar iki haneye kısaltılıyor (kayıt şişmesin)', () => {
  const d = sahne();
  const k = kisilikUret(3, Object.keys(d.aktorler), 'orta');
  for (const id of Object.keys(k))
    for (const ad of Z.AGIRLIKLAR) {
      const v = k[id][ad];
      esit(Math.round(v * 100) / 100, v, id + '/' + ad + ' iki haneden uzun: ' + v);
    }
});

// ---- ÜRETİM KARARI ----

test('ÜRETİM: verilen sipariş oyuncunun DOĞRULAMASINDAN geçiyor', () => {
  let d = paraVer(sahne(), BEN, 40, 40);
  const karar = uretimKarari(d, BEN);
  dogru(!!karar, 'para varken üretim kararı çıkmalı');
  dogru(
    siparisGecerliMi(d, karar.parcaId, BEN, karar.siparis).ok,
    'zekânın siparişi oyuncunun doğrulamasını geçmeli'
  );
});

test('ÜRETİM: parası yokken sipariş verilmiyor', () => {
  esit(uretimKarari(paraVer(sahne(), BEN, 0, 0), BEN), null);
});

test('ÜRETİM: sanayi sınırı aşılmıyor', () => {
  let d = paraVer(sahne(), BEN, 999, 999);
  const karar = uretimKarari(d, BEN);
  dogru(!!karar, 'karar çıkmalı');
  const hak = ilUretimHakki(d, PARCA_IL(karar.parcaId), BEN);
  dogru(
    birimSayisi(karar.siparis) <= hak.kalan,
    'sipariş sanayi hakkını aşmamalı: ' + birimSayisi(karar.siparis) + ' > ' + hak.kalan
  );
});

test('ÜRETİM: bütçenin tamamı harcanmıyor (URETIM_PAYI payı bırakıyor)', () => {
  let d = paraVer(sahne(), BEN, 100, 100);
  const karar = uretimKarari(d, BEN);
  dogru(!!karar, 'karar çıkmalı');
  const bedel = siparisMaliyeti(karar.siparis);
  const butce = kullanilabilirButce(d, BEN);
  dogru(bedel.ekonomi <= Math.floor(butce.ekonomi * Z.URETIM_PAYI), 'ayrılan pay aşılmamalı');
  dogru(bedel.nufus <= Math.floor(butce.nufus * Z.URETIM_PAYI), 'nüfus payı da aşılmamalı');
});

test('ÜRETİM: karışım §4.5 tablosundan geliyor (yeni bileşim icat edilmemiş)', () => {
  let d = paraVer(sahne(), BEN, 200, 200);
  const karar = uretimKarari(d, BEN);
  dogru(!!karar, 'karar çıkmalı');
  const karisim = DENGE.GARNIZON.KARISIM[ilTipi(PARCA_IL(karar.parcaId))];
  for (const tur of Object.keys(karar.siparis))
    dogru(karisim[tur] > 0, 'karışımda olmayan tür basılmış: ' + tur);
});

test('ÜRETİM: cephedeki parçaya basılıyor (düşmana en yakın)', () => {
  let d = paraVer(sahne(), BEN, 60, 60);
  const karar = uretimKarari(d, BEN);
  dogru(!!karar, 'karar çıkmalı');
  dogru(dusmanaSinirdasMi(d, BEN, karar.parcaId), 'cephedeki parçaya basılmalıydı');
});

// ---- ARAŞTIRMA KARARI ----

test('ARAŞTIRMA: açgözlü aktör daha AZ pay ayırıyor', () => {
  let d = paraVer(sahne(), BEN, 40, 40);
  const acgozlu = arastirmaKarari(d, BEN, { ...KISILIK, acgozluluk: 1 });
  const cimri = arastirmaKarari(d, BEN, { ...KISILIK, acgozluluk: 0 });
  dogru(acgozlu.ayrilan < cimri.ayrilan, 'açgözlü daha az araştırmalı');
});

test('ARAŞTIRMA: ayrılan pay TAM SAYI ve bütçeyi aşmıyor', () => {
  let d = paraVer(sahne(), BEN, 40, 37);
  const karar = arastirmaKarari(d, BEN, KISILIK);
  esit(karar.ayrilan % 1, 0, 'tam sayı olmalı');
  dogru(karar.ayrilan <= kullanilabilirButce(d, BEN).ekonomi, 'bütçeyi aşmamalı');
});

test('ARAŞTIRMA: zırhlı yığınına karşı AĞIR vuruş seçiliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 3 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { zirhli: 10 });
  esit(arastirmaDali(d, BEN, KISILIK).dal, 'agir');
});

test('ARAŞTIRMA: piyade yığınına karşı HAFİF vuruş seçiliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 3 });
  d = orduKoy(d, c.hedef, d.parcaSahipligi[c.hedef], { piyade: 10 });
  esit(arastirmaDali(d, BEN, KISILIK).dal, 'hafif');
});

test('ARAŞTIRMA: seçilen dal GERÇEKTEN var (olmayan dala yatırım yapılmıyor)', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  // Zırhlı ordulu aktör: zırhlının zırh dalı YOK (Adım 2b ölçümü), oraya düşmemeli.
  d = orduKoy(d, c.kaynak, BEN, { zirhli: 5 });
  for (const kisilik of [
    { ...KISILIK, saldirganlik: 1, temkin: 0 },
    { ...KISILIK, saldirganlik: 0, temkin: 1 },
  ]) {
    const s = arastirmaDali(d, BEN, kisilik);
    dogru(
      !!(DENGE.ARASTIRMA.AGACLAR[s.birim] && DENGE.ARASTIRMA.AGACLAR[s.birim][s.dal]),
      'olmayan dal seçildi: ' + s.birim + '.' + s.dal
    );
  }
});

// ---- TOPARLANMA KARARI ----

test('TOPARLANMA: sağlam ordu için emir verilmiyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 5 });
  esit(toparlanmaKarari(d, BEN).length, 0, 'tam güçteki ordu toplanmamalı');
});

test('TOPARLANMA: eşiği aşan yıpranma için emir veriliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = {
    ...d,
    ordular: { [c.kaynak]: { sahip: BEN, birimler: { piyade: 2 }, kadro: { piyade: 6 } } },
  };
  dogru(toparlanmaKarari(d, BEN).includes(c.kaynak), 'üçte ikisi eksik ordu toplanmalıydı');
});

test('TOPARLANMA: CEPHEDEKİ ordu önce geliyor', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  const icParca = Object.keys(d.parcaSahipligi).find(
    (p) => d.parcaSahipligi[p] === BEN && p !== c.kaynak && !dusmanaSinirdasMi(d, BEN, p)
  );
  if (!icParca) return; // iç parçası yoksa test anlamsız
  const yipranmis = (kadro) => ({ sahip: BEN, birimler: { piyade: 1 }, kadro: { piyade: kadro } });
  d = { ...d, ordular: { [c.kaynak]: yipranmis(4), [icParca]: yipranmis(9) } };

  const liste = toparlanmaKarari(d, BEN);
  esit(liste.length, 2, 'iki ordu da toplanmalı');
  esit(liste[0], c.kaynak, 'cephedeki, daha az yıpranmış olsa bile önce gelmeli');
});

test("TOPARLANMA: eşik DENGE'den okunuyor", () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = {
    ...d,
    ordular: { [c.kaynak]: { sahip: BEN, birimler: { piyade: 5 }, kadro: { piyade: 6 } } },
  };
  const eski = Z.TOPARLANMA_ESIGI;
  try {
    Z.TOPARLANMA_ESIGI = 0.01;
    dogru(toparlanmaKarari(d, BEN).length > 0, 'eşik dipteyken toplanmalı');
    Z.TOPARLANMA_ESIGI = 0.9;
    esit(toparlanmaKarari(d, BEN).length, 0, 'eşik tavandayken toplanmamalı');
  } finally {
    Z.TOPARLANMA_ESIGI = eski;
  }
});

// ═══════════════════════════════════════════════════════════════════════
// TAKVİYE — İÇ BÖLGEDEN CEPHEYE (Görev 08 / Adım 8)
// ═══════════════════════════════════════════════════════════════════════

const { turuBitir } = require('../src/oyun/turDongusu.js');
const { cepheUzakligi, takviyeAdaylari, takviyePuani } = require('../src/oyun/zeka.js');
const { hareketGecerliMi: takviyeGecerliMi } = require('../src/oyun/hareket.js');

// Takviyenin ölçülebilmesi için İÇ BÖLGESİ OLAN bir aktör gerekiyor. Oyun kurulumunda
// böyle bir aktör yok — herkes 1–5 parçalı ve her parçası cephede (Adım 1 ölçümünün de
// bulgusu buydu). Burada bir merkez parça seçilip iki halka komşusu aynı aktöre veriliyor:
// merkez uzaklık 2, birinci halka 1, ikinci halka cephe olur.
const GENIS = BEN;
function genisAktor() {
  let d = sahne();
  const merkez = Object.keys(d.parcaSahipligi).find((p) => d.parcaSahipligi[p] === GENIS);
  const halka1 = komsular(merkez);
  const halka2 = [];
  for (const k of halka1) for (const kk of komsular(k)) halka2.push(kk);
  const esleme = {};
  for (const p of halka1.concat(halka2)) if (d.parcaSahipligi[p]) esleme[p] = GENIS;
  d = sahiplik(d, esleme);
  return orduKoy(d, merkez, GENIS, { piyade: 5 });
}

test('CEPHE UZAKLIĞI: düşman komşusu olan parça 0, arkadaki 1', () => {
  const d = sahne();
  const u = cepheUzakligi(d, BEN);
  const c = cephe(d, BEN);
  esit(u[c.kaynak], 0, 'düşmana sınırdaş parça cephe değil');
  // Oyun başında her il kendi parçalarına sahip; iç bölge ancak genişleyince doğar.
  for (const pid of Object.keys(u)) dogru(u[pid] >= 0, pid + ' uzaklığı negatif');
});

test('TAKVİYE: cephedeki parça takviye GÖNDERMİYOR', () => {
  let d = sahne();
  const c = cephe(d, BEN);
  d = orduKoy(d, c.kaynak, BEN, { piyade: 6 });
  const adaylar = takviyeAdaylari(d, BEN);
  dogru(
    !adaylar.some((a) => a.kaynak === c.kaynak),
    'cephedeki parça takviye adayı üretmiş — savunmasını boşaltıyor'
  );
});

// Tek yönlülük kuralının TANIM GEREĞİ sonucu: her aday uzaklığı en az 1 azaltıyor.
test('TAKVİYE: her aday cepheye YAKLAŞIYOR', () => {
  const d = genisAktor();
  const u = cepheUzakligi(d, GENIS);
  for (const a of takviyeAdaylari(d, GENIS, u))
    dogru(u[a.hedef] < u[a.kaynak], a.kaynak + ' → ' + a.hedef + ' cepheden uzaklaşıyor');
});

test('TAKVİYE: emir oyuncunun doğrulamasından geçiyor', () => {
  const d = genisAktor();
  const adaylar = takviyeAdaylari(d, GENIS);
  dogru(adaylar.length > 0, 'geniş aktörde hiç takviye adayı yok — sahne kurulumu bozuk');
  for (const a of adaylar) {
    const g = takviyeGecerliMi(d, GENIS, a.kaynak, a.hedef, a.birlikler);
    dogru(g.ok, a.kaynak + ' → ' + a.hedef + ' doğrulamadan geçemedi: ' + g.sebep);
  }
});

test('TAKVİYE: puan DENGE katsayılarından okunuyor', () => {
  const d = genisAktor();
  const u = cepheUzakligi(d, GENIS);
  const a = takviyeAdaylari(d, GENIS, u)[0];
  const asil = Z.TAKVIYE.TERIM.YAKINLIK;
  try {
    const once = takviyePuani(d, GENIS, a, u);
    Z.TAKVIYE.TERIM.YAKINLIK = asil * 3;
    dogru(takviyePuani(d, GENIS, a, u) > once, 'katsayı değişince puan değişmedi');
  } finally {
    Z.TAKVIYE.TERIM.YAKINLIK = asil;
  }
});

test('TAKVİYE: kapalıyken hiç aday üretilmiyor', () => {
  const asil = Z.TAKVIYE.ACIK;
  Z.TAKVIYE.ACIK = false;
  try {
    esit(takviyeAdaylari(genisAktor(), GENIS).length, 0, 'kapalıyken aday çıktı');
  } finally {
    Z.TAKVIYE.ACIK = asil;
  }
});

// ---- SALINIM (görev belgesi §10/10) ----
// "Yapay zekânın orduyu ileri geri taşıması hem aptal görünür hem hamle hakkını yakar."
// Tek yönlülük kuralı bunu TANIM GEREĞİ engelliyor; bu test onu GERÇEK BİR OYUNDA
// doğruluyor — kural doğru ama uygulaması yanlış olabilirdi.
// ┌─ SÜZGEÇ DÜZELTİLDİ (Görev 09 / Adım 1) ─────────────────────────────────────────────┐
// │ İlk sürüm "dost parçaya giriş = takviye" diyordu ve bu YANLIŞ SINIFLANDIRIYORDU.     │
// │ Emirler tur içinde SIRAYLA çözülüyor: bir aktör aynı turda önce 40-1'i fethedip      │
// │ sonra 68-1'den oraya asker yürütürse, ikinci satır da "eskiSahip === aktorId" olur — │
// │ ama o bir TAKVİYE değil, az önce alınan toprağa yapılan takip hamlesidir.            │
// │                                                                                      │
// │ Yakalandığı yer: Görev 09 diplomasi düellonun giriş şartını devreye sokunca dünya    │
// │ farklı evrildi ve test "salınım: 42 68-1 ↔ 40-1" diye kaldı. İncelendiğinde 68-1'in  │
// │ o turda cephe uzaklığı 0'dı — yani takviye kuralının ÖN ŞARTINI hiç sağlamıyordu,    │
// │ o hamle takviye sisteminden çıkmamıştı.                                              │
// │                                                                                      │
// │ Süzgeç artık kuralın kendi ön şartını kullanıyor: KAYNAĞIN DÜŞMAN KOMŞUSU OLMAMALI   │
// │ (cephe uzaklığı > 0). Test böylece gerçekten takviye sistemini ölçüyor. Dört tohumda │
// │ doğrulandı: süzgeçle salınım 0, süzgeçsiz sahte salınım çıkıyor.                     │
// └──────────────────────────────────────────────────────────────────────────────────────┘
function dostHareketler(turSayisi, tohum) {
  let d = oyunKur({ senaryo: 'turkiye', tohum });
  const gidisler = [];
  for (let t = 0; t < turSayisi; t++) {
    const once = d; // uzaklıklar TUR BAŞINDAKİ dünyadan okunmalı — karar orada verildi
    d = turuBitir(d);
    const r = d.sonTurRaporu;
    if (!r) continue;
    const uzaklikCache = {};
    for (const s of r.satirlar) {
      // Dost parçaya giriş. Oyuncunun emri yok (hiç emir vermiyoruz).
      if (s.tip !== 'giris' || !s.aktorId || s.eskiSahip !== s.aktorId) continue;
      const u =
        uzaklikCache[s.aktorId] || (uzaklikCache[s.aktorId] = cepheUzakligi(once, s.aktorId));
      // Takviyenin ön şartı: kaynağın düşman komşusu YOK (cepheUzakligi > 0).
      if (u[s.kaynak] === undefined || u[s.kaynak] === 0) continue;
      gidisler.push(s.aktorId + ':' + s.kaynak + '>' + s.hedef);
    }
  }
  return gidisler;
}

test('TAKVİYE: 20 turda ileri-geri gidiş SIFIR (salınım yok)', () => {
  const gidisler = dostHareketler(20, 20260808);
  dogru(gidisler.length > 0, '20 turda hiç takviye olmadı — ölçüm bir şey kanıtlamıyor');
  const kume = new Set(gidisler);
  for (const g of kume) {
    const [aktor, yol] = g.split(':');
    const [a, b] = yol.split('>');
    dogru(!kume.has(aktor + ':' + b + '>' + a), 'salınım: ' + aktor + ' ' + a + ' ↔ ' + b);
  }
});

test('TAKVİYE: belirlenimci — aynı tohum aynı hareketleri veriyor', () => {
  const bir = dostHareketler(8, 20260809);
  const iki = dostHareketler(8, 20260809);
  esit(bir.join('|'), iki.join('|'), 'aynı tohum farklı takviye kararı verdi');
});

// ---- UMUTSUZ SALDIRI KAPISI (Görev 12 · Baki'nin çıkmaz şikâyeti) ----
//
// > *"Aynı yere 10-20 asker yığmaya başlıyorlar, her tur aynı yere basıyorlar,
// > diğerlerini ignoreluyorlar."*
//
// Kök sebep: üstünlük fayda formülünde bir ÇARPAN'dı, bir KAPI değil — değerli bir hedefte
// üstünlük 0.3 olsa bile puan eşiği aşabiliyordu. Ölçüm `veri/cikmaz-olcum.md`.

const { umutsuzEsigi, hamleDegerlendir } = require('../src/oyun/zeka.js');

test('UMUTSUZ KAPI: eşik temkinle büyüyor (çekimser il daha çok üstünlük ister)', () => {
  const cekimser = { temkin: 1.0 };
  const saldirgan = { temkin: 0.0 };
  dogru(
    umutsuzEsigi(cekimser) > umutsuzEsigi(saldirgan),
    'çekimserin eşiği saldırganınkinden yüksek olmalı'
  );
  esit(umutsuzEsigi(saldirgan), Z.UMUTSUZ_SALDIRI.TABAN, 'temkin 0 iken eşik TABAN olmalı');
});

test('UMUTSUZ KAPI: kapatılınca eşik sıfır (Görev 11 davranışı)', () => {
  const eski = Z.UMUTSUZ_SALDIRI.ACIK;
  Z.UMUTSUZ_SALDIRI.ACIK = false;
  esit(umutsuzEsigi({ temkin: 1 }), 0, 'bayrak kapalıyken eşik sıfır olmalı');
  Z.UMUTSUZ_SALDIRI.ACIK = eski;
});

test('UMUTSUZ KAPI: kaybedeceği belli saldırı emir olmuyor', () => {
  // 1 piyade ile 4 zırhlının üstüne: üstünlük tabana yakın, kapı kapanmalı.
  let d = sahne();
  const { kaynak, hedef } = cephe(d, BEN);
  d = orduKoy(d, kaynak, BEN, { piyade: 1 });
  d = orduKoy(d, hedef, d.parcaSahipligi[hedef], { zirhli: 4 });

  const hamle = { kaynak, hedef, birlikler: { piyade: 1 } };
  const d1 = hamleDegerlendir(d, BEN, hamle, { temkin: 0.5, acgozluluk: 0.8, saldirganlik: 0.8 });
  dogru(d1.umutsuz, 'umutsuz saldırı kapıdan geçti (üstünlük ' + d1.ustunluk.toFixed(2) + ')');

  // Aynı hedefe EZİCİ kuvvetle: kapı açılmalı.
  d = orduKoy(d, kaynak, BEN, { zirhli: 8 });
  const d2 = hamleDegerlendir(
    d,
    BEN,
    { kaynak, hedef, birlikler: { zirhli: 8 } },
    { temkin: 0.5, acgozluluk: 0.8, saldirganlik: 0.8 }
  );
  dogru(!d2.umutsuz, 'ezici saldırı da elendi (üstünlük ' + d2.ustunluk.toFixed(2) + ')');
});

test('UMUTSUZ KAPI: boş/dost parçaya girişi ENGELLEMİYOR', () => {
  // Üstünlük boş hedefte tanım gereği 1 — kapı orada hiç kapanmamalı, yoksa zekâ
  // boş toprağa yürüyemez hâle gelir.
  let d = sahne();
  const { kaynak, hedef } = cephe(d, BEN);
  d = orduKoy(d, kaynak, BEN, { piyade: 2 });
  const sonuc = hamleDegerlendir(
    d,
    BEN,
    { kaynak, hedef, birlikler: { piyade: 2 } },
    { temkin: 1.0, acgozluluk: 0.5, saldirganlik: 0.5 }
  );
  esit(sonuc.ustunluk, 1, 'boş hedefte üstünlük 1 olmalı');
  dogru(!sonuc.umutsuz, 'boş parçaya giriş umutsuz sayıldı');
});

// ---- BİTİRME İŞTAHI (2026-08-08, Baki: "yapay zekâlar oyunu bitirme isteğiyle oynasın") ----
//
// Tur sınırı kaldırıldığı için gerekli oldu: sınırsız bir maçta dünya kilitlenirse maç
// hiç bitmez. Ölçümü `veri/bitirme-olcum.md`; buradaki testler mekanizmayı kilitliyor.

const { bitirmeIstahi, bitirmeCarpanlari, savasIlanPuani } = require('../src/oyun/zeka.js');

test('BİTİRME: iştah turla büyüyor ve doyma turunda tavana vuruyor', () => {
  const B = DENGE.ZEKA.BITIRME;
  esit(bitirmeIstahi({ tur: 1 }) < bitirmeIstahi({ tur: 30 }), true, 'iştah artmalı');
  esit(bitirmeIstahi({ tur: B.DOYMA_TURU }), 1, 'doyma turunda tavan');
  esit(bitirmeIstahi({ tur: B.DOYMA_TURU * 3 }), 1, 'tavanın üstüne çıkmamalı');
});

test('BİTİRME: kapatılınca iştah SIFIR ve çarpanlar nötr', () => {
  const eski = DENGE.ZEKA.BITIRME.ACIK;
  DENGE.ZEKA.BITIRME.ACIK = false;
  try {
    esit(bitirmeIstahi({ tur: 200 }), 0, 'kapalıyken iştah olmamalı');
    const c = bitirmeCarpanlari({ tur: 200 });
    esit(c.saldiri, 1, 'saldırı çarpanı nötr olmalı');
    esit(c.acikta, 1, 'açıkta çarpanı nötr olmalı');
    esit(c.ilan, 1, 'ilan çarpanı nötr olmalı');
  } finally {
    DENGE.ZEKA.BITIRME.ACIK = eski;
  }
});

test('BİTİRME: geç turda saldırı isteği artıyor, açıkta korkusu sönüyor', () => {
  const erken = bitirmeCarpanlari({ tur: 1 });
  const gec = bitirmeCarpanlari({ tur: DENGE.ZEKA.BITIRME.DOYMA_TURU });
  dogru(gec.saldiri > erken.saldiri, 'geç turda saldırı çarpanı büyümeli');
  dogru(gec.acikta < erken.acikta, 'geç turda açıkta cezası sönmeli');
  dogru(gec.acikta > 0, 'ceza tamamen sıfırlanmamalı (başkent boş kalmasın)');
  esit(gec.saldiri, DENGE.ZEKA.BITIRME.SALDIRI_CARPANI, 'tavanda tam çarpan');
});

test('BİTİRME: aynı hamle geç turda DAHA YÜKSEK puan alıyor', () => {
  // Mekanizmanın gerçekten karara girdiğinin ölçüsü: tek değişen şey tur.
  let d = sahne();
  const { kaynak, hedef } = cephe(d, BEN);
  d = orduKoy(d, kaynak, BEN, { piyade: 6 });
  const kisilik = { temkin: 0.7, acgozluluk: 0.6, saldirganlik: 0.6, husumet: 0 };
  const hamle = { kaynak, hedef, birlikler: { piyade: 6 } };

  const erken = hamlePuani({ ...d, tur: 1 }, BEN, hamle, kisilik);
  const gec = hamlePuani({ ...d, tur: DENGE.ZEKA.BITIRME.DOYMA_TURU }, BEN, hamle, kisilik);
  dogru(gec > erken, 'geç turda hamle puanı artmalı: ' + erken.toFixed(3) + ' → ' + gec.toFixed(3));
});

test('BİTİRME: savaş ilanı isteği de geç turda artıyor', () => {
  const d = sahne();
  const hedef = Object.keys(d.aktorler).find((x) => x !== BEN);
  const kisilik = { temkin: 0.5, acgozluluk: 0.7, saldirganlik: 0.6, husumet: 0 };
  const erken = savasIlanPuani({ ...d, tur: 1 }, BEN, hedef, kisilik);
  const gec = savasIlanPuani({ ...d, tur: DENGE.ZEKA.BITIRME.DOYMA_TURU }, BEN, hedef, kisilik);
  dogru(gec > erken, 'geç turda ilan puanı artmalı: ' + erken.toFixed(3) + ' → ' + gec.toFixed(3));
});
