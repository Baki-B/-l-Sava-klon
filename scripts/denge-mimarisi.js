// DENGE MİMARİSİ DENETİMİ (2026-08-08, Baki: "baştan aşağı dengeli bir mimari oluştur
// sıfırdan, ama kazanımlarımızı sağlam bir matematiğe oturtarak").
// Çalıştırma:  node scripts/denge-mimarisi.js
//
// ---- NEYİ CEVAPLIYOR ----
//
// Stat tablosuna bakıp "dengeli mi" demek imkânsız: 12 sayı var ve hepsi birbirini
// etkiliyor. Bu betik o soruyu ÜÇ ÖLÇÜLEBİLİR SORUYA bölüyor:
//
//   1. ROL — her birim Baki'nin tarif ettiği profile uyuyor mu?
//      (piyade soft>hard · topçu hard>soft · zırhlı ikisi de yüksek ·
//       dayanıklılık zırhlı>piyade>topçu)
//      Bu bir ÖLÇÜM değil, bir DENETİM: tablo kendi tarifine sadık mı.
//
//   2. FİYAT — maliyet başına savaş değeri birimler arasında yakın mı?
//      Bir birim para başına belirgin daha güçlüyse oyuncunun seçimi kalmaz;
//      hep onu basar ve öteki ikisi süs olur.
//
//   3. KARŞILAŞMA — taş-kağıt-makas gerçekten dönüyor mu?
//      Her birim, EŞİT PARAYLA karşısına çıkan üç birime karşı ayrı ayrı ölçülüyor.
//      Sağlıklı tablo: her birimin yendiği ve yenildiği en az bir eşleşme var.
//
// ---- "SAVAŞ DEĞERİ" NEDİR ----
//
// Oyun dengesinin standart ölçüsü: EHP × DPS (ne kadar dayanıyor × ne kadar vuruyor).
// Burada dayanıklılık × ortalama hasar. Ortalama, ÜÇ HEDEF TÜRÜNE karşı alınıyor —
// tek bir hedefe göre bakmak topçuyu haksız yere kötü gösterirdi (o zırhlıya karşı
// tasarlanmış bir birim).
//
// ⚠ ZIRHLI İÇİN ARAZİ ORTALAMASI ALINIYOR. Zırhlının hasarı araziyle çarpılıyor
// (ova 1.15 · tepelik 0.85 · dağlık 0.50) ve yalnız ovaya bakmak onu olduğundan güçlü
// gösterir. Üç arazinin ortalaması, "rastgele bir parçada dövüşürse" demek.
//
// ---- MALİYET İKİ KAYNAKTIR, TEK SAYIYA İNDİRİLİYOR ----
//
// Nüfus ve ekonomi ayrı havuzlar; "toplam bedel" diye bir şey oyunda yok. Ama fiyat
// karşılaştırması için tek bir sayı gerekiyor ve en dürüst indirgeme ikisini eşit
// saymak: bir birim nüfus ile bir birim ekonomi aynı turda aynı hızda geliyor
// (`uretim.js` ikisini de aynı formülden üretiyor).
//
// Çıktı: veri/denge-mimarisi.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz, etkinlik, rauntSayisi } = require('../src/oyun/muharebe.js');

const TURLER = DENGE.BIRIM_SIRASI;
const AD = {};
for (const t of TURLER) AD[t] = DENGE.BIRIMLER[t].ad;
const ARAZILER = ['ova', 'tepelik', 'daglik'];

