# METİN YÜKÜ ÖLÇÜMÜ

> Üretim: `node scripts/metin-olcum.js` · 2026-09-25 · kural: CLAUDE.md §5/10 ·
> görev: `docs/GOREV-20-sezgi-ve-akicilik.md`. Statik sayım; kümeler betiğin başında.

## 1. Özet

| Küme | Kelime | Metin | Uzun cümle (8+ kelime) |
|---|---|---|---|
| OYUN İÇİ | 1322 | 388 | 40 |
| AÇILAN | 1169 | 300 | 38 |
| MENÜ/KAYIT | 370 | 79 | 20 |
| **TOPLAM** | **2861** | **767** | **98** |

**Hedef (GOREV-20 §4.7):** OYUN İÇİ kümede uzun cümle **0**.

## 2. Dosya başına

| Dosya | Küme | Kelime | Uzun |
|---|---|---|---|
| `bilesenler/YardimEkrani.js` | AÇILAN | 339 | 13 |
| `bilesenler/TurRaporu.js` | OYUN İÇİ | 297 | 7 |
| `oyun/kayitVerisi.js` | MENÜ/KAYIT | 228 | 17 |
| `oyun/basarimlar.js` | AÇILAN | 224 | 0 |
| `denge.js` | AÇILAN | 176 | 12 |
| `bilesenler/HareketEkrani.js` | OYUN İÇİ | 170 | 6 |
| `App.js` | OYUN İÇİ | 128 | 5 |
| `oyun/diplomasi.js` | OYUN İÇİ | 121 | 5 |
| `oyun/hareket.js` | OYUN İÇİ | 115 | 7 |
| `oyun/zeka.js` | OYUN İÇİ | 95 | 3 |
| `oyun/arastirma.js` | AÇILAN | 74 | 2 |
| `bilesenler/AyarMenusu.js` | AÇILAN | 66 | 2 |
| `oyun/mod.js` | OYUN İÇİ | 63 | 4 |
| `oyunKancasi.js` | OYUN İÇİ | 62 | 0 |
| `bilesenler/IlPaneli.js` | OYUN İÇİ | 59 | 1 |
| `para/odul.js` | AÇILAN | 58 | 1 |
| `para/reklam.js` | AÇILAN | 54 | 0 |
| `bilesenler/HataSiniri.js` | MENÜ/KAYIT | 43 | 2 |
| `veri/liderler.js` | OYUN İÇİ | 38 | 0 |
| `bilesenler/UretimEkrani.js` | AÇILAN | 37 | 1 |
| `bilesenler/AnaMenu.js` | MENÜ/KAYIT | 32 | 0 |
| `bilesenler/GenelAyarlar.js` | AÇILAN | 31 | 2 |
| `oyun/ordu.js` | OYUN İÇİ | 31 | 1 |
| `bilesenler/TurGunlugu.js` | OYUN İÇİ | 28 | 1 |
| `oyun/ayarlar.js` | AÇILAN | 28 | 3 |
| `oyun/komutan.js` | AÇILAN | 27 | 1 |
| `veri/husumetler.js` | OYUN İÇİ | 26 | 0 |
| `bilesenler/IlSecimi.js` | MENÜ/KAYIT | 20 | 0 |
| `bilesenler/HamleCubugu.js` | OYUN İÇİ | 19 | 0 |
| `bilesenler/TurCubugu.js` | OYUN İÇİ | 18 | 0 |
| `bilesenler/ModLogolari.js` | MENÜ/KAYIT | 17 | 1 |
| `bilesenler/OrdularimEkrani.js` | AÇILAN | 17 | 1 |
| `bilesenler/EgitimSeridi.js` | OYUN İÇİ | 15 | 0 |
| `oyun/sayac.js` | OYUN İÇİ | 15 | 0 |
| `bilesenler/TurPerdesi.js` | OYUN İÇİ | 14 | 0 |
| `bilesenler/DiplomasiEkrani.js` | AÇILAN | 13 | 0 |
| `oyun/senaryolar.js` | MENÜ/KAYIT | 12 | 0 |
| `bilesenler/KomutanEkrani.js` | AÇILAN | 11 | 0 |
| `bilesenler/ModSecimi.js` | MENÜ/KAYIT | 11 | 0 |
| `bilesenler/BasarimEkrani.js` | AÇILAN | 7 | 0 |
| `oyun/kayit.js` | MENÜ/KAYIT | 5 | 0 |
| `bilesenler/ArastirmaEkrani.js` | AÇILAN | 4 | 0 |
| `bilesenler/SahneKatmani.js` | OYUN İÇİ | 4 | 0 |
| `bilesenler/Muhurler.js` | AÇILAN | 3 | 0 |
| `bilesenler/Onay.js` | OYUN İÇİ | 3 | 0 |
| `yonlendirme.js` | MENÜ/KAYIT | 2 | 0 |
| `bilesenler/TurBitirDugmesi.js` | OYUN İÇİ | 1 | 0 |

