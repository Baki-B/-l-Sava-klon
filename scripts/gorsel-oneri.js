// GÖRSEL ÖNERİ GÖRÜNTÜLERİ (Görev 20 · Baki, 2026-09-24).
//
// Çalıştırma:  node scripts/gorsel-oneri.js
// Çıktı:       onizleme/harita-skia/oneri-*.png  +  onizleme/harita-skia/oneri.html
//
// NİYE VAR. Görsel bir kararı cümleyle sormak yerine GÖSTERMEK için: oyunun kendi çizimi
// (`haritaCizim.js`, aynı maç, aynı kamera) önerilen katmanlarla birlikte çiziliyor. Bu
// betik OYUNA GİRMEZ; Baki bir öneriyi seçerse o katman `haritaCizim.js`'e ölçülerek
// (telefonun ekran kartı yolu: `onizleme/harita-hiz.html`) taşınır. Aşağıdaki renkler ve
// silüet şekilleri de o zaman `tema.js` / `rozetSekli.js`'e gider — burada yalnızca taslak.
//
// TARİHÇE (aynı gün, iki tur):
//   1. tur: kıyı gölgesi + arazi (B), il merkezinde kale + bayrak (C), komutan halesi +
//      yıldız + sancak (D). Baki: "B olsun · kaleye gerek yok · komutan halesi kötü, daha
//      farklı gözükebilir, mesela insan silüeti". B oyuna girdi (`haritaCizim.js` SÜSLER).
//   2. tur (bu hâli): taban artık oyunun kendi süslü haritası; komutan için üç silüet ve
//      "nefes alan kalkan" (hamle hakkı) örneği.
//
// GÖRÜNTÜLER:
//   komutan-A-bust      kalkanın tepesinde büst (kalpak, apolet, kuşak) — arma gibi
//   komutan-B-ayakta    kalkanın yanında ayakta duran paşa (kaput, çizme, kılıç)
//   komutan-C-madalyon  kalkanın yerine yuvarlak altın madalyon: içinde büst, altında sayı
//   komutan-portreler   üçünün büyük hâli (komutan ekranı ve bölge paneli için)
//   hamle-hakki         hamle hakkı olan ordular parlak ve halkalı, hakkı bitenler soluk

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const CIKTI = path.join(KOK, 'onizleme', 'harita-skia');
const EKRAN = { g: 915, y: 412, yogunluk: 2 };
const EN_UZAK = 0.9;
const EN_YAKIN = 7;
const TOHUM = 7;
const TUR = 15;

// Taslak renkler — seçilirse `tema.js`'e taşınır.
const ONERI = {
  murekkep: '#1B242C', // silüetin kendisi
  altin: '#D9B45A', // apolet, kuşak, çerçeve
  altinAcik: '#F0D891', // madalyonun ışığı
  halka: '#FFFFFF', // hamle hakkı halkası
};

