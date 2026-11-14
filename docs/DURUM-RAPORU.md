# İL SAVAŞLARI — DURUM RAPORU

> Tarih: **2026-09-19** · On beş görev sonunda oyunun tam hâli
> Kaynaklar: `docs/GOREV-0X-RAPOR.md` (görev bitiş raporları) · `veri/URETIM-NOTU.md`
> (günlük) · `docs/il-savasi-tasarim.md` (tasarım belgesi) · `docs/YAYIN-KONTROL.md`
>
> ⚠ **Bu belge CANLI tutulur, tarih kaydı değildir.** "Bugün neredeyiz" sorusunun tek
> cevabı burasıdır; eskimişse düzeltilir, yeni bir kopya açılmaz. Önceki sürümü
> 2026-08-01'de (dokuz görev) yazılmıştı ve on maddesi eskimişti — hangileri olduğu §11'de.

---

## 1. OYUN ŞU AN NE

**Türkiye haritasında, il bazlı, sıra tabanlı bir strateji oyunu.** Bir ilin başına
geçiyorsun; 80 rakip il kendi kararlarını veriyor. Asker basıyor, sınırlarını genişletiyor,
savaş ilan ediyor, anlaşmalar kuruyor ve seçtiğin kazanma koşuluna ulaşmaya çalışıyorsun.

**Baştan sona oynanabiliyor ve bitirilebiliyor.** Ana menüden mod seçiyorsun, haritadan
başlangıç ilini tıklıyorsun, oynuyorsun, kazanıyor ya da kaybediyorsun.

### Rakamlarla (ölçüldü: 2026-08-16)

| | |
|---|---|
| Harita | **81 il · 181 parça** (her il 1–4 parça) |
| Kod | 78 dosya · 23.094 satır (`src/`) |
| Test | **676 test**, 28 dosya |
| Araç betiği | 50 dosya · 12.216 satır (`scripts/`) |
| Ölçüm raporu | 22 dosya (`veri/*.md`, günlük hariç) · 5.930 satır |
| Kayıt | **Sürüm 17** · 3 yuva · testler 22/26/50 KB kanaryalarıyla kilitli |
| Belge | 27 dosya · 8.006 satır (`docs/`) |
| Kalite kapısı | `npm run kontrol` **altı bölüm**, hepsi temiz |

---

## 2. OYUN NASIL OYNANIYOR

### Tur döngüsü

> ⚠ **2026-09-19'da DEĞİŞTİ (Görev 15):** emir kuyruğu kalktı, hamle verildiği an çözülüyor.

```
1. GELİR      → her ilin nüfus ve ekonomi havuzu dolar
2. ARAŞTIRMA  → ayrılan ekonomi puana dönüşür, seviye atlanır
3. ÜRETİM     → asker basılır (sanayi sınırı kadar)
4. SENİN SIRAN → saldırı/taşıma ANINDA çözülür: parça hemen el değiştirir, ordu oraya geçer
                 (hamle hakkı: piyade 1 · topçu 1 · zırhlı 2 — zırhlı aldığı yerden devam eder)
   ── TURU BİTİR ──
5. BOTLAR     → 80 aktör tohumla karışık sırayla oynar (insanlar her zaman ÖNCE oynar)
6. TOPLANMA   → yıpranmış ordular kadrolarına dolar (çözümden SONRA)
7. BAKIM      → düellolar, ilişkiler, unutulmuş savaşlar, kazanma kontrolü
8. DEFTER     → hamle hakkı defteri ve tur günlüğü sıfırlanır
```

**Fethedilen parça el değiştirdiği tur gelir vermez** (artık açık bir kural). Ayrıntı:
`docs/GOREV-15-aninda-cozum.md`.

### Üç birim türü

**Piyade · Topçu · Zırhlı.** Her birinin dört muharebe statı var (sağlık, zırh, hafif
vuruş, ağır vuruş) ve taş-kağıt-makas ilişkisi doğrudan bu statlardan çıkıyor — ayrı bir
"şuna karşı güçlü" tablosu yok.

### Muharebe

Raunt raunt çözülüyor. Arazi (ova · tepelik · dağlık), moral bonusları ve araştırma
seviyeleri sonuca giriyor. Ordu canının belli bir oranını kaybedince **bozguna uğrayıp
çekiliyor** — imha edilmesi gerekmiyor.

⚠ **Muharebe mimarisi 2026-08-08'de sıfırdan kuruldu** (Görev 13). Ağır vuruş artık zırha
bonus değil **delicilik** veriyor (2026-08-11 düzeltmesi): eski formülde hedef ne kadar
zırhlıysa ağır vuruş o kadar verimli oluyordu — modelin kendisi terstir, yazım hatası
değildi.

