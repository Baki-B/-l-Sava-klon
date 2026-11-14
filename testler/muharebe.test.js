// MUHAREBE MOTORU TESTLERİ (Görev 05 / Adım 1).
//
// Asıl sorular: tasarım §3.7'deki 15 satır yeniden üretiliyor mu, dört tasarım kısıtı
// tutuyor mu, sabitler denge.js'ten mi okunuyor, sonuç belirlenimci mi, muharebe
// sonsuza gidebiliyor mu, kayıplar orantılı mı?
//
// §3.7 tablosu SÜREKLİ bir modelin çıktısı (kesirli birim, moral yok); motor TAM SAYI
// çalışıyor. Bu yüzden ondalık eşitlik ARANMAZ — karşılaştırma kazanan üzerinden yapılır.
// Sürekli modelin kendisi `scripts/muharebe-referans.js`'te; oradan `require` ediliyor ki
// tablo iki yerde kopyalanmasın.

const { test, dogru, esit, yakin } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const {
  muharebeCoz,
  muharebeTahmini,
  moralHesapla,
  etkinlik,
  zOrt,
  hamHasar,
  araziliHasar,
} = require('../src/oyun/muharebe.js');
const { birimSayisi } = require('../src/oyun/ordu.js');
const { TABLO, surekliCoz } = require('../scripts/muharebe-referans.js');

// Kısa yazım: tarafsız bir muharebe (moral bonusu yok, şans kapalı).
function coz(saldiran, savunan, arazi, ek) {
  return muharebeCoz({
    saldiran: { birimler: saldiran },
    savunan: { birimler: savunan },
    arazi: arazi || 'ova',
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null,
    ...(ek || {}),
  });
}
const p = (n) => ({ piyade: n });
const t = (n) => ({ topcu: n });
const z = (n) => ({ zirhli: n });

// ---- §3.3 ETKİNLİK EĞRİLERİ ----

test('etkinlik eğrileri üç birimde ölçülen değerleri veriyor', () => {
  // ⚠ AĞIR SÜTUNU 2026-08-11'DE DEĞİŞTİ (Baki: "ağır vuruş zırha karşı delicilik versin,
  // bonus hasar kazanmasın"). Eskiden 0.62/0.68/0.76 idi — yani ağır vuruş hedef ne kadar
  // zırhlıysa o kadar VERİMLİYDİ. Artık 0.76/0.72/0.64: zırh arttıkça azalıyor.
  // Hafif sütunu hiç değişmedi. Gerekçe ve ölçüm `denge.js AGIR_DELICILIK`.
  //
  // ZIRH DEĞERLERİ DENGE'DEN OKUNUYOR, elle yazılmıyor (2026-07-31): muharebe statları
  // ölçeklendiğinde bu test zırhı sabit yazdığı için kırılmıştı. Etkinlik eğrisi
  // ÖLÇEKTEN BAĞIMSIZ — bölen de aynı katsayıyla büyüdüğü için sonuç değişmiyor.
  const z = (tur) => DENGE.BIRIMLER[tur].zirh;
  yakin(etkinlik(z('piyade')).agir, 0.76, 0.006, 'piyade ağır');
  yakin(etkinlik(z('piyade')).hafif, 0.83, 0.006, 'piyade hafif');
  yakin(etkinlik(z('topcu')).agir, 0.72, 0.006, 'topçu ağır');
  yakin(etkinlik(z('topcu')).hafif, 0.67, 0.006, 'topçu hafif');
  yakin(etkinlik(z('zirhli')).agir, 0.64, 0.006, 'zırhlı ağır');
  yakin(etkinlik(z('zirhli')).hafif, 0.33, 0.006, 'zırhlı hafif');
});

test('ZIRH AĞIR VURUŞA BONUS VERMEZ — etkinlik zırh arttıkça asla artmaz', () => {
  // Baki'nin isteğinin kural hâli. 2026-08-11 öncesinde bu test GEÇMEZDİ: eski formülde
  // "isabet verimi" terimi zırhla birlikte büyüyor ve sönümü yeniyordu, yani ağır vuruş
  // zırhlı hedefte bonus kazanıyordu. Bir daha o kapıdan girilemesin diye burada duruyor.
  let onceki = Infinity;
  for (let z = 0; z <= 120; z += 2) {
    const a = etkinlik(z).agir;
    dogru(a <= onceki + 1e-12, 'zırh ' + z + ' olunca ağır etkinlik ARTTI: ' + onceki + ' → ' + a);
    onceki = a;
  }
});

test('DELİCİLİK: zırh ağır vuruşu, hafif vuruşa göre (1−delicilik) kadar azaltır', () => {
  // "Zırhın bir kısmına ignore atsın" cümlesinin ölçüsü: aynı zırh artışı hafif vuruşu ne
  // kadar düşürüyorsa, ağır vuruşu bunun (1 − AGIR_DELICILIK) katı kadar düşürmeli.
  // İki eğri de aynı bölenden geçtiği için oran her zırh değerinde aynı çıkar.
  const M = DENGE.MUHAREBE;
  const hafifDusus = etkinlik(0).hafif - etkinlik(30).hafif;
  const agirDusus = etkinlik(0).agir - etkinlik(30).agir;
  yakin(agirDusus / hafifDusus, (1 - M.AGIR_DELICILIK) * M.AGIR_VERIM, 1e-9, 'delicilik oranı');
  // Zırhsız hedefte ağır vuruşun verimi sabit katsayının kendisi (bonus yok, tavan var).
  yakin(etkinlik(0).agir, M.AGIR_VERIM, 1e-9, 'zırhsız hedefte ağır verim');
});

test('zOrt = toplam zırh / birim sayısı', () => {
  const B = DENGE.BIRIMLER;
  yakin(
    zOrt({ piyade: 3, topcu: 1, zirhli: 1 }),
    (3 * B.piyade.zirh + B.topcu.zirh + B.zirhli.zirh) / 5,
    1e-9
  );
  esit(zOrt({}), 0, 'boş ordu');
});

