// DENGE SİMÜLASYONU — kartopunun büyüklüğünü ÖLÇER (Görev 06 / Adım 7, Soru 5 → cevap A).
// Çalıştırma:  node scripts/denge-simulasyonu.js
//
// SORU: Görev 06'nın iki yeni mekaniği (yeniden toplanma ve araştırma) oyuncuyu ne kadar
// hızlandırıyor? Soru 5'in cevabı "bu görevde kartopuna mekanik ekleme, ama ÖLÇ"tü —
// çünkü kartopunun asıl ilacı Görev 07'nin düşünen rakibi ve o karar SAYIYLA verilmeli.
//
// ÜÇ MEKANİK KÜMESİ × İKİ BÜTÇE REJİMİ = altı koşu, hepsi aynı tohum ve aynı davranışla:
//   1. TEMEL       — Görev 05'in oyunu: yalnızca üret, yürü, savaş
//   2. + TOPLANMA  — yıpranmış ordular doldurulabiliyor
//   3. + ARAŞTIRMA — üstüne ekonominin bir kısmı araştırmaya ayrılıyor
// Aradaki FARK, iki mekaniğin kartopuna katkısıdır.
//
// GÖREV 05'İN SAYISIYLA (tur 15'te 90/181) DOĞRUDAN KARŞILAŞTIRILAMAZ: o gözlem betiği
// yazılmadan, elle yapılmıştı. Buradaki oyuncunun davranışı yazılı ve tekrar edilebilir.
//
// OYUNCU DAVRANIŞI (basit ve belirlenimci — yapay zekâ değil, ÖLÇÜM ARACI):
//   • Sanayi hakkı olan en uygun ilinde bütçesi yettiği kadar birim basar.
//   • CİDDİ yıpranmış ordularını (mevcudu kadrosunun yarısının altına düşenler) toplar.
//   • Kalan ordularıyla, YALNIZCA üstün olduğu en zayıf komşuya saldırır.
//   • (3. koşuda) her tur ekonomisinin bir kısmını araştırmaya ayırır, biriken puanla
//     ucuzdan pahalıya seviye atlar.
//
// İKİ DÜZELTME YAPILDI, ikisi de ölçümü anlamsızlaştırıyordu — not düşülüyor ki tekrar
// edilmesin:
//   1. "Her parçadan her şeyle saldır" politikası kuvveti dağıtıyordu; sınırsız bütçeyle
//      bile 15 turda 26/181'de kalıyordu. Üstünlük şartı eklendi → 72/181.
//   2. Toplanma SALDIRIDAN SONRA çağrılıyordu; saldırı bütün birimleri rezerve ettiği için
//      toplanma hiç tetiklenmiyor ve üç koşu da aynı sonucu veriyordu. Sıra değişti.
//
// Çıktı: veri/denge-simulasyonu.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { birimUret, ilUretimHakki, birimSayisi, parcaOrdusu } = require('../src/oyun/ordu.js');
const {
  hedefleriAyir,
  kullanilabilirBirimler,
  toplanmaEmriVer,
} = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { toplanabilirMi } = require('../src/oyun/toplanma.js');
const { kadroAl } = require('../src/oyun/ordu.js');
const {
  ayrilaniAyarla,
  seviyeYukselt,
  aktorArastirmasi,
  tumDallar,
} = require('../src/oyun/arastirma.js');
const { kullanilabilirButce } = require('../src/oyun/butce.js');
const { PARCALAR, ILLER } = require('../src/oyun/veri.js');

const PROJ = path.join(__dirname, '..');
const TOHUM = 20260731;
const BEN = '16';
const TUR_SAYISI = 15;
// Araştırma koşusunda ekonominin kaçta kaçı araştırmaya ayrılıyor. Oyuncunun tipik
// "guns vs butter" tercihini temsil ediyor; uçlar (0 ve 1) zaten öteki koşularda var.
const ARASTIRMA_PAYI = 0.35;

function benimParcalarim(d) {
  return Object.keys(d.parcaSahipligi)
    .filter((p) => d.parcaSahipligi[p] === BEN)
    .sort();
}

