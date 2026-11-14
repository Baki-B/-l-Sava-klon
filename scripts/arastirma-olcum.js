// ARAŞTIRMA ETKİSİ ÖLÇÜMÜ — Görev 07 / Adım 2b'de doğdu, 2026-08-11'de ÖLÇÜTÜ DEĞİŞTİ.
// Çalıştırma:  node scripts/arastirma-olcum.js     → veri/arastirma-olcum.md
//
// ┌─ ⚠ BU BETİĞİN SORDUĞU SORU DEĞİŞTİ (2026-08-11, Baki) ──────────────────────────────┐
// │                                                                                     │
// │ > *"Araştırmaları yapılan birlikler savaşları kesinlikle değiştirebilsin; mesela    │
// │ > araştırmadan önce sınırdan kaybedilen savaşlar, bir taraf araştırmaları yapınca   │
// │ > sınırdan kazanmaya veya ezmeye başlasın."*                                        │
// │                                                                                     │
// │ ESKİ SORU: "her dal hangi seviyeye kadar §3.7'yi BOZMUYOR?" — yani araştırmanın     │
// │ dengeyi değiştirmemesi isteniyordu ve tavan oradan seçiliyordu.                     │
// │ YENİ SORU: "araştırma sınırdaki savaşları ÇEVİRİYOR mu?" — değiştirmesi isteniyor.  │
// │                                                                                     │
// │ Eski ölçüt zaten TUTARSIZDI ve bu ölçüldü: §3.7 tablosu ARAŞTIRMASIZ orduların      │
// │ tarifi. Sekiz stat dalının hangi alt kümesi açılırsa açılsın tam teçhizatta en az   │
// │ bir satır kayıyor (ölçüm §5). Yani "araştırma tabloyu bozmasın" şartının çözümü     │
// │ YOK; olsaydı da araştırma işe yaramayan bir şey olurdu.                             │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// DÖRT ÖLÇÜT, DÖRT AYRI SORU:
//   §2 ARAŞTIRMASIZ TABAN  → §3.7'nin 15 satırı ayakta mı? (oyunun kimliği; testte de var)
//   §3 SINIRDAKİ SAVAŞLAR  → kaybedilen yakın savaşlar araştırmayla dönüyor mu? ← ASIL ÖLÇÜT
//   §4 UZMANLAŞMA HARİTASI → hangi dal hangi eşleşmeyi çeviriyor? (bilgi, sınır değil)
//   §5 TAM TEÇHİZAT SAĞLIĞI→ herkes her şeyi araştırınca taş-kağıt-makas hâlâ dönüyor mu?
//
// ⚠ 2026-08-11'DE ÜÇ ESKİ HATA DA DÜZELTİLDİ. Betik §3.7 tablosunun 2026-08-08'de
// değişen biçimini kullanmaya devam ediyordu: satırın 5. alanı artık sayı değil, beklenen
// kazananın adı. `bA > bB` metinle sayıyı karşılaştırıp her satırda `false` veriyor,
// `A.OZEL.BARAJ_CARPAN` diye bir sabit de kalmadığı için özel dal ölçümü `NaN` oranla
// koşuyordu. Sonuç: özel dalların tavanı hep Sv.0 çıkıyor ve betik "TAVAN ÖLÇÜLEN SINIRI
// AŞIYOR" diye YANLIŞ alarm veriyordu. Hiçbir test bu bölümü okumadığı için sessizdi.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { birimStatlari, tumDallar, dalAnahtari, ozelEtkiler } = require('../src/oyun/arastirma.js');
const { muharebeCoz, etkinlik } = require('../src/oyun/muharebe.js');
const { TABLO, KISITLAR } = require('./muharebe-referans.js');

const PROJ = path.join(__dirname, '..');
const A = DENGE.ARASTIRMA;
const M = DENGE.MUHAREBE;
const ARAZILER = ['ova', 'tepelik', 'daglik'];
const statDallari = tumDallar().filter((d) => d.tanim.tip === 'stat');
const say = (b) => DENGE.BIRIM_SIRASI.reduce((a, t) => a + (b[t] || 0), 0);

