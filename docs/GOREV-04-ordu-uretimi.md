# GÖREV 04 — ORDU ÜRETİMİ, YATAY TUTUŞ VE ROZET KATMANLARI

> Baştan sona oku. §4'teki dört soruyu Baki cevaplamadan kod yazmaya başlama.

---

## 0. KİMİNLE ÇALIŞIYORSUN

Kullanıcının adı **Baki**. Oyunun tasarımcısı ve sahibi. **Yazılımcı değil.** Kod okumayacak, hata mesajlarını yorumlayamaz.

- Komutları satır satır, kopyalanabilir biçimde ver.
- Teknik terim kullanacaksan yanına tek cümlelik Türkçe karşılık koy.
- Ne yaptığını değil, **Baki'nin ekranda ne göreceğini** anlat.
- Türkçe konuş.

---

## 1. BU GÖREV NE YAPIYOR

Görev 03'te kaynak birikmeye başladı ama harcanacak yeri yoktu. Bu görev o boşluğu kapatıyor: **oyuncu ordu satın alıyor, ordular haritada görünüyor.**

```
İl özellikleri → kaynak üretimi → ordu inşası → MUHAREBE
    (Görev 02)     (Görev 03)     (BU GÖREV)    (Görev 05)
```

Muharebe **bu görevde yok.** Ordular üretilecek, haritada duracak, hareket etmeyecek ve savaşmayacak. Bu tuhaf gelebilir; doğrusu budur. Ordu üretimi ve gösterimi doğru çalışmadan muharebe kurmak, hatanın hangi katmanda olduğunu bulunamaz hale getirir.

---

## 2. KAPSAM

### Yapılacak

0. Belgedeki iki kalıntıyı düzelt
1. **Yatay tutuşu zorla**, arayüz yerleşimini yataya uyarla
2. Yakınlaştırma katmanlarını ölç ve tanımla
3. Ordu veri modeli + denge sabitleri
4. Üretim ekranı — doğrudan birim satın alma
5. Ordu rozetleri — üç katmanlı gösterim
6. "Geçen turun siparişini tekrarla"
7. Belgeler ve testler

### Yapılmayacak

- **Muharebe, hasar, moral, bozgun** (Görev 05)
- **Hareket** — ordular üretildiği yerde durur, bu görevde taşınmaz
- Araştırma (§6), diplomasi, yapay zekâ
- Yeniden toplanma (§3.9)
- Mod seçim ekranı, ana menü

> **Kapsam uyarısı.** Görev 01, 02 ve 03'te kapsam üç kez kendiliğinden büyüdü. Hareket ve muharebe bu görevde yok. "Madem ordu var, bir de hareket ettirelim" **yapma.**

---

## 3. KAYNAK BELGELER

- `docs/il-savasi-tasarim.md` — §3.1 (birim statları ve maliyetleri), §4.1 (iki para birimi), §4.2 (satın alma ekranı), §4.4 (garnizon/sefer), §4.5 (beklenen karışımlar), §5 (7 stat), §7 (harita, parça, rozet kuralı), §8 (tur döngüsü), §14 (denge düğmeleri)
- `docs/il-savasi-parca-bolumleme-v3.md` — 181 parça, iç çember ölçüleri
- `veri/parca-olcum.md` — rozet ölçüm verisi, yakınlaştırma tabloları
- `veri/URETIM-NOTU.md` — geçmiş kararlar

---

## 4. ÖNCE DÖRT SORU — BAKİ CEVAPLAMADAN KOD YAZMA

Bu dördü veri modelini ve arayüzü belirliyor. Hepsini birlikte sor, cevap bekle. Her soruda **kendi önerini de belirt** ama kararı verme.

### Soru 1 — Ordu nerede üretilir?

Görev 03'te kaynak havuzu **imparatorluk düzeyinde** tutuluyor (aktörün tek nüfus havuzu, tek ekonomi havuzu). Tasarım §13.3 da il bazlı ayrı kompozisyonu kapsam dışı bırakıyor. Yani bütçe tek. Ama üretilen birim **bir yere** konmalı.

