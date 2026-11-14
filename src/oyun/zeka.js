// YAPAY ZEKÂ — KARAR FONKSİYONU (Görev 07 / Adım 3 — tasarım §9).
//
// TEK BEYİN, 80 AKTÖR (§9.1). 80 ayrı yapay zekâ yok: bir aktörün durumunu alıp en iyi
// hamleyi döndüren tek bir fonksiyon var, aktör sayısı kadar çalıştırılıyor. Aktörleri
// birbirinden ayıran şey kod değil, KİŞİLİK AĞIRLIKLARI (§9.4).
//
// SAF FONKSİYON — `muharebe.js` kalıbının aynısı: oyun durumunu OKUR, değiştirmez. Emirleri
// kuyruğa kim koyacak, hangi sırayla çözülecek — o `turDongusu.js`'in işi (Adım 5).
// Test edilebilirliğin tamamı buradan geliyor: bir kararı doğrulamak için tur çevirmek
// gerekmiyor.
//
// ---- ÜÇ DEĞİŞMEZ KURAL ----
//
// 1. İKİNCİ BİR MUHAREBE TAHMİNİ YAZILMAZ. Fayda formülündeki "kazanma olasılığı",
//    `muharebe.js muharebeTahmini`'nin döndürdüğü ÜSTÜNLÜK ORANIDIR. Görev 05'in en pahalı
//    hatası aynı kuralı üç yere kopyalamaktı; Görev 06 §13/1b'de o oranın kendisi bir kez
//    yanlış çıktı ve tek yerde durduğu için tek yerde düzeldi.
//
// 2. FORMÜLDE ÇIPLAK SAYI YOKTUR. Her katsayı `DENGE.ZEKA`'dan okunur; test bunu katsayıyı
//    değiştirip kararın değiştiğini görerek kanıtlıyor.
//
// 3. BELİRLENİMCİ. `Math.random` YOK; eşit puanlı hamleler arasındaki seçim ve zorluk
//    gürültüsü `rastgele.js` üzerinden. Aynı tohum + aynı durum → aynı karar. Bu olmadan
//    kayıttan yüklenen oyun farklı akar ve hata ayıklama imkânsızlaşır (§9/tuzak 4).

import { DENGE } from '../denge.js';
import { PARCALAR } from './veri.js';
import { kapsamdaMi, aktorParcalari } from './oyunDurumu.js';
import {
  birimSayisi,
  parcaOrdusu,
  kadroAl,
  yaraliAl,
  ilUretimHakki,
  siparisGecerliMi,
  siparisMaliyeti,
} from './ordu.js';
import {
  komsular,
  kullanilabilirBirimler,
  emredilebilirBirimler,
  dusmanaSinirdasMi,
} from './hareket.js';
import { kullanilabilirButce } from './butce.js';
import { eksikKadro, toplanabilirMi } from './toplanma.js';
import { ilTipi } from './garnizon.js';
import { muharebeTahmini } from './muharebe.js';
import { moralBonuslari } from './cozum.js';
import { aktorStatlari, aktorEtkileri } from './arastirma.js';
import { parcaGeliri } from './uretim.js';
import { ilTamamMi } from './fetih.js';
import { rastgeleKur } from './rastgele.js';
import { agirlik, kisilikUret } from './kisilik.js';
import { husumetBul, duelloEngeli } from './rekabet.js';
import {
  ITTIFAK,
  dusmanlar,
  savastaMi,
  ihanetliMi,
  tanidiklar,
  teklifGecerliMi,
  savasIlanGecerliMi,
  ittifakEsigi,
  kabulEsigi,
} from './diplomasi.js';

const Z = DENGE.ZEKA;

// Kişilik okuyucusu ve üreteci `kisilik.js`'te: `oyunDurumu.js` kişilik üretimini kurulumda
// çağırıyor ve bu dosyayı ithal etseydi oyunDurumu → zeka → oyunDurumu döngüsü doğardı
// (Görev 06'da `kadroAl` aynı sebeple ordu.js'e konmuştu). Buradan yeniden dışa açılıyor
// ki çağıranlar iki dosya tanımak zorunda kalmasın.
export { agirlik, kisilikUret };

// ---- HEDEFİN DEĞERİ (görev belgesi §5, boşluk 1) ----
//
// Parçanın kendi getirisi (nüfus + ekonomi) + o parçayı almakla İL TAMAMLANIYORSA bonus.
// İl bonusu var, çünkü oyunun kazanma birimi il: son parçayı almak haritada bir ili
// bütünüyle senin yapar ve §4.1'in il statları ancak o zaman tam işler.
export function hedefDegeri(durum, aktorId, hedef) {
  const g = parcaGeliri(hedef);
  let deger = g.nufus + g.ekonomi;

  // "Bu parçayı alırsam il tamamlanır mı" — parçayı geçici olarak bize verip soruyoruz.
  // Yeni bir kural yazılmadı; `fetih.js ilTamamMi` neyse o.
  const kod = PARCALAR[hedef].kod;
  const varsayim = { ...durum.parcaSahipligi, [hedef]: aktorId };
  if (ilTamamMi({ ...durum, parcaSahipligi: varsayim }, kod, aktorId)) deger += Z.IL_BONUSU;
  return deger;
}

// ---- GÖNDERİLEN KUVVETİN BEDELİ ----
// Ordunun satın alma bedeli (nüfus + ekonomi). Kaybedilirse bu kadarı çöpe gider; fayda
// formülünün risk terimi bunu (1 − üstünlük) ile çarpıyor.
export function kuvvetBedeli(birlikler) {
  let bedel = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birlikler && birlikler[tur]) || 0;
    if (n > 0) bedel += (DENGE.BIRIMLER[tur].nufus + DENGE.BIRIMLER[tur].ekonomi) * n;
  }
  return bedel;
}

// ---- AÇIKTA KALMA CEZASI (görev belgesi §5, boşluk 3) ----
//
// "Bu kuvveti gönderirsem arkam ne kadar açık kalır?" Ölçü: kaynak parçanın DÜŞMAN
// komşularındaki toplam kuvvetin, kaynakta GERİDE KALACAK kuvvete oranı.
//
//   geride kimse kalmıyorsa ve düşman varsa  → ceza en yüksek
//   düşman komşusu yoksa                     → ceza 0 (iç bölge, açıkta kalacak bir şey yok)
//
// Oran, `TAVAN` ile kırpılıyor: 20 kat üstün bir tehdit ile 200 kat üstün olan arasındaki
// fark kararı değiştirmiyor, ikisi de "gitme" diyor — kırpılmasaydı tek bir dev komşu
// aktörü tamamen felç ederdi.
export function aciktaKalmaCezasi(durum, aktorId, kaynak, giden) {
  if (!dusmanaSinirdasMi(durum, aktorId, kaynak)) return 0;

  let tehdit = 0;
  for (const k of komsular(kaynak)) {
    if (!kapsamdaMi(durum, k) || durum.parcaSahipligi[k] === aktorId) continue;
    const o = parcaOrdusu(durum, k);
    if (o && o.sahip !== aktorId) tehdit += birimSayisi(o.birimler);
  }
  if (tehdit === 0) return 0;

  const eldeki = birimSayisi(kullanilabilirBirimler(durum, kaynak));
  const kalan = Math.max(0, eldeki - birimSayisi(giden));
  return Math.min(Z.ACIKTA_TAVAN, tehdit / (kalan + 1));
}

// ---- ÜSTÜNLÜK (görev belgesi §5, boşluk 2) ----
//
// Muharebe motorunun tahminini ÇAĞIRIR. Boş/dost hedefte muharebe yok: üstünlük 1.00.
// ---- ⚠ TAHMİNİN İKİ AYRI CEVABI VAR: "NE KADAR ÜSTÜNÜM" VE "KAZANIYOR MUYUM" ----
//
// `muharebeTahmini` ikisini de döndürüyor ama Görev 07'den 2026-08-12'ye kadar yalnızca
// `ustunluk` kullanılıyordu; `kazanan` sessizce atılıyordu. Fark önemsiz değil: üstünlük
// "muharebe sonunda kaç birimim kalır / kaç birimi kalır" oranı, bozguna uğrayan savunan
// ise birlikleriyle ÇEKİLİYOR. Yani parçayı ALDIĞIN hâlde üstünlüğün 0.5'in altında
// kalabiliyor. Kapı bu yüzden kazanılabilir saldırıları da eliyordu (ölçüm: her tur ~35 tane).
//
// `hamleUstunlugu` ESKİ İMZASIYLA DURUYOR (düz sayı döner) — `testler/zeka.test.js` onu
// öyle çağırıyor ve üstünlüğün kendisini ölçen testlerin bozulması için sebep yok.
export function hamleKestirimi(durum, aktorId, kaynak, hedef, birlikler) {
  const hedefOrdu = parcaOrdusu(durum, hedef);
  // Boş ya da dost parça: muharebe yok, giriş serbest (üstünlük tanım gereği 1).
  if (!hedefOrdu || hedefOrdu.sahip === aktorId || birimSayisi(hedefOrdu.birimler) === 0)
    return { ustunluk: 1, kazanan: 'saldiran' };

  const savunanId = hedefOrdu.sahip;
  const t = muharebeTahmini({
    saldiran: { birimler: birlikler },
    savunan: { birimler: hedefOrdu.birimler, yarali: hedefOrdu.yarali },
    arazi: PARCALAR[hedef].arazi,
    moralBonuslari: moralBonuslari(durum, kaynak, hedef, aktorId, savunanId),
    statlar: { saldiran: aktorStatlari(durum, aktorId), savunan: aktorStatlari(durum, savunanId) },
    etkiler: { saldiran: aktorEtkileri(durum, aktorId), savunan: aktorEtkileri(durum, savunanId) },
  });
  return { ustunluk: t.ustunluk, kazanan: t.kazanan };
}

export function hamleUstunlugu(durum, aktorId, kaynak, hedef, birlikler) {
  return hamleKestirimi(durum, aktorId, kaynak, hedef, birlikler).ustunluk;
}

