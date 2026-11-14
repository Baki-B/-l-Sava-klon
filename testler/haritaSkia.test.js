// SKIA HARİTASI TESTLERİ (Görev 20 / Adım 2–3b).
//
// Yeni haritanın her karesini `haritaCizim.js sahneyiCiz` çiziyor ve o fonksiyon ARAYÜZ İŞ
// PARÇACIĞINDA çalışıyor: orada doğan bir hata React'in hata sınırına (`HaritaSecici`)
// ulaşmaz. Bu yüzden karenin matematiği ve çizim çekirdeği burada, telefona gitmeden
// kilitleniyor. Görsel denetim ayrıca `scripts/harita-skia-onizleme.js`'te.

const { test, dogru, esit, yakin } = require('./yardimci');
const {
  haritaOlcusu,
  haritadanEkrana,
  kameraDonusumu,
  dokunmaGeometrisi,
  parcaBul,
} = require('../src/haritaDonusum.js');
const { seviyeSec, dolguYolu, hatTurleri, hatGruplari } = require('../src/haritaSeviye.js');
const C = require('../src/haritaCizim.js');
const { KAPSAM_DISI_SOLUKLUK, HARITA_SEVIYE_HATASI, HARITA_SUS } = require('../src/tema.js');
const { DENGE } = require('../src/denge.js');
const { parcaRozetListesi, ilRozetListesi, kadroListesi } = require('../src/rozetListesi.js');
const { oyunKur, AKTOR_RENKLERI } = require('../src/oyun/oyunDurumu.js');
const { birimSayisi } = require('../src/oyun/ordu.js');

const VERI = require('../veri/harita-seviyeleri.json');
const PARCA_VERISI = require('../veri/parcalar.json');
const PARCALAR = PARCA_VERISI.parcalar;
const IL_GEOM = require('../veri/harita.json').iller;
const W = PARCA_VERISI.meta.genislik,
  H = PARCA_VERISI.meta.yukseklik;
const PID = Object.keys(PARCALAR);

const AYAR = {
  CAP: DENGE.ROZET.CAP,
  ORTA: DENGE.ROZET.ORTA_SINIR,
  YAKIN: DENGE.ROZET.YAKIN_SINIR,
  HISTEREZIS: DENGE.ROZET.KATMAN_HISTEREZIS,
};

// ---- KAMERA ----

test('KAMERA: tuval matrisi haritadanEkrana ile birebir aynı noktayı veriyor', () => {
  // Dokunma testi haritadanEkrana/ekrandanHaritaya yolundan gidiyor, çizim matristen.
  // İkisi ayrışırsa parmak yanlış parçayı seçer (CLAUDE.md §6'nın 80 piksellik hatası).
  for (const [lw, lh] of [
    [915, 412],
    [1280, 800],
  ]) {
    const o = haritaOlcusu(lw, lh, W, H);
    for (const z of [0.9, 1.3, 2.7, 4.4, 7]) {
      for (const [tx, ty] of [
        [0, 0],
        [-230, 45],
        [310, -120],
      ]) {
        const d = kameraDonusumu(o, z, tx, ty);
        for (const [x, y] of [
          [0, 0],
          [356.8, 163.3],
          [1000, 452],
        ]) {
          const e = haritadanEkrana(x, y, o, z, tx, ty);
          yakin(x * d.k + d.bx, e.x, 1e-9, 'x');
          yakin(y * d.k + d.by, e.y, 1e-9, 'y');
        }
      }
    }
  }
});

// ---- DOKUNMA ----

test('DOKUNMA: 181 parçanın etiket noktası kendi parçasını seçiyor', () => {
  const g = dokunmaGeometrisi(PARCALAR);
  for (const pid of PID)
    esit(parcaBul(g, PARCALAR[pid].etiket.x, PARCALAR[pid].etiket.y), pid, pid);
});

test('DOKUNMA: denize dokunmak hiçbir parçayı seçmiyor', () => {
  const g = dokunmaGeometrisi(PARCALAR);
  esit(parcaBul(g, 2, 2), null, 'sol üst köşe (Karadeniz dışı)');
  esit(parcaBul(g, 500, 5), null, 'Karadeniz');
});

// ---- KADEMELİ GEOMETRİ ----

test('SEVİYE: seçilen seviye yarım piksel kuralını tutuyor ve yakınlaştıkça inceliyor', () => {
  const tol = VERI.meta.toleranslar;
  for (const f of [0.91, 1.28]) {
    let onceki = -1;
    for (let z = 0.9; z <= 7.001; z += 0.1) {
      const sv = seviyeSec(f, z, tol, HARITA_SEVIYE_HATASI);
      dogru(sv >= onceki, 'yakınlaşınca daha KABA seviyeye dönmemeli (z=' + z.toFixed(1) + ')');
      if (sv < tol.length - 1)
        dogru(f * z * tol[sv] <= HARITA_SEVIYE_HATASI + 1e-12, 'sapma yarım pikseli aşıyor');
      onceki = sv;
    }
  }
});

test('SEVİYE VERİSİ: her seviye 181 parçayı dikebiliyor, halka sayıları tutuyor', () => {
  esit(Object.keys(VERI.halkalar).length, 181, 'parça sayısı');
  for (let i = 0; i < VERI.seviyeler.length; i++) {
    esit(VERI.seviyeler[i].hatlar.length, VERI.hatSahipleri.length, 'seviye ' + i + ' hat sayısı');
    for (const pid of PID) {
      const yol = dolguYolu(VERI, i, pid);
      dogru(/^M[\d.,L-]+Z/.test(yol), pid + ' seviye ' + i + ' yolu bozuk');
      esit((yol.match(/M/g) || []).length, VERI.halkalar[pid].length, pid + ' halka sayısı');
    }
  }
});

test('SEVİYE VERİSİ: kabadan inceye nokta sayısı artıyor, en kaba tam verinin çok altında', () => {
  const n = VERI.seviyeler.map((s) => s.nokta);
  for (let i = 1; i < n.length; i++) dogru(n[i] > n[i - 1], 'seviye ' + i + ' öncekinden kaba');
  dogru(n[0] < VERI.meta.tamNokta / 5, "en kaba seviye tam verinin 1/5'inden az olmalı");
});

test('HATLAR: kıyı ve il sınırı ayrılıyor; kapsam dışı hatlar soluk', () => {
  const parcaIl = {};
  for (const pid of PID) parcaIl[pid] = PARCALAR[pid].kod;
  const hepsi = hatTurleri(VERI, parcaIl, null);
  dogru(
    hepsi.every((t) => !t.soluk),
    'kapsam yokken soluk hat olmamalı'
  );
  const kiyi = VERI.hatSahipleri.filter((h) => !h[1]).length;
  dogru(kiyi > 0, 'kıyı hattı yok');
  dogru(hepsi.filter((t) => t.ilSiniri).length > kiyi, 'il sınırı kıyıdan fazla olmalı');

  // Yalnızca Karadeniz kapsamda: iki yanı da kapsam içindeki hat asla soluk değil.
  const kapsam = new Set(PID.filter((p) => PARCALAR[p].bolge === 'Karadeniz'));
  const turler = hatTurleri(VERI, parcaIl, kapsam);
  VERI.hatSahipleri.forEach(([a, b], i) => {
    if (kapsam.has(a) && (!b || kapsam.has(b))) dogru(!turler[i].soluk, 'kapsam içi hat soluk');
    if (!kapsam.has(a) && (!b || !kapsam.has(b)))
      dogru(turler[i].soluk, 'kapsam dışı hat soluk değil');
  });
  const gruplar = hatGruplari(VERI, 0, turler);
  dogru(gruplar.length < VERI.hatSahipleri.length / 2, 'gruplama çizim çağrısını azaltmalı');
});