test('etkinlikler alt sınırlarla kırpılıyor (clamp)', () => {
  // Aşırı zırhlı bir hedefte hafif vuruş HAFIF_ALT'ın altına inemez.
  yakin(etkinlik(1000).hafif, DENGE.MUHAREBE.HAFIF_ALT, 1e-9);
  dogru(etkinlik(1000).agir >= DENGE.MUHAREBE.AGIR_ALT, 'ağır etkinlik alt sınırın altında');
});

// ---- §3.7 DOĞRULAMA TABLOSU ----

test('§3.7 doğrulama tablosunun 15 satırının hepsinde kazanan doğru', () => {
  // 2026-08-08: tablonun biçimi değişti — beklenen kazanan artık kalan-kuvvet
  // sayılarından TÜRETİLMİYOR, tasarım kararı olarak doğrudan yazılı (gerekçe
  // `scripts/muharebe-referans.js`'te). Bu test o kararı motora sorar.
  const yanlis = [];
  for (const [ad, s, d, arazi, beklenen] of TABLO) {
    const r = coz(s, d, arazi);
    if (r.kazanan !== beklenen)
      yanlis.push(ad + ' → ' + r.kazanan + ' (beklenen ' + beklenen + ')');
  }
  dogru(yanlis.length === 0, '15 satırdan tutmayan(lar): ' + yanlis.join(' | '));
});

test('§3.7 kalan oran çıpası tutuyor (regresyon: stat oynarsa öter)', () => {
  // Kazanan tasarım kararı, KALAN ORAN ise motordan ölçülüp kaydedilmiş bir çıpa.
  // Biri bir statı oynatırsa bu sayı kayar ve ölçüm sessizce geçmez.
  const sap = [];
  for (const [ad, s, d, arazi, beklenen, oran] of TABLO) {
    const r = coz(s, d, arazi);
    const n = beklenen === 'saldiran' ? birimSayisi(s) : birimSayisi(d);
    const kalan = beklenen === 'saldiran' ? r.saldiran.kalan : r.savunan.kalan;
    const bulunan = kalan / n;
    if (Math.abs(bulunan - oran) > 0.05)
      sap.push(ad + ' → ' + bulunan.toFixed(2) + ' (çıpa ' + oran.toFixed(2) + ')');
  }
  dogru(sap.length === 0, 'kalan oran çıpasından sapan satır(lar): ' + sap.join(' | '));
});

test('SÜREKLİ MODEL EMEKLİ: motorla ayrıştığı yer belgeli', () => {
  // ⚠ Sürekli model (Görev 05'in ölçütü) artık oyunu TEMSİL ETMİYOR ve bu test onu
  // silmek yerine ayrışmayı kayda geçiriyor.
  //
  // Sebep: model BOZGUN BİLMİYOR. Motor Görev 07'den beri oran modeliyle çalışıyor ve
  // orada tek birimlik ordu DAĞILAMAZ (bozgun "en az bir birim kaybı" istiyor) — ya
  // savaşır ya imha olur. Sürekli model kesirli can gördüğü için o orduyu da dağıtıyor.
  // Dayanıklılıklar 4× büyüyüp savaşlar uzayınca fark belirginleşti.
  //
  // Test şunu kilitliyor: ayrışma VAR ve tek yönlü — sürekli model tek birimlik orduyu
  // erken dağıtıyor. Yeni bir ayrışma türü doğarsa burası öter.
  const ayrisan = [];
  for (const [ad, s, d, arazi, beklenen] of TABLO) {
    const r = surekliCoz(s, d, arazi, 'hasar');
    const modelKazanani = r.kalanSaldiran > r.kalanSavunan ? 'saldiran' : 'savunan';
    if (modelKazanani !== beklenen) ayrisan.push(ad);
  }

  // ⚠ AYRIŞMANIN İKİNCİ SEBEBİ 2026-08-08'DE EKLENDİ: raunt sayısı artık ordu
  // büyüklüğünden geliyor ve hasar o sayıya bölünüyor. Sürekli model ikisini de bilmiyor;
  // savaşı sonuna kadar oynatıyor. Yani ayrışma artık yalnız tek birimlik taraflarda
  // değil, kademesi büyük savaşlarda da çıkıyor.
  //
  // Test ayrışmanın VAR olduğunu değil, AZINLIKTA kaldığını kilitliyor: model tamamen
  // alakasız hâle gelirse (çoğunluk ayrışırsa) burası öter ve modeli silme kararı
  // bilinçli olarak verilir — sessizce çürümez.
  dogru(
    ayrisan.length < TABLO.length / 2,
    'sürekli model çoğunlukta ayrıştı (' +
      ayrisan.length +
      '/' +
      TABLO.length +
      ') — artık ölçüt sayılamaz: ' +
      ayrisan.join(', ')
  );
});

test('kalan kuvvetin BÜYÜKLÜK SIRASI referansla aynı (ondalık eşitlik aranmaz)', () => {
  // Aynı savunmaya karşı referans ne kadar çok kalan bırakıyorsa, motor da o kadar
  // bırakmalı. Tam sayıya yuvarlandığı için "≥" aranıyor, birebir eşitlik değil.
  const sirali = [
    [z(1), p(1), 'ova'], // referans 0.78
    [z(1), p(2), 'ova'], // referans 0.15
    [z(1), p(3), 'ova'], // referans 0.00
  ];
  let onceki = Infinity;
  for (const [s, d, arazi] of sirali) {
    const kalan = coz(s, d, arazi).saldiran.kalan;
    dogru(kalan <= onceki, 'savunma arttıkça saldıranın kalanı artmamalı');
    onceki = kalan;
  }
});

// ---- §3.7 ALTINDAKİ DÖRT TASARIM KISITI ----

test('kısıt 1 — piyade denk sayıda zırhlı/topçuyu asla yenmez', () => {
  for (const n of [1, 2, 3, 5]) {
    esit(coz(p(n), z(n)).kazanan, 'savunan', n + ' piyade vs ' + n + ' zırhlı');
    esit(coz(p(n), t(n)).kazanan, 'savunan', n + ' piyade vs ' + n + ' topçu');
  }
});

test('kısıt 1b — piyade sayı üstünlüğüyle VEYA arazi ile kazanabiliyor', () => {
  esit(coz(p(3), z(1)).kazanan, 'saldiran', 'saldıran 3 piyade savunan 1 zırhlıyı geçmeli');
  // Savunmada 2 piyade, dağlıkta gelen 1 zırhlıyı durduruyor (coğrafya).
  esit(coz(z(1), p(2), 'daglik').kazanan, 'savunan', 'dağlıkta piyade zırhlıyı durdurmalı');
});