// ---- HAMLE ADAYLARI (Soru 2 → Baki'nin cevabı A) ----
//
// Kaynak parçadaki KULLANILABİLİR kuvvetin `DENGE.ZEKA.KUVVET_ADAYLARI` oranları, her
// geçerli komşu için. Tam arama §9.3'te bilerek dışlandı: 10 birimlik bir ordunun bir
// komşuya gönderebileceği kombinasyon yüzlerce, telefon bunu kaldırmaz.
//
// "Hiçbiri" ayrı bir aday DEĞİL — o zaten bütün adayların EN_AZ_PUAN'ın altında kalması,
// yani emir vermemek. Emir vermemek geçerli bir karardır (görev belgesi §5/10).
//
// HANGİ birimlerin gideceğini burası seçmiyor, yalnızca KAÇ tane: `orduBol` sağlamları
// önce gönderiyor (Görev 06) ve yapay zekâ da aynı kuraldan geçiyor.
function oranlaBol(eldeki, oran) {
  const secilen = {};
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = Math.floor((eldeki[tur] || 0) * oran);
    if (n > 0) {
      secilen[tur] = n;
      toplam += n;
    }
  }
  // Oran bir şey bırakmadıysa (küçük ordu × 0.5) en kalabalık türden bir tane gönder;
  // yoksa "yarısı" adayı küçük ordularda hiç üretilmez ve zekâ ya hepsini yollar ya hiç.
  if (toplam === 0) {
    let enCok = null;
    for (const tur of DENGE.BIRIM_SIRASI)
      if ((eldeki[tur] || 0) > 0 && (enCok === null || eldeki[tur] > eldeki[enCok])) enCok = tur;
    if (enCok) secilen[enCok] = 1;
  }
  return secilen;
}

// ---- KAYNAKLAR: DURAN ORDULAR + ZİNCİR VARIŞLARI (Görev 11) ----
// Her birliğin iki hamle hakkı var; ikincisi bir emrin VARIŞINDAN veriliyor. Zekâ da bu
// hakkı kullanmalı — yoksa oyuncu turda iki, zekâ bir hamle yapar ve denge oyuncunun
// lehine kayar (Baki'nin isteği kuralın kendisi, bir oyuncu ayrıcalığı değil).
//
// Kaynak listesi bu yüzden iki kümeden: sahip olduğu parçalar (duran ordu) ve bu tur
// emir gönderdiği hedefler (oraya varacak birlikler). İkincisi henüz onun toprağı
// olmayabilir — zaten fethetmeye gidiyor.
// ⚠ GÖREV 15: KUYRUK OKUMASI KALKTI. Eskiden bekleyen emirlerin VARIŞ noktaları da kaynak
// sayılıyordu (zincir adayı doğsun diye). Hamle artık anında çözüldüğü için o parçalar
// zaten aktörün toprağı; `aktorParcalari` onları kendiliğinden veriyor. İkinci geçiş
// böylece hayalî değil gerçek haritaya bakıyor.
function hamleKaynaklari(durum, aktorId) {
  return aktorParcalari(durum, aktorId).slice().sort();
}

export function adayHamleler(durum, aktorId) {
  const adaylar = [];
  for (const kaynak of hamleKaynaklari(durum, aktorId)) {
    // Duran ordu ya da zincir havuzu — hangisi varsa. `emredilebilirBirimler` ikisini
    // topluyor; `hareketGecerliMi` hangisinden besleneceğine kendi karar veriyor.
    const eldeki = emredilebilirBirimler(durum, aktorId, kaynak);
    if (birimSayisi(eldeki) === 0) continue;

    for (const hedef of komsular(kaynak)) {
      // KENDİ parçasına saldırmaz. Dost parçaya takviye taşımak da bir hamle ama zekânın
      // fayda formülü fetih üstüne kurulu (§9.1); takviye Görev 08'in işi (diplomasi ve
      // cephe yönetimiyle birlikte anlamlı olur). Burada yazılsaydı ölçülemeyen bir davranış
      // eklenirdi ve "zekâ neden hiç saldırmıyor" sorusunun cevabı gizlenirdi.
      if (!kapsamdaMi(durum, hedef) || durum.parcaSahipligi[hedef] === aktorId) continue;
      // KUTSAL SAVAŞ KISITI (Görev 08 / §11): üçüncü taraf düellonun cephesine giremez.
      // Kural `hareket.js`'te ve son söz orada; burada ADAY ÜRETİLMİYOR ki zekâ hamle
      // hakkını reddedilecek bir emre yakmasın ve fayda formülü hayalî bir hedefi
      // puanlamasın. Kuralın kendisi tek yerde, bu yalnızca erken eleme.
      if (duelloEngeli(durum, aktorId, hedef)) continue;

      const gorulen = new Set();
      for (const oran of Z.KUVVET_ADAYLARI) {
        const birlikler = oranlaBol(eldeki, oran);
        if (birimSayisi(birlikler) === 0) continue;
        // Aynı bölüşümü iki kez puanlama (küçük orduda 1.0 ve 0.5 aynı sonucu verebilir).
        const imza = DENGE.BIRIM_SIRASI.map((t) => birlikler[t] || 0).join('/');
        if (gorulen.has(imza)) continue;
        gorulen.add(imza);
        adaylar.push({ kaynak, hedef, birlikler });
      }
    }
  }
  return adaylar;
}

// ---- CEPHE UZAKLIĞI (Görev 08 / Soru 4 → Baki'nin cevabı A) ----
//
// Aktörün her parçası için: DÜŞMANA kaç adım uzakta. Ölçü YENİ DEĞİL, komşuluk grafiğinin
// kendisi — takviye kuralı bunun üstüne kuruluyor.
//
//   0        → parçanın düşman (ya da tarafsız) komşusu var: BURASI CEPHE
//   1, 2, …  → cepheye kaç dost parça atlayarak varılır
//   Infinity → o parçadan cepheye dost topraklardan ulaşılamıyor (kopuk ada)
//
// Genişleme YALNIZCA KENDİ PARÇALARI üzerinden: ordu düşman toprağından geçemez, dolayısıyla
// düşman parçasının üstünden ölçülen bir uzaklık yalan söylerdi.
//
// ⚠ BU FONKSİYON HENÜZ KARAR VERMİYOR. Görev 08 / Adım 1 ölçümü bunu çağırıyor
// (`scripts/sahne-olcum.js`); `zekaEmirleri`'ne Adım 8'de bağlanacak. Ölçüm betiği kendi
// kopyasını yazsaydı §10/4'ün tuzağına düşerdik — aynı kural iki yerde tutulmaz.
export function cepheUzakligi(durum, aktorId) {
  const benim = aktorParcalari(durum, aktorId);
  const benimKume = new Set(benim);
  const uzaklik = {};
  const kuyruk = [];

  for (const pid of benim) {
    if (dusmanaSinirdasMi(durum, aktorId, pid)) {
      uzaklik[pid] = 0;
      kuyruk.push(pid);
    }
  }

  // Genişlik öncelikli arama — her parçaya en kısa yoldan bir kez uğranır.
  for (let i = 0; i < kuyruk.length; i++) {
    const pid = kuyruk[i];
    for (const k of komsular(pid)) {
      if (!benimKume.has(k) || uzaklik[k] !== undefined) continue;
      uzaklik[k] = uzaklik[pid] + 1;
      kuyruk.push(k);
    }
  }

  for (const pid of benim) if (uzaklik[pid] === undefined) uzaklik[pid] = Infinity;
  return uzaklik;
}

// ---- TAKVİYE ADAYLARI ----
//
// TEK YÖNLÜ KURAL, üç şartın hepsi birden:
//   1. Kaynak parça CEPHEDE OLMAYACAK (uzaklık > 0) — cephedeki ordu savunmasını boşaltmaz
//   2. Hedef parça CEPHEYE DAHA YAKIN olacak (uzaklık kesin küçük) — kuvvet yalnızca ileri akar
//   3. Kaynakta en az `EN_AZ_KUVVET` birim olacak — tek birimlik yürüyüş hamle hakkını yakar
//
// 2. ŞART SALINIMI TANIM GEREĞİ İMKÂNSIZ KILIYOR: her takviye uzaklığı en az 1 azaltır,
// azalan bir tam sayı dizisi geri dönemez. Görev belgesi §10/10'un uyardığı "ordu ileri
// geri gidip geliyor" tuzağı bir kuralla kapanıyor, bir sayaçla değil.
//
// KUVVET BÖLÜNMEZ (`TAKVIYE.KUVVET_ADAYLARI` tek elemanlı): gönderen parçanın düşman
// komşusu yok, yani geride tutacak bir cephesi de yok.
export function takviyeAdaylari(durum, aktorId, hazirUzaklik) {
  const T = Z.TAKVIYE;
  if (!T.ACIK) return [];

  // Uzaklık haritası pahalı değil ama tur başına aktör sayısı kadar isteniyor; çağıran
  // zaten hesapladıysa yeniden hesaplanmıyor.
  const uzaklik = hazirUzaklik || cepheUzakligi(durum, aktorId);
  const adaylar = [];

  for (const kaynak of aktorParcalari(durum, aktorId)) {
    if (!(uzaklik[kaynak] > 0)) continue; // cephedeki parça takviye göndermez
    const ordu = parcaOrdusu(durum, kaynak);
    if (!ordu || ordu.sahip !== aktorId) continue;

    const eldeki = kullanilabilirBirimler(durum, kaynak);
    if (birimSayisi(eldeki) < T.EN_AZ_KUVVET) continue;

    for (const hedef of komsular(kaynak)) {
      if (!kapsamdaMi(durum, hedef) || durum.parcaSahipligi[hedef] !== aktorId) continue;
      if (!(uzaklik[hedef] < uzaklik[kaynak])) continue; // yalnızca cepheye DOĞRU

      for (const oran of T.KUVVET_ADAYLARI) {
        const birlikler = oranlaBol(eldeki, oran);
        if (birimSayisi(birlikler) === 0) continue;
        adaylar.push({ kaynak, hedef, birlikler, takviye: true });
      }
    }
  }
  return adaylar;
}

