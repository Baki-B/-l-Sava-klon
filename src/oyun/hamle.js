// HAMLE HAKKI DEFTERİ (Görev 15 / Adım 1 — belge: docs/GOREV-15-aninda-cozum.md).
//
// ┌─ NİYE VAR ──────────────────────────────────────────────────────────────────────────┐
// │ Emirler artık verildiği anda çözülüyor (Görev 15). Emir kuyruğu kalkınca "bu birlik  │
// │ bu tur hareket etti mi" sorusunu tutacak bir yer kalmadı: kuyruk bunu REZERVASYONLA  │
// │ tutuyordu (emre yazılan birim parçadan düşülmüş sayılıyordu). Defter o işi devralıyor.│
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// VERİ YAPISI — ordunun kendi kaydında, `kadro` ve `yarali` alanlarının yanında:
//
//   ordular['16-1'] = {
//     sahip: '16',
//     birimler: { piyade: 3, zirhli: 2 },
//     hamle: { piyade: { 1: 2 }, zirhli: { 1: 1, 2: 1 } }
//   }
//
// Okunuşu: *"bu parçadaki 2 piyade birer hamle harcadı; bir zırhlı bir hamle, bir zırhlı
// iki hamle harcadı."* Anahtar HARCANAN hamle sayısı, değer o kadar harcamış BİRİM sayısı.
//
// ---- ÜÇ DEĞİŞMEZ KURAL ----
//
//   1. DEFTERDE GÖRÜNMEYEN BİRİM HİÇ HAREKET ETMEMİŞTİR. Sıfır harcamış birim yazılmaz;
//      yazılsaydı her turda her parça için satır doğardı ve kayıt şişerdi (kayıt sınırı
//      ölçülü bir sayı — `veri/kayit-boyut-olcum.md`). Aynı gerekçe `kadro` alanında da
//      geçerli: alan yalnızca farklıysa saklanır.
//   2. DEFTER TUR SONUNDA SİLİNİR. Hak orada yenilenir (`hamleleriSifirla`), ayrı bir
//      "tur numarası" alanı tutulmaz — tutulsaydı iki kaynak doğar, biri eskirdi.
//   3. DEFTER ELDEKİ BİRİM SAYISINI AŞAMAZ. Muharebede birim erir; defter ondan haberdar
//      olmadığı için her yazımda kırpılır (`defterKirp`).
//
// Bu dosya SAF: React'i, ekranı, durumun tamamını tanımaz. Girdi ordu ve sayı, çıktı yeni
// defter. `src/oyun/` kuralı bu (CLAUDE.md §3).

import { DENGE } from '../denge.js';

// Bir birim türünün tur başına hamle hakkı. Listede olmayan tür 1 sayılır: yeni bir birim
// türü eklenirse hak vermeyi unutmak, onu hareketsiz bırakmaktan iyidir.
export function hamleHakki(tur) {
  const hak = DENGE.HAREKET.HAMLE_HAKKI[tur];
  return hak === undefined ? 1 : hak;
}

// Ordunun defteri. Ordu yoksa ya da hiç hareket etmemişse boş nesne.
export function defterAl(ordu) {
  return (ordu && ordu.hamle) || {};
}

// Bir türün defter satırı: { harcanan: birim sayısı }.
function satir(hamle, tur) {
  return hamle[tur] || {};
}

// O türden kaç birim hakkını TÜKETMİŞ (bir daha hareket edemez).
export function tukenmisSayisi(ordu, tur) {
  return satir(defterAl(ordu), tur)[hamleHakki(tur)] || 0;
}

// O türden kaç birim HÂLÂ hareket edebilir. Asla negatif dönmez: defter kırpılmadan bir
// kayıt yüklenirse (eski sürüm, elle düzenlenmiş dosya) oyun yine de tutarlı davranır.
export function hareketEdebilir(ordu, tur) {
  const eldeki = (ordu && ordu.birimler && ordu.birimler[tur]) || 0;
  return Math.max(0, eldeki - tukenmisSayisi(ordu, tur));
}

