// MOD EŞİĞİ ÖLÇÜMÜ — KAZANMA KOŞULU TUTTURULABİLİYOR MU? (Görev 09 / Adım 3/c)
// Çalıştırma:  node scripts/mod-esik-olcum.js
//
// ---- SORU ----
// Baki modları kazanma koşuluna göre tanımladı (Fetih · Yarım Fetih · Güç Yarışı) ve
// süre verdi; süreler `DENGE.MOD` içinde tur sınırına çevrildi. Bu betik tek bir soruyu
// cevaplıyor: O TUR SAYISINDA O EŞİĞE GERÇEKTEN ULAŞILABİLİYOR MU?
//
// ---- NEDEN "EN BÜYÜK İMPARATORLUK" ÖLÇÜLÜYOR, OYUNCU DEĞİL ----
// Oyuncunun becerisi ölçülemez; ölçüm aracı oyuncu ise gerçek bir oyuncuyu temsil etmez
// (Görev 06'nın dersi). Ama DÜNYANIN TAVANI ölçülebilir: 80 turda hiçbir aktör haritanın
// yarısını alamıyorsa, o eşik oyuncu için de fazla uzaktır. Bu bir alt sınır değil, bir
// GERÇEKLİK KONTROLÜ.
//
// Çıktı: veri/mod-esik-olcum.md

const fs = require('fs');
const path = require('path');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { DENGE } = require('../src/denge.js');
const { modTurSiniri, modKazanmaEsigi, senaryoKapsami } = require('../src/oyun/senaryolar.js');

const PROJ = path.join(__dirname, '..');
const TOHUMLAR = [20260801, 20260802];
const KILOMETRE = [0.25, 0.5, 0.75, 1.0];

// En büyük imparatorluk hangi turda hangi orana ulaştı.
function kosu(kapsam, zorluk, tohum, turSayisi) {
  let d = oyunKur({ senaryo: kapsam, tohum, zorluk });
  const toplam = Object.keys(d.parcaSahipligi).length;
  const ulasti = {};
  for (let t = 1; t <= turSayisi; t++) {
    d = turuBitir(d);
    const say = {};
    for (const v of Object.values(d.parcaSahipligi)) say[v] = (say[v] || 0) + 1;
    const en = Math.max(...Object.values(say));
    for (const oran of KILOMETRE) if (!ulasti[oran] && en >= oran * toplam) ulasti[oran] = t;
  }
  return ulasti;
}

const KAPSAMLAR = ['turkiye', 'karadeniz'];
const ZORLUKLAR = ['orta', 'zor'];
const sonuclar = [];

// ---- ⚠ ÖLÇÜM UFKU: SINIRSIZ MOD SONSUZ DÖNGÜ DEMEKTİ (2026-08-12'de bulundu) ----
//
// Bu betik tur sınırını doğrudan `modTurSiniri`'den alıp döngü sınırı yapıyordu. Görev
// 13'te (2026-08-08) Baki'nin isteğiyle **Fetih ve %50 Hâkimiyet SINIRSIZ** oldu ve o
// fonksiyon `Infinity` dönmeye başladı — yani `for (t = 1; t <= Infinity; t++)`.
// Betik o günden beri hiç bitmiyordu; 2026-08-12'de 61 dakika koşarken yakalandı.
// Sınırlı olsaydı sekiz koşu ~2 dakika sürüyor (tur maliyeti ~100 ms ve oyun ilerledikçe
// düşüyor, çünkü aktörler eleniyor).
//
// ÇÖZÜM: sınırsız modda ölçüm bir UFUKLA yapılıyor. Ufuk uydurulmuyor — modun kendi
// `TABAN + PARCA_BASINA × parça` formülünden çıkıyor. O formül mod sınırsız olsa bile
// duruyor ve modun TASARLANDIĞI temposunu söylüyor: "bu mod kabaca şu kadar turda
// bitecek şekilde ayarlanmıştı." Ufka kadar ulaşılamayan eşik `—` olarak raporlanıyor.
function olcumUfku(modTipi, kapsamAnahtari) {
  const sinir = modTurSiniri(modTipi, kapsamAnahtari);
  if (Number.isFinite(sinir)) return { ufuk: sinir, sinirsiz: false };
  const t = DENGE.MOD.TIPLER[modTipi];
  const parca = senaryoKapsami(kapsamAnahtari).kapsamParcalar.length;
  return { ufuk: Math.round(t.TABAN + t.PARCA_BASINA * parca), sinirsiz: true };
}

