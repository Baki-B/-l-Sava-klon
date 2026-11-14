// KOMUTAN YETENEKLERİ — dört çeşit × üç kademe (Görev 16 / Adım 5).
//
// ┌─ YENİ MUHAREBE FORMÜLÜ YOK ─────────────────────────────────────────────────────────┐
// │ Dört yetenek, oyunun ZATEN kullandığı dört düğmeye basıyor:                          │
// │                                                                                      │
// │   ÇELİK YÜREK    → moral kalemi  (kutsal düellonun ve komutanın kanalı)               │
// │   SİLAH USTASI   → stat tablosu  (araştırmanın kanalı)                                │
// │   DAĞ KOMUTANI   → savunanın arazi üstünlüğü (`ARAZI[x].savunan`)                     │
// │   TOPLANMA USTASI→ toplanma maliyeti (seferberlik dalının kanalı)                     │
// │                                                                                      │
// │ Hiçbiri yeni bir hesap açmıyor; her biri mevcut bir sayıyı kaydırıyor. Ölçülebilir    │
// │ olmasının bedeli bu: bir yeteneği kapatmak tek satır.                                │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ⚠ KADEME `durum`DAN OKUNUR, MÜHÜRDEN DEĞİL ----
//
// Kademe oyuncuda mühürle açılıyor ama mühürler `durum`un içinde DEĞİL: `basarimKaydi.js`
// onları cihazda saklıyor ve KANCA okuyor. `src/oyun/*` React'i ve depolamayı hiç tanımaz
// (CLAUDE.md §3) — bu yüzden Node ile test edilebiliyor ve `denge-simulasyonu.js`
// çalışabiliyor. Kademe canlı canlı mühürden okunsaydı üç şey birden kırılırdı: ölçüm
// betiği çalışmaz, belirlenimcilik biter, testler mühür kaydına bağlanır.
//
// Bu yüzden kademe maçın KURULUMUNDA `durum.komutanlar`a yazılıyor; burası onu düz veri
// olarak okuyor. Mühür → kademe çevirimi kancanın işi (rütbenin kalıbı).
// Ayrıntı: `docs/HATA-AVI-2026-09-20.md` §3.

import { DENGE } from '../denge.js';
import { komutanAl, komutanBurada } from './komutan.js';
import { dalTavani } from './arastirma.js';
import { KOMSULUK } from './veri.js';

const K = DENGE.KOMUTAN;
const Y = K.YETENEKLER;

// Kademeyi 1..EN_COK_KADEME aralığına kırpar. Dizi indisleri buna güveniyor: kayıttan
// bozuk bir sayı gelse (elle düzenlenmiş kayıt, eski sürüm) dizi dışına taşmak yerine
// en yakın geçerli kademeye oturuyor.
export function kademeKirp(kademe) {
  const n = Math.round(Number(kademe) || 0);
  if (n < 1) return 1;
  return n > K.EN_COK_KADEME ? K.EN_COK_KADEME : n;
}

// Tanımlı bir yetenek mi?
export function yetenekVarMi(anahtar) {
  return !!anahtar && Object.prototype.hasOwnProperty.call(Y, anahtar);
}

// Bu aktörün yeteneği (yoksa null).
//
// Dönen: { yetenek, kademe, birim } — `birim` yalnızca Silah Ustası için anlamlı.
export function yetenekAl(durum, aktorId) {
  if (!K.ACIK) return null; // anahtar kapalıysa hiçbir yetenek işlemiyor (Adım 7)
  const k = komutanAl(durum, aktorId);
  if (!k || !yetenekVarMi(k.yetenek)) return null;
  return {
    yetenek: k.yetenek,
    kademe: kademeKirp(k.kademe),
    birim: k.birim || K.VARSAYILAN_BIRIM,
  };
}

// Bu aktörün yeteneği BU PARÇADA etkili mi?
//
// ⚠ TEK KAPI. Dört yetenek de buradan geçiyor: yetenek komutanın DURDUĞU parçada işler,
// başka yerde işlemez. Ayrı ayrı yazılsaydı biri "komutan burada mı" sorusunu sormayı
// unutur ve yetenek haritanın her yerinde çalışırdı.
function etkiliMi(durum, aktorId, parcaId, anahtar) {
  if (!komutanBurada(durum, aktorId, parcaId)) return null;
  const y = yetenekAl(durum, aktorId);
  return y && y.yetenek === anahtar ? y : null;
}

