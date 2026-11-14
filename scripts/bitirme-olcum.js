// BİTİRME İŞTAHI ÖLÇÜMÜ (2026-08-08, Baki'nin isteği).
// Çalıştırma:  node scripts/bitirme-olcum.js
//
// ---- NEYİ ÖLÇÜYOR ----
//
// Baki iki şey istedi ve ikisi birbirine bağlı:
//
//   > *"Fetih ve %50 hâkimiyet için üst tur sınırları koyma, ama oyunun yapay zekâları
//   > da oyunu bitirme isteğiyle oynasın."*
//
// Tur sınırı bir EMNİYET KEMERİYDİ: dünya kilitlense bile maç "süre doldu, toprağa bak"
// diye bir sonuçla bitiyordu. Sınır kalkınca o kemer de kalkıyor — kilitlenen bir dünyada
// maç SONSUZA KADAR sürer. `DENGE.ZEKA.BITIRME` o riskin karşılığı ve bu betik onun işe
// yarayıp yaramadığını ölçüyor.
//
// ---- KİLİT NASIL ÖLÇÜLÜR ----
//
// İki sayı birlikte okunur, tek başına ikisi de yanıltıcıdır:
//   • EN BÜYÜK İMPARATORLUĞUN PAYI — büyümüyor mu, kilit olabilir
//   • TUR BAŞINA MUHAREBE — sıfıra düşüyorsa dünya gerçekten donmuştur
// `veri/mod-esik-olcum.md` kilidi tam bu ikisiyle yakalamıştı: pay %69'da duruyor VE
// muharebe sıfıra iniyordu. Pay tek başına bakılsaydı "denge kurulmuş" sanılırdı.
//
// ⚠ OYUNCU HİÇ EMİR VERMİYOR. Ölçülen şey DÜNYANIN kendi kendine ne yaptığı; oyuncu
// karışsaydı farkın iştahtan mı oyuncunun hamlelerinden mi geldiği ayrılamazdı.
//
// ⚠ MUHAREBE SAYACI `sonTurRaporu.satirlar`DAN OKUNUYOR. Rapor muharebeleri ayrı bir
// listede tutmuyor, satırların `tip` alanında tutuyor. Görev 12'de bir ölçüm tam burada
// yalan söylemişti (olmayan `rapor.muharebeler` alanı okunuyordu, her şey "0 muharebe"
// çıkıyordu); bu satır o dersin karşılığı.
//
// Çıktı: veri/bitirme-olcum.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');

const KESITLER = [25, 50, 75, 100, 150];
const TOHUMLAR = [20260801, 12345];
const ZORLUKLAR = ['orta', 'zor'];

function kosu(tohum, zorluk, turSayisi) {
  let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk });
  const toplamParca = Object.keys(d.parcaSahipligi).length;
  const cikti = {};
  let muharebe = 0;
  let oncekiMuharebe = 0;
  let oncekiTur = 0;

  for (let t = 1; t <= turSayisi; t++) {
    d = turuBitir(d);
    for (const s of (d.sonTurRaporu || {}).satirlar || []) if (s.tip === 'muharebe') muharebe++;

    if (KESITLER.includes(t)) {
      const sayim = {};
      for (const sahip of Object.values(d.parcaSahipligi)) sayim[sahip] = (sayim[sahip] || 0) + 1;
      cikti[t] = {
        pay: (Math.max(...Object.values(sayim)) / toplamParca) * 100,
        canli: Object.keys(sayim).length,
        muhTur: (muharebe - oncekiMuharebe) / (t - oncekiTur),
      };
      oncekiMuharebe = muharebe;
      oncekiTur = t;
    }
  }
  return cikti;
}

function ortalama(zorluk, turSayisi) {
  const toplam = {};
  for (const tohum of TOHUMLAR) {
    const r = kosu(tohum, zorluk, turSayisi);
    for (const k of KESITLER) {
      toplam[k] = toplam[k] || { pay: 0, canli: 0, muhTur: 0 };
      toplam[k].pay += r[k].pay;
      toplam[k].canli += r[k].canli;
      toplam[k].muhTur += r[k].muhTur;
    }
  }
  for (const k of KESITLER) {
    toplam[k].pay /= TOHUMLAR.length;
    toplam[k].canli /= TOHUMLAR.length;
    toplam[k].muhTur /= TOHUMLAR.length;
  }
  return toplam;
}

