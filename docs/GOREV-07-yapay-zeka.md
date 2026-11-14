# GÖREV 07 — DÜŞÜNEN RAKİP

> Tarih: 2026-07-31 · Önceki: `docs/GOREV-06-toplanma-ve-arastirma.md` + `GOREV-06-RAPOR.md`
> Tasarım referansı: `docs/il-savasi-tasarim.md` §9 (yapay zekâ), §4.5 (üretim referansı),
> §3.8 (moral), §8 (tur döngüsü), §14 (denge düğmeleri)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. BU GÖREV NE YAPIYOR

Görev 06 raporunun ilk cümlesi şuydu: *"Eksik olan tek şey düşünen bir rakip."* Bu görev
o tek şeyi yapıyor.

Bugün haritada 80 tarafsız garnizon duruyor. Karar vermiyorlar, asker basmıyorlar,
biriktirmiyorlar — tükendiklerinde yerlerine yenisi gelmiyor. Bu görevden sonra
**hepsi oynayan taraf olacak:** kaynak toplayacak, asker basacak, yıpranan ordusunu
toparlayacak, araştırma yapacak, saldıracak ve geri çekilecek.

**Tur döngüsü (§8) tamamlanıyor.** Görev 06 iki boş aşamayı doldurmuştu; geriye iki madde
kalmıştı:

| # | Aşama | Durum |
|---|---|---|
| 1–6 | Üretim · Araştırma · Takviye · Toparlanma · Hareket · Çözüm | ✅ |
| 7 | Diplomasi | Görev 08 |
| **8** | **Sıra — sonraki oyuncuya veya yapay zekâya** | **bu görev** |

**Bitiş ölçütü bir sayı.** Görev 06 kartopunun büyüklüğünü ölçtü: 15 turda, gerçek gelirle
oynayan bir oyuncu **22/181 parça** alıyordu ve karşısında düşünen kimse yoktu. Bu görevin
başarısı aynı simülasyonun yapay zekâ açıkken verdiği sayıyla ölçülecek. Görev 05'in §3.7
tablosu, Görev 06'nın tavan ölçümü neyse — **bu tablo da bu görevin hakemidir.**

---

## 2. KAPSAM

**Dahil:**
- Fayda tabanlı karar fonksiyonu (§9.1) — tek beyin, 80 aktör
- Aktörlerin dört musluğu da kullanması: asker basma · toparlanma · araştırma · hareket/saldırı
- Sıra sistemi ve tur döngüsünün 8. maddesi
- Kişilik ağırlıkları (§9.4) ve zorluk kademesi
- **Görev 06'nın devrettiği üç ölçülmüş iş:** moralin tek yönlülüğü · garnizon dengesi · kartopu
- Arayüz: tur işleniyor perdesi, genişletilmiş tur raporu, asgari oyun sonu kontrolü
- Kayıt sürümü 7

**Hariç (Görev 08):** diplomasi (§10) · rekabet olayları (§11) · mod seçim ekranı ·
kazanma koşulu ekranının tamamı · ana menü · sıcak koltuk · para kazanma.

### Neden diplomasi burada değil

Diplomasi (§10) üç şey ister: ittifak/savaş/ateşkes durumu, bunları gösteren bir ekran ve
**teklifi değerlendiren bir yapay zekâ.** Üçüncüsü bu görevin çıktısı — kişilik ağırlıkları
tunelenmeden yazılan diplomasi kararı, iyi mi kötü mü olduğu ölçülemeyen bir kod olur.
Rekabet olayları (§11) da diplomasiye bağlı: tetikleyicisi *"iki il birbirine savaş açtığında"*.

Bu, yol haritasının bir görev uzaması demek. Dürüst olan bu: **yapay zekâ kalan işlerin en
büyüğü** ve tasarım belgesi §15'te bunu zaten yazıyor — *"muharebe ve bozgun tamamlanmadan
yapay zekâya geçilmemeli, çünkü AI'ın fayda hesabı muharebe sonucunu tahmin etmeye
dayanır."* Bugün o şart yeni sağlandı; tahmin ölçüsü Görev 06'da düzeltildi.

*(İkisini birleştirmemi istersen söyle — kapsamı ona göre yazarım, ama Görev 07'nin iki
katı sürecek.)*

---

## 3. NEREDEN BAŞLIYORUZ

348 test geçiyor, kayıt sürümü 6, paket 5.81 MB. Muharebe, hareket, fetih, toparlanma ve
araştırma çalışıyor.

**Hazır girdiler:**

