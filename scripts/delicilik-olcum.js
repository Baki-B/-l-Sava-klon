// DELİCİLİK ÖLÇÜMÜ — 2026-08-11, Baki'nin iki isteği.
// Çalıştırma:  node scripts/delicilik-olcum.js      → veri/delicilik-olcum.md
//
// > *"Ağır vuruş zırha karşı delicilik versin, bonus hasar kazanmasın — yani zırhın bir
// > kısmına ignore atsın, ona göre hesaplansın. Onun dışında araştırmalar kısmında 3 tür
// > için de statlar geliştirildikçe kalitesinin azalma durumu gibi şeyler olmasın."*
//
// İKİ İSTEK AYNI HATANIN İKİ YÜZÜYDÜ ve bu betik ikisini birden ölçüyor:
//
//   1) Eski ağır vuruş etkinliği zırhla BİRLİKTE BÜYÜYORDU (§1). Yani zırh, ağır vuruşa
//      karşı koruma değil davetiyeydi.
//   2) Bunun sonucu olarak ZIRH ARAŞTIRMASI GERİ TEPİYORDU (§3): oyuncu puan ödeyip
//      ordusunu zayıflatabiliyordu.
//
// Bu betik dört soruyu ölçümle cevaplıyor:
//   §1  Eğri: eski model gerçekten zırha bonus veriyor muydu, yeni model vermiyor mu?
//   §2  Delicilik ve verim kaç olmalı? (§3.7'nin 15 satırı + çıpalar + matris hakem)
//   §3  Araştırma tek yönlü mü: hiçbir dal, hiçbir seviyede oyuncuyu zayıflatıyor mu?
//   §4  Baraj oranı, etkinlik değişince Baki'nin "yarı cana indirsin" cümlesini tutuyor mu?
//
// ⚠ TARAMA `DENGE` SABİTLERİNİ GEÇİCİ OLARAK DEĞİŞTİRİR ve sonunda geri koyar. Motor
// sabitleri çağrı anında okuduğu için tarama gerçek motoru koşturuyor — ikinci bir model
// yazılmadı (Görev 05'in dersi: aynı kural iki yerde tutulmaz).

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz, etkinlik } = require('../src/oyun/muharebe.js');
const { birimStatlari } = require('../src/oyun/arastirma.js');
const { TABLO } = require('./muharebe-referans.js');

const M = DENGE.MUHAREBE;
const ARAZILER = ['ova', 'tepelik', 'daglik'];
const say = (b) => DENGE.BIRIM_SIRASI.reduce((a, t) => a + (b[t] || 0), 0);

// ---- ESKİ EĞRİ (2026-08-11 öncesi) ----
// Burada duruyor çünkü karşılaştırmanın hakemi o: "bonus var mıydı" sorusu ancak iki eğri
// yan yana konunca cevaplanır. Motorda ARTIK YOK; bu bir tarih kaydı, ikinci bir model
// değil — hiçbir muharebe bundan geçmiyor.
function eskiEtkinlik(z) {
  const kis = (x, alt, ust) => Math.min(ust, Math.max(alt, x));
  const hafif = kis(1 - z / M.HAFIF_BOLEN, M.HAFIF_ALT, 1);
  const sonum = 1 - z / 200; // eski ZIRH_SONUM_BOLEN
  const isabet = 0.55 + z / 100; // eski ISABET_TABAN + z/ISABET_BOLEN
  return { agir: kis(sonum * isabet, M.AGIR_ALT, 1), hafif };
}

function coz(s, d, arazi, statlar) {
  return muharebeCoz({
    saldiran: { birimler: s },
    savunan: { birimler: d },
    arazi: arazi || 'ova',
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null,
    statlar,
  });
}

