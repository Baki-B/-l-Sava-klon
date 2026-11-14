# HARİTA HIZ ÖLÇÜMÜ — EKRAN KARTIYLA, TELEFONUN YÜZEY AYARLARIYLA

> Ölçüm: `onizleme/harita-hiz.html` (tarayıcıda, CanvasKit + WebGL) · 2026-09-23 · görev:
> `docs/GOREV-20-sezgi-ve-akicilik.md` §10 (Adım 3b)
> Maç: `scripts/harita-skia-onizleme.js`'in ürettiği maç (Türkiye, tohum 7, 15. tur) ·
> ekran 915×412 dp, yoğunluk 2.625 (2402×1082 piksel) · bilgisayar: Intel UHD (tümleşik).
> Yüzey telefondaki gibi: **çoklu örnekleme yok, şablon tamponu yok** (react-native-skia'nın
> Android yüzeyi — `OpenGLWindowContext.cpp`, `gl/Display.h`).

## Neden bu ölçüm

Baki telefonda ilk Skia haritası için *"30 fps gibi, takılmalar var"* dedi; sayaç 40–60
kare/sn gösteriyordu. Bilgisayar işlemcisindeki önizleme (`harita-skia-olcum.md`) bunu
yakalayamazdı: Skia'nın hangi yoldan çizdiğine yüzeyin ayarları karar veriyor. Bu ölçüm
ekran kartıyla ve telefonun yüzey ayarlarıyla yapıldı.

## 1. Kare süresi — ortanca (parantezde en kötü %5)

Her kamera yolu 90 kare (ısınmadan sonra). Kare = kaydet + oynat + ekran kartının bitirmesi.

| Kamera yolu | İlk Skia sürümü | **Yeni** | Yeni, dolgu yumuşatmalı | Yeni, çizgi Skia yolu |
|---|---:|---:|---:|---:|
| kaydırma 1× (bütün harita) | 74.3 ms (80.2) | **3.2 ms** (6.8) | 16.1 ms (19.1) | 36.3 ms (50.0) |
| kaydırma 1.8× (il rozetleri) | 42.2 ms (57.8) | **6.1 ms** (13.4) | 8.0 ms (21.8) | 33.0 ms (40.9) |
| yakınlaştırma 0.9→7× (İstanbul) | 44.4 ms (70.8) | **3.0 ms** (9.7) | 6.6 ms (13.9) | 22.5 ms (54.3) |
| kaydırma 4× (parça rozetleri) | 42.0 ms (50.6) | **5.7 ms** (15.2) | 10.7 ms (15.3) | 24.7 ms (30.5) |
| kaydırma 7× (en yakın) | 22.4 ms (28.9) | **3.3 ms** (12.5) | 5.5 ms (12.6) | 15.2 ms (20.2) |

**Yeni harita ilk Skia sürümünden 7–23 kat hızlı.** Son iki sütun kararların gerekçesi:
dolguyu yumuşatmak ya da çizgiyi Skia'nın yol çizgisiyle çizmek kazancın çoğunu geri alıyor.

## 2. Yeni haritanın katmanları (ortanca)

| Kamera yolu | Dolgu | Sınır çizgisi | Rozetler | Seçim vurgusu |
|---|---:|---:|---:|---:|
| kaydırma 1× | 0.8 ms | 1.8 ms | 0.1 ms | 0.1 ms |
| kaydırma 1.8× | 0.6 ms | 2.6 ms | 0.1 ms | 0.1 ms |
| yakınlaştırma 0.9→7× | 0.3 ms | 1.2 ms | 0.1 ms | 0.1 ms |
| kaydırma 4× | 0.3 ms | 2.9 ms | 0.1 ms | 0.1 ms |
| kaydırma 7× | 0.2 ms | 2.1 ms | 0.1–3.2 ms¹ | 0.0 ms |

¹ Tek başına ölçülünce 0.1–0.3 ms; düzenekteki ortanca tarayıcının kendi işini de içeriyor.

## 3. İlk sürüm neden yavaştı (ölçülen paylar, bütün harita görünürken)

