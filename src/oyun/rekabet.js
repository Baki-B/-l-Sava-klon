// REKABET OLAYLARI — KUTSAL SAVAŞLAR (Görev 08 / Adım 7 · tasarım §11).
//
// ┌─ BAKİ'NİN KARARI (2026-08-01) ──────────────────────────────────────────────────────┐
// │ Soru 5'te **B** seçildi (sunum + moral bonusu + ganimet bonusu) ama üstüne A'nın     │
// │ birinci maddesi de istendi:                                                          │
// │                                                                                      │
// │   *"Kutsal savaşların en önemli işlevi 2 ilin bir düelloya çıkması, yani A'da       │
// │    dediğin üçüncü devlet düelloya karışamaz; onun dışında B iyi."*                   │
// │                                                                                      │
// │ Haklı: kısıt olmadan "düello", iki tarafa bonus veren sıradan bir savaştır.          │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- KOD HİÇBİR REKABET UYDURMAZ ----
// Hasım çiftleri `veri/husumetler.js`'te ve o dosyayı Baki dolduruyor. Buradaki hiçbir
// satır belirli bir il ya da savaş adı tanımıyor; tablo boşalsa sistem sessizce susar.
//
// ---- AKTÖR = İL ----
// Oyunun aktör kimliği il kodudur (Bursa oyuncusu '16'). Bir aktör başka iller fethetse de
// KİMLİĞİ değişmez, yani "iki hasım il" ile "iki hasım aktör" aynı şey. Husumet tablosu bu
// yüzden doğrudan aktör kimlikleriyle eşleşiyor; ayrı bir eşleme katmanı yok.

import { DENGE } from '../denge.js';
import { KOMSULUK } from './veri.js';
import { HUSUMETLER } from '../../veri/husumetler.js';

const R = DENGE.REKABET;

// Çift YÖNSÜZ: A–B ile B–A aynı husumet. Anahtar sıralanarak üretiliyor ki arama tek
// yönlü olsun ve tablo iki kez yazılmasın (`veri-dogrula.js` tekrarı zaten yakalıyor).
const anahtar = (a, b) => (a < b ? a + '-' + b : b + '-' + a);

const TABLO = {};
for (const h of HUSUMETLER || []) TABLO[anahtar(h.ilA, h.ilB)] = h;

// İki aktör hasım mı? Değilse null.
export function husumetBul(a, b) {
  if (!R.ACIK || !a || !b || a === b) return null;
  return TABLO[anahtar(a, b)] || null;
}

// ---- ETKİN DÜELLOLAR ----
// Kayıtta `durum.duellolar` olarak duruyor: [{ a, b, tur }] — `tur` başlangıç turu.
// KOMPAKT tutuluyor (üç alan) çünkü kayıt 15 turda 25.2 KB ve sınır 26 (Görev 07 §11/4).
export function etkinDuellolar(durum) {
  return durum.duellolar || [];
}

export function duelloBul(durum, a, b) {
  const k = anahtar(a, b);
  return etkinDuellolar(durum).find((d) => anahtar(d.a, d.b) === k) || null;
}

// Bu aktörün taraf olduğu düellolar.
export function duellolarim(durum, aktorId) {
  return etkinDuellolar(durum).filter((d) => d.a === aktorId || d.b === aktorId);
}

// ---- GİRİŞ ŞARTI: BAŞKA SAVAŞI OLAN DÜELLOYA ÇIKAMAZ (Görev 09, Baki 2026-08-01) ----
//
// SAVAŞ HALİ BURADA HAM VERİDEN OKUNUYOR (`durum.iliskiler`), `diplomasi.js savastaMi`
// ile değil: `diplomasi.js` bu dosyayı ithal ediyor (husumet ve düello sorguları için),
// tersi DÖNGÜ olurdu. Okuyucu bir KURAL değil, aynı verinin tek satırlık sorgusu —
// yukarıdaki komşuluk notunun aynısı, çoğaltılan bir davranış yok. Kuralın kendisi
// (`GIRIS_SARTI` karşılaştırması) aşağıda, tek yerde.
function baskaSavasVarMi(durum, aktorId, haric) {
  const t = durum.iliskiler || {};
  for (const k of Object.keys(t)) {
    if (t[k].tip !== 'savas') continue;
    const [a, b] = k.split('|');
    const karsi = a === aktorId ? b : b === aktorId ? a : null;
    if (karsi && karsi !== haric) return true;
  }
  return false;
}

