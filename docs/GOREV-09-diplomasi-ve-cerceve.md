# GÖREV 09 — DİPLOMASİ VE ÇERÇEVE

> Tarih: 2026-08-01 · Önceki: `docs/GOREV-08-hissiyat.md` + `GOREV-08-RAPOR.md`
> Tasarım referansı: `docs/il-savasi-tasarim.md` §10 (diplomasi), §8.1 (modlar ve kazanma
> koşulu), §9.4 (kişilik), §11 (düello), §14 (denge düğmeleri)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. BU GÖREV NE YAPIYOR

Sekiz görevdir **maç** yapıldı. Bu görevde **oyun** yapılıyor.

Bugün uygulamayı açtığında doğrudan haritanın içindesin. Nereden başladığın belli değil,
ne zaman biteceği belli değil, kazanınca ne olacağı belli değil. Oyun oynanıyor ama
**bitirilemiyor.**

Bu görev üç şeyi kapatıyor:

| İş | Bugün | Yarın |
|---|---|---|
| **Çerçeve** | Uygulama açılır, harita gelir | Ana menü → mod seç → oyna → kazan/kaybet → yeni maç |
| **Amaç** | Kazanma koşulu asgari (tüm parçalar / hiç parça) | Moda göre gerçek koşul, ekranda görünür hedef |
| **Diplomasi** | Herkes herkese saldırır | İttifak · savaş hali · ateşkes · ihanet bedeli |

Diplomasi neden bu görevde: tasarım §10/3'ün tamamı coğrafyaya bağlı — *"uzaktaki müttefikin
savaşa girdiğinde ancak sınırların o cepheye ulaştığında müdahale edebilirsin."* Bu cümlenin
anlamlı olması için maçın bir uzunluğu, bir hedefi ve bir bitişi olması gerekiyor. İkisi aynı
görevde olmalı.

---

## 2. KAPSAM

**Dahil:**
- Diplomasi (§10): üç ilişki durumu, teklif düzeneği, ateşkes, ihanet bedeli, yapay zekâ diplomasisi
- Mod sistemi (§8.1): Bölge · Türkiye · Serbest
- Kazanma ve yenilgi koşulları, ekranda görünen hedef
- Ana menü ve maç akışı (yeni oyun · devam et · ayarlar)
- Kayıt yapısının maça göre düzenlenmesi
- **Görev 08'in ses borcu** — dosyalar geldiyse bağlanır, ana menü müziği dahil
- Görev 08'in cihazda denenecek iki açık maddesi

**Hariç (Görev 10):** para kazanma (§12) · sıcak koltuk · başarımlar (§11'in oyuncu
başarımı) · asenkron çevrimiçi (§13.1, v1.5) · mağaza ve reklam katmanı · yayın hazırlığı.

**Neden sıcak koltuk ertelendi:** tasarım §8.1 kendi kendine söylüyor — *"sıcak koltuk uzun
maçta zorlanır, iki kişinin saatlerce aynı telefonu paslaması gerçekçi değil."* Mod sistemi
kurulmadan sıcak koltuğun hangi maç uzunluğuna hizmet edeceği bilinmiyor. Bu görevden sonra
bilinecek.

**Yol haritası:** Görev 09 çerçeve ve diplomasi · Görev 10 yayın katmanı (para kazanma,
sıcak koltuk, başarımlar, cila) · sonrası v1.5 çevrimiçi.

---

## 3. NEREDEN BAŞLIYORUZ

497 test geçiyor, kayıt sürümü 8, paket 5.9 MB. Oyun baştan sona oynanıyor ve artık
hissediliyor.

**Hazır girdiler — bu görev sandığından çok daha az sıfırdan başlıyor:**

| Girdi | Nerede | Bu görevde ne işe yarayacak |
|---|---|---|
| **`rekabet.js` — düello sistemi** | Görev 08 | İttifak/ateşkes **aynı kalıp**: iki aktör arasında turlara yayılan bir ilişki durumu. Yeni mimari icat edilmeyecek |
| **Üçüncü taraf kısıtı** | `hareket.js hareketGecerliMi` | İttifak kısıtı **aynı kapıdan** geçecek — oyuncu ve yapay zekâ aynı kural |
| **Husumet ağırlığı** | `kisilik.js`, Görev 08 | Diplomasi kararının hazır terimi; hasımla ittifak kurulmaması buradan |
| **Fayda formülü** | `zeka.js`, Görev 07 | İttifak/ateşkes teklifi **aynı mantıkla** puanlanacak |
| **Sahne katmanı ve kart düzeneği** | `SahneKarti.js`, Görev 08 | "İttifak kuruldu", "kazandın", "yenildin" kartları — yeni düzenek gerekmiyor |
| **Olay listesi** | `olaylar.js` | Diplomasi olayları aynı listeden oynatılır |
| **Ayarlar altyapısı** | `oyun/ayarlar.js` | Kayıttan ayrı; yeni tercih eklemek tek alan |
| **Kayıt/yükleme sürümlemesi** | `kayitVerisi.js` | Sekiz görevdir çalışıyor; ana menünün "devam et"i buna oturacak |
| **Karadeniz senaryo kapsamı** | Görev 02'den beri test aracı | **Bölge modunun temeli** — kapsam daraltma zaten çalışıyor |
| **Ölçüm düzeneği** | `scripts/zeka-olcum.js` | Diplomasinin dengeye etkisi aynı betikle ölçülür |
| **Ses katmanı** | `src/sahne/ses.js` (boş), `docs/GOREV-08-SES-LISTESI.md` | Dosyalar gelince tek dosyalık iş |