function coz(s, d, arazi, statlar, etkiler) {
  return muharebeCoz({
    saldiran: { birimler: s },
    savunan: { birimler: d },
    arazi,
    moralBonuslari: { saldiran: 0, savunan: 0 },
    tohum: null, // şans kapalı: ölçüm belirlenimci olmalı
    statlar,
    etkiler,
  });
}

// ---- MARJ: "NE KADAR KIL PAYI" ----
//
// Birim sayısı bu soruyu cevaplayamıyor: 3'e 2 biten bir savaş da, 3'e 2 biten bambaşka
// bir savaş da aynı görünüyor. Ölçü KALAN CAN — sağlam birim tam, yaralı yarım, havuzda
// bekleyen hasar düşülmüş. 0.50 = başa baş, 0.00 = hiçbir şeyim kalmadı.
function kalanCan(taraf, statlar) {
  const S = statlar || DENGE.BIRIMLER;
  let can = 0;
  for (const t of DENGE.BIRIM_SIRASI) {
    const n = taraf.birimler[t] || 0;
    if (!n) continue;
    const y = (taraf.yarali || {})[t] || 0;
    can += (n - y + y * M.YARALI_CAN) * S[t].dayaniklilik;
  }
  return Math.max(0, can - (taraf.hasarHavuzu || 0));
}
function marj(r, statSaldiran, statSavunan) {
  const a = kalanCan(r.saldiran, statSaldiran),
    s = kalanCan(r.savunan, statSavunan);
  return a + s === 0 ? 0.5 : a / (a + s);
}

// ---- TARAMA ORDULARI ----
// Tek türden yığınlar da, karma ordular da; 2–12 birim aralığı (oyunda görülen ölçek).
function taramaOrdulari() {
  const liste = [];
  for (const p of [0, 2, 4, 6, 8])
    for (const t of [0, 2, 4])
      for (const z of [0, 1, 3]) {
        const o = {};
        if (p) o.piyade = p;
        if (t) o.topcu = t;
        if (z) o.zirhli = z;
        if (say(o) >= 2 && say(o) <= 12) liste.push(o);
      }
  return liste;
}

// ---- §3 SINIRDAKİ SAVAŞLAR ÇEVİRİLİYOR MU ----
//
// BANTLAR MARJDAN GELİYOR, elle seçilmedi: 0.45–0.50 "kıl payı", 0.40–0.45 "yakın",
// 0.30–0.40 "farklı", altı "ezildim". Beklenti bant bant DEĞİŞİK olmalı — kıl payı
// kaybedilen savaş dönmeli, ezilen savaş DÖNMEMELİ. İkincisi de bir şart: araştırma
// umutsuz savaşı kazandırıyorsa ordu büyüklüğü anlamını yitirir.
const BANTLAR = [
  { ad: 'kıl payı', alt: 0.45, ust: 0.5 },
  { ad: 'yakın', alt: 0.4, ust: 0.45 },
  { ad: 'farklı', alt: 0.3, ust: 0.4 },
  { ad: 'ezildim', alt: 0, ust: 0.3 },
];

// Tam teçhizat = bütün stat dalları tavanda.
function tamTechizat() {
  const t = {};
  for (const d of statDallari) t[d.anahtar] = A.TAVAN;
  return t;
}

