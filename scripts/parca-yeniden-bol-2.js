// PARÇA YENİDEN BÖLÜMLEME — 2. AŞAMA: kümeleme ve aday tablo.
// Çalıştırma:  node scripts/parca-yeniden-bol-2.js  [tekIlKodu]
//   örnek:     node scripts/parca-yeniden-bol-2.js 38     (yalnız Kayseri'yi hesapla, incele)
//
// Girdi:  veri/ham/ilce-hazir.json (1. aşamanın çıktısı)
// Çıktı:  veri/ham/parca-tablo-yeni.json  (ADAY — onaydan sonra asıl tablonun yerine geçer)
//         onizleme/bolumleme-yeni.html    (il il eski/yeni karşılaştırma)
//
// YÖNTEM
//   • İlçeler ilin içinde kümelenir; küme = parça. Kümeler KARA OLARAK BÜTÜN olmak zorunda
//     (ada/karşı yaka ayrı kara gövdesiyse ayrı parça olur — İstanbul, Çanakkale gibi).
//   • Parça sayısı K, 1'den 4'e denenir; ölçütleri sağlayan EN BÜYÜK K seçilir:
//       - her parçanın iç çember çapı eşiğin üstünde (rozet okunabilirliği)
//       - hiçbir parçanın payı alt sınırın altında değil (ölü parça olmasın)
//   • Kümeleme: uzak tohumlardan bölge büyütme + sınır ilçelerini komşu kümeye taşıyarak
//     iyileştirme. Amaç: tıknaz parçalar (merkeze uzaklık düşük) + dengeli pay.
//   • Arazi: parçanın baskın arazisi (ekonomi payına göre ağırlıklı).
//     İSTİSNA: ilin arazisi üçe yakın eşit dağılmışsa arazi kümelemede BİRİNCİL ölçüt olur.

const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const polylabel = require('polylabel').default || require('polylabel');
const kanonik = require('./iller-kanonik');

const PROJ = path.join(__dirname, '..');
const ilceler = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/ham/ilce-hazir.json'), 'utf8'));
const TEK_IL = process.argv[2] || null;

// ---- ayarlar (gerekçeleri 1. aşama dosyasının başında) ----
const MAX_PARCA = 4;
const KM_PER_BIRIM = 1.6;
const ESIK_KM = 14.25 * KM_PER_BIRIM; // ≈ 22.8 km — İDEAL eşik (rozet rahat oturur)
// YUMUŞAK TABAN: bir ili tek parçaya düşürmektense, biraz küçük parçaya izin ver.
// Baki bu seviyeyi zaten onayladı (İskenderun Körfezi 12.8, Gebze 13.0, Ankara Batı 12.1)
// ve "Hatay, Ordu, Kocaeli'yi 1 parçaya indirmek çok kötü olur" dedi.
const YUMUSAK_KM = 11.0 * KM_PER_BIRIM;
const ALT_SINIR_PAY = 0.06;
const HEDEF_MIN_PAY = 0.1;
const DENGESIZ_ARAZI = 0.28;
const DENEME = 12; // her K için kaç farklı tohum denemesi

const ARAZILER = ['ova', 'tepelik', 'daglik'];

// ELLE AD — otomatik adlandırma anlamsız kaldığında (aynı yöne düşen iki parça
// "Ankara Doğu" ve "Ankara Doğu 4" olmuştu). Baki'nin isteğiyle düzeltildi (2026-07-26).
const ELLE_AD = {
  '06-2': 'Çankaya ve Güney', // Çankaya, Gölbaşı, Bala, Şereflikoçhisar, Evren
  '06-4': 'Ankara Kenti', // Altındağ, Keçiören, Mamak, Pursaklar, Çubuk, Elmadağ
};

// KORUNAN İLLER — Baki bugünkü hâllerini beğendi, yeniden bölünmezler (2026-07-26).
// Bursa'da algoritma İnegöl'ü dağlık parçaya taşıyıp %4'lük "ölü parça" dengesizliğini
// düzeltiyordu; Baki "A" dedi: beğendiği hâl korunsun, dengesizlik kabul.
const KORUNAN = {
  38: 'Kayseri',
  28: 'Giresun',
  57: 'Sinop',
  37: 'Kastamonu',
  34: 'İstanbul',
  17: 'Çanakkale',
  16: 'Bursa',
};

