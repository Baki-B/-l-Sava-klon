// VERİ DOĞRULAYICI
// veri/ klasöründeki JSON dosyalarının tutarlılığını denetler.
// Amaç: bir kod/sayı/komşuluk bozulursa OYUN AÇILMADAN, burada yakalansın.
// Çalıştırma:  node scripts/veri-dogrula.js   (ya da:  npm run kontrol)
// Çıktı Türkçedir. Hata varsa çıkış kodu 1 olur (kontrol.js bunu kullanır).

const fs = require('fs');
const path = require('path');

const VERI = path.join(__dirname, '..', 'veri');

let hata = 0;
let uyari = 0;
const H = (m) => {
  hata++;
  console.log('  ✗ HATA: ' + m);
};
const U = (m) => {
  uyari++;
  console.log('  ⚠ uyari: ' + m);
};
const OK = (m) => console.log('  ✓ ' + m);
const baslik = (m) => console.log('\n=== ' + m + ' ===');
const bilgi = (m) => console.log('  … ' + m);

// En fazla N hatayı yaz, gerisini say (ekranı boğmasın).
function limitli(sayac, sinir, m) {
  if (sayac < sinir) H(m);
  else if (sayac === sinir)
    H('... (aynı türden daha fazla hata var, ilk ' + sinir + ' tanesi gösterildi)');
}

function oku(dosya) {
  const p = path.join(VERI, dosya);
  if (!fs.existsSync(p)) return null; // dosya yok
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    H(dosya + ' bozuk JSON: ' + e.message);
    return undefined; // var ama okunamadı
  }
}

// ---- Beklenen sabitler ----
const ARAZI = ['ova', 'tepelik', 'daglik'];
const BOLGELER = [
  'Marmara',
  'Ege',
  'Karadeniz',
  'İç Anadolu',
  'Akdeniz',
  'Güneydoğu Anadolu',
  'Doğu Anadolu',
];
const IL_KODLARI = Array.from({ length: 81 }, (_, i) => String(i + 1).padStart(2, '0'));
// Altyapı statı 2026-07-25'te kaldırıldı (tasarım §5 / Görev 03 Karar 3).
const STAT_ALANLARI = ['nufus', 'ekonomi', 'egitim', 'sanayi', 'moral'];

// Görev tanımı §5'teki elle kontrol örnekleri (il kodu -> beklenen komşu il kodları).
const IL_KOMSU_ORNEK = {
  77: { ad: 'Yalova', komsu: ['16', '41'] }, // Bursa, Kocaeli
  // Kilis'in tek kara komşusu Gaziantep. Görev tanımı §5 "Hatay"ı da sayıyordu ama ham
  // veri bunu doğrulamıyor: aralarında 3.69 km boşluk var, araya Gaziantep giriyor.
  // Görev 03B / Adım 0'da ölçüldü, Baki onayıyla düzeltildi (2026-07-26).
  79: { ad: 'Kilis', komsu: ['27'] }, // Gaziantep
  74: { ad: 'Bartın', komsu: ['67', '78', '37'] }, // Zonguldak, Karabük, Kastamonu
  53: { ad: 'Rize', komsu: ['61', '69', '25', '08'] }, // Trabzon, Bayburt, Erzurum, Artvin
  34: { ad: 'İstanbul', komsu: ['59', '39', '41'] }, // Tekirdağ, Kırklareli, Kocaeli
  57: { ad: 'Sinop', komsu: ['37', '19', '55'] }, // Kastamonu, Çorum, Samsun
};

// Dosyalar arası paylaşılacak veriler.
let parcaIdSet = null; // parcalar.json'daki geçerli parça id kümesi
let ilParcaSayim = null; // {ilKodu: parça adedi}
let ilKomsuluk = null; // komsuluk.json — husumet denetimi komşuluğa bakıyor
let ilAdlari = null; // {ilKodu: ad} — hata mesajları kod yerine ad yazabilsin

