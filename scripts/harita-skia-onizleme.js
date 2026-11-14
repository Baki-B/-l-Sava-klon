// SKIA HARİTASININ BİLGİSAYARDA ÖNİZLEMESİ VE ÖLÇÜMÜ (Görev 20 / Adım 2).
// Çalıştırma:  node scripts/harita-skia-onizleme.js [çıktı klasörü]
// Çıktı:       onizleme/harita-skia/*.png  +  veri/harita-skia-olcum.md
//
// NİYE VAR. Telefon başında olmadan haritayı GÖZLE denetlemek için. Telefondaki haritanın
// her karesini çizen fonksiyon (`src/haritaCizim.js sahneyiCiz`) burada Skia'nın bilgisayar
// sürümüyle (CanvasKit) AYNEN çağrılıyor: aynı taban resimleri, aynı rozetler, aynı kamera
// matematiği. Burada görünen şey telefonda görünenin aynısıdır; farklı olan yalnızca
// çizimi yapan donanım (burada işlemci, telefonda ekran kartı).
//
// ÜÇ İŞ:
//   1. Sekiz görünüm (uzak Türkiye → en yakın Yalova, kadro şeridi dahil), gerçek bir maçın 15.
//      turundan: sahiplikler karışmış, rozetler gerçek.
//   2. SADELEŞME DENETİMİ: her görüntü, seçilen seviye yerine EN İNCE seviyeyle de çizilir
//      ve iki görüntü piksel piksel karşılaştırılır. Kademeli geometri görünmez olmalı.
//   3. Hazırlık süreleri (yol ayrıştırma, şerit, resim kaydı). Kare süresi de yazılıyor ama
//      İŞLEMCİDE: çizgi şeridinin programı burada yorumlanıyor, telefonda ekran kartında.
//      Telefonun hızına yakın ölçüm `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md`.

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const CIKTI = path.resolve(process.argv[2] || path.join(KOK, 'onizleme', 'harita-skia'));
const OLCUM = path.join(KOK, 'veri', 'harita-skia-olcum.md');

// Yatay telefon (Baki'nin ekranına yakın) — çizim 2 kat piksel yoğunluğunda.
const EKRAN = { g: 915, y: 412, yogunluk: 2 };
// Yakınlaştırma aralığı — HaritaSkia.js ile aynı.
const EN_UZAK = 0.9;
const EN_YAKIN = 7;
const TOHUM = 7;
const TUR = 15;

