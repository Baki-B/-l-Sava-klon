# GÖREV 07 — BİTİŞ RAPORU

> Tarih: 2026-07-31 · Görev tanımı: `docs/GOREV-07-yapay-zeka.md`
> Önceki: `docs/GOREV-06-RAPOR.md` · Günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

**Dünya artık kendi kendine oynuyor.** 80 tarafsız garnizon karar veren aktöre dönüştü:
kaynak topluyor, asker basıyor, araştırıyor, yaralısını topluyor, saldırıyor ve geri
çekiliyor. Tur döngüsünün son boş maddesi — 8. madde, sıra — doldu.

Oyun bu görevden sonra **baştan sona oynanabilir**: kaynak üret, asker bas, yürü, savaş,
fethet, toparlan, güçlen — ve karşında düşünen biri var.

---

## 2. BİTİŞ ÖLÇÜTÜ — SAYI

Görev belgesi başarıyı bir sayıya bağlamıştı: aynı oyuncu davranışı, dünya oynarken.
Ölçüm `node scripts/zeka-olcum.js` → `veri/zeka-olcum.md`. 15 tur:

| Koşu | Oyuncunun aldığı parça | Kalan bağımsız aktör | En büyük rakip |
|---|---|---|---|
| Dünya duruyor (Görev 06 hâli) | 5/181 | 81 | 4 parça |
| Dünya oynuyor — **kolay** | 9/181 | 79 | 5 parça |
| Dünya oynuyor — **orta** | 1/181 | 70 | 10 parça |
| Dünya oynuyor — **zor** | 0/181 | **32** | **28 parça** |

**Okunuşu:** §9.3'ün öngördüğü **doğal konsolidasyon** ölçülebilir hâle geldi — zor
kademede 81 aktör 15 turda 32'ye iniyor ve ortada 28 parçalık bir imparatorluk beliriyor.
Zorluk kademesi gerçek fark yaratıyor ve bunu **gizli bonusla değil**, yalnızca kişilik
ağırlıkları ve karar gürültüsüyle yapıyor.

Kolay kademede oyuncunun durgun dünyadan bile fazla toprak alması ters gibi görünüyor ama
değil: ürkek rakipler birbirini yıpratıp açık veriyor. Zorda oyuncu eleniyor — simülasyondaki
oyuncu politikası bilerek basit ("her parçadan her şeyle saldır"), gerçek oyuncu bundan iyi
oynar.

---

## 3. BEŞ SORUNUN CEVABI

| Soru | Cevap | Sonucu |
|---|---|---|
| 1 — Aktörler aynı anda mı oynar | **A2** (ara yol) | Sıra tohumla karışır, aktör O ANKİ duruma bakar |
| 2 — Kuvveti nasıl böler | **A** — tümü / yarısı | Parça başına ~2 × komşu aday; telefon rahat kaldırıyor |
| 3 — Garnizon il ölçeğinde mi | **A** — il düzeyinde bütçele | Değer÷savunma yayılımı 6.67 → 1.56 kat |
| 4 — Kişilik ve zorluk | **A** — ikisi de, ekransız | Üç kademe ayarlar menüsünde |
| 5 — 80 aktörün turu nasıl görünür | **A** — kademeli | Cephede ayrıntı, uzakta en fazla 5 manşet |
| + Diplomasi kapsama girsin mi | **Hayır** | Görev 08'e |

### Soru 1'in hikâyesi — belge yanıldı, Baki düzeltti

Görev belgesi düz **eşzamanlı tur** öneriyordu. Baki itiraz etti:

> *"A'yı yapalım ama adımlar sırayla işlenince ben bir yeri aldım, adam alınan yerden başka
> bir yere saldırı yapmak istiyordu; olur yani B bana daha mantıklı geliyor, bunların arasını
> bulabilir miyiz?"*

Tarif ettiği durum kodda zaten ele alınıyordu (`cozum.js` kaynağı elden çıkan emri düşürüyor)
ama asıl istediği daha fazlasıydı: **aktör o durumu görüp aptal kalmasın.** Seçilen ara yol
(**A2**): çözüm sırası her tur tohumla karışır, sıra bir aktöre geldiğinde o aktör **o anki**
duruma bakarak karar verir ve emri hemen çözülür. Tek TURU BİTİR anı korunuyor, ölü emir hiç
doğmuyor.