// ---- ÇELİK YÜREK ----

// Yetenekten gelen EK moral kalemi. Komutanın taban kalemine (`KOMUTAN.MORAL_KALEMI`)
// EKLENİYOR, onu değiştirmiyor: Sv.1'de toplam iki kalem.
//
// Kademe 3'te kalem YOK — orada eşik değil, kuralın kendisi değişiyor (`olumuneMi`).
export function celikYurekKalemi(durum, aktorId, parcaId) {
  const y = etkiliMi(durum, aktorId, parcaId, 'celikYurek');
  return y ? Y.celikYurek.KALEM[y.kademe - 1] || 0 : 0;
}

// ---- ⚠ KADEME 3: "YA KAZANIR YA YOK OLUR" ----
//
// Ordu moralden ASLA bozulmaz (hiç çekilmez) ama muharebeyi kaybederse TAMAMEN yok olur.
//
// Plandaki hâli "bozgun kapalı: ölümüne savaşır"dı ve motorda TAM TERSİNİ yapıyordu:
// bozgun tetiklenmeyince muharebe raunt tavanında bitiyor, ordu SAĞ çıkıyor, çekilme
// kaybını ödemiyor ve komutan bekleme cezasından muaf kalıyordu — üç katlı kalkan.
// Gerekçenin tamamı `denge.js KOMUTAN.YETENEKLER.celikYurek.OLUMUNE` notunda.
export function olumuneMi(durum, aktorId, parcaId) {
  const y = etkiliMi(durum, aktorId, parcaId, 'celikYurek');
  return !!y && !!Y.celikYurek.OLUMUNE[y.kademe - 1];
}

// ---- SİLAH USTASI ----

// Seçilen birlik türüne eklenecek seviye (0 = yetenek burada yok).
export function silahUstasiSeviyesi(durum, aktorId, parcaId, birim) {
  const y = etkiliMi(durum, aktorId, parcaId, 'silahUstasi');
  if (!y || y.birim !== birim) return 0;
  return Y.silahUstasi.SEVIYE[y.kademe - 1] || 0;
}

// ---- ⚠ BONUS YALNIZCA STAT TABLOSUNA UYGULANIR ----
//
// Araştırma NESNESİNE seviye eklenmiyor ve bu hayat memat meselesi: `ozelEtkiler` dört özel
// dalı `dalSeviyesi(...) > 0` diye yokluyor, yani araştırmaya +1 seviye yazmak YARMA ·
// PALET · BARAJ · SEFERBERLİK dallarını bedava açardı. Yarma tek başına "bozguna
// uğrattığın ordu çekilemez, YOK OLUR" demek. (`docs/HATA-AVI-2026-09-20.md` §4)
//
// Burada yapılan şey, hazır stat tablosunun tek bir satırını kaydırmak: araştırmanın
// kullandığı aynı oran (`ARASTIRMA.ARTIS`) ve aynı yuvarlama.
//
//   statlar   → `birimStatlari`'nın çıktısı (taraf başına tablo)
//   arastirma → o aktörün araştırma kaydı; dal tavanı bununla hesaplanıyor
//
// Dönen: yeni tablo (girdiye dokunulmuyor) ya da etki yoksa girdinin kendisi.
export function silahUstasiStatlari(statlar, durum, aktorId, parcaId, arastirma, dalSeviyesiFn) {
  const y = etkiliMi(durum, aktorId, parcaId, 'silahUstasi');
  if (!y) return statlar;
  const ek = Y.silahUstasi.SEVIYE[y.kademe - 1] || 0;
  if (ek <= 0) return statlar;

  const birim = y.birim;
  const dallar = DENGE.ARASTIRMA.DAL_SIRASI[birim] || [];
  const agac = DENGE.ARASTIRMA.AGACLAR[birim] || {};
  const taban = DENGE.BIRIMLER[birim];
  if (!taban) return statlar;

  const satir = { ...(statlar[birim] || taban) };
  let degisti = false;

  for (const dal of dallar) {
    const tanim = agac[dal];
    // ⚠ YALNIZCA STAT DALLARI. Özel dallar ('ozel') stat tablosunda hiç yaşamıyor;
    // onlara dokunmaya çalışmak yukarıdaki bedava-açılma kapısını aralamak olurdu.
    if (!tanim || tanim.tip !== 'stat') continue;

    // ---- ⚠ DAL TAVANI AŞILMAZ ----
    // Oyuncunun o daldaki mevcut seviyesi + yetenek, tavanı geçemiyor. Yani dalını
    // zaten Sv.3'e çıkarmış oyuncuda yetenek HİÇBİR ŞEY yapmaz: hata vermez, sessizce
    // boşa gider. Bu yüzden atama ekranı bunu yazmak zorunda (`yetenekBosaMiGider`).
    const mevcut = dalSeviyesiFn ? dalSeviyesiFn(arastirma, birim, dal) : 0;
    const tavan = dalTavani(birim, dal);
    const hedef = Math.min(tavan, mevcut + ek);
    if (hedef <= mevcut) continue;

    // Araştırmanın kendi formülü ve kendi yuvarlaması (`birimStatlari`): kayan nokta
    // artığı silinsin, ölçek bozulmasın.
    satir[tanim.stat] = Math.round(taban[tanim.stat] * (1 + DENGE.ARASTIRMA.ARTIS * hedef));
    degisti = true;
  }

  return degisti ? { ...statlar, [birim]: satir } : statlar;
}

