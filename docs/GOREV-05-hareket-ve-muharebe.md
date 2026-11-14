# GÖREV 05 — HAREKET VE MUHAREBE

> Tarih: 2026-07-27 · Önceki: `docs/GOREV-04-ordu-uretimi.md` + `GOREV-04-RAPOR.md`
> Tasarım referansı: `docs/il-savasi-tasarim.md` §3 (muharebe), §7 (parça/komşuluk), §8 (tur döngüsü)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

Ordular üretildikleri parçada duruyor; bu görevin sonunda **komşu parçaya yürüyor, çarpışıyor, kaybediyor, çekiliyor ve toprak el değiştiriyor.**

---

## 2. KAPSAM

**Dahil:** hareket · muharebe motoru · hasar havuzu · arazi çarpanları · şans · moral ve bozgun · geri çekilme · parça fethi · il el değiştirmesi · fetih ganimeti · savunmasız bırakma uyarısı · muharebe sonuç ekranı · tarafsız garnizon (Soru 2'ye bağlı).

**Dahil DEĞİL:** yapay zekâ karar verme (Görev 07) · araştırma (§6) · diplomasi (§10) · rekabet olayları (§11) · mod seçim ekranı · ana menü · kazanma/kaybetme ekranı.

**Yeniden toplanma:** Soru 5'e bağlı, aşağıya bak.

> **Kapsam kuralı üç görevdir korunuyor, bu görevde de korunacak.** Muharebe zaten bu projenin en çok hareketli parçası olan işi: motor + hareket + fetih + arayüz. Buraya bir de yapay zekâ eklenirse, bir hata çıktığında hatanın muharebe matematiğinde mi yoksa YZ'nin verdiği kararda mı olduğu bulunamaz. Tasarım §15 de bunu açıkça yazıyor: "muharebe ve bozgun (4–5) tamamlanmadan yapay zekâya (7) geçilmemeli".

---

## 3. KOD YAZILMADAN ÖNCE CEVAPLANACAK BEŞ SORU

Görev 04'teki gibi: bunlar cevaplanmadan kod yazılmayacak. Her birinde bir öneri var, gerekçesiyle.

### Soru 1 — Muharebe ne zaman çözülür?

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Anında** | Hedefe dokun → onay → sonuç kutusu hemen çıkar. Sonucu görüp bir sonraki hamleni ona göre yaparsın. |
| B | Emir kuyruğu | Tüm hamleleri dizersin, TURU BİTİR'e basınca hepsi birlikte çözülür (tasarım §8'in 5. ve 6. maddeleri ayrı yazılmış). |

**Öneri: A.** Tasarım §8'deki "hareket & saldırı" ve "çözüm" ayrımı bir *aşama tarifi*, eşzamanlılık sözü değil. Emir kuyruğu üç yeni iş getirir: emirlerin haritada gösterimi (oklar), emir iptali, ve emirlerin çakışması (aynı orduyu iki yere göndermek). Üçü de bu görevin asıl işi olan muharebe matematiğinden çalar. Ayrıca sonucu anında görmek, dengeyi test ederken en hızlı geri bildirim yolu — 15 satırlık doğrulama tablosunu (§3.7) telefonda da doğrulayabilirsin.

*Günlük karşılığı:* A = satranç (hamleni yaptın, sonucu gördün). B = mektup (hepsini yazdın, zarf tur sonunda açılıyor).

### Soru 2 — Karşı tarafın ordusu nereden gelecek?

**Bu sorunun cevabı olmadan muharebe oyunda hiç çalışmaz.** Şu an yalnızca oyuncu asker basıyor; diğer 80 il aktörünün hiç ordusu yok. Cevap verilmezse her saldırı boş bir parçaya yürümekten ibaret kalır ve yazılan tüm muharebe kodu yalnızca testlerde çalışır.

| | Seçenek | Ne demek | Bedeli |
|---|---|---|---|
| **A** | **Kuruluş garnizonu** | Oyun başlarken her tarafsız parçaya ilin statlarından türetilmiş sabit bir savunma ordusu konur. Üretmez, hareket etmez, sadece savunur. | Küçük. Tohumlu rastgelelik (`rastgele.js`) zaten var, tekrar üretilebilir. |
| B | Sessiz üretim | Diğer aktörler de her tur sanayi sınırınca birim basar (§4.5 tablosundaki karışımla), ama hareket etmez. | Orta. Kayıt büyür, "kim ne bastı" izlenmeli. |
| C | Hiçbiri | Muharebe yalnızca testlerde doğrulanır; oyunda boş parça işgali olur. | Sıfır — ama görev fiilen yarım kalır. |