| Girdi | Nerede | Bu görevde ne işe yarayacak |
|---|---|---|
| **Üstünlük oranı** (`kalanın ÷ (kalanın + onun kalanı)`) | `muharebe.js`, Görev 06/6b | Fayda formülündeki "kazanma olasılığı" bu. **Yeni tahmin yazılmayacak.** |
| Muharebe motoru saf fonksiyon | `muharebe.js` | Yapay zekâ hamleyi *deneyerek* puanlayabilir |
| Kuruluş garnizonları | `garnizon.js` | Yapay zekânın başlangıç kuvveti — atılacak kod yok |
| Emir kuyruğu + rezervasyon defteri | `hareket.js`, `cozum.js` | 80 aktörün emirleri aynı kuyruğa girecek |
| `butce.js` — tek havuz üç musluk | `butce.js` | **Yapay zekâ da buradan geçecek**; ayrı yol açılmayacak |
| §4.5 doğal denge tablosu | tasarım §4.5 | Belgede zaten *"yapay zekânın üretim referansıdır"* yazıyor |
| Tohumlu rastgelelik | `rastgele.js` | Kişilik dağıtımı ve karar gürültüsü belirlenimci kalacak |
| Aktör başına gelir hesabı | `turDongusu.js` → `tumGelirler` | 80 aktörün ekonomisi zaten tek geçişte hesaplanıyor |
| Denge simülasyonu betiği | `scripts/denge-simulasyonu.js` | Bitiş ölçütünü ölçecek araç |
| Anomali tarama betiği | Görev 06 §13/1b | Moral düzeltmesini ölçecek araç |

**Açık kalan bir madde:** araştırma tavanı Sv.2 ölçümle geldi ama **cihazda denenmedi**
(Görev 06 §13/3). Adım 0'da sorulacak; sığ geliyorsa `DENGE.ARASTIRMA.TAVAN` tek satır.

---

## 4. CEVAP BEKLEYEN BEŞ SORU

> Kod yazılmadan önce cevaplanacak. İkisi mimariyi, ikisi dengeyi, biri oyun hissini belirliyor.

### Soru 1 — Aktörler aynı anda mı oynar, sırayla mı? *(mimari)*

Bugün oyunda sıra diye bir şey yok: oyuncu emirlerini dizer, TURU BİTİR'e basar, hepsi
çözülür. 80 aktör eklenince bu bir karar gerektiriyor.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Eşzamanlı tur** *(önerim)* | Herkes **aynı fotoğrafa** bakarak karar verir, tüm emirler tek çözümde sırayla işlenir. Tek TURU BİTİR anı korunur. |
| B | Klasik sıra | Oyuncu oynar, sonra 80 aktör tek tek oynar. Okunaklı ama 80 aktörün turu ekranda izlenirse dayanılmaz yavaş, izlenmezse zaten A'ya dönüşür. |
| C | Karma: önce oyuncu çözülür, sonra yapay zekâ | Yapay zekâ oyuncunun hamlesini görmüş olur — **oyuncu aleyhine asimetri.** |

**A'nın gerekçesi:** Görev 05'te emir kuyruğu zaten "emirler sırayla çözülür, numaralı
görünür" diye kuruldu. 80 aktörü aynı kuyruğa eklemek en küçük değişiklik. Adalet için tek
ek kural: **çözüm sırası her tur tohumla karıştırılır** — yoksa aktör kodu küçük olan
kalıcı ilk vuruş avantajı kazanır.

*İş hayatından karşılığı:* eşzamanlı tur, herkesin aynı gün teklif zarfını kapalı verdiği
bir ihaledir; klasik sıra, sıradakinin öncekinin teklifini görerek konuştuğu bir pazarlık.
İkincisi daha okunaklı ama daha adaletsiz.

### Soru 2 — Yapay zekâ kuvvetini nasıl böler? *(hamle uzayı)*

Görev 05'te kısmi gönderim zorunlu oldu: oyuncu kaç birlik göndereceğini seçiyor. Yapay
zekâ için bu, hamle sayısını patlatan bir serbestlik — 10 birliklik bir ordunun komşuya
gönderebileceği kombinasyon sayısı yüzlerce.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Üç sabit aday: tümü sağlam · yarısı · hiçbiri** *(önerim)* | Hamle uzayı parça başına ~3 × komşu sayısı. 181 parça için tur başına birkaç bin ucuz hesap — §9.3'ün öngördüğü bütçe. |
| B | Tam arama | Doğru karar ama telefonda karşılanamaz; §9.3 zaten bunu dışlıyor. |
| C | Tek aday: hep tümü | En basit ama yapay zekâ kendini sürekli savunmasız bırakır; §4.4'ün uyarısı boşa gider. |

**Not:** Görev 06'da hareket bölünmesinde **sağlamlar önce gidiyor**; yapay zekâ da aynı
kuraldan geçecek, ayrı bir seçim mantığı yazılmayacak.

