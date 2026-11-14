// ORDU TESTLERİ (Görev 04 / Adım 3).
// Asıl sorular: maliyetler denge.js'ten mi okunuyor, bütçe aşılabiliyor mu,
// boş parça kayıt tutuyor mu, sanayi sınırı tutuyor mu, il/parça toplamları doğru mu?

const { test, dogru, esit, yakin } = require('./yardimci');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const {
  siparisMaliyeti,
  birimSayisi,
  parcaBirimSayisi,
  aktorBirimSayisi,
  ilOrduDurumu,
  tumIlOrdulari,
  ilUretimHakki,
  eklenebilirMi,
  siparisGecerliMi,
  birimUret,
  rozetYazisi,
  rozetKatmani,
  orduDokumu,
} = require('../src/oyun/ordu.js');
const { DENGE } = require('../src/denge.js');
const illerData = require('../veri/iller.json');

const TOHUM = 20260727;

// SAHA TEMİZ BAŞLIYOR. Görev 05'ten beri oyun kurulumu her parçaya bir kuruluş garnizonu
// koyuyor (`garnizon.js`). Bu dosyadaki testler ÜRETİMİ ölçüyor — "bastığım birim doğdu
// mu", "boş parça kayıt tutuyor mu", "il toplamı doğru mu". Garnizonlar araya girseydi her
// sayıya sabit bir taban eklenir ve testler ne ölçtüklerini söylemez olurdu.
// Garnizonların kendisi `testler/garnizon.test.js`'te sınanıyor.
const yeni = () => ({ ...oyunKur({ senaryo: 'turkiye', tohum: TOHUM }), ordular: {} });

// Test kolaylığı: oyuncunun havuzunu elle doldurur (tur beklemeden).
function paraVer(durum, nufus, ekonomi) {
  const id = durum.oyuncuAktorId;
  return {
    ...durum,
    aktorler: {
      ...durum.aktorler,
      [id]: { ...durum.aktorler[id], nufusHavuzu: nufus, ekonomiHavuzu: ekonomi },
    },
  };
}

// Oyuncu Bursa (16); Bursa Ovası 16-1 onun parçası.
const PARCA = '16-1';

// ---- maliyetler ----

test('MALİYET: tasarım §3.1 tablosuyla birebir aynı (denge.js)', () => {
  esit(DENGE.BIRIMLER.piyade.nufus, 3, 'piyade nüfus');
  esit(DENGE.BIRIMLER.piyade.ekonomi, 1, 'piyade ekonomi');
  esit(DENGE.BIRIMLER.topcu.nufus, 2, 'topçu nüfus');
  esit(DENGE.BIRIMLER.topcu.ekonomi, 3, 'topçu ekonomi');
  esit(DENGE.BIRIMLER.zirhli.nufus, 1, 'zırhlı nüfus');
  esit(DENGE.BIRIMLER.zirhli.ekonomi, 6, 'zırhlı ekonomi');
});

// ---- MİMARİ SIFIRDAN KURULDU (2026-08-08, Baki) ----
//
// Bu test eskiden tasarım §3.1'in ham sayılarını (piyade dayanıklılık 12×ölçek gibi)
// birebir arıyordu. Baki mimariyi sıfırdan istedi ve dokuz stat birden değişti; §3.1'in
// sayıları artık tarihsel bir kayıt. Yerine geçen şey daha güçlü: sayıların KENDİSİ değil,
// aralarındaki İLİŞKİLER kilitleniyor — yani Baki'nin tarif ettiği rol profilleri.
//
// Aynı kurallar `scripts/denge-mimarisi.js`'te de denetleniyor (rapor için); burada
// testte de duruyorlar ki mimari sessizce kaymasın.