// ============================================================
// 1) parcalar.json
// ============================================================
function dogrulaParcalar() {
  baslik('parcalar.json — parça geometrisi + il tanımları');
  const pc = oku('parcalar.json');
  if (pc === null) return H('parcalar.json bulunamadı (temel dosya, olmak zorunda).');
  if (pc === undefined) return;

  const P = pc.parcalar || {};
  const I = pc.iller || {};
  const meta = pc.meta || {};

  const n = Object.keys(P).length;
  if (meta.parcaSayisi === n) OK('parça sayısı ' + n + ' (meta ile uyumlu)');
  else H('parça sayısı ' + n + ' ama meta.parcaSayisi = ' + meta.parcaSayisi);

  const ilK = Object.keys(I);
  if (ilK.length === 81) OK('81 il tanımı var');
  else H('il tanımı ' + ilK.length + ' adet, 81 olmalı');
  const eksikIl = IL_KODLARI.filter((k) => !I[k]);
  if (eksikIl.length) H('eksik il kodları: ' + eksikIl.join(', '));
  else OK('il kodları 01–81 eksiksiz');

  // ---- MERKEZ PARÇA (Görev 17) ----
  // Her ilin TAM BİR merkezi olmalı. Merkez `merkez-parca-uret.js` ile veriden türetiliyor;
  // bu denetim onu koda yazılmış bir liste gibi davranmaktan koruyor: harita yeniden
  // bölünürse ve betik koşturulmazsa burada gürültüyle yakalanır, oyunda sessizce değil.
  const merkezSayaci = {};
  for (const pid of Object.keys(P)) {
    if (P[pid].merkez === true) merkezSayaci[P[pid].kod] = (merkezSayaci[P[pid].kod] || 0) + 1;
  }
  const merkezsiz = IL_KODLARI.filter((k) => !merkezSayaci[k]);
  const cokMerkezli = IL_KODLARI.filter((k) => merkezSayaci[k] > 1);
  if (merkezsiz.length)
    H(
      merkezsiz.length +
        ' ilin merkez parçası yok (' +
        merkezsiz.slice(0, 6).join(', ') +
        '). `node scripts/merkez-parca-uret.js` koşturulmalı.'
    );
  else if (cokMerkezli.length)
    H(cokMerkezli.length + ' ilde birden çok merkez parça: ' + cokMerkezli.slice(0, 6).join(', '));
  else OK('81 ilin her birinde tam bir merkez parça var');

  const gerekli = ['kod', 'il', 'bolge', 'no', 'ad', 'arazi', 'nufus', 'ekonomi', 'yol'];
  const ilPayN = {},
    ilPayE = {},
    ilSay = {};
  let cAlan = 0,
    cKod = 0,
    cArazi = 0,
    cBolge = 0,
    cPay = 0,
    cYol = 0,
    cAd = 0,
    cId = 0;
  parcaIdSet = new Set(Object.keys(P));

  for (const id of Object.keys(P)) {
    const p = P[id];
    for (const g of gerekli)
      if (p[g] === undefined) limitli(cAlan++, 5, 'parça ' + id + ": '" + g + "' alanı yok");

    const onEk = String(id).split('-')[0];
    if (onEk !== p.kod)
      limitli(
        cId++,
        5,
        'parça ' + id + ": id öneki '" + onEk + "' ile kod '" + p.kod + "' uyuşmuyor"
      );
    if (!IL_KODLARI.includes(p.kod))
      limitli(cKod++, 5, 'parça ' + id + ": geçersiz il kodu '" + p.kod + "'");
    if (!ARAZI.includes(p.arazi))
      limitli(cArazi++, 5, 'parça ' + id + ": geçersiz arazi '" + p.arazi + "'");
    if (!BOLGELER.includes(p.bolge))
      limitli(cBolge++, 5, 'parça ' + id + ": geçersiz bölge '" + p.bolge + "'");
    if (typeof p.nufus !== 'number' || p.nufus < 0 || p.nufus > 1)
      limitli(cPay++, 5, 'parça ' + id + ': nüfus payı aralık dışı (' + p.nufus + ')');
    if (typeof p.ekonomi !== 'number' || p.ekonomi < 0 || p.ekonomi > 1)
      limitli(cPay++, 5, 'parça ' + id + ': ekonomi payı aralık dışı (' + p.ekonomi + ')');
    if (typeof p.yol !== 'string' || !p.yol.trim().startsWith('M') || /NaN|undefined/.test(p.yol))
      limitli(cYol++, 5, 'parça ' + id + ": çizim yolu ('yol') geçersiz");
    if (I[p.kod] && I[p.kod].ad !== p.il)
      limitli(
        cAd++,
        5,
        'parça ' +
          id +
          ": il adı '" +
          p.il +
          "' ama iller['" +
          p.kod +
          "'].ad = '" +
          I[p.kod].ad +
          "'"
      );

    ilPayN[p.kod] = (ilPayN[p.kod] || 0) + (typeof p.nufus === 'number' ? p.nufus : 0);
    ilPayE[p.kod] = (ilPayE[p.kod] || 0) + (typeof p.ekonomi === 'number' ? p.ekonomi : 0);
    ilSay[p.kod] = (ilSay[p.kod] || 0) + 1;
  }
  ilParcaSayim = ilSay;

  if (!cArazi) OK('tüm arazi değerleri geçerli (ova / tepelik / daglik)');
  if (!cBolge) OK('tüm bölge değerleri geçerli (7 bölge)');
  if (!cYol) OK('tüm parçaların çizim yolu geçerli (M ile başlıyor, NaN yok)');
  if (!cAd) OK('parça il adları, il tanımlarıyla tutarlı');

  let payHata = 0;
  for (const k of Object.keys(ilPayN)) {
    if (Math.abs(ilPayN[k] - 1) > 0.01)
      limitli(
        payHata++,
        8,
        'il ' + k + ': nüfus payları toplamı ' + ilPayN[k].toFixed(3) + ' (1.0 olmalı)'
      );
    if (Math.abs(ilPayE[k] - 1) > 0.01)
      limitli(
        payHata++,
        8,
        'il ' + k + ': ekonomi payları toplamı ' + ilPayE[k].toFixed(3) + ' (1.0 olmalı)'
      );
  }
  if (!payHata)
    OK('her ilin parça payları toplamı 1.0 (nüfus + ekonomi) — "il statı × pay" formülü sağlam');

  for (const k of Object.keys(ilSay)) {
    if (ilSay[k] < 1 || ilSay[k] > 5) U('il ' + k + ': ' + ilSay[k] + ' parça (beklenen 1–5)');
  }
}

// ============================================================
// 2) parca-komsuluk.json
// ============================================================
function dogrulaParcaKomsuluk() {
  baslik('parca-komsuluk.json — parça komşuluk grafiği');
  const K = oku('parca-komsuluk.json');
  if (K === null) return H('parca-komsuluk.json bulunamadı.');
  if (K === undefined) return;

  const anahtarlar = Object.keys(K);
  OK(anahtarlar.length + ' parça için komşu listesi var');

  let cVar = 0,
    cSelf = 0,
    cDup = 0,
    cSim = 0,
    izole = 0;
  for (const a of anahtarlar) {
    const liste = K[a] || [];
    if (parcaIdSet && !parcaIdSet.has(a))
      limitli(cVar++, 5, "komşuluk anahtarı '" + a + "' parcalar.json'da yok");
    if (liste.length === 0) {
      izole++;
      U("parça '" + a + "' hiç komşusu yok (izole)");
    }
    const gorulen = new Set();
    for (const b of liste) {
      if (b === a) limitli(cSelf++, 5, "parça '" + a + "' kendini komşu göstermiş");
      if (gorulen.has(b))
        limitli(cDup++, 5, "parça '" + a + "' komşu listesinde '" + b + "' tekrar ediyor");
      gorulen.add(b);
      if (parcaIdSet && !parcaIdSet.has(b))
        limitli(cVar++, 5, "parça '" + a + "' var olmayan komşu '" + b + "' gösteriyor");
      const karsi = K[b] || [];
      if (!karsi.includes(a))
        limitli(cSim++, 5, "simetri bozuk: '" + a + "' -> '" + b + "' var ama tersi yok");
    }
  }
  if (!cSelf) OK('kendi kendine komşuluk yok');
  if (!cDup) OK('tekrar eden komşu yok');
  if (!cSim) OK('simetri tam (A→B ise B→A)');
  if (!cVar) OK('tüm komşu referansları geçerli parçalara işaret ediyor');
  if (!izole) OK('izole (komşusuz) parça yok');
}

