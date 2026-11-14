# GÖREV 20 — SEZGİ VE AKICILIK (ölçüt: Antiyoy ve Polytopia)

> Tarih: **2026-09-23** · Baki:
> *"Oyun şuan her şeyi kendisi açıklıyor ve bu benim gözüme karmaşık geliyor. Oyuna
> girince bazı şeyleri sezgilerle anlayarak ve deneyimleyerek öğrensem daha iyi; bir sürü
> açıklama karmaşıklığı arttırıyor. **Bu önemli bir kural.** Ayrıca grafiksel açıdan oyun
> hâlâ akıcı değil, bir Antiyoy bir Polytopia gibi değil — gerek yakınlaştırmalar gerek
> okunurluk. Bu iki oyunu temel almak lazım. Çok iş gerektirse de bunu yapmak istiyorum."*
>
> Kural CLAUDE.md §5/10'a yazıldı. Ön çalışma: `docs/DENETIM-2026-09-23.md`.

---

## 0. İKİ SORUN, TEK KÖK

İki şikâyet ayrı görünüyor ama aynı yerden çıkıyor: **harita konuşmadığı için oyun
konuşuyor.**

Harita neyin yapılabileceğini göstermiyor. Rozetler yakınlaşınca sönüyor, uzakta hiç
çizilmiyor. Bir birliğin yorgun olup olmadığı görünmüyor. Böyle olunca her bilgi bir
cümleye düşüyor: *"N birlik bu tur hakkını kullandı"*, *"Kaç birlik göndereceğini seç,
tahmini burada göreceksin"*, *"Onunla anlaşman var, saldırmak istiyorsan önce anlaşmayı
bozmalısın"*.

Polytopia ve Antiyoy'da bu cümlelerin hiçbiri yok, çünkü harita onları **gösteriyor**.

Sonuç: **akıcılık işi sezgi işinin ön şartı.** Harita her yakınlıkta net ve kesintisiz
olmadan, metni haritaya taşıyamayız.

---

## 1. REFERANSLAR NE YAPIYOR

| # | İlke | Polytopia | Antiyoy | Bizde bugün |
|---|---|---|---|---|
| **İ1** | Seçince yapılabilecekler **haritada** görünür | Birliğe dokununca gidilebilecek kareler mavi, saldırılabilecekler kırmızı | Gidilebilecek altıgenler vurgulanır | Önce panel açılıyor, SALDIR'a basınca vurgu geliyor |
| **İ2** | Eylem = **hedefe dokunmak** | İki dokunuş: birlik → hedef | İki dokunuş: birim → altıgen | **Beş dokunuş, üç ekran**: parça → panel SALDIR → hedef → kuvvet seçici GÖNDER → onay kutusu |
| **İ3** | Durum **görüntüyle** anlatılır | Hamlesi biten birlik soluklaşır | Hareket edebilen birim yerinde zıplar | Cümleyle: *"N birlik bu tur hakkını kullandı"* |
| **İ4** | Ekranda **az sayı** | Yıldız + gelir, birliğin canı | Para + gelir | İl paneli, savaş odası, tur raporu sayı ve cümle dolu |
| **İ5** | **Denemek serbest** | Sonuçlar kesin (zar yok), önceden bilinebilir | Tur bitene kadar her hamle geri alınır | Taşıma da üretim de geri alınamıyor |
| **İ6** | Harita **her karede** çiziliyor | Oyun motoru, ekran kartıyla | libGDX, *"akıcı animasyon ve iyi optimizasyon"* (kendi tanıtımı) | Önceden resme çevrilip büyütülüyor (bkz. §2.2) |
| **İ7** | Birlikler **haritanın parçası** | Yakınlaşınca birlik de büyüyor, hiçbir şey kaybolmuyor | Aynı | Rozetler ayrı katmanda: yakınlaşırken sönüyor, uzakta hiç yok |

**Neyi almıyoruz:** Polytopia'nın zarsız muharebesini. Bizde şans bilinçli bir karar
(Görev 12) ve kalıyor. İ5'in bizdeki karşılığı "savaş dışı hamleleri geri almak" olabilir
(Soru 4).

**Antiyoy'un lisansı:** kaynak kodu açık ama **ticari kullanım yasak**. Tasarımından
öğreniyoruz, kodundan tek satır almıyoruz.

---

## 2. BUGÜNKÜ DURUM (ölçüldü)

### 2.1 Metin yükü: `scripts/metin-olcum.js` → `veri/metin-olcum.md`

Oyuncunun görebileceği metin (arayüz yazıları, bildirimler, açıklamalar; yorum ve kod
hariç). Dosyalar üç kümeye ayrıldı; hedef yalnızca ilkinde:

| Küme | Adım 0'dan önce | Adım 0'dan sonra |
|---|---|---|
| **OYUN İÇİ** (oyuncunun istemeden, oynarken gördüğü) | 1.284 kelime · 45 uzun cümle | **1.260 · 43** |
| AÇILAN (diplomasi, araştırma, ayarlar, kurallar…) | 1.517 · 51 | 1.517 · 51 |
| MENÜ/KAYIT | 370 · 20 | 370 · 20 |

Uzun cümle = 8+ kelime. `veri/metin-olcum.md` §3, OYUN İÇİ kümenin uzun cümlelerini tek
tek listeliyor: bu, Adım 5–7'nin yapılacaklar listesi.

Ayrıca **tur raporu her tur kendiliğinden açılıyor** (Görev 15'ten beri). Statik sayım bunu
göremiyor ama oyuncunun istemeden okuduğu en büyük metin bloğu bu.

⚠ **Ölçüm, Görev 15'ten beri yanlış olan iki kuralı yakaladı** (Adım 0'da düzeltildi):
savaş odasındaki *"Emirler tur bitince çözülür; o zamana dek iptal edebilirsin"* notu ve
tur bitirme kutusundaki *"savaşlar yapılacak, alınan yerler senin olacak"* cümlesi. İkisi
de yeni oyuncuya olmayan bir kural öğretiyordu. Ders: kural değişince onu anlatan metin
sessizce yaşamaya devam ediyor; uzun cümle listesi her kural değişikliğinden sonra
okunmalı.

### 2.2 Harita: beş ödün (hepsi kodda gerekçesiyle yazılı)

Bugünkü harita `react-native-svg` ile ~270 vektör yoldan oluşuyor. Telefonu dondurmamak
için beş ödün verildi. O araç setinde her biri doğru karardı, ama Polytopia hissini tam da
bunlar bozuyor:

| # | Ödün | Yeri | Oyuncunun gördüğü |
|---|---|---|---|
| Ö1 | Yakınlaştırma sırasında harita **resme çevriliyor** | `Harita.js`, `tema.js HARITA_JEST_DOKUSU` | Parmak ekrandayken harita yumuşuyor, bırakınca "tık" diye keskinleşiyor. Dokunuşun ilk karesinde küçük bir takılma var |
| Ö2 | Netlik **2 kat** önden alınıyor, yakınlaştırma **7 kata** çıkıyor | `tema.js HARITA_NETLIK` | Çok yakında çizgiler bulanık |
| Ö3 | Yakınlaşırken rozetler **sönüyor** | `RozetKatmani.js` sönme eğrisi | Ordular kayboluyor, parmak kalkınca yeniden beliriyor |
| Ö4 | Parmak kalkınca rozetlerin **hepsi** yeniden yerleşiyor | `haritaSabitleme.js` | Bırakma anında küçük bir duraklama |
| Ö5 | En uzak görünümde **rozet yok** | `RozetKatmani.js` (`katman === 'uzak'`) | Türkiye'nin tamamına bakınca kimin nerede ordusu olduğu görünmüyor |

Ayrıca kaydırmada **süzülme yok**: parmak kalkınca harita olduğu yerde duruyor.
Polytopia ve Antiyoy'da harita hafifçe süzülerek durur.

### 2.3 Ölçüm tuzağı

Expo Go kodu **geliştirme kipinde** çalıştırıyor. Bu kip React'i belirgin biçimde
yavaşlatır. Ö4 gibi JavaScript'e dayanan takılmaların bir kısmı yayın sürümünde
kendiliğinden hafifleyebilir. Ö1, Ö2, Ö3 ve Ö5 ise mimariden geliyor ve hiçbir kipte
düzelmez. Adım 1 bu ayrımı ölçüyor.

---