// Yetenek bu araştırma kaydında boşa mı gidiyor? (Atama ekranı bunu YAZMAK zorunda —
// sessizce boşa giden bir yetenek, Görev 19'da yedi mührü kaybettiren sinsiliğin aynısı.)
export function yetenekBosaMiGider(yetenek, kademe, birim, arastirma, dalSeviyesiFn) {
  if (yetenek !== 'silahUstasi') return false;
  const ek = Y.silahUstasi.SEVIYE[kademeKirp(kademe) - 1] || 0;
  const hedefBirim = birim || K.VARSAYILAN_BIRIM;
  const dallar = DENGE.ARASTIRMA.DAL_SIRASI[hedefBirim] || [];
  const agac = DENGE.ARASTIRMA.AGACLAR[hedefBirim] || {};
  for (const dal of dallar) {
    const tanim = agac[dal];
    if (!tanim || tanim.tip !== 'stat') continue;
    const mevcut = dalSeviyesiFn ? dalSeviyesiFn(arastirma, hedefBirim, dal) : 0;
    if (Math.min(dalTavani(hedefBirim, dal), mevcut + ek) > mevcut) return false;
  }
  return true;
}

// ---- DAĞ KOMUTANI ----
//
// SALDIRANIN yeteneği: hedef parçanın SAVUNANA verdiği arazi üstünlüğünü kırar.
//
// ⚠ ZIRHLININ ARAZİ CEZASINA DOKUNMUYOR ve bu Baki'nin kararı (2026-09-20). O ceza
// `palet` araştırmasının kanalı; ikisi üst üste binse zırhlı dağda neredeyse cezasız
// kalır ve §3.7'nin "topçunun tek şansı coğrafya" kısıtı 0.12 farkla kırılır.
//
// Kırılan pay arazinin 1.0'ın ÜSTÜNDEKİ fazlasından alınıyor, çarpanın kendisinden değil:
// ovada (1.0) kırılacak bir şey olmadığı için yetenek ovada hiçbir şey yapmıyor — "dağ
// komutanı" adının gereği. Dağlık 1.30'da kademe 3 → 1.075 (fazlanın %75'i kırılıyor).
//
// ⚠ TAMAMI ASLA KIRILMAZ: `TELAFI` dizisinin son elemanı 1'in altında. Coğrafyayı bir
// yetenekle tamamen silmek §3.7'yi ortadan kaldırırdı.
export function dagKomutaniPayi(durum, aktorId, parcaId) {
  const y = etkiliMi(durum, aktorId, parcaId, 'dagKomutani');
  return y ? Y.dagKomutani.TELAFI[y.kademe - 1] || 0 : 0;
}