// ============================================================
// 3) harita.json (81 il geometrisi)
// ============================================================
function dogrulaHarita() {
  baslik('harita.json — 81 il geometrisi');
  const har = oku('harita.json');
  if (har === null) return U('harita.json bulunamadı (uzak-zoom il gösterimi için gerekli).');
  if (har === undefined) return;

  const I = har.iller || {};
  const k = Object.keys(I);
  if (k.length === 81) OK('81 il çizimi var');
  else H('harita.json ' + k.length + ' il içeriyor, 81 olmalı');
  const eksik = IL_KODLARI.filter((c) => !I[c]);
  if (eksik.length) H('eksik il kodları: ' + eksik.join(', '));
  else OK('il kodları 01–81 eksiksiz');
  let cYol = 0;
  for (const c of k) {
    if (!I[c].yol || typeof I[c].yol !== 'string')
      limitli(cYol++, 5, 'il ' + c + ': çizim yolu yok/geçersiz');
  }
  if (!cYol && k.length) OK('tüm illerin çizim yolu geçerli');
}

// ============================================================
// 4) iller.json (Görev 02 çıktısı — 7 stat: 5 sayısal + arazi + parça sayısı)
// ============================================================
function dogrulaIller() {
  baslik('iller.json — 81 il, 7 stat (altyapı kaldırıldı — tasarım §5)');
  const il = oku('iller.json');
  if (il === null) return bilgi('henüz üretilmedi (Görev 02 Adım 4). Bu şu an NORMAL.');
  if (il === undefined) return;

  const k = Object.keys(il);
  if (k.length === 81) OK('81 il var');
  else H('iller.json ' + k.length + ' il içeriyor, 81 olmalı');
  const eksik = IL_KODLARI.filter((c) => !il[c]);
  if (eksik.length) H('eksik il kodları: ' + eksik.join(', '));
  else OK('il kodları 01–81 eksiksiz');

  ilAdlari = {};
  for (const c of k) if (il[c] && il[c].ad) ilAdlari[c] = il[c].ad;

  let cAd = 0,
    cStat = 0,
    cArazi = 0,
    cParca = 0;
  let toplamParca = 0;
  for (const c of k) {
    const o = il[c] || {};
    if (o.kod !== c)
      limitli(cAd++, 5, 'il ' + c + ": içteki kod '" + o.kod + "' anahtarla uyuşmuyor");
    if (!ARAZI.includes(o.arazi))
      limitli(cArazi++, 5, 'il ' + c + ": geçersiz arazi '" + o.arazi + "'");
    if (!BOLGELER.includes(o.bolge))
      limitli(cAd++, 5, 'il ' + c + ": geçersiz bölge '" + o.bolge + "'");
    if (typeof o.parcaSayisi !== 'number' || o.parcaSayisi < 1 || o.parcaSayisi > 5)
      limitli(cParca++, 5, 'il ' + c + ': parçaSayisi ' + o.parcaSayisi + ' (1–5 olmalı)');
    else toplamParca += o.parcaSayisi;

    const s = o.statlar || {};
    for (const alan of STAT_ALANLARI) {
      const v = s[alan];
      if (!Number.isInteger(v) || v < 1 || v > 10)
        limitli(cStat++, 8, 'il ' + c + ": stat '" + alan + "' = " + v + ' (1–10 tam sayı olmalı)');
    }
    // Kaldırılmış stat artığı kalmasın (ör. 'altyapi' — §5, Görev 03 Karar 3).
    for (const alan of Object.keys(s))
      if (!STAT_ALANLARI.includes(alan))
        limitli(cStat++, 8, 'il ' + c + ": tanınmayan stat alanı '" + alan + "' (kaldırılmalı)");
    // il adı/bölgesi parça verisiyle tutarlı mı (parça sayısı da)
    if (ilParcaSayim && ilParcaSayim[c] !== undefined && o.parcaSayisi !== ilParcaSayim[c]) {
      limitli(
        cParca++,
        5,
        'il ' +
          c +
          ': parcaSayisi ' +
          o.parcaSayisi +
          ' ama parcalar.json ' +
          ilParcaSayim[c] +
          ' parça içeriyor'
      );
    }
  }
  if (!cArazi && k.length) OK('tüm arazi değerleri geçerli');
  if (!cStat && k.length) OK('tüm statlar 1–10 tam sayı');
  if (!cParca && k.length) OK('parçaSayisi değerleri parça verisiyle tutarlı');
  if (ilParcaSayim) {
    const beklenen = Object.values(ilParcaSayim).reduce((a, b) => a + b, 0);
    if (toplamParca === beklenen)
      OK('parçaSayisi toplamı ' + toplamParca + ' (parça verisiyle aynı)');
    else H('parçaSayisi toplamı ' + toplamParca + ' ama parça verisinde ' + beklenen);
  }
}

// ============================================================
// 5) komsuluk.json (Görev 02 çıktısı — il komşuluğu)
// ============================================================
function dogrulaKomsuluk() {
  baslik('komsuluk.json — il komşuluk grafiği (Görev 02 çıktısı)');
  const K = oku('komsuluk.json');
  if (K === null) return bilgi('henüz üretilmedi (Görev 02 Adım 5). Bu şu an NORMAL.');
  if (K === undefined) return;
  ilKomsuluk = K;

  let cSelf = 0,
    cDup = 0,
    cSim = 0,
    cVar = 0,
    izole = 0;
  for (const a of Object.keys(K)) {
    const liste = K[a] || [];
    if (liste.length === 0) {
      izole++;
      H('il ' + a + " hiç komşusu yok (Türkiye'de her ilin kara komşusu var)");
    }
    const gorulen = new Set();
    for (const b of liste) {
      if (b === a) limitli(cSelf++, 5, 'il ' + a + ' kendini komşu göstermiş');
      if (gorulen.has(b)) limitli(cDup++, 5, 'il ' + a + " listesinde '" + b + "' tekrar ediyor");
      gorulen.add(b);
      if (!IL_KODLARI.includes(b))
        limitli(cVar++, 5, 'il ' + a + " geçersiz komşu kodu '" + b + "'");
      if (!(K[b] || []).includes(a))
        limitli(cSim++, 5, 'simetri bozuk: ' + a + ' → ' + b + ' var ama tersi yok');
    }
  }
  if (!cSelf) OK('kendi kendine komşuluk yok');
  if (!cDup) OK('tekrar eden komşu yok');
  if (!cSim) OK('simetri tam');
  if (!izole) OK('komşusuz il yok');

  // §5 elle kontrol örnekleri
  let ornekHata = 0;
  for (const kod of Object.keys(IL_KOMSU_ORNEK)) {
    const { ad, komsu } = IL_KOMSU_ORNEK[kod];
    const eldeki = new Set(K[kod] || []);
    const eksik = komsu.filter((c) => !eldeki.has(c));
    if (eksik.length) {
      ornekHata++;
      H(ad + ' (' + kod + ') beklenen komşuları eksik: ' + eksik.join(', '));
    }
  }
  if (!ornekHata)
    OK(
      "§5 elle kontrol örneklerinin 6'sı da tutuyor (Yalova, Kilis, Bartın, Rize, İstanbul, Sinop)"
    );
}