test('kısıt 2 — zırhlı 1v1 piyadeyi ezer, 2ye 1 dar kazanır, 3e 1 kaybeder', () => {
  const bir = coz(z(1), p(1));
  esit(bir.kazanan, 'saldiran', '1v1');
  // 2026-08-08: savaş süresi artık büyüklükten geliyor ve 2 birimlik çarpışma TEK RAUNT.
  // "Ezer" bu yüzden "imha eder" değil, "açık ara kazanır" demek: ölçüt yıpranma farkı.
  // Zırhlı piyadeyi bir raundda canının yarısından fazlasını götürerek geçiyor.
  dogru(bir.saldiran.kalan >= bir.savunan.kalan, '1v1de zırhlı üstün çıkmalı');
  esit(coz(z(1), p(2)).kazanan, 'saldiran', '2ye 1');
  esit(coz(z(1), p(3)).kazanan, 'savunan', '3e 1');
});

test('kısıt 3 — zırhlı topçuyla ovada kazanır, topçunun tek şansı coğrafya', () => {
  esit(coz(z(1), t(1), 'ova').kazanan, 'saldiran');
  esit(coz(z(1), t(1), 'tepelik').kazanan, 'saldiran');
  esit(coz(z(1), t(1), 'daglik').kazanan, 'savunan');
});

test('kısıt 4 — ölçekte de aynı: 4 zırhlı vs 6 topçu ovada kazanır, dağlıkta ezilir', () => {
  esit(coz(z(4), t(6), 'ova').kazanan, 'saldiran');
  esit(coz(z(4), t(6), 'tepelik').kazanan, 'savunan');
  const daglik = coz(z(4), t(6), 'daglik');
  esit(daglik.kazanan, 'savunan');
  dogru(daglik.savunan.kalan >= 4, 'dağlıkta topçu ezmeli, kıl payı kazanmamalı');
});

// ---- DENGE SABİTLERİ KODA GÖMÜLÜ DEĞİL ----
// Yöntem Görev 04'teki maliyet testinin aynısı: sabiti değiştir, sonucun değiştiğini gör.

// GERİ ALMA ARTIK DEĞERİ SAKLIYOR, elle yazmıyor (2026-07-31). Eskiden geri alma eski
// sayıyı sabit yazıyordu (HAFIF_BOLEN = 12); statlar 25× ölçeklenip bölenler de büyüyünce
// testler sabiti YANLIŞ değere döndürdü ve kendi kendilerini kırdı. Okuyup geri koymak
// hem doğru hem de bir daha kaymaz.
function sabitDeneyi(ad, yol, yeniDeger, senaryo) {
  test('denge sabiti koda gömülü değil — ' + ad, () => {
    const [kap, alan] = yol();
    const eski = kap[alan];
    const once = JSON.stringify(senaryo());
    kap[alan] = yeniDeger;
    const sonra = JSON.stringify(senaryo());
    kap[alan] = eski;
    const geri = JSON.stringify(senaryo());
    dogru(once !== sonra, ad + ' değişince muharebe sonucu DEĞİŞMELİ (koda gömülü olabilir)');
    esit(geri, once, ad + ' eski değerine dönünce sonuç da dönmeli');
  });
}

sabitDeneyi(
  'HAFIF_BOLEN (ana düğme)',
  () => [DENGE.MUHAREBE, 'HAFIF_BOLEN'],
  DENGE.MUHAREBE.HAFIF_BOLEN / 2,
  () => coz(p(3), z(1))
);
sabitDeneyi(
  'AGIR_DELICILIK (ağır vuruşun yok saydığı zırh payı)',
  () => [DENGE.MUHAREBE, 'AGIR_DELICILIK'],
  0.1,
  () => coz(t(3), z(2))
);
sabitDeneyi(
  'AGIR_VERIM (ağır vuruşun sabit verimi)',
  () => [DENGE.MUHAREBE, 'AGIR_VERIM'],
  0.5,
  () => coz(t(2), p(3))
);
sabitDeneyi(
  'MORAL_BOLEN',
  () => [DENGE.MUHAREBE, 'MORAL_BOLEN'],
  1,
  () => coz(p(6), t(4))
);
sabitDeneyi(
  'ARAZI.daglik.zirhli (dağlık zırhlı cezası)',
  () => [DENGE.ARAZI.daglik, 'zirhli'],
  1.5,
  () => coz(z(1), t(1), 'daglik')
);
sabitDeneyi(
  'ARAZI.daglik.savunan',
  () => [DENGE.ARAZI.daglik, 'savunan'],
  1.0,
  () => coz(p(4), p(3), 'daglik')
);

test('zırhlı arazi çarpanı HASARA uygulanıyor (dayanıklılığa değil)', () => {
  // Ölçüm kararı: `veri/muharebe-referans.md`. Dağlıkta zırhlının vuruşu tam yarıya iner.
  const ova = araziliHasar(z(1), 4, 'ova', false);
  const daglik = araziliHasar(z(1), 4, 'daglik', false);
  yakin(daglik / ova, DENGE.ARAZI.daglik.zirhli / DENGE.ARAZI.ova.zirhli, 1e-9);
  // Piyadenin vuruşu araziden ETKİLENMEZ (savunan çarpanı hariç).
  yakin(araziliHasar(p(1), 4, 'daglik', false), araziliHasar(p(1), 4, 'ova', false), 1e-9);
});

test('savunan çarpanı yalnızca SAVUNAN tarafa uygulanıyor', () => {
  const saldiran = araziliHasar(p(2), 4, 'daglik', false);
  const savunan = araziliHasar(p(2), 4, 'daglik', true);
  yakin(savunan / saldiran, DENGE.ARAZI.daglik.savunan, 1e-9);
});

test('ham hasar arazi TANIMAZ (şans eşiğinin ölçüsü budur)', () => {
  yakin(hamHasar(z(2), 4), araziliHasar(z(2), 4, 'ova', false) / DENGE.ARAZI.ova.zirhli, 1e-9);
});

