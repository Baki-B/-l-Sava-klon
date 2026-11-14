# Delicilik ölçümü — ağır vuruş ve araştırmanın tek yönlülüğü

**Üreten:** `node scripts/delicilik-olcum.js` · 2026-08-11
**Soru:** Baki — *"Ağır vuruş zırha karşı delicilik versin, bonus hasar kazanmasın; zırhın
bir kısmına ignore atsın. Onun dışında araştırmalarda 3 tür için de statlar geliştirildikçe
kalitesinin azalma durumu olmasın."*

İki istek aynı hatanın iki yüzü çıktı: eğri zırha bonus verdiği için zırh araştırması
oyuncuyu zayıflatıyordu. Bir formül düzeltmesi ikisini birden kapattı.

---

## 1. Eğri: bonus gerçekten var mıydı?

Ağır vuruşun etkinliği, hedefin ortalama zırhına göre:

| Hedefin zırhı | ESKİ ağır | YENİ ağır | Hafif (değişmedi) |
|---|---|---|---|
| 0 | 0.550 | 0.800 | 1.000 |
| 10 | 0.617 | 0.760 | 0.833 |
| 20 | 0.675 | 0.720 | 0.667 |
| 30 | 0.723 | 0.680 | 0.500 |
| 40 | 0.760 | 0.640 | 0.333 |
| 60 | 0.805 | 0.560 | 0.100 |

**Eski sütun zırhla birlikte BÜYÜYOR.** Formül şuydu:

    agir = (1 − zırh/200) × (0.55 + zırh/100)

Birinci çarpan zırhı bir koruma sayıyordu, ikincisi ("yumuşak hedefte mermi israfı") zırhı
bir ÖDÜL sayıyordu — ve ikincisi kazanıyordu. Üç birimde karşılığı: piyadeye 0.617,
topçuya 0.675, zırhlıya 0.760. Yani ağır vuruş, en zırhlı hedefte
en verimliydi.

Yeni formül tek bir zırh eğrisi kullanıyor; ağır vuruşun tek ayrıcalığı zırhın
**%70'ini yok saymak**:

    kalanZırh = zırh × (1 − 0.7)
    agir      = 0.8 × (1 − kalanZırh / 60)
    hafif     = 1 − zırh / 60

Zırh artık ağır vuruşu da **her zaman** azaltıyor, yalnızca hafif vuruşa göre
3.3 kat daha az. Bonus yok, delicilik var.

⚠ **Zırhın ağır vuruşu ne kadar azalttığı DEĞİŞMEDİ.** Eski sönüm böleni 200'dü ve
60/(1 − 0.7) = 200 —
aynı sayı. Delicilik yeni bir mekanik değil, zaten oradaki şeyin doğru adı. Değişen tek şey
bonusun kalkması.

---

## 2. İki sayı nasıl seçildi

Hakem her zamanki: §3.7'nin 15 satırı, kalan-oran çıpaları, eşit para matrisi ve (yeni)
araştırmanın tek yönlülüğü. Delicilik × verim taraması:

| Delicilik | Verim | agir (p/t/z) | 15 satır | Çıpa sapması | Zafer kaybı | Kuvvet kaybı |
|---|---|---|---|---|---|---|
| 60% | 0.75 | 0.700 / 0.650 / 0.550 | ✗ 1 zırhlı vs 1 topçu (dağlık) → saldiran | 0.20 | 0 | 2 |
| 60% | 0.8 | 0.747 / 0.693 / 0.587 | 15/15 ✓ | 0.00 | 0 | 2 |
| 60% | 0.85 | 0.793 / 0.737 / 0.623 | 15/15 ✓ | 0.00 | 0 | 2 |
| 60% | 0.9 | 0.840 / 0.780 / 0.660 | ✗ 3p+1t+1z vs 5 topçu (ova) → savunan | 0.33 | 0 | 7 |
| 70% | 0.75 | 0.712 / 0.675 / 0.600 | 15/15 ✓ | 0.00 | 0 | 3 |
| 70% | 0.8 | 0.760 / 0.720 / 0.640 | 15/15 ✓ | 0.00 | 0 | 1 |
| 70% | 0.85 | 0.807 / 0.765 / 0.680 | 15/15 ✓ | 0.33 | 0 | 7 |
| 70% | 0.9 | 0.855 / 0.810 / 0.720 | ✗ 3p+1t+1z vs 5 topçu (ova) → savunan | 0.33 | 0 | 6 |
| 80% | 0.75 | 0.725 / 0.700 / 0.650 | 15/15 ✓ | 0.00 | 0 | 1 |
| 80% | 0.8 | 0.773 / 0.747 / 0.693 | 15/15 ✓ | 0.00 | 0 | 1 |
| 80% | 0.85 | 0.822 / 0.793 / 0.737 | ✗ 3p+1t+1z vs 5 topçu (ova) → savunan | 0.33 | 0 | 7 |
| 80% | 0.9 | 0.870 / 0.840 / 0.780 | ✗ 3p+1t+1z vs 5 topçu (ova) → savunan | 0.33 | 0 | 10 |

**Seçilen: delicilik %70 · verim 0.8.**

- **Delicilik %70**, çünkü mevcut sönümün ta kendisi (yukarıda). Zırhın ağır vuruşa etkisi
  hiç oynamıyor; yalnızca bonus kalkıyor. En az müdahale.