const sonuc = {};
for (const acik of [false, true]) {
  DENGE.ZEKA.BITIRME.ACIK = acik;
  sonuc[acik ? 'acik' : 'kapali'] = {};
  for (const zorluk of ZORLUKLAR) sonuc[acik ? 'acik' : 'kapali'][zorluk] = ortalama(zorluk, 150);
}
DENGE.ZEKA.BITIRME.ACIK = true;

function tablo(kayit) {
  const satirlar = [
    '| Tur | En büyük imparatorluk | Muharebe/tur | Canlı aktör |',
    '|---|---|---|---|',
  ];
  for (const k of KESITLER) {
    const r = kayit[k];
    satirlar.push(
      '| ' +
        k +
        ' | %' +
        r.pay.toFixed(0) +
        ' | ' +
        r.muhTur.toFixed(1) +
        ' | ' +
        r.canli.toFixed(0) +
        ' |'
    );
  }
  return satirlar.join('\n');
}

const B = DENGE.ZEKA.BITIRME;
const metin = `# BİTİRME İŞTAHI ÖLÇÜMÜ

> Üretici: \`node scripts/bitirme-olcum.js\` · ${TOHUMLAR.length} tohum ortalaması · 150 tur
> Oyuncu hiç emir vermiyor — ölçülen şey dünyanın kendi kendine ne yaptığı.

Ayar: \`DOYMA_TURU ${B.DOYMA_TURU}\` · \`SALDIRI_CARPANI ${B.SALDIRI_CARPANI}\` ·
\`TEMKIN_SONUMU ${B.TEMKIN_SONUMU}\` · \`ILAN_CARPANI ${B.ILAN_CARPANI}\`

---

## Neden ölçüldü

Fetih ve %50 hâkimiyet modlarında tur sınırı kaldırıldı. Sınır bir emniyet kemeriydi:
dünya kilitlense bile maç "süre doldu, toprağa bak" diye bitiyordu. Sınır kalkınca
kilitlenen bir dünyada maç **hiç bitmez**. Bitirme iştahı o riskin karşılığı.

Kilidin iki işareti birlikte okunur: en büyük imparatorluğun payı **büyümüyorsa** ve tur
başına muharebe **sıfıra iniyorsa** dünya donmuş demektir.

---

## İştah KAPALI (eski davranış)

### Orta kademe
${tablo(sonuc.kapali.orta)}

### Zor kademe
${tablo(sonuc.kapali.zor)}

---

## İştah AÇIK (bugünkü ayar)

### Orta kademe
${tablo(sonuc.acik.orta)}

### Zor kademe
${tablo(sonuc.acik.zor)}

---

## Okunuşu

**Orta kademe — kilit gerçekten vardı ve açıldı.** İştah kapalıyken en büyük imparatorluk
150 turda %${sonuc.kapali.orta[25].pay.toFixed(0)}'den yalnızca
%${sonuc.kapali.orta[150].pay.toFixed(0)}'e çıkıyor ve muharebe
${sonuc.kapali.orta[25].muhTur.toFixed(1)}'den ${sonuc.kapali.orta[150].muhTur.toFixed(1)}'e
sönüyor — tarif edilebilecek en net kilit. İştah açıkken aynı 150 turda pay
%${sonuc.acik.orta[150].pay.toFixed(0)}'e çıkıyor. **Maç artık bir yere varıyor.**

**Zor kademede iştah dünyayı hızlandırmıyor, DENGELİYOR.** Pay
%${sonuc.kapali.zor[150].pay.toFixed(0)} yerine %${sonuc.acik.zor[150].pay.toFixed(0)}'de
duruyor ve canlı aktör sayısı ${sonuc.kapali.zor[150].canli.toFixed(0)} yerine
${sonuc.acik.zor[150].canli.toFixed(0)} kalıyor. Sebep: iştah HERKESİ cesaretlendiriyor,
yalnızca lideri değil. Tek bir devin sıyrılması zorlaşıyor.

⚠ **Bilinen sınır:** zor kademede tam fetih (%100) yapay zekâların kendi aralarında
gerçekleşmiyor. Bu bir kilit değil — muharebe
${sonuc.acik.zor[150].muhTur.toFixed(1)}/tur ile sürüyor, dünya canlı. Ama tur sınırı da
olmadığı için o moddaki maçı bitirecek olan **oyuncunun kendisi**.
`;

const hedef = path.join(__dirname, '..', 'veri', 'bitirme-olcum.md');
fs.writeFileSync(hedef, metin, 'utf8');
console.log('Yazıldı: veri/bitirme-olcum.md');
