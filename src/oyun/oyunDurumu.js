// OYUN DURUMU — oyunun o anki hâli TEK bir yapıda durur (Görev 03 §6.6 / §7 Adım 2).
//
// KURALLAR (bunlara uyulmazsa kayıt/yükleme kırılır):
//   • Sadece DÜZ VERİ: sayı, metin, dizi, nesne. Fonksiyon yok, sınıf yok.
//   • Harita geometrisi (parça şekilleri) buraya GİRMEZ — sadece parça kimlikleri girer.
//     `parcalar.json` 1.58 MB; kayıt dosyası birkaç on KB'ı geçmemeli.
//   • Sahiplik SADECE parçada tutulur. "İlin sahibi" diye bir alan YOKTUR (§6.2);
//     bir il ancak tüm parçaları aynı aktördeyse o aktörün sayılır — türetilmiş bilgidir.
//   • `surum` alanı: yapı ileride değişirse eski kayıtları çevirebilmek için.
//
// Kesirli havuz uyarısı (§6.4): nüfus/ekonomi havuzları KESİRLİ saklanır (4.4 gibi),
// ekranda yuvarlanır. Her tur yuvarlanırsa 50 turda kaynağın bir kısmı buhar olur.

// Not: `src/oyun/` içindeki içe aktarmalarda dosya uzantısı (.js) yazılır —
// testleri çalıştıran Node bunu şart koşuyor, telefondaki paketleyici de kabul ediyor.
import { DENGE } from '../denge.js';
import { yeniTohum } from './rastgele.js';
import { senaryoKapsami } from './senaryolar.js';
import { aktorRengi } from '../tema.js';
import { ILLER, PARCALAR } from './veri.js';
import { garnizonlariKur } from './garnizon.js';
import { kisilikUret } from './kisilik.js';
import { yeniSayaclar } from './sayac.js';

