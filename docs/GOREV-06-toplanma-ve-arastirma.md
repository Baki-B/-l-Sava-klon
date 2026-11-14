# GÖREV 06 — YENİDEN TOPLANMA VE ARAŞTIRMA

> Tarih: 2026-07-30 · Önceki: `docs/GOREV-05-hareket-ve-muharebe.md` + `GOREV-05-RAPOR.md`
> Tasarım referansı: `docs/il-savasi-tasarim.md` §3.9 (savaş sonrası), §5/3 (eğitim statı),
> §6 (araştırma), §8 (tur döngüsü), §14 (denge düğmeleri)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. BU GÖREV NE YAPIYOR

**Tur döngüsündeki iki boş aşamayı dolduruyor.** Tasarım §8'de sekiz aşama var; bugün
2. (Araştırma) ve 4. (Toplanma) aşamaları boş duruyor:

| # | Aşama | Durum |
|---|---|---|
| 1 | Üretim | ✅ Görev 03 |
| **2** | **Araştırma** | **bu görev** |
| 3 | Takviye | ✅ Görev 04 |
| **4** | **Toplanma** | **bu görev** |
| 5 | Hareket & saldırı | ✅ Görev 05 |
| 6 | Çözüm | ✅ Görev 05 |
| 7 | Diplomasi | Görev 07 |
| 8 | Sıra / yapay zekâ | Görev 07 |

Tek cümleyle: **ordular yıprandıkça eriyor; artık toparlanabilecekler. Ordunun kalitesi
sabit; artık zamanla iyileşecek.**

İkisi de ekonomi mekaniği ve ikisi de aynı havuzdan besleniyor — bu görevin asıl konusu
**"guns vs butter"** (top mu tereyağı mı): elindeki ekonomiyi yeni asker basmaya mı,
yıpranmış orduyu doldurmaya mı, yoksa ordunun kalitesini kalıcı yükseltmeye mi
harcayacaksın. Şu an tek seçenek var (yeni asker), bu görevden sonra üç olacak.

---

## 2. NEREDEN BAŞLIYORUZ

Görev 05 bitti: hareket, muharebe, bozgun, çekilme ve fetih çalışıyor. 249 test geçiyor,
kayıt sürümü 5, her parçada kuruluş garnizonu var (181 parça · 470 birim).

**Hazır girdiler — bu görev sıfırdan başlamıyor:**

| Girdi | Nerede | Bu görevde ne işe yarayacak |
|---|---|---|
| Hasar havuzu turlar arası hatırlanıyor | `durum.ordular[...].hasarHavuzu` | Toplanma bunu sıfırlayacak |
| `DENGE.TOPLANMA_INDIRIMI` için yer ayrılmış | `src/denge.js` | Toplanma bedeli oraya yazılacak |
| Muharebe motoru **saf fonksiyon** | `src/oyun/muharebe.js` | Araştırma statı kaydırınca aynı yoldan sınanabilir |
| **Sürekli referans model** | `scripts/muharebe-referans.js` | Araştırma tavanını ölçümle seçecek olan araç |
| §3.7 doğrulama tablosu 15/15 | `testler/muharebe.test.js` | Araştırma 0'ken hâlâ 15/15 olmalı — geri gidiş kilidi |
| Emir kuyruğu + rezervasyon defteri | `src/oyun/hareket.js`, `cozum.js` | Toplanma emri de aynı kuyruğa girecek |
| Parça değeri hesabı (tam sayı bölüşüm) | `src/oyun/uretim.js` → `parcaDegerleri` | Eğitim statı da aynı yoldan parçalara bölünecek |
| Tur raporu ve savaş odası | `TurRaporu.js`, `HareketEkrani.js` | Toplanma ve araştırma bunlara satır ekleyecek |

**Bilinen borç:** akıcılık kalıntısı çıkarsa denenecek üç tek satır `veri/URETIM-NOTU.md`'nin
sonunda yazılı. Rozet katmanına dokunmadan önce `RozetKatmani.js`'in başındaki **üç
değişmez kural** okunacak.

---

## 3. KAPSAM

**Dahil:**
- Yeniden toplanma (§3.9/2–6): kadro kavramı, toplanma emri, maliyet, hasar havuzunun sıfırlanması
- Araştırma (§6): puan kazanımı, dallar, seviyeler, muharebe statlarına etkisi
- Eğitim statının (§5/3) somut bir işe bağlanması — şu an oyunda hiçbir yere girmiyor
- Tur döngüsünün 2. ve 4. aşamalarının bağlanması
- Arayüz: araştırma ekranı + toplanma düğmesi + yıpranmış ordu göstergesi
- Kayıt sürümü 6

**Hariç (Görev 07):** yapay zekâ · diplomasi · rekabet olayları · kazanma koşulu ekranı ·
mod seçim ekranı · ana menü · sıcak koltuk · para kazanma.