// ---- FAYDA FORMÜLÜ (§9.1'in somutlanmış hâli) ----
//
//   puan = DEGER   × açgözlülük   × hedefin değeri × üstünlük
//        − BEDEL   × temkin       × gönderilen kuvvetin bedeli × (1 − üstünlük)
//        − ACIKTA  × temkin       × açıkta kalma cezası
//        + HUSUMET × husumet      × (hedef hasım mı)
//        + SALDIRI × saldırganlık
//
// HUSUMET TERİMİ GÖREV 08'DE AÇILDI. Görev 07'de hep 0'dı (tablo yoktu); artık
// `veri/husumetler.js` var ve `hasimMi` gerçek cevap veriyor. FORMÜLÜN TEK SATIRI
// DEĞİŞMEDİ — terim baştan yerinde durduğu için açılışın maliyeti bir bayrak oldu.
// ---- UMUTSUZ SALDIRI EŞİĞİ (Görev 12) ----
// Kişiliğe bağlı: temkinli aktör büyük üstünlük görmeden saldırmaz. Gerekçesi ve Baki'nin
// şikâyeti `denge.js UMUTSUZ_SALDIRI` notunda.
// ---- EŞİK MAÇ İLERLEDİKÇE DÜŞÜYOR (2026-08-12, Baki: "cesaretleri biraz artsın") ----
// `durum` VERİLİRSE bitirme iştahı eşiği `CESARET.ESIK_SONUMU` oranında indiriyor: geç
// oyunda aktör daha kötü ihtimalleri de göze alıyor, çünkü beklemenin bedeli artıyor.
// `durum` verilmezse eski davranış birebir duruyor — `testler/zeka.test.js` eşiği tek
// argümanla ölçüyor ve o testlerin kişilik ölçümü maçın turundan bağımsız olmalı.
export function umutsuzEsigi(kisilik, durum) {
  const K = Z.UMUTSUZ_SALDIRI;
  if (!K || !K.ACIK) return 0;
  const taban = K.TABAN + K.TEMKIN_PAYI * agirlik(kisilik, 'temkin');
  const C = Z.CESARET;
  if (!durum || !C || !C.ACIK || !C.ESIK_SONUMU) return taban;
  return taban * (1 - C.ESIK_SONUMU * bitirmeIstahi(durum));
}

// ---- BİTİRME İŞTAHI (2026-08-08) ----
//
// Maç uzadıkça yapay zekânın risk iştahı artar: 0 (maç başı) → 1 (DOYMA_TURU ve sonrası).
// Tur sınırı kaldırıldığı için gereken şey bu — gerekçesi `denge.js BITIRME` notunda.
//
// TEK KAYNAK: hamle puanı da savaş ilanı puanı da buradan geçiyor. İki yerde iki eğri
// olsaydı "saldırmak isteyen ama savaş açmayan" bir zekâ doğardı.
export function bitirmeIstahi(durum) {
  const B = Z.BITIRME;
  if (!B || !B.ACIK) return 0;
  const doyma = B.DOYMA_TURU || 0;
  if (doyma <= 0) return 1;
  return Math.min(1, Math.max(0, ((durum && durum.tur) || 1) / doyma));
}

// İştahın terimlere uygulanmış hâli. Ayrı fonksiyon, çünkü ölçüm betikleri "iştah açık /
// kapalı" karşılaştırmasını buradan yapıyor ve testler katsayıların gerçekten kaydığını
// tek satırda doğrulayabiliyor.
export function bitirmeCarpanlari(durum) {
  const B = Z.BITIRME || {};
  const istah = bitirmeIstahi(durum);
  return {
    istah,
    // Saldırı terimi büyür.
    saldiri: 1 + ((B.SALDIRI_CARPANI || 1) - 1) * istah,
    // Açıkta kalma cezası söner — kilidin asıl anahtarı.
    acikta: 1 - (B.TEMKIN_SONUMU || 0) * istah,
    // Savaş ilanının temel iştahı büyür.
    ilan: 1 + ((B.ILAN_CARPANI || 1) - 1) * istah,
  };
}

// Puan VE üstünlük birlikte. İkisini ayrı ayrı sormak `muharebeTahmini`'yi (tam bir
// muharebe simülasyonu) aday başına İKİ KEZ çalıştırmak olurdu — hamle uzayı 2 × komşu
// sayısı, yani telefonda ölçülebilir bir bedel.
export function hamleDegerlendir(durum, aktorId, hamle, kisilik) {
  const T = Z.TERIM;
  const B = bitirmeCarpanlari(durum);
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  const temkin = agirlik(kisilik, 'temkin');
  const saldirganlik = agirlik(kisilik, 'saldirganlik');

  const kestirim = hamleKestirimi(durum, aktorId, hamle.kaynak, hamle.hedef, hamle.birlikler);
  const ustunluk = kestirim.ustunluk;
  const deger = hedefDegeri(durum, aktorId, hamle.hedef);
  const bedel = kuvvetBedeli(hamle.birlikler);
  const acikta = aciktaKalmaCezasi(durum, aktorId, hamle.kaynak, hamle.birlikler);

  let puan = T.DEGER * acgozluluk * deger * ustunluk;
  puan -= T.BEDEL * temkin * bedel * (1 - ustunluk);
  // İki terim bitirme iştahıyla kayıyor: açıkta kalma korkusu sönüyor, saldırı isteği
  // büyüyor. Öteki üç terim (değer, bedel, husumet) dokunulmadan duruyor — iştah aktörü
  // cesaretlendiriyor, hesabını bozmuyor.
  puan -= T.ACIKTA * temkin * acikta * B.acikta;
  puan += T.HUSUMET * agirlik(kisilik, 'husumet') * (hasimMi(durum, aktorId, hamle.hedef) ? 1 : 0);
  puan += T.SALDIRI * saldirganlik * B.saldiri;

  // ---- ⚠ ELİNDE GÜÇ VARKEN ACIMA (2026-08-12, Baki) ----
  //
  // > *"Ellerinde güç varken acımayacak yapılar ekleyelim."*
  //
  // Ezici üstünlükteki bir saldırı, puan sıralamasında sıradan bir takviye hamlesiyle
  // yarışıyordu ve kaynak başına tek emir kuralı yüzünden bazen takviye kazanıyordu.
  // Ölçüm adayların **%15–28'inin** ezici olduğunu gösterdi — yani kaçırılan fırsat bol.
  // Dürtü BİTİRME İŞTAHIYLA büyüyor: maç ilerledikçe acımasızlık artıyor, ki bu Baki'nin
  // ikinci isteğini (*"oyunu daha hızlı bitirmeye yöneltecek"*) aynı satırdan karşılıyor.
  //
  // Eşik uydurulmadı: `MUHAREBE.USTUNLUK_ESIGI` — savaş odasında oyuncuya "ÜSTÜN" yazan
  // sayının ta kendisi. Zekânın "ezici" dediği şey ile oyuncunun ekranda gördüğü şey aynı.
  const C = Z.CESARET || {};
  if (C.ACIK && ustunluk >= DENGE.MUHAREBE.USTUNLUK_ESIGI) puan += (C.EZICI_DURTU || 0) * B.saldiri;

  // ---- KAPI ARTIK "KAZANIYOR MUYUM" DİYE DE SORUYOR ----
  // Kazandığını gören saldırı UMUTSUZ SAYILMAZ, üstünlüğü eşiğin altında olsa bile:
  // bozguna uğrayan savunan birlikleriyle çekildiği için parçayı aldığın hâlde üstünlük
  // düşük çıkabiliyor. Ölçüm bu yüzden her tur ~35 kazanılabilir saldırının reddedildiğini
  // gösterdi. Bu, cesareti APTALLIĞA KAYMADAN artırmanın tek dürüst yolu — tanım gereği
  // kazanılan bir saldırıya "umutsuz" demek ölçümün kendisiyle çelişir.
  const kazaniyor = C.ACIK && C.KAZANANI_SOR && kestirim.kazanan === 'saldiran';
  // `umutsuz` yalnızca GERÇEK bir muharebe için anlamlı. Boş ya da dost parçaya girişte
  // üstünlük tanım gereği 1 (bkz. `hamleKestirimi`), yani kapı orada hiç kapanmıyor.
  return {
    puan,
    ustunluk,
    kazanan: kestirim.kazanan,
    umutsuz: !kazaniyor && ustunluk < umutsuzEsigi(kisilik, durum),
  };
}

// Eski imza — yalnızca puan. Testler ve ölçüm betikleri bunu kullanıyor.
export function hamlePuani(durum, aktorId, hamle, kisilik) {
  return hamleDegerlendir(durum, aktorId, hamle, kisilik).puan;
}

// ---- TAKVİYE PUANI (Görev 08 / Adım 8) ----
//
//   puan = TEHDIT   × hedefteki tehdit açığı
//        + YAKINLIK × (kaynağın cephe uzaklığı − hedefin cephe uzaklığı)
//
// ┌─ ÜÇ KARAR VE GEREKÇELERİ ───────────────────────────────────────────────────────────┐
// │                                                                                      │
// │ 1. "× GÖNDERİLEN KUVVET" TERİMİ YAZILMADI. Görev belgesi §Adım 8 onu sayıyordu ama   │
// │    takviyede kuvvet BÖLÜNMÜYOR (`TAKVIYE.KUVVET_ADAYLARI` tek elemanlı): aynı        │
// │    kaynağın bütün adaylarında kuvvet AYNI sayı. Sabit bir çarpan sıralamayı hiç      │
// │    değiştirmez, yalnızca eşik karşılaştırmasını bulanıklaştırırdı. "En az kaç birim  │
// │    yürür" sorusunun cevabı zaten `TAKVIYE.EN_AZ_KUVVET`.                             │
// │                                                                                      │
// │ 2. KİŞİLİK AĞIRLIĞI KULLANILMIYOR. Takviye bir RİSK kararı değil, bir düzen kararı:  │
// │    iç bölgede duran ordu hiçbir şey yapmıyor, cepheye gitmesi her kişilik için       │
// │    doğru. Saldırganlık/temkin buraya karışsaydı ürkek aktörler ordusunu sonsuza      │
// │    kadar iç bölgede tutardı — düzeltmeye çalıştığımız kusurun ta kendisi.            │
// │                                                                                      │
// │ 3. SALDIRI PUANIYLA AYNI ÖLÇEKTE OLMASI GEREKMİYOR. Sebebi şaşırtıcı biçimde temiz:  │
// │    iki aday kümesi TANIM GEREĞİ AYRIK. `adayHamleler` yalnızca kendisinin OLMAYAN    │
// │    komşusu bulunan parçadan aday üretiyor (yani cephe uzaklığı 0), `takviyeAdaylari` │
// │    yalnızca öyle bir komşusu OLMAYANDAN (uzaklık > 0). Aynı parça ikisine birden     │
// │    giremez ve "tek kaynaktan tek emir" kuralı kaynağa göre çalıştığı için iki liste  │
// │    hiç yarışmıyor. Ölçek yalnızca `TAKVIYE.EN_AZ_PUAN` eşiğine karşı anlamlı.        │
// └──────────────────────────────────────────────────────────────────────────────────────┘
export function takviyePuani(durum, aktorId, hamle, uzaklik) {
  const T = Z.TAKVIYE;
  const u = uzaklik || cepheUzakligi(durum, aktorId);
  const yaklasma = (u[hamle.kaynak] || 0) - (u[hamle.hedef] || 0);
  return T.TERIM.TEHDIT * tehditAcigi(durum, aktorId, hamle.hedef) + T.TERIM.YAKINLIK * yaklasma;
}

