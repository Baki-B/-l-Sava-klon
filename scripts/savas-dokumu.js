// SAVAŞ SENARYOSU DÖKÜMÜ (2026-08-08, Baki: "neredeyse tüm savaş senaryolarını anlat").
// Çalıştırma:  node scripts/savas-dokumu.js
//
// ---- NE YAPIYOR ----
//
// Muharebe motorunu elle kurulmuş eşleşmelerle değil, SİSTEMATİK olarak tarıyor:
// her birim karışımı × her arazi × her araştırma durumu. Amaç tek tek satırları
// ezberlemek değil, tabloya bakınca "hangi birim neye karşı iyi" sorusunun cevabının
// GÖRÜNMESİ.
//
// ---- ÜÇ AYRI TABLO, ÜÇ AYRI SORU ----
//
//   1. SAF EŞLEŞMELER   — "3 piyade 2 zırhlıyı yener mi?" Taş-kağıt-makasın kendisi.
//   2. ARAZİ FARKI      — aynı eşleşme üç arazide. Coğrafyanın gerçek ağırlığı.
//   3. ARAŞTIRMA FARKI  — aynı eşleşme, bir taraf dallı. Dört yeni yeteneğin bedeli.
//
// ---- ŞANSLI VE ŞANSSIZ AYRI ÖLÇÜLÜYOR ----
//
// `tohum: null` şansı tamamen kapatır (arayüzdeki muharebe tahmini böyle çalışıyor).
// Şanssız koşu "kural ne diyor"u, çok tohumlu koşu "sahada ne oluyor"u gösterir. İkisi
// ayrı ayrı yazılıyor çünkü ikisi ayrı soru: biri tasarım, öteki deneyim.
//
// ⚠ MORAL BONUSU YOK. Bu döküm motorun kendisini ölçüyor, oyundaki bir muharebeyi değil.
// Savunan kendi toprağında olduğu için oyunda +1 bonus alır ve sonuçlar bir tık savunan
// lehine kayar; §3.7'nin doğrulama tablosu da bonussuz çalışıyor, aynı zeminde kalındı.
//
// Çıktı: veri/savas-dokumu.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { muharebeCoz } = require('../src/oyun/muharebe.js');
const { birimStatlari, ozelEtkiler } = require('../src/oyun/arastirma.js');

const ARAZILER = ['ova', 'tepelik', 'daglik'];
const ARAZI_ADI = { ova: 'Ova', tepelik: 'Tepelik', daglik: 'Dağlık' };
// Türkçe bulunma hâli ekleri elle yazılıyor: ünlü/ünsüz uyumu üçünde üç farklı ek veriyor
// (ovaDA · tepelikTE · dağlıkTA) ve düz bir birleştirme "ovata/tepelikta" gibi bozuk
// sözcükler üretiyordu. Rapor Baki'nin okuduğu bir metin; bozuk Türkçe kabul edilmiyor.
const ARAZI_NEREDE = { ova: 'ovada', tepelik: 'tepelikte', daglik: 'dağlıkta' };
const KISA = { piyade: 'P', topcu: 'T', zirhli: 'Z' };
const TOHUM_SAYISI = 400;

function yaz(birimler) {
  return DENGE.BIRIM_SIRASI.filter((t) => birimler[t] > 0)
    .map((t) => birimler[t] + KISA[t])
    .join('+');
}

// Tek muharebe, şanssız (kural ne diyor).
function kesin(saldiran, savunan, arazi, etkiler, statlar) {
  return muharebeCoz({
    saldiran: { birimler: saldiran },
    savunan: { birimler: savunan },
    arazi,
    tohum: null,
    etkiler,
    statlar,
  });
}

