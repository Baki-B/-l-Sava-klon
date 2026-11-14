# GÖREV 15 — ANINDA ÇÖZÜM VE HAMLE HAKKI

> Tarih: **2026-09-19** · Baki'nin isteği:
>
> *"Emirler verildiği turlarda işlenecekler. Bursa'dan Çanakkale'nin bir parçasına
> saldırdıysam ve o parçayı alabilecek güçteysem orası benim olmuş sayılır ve askerlerim
> oraya transfer olurlar."*
>
> Bu belge **Görev 05 / Soru 1 (cevap B — emir kuyruğu)** kararını ve **Görev 07 / Soru 1
> (cevap A2)** kararının oyuncu tarafını **tersine çeviriyor.** Gerekçeler §1'de.

---

## 1. NİYE TERSİNE ÇEVİRİYORUZ — VE NEDEN BU KADAR BÜYÜK DEĞİL

`sira.js`'in başındaki kayıt, bu tartışmanın 2026-07-31'de yapıldığını gösteriyor. Baki'nin
o günkü gerekçesi bugünküyle aynı:

> *"Ben bir yeri aldım, adam alınan yerden başka bir yere saldırı yapmak istiyordu"*

O gün **yapay zekâ için** çözüldü: sıra bir bota geldiğinde **o anki** duruma bakar ve emri
**hemen** çözülür. Yani motor anında çözümü zaten yapıyor; kuyrukta kalan tek aktör
**oyuncu**. Bu görev, var olan yolu oyuncuya da açıyor.

**Kalkan şeyler:** emir kuyruğu, rezervasyon, zincir havuzu (`zincirHavuzu`,
`rezerveBirimler`), ölü emir ayıklama, emir iptali.
**Yerine gelen:** hamle hakkı defteri (§3) + anında çözüm çağrısı + onay kutusu.

---

## 2. KARARLAR (Baki, 2026-09-19)