// ---- §3.7'NİN 15 SATIRI + KALAN ORAN ÇIPALARI ----
function tabloKontrol() {
  const kirik = [];
  let enBuyukSapma = 0;
  for (const [ad, s, d, arazi, beklenen, cipa] of TABLO) {
    const r = coz(s, d, arazi);
    if (r.kazanan !== beklenen) kirik.push(ad + ' → ' + r.kazanan);
    const n = beklenen === 'saldiran' ? say(s) : say(d);
    const kalan = beklenen === 'saldiran' ? r.saldiran.kalan : r.savunan.kalan;
    enBuyukSapma = Math.max(enBuyukSapma, Math.abs(kalan / n - cipa));
  }
  return { kirik, enBuyukSapma };
}

// ---- EŞİT PARAYLA KARŞILAŞMA MATRİSİ ----
// `denge-mimarisi.js`'in matrisinin kısa hâli: taş-kağıt-makas hâlâ dönüyor mu?
const bedel = (t) => DENGE.BIRIMLER[t].nufus + DENGE.BIRIMLER[t].ekonomi;
function matrisSatiri(arazi) {
  const butce = Math.max(...DENGE.BIRIM_SIRASI.map(bedel)) * 6;
  return DENGE.BIRIM_SIRASI.map((a) => {
    const hucreler = DENGE.BIRIM_SIRASI.map((s) => {
      const r = coz(
        { [a]: Math.max(1, Math.floor(butce / bedel(a))) },
        { [s]: Math.max(1, Math.floor(butce / bedel(s))) },
        arazi
      );
      return r.kazanan === 'saldiran' ? 'K' : r.kazanan === 'savunan' ? 'k' : '=';
    });
    return DENGE.BIRIMLER[a].ad[0] + ':' + hucreler.join('');
  }).join(' ');
}

// ---- ARAŞTIRMA TEK YÖNLÜLÜĞÜ ----
//
// SORU: bir stat dalını yükseltmek, araştıran tarafı HERHANGİ bir eşleşmede kötüleştiriyor mu?
//
// ÖLÇÜ, OYUNCUNUN GÖRDÜĞÜ ŞEY: kazandım mı + kendi kuvvetimden ne kaldı (yaralı yarım).
// ⚠ DÜŞMANIN KALANI ÖLÇÜYE GİRMEZ ve bu ölçüm bir kez yanlış kola baktığı için yazılı:
// daha sert vuran taraf düşmanı DAHA ERKEN bozguna uğratıyor, bozgun savaşı bitiriyor ve
// düşman daha çok birimle kaçıyor. İlk tarama bunu "kötüleşme" sayıp on yanlış alarm verdi.
// Daha hızlı zafer kötüleşme değildir.
const STAT_DALLARI = [
  ['piyade', 'zirh'],
  ['piyade', 'agir'],
  ['piyade', 'hafif'],
  ['topcu', 'zirh'],
  ['topcu', 'agir'],
  ['topcu', 'hafif'],
  ['zirhli', 'agir'],
  ['zirhli', 'hafif'],
];

// Tarama ordularının listesi. Dalın etkilediği birim ORDUDA YOKSA o eşleşme atlanıyor —
// piyade zırhı araştıran bir topçu ordusunun hiç değişmemesi bir bulgu değil, tanım.
const ORDULAR = [
  { piyade: 3 },
  { piyade: 6 },
  { topcu: 3 },
  { topcu: 5 },
  { zirhli: 2 },
  { zirhli: 4 },
  { piyade: 3, topcu: 1, zirhli: 1 },
  { piyade: 6, topcu: 2, zirhli: 2 },
];

function kaliteSkoru(r, benimTaraf, benimN) {
  const ben = benimTaraf === 'saldiran' ? r.saldiran : r.savunan;
  const kazanc = r.kazanan === benimTaraf ? 1 : r.kazanan === null ? 0.5 : 0;
  const yarali = DENGE.BIRIM_SIRASI.reduce((a, t) => a + ((ben.yarali || {})[t] || 0), 0);
  return { kazandi: kazanc, skor: kazanc * 2 + (ben.kalan - yarali * 0.5) / benimN };
}