// Kayıt yapısının sürümü. Yapı VEYA harita değişirse burası artar.
//   1 → ilk sürüm (Görev 03)
//   2 → Görev 03B harita revizyonu: parçalar birleşti, kimlikler değişti (193 → 185).
//   3 → Yeniden bölümleme (2026-07-26): tüm iller okunabilirlik ölçütüyle yeniden
//       bölündü, parça sayısı 1–4 oldu, kimlikler baştan numaralandı (185 → 181).
//       Eski kayıtlardaki parça kimlikleri artık haritada yok; sessizce bozuk yüklemek
//       yerine kayıt reddediliyor (bkz. kayitVerisi.js).
//   4 → Görev 04: orduların geldiği sürüm. Duruma `ordular` ve `buTurUretim` alanları
//       eklendi. Sürüm 1–3 kayıtlarında ordu yok; yüklenirlerse oyuncu ordusuz bir oyuna
//       düşer ve bunu anlamaz — reddetmek daha dürüst.
//   5 → Görev 05: hareket ve muharebe. Duruma `emirler` (emir kuyruğu) ve `sonTurRaporu`
//       eklendi, ordulara `hasarHavuzu` geldi, kurulumda her parçaya garnizon konuyor.
//       Sürüm 4 ayrı bir ret sebebi hak ediyor: harita ve ordular aynı ama emir kuyruğu
//       ve garnizonlar yok. Yüklenirse oyuncu bomboş bir haritada, kimsenin savunmadığı
//       parçalara yürür ve muharebeyi hiç göremez — sessizce yanlış bir oyun olur.
//   6 → Görev 06: yeniden toplanma ve araştırma. Duruma `arastirma` alanı, ordulara
//       `kadro` alanı eklendi. Sürüm 5 ayrı bir ret sebebi hak ediyor: harita, ordular ve
//       garnizonlar aynı ama kadro ve araştırma yok. Yüklenirse oyuncunun hiçbir ordusu
//       toplanamaz (hepsi "eksiksiz" görünür) ve araştırma ekranı bomboş açılır — nedeni
//       hiçbir yerde yazmaz.
//   7 → Görev 07: düşünen rakip. Duruma `kisilikler` ve `zorluk` alanları eklendi;
//       ayrıca muharebe statları 25× ölçeklendi ve araştırma kaydı BİRİM BAŞINA ağaca
//       geçti (eskiden `{ zirh: 2 }`, artık `{ "piyade.zirh": 2 }`). Sürüm 6 için ret
//       sebebi ikili: (a) dünya duruyordu, artık oynuyor — kişiliksiz yüklenen kayıtta
//       80 aktör hareketsiz kalır ve oyuncu oyunun bozulduğunu sanır; (b) araştırma
//       anahtarları değiştiği için eski kaydın araştırması sessizce sıfır görünürdü.
//
// ---- SÜRÜM 8 KARARI (Görev 08 / Adım 0 · görev belgesi §7) ----
//
// Görev 08 sürümü 8'e ÇIKARACAK ama HENÜZ DEĞİL. Karar ve gerekçesi:
//
//   • Düello turlara yayılıyor. Baki, §11'in "üçüncü devlet düelloya karışamaz" kuralını
//     da istedi (2026-08-01); yani düello bir turluk olay değil, DUELLO_SURESI boyunca
//     süren bir durum. `durum.duellolar` alanı gerekiyor → sürüm 8.
//   • OLAY LİSTESİ KAYDA GİRMİYOR (§7). Tur çözüldüğünde doğar, oynatılır, atılır —
//     tur raporunun kuralının aynısı. Sahne katmanı kayıt biçimine hiç dokunmuyor.
//   • Ses / titreşim / gösterim ayarları da kayda girmiyor: onlar oyun durumu değil
//     CİHAZ TERCİHİ, farklı oyunlar arasında taşınmalı (§6/10).
//
// SÜRÜM NEDEN ŞİMDİ YÜKSELTİLMİYOR: Görev 07'nin dersi (rapor §8/4) "sürüm, durumun
// biçimi DEĞİŞTİĞİ adımda yükseltilir" — ne önce ne sonra. Şimdi yükseltmek, hiçbir şey
// değişmemişken Baki'nin elindeki kaydı reddetmek olurdu. Adım 7'de `durum.duellolar`
// eklenirken yükselecek ve sürüm 7 için ret sebebi oraya yazılacak.
//
// Kayıt payı ölçüldü: 15 turda 25.2 KB, sınır 26 → ~0.8 KB pay. Düello kaydı en kötü
// durumda ~0.25 KB (DENGE.REKABET.EN_COK_ETKIN bunu garantiliyor, testle kilitli).
//
//   8 → Görev 08: kutsal savaşlar. Duruma `duellolar` alanı eklendi ([{ a, b, tur }]).
//       Sürüm 7 için ret sebebi: düellosuz kaydedilmiş bir oyunda hasım illerin arasındaki
//       kutsal savaş HİÇ TETİKLENMEZ (tetikleyici "ilk saldırı" ve o saldırı çoktan
//       olmuştur), üstelik üçüncü taraf kısıtı da hiç işlemez. Oyun çalışıyor GÖRÜNÜR ama
//       §11'in tamamı sessizce ölü kalır — Görev 05'in "en tehlikeli olan, çalışıyor
//       görünmesi" dersinin aynısı.
//
// ---- SÜRÜM 9 KARARI (Görev 09 / Adım 0 · görev belgesi §7) ----
//
// Görev 09 sürümü 9'a ÇIKARACAK ama ADIM 0'DA DEĞİL. Görev belgesi sürüm 9'u Adım 8'e
// yazmıştı; Adım 0'da kayıt biçimi zaten değişti (aktörün türetilen dört alanı artık
// yazılmıyor, bkz. `kayitVerisi.js`), yani "biçim değişti mi" sorusunun cevabı EVET.
// Buna rağmen sürüm yükseltilmiyor ve sebebi tek cümle:
//
//   O DEĞİŞİKLİK GERİYE DÖNÜK UYUMLU YAZILDI. `metinCoz` alanları `a.ad || türet`
//   kalıbıyla okuyor; sürüm 8 kaydı bugün sorunsuz yükleniyor. Sürümü yükseltmek,
//   HİÇBİR ŞEY BOZULMAMIŞKEN Baki'nin elindeki kaydı reddetmek olurdu — Görev 07'nin
//   dersi (rapor §8/4) tam olarak buna karşı yazılmıştı.
//
// SÜRÜM 9 ADIM 5'TE YÜKSELECEK, çünkü sürüm 8 kaydını gerçekten kıran şey orada geliyor:
// `durum.mod` (kazanma koşulu ve kapsam). Modu olmayan bir kayıt yüklenirse kazanma
// koşulu tanımsız kalır ve MAÇ HİÇ BİTMEZ — oyun çalışıyor görünür, sadece kazanılamaz.
// Adım 1'in `iliskiler`/`ihanetler` alanları tek başına ret sebebi değil: yokluklarında
// varsayılan "tarafsız" geçerlidir (§7) ve oyun doğru çalışır.
//   9 → Görev 09: diplomasi ve mod. Duruma `iliskiler`, `ihanetler`, `teklifler`, `mod`
//       ve `sonuc` alanları eklendi; aktörün türetilebilen dört alanı kayıttan çıkarıldı.
//
//       SÜRÜM 8 İÇİN RET SEBEBİ `durum.mod`: modu olmayan bir kayıtta kazanma koşulu
//       tanımsız kalır ve MAÇ HİÇ BİTMEZ. Sinsiliği Görev 05 ve 08'in dersiyle aynı —
//       oyun tamamen çalışıyor GÖRÜNÜR, sadece kazanılamaz. Diplomasi alanları tek
//       başına ret sebebi olmazdı (yokluklarında varsayılan "tarafsız" geçerli), mod öyle
//       değil: varsayılanı yok, çünkü hangi maçı oynadığın türetilebilir bir şey değil.
// 9 → 10 (Görev 11): SAVAŞ İLANI geldi. Eski kayıtlarda savaş halleri "saldırı ilandır"
// kuralıyla yazılmıştı; yeni kuralda saldırı savaş hali GEREKTİRİYOR. Sürüm 9 kaydı
// yüklenirse oyuncu kendini savaş ortasında ama saldıramaz hâlde bulurdu — sessiz ve
// anlaşılmaz bir kilit. Emirlerin `derinlik` alanı da bu sürümle geldi (CLAUDE.md §5/7).
// 10 → 11 (Görev 12 / Adım 2): ÜÇ KARAKTER geldi. Kişilik kayda yazılmıyor, yüklerken
// `kisilikUret` ile YENİDEN TÜRETİLİYOR — ve o üretim artık aktör başına fazladan bir sayı
// çekiyor (karakter çekilişi). Sürüm 10 kaydı yüklenseydi oyun çalışırdı ama RAKİPLERİN
// HEPSİ SESSİZCE BAŞKA İNSANLARA DÖNÜŞÜRDÜ: barışçıl komşun saldırgan çıkardı, hiçbir
// yerde hata görünmezdi. Aynı tuzak Görev 08'de husumet bayrağı açılırken bir kez yaşandı
// (bkz. kisilik.js) — kural aynı: türetim değişirse sürüm artar.
// 11 → 12 (Görev 12 / Adım 11): MAÇ SAYAÇLARI geldi (`durum.sayaclar`). Maç sonu
// istatistiği ve başarımlar bu sayaçlardan besleniyor. Sürüm 11 kaydında alan hiç yok;
// yüklenirse oyun çalışır ama maçın tamamı "hiç savaş olmamış" gibi görünür ve o maçta
// kazanılabilecek mühürlerin çoğu bir daha kazanılamaz — sessiz ve geri dönüşsüz.
// 12 → 13 (2026-08-08, Baki'nin beş isteği): KAYIT BİÇİMİ DEĞİŞMEDİ ama ANLAMI DEĞİŞTİ.
// Sürüm bu yüzden yine de artıyor — Görev 12'nin kişilik dersinin aynısı: alanlar aynı
// kalsa bile aynı kayıt artık başka bir oyun oynatıyorsa sürüm artmak zorunda.
//
// Dört ayrı sebep, hepsi eski kaydı sessizce yanlış oynatırdı:
//   1. ÖZEL DALLARIN TAVANI 3 → 1. Eski kayıtta `"zirhli.yarma": 3` gibi bir satır
//      olabilir; yeni kuralda tavan 1 ve o dal 180 puan yerine 12 puan ediyor. Oyuncu
//      ödediği puanı geri alamaz, üstelik dört yeteneğin etkisi de tamamen değişti
//      (yarma artık "1 birim fazla kayıp" değil, "ordu yok olur").
//   2. TUR SINIRI KALKTI. Sürüm 12 kaydında fetih maçı 150. turda "süre doldu, toprağa
//      bak" ile bitiyordu; şimdi bitmiyor. Kayıt yüklenirse oyuncunun kazanmayı beklediği
//      an hiç gelmez — kilit değil ama sözleşme ihlali.
//   3. BİTİRME İŞTAHI GELDİ. Yapay zekânın kararı artık `durum.tur`a bağlı. 80. turdaki
//      bir kayıt yüklendiğinde rakipler bir anda çok daha saldırgan olur; oyuncu neyin
//      değiştiğini hiçbir yerde göremez.
//   4. BARIŞ TURU VE İTTİFAK KURALLARI değişti (güç tavanı, erken eşik).
// 13 → 14 (2026-08-08, aynı gün ikinci tur): MUHAREBE MİMARİSİ SIFIRDAN KURULDU.
// Baki dokuz birim statını birden yeniden tarif etti ve moral sistemi değişti. Kayıt
// biçimi yine aynı ama içindeki her ordu artık başka bir şey ifade ediyor:
//   • Dayanıklılıklar 4× büyüdü (350/275/550 → 1400/1100/2200). Sürüm 13 kaydındaki
//     `hasarHavuzu` değerleri eski ölçeğe ait — yüklenirse yıpranmış bir ordu kâğıt
//     üstünde neredeyse sağlam görünür, çünkü havuz yeni cana göre çok küçük kalır.
//   • Bozgun eşiği tek sayı olmaktan çıktı (TABAN + ilin moral statı + durum kalemleri).
//     Aynı ordu aynı savaşta artık başka bir turda dağılıyor.
//   • Baraj ateşinin oranı 0.80 → 3.25 (aynı cümle, yeni ölçek).
// 14 → 15 (2026-08-08, aynı gün üçüncü tur): SAVAŞ SÜRESİ VE STAT ÖLÇEĞİ.
// Baki savaş uzunluğunu ordu büyüklüğüne bağladı ve statların iki basamağa inmesini
// istedi. Sürüm 14 kaydı yüklenirse iki şey birden yalan söyler:
//   • `hasarHavuzu` değerleri eski ölçeğe ait (canlar 1400 → 70'e indi); yıpranmış bir
//     ordu kâğıt üstünde tamamen yok olmuş görünür.
//   • Aynı muharebe artık başka sayıda raunt sürüyor ve hasar o sayıya bölünüyor.
// 15 → 16 (2026-08-08, dördüncü tur): RAUNT ÖLÇÜSÜ · İVME · ARAŞTIRMA ARTIŞI.
// Üçü de aynı muharebeyi başka türlü sonuçlandırıyor:
//   • Raunt ölçüsü toplam birim yerine 2 × küçük taraf oldu (15'e 1 artık tek raunt).
//   • İvme geldi: bir raundun sonucu sonrakine taşınıyor.
//   • Araştırma artışı %10 → %20; sürüm 15'te Sv.3 olan bir dal artık başka bir stat veriyor.
// 16 → 17 (2026-09-19, Görev 15): ANINDA ÇÖZÜM. Hamle artık verildiği an çözülüyor.
// Eski kayıtlar bu yüzden DOĞRUDAN yüklenemez, iki sebeple:
//   • Kuyrukta bekleyen hareket emirleri var; yeni motorda onları çözecek bir an yok —
//     birimleri sonsuza kadar rezerve ederek orduyu felç ederlerdi.
//   • Hamle hakkı artık `ordu.hamle` defterinde ve türe göre (piyade 1 · topçu 1 ·
//     zırhlı 2); eski kayıtta o alan hiç yok, yani bütün ordular "hiç hareket etmemiş"
//     sayılır — tek başına zararsız ama yukarıdaki kuyrukla birleşince tutarsız.
// 17 → 18 (2026-09-20, Görev 16 / Adım 4): KOMUTAN. Kayıt artık `komutanlar` alanını
// taşıyor (kimin komutanı nerede, kaç tur bekleme cezası var). Sürüm 17 kaydı yüklenseydi
// komutanlar boş başlar ve moral kalemi sessizce kaybolurdu — oyuncu "komutanım nerede"
// diye sorardı ve cevabı hiçbir yerde olmazdı.
// 18 → 19 (2026-09-20, Görev 16 / Adım 5): KOMUTAN YETENEKLERİ. `komutanlar` satırı artık
// `yetenek` · `kademe` · `birim` de taşıyor. Sürüm 18 kaydı yüklenseydi komutanlar
// yeteneksiz dönerdi: oyuncunun mühürle açtığı kademe ve Silah Ustası'nın birlik seçimi
// sessizce kaybolurdu — kaydını yükleyen oyuncu komutanının neden zayıfladığını anlamazdı.
export const KAYIT_SURUMU = 19;

