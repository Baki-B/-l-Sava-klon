# GÖREV 03 — BELGE SENKRONU, SAHİPLİK, EKONOMİ VE TUR DÖNGÜSÜ

> Bu dosya `GOREV-03-ekonomi.md`'nin yerini alır. Eski dosyayı kullanma.
> Baştan sona oku, sonra §9'daki düzene uyarak işe başla.

---

## 0. KİMİNLE ÇALIŞIYORSUN

Kullanıcının adı **Baki**. Oyunun tasarımcısı ve sahibi. **Yazılımcı değil.** Kod okumayacak, hata mesajlarını yorumlayamaz.

- Komutları satır satır, kopyalanabilir biçimde ver.
- Teknik terim kullanacaksan yanına tek cümlelik Türkçe karşılık koy.
- Ne yaptığını değil, **Baki'nin ekranda ne göreceğini** anlat.
- Teknik bir karar sorman gerekirse seçenekleri sonuçlarıyla anlat.
- Türkçe konuş.

---

## 1. BU GÖREV NE YAPIYOR

Haritada duran 193 parça şu an ölü veri. Bu görev sonunda **her parçanın bir sahibi olacak ve her tur sahibine kaynak üretecek.** Oyunun kalbi burada atmaya başlar.

Tasarım §2'deki temel prensibin ilk yarısı burada gerçek oluyor:

```
İl özellikleri → kaynak üretimi → ordu inşası → MUHAREBE
     (var)          (BU GÖREV)      (Görev 04)    (Görev 05)
```

Ayrıca bu görev **belgelerdeki gecikmiş dört kararı** koda ve dokümana işliyor. Bu iş ertelenirse her yeni görev bir hata daha üretir.

---

## 2. ÖNCEKİ DURUM — NEREDEN DEVRALIYORSUN

Görev 01 ve 02 tamamlandı.

**Hazır veriler:**

- `veri/parcalar.json` — 193 parça, geometri + nüfus/ekonomi payları
- `veri/parca-komsuluk.json` — parça komşuluk grafiği, 0 aykırılık
- `veri/iller.json` — 81 il, 8 stat
- `veri/komsuluk.json`, `veri/harita.json`
- `veri/URETIM-NOTU.md`

**Hazır arayüz:**

- Telefonda çalışan parça haritası: yakınlaştırma, kaydırma, seçim, komşu vurgulama
- Renk modları (il / arazi / bölge), il sınırı aç-kapa, vektör ikonlar
- Birleşik parça+il paneli, komşu gezinme
- **Askeri arayüz + tur HUD iskeleti** — Görev 02'de fazladan kuruldu

**Tur HUD hakkında uyarı:** İskelet muhtemelen yer tutucu (sahte) sayılarla dolu. Bu görevin işi o sayıları gerçek hesaba bağlamak. Sahte kalan tek bir sayı bırakma; bırakırsan Baki ekranda gerçek sanıp yanlış karar verir.

---

## 3. BELGEDE OLMAYAN DÖRT KARAR — OKU, ÖNEMLİ

Baki 23 Temmuz'daki tasarım oturumunda dört karar verdi. Bunlar `il-savasi-tasarim.md`'ye **işlenmedi**. Belge bu yüzden bazı yerlerde eskimiş durumda. Adım 0 bunları kapatıyor.

### Karar 1 — Sabit maç süresi kalktı, mod sistemi geldi

§8'deki "Hedef maç süresi: 20–30 dakika" artık geçersiz. Yerine:

| Mod | Kapsam | Kazanma koşulu |
|---|---|---|
| Bölge savaşı | Tek coğrafi bölge (ör. Karadeniz, 18 il) | Bölgenin tamamı |
| Türkiye | 81 il | Son ayakta kalan / il eşiği |
| Serbest | Oyuncu seçer | Tur limiti veya eşik |

**İki sonucu var:**

- **Kayıt/yükleme çekirdek özellik oldu.** Para kazanma katmanındaki "kayıt yuvası satmak" fikri geçerliliğini yitirdi — uzun maçlar tek oturumda bitmez, kayıt olmadan oyun oynanamaz.
- **Sıcak koltuk uzun maçta zorlanır.** İki kişinin saatlerce aynı telefonu paslaması gerçekçi değil. Asenkron çevrimiçi (herkes kendi zamanında hamle yapar) "ilgi gelirse" kategorisinden çıkıp v1.5 planına girdi.