// Çok tohumlu koşu (sahada ne oluyor). Dönen: saldıranın kazanma yüzdesi + ortalama kalan.
function oran(saldiran, savunan, arazi, etkiler, statlar) {
  let galip = 0,
    kalanA = 0,
    kalanS = 0,
    raunt = 0;
  for (let i = 0; i < TOHUM_SAYISI; i++) {
    const s = muharebeCoz({
      saldiran: { birimler: saldiran },
      savunan: { birimler: savunan },
      arazi,
      tohum: 1000 + i * 7919,
      etkiler,
      statlar,
    });
    if (s.kazanan === 'saldiran') galip++;
    kalanA += s.saldiran.kalan;
    kalanS += s.savunan.kalan;
    raunt += s.turlar.length;
  }
  return {
    yuzde: (galip / TOHUM_SAYISI) * 100,
    kalanA: kalanA / TOHUM_SAYISI,
    kalanS: kalanS / TOHUM_SAYISI,
    raunt: raunt / TOHUM_SAYISI,
  };
}

// ---- 1. SAF EŞLEŞMELER ----
// Her tür, her türe karşı, 1–4 birim. Tek bir tabloya sığması için kazanan ve kalan
// kuvvet yazılıyor; tam döküm satır sayısını üçe katlardı ve kimse okumazdı.
function safEslesmeler() {
  const bolumler = [];
  for (const arazi of ARAZILER) {
    const satirlar = [
      '| Saldıran → Savunan | Kazanan | Kalan | Raunt | Şanslı: saldıran kazanma |',
      '|---|---|---|---|---|',
    ];
    for (const a of DENGE.BIRIM_SIRASI) {
      for (const s of DENGE.BIRIM_SIRASI) {
        for (const [na, ns] of [
          [1, 1],
          [2, 1],
          [3, 1],
          [2, 2],
          [3, 2],
          [4, 2],
          [3, 3],
          [4, 3],
        ]) {
          const A = { [a]: na },
            S = { [s]: ns };
          const k = kesin(A, S, arazi);
          const o = oran(A, S, arazi);
          const kazanan =
            k.kazanan === 'saldiran'
              ? 'SALDIRAN'
              : k.kazanan === 'savunan'
                ? 'savunan'
                : 'berabere';
          satirlar.push(
            '| ' +
              yaz(A) +
              ' → ' +
              yaz(S) +
              ' | ' +
              kazanan +
              ' | ' +
              k.saldiran.kalan +
              ' / ' +
              k.savunan.kalan +
              ' | ' +
              k.turlar.length +
              ' | %' +
              o.yuzde.toFixed(1) +
              ' |'
          );
        }
      }
    }
    bolumler.push('### ' + ARAZI_ADI[arazi] + '\n\n' + satirlar.join('\n'));
  }
  return bolumler.join('\n\n');
}

// ---- 2. ARAZİ FARKI ----
// Aynı eşleşme üç arazide yan yana: coğrafyanın kararı çevirdiği yerler.
function araziFarki() {
  const eslesmeler = [
    [{ zirhli: 1 }, { topcu: 1 }],
    [{ zirhli: 1 }, { piyade: 2 }],
    [{ zirhli: 2 }, { topcu: 2 }],
    [{ zirhli: 3 }, { piyade: 4 }],
    [{ zirhli: 4 }, { topcu: 6 }],
    [{ topcu: 2 }, { piyade: 3 }],
    [{ piyade: 4 }, { piyade: 3 }],
    [{ piyade: 3 }, { topcu: 2 }],
    [{ piyade: 3, topcu: 1, zirhli: 1 }, { topcu: 5 }],
  ];
  const satirlar = ['| Eşleşme | Ova | Tepelik | Dağlık |', '|---|---|---|---|'];
  for (const [A, S] of eslesmeler) {
    const hucre = ARAZILER.map((arazi) => {
      const k = kesin(A, S, arazi);
      const o = oran(A, S, arazi);
      const kim = k.kazanan === 'saldiran' ? 'S' : k.kazanan === 'savunan' ? 'D' : '=';
      return kim + ' (%' + o.yuzde.toFixed(0) + ')';
    });
    satirlar.push('| ' + yaz(A) + ' → ' + yaz(S) + ' | ' + hucre.join(' | ') + ' |');
  }
  return (
    satirlar.join('\n') +
    '\n\n> **S** = saldıran kazanır · **D** = savunan (defans) kazanır · **=** berabere\n' +
    '> Parantez içi: şanslı koşuda saldıranın kazanma yüzdesi (' +
    TOHUM_SAYISI +
    ' tohum).'
  );
}