for (const kapsam of KAPSAMLAR) {
  const { ufuk, sinirsiz } = olcumUfku('fetih', kapsam);
  for (const zorluk of ZORLUKLAR) {
    const kosular = TOHUMLAR.map((t) => kosu(kapsam, zorluk, t, ufuk));
    sonuclar.push({ kapsam, zorluk, turSiniri: sinirsiz ? ufuk + ' (sınırsız)' : ufuk, kosular });
  }
}

const göster = (kosular, oran) => kosular.map((k) => k[oran] || '—').join(' / ');

const S = [];
const yaz = (...x) => S.push(...x);
yaz(
  '# MOD EŞİĞİ — KAZANMA KOŞULU TUTTURULABİLİYOR MU? (Görev 09 / Adım 3/c)',
  '',
  '> Üretildi: `node scripts/mod-esik-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Ölçülen: **en büyük imparatorluk** kaçıncı turda haritanın %25/%50/%75/%100’üne ulaşıyor.',
  'Oyuncunun becerisi ölçülemez ama dünyanın TAVANI ölçülebilir — hiçbir aktörün',
  'ulaşamadığı eşik oyuncu için de fazla uzaktır.',
  '',
  "> ⚠ **Fetih ve %50 Hâkimiyet 2026-08-08'den beri SINIRSIZ** (Görev 13). Sınırsız modda",
  '> "tur sınırı" diye bir şey olmadığı için ölçüm bir UFUKLA yapılıyor; ufuk modun kendi',
  '> `TABAN + PARCA_BASINA × parça` formülünden geliyor, yani modun tasarlandığı tempo.',
  '> Ufka kadar ulaşılmayan eşik `—` ile gösteriliyor.',
  '',
  '| Kapsam | Zorluk | Ölçüm ufku | %25 | %50 | %75 | %100 |',
  '|---|---|---|---|---|---|---|'
);
for (const r of sonuclar)
  yaz(
    '| ' +
      r.kapsam +
      ' | ' +
      r.zorluk +
      ' | ' +
      r.turSiniri +
      ' | ' +
      KILOMETRE.map((o) => göster(r.kosular, o)).join(' | ') +
      ' |'
  );

yaz(
  '',
  '## Mod sınırları (bugünkü DENGE.MOD)',
  '',
  '| Kapsam | Mod | Tur | Eşik |',
  '|---|---|---|---|'
);
for (const kapsam of KAPSAMLAR)
  for (const mod of Object.keys(DENGE.MOD.TIPLER)) {
    const esik = modKazanmaEsigi(mod, kapsam);
    yaz(
      '| ' +
        kapsam +
        ' | ' +
        DENGE.MOD.TIPLER[mod].ad +
        ' | ' +
        // Sınırsız modda `Infinity` yazmak yerine niyeti yazıyoruz.
        (Number.isFinite(modTurSiniri(mod, kapsam)) ? modTurSiniri(mod, kapsam) : 'sınırsız') +
        ' | ' +
        (esik === null ? 'sıralama' : esik + '/' + senaryoKapsami(kapsam).kapsamParcalar.length) +
        ' |'
    );
  }
yaz('');

fs.writeFileSync(path.join(PROJ, 'veri', 'mod-esik-olcum.md'), S.join('\n'), 'utf8');

console.log('MOD EŞİĞİ — en büyük imparatorluk hangi turda hangi orana ulaşıyor');
for (const r of sonuclar)
  console.log(
    '  ' +
      (r.kapsam + ' · ' + r.zorluk).padEnd(20) +
      'sınır ' +
      String(r.turSiniri).padStart(2) +
      ' tur   ' +
      KILOMETRE.map((o) => (o * 100 + '%:' + göster(r.kosular, o)).padEnd(14)).join('')
  );
console.log('\nYazıldı: veri/mod-esik-olcum.md');