## 3. OYUN İÇİ uzun cümleler — yapılacaklar listesi

Her biri ya bir görsele (vurgu, simge, renk + biçim, sayı) dönüşecek ya da kalkacak.

**`bilesenler/TurRaporu.js`**

- Savaş sonuçsuz bitti. İki taraf da yıprandı, kimse yer değiştirmedi.
- savunmasında tek bir birlik bile kalmadı; burası artık senin.
- Savaş sonuçsuz bitti. İki taraf da yıprandı, kimse yer değiştirmedi.
- Bu ordu toparlanamadı çünkü aynı tur yok oldu. Hiçbir kaynağın harcanmadı.
- Bu ordu toparlanamadı çünkü bütçen tek bir birliğe bile yetmedi.
- Bu ordu toparlanamadı çünkü iyileştirilecek ya da yerine konacak bir şey kalmamıştı.
- Bu emir işlenemedi çünkü askerin yola çıkacağı bölge elden gitmişti.

**`bilesenler/HareketEkrani.js`**

- İki taraf da kazanabilir; savaşı son raunt belirleyecek.
- Karşı taraf kendi toprağını koruyor, kolay geri çekilmez.
- Karşı tarafın ili yüksek moralli; askerleri inatçı savunur.
- Arazi dağlık; savunan taraf burada belirgin biçimde güçlü.
- tamamen savunmasız kalıyor ve düşman sınırında. Yine de gönderebilirsin.
- birlik bu tur hakkını kullandı. Piyade ve topçu turda bir, zırhlı iki kez hareket eder.

**`App.js`**

- savaşı bitirmek istiyor. Kabul edersen aranızdaki savaş hali sona erer.
- ile savaşa giriyorsun. Savaş ancak ateşkesle biter ve müttefikleri de karşına geçebilir.
- . maçta kayıtlı bir oyun var ve yeni maç onun yerine geçecek. Eski maç geri getirilemez.
- . maç kalıcı olarak silinecek. Bu kaydı geri getirmenin yolu yok.
- Sefer kaydedilsin mi? Kaydetmeden çıkarsan son kayıttan sonraki ilerleme kaybolur.

**`oyun/diplomasi.js`**

- Onu henüz tanımıyorsun. Sınırın oraya ulaşmalı ya da adı duyulmalı.
- Bu iki ilin arası tarihten beri açık. Anlaşma masası kurulmaz.
- İkiniz birden haritanın çok büyük bir kısmını tutuyorsunuz (
- Bu kavganın kendi hesabı var. Bitmeden masaya oturulmaz.
- Onunla anlaşman var. Savaş istiyorsan önce anlaşmayı bozmalısın.

**`oyun/hareket.js`**

- Bu iki ilin kendi hesabı var. Aralarındaki savaş bitene kadar bu cepheye giremezsin.
- Onunla anlaşman var. Saldırmak istiyorsan önce anlaşmayı bozmalısın.
- Onunla savaşta değilsin. Saldırmak için önce savaş ilan etmelisin.
- Bu birliklerin bir kısmı toplanmaya ayrıldı. Toplanmayı iptal edersen gönderebilirsin.
- Bu birlikler bu tur hakkını kullandı. Piyade ve topçu turda bir, zırhlı iki kez hareket eder.
- Bu ordu tam güçte — ne yaralısı var ne de kaybı.
- Yaralı birliklerin bu tur yola çıkıyor. Önce o emri iptal et.

**`oyun/zeka.js`**

- Ortak düşmanınız var; bu anlaşma ona da yarıyor.
- Aranızda eski bir hesap var; bu iki il masaya oturmaz.
- Savaşta üstün durumda; şu an bitirmeye niyeti yok.

**`oyun/mod.js`**

- Haritadaki bütün bölgeler senin oldu. Karşında duracak kimse kalmadı.
- Süre doldu ve haritanın en büyük gücü sen oldun.
- Elinde tek bir bölge bile kalmadı. Ordun dağıldı, toprağın gitti.
- Süre doldu ve senden daha büyük bir güç vardı.

**`bilesenler/IlPaneli.js`**

- Haritada bir bölgeye uzun basmak da onu sana verir.

**`oyun/ordu.js`**

- Sanayi sınırı: bu ilde bu tur en fazla

**`bilesenler/TurGunlugu.js`**

- Ordunun olduğu bölgeye dokun, parlayan hedeflerden birine iki kez dokun. Hamle hemen gerçekleşir.

