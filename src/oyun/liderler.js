// LİDERLER — rakip illerin başındaki isimler (Görev 16 / Adım 1).
//
// ┌─ NİYE VAR ──────────────────────────────────────────────────────────────────────────┐
// │ 80 rakip ilin Görev 12'den beri kişiliği var (saldırgan · açgözlü · husumetçi ·      │
// │ temkinli) ama adı yok. Oyuncu "Konya saldırdı" diye okuyor; "Konya Paşası — Demir    │
// │ Yumruk saldırdı" diye okuyunca rakip bir sayı olmaktan çıkıp bir karakter oluyor.    │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ÜÇ KATMAN ----
//
//   unvan ← ilin BÖLGESİNDEN     (Karadeniz → Reis, Ege → Efe…)
//   lakap ← ilin KİŞİLİĞİNDEN    (baskın huy hangisiyse o havuzdan)
//   özel  ← HASIM ÇİFTLERİ       (7 çift · 14 il, elle yazılmış, sabit)
//
// Tablolar `veri/liderler.js`'te ve onları Baki dolduruyor — bu dosya hiçbir ad UYDURMAZ
// (`husumetler.js` / `rekabet.js` ikilisinin aynı kalıbı).
//
// ---- KAYITTA TUTULMUYOR, TÜRETİLİYOR ----
//
// `kisilik.js`'in kuralının aynısı: aynı tohum aynı lideri verir, kayıt dosyası büyümez.
// İki kaynak olsaydı biri eskirdi (§7 — türetilebilen kaydedilmez).
//
// ---- LAKAP SÜS DEĞİL, BİLGİ ----
//
// Lakap baskın huydan geliyor: oyuncu adı okuyunca ne bekleyeceğini biliyor. "Tanıdıkça"
// kuralı (§10) böylece bir kanal daha kazanıyor — ad, kişilik kartını açmadan önce de
// bir şey söylüyor.

import { DENGE } from '../denge.js';
import { ILLER } from './veri.js';
import { rastgeleKur } from './rastgele.js';
import { UNVANLAR, VARSAYILAN_UNVAN, LAKAPLAR, HASIM_LIDERLERI } from '../../veri/liderler.js';

// Bir ilin bölgesine düşen unvan. Bölge tabloda yoksa varsayılana düşer — veri değişince
// oyun adsız bir lider göstermesin.
export function unvanAl(ilKodu) {
  const il = ILLER[ilKodu];
  const bolge = il && il.bolge;
  return (bolge && UNVANLAR[bolge]) || VARSAYILAN_UNVAN;
}

// Kişiliğin BASKIN huyu. Eşitlikte `DENGE.ZEKA.AGIRLIKLAR` sırası karar veriyor —
// belirlenimci olsun diye: aynı kişilik her çağrıda aynı huyu vermeli.
export function baskinHuy(kisilik) {
  const adlar = DENGE.ZEKA.AGIRLIKLAR;
  let en = adlar[0],
    enDeger = -Infinity;
  for (const ad of adlar) {
    const deger = (kisilik && kisilik[ad]) || 0;
    if (deger > enDeger) {
      enDeger = deger;
      en = ad;
    }
  }
  return en;
}

// Tohumdan sabit bir sayı: aynı (tohum, il) her zaman aynı lakabı seçsin diye. İl kodu
// sayıya çevrilip tohuma katılıyor — iki il aynı tohumda aynı lakabı almasın.
function lakapSec(tohum, ilKodu, huy) {
  const havuz = LAKAPLAR[huy] || [];
  if (havuz.length === 0) return null;
  const karisim = ((tohum >>> 0) + Number(ilKodu) * 7919) >>> 0; // 7919: asal, kodları ayırıyor
  const uretec = rastgeleKur(karisim, karisim);
  return havuz[uretec.tamsayi(0, havuz.length - 1)];
}

// Bir ilin liderinin adı.
//
// Dönen: { unvan, lakap, tamAd, hasim }
//   unvan → "Paşası" (iyelik biçimi, il adının arkasına takılır)
//   lakap → "Demir Yumruk"
//   tamAd → "Konya Paşası — Demir Yumruk"
//   hasim → lakap hasım tablosundan mı geldi (düello kartı bunu vurgulayabilir)
//
// ⚠ HASIM ÇİFTLERİNİN LAKABI KİŞİLİĞE BAKMAZ. O 14 il için ad elle yazıldı ve husumetin
// konusuyla konuşuyor (Rize → "Tavşan Kanı"); tohuma bağlansaydı her maçta başka bir ada
// dönerdi ve düello kartındaki tanıdıklık kaybolurdu.
export function liderAdi(tohum, ilKodu, kisilik) {
  const il = ILLER[ilKodu];
  const unvan = unvanAl(ilKodu);
  const hasimLakabi = HASIM_LIDERLERI[ilKodu] || null;
  const lakap = hasimLakabi || lakapSec(tohum, ilKodu, baskinHuy(kisilik));
  const ilAd = il ? il.ad : ilKodu;
  const basi = ilAd + ' ' + unvan.iyelik;
  return {
    unvan: unvan.iyelik,
    lakap,
    tamAd: lakap ? basi + ' — ' + lakap : basi,
    hasim: !!hasimLakabi,
  };
}

// Bütün aktörlerin liderleri tek geçişte. Ekran tarafı her çizimde 81 kez çağırmasın diye
// (`kisilikUret` ile aynı kalıp).
export function liderleriUret(tohum, kisilikler) {
  const sonuc = {};
  for (const ilKodu of Object.keys(kisilikler || {}))
    sonuc[ilKodu] = liderAdi(tohum, ilKodu, kisilikler[ilKodu]);
  return sonuc;
}