Bedeli açıkça söylendi ve kabul edildi: oyuncu emirlerini tur başında planlıyor, sırası ondan
sonra gelen aktör onun hamlesini görmüş oluyor. Sıra her tur karıştığı için bu avantaj kimsede
kalıcı değil.

---

## 4. GÖREV 06'NIN DEVRETTİĞİ ÜÇ İŞ — ÜÇÜ DE KAPANDI

### 4a. Moralin tek yönlülüğü (§13/1b)

**En değerli ders bu görevde de tekrarlandı: ölçütün kendisi de yanlış olabilir.**

Görev belgesi dört aday sayıyordu. Ölçüm gösterdi ki **üçü aynı kapıya çıkıyor**: kayıp
SAYISINA bakan hiçbir formül granülerliği çözemez, çünkü kayıp tam sayıdır. Eşik nereye
konursa konsun 3 ve 4 birimlik ordu aynı sayıda kayıpta bozulur.

Çözüm bozgunu **sürekli** bir büyüklüğe bağlamak oldu: ordunun kaybettiği can oranı.

| | Önce (sayaç) | Sonra (oran 0.50) |
|---|---|---|
| Birlik ekleyince kazanırken KAYBEDEN | 104 / 416.025 = **%0.02** | **0** |
| Birlik ekleyince sağ kalanı AZALAN | 25.072 = **%6.03** | 20.049 = **%4.82** |
| §3.7'nin 15 satırı | 15/15 | **15/15** |
| Bugünkü oyunla uyum | — | **%99.36** |

