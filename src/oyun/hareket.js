// HAREKET KURALLARI (Görev 05 / Adım 2 — tasarım §7, §8/5 · Görev 15'te yeniden kuruldu).
//
// BURASI "NE EMREDEBİLİRSİN"İ SÖYLER. Emrin ne yaptığı (muharebe, fetih, çekilme)
// `cozum.js`'in işi.
//
// ---- ⚠ EMİR KUYRUĞU KALKTI (Görev 15, Baki 2026-09-19) ----
//
// *"Emirler verildiği turlarda işlenecekler. Bursa'dan Çanakkale'nin bir parçasına
// saldırdıysam ve o parçayı alabilecek güçteysem orası benim olmuş sayılır ve askerlerim
// oraya transfer olurlar."*
//
// Hamle artık verildiği an çözülüyor (`cozum.js → hamleUygula`). Bununla birlikte
// kuyruğun taşıdığı üç iş de yeniden dağıldı:
//   1. Haritadaki oklar → artık beklemede emir yok; ekran olup biteni günlükten gösteriyor.
//   2. Emir iptali → yok. Hamle gerçekleşti; yanlış tıklamayı ONAY KUTUSU engelliyor.
//   3. Aynı orduyu iki kez gönderme → REZERVASYON yerine HAMLE HAKKI DEFTERİ
//      (`src/oyun/hamle.js`): her birimin bu tur kaç hamle harcadığı ordunun kaydında.
//
// `durum.emirler` yine de duruyor ama iki işi kaldı: (a) `hamleUygula`nın tek emirlik
// geçişi, (b) TOPLANMA emirleri — onlar hâlâ kuyrukta bekleyip tur sonunda işleniyor
// (§3.9/2: ordu o tur yıpranmış hâliyle savunur, tur sonunda dolar).
//
// ---- ⚠ HAMLE HAKKI ARTIK TÜRE GÖRE (Görev 15, Baki 2026-09-19) ----
//
// Piyade 1 · Topçu 1 · Zırhlı 2 (`DENGE.HAREKET.HAMLE_HAKKI`). Görev 11'in "her birliğin
// iki hamlesi var" kuralı bununla değişti. İkinci hamle artık zincir emriyle değil,
// birliğin FİİLEN VARDIĞI parçadan veriliyor: zırhlı bir parçayı alır, oradan devam eder.
//
// KOMŞULUK YALNIZCA PARÇA GRAFİĞİNDEN OKUNUR (`veri/parca-komsuluk.json`). İl komşuluğu
// bir hareket kuralı DEĞİLDİR (§7): iki il komşu olsa da parçaları sınırdaş olmayabilir.

import { DENGE } from '../denge.js';
import { PARCALAR, KOMSULUK } from './veri.js';
import { kapsamdaMi } from './oyunDurumu.js';
import { birimSayisi, parcaOrdusu, yaraliAl, saglamBirimler } from './ordu.js';
import { kadroBol, eksikKadro, toplanabilirMi, toplanmaMaliyeti } from './toplanma.js';
import { hareketEdebilir } from './hamle.js';
import { aktorArastirmasi, seferberlikBedava } from './arastirma.js';
import { toplanmaUstasiButcesi } from './yetenek.js';
import { duelloEngeli } from './rekabet.js';
import { ittifakMi, savastaMi } from './diplomasi.js';

// ---- KOMŞULUK ----

export function komsular(parcaId) {
  return KOMSULUK[parcaId] || [];
}

export function komsuMu(a, b) {
  return komsular(a).includes(b);
}

// ---- REZERVASYON ----

export function emirler(durum) {
  return durum.emirler || [];
}

// Bu parçadan verilmiş emirlere ayrılmış birimler (tür başına toplam).
// ⚠ GÖREV 15'TEN SONRA BURAYA YALNIZCA TOPLANMA EMİRLERİ DÜŞÜYOR: hareket emirleri
// kuyrukta beklemiyor, verildiği an çözülüyor. Toplanma emri yaralıları rezerve ediyor
// (§5/5) — o birimler tur sonuna kadar başka bir işe gönderilemez.
export function rezerveBirimler(durum, parcaId) {
  const toplam = {};
  for (const e of emirler(durum)) {
    if (e.kaynak !== parcaId) continue;
    for (const tur of DENGE.BIRIM_SIRASI)
      if (e.birimler[tur] > 0) toplam[tur] = (toplam[tur] || 0) + e.birimler[tur];
  }
  return toplam;
}

