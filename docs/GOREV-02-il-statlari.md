# GÖREV 02 — KARARI SABİTLE, TELEFONDA DOĞRULA, İL STATLARINI ÜRET

Bu dosya bu oturumdaki görev tanımıdır. Baştan sona oku, sonra §7'deki düzene uyarak işe başla.

---

## 0. KİMİNLE ÇALIŞIYORSUN

Kullanıcının adı **Baki**. Oyunun tasarımcısı ve sahibi. **Yazılımcı değil.** Kod okumayacak, hata mesajlarını yorumlayamaz.

- Komutları satır satır, kopyalanabilir biçimde ver.
- Teknik terim kullanacaksan yanına tek cümlelik Türkçe karşılık koy.
- Ne yaptığını değil, **Baki'nin ne göreceğini** anlat. "Stat üreticiyi yazdım" yetersiz; "iller.json dosyası oluştu, İstanbul'un nüfus statı 10, Bayburt'un 1 çıktı" doğru.
- Teknik bir karar sorman gerekirse seçenekleri sonuçlarıyla anlat.
- Türkçe konuş.

---

## 1. ÖNCEKİ DURUM — NEREDEN DEVRALIYORSUN

Görev 01 kısmen yapıldı, ayrıca planlanandan ileri gidilerek 193 parçalık bölümleme baştan sona tamamlandı.

**Elde hazır olanlar:**

- `veri/harita.json` — 81 il geometrisi (847 KB)
- `veri/parcalar.json` — 193 parça, geometri + nüfus/ekonomi payları (1.58 MB)
- `veri/parca-komsuluk.json` — parça komşuluk grafiği, il grafiğiyle doğrulanmış, 0 aykırılık
- `veri/URETIM-NOTU.md` — üretim kayıtları
- Expo uygulamasında çalışan parça haritası: yakınlaştırma, kaydırma, seçim, komşu vurgulama, arazi/bölge/il renk modları
- `onizleme/harita.html`, `onizleme/parca.html`

**Eksik olan tek kritik şey:** `veri/iller.json` — 81 ilin 8 statı. Bu dosya yok olduğu için **hiçbir parça hiçbir şey üretmiyor**. Sebebi şu: parçanın kendi statı yoktur, parçanın ürettiği = ilin statı × parçanın payı. Paylar var, il statları yok.

---

## 2. GÖREVİN KAPSAMI

### Yapılacak

1. Parçanın temel birim olduğu kararını belgelere işle
2. Uygulamayı gerçek telefonda test et
3. Belge–veri arasındaki 195/193 farkını çöz ve kaydet
4. `veri/iller.json` üret — 8 stat, 81 il
5. `veri/komsuluk.json` kaydet
6. Parça panelini il statlarıyla birleştir

### Yapılmayacak — bu görevin dışında

- Ekonomi hesabı, tur döngüsü, kaynak üretimi
- Ordu, birim, muharebe, fetih
- Yapay zekâ, diplomasi, rekabet olayları
- Yeni harita özelliği, yeni renk modu, yeni ikon

**Bu görev veri ve doğrulama görevidir, oyun mekaniği görevi değildir.** Görev 01'de kapsam kendiliğinden büyüdü. Bu sefer büyümesin. Bir şeyin "madem buradayım" mantığıyla eklenmesi gerektiğini düşünüyorsan **önce Baki'ye sor**.

---

## 3. KAYNAK BELGELER

- `docs/il-savasi-tasarim.md` — ana tasarım. Bu görev için §5 (il özellikleri), §3.5 (arazi çarpanları), §7 (harita ve kontrol) geçerli.
- `docs/il-savasi-parca-bolumleme-v2.md` — 193/195 parça bölümlemesi ve payları.
- `veri/URETIM-NOTU.md` — kendi önceki üretim kayıtların.

Belgelerde çelişki veya eksik görürsen kendi kararınla doldurma, Baki'ye bildir.

---

## 4. İŞ ADIMLARI

Her adımın sonunda **dur ve Baki'ye göster**. Ayrıntı için §7'ye bak.

---

### ADIM 1 — Kararı belgelere işle