// ---- BELİRLENİMCİLİK ----

test('aynı tohum + aynı girdi → birebir aynı sonuç', () => {
  const a = coz(p(4), t(3), 'tepelik', { tohum: 12345 });
  const b = coz(p(4), t(3), 'tepelik', { tohum: 12345 });
  esit(JSON.stringify(a), JSON.stringify(b), 'aynı tohum aynı sonucu vermeli');
});

test('tohum null verilirse şans TAMAMEN kapalı (tahmin için)', () => {
  const a = coz(p(4), t(3), 'tepelik');
  const b = coz(p(4), t(3), 'tepelik');
  esit(JSON.stringify(a), JSON.stringify(b));
  dogru(
    a.turlar.every((x) => x.sans === false),
    'şans kapalıyken hiçbir turda devrede görünmemeli'
  );
});

test('üreteç ilerliyor — dönen rastgeleDurum tohumdan farklı', () => {
  const r = coz(p(4), t(3), 'ova', { tohum: 999 });
  dogru(
    r.turlar.some((x) => x.sans),
    'yakın güçlerde şans devrede olmalı'
  );
  dogru(r.rastgeleDurum !== 999, 'muharebe üretecin durumunu ilerletmeli');
});

test('§3.6 — kuvvet oranı 2:1i aşınca şans SIFIRLANIR', () => {
  // 8 piyade vs 1 topçu: ham hasar oranı 2:1'in çok üstünde → şans hiç devreye girmemeli,
  // bu yüzden farklı tohumlar aynı sonucu vermeli ("ezici ordumu kaptırdım" olmasın).
  const a = coz(p(8), t(1), 'ova', { tohum: 1 });
  const b = coz(p(8), t(1), 'ova', { tohum: 777777 });
  esit(JSON.stringify(a.saldiran), JSON.stringify(b.saldiran), 'ezici üstünlükte şans olmamalı');
  dogru(
    a.turlar.every((x) => x.sans === false),
    'oran 2:1i aştığında şans devrede olmamalı'
  );
});

test('§3.6 — güçler yakınken şans DEVREDE ve tohum sonucu değiştirebiliyor', () => {
  const farkli = new Set();
  for (let tohum = 1; tohum <= 60; tohum++)
    farkli.add(JSON.stringify(coz(p(5), p(5), 'ova', { tohum }).saldiran.kalan));
  dogru(farkli.size > 1, 'denk güçlerde farklı tohumlar farklı sonuç verebilmeli');
});

// ---- HASAR HAVUZU (§3.4) ----

test('hasar havuzu muharebeye taşınıyor — yıpranmış ordu daha çabuk kırılır', () => {
  const saglam = muharebeCoz({
    saldiran: { birimler: p(3), hasarHavuzu: 0 },
    savunan: { birimler: t(2) },
    arazi: 'ova',
    tohum: null,
  });
  const yipranmis = muharebeCoz({
    // Bir piyadenin canının kılpayı altı — DENGE'den okunuyor, elle yazılmıyor
    // (muharebe statları 25× ölçekli, sabit 11 yazmak testi ölçeğe bağlardı).
    saldiran: { birimler: p(3), hasarHavuzu: DENGE.BIRIMLER.piyade.dayaniklilik - 1 },
    savunan: { birimler: t(2) },
    arazi: 'ova',
    tohum: null,
  });
  dogru(
    yipranmis.saldiran.kalan < saglam.saldiran.kalan,
    'havuzla giren ordu daha az birimle çıkmalı'
  );
});

test('artık hasar havuzda birikiyor, birim öldürmeye yetmiyorsa kimse ölmez', () => {
  // 1 piyade vs 1 piyade tek turda kimseyi öldüremez (6.85 hasar < 12 dayanıklılık).
  const r = coz(p(1), p(1));
  dogru(
    r.turlar[0].saldiranKayip === 0 && r.turlar[0].savunanKayip === 0,
    'ilk turda kayıp olmamalı'
  );
  dogru(r.turlar[0].saldiranVurus > 0, 'ama hasar verilmiş olmalı');
});

test('havuz iki haneye yuvarlanıyor (kayıt dosyası şişmesin)', () => {
  const r = coz(p(3), t(2));
  const h = r.saldiran.hasarHavuzu;
  esit(Math.round(h * 100), h * 100, 'havuz iki haneden uzun olmamalı');
});

// ---- KAYIP DAĞITIMI (§3.4) ----

test('kayıp kompozisyona ORANTILI dağılıyor', () => {
  // 6 piyade + 2 topçu + 2 zırhlı (3:1:1) ağır hasar yiyor; kayıplar da 3:1:1'e yakın olmalı.
  const r = coz(p(20), { piyade: 6, topcu: 2, zirhli: 2 }, 'ova');
  const k = r.savunan.kayiplar;
  const toplam = (k.piyade || 0) + (k.topcu || 0) + (k.zirhli || 0);
  dogru(toplam >= 3, 'anlamlı sayıda kayıp olmalı, bulunan ' + toplam);
  // Piyade en kalabalık tür; kayıpların çoğunluğu ondan olmalı, zırhlı korunmamalı.
  dogru((k.piyade || 0) >= (k.zirhli || 0), 'orantılı dağıtımda piyade zırhlıdan az kaybedemez');
  dogru(toplam < 3 || (k.piyade || 0) < toplam, 'kayıp tek türe yığılmamalı');
});

test('"piyade önce ölür zırhlıyı korur" sömürüsü kapalı — zırhlı da ölüyor', () => {
  // Ölçülen şey KAYIP DAĞITIMI: karışık bir ordu erirken zırhlı da sırasını almalı,
  // yoksa "1 zırhlı + çok piyade" dizen oyuncunun zırhlısı hiç ölmez ve bedavaya gelir.
  //
  // 2026-08-08: bozgun eşiği düşünce (TABAN 0.40) savunan zırhlı sırası gelmeden
  // dağılıyordu — bu bir sömürü değil, ordunun kaçması. Test o yüzden bozgunu geçici
  // olarak kapatıp muharebeyi İMHAYA zorluyor; sorduğu soru zaten "imhada zırhlı ölür mü".
  const eski = DENGE.MUHAREBE.MORAL.TABAN;
  DENGE.MUHAREBE.MORAL.TABAN = 5; // pratikte bozgun yok
  try {
    const r = coz(p(30), { piyade: 8, zirhli: 1 }, 'ova');
    esit(r.sebep, 'imha', 'bozgun kapalıyken imhaya gitmeli');
    dogru((r.savunan.kayiplar.zirhli || 0) > 0, 'ağır yenilgide zırhlı da kaybedilmeli');
  } finally {
    DENGE.MUHAREBE.MORAL.TABAN = eski;
  }
});

