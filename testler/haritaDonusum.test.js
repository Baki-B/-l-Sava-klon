// HARİTA DÖNÜŞÜMÜ TESTLERİ (2026-07-30).
//
// NEDEN VAR: harita koordinatı ↔ ekran pikseli çevirisi üç ayrı yerde elle kopyalanmıştı
// (dokunma testi, rozet yerleşimi, rozet kaydırma denetimi). Biri değişip öteki değişmediğinde
// ortaya çıkan şey "rozetler haritayla aynı yerde durmuyor / titriyor" oluyor. Kopyalar
// `src/haritaDonusum.js`'te birleştirildi; bu dosya o birleşmenin doğru kaldığını kilitliyor.
//
// İleride yakınlaştırma/kaydırma mantığı değişirse burası patlamalı.

const { test, dogru, esit, yakin } = require('./yardimci');
const {
  haritaOlcusu,
  haritadanEkrana,
  ekrandanHaritaya,
  gorunenAlan,
  sabitEkranYeri,
  kapsayiciDonusumu,
  donusumuUygula,
  rozetleriYerlestir,
} = require('../src/haritaDonusum.js');

const META = require('../veri/parcalar.json').meta;
const W = META.genislik,
  H = META.yukseklik;

// Yatay telefon ve tablet — iki ayrı çizim alanı.
const ALANLAR = [
  [900, 412],
  [1280, 800],
];
// Gerçek yakınlaştırma aralığı (Harita.js pinch sınırları) ve makul kaydırmalar.
const ZOOMLAR = [0.9, 1, 1.35, 2.7, 4, 7];
const KAYMALAR = [0, 120, -260, 640];

test('DÖNÜŞÜM: harita → ekran → harita birebir geri geliyor', () => {
  let denenen = 0;
  for (const [lw, lh] of ALANLAR) {
    const o = haritaOlcusu(lw, lh, W, H);
    for (const z of ZOOMLAR)
      for (const tx of KAYMALAR)
        for (const ty of KAYMALAR)
          for (const x of [0, 137.5, 500, W])
            for (const y of [0, 88.25, 250, H]) {
              const e = haritadanEkrana(x, y, o, z, tx, ty);
              const g = ekrandanHaritaya(e.x, e.y, o, z, tx, ty);
              yakin(g.x, x, 1e-9, 'x geri gelmedi');
              yakin(g.y, y, 1e-9, 'y geri gelmedi');
              denenen++;
            }
  }
  dogru(denenen > 500, 'yeterince kombinasyon denenmeli, denenen ' + denenen);
});

test('DÖNÜŞÜM: yakınlaştırma 1 ve kayma 0 iken harita çizim alanına ORTALANIYOR', () => {
  const o = haritaOlcusu(900, 412, W, H);
  const solUst = haritadanEkrana(0, 0, o, 1, 0, 0);
  const sagAlt = haritadanEkrana(W, H, o, 1, 0, 0);
  // Harita çizim alanına sığmalı ve iki kenardaki boşluk eşit olmalı.
  yakin(solUst.x, 900 - sagAlt.x, 1e-9, 'yatay boşluklar eşit değil');
  yakin(solUst.y, 412 - sagAlt.y, 1e-9, 'dikey boşluklar eşit değil');
  dogru(solUst.x >= -1e-9 && sagAlt.x <= 900 + 1e-9, 'harita yatayda taşıyor');
  dogru(solUst.y >= -1e-9 && sagAlt.y <= 412 + 1e-9, 'harita dikeyde taşıyor');
});

test('DÖNÜŞÜM: kaydırma ekranda BİREBİR aynı miktarda oynatıyor', () => {
  // Rozetlerin kaydırmada haritaya çivili kalmasının dayanağı bu: kaydırma, yakınlaştırmadan
  // bağımsız olarak ekran pikselinde birebir yansır. Kapsayıcının tek ötelemeyle bütün
  // rozetleri doğru taşıyabilmesi buradan geliyor.
  const o = haritaOlcusu(900, 412, W, H);
  for (const z of ZOOMLAR) {
    const a = haritadanEkrana(300, 200, o, z, 0, 0);
    const b = haritadanEkrana(300, 200, o, z, 75, -40);
    yakin(b.x - a.x, 75, 1e-9, z + 'x: yatay kaydırma birebir değil');
    yakin(b.y - a.y, -40, 1e-9, z + 'x: dikey kaydırma birebir değil');
  }
});

test('GÖRÜNEN ALAN: ekran köşeleri alanın köşelerine denk geliyor', () => {
  const o = haritaOlcusu(900, 412, W, H);
  const alan = gorunenAlan(o, 2.7, 120, -60, 0);
  const solUst = haritadanEkrana(alan.x0, alan.y0, o, 2.7, 120, -60);
  const sagAlt = haritadanEkrana(alan.x1, alan.y1, o, 2.7, 120, -60);
  yakin(solUst.x, 0, 1e-7, 'sol kenar');
  yakin(solUst.y, 0, 1e-7, 'üst kenar');
  yakin(sagAlt.x, 900, 1e-7, 'sağ kenar');
  yakin(sagAlt.y, 412, 1e-7, 'alt kenar');
});

test('GÖRÜNEN ALAN: yakınlaştıkça küçülüyor', () => {
  const o = haritaOlcusu(900, 412, W, H);
  let onceki = Infinity;
  for (const z of ZOOMLAR) {
    const a = gorunenAlan(o, z, 0, 0, 0);
    dogru(a.genislik < onceki, z + 'x: görünen alan küçülmedi');
    onceki = a.genislik;
  }
});

// ---- ROZET YERLEŞİMİ ----
// Rozetlerin yeri KAYDIRMADAN BAĞIMSIZ hesaplanıyor; kaydırmayı kapsayıcının dönüşümü
// taşıyor. Bu dosyadaki testler o tasarımın dayandığı eşitliği kilitliyor.