Tasarım §7 "haritada yalnızca iller görünür, parça görünmez bir kontrol çubuğudur" diyor. Uygulama ise parçayı temel birim olarak kurdu. **Karar verildi: parça temel birimdir, bu doğrudur, geri dönülmeyecek.**

Gerekçe: parça belgesi her parçaya kendi arazisini ve kendi payını veriyor. Arazi muharebe çarpanına giriyor (§3.5). Yani muharebenin hangi parçada geçtiği hesaba giriyor demektir; bu da parçanın haritada gerçek bir bölge olmasını zorunlu kılar.

**Yapılacak:**

`docs/il-savasi-tasarim.md` §7'yi güncelle. Yeni hali şu üç şeyi net söylesin:

- **Temel birim parçadır.** Haritada parçalar görünür ve dokunulabilir. Ordu parçadan parçaya hareket eder, muharebe parçada geçer.
- **İl, gruplama ve stat taşıma katmanıdır.** 8 stat ilde durur. Bir ilden alınan üretim = elde tutulan parçaların pay toplamı × il statı.
- **Bir il, tüm parçaları alınınca el değiştirir.** Eski "görünmez kontrol çubuğu" kavramı kalktı; çubuğun yerini gerçek parça fetihleri aldı.

Değişikliği yapmadan önce §7'nin eski halini `URETIM-NOTU.md`'ye kaydet — hangi kuralın neden değiştiğinin izi kalsın.

**Baki'nin kontrolü:** Güncellenen §7'yi okusun, kastettiği şey bu mu?

---

### ADIM 2 — Gerçek telefonda test

Uygulama şimdiye kadar yalnızca tablette denendi. **Hedef platform telefondur.** Telefon ekranı küçük, işlemcisi zayıf, 193 poligon 81 ilin iki katından fazla yüktür.

Baki'ye telefonunda nasıl açacağını anlat (Expo Go, karekod, aynı ağda olma şartı). Şunları test ettir:

| Test | Beklenen |
|---|---|
| Harita akıcılığı | Yakınlaştırma ve kaydırma takılmadan çalışıyor |
| Dokunma isabeti | Küçük parçalara (Yalova, Kilis) parmakla dokunulabiliyor |
| Etiket okunabilirliği | İl adları küçük ekranda okunuyor veya uygun şekilde gizleniyor |
| HUD yerleşimi | Renk modu düğmeleri küçük ekranda taşmıyor, haritayı fazla kapatmıyor |
| Bilgi kartı | Küçük ekranda okunaklı, haritanın çoğunu kapatmıyor |
| Açılış süresi | Uygulama makul sürede açılıyor |

**Kasma çıkarsa çözüm sırası şu — bu sırayı bozma:**

1. Uzaklaşınca parça çizme, il çiz; belirli bir yakınlaşma seviyesinden sonra parçaya geç. (`harita.json` bunun için elde tutuluyor.)
2. Sadeleştirmeyi artır — parça geometrisini biraz daha kabalaştır.
3. Çizim tarafında iyileştirme.

Kod karmaşıklaştırmaya en son git.

**Dokunma isabeti sorun çıkarırsa:** en küçük parçalar için dokunma alanını görsel şeklinden biraz geniş tut. Parmak ucu piksel hassasiyetinde değildir.

**Baki'nin kontrolü:** Telefonunda tablettekiyle aynı akıcılıkta mı, küçük illere dokunabiliyor mu?

---

### ADIM 3 — 195/193 farkını çöz

Parça belgesi 195 parça diyor, üretilen veri 193 parça içeriyor. `URETIM-NOTU.md`'de "birleştirme, kopuk kara temizliği" geçiyor ama iki parçanın kaybı net kayıtlı değil.

**Yapılacak:**

1. Hangi iki parçanın (veya hangi birleştirmelerin) sonucu 195'ten 193'e düşürdüğünü tespit et.
2. Her biri için gerekçeyi yaz — hangi il, hangi parça, hangi ilçeler, neden birleşti.
3. `URETIM-NOTU.md`'ye kalıcı olarak kaydet.
4. `docs/il-savasi-parca-bolumleme-v2.md`'yi güncelle: toplam sayı, dağılım tablosu, bölge özeti, arazi dağılımı. Belge ile veri aynı sayıyı söylesin.

