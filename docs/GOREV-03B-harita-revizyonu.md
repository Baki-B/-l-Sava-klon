# GÖREV 03B — HARİTA REVİZYONU: PARÇA BİRLEŞTİRME VE KOMŞULUK DENETİMİ

> Ara görevdir. Görev 04 (ordu üretimi) bundan sonra gelir.
> Baştan sona oku, sonra §8'deki düzene uyarak işe başla.

---

## 0. KİMİNLE ÇALIŞIYORSUN

Kullanıcının adı **Baki**. Oyunun tasarımcısı ve sahibi. **Yazılımcı değil.** Kod okumayacak, hata mesajlarını yorumlayamaz.

- Komutları satır satır, kopyalanabilir biçimde ver.
- Teknik terim kullanacaksan yanına tek cümlelik Türkçe karşılık koy.
- Ne yaptığını değil, **Baki'nin ekranda ne göreceğini** anlat.
- Türkçe konuş.

---

## 1. BU GÖREV NEDEN VAR

Görev 04'te ordular geliyor. Ordu sayısı, Risk'teki gibi **parçanın üzerinde bir rozet (sayı) olarak** çizilecek. Rozet yer kaplar. Bir parça rozeti taşıyamayacak kadar küçükse oyun oynanamaz hale gelir: sayı taşar, komşu parçanın üstüne binerse hangi ordunun nerede olduğu anlaşılmaz.

Bu yüzden **ordu sistemi kurulmadan önce** harita rozet taşıyabilecek hale getirilmeli. Sonra yapılırsa ordu kodu, arayüz ve testler yeniden elden geçer.

Bu görev ayrıca iki açık maddeyi kapatıyor: Rize'nin arazi çelişkisi ve iki kısa sınırın parça grafiğinde olup olmadığı.

---

## 2. KAPSAM

### Yapılacak

0. İki soruyu cevapla (komşuluk denetimi)
1. Rize'nin arazisini düzelt
2. İstanbul'u 3 parçadan 2'ye indir
3. 193 parçanın tamamını ölç, rozet önizlemesi üret, **Baki'ye göster ve dur**
4. Baki'nin eşiğine göre birleştirme listesi öner, **onay al**
5. Birleştirmeleri uygula, tüm veriyi yeniden üret
6. Belgeleri ve testleri eşitle

### Yapılmayacak

- Ordu, birim, rozet mekaniği (Görev 04) — bu görevde rozet **yalnızca ölçüm amaçlı, geçici bir önizlemede** çizilir
- Yeni harita özelliği, yeni renk modu
- Parça **bölme** (yalnızca birleştirme yapılır)
- İl sınırlarına dokunma
- Yeni stat, yeni oyun mekaniği

> **Kapsam uyarısı.** Görev 01 ve 02'de kapsam kendiliğinden büyüdü. Bu görev bir veri revizyonudur. Rozetin gerçek oyun hali Görev 04'ün işi.

---

## 3. KAYNAK BELGELER

- `docs/il-savasi-tasarim.md` — §3.5 (arazi çarpanları), §7 (harita, parça, tam sayı üretim)
- `docs/il-savasi-parca-bolumleme-v2.md` — parça tabloları, bölme kuralları
- `veri/URETIM-NOTU.md` — `BIRLESTIR` ve `KOPUK_ISTISNA` mekanizmaları burada kayıtlı
- `scripts/parca-uret.js` — birleştirmeler bu betikteki ayardan geçer

Birleştirmeler **elle JSON düzenleyerek değil**, `parca-uret.js` içindeki `BIRLESTIR` ayarına satır eklenerek yapılır. Böylece veri her zaman yeniden üretilebilir kalır.

---

## 4. ADIM 0 — İKİ SORU (önce bunları cevapla)

Bunlar hızlı iştir, ölçüm işine girmeden bitir.

### Soru 1 — Kısa sınırlar parça grafiğinde var mı?

Görev 02'de **İstanbul–Kırklareli (34–39)** ve **Kilis–Hatay (79–31)** il komşuluk grafiğine elle eklendi (`EK_KOMSU`). Ama oyunun saldırı kuralı artık **parça** komşuluğudur.

**Kontrol et:** `veri/parca-komsuluk.json` içinde bu iki ilin parçaları arasında bağlantı var mı?

- İstanbul'un hangi parçası Kırklareli'nin hangi parçasıyla komşu görünüyor?
- Kilis'in hangi parçası Hatay'ın hangi parçasıyla komşu görünüyor?

