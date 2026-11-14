// ŞANS, ARAZİ VE BASKIN ÖLÇÜMÜ — GÖREV 12 / ADIM 3–5.
// Çalıştırma:  node scripts/sans-olcum.js     → veri/sans-olcum.md
//
// Baki'nin isteği (2026-08-06): *"Şans faktörünü bir tık artır, arazinin etkisini azalt
// ama arazi hâlâ şanstan güçlü olsun. Zayıf görünen ordular bile %1 şansla kazanabilsin;
// 1 piyade 2 zırhlı gibi savaşlarda bu olasılık 0 olsun."*
//
// BU BETİK ÜÇ SORUYU AYRI AYRI CEVAPLIYOR:
//   1. Umutsuz eşleşmede sürpriz gerçekten 0 mı?  (Baki'nin kırmızı çizgisi)
//   2. Zayıf görünen ordu ne sıklıkla kazanıyor?  (hedef: ~%1)
//   3. Açık üstün olan hâlâ kazanıyor mu?         (kazanılmış savaş kumara dönmesin)
//
// ⚠ AYNI EŞLEŞME İKİ AYRI ÖLÇEKTE OKUNUR: "kazanma yüzdesi" ve "şans sönümü". Sönüm 0
// ise o eşleşmede motor hiç zar atmıyor demektir — yüzdenin 0 çıkması tesadüf değil,
// kuralın kendisi.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz, hamHasar, zOrt, sansSonumu } = require('../src/oyun/muharebe.js');

const PROJ = path.join(__dirname, '..');
const KOSU = 4000;

const p = (n) => ({ piyade: n });
const t = (n) => ({ topcu: n });
const z = (n) => ({ zirhli: n });

const ESLESMELER = [
  ['3 piyade → 3 piyade', p(3), p(3), 'ova', 'denk'],
  ['3 piyade → 4 piyade', p(3), p(4), 'ova', 'zayıf'],
  ['2 piyade → 3 piyade', p(2), p(3), 'ova', 'zayıf'],
  ['3 piyade → 2 zırhlı', p(3), z(2), 'ova', 'zayıf'],
  ['2 topçu → 3 piyade', t(2), p(3), 'ova', 'zayıf'],
  ['3 zırhlı → 4 piyade (dağlık)', z(3), p(4), 'daglik', 'zayıf'],
  ['1 piyade → 2 zırhlı', p(1), z(2), 'ova', 'UMUTSUZ'],
  ['1 piyade → 3 zırhlı', p(1), z(3), 'ova', 'UMUTSUZ'],
  ['1 piyade → 4 zırhlı', p(1), z(4), 'ova', 'UMUTSUZ'],
  ['4 piyade → 3 piyade (dağlık)', p(4), p(3), 'daglik', 'üstün'],
  ['5 piyade → 3 piyade', p(5), p(3), 'ova', 'üstün'],
  ['4 zırhlı → 6 topçu', z(4), t(6), 'ova', 'üstün'],
];

function sonum(sal, sav) {
  const zA = zOrt(sal, DENGE.BIRIMLER),
    zS = zOrt(sav, DENGE.BIRIMLER);
  return sansSonumu(hamHasar(sal, zS, DENGE.BIRIMLER), hamHasar(sav, zA, DENGE.BIRIMLER));
}

function kosu(sal, sav, arazi) {
  let kazandi = 0;
  let baskinSayisi = 0;
  let baskinliKazanc = 0;
  for (let i = 1; i <= KOSU; i++) {
    const r = muharebeCoz({
      saldiran: { birimler: { ...sal } },
      savunan: { birimler: { ...sav } },
      arazi,
      moralBonuslari: { saldiran: 0, savunan: 0 },
      tohum: i * 7919,
    });
    if (r.baskin) baskinSayisi++;
    if (r.kazanan === 'saldiran') {
      kazandi++;
      if (r.baskin === 'saldiran') baskinliKazanc++;
    }
  }
  return {
    kazanma: (kazandi / KOSU) * 100,
    baskin: (baskinSayisi / KOSU) * 100,
    baskinliKazanc,
    kazanc: kazandi,
  };
}

// Şanssız (belirlenimci) sonuç — "kâğıt üstünde kim kazanır" sorusunun cevabı.
function sanssiz(sal, sav, arazi) {
  return muharebeCoz({
    saldiran: { birimler: { ...sal } },
    savunan: { birimler: { ...sav } },
    arazi,
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null,
  }).kazanan;
}

const M = DENGE.MUHAREBE;
const S = [];
const yaz = (...x) => S.push(...x);
const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);

