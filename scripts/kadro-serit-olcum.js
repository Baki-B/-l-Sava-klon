// KADRO ŞERİDİ ÖLÇÜMÜ (Görev 20; planın ölçüm borcu: YOL-HARITASI-v11 §17.2).
// Çalıştırma:  node scripts/kadro-serit-olcum.js
// Çıktı:       veri/kadro-serit-olcum.md
//
// İKİ SORU:
//   1. OKUNUYOR MU? Şeritteki sayının ve figürün ekrandaki boyu, eşik yakınlıkta kaç dp.
//      Rozet haritayla büyüdüğü için şerit de büyüyor: eşik ne kadar yüksekse o kadar iri.
//   2. ÇARPIŞIYOR MU? Şerit kalkandan geniş; sık illerde (Marmara) komşu parçanın rozetine
//      ya da şeridine binebilir. Rozet artık haritanın PARÇASI (harita biriminde sabit boy),
//      yani çakışma yakınlığa bağlı değil: tek bir hesap her yakınlık için geçerli.
//
// İki durum ölçülüyor: gerçek bir maçın 15. turu ve EN KÖTÜ durum (her parçada üç tür de,
// iki haneli sayılarla — şerit en geniş hâlinde).

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const CIKTI = path.join(KOK, 'veri', 'kadro-serit-olcum.md');
// Yatay telefon (harita-skia-onizleme.js ile aynı).
const EKRAN = { g: 915, y: 412 };
const TOHUM = 7;
const TUR = 15;
// Denenen eşikler (yakınlık) — seçilen DENGE.ROZET.SERIT_ESIGI tabloda işaretli.
const ESIKLER = [3, 3.5, 4, 4.5, 5];