### Karar 2 — Oran seçici kalktı, doğrudan birim satın alma geldi

§4.2 (tarif sistemi) ve §4.3 (statlar harmanlanmamalıdır uyarısı) **tamamen geçersiz.** §4.3'teki tehlike zaten oran seçicinin yarattığı bir tehlikeydi; oran seçici gidince tehlike de gitti.

Yeni üretim ekranı (Görev 04'te yapılacak, burada değil):

```
Bütçe:  18 nüfus   /   14 ekonomi

Piyade   [3 nüfus / 1 ekonomi]   [−]  4  [+]
Topçu    [2 nüfus / 3 ekonomi]   [−]  1  [+]
Zırhlı   [1 nüfus / 6 ekonomi]   [−]  1  [+]
                                 ─────────────
Kalan:   4 nüfus / 4 ekonomi     [ ÜRET ]
```

§4.5'teki "hangi il hangi orduyu doğurur" tablosu **silinmiyor, statüsü değişiyor**: artık oyuncuya dayatılan bir kural değil, kendiliğinden çıkması beklenen bir sonuç ve yapay zekânın üretim referansı.

### Karar 3 — Altyapı statı kalktı

§5'teki "6. Altyapı / ulaşım → hareket menzili, takviye hızı" statı **çıkarıldı.** Gerekçe: parçalar haritada fiziksel bölge olunca altyapı gereksizleşti. Beş parçalı bir ili baştan sona geçmek zaten beş tur sürüyor — altyapının taklit ettiği şey tam olarak buydu.

**Sonuç: 8 stat değil 7 stat.** `veri/iller.json` Görev 02'de 8 statla üretildi, biri fazla.

### Karar 4 — Parça haritada fiziksel bölgedir

Görev 02'de zaten uygulandı ve §7 güncellendi. Buraya tamamlık için yazıldı.

---

## 4. KAPSAM

### Yapılacak

0. Belge senkronu — dört kararı işle, `iller.json`'dan altyapıyı çıkar
1. Denge dosyası + tohumlu rastgelelik altyapısı
2. Oyun durumu + senaryo kapsamı
3. Üretim hesabı + doğrulama testleri
4. Tur döngüsü iskeleti
5. Kayıt/yükleme
6. HUD'ı gerçek sayılara bağlama
7. Panele üretim bilgisi ekleme
8. Sahiplik test aracı

### Yapılmayacak — bu görevin dışında

- **Ordu, birim, üretim ekranı** (Görev 04)
- **Muharebe, saldırı, hareket** (Görev 05)
- Yapay zekâ, diplomasi, rekabet olayları, araştırma
- Mod seçim ekranı, ana menü, senaryo tarayıcısı
- Kazanma koşulu kontrolü
- Ses, animasyon, yeni renk modu, yeni ikon

**Kaynak birikecek ama harcanacak yer olmayacak.** Bu tuhaf gelebilir, doğrusu budur. Tasarım §15'in sırası bu: önce ekonomi, sonra ordu. Kaynağın doğru biriktiğini görmek bu görevin başarı ölçütüdür. "Madem para var, ordu da yapayım" **yapma.**

> **Kapsam uyarısı — ciddiye al.** Görev 01 ve 02'de kapsam iki kez kendiliğinden büyüdü. Görev 01'in asıl teslimatları bu yüzden yarım kaldı. Sıradaki adımın mantıklı görünmesi onu bu görevin parçası yapmaz. Fazladan bir şey gerektiğini düşünüyorsan **dur ve Baki'ye sor.**

---

## 5. KAYNAK BELGELER

- `docs/il-savasi-tasarim.md` — §2 (temel prensip), §4.1 (iki para birimi), §5 (il özellikleri), §7 (harita, güncellendi), §8 (tur döngüsü), §12 (para kazanma), §14 (denge düğmeleri)
- `docs/il-savasi-parca-bolumleme-v2.md` — parça payları
- `veri/URETIM-NOTU.md`

Belgede çelişki veya eksik görürsen kendi kararınla doldurma, Baki'ye bildir.

---

## 6. TASARIM KARARLARI — BUNLARI SORMA, UYGULA

### 6.1 Başlangıç durumu

Oyun başında **her il bağımsız bir aktördür.** Her il kendi parçalarının sahibidir. İttifak yok, imparatorluk yok.

Türkiye modunda 81 aktör, bölge modunda o bölgenin il sayısı kadar aktör olur.

### 6.2 Sahiplik parça düzeyindedir

İlin sahibi diye bir alan **yok.** Sahiplik her parçada tutulur. Bir il "senin" ise bu, o ilin tüm parçalarının sahibinin sen olduğun anlamına gelir — türetilmiş bilgidir, ayrıca saklanmaz.

Sebep: yarı fethedilmiş il olağan durumdur. İki ayrı kaynak (ilin sahibi + parçanın sahibi) tutarsan er geç birbiriyle çelişirler ve hangisinin doğru olduğunu anlamak imkânsızlaşır.

### 6.3 Üretim formülü

Tasarım §4.1: nüfus ilin nüfus özelliğinden, ekonomi puanı ilin ekonomi özelliğinden her tur gelir. Parçalı sahiplikte:

```
Bir aktörün tur başına nüfus geliri =
    Σ (elde tuttuğu her parça için)
        parçanın nüfus payı × parçanın ilinin nüfus statı × URETIM_CARPANI

Bir aktörün tur başına ekonomi geliri =
    Σ (elde tuttuğu her parça için)
        parçanın ekonomi payı × parçanın ilinin ekonomi statı × URETIM_CARPANI
```

**Örnek:** Bursa'nın nüfus statı 8. Bursa Ovası parçasının nüfus payı 0.55. Çarpan 1 ise bu parça sahibine tur başına 8 × 0.55 = **4.4 nüfus** getirir. Bursa'nın dört parçasının hepsi elindeyse toplam 8 × 1.00 = **8 nüfus**.

**Başlangıç çarpanı: 1.** `src/denge.js`'te adlandırılmış sabit olarak dursun, koda gömme.

**Kalibrasyon notu:** Tasarım §4.5'teki bütçeler (kalabalık il 24 nüfus / 8 ekonomi, dengeli il 12/12) **bir turun geliri değil, birikmiş bütçedir.** Çarpan 1 ile bu bütçelere birkaç turda ulaşılır. Beklenen davranış budur. İlk turlarda gelir çok yavaş gelirse çarpan yükseltilir — bu bir denge düğmesidir (§14).

### 6.4 Kesirli birikim — dikkat

Paylar kesirli (0.55), statlar tam sayı (8), çarpım kesir çıkarır (4.4).

**Kesirli değeri sakla, gösterirken yuvarla.** Her tur 4.4'ü 4'e yuvarlarsan tur başına 0.4 kaybolur; 50 turda 20 kaynak buhar olur ve Baki bunu asla fark etmez. Havuz kesirli olsun, ekran tam sayı göstersin.

Aynı mantık tasarım §3.4'teki hasar havuzunda da var: kesir birikir, atılmaz.

### 6.5 Tohumlu rastgelelik — şimdi kurulmalı

Oyunda henüz rastgelelik yok, ama Görev 05'te muharebeye ±%10 şans bandı geliyor (§3.6).

**`Math.random()` kullanma. Tohumlu bir rastgele sayı üreteci kur.** (Tohum = rastgeleliği başlatan sayı. Aynı tohum aynı sayı dizisini üretir, yani oyun tekrar oynandığında aynı sonuç çıkar.)

Neden şimdi:

- **Hata ayıklama.** "Şu muharebe garip bitti" dediğinde aynı durumu tekrar üretebilmek gerekir. Tohumsuz sistemde bu imkânsızdır.
- **Kayıt/yükleme.** Kaydedip yüklediğinde oyun aynı şekilde devam etmeli.
- **Asenkron çok oyunculu (v1.5).** İki cihazın aynı hamleden aynı sonucu çıkarması şart. Bu, sonradan eklenebilecek bir şey değildir — rastgelelik koda dağılmışsa hepsini tek tek bulup değiştirmek gerekir.

Tohum `oyunDurumu`'nda saklanır, üretecin durumu her turda kayda girer. Rastgelelik gereken her yer tek bir modülden geçer.

### 6.6 Oyun durumu serileştirilebilir olmalı

Kayıt/yükleme çekirdek özellik olduğuna göre (Karar 1), `oyunDurumu` baştan **düz veriden** oluşmalı: sayı, metin, dizi, nesne. Fonksiyon yok, sınıf örneği yok, harita geometrisine referans yok.

**Kayıt dosyasına geometri girmemeli.** `parcalar.json` 1.58 MB; kayıt dosyası parça kimliklerini tutar, şekillerini değil. Kayıt dosyası birkaç on KB'ı geçmemeli.

Duruma bir **sürüm alanı** koy (`surum: 1`). İleride yapı değişince eski kayıtları okuyup çevirebilmek için gerekli.

### 6.7 Kaynak üst sınırı yok

Şimdilik biriken kaynağa tavan koyma. Harcama yeri olmadığı için sınırsız birikecek; sorun değil, bu görevin amacı birikimin doğruluğunu görmek.

---

## 7. İŞ ADIMLARI

Her adımın sonunda **dur ve Baki'ye göster.**

---

### ADIM 0 — Belge senkronu ve altyapı temizliği

§3'teki dört kararı belgelere ve veriye işle.

**0a. `docs/il-savasi-tasarim.md` güncellenecek:**

| Bölüm | Yapılacak |
|---|---|
| §4.2 | Tarif/oran sistemi silinsin, yerine doğrudan birim satın alma yazılsın (§3, Karar 2'deki ekran taslağı) |
| §4.3 | **Tamamen silinsin.** "Statlar harmanlanmamalıdır" uyarısı oran seçiciye özeldi, konu kapandı. |
| §4.5 | Tablo kalsın, üstüne not: "Oyuncuya dayatılan kural değil; beklenen sonuç ve yapay zekânın üretim referansı." |
| §5 | Altyapı statı silinsin. Başlık "8 STAT" → **"7 STAT"**. Numaralandırma düzeltilsin. |
| §8 | "Hedef maç süresi 20–30 dakika" silinsin, yerine mod tablosu (§3, Karar 1) |
| §12 | "Kayıt yuvası genişletme" satılabilirler listesinden çıksın — kayıt artık çekirdek özellik |
| §13.1 | Asenkron çevrimiçi "ilgi gelirse" değil, v1.5 planı olarak yazılsın |
| §13.3 | v1 kapsamından oran seçici ve altyapı çıksın; kayıt/yükleme girsin |
| §15 | 3. madde "tarif sistemi" → "doğrudan birim satın alma"; 8. madde "oran seçici" → "üretim ekranı" |
| Sözlük | "Tarif (recipe)" satırı silinsin |

**0b. `veri/iller.json`'dan `altyapi` alanı çıkarılacak.** Doğrulama: 81 ilin hiçbirinde altyapı alanı kalmamalı, kalan 6 sayısal stat (nüfus, ekonomi, eğitim, sanayi, moral + arazi + parça sayısı) yerinde olmalı.

**0c. Arayüzdeki altyapı gösterimi kaldırılacak.** Panelde 8 stat çubuğu varsa 7'ye insin.

**0d. Mevcut arayüz envanteri.** Görev 02'de kurulan askeri arayüz ve tur HUD'ında **hangi alanların sahte/yer tutucu olduğunu listele.** Bu listeyi Baki'ye göster; Adım 6'da hepsi ya gerçeğe bağlanacak ya kaldırılacak.

**0e. `URETIM-NOTU.md`'ye kaydet:** hangi karar, hangi bölümü nasıl değiştirdi, altyapı verisi ne zaman silindi.

**Baki'nin kontrolü:** Güncellenen §4, §5 ve §8'i okusun. Kastettiği kararlar bunlar mı? Sahte alan listesi neye benziyor?

---

### ADIM 1 — Denge dosyası ve rastgelelik altyapısı

**`src/denge.js`** oluştur. Kural: **oyun dengesini etkileyen hiçbir sayı kodun içine gömülmez, buraya yazılır.**

Başlangıç içeriği:

```js
export const DENGE = {
  URETIM_CARPANI: 1,        // §6.3 — tur başına gelir çarpanı
  GELISTIRICI_MODU: true,   // Adım 8'deki test aracını açar
  TUR_GECMISI_UZUNLUGU: 50  // kaç turluk gelir kaydı tutulacak
};
```

Tasarım §14'teki denge düğmeleri sonraki görevlerde buraya eklenecek. Dosyanın başına o listeyi yorum olarak koy — nereye ne geleceği belli olsun.

**`src/oyun/rastgele.js`** oluştur. §6.5'teki tohumlu üreteç. Basit ve yeterli bir algoritma seç (mulberry32, xorshift gibi); kriptografik güvenlik gerekmiyor, **tekrarlanabilirlik** gerekiyor.

Üretecin sağlaması gereken:
- Tohumdan başlatılır
- Durumu okunup yazılabilir (kayıt için)
- Aynı tohum + aynı çağrı sırası = aynı sayı dizisi

**Doğrulama:** Aynı tohumla iki üreteç kur, ilk 100 sayıyı karşılaştır — birebir aynı olmalı.

**Baki'nin kontrolü:** Test geçti mi? (Bu adımda ekranda bir değişiklik olmayacak, normal.)

---

### ADIM 2 — Oyun durumu ve senaryo kapsamı

Oyunun o anki durumunu tutan **tek merkezi yapı** kur. Dağıtık halde tutma.

```js
// oyunDurumu
{
  surum: 1,
  tur: 1,

  senaryo: {
    ad: "Türkiye",
    kapsamIller: ["01", "02", ...],   // oyuna dahil il kodları
    kapsamParcalar: ["16-1", ...]     // türetilir, kolaylık için saklanır
  },

  rastgele: {
    tohum: 123456,
    durum: 123456                      // üretecin o anki durumu
  },

  oyuncuAktorId: "16",

  aktorler: {
    "16": {
      id: "16",
      ad: "Bursa",
      renk: "#c0392b",
      nufusHavuzu: 0,                  // kesirli saklanır
      ekonomiHavuzu: 0,                // kesirli saklanır
      tur: "insan"                     // insan | yapayZeka
    }
  },

  parcaSahipligi: {
    "16-1": "16",                      // parça kimliği -> aktör kimliği
    "16-2": "16"
  },

  turGecmisi: [
    { tur: 1, aktorId: "16", nufus: 8.0, ekonomi: 7.2 }
  ]
}
```

Parça kimliği `parcalar.json`'daki neyse o kullanılsın; yeni bir kimlik şeması icat etme.

**Senaryo kapsamı — bu görevin en faydalı eklentisi.** İki hazır senaryo tanımla:

| Senaryo | Kapsam | Ne işe yarar |
|---|---|---|
| `turkiye` | 81 il, 193 parça | Asıl oyun |
| `karadeniz` | Karadeniz bölgesi, 18 il, 35 parça | **Test için.** 193 parçayla hata aramak zordur, 35 parçayla kolaydır. |

Bölge bilgisi `iller.json`'da zaten var (`bolge` alanı), yani bölge senaryosu basit bir süzmeden ibaret.

**Sınırlar — bunları yapma:** Mod seçim ekranı yok, kazanma koşulu kontrolü yok, senaryo düzenleyici yok. Senaryo şimdilik `denge.js`'ten veya kod içinden seçilir.

**Kapsam dışı parçalar haritada soluk gösterilsin** ve seçilemesin. Karadeniz senaryosunda Antalya'ya dokunulmamalı.

**Başlangıç kurulumu:** Senaryodaki her il için bir aktör üret, her parçayı kendi iline ata. Aktör renkleri `src/tema.js`'ten gelsin.

**Yapı geleceğe hazır olsun** — ileride ordular, ittifaklar, araştırma buraya eklenecek. Ama **şimdiden o alanları ekleme**, boş bile olsa.

**Baki'nin kontrolü:** Karadeniz senaryosunu açsın — 18 il renkli, geri kalan Türkiye soluk mu? Türkiye senaryosunda 81 aktör oluştu mu?

---

### ADIM 3 — Üretim hesabı

§6.3'teki formülü uygula. Bir fonksiyon: aktör kimliği al, o turki nüfus ve ekonomi gelirini döndür.

**Doğrulama testleri — hepsi geçmeli:**

| # | Test | Beklenen |
|---|---|---|
| 1 | Tam sahiplik | Bir ilin tüm parçaları tek aktördeyse gelir = ilin statı × çarpan (pay toplamı 1.00) |
| 2 | Kısmi sahiplik | Bursa Ovası tek başına (nüfus payı 0.55, il statı 8) → 4.4 |
| 3 | Sıfır sahiplik | Hiç parçası olmayan aktörün geliri 0 |
| 4 | **Toplam korunumu** | Tüm aktörlerin gelir toplamı = senaryodaki tüm illerin stat toplamı × çarpan |
| 5 | Kapsam dışı sızıntı | Karadeniz senaryosunda Antalya'nın parçaları hiçbir toplama girmiyor |
| 6 | Kesir korunumu | 4.4 gelirli aktör 10 tur sonra 44 birikmiş olmalı, 40 değil |

**4. test en önemlisi:** sahiplik nasıl dağılırsa dağılsın toplam üretim sabit kalmalı. Kalmıyorsa ya bir parça iki kez sayılıyor ya biri hiç sayılmıyor.

Testler kalıcı olsun, tek komutla çalışsın. İleride bir şey bozulursa bu testler yakalar.

**Baki'nin kontrolü:** Altı testi çalıştır, sonuçları göster.

---

### ADIM 4 — Tur döngüsü iskeleti

Tasarım §8 sekiz aşama tanımlıyor. Bu görevde **yalnızca birinci aşama** var: üretim. Diğerleri sonraki görevlerde eklenecek — ama döngünün yapısı o aşamaların ekleneceği şekilde kurulsun.

```
Turu bitir:
    1. Her aktör için gelir hesapla, havuzuna ekle
    2. Tur geçmişine kaydet
    3. Tur sayacını 1 artır
    4. Ekranı tazele
```

Şimdilik tüm aktörler aynı anda üretir. Sıra sistemi (kimin sırası) yapay zekâ geldiğinde kurulacak; **şimdi kurmaya çalışma.**

**Tur geçmişi** son 50 turu tutsun (`denge.js`'teki sabit). "Geçen tur ne kazandım" sorusunu cevaplar ve hata ayıklamada işe yarar.

**Baki'nin kontrolü:** Turu bitir düğmesine birkaç kez bassın — sayılar her turda aynı miktarda mı artıyor?

---

### ADIM 5 — Kayıt ve yükleme

Karar 1 gereği çekirdek özellik. Şimdi kurulması gerekiyor çünkü **durum yapısını doğrular**: serileştirilemeyen bir şey koyduysan burada ortaya çıkar, on görev sonra değil.

**Kapsam — küçük tut:**

- Tek kayıt yuvası
- "Kaydet" ve "Yükle" düğmesi (geliştirici arayüzünde olabilir, şık olması gerekmiyor)
- Cihaz belleğine yazar (AsyncStorage veya eşdeğeri)

**Doğrulama:**

| Test | Beklenen |
|---|---|
| Gidiş-dönüş | Kaydet → uygulamayı kapat → aç → yükle → tur sayısı, havuzlar, sahiplik aynı |
| Dosya boyutu | Kayıt birkaç on KB. Yüzlerce KB ise geometri sızmış demektir. |
| Rastgelelik | Yüklenen oyunda üretecin durumu kaydedildiği yerden devam ediyor |
| Sürüm alanı | Kayıtta `surum` var |

**Baki'nin kontrolü:** Birkaç tur oyna, kaydet, uygulamayı tamamen kapat, aç, yükle. Her şey yerinde mi?

---

### ADIM 6 — HUD'ı gerçek sayılara bağla

Adım 0d'de çıkardığın sahte alan listesini kapat. Her alan ya gerçek hesaba bağlanır ya kaldırılır. **Üçüncü seçenek yok.**

HUD'da görünecekler:

| Alan | Biçim | Not |
|---|---|---|
| Tur | "Tur 12" | |
| Nüfus havuzu | Tam sayı | Biriken toplam |
| Ekonomi havuzu | Tam sayı | Biriken toplam |
| Tur geliri | "+8 nüfus / +6 ekonomi" | Havuzdan ayrı gösterilsin — oyuncunun asıl merak ettiği budur |
| Parça sayısı | "12 / 193" | Senaryo kapsamına göre payda değişir |
| Tam il sayısı | "3 il" | Tüm parçaları elde olan iller |
| Turu bitir | Düğme | |

**Küçük ekran kuralı:** Telefonda HUD haritayı boğmasın. Sığmıyorsa daralt veya katmanla; yeni bir tasarım dili icat etme, mevcut görünüme uy.

**Baki'nin kontrolü:** Telefonda sayılar mantıklı mı, turu bitirince değişiyor mu, sahte alan kaldı mı?

---

### ADIM 7 — Panele üretim bilgisi ekle

Görev 02'deki birleşik panel bilgi gösteriyor ama sahiplikten habersiz.

**Parça bölümüne:**
- Sahibi kim (aktör adı + renk)
- Bu parçanın sahibine tur başına kazandırdığı: "+4.4 nüfus / +3.1 ekonomi"

**İl bölümüne:**
- Bu ilin parçaları kimde: "3/4 parça sende, 1 parça Balıkesir'de"
- Senin bu ilden aldığın toplam gelir
- 7 stat (altyapı çıktı)

**Türetilmiş satır — bu görevin en faydalı tek satırı:**

> **"Bu parçayı alırsan: +4.4 nüfus / +3.1 ekonomi (tur başına)"**

Görev 02'de yüzde olarak yazıyordu, artık gerçek sayı yazabilir. Oyunun ana formülünün ekrandaki halidir; sayı saçmaysa Baki parmakla dokunup anında görür. Kod okumadan hata yakalamasının en hızlı yolu budur.

**Panelde oyun mantığı olmasın** — ordu, üretim, saldır düğmesi yok. Yalnızca bilgi.

**Baki'nin kontrolü:** Birkaç parçaya dokunsun — gösterilen gelirler HUD'daki toplamla tutarlı mı?

---

### ADIM 8 — Sahiplik test aracı

Muharebe Görev 05'te geliyor. O zamana kadar sahiplik elle değiştirilebilmeli, yoksa ekonomi test edilemez.

**Gereken:** Geliştirici modunda bir parçaya uzun basınca sahipliği oyuncuya geçsin. Sahiplik değişince gelir **anında** yeniden hesaplansın.

Baki'nin özellikle görmek istediği davranış bu: parça el değiştirdiğinde üretim doğru şekilde yeniden hesaplanıyor mu.

**Ek olarak faydalı:**
- Sahipliği eski haline döndürme
- Bir ilin tüm parçalarını tek dokunuşla alma (tam il davranışını test etmek için)

**Kurallar:**
- `denge.js`'teki `GELISTIRICI_MODU` anahtarıyla kapanabilsin
- Görsel olarak normal oyun arayüzünden ayrışsın ("GELİŞTİRİCİ" etiketi veya farklı renk) — Baki bunun geçici olduğunu unutmasın
- Yayın sürümünde kapalı olacak, kodda kalması sorun değil

**Baki'nin kontrolü:** Birkaç parça sahiplensin — HUD'daki gelir doğru artıyor mu? Bir ilin tüm parçalarını alınca "tam il" sayacı artıyor mu? Kaydedip yükleyince sahiplik korunuyor mu?

---

## 8. DOSYA YAPISI — GÖREV SONU

```
il-savasi/
├── docs/
│   ├── il-savasi-tasarim.md              <- dört karar işlendi
│   ├── il-savasi-parca-bolumleme-v2.md
│   ├── GOREV-01-harita.md
│   ├── GOREV-02-il-statlari.md
│   └── GOREV-03-ekonomi-v2.md            <- bu dosya
├── veri/
│   ├── iller.json                        <- altyapı çıkarıldı, 7 stat
│   ├── parcalar.json
│   ├── parca-komsuluk.json
│   ├── komsuluk.json
│   ├── harita.json
│   └── URETIM-NOTU.md
├── src/
│   ├── denge.js                          <- YENİ: tüm denge sabitleri
│   ├── oyun/
│   │   ├── oyunDurumu.js                 <- YENİ
│   │   ├── senaryolar.js                 <- YENİ
│   │   ├── uretim.js                     <- YENİ
│   │   ├── turDongusu.js                 <- YENİ
│   │   ├── kayit.js                      <- YENİ
│   │   └── rastgele.js                   <- YENİ
│   ├── bilesenler/
│   └── tema.js
└── testler/
    └── uretim.test.js                    <- YENİ: altı doğrulama testi
```

---

## 9. ÇALIŞMA KURALLARI

**Adım adım git, her adımın sonunda dur.** Dokuz adımı tek seferde yapıp "bitti" deme. Her adım sonunda:

1. Ne yaptığını iki üç cümleyle özetle
2. Baki'nin **tam olarak ne yapacağını** söyle — hangi komut, hangi ekran, neye bakacak
3. Neyin doğru görünmesi gerektiğini söyle
4. Onay al, sonra devam et

**Kapsamı büyütme.** İki görevde iki kez büyüdü. Ordu, muharebe, yapay zekâ, mod ekranı bu görevde yok.

**Uydurma.** Hesaplayamadığın bir sayıyı ekrana yer tutucu koyup gerçekmiş gibi bırakma.

**Takıldığında.** İkinci başarısız denemeden sonra durumu anlat: ne denedin, ne oldu, hangi seçenekler var.

**`URETIM-NOTU.md`'yi her adımda güncelle.** Özellikle: dört kararın işlenmesi, üretim formülü, seçilen çarpan, rastgelelik tohumu yaklaşımı.

---

## 10. GÖREV BİTİŞ ÖLÇÜTÜ

**Belge senkronu**
- [ ] Tasarım belgesindeki §4.2, §4.3, §4.5, §5, §8, §12, §13, §15 ve sözlük güncellendi
- [ ] `iller.json`'da altyapı statı yok, 81 il eksiksiz
- [ ] Panelde 7 stat gösteriliyor
- [ ] Sahte alan envanteri çıkarıldı ve kapatıldı

**Altyapı**
- [ ] `src/denge.js` var, üretim çarpanı ve geliştirici anahtarı içinde
- [ ] Tohumlu rastgele üreteç var, aynı tohum aynı diziyi veriyor

**Oyun durumu**
- [ ] Senaryo sistemi çalışıyor, Türkiye ve Karadeniz senaryoları var
- [ ] Kapsam dışı parçalar soluk ve seçilemez
- [ ] Her parçanın sahibi kendi ili

**Ekonomi**
- [ ] Altı doğrulama testi geçiyor
- [ ] Toplam korunumu testi geçiyor
- [ ] Kesirli birikim doğru (4.4 × 10 tur = 44)

**Tur ve kayıt**
- [ ] Turu bitir çalışıyor, sayaç artıyor, kaynak birikiyor
- [ ] Kaydet/yükle gidiş-dönüş testi geçiyor
- [ ] Kayıt dosyası birkaç on KB, geometri sızmamış
- [ ] Kayıtta sürüm alanı var

**Arayüz**
- [ ] HUD gerçek sayıları gösteriyor, sahte alan kalmadı
- [ ] Panel parça sahibi + tur gelirini gösteriyor
- [ ] "Bu parçayı alırsan +X nüfus / +Y ekonomi" satırı doğru
- [ ] Geliştirici modunda sahiplik değiştirilebiliyor, gelir anında güncelleniyor

**Genel**
- [ ] Telefonda test edildi, akıcı
- [ ] `URETIM-NOTU.md` güncel

---

## 11. SONRAKİ GÖREV (bilgi amaçlı — bunu yapma)

**Görev 04 — Ordu üretimi.** Biriken nüfus ve ekonomi burada harcanacak.

- **Doğrudan birim satın alma** (Karar 2). Oran seçici **yok**. Kart tabanlı üretim ekranı, canlı bütçe sayacı, bütçe yetmeyince [+] tuşu pasifleşir.
- Birim maliyetleri (§4.1): piyade 3 nüfus / 1 ekonomi, topçu 2 nüfus / 3 ekonomi, zırhlı 1 nüfus / 6 ekonomi
- Garnizon / sefer bölüşümü (§4.4)
- **"Geçen turun siparişini tekrarla" düğmesi.** 40 ili olan oyuncunun her tur tek tek birim basması yorucudur; uzun maçlarda bu düğme zorunlu hale gelir. Baki bunu 23 Temmuz'da işaret etti.

Bu görevde kod yazarken o yönü akılda tut — ama şimdiden ordu alanı ekleme.
