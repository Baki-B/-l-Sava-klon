# GÖREV 08 — BİTİŞ RAPORU

> Tarih: 2026-08-01 · Görev tanımı: `docs/GOREV-08-hissiyat.md`
> Önceki: `docs/GOREV-07-RAPOR.md` · Günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

**Oyunda artık sonuç değil olay var.** Yedi görev boyunca emir verip TURU BİTİR'e basıp
raporu okuyordun; şimdi kamera cepheye kayıyor, ordular yürüyor, raundlar geçiyor,
rozetler titriyor, kayıplar havada uçuşuyor, parça renk değiştiriyor ve il düştüğünde
adı ekrana geliyor. Telefon elinde titriyor.

Yanında iki iş daha kapandı: **kutsal savaşlar** (§11) ve yapay zekânın **iç bölgeden
cepheye takviye taşıması** — Görev 07'nin bilinen sınırı.

---

## 2. BAKİ'NİN KARARLARI

| Soru | Cevap | Sonucu |
|---|---|---|
| 1 — Savaş nerede oynatılır | **c** karma | Haritada oynatım + önemli savaşta birlik şeridi |
| 2 — Ses ve titreşim | **A**, sonra ses **ertelendi** | Titreşim çalışıyor; ses katmanı ayrı ve boş |
| 3 — Varsayılan tempo | Hız kademesi **değil, kapsam ayarı** | Tek düğme: kapalı / cephem / hepsi |
| 4 — Yapay zekâ takviyesi | **A** tek yönlü | İç bölgeden cepheye, salınım imkânsız |
| 5 — Rekabet olayı | **B + A'nın kısıt kuralı** | Sunum + moral + ganimet + üçüncü taraf kısıtı |

### Soru 1'in hikâyesi — tarifle karar verilmiyor

Baki *"önce karmanın nasıl olacağını görmem gerek, B bana en güzel geleni"* dedi. Tarif
yetmezdi; aynı muharebe iki biçimde de canlandırılıp gösterildi. Gördükten sonra karmayı
seçti, iki şartla: **haritaya yakınlaşmada bug olmayacak** ve **önemli savaş ölçütü düzgün
olacak.**

İkisi de karşılandı ve nasıl karşılandığı §4'te.

### Soru 3'ün hikâyesi — belge yanıldı, cevap düzeltti

Görev belgesi üç **hız** kademesi öneriyordu (kapalı / hızlı / tam). Baki başka bir şey
istedi: *"bizi ilgilendiren savaşların üzerinde durabilirsek güzel olur… bu istediklerimi
en kısa olacak şekilde uygulamak için yaklaşımlar bul."*

İsteği tempo tuzağını (§4.4) başka bir yerden çözdü:

> **50 turluk oyunu işkenceye çeviren şey bir savaşın 5 saniye sürmesi değil, 80 aktörün
> savaşını izlemek.**

Oyuncunun savaşı turda 1–3 tane. Onlar TAM ayrıntıyla oynasa bile tur birkaç saniye sürer.
Yani süreyi kısaltmaya hiç gerek yok — **kapsamı daraltmak yetiyor.** Sonuç: iki ayar
yerine bir ayar, ve "izlemek istediğim savaş atlandı" durumu tanım gereği doğmuyor.

Ölçüldü (`veri/sahne-olcum.md`):

| Kapsam | Tur başına gösteri | 50 turda toplam |
|---|---|---|
| `kapali` | 0 sn | 0 dk |
| **`cephem`** (varsayılan) | **3.5 sn** | **2.9 dk** |
| `hepsi` | 8.7 sn | 7.3 dk |

Süre ayarı oyuncuya çıkmıyor; `DENGE.SAHNE.HIZ_CARPANI` tek sayı olarak duruyor.

---

## 3. MİMARİ: MOTOR KARAR VERİR, SAHNE OYNATIR

```
TURU BİTİR → motor her şeyi çözer (bugünkü gibi, ~50 ms)
           → ortaya SIRALI BİR OLAY LİSTESİ çıkar   (src/oyun/olaylar.js)
           → sahne o listeyi oynatır                 (src/sahne/, SahneKatmani.js)
```

**Animasyon başladığında oyunun durumu çoktan kesinleşmiştir.** `olaylar.js` `durum`
almıyor bile — yalnızca tur raporunu okuyor, yani zaten olmuş bitmiş bir dökümü.