| Katman | İlk sürüm | Sebep |
|---|---:|---|
| Sınır çizgileri | 31 ms | Kenarı yumuşatılmış karmaşık yol: Skia her karede işlemcide maske çizip yüklüyor |
| Rozetler | 6.4 ms | 81 kalkan × 6 yumuşatılmış şekil + yazı, her karede |
| Dolgu (yumuşatmalı) | +17 ms | Aynı sebep; yumuşatmasız dolgunun üçgenleri bir kez hesaplanıp saklanıyor (0.6 ms) |
| JavaScript (kareyi kaydetmek) | 2 ms | ~2.500 çağrı; telefonda bu kat kat pahalı (yorumlanan JS + köprü) |

Denenip bırakılanlar (aynı düzenekte): kıl inceliğinde çizgi, `drawPoints` düz çizgi,
parçalara bölünmüş yol çizgisi, önceden kalınlaştırılmış yol, vektör rozetin sadeleştirilmiş
hâlleri (en iyisi 1.6–2.8 ms — resim sayfası 0.1–0.3 ms).

## 4. Hazırlık (JS iş parçacığı, bilgisayarda)

| İş | Ne zaman | Süre |
|---|---|---:|
| Dört seviyenin yolları + çizgi noktaları | uygulama başına bir kez (önbellek) | 369 ms |
| Çizgi şeritleri (572 grup) | maç başına, önbellekte | 88 ms |
| 16 bandın çizgi resmi | maç başına / il sınırı açılıp kapanınca | 10 ms |
| Dolgu resimleri | sahiplik değişince | 2 ms |
| Vurgu resimleri | seçim değişince | 3 ms |
| Rozet resim sayfası | yazı tipi yüklenince | 5 ms |
| Rozet resimleri | ordular değişince | 6 ms |

Telefonda JavaScript yorumlanarak çalışıyor: bu süreler birkaç katına çıkar. En ağırı
(yollar) ilk Skia sürümünde de vardı; şeritler yeni ve maçlar arası önbellekte.

## 5. Süsler (Görev 20, 2026-09-24): kıyı gölgesi, dağ, tepe, dalga

`onizleme/harita-hiz.html` → "yeni, süssüz" / "yeni" / "yalnız süs" (aynı bilgisayar, aynı
ekran kartı: Intel UHD, örnekleme 0, şablon 0). Ortanca, parantezde en kötü %5:

| Kamera yolu | süssüz | süslü | yalnız süs |
|---|---:|---:|---:|
| kaydırma 1× (bütün harita) | 3.7 ms (4.8) | 4.3 ms (7.0) | 0.2 ms (0.2) |
| kaydırma 1.8× (il rozetleri) | 5.2 ms (6.8) | 6.1 ms (7.5) | 1.2 ms (3.3) |
| yakınlaştırma 0.9→7× (İstanbul) | 2.2 ms (6.6) | 3.8 ms (8.6) | 1.0 ms (3.9) |
| kaydırma 4× (parça rozetleri) | 5.7 ms (6.5) | 6.6 ms (7.9) | 1.7 ms (4.2) |
| kaydırma 7× (en yakın) | 3.7 ms (6.7) | 4.6 ms (8.0) | 1.3 ms (3.7) |

Süsler karede +0.6–1.6 ms. 574 dağ, 304 tepe, 365 dalga — hepsi şerit (tek çağrı) ve düz
üçgen; kıyı gölgesi tek bir resim. İlk denemede kıyı gölgesi de 6 birimlik şeritti:
hızlıydı ama girintili kıyıda dikenler çıktı (§ `haritaCizim.js` SÜSLER notu).

## 6. Görev 21 (2026-09-24): hamle halkası, cephe hattı, başkent yıldızı, birlik figürleri

`onizleme/harita-hiz.html` → "yeni, Görev 21 yok" / "yeni" / "yeni, en ağır" / "yalnız Görev 21"
(aynı bilgisayar ve ekran kartı: Intel UHD, örnekleme 0, şablon 0). Nefes her karede başka
parlaklıkta çiziliyor (telefondaki gibi). Ölçüm gürültülü (makine ısındıkça bütün sütunlar
yavaşlıyor); karşılaştırma YAN YANA sütunlar arasında. Son koşu, ortanca (en kötü %5):

