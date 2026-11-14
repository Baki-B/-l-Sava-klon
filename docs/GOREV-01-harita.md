# GÖREV 01 — 81 İL HARİTASI VE İL PANELİ

Bu dosya senin (Claude Code'un) bu oturumdaki görev tanımıdır. Baştan sona oku, sonra "Çalışma Kuralları" bölümündeki düzene uyarak işe başla.

---

## 0. KİMİNLE ÇALIŞIYORSUN

Kullanıcının adı **Baki**. Oyunun tasarımcısı ve sahibi. **Yazılımcı değil.** Kod okumayacak, terminal komutlarını ezbere bilmiyor, hata mesajlarını yorumlayamaz.

Buna göre davran:

- Kurulum ve komutları **satır satır, kopyalanabilir biçimde** ver. "Bağımlılıkları kur" deme, komutun kendisini yaz.
- Teknik terim kullanman gerekiyorsa yanına tek cümlelik Türkçe karşılık koy.
- Bir şey yaptığında **ne yaptığını ve Baki'nin ne göreceğini** söyle. "Harita bileşenini oluşturdum" yetersiz; "Haritayı çizen dosyayı yazdım, telefonunda Türkiye'nin şeklini gri renkte görmen lazım" doğru.
- Baki'ye teknik bir karar sorman gerekirse, seçenekleri **sonuçlarıyla** anlat. "Hangi projeksiyonu kullanalım?" yanlış soru. "Harita biraz basık görünüyor, düzeltmemi ister misin?" doğru soru.
- Türkçe konuş.

---

## 1. GÖREVİN KAPSAMI

### Yapılacak

81 il üzerinde **dokunulabilir, yakınlaştırılabilir bir Türkiye haritası** ve bir ile dokunulduğunda açılan **il bilgi paneli**. Bunun için gereken tüm veri katmanı.

### Yapılmayacak — bu görevin dışında

Oyun mantığının hiçbir parçası bu görevde yok:

- Muharebe, ordu, birim, üretim, ekonomi hesabı
- Tur döngüsü, yapay zekâ, diplomasi
- 195 parçalık alt bölümleme (ayrı bir görev olacak)
- Kayıt/yükleme, menü, ses

Bu görevin sonunda elde edilecek şey **oynanabilir bir oyun değil**, üzerine oyun kurulacak sağlam bir harita ve veri temelidir. Kapsamı kendiliğinden genişletme. Fazladan bir şey yapman gerektiğini düşünüyorsan önce Baki'ye sor.

---

## 2. KAYNAK BELGELER

Proje klasöründe iki tasarım belgesi var:

- **`il-savasi-tasarim.md`** — oyunun ana tasarımı. Bu görev için §5 (il özellikleri), §7 (harita ve il kontrolü) ve §13 (teknoloji) bölümleri geçerli.
- **`il-savasi-parca-bolumleme-v2.md`** — 195 parçalık alt bölümleme. Bu görevde parçaları **uygulamayacaksın**, ama iki şey için kaynak olarak kullanacaksın: her ilin arazi tipini türetmek ve her ilin parça sayısını panelde göstermek.

Bu belgeler senin referansın. Bir çelişki veya eksik görürsen kendi kararınla doldurma, Baki'ye bildir.

### Bilinen çelişki — Baki bunun farkında

Tasarım §7 "haritada yalnızca iller görünür, parça görünmezdir" diyor. Parça belgesi ise parçalara kendi arazisini ve kendi payını veriyor — bu, parçanın haritada gerçek bir bölge olmasını gerektirir. Parça belgesi daha yenidir ve o kazanır. Ama **bu görevde parça yok**, sadece iller var. Çelişki sonraki görevin konusu.

---

## 3. TEKNOLOJİ

- **React Native + Expo** (JavaScript). Tasarım §13.1'de Godot öneriliyor; Baki ile birlikte Expo'ya karar verildi, sebebi Baki'nin görsel editör kullanmadan ilerleyebilmesi.
- Harita çizimi: **react-native-svg**
- Yakınlaştırma/kaydırma: **react-native-gesture-handler** + **react-native-reanimated**
- Harita hazırlama betikleri: Node.js. Coğrafi hesaplar için `@turf/turf`, sadeleştirme için `topojson` ailesi kullanılabilir.
- TypeScript **kullanma**, düz JavaScript yaz. Baki'nin okuması gereken hata sayısını azaltır.

Bunlar dışında kütüphane eklemeden önce sor.

---

## 4. HEDEF DOSYA YAPISI

```
il-savasi/
├── docs/
│   ├── il-savasi-tasarim.md
│   ├── il-savasi-parca-bolumleme-v2.md
│   └── GOREV-01-harita.md          <- bu dosya
├── veri/
│   ├── ham/                        <- indirilen sınır verisi (dokunulmaz)
│   ├── iller.json                  <- 81 il, statlar, arazi, parça sayısı
│   ├── komsuluk.json               <- il komşuluk grafiği
│   ├── harita.json                 <- çizim yolları (SVG path)
│   └── URETIM-NOTU.md              <- verinin nereden, nasıl geldiği
├── scripts/
│   └── harita-uret.js              <- tek seferlik hazırlama betiği
├── onizleme/
│   └── harita.html                 <- tarayıcıda açılan kontrol sayfası
└── src/
    ├── App.js
    ├── bilesenler/
    │   ├── Harita.js
    │   └── IlPaneli.js
    └── tema.js                     <- renkler tek yerde
```

**`veri/URETIM-NOTU.md` zorunludur.** İçinde şunlar yazacak: sınır verisi hangi kaynaktan, hangi tarihte, hangi lisansla alındı; komşuluk nasıl hesaplandı; hangi çiftler elle eklendi/çıkarıldı; il statları hangi mantıkla üretildi. Baki altı ay sonra bu dosyaya bakıp "bu sayı nereden geldi" sorusunu cevaplayabilmeli.

---

## 5. İŞ ADIMLARI

Her adımın sonunda **dur ve Baki'ye göster**. Ayrıntı için §7'ye bak.

### ADIM 0 — Proje ayağa kalksın

Boş bir Expo projesi kur, telefonda ekranda tek satır yazı görünsün.

Baki'nin bilgisayarında Node.js kurulu olmayabilir. Önce kontrol et, yoksa kurulumu adım adım anlat. Telefonuna **Expo Go** uygulamasını kurması gerekecek — bunu da anlat: uygulama mağazasından indirilir, bilgisayardaki proje çalışırken ekranda çıkan karekod telefonla okutulur, uygulama telefonda açılır.

**Baki'nin kontrolü:** Telefonunda yazıyı görüyor mu?

Bu adım geçilmeden diğerlerine başlama. Kurulum sorunları en sinir bozucu aşamadır; oyun kodu araya girmeden çözülmeli.

---

### ADIM 1 — Sınır verisini getir ve doğrula

Türkiye'nin 81 il sınırını içeren açık kaynaklı bir GeoJSON dosyası bul ve indir. (GeoJSON = coğrafi sınırları koordinat listesi olarak tutan standart bir metin dosyası biçimi.)

Aday kaynaklar: GitHub'daki açık Türkiye sınır veri depoları, GADM seviye-1, Natural Earth, OpenStreetMap türevleri. Hangisini seçtiğini ve neden seçtiğini `URETIM-NOTU.md`'ye yaz.

**Ağ erişimin kısıtlıysa dosyayı indiremeyebilirsin.** O durumda uydurma; Baki'ye tam olarak hangi sayfadan hangi dosyayı indireceğini ve `veri/ham/` klasörüne koyacağını söyle.

**Doğrulama — hepsi geçmeli:**

| Kontrol | Beklenen |
|---|---|
| İl sayısı | Tam 81 |
| İl kodları | 01–81, eksiksiz |
| İl adları | Tasarım belgesindeki yazımla eşleşiyor |
| Geometri türü | Poligon veya çoklu-poligon; bozuk geometri yok |

**İsim eşleştirme tuzakları — bunlara özellikle dikkat et:**

- Türkçe büyük/küçük harf dönüşümü bozuktur. `"İSTANBUL".toLowerCase()` beklediğin sonucu vermez. Karşılaştırmayı Türkçe yerel ayarıyla yap veya isimleri elle sabitle.
- `Afyonkarahisar` bazı kaynaklarda `Afyon` geçer.
- `Şanlıurfa`/`Urfa`, `Kahramanmaraş`/`Maraş`, `Elazığ`/`Elaziğ` gibi varyantlar olabilir.
- Şapkalı harfler (`Kâhta` gibi) kaynaktan kaynağa değişir.

Eşleşmeyen isim çıkarsa sessizce atlama; listesini çıkar ve Baki'ye göster.

**Ada uyarısı:** Gökçeada ve Bozcaada Çanakkale'ye, Marmara Adası ve Avşa Balıkesir'e bağlıdır. Bu iller çoklu-poligon olarak gelir — yani birden fazla ayrık şekilden oluşur. Çizim kodun bunu desteklemeli, yoksa adalar kaybolur veya iller bozuk görünür.

**Baki'nin kontrolü:** Kaç il bulundu, isim uyuşmazlığı var mı?

---

### ADIM 2 — Haritayı çizime hazırla

Üç iş var:

**Projeksiyon.** Ham enlem/boylam koordinatlarını doğrudan çizersen Türkiye yatay olarak basık görünür. Türkiye enlemine uygun konik bir projeksiyon uygula. (Projeksiyon = küre üzerindeki koordinatları düz ekrana aktarma yöntemi.)

**Sadeleştirme.** Ham sınır verisi çok ayrıntılıdır, telefonda ağır çalışır. **Topolojik sadeleştirme** kullan — komşu illerin ortak sınırını tek seferde sadeleştirir. Poligonları tek tek sadeleştirirsen ortak sınırlar birbirinden ayrışır ve iller arasında beyaz boşluklar açılır; bu klasik hatadır.

Hedef: `harita.json` dosyası **1 MB altında** kalsın, il şekilleri gözle bakınca tanınabilir olsun. İkisi çelişirse tanınabilirlik kazanır.

**Etiket noktası.** Her il için, il adının ve ilerideki ordu simgesinin oturacağı bir nokta hesapla. Poligonun ağırlık merkezini (centroid) kullanma — içbükey illerde nokta ilin dışına, hatta denize düşer. Muğla ve Antalya'da bu kesin olur. "Sınırlara en uzak iç nokta" algoritmasını (polylabel) kullan, sonucu `harita.json`'a yaz.

**Tarayıcı önizlemesi üret:** `onizleme/harita.html`. Tek dosya, çift tıklayınca açılsın, 81 ili çizsin, il adlarını etiket noktalarına yazsın. Bu dosya oyunun parçası değil, sadece kontrol aracı — ama telefonda uğraşmadan haritanın doğruluğunu görmenin en hızlı yolu.

**Baki'nin kontrolü:** Tarayıcıda harita Türkiye'ye benziyor mu? İller arasında boşluk var mı? Ada'lar yerinde mi? Etiketler ilin içinde mi?

---

### ADIM 3 — Komşuluk grafiğini kur

Bir il yalnızca sınırdaşına saldırabilir (tasarım §7 ve §10.1). Bu yüzden komşuluk listesi oyunun en kritik verisidir.

**Önce Baki'ye sor:** Tasarım §13.2 "mevcut projeden aynen taşınır — doğrulanmış" diyor. Elinde bu dosya varsa kullan, kendi hesapladığınla karşılaştır, farkları rapor et. Yoksa sıfırdan hesapla.

**Hesaplama:** Sınır paylaşan iki il komşudur. Köşeden nokta temasını elemek için ortak sınır uzunluğuna eşik koy (örneğin 500 metreden kısa temas komşuluk sayılmasın).

**Doğrulama — hepsi geçmeli:**

1. Simetri: A'nın komşusu B ise, B'nin komşusu da A
2. Komşusuz il yok (Türkiye'de her ilin kara komşusu vardır)
3. Kendi kendine komşuluk yok
4. Tekrar eden çift yok

**Elle kontrol edilecek örnekler** — bunlar tutuyorsa grafik büyük ihtimalle sağlamdır:

| İl | Beklenen komşuları |
|---|---|
| Yalova | Bursa, Kocaeli |
| Kilis | Gaziantep, Hatay |
| Bartın | Zonguldak, Karabük, Kastamonu |
| Rize | Trabzon, Bayburt, Erzurum, Artvin |
| İstanbul | Tekirdağ, Kırklareli, Kocaeli |
| Sinop | Kastamonu, Çorum, Samsun |

Sapma varsa düzeltmeden önce Baki'ye söyle.

**Baki'nin kontrolü:** Toplam kaç komşuluk çifti çıktı, yukarıdaki altı örnek tutuyor mu?

---

### ADIM 4 — İl statları tablosunu üret

**Bu veri hiçbir belgede yok.** Tasarım §5 statların ne işe yaradığını anlatıyor ama 81 il için değer vermiyor. Bu tabloyu sen üreteceksin ve **her sütunun hangi mantıkla türetildiğini `URETIM-NOTU.md`'ye yazacaksın.**

Sekiz stat (tasarım §5):

| # | Stat | Nasıl türetilecek |
|---|---|---|
| 1 | Nüfus | Gerçek nüfus verisi, 1–10 aralığına ölçeklenir. Doğrusal ölçekleme İstanbul'u 10, Bayburt'u 1 yapar ve arası ezilir — logaritmik ölçekleme daha dengeli sonuç verir. Hangisini seçtiğini yaz. |
| 2 | Ekonomi | İl gayrisafi hasılası veya nüfus × gelişmişlik yaklaşımı, 1–10 |
| 3 | Eğitim | Gelişmişlik göstergesinden türetilmiş tahmin, 1–10 |
| 4 | Sanayi | Sanayi yoğunluğu tahmini, 1–10 |
| 5 | Arazi | **Parça belgesinden türetilecek** — aşağıya bak |
| 6 | Altyapı | Yol/ulaşım yoğunluğu tahmini, 1–10 |
| 7 | Moral | Tahmin, 1–10 |
| 8 | Parça sayısı | **Parça belgesinden doğrudan okunacak**, 1–5 |

**Arazi türetme kuralı:** `il-savasi-parca-bolumleme-v2.md` her parçaya ova/tepelik/dağlık atıyor ve her parçanın ekonomi payını veriyor. İlin arazisi = ekonomi payına göre ağırlıklı baskın arazi. Örnek: Bursa'nın parçaları 0.52 ova + 0.13 ova + 0.31 tepelik + 0.04 dağlık → ova ağırlığı 0.65 → Bursa **ova**.

Tek parçalı 17 il zaten doğrudan okunur (Tunceli dağlık, Aksaray ova gibi).

**Parça sayısı** aynı belgeden doğrudan gelir: Ankara 5, Yalova 1, toplam 195.

**Zorunlu uyarı:** Nüfus ve ekonomi dışındaki statlar tahmindir. Tabloyu üretirken her ilin satırına güven düzeyini işaretle veya `URETIM-NOTU.md`'de açıkça belirt: **"3, 4, 6, 7 numaralı statlar ilk taslaktır, oyun dengesi test edilirken elle ayarlanacaktır."** Bu sayıları kesin veriymiş gibi sunma.

**Baki'nin kontrolü:** Birkaç il örneğine bak — İstanbul, Rize, Konya, Bayburt. Sayılar sezgisine uyuyor mu?

---

### ADIM 5 — Haritayı uygulamada çiz

Artık `veri/` klasöründeki üç dosya hazır. Bunları Expo uygulamasında kullan.

Gereken davranış:

- 81 il `react-native-svg` ile çizilir, her il ayrı bir çizim yolu (path)
- İl adları etiket noktalarına yazılır — küçük yakınlaştırmada okunamayacak kadar sıkışırsa gizlenir
- İki parmakla yakınlaştırma, tek parmakla kaydırma
- Yakınlaştırma sınırı: tüm Türkiye ekrana sığacak kadar uzak, tek il ekranı dolduracak kadar yakın
- Haritanın ekran dışına kaçması engellenir
- Bir ile dokununca o il vurgulanır (kenarlık kalınlaşır, rengi değişir)
- Seçili ilin komşuları hafifçe farklı renkte gösterilir — bu, komşuluk grafiğinin doğruluğunu gözle test etmenin en hızlı yoludur

**Renkler `src/tema.js` dosyasında tek yerde toplanır.** Kod içine renk kodu gömme. İleride oyuncu renkleri, sahiplik renkleri, arazi renkleri hep buradan gelecek.

Şimdilik iller arazi tipine göre renklendirilsin: ova, tepelik, dağlık için üç ton. Bu hem harita boş görünmesin diye hem de arazi verisini gözle doğrulamak için.

**Performans notu:** 81 çizim yolu telefonda sorunsuz çalışmalı. Takılma olursa önce sadeleştirmeyi artır, kod karmaşıklaştırmaya gitme.

**Baki'nin kontrolü:** Telefonda harita akıcı mı? Rize'ye dokununca Rize seçiliyor mu, komşuları doğru mu vurgulanıyor?

---

### ADIM 6 — İl paneli

Bir ile dokunulunca ekranın altından açılan panel. İçeriği:

**Başlık:** İl adı, il kodu, bölge (Marmara, Ege...)

**Arazi:** Ova / Tepelik / Dağlık — yanında savunma çarpanı (×1.00 / ×1.15 / ×1.35, tasarım §3.5)

**Statlar:** 8 stat, sayı olarak **ve** küçük bir çubuk grafikle. Sayı tek başına soyut kalıyor; çubuk "bu il diğerlerine göre nerede" sorusunu anında cevaplıyor.

**Parça sayısı:** "5 parça" — yanına tek satır açıklama: "Bu ili tamamen almak için 5 kez galip gelmek gerekir."

**Komşular:** İsim listesi. İsme dokununca o ile geçilir. Bu, komşuluk grafiğini elle gezerek test etmeyi sağlar.

**Panel kapatma:** Aşağı kaydırma veya haritanın boş bir yerine dokunma.

Panel içine oyun mantığı koyma — ordu, üretim, saldır düğmesi yok. Sadece bilgi gösterimi.

**Baki'nin kontrolü:** Panel okunaklı mı, komşu listesinden gezinme çalışıyor mu?

---

## 6. VERİ MODELİ

```js
// veri/iller.json
{
  "34": {
    "kod": "34",
    "ad": "İstanbul",
    "bolge": "Marmara",
    "arazi": "ova",              // ova | tepelik | daglik
    "parcaSayisi": 3,
    "statlar": {
      "nufus": 10,
      "ekonomi": 10,
      "egitim": 9,
      "sanayi": 9,
      "altyapi": 10,
      "moral": 6
    }
  }
}

// veri/komsuluk.json
{
  "34": ["59", "39", "41"]
}

// veri/harita.json
{
  "34": {
    "yol": "M120,45 L130,50 ...",   // SVG çizim yolu, çoklu-poligon destekli
    "etiket": { "x": 125, "y": 48 }
  }
}
```

İl kodu her yerde **iki haneli metin** olsun (`"01"`, `"34"`). Sayı yaparsan `01` → `1` olur ve eşleştirmeler bozulur. Bu klasik bir hatadır, baştan engelle.

---

## 7. ÇALIŞMA KURALLARI

**Adım adım git, her adımın sonunda dur.** Yedi adımı tek seferde yapıp "bitti" deme. Her adımın sonunda:

1. Ne yaptığını iki üç cümleyle özetle
2. Baki'nin **tam olarak ne yapacağını** söyle (hangi komutu çalıştıracak, hangi dosyayı açacak, telefonda neye bakacak)
3. Neyin doğru görünmesi gerektiğini söyle
4. Onay al, sonra devam et

**Takıldığında.** Bir şey çalışmıyorsa üç kez deneyip pes etme; ama beş farklı yöntemi arka arkaya deneyip Baki'yi de karanlıkta bırakma. İkinci başarısız denemeden sonra durumu anlat: ne denedin, ne oldu, elinde hangi seçenekler var.

**Uydurma.** Sınır verisini indiremezsen sahte koordinat üretme. Nüfus verisine erişemezsen rastgele sayı yazma. Erişemediğin şeyi söyle ve Baki'den iste.

**Kapsamı büyütme.** "Madem buradayım, ordu sistemini de kurayım" yapma. Bu görev harita ve panelle biter.

**`URETIM-NOTU.md`'yi her adımda güncelle**, sonda toplu yazmaya bırakma.

---

## 8. GÖREV BİTİŞ ÖLÇÜTÜ

Şu maddelerin hepsi doğruysa görev bitmiştir:

- [ ] Telefonda 81 illik Türkiye haritası akıcı çalışıyor
- [ ] Yakınlaştırma ve kaydırma çalışıyor, harita ekran dışına kaçmıyor
- [ ] Her ile dokunulabiliyor, seçili il vurgulanıyor
- [ ] Seçili ilin komşuları haritada farklı renkte görünüyor
- [ ] İl paneli açılıyor, 8 stat + arazi + parça sayısı + komşu listesi gösteriyor
- [ ] Komşu listesinden başka ile geçilebiliyor
- [ ] `veri/` klasöründe üç JSON dosyası ve `URETIM-NOTU.md` var
- [ ] Komşuluk doğrulama testlerinin hepsi geçiyor
- [ ] `onizleme/harita.html` tarayıcıda açılıyor ve doğru harita gösteriyor
- [ ] Tahmin olan statlar açıkça tahmin diye işaretlenmiş

---

## 9. SONRAKİ GÖREVLER (bilgi amaçlı — bunları yapma)

Bu görevin çıktısı üzerine sırayla şunlar gelecek:

- **Görev 02:** İki para birimi ve tur döngüsü iskeleti
- **Görev 03:** Ordu üretimi — tipli birimler (tasarım §4.3'teki uyarı kritik)
- **Görev 04:** Muharebe motoru — tasarım §3.7'deki doğrulama tablosu test verisi olarak kullanılacak
- **Görev 05:** Bozgun, geri çekilme, yeniden toplanma
- **Görev 06:** 195 parçalık alt bölümleme

Kodu yazarken bu yönü akılda tut — özellikle `iller.json` yapısı ileride parçaları taşıyacak şekilde genişletilebilir olmalı. Ama şimdiden parça alanı ekleme.
