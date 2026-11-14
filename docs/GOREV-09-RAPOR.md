# GÖREV 09 — BİTİŞ RAPORU

> Tarih: 2026-08-01 · Görev tanımı: `docs/GOREV-09-diplomasi-ve-cerceve.md`
> Önceki: `docs/GOREV-08-RAPOR.md` · Günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

**Oyun artık bitirilebiliyor.** Sekiz görevdir uygulamayı açtığında doğrudan haritanın
içindeydin: nereden başladığın belli değildi, ne zaman biteceği belli değildi, kazanınca
ne olacağı belli değildi. Şimdi ana menü var, üç kazanma koşulu var, sekiz kapsam var,
üç maç yuvası var — ve maç bir sonuçla kapanıyor.

Yanında diplomasi geldi: **tarafsız · ittifak · savaş halinde.** Saldırının kendisi ilan;
ittifakına saldıran seninle de savaşa girer; anlaşmayı bozanın bedeli var.

---

## 2. BAKİ'NİN KARARLARI

| Soru | Cevap | Sonucu |
|---|---|---|
| 1 — Savaş ilanı zorunlu mu | **A** — üç durum, ilan yok | Saldırı = ilan; akış hiç bozulmadı |
| 2 — Diplomasi kimlerle | **A** — yalnızca "tanıdıkların" | Liste 10 satırda kapaklı |
| 3 — Mod ve maç uzunluğu | **Belgeden farklı** — mod = kazanma koşulu | Üç mod × sekiz kapsam |
| 4 — Bölge modunun kapsamı | **A** — 7 coğrafi bölge | Türkiye + 7 bölge |
| 5 — Kayıt yapısı | **A** — üç yuva | Ana menüde üç maç |
| Ses dosyaları | Yok | Adım 7 atlandı, borç Görev 10'a |
| Üçüncü taraf kısıtı | `topraklar` + iki yeni kısıt | Görev 08'in borcu kapandı |
| Düello giriş şartı | `baskaSavasYok` (ölçüm sunuldu, kararında kaldı) | Kutsal savaş nadir ve hak edilmiş |
| Tur sınırı | **Yükseltildi** | Tam fetih 150 tur ≈ 1 sa 53 dk |

### Soru 3'ün hikâyesi — belge kapsama göre kurmuştu, Baki koşula göre kurdu

Görev belgesi modları **kapsama** göre tanımlıyordu: Bölge · Türkiye · Serbest.
Baki başka bir şey istedi:

> *"1.si tüm Türkiye'yi fethetmek gerektiren, 2.si %50'sini fethetmenin yeterli olduğu,
> 3.sü sınırlı sayıda turda en çok güçlenen il olmak."*

Bu daha iyi bir ayrım ve bölge modunu **dışlamıyor** — ikisi dik eksen:

```
KAPSAM (Türkiye / 7 coğrafi bölge)  ×  KAZANMA KOŞULU (Fetih / Yarım Fetih / Güç Yarışı)
```

Belgenin "Serbest" modu düştü: karşılığı artık kapsam + koşul seçiminin kendisi.

---

## 3. ÖLÇÜM ÜÇ KEZ BELGEYİ DÜZELTTİ

Bu görevin karakteri buydu: **planlanan sayıların üçü de ölçümde yanlış çıktı ve üçü de
düzeltildi.**

### 3a. Kayıt sınırı keyfiydi VE zaten aşılıyordu

26 KB bir depolama sınırı değil, bir **kanarya**: Görev 03 *"yüzlerce KB ise geometri
sızmış demektir"* diye koymuştu ve sayı o gün ölçülenin biraz üstüne yazılmıştı. Bir daha
hiç sorgulanmadı.

Asıl sorun başkaydı: **bugüne kadarki bütün ölçümler 15 tur üzerindendi.** 50 turluk
Türkiye maçı **26.4 KB** çıktı — yani diplomasi ve mod daha eklenmeden sınırın dışındaydık.

Yanında bir de israf bulundu: `aktorler` alanının 8.0 KB'ının **4.8'i boşuna yazılıyordu**
(`id` zaten anahtar · `ad` ILLER'den · `renk` sabit tablodan · `tur` `oyuncuAktorId`'den).
`kisilikler` ve `ordu.sahip` için zaten uygulanan kuralın üçüncü uygulaması.