| Kamera yolu | Görev 21 yok | yeni | en ağır | Görev 21 yok | yeni | en ağır |
|---|---:|---:|---:|---:|---:|---:|
| kaydırma 1× | 4.3 (6.7) | 4.1 (7.1) | 6.7 (8.6) | 5.7 (12.6) | 5.1 (7.5) | 6.8 (10.2) |
| kaydırma 1.8× | 6.8 (8.9) | 6.7 (10.2) | 9.5 (12.7) | 8.7 (15.3) | 7.4 (11.5) | 9.8 (12.5) |
| yakınlaştırma 0.9→7× | 3.5 (9.4) | 4.0 (8.6) | 5.1 (9.2) | 5.5 (13.5) | 4.8 (9.7) | 5.5 (8.4) |
| kaydırma 4× | 6.8 (9.2) | 6.9 (8.9) | 9.1 (11.5) | 8.8 (14.7) | 8.0 (10.8) | 9.6 (12.2) |
| kaydırma 7× | 4.4 (7.0) | 5.0 (8.4) | 5.4 (11.1) | 5.9 (12.0) | 6.0 (8.3) | 5.1 (10.5) |

- **Gerçek maç** (4 halkalı ordu, 7 cephe hattı, 81 yıldız): fark gürültünün içinde (±0.5 ms).
  Katmanlar tek başına ("yalnız Görev 21", ilk koşu): 0.3–0.6 ms.
- **En ağır hâl** (bütün ordular halkalı, iki ayrı sahip arasındaki 400 hattın hepsi cephe —
  gerçek maçta olmaz): +1–2.7 ms, ortanca en çok 9.8 ms (60 kare sınırı 16.6).
- Ekran kartıyla çizildiği pikselden doğrulandı: en ağır hâlde karenin %3.3'ü cephe kırmızısı.
- **Hazırlık**: cephe 7 hat 0–7 ms, 400 hat 211 ms (bilgisayar; telefonda birkaç katı).
  Cephe her fetihte yeniden kuruluyor — çok uzun bir cephede fetih anında kısa bir takılma
  olabilir. Gerekirse: hat başına şerit ve dişleri önbelleğe almak.
- **NEFES PİLİ**: halkalı ordu varken ve harita açıkken harita saniyede ~20 kez yeniden
  çiziliyor (`DENGE.ROZET.NEFES_ADIM`); bu bilgisayarda kare ~5–7 ms, yani boşta ekran
  kartının ~%10–15'i. Üstte bir ekran açıkken ya da halkalı ordu yokken durur.

### 6b. Nehirler ve göller eklendikten sonra (aynı gün)

"Görev 21" katmanlarına nehir + göl de girdi. Ortanca (en kötü %5), aynı bilgisayar:

| Kamera yolu | Görev 21 yok | yeni | yalnız Görev 21 | Görev 21 yok | yeni |
|---|---:|---:|---:|---:|---:|
| kaydırma 1× | 3.7 (4.9) | 4.2 (6.4) | 0.6 (1.4) | 4.5 (6.9) | 4.2 (6.4) |
| kaydırma 1.8× | 5.9 (9.0) | 6.5 (10.1) | 0.4 (1.4) | 6.5 (10.3) | 6.3 (10.6) |
| yakınlaştırma 0.9→7× | 3.6 (10.8) | 3.9 (9.8) | 0.4 (0.7) | 3.7 (9.4) | 3.7 (9.2) |
| kaydırma 4× | 6.5 (8.7) | 7.5 (9.9) | 0.4 (0.7) | 6.7 (8.7) | 7.0 (8.8) |
| kaydırma 7× | 4.3 (6.6) | 5.3 (7.9) | 1.0 (4.1) | 4.3 (7.1) | 5.2 (7.5) |

Görev 21'in bütün katmanları tek başına 0.4–1.0 ms; tam karede fark 0–1 ms. Nehir ve göl
hazırlığı maç başına ~6 ms (bilgisayar).

## Okuma

- Mutlak süreler bu bilgisayarın; telefon farklıdır. Karşılaştırma aynı bilgisayarda iki
  çizim arasında yapılır. Telefondaki asıl ölçüm geliştirme kipindeki kare sayacı
  (`src/bilesenler/KareSayaci.js`).
- Tarayıcıdaki WebGL, telefonun doğrudan OpenGL'inden daha yavaş yükleme yapıyor; ilk
  sürümün 42–74 ms'si telefonda 17–25 ms'ye (Baki'nin gördüğü 40–60 kare/sn) karşılık geliyor.
  Aynı oranla yeni harita telefonda ~1–2 ms bekleniyor.