**Ölçütü üç kez düzeltmek gerekti.** İlk koşuda beş modelin beşi de "§3.7 TAM" dedi; testler
koşulunca dördü kırıldı. Sebep: oran modeli bozgunu birim kaybından koparınca **ordu hiç
kimse ölmeden dağılabiliyordu** (1 zırhlı vs 1 piyade'de piyade imha olmadan kaçıyordu).
"En az bir kayıp" şartı bunu düzeltti. Ölçüt sonra iki kez daha daraltıldı — bir kez fazla
sıkı olduğu (bugünkü oyun bile geçemiyordu), bir kez de testlerin baktığı yere hizalanmadığı
için.

Betik: `scripts/moral-olcum.js` → `veri/moral-olcum.md`.

### 4b. Garnizon il ölçeğinde dengelendi (§13/1c)

Baki'nin şikâyeti — *"Ankara'da 20 asker var ama İstanbul'da 10"* — doğruydu: garnizon parça
başına hesaplanıyor, ilin toplamı **yüzölçümünden gelen** parça sayısıyla çarpılıyordu.

Bütçe artık **il düzeyinde**, ilin değerine orantılı; parçalara bölüşüm §7'nin zaten testli
üç kuralıyla (`parcaDegerleri`).

| | Eski | Yeni |
|---|---|---|
| Değer ÷ savunma yayılımı | **6.67 kat** | **1.56 kat** |
| Oranların standart sapması | 0.85 | **0.10** |
| Toplam garnizon | 470 birim | 475 birim |
| İstanbul / Ankara | 10 / 20 | **13 / 12** |

Toplam bilerek korundu: açılışın sertliği değişmedi, değişen yalnız **dağılım**.
Betik: `scripts/garnizon-olcum.js` → `veri/garnizon-olcum.md`.

### 4c. Kartopu

Bu görevin kendisi kartopunun cevabı: garnizon tükenince yerine yenisi gelmiyordu, artık
aktörler asker basıyor. Ölçüm §2'deki tabloda.

---

## 5. GÖREV ORTASINDA GELEN ÜÇ İSTEK

Baki oyunu cihazda denedi ve üç şey istedi. Üçü de yapıldı.

### 5a. Parça dağılımı çok dengesizdi

> *"İlin geneli 8 güçte 1 parçaya 7 diğerine 1 vermek çok dengesiz; 2-6 veya 3-5 gibi biraz
> daha yakın yap ama yakınlığı abartma."*

Ölçüldü, haklıydı: Gaziantep 9 güçte **8-1**, İzmir 11'de **9-2**. Paylar eşite doğru
yumuşatılıyor (`GARNIZON.PAY_YUMUSATMA = 0.5`, ölçümle seçildi):

| İl | Önce | Sonra |
|---|---|---|
| Gaziantep | 8-1 | **6-3** |
| İzmir | 9-2 | **7-4** |
| İstanbul | 8-5 | **7-6** |

En dengesiz ilin payı %89 → %75, ortalama %51 — yani tam eşite de gitmiyor.

### 5b. "Oyunda ondalıklı hiçbir şey istemiyorum"

Kök sebep %8 oransal araştırma artışının kesirli stat üretmesiydi (6 → 6,48).

**Çözüm ölçeği büyütmek oldu, formülü bozmak değil:** dört muharebe statının hepsi **25×**
çarpıldı (`STAT_OLCEGI`), muharebe bölenleri de aynı oranda. Bütün oranlar korunduğu için
§3.7'nin 15 satırı **birebir** aynı kaldı (ölçüldü: kırık yok) ve %8'in tam sayı çıkması
garantiye bağlandı. 25, bunu sağlayan en küçük katsayı.

Aynı geçişte ayıklananlar: araştırma puanı (kesirli birikim → tam sayı, ölçek 10×), fetih
ganimeti (`+1.8 nüfus` → tam sayı, en az 1), kayıt boyutu göstergesi. "15 tur oyna, hiçbir
havuzda kesir çıkmasın" diye kalıcı bir test eklendi.

### 5c. Araştırma ekranı iki kademeli

> *"Tıklayınca 3 tane logo görmemiz: ilki piyade, ikinci topçu, üçüncü zırhlı. Onlara
> tıklayınca her birinin kendi ağacı açılsın, detaylıca açıklamaları orada gözüksün."*

Yapıldı: üç birim ikonu (miğfer / obüs / paletli tank, `Ikonlar.js`), kartta "2/12 seviye" ve
puanı yeten yükseltme varsa "yükseltme hazır" işareti. Karta basınca o birimin dört dalı,
her birinin altında kalıcı açıklamasıyla.

---

## 6. ARAŞTIRMA AĞACI YENİDEN KURULDU (Baki'nin isteği)

> *"Her birlik türü için farklı bir ağaç yapalım... 3 ana 1 kendine özgü, 3 seviyeli ağaçlar,
> karmaşıklık çok artmadan özgünlük katsın."*

| Ağaç | Ana dallar | Kendine özgü |
|---|---|---|
| Piyade | zırh · ağır vuruş · hafif vuruş | **Seferberlik** |
| Topçu | zırh · ağır vuruş · hafif vuruş | **Baraj ateşi** |
| Zırhlı | **paletli üstünlük** · ağır vuruş · hafif vuruş | **Yarma** |

**Ölçümün en net bulgusu: zırhlının savunma dalları olamıyor.** Zırh ve dayanıklılık her
artış oranında **Sv.0** verdi — zırhlı zaten tavanda ve bir tık artırmak §3.7'nin "3 piyade
1 zırhlıyı yener" satırını anında kırıyor. Üçüncü ana dalı bu yüzden **paletli üstünlük**:
arazinin zırhlıya verdiği cezayı yumuşatıyor, ki zırhlının gerçek zayıflığı zaten arazi.

**Tavan Sv.2 → Sv.3.** Yükselten şey büyütülmüş bir sayı değil, **dalın birime özgü olması**.

**İki katsayı ölçümle düzeltildi:** baraj ateşi %15'ti ve §3.7'yi Sv.1'de kırıyordu (kırılan
satır hep "4 zırhlı vs 6 topçu, ova" — altı topçunun açılış yaylımı zırhlının en net satırını
ters çeviriyor) → **%6**. Paletli üstünlük %15 → **%12**.

Ağacın tamamı 12 dal × 360 puan. Kimse 15 turda bitiremez; **seçmek** zorunda kalır.

---

## 7. TASARIMDA DOLDURULAN BOŞLUKLAR

| Boşluk | Nasıl dolduruldu |
|---|---|
| §9.1 "Ordu'nun değeri" | Parçanın nüfus+ekonomi getirisi + ili tamamlıyorsa `IL_BONUSU` |
| "Kazanma olasılığı" | **Üstünlük oranı** — `muharebeTahmini().ustunluk`. İkinci tahmin yazılmadı |
| "Başka cepheyi açıkta bırakma cezası" | Düşman komşulardaki kuvvet ÷ (geride kalan + 1), tavanlı |
| Ne kadarı orduya, ne kadarı araştırmaya | Açgözlülük böler; oran `DENGE.ZEKA`'da |
| Hangi bileşimde asker basar | §4.5 tablosu — garnizonun kullandığı `KARISIM` aynen |
| Nerede asker basar | Düşmana sınırdaş, sanayi hakkı kalan kendi parçası |
| Toparlanma kararı | Kadronun `TOPARLANMA_ESIGI` kadarı eksikse; cephedekiler önce |
| Araştırma dalı seçimi | Sınırdaş düşmanların baskın birim türü; yoksa kişiliğe göre |
| Kişilik nasıl dağıtılır | Tohumdan, belirlenimci; **kayıtta değil, türetiliyor** |
| Emir vermeyen aktör | Geçerli durum — turu boş geçer, hata değil |
| Zekâ oyuncunun bileşimini görür mü | Evet, oyuncu da görüyor (savaş odası) |
| Zekânın ekonomisi ayrı mı | **Hayır.** Aynı `butce.js`, aynı sanayi sınırı, aynı fiyatlar |