### Soru 3 — Garnizon il ölçeğinde dengelensin mi? *(denge — Görev 06 §13/1c)*

Ölçüldü: garnizon **parça başına** hesaplanıyor (`⌈(nüfus+sanayi)/4⌉`), parça sayısı ise
§7'ye göre **yüzölçümünden** geliyor, güçten değil. Sonuç:

| İl | Değer | Savunma | Değer ÷ savunma |
|---|---|---|---|
| **İstanbul** | 20 | 10 | **2.00** |
| **Ankara** | 17 | 20 | **0.85** |
| Iğdır | 5 | 1 | **5.00** |

En zengin iller en kârlı hedefler; küçük zengin iller 3–5 kat oranla en kolay lokma.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Garnizon il düzeyinde bütçelenir, parçalara bölünür** *(önerim)* | İlin toplam savunması değeriyle orantılı olur; parçalara bölüşüm için §7'nin üç kuralı (oransal · en az 1 · tekdüzelik) **zaten yazılı ve testli** kullanılır. |
| B | `GARNIZON.BOLEN` parça sayısına göre ayarlanır | Aynı sonucun dolambaçlı hâli; formülü okunmaz yapar. |
| C | Kabul et — küçük zengin iller riskli hedef olsun | Savunulabilir bir tasarım tercihi ama şu an **kasten** seçilmiş değil, tesadüf. |

**Bu soru yapay zekâdan önce cevaplanmalı:** 80 aktörün başlangıç konumu buradan çıkıyor.
Dengesiz başlarsa yapay zekânın iyi mi kötü mü oynadığı ölçülemez.

### Soru 4 — Kişilikler ve zorluk *(oyun hissi)*

§9.4 dört ağırlık sayıyor: **saldırganlık · açgözlülük · husumet · temkin.**

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Kişilik bu görevde · zorluk kademesi bu görevde ama ekransız** *(önerim)* | Ağırlıklar `DENGE.ZEKA` altında üç kademe (kolay/orta/zor) olarak durur, ayarlar menüsünden seçilir. Mod seçim ekranı Görev 08. |
| B | Yalnızca kişilik, zorluk Görev 08'e | Zorluk ayarı **ölçümün parçası**; onsuz "yapay zekâ çok mu sert" sorusuna cevap verilemez. |
| C | Tek tip yapay zekâ | §9.4'ün maliyeti sıfır dediği tekdüzelik kırıcı özellik atlanmış olur. |

**Husumet ağırlığı bir veriye bağlı.** §13.2'de *"husumet çiftleri verisi"* taşınacaklar
arasında ✅ işaretli. **Adım 0'da bu verinin depoda gerçekten var olup olmadığı
doğrulanacak**; yoksa husumet ağırlığı bu görevde 0 bırakılır ve Görev 08'de rekabet
olaylarıyla birlikte gelir.

### Soru 5 — 80 aktörün turu oyuncuya nasıl gösterilir? *(oyun hissi)*

Bugün tur raporu yalnızca oyuncunun savaşlarını anlatıyor. Yarın haritanın öbür ucunda da
iller el değiştirecek.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Kademeli: cephende ayrıntı, uzakta manşet** *(önerim)* | Sana dokunan olaylar (sana saldıran, sınırındaki fetih) raunt raunt anlatılır; uzaktakiler tek satır: *"Konya, Karaman'ı ilhak etti."* Ayrıca haritada o tur değişen parçalar kısa süre vurgulanır. |
| B | Her şey ayrıntılı | 80 aktörün turu okunacak metin değil. |
| C | Hiçbir şey — yalnızca harita değişsin | Oyuncu neden kaybettiğini anlamaz; Görev 06'nın "developer gibi arayüzü bırakalım" kararının tersi yönde. |

**A'nın alt kuralı:** manşetler **önem sırasına** göre en fazla 5 satır. Sıralama ölçüsü:
sana yakınlık > el değiştiren ilin değeri > aktörün büyüklüğü.

---

## 5. TASARIMDA DOLDURULACAK BOŞLUKLAR

§9 sekiz paragraf; kod yazarken karşılaşılacak tanımsız yerler. Her biri **var olan bir
kuralı arbitre alarak** doldurulacak.

