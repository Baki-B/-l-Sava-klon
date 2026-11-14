# GÖREV 08 — SES LİSTESİ (Baki'nin bulacağı dosyalar)

> # ⛔ İPTAL — 2026-08-12
>
> **Baki: *"Oyuna ses eklemeyeceğim."*** Bu listedeki 12 dosya **aranmayacak**. Sayfa
> silinmedi çünkü listenin kendisi bir tasarım kaydı: hangi anın hangi duyguyu taşıdığı
> burada yazılı ve o eşleme **titreşim katmanına** taşındı (`src/sahne/titresimDeseni.js`).
>
> Hissiyatın tamamı artık titreşimde. Ses katmanı kapalı bir anahtar olarak duruyor
> (`src/sahne/ses.js`, `SES_HAZIR = false`) — ayar menüsünde çalışmayan bir düğme yok.

> Tarih: 2026-08-01 · Görev: `docs/GOREV-08-hissiyat.md` / Adım 0, madde 5
> Soru 2'nin cevabı **A** (ses + titreşim). Titreşimi kod hallediyor; **ses dosyalarını
> kod üretemez.** Bu görevin tek dış bağımlılığı bu sayfa.

---

## 1. NE YAPMAN GEREKİYOR — üç adım

1. Aşağıdaki **12 sesi** bul (kaynak önerileri §4'te).
2. Her birini `assets/ses/` klasörüne, **tablodaki dosya adıyla** kaydet.
3. CC0 olmayan varsa §5'teki üç satırı doldur (künye için).

Klasör henüz yok; ilk dosyayı koyarken oluştur. Dosyaları koyduktan sonra bana "sesler
hazır" demen yeterli — bağlama işi Adım 3'te.

**Hepsini bulman şart değil.** Ses katmanı ayrı tutuluyor: eksik sesin yerinde sessizlik
olur, oyun çalışmaya devam eder. Bulabildiğini koy, gerisi sonra eklenir.

---

## 2. LİSTE

Öncelik sütunu, azsa neyi önce bulman gerektiğini söylüyor:
**1** = bunlar olmadan katmanın anlamı yok · **2** = belirgin fark · **3** = cila.

| # | Dosya adı | Ne sesi | Süre | Nerede çalar | Öncelik |
|---|---|---|---|---|---|
| 1 | `vurus-agir.mp3` | Top/obüs gürültüsü, tok patlama | 0.6–1 sn | Topçu-zırhlı ağırlıklı her muharebe raundu | **1** |
| 2 | `vurus-hafif.mp3` | Tüfek yaylımı, kısa çatışma | 0.4–0.8 sn | Piyade ağırlıklı her muharebe raundu | **1** |
| 3 | `fetih-il.mp3` | Zafer borusu / fanfar | 2–2.5 sn | **İl tamamlandığında** — oyunun en yüklü anı | **1** |
| 4 | `bozgun.mp3` | Dağılma: geri çekilme borusu, uğultu | 1–1.5 sn | Ordu bozguna uğrayıp kaçarken | **1** |
| 5 | `tur-acilisi.mp3` | Davul vuruşu ya da tok gong | 1–1.5 sn | "TUR 7" perdesi açılırken | **2** |
| 6 | `fetih-parca.mp3` | Kısa boru / tek davul | 0.6–1 sn | Bir parça el değiştirdiğinde (sık çalar, kısa olmalı) | **2** |
| 7 | `kayip-il.mp3` | Alçak, ağır: derin çan ya da koyu koro | 2–2.5 sn | **İl kaybedildiğinde.** Fetihin tersi — üzmeli | **2** |
| 8 | `imha.mp3` | Alçak, boğuk patlama | 0.6–1 sn | Ordu tamamen yok olduğunda | **2** |
| 9 | `duello.mp3` | Davul + boru: meydan okuma | 1.5–2 sn | Kutsal savaş başlarken (Kutsal Fındık Savaşı) | **2** |
| 10 | `yurus.mp3` | Bot sesi ya da paletli gürültüsü | 0.8–1.2 sn | Ordu haritada yürürken, emir oku çizilirken | **3** |
| 11 | `emir.mp3` | Kısa tık / kalem işareti | 0.1–0.2 sn | Emir verildiğinde (titreşimle birlikte) | **3** |
| 12 | `uyari.mp3` | Kısa, nazik ret sesi | 0.2–0.4 sn | Geçersiz emir, yetmeyen kaynak | **3** |

### Seçerken üç şeye dikkat

- **Kısa olsun.** Tablodaki süreler tavan değil hedef. Uzun ses, oynatımın süresini
  belirlemeye başlar ve tempo tuzağına (§4.4) sesten girmiş oluruz.
- **Baş tarafı sessiz olmasın.** Birçok ücretsiz dosyanın başında 0.2–0.3 sn boşluk var;
  vuruşla ses arasında gecikme olarak duyulur. Baştaki boşluğu kırpmak gerekirse söyle.
- **Tek atış olsun, döngü değil.** "battle loop", "war ambience" gibi uzun döngü sesleri
  bu listeye uymaz — arka plan müziği **Görev 09'a** bırakıldı.

---

## 3. BİÇİM

| | |
|---|---|
| Biçim | `.mp3` (`.m4a` de olur, `.wav` **olmaz** — çok büyük) |
| Kanal | Mono yeterli, stereo da sorun değil |
| Örnekleme | 44.1 kHz |
| Dosya boyutu | Her biri **≤ 150 KB** |
| Toplam | **≤ 1 MB** — paket boyutu Adım 3'te ölçülecek |
| Klasör | `assets/ses/` |
| Ad | Tablodaki adın **birebir aynısı** (küçük harf, Türkçe karakter yok) |

---

## 4. NEREDEN BULUNUR

- **Pixabay Sounds** — `pixabay.com/sound-effects` · üyelik gerekmeden indirilir,
  ticari kullanım serbest, atıf zorunlu değil. **En kolay yol, buradan başla.**
- **Freesound** — `freesound.org` · arama sonuçlarını **License: Creative Commons 0**
  ile filtrele. Filtresiz indirirsen atıf borcu doğar.
- **OpenGameArt** — `opengameart.org` · oyun sesleri için derlenmiş; lisans her dosyanın
  kendi sayfasında yazıyor, CC0 olanları seç.

**Arama için İngilizce terimler:** cannon fire · rifle volley · victory fanfare ·
military drum · retreat bugle · gong hit · marching boots · explosion muffled · error beep

> ⚠ YouTube'dan ses çekme, "telifsiz müzik" derleme videolarını kullanma. Oyun
> yayınlanacak (Görev 10) ve o videoların lisansı çoğu zaman belirsiz.

---

## 5. LİSANS KÜNYESİ

Projede kütüphaneler MIT/ISC, harita verisi OSM (ODbL) — ikisi de künyeye yazılı.
Sesler de aynı yere girecek.

**CC0 dosyalar için hiçbir şey yapman gerekmiyor.** CC-BY (atıf isteyen) bir dosya
indirdiysen üç şeyi not et, künyeye ben eklerim:

| Dosya | Kaynak (site + bağlantı) | Yapan kişi | Lisans |
|---|---|---|---|
| | | | |

---

## 6. SES DOSYASI OLMADAN NE OLUYOR

Adım 3 iki katmanı birden getiriyor: **titreşim** ve **ses**. Titreşim dış bağımlılık
değil, hemen çalışır — emir verince hafif tık, fetihte ağır darbe, bozgunda çift titreşim.

Yani sesler gecikse bile Adım 3 cihazda denenebilir ve **tek başına titreşimin ne kadar iş
yaptığını** görürsün. Bu bilinçli bir sıra: yeterli gelirse sonraki katmanların dozu ona
göre azalır.
