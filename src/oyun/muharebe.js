// MUHAREBE MOTORU (Görev 05 / Adım 1 — tasarım §3.3–§3.8).
//
// SAF FONKSİYON: oyun durumunu, parçaları, aktörleri TANIMAZ. Düz veri alır, düz veri
// döndürür. Test edilebilirliğin tamamı buradan geliyor — bir muharebeyi doğrulamak için
// oyun kurmak gerekmiyor. Kim kime saldırıyor, hangi parçada, kim fethediyor: hepsi
// `hareket.js`'in işi.
//
// BİTİŞ ÖLÇÜTÜ: tasarım §3.7'deki 15 satırın kazananlarını yeniden üretmek. Tablo SÜREKLİ
// bir modelin çıktısı (kesirli birimler, moral yok); bu motor TAM SAYI birimlerle, hasar
// havuzuyla ve bozgunla çalışır. Bu yüzden karşılaştırma ondalık eşitlikle değil,
// KAZANAN ve BÜYÜKLÜK SIRASI üzerinden yapılıyor (`testler/muharebe.test.js`).
// Sürekli modelin kendisi `scripts/muharebe-referans.js`'te duruyor.
//
// DOLDURULAN TASARIM BOŞLUKLARI (görev belgesi §4; gerekçeleri URETIM-NOTU.md'de):
//   1. Arazi zırhlı çarpanı → zırhlı birimin VERDİĞİ HASARA uygulanır. Tahmin değil,
//      ölçüm: `veri/muharebe-referans.md` (üç yorumdan yalnızca bu, 15 satırı da tutuyor).
//   2. Hasar EŞZAMANLI: iki taraf da TUR BAŞINDAKİ durumuna göre vurur, sonra ikisine
//      birden uygulanır. Sıralı olsaydı "kim önce vurur" gizli ve çok güçlü bir kural olurdu.
//   3. Orantılı kayıp tam sayıya EN BÜYÜK ARTIK yöntemiyle bölünür; eşitlikte BIRIM_SIRASI
//      karar verir. Sonuç belirlenimci: aynı girdi hep aynı türü öldürür.
//   4. Şansın "kuvvet oranı" ölçüsü HAM HASAR (arazi ve şans öncesi). Birim sayısı olsaydı
//      3 piyade 1 zırhlıya "3:1 üstün" sayılırdı — oysa §3.7'ye göre zırhlı kazanıyor.
//   5. Muharebe bozguna veya imhaya kadar sürer; üst sınır EN_COK_TUR. Sınıra gelinirse
//      BERABERE: saldıran çekilir (çekilme kaybı YOK), iki taraf da yıpranmış kalır.
//
// FORMÜLDE ÇIPLAK SAYI YOKTUR. Her sabit `DENGE.MUHAREBE` veya `DENGE.ARAZI`'den okunur;
// testler bunu sabiti değiştirip sonucun değiştiğini görerek kanıtlıyor.
//
// ---- ARAŞTIRMA (Görev 06) — MOTORUN SAFLIĞI BOZULMADI ----
// Motor artık birim statlarını `DENGE.BIRIMLER`'den KENDİSİ OKUMUYOR; her taraf için bir
// STAT TABLOSU parametre olarak alıyor. Tabloyu kim üretiyor motoru ilgilendirmez
// (`arastirma.js birimStatlari`), motor hâlâ düz veri alıp düz veri döndürüyor.
//
// Her taraf KENDİ tablosuyla vurur, KENDİ tablosuyla dayanır ve KENDİ zırhıyla korunur —
// araştırma tek taraflı olabildiği için ayrım şart. Tablo verilmezse `DENGE.BIRIMLER`
// kullanılır, yani araştırma 0'da motor kelimesi kelimesine eski davranışını gösterir:
// §3.7'nin 15 satırı ve mevcut 40 muharebe testi değişmeden geçer. Bu, Adım 3'ün bitiş ölçütüydü.

import { DENGE } from '../denge.js';
import { rastgeleKur } from './rastgele.js';
import { birimSayisi } from './ordu.js';

const M = DENGE.MUHAREBE;

// Stat tablosunu çöz: verilmemişse temel tablo.
function st(statlar) {
  return statlar || DENGE.BIRIMLER;
}

function kis(x, alt, ust) {
  return Math.min(ust, Math.max(alt, x));
}

// Kayıt dosyası şişmesin diye havuzlar iki haneye yuvarlanır. Muharebenin İÇİNDE tam
// kesirle hesaplanır; yuvarlama yalnızca dışarı verilen sonuçta.
function kisalt(x) {
  return Math.round(x * 100) / 100;
}

// ---- §3.3 ETKİNLİK EĞRİLERİ ----

// Ordunun ortalama zırhı: "tipik birimi ne kadar zırhlı". Hasar HEDEFİN zOrt'una bakar.
// Zırh HEDEFİN kendi tablosundan okunur — zırh araştırmasını yapan taraf korunur.
export function zOrt(birimler, statlar) {
  const S = st(statlar);
  let zirh = 0,
    sayi = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler && birimler[tur]) || 0;
    if (n === 0) continue;
    zirh += S[tur].zirh * n;
    sayi += n;
  }
  return sayi === 0 ? 0 : zirh / sayi;
}

// Verilen zırh ortalamasına karşı iki vuruş türünün etkinliği.
//
// ---- TEK ZIRH EĞRİSİ, İKİ VURUŞ (2026-08-11, Baki: "ağır vuruş zırha karşı delicilik
// versin, bonus hasar kazanmasın; zırhın bir kısmına ignore atsın") ----
//
// Zırh HER İKİSİNİ de azaltır ve ikisi de AYNI eğriden geçer. Tek fark, ağır vuruşun
// zırhın `AGIR_DELICILIK` kadarını YOK SAYMASI: geriye kalan zırh onu tıpkı hafif vuruşu
// etkilediği gibi azaltır, ama üçte biri kadar zırh gördüğü için üç kat az azalır.
//
// ⚠ EĞRİ ARTAN OLAMAZ. Eskiden ağır vuruşun etkinliği zırhla BİRLİKTE büyüyordu (zırhlıya
// 0.760, piyadeye 0.617) — yani zırh, ağır vuruşa karşı bir davetiyeydi ve zırh araştırmak
// oyuncuyu zayıflatıyordu. `testler/muharebe.test.js` bunu artık kural olarak denetliyor:
// zırh arttıkça ağır etkinlik ASLA artmaz. Gerekçe ve ölçüm `denge.js AGIR_DELICILIK`.
//
// AGIR_VERIM sabit bir katsayı: ağır mermi hedefin tek noktasına gider, hafif ateş gövdeye
// yayılır. Sabit olduğu için hedefin zırhına bakmıyor — bonusa dönüşemez.
export function etkinlik(z) {
  const hafif = kis(1 - z / M.HAFIF_BOLEN, M.HAFIF_ALT, 1);
  const kalanZirh = z * (1 - M.AGIR_DELICILIK); // delinen zırh yok sayılır
  const agir = M.AGIR_VERIM * (1 - kalanZirh / M.HAFIF_BOLEN);
  return { agir: kis(agir, M.AGIR_ALT, 1), hafif };
}