async function main() {
  // ---- Skia'nın bilgisayar sürümü ----
  const ckYolu = require.resolve('canvaskit-wasm/bin/full/canvaskit.js');
  const CanvasKitInit = require(ckYolu);
  global.CanvasKit = await CanvasKitInit({ locateFile: (f) => path.join(path.dirname(ckYolu), f) });
  const {
    getSkiaExports,
    makeOffscreenSurface,
  } = require('@shopify/react-native-skia/lib/commonjs/headless');
  const { Skia } = getSkiaExports();

  // ---- Oyunun kendi modülleri (telefondakiyle aynı dosyalar) ----
  const { DENGE } = require('../src/denge.js');
  const { askeriTon, RENK, HARITA_SEVIYE_HATASI } = require('../src/tema.js');
  const { oyunKur, AKTOR_RENKLERI } = require('../src/oyun/oyunDurumu.js');
  const { turuBitir } = require('../src/oyun/turDongusu.js');
  const { komsular, hedefleriAyir, hamleHakkiTablosu } = require('../src/oyun/hareket.js');
  const { hamleHakki } = require('../src/oyun/hamle.js');
  const { savasIlanEt, savastaMi, ittifakMi } = require('../src/oyun/diplomasi.js');
  const { cepheHatlari } = require('../src/haritaSeviye.js');
  const { PARCALAR } = require('../src/oyun/veri.js');
  const { parcaRozetListesi, ilRozetListesi } = require('../src/rozetListesi.js');
  const { haritaOlcusu, kameraKaydirmasi, kameraDonusumu } = require('../src/haritaDonusum.js');
  const C = require('../src/haritaCizim.js');
  const seviyeVerisi = require('../veri/harita-seviyeleri.json');
  const parcaVerisi = require('../veri/parcalar.json');
  const haritaVerisi = require('../veri/harita.json');
  const susVerisi = require('../veri/harita-susleri.json');
  const nehirVerisi = require('../veri/harita-nehirler.json');
  const hatVerisi = require('../veri/turkiye-hat.json');

  const olc = (ad, fn) => {
    const t0 = process.hrtime.bigint();
    const r = fn();
    return [r, Number(process.hrtime.bigint() - t0) / 1e6];
  };

  // ---- Maç: 15 tur oynanmış bir Türkiye ----
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk: 'orta' });
  for (let i = 0; i < TUR; i++) d = turuBitir(d);

  // HAMLE HAKKI (Görev 21): tur yeni başladığı için bütün ordular taze. Görüntüde üç hâl de
  // görünsün: oyuncunun EN BÜYÜK ordusu askerlerinin bir kısmını oynatmış (Baki'nin sorusu:
  // "5 askerin 3'ü oynadıysa?"), ikincisi hakkını BİTİRMİŞ, gerisi taze.
  const buyukluk = (p) => Object.values(d.ordular[p].birimler).reduce((a, n) => a + n, 0);
  const benimOrdular = Object.keys(d.ordular)
    .filter((p) => d.ordular[p].sahip === d.oyuncuAktorId)
    .sort((a, b) => buyukluk(b) - buyukluk(a) || (a < b ? -1 : 1));
  const harca = (pid, oran) => {
    const o = d.ordular[pid];
    const hamle = {};
    for (const tur of Object.keys(o.birimler)) {
      const n = Math.round(o.birimler[tur] * oran);
      if (n > 0) hamle[tur] = { [hamleHakki(tur)]: n };
    }
    d = { ...d, ordular: { ...d.ordular, [pid]: { ...o, hamle } } };
  };
  if (benimOrdular[0]) harca(benimOrdular[0], 0.4);
  if (benimOrdular[1]) harca(benimOrdular[1], 1);
  // CEPHE (Görev 21): en uzun sınırı paylaştığı komşuya savaş açılıyor (zaten savaştaysa ilan
  // geçersiz, durum aynı kalır) — yalnızca görüntü için; kanca bu tabloyu `ittifakDurumlari`
  // olarak kuruyor.
  const ben = d.oyuncuAktorId;
  {
    // En uzun ortak sınırı olan komşu (hat sayısıyla).
    const ortak = {};
    for (const [a, b] of seviyeVerisi.hatSahipleri) {
      if (!b) continue;
      const sa = d.parcaSahipligi[a],
        sb = d.parcaSahipligi[b];
      if (sa === ben && sb && sb !== ben) ortak[sb] = (ortak[sb] || 0) + 1;
      if (sb === ben && sa && sa !== ben) ortak[sa] = (ortak[sa] || 0) + 1;
    }
    const komsuSahip = Object.keys(ortak).sort((x, y) => ortak[y] - ortak[x])[0];
    if (komsuSahip) {
      const r = savasIlanEt(d, ben, komsuSahip);
      if (r.ok) d = r.durum;
    }
  }
  const durumlar = {};
  for (const id of Object.keys(d.aktorler))
    durumlar[id] =
      id === ben
        ? 'ben'
        : ittifakMi(d, ben, id)
          ? 'ittifak'
          : savastaMi(d, ben, id)
            ? 'savas'
            : 'tarafsiz';
  const cephe = cepheHatlari(seviyeVerisi, d.parcaSahipligi, durumlar);
  const hakTablosu = hamleHakkiTablosu(d, d.oyuncuAktorId);

  const kom = (d.komutanlar || {})[d.oyuncuAktorId];
  const komutanParca = (kom && kom.parcaId) || null;
  const komutanIl = komutanParca && PARCALAR[komutanParca] ? PARCALAR[komutanParca].kod : null;
  const parcaRozetleri = parcaRozetListesi(d.ordular, komutanParca, hakTablosu);
  const ilRozetleri = ilRozetListesi(
    d.ordular,
    komutanIl,
    haritaVerisi.iller,
    hakTablosu,
    d.oyuncuAktorId
  );

  // ---- HaritaSkia.js'in useMemo'larının aynısı ----
  const meta = parcaVerisi.meta;
  const o = haritaOlcusu(EKRAN.g, EKRAN.y, meta.genislik, meta.yukseklik);
  const ekran = { f: o.f, yogunluk: EKRAN.yogunluk };
  const [kaynak, tKaynak] = olc('kaynak', () =>
    C.haritaKaynagiKur(Skia, seviyeVerisi, parcaVerisi.parcalar)
  );
  const bantlar = C.bantlariKur(o.f, kaynak.toleranslar, HARITA_SEVIYE_HATASI, EN_UZAK, EN_YAKIN);
  const sekil = C.sekilleriKur(Skia);
  const renk = C.sahneRenkleri(Skia);
  const [seritler, tSerit] = olc('şerit', () =>
    C.hatSeritleriKur(Skia, kaynak, null, bantlar, ekran)
  );
  const [hatResmi, tHat] = olc('hat', () =>
    C.hatResimleri(Skia, seritler, bantlar, true, renk, meta, ekran)
  );
  // Süsler (Görev 20): kıyı gölgesi, dağ, tepe, dalga.
  const [sus, tSus] = olc('süs', () =>
    C.susResimleri(Skia, C.susGeometrisiKur(susVerisi, hatVerisi.yol, null), bantlar, meta, ekran)
  );
  // Nehirler ve göller (Görev 21).
  const [nehir, tNehir] = olc('nehir', () =>
    C.nehirResimleri(Skia, C.nehirGeometrisiKur(nehirVerisi), bantlar, meta, ekran)
  );
  const dolgular = C.dolgulariHesapla(
    parcaVerisi.parcalar,
    'il',
    d.parcaSahipligi,
    AKTOR_RENKLERI,
    null,
    null
  );
  const [dolguResmi, tTaban] = olc('taban', () => C.dolguResimleri(Skia, kaynak, dolgular, meta));

  // Oyuncunun bir parçası seçili olsun: vurgu da denetlensin.
  const benimParca = Object.keys(d.parcaSahipligi).find(
    (p) => d.parcaSahipligi[p] === d.oyuncuAktorId
  );
  const vurgu = C.vurguResimleri(
    Skia,
    kaynak,
    { secili: benimParca, komsular: new Set(komsular(benimParca)), hedefler: null, oklar: [] },
    bantlar,
    meta,
    ekran
  );

  // DOĞRUDAN HAMLE (Görev 20 / Adım 5): kaynak seçili, iki tür hedef (kendi toprağın
  // pirinç, düşman kırmızı) ve ikinci dokunuşu bekleyen hedef tahmin renginde. Barışta
  // düşman hedefi olmayabilir; görüntü denetimi için o zaman sınırdaki yabancı parçalar
  // saldırı hedefi sayılıyor (yalnızca önizleme).
  // Kaynak: oyuncunun SINIRDAKİ bir parçası (iç parçanın bütün komşuları kendi toprağı).
  const hamleKaynagi =
    Object.keys(d.parcaSahipligi)
      .sort()
      .find(
        (p) =>
          d.parcaSahipligi[p] === d.oyuncuAktorId &&
          [...komsular(p)].some(
            (k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== d.oyuncuAktorId
          )
      ) || benimParca;
  const ayri = hedefleriAyir(d, d.oyuncuAktorId, hamleKaynagi);
  const dusmanHedef = ayri.dusman.length
    ? ayri.dusman
    : [...komsular(hamleKaynagi)].filter((p) => d.parcaSahipligi[p] !== d.oyuncuAktorId);
  const hamleVurgu = C.vurguResimleri(
    Skia,
    kaynak,
    {
      secili: hamleKaynagi,
      komsular: null,
      hedefler: new Set([...ayri.dost, ...dusmanHedef]),
      hedefSaldiri: new Set(dusmanHedef),
      hedefSecili: dusmanHedef.length ? { pid: dusmanHedef[0], renk: RENK.okTakviye } : null,
      oklar: [],
    },
    bantlar,
    meta,
    ekran
  );

  // Tarayıcıdaki hız ölçümü (`onizleme/harita-hiz.html`) AYNI maçı çizsin diye sahnenin
  // oyun tarafı düz veri olarak yazılıyor (oyun modülleri tarayıcıda koşmuyor).
  fs.mkdirSync(CIKTI, { recursive: true });
  fs.writeFileSync(
    path.join(CIKTI, 'sahne.json'),
    JSON.stringify({
      tohum: TOHUM,
      tur: TUR,
      sahiplik: d.parcaSahipligi,
      aktorRenk: AKTOR_RENKLERI,
      ilRozetleri,
      parcaRozetleri,
      benimParca,
      komsular: [...komsular(benimParca)],
      // Görev 21: cephe hattı (oyuncunun savaştığı devletle ortak sınır).
      cephe,
    })
  );

  const ttf = path.join(
    KOK,
    'node_modules/@expo-google-fonts/chakra-petch/700Bold/ChakraPetch_700Bold.ttf'
  );
  const yuz = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(new Uint8Array(fs.readFileSync(ttf)))
  );
  const font = Skia.Font(yuz, 13);
  const AYAR = {
    CAP: DENGE.ROZET.CAP,
    ORTA: DENGE.ROZET.ORTA_SINIR,
    YAKIN: DENGE.ROZET.YAKIN_SINIR,
    HISTEREZIS: DENGE.ROZET.KATMAN_HISTEREZIS,
    SERIT: DENGE.ROZET.SERIT_ESIGI,
    FIGUR: DENGE.ROZET.FIGUR_ESIGI,
  };
  const atlas = C.rozetAtlasiKur(Skia, font, sekil);
  const [cepheResmi, tCephe] = olc('cephe', () =>
    C.cepheResimleri(Skia, kaynak, cephe, bantlar, atlas, meta, ekran)
  );
  const [rozetler, tRozet] = olc('rozet', () =>
    C.rozetResimleri(Skia, { il: ilRozetleri, parca: parcaRozetleri }, o.f, atlas, renk, AYAR, meta)
  );

  const sahne = {
    bantUst: bantlar.map((b) => b.ust),
    bantSeviye: bantlar.map((b) => b.seviye),
    dolgular: dolguResmi,
    hatlar: hatResmi,
    susAlt: sus.alt,
    susUst: sus.ust,
    nehir,
    cephe: cepheResmi,
    vurgu,
    rozetler,
    katmanBoya: C.katmanBoyasi(Skia),
    atlasBoya: C.katmanBoyasi(Skia),
  };
  // Sadeleşme denetimi için aynı sahne, her bantta EN İNCE seviyeyle.
  const enInce = kaynak.toleranslar.length - 1;
  const inceBantlar = bantlar.map((b) => ({ ...b, seviye: enInce }));
  const inceSahne = {
    ...sahne,
    bantSeviye: bantlar.map(() => enInce),
    hatlar: C.hatResimleri(
      Skia,
      C.hatSeritleriKur(Skia, kaynak, null, inceBantlar, ekran),
      inceBantlar,
      true,
      renk,
      meta,
      ekran
    ),
  };

  const deniz = Skia.Color(askeriTon(RENK.deniz));
  const et = (pid) => PARCALAR[pid].etiket;
  // Cephenin ilk hattının ortası (yakın görünüm için).
  const cepheOrtasi = () => {
    if (!cephe.length) return et(benimParca);
    const orta = cephe[Math.floor(cephe.length / 2)].hat;
    const yol = seviyeVerisi.seviyeler[0].hatlar[orta].replace(/[MZ]/g, '').split('L');
    const [x, y] = yol[Math.floor(yol.length / 2)].split(',').map(Number);
    return { x, y };
  };
  const ilEt = (kod) => haritaVerisi.iller[kod].etiket;

  const gorunumler = [
    { ad: '1-uzak-turkiye', z: 0.9, merkez: null },
    { ad: '2-il-rozetleri-ankara', z: 1.6, merkez: ilEt('06') },
    { ad: '3-gecis-istanbul', z: 2.5, merkez: ilEt('34') },
    { ad: '4-parca-rozetleri-marmara', z: 4, merkez: ilEt('16') },
    { ad: '5-en-yakin-yalova', z: 7, merkez: et('77-1') },
    { ad: '6-secili-parca', z: 3.2, merkez: et(benimParca) },
    { ad: '7-kadro-seridi-ege', z: 4.5, merkez: ilEt('45') },
    { ad: '8-kadro-seridi-marmara', z: 4, merkez: ilEt('41') },
    {
      ad: '9-dogrudan-hamle',
      z: 3.2,
      merkez: et(hamleKaynagi),
      sahne: { ...sahne, vurgu: hamleVurgu },
      inceSahne: { ...inceSahne, vurgu: hamleVurgu },
    },
    // Hamle hakkı (Görev 21): tam halka · yarım halka · soluk kalkan. İkincisi nefesin en
    // sönük anı (telefonda ikisinin arasında yavaşça gidip geliyor).
    { ad: '10-hamle-hakki', z: 3.4, merkez: et(benimOrdular[0] || benimParca) },
    { ad: '10b-hamle-hakki-sonuk-an', z: 3.4, merkez: et(benimOrdular[0] || benimParca), nefes: 0 },
    { ad: '11-hamle-hakki-il', z: 1.8, merkez: et(benimOrdular[0] || benimParca) },
    // Cephe hattı (Görev 21): savaştığın devletle ortak sınır, dişler düşmana bakıyor.
    // Nehirler ve göller (Görev 21 · Natural Earth).
    { ad: '15-nehir-goller-uzak', z: 1, merkez: null },
    { ad: '15b-nehir-van-golu', z: 3, merkez: ilEt('65') },
    { ad: '15c-nehir-tuz-golu', z: 2.2, merkez: ilEt('68') },
    // Birlik figürleri (Görev 21): en yakında kadro şeridinin yerini alıyor.
    { ad: '14-birlik-figurleri', z: 6, merkez: ilEt('45') },
    { ad: '14b-birlik-figurleri-marmara', z: 7, merkez: ilEt('41') },
    {
      ad: '12-cephe-hatti',
      z: 2.2,
      merkez: cepheOrtasi(),
      sahne: { ...sahne, vurgu: null },
      inceSahne: { ...inceSahne, vurgu: null },
    },
    {
      ad: '12b-cephe-hatti-yakin',
      z: 7,
      merkez: cepheOrtasi(),
      sahne: { ...sahne, vurgu: null },
      inceSahne: { ...inceSahne, vurgu: null },
    },
  ];

  fs.mkdirSync(CIKTI, { recursive: true });
  const satirlar = [];

  function ciz(s, g) {
    const yuzey = makeOffscreenSurface(EKRAN.g * EKRAN.yogunluk, EKRAN.y * EKRAN.yogunluk);
    const c = yuzey.getCanvas();
    c.drawColor(deniz);
    c.save();
    c.scale(EKRAN.yogunluk, EKRAN.yogunluk);
    const kay = g.merkez ? kameraKaydirmasi(g.merkez.x, g.merkez.y, o, g.z) : { tx: 0, ty: 0 };
    const k = kameraDonusumu(o, g.z, kay.tx, kay.ty);
    const t0 = process.hrtime.bigint();
    // Rozet katmanı: telefonda zamanla geçiyor; durağan görüntüde geçiş bitmiş hâli.
    const parcaSaydam = C.rozetKatmaniSec(g.z, g.z >= AYAR.YAKIN ? 1 : 0, AYAR);
    const seritSaydam = C.seritKatmaniSec(g.z, g.z >= AYAR.SERIT ? 1 : 0, AYAR) * parcaSaydam;
    const figurSaydam = C.figurKatmaniSec(g.z, g.z >= AYAR.FIGUR ? 1 : 0, AYAR) * parcaSaydam;
    C.sahneyiCiz(c, s, {
      k: k.k,
      bx: k.bx,
      by: k.by,
      z: g.z,
      parcaSaydam,
      seritSaydam,
      figurSaydam,
      nefes: g.nefes === undefined ? 1 : g.nefes,
    });
    yuzey.flush();
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    c.restore();
    return { resim: yuzey.makeImageSnapshot(), ms, yuzey };
  }

  function pikseller(resim) {
    // Skia'nın kendi numaralandırması (RGBA_8888 = 4, Unpremul = 3) — CanvasKit'inki değil.
    return resim.readPixels(0, 0, {
      width: resim.width(),
      height: resim.height(),
      colorType: 4,
      alphaType: 3,
    });
  }

  for (const g of gorunumler) {
    const sv = sahne.bantSeviye[C.bantSec(g.z, sahne.bantUst)];
    // Kare süresi: ısınmadan sonra 5 çizimin ortalaması.
    const gs = g.sahne || sahne;
    ciz(gs, g);
    let top = 0;
    let son;
    for (let i = 0; i < 5; i++) {
      son = ciz(gs, g);
      top += son.ms;
    }
    const png = son.resim.encodeToBytes();
    fs.writeFileSync(path.join(CIKTI, g.ad + '.png'), Buffer.from(png));

    // Sadeleşme denetimi: seçilen seviye ile en ince seviye arasındaki piksel farkı.
    const ince = ciz(g.inceSahne || inceSahne, g);
    const a = pikseller(son.resim),
      b = pikseller(ince.resim);
    let farkli = 0;
    for (let i = 0; i < a.length; i += 4) {
      const f = Math.max(
        Math.abs(a[i] - b[i]),
        Math.abs(a[i + 1] - b[i + 1]),
        Math.abs(a[i + 2] - b[i + 2])
      );
      if (f > 48) farkli++;
    }
    const oran = (100 * farkli) / (a.length / 4);
    satirlar.push({
      ad: g.ad,
      z: g.z,
      tolerans: kaynak.toleranslar[sv],
      nokta: seviyeVerisi.seviyeler[sv].nokta,
      ms: top / 5,
      inceMs: ince.ms,
      fark: oran,
    });
  }

  // ---- Rapor ----
  const bugun = new Date().toISOString().slice(0, 10);
  let md = '# SKIA HARİTASI — BİLGİSAYAR ÖLÇÜMÜ\n\n';
  md +=
    '> Üretim: `node scripts/harita-skia-onizleme.js` · ' +
    bugun +
    ' · görev: `docs/GOREV-20-sezgi-ve-akicilik.md`\n';
  md +=
    '> Maç: Türkiye, tohum ' +
    TOHUM +
    ', ' +
    TUR +
    '. tur · ekran ' +
    EKRAN.g +
    '×' +
    EKRAN.y +
    ' dp (yatay telefon), çizim ' +
    EKRAN.yogunluk +
    '× yoğunlukta.\n';
  md += '> Görüntüler: `onizleme/harita-skia/` (depoya girmiyor, bu betik yeniden üretir).\n\n';
  md +=
    '⚠ Süreler bilgisayarın İŞLEMCİSİNDE ölçüldü (CanvasKit). Telefonda çizimi ekran kartı yapıyor; ';
  md +=
    'mutlak süre farklıdır. Bu tablo sadeleşmenin görünürlüğünü söyler; hız için ' +
    '`onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md` (ekran kartıyla).\n\n';
  md += '## 1. Hazırlık (maç başında / veri değişince, JS iş parçacığı)\n\n';
  md += '| İş | Süre |\n|---|---|\n';
  md +=
    "| 4 seviyenin 181'er dolgu yolu + tam yollar (bir kez) | " + tKaynak.toFixed(0) + ' ms |\n';
  md += '| Sınır çizgisi şeritleri (maç başına) | ' + tSerit.toFixed(0) + ' ms |\n';
  md += '| ' + bantlar.length + ' bandın çizgi resmi (maç başına) | ' + tHat.toFixed(0) + ' ms |\n';
  md += '| Süsler: kıyı gölgesi, dağ, tepe, dalga (maç başına) | ' + tSus.toFixed(0) + ' ms |\n';
  md += '| Rozet resimleri (ordular değişince) | ' + tRozet.toFixed(0) + ' ms |\n';
  md +=
    '| Cephe hattı: ' +
    cephe.length +
    ' hat (sahiplik/savaş değişince) | ' +
    tCephe.toFixed(0) +
    ' ms |\n';
  md += '| Nehirler ve göller (maç başına) | ' + tNehir.toFixed(0) + ' ms |\n';
  md += '| 4 dolgu resminin kaydı (sahiplik değişince) | ' + tTaban.toFixed(0) + ' ms |\n\n';
  md += '## 2. Kare başına çizim ve sadeleşme denetimi\n\n';
  md +=
    '| Görünüm | Yakınlık | Seçilen tolerans | Nokta | Kare (işlemci) | En ince seviyeyle kare | Farklı piksel |\n';
  md += '|---|---|---|---|---|---|---|\n';
  for (const r of satirlar) {
    md +=
      '| ' +
      r.ad +
      ' | ' +
      r.z +
      '× | ' +
      r.tolerans +
      ' | ' +
      r.nokta +
      ' | ' +
      r.ms.toFixed(1) +
      ' ms | ' +
      r.inceMs.toFixed(1) +
      ' ms | %' +
      r.fark.toFixed(3) +
      ' |\n';
  }
  md +=
    "\n**Farklı piksel**: seçilen seviye ile en ince seviyenin görüntüsünde renk kanalı 48'den fazla ";
  md += 'ayrışan piksellerin oranı. Sıfıra yakın olmalı — kademeli geometri göze görünmemeli.\n';
  fs.writeFileSync(OLCUM, md);

  console.log('SKIA HARİTASI — bilgisayar önizlemesi');
  console.log(
    '  hazırlık: yollar ' +
      tKaynak.toFixed(0) +
      ' ms · hatlar ' +
      tHat.toFixed(0) +
      ' ms · süsler ' +
      tSus.toFixed(0) +
      ' ms · 4 dolgu resmi ' +
      tTaban.toFixed(0) +
      ' ms'
  );
  for (const r of satirlar)
    console.log(
      '  ' +
        r.ad.padEnd(28) +
        ' z=' +
        String(r.z).padEnd(4) +
        ' tol ' +
        String(r.tolerans).padEnd(5) +
        r.nokta +
        ' nokta · kare ' +
        r.ms.toFixed(1) +
        ' ms (ince: ' +
        r.inceMs.toFixed(1) +
        ') · fark %' +
        r.fark.toFixed(3)
    );
  console.log('Görüntüler: ' + path.relative(KOK, CIKTI));
  console.log('Yazıldı: ' + path.relative(KOK, OLCUM));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