// Ordudan şu an emredilebilecek bütün kuvvet: { piyade: 2, zirhli: 1 } gibi.
// Sıfır olan tür yazılmaz — çağıran yerlerin sıfırları ayıklaması gerekmesin.
export function hareketEdebilirBirimler(ordu) {
  const sonuc = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const adet = hareketEdebilir(ordu, tur);
    if (adet > 0) sonuc[tur] = adet;
  }
  return sonuc;
}

// Defteri eldeki birim sayısına göre kırpar.
//
// HANGİ SATIR DÜŞER: EN AZ HARCAMIŞ OLAN. Yani kayıptan sağ çıkanlar, hamlesini DAHA ÇOK
// harcamış birimler sayılır. Tersi (çok harcamışı düşürmek) oyuncuya bedava hak verirdi:
// saldır, kayıp ver, kalanlar taze olsun — "kaybettikçe hızlanan ordu" diye bir şey olamaz.
export function defterKirp(birimler, hamle) {
  const sonuc = {};
  for (const tur of Object.keys(hamle || {})) {
    const eldeki = (birimler && birimler[tur]) || 0;
    const harcananlar = Object.keys(satir(hamle, tur))
      .map(Number)
      .sort((a, b) => b - a); // çoktan aza: en çok harcamış olan kalır
    let kalanYer = eldeki;
    const yeni = {};
    for (const harcanan of harcananlar) {
      if (kalanYer <= 0) break;
      const adet = Math.min(hamle[tur][harcanan], kalanYer);
      if (adet > 0) {
        yeni[harcanan] = adet;
        kalanYer -= adet;
      }
    }
    if (Object.keys(yeni).length > 0) sonuc[tur] = yeni;
  }
  return sonuc;
}

// Bir orduya defter yazar. BOŞ DEFTER ALAN BIRAKMAZ (kural 1): alan siliniyor, boş nesne
// kalmıyor — `ordu.js`'in "son birim gidince kayıt silinir" kuralıyla aynı huy.
export function hamleYaz(ordu, hamle) {
  const kirpik = defterKirp(ordu.birimler, hamle);
  if (Object.keys(kirpik).length === 0) {
    if (!ordu.hamle) return ordu;
    const yeni = { ...ordu };
    delete yeni.hamle;
    return yeni;
  }
  return { ...ordu, hamle: kirpik };
}

// İki defteri birleştirir (gelen birlikler hedefteki orduya karışıyor).
export function hamleBirlestir(a, b) {
  const sonuc = {};
  for (const kaynak of [a || {}, b || {}]) {
    for (const tur of Object.keys(kaynak)) {
      sonuc[tur] = { ...(sonuc[tur] || {}) };
      for (const harcanan of Object.keys(kaynak[tur])) {
        sonuc[tur][harcanan] = (sonuc[tur][harcanan] || 0) + kaynak[tur][harcanan];
      }
    }
  }
  return sonuc;
}