// İlin haritadaki rengi (parçalarından okunur) — aktör rengi buradan gelir ki
// panelde görülen renk ile haritadaki renk aynı olsun.
const IL_HARITA_RENGI = {};
for (const pid of Object.keys(PARCALAR)) {
  const p = PARCALAR[pid];
  if (!IL_HARITA_RENGI[p.kod]) IL_HARITA_RENGI[p.kod] = p.renkIl;
}

// Aktör kimliği -> renk. 81 ilin tamamı için BİR KEZ hesaplanır ve bir daha değişmez.
//
// NEDEN OYUN DURUMUNDAN OKUNMUYOR: aktör renkleri oyun boyunca sabittir, ama
// `durum.aktorler` her tur ve her satın almada yeni bir nesne olarak doğuyor. Bu tabloyu
// oradan türetmek, kimliği her seferinde değişen bir renk tablosu üretiyordu; harita da
// ona bağlı olduğu için 181 parçanın tamamı yeniden çiziliyordu. Sabit tablo bunu bitirdi.
export const AKTOR_RENKLERI = {};
for (const kod of Object.keys(ILLER)) AKTOR_RENKLERI[kod] = aktorRengi(IL_HARITA_RENGI[kod]);

// Yeni oyun kurar. Oyun başında HER İL BAĞIMSIZ BİR AKTÖRDÜR (§6.1) ve
// her parçanın sahibi kendi ilidir. İttifak yok, imparatorluk yok.
//
// secenekler: { senaryo, tohum, oyuncuAktorId } — hepsi isteğe bağlı.
export function oyunKur(secenekler) {
  const s = secenekler || {};
  const senaryo = senaryoKapsami(s.senaryo || DENGE.MOD.VARSAYILAN_KAPSAM);
  const tohum = (s.tohum === undefined || s.tohum === null ? yeniTohum() : s.tohum) >>> 0;
  const oyuncuAktorId = s.oyuncuAktorId || senaryo.varsayilanOyuncu;
  const zorluk = DENGE.ZEKA.ZORLUK[s.zorluk] ? s.zorluk : DENGE.ZEKA.VARSAYILAN_ZORLUK;
  const modTipi = DENGE.MOD.TIPLER[s.mod] ? s.mod : DENGE.MOD.VARSAYILAN_TIP;

  const aktorler = {};
  for (const kod of senaryo.kapsamIller) {
    aktorler[kod] = {
      id: kod,
      ad: ILLER[kod].ad,
      renk: AKTOR_RENKLERI[kod],
      nufusHavuzu: 0, // kesirli saklanır
      ekonomiHavuzu: 0, // kesirli saklanır
      tur: kod === oyuncuAktorId ? 'insan' : 'yapayZeka',
    };
  }

  const parcaSahipligi = {};
  for (const pid of senaryo.kapsamParcalar) {
    parcaSahipligi[pid] = PARCALAR[pid].kod; // parça -> kendi ili
  }

  return garnizonlariKur({
    surum: KAYIT_SURUMU,
    tur: 1,
    senaryo: {
      anahtar: senaryo.anahtar,
      ad: senaryo.ad,
      kapsamIller: senaryo.kapsamIller,
      kapsamParcalar: senaryo.kapsamParcalar, // türetilir, kolaylık için saklanır
    },
    rastgele: {
      tohum,
      durum: tohum, // yeni oyunda üretecin durumu = tohum
    },
    oyuncuAktorId,
    aktorler,
    parcaSahipligi,
    // Ordular (Görev 04). Boş parça için kayıt TUTULMAZ.
    // Yapı: { "16-1": { sahip: "16", birimler: { piyade: 3 }, hasarHavuzu: 6 } }
    // `hasarHavuzu` (Görev 05) yalnızca sıfırdan büyükse yazılır — birim öldürmeye
    // yetmeyen artık hasar, turlar arası burada hatırlanır (§3.4).
    // Boş başlamıyor: aşağıdaki `garnizonlariKur` her parçaya kuruluş garnizonunu koyar.
    ordular: {},
    // EMİR KUYRUĞU (Görev 05 / Soru 1 → cevap B). Tur içinde dizilir, TURU BİTİR'de
    // sırayla çözülür, sonra boşalır. Yapı:
    //   [{ sahip: "16", kaynak: "16-1", hedef: "10-2", birimler: { piyade: 3 } }]
    emirler: [],
    // TUR GÜNLÜĞÜ (Görev 15): bu tur çözülmüş hamlelerin satırları. Tur raporu turu
    // bitirirken buradan besleniyor ve alan boşalıyor. KAYDA GİRMEZ (`kayitVerisi.js`).
    turGunlugu: [],
    // CASUS RAPORU (Görev 19 / Adım 2): hangi rakipler görünür hâle geldi. Kayda giriyor —
    // maçın ortasında kaydedip yükleyen oyuncu ödülünü kaybetmesin.
    casus: [],
    // ACİL SEFERBERLİK (Görev 19 / Adım 2): hangi TURDA kullanıldı. Bayrak değil tur
    // numarası: tur dönünce kendiliğinden sönüyor, ayrı sıfırlama adımı gerekmiyor.
    seferberlikTuru: null,
    // KOMUTANLAR (Görev 16 / Adım 4): { aktorId: { parcaId, bekleme, atama } }.
    // Alan BAŞTAN tanımlı olmak zorunda: "kaydedilip yüklenen oyun birebir aynı" testi
    // anahtar sırasını da karşılaştırıyor, sonradan eklenen alan kaydı ayrıştırırdı.
    komutanlar: {},
    // Son turun çözüm dökümü — tur raporu ekranı bunu okur (yoksa null).
    sonTurRaporu: null,
    // Sanayi üretim sayacı: bu tur hangi aktör hangi ilde kaç birim bastı.
    // Her tur sıfırlanır (turDongusu.js). Yapı: { "16": { "16": 3 } }
    buTurUretim: {},
    // ARAŞTIRMA (Görev 06 / §6). Yalnızca araştırması OLAN aktörler için kayıt tutulur —
    // 81 aktör için boş nesne yazmak kayıt dosyasını boşuna şişirirdi. Yapı:
    //   { "16": { zirh: 2, agir: 0, hafif: 1, puan: 3.4, buTurAyrilan: 4 } }
    // `puan` KESİRLİ saklanır (§6.4); yuvarlansaydı her tur biraz kaynak buharlaşırdı.
    // `buTurAyrilan` ve `buTurAtlanan` turluktur, tur sonunda silinir.
    arastirma: {},
    // ---- YAPAY ZEKÂ (Görev 07 / §9.4) ----
    // Aktör başına dört kişilik ağırlığı. OYUN KURULURKEN TOHUMDAN üretiliyor ve kayıtta
    // duruyor ki yükleyince aynı rakiplerle devam edilsin. Oyuncunun kendi kaydı da var
    // ama kullanılmıyor — sıra sisteminde oyuncu ayrı ele alınıyor; yazılmasının sebebi
    // tablonun aktör listesiyle birebir olması, eksik anahtar aramak zorunda kalmamak.
    //   { "06": { saldirganlik: 0.7, acgozluluk: 0.4, husumet: 0, temkin: 0.5 } }
    kisilikler: kisilikUret(tohum, Object.keys(aktorler), zorluk),
    // MAÇ SAYAÇLARI (Görev 12): başlangıç bölge sayısı BURADA yazılıyor — maç ilerledikçe
    // "kaç bölgeyle başlamıştım" öğrenilemez hale gelir.
    sayaclar: yeniSayaclar(Object.values(parcaSahipligi).filter((x) => x === oyuncuAktorId).length),
    // Zorluk kademesi (kolay | orta | zor). §9.4: "zorluk = ağırlık ayarı, hesap değil" —
    // yalnızca kişilik aralıklarını ve karar gürültüsünü değiştirir, gizli bonus yoktur.
    zorluk,
    // ---- KUTSAL SAVAŞLAR (Görev 08 / §11) ----
    // Etkin düellolar: [{ a, b, tur }] — `tur` başlangıç turu, süre dolunca düşüyor.
    // Hasım çiftlerinin KENDİSİ burada değil, `veri/husumetler.js`'te: o bir TABLO, bu bir
    // DURUM. Tabloyu kayda yazmak, Baki satır eklediğinde eski kayıtları yalancı yapardı.
    // Boş başlıyor — hiçbir düello oyunun kurulumunda doğmaz, hepsi ilk saldırıyla başlar.
    duellolar: [],
    // ---- DİPLOMASİ (Görev 09 / §7) ----
    // YALNIZCA VARSAYILAN OLMAYAN İLİŞKİLER TUTULUR. 81 aktörün tam matrisi 3240 çift
    // demek; tarafsızlık varsayılan olduğu için hiçbiri yazılmaz. Anahtar biçimi
    // `küçük|büyük` simetriyi TANIM GEREĞİ garanti ediyor — aynı ilişki iki kez yazılamaz.
    //   { "06|34": { tip: "ittifak", turdan: 7 } }
    //   { "16|35": { tip: "savas", turdan: 9, son: 12 } }   ← `son` = son temas turu
    // Boş başlıyor: oyun başında herkes bağımsız ve tarafsız (§6.1).
    iliskiler: {},
    // İhanet bedeli: hangi aktör hangi TURA KADAR diplomasi yapamaz.
    //   { "06": 12 }
    ihanetler: {},
    // OYUNCUYA GELEN TEKLİFLER — [{ kimden, tip }]. Tur raporunda kart olur, kabul/ret
    // tek dokunuş (§4/Soru 2: "diplomasinin yarısı GELEN tekliftir").
    // TURLUK: cevaplanmayan teklif tur bitince düşer (turDongusu). Emir kuyruğunun kuralı;
    // biriktirilseydi oyuncu 20. turda 30 satırlık bir teklif yığınıyla karşılaşırdı.
    teklifler: [],
    // ---- MOD VE MAÇ SONUCU (Görev 09 / §7) ----
    // Yalnızca `tip` ve `kapsam` kaydediliyor; tur sınırı ve kazanma eşiği TÜRETİLİYOR
    // (bkz. `mod.js modBilgisi`). Sayıyı kayda yazsaydık `DENGE.MOD` ayarlandığında
    // süren maçlar eski sayılarla oynamaya devam eder ve kayıt yalan söylerdi.
    mod: { tip: modTipi, kapsam: senaryo.anahtar },
    // null | 'kazandi' | 'yenildi'. Maç bitince `turDongusu` yazıyor ve kayıt "bu maç
    // bitti" işaretiyle duruyor — oyuncu isterse haritayı temizlemeye devam edebilir (§6/7).
    sonuc: null,
    turGecmisi: [],
  });
}

