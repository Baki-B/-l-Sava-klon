# GÖREV 04 — BİTİŞ RAPORU

> Ordu üretimi, yatay tutuş ve rozet katmanları. 2026-07-27.
> Görev tanımı: `docs/GOREV-04-ordu-uretimi.md` · Ayrıntılı günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

Kaynak biriktiriyordun ama harcayacak yerin yoktu; artık **asker basıyorsun ve ordularını
haritada görüyorsun.** Oyun yatay tutuşa geçti. Muharebe ve hareket bilerek yapılmadı —
onlar Görev 05.

---

## 2. DÖRT SORUNUN CEVABI

Belge, kod yazmadan önce dört sorunun cevaplanmasını şart koşuyordu. Dördünde de önerilen
seçeneği seçtin:

| Soru | Cevap | Ne demek |
|---|---|---|
| Ordu nerede üretilir? | **Seç ve üret** | Kendi parçana dokunursun, asker orada doğar |
| Sanayi statı ne yapar? | **Turluk üretim tavanı** | O ilde tur başına en fazla `sanayi` kadar birim |
| Garnizon/sefer ayrımı? | **Kaldırıldı** | Parça artık gerçek bir bölge, ayrım kendiliğinden oluşuyor |
| Parça başına birim sınırı? | **Yumuşak, "99+"** | Sayı sınırı yok, rozet 99'da durur |

Katman sınırlarını da sen seçtin: **uzak 0.90–1.35× · orta 1.35–2.70× · yakın 2.70–7×.**
Senin seçimin benim önerimden (1.15/2.15) iyi çıktı — elle kaydırılacak parça 4'ten 2'ye indi.

---

## 3. NE YAPILDI (adım adım)

| Adım | İş | Durum |
|---|---|---|
| 0 | Belgedeki üç kalıntı düzeltildi | ✅ |
| 1 | Yatay tutuş + yerleşim | ✅ cihazda onaylandı |
| 2 | Yakınlaştırma katmanları ölçüldü | ✅ sınırları sen onayladın |
| 3 | Ordu veri modeli + denge sabitleri | ✅ |
| 4 | Üretim ekranı | ✅ cihazda onaylandı |
| 5 | Rozetler haritada | ✅ |
| 6 | Geçen turun siparişini tekrarla | ✅ |
| 7 | Belgeler ve testler | ✅ |
| + | Akıcılık onarımı + kod düzeni | ✅ |
| + | Dokunma hassasiyeti | ⏳ cihaz testi sende |

---

## 4. DEĞİŞEN DOSYALAR

### Yeni dosyalar (15)