Görev belgesi §10/7 bunu "en tehlikeli hata" diye işaretlemişti: bir efektin içinden durum
değiştirilirse atlama bozulur ve **oyun kaydı bozulur**. Kanalı hiç açmamak, kapalı
tutmaktan güvenli — ve dört test onu kilitliyor.

**Animasyonun veri kaynağı yeni bir hesap değil:** motorun zaten tuttuğu raunt raunt döküm
(`cozum.js dokum`). Tek satır bile yeniden çözülmüyor.

---

## 4. BAKİ'NİN İKİ ŞARTI

### 4a. "Haritaya yakınlaşmada bug olmasın"

Üç koruma, hepsi `DENGE.SAHNE.KAMERA`'da:

1. **`ACIK: false` tek satırla kamerayı kapatır** — gösterinin geri kalanı çalışmaya
   devam eder.
2. **Tur başına bir kez kayar** (`EN_COK: 1`). Her olay için ayrı kaydırma baş döndürür.
3. **Sınır kuralı jestinkiyle AYNI** (`haritaDonusum.js kaydirmaSiniri`). Kamera oyuncunun
   elle gidemeyeceği bir yere giderse gösteri bitince ilk dokunuşta harita zıplardı.

Dördüncü incelik: kamera bittiğinde **kendini bir jest gibi tanıtıyor** (`jestSayaci`
1 → 0). Yapılmasaydı rozetler yeni yakınlaştırmada eski yerlerinde kalır ve sönerdi.

### 4b. "Önemli savaş ölçütü düzgün olsun"

Kapsam ayarı bu endişenin büyük kısmını zaten kapattı: `cephem`de **senin her savaşın
oynuyor.** `ONEMLI_ESIGI` artık neyin oynayacağına değil, neyin **ayrıntılı** oynayacağına
karar veriyor:

- eşiğin altı → haritada oynar (ok, sarsıntı, uçuşan sayı, renk darbesi)
- eşiğin üstü → üstüne rozetin yanında **birlik şeridi** açılır (raunt raunt düşenler)

**Hiçbir savaş sessizce atlanmıyor; yalnızca ayrıntı kademesi değişiyor.**

---

## 5. ROZET KATMANINA DOKUNULMADI

Görev belgesi §Adım 4, rozet katmanını "projenin en kırılgan yeri" ilan edip üç kural
koymuştu. Üçü de sağlandı, **belgenin önerdiğinden farklı ve daha güvenli bir yoldan.**

Belge "efekt rozetin üstündeki dönüşümü oynatır" diyordu — yani rozetin kendisine
dokunmayı. Bunun yerine efektler **rozetlerin ÜSTÜNDE ayrı bir katmanda** çiziliyor
(`SahneKatmani.js`) ve iki katman **aynı sabit yerleşimi** okuyor (`haritaSabitleme.js`).

| Kural | Nasıl sağlandı |
|---|---|
| Sabit yerleşim bozulmayacak | `RozetKatmani`'nin yerleşim mantığına hiç dokunulmadı, yalnızca ortak dosyaya taşındı |
| Rozetler yeniden çizilmeyecek | Efekt açılıp kapanırken rozet katmanının özellikleri değişmiyor; `React.memo` tutuyor. Gösteri boyunca rozet başına maliyet **sıfır** |
| Rozetin dışına taşan efekt yok | Bu katmanda donanım dokusu yok, yani kesecek bir sınır da yok — Görev 05'in 5. turunda yaşanan kusurun zemini ortadan kalktı |

**Neden yerleşim ortak dosyaya taşındı:** ikinci bir kopya yazmak §10/4'ün tuzağıydı ve
bedeli burada özellikle ağır — iki katman bir piksel ayrışsa efekt rozetin yanında patlar.

---

## 6. KUTSAL SAVAŞLAR (§11)

**Kod hiçbir rekabet uydurmuyor.** Tablo `veri/husumetler.js`'te ve Baki dolduruyor; bir
test hiçbir savaş adının `src/` içine sızmadığını kilitliyor. (O test kendini kanıtladı:
kod yazarken bir YORUM satırına savaş adı yazdığımda bile yakaladı.)