// ---- 1. ROL DENETİMİ ----
// Baki'nin tarifi kural hâline getiriliyor. Her satır ya tutuyor ya tutmuyor.
function rolDenetimi() {
  const B = DENGE.BIRIMLER;
  const kurallar = [
    {
      ad: 'Piyade: hafif vuruş ağır vuruşundan belirgin yüksek',
      tut: B.piyade.hafifVurus > B.piyade.agirVurus * 1.5,
      olcu: B.piyade.hafifVurus + ' / ' + B.piyade.agirVurus,
    },
    {
      ad: 'Topçu: ağır vuruş hafif vuruşundan belirgin yüksek',
      tut: B.topcu.agirVurus > B.topcu.hafifVurus * 1.5,
      olcu: B.topcu.agirVurus + ' / ' + B.topcu.hafifVurus,
    },
    {
      ad: 'Zırhlı: iki vuruş da yüksek (ikisi de piyadenin ağırından fazla)',
      tut: B.zirhli.agirVurus > B.piyade.agirVurus && B.zirhli.hafifVurus > B.piyade.agirVurus,
      olcu: B.zirhli.agirVurus + ' / ' + B.zirhli.hafifVurus,
    },
    {
      ad: 'Dayanıklılık sırası: zırhlı > piyade > topçu',
      tut:
        B.zirhli.dayaniklilik > B.piyade.dayaniklilik &&
        B.piyade.dayaniklilik > B.topcu.dayaniklilik,
      olcu: B.zirhli.dayaniklilik + ' > ' + B.piyade.dayaniklilik + ' > ' + B.topcu.dayaniklilik,
    },
    {
      ad: 'Zırh sırası: zırhlı > topçu > piyade',
      tut: B.zirhli.zirh > B.topcu.zirh && B.topcu.zirh > B.piyade.zirh,
      olcu: B.zirhli.zirh + ' > ' + B.topcu.zirh + ' > ' + B.piyade.zirh,
    },
    {
      ad: 'Bütün statlar ölçeğin katı (araştırma artışı tam sayı kalsın)',
      tut: TURLER.every((t) =>
        ['zirh', 'agirVurus', 'hafifVurus', 'dayaniklilik'].every(
          (s) => DENGE.BIRIMLER[t][s] % DENGE.STAT_OLCEGI === 0
        )
      ),
      olcu: 'ölçek ' + DENGE.STAT_OLCEGI,
    },
  ];
  return kurallar;
}

// ---- 2. FİYAT ----
// Bir birimin tek başına savaş değeri: dayanıklılık × üç hedefe ortalama hasar.
function birimHasari(vuran, hedefZirh, araziCarpani) {
  const b = DENGE.BIRIMLER[vuran];
  const e = etkinlik(hedefZirh);
  const ham = b.agirVurus * e.agir + b.hafifVurus * e.hafif;
  return vuran === 'zirhli' ? ham * araziCarpani : ham;
}

// Zırhlının arazi ortalaması; ötekiler araziden etkilenmiyor (yalnız savunan çarpanı
// var ve o iki tarafa da aynı şekilde uygulanıyor).
function araziOrtalamasi() {
  return ARAZILER.reduce((a, k) => a + DENGE.ARAZI[k].zirhli, 0) / ARAZILER.length;
}

function savasDegeri(tur) {
  const zc = araziOrtalamasi();
  const hasarlar = TURLER.map((h) => birimHasari(tur, DENGE.BIRIMLER[h].zirh, zc));
  const ortHasar = hasarlar.reduce((a, b) => a + b, 0) / hasarlar.length;
  return { deger: DENGE.BIRIMLER[tur].dayaniklilik * ortHasar, ortHasar, hasarlar };
}

function bedel(tur) {
  return DENGE.BIRIMLER[tur].nufus + DENGE.BIRIMLER[tur].ekonomi;
}

function fiyatTablosu() {
  const satirlar = TURLER.map((t) => {
    const s = savasDegeri(t);
    return { tur: t, bedel: bedel(t), deger: s.deger, birim: s.deger / bedel(t), ort: s.ortHasar };
  });
  const ortalama = satirlar.reduce((a, s) => a + s.birim, 0) / satirlar.length;
  for (const s of satirlar) s.sapma = ((s.birim - ortalama) / ortalama) * 100;
  return { satirlar, ortalama };
}

