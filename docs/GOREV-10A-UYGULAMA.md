# ANA MENÜ + MOD EKRANI — UYGULAMA BELGESİ

> Tarih: 2026-08-03
> **Ne yapılacağı** `GOREV-10A-ANA-MENU-KARARI.md`'de. Bu belge **nasıl yapılacağı**.
> Önizlemeler: `onizleme/ana-menu-final.html` · `onizleme/mod-ekrani.html`
>
> Önizlemeler **HTML/SVG**, uygulama **React Native**. Aradaki çeviri bu belgenin asıl işi.

---

## 0. ÖNCE ŞUNU BİL

Kodda şu an **birkaç tur önceki koyu yeşil tema** duruyor. `tema.js`'in jeton tablosu
yeşil; ana menü eski hâlinde. Yani bu iş bir "ekleme" değil, **geri alma + yeniden kurma**:

1. `tema.js` yeşil paletten **Ege paletine** dönecek
2. `AnaMenu.js` yeniden yazılacak
3. Mod ekranı `AnaMenu.js`'in içinden **kendi dosyasına** çıkacak

Oyunun adı **İL SAVAŞLARI** (çoğul). `app.json` şu an `"name": "İl Savaşı"` — düzeltilecek.

---

## 1. ÖNİZLEME KOORDİNATLARINI EKRANA ÇEVİRME

Önizlemeler **880×400** SVG kutusunda çizildi (yatay telefon oranı 2.2:1). Gerçek ekran
`useWindowDimensions()` ile geliyor ve oranı tam 2.2 olmayacak. **Piksel sayılarını
kopyalama** — hepsi orana çevrilmeli.

| Önizlemedeki | Anlamı | Kodda |
|---|---|---|
| `G = 880` | ekran genişliği | `width` |
| `H = 400` | ekran yüksekliği | `height` |
| harita genişliği `G*0.8` | harita ekranın %80'i | `width * 0.8` |
| harita üst kenarı `(H - 452*ölçek)/2` | dikeyde ortalı | aynı formül |
| panel `PW = G*0.33` | panel %33 | `width * 0.33` |
| panel `PY = 62`, `PH = 276` | y ve yükseklik | `height * 0.155`, `height * 0.69` |
| kart `kw = 196` | kart genişliği | `width * 0.2227` |
| kart `kh = 178` | kart yüksekliği | `height * 0.445` |
| kart `ky = 100` | kartların üst kenarı | `height * 0.25` |
| kartlar arası `20` | boşluk | `width * 0.0227` |
| mini harita `168` | kart içi harita | `kw * 0.857` |
| başlık `y = 40` | **aşağıdaki uyarıya bak** | hesaplanacak |
| düğme `104×30`, `y = H-52` | GERİ / İL SEÇ | `width*0.118` × `height*0.075`, `height*0.87` |

### ⚠ BAŞLIK KONUMU HESAPLANIR, YAZILMAZ
"SEFERİN AMACINI SEÇ" karaya değmemeli. Kara ekranda şurada başlıyor:

```
const olcek = (genislik * 0.8) / META.genislik;
const haritaUst = (yukseklik - META.yukseklik * olcek) / 2;
const karaninUstu = haritaUst + HAT_EN_UST * olcek;   // HAT_EN_UST = meta.enUstY = 11.8
const baslikY = karaninUstu - 10;                     // yazının altı karaya 10 px kala
```

> ⚠ `HAT_EN_UST` burada **12.5** diye tahmin edilmişti; gerçekten ölçülünce **11.8** çıktı
> ve `veri/turkiye-hat.json` → `meta.enUstY`'ye yazıldı (Adım 1). Koda sabit sayı yazılmaz,
> oradan okunur.

880×400'de bu `y = 40` veriyor. Başka ekran oranında başka sayı verecek — **doğrusu bu.**
Sabit 40 yazılırsa dar ekranda kıyıya biner.

`HAT_EN_UST` değerini `veri/turkiye-hat.json`'dan bir kez hesaplayıp `meta`ya yazmak en
temizi (aşağıya bak).

---

## 2. `tema.js` — EGE PALETİ