## 3. AKICILIK ÇÖZÜMÜ: HARİTA SKIA TUVALİNE TAŞINIR

**Skia**, Chrome'un ve Android'in kendi çizim motoru. React Native'de
`@shopify/react-native-skia` olarak geliyor ve **Expo Go SDK 54'te hazır yüklü**
(sürüm 2.2.12). Development build gerekmiyor; bugünkü QR akışı aynen sürüyor.

### 3.1 Ne değişir

| Bugün | Skia ile |
|---|---|
| Harita bir kez resme çevrilip büyütülüyor | Harita **her karede** ekran kartıyla yeniden çiziliyor → her yakınlıkta keskin |
| Netlik ile bellek arasında ödün (`HARITA_NETLIK`) | Ödün yok. Ö1 ve Ö2 emekliye ayrılır |
| Rozetler ayrı bir React katmanında, her biri ayrı görünüm | Rozetler **aynı tuvalde**, her karede yerinde çiziliyor → sönme yok (Ö3), yeniden yerleşme yok (Ö4) |
| Uzak/orta/yakın eşiklerinde rozetler birden değişiyor | Yakınlığa göre **sürekli** geçiş. Uzakta il başına tek sayı, yakında parça başına kalkan ve kadro şeridi (Ö5 kapanır, Görev 17.2 buraya taşınır) |

### 3.2 Ne değişmez

- **Jest kodu.** Kaydırma ve yakınlaştırma bugün de paylaşılan değerlerle, arayüz iş
  parçacığında çalışıyor. Skia bu değerleri doğrudan okuyabiliyor, React'e hiç
  uğramadan. Jest mantığı aynen taşınır.
- **Dönüşüm tek kaynaktan.** Ekran ↔ harita hesabı `haritaDonusum.js`'te kalır ve testle
  kilitli. ⚠ CLAUDE.md §6'daki "viewBox + elle sığdırma" tuzağı Skia'da doğmaz, çünkü
  viewBox diye bir şey yok: tek bir dönüşüm matrisi var ve o da bu dosyadan geliyor.
- **Dokunma testi.** Bugünkü çokgen-içi testi olduğu gibi kalır.
- **Oyun motoru.** `src/oyun/` hiç değişmez. Bu iş tamamen ekran tarafında (CLAUDE.md §3).

### 3.3 Kamera

- **Süzülme:** parmak hızlı kalkınca harita hafifçe süzülüp durur. Sınırlar yine
  `kaydirmaSiniri`'ndan gelir.
- ~~**Çift dokunuş** ile o noktaya yakınlaşma.~~ **İPTAL:** Baki'nin Soru 1 cevabı ("aynı
  hedefe ikinci dokunuş = saldırı") ile çakışıyor; iki dokunuş iki anlam taşıyamaz.
- **Açılışta oyuncunun iline yakın başlama.** Polytopia oyunu başkentinin yanında açıyor.
  Bizde bütün Türkiye ekrandayken 181 parça küçük kalıyor.

### 3.4 Riskler ve karşılıkları

| Risk | Karşılık |
|---|---|
| 270 yolu her karede çizmek zayıf telefonu zorlar | Adım 2'de **önce prototip ve ölçüm**. Gerekirse sabit harita bir kez kaydedilip (`Picture`) her karede yalnızca yeniden oynatılır |
| Yazı tipleri Skia'da ayrı yükleniyor | Chakra Petch ve Black Ops One dosyaları zaten paketin içinde (`@expo-google-fonts`). Türkçe glifler prototipte sınanır |
| Sahne katmanı (savaş gösterisi) RN görünümleriyle yazılı | İlk aşamada aynı paylaşılan değerleri okuyarak üstte kalır (aynı anda az sayıda efekt var, maliyeti küçük). Sonra tuvale taşınabilir |
| Eski ve yeni harita arasında gidip gelmek gerekebilir | Geçiş bir geliştirici ayarıyla yapılır. Eski SVG yolu, yeni yol Baki'nin telefonunda ve tabletinde onaylanana kadar **silinmez** |

---

## 4. SEZGİ TASARIMI: METNİ HARİTAYA TAŞIMAK

### 4.1 Doğrudan hamle (İ1 + İ2)

```
Bugün:  parça → [panel] SALDIR → hedef → [savaş odası] kuvvet, GÖNDER → [onay] EVET
Öneri:  ordu → hedef → (ikinci dokunuş) hamle
```

1. **Ordusu olan kendi parçana dokun.** Panel açılmaz. Gidilebilecek yerler haritada
   belirir: kendi toprağın **pirinç halka**, düşman toprağı **kırmızı**.
2. **Hedefe dokun.** Hedefin üstünde **tahmin işareti** çıkar: renk ve biçimle üç kademe
   (ezer · kıl payı · kaybeder). Bugünkü *"Saldırı zaferle sonuçlanır"* cümlesinin yerini
   bu alır. Varsayılan kuvvet, hakkı olan bütün birlikler.
3. **Aynı hedefe ikinci kez dokun:** hamle yapılır. Başka yere dokunmak vazgeçmek demek.
4. Kuvveti ayarlamak isteyen oyuncu hedefe **basılı tutar**, küçük bir sayı çarkı açılır.
   Yeni oyuncu bunu hiç bilmeden de oynayabilir.

Kendi parçanın ayrıntısı (üretim, araştırma, toplanma) ayrı bir hareketle açılır: aynı
parçaya ikinci dokunuş ya da köşedeki bir simge (Soru 7).

### 4.2 Durum görüntüyle (İ3)

| Durum | Bugün | Öneri |
|---|---|---|
| Hamle hakkı olan ordu | Görünmüyor | Kalkan parlak, hafif "nefes alır" (tek canlandırma, bütün tuval için) |
| Hakkı biten ordu | Cümle | Kalkan soluk |
| Yaralı birlik | Cümle | Kalkanın kenarında kırmızı çentik |
| Komutan | Pirinç kontur | Aynen kalır |

### 4.3 Yasaklar metinle değil işaretle

Barış, ittifak ya da düello yüzünden saldırılamayan hedef zaten işaretlenmez. Oyuncu yine
de dokunursa hedefin üstünde **el sıkışma / mühür simgesi** sallanır ve telefon kısa
titrer. Cümle çıkmaz. Diplomasi ekranı nedenini zaten gösteriyor.

### 4.4 Tur raporu

Her tur **kendiliğinden açılmaz**. Olaylar zaten haritada oynuyor (Görev 08 sahnesi).
Rapor tur çubuğundaki bir simgeyle isteğe bağlı açılır. Oyunu değiştiren olaylar (senin
toprağın düştü, sana savaş ilan edildi) haritada kısa bir işaretle gösterilir (Soru 3).

### 4.5 İl paneli ve savaş odası

Cümleler kalkar. Yerlerine simge + sayı gelir. Ayrıntı isteyen oyuncu dokunarak açar.
Savaş odası (kuvvet seçici) 4.1'den sonra yalnızca "basılı tut" yolunda yaşar.

### 4.6 İlk maç (eğitim yerine)

Metinli eğitim yok. İlk maç küçük bir bölgede (örn. Karadeniz) açılır ve yalnızca
**parıldayan ipuçları** gösterir: önce ordun parlar, dokununca hedef parlar, dokununca
TURU BİTİR parlar. En fazla birkaç kelime. Oyuncu kuralı yaparak öğrenir.

### 4.7 Metin bütçesi

`scripts/metin-olcum.js` her adımda yeniden koşulur. **Hedef: oyun sırasında kendiliğinden
açılan uzun cümle sayısı sıfır.** Menüler, Nasıl Oynanır ve kayıt hataları gibi oyuncunun
kendi açtığı yerler bu hedefin dışında. Oyuncunun istemeden gördüğü her uzun cümle ya bir
görsele dönüşür ya da kalkar.

Bütçe tutturulunca betik `npm run kontrol`'ün yedinci bölümü olabilir. Kontrast
denetiminin kalıbı bu: gözle karar verilir, okunurluk ölçülür.

---

## 5. ADIMLAR

CLAUDE.md §7: her adım ayrı, Baki doğrulamadan sonrakine geçilmez.