// ---- ROZET ----

test('ROZET BOYU: eşik yakınlıkta CAP, sonra harita ile AYNI oranda', () => {
  esit(C.rozetBoyutu(AYAR.YAKIN, AYAR.YAKIN, AYAR), AYAR.CAP, 'parça rozeti 2.70×');
  esit(C.rozetBoyutu(AYAR.ORTA, AYAR.ORTA, AYAR), AYAR.CAP, 'il rozeti 1.35×');
  yakin(
    C.rozetBoyutu(7, AYAR.YAKIN, AYAR) / C.rozetBoyutu(3.5, AYAR.YAKIN, AYAR),
    2,
    1e-12,
    'oran'
  );
});

test('ROZET KATMANI: eşikte parçaya geçiyor, geri dönüş histerezisle aşağıda', () => {
  esit(C.rozetKatmaniSec(AYAR.YAKIN, 0, AYAR), 1, 'eşikte parça');
  esit(C.rozetKatmaniSec(AYAR.YAKIN - 0.05, 0, AYAR), 0, 'eşiğin altında il kalır');
  esit(C.rozetKatmaniSec(AYAR.YAKIN - 0.05, 1, AYAR), 1, 'histerezis: parça kalır');
  esit(C.rozetKatmaniSec(AYAR.YAKIN - AYAR.HISTEREZIS - 0.01, 1, AYAR), 0, 'altına inince il');
});

test('ROZET LİSTESİ: boş ordu yok, il sayısı parçaların toplamı, komutan yalnız bir yerde', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 3, zorluk: 'orta' });
  const komutanParca = PID.find((p) => d.parcaSahipligi[p] === d.oyuncuAktorId);
  const parca = parcaRozetListesi(d.ordular, komutanParca);
  const il = ilRozetListesi(d.ordular, PARCALAR[komutanParca].kod, IL_GEOM);
  dogru(parca.length > 0 && il.length > 0, 'liste boş');
  for (const r of parca) dogru(r.yazi !== '0', 'boş ordu rozeti');
  esit(parca.filter((r) => r.komutan).length, 1, 'parça rozetinde komutan');
  esit(il.filter((r) => r.komutan).length, 1, 'il rozetinde komutan');
  // İl toplamı (99'u aşmayanlarda yazı birebir sayı).
  const toplam = {};
  for (const pid of Object.keys(d.ordular))
    toplam[PARCALAR[pid].kod] =
      (toplam[PARCALAR[pid].kod] || 0) + birimSayisi(d.ordular[pid].birimler);
  for (const r of il) {
    const kod = r.anahtar.slice(1);
    if (toplam[kod] <= 99) esit(r.yazi, String(toplam[kod]), 'il ' + kod);
  }
});

// ---- DOLGU ----

test('DOLGU: il haritasında sahibin rengi; kapsam dışı soluk', () => {
  const d = oyunKur({ senaryo: 'turkiye', tohum: 3, zorluk: 'orta' });
  const kapsam = new Set(PID.slice(0, 20));
  const dol = C.dolgulariHesapla(PARCALAR, 'il', d.parcaSahipligi, AKTOR_RENKLERI, null, kapsam);
  for (const pid of PID.slice(0, 5))
    esit(dol[pid].renk, AKTOR_RENKLERI[d.parcaSahipligi[pid]], pid);
  esit(dol[PID[0]].saydam, 1, 'kapsam içi');
  esit(dol[PID[30]].saydam, KAPSAM_DISI_SOLUKLUK, 'kapsam dışı');
});

// ---- ÇİZİM ÇEKİRDEĞİ (sahte Skia ile) ----
//
// Gerçek Skia yerine her çağrıyı kaydeden sahte bir Skia. Amaç: hazırlık fonksiyonları
// doğru şeyi kaydediyor mu, kare fonksiyonu her yakınlıkta HATASIZ ve AZ çağrıyla çalışıyor
// mu. Görüntünün kendisi `scripts/harita-skia-onizleme.js` ile gözle denetleniyor, hızı
// `onizleme/harita-hiz.html` ile ölçülüyor.

function sahteTuval() {
  const t = {
    derinlik: 0,
    cagri: 0,
    resim: 0,
    kose: 0,
    atlas: [],
    yol: 0,
    cizgi: 0,
    katman: 0,
    zemin: 0,
  };
  const say =
    (fn) =>
    (...a) => {
      t.cagri++;
      return fn(...a);
    };
  t.save = say(() => t.derinlik++);
  t.saveLayer = say(() => {
    t.derinlik++;
    t.katman++;
  });
  t.restore = say(() => {
    t.derinlik--;
    if (t.derinlik < 0) throw new Error('restore fazla');
  });
  t.translate = say(() => {});
  t.scale = say(() => {});
  t.drawPicture = say(() => t.resim++);
  t.drawPath = say(() => t.yol++);
  t.drawLine = say(() => t.cizgi++);
  t.drawText = say(() => {});
  t.drawRRect = say(() => t.zemin++);
  t.drawVertices = say(() => t.kose++);
  t.drawImageRectOptions = say(() => t.resim++);
  t.drawCircle = say(() => t.yol++);
  t.drawAtlas = say((img, kutular, donusumler, boya, kip, renkler) => {
    if (kutular.length !== donusumler.length || kutular.length !== renkler.length)
      throw new Error('drawAtlas dizileri eşit uzunlukta değil');
    t.atlas.push({ kutular, donusumler, renkler, kip });
  });
  return t;
}
function sahteSkia() {
  const boya = () => ({
    setAntiAlias() {},
    setStyle() {},
    setStrokeJoin() {},
    setStrokeCap() {},
    setColor() {},
    setAlphaf() {},
    setStrokeWidth() {},
    setShader() {},
    setMaskFilter() {},
  });
  const S = {
    tuvaller: [],
    koseler: [],
    Paint: boya,
    Color: () => Float32Array.of(0.1, 0.2, 0.3, 1),
    XYWHRect: (x, y, width, height) => ({ x, y, width, height }),
    RRectXY: (rect, rx, ry) => ({ rect, rx, ry }),
    PictureRecorder: () => {
      const t = sahteTuval();
      S.tuvaller.push(t);
      return { beginRecording: () => t, finishRecordingAsPicture: () => ({ tuval: t }) };
    },
    Path: {
      MakeFromSVGString: (s) => ({ s, setFillType() {} }),
      Make: () => ({ addArc() {}, setFillType() {} }),
    },
    MakeVertices: (kip, pos, doku) => {
      const v = { kip, pos, doku };
      S.koseler.push(v);
      return v;
    },
    RuntimeEffect: { Make: () => ({ makeShader: (u) => ({ u }) }) },
    MaskFilter: { MakeBlur: (stil, sigma) => ({ stil, sigma }) },
    Surface: {
      Make: (w, h) => {
        const t = sahteTuval();
        return { getCanvas: () => t, makeImageSnapshot: () => ({ w, h }) };
      },
    },
  };
  return S;
}
const sahteFont = {
  getMetrics: () => ({ ascent: -12, descent: 3 }),
  getTextWidth: (s) => 8 * s.length,
};
const META = PARCA_VERISI.meta;
const O = haritaOlcusu(915, 412, W, H);
const EKRAN = { f: O.f, yogunluk: 2.625 };
const BANTLAR = C.bantlariKur(O.f, VERI.meta.toleranslar, HARITA_SEVIYE_HATASI, 0.9, 7);