// ---- 3. KARŞILAŞMA MATRİSİ ----
// EŞİT PARAYLA karşılaşma: her iki tarafa da aynı bütçe verilip birim sayısına çevriliyor.
// Sayıları eşitlemek yanlış olurdu — 1 piyade ile 1 zırhlıyı karşılaştırmak fiyatı yok
// saymaktır. Bütçe, en pahalı birimden BUTCE_BIRIMI tane alınacak şekilde seçiliyor.
const BUTCE_CARPANI = 6;

function karsilasma(a, s, arazi) {
  const butce = Math.max(...TURLER.map(bedel)) * BUTCE_CARPANI;
  const na = Math.max(1, Math.floor(butce / bedel(a)));
  const ns = Math.max(1, Math.floor(butce / bedel(s)));
  const r = muharebeCoz({
    saldiran: { birimler: { [a]: na } },
    savunan: { birimler: { [s]: ns } },
    arazi,
    tohum: null,
  });
  return { na, ns, kazanan: r.kazanan, raunt: r.turlar.length };
}

function matris(arazi) {
  const satirlar = ['| Saldıran ↓ / Savunan → | ' + TURLER.map((t) => AD[t]).join(' | ') + ' |'];
  satirlar.push('|---|' + TURLER.map(() => '---').join('|') + '|');
  const skor = {};
  for (const a of TURLER) {
    const hucreler = TURLER.map((s) => {
      const k = karsilasma(a, s, arazi);
      skor[a] = skor[a] || { galip: 0, maglup: 0 };
      if (k.kazanan === 'saldiran') skor[a].galip++;
      else if (k.kazanan === 'savunan') skor[a].maglup++;
      const im =
        k.kazanan === 'saldiran' ? '**KAZANIR**' : k.kazanan === 'savunan' ? 'kaybeder' : '=';
      return im + ' (' + k.na + 'v' + k.ns + ', ' + k.raunt + 'r)';
    });
    satirlar.push('| **' + AD[a] + '** | ' + hucreler.join(' | ') + ' |');
  }
  return { tablo: satirlar.join('\n'), skor };
}

// ---- 4a. SAVAŞ UZUNLUĞU: ORDU BÜYÜKLÜĞÜ ----
// Baki (2026-08-08): "savaşların raund sayısı büyüklüğüne göre 1–4 arasında değişsin."
// Kademeler `DENGE.MUHAREBE.RAUNT_KADEMELERI`'nde; burada tablo halinde gösteriliyor ve
// gerçek muharebeyle DOĞRULANIYOR — kademe tablosu ile motorun oynattığı raunt ayrışırsa
// rapor bunu yazar.
function rauntTablosu() {
  const satirlar = ['| Toplam birim | Kademe | Örnek | Motorun oynattığı |', '|---|---|---|---|'];
  const ornekler = [
    [1, 1],
    [5, 4],
    [5, 5],
    [10, 9],
    [10, 10],
    [25, 24],
    [25, 25],
    [40, 40],
  ];
  for (const [a, b] of ornekler) {
    const A = { piyade: a },
      S = { piyade: b };
    const kademe = rauntSayisi(A, S);
    const r = muharebeCoz({
      saldiran: { birimler: A },
      savunan: { birimler: S },
      arazi: 'ova',
      tohum: null,
    });
    satirlar.push(
      '| ' +
        (a + b) +
        ' | ' +
        kademe +
        ' raunt | ' +
        a +
        'P → ' +
        b +
        'P | ' +
        r.turlar.length +
        ' (' +
        r.sebep +
        ') |'
    );
  }
  return satirlar.join('\n');
}

