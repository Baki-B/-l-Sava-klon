# ŞANS, ARAZİ VE BASKIN — GÖREV 12 / ADIM 3–5

> Üretildi: `node scripts/sans-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12 · eşleşme başına 4000 muharebe

## AYARLAR

| Sayı | Değer | Ne yapar |
|---|---|---|
| `SANS_BANDI` | ±%15.0 | raunt raunt dalgalanma |
| `GUN_BANDI` | ±%10.0 | muharebe başına tek zar ("o günkü hâl") |
| `BASKIN.OLASILIK` | %2.0 | denk savaşta baskın ihtimali |
| `SANS_KAPANMA_ORANI` | 2 | bu güç farkında şans tamamen kapanır |
| dağlık savunma | ×1.3 | arazinin savunana verdiği |
| tepelik savunma | ×1.1 | |

**Arazi hâlâ şanstan güçlü:** dağlık savunma %30.0 veriyor, şans bandı ±%15.0. Baki’nin istediği sıra korunuyor.

## SONUÇ

| Eşleşme | Kâğıt üstünde | Şans sönümü | Saldıran kazanma | Baskın |
|---|---|---|---|---|
| 3 piyade → 3 piyade | kaybeder | 1.00 | **%50.8** | %1.9 |
| 3 piyade → 4 piyade | kaybeder | 0.67 | **%1.2** | %1.2 |
| 2 piyade → 3 piyade | kaybeder | 0.50 | **%0.9** | %0.9 |
| 3 piyade → 2 zırhlı | kaybeder | 0.00 | **%0.0** | %0.0 |
| 2 topçu → 3 piyade | kaybeder | 0.90 | **%0.0** | %1.7 |
| 3 zırhlı → 4 piyade (dağlık) | kaybeder | 0.00 | **%0.0** | %0.0 |
| 1 piyade → 2 zırhlı | kaybeder | 0.00 | **%0.0** | %0.0 |
| 1 piyade → 3 zırhlı | kaybeder | 0.00 | **%0.0** | %0.0 |
| 1 piyade → 4 zırhlı | kaybeder | 0.00 | **%0.0** | %0.0 |
| 4 piyade → 3 piyade (dağlık) | kazanır | 0.67 | **%98.8** | %1.2 |
| 5 piyade → 3 piyade | kazanır | 0.33 | **%99.5** | %0.5 |
| 4 zırhlı → 6 topçu | kazanır | 0.94 | **%94.8** | %1.8 |

## BAKİ’NİN ÜÇ ŞARTI

**1. Umutsuz eşleşmede sürpriz 0 olmalı** → ✓ **sağlandı.** Üç umutsuz eşleşmede de şans sönümü 0, yani motor hiç zar atmıyor: ne raunt şansı, ne gün çarpanı, ne baskın. Kazanma oranı %0.

**2. Zayıf görünen ordu ~%1 kazanabilmeli** → zayıf eşleşmelerde kazanma oranı %1.2 · %0.9 · %0.0 · %0.0 · %0.0 (ortalama **%0.4**).

**3. Açık üstün olan kazanmaya devam etmeli** → üstün eşleşmelerde %98.8 · %99.5 · %94.8. Kazanılmış savaş kumara dönmüyor.

## NEDEN SADECE BANDI BÜYÜTMEK YETMEDİ

İlk denemede yalnızca `SANS_BANDI` büyütüldü (0.10 → 0.16 → 0.25). Zayıf tarafın
kazanma oranı **her üçünde de %0 kaldı**; değişen tek şey güçlünün
zaferinin bozulmasıydı (dağlıkta 4 piyade vs 3 piyade: %100 → %90). Sebep, şansın her
raundda AYRI çekilmesi — 5–10 raunt boyunca ortalamaya yakınsıyor.

Moral eşiğini düşürmek de denendi (savunana −1 ve −2 moral): **hiçbir eşleşme dönmedi.**
Motor bir yıpranma yarışı; zayıf taraf kendi bozgun eşiğine her hâlükârda önce varıyor.

Sürprizi üreten iki şey ölçümle bulundu: **gün çarpanı** (muharebe başına tek zar,
ortalamaya yakınsamıyor) ve **baskın** (savaşın yapısını değiştiren olay).