// ---- yardımcılar ----
function kmNokta(pt, ortLat) {
  return [pt[0] * 111.32 * Math.cos((ortLat * Math.PI) / 180), pt[1] * 110.57];
}
const uzaklik = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function ortalama(noktalar, agirlik) {
  let x = 0,
    y = 0,
    t = 0;
  noktalar.forEach((p, i) => {
    const w = agirlik ? agirlik[i] : 1;
    x += p[0] * w;
    y += p[1] * w;
    t += w;
  });
  return t > 0 ? [x / t, y / t] : [0, 0];
}

// Birleşik geometride en büyük kara gövdesinin iç çember çapı (km).
function icCemberKm(grup, ortLat) {
  let birlesik = null;
  for (const d of grup) {
    const f = turf.feature(d.geom);
    try {
      birlesik = birlesik ? turf.union(turf.featureCollection([birlesik, f])) : f;
    } catch (e) {
      if (!birlesik) birlesik = f;
    }
  }
  if (!birlesik) return 0;
  const g = birlesik.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  let en = 0;
  for (const poly of polys) {
    const halka = poly[0].map((c) => kmNokta(c, ortLat));
    let alan = 0;
    for (let i = 0, n = halka.length, j = n - 1; i < n; j = i++)
      alan += halka[j][0] * halka[i][1] - halka[i][0] * halka[j][1];
    if (Math.abs(alan / 2) < 30) continue; // küçük adalar rozet taşımaz
    const nk = polylabel([halka], 0.3);
    if (nk.distance * 2 > en) en = nk.distance * 2;
  }
  return en;
}

// Küme kara olarak bütün mü?
// ADALAR MUAF: hiçbir kara komşusu olmayan ilçe (Adalar, Bozcaada, Gökçeada) bütünlüğü
// bozmuş sayılmaz — tasarım belgesi zaten "adalar bağlı oldukları kara parçasının içindedir"
// diyor. Bu muafiyet olmadan İstanbul, Çanakkale ve Balıkesir'in HİÇBİR bölümlemesi
// kabul edilmiyordu.
function bagliMi(idx, komsu) {
  const karada = idx.filter((i) => komsu[i].length > 0);
  if (karada.length <= 1) return true;
  const kume = new Set(karada),
    gor = new Set([karada[0]]),
    yig = [karada[0]];
  while (yig.length) {
    const x = yig.pop();
    for (const y of komsu[x]) if (kume.has(y) && !gor.has(y)) (gor.add(y), yig.push(y));
  }
  return gor.size === karada.length;
}

// ---- il il işle ----
const ilKodlari = [...new Set(ilceler.map((d) => d.kod))].sort();
const sonuc = {};
const rapor = [];