// Bu parçadan HÂLÂ emredilebilecek birimler.
//
// İKİ SÜZGEÇ, İKİ AYRI SEBEP:
//   • HAMLE HAKKI (`hamle.js`) — bu tur hakkını tüketmiş birim yola çıkamaz.
//   • TOPLANMA REZERVASYONU — yaralıları toplanmaya ayırdıysan onlar meşgul.
// Kuvvet seçicinin `[+]` tuşu da, motorun geçerlilik kontrolü de bunu kullanır.
export function kullanilabilirBirimler(durum, parcaId) {
  const ordu = parcaOrdusu(durum, parcaId);
  if (!ordu) return {};
  const rezerve = rezerveBirimler(durum, parcaId);
  const kalan = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = hareketEdebilir(ordu, tur) - (rezerve[tur] || 0);
    if (n > 0) kalan[tur] = n;
  }
  return kalan;
}

// Bu parçadan verilmiş emirler (sıra numaralarıyla — iptal düğmesi sırayı kullanıyor).
export function parcaninEmirleri(durum, parcaId) {
  return emirler(durum)
    .map((e, sira) => ({ ...e, sira }))
    .filter((e) => e.kaynak === parcaId);
}

// ---- GEÇERLİLİK ----
//
// TEK KAYNAK KURALI: arayüzdeki "bu hedef seçilebilir mi" kontrolü ile motorun kontrolü
// aynı fonksiyondan gelir (`hedefGecerliMi` aşağıda bunu çağırıyor). Görev 04'te
// `eklenebilirMi` / `siparisGecerliMi` ayrışması testle kilitlenmişti; aynısı burada da.
//
// Dönen: { ok: true } veya { ok: false, kod, sebep }
//   kapsam    — parçalardan biri senaryo dışında
//   sahiplik  — kaynak senin değil / ordu senin değil
//   komsuluk  — hedef kaynağın komşusu değil
//   kuvvet    — hiç birim seçilmedi
//   hak       — o birimler burada yok ya da başka bir emirde (hamle hakkı harcanmış)
//   duello    — iki hasım ilin kutsal savaşına üçüncü taraf karışamaz (Görev 08 / §11)
export function hareketGecerliMi(durum, aktorId, kaynak, hedef, secilen) {
  if (!PARCALAR[kaynak] || !PARCALAR[hedef])
    return { ok: false, kod: 'kapsam', sebep: 'Burası haritada yok.' };
  if (!kapsamdaMi(durum, kaynak) || !kapsamdaMi(durum, hedef))
    return { ok: false, kod: 'kapsam', sebep: 'Burası oyunun dışında kalıyor.' };

  // ---- KAYNAK: SENİN PARÇAN VE ORADA DURAN ORDUN (Görev 15) ----
  // Zincir havuzu kalktı: hamle anında çözüldüğü için "buraya gelecek birlikler" diye bir
  // şey yok. İkinci hamle, birliğin FİİLEN vardığı parçadan veriliyor.
  const kaynakBenim = durum.parcaSahipligi[kaynak] === aktorId;
  const ordu = parcaOrdusu(durum, kaynak);
  const duranVar = kaynakBenim && ordu && ordu.sahip === aktorId;
  if (!duranVar)
    return kaynakBenim
      ? { ok: false, kod: 'sahiplik', sebep: 'Burada senin askerin yok.' }
      : { ok: false, kod: 'sahiplik', sebep: 'Yalnızca kendi bölgenden asker gönderebilirsin.' };

  if (!komsuMu(kaynak, hedef))
    return {
      ok: false,
      kod: 'komsuluk',
      sebep: 'Asker yalnızca sınır komşusu bir bölgeye gidebilir.',
    };

  if (birimSayisi(secilen) <= 0) return { ok: false, kod: 'kuvvet', sebep: 'Hiç birlik seçmedin.' };

  // ---- ÜÇÜNCÜ TARAF DÜELLOYA KARIŞAMAZ (Görev 08 / §11) ----
  // Kural burada, çünkü BURASI TEK KAPI: oyuncunun emri de yapay zekânın emri de aynı
  // doğrulamadan geçiyor (zeka.js'in "son söz oyuncunun doğrulamasında" kuralı). İkinci
  // bir yere yazılsaydı taraflardan biri kısıtı sessizce çiğneyebilirdi.
  const engel = duelloEngeli(durum, aktorId, hedef);
  if (engel)
    return {
      ok: false,
      kod: 'duello',
      sebep: 'Bu iki ilin kendi hesabı var. Aralarındaki savaş bitene kadar bu cepheye giremezsin.',
    };

  // ---- MÜTTEFİKİNE SALDIRAMAZSIN (Görev 09 / §5.1) ----
  // Kural DÜELLO KISITIYLA AYNI KAPIDAN geçiyor ve bu bilinçli: Görev 08'de üçüncü taraf
  // kısıtı buraya kondu, oyuncu ile yapay zekâ aynı doğrulamadan geçti ve iş gördü.
  // İkinci bir kontrol yazılmıyor (§10/4 — aynı kural iki yerde tutulmaz); yazılsaydı
  // taraflardan biri kısıtı sessizce çiğneyebilirdi.
  //
  // İTTİFAK BOZULMADAN SALDIRILAMAZ: oyuncu önce anlaşmayı bozar (ihanet bedelini öder),
  // sonra saldırır. "Aniden arkadan vurma" diye bedava bir hamle yok — §10'un "bozmanın
  // bedeli var" cümlesi ancak böyle işliyor.
  if (ittifakMi(durum, aktorId, durum.parcaSahipligi[hedef]))
    return {
      ok: false,
      kod: 'ittifak',
      sebep: 'Onunla anlaşman var. Saldırmak istiyorsan önce anlaşmayı bozmalısın.',
    };

  // ---- BARIŞTAKİNE SALDIRAMAZSIN (Görev 11, Baki 2026-08-03) ----
  // "Herkes ilk başta barış içinde olsun, daha sonra savaşlar açılsın." Saldırı artık
  // ilan değil, ilanın SONUCU: hedefin sahibiyle savaşta değilsen emir kapıda reddedilir.
  // Kural ittifak ve düello kısıtlarıyla AYNI KAPIDA — oyuncu ve zekâ aynı doğrulamadan
  // geçiyor, ikinci bir yer yok (§10/4). `ILAN.ACIK` kapatılırsa eski davranışa dönülür.
  {
    const hedefSahibi = durum.parcaSahipligi[hedef];
    if (
      hedefSahibi !== aktorId &&
      DENGE.DIPLOMASI.ACIK &&
      DENGE.DIPLOMASI.ILAN &&
      DENGE.DIPLOMASI.ILAN.ACIK &&
      !savastaMi(durum, aktorId, hedefSahibi)
    )
      return {
        ok: false,
        kod: 'baris',
        sebep: 'Onunla savaşta değilsin. Saldırmak için önce savaş ilan etmelisin.',
      };
  }

  // ---- HAMLE HAKKI (Görev 15) ----
  // Defter tek kaynak: hakkını tüketmiş birim yola çıkamaz, toplanmaya ayrılmış yaralı da.
  const kullanilabilir = kullanilabilirBirimler(durum, kaynak);
  const yeter = DENGE.BIRIM_SIRASI.every((t) => (secilen[t] || 0) <= (kullanilabilir[t] || 0));
  if (yeter) return { ok: true };

  // Sebebi AYIRIYORUZ: "hakkı bitti" ile "toplanmada" oyuncuya aynı şey değil.
  const toplanmada = birimSayisi(rezerveBirimler(durum, kaynak)) > 0;
  return {
    ok: false,
    kod: 'hak',
    sebep: toplanmada
      ? 'Bu birliklerin bir kısmı toplanmaya ayrıldı. Toplanmayı iptal edersen gönderebilirsin.'
      : 'Bu birlikler bu tur hakkını kullandı. Piyade ve topçu turda bir, zırhlı iki kez hareket eder.',
  };
}