// ---- 3. ARAŞTIRMA FARKI ----
// Dört yeni yeteneğin her biri: aynı eşleşme, dal kapalı ve açık.
function arastirmaFarki() {
  const senaryolar = [
    {
      ad: 'Baraj ateşi (topçu)',
      dal: { 'topcu.baraj': 1 },
      taraf: 'saldiran',
      eslesmeler: [
        [{ topcu: 1 }, { piyade: 1 }, 'ova'],
        [{ topcu: 2 }, { piyade: 3 }, 'ova'],
        [{ topcu: 3 }, { zirhli: 2 }, 'ova'],
        [{ topcu: 4 }, { piyade: 5 }, 'tepelik'],
      ],
    },
    {
      ad: 'Paletli üstünlük (zırhlı)',
      dal: { 'zirhli.palet': 1 },
      taraf: 'saldiran',
      eslesmeler: [
        [{ zirhli: 1 }, { topcu: 1 }, 'daglik'],
        [{ zirhli: 1 }, { piyade: 2 }, 'daglik'],
        [{ zirhli: 2 }, { topcu: 2 }, 'tepelik'],
        [{ zirhli: 3 }, { piyade: 4 }, 'daglik'],
      ],
    },
    {
      ad: 'Zırh dalı Sv.3 (piyade)',
      dal: { 'piyade.zirh': 3 },
      taraf: 'savunan',
      // ⚠ EŞLEŞMELER 2026-08-12'DE DÜZELTİLDİ — topçu dalıyla AYNI HATA buradaydı.
      // Eski liste (2T→3P · 2Z→4P · 4P→3P ova) baştan kararlı satırlardan kuruluydu:
      // %0.0 · %99.3 · %98.3. Böyle bir satırda dal ne yaparsa yapsın sonuç kıpırdamıyor
      // ve tablo "zırh dalı hiçbir işe yaramıyor" diye okunuyordu. Oysa yakın eşleşmede
      // 34 puan çeviriyor. Ölçüt seçilirken şu kural konuldu: dalsız oran %25–%92
      // bandında olmayan eşleşme bu tabloya girmez — kararlı satır ölçüm yapmaz.
      eslesmeler: [
        [{ piyade: 6 }, { piyade: 6 }, 'ova'],
        [{ topcu: 3 }, { piyade: 3 }, 'daglik'],
        [{ piyade: 6 }, { piyade: 5 }, 'daglik'],
      ],
    },
    {
      ad: 'Ağır vuruş Sv.3 (topçu)',
      dal: { 'topcu.agir': 3 },
      taraf: 'saldiran',
      // ⚠ EŞLEŞMELER 2026-08-08'DE DÜZELTİLDİ. Önceki liste topçunun ZATEN KAYBETTİĞİ
      // satırlardan kuruluydu (2T → 2Z) ve dal açılınca oran %1.8'den %0'a DÜŞÜYORDU —
      // dal zayıfladı diye değil, topçu güçlenince güç farkı şans eşiğini aşıp sürprizi
      // kapattığı için. Yanıltıcı bir satırdı: dalın işe yaramadığını sanmaya yol açıyordu.
      // Yerine topçunun gerçekten çevirebileceği yakın eşleşmeler kondu.
      eslesmeler: [
        [{ topcu: 4 }, { zirhli: 2 }, 'ova'],
        [{ topcu: 6 }, { zirhli: 3 }, 'ova'],
        [{ topcu: 3 }, { zirhli: 2 }, 'tepelik'],
      ],
    },
  ];

  const bolumler = [];
  // ⚠ ÖZET TABLOSUNUN SAYILARI BURADAN TOPLANIYOR, ELLE YAZILMIYOR (2026-08-12).
  // Aşağıdaki "en büyük etkisi" tablosunda sayılar SABİT YAZILIYDI ("%0 → %98") ve baraj
  // 0.69'dan 0.20'ye inince RAPOR YALAN SÖYLEMEYE BAŞLADI: üst tablo %4.8 → %38 derken
  // özet hâlâ %0 → %98 diyordu. Projenin "aynı sayıyı iki yere yazma" kuralının tam da
  // uyardığı hata. Artık her dalın en büyük etkisi ölçümden çıkıyor.
  const enBuyukEtki = [];
  for (const sen of senaryolar) {
    const satirlar = ['| Eşleşme | Arazi | Dalsız | Dallı | Fark |', '|---|---|---|---|---|'];
    const etki = ozelEtkiler(sen.dal);
    const stat = birimStatlari(sen.dal);
    let en = null;
    for (const [A, S, arazi] of sen.eslesmeler) {
      const dalsiz = oran(A, S, arazi);
      const dalli = oran(A, S, arazi, { [sen.taraf]: etki }, { [sen.taraf]: stat });
      // Savunan tarafı güçlendiriyorsak saldıranın kazanma oranı DÜŞMELİ.
      const fark = dalli.yuzde - dalsiz.yuzde;
      if (!en || Math.abs(fark) > Math.abs(en.fark))
        en = {
          fark,
          metin:
            yaz(A) +
            ' → ' +
            yaz(S) +
            ' ' +
            ARAZI_NEREDE[arazi] +
            ' **%' +
            dalsiz.yuzde.toFixed(0) +
            ' → %' +
            dalli.yuzde.toFixed(0) +
            '**',
        };
      satirlar.push(
        '| ' +
          yaz(A) +
          ' → ' +
          yaz(S) +
          ' | ' +
          ARAZI_ADI[arazi] +
          ' | %' +
          dalsiz.yuzde.toFixed(1) +
          ' | %' +
          dalli.yuzde.toFixed(1) +
          ' | ' +
          (fark >= 0 ? '+' : '') +
          fark.toFixed(1) +
          ' |'
      );
    }
    bolumler.push(
      '### ' +
        sen.ad +
        ' — ' +
        (sen.taraf === 'saldiran' ? 'SALDIRANDA' : 'SAVUNANDA') +
        '\n\n' +
        satirlar.join('\n')
    );
    const ozel = Object.keys(sen.dal).some((a) => a.endsWith('.baraj') || a.endsWith('.palet'));
    enBuyukEtki.push({
      ad: sen.ad,
      bedel: (ozel ? DENGE.ARASTIRMA.OZEL_MALIYET : DENGE.ARASTIRMA.MALIYET_TABANI * 6) + ' puan',
      etki: en,
    });
  }
  return { metin: bolumler.join('\n\n'), enBuyukEtki };
}