// Hedef parçadaki TEHDİT AÇIĞI: düşman komşulardaki kuvvet ÷ (oradaki kuvvet + 1).
// `aciktaKalmaCezasi`'nın TERSTEN OKUNUŞU — görev belgesi §3 "takviye kararı bunu tersinden
// okuyacak, yeni tehdit ölçüsü yazılmayacak" diyordu. Orada soru "gidersem arkam açık kalır
// mı", burada "oraya kuvvet lazım mı"; ölçü aynı, tavanı da aynı gerekçeyle kırpılıyor.
function tehditAcigi(durum, aktorId, parcaId) {
  let tehdit = 0;
  for (const k of komsular(parcaId)) {
    if (!kapsamdaMi(durum, k) || durum.parcaSahipligi[k] === aktorId) continue;
    const o = parcaOrdusu(durum, k);
    if (o && o.sahip !== aktorId) tehdit += birimSayisi(o.birimler);
  }
  if (tehdit === 0) return 0;
  const savunma = birimSayisi(kullanilabilirBirimler(durum, parcaId));
  return Math.min(Z.TAKVIYE.TEHDIT_TAVANI, tehdit / (savunma + 1));
}

// ---- HASIM MI (Görev 08 / §11) ----
//
// Görev 07'de bu fonksiyon `return false` idi ve notu şöyleydi: *"hasım tablosu Görev
// 08'de geliyor; fonksiyon yerinde duruyor ki o gün formül değil YALNIZCA burası değişsin."*
// Söz tutuldu: fayda formülünün tek satırına dokunulmadı, yalnızca bu gövde doldu.
//
// Hedefin SAHİBİNE bakılıyor, hedefin coğrafi iline değil: Ordu'nun ordusu Sivas'ta
// duruyorsa da Giresun için orası hasım toprağıdır.
function hasimMi(durum, aktorId, hedef) {
  return !!husumetBul(aktorId, durum.parcaSahipligi[hedef]);
}

// ---- KARAR ----
//
// Bir aktörün bu turda vereceği hareket emirleri.
//
// TEK PARÇADAN TEK EMİR: bir parçanın ordusu bölünüp iki hedefe birden gönderilmiyor.
// Sebep hamle uzayı değil, okunabilirlik — zekânın kuvvetini üçe bölüp üç yeri birden
// zorlaması, oyuncunun haritada "ne oluyor" diyemeyeceği bir karmaşa üretir. Kaynak bir
// kez kullanıldıktan sonra o parçanın kalan adayları atlanıyor.
//
// GÜRÜLTÜ ZORLUK KADEMESİNDEN (§9.4: "zorluk = ağırlık ayarı"). Kolayda aktör en iyi
// hamleyi BULUR ama hep onu oynamaz; zorda gürültü 0, her zaman en iyisini oynar.
// "Aptal yapay zekâ" yazmadan zorluk düşürmenin dürüst yolu budur.
export function zekaEmirleri(durum, aktorId, kisilik, tohum, zorluk) {
  const kademe = Z.ZORLUK[zorluk] || Z.ZORLUK[Z.VARSAYILAN_ZORLUK];
  // Üreteç aktör kimliğine de bağlı: aynı turda iki aktör aynı gürültüyü almasın.
  const uretec = rastgeleKur(tohum >>> 0, (tohum + sayisalKimlik(aktorId)) >>> 0);

  // ---- İKİ AYRI ADAY KÜMESİ, TEK SIRALAMA (Görev 08 / Adım 8) ----
  // Saldırı adayları cephe parçalarından, takviye adayları iç bölgeden geliyor; ikisi
  // AYRIK (bkz. `takviyePuani`'nın 3. notu). Tek listede sıralanmalarının sebebi ortak
  // "tek kaynaktan tek emir" kuralı — iki ayrı döngü yazılsaydı o kural iki yerde
  // yaşardı ve bir gün ayrışırdı.
  const uzaklik = cepheUzakligi(durum, aktorId);
  const adaylar = adayHamleler(durum, aktorId).concat(takviyeAdaylari(durum, aktorId, uzaklik));

  const puanli = adaylar.map((hamle) => {
    // UMUTSUZ SALDIRI (Görev 12): kaybedeceği belli olan hamle aday olmaktan çıkıyor.
    // Elemek puanı düşürmekten farklı: düşürülen puan, hedef yeterince değerliyse yine
    // en yükseği olabilirdi — Baki'nin şikâyet ettiği çıkmaz tam olarak buydu.
    let umutsuz = false;
    let ham;
    if (hamle.takviye) {
      ham = takviyePuani(durum, aktorId, hamle, uzaklik);
    } else {
      const d = hamleDegerlendir(durum, aktorId, hamle, kisilik);
      ham = d.puan;
      umutsuz = d.umutsuz;
    }
    // Gürültü puanın ORANI olarak ekleniyor: küçük puanlı hamlelerde küçük, büyüklerde
    // büyük. Sabit bir sapma olsaydı kolay kademede zekâ yalnızca ufak kararlarda
    // saçmalar, büyük kararlarda hep doğru oynardı.
    const sapma = kademe.gurultu > 0 ? uretec.aralik(-kademe.gurultu, kademe.gurultu) : 0;
    return { ...hamle, puan: ham + Math.abs(ham) * sapma, hamPuan: ham, umutsuz };
  });

  // Yüksek puan önce; eşitlikte KİMLİK sırası — belirlenimci olmak zorunda (§9/tuzak 4).
  puanli.sort(
    (a, b) =>
      b.puan - a.puan ||
      (a.kaynak < b.kaynak ? -1 : a.kaynak > b.kaynak ? 1 : 0) ||
      (a.hedef < b.hedef ? -1 : 1)
  );

  const hareketler = [];
  const kullanilanKaynak = new Set();
  for (const h of puanli) {
    // EŞİK TÜRE GÖRE. Görev 07'de tek eşik vardı ve sıralı listede `break` etmek doğruydu;
    // artık iki eşik var (saldırı ve takviye ayrı ölçekte olabilir) ve düşük puanlı bir
    // saldırının arkasında eşiğini geçen bir takviye durabilir. `break` onu sessizce yerdi.
    const esik = h.takviye ? Z.TAKVIYE.EN_AZ_PUAN : Z.EN_AZ_PUAN;
    if (h.umutsuz) continue;
    if (h.puan < esik) continue;
    if (kullanilanKaynak.has(h.kaynak)) continue;
    kullanilanKaynak.add(h.kaynak);
    hareketler.push({
      kaynak: h.kaynak,
      hedef: h.hedef,
      birlikler: h.birlikler,
      puan: h.puan,
      takviye: !!h.takviye,
    });
  }
  return { hareketler };
}