| Adım | İş | Dokunulan | Kapı |
|---|---|---|---|
| **0** ✅ | Kural CLAUDE.md'ye yazıldı · bağlantılı temizlik (geliştirme damgası, kayıt bildirimindeki KB, rütbe eki, araştırma ekranındaki geliştirici cümlesi) · **iki yanlış kural metni** (savaş odası notu + `emirIpucu` ayarı, tur bitirme cümlesi) · metin ölçümü tabanı | CLAUDE.md, App, AnaMenu, TurCubugu, BasarimEkrani, ArastirmaEkrani, HareketEkrani, oyunKancasi, oyun/ayarlar, denge (yorum), 1 yeni betik | Baki telefonda |
| **1** ✅ | **Teşhis:** Baki geliştirme kipi kapalıyken oynadı → *"çok fark göremedim"*: sorun mimaride | Hiçbir dosya | ✅ |
| **2** ✅ | **Skia haritası** (§9): kademeli geometri, her karede Skia çizimi, ayardan eski/yeni geçişi, hata kalkanı, kare sayacı | Yeni: `HaritaSkia`, `HaritaSecici`, `KareSayaci`, `haritaCizim`, `haritaSeviye`, `rozetListesi`, `rozetSekli`, 3 betik, 1 veri | **Karar kapısı:** Baki iki haritayı telefonda ve tablette dener |
| **3** ✅ | Rozetler tuvalde ve harita ile büyüyor, uzakta da var, il→parça geçişi zamanlı. Kadro şeridi (§10.3) | `haritaCizim` | Baki telefonda |
| **3b** ✅ | **Akıcılık:** Baki "30 fps gibi" dedi → ekran kartıyla ölçüldü, her şey resim olarak kaydediliyor, çizgi şerit, rozet resim sayfası; 7–23 kat hızlı (§10) | `haritaCizim`, `HaritaSkia`, ölçüm sayfası | Baki telefonda (kare sayacı) |
| **4** ✅ | Süzülme ✅ · çift dokunuşla yakınlaşma **İPTAL** (Soru 1'in "ikinci dokunuş = saldırı" kararıyla çakışıyor) · açılışta ile yakın başlama ✅ (§16) | `HaritaSkia` | Baki telefonda |
| **5** ✅ | Doğrudan hamle akışı (§4.1, §13.4): ordu → hedef → ikinci dokunuş; iki renk hedef, tahmin renkli seçili hedef, alttaki hamle çubuğu, basılı tutunca savaş odası, saldırı onayı kalktı | App, HaritaSkia, Harita, haritaCizim, HareketEkrani, yeni `HamleCubugu` | Baki telefonda |
| **6** | Durum görselleri ve yasak işaretleri (§4.2, §4.3) | Rozet, Harita, titreşim | Baki telefonda |
| **7** | Tur raporu ve il paneli sadeleşmesi (§4.4, §4.5) | TurRaporu, IlPaneli, App | Soru 3 |
| **8** ✅ | İlk maç / EĞİTİM: metinsiz ipuçları (§4.6, §12.3/3, §16) | `oyun/egitim.js`, `Ipucu`, `EgitimSeridi` | Baki telefonda |
| **9** ✅ | Eski SVG yolu emekliye ayrıldı, metin ölçümü tekrarlandı (§16). Rapor: Adım 6–7 kapanınca | Harita, belgeler | Rapor |

**Neden bu sıra:** 5–8'in hepsi haritanın **göstermesine** dayanıyor (hedef halkası, tahmin
işareti, nefes alan kalkan, parıldayan ipucu). Bunları bugünkü sönen rozet katmanına
kurmak iki kez iş yapmak olur. Önce tuval (2–4), sonra onun üstünde sezgi (5–8).

---

## 6. BAKİ'NİN CEVAPLARI (2026-09-23)

| # | Soru | Cevap | Ne demek |
|---|---|---|---|
| 1 | Saldırı onayı → ikinci dokunuş | **Evet** | Onay kutusu kalkar; aynı hedefe ikinci dokunuş saldırıdır |
| 2 | Varsayılan kuvvet = bütün birlikler | **Hayır** | Kuvvet seçimi kalır; Adım 5'te haritanın üstünde küçük bir sayı seçiciye taşınır |
| 3 | Tur raporu isteğe bağlı | **Evet** | Her tur kendiliğinden açılmaz, simgeyle açılır |
| 4 | Savaş dışı hamleleri geri al | **Evet** | Taşıma, üretim, araştırma tur bitene kadar geri alınabilir |
| 5 | Rozet harita ile büyüsün mü | **Büyüsün** | Polytopia gibi: yakında büyük, uzakta küçük (okunamayacak kadar küçülmesin diye alt sınırlı) |
| 6 | Tur bitirme onayı | **Kalsın** | |
| 7 | Parça ayrıntı paneli | **Köşedeki simge** | |