**Tablo 2026-08-01'de dolduruldu — yedi satır**, ayrıntısı ve gerekçeleri tasarım §11'de:
Ordu–Giresun fındık · Trabzon–Rize çay · Siirt–Gaziantep fıstık · Adıyaman–Şanlıurfa çiğ
köfte · Edirne–Tekirdağ köfte · Afyonkarahisar–Kayseri pastırma · İstanbul–Ankara şehir
üstünlüğü.

Sıfat **"Büyük"**: ilk deneme "Kutsal"dı, Baki *"hem güzel hem absürt duruyor"* dedi.
Mizah sıfatta değil konuda olmalı — iki il fındık için savaşıyor, cümlenin ciddi durması
işi komik yapan şey.

**Gerçek oyunda tetikleniyor:** 30 turluk koşuda orta kademede **4**, zor kademede **5**
düello başlıyor; en çok 4 tanesi aynı anda etkin.

**"Üçüncü devlet karışamaz" tek cümleydi, kodda üç ayrı kural çıktı.** Varsayılan `cephe`
seçildi: üçüncü aktör, iki tarafın **birbiriyle sınırdaş** olduğu parçalara saldıramaz.
`topraklar` tematik olarak daha güçlü ama **sömürülebilir** — oyuncu hasmına bilerek
saldırıp sınırını 10 tur dokunulmaz yapabilirdi. Seçim `DENGE.REKABET.UCUNCU_TARAF`'ta
tek kelime; **cihazda denedikten sonra değiştirilebilir.**

Kural **tek kapıdan** işliyor (`hareket.js hareketGecerliMi`): oyuncu ile yapay zekâ aynı
kısıttan geçiyor. Zekâ ayrıca aday üretirken engellenen hedefleri eliyor — hamle hakkını
reddedilecek bir emre yakmasın diye.

---

## 7. YAPAY ZEKÂ TAKVİYESİ — GÖREV 07'NİN BORCU KAPANDI

Görev 07 raporu §11/1: *"Zekâ dost parçalarına takviye taşımıyor. Kuvvetini üretimle
cephede topluyor; iç bölgedeki ordusunu cepheye yürütmüyor."*

**Kural tek yönlü:** yalnızca düşman komşusu OLMAYAN parça takviye gönderir ve yalnızca
cepheye DAHA YAKIN dost parçaya. Salınım (ileri-geri gidip gelme) **tanım gereği
imkânsız**: her takviye cephe uzaklığını en az 1 azaltır, azalan bir tam sayı dizisi geri
dönemez. 20 turluk gerçek koşuda ileri-geri gidiş **sıfır** (test kilitliyor).

### Bitiş ölçütü: ölü yatırım

Aynı tohum, aynı oyuncu davranışı, 15 tur. Değişen tek şey `TAKVIYE.ACIK`:

| | `orta` kapalı | `orta` açık | `zor` kapalı | `zor` açık |
|---|---|---|---|---|
| **İç bölgede ölü bekleyen birim** | **48** | **37** | **65** | **44** |
| En büyük imparatorluk (parça) | 11 | 10 | 18 | **25** |
| Bağımsız aktör | 70 | 69 | 34 | **29** |
| Hamle uzayının büyümesi | — | 1.01× | — | 1.02× |

**Okunuşu:** zor kademede ölü yatırım **%32 azaldı** ve en büyük imparatorluk 18 → 25
parçaya çıktı. Yani takviye hem kaynağı çöpe atmayı bitirdi hem de zekâyı güçlendirdi.

**Maliyet beklentinin çok altında.** Görev belgesi "aday sayısı yaklaşık iki katına çıkar"
diyordu; ölçüm **1.02×** dedi. Sebebi `TAKVIYE.KUVVET_ADAYLARI`'nın tek elemanlı olması:
iç bölge parçasının düşman komşusu yok, yani geride tutacak bir cephesi de yok — tümünü
gönderiyor.

### Ölçümün öğrettiği şey

İlk koşu "takviye neredeyse hiç aday üretmiyor" dedi ve bu **ölçümün değil dünyanın
hâlinin** sonucuydu: orta kademede 15 turda kimse büyümüyor, aktörlerin çoğu 1–3 parçalı
ve her parçası cephede. **İç bölge yoksa takviye edecek bir şey de yok.**