// Bu parçadan emredilebilecek TÜM kuvvet: duran ordudan kalanlar + zincir havuzu.
// Kuvvet seçicinin üst sınırı ve hedef vurgulaması bunu kullanıyor.
//
// İkisi TOPLANIYOR çünkü bu bir "en fazla ne kadar" sorusu; hangi havuzdan besleneceğine
// `hareketGecerliMi` karar veriyor (önce duran, yetmezse zincir — ikisi karışmaz).
export function emredilebilirBirimler(durum, aktorId, parcaId) {
  return durum.parcaSahipligi[parcaId] === aktorId ? kullanilabilirBirimler(durum, parcaId) : {};
}

// "Bu hedef seçilebilir mi" — hedef seçme kipinde parçaların vurgulanması için.
// Elde kalan bütün kuvvetle sınanır: bir emir verilebiliyorsa hedef seçilebilirdir.
export function hedefGecerliMi(durum, aktorId, kaynak, hedef) {
  return hareketGecerliMi(
    durum,
    aktorId,
    kaynak,
    hedef,
    emredilebilirBirimler(durum, aktorId, kaynak)
  );
}

// Bu parçadan gidilebilecek hedeflerin listesi (hedef seçme kipi bunu vurguluyor).
export function gecerliHedefler(durum, aktorId, kaynak) {
  return komsular(kaynak).filter((h) => hedefGecerliMi(durum, aktorId, kaynak, h).ok);
}

