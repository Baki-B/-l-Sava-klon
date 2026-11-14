# ANA MENÜ — KESİNLEŞEN TASARIM

> Tarih: 2026-08-03 · Karar veren: Baki · Onay: cihazda değil, önizlemede
> Önizleme: `onizleme/ana-menu-final.html`
>
> Bu belge **karar** belgesidir. Uygulama yazılırken buraya bakılır; tartışma kapandı.
> Yolun tamamı (4 tema → 12 renk çeşidi → 17 olgunlaştırma fikri → savaş teması turları)
> `veri/URETIM-NOTU.md`'de.

---

## 1. TEMEL

| Karar | Değer |
|---|---|
| Oyunun adı | **İL SAVAŞLARI** (her yerde. "İl Savaşı" YANLIŞ) |
| Tema | Tema 1 · **Geopolitik Odak** — ortada panel, arkada harita |
| Renk çeşidi | **1A · Ege** |
| Menü dili | **Komuta dili** (aşağıda) |

## 2. RENKLER

| Rol | Değer | Not |
|---|---|---|
| Deniz | `#7FA6C4` | Merkezde açık, kenarda koyu (radyal geçiş, `#22405C`e %55) |
| Kara (taban) | `#DDE4D8` | Üstüne il rengi %62 karışıyor |
| Panel | `#31506E` | %90 opak — harita panelin arkasından hafifçe seçiliyor |
| Panel yazısı | `#F2F7FA` | Panele karşı **7.8:1** |
| Panel ikincil | `#BFD2E0` | Köşe parantezleri, alt yazı |

**Kural:** panel koyu ama NÖTR DEĞİL — kendi tonu (lacivert) var. Baki'nin ilk itirazı
"panel koyu kaçmış, net bir tona sahip olsun" idi.

## 3. HARİTA

- **181 parça mozaiği** (81 il değil). Her parça kendi ilinin renginde: `askeriTon(renkIl)`
  tabana %62 karıştırılmış.
- **Kıyı halesi:** dış hattın 16/11/7/4 kalınlıkta, artan opaklıkta kopyaları — kara dolgusu
  üstlerine bindiği için yalnızca dış yarıları görünüyor.
- **Kıyı çizgisi:** dış hat, panel renginin %15 siyaha karışmışı, 1.6 birim.
- **Ülke dış hattı** `veri/turkiye-hat.json`'dan (81 ilin birleşimi).
- **Gren:** tüm ekrana %10 gürültü.

**YOK:** pusula · pafta kenarlığı · enlem/boylam ızgarası · il adları · deniz taraması ·
vinyet · arazi tonları.

## 4. PANEL

- Genişlik ekranın **%33'ü**, ortada, köşe yarıçapı 10.
- **Köşe parantezleri** — dört köşede L şeklinde, 18 birim, ikincil renkte.
- Başlık **İL SAVAŞLARI**, altında **"81 İL · BAĞIMSIZ · SAVAŞ HÂLİNDE"**, altında ayraç.
- Menü ortalanmış, dikey.

**YOK:** panel gölgesi · başlıkta mühür · satır ayraçları · alt bilgi satırı · sıcak seçili satır.

## 5. MENÜ DİLİ

```
SEFERE DEVAM · YENİ SEFER · HAREKÂT ARŞİVİ · KOMUTA AYARLARI
```

Baki'nin savaş teması turunda beğendiği tek şey buydu: *"yalnızca kelimeleri değişmek güzel."*

## 6. FETİH DÖNGÜSÜ ⭐

Ana menünün savaş hissini veren asıl öğesi. **Üç güç haritayı paylaşıyor.**

### Kural seti (Baki)
- Güçler: **Bursa (16) · Antalya (07) · Erzurum (25)**
- Her tur, her güç **komşusu olan TÜM parçaları** fethediyor
- **Birbirlerinin parçalarına dokunmuyorlar**
- Harita paylaşılınca döngü bitiyor

### Beraberlik kuralı (eklendi)
Bir parçaya aynı turda iki güç birden ulaşabiliyor. Beraberliği **sabit sıra** bozuyor:
**Bursa → Antalya → Erzurum**. Rastgelelik KULLANILMIYOR — sefer her açılışta birebir aynı
gitmeli, yoksa tekrar bakan oyuncu "bir şeyler bozuk" hisseder.

### Sonuç (haritadan çıkan, elle ayarlanmamış)
- **7 tur**
- Tur başına alınan parça: **26 / 37 / 36 / 34 / 25 / 10 / 1**
- Son dağılım: Bursa **56** · Antalya **54** · Erzurum **71**
  (Erzurum kazanıyor çünkü doğu daha az bölünmüş: büyük parçalar, az rakip)

