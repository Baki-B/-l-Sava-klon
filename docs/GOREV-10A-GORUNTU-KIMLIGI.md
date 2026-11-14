# GÖREV 10A — GÖRÜNTÜ KİMLİĞİ

> Tarih: 2026-08-02 · Girdi: 9 ekran görüntüsü (cihaz, yatay tutuş) + Baki'nin yön kararı
> Kapsam: yalnızca görünüm. Oyun kuralı, denge sayısı, yapay zekâ — hiçbirine dokunulmaz.

---

## 0. VERİLEN KARARLAR (tartışma kapandı)

| Karar | İçerik |
|---|---|
| **Yön** | **Kâğıt atlas.** Oyun bir haritadır; arayüz haritanın üstünde duran kâğıt ve lejanttır. |
| **Zemin** | Mevcut **savaş haritasının açık gri-mavi zemini** temel alınır. Yeni zemin rengi icat edilmez. |
| **81 il paleti** | **DEĞİŞMEZ.** Ölçülmüş ve oturmuş (doygunluk üst sınırı 52, komşu iller aynı renk çıkmıyor). |
| **Yazı tipleri** | **DEĞİŞMEZ.** Oswald dar büyük harf zaten haritacılıkta etiket yazısıdır; Barlow sayı için doğru. |
| **Rozet** | Koyu kalkan olarak **kalır.** Açık zemin üstünde koyu rozet doğru kontrasttır; `okunakliMetin` mantığı korunur. |
| **Değişen** | **Paneller ve menüler.** Koyu moddan çıkıp haritanın dünyasına katılırlar. |

Bu görevin tek cümlelik amacı: **oyunda üç ayrı dünya var (açık harita, koyu panel, siyah menü); tek dünya olacak.**

---

## 1. ENVANTER — 9 EKRANDA NE BULUNDU

| Ekran | Bulgu |
|---|---|
| Ana menü | Neredeyse siyah zemin + altın konturlu harita duvar kâğıdı. Harita hiçbir iş yapmıyor. "Kayıtlı maçın yok" DEVAM ET yazısıyla **çakışıyor**. Dikey aralıklar eşit değil. |
| Mod seçimi | Üç kart saydam; harita çizgileri yazının içinden geçiyor. **Üç ikon üç farklı çizim dilinde.** "181 bölgenin 181 tanesi senin olacak." kartların altında öksüz duruyor. |
| İl seçimi | Dört köşe dört ayrı iş yapıyor. Zorluk düğmelerinin **etiketi yok** — Kolay/Orta/Zor'un ne olduğu tahmine kalıyor. |
| Harita + HUD | Tur çubuğu ve harita tipi düğmeleri iyi oturmuş. Vurgu kırmızısı paletin tek parlak öğesi. |
| Bölge paneli | **"GETİRİSİ +4/+3" ve "BURAYI ALIRSAN +4/+3" aynı sayıyı iki kez** söylüyor. "4 piyade" ve "4 × Piyade" de öyle. |
| Panel (kaydırılmış) | Tek panelde **üç derecelendirme dili**: 10 kare çubuk, 5 nokta, kelime ("Orta"). × düğmesi başlığın üstüne **biniyor**. |
| Panel (eylemler) | SALDIR / ASKER TAŞI / ASKER BAS — hiyerarşi doğru, tek sorun kırmızının tonu. |
| Saldırı emri | Arazi açıklaması **iki kez** (kutu içinde cümle, altında madde). "Bunu alırsan seferberlikten…" satırı **ortadan kesiliyor**. Alt not her açılışta tekrar ediyor. |
| Diplomasi | Üç satır da birebir aynı kalıp. "şu an sıcak bakmıyor" + "anlaşmaya ihtiyaç duymuyor" **aynı bilgi**. Elmas ikonu hiçbir şey anlatmıyor. |

---

## 2. YEDİ KUSUR (bu görevin hedef listesi)

1. **İki dünya** — açık harita, koyu panel/menü.
2. **Aynı bilgi iki kez** — panel, saldırı emri, diplomasi.
3. **Üç derecelendirme dili** — çubuk / nokta / kelime.
4. **Karışık ikon dili** — dolu altın, iki tonlu gri, çizgi grafik yan yana.
5. **Dört köşe yerleşimi** — özellikle il seçimi.
6. **Cümleyle konuşma** — arayüz açıklama yapıyor, veri göstermiyor.
7. **Çakışan vurgu rengi** — parlak kırmızı-turuncu, mat paletin içinde yabancı.

---

## 3. TASARIM SORULARI

