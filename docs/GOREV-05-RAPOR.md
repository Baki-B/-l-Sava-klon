# GÖREV 05 — BİTİŞ RAPORU

> Hareket, muharebe ve fetih. 2026-07-27 → 2026-07-30.
> Görev tanımı: `docs/GOREV-05-hareket-ve-muharebe.md` · Ayrıntılı günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

Ordular üretildikleri parçada duruyordu; artık **komşu parçaya yürüyor, çarpışıyor,
bozguna uğrayıp çekiliyor ve toprak el değiştiriyor.** Karşında savunacak birileri var:
her parçaya kuruluş garnizonu kondu.

---

## 2. BEŞ SORUNUN CEVABI

Belge, kod yazmadan önce beş sorunun cevaplanmasını şart koşuyordu.

| Soru | Cevabın | Öneri | Ne demek |
|---|---|---|---|
| 1 — Muharebe ne zaman çözülür? | **B: Emir kuyruğu** | A idi | Hamleleri dizersin, TURU BİTİR'de hepsi çözülür |
| 2 — Karşı tarafın ordusu? | **A: Kuruluş garnizonu** | A | Her parçaya ilin statlarından türeyen savunma ordusu |
| 3 — Hareket hakkı / kısmi gönderim | **A: Seç ve gönder** | A (zorunlu) | Kaçını göndereceğini seçersin, kalanlar savunur |
| 4 — Bozgunda çekilme yönü | **A: Motor seçer** | A | Kural belli, oyuncuya sorulmaz |
| 5 — Yeniden toplanma kapsamda mı? | **B: Görev 06'ya** | B | Ordular şimdilik yıprandıkça erir |

**1. soruda öneriden saptın** ve bunun bir bedeli oldu — belgede yazıyordu (oklar, iptal,
çakışma), üçü de yapıldı. Üstüne belgede öngörülmeyen iki şey daha çıktı:

- **Onay kutusunun yeri değişti.** Kuyrukta emir vermek geri alınabilir bir iş; projenin
  "onay yalnızca geri alınamaz işte sorulur" kuralı gereği onay TURU BİTİR'e taşındı.
- **"Muharebe sonuç kutusu" tur raporuna dönüştü** — bir turda birden çok muharebe olabiliyor.

Buna karşılık kuyruk bir işi de **ortadan kaldırdı**: "her birimin turda tek hamle hakkı"
için ayrı bir bayrak yazmaya gerek kalmadı, rezervasyonun kendisi hamle hakkı defteri oldu.
Art arda fetih zinciri de kendiliğinden imkânsız.

---

## 3. NE YAPILDI

| Adım | İş | Durum |
|---|---|---|
| 0 | Denge sayılarının yeri + `tema.js` düzeltmesi | ✅ |
| 1 | Muharebe motoru + §3.7 tablosunun yeniden üretilmesi | ✅ 15/15 |
| 2 | Hareket kuralları ve emir kuyruğu | ✅ |
| 3 | Fetih ve il el değiştirmesi | ✅ |
| 4 | Bozgun ve geri çekilme | ✅ |
| 5 | Arayüz: savaş odası, emir listesi, tur raporu, oklar | ✅ |
| 6 | Kuruluş garnizonu | ✅ |
| 7 | Belgeler, testler, kayıt sürümü 5 | ✅ |
| + | Cihaz geri bildirimi: akıcılık onarımı (altı tur) | ✅ |
| + | Cihaz geri bildirimi: savaş odası, ASKER TAŞI ayrımı, TEKRARLA kaldırma | ✅ |

---

## 4. EN DEĞERLİ BULGU: §3.7 TABLOSUNUN MODELİ GERİ ÇÖZÜLDÜ

Tasarım §3.7'deki 15 satırlık doğrulama tablosu "sürekli modelin ham çıktısıdır" diyordu ama
**modelin kendisi hiçbir yerde yazılı değildi.** Tablo sayılarından geri çözüldü:

1. Her tarafın bir can havuzu var (birimlerin dayanıklılık toplamı).
2. Tur tur ve eşzamanlı: iki taraf da tur başındaki durumuna göre vurur.
3. Verilen hasar, kalan can oranıyla ölçeklenir.
4. "Kalan kuvvet" = başlangıç birim sayısı × kalan can oranı.

Model `scripts/muharebe-referans.js`'e kondu ve 15 satırı ±0.02 ile yeniden üretiyor.
Bu sayede tasarımın **en büyük belirsizliği tahminle değil ölçümle** kapandı:

**"Zırhlı birim çarpanı" neye uygulanır?** Üç yorum da kodlanıp tabloya karşı çalıştırıldı
(`veri/muharebe-referans.md`):