**Adım 1 sonucu:** Baki geliştirme kipi kapalıyken (`--no-dev --minify`) haritada *"çok bir
fark göremedi"*. Yani takılma JavaScript kipinden değil, haritanın yapısından geliyor
(§2.3'ün beklediği gibi). Skia'ya geçiş kararı ölçümle doğrulandı.

Soruların ilk hâli aşağıda tarih kaydı olarak duruyor.

### 6a. Sorulan sorular (ilk hâli)

1. **Saldırı onayı:** onay kutusu kalkıp yerine "aynı hedefe ikinci dokunuş" gelsin mi?
   (Görev 15'te saldırı geri alınamaz olduğu için kutuyu koymuştuk. İkinci dokunuş aynı
   korumayı metinsiz sağlıyor.)
2. **Varsayılan kuvvet:** hedefe dokununca hakkı olan **bütün** birlikler mi gitsin?
   Ayarlamak isteyen basılı tutar.
3. **Tur raporu** her tur açılmasın, tur çubuğundaki bir simgeyle mi açılsın?
4. **Geri al:** savaş **dışı** hamleler (taşıma, üretim, araştırma) tur bitene kadar
   geri alınabilsin mi? Antiyoy'un yaptığı bu ve "deneyerek öğrenme"nin en güçlü aracı.
   Savaşlar geri alınamaz, çünkü sonucu görmüş olursun.
5. **Rozet boyutu:** harita ile birlikte mi büyüsün (Polytopia: yakında büyük, uzakta
   küçük), yoksa bugünkü gibi ekranda sabit boyutta mı kalsın?
6. **Tur bitirme onayı** (Görev 04'te sen istemiştin) kalsın mı? Alternatif: düğmeye
   kısa bir basılı tutma.
7. Kendi parçanın **ayrıntı paneli** (üretim, araştırma, toplanma) nasıl açılsın:
   aynı parçaya ikinci dokunuş mu, köşede bir simge mi?

---

## 7. BU GÖREVİN DENETİM LİSTESİYLE İLİŞKİSİ

`DENETIM-2026-09-23.md`'deki şu maddeler bu göreve bağlandı:

| Denetim maddesi | Bu görevde |
|---|---|
| Liste 2 / 5: geliştirme damgası görünüyor | ✅ Adım 0 |
| Liste 2 / 6: rütbe eki hatası | ✅ Adım 0 |
| Liste 2 / 9: kayıt bildiriminde KB | ✅ Adım 0 |
| (yeni) Görev 15'ten kalma iki yanlış kural metni | ✅ Adım 0 (ölçümle bulundu) |
| Liste 1 / 10 + Liste 3 / 10: kadro şeridi | Adım 3 |
| Liste 1 / 13 + Liste 3 / 7: etkileşimli eğitim | Adım 8 (metinsiz hâliyle) |
| Liste 3 / 12: renk körü seçeneği | Adım 6'da hedef ve durum işaretleri **biçimle** de ayrılır, yalnızca renkle değil |
| Liste 3 / 2, 3, 5: savaş tarihi · manşet · "neden kaybettin" satırı | ⚠ **Yeni kurala göre yeniden düşünülmeli.** Üçü de metin ağırlıklı öneriydi. Karşılıkları görsel olmalı (örn. manşet yerine haritada lider mührüyle kısa bir işaret) |

---

## 8. KAYNAKLAR

- Polytopia'da seçim vurgusu (mavi hareket, kırmızı hedef): https://github.com/maximtsai/polyestertopia · https://polytopia.fandom.com/wiki/Combat
- Polytopia'nın sıkıştırılmış tasarımı: https://www.pixelatedplaygrounds.com/sidequests/game-design-perspective-the-battle-of-polytopia
- Antiyoy (açık kaynak, ticari kullanım yasak; "akıcı animasyon, iyi optimizasyon", 10 kişilik sıcak koltuk): https://github.com/yiotro/Antiyoy/blob/master/README.md
- Antiyoy'da tur içi geri alma ve "oynayarak öğrenme": https://indie-hive.com/antiyoy-review/ · https://pretalx.com/pyconde-pydata-2026/talk/MJTQEJ/
- Skia'nın Expo Go'da hazır gelmesi: https://docs.expo.dev/versions/v54.0.0/sdk/skia/ · https://github.com/expo/expo/blob/sdk-54/packages/expo/bundledNativeModules.json

---

## 9. ADIM 2–3 SONUÇLARI: SKIA HARİTASI (2026-09-23)

### 9.1 Ne yapıldı

| Parça | Dosya | Ne yapıyor |
|---|---|---|
| Kademeli geometri | `scripts/harita-seviye-uret.js` → `veri/harita-seviyeleri.json` | 4 ayrıntı düzeyi (tolerans 0.5 · 0.2 · 0.1 · 0.05). Her sınır bir HAT olarak bir kez yazılı, parçalar hatlardan dikiliyor: iki komşu arasında boşluk yapı gereği imkânsız. Üretici 181 parçanın her seviyede klasik yolla birebir aynı dikildiğini kendisi denetliyor |
| Ortak sadeleştirici | `scripts/topoloji.js` | Menü geometrisiyle aynı algoritma (taşındı; menü çıktısı birebir aynı kaldı) |
| Okuma | `src/haritaSeviye.js` | Seviye seçimi (yarım piksel kuralı), dolgu dikişi, çizgi grupları |
| Çizim çekirdeği | `src/haritaCizim.js` | Telefonun her karesini çizen `sahneyiCiz` + hazırlık. Skia'yı içe aktarmıyor, bilgisayarda da aynen çalışıyor |
| Bileşen | `src/bilesenler/HaritaSkia.js` | Jestler (eskisiyle aynı + süzülme), kamera, dokunma, savaş gösterisi katmanı |
| Güvence | `HaritaSecici.js` · `oyun/ayarlar.js haritaMotoru` · `GenelAyarlar` | Ana menü → ayarlar → HARİTA: YENİ / ESKİ. Yeni harita çizilirken hata verirse eskisine kendiliğinden döner |
| Ölçer | `KareSayaci.js` | Yalnızca geliştirmede, sol altta: saniyedeki kare ve son yarım saniyenin en uzun karesi |
| Bilgisayar önizlemesi | `scripts/harita-skia-onizleme.js` → `veri/harita-skia-olcum.md` | Beş yakınlıkta görüntü + sadeleşme denetimi (seçilen seviye ile en ince seviye piksel piksel) |
| Rozet listeleri | `src/rozetListesi.js` | Kancadan çıktı ki önizleme oyunun listesinin aynısını kursun |
| Rozet şekli | `src/rozetSekli.js` | Eski ve yeni rozet aynı kalkanı çiziyor |

Kalite kapısı altı bölümde temiz, **811 test** (15 yeni). Paket `expo export` ile derlendi
(1.492 modül); iş parçacığı dönüşümü kare fonksiyonlarının 7'sinde de doğrulandı.

### 9.2 Ölçüm (bilgisayar, `veri/harita-skia-olcum.md`)

| Yakınlık | Seviye | Nokta | Sadeleşmenin göze etkisi |
|---|---|---|---|
| 0.9× (bütün Türkiye) | 0.5 | 10.792 | piksellerin %0.57'si (kenar yumuşatma) |
| 1.6× | 0.2 | 22.850 | %0.23 |
| 2.5× | 0.2 | 22.850 | %0.26 |
| 4× | 0.1 | 37.577 | %0.14 |
| 7× | 0.05 | 49.068 | %0 |

Eski harita her karede ~210.000 noktalık iş yapıyordu. Uzak görünümde kare, en ince
geometriyle çizilene göre 1.8–4 kat hızlı (işlemcide; telefonda çizimi ekran kartı yaptığı
için mutlak süre farklı, **asıl ölçüm telefondaki kare sayacı**).

### 9.3 Önizlemenin yakaladığı iki tasarım hatası (düzeltildi)

1. **Yakınlığa bağlı rozet karışımı dağınıktı.** 2.3×–2.7× arasında il ve parça rozetleri
   yarı saydam üst üste kalıyordu; oyuncu o bantta durursa ekran karışık kalırdı. Geçiş artık
   eşikte ZAMANLA oluyor (180 ms, `DENGE.ROZET.DUNYA_GECIS_SURE`), geri dönüş histerezisle.
2. **Çizgiler yakında çok kalındı.** Eski haritada da öyleydi: çizgi harita ile aynı oranda
   kalınlaşıyor, 7×'te il sınırı 9, seçim çizgisi 15 piksele çıkıyordu. Artık kalınlık
   karekök oranında büyüyor (`tema.js CIZGI_BUYUME`): 1×'te eskisiyle aynı, 7×'te yarıdan ince.
   Yan kazanç: kalın çizgi pahalıymış, yakın görünümlerde kare süresi 45–75 ms'den 19–30 ms'ye
   indi (işlemci).

### 9.4 Baki'nin telefonda bakacağı şeyler

- Yakınlaştırırken rozetler **sönmüyor**, harita **bulanıklaşmıyor**, parmak kalkınca "tık"
  diye keskinleşme yok.
- Bütün Türkiye'ye bakınca il rozetleri görünüyor; yakınlaştıkça büyüyor, 2.7×'te parça
  rozetlerine yumuşakça geçiyor.
- Hızlı kaydırıp bırakınca harita hafifçe süzülüyor; dokununca duruyor.
- Sol alttaki sayaç: yakınlaştırırken kaç kare/sn? (60'a yakın iyi, 45 altı takılma)
- Ayarlar → HARİTA → ESKİ ile aynı yere bakıp fark.
- Tablette de aynısı.

### 9.5 Bilinen sınırlar ve açık sorular

- ~~**Kadro şeridi (Görev 17.2) — SORU:** rakiplerin ordu dağılımı da görünsün mü?~~
  **CEVAP (Baki, 2026-09-23): "Gözüksün, casus raporunu boşver."** Yapıldı — §10.3.
- Açılışta oyuncunun iline yakın başlama (Adım 4) henüz yok.
- Savaş gösterisi efektleri (sarsıntı halkası, uçan sayı) hâlâ eski sabit boyutta; rozet
  artık büyüdüğü için yakında halka rozetten küçük kalabilir. Efektler Skia'ya taşınınca
  düzelecek.
- İl seçimi ekranı ve ana menü haritası kendi (menü) geometrisiyle çiziliyor; bu adımın
  dışında.

---

## 10. ADIM 3b: AKICILIK + KADRO ŞERİDİ (2026-09-23)

### 10.1 Baki'nin telefondaki gözlemi (Adım 2–3'ün doğrulaması)

*"Bu harita çok akıcı değil, hareket ederken 30 fps gibi."* Rozetler kaybolmuyor ✓, uzakta
ordular görünüyor ✓, eskisinden iyi olduğu kesin ✓ — ama sayaç **40–60 kare/sn** (arada 90:
ekran 90 Hz). Tablet denemesi yapılamıyor.

### 10.2 Teşhis ve çözüm (ölçüm: `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md`)

İşlemcideki önizleme bunu göremezdi. Yeni bir ölçüm sayfası oyunun çizim kodunu tarayıcıda
**ekran kartıyla** ve telefonun yüzey ayarlarıyla çalıştırıyor. Bulgu:

- Asıl bedel JavaScript değil, Skia'nın çizim yolu. react-native-skia'nın Android yüzeyinde
  **çoklu örnekleme ve şablon tamponu yok**; kenarı yumuşatılmış karmaşık bir şekli Skia her
  karede işlemcide maske olarak çizip yüklüyor. Sınır çizgileri (31 ms) ve rozet kalkanları
  (6 ms) tam olarak bu türdendi.
- Çözüm Skia'ya yalnızca ekran kartının hızlı yaptığı işi vermek:
  - **dolgu yumuşatmasız** (üçgenleri bir kez hesaplanıp saklanıyor; kenarı çizginin altında),
  - **sınır çizgisi hazır üçgen şeridi**, kenar yumuşatması küçük bir ekran kartı
    programında (kalınlık o programın sayısı, geometri seviye başına bir kez),
  - **rozet resim sayfasından** (kalkan, kontur, rakam bir kez çiziliyor; bir katman tek çağrı),
  - **her şey resim olarak kaydediliyor**, karede yalnızca kamerayla oynatılıyor: karede
    ≤ 16 çağrı, rozet sayısından bağımsız (test).
- Sonuç: ortanca kare 22–74 ms → **3.0–6.6 ms (7–23 kat)**. JavaScript tarafı 2 ms → 0.1 ms.
- Rozet artık tam anlamıyla haritanın parçası: uçlardaki boy sınırı (16/60 px) kalktı; il
  rozeti en uzakta 17 px, parça rozeti en yakında 67 px.
- Önizleme bir hata daha yakaladı: seçim vurgusunun şeridi bütün yakınlıklara yetecek
  genişlikte kurulunca kısa parçalarda katlanıp çizgiyi diken diken yapıyordu → vurgu da
  seviye başına kuruluyor, keskin köşelere yuvarlak düğüm konuyor. Eski çizimle yan yana
  karşılaştırıldı: artık aynı.
- Maç başı: ağır kaynak (yollar, çizgi noktaları) ve şeritler maçlar arası önbellekte.

### 10.3 Kadro şeridi (Görev 17.2 — Baki: "gözüksün, casus raporunu boşver")

4× yakınlıktan itibaren her parça kalkanının altında koyu bir şerit: piyade · topçu · zırhlı
figürü ve sayısı; boş tür yok; rakiplerde de var. Ayrı bir katman, kendi zamanlı geçişiyle.
Figürler `src/birimSekli.js`'e taşındı (araştırma ekranı ve savaş gösterisi aynı dosyadan
okuyor). Ölçüm (`scripts/kadro-serit-olcum.js` → `veri/kadro-serit-olcum.md`):

- 4×'te sayının büyük harfi 8.7 dp, figür kutusu 12 dp (ölçüt ≥ 7 dp).
- Çakışma gerçek maçta 1 yerde (Hatay/Osmaniye şeridi komşu kalkana değiyor); her parçada üç
  tür iki haneli sayıyla (en kötü) 21 rozet.
- Karedeki bedeli ~0.1 ms. Yeni çizim türleri ilk kez görününce ekran kartı programını bir
  kez hazırlıyor (tek seferlik kısa gecikme).
- ⚠ Casus raporu ödülü (`para/odul.js`) artık haritada bedava görünen bilgiyi satıyor —
  Baki'nin bilinçli kararı; ödülün yeniden tasarımı ileride.

### 10.4 Baki'nin telefonda bakacağı şeyler

- Sol alttaki sayaç kaydırırken ve yakınlaştırırken kaç? (Telefon 90 Hz: hedef 90'a yakın.)
- Sınır çizgileri eskisi gibi mi (kalınlık, yumuşaklık), seçili ilin çizgisi pürüzsüz mü?
- 4× yakınlıkta kalkanların altında figür şeridi çıkıyor mu, figürler ayırt ediliyor mu
  (özellikle piyade miğferi ile zırhlının tareti)?
- Maç açılırken ilk sefer eskisinden uzun mu sürüyor?

---

## 11. DİPLOMASİ EKRANI — TEŞHİS (Baki, 2026-09-23: "çok fazla karmaşık")

Kod okundu (`src/bilesenler/DiplomasiEkrani.js`, 962 satır). Ekran bugün bir OKUMA ekranı:

| Katman | Bugün ekranda | Oyuncunun okuması gereken |
|---|---|---|
| Üst çubuk | 3 sekme (MASA · ÜLKE · GÜÇ) + "anlaşma 2/3 · savaş 1" + ihanet cümlesi | 3 kavram, 2 sayaç |
| Liste | 3 süzgeç (HEPSİ · KOMŞU · BÖLGE) + her devlet: ad · durum kelimesi · karakter | süzgeç kavramı |
| Devlet dosyası | ad · lider · "TARAFSIZ · Temkinli · senden belirgin büyük" · tutum (KABULE AÇIK / SICAK BAKMIYOR / ŞU AN MASAYA OTURULAMAZ) + tutum cümlesi · gerekçe cümlesi · **6–8 satırlık tablo** (NASIL TANIDIN, BÜYÜKLÜK, ORTAK DÜŞMAN, CEPHESİ, MÜTTEFİKLERİ, SAVAŞIN YAŞI, BOZMANIN BEDELİ, SAVAŞ İLANI) · cevap cümlesi · 1–2 düğme | ~3 cümle + 8 satır, her devlet için |
| ÜLKE | ittifak blokları listesi + savaş hatları listesi | liste |
| GÜÇ | 81 satırlık tablo (bölge · ordu · gelir) | tablo |

Her parça tek tek haklı gerekçeyle eklendi (Baki'nin 2026-08-01 "direkt anlaşma yapa
basıyon, reddediyor; olmamış" itirazı) — ama toplamı §5/10'un tam tersi: karar bir tabloyu
okumaya bağlı. Polytopia'da diplomasi: kabilenin portresi + ilişki simgesi + 2–3 simgeli
düğme; neden kabul/ret ettiği yüz ifadesinden ve tek sayıdan okunur.

Öneri (kart taslağı) ve üç soru Baki'ye sunuldu; cevaplar ve uygulama §12'de.

---

## 12. BAKİ'NİN İKİNCİ TUR İSTEKLERİ VE YAPILANLAR (2026-09-23)

### 12.1 Cevaplar (diplomasi) ve uygulama

| # | Soru | Cevap | Yapılan |
|---|---|---|---|
| 1 | ÜLKE ve GÜÇ sekmeleri | *"Ülke kalksın, güç dursun; gücün hesaplamasında sahadaki aktif askeri güç, ekonomi ve bölge sayıları etkili olsun; İstanbul 1., Ankara 2. olacak şekilde formülünü tasarla"* | ÜLKE kalktı. Güç = Türkiye'deki gücün yüzde kaçı: `100 × (0.35 askeri pay + 0.35 gelir payı + 0.30 bölge payı)`; askeri güç = sağlam birimlerin savaş değeri (vuruş × dayanıklılık, araştırma dahil). Ölçüm ve gerekçe `DENGE.GUC`; `testler/guc.test.js` İstanbul 1 · Ankara 2'yi kilitliyor |
| 2 | "Neden kabul etmiyor" | **a** — yalnızca simge | Kart: gülen yüz (kabul eder) · düz yüz (sıcak bakmıyor) · kilit (masa kapalı). Tutum cümlesi, gerekçe cümlesi ve 8 satırlık tablo kalktı |
| 3 | Haritadan açılsın mı | **Evet** | Başka bir devletin iline uzun basınca diplomasi o devletin kartı açık ve en üstte gelir |

Diplomasi ekranı artık kartlar (`DiplomasiEkrani.js`): sahibinin renginde kare, ilişki
simgesi (kılıç / el sıkışma / zarf), toprak çubuğu (çentik = senin toprağın), tutum yüzü,
ortak düşmanlar renkli nokta, cephe sayısı. Karta dokununca simgeli düğmeler (ANLAŞ ·
ATEŞKES · BOZ · SAVAŞ · KABUL · RET). Süzgeçler kalktı: sıra önce teklif, savaş, müttefik,
komşu. GÜÇ: sıran büyük sayı, her ilde en güçlüye göre çubuk + kılıç/sikke/il simgeli üç
sayı. Metin ölçümü: AÇILAN küme 1.517 → **1.257 kelime**, uzun cümle 51 → 43.

### 12.2 Yeni istekler

| İstek | Durum |
|---|---|
| Ana menüye dönüş kutusunda VAZGEÇ dışarı taşıyor | **Düzeltildi.** Ölçüldü: üç düğme 283 px, telefondaki kutunun içi 248. Asıl eylem üstte tam genişlik, VAZGEÇ + ÇIK altta yarı yarıya (`Onay.js`) |
| Araştırmalar Polytopia gibi ağaç olsun | **Ekran yapıldı** (mekanik değişmedi): tek ekran, üç birlik kökü, dört dal, kademe düğümleri; dokununca etki sayıyla + ARAŞTIR. **Soru:** özel yetenek ağacın ucu olsun mu (§12.3) |
| Komutan ekranı kötü | Teşhis + öneri (§12.3), cevap bekliyor |
| Etkileşimli eğitim | Tasarım + sıra önerisi (§12.3), cevap bekliyor |
| Genel sadelik kontrolü | §12.4 |
| Uygulanabilir fikirler | §12.5 |

### 12.3 Sorular

1. **Araştırma — özel yetenek ağacın ucu mu?** Polytopia'da uç teknolojiler önce kökü
   ister. Öneri: seferberlik, baraj, palet, yarma ancak o birliğin bir dalı 2. kademeye
   çıkınca açılsın. Yan faydası: "özel dal 12 puan, çok ucuz; ilk karar hep aynı" açık
   kararını (Görev 13) da kapatır. Zekânın araştırma seçimi aynı kurala uyacak.
2. **Komutan ekranı.** Bugün bir form: dört yetenek cümleyle, kademe sayıyla, en altta
   ordular ADLARIYLA bir liste — komutanı nereye koyduğunu haritada göremiyorsun ve listeye
   dokunmak onu anında atıyor. Öneri: atama HARİTADAN (kendi orduna dokun → köşedeki
   komutan simgesi → "buraya"); ekran yalnızca yetenek kartları (simge + tek sayı:
   "+2 moral", "%30") ve üç yıldızlı kademe; kilitli kademe kilit + mühür çubuğu.
3. **Eğitim.** Öneri: önce doğrudan hamle (Adım 5: ordu → hedef → ikinci dokunuş), SONRA
   eğitim. Bugünkü beş dokunuşluk saldırıyı öğreten bir eğitim, Adım 5'le birlikte
   çöpe giderdi. Eğitim: ana menüde EĞİTİM → küçük bir Marmara haritası (sen Bursa, iki
   rakip, sabit tohum), altı adım, her adımda yalnızca parlayan hedef ve en çok iki kelime:
   ordunu seç → hedefe dokun → saldır → üret → turu bitir → ilk fetih.

### 12.4 Genel kontrol: oyun bugün okumadan anlaşılıyor mu?

**Henüz hayır.** Harita artık metinsiz konuşuyor (her yakınlıkta ordular, kadro şeridi,
güç), diplomasi ve araştırma simgeye döndü. Ama oyunun OYNARKEN en çok kullanılan yerleri
hâlâ cümleyle anlatıyor:

| Engel | Bugün | Çözüm (adım) |
|---|---|---|
| Saldırmak | 5 dokunuş, 3 ekran: parça → panel SALDIR → hedef → savaş odası GÖNDER → onay | Doğrudan hamle (Adım 5) |
| Savaş odası | 170 kelime, 6 uzun cümle; tahmin cümleyle ("Saldırı zaferle sonuçlanır") | Tahmin işareti: renk + biçim (Adım 5) |
| Ordunun durumu | Hamle hakkı, yorgunluk görünmüyor; bildirim cümlesi | Nefes alan / soluk kalkan (Adım 6) |
| Yasak hamle | Ret cümlesi (`hareket.js` 115 kelime, 7 uzun; `diplomasi.js` 121, 5 uzun) | Sallanan simge + titreşim (Adım 6) |
| Tur raporu | Her tur kendiliğinden açılıyor (239 kelime) | Köşe simgesiyle isteğe bağlı (Adım 7) |
| Komutan ekranı | 108 kelime, 5 uzun cümle, liste | §12.3 / 2 |
| İlk maç | Kurallar sayfası (332 kelime) | Eğitim (§12.3 / 3) |

OYUN İÇİ ölçüm: 1.261 kelime, 43 uzun cümle (hedef 0).

### 12.5 Önceki listelerden uygulanabilir fikirler (`DENETIM-2026-09-23.md`)

Hâlâ açık olup hemen yapılabilecekler, önem sırasıyla:
1. **Otomatik kayıt** (⛔) — tur sonunda ve uygulama arka plana geçince. Telefon oyunu
   kapatırsa bugün son kayıttan sonrası gidiyor.
2. **Android geri tuşu** (⛔) — açık perdeyi kapatsın, haritadayken çıkışı sorsun.
3. **Tablet yön kilidi** (⛔) — Android 16 tabletlerde kilidi yok sayıyor; oyunun kendini
   "oyun" diye tanıtması gerek (tek satır ayar, gerçek kurulum dosyasında denenir).
4. **%50 Hâkimiyet'te rakip hedefe ulaşınca oyun bitmiyor** (⚠ hata).
5. **Teslim olma / zaferi ilan et** — kazanılmış maçı 181/181'e kadar sürüklememek.
6. **"İlini tut" izleme modu** — 81 bot savaşır, sen bir ili tutarsın.
7. **Renk körü seçeneği** — kendi toprağın için desen, müttefik/düşman için simge.
8. **Geri bildirim düğmesi** — ayarlarda e-posta satırı (12 kişilik test için).

---

## 13. ÜÇÜNCÜ TUR (2026-09-24)

Baki §12.3'ün üç sorusuna cevap verdi, diplomasi kartlarını telefonda gördü (*"sığıyor"*) ve
*"uygun gördüğün değişiklikleri uygulamakla devam et"* dedi.

### 13.1 Cevaplar

| # | Soru | Cevap | Yapılan |
|---|---|---|---|
| 1 | Özel yetenek ağacın ucu olsun mu (Sv.2 önkoşulu) | **Evet** | `DENGE.ARASTIRMA.OZEL_ONKOSUL = 2` · `arastirma.js ozelAcikMi`; `dalDurumu` artık `kilitli` söylüyor, `seviyeAtla` `kod: 'kilit'` veriyor. Kayıt biçimi aynı: eski kayıtta önkoşulsuz alınmış yetenek açık kalır. Zekâ özel dal seçmiyor, rakibin gücü değişmedi. Ağaçta yetenek dalların ALTINDA kilitli düğüm; kapı açılınca uca inen yol pirinçle yanıyor; kilitli düğüme dokununca kilit + "2" düğümü. 4 yeni test |
| 2 | Komutan: atama haritadan + kart ekranı | **Olsun** | Bölge panelinde ordunun başlığında komutan simgesi (üç hâl: burada · buraya geç · kilitli + kalan tur). Komutan ekranı: dört simgeli yetenek kartı, kartta tek sayı, üç yıldızlı kademe (kilitli yıldız: kilit + kalan mühür puanı), Silah Ustası'nda birlik simgeleri (boşa giden birlikte çarpı), sahadaysa UYGULA. Ordular listesi ve bütün cümleler kalktı: **108 → 11 kelime** |
| 3 | Eğitim Adım 5'ten sonra | **Evet** | Adım 5 yapıldı (§13.4). Eğitim (Adım 8) Adım 5 telefonda doğrulanınca |

### 13.2 Diplomasi: "hangi il neye göre gözüküyor orada?"

Liste `diplomasi.js tanidiklar`'dan geliyor: sınırına değen, savaştığın/anlaştığın,
toprağının olduğu bölgede duran, uzakta büyüyen (≥4 bölge) devletler. Eski ekrandaki
"NASIL TANIDIN" satırı kalkınca bunun hiçbir izi kalmamıştı. Cevap cümle değil HARİTA
(`DiplomasiHaritasi.js`): solda küçük Türkiye — listedekiler kendi renginde, kalanı tek parça
koyu sis; senin toprağın pirinç çevreli, seçili devlet beyaz çevreli. Haritada bir devlete
dokunmak onun kartını seçip listeyi ona kaydırıyor. Eylem düğmeleri haritanın altına taşındı
(kart açılıp listeyi itmiyor), kartlar iki sütun. Sıra: teklif · savaş · müttefik · komşu ·
bölge · uzaktaki büyük. ⚠ İlk sis rengi (panelin açığı) bazı illerin mavi-gri tonuna
karıştı — önizlemede görüldü, sis koyulaştırıldı ve iç sınırları kaldırıldı.

### 13.3 Önceki listeden (§12.5) uygulananlar

| Madde | Yapılan |
|---|---|
| 1. Otomatik kayıt ⛔ | Maç başlar başlamaz, her tur bitince ve uygulama arka plana geçerken, SESSİZCE ve yalnızca maçın kendi yuvasına (`oyunKancasi.js` OTOMATİK KAYIT). Menüdeyken ve "kaydetmeden çık"tan sonra çalışmıyor (`mactanCik`) — yoksa bellekteki boş maç 1. yuvayı ezerdi |
| 2. Android geri tuşu ⛔ | En üstteki şeyi kapatıyor: onay kutusu → açık ekran → savaş odası → hedef → hamle kipi → bölge paneli → "ana menüye dön?" sorusu. Ana menünün alt ekranında bir geri; ana menünün kendisinde sistemin kararı (çıkış). Gelen teklif geri tuşuyla CEVAPLANMIYOR |
| 3. Tablet yön kilidi ⛔ | `eklentiler/oyun-kategorisi.js` manifeste `android:appCategory="game"` yazıyor (`npx expo config --type introspect` ile görüldü). Expo Go'da etkisi yok; gerçek kurulum dosyasında tablette denenecek. Play Console'da kategori "Oyun › Strateji" |
| 4. %50 Hâkimiyet'te rakip hedefe ulaşınca oyun bitmiyor ⚠ | `mod.js sonucKontrol` 2b: eşikli modda hedefe senden önce ulaşan rakip maçı bitirir (sonuç cümlesinde rakibin adı). `DENGE.MOD.RAKIP_ESIGI_BITIRIR` — geri almak tek satır. Eşitlikte oyuncu kazanır. 2 yeni test; test yardımcısı `parcaVer` artık kalanı tek bir dev "99"a değil kendi illerine bırakıyor |

### 13.4 Adım 5: doğrudan hamle

```
Eski:  parça → [panel] SALDIR → hedef → [savaş odası] kuvvet, GÖNDER → [onay] EVET
Yeni:  ordu → hedef (çubukta sayılar) → aynı hedefe ikinci dokunuş
```

- **Kendi orduna dokun** (bu tur hakkı olan birliği ve gidecek yeri varsa): panel açılmıyor,
  hedefler İKİ RENKTE birden parlıyor — kendi toprağın pirinç (taşı), düşman kırmızı
  (saldır). SALDIR / ASKER TAŞI ayrımı ortadan kalktı. Hakkı biten ordu ya da ordusuz
  bölge → panel eskisi gibi.
- **Hedefe dokun:** hedef seçiliyor (kalın açık çerçeve), sol altta HAMLE ÇUBUĞU açılıyor:
  birlik başına − sayı/eldeki + (Baki, Soru 2: kuvvet seçimi kalıyor, varsayılan sıfır),
  TÜMÜ, tahmin simgesi, (komutan bu ordudaysa) komutan simgesi, SALDIR · n / TAŞI · n.
- **Tahmin cümle değil renk + biçim:** hedefin dolgusu tahminin renginde (yeşil kazanır ·
  pirinç kıl payı · kırmızı kaybeder), çubukta iki yukarı ok / iki çizgi / aşağı ok.
  Karşıda ordu yoksa yeşil. Hesap savaş odasıyla aynı satırdan (`oyunKancasi.hamleTahmini`).
- **Aynı hedefe ikinci dokunuş = hamle** (Soru 1). Onay kutusu kalktı. Kuvvet sıfırken ikinci
  dokunuş yalnızca kısa bir ret titreşimi. Başka hedefe dokunmak onu seçer, hamle yapabilen
  başka orduna dokunmak kaynağı değiştirir, başka her yer vazgeçer.
- **Hedefe basılı tut:** savaş odası (karşı tarafın dökümü, arazi, moral, ince ayar) —
  §4.1'in "basılı tut" yolu. Çubukta seçilen kuvvetle açılıyor, GÖNDER doğrudan hamle.
- **Bölgenin ayrıntısı** (Soru 7): çubuktaki (i) simgesi paneli açıyor; üretim, toplanma,
  komutan oradan.

Önizleme: `onizleme/harita-skia/9-dogrudan-hamle.png` (kaynak koyu, pirinç + kırmızı
hedefler, seçili hedef açık çerçeve + yeşil). Eski SVG haritası da aynı dili konuşuyor.
Yeni test: vurguda iki renk + seçili hedefin tek kez boyanması.

### 13.5 Baki'nin telefonda bakacağı şeyler

1. **Diplomasi:** soldaki küçük haritada listedekiler renkli, kalanı koyu mu? Bir karta
   dokununca o devlet haritada beyaz çevreli oluyor mu, haritadan bir devlete dokununca
   kartı seçiliyor mu?
2. **Araştırma:** her birliğin altında kilitli özel yetenek düğümü; bir dalı 2. kademeye
   çıkarınca kilit düşüyor mu, uca inen çizgi yanıyor mu?
3. **Komutan:** kendi orduna dokun → çubuktaki (i) → panelde "BURADAKİ ASKERLER" satırında
   komutan simgesi → dokununca komutan oraya geçiyor mu? Ayarlar → KOMUTAN: kartlar ve
   yıldızlar.
4. **Saldırı (Adım 5):** kendi orduna dokun → hedefler iki renkte parlıyor mu → düşmana dokun
   → alttaki çubukta sayıyı seç, hedefin rengi değişiyor mu → aynı hedefe bir daha dokun.
   Hedefe basılı tutunca savaş odası.
5. **Geri tuşu:** panel açıkken geri → panel kapanıyor mu; haritada boşken geri → "ana
   menüye dön" sorusu.
6. **Otomatik kayıt:** birkaç tur oyna, uygulamayı arka plandan kapat, yeniden aç → SEFERE
   DEVAM son turdan açılıyor mu?

### 13.6 Metin yükü

OYUN İÇİ 1.261 → **1.244 kelime**, uzun cümle 43 → **41** (saldırı onayı ve hedef kipi
şeridi kalktı). AÇILAN 1.257 → **1.167**, uzun cümle 43 → **38** (komutan ekranı 108 → 11).

---

## 14. DÖRDÜNCÜ TUR (2026-09-24)

### 14.1 Baki'nin telefondaki gözlemleri (§13.5)

| # | Konu | Baki | Durum |
|---|---|---|---|
| 1 | Diplomasi haritası | *"Beğendim"* | ✅ |
| 2 | Araştırma kilidi | *"Evet"* | ✅ |
| 3 | Komutan | *"Geçiyor da hoşlanmadım"* — *"çok küçük, komutanın komutan olduğu anlaşılmıyor, birlikte de komutan-paşa aurası olmuyor"* | Görsel öneri (§14.4) |
| 4 | Doğrudan hamle | *"Oluyor"* — tahmin rengi güzel ama *"biraz daha açıklayıcı olabilir"* | §14.2 |
| 5 | Geri tuşu | *"Evet"* | ✅ |
| 6 | Otomatik kayıt | *"Evet"* | ✅ |

### 14.2 Saldırı tahmini daha açıklayıcı

Hedef seçiliyken hamle çubuğunun ÜST SATIRI: hedefin adı, tek kelimelik sonuç (KAZANIRSIN ·
KIL PAYI · KAYBEDERSİN · SAVAŞSIZ ALIRSIN) ve iki tarafın kaç birlikle girip kaçla çıkacağı
(kılıç: sen 5 → 4 · kalkan: o 3 → 0; kayıp eksi renginde). Cümle değil, sonuç + sayı.
Kuvvet seçilmeden de karşıdakinin sayısı görünüyor. Sayılar tahminin kendisinden
(`muharebe.js muharebeTahmini` artık `savunanKalan`'ı da döndürüyor).

### 14.3 Diplomasi: cevap ekranın içinde + reddin sebebi

Baki: *"anlaşma yollayınca cevabı diplomasi ekranına gelsin, ekranı kapatmam gerekiyor
görebilmem için; anlaşmayı neden reddettiğine dair küçük bir mesaj olsun."* Cevap eskiden
kartın köşesinde 16 piksellik bir tik/çarpıydı. Artık haritanın altındaki eylem kutusunda,
düğmelerin hemen altında: simge + sonuç + (reddedildiyse) tek satır sebep. Sebep
`zeka.js retSebebi`: kabulü ENGELLEYEN en büyük eksi terim (eski hesap · sınırdaşlık ·
seni zayıf görmesi), eksi yoksa "ortak bir düşmanınız yok" ya da "yeterince kazandırmıyor";
ateşkeste "savaşı kaybetmiyor". (`teklifSebebi` en büyük terimi seçiyordu — retle olumlu
bir cümle gelebiliyordu.) Test: her retin tanımlı, en çok 6 kelimelik bir cümlesi var.

⚠ Bu, §12.1/2'deki "yalnızca simge" kararından bilinçli bir sapma — Baki'nin kendi isteği:
simge "kabul etmez"i söylüyor, NEDEN'i söylemiyordu. OYUN İÇİ metin 1.244 → 1.276 kelime
(uzun cümle 41, değişmedi).

### 14.4 Görsel ayrıntı sorusu (Baki: "haritada bir simülasyon oyunu, görsel detay eklemeli
miyiz, sence?")

Cevabım evet; öneriler cümleyle değil GÖRÜNTÜYLE (`scripts/gorsel-oneri.js` — oyunun kendi
çizimi, aynı maç, önerilen katmanlar üstüne):

| Görüntü | Katman |
|---|---|
| `oneri-A-bugun` | Bugünkü harita |
| `oneri-B-kiyi-arazi` | Kıyı gölgesi (menü haritasındaki hale) + arazi çizimi: dağlıkta iki tepeli dağ (aydınlık/gölgeli yamaç), tepelikte yumuşak tepe — eski atlas gibi |
| `oneri-C-sehirler` | + her ilin merkezinde küçük kale, burcunda sahibinin bayrağı |
| `oneri-D-komutan` | + komutanın ordusu: arkasında altın hale, kalkanın tepesinde yıldız, yanında sahibinin renginde sancak |
| `oneri-E/F-uzak` | Uzak görünümde bugün / hepsi |

Seçilen katman `haritaCizim.js`'e taşınırken telefonun ekran kartı yolunda ÖLÇÜLECEK
(`onizleme/harita-hiz.html`): dağlar ve kaleler yüzlerce küçük yumuşatılmış çizgi — §6'daki
tuzağa göre ya resme pişirilecek ya da şerit yöntemiyle çizilecek.

---

## 15. BEŞİNCİ TUR (2026-09-24)

Baki öneri görüntülerine cevap verdi: B (kıyı gölgesi + arazi) evet, kale hayır, komutan
halesi hayır ("insan silüeti ya da başka şeyler"), denize dalga evet, eğitim bekleyebilir.
Görsel işler ayrı bir görevde toplandı: **`GOREV-21-gorsel-guzellestirme.md`** (H1 yapıldı,
komutan silüeti ve öneri listesi orada). Bu görevin kalan adımları (4 · 6 · 7 · 8 eğitim ·
9) yerinde duruyor; "nefes alan kalkan" (Adım 6) Görev 21'de H3 olarak görüntüyle soruldu.

Aynı turda bir hata düzeltildi: komutan ekranı kâğıt zeminde koyu zeminin açık yazı
renklerini kullanıyordu (Görev 16'dan beri okunmuyordu) — kural CLAUDE.md §6'ya yazıldı.

---

## 16. ALTINCI TUR — EĞİTİM, TEK HARİTA, AÇILIŞ KAMERASI (2026-09-25)

Baki: *"Eğitimi yap, eski haritayı emekliye ayır, mağaza görselleri dursun … APK'dan önce
yapılacak her şeyi tamamlayalım."* Dördüncü turdan beri (Adım 5 telefonda doğrulandı,
§14.1) Adım 8'in kapısı açıktı.

### 16.1 Adım 8 — eğitim

Ana menüdeki **EĞİTİM** artık kurallar sayfasını değil **küçük bir maçı** açıyor
(`src/oyun/egitim.js`): Marmara, sen Bursa, sabit tohum, kolay. Normal kurulumdan dört fark
(`DENGE.EGITIM`): Yalova ile savaş baştan açık (ilk ders diplomasi ekranına gitmesin),
Doğu Bursa'da güçlü bir ordu, Yalova'da tek piyade, ilk turda iki piyadelik bütçe.

| Adım | Şerit | İşaret | Biter |
|---|---|---|---|
| 1 | ORDUNA DOKUN | Doğu Bursa'da halka | ordu çubuğu açılınca |
| 2 | HEDEFE DOKUN | Yalova'da halka | hedef seçilince |
| 3 | ASKER SEÇ | TÜMÜ parlar | tahmin yeşile dönünce ("KAZANIRSIN") |
| 4 | TEKRAR DOKUN | Yalova'da halka + SALDIR parlar | Yalova alınınca → **İL FETHEDİLDİ** |
| 5 | ASKER BAS | Bursa Ovası'nda halka → çubukta ASKER BAS → üretim ekranında [+] → ÜRET | asker basılınca |
| 6 | TURU BİTİR | TURU BİTİR düğmesi parlar | tur bitince → rapor kapanınca **HAZIRSIN** |

HAZIRSIN kartında iki yol: **SEFERE BAŞLA** (mod seçimine) · **DEVAM ET** (işaretler söner,
Marmara'da serbest oyun).

**Tasarım kararları:**
- **Adımlar durumdan çıkıyor, sayaçtan değil** (`egitimAdimi`). Oyuncu başka orduya dokunsa,
  hedefi değiştirse, saldırısı başarısız olsa eğitim kendiliğinden doğru adıma dönüyor;
  saldıramıyorsa "turu bitir" diyor, kaynakta ordu kalmadıysa fetih dersini atlıyor.
- **"KAZANIRSIN" yalan söylemiyor:** tahmini yeşil olan HER kuvvetin sabit tohumla gerçekten
  kazandığı test ediliyor (`testler/egitim.test.js`). İlk dersin "kaybettin" olması en kötü
  açılış olurdu.
- **İşaret haritanın ÜSTÜNDE, içinde değil** (`Ipucu.js`): haritada sürekli bir kıpırtı bütün
  haritayı her karede yeniden çizdirirdi (CLAUDE.md §6). Halka küçük bir görünüm; yerini
  kameradan arayüz iş parçacığında okuyor. Renk beyaz + koyu kontur (`tema.js IPUCU`): il
  renklerine, kırmızı saldırı ve pirinç taşıma hedefine benzemesin.
- **Eğitim kayda girmez:** `durum.egitim` işareti — hiçbir yuvaya yazılmıyor, otomatik kayıt
  kapalı, ayarlar menüsünde kaydet/yükle/zorluk yok, çıkışta kayıt sorusu yok. **Mühür de
  yok:** kolaylaştırılmış maçtan gelen mühür rütbeye bedava puan olurdu.
- Metin: şerit en çok iki kelime + ilerleme noktaları. OYUN İÇİ ölçüm 1300 → **1322 kelime**
  (eğitimin 12 kelimesi, HAZIRSIN kartı, çıkış sorusu), uzun cümle **40 → 40**.

### 16.2 Adım 4'ün kalanı — açılış kamerası

Maç açılınca (yeni maç, yükleme, eğitim) harita bütün Türkiye'den oyuncunun iline süzülüyor
(`DENGE.JEST.ACILIS_YAKINLIK` 2.1 — il kalkanlarının göründüğü kademe, komşular ekranda).
Savaş kamerasıyla **tek etkide** (`HaritaSkia.js`): paylaşılan değerleri iki ayrı etki
yazamıyor (React Compiler kuralı). Bu sırada eski etkideki bir sızıntı da kapandı: geçiş
sürerken ikinci bir kamera gelirse ilk zamanlayıcı iptal ediliyor ve jest sayacı hiç
inmiyordu — sabit yerleşim bir daha kurulmazdı. Kapatmak için `ACILIS_YAKINLIK: 0`.

### 16.3 Adım 9 — tek harita

Eski SVG haritası emekliye ayrıldı: `Harita.js`, `HaritaSecici.js` (hata kalkanıyla),
`RozetKatmani.js`, `Rozet.js`, ayarlardaki HARİTA satırı (`haritaMotoru`), `tema.js`'teki
`HARITA_NETLIK` ve `HARITA_JEST_DOKUSU`. Uygulama paketi derleniyor (8.4 MB). Menüdeki küçük
haritalar ve simgeler hâlâ SVG — `react-native-svg` kalıyor.

### 16.4 Baki'nin telefonda bakacağı şeyler

1. Ana menü → **EĞİTİM**: harita Bursa–Yalova'ya süzülüyor mu, sol üstte "ORDUNA DOKUN" ve
   Doğu Bursa'da beyaz halka var mı?
2. Altı adımı halkayı ve parıltıyı izleyerek bitir; sonunda **HAZIRSIN** geliyor mu?
3. Normal bir maç aç (ya da yükle): harita kendi iline süzülüyor mu?
4. Ayarlar → HARİTA satırı artık yok; harita eskisi gibi çalışıyor mu?
