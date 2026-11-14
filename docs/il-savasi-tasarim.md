# İL SAVAŞLARI — Oyun Tasarım Belgesi

> Türkiye 81 il üzerinde geçen, sıra tabanlı mobil strateji oyunu.
> Hedef platform: Android (telefon/tablet). Tek oyunculu + sıcak koltuk çok oyunculu.
> Bu belge uygulama için referanstır; tüm sayılar test edilmiş başlangıç değerleridir.

**Terim notu:** Ordunun tek bir üyesine bu belgede **birim** denir. "3 piyade + 1 topçu + 1 zırhlı" = 5 birimlik bir ordu. Tipik ölçek: bir ilin ordusu 2–10 birim, güçlü bir imparatorluk cephe başına 15–20 birim. Tüm sayılar küçük ve okunabilir kalır.

---

## 1. ÖZET

Risk'ten daha derin, HOI4'ten çok daha basit bir fetih oyunu. Oyuncu bir il seçer, ekonomisiyle ordu üretir, komşularını fetheder. Derinlik üç yerden gelir:

1. **İl gücü ≠ ordu gücü.** Zengin bir il savaşı kazanmaz; orduya yatırım yapan kazanır.
2. **Ordu kompozisyonu.** Üç birim tipi, birbirini stat düzeyinde sayaçlar.
3. **Arazi.** Aynı ordu ovada kazanır, dağda kaybeder.

Denge taş-kağıt-makas eşitliğiyle (%33/%33/%33) değil, **maliyet ve coğrafya** üzerinden sağlanır.

---

## 2. TEMEL PRENSİP: İL GÜCÜ ≠ ORDU GÜCÜ

Muharebeye **yalnızca sahaya sürülen ordular** girer. İlin nüfusu, ekonomisi, eğitimi savaş anında masada değildir — bunlar sadece *ordu inşa ederken* iş görür.

```
İl özellikleri  →  kaynak üretimi  →  ordu inşası  →  MUHAREBE (sadece ordular)
```

**Sonucu:** Ekonomiyi kasan ama orduya yatırım yapmayan zengin il, parasını orduya yatırmış fakir ile yenilir. Zenginlik masaya gelmez; sadece *daha büyük ordu inşa edebilme potansiyeli* anlamına gelir.

Bu, oyunun asıl stratejik gerilimini yaratır: **kaynağı ekonomiye mi, orduya mı?**

---

## 3. MUHAREBE SİSTEMİ

### 3.1 Birim statları

| Birim | Zırh | Ağır vuruş | Hafif vuruş | Dayanıklılık | Nüfus | Ekonomi |
|---|---|---|---|---|---|---|
| **Piyade** | 2 | 3 | 6 | 12 | 3 | 1 |
| **Topçu** | 4 | 8 | 3 | 10 | 2 | 3 |
| **Zırhlı** | 8 | 6 | 5 | 24 | 1 | 6 |

Topçunun kimliği: **iyi mevzilenmiş (zırh 4), sert vuran (ağır 8), ama kırılgan (dayanıklılık 10)** — az sayıda, tek atışta iş bitiren, üstüne gelinirse çöken birim.

### 3.2 Statların anlamı

- **Zırh** — gelen hasarı azaltır. **Her iki vuruş türünü de azaltır**, ama hafif vuruşu neredeyse durdururken ağır vuruşu yalnızca hafifçe kırpar (ağır vuruş zırhın büyük kısmını deler).
- **Ağır vuruş** — zırh delici. **Zırhsız hedefe de ciddi hasar verir**; sadece zırhlı hedefe karşı verimi daha yüksektir, çünkü dağınık yumuşak hedefte mermi israfı olur.
- **Hafif vuruş** — yoğun ateş. Zırhsız hedefe karşı çok etkili, zırha çarpınca büyük ölçüde seker.
- **Dayanıklılık** — bir *sünger*. Birimin yok olmadan soğurduğu hasar; hasarın türü fark etmez.

**Zırh ile dayanıklılık neden ayrı:** Zırh hasar *türüne* göre çalışır (seçici filtre), dayanıklılık *miktara* göre (mutlak sünger). Zırhlının hem pahalı hem ezici olabilmesi ancak ikisinin birlikte varlığıyla mümkün.

### 3.3 Formüller

```
zOrt = ordunun toplam Zırh'ı / birim sayısı        # "tipik birim ne kadar zırhlı"

hafif_etkinlik(zOrt) = clamp(1 − zOrt/12, 0.10, 1.00)

agir_etkinlik(zOrt)  = clamp( zırh_sönümü × isabet_verimi , 0.15, 1.00)
    zırh_sönümü   = 1 − zOrt/40      # zırh ağır vuruşu da azaltır, ama az
    isabet_verimi = 0.55 + zOrt/20   # yumuşak/dağınık hedefte mermi israfı

hasar = Σ_birim ( Ağır × agir_etkinlik(hedef.zOrt)
                + Hafif × hafif_etkinlik(hedef.zOrt) )

hasar × arazi_çarpanı × (1 ± şans)
```

> **Uygulama (Görev 05).** Motor `src/oyun/muharebe.js`; formüldeki hiçbir sayı koda gömülü
> değildir, hepsi `DENGE.MUHAREBE` altındadır (12, 40, 0.55, 20 ve alt sınırlar). Testler
> bunu sabiti değiştirip sonucun değiştiğini görerek kanıtlar.

**Etkinlik tablosu (hazır hesaplanmış):**

| Hedef | zOrt | Zırh sönümü | İsabet verimi | **Ağır net** | **Hafif net** |
|---|---|---|---|---|---|
| Piyade | 2 | ×0.95 | ×0.65 | **0.62** | **0.83** |
| Topçu | 4 | ×0.90 | ×0.75 | **0.68** | **0.67** |
| Zırhlı | 8 | ×0.80 | ×0.95 | **0.76** | **0.33** |

**Okunuşu:** Zırh her iki vuruşu da azaltır — hafif vuruşu %17'den %67'ye varan oranda keser, ağır vuruşu yalnızca %5–20 arası kırpar. Ağır vuruş zırhsız hedefe de ciddi hasar verir (%62), sadece zırhlı hedefte verimi daha yüksektir (%76). Zırhlının asıl korumasının hafif vuruşa karşı olduğu buradan görülür: 0.83 → 0.33.

### 3.4 Muharebe çözümü — tam sayı birimler + hasar havuzu

Muharebe tur tur yıpranmayla çözülür. **Kesirli birim yoktur**; ekranda hep tam sayı görünür. Kısmi hasar bir **hasar havuzunda** birikir.

```
her muharebe turu:
    dA = saldıranın verdiği hasar
    dB = savunanın verdiği hasar × arazi_savunma_çarpanı

    her taraf için:
        hasar_havuzu += alınan hasar
        while hasar_havuzu ≥ kaybedilecek_birimin_dayanıklılığı:
            birim -= 1  (kompozisyona ORANTILI dağıtılır)
            hasar_havuzu -= o birimin dayanıklılığı
            moral -= 1

    bir taraf moral 0'a inerse → BOZGUN, muharebe biter
    veya bir taraf 0 birime inerse → imha, muharebe biter
```

**Örnek:** 3 zırhlılık ordu 30 hasar yer → 1 birim ölür (24 hasar), havuzda 6 hasar kalır. Ekranda "2 birim + küçük bir hasar çubuğu" görünür. Bir sonraki muharebede o 6 hasar hatırlanır.

**Karma orduda kayıp dağılımı: ORANTILI.** 3 piyade + 1 topçu + 1 zırhlılık orduda kayıplar kompozisyona göre dağılır. "Piyade önce ölür, zırhlıyı korur" kuralı tematik olarak hoş ama sömürülebilir — 1 zırhlı + çok piyade dizen oyuncunun zırhlısı hiç ölmez, zırhlının maliyeti bedavaya gelir. Orantılı dağıtım bu sömürüyü kapatır.

**Görev 05'te doldurulan üç boşluk** (gerekçeleri `veri/URETIM-NOTU.md`'de):

1. **Hasar eşzamanlıdır.** İki taraf da *tur başındaki* kadrosuna göre vurur, sonra ikisine birden uygulanır. Sıralı olsaydı "kim önce vurur" gizli ve çok güçlü bir kural olurdu.
2. **Orantılı kayıp tam sayıya "en büyük artık" yöntemiyle bölünür.** O ana kadarki kayıplar muharebe başındaki kompozisyona ne kadar orantısızsa, açığı en büyük olan tür ölür; eşitlikte birim sırası karar verir. Sonuç **belirlenimcidir** — aynı girdi hep aynı türü öldürür. Sıradaki kurbanın dayanıklılığı havuzdan büyükse kimse ölmez, hasar havuzda bekler (ucuz birimin hasarı emmesi engellenir).
3. **Ordu bölünürse havuz da bölünür**, birim sayısına oranla. Yoksa "yarısını gönder, hasarı geride bırak" diye bedava temizlik sömürüsü doğardı.

### 3.5 Arazi

| Arazi | Savunan çarpanı | Zırhlı birim çarpanı |
|---|---|---|
| Ova | ×1.00 | ×1.15 |
| Tepelik | ×1.15 | ×0.85 |
| Dağlık | ×1.35 | ×0.50 |

Zırhlıya dağda ceza vermek hem gerçekçi hem de topçunun asıl kozunu oluşturur. **Arazi PARÇANIN arazisidir** (§7), ilin değil; muharebe hangi parçada geçiyorsa oranın çarpanı işler.