for (const kod of ilKodlari) {
  if (TEK_IL && kod !== TEK_IL) continue;
  const D = ilceler.filter((d) => d.kod === kod);
  const ortLat = D.reduce((a, d) => a + d.pt[1], 0) / D.length;
  const nokta = D.map((d) => kmNokta(d.pt, ortLat));
  const payN = D.map((d) => d.payN || 0);
  const payE = D.map((d) => d.payE || 0);
  const toplamN = payN.reduce((a, b) => a + b, 0) || 1;

  // komşuluk
  const feats = D.map((d) => turf.feature(d.geom));
  const bboxlar = feats.map((f) => turf.bbox(f));
  const komsu = D.map(() => []);
  for (let i = 0; i < D.length; i++)
    for (let j = i + 1; j < D.length; j++) {
      const a = bboxlar[i],
        b = bboxlar[j];
      if (a[0] > b[2] + 0.02 || b[0] > a[2] + 0.02 || a[1] > b[3] + 0.02 || b[1] > a[3] + 0.02)
        continue;
      let kesisir = false;
      try {
        kesisir = turf.booleanIntersects(feats[i], feats[j]);
      } catch (e) {
        kesisir = false;
      }
      if (kesisir) {
        komsu[i].push(j);
        komsu[j].push(i);
      }
    }

  // kara gövdeleri (bağlantılı bileşenler) — kümeler bunları aşamaz
  const bilesen = new Array(D.length).fill(-1);
  let bSay = 0;
  for (let i = 0; i < D.length; i++) {
    if (bilesen[i] !== -1) continue;
    const yig = [i];
    bilesen[i] = bSay;
    while (yig.length) {
      const x = yig.pop();
      for (const y of komsu[x])
        if (bilesen[y] === -1) {
          bilesen[y] = bSay;
          yig.push(y);
        }
    }
    bSay++;
  }

  // arazi dağılımı (ekonomi payına göre) — üçe yakın eşitse arazi birincil ölçüt olur
  const araziPay = { ova: 0, tepelik: 0, daglik: 0 };
  D.forEach((d, i) => (araziPay[d.arazi] = (araziPay[d.arazi] || 0) + payE[i]));
  const araziToplam = Object.values(araziPay).reduce((a, b) => a + b, 0) || 1;
  const araziOran = {};
  ARAZILER.forEach((a) => (araziOran[a] = (araziPay[a] || 0) / araziToplam));
  const araziBirincil = ARAZILER.filter((a) => araziOran[a] >= DENGESIZ_ARAZI).length >= 3;

  // ---- bir kümelemeyi değerlendir ----
  function degerlendir(atama, K) {
    const gruplar = [];
    for (let k = 0; k < K; k++) {
      const idx = [];
      atama.forEach((a, i) => a === k && idx.push(i));
      if (idx.length === 0) return null;
      if (!bagliMi(idx, komsu)) return null;
      gruplar.push(idx);
    }
    const olcum = gruplar.map((idx) => {
      const pN = idx.reduce((a, i) => a + payN[i], 0) / toplamN;
      const merkez = ortalama(
        idx.map((i) => nokta[i]),
        idx.map((i) => Math.max(payN[i], 0.001))
      );
      const yayilim = idx.reduce((a, i) => a + uzaklik(nokta[i], merkez), 0) / idx.length;
      const araziler = {};
      idx.forEach((i) => (araziler[D[i].arazi] = (araziler[D[i].arazi] || 0) + payE[i]));
      const baskin = Object.keys(araziler).sort((a, b) => araziler[b] - araziler[a])[0];
      const araziSaflik = (araziler[baskin] || 0) / (idx.reduce((a, i) => a + payE[i], 0) || 1);
      return { idx, pay: pN, yayilim, baskin, araziSaflik };
    });
    const enKucukPay = Math.min(...olcum.map((o) => o.pay));
    const yayilimToplam = olcum.reduce((a, o) => a + o.yayilim, 0) / K;
    const araziCeza = araziBirincil ? olcum.reduce((a, o) => a + (1 - o.araziSaflik), 0) / K : 0;

    // BÜTÜNLÜK CEZASI: bugünkü parçalar elle, yerel bilgiyle çizildi (kent merkezi,
    // ova, yayla gibi anlamlı bütünler). Bir eski parçanın ilçeleri farklı kümelere
    // dağılıyorsa ceza al — yeni bölümleme mümkün olduğunca o bütünleri korusun.
    // (Kayseri'de kent merkezinin ikiye bölünmesini engelleyen kural budur.)
    const eskiParcalar = {};
    D.forEach((d, i) => {
      const a = d.eskiAd;
      eskiParcalar[a] = eskiParcalar[a] || { toplam: 0, kume: {} };
      eskiParcalar[a].toplam += payN[i];
      const k = atama[i];
      eskiParcalar[a].kume[k] = (eskiParcalar[a].kume[k] || 0) + payN[i];
    });
    let butunlukCeza = 0,
      eskiSay = 0;
    for (const a of Object.keys(eskiParcalar)) {
      const e = eskiParcalar[a];
      if (e.toplam <= 0) continue;
      const enBuyuk = Math.max(...Object.values(e.kume));
      butunlukCeza += 1 - enBuyuk / e.toplam;
      eskiSay++;
    }
    butunlukCeza = eskiSay ? butunlukCeza / eskiSay : 0;

    // amaç: tıknaz (yayılım düşük) + dengeli pay + eski bütünleri koru + (gerekirse) arazi
    const payCeza = Math.max(0, HEDEF_MIN_PAY - enKucukPay) * 300;
    const maliyet = yayilimToplam + payCeza + butunlukCeza * 90 + araziCeza * 120;
    return { gruplar: olcum, enKucukPay, maliyet };
  }

  // ---- tohumlardan bölge büyütme ----
  function kumele(K, tohumlar) {
    const atama = new Array(D.length).fill(-1);
    tohumlar.forEach((t, k) => (atama[t] = k));
    const hedefPay = 1 / K;
    const kumePay = new Array(K).fill(0);
    tohumlar.forEach((t, k) => (kumePay[k] = payN[t] / toplamN));
    const kumeMerkez = tohumlar.map((t) => nokta[t].slice());
    let kalan = D.length - K;
    while (kalan > 0) {
      let enIyi = null;
      for (let k = 0; k < K; k++) {
        for (let i = 0; i < D.length; i++) {
          if (atama[i] !== k) continue;
          for (const j of komsu[i]) {
            if (atama[j] !== -1) continue;
            // payı geride kalan kümeye öncelik ver
            const acgozluluk = (hedefPay - kumePay[k]) * 40;
            const skor = uzaklik(nokta[j], kumeMerkez[k]) - acgozluluk;
            if (!enIyi || skor < enIyi.skor) enIyi = { j, k, skor };
          }
        }
      }
      if (!enIyi) break; // kalan ilçeler hiçbir kümeye komşu değil (ayrı kara gövdesi)
      atama[enIyi.j] = enIyi.k;
      kumePay[enIyi.k] += payN[enIyi.j] / toplamN;
      const idx = [];
      atama.forEach((a, i) => a === enIyi.k && idx.push(i));
      kumeMerkez[enIyi.k] = ortalama(
        idx.map((i) => nokta[i]),
        idx.map((i) => Math.max(payN[i], 0.001))
      );
      kalan--;
    }
    // ulaşılamayan ilçeler (ayrı kara gövdesi): en yakın kümeye ver
    for (let i = 0; i < D.length; i++)
      if (atama[i] === -1) {
        let en = 0,
          enU = Infinity;
        for (let k = 0; k < K; k++) {
          const u = uzaklik(nokta[i], kumeMerkez[k]);
          if (u < enU) {
            enU = u;
            en = k;
          }
        }
        atama[i] = en;
      }
    return atama;
  }

  // sınır ilçelerini komşu kümeye taşıyarak iyileştir
  function iyilestir(atama, K) {
    let mevcut = degerlendir(atama, K);
    if (!mevcut) return { atama, olcum: null };
    let gelisme = true,
      tur = 0;
    while (gelisme && tur++ < 8) {
      gelisme = false;
      for (let i = 0; i < D.length; i++) {
        const eski = atama[i];
        const adaylar = [...new Set(komsu[i].map((j) => atama[j]))].filter((k) => k !== eski);
        for (const yeni of adaylar) {
          atama[i] = yeni;
          const d = degerlendir(atama, K);
          if (d && d.maliyet < mevcut.maliyet - 1e-9) {
            mevcut = d;
            gelisme = true;
          } else atama[i] = eski;
        }
      }
    }
    return { atama, olcum: mevcut };
  }

  // ---- K seç ----
  // Kural: parça sayısı ARTMAZ, gerekiyorsa azalır. Baki'nin gerekçesi: "1–4 arası daha az
  // yük ve daha çok okunabilirlik". Bugünkü bölümleme yerel bilgiyle çizildi; yeni ölçütler
  // onu ancak okunabilirlik bozuksa değiştirmeli.
  const mevcutK = new Set(D.map((d) => d.eskiParca)).size;
  let secilen = null,
    idealSec = null,
    yumusakSec = null,
    tekSec = null;
  // Bugünkü bölümlemenin ilçe -> küme atamasını çıkar (0'dan başlayan sıra numarasıyla).
  // Bu, kümelemeye BAŞLANGIÇ ADAYI olarak verilir: böylece sonuç hiçbir zaman bugünkünden
  // kötü olamaz. (Trabzon/Ordu gibi uzun kıyı illerinde taze tohumlar doğu-batı bölüyordu;
  // bugünkü kıyı-iç ayrımı daha iyi ve artık aday listesinde.)
  const eskiNolar = [...new Set(D.map((d) => d.eskiParca))].sort((a, b) => a - b);
  const bugunkuAtama = D.map((d) => eskiNolar.indexOf(d.eskiParca));

  // Korunan iller: yeniden bölme, bugünkü hâli aynen al.
  if (KORUNAN[kod]) {
    const olcum = degerlendir(bugunkuAtama.slice(), eskiNolar.length);
    if (olcum)
      secilen = {
        K: eskiNolar.length,
        atama: bugunkuAtama.slice(),
        olcum,
        caplar: olcum.gruplar.map((g) =>
          icCemberKm(
            g.idx.map((i) => D[i]),
            ortLat
          )
        ),
        korunan: true,
      };
  }

  for (let K = Math.min(MAX_PARCA, D.length, mevcutK); K >= 1 && !secilen; K--) {
    // Bu K için tüm adaylar toplanır; seçim EN SONDA iç çembere göre yapılır.
    // (İyileştirme adımı "yayılım"ı düşürür ama iç çemberi bozabiliyordu: Malatya'da
    // bugünkü iyi bölümleme 7.2 birimlik ince bir parçaya dönüşüyordu.)
    const adaylar = [];
    if (K === eskiNolar.length) {
      const ham = degerlendir(bugunkuAtama.slice(), K);
      if (ham) adaylar.push({ atama: bugunkuAtama.slice(), olcum: ham }); // bugünkü hâl, dokunulmamış
      const gelismis = iyilestir(bugunkuAtama.slice(), K);
      if (gelismis.olcum) adaylar.push({ atama: gelismis.atama.slice(), olcum: gelismis.olcum });
    }
    let enIyi = null;
    for (let deneme = 0; deneme < (K === 1 ? 1 : DENEME); deneme++) {
      // tohumlar: birbirine en uzak ilçeler (ilk tohum denemeye göre değişir)
      const tohumlar = [deneme % D.length];
      while (tohumlar.length < K) {
        let en = -1,
          enU = -1;
        for (let i = 0; i < D.length; i++) {
          if (tohumlar.includes(i)) continue;
          const u = Math.min(...tohumlar.map((t) => uzaklik(nokta[i], nokta[t])));
          if (u > enU) {
            enU = u;
            en = i;
          }
        }
        tohumlar.push(en);
      }
      const { atama, olcum } = iyilestir(kumele(K, tohumlar), K);
      if (olcum && (!enIyi || olcum.maliyet < enIyi.olcum.maliyet))
        enIyi = { atama: atama.slice(), olcum };
    }
    if (enIyi) adaylar.push(enIyi);
    if (adaylar.length === 0) continue;

    // En düşük maliyetli 4 adayın iç çemberini ölç (ölçüm pahalı, hepsini ölçmeyelim),
    // sonra "en küçük parçası en büyük olan" adayı seç — asıl ölçüt okunabilirlik.
    adaylar.sort((a, b) => a.olcum.maliyet - b.olcum.maliyet);
    let secim = null;
    for (const a of adaylar.slice(0, 4)) {
      const caplar = a.olcum.gruplar.map((g) =>
        icCemberKm(
          g.idx.map((i) => D[i]),
          ortLat
        )
      );
      const enKucukCap = Math.min(...caplar);
      if (!secim || enKucukCap > secim.enKucukCap) secim = { ...a, caplar, enKucukCap };
    }
    enIyi = secim;

    // ölçütler: her parça rozet taşıyabilsin + ölü parça olmasın
    const caplar = enIyi.caplar;
    const payTamam = enIyi.olcum.enKucukPay >= ALT_SINIR_PAY;
    const aday = { K, ...enIyi, caplar };
    if (TEK_IL)
      console.log(
        '\n  K=' +
          K +
          ' → iç çemberler: ' +
          caplar.map((c) => (c / KM_PER_BIRIM).toFixed(1)).join(', ') +
          ' birim | en küçük pay: ' +
          enIyi.olcum.enKucukPay.toFixed(2) +
          ' | ideal(≥14.25): ' +
          (caplar.every((c) => c >= ESIK_KM) ? 'EVET' : 'hayır') +
          ' | yumuşak(≥11): ' +
          (caplar.every((c) => c >= YUMUSAK_KM) ? 'EVET' : 'hayır')
      );
    if (caplar.every((c) => c >= ESIK_KM) && payTamam && !idealSec) idealSec = aday;
    if (caplar.every((c) => c >= YUMUSAK_KM) && payTamam && !yumusakSec) yumusakSec = aday;
    // Son çare: hiçbir eşiği tutturamayan iller için en büyük GEÇERLİ bölümleme.
    // Çanakkale gibi iki ayrı kara gövdesi olan illerde "tek parça" seçeneği geometrik
    // olarak imkânsız (Gelibolu boğazın karşı yakasında) — bu iller yine de bölünmeli.
    if (!tekSec) tekSec = aday;
  }

  // SEÇİM: yumuşak tabanı geçen EN BÜYÜK K. Gerekçe: Baki parça sayısının düşmesine
  // (Hatay/Ordu/Kocaeli 1 parça, Ankara 3 parça) itiraz etti; kabul ettiği istisnalar
  // 12–13 birim aralığında. Yani "biraz küçük parça" > "ilin yapısını kaybetmek".
  // İdeal eşiği tutturamayan parçalar raporda ayrıca işaretlenir.
  if (!secilen) secilen = yumusakSec || idealSec || tekSec; // korunan illerde zaten dolu
  if (secilen) secilen.yumusak = secilen.caplar.some((c) => c < ESIK_KM);

  if (!secilen) continue;

  // ---- adlandırma ----
  const ilAd = kanonik[kod].ad;
  const merkezIdx = D.findIndex((d) => d.merkez || d.n === (kanonik[kod].ad || '').toLowerCase());
  const ilMerkezi = ortalama(nokta);
  const parcalar = secilen.olcum.gruplar.map((g, k) => {
    // eski parça adını devral: kümenin payının çoğu tek bir eski parçadan geliyorsa
    const eskiPay = {};
    g.idx.forEach((i) => {
      const a = D[i].eskiAd;
      eskiPay[a] = (eskiPay[a] || 0) + payN[i];
    });
    const enEski = Object.keys(eskiPay).sort((a, b) => eskiPay[b] - eskiPay[a])[0];
    const oran = eskiPay[enEski] / (g.idx.reduce((a, i) => a + payN[i], 0) || 1);

    // Eski adı devralmadan önce: ad, artık bu parçada OLMAYAN bir ilçeye atıfta
    // bulunuyorsa yanıltıcıdır ("Kozan-Pozantı" içinde Kozan yoksa) → yön adı kullanılır.
    const sadeleştir = (s) =>
      String(s)
        .toLocaleLowerCase('tr-TR')
        .replace(/[^a-zçğıöşü]/g, '');
    const bendekiIlceler = new Set(g.idx.map((i) => sadeleştir(D[i].ad)));
    const ayrilanlar = D.filter((d, i) => d.eskiAd === enEski && !g.idx.includes(i)).map((d) =>
      sadeleştir(d.ad)
    );
    const adParcalari = String(enEski)
      .split(/[\s\-–—]+/)
      .map(sadeleştir)
      .filter((t) => t.length > 3);
    const adYaniltici = adParcalari.some((t) => ayrilanlar.includes(t) && !bendekiIlceler.has(t));

    let ad;
    if (oran >= 0.6 && enEski && enEski !== '(tabloda yok)' && !adYaniltici) ad = enEski;
    else if (merkezIdx >= 0 && g.idx.includes(merkezIdx)) ad = ilAd + ' Merkez';
    else {
      const m = ortalama(g.idx.map((i) => nokta[i]));
      const dx = m[0] - ilMerkezi[0],
        dy = m[1] - ilMerkezi[1];
      ad =
        ilAd +
        ' ' +
        (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'Doğu' : 'Batı') : dy > 0 ? 'Kuzey' : 'Güney');
    }
    return {
      no: k + 1,
      ad,
      yonAd:
        ilAd +
        ' ' +
        (() => {
          const m = ortalama(g.idx.map((i) => nokta[i]));
          const dx = m[0] - ilMerkezi[0],
            dy = m[1] - ilMerkezi[1];
          return Math.abs(dx) > Math.abs(dy)
            ? dx > 0
              ? 'Doğu'
              : 'Batı'
            : dy > 0
              ? 'Kuzey'
              : 'Güney';
        })(),
      idx: g.idx,
      ilceler: g.idx.map((i) => D[i].ad),
      arazi: g.baskin,
      nufus: +g.idx.reduce((a, i) => a + payN[i], 0).toFixed(3),
      ekonomi: +g.idx.reduce((a, i) => a + payE[i], 0).toFixed(3),
      cap: secilen.caplar[k],
    };
  });

  // elle verilen adlar (otomatik adlandırmanın anlamsız kaldığı yerler)
  parcalar.forEach((p) => {
    const el = ELLE_AD[kod + '-' + p.no];
    if (el) p.ad = el;
  });

  // adlar il içinde BENZERSİZ olmalı — aynı ada düşen ikinci parça yön adını alır
  const gorulen = new Set();
  parcalar.forEach((p) => {
    if (!gorulen.has(p.ad)) return gorulen.add(p.ad);
    p.ad = gorulen.has(p.yonAd) ? p.ad + ' ' + p.no : p.yonAd;
    gorulen.add(p.ad);
  });

  // payları normalle (toplam tam 1.00)
  ['nufus', 'ekonomi'].forEach((alan) => {
    const t = parcalar.reduce((a, p) => a + p[alan], 0);
    parcalar.forEach((p) => (p[alan] = +(p[alan] / t).toFixed(2)));
    const fark = +(1 - parcalar.reduce((a, p) => a + p[alan], 0)).toFixed(2);
    if (Math.abs(fark) >= 0.01) {
      const en = parcalar.reduce((a, b) => (a[alan] > b[alan] ? a : b));
      en[alan] = +(en[alan] + fark).toFixed(2);
    }
  });

  sonuc[kod] = { kod, ad: ilAd, K: secilen.K, parcalar, araziBirincil, bilesenSayisi: bSay };
  const eskiK = new Set(D.map((d) => d.eskiParca)).size;
  rapor.push({
    kod,
    ad: ilAd,
    eskiK,
    yeniK: secilen.K,
    minCap: Math.min(...secilen.caplar),
    minPay: Math.min(...parcalar.map((p) => p.nufus)),
    araziBirincil,
  });
  process.stdout.write('.');
}