// ============================================================
// 6) husumetler.js (Görev 08 çıktısı — büyük savaşlar / rekabet olayları)
// ============================================================
// Bu dosyayı BAKİ ELLE DOLDURUYOR (tasarım §11: "yeni rekabet eklemek tek satır"),
// yani kodun hiç görmediği bir yerden veri geliyor. Denetim burada olmak zorunda:
// yanlış yazılmış tek bir il kodu, düellonun oyunun ortasında sessizce tetiklenmemesi
// demek — ve bunu fark etmenin başka yolu yok.
function dogrulaHusumetler() {
  baslik('husumetler.js — büyük savaşlar (tasarım §11)');
  const p = path.join(VERI, 'husumetler.js');
  if (!fs.existsSync(p)) return H('husumetler.js bulunamadı (Görev 08 / Adım 0 dosyası).');

  let H_LISTE;
  try {
    // ESM dosya; Node 22.12+ require ile okuyabiliyor (projede zaten böyle çalışıyoruz).
    H_LISTE = require(p).HUSUMETLER;
  } catch (e) {
    return H('husumetler.js okunamadı (söz dizimi hatası olabilir): ' + e.message);
  }
  if (!Array.isArray(H_LISTE)) return H('husumetler.js HUSUMETLER dizisini dışa vermiyor.');
  if (H_LISTE.length === 0) return U('husumet tablosu boş — hiç kutsal savaş tetiklenmez.');

  const ad = (k) => (ilAdlari && ilAdlari[k] ? ilAdlari[k] + ' (' + k + ')' : k);
  const gorulenCift = new Set();
  const gorulenAd = new Set();
  let cKod = 0,
    cAlan = 0,
    cCift = 0,
    komsuDegil = 0;

  for (let i = 0; i < H_LISTE.length; i++) {
    const h = H_LISTE[i] || {};
    const yer = 'husumet #' + (i + 1);

    for (const alan of ['ilA', 'ilB', 'konu', 'ad']) {
      if (typeof h[alan] !== 'string' || h[alan].trim() === '')
        limitli(cAlan++, 5, yer + ": '" + alan + "' alanı boş ya da metin değil");
    }
    if (!IL_KODLARI.includes(h.ilA)) limitli(cKod++, 5, yer + ": geçersiz il kodu '" + h.ilA + "'");
    if (!IL_KODLARI.includes(h.ilB)) limitli(cKod++, 5, yer + ": geçersiz il kodu '" + h.ilB + "'");
    if (h.ilA === h.ilB)
      limitli(cCift++, 5, yer + ': bir il kendisiyle hasım olamaz (' + h.ilA + ')');

    // Çift yönsüz: A–B ile B–A aynı husumettir, iki kez yazılamaz.
    const anahtar = [h.ilA, h.ilB].sort().join('-');
    if (gorulenCift.has(anahtar))
      limitli(cCift++, 5, yer + ': ' + ad(h.ilA) + ' – ' + ad(h.ilB) + ' çifti tekrar ediyor');
    gorulenCift.add(anahtar);

    // Ad tekrarı: iki farklı çift aynı savaş adını taşırsa tur raporunda hangisi olduğu
    // anlaşılmaz. Adın kendisi kimliktir.
    if (h.ad && gorulenAd.has(h.ad))
      limitli(cCift++, 5, yer + ": '" + h.ad + "' adı başka bir husumette de kullanılmış");
    if (h.ad) gorulenAd.add(h.ad);

    // Komşuluk ZORUNLU DEĞİL ama bilinmeli: komşu olmayan iki il ancak biri ötekine
    // kadar genişleyince karşılaşır, yani düello oyunun geç saatlerine kalır.
    if (ilKomsuluk && IL_KODLARI.includes(h.ilA) && IL_KODLARI.includes(h.ilB)) {
      if (!(ilKomsuluk[h.ilA] || []).includes(h.ilB)) {
        komsuDegil++;
        U(ad(h.ilA) + ' – ' + ad(h.ilB) + ' komşu değil: düello ancak genişleyince tetiklenir');
      }
    }
  }

  OK(H_LISTE.length + ' husumet satırı okundu');
  if (!cAlan) OK('tüm satırlarda ilA / ilB / konu / ad dolu');
  if (!cKod) OK('tüm il kodları geçerli (01–81)');
  if (!cCift) OK('tekrar eden çift ya da savaş adı yok');
  if (!komsuDegil) OK('bütün hasım çiftleri komşu — düellolar oyunun başından tetiklenebilir');
}