test('BANTLAR: 0.9×–7× boşluksuz, her bantta dolgu ve çizgi AYNI seviyeden', () => {
  yakin(BANTLAR[0].alt, 0.9, 1e-9, 'ilk bant');
  yakin(BANTLAR[BANTLAR.length - 1].ust, 7, 1e-9, 'son bant');
  for (let i = 0; i < BANTLAR.length; i++) {
    const b = BANTLAR[i];
    if (i > 0) esit(b.alt, BANTLAR[i - 1].ust, 'bantlar arasında boşluk');
    dogru(b.ust / b.alt <= 1.15 * 1.031 + 1e-9, 'bant fazla geniş: ' + b.alt + '–' + b.ust);
    // Bandın içindeki her yakınlıkta seviye aynı — seviye eşiği bandın ortasına düşmüyor.
    for (const t of [0.01, 0.5, 0.99]) {
      const z = b.alt + (b.ust - b.alt) * t;
      esit(seviyeSec(O.f, z, VERI.meta.toleranslar, HARITA_SEVIYE_HATASI), b.seviye, 'z=' + z);
    }
  }
});

test('BANTLAR: kare doğru bandı seçiyor, uçlarda taşmıyor', () => {
  const ust = BANTLAR.map((b) => b.ust);
  for (let z = 0.9; z <= 7.0001; z += 0.07) {
    const i = C.bantSec(z, ust);
    dogru(z >= BANTLAR[i].alt - 1e-9 && (z < BANTLAR[i].ust || i === BANTLAR.length - 1), 'z=' + z);
  }
  esit(C.bantSec(0.5, ust), 0, 'aralık altı');
  esit(C.bantSec(9, ust), BANTLAR.length - 1, 'aralık üstü');
});

test('ŞERİT GEOMETRİSİ: düz hatta kayma dik ve birim; açık/kapalı doğru okunuyor', () => {
  const duz = C.hatGeometrisi('M0,0L10,0L20,0');
  esit(duz.kapali, false, 'açık');
  esit(duz.m, 3, 'nokta sayısı');
  for (let i = 0; i < 3; i++) {
    yakin(duz.kay[4 * i], 0, 1e-6, 'x kayması');
    yakin(Math.abs(duz.kay[4 * i + 1]), 1, 1e-6, 'y kayması birim');
    esit(duz.keskin[i], 0, 'düz hatta keskin köşe yok');
  }
  const kare = C.hatGeometrisi('M0,0L10,0L10,10L0,10Z');
  esit(kare.kapali, true, 'Z kapalı');
  esit(kare.m, 4, 'kare 4 nokta');
  // 90° dönüş keskin sayılıyor (sivri birleşim yerine kesik + düğüm).
  for (let i = 0; i < 4; i++) esit(kare.keskin[i], 1, 'kare köşesi keskin');
  const tekrarli = C.hatGeometrisi('M0,0L5,0L5,0L10,1');
  esit(tekrarli.m, 3, 'üst üste nokta atlanıyor');
  const donen = C.hatGeometrisi('M0,0L10,0L20,0L0,0');
  esit(donen.kapali, true, 'baştaki noktaya dönen hat kapalı sayılıyor');
});

test('ŞERİT: her köşe sonlu, doku koordinatı köşeyle eşit sayıda, genişlik D içinde', () => {
  const S = sahteSkia();
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  const seritler = C.hatSeritleriKur(S, kaynak, null, BANTLAR, EKRAN);
  esit(seritler.length, VERI.seviyeler.length, 'seviye başına');
  let grup = 0;
  for (const liste of seritler) {
    if (!liste) continue;
    for (const g of liste) {
      grup++;
      const { pos, doku } = g.koseler;
      esit(pos.length, doku.length, 'köşe ve doku sayısı');
      for (const p of pos) dogru(Number.isFinite(p.x) && Number.isFinite(p.y), 'sonsuz köşe');
    }
  }
  dogru(grup > VERI.seviyeler.length * 81, 'il başına en az bir grup olmalı');
  // Seviyenin D'si, o seviyenin en kalın il çizgisinin yarısından büyük.
  const d0 = Math.abs(seritler[BANTLAR[0].seviye][0].koseler.doku[0].x);
  dogru(d0 > (1.4 * Math.pow(0.9, -0.5)) / 2, 'şerit en kalın çizgiyi almıyor: D=' + d0);
});

test('ŞERİT: kapsam dışındaki hatlar ayrı (soluk) grupta', () => {
  const S = sahteSkia();
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  const kapsam = new Set(PID.filter((p) => PARCALAR[p].bolge === 'Karadeniz'));
  const seritler = C.hatSeritleriKur(S, kaynak, kapsam, BANTLAR, EKRAN);
  const liste = seritler[0] || seritler.find((x) => x);
  dogru(
    liste.some((g) => g.soluk),
    'soluk grup yok'
  );
  dogru(
    liste.some((g) => !g.soluk),
    'kapsam içi grup yok'
  );
});

test('ÇİZGİ RESİMLERİ: bant başına bir resim; il sınırı kapalıyken il hattı ince çizgiyle', () => {
  const S = sahteSkia();
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  const seritler = C.hatSeritleriKur(S, kaynak, null, BANTLAR, EKRAN);
  const renk = C.sahneRenkleri(S);
  const acik = C.hatResimleri(S, seritler, BANTLAR, true, renk, META, EKRAN);
  const kapali = C.hatResimleri(S, seritler, BANTLAR, false, renk, META, EKRAN);
  esit(acik.length, BANTLAR.length, 'bant sayısı');
  for (let i = 0; i < BANTLAR.length; i++) {
    const n = (seritler[BANTLAR[i].seviye] || []).length;
    esit(acik[i].tuval.kose, n, 'açıkken her grup bir kez');
    esit(kapali[i].tuval.kose, n, 'kapalıyken de her grup bir kez');
  }
});

test('VURGU: hiçbir şey yoksa resim yok; varsa bant başına bir resim, şeritle', () => {
  const S = sahteSkia();
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  esit(
    C.vurguResimleri(
      S,
      kaynak,
      { secili: null, komsular: null, hedefler: null, oklar: [] },
      BANTLAR,
      META,
      EKRAN
    ),
    null,
    'boş vurgu'
  );
  const v = C.vurguResimleri(
    S,
    kaynak,
    { secili: '16-1', komsular: new Set(['16-2', '16-3']), hedefler: null, oklar: [] },
    BANTLAR,
    META,
    EKRAN
  );
  esit(v.length, BANTLAR.length, 'bant sayısı');
  // İki grup (komşu + seçili) her bantta birer şerit; komşu kipinde dolgu yok.
  for (const r of v) {
    esit(r.tuval.kose, 2, 'iki şerit');
    esit(r.tuval.yol, 0, 'komşu kipinde dolgu yok');
  }
  const h = C.vurguResimleri(
    S,
    kaynak,
    { secili: '16-1', komsular: null, hedefler: new Set(['16-2']), kipSaldiri: true, oklar: [] },
    BANTLAR,
    META,
    EKRAN
  );
  esit(h[0].tuval.yol, 1, 'hedefin dolgusu');
});

