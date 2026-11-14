// ÜRETİM HESABI TESTLERİ (Görev 03 / Adım 3 — görev tanımındaki altı doğrulama)
// + TAM SAYI kuralının denetimi (2026-07-26 kararı).
//
//   1) Tam sahiplik      — ilin tüm parçaları tek elde ise gelir = ilin üretimi
//   2) Kısmi sahiplik    — tek parça = o parçanın tam sayı değeri
//   3) Sıfır sahiplik    — parçası olmayan aktör 0 üretir
//   4) TOPLAM KORUNUMU   — sahiplik nasıl dağılırsa dağılsın toplam üretim sabit  ← en önemlisi
//   5) Kapsam dışı sızıntı — Karadeniz oyununda Antalya hiçbir toplama girmiyor
//   6) Kesir korunumu    — çarpan kesirliyse birikim yuvarlanmadan toplanır

const { test, dogru, esit, yakin } = require('./yardimci');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const {
  parcaGeliri,
  aktorGeliri,
  tumGelirler,
  ilGeliri,
  ilUretimi,
  parcaDegerleri,
} = require('../src/oyun/uretim.js');
const { rastgeleKur } = require('../src/oyun/rastgele.js');
const { DENGE } = require('../src/denge.js');
const illerData = require('../veri/iller.json');
const parcalarData = require('../veri/parcalar.json');

const TOHUM = 20260725;
const turkiye = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
const karadeniz = oyunKur({ senaryo: 'karadeniz', tohum: TOHUM });
const C = DENGE.URETIM_CARPANI;

// Üretim çarpanını geçici değiştirip eski değerine döndürür (kesir testleri için).
function carpanIle(deger, govde) {
  const eski = DENGE.URETIM_CARPANI;
  DENGE.URETIM_CARPANI = deger;
  try {
    govde();
  } finally {
    DENGE.URETIM_CARPANI = eski;
  }
}

const ilinParcalari = (kod) =>
  Object.keys(parcalarData.parcalar)
    .filter((pid) => parcalarData.parcalar[pid].kod === kod)
    .sort();

// ---------- TAM SAYI KURALI ----------

test('TAM SAYI: her parçanın getirisi tam sayı ve en az 1', () => {
  for (const pid of Object.keys(parcalarData.parcalar)) {
    const g = parcaGeliri(pid);
    dogru(Number.isInteger(g.nufus), pid + ' nüfus getirisi kesirli: ' + g.nufus);
    dogru(Number.isInteger(g.ekonomi), pid + ' ekonomi getirisi kesirli: ' + g.ekonomi);
    dogru(g.nufus >= 1, pid + ' nüfus getirisi ' + g.nufus + ' (en az 1 olmalı)');
    dogru(g.ekonomi >= 1, pid + ' ekonomi getirisi ' + g.ekonomi + ' (en az 1 olmalı)');
  }
});

test('TAM SAYI: payı büyük parça, payı küçükten az üretmiyor', () => {
  for (const kod of Object.keys(illerData)) {
    const ids = ilinParcalari(kod);
    for (const a of ids)
      for (const b of ids) {
        const pa = parcalarData.parcalar[a],
          pb = parcalarData.parcalar[b];
        if (pa.nufus > pb.nufus)
          dogru(
            parcaGeliri(a).nufus >= parcaGeliri(b).nufus,
            kod + ': ' + a + ' payı büyük ama ' + b + "'den az üretiyor"
          );
        if (pa.ekonomi > pb.ekonomi)
          dogru(
            parcaGeliri(a).ekonomi >= parcaGeliri(b).ekonomi,
            kod + ': ' + a + ' ekonomi sırası bozuk'
          );
      }
  }
});