async function main() {
  const ckYolu = require.resolve('canvaskit-wasm/bin/full/canvaskit.js');
  const CanvasKitInit = require(ckYolu);
  global.CanvasKit = await CanvasKitInit({ locateFile: (f) => path.join(path.dirname(ckYolu), f) });
  const { getSkiaExports } = require('@shopify/react-native-skia/lib/commonjs/headless');
  const { Skia } = getSkiaExports();

  const { DENGE } = require('../src/denge.js');
  const { oyunKur } = require('../src/oyun/oyunDurumu.js');
  const { turuBitir } = require('../src/oyun/turDongusu.js');
  const { parcaRozetListesi } = require('../src/rozetListesi.js');
  const { haritaOlcusu } = require('../src/haritaDonusum.js');
  const C = require('../src/haritaCizim.js');
  const parcaVerisi = require('../veri/parcalar.json');

  const ttf = path.join(
    KOK,
    'node_modules/@expo-google-fonts/chakra-petch/700Bold/ChakraPetch_700Bold.ttf'
  );
  const yuz = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(new Uint8Array(fs.readFileSync(ttf)))
  );
  const font = Skia.Font(yuz, 13);
  const m = font.getMetrics();
  // Şeridin ölçüsü için yalnızca rakamların ilerlemesi gerekiyor (resim sayfası çizilmiyor).
  const atlas = { rakam: {}, yukselis: m.ascent, inis: m.descent };
  for (const ch of '0123456789+') atlas.rakam[ch] = { ilerleme: font.getTextWidth(ch) };
  // Büyük harf yüksekliği (13 puntoda) — sayının okunurluğu bununla ölçülür.
  const buyukHarf = m.capHeight || -m.ascent * 0.7;

  const AYAR = {
    CAP: DENGE.ROZET.CAP,
    ORTA: DENGE.ROZET.ORTA_SINIR,
    YAKIN: DENGE.ROZET.YAKIN_SINIR,
  };
  const o = haritaOlcusu(EKRAN.g, EKRAN.y, parcaVerisi.meta.genislik, parcaVerisi.meta.yukseklik);
  const boy = C.rozetDunyaBoyu(AYAR.YAKIN, o.f, AYAR); // harita birimi
  const olcek = boy / 26; // harita birimi / kutu birimi
  const S = C.KADRO_SERIDI;

  // Bir rozetin kalkan ve şerit kutuları (harita biriminde).
  function kutular(r) {
    const kay = boy / AYAR.CAP;
    const cx = r.x + (r.dx || 0) * kay,
      cy = r.y + (r.dy || 0) * kay;
    const bx = cx - 13 * olcek,
      by = cy - 13 * olcek;
    const kalkan = {
      x0: bx + 1.8 * olcek,
      y0: by + 1.2 * olcek,
      x1: bx + 24.2 * olcek,
      y1: by + 25 * olcek,
    };
    if (!r.kadro || r.kadro.length === 0) return { kalkan, serit: null };
    const so = C.seritOlcusu(r.kadro, atlas);
    const sol = 13 - so.genislik / 2;
    const serit = {
      x0: bx + sol * olcek,
      y0: by + S.UST * olcek,
      x1: bx + (sol + so.genislik) * olcek,
      y1: by + (S.UST + so.yukseklik) * olcek,
      genislik: so.genislik,
    };
    return { kalkan, serit };
  }
  const kesisir = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

  function olc(liste) {
    const k = liste.map((r) => ({ r, ...kutular(r) }));
    let seritSerit = 0,
      seritKalkan = 0;
    const carpisan = new Set();
    let enGenis = 0;
    for (let i = 0; i < k.length; i++) {
      if (!k[i].serit) continue;
      enGenis = Math.max(enGenis, k[i].serit.genislik);
      for (let j = 0; j < k.length; j++) {
        if (i === j) continue;
        if (j > i && k[j].serit && kesisir(k[i].serit, k[j].serit)) {
          seritSerit++;
          carpisan.add(k[i].r.anahtar).add(k[j].r.anahtar);
        }
        if (kesisir(k[i].serit, k[j].kalkan)) {
          seritKalkan++;
          carpisan.add(k[i].r.anahtar).add(k[j].r.anahtar);
        }
      }
    }
    return { sayi: k.filter((x) => x.serit).length, seritSerit, seritKalkan, carpisan, enGenis };
  }

  // Gerçek maç
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk: 'orta' });
  for (let i = 0; i < TUR; i++) d = turuBitir(d);
  const gercek = parcaRozetListesi(d.ordular, null);
  // En kötü durum: her parçada üç tür, iki haneli
  const enKotu = gercek.map((r) => ({
    ...r,
    kadro: [
      { tur: 'piyade', yazi: '88' },
      { tur: 'topcu', yazi: '88' },
      { tur: 'zirhli', yazi: '88' },
    ],
  }));
  // Bütün parçalarda ordu varmış gibi (maç başı: her parçada bir ordu)
  const hepsi = Object.keys(parcaVerisi.parcalar).map((pid) => {
    const eski = gercek.find((r) => r.anahtar === 'p' + pid);
    const p = parcaVerisi.parcalar[pid];
    return (
      eski || {
        anahtar: 'p' + pid,
        x: p.etiket.x,
        y: p.etiket.y,
        dx: 0,
        dy: 0,
        kadro: [{ tur: 'piyade', yazi: '4' }],
      }
    );
  });
  const A = olc(gercek);
  const B = olc(enKotu);
  const Cc = olc(hepsi);

  // ---- Okunurluk ----
  const satirlar = ESIKLER.map((z) => {
    const kutuDp = (AYAR.CAP * z) / AYAR.YAKIN / 26; // bir kutu biriminin ekrandaki dp'si
    return {
      z,
      rozet: (AYAR.CAP * z) / AYAR.YAKIN,
      figur: S.FIGUR * kutuDp,
      sayi: ((S.YAZI * buyukHarf) / 13) * kutuDp,
      serit: S.FIGUR * kutuDp + 2 * S.PAY * kutuDp,
    };
  });

  const secili = DENGE.ROZET.SERIT_ESIGI;
  let md = '# KADRO ŞERİDİ — OKUNURLUK VE ÇAKIŞMA\n\n';
  md +=
    '> Üretim: `node scripts/kadro-serit-olcum.js` · ' +
    new Date().toISOString().slice(0, 10) +
    ' · görev: `docs/GOREV-20-sezgi-ve-akicilik.md` §10\n';
  md +=
    '> Ekran ' +
    EKRAN.g +
    '×' +
    EKRAN.y +
    ' dp (yatay telefon) · ölçüler `src/haritaCizim.js KADRO_SERIDI`.\n\n';
  md += '## 1. Okunurluk: eşik yakınlıkta ekrandaki boylar (dp)\n\n';
  md +=
    '| Yakınlık | Kalkan | Figür kutusu | Sayının büyük harfi | Şerit yüksekliği |\n|---|---:|---:|---:|---:|\n';
  for (const r of satirlar) {
    md +=
      '| ' +
      r.z +
      '×' +
      (Math.abs(r.z - secili) < 1e-9 ? ' **(seçilen)**' : '') +
      ' | ' +
      r.rozet.toFixed(0) +
      ' | ' +
      r.figur.toFixed(1) +
      ' | ' +
      r.sayi.toFixed(1) +
      ' | ' +
      r.serit.toFixed(1) +
      ' |\n';
  }
  md +=
    "\nÖlçüt: sayının büyük harfi **≥ 7 dp** (yazı okunurluk sınırı, `tema-olcum.md`'deki en " +
    'küçük gövde yazısıyla aynı). Eşiğin üstünde şerit haritayla birlikte büyüyor.\n\n';
  md += '## 2. Çakışma (harita biriminde — her yakınlıkta aynı)\n\n';
  md +=
    '| Durum | Şeritli rozet | Şerit ↔ şerit | Şerit ↔ başka kalkan | Etkilenen rozet | En geniş şerit (kutu) |\n|---|---:|---:|---:|---:|---:|\n';
  const satir = (ad, x) =>
    '| ' +
    ad +
    ' | ' +
    x.sayi +
    ' | ' +
    x.seritSerit +
    ' | ' +
    x.seritKalkan +
    ' | ' +
    x.carpisan.size +
    ' | ' +
    x.enGenis.toFixed(1) +
    ' |\n';
  md += satir('Gerçek maç (' + TUR + '. tur)', A);
  md += satir('Maç başı (her parçada ordu)', Cc);
  md += satir('En kötü (her parçada 3 tür, 2 hane)', B);
  md += '\nÇakışan rozetler (gerçek maç): ' + ([...A.carpisan].sort().join(', ') || 'yok') + '\n';
  md += '\nÇakışan rozetler (maç başı): ' + ([...Cc.carpisan].sort().join(', ') || 'yok') + '\n';
  md +=
    '\nKalkanın kendisi 26 kutu; şerit tek türde ~20, üç türde ~55 kutu. Çakışmada şerit (en ' +
    'üst katman) komşu rozetin üstüne biner.\n';
  fs.writeFileSync(CIKTI, md);
  console.log(md);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
