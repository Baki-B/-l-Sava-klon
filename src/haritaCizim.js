// SKIA HARİTASININ ÇİZİMİ (Görev 20 / Adım 2–3, akıcılık düzeltmesi Adım 3b).
//
// ┌─ TEK ÇİZİM KODU, ÜÇ YER ─────────────────────────────────────────────────────────────┐
// │ Telefonda `HaritaSkia.js` her karede `sahneyiCiz`'i çağırıyor. Bilgisayarda            │
// │ `scripts/harita-skia-onizleme.js` (görüntü) ve `onizleme/harita-hiz.html` (hız, ekran  │
// │ kartıyla) AYNI fonksiyonları Skia'nın bilgisayar sürümüyle çağırıyor. Böylece telefona │
// │ gönderilmeden önce harita gözle ve saatle denetlenebiliyor ve ikisi asla ayrışmıyor.  │
// │                                                                                        │
// │ Bu yüzden dosya Skia'yı İÇE AKTARMIYOR: `Skia` nesnesi parametre olarak geliyor        │
// │ (telefonda yerel Skia, bilgisayarda CanvasKit). Sabit sayılar da aynı sebeple          │
// │ burada: Skia'nın numaralandırmalarını içe aktarmak React Native'i çağırırdı.           │
// └────────────────────────────────────────────────────────────────────────────────────────┘
//
// ┌─ NEDEN BÖYLE (Adım 3b — Baki 2026-09-23: "30 fps gibi, takılmalar var") ──────────────┐
// │ İlk sürüm her karede ~2.500 Skia çağrısı yapıyordu ve Skia'ya en pahalı işi           │
// │ veriyordu. Ekran kartıyla ölçüldü (`onizleme/harita-hiz.html`, telefonun yüzey        │
// │ ayarlarıyla): bütün harita görünürken kare ~70 ms. Asıl bedel JavaScript DEĞİLDİ:     │
// │                                                                                        │
// │ Telefondaki Skia yüzeyinde ne çoklu örnekleme ne şablon tamponu var                    │
// │ (react-native-skia, Android). Böyle bir yüzeyde KENARI YUMUŞATILMIŞ karmaşık şekli    │
// │ Skia her karede İŞLEMCİDE maske olarak çizip ekran kartına yüklüyor. Sınır çizgileri   │
// │ ve rozet kalkanları tam olarak bu türdendi. Ölçülen payları (bütün harita, bilgisayar):│
// │   sınır çizgileri 31 ms · rozetler 6 ms · yumuşatmasız dolgu 0.6 ms                    │
// │                                                                                        │
// │ ÇÖZÜM — Skia'ya yalnızca ekran kartının hızlı yaptığı işi vermek:                      │
// │  • DOLGU yumuşatmasız: Skia üçgenlerini bir kez hesaplayıp saklıyor. Kenarları zaten   │
// │    sınır çizgisinin altında; göze fark yok.                                           │
// │  • SINIR ÇİZGİSİ hazır ÜÇGEN ŞERİDİ: çizgi bir kez üçgenlere çevriliyor, kenar         │
// │    yumuşatmasını küçük bir ekran kartı programı yapıyor (`SERIT_SKSL`). Kalınlık da    │
// │    o programın bir sayısı: geometri seviye başına BİR kez kurulur.                    │
// │  • ROZET hazır RESİM: kalkan, kontur ve rakamlar bir kez bir resim sayfasına           │
// │    (`rozetAtlasiKur`) çiziliyor; her rozet o sayfadan renklendirilerek basılıyor. Bir  │
// │    katmanın bütün rozetleri TEK çağrı.                                                 │
// │  • HER ŞEY veri değişince bir kez RESİM olarak kaydediliyor; karede yalnızca kamerayla │
// │    oynatılıyor (Antiyoy ve Polytopia gibi: önce dünya, sonra kamera). Karede ~10 çağrı │
// │    var ve sayı rozet ya da parça sayısıyla BÜYÜMÜYOR (test).                           │
// │ Sonuç ve karşılaştırma: `veri/harita-hiz-olcum.md`.                                    │
// └────────────────────────────────────────────────────────────────────────────────────────┘
//
// İKİ TASARIM KARARI bunu mümkün kılıyor:
//  • ROZET HARİTANIN PARÇASI: boyu harita birimiyle sabit, kamera onu haritayla birlikte
//    büyütüyor (Baki'nin cevabı: "büyüsün"). Ekrandaki boy zaten CAP·z/eşik idi — yani
//    haritayla aynı oranda; artık bunu kamera yapıyor.
//  • ÇİZGİ KALINLIĞI BANTLARLA: kalınlık yakınlıkla yavaş büyüyor (`CIZGI_BUYUME`).
//    Yakınlık aralığı `CIZGI_BANT_ORANI` adımlı bantlara bölünüp her bant için çizgi
//    resmi kaydediliyor; bant değişince kalınlık ~%7 sıçrıyor (göz görmüyor). Kademeli
//    geometrinin seviye eşikleri de bant kenarı: dolgu ve çizgi her zaman AYNI seviyeden.

import {
  PANEL,
  RENK,
  ARAZI_RENK,
  BOLGE_RENK,
  ITTIFAK_RENK,
  askeriTon,
  okunakliMetin,
  KAPSAM_DISI_SOLUKLUK,
  CIZGI_BUYUME,
  CIZGI_BANT_ORANI,
  ROZET_MASKE,
  HARITA_SUS,
  HAMLE_HAKKI,
  CEPHE,
  BIRLIK_FIGUR,
  NEHIR,
} from './tema.js';
import { KALKAN, PARLAKLIK, YIPRANMA, KONTUR, KOMUTAN_KONTUR, KUTU, HALKA } from './rozetSekli.js';
import { BIRIM_SEKLI, BIRIM_SIRASI, BIRIM_KUTU } from './birimSekli.js';
import { dolguYolu, hatTurleri, hatGruplari, seviyeSec } from './haritaSeviye.js';

// Skia numaralandırmaları — değerleri Skia'nın kendi tanımlarıyla aynı; içe aktarılmıyor
// (dosya başındaki not).
const DOLGU = 0; // PaintStyle.Fill
const CIZGI = 1; // PaintStyle.Stroke
const YUVARLAK = 1; // StrokeJoin.Round / StrokeCap.Round
const CIFT_TEK = 1; // FillType.EvenOdd
const SERIT = 1; // VertexMode.TriangleStrip
const KAYNAK_USTE = 3; // BlendMode.SrcOver
const CARP = 13; // BlendMode.Modulate
const DOGRUSAL = 1; // FilterMode.Linear
const DOGRUSAL_KADEME = 2; // MipmapMode.Linear

// Dolgu kenar yumuşatması (dosya başındaki not). Ölçüm düzeneği karşılaştırabilsin diye
// `dolguResimleri`'ne `secenek` olarak da geçilebiliyor; oyun hep bu varsayılanı kullanır.
const DOLGU_YUMUSAK = false;

// Çizgi kalınlıkları HARİTA BİRİMİ cinsinden — eski SVG haritasıyla birebir aynı (orada da
// yakınlaştırmayla birlikte kalınlaşıyordu).
const KALINLIK = { parca: 0.8, il: 1.4, secim: 2.4, komsu: 2.0, hedef: 2.6, ok: 1.8 };
// Kapsam dışı parçanın sınır çizgisi (eski haritada `strokeOpacity 0.3`).
const SOLUK_CIZGI = 0.3;
// Seçim kipindeki hedef dolgusunun saydamlığı (eski haritada `fillOpacity 0.28`).
const HEDEF_DOLGU = 0.28;
// SEÇİLİ HEDEF (Görev 20 / Adım 5): ikinci dokunuşu bekleyen hedef. Dolgusu TAHMİNİN
// renginde ve öteki hedeflerden koyu; çevresi kalın ve açık — "buraya bir kez daha dokun".
const SECILI_HEDEF_DOLGU = 0.55;
const SECILI_HEDEF_KALINLIK = 3.4;
// Emir okunun ölçüleri (harita birimi) — eski haritayla aynı.
const OK_BOY = 5.5;
const OK_EN = 2.6;
const OK_GERI = 3.5;

// Rozet: kalkanın altındaki gölgenin kayması (kutu birimi) ve koyuluğu; bağlantı çizgisi.
const GOLGE_KAYMA = 1.2;
const GOLGE = 0.35;
const BAG_CIZGI = 1.5;
// Rozet sayısının yazı ölçüsü (Rozet.js ile aynı): iki haneye kadar 13, "99+" için 10.
const YAZI_BUYUK = 13;
const YAZI_KUCUK = 10;
// Yazının dikey merkezi, kutu biriminde (Rozet.js: üst 3 + satır 15/2 · küçükte 5.5 + 13/2).
const YAZI_MERKEZ = 10.5;
const YAZI_MERKEZ_KUCUK = 12;

// ======================================================================================
// 1) KAYNAK KURULUMU — bir kez (JS iş parçacığı)
// ======================================================================================

// Her seviyenin 181 dolgu yolu ve sınır çizgilerinin noktaları.
// `veri`: harita-seviyeleri.json · `parcalar`: parcalar.json'un `parcalar` alanı.
export function haritaKaynagiKur(Skia, veri, parcalar) {
  const parcaIl = {};
  for (const pid of Object.keys(parcalar)) parcaIl[pid] = parcalar[pid].kod;

  const seviyeler = veri.seviyeler.map((_, i) => {
    const dolgular = {};
    for (const pid of Object.keys(veri.halkalar)) {
      const yol = Skia.Path.MakeFromSVGString(dolguYolu(veri, i, pid));
      if (!yol) continue;
      // Çift-tek kuralı: halkanın yönü önemsizleşir; iç içe halka (delik) her durumda delik.
      yol.setFillType(CIFT_TEK);
      dolgular[pid] = yol;
    }
    return { dolgular };
  });

  // Sınır çizgilerinin noktaları ve köşe yönleri (şerit için) — seviye başına bir kez.
  const hatlar = veri.seviyeler.map((sv) => sv.hatlar.map(hatGeometrisi));

  return {
    veri,
    parcaIl,
    seviyeler,
    hatlar,
    // Vurgulanan parçaların halkaları (seviye|parça → şerit geometrisi) — ilk seçildiğinde.
    halkalar: new Map(),
    toleranslar: veri.meta.toleranslar,
  };
}

// Kalkan şekilleri — bir kez.
export function sekilleriKur(Skia) {
  return {
    kalkan: Skia.Path.MakeFromSVGString(KALKAN),
    parlaklik: Skia.Path.MakeFromSVGString(PARLAKLIK),
    yipranma: Skia.Path.MakeFromSVGString(YIPRANMA),
  };
}

// ======================================================================================
// 2) YAKINLIK BANTLARI — ekran ölçüsü değişince (JS iş parçacığı)
// ======================================================================================

// Yakınlık aralığını bantlara böler. Her bant: { alt, ust, z, seviye }
//   z       bandın temsilî yakınlığı (geometrik orta) — çizgi kalınlığı buna göre
//   seviye  kademeli geometrinin seviyesi; bant İÇİNDE SABİT, çünkü seviye eşikleri
//           (`seviyeSec`'in yarım piksel sınırları) bant kenarı yapılıyor
// `f`: haritaOlcusu(...).f — seviye eşikleri ekrana bağlı olduğu için bantlar da öyle.
export function bantlariKur(f, toleranslar, hataPiksel, zEnUzak, zEnYakin) {
  const esikler = [];
  for (const t of toleranslar) {
    const z = hataPiksel / (f * t);
    if (z > zEnUzak && z < zEnYakin) esikler.push(z);
  }
  // Oran adımlı kenarlar; bir seviye eşiğine %3'ten yakın olanı eşik yutar (ince bant yok).
  const kenar = [zEnUzak, zEnYakin, ...esikler];
  for (let z = zEnUzak * CIZGI_BANT_ORANI; z < zEnYakin / 1.03; z *= CIZGI_BANT_ORANI) {
    if (esikler.every((e) => Math.abs(z / e - 1) > 0.03)) kenar.push(z);
  }
  kenar.sort((a, b) => a - b);
  const bantlar = [];
  for (let i = 0; i < kenar.length - 1; i++) {
    const z = Math.sqrt(kenar[i] * kenar[i + 1]);
    bantlar.push({
      alt: kenar[i],
      ust: kenar[i + 1],
      z,
      seviye: seviyeSec(f, z, toleranslar, hataPiksel),
    });
  }
  return bantlar;
}