// Savunanın arazi çarpanının yetenekten sonraki hâli.
//
// `carpan` → `DENGE.ARAZI[arazi].savunan`
// `pay`    → `dagKomutaniPayi` (0 = etki yok)
//
// ⚠ 1'İN ALTINA İNEMEZ: yetenek savunanın üstünlüğünü kırıyor, savunanı CEZALANDIRMIYOR.
// Ovada pay ne olursa olsun sonuç 1.0 kalıyor.
export function savunanArazisi(carpan, pay) {
  const c = typeof carpan === 'number' ? carpan : 1;
  if (!pay || c <= 1) return c;
  return c - (c - 1) * pay;
}

// ---- TOPLANMA USTASI ----
//
// Komutanın parçasında ve KOMŞULARINDA toplanma BÜTÇESİNE eklenen pay (nüfus ve ekonomi).
//
// ⚠ BEDELE DEĞİL BÜTÇEYE DOKUNUYOR. İlk tasarım yüzdelik indirimdi ve ÖLÇÜM ONU ÖLÜ BULDU:
// toplanma bedelleri birim başına 1–3 ve `Math.ceil` ile yukarı yuvarlanıyor, yani %45
// indirim bile hiçbir satırı değiştirmiyordu (3 piyade + 1 topçu: {7,5} → {7,5}).
// Gerekçenin tamamı `denge.js KOMUTAN.YETENEKLER.toplanmaUstasi` notunda.
//
// Bütçe tarafının ikinci faydası: BEDEL HİÇ DEĞİŞMİYOR, yani "ekranda görünen bedel ile
// ödenen bedel" ayrışması imkânsız hâle geliyor. Görev 06'da `seferberlik` parametresi tam
// o ayrışmayı yapmıştı (panelde indirimli bedel, tur sonunda tam bedel).
//
// ⚠ KOMŞULUK BURADAN OKUNUYOR, PARAMETRE OLARAK ALINMIYOR: iki çağıran farklı komşuluk
// geçiremesin ya da biri geçirmeyi unutamasın.
export function toplanmaUstasiButcesi(durum, aktorId, parcaId) {
  const y = yetenekAl(durum, aktorId);
  if (!y || y.yetenek !== 'toplanmaUstasi') return 0;
  const k = komutanAl(durum, aktorId);
  if (!k || !k.parcaId) return 0;

  const yakin = k.parcaId === parcaId || (KOMSULUK[k.parcaId] || []).includes(parcaId);
  if (!yakin) return 0;
  return Y.toplanmaUstasi.EK_BUTCE[y.kademe - 1] || 0;
}

// Bütçenin yetenekten sonraki hâli. Tek satır ama TEK YERDE: ekran da motor da aynı
// fonksiyondan geçsin.
export function eklenmisButce(butce, ek) {
  if (!ek) return butce;
  return {
    nufus: ((butce && butce.nufus) || 0) + ek,
    ekonomi: ((butce && butce.ekonomi) || 0) + ek,
  };
}

// ---- BOTLARIN YETENEĞİ: KİŞİLİĞE GÖRE SABİT ----
//
// ⚠ ZORLUĞA BAĞLANAMAZ. §9.4: *"zorluk = ağırlık ayarı, gizli bonus değil."* Zor kademede
// bota kademe 3 vermek tam olarak gizli bonus olurdu.
//
// Baskın huy `liderler.js baskinHuy`'dan geliyor — lakap seçiminde kullanılan AYNI
// fonksiyon. Böylece ad ile davranış tutarlı kalıyor: "Demir Yumruk" diye tanıdığın
// saldırgan bot gerçekten Silah Ustası oluyor.
export function zekaYetenegi(huy) {
  const anahtar = K.BOT_YETENEGI[huy];
  return yetenekVarMi(anahtar) ? anahtar : 'celikYurek';
}

export function zekaKademesi() {
  return kademeKirp(K.BOT_KADEMESI);
}