- **Verim 0.80**, çünkü 15 satırı da tutan, çıpaları hiç oynatmayan ve geri tepmesi en az
  olan değer. 0.90'da "3p+1t+1z vs 5 topçu" ters dönüyor — topçu her şeye karşı iyi bir
  birime dönüşüyor ve taş-kağıt-makas kapanıyor.
- Yan fayda: agir = 0.80 − 0.004 × zırh, yani üç birimde de temiz iki hane
  (0.760 · 0.720 · 0.640).

---

## 3. Araştırma tek yönlü mü?

**6144 muharebe tarandı** — 8 stat dalı × 4 seviye ×
8×8 ordu × 3 arazi × saldıran/savunan.

| Bulgu | Sayı |
|---|---|
| Yükseltmenin KAZANILAN savaşı kaybettirdiği durum | **0** |
| Sonuç aynı ama araştıranın daha az birimle çıktığı durum | 1 |

### Eski modelin geri tepmesi — 60 puan ödeyip savaşı kaybetmek

Düzeltme öncesi en net örnek (eski eğriyle ölçüldü):

| Savunan topçunun zırh dalı | Zırhı | Gelen ağır vuruşun etkinliği | Sonuç |
|---|---|---|---|
| Sv.0 | 20 | 0.675 | **kazanıyor** |
| Sv.1 | 24 | 0.695 | *kaybediyor* |
| Sv.2 | 28 | 0.714 | kazanıyor |
| Sv.3 | 32 | 0.731 | kazanıyor |

*(3 topçu vs 3 topçu, ova.)* Zırh arttıkça gelen ağır vuruş **güçleniyordu**; topçu
düellosu ağır vuruş düellosu olduğu için 60 puanlık ilk yükseltme savaşı çeviriyordu.
Ekranda "zırhın 20 → 24" yazıyor, sahada ordu zayıflıyordu — sessiz ve en kötü türden hata.

Yeni modelde aynı savaşta gelen ağır vuruş **0.720 → 0.704 → 0.688 → 0.672** diye
azalıyor ve savunan dört seviyede de kazanıyor.

### Kalan 1 durum ve sebebi

- `topcu.zirh` Sv.0→Sv.1 · saldıran 5T vs 6P (daglik) · 0.500 → 0.300

**Sebebi eğri değil, bozgunun kademeli olması.** Bunlar ZATEN KAYBEDİLEN savaşlar: daha
dayanıklı ordu bozgun eşiğine bir raunt geç varıyor, o fazladan raundda bir raunt daha
hasar yiyor ve bir birim eksik kaçıyor. Yani "dayanmak, kaçmaktan pahalıya gelebiliyor".

Bu, etkinlik eğrisinden bağımsız bir yapı sonucu — taramada her ayarda çıkıyor (yukarıdaki
tablonun son sütunu). Kazanılan savaşta hiç görülmüyor, kaybedilen savaşta bir birim.
Düzeltmek için bozgun kuralını raundun içine taşımak gerekir; bu ayrı bir tasarım kararı
ve **Baki'nin cevabı bekleniyor** — kendiliğinden değiştirilmedi.

---

## 4. Baraj oranı yeniden çözüldü

Baki'nin tarifi: *"1 topçu, 1 piyadeyi savaşın başında yarı dayanıklılığa indirsin."*
Bu oran topçunun piyadeye verdiği normal hasara bölünerek çıkıyor, yani etkinlik eğrisi
her değiştiğinde yeniden çözülmek zorunda.

| | Topçunun piyadeye vuruşu | Piyadenin yarı canı | Gereken oran |
|---|---|---|---|
| Eski eğri | 43.38 | 35 | 0.81 → yazılan **0.80** |
| Yeni eğri | 50.50 | 35 | 0.693 → yazılan **0.2** |

Oran 0.80'de bırakılsaydı baraj piyadeyi yarıya değil **%58'ine**
indirirdi ve Baki'nin cümlesi sessizce kaybolurdu. Sayı değil, cümle sabit.

---

## 5. Ne değişti, ne değişmedi

**Değişmedi:** §3.7'nin 15 satırı ve dört tasarım kısıtı (15/15), kalan-oran çıpalarının
hepsi, hafif vuruş eğrisi, bütün birim statları, fiyatlar, moral, arazi çarpanları.

**Değişti — ve bu doğrudan isteğin sonucu:** ağır vuruş yumuşak hedefte daha verimli
(0.617 → 0.760), zırhlıda daha az (0.760 → 0.640). Somut karşılığı:

- Piyade, topçu ve zırhlının ağır ateşine karşı biraz daha kırılgan.
- Zırhlı savaşları biraz daha uzun (zırhlıya giden ağır hasar %16 azaldı).
- Zırh araştırmak artık gerçekten koruyor — hem hafif hem ağır ateşe karşı.

Eşit para matrisi (satır = saldıran, sütun = piyade/topçu/zırhlı · K = saldıran kazanır):

- **ova**: P:kKk T:kkk Z:KKk
- **tepelik**: P:kKk T:kkk Z:KKk
- **daglik**: P:kkk T:kkK Z:kkk

İki hücre yer değiştirdi: tepelikte zırhlı artık topçuyu ölçekte de yeniyor (§3.7 kısıt 3
zaten bunu söylüyordu — matris o kısıtla artık çelişmiyor), dağlıkta piyade yığını artık
zırhlıyı eşit parayla yenemiyor (1.67:1 sayı üstünlüğü yetmiyor; §3.7'nin 2:1 dağlık satırı
duruyor).