// ============================================================
// 6b) liderler.js (Görev 16 / Adım 1 — illerin başındaki isimler)
// ============================================================
// Bu dosyayı da BAKİ ELLE DOLDURUYOR. Yanlış ya da eksik bir satırın bedeli sessiz:
// lakabı olmayan bir huy varsa o kişilikteki bütün iller ADSIZ kalır ve kimse fark etmez.
function dogrulaLiderler() {
  baslik('liderler.js — illerin başındaki isimler (Görev 16)');
  const p = path.join(VERI, 'liderler.js');
  if (!fs.existsSync(p)) return H('liderler.js bulunamadı (Görev 16 / Adım 1 dosyası).');

  let L;
  try {
    L = require(p);
  } catch (e) {
    return H('liderler.js okunamadı (söz dizimi hatası olabilir): ' + e.message);
  }

  const { UNVANLAR, VARSAYILAN_UNVAN, LAKAPLAR, HASIM_LIDERLERI } = L;
  const AGIRLIKLAR = require(path.join(__dirname, '..', 'src', 'denge.js')).DENGE.ZEKA.AGIRLIKLAR;
  const illerVeri = oku('iller.json') || {};
  if (!UNVANLAR || !LAKAPLAR || !HASIM_LIDERLERI)
    return H('liderler.js UNVANLAR / LAKAPLAR / HASIM_LIDERLERI tablolarını dışa vermiyor.');

  // 1) Haritadaki her bölgenin unvanı olmalı — yoksa o bölgenin illeri varsayılana düşer
  //    ve haritanın yarısı "Komutanı" olur (sessiz tekdüzelik).
  const bolgeler = new Set();
  for (const kod of Object.keys(illerVeri)) {
    const il = illerVeri[kod];
    if (il && il.bolge) bolgeler.add(il.bolge);
  }
  let eksikBolge = 0;
  for (const b of bolgeler)
    if (!UNVANLAR[b]) eksikBolge += U('"' + b + '" bölgesinin unvanı yok — varsayılana düşecek.');
  if (eksikBolge === 0 && bolgeler.size > 0) OK(bolgeler.size + ' bölgenin de unvanı yazılı');

  // 2) Unvan satırları dolu mu (ad + iyelik).
  for (const b of Object.keys(UNVANLAR)) {
    const u = UNVANLAR[b];
    if (!u || !u.ad || !u.iyelik) H('"' + b + '" unvanında ad ya da iyelik eksik.');
  }
  if (!VARSAYILAN_UNVAN || !VARSAYILAN_UNVAN.iyelik) H('VARSAYILAN_UNVAN eksik.');

  // 3) Her huyun lakap havuzu olmalı ve havuzda tekrar bulunmamalı.
  const huylar = AGIRLIKLAR;
  for (const huy of huylar) {
    const havuz = LAKAPLAR[huy];
    if (!Array.isArray(havuz) || havuz.length === 0) {
      H('"' + huy + '" huyunun lakap havuzu yok — o kişilikteki iller adsız kalır.');
      continue;
    }
    if (new Set(havuz).size !== havuz.length) H('"' + huy + '" havuzunda tekrar eden lakap var.');
    for (const l of havuz) if (!l || !String(l).trim()) H('"' + huy + '" havuzunda boş lakap var.');
  }
  for (const huy of Object.keys(LAKAPLAR))
    if (!huylar.includes(huy)) U('"' + huy + '" bir kişilik ağırlığı değil ama havuzu var.');
  OK(huylar.length + ' huyun da lakap havuzu dolu');

  // 4) Husumet tablosundaki her ilin elle yazılmış lideri olmalı: düello kartında iki ad
  //    karşı karşıya gelecek, birinin adı tohumdan gelirse kart her maçta değişir.
  let husumetliler = [];
  try {
    husumetliler = require(path.join(VERI, 'husumetler.js')).HUSUMETLER || [];
  } catch {
    husumetliler = [];
  }
  let eksikHasim = 0;
  for (const h of husumetliler)
    for (const kod of [h.ilA, h.ilB])
      if (!HASIM_LIDERLERI[kod])
        eksikHasim += H(
          ((illerVeri[kod] || {}).ad || kod) + ' hasım ("' + h.ad + '") ama lideri yazılmamış.'
        );
  for (const kod of Object.keys(HASIM_LIDERLERI))
    if (!illerVeri[kod]) H('HASIM_LIDERLERI içinde geçersiz il kodu: ' + kod);
  if (eksikHasim === 0 && husumetliler.length > 0)
    OK(husumetliler.length * 2 + ' hasım ilinin de lideri yazılı');
}

// ============================================================
// 7) DENGE.MOD.KAPSAMLAR (Görev 09 çıktısı — mod seçim ekranının kapsam listesi)
// ============================================================
// Kapsamlar `bolge` alanıyla `iller.json`'a bağlanıyor. Yanlış yazılmış tek bir bölge adı,
// SIFIR İLLİ bir kapsam demek: mod seçim ekranı "0 il" yazar, oyun kurulmaya çalışır ve
// oyuncu neden olmadığını anlamaz. Denetim burada olmak zorunda çünkü bağ bir METİN
// eşleşmesi — kod tarafında yakalayacak bir tip yok.
function dogrulaModKapsamlari() {
  baslik('DENGE.MOD.KAPSAMLAR — mod seçim ekranının kapsamları');
  let MOD;
  try {
    MOD = require(path.join(__dirname, '..', 'src', 'denge.js')).DENGE.MOD;
  } catch (e) {
    return H('src/denge.js okunamadı: ' + e.message);
  }
  if (!MOD || !Array.isArray(MOD.KAPSAMLAR)) return H('DENGE.MOD.KAPSAMLAR dizi değil.');

  const iller = oku('iller.json');
  if (!iller) return U('iller.json okunamadığı için kapsamlar denetlenemedi.');

  const ilBolgesi = {};
  for (const kod of Object.keys(iller)) ilBolgesi[kod] = iller[kod].bolge;

  const gorulen = new Set();
  let cHata = 0;
  for (const k of MOD.KAPSAMLAR) {
    const yer = "kapsam '" + (k.anahtar || '?') + "'";
    if (gorulen.has(k.anahtar)) limitli(cHata++, 5, yer + ': anahtar tekrar ediyor');
    gorulen.add(k.anahtar);

    const kapsamIller = Object.keys(ilBolgesi).filter(
      (kod) => k.bolge === null || ilBolgesi[kod] === k.bolge
    );
    if (kapsamIller.length === 0)
      limitli(cHata++, 5, yer + ": '" + k.bolge + "' bölgesinde hiç il yok (yazım hatası?)");
    // Varsayılan oyuncu KAPSAM İÇİNDE olmalı; değilse oyun kurulurken oyuncunun hiç
    // toprağı olmaz ve maç başlar başlamaz yenilgi koşulu tetiklenir.
    else if (!kapsamIller.includes(k.varsayilanOyuncu))
      limitli(
        cHata++,
        5,
        yer + ": varsayılan oyuncu '" + k.varsayilanOyuncu + "' bu kapsamın dışında"
      );
    else bilgi(k.ad + ': ' + kapsamIller.length + ' il');
  }

  // Her mod tipinin tur sınırı formülü tam sayı üretmeli ve pozitif olmalı.
  for (const tip of Object.keys(MOD.TIPLER || {})) {
    const t = MOD.TIPLER[tip];
    if (!(t.TABAN > 0) || !(t.PARCA_BASINA > 0))
      limitli(cHata++, 5, "mod '" + tip + "': TABAN ve PARCA_BASINA pozitif olmalı");
  }

  if (!cHata)
    OK(MOD.KAPSAMLAR.length + ' kapsamın hepsi geçerli, bölge adları iller.json ile tutuyor');
}