**Kayıt 26.4 → 22.0 KB, sınır gerekçeli olarak 32'ye çıktı.** Kanarya işlevi duruyor: bir
parçanın geometrisi ortalama ~8.7 KB, yani tek bir parça sızsa bile test öter.

### 3b. İttifak doygunluğu gerçekten çıktı — üç kök sebeple

Belge §10/6 bunu *"bu görevin oyunu bozabileceği tek yer"* ilan etmişti ve haklıydı: ilk
koşuda zor kademede hayatta kalan **27 aktörün 26'sı tek ittifak bloğundaydı.**

| # | Kök sebep | Düzeltme |
|---|---|---|
| 1 | **Ölçütün kendisi yanlıştı** — "etkin savaş hali" sayılıyordu; diplomasi kapalıyken öyle bir şey YOK, sayı tanım gereği 0 çıkıyor ve "diplomasi savaşı artırmış" gibi görünüyordu | Ölçü **muharebe satırı** oldu — iki rejimde de aynı şeyi sayıyor |
| 2 | **Formül dünyanın büyüklüğüne bağlıydı** — `ORTAK_DUSMAN` ham sayıydı; konsolide dünyada herkesin 5–6 ortak düşmanı oluyor, terim eşiği 10 kat aşıp öteki terimleri anlamsızlaştırıyordu | Terim **orana** çevrildi (0–1); cephe yükü de öyle |
| 3 | **İttifakın bedeli formülde hiç yoktu** — yalnızca ZAYIF komşuyla anlaşmak cezalıydı; oysa HER komşu ittifakı genişleyebileceğin bir cepheyi kapatır | `FAYDA.KOMSU` eklendi (açgözlülükle çarpılıyor) |

Eşik taraması dar bir bant gösterdi ve sebebi öğreticiydi: **adayların neredeyse hepsi
komşuydu.** Uzak aday üretmek için `BUYUKLUK_ESIGI` düşürüldü, o da listeyi 26 satıra
çıkardı — §10/9'un ("diplomasi arayüzü şişebilir") tam olarak engellemek istediği şey.
Çözüm eşiği geri almak değil, **listeye kapak** koymak oldu.

**Yerleşen değerler ve sonuç:**

| Kademe | Muharebe (kapalı→açık) | İttifaklı aktör | En büyük blok / canlı |
|---|---|---|---|
| kolay | 34 → 34 | 1% | 0.7 / 80 |
| orta | 170 → 162 | 10% | 3.0 / 63 |
| zor | 919 → 942 | 33% | 3.0 / 17 |

Üç sağlık ölçütü de üç kademede geçiyor ve **diplomasi zorlukla birlikte artıyor** —
baskı arttıkça anlaşma arayışı artıyor, istenen his bu.

### 3c. Tam fetih tutturulamıyordu — ve tur sınırı tek başına çözmedi

Belge §4/Soru 3 öngörmüştü: *"181 parçanın tamamını almak hiçbir modda gerçekçi değil."*
Ölçüm doğruladı. Baki *"tur sınırını yükseltelim"* dedi; **250 turluk koşu bunun da
yetmediğini gösterdi:**

| Zorluk | tur 25 | tur 75 | tur 125 | tur 200 |
|---|---|---|---|---|
| orta | %11 · 6 muharebe | %26 · 3 | %28 · 0 | **%36 · 0** |
| zor | %23 · 17 muharebe | %56 · 4 | %69 · 0 | **%69 · 0** |

**Dünya kilitleniyor.** Zor kademede 125. turda en büyük imparatorluk %69'a çıkıyor, canlı
aktör 3'e iniyor ve muharebe sayısı sıfıra düşüyor — 200. tura kadar tek parça el
değiştirmiyor.

Alınan karar bunu **gizlemiyor, kabul ediyor ve tanımlıyor:**