test('kayıp dağılımı belirlenimci — aynı durum hep aynı türü öldürür', () => {
  const a = coz(t(9), { piyade: 3, topcu: 1, zirhli: 1 });
  const b = coz(t(9), { piyade: 3, topcu: 1, zirhli: 1 });
  esit(JSON.stringify(a.savunan.kayiplar), JSON.stringify(b.savunan.kayiplar));
});

// ---- MORAL VE BOZGUN (§3.8) ----

test('moral = ⌈birim/MORAL_BOLEN⌉ + bonus', () => {
  esit(moralHesapla(p(5), 0), 3, '5 birim → 3');
  esit(moralHesapla(p(5), 2), 5, '5 birim + 2 bonus → 5');
  esit(moralHesapla(p(1), 0), 1, 'tek birim → 1');
  esit(moralHesapla({}, 0), 0, 'boş ordu → 0');
});

test('moral bonusu savunanı ayakta tutuyor (§3.8 örneği)', () => {
  const bonussuz = muharebeCoz({
    saldiran: { birimler: p(6) },
    savunan: { birimler: p(5) },
    arazi: 'daglik',
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null,
  });
  const bonuslu = muharebeCoz({
    saldiran: { birimler: p(6) },
    savunan: { birimler: p(5) },
    arazi: 'daglik',
    moralBonuslari: { saldiran: 0, savunan: 2 }, // dağlık savunma + kendi toprağı
    tohum: null,
  });
  dogru(
    bonuslu.savunan.baslangicMoral > bonussuz.savunan.baslangicMoral,
    'bonus morali yükseltmeli'
  );
  dogru(
    bonuslu.turlar.length >= bonussuz.turlar.length,
    'morali yüksek savunan en az o kadar dayanmalı'
  );
});

test('bozulan taraf işaretleniyor, kazanan bozulmuyor', () => {
  const r = coz(p(9), p(4));
  esit(r.kazanan, 'saldiran');
  if (r.sebep === 'bozgun') {
    dogru(r.savunan.bozgun, 'kaybeden bozulmuş sayılmalı');
    dogru(!r.saldiran.bozgun, 'kazanan bozulmuş sayılmamalı');
  }
});

test('karşılıklı imhada bir taraf AYAKTA kalıyor (tam sayı sınırı kuralı)', () => {
  // Kural: eşzamanlı hasar iki tarafı birden silemez; biri ayakta kalır. Ölçmek için
  // İMHAYA giden bir eşleşme gerekiyor — 2026-08-08'den beri küçük çarpışmalar tek raunt
  // sürdüğü için imha ancak yeterince büyük bir kuvvet farkında oluyor.
  const r = coz(p(6), t(3), 'ova');
  dogru(r.saldiran.kalan > 0 || r.savunan.kalan > 0, 'iki taraf birden silinemez');
  dogru(r.kazanan !== null, 'kazanan belirlenmeli');
});

// ---- ÜST SINIR ----

test('muharebe hiçbir girdide sonsuza gitmiyor', () => {
  const turler = ['piyade', 'topcu', 'zirhli'];
  let enUzun = 0,
    denenen = 0;
  for (const a of turler)
    for (const b of turler)
      for (const na of [1, 2, 5, 12, 40])
        for (const nb of [1, 2, 5, 12, 40])
          for (const arazi of ['ova', 'tepelik', 'daglik']) {
            const r = coz({ [a]: na }, { [b]: nb }, arazi);
            denenen++;
            enUzun = Math.max(enUzun, r.turlar.length);
            dogru(
              r.turlar.length <= 4,
              'üst sınır aşıldı: ' + a + na + ' vs ' + b + nb + ' ' + arazi
            );
            dogru(
              ['imha', 'bozgun', 'berabere', 'sure'].includes(r.sebep),
              'tanımsız bitiş sebebi: ' + r.sebep
            );
          }
  dogru(denenen === 675, 'beklenen kombinasyon sayısı, bulunan ' + denenen);
  dogru(enUzun >= 1, 'en az bir tur sürmeli');
});

test('RAUNT TAVANI: süre dolunca az yıpranan kazanır, kimse bozulmaz', () => {
  // ---- 2026-08-08: BU ARTIK İSTİSNA DEĞİL, NORMAL BİTİŞ ----
  // Raunt sayısı ordu büyüklüğünden geliyor (Baki'nin isteği) ve 2 birimlik çarpışma tek
  // raunt sürüyor. Eskiden tavan "berabere" demekti; öyle kalsaydı bütün küçük savaşlar
  // sonuçsuz biterdi. Artık kazananı oransal yıpranma belirliyor ve bu bir BOZGUN DEĞİL —
  // kaybeden çekilme kaybı ödemez.
  const r = coz(p(1), p(1));
  esit(r.sebep, 'sure');
  esit(r.kazanan, 'savunan', 'eşit yıpranmada toprak savunanda kalır');
  dogru(!r.saldiran.bozgun && !r.savunan.bozgun, 'süre bitişinde bozgun olmamalı');
});

test('RAUNT SAYISI: ordu büyüklüğüne göre 1-4 arasında (Bakinin kademeleri)', () => {
  const { rauntSayisi } = require('../src/oyun/muharebe.js');
  // Ölçü İKİ TARAFIN TOPLAMI: savaşın büyüklüğü sahaya çıkan toplam kuvvet.
  esit(rauntSayisi(p(1), p(1)), 1, '2 birim → 1 raunt');
  esit(rauntSayisi(p(5), p(4)), 1, '9 birim → 1 raunt');
  esit(rauntSayisi(p(5), p(5)), 2, '10 birim → 2 raunt');
  esit(rauntSayisi(p(10), p(9)), 2, '19 birim → 2 raunt');
  esit(rauntSayisi(p(10), p(10)), 3, '20 birim → 3 raunt');
  esit(rauntSayisi(p(25), p(24)), 3, '49 birim → 3 raunt');
  esit(rauntSayisi(p(25), p(25)), 4, '50 birim → 4 raunt');
  esit(rauntSayisi(p(80), p(80)), 4, 'kademe tavanı 4te duruyor');

  // Gerçek muharebede de tutuyor mu (bozgun erken bitirmediyse):
  dogru(coz(p(1), p(1)).turlar.length <= 1, '2 birimlik savaş tek raunt');
  dogru(coz(p(12), p(12)).turlar.length <= 3, '24 birimlik savaş en çok 3 raunt');
});