---

## 8. BELGEYE UYMADIĞIM YERLER

1. **Kişilikler kayda GİRMİYOR.** Belge §6 "kayıtta tutulur ki yükleyince aynı rakiplerle
   devam edilsin" diyordu. Aynı sonuç **türeterek** elde ediliyor (tohum + aktör listesi +
   zorluk zaten kayıtta) ve daha güvenli. Ölçüldü: 81 aktör × 4 ağırlık kaydı 27.3 KB'a
   çıkarıyordu — belgenin 26 KB sınırının üstü. Türetince 19.4 KB.

2. **Orduların `sahip` alanı da kayda girmiyor.** Bir parçada tek sahip var ve ordunun sahibi
   her zaman parçanın sahibi — 15 turluk simülasyonda 2664 kaydın hiçbirinde ayrışma yok.
   Yüklerken `parcaSahipligi`'nden geri konuyor; bir test bu değişmezi kilitliyor.

3. **`kisilik.js` diye belgede olmayan bir dosya açıldı.** Kişilik üretimi `zeka.js`'teydi ve
   `oyunDurumu.js` onu çağırınca **döngüsel bağımlılık** doğdu. Görev 06'da `kadroAl` aynı
   sebeple `ordu.js`'e konmuştu; kural aynı.

4. **Kayıt sürümü 7, Adım 7'de değil Adım 5'te yükseltildi.** Durumun biçimi orada değişti;
   sonraya bırakmak arada sürüm 6 kaydı yükleyip sessizce bozulmak demekti. (Görev 06'da da
   aynı gerekçeyle aynı şey yapılmıştı.)

5. **Zorluğa üretim bonusu VERİLMEDİ.** Tasarım §9.4 "zor: + küçük üretim bonusu" diyordu.
   Ölçüm bonussuz da yeterli fark olduğunu gösterdi (kalan aktör kolayda 79, zorda 32) ve
   gizli bonus §9/tuzak 5'in tam olarak uyardığı şey. Belge bu satırıyla birlikte güncellendi.

6. **Dost parçaya takviye taşıma hamlesi yazılmadı.** Zekânın fayda formülü fetih üstüne
   kurulu (§9.1); takviye, diplomasi ve cephe yönetimiyle birlikte anlamlı olur (Görev 08).
   Şu hâliyle zekâ kuvvetini üretimle cephede topluyor. **Bilinen sınır** — §12'de yazılı.

---

## 9. DEĞİŞEN DOSYALAR

**Yeni:**

| Dosya | İşi |
|---|---|
| `src/oyun/zeka.js` | Karar fonksiyonu: hamle adayları, fayda formülü, ekonomi kararları |
| `src/oyun/kisilik.js` | Kişilik üretimi (döngüsel bağımlılık yüzünden ayrı) |
| `src/oyun/sira.js` | A2 sıra sistemi ve yapay zekânın ekonomi turu |
| `src/bilesenler/TurPerdesi.js` | Tur işleniyor perdesi + oyun sonu kutusu |
| `scripts/moral-olcum.js` · `scripts/garnizon-olcum.js` | Adım 1 ve 2 ölçümleri |
| `scripts/arastirma-olcum.js` · `scripts/zeka-butce-olcum.js` | Ağaç tavanı, kare bütçesi |
| `scripts/zeka-olcum.js` | Görev 07'nin bitiş ölçütü |
| `testler/zeka.test.js` · `testler/sira.test.js` | 45 yeni test |

