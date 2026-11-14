# GOOGLE PLAY YAYIN KONTROLÜ

> Tarih: 2026-08-12 · Baki'nin isteği: *"Google Play'de yayınlamak için oyunun
> kontrollerini yapmanı istiyorum: telif kontrolleri, kod uyumu, tablet telefon
> entegrasyonu, diğer dikkat edilmesi gerekenler."*
>
> Bu belge bir **kontrol listesi**dir. Her madde ya ✅ (tamam) ya ⛔ (yayını engeller)
> ya da ⚠ (yapılmalı ama engellemez) işaretli. Kod tarafında düzeltilenler işaretli;
> **senin yapman gerekenler ayrı bölümde.**
>
> **Tazelendi: 2026-08-16** — belge canlı tutuluyor, tarih kaydı değil. Bu turda düzeltilen
> eskimeler: yazı tipi adları (Oswald/Barlow → Black Ops One/Chakra Petch), ikon tarifi
> (%60 → %90, amber → beyaz), açılış zemin renkleri, laciverdin `tema.js`'ten ayrılması.
>
> **Tazelendi: 2026-09-25** (APK öncesi son tur) — test sayısı, kayıt sürümü (16 → 19),
> "veli adına hesap" satırı (yanlıştı, §4), kenardan kenara ayarı (kaldırıldı), derleme
> profilleri, gerçek kurulum denemesinin listesi (§3), para kazanmanın sırası (§7).

---

## 1. TELİF VE LİSANS

### ✅ Kütüphaneler — temiz

26 doğrudan bağımlılığın hepsi izin verici lisansta: **MIT ×20 · ISC ×4 · MIT+OFL ×2**.
Kapalı kaynak bir uygulamada kullanılmasını engelleyen (GPL/AGPL gibi) hiçbir paket yok.

### ✅ Harita verisi — atıf yerinde

Harita geometrisi **OpenStreetMap**'ten üretildi (`scripts/harita-uret.js`) ve **ODbL**
lisansı atıf şartı koşuyor. Atıf satırı ana menü → ayarlar ekranının altında duruyor:

> *Harita verisi © OpenStreetMap katkıcıları · ODbL lisansı*

⚠ **Bu satır silinemez.** Mağaza açıklamasına da eklemen iyi olur (zorunlu değil ama
lisansın ruhuna uygun).

### ✅ Yazı tipleri — atıf eklendi (2026-08-12)

**Black Ops One** ve **Chakra Petch**, Google Fonts'tan ve **SIL Open Font License
(OFL-1.1)** ile geliyor. OFL yazı tipini uygulamaya gömmene izin veriyor, para kazanmana
da izin veriyor — **ama lisans metninin ürünle birlikte gelmesini şart koşuyor.**

Lisans dosyaları yalnızca `node_modules` içindeydi, yani oyuncuya hiç ulaşmıyordu.
Atıf satırı ayarlar ekranına eklendi (`src/bilesenler/GenelAyarlar.js`):

> *Yazı tipleri: Black Ops One ve Chakra Petch · SIL Open Font License*

⚠ Bu belgenin ilk sürümünde **Oswald ve Barlow Semi Condensed** yazıyordu; o iki aile
2026-08-12'de bırakıldı (CLAUDE.md §5/4). Artık projede kullanılmıyorlar.

### ✅ Görseller — kendi malın

- `assets/muhur.png` — senin mühür görselin
- `assets/gren.png` — betikle üretilmiş 128×128 gürültü karosu
- Harita ikonları (`scripts/ikon-uret.js`) — kendi harita verinden üretiliyor
- 81 il renk paleti — ölçülerek seçilmiş, kendi üretimin

### ✅ Uygulama ikonu — YENİLENDİ (2026-08-12)

**Önceki durum:** altı görselin hepsi **Expo'nun kurulum şablonundan** geliyordu — mavi
"A" logosu, üstünde çizim kılavuzlarıyla. Mağazada Expo'nun logosuyla çıkmak hem amatör
görünürdü hem başkasının markasını dağıtmak olurdu.

