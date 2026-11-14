# KARAKTER ÖLÇÜMÜ — GÖREV 12 / ADIM 2’NİN BİTİŞ ÖLÇÜTÜ

> Üretildi: `node scripts/karakter-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Soru: **her oyun gerçekten farklı mı ilerliyor?** Aynı zorluk, aynı kapsam, oyuncu hiç
emir vermiyor; değişen tek şey TOHUM. 25 tur, 5 maç.

## KOLAY KADEME

| Tohum | Sld/Dng/Çkm | En büyük | 2. büyük | Kalan aktör | Muharebe | İlk savaş turu |
|---|---|---|---|---|---|---|
| 101 | 20/27/34 | 6 | 6 | 79 | 15 | 4 |
| 2024 | 8/29/44 | 7 | 6 | 79 | 14 | 4 |
| 31337 | 13/24/44 | 10 | 5 | 80 | 12 | 10 |
| 606060 | 12/35/34 | 5 | 5 | 81 | 11 | 8 |
| 987654 | 20/31/30 | 6 | 5 | 81 | 13 | 4 |

**Ayrışma (maçlar arası yayılım):** en büyük imparatorluk **%25.3** · muharebe sayısı **%10.9**

En büyük imparatorluk 5 ile 10 parça arasında değişiyor.

## ORTA KADEME

| Tohum | Sld/Dng/Çkm | En büyük | 2. büyük | Kalan aktör | Muharebe | İlk savaş turu |
|---|---|---|---|---|---|---|
| 101 | 31/33/17 | 10 | 7 | 64 | 127 | 2 |
| 2024 | 22/29/30 | 13 | 11 | 64 | 103 | 1 |
| 31337 | 22/26/33 | 9 | 7 | 71 | 73 | 1 |
| 606060 | 27/30/24 | 11 | 10 | 63 | 122 | 1 |
| 987654 | 26/34/21 | 5 | 5 | 74 | 82 | 1 |

**Ayrışma (maçlar arası yayılım):** en büyük imparatorluk **%27.6** · muharebe sayısı **%21.0**

En büyük imparatorluk 5 ile 13 parça arasında değişiyor.

## ZOR KADEME

| Tohum | Sld/Dng/Çkm | En büyük | 2. büyük | Kalan aktör | Muharebe | İlk savaş turu |
|---|---|---|---|---|---|---|
| 101 | 42/34/5 | 24 | 22 | 20 | 527 | 1 |
| 2024 | 34/36/11 | 22 | 15 | 31 | 555 | 1 |
| 31337 | 35/27/19 | 20 | 17 | 26 | 532 | 1 |
| 606060 | 43/28/10 | 20 | 19 | 27 | 513 | 1 |
| 987654 | 45/27/9 | 27 | 22 | 20 | 520 | 1 |

**Ayrışma (maçlar arası yayılım):** en büyük imparatorluk **%11.7** · muharebe sayısı **%2.7**

En büyük imparatorluk 20 ile 27 parça arasında değişiyor.

## NASIL OKUNUR

- **Ayrışma yüzdesi**, beş maçın birbirinden ne kadar farklı bittiğini söylüyor.
  Sıfıra yakınsa bütün maçlar aynı yerde bitiyor demektir ve karakterler işe yaramıyordur.
- **Sld/Dng/Çkm** sütunu o maçta kaç ilin hangi karakteri çektiğini gösteriyor; karışım
  `DENGE.ZEKA.KARISIM` tablosundan geliyor ve zorlukla kayıyor.
- **İlk savaş turu** karakterin tempoya etkisi: saldırganların çok olduğu maç erken kızışır.