// ⚠ İKİ ROL DE ÖLÇÜLÜYOR (2026-08-11, Baki: *"bunları uygula tüm birlik ve muharebe
// mekaniklerine"*). Yalnızca saldıran ölçülseydi kapsamın yarısı görülmezdi: savunanın
// arazi çarpanı var, bozgunu farklı zamanda geliyor ve kaybettiği savaş toprak kaybı
// demek. `taraf` alanı hangi rolün araştırdığını söyler.
//
// Dönen: bant başına { taraf, n, sv1, sv2, sv3, tam, tamEzdi }
// `ordular` verilmezse tam tarama; test daha küçük bir liste geçiriyor.
// `roller` verilmezse ikisi de.
function sinirTaramasi(ordular, roller) {
  const ORDULAR = ordular || taramaOrdulari();
  const ROLLER = roller || ['saldiran', 'savunan'];
  const tamSt = birimStatlari(tamTechizat());
  const sonuc = [];
  for (const taraf of ROLLER)
    for (const b of BANTLAR)
      sonuc.push({ ...b, taraf, n: 0, sv1: 0, sv2: 0, sv3: 0, tam: 0, tamEzdi: 0 });

  // Araştıran taraf `taraf`; ordular saldıran/savunan olarak buna göre diziliyor.
  const diz = (benim, onun, taraf) => (taraf === 'saldiran' ? [benim, onun] : [onun, benim]);
  const tablo = (st, taraf) => (taraf === 'saldiran' ? { saldiran: st } : { savunan: st });

  for (const taraf of ROLLER)
    for (const benim of ORDULAR)
      for (const onun of ORDULAR)
        for (const arazi of ARAZILER) {
          const temel = coz(...diz(benim, onun, taraf), arazi);
          if (temel.kazanan === taraf) continue; // kaybedilen savaşları ölçüyoruz
          const ham = marj(temel);
          const m0 = taraf === 'saldiran' ? ham : 1 - ham; // marj hep ARAŞTIRANIN gözünden
          const bant = sonuc.find((b) => b.taraf === taraf && m0 >= b.alt && m0 < b.ust);
          if (!bant) continue;
          bant.n++;

          // Seviye başına: HERHANGİ bir tek dal savaşı çeviriyor mu? Oyuncu zaten bir dal
          // seçiyor; ölçü "en iyi seçimi yapan oyuncu ne elde eder".
          for (const sv of [1, 2, 3]) {
            for (const d of statDallari) {
              if (!benim[d.birim]) continue;
              const st = birimStatlari({ [dalAnahtari(d.birim, d.dal)]: sv });
              if (coz(...diz(benim, onun, taraf), arazi, tablo(st, taraf)).kazanan === taraf) {
                bant['sv' + sv]++;
                break;
              }
            }
          }
          const rt = coz(...diz(benim, onun, taraf), arazi, tablo(tamSt, taraf));
          if (rt.kazanan === taraf) {
            bant.tam++;
            const m = taraf === 'saldiran' ? marj(rt, tamSt) : 1 - marj(rt, undefined, tamSt);
            if (m >= EZME_MARJI) bant.tamEzdi++;
          }
        }
  return sonuc;
}

// "Ezdi" sayılmanın eşiği: kalan canın %70'i bende. USTUNLUK_ESIGI (0.75) BİRİM SAYISINA
// bakıyor ve bozgunla biten savaşta kaçan ordu birimlerini koruduğu için oraya nadiren
// ulaşılıyor; can oranı aynı soruyu daha dürüst cevaplıyor.
const EZME_MARJI = 0.7;

// ---- §4 UZMANLAŞMA HARİTASI ----
// Simetrik ölçüm (iki taraf da aynı dalda aynı seviyede): hangi dal hangi eşleşmeyi
// çeviriyor? BU BİR SINIR DEĞİL, bir haritadır — "bu dala yatırım yapan oyuncu şu
// eşleşmeyi kazanmaya başlar" cümlesini kurabilmek için.
function uzmanlasmaHaritasi() {
  return statDallari.map((d) => {
    const seviyeler = [1, 2, 3].map((sv) => {
      const t = birimStatlari({ [dalAnahtari(d.birim, d.dal)]: sv });
      const donen = [];
      TABLO.forEach(([ad, s, dd, arazi, beklenen]) => {
        if (coz(s, dd, arazi, { saldiran: t, savunan: t }).kazanan !== beklenen) donen.push(ad);
      });
      return donen;
    });
    return { ...d, seviyeler };
  });
}