test('MİMARİ: her birim Bakinin tarif ettiği rol profiline uyuyor', () => {
  const B = DENGE.BIRIMLER;

  // "Piyade soft+hard vursun ama softu hardına göre yüksek olsun, hard hasarı az olsun."
  dogru(
    B.piyade.hafifVurus > B.piyade.agirVurus * 1.5,
    'piyade hafif/ağır oranı: ' + B.piyade.hafifVurus + '/' + B.piyade.agirVurus
  );
  // "Topçuda hard yüksek olsun."
  dogru(
    B.topcu.agirVurus > B.topcu.hafifVurus * 1.5,
    'topçu ağır/hafif oranı: ' + B.topcu.agirVurus + '/' + B.topcu.hafifVurus
  );
  // "Zırhlıda ikisi de yüksek olsun." Ölçüt: ikisi de piyadenin ağırını geçmeli.
  dogru(
    B.zirhli.agirVurus > B.piyade.agirVurus && B.zirhli.hafifVurus > B.piyade.agirVurus,
    'zırhlı iki vuruşu da yüksek olmalı'
  );
  // "Dayanıklılık zırhlıda fazla, askerde orta-fazla, topçuda orta."
  dogru(
    B.zirhli.dayaniklilik > B.piyade.dayaniklilik && B.piyade.dayaniklilik > B.topcu.dayaniklilik,
    'dayanıklılık sırası zırhlı > piyade > topçu olmalı'
  );
  // Zırh sırası muharebe formülünün kalibrasyonu (etkinlik eğrileri buna bağlı).
  dogru(B.zirhli.zirh > B.topcu.zirh && B.topcu.zirh > B.piyade.zirh, 'zırh sırası bozuk');
});

test('MİMARİ: bütün muharebe statları ölçeğin katı (araştırma tam sayı kalsın)', () => {
  // Araştırmanın %8'lik artışının tam sayı çıkması buna bağlı — Baki "ondalıklı hiçbir şey
  // istemiyorum" dedi ve kural mimariden ÖNCE geliyor: yeni sayılar buna uyacak seçildi.
  const O = DENGE.STAT_OLCEGI;
  for (const tur of DENGE.BIRIM_SIRASI)
    for (const stat of ['zirh', 'agirVurus', 'hafifVurus', 'dayaniklilik'])
      esit(DENGE.BIRIMLER[tur][stat] % O, 0, tur + '.' + stat + ' ölçeğin katı değil');
});

test('ÖLÇEK: nüfus ve ekonomi ölçeklenmedi (onlar bedel, muharebe statı değil)', () => {
  // Ölçek yalnızca dört muharebe statına uygulandı. Fiyatlar §4.2'deki gibi kaldı;
  // ölçeklenselerdi bütün ekonomi dengesi ve §4.5'in karışım tablosu kayardı.
  esit(DENGE.BIRIMLER.piyade.nufus, 3);
  esit(DENGE.BIRIMLER.piyade.ekonomi, 1);
  esit(DENGE.BIRIMLER.zirhli.ekonomi, 6);
});

test('ÖLÇEK: araştırma artışı her seviyede TAM SAYI ve MONOTON', () => {
  // ---- 2026-08-08: ÖLÇÜT DEĞİŞTİ ----
  // Statlar iki basamağa inince (Baki'nin isteği) ham çarpım artık her zaman tam sayı
  // çıkmıyor — 10 × 1.1 = 11 ama 15 × 1.1 = 16.5. `birimStatlari` sonucu zaten
  // yuvarlıyor, yani ekranda ondalık GÖRÜNMÜYOR; Baki'nin asıl şartı buydu.
  //
  // Yerine geçen ölçüt daha sıkı: her seviye bir ÖNCEKİNDEN BÜYÜK olmalı. Yuvarlama
  // yüzünden iki seviyenin aynı sayıya düşmesi, oyuncunun 180 puan ödeyip hiçbir şey
  // almaması demek — sessiz ve en kötü türden bir hata. ARTIS 0.08 → 0.10 tam bu yüzden
  // yükseltildi (en küçük stat 10'da %8 artış iki seviyeyi birleştiriyordu).
  const { birimStatlari } = require('../src/oyun/arastirma.js');
  const A = DENGE.ARASTIRMA;
  const DAL = { zirh: 'zirh', agirVurus: 'agir', hafifVurus: 'hafif' };

  for (const tur of DENGE.BIRIM_SIRASI)
    for (const stat of Object.keys(DAL)) {
      if (!A.AGACLAR[tur] || !A.AGACLAR[tur][DAL[stat]]) continue; // o birimde o dal yok
      let onceki = DENGE.BIRIMLER[tur][stat];
      for (let sv = 1; sv <= A.TAVAN; sv++) {
        const v = birimStatlari({ [tur + '.' + DAL[stat]]: sv })[tur][stat];
        esit(v, Math.round(v), tur + '.' + stat + ' Sv.' + sv + ' tam sayı değil');
        dogru(v > onceki, tur + '.' + stat + ' Sv.' + sv + ' artmadı: ' + onceki + ' → ' + v);
        onceki = v;
      }
    }
});