// TAŞIMA MI SALDIRI MI (2026-07-30, Baki: "kendi bölgelerimize SALDIR ile asker transfer
// ediyoruz, bunu değiştir, askeri taşı kısmı ekle").
//
// Ayrım SAHİPLİĞE göre yapılıyor, savunan orduya göre değil:
//   dost   → hedef parça SENİN. Birlikler birleşir, muharebe olmaz. "Asker taşı."
//   dusman → hedef parça senin DEĞİL. Ordusu olsa da olmasa da bu bir fetih girişimidir;
//            boş bir düşman parçasına yürümek de toprak almaktır. "Saldır."
// Motorun kuralları değişmedi — bu yalnızca aynı geçerli hedef kümesinin ikiye bölünmesi,
// yani arayüzün iki ayrı eylem sunabilmesi için.
export function hedefleriAyir(durum, aktorId, kaynak) {
  const dost = [],
    dusman = [];
  for (const h of gecerliHedefler(durum, aktorId, kaynak))
    (durum.parcaSahipligi[h] === aktorId ? dost : dusman).push(h);
  return { dost, dusman };
}

// ---- HAMLE HAKKI TABLOSU (Görev 21 · haritadaki halka + TURU BİTİR'in sayısı) ----
//
// Aktörün her ordusu için: { kalan, toplam }. `kalan` bu tur HÂLÂ yola çıkabilecek birim
// sayısı; gidecek yeri olmayan ordunun kalanı 0 sayılır — halka "buna dokunursan bir yere
// gidersin" demek, gidemeyecek orduya halka takmak yalan olurdu. Baki (2026-09-24): "5
// askerlik bir yerin 3 askeri oynanmışsa hepsi mi soluk olacak?" — hayır: kalan/toplam
// oranı halkanın ne kadarının yandığını söylüyor, soluk yalnızca kalan 0 iken.
export function hamleHakkiTablosu(durum, aktorId) {
  const tablo = {};
  for (const pid of Object.keys(durum.ordular || {})) {
    const ordu = durum.ordular[pid];
    if (!ordu || ordu.sahip !== aktorId) continue;
    const toplam = birimSayisi(ordu.birimler);
    if (toplam === 0) continue;
    let kalan = birimSayisi(kullanilabilirBirimler(durum, pid));
    if (kalan > 0 && gecerliHedefler(durum, aktorId, pid).length === 0) kalan = 0;
    tablo[pid] = { kalan, toplam };
  }
  return tablo;
}

// Bu tur hâlâ hamle yapabilecek ordu sayısı (TURU BİTİR düğmesinin üstündeki sayı).
export function bekleyenOrduSayisi(tablo) {
  let n = 0;
  for (const pid of Object.keys(tablo)) if (tablo[pid].kalan > 0) n++;
  return n;
}

// ---- KUYRUK ----