### Araştırma

Birim başına ağaç: her birimin kendi zırh/hafif/ağır dalı var, üstüne dört kendine özgü
dal (baraj ateşi, paletli üstünlük, yarma, seferberlik). Tavanı var — tek seferlik bir
sıçrama, süren bir kartopu değil.

**Ölçütü 2026-08-12'de tersine çevrildi:** araştırma artık "biraz yardım etmeli" değil,
**kıl payı kaybedilen savaşı ÇEVİRMELİ** (%95 oranında). Zırh dalının geri tepmesi de
bitti — eskiden zırh araştırmak gelen ağır vuruşu artırıyordu.

---

## 3. DÜNYA KENDİ KENDİNE OYNUYOR

80 rakip ilin her birinin **dört kişilik ağırlığı** var: saldırganlık, açgözlülük,
husumet, temkin. Ağırlıklar tohumdan türetiliyor — aynı tohumla kurulan oyunda Konya hep
aynı huyda oluyor. Görev 12'den beri karakterler oyuncuya **görünüyor** de ("tanıdıkça").

Karar tek bir **fayda formülünden** çıkıyor:

```
hamle puanı = DEĞER   × açgözlülük × hedefin değeri × üstünlük
            − BEDEL   × temkin     × gönderilen kuvvet × (1 − üstünlük)
            − AÇIKTA  × temkin     × açıkta kalma cezası
            + HUSUMET × husumet    × (hedef hasım mı)
            + SALDIRI × saldırganlık
```

**Üç zorluk kademesi** bu ağırlıkların aralığını değiştiriyor — gizli bonus yok, yapay
zekâ oyuncuyla aynı kurallardan geçiyor (aynı `hareketGecerliMi` kapısı).

Zekâ ayrıca: asker basıyor, araştırma yapıyor, yıpranmış ordularını topluyor, iç
bölgedeki ordularını cepheye taşıyor, savaş ilan ediyor ve diplomasi yürütüyor.

### 2026-08-12'de eklenen üç fren/gaz

| Düzenek | Ne yapıyor | Neden |
|---|---|---|
| `ZEKA.DOYMA` (üretim freni) | Kuvvetim çevredeki tehdidin 1.2 katını **ve** parça başına 8 birimi aşarsa asker basmıyorum | Silahlanma yarışı: iki komşu da bütçesinin %75'ini her tur orduya yatırınca oran hiç değişmiyor, kimse saldıramıyor |
| `ZEKA.CESARET` (üç kapı) | Elinde güç varken acımıyor | Baki: *"cesaret artsın ama aptallığa kaymasın"* — körlemesine artırmak ölçülü bir hata: umutsuz kapısının elediği saldırıların %96'sı gerçekten kaybediyor |
| `ZEKA.BITIRME` (iştah) | Maç uzadıkça saldırı isteği artıyor, açıkta kalma korkusu sönüyor | Sınırsız modun karşılığı: tur sınırı yoksa maçı bitirecek başka bir şey olmalı |

---

## 4. DİPLOMASİ

Üç ilişki durumu:

```
BARIŞ (varsayılan)  → SALDIRAMAZSIN; saldırmak için savaş ilan etmelisin
İTTİFAK             → saldıramazsın; bozmanın bedeli var
SAVAŞ HALİNDE       → saldırabilirsin; ateşkesle biter; zekâ öncelik verir
```

⚠ **Bu, Görev 09'un tersi ve bilinçli.** Görev 09'da "savaş ilanı yok, saldırının kendisi
ilandır" kuralı vardı; **Görev 11 (2026-08-03) barışı varsayılan yaptı.** Barıştaki tarafa
verilen saldırı emri kapıda kesiliyor (`hareket.js`, `kod: 'baris'`); savaş yalnızca
`diplomasi.js savasIlanEt` ile açılıyor. İlk `DIPLOMASI.ILAN.BARIS_TURU` tur boyunca kimse
ilan edemiyor — oyun barış içinde başlıyor, savaşlar sonra açılıyor. Oyuncu ilanı diplomasi
ekranındaki **SAVAŞ İLAN ET** düğmesiyle veriyor (onay kutulu, geri alınamaz iş); yapay
zekâ `zeka.js savasIlaniSec` ile, tur başına en çok bir kez.

**Zincir kuralı:** müttefikine saldıran seninle de savaş haline giriyor — ama tek adım.
Müttefikimin müttefikinin düşmanı benim düşmanım değil.