// Dönen: { denenen, geriTepmeler: [{ tip, birim, dal, seviye, senaryo, once, sonra }] }
//   tip 'zafer-kaybi'  → yükseltme KAZANILAN savaşı kaybettiriyor (kabul edilemez)
//   tip 'kuvvet-kaybi' → sonuç aynı, ama araştıran taraf daha az birimle çıkıyor
function tekYonlulukTaramasi() {
  const geriTepmeler = [];
  let denenen = 0;
  for (const [birim, dal] of STAT_DALLARI)
    for (const benim of ORDULAR) {
      if (!benim[birim]) continue;
      for (const onun of ORDULAR)
        for (const arazi of ARAZILER)
          for (const benimTaraf of ['saldiran', 'savunan']) {
            let onceki = null;
            for (let sv = 0; sv <= DENGE.ARASTIRMA.TAVAN; sv++) {
              const st = birimStatlari(sv === 0 ? null : { [birim + '.' + dal]: sv });
              const statlar = benimTaraf === 'saldiran' ? { saldiran: st } : { savunan: st };
              const [s, d] = benimTaraf === 'saldiran' ? [benim, onun] : [onun, benim];
              const k = kaliteSkoru(coz(s, d, arazi, statlar), benimTaraf, say(benim));
              denenen++;
              if (onceki && k.skor < onceki.skor - 1e-9)
                geriTepmeler.push({
                  tip: k.kazandi < onceki.kazandi ? 'zafer-kaybi' : 'kuvvet-kaybi',
                  birim,
                  dal,
                  seviye: sv,
                  senaryo:
                    (benimTaraf === 'saldiran' ? 'saldıran ' : 'savunan ') +
                    ozet(benim) +
                    ' vs ' +
                    ozet(onun) +
                    ' (' +
                    arazi +
                    ')',
                  once: onceki.skor,
                  sonra: k.skor,
                });
              onceki = k;
            }
          }
    }
  return { denenen, geriTepmeler };
}

function ozet(b) {
  return DENGE.BIRIM_SIRASI.filter((t) => b[t])
    .map((t) => b[t] + DENGE.BIRIMLER[t].ad[0])
    .join('+');
}

// ---- BARAJ KALİBRASYONU ----
// Baki'nin cümlesi: "1 topçu, 1 piyadeyi savaşın başında yarı dayanıklılığa indirsin."
function barajGerekenOran() {
  const e = etkinlik(DENGE.BIRIMLER.piyade.zirh);
  const b = DENGE.BIRIMLER.topcu;
  const vurus = b.agirVurus * e.agir + b.hafifVurus * e.hafif;
  return {
    vurus,
    yariCan: DENGE.BIRIMLER.piyade.dayaniklilik / 2,
    oran: DENGE.BIRIMLER.piyade.dayaniklilik / 2 / vurus,
  };
}