test('VURGU (doğrudan hamle): iki renk hedef + ikinci dokunuşu bekleyen hedef', () => {
  // Görev 20 / Adım 5: kendi toprağın pirinç, düşman kırmızı — AYNI ANDA. Seçili hedef
  // kendi renginde (tahmin) ve kalın çerçeveyle; normal hedef olarak ikinci kez çizilmez.
  const S = sahteSkia();
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  const v = C.vurguResimleri(
    S,
    kaynak,
    {
      secili: '16-1',
      komsular: null,
      hedefler: new Set(['16-2', '16-3']),
      hedefSaldiri: new Set(['16-3']),
      hedefSecili: null,
      oklar: [],
    },
    BANTLAR,
    META,
    EKRAN
  );
  // Gruplar: pirinç hedef (16-2) + kırmızı hedef (16-3) + kaynak = üç şerit, iki dolgu.
  esit(v[0].tuval.kose, 3, 'iki hedef rengi + kaynak');
  esit(v[0].tuval.yol, 2, 'iki hedef dolgusu');

  const s = C.vurguResimleri(
    S,
    kaynak,
    {
      secili: '16-1',
      komsular: null,
      hedefler: new Set(['16-2', '16-3']),
      hedefSaldiri: new Set(['16-3']),
      hedefSecili: { pid: '16-3', renk: '#3f7f4f' },
      oklar: [],
    },
    BANTLAR,
    META,
    EKRAN
  );
  // Kırmızı grup boşaldı (tek üyesi seçili), yerine seçili hedefin grubu: yine üç şerit,
  // yine iki dolgu — 16-3 iki kez boyanmıyor.
  esit(s[0].tuval.kose, 3, 'pirinç + seçili hedef + kaynak');
  esit(s[0].tuval.yol, 2, 'seçili hedef tek dolgu');
});

test('ROZET SAYFASI: kalkan parçaları ve 11 rakam, hücreler üst üste binmiyor', () => {
  const S = sahteSkia();
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  const hucreler = [atlas.kalkan, atlas.kontur, atlas.komutan, atlas.parlaklik, atlas.yipranma];
  for (const ch of '0123456789+') {
    dogru(atlas.rakam[ch], ch + ' rakamı yok');
    hucreler.push(atlas.rakam[ch].hucre);
  }
  for (let i = 0; i < hucreler.length; i++)
    for (let j = i + 1; j < hucreler.length; j++) {
      const a = hucreler[i],
        b = hucreler[j];
      const ayri =
        a.x + a.width <= b.x + 1e-9 ||
        b.x + b.width <= a.x + 1e-9 ||
        a.y + a.height <= b.y + 1e-9 ||
        b.y + b.height <= a.y + 1e-9;
      dogru(ayri, 'hücre ' + i + ' ile ' + j + ' üst üste');
    }
  // Yazı tipi yoksa rakamsız sayfa (hata yok).
  const yazisiz = C.rozetAtlasiKur(S, null, C.sekilleriKur(S));
  esit(Object.keys(yazisiz.rakam).length, 0, 'yazı tipi yokken rakam yok');
});

const ROZET = (x, y, ek) => ({
  x,
  y,
  dx: 0,
  dy: 0,
  renk: '#445566',
  yazi: '7',
  yipranmis: false,
  komutan: false,
  ...ek,
});

test('ROZET RESMİ: bir katman TEK çağrı; kalkan kutunun yerinde, boy haritayla', () => {
  const S = sahteSkia();
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, O.f, AYAR);
  const liste = [ROZET(500, 226), ROZET(300, 100, { yazi: '99+', yipranmis: true, komutan: true })];
  const r = C.rozetResmi(S, liste, boy, atlas, C.sahneRenkleri(S), AYAR, META);
  const t = r.tuval;
  esit(t.atlas.length, 1, 'tek drawAtlas');
  // İlk rozet: gölge + kalkan + kontur + parlaklık + 1 rakam = 5 parça;
  // ikinci: + yıpranma + 3 rakam = 8 parça.
  esit(t.atlas[0].kutular.length, 13, 'parça sayısı');
  esit(t.atlas[0].kip, 13, 'renklendirme: çarp (Modulate)');
  // Kalkan (ikinci parça): hücrenin sol üst köşesi kutunun (-2, -2) noktası.
  const olcek = boy / 26;
  const d = t.atlas[0].donusumler[1];
  yakin(d.tx, 500 - 13 * olcek - 2 * olcek, 1e-9, 'kalkan x');
  yakin(d.ty, 226 - 13 * olcek - 2 * olcek, 1e-9, 'kalkan y');
  yakin(d.scos, olcek / atlas.olcek, 1e-12, 'ölçek');
  // Komutanın konturu kendi hücresinden.
  esit(t.atlas[0].kutular[7], atlas.komutan, 'komutan halkası');
  esit(t.cizgi, 0, 'kaydırılmamış rozette bağlantı çizgisi yok');
  const kayik = C.rozetResmi(
    S,
    [ROZET(500, 226, { dx: -18, dy: -16 })],
    boy,
    atlas,
    C.sahneRenkleri(S),
    AYAR,
    META
  );
  esit(kayik.tuval.cizgi, 1, 'kaydırılmış rozete bağlantı çizgisi');
  esit(C.rozetResmi(S, [], boy, atlas, C.sahneRenkleri(S), AYAR, META), null, 'boş liste');
});

test('ROZET BOYU: harita biriminde sabit boy, ekranda tam rozetBoyutu', () => {
  for (const esik of [AYAR.ORTA, AYAR.YAKIN])
    for (const z of [0.9, 2.7, 7]) {
      const dunya = C.rozetDunyaBoyu(esik, O.f, AYAR);
      yakin(dunya * O.f * z, C.rozetBoyutu(z, esik, AYAR), 1e-9, 'z=' + z);
    }
});

function sahteSahne(katmanlar) {
  const r = (ad) => ({ ad });
  return {
    bantUst: BANTLAR.map((b) => b.ust),
    bantSeviye: BANTLAR.map((b) => b.seviye),
    dolgular: VERI.seviyeler.map((_, i) => r('dolgu' + i)),
    hatlar: BANTLAR.map((_, i) => r('hat' + i)),
    vurgu: BANTLAR.map((_, i) => r('vurgu' + i)),
    // Süsler (Görev 20): alt her bantta, üst yalnızca eşiğin üstündeki bantlarda.
    susAlt: BANTLAR.map((_, i) => r('susAlt' + i)),
    susUst: BANTLAR.map((b, i) => (b.z >= HARITA_SUS.araziEsigi ? r('susUst' + i) : null)),
    // Görev 21: nehir ve cephe her bantta.
    nehir: BANTLAR.map((_, i) => r('nehir' + i)),
    cephe: BANTLAR.map((_, i) => r('cephe' + i)),
    rozetler: katmanlar,
    katmanBoya: { setAlphaf() {} },
    atlasBoya: {},
  };
}
const SAHTE_HALKA = { resim: {}, kutular: [{}], donusumler: [{}], renk: [1, 1, 1] };