**İhanet:** anlaşmayı bozan 5 tur boyunca hiç diplomasi yapamıyor. İlişki savaşa değil
tarafsıza dönüyor — anlaşmayı bozmak saldırmak değildir.

**Kiminle:** yalnızca "tanıdıklarınla" — sınırdaşın, aranızda geçmiş olan ya da belli bir
büyüklüğü aşmış devletler. Liste `TANIDIK.EN_COK` ile kapaklı.

### Kutsal savaşlar

`veri/husumetler.js`'te **7 hasım çifti** var ve tabloyu sen dolduruyorsun; kod hiçbir
rekabet uydurmuyor. İki hasım il birbirine saldırdığında adı olan bir düello başlıyor:
kart geliyor, iki tarafa moral bonusu işliyor, kazanan fazladan ganimet alıyor ve
**üçüncü bir devlet 5 tur boyunca aralarına giremiyor.**

Düelloya girmenin şartı var: iki tarafın da başka savaşı olmamalı. Bu şart, dokunulmazlık
kuralının sömürülmesini engelliyor.

⚠ `npm run kontrol` üç husumet çifti için **uyarı** veriyor (Siirt–Gaziantep,
Afyonkarahisar–Kayseri, İstanbul–Ankara komşu değil): düello ancak taraflar genişleyip
sınırdaş olunca tetikleniyor. Hata değil, bilinçli — ama bilinmesi gerekiyor.

---

## 5. MODLAR VE MAÇ ÇERÇEVESİ

Mod = **kapsam × kazanma koşulu** (iki dik eksen):

| Mod | Kazanma koşulu | Türkiye | Karadeniz |
|---|---|---|---|
| **Fetih** | Kapsamın tamamı (181/181) | **sınırsız** | **sınırsız** |
| **%50 Hâkimiyet** | Kapsamın yarısı (91/181) | **sınırsız** | **sınırsız** |
| **Güç Yarışı** | Süre dolduğunda en çok parçayı tutan | 35 tur | 16 tur |

⚠ **Fetih ve %50 Hâkimiyet'ten tur sınırı 2026-08-08'de KALDIRILDI** (Görev 13). Bir fetih
maçının "süre doldu" diye bitmesi modun kendisiyle çelişiyordu. Sayılar silinmedi, geri
açmak tek satır (`SINIRSIZ: false`). Sınırsız maçın hiç bitmeme riskinin karşılığı
`DENGE.ZEKA.BITIRME`.

**Güç Yarışı'nda tur sınırı üst sınır değil, maçın kendisi** — o yüzden kaldırılmadı.
Süre dolunca maç berabere bitmiyor: `SURE_DOLUNCA: 'toprak'`, en çok parçayı tutan kazanır.

**Üç kayıt yuvası** var ve ücretsiz kalacak. Ana menü: Devam Et · Yeni Oyun · Kayıtlı
Oyunlar · Ayarlar.

---

## 6. ÖLÇÜMLE ALINAN KARARLAR

Bu projenin karakteri bu oldu: **denge kararları tahminle değil ölçümle verildi.** 22
ölçüm raporu var. En önemlileri:

| Ölçüm | Ne söyledi | Ne değişti |
|---|---|---|
| `denge-simulasyonu.md` | Toplanma ve araştırmanın kartopuna katkısı sınırlı | Kartopunun ilacı zekâ oldu |
| `zeka-olcum.md` | Zekâ iç bölgedeki orduyu cepheye taşımıyor | Takviye sistemi eklendi, ölü yatırım %32 azaldı |
| `sahne-olcum.md` | Savaş gösterisi 50 turda 7.3 dk sürüyordu | Kapsam ayarı geldi ("cephem" 6.6 sn/tur) |
| `kayit-boyut-olcum.md` | 26 KB sınırı keyfîydi VE 50 turda zaten aşılıyordu | Kayıt 22 KB'a indi, sınır gerekçelendi |
| `diplomasi-olcum.md` | İttifak doygunluğu gerçekten çıktı (27 aktörün 26'sı tek blok) | Formül orana çevrildi, `KOMSU` terimi eklendi |
| `arastirma-olcum.md` | Araştırma savaşı çevirmiyor, sadece süslüyor | Ölçüt tersine çevrildi: kıl payı savaş %95 dönmeli |
| `delicilik-olcum.md` | Ağır vuruş **zırha bonus** veriyordu | Delicilik modeline geçildi |
| **`URETIM-NOTU` 2026-08-12** | Dünya kilitlenmesinin sebebi silahlanma yarışıydı | Üretim freni: yığın **258 → 24**, fetih **241 → 513** |
| `tema-olcum.md` | Kiremit vurgu lacivert zeminde 1.76:1 — zayıf ama 161° uzakta | Göz onları parlaklıktan değil TONDAN ayırıyor; bırakıldı |

---

## 7. AÇIK MESELELER

### 7a. `SANIYE_PER_TUR = 45` ölçülmedi — **projedeki tek açık ölçüm borcu**

Bütün maç uzunlukları bu varsayıma dayanıyor. Gösteri kısmı ölçülü (6.6 sn), oyuncunun
karar süresi (~38 sn) **tahmin**. Telefonda bir maç oynanınca düzeltilecek tek sayı bu —
tur sınırlarına dokunmaya gerek yok, tek sayı üç modu birden kaydırıyor.

### 7b. Özel dal fiyatı 12 puan — cevap bekleyen tasarım sorusu

Görev 13'ten kaldı: dört kendine özgü dalın (baraj ateşi, paletli üstünlük, yarma,
seferberlik) fiyatı ölçüldüğünde **çok ucuz** çıktı. Yükseltilecek mi, Baki'nin kararı.