**Devralınan dört açık madde** (Adım 0'da tek tek ele alınacak):

1. **Ses dosyaları yok.** 12 dosyalık liste hazır, öncelik sıralı.
2. **Üçüncü taraf kısıtı cihazda denenmedi.** Varsayılan `cephe`; `topraklar` daha güçlü
   ama sömürülebilir. Değiştirmek tek kelime.
3. **Düello moral bonusu üçüncü kalemi mümkün kıldı.** *"Kutsal savaşlar çok uzun sürüyor"*
   denirse ilk bakılacak yer burası. **Diplomasi bu riski büyütüyor** — ittifak bonusu da
   eklenirse dördüncü kalem doğabilir; §6/7 bunu ele alıyor.
4. **Kare bütçesi (fps) telefonda ölçülmedi.** Gösteri temposu ayarlandı ama gerçek kare
   sayısı bilinmiyor.

---

## 4. CEVAP BEKLEYEN BEŞ SORU

### Soru 1 — Saldırmak için savaş ilan etmek gerekecek mi? *(mimari — en belirleyici karar)*

Bugün ilişki diye bir şey yok: komşuysan saldırırsın. Diplomasi gelince bu ya değişir ya
değişmez ve **oyunun tamamı bu cevaba bağlı.**

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Üç durum, savaş ilanı yok** *(önerim)* | **Tarafsız** (varsayılan — saldırabilirsin) · **İttifak** (saldıramazsın) · **Savaş halinde** (saldırabilirsin + ateşkesle biter). Mevcut akış hiç bozulmaz; ittifak *kısıt*, savaş hali *işaret* |
| B | Savaş ilanı zorunlu | Saldırmadan önce ilan edilir, bir tur beklenir. Gerçekçi ama: 80 aktörün karar mantığı yeniden yazılır, oyuncunun her saldırısı iki adıma çıkar, ve *"ilan ettim ama saldırmadım"* diye anlamsız bir durum doğar |
| C | Yalnızca ittifak, savaş hali yok | En basit. Ama §10/3 (*"ittifakına saldıran sana da savaş açmış sayılır"*) yazılamaz — diplomasinin en özgün maddesi düşer |

**A'nın gerekçesi:** §10'un üç çekirdek maddesinin üçü de A ile yazılabiliyor.
Madde 1 (*"sınırdaş olmadığın devletle savaşamazsın"*) **zaten sağlanıyor** — komşuluk
grafiği fiilen dayatıyor, yeni kod gerekmiyor. Madde 2 ve 3 ittifak + savaş hali ile
karşılanıyor. B'nin getirdiği tek şey tören; bedeli çok yüksek.

**A'da savaş hali ne işe yarar** (fiilen tarafsızla aynı olduğu hâlde):
- Yapay zekânın hedef seçiminde ağırlık taşır — savaştaki düşmana öncelik verir
- Ateşkesle biter, yani **savaşın bir sonu** olur
- §10/3 zinciri buradan işler: müttefikine saldıran seninle savaş haline girer
- Haritada görünür: kiminle savaştasın, kiminle değilsin

*İş hayatından karşılığı:* A, sözleşmesiz çalışılan bir piyasa — kimseyle anlaşman yoksa
herkesle iş yapabilirsin, ama imzaladığın anlaşma seni bağlar. B, her işten önce resmî
bildirim zorunluluğu getirir; kâğıt artar, iş değişmez.

### Soru 2 — Oyuncu kaç aktörle diplomasi yapabilir? *(arayüz ölçeği)*

80 aktör var. Hepsiyle teklif alışverişi bir liste ekranı değil, bir kâbus.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Yalnızca "tanıdıkların"** *(önerim)* | Sınırdaş olduğun **veya** daha önce savaştığın **veya** belirli bir büyüklüğü aşmış aktörler. Liste doğal olarak 3–10 arasında kalır ve oyun ilerledikçe büyür |
| B | Herkes | 80 satırlık liste. Oyuncu okumaz, rastgele seçer |
| C | Yalnızca sınırdaşlar | En dar. Ama §10/2 (*"uzaktaki illerle ittifak kurulabilir"*) yazılamaz — diplomasinin coğrafya oyunu kısmı düşer |

**A'nın alt kuralı:** teklifler **sana da gelir.** Yapay zekânın teklifi tur raporunda
kart olarak çıkar, kabul/ret tek dokunuş. Diplomasinin yarısı gelen tekliftir; yalnızca
giden teklif olursa oyuncu diplomasiyi kendi başlatmadıkça hiç yaşamaz.

**Teklif sayısı sınırlı olacak** (`DENGE.DIPLOMASI.TUR_BASINA_TEKLIF`). Sınırsız teklif,
oyuncunun her tur 10 aktöre ittifak önerip birini tutturmasına yol açar — diplomasi
piyangoya döner.

### Soru 3 — Kazanma eşiği kaç olsun? *(denge — ölçümle)*

§8.1 modları tanımlıyor ama sayı vermiyor: *"Son ayakta kalan / il eşiği."*

**Sorunun büyüklüğü ölçülü:** Görev 07'nin simülasyonunda oyuncu 15 turda 0–9 parça
alıyordu; Görev 08'de zorlukta en büyük imparatorluk 25 parçaya çıktı. **181 parçanın
tamamını almak hiçbir modda gerçekçi değil.**

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Eşik ölçümle seçilir, hedef maç uzunluğuna göre** *(önerim)* | Önce "Türkiye modu kaç tur sürmeli" kararı verilir (öneri: 40–60 tur), sonra simülasyon o uzunlukta hangi eşiğin tutturulabildiğini söyler. Beş görevdir uygulanan yöntem |
| B | Sabit oran (ör. illerin %60'ı) | Kolay ama keyfî; tutturulabilir olup olmadığı bilinmiyor |
| C | Yalnızca "son ayakta kalan" | Tek koşul, sıfır ayar. Ama maç çok uzar ve son 20 tur formalite olur |

**A'nın ek çıktısı:** aynı ölçüm **yenilgi** tarafını da verir — oyuncu hangi turda,
hangi zorlukta eleniyor. Görev 07 raporu *"zor kademede oyuncu 15 turda elenebiliyor"*
demişti ve bunun cihazda denenmesi gerektiğini yazmıştı. Bu görev o soruyu kapatıyor.

### Soru 4 — Bölge modunun kapsamı nasıl seçilir? *(kapsam)*

§8.1 örnek veriyor: *"Tek coğrafi bölge (ör. Karadeniz, 18 il)."*

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Türkiye'nin 7 coğrafi bölgesi, hazır liste** *(önerim)* | Tanıdık, açıklama gerektirmiyor, veri tek tablo. Bölgeler arası boyut farkı (Doğu Anadolu 14 il, Güneydoğu 9) mod seçim ekranında **il ve parça sayısıyla** gösterilir |
| B | Oyuncu haritadan il seçer | En esnek ama yeni bir seçim ekranı, komşuluk bütünlüğü denetimi ve "seçtiğin bölge kopuk" hataları demek |
| C | Elle kurulmuş 3–4 senaryo | Dengelenmiş olur ama azdır ve tekrar oynanabilirliği düşük |

**A'nın teknik kolaylığı:** kapsam daraltma altyapısı Görev 02'den beri test aracı olarak
çalışıyor. Bölge modu bunu oyuncuya açmaktan ibaret.

> ⚠ **Kapsam dışı iller haritada nasıl duracak?** Bu, akıcılığın en kırılgan noktasına
> dokunuyor. Ayrıntı §6/8'de: **çizim dışı bırakılmaz, soluk çizilir** — 181 parçanın
> dolgusunu koşula bağlamak Görev 05'in altı turluk akıcılık kovalamacasının aynısını
> doğurur.

### Soru 5 — Kayıt yapısı: tek maç mı, birden çok mu? *(çerçeve)*

Bugün tek kayıt var. Mod sistemiyle birlikte oyuncu farklı maçlar oynamak isteyecek.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Üç yuva** *(önerim)* | Ana menüde üç maç yan yana: mod, tur, ilerleme. Yeni oyun boş yuvaya gider; dolu yuvaya yazarken uyarır |
| B | Tek kayıt | En basit. Ama yeni maç başlatmak eskisini **geri dönülmez** siler — §8.1 kayıt/yüklemeyi çekirdek özellik ilan etmişken kötü bir tercih |
| C | Sınırsız yuva | Liste ekranı, silme, adlandırma. Bu görevin işi değil |

**Not:** kayıt yuvası **ücretsizdir ve öyle kalacak.** §12.3 bunu 2026-07-23'te karara
bağladı: *"kayıt yuvası satılabilirler listesinden çıkarıldı."* Görev 10'un para kazanma
katmanı buraya dokunmayacak.

**Kayıt boyutu uyarısı:** bugün 15 turda 24.8 KB, sınır 26 KB. Üç yuva → üç kat yer.
Adım 0'da hem sınırın gerekçesi hem toplam boyut denetlenecek.

---

## 5. DİPLOMASİ MODELİ (Soru 1 = A varsayımıyla)

### 5.1 Üç durum

```
TARAFSIZ  (varsayılan)  → saldırabilirsin, saldırabilir
İTTİFAK                 → saldıramazsın; bozmanın bedeli var
SAVAŞ HALİNDE           → saldırabilirsin; ateşkesle biter; zekâ öncelik verir
```

Her ilişki **çift yönlü ve simetrik.** Tek taraflı "ben onunla ittifaktayım ama o benimle
değil" durumu yok — böyle bir şey tasarımda yazılı değil ve arayüzde anlatılamaz.

### 5.2 Zincir kuralı (§10/3)

Müttefikine saldıran, seninle de **savaş haline** girer. Ama §10 bir incelik ekliyor:
*"sınırdaş değilsen fiilen savaşamazsın, sadece savaş halinde görünürsün."*

Bu, oyunun en özgün diplomasi kuralı ve **bedava geliyor** — komşuluk grafiği zaten
saldırıyı fiilen engelliyor. Yapılacak tek şey durumu **göstermek**: haritada uzaktaki
düşmanın işaretli, ama sınırın oraya varana kadar yapabileceğin bir şey yok.

**Zincirin sınırı var:** savaş hali yalnızca **bir adım** yayılır. Müttefikimin
müttefikinin düşmanı benim düşmanım değildir. Aksi hâlde ilk savaşta harita ikiye bölünür.

### 5.3 İhanet bedeli (§10)

İttifakı bozan taraf `DENGE.DIPLOMASI.IHANET_SURESI` tur boyunca **hiçbir diplomasi
yapamaz** — teklif veremez, teklif alamaz. İttifakına saldırmak da ihanet sayılır ve aynı
bedeli doğurur.

**Neden bu kadar basit:** tasarım §10 tek cümle veriyor (*"aniden bozan taraf birkaç tur
diplomasi yapamaz"*). İtibar puanı, güven skoru gibi bir katman eklemek §10'da yok ve
oyuncuya açıklanması güç bir görünmez sayı üretir.

### 5.4 Ateşkes

Savaş halindeki iki taraf anlaşıp bitirebilir; sonuç **tarafsız** duruma dönüştür.
§10 bunun neden gerektiğini de yazıyor: *"yoksa savaş halinde ama savaşamıyor kalıcı
takılır."*

Yapay zekânın ateşkesi kabul etmesi fayda hesabına bağlı: kaybediyorsa, cephesi çoksa veya
temkinli kişilikteyse kabul eder.

---

## 6. TASARIMDA DOLDURULACAK BOŞLUKLAR

| # | Boşluk | Nasıl doldurulacak |
|---|---|---|
| 1 | İttifak teklifi nasıl değerlendirilir | `zeka.js`'in fayda kalıbı: ortak düşman + kendi cephe yükü + husumet (negatif) + temkin. **İkinci bir karar mantığı yazılmayacak** |
| 2 | Hasım illerle ittifak | Kurulamaz. Husumet ağırlığı zaten formülde; düello sürerken teklif tanım gereği reddedilir |
| 3 | Aynı anda kaç ittifak | `DENGE.DIPLOMASI.EN_COK_ITTIFAK`. Sınırsız olursa herkes herkesle anlaşır (§10/tuzak) |
| 4 | İttifak moral bonusu var mı | **Hayır.** Gerekçe §11/5: düello bonusu moral kalemlerini üçe çıkardı; dördüncü kalem bozgun eşiğini ölçülmemiş bir yere taşır. İttifak **kısıt ve zincirle** değer taşıyor, statla değil |
| 5 | Savaş hali kaç tur sürer | Ateşkese kadar; üst sınır `SAVAS_UST_SINIRI` → otomatik tarafsıza döner (unutulmuş savaşlar birikmesin) |
| 6 | Düello ile diplomasi çakışırsa | Düello üstündür. Kutsal savaş sürerken o çift ateşkes yapamaz — §11 *"düello kutsaldır, bölünmez"* |
| 7 | Kazanma anında oyun ne olur | Kart gelir; **"devam et" seçeneği sunulur** (haritayı temizlemek isteyen oyuncu için). Kayıt kazanıldı işaretiyle durur |
| 8 | Bölge modunda kapsam dışı iller | **Soluk çizilir, oynanmaz.** Çizimden çıkarılmaz — 181 parçanın dolgusunu koşula bağlamak haritayı her kip açılışında yeniden kurar (Görev 05'in altı turluk kovalamacası) |
| 9 | Bölge modunda garnizon ve gelir | Yalnızca kapsam içi iller aktör olur; kapsam dışı hiç işlenmez. Zekâ ve ölçüm de kapsamı okur |
| 10 | Ana menüdeki "devam et" | En son oynanan yuva; yuva yoksa düğme pasif ve sebebi yazılı |
| 11 | Yeni oyun dolu yuvaya yazarsa | Onay istenir — **geri alınamaz iş** (projenin onay kuralı) |
| 12 | Kazanma koşulu ekranda nerede | Tur çubuğunda tek satır ilerleme: *"Karadeniz: 11/18 il"*. Görünmeyen hedef hedef değildir |

---

## 7. VERİ MODELİ VE KAYIT

### Diplomasi kaydı

```
durum.iliskiler = {
  "06|34": { tip: "ittifak", turdan: 7 },
  "16|35": { tip: "savas",   turdan: 9 }
}
durum.ihanetler = { "06": 12 }   // hangi aktör hangi tura kadar diplomasi yapamaz
```

**Yalnızca varsayılan olmayan ilişkiler kaydedilir.** 81 aktörün tam matrisi 3240 çift
demek; tarafsızlık varsayılan olduğu için hiçbiri yazılmaz. Bu, Görev 06'nın `kadro` ve
Görev 07'nin `sahip` kararlarıyla aynı kalıp: **türetilebilen veya varsayılan olan
kaydedilmez.**

Anahtar biçimi (`küçük|büyük`) simetriyi tanım gereği garanti eder — aynı ilişki iki kez
yazılamaz.

### Mod ve maç kaydı

```
durum.mod = { tip: "bolge", kapsam: "karadeniz", kazanmaEsigi: 14 }
durum.sonuc = null | "kazandi" | "yenildi"
```

### Kayıt sürümü 9 — 1–8 reddedilir

Sürüm 8 için ayrı ret sebebi: dünya oynuyor ve hissediliyor ama **modu yok.** Sürüm 8
kaydı yüklenirse kazanma koşulu tanımsız kalır ve maç hiç bitmez.

> ⚠ **Kayıt boyutu bu görevin en somut riski.** Bugün 15 turda 24.8 KB, sınır 26 KB.
> Üstüne diplomasi + mod + üç yuva geliyor.
> **Adım 0'da iki şey yapılacak:** (1) 26 KB sınırının gerekçesi denetlenecek — keyfî bir
> hedefse gerekçeli olarak yükseltilecek; (2) 40 turluk bir maçta boyut ölçülecek, çünkü
> mod sistemiyle maçlar 15 turdan uzun olacak ve **bugüne kadarki bütün boyut ölçümleri
> 15 tur üzerinden yapıldı.**

---

## 8. ADIMLAR

| Adım | İş | Ekranda değişir mi |
|---|---|---|
| 0 | Zemin: denge yerleri, açık borçlar, kayıt sınırı denetimi, ses | hayır |
| 1 | Diplomasi motoru: üç durum, teklif, ateşkes, ihanet | hayır |
| 2 | Yapay zekâ diplomasisi | hayır |
| 3 | **ÖLÇÜM:** ittifak doygunluğu + denge + kazanma eşiği | hayır |
| 4 | Diplomasi arayüzü ve sahne olayları | **evet** |
| 5 | Mod sistemi ve kazanma/yenilgi koşulu | **evet** |
| 6 | Ana menü ve maç akışı | **evet** |
| 7 | Ses ve müzik (dosyalar geldiyse) | **evet** |
| 8 | Belgeler, testler, kayıt sürümü 9, cihaz denemesi | hayır |

**Adım 1–3 ekranda hiçbir şey değiştirmez** — beş görevdir uygulanan kural. Görev 08'de
bu kural bilinçli olarak gevşetilmişti çünkü orada ölçüt "his"ti; **burada ölçüt yeniden
test ve sayı**, dolayısıyla kural geri geliyor.

> **Görev 08'in ders notu uygulanıyor:** o görevde ölçüm adımı koddan önce planlanmıştı ve
> sıra çevrilmek zorunda kaldı — betik kendi hesabını yazsaydı `DENGE` değiştiğinde ölçüm
> sessizce yalan söylerdi. Burada ölçüm baştan **Adım 3'te** ve motoru çağırıyor.

---

### Adım 0 — Zemin ve devralınan borçlar

1. `DENGE.DIPLOMASI` açılır: teklif sınırı, en çok ittifak, ihanet süresi, savaş üst sınırı,
   fayda terim katsayıları. **Formülde çıplak sayı yok** — sekiz görevdir aynı kural.
2. `DENGE.MOD`: bölge listesi, kazanma eşikleri (Adım 3'ten sonra kesinleşir), tur limitleri.
3. **Kayıt boyutu denetimi** (§7'nin uyarısı): 26 KB sınırının gerekçesi + 40 turluk ölçüm.
4. **Devralınan dört açık madde Baki'ye sorulur:**
   - Ses dosyaları hazır mı? (`docs/GOREV-08-SES-LISTESI.md`, 12 dosya)
   - Üçüncü taraf kısıtı `cephe` mi `topraklar` mı? (cihazda denendi mi)
   - Kutsal savaşlar fazla uzun sürüyor mu? (moral üçüncü kalemi)
   - Husumet tablosuna satır eklenecek mi? (bugün 7 satır; iki çift komşu değil)
5. §14 denge düğmeleri tablosuna eklenecek satırlar işaretlenir.

---

### Adım 1 — Diplomasi motoru (`src/oyun/diplomasi.js`)

`rekabet.js`'in kalıbı birebir kullanılacak — ikisi de "iki aktör arasında turlara yayılan
ilişki" problemi.

```
iliskiDurumu(durum, aktorA, aktorB)        → "tarafsiz" | "ittifak" | "savas"
teklifGecerliMi(durum, kaynak, hedef, tip) → true | ret sebebi
teklifUygula(durum, teklif)                → yeni durum + olaylar
zincirYay(durum, saldiran, saldirilan)     → §10/3, tek adım
ihanetIsle(durum, aktor)                   → ihanet bedeli
savasBitir(durum, aktorA, aktorB)          → ateşkes
```

**Kısıt tek kapıdan geçecek:** `hareket.js hareketGecerliMi`. Görev 08'de üçüncü taraf
kısıtı oraya kondu ve oyuncu ile yapay zekâ aynı kuraldan geçti. İttifak kısıtı **aynı
yere** eklenir; ikinci bir kontrol yazılmaz (§10/tuzak 4 — aynı kural iki yerde tutulmaz).

**Zekâ ayrıca aday üretirken engellenen hedefleri eler** — hamle hakkını reddedilecek bir
emre yakmasın diye. Bu da Görev 08'de kurulmuş bir kalıp.

---

### Adım 2 — Yapay zekâ diplomasisi

```
ittifakPuani(durum, aktor, hedef, kisilik)  → sayı
ateskesPuani(durum, aktor, hedef, kisilik)  → sayı
diplomasiEmirleri(durum, aktor, kisilik)    → teklifler + cevaplar
```

**Fayda terimleri** (§9.1'in kalıbı, yeni mantık değil):

```
ittifak puanı = ortak düşman baskısı
              + kendi cephe yükü × temkin
              − husumet × (hasım mı)
              − açgözlülük × (hedefin bana komşu ve zayıf olması)   # yiyeceğim adamla anlaşmam
```

Son terim önemli: yapay zekâ **fethedebileceği komşusuyla ittifak yapmamalı.** Yapmazsa
ittifaklar rastgele görünür ve oyuncu diplomasiyi anlamsız bulur.

**Belirlenimcilik zorunlu:** teklif seçimi `rastgele.js` ile. Aynı tohum → aynı diplomasi.

---

### Adım 3 — ÖLÇÜM: doygunluk, denge, kazanma eşiği

> Bu adımın çıktısı bu görevin en kritik sayıları. Üçü de `scripts/zeka-olcum.js`
> genişletilerek ölçülür.

**a) İttifak doygunluğu — bu görevin en büyük riski.**

Herkes herkesle ittifak yaparsa savaş durur ve oyun donar. Ölçülecek:

| Ölçü | Sağlıklı aralık |
|---|---|
| 30 turda kurulan ittifak sayısı | — |
| Aynı anda etkin ittifak oranı | aktörlerin yarısından azı |
| **Tur başına savaş sayısı, diplomasi açık/kapalı** | belirgin düşüş **yok** |
| En büyük ittifak bloğunun büyüklüğü | haritanın yarısından küçük |

**Doygunluk çıkarsa** düğmeler hazır: `EN_COK_ITTIFAK`, teklif sınırı, açgözlülük terimi.

**b) Denge etkisi.** Görev 07 ve 08'in tablosuyla yan yana: en büyük imparatorluk, kalan
bağımsız aktör, oyuncunun aldığı parça — üç zorluk kademesinde.

**c) Kazanma eşiği (Soru 3/A).** Önce hedef maç uzunluğu kararı, sonra ölçüm:

| Mod | Hedef uzunluk | Ölçülecek |
|---|---|---|
| Bölge (18 il) | ? tur | Hangi il eşiği bu turda tutturuluyor |
| Türkiye (81 il) | ? tur | Hangi il eşiği tutturuluyor / son ayakta kalan ne zaman |
| Serbest | oyuncu seçer | Tur limiti seçenekleri |

**Aynı ölçüm yenilgiyi de verir:** oyuncu hangi turda, hangi zorlukta eleniyor. Görev 07'nin
açık bıraktığı soru burada kapanıyor.

**Çıktı:** `veri/diplomasi-olcum.md` + Baki'ye bir sayfalık özet. **Eşikler onaylanmadan
Adım 5'e geçilmez.**

---

### Adım 4 — Diplomasi arayüzü

**a) Diplomasi ekranı.** Tur çubuğundan açılır, savaş odasının tam perde kalıbıyla.

```
DİPLOMASİ                                    İttifakların: 2/3

⚔ KONYA        savaş halinde · 4 tur      [ATEŞKES TEKLİF ET]
   Sınırında 3 bölgesi var.

🤝 SAMSUN       müttefik · 6 turdur        [İTTİFAKI BOZ]
   Bozarsan 5 tur diplomasi yapamazsın.

   TRABZON      tarafsız · sınırdaşın      [İTTİFAK TEKLİF ET]
   ANKARA       tarafsız · uzak            [İTTİFAK TEKLİF ET]
```

> ⚠ **Perde açıkken harita jesti susturulacak.** Savaş odasının kalıbı — dördüncü kez.

**b) Gelen teklif kartı.** Tur raporunda `SahneKarti` kalıbıyla: kim, ne teklif ediyor,
kabul/ret. Diplomasinin yarısı gelen tekliftir.

**c) Haritada gösterim.** Müttefik ve savaş halindeki aktörler işaretli.

> ⚠ **Rozet ve sahne katmanlarının ortak yerleşimi bozulmayacak** (`haritaSabitleme.js`).
> Görev 08 efektleri rozetin *üstünde ayrı katmanda* çizerek çözdü ve bu daha güvenli çıktı.
> Diplomasi işareti **aynı yoldan** geçecek; rozetin içine yeni bir çizim eklenmeyecek.

**d) Sahne olayları.** İttifak kuruldu · bozuldu · ateşkes · savaş hali yayıldı. Hepsi
`olaylar.js`'ten geçer, yeni düzenek yok.