// ---- SİLÜETLER (taslak; seçilirse rozetSekli.js'e) ----
// Büst: 24 × 24 kutu. Kalpak, baş, omuzlar; altın apolet ve çapraz kuşak.
const BUST = {
  govde:
    'M7.4 7.4 L6.8 2.6 C9 1.4 15 1.4 17.2 2.6 L16.6 7.4 Z' +
    'M8.1 9.8 A3.9 4.3 0 1 0 15.9 9.8 A3.9 4.3 0 1 0 8.1 9.8 Z' +
    'M9.4 13.4 C9.6 14.3 10.2 14.8 12 14.8 C13.8 14.8 14.4 14.3 14.6 13.4 ' +
    'C18.8 14 21.6 16 22 19.6 L22.2 23.2 L1.8 23.2 L2 19.6 C2.4 16 5.2 14 9.4 13.4 Z',
  altin:
    'M3.2 16.4 L7.8 15.4 L8.2 17 L3.6 18 Z' +
    'M20.8 16.4 L16.2 15.4 L15.8 17 L20.4 18 Z' +
    'M8.6 15.6 L10.2 15 L17.8 23.2 L15.4 23.2 Z' +
    'M7 6.2 L17 6.2 L16.9 7.2 L7.1 7.2 Z',
};
// Ayakta: 24 × 40 kutu. Kalpak, baş, uzun kaput, çizmeler; altın apolet, kuşak, kılıç.
const AYAKTA = {
  govde:
    'M9.6 4.8 L9.2 1.4 C10.6 0.6 13.4 0.6 14.8 1.4 L14.4 4.8 Z' +
    'M9.4 7.1 A2.6 2.6 0 1 0 14.6 7.1 A2.6 2.6 0 1 0 9.4 7.1 Z' +
    'M9 10 C10.4 9.4 13.6 9.4 15 10 L16.4 20 L17.6 33 L6.4 33 L7.6 20 Z' +
    'M8.4 33 L11.4 33 L11.4 38.6 L7.8 38.6 Z' +
    'M12.6 33 L15.6 33 L16.2 38.6 L12.6 38.6 Z',
  altin:
    'M8.2 10.2 L10.8 9.7 L11 11 L8.4 11.4 Z' +
    'M15.8 10.2 L13.2 9.7 L13 11 L15.6 11.4 Z' +
    'M9.8 10.6 L11 10.2 L15.6 21.4 L14.2 21.8 Z' +
    'M16.4 14.4 L17.2 14.2 L20.6 30.6 L19.8 30.8 Z',
};

