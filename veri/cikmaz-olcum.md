# ÇIKMAZ ÖLÇÜMÜ — GÖREV 12

> Üretildi: `node scripts/cikmaz-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Baki’nin şikâyeti: *"aynı yere 10-20 asker yığıyorlar, her tur aynı yere basıyorlar,
diğerlerini ignoreluyorlar."* Sayıya çevrilmiş hâli: **TEKRAR** = bir aktörün aynı hedefe
arka arkaya turlarda saldırıp alamaması. 25 tur × 5 tohum, oyuncu hiç emir vermiyor.

`UMUTSUZ_SALDIRI` kapısı: üstünlüğü `TABAN + TEMKIN_PAYI × temkin` eşiğinin altında kalan
saldırı ADAY OLMAKTAN ÇIKIYOR (bugün 0.50 – 0.72 bandı).

## KOLAY KADEME

| Kural | Saldırı | Başarısız | Tekrar | Tekrar oranı | En çok dövülen cephe | En büyük imparatorluk |
|---|---|---|---|---|---|---|
| Kapı KAPALI (Görev 11) | 13.0 | 0.0 | **0.0** | %0.0 | 0.0 | 6.8 |
| Kapı AÇIK (Görev 12) | 13.0 | 0.0 | **0.0** | %0.0 | 0.0 | 6.8 |

Tekrar eden saldırı **%0.0 azaldı**; en büyük imparatorluk 6.8 → 6.8 parça.

## ORTA KADEME

| Kural | Saldırı | Başarısız | Tekrar | Tekrar oranı | En çok dövülen cephe | En büyük imparatorluk |
|---|---|---|---|---|---|---|
| Kapı KAPALI (Görev 11) | 107.6 | 4.8 | **1.6** | %1.4 | 2.6 | 10.8 |
| Kapı AÇIK (Görev 12) | 101.4 | 0.6 | **0.0** | %0.0 | 0.4 | 9.6 |

Tekrar eden saldırı **%100.0 azaldı**; en büyük imparatorluk 10.8 → 9.6 parça.

## ZOR KADEME

| Kural | Saldırı | Başarısız | Tekrar | Tekrar oranı | En çok dövülen cephe | En büyük imparatorluk |
|---|---|---|---|---|---|---|
| Kapı KAPALI (Görev 11) | 532.2 | 33.8 | **3.2** | %0.6 | 2.2 | 25.8 |
| Kapı AÇIK (Görev 12) | 529.4 | 9.6 | **0.2** | %0.0 | 1.2 | 22.6 |

Tekrar eden saldırı **%93.8 azaldı**; en büyük imparatorluk 25.8 → 22.6 parça.

## NASIL OKUNUR

- **Tekrar** düşmeli: şikâyetin konusu bu. Sıfır OLMAMALI — çekimser iller büyük üstünlük
  görmeden saldırmıyor, yani onların cephesinde bekleme hâlâ var (Baki’nin isteği).
- **En büyük imparatorluk** çökmemeli: kapı fazla sıkı olursa dünya donar ve Görev 11’in
  `GENISLEME` terimiyle açtığı kilit geri gelir.
- **En çok dövülen cephe**, aynı yere üst üste kaç tur basıldığını söylüyor. Uzun zincir =
  ekranda "et değirmeni" hissi.