**Adım 3'e geçilmeden Baki tarafından cevaplanacak.** Cevapsız soruyla kod yazılmaz.

**S1 — Vurgu rengi.** Mevcut parlak kırmızı-turuncu kalsın mı, yoksa doygunluğu düşürülüp haritanın paletine mi çekilsin?
*Öneri: çekilsin.* Koyu kiremit / mürekkep kırmızısı. Vurgu tek renk kalır ve yalnızca **saldırı** için kullanılır — başka hiçbir yerde.

**S2 — Panel zemini.** Kâğıt beyazı mı, haritanın deniz grisinin bir tık açığı mı?
*Öneri: ikincisi.* Panel o zaman "haritanın üstüne konmuş bir kâğıt" gibi durur; beyaz, harita zemininden kopar.

**S3 — Menü ekranlarının arka planı.** Harita duvar kâğıdı kalsın mı, yoksa düz kâğıt zemin + küçük harita mührü mü?
*Öneri: ikincisi.* Şu anki harita ne okunuyor ne de iş yapıyor; yazının altında gürültü.

**S4 — Panelde hangi satır kalacak?** "GETİRİSİ" mi "BURAYI ALIRSAN" mı?
*Öneri: sahip sensen "GETİRİSİ", değilsen "ALIRSAN".* İkisi asla aynı anda görünmez.

**S5 — Derecelendirme dili.** Tek dile inecek. 10 kareli çubuk mu, 5 noktalı sıra mı?
*Öneri: 5 nokta.* 10 kare telefonda okunmuyor ve panelin yarısını yiyor.

---

## 4. ADIMLAR

### Adım 0 — `CLAUDE.md` (proje anayasası)
**Görünür değişiklik yok.**