**Diplomasi neden burada değil:** diplomasi karar veren bir karşı taraf ister. Bugün
haritada 80 tarafsız garnizon var, hiçbiri karar vermiyor — ittifak teklifini kabul edecek
kimse yok. Diplomasiyi yapay zekâdan önce yazmak, çalışıp çalışmadığı denenemeyen bir
ekran üretir. *(Aksini istersen Soru 5'in altına yaz, kapsamı ona göre değiştiririm.)*

---

## 4. CEVAP BEKLEYEN BEŞ SORU

> Kod yazılmadan önce cevaplanacak. Üçü veri modelini, ikisi dengeyi belirliyor.

### Soru 1 — "Kaybedilen birimler" nerede tutulacak? *(veri modeli)*

Tasarım §3.9/2 "tur sonunda **kaybedilen birimler geri gelir**" diyor ama kaybedilenin
nerede yazdığını söylemiyor. Bugünkü veri modelinde ordu yalnızca **mevcut** birimlerini
biliyor; 5 birimken 2'ye düşen ordunun bir zamanlar 5 olduğu hiçbir yerde yazılı değil.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Her orduya `kadro` alanı** *(önerim)* | Ordu iki sayı taşır: **kadro** (kağıt üstündeki mevcudu) ve **birimler** (sahadaki mevcudu). Üretim ikisini de artırır, kayıp yalnızca birimleri azaltır, toplanma birimleri kadroya yükseltir. |
| B | Kadro yok; toplanma = yarı fiyata serbest alım | Basit ama §3.9 değil: "doldurma" değil "indirimli üretim" olur, ordunun geçmişi hiç önemsenmez. |
| C | Yalnızca son muharebeden önceki mevcut hatırlanır | Tek muharebeyi telafi eder, üst üste iki tur yıpranan orduyu edemez. |

**A'nın gerekçesi:** kadro, toplanmanın doğal üst sınırı. Onsuz bir oyuncu 1 birimlik
ordusunu her tur yarı fiyata 20 birime "doldurabilir" ve üretim sistemi (sanayi sınırı
dahil) anlamsızlaşır. Kadro ayrıca zaten var olan bir kurala oturuyor: hasar havuzu ordu
bölününce **birim sayısına oranla** bölünüyor (Görev 05 §5), kadro da aynı kuralla bölünür.

*Günlük hayattan karşılığı:* kadro, bir birliğin resmî mevcudu; birimler ise o sabah
sahaya çıkabilen asker sayısı. Toplanma, aradaki farkı kapatmaktır — resmî mevcudun
üstüne çıkamazsın.

### Soru 2 — Toplanan ordu o tur saldırıya uğrarsa ne olur? *(oyun hissi)*

Tasarım kendi içinde çelişiyor. §3.9/2 "**tur sonunda** kaybedilen birimler geri gelir"
diyor; §8 tur döngüsü toplanmayı **4. aşamaya** (çözümden önce) koyuyor; §3.9/5 ise "ordu
o tur **savaşamaz**, cephedeki il o bir turda düşebilir" diyor. Üçü üç ayrı kural.

| | Seçenek | Sonuç |
|---|---|---|
| A | Toplanma çözümden **önce** işler | Ordu dolu savunur. Toplanmanın tek bedeli saldıramamak — çok ucuz, savunmada bedava güç. |
| **B** | **Toplanma çözümden sonra, tur sonunda işler** *(önerim)* | O tur **yıpranmış hâliyle savunur**, tur sonunda dolar. Bedel gerçek: parayı verdin, bir tur zayıf durdun. |
| C | Ordu hiç savaşmaz | Parça savunmasız düşer. Belgenin harfi ama ters teşvik üretir: toplanma emri vermek düşmanı davet etmek olur. |

**B'nin ek kuralı:** kaynak, emir verilirken değil **toplanma fiilen gerçekleşirken**
düşülür. Ordu o tur imha olduysa hiçbir şey harcanmaz — "para buharlaştı" hissi olmaz.
Bozguna uğrayıp çekilen ordu ise geçerli bir parçada durduğu için toplanmasını tamamlar.

### Soru 3 — Araştırma puanı nasıl kazanılıyor? *(ekonominin şekli)*

§6 "her tur ekonomiden araştırma puanı kazanılır (ordu/ekonomi ile yarışır)" diyor;
§5/3 "eğitim seviyesi → araştırma hızı" diyor. Formül yok.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Oyuncu her tur ekonomiden pay ayırır; puan = ayrılan × eğitim çarpanı** *(önerim)* | Yarışma gerçek: araştırmaya ayırdığın her puan orduya gitmeyen puandır. Eğitim, aynı parayı kaç puana çevirdiğini belirler. |
| B | Otomatik: puan yalnızca eğitim statından, harcamasız akar | Yarışma yok, "guns vs butter" gerilimi kayboluyor. Eğitimli oyuncu bedava güçleniyor. |
| C | Ayrı üçüncü kaynak (hem nüfus hem ekonomi yer) | Üçüncü havuz, üçüncü sayaç, üçüncü ekran. Kazandırdığı derinlik maliyetini karşılamıyor. |

**Eğitim çarpanı nasıl hesaplanacak (A seçilirse):** eğitim statı da tıpkı nüfus ve
ekonomi gibi parçalara **tam sayı olarak bölünür** (`parcaDegerleri`, §7'nin üç kuralı) ve
aktörün eğitim puanı elindeki parçaların toplamı olur. Bu mekanizma zaten yazılı ve
testli — yeni bir hesap icat edilmiyor, var olan üçüncü kez kullanılıyor. Yan faydası:
**eğitimli ili fethetmek somut bir ödül** hâline gelir; şu an eğitim statı oyunda
hiçbir işe yaramıyor.

### Soru 4 — Kaç dal, kaç seviye, seviye başına ne kadar? *(denge)*

§6 üç dal sayıyor (Zırh · Ağır vuruş · Hafif vuruş) ve tek örnek veriyor: "Zırh
araştırması Sv.2 → tüm birimlerin Zırh'ı +2". Seviye sayısı, maliyet eğrisi ve tavan yok.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **3 dal · seviye N → o stata +N · tavan ÖLÇÜMLE seçilir** *(önerim)* | Belgedeki tek örneğe birebir uyuyor. Tavan tahminle değil, §3.7 tablosunun kaç seviyede bozulduğuna bakılarak konur. |
| B | 3 dal, her dal sabit 3 seviye | Kolay ama keyfî; 3 seviyenin dengeyi bozup bozmadığı bilinmiyor. |
| C | Tek dal: genel "ordu kalitesi" | Karar kalmıyor; araştırma "her tur bas" düğmesine dönüyor. |

**Tavan neden ölçülmeli — somut sebep:** §3.3'te hafif vuruşun etkinliği
`clamp(1 − zOrt/12, 0.10, 1.00)`. Piyadenin zırhı 2; **zırh araştırması Sv.10'da zOrt 12
olur ve hafif vuruş tabanına oturur** — yani zırh araştırması yeterince ilerlerse oyunun
ana denge düğmesini (hafif vuruş böleni 12) tek başına devre dışı bırakır. Zırhlı birim
zaten 8'de; **+4 ile o eşiğe varır.** Bu yüzden tavan Adım 1'de ölçülecek: 15 satırlık
tablo hangi seviyede "piyade denk sayıda zırhlıyı asla yenmez" kısıtını çiğniyorsa, tavan
onun bir altıdır.

**Dayanıklılık dalı önerilmiyor:** dayanıklılık doğrudan can havuzu; +N her orduyu
ölçüsüz sertleştirir ve muharebeleri uzatır. §6 de üç dal sayıyor, dördüncüyü icat
etmeyelim.

### Soru 5 — Kartopu: bu görevde dokunulsun mu? *(denge)*

Görev 05 raporu kabul edilmiş bir kusur bıraktı: **garnizon tükenince yenisi gelmiyor,
ilerledikçe direnç azalıyor.** Araştırma bunu bir kademe daha kötüleştirir — oyuncu
zamanla güçlenirken tarafsız garnizonlar sabit kalır.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Bu görevde mekanik ekleme, ama ÖLÇ** *(önerim)* | Görev 05'in 15 turluk denge simülasyonu araştırma açıkken yeniden koşturulur. Kartopunun büyüklüğü Görev 07 karar verirken **sayıyla** bilinir. |
| B | Tarafsız garnizonlara tur sayısına bağlı araştırma seviyesi ver | Ucuz çözüm ama sahte: karar vermeyen bir taraf sessizce güçleniyor, oyuncu sebebini göremiyor. |
| C | Garnizonlar tükenince yenilensin | Fetih anlamsızlaşır; aldığın parça geri direnmeye başlar. |

**A'nın gerekçesi:** kartopunun asıl ilacı düşünen rakip (Görev 07). Araya geçici bir
mekanik koymak, yapay zekâ gelince silinecek kod üretir. Ama ölçmeden Görev 07'ye
girilmemeli — bu projede tasarım boşlukları tahminle değil ölçümle kapanıyor.

---

## 5. TASARIMDA DOLDURULACAK BOŞLUKLAR

Sorulardan bağımsız, kod yazarken karşılaşılacak tanımsız yerler. Her biri **var olan bir
kuralı arbitre alarak** doldurulacak, uydurulmayacak.

| # | Boşluk | Nasıl doldurulacak |
|---|---|---|
| 1 | Ordu bölününce kadro nasıl bölünür | Hasar havuzuyla **aynı kural**: birim sayısına oranla (Görev 05 §5). İki kural aynı yerde tanımlanır. |
| 2 | İki ordu birleşince kadrolar ne olur | Toplanır. Kadro ≥ mevcut değişmezi korunur. |
| 3 | Takviye (yeni birim basmak) kadroyu artırır mı | Evet — parası ödenmiş birim kadroya girer. Aksi hâlde yeni basılan birim ölünce doldurulamazdı. |
| 4 | Kaynak yetmezse kısmi doldurma nasıl olur | Görev 04'teki **kısmi sipariş kalıbı** birebir: türlerden sırayla birer tane, oran korunur, ne basılamadığı yazılır. |
| 5 | Toplanma emri kuyruğa mı girer | **Evet.** Görev 05'te muharebe emir kuyruğuna taşındı; toplanma da aynı kuyruğa girer, iptal edilebilir, TURU BİTİR'de çözülür. Aynı orduya hem toplanma hem hareket emri verilemez — **rezervasyon defteri zaten bunu yapıyor**, yeni bayrak yazılmayacak. |
| 6 | Fetihle araştırma devralınır mı | Hayır. Araştırma aktöre ait, toprağa değil. |
| 7 | Tarafsız garnizonun araştırma seviyesi | 0. Formülün tamamı veriden türediği için garnizon belirlenimci kalır (Görev 05 §6/4). |
| 8 | Araştırma seviyesi muharebe motoruna nasıl girer | **Motorun saflığı bozulmayacak.** `birimStatlari(arastirma)` saf yardımcı fonksiyonu kaydırılmış stat tablosunu üretir; motor tabloyu **parametre olarak** alır, `DENGE.BIRIMLER`'i kendisi okumaz. Araştırma 0'da tablo birebir eskisi olur → §3.7'nin 15 satırı değişmez. |
| 9 | Araştırma harcaması geri alınabilir mi | Tur içinde evet (kuyruk mantığı), TURU BİTİR'den sonra hayır. Seviye düşürme yok. |
| 10 | İmha olan ordunun kadrosu | Silinir (§3.9/6). Kayıt tamamen kalkar; sıfırdan basmak tam fiyattır. |

---

## 6. VERİ MODELİ VE KAYIT

### Ordu kaydına iki yeni alan

```
durum.ordular["16-1"] = {
  sahip: "16",
  birimler:    { piyade: 3, topcu: 1 },   // sahadaki mevcut
  kadro:       { piyade: 5, topcu: 2 },   // YENİ — kağıt üstündeki mevcut
  hasarHavuzu: 6,
  toplanmaEmri: false                      // YENİ — bu tur toplanma emri var mı
}
```

**Kayıt boyutu için kural:** `kadro` yalnızca `birimler`'den **farklıysa** kaydedilir.
Boş parçanın kayıt tutmaması (Görev 04) ve garnizonun formülden türemesi (Görev 05) ile
aynı mantık. Oyunun başında 181 garnizonun hiçbiri yıpranmamış olduğu için kayıt boyutu
ilk turda hiç büyümez.

### Araştırma kaydı

```
durum.arastirma = {
  "16": { zirh: 2, agir: 0, hafif: 1, puan: 3.4, buTurAyrilan: 4 }
}
```

- `puan` **kesirli saklanır** (§6.4 kesirli havuz kuralının aynısı; yuvarlansaydı kaynak sessizce buharlaşırdı).
- Ekranda aşağı yuvarlanarak gösterilir (Görev 04'te bütçe için konan kural).
- Kayıt yalnızca **araştırması olan aktörler** için tutulur; 81 aktör için boş nesne yazılmaz.

### Kayıt sürümü 6 — 1–5 reddedilir

Sürüm 5 için ret sebebi ayrı yazılacak: harita, ordular ve garnizonlar aynı ama **kadro
ve araştırma alanları yok.** Yüklenirse oyuncunun hiçbir ordusu toplanamaz ve nedeni
ekranda görünmez — Görev 04 ve 05'te aynı gerekçeyle aynı karar verilmişti.

**Kayıt boyutu yeniden ölçülecek** (Görev 05'te 21.6 KB idi). En kötü durum da: 181
parçanın hepsi yıpranmış + 81 aktörün araştırması dolu.

---

## 7. ADIMLAR

| Adım | İş | Ekranda değişir mi |
|---|---|---|
| 0 | Denge sayılarının yeri + belge denetimi | hayır |
| 1 | **Ölçüm önce:** araştırmanın §3.7 tablosunu nasıl kaydırdığı, tavanın seçimi | hayır (rapor çıkar) |
| 2 | Kadro veri modeli + toplanma motoru | hayır |
| 3 | Araştırma motoru + statların muharebeye girmesi | hayır |
| 4 | Tur döngüsü ve emir kuyruğu bağlantısı | hayır |
| 5 | Arayüz: araştırma ekranı | evet |
| 6 | Arayüz: toplanma + yıpranmış ordu göstergesi | evet |
| 7 | Denge ölçümü, belgeler, testler, kayıt sürümü 6 | hayır |

**Adım 1–4 boyunca ekranda hiçbir şey değişmez.** Bu, üç görevdir uygulanan ve üçünde de
işe yarayan kural: motor testlerle doğrulanmadan arayüz yazılırsa, ilk hatada sorunun
hesapta mı çizimde mi olduğu bulunamıyor.

---

### Adım 0 — Denge sayıları ve belge denetimi

1. `DENGE.TOPLANMA` yazılır: birim başına toplanma bedeli **türetilerek**, gömülü değil —
   `Math.ceil(normal_bedel × DENGE.TOPLANMA_INDIRIMI)`. İndirim 0.5 (§3.9/3). Test bunu
   kanıtlar: indirim değiştirilir, bedelin değiştiği doğrulanır.
   *Kontrol:* türetilen tablo §3.9/3 ile birebir tutmalı → piyade 2/1, topçu 1/2, zırhlı 1/3.
2. `DENGE.ARASTIRMA` yazılır: dal listesi, seviye başına stat artışı, seviye maliyet
   eğrisi, tavan (Adım 1'den sonra kesinleşir), eğitim çarpanı katsayısı.
3. **Belge kalıntısı taraması:** §3.9 hâlâ "komşu **dost il**" diyor — temel birim parça
   (§7). §6 "her tur ekonomiden puan kazanılır" diyor, Soru 3'ün cevabına göre yeniden
   yazılacak. §5/3 "eğitim → araştırma hızı" somutlanacak.
4. §14 denge düğmeleri tablosuna iki satır eklenir: **araştırma tavanı** ve **araştırma
   maliyet eğrisi**. (Toplanma bedeli zaten listede.)

---

### Adım 1 — ÖLÇÜM: araştırma tabloyu nereye kadar bozmuyor

> Bu adımda **oyun kodu yazılmıyor.** Görev 05'in en değerli çıktısı olan sürekli referans
> model kullanılıyor.

`scripts/muharebe-referans.js` genişletilir: her tarafa bir araştırma seviyesi verilebilsin.
Sonra §3.7'nin 15 satırı, **her dal için 0'dan yukarı seviyelerle** yeniden koşturulur ve
tablonun altındaki dört tasarım kısıtının hangi seviyede kırıldığı ölçülür:

- Piyade hiçbir zaman denk sayıda zırhlı/topçuyu yenmez
- Zırhlı 1v1 piyadeyi ezer · 2'ye 1 dar kazanır · 3'e 1 kaybeder
- Zırhlı topçuyla ovada kazanır, topçunun tek şansı coğrafya
- Zırhlı 4v6 ölçeğinde ovada kazanır, dağlıkta ezilir

**Çıktı:** `veri/arastirma-olcum.md` — dal × seviye tablosu, her hücrede "15 satırdan kaçı
kısıtları koruyor". Tavan bu tablodan seçilir ve `DENGE.ARASTIRMA.TAVAN`'a yazılır.

**Ayrıca ölçülecek — simetrik durum:** iki taraf da aynı seviyedeyse tablo korunuyor mu?
Araştırma tek taraflı olduğunda ezici, iki taraflı olduğunda nötr olmalı; ikincisi
bozuluyorsa seviye artışı doğrusal değil, azalan olmalı.

**Bu adımın sonunda Baki'ye bir sayfalık özet sunulur ve tavan onaylanır.**

---

### Adım 2 — Kadro ve toplanma motoru (`src/oyun/toplanma.js`)

Saf fonksiyonlar, oyun durumunu tanımaz:

```
eksikKadro(ordu)                      → { piyade: 2, topcu: 1 }   // kadro − birimler
toplanmaMaliyeti(eksik)               → { nufus, ekonomi }
toplanmaCoz(ordu, butce)              → { yeniOrdu, harcanan, basilamayan }
kadroBol(ordu, gidenBirimSayisi)      → [kalanKadro, gidenKadro]  // orantılı
kadroBirlestir(orduA, orduB)          → birleşik kadro
```

**Değişmez kural (koda ve teste yazılacak):** `kadro ≥ birimler`, her zaman, her yolda.
Üretim, bölünme, birleşme, kayıp, toplanma — beşinde de korunduğu ayrı ayrı test edilir.

Görev 05'te bölünme kuralı hasar havuzu için yazılmıştı; **kadro aynı fonksiyonu
kullanacak**, kopyalanmayacak. (Görev 05'in en pahalı hatası, harita↔ekran çevirisinin üç
yere elle kopyalanmasıydı.)

`src/oyun/ordu.js` içindeki **her `birimler` okuması denetlenecek.** Rozet, panel, aktör
özeti, muharebe girdisi — hepsi **mevcut** göstermeli, kadro değil. Bu, bu görevin en
olası sessiz hatası.

---

### Adım 3 — Araştırma motoru (`src/oyun/arastirma.js`)

```
egitimPuani(durum, aktorId)           → parça değerlerinden toplam (uretim.js'i kullanır)
turPuani(ayrilanEkonomi, egitimPuani) → kazanılan araştırma puanı
seviyeMaliyeti(dal, hedefSeviye)      → puan
seviyeAtla(arastirma, dal)            → yeni arastirma | ret sebebi
birimStatlari(arastirma)              → kaydırılmış { piyade: {...}, topcu: {...}, zirhli: {...} }
```

**Eğitim, üçüncü parça değeri olarak hesaplanır.** `parcaDegerleri` bugün nüfus ve ekonomi
için çalışıyor; eğitim için üçüncü kez çağrılır. Yeni formül yazılmaz — §7'nin üç kuralı
(oransal dağıtım · her parça en az 1 · tekdüzelik) aynen geçerlidir.

**Muharebe motoruna dokunuş minimum:** `muharebeCoz` artık her taraf için bir **stat
tablosu** alır. Varsayılan tablo `DENGE.BIRIMLER`'dir → mevcut 40 muharebe testi ve
§3.7'nin 15 satırı **hiç değişmeden geçmeli.** Bu, adımın bitiş ölçütüdür.

---

### Adım 4 — Tur döngüsü ve emir kuyruğu

- `turDongusu.js`'e **2. aşama (araştırma)** eklenir: ayrılan ekonomi havuzdan düşülür,
  puan eklenir, seviye atlandıysa uygulanır.
- **4. aşama (toplanma)**, Soru 2'nin cevabına göre yerleştirilir. Cevap B ise: çözümden
  sonra, tur sonunda, **hayatta kalan ordular için**.
- Toplanma emri `cozum.js`'in kuyruğuna girer; iptal edilebilir; emir listesinde numaralı
  görünür (Görev 05'in kalıbı).
- Aynı orduya iki emir verilemez — **rezervasyon defteri** kullanılır, yeni bayrak yok.
- Tur sonunda `toplanmaEmri` sıfırlanır (sanayi sayacı ve hamle rezervasyonunun yanına).

---

### Adım 5 — Araştırma ekranı

Tur çubuğuna bir düğme; savaş odasının kalıbıyla **tam perde** açılır.

```
ARAŞTIRMA                    Eğitim gücün: 14   ·   Puan: 12.3 (+4.2/tur)

ZIRH          Sv.2  ►Sv.3     18 puan   [YÜKSELT]
   Etkisi: tüm birimlerin zırhı +1 olur.
   Piyaden 4 → 5 zırha çıkar; hafif vuruştan yediğin hasar %8 azalır.

AĞIR VURUŞ    Sv.0  ►Sv.1      6 puan   [YÜKSELT]
HAFİF VURUŞ   Sv.1  ►Sv.2     12 puan   [YÜKSELT]

Bu tur araştırmaya ayır:   [−]  4  [+]  ekonomi     Kalan bütçe: 10 nüfus / 6 ekonomi
```

**Üç kural:**

1. **Etki somut yazılır, seviye adı yazılmaz.** Araştırma görünmez bir güç: stat
   kaydırıyor ama oyuncu haritada hiçbir şeyin değiştiğini görmüyor. "Zırh Sv.3" tek
   başına hiçbir şey anlatmaz; "piyaden 4 → 5 zırha çıkar, hafif vuruştan yediğin hasar
   %8 azalır" anlatır. **Sayı üretilirken uydurulmayacak** — `birimStatlari` ile gerçek
   hesaptan çıkarılacak.
2. **Bütçe kalıbı Görev 04'ten aynen alınır.** `[−] n [+]`, canlı kalan sayacı, bütçe
   bitince `[+]` pasifleşir. Oyuncu yeni bir arayüz dili öğrenmez.
3. **Tavana gelen dal pasifleşir ve sebebi yazılır** — sanayi sınırında konan kural
   (§4.6): görünmeyen bir kuralla düğme sessizce ölmez.

---

### Adım 6 — Toplanma arayüzü

**Panelde:** "BURADAKİ ORDU" kutusunun altına **TOPLAN** düğmesi. Yalnızca `kadro >
birimler` ise görünür. Üstünde tek satır: *"3 piyade, 1 topçu eksik · 8 nüfus / 5 ekonomi
· bu tur saldıramaz."*

**Haritada — yıpranmış ordu göstergesi.** Bugün rozet yalnızca sayı gösteriyor; oyuncunun
hangi ordusunun eksik olduğunu haritaya bakarak görmesi gerek.

> ⚠ **Rozet katmanına dokunmadan önce `RozetKatmani.js`'in başındaki üç değişmez kural
> okunacak.** Görev 05'te akıcılık altı tur kovalandı ve kök sebep rozet yerleşimiydi.
> Yeni gösterge:
> - **yeni katman açmayacak** (mevcut rozetin içinde çözülecek),
> - **rozetin dışına taşmayacak** (donanım dokusu görünüm sınırında keser — Görev 05'in
>   5. turunda yaşandı),
> - rozeti yalnızca **kendi sayısı veya rengi değişince** tazeleyen mevcut yoldan geçecek.
>
> Öneri: rozetin kenarına ince bir çentik/renk şeridi. Ayrı bir şekil değil.

**Tur raporunda:** toplanan ordular ayrı bir satırda — kaç birim doldu, ne harcandı, ne
basılamadı.

**İsteğe bağlı (Baki karar verir):** Görev 05 raporu §10/2'de il rozeti gürültüsü açık
bırakılmıştı — 1.35×–2.7× arasında 81 ilin hepsinde rozet var. Rozet katmanı zaten bu
adımda açılıyor; istenirse "yalnızca garnizondan farklı ordusu olan iller" süzgeci burada
tek seferde eklenir.

---

### Adım 7 — Denge ölçümü, belgeler, testler, kayıt

1. **15 turluk denge simülasyonu araştırma açıkken yeniden koşturulur** (Soru 5/A). Görev
   05'te sonuç: tur 15'te 90/181 parça. Yeni sayı yanına yazılır; **fark kartopunun
   büyüklüğüdür** ve Görev 07'nin girdisidir.
2. Tasarım belgesi güncellenir: §3.9 (kadro kavramı + Soru 2'nin cevabı), §5/3 (eğitim
   formülü), §6 (dallar, seviyeler, tavan, ölçümün gerekçesi), §8 madde 2 ve 4, §14 (iki
   yeni düğme), sözlüğe **kadro** satırı.
3. `veri/URETIM-NOTU.md`: alınan tüm kararlar **gerekçesiyle**.
4. Kayıt sürümü 6, boyut ölçümü.
5. `npm.cmd run kontrol` + `npx.cmd expo export`.

---

## 8. TESTLER VE BİTİŞ ÖLÇÜTÜ

**Sayı hedefi:** Görev 05 sonunda 249 test vardı; bu görev **~55 test** eklemeli
(hedef ~305).

### Geri gidiş kilidi — en önemli madde

- [ ] **§3.7'nin 15 satırı araştırma 0'da hâlâ 15/15 geçiyor**
- [ ] Mevcut 40 muharebe testi, motorun imzası değiştikten sonra da değişmeden geçiyor
- [ ] `haritaDonusum.test.js` (11 test) rozet göstergesi eklendikten sonra da geçiyor

### Toplanma

- [ ] `kadro ≥ birimler` beş yolda da korunuyor: üretim · kayıp · bölünme · birleşme · toplanma
- [ ] Kadro, ordu bölününce birim sayısına **oranla** bölünüyor (hasar havuzuyla aynı fonksiyon)
- [ ] Toplanma mevcut'u kadroya çıkarıyor ve **hasar havuzunu sıfırlıyor**
- [ ] Kaynak yetmezse kısmi doluyor, oran korunuyor, ne dolmadığı bildiriliyor
- [ ] Toplanma bedeli `DENGE`'den türüyor (indirimi değiştir → bedel değişiyor) ve §3.9/3 tablosuyla birebir tutuyor
- [ ] İmha olan ordunun kaydı ve kadrosu tamamen siliniyor
- [ ] Aynı orduya hem toplanma hem hareket emri verilemiyor
- [ ] Toplanma emri iptal edilebiliyor, iptalde kaynak harcanmamış oluyor
- [ ] Soru 2'nin cevabı testle kilitli (B ise: o tur yıpranmış savunuyor, tur sonunda doluyor, imha olduysa hiç harcamıyor)
- [ ] **Sömürü testi:** kasten kaybedip doldurmak, hiç kaybetmemekten pahalı (§3.9/4)

### Araştırma

- [ ] Eğitim puanı `parcaDegerleri` üzerinden hesaplanıyor, toplam korunuyor (81 il için)
- [ ] Araştırmaya ayrılan ekonomi **ordu bütçesinden düşüyor** — tek havuz, iki musluk
- [ ] Puan kesirli birikiyor, ekranda aşağı yuvarlanıyor
- [ ] Seviye atlayınca **tüm birimlerin** statı kayıyor (tek tür değil)
- [ ] Tavan aşılamıyor, tavandaki dal pasif ve sebebi yazılı
- [ ] Fetihle araştırma devralınmıyor
- [ ] Tarafsız garnizonun araştırması 0, garnizon hâlâ belirlenimci
- [ ] Araştırma sabitleri koda gömülü değil (değiştir → sonuç değişiyor)
- [ ] Aynı tohum + aynı araştırma → aynı muharebe sonucu

### Genel

- [ ] Kayıt sürümü 6, sürüm 1–5 anlaşılır mesajla reddediliyor, gidiş-dönüş korunuyor
- [ ] `kadro` yalnızca `birimler`'den farklıysa kaydediliyor (boyut testi)
- [ ] `npm.cmd run kontrol` temiz · `npx.cmd expo export` hatasız
- [ ] Telefonda test: araştırma ekranı, toplanma, yıpranmış rozet, akıcılık — **Baki onayı**
- [ ] `veri/arastirma-olcum.md` yazıldı, tavan gerekçeli
- [ ] `URETIM-NOTU.md` güncel

---

## 9. TUZAKLAR

**Görev 05'ten taşınan üçü** (üçü de yaşandı, üçü de tekrar edecek):

1. **Üstteki kutu, yerel katmandaki harita jestini engellemez.** Araştırma ekranı tam
   perde açılırken haritanın jesti **susturulmalı** — savaş odasındaki kalıp aynen
   kullanılacak, yeniden çözülmeyecek.
2. **Canlandırma stili taşıyan görünüm, hareket sırasında React'çe yeniden çizilmemeli.**
   Yıpranmış ordu göstergesi rozetin tazeleme yoluna girecek; yanlış bağlanırsa Görev
   05'te altı turda kazanılan akıcılık geri gider.
3. **Donanım dokusu görünümün sınırlarında keser.** Gösterge rozetin dışına taşarsa "yarısı
   yüklenmiş rozet" hatası aynen döner.

**Bu göreve özgü dördü:**

4. **Kadro ile mevcudun karışması — bu görevin en olası sessiz hatası.** İki sayı aynı
   şekle benziyor. Rozet, panel, aktör özeti, muharebe girdisi ve tur raporu **mevcut**
   göstermeli. Yanlış olan çökmez, sadece yanlış sayı yazar; onun için teste bağlanacak.
5. **Araştırma görünmez bir güç.** Muharebe matematiği sessizce kayarsa oyuncu "savaş
   bozuldu" der. Etki, savaş odasının tahmininde ve araştırma ekranında **somut sayıyla**
   gösterilecek.
6. **Denge sayısı sızıntısı.** Seviye → stat eşlemesi ve maliyet eğrisi uzun; ara hesapta
   çıplak sayı yazmak çok kolay. Kural değişmedi: **formülde çıplak sayı yok, hepsi
   `DENGE`'den.**
7. **Tek havuz, üç musluk.** Ekonomi artık üç yere gidiyor: yeni birim, toplanma, araştırma.
   Üçünün de aynı havuzdan düştüğü ve toplamın aşılamadığı tek yerde denetlenmeli; üç ayrı
   yerde kontrol edilirse biri kaçar.

---

## 10. GÖREV 07 İÇİN BEKLEYENLER

Yapay zekâ (§9) · diplomasi (§10) · rekabet olayları (§11) · kazanma koşulu ekranı · mod
seçim ekranı · ana menü · sıcak koltuk · para kazanma katmanı · **kartopu düzeltmesi**
(Adım 7'nin ölçümü girdi olacak).

Görev 06 bitince oyun, **tam ekonomiyle tek başına oynanabilir** olur: kaynak üret, asker
bas, yürü, savaş, fethet, toparlan, güçlen. Eksik olan tek şey **düşünen bir rakip.**

---

## EK — KARAR ÖZETİ

| Soru | Cevap | Tarih |
|---|---|---|
| 1 — Kadro nerede tutulacak | **A** — her orduya `kadro` alanı | 2026-07-30 |
| 2 — Toplanan ordu saldırıya uğrarsa | **B** — çözümden sonra, tur sonunda dolar | 2026-07-30 |
| 3 — Araştırma puanı nasıl kazanılır | **A** — ekonomiden pay ayrılır × eğitim çarpanı | 2026-07-30 |
| 4 — Dallar, seviyeler, tavan | **A** — 3 dal · Sv.N → +N · tavan ölçümle | 2026-07-30 |
| 5 — Kartopu bu görevde ele alınsın mı | **A** — mekanik eklenmez, ÖLÇÜLÜR | 2026-07-30 |
| + Diplomasi kapsama girsin mi | **Hayır** — Görev 07'ye | 2026-07-30 |

**Soru 4'e Baki'nin notu:** *"Önerileni seçiyorum ama dengelemelere de dikkat etmek
lazım."* → Adım 1'in ölçümü baştan savma yapılmadı. Tek taraflı araştırmanın yanı sıra
**simetrik durum** (iki taraf da aynı seviyede) ayrıca ölçüldü.

### Adım 1'in sonucu — TAVAN = Sv.2

Ölçüm: `node scripts/muharebe-referans.js` → `veri/arastirma-olcum.md`.

> ⚠ **Baki Sv.3'ü onaylamıştı (2026-07-30); Adım 3'te sayı Sv.2'ye DÜŞTÜ.** Sebep aşağıda —
> ölçüm o sırada yalnız sürekli modele bakıyordu, oyunun motoru daha sıkı çıktı.
> **Baki'nin yeni sayıyı onaylaması gerekiyor.**

| Dal | Sürekli model | Oyunun motoru | Bağlayıcı |
|---|---|---|---|
| **Zırh** | Sv.5 | **Sv.2** | **Sv.2** ← tavanı bu belirledi |
| Ağır vuruş | Sv.3 | Sv.12 | Sv.3 |
| Hafif vuruş | Sv.6 | Sv.6 | Sv.6 |

**Neden iki model:** sürekli model bir **ölçüttür, oyun değildir** — kesirli birim tanır,
moral ve bozgun bilmez. Oyunun motoru tam sayı birimlerle çalıştığı için daha hassastır:
sürekli modelde "kıl payı"na düşen bir sonuç motorda tam bir zafere veya yenilgiye dönüşür.
Yalnız sürekli modele bakılsaydı tavan Sv.3 kalır ve **oyunun kendisinde tutmazdı.**
Bunu `testler/arastirma.test.js`'teki "TAVANIN ANLAMI" testi yakaladı: Sv.3'te motor
§3.7'nin iki satırını ters çeviriyordu.

**Zırhın Sv.3'te kırılması tasarımın kendi öngörüsü.** §3.3'te hafif vuruş etkinliği
`clamp(1 − zOrt/12, 0.10, 1.00)`. Zırhlının zırhı 8; Sv.3'te **11** olur ve hafif vuruş
tabana oturur (1 − 11/12 = 0.08 < 0.10). O noktada **3 piyade 1 zırhlıyı yenemez hâle
geliyor** — §3.7'nin en net satırlarından biri (beklenen kalan 1.85/3) ters dönüyor.
Sv.2 son güvenli seviye. Belgenin tahmini ("zırhlı 8'de, +4 ile eşiğe varır") bir seviye
iyimserdi; gerçek eşik +3.

**Simetri tavana kadar temiz** → seviye artışı **doğrusal kalıyor**, azalan tabloya gerek yok.

**Tavanın keyfi olmadığı da teste bağlandı:** `TAVAN + 1`'de tablonun gerçekten bozulduğu
ayrıca doğrulanıyor — yoksa gereksiz yere kısıtlamış olurduk.

**Ölçütün kendisi iki kez düzeltildi — sayının güvenilirliği buna bağlı:**

1. *"Kazanan değişmesin"* → tavan **Sv.0** çıktı. Sebep: tabloda kazananın kendi kuvvetinin
   yalnızca %7–18'iyle bitirdiği üç satır var (#1, #6, #10) — Görev 05'te tam sayı sınırında
   beraberlik bozma kuralını yazdıran **aynı üç satır**. Orada kazananın değişmesi denge
   bozulması değil, yazı-turanın öbür yüze düşmesi.
2. *Yazı-turayı affet* → tavan **Sv.12** çıktı; bu sefer fazla affediyordu (kıl payı
   kazanılan bir muharebenin kesin yenilgiye dönmesi de affediliyordu).
3. **Doğrusu:** kazanan değişti **ve** taraflardan biri için sonuç kesindi → bozulma.
   Kesinlik eşiği (kazananın kendi kuvvetinin %25'i) tahmin değil: tablonun kendi
   verisinde 0.18 ile 0.29 arasında **boş bir bant** var, eşik oraya kondu.

*Ara yolda denenen ve elenen hipotez:* "yumuşama sürekli modelin sabit adımından gelen
sayısal hata olabilir". Alt adıma bölünerek sınandı — sayılar değişti ama **aynı satırlar
yine ters döndü**, yani kırılmalar gerçek. Sürekli model olduğu gibi bırakıldı (ince adım
§3.7'yi yeniden üretemiyor; tasarımın tablosu bu adımla üretilmiş).

**Ağır vuruşun neden dar olduğu, tavanın kendisinden önemli:** +N herkese **eşit** eklendiği
için en çok düşük statlıya yarıyor. Piyadenin ağır vuruşu 3→6 (iki katı), topçununki 8→11
(%38). Piyade zırhlı avcısına dönüyor. Bu aynı zamanda `SEVIYE_ARTISI`'nı büyütmenin de sınırı.