**Yoksa:** parça grafiğine elle ekle. Doğru parça çiftini geometriden seç — o sınıra fiilen değen parçalar hangileriyse onlar. Tahminle seçme; sınır temasını hesapla, sonucu Baki'ye göster.

**Neden önemli:** yoksa oyunda İstanbul'dan Kırklareli'ye ordu geçemez. Harita doğru görünür ama oyun yanlış çalışır — gözle fark edilmesi zor bir hatadır.

### Soru 2 — Başka kaçan kısa sınır var mı?

Aynı kontrolü **tüm il çiftleri** için yap: `veri/komsuluk.json`'da (il grafiği) komşu görünen ama `parca-komsuluk.json`'da hiçbir parça çifti bağlantısı olmayan il çiftlerini listele.

Beklenen sonuç: yukarıdaki iki çift dışında hiçbiri. Başka çıkarsa **düzeltmeden önce Baki'ye göster** — bazıları gerçek olabilir (deniz aşırı komşuluk gibi), hepsi hata değildir.

**Baki'nin kontrolü:** İki geçiş var mıydı, yok mu, eklendi mi? Başka kaçan var mı?

---

## 5. ADIM 1 — RİZE'NİN ARAZİSİ DAĞLIK OLACAK

**Karar (Baki, 2026-07-26):** Rize tek parça kalır, arazisi **Dağlık** olur.

**Sebep:** Kaçkar Vadileri (Dağlık) Rize Kıyı'ya (Tepelik) katılınca il tamamen tepeliğe döndü. Ama tasarım belgesi Rize'yi iki yerde dağlık savunmanın örneği olarak kullanıyor:

- §3.5: "Her ilin arazi tipi sabittir (Rize dağlık, Konya ova vb.)"
- §5: "Rize (düşük nüfus, yüksek arazi savunması)"

Rize'nin coğrafi kimliği dağ. Savunma çarpanı ×1.15 değil **×1.35** olmalı.

**Yapılacak:**

1. `parca-uret.js`'te Rize'nin tek parçasının arazisi `daglik` olacak. Birleştirme sonrası arazi ataması ağırlıklı baskın araziyle hesaplanıyorsa, Rize için **elle geçersiz kılma** (override) gerekir — bu istisnanın kod içinde gerekçesiyle birlikte yazılı olması şart.
2. `iller.json` yeniden üretilince Rize'nin il arazisi de `daglik` olacak (ilin arazisi parçalardan türetiliyor). Doğrula.
3. `il-savasi-parca-bolumleme-v2.md`'de Rize tablosu ve birleştirme notu güncellensin. Nottaki "onay bekliyor" ifadesi kalksın, yerine: **"Baki onayladı (2026-07-26); tek parça kalır, arazi Dağlık'a sabitlendi."**
4. Arazi dağılım tablosu güncellensin (Tepelik −1, Dağlık +1).

**Baki'nin kontrolü:** Haritada arazi modunda Rize dağlık renginde mi? Panelde savunma çarpanı ×1.35 mi?

---

## 6. ADIM 2 — İSTANBUL 3 PARÇADAN 2'YE

**Karar (Baki, 2026-07-26):** İstanbul iki parça olacak — **Avrupa Yakası** ve **Anadolu Yakası**.

**Sebep:** Suriçi ve Galata parçası (Fatih, Eyüpsultan, Zeytinburnu, Beyoğlu, Beşiktaş) coğrafi olarak çok küçük. Ordu rozeti sığmaz.

**Yapılacak:**

`BIRLESTIR` ayarına ekle: `34-1` (Suriçi ve Galata) → `34-2` (Avrupa Yakası).

Beklenen sonuç:

| Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|
| Avrupa Yakası | eski 1 + eski 2'nin tamamı | Ova | 0.09+0.56 = **0.65** | 0.18+0.47 = **0.65** |
| Anadolu Yakası | değişmez | Tepelik | **0.35** | **0.35** |

Arazi: ağırlıklı baskın arazi kuralıyla Ova çıkar (0.47 ova / 0.18 tepelik). Doğrula.

**Belgeye arşiv notu düş.** Silinen parçanın tasarım gerekçesi belgede duruyordu ("Bizans'tan fethedilen alan, Konstantinopolis suriçi, yedi tepe savunmaya değer"). Bu metin `URETIM-NOTU.md`'ye arşivlensin — ileride "İstanbul neden üç değil iki" sorusunun cevabı orada olsun. Oyun tarafında kayıp: tarihsel lezzet öğesi gitti, oynanabilirlik kazanıldı. Baki'nin bilinçli tercihi.

