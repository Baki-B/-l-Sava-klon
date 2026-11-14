# GÖREV 12 — KARAKTERLER, ŞANS VE DİPLOMASİ PANELİ

> Tarih: 2026-08-06 · Baki'nin isteği (aynı gün, beş madde)
> Önceki: Görev 11 (savaş ilanı + çift hamle — raporu yazılmadı, bkz. §8)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. BAKİ NE İSTEDİ

1. **Üç karakter** (Saldırgan / Dengeli / Çekimser) 81 ile rastgele dağılsın; her oyun
   farklı ilerlesin. *"Asıl olay her oyun aynı ilerlemelerin olmaması."*
2. **Şans bir tık artsın, arazinin etkisi bir tık azalsın** — ama arazi hâlâ şanstan
   güçlü kalsın. Zayıf görünen ordu **~%1** ihtimalle kazanabilsin; **1 piyade vs 2 zırhlı
   gibi umutsuz eşleşmelerde bu ihtimal 0 olsun.** *"Tasarımdaki '2 piyade 3 zırhlıyı alır'
   yaklaşımından biraz uzaklaşabiliriz."*
3. **Diplomasi paneli daha etkileşimli olsun ama sadeliği bozulmasın**; ayrıca **teklifin
   cevabı panele gelsin** (şu an harita ekranına düşüyor — hata).
4. **Ses beklemede.** Baki söyleyene kadar konu açılmayacak.
5. **Çıkış hazırlığı** — oyunun sıkıntısız yayınlanması için ne gerekiyorsa.

### Baki'nin üç kararı (2026-08-06)

| Soru | Cevap |
|---|---|
| Karakterler görünsün mü | **Tanıdıkça görünsün** — sınırdaş olduğun / savaştığın devletlerde yazar, uzaktakiler bilinmez |
| Şans yaklaşımı | **A + B + C hepsi** (§3) |
| Diplomasi paneli | **Satır açılır + masadaki teklifler** |

---

## 2. KARAKTERLER — DÜZENEĞİN YARISI ZATEN VAR

`kisilikUret` (src/oyun/kisilik.js) her maçta tohumdan dört ağırlık üretiyor ve tohum yeni
maçta rastgele geliyor. Yani "her oyunda farklı iller farklı huyda" **bugün de oluyor.**

**Eksik olan üç şey:**

1. **Huylar sürekli sayı, aralıklar dar.** Orta zorlukta üç ağırlık da `[0.3 – 0.8]`
   arasından çekiliyor; 81 ilin hepsi ortalama çıkıyor, kimse belirgin bir karakter değil.
2. **Oyuncu göremiyor.** Fark hissedilmiyorsa fark yok demektir.
3. **Çeşitliliğin ölçüsü yok.** "Her oyun farklı ilerliyor" bugüne kadar hiç ölçülmedi.

### Yapılacak

`denge.js`'e **`KARAKTERLER`** tablosu girer: üç karakter, her birinin kendi DAR ağırlık
aralığı. İl artık "0.52 saldırganlık" değil, bir karakter çeker ve ağırlıklarını o
karakterin aralığından alır.

**Zorluk kademesi karışım oranını kaydırır**, aralıkları değil: zorda saldırganlar
çoğunlukta, kolayda çekimserler. Bu, §9.4'ün "zorluk = ağırlık ayarı, gizli bonus değil"
kuralını bozmuyor — sadece kimlerle oynadığın değişiyor.