**Öneri: A.** Ölçülebilir, tekrar üretilebilir ve **karar vermiyor** — yani yapay zekâ değil, veri. Görev 07'de gerçek YZ geldiğinde bu garnizonlar onun başlangıç ordusu olur, atılacak kod olmaz.

**A'nın bilinen kusuru:** garnizon tükenince yerine yenisi gelmez, ilerledikçe direnç azalır (kartopu). Bu bilerek kabul ediliyor; düzelten şey Görev 07.

**Garnizon formülü önerisi:** `birim sayısı = ⌈(nüfus statı + sanayi statı) / 4⌉`, karışım §4.5'teki il tipine göre (kalabalık il → piyade ağırlıklı, sanayi ili → zırhlı ağırlıklı). İstanbul ~5, Bayburt ~1 birim çıkar. Sayılar `denge.js`'e girer, oynanabilir.

### Soru 3 — Hareket hakkı ve kısmi gönderim

Tasarım §5'te altyapı statının kaldırılma gerekçesi hareket hızını dolaylı olarak tanımlıyor: *"beş parçalı bir ili baştan sona geçmek zaten beş tur sürüyor"* → **tur başına bir komşu parça.** Bunu soru saymıyorum, belgeden çıkan sonuç.

Sorulacak olan şu:

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Seç ve gönder** | Parçadaki ordunun kaçını göndereceğini seçersin (üretim ekranındaki `[−] n [+]` düzeneğinin aynısı). Kalanlar orayı savunur. |
| B | Hepsi gider | Bir parçadan çıkan ordu bütün hâlinde gider. |

**Öneri: A — ve bu aslında zorunlu.** Tasarım §4.4 garnizon/sefer ayrımını kaldırırken gerekçesi şuydu: "kalan birim savunur, çıkan birim sefere gider, ayrım kendiliğinden oluşur." B seçilirse geride hiç birim bırakmak mümkün olmaz ve §4.4'ün dayandığı cümle çöker.

**Ek kural (öneri):** her birimin turda **tek hamle hakkı** vardır. Boş parçaya girmek de, saldırmak da aynı hakkı harcar. Hareket ettikten sonra aynı tur ikinci kez hareket edilemez; kazanılan muharebeden sonra hayatta kalanlar hedefe geçer ama o tur bir daha hareket edemez ("art arda fetih" zinciri olmasın).

### Soru 4 — Bozgun olan ordu nereye çekilir?

Tasarım §3.9 "komşu **dost** bir ile çekilir, çekilirken 1 birim daha kaybeder" diyor ama hangi komşuya olduğunu söylemiyor.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Motor seçer, kural belli** | Öncelik: (1) saldırıya çıktığı parça, (2) kendi parçaları arasında en çok birimi olan komşu, (3) hiçbiri yoksa ordu yok olur. |
| B | Oyuncu seçer | Bozgun anında bir seçim kutusu açılır. |

**Öneri: A.** Bozgun bir *ceza*; ortasında oyuncuya seçim vermek cezayı yumuşatır. Ayrıca Görev 07'de YZ'nin de aynı kararı vermesi gerekecek — kural zaten yazılmak zorunda, iki ayrı yol yazmanın anlamı yok. Çekilme yönü sonuç kutusunda **yazıyla** bildirilir ("Bursa Ovası'na çekildi, 1 birim daha kayıp").

### Soru 5 — Yeniden toplanma bu göreve girsin mi?

Tasarım §3.9/3: yıpranmış ordu bir tur boyunca hareket etmez ve saldırmaz, tur sonunda kadrosu **yarı fiyata** dolar.

| | Seçenek | Bedeli |
|---|---|---|
| A | Girsin | Kadro hafızası (hangi birimler kaybedildi), toplanma emri, "bu tur savaşamaz" kilidi, arayüzde ayrı düğme. Görevi ~%20 büyütür. |
| **B** | **Girmesin — Görev 06'ya** | Ordular yıprandıkça erir. Veri modeli şimdiden hazırlanır (kadro alanı yazılır, kullanılmaz). |