**Baki'nin kontrolü:** Haritada İstanbul iki parça mı, boğaz doğru yerden mi ayrılıyor?

---

## 7. ADIM 3 — TÜM PARÇALARI ÖLÇ (asıl iş burada başlıyor)

Bu adımda **hiçbir birleştirme yapma.** Yalnızca ölç ve göster.

### 7.1 Doğru ölçü: iç çember, alan değil

"Küçük parça" ölçüsü olarak **alan kullanma.** Uzun ve ince bir kıyı şeridi büyük alana sahip olabilir ama rozeti taşıyamaz.

Doğru ölçü: **parçanın içine sığan en büyük dairenin çapı.** Bu, rozetin fiilen sığıp sığmadığını doğrudan söyler.

Bu değeri zaten hesaplıyorsun: etiket noktası için kullanılan **polylabel** algoritması, noktayı verirken sınırlara olan uzaklığı da döndürür. İç çember yarıçapı budur. Çap = 2 × yarıçap.

**Çok parçalı (adalı) parçalarda dikkat:** ölçüm **en büyük kara gövdesi** üzerinde yapılmalı, ada üzerinde değil. Örnek: Çanakkale'nin 3. parçası Gökçeada ve Bozcaada'yı içeriyor; rozet anakarada durmalı. Mevcut kod ada üzerinde ölçüyorsa düzelt.

### 7.2 Ölçüm birimi: ekran pikseli

Harita birimi Baki'ye bir şey ifade etmez. Ölçümü **telefon ekranında piksele** çevir.