- Tur sınırı 80 → **150** (yapay zekânın tavana vurduğu 125. turun üstü, oyuncuya alan kalsın)
- Yarım Fetih 50 → **70** (ölçüm %50'ye 56. turda ulaşıyordu; 50 turluk sınır eşiği kıl payı imkânsız kılıyordu)
- **`SURE_DOLUNCA: 'toprak'`** — süre dolduğunda en çok bölgeyi tutan kazanır

Sonuncusu kritik: "kimse kazanamadan süre doldu" artık **gerçek ve tanımlı** bir sonuç.
Tanımsız bıraksaydık maçın bitmemesi bu görevin çözmeye geldiği sorunun ta kendisi olurdu.

**Maç süreleri (45 sn/tur varsayımıyla):**

| Mod | Türkiye | Bölge (ör. Karadeniz) |
|---|---|---|
| Fetih | 150 tur · ~1 sa 53 dk | 32 tur · ~24 dk |
| Yarım Fetih | 70 tur · ~53 dk | 22 tur · ~17 dk |
| Güç Yarışı | 35 tur · ~26 dk | 16 tur · ~12 dk |

⚠ **45 sn/tur ÖLÇÜLMEDİ, HESAPLANDI** ve bu görevin en zayıf varsayımı. Gösteri kısmı
ölçülü (6.6 sn); oyuncunun karar süresi (~38 sn) tahmin. Cihaz denemesinde düzeltilecek
yer tur sınırları değil, **tek sayı**: `DENGE.MOD.SANIYE_PER_TUR`.

---

## 4. DİPLOMASİ: "İLAN YOK" DEMEK "SAVAŞ HALİ YOK" DEMEK DEĞİL

Soru 1/A'nın en önemli sonucu: **saldırının kendisi ilandır.** Oyuncu bugünkü gibi dokunup
saldırıyor — hiçbir ekran fazladan açılmıyor, hiçbir tur kaybedilmiyor — ama saldırı
çözülürken arkada savaş hali doğuyor. B seçeneğinin *töreni* alınmadan *işlevi* alındı:
savaşın bir başlangıcı, bir sonu (ateşkes) ve haritada bir görüntüsü var.

**Zincir kuralı (§10/3) bedava geldi:** müttefikine saldıran seninle de savaş haline girer,
ama sınırdaş değilsen fiilen savaşamazsın — komşuluk grafiği bunu zaten dayatıyor.
Zincir **tek adım** yayılıyor ve bu bir düğme değil, bir uyarı: iki adım olsaydı ilk savaşta
harita ikiye bölünürdü.

**`son` alanı neden var:** savaş satırı `{ tip, turdan, son }` tutuyor. `SAVAS_UST_SINIRI`
"unutulmuş savaşlar birikmesin" diye konuldu; başlangıç turuna baksaydı **20 turdur fiilen
süren bir savaş da otomatik tarafsıza dönerdi**, yani kuralın tam tersi.

### Görev 08'in borcunu Görev 09'un sistemi kapattı

Görev 08 `topraklar` kısıtını tematik olarak daha güçlü bulmuş ama **sömürülebilir** diye
geri çevirmişti: *"oyuncu hasmına bilerek saldırıp sınırını 10 tur dokunulmaz yapabilir."*

Baki `topraklar` istedi ve sömürüyü kapatan iki kısıtı da aynı cevapta verdi:
`DUELLO_SURESI` 10 → **5** ve `GIRIS_SARTI: 'baskaSavasYok'`. İkincisi belirleyici:
sömürüyü yapacak oyuncu tanım gereği saldırgandır, yani başkalarıyla da savaş halindedir
ve **düellosu hiç başlamaz.**

Dikkat çeken taraf: giriş şartı "savaş hali" kavramına dayanıyor ve o kavram **bu görevde
doğdu.** Görev 08 bu kısıtı yazamazdı — yazacak malzemesi yoktu.

**Bedeli ölçüldü ve Baki'ye sunuldu** (30 turda başlayan düello: kolay 4/4/1 · orta 11/7/5 ·
zor 23/11/4 — `yok`/`saldiranTemiz`/`baskaSavasYok`). Zor kademede sıkı şart §11'i fiilen
susturuyor. Baki önce şartın ne yaptığını sordu — cevap önemliydi, çünkü kural sanıldığından
yumuşak: **hiçbir şeyi geri almıyor, hiçbir barış dayatmıyor**; saldırı normal olur, toprak
el değiştirir, yalnızca kart/bonus/koruma gelmez. Üstelik düello **iptal değil, ertelenir**.
Baki bunu duyduktan sonra kendi tarifinde kaldı: kutsal savaş **nadir ve hak edilmiş** olsun.

---

## 5. MİMARİ: TEK KAPI, TEK KONTROL, TEK LİSTE

Bu görevde §10/4 ("aynı kural iki yerde tutulmaz") üç ayrı yerde çalıştı:

| Yer | Ne oldu |
|---|---|
| **İttifak kısıtı** | `hareket.js hareketGecerliMi`'ye, düello kısıtının yanına kondu. Oyuncu ve yapay zekâ AYNI kapıdan; ikinci bir kontrol yazılmadı |
| **Kazanma kontrolü** | Görev 07'nin asgari kontrolü `oyunKancasi`'ndan alınıp `mod.js sonucKontrol`'e taşındı. Kalsaydı Yarım Fetih'te oyuncu %50'de kazanmış olmasına rağmen oyun devam ederdi |
| **Kapsam listesi** | `senaryolar.js` kendi tablosunu tutuyordu; mod ekranı ikinci kopya doğuracaktı. Tek yere toplandı ve `veri-dogrula.js` bölge adlarını denetliyor |

Üçüncüsünün bedeli özellikle sinsi olurdu: **mod ekranı bir kapsamı gösterip oyun başkasını
kurardı ve hiçbir yerde hata çıkmazdı.**

### rekabet ↔ diplomasi döngüsü

`diplomasi.js`, `rekabet.js`'i ithal ediyor (husumet ve düello sorguları için). Ama
düellonun giriş şartı savaş halini okumak zorunda — ters yön döngü olurdu.

Çözüm `rekabet.js`'in **kendi precedent'i**: komşuluğu ham veriden okuma notunun aynısı.
`baskaSavasVarMi` `durum.iliskiler`i doğrudan okuyor ve notu açıkça diyor ki bu bir KURAL
değil, aynı verinin tek satırlık sorgusu. Kuralın kendisi tek yerde.

---

## 6. BELGEYE UYMADIĞIM YERLER