console.log('\n');
console.log('kod  il             eski→yeni  en küçük iç çember  en küçük pay  arazi-birincil');
for (const r of rapor.sort((a, b) => a.kod.localeCompare(b.kod)))
  console.log(
    '  ' +
      r.kod +
      '  ' +
      r.ad.padEnd(14) +
      (r.eskiK + '→' + r.yeniK).padEnd(11) +
      (r.minCap / KM_PER_BIRIM).toFixed(1).padStart(8) +
      ' birim' +
      String(r.minPay).padStart(12) +
      '        ' +
      (r.araziBirincil ? 'EVET' : '')
  );

const toplamYeni = rapor.reduce((a, r) => a + r.yeniK, 0);
const toplamEski = rapor.reduce((a, r) => a + r.eskiK, 0);
console.log('\nTOPLAM PARÇA: ' + toplamEski + ' → ' + toplamYeni);
console.log(
  'Dağılım: ' +
    [1, 2, 3, 4]
      .map((k) => k + ' parça: ' + rapor.filter((r) => r.yeniK === k).length + ' il')
      .join(' | ')
);

fs.writeFileSync(
  path.join(PROJ, 'veri/ham/parca-tablo-yeni.json'),
  JSON.stringify(
    Object.values(sonuc).flatMap((il) =>
      il.parcalar.map((p) => ({
        kod: il.kod,
        ilAd: il.ad,
        parcaNo: p.no,
        parcaAd: p.ad,
        ilceler: p.ilceler,
        arazi: p.arazi,
        nufus: p.nufus,
        ekonomi: p.ekonomi,
      }))
    ),
    null,
    1
  ),
  'utf8'
);
console.log('\nveri/ham/parca-tablo-yeni.json yazıldı (ADAY — asıl tablo değişmedi).');