// ---- TETİKLEME (§6/5) ----
//
// "İki hasım il BİRBİRİNİN PARÇASINA İLK SALDIRDIĞINDA." Saldırının kendisi ilandır;
// ayrı bir ilan mekanizması Görev 09'da da gelmedi (Soru 1 → Baki'nin cevabı A).
//
// Dönen: { durum, duello } — düello başlamadıysa `duello` null ve durum aynen dönüyor.
export function duelloDene(durum, saldiranId, savunanId) {
  if (!R.ACIK) return { durum, duello: null };
  const h = husumetBul(saldiranId, savunanId);
  if (!h) return { durum, duello: null };
  if (duelloBul(durum, saldiranId, savunanId)) return { durum, duello: null };

  // ---- BAKİ'NİN GİRİŞ ŞARTI (2026-08-01) ----
  // *"Düelloyu başlatmanın şartları olmalı: öncelikle başka illerle savaşta olmamalı
  // düellonun her iki tarafı da."*
  //
  // Bu şart `UCUNCU_TARAF: 'topraklar'`ın sömürüsünü kapatan asıl kural. Görev 08 o
  // seçenekten "oyuncu hasmına bilerek saldırıp sınırını dokunulmaz yapar" diye kaçmıştı;
  // artık kaçamıyor, çünkü öyle bir oyuncu tanım gereği başkalarıyla da savaş halindedir
  // ve düellosu HİÇ BAŞLAMAZ. Dokunulmazlık yalnızca gerçekten iki taraflı, başka cephesi
  // olmayan bir kavgaya veriliyor.
  //
  // Birbirleriyle savaşta olmaları şartı BOZMAZ (`haric` ile eleniyor) — düello zaten
  // onların kavgası; yasaklanan şey ÜÇÜNCÜ bir cephedir.
  // ⚠ ŞARTIN BEDELİ ÖLÇÜLDÜ (Görev 09 / Adım 1) ve ucuz değil: 30 turluk koşularda düello
  // sayısı orta kademede 3/2/6 → 3/0/2, ZOR kademede 9/8/6 → 1/1/2 düştü. Zorda kimse
  // "başka savaşı olmayan" duruma hiç girmiyor, yani §11'in tamamı fiilen susuyor.
  // Bu yüzden şart üç kademeli: en gevşeğinden en sıkısına.
  //
  //   'yok'            → şart yok (Görev 08 davranışı; sömürüye açık)
  //   'saldiranTemiz'  → YALNIZCA saldıranın başka savaşı olmamalı. Sömürüyü yapan taraf
  //                      saldırandır; şart tam onu hedefliyor ve savunanı cezalandırmıyor
  //                      (savunanın başka cephesi olması onun tercihi değil).
  //   'baskaSavasYok'  → iki taraf da temiz olmalı (Baki'nin ilk tarifi)
  const sart = R.GIRIS_SARTI;
  if (sart === 'baskaSavasYok' || sart === 'saldiranTemiz') {
    if (baskaSavasVarMi(durum, saldiranId, savunanId)) return { durum, duello: null };
    if (sart === 'baskaSavasYok' && baskaSavasVarMi(durum, savunanId, saldiranId))
      return { durum, duello: null };
  }

  // KAPAK (DENGE.REKABET.EN_COK_ETKIN) iki işi birden yapıyor: kayıt boyutunu garanti
  // altına alıyor ve ekranın "her yer kutsal savaş" hissine boğulmasını engelliyor.
  // Kapak doluyken yeni düello başlamaz; en eskisi bitince yer açılır.
  if (etkinDuellolar(durum).length >= R.EN_COK_ETKIN) return { durum, duello: null };

  const duello = { a: saldiranId, b: savunanId, tur: durum.tur };
  return {
    durum: { ...durum, duellolar: etkinDuellolar(durum).concat([duello]) },
    // Sunum için tabloyu da taşıyoruz; sahne ve tur raporu adı buradan okuyor.
    duello: { ilA: h.ilA, ilB: h.ilB, ad: h.ad, konu: h.konu },
  };
}