test("MALİYET: sipariş bedeli kod içine gömülü değil, denge.js'ten türüyor", () => {
  // §4.2 örneği: 4 piyade + 1 topçu + 1 zırhlı
  const b = siparisMaliyeti({ piyade: 4, topcu: 1, zirhli: 1 });
  esit(b.nufus, 4 * 3 + 1 * 2 + 1 * 1, 'nüfus');
  esit(b.ekonomi, 4 * 1 + 1 * 3 + 1 * 6, 'ekonomi');

  // Denge sayısı değişirse bedel de değişmeli — gömülü olmadığının kanıtı.
  const eski = DENGE.BIRIMLER.zirhli.ekonomi;
  DENGE.BIRIMLER.zirhli.ekonomi = 10;
  esit(siparisMaliyeti({ zirhli: 1 }).ekonomi, 10, 'çarpan değişince bedel');
  DENGE.BIRIMLER.zirhli.ekonomi = eski;
});

test('boş sipariş bedava, sayısı sıfır', () => {
  esit(siparisMaliyeti({}).nufus, 0, 'nüfus');
  esit(birimSayisi({}), 0, 'sayı');
  esit(birimSayisi(null), 0, 'null');
});

// ---- satın alma ----

test('SATIN ALMA: birimler doğuyor, havuzdan tam bedeli düşüyor', () => {
  const d = paraVer(yeni(), 20, 20);
  const s = birimUret(d, PARCA, '16', { piyade: 2, topcu: 1 });
  dogru(s.ok, 'üretim başarılı olmalı');

  esit(parcaBirimSayisi(s.durum, PARCA), 3, 'parçadaki birim');
  esit(s.durum.ordular[PARCA].sahip, '16', 'sahip');
  esit(s.durum.ordular[PARCA].birimler.piyade, 2, 'piyade');
  esit(s.durum.ordular[PARCA].birimler.topcu, 1, 'topçu');

  // 2 piyade (6 nüfus/2 ekonomi) + 1 topçu (2/3) = 8 nüfus, 5 ekonomi
  yakin(s.durum.aktorler['16'].nufusHavuzu, 20 - 8, 1e-9, 'nüfus havuzu');
  yakin(s.durum.aktorler['16'].ekonomiHavuzu, 20 - 5, 1e-9, 'ekonomi havuzu');
});

test('SATIN ALMA: eski durum DEĞİŞMİYOR (yeni durum dönüyor)', () => {
  const d = paraVer(yeni(), 20, 20);
  const s = birimUret(d, PARCA, '16', { piyade: 1 });
  dogru(s.ok, 'üretim başarılı');
  esit(Object.keys(d.ordular).length, 0, 'eski durumda hâlâ ordu yok');
  yakin(d.aktorler['16'].nufusHavuzu, 20, 1e-9, 'eski havuz dokunulmamış');
});

test('SATIN ALMA: aynı parçaya ikinci sipariş üstüne EKLENİYOR', () => {
  let d = paraVer(yeni(), 40, 40);
  d = birimUret(d, PARCA, '16', { piyade: 2 }).durum;
  d = birimUret(d, PARCA, '16', { piyade: 1, zirhli: 1 }).durum;
  esit(d.ordular[PARCA].birimler.piyade, 3, 'piyade toplandı');
  esit(d.ordular[PARCA].birimler.zirhli, 1, 'zırhlı eklendi');
  esit(parcaBirimSayisi(d, PARCA), 4, 'toplam');
});