// ---- MUHAREBE TAHMİNİ (arayüz) ----

test('tahmin üç kademe veriyor ve kesin sayı vermiyor', () => {
  const ustun = muharebeTahmini({
    saldiran: { birimler: p(12) },
    savunan: { birimler: p(1) },
    arazi: 'ova',
  });
  const zayif = muharebeTahmini({
    saldiran: { birimler: p(1) },
    savunan: { birimler: z(4) },
    arazi: 'daglik',
  });
  esit(ustun.kademe, 'ustun');
  esit(zayif.kademe, 'zayif');
  dogru(['ustun', 'denk', 'zayif'].includes(ustun.kademe), 'kademe üçünden biri olmalı');
  dogru(typeof ustun.kalan === 'number', 'beklenen kalan birim sayısı verilmeli');
});

// ---- TAHMİN TEK YÖNLÜ OLMALI (2026-07-31, Baki: "1 topçu ekleyince ÜSTÜN'den DENK'e
// düşüyor") ----
//
// Kural: BİRLİK EKLEMEK TAHMİNİ ASLA KÖTÜLEŞTİRMEZ — motorun kendisi gerçekten daha kötü
// bir sonuç üretmediği sürece. Eski ölçü (`kalan / gönderilen`) bunu ihlal ediyordu: payda
// gönderdiğin birlik sayısıydı, dolayısıyla ordu büyüdükçe oran düşüyordu. Taramada 398
// UYDURMA düşüş vardı — motor daha iyi sonuç verdiği hâlde tahmin kötüleşiyordu.
//
// Yeni ölçü muharebe sonundaki ÜSTÜNLÜK: kalanın / (kalanın + onun kalanı).
const KADEME_SIRASI = ['ustun', 'denk', 'zayif'];

test('TAHMİN: birlik eklemek tahmini UYDURMA yere kötüleştirmiyor', () => {
  const yanlis = [];
  for (const arazi of ['ova', 'tepelik', 'daglik']) {
    for (const sav of [{ piyade: 3 }, { topcu: 2, zirhli: 1 }, { piyade: 2, zirhli: 1 }, z(2)]) {
      for (const A of [p(1), { piyade: 1, zirhli: 1 }, { piyade: 3, zirhli: 1 }, t(2)]) {
        for (const ek of DENGE.BIRIM_SIRASI) {
          const B = { ...A, [ek]: (A[ek] || 0) + 1 };
          const girdi = { savunan: { birimler: sav }, arazi };
          const t1 = muharebeTahmini({ ...girdi, saldiran: { birimler: A } });
          const t2 = muharebeTahmini({ ...girdi, saldiran: { birimler: B } });
          if (KADEME_SIRASI.indexOf(t2.kademe) <= KADEME_SIRASI.indexOf(t1.kademe)) continue;

          // Kademe düştü — motor GERÇEKTEN kötüleştiyse bu dürüst bir tahmindir.
          const c1 = coz(A, sav, arazi);
          const c2 = coz(B, sav, arazi);
          const motorKotulesti =
            c2.saldiran.kalan < c1.saldiran.kalan ||
            c2.savunan.kalan > c1.savunan.kalan ||
            (c1.kazanan === 'saldiran' && c2.kazanan !== 'saldiran');
          if (!motorKotulesti)
            yanlis.push(
              arazi + ' ' + JSON.stringify(A) + ' +1 ' + ek + ': ' + t1.kademe + ' → ' + t2.kademe
            );
        }
      }
    }
  }
  dogru(yanlis.length === 0, 'uydurma düşüş: ' + yanlis.join(' | '));
});

test('TAHMİN: savunanı tamamen yok eden saldırı ÜSTÜN sayılıyor', () => {
  // Eski ölçüde 5 birlikle savunanı silip 2 birlik kalmak "denk"ti (2/5 = %40),
  // 4 birlikle savunanı sağ bırakıp 2 birlik kalmak "üstün"dü (2/4 = %50). Ters.
  const t = muharebeTahmini({
    saldiran: { birimler: { piyade: 6, zirhli: 2 } },
    savunan: { birimler: { piyade: 1 } },
    arazi: 'ova',
  });
  esit(t.kademe, 'ustun');
});

test("TAHMİN: eşik DENGE'den okunuyor (gömülü değil)", () => {
  const eski = DENGE.MUHAREBE.USTUNLUK_ESIGI;
  const girdi = {
    saldiran: { birimler: { piyade: 3 } },
    savunan: { birimler: { piyade: 2 } },
    arazi: 'ova',
  };
  try {
    DENGE.MUHAREBE.USTUNLUK_ESIGI = 0.01;
    esit(muharebeTahmini(girdi).kademe, 'ustun', 'eşik 0.01 → her zafer üstün');
    DENGE.MUHAREBE.USTUNLUK_ESIGI = 1.5;
    esit(muharebeTahmini(girdi).kademe, 'denk', 'eşik 1.5 → hiçbir zafer üstün değil');
  } finally {
    DENGE.MUHAREBE.USTUNLUK_ESIGI = eski;
  }
});

test('tahmin şanssız — aynı girdi hep aynı kademeyi verir', () => {
  const gir = { saldiran: { birimler: p(5) }, savunan: { birimler: t(3) }, arazi: 'tepelik' };
  esit(JSON.stringify(muharebeTahmini(gir)), JSON.stringify(muharebeTahmini(gir)));
});

test('boş ordu muharebeye giremez — motor yine de doğru cevap verir', () => {
  esit(coz({}, p(2)).kazanan, 'savunan');
  esit(coz(p(2), {}).kazanan, 'saldiran');
});