// En çok sanayi hakkı kalan kendi parçası — üretim oraya yapılır.
//
// ---- ⚠ CEPHEDEKİ PARÇA ÖNCELİKLİ (2026-09-19 düzeltmesi) ----
// Eski hâli yalnızca "en çok hakkı kalan"a bakıyordu ve Bursa'da o parça 16-1 çıkıyor —
// DÜŞMAN KOMŞUSU OLMAYAN iç parça. Ölçüm oyuncusu bütün ordusunu oraya basıyor, sınırdaki
// parçaları 1–2 birimle kalıyor, saldırı şartını (savunandan çok birim) hiç sağlayamıyor
// ve altı koşu birden "4/181" veriyordu: tablo ölçmeyi bırakmış ama DOLU görünüyordu.
// Düzeltme: hakkı olan parçalar arasında ÖNCE düşmana sınırdaş olanlar seçiliyor. Sanayi
// sınırı zaten il başına ortak, yani hangi parçaya basıldığı üretim hakkını değiştirmiyor.
function uretimYeri(d) {
  let en = null,
    enHak = 0,
    enCephede = false;
  for (const pid of benimParcalarim(d)) {
    const hak = ilUretimHakki(d, PARCALAR[pid].kod, BEN);
    if (hak.kalan <= 0) continue;
    const cephede = hedefleriAyir(d, BEN, pid).dusman.length > 0;
    // Cephedeki parça her zaman önde; eşit durumda hakkı çok olan.
    const dahaIyi =
      en === null || (cephede && !enCephede) || (cephede === enCephede && hak.kalan > enHak);
    if (dahaIyi) {
      en = pid;
      enHak = hak.kalan;
      enCephede = cephede;
    }
  }
  return en;
}

// Bütçe yettiği kadar dengeli karışım bas (§4.5'in "dengeli il" karışımı).
function uret(d) {
  for (let deneme = 0; deneme < 12; deneme++) {
    const yer = uretimYeri(d);
    if (!yer) return d;
    const butce = kullanilabilirButce(d, BEN);
    const siparis = {};
    // Ucuzdan pahalıya, bütçe elverdikçe birer tane.
    for (const tur of DENGE.BIRIM_SIRASI) {
      const b = DENGE.BIRIMLER[tur];
      if (b.nufus <= butce.nufus && b.ekonomi <= butce.ekonomi) siparis[tur] = 1;
    }
    if (birimSayisi(siparis) === 0) return d;
    const s = birimUret(d, yer, BEN, siparis);
    if (!s.ok) return d;
    d = s.durum;
  }
  return d;
}

// ---- ⚠ ÖLÇÜM OYUNCUSU HERKESLE SAVAŞTA BAŞLAR (2026-09-19) ----
//
// Görev 11'den beri (2026-08-03) barış varsayılan ve barıştakine saldırılamıyor. Bu betik
// savaş ilan etmiyordu, yani `hedefleriAyir` hiç düşman hedef döndürmüyor ve ölçüm
// oyuncusu HİÇ SALDIRAMIYORDU — koşuların altısı da "4/181" (başlangıç parçaları) veriyor,
// yani tablo ölçmeyi bıraktığı hâlde dolu görünüyordu. Sessiz körlük 2026-09-19'da
// Görev 15 ölçümü yapılırken yakalandı.
//
// İlişki satırı DOĞRUDAN yazılıyor (testlerdeki `hepsiyleSavas` kalıbı): ilan kapısının
// kendi kuralları var (ilk turlarda yasak, ittifak varsa yasak) ve burada ölçülen şey o
// kapı değil, MEKANİKLERİN FARKI.
function savasYaz(durum, a, b) {
  const k = a < b ? a + '|' + b : b + '|' + a;
  return {
    ...durum,
    iliskiler: {
      ...(durum.iliskiler || {}),
      [k]: { tip: 'savas', turdan: durum.tur, son: durum.tur },
    },
  };
}

function hepsiyleSavas(durum, aktorId) {
  let d = durum;
  for (const id of Object.keys(durum.aktorler || {}))
    if (id !== aktorId) d = savasYaz(d, aktorId, id);
  return d;
}