---

### Adım 5 — Mod sistemi ve kazanma koşulu

1. **Mod seçim ekranı:** üç mod, bölge listesi (il ve parça sayısıyla), zorluk, tohum.
2. **Kapsam uygulaması:** kapsam dışı iller soluk, oynanmaz, aktör değil (§6/8–9).
3. **Kazanma/yenilgi kontrolü** tur sonunda, tek yerde. Görev 07'nin asgari kontrolü
   buraya taşınır — **iki yerde iki kontrol kalmayacak.**
4. **Hedef göstergesi:** tur çubuğunda tek satır ilerleme.
5. **Sonuç kartı:** kazandın / yenildin + özet + "devam et" seçeneği.

---

### Adım 6 — Ana menü ve maç akışı

```
        İL SAVAŞI

     [ DEVAM ET ]        ← en son yuva; yoksa pasif + sebebi
     [ YENİ OYUN ]       → mod seçimi
     [ MAÇLARIM ]        → üç yuva: mod, tur, ilerleme
     [ AYARLAR ]
```

**Akışın değişmezi:** oyun durumu **yalnızca** yeni maç başlarken veya yuva yüklenirken
kurulur. Menüden haritaya geçiş, haritadan menüye dönüş sırasında durumun bozulmadığı
testle kilitlenecek — **bu görevin en olası sessiz hatası** (§10/8).