test('TAM SAYI: ilin üretimi statına eşit (sapma yok)', () => {
  let sapmaN = 0,
    sapmaE = 0;
  const sapanlar = [];
  for (const kod of Object.keys(illerData)) {
    const s = illerData[kod].statlar;
    const u = ilUretimi(kod);
    dogru(u.nufus >= s.nufus, kod + ' nüfus üretimi statın altında');
    dogru(u.ekonomi >= s.ekonomi, kod + ' ekonomi üretimi statın altında');
    // Sapma ancak "her parça en az 1" kuralı statı aşarsa olur.
    dogru(u.nufus <= Math.max(s.nufus, illerData[kod].parcaSayisi), kod + ' nüfus üretimi fazla');
    dogru(
      u.ekonomi <= Math.max(s.ekonomi, illerData[kod].parcaSayisi),
      kod + ' ekonomi üretimi fazla'
    );
    sapmaN += u.nufus - s.nufus;
    sapmaE += u.ekonomi - s.ekonomi;
    if (u.nufus !== s.nufus || u.ekonomi !== s.ekonomi) sapanlar.push(kod);
  }
  // "Her parça en az 1" kuralı, parça sayısı stattan büyükse ilin toplamını şişirebilir.
  // 2026-07-26 yeniden bölümlemesinden sonra (parça sayısı 1–4) böyle bir il kalmadı.
  esit(sapmaN, 0, 'nüfusta toplam sapma');
  esit(sapmaE, 0, 'ekonomide toplam sapma');
  esit(sapanlar.join(','), '', 'sapan il yok');
});

test("RİZE: arazi elle Dağlık'a sabitlendi (parca-uret.js ARAZI_ZORLA)", () => {
  // Bu bir elle geçersiz kılma — bir sonraki veri üretiminde sessizce kaybolmasın.
  // Gerekçe: Kaçkar Vadileri kıyıya katılınca il tepeliğe dönüyordu; Rize'nin kimliği dağ
  // ve tasarım §3.5/§5 Rize'yi dağlık savunma örneği olarak kullanıyor.
  esit(parcalarData.parcalar['53-1'].arazi, 'daglik', 'Rize parçasının arazisi');
  esit(illerData['53'].arazi, 'daglik', 'Rize ilinin arazisi');
  esit(illerData['53'].parcaSayisi, 1, 'Rize parça sayısı');
});

test('İSTANBUL: iki parça — Avrupa 0.65 Ova, Anadolu 0.35 Tepelik', () => {
  const ist = Object.keys(parcalarData.parcalar)
    .filter((pid) => parcalarData.parcalar[pid].kod === '34')
    .sort();
  esit(ist.join(','), '34-1,34-2', 'İstanbul parçaları');
  const avrupa = parcalarData.parcalar['34-1'],
    anadolu = parcalarData.parcalar['34-2'];
  esit(avrupa.nufus, 0.65, 'Avrupa Yakası nüfus payı');
  esit(avrupa.ekonomi, 0.65, 'Avrupa Yakası ekonomi payı');
  esit(avrupa.arazi, 'ova', 'Avrupa Yakası arazisi');
  esit(anadolu.nufus, 0.35, 'Anadolu Yakası nüfus payı');
  esit(anadolu.arazi, 'tepelik', 'Anadolu Yakası arazisi');
});

test('TAM SAYI: dağıtım kuralı tek başına doğru çalışıyor', () => {
  // Bursa: stat 7, paylar 0.55 / 0.28 / 0.13 / 0.04
  esit(parcaDegerleri([0.55, 0.28, 0.13, 0.04], 7).join(','), '3,2,1,1', 'Bursa nüfus');
  // Konya: merkez parça ezici çoğunlukta, küçükler 1'de kalmalı
  esit(parcaDegerleri([0.16, 0.08, 0.06, 0.6, 0.1], 7).join(','), '1,1,1,3,1', 'Konya nüfus');
  // Tek parçalı il: hepsi ona
  esit(parcaDegerleri([1.0], 3).join(','), '3', 'Rize');
  // Stat parça sayısından küçükse "en az 1" kazanır, toplam şişer
  esit(parcaDegerleri([0.5, 0.3, 0.2], 2).join(','), '1,1,1', 'şişme durumu');
});