**Kişilik yine KAYDA YAZILMAZ, tohumdan türetilir** (Görev 07 §8/1'in kararı). Kayıt
büyümez.

### ⚠ KAYIT SÜRÜMÜ 10 → 11

Türetme değişince **eski kayıttaki rakipler sessizce başka insanlara dönüşür.** Aynı tuzak
Görev 08'de bir kez yaşandı ve `kisilik.js`'in içinde yazılı: husumet bayrağı üreteçten bir
sayı tükettiği için bütün kişilikler kaymıştı. Sürüm yükseltilmezse sürüm 10 kaydı yüklenir
ve oyuncu "geçen sefer barışçıl olan komşum neden saldırdı" der.

### Görünürlük (Baki: "tanıdıkça")

Karakter, `tanidiklar()` süzgecinden geçen devletler için yazılır — yani sınırdaş olduğun,
savaştığın ya da adı duyulmuş olanlar. İki yerde:
- **Diplomasi satırında** — "SALDIRGAN · senden büyük"
- **İl panelinde** — o ilin sahibi tanıdığınsa

Uzaktaki bir devletin karakteri **görünmez**: keşif hissi kalsın, harita ilk turdan
okunmuş olmasın.

### Bitiş ölçütü — ÖLÇÜLECEK

`scripts/karakter-olcum.js` (yeni): aynı zorluk, **beş farklı tohum**, 25'er tur. Ölçülen:
en büyük imparatorluğun büyüklüğü, savaş sayısı, ilk saldırının turu, hayatta kalan aktör.
**Beş koşunun birbirinden ayrışması** bu adımın geçme şartı; ayrışmıyorsa karakterler
kâğıt üstünde kalmış demektir.

---

## 3. ŞANS VE ARAZİ — ÜÇ ÖLÇÜM, ÜÇ DERS

Kod yazmadan önce üç ölçüm koşturuldu (2000'er muharebe). **Üçü de belgeyi düzeltti.**

### 3a. Şans bandını büyütmek sürpriz ÜRETMİYOR

| Eşleşme | bugün (±%10) | ±%16 | ±%25 | ±%40 |
|---|---|---|---|---|
| 3 piyade → 4 piyade | %0 | %0 | %0 | %4.8 |
| 2 piyade → 3 piyade | %0 | %0 | %0 | %0.1 |
| 1 piyade → 2 zırhlı (umutsuz) | %0 | %0 | %0 | **%0** |
| 4 piyade → 3 piyade (dağlık) | %100 | %99 | %90 | **%77** |

**Sebep:** şans her raundda AYRI çekiliyor, 5–10 raunt boyunca ortalamaya yakınsıyor
(büyük sayılar yasası). Bandı büyütmek zayıfı güçlendirmiyor, sadece **güçlünün zaferini
bozuyor** — son satır bunu gösteriyor.

### 3b. Moral/bozgun eşiğini düşürmek de çözmüyor

Savunanın bozgun eşiği iki kademe düşürüldü (moral bonusu −2). **Hiçbir eşleşme dönmedi.**
Motor bir **yıpranma yarışı**: zayıf taraf kendi eşiğine her hâlükârda önce varıyor.

### 3c. Umutsuz eşleşme şartı ZATEN sağlanıyor

`SANS_KAPANMA_ORANI = 2` güç farkı 2 katı aşınca şansı tamamen kapatıyor. 1 piyade vs
2 zırhlı ham oranı **3.68** — denenen her ayarda %0 kaldı. Bu kural korunacak.

### Seçilen yol: A + B + C

**A · Sayı ayarı.** `SANS_BANDI` 0.10 → **0.15**; arazi bir tık aşağı (dağlık savunma
1.35 → **1.25**, tepelik 1.15 → **1.10**, zırhlının dağ cezası 0.50 → **0.60**). Ayrıca
bugünkü **sert kapanma bıçağı rampaya çevrilir**: güç farkı 1'den 2'ye giderken şans
yavaşça söner, 2.0'da birden kesilmez. Arazi hâlâ şanstan güçlü — Baki'nin istediği sıra.

**B · Muharebe başına tek zar ("o günkü hâl").** Şans, raunt başına ek olarak bir de
**savaş başına bir kez** çekilir ve tüm raunt boyunca sabit kalır. Ölçüldü: ±%12 ile
dağlıkta zayıf zırhlının kazanma şansı %1 → **%8.9** çıkıyor, **güçlünün zaferi ise
bozulmuyor** (%99.1). Bandı büyütmekten kesinlikle daha iyi bir alet.

**C · BASKIN olayı — istenen %1'i veren tek şey.** Ham oran kapanma eşiğinin altındaysa,
küçük bir olasılıkla **zayıf taraf ilk raundu bedavaya alır** (savunan o raunt karşılık
veremez). Bu bir çarpan değil, savaşın **yapısını** değiştiren bir olay — yıpranma
yarışının kilidini kıran tek şey bu. Umutsuz eşleşmede tetiklenmez.

Olasılık **ölçümle** seçilecek; hedef: "zayıf görünen ordu ~%1 kazanır, açık üstün olan
%99 kazanmaya devam eder."

### ⚠ §3.7'NİN 15 SATIRI KIRILACAK — BİLEREK

Arazi çarpanlarına dokunmak tasarımın doğrulama tablosunu bozar; ölçümde bir satır şimdiden
ters döndü (dağlıkta 3 zırhlı vs 4 piyade). Baki *"uzaklaşabiliriz"* dedi.

**Tablo çöpe atılmıyor, yeniden çiviliyor:** yeni sayılarla `scripts/muharebe-referans.js`
yeniden koşturulup **yeni tablo** üretilecek ve testler ona bağlanacak. Yoksa altı görevdir
elimizdeki tek dış kontrol noktası kaybolur ve muharebe motorunun doğruluğunu ölçecek
hiçbir şey kalmaz.

---

## 4. DİPLOMASİ PANELİ

### 4a. HATA — cevap panele gelmiyor (Baki bildirdi)

**Kök sebep bulundu.** Teklifin cevabı `setHaber` ile **harita ekranının bildirim şeridine**
yazılıyor (`oyunKancasi.js teklifVer`), ama diplomasi ekranı tam perde olduğu için o şerit
**perdenin altında kalıyor.** Oyuncu panele bakarken hiçbir şey olmuyor sanıyor.

**Aynı hatanın ikinci yüzü:** gelen teklif kartı `!diplomasiAcik` koşuluyla çiziliyor
(`App.js`), yani panel açıkken gelen teklif **hiç görünmüyor.**

**Düzeltme — tek kaynak, iki yüzey:** cevap tek yerde üretilir (`diplomasiBildir`), panel
açıkken **satırın kendisinde**, kapalıyken bildirim şeridinde görünür. Bildirim şeridi panel
açıkken susturulur (ayar menüsünde zaten uygulanan kalıp).

### 4b. Etkileşim (Baki: "satır açılır + masadakiler")

- **Satır kapalıyken bugünkü gibi:** ad · durum · büyüklük · tek gerekçe · düğmeler.
  **Sadelik burada korunuyor.**
- **Ada dokununca açılır:** ortak düşmanlar, kaç cephede savaştığı, müttefikleri, savaşın
  kaç turdur sürdüğü, nasıl tanıştığınız, ilan neden yapılamıyor. Aynı anda **tek satır**
  açık kalır.
- **MASADAKİ TEKLİFLER** panelin üstünde ayrı bölüm; KABUL ET / GERİ ÇEVİR orada.

**Düğmelere dokunmak satırı açmaz:** yalnızca ad sütunu basılabilir.

---

## 5. ÇIKIŞ HAZIRLIĞI (Baki'nin 5. maddesi)

İnceleme sırasında bulunan, **çıkışı gerçekten engelleyecek** maddeler:

| # | Madde | Durum |
|---|---|---|
| 1 | **Harita verisinin atıfı yok** — OpenStreetMap/ODbL atıf zorunlu, `src/` içinde tek satır yok | YASAL, şart |
| 2 | **Çökme koruması yok** — tek çizim hatası beyaz ekran | şart |
| 3 | `GELISTIRICI_MODU: true` — oyuncu uzun basınca il hediye edebiliyor | şart |
| 4 | Cihazda denenmemiş: ana menü akışı, savaş ilanı, çift hamle | şart |
| 5 | `SANIYE_PER_TUR = 45` ölçülmedi — bütün maç uzunlukları buna dayanıyor | ölçülmeli |
| 6 | %50 Hâkimiyet'in 70 turu, Görev 11'in yavaşlattığı tempoyla dar kalabilir | ölçülmeli |
| 7 | Belge borcu: Görev 10A/11 raporu yok, günlük 3 Ağustos'ta durmuş, tasarım belgesi kodun tersini söylüyor | §8 |
| 8 | Ses | **BEKLEMEDE — Baki söyleyene kadar açılmayacak** |

---

## 6. SIRA

Adımlar birleştirilmez. Her adım sonunda dokunulan dosyalar + Baki'nin telefonda göreceği
tek cümle yazılır; Baki doğrulamadan sonrakine geçilmez (CLAUDE.md §7).

| # | İş | Baki'nin göreceği |
|---|---|---|
| 0 | Tasarım belgesinin kodla çelişen iki cümlesi düzeltilir (savaş ilanı · çift hamle) | yok (belge) |
| **1** | **Diplomasi hatası + panel** (§4) | **teklifin cevabı panelde kalır, satır açılır** |
| 2 | Karakterler (§2) + kayıt sürümü 11 + `karakter-olcum.js` | diplomasi/il panelinde karakter yazar |
| 3 | Şans A: sayılar + rampalı kapanma; §3.7 yeniden ölçülür | savaşlar biraz daha oynak |
| 4 | Şans B: muharebe başına tek zar | yakın savaşlar sürpriz verir |
| 5 | Şans C: baskın olayı + sahne kartı; olasılık ölçümle | "BASKIN!" — zayıf ordu bazen kazanır |
| 6 | Çıkış: OSM atıfı · çökme koruması · geliştirici modu | ayarlarda atıf satırı |
| 7 | Rapor + günlük | yok (belge) |

---

## 7. TUZAKLAR (bu görevde canımızı yakabilecekler)

1. **Kayıt sürümü Adım 2'de yükselecek**, sonraya bırakılmayacak — Görev 06/07/09'un
   dersi: sürüm, durumun biçimi değiştiği ADIMDA yükselir.
2. **Şans değişikliği yapay zekânın tahminini bozar.** `muharebeTahmini` şanssız
   çalışıyor (bilerek); baskın olayı eklenince tahmin "kesin" demeye devam edecek ama
   sonuç bazen değişecek. Bu, tahminin YALAN söylemesi değil — ama arayüz dili gözden
   geçirilmeli ("kesin" → "neredeyse kesin").
3. **Karakter tablosu kayda sızmamalı.** Türetiliyor; bir kere kayda yazılırsa 81 aktör ×
   4 ağırlık kayıt boyutunu 8 KB büyütür (Görev 07 ölçtü).
4. **Panel açılır satır, `React.memo` kimliğini bozabilir.** Satır bileşenine giden her
   şey sabit kimlikli olmalı.

---

## 8. AÇIK BORÇ: GÖREV 10A VE 11'İN BELGELERİ

Görev 11 (savaş ilanı + çift hamle) **hiç belgelenmedi**; Görev 10A'nın raporu yazılmadı;
`veri/URETIM-NOTU.md` 3 Ağustos'ta duruyor. Tasarım belgesi hâlâ *"savaş ilanı yok,
saldırının kendisi ilandır"* (§10.1) ve *"bir birim turda tek hamle, art arda fetih zinciri
imkânsız"* (§7) diyor — **ikisi de kodun tersi.**

Adım 0 bu iki cümleyi düzeltiyor. Raporların tamamı Adım 7'de, bu görevin raporuyla
birlikte yazılacak.

---

## 9. BAKİ'NİN EK İSTEĞİ: ÇIKMAZ (2026-08-06)

> *"Bazı illerin — mesela İzmir'in Balıkesir, Çanakkale sınırında — o 3 parça birbirine
> değiyor ve aynı yere 10-20 asker yığmaya başlıyorlar; her biri her tur aynı yere basıyor,
> diğerlerini ignoreluyor. Çok sinir bozucu ve oyunu uzatacak bir şey. Bence bu çekimser
> karakterli illerde olsun ama yine eskisine göre kesinlikle azalsın."*

**KÖK SEBEP:** üstünlük fayda formülünde bir ÇARPAN'dı, bir KAPI değil. Değerli bir hedefte
(İzmir gibi) `DEGER × açgözlülük × değer × üstünlük` terimi, üstünlük 0.3 olsa bile
`EN_AZ_PUAN`'ı aşabiliyordu. Aktör her tur kaybedeceği saldırıyı tekrar ediyor, ordusunu
eritiyor, yerine yenisini basıyordu.

**ÇÖZÜM — `DENGE.ZEKA.UMUTSUZ_SALDIRI`:** üstünlüğü eşiğin altında kalan saldırı **aday
olmaktan çıkıyor** (puanı düşürülmüyor — düşürülen puan, hedef yeterince değerliyse yine en
yüksek olabilirdi). Eşik kişiliğe bağlı: `0.50 + 0.22 × temkin`.

- **Çekimser il** büyük üstünlük görmeden saldırmıyor → yığılıp bekliyor. Çıkmaz onun
  KARAKTERİ oluyor (Baki'nin istediği).
- **Saldırgan il** ince farkla da vuruyor ama artık kaybedeceği saldırıyı yapmıyor.

**ÖLÇÜM** (`veri/cikmaz-olcum.md`, 25 tur × 5 tohum, oyuncu hiç emir vermiyor):

| Kademe | Boşa giden saldırı | Tekrar eden | En büyük imparatorluk |
|---|---|---|---|
| Zor · kapı KAPALI | 26.0 | 1.4 | 26.8 |
| Zor · kapı AÇIK | **10.8 (−%58)** | **0.0 (−%100)** | **28.8** |

Dünya donmadı, tersine **daha çok** genişledi: aktörler ordularını et değirmenine
göndermek yerine biriktirip kazanacakları yere sürüyor.

---

## 10. ADIM 3–6 SONUÇLARI (2026-08-06)

### Şans (Adım 3–5) — `veri/sans-olcum.md`

| Eşleşme | Saldıranın kazanma oranı |
|---|---|
| 3 piyade → 4 piyade (zayıf) | **%1.2** |
| 2 piyade → 3 piyade (zayıf) | **%0.9** |
| 3 piyade → 2 zırhlı (zayıf) | **%0.8** |
| 1 piyade → 2/3/4 zırhlı (umutsuz) | **%0.0** |
| 4 piyade → 3 piyade, dağlık (üstün) | %98.8 |
| 5 piyade → 3 piyade (üstün) | %100 |

Baki'nin üç şartı da sağlandı: zayıf ~%1, umutsuz tam 0, üstün hâlâ kazanıyor.

### Arazi yumuşatması nerede kesildi

İlk deneme dağlık savunmayı 1.25'e, zırhlının dağ cezasını 0.60'a çekiyordu. Tarama
**"1 zırhlı vs 1 topçu (dağlık)" satırının ters döndüğünü** gösterdi — yani §3.7'nin
3. kısıtı ("topçunun tek şansı coğrafya") ölüyordu. Satır kılıç sırtında: 1.35'te topçu
0.18 kalanla kazanıyor, 1.30'da 0.12, 1.25'te **0.02 farkla kaybediyor**.

Yumuşatma 1.30'da kesildi, zırhlının dağ cezasına hiç dokunulmadı. **Kazanan hiçbir satırda
değişmedi**; dört satırın kalan kuvvet sayısı yeniden ölçülüp `muharebe-referans.js`'e
yazıldı.

### Çıkış hazırlığı (Adım 6)

- **OSM atıfı eklendi** — genel ayarların en altında, ODbL şartı gereği.
- **Çökme koruması eklendi** — `src/bilesenler/HataSiniri.js`, `index.js`'te en dışta.
  Projede React sınıf bileşeni kullanan tek yer (hata sınırı kancayla yazılamıyor).
- **`GELISTIRICI_MODU` bilerek AÇIK BIRAKILDI**: Baki cihazda deniyor ve uzun basma
  aracını kullanıyor. Yayın paketinden önce `false` yapılacak — bu maddenin yeri artık
  yayın kontrol listesi.

---

## 11. ADIM 9 (2026-08-06) — ARŞİV, BÖLGE DİPLOMASİSİ, GÜÇ, İTTİFAK HARİTASI

Baki'nin dört isteği yapıldı. Ayrıntı `veri/URETIM-NOTU.md`'de; buraya yalnızca **bir
ölçümün belgeyi düzelttiği yer** yazılıyor:

### ⚠ BÖLGE KURALI ZEKÂYA AÇILINCA DOYGUNLUK GERİ GELDİ

Bölge kuralı (`TANIDIK.BOLGE`) ve büyütülen kapak (`EN_COK` 10 → 30) ilk sürümde
**herkes için** geçerliydi. Test anında kırıldı: zor kademede 30 turda canlı **23 aktörün
18'i** ittifaklı çıktı — Görev 09'un üç kök sebeple çözdüğü doygunluğun aynısı.

Sebep: `tanidiklar` iki ayrı soruya birden cevap veriyor —
1. **"Kiminle konuşabilirim"** (oyuncunun listesi ve teklif kapısı)
2. **"Zekâ kime teklif götürür"** (yapay zekânın aday havuzu)

Görev 09 doygunluğu (2)'yi daraltarak çözmüştü; bölge kuralı onu üç katına çıkardı.

**Çözüm — kapı ortak, iştah ayrı:** bölge kuralı ve geniş kapak yalnızca oyuncunun
listesinde geçerli (`EN_COK_EKRAN: 30`). Zekâ `tanidiklar(durum, id, { bolgesiz: true })`
ile eski havuzunu kullanıyor (`EN_COK: 10`). Kural TEK: oyuncu bölgedeşine teklif
götürebilir, zekâ da onu aynı formülle değerlendirir — zekâ yalnızca uzak bölgedeşini
kendisi arayıp teklif götürmez.

Ölçüldü: bölge açık/kapalı doygunluk **birebir aynı** (30 turda canlı 19, ittifaklı 7).
Üç test kilitliyor (motor kapağı, ekran kapağı, zekânın havuzunda bölge yok).

---

## 12. UI TARAMASI VE BAKİ'NİN SEÇİMİ (2026-08-06)

Arayüzün tamamı tarandı. **Düzeltme: "savaş gösterisini atlama" ZATEN VAR** — gösteri
oynarken ekrana dokunmak atlıyor (`App.js`, "dokun → atla"). Tarama bunu kaçırmıştı.

Baki'nin seçtiği yedi iş, yapılma sırasıyla:

| # | İş | Büyüklük | Not |
|---|---|---|---|
| 1 | **Yardım ekranı** ("NASIL OYNANIR") | orta | Sayılar `denge.js`'ten OKUNUR, elle yazılmaz — denge değişince metin kendiliğinden düzelir |
| 2 | **Ordularım listesi** | orta | Tek ekranda bütün ordular; satıra dokununca harita oraya gider |
| 3 | **Maç sonu istatistiği** | küçük–orta | ⚠ Sayaçlar tur tur birikmeli → kayıt biçimi değişir, **sürüm 12** |
| 4 | **Başarımlar** | orta–büyük | Kalıcı ve maçtan bağımsız saklama (ayarların kalıbı), ana menüde ekran |
| 5 | **Tek ikon dili** | orta | Harita tipi, birlik ikonları, mod kartları → kontur/dolgusuz/tek kalınlık |
| 6 | **Arşivi menü diline taşı** | küçük–orta | Kâğıt atlas paneli, köşe parantezleri |
| 7 | **İl seçimi yerleşimi** | orta | "Dört köşe" revizyonu |

**Sıcak koltuk seçilmedi** — kapsam dışı kaldı (kayıt sürümünü ayrıca değiştirecekti).

⚠ 3 ve 4 birlikte yapılmalı: ikisi de sayaç biriktiriyor, ayrı ayrı yapılırsa kayıt
sürümü iki kez artar ve Baki'nin maçları iki kez ölür.