Dolu yuvaya yazmak **geri alınamaz iş**, onay istenecek (projenin onay kuralı).

---

### Adım 7 — Ses ve müzik

Dosyalar geldiyse: `src/sahne/ses.js` bağlanır (`expo-audio`), 12 sesin eşlemesi, ana menü
ve maç müziği, ayarlarda ses/müzik ayrı düğmeler.

**Paket boyutu ölçülür.** Bugün 5.9 MB; müzik en çok yer kaplayan varlık türü olacak.

**Dosyalar gelmediyse bu adım atlanır** ve borç Görev 10'a taşınır — ses katmanı ayrı
olduğu için maliyeti yok.

---

### Adım 8 — Belgeler, testler, kayıt, cihaz denemesi

1. Kayıt sürümü 9, 40 turluk boyut ölçümü.
2. Tasarım belgesi: §10 (üç durum modeli, zincirin tek adımı, ihanet), §8.1 (eşikler,
   bölge listesi), §14 (yeni düğmeler), yeni bölüm: **çerçeve ve maç akışı**.
3. `veri/URETIM-NOTU.md`: kararlar **gerekçesiyle**.
4. **Cihaz denemesi** — Görev 08'in ölçülmemiş kare bütçesi dahil.
5. `npm.cmd run kontrol` + `npx.cmd expo export`.