| # | Boşluk | Nasıl doldurulacak |
|---|---|---|
| 1 | §9.1'de "Ordu'nun değeri" nedir | Hedef **parçanın** nüfus+ekonomi değeri (`parcaDegerleri`, zaten testli) + ili tamamlıyorsa il bonusu |
| 2 | "Kazanma olasılığı" nereden gelir | **Üstünlük oranı** (Görev 06/6b). İkinci bir tahmin yazılmayacak — harita↔ekran çevirisinin üç yere kopyalanması dersinin aynısı |
| 3 | "Başka cepheyi açıkta bırakma cezası" | Kaynak parçanın düşmana sınırdaş komşularındaki kuvvetin, geride kalan kuvvete oranı |
| 4 | Ne kadarı orduya, ne kadarı araştırmaya | Kişiliğin **açgözlülük** ağırlığı böler; oran `DENGE.ZEKA`'da, kodda değil |
| 5 | Hangi bileşimde asker basar | §4.5 doğal denge tablosu — belge zaten "yapay zekânın üretim referansı" diyor |
| 6 | Nerede asker basar | Sanayi sınırının izin verdiği, düşmana en yakın kendi parçasında |
| 7 | Toparlanma kararı | §9.1: *"aynı fayda hesabıyla"* — yaralı birliklerin bedeli, o cephedeki tehdide karşı tartılır |
| 8 | Araştırma dalı seçimi | Sınırdaş düşmanlarının baskın birlik türüne göre; hiç sınırdaşı yoksa kişiliğe göre sabit |
| 9 | Kişilik hangi ile nasıl dağıtılır | Tohumla, **belirlenimci**; il verisinden sapma yok — her oyun aynı açılışla başlar (garnizon kararının aynısı, Görev 05 §6/4) |
| 10 | Emir vermeyen aktör | Geçerli bir durum; turu boş geçer, hata değil |
| 11 | Yapay zekâ oyuncunun bileşimini görür mü | **Evet — oyuncu da görüyor.** Savaş odası savunanın kadrosunu gösteriyor; asimetri "hile yapıyor" hissi yaratır |
| 12 | Yapay zekânın ekonomisi ayrı mı | Hayır. **Aynı `butce.js`, aynı sanayi sınırı, aynı fiyatlar.** Zorluk yalnızca *ağırlık* ayarıdır (§9.4), gizli bonus değil — kolay/zor için üretim çarpanı verilecekse **ekranda yazar** |

---

## 6. VERİ MODELİ VE KAYIT

```
durum.kisilikler = {
  "06": { saldirganlik: 0.7, acgozluluk: 0.4, husumet: 0.2, temkin: 0.5 }
}
durum.zorluk = "orta"            // kolay | orta | zor
durum.turSirasi = ["34","06",…]  // o turun çözüm sırası, tohumdan
```

- Kişilikler **oyun kurulurken tohumdan** üretilir; kayıtta tutulur ki yükleyince aynı
  rakiplerle devam edilsin.
- `durum.turSirasi` kayıtta tutulmaz — tohum ve tur numarasından yeniden türer.
- **Yapay zekâya ait yeni ordu/havuz alanı yok.** 80 aktör zaten oyuncuyla aynı yapıları
  kullanıyor; bu görevin kayda eklediği tek şey kişilik.

**Kayıt sürümü 7 — 1–6 reddedilir.** Sürüm 6 için ret sebebi: dünya duruyordu, artık
oynuyor. Sürüm 6 kaydı yüklenirse kişilikler boş olur ve 80 aktör hareketsiz kalır;
oyuncu oyunun bozulduğunu sanar.

**Kayıt boyutu yeniden ölçülecek.** Görev 06'da başlangıç 21.6 KB, 15 tur sonunda
21.7–22.3 KB idi. Bu görevde 80 aktör gerçekten asker basacağı için **15. turdaki boyut
belirgin büyüyecek** — sınır 26 KB, ölçülecek ve gerekirse kişilik ağırlıkları iki haneye
kısaltılacak.

---

## 7. ADIMLAR

| Adım | İş | Ekranda değişir mi |
|---|---|---|
| 0 | Denge sayılarının yeri + belge denetimi + açık maddeler | hayır |
| 1 | **ÖLÇÜM:** moralin tek yönlü hâle getirilmesi | hayır |
| 2 | **ÖLÇÜM:** garnizon dengesi + kare bütçesi | hayır |
| 3 | Karar fonksiyonu: hamle üretimi ve puanlama | hayır |
| 4 | Ekonomi kararları: üretim, toparlanma, araştırma + kişilik | hayır |
| 5 | Sıra sistemi — **dünya ilk kez kendi kendine hareket eder** | evet |
| 6 | Arayüz: tur işleniyor, genişletilmiş tur raporu, oyun sonu | evet |
| 7 | Zorluk ayarı, denge ölçümü, belgeler, testler, kayıt sürümü 7 | evet (küçük) |

**Adım 1–4 boyunca ekranda hiçbir şey değişmez.** Dört görevdir uygulanan kural; dördünde
de işe yaradı.

---

### Adım 0 — Denge sayıları, belge denetimi, açık maddeler