### 7c. Diplomaside "iyi ortak" terimi eksik

Ölçüm (2026-08-12) gösterdi: `ZAYIF_KOMSU: −1.2` zayıf komşuyu cezalandırıyor ama **güçlü
komşuyu ödüllendiren simetriği hiç yazılmamış** — oysa gerçek diplomaside yiyemeyeceğin
komşuyla anlaşırsın. Oyuncunun teklif kabul oranı 0'dan 1–2'ye çıktı, "genelde
reddediyorlar" şikâyeti tamamen kalkmadı. Sıradaki aday terim bu.

### 7d. Logonun laciverti `tema.js`'ten ayrı düştü

2026-08-16'da logo laciverti matlaştırılıp açıldı (`#29435C`→`#3B5268`,
`#203448`→`#304355`) ama yalnızca ikonda. Oyun ekranındaki `ZEMIN` hâlâ eski koyu hâlinde.
Aynı açılma oyun içinde de istenirse `tema.js ZEMIN` değişecek; açılış ekranı zemini
(`#1B2A38`) de aynı kararın parçası.

### 7e. Belge borcu — Görev 11, 12, 13'ün raporu yok

CLAUDE.md §7 her görevin `GOREV-XX-RAPOR.md` ile kapanmasını istiyor. **Görev 11 hiç
belgelenmedi**; Görev 10A, 12 ve 13'ün raporu yazılmadı. Ayrıca `veri/URETIM-NOTU.md`
2026-08-12'de duruyor — 13 ve 16 Ağustos'taki işler günlüğe girmedi.

### ✅ Kapanan meseleler (önceki sürümde açıktı)

| Eski madde | Durum |
|---|---|
| **Dünya %69'da kilitleniyor** | ✅ Sebebi bulundu (silahlanma yarışı), üretim freniyle kırıldı. Fetih 241 → 513 |
| **Ses yok, dosyalar bekleniyor** | ✅ Mesele değil: ses 2026-08-12'de **KALICI olarak iptal**. Hissiyat titreşimle taşınıyor (`titresimDeseni.js`, tür+büyüklük+kim ekseni). `ses.js` kapalı anahtar olarak duruyor |
| **Arayüz cihaza ulaşmıyor** | ✅ Baki cihazda denemeler yaptı (2026-08-12). ⚠ Ama tazelenmeli: o günden sonra oyunun hissi dört yerde değişti (delicilik, üretim freni, cesaret, titreşim) |
| **Uygulama ikonu Expo şablonu** | ✅ Altı görsel de üretildi ve dört tur düzeltildi |
| **Yazı tipi lisans atfı eksik** | ✅ Ayarlar ekranına eklendi |
| **Baki 18 yaşın altında** | ✅ Bilgi yanlıştı — 19 yaşında, Play hesabını kendi adına açabilir |

---

## 8. ON DÖRT GÖREVİN ÖZETİ