// ---- 4b. MORALİN SAVAŞ SÜRESİNE ETKİSİ ----
// Moral artık süreyi TEK BAŞINA belirlemiyor — kademe bir üst sınır, moral o sınırın
// altında erken bitirebiliyor. Ölçü yine raunt sayısı ama tavana takılan satırlarda
// moralin etkisi görünmez; tablo bu yüzden büyük ordularla kuruluyor.
function moralSuresi() {
  const MO = DENGE.MUHAREBE.MORAL;
  const satirlar = [
    '| İlin moral statı | Bozgun eşiği | 30P → 30P raunt | 20Z → 30T raunt | 30T → 30P raunt |',
    '|---|---|---|---|---|',
  ];
  for (const moral of [3, 4, 5, 6, 7]) {
    const bonus = { moral, kalem: 0 };
    const esik = MO.TABAN + MO.MORAL_PAYI * (moral / MO.MORAL_OLCEGI);
    const raunt = (A, S) =>
      muharebeCoz({
        saldiran: { birimler: A },
        savunan: { birimler: S },
        arazi: 'ova',
        tohum: null,
        moralBonuslari: { saldiran: bonus, savunan: bonus },
      }).turlar.length;
    satirlar.push(
      '| ' +
        moral +
        ' | ' +
        esik.toFixed(2) +
        ' | ' +
        raunt({ piyade: 30 }, { piyade: 30 }) +
        ' | ' +
        raunt({ zirhli: 20 }, { topcu: 30 }) +
        ' | ' +
        raunt({ topcu: 30 }, { piyade: 30 }) +
        ' |'
    );
  }
  return satirlar.join('\n');
}

// ---- RAPOR ----
const roller = rolDenetimi();
const fiyat = fiyatTablosu();
const matrisler = ARAZILER.map((a) => ({ arazi: a, ...matris(a) }));

const B = DENGE.BIRIMLER;
const statTablosu = [
  '| Birim | Nüfus | Ekonomi | Zırh | Ağır vuruş | Hafif vuruş | Dayanıklılık |',
  '|---|---|---|---|---|---|---|',
]
  .concat(
    TURLER.map(
      (t) =>
        '| ' +
        AD[t] +
        ' | ' +
        B[t].nufus +
        ' | ' +
        B[t].ekonomi +
        ' | ' +
        B[t].zirh +
        ' | ' +
        B[t].agirVurus +
        ' | ' +
        B[t].hafifVurus +
        ' | ' +
        B[t].dayaniklilik +
        ' |'
    )
  )
  .join('\n');

const rolSatirlari = roller
  .map((k) => '| ' + (k.tut ? '✓' : '**✗**') + ' | ' + k.ad + ' | ' + k.olcu + ' |')
  .join('\n');

const fiyatSatirlari = fiyat.satirlar
  .map(
    (s) =>
      '| ' +
      AD[s.tur] +
      ' | ' +
      s.bedel +
      ' | ' +
      Math.round(s.ort) +
      ' | ' +
      Math.round(s.deger).toLocaleString('tr') +
      ' | ' +
      Math.round(s.birim).toLocaleString('tr') +
      ' | ' +
      (s.sapma >= 0 ? '+' : '') +
      s.sapma.toFixed(1) +
      '% |'
  )
  .join('\n');

const enSapan = Math.max(...fiyat.satirlar.map((s) => Math.abs(s.sapma)));
const kirikRol = roller.filter((k) => !k.tut);

