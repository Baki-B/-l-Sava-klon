# KOMUTAN ÖLÇÜMÜ

> Üretim: `node scripts/komutan-olcum.js` · 5 tohum × 40 tur, zorluk **zor**.
> Sayılar tohumların ORTALAMASI.

## 1. Komutan dünyayı ne kadar değiştiriyor

| Koşu | Canlı aktör | En büyük aktör (parça) | Sahadaki birlik | En büyük yığın |
|---|---|---|---|---|
| KOMUTAN KAPALI | 28.2 | 17.6 | 281.8 | 13.2 |
| KOMUTAN AÇIK | 27.8 | 20.4 | 259.0 | 14.4 |
| **fark** | -1.4% | +15.9% | -8.1% | +9.1% |

**Okuma kılavuzu:**
- **Canlı aktör** düşerse dünya hızlanmış (daha çok eleme) demektir.
- **En büyük aktör** çok büyürse kartopu güçlenmiş demektir — komutan güçlüyü daha da
  güçlendiriyorsa burada görünür.
- **En büyük yığın** şişerse ordular birikiyordur (2026-08-12'de kırılan silahlanma yarışı).

## 2. Bekleme cezası (`KOMUTAN.BEKLEME`)

Komutanın ordusu bozulunca kaç tur atanamadığı. Bugünkü değer **3**.

| Bekleme | Komutan düşmesi (40 turda) | Cezalı geçen tur | Canlı aktör | En büyük aktör |
|---|---|---|---|---|
| **1** | 166.4 | 0.0 | 27.0 | 18.6 |
| **2** | 153.6 | 94.8 | 28.2 | 17.6 |
| **3** | 153.8 | 183.6 | 27.8 | 20.4 |
| **5** | 146.0 | 355.0 | 26.2 | 18.6 |

**Ölçüt:** ceza hissedilmeli ama komutanı oyundan çıkarmamalı. "Cezalı geçen tur" toplamı
komutan sayısına göre çok büyükse komutan çoğu zaman sahada değil demektir.

## 3. Tohum tohum döküm (komutan AÇIK)

| Tohum | Canlı | En büyük | Birlik | En büyük yığın | Komutan düşmesi |
|---|---|---|---|---|---|
| 20260801 | 29 | 21 | 263 | 18 | 157 |
| 20260802 | 26 | 25 | 249 | 17 | 153 |
| 20260803 | 28 | 22 | 253 | 13 | 158 |
| 20260901 | 26 | 17 | 211 | 9 | 152 |
| 20260920 | 30 | 17 | 319 | 15 | 149 |