// SALDIRI SEÇİCİ. İlk sürüm "her parçadan her şeyle saldır" diyordu ve oyuncu kuvvetini
// dağıtıp sürekli kırılıyordu (15 turda 26/181, sınırsız bütçeyle bile). Gerçek bir oyuncu
// kaybedeceği saldırıyı yapmaz: yalnızca savunandan ÇOK birimi varsa saldırıyor.
// Kural basit ve belirlenimci kalsın diye tahmin motoru çağrılmıyor — sayı karşılaştırması
// yeterli, çünkü ölçülen şey stratejinin kalitesi değil MEKANİKLERİN FARKI.
function saldir(d) {
  for (const pid of benimParcalarim(d)) {
    const ordu = parcaOrdusu(d, pid);
    if (!ordu || ordu.sahip !== BEN) continue;
    const eldeki = kullanilabilirBirimler(d, pid);
    const gucum = birimSayisi(eldeki);
    if (gucum === 0) continue;
    const { dusman } = hedefleriAyir(d, BEN, pid);
    if (dusman.length === 0) continue;

    // En zayıf savunmalı komşuyu seç; ancak üstünsem saldır.
    let hedef = null,
      enAz = Infinity;
    for (const h of dusman.slice().sort()) {
      const savunan = parcaOrdusu(d, h);
      const guc = savunan ? birimSayisi(savunan.birimler) : 0;
      if (guc < enAz) {
        enAz = guc;
        hedef = h;
      }
    }
    if (!hedef || gucum <= enAz) continue;

    const s = hamleUygula(d, BEN, pid, hedef, eldeki);
    if (s.ok) d = s.durum;
  }
  return d;
}

// TOPLANMA, SALDIRIDAN ÖNCE ÇAĞRILIR. Sıra önemli: toplanma emri ordunun TÜM birimlerini
// rezerve ediyor (rezervasyon defteri), yani sonra çağrılsaydı saldırı zaten her şeyi
// almış olurdu ve toplanma hiç tetiklenmezdi — ilk koşuda tam bu oldu, üç mekanik de
// aynı sonucu verdi.
//
// Yalnızca CİDDİ yıpranmış ordular toparlanıyor (mevcudu kadrosunun yarısının altına
// düşenler). Her eksiği doldurmak, bir birim kaybeden orduyu bile bir tur sahadan
// çekerdi; oyuncunun gerçek tercihi de böyle olmazdı.
const TOPLANMA_ESIGI = 0.5;

function toplan(d) {
  for (const pid of benimParcalarim(d)) {
    const ordu = parcaOrdusu(d, pid);
    if (!ordu || ordu.sahip !== BEN || !toplanabilirMi(ordu)) continue;
    const mevcut = birimSayisi(ordu.birimler);
    const kadro = birimSayisi(kadroAl(ordu));
    if (kadro === 0 || mevcut / kadro > TOPLANMA_ESIGI) continue;
    const s = toplanmaEmriVer(d, BEN, pid);
    if (s.ok) d = s.durum;
  }
  return d;
}

function arastir(d) {
  // Biriken puanla UCUZDAN pahalıya seviye atla (en düşük seviyeli dal en ucuzdur).
  for (let deneme = 0; deneme < 10; deneme++) {
    const kayit = aktorArastirmasi(d, BEN);
    // BİRİM BAŞINA AĞAÇ (Görev 07): 12 dal arasından en düşük seviyeli olan en ucuzdur.
    // Simülasyondaki oyuncu "en ucuzu al" politikası izliyor — gerçek oyuncu seçim yapar,
    // ama betiğin işi bir strateji önermek değil, mekaniğin katkısını ölçmek.
    const siralı = tumDallar()
      .slice()
      .sort((a, b) => ((kayit && kayit[a.anahtar]) || 0) - ((kayit && kayit[b.anahtar]) || 0));
    let atladi = false;
    for (const { birim, dal } of siralı) {
      const s = seviyeYukselt(d, BEN, birim, dal);
      if (s.ok) {
        d = s.durum;
        atladi = true;
        break;
      }
    }
    if (!atladi) break;
  }
  // Bu turun payını ayır.
  const butce = kullanilabilirButce(d, BEN);
  return ayrilaniAyarla(d, BEN, Math.floor(butce.ekonomi * ARASTIRMA_PAYI));
}

// Görev 05'in gözlemi BÜTÇESİ SINIRSIZ bir oyuncuyla yapılmıştı. O rejim ekonomiyi
// denklemden çıkarıp yalnızca MUHAREBE ve HAREKET sistemini zorluyor; gerçek gelir
// rejimi ise oyunun asıl temposunu gösteriyor. İkisi de koşuluyor, çünkü iki ayrı soru:
//   sınırsız → "mekanikler ne kadar hızlandırıyor" (kartopunun tavanı)
//   gerçek   → "oyun gerçekten ne kadar hızlı" (kartopunun tabanı)
const SINIRSIZ_HAVUZ = 400;

function parayiTazele(d) {
  return {
    ...d,
    aktorler: {
      ...d.aktorler,
      [BEN]: { ...d.aktorler[BEN], nufusHavuzu: SINIRSIZ_HAVUZ, ekonomiHavuzu: SINIRSIZ_HAVUZ },
    },
  };
}