| Seçenek | Nasıl işler | Bedeli |
|---|---|---|
| **A. Seç ve üret** | Kendi parçana dokun → üretim ekranı açılır → o parçada birim doğar | Cephe planlaması oyuncuda; en çok kontrol |
| **B. Merkezde doğar** | Başkent parçası belirlenir, hepsi orada doğar | Basit ama hareket olmadığı için bu görevde tüm ordu tek yerde yığılır |
| **C. Otomatik dağıtım** | Motor sınır parçalarına paylaştırır | Oyuncudan karar alır, strateji oyununda zayıf |

**Önerim: A.** Hareket Görev 05'te geleceği için, ordunun doğduğu yer bu görevde tek konumlandırma aracı. B seçilirse harita test edilemez hale gelir — her şey tek noktada birikir.

### Soru 2 — Sanayi statı ne yapıyor?

Tasarım §5 madde 4: "Sanayi / üretim → ordu üretim hızı". Ama oran seçici kalkıp doğrudan satın almaya geçildiğinde "hız" diye bir şey kalmadı — parası olan istediğini alıyor. Bu stat şu an **hiçbir işe yaramıyor.**

| Seçenek | Nasıl işler |
|---|---|
| **A. Tur başına üretim üst sınırı** | O ilde tur başına en fazla `sanayi` kadar birim üretilebilir. Sanayi 9 olan İstanbul turda 9 birim, sanayi 2 olan Bayburt 2 birim. |
| **B. Maliyet indirimi** | Sanayisi yüksek ilde birim ekonomi bedeli düşer |
| **C. Şimdilik pasif** | Panelde görünür, işlevi Görev 05+'a bırakılır |

**Önerim: A.** Ekonomik gücü coğrafyaya bağlar — zengin ama sanayisiz oyuncu parasını tek turda orduya çevirip baskın yapamaz. Ayrıca altyapı statının kalkmasıyla oluşan "coğrafya yavaşlatır" boşluğunu doldurur. B, §4.5'teki denge tablosunu bozar (o tablo sabit maliyetlerle test edilmiş).

### Soru 3 — Garnizon/sefer ayrımı hâlâ anlamlı mı?

Tasarım §4.4: "Birimlerin bir kısmı ilde garnizon bırakılır, bir kısmı sefere çıkar."

Bu kural, parça haritada görünmezken yazılmıştı. Şimdi parça fiziksel bir bölge — bir parçada duran birim onu savunuyor, çıkan birim sefere gitmiş oluyor. Ayrım **kendiliğinden** oluşuyor.

Altyapı statı tam bu gerekçeyle kaldırılmıştı: coğrafyanın kendisi yaptığı işi ikinci bir mekanikle tekrarlamak.

| Seçenek | Nasıl işler |
|---|---|
| **A. Kaldır** | Birim bir parçada durur. Kalırsa savunur, giderse saldırır. Ayrı etiket yok. |
| **B. Koru** | Her birim "garnizon" veya "sefer" işaretli olur; garnizon parçadan çıkamaz |

**Önerim: A.** B'nin tek faydası oyuncunun kendini yanlışlıkla savunmasız bırakmasını engellemek; bu, hareket ekranında bir uyarıyla da çözülür.

Kararın ne olursa olsun tasarım §4.4 buna göre güncellenecek.

### Soru 4 — Bir parçada en fazla kaç birim durabilir?

Rozet ölçümü **iki haneli sayı** (26 piksel) varsayımıyla yapıldı. Tasarım belgesi de bunu destekliyor: "bir ilin ordusu 2–10 birim, güçlü bir imparatorluk cephe başına 15–20 birim."

Yani 99'un üstüne çıkılmaması gerekiyor, yoksa rozet ölçümü geçersizleşir.