test('BÜTÇE AŞILAMAZ: nüfus yetmiyorsa sipariş reddediliyor', () => {
  const d = paraVer(yeni(), 5, 100); // 5 nüfus = en fazla 1 piyade (3)
  const s = birimUret(d, PARCA, '16', { piyade: 2 }); // 6 nüfus gerekir
  dogru(!s.ok, 'reddedilmeli');
  dogru(/[Nn]üfus/.test(s.sebep), 'sebep nüfusu söylemeli: ' + s.sebep);
  esit(Object.keys(s.durum.ordular).length, 0, 'hiçbir şey üretilmemeli');
  yakin(s.durum.aktorler['16'].nufusHavuzu, 5, 1e-9, 'havuz dokunulmamalı');
});

test('BÜTÇE AŞILAMAZ: ekonomi yetmiyorsa sipariş reddediliyor', () => {
  const d = paraVer(yeni(), 100, 5); // 5 ekonomi = 1 zırhlı bile alınmaz (6)
  const s = birimUret(d, PARCA, '16', { zirhli: 1 });
  dogru(!s.ok, 'reddedilmeli');
  dogru(/[Ee]konomi/.test(s.sebep), 'sebep ekonomiyi söylemeli: ' + s.sebep);
});

test('BÜTÇE: havuz kesirliyse AŞAĞI yuvarlanır (ekranda görünen kadarı harcanabilir)', () => {
  // Ekranda "3 nüfus" yazarken 3.9 varsa 1 piyade (3 nüfus) alınabilmeli...
  dogru(
    siparisGecerliMi(paraVer(yeni(), 3.9, 10), PARCA, '16', { piyade: 1 }).ok,
    '3.9 → 1 piyade'
  );
  // ...ama 2 piyade (6 nüfus) alınamamalı.
  dogru(
    !siparisGecerliMi(paraVer(yeni(), 5.9, 10), PARCA, '16', { piyade: 2 }).ok,
    '5.9 → 2 piyade'
  );
});

test('SAHİPLİK: yabancı parçaya asker basılamaz', () => {
  const d = paraVer(yeni(), 100, 100);
  const s = birimUret(d, '34-1', '16', { piyade: 1 }); // İstanbul'un parçası
  dogru(!s.ok, 'reddedilmeli');
  esit(Object.keys(s.durum.ordular).length, 0, 'ordu doğmamalı');
});

test('KAPSAM: senaryo dışı parçaya asker basılamaz', () => {
  const d = paraVer(oyunKur({ senaryo: 'karadeniz', tohum: TOHUM }), 100, 100);
  const s = birimUret(d, '07-1', d.oyuncuAktorId, { piyade: 1 }); // Antalya kapsam dışı
  dogru(!s.ok, 'reddedilmeli');
});

test('BOŞ SİPARİŞ: hiç birim seçilmeden ÜRET çalışmaz', () => {
  const d = paraVer(yeni(), 100, 100);
  dogru(!birimUret(d, PARCA, '16', {}).ok, 'boş sipariş');
  dogru(!birimUret(d, PARCA, '16', { piyade: 0 }).ok, 'sıfırlık sipariş');
});

test('BOŞ PARÇA KAYIT TUTMUYOR: ordusu olmayan parça `ordular`da yok', () => {
  const d = paraVer(yeni(), 100, 100);
  esit(Object.keys(d.ordular).length, 0, 'oyun başında hiç kayıt yok');
  const s = birimUret(d, PARCA, '16', { piyade: 1 }).durum;
  esit(Object.keys(s.ordular).length, 1, 'yalnızca asker basılan parça');
  esit(Object.keys(s.ordular)[0], PARCA, 'o da doğru parça');
  esit(parcaBirimSayisi(s, '16-2'), 0, 'boş parçanın sayısı 0');
  esit(parcaBirimSayisi(s, '99-9'), 0, 'olmayan parça da 0');
});

// ---- sanayi sınırı (Soru 2 → cevap A) ----