1. `DENGE.ZEKA` açılır: dört kişilik ağırlığının aralıkları, üç zorluk kademesi, fayda
   formülünün terim katsayıları, hamle adayı sayısı, manşet sınırı. **Formülde çıplak sayı
   olmayacak** — test kanıtlayacak (katsayıyı değiştir, kararın değiştiğini doğrula).
2. **Husumet verisi var mı?** §13.2 ✅ diyor. Depoda aranacak; yoksa Soru 4'ün notu geçerli.
3. **Araştırma tavanı Sv.2 cihazda onaylanacak** (Görev 06 §13/3). Baki'ye sorulacak;
   sığ geliyorsa `DENGE.ARASTIRMA.TAVAN` tek satır değişir.
4. Tasarım §9 somutlanmaya hazırlanır: §9.1'in formülü üç terimli, oyunda dört musluk var;
   eksik üç karar (üretim, toparlanma, araştırma) belgeye yazılacak (Adım 7).
5. §14 denge düğmeleri tablosuna eklenecek satırlar işaretlenir: **kişilik ağırlık aralığı ·
   zorluk kademesi · yapay zekâ hamle adayı sayısı.**

---

### Adım 1 — ÖLÇÜM: moralin tek yönlülüğü

> Görev 06 §13/1b'nin devri. **Yapay zekâdan önce yapılmalı.**

**Neden önce:** fayda fonksiyonunun tamamı "birlik eklersem sonuç iyileşir" varsayımına
dayanıyor. Motorda bu **%0.20 oranında yanlış** (birlik ekleyince kazanırken kaybediyor) ve
**%6.06 oranında kısmen yanlış** (sağ kalanı azalıyor). Bu düzeltilmeden yazılan yapay zekâ
tuhaf kararlar verecek ve **hatanın zekâda mı motorda mı olduğu bulunamayacak** — Görev
04'ten beri kaçınılan tam olarak bu durum.

**Kök sebep hatırlatması:** `moral = ⌈birlik/2⌉`. 3 birlik → moral 2; 4 birlik → yine
moral 2. Dördüncü birlik moral getirmiyor ama ölünce moral götürüyor.

**Sınanacak adaylar** (hepsi aynı tarama betiğinden geçecek):

| # | Aday | Notu |
|---|---|---|
| 1 | Kesirli taban: `moral = birlik/2 + bonuslar`, tavan/taban yok | En küçük değişiklik |
| 2 | Bozgun **kayıp oranına** bakar: kayıp/başlangıç ≥ eşik | Tanım gereği tek yönlü |
| 3 | Kayıp başına oransal moral: her kayıp `2/n` moral | Görev 06 raporunun önerisi |
| 4 | Moral sayacı kalır, bozgun kontrolü orana bakar | 1 ve 2'nin karması |

**İki ölçütü birden geçmeyen aday elenir:**
- **§3.7'nin 15 satırı 15/15 korunur** — bu projenin kırmızı çizgisi (kesir tabanlı deneme
  Görev 06'da tam bu yüzden geri alınmıştı)
- Anomali oranları düşer; hedef **%0.20 → 0** ve %6.06'nın belirgin gerilemesi

> ⚠ **Görev 06'nın en değerli dersi burada geçerli: ölçütün kendisi de yanlış olabilir.**
> Araştırma tavanı dört kez ölçüldü, ilk üç ölçüt kullanılamaz cevap verdi. Bu yüzden
> tarama **iki modelle birden** koşacak (sürekli referans model + oyunun motoru) ve
> ayrışırlarsa uyarı basacak — Görev 06'da kurulan düzenek aynen kullanılacak.

**Çıktı:** `veri/moral-olcum.md` + Baki'ye bir sayfalık özet. **Hiçbir aday iki ölçütü
birden geçemezse formüle dokunulmaz**, anomali kabul edilir ve yapay zekânın fayda
hesabına "birlik eklemenin faydası eşitse ekleme" gibi bir kırılma önleyici konur.

---

### Adım 2 — ÖLÇÜM: garnizon dengesi ve kare bütçesi

**a) Garnizon (Soru 3).** Seçilen yöntem uygulanır, sonra 81 ilin **değer ÷ savunma**
oranı yeniden ölçülür. Bitiş ölçütü: en yüksek ve en düşük oran arasındaki fark bugünkü
**5.9 kattan** (Iğdır 5.00 / Ankara 0.85) belirgin şekilde daralır. Çıktı
`veri/garnizon-olcum.md`.

**b) Kare bütçesi — yapay zekâ yazılmadan önce ölçülür.** §9.3 hesabın kaldırılabileceğini
söylüyor ama sayı vermiyor. Ölçülecek:

- 181 parça × ortalama komşu sayısı × 3 kuvvet adayı = **kaç aday hamle**
- Her aday bir muharebe simülasyonu ister; **tek simülasyonun süresi** ölçülür
- Tur başına toplam süre çıkar

**Karar eşiği:** tur başına toplam hesap **bir kareyi (≈16 ms) aşıyorsa** bölünmüş
hesaplama (§9.3) zorunludur, aşmıyorsa gereksizdir. Bu, Görev 04 ve 05'te akıcılığın
peşinden koşulmasının sebebiydi; bu sefer **kod yazılmadan ölçülüyor.**

---

### Adım 3 — Karar fonksiyonu (`src/oyun/zeka.js`)

Saf fonksiyon, oyun durumunu değiştirmez — `muharebe.js` kalıbının aynısı:

```
adayHamleler(durum, aktorId)            → [{ kaynak, hedef, birlikler }]
hamlePuani(durum, aktorId, hamle, kisilik) → sayı
zekaEmirleri(durum, aktorId, kisilik, tohum) → { hareketler, toparlanmalar }
```

**Fayda formülü (§9.1'in somutlanmış hâli):**

```
puan = açgözlülük × hedefin değeri × üstünlük
     − temkin      × gönderilen kuvvetin bedeli × (1 − üstünlük)
     − temkin      × açıkta kalma cezası
     + husumet     × (hedef hasım mı)
     + saldırganlık × sabit saldırı eğilimi
```

- **üstünlük** = `muharebe.js`'in üstünlük oranı. Yeniden hesaplanmayacak, çağrılacak.
- Katsayıların hepsi `DENGE.ZEKA`'dan.
- **Belirlenimcilik zorunlu:** eşit puanlı hamleler arasında seçim `rastgele.js` ile,
  `Math.random` ile değil. Aynı tohum + aynı durum → aynı karar.

**Bitiş ölçütü:** elle kurulmuş durumlarda yapay zekânın **doğru olduğu apaçık** kararı
verdiği test edilir — 1 birliklik ordu 10 birliklik garnizona saldırmaz; bedava duran boş
komşu parça alınır; iki hedeften değerlisi seçilir; kendini savunmasız bırakan hamle
denk puanlı alternatif varken seçilmez.

---

### Adım 4 — Ekonomi kararları ve kişilik

```
uretimKarari(durum, aktorId, kisilik)     → sipariş + hangi parça
arastirmaKarari(durum, aktorId, kisilik)  → ayrılan ekonomi + dal
toparlanmaKarari(durum, aktorId, kisilik) → hangi ordular
kisilikUret(tohum, iller)                 → aktör başına dört ağırlık
```

**Değişmez kural:** yapay zekânın verdiği her emir, oyuncunun emirlerinin geçtiği
**aynı doğrulamadan** geçer — `siparisGecerliMi`, `hareketGecerliMi`, `butce.js`.
Yapay zekâ için ikinci bir yol açılmayacak. Test bunu kilitleyecek: yapay zekânın ürettiği
hiçbir emir, doğrulamadan reddedilmemeli **ve** doğrulama atlanarak uygulanmamalı.

**Üretim referansı §4.5.** Belgede zaten *"yapay zekânın üretim referansıdır"* yazılı: hangi
il tipi hangi karışımı doğurur. Yeni bir bileşim mantığı icat edilmeyecek.

---

### Adım 5 — Sıra sistemi (dünya hareket eder)

`turDongusu.js`'in 8. maddesi:

1. Tur başındaki durumun **tek fotoğrafı** alınır (Soru 1 = A ise herkes buna bakar).
2. 80 aktör için karar fonksiyonu koşar; emirler kuyruğa eklenir.
3. Çözüm sırası tohumla karıştırılır, `cozum.js` hepsini işler.
4. Ekonomi aşamaları (üretim, araştırma, toparlanma) her aktör için işler.

**Bu adımın sonunda oyun ilk kez kendi kendine oynanabilir hâle gelir.** Baki'nin
cihazdaki ilk kontrolü: TURU BİTİR'e üst üste basıldığında harita **anlamlı** değişiyor mu
— iller birleşiyor mu, saçma hamleler var mı, oyun donuyor mu.

---

### Adım 6 — Arayüz

**a) Tur işleniyor perdesi.** 80 aktörün turu anlık değilse oyuncu boş ekrana bakmamalı.
Kısa bir perde + ilerleme.

> ⚠ Görev 05 ve 06'da iki kez yaşandı: **üstteki kutu, yerel katmandaki harita jestini
> engellemez.** Perde açıkken harita jesti **susturulacak** — savaş odasındaki kalıp aynen
> kullanılacak, yeniden çözülmeyecek.