// Bir ordunun hedefe verdiği HAM hasar — arazi ve şans UYGULANMAMIŞ.
// Şansın açılıp kapanmasına karar veren "kuvvet" ölçüsü budur (§3.6, boşluk 4).
// Vuruş gücü VURANIN tablosundan okunur.
export function hamHasar(birimler, hedefZOrt, statlar) {
  const S = st(statlar);
  const e = etkinlik(hedefZOrt);
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler && birimler[tur]) || 0;
    if (n === 0) continue;
    const b = S[tur];
    toplam += n * (b.agirVurus * e.agir + b.hafifVurus * e.hafif);
  }
  return toplam;
}

// PALETLİ ÜSTÜNLÜK — zırhlının arazi ÇARPANI, araştırmayla telafi edilmiş hâli.
// Yalnızca CEZAYI yumuşatır, avantajı asla büyütmez.
//
// ---- TELAFİ ARTIK ARAZİ BAŞINA (2026-08-08, Baki: "tepelik için bitsin, dağlık için
// bitmeye yakın olsun") ----
// Eskiden tek bir orandı ve her arazide aynı işliyordu. Artık `palet` bir TABLO:
//   tepelik 0.85 → ceza 0.15 → telafi 1.00 → 1.00  (ceza tamamen biter)
//   dağlık  0.50 → ceza 0.50 → telafi 0.80 → 0.90  (bitmeye yakın)
//   ova     1.15 → ceza yok  → `max(0, 1−1.15)` = 0 → 1.15 (dal ovaya dokunamaz)
// Son satır bir tesadüf değil, kuralın kendisi: telafi yalnızca 1'in ALTINDAKİ farkı
// kapatır, o yüzden ovadaki avantaja matematiksel olarak erişemiyor.
function zirhliArazi(A, palet, arazi) {
  if (!palet) return A.zirhli;
  const telafi = (typeof palet === 'number' ? palet : palet[arazi]) || 0;
  return A.zirhli + Math.max(0, 1 - A.zirhli) * telafi;
}

// ---- BARAJ ATEŞİ — MUHAREBEDEN ÖNCEKİ KARŞILIKSIZ ATIŞ (2026-08-08) ----
//
// Yalnızca TOPÇU birimleri ateş eder ve karşı taraf o an cevap veremez. Hasar, topçuların
// o muharebedeki normal vuruşunun `oran` katı — yeni bir hasar formülü YOK, `araziliHasar`
// ile aynı çarpanlardan geçiyor (etkinlik eğrileri, savunan arazi çarpanı).
//
// Zırhlı arazi çarpanı burada hiç geçmiyor: baraj topçuya ait bir yetenek, ateşi topçu
// açıyor. Şans, gün çarpanı ve baskın da geçmiyor — hazırlık ateşi planlı bir iştir,
// "o gün nasıl savaştıkları" henüz belli değildir.
export function barajHasari(birimler, hedefZOrt, arazi, savunanMi, statlar, oran) {
  if (!oran) return 0;
  const n = (birimler && birimler.topcu) || 0;
  if (n === 0) return 0;
  const S = st(statlar);
  const A = DENGE.ARAZI[arazi] || DENGE.ARAZI.ova;
  const e = etkinlik(hedefZOrt);
  const b = S.topcu;
  const ham = n * (b.agirVurus * e.agir + b.hafifVurus * e.hafif);
  return (savunanMi ? ham * A.savunan : ham) * oran;
}

// ---- SAVAŞ KAÇ RAUNT SÜRER (2026-08-08, Baki) ----
//
// Ölçü iki tarafın TOPLAM birim sayısı; kademeler `DENGE.MUHAREBE.RAUNT_KADEMELERI`'nde
// ve gerekçesi orada. Kademe bir ÜST SINIR: bozgun ya da imha savaşı daha erken bitirir.
//
// Dışa açık, çünkü arayüzdeki muharebe tahmini ve ölçüm betikleri "bu savaş kaç raunt
// sürer" sorusunu SORMADAN önce cevabı bilmek zorunda kalabiliyor; iki yerde iki hesap
// olsaydı ekranda yazan süre ile gerçek süre ayrışırdı.
export function rauntSayisi(saldiranBirimler, savunanBirimler) {
  // ---- ⚠ ÖLÇÜ TOPLAM DEĞİL, ÇARPIŞAN KUVVET (2026-08-08, Baki'nin tespiti) ----
  //
  // > *"Düşünülmesi gereken bir şey var: 10–19 birim için 2 tur dedik, ama bir taraf 15
  // > diğeri 1 kişi olursa da bu durum oluyor. Bu varsayım iki tarafın aynı sayıda birliğe
  // > sahip olduğunu varsayıyor."*
  //
  // Tespit doğruydu: 15'e 1 bir katliamdır, iki raunt sürmesi saçma. Savaşı UZATAN şey
  // büyük tarafın kalabalığı değil, KÜÇÜK TARAFIN NE KADAR DİRENEBİLDİĞİ. O yüzden ölçü
  // küçük tarafın iki katı — yani "bu savaş kaç kişilik dengeli bir çarpışmaya denk".
  //
  //   15 vs 1  → 2 × 1  = 2   → 1 raunt   (katliam, tek raunt)
  //   10 vs 10 → 2 × 10 = 20  → 3 raunt
  //   40 vs 20 → 2 × 20 = 40  → 3 raunt   (kalabalık taraf süreyi uzatmıyor)
  //
  // İKİ TARAF EŞİTKEN 2 × min = toplam, yani Baki'nin verdiği kademe tablosu (1–9 → 1,
  // 10–19 → 2, 20–49 → 3, 50+ → 4) birebir korunuyor. Formül o tablonun varsayımını
  // kuralın kendisi hâline getiriyor.
  const olcu = 2 * Math.min(birimSayisi(saldiranBirimler), birimSayisi(savunanBirimler));
  const kademeler = M.RAUNT_KADEMELERI || [];
  for (const k of kademeler) if (olcu <= k.enCok) return k.raunt;
  // Tablo boşsa ya da hiçbir kademe tutmadıysa tek raunt: sessizce sonsuza gitmektense
  // en küçük anlamlı savaşı oynat.
  return kademeler.length ? kademeler[kademeler.length - 1].raunt : 1;
}

// ---- ŞANS SÖNÜMÜ (Görev 12 / Adım 3) ----
// Güçler ne kadar yakınsa şans o kadar devrede. Oran 1 → sönüm 1 (tam şans), oran
// KAPANMA → sönüm 0 (hiç şans). Eskiden bu bir BIÇAKTI: 1.99'da tam, 2.00'de sıfır.
//
// Baki'nin şartı buradan geliyor: 1 piyade vs 2 zırhlı ham oranı 3.68 → sönüm 0 → o
// muharebede ne raunt şansı, ne gün çarpanı, ne baskın var. Umutsuz eşleşme umutsuz kalır.
export function sansSonumu(hamA, hamS) {
  const buyuk = Math.max(hamA, hamS),
    kucuk = Math.min(hamA, hamS);
  if (kucuk <= 0) return 0;
  const k = M.SANS_KAPANMA_ORANI;
  const oran = buyuk / kucuk;
  if (oran >= k) return 0;
  if (!M.SANS_RAMPASI) return 1; // eski davranış: kapanma eşiğine kadar tam güç
  return Math.max(0, Math.min(1, (k - oran) / (k - 1)));
}

