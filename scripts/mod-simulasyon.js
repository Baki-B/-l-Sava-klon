// MOD BAZLI SİMÜLASYON — 2026-08-12, Baki: "oyunun modlarına göre simülasyonlar falan yap".
// Çalıştırma:  node scripts/mod-simulasyon.js     → veri/mod-simulasyon.md
//
// ---- NE SORUYOR ----
//
// `mod-esik-olcum.js` tek bir soruyu soruyor: "en büyük imparatorluk hangi turda haritanın
// %25/%50/%75'ine ulaşıyor". Bu betik ondan farklı: HER MODUN kendi kazanma koşulunu,
// kendi tur sınırıyla ve kendi ölçüsüyle sınıyor. Üç mod üç ayrı oyun:
//
//   Fetih          → haritanın TAMAMI. Sınırsız süre.
//   %50 Hâkimiyet  → yarısı. Sınırsız süre.
//   Güç Yarışı     → süre dolunca SIRALAMA. Sınırlı süre.
//
// ---- NEDEN AYRICA SİLAHLANMA ÖLÇÜLÜYOR ----
//
// Baki'nin şikâyeti (2026-08-12): *"iller yakınındaki bir il asker bastığında o basıyor,
// diğeri basıyor, döngüye giriyorlar; 100–200 askere kadar devam ediyorlar."* Üretim freni
// (`DENGE.ZEKA.DOYMA`) o şikâyet üzerine kondu ve etkisi burada modlarla birlikte izleniyor:
// yığın büyüklüğü ile fetih hızı AYNI TABLODA, çünkü ikisi aynı madalyonun iki yüzü —
// ordular şişiyorsa kimse saldıramıyor demektir.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { birimSayisi, parcaOrdusu } = require('../src/oyun/ordu.js');
const { modTurSiniri, modKazanmaEsigi, senaryoKapsami } = require('../src/oyun/senaryolar.js');

const PROJ = path.join(__dirname, '..');
const TOHUMLAR = [20260801, 20260802];
const MODLAR = ['fetih', 'yarim', 'puan'];
const ZORLUKLAR = ['kolay', 'orta', 'zor'];

// Sınırsız modda ölçüm ufku: modun kendi `TABAN + PARCA_BASINA × parça` temposu.
// (Aynı kural `mod-esik-olcum.js`'te; sebebi orada yazılı — `modTurSiniri` bir döngü
// sınırı değildir, sınırsız modda `Infinity` döner.)
function olcumUfku(modTipi, kapsam) {
  const sinir = modTurSiniri(modTipi, kapsam);
  if (Number.isFinite(sinir)) return { ufuk: sinir, sinirsiz: false };
  const t = DENGE.MOD.TIPLER[modTipi];
  const parca = senaryoKapsami(kapsam).kapsamParcalar.length;
  return { ufuk: Math.round(t.TABAN + t.PARCA_BASINA * parca), sinirsiz: true };
}

function olc(d) {
  let toplam = 0,
    enBuyuk = 0,
    ordulu = 0;
  for (const pid of Object.keys(d.parcaSahipligi)) {
    const o = parcaOrdusu(d, pid);
    const n = o ? birimSayisi(o.birimler) : 0;
    if (n === 0) continue;
    toplam += n;
    ordulu++;
    if (n > enBuyuk) enBuyuk = n;
  }
  const say = {};
  for (const v of Object.values(d.parcaSahipligi)) say[v] = (say[v] || 0) + 1;
  return {
    toplamOrdu: toplam,
    enBuyukYigin: enBuyuk,
    ortOrdu: ordulu ? toplam / ordulu : 0,
    sahipSayisi: Object.keys(say).length,
    enBuyukImp: Math.max(...Object.values(say)),
  };
}

// Tek koşu. Dönen: kazanma eşiğine ulaşıldıysa tur, zirve ordu ölçüleri, fetih sayısı.
function kosu(mod, kapsam, zorluk, tohum, ufuk) {
  let d = oyunKur({ senaryo: kapsam, tohum, zorluk });
  const toplamParca = Object.keys(d.parcaSahipligi).length;
  const esik = modKazanmaEsigi(mod, kapsam);
  let ulasilanTur = null;
  let zirveYigin = 0,
    zirveOrt = 0,
    elDegisen = 0;
  let son = null;

  for (let t = 1; t <= ufuk; t++) {
    const onceki = { ...d.parcaSahipligi };
    d = turuBitir(d);
    for (const pid of Object.keys(d.parcaSahipligi))
      if (d.parcaSahipligi[pid] !== onceki[pid]) elDegisen++;
    const m = olc(d);
    son = m;
    if (m.enBuyukYigin > zirveYigin) zirveYigin = m.enBuyukYigin;
    if (m.ortOrdu > zirveOrt) zirveOrt = m.ortOrdu;
    if (esik !== null && ulasilanTur === null && m.enBuyukImp >= esik) ulasilanTur = t;
  }
  return {
    ulasilanTur,
    esik,
    toplamParca,
    zirveYigin,
    zirveOrt,
    elDegisen,
    son,
  };
}

const kapsam = 'turkiye';
const sonuclar = [];
for (const mod of MODLAR) {
  const { ufuk, sinirsiz } = olcumUfku(mod, kapsam);
  for (const zorluk of ZORLUKLAR) {
    const kosular = TOHUMLAR.map((t) => kosu(mod, kapsam, zorluk, t, ufuk));
    sonuclar.push({ mod, zorluk, ufuk, sinirsiz, kosular });
  }
}