// ---- BOZGUN MODELİ (Görev 07 / Adım 1) ----
//
// Görev 06 §13/1b'nin devri: birlik eklemek muharebe sonucunu kötüleştirebiliyordu.
// Kök sebep moral sayacının GRANÜLERLİĞİYDİ (`⌈n/2⌉`: 3 birim → 2, 4 birim → yine 2).
// Bozgun artık ordunun kaybettiği CAN ORANINA bakıyor; ölçüm `veri/moral-olcum.md`.
//
// Bu testler yapay zekânın (§9.1) dayandığı varsayımı kilitliyor: "birlik eklersem sonuç
// iyileşir". Kırılırlarsa zekânın kararları da güvenilmez olur.

test('BOZGUN: birlik eklemek kazanılan muharebeyi kaybettirmiyor', () => {
  // Ölçümün 416.025 durumluk taramasının küçük ve hızlı bir örneği. Tam tarama
  // `node scripts/moral-olcum.js` ile koşuluyor; burada geri gidiş kilidi tutuluyor.
  let denenen = 0;
  for (const arazi of ['ova', 'tepelik', 'daglik'])
    for (let a = 1; a <= 4; a++)
      for (let b = 1; b <= 4; b++)
        for (const [tA, tB] of [
          ['piyade', 'piyade'],
          ['piyade', 'topcu'],
          ['topcu', 'zirhli'],
          ['zirhli', 'piyade'],
        ]) {
          const temel = coz({ [tA]: a }, { [tB]: b }, arazi);
          if (temel.kazanan !== 'saldiran') continue;
          for (const ek of DENGE.BIRIM_SIRASI) {
            const artmis = { [tA]: a };
            artmis[ek] = (artmis[ek] || 0) + 1;
            const yeni = coz(artmis, { [tB]: b }, arazi);
            denenen++;
            esit(
              yeni.kazanan,
              'saldiran',
              tA + a + ' vs ' + tB + b + ' (' + arazi + ') — 1 ' + ek + ' eklenince kaybetti'
            );
          }
        }
  dogru(denenen > 100, 'tarama gerçekten koştu (denenen: ' + denenen + ')');
});

test('BOZGUN: hiç birim ölmeden ordu dağılmaz', () => {
  // Ölçümün yakaladığı ilk kusur. Oran modeli kayıp şartı olmadan kurulunca zırhlının
  // ilk vuruşu piyadeyi öldürmeden bozguna uğratıyordu; §3.7'nin "zırhlı piyadeyi 1v1
  // EZER" satırı ters dönüyordu.
  // Kural: hiç birim ölmeden bozgun olmaz. Tek rauntluk küçük çarpışmada kimse ölmezse
  // sonuç 'sure' ile belirlenir, 'bozgun' ile değil.
  const r = coz(z(1), p(1));
  esit(r.kazanan, 'saldiran');
  dogru(r.sebep !== 'bozgun', 'kimse ölmeden bozgun yazılmamalı');

  {
    const b = coz(p(1), p(1));
    esit(b.sebep, 'sure');
    dogru(!b.saldiran.bozgun && !b.savunan.bozgun, 'kimse ölmeden bozgun olmamalı');
  }
});

test("BOZGUN: eşik DENGE'den okunuyor (gömülü değil)", () => {
  const eski = { ...DENGE.MUHAREBE.MORAL };
  try {
    // Eşik çok düşükse ilk kayıpta dağılır; çok yüksekse son birime kadar dövüşür.
    // 2026-08-08: eşik artık tek sayı değil — TABAN + moral katkısı + durum kalemleri.
    // Test tabana dokunuyor, çünkü "temel seviye" Bakinin şartının taşıyıcısı.
    // ⚠ ESKİDEN 4v4 KULLANIYORDU; 2026-08-08'den beri o savaş 1 RAUNT sürüyor (8 birim)
    // ve eşik ne olursa olsun süre değişemez. Eşiğin süreye etkisini ölçmek için raunt
    // tavanı yüksek bir savaş gerekiyor: 15v15 = 30 birim → 3 raunt.
    DENGE.MUHAREBE.MORAL.TABAN = 0.01;
    const cabuk = coz(p(15), p(15));
    DENGE.MUHAREBE.MORAL.TABAN = 5;
    const inatci = coz(p(15), p(15));
    dogru(
      cabuk.turlar.length < inatci.turlar.length,
      'eşik büyüdükçe muharebe uzamalı (' +
        cabuk.turlar.length +
        ' vs ' +
        inatci.turlar.length +
        ')'
    );
    // 2026-08-08: raunt tavanı geldiği için "imhaya kadar gider" diye bir şey kalmadı —
    // eşik çok yüksekken savaş bozgunsuz biter ve sonucu süre belirler. Ölçülen kural
    // aynı: eşiği yükseltmek bozgunu engelliyor.
    dogru(inatci.sebep !== 'bozgun', 'eşik çok yüksekken bozgun olmamalı: ' + inatci.sebep);
  } finally {
    Object.assign(DENGE.MUHAREBE.MORAL, eski);
  }
});

test('BOZGUN: moral bonusu orduyu daha dayanıklı yapıyor', () => {
  // §3.8'in üç bonusu (yüksek moral statı · dağlık savunma · kendi toprağı) sayaç
  // modelinde "bir kayıp daha dayan" demekti; oran modelinde eşiği yukarı taşıyor.
  const bonussuz = muharebeCoz({
    saldiran: { birimler: p(5) },
    savunan: { birimler: p(5) },
    arazi: 'ova',
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null,
  });
  const bonuslu = muharebeCoz({
    saldiran: { birimler: p(5) },
    savunan: { birimler: p(5) },
    arazi: 'ova',
    moralBonuslari: { saldiran: 0, savunan: 2 },
    tohum: null,
  });
  dogru(
    bonuslu.savunan.kalan >= bonussuz.savunan.kalan,
    'bonuslu savunan en az bonussuz kadar ayakta kalmalı'
  );
});