| Seçenek | Nasıl işler |
|---|---|
| **A. Sınır yok** | Teoride 100+ birim yığılabilir, rozet taşar |
| **B. Yumuşak sınır** | Sınır yok ama rozet 99'da durur ("99+") |
| **C. Sert sınır** | Bir parçada en fazla N birim (örn. 20) |

**Önerim: B.** Sert sınır tasarım belgesinde yok, şimdi icat etmek erken. Ama rozetin taşmaması garanti altına alınmalı.

---

## 5. ADIM 0 — BELGEDEKİ İKİ KALINTI

Kod yazmadan önce, hızlı iş.

**5a. §7'deki Ankara çelişkisi.** Aynı bölümde iki satır çelişiyor:

- "Her ilin **1–4 arası parça** sayısı vardır (Yalova 1, Ankara 4)" ✓ doğru
- "Ankara'yı tamamen almak = **5 parçasının 5'ini** de almak" ✗ eski

İkinciyi düzelt: Ankara 4 parça.

**5b. Erzurum istisnası artık yok.** §7'deki tam sayı kuralı şöyle diyor: "Tek istisna: bir ilin parça sayısı statından fazlaysa (yalnızca Erzurum'un ekonomisi) 'en az 1' kuralı toplamı 1 artırır."

Yeniden bölümlemeyle Erzurum 5'ten 4 parçaya indi ve bu sapma kayboldu (`URETIM-NOTU.md`'de kayıtlı: "il üretimi = statı artık istisnasız"). Cümleyi kaldır veya "şu an istisna yok" olarak güncelle.

**5c. §13.1 motor satırı.** "Motor: Godot önerilir" yazıyor, proje Expo'da yürüyor. Tek satır: Expo seçildi, gerekçesi Baki'nin görsel editör kullanmadan ilerlemesi.

**Baki'nin kontrolü:** Üç düzeltme yapıldı mı?

---

## 6. ADIM 1 — YATAY TUTUŞ VE YERLEŞİM

**Karar (Baki, 2026-07-27): oyun yatay tutuşa kilitlenir.** Strateji haritası dik tutuşta oynanamaz; ölçüm bunu doğruladı (dik tutuşta 1× yakınlaştırmada hiçbir parçaya rozet sığmıyor, yatayda harita 2.2 kat büyük çiziliyor).

**6a. Kilitleme.** Uygulama yalnızca yatay açılsın (`app.json` yönlendirme ayarı + `expo-screen-orientation`). Dik tutmaya çalışan oyuncuda ekran dönmesin.

**6b. Yerleşim yataya uyarlanacak — bu, göründüğünden büyük bir iş.**

Görev 03'te telefon arayüzü **dik tutuş için** ayarlanmıştı (`src/olcu.js`). O kararlar artık ters düşüyor:

| Öğe | Dik için verilen karar | Yatayda durum |
|---|---|---|
| Harita tipi düğmeleri | Yatay şerit, alt kenarda | Yatayda yükseklik kıt — **dikey sütuna geri dönmeli**, yan kenara |
| Tur çubuğu | Üstte tam genişlik | Yatayda çok geniş kalır, haritanın üstünü boşa kaplar |
| Panel | Alttan açılır, %54 yükseklik | Yatayda ekranın yarısını yer — **yan panele** dönmeli |

`olcu.js`'teki "telefon mu tablet mi" ölçütü (kısa kenar < 600 dp) **doğru kalıyor** — kısa kenar tam bu yüzden seçilmişti, döndürmeden etkilenmez. Değişen şey yerleşim yönü.

**Yaklaşım:** Panel yan tarafa alınırsa harita için kalan alan daralır ama yükseklik korunur. Yatay ekranda bu doğru takas. Panelin hangi yana geleceğini (sol/sağ) Baki'ye sor — sağ el kullanımında sağ kenar daha erişilebilir ama haritayı sağ elle kaydırırken paneli kapatır.

**Baki'nin kontrolü:** Telefonu yatay tutsun. Harita alanı yeterli mi, düğmeler parmakla rahat basılıyor mu, panel haritayı boğuyor mu?