Mevcut yeşil jetonlar **silinip** yerine bunlar gelecek. Adlar (`ZEMIN.yuzey`, `YAZI_RENK.*`)
korunabilir; oyun içi ekranlar onları kullanıyor.

```js
// ---- EGE PALETİ (Görev 10A, ana menü + mod ekranı) ----
export const MENU_RENK = {
  deniz: '#7FA6C4',        // merkez
  denizDip: '#4C6E8B',     // kenar — radyal geçişin dış ucu (karis(deniz,'#22405C',0.55))
  denizKoyu: '#5D89AA',    // kıyı halesi
  kara: '#DDE4D8',         // il rengi bunun üstüne %62 karışıyor
  panel: '#31506E',
  panelSecili: '#29435E',  // mod kartı seçiliyken
  yazi: '#F2F7FA',
  yaziSolu: '#BFD2E0',
  kiyi: '#2A4460',         // karis(panel,'#000',0.15)
  sinir: '#000000',        // parça sınırı + dişli cephe (Baki 2026-08-03: siyah)
};
```

> ⚠ `denizDip` bu belgede önce **`#3E6A8C`** yazıyordu, YANLIŞTI. Karar belgesinin kendi
> formülü (`karis(deniz,'#22405C',0.55)`) ve onaylanan önizlemenin geçişi ikisi de
> **`#4C6E8B`** veriyor. Yukarısı düzeltildi.

**Kural:** bileşene çıplak renk yazılmaz (`npm run kontrol` 4. bölüm sıfır ister).
Ara tonlar (`karis(...)`) kodda hesaplanacaksa yardımcı `tema.js`'e girer, bileşene değil.

**İl rengi:** `askeriTon(parca.renkIl)` sonucu `MENU_RENK.kara` ile **%62** karıştırılır.
Mini haritada oyuncunun rengi **%92** karıştırılır (daha doygun).

---

## 3. VERİ — YENİ DOSYA GEREKİYOR

### 3a. Mevcutlar (hazır)
| Dosya | İçerik |
|---|---|
| `veri/harita.json` | 81 il yolu + etiket + `meta` (1000×452) |
| `veri/parcalar.json` | 181 parça: `yol`, `kod`, `il`, `renkIl` — anahtar `"34-2"` biçiminde **nesne**, dizi değil |
| `veri/parca-komsuluk.json` | parça → komşu parça listesi |
| `veri/turkiye-hat.json` | ülkenin tek dış hattı (`scripts/turkiye-hat-uret.js`) |

### 3b. YENİ: `veri/menu-seferi.json`
Fetih döngüsünün **8 durumu** önceden hesaplanmalı. Telefonda her açılışta 181 parçalık
yayılma çalıştırmanın anlamı yok.

Üretici: **`scripts/menu-seferi-uret.js`** (yazılacak). Kuralı:

```
güçler = ['16', '07', '25']            // Bursa · Antalya · Erzurum
başlangıç: her parça kendi ilinin
her tur:  her güç, komşusu olan ve HİÇBİR GÜCE ait olmayan parçaların HEPSİNİ alır
beraberlik: listede önce olan alır (sabit sıra — rastgelelik YOK)
bitiş: her parça bir güce ait olunca
```

Doğrulanmış sonuç: **7 tur**, tur başına **26 / 37 / 36 / 34 / 25 / 10 / 1** parça,
son dağılım Bursa 56 · Antalya 54 · Erzurum 71.

Çıktı biçimi (kayıt boyutu kaygısı yok, bu veri dosyası):
```json
{
  "aciklama": "...",
  "guclerSirasi": ["16","07","25"],
  "durumlar": [ {"01-1":"01", ...}, ... ],   // 8 adet, parça → sahip il kodu
  "degisenler": [ [], ["34-2","34-3",...], ... ]  // her turda EL DEĞİŞTİRENLER
}
```

`degisenler` şart: çizim yalnızca değişenleri canlandıracak (bkz. §5).