// ÇAĞRI BÜTÇESİ 16 → 18 (Görev 20, süsler) → 26 (Görev 21): nehir, cephe, iki
// halka ve birlik figürleri. 26 EN KÖTÜ hâl: üç katman geçişinin üçü birden yarıdayken (her
// geçiş kaydet + resim + geri yükle). Durağan karede ≤17. Sayı hâlâ SABİT — dağ, rozet ya da
// parça sayısıyla büyümüyor (aşağıdaki test).
test('KARE: her yakınlıkta hatasız, kaydet/geri yükle dengeli, en çok 26 çağrı', () => {
  const s = sahteSahne({
    il: { ad: 'il' },
    parca: { ad: 'parca' },
    serit: { ad: 'serit' },
    figur: { ad: 'figur' },
    halkaIl: SAHTE_HALKA,
    halkaParca: SAHTE_HALKA,
  });
  let durgun = 0;
  for (let z = 0.9; z <= 7.001; z += 0.35) {
    const d = kameraDonusumu(O, z, 0, 0);
    for (const parcaSaydam of [0, 0.5, 1]) {
      for (const seritSaydam of [0, 0.5, 1]) {
        for (const figurSaydam of [0, 0.5, 1]) {
          const t = sahteTuval();
          C.sahneyiCiz(t, s, {
            k: d.k,
            bx: d.bx,
            by: d.by,
            z,
            parcaSaydam,
            seritSaydam,
            figurSaydam,
            nefes: 0.5,
          });
          esit(t.derinlik, 0, 'kaydet/geri yükle dengesiz (z=' + z.toFixed(2) + ')');
          dogru(t.cagri <= 26, 'karede ' + t.cagri + ' çağrı');
          if (parcaSaydam !== 0.5 && seritSaydam !== 0.5 && figurSaydam !== 0.5)
            durgun = Math.max(durgun, t.cagri);
          // Ara katman yalnızca geçişte (şerit figürle çarpılıyor: figür tam açıkken şerit yok).
          const seritGecis = seritSaydam * (1 - figurSaydam);
          const bekle =
            (parcaSaydam === 0.5 ? 2 : 0) +
            (seritGecis > 0.01 && seritGecis < 0.99 ? 1 : 0) +
            (figurSaydam === 0.5 ? 1 : 0);
          esit(t.katman, bekle, 'ara katman');
        }
      }
    }
  }
  dogru(durgun <= 17, 'durağan karede ' + durgun + ' çağrı');
});

test('KADRO LİSTESİ: piyade · topçu · zırhlı sırası, boş tür yok, 99 üstü "99+"', () => {
  const k = kadroListesi({ zirhli: 2, piyade: 5, topcu: 0 });
  esit(k.map((x) => x.tur).join(','), 'piyade,zirhli', 'sıra ve boş tür');
  esit(k[0].yazi, '5', 'sayı');
  esit(kadroListesi({ piyade: 150 })[0].yazi, '99+', 'büyük sayı');
  esit(kadroListesi(null).length, 0, 'ordusuz');
  const d = oyunKur({ senaryo: 'turkiye', tohum: 3, zorluk: 'orta' });
  for (const r of parcaRozetListesi(d.ordular, null)) dogru(r.kadro.length > 0, r.anahtar);
});

test('KADRO ŞERİDİ: eşikte açılıyor, histerezisle kapanıyor', () => {
  const A = { ...AYAR, SERIT: DENGE.ROZET.SERIT_ESIGI };
  esit(C.seritKatmaniSec(A.SERIT, 0, A), 1, 'eşikte açık');
  esit(C.seritKatmaniSec(A.SERIT - 0.05, 0, A), 0, 'altında kapalı');
  esit(C.seritKatmaniSec(A.SERIT - 0.05, 1, A), 1, 'histerezis');
  esit(C.seritKatmaniSec(A.SERIT - A.HISTEREZIS - 0.01, 1, A), 0, 'altına inince kapalı');
  dogru(A.SERIT > A.YAKIN, 'şerit parça rozetlerinden SONRA açılmalı');
});

test('KADRO ŞERİDİ RESMİ: rozet başına bir zemin, bütün figür ve rakamlar TEK çağrı', () => {
  const S = sahteSkia();
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  for (const tur of ['piyade', 'topcu', 'zirhli']) dogru(atlas.figur[tur], tur + ' figürü yok');
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, O.f, AYAR);
  const liste = [
    ROZET(500, 226, { kadro: kadroListesi({ piyade: 3, topcu: 12 }) }),
    ROZET(300, 100, { kadro: kadroListesi({ zirhli: 1 }) }),
    ROZET(200, 100, { kadro: [] }),
  ];
  const r = C.kadroResmi(S, liste, boy, atlas, C.sahneRenkleri(S), AYAR, META);
  esit(r.tuval.zemin, 2, 'kadrosu olan iki rozet');
  esit(r.tuval.atlas.length, 1, 'tek drawAtlas');
  // 3 figür + rakamlar: "3" (1) + "12" (2) + "1" (1) = 7 parça.
  esit(r.tuval.atlas[0].kutular.length, 7, 'parça sayısı');
  esit(
    C.kadroResmi(S, [ROZET(1, 1)], boy, atlas, C.sahneRenkleri(S), AYAR, META),
    null,
    'kadrosuz'
  );
  // Şerit kalkandan geniş olabilir ama kalkanın altında ortalı.
  const o = C.seritOlcusu(kadroListesi({ piyade: 3 }), atlas);
  dogru(o.genislik > 0 && o.yukseklik > 0, 'ölçü');
});

test('KARE: çağrı sayısı rozet sayısından BAĞIMSIZ (rozetler kayıtlı resim)', () => {
  // Aynı sahne, katman resimleri ne içerirse içersin — karede tek drawPicture.
  const t = sahteTuval();
  const d = kameraDonusumu(O, 1, 0, 0);
  C.sahneyiCiz(t, sahteSahne({ il: { ad: 'il' }, parca: null }), {
    k: d.k,
    bx: d.bx,
    by: d.by,
    z: 1,
    parcaSaydam: 0,
  });
  // 1× uzakta: süslerin altı (kıyı gölgesi + dalga) var, üstü (dağ/tepe) eşiğin altında
  // yok; nehir ve cephe hattı her yakınlıkta.
  esit(t.resim, 7, 'süs altı + dolgu + nehir + çizgi + cephe + vurgu + il rozetleri');
});

// ---- SÜSLER (Görev 20 · Baki: "B olsun" + "denizde hafif dalga") ----

const SUS = require('../veri/harita-susleri.json');
const HAT = require('../veri/turkiye-hat.json');

test('SÜS VERİSİ: dağ yalnız dağlıkta, tepe yalnız tepelikte, hepsi parçasının içinde', () => {
  const g = dokunmaGeometrisi(PARCALAR);
  for (const [tur, arazi] of [
    ['dag', 'daglik'],
    ['tepe', 'tepelik'],
  ]) {
    for (const pid of Object.keys(SUS[tur])) {
      esit(PARCALAR[pid].arazi, arazi, pid + ' ' + tur);
      const l = SUS[tur][pid];
      for (let i = 0; i < l.length; i += 3)
        esit(parcaBul(g, l[i], l[i + 1]), pid, pid + ' dışına taşmış');
    }
  }
  // Dalgalar denizde: hiçbir parçanın içinde değil.
  for (let i = 0; i < SUS.dalga.length; i += 3)
    esit(parcaBul(g, SUS.dalga[i], SUS.dalga[i + 1]), null, 'karada dalga');
  dogru(SUS.meta.dag > 100 && SUS.meta.tepe > 100 && SUS.meta.dalga > 100, 'süs sayısı az');
});

test('SÜS VERİSİ: rozetin yeri boş (etiket noktasına dağ konmamış)', () => {
  for (const tur of ['dag', 'tepe'])
    for (const pid of Object.keys(SUS[tur])) {
      const e = PARCALAR[pid].etiket,
        l = SUS[tur][pid];
      for (let i = 0; i < l.length; i += 3)
        dogru(Math.hypot(l[i] - e.x, l[i + 1] - e.y) >= SUS.meta.rozetPayi - 0.1, pid);
    }
});

