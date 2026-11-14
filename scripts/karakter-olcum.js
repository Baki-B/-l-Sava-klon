// GÖREV 12 / ADIM 2'NİN BİTİŞ ÖLÇÜTÜ — HER OYUN GERÇEKTEN FARKLI MI İLERLİYOR?
// Çalıştırma:  node scripts/karakter-olcum.js     → veri/karakter-olcum.md
//
// Baki'nin isteği (2026-08-06): *"Her yeni savede Agresif/Dengeli/Çekimser karakter
// özellikleri 81 il arasında rastgele dağıtılsın ve her oyun farklı hissettirsin; asıl
// olay her oyun aynı ilerlemelerin olmaması."*
//
// SORU: "farklı hissettirsin" ölçülebilir bir şey mi? Evet — AYNI zorlukta, AYNI oyuncu
// davranışıyla, yalnızca TOHUM değişerek koşulan maçlar birbirinden ayrışmalı. Ayrışmıyorsa
// karakterler kâğıt üstünde kalmış demektir.
//
// ⚠ OYUNCU HİÇ EMİR VERMİYOR. `zeka-olcum.js` oyuncunun politikasını yazıyordu çünkü ölçtüğü
// şey oyuncunun aldığı topraktı; burada ölçülen şey DÜNYANIN kendi kendine nasıl geliştiği.
// Oyuncu karışsaydı, koşular arasındaki farkın karakterlerden mi oyuncunun tesadüfen farklı
// düşen hamlelerinden mi geldiği ayrılamazdı.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');

const PROJ = path.join(__dirname, '..');
const TUR_SAYISI = 25;
const TOHUMLAR = [101, 2024, 31337, 606060, 987654];
const Z = DENGE.ZEKA;

function kosu(tohum, zorluk) {
  let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk });

  // Karakter dağılımı (kişilik kayda girmiyor, kurulumda türetiliyor).
  const dagilim = {};
  for (const ad of Z.KARAKTER_SIRASI) dagilim[ad] = 0;
  for (const id of Object.keys(d.kisilikler || {})) dagilim[d.kisilikler[id].karakter]++;

  let muharebe = 0;
  let ilkSavasTuru = 0;
  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    d = turuBitir(d);
    // ⚠ MUHAREBE SAYISI RAPOR SATIRLARINDAN OKUNUR. İlk sürümde `rapor.muharebeler` diye
    // olmayan bir alan okunuyordu ve ölçüm her koşuda "0 muharebe" diyordu — dünya büyürken
    // hiç savaş yokmuş gibi görünüyordu. Rapor muharebeyi ayrı listede tutmuyor, satırların
    // `tip` alanında tutuyor (`cozum.js`).
    const r = d.sonTurRaporu || {};
    const n = (r.satirlar || []).filter((s) => s.tip === 'muharebe').length;
    muharebe += n;
    if (!ilkSavasTuru && n > 0) ilkSavasTuru = tur;
  }

  const sayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sayim[v] = (sayim[v] || 0) + 1;
  const buyukluk = Object.values(sayim).sort((a, b) => b - a);
  // Savaş hali sayısı: kaç ayrı çift birbirine düşmüş.
  const savasSayisi = Object.values(d.iliskiler || {}).filter((x) => x && x.tip === 'savas').length;

  return {
    tohum,
    dagilim,
    enBuyuk: buyukluk[0] || 0,
    ikinci: buyukluk[1] || 0,
    aktorKaldi: buyukluk.length,
    muharebe,
    ilkSavasTuru,
    savasSayisi,
  };
}

// Ayrışma ölçüsü: değerlerin ortalamaya göre yayılımı (varyasyon katsayısı, %).
// Tek bir sayıyla "bu koşular birbirine benziyor mu" sorusunu cevaplıyor.
function yayilim(sayilar) {
  const n = sayilar.length;
  const ort = sayilar.reduce((a, b) => a + b, 0) / n;
  if (ort === 0) return 0;
  const varyans = sayilar.reduce((a, b) => a + (b - ort) * (b - ort), 0) / n;
  return (Math.sqrt(varyans) / ort) * 100;
}

const S = [];
const yaz = (...x) => S.push(...x);
const f1 = (x) => x.toFixed(1);

yaz(
  '# KARAKTER ÖLÇÜMÜ — GÖREV 12 / ADIM 2’NİN BİTİŞ ÖLÇÜTÜ',
  '',
  '> Üretildi: `node scripts/karakter-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Soru: **her oyun gerçekten farklı mı ilerliyor?** Aynı zorluk, aynı kapsam, oyuncu hiç',
  'emir vermiyor; değişen tek şey TOHUM. ' + TUR_SAYISI + ' tur, ' + TOHUMLAR.length + ' maç.',
  ''
);

for (const zorluk of Z.ZORLUK_SIRASI) {
  const sonuclar = TOHUMLAR.map((t) => kosu(t, zorluk));
  yaz(
    '## ' + (Z.ZORLUK[zorluk].ad || zorluk).toUpperCase() + ' KADEME',
    '',
    '| Tohum | Sld/Dng/Çkm | En büyük | 2. büyük | Kalan aktör | Muharebe | İlk savaş turu |',
    '|---|---|---|---|---|---|---|'
  );
  for (const r of sonuclar) {
    yaz(
      '| ' +
        r.tohum +
        ' | ' +
        r.dagilim.saldirgan +
        '/' +
        r.dagilim.dengeli +
        '/' +
        r.dagilim.cekimser +
        ' | ' +
        r.enBuyuk +
        ' | ' +
        r.ikinci +
        ' | ' +
        r.aktorKaldi +
        ' | ' +
        r.muharebe +
        ' | ' +
        (r.ilkSavasTuru || '—') +
        ' |'
    );
  }
  const enBuyukler = sonuclar.map((r) => r.enBuyuk);
  const muharebeler = sonuclar.map((r) => r.muharebe);
  yaz(
    '',
    '**Ayrışma (maçlar arası yayılım):** en büyük imparatorluk **%' +
      f1(yayilim(enBuyukler)) +
      '** · muharebe sayısı **%' +
      f1(yayilim(muharebeler)) +
      '**',
    '',
    'En büyük imparatorluk ' +
      Math.min(...enBuyukler) +
      ' ile ' +
      Math.max(...enBuyukler) +
      ' parça arasında değişiyor.',
    ''
  );
}

yaz(
  '## NASIL OKUNUR',
  '',
  '- **Ayrışma yüzdesi**, beş maçın birbirinden ne kadar farklı bittiğini söylüyor.',
  '  Sıfıra yakınsa bütün maçlar aynı yerde bitiyor demektir ve karakterler işe yaramıyordur.',
  '- **Sld/Dng/Çkm** sütunu o maçta kaç ilin hangi karakteri çektiğini gösteriyor; karışım',
  '  `DENGE.ZEKA.KARISIM` tablosundan geliyor ve zorlukla kayıyor.',
  '- **İlk savaş turu** karakterin tempoya etkisi: saldırganların çok olduğu maç erken kızışır.',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'karakter-olcum.md'), S.join('\n'), 'utf8');
console.log('veri/karakter-olcum.md yazıldı.');