Değişiklik yanlışsa (yani birleştirme hatalıysa) belgeyi değil veriyi düzelt. Hangisinin doğru olduğuna karar veremiyorsan Baki'ye sor.

**Baki'nin kontrolü:** Hangi iki parça birleşti, gerekçe makul mü?

---

### ADIM 4 — `veri/iller.json` üret (asıl iş)

Bu görevin merkezi. 81 il için 8 stat. **Bu veri hiçbir belgede yok, sen üreteceksin.**

#### Statlar

| # | Stat | Aralık | Kaynak |
|---|---|---|---|
| 1 | Nüfus | 1–10 | Gerçek nüfus verisi |
| 2 | Ekonomi | 1–10 | İl bazlı gayrisafi hasıla veya kişi başı gelir |
| 3 | Eğitim | 1–10 | Tahmin |
| 4 | Sanayi | 1–10 | Tahmin |
| 5 | Altyapı | 1–10 | Tahmin |
| 6 | Moral | 1–10 | Tahmin |
| 7 | Arazi | ova / tepelik / daglik | `parcalar.json`'dan türetilir |
| 8 | Parça sayısı | 1–5 | `parcalar.json`'dan sayılır |

#### Ölçekleme — dikkat

Nüfusta doğrusal ölçekleme kullanma. İstanbul yaklaşık 16 milyon, Bayburt 85 bin — doğrusal ölçekte İstanbul 10, ikinci sıradaki il 3 civarı, geri kalan 78 il 1'e ezilir. Oyun tek ile karşı 80 ilin yığıldığı bir şeye döner.

**Logaritmik ölçekleme kullan.** (Logaritmik ölçekleme = büyük sayılar arasındaki farkı sıkıştıran, küçükler arasındaki farkı koruyan ölçekleme. Örnek: 16 milyon ile 8 milyon arası 1 puan fark yaratırken, 200 bin ile 100 bin arası da 1 puan fark yaratır.) Sonuç İstanbul 10, Ankara/İzmir 8–9, orta iller 4–6, küçük iller 1–2 civarında dağılsın.

Ekonomide de aynısı geçerli. Hangi formülü kullandığını `URETIM-NOTU.md`'ye yaz.

#### Arazi türetme

Parça belgesi her parçaya ova/tepelik/dağlık atıyor ve ekonomi payını veriyor. İlin arazisi = **ekonomi payına göre ağırlıklı baskın arazi.**

Örnek — Bursa: 0.52 ova + 0.13 ova + 0.31 tepelik + 0.04 dağlık → ova ağırlığı 0.65 → Bursa **ova**.

Bu veri zaten `parcalar.json`'da olduğu için hesap otomatik yapılabilir.

#### Veri erişimi

Nüfus ve ekonomi verisine ağdan erişemezsen **uydurma.** İki seçeneğin var:

- Baki'ye tam olarak hangi kaynaktan hangi veriyi indirip nereye koyacağını söyle.
- Ya da kendi bilgindeki yaklaşık değerleri kullan — **ama bu durumda o sütunu açıkça "yaklaşık, doğrulanmadı" diye işaretle** ve `URETIM-NOTU.md`'ye yaz.

Rastgele sayı üretmek en kötü seçenektir: veri gerçek görünür, oyun çalışır, hata aylar sonra ortaya çıkar.

#### Tahmin statlarının işaretlenmesi — zorunlu

Eğitim, sanayi, altyapı ve moral tahmindir. `URETIM-NOTU.md`'ye şu cümle aynen girsin:

> **Eğitim, sanayi, altyapı ve moral statları ilk taslaktır. Gerçek veriye değil tahmine dayanır. Oyun dengesi test edilirken elle ayarlanacaktır.**

Bu sayıları kesin veriymiş gibi sunma.

#### Dosya biçimi

