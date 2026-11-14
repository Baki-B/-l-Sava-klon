# GÖREV 19 — PARA ALTYAPISI

> Tarih: **2026-09-20** · Kaynak kararlar: `docs/GOREV-14-komutan-para-ve-cok-oyunculu.md`
> §5–6, plan: `docs/YOL-HARITASI-v11.md` §19.
>
> ⚠ **GÖREV 16 YARIM BIRAKILDI** (Baki'nin kararı, 2026-09-20): komutan motoru ve rütbe
> hazır, ama yetenekler (Adım 5), komutan ekranı (Adım 6) ve ölçüm (Adım 7) beklemede.
> Komutan şu an yalnızca botlarda çalışıyor; oyuncu onu göremiyor.

---

## 0. ⚠ İKİ KAPI — BUNLAR OLMADAN BİTMEZ

| Kapı | Ne gerekiyor | Kim yapar |
|---|---|---|
| **1. Expo Go biter** | Reklam ve satın alma SDK'ları YEREL KOD içeriyor. Telefonda test etmek için `eas build --profile gelistirme` ile development build alınmalı | Baki (EAS hesabı) |
| **2. Play Console hesabı** | Uygulama içi ürünler (Komutan Paketi, çay) Play Console'da tanımlanmadan TEST EDİLEMEZ. AdMob için de uygulama kimliği gerekiyor | Baki (25 $ hesap) |

**Kapılardan ÖNCE yapılabilecek her şey önce yapılıyor** (§2'deki Adım 1–2): ödüllerin oyun
tarafı, sayaçlar, mühürler ve reklam yerleşim kuralları SDK'sız yazılabiliyor. Böylece
kapılar açıldığında kalan iş yalnızca "SDK'yı bağla".

Ayrıca kapı 1 açıldığında **gizlilik politikası ve Play Veri Güvenliği formu yeniden
yazılır**: AdMob cihaz tanımlayıcısı topluyor, oyun artık "veri toplamıyor" diyemez
(`docs/YAYIN-KONTROL.md` §7).

---

## 1. KURAL DEĞİŞİKLİĞİ: "ÜSTÜNLÜK SATILMAZ"

Eski çizgi (`src/para/reklam.js`, tasarım §12.4): *"reklamın ödülü asla oyun içi güç
olmamalı."* Baki 2026-09-17'de bunu oyuncu gözüyle reddetti:

> *"Tur analizi, savaşı tekrar izleme, gösteriyi hızlandır… bunlar reklam izlemeye değecek
> şeyler değil gibi geldi bir oyuncu olarak. Ödüllü reklamları tek oyunculuk botlara karşı
> olan sürümde turu geri alabilme vs. gibi oyunumuza uygun şeyler kazandıracak şekilde
> revize etmek iyi olur."*

**Yeni çizgi: ÜSTÜNLÜK satılmaz — İKİNCİ ŞANS satılır.** Ödül kalıcı güç vermiyor; hata
yapan oyuncuya hatasını düzeltme imkânı veriyor. Üç koruma:

1. **Yalnızca tek oyunculu (botlara karşı) maçlar.**
2. **Maç başına sınır** (`DENGE.ODUL.MAC_BASINA`), yani "reklam izle, sonsuz geri al" yok.
3. **Meydan okumada ve derecelide tamamen kapalı** — orada herkesin aynı şartlarda olması
   ölçümün kendisi.

Karşılığı da var: **TEMİZ ZAFER** (hiç ödül kullanmadan kazanmak) ve **KİRLİ ZAFER**
(ödülle kazanmak) mühürleri. Kirli Zafer bir ceza değil, gülümseten bir kayıt.

---

## 2. ADIMLAR

| Adım | İş | Kapı gerekiyor mu |
|---|---|---|
| ✅ **1** | **Ödül motoru:** `src/para/odul.js` — dört ödülün kuralı, maç başına sayaç, mod kısıtı + `DENGE.ODUL` + testler | Hayır |
| ✅ **2** | **Ödüllerin oyun tarafı:** turu geri al ve yenilgiden dön için anlık görüntü zinciri (bellekte), casus raporu, acil seferberlik; Temiz/Kirli Zafer mühürleri | Hayır |
| ✅ **3** | **Reklam yerleşimi:** ara reklam sayacı (en az 8 tur VE 5 dakika), ilk maç reklamsız, maç sonu reklamı — hepsi SDK'sız, anahtar kapalı | Hayır |
| **4** | **AdMob SDK** bağlanır, `REKLAM_HAZIR` açılır | **Kapı 1 + 2** |
| **5** | **Satın almalar:** Komutan Paketi (kalıcı), çay (tüketilebilir), sahiplik kaydı | **Kapı 1 + 2** |
| **6** | **Gizlilik politikası + Veri Güvenliği formu** yeniden yazılır, çocuk içeriği ayarı | **Kapı 2** |

---

## 3. ADIM 1 — ÖDÜL MOTORU

### 3.1 Dört ödül

| Anahtar | Ne yapar | Niye "ikinci şans" |
|---|---|---|
| `yenilgidenDon` | "Kaybettin" ekranından üç tur öncesine döner | Maçı bitiren hatayı geri alır, yeni güç vermez |
| `turuGeriAl` | Son turun başına döner | Yanlış emri düzeltir |
| `casusRaporu` | Bir rakibin ordusunu ve araştırmasını gösterir | Bilgi verir, birlik vermez |
| `acilSeferberlik` | Bir tur üretim sınırını aşar | En sınırda olan ödül: tek turluk, kalıcı değil |

### 3.2 Üç kapı, tek yerde

`odulKullanilabilirMi` üç şeyi birden sınıyor: **mod** (meydan okuma/dereceli kapalı),
**sayaç** (maç başına sınır) ve **ödülün kendisi** (tanımlı mı). Ekran da motor da aynı
fonksiyondan geçiyor — "ekranda görünüyor ama çalışmıyor" ayrışması olmasın.

### 3.3 Sayaç maçın içinde

Kullanım `durum.sayaclar.odul` altında tutuluyor: maç sayaçlarının yanında, kayda giriyor
ve maç bitince ölüyor. Mühürler (TEMİZ/KİRLİ ZAFER) bu sayaca bakacak.


---

## 4. ADIM 1 NOTLARI (2026-09-20)

Yazılanlar: `DENGE.ODUL` (maç başına 3 kullanım · yenilgiden 3 tur geri · kapalı modlar) ·
`src/para/odul.js` (dört ödül, üç koruma, sayaç) · `durum.sayaclar.odul` ·
`testler/odul.test.js` (10 test). Eski kırmızı çizgi iki yerde birden güncellendi:
`src/para/reklam.js` ve tasarım §12.4 — ikisi ayrışmasın diye eski metin tarih kaydı
olarak bırakıldı.

### ⚠ YEDİ MÜHRÜN HİÇ KAZANILAMADIĞI ORTAYA ÇIKTI

`basarimlar.js` maçın sonucunu `durum.sonuc.sonuc === 'kazandi'` diye okuyordu; oysa
`durum.sonuc` bir **METİN** ('kazandi' | 'yenildi' — `turDongusu.js` öyle yazıyor). Yani
`b.kazandi` bayrağı **hiç true olmadı** ve onu isteyen **yedi mühür** kazanılamıyordu:
Zafer Yolu · Kansız Zafer · Tek Parçadan · Zorlu Zafer ve üç kardeşi.

Sinsiliği klasik: hiçbir yerde hata çıkmıyor, mühürler sadece hiç gelmiyor. Üstelik
Görev 16 / Adım 3'ün rütbe merdiveni bu mühürlere dayandığı için **tavan puan fiilen
ulaşılamazdı** ve Mareşal unvanı imkânsızdı. Tek satırla düzeltildi.

**Ders:** `durum.sonuc` metin; nesne sanan her okuma sessizce false döner. `odul.js` aynı
tuzağa düşmesin diye kural yorumda yazılı.


---

## 5. ADIM 2 VE 3 NOTLARI (2026-09-20)

> Baki'nin isteğiyle iki adım birlikte yapıldı (CLAUDE.md §7'nin "adımlar birleştirilmez"
> kuralı bu kez bilinçli olarak esnetildi).

### Adım 2 — ödüllerin oyun tarafı

| Ödül | Nerede yaşıyor | Kayda giriyor mu |
|---|---|---|
| `turuGeriAl` · `yenilgidenDon` | Kancada bir **anlık görüntü zinciri** (`useRef`), son `GERI_TUR` turun başlangıcı | **Hayır** — 3 × ~22 KB kayıt sınırını deldirirdi; oyun kapanınca hak düşer |
| `casusRaporu` | `durum.casus` — rakip maç boyunca görünür olur | Evet |
| `acilSeferberlik` | `durum.seferberlikTuru` — o tur sınır `EK_SANAYI` (3) kadar açılır | Evet |

**Üç tasarım kararı:**
1. **Sayaç geri sarılmaz** (`sayaciTasi`). Geri alınan durumda ödül sayacı eski hâlindeydi;
   olduğu gibi bırakılsa ödül kendi bedelini siler ve sınırsız geri alma doğardı. Aynı
   fonksiyon casus raporunu da taşıyor: ödülle alınan bilgi geri dönünce kaybolmaz.
2. **Seferberlik sınırı kaldırmıyor, genişletiyor** (+3). Kaldırmak parası olanı tek turda
   ordu fabrikasına çevirirdi.
3. **Seferberlik yalnızca oyuncuya.** Botlar reklam izlemiyor; zekâya verilmesi ayrı bir
   karar ve ayrı bir ölçüm olur.

**İki yeni mühür:** TEMİZ ZAFER (altın · hiç ödül kullanmadan kazan) ve KİRLİ ZAFER (bronz
· yardım alarak kazan — *"Zafer zaferdir"*). Mühür sayısı **33 → 35**, rütbe tavanı
71 → **75 puan**; Orgeneral eşiği (65) hâlâ testin %80–97 bandında.

### Adım 3 — reklam yerleşimi (SDK YOK, KURAL VAR)

`src/para/reklamZamani.js` yalnızca "şimdi gösterilebilir mi" sorusunu cevaplıyor:

- **İki şart birden:** en az **8 tur** VE en az **5 dakika**. Tek başına tura bakılsa hızlı
  oynayan üç dakikada iki reklam görürdü; tek başına süreye bakılsa tur ortasında reklam
  yerdi.
- **Maçın ilk 8 turu reklamsız** (sayaç sıfırdan başlıyor): maça reklamla başlamak ilk
  izlenimi harcamanın en hızlı yolu.
- **İlk maç tamamen reklamsız.**
- **Maç sonu reklamı tur sınırına takılmaz** — orası doğal bir durak.
- **Komutan Paketi** her ikisini de kapatıyor.

⚠ **Kancaya bağlanmadı ve bu bilinçli:** reklam gösterecek bir SDK yokken tur perdesine
sayaç koymak ölü kod olurdu. Kural + testler hazır; Adım 4'te SDK gelince bağlanacak.

Testler: `odul.test.js` (12) · `odulEtki.test.js` (9) · `reklamZamani.test.js` (8).
Kontrol altı bölüm temiz, **750 test**.