// ============================================================
// 8) menu-seferi.json (Görev 10A — ana menünün fetih döngüsü)
// ============================================================
// Bu dosya ÖNCEDEN HESAPLANMIŞ bir animasyon: ana menünün arkasındaki harita bunu oynatıyor.
// Denetim burada olmak zorunda çünkü bozulması SESSİZ: parça bölümlemesi ya da komşuluk
// değişirse dosya eskir, menüde yarım paylaşılmış bir harita döner durur ve hiçbir yerde
// hata çıkmaz. `scripts/menu-seferi-uret.js` yeniden çalıştırılarak düzeltilir.
function dogrulaMenuSeferi() {
  baslik('menu-seferi.json — ana menü fetih döngüsü (Görev 10A)');
  const S = oku('menu-seferi.json');
  if (S === null) return bilgi('henüz üretilmedi (Görev 10A / Adım 1). Bu şu an NORMAL.');
  if (S === undefined) return;

  const gucler = S.guclerSirasi || [];
  if (gucler.length < 2) return H('guclerSirasi en az iki güç içermeli.');
  for (const g of gucler)
    if (!IL_KODLARI.includes(g)) H("guclerSirasi'nda geçersiz il kodu '" + g + "'");

  const durumlar = S.durumlar || [];
  if (!Array.isArray(durumlar) || durumlar.length < 2) return H('durumlar dizisi eksik.');
  const D = durumlar.length; // durum 0 dahil
  if (S.turSayisi !== D - 1) H('turSayisi ' + S.turSayisi + ' ama ' + D + ' durum var');
  for (const alan of ['degisenler', 'cepheler'])
    if (!Array.isArray(S[alan]) || S[alan].length !== D)
      H(alan + ' dizisi ' + (S[alan] || []).length + ' uzunlukta, ' + D + ' olmalı');

  // Her durum TÜM parçaları kapsamalı. Eksik parça = menüde çizilmeyen delik.
  let cKapsam = 0;
  if (parcaIdSet) {
    for (let i = 0; i < D; i++) {
      const k = Object.keys(durumlar[i] || {});
      if (k.length !== parcaIdSet.size)
        limitli(
          cKapsam++,
          3,
          'durum ' + i + ': ' + k.length + ' parça (parcalar.json ' + parcaIdSet.size + ' içeriyor)'
        );
      for (const pid of k)
        if (!parcaIdSet.has(pid))
          limitli(cKapsam++, 3, 'durum ' + i + ": tanınmayan parça '" + pid + "'");
    }
  }
  if (!cKapsam) OK(D + ' durumun hepsi 181 parçayı da kapsıyor');

  // `degisenler` durumlardan TÜRETİLEBİLİR — o yüzden ikisi ayrışabilir. Ekran yalnızca
  // `degisenler`i canlandırdığı için ayrışma "renk değişti ama parlamadı" diye görünür.
  let cFark = 0;
  for (let i = 1; i < D; i++) {
    const gercek = Object.keys(durumlar[i]).filter(
      (pid) => durumlar[i][pid] !== durumlar[i - 1][pid]
    );
    const yazan = S.degisenler[i] || [];
    if (gercek.sort().join(',') !== [...yazan].sort().join(','))
      limitli(
        cFark++,
        3,
        'durum ' + i + ': degisenler ' + yazan.length + ' parça diyor, gerçek fark ' + gercek.length
      );
  }
  if (!cFark) OK('degisenler listeleri durumlarla birebir tutuyor');

  // Cephe = komşusu farklı sahipte olan parça. Aynı gerekçe: türetilebilir, ayrışabilir.
  const K = oku('parca-komsuluk.json');
  let cCephe = 0;
  if (K) {
    for (let i = 0; i < D; i++) {
      const s = durumlar[i];
      const gercek = Object.keys(s)
        .filter((pid) => (K[pid] || []).some((n) => s[n] !== s[pid]))
        .sort();
      if (gercek.join(',') !== [...(S.cepheler[i] || [])].sort().join(','))
        limitli(
          cCephe++,
          3,
          'durum ' +
            i +
            ': cepheler ' +
            (S.cepheler[i] || []).length +
            ' parça diyor, gerçek ' +
            gercek.length
        );
    }
    if (!cCephe) OK('cephe listeleri komşuluk grafiğiyle tutuyor');
  }

  // Sefer BİTMELİ. Bitmezse menüde harita hiç paylaşılmaz, döngü yarım kalır.
  const son = durumlar[D - 1];
  const gucKumesi = new Set(gucler);
  const sahipsiz = Object.keys(son).filter((pid) => !gucKumesi.has(son[pid]));
  if (sahipsiz.length) H(sahipsiz.length + ' parça sefer bitince hâlâ hiçbir güce ait değil');
  else {
    const sayim = {};
    for (const pid of Object.keys(son)) sayim[son[pid]] = (sayim[son[pid]] || 0) + 1;
    OK(D - 1 + ' turda harita paylaşılıyor · ' + gucler.map((g) => g + ':' + sayim[g]).join(' · '));
  }
}