test('SANAYİ SINIRI: ilin sanayi statı kadar birim basılabiliyor', () => {
  const sanayi = illerData['16'].statlar.sanayi;
  const d = paraVer(yeni(), 999, 999);
  esit(ilUretimHakki(d, '16', '16').sinir, sanayi, 'sınır ilin statı');
  esit(ilUretimHakki(d, '16', '16').kalan, sanayi, 'başta hepsi boşta');

  // Tam sınır kadar basmak GEÇERLİ
  const s = birimUret(d, PARCA, '16', { piyade: sanayi });
  dogru(s.ok, 'sınır kadar basmak geçerli olmalı: ' + s.sebep);
  esit(ilUretimHakki(s.durum, '16', '16').kalan, 0, 'hak tükendi');
});

test('SANAYİ SINIRI: bir fazlası reddediliyor, sebebi söyleniyor', () => {
  const sanayi = illerData['16'].statlar.sanayi;
  const d = paraVer(yeni(), 999, 999);
  const s = birimUret(d, PARCA, '16', { piyade: sanayi + 1 });
  dogru(!s.ok, 'sınırın üstü reddedilmeli');
  dogru(/[Ss]anayi/.test(s.sebep), 'sebep sanayiyi söylemeli: ' + s.sebep);
});

test('SANAYİ SINIRI: aynı ilin İKİ parçası TEK havuzu paylaşıyor', () => {
  const sanayi = illerData['16'].statlar.sanayi;
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, '16-1', '16', { piyade: sanayi - 1 }).durum;
  esit(ilUretimHakki(d, '16', '16').kalan, 1, 'bir hak kaldı');
  // Kalan hak 1 iken ilin BAŞKA parçasına 2 birim basılamaz.
  dogru(!birimUret(d, '16-2', '16', { piyade: 2 }).ok, 'ikinci parçadan taşamaz');
  dogru(birimUret(d, '16-2', '16', { piyade: 1 }).ok, 'kalan 1 hak kullanılabilir');
});

test('SANAYİ SINIRI: sayaç her tur SIFIRLANIYOR', () => {
  const sanayi = illerData['16'].statlar.sanayi;
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, PARCA, '16', { piyade: sanayi }).durum;
  esit(ilUretimHakki(d, '16', '16').kalan, 0, 'tur içinde hak bitti');
  d = turuBitir(d);
  esit(ilUretimHakki(d, '16', '16').kalan, sanayi, 'yeni turda hak yenilendi');
  esit(parcaBirimSayisi(d, PARCA), sanayi, 'ordular DURUYOR (tur geçince silinmiyor)');
});

test('SANAYİ SINIRI: sayaç aktör başına — düşmanın ürettiği senin hakkını yemiyor', () => {
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, PARCA, '16', { piyade: 2 }).durum;
  esit(ilUretimHakki(d, '16', '16').kullanilan, 2, 'oyuncunun kullandığı');
  esit(ilUretimHakki(d, '16', '34').kullanilan, 0, 'başka aktörün hakkı dolmadı');
});

test('SANAYİ SINIRI: denge düğmesi kapatılınca sınır kalkıyor', () => {
  const d = paraVer(yeni(), 999, 999);
  DENGE.SANAYI_SINIRI_ACIK = false;
  const s = birimUret(d, PARCA, '16', { piyade: 50 });
  DENGE.SANAYI_SINIRI_ACIK = true;
  dogru(s.ok, 'sınır kapalıyken para yettiği kadar basılabilmeli: ' + s.sebep);
});

// ---- toplamlar (rozet katmanları) ----

test('TOPLAM: il toplamı, ildeki tüm parçaların birimlerini topluyor', () => {
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, '16-1', '16', { piyade: 3 }).durum;
  d = birimUret(d, '16-2', '16', { topcu: 2 }).durum;
  const il = ilOrduDurumu(d, '16');
  esit(il.toplam, 5, 'Bursa toplamı');
  esit(il.baskinAktorId, '16', 'baskın sahip');
  esit(il.sahipler.length, 1, 'tek sahip');
  esit(ilOrduDurumu(d, '34').toplam, 0, 'ordusu olmayan il 0');
});