// Arazi uygulanmış hasar.
//   • ZIRHLI birimlerin katkısı `ARAZI[arazi].zirhli` ile çarpılır — hangi tarafta
//     olduğuna bakılmaz, arazi zırhlıyı her hâlükârda etkiler (dağda ceza, ovada avantaj).
//   • SAVUNAN tarafın toplamı ayrıca `ARAZI[arazi].savunan` ile çarpılır (§3.4).
//   • `etkiler`: kendine özgü araştırma dallarının muharebedeki karşılığı. Burada yalnızca
//     PALET geçiyor — baraj artık raundun içinde değil, muharebeden önceki ayrı bir atış
//     (`barajHasari`), o yüzden bu fonksiyondan çıkarıldı.
//   • `savunanCarpani`: verilirse `ARAZI[arazi].savunan`ın YERİNE geçer. Tek kullanıcısı
//     komutanın DAĞ KOMUTANI yeteneği (Görev 16 / Adım 5): saldıranın yeteneği savunanın
//     arazi üstünlüğünü kırıyor. Çarpan burada hesaplanmıyor, DIŞARIDAN veriliyor çünkü
//     etki KARŞI tarafın komutanından geliyor — bu fonksiyon yalnızca bir tarafı tanıyor.
export function araziliHasar(
  birimler,
  hedefZOrt,
  arazi,
  savunanMi,
  statlar,
  etkiler,
  savunanCarpani
) {
  const S = st(statlar);
  const A = DENGE.ARAZI[arazi] || DENGE.ARAZI.ova;
  const e = etkinlik(hedefZOrt);
  const ek = etkiler || {};
  const zCarpan = zirhliArazi(A, ek.palet, arazi);
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler && birimler[tur]) || 0;
    if (n === 0) continue;
    const b = S[tur];
    let d = n * (b.agirVurus * e.agir + b.hafifVurus * e.hafif);
    if (tur === 'zirhli') d *= zCarpan;
    toplam += d;
  }
  const sCarpan = savunanCarpani === undefined ? A.savunan : savunanCarpani;
  return savunanMi ? toplam * sCarpan : toplam;
}

// ---- §3.8 MORAL ----
// Moral = ⌈birim sayısı / MORAL_BOLEN⌉ + bonuslar. Yüzde yok, her ölçekte aynı çalışır.
export function moralHesapla(birimler, bonus) {
  return Math.ceil(birimSayisi(birimler) / M.MORAL_BOLEN) + (bonus || 0);
}

// ---- §3.4 KAYIP DAĞITIMI ----
// Havuzdaki hasar birim öldürmeye yetiyorsa öldürür. HANGİ türün öleceğini "en büyük
// artık" belirler: o ana kadarki kayıplar, muharebe BAŞINDAKİ kompozisyona ne kadar
// orantısızsa, açığı en büyük olan tür ölür. Eşitlikte BIRIM_SIRASI karar verir →
// aynı durum hep aynı türü öldürür, sonuç belirlenimci.
//
// "Piyade önce ölür, zırhlıyı korur" kuralı bilerek YOK (§3.4): 1 zırhlı + çok piyade
// dizen oyuncunun zırhlısı hiç ölmez, zırhlının maliyeti bedavaya gelirdi.
function sonrakiKurban(taraf) {
  const gelecekToplam = DENGE.BIRIM_SIRASI.reduce((a, t) => a + (taraf.kayiplar[t] || 0), 0) + 1;
  let en = null,
    enAcik = -Infinity;
  for (const tur of DENGE.BIRIM_SIRASI) {
    if (!(taraf.birimler[tur] > 0)) continue;
    const ideal = (gelecekToplam * (taraf.baslangic[tur] || 0)) / taraf.baslangicToplam;
    const acik = ideal - (taraf.kayiplar[tur] || 0);
    if (acik > enAcik + 1e-9) {
      enAcik = acik;
      en = tur;
    }
  }
  return en;
}

// Havuzu boşaltabildiği kadar birime çevirir. Sıradaki kurbanın dayanıklılığı havuzdan
// büyükse DURUR — hasar havuzda bekler. Böylece "ucuz birim hasarı emer" sömürüsü olmaz.
// Dönen: en son ölen birimin türü (hiç ölmediyse null) — beraberlik bozma kuralı kullanıyor.
// YARALILAR ÖNCE ÖLÜR (2026-07-31). Bir tür can verecekse önce o türün yaralısı düşer,
// çünkü yaralının canı zaten az (`YARALI_CAN`). Hem gerçekçi hem de yaralılığı gerçek bir
// tehlike yapıyor: yaralı orduyla savaşa girmek gözle görülür biçimde pahalı.
function birimCani(taraf, tur) {
  const tam = taraf.statlar[tur].dayaniklilik;
  return taraf.yarali[tur] > 0 ? tam * M.YARALI_CAN : tam;
}

function kayiplariUygula(taraf) {
  let son = null;
  for (;;) {
    const tur = sonrakiKurban(taraf);
    if (!tur) break;
    const can = birimCani(taraf, tur);
    if (taraf.havuz < can) break;
    taraf.havuz -= can;
    taraf.birimler[tur] -= 1;
    if (taraf.yarali[tur] > 0) {
      taraf.yarali[tur] -= 1;
      if (taraf.yarali[tur] === 0) delete taraf.yarali[tur];
      taraf.sonYaraliydi = true;
    } else {
      taraf.sonYaraliydi = false;
    }
    if (taraf.birimler[tur] === 0) delete taraf.birimler[tur];
    taraf.kayiplar[tur] = (taraf.kayiplar[tur] || 0) + 1;
    taraf.moral -= 1; // §3.8: her kaybedilen birim −1 moral
    son = tur;
  }
  return son;
}

// En son ölen birimi geri getirir — YALNIZCA karşılıklı imhada, ayakta kalması gereken
// taraf için (aşağıdaki `dahaAzYipranan` notuna bak).
function sonKaybiGeriAl(taraf, tur) {
  taraf.birimler[tur] = (taraf.birimler[tur] || 0) + 1;
  taraf.kayiplar[tur] -= 1;
  if (taraf.kayiplar[tur] === 0) delete taraf.kayiplar[tur];
  // Geri gelen birim, giderken hangi hâldeyse o hâlde döner — yoksa yaralı bir birim
  // "ölüp dirilerek" sağlamlaşırdı.
  const yaraliydi = taraf.sonYaraliydi;
  if (yaraliydi) taraf.yarali[tur] = (taraf.yarali[tur] || 0) + 1;
  taraf.havuz += taraf.statlar[tur].dayaniklilik * (yaraliydi ? M.YARALI_CAN : 1);
  taraf.moral += 1;
}