const ort = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
// ⚠ "ULAŞILAN TUR" HER MODDA ANLAMLI DEĞİL. Güç Yarışı'nda kazanma EŞİĞİ YOK — süre
// dolunca sıralamaya bakılıyor (`modKazanmaEsigi` null döner). İlk sürümde o satırlar da
// "—" yazıyordu ve "hedefe ulaşılamadı" gibi okunuyordu; oysa ulaşılacak bir hedef yok.
const g = (kosular, alan) =>
  kosular
    .map((k) => (k.esik === null ? 'eşik yok' : k[alan] === null ? 'ulaşılmadı' : k[alan]))
    .join(' / ');
const sayiOrt = (kosular, yol) => ort(kosular.map(yol)).toFixed(1);

const S = [];
const yaz = (...x) => S.push(...x);
yaz(
  '# MOD BAZLI SİMÜLASYON',
  '',
  '> Üretildi: `node scripts/mod-simulasyon.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Baki (2026-08-12): *"oyunun modlarına göre simülasyonlar falan yap."*',
  '',
  'Üç mod, üç zorluk, iki tohum — Türkiye kapsamı (' +
    senaryoKapsami(kapsam).kapsamParcalar.length +
    ' parça). Her satırda iki koşunun sonucu `a / b` biçiminde.',
  '',
  '## 1. Kazanma koşuluna ulaşılıyor mu',
  '',
  '> **Güç Yarışı\'nda "eşik yok" bir eksiklik değil, modun tanımı**: o modda kazanmak için',
  '> bir parça sayısına ulaşmak gerekmiyor, süre dolunca SIRALAMAYA bakılıyor. Ölçüm buna',
  '> "ulaşılmadı" yazarsa yanlış okunur.',
  '',
  '| Mod | Zorluk | Eşik | Ufuk | Ulaşılan tur | Son en büyük imparatorluk |',
  '|---|---|---|---|---|---|'
);
for (const r of sonuclar)
  yaz(
    '| ' +
      DENGE.MOD.TIPLER[r.mod].ad +
      ' | ' +
      r.zorluk +
      ' | ' +
      (r.kosular[0].esik === null
        ? 'sıralama'
        : r.kosular[0].esik + '/' + r.kosular[0].toplamParca) +
      ' | ' +
      r.ufuk +
      (r.sinirsiz ? ' *(sınırsız)*' : '') +
      ' | **' +
      g(r.kosular, 'ulasilanTur') +
      '** | ' +
      r.kosular.map((k) => k.son.enBuyukImp).join(' / ') +
      ' |'
  );

yaz(
  '',
  '## 2. Silahlanma — yığınlar kontrol altında mı',
  '',
  'Baki\'nin şikâyeti buydu: *"100–200 askere kadar devam ediyorlar."* Üretim freni',
  '(`DENGE.ZEKA.DOYMA`) sonrası zirve değerler:',
  '',
  '| Mod | Zorluk | Zirve en büyük yığın | Zirve ortalama ordu | Son toplam ordu |',
  '|---|---|---|---|---|'
);
for (const r of sonuclar)
  yaz(
    '| ' +
      DENGE.MOD.TIPLER[r.mod].ad +
      ' | ' +
      r.zorluk +
      ' | **' +
      sayiOrt(r.kosular, (k) => k.zirveYigin) +
      '** | ' +
      sayiOrt(r.kosular, (k) => k.zirveOrt) +
      ' | ' +
      sayiOrt(r.kosular, (k) => k.son.toplamOrdu) +
      ' |'
  );

yaz(
  '',
  '## 3. Dünya hareketli mi',
  '',
  'El değiştiren parça sayısı = oyunun ne kadar aktığının ölçüsü. Sıfıra yakınsa dünya',
  'kilitlenmiş demektir (2026-08-12 öncesindeki durum).',
  '',
  '| Mod | Zorluk | El değiştiren parça | Kalan sahip sayısı |',
  '|---|---|---|---|'
);
for (const r of sonuclar)
  yaz(
    '| ' +
      DENGE.MOD.TIPLER[r.mod].ad +
      ' | ' +
      r.zorluk +
      ' | **' +
      sayiOrt(r.kosular, (k) => k.elDegisen) +
      '** | ' +
      r.kosular.map((k) => k.son.sahipSayisi).join(' / ') +
      ' |'
  );

yaz(
  '',
  '## Ölçümün kuralları',
  '',
  '- Oyuncu yok: 81 aktörün hepsi yapay zekâ. Ölçülen şey DÜNYANIN kendi dinamiği.',
  "- Kazanma eşiği `modKazanmaEsigi`'nden, tur sınırı `modTurSiniri`'nden okunuyor —",
  '  ölçüm ile oyun ayrışamaz.',
  '- Sınırsız modlarda (Fetih, %50 Hâkimiyet) ölçüm ufku modun kendi tempo formülünden',
  '  geliyor; `modTurSiniri` orada `Infinity` döner ve döngü sınırı olarak KULLANILAMAZ.',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'mod-simulasyon.md'), S.join('\n'), 'utf8');
console.log('MOD BAZLI SİMÜLASYON');
for (const r of sonuclar)
  console.log(
    '  ' +
      (DENGE.MOD.TIPLER[r.mod].ad + ' · ' + r.zorluk).padEnd(24) +
      'ulaşılan tur: ' +
      g(r.kosular, 'ulasilanTur').padEnd(12) +
      ' zirve yığın: ' +
      sayiOrt(r.kosular, (k) => k.zirveYigin).padStart(6) +
      '  fetih: ' +
      sayiOrt(r.kosular, (k) => k.elDegisen)
  );
console.log('\nYazıldı: veri/mod-simulasyon.md');