// Parça oyuna dahil mi? (Kapsam dışı parçalar soluk gösterilir ve seçilemez.)
export function kapsamdaMi(durum, parcaId) {
  return Object.prototype.hasOwnProperty.call(durum.parcaSahipligi, parcaId);
}

// Bir aktörün elinde tuttuğu parçaların kimlikleri.
export function aktorParcalari(durum, aktorId) {
  return Object.keys(durum.parcaSahipligi).filter((pid) => durum.parcaSahipligi[pid] === aktorId);
}

// ---- SAHİPLİK DEĞİŞTİRME (Adım 8 — geliştirici test aracı) ----
// Muharebe Görev 05'te geliyor; o zamana kadar sahipliğin elle değiştirilebilmesi gerekiyor,
// yoksa ekonomi test edilemez. Hepsi YENİ durum döndürür, geleni değiştirmez.
// Değişiklik yoksa aynı nesne döner — arayüz gereksiz yere tazelenmesin.

// ORDU TOPRAKLA BİRLİKTE EL DEĞİŞTİRİR (2026-07-31, Baki: "Kocaeli'yi aldım ama
// Kocaeli'nin askerleri ilde kaldı, bana geçmediler veya yok olmadılar").
//
// Eskiden yalnızca `parcaSahipligi` değişiyordu; parçadaki garnizon eski sahibinde kalıyordu
// ve ortaya oyunun hiçbir yerinde oluşamayacak bir durum çıkıyordu: SENİN parçanda BAŞKASININ
// ordusu. O parçadan emir veremiyor, oraya asker basamıyordun — panel "senin" diyor, motor
// "değil" diyordu.
//
// Ordu YOK EDİLMİYOR, SANA GEÇİYOR. İki sebep: (1) `geri ver` düğmesi simetrik çalışsın,
// hiçbir bilgi kaybolmasın; (2) bu bir TEST aracı — aldığın toprağın ordusuyla hareket ve
// muharebe denemek isteyeceksin. Gerçek fetihte ordu elbette savaşarak yok oluyor (§3.9).
function orduyuDaAktar(ordular, parcaId, aktorId) {
  const o = ordular[parcaId];
  if (!o || o.sahip === aktorId) return ordular;
  return { ...ordular, [parcaId]: { ...o, sahip: aktorId } };
}