// TAM SAYI SINIRINDA BERABERLİK BOZMA (tasarımda yoktu, §3.7 tablosu gerektirdi).
//
// Hasar eşzamanlı olduğu için iki taraf aynı turda birden imha olabilir veya birden
// bozulabilir. Sürekli modelde böyle bir an yoktur — orada biri hep bir kırıntı kadar
// önde bitirir; tam sayı birimlerde o kırıntı temsil edilemez. §3.7'nin üç satırı
// (1z–1t dağlık, 1p–1t ova, 3p1t1z–5t ova) tam bu sınırda duruyor.
//
// ÖLÇÜT SÜREKLİ MODELİN KENDİ ÖLÇÜTÜ: oransal olarak daha az yıpranmış taraf üstündür
// (alınan toplam hasar / başlangıç canı). Eşitlikte SAVUNAN kazanır — toprak onda.
// Bu kural konduktan sonra §3.7'nin 15 satırının 15'i de tutuyor.
function yipranma(taraf) {
  return taraf.alinan / taraf.baslangicCan;
}
function dahaAzYipranan(A, S) {
  return yipranma(A) < yipranma(S) - 1e-9 ? 'saldiran' : 'savunan';
}

// Muharebe dışında da orantılı birim eksiltmek gerekiyor: §3.9/1 geri çekilme kaybı.
// Aynı "en büyük artık" kuralını kullanır, yani çekilirken de kompozisyon korunur —
// yoksa bozgun, ucuz birimleri eriten gizli bir seçici hâline gelirdi.
export function orantiliKayip(birimler, adet) {
  const taraf = {
    birimler: { ...birimler },
    baslangic: { ...birimler },
    baslangicToplam: Math.max(1, birimSayisi(birimler)),
    kayiplar: {},
    moral: 0,
  };
  for (let i = 0; i < adet; i++) {
    const tur = sonrakiKurban(taraf);
    if (!tur) break;
    taraf.birimler[tur] -= 1;
    if (taraf.birimler[tur] === 0) delete taraf.birimler[tur];
    taraf.kayiplar[tur] = (taraf.kayiplar[tur] || 0) + 1;
  }
  return { birimler: taraf.birimler, kayiplar: taraf.kayiplar };
}

// ---- §3.8 BOZGUN KONTROLÜ — İKİ MODEL (Görev 07 / Adım 1) ----
//
// 'sayac' : moral sayacı 0'a inince bozgun. Görev 05'ten beri süren davranış.
// 'oran'  : ordu, toplam canının BOZGUN_ORANI kadarını kaybedince dağılır.
//
// FARK ANOMALİDE. Sayaç modelinde moral `⌈n/2⌉` olduğu için 3 ve 4 birimli ordu AYNI
// morali taşır: dördüncü birim moral getirmez ama ölünce götürür. Böylece birlik eklemek
// nadiren muharebeyi kaybettirebiliyordu (ölçüldü: %0.20). Oran modeli sürekli bir
// büyüklüğe baktığı için birlik eklemek bozgun eşiğini HER ZAMAN geciktirir — yapay
// zekânın fayda hesabı bu tek yönlülüğe dayanıyor (§9.1).
//
// İKİSİ DE KODDA DURUYOR, çünkü ölçüm tekrar edilebilir olmalı: `scripts/moral-olcum.js`
// ikisini de §3.7'nin 15 satırına ve anomali taramasına karşı koşturuyor. Görev 06'nın
// dersi buydu — ölçütün kendisi de yanlış olabilir.
// BOZGUN İÇİN EN AZ BİR BİRİM KAYBI ŞART (oran modelinde). Ölçümün yakaladığı ilk kusur
// buydu: oran, bozgunu birim kaybından koparınca ordu HİÇ KİMSE ÖLMEDEN dağılabiliyordu.
// Somut örnek — 1 zırhlı vs 1 piyade (ova): zırhlının ilk vuruşu piyadenin canının %75'ini
// götürüyor ama öldürmüyor; oransız kontrol piyadeyi orada bozguna uğratıp kaçırıyordu.
// Oysa §3.7'nin en net satırı "zırhlı piyadeyi 1v1 EZER" — savunan imha olmalı.
//
// Kayıp şartı tek yönlülüğü bozmaz: "en az 1" ordunun büyüklüğünden bağımsızdır, yani
// birlik eklemek bu şartı kolaylaştırmaz. Bozgunu geciktiren asıl şey yine can oranı.
function bozulduMu(taraf, ayar) {
  // ---- ÖLÜMÜNE SAVAŞAN ORDU BOZULMAZ (Görev 16 / Adım 5 — ÇELİK YÜREK kademe 3) ----
  // Moral eşiği ne olursa olsun çekilme yok. Bunun bedeli `muharebeCoz`un sonunda
  // ödeniyor: kaybederse ordu TAMAMEN yok oluyor ("ya kazanır ya yok olur").
  // İkisi ayrı yerde çünkü bu fonksiyon her raundda, bedel ise bir kez çalışıyor.
  if (taraf.olumune) return false;
  if (ayar.MODEL !== 'oran') return taraf.moral <= 0;
  if (birimSayisi(taraf.kayiplar) === 0) return false;
  return yipranma(taraf) >= taraf.bozgunEsigi;
}

function tarafKur(ordu, bonus, statlar, moralAyari, olumune) {
  const S = st(statlar);
  const birimler = {};
  for (const tur of DENGE.BIRIM_SIRASI)
    if (ordu.birimler && ordu.birimler[tur] > 0) birimler[tur] = ordu.birimler[tur];

  // YARALI BİRİMLER (2026-07-31): sahadalar, aynı güçle vururlar ama canları az.
  // Sayı mevcudu aşamaz — bozuk veri gelirse sessizce kırpılıyor.
  const yarali = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = Math.min((ordu.yarali && ordu.yarali[tur]) || 0, birimler[tur] || 0);
    if (n > 0) yarali[tur] = n;
  }

  const havuz = ordu.hasarHavuzu || 0; // §3.4: turlar arası hatırlanan kısmi hasar
  let can = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const saglam = (birimler[tur] || 0) - (yarali[tur] || 0);
    can += (saglam + (yarali[tur] || 0) * M.YARALI_CAN) * S[tur].dayaniklilik;
  }
  return {
    statlar: S,
    birimler,
    yarali,
    girisYarali: { ...yarali },
    baslangic: { ...birimler },
    baslangicToplam: Math.max(1, birimSayisi(birimler)),
    baslangicCan: Math.max(1, can),
    havuz,
    alinan: havuz, // muharebeye YIPRANMIŞ girmek de yıpranmadır
    kayiplar: {},
    moral: moralHesapla(birimler, kalemSayisi(bonus)),
    baslangicMoral: moralHesapla(birimler, kalemSayisi(bonus)),
    bozgunEsigi: bozgunEsigiHesapla(bonus, moralAyari || M.MORAL),
    // ÇELİK YÜREK kademe 3: bu ordu bozulmaz, kaybederse yok olur.
    olumune: !!olumune,
  };
}

// ---- MORAL BONUSUNUN İKİ BİÇİMİ ----
//
// Yeni biçim: `{ moral: 5, kalem: 2 }` — ilin moral statı ve durum kalemleri ayrı.
// Eski biçim: düz sayı (yalnız kalem sayısı). §3.7 doğrulama tablosu, ölçüm betikleri ve
// muharebe tahmini bonussuz çalışıyor; eski biçim kabul edilmeye devam ediyor ki o
// çağrıların hiçbiri değişmek zorunda kalmasın.
function kalemSayisi(bonus) {
  if (!bonus) return 0;
  return typeof bonus === 'number' ? bonus : bonus.kalem || 0;
}
function moralStati(bonus) {
  return bonus && typeof bonus === 'object' ? bonus.moral || 0 : 0;
}