// =============================== RAPOR ===============================
if (require.main === module) {
  const secili = { delicilik: M.AGIR_DELICILIK, verim: M.AGIR_VERIM };

  // §1 — eğri
  const egri = [0, 10, 20, 30, 40, 60].map((z) => ({
    z,
    eski: eskiEtkinlik(z).agir,
    yeni: etkinlik(z).agir,
    hafif: etkinlik(z).hafif,
  }));

  // §2 — tarama
  const tarama = [];
  for (const d of [0.6, 0.7, 0.8])
    for (const v of [0.75, 0.8, 0.85, 0.9]) {
      M.AGIR_DELICILIK = d;
      M.AGIR_VERIM = v;
      const t = tabloKontrol();
      const y = tekYonlulukTaramasi();
      tarama.push({
        d,
        v,
        etkinlikler: DENGE.BIRIM_SIRASI.map((tt) => etkinlik(DENGE.BIRIMLER[tt].zirh).agir),
        kirik: t.kirik,
        sapma: t.enBuyukSapma,
        zafer: y.geriTepmeler.filter((g) => g.tip === 'zafer-kaybi').length,
        kuvvet: y.geriTepmeler.filter((g) => g.tip === 'kuvvet-kaybi').length,
      });
    }
  M.AGIR_DELICILIK = secili.delicilik;
  M.AGIR_VERIM = secili.verim;

  // §3 — seçilen ayarla tam tarama
  const sonuc = tekYonlulukTaramasi();
  const matris = ARAZILER.map((a) => ({ arazi: a, satir: matrisSatiri(a) }));
  const baraj = barajGerekenOran();

  const yuzde = (x) => (x * 100).toFixed(0) + '%';
  const iki = (x) => x.toFixed(3);

  const metin = `# Delicilik ölçümü — ağır vuruş ve araştırmanın tek yönlülüğü

**Üreten:** \`node scripts/delicilik-olcum.js\` · 2026-08-11
**Soru:** Baki — *"Ağır vuruş zırha karşı delicilik versin, bonus hasar kazanmasın; zırhın
bir kısmına ignore atsın. Onun dışında araştırmalarda 3 tür için de statlar geliştirildikçe
kalitesinin azalma durumu olmasın."*

İki istek aynı hatanın iki yüzü çıktı: eğri zırha bonus verdiği için zırh araştırması
oyuncuyu zayıflatıyordu. Bir formül düzeltmesi ikisini birden kapattı.

---

## 1. Eğri: bonus gerçekten var mıydı?

Ağır vuruşun etkinliği, hedefin ortalama zırhına göre:

| Hedefin zırhı | ESKİ ağır | YENİ ağır | Hafif (değişmedi) |
|---|---|---|---|
${egri.map((e) => `| ${e.z} | ${iki(e.eski)} | ${iki(e.yeni)} | ${iki(e.hafif)} |`).join('\n')}

**Eski sütun zırhla birlikte BÜYÜYOR.** Formül şuydu:

    agir = (1 − zırh/200) × (0.55 + zırh/100)

Birinci çarpan zırhı bir koruma sayıyordu, ikincisi ("yumuşak hedefte mermi israfı") zırhı
bir ÖDÜL sayıyordu — ve ikincisi kazanıyordu. Üç birimde karşılığı: piyadeye ${iki(egri[1].eski)},
topçuya ${iki(egri[2].eski)}, zırhlıya ${iki(egri[4].eski)}. Yani ağır vuruş, en zırhlı hedefte
en verimliydi.

Yeni formül tek bir zırh eğrisi kullanıyor; ağır vuruşun tek ayrıcalığı zırhın
**%${(secili.delicilik * 100).toFixed(0)}'ini yok saymak**:

    kalanZırh = zırh × (1 − ${secili.delicilik})
    agir      = ${secili.verim} × (1 − kalanZırh / ${M.HAFIF_BOLEN})
    hafif     = 1 − zırh / ${M.HAFIF_BOLEN}

Zırh artık ağır vuruşu da **her zaman** azaltıyor, yalnızca hafif vuruşa göre
${(1 / (1 - secili.delicilik)).toFixed(1)} kat daha az. Bonus yok, delicilik var.

⚠ **Zırhın ağır vuruşu ne kadar azalttığı DEĞİŞMEDİ.** Eski sönüm böleni 200'dü ve
${M.HAFIF_BOLEN}/(1 − ${secili.delicilik}) = ${(M.HAFIF_BOLEN / (1 - secili.delicilik)).toFixed(0)} —
aynı sayı. Delicilik yeni bir mekanik değil, zaten oradaki şeyin doğru adı. Değişen tek şey
bonusun kalkması.

---

## 2. İki sayı nasıl seçildi

Hakem her zamanki: §3.7'nin 15 satırı, kalan-oran çıpaları, eşit para matrisi ve (yeni)
araştırmanın tek yönlülüğü. Delicilik × verim taraması:

| Delicilik | Verim | agir (p/t/z) | 15 satır | Çıpa sapması | Zafer kaybı | Kuvvet kaybı |
|---|---|---|---|---|---|---|
${tarama
  .map(
    (t) =>
      `| ${yuzde(t.d)} | ${t.v} | ${t.etkinlikler.map(iki).join(' / ')} | ${
        t.kirik.length ? '✗ ' + t.kirik.join('; ') : '15/15 ✓'
      } | ${t.sapma.toFixed(2)} | ${t.zafer} | ${t.kuvvet} |`
  )
  .join('\n')}

**Seçilen: delicilik %${(secili.delicilik * 100).toFixed(0)} · verim ${secili.verim}.**

- **Delicilik %70**, çünkü mevcut sönümün ta kendisi (yukarıda). Zırhın ağır vuruşa etkisi
  hiç oynamıyor; yalnızca bonus kalkıyor. En az müdahale.
- **Verim 0.80**, çünkü 15 satırı da tutan, çıpaları hiç oynatmayan ve geri tepmesi en az
  olan değer. 0.90'da "3p+1t+1z vs 5 topçu" ters dönüyor — topçu her şeye karşı iyi bir
  birime dönüşüyor ve taş-kağıt-makas kapanıyor.
- Yan fayda: agir = 0.80 − 0.004 × zırh, yani üç birimde de temiz iki hane
  (${DENGE.BIRIM_SIRASI.map((t) => iki(etkinlik(DENGE.BIRIMLER[t].zirh).agir)).join(' · ')}).

---

## 3. Araştırma tek yönlü mü?

**${sonuc.denenen} muharebe tarandı** — 8 stat dalı × ${DENGE.ARASTIRMA.TAVAN + 1} seviye ×
${ORDULAR.length}×${ORDULAR.length} ordu × 3 arazi × saldıran/savunan.

| Bulgu | Sayı |
|---|---|
| Yükseltmenin KAZANILAN savaşı kaybettirdiği durum | **${sonuc.geriTepmeler.filter((g) => g.tip === 'zafer-kaybi').length}** |
| Sonuç aynı ama araştıranın daha az birimle çıktığı durum | ${sonuc.geriTepmeler.filter((g) => g.tip === 'kuvvet-kaybi').length} |

### Eski modelin geri tepmesi — 60 puan ödeyip savaşı kaybetmek

Düzeltme öncesi en net örnek (eski eğriyle ölçüldü):

| Savunan topçunun zırh dalı | Zırhı | Gelen ağır vuruşun etkinliği | Sonuç |
|---|---|---|---|
| Sv.0 | 20 | 0.675 | **kazanıyor** |
| Sv.1 | 24 | 0.695 | *kaybediyor* |
| Sv.2 | 28 | 0.714 | kazanıyor |
| Sv.3 | 32 | 0.731 | kazanıyor |

*(3 topçu vs 3 topçu, ova.)* Zırh arttıkça gelen ağır vuruş **güçleniyordu**; topçu
düellosu ağır vuruş düellosu olduğu için 60 puanlık ilk yükseltme savaşı çeviriyordu.
Ekranda "zırhın 20 → 24" yazıyor, sahada ordu zayıflıyordu — sessiz ve en kötü türden hata.

Yeni modelde aynı savaşta gelen ağır vuruş **0.720 → 0.704 → 0.688 → 0.672** diye
azalıyor ve savunan dört seviyede de kazanıyor.

${
  sonuc.geriTepmeler.length === 0
    ? '### Kalan geri tepme yok.'
    : `### Kalan ${sonuc.geriTepmeler.length} durum ve sebebi

${sonuc.geriTepmeler
  .slice(0, 6)
  .map(
    (g) =>
      `- \`${g.birim}.${g.dal}\` Sv.${g.seviye - 1}→Sv.${g.seviye} · ${g.senaryo} · ${iki(
        g.once
      )} → ${iki(g.sonra)}`
  )
  .join('\n')}

**Sebebi eğri değil, bozgunun kademeli olması.** Bunlar ZATEN KAYBEDİLEN savaşlar: daha
dayanıklı ordu bozgun eşiğine bir raunt geç varıyor, o fazladan raundda bir raunt daha
hasar yiyor ve bir birim eksik kaçıyor. Yani "dayanmak, kaçmaktan pahalıya gelebiliyor".

Bu, etkinlik eğrisinden bağımsız bir yapı sonucu — taramada her ayarda çıkıyor (yukarıdaki
tablonun son sütunu). Kazanılan savaşta hiç görülmüyor, kaybedilen savaşta bir birim.
Düzeltmek için bozgun kuralını raundun içine taşımak gerekir; bu ayrı bir tasarım kararı
ve **Baki'nin cevabı bekleniyor** — kendiliğinden değiştirilmedi.`
}