**"Zırhlı birim çarpanı" neye uygulanır** *(Görev 05'te ölçümle karara bağlandı)*: **zırhlı birimin VERDİĞİ HASARA**, hangi tarafta olduğuna bakılmadan. Dayanıklılığa değil, ikisine birden de değil. Bu tahmin değil ölçümdür: üç yorum da kodlanıp §3.7 tablosuna karşı çalıştırıldı (`node scripts/muharebe-referans.js` → `veri/muharebe-referans.md`) ve yalnızca "hasar" yorumu 15 satırın 15'ini de yeniden üretti (ötekiler 6 ve 3).

**Savunan çarpanı** savunan tarafın toplam hasarını çarpar. İki çarpan da `DENGE.ARAZI` altındadır; Görev 05'te `tema.js`'ten oraya taşındı (sunum dosyasında duran bir denge sayısıydı).

### 3.6 Şans

`±%10` bant. **Yalnızca güçler yakınken devreye girer** — kuvvet oranı 2:1'i aştığında şans sıfırlanır. Amaç: "ezici ordumu iki birimlik ordu ile kaptırdım" hissini engellemek.

**Kuvvet neyle ölçülür** *(Görev 05'te dolduruldu)*: ordunun o turda verdiği **ham hasar** — arazi ve şans uygulanmadan önceki değer. Birim sayısı olsaydı 3 piyade, 1 zırhlıya "3:1 üstün" sayılır ve şans kapanırdı; oysa §3.7'ye göre orada kazanan zırhlıdır. Şans her muharebe turunda iki taraf için ayrı ayrı atılır ve tohumludur (`rastgele.js`): aynı tohum + aynı girdi hep aynı muharebeyi verir.

### 3.7 Doğrulama tablosu (test edilmiş)

Aşağıdaki sayılar sürekli modelin ham çıktısıdır (kalan kuvvet); oyunda tam sayı birimlere yuvarlanır. Kimin kazandığı ve farkın büyüklüğü asıl okunması gereken şeydir.

| Senaryo | Kalan kuvvet | Kazanan |
|---|---|---|
| 1 zırhlı vs 1 piyade (ova) | 0.78 – 0.00 | zırhlı eziyor |
| 1 zırhlı vs 2 piyade (ova) | **0.15 – 0.00** | zırhlı dar farkla |
| 1 zırhlı vs 3 piyade (ova) | 0.00 – 1.85 | piyade sayıyla |
| 1 zırhlı vs 2 piyade (dağlık) | 0.00 – 1.46 | piyade coğrafyayla |
| 1 zırhlı vs 1 topçu (ova) | 0.66 – 0.00 | zırhlı |
| 1 zırhlı vs 1 topçu (tepelik) | 0.53 – 0.00 | zırhlı |
| 1 zırhlı vs 1 topçu (dağlık) | 0.00 – 0.18 | topçu coğrafyayla |
| 4 zırhlı vs 6 topçu (ova) | **1.25 – 0.00** | zırhlı dar farkla |
| 4 zırhlı vs 6 topçu (tepelik) | 0.00 – 1.76 | topçu |
| 4 zırhlı vs 6 topçu (dağlık) | 0.00 – 3.93 | topçu eziyor |
| 1 piyade vs 1 topçu (ova) | 0.00 – 0.07 | topçu |
| 2 piyade vs 1 topçu (ova) | 1.38 – 0.00 | piyade sayıyla |
| 3 piyade vs 2 topçu (ova) | 1.64 – 0.00 | piyade sayıyla |
| 3p+1t+1z vs 5 topçu (ova) | 1.50 – 0.00 | karma ordu |
| 3p+1t+1z vs 8 piyade (ova) | 0.00 – 4.01 | piyade yığını |

**Karşılanan tasarım kısıtları:**
- Piyade hiçbir zaman denk sayıda zırhlı/topçuyu yenmez — ancak sayı üstünlüğü veya arazi ile kazanır ✓
- Zırhlı 1v1'de piyadeyi ezer, 2'ye 1'de dar farkla kazanır, 3'e 1'de kaybeder ✓
- Zırhlı topçuyla ovada 1v1 kazanır; topçunun tek şansı coğrafya ✓
- Zırhlı ölçekte de (4v6) ovada kazanır, dağlıkta ezilir ✓

> **Tablonun arkasındaki model ve oyunun motoru aynı şey değildir** *(Görev 05)*. Tablo
> sürekli bir modelin çıktısı: kesirli birimler, moral yok, imhaya kadar yıpranma. Modelin
> kendisi hiçbir yerde yazılı değildi; tablo sayılarından geri çözüldü ve
> `scripts/muharebe-referans.js`'e kondu — 15 satırı ±0.02 ile yeniden üretiyor. Oyunun
> motoru ise tam sayı birimlerle, hasar havuzuyla ve bozgunla çalışır. Bu yüzden ölçüt
> **kazanan** ve **büyüklük sırasıdır**, ondalık eşitlik değil. Motor 15 satırın 15'inde de
> doğru kazananı veriyor (`testler/muharebe.test.js`).
>
> **Tam sayı sınırında beraberlik bozma** (tasarımda yoktu, tablo gerektirdi): hasar
> eşzamanlı olduğu için iki taraf aynı turda birden imha olabilir veya birden bozulabilir.
> Sürekli modelde böyle bir an yoktur — orada biri hep bir kırıntı kadar önde bitirir.
> Ölçüt sürekli modelin kendi ölçütüdür: **oransal olarak daha az yıpranmış taraf üstündür**
> (alınan toplam hasar / başlangıç canı), eşitlikte savunan kazanır çünkü toprak onda.
> Karşılıklı imhada, ayakta kalması gereken tarafın son birimi geri verilir. Bu kural
> konmadan tablonun üç satırı tutmuyordu (1z–1t dağlık, 1p–1t ova, 3p1t1z–5t ova).

### 3.8 Bozgun — moral sayacı

> **Görev 07'de değişti.** Bozgun artık moral SAYACINA değil, ordunun kaybettiği **CAN
> ORANINA** bakıyor (`DENGE.MUHAREBE.MORAL`, model `oran`, eşik %50 + bonus payı).
>
> Sebebi ölçüm (`veri/moral-olcum.md`): eski `moral = ⌈birim/2⌉` formülü tam sayı olduğu
> için 3 ve 4 birimlik ordu AYNI morali taşıyordu — dördüncü birim moral getirmiyor ama
> ölünce götürüyordu. Sonuç: birlik eklemek muharebeyi nadiren kaybettirebiliyordu (%0.02).
> Yapay zekânın fayda hesabı (§9.1) bunun tersine dayandığı için zekâdan önce düzeltildi.
>
> Ölçümün asıl bulgusu: **kayıp SAYISINA bakan hiçbir formül bunu çözemez**, çünkü kayıp
> tam sayıdır. Tek yönlülük ancak sürekli bir büyüklüğe bağlayınca kazanılıyor.
>
> **Bozgun için en az bir birim kaybı şart** — yoksa ordu hiç kimse ölmeden dağılabiliyor
> ve §3.7'nin "zırhlı piyadeyi 1v1 ezer" satırı kırılıyordu.
>
> Sonuç: kritik anomali %0.02 → **0**, yumuşak %6.03 → %4.82, §3.7'nin 15 satırı korundu.

Yüzde yok, tamamen tam sayı. Her ölçekte aynı çalışır.

```
Moral = ⌈birim sayısı / 2⌉ + bonuslar
```

**Bonuslar (hepsi +1):**
- İlin moral/istikrar statı yüksekse: +1
- Savunmada dağlık arazi: +1
- Kendi toprağında savaşıyorsa: +1

**Bonuslar veriden nasıl okunuyor** *(Görev 05'te dolduruldu — elle liste yok)*:
- **Moral statı → PARÇANIN İLİNDEN.** Saldıran için sefere çıktığı parçanın ili, savunan için savunulan parçanın ili. "Yüksek"in eşiği **5**'tir: 81 ilin 23'ü (≈%28) bunu sağlıyor. 6 seçilseydi yalnızca 4 il alırdı ve bonus fiilen ölü kural olurdu.
- **Dağlık → PARÇANIN arazisinden**, yalnızca savunana.
- **Kendi toprağı → savunulan parçanın sahibi o taraf mı.** Kendi parçasını geri alan saldıran da bunu alır.

**Her kaybedilen birim −1 moral. Moral 0'a inince ordu bozulur ve çekilir.**

**Örnek:** 5 birimlik ordu → moral 3. Üçüncü birimini kaybedince bozulur, 2 birimle çekilir. Aynı ordu kendi dağlık ilinde savunmadaysa moral 3+1+1 = 5 → fiilen son adamına kadar savaşır.

Bu sistem, 7 il özelliğinden **moral/istikrara** somut bir iş verir.

### 3.9 Savaş sonrası

**1. Geri çekilme.** Bozulan ordu komşu **dost bir parçaya** çekilir; çekilirken **1 birim daha** kaybeder (kayıp yine kompozisyona orantılı seçilir). Gidecek dost komşu parça yoksa ordu esir düşer / yok olur.

> **Çekilme yönünü motor seçer, kural bellidir** *(Görev 05 / Soru 4 → Baki'nin cevabı A, 2026-07-27)*. Öncelik: **(1)** saldırıya çıktığı parça (hâlâ elindeyse), **(2)** kendi parçaları arasında **en çok birimi olan** komşu, eşitlikte kimlik sırası, **(3)** hiçbiri yoksa ordu yok olur. Oyuncuya sorulmaz: bozgun bir cezadır, ortasında seçim vermek cezayı yumuşatır; ayrıca Görev 07'de yapay zekânın da aynı kararı vermesi gerekecek, iki ayrı yol yazmanın anlamı yok. Yön, tur raporunda **yazıyla** bildirilir.
>
> **Berabere biten muharebede çekilme kaybı YOKTUR.** Üst sınıra (`EN_COK_TUR`, 20) dayanan muharebe berabere biter, saldıran çıktığı parçaya döner, iki taraf da yıpranmış kalır. Çekilme kaybı bozgun cezasıdır; burada kimse bozulmamıştır.

**2. Yeniden toplanma — 1 tur.** Ordu dost bir parçada durur, **o tur hareket edemez ve saldıramaz**. Tur sonunda kaybedilen birimler geri gelir, hasar havuzu sıfırlanır.

> **Görev 06'da uygulandı.** Kod: `src/oyun/toplanma.js`.
>
> **KADRO KAVRAMI** *(Soru 1 → Baki'nin cevabı A, 2026-07-30)*. "Kaybedilen birimler" ancak bir yerde yazılıysa geri gelebilir. Ordu artık iki sayı taşır: **kadro** (kağıt üstündeki mevcut) ve **birimler** (sahadaki mevcut). Üretim ikisini de artırır, kayıp yalnızca birimleri azaltır, toplanma birimleri kadroya kadar yükseltir. **Kadro, toplanmanın doğal üst sınırıdır** — onsuz oyuncu 1 birimlik ordusunu her tur yarı fiyata 20 birime "doldurur" ve üretim sistemi (sanayi sınırı dahil) anlamsızlaşırdı. Değişmez kural: her tür için `kadro ≥ birimler`; beş yolda da (üretim · kayıp · bölünme · birleşme · toplanma) ayrı ayrı test ediliyor. Ordu bölününce **eksik kısım** birim sayısına oranla bölünür — hasar havuzuyla aynı kural, aynı fonksiyon.
>
> **NE ZAMAN İŞLER** *(Soru 2 → Baki'nin cevabı B, 2026-07-30)*. Belge burada kendi içinde çelişiyordu: §3.9/2 "tur sonunda", §8 "4. aşama", §3.9/5 "o tur savaşamaz" diyordu. Seçilen kural: **toplanma çözümden SONRA, tur sonunda işler.** Ordu o tur **yıpranmış hâliyle savunur**, tur bitince dolar. Bedel gerçek: parayı verdin ve bir tur zayıf durdun. Çözümden önce işleseydi toplanma savunmada bedava güç olurdu.
>
> **Kaynak, emir verilirken değil toplanma FİİLEN gerçekleşirken düşer.** Ordu o tur imha olduysa hiçbir şey harcanmaz — "para buharlaştı" hissi olmaz. Bozguna uğrayıp çekilen ordu ise geçerli bir parçada durduğu için toplanmasını **çekildiği yerde** tamamlar.
>
> **Emir kuyruğa girer** (§8a), iptal edilebilir.
>
> ### YARALI BİRLİKLER *(Baki, 2026-07-31)*
>
> Baki'nin isteği: *"savaşlarda bazı birlikler ölsün bazıları yaralansın bazılarına bir şey olmasın (bir şey olmama durumu savaş kazanıldığında geçerli olur)"* ve *"toparlanma yalnızca yaralı birlikler için geçerli olsun, yaralı olmayanlar savaşmaya devam etsin"*.
>
> Ordu artık **üç durumu** birden taşır: `birimler − yarali` SAĞLAM · `yarali` sahada ama zayıf · `kadro − birimler` ÖLENLER.
>
> **Kim yaralanır:** muharebeden sonra hayatta kalanların **yıpranma oranı** kadarı yaralı çıkar. Oran = alınan hasar / başlangıç canı — motorun beraberlik bozmakta zaten kullandığı ölçü, yeni formül icat edilmedi. Ezici kazananın oranı ~0'dır, kimse yaralanmaz ("bir şey olmama" durumu); bozulup kaçanın oranı en yüksektir, neredeyse hepsi yaralı döner. Muharebeye yaralı girip sağ çıkan yaralı kalır — savaşmak kimseyi iyileştirmez.
>
> **Yaralı ne yapar:** aynı güçle vurur ama **canı yarıdır** (`DENGE.MUHAREBE.YARALI_CAN`), yani daha çabuk düşer. Tek etki bu — hem anlatması kolay, hem de iki ayrı etkinin dengesini ölçmek gerekmiyor. Kayıpları **önce yaralılar verir**; çekilme kaybında da geride kalan yaralıdır.
>
> **Toparlanma yalnızca YARALILARI sahadan çeker.** Sağlam birlikler aynı tur saldırıya veya takviyeye gidebilir. Ölenlerin yerine gelen takviye kimseyi meşgul etmez — o birlikler henüz sahada değil. Dolayısıyla yalnızca ölü kaybı olan bir ordu, toparlanma emri almış olsa bile **tam güçle savaşır**. Rezervasyon defteri yalnızca yaralıları tutar; yeni bayrak yazılmadı.
>
> **Hareket bölünmesinde SAĞLAMLAR ÖNCE GİDER.** Oyuncu kaç birlik göndereceğini seçer, hangilerini değil; sefere sağlam asker gider, yaralı geride kalır. Sağlamdan fazlası istenirse aradaki fark yaralılardan tamamlanır.
>
> **İyileştirme, ölenin yerine yenisini koymaktan ucuzdur** (`DENGE.TOPLANMA.IYILESTIRME` = ½ · piyade için 1 nüfus/1 ekonomi'ye karşılık 2 nüfus/1 ekonomi). Bütçe kısıtlıysa **önce yaralıya bakılır**: en çok kuvveti en az parayla ayağa kaldıran sıra budur.

**3. Toplanma maliyeti — kompozisyona göre.** Her birimin normal bedelinin yarısı, yukarı yuvarlanmış. Hem nüfus hem ekonomi harcanır:

| Birim | Normal bedel | Toplanma bedeli |
|---|---|---|
| Piyade | 3 nüfus / 1 ekonomi | 2 nüfus / 1 ekonomi |
| Topçu | 2 nüfus / 3 ekonomi | 1 nüfus / 2 ekonomi |
| Zırhlı | 1 nüfus / 6 ekonomi | 1 nüfus / 3 ekonomi |

Kaynak yetmezse kaç birime yetiyorsa o kadarı dolar.

**4. Sömürü kontrolü.** "Kasten kaybedip ucuza doldurmak" karlı değildir: birimi hiç kaybetmemek bedava, kaybedip doldurmak 1 nüfus + 3 ekonomi (zırhlı için). Kayıp gerçekten cezalandırılır, sadece sıfırdan basmaktan ucuzdur.

**5. Asıl tradeoff.** Toplanma tek turda biter ama ordu o tur savaşamaz. İller küçük olduğu için cephedeki il o bir turda düşebilir. **Toparlanmak mı, yıpranmış orduyla direnmek mi** — karar oyuncunun.

**6. Kalıcı kayıp.** İmha olan ordunun doldurulacak kadrosu kalmaz; sıfırdan basmak tam fiyattır. Geri çekilme güdüsü buradan gelir. Yok olan birimlerin nüfusu havuza dönmez.

---

## 4. BİRLİK OLUŞTURMA VE EKONOMİ

### 4.1 İki para birimi

| Kaynak | Nereden gelir | Kim yer |
|---|---|---|
| **Nüfus (manpower)** | İlin nüfus özelliğinden, her tur | Piyade (3), topçu (2), zırhlı (1) |
| **Ekonomi puanı** | İlin ekonomi/üretim özelliğinden, her tur | Zırhlı (6), topçu (3), piyade (1) |

Bu ayrım ilin kimliğini orduya yansıtır: kalabalık ama fakir il piyade yığar, sanayileşmiş ama az nüfuslu il zırhlı basar.

### 4.2 Üretim akışı — doğrudan birim satın alma

> **Not (2026-07-23 kararı, Görev 03'te işlendi):** Eski **oran (tarif) seçici kaldırıldı.** Oyuncu artık karışım yüzdesi seçmiyor, birimi tek tek satın alıyor. Eski hali `veri/URETIM-NOTU.md`'de kayıtlı.

Oyuncu turun başında bütçesini görür ve **birim birim satın alır:**

```
Bütçe:  18 nüfus   /   14 ekonomi

Piyade   [3 nüfus / 1 ekonomi]   [−]  4  [+]
Topçu    [2 nüfus / 3 ekonomi]   [−]  1  [+]
Zırhlı   [1 nüfus / 6 ekonomi]   [−]  1  [+]
                                 ─────────────
Kalan:   4 nüfus / 4 ekonomi     [ ÜRET ]
```

- Her satır bir birim tipidir; `[+]` bastıkça bütçeden düşer, "Kalan" anlık güncellenir.
- Bütçe yetmeyince o satırın `[+]` tuşu **pasifleşir** — hata mesajına gerek kalmaz.
- Oyuncu ne dizdiyse motor **tam olarak onu** üretir; arada oran→birim çevirisi yoktur.

Ucuz karışım → çok birim. Pahalı karışım → az ama sert birim. Tercih doğrudan oyuncunun.

**Sipariş tekrarı (Görev 04):** son verilen sipariş hatırlanır ve tek düğmeyle aynı yere tekrar basılır. 40 ili olan oyuncunun her tur tek tek birim dizmesi yorucu olurdu. Bütçe yetmezse **yetmediği kadarı basılır ve ne basılamadığı söylenir**; kısmi basımda karışımın oranı korunur (türlerden sırayla birer tane eklenir). Tek sipariş hatırlanır — geçmiş listesi ve şablon yok.

*(§4.3 kaldırıldı — numaralandırma, diğer belgelerdeki atıflar bozulmasın diye korundu. Yeni konular §4.6'dan devam eder.)*

### 4.4 Ordu bölüşümü — GARNİZON/SEFER AYRIMI KALDIRILDI

> Karar: Baki, 2026-07-27 (Görev 04 / Soru 3).

Eskiden "birimlerin bir kısmı ilde garnizon bırakılır, bir kısmı sefere çıkar" deniyordu. **Bu ayrım kaldırıldı.**

Kural, parça haritada görünmezken yazılmıştı. Parça artık fiziksel bir bölge: bir parçada duran birim onu savunur, çıkan birim sefere gitmiş olur — **ayrım kendiliğinden oluşur.** Altyapı statı da tam bu gerekçeyle kaldırılmıştı: coğrafyanın zaten yaptığı işi ikinci bir mekanikle tekrarlamamak.

Korunmasının tek faydası oyuncunun kendini yanlışlıkla savunmasız bırakmasını engellemekti; bu, hareket ekranında bir uyarıyla çözülecek.

> **Borç kapandı (Görev 05).** Kuvvet seçicide, parçadaki bütün ordu gönderiliyorsa ve parça bir düşman parçasına sınırdaşsa uyarı çıkar: *"X savunmasız kalıyor ve düşman sınırında."* **Engellemez, uyarır** — oyuncu yine de gönderebilir. Kural tek yerde (`hareket.js uyariGerekli`); hem ekran hem motor onu çağırır.

### 4.5 Doğal denge — hangi il hangi orduyu doğurur

> **Bu tablo oyuncuya dayatılan bir kural değildir.** Beklenen sonuçtur — iyi oynayan oyuncunun kendiliğinden varacağı karışım — ve yapay zekânın üretim referansıdır. Oyuncu istediği karışımı dizmekte serbesttir (§4.2).
>
> **Bütçe sütunu bir turun geliri değil, birikmiş bütçedir.** Üretim çarpanı 1 ile bu bütçelere birkaç turda ulaşılır.

Bütçeyi tam kullanan tüm karışımlar turnuvaya sokularak test edildi:

| İl tipi | Bütçe | En iyi ordu |
|---|---|---|
| Kalabalık il | 24 nüfus / 8 ekonomi | **8 piyade** (saf) |
| Sanayi ili | 8 nüfus / 24 ekonomi | **2 topçu + 3 zırhlı** |
| Dengeli il | 12 nüfus / 12 ekonomi | **3 piyade + 1 topçu + 1 zırhlı** |
| Zengin il | 24 nüfus / 24 ekonomi | **6 piyade + 2 topçu + 2 zırhlı** |

Her il tipi farklı bir ordu doğuruyor, hiçbir karışım her yerde kazanmıyor. Saf karışımlar genelde karma olanlara yeniliyor — tek istisna kalabalık il, çünkü orada ekonomi zaten zırhlıya yetmiyor. Ekonomisi çok güçlü bir oyuncu neredeyse saf zırhlı basabiliyor.

### 4.6 Ordu nerede üretilir — SEÇ VE ÜRET

> Karar: Baki, 2026-07-27 (Görev 04 / Soru 1). Gerekçesi `veri/URETIM-NOTU.md`'de.

Kaynak havuzu **imparatorluk düzeyinde tektir** (§13.3), ama üretilen birim bir yere konmalıdır. Oyuncu **kendi parçasına dokunur**, panelden üretim ekranını açar ve birim **o parçada doğar**.

Alternatifler (başkentte doğsun / motor otomatik dağıtsın) elendi: hareket sonraki görevde geleceği için, ordunun doğduğu yer şu an tek konumlandırma aracıdır. Merkezde doğsaydı tüm ordu tek noktada yığılır, harita üzerindeki gösterim test edilemezdi.

**Sanayi sınırı:** bir ilde tur başına en fazla o ilin **sanayi statı** kadar birim üretilebilir (§5 madde 4). Sayaç aktör başına tutulur — aynı ilin parçalarını tutan iki taraf birbirinin hakkını yemez — ve her tur sıfırlanır. Sınıra dayanınca `[+]` tuşu pasifleşir ve **sebebi yazılır**; bütçe yetmezliğinden farklı olarak sanayi sınırı görünmeyen bir kuraldır, sessiz kalmak oyuncuyu şaşırtır.

**Bir parçada kaç birim durabilir:** sert bir sınır yoktur (Görev 04 / Soru 4). Yalnızca rozet 99'da durur ve "99+" yazar (§7).

---

## 5. İL ÖZELLİKLERİ (7 STAT)

Her özellik **farklı bir mekanik kolu** çeker; hiçbiri sadece "güç" demez.

> **Not (2026-07-23 kararı, Görev 03'te işlendi):** **Altyapı / ulaşım statı kaldırıldı.** Gerekçe: parça haritada fiziksel bir bölge olunca (§7) altyapının taklit ettiği şeyi coğrafyanın kendisi yapıyor — beş parçalı bir ili baştan sona geçmek zaten beş tur sürüyor. Böylece 8 stat → **7 stat**. Veri tarafında `veri/iller.json`'dan `altyapi` alanı silindi.

**Kaynak üretenler:**
1. **Nüfus** → nüfus havuzu (asker üst sınırı)
2. **Ekonomi / ekonomik önem** → ekonomi puanı (satın alma gücü)

**Kaliteyi belirleyenler:**
3. **Eğitim seviyesi** → **araştırma verimi** (§6). Aktörün eğitim gücü, elindeki
   parçaların eğitim değerlerinin toplamıdır; ilin statı parçalarına nüfus payına göre ve
   tam sayı olarak bölünür (§7'nin üç kuralı, `parcaDegerleri`'nin üçüncü kullanımı).
   Verim `0.60 + 0.12 × √(eğitim gücü)` — yani **eğitimli il fethetmek somut bir ödül**.
   *(Görev 06'ya kadar bu stat oyunda hiçbir yere girmiyordu.)*
   **Not:** "her parça en az 1 üretir" kuralı eğitimde **kapalıdır** — o kural akan bir
   kaynak hakkındadır, eğitim ise elde tutulan bir niteliktir. Açık bırakılsaydı parça
   sayısı statından çok olan 9 ilde toplam şişerdi (318 → 331) ve en çok da eğitimi
   **zayıf** iller kazanırdı (Şanlıurfa 1 → 4); statın ayırt etme işi tersine dönerdi.
4. **Sanayi / üretim** → **tur başına üretim üst sınırı**: o ilde bir turda en fazla `sanayi` kadar birim basılabilir (İstanbul 10, Bayburt 1). *(Karar: Baki, 2026-07-27 / Görev 04 Soru 2. Eskiden "ordu üretim hızı" yazıyordu; oran seçici kaldırılıp doğrudan satın almaya geçilince "hız" diye bir şey kalmamış, stat boşta kalmıştı. Bu tanım ekonomik gücü coğrafyaya bağlar: zengin ama sanayisiz oyuncu parasını tek turda orduya çevirip baskın yapamaz.)*

**Savaşı şekillendirenler:**
5. **Coğrafya / arazi** → ova / tepelik / dağlık, savunma çarpanı (§3.5)
6. **Moral / istikrar** → ordu moraline +1 (bozgun direnci, §3.8), isyana direnç
7. **Yüzölçümü** → ilin parça sayısı (§7)

Örnek: Samsun (orta nüfus, iyi ekonomi, düz arazi) ile Rize (düşük nüfus, yüksek arazi savunması) sayıca eşit güçte olsa bile **farklı oynanır**.

---

## 6. ORDU KALİTESİ (ARAŞTIRMA)

> **Görev 07'de yeniden kuruldu (Baki'nin isteği, 2026-07-31).** Araştırma artık İMPARATORLUK
> ÇAPINDA üç dal değil, **birim başına ağaç**: piyade / topçu / zırhlı, her birinde 3 ana dal
> + 1 kendine özgü dal, her dal 3 seviye. Artış **oransal** (%8/seviye), mutlak değil.
>
> | Ağaç | Ana dallar | Kendine özgü |
> |---|---|---|
> | Piyade | zırh · ağır vuruş · hafif vuruş | **Seferberlik** — yaralı piyadeyi ayağa kaldırmak ucuzlar |
> | Topçu | zırh · ağır vuruş · hafif vuruş | **Baraj ateşi** — savaşın ilk raundunda fazladan vurur |
> | Zırhlı | **paletli üstünlük** · ağır vuruş · hafif vuruş | **Yarma** — bozguna uğrattığı düşman kaçarken fazladan kaybeder |
>
> **Zırhlının savunma dalları YOK.** Ölçüm (`veri/arastirma-olcum.md`) zırhlının zırh ve
> dayanıklılık dallarını her artış oranında **Sv.0** verdi: zırhlı zaten tavanda ve bir tık
> artırmak §3.7'nin "3 piyade 1 zırhlıyı yener" satırını anında kırıyor. Üçüncü ana dalı bu
> yüzden savunma değil **paletli üstünlük** — arazinin zırhlıya verdiği cezayı yumuşatıyor,
> ki zırhlının gerçek zayıflığı zaten arazi (§3.5).
>
> **Tavan Sv.2 → Sv.3.** Yükselten şey büyütülmüş bir sayı değil, dalın birime özgü olması:
> eski tek "Zırh" dalı zırhlının zırhını da kaydırdığı için tavanı tek başına aşağı çekiyordu.
> Ölçülen sınır Sv.4; tavan bir kademe altında tutuluyor ki §3.7 tam sınırda oynamasın.
>
> Ağacın tamamı 12 dal × 360 puan. Kimse 15 turda bitiremez — hangi birimine yatırım
> yapacağını **seçmek** zorunda kalır.

> **⚠ TAVANI BAĞLAYAN ÖLÇÜT DEĞİŞTİ** *(2026-08-11, Baki)*. *"Araştırmaları yapılan
> birlikler savaşları **kesinlikle** değiştirebilsin; sınırdan kaybedilen savaşlar bir taraf
> araştırma yapınca sınırdan kazanmaya veya ezmeye başlasın."*
>
> Yukarıdaki "§3.7 tam sınırda oynamasın" gerekçesi bu istekle emekliye ayrıldı: tablonun
> kayması artık kusur değil, **istenen sonuç**. Üstelik eski ölçütün çözümü de yoktu —
> ölçüm (`veri/arastirma-olcum.md` §5) sekiz stat dalının hangi alt kümesi açılırsa açılsın
> tam teçhizatta en az bir satırın kaydığını gösterdi; zırhlıya savunma dalı eklemek de
> kurtarmıyor, yalnızca kayan satırı değiştiriyor.
>
> **Yeni ölçüt üç parçalı** ve üçü de ölçülüyor:
>
> | Ölçüt | Beklenen | Ölçülen |
> |---|---|---|
> | Araştırmasız taban — §3.7 duruyor mu | 15/15 | **15/15** ✓ |
> | Kıl payı kaybedilen savaş dönüyor mu (tek dal Sv.3) | yüksek | **%95** (tam teçhizat %100) |
> | Ezilerek kaybedilen savaş dönüyor mu | düşük | **%15** |
>
> Üçüncü satır ikincisi kadar önemli: araştırma umutsuz savaşı kazandırsaydı ordu büyüklüğü
> anlamını yitirir, oyun "kim çok araştırdı"ya inerdi. Asıl üst sınırı artık o çiziyor.
> Tam teçhizatta eşit para matrisi hâlâ dönüyor, bedel başına değer sapması %9 → %11.

İmparatorluk düzeyinde, birim başına defter tutmadan.

> **Görev 06'da uygulandı** *(Soru 3 → cevap A, Soru 4 → cevap A; Baki, 2026-07-30)*.
> Kod: `src/oyun/arastirma.js` · sayılar: `DENGE.ARASTIRMA` · ölçüm: `veri/arastirma-olcum.md`.

**Üç dal:** Zırh · Ağır vuruş · Hafif vuruş. Seviye N, o statı **tüm birim türlerinde** N
kadar yükseltir (Zırh Sv.2 → piyade bile 2→4, hafif vuruşa karşı sertleşir). Araştırma tüm
stat vektörünü kaydırır ve doğrudan sayaç matematiğine girer.

**Puan nasıl kazanılır.** Oyuncu her tur ekonomisinden bir pay ayırır; ayrılan ekonomi
**ordu bütçesinden düşer** — tek havuz, üç musluk (yeni birim · toplanma · araştırma).
Guns vs butter gerilimi buradan gelir.

```
kazanılan puan = ayrılan ekonomi × verim
verim          = 0.60 + 0.12 × √(eğitim gücü)
```

Eğitim gücü, aktörün elindeki parçaların **eğitim değerlerinin toplamıdır** (§5/3).
**Karekök bilerek:** büyüyen imparatorluk zaten daha çok ekonomi ayırabiliyor; çarpan da
doğrusal büyüseydi araştırma imparatorluk büyüklüğünün karesiyle artar, kartopunu ikinci
kez beslerdi.

**Maliyet.** Sv.N'e çıkmak `6 × N` puan; seviye başına doğrusal arttığı için toplam bedel
karesel olur. Puan **kesirli** birikir (§6.4 kuralı), ekranda aşağı yuvarlanır.

**Tavan: Sv.2 — ölçümle konuldu, seçilmedi.** `node scripts/muharebe-referans.js` üç dalı
her seviyede §3.7'nin 15 satırına karşı koşturuyor; ölçüm İKİ MODELLE birden yapılıyor
(sürekli referans modeli + oyunun kendi motoru) ve **sıkı olan bağlıyor**:

| Dal | Sürekli model | Oyunun motoru | Bağlayıcı |
|---|---|---|---|
| Zırh | Sv.5 | **Sv.2** | Sv.2 ← tavanı bu belirledi |
| Ağır vuruş | Sv.3 | Sv.12 | Sv.3 |
| Hafif vuruş | Sv.6 | Sv.6 | Sv.6 |

Zırhın Sv.3'te kırılması §3.3'ün kendi sonucu: hafif vuruş etkinliği
`clamp(1 − zOrt/12, 0.10, 1.00)` ve zırhlının zırhı Sv.3'te 11 olup **tabana oturuyor** —
o noktada 3 piyade 1 zırhlıyı yenemez hâle geliyor, yani oyunun ana denge düğmesi devre
dışı kalıyor. Sv.2 son güvenli seviye.

**Araştırma aktöre aittir, toprağa değil:** fetihle devralınmaz. Tarafsız garnizonların
araştırması 0'dır, dolayısıyla belirlenimci kalırlar.

**Perk sistemi v1'e DAHİL DEĞİL.** Kompozisyon + araştırma zaten yeterli derinlik veriyor. Perk'ler çıkış sonrası lezzet katmanı olarak saklanır.

---

## 7. HARİTA VE İL KONTROLÜ

> **Not (2026-07-25, Görev 02):** Bu bölüm güncellendi. Eski hali ("iller görünür, parça görünmez kontrol çubuğu") `veri/URETIM-NOTU.md`'de kayıtlı. Değişimin sebebi: parça belgesi her parçaya kendi arazisini ve payını veriyor, arazi muharebe çarpanına giriyor (§3.5) — bu yüzden parça haritada gerçek bir bölge olmak zorunda.

- **Temel birim parçadır.** Haritada **parçalar görünür ve dokunulabilir**. Ordu parçadan parçaya hareket eder, muharebe parçada geçer, arazi çarpanı (§3.5) parçanın arazisinden gelir.
- **İl, gruplama ve stat taşıma katmanıdır.** 7 stat ilde durur (§5). Her parçanın kendi statı yoktur; parçanın ürettiği, **ilin statının parçalara pay oranında bölünmesiyle** bulunur. Bir ilden elde edilen üretim = elde tutulan parçaların değerleri toplamı.

> **Parça değerleri TAM SAYIDIR (2026-07-26 kararı).** Oyuncu ondalıkla uğraşmasın diye "+1.8 nüfus" değil **"+2 nüfus"** yazar. İlin statı parçalarına şu üç kuralla bölünür:
> 1. **Oransal dağıtım** — paylara göre tam sayılara bölünür, toplam ilin statına eşit kalır.
> 2. **Her parça en az 1** — sıfır üreten parça olmaz; gereken 1 birim, o an en çok üreten parçadan alınır (toplam yine değişmez).
> 3. **Tekdüzelik** — payı büyük parça, payı küçükten asla az üretmez.
>
> Örnek — Bursa (nüfus statı 7): Bursa Ovası **3**, Doğu **2**, Batı Ova **1**, Uludağ Güneyi **1** → toplam 7.
> **Şu an istisna yok:** yeniden bölümlemeden (2026-07-26) sonra hiçbir ilin parça sayısı statından fazla değil, il üretimi il statına birebir eşit. Nüfus 353 → 353, ekonomi 326 → 326. (Kural yine de duruyor: parça sayısı statı geçerse "en az 1" kuralı o ilin toplamını 1 artırır.)
- Her ilin **1–4 arası parça** sayısı vardır (Yalova 1, Ankara 4). Toplam **181 parça**.
- **Parçalar araziye göre değil, HARİTADA NASIL GÖRÜNDÜKLERİNE göre çizilir** (2026-07-26 kararı):
  1. **Okunabilirlik birincil ölçüt** — parça, üstündeki ordu rozetini taşıyacak kadar tıknaz olmalı. Ölçü: iç çember çapı ≥ **14.25 harita birimi** (telefon yatayken 2× yakınlaştırmada 26 px rozet sığar). Alan ölçü değildir; ince uzun kıyı şeridi büyük alana sahip olup rozeti taşıyamaz.
  2. **Nüfus/ekonomi dengesi ikincil** — "ölü parça" olmasın; hedef her parça ilin payının ≥ %10'unu taşısın (kesin alt sınır %6).
  3. **Arazi bölmeyi belirlemez** — parçanın içindeki baskın arazi, parçanın arazisi olur. İstisna: arazisi üçe yakın eşit dağılmış illerde arazi birincil ölçüt olur.
  4. **Bütünlük** — parça kara olarak bütündür; adalar bağlı oldukları parçanın içindedir.
- Eşiğin altında kalan 5 parça bilinçli istisnadır (tek parçalı iller, Gelibolu, Hatay ve Kocaeli'nin 2 parça kalması); listesi `testler/haritaOlcusu.test.js`'te tutulur ve test edilir.
- Bölümlemenin tamamı: `docs/il-savasi-parca-bolumleme-v3.md` (veriden üretilir).
- **Bir il, tüm parçaları alınınca el değiştirir.** Eski "görünmez kontrol çubuğu" kavramı kalktı; çubuğun yerini gerçek parça fetihleri aldı. Ankara'yı tamamen almak = 4 parçasının 4'ünü de almak.

**Komşuluk:** Temel kural **parça komşuluğudur** — ordu yalnızca sınırdaş parçaya hareket edebilir/saldırabilir. Parça komşuluk grafiği (`veri/parca-komsuluk.json`) il grafiğiyle doğrulanmıştır. İl komşuluk grafiği (`veri/komsuluk.json`) gruplama ve uzak-zoom gösterimi için ayrıca tutulur. **İl komşuluğu bir hareket kuralı değildir:** Bursa ile Bilecik komşu iller ama Bursa Ovası ile Bilecik parçaları sınırdaş değil, oradan geçilemez.

**Hareket ve fetih** *(Görev 05)*:

- **Tur başına bir komşu parça.** §5'te altyapı statının kaldırılma gerekçesi bunu zaten tanımlıyordu: *"beş parçalı bir ili baştan sona geçmek zaten beş tur sürüyor."*
- **Seç ve gönder** *(Soru 3 → cevap A; §4.4'ün dayandığı cümle bunu zorunlu kılıyor)*: parçadaki ordunun kaçının gideceği seçilir, kalanlar orayı savunur.
- **Bir birim turda İKİ hamle** *(Görev 11'de değişti, 2026-08-03 · aşağıdaki eski kural tarih kaydı olarak duruyor)*: ikinci hamle bir emrin **varışından** verilir; emir kuyruğa `derinlik: 2` ile yazılır ve derinlik-2'den zincir sürmez — hak iki, üç değil. Besleyen emir iptal edilirse zincir de düşer.
  - *(Görev 05–10 kuralı)* **Bir birim turda tek hamle.** Emir kuyruğunda bu, "bir birim en fazla tek emre yazılabilir" kuralıydı (rezervasyon). Emirler tur sonunda çözüldüğü için fethedilen parçadan aynı tur yeni emir verilemiyordu — art arda fetih zinciri kendiliğinden imkânsızdı. **Görev 11 bu kısıtı bilerek kaldırdı**; eski davranışı kilitleyen test de tersine çevrildi (`testler/hareket.test.js`).
- **Boş veya dost parçaya giriş muharebesiz olur**, hak yine harcanır. Düşman ordusu varsa muharebe olur.
- **Fetih ganimeti** *(§13.2/§14'teki "%60"ın karşılığı, Görev 05'te tanımlandı)*: fethedilen parçanın **nüfus payının %60'ı kadar tek seferlik nüfus** kazanılır — seferberlik. Ekonomi ganimeti yoktur (yağmalanan sanayi çalışmaz); parçanın kalıcı geliri zaten sahibine yazılır. Parça her el değiştirdiğinde bir kez verilir, yani kaybedilip geri alınırsa iki kez kazanılır — sürekli el değiştiren cephe her seferinde yeni bir seferberliktir.
- **Fethedilen parça o tur gelir vermez.** Tur döngüsünde gelir önce hesaplanır, emirler sonra çözülür (§8); parça o an kimdeyse gelir onun sayılır. Ek kural gerekmedi.

**Kuruluş garnizonu** *(Görev 05 / Soru 2 → Baki'nin cevabı A, 2026-07-27)*: oyun kurulurken **her parçaya** ilinin statlarından türetilmiş sabit bir savunma ordusu konur — `⌈(nüfus statı + sanayi statı) / 4⌉` birim, karışım §4.5'teki il tipine göre. İstanbul 5, Bursa 4, Bayburt 1; 181 parçada toplam 470 birim. Bu ordular üretmez, hareket etmez, **karar vermez** — yapay zekâ değil, veridir; Görev 07'de gerçek YZ gelince onun başlangıç kuvveti olur. Oyuncunun parçaları da garnizonludur, yoksa tek savunmasız taraf o olurdu. Rastgelelik yoktur: formül tamamen veriden türediği için her oyun aynı, adil ve test edilebilir bir açılışla başlar. **Bilinen kusuru bilerek kabul edildi:** garnizon tükenince yerine yenisi gelmez, oyuncu ilerledikçe direnç azalır (kartopu). Düzelten şey Görev 07'dir.

**Ordu rozetleri — üç katmanlı gösterim** *(karar: Baki, 2026-07-27 / Görev 04)*. Ordular haritada kalkan biçimli sayı rozetleriyle görünür ve gösterim yakınlaştırmaya göre üç kademelidir: **uzakta** (0.90×–1.35×) yalnızca harita, rozet yok; **ortada** (1.35×–2.70×) il başına tek rozet — o ildeki toplam birim, birden çok sahip varsa en çok birimi olanın renginde; **yakında** (2.70×–7×) parça başına rozet. Rozet **haritayla büyümez**, ekranda sabit 26 piksel kalır; sayı 99'u geçerse "99+" yazılır ve rozet yine büyümez. **Boş parçada rozet yoktur** — kalabalık sorununu asıl çözen kural budur. Sınırlar tahminle değil ölçümle seçildi (`veri/rozet-katman-olcum.md`): her sınırda şekillerin ≥%96'sına rozet sığar ve hiçbir rozet komşusununkini ezmez. Rozeti kendi şekline sığmayan birkaç yer (Gelibolu, Yalova, Kilis) için rozet elle belirlenmiş bir noktaya, denize/boşluğa doğru kaydırılır ve ince bir çizgiyle şekline bağlanır. Katmanlar arası geçiş zamana değil **yakınlaştırmanın kendisine** bağlıdır: parça rozetleri ilinin rozetinden doğup yerlerine kayar, uzaklaşırken geri döner — parmak durursa geçiş de durur.

---

## 8. TUR DÖNGÜSÜ

> **Görev 07 notu — 8. madde (Sıra) doldu.** Çözüm sırası her tur TOHUMLA KARIŞIYOR ve sıra bir aktöre geldiğinde o aktör O ANKİ duruma bakarak karar veriyor, emri hemen çözülüyor (`src/oyun/sira.js`). Baki'nin kararı (2026-07-31): düz eşzamanlı tur "alınan yerden saldırı" gibi ölü emirler doğuruyordu, klasik sıra ise 80 aktörün turunu izletmek demekti. Seçilen ara yol ikisinin de sorununu çözüyor: tek TURU BİTİR anı korunuyor ama kimse eski bir fotoğrafa bakarak karar vermiyor. Sıra kayıtta tutulmaz, tohum ve tur numarasından türer.

1. **Üretim** — illerden nüfus + ekonomi puanı topla
2. **Araştırma** — ekonomiden pay ayır, biriken puanla dal yükselt (§6). Pay tur sonunda düşer ve puana dönüşür; yükseltme tur İÇİNDE anında uygulanır, tur bitene kadar geri alınabilir
3. **Takviye** — kendi parçana dokunup üretim ekranından birim satın al (§4.2, §4.6). Birim seçtiğin parçada doğar; garnizon/sefer bölüşümü yoktur (§4.4)
4. **Toplanma** — yıpranmış ordulara toplanma emri ver (o tur savaşamazlar, §3.9). **Numarası 4 ama ÇÖZÜMDEN SONRA işler:** ordu o tur yıpranmış hâliyle savunur, tur sonunda dolar (§3.9/2, Soru 2 → cevap B)
5. **Hareket & saldırı** — birimleri komşu **parçalara** sür. Emirler tur içinde dizilir (§8a)
6. **Çözüm** — muharebeler yıpranmayla çözülür, bozgunlar ve çekilmeler işlenir, parçalar/iller el değiştirir
7. **Diplomasi** — ittifak/ateşkes teklifleri
8. Sıra sonraki oyuncuya veya yapay zekâya

### 8a. Hamle anında çözülür

> Karar: Baki, **2026-09-19** (Görev 15). Bu madde **2026-07-27'deki emir kuyruğu kararını
> (Görev 05 / Soru 1 → B) tersine çeviriyor.** Eski hâli aşağıda, tarih kaydı olarak duruyor.

**Hamle verildiği an çözülür.** Saldırıyı verirsin, muharebe olur, kazanırsan parça hemen
senin olur ve ordun oraya geçer. Baki'nin cümlesi: *"Bursa'dan Çanakkale'nin bir parçasına
saldırdıysam ve o parçayı alabilecek güçteysem orası benim olmuş sayılır ve askerlerim oraya
transfer olurlar."* Ayrıntı: `docs/GOREV-15-aninda-cozum.md`.

Üç sonucu var:

- **Emir kuyruğu, emir okları, emir iptali ve rezervasyon kalktı.** Yerine **hamle hakkı
  defteri** geldi (`src/oyun/hamle.js`): her birimin bu tur kaç hamle harcadığı ordunun
  kaydında durur. Hak **türe göre**: piyade 1 · topçu 1 · **zırhlı 2**. Zırhlı fethettiği
  parçadan devam edebilir; ikinci hamle ikinci bir saldırı da olabilir.
- **Onay kutusu SALDIRIYA taşındı.** "Onay yalnızca geri alınamaz işte sorulur" kuralı
  değişmedi, geri alınamaz olan iş değişti: artık saldırının kendisi. Kendi toprağına
  taşıma onay istemez.
- **Sıra: önce insanlar, sonra botlar.** Oyuncu turu bitirmeden önce oynadığı için tek
  oyunculuda ilk vuruş her zaman onda; çok oyunculuda insanlar kendi aralarında tohumla
  karışır. Görev 07'nin "kimse kalıcı ilk vuruş avantajı almaz" kuralı bu kadarıyla
  tersine döndü ve bedeli ölçüldü (`GOREV-15` §10).
- **Fethedilen parça o tur gelir vermez.** Eskiden bu kural aşamaların sırasından bedava
  geliyordu; artık açıkça yazılı.

**Tur raporu ve tur günlüğü:** hamleler tur ortasında çözüldüğü için her biri bir günlüğe
yazılır; tur raporu turu bitirirken o günlüğü okur. Oyuncu "bu tur ne yaptım"ı **TUR
GÜNLÜĞÜ** ekranından görür (eski emir listesinin yerini aldı).

> **ESKİ KARAR (2026-07-27 – 2026-09-19, tarih kaydı):** hamleler anında çözülmüyordu;
> oyuncu tur boyunca emirlerini diziyor, TURU BİTİR'e basınca hepsi veriliş sırasıyla
> çözülüyordu. Kuyruğun üç işi vardı: haritada emir okları, emir iptali ve aynı orduyu iki
> yere göndermeyi engelleyen rezervasyon. Onay kutusu da bu yüzden TURU BİTİR'deydi.
> **Emirler sırayla çözülür, birleşik saldırı yoktur** kuralı ise DEĞİŞMEDİ: aynı hedefe
> giden iki hamle omuz omuza değil, arka arkaya vurur.

### 8.1 Oyun modları ve maç uzunluğu

> **Not (2026-07-23 kararı, Görev 03'te işlendi):** Sabit "hedef maç süresi 20–30 dakika" hedefi **kaldırıldı.** Maçın uzunluğunu artık seçilen mod belirler.

| Mod | Kapsam | Kazanma koşulu |
|---|---|---|
| **Bölge savaşı** | Tek coğrafi bölge (ör. Karadeniz, 18 il) | Bölgenin tamamı |
| **Türkiye** | 81 il | Son ayakta kalan / il eşiği |
| **Serbest** | Oyuncu seçer | Tur limiti veya eşik |
> **UYGULAMA NOTU (Görev 09, 2026-08-01) — MOD KAPSAMA GÖRE DEĞİL KOŞULA GÖRE.**
> Yukarıdaki tablo modları KAPSAMA göre tanımlıyordu. Baki koşula göre tanımladı ve ikisi
> DİK EKSEN çıktı; bölge modu kaybolmadı, üç koşulun üçüyle de oynanabiliyor:
>
> `KAPSAM (Türkiye / 7 coğrafi bölge)  ×  KAZANMA KOŞULU (üç mod)`
>
> | Mod | Kazanma koşulu | Türkiye | Bölge (ör. Karadeniz) |
> |---|---|---|---|
> | **Fetih** | Kapsamın tamamı | 150 tur · ~1 sa 53 dk | 32 tur · ~24 dk |
> | **Yarım Fetih** | Kapsamın %50'si | 70 tur · ~53 dk | 22 tur · ~17 dk |
> | **Güç Yarışı** | Sürede en çok bölgeyi tutan | 35 tur · ~26 dk | 16 tur · ~12 dk |
>
> "Serbest" modu düştü: karşılığı artık kapsam + koşul seçiminin kendisi.

> ⚠ **YUKARIDAKİ TABLONUN İKİ SÜTUNU GÖREV 13'TE (2026-08-08) DEĞİŞTİ.** Tarih kaydı
> olarak duruyor; **bugünkü hâli** (`DENGE.MOD`, `veri/mod-esik-olcum.md`):
>
> | Mod | Bugünkü adı | Türkiye | Karadeniz |
> |---|---|---|---|
> | Fetih | Fetih | **sınırsız** | **sınırsız** |
> | Yarım Fetih | **%50 Hâkimiyet** | **sınırsız** | **sınırsız** |
> | Güç Yarışı | Güç Yarışı | 35 tur | 16 tur |
>
> İki şey değişti. **Ad:** "Yarım Fetih" yarım kalmışlık çağrıştırdığı için **%50
> Hâkimiyet** oldu. **Sınır:** fetih ve hâkimiyet modlarından tur sınırı KALDIRILDI
> (`SINIRSIZ: true`) — bir fetih maçının "süre doldu" diye bitmesi modun kendisiyle
> çelişiyordu. Sayılar silinmedi, geri açmak tek satır. Sınırsız modda "süre doldu" dalı
> (`mod.js sonucKontrol`) hiç çalışmaz; `TABAN`/`PARCA_BASINA` yalnızca ölçüm ufku olarak
> okunur. Sınırsız maçın hiç bitmeme riskinin karşılığı `DENGE.ZEKA.BITIRME`: maç uzadıkça
> yapay zekânın iştahı artıyor. **Güç Yarışı dokunulmadı** — orada tur sınırı üst sınır
> değil maçın kendisi.
>
> **Tur sınırı bir HEDEF DEĞİL, ÜST SINIR** (artık yalnızca Güç Yarışı'nda var). Süre
> dolduğunda maç berabere bitmiyor; `DENGE.MOD.SURE_DOLUNCA: 'toprak'` ile en çok bölgeyi
> tutan kazanıyor.
>
> **"Dünya %69'da kilitleniyor" tespiti artık geçerli değil** — sebebi bulundu ve
> düzeltildi (2026-08-12, `veri/zeka-butce-olcum.md`): kilit bir silahlanma yarışıydı,
> yapay zekâ 258'lik yığınlar biriktirip saldırmıyordu. Üretim frenine (`DENGE.ZEKA.DOYMA`)
> bağlanınca yığınlar 24'e indi ve ölçülen fetih sayısı **241 → 513** çıktı. Sınırsız mod
> kararı bu düzeltmeyle birlikte anlam kazandı.
>
> **Süreleri tura çeviren sayı `DENGE.MOD.SANIYE_PER_TUR` (45 sn) ve HÂLÂ ÖLÇÜLMEDİ** —
> gösteri kısmı ölçülü (6.6 sn), oyuncunun karar süresi tahmin. Cihaz denemesinde
> düzeltilecek tek sayı burası; tur sınırına dokunulmayacak. **Bugün projedeki tek açık
> ölçüm borcu bu.**


**İki sonucu var:**

- **Kayıt/yükleme çekirdek özelliktir.** Uzun maç tek oturumda bitmez; kayıt olmadan oyun oynanamaz. (Bu yüzden §12'de satılabilir değildir.)
- **Sıcak koltuk uzun maçta zorlanır.** İki kişinin saatlerce aynı telefonu paslaması gerçekçi değil — **asenkron çevrimiçi** bu yüzden v1.5 planına girdi (§13.1).

---

## 9. YAPAY ZEKÂ MİMARİSİ

### 9.1 Tek beyin, 81 uygulama

81 ayrı yapay zekâ **yok**. Bir ilin durumunu alıp en iyi hamleyi döndüren **tek bir karar fonksiyonu** var; 81 kez çalıştırılıyor.

**Fayda tabanlı (utility) yapay zekâ.** Makine öğrenmesi gerekmez.

```
puan("Ordu'ya saldır") =
      (Ordu'nun değeri × kazanma olasılığı)          # beklenen kazanç
    − (kendi kaybın × kaybetme olasılığı)            # risk
    − (başka cepheyi açıkta bırakma cezası)          # konumsal maliyet
```

En yüksek puanlı hamle seçilir. Yapay zekâ ayrıca yıpranmış ordularını toplanmaya çekme kararını da aynı fayda hesabıyla verir.

**Görev 07'de somutlanmış hâli** (`src/oyun/zeka.js`, katsayılar `DENGE.ZEKA.TERIM`):

```
puan = DEGER   × açgözlülük  × hedefin değeri × üstünlük
     − BEDEL   × temkin      × gönderilen kuvvetin bedeli × (1 − üstünlük)
     − ACIKTA  × temkin      × açıkta kalma cezası
     + HUSUMET × husumet     × (hedef hasım mı)
     + SALDIRI × saldırganlık
```

- **üstünlük** = muharebe motorunun döndürdüğü oran (`muharebeTahmini().ustunluk`). İkinci bir tahmin YAZILMADI — aynı kural iki yerde tutulmaz.
- **hedefin değeri** = parçanın nüfus+ekonomi getirisi + o parça ili TAMAMLIYORSA `IL_BONUSU`.
- **açıkta kalma cezası** = kaynağın düşman komşularındaki kuvvet ÷ (geride kalan + 1), `ACIKTA_TAVAN` ile kırpılı.
- **husumet terimi bugün hep 0**: hasım tablosu depoda yok (§13.2'deki ✅ eski projeye ait, taşınmamış). `HUSUMET_ACIK` false; veri Görev 08'de §11 ile gelecek.

**Dört karar, tek fayda mantığı:**

| Karar | Nasıl veriliyor |
|---|---|
| Saldırı | Yukarıdaki formül; hamle uzayı = tümü / yarısı (§9.3'ün bütçesi) |
| Üretim | Bileşim §4.5'ten, yer: düşmana en yakın kendi parçası, sınır: sanayi statı |
| Araştırma | Pay açgözlülükten; dal, sınırdaş düşmanların baskın birim türünden |
| Toparlanma | Kadronun `TOPARLANMA_ESIGI` kadarı eksikse; cephedekiler önce |

**Yapay zekânın her emri oyuncunun geçtiği AYNI doğrulamadan geçer** — `siparisGecerliMi`, `hareketGecerliMi`, `butce.js`. İkinci bir yol açılmadı; testler bunu kilitliyor.

### 9.2 LOD YOK

**Ayrıntı seviyesi (LOD) bilinçli olarak kullanılmıyor.** Uzaktaki iller de tam beyinle oynar, mantıklı kararlar verir ve güçlenir — oyuncu haritanın öbür ucuna vardığında ciddi rakip bulur.

### 9.3 Performans

**Görev 07'de ölçüldü — KOD YAZILMADAN ÖNCE** (`veri/zeka-butce-olcum.md`): tur başına en kötü hâlde ~8 ms, bir kare 16.7 ms. **Bölünmüş hesaplama (time-slicing) YAZILMADI, gerekmedi.** Gerçek turun tamamı (karar + çözüm + ekonomi + toplanma) geliştirme makinesinde ~45 ms; oyuncu bunu "tur işleniyor" perdesiyle görüyor.

Yük, LOD olmadan da rahatça kaldırılır:

- **Komşuluk kısıtı hamle uzayını küçültür** — 4 komşulu il için ~4-5 aday hamle. 81 il × ~4 ≈ tur başına ~300 basit hesap.
- **Bölünmüş hesaplama (time-slicing)** — hesaplar birkaç kareye yayılır, anlık tıkanma olmaz.
- **Hamle önbelleği** — durumu değişmemiş il kararını yeniden hesaplamaz (ama *aptallaşmaz*, sadece yeni karar yoksa tekrar düşünmez).
- **Doğal konsolidasyon** — oyun ilerledikçe 81 il birkaç imparatorluğa dönüşür; bağımsız karar veren birim sayısı düşer.

### 9.4 Kişilik parametreleri

Tek beyin, farklı ağırlık setleriyle çalışır: **saldırganlık / açgözlülük / husumet / temkin**. Kimi il saldırgan, kimi kabuğuna çekilen, kimi eski hasmının peşinde. Maliyeti sıfır, tekdüzeliği kırar.

**Zorluk = ağırlık ayarı**, hesap değil. Kolay: gürültülü/pasif ağırlıklar. Zor: keskin ağırlıklar.

**Görev 07'de uygulandı** (`DENGE.ZEKA.ZORLUK`, ayarlar menüsünden seçilir):

| Kademe | Saldırganlık | Açgözlülük | Temkin | Karar gürültüsü |
|---|---|---|---|---|
| Kolay | 0.1–0.5 | 0.2–0.6 | 0.5–1.0 | %35 |
| Orta | 0.3–0.8 | 0.3–0.8 | 0.3–0.8 | %15 |
| Zor | 0.5–1.0 | 0.5–1.0 | 0.1–0.5 | yok |

**ÜRETİM BONUSU VERİLMEDİ.** Bu satır eskiden "zor: + küçük üretim bonusu" diyordu; üç kademede de çarpan 1. Gerekçe: gizli bonus oyuncuya "hile yapıyor" hissi verir, ve ölçüm bonussuz da yeterli fark olduğunu gösterdi (`veri/zeka-olcum.md`: 15 turda kalan bağımsız aktör kolayda 79, zorda 32). Verilecek olursa **ekranda yazacak**.

**Karar gürültüsü**, kolay kademeyi "aptal yapay zekâ" yazmadan kurmanın yolu: aktör en iyi hamleyi BULUR ama her zaman onu oynamaz. Zorda gürültü sıfır — hep en iyisini oynar.

**Kişilikler tohumdan, belirlenimci üretiliyor** (`src/oyun/kisilik.js`) ve kayıtta TUTULMUYOR: tohum, aktör listesi ve zorluk kayıtta olduğu için yüklerken birebir aynısı yeniden türetiliyor. Aynı gerekçe tur sırası için de geçerli.

---

## 10. DİPLOMASİ

Çekirdek kurallar (basit, HOI4'e kaçmaz):

1. **Sınırdaş olmadığın devletle savaşamazsın.** (Komşuluk grafiği bunu zaten dayatır.)
2. **Uzaktaki illerle ittifak kurulabilir.**
3. **İttifakına saldıran sana da savaş açmış sayılır** — ama sınırdaş değilsen fiilen savaşamazsın, sadece "savaş halinde" görünürsün.

Bu üçüncü madde diplomasiyi coğrafyayla iç içe geçirir: uzaktaki müttefikin savaşa girdiğinde ancak sınırların o cepheye ulaştığında müdahale edebilirsin.

**Ek kurallar:**
- **Ateşkes / barış** — iki savaşan taraf anlaşıp savaşı bitirebilir (yoksa "savaş halinde ama savaşamıyor" kalıcı takılır).
- **İttifak bozma bedeli** — aniden bozan taraf birkaç tur diplomasi yapamaz.
- **Yapay zekâ diplomasisi** — ittifak/savaş kararları §9.4'teki kişilik parametrelerine bağlanır.

### 10.1 Uygulama notu (Görev 09, 2026-08-01)

**ÜÇ DURUM** (Baki'nin kararı):

```
BARIŞ / TARAFSIZ (varsayılan)  → SALDIRAMAZSIN; saldırmak için savaş ilan etmelisin
İTTİFAK                        → saldıramazsın; bozmanın bedeli var
SAVAŞ HALİNDE                  → saldırabilirsin; ateşkesle biter; zekâ öncelik verir
```

> ⚠ **GÖREV 11'DE TERSİNE DÖNDÜ (2026-08-03).** Aşağıdaki "ilan yok" notu Görev 09'un
> kararıydı ve tarih kaydı olarak duruyor; **bugünkü kural barışın varsayılan olmasıdır.**
> Barıştaki tarafa verilen saldırı emri kapıda kesiliyor (`hareket.js`, `kod: 'baris'`),
> savaş yalnızca `diplomasi.js savasIlanEt` ile açılıyor ve ilan zinciri de yayıyor.
> İlk `DIPLOMASI.ILAN.BARIS_TURU` tur boyunca kimse ilan edemiyor. Oyuncu ilanı diplomasi
> ekranındaki **SAVAŞ İLAN ET** düğmesiyle veriyor (onay kutulu, geri alınamaz iş);
> yapay zekâ `zeka.js savasIlaniSec` ile, tur başına en çok bir kez.

*(Görev 09 notu — artık geçerli değil)* **"İlan yok" demek "savaş hali yok" demek değil:
SALDIRININ KENDİSİ İLANDIR.** Oyuncu dokunup saldırıyor, fazladan ekran açılmıyor, tur
kaybedilmiyor — ama saldırı çözülürken arkada savaş hali doğuyor. Böylece savaşın bir
başlangıcı, bir sonu ve haritada bir görüntüsü oluyor. **Saldırının savaş hali doğurması
bugün de geçerli** (ilan edilmiş savaşta ilk saldırı düelloyu da tetikliyor); değişen şey,
saldırının artık ilanın YERİNE geçmemesi.

**Madde 1 zaten sağlanıyordu** (komşuluk grafiği), **madde 3 bedava geldi** — uzaktaki
düşman "savaş halinde ama savaşamıyor" durumunda kendiliğinden kalıyor. Zincir **TEK ADIM**
yayılıyor: müttefikimin müttefikinin düşmanı benim düşmanım değil. İki adım olsaydı ilk
savaşta harita ikiye bölünürdü.

**İlişki kaydı simetriyi tanım gereği garanti ediyor:** anahtar `küçük|büyük` biçiminde
(`"06|34"`), yani "ben onunla ittifaktayım ama o benimle değil" durumu yazılamaz bile.
Yalnızca varsayılan OLMAYAN ilişkiler kaydediliyor — 81 aktörün tam matrisi 3240 çift eder.

**Savaş satırında `son` (son temas turu) alanı var** ve gerekli: `SAVAS_UST_SINIRI`
"unutulmuş savaşlar birikmesin" diye konuldu; başlangıç turuna baksaydı 20 turdur fiilen
süren bir savaş da otomatik tarafsıza dönerdi.

**Diplomasi yalnızca "tanıdıklarınla":** sınırdaşın · aranızda ilişki olan · belli bir
büyüklüğü aşmış devletler. Liste `TANIDIK.EN_COK` ile kapaklı ve kesilen grup her zaman
en az ilgili olan (uzaktaki büyükler); sınırdaşlar hiç elenmiyor.

**İTTİFAK MORAL BONUSU BİLEREK YOK.** §11/5'in uyarısı: düello bonusu moral kalemlerini
üçe çıkardı, dördüncü kalem bozgun eşiğini ölçülmemiş bir yere taşırdı. İttifak **kısıt ve
zincirle** değer taşıyor, statla değil.

**Doygunluk bu sistemin tek gerçek riskiydi ve ölçümle kapatıldı** (`veri/diplomasi-olcum.md`).
İlk sürümde zor kademede 27 canlı aktörün 26'sı tek bloktaydı. Üç kök sebep vardı: ölçütün
kendisi yanlıştı, fayda formülü dünyanın büyüklüğüne bağlıydı (`ORTAK_DUSMAN` ham sayıydı,
orana çevrildi) ve **ittifakın bedeli formülde hiç yoktu** — her komşu ittifakı
genişleyebileceğin bir cepheyi kapatır (`FAYDA.KOMSU`).


---

## 11. REKABET OLAYLARI ("KUTSAL DÜELLO")

Büyük folklorik rekabete sahip iki il birbirine savaş açtığında özel olay tetiklenir:

- **Ordu ↔ Giresun → Kutsal Fındık Savaşı**
- **Siirt ↔ Antep → Fıstık Savaşı**
- Trabzon ↔ Rize, İstanbul ↔ Ankara vb.

**Kurallar:**
- Düello sürerken **üçüncü bir devlet iki tarafa da savaş açamaz** — düello kutsaldır, bölünmez.
- Düello sırasında iki tarafa da tematik geçici etki (örn. moral bonusu — onur meselesi).
- **Kazanan çift ödül alır** — normal fetih kazancına ek tematik bonus ("fındık tekelini ele geçirdin").
- Oyuncuya başarım/rozet — paylaşılabilir.

**Uygulama:** Her il çiftine bir rekabet türü ve savaş adı atayan bir **veri tablosu**. Yeni rekabet eklemek tek satır. Mevcut husumet verisi doğrudan kullanılır. Motor tarafında tek kontrol: "bu iki il savaşa girdi mi?" + olay tetikleyici.

> ### Görev 08'de uygulandı (2026-08-01)
>
> Kapsam: **sunum + moral bonusu + ganimet bonusu + üçüncü taraf kısıtı**. Oyuncu başarımı
> Görev 09'a bırakıldı (paylaşım ve rozet sistemi henüz yok).
>
> **Veri tablosu:** `veri/husumetler.js`. Kod hiçbir rekabet uydurmaz; bir test
> (`testler/rekabet.test.js`) hiçbir savaş adının `src/` içine sızmadığını kilitliyor.
>
> **Tablo Baki tarafından dolduruldu (2026-08-01) — yedi satır:**
>
> | İl A | İl B | Konu | Savaş adı | Komşu mu |
> |---|---|---|---|---|
> | Ordu | Giresun | fındık | Büyük Fındık Savaşı | evet |
> | Trabzon | Rize | çay | Büyük Çay Savaşı | evet |
> | Siirt | Gaziantep | fıstık | Büyük Fıstık Savaşı | hayır |
> | Adıyaman | Şanlıurfa | çiğ köfte | Büyük Çiğ Köfte Savaşı | evet |
> | Edirne | Tekirdağ | köfte | Büyük Köfte Savaşı | evet |
> | Afyonkarahisar | Kayseri | pastırma | Büyük Pastırma Savaşı | hayır |
> | İstanbul | Ankara | şehir üstünlüğü | Büyük Şehir Savaşı | hayır |
>
> **Sıfat "Kutsal" değil "BÜYÜK".** İlk deneme "Kutsal Fındık Savaşı"ydı; Baki *"hem güzel
> hem absürt duruyor"* dedi ve haklıydı — sıfat mizahı kelimeye yüklüyordu, oysa mizah
> zaten konudadır: iki il fındık için savaşıyor. "Büyük" ciddi duruyor, "Büyük Savaş"
> çağrışımı oyunun tonuna oturuyor, komik olan şey ne için savaşıldığı oluyor.
>
> **Trabzon–Rize'nin konusu ÇAY.** Belge çifti sayıyordu ama konusunu vermiyordu.
> "Karadeniz'in başkenti" düşünüldü ve elendi: Samsun da Ordu da o iddiayı taşır, yani
> öteki Karadeniz illerini yok saymak olurdu. Çay yalnızca bu ikisinin kavgası —
> Rize birinci, Trabzon ikinci üretici.
>
> **İstanbul–Ankara tek yemeksiz husumet.** Konu bir ürün değil şehrin kendisi: trafik,
> kalabalık, deniz, ekonomi, ulaşım. "Büyük Şehir Savaşı" adı ikisinin de büyükşehir
> olmasından geliyor — sıfat ve unvan aynı anda okunuyor. Payitaht/başkentlik elendi,
> çünkü kavga resmî unvanla değil "hangisi daha iyi şehir" ile ilgili.
>
> **Ölçüldü:** 30 turda orta kademede 4, zor kademede 5 düello tetikleniyor; en çok
> 4 tanesi aynı anda etkin. Yedi satırın üçü komşu olmayan çift — onların düellosu ancak
> taraflardan biri ötekine kadar genişleyince başlıyor, yani oyunun geç saatlerine kalıyor.
>
> **Tetikleyici (belgedeki boşluk dolduruldu):** iki hasım aktör birbirinin parçasına
> **ilk saldırdığında**. Diplomasi olmadığı için "savaş açmak" = saldırmak. Boş bir düşman
> parçasına yürümek de sayılır — `hareket.js` bunu zaten saldırı sayıyor.
>
> **Bitiş (belgedeki boşluk dolduruldu):** taraflardan biri elindeki son parçayı
> kaybedince ya da `DENGE.REKABET.DUELLO_SURESI` turu (10) geçince.
>
> **"Üçüncü devlet karışamaz" tek cümleydi, kodda üç ayrı kural çıktı.** Aralarındaki fark
> oyunu ciddi biçimde değiştiriyor; seçim `DENGE.REKABET.UCUNCU_TARAF`'ta tek kelime:
>
> | Değer | Kural | Notu |
> |---|---|---|
> | `kapali` | Kısıt yok | Düello yalnızca bonus verir |
> | **`cephe`** (varsayılan) | Üçüncü aktör, iki tarafın **birbiriyle sınırdaş** olduğu parçalara saldıramaz | Korunan yer yalnızca kavganın sürdüğü hat — sömürüsü yok |
> | `topraklar` | Üçüncü aktör iki ilin asıl topraklarına hiç saldıramaz | Tematik olarak en güçlüsü ama **sömürülebilir**: hasmına bilerek saldırıp sınırını 10 tur dokunulmaz yapabilirsin |
>
> Kural tek kapıdan işliyor (`hareket.js hareketGecerliMi`), yani oyuncu ile yapay zekâ
> aynı kısıttan geçiyor.
>
> **Moral bonusu** mevcut §3.8 listesine **bir kalem** olarak giriyor — yeni formül yok.
> **Ganimet bonusu** `FETIH.NUFUS_ORANI`'na dokunmadan üstüne biniyor.
>
> **Aynı anda en fazla `EN_COK_ETKIN` (8) düello.** Kapak iki işi birden yapıyor: kayıt
> boyutunu garanti altına alıyor (~0.25 KB) ve ekranın "her yer kutsal savaş" hissine
> boğulmasını engelliyor.

---

## 12. PARA KAZANMA

### 12.1 Sınır cümlesi

> **Para zamandan tasarruf ettirebilir, güçten değil. İnsan rakibin olduğu yerde ikisi de olmaz.**

### 12.2 Üç kural

1. **Tavan ortak.** Parayla alınanın üst sınırı, bedava oynayanın ulaşabileceğiyle **aynı**. Para sadece *hızı* satar.
2. **Sadece başlangıç, kalıcı değil.** Buff'lar ilk birkaç turda etkili olup söner (örn. "ilk 5 tur +%10 üretim").
3. **Yalnızca PvE.** Tek oyunculu / yapay zekâ maçlarında serbest. İnsan-vs-insan maçında kapalı ya da her iki tarafa eşit.

### 12.3 Satılabilecekler

> **Not (2026-07-23 kararı, Görev 03'te işlendi):** **"Kayıt yuvası" satılabilirler listesinden çıkarıldı.** Mod sistemiyle birlikte maçlar uzadı; kayıt/yükleme artık çekirdek özellik (§8.1). Kaydı paraya veya reklama bağlamak oyunu oynanamaz hale getirirdi.

**Hayat kalitesi (tek oyunculuda):**
- Hamle geri alma (undo)
- Gelişmiş istatistik/analiz paneli
- Arayüz konforu: hızlı-ileri, toplu komut, harita kısayolları
- Maç tekrarı izleme

⚠ Bu kolaylıklar **insan rakipli maçlarda kapalı olmalı** — orada geri alma adaleti bozar.

**Başlangıç güçlendirmeleri (kestirme modeli):**
- Bedava oyuncu oyun içi başarımla açar, ödeyen anında alır
- Aynı tavana ulaşırlar, etkisi aynı turda biter
- Örnek: "Fetih Yılı — ilk 5 tur ordu üretimi +%10"

**Tek seferlik:**
- Reklam kaldırma / tam sürüm

**Çıkış sonrası (DLC):**
- Harita temaları (retro askeri, uydu, eski Osmanlı estetiği)
- İl bayrak/amblem/renk setleri
- Yeni harita paketleri (dünya, bölgeler)
- Yeni oyun modları

### 12.4 Ödüllü reklam — kırmızı çizgi

> ⚠ **2026-09-17'de DEĞİŞTİ (Baki, Görev 19).** Yeni çizgi: **üstünlük satılmaz, İKİNCİ
> ŞANS satılır.** Ödül hata yapan oyuncuya hatasını düzeltme imkânı verir (turu geri al,
> yenilgiden dön, casus raporu, acil seferberlik) ve üç korumayla sınırlıdır: yalnızca tek
> oyunculu maçlarda · maç başına en çok `DENGE.ODUL.MAC_BASINA` kullanım · meydan okuma ve
> derecelide tamamen kapalı. Kurallar `src/para/odul.js`'te, belge
> `docs/GOREV-19-para-altyapisi.md`. Aşağıdaki eski paragraf tarih kaydıdır.

**ESKİ KURAL (2026-07-23 – 2026-09-17):** Reklamın ödülü **asla oyun içi güç olmamalı** (ekstra ordu, savaş bonusu → P2W'nin reklam versiyonu). Güce dokunmayan şeylere bağlanır: kozmetik deneme, analiz panelini o maç için açma, harita teması denemesi. **Kayıt/yükleme buraya da giremez** — çekirdek özellik, hep açık (§8.1).

---

## 13. TEKNOLOJİ VE KAPSAM

### 13.1 Mimari kararlar

- **Çok oyunculu:** v1'de **sıcak koltuk** (tek cihaz, sırayla). **v1.5: asenkron çevrimiçi** (herkes kendi zamanında hamle yapar; Firebase). Bu artık "ilgi gelirse" değil **planlanmış** bir adım — mod sistemiyle maçlar uzadı, iki kişinin saatlerce aynı telefonu paslaması gerçekçi değil (§8.1). **Gerçek zamanlı yok.**
- **Motor: React Native / Expo — seçildi ve kullanılıyor.** Gerekçe: Baki görsel bir editör kullanmadan, doğrudan telefonda deneyerek ilerliyor; Expo Go ile her değişiklik saniyeler içinde cihazda görünüyor ve mevcut JS mantığı olduğu gibi yürüyor. (Eskiden bu satırda "Godot önerilir" yazıyordu; proje Görev 01'den beri Expo'da.)

### 13.2 Mevcut projeden taşınacaklar

- ✅ 81 il komşuluk grafiği (doğrulanmış — en değerli varlık)
- ✅ Fetih ekonomisi (%60 nüfus devri, sınır devri)
- ✅ Arazi savunma bonusu
- ✅ Husumet çiftleri verisi
- ✅ "Güçlü il en zayıf komşuyu hedefler" mantığı → rakip yapay zekânın çekirdeği
- ❌ Eski güç formülü (`nüfus^0.7 × (gelişim/50)^0.85`) — **kullanılmıyor**, il gücünü tek sayıya eziyordu

### 13.3 v1 kapsamı

**Dahil:** Türkiye haritası, **7 il özelliği**, 3 birim tipi + kompozisyon, **doğrudan birim satın alma (§4.2)**, yıpranma muharebesi, bozgun/moral, geri çekilme ve yeniden toplanma, arazi, araştırma, parça/kontrol sistemi, **kayıt/yükleme (§8.1)**, mod sistemi, tek oyunculu + sıcak koltuk, diplomasi, rekabet olayları, temel para kazanma.

**Dahil değil:** Perk sistemi, kıdem/veterancy, **oran (tarif) seçici**, **altyapı statı**, ek haritalar, gerçek zamanlı, il-bazlı ayrı kompozisyon (imparatorluk düzeyi yeterli).

**v1.5:** Asenkron çevrimiçi çok oyunculu (§13.1).

---

## 13.5 SAHNE KATMANI (Görev 08)

Yedi görev boyunca oyun **sonucu** anlattı: emir ver, TURU BİTİR'e bas, raporu oku. Sahne
katmanı **olayı** anlatıyor.

**Belkemiği tek cümle: MOTOR KARAR VERİR, SAHNE OYNATIR.**

```
TURU BİTİR → motor her şeyi çözer (bugünkü gibi, ~50 ms)
           → ortaya sıralı bir OLAY LİSTESİ çıkar   (src/oyun/olaylar.js)
           → sahne o listeyi oynatır                 (src/sahne/, SahneKatmani.js)
```

Animasyon başladığında oyunun durumu **çoktan kesinleşmiştir**. Sahne yalnızca olmuş bitmiş
bir şeyi gösterir: maç bitmiştir, skor bellidir, oynatılan şey özettir. Bunun üç sonucu var:

- **Atlamak bedelsiz.** Ekrana dokunmak gösteriyi bitirir; hiçbir şey kaybolmaz.
- **Motor kirlenmez.** `muharebe.js` ve `cozum.js` sahneyi tanımıyor.
- **Test edilebilir.** "Doğru olaylar doğru sırada mı" sorusu, "ekranda güzel mi"
  sorusundan tamamen ayrı sınanıyor (`testler/olaylar.test.js`).

**Olay türleri:** tur açılışı · kamera · yürüyüş · takviye · savaş · vuruş (raunt) ·
bozgun · çekilme · imha · fetih · il tamamlandı · il kaybedildi · düello.

**Tempo — bu katmanın oyunu bozabileceği tek yer.** Sıra tabanlı oyunda animasyon ilk 10
tur harika, sonraki 40 tur işkencedir. Çözüm SÜREYİ kısaltmak değil **KAPSAMI daraltmak**
oldu: 50 turluk oyunu işkenceye çeviren bir savaşın 5 saniye sürmesi değil, 80 aktörün
savaşını izlemek. Oyuncuya çıkan tek ayar bu:

| Kapsam | Ne oynar | Ölçüldü (tur başına) |
|---|---|---|
| `kapali` | Hiçbir şey — tur anında biter | 0 sn |
| **`cephem`** (varsayılan) | Yalnızca senin savaşların, TAM ayrıntıyla | **6.6 sn** |
| `hepsi` | Rakiplerin savaşları da haritada (raunt dökümü olmadan, en çok 3 tane) | 13.5 sn |

> **Süreler cihaz denemesinden sonra iki katına çıkarıldı** (2026-08-01, Baki: *"savaşlar
> fazla hızlı gerçekleşiyor… telefon titriyor falan, sonra bir bakıyorum sonuç ekranı
> geliyor direkt"*). Bir raunt 260 → 650 ms; ayrıca son olaydan sonra rapor açılmadan
> önce bir nefes payı (`SON_BEKLEME`) kondu.
>
> **Senin savaşların hiçbir sınıra takılmaz.** `EN_COK_SAVAS` yalnızca uzaktakileri
> sınırlıyor — ayarın bütün sözü "izlemek istediğim savaş atlanmaz".

Dört koruma baştan konuldu: **her şey atlanabilir** · **kapsam ayarı** · **uzaktakiler
manşet** · **ilki tam, tekrarı kısa**. Ölçüm: `veri/sahne-olcum.md`.

**Kırmızı çizgi:** rozet katmanına dokunulmadı. Efektler rozetlerin ÜSTÜNDE, aynı sabit
yerleşimi okuyan (`haritaSabitleme.js`) ayrı bir katmanda. Gösteri boyunca rozet başına
maliyet sıfır — Görev 05'te akıcılığı altı tur kovalatan kusur geri gelmiyor.

---

## 14. DENGE DÜĞMELERİ

> **Görev 08'de eklenen düğmeler** (hepsi `src/denge.js`):
>
> | Düğme | Ne yapar |
> |---|---|
> | `SAHNE.VARSAYILAN_KAPSAM` | Oyun ilk açıldığında hangi gösterim seçili (`cephem`) |
> | `SAHNE.HIZ_CARPANI` | Bütün olay sürelerini birden ölçekler. **Kullanıcı ayarı değil** — cihazda uzun gelirse değişecek tek sayı |
> | `SAHNE.SURE.*` | Olay başına süre (11 tür) |
> | `SAHNE.ONEMLI_ESIGI` | Hangi savaşta birlik şeridi açılır (iki tarafın toplam birimi) |
> | `SAHNE.EN_COK_SAVAS` | Bir turda en fazla kaç savaş oynatılır (`hepsi` kapsamının freni) |
> | `SAHNE.TEKRAR_ESIGI` / `TEKRAR_KISALTMA` | "İlki tam, tekrarı kısa" kuralının iki sayısı |
> | `SAHNE.EN_COK_ESZAMANLI` | Aynı anda kaç efekt oynar (kare bütçesinin freni) |
> | `SAHNE.OLCEK_GUCU` | İl kartının süresi/boyu ilin değerine göre ne kadar değişir. **Tek katsayı** |
> | `SAHNE.SARSINTI.*` | Rozet sarsıntısının piksel/süre/tekrarı |
> | `SAHNE.KAMERA.ACIK` | Kamera hiç oynamasın — tek satırlık güvenlik valfi |
> | `SAHNE.KAMERA.YAKINLIK` | Kameranın durduğu yakınlaştırma (rozet katman sınırının üstünde) |
> | `REKABET.DUELLO_SURESI` | Kutsal savaş kaç tur sürer |
> | `REKABET.MORAL_BONUSU` | §3.8 listesine eklenen kalem sayısı |
> | `REKABET.GANIMET_BONUSU` | Düello rakibinden alınan toprakta ek ganimet oranı |
> | `REKABET.UCUNCU_TARAF` | Üçüncü taraf kısıtının kuralı (`kapali`/`cephe`/`topraklar`) |
> | `REKABET.EN_COK_ETKIN` | Aynı anda en fazla kaç düello |
> | `ZEKA.TAKVIYE.ACIK` | Yapay zekâ iç bölgeden cepheye kuvvet taşısın mı |
> | `ZEKA.TAKVIYE.EN_AZ_KUVVET` | Kaç birimden azı yürütülmez |
> | `ZEKA.TAKVIYE.TERIM.*` | Takviye puanının iki terimi (tehdit / yakınlık) |
> | `ZEKA.HUSUMET_ACIK` | Husumet terimi (Görev 08'de **açıldı**) |

> **Görev 07'de eklenen düğmeler** (hepsi `src/denge.js`):
>
> | Düğme | Ne yapar |
> |---|---|
> | `ZEKA.ZORLUK` | Üç kademe: kişilik aralıkları + karar gürültüsü. Gizli bonus yok. |
> | `ZEKA.TERIM.*` | Fayda formülünün beş teriminin ağırlığı (§9.1) |
> | `ZEKA.EN_AZ_PUAN` | Bunun altındaki hamle için emir verilmez |
> | `ZEKA.KUVVET_ADAYLARI` | Hamle uzayının genişliği — büyütmek telefonu yorar (§9.3) |
> | `ZEKA.IL_BONUSU` | İli tamamlayan parçanın ek çekiciliği |
> | `ZEKA.ACIKTA_TAVAN` | Arkasını açık bırakma cezasının üst sınırı |
> | `ZEKA.URETIM_PAYI` | Yapay zekânın havuzunun ne kadarını orduya yatırdığı |
> | `ZEKA.TOPARLANMA_ESIGI` | Ordunun ne kadarı eksikse toplanma emri verildiği |
> | `ZEKA.MANSET_SINIRI` | Tur raporunda uzak olaylardan kaç tane yazıldığı |
> | `GARNIZON.KATSAYI` | Açılış garnizonunun toplam büyüklüğü (il değerine oranla) |
> | `GARNIZON.PAY_YUMUSATMA` | İl içi parça dağılımının ne kadar eşitlendiği |
> | `MUHAREBE.MORAL.BOZGUN_ORANI` | Ordunun canının ne kadarını kaybedince dağıldığı |
> | `ARASTIRMA.ARTIS` | Seviye başına stat artışı (oransal) |
> | `ARASTIRMA.OZEL.*` | Dört kendine özgü dalın etki büyüklüğü |
> | `STAT_OLCEGI` | Muharebe statlarının §3.1'e göre çarpanı (ondalık olmasın diye 25) |

**Görev 09'un eklediği düğmeler:**

| Düğme | Etkisi |
|---|---|
| `DIPLOMASI.FAYDA.ESIK` | **İttifak ana düğmesi.** Teklifin verilmesi ve kabulü için gereken en az puan. 0.5 doygunluk verir, 0.8 diplomasiyi tamamen öldürür — bant dar |
| `DIPLOMASI.FAYDA.KOMSU` | Komşuyla anlaşmanın maliyeti (bir cepheyi kapatır). Doygunluğun asıl ilacı |
| `DIPLOMASI.FAYDA.ORTAK_DUSMAN` · `CEPHE_YUKU` · `HUSUMET` · `ZAYIF_KOMSU` | Fayda terimleri; hepsi ORAN (0–1), dünyanın büyüklüğünden bağımsız |
| `DIPLOMASI.EN_COK_ITTIFAK` | Aynı anda en çok kaç ittifak. Blokların zincirlenmesini sınırlar |
| `DIPLOMASI.TUR_BASINA_TEKLIF` | Tur başına teklif. Sınırsız olursa diplomasi piyangoya döner |
| `DIPLOMASI.IHANET_SURESI` · `SAVAS_UST_SINIRI` | Anlaşmayı bozmanın bedeli · unutulmuş savaşın ömrü |
| `DIPLOMASI.TANIDIK.BUYUKLUK_ESIGI` · `EN_COK` | Kimi uzaktan tanırsın · liste kapağı (§10/9) |
| `MOD.SANIYE_PER_TUR` | **Maç uzunluğunun tek düğmesi.** Üç modun süresini birden kaydırır; ÖLÇÜLMEDİ |
| `MOD.TIPLER.*.TABAN` · `PARCA_BASINA` | Tur sınırı formülü — kapsam büyüklüğüne göre ölçekleniyor |
| `MOD.TIPLER.*.ESIK_ORANI` | Kazanmak için gereken parça oranı (`null` = sıralama belirler) |
| `MOD.SURE_DOLUNCA` | Süre dolduğunda ne olur (`toprak` = en çok tutan kazanır) |
| `MOD.YUVA_SAYISI` | Kayıt yuvası sayısı — ÜCRETSİZ ve öyle kalacak (§12.3) |
| `REKABET.GIRIS_SARTI` | Düelloya girmenin şartı; `topraklar` kısıtının sömürüsünü kapatan kural |
| `KAYIT_SINIRI_KB` | Kayıt boyutu **kanaryası** — depolama sınırı değil, geometri sızıntısı alarmı |

Playtest sırasında ayarlanacak sayılar, önem sırasıyla:

| Düğme | Etkisi |
|---|---|
| **Hafif vuruş böleni (12)** | **Ana düğme.** Küçültürsen zırh güçlenir ve zırhlı ezici olur; büyütürsen piyade yığını öne çıkar. |
| Zırh sönüm böleni (40) | Zırhın ağır vuruşu ne kadar azalttığı. Küçültürsen zırh ağır vuruşa da direnir. |
| İsabet verimi tabanı (0.55) ve böleni (20) | Ağır vuruşun yumuşak hedefteki israfı. Taban yükseldikçe topçu her şeye karşı iyi olur. |
| Zırhlı dayanıklılığı (24) | Zırhlının maliyetini haklı çıkarma derecesi. |
| Zırhlı ekonomi maliyeti (6) | Kaç zırhlı basılabildiği; doğrudan §4.5 tablosunu kaydırır. |
| Dağlık zırhlı cezası (0.50) | Coğrafyanın zırhlıyı ne kadar dizginlediği. |
| Moral formülü (⌈birim/2⌉) | Muharebelerin ne kadar kanlı bittiği. Böleni büyütürsen ordular çabuk bozulur. |
| Yaralı birlik canı (%50) | Yaralılığın ne kadar acıttığı. Küçültürsen yaralı ordu cam gibi kırılır ve toparlanma zorunlu hâle gelir; büyütürsen yaralılık önemsizleşir. |
| Yaralı iyileştirme bedeli (toplanmanın yarısı) | Yaralıya bakmanın, ölenin yerine yenisini koymaya göre ucuzluğu. Eşitlenirse "yaralı" ile "ölü" arasındaki fark ekonomik olarak kaybolur. |
| Toplanma bedeli (yarım fiyat) | Savaşların temposu; ucuz = sürekli savaş, pahalı = uzun toparlanma. Tablo değil ORAN: bedel `⌈normal × 0.50⌉` diye türetilir (§3.9/3). |
| **Araştırma tavanı** | Bir dalın çıkabileceği en yüksek seviye. Tahminle konmaz, ölçülür — ama ölçüt 2026-08-11'de değişti (§6): eskiden "§3.7 hangi seviyede kırılıyor" bakılıyordu, artık iki uç birden bakılıyor: *sınırdaki savaş dönmeli* (kıl payı %95+) ve *umutsuz savaş dönmemeli* (ezilen %15). Yükseltirsen ikincisi bozulur: araştırma ordu büyüklüğünün yerine geçmeye başlar (`veri/arastirma-olcum.md`). |
| **Araştırma maliyet eğrisi** (Sv.N = 6×N puan) | Ordunun ne kadar hızlı kaliteye dönüştüğü. Küçültürsen araştırma "her tur bas" düğmesine döner; büyütürsen kimse ikinci dala girmez. |
| Eğitim verimi (0.60 + 0.12·√eğitim) | Aynı ekonominin kaç araştırma puanına döndüğü — ve eğitimli il fethetmenin değeri. Karekök bilerek: doğrusal olsaydı araştırma imparatorluk büyüklüğünün karesiyle artar, kartopunu ikinci kez beslerdi. |
| Şans bandı (%10) | Sürpriz oranı. Şansın kapandığı kuvvet oranı (2:1) ayrı düğmedir. |
| Fetih nüfus oranı (%60) | Kartopu hızı. Fethedilen parçanın nüfus payının bu oranı kadar tek seferlik nüfus. |
| **Garnizon böleni (4)** | Oyunun açılış sertliği. Küçültürsen ilk fetih zorlaşır; parça başına ⌈(nüfus+sanayi)/bölen⌉ birim. |
| Moral "yüksek" eşiği (5) | Kaç ilin moral bonusu aldığı — şu an 81 ilin 23'ü. |
| Çekilme kaybı (1 birim) | Bozgunun ne kadar cezalandırıldığı. |
| Muharebe üst sınırı (20 tur) | Sonsuz muharebe koruması; sınıra gelinirse berabere. |
| **Sanayi üretim sınırı** (il statı kadar / tur) | Ordunun ne kadar hızlı büyüyebildiği. Kapatılırsa yalnızca para kısıtlar; büyük ekonomi tek turda ordu basar (§4.6). |
| Rozet katman sınırları (1.35× / 2.70×) | Haritanın hangi yakınlaştırmada kalabalıklaştığı. Ölçümle seçildi (§7), keyfi değiştirilmemeli. |

---

## 15. UYGULAMA SIRASI (ÖNERİLEN)

1. ✅ Veri katmanı: 81 il + komşuluk grafiği + 7 özellik tablosu + arazi tipleri *(Görev 01–02)*
2. ✅ Ekonomi: iki para birimi üretimi, tur döngüsü iskeleti *(Görev 03)*
3. ✅ Ordu: doğrudan birim satın alma (§4.2), seçilen parçada üretim (§4.6), haritada rozet gösterimi (§7) *(Görev 04)*
4. ✅ Muharebe: stat vektörü, iki etkinlik eğrisi, hasar havuzu, arazi, şans *(Görev 05)*
5. ✅ Bozgun/moral, geri çekilme *(Görev 05)* — **yeniden toplanma Görev 06'ya ertelendi (§3.9/2)**
6. ✅ Parça/kontrol sistemi ve fetih *(Görev 05)*
7. Yapay zekâ: fayda fonksiyonu + kişilik ağırlıkları *(sıradaki büyük adım; kuruluş garnizonları onun başlangıç kuvveti olacak, §7)*
8. Arayüz: harita, il paneli, üretim ekranı, muharebe ekranı
9. Diplomasi
10. Rekabet olayları
11. Sıcak koltuk çok oyunculu
12. Para kazanma katmanı

**Her adım bir öncekinin üstüne oturur; muharebe ve bozgun (4–5) tamamlanmadan yapay zekâya (7) geçilmemeli** — AI'ın fayda hesabı muharebe sonucunu tahmin etmeye dayanır.

---

## EK: TERİM SÖZLÜĞÜ

| Terim | Karşılık | Tanım |
|---|---|---|
| Birim | Ordunun tek üyesi | Bir piyade/topçu/zırhlı taburu; ordu birimlerden oluşur |
| Stat vektörü | Güç profili | (Zırh, Ağır, Hafif) üçlüsü |
| zOrt | Ortalama zırh | Toplam zırh / birim sayısı |
| Dayanıklılık | Can puanı | Bir birimin soğurduğu hasar |
| Hasar havuzu | Birikmiş hasar | Birim öldürmeye yetmeyen artık hasar |
| Sayaç (counter) | Kırıcı | Bir tipin diğerini yenmesi |
| Yıpranma (attrition) | Tur tur kayıp | Savaşın turlara yayılarak çözülmesi |
| Moral | Dayanma puanı | 0'a inince ordu bozulur |
| Bozgun (rout) | Dağılma | Ordunun imha olmadan çözülüp geri çekilmesi |
| Yeniden toplanma | Reconstitution | Yıpranmış ordunun 1 turda yarı fiyata doldurulması |
| **Yaralı** | Sahada ama zayıf birlik | Savaştan sağ çıkmış ama hırpalanmış birlik. Aynı güçle vurur, canı yarıdır, kayıpları önce o verir. Toparlanma iyileştirir |
| **Sağlam** | Yarası olmayan birlik | Savaşabilir ve hareket edebilir; toparlanma emri onu sahadan çekmez |
| **Kadro** | Kağıt üstündeki mevcut | Ordunun olması gereken birim sayısı. Sahadaki mevcut (`birimler`) kayıpla düşer, kadro düşmez; aradaki fark toplanmayla kapatılır ve kadro o kapatmanın üst sınırıdır |
| **Eğitim gücü** | Araştırma verimi | Aktörün elindeki parçaların eğitim değerleri toplamı; araştırmaya ayrılan ekonominin kaç puana döndüğünü belirler (§6) |
| Manpower | Nüfus havuzu | Nüfustan gelen asker kaynağı |
| Guns vs butter | Top mu tereyağı mı | Orduya mı ekonomiye mi yatırım |
| Utility AI | Fayda tabanlı YZ | Hamleleri puanlayıp en yükseği seçen sistem |
| LOD | Ayrıntı seviyesi | Uzak birimleri basitleştirme — bu oyunda **kullanılmıyor** |
| Time-slicing | Bölünmüş hesaplama | Ağır işi karelere yayma |
| P2W | Parayla kazanma | Parayla oyun içi güç alma — **yasak** |
| QoL | Hayat kalitesi | Güç vermeyen konfor iyileştirmesi |
| Hot-seat | Sıcak koltuk | Aynı cihazda sırayla oynama |