test('SÜS GEOMETRİSİ: dağ iki tepe (iki çizgi + iki yamaç), kapsam dışının dağı yok', () => {
  const hepsi = C.susGeometrisiKur(SUS, HAT.yol, null);
  const dag = Object.values(SUS.dag).reduce((a, l) => a + l.length / 3, 0);
  const tepe = Object.values(SUS.tepe).reduce((a, l) => a + l.length / 3, 0);
  esit(hepsi.arazi.length, dag * 2 + tepe * 2, 'çizgi sayısı');
  esit(hepsi.isik.length, dag * 2 * 3, 'aydınlık yamaç üçgenleri');
  esit(hepsi.golge.length, dag * 2 * 3, 'gölgeli yamaç üçgenleri');
  esit(hepsi.dalga.length, SUS.dalga.length / 3, 'dalga');
  const kapsam = new Set(PID.filter((p) => PARCALAR[p].bolge === 'Karadeniz'));
  const bolge = C.susGeometrisiKur(SUS, HAT.yol, kapsam);
  dogru(bolge.arazi.length > 0 && bolge.arazi.length < hepsi.arazi.length, 'kapsam süzmüyor');
  esit(bolge.dalga.length, hepsi.dalga.length, 'deniz kapsamdan bağımsız');
});

test('SÜS RESİMLERİ: altı her bantta (gölge resmi + eşikten sonra dalga), üstü eşikten sonra', () => {
  const S = sahteSkia();
  const r = C.susResimleri(S, C.susGeometrisiKur(SUS, HAT.yol, null), BANTLAR, META, EKRAN);
  esit(r.alt.length, BANTLAR.length, 'alt');
  esit(r.ust.length, BANTLAR.length, 'üst');
  BANTLAR.forEach((b, i) => {
    const alt = r.alt[i].tuval;
    esit(alt.resim, 1, 'kıyı gölgesi tek resim');
    esit(alt.kose, b.z >= HARITA_SUS.dalgaEsigi ? 1 : 0, 'dalga z=' + b.z.toFixed(2));
    if (b.z >= HARITA_SUS.araziEsigi) {
      // İki yamaç + çizgiler: üç çağrı, dağ sayısından bağımsız.
      esit(r.ust[i].tuval.kose, 3, 'dağ/tepe z=' + b.z.toFixed(2));
    } else esit(r.ust[i], null, 'eşiğin altında üst resim yok');
  });
});

// ---- HAMLE HAKKI HALKASI (Görev 21 · H3 — Baki: "5 askerin 3'ü oynadıysa hepsi mi soluk?") ----

const { hamleHakkiTablosu, bekleyenOrduSayisi } = require('../src/oyun/hareket.js');
const { HALKA } = require('../src/rozetSekli.js');

// Oyuncunun en büyük ordusu + askerlerinin bir kısmı oynamış hâli.
function hamleliMac() {
  let d = oyunKur({ senaryo: 'turkiye', tohum: 3, zorluk: 'orta' });
  const benim = Object.keys(d.ordular)
    .filter((p) => d.ordular[p].sahip === d.oyuncuAktorId)
    .sort((a, b) => birimSayisi(d.ordular[b].birimler) - birimSayisi(d.ordular[a].birimler));
  return { d, benim };
}

test('HAK TABLOSU: yalnızca oyuncunun orduları; taze orduda kalan = toplam', () => {
  const { d, benim } = hamleliMac();
  const t = hamleHakkiTablosu(d, d.oyuncuAktorId);
  esit(Object.keys(t).length, benim.length, 'oyuncunun her ordusu tabloda');
  for (const pid of benim) {
    esit(t[pid].toplam, birimSayisi(d.ordular[pid].birimler), pid + ' toplam');
    esit(t[pid].kalan, t[pid].toplam, pid + ' taze ordu');
  }
  esit(bekleyenOrduSayisi(t), benim.length, 'hepsi bekliyor');
});

test('HAK TABLOSU: askerlerin bir kısmı oynayınca kalan azalır, hepsi oynayınca 0', () => {
  const { d, benim } = hamleliMac();
  const pid = benim[0];
  const o = d.ordular[pid];
  const tur = Object.keys(o.birimler).find((x) => x === 'piyade') || Object.keys(o.birimler)[0];
  const hak = DENGE.HAREKET.HAMLE_HAKKI[tur] || 1;
  const kismi = {
    ...d,
    ordular: { ...d.ordular, [pid]: { ...o, hamle: { [tur]: { [hak]: 1 } } } },
  };
  const t1 = hamleHakkiTablosu(kismi, d.oyuncuAktorId);
  esit(t1[pid].kalan, t1[pid].toplam - 1, 'bir asker oynadı');
  const hamle = {};
  for (const x of Object.keys(o.birimler))
    hamle[x] = { [DENGE.HAREKET.HAMLE_HAKKI[x] || 1]: o.birimler[x] };
  const bitti = { ...d, ordular: { ...d.ordular, [pid]: { ...o, hamle } } };
  const t2 = hamleHakkiTablosu(bitti, d.oyuncuAktorId);
  esit(t2[pid].kalan, 0, 'hepsi oynadı');
  esit(bekleyenOrduSayisi(t2), benim.length - 1, 'bekleyen bir eksik');
});

test('ROZET LİSTESİ: hak yalnızca oyuncunun rozetinde, oran kalan/toplam', () => {
  const { d, benim } = hamleliMac();
  const t = hamleHakkiTablosu(d, d.oyuncuAktorId);
  t[benim[0]] = { kalan: 2, toplam: 5 };
  const liste = parcaRozetListesi(d.ordular, null, t);
  for (const r of liste) {
    const pid = r.anahtar.slice(1);
    if (d.ordular[pid].sahip === d.oyuncuAktorId) dogru(r.hak >= 0 && r.hak <= 1, pid);
    else esit(r.hak, undefined, 'rakipte hak yok: ' + pid);
  }
  yakin(liste.find((r) => r.anahtar === 'p' + benim[0]).hak, 0.4, 1e-9, 'oran');
  const iller = ilRozetListesi(d.ordular, null, IL_GEOM, t, d.oyuncuAktorId);
  const benimIl = PARCALAR[benim[0]].kod;
  dogru(iller.find((r) => r.anahtar === 'i' + benimIl).hak < 1, 'il halkası da kısmi');
  dogru(
    iller.filter((r) => r.hak !== undefined).every((r) => r.anahtar === 'i' + benimIl),
    'yalnızca oyuncunun ili'
  );
});

test('HALKA: kısmi hak ne boş ne tam görünür; tam hak bütün dilimler', () => {
  esit(C.yananDilim(undefined), 0, 'rakip');
  esit(C.yananDilim(0), 0, 'bitti');
  esit(C.yananDilim(1), HALKA.DILIM, 'tam');
  esit(C.yananDilim(0.01), 1, 'çok az kaldı → yine bir dilim');
  esit(C.yananDilim(0.99), HALKA.DILIM - 1, 'neredeyse tam → tam değil');
  esit(C.yananDilim(0.4), Math.round(0.4 * HALKA.DILIM), 'oran');
});