function kosu({ toplanmaAcik, arastirmaAcik, sinirsiz, zorluk, zekaKapali }) {
  let d = hepsiyleSavas(oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk }), BEN);
  const gecmis = [];

  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    if (sinirsiz) d = parayiTazele(d);
    if (arastirmaAcik) d = arastir(d);
    d = uret(d);
    if (toplanmaAcik) d = toplan(d); // saldırıdan ÖNCE — sıranın sebebi `toplan`'ın notunda
    d = saldir(d);

    const emirSayisi = (d.emirler || []).length;
    d = turuBitir(d, { zekaKapali });

    const rapor = d.sonTurRaporu;
    const fetih = rapor ? rapor.satirlar.filter((s) => s.fethedildi).length : 0;
    gecmis.push({
      tur,
      emir: emirSayisi,
      fetih,
      parca: benimParcalarim(d).length,
      birim: Object.keys(d.ordular).reduce(
        (a, p) => a + (d.ordular[p].sahip === BEN ? birimSayisi(d.ordular[p].birimler) : 0),
        0
      ),
    });
  }

  const kayit = aktorArastirmasi(d, BEN);
  // Dünyanın hâli: kaç bağımsız aktör kaldı (§9.3'ün öngördüğü doğal konsolidasyon) ve
  // en büyük rakip ne kadar büyümüş. Görev 07'nin bitiş ölçütü bu iki sayıyı da istiyor.
  const sahipSayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sahipSayim[v] = (sahipSayim[v] || 0) + 1;
  const rakipler = Object.keys(sahipSayim).filter((x) => x !== BEN);
  return {
    aktorKaldi: Object.keys(sahipSayim).length,
    enBuyukRakip: rakipler.length ? Math.max(...rakipler.map((x) => sahipSayim[x])) : 0,
    gecmis,
    son: gecmis[gecmis.length - 1],
    arastirma: kayit
      ? tumDallar()
          .filter((x) => (kayit[x.anahtar] || 0) > 0)
          .map((x) => x.anahtar + ' Sv.' + kayit[x.anahtar])
          .join(' · ') || '—'
      : '—',
    kayitBoyutuKB: Buffer.byteLength(JSON.stringify({ ...d, sonTurRaporu: null }), 'utf8') / 1024,
  };
}

const MEKANIKLER = [
  ['Temel (Görev 05 oyunu)', { toplanmaAcik: false, arastirmaAcik: false }],
  ['+ Toplanma', { toplanmaAcik: true, arastirmaAcik: false }],
  ['+ Toplanma + Araştırma', { toplanmaAcik: true, arastirmaAcik: true }],
];
const REJIMLER = [
  ['Bütçesi sınırsız oyuncu', true],
  ['Gerçek geliriyle oyuncu', false],
];

const tablolar = REJIMLER.map(([rejimAd, sinirsiz]) => {
  const sonuclar = MEKANIKLER.map(([ad, secenek]) => ({ ad, ...kosu({ ...secenek, sinirsiz }) }));
  return { rejimAd, sinirsiz, sonuclar, temel: sonuclar[0].son.parca };
});

// ---- RAPOR ----
// Satırlar diziye yazılıp sonunda birleştiriliyor: uzun `md += '...\n'` zinciri hem
// okunmaz hem de kaçış karakteri hatasına açık.
const S = [];
const yaz = (...x) => S.push(...x);

yaz(
  '# DENGE SİMÜLASYONU — KARTOPUNUN BÜYÜKLÜĞÜ (Görev 06 / Adım 7)',
  '',
  '> Üretildi: `node scripts/denge-simulasyonu.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Soru 5’in cevabı **"bu görevde kartopuna mekanik ekleme, ama ÖLÇ"** idi. Ölçüm bu.',
  'Görev 07 kartopu düzeltmesine karar verirken tahminle değil bu tabloyla girecek.',
  '',
  '**Oyuncu davranışı** (betikte yazılı, tekrar edilebilir): sanayi hakkı olan en uygun',
  'ilinde bütçesi yettiği kadar birim basar · ordusu olan her parçadan komşu bir düşman',
  'parçasına elindeki her şeyle saldırır · yıpranmış ordulara toplanma emri verir ·',
  'ekonomisinin %' + ARASTIRMA_PAYI * 100 + '’ini araştırmaya ayırıp ucuzdan pahalıya',
  'seviye atlar. Bu bir yapay zekâ değil, ÖLÇÜM ARACI: basit ve belirlenimci.',
  '',
  'Tohum ' + TOHUM + ' · ' + TUR_SAYISI + ' tur · oyuncu ' + ILLER[BEN].ad + '.',
  '',
  'İKİ BÜTÇE REJİMİ birden koşuluyor, çünkü iki ayrı soru var:',
  '',
  '- **Bütçesi sınırsız** (Görev 05’in gözlem düzeni; havuz her tur ' +
    SINIRSIZ_HAVUZ +
    '’e çekiliyor): ekonomiyi denklemden çıkarır, yalnızca muharebe ve hareket',
  '  sistemini zorlar → kartopunun **tavanı**.',
  '- **Gerçek geliriyle**: oyunun asıl temposu → kartopunun **tabanı**.',
  ''
);