- Referans ekran: telefon (kısa kenar < 600 dp — `src/olcu.js`'teki ölçüt)
- Referans yakınlaştırma: **tüm Türkiye ekrana sığdığı seviye (1×)** ve ayrıca **2×**
- Referans rozet çapı: **26 piksel** (Risk tarzı sayı rozeti için makul başlangıç; Görev 04'te kesinleşecek)

### 7.3 Üretilecek iki çıktı

**A. Sıralı tablo** — `veri/parca-olcum.md`

| Parça | İl | İç çember çapı (1×) | İç çember çapı (2×) | Rozet sığıyor mu (1×/2×) |
|---|---|---|---|---|

193 satır, en küçükten büyüğe sıralı. En küçük 30 parçayı Baki'ye doğrudan göster.

**B. Görsel önizleme** — `onizleme/rozet-testi.html`

Tarayıcıda açılan tek dosya. Haritayı çizsin ve **her parçanın etiket noktasına 26 piksellik bir rozet** koysun (içinde örnek bir sayı, örneğin "12" — iki haneli en kötü durumdur).

Gerekenler:
- Yakınlaştırma seviyesi değiştirilebilsin (1×, 2×, 3×)
- Rozeti taşan/sığmayan parçalar **kırmızı** işaretlensin
- Telefon ekran oranında bir çerçeve gösterilsin — Baki tabletinde bakarken telefonda nasıl görüneceğini anlasın

**Bu adımın sonunda DUR.** Eşiği Baki belirleyecek. Sen bir sayı önerebilirsin, ama kararı verme.

**Baki'nin kontrolü:** Önizlemeyi açsın, rozetleri görsün, "şundan küçüğü birleşsin" desin.

---

## 8. ADIM 4 — BİRLEŞTİRME LİSTESİ ÖNER (uygulama yok, öneri var)

Baki eşiği söyledikten sonra, eşiğin altındaki her parça için bir birleştirme öner.

### 8.1 Birleştirme kuralları — sırayla uygula

1. **Yalnızca aynı il içinde birleştirilir.** Farklı illerin parçaları asla birleşmez.
2. **Hedef parça:** aynı ildeki komşu parçalar arasından **en uzun ortak sınırı** paylaşan.
3. **Eşitlik bozucu:** önce aynı arazi tipinde olan, sonra payı büyük olan.
4. **Paylar toplanır** (nüfus ve ekonomi ayrı ayrı). İlin toplamı 1.00 kalmalı.
5. **Birleşen parçanın arazisi:** ekonomi payına göre ağırlıklı baskın arazi. (Rize istisnası hariç, Adım 1.)
6. **Bir il 1 parçanın altına inemez.** Zaten tek parçalıysa dokunma — o parça küçük görünse bile ilin kendisi küçüktür, yapacak bir şey yok.
7. **Zincirleme:** birleşen parça hâlâ eşiğin altındaysa, işlemi tekrarla. En fazla ilin tamamı tek parçaya iner.
8. **Bütünlük:** birleşme sonrası parça kara olarak bütün kalmalı (adalar hariç). Kopuk kalıyorsa Baki'ye bildir, kendi başına çözme.

### 8.2 Özel durumlar — kendi başına karar verme

- **Ankara (`KOPUK_ISTISNA` listesinde).** Baki 5 parçalı halini bilinçli istedi. Ankara'da bir birleştirme gerekiyorsa **ayrıca sor.**
- **Çanakkale 1 (Gelibolu).** Kara bağlantısı yalnızca Tekirdağ ve Edirne ile. Aynı ilde komşusu yok — kural 6 gereği dokunulamaz. Küçükse Baki'ye bildir, çözümü onunla konuş.
- **Adı değişmesi gereken parçalar.** Birleşince ad yanıltıcı hale geliyorsa (örnek: "Menteşe-Milas" artık Bodrum'u da kapsıyor) yeni ad öner, Baki onaylasın.

### 8.3 Sunum biçimi

Öneriyi tablo olarak ver, **uygulamadan önce onay al:**

| # | Silinecek parça | Hedef | İl | Yeni pay (nüfus/ekonomi) | Yeni arazi | Yeni ad önerisi |
|---|---|---|---|---|---|---|

Altına özet: kaç parça birleşiyor, toplam kaç parça kalıyor, hangi iller etkileniyor.

**Baki'nin kontrolü:** Liste mantıklı mı, itiraz ettiği satır var mı?

---

## 9. ADIM 5 — UYGULA VE YENİDEN ÜRET

Onaylanan birleştirmeleri `parca-uret.js`'teki `BIRLESTIR` ayarına ekle ve zinciri baştan çalıştır.

**Yeniden üretilecekler:**

| Dosya | Neden |
|---|---|
| `veri/parcalar.json` | Geometri, paylar, arazi değişti |
| `veri/parca-komsuluk.json` | Parçalar birleşince komşuluk değişir |
| `veri/iller.json` | `parcaSayisi` alanı, Rize'nin arazisi |
| `veri/komsuluk.json` | Parça grafiğinden türetiliyor |
| `veri/harita.json` | Etiket noktaları değişebilir |
| `onizleme/*.html` | Yeni veriyle |

**Elle JSON düzenleme yok.** Her şey betikten geçsin, aksi halde bir dahaki üretimde değişiklik kaybolur.

**Doğrulama — `npm.cmd run kontrol` temiz çıkmalı, ayrıca:**

1. Her ilin parça payları toplamı **tam 1.00** (nüfus ve ekonomi ayrı)
2. Komşuluk simetrik, izole parça yok
3. Adım 0'da eklenen kısa sınırlar hâlâ yerinde
4. Hiçbir parça eşiğin altında değil (tek parçalı iller hariç)
5. Toplam parça sayısı `veri-dogrula.js`'teki beklenen sayıyla uyumlu
6. Tam sayı üretim kuralı hâlâ çalışıyor: hiçbir parça 0 üretmiyor, payı büyük parça küçükten az üretmiyor
7. İl stat toplamı ile üretim toplamı farkı kayıtlı (Erzurum ekonomi +1 istisnası hâlâ geçerli mi, değişti mi)

**Kayıt uyumu — atlanmaması gereken madde:** Parça kimlikleri değişince eski kayıt dosyaları geçersizleşir. `surum` alanını **2'ye yükselt** ve sürüm 1 kayıtları "bu kayıt eski harita sürümünden, yeni oyun başlatmalısın" mesajıyla reddet. Sessizce bozuk yüklemekten iyidir.

**Baki'nin kontrolü:** Kontrol komutu temiz mi? Telefonda harita doğru mu, rozet önizlemesinde kırmızı kaldı mı?

---

## 10. ADIM 6 — BELGELERİ VE TESTLERİ EŞİTLE

### `docs/il-savasi-parca-bolumleme-v2.md`

- Etkilenen her ilin parça tablosu
- Her birleştirme için gerekçe notu (tarih + sebep), Rize ve Muğla'daki mevcut notların biçiminde
- Başlıktaki toplam sayı
- Bölge özeti tablosu
- Arazi dağılım tablosu
- "Sonraki adım" bölümündeki parça sayısı
- Muğla'da 2 numaranın boş olması gibi **numara boşlukları için tek satır not**: "Kimlikler sabit tutulur; birleşen parçanın numarası yeniden kullanılmaz."

### `docs/il-savasi-tasarim.md`

- §7'deki toplam parça sayısı
- §7'deki tam sayı örneği hâlâ doğru mu (Bursa örneği etkilenmediyse dokunma)
- §3.5 ve §5'teki Rize örnekleri artık tutarlı — doğrula, gerekiyorsa not düş

### Testler

- Sabit sayı yazan test varsa veriden okumaya çevir
- Senaryo testlerindeki parça sayıları (Türkiye, Karadeniz)
- Rize'nin arazisini kontrol eden bir test ekle (bu bir elle geçersiz kılma; sessizce kaybolmasın)
- Yeni bir test: **her parçanın iç çember çapı eşiğin üstünde** (tek parçalı iller muaf). Böylece ileride biri parça bölerse bu kural kendini korur.

### `veri/URETIM-NOTU.md`

- Adım 0'ın cevabı: iki kısa sınır var mıydı, ne yapıldı
- Rize arazi geçersiz kılması ve gerekçesi
- İstanbul birleştirmesi + silinen parçanın arşiv metni
- Ölçüm yöntemi (iç çember, referans yakınlaştırma, rozet boyutu) ve Baki'nin seçtiği eşik
- Birleştirme listesi, tam tablo halinde
- Yeni toplam parça sayısı
- Kayıt sürümünün 2'ye çıkması

**Baki'nin kontrolü:** Belgelerdeki sayılar veriyle aynı mı?

---

## 11. ÇALIŞMA KURALLARI

**Adım adım git, her adımın sonunda dur.** Özellikle **Adım 3 ve Adım 4 kesin duraklardır** — eşiği ve birleştirme listesini Baki onaylamadan uygulama yapma.

Her adım sonunda:

1. Ne yaptığını iki üç cümleyle özetle
2. Baki'nin tam olarak ne yapacağını söyle — hangi komut, hangi dosya, neye bakacak
3. Neyin doğru görünmesi gerektiğini söyle
4. Onay al, sonra devam et

**Uydurma.** Ölçemediğin bir değeri tahmin edip tabloya yazma.

**Elle JSON düzenleme yok.** Her şey `parca-uret.js` üzerinden.

**Kapsamı büyütme.** Rozetin gerçek oyun hali Görev 04'ün işi; buradaki rozet yalnızca ölçüm önizlemesi.

**Takıldığında.** İkinci başarısız denemeden sonra durumu anlat: ne denedin, ne oldu, hangi seçenekler var.

---

## 12. GÖREV BİTİŞ ÖLÇÜTÜ

**Adım 0**
- [ ] İstanbul–Kırklareli ve Kilis–Hatay parça grafiğinde durumu raporlandı, eksikse eklendi
- [ ] İl grafiğinde komşu olup parça grafiğinde olmayan başka çift var mı — listelendi

**Adım 1–2**
- [ ] Rize tek parça, arazisi `daglik`, savunma çarpanı ×1.35
- [ ] İstanbul iki parça: Avrupa 0.65/0.65 Ova, Anadolu 0.35/0.35 Tepelik
- [ ] Silinen İstanbul parçasının tasarım metni arşivlendi

**Adım 3–4**
- [ ] `veri/parca-olcum.md` üretildi, 193 parça ölçüldü
- [ ] `onizleme/rozet-testi.html` çalışıyor, yakınlaştırma değiştirilebiliyor
- [ ] Baki eşiği belirledi, `URETIM-NOTU.md`'ye yazıldı
- [ ] Birleştirme listesi Baki tarafından onaylandı

**Adım 5**
- [ ] Tüm veri dosyaları yeniden üretildi
- [ ] `npm.cmd run kontrol` temiz
- [ ] Her ilin payları toplamı tam 1.00
- [ ] Eşik altında parça kalmadı (tek parçalı iller hariç)
- [ ] Tam sayı üretim kuralları hâlâ geçiyor
- [ ] Kayıt sürümü 2, eski kayıtlar anlaşılır mesajla reddediliyor

**Adım 6**
- [ ] İki belge de yeni sayılarla eşitlendi
- [ ] Testler güncellendi, iç çember eşiği testi eklendi
- [ ] `URETIM-NOTU.md` güncel
- [ ] Telefonda test edildi

---

## 13. SONRAKİ GÖREV (bilgi amaçlı — bunu yapma)

**Görev 04 — Ordu üretimi.** Biriken nüfus ve ekonomi burada harcanacak: doğrudan birim satın alma ekranı (§4.2), birim maliyetleri (§4.1), garnizon/sefer bölüşümü (§4.4), "geçen turun siparişini tekrarla" düğmesi.

Ordu rozetinin gerçek hali orada yapılacak. Bu görevde belirlenen rozet boyutu ve eşik oraya girdi olacak — `URETIM-NOTU.md`'de kayıtlı tut.