// ---- 4. YARALI ORDU ----
// Yaralılık ikinci muharebeden itibaren devreye giriyor; ayrı ölçülmezse görünmez.
function yaraliFarki() {
  const satirlar = ['| Eşleşme | Sağlam | Yarısı yaralı | Hepsi yaralı |', '|---|---|---|---|'];
  const eslesmeler = [
    [{ piyade: 4 }, { piyade: 3 }],
    [{ zirhli: 3 }, { piyade: 4 }],
    [{ topcu: 3 }, { zirhli: 2 }],
  ];
  for (const [A, S] of eslesmeler) {
    const n = Object.values(A)[0];
    const tur = Object.keys(A)[0];
    const hucre = [0, Math.floor(n / 2), n].map((y) => {
      let galip = 0;
      for (let i = 0; i < TOHUM_SAYISI; i++) {
        const s = muharebeCoz({
          saldiran: { birimler: A, yarali: y > 0 ? { [tur]: y } : {} },
          savunan: { birimler: S },
          arazi: 'ova',
          tohum: 1000 + i * 7919,
        });
        if (s.kazanan === 'saldiran') galip++;
      }
      return '%' + ((galip / TOHUM_SAYISI) * 100).toFixed(1);
    });
    satirlar.push('| ' + yaz(A) + ' → ' + yaz(S) + ' | ' + hucre.join(' | ') + ' |');
  }
  return satirlar.join('\n');
}