// ---------- 1) TAM SAHİPLİK ----------
test('1) tam sahiplik: ilin tüm parçaları tek elde ise gelir = ilin üretimi', () => {
  for (const kod of turkiye.senaryo.kapsamIller) {
    const g = aktorGeliri(turkiye, kod);
    const u = ilUretimi(kod);
    yakin(g.nufus, u.nufus * C, 1e-9, kod + ' (' + illerData[kod].ad + ') nüfus geliri');
    yakin(g.ekonomi, u.ekonomi * C, 1e-9, kod + ' ekonomi geliri');
  }
  // Bursa örneği: statı 7 → tam sahiplikte 7 nüfus
  esit(aktorGeliri(turkiye, '16').nufus, 7, 'Bursa nüfus geliri');
});

// ---------- 2) KISMİ SAHİPLİK ----------
test('2) kısmi sahiplik: Bursa Ovası tek başına = 3 nüfus (payı 0.55, il statı 7)', () => {
  const p = parcalarData.parcalar['16-1'];
  esit(p.nufus, 0.55, 'Bursa Ovası nüfus payı');
  esit(illerData['16'].statlar.nufus, 7, 'Bursa nüfus statı');

  const g = parcaGeliri('16-1');
  esit(g.nufus, 3, 'Bursa Ovası nüfus getirisi'); // eski kesirli hâli 3.85 idi
  esit(g.ekonomi, 3, 'Bursa Ovası ekonomi getirisi');

  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(d.parcaSahipligi)) d.parcaSahipligi[pid] = '34';
  d.parcaSahipligi['16-1'] = '16';
  esit(aktorGeliri(d, '16').nufus, 3, 'tek parçalı Bursa');
});

// ---------- 3) SIFIR SAHİPLİK ----------
test('3) sıfır sahiplik: hiç parçası olmayan aktörün geliri 0', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(d.parcaSahipligi))
    if (d.parcaSahipligi[pid] === '16') d.parcaSahipligi[pid] = '34';
  const g = aktorGeliri(d, '16');
  esit(g.nufus, 0, 'nüfus geliri');
  esit(g.ekonomi, 0, 'ekonomi geliri');
  esit(tumGelirler(d)['16'].nufus, 0, 'toplu hesapta da 0 olmalı');
});

// ---------- 4) TOPLAM KORUNUMU ----------
test('4) TOPLAM KORUNUMU: sahiplik nasıl dağılırsa dağılsın toplam üretim sabit', () => {
  const beklenen = turkiye.senaryo.kapsamIller.reduce(
    (t, k) => ({ n: t.n + ilUretimi(k).nufus * C, e: t.e + ilUretimi(k).ekonomi * C }),
    { n: 0, e: 0 }
  );

  function toplam(durum) {
    const g = tumGelirler(durum);
    let n = 0,
      e = 0;
    for (const id of Object.keys(g)) {
      n += g[id].nufus;
      e += g[id].ekonomi;
    }
    return { n, e };
  }

  // a) Başlangıç dağılımı
  const bas = toplam(turkiye);
  yakin(bas.n, beklenen.n, 1e-6, 'başlangıç toplam nüfus üretimi');
  yakin(bas.e, beklenen.e, 1e-6, 'başlangıç toplam ekonomi üretimi');

  // b) 193 parça rastgele karıştırılmış (fetihler olmuş gibi)
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const r = rastgeleKur(TOHUM);
  const aktorler = Object.keys(d.aktorler);
  for (const pid of Object.keys(d.parcaSahipligi))
    d.parcaSahipligi[pid] = aktorler[r.tamsayi(0, aktorler.length - 1)];
  const karisik = toplam(d);
  yakin(karisik.n, beklenen.n, 1e-6, 'karışık dağılımda toplam nüfus üretimi');
  yakin(karisik.e, beklenen.e, 1e-6, 'karışık dağılımda toplam ekonomi üretimi');

  // c) Her şey tek aktörde (imparatorluk)
  const t = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(t.parcaSahipligi)) t.parcaSahipligi[pid] = '16';
  const tek = toplam(t);
  yakin(tek.n, beklenen.n, 1e-6, 'tek aktörde toplam nüfus üretimi');
  yakin(tek.e, beklenen.e, 1e-6, 'tek aktörde toplam ekonomi üretimi');

  // Toplam üretim = statların toplamı (nüfusta birebir)
  const statToplamN = turkiye.senaryo.kapsamIller.reduce(
    (t2, k) => t2 + illerData[k].statlar.nufus,
    0
  );
  esit(bas.n, statToplamN * C, 'toplam nüfus üretimi = statların toplamı');
});

