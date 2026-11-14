# ARAŞTIRMA ETKİSİ ÖLÇÜMÜ

> Üretildi: `node scripts/arastirma-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

**Baki (2026-08-11):** *"Araştırmaları yapılan birlikler savaşları kesinlikle
değiştirebilsin; mesela araştırmadan önce sınırdan kaybedilen savaşlar, bir taraf
araştırmaları yapınca sınırdan kazanmaya veya ezmeye başlasın."*

⚠ **Bu betiğin sorduğu soru bu istekle değişti.** Eskiden "araştırma §3.7 tablosunu
hangi seviyeye kadar BOZMUYOR" diye soruyor ve tavanı oradan seçiyordu. Artık
araştırmanın dengeyi değiştirmesi İSTENEN şey; ölçüt de "sınırdaki savaşları
çeviriyor mu" oldu. Eski ölçüt zaten tutarsızdı — §5 bunu gösteriyor.

## 1. Özet

| Ölçüt | Sonuç |
|---|---|
| Araştırmasız taban (§3.7) | **15/15** ✓ |
| Kıl payı kaybedilen savaş, tek dal Sv.3 ile dönüyor | **95%** (saldıran) · **99%** (savunan) |
| Aynısı, tam teçhizatla | **100%** · **100%** |
| Ezilerek kaybedilen savaş, tam teçhizatla dönüyor | 15% · 21% |
| Bedel başına değer sapması (araştırmasız → tam teçhizat) | %9 → %11 |

## 2. Araştırmasız taban — oyunun kimliği

Araştırma devreye girmeden §3.7 aynen duruyor. Bu tablo değişirse **statlar**
bozulmuş demektir, araştırma değil.

- ✓ Piyade denk sayıda zırhlıyı/topçuyu asla yenmez
- ✓ Zırhlı piyadeyi 1v1 ezer · 2v1 dar kazanır · 3v1 kaybeder
- ✓ Zırhlı topçuyu ovada yener; topçunun tek şansı coğrafya
- ✓ Zırhlı 4v6 ölçeğinde ovada kazanır, dağlıkta ezilir

## 3. SINIRDAKİ SAVAŞLAR — asıl ölçüt

Kaybedilen savaşlar, ne kadar kıl payı kaybedildiğine göre bantlara ayrıldı.
Marj = kalan can oranım (0.50 = başa baş). Sonra soruldu: araştırma bunu çeviriyor mu?

Ölçüm İKİ ROLÜ de kapsıyor: araştırmayı saldıran yaptığında ve savunan yaptığında.
Savunanın arazi çarpanı var ve bozgunu başka zamanda geliyor; tek rol ölçmek
kapsamın yarısını görmemek olurdu.

| Araştıran | Bant | Marj | Savaş | Tek dal Sv.1 | Sv.2 | Sv.3 | Tam teçhizat | *ezerek* |
|---|---|---|---|---|---|---|---|---|
| saldiran | **kıl payı** | 0.45–0.50 | 123 | 46% | 87% | **95%** | **100%** | *21%* |
| saldiran | **yakın** | 0.40–0.45 | 159 | 16% | 52% | **70%** | **98%** | *14%* |
| saldiran | **farklı** | 0.30–0.40 | 409 | 2% | 10% | **25%** | **73%** | *6%* |
| saldiran | **ezildim** | 0.00–0.30 | 1706 | 0% | 1% | **1%** | **15%** | *1%* |
| savunan | **kıl payı** | 0.45–0.50 | 75 | 71% | 96% | **99%** | **100%** | *17%* |
| savunan | **yakın** | 0.40–0.45 | 102 | 41% | 76% | **89%** | **100%** | *22%* |
| savunan | **farklı** | 0.30–0.40 | 323 | 8% | 24% | **45%** | **87%** | *4%* |
| savunan | **ezildim** | 0.00–0.30 | 1528 | 0% | 1% | **2%** | **21%** | *1%* |

Okunuşu:

- **Kıl payı kaybettiğin savaşın 95%'i (savunurken 99%) tek bir dalı sonuna kadar açmakla dönüyor**; tam teçhizatla 100% / 100%. Baki'nin istediği şey bu.
- İlk seviye bile kıl payı bandında 46% / 71% çeviriyor — 60 puanlık ilk yatırım sahada görülüyor.
- **Ezilerek kaybettiğin savaş dönmüyor** (15% / 21%). Bu da bir şart: araştırma umutsuz savaşı kazandırsaydı ordu büyüklüğü anlamını yitirirdi.
- "Ezerek" sütunu, kalan canın en az %70'i bende demek.

## 4. Uzmanlaşma haritası

Simetrik ölçüm: İKİ TARAF da aynı dalda aynı seviyede. "Bu dala yatırım yapılan bir
dünyada hangi eşleşme yön değiştirir?" **Bu bir sınır değil, bir haritadır** —
satırların kayması araştırmanın işe yaradığının göstergesi.

| Ağaç | Dal | Sv.1 | Sv.2 | Sv.3 |
|---|---|---|---|---|
| Piyade | Zırh | — | — | — |
| Piyade | Ağır vuruş | — | — | — |
| Piyade | Hafif vuruş | — | 1 piyade vs 1 topçu (ova) | 1 zırhlı vs 2 piyade (ova)<br>1 piyade vs 1 topçu (ova) |
| Topçu | Zırh | — | — | 3p+1t+1z vs 5 topçu (ova) |
| Topçu | Ağır vuruş | 3p+1t+1z vs 5 topçu (ova) | 4 zırhlı vs 6 topçu (ova)<br>3p+1t+1z vs 5 topçu (ova) | 4 zırhlı vs 6 topçu (ova)<br>3p+1t+1z vs 5 topçu (ova) |
| Topçu | Hafif vuruş | — | 3p+1t+1z vs 5 topçu (ova) | 3p+1t+1z vs 5 topçu (ova) |
| Zırhlı | Ağır vuruş | 1 zırhlı vs 1 topçu (dağlık) | 1 zırhlı vs 1 topçu (dağlık)<br>4 zırhlı vs 6 topçu (tepelik) | 1 zırhlı vs 3 piyade (ova)<br>1 zırhlı vs 1 topçu (dağlık)<br>4 zırhlı vs 6 topçu (tepelik) |
| Zırhlı | Hafif vuruş | 1 zırhlı vs 1 topçu (dağlık) | 1 zırhlı vs 1 topçu (dağlık) | 1 zırhlı vs 3 piyade (ova)<br>1 zırhlı vs 1 topçu (dağlık)<br>4 zırhlı vs 6 topçu (tepelik) |

### Özel dallar — 18 puan

Tek seviyeliler, tavanları tanım gereği 1. Onlara da aynı asıl soru soruldu:
yakın kaybedilen savaşı (marj ≥ 0.40) çeviriyorlar mı?

| Dal | Üç arazi ortalaması | **Çalıştığı arazide** |
|---|---|---|
| Baraj ateşi (topçu) | 55% | **55%** |
| Paletli üstünlük (zırhlı) *(ovada tanım gereği etkisiz)* | 27% | **43%** |

**Sağdaki sütun bağlayıcı olan.** Baraj üç arazide birden çalışıyor, paletli
üstünlük yalnızca tepelik ve dağlıkta — ovada ceza yok, telafi edecek şey de yok.
Üç araziye eşit ağırlık veren ortalama paleti haksız yere yarıya bölüyor.

⚠ **Dört özel daldan yalnızca ikisi bu eksende ölçülebilir.** Seferberlik (yaralı
piyade bedava iyileşir) ve yarma (bozulan düşman yok olur) muharebenin KAZANANINI
değiştirmiyor; biri savaştan önceki bütçeye, öteki savaştan sonraki sonuca dokunuyor.
Bu eksende ikisi de %0 çıkar ve bu bir zayıflık değil, KAPSAM farkıdır: ikisi
"savaşı kim kazanır" sorusunu değil, "kazanmak neye mal olur / ne kazandırır"
sorusunu cevaplıyor.

## 5. Tam teçhizat sağlığı

Herkes her şeyi araştırdığında oyun hâlâ oyun mu? **Ölçüt §3.7 değil** — o tablo
araştırmasız orduların tarifi. Ölçüt, eşit parayla karşılaşma matrisi:

| Arazi | Araştırmasız | Tam teçhizat |
|---|---|---|
| ova | `P:kKk T:kkk Z:KKk` | `P:kkk T:Kkk Z:KKk` |
| tepelik | `P:kKk T:kkk Z:KKk` | `P:kkk T:kkk Z:Kkk` |
| daglik | `P:kkk T:kkK Z:kkk` | `P:kkK T:kkK Z:kkk` |

(Satır = saldıran, sütun sırası piyade/topçu/zırhlı · `K` saldıran kazanır.)

Bedel başına savaş değeri sapması: **Piyade -4% · Topçu -6% · Zırhlı 9%** → **Piyade -8% · Topçu -2% · Zırhlı 11%**

Üçgen tam teçhizatta da dönüyor ve sapma %9 → %11 bandında kalıyor. Yani araştırma dengeyi KAYDIRIYOR
ama ÇÖKERTMİYOR — istenen tam olarak buydu.

### ⚠ "Araştırma tabloyu bozmasın" şartının çözümü yok

Sekiz stat dalından hangi alt küme açılırsa açılsın, tam teçhizatta §3.7'nin en az
bir satırı kayıyor (ölçüldü: sekiz dalın her biri tek tek çıkarıldı, en iyi durum
yine 1 kayan satır). Zırhlıya zırh ya da dayanıklılık dalı eklemek de kurtarmıyor,
yalnızca kayan satırı değiştiriyor. Eski ölçüt bu yüzden emekliye ayrıldı.

## 6. Ağacın büyüklüğü

- Stat dalı: **8** · özel dal: **4**
- Bir stat dalını sonuna kadar açmak: **360 puan**
- Bir özel dal: **18 puan**
- Tam teçhizat (bütün stat dalları): **2880 puan**

Artış oransal: `stat × (1 + 0.2 × seviye)`, Sv.3'te toplam %60.

## 7. Ölçümün kuralları

- Kaydırılmış stat tablosu oyunun kendi `arastirma.js birimStatlari`
  fonksiyonundan geliyor; ölçüm ile oyun ayrışamaz.
- Şans KAPALI (tohum yok): ölçüm belirlenimci olmalı.
- Her taraf KENDİ stat tablosuyla vurur, dayanır ve korunur.
- Tarama orduları: 2–12 birim, tek tür ve karma, üç arazi.
- §3 taraması `testler/arastirma.test.js` tarafından da koşuluyor: oranlar
  düşerse test öter (liste iki yere yazılmadı, betikten `require` ediliyor).