// Emir ekler ve YENİ durum döndürür (gelen durum değiştirilmez).
// Aynı kaynaktan aynı hedefe ikinci emir verilirse BİRLEŞTİRİLİR — oyuncu "3 piyade daha
// gönder" dediğinde haritada iki ok belirmesin, tek emir büyüsün.
// `secenekler.komutan` — "komutan da gitsin" (Görev 16 / Adım 4). Bayrak emrin üstünde
// taşınıyor; `cozum.js` çözerken komutanı hedefe geçiriyor. Komutan o parçada değilse
// bayrak sessizce bir işe yaramaz (ekran zaten kutuyu göstermiyor).
export function emirEkle(durum, aktorId, kaynak, hedef, secilen, secenekler) {
  const gecerli = hareketGecerliMi(durum, aktorId, kaynak, hedef, secilen);
  if (!gecerli.ok) return { ok: false, sebep: gecerli.sebep, kod: gecerli.kod, durum };

  const temiz = {};
  for (const tur of DENGE.BIRIM_SIRASI) if (secilen[tur] > 0) temiz[tur] = secilen[tur];

  const liste = emirler(durum).slice();
  // ⚠ GÖREV 15'TEN SONRA BİRLEŞTİRME FİİLEN HİÇ ÇALIŞMIYOR: hareket emri kuyrukta
  // beklemiyor, `hamleUygula` onu hemen çözüp listeden düşürüyor. Kod duruyor çünkü
  // `emirEkle` hâlâ tek kapı ve bir gün beklemeli bir emir türü doğarsa kural burada.
  const varolan = liste.findIndex(
    (e) => e.sahip === aktorId && e.kaynak === kaynak && e.hedef === hedef && e.tip !== 'toplanma'
  );
  if (varolan >= 0) {
    const birlesik = { ...liste[varolan].birimler };
    for (const tur of DENGE.BIRIM_SIRASI)
      if (temiz[tur]) birlesik[tur] = (birlesik[tur] || 0) + temiz[tur];
    liste[varolan] = { ...liste[varolan], birimler: birlesik };
  } else {
    // DERİNLİK ALANI KALKTI (Görev 15): zincir emri diye bir şey yok, hamle hakkı defterde.
    const emir = { sahip: aktorId, kaynak, hedef, birimler: temiz };
    if (secenekler && secenekler.komutan) emir.komutan = true;
    liste.push(emir);
  }
  return { ok: true, durum: { ...durum, emirler: liste } };
}

// ---- TOPLANMA EMRİ (Görev 06 / §5/5) ----
//
// Toplanma HAREKET EMİRLERİYLE AYNI KUYRUĞA girer: iptal edilebilir, emir listesinde
// numaralı görünür, TURU BİTİR'de çözülür (çözümden SONRA, §3.9/2).
//
// ┌─ 2026-07-31 DEĞİŞİKLİĞİ — Baki: "hepsi toparlanmak zorunda kalıyor" ────────────────┐
// │ Emir artık ordunun TAMAMINI değil YALNIZCA YARALILARI rezerve ediyor. Sağlam         │
// │ birimler serbest kalıyor: aynı tur saldırıya veya takviyeye gidebiliyorlar.          │
// │ "Yaralılar geride toparlanırken sağlamlar savaşmaya devam eder."                     │
// │                                                                                      │
// │ Ölenlerin yerine gelen takviye kimseyi meşgul etmiyor — o birimler henüz sahada      │
// │ değil, tur sonunda geliyorlar. Dolayısıyla yalnızca ölü kaybı olan (yaralısı         │
// │ olmayan) bir ordu toplanma emri alsa bile tam güçle savaşabilir.                     │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// BEDEL EMRİN ÜSTÜNDE YAZILI. İki sebep: (1) emir listesi ve panel o sayıyı gösteriyor,
// iki yerde hesaplanmasın; (2) `butce.js` bedeli okuyabilsin diye — o dosya toplanma.js'i
// ithal etseydi ordu.js → butce.js → toplanma.js → ordu.js döngüsü doğardı.
// Bedel bir PLANLAMA rakamıdır: tur sonunda ordu daha çok yıpranmış olabilir, gerçek
// harcama o an yeniden hesaplanır.
export function toplanmaEmriVarMi(durum, parcaId) {
  return emirler(durum).some((e) => e.tip === 'toplanma' && e.kaynak === parcaId);
}