```js
// veri/iller.json
{
  "34": {
    "kod": "34",
    "ad": "İstanbul",
    "bolge": "Marmara",
    "arazi": "ova",
    "parcaSayisi": 3,
    "statlar": {
      "nufus": 10,
      "ekonomi": 10,
      "egitim": 9,
      "sanayi": 9,
      "altyapi": 10,
      "moral": 6
    }
  }
}
```

İl kodu her yerde **iki haneli metin** olsun (`"01"`, `"34"`). Sayıya çevirirsen `01` → `1` olur ve eşleştirmeler bozulur.

#### Doğrulama

- 81 il eksiksiz, kodlar 01–81
- Tüm statlar 1–10 aralığında, tam sayı
- Arazi değerleri yalnızca `ova` / `tepelik` / `daglik`
- Parça sayıları toplamı `parcalar.json`'daki toplamla aynı
- Her ilin adı ve bölgesi harita verisiyle eşleşiyor

**Baki'nin kontrolü:** Şu illere baksın — İstanbul, Rize, Konya, Bayburt, Gaziantep, Tunceli. Sayılar sezgisine uyuyor mu? Bu tablo oyunun dengesinin temeli, gözle onaylanması şart.

---

### ADIM 5 — `veri/komsuluk.json` kaydet

Küçük iş. İl komşuluk grafiği parça doğrulamasında kullanıldı ama ayrı dosya olarak kaydedilmedi. Kaydet.

Artık oyun kuralı değil (bir il yalnızca sınırdaşına saldırabilir kuralının yerini parça komşuluğu aldı), ama iki işi var: ileride harita uzaklaşınca il seviyesi gösterim, ve parça verisi değişirse hata yakalama.

**Doğrulama:** Simetri, komşusuz il yok, kendi kendine komşuluk yok, tekrar eden çift yok.

**Elle kontrol — bunlar tutuyorsa grafik sağlamdır:**

| İl | Beklenen komşuları |
|---|---|
| Yalova | Bursa, Kocaeli |
| Kilis | Gaziantep, Hatay |
| Bartın | Zonguldak, Karabük, Kastamonu |
| Rize | Trabzon, Bayburt, Erzurum, Artvin |
| İstanbul | Tekirdağ, Kırklareli, Kocaeli |
| Sinop | Kastamonu, Çorum, Samsun |

**Baki'nin kontrolü:** Altı örnek tutuyor mu?

---

### ADIM 6 — Paneli birleştir

Mevcut parça kartı yalnızca parça bilgisi gösteriyor. `iller.json` hazır olduğuna göre il bilgisi de girsin. Görev 01'in il paneli ile parça kartı **tek panelde** birleşir.

Bir parçaya dokununca açılacak panel:

**Parça bölümü**
- Parça adı ve bağlı olduğu il
- Arazi tipi + savunma çarpanı (ova ×1.00 / tepelik ×1.15 / dağlık ×1.35, tasarım §3.5)
- Nüfus payı ve ekonomi payı — yüzde olarak ("bu parça ilin nüfusunun %35'ini taşıyor")
- Komşu parça listesi, isimleriyle. **İsme dokununca o parçaya geçilir.**

**İl bölümü**
- İl adı, kodu, bölge
- 8 stat, sayı **ve** küçük çubuk grafikle. Sayı tek başına soyut kalır; çubuk "bu il diğerlerine göre nerede" sorusunu anında cevaplar.
- Parça sayısı + tek satır açıklama: "Bu ili tamamen almak için 5 parçasını da almak gerekir."

**Türetilmiş satır — bu önemli**
- "Bu parça ele geçirilirse: ilin nüfusunun %35'i, ekonomisinin %32'si"
- Hesap: parçanın payı × ilin statı. Oyunun ana formülü bu; panelde görünmesi hem Baki'nin doğrulaması hem ileride oyuncunun karar vermesi için gerekli.

**Panel kuralları:**
- Telefon ekranında okunaklı olsun, haritanın çoğunu kapatmasın
- Aşağı kaydırma veya haritanın boş bir yerine dokunma ile kapansın
- **Oyun mantığı koyma** — ordu, üretim, saldır düğmesi yok. Yalnızca bilgi gösterimi.