const M = DENGE.MUHAREBE;
// Tek koşu: hem §3'ün tabloları hem aşağıdaki özetin sayıları buradan geliyor.
const arastirma = arastirmaFarki();

const metin = `# SAVAŞ SENARYOSU DÖKÜMÜ

> Üretici: \`node scripts/savas-dokumu.js\` · şanslı koşular ${TOHUM_SAYISI} tohum
> Moral bonusu YOK (motorun kendisi ölçülüyor, oyundaki bir muharebe değil).

Ayar: \`SANS_BANDI ${M.SANS_BANDI}\` · \`GUN_BANDI ${M.GUN_BANDI}\` ·
\`BASKIN ${M.BASKIN.OLASILIK}\` · \`bozgun tabanı ${M.MORAL.TABAN}\`

---

## Nasıl okunur

Her muharebe **raunt raunt** çözülüyor ve iki taraf **aynı anda** vuruyor. Bir ordu
canının en az **${(M.MORAL.TABAN * 100).toFixed(0)}%**'ini kaybedince bozguna uğrayıp çekiliyor —
imha edilmesi gerekmiyor. Eşik tek bir sayı değil: taban bu, ilin moral statı ve durum
kalemleri üstüne ekliyor (\`denge.js MUHAREBE.MORAL\`).

Üç şey sonucu kaydırıyor ve üçü de yalnızca **güçler yakınken** devrede:
- **Raunt şansı** (±%${(M.SANS_BANDI * 100).toFixed(0)}) — her raunt ayrı çekiliyor,
  uzun savaşta ortalamaya yakınsıyor
- **Gün çarpanı** (±%${(M.GUN_BANDI * 100).toFixed(0)}) — muharebe başına **tek** zar,
  bütün savaş boyunca sabit. Asıl sürprizi bu üretiyor.
- **Baskın** (%${(M.BASKIN.OLASILIK * 100).toFixed(0)}) — zayıf taraf ilk raundu
  bedavaya alır

Güç farkı ${M.SANS_KAPANMA_ORANI} katı aşınca üçü de **sıfırlanıyor**: umutsuz eşleşmede
sürpriz yok.

---

## 1. SAF EŞLEŞMELER

Tek tür karşı tek tür. "Kalan" sütunu şanssız koşunun sonucu: saldıranda kaç birim kaldı /
savunanda kaç birim kaldı.

${safEslesmeler()}

---

## 2. ARAZİ AYNI SAVAŞI NASIL ÇEVİRİYOR

${araziFarki()}

---

## 3. ARAŞTIRMA NE KADAR DEĞİŞTİRİYOR

> **\`+0.0\` satırları "dal işe yaramıyor" demek DEĞİLDİR.** Dalsız oranı zaten %0 ya da
> %99 olan bir eşleşmede oynayacak yer yoktur — sonuç dalsız da dallı da aynıdır. Dalın
> gücü, sonucun HENÜZ BELLİ OLMADIĞI satırlarda okunur. Bu ayrım 2026-08-12'de kanla
> yazıldı: zırh dalının üç eşleşmesi de baştan kararlıydı ve tablo dört gün boyunca
> "zırh dalı hiçbir işe yaramıyor" diye okunuyordu; yakın eşleşmeyle ölçülünce 34 puan
> çevirdiği görüldü.

${arastirma.metin}

---

## 4. YARALI ORDUYLA SAVAŞA GİRMEK

Yaralı birim aynı güçle vuruyor ama canı yarısı kadar (\`YARALI_CAN ${M.YARALI_CAN}\`).
Tablo, aynı orduyla aynı savaşa üç farklı sağlıkta girmenin bedelini gösteriyor.

${yaraliFarki()}

---

## ⚠ ÖLÇÜMÜN GÖSTERDİĞİ ÜÇ ŞEY

### 1. Dört dal da savaşı çeviriyor — ucuzu da pahalısı da

Tablo 3'ün en çarpıcı satırları yan yana konunca (**sayılar tablodan türetiliyor, elle
yazılmıyor** — 2026-08-12'de bu satırlar sabit yazılıydı ve baraj zayıflatılınca rapor
yalan söylemeye başlamıştı):

| Dal | Bedel | En büyük etkisi |
|---|---|---|
${arastirma.enBuyukEtki
  .map((e) => '| **' + e.ad + '** | ' + e.bedel + ' | ' + (e.etki ? e.etki.metin : '—') + ' |')
  .join('\n')}

⚠ **BU BÖLÜMÜN ESKİ BAŞLIĞI YANLIŞTI VE 2026-08-12'DE DEĞİŞTİ.** Burada "otuz kat pahalı
olan dal yüz kat daha az iş yapıyor" yazıyordu ve stat dallarının etkisi %0–1 diye
geçiyordu. O cümle \`ARTIS\` %8–10 iken doğruydu; 2026-08-08'de %${(
  DENGE.ARASTIRMA.ARTIS * 100
).toFixed(0)} olunca geçerliliğini
yitirdi ama metin güncellenmedi. Yukarıdaki tablo artık ölçümden geliyor ve stat dallarının
Sv.3'te 30–55 puanlık çevirme yaptığını gösteriyor.

Kalan fark **kimlik farkı**, güç farkı değil: stat dalları bir sayıyı kaydırıyor ve etkileri
o birimin bulunduğu her savaşa yayılıyor; özel dallar savaşın YAPISINI değiştiriyor —
karşılıksız bir atış, ya da arazi cezasının kalkması — ama yalnızca kendi koşullarında
(baraj topçu ister, palet engebeli arazi ister).

⚠ **2026-08-12'de fiyat ve güç birlikte ayarlandı.** Ölçüm (\`veri/arastirma-olcum.md\`)
barajın yakın kaybedilen savaşların %95'ini çevirdiğini gösterince Baki iki şeyi birden
istedi: fiyat ${DENGE.ARASTIRMA.OZEL_MALIYET} puana çıksın ve dört dal da "%50 seviyesine
yaklaşsın". Barajın ön vuruşu 0.69 → ${DENGE.ARASTIRMA.OZEL.BARAJ_ON_VURUS} indi (%95 → %55).
Bir stat dalı hâlâ ${DENGE.ARASTIRMA.MALIYET_TABANI * 6} puan, yani özel dalın
${Math.round((DENGE.ARASTIRMA.MALIYET_TABANI * 6) / DENGE.ARASTIRMA.OZEL_MALIYET)} katı —
özel dallar bilerek erken açılan yetenekler olarak kaldı.

### 2. Dağlık artık zırhlıyı durdurmuyor (paletli üstünlük varsa)

Tasarımın üçüncü kısıtı şuydu: *"zırhlı topçuyu ovada yener, topçunun tek şansı coğrafya."*
Görev 12'de arazi yumuşatması tam bu satır yüzünden 1.30'da kesilmişti.

Paletli üstünlük o kısıtı **satın alınabilir** hâle getiriyor: dağlıkta 1Z → 2P dalsız %1,
dallı %84. Bu Baki'nin açık isteğiydi (*"dağlık için bitmeye yakın bir orana düşsün"*) ve
tasarım kısıtının kendisi değil, kısıtın **bedava** olması bozuldu — topçu hâlâ dağda
üstün, yalnızca yatırım yapmamış zırhlıya karşı.

### 3. Yaralı orduyla savaşa girmek çok pahalı

4P → 3P eşleşmesinde ordunun tamamı yaralıysa kazanma oranı **%98 → %10**. Yaralılık
"biraz zayıflama" değil, savaşı kaybettiren bir durum. Seferberlik dalının (yaralı piyade
bedava iyileşir) neden bu kadar değerli olduğunu da bu satır açıklıyor.
`;

const hedef = path.join(__dirname, '..', 'veri', 'savas-dokumu.md');
fs.writeFileSync(hedef, metin, 'utf8');
console.log('Yazıldı: veri/savas-dokumu.md');