test('TOPLAM: il rozetinde BASKIN SAHİP en çok birimi olan (§7.2)', () => {
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, '16-1', '16', { piyade: 2 }).durum;
  // 16-2'yi İstanbul'a verip oraya ordu koy — ilde iki sahip olsun.
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-2': '34' } };
  d = paraVer(d, 999, 999);
  d = {
    ...d,
    aktorler: { ...d.aktorler, 34: { ...d.aktorler['34'], nufusHavuzu: 999, ekonomiHavuzu: 999 } },
  };
  d = birimUret(d, '16-2', '34', { piyade: 5 }).durum;

  const il = ilOrduDurumu(d, '16');
  esit(il.toplam, 7, 'toplam ilin tamamı');
  esit(il.baskinAktorId, '34', 'baskın = en çok birimi olan');
  esit(il.sahipler.length, 2, 'iki sahip');
});

test('TOPLAM: tumIlOrdulari tek geçişte aynı sonucu veriyor', () => {
  let d = paraVer(yeni(), 999, 999);
  d = birimUret(d, '16-1', '16', { piyade: 3 }).durum;
  d = birimUret(d, '16-3', '16', { zirhli: 1 }).durum;
  const hepsi = tumIlOrdulari(d.ordular);
  esit(hepsi['16'].toplam, ilOrduDurumu(d, '16').toplam, 'Bursa');
  esit(hepsi['16'].baskinAktorId, '16', 'baskın');
  dogru(hepsi['34'] === undefined, 'ordusu olmayan il listede yok');
});

test('TOPLAM: aktörün sahadaki tüm birimleri', () => {
  let d = paraVer(yeni(), 999, 999);
  esit(aktorBirimSayisi(d, '16'), 0, 'oyun başında ordu yok');
  d = birimUret(d, '16-1', '16', { piyade: 3, topcu: 1 }).durum;
  d = birimUret(d, '16-2', '16', { zirhli: 2 }).durum;
  esit(aktorBirimSayisi(d, '16'), 6, 'toplam');
  esit(aktorBirimSayisi(d, '34'), 0, 'başkasının ordusu yok');
});

// ---- gösterim ----

test('99+ KURALI: 99 üstü kısaltılıyor, rozet büyümüyor (Soru 4 → B)', () => {
  esit(rozetYazisi(1), '1', 'tek hane');
  esit(rozetYazisi(99), '99', 'tam sınır');
  esit(rozetYazisi(100), '99+', 'sınırın bir üstü');
  esit(rozetYazisi(4321), '99+', 'çok büyük');
});

test("KATMAN: sınırlar denge.js'ten okunuyor (Baki 2026-07-27: 1.35 / 2.70)", () => {
  esit(DENGE.ROZET.ORTA_SINIR, 1.35, 'orta sınırı');
  esit(DENGE.ROZET.YAKIN_SINIR, 2.7, 'yakın sınırı');
  esit(DENGE.ROZET.CAP, 26, 'rozet çapı');

  // Önceki katman verilmezse sade eşik davranışı; histerezisli hâli rozet.test.js'te.
  esit(rozetKatmani(0.9), 'uzak', 'en uzak');
  esit(rozetKatmani(1.34), 'uzak', 'sınırın hemen altı');
  esit(rozetKatmani(1.35), 'orta', 'tam sınır orta');
  esit(rozetKatmani(2.69), 'orta', 'ikinci sınırın altı');
  esit(rozetKatmani(2.7), 'yakin', 'tam sınır yakın');
  esit(rozetKatmani(7), 'yakin', 'en yakın');
});

test('DÖKÜM: panelde okunacak metin doğru', () => {
  esit(orduDokumu({ piyade: 3, topcu: 1, zirhli: 1 }), '3 piyade, 1 topçu, 1 zırhlı', 'üçü de');
  esit(orduDokumu({ zirhli: 2 }), '2 zırhlı', 'tek tür');
  esit(orduDokumu({}), '', 'boş');
});