En fazla 150 satır, günlük değil kural: klasör haritası · hangi sayı nerede yaşar (`denge.js`) · oyun/ekran katman sınırı (`oyunKancasi.js` ↔ `App.js`) · Windows komutları (`npm.cmd`, `npx.cmd`) · bilinen tuzaklar (worklet'e fonksiyon geçirilemez, türetilmiş nesne kimliği her hamlede değişir, özel yazı tipiyle `fontWeight` çalışmaz) · yasaklar (denge sayısını koda gömme, `tema.js` dışında renk yazma).

`URETIM-NOTU.md` günlük olarak kalır; bu onun yerine geçmez.

**Kanıt:** dosya var, 150 satırı geçmiyor.

---

### Adım 1 — `tema.js` jeton tablosu
**Görünür değişiklik yok.**

Tek kaynak haline gelir. Tanımlanacaklar:

- **Zemin katmanları:** harita zemini (mevcut) · kâğıt (panel) · kâğıt-koyu (kart içi) · mühür (menü zemini)
- **Çizgi:** ince kontur · kalın kontur (il sınırı) · ayraç
- **Yazı renkleri:** birincil · ikincil · soluk
- **Vurgu:** tek renk (S1'in cevabı)
- **Boşluk ölçeği:** 4 / 8 / 12 / 16 / 24
- **Köşe:** 0 (kural), 4 (yalnızca düğme)
- **Punto ölçeği:** mevcut `olcu.js` ile uyumlu

**Kanıt:** `tema.js` okunduğunda tüm görsel kararlar tek dosyada görülüyor.

---

### Adım 2 — Çıplak renk avı
**Görünür değişiklik yok — ve bu bir kanıttır.**

Bileşen dosyalarındaki her `#rrggbb` / `rgba(...)` `tema.js` jetonuyla değiştirilir. `npm run kontrol`'e dördüncü bölüm eklenir: **çıplak renk sayısı sıfır olmalı.**

Bu adımdan sonra oyun **birebir aynı görünmeli.** Görüntü değiştiyse bir yeri yanlış eşledin.

**Kanıt:** `kontrol` dördüncü satırı ✓, ekran görüntüsü öncekiyle aynı.

---

### Adım 3 — Panel kâğıda geçer
**İlk görünür adım.** Dosya: `src/bilesenler/IlPaneli.js`

Koyu panel, S2'de seçilen kâğıt zemine geçer. Kutu-içinde-kutu kalkar; bilgi **hizalı veri satırı** olur. Sol kenar şeridi ve genişlik ölçüleri korunur (Görev 04'te ölçülmüştü).

**Kanıt:** damga `y2`. Panel açıldığında zemin haritayla aynı dünyada, koyu kutu kalmadı.

---

### Adım 4 — Tekrarlar ve söz kısaltma
Dosyalar: `IlPaneli.js`, saldırı emri modalı, diplomasi ekranı.

- Panel: S4'e göre tek satır kalır. "4 piyade" ve "4 × Piyade" birleşir.
- Saldırı emri: arazi açıklaması **tek yerde**. Alt not ("Emirler tur bitince çözülür…") ilk açılışta gösterilir, sonra gösterilmez.
- Diplomasi: satır tek satıra iner — ad · durum · büyüklük · tek gerekçe. Elmas ikonu kalkar.

Kural: **her öğe tek iş yapar.** Etiket etiketler, sayı sayar; hiçbir şey ikisini birden yapmaz.

**Kanıt:** damga `y3`. Hiçbir ekranda aynı sayı iki kez görünmüyor.

---

### Adım 5 — Tek derecelendirme dili, tek ikon dili
- Bütün ölçütler S5'te seçilen tek biçime iner (savunma "Orta" da dahil).
- Bütün ikonlar tek çizim diline iner: **kontur, dolgusuz, tek kalınlık.** Mod seçimindeki kale/kalkan/grafik yeniden çizilir. Harita tipi düğmelerindeki siluetler de aynı dile girer.
- **İmza öğe:** kalkan rozet. Uygulama ikonu, açılış, kazanma ekranı ve menü işaretleri aynı kalkanı kullanır. Yeni bir sembol icat edilmez.

**Kanıt:** damga `y4`. Ekranda tek ikon ailesi ve tek ölçüt biçimi var.

---

### Adım 6 — Menü ekranları kâğıda taşınır
Ekranlar: ana menü · mod seçimi · il seçimi.

- Zemin S3'e göre.
- **İl seçimi yeniden yerleştirilir:** dört köşe kalkar, tek sütun karar akışı olur. Zorluk düğmelerine **ZORLUK** etiketi gelir.
- Mod kartları saydamlıktan çıkar; harita çizgisi yazının içinden geçmez.
- Mod seçimindeki öksüz cümle kartın içine girer.

**Kanıt:** damga `y5`. Ana menüden oyuna girerken dünya değişmiyor.

---

### Adım 7 — Üç yerleşim hatası
1. Saldırı emri: "Bunu alırsan seferberlikten…" satırı kesiliyor → kutu yüksekliği veya kaydırma düzeltilir.
2. Panel: × düğmesi başlığın üstüne biniyor; kaydırınca başlık kayboluyor → başlık sabitlenir.
3. Ana menü: "Kayıtlı maçın yok" DEVAM ET ile çakışıyor → pasif durum yeniden çizilir.

**Kanıt:** damga `y6`. Üç ekran görüntüsü, üç düzeltme.

---

### Adım 8 — Cihazda son kontrol
Dokuz ekranın **önce/sonra** kareleri yan yana. `npm run kontrol` temiz, 561 test geçiyor, `npx expo export` hatasız.

---

## 5. BİTİŞ ÖLÇÜTÜ (ölçülebilir, tahminle değil)

- [ ] Bileşen dosyalarında çıplak renk kodu **= 0** (kontrol betiği doğruluyor)
- [ ] Aynı sayıyı iki kez gösteren ekran **= 0**
- [ ] Derecelendirme dili **= 1**
- [ ] İkon ailesi **= 1**
- [ ] Koyu panel/menü kalmadı — tek zemin dünyası
- [ ] Üç yerleşim hatası kapandı
- [ ] Her adımda damga arttı ve Baki cihazda doğruladı
- [ ] `npm run kontrol` temiz, **561 test** geçiyor
- [ ] `URETIM-NOTU.md` güncel

---

## 6. KAPSAM DIŞI (bilerek yapılmayacak)

Yazı tipi değişmez · 81 il paleti değişmez · rozet katman sınırları (0.90–1.35 / 1.35–2.70 / 2.70–7) değişmez · harita netliği (`HARITA_NETLIK`) değişmez · jest ayarları değişmez · oyun kuralı, denge sayısı ve yapay zekâ hiç ellenmez.

Ses dosyaları, para kazanma, başarımlar ve mağaza görselleri **Görev 10C**'ye aittir.
Dünyanın kilitlenmesi (§7a) **Görev 10B**'ye aittir.

---

## 7. ÇALIŞMA KURALI (her adımda geçerli)

Adım bitince Claude Code üç şey yazar:
1. Dokunduğu dosyalar
2. Yeni damga değeri
3. **Baki'nin telefonda göreceği tek cümlelik gözlem**

Baki o gözlemi doğrulamadan sonraki adıma geçilmez. Adımlar birleştirilmez.