// Aktör kimliği "34" gibi bir il kodu; üretece katmak için sayıya çevriliyor.
// Kodun kendisi yeterli — 1–81 arası, çakışma yok.
function sayisalKimlik(aktorId) {
  const n = parseInt(aktorId, 10);
  return Number.isFinite(n) ? n : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EKONOMİ KARARLARI (Görev 07 / Adım 4 — tasarım §9.1: "aynı fayda hesabıyla")
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// DEĞİŞMEZ KURAL: yapay zekânın verdiği her emir, oyuncunun emirlerinin geçtiği AYNI
// doğrulamadan geçer — `siparisGecerliMi`, `hareketGecerliMi`, `butce.js`. Buradaki
// fonksiyonlar yalnızca NE İSTENDİĞİNİ söyler; isteğin geçerli olup olmadığına karar veren
// yer değişmedi. İkinci bir yol açılsaydı zekâ sanayi sınırını ya da bütçeyi sessizce
// çiğneyebilirdi ve bu, oyuncunun asla fark edemeyeceği bir hile olurdu (§9/tuzak 5).

// ---- ÜRETİM KARARI (görev belgesi §5, boşluk 5 ve 6) ----
//
// HANGİ BİLEŞİM: §4.5'in "hangi il hangi orduyu doğurur" tablosu. Belge zaten bu tablonun
// yapay zekânın üretim referansı olduğunu söylüyor; yeni bir bileşim mantığı İCAT EDİLMEDİ,
// garnizonun kullandığı `DENGE.GARNIZON.KARISIM` aynen kullanılıyor.
//
// NEREDE: sanayi sınırının izin verdiği, DÜŞMANA EN YAKIN kendi parçasında. "En yakın"ın
// ölçüsü basit ve ucuz: parçanın düşman komşusu var mı. Cephedeki parçaya basılan asker
// aynı tur savunmaya katılır; iç bölgeye basılan asker cepheye yürümek için tur harcar.
//
// Dönen: { parcaId, siparis } veya null (parası yok / sanayi hakkı yok / uygun parça yok)
// ---- ÇEVREMDEKİ TEHDİT (2026-08-12) ----
//
// Aktörün cephesindeki **EN GÜÇLÜ TEK DÜŞMAN YIĞINI**.
//
// ⚠ İLK DENEME TOPLAM ALIYORDU VE FREN HİÇ ÇALIŞMADI — ölçüm bunu anında gösterdi
// (toplam ordu 5648'den 5648'e, yani sıfır fark). Sebebi öğretici: 8 komşusu olan bir
// aktörün "toplam tehdidi" 8 × 39 = ~300 çıkıyor, kendi ordusu 39; `39 ≥ 1.2 × 300`
// koşulu hiçbir zaman sağlanmıyordu. Üstelik ölçü SİMETRİK OLARAK ŞİŞİYOR: o sekiz
// komşunun her biri de beni kendi tehdidine ekliyor, yani herkes birbirini "kuşatılmış"
// sanıyor ve sonsuza kadar asker basıyor.
//
// Doğru soru "etrafımdaki bütün ordular üstüme gelse ne olur" değil — o zaten olmuyor.
// Doğru soru **"tek bir cephede karşıma çıkabilecek en büyük kuvvet ne"**, çünkü muharebe
// parça parça oluyor ve savunma da saldırı da tek cephede kuruluyor.
//
// Barıştaki komşu da sayılıyor ve bu bilinçli: barış bir tur içinde bozulabiliyor
// (Görev 11'in savaş ilanı kapısı), yani yanı başındaki orduyu yok saymak saflık olurdu.
export function cevredekiTehdit(durum, aktorId) {
  const gorulen = new Set();
  let enBuyuk = 0;
  for (const pid of aktorParcalari(durum, aktorId))
    for (const k of komsular(pid)) {
      if (gorulen.has(k)) continue;
      gorulen.add(k);
      const sahip = durum.parcaSahipligi[k];
      if (!sahip || sahip === aktorId) continue;
      const o = parcaOrdusu(durum, k);
      const n = o ? birimSayisi(o.birimler) : 0;
      if (n > enBuyuk) enBuyuk = n;
    }
  return enBuyuk;
}

// Aktörün sahadaki toplam birlik sayısı (duran ordular).
function toplamKuvvet(durum, aktorId) {
  let toplam = 0;
  for (const pid of aktorParcalari(durum, aktorId)) {
    const o = parcaOrdusu(durum, pid);
    if (o) toplam += birimSayisi(o.birimler);
  }
  return toplam;
}

// ---- ⚠ ÜRETİM FRENİ (2026-08-12, Baki'nin şikâyeti) ----
//
// > *"İller yakınındaki bir il asker bastığında o basıyor, diğeri basıyor, döngüye
// > giriyorlar; 100–200 askere kadar devam ediyorlar. Oyun başı için kesinlikle
// > azaltılsın."*
//
// ÖLÇÜLDÜ VE ŞİKÂYET BİREBİR DOĞRUYDU (`veri/URETIM-NOTU.md`, 2026-08-12 girdisi): orta
// zorlukta en büyük yığın 60 turda **10 → 258** birime çıkıyor, ortalama ordu 3 → 39.
//
// SEBEBİ BU FONKSİYONDA BİR EKSİKTİ: üretim kararı "yeterince askerim var mı?" diye HİÇ
// sormuyordu. Bütçenin `URETIM_PAYI` kadarı her tur, koşulsuz, orduya gidiyordu. Herkes
// aynı kuralı işlettiği için iki komşu da aynı hızda büyüyor, aradaki ORAN hiç değişmiyor
// ve kimse saldıramıyordu — silahlanma yarışının tanımı.
//
// Ölçümün gösterdiği kilit: saldırı adaylarının %63–82'si "umutsuz" diye eleniyor ve
// elenenlerin %97.6'sı GERÇEKTEN kaybediyor. Yani kapı haklı; sorun kapıda değil, kimsenin
// üstünlük kuramamasında.
//
// FREN: toplam kuvvetim, çevremdeki toplam tehdidin `KAT` katını aşıyorsa bu tur asker
// basmıyorum. Para havuzda kalıyor ve araştırmaya akıyor (§8'de araştırma aşaması üretimden
// önce geliyor, havuz büyüdükçe payı da büyüyor).
//
// ⚠ NEDEN TOPLAM ÜZERİNDEN, CEPHE BAŞINA DEĞİL — "FIRSAT YARATMAK" BURADAN ÇIKIYOR.
// Baki ayrıca *"fırsatlar yaratılsın"* dedi. Fren TOPLAM kuvveti sınırlıyor ama zekâ
// ordusunun %89'unu zaten TEK YIĞINDA topluyor (ölçüldü). Yani toplamda 1.2 kat olan bir
// aktör, tek cephede rahatlıkla 3 kat olabiliyor — fetih için gereken oran bu. Cephe
// başına sınır konsaydı yoğunlaşma cezalandırılır ve fırsat üretmek imkânsızlaşırdı.
//
// EN_AZ: tehdidi olmayan iç bölge aktörü bile bu kadar birlik bulundurur. Sıfır olsaydı
// iç iller ordusuz kalır, cephe bir anda içeri sarktığında savunmasız yakalanırlardı.
// ---- ⚠ İKİ ÇIPA GEREKTİ: ORAN TEK BAŞINA TIRMANMAYI DURDURMUYOR ----
//
// İlk hâli yalnızca orandı (`kuvvet ≥ KAT × tehdit`) ve ölçüm yığınları 258'den 131'e
// indirdi — ama BÜYÜME DEVAM ETTİ. Sebebi tasarımın kendisinde: oran tabanlı bir tavanı
// İKİ TARAF DA uygularsa geri besleme doğuyor. A, B'nin 1.2 katına çıkıyor; B artık
// geride kaldığı için A'nın 1.2 katına çıkıyor; A yine geride kalıyor… Tırmanma yavaşlıyor
// ama durmuyor. Oranın çıpası yok.
//
// İKİNCİ ÇIPA TOPRAK: bir aktörün ordusu elindeki parça sayısıyla sınırlı. Baki'nin
// şikâyetinin özü buydu — *"bazı parça sayısı az iller oyun sonlarına doğru yapsa anlarım"*
// yani 3 parçalı bir ilin 100 askeri olması saçma, 20 parçalı bir imparatorluğun olması
// normal. Toprak çıpası tam bu cümleyi kodluyor.
//
//   tavan = max(EN_AZ, min(KAT × en güçlü komşu yığını, PARCA_BASINA × parça sayısı))
//
// `min` bilinçli: tehdit küçükse tavan da küçük (boşuna asker besleme), tehdit devasa
// olsa bile toprağının kaldıramayacağı orduyu kurma. Küçük bir aktör dev bir komşunun
// yanında toprak çıpasına takılıp yetişemez ve fethedilir — bu bir kusur değil, oyunun
// ilerlemesinin ta kendisi (Baki: *"fırsat bulununca fetihler yapılsın"*).
// ---- ⚠ DENENDİ VE GERİ ALINDI: TAVANIN ZAMANLA GEVŞEMESİ (2026-08-12) ----
//
// Baki'nin cümlesi iki yarımdı: *"bazı parça sayısı az iller yapsa anlarım OYUN SONLARINA
// DOĞRU, ama OYUN BAŞI için kesinlikle azaltılsın."* İkinci yarıyı da karşılamak için tavan
// maç ilerledikçe 6'dan 18'e gevşetildi (eğri `bitirmeIstahi`'ydi).
//
// ÖLÇÜM KAZANCI KÜÇÜK, BEDELİ BÜYÜK BULDU:
//   • kazanç → orta kademede dünya 48 yerine 44 sahibe iniyor (biraz daha konsolidasyon)
//   • bedel  → KOLAY kademede zirve yığın 21'den **59'a** çıkıyor
// Sebep: kolay kademede yapay zekâ neredeyse hiç saldırmıyor (60 turda 41 fetih), ordular
// hiçbir savaşta erimediği için takvim gevşedikçe tavana kadar birikiyor. Yani gevşeme,
// ihtiyaç duyulmayan yerde yığılma üretiyordu — düzeltilmek istenen şeyin ta kendisi.
//
// Baki'ye üç seçenek ölçümle sunuldu, **sabit tavanı seçti**. Takvim bağı kaldırıldı;
// gevşemeyi geri isteyen `DOYMA.PARCA_BASINA`'yı büyütür, ikinci bir mekanizma gerekmez.
export function uretimTavani(durum, aktorId) {
  const D = Z.DOYMA;
  const parcaSayisi = aktorParcalari(durum, aktorId).length;
  const toprakTavani = D.PARCA_BASINA * parcaSayisi;
  const tehditTavani = D.KAT * cevredekiTehdit(durum, aktorId);
  return Math.max(D.EN_AZ, Math.min(tehditTavani, toprakTavani));
}

export function uretimDoymus(durum, aktorId) {
  const D = Z.DOYMA;
  if (!D || !D.ACIK) return false;
  return toplamKuvvet(durum, aktorId) >= uretimTavani(durum, aktorId);
}

export function uretimKarari(durum, aktorId) {
  const butce = kullanilabilirButce(durum, aktorId);
  if (butce.nufus <= 0 && butce.ekonomi <= 0) return null;

  // Yeterince askerim varsa bu tur basmıyorum — para araştırmaya kalsın (bkz. yukarısı).
  if (uretimDoymus(durum, aktorId)) return null;

  // Ordu için ayrılan pay: havuzun tamamı değil (bkz. URETIM_PAYI).
  const pay = {
    nufus: Math.floor(butce.nufus * Z.URETIM_PAYI),
    ekonomi: Math.floor(butce.ekonomi * Z.URETIM_PAYI),
  };
  if (pay.nufus <= 0 && pay.ekonomi <= 0) return null;

  const hedefParca = uretimYeri(durum, aktorId);
  if (!hedefParca) return null;

  const ilKodu = PARCALAR[hedefParca].kod;
  const hak = ilUretimHakki(durum, ilKodu, aktorId);
  if (hak.kalan <= 0) return null;

  const karisim = DENGE.GARNIZON.KARISIM[ilTipi(ilKodu)];
  const siparis = karisimaGoreDoldur(karisim, pay, hak.kalan);
  if (birimSayisi(siparis) === 0) return null;

  // SON SÖZ OYUNCUNUN DOĞRULAMASINDA: geçersizse emir üretilmiyor.
  return siparisGecerliMi(durum, hedefParca, aktorId, siparis).ok
    ? { parcaId: hedefParca, siparis }
    : null;
}

// Düşmana sınırdaş kendi parçalarından, sanayi hakkı kalan ilk uygun olanı.
// Sınırdaş parça yoksa (iç bölgedeki aktör) herhangi bir parçası — asker basmayı büsbütün
// bırakmasın; büyüyen bir imparatorluğun iç illeri de üretmeli.
function uretimYeri(durum, aktorId) {
  const parcalar = aktorParcalari(durum, aktorId);
  const uygun = (pid) => ilUretimHakki(durum, PARCALAR[pid].kod, aktorId).kalan > 0;
  const cephe = parcalar.filter((pid) => dusmanaSinirdasMi(durum, aktorId, pid) && uygun(pid));
  if (cephe.length > 0) return cephe.sort()[0];
  const ic = parcalar.filter(uygun);
  return ic.length > 0 ? ic.sort()[0] : null;
}

// Karışım oranını bütçenin ve sanayi hakkının izin verdiği kadar doldurur.
// Görev 04'ün KISMİ SİPARİŞ kalıbı: türlerden sırayla birer tane eklenir, oran korunur,
// para bitince durulur. Yeni bir dağıtım mantığı yazılmadı.
function karisimaGoreDoldur(karisim, pay, kalanHak) {
  const turler = DENGE.BIRIM_SIRASI.filter((t) => karisim[t] > 0);
  const toplamPay = turler.reduce((a, t) => a + karisim[t], 0);
  const siparis = {};
  let eklenen = 0;

  // En çok kalanHak birim eklenecek; her turda en fazla bir tür sığmayabilir.
  while (eklenen < kalanHak) {
    let birTaneEklendi = false;
    for (const tur of turler) {
      if (eklenen >= kalanHak) break;
      // Oranı koru: bu türden payına düşenden fazlası varsa sırayı atla.
      const hedefOran = karisim[tur] / toplamPay;
      if (eklenen > 0 && (siparis[tur] || 0) / eklenen > hedefOran) continue;

      const deneme = { ...siparis, [tur]: (siparis[tur] || 0) + 1 };
      const bedel = siparisMaliyeti(deneme);
      if (bedel.nufus > pay.nufus || bedel.ekonomi > pay.ekonomi) continue;

      siparis[tur] = deneme[tur];
      eklenen++;
      birTaneEklendi = true;
    }
    if (!birTaneEklendi) break; // hiçbir tür sığmıyor — bütçe bitti
  }
  return siparis;
}

// ---- ARAŞTIRMA KARARI (görev belgesi §5, boşluk 4 ve 8) ----
//
// NE KADAR: açgözlülük böler. Açgözlü aktör bugünün ordusunu ister, ötekiler yarının
// kalitesini. Oran `DENGE.ZEKA`'da, kodda değil.
//
// HANGİ DAL: sınırdaş düşmanlarının BASKIN BİRLİK TÜRÜNE göre. Karşısında zırhlı yığını
// olan aktör ağır vuruş araştırır, piyade yığını olan hafif vuruş. Hiç sınırdaşı yoksa
// kişiliğe göre sabit bir dal — iç bölgedeki aktör de bir şey biriktirsin.
//
// Dönen: { ayrilan, birim, dal } veya null
export function arastirmaKarari(durum, aktorId, kisilik) {
  const butce = kullanilabilirButce(durum, aktorId);
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  // Açgözlülük 0 → EN_COK, 1 → EN_AZ (doğrusal ara değer).
  const oran =
    Z.ARASTIRMA_PAYI_EN_COK - (Z.ARASTIRMA_PAYI_EN_COK - Z.ARASTIRMA_PAYI_EN_AZ) * acgozluluk;
  const ayrilan = Math.max(0, Math.floor(butce.ekonomi * oran));
  const secim = arastirmaDali(durum, aktorId, kisilik);
  if (ayrilan <= 0 && !secim) return null;
  return { ayrilan, ...(secim || {}) };
}

// Sınırdaş düşmanların baskın birlik türü → ona karşı işe yarayan dal.
export function arastirmaDali(durum, aktorId, kisilik) {
  const sayim = { piyade: 0, topcu: 0, zirhli: 0 };
  let toplam = 0;
  for (const pid of aktorParcalari(durum, aktorId)) {
    for (const k of komsular(pid)) {
      if (!kapsamdaMi(durum, k) || durum.parcaSahipligi[k] === aktorId) continue;
      const o = parcaOrdusu(durum, k);
      if (!o || o.sahip === aktorId) continue;
      for (const tur of DENGE.BIRIM_SIRASI) {
        const n = o.birimler[tur] || 0;
        sayim[tur] += n;
        toplam += n;
      }
    }
  }

  // Araştırma birime özgü (Adım 2b), yani "hangi dal" sorusunun yanında "hangi ağaç"
  // sorusu da var: kendi baskın birimimizin ağacını geliştiriyoruz.
  const benimBirim = baskinBirim(durum, aktorId) || 'piyade';

  if (toplam === 0) {
    // Sınırdaş düşman yok: kişiliğe göre sabit. Saldırgan aktör vuruş, temkinli savunma
    // araştırır. Zırhlının zırh dalı olmadığı için (Adım 2b ölçümü) orada hafife düşülüyor.
    const saldirgan = agirlik(kisilik, 'saldirganlik') >= agirlik(kisilik, 'temkin');
    const dal = saldirgan ? 'hafif' : 'zirh';
    return { birim: benimBirim, dal: dalVar(benimBirim, dal) ? dal : 'hafif' };
  }

  // Zırhlı ağırlıklı düşmana ağır vuruş, yaya ağırlıklıya hafif vuruş.
  const dal = sayim.zirhli / toplam >= Z.AGIR_VURUS_ESIGI ? 'agir' : 'hafif';
  return { birim: benimBirim, dal };
}

function dalVar(birim, dal) {
  return !!(DENGE.ARASTIRMA.AGACLAR[birim] && DENGE.ARASTIRMA.AGACLAR[birim][dal]);
}

// Aktörün sahadaki en kalabalık birim türü (hiç ordusu yoksa null).
function baskinBirim(durum, aktorId) {
  const sayim = { piyade: 0, topcu: 0, zirhli: 0 };
  for (const pid of Object.keys(durum.ordular || {})) {
    const o = durum.ordular[pid];
    if (o.sahip !== aktorId) continue;
    for (const tur of DENGE.BIRIM_SIRASI) sayim[tur] += o.birimler[tur] || 0;
  }
  let en = null;
  for (const tur of DENGE.BIRIM_SIRASI) if (en === null || sayim[tur] > sayim[en]) en = tur;
  return sayim[en] > 0 ? en : null;
}

// ---- TOPARLANMA KARARI (görev belgesi §5, boşluk 7) ----
//
// §9.1: "aynı fayda hesabıyla" — yaralı birliklerin bedeli, o cephedeki tehdide karşı
// tartılır. Somut kural: ordu kadrosunun TOPARLANMA_ESIGI kadarını kaybetmişse toplanır.
// CEPHEDEKİ ORDULAR ÖNCE gelir — arkadaki yıpranmış ordu bekleyebilir, cephedeki bekleyemez.
//
// Dönen: toparlanma emri verilecek parça kimlikleri (öncelik sırasında)
export function toparlanmaKarari(durum, aktorId) {
  const adaylar = [];
  for (const pid of aktorParcalari(durum, aktorId)) {
    const ordu = parcaOrdusu(durum, pid);
    if (!ordu || ordu.sahip !== aktorId) continue;
    if (!toplanabilirMi(ordu)) continue;

    const kadroSayi = birimSayisi(kadroAl(ordu));
    if (kadroSayi === 0) continue;
    const eksik = birimSayisi(eksikKadro(ordu)) + birimSayisi(yaraliAl(ordu));
    const oran = eksik / kadroSayi;
    if (oran < Z.TOPARLANMA_ESIGI) continue;

    adaylar.push({ pid, oran, cephede: dusmanaSinirdasMi(durum, aktorId, pid) });
  }
  // Cephedekiler önce, sonra en çok yıpranmış; eşitlikte kimlik sırası (belirlenimci).
  adaylar.sort(
    (a, b) => Number(b.cephede) - Number(a.cephede) || b.oran - a.oran || (a.pid < b.pid ? -1 : 1)
  );
  return adaylar.map((a) => a.pid);
}

// ============================================================
// DİPLOMASİ KARARLARI (Görev 09 / Adım 2 · tasarım §10)
// ============================================================
//
// ---- İKİNCİ BİR KARAR MANTIĞI YAZILMIYOR (görev belgesi §6/1) ----
//
// Buradaki iki puan, yukarıdaki `hamlePuani` ile AYNI KALIBI kullanıyor: terimlerin her
// biri bir DENGE katsayısı × bir kişilik ağırlığı × bir dünya ölçüsü. Yeni bir mimari,
// yeni bir eşik türü, yeni bir gürültü modeli yok — diplomasi zekânın ayrı bir beyni
// değil, aynı beynin başka bir menüsü.
//
// ---- BELİRLENİMCİLİK ZORUNLU ----
// Teklif seçimi `rastgele.js` üzerinden, tohum tur ve aktör bazlı. Aynı tohum → aynı
// diplomasi (§9/tuzak 4). Bu olmadan kayıttan yüklenen oyun başka türlü akar.

// Bu aktörün savaş halinde olduğu aktör sayısı — "cephe yükü"nün ölçüsü.
// Parça sayısı değil AKTÖR sayısı: üç ayrı devletle savaşmak, tek devletle üç parçada
// savaşmaktan daha ağırdır. Diplomasinin çözdüğü sorun tam olarak budur.
function cepheYuku(durum, aktorId) {
  return dusmanlar(durum, aktorId).length;
}

// Ortak düşman ORANI: düşmanlarımın ne kadarı onun da düşmanı (0–1).
//
// ⚠ HAM SAYI DEĞİL ORAN — ve bu düzeltme ölçümden geldi (Adım 3). İlk sürüm ortak düşman
// SAYISINI kullanıyordu ve terim dünya konsolide oldukça sınırsız büyüyordu: zor kademede
// 30. turda 18 aktör kalıyor, hepsi birbiriyle savaşta, herkesin herkesle 5–6 ortak
// düşmanı var. Terim tek başına eşiği 10 kat aşıyor, öteki bütün terimler anlamsızlaşıyor
// ve harita tek ittifak bloğuna dönüyordu (canlı 18, blok 17).
//
// Oran hâlâ aynı şeyi söylüyor ("ortak düşmanımız var mı") ama DÜNYANIN BÜYÜKLÜĞÜNDEN
// BAĞIMSIZ. Böylece `FAYDA.ESIK` oyunun her aşamasında aynı anlama geliyor.
function ortakDusmanOrani(durum, a, b) {
  const benim = dusmanlar(durum, a);
  if (benim.length === 0) return 0;
  const onun = new Set(dusmanlar(durum, b));
  return benim.filter((x) => onun.has(x)).length / benim.length;
}

function parcaSayisi(durum, aktorId) {
  return aktorParcalari(durum, aktorId).length;
}

function komsuMuAktor(durum, aktorId, hedefId) {
  for (const pid of aktorParcalari(durum, aktorId))
    for (const k of komsular(pid)) if (durum.parcaSahipligi[k] === hedefId) return true;
  return false;
}

// Hedef BANA KOMŞU VE BENDEN ZAYIF mı? "Yiyeceğim adamla anlaşmam" teriminin ölçüsü.
function zayifKomsuMu(durum, aktorId, hedefId) {
  return (
    parcaSayisi(durum, hedefId) < parcaSayisi(durum, aktorId) &&
    komsuMuAktor(durum, aktorId, hedefId)
  );
}

// ---- İTTİFAK PUANI (görev belgesi §Adım 2) ----
//
//   puan = ORTAK_DUSMAN × ortak düşman sayısı
//        + CEPHE_YUKU   × temkin        × kendi cephe yüküm
//        + HUSUMET      × husumet       × (hasım mı)            ← katsayı NEGATİF
//        + ZAYIF_KOMSU  × açgözlülük    × (komşum ve zayıf mı)  ← katsayı NEGATİF
//
// SON TERİM EN ÖNEMLİSİ. Yapay zekâ fethedebileceği komşusuyla ittifak YAPMAMALI;
// yaparsa ittifaklar rastgele görünür ve oyuncu diplomasiyi anlamsız bulur. Açgözlülük
// ağırlığıyla çarpılıyor: açgözlü aktör zayıf komşusunu yer, temkinli aktör onunla
// anlaşabilir — yani terim bir yasak değil, bir KİŞİLİK farkı.
export function ittifakPuani(durum, aktorId, hedefId, kisilik) {
  const F = DENGE.DIPLOMASI.FAYDA;
  // TEMEL YAKINLIK (2026-08-12): ittifak için durumsal bir gerekçe beklemeye gerek yok —
  // temkinli bir devlet dost aramayı zaten ister. Bu terim olmadan formülün bütün olumlu
  // yanı "ortak düşman"a bağlıydı ve o da 19 hedefin ancak 2'sinde ateşliyordu (gerekçe
  // ve ölçüm `denge.js FAYDA.TEMEL` notunda). Açgözlülükle çarpılan `ILAN.GENISLEME`'nin
  // simetriği: orada iştah genişlemeyi, burada temkin dostluğu getiriyor.
  let puan = (F.TEMEL || 0) * agirlik(kisilik, 'temkin');
  puan += F.ORTAK_DUSMAN * ortakDusmanOrani(durum, aktorId, hedefId);
  // Cephe yükü de ORANA çevriliyor (0–1), aynı gerekçeyle: "çok cephe" bir eşiktir, sonsuz
  // büyüyen bir sayı değil. Ölçü `ATESKES.COK_CEPHE` — iki yerde iki farklı "çok" tanımı
  // olmasın (§10/4).
  const yukOrani = Math.min(1, cepheYuku(durum, aktorId) / DENGE.DIPLOMASI.ATESKES.COK_CEPHE);
  puan += F.CEPHE_YUKU * agirlik(kisilik, 'temkin') * yukOrani;
  puan += F.HUSUMET * agirlik(kisilik, 'husumet') * (husumetBul(aktorId, hedefId) ? 1 : 0);
  // İKİ AYRI KOMŞU TERİMİ, ÜST ÜSTE BİNİYOR ve bilerek:
  //   KOMSU       → her komşu ittifakı bir CEPHEYİ KAPATIR (ittifakın asıl bedeli)
  //   ZAYIF_KOMSU → üstüne, yiyebileceğim komşuysa ayrıca caydırıcı
  // Yani zayıf komşu iki kez cezalanıyor: hem fırsat hem cephe.
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  puan += F.KOMSU * acgozluluk * (komsuMuAktor(durum, aktorId, hedefId) ? 1 : 0);
  puan += F.ZAYIF_KOMSU * acgozluluk * (zayifKomsuMu(durum, aktorId, hedefId) ? 1 : 0);
  return puan;
}

// ---- ATEŞKES PUANI (§5.4) ----
//
// §10: ateşkesi "kaybediyorsa, cephesi çoksa veya temkinliyse" kabul eder. Üçü de
// burada, üçü de DENGE'den:
//
//   puan = (kaybediyorum ? 1 : 0)
//        + (cephem çok ? 1 : 0)
//        + TEMKIN × temkin
//
// "KAYBEDİYORUM" NASIL ÖLÇÜLÜYOR: karşı taraf benden `KAYBEDIYORUM_ORANI` kadar büyükse.
// Savaş başına toprak kaybı TUTULMUYOR ve bilerek: o, kayda savaş başına ikinci bir sayaç
// eklemek demekti (§7'nin "türetilebilen kaydedilmez" kuralı) ve büyüklük farkı zaten
// aynı soruyu cevaplıyor — kaybeden taraf küçülür.
export function ateskesPuani(durum, aktorId, hedefId, kisilik) {
  const A = DENGE.DIPLOMASI.ATESKES;
  const benim = parcaSayisi(durum, aktorId);
  const onun = parcaSayisi(durum, hedefId);
  let puan = onun > benim * (1 + A.KAYBEDIYORUM_ORANI) ? 1 : 0;
  puan += cepheYuku(durum, aktorId) >= A.COK_CEPHE ? 1 : 0;
  puan += A.TEMKIN * agirlik(kisilik, 'temkin');
  return puan;
}

// Bu aktör kendisine gelen teklifi kabul eder mi? Teklif VERME ile AYNI eşikten geçiyor
// (`FAYDA.ESIK`) — tek eşik, iki yönde de aynı. İki ayrı eşik olsaydı "teklif ettiği ama
// aynısını kabul etmediği" bir zekâ doğardı.
export function teklifKabulMu(durum, aktorId, kaynakId, tip, kisilik) {
  if (!teklifGecerliMi(durum, kaynakId, aktorId, tip).ok) return false;
  const puan =
    tip === ITTIFAK
      ? ittifakPuani(durum, aktorId, kaynakId, kisilik)
      : ateskesPuani(durum, aktorId, kaynakId, kisilik);
  // KABUL eşiği TEKLİF eşiğinden düşük: masadaki teklife evet demek, gidip teklif
  // etmekten ucuzdur (gerekçe `diplomasi.js kabulEsigi`).
  return puan >= kabulEsigi(durum);
}

// ---- SAVAŞ İLANI PUANI (Görev 11 — "zekâlar hesap yapıp kime savaş açacaklarını seçsin") ----
//
// Kalıp öteki puanlarla AYNI: katsayı × kişilik ağırlığı × dünya ölçüsü. Yeni bir beyin
// değil, aynı beynin savaş menüsü.
//
//   puan = ZAYIF_KOMSU     × açgözlülük × (sınırdaş ve benden küçük mü)
//        + HUSUMET         × husumet    × (hasım mı)          ← POZİTİF: hasmına savaş
//        + GUC_USTUNLUGU   × güç üstünlüğü oranı (0–1, iki katta doyar)
//        + CEPHE_YUKU      × temkin     × cephe yükü oranı    ← katsayı NEGATİF
//
// HUSUMET terimi ittifak puanındakinin TERSİ işaretli ve bilinçli: hasımla anlaşılmaz
// (orada −3.0), hasma savaş açılır (burada +1.8). Ordu–Giresun büyük savaşı böylece
// masal değil, zekânın gerçekten seçtiği bir yol — düello da ilk saldırıyla tetiklenir
// (`rekabet.js`, kuralları aynen duruyor).
export function savasIlanPuani(durum, aktorId, hedefId, kisilik) {
  const F = DENGE.DIPLOMASI.ILAN.FAYDA;
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  // Temel iştah: genişlemek istemek için komşunun zayıf olması gerekmiyor. Bu terim
  // olmadan oyun başında hiç savaş açılmıyordu — herkes eşit büyüklükte başladığı için
  // "zayıf komşu" hiç doğmuyor (bkz. denge.js GENISLEME notu).
  // Bitirme iştahı bu terime biniyor (2026-08-08): maç uzadıkça savaş açma isteği artıyor.
  // Barış içinde donmuş bir haritayı çözen tek şey bu — kimse savaşmıyorsa kimse büyümez,
  // kimse büyümezse "zayıf komşu" fırsatı hiç doğmaz ve harita sonsuza kadar öyle kalır.
  let puan = F.GENISLEME * acgozluluk * bitirmeCarpanlari(durum).ilan;
  puan += F.ZAYIF_KOMSU * acgozluluk * (zayifKomsuMu(durum, aktorId, hedefId) ? 1 : 0);
  puan += F.HUSUMET * agirlik(kisilik, 'husumet') * (husumetBul(aktorId, hedefId) ? 1 : 0);
  // Güç üstünlüğü: benim/onun parça oranı. Eşitte 0, iki katında 1'e doyuyor — sonsuz
  // büyüyen terim eşiği anlamsızlaştırır (ortak düşman ORANI dersinin aynısı).
  const benim = parcaSayisi(durum, aktorId);
  const onun = Math.max(1, parcaSayisi(durum, hedefId));
  puan += F.GUC_USTUNLUGU * Math.min(1, Math.max(0, benim / onun - 1));
  const yukOrani = Math.min(1, cepheYuku(durum, aktorId) / DENGE.DIPLOMASI.ATESKES.COK_CEPHE);
  puan += F.CEPHE_YUKU * agirlik(kisilik, 'temkin') * yukOrani;
  return puan;
}

// Bu tur kime savaş ilan edeyim? En yüksek puanlı SINIRDAŞ aday, eşik üstündeyse.
// Dönen: hedef aktör kimliği ya da null (ilan yok — geçerli bir karar, §5/10).
//
// YALNIZCA SINIRDAŞA ilan: sınırın değmeyen birine savaş açmak, saldıramayacağın bir
// savaş satırı yazmaktır — kayıtta durur, hiçbir şey yapmaz. Zekâ ölü satır üretmez.
export function savasIlaniSec(durum, aktorId, kisilik, tohum) {
  const ILAN = DENGE.DIPLOMASI.ILAN;
  if (!DENGE.DIPLOMASI.ACIK || !ILAN || !ILAN.ACIK || ILAN.TUR_BASINA < 1) return null;

  // Sınırdaş aktörler — tek geçişte, parça komşuluğundan.
  const sinirdas = new Set();
  for (const pid of aktorParcalari(durum, aktorId))
    for (const k of komsular(pid)) {
      const sahip = durum.parcaSahipligi[k];
      if (sahip && sahip !== aktorId) sinirdas.add(sahip);
    }

  const uretec = rastgeleKur(tohum >>> 0, (tohum + sayisalKimlik(aktorId) + 7) >>> 0);
  const kademe = Z.ZORLUK[durum.zorluk] || Z.ZORLUK[Z.VARSAYILAN_ZORLUK];
  let enIyi = null;
  for (const hedef of [...sinirdas].sort()) {
    if (!savasIlanGecerliMi(durum, aktorId, hedef).ok) continue;
    const ham = savasIlanPuani(durum, aktorId, hedef, kisilik);
    // Gürültü hamle puanındakiyle aynı biçimde: puanın oranı olarak.
    const sapma = kademe.gurultu > 0 ? uretec.aralik(-kademe.gurultu, kademe.gurultu) : 0;
    const puan = ham + Math.abs(ham) * sapma;
    if (puan < ILAN.FAYDA.ESIK) continue;
    if (!enIyi || puan > enIyi.puan || (puan === enIyi.puan && hedef < enIyi.hedef))
      enIyi = { hedef, puan };
  }
  return enIyi ? enIyi.hedef : null;
}

// ---- BU TURUN TEKLİFLERİ ----
//
// Tanıdıklar arasından eşiği geçenler, en yüksek puandan başlayarak `TUR_BASINA_TEKLIF`
// kadar. Sınır olmasaydı bir aktör her tur 10 kişiye ittifak önerip birini tuttururdu —
// diplomasi piyangoya dönerdi (§4/Soru 2).
//
// ATEŞKES ÖNCE DENENİYOR: savaşı bitirmek, yeni bir dost bulmaktan aciltir. Aynı turda
// hem ateşkes hem ittifak teklifi çıkabilir; ikisi de aynı sınırı paylaşır.
//
// Dönen: [{ hedef, tip, puan }] — puan sırasında.
export function diplomasiEmirleri(durum, aktorId, kisilik, tohum) {
  const D2 = DENGE.DIPLOMASI;
  if (!D2.ACIK || ihanetliMi(durum, aktorId)) return [];

  const uretec = rastgeleKur(tohum >>> 0, (tohum + sayisalKimlik(aktorId)) >>> 0);
  const adaylar = [];
  // `bolgesiz`: zekâ yalnızca sınırdaşına / ilişkili olduğuna / adı duyulmuş devlete
  // teklif götürür. Bölge kuralı oyuncunun konuşma hakkını genişletiyor, zekânın
  // İŞTAHINI değil — ölçüm o havuzun doygunluk ürettiğini gösterdi (bkz. diplomasi.js).
  for (const t of tanidiklar(durum, aktorId, { bolgesiz: true })) {
    const tip = savastaMi(durum, aktorId, t.id) ? 'ateskes' : ITTIFAK;
    if (!teklifGecerliMi(durum, aktorId, t.id, tip).ok) continue;
    const ham =
      tip === ITTIFAK
        ? ittifakPuani(durum, aktorId, t.id, kisilik)
        : ateskesPuani(durum, aktorId, t.id, kisilik);
    // Eşik TURA BAĞLI (2026-08-08): erken turlarda düşük. `ittifakEsigi` tek kaynak —
    // kabul kararı (`teklifKabulMu`) de aynı satırdan geçiyor.
    if (ham < ittifakEsigi(durum)) continue;
    // Gürültü hamle puanındakiyle AYNI biçimde: puanın ORANI olarak. Sabit sapma olsaydı
    // küçük puanlı kararlar rastgeleye, büyükler kesine dönerdi.
    const kademe = Z.ZORLUK[durum.zorluk] || Z.ZORLUK[Z.VARSAYILAN_ZORLUK];
    const sapma = kademe.gurultu > 0 ? uretec.aralik(-kademe.gurultu, kademe.gurultu) : 0;
    adaylar.push({ hedef: t.id, tip, puan: ham + Math.abs(ham) * sapma });
  }

  // Ateşkes önce, sonra yüksek puan; eşitlikte KİMLİK sırası (belirlenimci olmak zorunda).
  adaylar.sort(
    (a, b) =>
      Number(b.tip === 'ateskes') - Number(a.tip === 'ateskes') ||
      b.puan - a.puan ||
      (a.hedef < b.hedef ? -1 : 1)
  );
  return adaylar.slice(0, D2.TUR_BASINA_TEKLIF);
}

// ---- TEKLİFİN SEBEBİ (Görev 12 · Baki: "teklifin sebebi olsun") ----
//
// Panel bugüne kadar yalnızca "kabule açık / şu an sıcak bakmıyor" diyordu; NEDEN'i
// söylemiyordu. Oyuncu da kör bir düğmeye basıp cevabı yiyordu.
//
// ⚠ İKİNCİ BİR TAHMİN YAZILMIYOR. Sebep, kabul kararını veren puanın KENDİ terimlerinden
// çıkıyor: hangi terim sonucu en çok çekiyorsa cümle o. Ekran ayrı bir hesap yürütseydi
// "ekranın söylediği" ile "zekânın yaptığı" ayrışabilirdi (§10/4).
const ITTIFAK_SEBEP = {
  ortakDusman: 'Ortak düşmanınız var; bu anlaşma ona da yarıyor.',
  cepheYuku: 'Birçok cephede savaşıyor, sırtını sağlama almak istiyor.',
  husumet: 'Aranızda eski bir hesap var; bu iki il masaya oturmaz.',
  komsu: 'Sınırdaşsınız — anlaşmak, genişleyebileceği bir cepheyi kapatır.',
  zayifKomsu: 'Seni yiyebileceğini düşünüyor; anlaşmak işine gelmiyor.',
};

// ---- REDDİN SEBEBİ (Görev 20 · Baki, 2026-09-24: "anlaşmayı neden reddettiğine dair küçük
// bir mesaj olsun, oyuncunun anlayabilmesi için") ----
//
// `teklifSebebi` EN BÜYÜK terimi söylüyor — ret anında o terim olumlu olabiliyor ("ortak
// düşmanınız var") ve cümle reddi açıklamıyordu. Burası kabulü ENGELLEYEN en büyük EKSİ
// terimi seçiyor; eksi terim yoksa artılar eşiğe yetmemiştir ve en çok işe yarayacak şey
// (ortak düşman) söyleniyor. Terimler `ittifakPuani`'nın kendileri — ikinci tahmin yok.
// Cümleler kısa: sonuç satırının altında tek satır.
export const RET_SEBEBI = {
  husumet: 'Aranızda eski bir hesap var.',
  komsu: 'Sınırdaşsınız; o yöne büyümek istiyor.',
  zayifKomsu: 'Seni zayıf görüyor; yutmayı umuyor.',
  ortakDusmanYok: 'Ortak bir düşmanınız yok.',
  yetmiyor: 'Anlaşma ona yeterince kazandırmıyor.',
  ateskes: 'Savaşı kaybetmiyor; bitirmek istemiyor.',
};

export function retSebebi(durum, aktorId, kaynakId, tip, kisilik) {
  // Ateşkesi üç şeyden biri kabul ettiriyor (kaybediyor · çok cephe · temkin); ret demek
  // üçü de yok demek — en anlaşılır olanı "kaybetmiyor".
  if (tip !== ITTIFAK) return RET_SEBEBI.ateskes;
  const F = DENGE.DIPLOMASI.FAYDA;
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  const eksiler = {
    husumet: F.HUSUMET * agirlik(kisilik, 'husumet') * (husumetBul(aktorId, kaynakId) ? 1 : 0),
    komsu: F.KOMSU * acgozluluk * (komsuMuAktor(durum, aktorId, kaynakId) ? 1 : 0),
    zayifKomsu: F.ZAYIF_KOMSU * acgozluluk * (zayifKomsuMu(durum, aktorId, kaynakId) ? 1 : 0),
  };
  let en = null;
  for (const ad of Object.keys(eksiler)) {
    if (eksiler[ad] >= 0) continue;
    if (en === null || eksiler[ad] < eksiler[en]) en = ad;
  }
  if (en) return RET_SEBEBI[en];
  return ortakDusmanOrani(durum, aktorId, kaynakId) > 0
    ? RET_SEBEBI.yetmiyor
    : RET_SEBEBI.ortakDusmanYok;
}

export function teklifSebebi(durum, aktorId, kaynakId, tip, kisilik) {
  const F = DENGE.DIPLOMASI.FAYDA;

  if (tip !== ITTIFAK) {
    // Ateşkes üç şarta bakıyor; hangisi tuttuysa cümle o (§5.4).
    const A = DENGE.DIPLOMASI.ATESKES;
    const benim = parcaSayisi(durum, aktorId);
    const onun = parcaSayisi(durum, kaynakId);
    if (onun > benim * (1 + A.KAYBEDIYORUM_ORANI)) return 'Savaşı kaybediyor; bitirmeye açık.';
    if (cepheYuku(durum, aktorId) >= A.COK_CEPHE)
      return 'Birçok devletle savaşta; bir cepheyi kapatmak istiyor.';
    if (agirlik(kisilik, 'temkin') >= 0.6) return 'Temkinli bir devlet; savaşı uzatmak istemiyor.';
    return 'Savaşta üstün durumda; şu an bitirmeye niyeti yok.';
  }

  // İttifak: terimlerin KATKILARI hesaplanıp en büyüğü (mutlak değerce) seçiliyor.
  const acgozluluk = agirlik(kisilik, 'acgozluluk');
  const yukOrani = Math.min(1, cepheYuku(durum, aktorId) / DENGE.DIPLOMASI.ATESKES.COK_CEPHE);
  const katkilar = {
    ortakDusman: F.ORTAK_DUSMAN * ortakDusmanOrani(durum, aktorId, kaynakId),
    cepheYuku: F.CEPHE_YUKU * agirlik(kisilik, 'temkin') * yukOrani,
    husumet: F.HUSUMET * agirlik(kisilik, 'husumet') * (husumetBul(aktorId, kaynakId) ? 1 : 0),
    komsu: F.KOMSU * acgozluluk * (komsuMuAktor(durum, aktorId, kaynakId) ? 1 : 0),
    zayifKomsu: F.ZAYIF_KOMSU * acgozluluk * (zayifKomsuMu(durum, aktorId, kaynakId) ? 1 : 0),
  };

  let enBuyuk = null;
  for (const ad of Object.keys(katkilar)) {
    if (katkilar[ad] === 0) continue;
    if (enBuyuk === null || Math.abs(katkilar[ad]) > Math.abs(katkilar[enBuyuk])) enBuyuk = ad;
  }
  // Hiçbir terim ateşlenmemişse söylenecek bir şey de yok — uydurma cümle yazılmıyor.
  if (enBuyuk === null) return 'Ortada onu ikna edecek bir sebep yok.';
  return ITTIFAK_SEBEP[enBuyuk];
}