export function parcayiVer(durum, parcaId, aktorId) {
  if (!kapsamdaMi(durum, parcaId)) return durum; // senaryo dışı toprak
  if (!durum.aktorler[aktorId]) return durum; // oyunda olmayan aktör
  if (durum.parcaSahipligi[parcaId] === aktorId) return durum; // zaten onun
  return {
    ...durum,
    parcaSahipligi: { ...durum.parcaSahipligi, [parcaId]: aktorId },
    ordular: orduyuDaAktar(durum.ordular || {}, parcaId, aktorId),
  };
}

// Bir ilin TÜM parçalarını bir aktöre verir ("tam il" davranışını test etmek için).
export function iliVer(durum, ilKodu, aktorId) {
  if (!durum.aktorler[aktorId]) return durum;
  const yeni = { ...durum.parcaSahipligi };
  let ordular = durum.ordular || {};
  let degisti = false;
  for (const pid of Object.keys(yeni)) {
    if (PARCALAR[pid].kod !== ilKodu || yeni[pid] === aktorId) continue;
    yeni[pid] = aktorId;
    ordular = orduyuDaAktar(ordular, pid, aktorId);
    degisti = true;
  }
  return degisti ? { ...durum, parcaSahipligi: yeni, ordular } : durum;
}

// Parçayı oyun başındaki sahibine, yani kendi iline geri verir.
export function parcayiEskiHaline(durum, parcaId) {
  const p = PARCALAR[parcaId];
  return p ? parcayiVer(durum, parcaId, p.kod) : durum;
}