**b) Genişletilmiş tur raporu (Soru 5).** Görev 06'nın dil kararları aynen sürer:
**birlik · toparlanma · savaş · raunt**, tablo değil **cümle**, "developer gibi arayüz yok".

**c) Asgari oyun sonu kontrolü.** Yapay zekâ gelince oyuncu ilk kez **kaybedebilir**.
İki durum yakalanacak:
- Oyuncunun hiç parçası kalmadı → *yenildin*
- Kapsamdaki tüm parçalar oyuncunun → *kazandın*

Tam mod sistemi ve kazanma koşulu ekranı (§8.1) **Görev 08'de**; buradaki yalnızca oyunun
sessizce anlamsız duruma düşmesini engelleyen iki kontrol ve tek bir kutu.

---

### Adım 7 — Zorluk, ölçüm, belgeler, kayıt

1. **Zorluk kademesi** ayarlar menüsüne (üç kademe, §9.4: *"zorluk = ağırlık ayarı, hesap
   değil"*). Üretim bonusu verilecekse **ekranda yazacak.**
2. **Bitiş ölçütü ölçülür:** `scripts/denge-simulasyonu.js` yapay zekâ açıkken koşar.
   Karşılaştırma tablosu:

   | Koşu | Oyuncunun aldığı parça (15 tur) |
   |---|---|
   | Görev 06 — dünya duruyor | **22/181** |
   | Görev 07 — dünya oynuyor, kolay | ? |
   | Görev 07 — dünya oynuyor, orta | ? |
   | Görev 07 — dünya oynuyor, zor | ? |

   Ayrıca ölçülecek: 15. turda haritada **kaç bağımsız aktör kaldı** (§9.3'ün öngördüğü
   doğal konsolidasyon gerçekleşiyor mu) ve **tur başına hesap süresi**.
3. Tasarım belgesi güncellenir: §9 (dört kararın formülleri, kişilik aralıkları, zorluk),
   §3.8 (moral formülü değiştiyse), §7/garnizon (Soru 3), §8 madde 8, §14 (yeni düğmeler),
   sözlük.
4. `veri/URETIM-NOTU.md`: tüm kararlar **gerekçesiyle**.
5. Kayıt sürümü 7, boyut ölçümü.
6. `npm.cmd run kontrol` + `npx.cmd expo export`.

---

## 8. TESTLER VE BİTİŞ ÖLÇÜTÜ

**Sayı hedefi:** Görev 06 sonunda 348 test vardı; bu görev **~70 test** eklemeli
(hedef ~420).

### Geri gidiş kilidi

- [ ] **§3.7'nin 15 satırı 15/15** — moral formülü değişse bile
- [ ] Görev 06'nın tahmin testleri (üstünlük ölçüsü) değişmeden geçiyor
- [ ] Mevcut toparlanma ve araştırma testleri geçiyor

### Moral (Adım 1)

- [ ] Seçilen formül §3.7'yi koruyor
- [ ] Anomali taraması ölçüldü, oranlar raporda yazılı
- [ ] "Birlik eklemek sonucu kötüleştirmez" en az taranan durumların %99.9'unda doğru

### Yapay zekâ

- [ ] **Belirlenimci:** aynı tohum + aynı durum → aynı karar (10 kez koşuldu, aynı çıktı)
- [ ] Hiçbir yerde `Math.random` yok
- [ ] Yapay zekânın **her emri** oyuncunun doğrulamasından geçiyor
- [ ] Yapay zekâ bütçesini aşamıyor, sanayi sınırını çiğneyemiyor — `butce.js` üzerinden
- [ ] Apaçık kararlar doğru: zayıf ordu güçlü garnizona saldırmıyor · bedava parça alınıyor ·
      iki hedeften değerlisi seçiliyor · kendini savunmasız bırakmıyor
- [ ] Kişilik ağırlıkları kararı **gerçekten** değiştiriyor (saldırgan vs temkinli aktör aynı
      durumda farklı emir veriyor)
- [ ] Zorluk kademesi ölçülebilir fark yaratıyor
- [ ] Emir vermeyen aktör turu boş geçiyor, çökme yok
- [ ] Fayda katsayıları koda gömülü değil (değiştir → karar değişiyor)
- [ ] Aynı hedefe giden iki yapay zekâ emri çakışmadan çözülüyor (Görev 05'in sıralı çözümü)

### Garnizon ve sıra

- [ ] Yeni garnizon dağılımının değer ÷ savunma yayılımı ölçüldü ve daraldı
- [ ] Çözüm sırası tohumla karışıyor; hiçbir aktör kalıcı ilk vuruş avantajı almıyor
- [ ] Aynı tohumda sıra tekrar üretilebiliyor (kayıtta tutulmuyor, türetiliyor)

### Genel

- [ ] Kayıt sürümü 7, 1–6 anlaşılır mesajla reddediliyor, gidiş-dönüş korunuyor
- [ ] Kayıt boyutu 15 turda ölçüldü, sınırın (26 KB) altında
- [ ] Tur işleme süresi ölçüldü; kare bütçesini aşıyorsa bölünmüş hesaplama çalışıyor
- [ ] `npm.cmd run kontrol` temiz · `npx.cmd expo export` hatasız
- [ ] Telefonda test: dünya anlamlı hareket ediyor, oyun akıcı, tur raporu okunuyor —
      **Baki onayı**
- [ ] `veri/moral-olcum.md`, `veri/garnizon-olcum.md`, `veri/denge-simulasyonu.md` güncel
- [ ] `URETIM-NOTU.md` güncel

---

## 9. TUZAKLAR

**Önceki görevlerden taşınanlar:**

1. **Üstteki kutu, yerel katmandaki harita jestini engellemez.** Tur işleniyor perdesi için
   jest susturulacak; savaş odasının kalıbı kullanılacak.
2. **Aynı kural iki yerde tutulmaz.** Görev 05'in en pahalı hatası harita↔ekran çevirisinin
   üç yere kopyalanmasıydı; Görev 06'da `orduBol` → `kadroBol` çağrısıyla doğru yapıldı.
   Burada aynısı: **yapay zekâ ikinci bir muharebe tahmini yazmayacak**, `muharebe.js`'in
   üstünlük oranını çağıracak.
3. **Denge sayısı sızıntısı.** Fayda formülü uzun; ara hesapta çıplak sayı yazmak çok kolay.
   Kural değişmedi: hepsi `DENGE`'den.

**Bu göreve özgü:**

4. **Belirlenimcilik en kolay kaybedilen özellik.** Tek bir `Math.random` çağrısı, kayıttan
   yüklenen oyunun farklı akmasına ve hata ayıklamanın imkânsızlaşmasına yeter.
   `rastgele.js` dışında rastgelelik olmayacak.
5. **Yapay zekâya ayrıcalık sızması.** "Şurada bir kontrolü atlarsak daha akıllı oynar"
   cazip ve ölümcül. Zorluk **ağırlık ayarıdır** (§9.4); gizli bonus verilecekse ekranda
   yazar. Aksi hâlde oyuncu aldatıldığını hisseder ve haklıdır.
6. **Kare bütçesi.** 80 aktörün kararı tek karede hesaplanırsa telefon donar. Adım 2 bunu
   kod yazılmadan ölçüyor — akıcılık bu projede iki kez ele avuca sığmadı.
7. **Yapay zekânın aptallığı motorun hatasını gizler.** Yapay zekâ saçma oynadığında ilk
   şüpheli fayda formülü olacak; ama Görev 06'da görüldüğü gibi hata **ölçütte** de
   olabiliyor. Adım 3'ün "apaçık kararlar" testleri tam bu yüzden var: zekâ bunları
   geçiyorsa sorun ağırlıklarda, geçemiyorsa formülde.
8. **Tur raporu şişebilir.** 80 aktör her tur bir şeyler yapacak. Manşet sınırı ve önem
   sıralaması **baştan** konacak, sonra kısaltılmaya çalışılmayacak.

---

## 10. GÖREV 08 İÇİN BEKLEYENLER

Diplomasi (§10: ittifak · ateşkes · savaş hali · ittifak bozma bedeli) · rekabet olayları
(§11: Kutsal Fındık Savaşı ve husumet tablosu) · mod seçim ekranı ve tam kazanma koşulu
(§8.1) · ana menü · sıcak koltuk · para kazanma katmanı (§12).

Bu görev bittiğinde oyun **baştan sona oynanabilir** olur: kaynak üret, asker bas, yürü,
savaş, fethet, toparlan, güçlen — ve karşında düşünen biri var. Görev 08 oyunu *bitirilebilir*
ve *yayınlanabilir* yapan katman.

---

## EK — KARAR ÖZETİ (doldurulacak)

| Soru | Cevap | Tarih |
|---|---|---|
| 1 — Aktörler aynı anda mı, sırayla mı oynar | | |
| 2 — Yapay zekâ kuvvetini nasıl böler | | |
| 3 — Garnizon il ölçeğinde dengelensin mi | | |
| 4 — Kişilikler ve zorluk | | |
| 5 — 80 aktörün turu nasıl gösterilir | | |
| + Diplomasi kapsama girsin mi (varsayılan: hayır) | | |
| + Araştırma tavanı Sv.2 cihazda onaylandı mı | | |