async function main() {
  const ckYolu = require.resolve('canvaskit-wasm/bin/full/canvaskit.js');
  const CanvasKitInit = require(ckYolu);
  global.CanvasKit = await CanvasKitInit({ locateFile: (f) => path.join(path.dirname(ckYolu), f) });
  const {
    getSkiaExports,
    makeOffscreenSurface,
  } = require('@shopify/react-native-skia/lib/commonjs/headless');
  const { Skia } = getSkiaExports();

  const { DENGE } = require('../src/denge.js');
  const { askeriTon, RENK, HARITA_SEVIYE_HATASI, okunakliMetin } = require('../src/tema.js');
  const { oyunKur, AKTOR_RENKLERI } = require('../src/oyun/oyunDurumu.js');
  const { turuBitir } = require('../src/oyun/turDongusu.js');
  const { parcaRozetListesi } = require('../src/rozetListesi.js');
  const { haritaOlcusu, kameraKaydirmasi, kameraDonusumu } = require('../src/haritaDonusum.js');
  const C = require('../src/haritaCizim.js');
  const seviyeVerisi = require('../veri/harita-seviyeleri.json');
  const parcaVerisi = require('../veri/parcalar.json');
  const susVerisi = require('../veri/harita-susleri.json');
  const hat = require('../veri/turkiye-hat.json');

  // ---- Maç: harita-skia-onizleme.js ile aynı (15 tur) ----
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk: 'orta' });
  for (let i = 0; i < TUR; i++) d = turuBitir(d);
  const ben = d.oyuncuAktorId;

  // Komutan: oyuncunun en kalabalık ordusunun başında (görüntü için).
  let komutanParca = null;
  let enCok = 0;
  for (const pid of Object.keys(d.ordular).sort()) {
    const o = d.ordular[pid];
    if (o.sahip !== ben) continue;
    const n = Object.values(o.birimler).reduce((a, x) => a + x, 0);
    if (n > enCok) {
      enCok = n;
      komutanParca = pid;
    }
  }

  // ---- Oyunun çizimi (HaritaSkia.js'in useMemo'larının aynısı, süsler dahil) ----
  const meta = parcaVerisi.meta;
  const o = haritaOlcusu(EKRAN.g, EKRAN.y, meta.genislik, meta.yukseklik);
  const ekran = { f: o.f, yogunluk: EKRAN.yogunluk };
  const kaynak = C.haritaKaynagiKur(Skia, seviyeVerisi, parcaVerisi.parcalar);
  const bantlar = C.bantlariKur(o.f, kaynak.toleranslar, HARITA_SEVIYE_HATASI, EN_UZAK, EN_YAKIN);
  const renk = C.sahneRenkleri(Skia);
  const seritler = C.hatSeritleriKur(Skia, kaynak, null, bantlar, ekran);
  const hatResmi = C.hatResimleri(Skia, seritler, bantlar, true, renk, meta, ekran);
  const sus = C.susResimleri(
    Skia,
    C.susGeometrisiKur(susVerisi, hat.yol, null),
    bantlar,
    meta,
    ekran
  );
  const dolgular = C.dolgulariHesapla(
    parcaVerisi.parcalar,
    'il',
    d.parcaSahipligi,
    AKTOR_RENKLERI,
    null,
    null
  );
  const dolguResmi = C.dolguResimleri(Skia, kaynak, dolgular, meta);
  const ttf = path.join(
    KOK,
    'node_modules/@expo-google-fonts/chakra-petch/700Bold/ChakraPetch_700Bold.ttf'
  );
  const yuz = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(new Uint8Array(fs.readFileSync(ttf)))
  );
  const AYAR = {
    CAP: DENGE.ROZET.CAP,
    ORTA: DENGE.ROZET.ORTA_SINIR,
    YAKIN: DENGE.ROZET.YAKIN_SINIR,
    HISTEREZIS: DENGE.ROZET.KATMAN_HISTEREZIS,
    SERIT: DENGE.ROZET.SERIT_ESIGI,
  };
  const atlas = C.rozetAtlasiKur(Skia, Skia.Font(yuz, 13), C.sekilleriKur(Skia));
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, o.f, AYAR); // parça rozetinin harita birimindeki boyu
  const rozetler = (liste) => C.rozetResmi(Skia, liste, boy, atlas, renk, AYAR, meta);
  const tumRozetler = parcaRozetListesi(d.ordular, komutanParca);

  // ---- Yardımcılar ----
  const kaydet = (ciz) => {
    const k = Skia.PictureRecorder();
    ciz(k.beginRecording(Skia.XYWHRect(-60, -60, meta.genislik + 120, meta.yukseklik + 120)));
    return k.finishRecordingAsPicture();
  };
  const boya = (hex, stil, kalinlik) => {
    const b = Skia.Paint();
    b.setAntiAlias(true);
    b.setColor(Skia.Color(hex));
    if (stil === 'cizgi') {
      b.setStyle(1);
      b.setStrokeWidth(kalinlik);
      b.setStrokeJoin(1);
    }
    return b;
  };
  const yol = (s) => Skia.Path.MakeFromSVGString(s);
  // Silüeti (x, y) sol üst köşesine, `olcek` büyüklükte çizer: gövde mürekkep, altın süsler,
  // çevresinde altın kontur (haritanın her renginde okunsun).
  const silüet = (c, sekil, x, y, olcek, konturKalinlik) => {
    c.save();
    c.translate(x, y);
    c.scale(olcek, olcek);
    const g = yol(sekil.govde);
    c.drawPath(g, boya(ONERI.altin, 'cizgi', konturKalinlik / olcek));
    c.drawPath(g, boya(ONERI.murekkep));
    c.drawPath(yol(sekil.altin), boya(ONERI.altin));
    c.restore();
  };
  const kp = parcaVerisi.parcalar[komutanParca].etiket;

  // ---- KOMUTAN SEÇENEKLERİ ----
  // A: kalkanın tepesinde büst — rozetten ÖNCE çiziliyor, kalkan büstün göğsünü örtüyor.
  const bustArka = kaydet((c) => {
    const s = boy * 1.3;
    silüet(c, BUST, kp.x - s / 2, kp.y - boy * 0.5 - s * 0.62, s / 24, boy * 0.06);
  });
  // B: kalkanın solunda ayakta paşa — kalkan kadar uzun.
  const ayaktaOn = kaydet((c) => {
    const h = boy * 1.55;
    const s = h / 40;
    silüet(c, AYAKTA, kp.x - boy * 0.5 - 24 * s * 0.78, kp.y - h * 0.55, s, boy * 0.05);
  });
  // C: madalyon — kalkanın ÜSTÜNE (onu örter): altın çerçeve, içinde sahibinin renginde
  // halka, ortada büst; altında sayı sekmesi.
  const madalyonOn = kaydet((c) => {
    const R = boy * 0.62;
    const sahipRengi = AKTOR_RENKLERI[ben];
    c.drawCircle(kp.x, kp.y, R, boya(ONERI.altin));
    c.drawCircle(kp.x, kp.y, R * 0.86, boya(sahipRengi));
    c.drawCircle(kp.x, kp.y, R * 0.72, boya(ONERI.murekkep));
    c.drawCircle(kp.x, kp.y, R, boya(ONERI.altinAcik, 'cizgi', R * 0.05));
    const s = R * 1.25;
    // Büst madalyonun içinde, altın renkte (silüet ters: altın gövde, mürekkep süs),
    // iç daireye kırpılmış.
    c.save();
    const daire = Skia.Path.Make();
    daire.addCircle(kp.x, kp.y, R * 0.72);
    c.clipPath(daire, 1, true);
    c.translate(kp.x - s / 2, kp.y - s * 0.5);
    c.scale(s / 24, s / 24);
    c.drawPath(yol(BUST.govde), boya(ONERI.altin));
    c.drawPath(yol(BUST.altin), boya(ONERI.murekkep));
    c.restore();
    // Sayı sekmesi
    const sayi = String(enCok);
    const font = Skia.Font(yuz, R * 0.62);
    const gen = font.getTextWidth(sayi);
    const sw = gen + R * 0.5,
      sh = R * 0.62;
    const sx = kp.x - sw / 2,
      sy = kp.y + R * 0.72;
    c.drawRRect(Skia.RRectXY(Skia.XYWHRect(sx, sy, sw, sh), sh / 2, sh / 2), boya(ONERI.altin));
    c.drawRRect(
      Skia.RRectXY(
        Skia.XYWHRect(sx + sh * 0.08, sy + sh * 0.08, sw - sh * 0.16, sh * 0.84),
        sh / 2,
        sh / 2
      ),
      boya(sahipRengi)
    );
    c.drawText(sayi, kp.x - gen / 2, sy + sh * 0.76, boya(okunakliMetin(sahipRengi)), font);
  });

  // ---- NEFES: hamle hakkı olan ordu parlak + halka, hakkı biten soluk ----
  const benimRozetler = tumRozetler.filter((r) => d.ordular[r.anahtar.slice(1)].sahip === ben);
  const hazirlar = benimRozetler.filter((_, i) => i % 2 === 0);
  const bitenler = benimRozetler.filter((_, i) => i % 2 === 1);
  const digerleri = tumRozetler.filter((r) => d.ordular[r.anahtar.slice(1)].sahip !== ben);
  const halkalar = kaydet((c) => {
    for (const r of hazirlar) {
      const b = boya(ONERI.halka, 'cizgi', boy * 0.06);
      b.setAlphaf(0.85);
      c.drawCircle(r.x, r.y, boy * 0.66, b);
      const b2 = boya(ONERI.halka, 'cizgi', boy * 0.04);
      b2.setAlphaf(0.35);
      c.drawCircle(r.x, r.y, boy * 0.8, b2);
    }
  });

  // ---- ÇİZİM: sahneyiCiz'in sırası, araya öneri katmanları ----
  const deniz = Skia.Color(askeriTon(RENK.deniz));
  function ciz(g, ek) {
    const yuzey = makeOffscreenSurface(EKRAN.g * EKRAN.yogunluk, EKRAN.y * EKRAN.yogunluk);
    const c = yuzey.getCanvas();
    c.drawColor(deniz);
    c.scale(EKRAN.yogunluk, EKRAN.yogunluk);
    const kay = kameraKaydirmasi(g.merkez.x, g.merkez.y, o, g.z);
    const k = kameraDonusumu(o, g.z, kay.tx, kay.ty);
    const b = C.bantSec(
      g.z,
      bantlar.map((x) => x.ust)
    );
    c.save();
    c.translate(k.bx, k.by);
    c.scale(k.k, k.k);
    c.drawPicture(sus.alt[b]);
    c.drawPicture(dolguResmi[bantlar[b].seviye]);
    if (sus.ust[b]) c.drawPicture(sus.ust[b]);
    c.drawPicture(hatResmi[b]);
    if (ek.arka) c.drawPicture(ek.arka);
    if (ek.nefes) {
      c.drawPicture(rozetler(digerleri));
      c.drawPicture(rozetler(hazirlar));
      const soluk = Skia.Paint();
      soluk.setAlphaf(0.4);
      c.saveLayer(soluk);
      c.drawPicture(rozetler(bitenler));
      c.restore();
      c.drawPicture(halkalar);
    } else {
      c.drawPicture(rozetler(tumRozetler));
    }
    if (ek.on) c.drawPicture(ek.on);
    c.restore();
    yuzey.flush();
    return yuzey.makeImageSnapshot().encodeToBytes();
  }

  // Büyük portreler: üç silüet yan yana (komutan ekranı için).
  function portreler() {
    const G = 900,
      Y = 360;
    const yuzey = makeOffscreenSurface(G, Y);
    const c = yuzey.getCanvas();
    c.drawColor(Skia.Color('#31506E'));
    const s = 10;
    silüet(c, BUST, 60, 60, s, 6);
    silüet(c, AYAKTA, 380, 20, 8, 6);
    // Madalyon
    const cx = 720,
      cy = 180,
      R = 130;
    c.drawCircle(cx, cy, R, boya(ONERI.altin));
    c.drawCircle(cx, cy, R * 0.86, boya(AKTOR_RENKLERI[ben]));
    c.drawCircle(cx, cy, R * 0.72, boya(ONERI.murekkep));
    c.save();
    const daire = Skia.Path.Make();
    daire.addCircle(cx, cy, R * 0.72);
    c.clipPath(daire, 1, true);
    const ms = R * 1.25;
    c.translate(cx - ms / 2, cy - ms * 0.5);
    c.scale(ms / 24, ms / 24);
    c.drawPath(yol(BUST.govde), boya(ONERI.altin));
    c.drawPath(yol(BUST.altin), boya(ONERI.murekkep));
    c.restore();
    yuzey.flush();
    return yuzey.makeImageSnapshot().encodeToBytes();
  }

  const yakin = { z: 4.4, merkez: kp };
  const gorseller = [
    ['komutan-A-bust', yakin, { arka: bustArka }],
    ['komutan-B-ayakta', yakin, { on: ayaktaOn }],
    ['komutan-C-madalyon', yakin, { on: madalyonOn }],
    ['hamle-hakki', { z: 3.2, merkez: kp }, { nefes: true }],
  ];
  fs.mkdirSync(CIKTI, { recursive: true });
  for (const [ad, g, ek] of gorseller) {
    fs.writeFileSync(path.join(CIKTI, 'oneri-' + ad + '.png'), Buffer.from(ciz(g, ek)));
    console.log('  oneri-' + ad);
  }
  fs.writeFileSync(path.join(CIKTI, 'oneri-komutan-portreler.png'), Buffer.from(portreler()));
  console.log('  oneri-komutan-portreler');

  const adlar = [...gorseller.map(([a]) => 'oneri-' + a), 'oneri-komutan-portreler'];
  const html =
    '<!doctype html><meta charset="utf-8"><title>Görsel öneriler</title>' +
    '<body style="background:#1c2a36;color:#eee;font:14px sans-serif;margin:16px">' +
    adlar
      .map(
        (ad) =>
          `<div style="margin:0 0 18px"><div style="margin:0 0 4px">${ad}</div>` +
          `<img src="${ad}.png" style="width:915px;max-width:100%"></div>`
      )
      .join('') +
    '</body>';
  fs.writeFileSync(path.join(CIKTI, 'oneri.html'), html);
  console.log('Yazıldı: ' + path.relative(KOK, CIKTI));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