// ============================================================
// 9) turkiye-hat.json (Görev 10A — başlık konumu meta.enUstY'den geliyor)
// ============================================================
function dogrulaTurkiyeHat() {
  baslik('turkiye-hat.json — ülke dış hattı');
  const T = oku('turkiye-hat.json');
  if (T === null) return bilgi('henüz üretilmedi (scripts/turkiye-hat-uret.js).');
  if (T === undefined) return;

  if (typeof T.yol !== 'string' || !T.yol.startsWith('M') || /NaN|undefined/.test(T.yol))
    H('dış hat çizim yolu geçersiz');
  else OK('dış hat çizim yolu geçerli');

  // Ana menü/mod ekranı başlığı karaya değmesin diye bu sayıyı kullanıyor. Yoksa ekran
  // her açılışta 2262 noktayı tarar ya da — daha kötüsü — koda sabit sayı yazılır.
  const y = (T.meta || {}).enUstY;
  if (typeof y !== 'number')
    return H('meta.enUstY yok (scripts/turkiye-hat-uret.js yeniden çalıştırılmalı)');
  const gercek = Math.min(
    ...T.yol
      .split('M')
      .filter(Boolean)
      .flatMap((r) =>
        r
          .replace('Z', '')
          .split('L')
          .map((n) => +n.split(',')[1])
      )
      .filter(Number.isFinite)
  );
  if (Math.abs(gercek - y) > 0.05) H('meta.enUstY ' + y + ' ama yoldaki en küçük y ' + gercek);
  else OK('meta.enUstY = ' + y + ' (yolla tutuyor — başlık konumu buradan hesaplanıyor)');
}

// ============================================================
// 9b) menu-geometri.json (Görev 10A — menü ekranlarının sadeleşmiş geometrisi)
// ============================================================
// Menü/mod/il-seçim ekranları BU geometriyle çiziyor; oyun haritası tam çözünürlükte.
// Bozulması sinsi: parça eksilirse menüde delik açılır, çift eksilirse cephe çizgisi
// o sınırda hiç çizilmez — ikisi de sessiz. Kaynak veri değişince
// `scripts/menu-geometri-uret.js` yeniden çalıştırılır.
function dogrulaMenuGeometri() {
  baslik('menu-geometri.json — menü ekranlarının sadeleşmiş geometrisi');
  const G = oku('menu-geometri.json');
  if (G === null) return bilgi('henüz üretilmedi (scripts/menu-geometri-uret.js).');
  if (G === undefined) return;

  const p = Object.keys(G.parcalar || {});
  const i = Object.keys(G.iller || {});
  if (parcaIdSet && p.length !== parcaIdSet.size)
    H('parça sayısı ' + p.length + ' (parcalar.json ' + parcaIdSet.size + ')');
  else OK(p.length + ' parça yolu var');
  if (i.length !== 81) H('il sayısı ' + i.length + ' (81 olmalı)');
  else OK('81 il yolu var');

  let cBozuk = 0;
  for (const [ad, kume] of [
    ['parça', G.parcalar || {}],
    ['il', G.iller || {}],
    ['çift', G.ciftler || {}],
  ])
    for (const k of Object.keys(kume))
      if (!/^M/.test(kume[k]) || /NaN|undefined/.test(kume[k]))
        limitli(cBozuk++, 5, ad + " '" + k + "' yolu geçersiz");
  if (!cBozuk) OK('tüm yollar geçerli (M ile başlıyor, NaN yok)');

  // Çiftler komşuluk grafiğiyle tutmalı (boğaz komşulukları hariç — ortak kenarları yok).
  const K = oku('parca-komsuluk.json');
  if (K && G.ciftler) {
    const beklenen = new Set();
    for (const a of Object.keys(K))
      for (const b of K[a]) beklenen.add(a < b ? a + '|' + b : b + '|' + a);
    const fazla = Object.keys(G.ciftler).filter((c) => !beklenen.has(c));
    // SU ÜSTÜNDEN KOMŞULAR (Görev 21): göller parçalardan oyulunca aralarında yalnızca göl
    // kalan çiftler — oyunda komşu, sınır çizgisi yok. Listeyi oyma betiği yazıyor.
    const pv = oku('parcalar.json');
    const suUstu = new Set(
      ((pv && pv.meta && pv.meta.golOyma && pv.meta.golOyma.suUstuKomsu) || []).map((c) => {
        const [x, y] = c.split('|');
        return x < y ? x + '|' + y : y + '|' + x;
      })
    );
    const eksik = [...beklenen].filter((c) => !G.ciftler[c] && !suUstu.has(c));
    if (fazla.length) H('komşu olmayan çift: ' + fazla.slice(0, 5).join(', '));
    // 4 boğaz çifti beklenen: kara kenarı yok (17-1|17-2, 17-1|17-3, 34-1|34-2, 34-1|39-2).
    else if (eksik.length > 4)
      H(
        'ortak kenarı eksik çift sayısı ' +
          eksik.length +
          ' (beklenen ≤4 boğaz): ' +
          eksik.join(', ')
      );
    else
      OK(
        Object.keys(G.ciftler).length +
          ' komşu çiftinin sınır çizgisi var (' +
          eksik.length +
          ' boğaz çifti ve ' +
          suUstu.size +
          ' göl üstü çift hariç — doğru)'
      );
  }
}