test('HALKA RESMİ: yatak + tül rozetin içinde, yanan dilimler ayrı veri; merkez doğru', () => {
  const S = sahteSkia();
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, O.f, AYAR);
  const renk = C.sahneRenkleri(S);
  const say = (liste) => C.rozetResmi(S, liste, boy, atlas, renk, AYAR, META).tuval.atlas[0];
  const duz = say([ROZET(500, 226)]).kutular.length;
  esit(say([ROZET(500, 226, { hak: 0.5 })]).kutular.length, duz + HALKA.DILIM, 'yatak');
  esit(say([ROZET(500, 226, { hak: 0 })]).kutular.length, duz + 1, 'soluk tül');
  esit(say([ROZET(500, 226, { hak: undefined })]).kutular.length, duz, 'rakip: ek yok');

  const h = C.halkaVerisi(
    [ROZET(500, 226, { hak: 1 }), ROZET(300, 100, { hak: 0.3 }), ROZET(100, 100, { hak: 0 })],
    boy,
    atlas,
    AYAR
  );
  esit(h.kutular.length, HALKA.DILIM + C.yananDilim(0.3), 'yanan dilimler');
  esit(h.donusumler.length, h.kutular.length, 'dizi boyları');
  // Her dilimin dönme merkezi halkanın merkezine düşmeli (dönüş ne olursa olsun).
  const olcek = boy / 26;
  const mx = 500 - 13 * olcek + HALKA.MERKEZ_X * olcek,
    my = 226 - 13 * olcek + HALKA.MERKEZ_Y * olcek;
  for (let k = 0; k < HALKA.DILIM; k++) {
    const d = h.donusumler[k];
    const m = atlas.dilim.merkez;
    yakin(d.tx + d.scos * m.x - d.ssin * m.y, mx, 1e-9, 'x ' + k);
    yakin(d.ty + d.ssin * m.x + d.scos * m.y, my, 1e-9, 'y ' + k);
  }
  esit(C.halkaVerisi([ROZET(1, 1)], boy, atlas, AYAR), null, 'halkasız');
});

test('KARE: halka TEK çağrı, nefes parlaklığı değiştiriyor ama sönük anda da yanıyor', () => {
  const s = sahteSahne({ il: { ad: 'il' }, parca: { ad: 'parca' }, serit: null });
  s.atlasBoya = {};
  s.rozetler.halkaParca = {
    resim: {},
    kutular: [{}, {}, {}],
    donusumler: [{}, {}, {}],
    renk: [1, 1, 1],
  };
  const d = kameraDonusumu(O, 4, 0, 0);
  const ciz = (nefes) => {
    const t = sahteTuval();
    C.sahneyiCiz(t, s, { k: d.k, bx: d.bx, by: d.by, z: 4, parcaSaydam: 1, nefes });
    return t;
  };
  const parlak = ciz(1),
    sonuk = ciz(0);
  esit(parlak.atlas.length, 1, 'halka tek drawAtlas');
  esit(parlak.atlas[0].renkler[0][3], 1, 'tam parlak');
  yakin(sonuk.atlas[0].renkler[0][3], require('../src/tema.js').HAMLE_HAKKI.nefesEn, 1e-9, 'sönük');
  // İl katmanında (parcaSaydam 0) parça halkası çizilmez.
  const t = sahteTuval();
  C.sahneyiCiz(t, s, { k: d.k, bx: d.bx, by: d.by, z: 4, parcaSaydam: 0, nefes: 1 });
  esit(t.atlas.length, 0, 'il katmanında parça halkası yok');
});

// ---- CEPHE HATTI (Görev 21 · H4) ----

const { cepheHatlari } = require('../src/haritaSeviye.js');

test('CEPHE HATLARI: yalnızca oyuncu ile SAVAŞTIĞI devlet arasındaki hatlar; kıyı yok', () => {
  const [a, b] = VERI.hatSahipleri.find(([x, y]) => y && PARCALAR[x].kod !== PARCALAR[y].kod);
  const sahiplik = {};
  for (const p of PID) sahiplik[p] = 'x';
  sahiplik[a] = 'ben';
  sahiplik[b] = 'dusman';
  const durumlar = { ben: 'ben', dusman: 'savas', x: 'tarafsiz' };
  const c = cepheHatlari(VERI, sahiplik, durumlar);
  dogru(c.length > 0, 'cephe yok');
  for (const { hat, ben } of c) {
    const [ha, hb] = VERI.hatSahipleri[hat];
    dogru(hb, 'kıyı cephe olmaz');
    esit(sahiplik[ben === 'a' ? ha : hb], 'ben', 'benim yakam');
    esit(sahiplik[ben === 'a' ? hb : ha], 'dusman', 'düşman yakası');
  }
  esit(cepheHatlari(VERI, sahiplik, { ...durumlar, dusman: 'tarafsiz' }).length, 0, 'barış');
  esit(cepheHatlari(VERI, sahiplik, { ...durumlar, dusman: 'ittifak' }).length, 0, 'müttefik');
  esit(cepheHatlari(VERI, null, durumlar).length, 0, 'sahiplik yok');
});

test('CEPHE RESMİ: bant başına çizgi + dişler TEK çağrı; dişler DÜŞMAN yakasında', () => {
  // Gerçek nokta-içinde testi: sahte yol, dokunma geometrisiyle "içinde mi" cevaplıyor.
  const S = sahteSkia();
  S.Path.MakeFromSVGString = (s) => {
    let g = null;
    return {
      s,
      setFillType() {},
      contains(x, y) {
        if (!g) g = dokunmaGeometrisi({ t: { yol: s } });
        return parcaBul(g, x, y) === 't';
      },
    };
  };
  const kaynak = C.haritaKaynagiKur(S, VERI, PARCALAR);
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  const g = dokunmaGeometrisi(PARCALAR);
  // Uzun bir il sınırı: iki yakası ayrı illerde, en çok noktalı hat.
  let enIyi = -1,
    uzunluk = 0;
  VERI.hatSahipleri.forEach(([a, b], i) => {
    if (!b || PARCALAR[a].kod === PARCALAR[b].kod) return;
    const n = VERI.seviyeler[0].hatlar[i].length;
    if (n > uzunluk) {
      uzunluk = n;
      enIyi = i;
    }
  });
  const [a, b] = VERI.hatSahipleri[enIyi];
  for (const [benim, dusman] of [
    [a, b],
    [b, a],
  ]) {
    const sahiplik = {};
    for (const p of PID) sahiplik[p] = 'x';
    sahiplik[benim] = 'ben';
    sahiplik[dusman] = 'd';
    const cephe = cepheHatlari(VERI, sahiplik, { ben: 'ben', d: 'savas', x: 'tarafsiz' });
    const r = C.cepheResimleri(S, kaynak, cephe, BANTLAR, atlas, META, EKRAN);
    esit(r.length, BANTLAR.length, 'bant başına resim');
    const t = r[r.length - 1].tuval; // en yakın bant: dişler en seyrek ve en büyük
    esit(t.kose, 1, 'çizgi tek şerit');
    esit(t.atlas.length, 1, 'dişler tek drawAtlas');
    const m = atlas.dis.merkez;
    let dogruYaka = 0,
      toplam = 0;
    for (const d of t.atlas[0].donusumler) {
      // Dişin ucu: hücrede merkezin 7 birim yukarısı.
      const ux = m.x,
        uy = m.y - 7 * atlas.olcek;
      const x = d.tx + d.scos * ux - d.ssin * uy,
        y = d.ty + d.ssin * ux + d.scos * uy;
      toplam++;
      if (parcaBul(g, x, y) === dusman) dogruYaka++;
    }
    dogru(toplam > 3, 'diş az: ' + toplam);
    dogru(dogruYaka / toplam > 0.8, 'dişlerin ' + dogruYaka + '/' + toplam + ' düşman yakasında');
  }
  esit(C.cepheResimleri(S, kaynak, [], BANTLAR, atlas, META, EKRAN), null, 'cephesiz');
});

// ---- BİRLİK FİGÜRLERİ (Görev 21 · H10) ----

test('FİGÜR KATMANI: şeritten SONRA açılıyor, histerezisle kapanıyor', () => {
  const A = { ...AYAR, SERIT: DENGE.ROZET.SERIT_ESIGI, FIGUR: DENGE.ROZET.FIGUR_ESIGI };
  dogru(A.FIGUR > A.SERIT, 'figürler şeritten sonra');
  esit(C.figurKatmaniSec(A.FIGUR, 0, A), 1, 'eşikte açık');
  esit(C.figurKatmaniSec(A.FIGUR - 0.05, 1, A), 1, 'histerezis');
  esit(C.figurKatmaniSec(A.FIGUR - A.HISTEREZIS - 0.01, 1, A), 0, 'kapandı');
});