test('BOZGUN: sayaç modeli hâlâ çalışıyor (ölçüm tekrar edilebilir)', () => {
  // `scripts/moral-olcum.js` iki modeli karşılaştırabilsin diye eskisi de duruyor.
  const r = coz(p(6), p(6), 'ova', { moral: { MODEL: 'sayac' } });
  dogru(
    ['imha', 'bozgun', 'berabere', 'sure'].includes(r.sebep),
    'sayaç modeli tanımlı sonuç vermeli'
  );
});

// ---- ŞANS SÖNÜMÜ · GÜN ÇARPANI · BASKIN (Görev 12 / Adım 3–5) ----
//
// Baki'nin şartı: zayıf görünen ordu ~%1 kazanabilsin AMA umutsuz eşleşmede 0 olsun.
// Bu üç kural birlikte o şartı taşıyor; testler şartın kendisini kilitliyor.

const { sansSonumu } = require('../src/oyun/muharebe.js');

test('ŞANS SÖNÜMÜ: denk savaşta tam, kapanma oranında sıfır', () => {
  esit(sansSonumu(100, 100), 1, 'denk savaşta şans tam güçte olmalı');
  esit(sansSonumu(100, 50), 0, 'kapanma oranında (2×) şans tamamen kapanmalı');
  esit(sansSonumu(100, 20), 0, 'umutsuz eşleşmede şans kapalı olmalı');
  esit(sansSonumu(100, 0), 0, 'karşı taraf hiç vuramıyorsa şans yok');
  const orta = sansSonumu(100, 75); // oran 1.33
  dogru(orta > 0 && orta < 1, 'ara oranda sönüm 0 ile 1 arasında olmalı: ' + orta);
});

test('ŞANS SÖNÜMÜ: rampa DENGE bayrağından okunuyor', () => {
  const eski = DENGE.MUHAREBE.SANS_RAMPASI;
  DENGE.MUHAREBE.SANS_RAMPASI = false;
  esit(sansSonumu(100, 75), 1, 'rampa kapalıyken eşiğin altında şans tam olmalı');
  DENGE.MUHAREBE.SANS_RAMPASI = eski;
});

test('BASKIN: UMUTSUZ eşleşmede asla olmuyor (Bakinin kırmızı çizgisi)', () => {
  // 1 piyade vs 2 zırhlı — ham hasar oranı 3.68, yani sönüm 0.
  let baskinSayisi = 0;
  let saldiranKazandi = 0;
  for (let i = 1; i <= 800; i++) {
    const r = muharebeCoz({
      saldiran: { birimler: p(1) },
      savunan: { birimler: z(2) },
      arazi: 'ova',
      moralBonuslari: { saldiran: 0, savunan: 0 },
      tohum: i * 7919,
    });
    if (r.baskin) baskinSayisi++;
    if (r.kazanan === 'saldiran') saldiranKazandi++;
  }
  esit(baskinSayisi, 0, 'umutsuz eşleşmede baskın çıktı');
  esit(saldiranKazandi, 0, 'umutsuz eşleşmede zayıf taraf kazandı');
});

test('BASKIN: denk savaşta ÇIKIYOR ve zayıf tarafa gidiyor', () => {
  let baskinli = 0;
  let savunanaGitti = 0;
  for (let i = 1; i <= 1500; i++) {
    const r = muharebeCoz({
      saldiran: { birimler: p(3) },
      savunan: { birimler: p(4) },
      arazi: 'ova',
      moralBonuslari: { saldiran: 0, savunan: 0 },
      tohum: i * 104729,
    });
    if (r.baskin) {
      baskinli++;
      if (r.baskin === 'savunan') savunanaGitti++;
    }
  }
  dogru(baskinli > 0, 'denk savaşta hiç baskın olmadı');
  // 3 piyade vs 4 piyade: zayıf olan SALDIRAN. Baskın hep zayıfa gitmeli.
  esit(savunanaGitti, 0, 'baskın güçlü tarafa gitti');
});

test('BASKIN: kapatılınca hiç olmuyor (tek bayrak)', () => {
  const eski = DENGE.MUHAREBE.BASKIN.ACIK;
  DENGE.MUHAREBE.BASKIN.ACIK = false;
  let baskinli = 0;
  for (let i = 1; i <= 400; i++) {
    const r = muharebeCoz({
      saldiran: { birimler: p(3) },
      savunan: { birimler: p(3) },
      arazi: 'ova',
      moralBonuslari: { saldiran: 0, savunan: 0 },
      tohum: i * 7919,
    });
    if (r.baskin) baskinli++;
  }
  DENGE.MUHAREBE.BASKIN.ACIK = eski;
  esit(baskinli, 0, 'bayrak kapalıyken baskın oldu');
});

test('ŞANS: tohum verilmezse motor hâlâ TAMAMEN belirlenimci (tahmin bunu kullanıyor)', () => {
  // Arayüzdeki savaş tahmini şanssız koşuyor; gün çarpanı ve baskın oraya sızarsa
  // tahmin her açılışta başka bir şey söyler.
  const bir = coz(p(3), p(4), 'ova');
  const iki = coz(p(3), p(4), 'ova');
  esit(bir.kazanan, iki.kazanan, 'şanssız sonuç değişti');
  esit(bir.baskin, null, 'şanssız muharebede baskın çıktı');
  esit(bir.saldiran.kalan, iki.saldiran.kalan, 'şanssız kalan kuvvet değişti');
});

test('ZAYIF TARAF: kazanabiliyor ama NADİR (Bakinin "~%1" tarifi)', () => {
  // Ölçüm `veri/sans-olcum.md`'de; burada yalnızca bandın içinde kaldığı kilitleniyor.
  let kazandi = 0;
  const N = 2000;
  for (let i = 1; i <= N; i++) {
    const r = muharebeCoz({
      saldiran: { birimler: p(3) },
      savunan: { birimler: p(4) },
      arazi: 'ova',
      moralBonuslari: { saldiran: 0, savunan: 0 },
      tohum: i * 7919,
    });
    if (r.kazanan === 'saldiran') kazandi++;
  }
  const yuzde = (kazandi / N) * 100;
  dogru(yuzde > 0, 'zayıf taraf hiç kazanamıyor — sürpriz ölmüş');
  dogru(yuzde < 5, 'zayıf taraf fazla kazanıyor (%' + yuzde.toFixed(1) + ') — savaş kumara döndü');
});