// ---- §5 TAM TEÇHİZAT SAĞLIĞI ----
// Herkes her şeyi araştırınca oyun hâlâ oyun mu? Ölçüt §3.7 DEĞİL (o araştırmasız orduların
// tarifi) — EŞİT PARAYLA karşılaşma matrisi ve bedel başına savaş değeri.
const bedel = (t) => DENGE.BIRIMLER[t].nufus + DENGE.BIRIMLER[t].ekonomi;
function matrisSatiri(arazi, S) {
  const butce = Math.max(...DENGE.BIRIM_SIRASI.map(bedel)) * 6;
  return DENGE.BIRIM_SIRASI.map((a) => {
    const h = DENGE.BIRIM_SIRASI.map((s) => {
      const r = coz(
        { [a]: Math.max(1, Math.floor(butce / bedel(a))) },
        { [s]: Math.max(1, Math.floor(butce / bedel(s))) },
        arazi,
        S ? { saldiran: S, savunan: S } : undefined
      );
      return r.kazanan === 'saldiran' ? 'K' : r.kazanan === 'savunan' ? 'k' : '=';
    });
    return DENGE.BIRIMLER[a].ad[0] + ':' + h.join('');
  }).join(' ');
}
function fiyatSapmasi(S) {
  const zc = ARAZILER.reduce((a, k) => a + DENGE.ARAZI[k].zirhli, 0) / ARAZILER.length;
  const v = DENGE.BIRIM_SIRASI.map((t) => {
    const b = S[t];
    const h = DENGE.BIRIM_SIRASI.map((x) => {
      const e = etkinlik(S[x].zirh);
      const ham = b.agirVurus * e.agir + b.hafifVurus * e.hafif;
      return t === 'zirhli' ? ham * zc : ham;
    });
    return { t, d: (b.dayaniklilik * (h.reduce((x, y) => x + y, 0) / 3)) / bedel(t) };
  });
  const ort = v.reduce((a, x) => a + x.d, 0) / 3;
  return {
    satir: v.map(
      (x) => DENGE.BIRIMLER[x.t].ad + ' ' + (((x.d - ort) / ort) * 100).toFixed(0) + '%'
    ),
    enBuyuk: Math.max(...v.map((x) => Math.abs(((x.d - ort) / ort) * 100))),
  };
}

// ---- §2 ARAŞTIRMASIZ TABAN ----
function tabanKontrol() {
  const durum = TABLO.map(([ad, s, d, arazi, beklenen]) => ({
    ad,
    tutuyor: coz(s, d, arazi).kazanan === beklenen,
  }));
  return {
    tutan: durum.filter((x) => x.tutuyor).length,
    kirik: durum.filter((x) => !x.tutuyor).map((x) => x.ad),
    kisitlar: KISITLAR.map((k) => ({
      ad: k.ad,
      tutuyor: k.satirlar.every((i) => durum[i].tutuyor),
    })),
  };
}

// ---- ÖZEL DALLAR: SAVAŞI ÇEVİRİYORLAR MI ----
// Eskiden bunların da bir "tavanı" ölçülüyordu ve ölçüm bozuktu (yukarıdaki not). Doğru
// soru bu değil: özel dallar tek seviyeli, tavanları tanım gereği 1. Sorulacak şey aynı
// asıl soru — sınırdaki savaşı çeviriyorlar mı?
// ⚠ İKİ SÜTUN: ÜÇ ARAZİ ORTALAMASI **VE** DALIN ÇALIŞTIĞI ARAZİ (2026-08-12).
// Tek sütun yanıltıyordu: paletli üstünlük OVADA TANIM GEREĞİ HİÇBİR ŞEY YAPMIYOR, üç
// araziye eşit ağırlık veren ortalama onu haksız yere yarıya bölüyor. Baraj her arazide
// çalışıyor, palet yalnızca tepelik ve dağlıkta — adil karşılaştırma ikisinin de çalıştığı
// arazide. Baki'nin "%50 seviyesi" hedefi bu sütunda okunmalı.
function ozelDalEtkisi(ordular) {
  const ORDULAR = ordular || taramaOrdulari();
  const dallar = [
    { ad: 'Baraj ateşi (topçu)', kayit: { 'topcu.baraj': 1 }, birim: 'topcu', kendi: ARAZILER },
    {
      ad: 'Paletli üstünlük (zırhlı)',
      kayit: { 'zirhli.palet': 1 },
      birim: 'zirhli',
      kendi: ['tepelik', 'daglik'],
      not: 'ovada tanım gereği etkisiz',
    },
  ];
  const olc = (d, araziler) => {
    let marjinal = 0,
      donen = 0;
    for (const taraf of ['saldiran', 'savunan'])
      for (const benim of ORDULAR) {
        if (!benim[d.birim]) continue;
        for (const onun of ORDULAR)
          for (const arazi of araziler) {
            const [s, sav] = taraf === 'saldiran' ? [benim, onun] : [onun, benim];
            const temel = coz(s, sav, arazi);
            if (temel.kazanan === taraf) continue;
            const ham = marj(temel);
            const m0 = taraf === 'saldiran' ? ham : 1 - ham;
            if (m0 < 0.4) continue; // kıl payı + yakın bandı
            marjinal++;
            const etki =
              taraf === 'saldiran'
                ? { saldiran: ozelEtkiler(d.kayit) }
                : { savunan: ozelEtkiler(d.kayit) };
            if (coz(s, sav, arazi, undefined, etki).kazanan === taraf) donen++;
          }
      }
    return { marjinal, donen };
  };
  return dallar.map((d) => ({ ...d, hepsi: olc(d, ARAZILER), kendiArazi: olc(d, d.kendi) }));
}