### Zamanlama
| | Süre |
|---|---|
| Başlangıç beklemesi ("81 il bağımsız" okunsun) | **1.8 sn** |
| Her tur | **1.2 sn** |
| Fetihler bitince bekleme (bitmiş harita görülsün) | **2.4 sn** |
| Geçiş (erime) | 0.26 sn |
| **Toplam döngü** | **11.4 sn** |

Oyuncu ana ekranda ~20 saniye durur; döngü iki kez dönüyor.

### Fetih anı
O turda el değiştiren parçalar **0.85 sn** parlayıp sönüyor. Bu olmadan değişim fark
edilmiyordu — göz "ne değişti" diye sorunca cevap veriyor.

### Cephe (G3 + G6 birleşimi)
Dişli sınır **sabit değil**: her turda **komşusu farklı sahipte olan parçalar** yeniden
hesaplanıyor ve dişli konturla çiziliyor. Üç blok büyüdükçe cephe kendiliğinden içeri
kayıyor, sonda üç güç arasındaki iki hatta iniyor.

- İç parça: 0.4 birim kontur, %16 opaklık
- Cephe parçası: 1.0 birim düz kontur (%75) + 3.2 birim kesik kontur (%45)

### Sınır çizgilerinin rengi: SİYAH (Baki, 2026-08-03)

Onaylanan önizlemede cephe konturları `#1d30NaN` / `#1928NaN` ile çiziliyordu — renk
karıştırıcı üç haneli hex'i anlamadığı için mavi kanal `NaN` çıkmıştı ve tarayıcı geçersiz
rengi **siyaha** düşürüyordu. Yani Baki'nin gördüğü çizgiler tasarlanan koyu mavi değil,
siyahtı.

Hata anlatıldı, Baki **siyahı seçti**: *"dişli sınır çizgileri siyah olsun, mod ekranındaki
maviymiş onu da düzelt siyah yap."* Yani siyah artık kaza değil **karar** — ve mod
ekranındaki parça sınırları da (önizlemede `#253c53` / `#31506E` maviydi) siyaha çevrildi.

Kodda tek jeton: `MENU_RENK.sinir`. Ayrımı **kalınlık ve opaklık** yapıyor, renk değil.
Kıyı çizgisi bu karara dahil DEĞİL — o `#2A4460` kaldı.

### ⚠ CEPHE TARİFİ DEĞİŞTİ (Baki, cihazda — 2026-08-03)

Yukarıdaki "dişli kontur" tarifi ve iç parça / cephe parçası ayrımı **uygulanmıyor**.
Baki cihazda görünce iki düzeltme verdi:

1. **Dişli (kesik) çizgi yok.** *"Dişli sınır diyince dişler eklemişsin, onu boşver."*
2. **Koyu çizgi parçanın çevresi değil, yalnızca DÜŞMAN kenarı.** Cephedeki parçanın
   kendi tarafına bakan kenarları koyu ÇİZİLMEZ. Koyu çizgi, iki yakası farklı sahipte
   olan **paylaşılan kenara** çizilir (`veri/parca-kenarlari.json` +
   `MenuHaritasi.koyuKenarYolu`).

Silik parça sınırı (0.4 birim, %16) duruyor — mozaiği o gösteriyor. Koyu düşman kenarı
1.0 birim, %75. İkisi de siyah.

### "CEPHEYE DÖN" KALDIRILDI (Baki, 2026-08-03)

Menünün beşinci satırıydı (sürmekte olan maç varken çıkıyordu). Baki: *"ana menüde
cepheye dön gereksiz... sefere devam aynı mantığa gelicek zaten."* Yerine: ana menüye
**her dönüş kayıt sorusundan geçiyor** (KAYDET VE ÇIK / ÇIK / VAZGEÇ) — böylece menü
açıkken sürmekte olan maç ya kaydedilmiş ya bilerek bırakılmıştır ve geri yol her zaman
SEFERE DEVAM. Menü satırı DÖRT, sabit.

---

## 7. UYGULAMA NOTU (kod yazılırken)

**Telefonda ucuz olmalı.** Kare kare çizim YOK:
- Sekiz durum (tur 0–7) **önceden hesaplanır**, kayda/çalışma anına bağlı değil
- Aralarında yalnızca **opaklık geçişi** var — `reanimated` ile tek paylaşılan değer
- Harita geometrisi bir kez kurulur; `React.memo` ile jest/tazeleme sırasında yeniden
  kurulmaz (CLAUDE.md §6 — türetilmiş nesne kimliği)