// ---- BOZGUN EŞİĞİ (2026-08-08, Baki'nin moral isteği) ----
//
//   eşik = TABAN + MORAL_PAYI × (ilin moral statı / MORAL_OLCEGI) + kalem × BONUS_PAYI
//
// TABAN her orduda var — "morali düşük bile olsa o kadar hızlı dağılmamalı". Moral statı
// EK belirliyor: yüksek moralli il daha uzun dayanıyor, yani savaş daha uzun sürüyor.
// Gerekçesi ve ölçümü `denge.js MORAL` notunda; süre etkisi `veri/denge-mimarisi.md` §4.
export function bozgunEsigiHesapla(bonus, ayar) {
  const A = ayar || M.MORAL;
  // Eski `BOZGUN_ORANI` alanı hâlâ verilmişse ona saygı duyuluyor: `moral-olcum.js`
  // iki modeli karşılaştırırken kendi ayarını geçiriyor ve o ölçüm tekrar edilebilir
  // kalmalı (Görev 06'nın kuralı).
  const taban = A.TABAN !== undefined ? A.TABAN : A.BOZGUN_ORANI || 0;
  const moralPayi =
    A.MORAL_PAYI && A.MORAL_OLCEGI ? A.MORAL_PAYI * (moralStati(bonus) / A.MORAL_OLCEGI) : 0;
  const esik = taban + moralPayi + kalemSayisi(bonus) * (A.BONUS_PAYI || 0);

  // ---- ⚠ TAVAN (Görev 16 / Adım 5) ----
  // Kalemler üst üste biniyor ve komutanın ÇELİK YÜREK yeteneği iki kalem daha ekliyor;
  // tavansız altı kalem eşiği 0.975'e taşıyor, yani ordu fiilen bozulmaz hâle geliyor.
  //
  // TAVAN `ayar`DAN OKUNUYOR, BURAYA GÖMÜLMÜYOR: bu fonksiyon `moral-olcum.js`'ten KENDİ
  // ayarıyla çağrılıyor ve o ölçüm tekrar edilebilir kalmak zorunda. Ayarında TAVAN
  // olmayan çağıran (eski ölçüm, §3.7 tablosu) hiç kırpılmıyor — davranışı değişmiyor.
  return A.TAVAN !== undefined ? Math.min(esik, A.TAVAN) : esik;
}

// MUHAREBEDEN KAÇ BİRİM YARALI ÇIKAR (2026-07-31, Baki'nin isteği).
//
// YENİ FORMÜL YOK: motorun zaten tuttuğu YIPRANMA ORANI kullanılıyor (alınan hasar /
// başlangıç canı) — beraberlik bozma kuralı da aynı ölçüyü kullanıyor. Hayatta kalanların
// bu oran kadarı yaralıdır:
//   ezici kazanan → oran ~0 → kimse yaralanmaz   ("bir şey olmama" durumu)
//   kanlı zafer   → oran orta → bir kısmı yaralı
//   bozulup kaçan → oran en yüksek → neredeyse hepsi yaralı
//
// TABAN: muharebeye yaralı girip SAĞ ÇIKANLAR yaralı kalır. Savaşmak kimseyi iyileştirmez;
// iyileşmenin tek yolu toplanmadır (§3.9).
//
// Tam sayıya bölüşüm, projenin her yerinde olduğu gibi EN BÜYÜK ARTIK yöntemiyle.
function yaralariBelirle(taraf) {
  const kalan = birimSayisi(taraf.birimler);
  if (kalan === 0) return {};

  const sonuc = {};
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = taraf.yarali[tur] || 0;
    if (n > 0) {
      sonuc[tur] = n;
      toplam += n;
    }
  }

  const hedef = Math.round(kalan * kis(taraf.alinan / taraf.baslangicCan, 0, 1));
  if (toplam >= hedef) return sonuc;

  // Kalan payı SAĞLAM birimler arasında dağıt.
  const eklenecek = hedef - toplam;
  const saglam = {};
  let saglamToplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (taraf.birimler[tur] || 0) - (sonuc[tur] || 0);
    if (n > 0) {
      saglam[tur] = n;
      saglamToplam += n;
    }
  }
  if (saglamToplam === 0) return sonuc;

  const artiklar = [];
  let dagitilan = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    if (!saglam[tur]) continue;
    const ham = (saglam[tur] * eklenecek) / saglamToplam;
    const taban = Math.min(Math.floor(ham), saglam[tur]);
    if (taban > 0) {
      sonuc[tur] = (sonuc[tur] || 0) + taban;
      dagitilan += taban;
    }
    artiklar.push({ tur, artik: ham - Math.floor(ham) });
  }
  artiklar.sort((a, b) => b.artik - a.artik);
  for (let i = 0; dagitilan < eklenecek && i < artiklar.length; i++) {
    const tur = artiklar[i].tur;
    if ((sonuc[tur] || 0) >= (taraf.birimler[tur] || 0)) continue;
    sonuc[tur] = (sonuc[tur] || 0) + 1;
    dagitilan++;
  }
  return sonuc;
}

// ---- SAHADA KALAN HERKESİ KAYBA YAZ (ÇELİK YÜREK kademe 3) ----
//
// Ordu yok oluyor ama kayıp DÖKÜMÜ korunuyor: hayatta kalanlar `kayiplar`a ekleniyor,
// mevcut ve yaralı listesi boşalıyor. Tur raporu "kaç birim kaybettim" sorusunu bu
// dökümden cevapladığı için birimleri sessizce silmek raporu yanlış gösterirdi.
function yokEt(taraf) {
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = taraf.birimler[tur] || 0;
    if (n > 0) taraf.kayiplar[tur] = (taraf.kayiplar[tur] || 0) + n;
  }
  taraf.birimler = {};
  taraf.yarali = {};
}

function tarafSonuc(taraf, bozgun) {
  return {
    birimler: taraf.birimler,
    yarali: yaralariBelirle(taraf),
    hasarHavuzu: kisalt(taraf.havuz),
    kayiplar: taraf.kayiplar,
    moral: taraf.moral,
    baslangicMoral: taraf.baslangicMoral,
    kalan: birimSayisi(taraf.birimler),
    bozgun: !!bozgun,
  };
}