const metin = `# DENGE MİMARİSİ DENETİMİ

> Üretici: \`node scripts/denge-mimarisi.js\`
> Baki'nin isteği: *"baştan aşağı dengeli bir mimari oluştur, kazanımlarımızı sağlam bir
> matematiğe oturtarak."*

## Stat tablosu

${statTablosu}

---

## 1. ROL DENETİMİ — tablo kendi tarifine sadık mı

| | Kural | Ölçü |
|---|---|---|
${rolSatirlari}

${kirikRol.length === 0 ? '**Altı kuralın altısı da tutuyor.**' : '⚠ **' + kirikRol.length + ' kural KIRIK.**'}

---

## 2. FİYAT — maliyet başına savaş değeri

Savaş değeri = dayanıklılık × üç hedefe ortalama hasar. Zırhlının hasarı üç arazinin
ortalamasıyla alınıyor (ova ${DENGE.ARAZI.ova.zirhli} · tepelik ${DENGE.ARAZI.tepelik.zirhli} ·
dağlık ${DENGE.ARAZI.daglik.zirhli} → ${araziOrtalamasi().toFixed(2)}); yalnız ovaya bakmak
onu olduğundan güçlü gösterirdi.

| Birim | Bedel (nüfus+ekonomi) | Ort. hasar | Savaş değeri | Bedel başına | Ortalamadan sapma |
|---|---|---|---|---|---|
${fiyatSatirlari}

**En büyük sapma: %${enSapan.toFixed(1)}.** Sapma ne kadar küçükse oyuncunun birim seçimi
o kadar gerçek bir karar; büyük sapma "hep aynı birimi bas" demektir.

---

## 3. KARŞILAŞMA MATRİSİ — taş-kağıt-makas dönüyor mu

Her hücre **eşit parayla** kurulmuş bir muharebe: iki tarafa da aynı bütçe verilip birim
sayısına çevriliyor (bu yüzden 6v10 gibi eşitsiz sayılar görüyorsun — eşit olan PARA).
Parantez: kuvvetler ve savaşın kaç raunt sürdüğü.

${matrisler.map((m) => '### ' + m.arazi.toUpperCase() + '\n\n' + m.tablo).join('\n\n')}

---

## 4. SAVAŞ KAÇ RAUNT SÜRER — ORDU BÜYÜKLÜĞÜ

Baki (2026-08-08): *"Savaşların raund sayısı büyüklüğüne göre 1–4 arasında değişse güzel
olur: küçük 1–9 birimlik savaşlar için 1 tur, 10–19 için 2 tur, 20–49 için 3 tur, 50–99
için 4 tur gibisinden."*

Ölçü **iki tarafın toplam birim sayısı**. Kademe bir ÜST SINIR: bozgun ya da imha savaşı
daha erken bitirebilir — son sütun motorun gerçekten kaç raunt oynattığını gösteriyor.

${rauntTablosu()}

---

## 5. MORAL SAVAŞIN SÜRESİNİ BELİRLİYOR MU

Baki: *"moral etkisi savaşların ne kadar süreceğini etkilesin; moral düşükse ordu nispeten
hızlı dağılsın, fakat morali düşük bile olsa o kadar hızlı dağılmamalı — tüm birliklerin
temel bir seviyesi olmalı, moral ek ne kadar olacağını belirlemeli."*

Bozgun eşiği = \`TABAN ${DENGE.MUHAREBE.MORAL.TABAN}\` +
\`MORAL_PAYI ${DENGE.MUHAREBE.MORAL.MORAL_PAYI}\` × (moral statı / ${DENGE.MUHAREBE.MORAL.MORAL_OLCEGI})
+ durum kalemleri × \`${DENGE.MUHAREBE.MORAL.BONUS_PAYI}\`

${moralSuresi()}

Taban, moral ne olursa olsun geçerli: en düşük moralli ordu bile canının
**%${(DENGE.MUHAREBE.MORAL.TABAN * 100).toFixed(0)}**'i gitmeden dağılmıyor.
`;

fs.writeFileSync(path.join(__dirname, '..', 'veri', 'denge-mimarisi.md'), metin, 'utf8');
console.log('Yazıldı: veri/denge-mimarisi.md');
console.log('Rol kuralları: ' + (roller.length - kirikRol.length) + '/' + roller.length);
console.log('En büyük fiyat sapması: %' + enSapan.toFixed(1));
for (const m of matrisler) {
  const s = TURLER.map((t) => AD[t] + ' ' + m.skor[t].galip + 'G/' + m.skor[t].maglup + 'M');
  console.log('  ' + m.arazi.padEnd(8) + s.join('  '));
}