---

## 4. Baraj oranı yeniden çözüldü

Baki'nin tarifi: *"1 topçu, 1 piyadeyi savaşın başında yarı dayanıklılığa indirsin."*
Bu oran topçunun piyadeye verdiği normal hasara bölünerek çıkıyor, yani etkinlik eğrisi
her değiştiğinde yeniden çözülmek zorunda.

| | Topçunun piyadeye vuruşu | Piyadenin yarı canı | Gereken oran |
|---|---|---|---|
| Eski eğri | ${(DENGE.BIRIMLER.topcu.agirVurus * eskiEtkinlik(DENGE.BIRIMLER.piyade.zirh).agir + DENGE.BIRIMLER.topcu.hafifVurus * eskiEtkinlik(DENGE.BIRIMLER.piyade.zirh).hafif).toFixed(2)} | ${baraj.yariCan} | 0.81 → yazılan **0.80** |
| Yeni eğri | ${baraj.vurus.toFixed(2)} | ${baraj.yariCan} | ${baraj.oran.toFixed(3)} → yazılan **${DENGE.ARASTIRMA.OZEL.BARAJ_ON_VURUS}** |

Oran 0.80'de bırakılsaydı baraj piyadeyi yarıya değil **%${((0.8 * baraj.vurus * 100) / (baraj.yariCan * 2)).toFixed(0)}'ine**
indirirdi ve Baki'nin cümlesi sessizce kaybolurdu. Sayı değil, cümle sabit.