// ---- üretim ekranının [+] tuşu (Adım 4) ----
// `eklenebilirMi` ekranda kullanılıyor, `siparisGecerliMi` satın alırken.
// İkisi AYRIŞIRSA oyuncu basabildiği bir tuşta ret yer (ya da tersi) — o yüzden test.

test('[+] TUŞU: bütçe yettiği sürece açık, yetmeyince kapanıyor', () => {
  const havuz = { nufus: 7, ekonomi: 7 };
  const cokHak = 999;
  // Boş siparişte üçü de alınabilir (piyade 3/1, topçu 2/3, zırhlı 1/6)
  dogru(eklenebilirMi('piyade', {}, havuz, cokHak).ok, 'piyade');
  dogru(eklenebilirMi('zirhli', {}, havuz, cokHak).ok, 'zırhlı');
  // 2 piyade (6 nüfus/2 ekonomi) sonrası 3. piyade nüfusa takılır (9 > 7)
  dogru(!eklenebilirMi('piyade', { piyade: 2 }, havuz, cokHak).ok, '3. piyade');
  esit(eklenebilirMi('piyade', { piyade: 2 }, havuz, cokHak).kod, 'nufus', 'sebep');
  // 1 zırhlı (1/6) sonrası 2. zırhlı ekonomiye takılır (12 > 7)
  esit(eklenebilirMi('zirhli', { zirhli: 1 }, havuz, cokHak).kod, 'ekonomi', 'sebep');
});

test('[+] TUŞU: sanayi hakkı bitince kapanıyor, sebebi ayırt ediliyor', () => {
  const bolHavuz = { nufus: 999, ekonomi: 999 };
  dogru(eklenebilirMi('piyade', { piyade: 2 }, bolHavuz, 3).ok, 'hak varken açık');
  const s = eklenebilirMi('piyade', { piyade: 3 }, bolHavuz, 3);
  dogru(!s.ok, 'hak dolunca kapalı');
  esit(s.kod, 'sanayi', 'sebep bütçe değil sanayi');
});

test('[+] TUŞU: ekranın kuralı ile motorun kuralı AYNI cevabı veriyor', () => {
  const sanayi = illerData['16'].statlar.sanayi;
  // Bilerek kıt bütçe: sınırların ikisine de dayansın.
  const d = paraVer(yeni(), 8, 9);
  const havuz = { nufus: 8, ekonomi: 9 };
  const hak = ilUretimHakki(d, '16', '16');
  esit(hak.kalan, sanayi, 'hak tam');

  // Olası tüm küçük siparişleri tara; her biri için iki kuralı karşılaştır.
  for (let p = 0; p <= 4; p++)
    for (let t = 0; t <= 4; t++)
      for (let z = 0; z <= 4; z++) {
        const siparis = { piyade: p, topcu: t, zirhli: z };
        for (const tur of DENGE.BIRIM_SIRASI) {
          const ekran = eklenebilirMi(tur, siparis, havuz, hak.kalan).ok;
          const buyuk = { ...siparis, [tur]: (siparis[tur] || 0) + 1 };
          const motor = siparisGecerliMi(d, PARCA, '16', buyuk).ok;
          esit(ekran, motor, 'sipariş ' + p + '/' + t + '/' + z + ' + ' + tur);
        }
      }
});

test('[+] TUŞU: sanayi sınırı kapalıyken (Infinity) yalnızca bütçe kısıtlıyor', () => {
  const havuz = { nufus: 999, ekonomi: 999 };
  // Hak sınırsız: sanayi yüzünden ASLA kapanmamalı, sipariş ne kadar büyürse büyüsün.
  dogru(eklenebilirMi('piyade', { piyade: 300 }, havuz, Infinity).ok, '300 piyade hâlâ ucuz');
  // Bütçe bitince yine de kapanır — ve sebep sanayi DEĞİL bütçedir.
  esit(eklenebilirMi('piyade', { piyade: 333 }, havuz, Infinity).kod, 'nufus', 'sebep bütçe');
});

// ---- geçen turun siparişini tekrarla (Adım 6) ----