**Değişen:** `denge.js` (ZEKA, GARNIZON, MUHAREBE.MORAL, ARASTIRMA, BIRIMLER ölçeği) ·
`muharebe.js` (bozgun modeli, üstünlük dışa açıldı, baraj/palet) · `garnizon.js` (il düzeyi
bütçe) · `arastirma.js` (birim başına ağaç) · `cozum.js` (aktör filtresi, yarma) ·
`turDongusu.js` (sıra sistemi) · `oyunDurumu.js` (kişilik, zorluk, sürüm 7) ·
`kayitVerisi.js` (türetilen alanlar) · `toplanma.js` (seferberlik) · `hareket.js` ·
`ordu.js` · `fetih.js` (tam sayı ganimet) · `oyunKancasi.js` · `App.js` ·
`ArastirmaEkrani.js` · `TurRaporu.js` · `AyarMenusu.js` · `Ikonlar.js` (üç birim ikonu)

**Belgeler:** `il-savasi-tasarim.md` (§3.8, §6, §8, §9.1, §9.3, §9.4, §14) · `URETIM-NOTU.md`

---

## 10. SAYILAR

| | Görev 06 | Görev 07 |
|---|---|---|
| Test | 348 | **436** |
| Kayıt sürümü | 6 | **7** (1–6 reddediliyor, 6'ya ayrı sebep) |
| Kayıt boyutu (başlangıç) | 21.6 KB | **19.4 KB** |
| Kayıt boyutu (15 tur) | 22.3 KB | **25.2 KB** (sınır 26) |
| Araştırma tavanı | Sv.2 | **Sv.3** (12 dal) |
| Tur başına hesap | ~1 ms | **~45 ms** (kare bütçesi 16.7 ms, ölçüm ayrı) |
| Kritik muharebe anomalisi | %0.02 | **0** |
| Garnizon yayılımı | 6.67 kat | **1.56 kat** |

`npm run kontrol` temiz: veri tutarlı, ESLint temiz, biçim temiz, 436 test geçiyor.

---

## 11. YAPILMAYANLAR VE BİLİNEN BORÇLAR

**Bilerek yapılmayanlar:** diplomasi (§10) · rekabet olayları (§11) · mod seçim ekranı ·
tam kazanma koşulu ekranı (§8.1) · ana menü · sıcak koltuk · para kazanma.

**Bilinen ve kabul edilen kusurlar:**

1. **Zekâ dost parçalarına takviye taşımıyor.** Kuvvetini üretimle cephede topluyor; iç
   bölgedeki ordusunu cepheye yürütmüyor. Görev 08'de diplomasi ve cephe yönetimiyle
   birlikte anlamlı olacak.

2. **Husumet ağırlığı 0.** Hasım çiftleri verisi depoda yok (tasarım §13.2'deki ✅ eski
   projeye ait). Formüldeki terim yerinde duruyor; Görev 08'de §11 ile açılacak.

3. **Zor kademede oyuncu 15 turda elenebiliyor.** Simülasyondaki oyuncu politikası bilerek
   basit; gerçek oyuncunun ne yaşadığı **cihazda denenmeli**. Sert gelirse `DENGE.ZEKA`'nın
   düğmeleri hazır (`EN_AZ_PUAN`, `TERIM.SALDIRI`, zorluk aralıkları).

4. **Kayıt 15 turda 25.2 KB, sınır 26.** Dar geçiyor. Uzun oyunda aşarsa ilk kısaltılacak
   şey ordu kayıtlarındaki `kadro`/`yarali` alanları.

5. **Tur perdesi cihazda ölçülmedi.** Geliştirme makinesinde tur ~45 ms; telefonda birkaç
   kat olabilir. Perde var ama gerçek süresi Baki'nin denemesiyle bilinecek.

---

## 12. SIRADAKİ: GÖREV 08

Diplomasi (§10: ittifak · ateşkes · savaş hali) · rekabet olayları (§11: Kutsal Fındık
Savaşı ve husumet tablosu) · mod seçim ekranı ve tam kazanma koşulu (§8.1) · ana menü ·
sıcak koltuk · para kazanma katmanı (§12).

Görev 08'in elinde bu görevden çıkan hazır girdiler olacak:

- **Ayarlanmış kişilik ağırlıkları** — diplomasi kararı §9.4'ün aynı ağırlıklarına bağlanacak
- **Fayda formülü** — ittifak/savaş teklifi değerlendirmesi aynı mantıkla yazılabilir
- **Zorluk kademesi ve ölçüm düzeneği** — yeni mekaniğin dengesi aynı betikle ölçülür
- **Husumet terimi** — formülde hazır bekliyor, yalnızca veri gerekiyor

Bu görev bittiğinde oyun **oynanabilir**. Görev 08 onu **bitirilebilir** ve
**yayınlanabilir** yapan katman.