- Simülasyon üretim zamanında yapılıp `veri/`ye yazılabilir; çalışma anında 181 parçalık
  yayılma hesabı yapmaya gerek yok

**Renkler `tema.js`'e girer**, bileşene çıplak yazılmaz (`npm run kontrol` 4. bölüm).

---

# MOD SEÇME EKRANI — KESİNLEŞEN TASARIM

> Tarih: 2026-08-03 · Önizleme: `onizleme/mod-ekrani.html`

Ana menünün **teması ve kuralları birebir taşındı**: aynı palet, aynı deniz geçişi, aynı
kıyı halesi, aynı 181 parça mozaiği, aynı köşe parantezleri, aynı gren.
**Arka harita durağan** — fetih döngüsü ana menüde kalıyor; burada oyuncu karar veriyor.

## Kartlar

Üç kart **yatay**, **ekranın ortasında**.

| Ölçü | Değer |
|---|---|
| Kart genişliği | **196** (ilk denemede 232 idi, haritayı fazla kapatıyordu) |
| Kart yüksekliği | 178 |
| Üst kenar (`ky`) | 100 |
| Kartlar arası boşluk | 20 |
| Mini harita genişliği | 168 |
| Üç kartın toplam genişliği | **628 px** (736 idi) |

### Kart içeriği — soyut logo YOK
Her kart **o modun kazanma hâlini gösteren mini harita** taşıyor. Bunun gerekçesi bu
görevin en pahalı dersi: genel semboller (bayrak, kalkan, basamak, NATO işaretleri)
reddedildi, oyunun **kendi verisinden** çıkanlar kabul edildi.

| Mod | Mini haritada | Alt satır |
|---|---|---|
| FETİH | 181/181 parça senin | `181 / 181 BÖLGE` |
| %50 HÂKİMİYET | **tam 91** parça senin, gerisi bağımsız | `91 / 181 BÖLGE` |
| GÜÇ YARIŞI | üç blok, en büyüğü senin (48/30/44 + 59 bağımsız) | `SÜRE DOLUNCA EN BÜYÜK` |

⚠ **Resimdeki parça sayısı, yazan sayıyla birebir aynı olmalı.** %50 kartında yayılma
hedefi aşıp 101 parça gösteriyordu; fazlalıklar Bursa'dan en uzaktakinden başlayarak geri
verilip tam 91'e indirildi. Ekran sayı uyduramaz.

⚠ **Mini haritada parça sınırları ŞART.** Fetih kartında harita tek renk olunca Türkiye'nin
şekli kayboluyor, düz bir leke gibi duruyordu. Sınırlar hem şekli geri getiriyor hem doğruyu
söylüyor: hepsi senin ama hâlâ 181 ayrı parça.

### Seçili kart
Vurgu **iki şeyden** geliyor:
1. **Koyuluk + katılık** — seçili: `karis(panel, '#152539', 0.30)` = `#29435e`, opaklık **0.97**.
   Seçili olmayanlar: `panel` (`#31506E`), opaklık **0.72** — altlarındaki açık harita
   içlerinden sızıp onları soluklaştırıyor.
2. **Çerçeve** — seçilinin çevresinde 1.4 kalınlığında açık hat (%70) + tam parlaklıkta
   köşe parantezleri.

⚠ Bir ara seçili kart **siyah** görünüyordu. Bu tasarım tercihi değil **hataydı**: dolgu
`karis(panel, '#fff', 0.10)` ile hesaplanıyordu ve renk karıştırıcı üç haneli hex'i
anlamıyordu → mavi kanal NaN → geçersiz renk → SVG siyaha düşürüyor. Karıştırıcı düzeltildi.

## Başlık

**"SEFERİN AMACINI SEÇ"** · Oswald 600 · 15 punto · harf arası 4.6 · **y = 40**

⚠ Konumu göz kararı değil, **ölçüldü**: karanın ekrandaki en üst noktası y=49.7 (dış hattın
en küçük y'si × ölçek + harita kayması). 15 puntoluk yazı taban çizgisinin ~11 px üstüne
uzanıyor → y=40'ta yazı 29–44 arasında kalıyor, karaya **5.7 px** var.
Önce kartların üstündeydi (y≈68) ve kıyıya biniyordu; sonra tepeye alındı (y=30) ve kopuk
duruyordu. 40 ikisinin arası.

## Alt düğmeler
**GERİ** (dolgusuz) · **İL SEÇ** (dolgulu, açık) — 104×30, y = H−52, ortada.