| Yorum | 15 satırdan kaçı tuttu |
|---|---|
| **hasar** (zırhlının verdiği hasarı çarpar) | **15/15** |
| dayanıklılık | 6/15 |
| ikisi birden | 3/15 |

**Tasarımda olmayıp eklenen bir kural:** ilk uygulama 15 satırın 12'sini tutturdu. Tutmayan
üçü tesadüf değildi — hepsi sürekli modelde kıl payı biten satırlardı (0.18, 0.07, 1.50
kalan kuvvet). Hasar eşzamanlı olduğu için tam sayı motorda iki taraf aynı turda birden imha
oluyor ya da birden bozuluyor. Çözüm ad hoc değil, **sürekli modelin kendi ölçütü**: oransal
olarak daha az yıpranmış taraf üstündür, eşitlikte savunan (toprak onda). Kural konunca
**15/15** oldu ve öteki 12 satır değişmedi.

---

## 5. TASARIMDA DOLDURULAN BOŞLUKLAR

Görev belgesi sekiz boşluk listelemişti; hepsi dolduruldu ve gerekçesi yazıldı.

| Boşluk | Doldurma |
|---|---|
| Zırhlı arazi çarpanı neye uygulanır | Verdiği **hasara** — ölçümle (yukarıda) |
| Hasar eşzamanlı mı | Eşzamanlı; sıralı olsaydı "kim önce vurur" gizli ve çok güçlü bir kural olurdu |
| Orantılı kayıp tam sayıya nasıl bölünür | En büyük artık, eşitlikte `BIRIM_SIRASI` → belirlenimci |
| Şansın "kuvvet oranı" ölçüsü | **Ham hasar** (arazi ve şans öncesi), birim sayısı değil |
| Muharebe kaç tur sürer | Bozguna/imhaya kadar, üst sınır 20 → berabere |
| Moral bonusları nereden okunur | Moral statı parçanın ilinden, dağlık parçanın arazisinden, kendi toprağı sahiplikten. "Yüksek" eşiği **5** (81 ilin 23'ü) |
| Hasar havuzu kimin | Parçadaki ordunun; bölününce **birim sayısına oranla** bölünür |
| Fetih ganimeti (%60) somut olarak ne | Parçanın **nüfus payının %60'ı, tek seferlik nüfus** (seferberlik). Ekonomi ganimeti yok |

---

## 6. BELGEYE UYMADIĞIM YERLER

**1. `hamleHakki` alanı yazılmadı** (§5 veri modeli öneriyordu). Anında çözüm varsayımıyla
yazılmıştı; kuyrukta rezervasyonun kendisi hamle hakkı. İkisini birden tutmak aynı kuralı iki
yerde tutmak olurdu.

**2. Hedef seçme kipinde "ötekiler soluklaşır" yapılmadı** (§6/Adım 5). Solukluk 181 parçanın
dolgusuna dokunuyor, yani harita her kip açılışında baştan kurulurdu — görev belgesinin kendi
§9/2 tuzağı. Yerine hedefler vurgu katmanında renkle işaretleniyor.

**3. Emirler sırayla çözülüyor, birleşik saldırı yok.** Aynı hedefe giden iki emir omuz omuza
vurmuyor, arka arkaya vuruyor. Eşzamanlı çözüm üç yeni kural isterdi (birleşik orduda kayıp
hangi kaynağa yazılır, çekilme nereye olur, havuz nasıl bölünür). Bedeli oyuncudan
saklanmıyor: emirler arayüzde numaralı.

**4. Garnizonda tohumlu rastgelelik kullanılmadı.** Formül tamamen veriden türüyor, yani zaten
belirlenimci. Faydası: her oyun aynı adil açılışla başlıyor ve üreteç kurulumda hiç
ilerlemediği için muharebelerin şansı tohumla birebir eşleşiyor.

---

## 7. CİHAZ TESTİNDE ÇIKANLAR

Altı tur geri bildirim aldı. Oyun mantığında tek bir hata çıkmadı; **hepsi arayüz ve
akıcılıktı.**

### 7.1 Oyun akışı

| Bildirdiğin | Sebep | Çözüm |
|---|---|---|
| "+1 yaptı direkt gidiyor" | Kuvvet seçici arkayı karartmıyordu; harita jesti yerel katmanda olduğu için üstteki kutunun dokunmayı yutması garanti değil | Açık menü varken haritanın jesti susuyor + savaş odası tam perde |
| "Savaş için ortada yeni menü olsun, detaylar orada" | Üretim ekranının dar kutusu muharebe kararına yetmiyordu | **Savaş odası**: iki sütun, büyük sayaçlar, TÜMÜ/YARISI/SIFIRLA, savunanın kadrosu, moral sebepleri, tahmin |
| "Sonuç ekranında savaş detayları gözüksün" | — | Tür tür kayıplar, kadrolar, moral, arazi + açılır **tur tur döküm** tablosu |
| "Tekrarla düğmesi gereksiz" | Hareket gelince turun asıl işi asker basmak değil sürmek oldu | Düğme, kanca, `siparisiTekrarla`, `sonSiparis` ve 10 test kaldırıldı |
| "Kendi bölgemize SALDIR ile transfer ediyoruz" | Tek düğme iki farklı eylemi karşılıyordu | **ASKER TAŞI** ile **SALDIR** ayrıldı (sahipliğe göre). Boş düşman parçası da saldırı sayılıyor — orada toprak el değiştiriyor |

### 7.2 Akıcılık — altı turluk bir kovalamaca

**Kök sebep benim hatamdı.** Görev 04'ün performans dayanağı açıkça *"boş parçada rozet yok,
181 rozet asla aynı anda çizilmez"* varsayımıydı. Kuruluş garnizonları her parçaya ordu
koyunca o varsayım çöktü: 181 parça + 81 il rozeti.

| Tur | Bildirdiğin | Bulduğum |
|---|---|---|
| 1 | "Takılma var, yavaş" | Her rozetin kendi canlandırması vardı → maliyet rozet **sayısıyla** orantılı |
| 2 | "Hâlâ var" | Ayıklama jest sırasında React tazeliyordu; 270 vektör yollu harita ağacı baştan uzlaştırılıyordu |
| 3 | "Her harekette titriyor" | Yerler hareket sırasında kesikli hesaplanıyordu; JS ile UI iş parçacığı aynı kareye denk gelmiyordu |
| 4 | "Azalmış ama var" | Kalan tazeleme kaynağı yine ayıklamaydı |
| 5 | "Soldaki rozetler yüklenmiyor, **yarısı yüklenmiş** kalıyor" | Donanım dokusu görünüm sınırında **kesiyordu** — bunu ben eklemiştim |
| 6 | **"Yerlerini sabit yapsak, kaydırınca yeniden yüklenmese?"** | **Kök buydu.** Yer kaydırmaya bağlıydı |

**Senin 6. turdaki teşhisin doğru çıktı.** Rozetin yeri artık **kaydırma sıfırken**
hesaplanıyor; kaydırmayı kapsayıcının kendi ötelemesi taşıyor:

```
sabit yer  P₀ = ekran(x, y, z₀, kaydırma = 0)
kapsayıcı  ölçek k = z/z₀, öteleme (tx, ty)
sonuç      cx + (P₀ − cx)·k + tx = ekran(x, y, z, tx, ty)   ✓ birebir
```

Sonuç: kaydırmada JS tarafında **sıfır iş**, kare başına tek görünüm güncellemesi.
Ayıklama tamamen kaldırıldı (yer kaydırmadan bağımsız olunca gereği kalmadı). Harita dokusu
yalnızca yakınlaştırmada açılıyor — kaydırmada dokuyu oluşturmanın faydası yoktu, sadece
hareketin ilk karesinde takılma yapıyordu.

**Kalıcılık için:** harita↔ekran çevirisi üç ayrı yerde elle kopyalanmıştı (dokunma testi,
rozet kaydırma denetimi, rozet yerleşimi). Ayrışmaları tam da "rozet haritayla aynı yerde
durmuyor" demekti. Hepsi `src/haritaDonusum.js`'e indi ve **`haritaDonusum.test.js`** ileri-geri
çevirinin, sabit yerleşim eşitliğinin (1000+ birleşim) ve rozet–dokunma uyumunun doğru
kaldığını kilitliyor. `RozetKatmani.js`'in başında üç değişmez kural ve sebepleri yazılı.

---

## 8. DEĞİŞEN DOSYALAR

### Yeni (15)

**Oyun mantığı**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `src/oyun/muharebe.js` | 369 | Muharebe motoru — saf, oyun durumunu tanımaz |
| `src/oyun/cozum.js` | 367 | Emir kuyruğunun çözümü: muharebe, çekilme, fetih, rapor |
| `src/oyun/hareket.js` | 235 | Ne emredebilirsin: komşuluk, rezervasyon, uyarı |
| `src/oyun/garnizon.js` | 79 | Kuruluş garnizonu |
| `src/oyun/fetih.js` | 70 | Parça/il el değiştirmesi + ganimet |

**Arayüz**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `src/bilesenler/HareketEkrani.js` | 503 | Savaş odası |
| `src/bilesenler/TurRaporu.js` | 348 | Tur sonucu + tur tur döküm |
| `src/bilesenler/RozetKatmani.js` | 165 | Rozet katmanı (sabit yerleşim) |
| `src/bilesenler/EmirListesi.js` | 123 | Emir kuyruğu + iptal |
| `src/haritaDonusum.js` | 116 | Harita↔ekran çevirisinin tek kaynağı |

**Ölçüm ve testler**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `testler/hareket.test.js` | 664 | Hareket, çözüm, fetih (49 test) |
| `testler/muharebe.test.js` | 431 | Motor + §3.7 tablosu (40 test) |
| `scripts/muharebe-referans.js` | 244 | Sürekli referans model + yorum ölçümü |
| `testler/haritaDonusum.test.js` | 190 | Dönüşüm ve sabit yerleşim kilidi (11 test) |
| `testler/garnizon.test.js` | 141 | Garnizon (15 test) |

### Silinen

`src/bilesenler/KatmanIzleyici.js` — katman kararı artık JS'te veriliyor, ayrı worklet gereksiz.

---

## 9. SAYILAR

| | Görev 04 sonu | Görev 05 sonu |
|---|---|---|
| Test | 141 | **249** |
| Kayıt sürümü | 4 | **5** (1–4 reddediliyor) |
| Kayıt boyutu | 12.0 KB | **21.6 KB** (garnizonlar 181 parçaya ordu koyuyor) |
| Ordu kaydı | 0 | 181 parça · **470 birim** |
| Paket boyutu | 4.79 MB | 5.49 MB |
| `App.js` | 359 | 508 |

`npm run kontrol` temiz: veri tutarlı, ESLint temiz, biçim temiz, 249 test geçiyor.
`npx expo export` hatasız.

**Denge gözlemi** (bütçesi sınırsız bir oyuncuyla 15 tur): tur 1'de 3 emir / 3 fetih,
tur 10'da 21 emir / 14 fetih, tur 15 sonunda 90/181 parça. Erken turlarda saldırıların
yaklaşık yarısı kırılıyor — garnizonlar iş görüyor.

---

## 10. YAPILMAYANLAR VE BİLİNEN BORÇLAR

**Bilerek yapılmayanlar:** yeniden toplanma (Soru 5 → Görev 06) · araştırma (§6) · yapay zekâ
(§9, Görev 07) · diplomasi · rekabet olayları · kazanma koşulu ekranı · mod seçim ekranı.

**Bilinen ve kabul edilen kusurlar:**

1. **Kartopu.** Garnizon tükenince yerine yenisi gelmiyor, ilerledikçe direnç azalıyor.
   Görev belgesinde bilerek kabul edilmişti; düzelteni Görev 07'nin yapay zekâsı.
2. **İl rozeti gürültüsü.** 1.35×–2.7× arasında 81 ilin hepsinde rozet var (Görev 05'ten önce
   yalnızca ordusu olanlarda vardı). Görsel bir karar; istersen "garnizondan farklı orduya
   sahip iller" gibi bir süzme eklenebilir.
3. **Akıcılıkta kalıntı olursa** sırayla denenecek üç tek satır `veri/URETIM-NOTU.md`'nin
   sonunda yazılı (`HARITA_JEST_DOKUSU` · rozet gölgesi · katman eşikleri).

---

## 11. SIRADAKİ: GÖREV 06

Tasarım §15'e göre sırada **yeniden toplanma (§3.9/2) ve araştırma (§6)** var. İkisi de
ekonomi mekaniği; muharebe artık ölçülebilir olduğu için "yarı fiyata doldurma"nın dengeye
etkisi de ölçülebilir.

**Hazır girdiler:** hasar havuzu turlar arası hatırlanıyor · `DENGE`'de
`TOPLANMA_INDIRIMI` için yer ayrılmış · tur döngüsünde 4. aşama (toplanma) yeri boş duruyor ·
muharebe motoru saf olduğu için toplanma sonrası ordular aynı yoldan sınanabilir.

**Görev 06'da tekrar karşına çıkacak üç tuzak** (üçü de bu görevde yaşandı):
- Üstteki kutu, yerel katmandaki harita jestini engellemez — jestin kendisi susturulmalı.
- Canlandırma stili taşıyan görünüm hareket sırasında React'çe yeniden çizilmemeli.
- Donanım dokusu görünümün sınırlarında keser; içerik sınırları doldurmuyorsa kullanılmaz.