// Dönen: { ok: true } veya { ok: false, kod, sebep }
//   sahiplik | kapsam | gereksiz | emirvar | mesgul
export function toplanmaGecerliMi(durum, aktorId, parcaId) {
  const ordu = parcaOrdusu(durum, parcaId);
  if (!ordu || ordu.sahip !== aktorId)
    return { ok: false, kod: 'sahiplik', sebep: 'Burada senin askerin yok.' };
  if (durum.parcaSahipligi[parcaId] !== aktorId)
    return { ok: false, kod: 'kapsam', sebep: 'Burası senin değil.' };
  if (!toplanabilirMi(ordu))
    return {
      ok: false,
      kod: 'gereksiz',
      sebep: 'Bu ordu tam güçte — ne yaralısı var ne de kaybı.',
    };
  if (toplanmaEmriVarMi(durum, parcaId))
    return { ok: false, kod: 'emirvar', sebep: 'Bu orduya zaten toparlanma emri verdin.' };

  // Rezervasyon defteri: yaralıların HÂLÂ SERBEST olması gerekiyor. Oyuncu önce sağlamları
  // sefere yollayıp sonra yaralılara toplanma emri verebilir (sıra önemli değil) — ama
  // yaralılar da bir hareket emrine yazılmışsa toplanacak kimse kalmaz.
  const yarali = yaraliAl(ordu);
  const serbest = kullanilabilirBirimler(durum, parcaId);
  for (const tur of DENGE.BIRIM_SIRASI)
    if ((yarali[tur] || 0) > (serbest[tur] || 0))
      return {
        ok: false,
        kod: 'mesgul',
        sebep: 'Yaralı birliklerin bu tur yola çıkıyor. Önce o emri iptal et.',
      };

  return { ok: true };
}

export function toplanmaEmriVer(durum, aktorId, parcaId) {
  const gecerli = toplanmaGecerliMi(durum, aktorId, parcaId);
  if (!gecerli.ok) return { ok: false, kod: gecerli.kod, sebep: gecerli.sebep, durum };

  const ordu = parcaOrdusu(durum, parcaId);
  const eksik = eksikKadro(ordu);
  const yarali = yaraliAl(ordu);
  const emir = {
    tip: 'toplanma',
    sahip: aktorId,
    kaynak: parcaId,
    // YALNIZCA YARALILAR rezerve — sağlamlar savaşmaya devam etsin (yukarıdaki kutu).
    birimler: { ...yarali },
    eksik,
    yarali,
    // Seferberlik dalı (Görev 07) piyade yaralılarının bakımını ucuzlatıyor.
    bedel: toplanmaMaliyeti(eksik, yarali, seferberlikBedava(aktorArastirmasi(durum, aktorId))),
    // TOPLANMA USTASI (Görev 16 / Adım 5): komutanın yakınında bütçeye eklenen pay.
    // ⚠ BEDELE DEĞİL BURAYA yazılıyor: bedel tek gerçek kalsın, ekranla ayrışma imkânsız
    // olsun. Ekran bunu "komutan yanında +N bütçe" diye gösteriyor; `toplanmaAsamasi` da
    // aynı fonksiyondan (`toplanmaUstasiButcesi`) okuyor, yani iki taraf ayrışamaz.
    ekButce: toplanmaUstasiButcesi(durum, aktorId, parcaId),
  };
  return { ok: true, durum: { ...durum, emirler: emirler(durum).concat([emir]) } };
}

// Tek emri iptal eder. Rezervasyon da onunla birlikte kalkar, birimler yeniden emredilebilir.
//
// ⚠ GÖREV 15'TEN SONRA BU YALNIZCA TOPLANMA EMİRLERİ İÇİN ANLAMLI. Hareket emri kuyrukta
// beklemediği için iptal edilecek bir şey de kalmıyor: hamle gerçekleşti. Zincir emirlerini
// düşüren eski kural da kalktı (zincir yok).
export function emirKaldir(durum, sira) {
  const liste = emirler(durum);
  if (sira < 0 || sira >= liste.length) return durum;
  return { ...durum, emirler: liste.filter((_, i) => i !== sira) };
}