// ---- ANA ÇÖZÜM ----
//
// saldiran / savunan : { birimler, hasarHavuzu }
// arazi              : HEDEF parçanın arazisi (§3.5) — muharebe orada geçiyor
// moralBonuslari     : { saldiran, savunan } — bonusları çağıran hesaplar (§3.8, boşluk 6)
// tohum              : şans üretecinin BAŞLANGIÇ DURUMU. null/undefined verilirse şans
//                      TAMAMEN KAPALIDIR — arayüzdeki muharebe tahmini bunu kullanır,
//                      çünkü tahmin şanssız çalıştırılmış simülasyondur.
// statlar            : { saldiran, savunan } — taraf başına birim stat tablosu (Görev 06).
//                      Verilmezse ikisi de DENGE.BIRIMLER; motor eski davranışını gösterir.
//
// Dönen `rastgeleDurum`, üretecin ilerlemiş hâlidir; çağıran onu `durum.rastgele.durum`'a
// yazar. Yazılmazsa aynı tohum tekrar tekrar kullanılır ve muharebeler birbirinin kopyası olur.
export function muharebeCoz({
  saldiran,
  savunan,
  arazi,
  moralBonuslari,
  tohum,
  statlar,
  moral,
  etkiler,
  olumune,
  savunanArazisi,
}) {
  const bonus = moralBonuslari || {};
  const tablolar = statlar || {};
  // Kendine özgü araştırma dallarının muharebedeki karşılığı (Görev 07 / Adım 2b).
  // Taraf başına ayrı: araştırma tek taraflı olabiliyor. Verilmezse etki yok.
  const etki = etkiler || {};
  // Bozgun modeli DENGE'den gelir; parametre yalnızca ölçüm betiği içindir (Adım 1).
  const moralAyari = moral || M.MORAL;
  // ÇELİK YÜREK kademe 3 (Görev 16 / Adım 5): { saldiran, savunan } bayrakları.
  // Verilmezse ikisi de kapalı — motor eski davranışını gösterir.
  const om = olumune || {};
  const A = tarafKur(saldiran || {}, bonus.saldiran, tablolar.saldiran, moralAyari, om.saldiran);
  const S = tarafKur(savunan || {}, bonus.savunan, tablolar.savunan, moralAyari, om.savunan);

  const sansAcik = tohum !== null && tohum !== undefined;
  const uretec = sansAcik ? rastgeleKur(tohum, tohum) : null;
  const sans = () => (uretec ? uretec.aralik(1 - M.SANS_BANDI, 1 + M.SANS_BANDI) : 1);

  // ---- AÇILIŞ SÖNÜMÜ (Görev 12 / Adım 4–5) ----
  // Gün çarpanı ve baskın MUHAREBE BAŞINDA bir kez karara bağlanıyor, o yüzden ölçüleri de
  // muharebenin AÇILIŞ durumundan alınıyor (1. raundun ham hasarı). Raunt şansı ise her
  // raunt kendi anına bakmaya devam ediyor — ordular eridikçe oran değişiyor.
  const acilisSonum = sansAcik
    ? sansSonumu(
        hamHasar(A.birimler, zOrt(S.birimler, S.statlar), A.statlar),
        hamHasar(S.birimler, zOrt(A.birimler, A.statlar), S.statlar)
      )
    : 0;

  // GÜN ÇARPANI: taraf başına BİR KEZ çekilir, bütün raunt boyunca sabit kalır ("o gün
  // iyi savaştılar"). Raunt şansının aksine ortalamaya yakınsamadığı için sürpriz üreten
  // şey bu. Sönümle çarpılıyor: umutsuz eşleşmede 1'e iner, yani hiç etkisi kalmaz.
  const gun = () =>
    uretec && acilisSonum > 0 ? 1 + uretec.aralik(-M.GUN_BANDI, M.GUN_BANDI) * acilisSonum : 1;
  const gunA = gun();
  const gunS = gun();

  // BASKIN: zayıf taraf ilk raundu bedavaya alır — güçlü taraf o raunt karşılık veremez.
  // Olasılık sönümle çarpılıyor (denk savaşta en yüksek, umutsuzda sıfır), yani Baki'nin
  // "1 piyade 2 zırhlıda olasılık 0 olmalı" şartı kuralın kendisinden geliyor.
  const B = M.BASKIN || {};
  let baskin = null;
  if (sansAcik && B.ACIK && acilisSonum > 0) {
    if (uretec.aralik(0, 1) < B.OLASILIK * acilisSonum) {
      const hamA0 = hamHasar(A.birimler, zOrt(S.birimler, S.statlar), A.statlar);
      const hamS0 = hamHasar(S.birimler, zOrt(A.birimler, A.statlar), S.statlar);
      // Eşitlikte SALDIRAN baskını yapar: baskın saldırının kendisine ait bir fırsattır.
      baskin = hamA0 <= hamS0 ? 'saldiran' : 'savunan';
    }
  }

  const turlar = [];

  // Boş orduyla muharebe olmaz. Buraya düşmemesi gerekir (hareket kuralları engelliyor),
  // ama motor tek başına da doğru cevap versin.
  if (birimSayisi(A.birimler) === 0 || birimSayisi(S.birimler) === 0) {
    const kazanan =
      birimSayisi(A.birimler) === 0
        ? birimSayisi(S.birimler) === 0
          ? null
          : 'savunan'
        : 'saldiran';
    return bitir(A, S, turlar, kazanan, 'imha');
  }

  // ---- BARAJ ATEŞİ — RAUNT 0 (2026-08-08, Baki'nin isteği) ----
  //
  // Muharebe başlamadan önce topçular bir kez ateş eder ve karşı taraf CEVAP VEREMEZ.
  // İki tarafta da baraj varsa ikisi de ateş eder; eşzamanlılık kuralı burada da geçerli,
  // yani "kim önce vurur" diye gizli bir sıra doğmuyor.
  //
  // ⚠ BARAJ SONRASI BOZGUN KONTROLÜ YOK, YALNIZCA İMHA KONTROLÜ VAR. Sebep: bozgun eşiği
  // canın yarısı ve güçlü bir baraj tek başına oraya ulaşabiliyor — savaş hiç başlamadan
  // "ordu dağıldı" demek olurdu. Ateş altında kalan birlik ilk raundu görmeli; imha ise
  // ayrı, ortada savaşacak kimse kalmamışsa muharebe zaten bitmiştir.
  const barajA = barajHasari(
    A.birimler,
    zOrt(S.birimler, S.statlar),
    arazi,
    false,
    A.statlar,
    (etki.saldiran || {}).baraj
  );
  const barajS = barajHasari(
    S.birimler,
    zOrt(A.birimler, A.statlar),
    arazi,
    true,
    S.statlar,
    (etki.savunan || {}).baraj
  );

  if (barajA > 0 || barajS > 0) {
    S.havuz += barajA;
    S.alinan += barajA;
    A.havuz += barajS;
    A.alinan += barajS;

    const oncekiA = { ...A.kayiplar },
      oncekiS = { ...S.kayiplar };
    const sonKurbanA = kayiplariUygula(A);
    const sonKurbanS = kayiplariUygula(S);

    // Karşılıklı imha koruması — raunt döngüsündeki kuralın aynısı.
    if (birimSayisi(A.birimler) === 0 && birimSayisi(S.birimler) === 0) {
      if (dahaAzYipranan(A, S) === 'saldiran') sonKaybiGeriAl(A, sonKurbanA);
      else sonKaybiGeriAl(S, sonKurbanS);
    }

    turlar.push({
      tur: 0,
      baraj: true,
      saldiranVurus: kisalt(barajA),
      savunanVurus: kisalt(barajS),
      saldiranKayip: birimSayisi(farkAl(A.kayiplar, oncekiA)),
      savunanKayip: birimSayisi(farkAl(S.kayiplar, oncekiS)),
      saldiranKalan: birimSayisi(A.birimler),
      savunanKalan: birimSayisi(S.birimler),
      saldiranMoral: A.moral,
      savunanMoral: S.moral,
      sans: false,
      baskin: null,
    });

    const aBos = birimSayisi(A.birimler) === 0,
      sBos = birimSayisi(S.birimler) === 0;
    if (aBos || sBos) return bitir(A, S, turlar, aBos ? 'savunan' : 'saldiran', 'imha');
  }

  // Savaşın uzunluğu MUHAREBE BAŞINDAKİ kadroya göre bir kez belirleniyor: ordular
  // eridikçe kademe düşseydi savaş kendi kendini kısaltır ve "büyük savaş uzun sürer"
  // kuralı ortadan kalkardı.
  const enCokRaunt = rauntSayisi(A.birimler, S.birimler);

  // ---- ⚠ HASAR RAUNT SAYISINA BÖLÜNÜYOR (2026-08-08) ----
  //
  // Kademe tablosu tek başına İŞE YARAMIYORDU. Ölçüm bunu açıkça gösterdi: 40 piyadeye
  // 40 piyade, kademesi 4 raunt olmasına rağmen **1 rauntta** bitiyordu — bir raundluk
  // hasar savunanın canının ~%50'si ve bozgun eşiği %40, yani ordu daha ikinci raunt
  // gelmeden dağılıyordu. Bütün kademeler aynı sebeple 1'e çöküyordu.
  //
  // ÇÖZÜM: bir raundun hasarı savaşın uzunluğuna bölünüyor. SAVAŞIN TOPLAM ŞİDDETİ
  // DEĞİŞMİYOR — 4 raunt süren bir savaşta her raunt dörtte bir vuruyor, sonunda aynı
  // hasar birikiyor. Değişen tek şey o hasarın kaç parçaya yayıldığı, yani kim kazanır
  // sorusunun cevabı aynı kalıyor (§3.7'nin 15 satırı bundan etkilenmedi).
  //
  // Yan faydası: büyük savaşlar artık gerçekten kademeli ilerliyor ve moralin "erken
  // dağılma" etkisi ancak burada görünür oluyor — küçük savaş zaten tek raunt.
  const rauntBoleni = Math.max(1, enCokRaunt);

  // ---- İVME (2026-08-08, Baki: "1. turun sonuçları 2. turu etkilesin") ----
  // Bir raundda oransal olarak daha az yıpranan taraf, sonraki raundda biraz daha sert
  // vuruyor. Etki raunttan raunda ÇARPILARAK birikiyor, tavanla kırpılıyor. Gerekçesi
  // ve tavanın neden şart olduğu `denge.js IVME` notunda.
  const IV = M.IVME || {};
  let ivmeA = 1,
    ivmeS = 1;

  for (let tur = 1; tur <= enCokRaunt; tur++) {
    const zA = zOrt(A.birimler, A.statlar),
      zS = zOrt(S.birimler, S.statlar);

    // §3.6 — şans YALNIZCA güçler yakınken. Ölçü ham hasar (arazi/şans öncesi).
    const hamA = hamHasar(A.birimler, zS, A.statlar),
      hamS = hamHasar(S.birimler, zA, S.statlar);
    const sonum = sansAcik ? sansSonumu(hamA, hamS) : 0;
    const sansDevrede = sonum > 0;

    // EŞZAMANLI: ikisi de tur başındaki kadroya göre vurur (boşluk 2).
    // Üç kalem çarpılıyor: raunt şansı (her raunt ayrı) × gün çarpanı (muharebe başına
    // bir kez) × baskın (ilk raunt, tek taraflı).
    const carpanA = (sansDevrede ? 1 + (sans() - 1) * sonum : 1) * gunA * ivmeA;
    const carpanS = (sansDevrede ? 1 + (sans() - 1) * sonum : 1) * gunS * ivmeS;
    // Baskını YİYEN taraf ilk RAUNT kadar vuramaz. Süre DENGE'den okunuyor: mimari
    // değişip savaşlar uzarsa baskının göreli ağırlığı da oradan ayarlanabilsin
    // (2026-08-08'de tam bu oldu — gerekçesi `denge.js BASKIN.RAUNT` notunda).
    const baskinRaunt = (B && B.RAUNT) || 1;
    const susanA = baskin === 'savunan' && tur <= baskinRaunt;
    const susanS = baskin === 'saldiran' && tur <= baskinRaunt;
    const vuranA = susanA
      ? 0
      : (araziliHasar(A.birimler, zS, arazi, false, A.statlar, etki.saldiran) * carpanA) /
        rauntBoleni;
    const vuranS = susanS
      ? 0
      : (araziliHasar(S.birimler, zA, arazi, true, S.statlar, etki.savunan, savunanArazisi) *
          carpanS) /
        rauntBoleni;

    S.havuz += vuranA;
    S.alinan += vuranA;
    A.havuz += vuranS;
    A.alinan += vuranS;

    const oncekiA = { ...A.kayiplar },
      oncekiS = { ...S.kayiplar };
    const sonKurbanA = kayiplariUygula(A);
    const sonKurbanS = kayiplariUygula(S);

    // Karşılıklı imha — biri ayakta kalmalı, tam sayı sınırında kaybolan kırıntı geri verilir.
    if (birimSayisi(A.birimler) === 0 && birimSayisi(S.birimler) === 0) {
      if (dahaAzYipranan(A, S) === 'saldiran') sonKaybiGeriAl(A, sonKurbanA);
      else sonKaybiGeriAl(S, sonKurbanS);
    }

    turlar.push({
      tur,
      saldiranVurus: kisalt(vuranA),
      savunanVurus: kisalt(vuranS),
      saldiranKayip: birimSayisi(farkAl(A.kayiplar, oncekiA)),
      savunanKayip: birimSayisi(farkAl(S.kayiplar, oncekiS)),
      saldiranKalan: birimSayisi(A.birimler),
      savunanKalan: birimSayisi(S.birimler),
      saldiranMoral: A.moral,
      savunanMoral: S.moral,
      sans: sansDevrede,
      // Döküm satırı baskını yazabilsin diye: baskının sürdüğü raundlarda işaretli.
      baskin: baskin && tur <= ((B && B.RAUNT) || 1) ? baskin : null,
    });

    // Yukarıdaki geri alma sayesinde iki taraf birden imha olmuş olamaz.
    const aImha = birimSayisi(A.birimler) === 0,
      sImha = birimSayisi(S.birimler) === 0;
    if (aImha || sImha) return bitir(A, S, turlar, aImha ? 'savunan' : 'saldiran', 'imha');

    // ---- İVMEYİ GÜNCELLE: bu raundun sonucu sonrakine taşınıyor ----
    //
    // Ölçü, iki tarafın BU RAUNTTA aldığı hasarın kendi canına oranı. Fark normalize
    // ediliyor (−1 … +1), yani "kim ne kadar önde" sorusu ordu büyüklüğünden bağımsız
    // cevaplanıyor: 2 birimlik çarpışmada da 40 birimlikte de aynı ölçek.
    //
    // Çarpılarak birikiyor (Baki'nin "yığılımlı" dediği şey) ve tavanla kırpılıyor.
    if (IV.ACIK && tur < enCokRaunt) {
      const yipA = vuranS / A.baslangicCan,
        yipS = vuranA / S.baslangicCan;
      const enBuyuk = Math.max(yipA, yipS);
      if (enBuyuk > 0) {
        const fark = (yipS - yipA) / enBuyuk; // + ise SALDIRAN daha az yıprandı
        const tavan = IV.TAVAN || 1;
        ivmeA = kis(ivmeA * (1 + (IV.PAY || 0) * fark), 1 / tavan, tavan);
        ivmeS = kis(ivmeS * (1 - (IV.PAY || 0) * fark), 1 / tavan, tavan);
      }
    }

    const aBozgun = bozulduMu(A, moralAyari),
      sBozgun = bozulduMu(S, moralAyari);
    if (aBozgun || sBozgun) {
      // EŞZAMANLI BOZGUN: ikisi de dağıldıysa oransal olarak daha az yıpranan sahada kalır,
      // öteki çekilir (aynı ölçüt, `dahaAzYipranan`). Eşitlikte savunan — toprak onda.
      const kazanan = aBozgun && sBozgun ? dahaAzYipranan(A, S) : aBozgun ? 'savunan' : 'saldiran';
      A.bozgunMu = kazanan === 'savunan';
      S.bozgunMu = kazanan === 'saldiran';
      return bitir(A, S, turlar, kazanan, 'bozgun');
    }
  }

  // ---- RAUNT TAVANI DOLDU (2026-08-08) ----
  // Artık bu ISTISNA DEĞİL, NORMAL BİTİŞ: 1 rauntluk küçük çarpışmada kimse bozulmaz,
  // kimse imha olmaz. Kazananı oransal yıpranma belirliyor (eşitlikte savunan — toprak
  // onda). Kaybeden ÇEKİLME KAYBI ÖDEMEZ: bu bir bozgun değil, savaşın bitmesi.
  if ((M.SURE_DOLUNCA || 'yipranma') === 'yipranma')
    return bitir(A, S, turlar, dahaAzYipranan(A, S), 'sure');
  return bitir(A, S, turlar, null, 'berabere');

  function bitir(a, s, dokum, kazanan, neden) {
    // ---- ⚠ ÖLÜMÜNE SAVAŞANIN BEDELİ (Görev 16 / Adım 5 — ÇELİK YÜREK kademe 3) ----
    //
    // "Ya kazanır ya yok olur." Ordu hiç bozulmadı (`bozulduMu` false döndü), yani
    // çekilmedi — ama muharebeyi kaybettiyse sahada kalan HERKES ölüyor.
    //
    // Neden burada, `cozum.js`'te değil: kayıpları muharebe motoru sayar. Dışarıda
    // silinseydi hasar dökümü, yaralı listesi ve sahne kaydı birbirini tutmazdı.
    // Neden `sebep: 'imha'`: `cozum.js` "kalan > 0" ile çekilmeye karar veriyor; kalan
    // sıfırlanınca çekilme yolu kendiliğinden kapanıyor, yeni bir istisna gerekmiyor.
    let sebep = neden;
    if (a.olumune && kazanan === 'savunan') {
      yokEt(a);
      sebep = 'imha';
    }
    if (s.olumune && kazanan === 'saldiran') {
      yokEt(s);
      sebep = 'imha';
    }
    return {
      turlar: dokum,
      kazanan, // 'saldiran' | 'savunan' | null (berabere / karşılıklı imha)
      sebep, // 'imha' | 'bozgun' | 'berabere' | 'sure'
      saldiran: tarafSonuc(a, a.bozgunMu),
      savunan: tarafSonuc(s, s.bozgunMu),
      // Baskın olduysa hangi taraf yaptı — sonuç ekranı "neden kaybettim / nasıl kazandım"
      // sorusunu cevaplayabilsin diye. Olmadıysa null.
      baskin,
      rastgeleDurum: uretec ? uretec.durumAl() : tohum,
    };
  }
}