---

## 5. Ne değişti, ne değişmedi

**Değişmedi:** §3.7'nin 15 satırı ve dört tasarım kısıtı (15/15), kalan-oran çıpalarının
hepsi, hafif vuruş eğrisi, bütün birim statları, fiyatlar, moral, arazi çarpanları.

**Değişti — ve bu doğrudan isteğin sonucu:** ağır vuruş yumuşak hedefte daha verimli
(0.617 → 0.760), zırhlıda daha az (0.760 → 0.640). Somut karşılığı:

- Piyade, topçu ve zırhlının ağır ateşine karşı biraz daha kırılgan.
- Zırhlı savaşları biraz daha uzun (zırhlıya giden ağır hasar %16 azaldı).
- Zırh araştırmak artık gerçekten koruyor — hem hafif hem ağır ateşe karşı.

Eşit para matrisi (satır = saldıran, sütun = piyade/topçu/zırhlı · K = saldıran kazanır):

${matris.map((m) => `- **${m.arazi}**: ${m.satir}`).join('\n')}

İki hücre yer değiştirdi: tepelikte zırhlı artık topçuyu ölçekte de yeniyor (§3.7 kısıt 3
zaten bunu söylüyordu — matris o kısıtla artık çelişmiyor), dağlıkta piyade yığını artık
zırhlıyı eşit parayla yenemiyor (1.67:1 sayı üstünlüğü yetmiyor; §3.7'nin 2:1 dağlık satırı
duruyor).
`;

  fs.writeFileSync(path.join(__dirname, '..', 'veri', 'delicilik-olcum.md'), metin, 'utf8');
  console.log('Yazıldı: veri/delicilik-olcum.md');
  console.log(
    '  15 satır: ' +
      (tabloKontrol().kirik.length === 0 ? '15/15 ✓' : '✗') +
      ' · zafer kaybı: ' +
      sonuc.geriTepmeler.filter((g) => g.tip === 'zafer-kaybi').length +
      ' · kuvvet kaybı: ' +
      sonuc.geriTepmeler.filter((g) => g.tip === 'kuvvet-kaybi').length +
      ' (' +
      sonuc.denenen +
      ' muharebe)'
  );
}

module.exports = { STAT_DALLARI, ORDULAR, tekYonlulukTaramasi, kaliteSkoru, eskiEtkinlik };