for (const t of tablolar) {
  yaz(
    '## ' + t.rejimAd,
    '',
    '| Koşu | Tur ' + TUR_SAYISI + ' parça | Fark | Birim | Araştırma | Kayıt |',
    '|---|---|---|---|---|---|'
  );
  for (const r of t.sonuclar) {
    const fark = r.son.parca - t.temel;
    yaz(
      '| ' +
        r.ad +
        ' | **' +
        r.son.parca +
        '/181** | ' +
        (fark === 0 ? '—' : (fark > 0 ? '+' : '') + fark) +
        ' | ' +
        r.son.birim +
        ' | ' +
        r.arastirma +
        ' | ' +
        r.kayitBoyutuKB.toFixed(1) +
        ' KB |'
    );
  }
  yaz(
    '',
    '### Tur tur (parça sayısı)',
    '',
    '| Tur | ' + t.sonuclar.map((r) => r.ad).join(' | ') + ' |',
    '|---|' + t.sonuclar.map(() => '---').join('|') + '|'
  );
  for (let i = 0; i < TUR_SAYISI; i++)
    yaz('| ' + (i + 1) + ' | ' + t.sonuclar.map((r) => r.gecmis[i].parca).join(' | ') + ' |');
  yaz('');
}

const TAVAN = DENGE.ARASTIRMA.TAVAN;
const TOPLAM_PUAN =
  tumDallar().length * ((TAVAN * (TAVAN + 1)) / 2) * DENGE.ARASTIRMA.MALIYET_TABANI;

yaz(
  '## Nasıl okunmalı',
  '',
  '- **Mutlak sayı değil, FARK anlamlı.** Görev 05’in "tur 15’te 90/181" gözlemi betiği',
  '  yazılmadan, elle yapılmıştı; buradaki oyuncunun davranışı yazılı ve tekrar edilebilir,',
  '  o yüzden iki sayı doğrudan karşılaştırılamaz.',
  '- Toplanma satırındaki fark: "yıpranmış orduyu doldurabilmek" ne kadar hızlandırıyor.',
  '- Araştırma satırındaki EK fark: ordu kalitesinin bunun üstüne ne koyduğu.',
  '- **Araştırmanın katkısının sınırlı kalmasının sebebi TAVANDIR.** Üç dal da en fazla',
  '  Sv.' +
    TAVAN +
    ' olabildiği için toplam yatırım ' +
    TOPLAM_PUAN +
    ' puanla sınırlı — araştırma',
  '  tek seferlik bir sıçrama, süren bir kartopu değil. Tavan kalkarsa bu satır büyür.',
  '- Bu oyuncunun rakibi KARAR VERMİYOR (tarafsız garnizonlar, Görev 05). Kartopunun asıl',
  '  ilacı Görev 07’nin düşünen rakibi; bu tablo onun ne kadar iş yapması gerektiğini söyler.',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'denge-simulasyonu.md'), S.join('\n'), 'utf8');

console.log('DENGE SİMÜLASYONU — ' + TUR_SAYISI + ' tur, tohum ' + TOHUM);
for (const t of tablolar) {
  console.log('\n  ' + t.rejimAd + ':');
  for (const r of t.sonuclar) {
    const fark = r.son.parca - t.temel;
    console.log(
      '    ' +
        r.ad.padEnd(26) +
        String(r.son.parca).padStart(3) +
        '/181 parça' +
        (fark === 0 ? '' : '   (' + (fark > 0 ? '+' : '') + fark + ')')
    );
  }
}
console.log('\nYazıldı: veri/denge-simulasyonu.md');