**Oyun mantığı**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `src/oyun/ordu.js` | 346 | Ordu modelinin tamamı: satın alma, sanayi sınırı, toplamlar, sipariş tekrarı |
| `src/oyunKancasi.js` | 276 | Oyun durumu + eylemler + türetmeler (App.js'ten ayrıldı) |
| `src/yonlendirme.js` | 57 | Yatay tutuş kilidi + Android gezinme çubuğunu gizleme |
| `src/rozetKaydirma.js` | 41 | Rozeti sığmayan yerlerin elle seçilmiş yönleri |

**Arayüz**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `src/bilesenler/UretimEkrani.js` | 263 | Asker basma ekranı ( `[−] n [+]`, bütçe, ÜRET ) |
| `src/bilesenler/Rozet.js` | 181 | Haritadaki kalkan rozeti |
| `src/bilesenler/Onay.js` | 103 | "Emin misin?" kutusu (tur bitirme) |
| `src/bilesenler/Bildirim.js` | 61 | Kendiliğinden kaybolan kısa haber |
| `src/bilesenler/KatmanIzleyici.js` | 41 | Yakınlaştırma hangi rozet takımını hazırlasın |

**Test / ölçüm / belge**
| Dosya | Satır | Ne yapar |
|---|---|---|
| `testler/ordu.test.js` | 476 | Ordu ve üretim testleri |
| `testler/rozet.test.js` | 244 | Rozet katmanı, geçiş ve kaydırma testleri |
| `scripts/rozet-katman-olcum.js` | 752 | Katman sınırı ölçüm betiği |
| `veri/rozet-katman-olcum.md` | 167 | Ölçüm sonuçları (betikten üretilir) |
| `onizleme/rozet-katman-testi.html` | 200 | Kaydırıcılı katman önizlemesi |
| `onizleme/rozet-tasarim.html` | 35 | Kalkan rozetin tasarım önizlemesi |

### Değiştirilen dosyalar

| Dosya | Ne değişti |
|---|---|
| `src/App.js` | **549 → 359 satır.** Oyun mantığı `oyunKancasi.js`'e taşındı; artık yalnızca ekran |
| `src/bilesenler/Harita.js` | Rozet katmanı, çizim ikiye ayrıldı (taban + vurgu), dokunma hassasiyeti |
| `src/denge.js` | `BIRIMLER`, `BIRIM_SIRASI`, `SANAYI_SINIRI_ACIK`, `ROZET`, `JEST` |
| `src/oyun/oyunDurumu.js` | `ordular` + `buTurUretim` + `sonSiparis` alanları, kayıt sürümü 4, `AKTOR_RENKLERI` |
| `src/oyun/turDongusu.js` | Tur sonunda sanayi sayacı sıfırlanıyor |
| `src/oyun/kayitVerisi.js` | Yeni alanların doğrulaması, sürüm 1–3 reddi |
| `src/bilesenler/IlPaneli.js` | ASKER BAS düğmesi + BURADAKİ ORDU kutusu |
| `src/bilesenler/TurCubugu.js` | TEKRARLA düğmesi |
| `src/tema.js` | `okunakliMetin()` (rozet yazısı için) |
| `src/olcu.js` | Yatay tutuş notu; kullanılmayan `sec()` silindi |
| `src/oyun/uretim.js` | Bayat Erzurum yorumu düzeltildi |
| `scripts/parca-olcum.js` | "Güncel ölçüm burası değil" uyarısı |
| `testler/kayit.test.js` | Sürüm 4 + ordu gidiş-dönüş testleri |
| `app.json` | `orientation: landscape` + `expo-screen-orientation` eklentisi |
| `docs/il-savasi-tasarim.md` | §4.2, §4.4, **§4.6 (yeni)**, §5.4, §7, §8, §13.1, §14, §15 |
| `veri/URETIM-NOTU.md` | Tüm kararların gerekçesi ve günlüğü |

### Eklenen paketler

`expo-screen-orientation` · `expo-navigation-bar`

---

## 5. BELGEYE UYMADIĞIM İKİ YER

Görev belgesi "uydurma, ölçemediğin değeri tahmin etme" diyordu; ölçtüm ve iki yerde belge
yanlış çıktı. İkisi de kayda geçirildi.

**1. Harita tipi düğmeleri dikey sütuna çevrilmedi.** Belge "yatayda yükseklik kıt, dikey
sütuna dön" diyordu — bu kendi kendisiyle çelişiyor, çünkü dikey sütun yüksekliği daha çok
yer. Ölçtüm:

| | Yatay şerit (korundu) | Dikey sütun (belgenin önerisi) |
|---|---|---|
| Yükseklikten yediği | 44 dp — **%11** | 169 dp — **%41** |
| Kapattığı toprak | **0 parça** (orası deniz) | **3–6 parça** (Hakkari, Iğdır, Doğubayazıt…) |

**2. Belgede olmayan bir ölçü ekledim: çakışma.** Belge yalnızca "rozet parçaya sığıyor mu"
diye soruyordu. Asıl okunabilirlik sorusu "rozet komşusunun rozetini eziyor mu" — bu
ölçülmeseydi orta katman kalabalıktan okunmaz çıkabilirdi.

---

## 6. TASARIMDA DOLDURDUĞUM BOŞLUKLAR

Belgede cevabı olmayan, kod yazarken karar vermem gereken yerler:

- **Sanayi sayacı kimin?** "O ilde tur başına sanayi kadar" diyordu ama sayacın sahibini
  söylemiyordu. Bir ilin parçaları iki düşmanın elindeyse tek sayacı paylaşmaları saçmaydı
  → **her tarafa ayrı sayaç.**
- **Kesirli para.** Havuz kesirli saklanıyor, ekranda aşağı yuvarlanıyor. Ekranda "18 nüfus"
  görüp 18'lik sipariş verememek açıklanamaz bir ret olurdu → **kontrol de aşağı yuvarlanıyor.**
- **Kısmi sipariş tekrarında ne basılacak?** Tek türü sonuna kadar bassaydım "2 piyade +
  2 zırhlı" siparişi bütçe yarıya inince "2 piyade"ye dönerdi → **türlerden sırayla birer
  tane**, karışımın oranı korunuyor.
- **Yarım basım hafızayı bozar mıydı?** Bozardı — sipariş her turda biraz daha küçülür,
  sen fark etmezdin → tekrarlama hafızaya dokunmuyor.

---

## 7. CİHAZ TESTİNDE ÇIKAN VE ÇÖZÜLEN SORUNLAR

| Bildirdiğin | Sebebi | Çözüm |
|---|---|---|
| Samsung düğmeleri yan yatık | Uygulama yataya kilitli ama sistem çubuğu dik kalıyor | Çubuk gizlendi |
| `setBehaviorAsync` uyarısı | SDK 54'te o çağrı desteklenmiyor | Çalışmayan satır kaldırıldı |
| `rozetKatmani is not a function` | Animasyon iş parçacığına başka dosyadan fonksiyon geçemiyor | Sınırlar düz sayı olarak geçiriliyor |
| Rozetler fazla sade | — | Daire → **kalkan** (26 px kutuda kalıyor, ölçüm geçerli) |
| Birleşme/ayrılma sert | **İki ayrı kusur:** sınırda titreme + geçişin zamana bağlı olması | Geçiş yakınlaştırmaya bağlandı, rozetler ilinin rozetinden doğuyor |
| Akıcılık azaldı | Üç yerde boşuna tam çizim | Aşağıya bak |
| Yanlışlıkla parça alıyorum | Uzun basma kaydırmanın arasına giriyordu | Üç kat koruma |
| Akıcı hareket edemiyorum | **Her sürüklemenin başında harita 12 px zıplıyordu** | Eşik telafisi eklendi |

### Akıcılık onarımının üç kalemi

1. **Aktör renk tablosunun kimliği her hamlede değişiyordu** → asker basmak ve turu
   bitirmek 181 parçanın tamamını yeniden çizdiriyordu. Renkler artık bir kez hesaplanıyor.
2. **Her dokunuşta da 181 parça yeniden çiziliyordu** → harita ikiye ayrıldı (dolgular /
   seçim çerçevesi). Dokunmanın maliyeti **181 parçadan ~6 parçaya** indi.
3. **Rozetler her ekran güncellemesinde yenileniyordu** → artık yalnızca kendi sayısı
   veya rengi değişince.

---

## 8. SAYILAR

| | Görev 03 sonu | Görev 04 sonu |
|---|---|---|
| Test | 85 | **141** |
| Kayıt sürümü | 3 | **4** |
| Kayıt boyutu | 12.9 KB | 12.0 KB (ordulu 12.8 · en kötü 24.4) |
| `App.js` | 380 satır | **359** (oyun mantığı ayrıldı) |
| Paket boyutu | 4.78 MB | 4.79 MB |

`npm run kontrol` temiz: veri tutarlı, ESLint temiz, biçim temiz, 141 test geçiyor.

---

## 9. YAPILMAYANLAR (bilerek)

Muharebe · hareket · araştırma · diplomasi · yapay zekâ · yeniden toplanma · mod seçim
ekranı · ana menü. **Kapsam üç önceki görevde kendiliğinden büyümüştü; bu görevde
büyümedi.**

Ordular üretildikleri parçada duruyor ve hareket etmiyor. Tuhaf gelebilir ama doğrusu bu:
üretim ve gösterim doğru çalışmadan muharebe kurmak, hatanın hangi katmanda olduğunu
bulunamaz hâle getirirdi.

---

## 10. SIRADAKİ: GÖREV 05 — HAREKET VE MUHAREBE

Girdiler hazır: birim statları modelde (`DENGE.BIRIMLER`), arazi çarpanları `tema.js`'te,
parça komşuluğu `veri/parca-komsuluk.json`'da (469 çift), tasarım §3.7'deki 15 satırlık
doğrulama tablosu da o görevin test verisi olacak.

**Görev 05'te tekrar karşına çıkacak iki tuzak** (ikisi de bu görevde yaşandı):
- Animasyon iş parçacığında çalışan koda başka dosyadan fonksiyon geçirilemez.
- Oyun durumundan türetilen nesnelerin kimliği her hamlede değişir; harita gibi ağır
  bileşenler onlara bağlanırsa boşuna yeniden çizilir.