// İki kayıp tablosunun farkı — "bu turda kaç birim öldü" için.
function farkAl(yeni, eski) {
  const f = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const d = (yeni[tur] || 0) - (eski[tur] || 0);
    if (d > 0) f[tur] = d;
  }
  return f;
}

// ---- MUHAREBE TAHMİNİ (arayüz) ----
// KESİN SAYI VERMEZ. Şanssız çalıştırılmış simülasyonun sonucu üç kademede gösterilir.
// Kesin ihtimal yüzdesi vermek muharebeyi hesap tablosuna çevirirdi (görev belgesi §6/5).
//
// ┌─ 2026-07-31 DÜZELTMESİ — Baki: "1 topçu ekleyince ÜSTÜN'den DENK'e düşüyor" ─────────┐
// │ Kademe eskiden KENDİ KUVVETİNİN KAÇTA KAÇI SAĞ KALDI oranına bakıyordu:              │
// │ `kalan / gönderilen ≥ 0.5 → üstün`. Bu ölçü yanlıştı, çünkü PAYDA gönderdiğin birlik │
// │ sayısı: 4 birlikten 2'si kalırsa %50 (üstün), 5 birlikten 2'si kalırsa %40 (denk) —  │
// │ oysa ikinci saldırı savunanı TAMAMEN yok ediyordu. Birlik eklemek tahmini kötüleştir-│
// │ iyordu; taramada 66 ayrı durumda oluyordu.                                           │
// │                                                                                      │
// │ Doğru ölçü KENDİ KAYBIN DEĞİL, MUHAREBE SONUNDAKİ ÜSTÜNLÜK: iki tarafın sağ kalan    │
// │ kuvvetlerinin oranı. Karşıda kimse kalmadıysa 1.00, başa başsa 0.50. Birlik eklemek  │
// │ senin kalanını artırır ve savunanın kalanını azaltır — yani bu oran hiçbir zaman     │
// │ düşmez. Ölçüt böylece TEK YÖNLÜ oluyor.                                              │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// `ustunluk` DIŞARI DA VERİLİYOR (Görev 07): yapay zekânın fayda formülündeki "kazanma
// olasılığı" terimi budur (§9.1). Zekâ ikinci bir tahmin YAZMIYOR, bu satırdan geçiyor —
// aynı kural iki yerde tutulmaz (Görev 05'in en pahalı dersi). Kademe eşiği yalnızca
// EKRAN içindir; zekâ ham oranı kullanır, çünkü üç kademeye yuvarlamak kararları körleştirir.
//
// Dönen: { kademe: 'ustun'|'denk'|'zayif', ustunluk: 0–1, kalan, kazanan, sebep }
export function muharebeTahmini(girdi) {
  const s = muharebeCoz({ ...girdi, tohum: null });
  const benim = s.saldiran.kalan,
    onun = s.savunan.kalan;
  // Karşıda kimse kalmadıysa 1.00, başa başsa 0.50, sen silindiysen 0.00.
  const ustunluk = benim + onun === 0 ? 0 : benim / (benim + onun);
  let kademe;
  if (s.kazanan !== 'saldiran') kademe = s.kazanan === 'savunan' ? 'zayif' : 'denk';
  else kademe = ustunluk >= M.USTUNLUK_ESIGI ? 'ustun' : 'denk';
  // `savunanKalan` (Görev 20 / Adım 5): hamle çubuğu iki tarafın da kaç birlikle çıkacağını
  // sayıyla gösteriyor ('KIL PAYI' tek başına yetmiyordu — Baki: 'biraz daha açıklayıcı').
  return {
    kademe,
    ustunluk,
    kalan: s.saldiran.kalan,
    savunanKalan: s.savunan.kalan,
    kazanan: s.kazanan,
    sebep: s.sebep,
  };
}