**Yeni logo** (Baki'nin tarifi: *"Türkiye haritası merkezde, %60 yer kaplasın, üstünde
İL SAVAŞLARI yazsın"*) — **bugünkü hâli:**

- Türkiye silueti, genişliğin **%90'ı**, merkezde — `veri/turkiye-hat.json`'dan, yani
  oyunun kendi harita verisinden çiziliyor
- **Black Ops One 400** ile iki satır: ikisi de **beyaz** — "İL" (113 punto) + "SAVAŞLARI"
  (108 punto). Ayırıcı çizgi YOK.
- Zemin lacivert, harita kâğıt atlas tonu, kenar çizgisi oyundaki il sınırı rengi
- `app.json` zemin rengi Expo varsayılanından (`#E6F4FE`) alındı: açılış `#1B2A38`,
  adaptif ikon arkası `#152230`

Üretim `onizleme/ikon.html` + `scripts/onizleme-sunucu.js` ile; tekrar üretmek isteyen
sunucuyu açıp sayfadaki `varyantUret()` fonksiyonunu çağırır. **Ölçüler koda yazılı,
elle piksel taşınmadı** — yazı tipi değişse boşluklar kendiliğinden doğru kalır.

⚠ **İlk tarif ile bugünkü logo arasında dört tur var** ve hepsi Baki'nin gözüyle verildi:
(1) amber palet → oyunun mavi/kiremit paleti, (2) harita %60 → %74 → **%90** (ilk iki
artış gözle fark edilmedi), (3) kiremit "İL" → **beyaz** ve ayırıcı çizgiler kaldırıldı
(çizgi "İ"nin noktasını kesiyordu; harita zaten güçlü bir amblem, ikinci grafik öge
kalabalık ediyordu), (4) **2026-08-16: lacivert matlaştırıldı ve açıldı** — taban
`#29435C`→`#3B5268`, çukur `#203448`→`#304355`.

⚠ **Logonun laciverti artık `src/tema.js` ile birebir DEĞİL.** Dördüncü tur yalnızca ikona
uygulandı; oyun ekranındaki `ZEMIN` hâlâ eski koyu hâlinde. Bu **bilinçli bir ayrım değil,
bekleyen bir karar** — Baki "aynısı oyunda da olsun" derse `tema.js ZEMIN` değişecek.
Açılış zemini (`#1B2A38`) logodan koyu olduğu için splash karesinin kenarı hafif seçiliyor;
o da aynı kararın parçası.

⚠ Bir tasarım hatası daha ölçülüp düzeltildi: "SAVAŞLARI" alt kenara yapışıktı
(Ş'nin kuyruğu kırpılacaktı — %11 pay bırakıldı).

**Adaptif ikonda yazı YOK ve bu bilinçli:** Android ikonu daire/squircle olarak kırpıyor,
güvenli alan merkezdeki ~%66. "SAVAŞLARI" oraya sığdırılsa okunamayacak kadar küçülürdü.
Ön katmanda yalnızca amblem var; wordmark'ı mağaza listesi ve açılış ekranı taşıyor.

---

## 2. KOD UYUMU

### ✅ Kalite kapısı

`npm run kontrol` altı bölümde temiz: veri tutarlılığı, ESLint, biçim, çıplak renk kodu,
yazı okunurluğu (WCAG kontrast), **872 test** (2026-09-25).

### ✅ İzinler — en az düzeyde

Oyun **ağa hiç çıkmıyor**, konum/kamera/mikrofon/rehber istemiyor. Tek izin
`expo-haptics`'in eklediği **VIBRATE** ve o "normal" izin sınıfında — kullanıcıya sorulmaz,
Play'de açıklama gerektirmez.

**Bu senin en büyük avantajın:** veri toplamayan bir uygulamanın Play'deki bütün gizlilik
ve güvenlik formları tek satırlık.

### ✅ Çökme koruması

`src/bilesenler/HataSiniri.js` bir React hata sınırı: beklenmedik bir hata oyunu kapatmak
yerine ekranda tutuyor. Geliştirici modu kapalı olduğu için oyuncuya yığın dökümü
görünmüyor.

### ✅ Yayın ayarları

- `GELISTIRICI_MODU: false` — haritaya uzun basınca parça verme aracı **kapalı**
- `android.package` / `ios.bundleIdentifier`: `com.bayirbaki.ilsavaslari`
- `versionCode: 1` · `version: "1.0.0"`
- `eas.json` — üç profil: geliştirme · deneme · yayın (deneme **.apk**, yayın **.aab** üretiyor).
  2026-09-25: `channel` satırları kalktı — EAS Update (`expo-updates`) kurulu değil; ileride
  "mağazaya uğramadan güncelleme" istenirse ikisi birlikte eklenir.
  ⚠ `gelistirme` profili `expo-dev-client` ister ve o kurulu değil; ilk APK için **deneme**
  profili kullanılır (§6).
- `.easignore` — ~120 MB gereksiz dosya derleme sunucusuna gitmiyor (2026-09-25'te
  `veri/ham/` de eklendi: 39 MB ham harita kaynağı, uygulama okumuyor)
- ✅ **Kenardan kenara** (2026-09-25): `app.json`'daki `edgeToEdgeEnabled: false` kaldırıldı.
  SDK 54 o alanı yalnızca `true` olarak tanıyor, Android 16 kapatmaya izin vermiyor; kalsaydı
  Android 15 ve öncesinde oyun Expo Go'da hiç denenmemiş bir yerleşimle açılırdı
  (DENETIM-2026-09-23 ⚠4). Ekranlar güvenli alanı okuyor (`yonlendirme.js` notu).
- `npx expo install --check` (2026-09-25): yalnızca `expo` yama sürümü (54.0.36 → 54.0.37)
  ve geliştirme aracı `eslint-config-expo`. İkisi de derlemeyi engellemiyor.

### ⚠ Kayıt uyumluluğu

Kayıt sürümü **19**. Yayından sonra kayıt biçimini değiştirirsen sürüm numarasını
artırmalısın (`oyunDurumu.js KAYIT_SURUMU`), yoksa oyuncuların eski kayıtları sessizce
bozuk yüklenir. Bu kural CLAUDE.md'de zaten yazılı; yayın sonrası **daha kritik** hâle
geliyor çünkü artık senin dışında insanların kayıtları var.

---

## 3. TABLET VE TELEFON

### ✅ Tek kaynaktan ölçek

Karar tek yerde: `src/olcu.js` → **kısa kenar < 600 dp ise telefon**. 600 dp Android'in
kendi "küçük ekran / geniş ekran" sınırı. Ölçüt kısa kenar olduğu için ekran döndürülünce
karar değişmiyor.

**14 bileşen** bu ölçüyü kullanıyor ve telefonda ayrı stil uyguluyor (panel, tur çubuğu,
üretim/hareket/araştırma/diplomasi ekranları, onay kutuları…).

### ✅ Güvenli alan

`react-native-safe-area-context` kullanılıyor: çentik, yuvarlak köşe ve sistem tuşları
hesaba katılıyor. Yatay tutuşta sağ/sol çentik payı da uygulanıyor.

### ✅ Yatay kilit

Oyun yalnızca yatay açılıyor (`src/yonlendirme.js`). Play'de bu sorun değil — oyunlar
için beklenen bir davranış. Tablette de yatay açılıyor.

### ⚠ Play'in "geniş ekran" beklentisi

Google Play artık tabletlerde uygulamaların **ekranı doldurmasını** ve düzenin
ölçeklenmesini bekliyor; mağaza listesinde tablet ekran görüntüsü olmayan oyunlar
tablet aramalarında geri sıraya düşüyor.

Kod tarafı hazır (yukarıdaki iki madde). **Yapılacak:** mağaza listesine tablet ekran
görüntüsü eklemek (§5).

### ✅ Cihazda denendi — Expo Go'da

Baki oyunu Expo Go'da sürekli deniyor (Görev 20–21 boyunca her tur). Haritanın Skia'ya
geçişi, doğrudan hamle, hamle halkası, nehirler ve belge ekranları telefonda doğrulandı.

### ⛔ Gerçek kurulum dosyası (APK) HİÇ denenmedi

Expo Go ile gerçek kurulum üç yerde farklı davranıyor ve üçü de yalnızca APK'da görülür:

| Bakılacak | Neden Expo Go'da görünmüyor |
|---|---|
| **Tablette yatay kilit** | `android:appCategory="game"` (`eklentiler/oyun-kategorisi.js`) yalnızca derlemede işliyor; Android 16 tablette kilidi yalnızca oyunlar için tutuyor |
| **Kenardan kenara + gizli çubuklar** | Expo Go kendi etkinliğini çalıştırıyor; gizleme isteği orada her zaman tutmuyor |
| **Haritanın hızı** | Expo Go geliştirme kipinde; gerçek derleme daha hızlı olmalı — kare sayacı yalnızca geliştirmede görünüyor, gözle bakılır |

Ayrıca: yazı tipleri, ikon, açılış ekranı, otomatik kayıt (uygulamayı kapatıp aç), geri
tuşu, titreşim, eğitim.

⚠ **Baştan sona bir maç da hâlâ oynanmadı** (§5/1): `SANIYE_PER_TUR` ve zorluk ölçülmedi.

---

## 4. DİĞER DİKKAT EDİLMESİ GEREKENLER

### Play geliştirici hesabı

Google Play geliştirici hesabı **18 yaş** ve kimlik doğrulaması istiyor.
Ücret **tek seferlik 25 ABD doları**.

### ⛔ Yeni kişisel hesaplarda 12 test kullanıcısı şartı

Google, **yeni açılan kişisel geliştirici hesapları** için üretime çıkmadan önce
**kapalı test** şartı koyuyor: en az **12 test kullanıcısı**, **14 gün boyunca kesintisiz**
katılmış olmalı. Ancak ondan sonra üretim erişimi için başvurabiliyorsun.

**Bu takvimi baştan planla:** yayın düğmesine bastığın gün çıkmıyor, en az iki hafta
öncesinden 12 kişi bulman gerekiyor.

⚠ Bu kurallar değişebiliyor — hesabı açtığında Play Console'un sana gösterdiği güncel
şartları esas al.

### ✅ Gizlilik politikası — kısa olacak

Oyun veri toplamıyor, ağa çıkmıyor, hesap istemiyor. Politikan tek paragraf olabilir:
*"Bu uygulama hiçbir kişisel veri toplamaz, saklamaz veya paylaşmaz. Oyun kayıtları
yalnızca cihazınızda tutulur."* Bir URL'de yayınlanması gerekiyor (GitHub Pages bedava).

⚠ **Reklam eklediğin an bu değişir** — bkz. §7.

### ✅ İçerik derecelendirmesi

Soyut, kansız, siyasi olmayan bir strateji oyunu. Derecelendirme anketini dürüst
doldurduğunda düşük yaş sınırı çıkması beklenir. "Savaş" teması var ama şiddet
gösterimi yok.

⚠ Oyun Türkiye haritası ve gerçek il adları kullanıyor. Bu bir telif sorunu değil
(coğrafi olgular telifli değil, veri OSM'den ve atıflı) ama içerik derecelendirme
anketinde "gerçek olaylara dayanıyor mu" sorusuna **hayır** demelisin — bu kurgusal
bir strateji oyunu.

### ⚠ Uygulama imzalama anahtarı

Play App Signing kullan (Google anahtarı saklar). Kendi anahtarını üretirsen **kaybetmen
hâlinde uygulamayı bir daha güncelleyemezsin** — bu geri dönüşü olmayan bir hatadır.

---

## 5. SENİN YAPMAN GEREKENLER (sıralı)

| # | İş | Neden |
|---|---|---|
| 1 | **Bir maç oyna, sonunda saate bak** | İki soruyu birden kapatıyor: (a) denge ve titreşim değişti, testle ölçülemez; (b) `SANIYE_PER_TUR = 45` hiç ölçülmedi — projedeki tek açık ölçüm borcu bu (§3) |
| 2 | ~~Uygulama ikonu~~ | ✅ 2026-08-12'de üretildi |
| 3 | **Deneme APK'sı al, telefonda ve tablette dene** | §3'teki tablo — Expo Go'nun göstermediği üç şey (§6/0) |
| 4 | Play Console hesabı aç (25 $) | ✅ yaş sorunu yok, kendi adına |
| 5 | 12 test kullanıcısı + 14 gün kapalı test | Yeni hesap şartı ⛔ — en uzun süren iş, erken başla |
| 6 | Gizlilik politikası yayınla (bir URL) | Zorunlu |
| 7 | Mağaza görselleri hazırla | Zorunlu (Baki, 2026-09-25: "dursun şimdi") |

### Gereken görseller

| Görsel | Ölçü | Not |
|---|---|---|
| Uygulama ikonu | 512×512 PNG | Mağaza listesi |
| `assets/icon.png` | 1024×1024 PNG | Uygulamanın kendi ikonu |
| Adaptif ikon (ön/arka) | 1024×1024 | Android'in yuvarlak/kare kırpması için |
| Öne çıkan görsel | 1024×500 PNG | Mağaza başlığı |
| Telefon ekran görüntüsü | en az 2 adet | Yatay |
| **Tablet ekran görüntüsü** | en az 1 adet | Tablet aramalarında görünmek için |

---

## 6. YAYINLAMA ADIMLARI

```
0. Deneme APK'sı:     eas build --platform android --profile deneme
   (çıktı bir .apk bağlantısı — telefona ve tablete kurulur, Play'e gitmez)
1. Kendi adına Play Console hesabı aç, kimlik doğrula (25 $)
2. Uygulama oluştur: ad "İl Savaşları", kategori Oyun > Strateji
3. Derlemeyi al:      eas build --platform android --profile yayin
   (çıktı .aab dosyası — Play bunu ister, .apk değil)
4. Kapalı test kanalına yükle, 12 kişiyi davet et
5. 14 gün bekle (kesintisiz katılım şart)
6. Mağaza listesini doldur: açıklama, görseller, gizlilik URL'si
7. Veri Güvenliği formu: "veri toplanmıyor" (reklamsızken doğru)
8. İçerik derecelendirme anketi
9. Üretim erişimi için başvur → onaylanınca yayınla
```

**Derleme komutu için önce:** `npm.cmd install -g eas-cli` ve `eas login` (Expo hesabı,
ücretsiz). Derleme Expo'nun sunucusunda oluyor; bilgisayarda Android kurmak gerekmiyor.

⚠ İlk derlemede EAS sana bir **imzalama anahtarı** üretmeyi teklif eder — kabul et
(Play App Signing). Anahtarı kendin saklamaya kalkma.

---

## 7. REKLAM VE SATIN ALMA — OYUN TARAFI HAZIR, SDK YOK

Baki'nin isteğiyle (2026-08-12) reklam/ödül altyapısı `src/para/reklam.js` içinde
**kapalı bir anahtar** olarak duruyor — `sahne/ses.js` kalıbının aynısı.

**Bugün hiçbir şey yapmıyor, hiçbir ekranda görünmüyor, hiçbir SDK kurulu değil.**

Kırmızı çizgi Görev 19'da (2026-09-17) değişti: **üstünlük satılmaz, ikinci şans satılır.**
Dört ödül (yenilgiden dön · turu geri al · casus raporu · acil seferberlik) ve üç koruma
`src/para/odul.js`'te; reklam zamanlaması (8 tur + 5 dakika, ilk maç reklamsız)
`src/para/reklamZamani.js`'te. İkisi de testli (GOREV-19 Adım 1–3).

### Ne zaman bağlanır (2026-09-25)

Kalan iş üç parça ve üçü de **gerçek kurulum** ister — Expo Go'da hiç çalışmaz:

| Parça | Ne gerekiyor | Ne zaman denenebilir |
|---|---|---|
| Reklam (AdMob) | `react-native-google-mobile-ads`, AdMob hesabı (Baki, ücretsiz), rıza penceresi (Avrupa) | İlk APK'dan sonraki derlemede, Google'ın deneme reklamlarıyla |
| Satın alma (Komutan Paketi, çay) | Play Console'da ürünler + ödeme profili, fiyat kararı (Baki) | Yalnızca uygulama Play'in kapalı test kanalındayken |
| Gizlilik + Veri Güvenliği | Reklam kimliği toplanıyor → metin ve form yeniden | Reklamla aynı derlemede |

**Sıra:** ilk APK **parasız** alınır — oyunun gerçek kurulumda doğru çalıştığı ayrı görülsün;
bir sorun çıkarsa sebebi reklam kütüphanesi mi oyun mu diye aranmasın. Sonra 14 günlük
kapalı test sürerken reklam ve ödül düğmeleri bağlanır; yetişirse genel yayına girer,
yetişmezse v1.1 (GOREV-14 §9'un planı zaten buydu). Satın almalar Play Console'daki ürünlere
bağlı olduğu için onlar en sonda.

⚠ Reklam kütüphanesini "kapalı dursun" diye ilk APK'ya KOYMAK da iyi değil: kütüphane
açılışta kendiliğinden başlıyor ve reklam kimliği iznini ekliyor — oyun reklamsızken bile
"veri toplamıyoruz" demek zorlaşır.

⚠ **Reklam eklemek üç şeyi birden değiştirir:**
1. `expo-haptics` gibi değil — reklam SDK'sı **yerel kod** ister, Expo Go'da çalışmaz.
   Telefonda test etme şeklin **development build**'e döner.
2. Gizlilik politikan artık "veri toplamıyoruz" diyemez; AdMob cihaz tanımlayıcısı
   topluyor. Veri Güvenliği formu yeniden doldurulur.
3. Çocuklara yönelik içerik kurallarına dikkat etmen gerekir (yaş derecesine göre
   kişiselleştirilmiş reklam kapatılmalı).

**Öneri (güncel):** yukarıdaki sıra. İlk APK parasız, reklam kapalı testte.