---

## 7. ADIM 2 — YAKINLAŞTIRMA KATMANLARI

**Karar (Baki, 2026-07-27): üç katmanlı gösterim.**

| Katman | Yakınlaştırma | Haritada görünen |
|---|---|---|
| **Uzak** | En uzak seviye | **Yalnızca harita.** Rozet yok, birlik yok. |
| **Orta** | Ara seviye | **İl başına tek rozet** — o ildeki toplam birim sayısı |
| **Yakın** | Yakın seviye | **Parça başına rozet** — o parçadaki birim sayısı |

Rozet **haritayla birlikte büyümez** (Baki'nin kararı) — ekran üzerinde sabit boyutta kalır. Yani yakınlaştıkça rozet aynı kalır, parça büyür; rozetin sığması kolaylaşır.

### 7.1 Önce ölç, sonra eşiği belirle

Katman sınırlarını tahminle koyma. Sıra şu:

1. **Uygulamadaki gerçek yakınlaştırma aralığını raporla.** En küçük ve en büyük değer nedir? 1×'in altına inilebiliyor mu? Baki bunu bilmiyor, sen koddan okuyup söyle.
2. `veri/parca-olcum.md`'deki ölçümü **yatay tutuşa göre** yeniden hesapla. Mevcut tablo dik tutuş (412 dp) referanslı; yatayda 1 harita birimi 0.912 piksel.
3. Her yakınlaştırma adımı için hesapla: kaç parçaya 26 piksellik rozet sığıyor, kaç ile sığıyor.
4. **Görsel önizleme üret** — `onizleme/rozet-katman-testi.html`. Yatay ekran oranında, kaydırıcıyla yakınlaştırma değiştirilebilir, üç katman geçişi görülebilir.
5. **Dur, Baki'ye göster.** Sınırları o söyleyecek.

### 7.2 Rozet kuralları

- **Boş parçada rozet yok.** Bu en önemli kural: parçaların çoğu boş olacak, 181 rozet asla aynı anda görünmeyecek. Kalabalık sorunu ölçümün gösterdiğinden küçük.
- **Sahibinin renginde.** Kimin ordusu olduğu tek bakışta anlaşılsın.
- **İçerik: birim sayısı.** Kompozisyon (kaç piyade, kaç topçu) rozette değil panelde. Rozete üç sayı sığmaz.
- **Orta katmanda il toplamı** = o ildeki tüm parçalardaki birimlerin toplamı. Birden fazla sahip varsa **en çok birimi olanın rengi** ve toplam gösterilir; panelde ayrıntı verilir.
- **99+ kuralı** (Soru 4'ün cevabına göre): sayı 99'u geçerse "99+" yazılır, rozet büyümez.
- **Gelibolu istisnası.** 17-1 Gelibolu Yarımadası'nın iç çemberi 10.1 — rozet sığmıyor. `URETIM-NOTU.md`'de "rozet denize doğru kaydırılacak" diye kayıtlı ama yapılmadı. Bu parçanın rozeti elle belirlenmiş bir noktaya konsun (parçanın dışına, denize doğru, ince bir çizgiyle parçaya bağlı). Aynı çözüm eşik altındaki diğer dört parça için de gerekebilir: Yalova 8.6, İskenderun Körfezi 12.8, Gebze Sanayi 13.0, Kilis 13.6. Ölç, gerekiyorsa uygula.

**Baki'nin kontrolü:** Önizlemede üç katman geçişi doğal mı? Uzakta harita temiz mi, ortada il toplamları okunuyor mu, yakında parça rozetleri sığıyor mu?

---

## 8. ADIM 3 — ORDU VERİ MODELİ VE DENGE SABİTLERİ

### 8.1 Birim tipleri ve maliyetler

Tasarım §3.1'den aynen (bu sayılar test edilmiş, değiştirme):

| Birim | Zırh | Ağır vuruş | Hafif vuruş | Dayanıklılık | Nüfus | Ekonomi |
|---|---|---|---|---|---|---|
| Piyade | 2 | 3 | 6 | 12 | **3** | **1** |
| Topçu | 4 | 8 | 3 | 10 | **2** | **3** |
| Zırhlı | 8 | 6 | 5 | 24 | **1** | **6** |

Muharebe statları (zırh, vuruşlar, dayanıklılık) bu görevde **kullanılmayacak** ama modele girsin — Görev 05 onları okuyacak. Panelde gösterilebilir.

**Hepsi `src/denge.js`'e.** Tasarım §14 bu maliyetleri denge düğmesi olarak listeliyor ("zırhlı ekonomi maliyeti 6 → doğrudan §4.5 tablosunu kaydırır"). Kod içine gömme.

### 8.2 Oyun durumuna eklenecek

```js
// oyunDurumu içine
ordular: {
  "16-1": {                      // parça kimliği
    sahip: "16",                 // aktör kimliği
    birimler: { piyade: 3, topcu: 1, zirhli: 1 }
  }
}
```

Kurallar:

- **Boş parça için kayıt tutulmaz.** Ordusu olmayan parça `ordular`'da hiç görünmez. Dosya boyutu ve kayıt boyutu böyle küçük kalır.
- **Bir parçada tek sahip.** İki oyuncunun ordusu aynı parçada duramaz (muharebe Görev 05'te; şimdilik böyle bir durum oluşmaz).
- **Düz veri** — serileştirilebilir kalsın (§6.6 kuralı, Görev 03).
- **Kayıt sürümü 4'e çıkacak.** Durum yapısı değişti; eski kayıtlar reddedilsin.

### 8.3 Türetilmiş hesaplar

Bunlar saklanmaz, hesaplanır:

- Bir aktörün toplam birim sayısı
- Bir ildeki toplam birim sayısı (orta katman rozeti için)
- Bir parçadaki toplam birim sayısı (yakın katman rozeti için)
- Bir ilde bu tur kaç birim daha üretilebilir (Soru 2'nin cevabı A ise)

**Baki'nin kontrolü:** Bu adımda ekranda değişiklik olmayabilir. Testler geçiyor mu?

---

## 9. ADIM 4 — ÜRETİM EKRANI

Tasarım §4.2'deki ekranı kur:

```
Bütçe:  18 nüfus   /   14 ekonomi

Piyade   [3 nüfus / 1 ekonomi]   [−]  4  [+]
Topçu    [2 nüfus / 3 ekonomi]   [−]  1  [+]
Zırhlı   [1 nüfus / 6 ekonomi]   [−]  1  [+]
                                 ─────────────
Kalan:   4 nüfus / 4 ekonomi     [ ÜRET ]
```

**Kurallar:**

- `[+]` bastıkça bütçeden düşer, "Kalan" **anlık** güncellenir
- Bütçe yetmeyince o satırın `[+]` tuşu **pasifleşir** — hata mesajı yok. Tasarım belgesi bunu özellikle belirtiyor.
- `[−]` sıfırın altına inmez
- ÜRET basılınca birimler doğar, havuzlardan düşülür, ekran kapanır
- **Hiçbir harmanlama yok.** Oyuncu ne dizdiyse motor tam olarak onu üretir. Eski oran seçici sisteminin kalıntısı olmasın.
- Soru 2'nin cevabı A ise: sanayi üst sınırına ulaşınca `[+]` pasifleşir ve sebebi yazılır ("sanayi sınırı: 4/4")

**Nereden açılır:** Soru 1'in cevabına göre. A seçilirse kendi parçana dokununca panelde bir "ÜRET" düğmesi çıkar.

**Yatay ekranda yerleşim:** Üretim ekranı tam ekran değil, yan panel veya orta kutu olsun — oyuncu haritayı görmeye devam etsin. Nereye asker bastığını görmeden karar vermek zor.

**Boş bütçe durumu:** Hiçbir birime yetmiyorsa ekran "bütçe yetersiz" desin, boş liste göstermesin.

**Baki'nin kontrolü:** Telefonda birkaç birim satın alsın. Kalan doğru düşüyor mu, bütçe bitince `[+]` pasifleşiyor mu, ÜRET'ten sonra havuz doğru azalıyor mu?

---

## 10. ADIM 5 — ROZETLERİ ÇİZ

Adım 2'de belirlenen katman sınırlarını ve Adım 3'teki veriyi kullan.

- Üç katman geçişi **ani olmasın** — rozet aniden yok olup belirmesin, kısa bir solma yeterli
- Rozet dokunulabilir olsun: rozete dokunmak o parçayı seçmekle aynı sonucu vermeli
- Rozet parça seçimini engellememeli — üstüne bastığında parça seçilsin
- Performans: yalnızca ordusu olan parçalar için çizim yapılıyorsa maliyet düşük kalır. Kasma olursa önce çizilen rozet sayısını raporla, kod karmaşıklaştırmaya sonra git.

**Panele eklenecek:** Seçili parçadaki ordunun kompozisyonu — "3 piyade, 1 topçu, 1 zırhlı". Birim statları da gösterilebilir (Görev 05'te muharebe tahmini buraya gelecek).

**Baki'nin kontrolü:** Telefonda ordu bassın, rozet çıkıyor mu, doğru renkte mi, üç katman geçişi rahat mı?

---

## 11. ADIM 6 — GEÇEN TURUN SİPARİŞİNİ TEKRARLA

Baki 23 Temmuz'da bunu işaret etti: 40 ili olan oyuncunun her tur tek tek birim basması yorucu. Uzun maçlarda bu düğme zorunlu hale gelir.

**Nasıl işler:**

- Son üretim siparişi hatırlanır (hangi parçada, hangi karışım)
- "Geçen turun siparişini tekrarla" düğmesi aynı karışımı aynı yere basar
- **Bütçe yetmezse yetmediği kadarını basar** ve ne bastığını söyler ("2 piyade basıldı, 2'sine bütçe yetmedi")
- Parça artık senin değilse veya senaryo dışıysa atlanır, sebebi yazılır

**Kapsam sınırı:** Tek sipariş hatırlanır, geçmiş listesi tutulmaz. Şablon kaydetme/yükleme yok.

**Baki'nin kontrolü:** Bir tur sipariş verip sonraki turda tekrarla düğmesine bassın. Aynı şey mi basıldı, bütçe yetmediğinde ne diyor?

---

## 12. ADIM 7 — BELGELER VE TESTLER

### `docs/il-savasi-tasarim.md`

- §4.4 — Soru 3'ün cevabına göre yeniden yazılsın
- §5 madde 4 (sanayi) — Soru 2'nin cevabına göre netleşsin
- §7 — rozet katman sistemi tek paragraf halinde eklensin
- §13.1 — Expo düzeltmesi (Adım 0)
- Yeni bölüm veya §4.6 — üretimin nerede yapıldığı (Soru 1)

### Testler

- Birim maliyetleri `denge.js`'ten okunuyor, kod içine gömülü değil
- Satın alma bütçeyi doğru düşüyor; bütçe aşılamıyor
- Boş parça `ordular`'da kayıt tutmuyor
- Kayıt/yükleme: ordular korunuyor, sürüm 4, sürüm 1–3 reddediliyor
- İl toplamı ve parça toplamı doğru hesaplanıyor
- Sipariş tekrarı: bütçe yetmediğinde kısmi basıyor
- Soru 2 cevabı A ise: sanayi üst sınırı aşılamıyor
- Rozet eşiği testi (`haritaOlcusu.test.js`) yatay tutuşa göre güncellensin

### `veri/URETIM-NOTU.md`

Her adımda güncelle. Özellikle: dört sorunun cevapları ve gerekçeleri, yakınlaştırma katman sınırları ve nasıl ölçüldüğü, yatay tutuş kararının yerleşime etkisi, kayıt sürümünün 4'e çıkması.

---

## 13. ÇALIŞMA KURALLARI

**Dört soruyu cevaplamadan başlama.** Soru 1 ve 3 veri modelini belirliyor; yanlış varsayımla yazılan kod baştan yazılır.

**Adım adım git, her adımın sonunda dur.** Adım 2 ve Adım 6 kesin duraklardır (katman sınırları ve panel yönü Baki'nin kararı).

Her adım sonunda:

1. Ne yaptığını iki üç cümleyle özetle
2. Baki'nin tam olarak ne yapacağını söyle
3. Neyin doğru görünmesi gerektiğini söyle
4. Onay al, sonra devam et

**Kapsamı büyütme.** Hareket ve muharebe Görev 05.

**Uydurma.** Ölçemediğin bir değeri tahmin edip tabloya yazma.

**Denge sayıları `denge.js`'e.** Birim maliyetleri, sanayi çarpanı, katman sınırları, rozet boyutu — hepsi tek dosyada.

**Takıldığında.** İkinci başarısız denemeden sonra durumu anlat: ne denedin, ne oldu, hangi seçenekler var.

---

## 14. GÖREV BİTİŞ ÖLÇÜTÜ

**Kararlar**
- [ ] Dört soru Baki tarafından cevaplandı, `URETIM-NOTU.md`'ye yazıldı
- [ ] Belgedeki üç kalıntı düzeltildi (Ankara 4, Erzurum istisnası, Expo)

**Yatay tutuş**
- [ ] Uygulama yalnızca yatay açılıyor
- [ ] Harita tipi düğmeleri, tur çubuğu ve panel yatay ekrana uyarlandı
- [ ] Telefonda harita alanı yeterli, düğmeler rahat basılıyor

**Rozet katmanları**
- [ ] Gerçek yakınlaştırma aralığı raporlandı
- [ ] Ölçüm yatay tutuşa göre yeniden yapıldı
- [ ] `onizleme/rozet-katman-testi.html` çalışıyor
- [ ] Katman sınırları Baki tarafından onaylandı
- [ ] Boş parçada rozet yok, sahibinin renginde, 99+ kuralı çalışıyor
- [ ] Gelibolu ve eşik altı diğer parçalar için rozet konumu çözüldü

**Ordu ve üretim**
- [ ] Birim maliyetleri `denge.js`'te, §3.1 ile birebir aynı
- [ ] Üretim ekranı çalışıyor, bütçe anlık güncelleniyor, aşılamıyor
- [ ] Bütçe yetmeyince `[+]` pasifleşiyor
- [ ] Üretilen birimler haritada rozet olarak görünüyor
- [ ] Panelde ordu kompozisyonu görünüyor
- [ ] Sipariş tekrarı çalışıyor, kısmi basma doğru davranıyor

**Genel**
- [ ] Kayıt sürümü 4, eski kayıtlar anlaşılır mesajla reddediliyor
- [ ] `npm.cmd run kontrol` temiz, tüm testler geçiyor
- [ ] Telefonda yatay tutuşta test edildi
- [ ] `URETIM-NOTU.md` güncel

---

## 15. SONRAKİ GÖREV (bilgi amaçlı — bunu yapma)

**Görev 05 — Hareket ve muharebe.** Tasarım §3'ün tamamı: stat vektörü, iki etkinlik eğrisi, hasar havuzu, arazi çarpanı, şans bandı, moral ve bozgun, geri çekilme, yeniden toplanma.

§3.7'deki 15 satırlık doğrulama tablosu o görevin test verisi olacak — muharebe motoru o sonuçları birebir üretmeli. Bu görevde modele koyduğun birim statları oraya girdi olacak.

Ordu hareketi de o görevde: parça komşuluğu üzerinden, `parca-komsuluk.json`'daki 469 çift kuralı belirliyor.