| Konu | Karar |
|---|---|
| Çözüm anı | Emir verildiği an çözülür. Kazanılan parça hemen el değiştirir, ordu oraya geçer |
| **Tek oyunculuda sıra** | **Oyuncu her zaman ilk oynar**, botlar sonra |
| **Çok oyunculuda sıra** | **Önce insanlar** (kendi aralarında sıralanır), sonra botlar |
| Hamle hakkı | **Piyade 1 · Topçu 1 · Zırhlı 2** |
| Menzil (topçu 2 komşu) | ❌ **HİÇ EKLENMEYECEK** — Baki'nin kesin kararı (2026-09-19): *"menzili oyuna hiç eklemeyelim."* Gerekçe §5 |
| Zırhlının ikinci hamlesi | ✅ **İkinci bir SALDIRI da olabilir** — al, oradan devam et (Görev 11'in art arda fetih isteği) |
| Fethedilen parçanın geliri | O tur gelir vermez. Sonraki tur hâlâ elindeyse gelir başlar |
| Yanlış tıklama | Saldırı öncesi **onay kutusu** (`Onay.js` var) |
| Emir iptali | Kalkıyor — hamle anında gerçekleşiyor, iptal edilecek bir şey kalmıyor |

⚠ **İLK VURUŞ AVANTAJI ARTIK OYUNCUDA VE BU BİLİNÇLİ.** Görev 07'de sıra tam olarak bunu
engellemek için tohumla karıştırılıyordu ("kimse kalıcı ilk vuruş avantajı almaz"). Karar
değişti; bedeli ölçülecek: oyuncu her tur ilk oynadığı için fetih hızı artacak. Zorluk
kademeleri (`DENGE.ZEKA.ZORLUK`) bu ölçümden sonra ayarlanır.

⚠ **Çok oyunculuda insanlar arası sıra her tur tohumla karışmalı.** Yoksa "1. oyuncu"
kalıcı olarak ilk vurur ve düello adil olmaz. (Açık soru §7/1.)

---

## 3. HAMLE HAKKI DEFTERİ (Adım 1'in konusu)

Kuyruk kalkınca "bu birlik bu tur hareket etti mi" sorusunu tutacak bir yer gerekiyor.
Bugüne kadar bunu kuyruğun kendisi tutuyordu (rezervasyon).

**Yer:** ordunun kendi kaydında, `kadro` ve `yarali` alanlarının yanında: `ordu.hamle`.
Bu yapı projede zaten var ve kuralı da aynı: **alan yalnızca farklıysa saklanır**, tur
sonunda silinir. Kayıt böylece büyümüyor.

**Biçim:** `hamle: { piyade: { 1: 2 }, zirhli: { 1: 1, 2: 1 } }`
→ *"bu parçadaki 2 piyade birer hamle harcadı; bir zırhlı bir hamle, bir zırhlı iki hamle
harcadı."* Defterde görünmeyen birim hiç hareket etmemiştir.

**Hakkı tükenen hareket edemez:** piyade/topçu için 1 hamle, zırhlı için 2.

**Kim gider:** Aynı türden birkaç birim varsa **hakkı en çok kalan gider** ("taze birlik
sefere çıkar"). İki sonucu var ve ikisi de isteneni veriyor:
- Varış noktasında zırhlının bir hamlesi kalır → **fethettiği yerden devam edebilir.**
- Kaynakta yorgun birimler kalır → savunmaya devam ederler.

**Kayıptan sonra defter kırpılır:** muharebede birim eriyebilir; defter eldeki birim
sayısını asla aşmaz.

---

## 4. TUR AKIŞININ YENİ HÂLİ

```
TUR BAŞI
  1. GELİR        → havuzlar dolar
  2. ARAŞTIRMA    → ayrılan ekonomi puana dönüşür
  3. ÜRETİM       → asker basılır (tur içinde, bugün de böyle)
  4. SENİN SIRAN  → saldırı/taşıma emirleri ANINDA çözülür (onay kutusuyla)
                     · fethedilen parça hemen senin olur, ordu oraya geçer
                     · zırhlı ikinci hamlesini oradan yapabilir
  ── HAMLEMİ BİTİRDİM ──
  5. BOTLAR       → 80 aktör tohumlu karışık sırayla oynar (bugünkü davranış)
  6. TOPLANMA     → yıpranmış ordular dolar (çözümden sonra, bugünkü kural)
  7. BAKIM        → düellolar, ilişkiler, kazanma kontrolü
  8. HAMLE DEFTERİ SIFIRLANIR
```

⚠ **Fethedilen parçanın geliri** bugüne kadar aşamaların sırasından bedava geliyordu
("gelir çözümden önce işlenir"). Oyuncu artık tur ortasında fethettiği için bu **açık bir
kural** olarak yazılacak: parça, el değiştirdiği tur gelir vermez.

---

## 5. MENZİL — KARAR: OYUNA HİÇ EKLENMEYECEK

Baki sordu (*"menzil kısmı sence eklensin mi?"* — zırhlı/piyade 1, topçu 2), öneri hayır
oldu ve **Baki 2026-09-19'da kesin karara bağladı: menzil oyuna hiç eklenmeyecek.** Aşağıdaki
üç gerekçe kayıt içindir; bir gün "menzil ekleyelim mi" diye sorulursa cevap burada:

1. **Bütün hareket sistemi "komşu parça" grafiğine dayanıyor.** Menzil 2, bugün hiç
   olmayan bir soruyu açıyor: *hangi parçanın üstünden geçilebilir?* Düşman parçası
   geçilemez, peki boş parça? Dost parça? Bu yeni kurallar demek; üstüne `zeka.js`'in hedef
   seçimi, cephe uzaklığı hesabı ve takviye mantığı da "komşu" varsayımıyla yazılmış.
2. **Topçunun kimliği zaten dört yerden geliyor:** ağır vuruş, delicilik, baraj ateşi dalı
   ve §3.7'nin *"topçunun tek şansı coğrafya"* kısıtı. Menzil beşinci ayrım olurdu ve
   dengeyi ölçülemez hâle getirirdi.
3. **Bu görevde zaten üç şey birden değişiyor** (anında çözüm · hamle hakkı · sıra). Menzil
   de katılırsa bir şey bozulduğunda hangisinin bozduğunu bilemeyiz. CLAUDE.md §7:
   *adımlar birleştirilmez.*

**Bir alternatif kayda geçiyor ama sıraya girmiyor:** topçuya **destek ateşi** — komşu
parçadaki dost muharebeye ilk raunt hasarı verir, kendisi yerinden kalkmaz. "Topçu uzaktan
vurur" hissini yol kuralı açmadan verirdi. Menzil kapandığı için bu da bugün gündemde
değil; istenirse ayrı bir görev olarak açılır.

---

## 6. ADIMLAR

| Adım | İş | Görünen sonuç |
|---|---|---|
| ✅ **1** | Hamle hakkı defteri: `src/oyun/hamle.js` + `DENGE.HAREKET.HAMLE_HAKKI` + testler | **BİTTİ (2026-09-19)** — ekranda değişiklik yok, 16 test |
| ✅ **2** | Anında çözüm: `hamleUygula`, kuyruğun kaldırılması, `hareketGecerliMi`'nin deftere bağlanması, kayıt sürümü 17 | **BİTTİ (2026-09-19)** — saldırı verildiği an çözülüyor; kontrol altı bölüm temiz, 675 test |
| ✅ **3** | Sıra düzeni: oyuncu önce, botlar sonra; tur döngüsünde defter sıfırlama | **BİTTİ (2026-09-19)** — `turSirasi` insanları başa alıyor, 676 test |
| ✅ **4** | Ekran: emir listesi → tur günlüğü, onay kutusu, hamle hakkı göstergesi, gösterinin anında oynaması | **BİTTİ (2026-09-19)** — telefonda oynanır hâl |
| ✅ **5** | Ölçüm + belge: fetih hızı önce/sonra, zorluk ayarı, tasarım §8/§8a ve DURUM-RAPORU güncellemesi | **ÖLÇÜM BİTTİ (2026-09-19)** — §10. Zorluk ayarı bir maç oynanmasını bekliyor |

Her adım sonunda `npm run kontrol` altı bölümde temiz olacak ve Baki doğrulamadan sonraki
adım açılmayacak (CLAUDE.md §7).

---

## 7. AÇIK SORULAR

1. **Çok oyunculuda insanlar arası sıra** her tur tohumla karışsın mı (öneri: evet), yoksa
   oda sırası sabit mi kalsın?
2. ✅ **CEVAPLANDI (2026-09-19): zırhlının ikinci hamlesi ikinci bir SALDIRI da olabilir.**
   Al, oradan devam et. Fetih hızına etkisi Adım 5'te ölçülecek.
3. **Toplanma emri** kuyruk kalkınca nereye bağlanacak? — Adım 2'de **önerildiği gibi**
   kuruldu: toplanma kuyrukta bekleyen TEK emir türü olarak kaldı, tur sonunda (çözümden
   sonra) işlenmeye devam ediyor. Baki isterse tek satırla değişir.
   ⚠ Aç/kapa anahtarı (iptal yerine) Adım 4'ün ekran işi.

---

## 8. ADIM 2 NOTLARI (2026-09-19)

Uygularken ortaya çıkan ve belgeye girmesi gereken üç şey:

1. **TUR GÜNLÜĞÜ doğdu.** Hamle tur ortasında çözülünce `turuBitir` onu göremiyordu, yani
   tur raporu oyuncunun kendi savaşlarını kaçırıyordu. `hamleUygula` her çözülen hamleyi
   `durum.turGunlugu`'na yazıyor; rapor turu bitirirken günlüğü okuyup boşaltıyor.
   ⚠ Günlük **kayda girmiyor** (`sonTurRaporu`'nun kaydedilmeme gerekçesiyle aynı: tek
   turluk döküm kayıt dosyasını şişirir).
2. **"Fethedilen parça o tur gelir vermez" artık açık bir kural.** Eskiden aşamaların
   sırasından bedava geliyordu. Şimdi `fetih.js` el değiştiren parçayı
   `durum.buTurFethedilen`'e yazıyor, `uretim.js` o parçaları gelir hesabında atlıyor ve
   liste `turDongusu.js`'te gelir yazıldıktan hemen sonra boşalıyor.
3. **Yarma testleri bir tuzağı gösterdi:** dal, hamleden SONRA verilirse hiçbir şey yapmaz
   (hamle çoktan çözülmüştür). Kuyruk döneminde sahneyi kurup sonra dal vermek işe
   yarıyordu. Aynı tuzak ileride her "önce kur, sonra ayarla" testinde geçerli.

---

## 9. ADIM 3–4 NOTLARI (2026-09-19)

**Adım 3 — sıra:** `turSirasi` artık iki kümeyi ayrı ayrı karıştırıyor: önce insanlar, sonra
botlar. Tek oyunculuda sonuç "oyuncu her zaman ilk"; çok oyunculu geldiğinde insanlar kendi
aralarında da karışacak, yani "1. oyuncu hep ilk vurur" adaletsizliği bugünden kapalı.
Sıra listesinde insan yine görünüyor ama döngüde işi yok — hamlelerini zaten turu
bitirmeden önce yaptı. İki test değişti: "her tur ilk oynayan değişiyor" → "oyuncu her
zaman ilk" + "botların sırası her tur değişiyor".

**Adım 4 — ekran:**
- **Emir listesi → TUR GÜNLÜĞÜ** (`src/bilesenler/TurGunlugu.js`). Bekleyen emir kalmadığı
  için ekran artık olup bitenleri gösteriyor: hangi hamle, ne sonuç ("alındı · +2 nüfus",
  "püskürtüldü · 3 kayıp"). Bekleyen toplanma emirleri ayrı bölümde ve vazgeçmesi duruyor.
- **Saldırı onayı.** Kuyruk varken onay gerekmiyordu (emri listeden iptal edebiliyordun);
  hamle geri alınamaz olunca onay kutusu o boşluğu dolduruyor. **Kendi toprağına taşıma
  onay istemiyor** — zararsız iş için sorulan onay, bir sonraki onayın değerini düşürür.
- **Gösteri hamlede oynuyor.** `useSahne`'ye giden rapor artık `hamleRaporu || sonTurRaporu`:
  saldırdığın an savaşı görüyorsun, turu bitirince botların turu oynuyor.
- **Hamle hakkı göstergesi.** Kuvvet seçicideki "hazır" sayısı zaten hakkı tükenmiş birimi
  göstermiyordu; altına sebebi yazıldı ("N birlik bu tur hakkını kullandı").
- ⚠ Tur raporu artık HER tur açılıyor: "emir verdiysen aç" ölçüsü emir kuyruğuyla birlikte
  öldü, botların turu her tur bir şey yapıyor.

---

## 10. ADIM 5 — ÖLÇÜM (2026-09-19)

### 10.1 ⚠ ÖNCE BİR ÖLÇÜM ARACI KÖRLÜĞÜ BULUNDU

`scripts/denge-simulasyonu.js` **altı koşusunda da "4/181"** veriyordu — yani ölçüm
oyuncusu tek bir parça bile almıyordu ama tablo dolu görünüyordu. İki ayrı sebep vardı ve
ikisi de Görev 15'ten ÖNCE oluşmuştu:

1. **Savaş ilanı yok.** Görev 11'den beri (2026-08-03) barıştakine saldırılamıyor; betik
   ilan etmiyordu, `hedefleriAyir` hiç düşman hedef döndürmüyordu.
2. **Üretim iç parçaya gidiyordu.** "En çok sanayi hakkı kalan parça" Bursa'da 16-1 çıkıyor
   ve 16-1'in düşman komşusu YOK. Bütün ordu orada birikiyor, sınırdaki parçalar 1–2
   birimle kalıyor, betiğin "savunandan çok birimim varsa saldır" şartı hiç sağlanmıyordu.

İkisi de düzeltildi (ölçüm oyuncusu herkesle savaşta başlıyor · üretim **cephedeki**
parçaya yapılıyor). Ders: **bir ölçüm aracı sessizce körleşebilir.** Sayı "değişmedi"
değil, "ölçülmedi" olabilir; tablodaki bütün satırların aynı çıkması bunun işaretiydi.

### 10.2 BOT DÜNYASI — ÖNCE / SONRA

Karşılaştırma `veri/mod-simulasyon.md` (3 mod × 3 zorluk × 2 tohum, 150 tura kadar).
Önce = 2026-08-13 (cesaret ve üretim freni sonrası), Sonra = Görev 15.

| Mod · Zorluk | El değiştiren parça (önce) | (sonra) | Değişim |
|---|---|---|---|
| Fetih · kolay | 861.0 | **408.5** | −53% |
| Fetih · orta | 3765.0 | **3009.0** | −20% |
| Fetih · zor | 4164.0 | **3475.0** | −17% |
| %50 · kolay | 268.0 | **160.0** | −40% |
| %50 · orta | 1305.0 | **1097.0** | −16% |
| %50 · zor | 2143.0 | **1947.5** | −9% |
| Güç Yarışı · kolay | 19.5 | **11.5** | −41% |
| Güç Yarışı · orta | 383.5 | **292.5** | −24% |
| Güç Yarışı · zor | 1148.5 | **1125.5** | −2% |

**Okunuşu:** dünya yavaşladı ama KİLİTLENMEDİ — 2026-08-12'de kırılan kilidin geri gelme
riski gerçekleşmedi. Sebep açık: piyade ve topçunun hakkı ikiden bire indi, yani bot
taarruzları daha kısa menzilli. Yavaşlama en çok KOLAY kademede (−40/−53%), en az ZOR'da
(−2/−17%) — istenen yön bu: kolay dünya sakinleşiyor, zor dünya sert kalıyor.

**Konsolidasyon değişmedi, hatta arttı:** Fetih/orta'da kalan sahip 17–19 → **15–17**,
Fetih/zor'da 15–16 → **12–15**. Yani daha az el değiştirmeyle aynı sonuç çıkıyor; gidip
gelen cephe azaldı, kazanan yine kazanıyor. Sağlıklı bir takas.

**Yığınlar kontrolde:** zirve en büyük yığın 24.5 → 22.5 (kolay), 27.5 → 25.0 (orta),
19.5 → 22.5 (zor). Silahlanma yarışı geri gelmedi.

### 10.3 ZORLUK AYARI — HENÜZ YAPILMADI, BİLİNÇLİ

Oyuncu artık her tur ilk vuruşu yapıyor; bu avantajın büyüklüğü **simülasyonla
ölçülemez**, çünkü betikteki ölçüm oyuncusu bir yapay zekâ değil, kaba bir kural
("üstünsem saldır"). Zorluk kademelerine (`DENGE.ZEKA.ZORLUK`) dokunmak için gereken şey
bir insan maçı — ki aynı maç `SANIYE_PER_TUR = 45` borcunu da kapatıyor
(`docs/DURUM-RAPORU.md` §7a). **Baki bir maç oynayana kadar zorluk sayıları sabit.**
