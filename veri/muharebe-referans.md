# MUHAREBE REFERANS ÖLÇÜMÜ

> Üretildi: `node scripts/muharebe-referans.js` — ELLE DÜZENLEME.
> Tarih: 2026-09-20

Tasarım §3.5 "zırhlı birim çarpanı"nın neye uygulandığı belirsizdi. Üç yorum da
kodlanıp §3.7 doğrulama tablosuna karşı çalıştırıldı. Hakem tablodur.

## Özet

| Yorum | Kazananı tutan satır |
|---|---|
| `hasar` | **15/15** |
| `dayaniklilik` | **15/15** |
| `ikisi` | **15/15** |

**Sonuç: ÖLÇÜT ARTIK AYIRMIYOR — üç yorum da aynı sayıda satırda kazananı tutturuyor.**

> ⚠ **Bu bir bozulma değil, ölçütün körelmesi.** Görev 05'te kararı veren şey
> kazananlar değil, tasarım §3.7'nin KALAN KUVVET ONDALIKLARIYDI (±0.02): üç yorum
> ancak o hassasiyette ayrışıyordu. O ondalıklar eski birim statlarına aitti ve
> 2026-08-08'de mimari yenilenince tablodan çıkarıldı; geriye beklenen KAZANAN kaldı.
> Kazanan, üç yorumu ayırmaya yetecek kadar ince bir ölçü değil.
>
> Kararın kendisi ayakta: `hasar` yorumu tasarım belgesine ve motora yazılı
> (`docs/il-savasi-tasarim.md` §3.5, `muharebe.js araziliHasar`). Bu bölüm artık o
> kararı YENİDEN ÖLÇMÜYOR, yalnızca üç yorumun bugünkü davranışını gösteriyor.

## Satır satır

`beklenen` = tasarımın kararı (kazanan) ve motorda ölçülmüş kalan oran.
Sütunlardaki sayılar sürekli modelin "kalan kuvveti" (birim cinsinden, kesirli).

| Senaryo | Beklenen | `hasar` | `dayaniklilik` | `ikisi` |
|---|---|---|---|---|
| 1 zırhlı vs 1 piyade (ova) | **saldıran (1.00)** | 0.80 – 0.00 ✓ | 0.81 – 0.00 ✓ | 0.83 – 0.00 ✓ |
| 1 zırhlı vs 2 piyade (ova) | **saldıran (1.00)** | 0.34 – 0.00 ✓ | 0.35 – 0.00 ✓ | 0.44 – 0.00 ✓ |
| 1 zırhlı vs 3 piyade (ova) | **savunan (1.00)** | 0.00 – 1.57 ✓ | 0.00 – 1.60 ✓ | 0.00 – 1.37 ✓ |
| 1 zırhlı vs 2 piyade (dağlık) | **savunan (1.00)** | 0.00 – 1.31 ✓ | 0.00 – 1.14 ✓ | 0.00 – 1.57 ✓ |
| 1 zırhlı vs 1 topçu (ova) | **saldıran (1.00)** | 0.61 – 0.00 ✓ | 0.65 – 0.00 ✓ | 0.66 – 0.00 ✓ |
| 1 zırhlı vs 1 topçu (tepelik) | **saldıran (1.00)** | 0.49 – 0.00 ✓ | 0.47 – 0.00 ✓ | 0.40 – 0.00 ✓ |
| 1 zırhlı vs 1 topçu (dağlık) | **savunan (1.00)** | 0.00 – 0.14 ✓ | 0.00 – 0.05 ✓ | 0.00 – 0.52 ✓ |
| 4 zırhlı vs 6 topçu (ova) | **saldıran (0.50)** | 1.03 – 0.00 ✓ | 1.12 – 0.00 ✓ | 1.42 – 0.00 ✓ |
| 4 zırhlı vs 6 topçu (tepelik) | **savunan (0.50)** | 0.00 – 1.40 ✓ | 0.00 – 1.26 ✓ | 0.00 – 1.97 ✓ |
| 4 zırhlı vs 6 topçu (dağlık) | **savunan (0.83)** | 0.00 – 3.64 ✓ | 0.00 – 2.19 ✓ | 0.00 – 4.09 ✓ |
| 1 piyade vs 1 topçu (ova) | **savunan (1.00)** | 0.00 – 0.29 ✓ | 0.00 – 0.29 ✓ | 0.00 – 0.29 ✓ |
| 2 piyade vs 1 topçu (ova) | **saldıran (1.00)** | 1.28 – 0.00 ✓ | 1.28 – 0.00 ✓ | 1.28 – 0.00 ✓ |
| 3 piyade vs 2 topçu (ova) | **saldıran (0.67)** | 1.32 – 0.00 ✓ | 1.32 – 0.00 ✓ | 1.32 – 0.00 ✓ |
| 3p+1t+1z vs 5 topçu (ova) | **saldıran (0.40)** | 0.73 – 0.00 ✓ | 0.74 – 0.00 ✓ | 0.95 – 0.00 ✓ |
| 3p+1t+1z vs 8 piyade (ova) | **savunan (0.75)** | 0.00 – 3.77 ✓ | 0.00 – 3.85 ✓ | 0.00 – 3.68 ✓ |

## Sürekli modelin kendisi

Tablo "sürekli modelin ham çıktısıdır" diyordu ama model yazılı değildi; tablo
sayılarından geri çözüldü. Kuralları:

1. Her tarafın bir CAN HAVUZU var (birimlerin dayanıklılık toplamı).
2. Tur tur ve EŞZAMANLI: iki taraf da TUR BAŞINDAKİ durumuna göre hasar verir.
3. Bir tarafın verdiği hasar, kalan can oranıyla ölçeklenir (yarısı ölmüş ordu
   yarı hasar verir). Kayıp kompozisyona orantılı olduğu için zOrt sabit kalır.
4. Bir taraf 0 cana inince biter. "Kalan kuvvet" = başlangıç birim sayısı ×
   kalan can oranı — kesirli, çünkü model kesirli birim tanıyor.

**Oyunun motoru bu değildir.** Motor tam sayı birimlerle, hasar havuzuyla ve
moral/bozgunla çalışır (§3.4, §3.8); burası yalnızca ölçüttür.

## Etkinlik tablosu (§3.3 ile karşılaştırma)

| Hedef | zOrt | Ağır net | Hafif net |
|---|---|---|---|
| Piyade | 10 | 0.76 | 0.83 |
| Topçu | 20 | 0.72 | 0.67 |
| Zırhlı | 40 | 0.64 | 0.33 |