// ============================================================
// 10) mod-hedefleri.json (Görev 10A — mod kartlarının mini haritaları)
// ============================================================
// Kartın RESMİ ile ALTINDAKİ SAYI aynı kaynaktan gelmiyor: resim bu dosyadan, sayı
// denge.js'ten. Ayrışabilirler — ve bir kez ayrıştılar (%50 kartı 101 parça gösterip
// 91 yazıyordu). Denetim ikisini her koşuda karşılaştırıyor.
function dogrulaModHedefleri() {
  baslik('mod-hedefleri.json — mod kartlarının mini haritaları (Görev 10A)');
  const M = oku('mod-hedefleri.json');
  if (M === null) return bilgi('henüz üretilmedi (scripts/mod-hedefleri-uret.js).');
  if (M === undefined) return;

  let MOD;
  try {
    MOD = require(path.join(__dirname, '..', 'src', 'denge.js')).DENGE.MOD;
  } catch (e) {
    return H('src/denge.js okunamadı: ' + e.message);
  }

  const gecerli = (liste, ad) => {
    let c = 0;
    for (const pid of liste || [])
      if (parcaIdSet && !parcaIdSet.has(pid))
        limitli(c++, 3, ad + ": tanınmayan parça '" + pid + "'");
    return !c;
  };

  // %50 kartı: resimdeki parça sayısı = denge.js'teki eşik. "Ekran sayı uyduramaz."
  const oyuncu = (M.yarim || {}).oyuncu || [];
  const esik = parcaIdSet ? Math.ceil(MOD.TIPLER.yarim.ESIK_ORANI * parcaIdSet.size) : null;
  if (gecerli(oyuncu, '%50 kartı')) {
    if (esik !== null && oyuncu.length !== esik)
      H('%50 kartı ' + oyuncu.length + ' parça gösteriyor ama eşik ' + esik);
    else OK('%50 kartı tam ' + oyuncu.length + ' parça (eşikle aynı)');
  }

  // Güç yarışı: bloklar kesişmez, en büyüğü oyuncunun.
  const bloklar = (M.puan || {}).bloklar || {};
  const hepsi = [];
  for (const il of Object.keys(bloklar)) {
    gecerli(bloklar[il], 'güç yarışı ' + il);
    hepsi.push(...bloklar[il]);
  }
  if (new Set(hepsi).size !== hepsi.length) H('güç yarışı blokları kesişiyor');
  else if (Object.keys(bloklar).length) {
    const enBuyuk = Object.keys(bloklar).reduce((a, b) =>
      bloklar[a].length >= bloklar[b].length ? a : b
    );
    if (enBuyuk !== M.oyuncuIl)
      H('güç yarışında en büyük blok ' + enBuyuk + ' ama oyuncu ' + M.oyuncuIl);
    else
      OK(
        'güç yarışı blokları ayrık, en büyüğü oyuncunun (' +
          Object.keys(bloklar)
            .map((k) => k + ':' + bloklar[k].length)
            .join(' · ') +
          ')'
      );
  }
}

// ============================================================
// 11) harita-seviyeleri.json (Görev 20 — Skia haritasının kademeli geometrisi)
// ============================================================
// Oyun haritası bu dosyadan çiziliyor. Üç tuzak var ve üçü de sessiz:
//   • parcalar.json değişip bu dosya YENİDEN ÜRETİLMEZSE harita eski sınırlarla çizilir,
//     dokunma testi (parcalar.json) yeni sınırlarla çalışır → parmak yanlış parçayı seçer.
//   • Bir hat referansı kayarsa parça "yanlış hatlardan" dikilir ve delik açılır.
//   • Seviyeler aynı hat sayısını taşımazsa ince seviyeye geçişte harita bozulur.
function dogrulaHaritaSeviyeleri() {
  baslik('harita-seviyeleri.json — oyun haritasının kademeli geometrisi (Görev 20)');
  const G = oku('harita-seviyeleri.json');
  if (G === null) return bilgi('henüz üretilmedi (scripts/harita-seviye-uret.js).');
  if (G === undefined) return;

  const P = oku('parcalar.json');
  const parcaSayisi = Object.keys(G.halkalar || {}).length;
  if (parcaIdSet && parcaSayisi !== parcaIdSet.size)
    H('parça sayısı ' + parcaSayisi + ' (parcalar.json ' + parcaIdSet.size + ')');
  else OK(parcaSayisi + ' parçanın halka referansı var');

  // Eskime denetimi: kaynak (parcalar.json) üretimden sonra değişti mi? Toplam nokta sayısı
  // üretim anında meta'ya yazılıyor; tutmuyorsa dosya eski geometriyi çiziyor demektir.
  if (P) {
    let n = 0;
    for (const k of Object.keys(P.parcalar)) n += (P.parcalar[k].yol.match(/[ML]/g) || []).length;
    if (G.meta.tamNokta !== n)
      H(
        'parcalar.json değişmiş (' +
          n +
          ' nokta, üretimde ' +
          G.meta.tamNokta +
          ') — node scripts/harita-seviye-uret.js'
      );
    else OK('parcalar.json ile güncel (' + n + ' nokta)');
  }

  const hatSayisi = (G.hatSahipleri || []).length;
  const tol = G.meta.toleranslar || [];
  if (!G.seviyeler || G.seviyeler.length !== tol.length || !tol.length)
    H('seviye sayısı toleranslarla tutmuyor');
  else {
    let bozuk = 0;
    G.seviyeler.forEach((sv, i) => {
      if (sv.hatlar.length !== hatSayisi)
        limitli(
          bozuk++,
          3,
          'seviye ' + i + ' hat sayısı ' + sv.hatlar.length + ' (' + hatSayisi + ' olmalı)'
        );
      for (const y of sv.hatlar)
        if (!/^M/.test(y) || /NaN|undefined/.test(y))
          limitli(bozuk++, 3, 'seviye ' + i + ' bozuk hat');
    });
    if (!bozuk)
      OK(tol.length + ' seviye × ' + hatSayisi + ' hat, hepsi geçerli (' + tol.join(' · ') + ')');
  }

  let refBozuk = 0;
  for (const pid of Object.keys(G.halkalar || {}))
    for (const halka of G.halkalar[pid])
      for (const [h] of halka)
        if (!(h >= 0 && h < hatSayisi))
          limitli(refBozuk++, 3, pid + ' geçersiz hat referansı ' + h);
  if (!refBozuk) OK('bütün halka referansları geçerli hatları gösteriyor');
}

// ============================================================
console.log('VERİ DOĞRULAMA — ' + new Date().toISOString().slice(0, 10));
dogrulaParcalar();
dogrulaParcaKomsuluk();
dogrulaHarita();
dogrulaIller();
dogrulaKomsuluk();
dogrulaHusumetler();
dogrulaLiderler();
dogrulaModKapsamlari();
dogrulaMenuSeferi();
dogrulaTurkiyeHat();
dogrulaMenuGeometri();
dogrulaModHedefleri();
dogrulaHaritaSeviyeleri();

console.log('\n' + '='.repeat(48));
if (hata)
  console.log(
    'SONUÇ: ✗ ' + hata + ' HATA' + (uyari ? ', ' + uyari + ' uyarı' : '') + ' — düzeltilmeli.'
  );
else if (uyari) console.log('SONUÇ: ✓ hata yok, ' + uyari + ' uyarı (bakılabilir, kritik değil).');
else console.log('SONUÇ: ✓ tüm veri tutarlı, hata yok.');
console.log('='.repeat(48));
process.exit(hata ? 1 : 0);