**Baki'nin kontrolü:** Telefonda panel okunaklı mı, komşu listesinden gezinme çalışıyor mu, türetilmiş satırdaki yüzdeler doğru mu?

---

## 5. RENK VE BİÇİM

Renkler `src/tema.js` dosyasında tek yerde toplu kalsın. Kod içine renk kodu gömme. Yeni renk gerekiyorsa oraya ekle.

Panel için yeni bir görsel dil icat etme; mevcut HUD ve bilgi kartıyla aynı görünsün.

---

## 6. DOSYA YAPISI — GÖREV SONU

```
il-savasi/
├── docs/
│   ├── il-savasi-tasarim.md              <- §7 güncellendi
│   ├── il-savasi-parca-bolumleme-v2.md   <- 193'e güncellendi
│   ├── GOREV-01-harita.md
│   └── GOREV-02-il-statlari.md           <- bu dosya
├── veri/
│   ├── ham/
│   ├── iller.json                        <- YENİ
│   ├── komsuluk.json                     <- YENİ
│   ├── harita.json
│   ├── parcalar.json
│   ├── parca-komsuluk.json
│   └── URETIM-NOTU.md                    <- güncellendi
├── scripts/
├── onizleme/
└── src/
    ├── bilesenler/
    └── tema.js
```

---

## 7. ÇALIŞMA KURALLARI

**Adım adım git, her adımın sonunda dur.** Altı adımı tek seferde yapıp "bitti" deme. Her adımın sonunda:

1. Ne yaptığını iki üç cümleyle özetle
2. Baki'nin **tam olarak ne yapacağını** söyle — hangi komut, hangi dosya, telefonda neye bakacak
3. Neyin doğru görünmesi gerektiğini söyle
4. Onay al, sonra devam et

**Kapsamı büyütme.** Görev 01'de kapsam kendiliğinden büyüdü ve görev 01'in asıl teslimatı yarım kaldı. Bu sefer olmasın. Sıradaki adımın mantıklı görünmesi onu bu görevin parçası yapmaz. Fazladan bir şey yapman gerektiğini düşünüyorsan **dur ve sor.**

**Uydurma.** Erişemediğin veriyi tahmin edip gerçekmiş gibi sunma. Erişemediğini söyle ve Baki'den iste.

**Takıldığında.** İkinci başarısız denemeden sonra durumu anlat: ne denedin, ne oldu, hangi seçenekler var. Beş yöntemi arka arkaya deneyip Baki'yi karanlıkta bırakma.

**`URETIM-NOTU.md`'yi her adımda güncelle**, sonda toplu yazmaya bırakma.

---

## 8. GÖREV BİTİŞ ÖLÇÜTÜ

- [ ] Tasarım §7 güncellendi, parça temel birim olarak yazıldı, eski hali kayıtlı
- [ ] Uygulama gerçek telefonda test edildi, akıcı çalışıyor
- [ ] Küçük parçalara telefonda parmakla dokunulabiliyor
- [ ] 195/193 farkı tespit edildi, gerekçelendirildi, belge güncellendi
- [ ] `veri/iller.json` var — 81 il, 8 stat, doğrulamalar geçiyor
- [ ] Tahmin olan statlar `URETIM-NOTU.md`'de açıkça işaretli
- [ ] `veri/komsuluk.json` var, altı elle kontrol örneği tutuyor
- [ ] Panel parça + il bilgisini birlikte gösteriyor
- [ ] Panelde "bu parça alınırsa ne kazanılır" satırı doğru hesaplıyor
- [ ] Komşu parça listesinden gezinme çalışıyor
- [ ] `URETIM-NOTU.md` güncel

---

## 9. SONRAKİ GÖREV (bilgi amaçlı — bunu yapma)

**Görev 03 — Ekonomi ve tur döngüsü.** Her tur, elde tutulan parçaların paylarından nüfus ve ekonomi puanı toplanacak. Bu görevin çıktısı olan `iller.json` doğrudan o hesabın girdisidir.

Kod yazarken bu yönü akılda tut — `iller.json` ileride sahiplik ve üretim alanları taşıyacak şekilde genişletilebilir olsun. Ama şimdiden o alanları ekleme.