// O anki yakınlığın bandı. `ustler`: bantların üst kenarları (düz sayı dizisi).
export function bantSec(z, ustler) {
  'worklet';
  const son = ustler.length - 1;
  for (let i = 0; i < son; i++) {
    if (z < ustler[i]) return i;
  }
  return son;
}

// Bandın harita birimindeki çizgi çarpanı: ekranda z^b istiyoruz, tuval zaten k = f·z ile
// ölçekliyor, yani harita biriminde z^(b-1) gerekiyor.
function kalinlikCarpani(bant) {
  return Math.pow(bant.z, CIZGI_BUYUME - 1);
}

// ======================================================================================
// 3) DOLGU RENKLERİ — harita tipi / sahiplik değişince (JS iş parçacığı)
// ======================================================================================

// Parça → { renk, saydam }. Kural eski haritanın `tabanEl`'iyle BİREBİR aynı:
//   il       sahibinin rengi (fethedilen yer senin rengine döner)
//   ittifak  sahibinin SANA GÖRE durumu (tablo kancadan hazır gelir — ekranda kural yok)
//   arazi / bolge  sabit palet
export function dolgulariHesapla(parcalar, mod, sahiplik, aktorRenk, ittifakDurumlari, kapsam) {
  const sonuc = {};
  for (const pid of Object.keys(parcalar)) {
    const p = parcalar[pid];
    let renk;
    if (mod === 'il') {
      const sahip = sahiplik ? sahiplik[pid] : null;
      renk = (sahip && aktorRenk && aktorRenk[sahip]) || askeriTon(p.renkIl);
    } else if (mod === 'ittifak') {
      const sahip = sahiplik ? sahiplik[pid] : null;
      const durum = (sahip && ittifakDurumlari && ittifakDurumlari[sahip]) || 'tarafsiz';
      renk = askeriTon(ITTIFAK_RENK[durum] || ITTIFAK_RENK.tarafsiz);
    } else {
      renk = askeriTon(mod === 'arazi' ? ARAZI_RENK[p.arazi] : BOLGE_RENK[p.bolge]);
    }
    const disi = kapsam ? !kapsam.has(pid) : false;
    sonuc[pid] = { renk, saydam: disi ? KAPSAM_DISI_SOLUKLUK : 1 };
  }
  return sonuc;
}

// ======================================================================================
// 4) ORTAK YARDIMCILAR (JS iş parçacığı)
// ======================================================================================

function boya(Skia, stil, yumusak = true) {
  const b = Skia.Paint();
  b.setAntiAlias(yumusak);
  b.setStyle(stil);
  if (stil === CIZGI) {
    b.setStrokeJoin(YUVARLAK);
    b.setStrokeCap(YUVARLAK);
  }
  return b;
}

function renkOnbellegi(Skia) {
  const renkler = new Map();
  return (hex) => {
    let r = renkler.get(hex);
    if (!r) renkler.set(hex, (r = Skia.Color(hex)));
    return r;
  };
}

// Aynı renk, başka saydamlıkla (Skia rengi [r, g, b, a] dizisi).
function saydamRenk(renk, a) {
  const r = Float32Array.from(renk);
  r[3] = a;
  return r;
}

// Kayıt sınırı: haritanın tamamı + taşan rozetler için pay (harita birimi).
function kayitSiniri(Skia, meta) {
  return Skia.XYWHRect(-60, -60, meta.genislik + 120, meta.yukseklik + 120);
}

function kaydet(Skia, meta, ciz) {
  const kaydedici = Skia.PictureRecorder();
  ciz(kaydedici.beginRecording(kayitSiniri(Skia, meta)));
  return kaydedici.finishRecordingAsPicture();
}

// ======================================================================================
// 5) DOLGU RESİMLERİ — sahiplik / harita tipi değişince
// ======================================================================================

// Her seviye için bir DOLGU resmi: 181 parçanın rengi. Kayıt harita biriminde; kamera
// oynatırken uygulanıyor. `dolgular`: dolgulariHesapla(...) · `meta`: { genislik, yukseklik }
export function dolguResimleri(Skia, kaynak, dolgular, meta, secenek) {
  const yumusak =
    secenek && secenek.dolguYumusak !== undefined ? secenek.dolguYumusak : DOLGU_YUMUSAK;
  const dolgu = boya(Skia, DOLGU, yumusak);
  const renk = renkOnbellegi(Skia);
  return kaynak.seviyeler.map((sv) =>
    kaydet(Skia, meta, (c) => {
      for (const pid of Object.keys(sv.dolgular)) {
        const d = dolgular[pid];
        if (!d) continue;
        dolgu.setColor(renk(d.renk));
        dolgu.setAlphaf(d.saydam);
        c.drawPath(sv.dolgular[pid], dolgu);
      }
    })
  );
}

// ======================================================================================
// 6) SINIR ÇİZGİLERİ — üçgen şeridi + ekran kartı programı
// ======================================================================================
//
// Her hat, çevresinde `D` genişliğinde bir üçgen şeridine çevrilir. Şeridin her köşesi,
// merkez çizgiye UZAKLIĞINI da taşır (doku koordinatı: x = ±D yana, y = uçta -D). Ekran
// kartı programı her piksel için "çizginin içinde mi" diye bu uzaklığa bakar: yarı kalınlığın
// içindeyse tam renk, dışına doğru bir piksellik saçakta saydamlaşır (kenar yumuşatması),
// daha dışı boş. Kalınlık ve saçak programın sayılarıdır; şerit ise yalnızca en kalın
// çizgiyi alacak kadar geniş olmalı. Bu yüzden geometri SEVİYE başına bir kez kurulur,
// bantlar yalnızca programa başka sayı verir.
//
// Uçlar ve köşeler YUVARLAK (eski yol çizgisindeki gibi). Program uzaklığı doku
// koordinatının BOYU olarak ölçüyor: şeridin gövdesinde y = 0, yani uzaklık yalnızca yana;
// ucun uzatmasında ve keskin köşeye konan küçük karede (düğüm) iki yönde — sonuç yarı
// kalınlık yarıçaplı bir yuvarlak. Kavşakta çentik kalmıyor, girintili kıyı tüylenmiyor.
//
// HIZ. Telefonda JavaScript yorumlanarak çalışıyor; şerit kurmak maç başında yapılan en
// ağır iş. Bu yüzden iki aşamalı: noktalar ve köşe yönleri kaynakla BİR KEZ okunur
// (`hatGeometrisi`, D'den bağımsız); maç başında yalnızca D ile çarpılıp Skia'ya verilir.
const SERIT_SKSL = `
uniform float yari;
uniform float sacak;
uniform half4 renk;
half4 main(float2 p) {
  float a = clamp((yari - length(p)) / sacak + 0.5, 0.0, 1.0);
  return renk * half(a);
}`;

// Bir hattın (ya da halkanın) noktaları ve her noktadaki köşe kayması (D = 1 için).
// `yol`: "Mx,yLx,y…" (sonunda Z varsa kapalı halka).
//
// KÖŞELER. Yumuşak köşede şerit köşenin açıortayı boyunca biraz uzar (sivri birleşim, en
// çok 1/KESKIN kat). Keskin köşede (dönüş ~80°'den büyük) bu uzama çizgiden DİKEN gibi
// taşıyordu — en ince seviyenin girintili kıyılarında görüldü (önizleme, 2026-09-23). Orada
// nokta iki kez konur: gelen ve giden parçanın kendi yönüyle (kesik birleşim); köşenin
// dışında kalan boşluğu `seritYaz`'ın koyduğu düğüm yuvarlak kapatır. Her nokta için dört
// sayı saklanır: [a, b] iki kayma; yumuşak köşede ikisi aynıdır ve nokta bir kez konur.
const KESKIN = 0.75;
export function hatGeometrisi(yol) {
  const kapaliIsaret = yol.charCodeAt(yol.length - 1) === 90; // 'Z'
  const parcalar = yol.slice(1, kapaliIsaret ? yol.length - 1 : yol.length).split('L');
  const xy = [];
  for (let i = 0; i < parcalar.length; i++) {
    const p = parcalar[i];
    const v = p.indexOf(',');
    const x = +p.slice(0, v),
      y = +p.slice(v + 1);
    const n = xy.length;
    if (n >= 2 && xy[n - 2] === x && xy[n - 1] === y) continue; // üst üste nokta: yön belirsiz
    xy.push(x, y);
  }
  let m = xy.length / 2;
  let kapali = kapaliIsaret;
  if (m > 2 && xy[0] === xy[2 * m - 2] && xy[1] === xy[2 * m - 1]) {
    xy.length -= 2;
    m--;
    kapali = true;
  }
  const kay = new Float32Array(4 * m);
  const keskin = new Uint8Array(m);
  for (let i = 0; i < m; i++) {
    // Gelen (önceki → i) ve giden (i → sonraki) doğrultular; açık hattın ucunda ikisi aynı.
    const once = kapali ? (i - 1 + m) % m : i - 1;
    const sonra = kapali ? (i + 1) % m : i + 1;
    const a1 = once >= 0 ? once : i,
      b1 = once >= 0 ? i : sonra;
    const a2 = sonra < m ? i : once,
      b2 = sonra < m ? sonra : i;
    let t1x = xy[2 * b1] - xy[2 * a1],
      t1y = xy[2 * b1 + 1] - xy[2 * a1 + 1];
    let t2x = xy[2 * b2] - xy[2 * a2],
      t2y = xy[2 * b2 + 1] - xy[2 * a2 + 1];
    const l1 = Math.hypot(t1x, t1y) || 1,
      l2 = Math.hypot(t2x, t2y) || 1;
    t1x /= l1;
    t1y /= l1;
    t2x /= l2;
    t2y /= l2;
    let nx = -(t1y + t2y),
      ny = t1x + t2x;
    const nl = Math.hypot(nx, ny);
    const cos = nl < 1e-6 ? 0 : (nx / nl) * -t1y + (ny / nl) * t1x;
    if (cos < KESKIN) {
      // Keskin köşe: iki parçanın kendi dik yönleri (kesik birleşim).
      keskin[i] = 1;
      kay[4 * i] = -t1y;
      kay[4 * i + 1] = t1x;
      kay[4 * i + 2] = -t2y;
      kay[4 * i + 3] = t2x;
    } else {
      nx /= nl;
      ny /= nl;
      const uz = 1 / cos;
      kay[4 * i] = kay[4 * i + 2] = nx * uz;
      kay[4 * i + 1] = kay[4 * i + 3] = ny * uz;
    }
  }
  return { xy: Float32Array.from(xy), kay, keskin, kapali, m };
}