**Öneri: B.** Gerekçe: toplanma bir *ekonomi* mekaniği, muharebe mekaniği değil (tur döngüsünde de ayrı bir aşama, §8/4). Bu görevin bitiş ölçütü "muharebe doğru mu" olmalı; oraya bir de yarı fiyat ekonomisi eklenirse denge testinde hangi sayının hangi sonucu doğurduğu ayrışmaz. **Ama hasar havuzu (§3.4) bu göreve dahil** — o muharebenin kendisinin parçası, turlar arası hatırlanır.

---

## 4. TASARIMDA CEVABI OLMAYAN, KOD YAZARKEN DOLDURULACAK BOŞLUKLAR

Bunlar soru değil; ben karar verip **gerekçesiyle `URETIM-NOTU.md`'ye ve tasarım belgesine yazacağım**. Burada önden listeleniyorlar ki karar sessizce alınmasın.

| # | Boşluk | Önerilen doldurma |
|---|---|---|
| 1 | **Arazi zırhlı çarpanı neye uygulanıyor?** §3.5 "Zırhlı birim çarpanı" diyor ama hasara mı, dayanıklılığa mı, ikisine mi belli değil. | **§3.7'deki 15 satırlık doğrulama tablosu hakem.** Üç yorum da kodlanıp tabloya karşı çalıştırılacak; tabloyu yeniden üreten yorum doğru kabul edilecek. Tahmin yok, ölçüm var. |
| 2 | **Hasar eşzamanlı mı?** | Eşzamanlı: her muharebe turunda iki taraf da **tur başındaki** durumuna göre hasar verir, sonra ikisine birden uygulanır. Sıralı olsaydı "kim önce vurur" gizli ve çok güçlü bir kural olurdu. |
| 3 | **Orantılı kayıp tam sayıya nasıl bölünür?** §3.4 "kompozisyona ORANTILI" diyor, 1 birim ölürken oran kesir verir. | En büyük artık yöntemi (largest remainder): oranlar hesaplanır, artığı en büyük tür kaybı yer. Eşitlikte `BIRIM_SIRASI` belirler — sonuç **belirlenimci** olur, aynı girdi hep aynı sonucu verir. |
| 4 | **Şans için "kuvvet oranı 2:1" neyin oranı?** §3.6 tanımsız bırakmış. | Kuvvet = ordunun o turda verdiği **ham hasar** (arazi ve şans öncesi). Birim sayısı olsaydı 3 piyade, 1 zırhlıya "3:1 üstün" sayılırdı — oysa §3.7'ye göre zırhlı kazanıyor. |
| 5 | **Muharebe kaç tur sürer?** | Bozguna veya imhaya kadar, **oyun turu içinde biter**. Sonsuz döngüye karşı üst sınır (`DENGE.MUHAREBE.EN_COK_TUR`, öneri 20); sınıra gelinirse muharebe **berabere** biter, saldıran geri çekilir, iki taraf da yıpranmış kalır. |
| 6 | **Moral bonusları parçada nasıl okunur?** §3.8 "ilin moral statı", "savunmada dağlık", "kendi toprağında" diyor. | Moral statı → parçanın **ilinden**; dağlık → **parçanın** arazisinden; "kendi toprağı" → savunulan parçanın sahibi savunan aktörse. Üçü de veriden okunur, elle liste yok. |
| 7 | **Hasar havuzu kimin?** | Parçadaki ordunun. Ordu bölünüp bir kısmı hareket ederse havuz **birim sayısına oranla** bölünür — yoksa "yarısını gönder, hasarı geride bırak" diye bedava temizlik sömürüsü doğar. |
| 8 | **Fetih ganimeti (%60) somut olarak ne?** §13.2/§14 "fetih nüfus oranı %60" diyor, karşılığı tanımsız. | Fethedilen parçanın **nüfus payının %60'ı kadar tek seferlik nüfus** kazanılır (seferberlik). Sabit `denge.js`'e girer, kartopu hızının ana düğmesi olur. *İstersen bunu soruya çeviririm — kartopu hızını doğrudan belirliyor.* |

---

## 5. VERİ MODELİ (KAYIT SÜRÜMÜ 4 → 5)

Mevcut yapı korunuyor, üstüne üç alan geliyor:

```js
durum.ordular = {
  "16-1": {
    sahip: "16",
    birimler: { piyade: 3, topcu: 1 },
    hasarHavuzu: 6,        // YENİ — turlar arası hatırlanır (§3.4)
    hamleHakki: true       // YENİ — tur başında true, hareket edince false
  }
}

durum.sonMuharebe = { ... }  // YENİ — sonuç kutusunun okuduğu son çözüm kaydı
```

- **Boş parça kaydı yine tutulmuyor** (Görev 04 kuralı; rozet performansının kaynağı bu).
- `hamleHakki` tur sonunda `turDongusu.js`'te sıfırlanır — sanayi sayacının yanına.
- `kayitVerisi.js` yeni alanları doğrular; **sürüm 1–4 reddedilir.** Sürüm 4 için ret sebebi ayrı yazılacak: harita ve ordular aynı ama hamle hakkı ve hasar havuzu yok; yüklenirse oyuncu ordularının neden hareket edemediğini anlayamaz.
- Kayıt boyutu yeniden ölçülecek (Görev 04'te 12.0 KB / en kötü 24.4 KB idi).

---

## 6. ADIMLAR

| Adım | İş | Ekranda değişir mi |
|---|---|---|
| 0 | Denge sayılarının yeri + belge denetimi | hayır |
| 1 | **Muharebe motoru** ve §3.7 tablosunun yeniden üretilmesi | hayır |
| 2 | Hareket kuralları | hayır |
| 3 | Fetih ve il el değiştirmesi | hayır |
| 4 | Bozgun ve geri çekilme | hayır |
| 5 | Arayüz: hedef seçme, kuvvet seçici, sonuç kutusu, uyarılar | evet |
| 6 | Tarafsız garnizon (Soru 2 = A ise) | evet |
| 7 | Belgeler, testler, kayıt sürümü 5 | hayır |

**Adım 1–4 boyunca ekranda hiçbir şey değişmez.** Görev 04'te de böyle yapıldı (Adım 3'te ordular vardı, görünmüyordu) ve işe yaradı: motor testlerle doğrulanmadan arayüz yazılırsa, ilk hata çıktığında hatanın matematikte mi çizimde mi olduğu bilinemiyor.

### Adım 0 — Denge sayılarının yeri ve belge denetimi