| Görev | Ne geldi | Test |
|---|---|---|
| 01 | Harita, 181 parça, komşuluk grafiği | — |
| 02 | İl statları (nüfus, ekonomi, eğitim, sanayi, moral) | — |
| 03 | Sahiplik, ekonomi, tur döngüsü, kayıt | 77 |
| 03B | Haritanın yeniden bölümlenmesi (okunabilirlik ölçütüyle) | — |
| 04 | Ordu üretimi, rozetler, yatay tutuş | 140 |
| 05 | Hareket, muharebe, fetih | 249 |
| 06 | Toplanma, araştırma, yaralılar | 348 |
| 07 | Düşünen rakip (kişilik + fayda formülü) | 436 |
| 08 | Hissiyat (sahne katmanı, titreşim, kutsal savaşlar) | 496 |
| 09 | Diplomasi, mod sistemi, ana menü, üç yuva | 561 |
| 10A | Görüntü kimliği: kâğıt atlas teması, ana menü uygulaması | ⚠ kayda geçmedi |
| 11 | **Savaş ilanı** (barış varsayılan), çift hamle, el sıkışma ikonu | ⚠ kayda geçmedi |
| 12 | Karakterler, şans/arazi, diplomasi paneli, çıkış hazırlığı | ⚠ kayda geçmedi |
| 13 | Muharebe mimarisi sıfırdan, dört dal, sınırsız mod | 637 |
| — | Delicilik · araştırma ölçütü · silahlanma freni · cesaret · font · ikon | **659** |

⚠ Görev 10A–12'nin test sayıları hiçbir belgeye yazılmamış (§7e'deki belge borcunun
parçası). Bugünkü sayı ölçüldü: **659**.

---

## 9. SIRADAKİ: YAYIN

Görev 10'un planı (para kazanma, sıcak koltuk, başarımlar, ses) **artık geçerli değil**.
Bugünkü sıra `docs/YAYIN-KONTROL.md` §5'te ve kod tarafı temiz; kalanların çoğu Baki'nin
elinde:

1. **Telefonda bir maç** — hem hissi doğrular hem `SANIYE_PER_TUR`'ü ölçer (§7a)
2. **12 test kullanıcısı × 14 gün** — takvimi başlatan madde, en uzun bekleyen
3. Play Console hesabı (25 $)
4. Gizlilik politikası URL'si (tek paragraf yeter — oyun veri toplamıyor)
5. Mağaza görselleri (512×512, 1024×500, 2 telefon + **1 tablet** ekran görüntüsü)

**Reklam altyapısı kurulu ama KAPALI** (`src/para/reklam.js`, `REKLAM_HAZIR = false`,
hiçbir SDK yok). Öneri v1'i reklamsız çıkarmak: açmak Expo Go'yu bitirir, gizlilik
politikasını ve Veri Güvenliği formunu yeniden yazdırır.

Sonrası v1.5: asenkron çevrimiçi.

---

## 10. TEK CÜMLEYLE NEREDEYİZ

**Oyun bitti sayılır: motoru sağlam, dengesi ölçülmüş, çerçevesi tam, kalite kapısı altı
bölümde temiz.** Önündeki engellerin hiçbiri artık kod değil — biri takvim (12 kişi × 14
gün), biri tek bir ölçüm (bir maç oyna, saate bak), üçü de mağaza evrakı.

---

## 11. BU BELGE 2026-08-16'DA NEDEN BAŞTAN YAZILDI

Önceki sürüm 2026-08-01 tarihliydi ve **on maddesi kodun tersini söylüyordu.** Neyin
eskidiğini kayda geçiriyorum, çünkü aynı tuzak tekrar kurulabilir:

| Eskimiş iddia | Gerçek |
|---|---|
| Oyunun adı "İL SAVAŞI" | **İL SAVAŞLARI** (Görev 10A kararı, tekil yazım yanlış) |
| 561 test | 659 |
| Kayıt sürümü 9 | 16 |
| Kayıt sınırı 32 KB | Testlerin kanaryası 22 / 26 / 50 KB |
| "Savaş ilanı yok, saldırının kendisi ilan" | Görev 11 tersine çevirdi: **barış varsayılan, ilan gerekli** |
| Fetih 150 tur · %50 Hâkimiyet 70 tur | İkisi de **sınırsız** (Görev 13) |
| "Dünya %69'da kilitleniyor, en büyük denge sorunu" | Sebebi bulundu ve kırıldı — fetih 241 → 513 |
| "Ses yok, bekleyen tek şey dosyalar" | Ses **kalıcı olarak iptal** |
| "Arayüz cihaza ulaşmıyor, asıl tıkanma" | Çözüldü, Baki cihazda denedi |
| "Görev 10'da para kazanma + ses var" | Görev 10A–13 bambaşka şeyler getirdi; sıradaki yayın |

**Ders:** bir belgenin adı "durum raporu"ysa tarihi de canlı olmalı. Görev raporları
(`GOREV-XX-RAPOR.md`) ve günlük (`URETIM-NOTU.md`) tarih kaydıdır, **eskimeleri normaldir
ve düzeltilmez** — o yüzden Görev 05'in raporunda 249 test yazması hâlâ doğrudur. Bu belge
ise tek bir soruya cevap verir: *bugün neredeyiz.*