const ROZETLER = [
  { anahtar: 'a', x: 100, y: 100, yazi: '3', renk: '#888888' },
  { anahtar: 'b', x: 500, y: 220, yazi: '7', renk: '#888888' },
  { anahtar: 'c', x: 950, y: 430, yazi: '1', renk: '#888888' },
];

test('SABİT YERLEŞİM: rozetin yeri KAYDIRMAYA BAĞLI DEĞİL', () => {
  // Tasarımın kalbi. Yer kaydırmaya bağlı olsaydı her hareketin sonunda bütün rozetler
  // yeniden hesaplanır ve yeniden çizilirdi (Baki: "hepsi yeniden oluşuyor").
  const olcu = haritaOlcusu(900, 412, W, H);
  for (const z0 of ZOOMLAR) {
    const temel = rozetleriYerlestir(ROZETLER, olcu, z0);
    // Kaydırma girdiye HİÇ girmiyor; farklı kaydırmalarda aynı sonucu vermeli.
    const tekrar = rozetleriYerlestir(ROZETLER, olcu, z0);
    esit(JSON.stringify(tekrar), JSON.stringify(temel), z0 + 'x: yer kararsız');
    for (const r of temel) {
      const beklenen = sabitEkranYeri(r.x, r.y, olcu, z0);
      yakin(r.ekranX, beklenen.x, 1e-9, r.anahtar + ' ekranX');
      yakin(r.ekranY, beklenen.y, 1e-9, r.anahtar + ' ekranY');
    }
  }
});

test('SABİT YERLEŞİM: sabit yer + kapsayıcı dönüşümü = DOĞRU ekran yeri', () => {
  // Bütün tasarımın dayandığı eşitlik: rozet kaydırmasız yerine konur, kapsayıcı ölçek ve
  // ötelemeyi taşır, sonuç haritanın kendi dönüşümüyle BİREBİR aynı çıkar. Bu tutmazsa
  // rozetler haritayla aynı yerde durmaz.
  const olcu = haritaOlcusu(900, 412, W, H);
  let denenen = 0;
  for (const z0 of ZOOMLAR)
    for (const z of ZOOMLAR)
      for (const tx of KAYMALAR)
        for (const ty of KAYMALAR)
          for (const r of ROZETLER) {
            const sabit = sabitEkranYeri(r.x, r.y, olcu, z0);
            const d = kapsayiciDonusumu(z0, z, tx, ty);
            const cikan = donusumuUygula(sabit, olcu, d);
            const dogru_ = haritadanEkrana(r.x, r.y, olcu, z, tx, ty);
            yakin(cikan.x, dogru_.x, 1e-7, 'x ayrıştı (z0=' + z0 + ' z=' + z + ')');
            yakin(cikan.y, dogru_.y, 1e-7, 'y ayrıştı (z0=' + z0 + ' z=' + z + ')');
            denenen++;
          }
  dogru(denenen > 1000, 'yeterince kombinasyon denenmeli, denenen ' + denenen);
});

test('SABİT YERLEŞİM: yakınlaştırma değişmediyse kapsayıcının ölçeği TAM 1', () => {
  // Kaydırma sırasında ölçek 1 olmalı: rozet tam boyutunda ve tam yerinde durur, sönmez.
  for (const z0 of ZOOMLAR) {
    const d = kapsayiciDonusumu(z0, z0, 250, -90);
    esit(d.olcek, 1, z0 + 'x: ölçek 1 değil');
    esit(d.tx, 250, 'öteleme kaydırmayı birebir taşımalı');
    esit(d.ty, -90, 'öteleme kaydırmayı birebir taşımalı');
  }
});

test('SABİT YERLEŞİM: dokunma testiyle aynı yeri gösteriyor (ayrışma yok)', () => {
  // Rozetin göründüğü ekran noktası haritaya geri çevrilince rozetin harita yerini vermeli;
  // ayrışırlarsa oyuncu rozete basar, altındaki başka parça seçilir.
  const olcu = haritaOlcusu(900, 412, W, H);
  const z0 = 4,
    tx = -80,
    ty = 25;
  for (const r of rozetleriYerlestir(ROZETLER, olcu, z0)) {
    const ekranda = donusumuUygula(
      { x: r.ekranX, y: r.ekranY },
      olcu,
      kapsayiciDonusumu(z0, z0, tx, ty)
    );
    const geri = ekrandanHaritaya(ekranda.x, ekranda.y, olcu, z0, tx, ty);
    yakin(geri.x, r.x, 1e-7, r.anahtar + ' harita x');
    yakin(geri.y, r.y, 1e-7, r.anahtar + ' harita y');
  }
});

test('SABİT YERLEŞİM: katmandaki HER rozet kuruluyor (ayıklama yok)', () => {
  // Ayıklama bilerek kaldırıldı: kaydırırken rozet kurmak, kaçınmak istediğimiz
  // "hareket ederken iş yapma" durumuydu.
  const olcu = haritaOlcusu(900, 412, W, H);
  for (const z0 of ZOOMLAR)
    esit(rozetleriYerlestir(ROZETLER, olcu, z0).length, ROZETLER.length, z0 + 'x: rozet elendi');
});

test('SABİT YERLEŞİM: eksik girdide çökmüyor', () => {
  const olcu = haritaOlcusu(900, 412, W, H);
  esit(rozetleriYerlestir(null, olcu, 1).length, 0, 'liste yok');
  esit(rozetleriYerlestir(ROZETLER, null, 1).length, 0, 'ölçü yok');
  esit(rozetleriYerlestir([], olcu, 1).length, 0, 'liste boş');
});