1. **`tema.js ARAZI_CARPAN` yanlış dosyada.** Proje kuralı: *oyun dengesini etkileyen hiçbir sayı koda gömülmez, hepsi `denge.js`'tedir.* Arazi çarpanları muharebe hesabına giriyor, yani denge sayısı; `tema.js` sunum dosyası. **`DENGE.ARAZI`'ye taşınacak**, `tema.js` gerekirse oradan okuyacak.
2. `denge.js` başındaki yorum listesinde Görev 05 için bekleyen sabitler var (hafif vuruş böleni 12, zırh sönüm böleni 40, isabet tabanı 0.55 / böleni 20, moral böleni 2, şans bandı %10, fetih oranı 0.60). Hepsi yazılacak, hiçbiri koda gömülmeyecek — **test bunu kanıtlayacak** (sabiti değiştir, sonucun değiştiğini doğrula; Görev 04'teki maliyet testinin aynısı).
3. Tasarım belgesinde muharebeyle ilgili kalıntı taraması: §3.9'daki "komşu **dost il**" ifadeleri parça diline çevrilecek (temel birim parça, §7).

### Adım 1 — Muharebe motoru (`src/oyun/muharebe.js`)

Saf fonksiyon: oyun durumunu tanımaz, düz veri alır düz veri döndürür. Test edilebilirliğin tamamı buradan geliyor.

```
muharebeCoz({ saldiran, savunan, arazi, moralBonuslari, tohum }) → {
  turlar: [...],        // her muharebe turunun dökümü (sonuç kutusu ve hata ayıklama için)
  kazanan, sebep,       // 'imha' | 'bozgun' | 'berabere'
  kalanSaldiran, kalanSavunan, hasarHavuzlari
}
```

İçerik: §3.3 formülleri · §3.4 hasar havuzu + orantılı kayıp · §3.5 arazi · §3.6 şans (tohumlu, `rastgele.js`) · §3.8 moral ve bozgun.

**Bitiş ölçütü: §3.7'deki 15 satırın hepsi testte yeniden üretiliyor.** Tablo sürekli modelin çıktısı, bizimki tam sayı — bu yüzden karşılaştırma *kimin kazandığı* ve *farkın büyüklük sırası* üzerinden yapılır, ondalık eşitlik aranmaz. Tablonun altındaki dört tasarım kısıtı ayrıca test edilir (piyade denk sayıda zırhlıyı asla yenmez, zırhlı 1v1 ezer / 2'ye 1 dar kazanır / 3'e 1 kaybeder, vb.).

### Adım 2 — Hareket (`src/oyun/hareket.js`)

- `hareketGecerliMi(durum, kaynak, hedef, birimler)` → ret sebebi kodlu döner (`komsuluk` | `sahiplik` | `hak` | `kuvvet` | `kapsam`). Görev 04'teki `siparisGecerliMi` kalıbının aynısı.
- Komşuluk **yalnızca** `veri/parca-komsuluk.json`'dan (469 çift). İl komşuluğu hareket kuralı değildir (§7).
- Boş veya kendi parçana hareket → muharebe yok, doğrudan giriş; hak yine harcanır.
- Düşman parçasına hareket → muharebe.
- **Tek kaynak kuralı:** arayüzdeki "bu hedef seçilebilir mi" kontrolü ile motorun kontrolü aynı fonksiyondan gelir. Görev 04'te `eklenebilirMi` / `siparisGecerliMi` ayrışması bu yüzden testle kilitlenmişti; aynısı burada da yapılacak.

### Adım 3 — Fetih (`src/oyun/fetih.js`)

- Parça el değiştirir → `parcaSahipligi` güncellenir, harita rengi zaten buna bağlı (Görev 03).
- **İlin tüm parçaları tek elde toplanınca il el değiştirir** (§7). `aktorOzeti.tamIl` sayacı zaten var ve testli — kullanılacak.
- Fetih ganimeti (§4/8. boşluk).
- Fethedilen parçada üretim aynı tur mu başlar? **Hayır** — tur döngüsü gelir hesabını tur sonunda yapıyor, parça o an kimdeyse onun sayılır. Ek kural gerekmiyor.

### Adım 4 — Bozgun ve çekilme

Soru 4'ün cevabına göre çekilme hedefi seçilir; çekilirken 1 birim daha kaybedilir (§3.9/1); gidecek yer yoksa ordu yok olur. **Yok olan birimlerin nüfusu havuza dönmez** (§3.9/6) — bu bir denge kuralı, unutulursa kayıp cezasız kalır.

### Adım 5 — Arayüz

Akış (üretim ekranının kalıbıyla aynı, oyuncu yeni bir dil öğrenmesin):

1. Kendi parçana dokun → panelde **BURADAKİ ORDU** kutusunun altında **HAREKET / SALDIR** düğmesi.
2. Basınca harita **hedef seçme kipine** girer: hareket edilebilir komşu parçalar vurgulanır, ötekiler soluklaşır. Vazgeçmek için boşluğa dokun.
3. Hedefe dokun → **kuvvet seçici** açılır (`[−] n [+]`, birim türü başına), altında hedefteki savunma ve **muharebe tahmini**.
4. Onay → sonuç.

**Kurallar:**
- **Muharebe tahmini kesin sayı vermez.** Şanssız çalıştırılmış simülasyonun sonucu üç kademede gösterilir: *üstün · denk · zayıf*, yanında beklenen kalan birim. Kesin ihtimal yüzdesi vermek muharebeyi hesap tablosuna çevirir.
- **Savunmasız bırakma uyarısı** (§4.4'ün borcu): parçadaki bütün ordu gönderiliyorsa ve parça bir düşman parçasına sınırdaşsa, onay kutusunda uyarı çıkar. Engellemez, **uyarır**.
- **Onay yalnızca geri alınamaz işte sorulur** (Görev 04'te yazılan kural). Saldırı geri alınamaz → onay var. Boş parçaya yürümek de geri alınamaz → onay var, ama kısa.
- Sonuç kutusu: kim kazandı, iki tarafın kaybı, çekilme yönü, fetih olduysa "X parçası senin oldu" ve il tamamlandıysa ayrı satır. Kapanınca harita güncel.
- Muharebe **canlandırması yok** — tur tur animasyon bu görevin işi değil. Sonuç kutusu turların dökümünü metin olarak gösterebilir (istenirse açılır liste).

### Adım 6 — Tarafsız garnizon

Soru 2 = A ise: `scripts/garnizon-uret.js` veya oyun kurulumunda tohumlu üretim. Kayda giriyor mu, her yeni oyunda aynı mı — tohumla belirlenimci olacak, `npm.cmd run kontrol` doğrulayacak.

### Adım 7 — Belgeler ve testler

Tasarım belgesinde güncellenecek bölümler: §3.3–3.9 (doldurulan boşluklar), §3.5 (arazi çarpanının neye uygulandığı), §4.4 (savunmasız bırakma uyarısı geldi — Görev 04'ün borcu kapanıyor), §7 (hareket ve fetih), §8 (tur döngüsünün 5. ve 6. maddesi), §14 (yeni denge düğmeleri), §15 (uygulama sırası).

---

## 7. DENGE SAYILARI — `denge.js`'e girecek liste

| Sabit | Değer | Kaynak |
|---|---|---|
| `HAFIF_BOLEN` | 12 | §3.3 — **ana düğme** |
| `ZIRH_SONUM_BOLEN` | 40 | §3.3 |
| `ISABET_TABAN` / `ISABET_BOLEN` | 0.55 / 20 | §3.3 |
| `ARAZI` (savunan + zırhlı çarpanları) | §3.5 tablosu | `tema.js`'ten taşınacak |
| `SANS_BANDI` | 0.10 | §3.6 |
| `SANS_KAPANMA_ORANI` | 2.0 | §3.6 ("2:1'i aşınca şans sıfırlanır") |
| `MORAL_BOLEN` | 2 | §3.8 (`⌈birim/2⌉`) |
| `CEKILME_KAYBI` | 1 | §3.9 |
| `FETIH_NUFUS_ORANI` | 0.60 | §13.2, §14 |
| `EN_COK_TUR` | 20 | yeni — sonsuz muharebe koruması |
| `HAMLE_HAKKI` | 1 | yeni — tur başına komşu parça sayısı |
| `GARNIZON_*` | Soru 2'ye bağlı | yeni |

---

## 8. TESTLER VE BİTİŞ ÖLÇÜTÜ

**Sayı hedefi:** Görev 04 sonunda 141 test vardı; bu görev ~60 test daha eklemeli (hedef ~200).

**Motor**
- [ ] §3.7'deki 15 senaryonun hepsi doğru kazananı veriyor
- [ ] Dört tasarım kısıtı ayrı ayrı test edildi
- [ ] Denge sabitleri koda gömülü değil (değiştir → sonuç değişiyor)
- [ ] Aynı tohum + aynı girdi → aynı sonuç (belirlenimci)
- [ ] Hasar havuzu turlar arası hatırlanıyor, ordu bölününce oranla bölünüyor
- [ ] Muharebe hiçbir girdi kombinasyonunda sonsuza gitmiyor (üst sınır testi)
- [ ] Kayıp dağılımı orantılı ve belirlenimci (aynı durum → aynı tür ölür)

**Hareket ve fetih**
- [ ] Yalnızca `parca-komsuluk.json`'daki komşuya hareket ediliyor
- [ ] Bir birim turda iki kez hareket edemiyor; hak tur sonunda yenileniyor
- [ ] Kısmi gönderimde geride kalanlar parçayı savunuyor
- [ ] İl, tüm parçaları alınınca ve **yalnızca o zaman** el değiştiriyor
- [ ] Fetih ganimeti bir kez ekleniyor (aynı parça iki kez alınırsa iki kez veriyor — bu bilinçli mi, testte kayıtlı)
- [ ] Bozgun sonrası çekilme kuralı sırayla işliyor, yer yoksa ordu yok oluyor
- [ ] Yok olan birimlerin nüfusu havuza DÖNMÜYOR

**Genel**
- [ ] Kayıt sürümü 5, sürüm 1–4 anlaşılır mesajla reddediliyor, gidiş-dönüş korunuyor
- [ ] `npm.cmd run kontrol` temiz (veri + ESLint + biçim + testler)
- [ ] `npx.cmd expo export` hatasız
- [ ] Telefonda test: hareket, saldırı, fetih, bozgun — Baki onayı
- [ ] `URETIM-NOTU.md` güncel, alınan tüm kararlar gerekçeli

---

## 9. TUZAKLAR

**Görev 04'ten taşınan ikisi** (ikisi de yaşandı, ikisi de tekrar edecek):
1. **Animasyon iş parçacığına (worklet) başka dosyadan fonksiyon geçirilemez.** Hedef seçme kipinde parçaların soluklaşması UI iş parçacığında çalışacaksa, kural oraya *değer* olarak gitmeli.
2. **Oyun durumundan türetilen nesnelerin kimliği her hamlede değişir.** Harita 181 parça çiziyor; hareket kipinin vurgu listesi `tabanEl`'e değil `vurguEl`'e bağlanmalı, yoksa her saldırıda tam çizim tetiklenir ve Görev 04'te kazanılan akıcılık geri gider.

**Bu göreve özgü üçü:**
3. **Dokunma çakışması.** Harita dokunmasında üç kat koruma var (uzun basma 700 ms / 6 px, `jestAktif`, `kilit`). Hedef seçme kipi bunun üstüne biniyor — kipteyken uzun basma tamamen kapatılmalı, yoksa "hedefi seçeyim derken parçayı geliştirici aracıyla aldım" hatası döner.
4. **Muharebe sonucu haritayı topluca değiştiriyor** (sahiplik + ordular + havuzlar). Tek bir durum güncellemesinde yapılmalı; parça parça yazılırsa harita ara durumları çizer.
5. **Denge sayısı sızıntısı.** Muharebe formülü uzun; ara hesapta `/ 12` yazmak çok kolay. Kural: formülde çıplak sayı yok, hepsi `DENGE`'den.

---

## 10. GÖREV 06 İÇİN BEKLEYENLER

Yeniden toplanma (Soru 5 = B ise) · araştırma (§6) · yapay zekâ (§9, Görev 07) · kazanma koşulu ekranı · diplomasi · rekabet olayları.

---

## EK — KARAR ÖZETİ

| Soru | Cevap | Tarih |
|---|---|---|
| 1 — Muharebe ne zaman çözülür | **B — Emir kuyruğu** *(önerilen A değildi)* | 2026-07-27 |
| 2 — Karşı tarafın ordusu | **A — Kuruluş garnizonu** | 2026-07-27 |
| 3 — Hareket hakkı / kısmi gönderim | **A — Seç ve gönder** (belgede zorunlu sayılmıştı, soruya çevrilmedi) | 2026-07-27 |
| 4 — Bozgun çekilme yönü | **A — Motor seçer, kural belli** | 2026-07-27 |
| 5 — Yeniden toplanma kapsamda mı | **B — Girmesin, Görev 06'ya** | 2026-07-27 |

### Soru 1'in bedeli (kuyruk seçildiği için yapılan ek işler)

Belgede yazan üç iş de yapıldı, üstüne iki tanesi çıktı:

| İş | Nerede |
|---|---|
| Emirlerin haritada gösterimi (oklar) | `Harita.js emirEl` — ayrı katman, taban çizimini tetiklemiyor |
| Emir iptali | `EmirListesi.js` + panelde parça başına iptal · `hareket.js emirKaldir` |
| Emir çakışması (aynı orduyu iki yere gönderme) | **Rezervasyon** — `hareket.js kullanilabilirBirimler` |
| *(ek)* Onay kutusunun yeri değişti | Emir vermek geri alınabilir → onay TURU BİTİR'e taşındı |
| *(ek)* Sonuç kutusu yerine TUR RAPORU | Bir turda birden çok muharebe olabiliyor → `TurRaporu.js` |

### Belgeden sapılan iki nokta (ikisi de gerekçeli)

1. **`hamleHakki` alanı yazılmadı** (§5 veri modeli onu öneriyordu). Anında çözüm varsayımıyla yazılmıştı; kuyrukta rezervasyonun kendisi hamle hakkıdır. İkisini birden tutmak aynı kuralı iki yerde tutmak olurdu.
2. **Hedef seçme kipinde "ötekiler soluklaşır" yapılmadı** (§6/Adım 5). Solukluk 181 parçanın dolgusuna dokunuyor, yani `tabanEl` her kip açılışında baştan kurulurdu — Görev 04'te kazanılan akıcılık geri giderdi (§9/2 tuzağının tam kendisi). Yerine hedefler vurgu katmanında pirinç renkle işaretleniyor; o katman zaten yalnızca seçim değişince kuruluyor.