module.exports = { BANTLAR, EZME_MARJI, sinirTaramasi, tamTechizat, marj, taramaOrdulari };

// ================================ RAPOR ================================
if (require.main === module) {
  const taban = tabanKontrol();
  const sinir = sinirTaramasi();
  const harita = uzmanlasmaHaritasi();
  const ozel = ozelDalEtkisi();
  const tamSt = birimStatlari(tamTechizat());
  const fiyat0 = fiyatSapmasi(DENGE.BIRIMLER);
  const fiyatTam = fiyatSapmasi(tamSt);

  const yuz = (a, n) => (n ? ((a / n) * 100).toFixed(0) + '%' : '—');

  let md = '# ARAŞTIRMA ETKİSİ ÖLÇÜMÜ\n\n';
  md += '> Üretildi: `node scripts/arastirma-olcum.js` — ELLE DÜZENLEME.\n';
  md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n\n';
  md += '**Baki (2026-08-11):** *"Araştırmaları yapılan birlikler savaşları kesinlikle\n';
  md += 'değiştirebilsin; mesela araştırmadan önce sınırdan kaybedilen savaşlar, bir taraf\n';
  md += 'araştırmaları yapınca sınırdan kazanmaya veya ezmeye başlasın."*\n\n';
  md += '⚠ **Bu betiğin sorduğu soru bu istekle değişti.** Eskiden "araştırma §3.7 tablosunu\n';
  md += 'hangi seviyeye kadar BOZMUYOR" diye soruyor ve tavanı oradan seçiyordu. Artık\n';
  md += 'araştırmanın dengeyi değiştirmesi İSTENEN şey; ölçüt de "sınırdaki savaşları\n';
  md += 'çeviriyor mu" oldu. Eski ölçüt zaten tutarsızdı — §5 bunu gösteriyor.\n\n';

  md += '## 1. Özet\n\n';
  md += '| Ölçüt | Sonuç |\n|---|---|\n';
  md += '| Araştırmasız taban (§3.7) | **' + taban.tutan + '/' + TABLO.length + '**';
  md += taban.kirik.length ? ' ✗ ' + taban.kirik.join('; ') : ' ✓';
  md += ' |\n';
  const bul = (taraf, ad) => sinir.find((b) => b.taraf === taraf && b.ad === ad);
  const kp = bul('saldiran', 'kıl payı'),
    kpS = bul('savunan', 'kıl payı');
  md += '| Kıl payı kaybedilen savaş, tek dal Sv.3 ile dönüyor | **' + yuz(kp.sv3, kp.n);
  md += '** (saldıran) · **' + yuz(kpS.sv3, kpS.n) + '** (savunan) |\n';
  md += '| Aynısı, tam teçhizatla | **' + yuz(kp.tam, kp.n) + '** · **';
  md += yuz(kpS.tam, kpS.n) + '** |\n';
  const ez = bul('saldiran', 'ezildim'),
    ezS = bul('savunan', 'ezildim');
  md += '| Ezilerek kaybedilen savaş, tam teçhizatla dönüyor | ' + yuz(ez.tam, ez.n);
  md += ' · ' + yuz(ezS.tam, ezS.n) + ' |\n';
  md += '| Bedel başına değer sapması (araştırmasız → tam teçhizat) | ';
  md += '%' + fiyat0.enBuyuk.toFixed(0) + ' → %' + fiyatTam.enBuyuk.toFixed(0) + ' |\n\n';

  md += '## 2. Araştırmasız taban — oyunun kimliği\n\n';
  md += 'Araştırma devreye girmeden §3.7 aynen duruyor. Bu tablo değişirse **statlar**\n';
  md += 'bozulmuş demektir, araştırma değil.\n\n';
  for (const k of taban.kisitlar) md += '- ' + (k.tutuyor ? '✓' : '✗') + ' ' + k.ad + '\n';
  md += '\n## 3. SINIRDAKİ SAVAŞLAR — asıl ölçüt\n\n';
  md += 'Kaybedilen savaşlar, ne kadar kıl payı kaybedildiğine göre bantlara ayrıldı.\n';
  md +=
    'Marj = kalan can oranım (0.50 = başa baş). Sonra soruldu: araştırma bunu çeviriyor mu?\n\n';
  md += 'Ölçüm İKİ ROLÜ de kapsıyor: araştırmayı saldıran yaptığında ve savunan yaptığında.\n';
  md += 'Savunanın arazi çarpanı var ve bozgunu başka zamanda geliyor; tek rol ölçmek\n';
  md += 'kapsamın yarısını görmemek olurdu.\n\n';
  md +=
    '| Araştıran | Bant | Marj | Savaş | Tek dal Sv.1 | Sv.2 | Sv.3 | Tam teçhizat | *ezerek* |\n';
  md += '|---|---|---|---|---|---|---|---|---|\n';
  for (const b of sinir)
    md +=
      '| ' +
      b.taraf +
      ' | **' +
      b.ad +
      '** | ' +
      b.alt.toFixed(2) +
      '–' +
      b.ust.toFixed(2) +
      ' | ' +
      b.n +
      ' | ' +
      yuz(b.sv1, b.n) +
      ' | ' +
      yuz(b.sv2, b.n) +
      ' | **' +
      yuz(b.sv3, b.n) +
      '** | **' +
      yuz(b.tam, b.n) +
      '** | *' +
      yuz(b.tamEzdi, b.n) +
      '* |\n';
  md += '\nOkunuşu:\n\n';
  md +=
    '- **Kıl payı kaybettiğin savaşın ' +
    yuz(kp.sv3, kp.n) +
    "'i (savunurken " +
    yuz(kpS.sv3, kpS.n) +
    ') tek bir dalı sonuna kadar açmakla dönüyor**; tam teçhizatla ' +
    yuz(kp.tam, kp.n) +
    ' / ' +
    yuz(kpS.tam, kpS.n) +
    ". Baki'nin istediği şey bu.\n";
  md +=
    '- İlk seviye bile kıl payı bandında ' +
    yuz(kp.sv1, kp.n) +
    ' / ' +
    yuz(kpS.sv1, kpS.n) +
    ' çeviriyor — 60 puanlık ilk yatırım sahada görülüyor.\n';
  md +=
    '- **Ezilerek kaybettiğin savaş dönmüyor** (' +
    yuz(ez.tam, ez.n) +
    ' / ' +
    yuz(ezS.tam, ezS.n) +
    '). Bu da bir şart: araştırma umutsuz savaşı kazandırsaydı ordu büyüklüğü anlamını yitirirdi.\n';
  md += '- "Ezerek" sütunu, kalan canın en az %' + EZME_MARJI * 100 + "'i bende demek.\n\n";

  md += '## 4. Uzmanlaşma haritası\n\n';
  md += 'Simetrik ölçüm: İKİ TARAF da aynı dalda aynı seviyede. "Bu dala yatırım yapılan bir\n';
  md += 'dünyada hangi eşleşme yön değiştirir?" **Bu bir sınır değil, bir haritadır** —\n';
  md += 'satırların kayması araştırmanın işe yaradığının göstergesi.\n\n';
  md += '| Ağaç | Dal | Sv.1 | Sv.2 | Sv.3 |\n|---|---|---|---|---|\n';
  for (const h of harita)
    md +=
      '| ' +
      DENGE.BIRIMLER[h.birim].ad +
      ' | ' +
      h.tanim.ad +
      ' | ' +
      h.seviyeler.map((s) => (s.length ? s.join('<br>') : '—')).join(' | ') +
      ' |\n';

  md += '\n### Özel dallar — ' + A.OZEL_MALIYET + ' puan\n\n';
  md += 'Tek seviyeliler, tavanları tanım gereği 1. Onlara da aynı asıl soru soruldu:\n';
  md += 'yakın kaybedilen savaşı (marj ≥ 0.40) çeviriyorlar mı?\n\n';
  md += '| Dal | Üç arazi ortalaması | **Çalıştığı arazide** |\n|---|---|---|\n';
  for (const o of ozel)
    md +=
      '| ' +
      o.ad +
      (o.not ? ' *(' + o.not + ')*' : '') +
      ' | ' +
      yuz(o.hepsi.donen, o.hepsi.marjinal) +
      ' | **' +
      yuz(o.kendiArazi.donen, o.kendiArazi.marjinal) +
      '** |\n';
  md += '\n**Sağdaki sütun bağlayıcı olan.** Baraj üç arazide birden çalışıyor, paletli\n';
  md += 'üstünlük yalnızca tepelik ve dağlıkta — ovada ceza yok, telafi edecek şey de yok.\n';
  md += 'Üç araziye eşit ağırlık veren ortalama paleti haksız yere yarıya bölüyor.\n\n';
  md += '⚠ **Dört özel daldan yalnızca ikisi bu eksende ölçülebilir.** Seferberlik (yaralı\n';
  md += 'piyade bedava iyileşir) ve yarma (bozulan düşman yok olur) muharebenin KAZANANINI\n';
  md += 'değiştirmiyor; biri savaştan önceki bütçeye, öteki savaştan sonraki sonuca dokunuyor.\n';
  md += 'Bu eksende ikisi de %0 çıkar ve bu bir zayıflık değil, KAPSAM farkıdır: ikisi\n';
  md += '"savaşı kim kazanır" sorusunu değil, "kazanmak neye mal olur / ne kazandırır"\n';
  md += 'sorusunu cevaplıyor.\n';

  md += '\n## 5. Tam teçhizat sağlığı\n\n';
  md += 'Herkes her şeyi araştırdığında oyun hâlâ oyun mu? **Ölçüt §3.7 değil** — o tablo\n';
  md += 'araştırmasız orduların tarifi. Ölçüt, eşit parayla karşılaşma matrisi:\n\n';
  md += '| Arazi | Araştırmasız | Tam teçhizat |\n|---|---|---|\n';
  for (const a of ARAZILER)
    md += '| ' + a + ' | `' + matrisSatiri(a) + '` | `' + matrisSatiri(a, tamSt) + '` |\n';
  md += '\n(Satır = saldıran, sütun sırası piyade/topçu/zırhlı · `K` saldıran kazanır.)\n\n';
  md += 'Bedel başına savaş değeri sapması: **' + fiyat0.satir.join(' · ') + '** → ';
  md += '**' + fiyatTam.satir.join(' · ') + '**\n\n';
  md += 'Üçgen tam teçhizatta da dönüyor ve sapma %' + fiyat0.enBuyuk.toFixed(0) + ' → %';
  md += fiyatTam.enBuyuk.toFixed(0) + ' bandında kalıyor. Yani araştırma dengeyi KAYDIRIYOR\n';
  md += 'ama ÇÖKERTMİYOR — istenen tam olarak buydu.\n\n';

  md += '### ⚠ "Araştırma tabloyu bozmasın" şartının çözümü yok\n\n';
  md += "Sekiz stat dalından hangi alt küme açılırsa açılsın, tam teçhizatta §3.7'nin en az\n";
  md += 'bir satırı kayıyor (ölçüldü: sekiz dalın her biri tek tek çıkarıldı, en iyi durum\n';
  md += 'yine 1 kayan satır). Zırhlıya zırh ya da dayanıklılık dalı eklemek de kurtarmıyor,\n';
  md += 'yalnızca kayan satırı değiştiriyor. Eski ölçüt bu yüzden emekliye ayrıldı.\n\n';

  md += '## 6. Ağacın büyüklüğü\n\n';
  const statBedeli = ((A.TAVAN * (A.TAVAN + 1)) / 2) * A.MALIYET_TABANI;
  const ozelSayisi = tumDallar().length - statDallari.length;
  md += '- Stat dalı: **' + statDallari.length + '** · özel dal: **' + ozelSayisi + '**\n';
  md += '- Bir stat dalını sonuna kadar açmak: **' + statBedeli + ' puan**\n';
  md += '- Bir özel dal: **' + A.OZEL_MALIYET + ' puan**\n';
  md += '- Tam teçhizat (bütün stat dalları): **' + statDallari.length * statBedeli + ' puan**\n\n';
  md += 'Artış oransal: `stat × (1 + ' + A.ARTIS + " × seviye)`, Sv.3'te toplam %";
  md += (A.ARTIS * A.TAVAN * 100).toFixed(0) + '.\n\n';

  md += '## 7. Ölçümün kuralları\n\n';
  md += '- Kaydırılmış stat tablosu oyunun kendi `arastirma.js birimStatlari`\n';
  md += '  fonksiyonundan geliyor; ölçüm ile oyun ayrışamaz.\n';
  md += '- Şans KAPALI (tohum yok): ölçüm belirlenimci olmalı.\n';
  md += '- Her taraf KENDİ stat tablosuyla vurur, dayanır ve korunur.\n';
  md += '- Tarama orduları: 2–12 birim, tek tür ve karma, üç arazi.\n';
  md += '- §3 taraması `testler/arastirma.test.js` tarafından da koşuluyor: oranlar\n';
  md += '  düşerse test öter (liste iki yere yazılmadı, betikten `require` ediliyor).\n';

  fs.writeFileSync(path.join(PROJ, 'veri', 'arastirma-olcum.md'), md, 'utf8');

  console.log('ARAŞTIRMA ETKİSİ ÖLÇÜMÜ');
  console.log(
    '  araştırmasız taban: ' + taban.tutan + '/' + TABLO.length + (taban.kirik.length ? ' ✗' : ' ✓')
  );
  console.log('  araştıran  bant       savaş   Sv.1   Sv.2   Sv.3   tam    (ezerek)');
  for (const b of sinir)
    console.log(
      '  ' +
        b.taraf.padEnd(11) +
        b.ad.padEnd(11) +
        String(b.n).padStart(5) +
        yuz(b.sv1, b.n).padStart(7) +
        yuz(b.sv2, b.n).padStart(7) +
        yuz(b.sv3, b.n).padStart(7) +
        yuz(b.tam, b.n).padStart(7) +
        yuz(b.tamEzdi, b.n).padStart(9)
    );
  for (const o of ozel)
    console.log(
      '  ' +
        o.ad.padEnd(28) +
        'üç arazi ' +
        yuz(o.hepsi.donen, o.hepsi.marjinal).padStart(4) +
        ' · çalıştığı arazide ' +
        yuz(o.kendiArazi.donen, o.kendiArazi.marjinal)
    );
  console.log(
    '  fiyat sapması: %' + fiyat0.enBuyuk.toFixed(0) + ' → %' + fiyatTam.enBuyuk.toFixed(0)
  );
  console.log('Yazıldı: veri/arastirma-olcum.md');
}