// İlin bütün parçalarını kendi iline geri verir (tek tek uğraşmamak için).
export function iliEskiHaline(durum, ilKodu) {
  return iliVer(durum, ilKodu, ilKodu);
}

// Bir ilin parçaları kimlerde? Panelde "3/4 parça sende, 1 parça — Balıkesir" satırı için.
// Dönen: { toplam, sahipler: [{ aktorId, ad, renk, sayi }] } — çok tutandan aza doğru sıralı.
export function ilSahiplikDagilimi(durum, ilKodu) {
  const sayim = {};
  let toplam = 0;
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (PARCALAR[pid].kod !== ilKodu) continue;
    toplam++;
    const sahip = durum.parcaSahipligi[pid];
    sayim[sahip] = (sayim[sahip] || 0) + 1;
  }
  const sahipler = Object.keys(sayim)
    .map((id) => ({
      aktorId: id,
      ad: durum.aktorler[id] ? durum.aktorler[id].ad : id,
      renk: durum.aktorler[id] ? durum.aktorler[id].renk : null,
      sayi: sayim[id],
    }))
    .sort((a, b) => b.sayi - a.sayi);
  return { toplam, sahipler };
}

// Aktörün toprak özeti — tur çubuğundaki "12/193 parça · 3 tam il" satırı için.
// TAM İL = o ilin BÜTÜN parçaları bu aktörde (§6.2: il sahipliği türetilmiş bilgidir,
// hiçbir yerde saklanmaz). Tek geçişte hesaplanır.
export function aktorOzeti(durum, aktorId) {
  const ilToplam = {}, // ildeki parça sayısı (oyun kapsamında)
    ilBenim = {}; // o ilden bu aktörde olan parça sayısı
  let parca = 0,
    toplamParca = 0;

  for (const pid of Object.keys(durum.parcaSahipligi)) {
    const kod = PARCALAR[pid].kod;
    toplamParca++;
    ilToplam[kod] = (ilToplam[kod] || 0) + 1;
    if (durum.parcaSahipligi[pid] === aktorId) {
      parca++;
      ilBenim[kod] = (ilBenim[kod] || 0) + 1;
    }
  }

  let tamIl = 0;
  for (const kod of Object.keys(ilBenim)) if (ilBenim[kod] === ilToplam[kod]) tamIl++;

  return { parca, toplamParca, tamIl, toplamIl: durum.senaryo.kapsamIller.length };
}