// Bir hattın şeridini `pos`/`doku` dizilerine ekler (üçgen şeridi; önceki şeritle sıfır
// alanlı iki üçgenle dikilir). Keskin köşelerin düğümleri (küçük kareler) hattın ardından,
// aynı şeride dikilerek eklenir. `T`: paylaşılan doku koordinatı nesneleri.
function seritYaz(g, D, pos, doku, T) {
  const { xy, kay, keskin, kapali, m } = g;
  if (m < 2) return;
  let yeniParca = true;
  const koy = (x, y, t) => {
    const p = { x, y };
    if (yeniParca && pos.length > 0) {
      pos.push(pos[pos.length - 1], p);
      doku.push(doku[doku.length - 1], t);
    }
    yeniParca = false;
    pos.push(p);
    doku.push(t);
  };
  // i noktasına bir çift köşe: k = 0 gelen kayma, k = 2 giden kayma.
  const cift = (i, k) => {
    const x = xy[2 * i],
      y = xy[2 * i + 1];
    const kx = kay[4 * i + k] * D,
      ky = kay[4 * i + k + 1] * D;
    koy(x + kx, y + ky, T.sol);
    koy(x - kx, y - ky, T.sag);
  };
  // i ucunda, j'den i'ye doğrultuda D kadar uzatılmış uç. Şeridin sol yanı hattın ilerleme
  // yönüne göre; baştaki uçta (j → i) ilerlemenin tersi.
  const uc = (i, j, bas) => {
    let tx = xy[2 * i] - xy[2 * j],
      ty = xy[2 * i + 1] - xy[2 * j + 1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const cx = xy[2 * i] + tx * D,
      cy = xy[2 * i + 1] + ty * D;
    const s = bas ? -1 : 1;
    koy(cx - s * ty * D, cy + s * tx * D, T.solUc);
    koy(cx + s * ty * D, cy - s * tx * D, T.sagUc);
  };
  if (!kapali) uc(0, 1, true);
  // Kapalı halkanın ilk noktası: yalnızca giden kayma; gelen kayma halkayı kapatırken.
  cift(0, 2);
  for (let i = 1; i < m; i++) {
    cift(i, 0);
    if (keskin[i]) cift(i, 2);
  }
  if (kapali) {
    cift(0, 0);
    if (keskin[0]) cift(0, 2);
  } else {
    uc(m - 1, m - 2, false);
  }
  // Düğümler: keskin köşede noktayı ortalayan 2D'lik kare; program onu yuvarlak boyar.
  for (let i = 0; i < m; i++) {
    if (!keskin[i]) continue;
    const x = xy[2 * i],
      y = xy[2 * i + 1];
    yeniParca = true;
    koy(x - D, y - D, T.solUc);
    koy(x + D, y - D, T.sagUc);
    koy(x - D, y + D, T.solAlt);
    koy(x + D, y + D, T.sagAlt);
  }
}

function dokuKoseleri(D) {
  return {
    sol: { x: -D, y: 0 },
    sag: { x: D, y: 0 },
    solUc: { x: -D, y: -D },
    sagUc: { x: D, y: -D },
    solAlt: { x: -D, y: D },
    sagAlt: { x: D, y: D },
  };
}

// Bir cihaz pikselinin harita birimindeki karşılığı (saçak genişliği), bandın yakınlığında.
function sacakGenisligi(bant, ekran) {
  return 1 / (ekran.f * bant.z * ekran.yogunluk);
}

// Verilen bantlarda en kalın çizgiyi (`kalinlik`, harita birimi) alacak şerit genişliği.
function seritGenisligi(bantlar, kalinlik, ekran) {
  let D = 0;
  for (const b of bantlar) {
    D = Math.max(D, (kalinlik * kalinlikCarpani(b)) / 2 + sacakGenisligi(b, ekran));
  }
  return D * 1.05;
}

// Seviye başına çizgi şeritleri: il × tür × solukluk grupları (yakınlaşınca ekran
// dışındaki grup, Skia oynatırken sınır kutusundan elenir). Kapsama ve ekrana bağlı —
// yani maç başına ve ekran değişince bir kez. Bu ekranda hiç kullanılmayan seviye `null`.
// `ekran`: { f (haritaOlcusu), yogunluk (piksel yoğunluğu) }
export function hatSeritleriKur(Skia, kaynak, kapsam, bantlar, ekran) {
  const turler = hatTurleri(kaynak.veri, kaynak.parcaIl, kapsam);
  return kaynak.hatlar.map((hatlar, seviye) => {
    const kendi = bantlar.filter((b) => b.seviye === seviye);
    if (kendi.length === 0) return null;
    const D = seritGenisligi(kendi, KALINLIK.il, ekran);
    const T = dokuKoseleri(D);
    const gruplar = new Map();
    for (let i = 0; i < hatlar.length; i++) {
      const t = turler[i];
      const anahtar = t.il + '|' + (t.ilSiniri ? 1 : 0) + '|' + (t.soluk ? 1 : 0);
      let g = gruplar.get(anahtar);
      if (!g) {
        g = { ilSiniri: t.ilSiniri, soluk: t.soluk, pos: [], doku: [] };
        gruplar.set(anahtar, g);
      }
      seritYaz(hatlar[i], D, g.pos, g.doku, T);
    }
    const liste = [];
    for (const g of gruplar.values()) {
      if (g.pos.length < 3) continue;
      liste.push({
        ilSiniri: g.ilSiniri,
        soluk: g.soluk,
        koseler: Skia.MakeVertices(SERIT, g.pos, g.doku),
      });
    }
    return liste;
  });
}

// Şerit programı + bandın sayıları → Skia gölgelendiricisi.
function seritGolgesi(program, bant, kalinlik, renk, ekran) {
  return program.makeShader([
    (kalinlik * kalinlikCarpani(bant)) / 2,
    sacakGenisligi(bant, ekran),
    renk[0],
    renk[1],
    renk[2],
    renk[3],
  ]);
}

// Her BANT için bir sınır çizgisi resmi: seviyenin şeritleri, o bandın kalınlığıyla.
// İl sınırları açıksa il hatları ince çizgiyle ATLANIR: üstlerine daha kalın ve koyu çizgi
// geliyor. `renk`: sahneRenkleri(...) · `seritler`: hatSeritleriKur(...)
export function hatResimleri(Skia, seritler, bantlar, sinirlar, renk, meta, ekran) {
  const program = Skia.RuntimeEffect.Make(SERIT_SKSL);
  const parca = Skia.Paint();
  const soluk = Skia.Paint();
  const il = Skia.Paint();
  return bantlar.map((bant) =>
    kaydet(Skia, meta, (c) => {
      const gruplar = seritler[bant.seviye] || [];
      const parcaGolgesi = seritGolgesi(program, bant, KALINLIK.parca, renk.parcaSinir, ekran);
      parca.setShader(parcaGolgesi);
      soluk.setShader(parcaGolgesi);
      soluk.setAlphaf(SOLUK_CIZGI);
      for (const g of gruplar) {
        if (g.ilSiniri && sinirlar) continue;
        c.drawVertices(g.koseler, KAYNAK_USTE, g.soluk ? soluk : parca);
      }
      if (sinirlar) {
        il.setShader(seritGolgesi(program, bant, KALINLIK.il, renk.ilSinir, ekran));
        for (const g of gruplar) if (g.ilSiniri) c.drawVertices(g.koseler, KAYNAK_USTE, il);
      }
    })
  );
}

// ======================================================================================
// 6b) SÜSLER — kıyı gölgesi, dağ, tepe, dalga (Görev 20 · Baki, 2026-09-24: "B olsun")
// ======================================================================================
//
// Harita "veri haritası" gibi duruyordu. Eski atlaslardaki gibi: kıyıda denizin koyulaşan
// gölgesi, dağlık bölgede dağ, tepelik bölgede tepe, denizde dalga. Yerleri
// `veri/harita-susleri.json`'da (bir kez hesaplandı), görünüşleri `tema.js HARITA_SUS`.
//
// HIZ (dosya başındaki not): yüzlerce küçük YUMUŞATILMIŞ yol telefonda sınır çizgilerinin
// hatasını tekrar ederdi. O yüzden hepsi sınır çizgisinin yoluyla: çizgiler hazır üçgen
// şeridi + `SERIT_SKSL` (kenarı program yumuşatıyor), yamaçlar yumuşatmasız düz üçgen.
// KIYI GÖLGESİ İSE RESİM: ülke hattının kalın, bulanık bir çizgisi maç başına BİR KEZ küçük
// bir resme çiziliyor ve kamera onu haritayla birlikte büyütüyor (bulanık bir şeyi büyütmek
// onu bozmaz). ⚠ Önce o da şeritti — önizlemede girintili kıyıda YILDIZ gibi dikenler çıktı:
// 6 birimlik geniş şerit sivri köşelerde açıortay boyunca uzuyor, üst üste binen parçalar
// da gölgeyi koyulaştırıyordu (2026-09-24). Resimde tek bir yol, tek bir boyama: taşma yok.
// Bant başına iki resim: ALT (gölge + dalga, dolguların altında — karaya taşan kısmı dolgu
// örtüyor) ve ÜST (dağ + tepe).

const UCGEN = 0; // VertexMode.Triangles

// Dağ: iki tepeli (büyük + küçük). Her tepe bir "Λ" çizgisi + iki yamaç üçgeni.
function dagEkle(x, y, s, hatlar, isik, golge) {
  for (const [dx, oran] of [
    [0, 1],
    [s * 0.95, 0.68],
  ]) {
    const q = s * oran;
    const tx = x + dx,
      ty = y - q * 1.15;
    hatlar.push(
      hatGeometrisi('M' + (tx - q) + ',' + y + 'L' + tx + ',' + ty + 'L' + (tx + q) + ',' + y)
    );
    isik.push({ x: tx, y: ty }, { x: tx - q, y }, { x: tx - q * 0.1, y });
    golge.push({ x: tx, y: ty }, { x: tx + q, y }, { x: tx + q * 0.2, y });
  }
}

// İkinci dereceden eğriyi kısa doğrulara böler (şerit düz parçalardan kuruluyor).
function egriNoktalari(x0, y0, cx, cy, x1, y1, n, dizi) {
  for (let i = dizi.length === 0 ? 0 : 1; i <= n; i++) {
    const t = i / n,
      u = 1 - t;
    dizi.push(u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1);
  }
}
function noktalardanHat(n) {
  let s = 'M' + n[0] + ',' + n[1];
  for (let i = 2; i < n.length; i += 2) s += 'L' + n[i] + ',' + n[i + 1];
  return hatGeometrisi(s);
}

// Tepe: iki yumuşak kubbe (ikincisi birincinin sağında, biraz arkada).
function tepeEkle(x, y, s, hatlar) {
  const a = [];
  egriNoktalari(x - s, y, x - s * 0.5, y - s * 0.9, x, y, 6, a);
  hatlar.push(noktalardanHat(a));
  const b = [];
  egriNoktalari(x - s * 0.2, y - s * 0.1, x + s * 0.4, y - s * 0.8, x + s, y, 6, b);
  hatlar.push(noktalardanHat(b));
}

// Dalga: "~" — biri yukarı, biri aşağı iki yay.
function dalgaEkle(x, y, s, hatlar) {
  const n = [];
  egriNoktalari(x - s, y, x - s * 0.5, y - s * 0.55, x, y, 5, n);
  egriNoktalari(x, y, x + s * 0.5, y + s * 0.55, x + s, y, 5, n);
  hatlar.push(noktalardanHat(n));
}

// Süslerin geometrisi — maç başına (kapsam) bir kez. Kapsam dışı parçanın dağı çizilmez
// (orası zaten soluk). `sus`: harita-susleri.json · `hatYol`: turkiye-hat.json'un `yol`u.
export function susGeometrisiKur(sus, hatYol, kapsam) {
  const arazi = [],
    isik = [],
    golge = [],
    dalga = [];
  const gecer = (pid) => !kapsam || kapsam.has(pid);
  for (const pid of Object.keys(sus.dag)) {
    if (!gecer(pid)) continue;
    const l = sus.dag[pid];
    for (let i = 0; i < l.length; i += 3) dagEkle(l[i], l[i + 1], l[i + 2], arazi, isik, golge);
  }
  for (const pid of Object.keys(sus.tepe)) {
    if (!gecer(pid)) continue;
    const l = sus.tepe[pid];
    for (let i = 0; i < l.length; i += 3) tepeEkle(l[i], l[i + 1], l[i + 2], arazi);
  }
  const d = sus.dalga;
  for (let i = 0; i < d.length; i += 3) dalgaEkle(d[i], d[i + 1], d[i + 2], dalga);
  return { hatYol, arazi, isik, golge, dalga };
}

// Şeritleri tek köşe listesine dizer.
function seritKoseleri(Skia, hatlar, D) {
  if (hatlar.length === 0) return null;
  const T = dokuKoseleri(D);
  const pos = [],
    doku = [];
  for (const h of hatlar) seritYaz(h, D, pos, doku, T);
  return pos.length >= 3 ? Skia.MakeVertices(SERIT, pos, doku) : null;
}

// Şerit programının rengi: program `renk * a` döndürüyor, yani renk ÖNCEDEN çarpılmış
// (premultiplied) olmalı — saydamlık hem RGB'ye hem A'ya.
function carpilmisRenk(Skia, hex, saydam) {
  const r = Skia.Color(hex);
  return [r[0] * saydam, r[1] * saydam, r[2] * saydam, r[3] * saydam];
}

// Kıyı gölgesinin resmi: harita birimi başına HALE_PIKSEL piksel. Gölge zaten yumuşak;
// en yakında büyütülünce de pürüz göstermiyor. Bellek: ~1.2 MB.
const HALE_PIKSEL = 1;
const BULANIK_NORMAL = 0; // BlurStyle.Normal
const MIPMAP_YOK = 0; // MipmapMode.None
function haleResmiKur(Skia, hatYol, meta) {
  const S = HARITA_SUS;
  const pay = S.haleGenislik * 2;
  const W = Math.ceil((meta.genislik + 2 * pay) * HALE_PIKSEL);
  const H = Math.ceil((meta.yukseklik + 2 * pay) * HALE_PIKSEL);
  const yuzey = Skia.Surface.Make(W, H);
  const c = yuzey.getCanvas();
  c.scale(HALE_PIKSEL, HALE_PIKSEL);
  c.translate(pay, pay);
  const b = boya(Skia, CIZGI);
  b.setStrokeWidth(S.haleGenislik);
  b.setColor(Skia.Color(S.hale));
  b.setAlphaf(S.haleSaydam);
  // Yarıçap tuvalin ölçeğiyle birlikte (harita birimi): gölge kıyıdan dışa yumuşakça söner.
  b.setMaskFilter(Skia.MaskFilter.MakeBlur(BULANIK_NORMAL, S.haleGenislik * 0.35, true));
  const yol = Skia.Path.MakeFromSVGString(hatYol);
  if (yol) c.drawPath(yol, b);
  return {
    resim: yuzey.makeImageSnapshot(),
    kaynak: Skia.XYWHRect(0, 0, W, H),
    hedef: Skia.XYWHRect(-pay, -pay, meta.genislik + 2 * pay, meta.yukseklik + 2 * pay),
  };
}

// Bant başına iki resim: { alt: [...], ust: [...] } (ust'te eşik altı bantlar null).
// `geo`: susGeometrisiKur(...)
export function susResimleri(Skia, geo, bantlar, meta, ekran) {
  const S = HARITA_SUS;
  const program = Skia.RuntimeEffect.Make(SERIT_SKSL);
  // Sabit kalınlıklı çizginin (harita birimi) bantlardaki en geniş şeridi.
  const genislik = (w, esik) => {
    let D = 0;
    for (const b of bantlar) if (b.z >= esik) D = Math.max(D, w / 2 + sacakGenisligi(b, ekran));
    return D * 1.05;
  };
  const hale = haleResmiKur(Skia, geo.hatYol, meta);
  const araziKose = seritKoseleri(Skia, geo.arazi, genislik(S.cizgi, S.araziEsigi));
  const dalgaKose = seritKoseleri(Skia, geo.dalga, genislik(S.dalgaCizgi, S.dalgaEsigi));
  const isikKose = geo.isik.length ? Skia.MakeVertices(UCGEN, geo.isik) : null;
  const golgeKose = geo.golge.length ? Skia.MakeVertices(UCGEN, geo.golge) : null;

  const murekkep = carpilmisRenk(Skia, S.murekkep, S.murekkepSaydam);
  const dalgaRenk = carpilmisRenk(Skia, S.dalga, S.dalgaSaydam);
  const haleBoya = Skia.Paint();
  const cizgi = Skia.Paint();
  const yamacIsik = boya(Skia, DOLGU, false);
  yamacIsik.setColor(Skia.Color(S.isik));
  yamacIsik.setAlphaf(S.isikSaydam);
  const yamacGolge = boya(Skia, DOLGU, false);
  yamacGolge.setColor(Skia.Color(S.murekkep));
  yamacGolge.setAlphaf(S.golgeSaydam);

  const alt = bantlar.map((bant) =>
    kaydet(Skia, meta, (c) => {
      c.drawImageRectOptions(hale.resim, hale.kaynak, hale.hedef, DOGRUSAL, MIPMAP_YOK, haleBoya);
      if (dalgaKose && bant.z >= S.dalgaEsigi) {
        cizgi.setShader(
          program.makeShader([S.dalgaCizgi / 2, sacakGenisligi(bant, ekran), ...dalgaRenk])
        );
        c.drawVertices(dalgaKose, KAYNAK_USTE, cizgi);
      }
    })
  );
  const ust = bantlar.map((bant) =>
    bant.z >= S.araziEsigi && (araziKose || isikKose)
      ? kaydet(Skia, meta, (c) => {
          if (isikKose) c.drawVertices(isikKose, KAYNAK_USTE, yamacIsik);
          if (golgeKose) c.drawVertices(golgeKose, KAYNAK_USTE, yamacGolge);
          if (araziKose) {
            cizgi.setShader(
              program.makeShader([S.cizgi / 2, sacakGenisligi(bant, ekran), ...murekkep])
            );
            c.drawVertices(araziKose, KAYNAK_USTE, cizgi);
          }
        })
      : null
  );
  return { alt, ust };
}

// ======================================================================================
// 6c) NEHİRLER VE GÖLLER (Görev 21 · H8) — maç başına bir kez
// ======================================================================================
//
// Veri `veri/harita-nehirler.json` (Natural Earth 10m, `scripts/harita-nehir-uret.js`).
// Göl: yumuşatmasız dolgu (göl suyu, `tema.js NEHIR.gol`). Göller parçalardan OYULMUŞ
// (`scripts/parca-gol-oy.js`): kıyısını sınır çizgileri çiziyor, burada yalnızca su. Nehir: sınır çizgileriyle aynı
// şerit yöntemi; büyük nehir kalın, küçük ince, ikisi de yakınlaştıkça yavaş kalınlaşıyor
// (`kalinlikCarpani`). Bant başına bir resim; karede tek çağrı (dolguların üstünde, dağların
// ve sınırların altında).

// Veri → şerit geometrisi (bir kez). `{ buyuk, kucuk, golYol }`
export function nehirGeometrisiKur(veri) {
  const cizgi = (n) => {
    let d = 'M' + n[0] + ',' + n[1];
    for (let i = 2; i < n.length; i += 2) d += 'L' + n[i] + ',' + n[i + 1];
    return d;
  };
  const buyuk = [],
    kucuk = [];
  let golYol = '';
  for (const r of (veri && veri.nehirler) || []) {
    if (r.n.length < 4) continue;
    (r.rank <= 5 ? buyuk : kucuk).push(hatGeometrisi(cizgi(r.n)));
  }
  for (const g of (veri && veri.goller) || []) {
    for (const h of g.halkalar) {
      if (h.length < 6) continue;
      golYol += cizgi(h) + 'Z';
    }
  }
  return { buyuk, kucuk, golYol };
}

export function nehirResimleri(Skia, geo, bantlar, meta, ekran) {
  if (!geo || (!geo.buyuk.length && !geo.kucuk.length && !geo.golYol)) return null;
  const N = NEHIR;
  const program = Skia.RuntimeEffect.Make(SERIT_SKSL);
  // Yakınlaştıkça yavaş kalınlaşan çizginin bantlardaki en geniş şeridi.
  const genislik = (w) => {
    let D = 0;
    for (const b of bantlar)
      D = Math.max(D, (w * kalinlikCarpani(b)) / 2 + sacakGenisligi(b, ekran));
    return D * 1.05;
  };
  const buyukKose = seritKoseleri(Skia, geo.buyuk, genislik(N.buyuk));
  const kucukKose = seritKoseleri(Skia, geo.kucuk, genislik(N.kucuk));
  const golYolu = geo.golYol ? Skia.Path.MakeFromSVGString(geo.golYol) : null;
  if (golYolu) golYolu.setFillType(CIFT_TEK);

  const su = carpilmisRenk(Skia, N.renk, N.saydam);
  const golBoya = boya(Skia, DOLGU, DOLGU_YUMUSAK);
  golBoya.setColor(Skia.Color(N.gol));
  const cizgi = Skia.Paint();
  const serit = (c, kose, w, renk, bant) => {
    if (!kose) return;
    cizgi.setShader(
      program.makeShader([(w * kalinlikCarpani(bant)) / 2, sacakGenisligi(bant, ekran), ...renk])
    );
    c.drawVertices(kose, KAYNAK_USTE, cizgi);
  };
  return bantlar.map((bant) =>
    kaydet(Skia, meta, (c) => {
      if (golYolu) c.drawPath(golYolu, golBoya);
      serit(c, kucukKose, N.kucuk, su, bant);
      serit(c, buyukKose, N.buyuk, su, bant);
    })
  );
}

// ======================================================================================
// 7) VURGU — seçim değişince
// ======================================================================================

// Parçanın o seviyedeki halkaları (şerit geometrisi) — ilk seçildiğinde okunur, saklanır.
function parcaHalkalari(kaynak, seviye, pid) {
  const anahtar = seviye + '|' + pid;
  let h = kaynak.halkalar.get(anahtar);
  if (!h) {
    h = dolguYolu(kaynak.veri, seviye, pid)
      .split('M')
      .filter((x) => x.length > 0)
      .map((x) => hatGeometrisi('M' + x));
    kaynak.halkalar.set(anahtar, h);
  }
  return h;
}

// Seçim vurgusu + hedef kipi + emir okları, BANT başına bir resim. Kural eski haritanın
// `vurguEl` / `emirEl`'iyle BİREBİR aynı. Hiçbir şey yoksa null (karede hiç iş yok).
//
// Çizgiler sınır çizgileriyle AYNI şerit yöntemiyle (yumuşatılmış yol çizgisi olarak seçili
// parça + komşular, bütün haritanın çizgilerinden pahalıydı: ölçümde ~5 ms). Şerit SEVİYE
// başına kurulur, o seviyenin geometrisiyle ve o seviyenin bantlarına yetecek genişlikte:
// bütün yakınlıklara yetecek TEK geniş şerit, kısa parçalarda kendi üstüne katlanıp çizgiyi
// diken diken yapıyordu (önizleme, 2026-09-23 — sınır çizgilerinin şeridi zaten seviye
// başına olduğu için onlarda yoktu). Oklar harita ile birlikte büyüyen şekiller: tek resim,
// her bandın içine gömülü.
// `v`: { secili, komsular, hedefler (Set|null), hedefSaldiri (Set|null), kipSaldiri,
//        hedefSecili ({ pid, renk }|null), oklar, kapsam }
// Doğrudan hamle (Görev 20 / Adım 5): hedefler iki renkte — `hedefSaldiri`dakiler saldırı
// kırmızısı, kalanı (kendi toprağın) pirinç. `hedefSaldiri` yoksa eski tek renk kuralı
// (`kipSaldiri`). `hedefSecili`: ikinci dokunuşu bekleyen hedef, tahminin renginde.
export function vurguResimleri(Skia, kaynak, v, bantlar, meta, ekran) {
  const hedefVar = v.hedefler && v.hedefler.size > 0;
  const okVar = v.oklar && v.oklar.length > 0;
  // Komşular kancadan `Set` olarak geliyor; dizi de kabul (ikisinde de boşluk sınanır).
  const komsuVar = v.komsular && (v.komsular.size || v.komsular.length) > 0;
  if (!v.secili && !hedefVar && !komsuVar && !okVar && !v.hedefSecili) return null;

  const renk = renkOnbellegi(Skia);
  // Aynı renk ve kalınlıktaki parçalar tek şerit grubu (tek çağrı).
  const gruplar = new Map();
  const dolgulu = [];
  const ekle = (pid, hex, kalinlik, dolguHex, dolguSaydam = HEDEF_DOLGU) => {
    if (!kaynak.veri.halkalar[pid]) return;
    if (v.kapsam && !v.kapsam.has(pid)) return; // kapsam dışı parça vurgulanmaz
    const anahtar = hex + '|' + kalinlik;
    let g = gruplar.get(anahtar);
    if (!g) gruplar.set(anahtar, (g = { renk: renk(hex), kalinlik, pidler: [] }));
    g.pidler.push(pid);
    if (dolguHex) dolgulu.push({ pid, renk: renk(dolguHex), saydam: dolguSaydam });
  };
  const seciliHedef = v.hedefSecili && v.hedefSecili.pid;
  if (hedefVar) {
    for (const pid of v.hedefler) {
      if (pid === seciliHedef) continue; // aşağıda kendi rengiyle
      const saldiri = v.hedefSaldiri ? v.hedefSaldiri.has(pid) : v.kipSaldiri;
      const hex = saldiri ? RENK.okSaldiri : RENK.hedef;
      ekle(pid, hex, KALINLIK.hedef, hex);
    }
  } else if (komsuVar) {
    for (const pid of v.komsular) ekle(pid, RENK.komsuSinir, KALINLIK.komsu);
  }
  if (v.secili) ekle(v.secili, hedefVar ? RENK.kaynak : RENK.secSinir, KALINLIK.secim);
  if (seciliHedef)
    ekle(
      seciliHedef,
      RENK.hudMetin,
      SECILI_HEDEF_KALINLIK,
      v.hedefSecili.renk || RENK.hedef,
      SECILI_HEDEF_DOLGU
    );

  // Seviye başına şeritler: yalnızca bantların kullandığı seviyeler.
  let enKalin = 0;
  for (const g of gruplar.values()) enKalin = Math.max(enKalin, g.kalinlik);
  const seviyeSeritleri = new Map();
  for (const seviye of new Set(bantlar.map((b) => b.seviye))) {
    const D = seritGenisligi(
      bantlar.filter((b) => b.seviye === seviye),
      enKalin,
      ekran
    );
    const T = dokuKoseleri(D);
    const liste = [];
    for (const g of gruplar.values()) {
      const pos = [],
        doku = [];
      for (const pid of g.pidler) {
        for (const h of parcaHalkalari(kaynak, seviye, pid)) seritYaz(h, D, pos, doku, T);
      }
      if (pos.length >= 3) liste.push({ g, koseler: Skia.MakeVertices(SERIT, pos, doku) });
    }
    seviyeSeritleri.set(seviye, liste);
  }

  const oklar = okVar ? okResmi(Skia, v.oklar, meta) : null;
  const program = gruplar.size > 0 ? Skia.RuntimeEffect.Make(SERIT_SKSL) : null;
  // Hedef dolgusu yumuşatmasız ve dolgu resimleriyle aynı seviyeden: kenarı hedef
  // çizgisinin altında.
  const dolgu = boya(Skia, DOLGU, DOLGU_YUMUSAK);
  const cizgi = Skia.Paint();
  return bantlar.map((bant) =>
    kaydet(Skia, meta, (c) => {
      const yollar = kaynak.seviyeler[bant.seviye].dolgular;
      for (const d of dolgulu) {
        if (!yollar[d.pid]) continue;
        dolgu.setColor(d.renk);
        dolgu.setAlphaf(d.saydam);
        c.drawPath(yollar[d.pid], dolgu);
      }
      for (const s of seviyeSeritleri.get(bant.seviye) || []) {
        cizgi.setShader(seritGolgesi(program, bant, s.g.kalinlik, s.g.renk, ekran));
        c.drawVertices(s.koseler, KAYNAK_USTE, cizgi);
      }
      if (oklar) c.drawPicture(oklar);
    })
  );
}

function okResmi(Skia, liste, meta) {
  const dolgu = boya(Skia, DOLGU);
  const cizgi = boya(Skia, CIZGI);
  return kaydet(Skia, meta, (c) => {
    for (const o of liste) {
      const dx = o.x2 - o.x1,
        dy = o.y2 - o.y1;
      const uz = Math.hypot(dx, dy) || 1;
      const bx = dx / uz,
        by = dy / uz;
      const ux = o.x2 - bx * OK_GERI,
        uy = o.y2 - by * OK_GERI;
      const ax = ux - bx * OK_BOY,
        ay = uy - by * OK_BOY;
      const renk = Skia.Color(o.saldiri ? RENK.okSaldiri : RENK.okTakviye);
      cizgi.setColor(renk);
      cizgi.setStrokeWidth(KALINLIK.ok);
      c.drawLine(o.x1, o.y1, ax, ay, cizgi);
      const bas = Skia.Path.MakeFromSVGString(
        'M' +
          ux +
          ',' +
          uy +
          'L' +
          (ax - by * OK_EN) +
          ',' +
          (ay + bx * OK_EN) +
          'L' +
          (ax + by * OK_EN) +
          ',' +
          (ay - bx * OK_EN) +
          'Z'
      );
      if (bas) {
        dolgu.setColor(renk);
        c.drawPath(bas, dolgu);
      }
    }
  });
}

// ======================================================================================
// 7b) CEPHE HATTI (Görev 21 · H4) — sahiplik ya da savaş değişince
// ======================================================================================
//
// Savaştığın devletle ortak sınır: kırmızı çizgi (sınır çizgileriyle AYNI şerit yöntemi) +
// düşmana bakan küçük dişler (resim sayfasındaki `dis` hücresi, döndürülerek; bütün dişler
// TEK çağrı). Bant başına bir resim, çünkü çizgi ve diş yakınlaştıkça yavaş kalınlaşıyor
// (`kalinlikCarpani`) — dişlerin arası da aynı oranda, yani ekranda dişler hep aynı sıklıkta.

// Hattın hangi yanı `a` parçası: hattın en uzun parçasının ortasından sağ-dik yöne küçük bir
// adım atıp o noktanın `a`'nın İÇİNDE olup olmadığına bakılır (en ince seviyenin dolgusuyla).
// Dönen +1: (−ty, tx) yönü a'ya bakıyor · −1: tersi. Sahiplikten bağımsız, hat başına bir kez.
function hatYonu(kaynak, hat) {
  if (!kaynak.hatYonleri) kaynak.hatYonleri = new Map();
  let y = kaynak.hatYonleri.get(hat);
  if (y !== undefined) return y;
  const ince = kaynak.hatlar.length - 1;
  const g = kaynak.hatlar[ince][hat];
  const a = kaynak.veri.hatSahipleri[hat][0];
  const yol = kaynak.seviyeler[ince].dolgular[a];
  y = 1;
  if (g && g.m >= 2 && yol) {
    let enUzun = -1,
      j = 0;
    for (let i = 0; i < g.m - 1; i++) {
      const l = Math.hypot(g.xy[2 * i + 2] - g.xy[2 * i], g.xy[2 * i + 3] - g.xy[2 * i + 1]);
      if (l > enUzun) {
        enUzun = l;
        j = i;
      }
    }
    const tx = (g.xy[2 * j + 2] - g.xy[2 * j]) / (enUzun || 1),
      ty = (g.xy[2 * j + 3] - g.xy[2 * j + 1]) / (enUzun || 1);
    const mx = (g.xy[2 * j] + g.xy[2 * j + 2]) / 2,
      my = (g.xy[2 * j + 1] + g.xy[2 * j + 3]) / 2;
    const adim = Math.min(0.3, enUzun / 4);
    y = yol.contains(mx - ty * adim, my + tx * adim) ? 1 : -1;
  }
  kaynak.hatYonleri.set(hat, y);
  return y;
}

// Bir hattın boyunca dişler: her `aralik` birimde bir diş, uçlara yarım aralık pay.
// `yon`: +1 dişler (−ty, tx) yönüne, −1 tersine. `pay`: dişin tabanının çizginin ortasından
// uzaklığı (çizginin kenarı).
function disleriYaz(g, aralik, yon, pay, olcek, atlas, kutular, donusumler) {
  if (!g || g.m < 2) return;
  let toplam = 0;
  for (let i = 0; i < g.m - 1; i++)
    toplam += Math.hypot(g.xy[2 * i + 2] - g.xy[2 * i], g.xy[2 * i + 3] - g.xy[2 * i + 1]);
  const n = Math.floor(toplam / aralik);
  if (n < 1) return;
  // Dişleri hattın ortasına topla: artan uzunluk iki uca eşit bölünsün.
  let hedef = (toplam - (n - 1) * aralik) / 2;
  let gidilen = 0;
  for (let i = 0; i < g.m - 1 && hedef <= toplam; i++) {
    const x0 = g.xy[2 * i],
      y0 = g.xy[2 * i + 1];
    const dx = g.xy[2 * i + 2] - x0,
      dy = g.xy[2 * i + 3] - y0;
    const l = Math.hypot(dx, dy);
    while (l > 0 && hedef <= gidilen + l) {
      const t = (hedef - gidilen) / l;
      const ex = (-dy / l) * yon,
        ey = (dx / l) * yon;
      kutular.push(atlas.dis.hucre);
      donusumler.push(
        merkezDonusumu(
          atlas.dis,
          x0 + dx * t + ex * pay,
          y0 + dy * t + ey * pay,
          olcek,
          Math.atan2(ex, -ey)
        )
      );
      hedef += aralik;
    }
    gidilen += l;
  }
}

// `cephe`: haritaSeviye.js cepheHatlari(...) · `atlas`: rozetAtlasiKur(...) (dişler için).
// Cephe yoksa null (karede hiç iş yok).
export function cepheResimleri(Skia, kaynak, cephe, bantlar, atlas, meta, ekran) {
  if (!cephe || cephe.length === 0) return null;
  const program = Skia.RuntimeEffect.Make(SERIT_SKSL);
  const renk = Skia.Color(CEPHE.renk);
  // Seviye başına şerit: yalnızca bantların kullandığı seviyeler.
  const seritler = new Map();
  for (const seviye of new Set(bantlar.map((b) => b.seviye))) {
    const D = seritGenisligi(
      bantlar.filter((b) => b.seviye === seviye),
      CEPHE.kalinlik,
      ekran
    );
    const T = dokuKoseleri(D);
    const pos = [],
      doku = [];
    for (const c of cephe) seritYaz(kaynak.hatlar[seviye][c.hat], D, pos, doku, T);
    seritler.set(seviye, pos.length >= 3 ? Skia.MakeVertices(SERIT, pos, doku) : null);
  }
  // Dişin yönü: hattın düşman yakası. `hatYonu` a yakasını söylüyor.
  const yonler = cephe.map((c) => (c.ben === 'a' ? -1 : 1) * hatYonu(kaynak, c.hat));
  const cizgi = Skia.Paint();
  const disBoya = Skia.Paint();
  const disRenk = renk;
  return bantlar.map((bant) =>
    kaydet(Skia, meta, (c) => {
      const s = seritler.get(bant.seviye);
      if (s) {
        cizgi.setShader(seritGolgesi(program, bant, CEPHE.kalinlik, renk, ekran));
        c.drawVertices(s, KAYNAK_USTE, cizgi);
      }
      if (!CEPHE.disli || !atlas || !atlas.dis) return;
      const carpan = kalinlikCarpani(bant);
      // Diş hücresinin tabanı 10 birim: taban CEPHE.disEn olsun (harita birimi, bu bantta).
      const olcek = (CEPHE.disEn * carpan) / (10 * atlas.olcek);
      const pay = (CEPHE.kalinlik * carpan) / 2 - 0.2 * carpan;
      const kutular = [],
        donusumler = [];
      cephe.forEach((cp, i) =>
        disleriYaz(
          kaynak.hatlar[bant.seviye][cp.hat],
          CEPHE.disAralik * carpan,
          yonler[i],
          pay,
          olcek,
          atlas,
          kutular,
          donusumler
        )
      );
      if (kutular.length > 0)
        c.drawAtlas(
          atlas.resim,
          kutular,
          donusumler,
          disBoya,
          CARP,
          kutular.map(() => disRenk),
          { filter: DOGRUSAL, mipmap: DOGRUSAL_KADEME }
        );
    })
  );
}

// ======================================================================================
// 8) ROZETLER — hazır resim sayfası (atlas) + her katman tek çağrı
// ======================================================================================
//
// Rozetin parçaları (kalkan, kontur halkası, komutan halkası, parlaklık, yıpranma çentiği,
// rakamlar) bir kez BEYAZ olarak bir resim sayfasına çizilir. Her rozet bu parçaları
// kendi renginde üst üste basar (`CARP`: beyaz × renk = renk). Sayfa büyük çizilir
// (`ATLAS_PX`) ve küçülürken kademeli süzülür: rozet her yakınlıkta keskin kalır.
// Bir katmanın bütün rozetleri TEK `drawAtlas` çağrısı — ekran kartında bir iş.

// Kutu biriminin sayfadaki piksel karşılığı. En büyük rozet ekranda ~67 dp (parça, 7×);
// 2.6 yoğunlukta ~175 piksel. 26'lık kalkan 8 ile 208 piksel: hep küçülerek basılır.
const ATLAS_PX = 8;
// Kalkan hücresi (kutu birimi): 26'lık kalkan + kontur ve gölge payı; hücrenin sol üst
// köşesi kutunun (-2, -2) noktası.
const HUCRE = 30;
const HUCRE_KAY = -2;
// Rakam hücresinin kenar payı (kutu birimi, 13 puntoda).
const RAKAM_PAY = 1;
const RAKAMLAR = '0123456789+';

// Resim sayfasını kurar (yazı tipi yüklenince, bir kez). Yazı tipi yoksa rakamsız sayfa.
// Dönen: { resim, olcek, kalkan, kontur, komutan, parlaklik, yipranma, figur, rakam: {ch: …},
//          yukselis, inis, dilim, dilimYatak, dis, daire, figurKontur }
// — hücreler sayfa pikselinde {x, y, width, height}. Görev 21'in parçaları (halka dilimi,
// cephe dişi, daire, figür konturu) üçüncü sırada: her biri { hucre, merkez } —
// `merkez` dönme/ölçek noktası (sayfa pikseli, hücre köşesine göre).
// ⚠ Sayfa 4096 pikseli geçmemeli: bazı telefonların ekran kartı daha büyük resmi açmıyor.
export function rozetAtlasiKur(Skia, font, sekil) {
  const P = ATLAS_PX;
  const hucrePx = HUCRE * P;
  const m = font ? font.getMetrics() : { ascent: -12, descent: 3 };
  const rakamY = (m.descent - m.ascent + 2 * RAKAM_PAY) * P;
  const rakamlar = font ? RAKAMLAR.split('') : [];
  const genislikler = rakamlar.map((ch) => font.getTextWidth(ch));
  const rakamToplam = genislikler.reduce((a, g) => a + (g + 2 * RAKAM_PAY) * P, 0);
  // Figür hücreleri kalkan hücrelerinin sağında (24'lük figür kutusu, aynı piksel yoğunluğu).
  const figurPx = BIRIM_KUTU * P;

  // ---- ÜÇÜNCÜ SIRA (Görev 21): önce ölçüler, sonra çizim ----
  // Halka dilimi: halkanın merkezi (0, 0), dilim tepede (−90°). Hücre dilimin sınır kutusu.
  const R = HALKA.YARICAP;
  const yay = 360 / HALKA.DILIM - HALKA.ARALIK;
  const dilimKutusu = (kalinlik) => {
    const t = kalinlik / 2;
    const yarim = ((yay / 2) * Math.PI) / 180;
    const w = (R + t) * Math.sin(yarim) + t + 0.5;
    const ust = -(R + t) - 0.5;
    const alt = -(R - t) * Math.cos(yarim) + t + 0.5;
    return { g: 2 * w, y: alt - ust, ox: w, oy: -ust }; // o*: halka merkezinin hücredeki yeri
  };
  const ucuncu = [
    ['dilim', dilimKutusu(HALKA.KALINLIK)],
    ['dilimYatak', dilimKutusu(HALKA.YATAK)],
    // Diş: taban (−5, 0)…(5, 0), uç (0, −7) — yukarı bakıyor; merkez tabanın ortası.
    ['dis', { g: 12, y: 9, ox: 6, oy: 8 }],
    // Daire (figür sayısının balonu): yarıçap 10, merkez ortada.
    ['daire', { g: 24, y: 24, ox: 12, oy: 12 }],
    // Figür konturu: 24'lük figür kutusu + çizgi payı; merkez figür kutusunun sol üstü.
    ...BIRIM_SIRASI.map((tur) => [
      'figurKontur:' + tur,
      { g: BIRIM_KUTU + 4, y: BIRIM_KUTU + 4, ox: 2, oy: 2 },
    ]),
  ];
  const ucuncuY = hucrePx + rakamY;
  let ucuncuX = 0,
    ucuncuH = 0;
  const yerler = {};
  for (const [ad, k] of ucuncu) {
    const w = Math.ceil(k.g * P),
      h = Math.ceil(k.y * P);
    yerler[ad] = {
      hucre: { x: ucuncuX, y: ucuncuY, width: w, height: h },
      merkez: { x: k.ox * P, y: k.oy * P },
    };
    ucuncuX += w + 2; // hücreler arası boş piksel: süzme komşu hücreden renk sızdırmasın
    ucuncuH = Math.max(ucuncuH, h);
  }

  const W = Math.ceil(Math.max(5 * hucrePx + BIRIM_SIRASI.length * figurPx, rakamToplam, ucuncuX));
  const H = Math.ceil(ucuncuY + ucuncuH);

  const yuzey = Skia.Surface.Make(W, H);
  const c = yuzey.getCanvas();
  const beyaz = Skia.Color(ROZET_MASKE);
  const dolgu = Skia.Paint();
  dolgu.setAntiAlias(true);
  dolgu.setColor(beyaz);
  const halka = Skia.Paint();
  halka.setAntiAlias(true);
  halka.setStyle(CIZGI);
  halka.setStrokeJoin(YUVARLAK);
  halka.setColor(beyaz);

  const hucre = (i) => ({ x: i * hucrePx, y: 0, width: hucrePx, height: hucrePx });
  const ciz = (i, fn) => {
    c.save();
    c.translate(i * hucrePx, 0);
    c.scale(P, P);
    c.translate(-HUCRE_KAY, -HUCRE_KAY);
    fn();
    c.restore();
  };
  ciz(0, () => c.drawPath(sekil.kalkan, dolgu));
  ciz(1, () => {
    halka.setStrokeWidth(KONTUR);
    c.drawPath(sekil.kalkan, halka);
  });
  ciz(2, () => {
    halka.setStrokeWidth(KOMUTAN_KONTUR);
    c.drawPath(sekil.kalkan, halka);
  });
  ciz(3, () => c.drawPath(sekil.parlaklik, dolgu));
  ciz(4, () => c.drawPath(sekil.yipranma, dolgu));

  // Birim figürleri (kadro şeridi): her figür kendi parçalarından, beyaz.
  const figur = {};
  const figurYollari = {};
  BIRIM_SIRASI.forEach((tur, j) => {
    const x = 5 * hucrePx + j * figurPx;
    figurYollari[tur] = BIRIM_SEKLI[tur].map((d) => Skia.Path.MakeFromSVGString(d)).filter(Boolean);
    c.save();
    c.translate(x, 0);
    c.scale(P, P);
    for (const yol of figurYollari[tur]) c.drawPath(yol, dolgu);
    c.restore();
    figur[tur] = { x, y: 0, width: figurPx, height: figurPx };
  });

  const rakam = {};
  let x = 0;
  rakamlar.forEach((ch, i) => {
    const g = genislikler[i];
    const w = (g + 2 * RAKAM_PAY) * P;
    c.save();
    c.translate(x, hucrePx);
    c.scale(P, P);
    c.drawText(ch, RAKAM_PAY, RAKAM_PAY - m.ascent, dolgu, font);
    c.restore();
    rakam[ch] = { hucre: { x, y: hucrePx, width: w, height: rakamY }, ilerleme: g };
    x += w;
  });

  // ---- Üçüncü sıra: `fn` hücrenin kendi biriminde çizer (merkez = (0, 0)) ----
  const ucuncuCiz = (ad, fn) => {
    const y = yerler[ad];
    c.save();
    c.translate(y.hucre.x + y.merkez.x, y.hucre.y + y.merkez.y);
    c.scale(P, P);
    fn();
    c.restore();
  };
  const dilimBoya = Skia.Paint();
  dilimBoya.setAntiAlias(true);
  dilimBoya.setStyle(CIZGI);
  dilimBoya.setColor(beyaz);
  const dilimYolu = Skia.Path.Make();
  dilimYolu.addArc(Skia.XYWHRect(-R, -R, 2 * R, 2 * R), -90 - yay / 2, yay);
  ucuncuCiz('dilim', () => {
    dilimBoya.setStrokeWidth(HALKA.KALINLIK);
    c.drawPath(dilimYolu, dilimBoya);
  });
  ucuncuCiz('dilimYatak', () => {
    // Yatak yuvarlak uçlu: yanan dilimin iki ucunu da sarsın.
    dilimBoya.setStrokeWidth(HALKA.YATAK);
    dilimBoya.setStrokeCap(YUVARLAK);
    c.drawPath(dilimYolu, dilimBoya);
  });
  const disYolu = Skia.Path.MakeFromSVGString('M-5 0 L0 -7 L5 0 Z');
  ucuncuCiz('dis', () => disYolu && c.drawPath(disYolu, dolgu));
  ucuncuCiz('daire', () => c.drawCircle(0, 0, 10, dolgu));
  // Figür konturu: her parça kalın çizgiyle VE dolu — birleşimin çevresinde tek kontur.
  BIRIM_SIRASI.forEach((tur) => {
    ucuncuCiz('figurKontur:' + tur, () => {
      halka.setStrokeWidth(3.2);
      for (const yol of figurYollari[tur]) {
        c.drawPath(yol, halka);
        c.drawPath(yol, dolgu);
      }
    });
  });
  const figurKontur = {};
  for (const tur of BIRIM_SIRASI) figurKontur[tur] = yerler['figurKontur:' + tur];

  return {
    resim: yuzey.makeImageSnapshot(),
    olcek: P,
    kalkan: hucre(0),
    kontur: hucre(1),
    komutan: hucre(2),
    parlaklik: hucre(3),
    yipranma: hucre(4),
    figur,
    rakam,
    yukselis: m.ascent,
    inis: m.descent,
    dilim: yerler.dilim,
    dilimYatak: yerler.dilimYatak,
    dis: yerler.dis,
    daire: yerler.daire,
    figurKontur,
  };
}

// Üçüncü sıradaki bir hücrenin `merkez` noktası dünyada (wx, wy)'ye düşsün. `o`: dünya
// birimi / sayfa pikseli · `aci`: radyan (saat yönünde). drawAtlas'ın dönüşümü hücrenin sol
// üst köşesine göre olduğu için öteleme dönmüş merkezden geri hesaplanıyor.
function merkezDonusumu(yer, wx, wy, o, aci) {
  const sc = o * Math.cos(aci),
    ss = o * Math.sin(aci);
  const mx = yer.merkez.x,
    my = yer.merkez.y;
  return { scos: sc, ssin: ss, tx: wx - (sc * mx - ss * my), ty: wy - (ss * mx + sc * my) };
}

// Rozetin ekrandaki boyu: eşik yakınlıkta CAP, sonra harita ile AYNI oranda (sınır yok —
// rozet haritanın parçası). Dokunma testi de bunu kullanıyor (`HaritaSkia.js hitSelect`).
export function rozetBoyutu(z, esik, ayar) {
  return (ayar.CAP * z) / esik;
}

// Rozetin HARİTA BİRİMİNDEKİ boyu: ekrandaki boy / (f·z) = CAP / (eşik·f) — yakınlıktan
// bağımsız. Kamera onu haritayla birlikte büyüttüğünde ekranda tam `rozetBoyutu` çıkıyor.
export function rozetDunyaBoyu(esik, f, ayar) {
  return ayar.CAP / (esik * f);
}

// Rozet katmanının resmi (il ya da parça), harita biriminde. Görünüş Rozet.js'teki
// katmanların aynısı: gölge · sahibin rengi · kontur (komutanda pirinç) · parlaklık ·
// yıpranma çentiği · sayı. Görev 21 (hamle hakkı, yalnızca oyuncunun orduları):
//   hak > 0  → kalkanın çevresinde halkanın KOYU YATAĞI (bütün dilimler); yanan dilimler
//              ayrı bir katmanda, her karede nefesle (`halkaVerisi`, `sahneyiCiz`)
//   hak = 0  → kalkanın üstüne açık bir tül: hakkı bitti, ama okunur kalıyor
//   `liste`: kancanın rozet listesi (`ilRozetleri` / `parcaRozetleri`)
//   `boy`:   rozetDunyaBoyu(...) · `atlas`: rozetAtlasiKur(...) · `renk`: sahneRenkleri(...)
export function rozetResmi(Skia, liste, boy, atlas, renk, ayar, meta) {
  if (!liste || liste.length === 0) return null;
  const olcek = boy / KUTU; // harita birimi / kutu birimi
  // Kaydırma pikselleri (rozetKaydirma.js) CAP boyundaki rozet için seçildi; rozet
  // büyüdükçe kaydırma da büyür, yani rozet her yakınlıkta aynı boşluğa düşer.
  const kay = boy / ayar.CAP;
  const renkAl = renkOnbellegi(Skia);
  const golge = saydamRenk(renk.golge, GOLGE);
  const parlak = saydamRenk(renk.pirinc, 0.5);
  const yatak = saydamRenk(renkAl(HAMLE_HAKKI.yatak), HAMLE_HAKKI.yatakSaydam);
  const tul = saydamRenk(renkAl(HAMLE_HAKKI.soluk), HAMLE_HAKKI.solukSaydam);
  const sayfaOlcek = olcek / atlas.olcek; // harita birimi / sayfa pikseli

  const kutular = [];
  const donusumler = [];
  const renkler = [];
  // Hücrenin sol üst köşesi kutu biriminde (ux, uy), ölçek `o` (kutu birimi başına).
  const bas = (h, bx, by, ux, uy, o, r) => {
    kutular.push(h);
    donusumler.push({
      scos: (olcek * o) / atlas.olcek,
      ssin: 0,
      tx: bx + ux * olcek,
      ty: by + uy * olcek,
    });
    renkler.push(r);
  };

  const baglar = [];
  for (const r of liste) {
    const dx = (r.dx || 0) * kay,
      dy = (r.dy || 0) * kay;
    const cx = r.x + dx,
      cy = r.y + dy;
    if (dx !== 0 || dy !== 0) baglar.push([r.x, r.y, cx, cy]);
    // Kutunun sol üst köşesi (harita birimi).
    const bx = cx - (KUTU / 2) * olcek,
      by = cy - (KUTU / 2) * olcek;
    const kontur = r.komutan ? renk.pirinc : renk.kontur;
    if (r.hak > 0 && atlas.dilimYatak) {
      const mx = bx + HALKA.MERKEZ_X * olcek,
        my = by + HALKA.MERKEZ_Y * olcek;
      for (let k = 0; k < HALKA.DILIM; k++) {
        kutular.push(atlas.dilimYatak.hucre);
        donusumler.push(merkezDonusumu(atlas.dilimYatak, mx, my, sayfaOlcek, dilimAcisi(k)));
        renkler.push(yatak);
      }
    }
    bas(atlas.kalkan, bx, by, HUCRE_KAY, HUCRE_KAY + GOLGE_KAYMA, 1, golge);
    bas(atlas.kalkan, bx, by, HUCRE_KAY, HUCRE_KAY, 1, renkAl(r.renk));
    bas(r.komutan ? atlas.komutan : atlas.kontur, bx, by, HUCRE_KAY, HUCRE_KAY, 1, kontur);
    bas(atlas.parlaklik, bx, by, HUCRE_KAY, HUCRE_KAY, 1, parlak);
    if (r.yipranmis) bas(atlas.yipranma, bx, by, HUCRE_KAY, HUCRE_KAY, 1, renk.kirmizi);

    // Sayı: rakam rakam, ortalanmış (Rozet.js: iki haneye kadar 13, "99+" 10 punto).
    const harfler = r.yazi.split('').filter((ch) => atlas.rakam[ch]);
    if (harfler.length > 0) {
      const kucuk = r.yazi.length > 2;
      const yo = kucuk ? YAZI_KUCUK / YAZI_BUYUK : 1;
      const genislik = harfler.reduce((a, ch) => a + atlas.rakam[ch].ilerleme, 0) * yo;
      const taban =
        (kucuk ? YAZI_MERKEZ_KUCUK : YAZI_MERKEZ) - (yo * (atlas.yukselis + atlas.inis)) / 2;
      const yaziRengi = renkAl(okunakliMetin(r.renk));
      let kalem = KUTU / 2 - genislik / 2;
      for (const ch of harfler) {
        const g = atlas.rakam[ch];
        bas(
          g.hucre,
          bx,
          by,
          kalem - yo * RAKAM_PAY,
          taban + yo * (atlas.yukselis - RAKAM_PAY),
          yo,
          yaziRengi
        );
        kalem += g.ilerleme * yo;
      }
    }
    // Hakkı biten ordu: bütün kalkanın (sayı dahil) üstüne açık tül.
    if (r.hak === 0) bas(atlas.kalkan, bx, by, HUCRE_KAY, HUCRE_KAY, 1, tul);
  }

  return kaydet(Skia, meta, (c) => {
    if (baglar.length > 0) {
      const cizgi = Skia.Paint();
      cizgi.setAntiAlias(true);
      cizgi.setStyle(CIZGI);
      cizgi.setColor(saydamRenk(renk.metin, 0.75));
      cizgi.setStrokeWidth(BAG_CIZGI * kay);
      for (const [x1, y1, x2, y2] of baglar) c.drawLine(x1, y1, x2, y2, cizgi);
    }
    c.drawAtlas(atlas.resim, kutular, donusumler, Skia.Paint(), CARP, renkler, {
      filter: DOGRUSAL,
      mipmap: DOGRUSAL_KADEME,
    });
  });
}

// k. dilimin açısı (radyan): 0. dilim saat 12'de, saat yönünde dolar.
function dilimAcisi(k) {
  return (k * 2 * Math.PI) / HALKA.DILIM;
}

// Yanan dilim sayısı: tam hak = bütün halka; kısmi hak en az bir, en çok DILIM−1 (kısmi hiçbir
// zaman "tam" ya da "boş" görünmesin).
export function yananDilim(hak) {
  if (!(hak > 0)) return 0;
  if (hak >= 1) return HALKA.DILIM;
  return Math.max(1, Math.min(HALKA.DILIM - 1, Math.round(hak * HALKA.DILIM)));
}

// HAMLE HAKKI HALKASININ YANAN DİLİMLERİ (Görev 21 · H3) — resim DEĞİL düz veri: kare her
// çizimde bunları nefesin o anki parlaklığıyla basıyor (`sahneyiCiz`). Dönen:
// { resim, kutular, donusumler, renk: [r, g, b] } ya da null (halkalı ordu yok).
export function halkaVerisi(liste, boy, atlas, ayar) {
  if (!liste || !atlas.dilim) return null;
  const olcek = boy / KUTU;
  const kay = boy / ayar.CAP;
  const sayfaOlcek = olcek / atlas.olcek;
  const kutular = [];
  const donusumler = [];
  for (const r of liste) {
    const n = yananDilim(r.hak);
    if (n === 0) continue;
    const cx = r.x + (r.dx || 0) * kay,
      cy = r.y + (r.dy || 0) * kay;
    const mx = cx - (KUTU / 2) * olcek + HALKA.MERKEZ_X * olcek,
      my = cy - (KUTU / 2) * olcek + HALKA.MERKEZ_Y * olcek;
    for (let k = 0; k < n; k++) {
      kutular.push(atlas.dilim.hucre);
      donusumler.push(merkezDonusumu(atlas.dilim, mx, my, sayfaOlcek, dilimAcisi(k)));
    }
  }
  if (kutular.length === 0) return null;
  const h = HAMLE_HAKKI.halka;
  return {
    resim: atlas.resim,
    kutular,
    donusumler,
    renk: [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255),
  };
}

// KADRO ŞERİDİ (Görev 20; plan: YOL-HARITASI-v11 §17.2). Yakınlaşınca parça kalkanının
// altında koyu bir şerit: birim figürü + sayısı, piyade · topçu · zırhlı sırasıyla, boş
// tür yok. Rakiplerde de var (Baki: "gözüksün"). Şerit ayrı bir katman: yalnızca
// `DENGE.ROZET.SERIT_ESIGI` üstünde görünüyor (`sahneyiCiz`, `HaritaSkia.js`).
// Ölçüler kutu biriminde (kalkan 26); okunurluk ve çakışma ölçümü
// `scripts/kadro-serit-olcum.js` → `veri/kadro-serit-olcum.md`.
export const KADRO_SERIDI = {
  UST: 27, // şeridin üst kenarı (kalkanın ucu 25, konturla ~26.3)
  FIGUR: 8, // figürün kutusu
  YAZI: 8.5, // sayının puntosu
  ARALIK: 1.2, // figür ile sayısı arası
  OGE_ARA: 2.6, // iki tür arası
  PAY: 1.4, // şeridin iç kenar payı
  KOSE: 3, // şeridin köşe yuvarlağı
  ZEMIN: 0.88, // zeminin koyuluğu
};

// Bir kadronun şerit ölçüleri (kutu birimi): her öğenin başlangıcı ve toplam genişlik.
export function seritOlcusu(kadro, atlas) {
  const yo = KADRO_SERIDI.YAZI / YAZI_BUYUK;
  const ogeler = [];
  let x = KADRO_SERIDI.PAY;
  for (const k of kadro) {
    const harfler = k.yazi.split('').filter((ch) => atlas.rakam[ch]);
    const yazi = harfler.reduce((a, ch) => a + atlas.rakam[ch].ilerleme, 0) * yo;
    ogeler.push({ tur: k.tur, harfler, x });
    x += KADRO_SERIDI.FIGUR + KADRO_SERIDI.ARALIK + yazi + KADRO_SERIDI.OGE_ARA;
  }
  const genislik = x - KADRO_SERIDI.OGE_ARA + KADRO_SERIDI.PAY;
  return { ogeler, genislik, yukseklik: KADRO_SERIDI.FIGUR + 2 * KADRO_SERIDI.PAY };
}

// Parça rozetlerinin kadro şeritleri — tek resim, harita biriminde (rozetResmi gibi).
export function kadroResmi(Skia, liste, boy, atlas, renk, ayar, meta) {
  const dolu = (liste || []).filter((r) => r.kadro && r.kadro.length > 0);
  if (dolu.length === 0) return null;
  const olcek = boy / KUTU;
  const kay = boy / ayar.CAP;
  const yo = KADRO_SERIDI.YAZI / YAZI_BUYUK;
  const figurOlcek = KADRO_SERIDI.FIGUR / BIRIM_KUTU;
  const zemin = Skia.Paint();
  zemin.setAntiAlias(true);
  zemin.setColor(saydamRenk(renk.kontur, KADRO_SERIDI.ZEMIN));

  const kutular = [];
  const donusumler = [];
  const renkler = [];
  const bas = (h, x, y, o) => {
    kutular.push(h);
    donusumler.push({ scos: (olcek * o) / atlas.olcek, ssin: 0, tx: x, ty: y });
    renkler.push(renk.metin);
  };
  const zeminler = [];
  for (const r of dolu) {
    const cx = r.x + (r.dx || 0) * kay,
      cy = r.y + (r.dy || 0) * kay;
    const bx = cx - (KUTU / 2) * olcek,
      by = cy - (KUTU / 2) * olcek;
    const o = seritOlcusu(r.kadro, atlas);
    const sol = KUTU / 2 - o.genislik / 2;
    zeminler.push(
      Skia.RRectXY(
        Skia.XYWHRect(
          bx + sol * olcek,
          by + KADRO_SERIDI.UST * olcek,
          o.genislik * olcek,
          o.yukseklik * olcek
        ),
        KADRO_SERIDI.KOSE * olcek,
        KADRO_SERIDI.KOSE * olcek
      )
    );
    const ortaY = KADRO_SERIDI.UST + KADRO_SERIDI.PAY + KADRO_SERIDI.FIGUR / 2;
    const taban = ortaY - (yo * (atlas.yukselis + atlas.inis)) / 2;
    for (const oge of o.ogeler) {
      const x = sol + oge.x;
      bas(
        atlas.figur[oge.tur],
        bx + x * olcek,
        by + (KADRO_SERIDI.UST + KADRO_SERIDI.PAY) * olcek,
        figurOlcek
      );
      let kalem = x + KADRO_SERIDI.FIGUR + KADRO_SERIDI.ARALIK;
      for (const ch of oge.harfler) {
        const g = atlas.rakam[ch];
        bas(
          g.hucre,
          bx + (kalem - yo * RAKAM_PAY) * olcek,
          by + (taban + yo * (atlas.yukselis - RAKAM_PAY)) * olcek,
          yo
        );
        kalem += g.ilerleme * yo;
      }
    }
  }
  return kaydet(Skia, meta, (c) => {
    for (const z of zeminler) c.drawRRect(z, zemin);
    if (kutular.length > 0)
      c.drawAtlas(atlas.resim, kutular, donusumler, Skia.Paint(), CARP, renkler, {
        filter: DOGRUSAL,
        mipmap: DOGRUSAL_KADEME,
      });
  });
}

// BİRLİK FİGÜRLERİ (Görev 21 · H10). En yakında (`DENGE.ROZET.FIGUR_ESIGI`) kadro şeridinin
// yerine: kalkanın altında, türler yan yana, her figür açık gövdeli ve koyu konturlu
// (`tema.js BIRLIK_FIGUR`); sağ altında koyu bir yuvarlakta sayısı. Şeritteki gibi boş tür yok, sıra piyade · topçu ·
// zırhlı. Ölçüler kutu biriminde (kalkan 26).
export const BIRLIK_FIGURU = {
  UST: 25.5, // figür sırasının üst kenarı (kalkanın ucu 25)
  FIGUR: 13, // figürün kutusu
  ARA: 5, // iki figür arası (sayı balonu arada kalıyor)
  BALON: 4.4, // sayı yuvarlağının yarıçapı
  YAZI: 7.5, // sayının puntosu
};

export function figurResmi(Skia, liste, boy, atlas, renk, ayar, meta) {
  const dolu = (liste || []).filter((r) => r.kadro && r.kadro.length > 0);
  if (dolu.length === 0 || !atlas.figurKontur) return null;
  const B = BIRLIK_FIGURU;
  const olcek = boy / KUTU;
  const kay = boy / ayar.CAP;
  const kontur = Skia.Color(BIRLIK_FIGUR.kontur);
  const govde = Skia.Color(BIRLIK_FIGUR.govde);
  const po = (olcek * (B.FIGUR / BIRIM_KUTU)) / atlas.olcek; // figür hücresinin ölçeği
  const yo = B.YAZI / YAZI_BUYUK;
  const kutular = [];
  const donusumler = [];
  const renkler = [];
  const bas = (h, x, y, o, r) => {
    kutular.push(h);
    donusumler.push({ scos: o, ssin: 0, tx: x, ty: y });
    renkler.push(r);
  };
  for (const r of dolu) {
    const cx = r.x + (r.dx || 0) * kay,
      cy = r.y + (r.dy || 0) * kay;
    const bx = cx - (KUTU / 2) * olcek,
      by = cy - (KUTU / 2) * olcek;
    const n = r.kadro.length;
    const genislik = n * B.FIGUR + (n - 1) * B.ARA;
    r.kadro.forEach((k, i) => {
      const fx = KUTU / 2 - genislik / 2 + i * (B.FIGUR + B.ARA);
      const x = bx + fx * olcek,
        y = by + B.UST * olcek;
      // Kontur (figürün koyu, kalın hâli) + açık gövde. Kontur hücresinin
      // köşesi figür kutusunun 2 birim sol üstünde (`rozetAtlasiKur`).
      const kh = atlas.figurKontur[k.tur];
      bas(kh.hucre, x - kh.merkez.x * po, y - kh.merkez.y * po, po, kontur);
      bas(atlas.figur[k.tur], x, y, po, govde);
      // Sayı balonu: figürün sağ altında.
      const harfler = k.yazi.split('').filter((ch) => atlas.rakam[ch]);
      if (harfler.length === 0 || !atlas.daire) return;
      const bmx = fx + B.FIGUR - 1,
        bmy = B.UST + B.FIGUR - 1.5;
      const yaziG = harfler.reduce((a, ch) => a + atlas.rakam[ch].ilerleme, 0) * yo;
      const yaricap = Math.max(B.BALON, yaziG / 2 + 1.4);
      const dO = (olcek * yaricap) / (10 * atlas.olcek);
      bas(
        atlas.daire.hucre,
        bx + bmx * olcek - atlas.daire.merkez.x * dO,
        by + bmy * olcek - atlas.daire.merkez.y * dO,
        dO,
        kontur
      );
      let kalem = bmx - yaziG / 2;
      const taban = bmy - (yo * (atlas.yukselis + atlas.inis)) / 2;
      for (const ch of harfler) {
        const g = atlas.rakam[ch];
        bas(
          g.hucre,
          bx + (kalem - yo * RAKAM_PAY) * olcek,
          by + (taban + yo * (atlas.yukselis - RAKAM_PAY)) * olcek,
          (olcek * yo) / atlas.olcek,
          renk.metin
        );
        kalem += g.ilerleme * yo;
      }
    });
  }
  return kaydet(Skia, meta, (c) =>
    c.drawAtlas(atlas.resim, kutular, donusumler, Skia.Paint(), CARP, renkler, {
      filter: DOGRUSAL,
      mipmap: DOGRUSAL_KADEME,
    })
  );
}

// Katmanların resmi (il, parça, parçanın kadro şeridi) + hamle hakkı halkalarının yanan
// dilimleri (`halkaIl`, `halkaParca`: düz veri, kare çiziyor). `f`: haritaOlcusu(...).f
export function rozetResimleri(Skia, listeler, f, atlas, renk, ayar, meta) {
  return {
    halkaIl: halkaVerisi(listeler.il, rozetDunyaBoyu(ayar.ORTA, f, ayar), atlas, ayar),
    halkaParca: halkaVerisi(listeler.parca, rozetDunyaBoyu(ayar.YAKIN, f, ayar), atlas, ayar),
    il: rozetResmi(Skia, listeler.il, rozetDunyaBoyu(ayar.ORTA, f, ayar), atlas, renk, ayar, meta),
    parca: rozetResmi(
      Skia,
      listeler.parca,
      rozetDunyaBoyu(ayar.YAKIN, f, ayar),
      atlas,
      renk,
      ayar,
      meta
    ),
    serit: kadroResmi(
      Skia,
      listeler.parca,
      rozetDunyaBoyu(ayar.YAKIN, f, ayar),
      atlas,
      renk,
      ayar,
      meta
    ),
    figur: figurResmi(
      Skia,
      listeler.parca,
      rozetDunyaBoyu(ayar.YAKIN, f, ayar),
      atlas,
      renk,
      ayar,
      meta
    ),
  };
}

// ======================================================================================
// 9) KARE ÇİZİMİ — arayüz iş parçacığında, her karede ('worklet')
// ======================================================================================

// Rozet katmanı: 0 = il rozetleri, 1 = parça rozetleri. YAKIN'da parçaya geçer, geri
// dönüş YAKIN'ın HISTEREZIS kadar altında olur: eşikte duraklayan parmak katmanı bir ileri
// bir geri atlatmasın (eski katmanın 2026-07-30 dersi). Geçişin kendisi ZAMANLA oluyor
// (`HaritaSkia.js`, `DENGE.ROZET.DUNYA_GECIS_SURE`): yakınlığa bağlı karışım denendi ve
// atıldı — oyuncu geçiş bandında durunca iki katman yarı saydam üst üste kalıyordu
// (önizleme, 2026-09-23).
export function rozetKatmaniSec(z, onceki, ayar) {
  'worklet';
  if (z >= ayar.YAKIN) return 1;
  if (z < ayar.YAKIN - ayar.HISTEREZIS) return 0;
  return onceki;
}

// Kadro şeridi: SERIT eşiğinde açılır, HISTEREZIS kadar aşağıda kapanır (katmanla aynı kural).
export function seritKatmaniSec(z, onceki, ayar) {
  'worklet';
  if (z >= ayar.SERIT) return 1;
  if (z < ayar.SERIT - ayar.HISTEREZIS) return 0;
  return onceki;
}

// Birlik figürleri (Görev 21): FIGUR eşiğinde açılır, şeritle aynı histerezis kuralı.
export function figurKatmaniSec(z, onceki, ayar) {
  'worklet';
  if (z >= ayar.FIGUR) return 1;
  if (z < ayar.FIGUR - ayar.HISTEREZIS) return 0;
  return onceki;
}

// Bir rozet katmanı, o anki saydamlığıyla. Geçiş dışında (tam görünür) doğrudan oynatılır;
// yalnızca 180 ms'lik geçişte saydam bir ara katman açılır.
function katmanOynat(c, resim, saydam, katmanBoya) {
  'worklet';
  if (!resim || saydam < 0.01) return;
  if (saydam > 0.99) {
    c.drawPicture(resim);
    return;
  }
  katmanBoya.setAlphaf(saydam);
  c.saveLayer(katmanBoya);
  c.drawPicture(resim);
  c.restore();
}

// Yanan dilimler, o anki parlaklıkla. `katman`: il ↔ parça geçişi · `nefes`: 0 (en sönük) – 1;
// en sönük anda bile `HAMLE_HAKKI.nefesEn` kadar yanar. Bütün dilimler TEK çağrı.
const NEFES_EN = HAMLE_HAKKI.nefesEn;
function halkaOynat(c, h, katman, nefes, boya) {
  'worklet';
  if (!h || katman < 0.01) return;
  const a = katman * (NEFES_EN + (1 - NEFES_EN) * nefes);
  const r = [h.renk[0], h.renk[1], h.renk[2], a];
  const renkler = new Array(h.kutular.length).fill(r);
  c.drawAtlas(h.resim, h.kutular, h.donusumler, boya, CARP, renkler, {
    filter: DOGRUSAL,
    mipmap: DOGRUSAL_KADEME,
  });
}

// ⚠ SIRA: kare fonksiyonunun çağırdığı her yardımcı ONDAN ÖNCE tanımlanır. Reanimated'in
// derleyicisi 'worklet' fonksiyon bildirimini sabite çeviriyor — yukarı taşınma (hoisting)
// yok. Sonra tanımlanan yardımcı telefonda "halkaOynat is not a function" hatası verdi
// (2026-09-24); bilgisayarda (önizleme, testler) bu dönüşüm yapılmadığı için görünmedi.
// Test: testler/haritaSkia.test.js "WORKLET SIRASI".
// Bir karenin tamamı. `s` (sahne) JS tarafında hazırlanır, `kam` her karede hesaplanır:
//   s   = { bantUst, bantSeviye, dolgular (seviye başına), hatlar (bant başına),
//           susAlt / susUst (bant başına; üst eşiğin altında null — Görev 20 süsleri),
//           nehir, cephe (bant başına ya da null — Görev 21),
//           vurgu (bant başına ya da null), rozetler: { il, parca, serit, figur, halkaIl,
//           halkaParca }, katmanBoya, atlasBoya (ikisi de düz boya; ayrı nesne) }
//   kam = { k, bx, by, z, parcaSaydam, seritSaydam, figurSaydam, nefes }  (haritaDonusum.js
//         kameraDonusumu + yakınlık + rozet katmanının, kadro şeridinin ve birlik
//         figürlerinin o anki geçişi + hamle hakkı halkasının nefesi, 0–1; yoksa 1)
// Kare başına en çok ~19 Skia çağrısı; rozet, parça ve dağ sayısından bağımsız (test).
export function sahneyiCiz(c, s, kam) {
  'worklet';
  const b = bantSec(kam.z, s.bantUst);
  c.save();
  c.translate(kam.bx, kam.by);
  c.scale(kam.k, kam.k);
  // Süsler (Görev 20): kıyı gölgesi ve dalga dolguların ALTINDA, dağ ve tepe ÜSTÜNDE.
  if (s.susAlt) c.drawPicture(s.susAlt[b]);
  c.drawPicture(s.dolgular[s.bantSeviye[b]]);
  // Nehirler ve göller (Görev 21): dolguların üstünde, dağların ve sınırların altında.
  if (s.nehir) c.drawPicture(s.nehir[b]);
  if (s.susUst && s.susUst[b]) c.drawPicture(s.susUst[b]);
  c.drawPicture(s.hatlar[b]);
  // Cephe hattı (Görev 21): sınır çizgilerinin üstünde, seçim vurgusunun altında.
  if (s.cephe) c.drawPicture(s.cephe[b]);
  if (s.vurgu) c.drawPicture(s.vurgu[b]);
  // Önce il rozetleri, üstüne parça rozetleri: geçişte ayrıntı öne çıksın. Kadro şeridi
  // en üstte ve yalnızca yakında (`kam.seritSaydam`, parça katmanıyla çarpılmış).
  katmanOynat(c, s.rozetler.il, 1 - kam.parcaSaydam, s.katmanBoya);
  katmanOynat(c, s.rozetler.parca, kam.parcaSaydam, s.katmanBoya);
  // Hamle hakkı halkası (Görev 21): yanan dilimler nefesle — kalkanların üstünde, şeridin altında.
  const nefes = kam.nefes === undefined ? 1 : kam.nefes;
  halkaOynat(c, s.rozetler.halkaIl, 1 - kam.parcaSaydam, nefes, s.atlasBoya);
  halkaOynat(c, s.rozetler.halkaParca, kam.parcaSaydam, nefes, s.atlasBoya);
  // Kadro şeridi ile birlik figürleri aynı yerde: figürler açılırken şerit söner.
  const figur = kam.figurSaydam || 0;
  katmanOynat(c, s.rozetler.serit, (kam.seritSaydam || 0) * (1 - figur), s.katmanBoya);
  katmanOynat(c, s.rozetler.figur, figur, s.katmanBoya);
  c.restore();
}

// Geçişteki ara katmanın boyası — bir kez (JS iş parçacığı); karede yalnızca saydamlığı
// değişiyor.
export function katmanBoyasi(Skia) {
  return Skia.Paint();
}

// Sahnenin sabit renkleri — Skia rengine bir kez çevrilir (JS iş parçacığı).
export function sahneRenkleri(Skia) {
  return {
    kontur: Skia.Color(PANEL.rozetKontur),
    pirinc: Skia.Color(PANEL.pirinc),
    kirmizi: Skia.Color(PANEL.kirmizi),
    golge: Skia.Color(PANEL.golgeRenk),
    metin: Skia.Color(PANEL.metin),
    parcaSinir: Skia.Color(RENK.parcaSinir),
    ilSinir: Skia.Color(RENK.ilSinir),
  };
}

// Eski çizgi grupları (yol nesneleri) — yalnızca ölçüm düzeneği karşılaştırma için
// kullanıyor (`onizleme/harita-hiz.html`); oyun şeritleri kullanır.
export function hatlariKur(Skia, kaynak, kapsam) {
  const turler = hatTurleri(kaynak.veri, kaynak.parcaIl, kapsam);
  return kaynak.veri.seviyeler.map((_, i) =>
    hatGruplari(kaynak.veri, i, turler)
      .map((g) => ({
        il: g.il,
        ilSiniri: g.ilSiniri,
        soluk: g.soluk,
        yol: Skia.Path.MakeFromSVGString(g.yol),
      }))
      .filter((g) => g.yol)
  );
}