---

## 9. TESTLER VE BİTİŞ ÖLÇÜTÜ

**Sayı hedefi:** Görev 08 sonunda 497 test vardı; bu görev **~55 test** eklemeli
(hedef ~550).

### Geri gidiş kilidi

- [ ] §3.7'nin 15 satırı 15/15
- [ ] Görev 08'in olay ve rekabet testleri değişmeden geçiyor
- [ ] `haritaSabitleme` testleri diplomasi işareti eklendikten sonra da geçiyor
- [ ] Hiçbir savaş adı `src/` içine sızmıyor (Görev 08'in kendini kanıtlamış testi)

### Diplomasi

- [ ] İlişkiler simetrik; aynı çift iki kez yazılamıyor
- [ ] Müttefike saldırı engelleniyor — **oyuncu ve yapay zekâ aynı kapıdan**
- [ ] Zincir **tek adım** yayılıyor; müttefikimin müttefikinin düşmanı benim düşmanım değil
- [ ] İhanet bedeli işliyor; süresi dolunca diplomasi açılıyor
- [ ] Ateşkes savaşı bitiriyor, tarafsıza dönüyor
- [ ] Düello sürerken o çift ateşkes yapamıyor (§11 üstün)
- [ ] Hasım illerle ittifak kurulamıyor
- [ ] İttifak sayısı sınırı aşılamıyor
- [ ] Yapay zekâ fethedebileceği zayıf komşusuyla ittifak yapmıyor
- [ ] Belirlenimci: aynı tohum → aynı diplomasi (10 koşu)
- [ ] **İttifak doygunluğu yok:** diplomasi açıkken tur başına savaş sayısı belirgin düşmüyor

### Mod ve kazanma

- [ ] Bölge modunda kapsam dışı iller aktör değil, gelir üretmiyor, zekâ görmüyor
- [ ] Kapsam dışı iller **çiziliyor** (soluk) — harita kip değişiminde yeniden kurulmuyor
- [ ] Kazanma koşulu tek yerde kontrol ediliyor
- [ ] Üç modun üçünde de kazanma ve yenilgi tetikleniyor
- [ ] Hedef göstergesi gerçek ilerlemeyi yazıyor

### Çerçeve

- [ ] Menü → maç → menü gidiş dönüşünde oyun durumu bozulmuyor
- [ ] Üç yuva bağımsız; birine yazmak ötekini etkilemiyor
- [ ] Dolu yuvaya yazarken onay isteniyor
- [ ] "Devam et" yuva yoksa pasif ve sebebi yazılı
- [ ] Kayıt sürümü 9; 1–8 anlaşılır mesajla reddediliyor
- [ ] **40 turluk maçta kayıt boyutu ölçüldü ve sınırın altında**

### Genel

- [ ] `npm.cmd run kontrol` temiz · `npx.cmd expo export` hatasız
- [ ] Paket boyutu ölçüldü
- [ ] Cihazda denendi — **Baki onayı**
- [ ] `veri/diplomasi-olcum.md` yazıldı, eşikler gerekçeli

---

## 10. TUZAKLAR

**Önceki görevlerden taşınanlar:**

1. **Üstteki kutu, yerel katmandaki harita jestini engellemez.** Diplomasi ekranı ve mod
   seçimi için jest susturulacak — savaş odasının kalıbı, dördüncü kez.
2. **Rozet ve sahne katmanlarının ortak yerleşimi.** Diplomasi işareti rozetin içine değil,
   sahne katmanının yoluna girecek (Görev 08'in daha güvenli çıkan çözümü).
3. **Harita dolgusunu koşula bağlamak.** Kapsam dışı iller çizimden çıkarılırsa harita her
   kip açılışında baştan kurulur — Görev 05'in altı turluk akıcılık kovalamacası.
4. **Aynı kural iki yerde tutulmaz.** İttifak kısıtı `hareketGecerliMi`'de tek yerde;
   kazanma kontrolü tek yerde.
5. **Denge sayısı sızıntısı.** Eşikler, süreler, katsayılar `DENGE`'de.

**Bu göreve özgü:**

6. **İttifak doygunluğu — bu görevin oyunu bozabileceği tek yer.** Herkes herkesle
   anlaşırsa savaş durur ve oyun donar. Adım 3 bunu **kod tamamlanmadan** ölçüyor.
7. **Kayıt boyutu.** Diplomasi + mod + üç yuva üst üste biniyor ve bugüne kadarki bütün
   ölçümler 15 tur üzerindendi; mod sistemiyle maçlar uzayacak. Adım 0 ve Adım 8'de iki kez
   ölçülüyor.
8. **Menü ↔ maç geçişi bu görevin en olası sessiz hatası.** Oyun sekiz görevdir tek bir
   duruma sahipti; artık kurulup yıkılacak. Yanlış yapılırsa **çökmez, sessizce yanlış
   maçı yükler.** Testle kilitleniyor.
9. **Diplomasi arayüzü şişebilir.** 80 aktör listelenirse okunmaz. "Tanıdıkların" süzgeci
   **baştan** konacak, sonra kısaltılmaya çalışılmayacak.
10. **Moralin dördüncü kalemi.** İttifak bonusu **bilerek yok** (§6/4). Sonradan
    "ittifaka küçük bir bonus verelim" denirse §11/5'in uyarısı geçerli: bozgun eşiği
    ölçülmemiş bir yere kayar.

---

## 11. GÖREV 10 İÇİN BEKLEYENLER

Para kazanma (§12: hayat kalitesi, başlangıç güçlendirmeleri, reklam kırmızı çizgisi) ·
sıcak koltuk · başarımlar (§11'in oyuncu başarımı) · yayın hazırlığı (mağaza görselleri,
ikon, açıklama) · asenkron çevrimiçi (§13.1, v1.5).

**Bu görevden Görev 10'a geçecek hazır girdiler:**
- **Mod sistemi** — sıcak koltuğun hangi maç uzunluğuna hizmet edeceği artık bilinecek
- **Ana menü ve yuva düzeneği** — mağaza ve başarım ekranları aynı akışa takılacak
- **Kazanma/yenilgi kartları** — başarım bildirimleri aynı kalıbı kullanır
- **Ölçüm düzeneği** — "para güç satmıyor" kırmızı çizgisi (§12.1) aynı betikle sınanır

Görev 09 bittiğinde oyun **bitirilebilir**. Görev 10 onu **yayınlanabilir** yapan katman.

---

## EK — KARAR ÖZETİ

| Soru | Cevap | Tarih |
|---|---|---|
| 1 — Savaş ilanı zorunlu mu | **A** — üç durum, ilan yok | 2026-08-01 |
| 2 — Diplomasi kimlerle | **A** — yalnızca "tanıdıkların" | 2026-08-01 |
| 3 — Kazanma eşiği + maç uzunluğu | **Belgeden farklı** — mod = kazanma koşulu, üç tane (aşağıda) | 2026-08-01 |
| 4 — Bölge modunun kapsamı | **A** — 7 coğrafi bölge, hazır liste | 2026-08-01 |
| 5 — Kayıt yapısı | **A** — üç yuva | 2026-08-01 |
| + Ses dosyaları hazır mı | **Hayır** — Adım 7 atlanır, borç Görev 10'a | 2026-08-01 |
| + Üçüncü taraf kısıtı | **`topraklar`** + iki yeni kısıt (aşağıda) | 2026-08-01 |
| + Kutsal savaşlar fazla uzun sürüyor mu | **Henüz görülmedi** — cihaz denemesine (Adım 8) | 2026-08-01 |
| + Husumet tablosuna eklenecek satırlar | **Gerek yok** — tablo 2026-08-01'de 7 satıra tamamlanmıştı | 2026-08-01 |

---

## EK 2 — BELGEDEN İKİ SAPMA (2026-08-01)

### Sapma 1 — MOD = KAZANMA KOŞULU, KAPSAM AYRI EKSEN

Belge §2 ve §4/Soru 4 modları **kapsama** göre tanımlıyordu: Bölge · Türkiye · Serbest.
Baki modları **kazanma koşuluna** göre tanımladı:

> *"1.si tüm Türkiye'yi fethetmek gerektiren, 2.si %50'sini fethetmenin yeterli olduğu,
> 3.sü sınırlı sayıda turda en çok güçlenen il olmak. Bu 3'ü şimdilik yeterli bence."*

**Bu ayrım daha iyi ve bölge modunu dışlamıyor** — ikisi dik eksen:

```
KAPSAM (Türkiye / 7 coğrafi bölge)  ×  KAZANMA KOŞULU (Fetih / Yarım Fetih / Güç Yarışı)
```

Bölge modu böylece kaybolmuyor, üç kazanma koşulunun üçüyle de oynanabiliyor. Baki
Soru 4'te zaten "7 coğrafi bölge, hazır liste" demişti; iki cevap çelişmiyor, birbirini
tamamlıyor. Belgenin "Serbest" modu düşüyor: karşılığı artık **kapsam + koşul seçimi**.

### Süre → tur çevrimi

Baki **süre** verdi, tur değil:

> *"Türkiye'yi fethettiğimiz modda süre sınırı üst sınır olarak 1 saat civarı olacak
> şekilde ayarlansın, iyi oynanırsa ortalama 30-40 dk'de bitsin. %50'de ise üst sınır
> 30-40 dk civarı olsun. En çok güçlenen il için de kaç tur olması gerektiğini sen
> hesapla, o da 20-30 dk civarı sürsün."*

Çevrim `DENGE.MOD.SANIYE_PER_TUR` (45 sn) üzerinden ve tur sınırı **kapsam büyüklüğüne
göre ölçekleniyor** (`TABAN + PARCA_BASINA × parça`) — sabit sayı, bölge maçını 20 turda
bitirip kalanını formaliteye çevirirdi. Türkiye kapsamında çıkan sayılar:

| Mod | Tur | Süre | Kazanma eşiği |
|---|---|---|---|
| **Fetih** | 80 | ~60 dk | 181/181 parça |
| **Yarım Fetih** | 50 | ~38 dk | 91/181 parça |
| **Güç Yarışı** | 35 | ~26 dk | sıralama — en çok parçası olan |

⚠ **45 sn/tur ÖLÇÜLMEDİ, HESAPLANDI** ve bu görevin en zayıf varsayımı. Gösteri kısmı
ölçülü (6.6 sn, `veri/sahne-olcum.md`); oyuncunun karar süresi (~38 sn) tahmin. Adım 8'in
cihaz denemesinde düzeltilecek — düzeltilecek yer tur sınırları değil **tek sayı**.

### Sapma 2 — ÜÇÜNCÜ TARAF KISITI: `topraklar` + İKİ YENİ KISIT

Belge bunu `cephe`/`topraklar` ikilisi olarak sormuştu. Baki üçüncüsünü istedi:

> *"Üçüncü bir aktör düelloya hiçbir şekilde karışamayacak, fakat düelloyu başlatmanın
> şartları olmalı: öncelikle başka illerle savaşta olmamalı düellonun her iki tarafı da;
> düello maksimum 5 tur koruma sağlamalı, saldırı ve savunma avantajları da maksimum
> 5 tur olmalı gibi birkaç kısıt."*

Görev 08 `topraklar`ı tematik olarak daha güçlü bulmuş ama **sömürülebilir** diye geri
çevirmişti: *"oyuncu hasmına bilerek saldırıp sınırını 10 tur dokunulmaz yapabilir."*
Baki'nin iki kısıtı tam olarak o sömürüyü kapatıyor:

| Kısıt | Nereye | Sömürüye etkisi |
|---|---|---|
| `DUELLO_SURESI` 10 → **5** | `DENGE.REKABET` | Dokunulmazlık yarı yarıya kısaldı |
| `GIRIS_SARTI: 'baskaSavasYok'` | `DENGE.REKABET` | Sömürüyü yapacak oyuncu tanım gereği saldırgandır, yani başkalarıyla da savaş halindedir → **düellosu hiç başlamaz** |

**Seçenek değişmedi, etrafındaki kurallar değişti.** Ayrıca giriş şartı "savaş hali"
kavramına dayanıyor ve o kavram bu görevde doğuyor — yani **Görev 08'in borcunu kapatan
şey, Görev 09'un yeni sistemi.**

---

## EK 3 — ADIM 0 BİTTİ (2026-08-01)

| İş | Sonuç |
|---|---|
| `DENGE.DIPLOMASI` | Açıldı — teklif sınırı, en çok ittifak, ihanet süresi, savaş üst sınırı, tanıdık süzgeci, fayda katsayıları, ateşkes şartları |
| `DENGE.MOD` | Açıldı — üç mod tipi, 8 kapsam, tur sınırı formülü, yuva sayısı |
| `DENGE.REKABET` | `topraklar` + `DUELLO_SURESI: 5` + `GIRIS_SARTI` |
| Kayıt boyutu denetimi | **Yapıldı — sonuç aşağıda** |
| Devralınan dört madde | Dördü de Baki'ye soruldu ve cevaplandı (Karar Özeti) |

### Kayıt boyutu — sınır keyfiydi ve ZATEN AŞILIYORDU

Ölçüm: `node scripts/kayit-boyut-olcum.js` → `veri/kayit-boyut-olcum.md` (60 tur, 3 koşu).

**Bulgu 1 — 26 KB bir depolama sınırı değil, bir kanarya.** Görev 03 §7: *"yüzlerce KB
ise GEOMETRİ SIZMIŞ demektir."* 26, o gün ölçülenin biraz üstüne konmuştu. Gerçek kısıt
AsyncStorage'da ve kat kat yukarıda (Android varsayılanı ~6 MB).

**Bulgu 2 — sınır 40+ turluk maçta zaten aşılıyordu.** Bugüne kadarki bütün ölçümler
15 tur üzerindendi:

| | tur 15 | tur 50 |
|---|---|---|
| Türkiye · orta | 24.8 KB | **26.4 KB** ← sınırın üstü |

Yani diplomasi ve mod daha eklenmeden sınırın dışındaydık.

**Bulgu 3 — `aktorler` alanının 4.8 KB'ı boşuna yazılıyordu.** Aktörün altı alanının
dördü türetilebiliyor (`id` zaten anahtar · `ad` ILLER'den · `renk` sabit tablodan ·
`tur` `oyuncuAktorId`'den). `kisilikler` ve `ordu.sahip` için zaten uygulanan kuralın
üçüncü uygulaması. **Kayıt 26.4 → 22.0 KB.**

**Sonuç:** sınır `DENGE.KAYIT_SINIRI_KB = 32`. Kanarya işlevi duruyor — tek bir parçanın
geometrisi ortalama ~8.7 KB (1.58 MB / 181), yani bir parça bile sızsa 30 KB'ı geçer ve
test öter. Boyut testi 15 tur yerine **50 tur** oynuyor artık.

### Yolda kapatılan tuzak

`senaryolar.js` kendi kapsam tablosunu tutuyordu; mod seçim ekranı aynı listeyi
gerektirdiği için iki kopya doğacaktı — §10/4'ün ta kendisi. Liste tek yere
(`DENGE.MOD.KAPSAMLAR`) toplandı, `veri-dogrula.js` bölge adlarının `iller.json` ile
tuttuğunu denetliyor. Ayrışsalardı bedeli sinsi olurdu: **mod ekranı bir kapsamı
gösterip oyun başkasını kurardı ve hiçbir yerde hata çıkmazdı.**

### Kayıt sürümü — belgeye uyulmadı, gerekçesi var

Belge sürüm 9'u Adım 8'e yazmıştı. Adım 0'da kayıt biçimi zaten değişti (aktör alanları),
**yine de yükseltilmedi**: değişiklik geriye dönük uyumlu yazıldı (`a.ad || türet`), yani
sürüm 8 kaydı bugün sorunsuz yükleniyor. Yükseltmek, hiçbir şey bozulmamışken Baki'nin
elindeki kaydı reddetmek olurdu — Görev 07'nin dersi tam buna karşıydı.

**Sürüm 9 Adım 5'te yükselecek**, çünkü sürüm 8'i gerçekten kıran şey orada geliyor:
`durum.mod` olmayan bir kayıtta kazanma koşulu tanımsız kalır ve maç hiç bitmez.