// ---- SAVUNMASIZ BIRAKMA UYARISI (§4.4'ün borcu) ----
// Garnizon/sefer ayrımı kaldırılırken tek faydası "oyuncu kendini yanlışlıkla savunmasız
// bırakmasın"dı ve bu, hareket ekranında bir uyarıya havale edilmişti. Borç burada kapanıyor.
//
// ENGELLEMEZ, UYARIR: parçadaki bütün ordu gönderiliyorsa ve parça bir DÜŞMAN parçasına
// sınırdaşsa true döner.
//
// İKİ PARÇA HÂLİNDE: kuralın kendisi `uyariGerekli`de, oyun durumunu okuyan sarmalayıcı
// burada. Sebep Görev 04'ün `eklenebilirMi` dersi: kuvvet seçici ekranı oyun durumunu
// tanımıyor (düz veri alıyor), ama kuralın iki ayrı yerde yazılması ekranla motorun
// ayrışmasına yol açıyor. Ekran `uyariGerekli`yi çağırır, motor `savunmasizKalirMi`yi;
// ikisi de aynı satırdan geçer.
export function uyariGerekli(eldeki, secilen, dusmanaSinirdas) {
  if (!dusmanaSinirdas) return false;
  for (const tur of DENGE.BIRIM_SIRASI)
    if ((eldeki[tur] || 0) - ((secilen && secilen[tur]) || 0) > 0) return false;
  return true;
}

// Parça bir düşman parçasına sınırdaş mı (kapsam dışı komşular sayılmaz).
export function dusmanaSinirdasMi(durum, aktorId, parcaId) {
  return komsular(parcaId).some((k) => kapsamdaMi(durum, k) && durum.parcaSahipligi[k] !== aktorId);
}

export function savunmasizKalirMi(durum, aktorId, kaynak, secilen) {
  return uyariGerekli(
    kullanilabilirBirimler(durum, kaynak),
    secilen,
    dusmanaSinirdasMi(durum, aktorId, kaynak)
  );
}

// ---- ORDU BÖLME ----
// Ordu bölünüp bir kısmı hareket ederse HASAR HAVUZU BİRİM SAYISINA ORANLA bölünür
// (görev belgesi §4, boşluk 7). Yoksa "yarısını gönder, hasarı geride bırak" diye bedava
// temizlik sömürüsü doğardı: yıpranmış orduyu ikiye ayırıp hasarı bir tarafa yıkmak.
//
// KADRO DA AYNI ORANLA bölünür (Görev 06 §5/1) — ama hesabı burada TEKRARLANMAZ,
// `toplanma.js kadroBol` çağrılır. İki kural aynı yerde tanımlı olmalı; Görev 05'in en
// pahalı hatası aynı hesabı üç yere elle kopyalamaktı.
export function orduBol(ordu, giden) {
  const toplam = birimSayisi(ordu.birimler);
  const gidenSayi = birimSayisi(giden);
  const havuz = ordu.hasarHavuzu || 0;
  const gidenHavuz = toplam === 0 ? 0 : (havuz * gidenSayi) / toplam;

  const kalanBirimler = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (ordu.birimler[tur] || 0) - (giden[tur] || 0);
    if (n > 0) kalanBirimler[tur] = n;
  }
  // SAĞLAMLAR ÖNCE GİDER (2026-07-31, Baki: "yaralı olmayan birlikler savaşmaya devam
  // etsin"). Oyuncu kaç birim göndereceğini seçiyor, hangilerinin yaralı olduğunu değil —
  // seçim doğal olanı yapıyor: sefere sağlam askerini yollarsın, yaralı geride kalır.
  // Sağlamlardan fazlası isteniyorsa aradaki fark yaralılardan tamamlanır.
  const yarali = yaraliAl(ordu);
  const saglam = saglamBirimler(ordu);
  const gidenYarali = {},
    kalanYarali = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const g = Math.max(0, (giden[tur] || 0) - (saglam[tur] || 0));
    if (g > 0) gidenYarali[tur] = g;
    const k = (yarali[tur] || 0) - g;
    if (k > 0) kalanYarali[tur] = k;
  }

  const kadro = kadroBol(ordu, giden);
  return {
    giden: {
      sahip: ordu.sahip,
      birimler: { ...giden },
      kadro: kadro.giden,
      yarali: gidenYarali,
      hasarHavuzu: gidenHavuz,
    },
    kalan: birimSayisi(kalanBirimler)
      ? {
          sahip: ordu.sahip,
          birimler: kalanBirimler,
          kadro: kadro.kalan,
          yarali: kalanYarali,
          hasarHavuzu: havuz - gidenHavuz,
        }
      : null,
  };
}