// ---- BİTİŞ (§6/6) ----
//
// İki koşuldan biri: taraflardan biri ötekinin TÜM illerini kaybedince (yani elinde hiç
// parça kalmayınca) ya da `DUELLO_SURESI` turu geçince.
//
// Aktörün "yaşıyor mu" ölçüsü ELİNDE PARÇA VAR MI. Ayrı bir "yenildi" bayrağı tutulmuyor:
// oyunun her yerinde sahiplik tek gerçek kaynak ve ikinci bir kayıt ondan ayrışabilirdi.
export function duellolariGuncelle(durum) {
  const liste = etkinDuellolar(durum);
  if (liste.length === 0) return durum;

  const yasiyor = {};
  for (const sahip of Object.values(durum.parcaSahipligi)) yasiyor[sahip] = true;

  const kalan = liste.filter(
    (d) => durum.tur - d.tur < R.DUELLO_SURESI && yasiyor[d.a] && yasiyor[d.b]
  );
  return kalan.length === liste.length ? durum : { ...durum, duellolar: kalan };
}

// ---- ÜÇÜNCÜ TARAF KISITI ----
//
// Üç ayrı kural var ve hangisinin geçerli olduğu `DENGE.REKABET.UCUNCU_TARAF`'ta yazılı;
// gerekçeleri de orada. Varsayılan `cephe`:
//
//   Üçüncü bir aktör, düellonun İKİ TARAFININ BİRBİRİYLE SINIRDAŞ olduğu parçalara
//   saldıramaz. "Kavganın arasına giremezsin" — korunan yer yalnızca düellonun fiilen
//   sürdüğü hat, yani sömürülebilir bir dokunulmazlık doğmuyor.
//
// Dönen: engelleyen düello ({ a, b, tur }) veya null.
//
// KOMŞULUK BURADA HAM VERİDEN OKUNUYOR (`KOMSULUK`), `hareket.js komsular()` ile değil:
// `hareket.js` bu dosyayı ithal ediyor, tersi döngü olurdu. `komsular` bir KURAL değil,
// aynı verinin tek satırlık okuyucusu — çoğaltılan bir davranış yok.
export function duelloEngeli(durum, aktorId, hedef) {
  if (!R.ACIK || R.UCUNCU_TARAF === 'kapali') return null;
  const sahip = durum.parcaSahipligi[hedef];
  if (!sahip || sahip === aktorId) return null;

  for (const d of etkinDuellolar(durum)) {
    const karsi = d.a === sahip ? d.b : d.b === sahip ? d.a : null;
    if (!karsi) continue; // hedefin sahibi bu düellonun tarafı değil
    if (karsi === aktorId) continue; // saldıran zaten düellonun öteki tarafı — serbest
    if (R.UCUNCU_TARAF === 'topraklar') return d;
    // 'cephe': hedef parça, düellonun karşı tarafıyla sınırdaş mı?
    if ((KOMSULUK[hedef] || []).some((k) => durum.parcaSahipligi[k] === karsi)) return d;
  }
  return null;
}

// ---- MORAL BONUSU (§6/7) ----
// Mevcut moral bonusu listesine BİR KALEM daha; yeni formül yok. Kalem sayısı
// `MUHAREBE.MORAL.BONUS_PAYI` ile bozgun eşiğine çevriliyor (§3.8), yani buradaki 1
// "bir bonus kadar" demek — sayı değil, KALEM.
//
// İKİ TARAFA DA veriliyor: kutsal savaş her iki orduyu da coşturur, birini kayırmaz.
export function duelloMoralBonusu(durum, saldiranId, savunanId) {
  if (!R.ACIK || !duelloBul(durum, saldiranId, savunanId)) return 0;
  return R.MORAL_BONUSU;
}

// ---- GANİMET BONUSU (§11 "kazanana ek ödül") ----
// Düellodaki rakibinden toprak alan taraf, fetih ganimetini bu oranda fazla alır.
// FETIH.NUFUS_ORANI'na dokunmuyor, üstüne biniyor: kartopu düğmesi yerinde kalsın.
export function duelloGanimetCarpani(durum, alanId, kaybedenId) {
  if (!R.ACIK || !kaybedenId || !duelloBul(durum, alanId, kaybedenId)) return 1;
  return 1 + R.GANIMET_BONUSU;
}