1. **Mod sistemi kapsama göre değil koşula göre kuruldu** (§2 — Baki'nin kararı).

2. **Kayıt sürümü 9, Adım 8'de değil Adım 5'te yükseldi.** Adım 0'da kayıt biçimi zaten
   değişmişti ama **geriye dönük uyumlu yazıldığı için** yükseltilmedi: sürüm 8 kaydı o
   noktada sorunsuz yükleniyordu ve yükseltmek, hiçbir şey bozulmamışken Baki'nin elindeki
   kaydı reddetmek olurdu (Görev 07'nin dersi). Sürüm 9, sürüm 8'i **gerçekten kıran** şey
   geldiğinde yükseldi: `durum.mod`.

3. **Adım 3'ün ölçümü Adım 1'de başladı.** Belge doygunluğu Adım 3'e yazmıştı; düello giriş
   şartının bedeli Adım 1 biter bitmez ölçülebiliyordu ve beklemek, Baki'ye eksik bilgiyle
   soru sormak olurdu.

4. **`FAYDA.KOMSU` belgede yoktu.** Belgenin fayda formülü yalnızca "zayıf komşu" terimini
   sayıyordu; ölçüm ittifakın asıl bedelinin **her** komşu ittifakında olduğunu gösterdi.

5. **Adım 7 (ses) atlandı** — dosyalar gelmedi. Katman ayrı olduğu için maliyeti yok.

6. **`zeka.test.js`'in salınım testi düzeltildi.** Kırıldı, incelendi ve **gerçek salınım
   olmadığı** görüldü: süzgeç "dost parçaya giriş = takviye" diyordu, oysa aynı turda
   fethedilen bir parçaya yapılan takip hamlesi de öyle görünüyor. Süzgeç artık kuralın
   kendi ön şartını kullanıyor. Testin kapsamı daralmadı, **doğru şeye nişan aldı.**

---

## 7. DEĞİŞEN DOSYALAR

**Yeni:**

| Dosya | İşi |
|---|---|
| `src/oyun/diplomasi.js` | Üç durum, teklif, ateşkes, ihanet, zincir, tanıdık süzgeci |
| `src/oyun/mod.js` | Mod tanımı, kazanma/yenilgi kontrolü (TEK YER), hedef göstergesi |
| `src/bilesenler/DiplomasiEkrani.js` | Diplomasi perdesi |
| `src/bilesenler/AnaMenu.js` | Ana menü + mod seçimi + üç yuva |
| `scripts/kayit-boyut-olcum.js` | 60 turluk kayıt boyutu → `veri/kayit-boyut-olcum.md` |
| `scripts/diplomasi-olcum.js` | İttifak doygunluğu → `veri/diplomasi-olcum.md` |
| `scripts/mod-esik-olcum.js` | Kazanma eşiği gerçekliği → `veri/mod-esik-olcum.md` |
| `testler/diplomasi.test.js` · `testler/mod.test.js` | 64 yeni test |

**Değişen:** `denge.js` (DIPLOMASI, MOD, KAYIT_SINIRI_KB, REKABET) · `zeka.js` (ittifak/
ateşkes puanı, teklif üretimi) · `sira.js` (zekânın diplomasisi) · `cozum.js` (savaş hali) ·
`hareket.js` (ittifak kısıtı) · `turDongusu.js` (ilişki bakımı, sonuç kontrolü) ·
`rekabet.js` (giriş şartı, `topraklar`) · `oyunDurumu.js` (mod/sonuç/ilişki alanları,
sürüm 9) · `kayitVerisi.js` (aktör inceltme, sürüm 8 reddi) · `kayit.js` (üç yuva) ·
`senaryolar.js` (tek kaynak + tur sınırı hesabı) · `oyunKancasi.js` · `App.js` ·
`TurCubugu.js` (hedef satırı, diplomasi düğmesi) · `TurPerdesi.js` (sonuç kartı) ·
`veri-dogrula.js` (kapsam denetimi)

---

## 8. SAYILAR

| | Görev 08 | Görev 09 |
|---|---|---|
| Test | 497 | **561** (+64) |
| Kayıt sürümü | 8 | **9** (1–8 reddediliyor) |
| Kayıt boyutu (başlangıç / 50 tur) | 19.4 / 26.4 KB | **14.7 / 22.7 KB** |
| Kayıt sınırı | 26 KB (keyfî) | **32 KB** (gerekçeli) |
| Kayıt yuvası | 1 | **3** |
| Mod | yok | **3 koşul × 8 kapsam** |
| Paket | 5.9 MB | **5.97 MB** |

`npm run kontrol` temiz · `npx expo export` hatasız.

---

## 9. YAPILMAYANLAR VE BİLİNEN BORÇLAR

1. **SES YOK.** Dosyalar gelmedi; katman hazır (`src/sahne/ses.js`), liste hazır
   (`docs/GOREV-08-SES-LISTESI.md`). SDK 54'te paket `expo-audio`.

2. **CİHAZDA DENENMEDİ.** Görev 08'in ölçülmemiş kare bütçesi de dahil. Bu görevin
   denenecek yeni yüzeyi geniş: ana menü, mod seçimi, üç yuva, diplomasi ekranı,
   hedef göstergesi, sonuç kartı.

3. **`SANIYE_PER_TUR = 45` tahmin.** Bütün maç süreleri buna dayanıyor. "Maç uzun/kısa
   geldi" denirse düzeltilecek yer tur sınırları değil bu tek sayı.

4. **Dünya %69'da kilitleniyor.** Tam fetih modu tanımlı ve `SURE_DOLUNCA: 'toprak'` ile
   maç her hâlükârda bir sonuçla bitiyor — ama yapay zekânın haritayı bitirememesi bir
   denge sorunu ve Görev 10'un bakacağı yer burası olabilir.

5. **Sıcak koltuk ve para kazanma Görev 10'a.** Mod sistemi kurulduğu için sıcak koltuğun
   hangi maç uzunluğuna hizmet edeceği artık biliniyor: **Güç Yarışı · bölge kapsamı ·
   ~12 dk.**

6. **`tur` alanı sıcak koltukta türetilemez hale gelir.** Kayıt inceltmesinin notu
   `kayitVerisi.js`'te; Görev 10 oraya bakmalı.

---

## 10. SIRADAKİ: GÖREV 10

Para kazanma (§12) · sıcak koltuk · başarımlar · yayın hazırlığı · asenkron çevrimiçi (v1.5).

**Bu görevden Görev 10'a geçen hazır girdiler:**

- **Ana menü ve yuva düzeneği** — mağaza ve başarım ekranları aynı akışa takılır
- **Mod sistemi** — sıcak koltuğun hedef uzunluğu artık ölçülü
- **Sonuç kartı** — başarım bildirimleri aynı kalıbı kullanır
- **Üç ölçüm betiği** — "para güç satmıyor" kırmızı çizgisi (§12.1) aynı düzenekle sınanır

Görev 09 bittiğinde oyun **bitirilebilir**. Görev 10 onu **yayınlanabilir** yapan katman.