### 3c. `turkiye-hat.json`'a ek
`meta` içine **`enUstY`** eklenmeli (dış hattın en küçük y'si = 12.5). Başlık konumu bunu
kullanıyor; her açılışta 2262 noktayı taramak gereksiz.
`scripts/turkiye-hat-uret.js` bunu yazacak şekilde güncellenir.

---

## 4. DOSYALAR

| Dosya | Ne olacak |
|---|---|
| `src/tema.js` | Yeşil jetonlar → Ege paleti (§2) |
| `src/bilesenler/MenuHaritasi.js` | **Yeniden yazılacak.** Şu an yüzen harita çiziyor ve kullanılmıyor. Yeni işi: deniz geçişi + kıyı halesi + 181 parça mozaiği + kıyı çizgisi |
| `src/bilesenler/MenuSeferi.js` | **YENİ.** Fetih döngüsü (§5) |
| `src/bilesenler/AnaMenu.js` | Yeniden yazılacak: panel + başlık + alt satır + 4 düğme |
| `src/bilesenler/ModSecimi.js` | **YENİ.** Şu an `AnaMenu.js` içinde `gorunum === 'mod'` bloğu; kendi dosyasına çıkacak |
| `src/bilesenler/Muhur.js` | **Artık kullanılmıyor** (mühür Tema 1'de yok). Silinmiyor; `assets/muhur.png` uygulama ikonu için durabilir |
| `app.json` | `"name": "İl Savaşları"` |
| `scripts/menu-seferi-uret.js` | YENİ (§3b) |
| `scripts/turkiye-hat-uret.js` | `meta.enUstY` ekle |

---

## 5. FETİH DÖNGÜSÜ — ÇİZİM STRATEJİSİ

**Bu bölüm belgenin en önemli yeri.** Yanlış kurulursa menü telefonu ısıtır.

### YAPILMAYACAK
- ❌ 8 durumu 8 ayrı katman olarak çizip opaklıklarını canlandırmak
  → 8 × 181 = **1448 yol** aynı anda ağaçta. Önizlemede (tarayıcı) sorun değil, telefonda çok.
- ❌ Her karede yeniden çizmek. Kare kare iş **yok**; değişimler saniyede bir.
- ❌ 181 yolun `fill`ini tek tek canlandırmak (`AnimatedPath`) — pahalı.

### YAPILACAK — SADECE FARKI ÇİZ
Bir turda ortalama **26 parça** değişiyor, 181 değil. Üç katman yeter:

```
1. TABAN     181 <Path>, o anki sahiplik renkleriyle. Turda BİR KEZ değişir.
             React.memo + durum indeksine bağlı; ara karelerde hiç dokunulmaz.
2. GEÇİŞ     yalnızca bu turda değişen parçalar, YENİ renkleriyle.
             Grup opaklığı 0 → 1, 0.26 sn. Bitince taban bir sonraki duruma geçer,
             geçiş katmanı boşalır.
3. PARLAMA   aynı değişen parçalar, açık renkte (MENU_RENK.yazi).
             Grup opaklığı 0.6 → 0, 0.85 sn.
```

Canlandırılan şey **iki grup opaklığı** — `reanimated`'da iki paylaşılan değer. 181 yol
hiç canlandırılmıyor.

### CEPHE (dişli sınır)
Karar belgesinde: komşusu farklı sahipte olan parça = cephe parçası, dişli konturla çizilir.
**Bu her turda değişiyor**, yani taban katmanının parçası. Üretim betiği cephe kümesini de
önceden hesaplayıp `menu-seferi.json`'a yazabilir (`cepheler: [[...], ...]`) — telefonda
her turda 181×komşu taraması yapmaya gerek yok.

- iç parça: kontur 0.4 birim, opaklık 0.16
- cephe parçası: 1.0 birim düz (%75) **+** 3.2 birim kesik `strokeDasharray` (%45)

### ZAMANLAMA
| | sn |
|---|---|
| başlangıç beklemesi (durum 0) | 1.8 |
| her tur (durum 1–6) | 1.2 |
| bitiş beklemesi (durum 7) | 2.4 |
| geçiş (erime) | 0.26 |
| parlama | 0.85 |
| **toplam döngü** | **11.4** |

Zamanlayıcı `setTimeout` zinciri ya da `reanimated`'ın `withSequence`i olabilir. **Ekran
arkaya alınınca durdurulmalı** — `AppState` zaten `App.js`'te dinleniyor.

### ⚠ WORKLET TUZAĞI
`reanimated` worklet'ine fonksiyon geçirilemez (CLAUDE.md §6). Tur ilerletme JS tarafında
yapılır; worklet'e yalnızca **sayı** gider.

### ⚠ KİMLİK TUZAĞI
`MenuSeferi` ve `MenuHaritasi` `React.memo` olacak. Giden her özellik sabit kimlikli olmalı:
liste ise `useMemo`, fonksiyon ise `useCallback`. Yoksa hafızalama çalışmaz ve her turda
181 yol yeniden kurulur.

---

## 6. MOD EKRANI

### Kartlar
3 kart yatay, ortada. Ölçüler §1 tablosunda.

Her kart: **mini harita** (o modun kazanma hâli) + **ad** + **hedef satırı**.
Cümle YOK (V2 seçildi).

Mini haritalar da **önceden hesaplanmış** sahiplik durumlarıdır — `menu-seferi.json`'un
yanına `veri/mod-hedefleri.json` olarak yazılabilir ya da aynı dosyaya eklenebilir:

| Mod | Durum | Alt satır |
|---|---|---|
| `fetih` | 181/181 tek sahip | `181 / 181 BÖLGE` |
| `yarim` | **tam 91** parça (fazlalık geri verilerek) | `91 / 181 BÖLGE` |
| `puan` | 3 blok, en büyüğü oyuncunun (48/30/44 + 59 bağımsız) | `SÜRE DOLUNCA EN BÜYÜK` |

**Alt satır sayıları `modKazanmaEsigi()`'den gelmeli**, elle yazılmamalı — mod eşiği
`denge.js`'te değişirse ekran kendiliğinden düzelsin.

### ⚠ ÜÇ TUZAK (üçü de bir kez yaşandı)
1. **Resimdeki parça sayısı, yazan sayıyla aynı olmalı.** Yayılma hedefi aşıyor (91 yerine
   101). Fazlalık, çekirdekten en uzaktakinden başlayarak geri verilir. Üretim betiğinin işi.
2. **Mini haritada parça sınırları şart.** Fetih kartı tek renk olunca Türkiye'nin şekli
   kayboluyor, düz leke gibi duruyor.
3. **Renk karıştırıcı üç haneli hex'i anlamalı.** `karis(panel, '#fff', 0.1)` mavi kanalı
   NaN yapıp geçersiz renk üretiyor, SVG onu siyaha düşürüyor.

### Seçili kart
- seçili: dolgu `MENU_RENK.panelSecili`, opaklık **0.97**, çevresinde 1.4 açık hat (%70),
  köşe parantezleri tam parlaklık
- seçili değil: dolgu `MENU_RENK.panel`, opaklık **0.72** (harita içinden sızar, soluklaşır)

---

## 7. SIRA

Adımlar birleştirilmez; her adım sonunda Baki'nin telefonda göreceği tek cümle yazılır
(CLAUDE.md §7).

| # | İş | Görünür sonuç |
|---|---|---|
| 1 | `scripts/menu-seferi-uret.js` + `veri/menu-seferi.json` · `turkiye-hat.json` meta'ya `enUstY` | yok (veri) |
| 2 | `tema.js` Ege paletine döner | oyun içi ekranların rengi değişir |
| 3 | `MenuHaritasi.js` yeniden yazılır (mozaik + hale + kıyı) | menüde yeni harita |
| 4 | `AnaMenu.js` panel + başlık + düğmeler | ana menü yeni hâline gelir |
| 5 | `MenuSeferi.js` fetih döngüsü | **menüde sefer akmaya başlar** |
| 6 | `ModSecimi.js` ayrı dosya + kartlar | mod ekranı yeni hâline gelir |
| 7 | `app.json` adı + menü metinleri (komuta dili) | uygulama adı düzelir |

---

## 8. BİTİRME ÖLÇÜTÜ

- [ ] `npm run kontrol` beş bölümde de ✓ (çıplak renk **0** dahil)
- [ ] 561 test geçiyor
- [ ] `npx expo export --platform android` hatasız
- [ ] Menüde döngü akıyor, 11.4 sn'de bir başa dönüyor
- [ ] Ekran arkaya alınınca döngü duruyor
- [ ] Hiçbir yerde "İl Savaşı" (tekil) kalmadı
- [ ] Baki cihazda doğruladı