test('FİGÜR RESMİ: tür başına kontur + figür + balon + rakam, TEK çağrı', () => {
  const S = sahteSkia();
  const atlas = C.rozetAtlasiKur(S, sahteFont, C.sekilleriKur(S));
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, O.f, AYAR);
  const liste = [
    ROZET(500, 226, { kadro: kadroListesi({ piyade: 3, topcu: 12 }) }),
    ROZET(200, 100, { kadro: [] }),
  ];
  const r = C.figurResmi(S, liste, boy, atlas, C.sahneRenkleri(S), AYAR, META);
  esit(r.tuval.atlas.length, 1, 'tek drawAtlas');
  // piyade: kontur + figür + balon + "3" = 4 · topçu: kontur + figür + balon + "12" = 5
  esit(r.tuval.atlas[0].kutular.length, 9, 'parça sayısı');
  esit(C.figurResmi(S, [ROZET(1, 1)], boy, atlas, C.sahneRenkleri(S), AYAR, META), null, 'boş');
});

test('KARE: figürler açılırken şerit söner (ikisi aynı yerde)', () => {
  const s = sahteSahne({ il: null, parca: { ad: 'p' }, serit: { ad: 's' }, figur: { ad: 'f' } });
  const d = kameraDonusumu(O, 6, 0, 0);
  const ciz = (figurSaydam) => {
    const t = sahteTuval();
    C.sahneyiCiz(t, s, {
      k: d.k,
      bx: d.bx,
      by: d.by,
      z: 6,
      parcaSaydam: 1,
      seritSaydam: 1,
      figurSaydam,
    });
    return t;
  };
  const once = ciz(0),
    sonra = ciz(1),
    gecis = ciz(0.5);
  esit(once.resim - sonra.resim, 0, 'biri gidiyor biri geliyor: resim sayısı aynı');
  esit(gecis.katman, 2, 'geçişte ikisi de yarı saydam');
});

// ---- WORKLET SIRASI (2026-09-24 · telefonda "halkaOynat is not a function") ----
//
// Reanimated'in derleyicisi 'worklet' fonksiyon bildirimini SABİTE çeviriyor ve worklet'in
// kullandığı dış adları o anda yakalıyor: sonradan tanımlanan bir yardımcı ya da sabit
// telefonda "undefined" oluyor. Node bu dönüşümü yapmadığı için öteki testler yakalamıyor;
// bu test dosyanın metnine bakıyor: modül düzeyindeki bir worklet fonksiyonunun kullandığı
// her modül düzeyi fonksiyon ve sabit, dosyada ondan ÖNCE tanımlanmış olmalı.
test('WORKLET SIRASI: worklet fonksiyonunun kullandığı her ad ondan önce tanımlı', () => {
  const fs = require('fs');
  const path = require('path');
  for (const dosya of ['haritaCizim.js', 'haritaDonusum.js', 'haritaSeviye.js']) {
    const metin = fs.readFileSync(path.join(__dirname, '..', 'src', dosya), 'utf8');
    // Modül düzeyindeki tanımlar: satır başında function / const / let.
    const tanim = new Map();
    const re =
      /^(?:export\s+)?(?:function\s+([A-Za-z_$][\w$]*)|(?:const|let)\s+([A-Za-z_$][\w$]*))/gm;
    let m;
    while ((m = re.exec(metin))) tanim.set(m[1] || m[2], m.index);
    // Worklet gövdeleri: modül düzeyi fonksiyon + ilk satırı 'worklet'.
    const wre = /^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*\n\s*'worklet';/gm;
    let sayi = 0;
    while ((m = wre.exec(metin))) {
      sayi++;
      const ad = m[1];
      const bas = m.index;
      const son = metin.indexOf('\n}\n', bas);
      const govde = metin.slice(bas, son);
      for (const [isim, yer] of tanim) {
        if (isim === ad) continue;
        if (!new RegExp('\b' + isim.replace(/\$/g, '\$') + '\b').test(govde)) continue;
        dogru(yer < bas, dosya + ': ' + ad + ' → ' + isim + ' sonradan tanımlanmış');
      }
    }
    dogru(sayi > 0 || dosya !== 'haritaCizim.js', dosya + ' worklet bulunamadı');
  }
});

// ---- NEHİRLER VE GÖLLER (Görev 21 · H8, Natural Earth) ----

const NEHIR_VERI = require('../veri/harita-nehirler.json');

test('NEHİR VERİSİ: yerleşim tuttu, nehirler karada, göller Türkiye içinde', () => {
  const y = NEHIR_VERI.meta.yerlesim;
  dogru(y.ortancaHata < 0.5, 'il kutularının ortanca hatası ' + y.ortancaHata);
  const g = dokunmaGeometrisi(PARCALAR);
  let nokta = 0,
    karada = 0;
  for (const r of NEHIR_VERI.nehirler)
    for (let i = 0; i < r.n.length; i += 2) {
      nokta++;
      if (parcaBul(g, r.n[i], r.n[i + 1]) !== null) karada++;
    }
  // Sadeleşme kıyıda birkaç noktayı denize kaydırabilir; neredeyse hepsi karada olmalı.
  dogru(karada / nokta > 0.97, 'nehir noktalarının ' + karada + '/' + nokta + ' karada');
  const adlar = NEHIR_VERI.nehirler.map((r) => r.ad).join(',');
  for (const ad of ['Kızılırmak', 'Sakarya', 'Dicle']) dogru(adlar.includes(ad), ad + ' yok');
  const goller = NEHIR_VERI.goller.map((x) => x.ad).join(',');
  dogru(/Van/.test(goller) && /Tuz/.test(goller), 'Van ve Tuz gölü olmalı: ' + goller);
});

test('SÜS VERİSİ: göl içinde dağ ya da tepe yok', () => {
  const gol = dokunmaGeometrisi(
    Object.fromEntries(
      NEHIR_VERI.goller.flatMap((x, i) =>
        x.halkalar.map((h, j) => {
          let yol = 'M' + h[0] + ',' + h[1];
          for (let k = 2; k < h.length; k += 2) yol += 'L' + h[k] + ',' + h[k + 1];
          return ['g' + i + '-' + j, { yol: yol + 'Z' }];
        })
      )
    )
  );
  for (const tur of ['dag', 'tepe'])
    for (const pid of Object.keys(SUS[tur])) {
      const l = SUS[tur][pid];
      for (let i = 0; i < l.length; i += 3)
        esit(parcaBul(gol, l[i], l[i + 1]), null, tur + ' gölde: ' + pid);
    }
});

test('NEHİR RESMİ: bant başına göl dolgusu + iki nehir kalınlığı', () => {
  const S = sahteSkia();
  const geo = C.nehirGeometrisiKur(NEHIR_VERI);
  dogru(geo.buyuk.length + geo.kucuk.length > 0, 'nehir yok');
  dogru(geo.golYol.length > 0, 'göl yok');
  const r = C.nehirResimleri(S, geo, BANTLAR, META, EKRAN);
  esit(r.length, BANTLAR.length, 'bant başına resim');
  for (const x of r) {
    esit(x.tuval.yol, 1, 'göller tek dolgu');
    esit(x.tuval.kose, 2, 'büyük + küçük nehir şeridi');
  }
  esit(C.nehirResimleri(S, C.nehirGeometrisiKur(null), BANTLAR, META, EKRAN), null, 'veri yok');
});