// ---- HAMLE HARCAMA ----
//
// `secilen` kadar birim yola çıkıyor. Dönen:
//   kaynakHamle → kaynakta KALANLARIN defteri
//   gidenHamle  → yola çıkanların defteri (hepsinin harcaması bir artmış hâlde)
//
// KİM GİDER: HAKKI EN ÇOK KALAN (en az harcamış olan). İki sonucu da isteniyor:
//   • Varış noktasında zırhlının bir hamlesi kalır → fethettiği yerden devam edebilir.
//     Baki'nin Görev 11'deki isteği ("art arda fetih") bu seçimle yaşıyor.
//   • Kaynakta yorgun birimler kalır ve savunmaya devam ederler.
// Tersi seçilseydi (yorgunu göndermek) zırhlı fethettiği parçada hep 0 hakla dururdu ve
// ikinci hamle kuralı fiilen ölürdü.
//
// ⚠ HAKKI TÜKENMİŞ BİRİM SEÇİLİRSE SESSİZ KALMIYOR: `eksik` alanı kaç birimin
// gönderilemediğini söylüyor. Çağıran (hareket kapısı) bunu hata olarak göstermeli;
// burada sessizce kırpmak, ekranda "gitti" görünüp haritada gitmeyen birlik demekti.
export function hamleHarca(ordu, secilen) {
  const hamle = defterKirp(ordu.birimler, defterAl(ordu));
  const kaynakHamle = {};
  const gidenHamle = {};
  const eksik = {};

  for (const tur of DENGE.BIRIM_SIRASI) {
    const istenen = (secilen && secilen[tur]) || 0;
    const eldeki = (ordu.birimler && ordu.birimler[tur]) || 0;
    if (eldeki === 0 && istenen === 0) continue;

    const hak = hamleHakki(tur);
    const mevcut = satir(hamle, tur);
    // Harcama kovaları: 0'dan hakka kadar. 0 kovası defterde yazılı değil, kalandan çıkıyor.
    let yazili = 0;
    for (const harcanan of Object.keys(mevcut)) yazili += mevcut[harcanan];
    const kovalar = { 0: Math.max(0, eldeki - yazili) };
    for (const harcanan of Object.keys(mevcut)) kovalar[harcanan] = mevcut[harcanan];

    let kalanIstek = istenen;
    for (let harcanan = 0; harcanan <= hak; harcanan++) {
      const adet = kovalar[harcanan] || 0;
      if (adet === 0) continue;
      // Hakkı tükenmiş kova (harcanan === hak) yola çıkamaz; olduğu gibi kaynakta kalır.
      const gidebilir = harcanan < hak ? Math.min(adet, kalanIstek) : 0;
      const kalan = adet - gidebilir;
      if (gidebilir > 0) {
        gidenHamle[tur] = { ...(gidenHamle[tur] || {}) };
        gidenHamle[tur][harcanan + 1] = (gidenHamle[tur][harcanan + 1] || 0) + gidebilir;
        kalanIstek -= gidebilir;
      }
      if (kalan > 0 && harcanan > 0) {
        kaynakHamle[tur] = { ...(kaynakHamle[tur] || {}) };
        kaynakHamle[tur][harcanan] = (kaynakHamle[tur][harcanan] || 0) + kalan;
      }
    }
    if (kalanIstek > 0) eksik[tur] = kalanIstek;
  }

  return { kaynakHamle, gidenHamle, eksik };
}

// Tur sonunda bütün defterleri siler — hak burada yenilenir (kural 2).
// HİÇBİR DEFTER YOKSA AYNI NESNE DÖNER: değişmeyen veriye yeni kimlik vermek, ekranın
// `React.memo` hafızalamasını boşa çıkarır (CLAUDE.md §6'nın "kimlik" tuzağı).
export function hamleleriSifirla(ordular) {
  let degisti = false;
  const yeni = {};
  for (const parcaId of Object.keys(ordular || {})) {
    const ordu = ordular[parcaId];
    if (ordu && ordu.hamle) {
      const kopya = { ...ordu };
      delete kopya.hamle;
      yeni[parcaId] = kopya;
      degisti = true;
    } else {
      yeni[parcaId] = ordu;
    }
  }
  return degisti ? yeni : ordular;
}

// Kayda yazılacak defter: boşsa `undefined` (alan hiç yazılmaz — kural 1).
// `ordu.js`'teki `kayitKadrosu` ile aynı kalıp.
export function kayitHamlesi(hamle) {
  if (!hamle) return undefined;
  const dolu = Object.keys(hamle).some((tur) => Object.keys(hamle[tur] || {}).length > 0);
  return dolu ? hamle : undefined;
}