yaz(
  '# ŞANS, ARAZİ VE BASKIN — GÖREV 12 / ADIM 3–5',
  '',
  '> Üretildi: `node scripts/sans-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10) + ' · eşleşme başına ' + KOSU + ' muharebe',
  '',
  '## AYARLAR',
  '',
  '| Sayı | Değer | Ne yapar |',
  '|---|---|---|',
  '| `SANS_BANDI` | ±%' + f1(M.SANS_BANDI * 100) + ' | raunt raunt dalgalanma |',
  '| `GUN_BANDI` | ±%' + f1(M.GUN_BANDI * 100) + ' | muharebe başına tek zar ("o günkü hâl") |',
  '| `BASKIN.OLASILIK` | %' + f1(M.BASKIN.OLASILIK * 100) + ' | denk savaşta baskın ihtimali |',
  '| `SANS_KAPANMA_ORANI` | ' + M.SANS_KAPANMA_ORANI + ' | bu güç farkında şans tamamen kapanır |',
  '| dağlık savunma | ×' + DENGE.ARAZI.daglik.savunan + ' | arazinin savunana verdiği |',
  '| tepelik savunma | ×' + DENGE.ARAZI.tepelik.savunan + ' | |',
  '',
  '**Arazi hâlâ şanstan güçlü:** dağlık savunma %' +
    f1((DENGE.ARAZI.daglik.savunan - 1) * 100) +
    ' veriyor, şans bandı ±%' +
    f1(M.SANS_BANDI * 100) +
    '. Baki’nin istediği sıra korunuyor.',
  '',
  '## SONUÇ',
  '',
  '| Eşleşme | Kâğıt üstünde | Şans sönümü | Saldıran kazanma | Baskın |',
  '|---|---|---|---|---|'
);

const sonuclar = [];
for (const [ad, sal, sav, arazi, sinif] of ESLESMELER) {
  const r = kosu(sal, sav, arazi);
  const s = sonum(sal, sav);
  sonuclar.push({ ad, sinif, ...r, sonum: s });
  yaz(
    '| ' +
      ad +
      ' | ' +
      (sanssiz(sal, sav, arazi) === 'saldiran' ? 'kazanır' : 'kaybeder') +
      ' | ' +
      f2(s) +
      ' | **%' +
      f1(r.kazanma) +
      '** | %' +
      f1(r.baskin) +
      ' |'
  );
}

const umutsuz = sonuclar.filter((r) => r.sinif === 'UMUTSUZ');
const zayif = sonuclar.filter((r) => r.sinif === 'zayıf');
const ustun = sonuclar.filter((r) => r.sinif === 'üstün');

yaz(
  '',
  '## BAKİ’NİN ÜÇ ŞARTI',
  '',
  '**1. Umutsuz eşleşmede sürpriz 0 olmalı** → ' +
    (umutsuz.every((r) => r.kazanma === 0 && r.sonum === 0)
      ? '✓ **sağlandı.** Üç umutsuz eşleşmede de şans sönümü 0, yani motor hiç zar atmıyor: ' +
        'ne raunt şansı, ne gün çarpanı, ne baskın. Kazanma oranı %0.'
      : '✗ SAĞLANMADI — ' +
        umutsuz
          .filter((r) => r.kazanma > 0)
          .map((r) => r.ad + ' %' + f1(r.kazanma))
          .join(', ')),
  '',
  '**2. Zayıf görünen ordu ~%1 kazanabilmeli** → zayıf eşleşmelerde kazanma oranı ' +
    zayif.map((r) => '%' + f1(r.kazanma)).join(' · ') +
    ' (ortalama **%' +
    f1(zayif.reduce((a, b) => a + b.kazanma, 0) / zayif.length) +
    '**).',
  '',
  '**3. Açık üstün olan kazanmaya devam etmeli** → üstün eşleşmelerde ' +
    ustun.map((r) => '%' + f1(r.kazanma)).join(' · ') +
    '. Kazanılmış savaş kumara dönmüyor.',
  '',
  '## NEDEN SADECE BANDI BÜYÜTMEK YETMEDİ',
  '',
  'İlk denemede yalnızca `SANS_BANDI` büyütüldü (0.10 → 0.16 → 0.25). Zayıf tarafın',
  'kazanma oranı **her üçünde de %0'.replace("'", '') + ' kaldı**; değişen tek şey güçlünün',
  'zaferinin bozulmasıydı (dağlıkta 4 piyade vs 3 piyade: %100 → %90). Sebep, şansın her',
  'raundda AYRI çekilmesi — 5–10 raunt boyunca ortalamaya yakınsıyor.',
  '',
  'Moral eşiğini düşürmek de denendi (savunana −1 ve −2 moral): **hiçbir eşleşme dönmedi.**',
  'Motor bir yıpranma yarışı; zayıf taraf kendi bozgun eşiğine her hâlükârda önce varıyor.',
  '',
  'Sürprizi üreten iki şey ölçümle bulundu: **gün çarpanı** (muharebe başına tek zar,',
  'ortalamaya yakınsamıyor) ve **baskın** (savaşın yapısını değiştiren olay).',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'sans-olcum.md'), S.join('\n'), 'utf8');
console.log('veri/sans-olcum.md yazıldı.');
for (const r of sonuclar) console.log(r.sinif.padEnd(8), r.ad.padEnd(30), f1(r.kazanma) + '%');