// ---------- 5) KAPSAM DIŞI SIZINTI ----------
test('5) kapsam dışı sızıntı yok: Karadeniz oyununda Antalya hiçbir toplama girmiyor', () => {
  const beklenenNufus = karadeniz.senaryo.kapsamIller.reduce(
    (t, k) => t + ilUretimi(k).nufus * C,
    0
  );

  const g = tumGelirler(karadeniz);
  let toplamNufus = 0;
  for (const id of Object.keys(g)) toplamNufus += g[id].nufus;
  yakin(toplamNufus, beklenenNufus, 1e-6, 'Karadeniz toplam nüfus üretimi');

  const antalyaParca = ilinParcalari('07');
  dogru(parcaGeliri(antalyaParca[0]).nufus > 0, 'Antalya parçasının getirisi 0 (veri hatası)');
  for (const pid of antalyaParca)
    dogru(karadeniz.parcaSahipligi[pid] === undefined, pid + ' Karadeniz oyununda görünüyor');
  dogru(g['07'] === undefined, 'Antalya aktörü gelir tablosunda');

  const samsunKD = aktorGeliri(karadeniz, '55');
  const samsunTR = aktorGeliri(turkiye, '55');
  yakin(samsunKD.nufus, samsunTR.nufus, 1e-9, 'Samsun geliri senaryoya göre değişmemeli');
});

// ---------- 6) KESİR KORUNUMU ----------
test('6) kesir korunumu: çarpan kesirliyse birikim yuvarlanmadan toplanıyor', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  for (const pid of Object.keys(d.parcaSahipligi)) d.parcaSahipligi[pid] = '34';
  d.parcaSahipligi['16-1'] = '16'; // temel değeri 3 nüfus

  // Çarpan 1 iken gelir tam sayı: 10 turda 30
  let havuz = 0;
  for (let i = 0; i < 10; i++) havuz += aktorGeliri(d, '16').nufus;
  esit(havuz, 30, 'çarpan 1 ile 10 turluk birikim');

  // Çarpan 0.5 olursa gelir 1.5 olur — 10 turda 15 olmalı, 10 veya 20 değil.
  carpanIle(0.5, () => {
    yakin(aktorGeliri(d, '16').nufus, 1.5, 1e-9, 'kesirli çarpanla tur geliri');
    let h = 0;
    for (let i = 0; i < 10; i++) h += aktorGeliri(d, '16').nufus;
    yakin(h, 15, 1e-9, '10 turluk kesirli birikim');
    dogru(h !== 10 && h !== 20, 'kesirler yuvarlanarak kayboluyor');
  });

  // Çarpan geri dönmüş olmalı
  esit(DENGE.URETIM_CARPANI, C, 'çarpan eski değerine döndü');
});

// ---------- panel yardımcısı ----------
test('ilGeliri: bir ilin kaç parçası kimde + o ilden gelen gelir', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  const hepsi = ilGeliri(d, '16', '16');
  esit(hepsi.parca, 4, 'Bursa parça sayısı (sahibinde)');
  esit(hepsi.toplamParca, 4, 'Bursa toplam parça');
  esit(hepsi.nufus, ilUretimi('16').nufus * C, 'tam ilin nüfus getirisi');

  d.parcaSahipligi['16-1'] = '34'; // 3 nüfuslük parça İstanbul'a geçti
  const kalan = ilGeliri(d, '16', '16');
  esit(kalan.parca, 3, 'Bursa elinde kalan parça');
  esit(kalan.nufus, 4, 'kalan parçaların nüfus getirisi (7 − 3)');
  esit(ilGeliri(d, '16', '34').nufus, 3, 'İstanbul bu ilden ne alıyor');
});