Sorun konsolidasyonla birlikte doğuyor, çözümü de orada görünüyor. Ölçüm zor kademede
tekrarlanmasaydı "takviye gereksiz" diye yanlış bir cevap verirdi.

---

## 8. BELGEYE UYMADIĞIM YERLER

1. **Adım 1 ile Adım 2'nin sırası çevrildi.** Belge ölçümü kod yazılmadan istiyordu; önce
   `olaylar.js` yazıldı ve ölçüm onu ÇAĞIRDI. Sebep §10/4: betik kendi süre hesabını
   yazsaydı, DENGE'deki bir süre değiştiğinde ölçüm sessizce yalan söylemeye başlardı.
   Ölçülen şey artık tahmin değil, oyunun gerçek oynatım planı.

2. **Üç hız kademesi yerine tek kapsam ayarı** (§2, Soru 3'ün hikâyesi).

3. **Efektler rozetin İÇİNE değil ÜSTÜNE çiziliyor** (§5). Gözle aynı, risk çok daha düşük.

4. **Uzaktaki savaşlar raunt dökümü almıyor** ve **il kartı yalnızca oyuncu için açılıyor.**
   İkisi de ölçümle kondu: kartlar herkes için açılınca `hepsi` kapsamı tur başına 13.6
   saniyeye çıkıyordu, çünkü 81 ilin çoğu 1–2 parçalı ve uzaktaki hemen her fetih bir
   "il tamamlandı" + bir "il kaybedildi" kartı doğuruyordu. İkisi de §4.4/3'ün "cephede
   ayrıntı, uzakta manşet" kuralının uygulaması.

5. **`takviyePuani`de "× gönderilen kuvvet" terimi yazılmadı.** Takviyede kuvvet
   bölünmediği için o çarpan aynı kaynağın bütün adaylarında sabit — sıralamayı hiç
   değiştirmez, yalnızca eşik karşılaştırmasını bulanıklaştırırdı.

6. **`expo-av` yerine `expo-audio`** (ses geldiğinde). SDK 54'te `expo-av` artık
   önerilmiyor; belgeyi ölçüm değil sürüm çürüttü.

7. **Adım 3–6 cihazda denenmedi.** Belgenin "her katman eklenir eklenmez denenecek" kuralı
   tutulamadı çünkü Baki kalan adımların tamamlanmasını istedi. Bedeli açık: hangi
   katmanın fazla/az geldiği ancak denendikten sonra ayrışacak.

---

## 9. DEĞİŞEN DOSYALAR

**Yeni:**

| Dosya | İşi |
|---|---|
| `src/oyun/olaylar.js` | Olay listesi + oynatım planı — sahnenin veri kaynağı |
| `src/oyun/rekabet.js` | Kutsal savaşlar: tetikleme, bitiş, kısıt, bonuslar |
| `src/oyun/ayarlar.js` | Cihaz tercihleri (kayıttan ayrı) |
| `src/sahne/useSahne.js` | Oynatıcı — olayları zamana yayar |
| `src/sahne/titresim.js` | Olay → titreşim eşlemesi |
| `src/sahne/ses.js` | Ses katmanı — bilerek boş, dosya bekliyor |
| `src/bilesenler/SahneKatmani.js` | Sarsıntı · uçuşan sayı · renk darbesi · ok · birlik şeridi |
| `src/bilesenler/SahneKarti.js` | İl fethedildi / kaybedildi / kutsal savaş / tur açılışı |
| `src/haritaSabitleme.js` | Rozet ve sahne katmanlarının ORTAK yerleşimi |
| `veri/husumetler.js` | Hasım çiftleri — Baki dolduruyor |
| `scripts/sahne-olcum.js` | Adım 1 ölçümü → `veri/sahne-olcum.md` |
| `testler/olaylar.test.js` · `testler/rekabet.test.js` | 36 yeni test |
| `docs/GOREV-08-SES-LISTESI.md` | Baki'nin bulacağı 12 ses |

**Değişen:** `denge.js` (SAHNE, REKABET, ZEKA.TAKVIYE, HUSUMET_ACIK) · `cozum.js` (düello
tetikleyici, moral kalemi, sahne alanları) · `fetih.js` (il kaybı, ganimet bonusu) ·
`hareket.js` (üçüncü taraf kısıtı) · `turDongusu.js` (düello güncelleme, rapor.duellolar) ·
`zeka.js` (cepheUzakligi, takviyeAdaylari, takviyePuani, hasimMi) · `kisilik.js` (husumet
ağırlığı) · `oyunDurumu.js` (duellolar, sürüm 8) · `kayitVerisi.js` (sürüm 7 reddi) ·
`oyunKancasi.js` · `App.js` · `Harita.js` (kamera, sahne katmanı) · `RozetKatmani.js`
(yerleşim ortak dosyaya) · `haritaDonusum.js` (kamera hesabı) · `AyarMenusu.js` ·
`veri-dogrula.js` (husumet denetimi)

**Belgeler:** `il-savasi-tasarim.md` (§11 uygulama notu, §13.5 sahne katmanı, §14 yeni
düğmeler) · `URETIM-NOTU.md` · `GOREV-08-hissiyat.md`

---

## 10. SAYILAR

| | Görev 07 | Görev 08 |
|---|---|---|
| Test | 436 | **497** (+61) |
| Kayıt sürümü | 7 | **8** (1–7 reddediliyor) |
| Kayıt boyutu (başlangıç / 15 tur) | 19.4 / 25.2 KB | **19.4 / 24.8 KB** (sınır 26) |
| Tur başına hesap | ~45 ms | **~45 ms** |
| Gösteri (cephem) | — | **6.6 sn/tur** (cihaz denemesinden sonra) |
| İç bölgede ölü birim (zor) | 65 | **44** (%32 azalma) |
| En büyük imparatorluk (zor) | 18 | **25** |
| Hamle uzayı | 1× | **1.02×** |
| Paket | — | **5.9 MB** |

`npm run kontrol` temiz: veri tutarlı, ESLint temiz, biçim temiz, 496 test geçiyor.
`npx expo export` hatasız.

---

## 10b. CİHAZ DENEMESİ SONRASI DÖRT DÜZELTME (2026-08-01)

Baki telefonda denedi; dört geri bildirim geldi, dördü de aynı gün kapandı. Ayrıntı ve
ölçüm tabloları `veri/URETIM-NOTU.md`'de.

| Geri bildirim | Ne yapıldı |
|---|---|
| *"Savaşlar fazla hızlı… bir bakıyorum sonuç ekranı geliyor"* | Süreler ~2 katına (raunt 260 → 650 ms), rapordan önce 700 ms nefes payı. `cephem` 3.5 → **6.6 sn/tur** |
| *"Bir tık daha agresif olabilirler"* | Beş nokta tarandı; `ACIKTA 2.0 → 1.9`, `SALDIRI 0.5 → 0.6`. Orta kademede **%39 daha çok saldırı**, kolay hâlâ sakin |
| *"Husumetli il listesini sun"* | Tablo sunuldu (2 satır); ekleme Baki'de |
| *"Ayar metinlerini oyuncu diline çevir"* | Bütün ayar metinleri yeniden yazıldı; ayrıca "parça" → **"bölge"** tutarsızlığı dört yerde düzeltildi |

### Yayın diline geçiş — ikinci tur

Baki üç şeyi birden istedi: tahmin cümleleri değişsin · devrik cümleler düzelsin, daha uzun
olsa bile daha açıklayıcı olsun · **ama ekranda daha az şey olsun.** İlk bakışta çelişiyor;
çelişkiyi çözen şey **sayıyı atıp cümleyi bırakmak** oldu.

| Ekran | Kaldırılan | Gelen |
|---|---|---|
| Saldırı | Birim başına 4 ham stat (üç birim = **12 sayı**) + karşı tarafın statları | — (o hesabı zaten savaş tahmini yapıyor) |
| Saldırı | İki satırlık arazi tablosu | Tek cümle: *"Arazi dağlık; savunan taraf burada belirgin biçimde güçlü."* |
| Saldırı | Tek kelimelik kademe etiketi (ÜSTÜN/DENK/ZAYIF) | Cümle + açıklama; kademeyi renk taşıyor |
| Saldırı | Aynı uyarının iki ayrı satırda tekrarı | Tek düz cümle |
| Sonuç | Her muharebede 4 ayrıntı satırı | Tek çekmecede: **SAVAŞIN AYRINTISI** |

Savaş tahmini artık şöyle konuşuyor:

| Kademe | Cümle | Açıklama |
|---|---|---|
| üstün | **Saldırı zaferle sonuçlanır.** | Savaştan yaklaşık 4 birliğin sağ döner. |
| denk | **Sonucu şans belirleyecek.** | İki taraf da kazanabilir; savaşı son raunt belirleyecek. |
| zayıf | **Mağlubiyet kesin.** | Bu kuvvetle saldırırsan ordunu kaybedersin. |

`X olmadı: sebep` kalıbı (bir kayıt satırı gibi okunuyordu) düz cümleye çevrildi:
*"Bu emir işlenemedi çünkü gönderecek askerin kalmamıştı."*

**Yolda yakalanan kusur:** `EN_COK_SAVAS` sınırı oyuncunun KENDİ savaşlarına da
uygulanıyordu — sekiz cephede savaşan bir oyuncunun savaşları sessizce atlanabilirdi ve bu,
ayarın bütün sözünü çiğniyordu. Sınır artık yalnızca uzaktakilere; test kilitledi.

---

## 11. YAPILMAYANLAR VE BİLİNEN BORÇLAR

**Bilerek yapılmayanlar:** diplomasi (§10) · mod seçim ekranı ve tam kazanma koşulu (§8.1) ·
ana menü · arka plan müziği · sıcak koltuk · para kazanma (§12) · §11'in oyuncu başarımı.

**Bilinen ve kabul edilen kusurlar:**

1. **SES YOK.** Katman hazır, tablo dolu, ayar düğmesi "yakında" diyor. Bekleyen tek şey
   dosyalar: `docs/GOREV-08-SES-LISTESI.md` (12 dosya, öncelik sıralı). Eklemek tek
   dosyalık iş — `src/sahne/ses.js`.

2. **Cihaz denemesi yapılmadı (Adım 3–6).** Kare bütçesi (fps), kameranın gerçek davranışı
   ve gösteri temposu telefonda ölçülmedi. `DENGE.SAHNE`'nin bütün düğmeleri bunun için
   hazır; "fazla/az/yanlış" geri bildirimi tek satırla karşılanacak.

3. **Üçüncü taraf kısıtının hangi kural olacağı cihazda denenmeli.** Varsayılan `cephe`;
   `topraklar` daha güçlü ama sömürülebilir. Değiştirmek tek kelime.

4. **Husumet tablosunda iki satır var.** Trabzon–Rize ve İstanbul–Ankara'nın konusu ve
   savaş adı Baki'den gelecek; tabloya satır eklendikçe kutsal savaşlar sıklaşacak.
   Denetim uyarıyor: Siirt–Gaziantep ve İstanbul–Ankara **komşu değil**, yani düelloları
   ancak biri ötekine kadar genişleyince tetiklenebilir.

5. **Düello moral bonusu üçüncü kalemi mümkün kıldı.** `MUHAREBE.MORAL.BONUS_PAYI`'nin
   notu "bonuslar en çok 2 üst üste binebiliyor" diyordu; artık 3 olabiliyor. §3.7'nin 15
   satırı etkilenmiyor (o tablo düellosuz çalışıyor) ama oyun içi bozgun eşiği düelloda
   kayabilir. Cihazda "kutsal savaşlar çok uzun sürüyor" denirse ilk bakılacak yer burası.

---

## 12. SIRADAKİ: GÖREV 09

Diplomasi (§10) · mod seçim ekranı ve tam kazanma koşulu (§8.1) · ana menü · arka plan
müziği · sıcak koltuk · para kazanma.

Görev 09'un elinde bu görevden çıkan hazır girdiler olacak:

- **Husumet tablosu ve düello sistemi** — diplomasinin husumet ağırlığı veriyi hazır
  bulacak; ittifak/ateşkes aynı `rekabet.js` kalıbıyla yazılabilir
- **Sahne katmanı** — diplomasi olayları (ittifak kuruldu, ateşkes bozuldu) aynı olay
  listesinden oynatılır, yeni bir düzenek gerekmez
- **Kart düzeneği** — kazanma/kaybetme ekranı `SahneKarti`'nin kalıbını kullanır
- **Ayarlar altyapısı** — `oyun/ayarlar.js` kayıttan ayrı, yeni tercih eklemek tek alan
