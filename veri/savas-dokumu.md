# SAVAŞ SENARYOSU DÖKÜMÜ

> Üretici: `node scripts/savas-dokumu.js` · şanslı koşular 400 tohum
> Moral bonusu YOK (motorun kendisi ölçülüyor, oyundaki bir muharebe değil).

Ayar: `SANS_BANDI 0.15` · `GUN_BANDI 0.1` ·
`BASKIN 0.02` · `bozgun tabanı 0.4`

---

## Nasıl okunur

Her muharebe **raunt raunt** çözülüyor ve iki taraf **aynı anda** vuruyor. Bir ordu
canının en az **40%**'ini kaybedince bozguna uğrayıp çekiliyor —
imha edilmesi gerekmiyor. Eşik tek bir sayı değil: taban bu, ilin moral statı ve durum
kalemleri üstüne ekliyor (`denge.js MUHAREBE.MORAL`).

Üç şey sonucu kaydırıyor ve üçü de yalnızca **güçler yakınken** devrede:
- **Raunt şansı** (±%15) — her raunt ayrı çekiliyor,
  uzun savaşta ortalamaya yakınsıyor
- **Gün çarpanı** (±%10) — muharebe başına **tek** zar,
  bütün savaş boyunca sabit. Asıl sürprizi bu üretiyor.
- **Baskın** (%2) — zayıf taraf ilk raundu
  bedavaya alır

Güç farkı 2 katı aşınca üçü de **sıfırlanıyor**: umutsuz eşleşmede
sürpriz yok.

---

## 1. SAF EŞLEŞMELER

Tek tür karşı tek tür. "Kalan" sütunu şanssız koşunun sonucu: saldıranda kaç birim kaldı /
savunanda kaç birim kaldı.

### Ova

| Saldıran → Savunan | Kazanan | Kalan | Raunt | Şanslı: saldıran kazanma |
|---|---|---|---|---|
| 1P → 1P | savunan | 1 / 1 | 1 | %49.8 |
| 2P → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3P → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2P → 2P | savunan | 1 / 1 | 1 | %49.8 |
| 3P → 2P | SALDIRAN | 2 / 1 | 1 | %99.0 |
| 4P → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3P → 3P | savunan | 2 / 2 | 1 | %49.8 |
| 4P → 3P | SALDIRAN | 3 / 1 | 1 | %98.3 |
| 1P → 1T | savunan | 1 / 1 | 1 | %0.8 |
| 2P → 1T | SALDIRAN | 2 / 0 | 1 | %98.3 |
| 3P → 1T | SALDIRAN | 3 / 0 | 1 | %99.5 |
| 2P → 2T | savunan | 1 / 1 | 1 | %0.8 |
| 3P → 2T | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 4P → 2T | SALDIRAN | 3 / 0 | 1 | %98.3 |
| 3P → 3T | savunan | 1 / 2 | 1 | %0.8 |
| 4P → 3T | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 1P → 1Z | savunan | 1 / 1 | 1 | %0.0 |
| 2P → 1Z | savunan | 2 / 1 | 1 | %0.8 |
| 3P → 1Z | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 2P → 2Z | savunan | 1 / 2 | 1 | %0.0 |
| 3P → 2Z | savunan | 2 / 2 | 1 | %0.0 |
| 4P → 2Z | savunan | 3 / 2 | 1 | %0.8 |
| 3P → 3Z | savunan | 1 / 3 | 1 | %0.0 |
| 4P → 3Z | savunan | 2 / 3 | 1 | %0.0 |
| 1T → 1P | SALDIRAN | 1 / 1 | 1 | %99.3 |
| 2T → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2P | SALDIRAN | 1 / 1 | 1 | %99.3 |
| 3T → 2P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 4T → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3T → 3P | SALDIRAN | 2 / 1 | 1 | %99.3 |
| 4T → 3P | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 1T → 1T | savunan | 1 / 1 | 1 | %49.8 |
| 2T → 1T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 1T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2T | savunan | 1 / 1 | 1 | %49.8 |
| 3T → 2T | SALDIRAN | 2 / 0 | 1 | %99.0 |
| 4T → 2T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3T → 3T | savunan | 1 / 1 | 1 | %49.8 |
| 4T → 3T | SALDIRAN | 2 / 0 | 1 | %98.3 |
| 1T → 1Z | savunan | 0 / 1 | 1 | %1.5 |
| 2T → 1Z | savunan | 1 / 1 | 1 | %6.8 |
| 3T → 1Z | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 2T → 2Z | savunan | 0 / 2 | 1 | %1.5 |
| 3T → 2Z | savunan | 1 / 1 | 1 | %4.8 |
| 4T → 2Z | SALDIRAN | 2 / 1 | 1 | %98.5 |
| 3T → 3Z | savunan | 0 / 2 | 1 | %1.5 |
| 4T → 3Z | savunan | 1 / 2 | 1 | %2.0 |
| 1Z → 1P | SALDIRAN | 1 / 1 | 1 | %100.0 |
| 2Z → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3Z → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2P | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 4Z → 2P | SALDIRAN | 4 / 0 | 1 | %100.0 |
| 3Z → 3P | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 4Z → 3P | SALDIRAN | 4 / 0 | 1 | %100.0 |
| 1Z → 1T | SALDIRAN | 1 / 0 | 1 | %98.5 |
| 2Z → 1T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3Z → 1T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2T | SALDIRAN | 2 / 0 | 1 | %98.5 |
| 3Z → 2T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 4Z → 2T | SALDIRAN | 4 / 0 | 1 | %100.0 |
| 3Z → 3T | SALDIRAN | 2 / 0 | 1 | %98.5 |
| 4Z → 3T | SALDIRAN | 3 / 0 | 1 | %99.8 |
| 1Z → 1Z | savunan | 1 / 1 | 1 | %49.8 |
| 2Z → 1Z | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 1Z | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2Z | savunan | 2 / 2 | 1 | %49.8 |
| 3Z → 2Z | SALDIRAN | 3 / 1 | 1 | %99.0 |
| 4Z → 2Z | SALDIRAN | 4 / 1 | 1 | %100.0 |
| 3Z → 3Z | savunan | 2 / 2 | 1 | %49.8 |
| 4Z → 3Z | SALDIRAN | 3 / 2 | 1 | %98.3 |

### Tepelik

| Saldıran → Savunan | Kazanan | Kalan | Raunt | Şanslı: saldıran kazanma |
|---|---|---|---|---|
| 1P → 1P | savunan | 1 / 1 | 1 | %26.0 |
| 2P → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3P → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2P → 2P | savunan | 1 / 1 | 1 | %26.0 |
| 3P → 2P | SALDIRAN | 2 / 1 | 1 | %99.0 |
| 4P → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3P → 3P | savunan | 2 / 2 | 1 | %26.0 |
| 4P → 3P | SALDIRAN | 3 / 1 | 1 | %98.3 |
| 1P → 1T | savunan | 1 / 1 | 1 | %0.8 |
| 2P → 1T | SALDIRAN | 2 / 0 | 1 | %98.3 |
| 3P → 1T | SALDIRAN | 3 / 0 | 1 | %99.5 |
| 2P → 2T | savunan | 1 / 1 | 1 | %0.8 |
| 3P → 2T | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 4P → 2T | SALDIRAN | 3 / 0 | 1 | %98.3 |
| 3P → 3T | savunan | 1 / 2 | 1 | %0.8 |
| 4P → 3T | SALDIRAN | 2 / 1 | 1 | %97.3 |
| 1P → 1Z | savunan | 1 / 1 | 1 | %0.0 |
| 2P → 1Z | savunan | 2 / 1 | 1 | %22.8 |
| 3P → 1Z | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 2P → 2Z | savunan | 1 / 2 | 1 | %0.0 |
| 3P → 2Z | savunan | 2 / 2 | 1 | %0.0 |
| 4P → 2Z | savunan | 3 / 2 | 1 | %21.5 |
| 3P → 3Z | savunan | 1 / 3 | 1 | %0.0 |
| 4P → 3Z | savunan | 2 / 3 | 1 | %0.0 |
| 1T → 1P | SALDIRAN | 1 / 1 | 1 | %99.3 |
| 2T → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2P | SALDIRAN | 1 / 1 | 1 | %99.3 |
| 3T → 2P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 4T → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3T → 3P | SALDIRAN | 2 / 1 | 1 | %99.3 |
| 4T → 3P | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 1T → 1T | savunan | 1 / 1 | 1 | %26.0 |
| 2T → 1T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 1T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2T | savunan | 1 / 1 | 1 | %26.0 |
| 3T → 2T | SALDIRAN | 2 / 0 | 1 | %99.0 |
| 4T → 2T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3T → 3T | savunan | 1 / 1 | 1 | %26.0 |
| 4T → 3T | SALDIRAN | 2 / 0 | 1 | %98.3 |
| 1T → 1Z | savunan | 1 / 1 | 1 | %1.5 |
| 2T → 1Z | SALDIRAN | 2 / 1 | 1 | %96.8 |
| 3T → 1Z | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2Z | savunan | 1 / 2 | 1 | %1.5 |
| 3T → 2Z | savunan | 2 / 1 | 1 | %44.3 |
| 4T → 2Z | SALDIRAN | 3 / 1 | 1 | %98.5 |
| 3T → 3Z | savunan | 1 / 2 | 1 | %1.5 |
| 4T → 3Z | savunan | 2 / 2 | 1 | %5.0 |
| 1Z → 1P | SALDIRAN | 1 / 1 | 1 | %100.0 |
| 2Z → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3Z → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2P | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 4Z → 2P | SALDIRAN | 4 / 0 | 1 | %100.0 |
| 3Z → 3P | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 4Z → 3P | SALDIRAN | 4 / 1 | 1 | %100.0 |
| 1Z → 1T | SALDIRAN | 1 / 1 | 1 | %98.5 |
| 2Z → 1T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3Z → 1T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2T | SALDIRAN | 2 / 1 | 1 | %98.5 |
| 3Z → 2T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 4Z → 2T | SALDIRAN | 4 / 0 | 1 | %100.0 |
| 3Z → 3T | SALDIRAN | 2 / 1 | 1 | %98.5 |
| 4Z → 3T | SALDIRAN | 3 / 0 | 1 | %99.8 |
| 1Z → 1Z | savunan | 1 / 1 | 1 | %26.0 |
| 2Z → 1Z | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 1Z | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2Z | savunan | 2 / 2 | 1 | %26.0 |
| 3Z → 2Z | SALDIRAN | 3 / 1 | 1 | %99.0 |
| 4Z → 2Z | SALDIRAN | 4 / 1 | 1 | %100.0 |
| 3Z → 3Z | savunan | 2 / 2 | 1 | %26.0 |
| 4Z → 3Z | SALDIRAN | 3 / 2 | 1 | %98.3 |

### Dağlık

| Saldıran → Savunan | Kazanan | Kalan | Raunt | Şanslı: saldıran kazanma |
|---|---|---|---|---|
| 1P → 1P | savunan | 1 / 1 | 1 | %5.3 |
| 2P → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3P → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2P → 2P | savunan | 1 / 1 | 1 | %5.3 |
| 3P → 2P | SALDIRAN | 2 / 1 | 1 | %99.0 |
| 4P → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3P → 3P | savunan | 1 / 2 | 1 | %5.3 |
| 4P → 3P | SALDIRAN | 2 / 1 | 1 | %98.3 |
| 1P → 1T | savunan | 1 / 1 | 1 | %0.8 |
| 2P → 1T | SALDIRAN | 2 / 0 | 1 | %95.0 |
| 3P → 1T | SALDIRAN | 3 / 0 | 1 | %99.5 |
| 2P → 2T | savunan | 1 / 1 | 1 | %0.8 |
| 3P → 2T | SALDIRAN | 2 / 1 | 1 | %98.0 |
| 4P → 2T | SALDIRAN | 3 / 0 | 1 | %98.3 |
| 3P → 3T | savunan | 1 / 2 | 1 | %0.8 |
| 4P → 3T | SALDIRAN | 2 / 1 | 1 | %66.3 |
| 1P → 1Z | savunan | 1 / 1 | 1 | %0.0 |
| 2P → 1Z | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3P → 1Z | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 2P → 2Z | savunan | 1 / 2 | 1 | %0.0 |
| 3P → 2Z | savunan | 2 / 2 | 1 | %0.0 |
| 4P → 2Z | SALDIRAN | 3 / 2 | 1 | %100.0 |
| 3P → 3Z | savunan | 2 / 3 | 1 | %0.0 |
| 4P → 3Z | savunan | 3 / 3 | 1 | %0.0 |
| 1T → 1P | savunan | 1 / 1 | 1 | %48.5 |
| 2T → 1P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2P | savunan | 1 / 1 | 1 | %48.5 |
| 3T → 2P | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 4T → 2P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 3T → 3P | savunan | 1 / 1 | 1 | %48.5 |
| 4T → 3P | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 1T → 1T | savunan | 0 / 1 | 1 | %5.3 |
| 2T → 1T | SALDIRAN | 1 / 0 | 1 | %100.0 |
| 3T → 1T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 2T → 2T | savunan | 0 / 1 | 1 | %5.3 |
| 3T → 2T | SALDIRAN | 1 / 0 | 1 | %99.0 |
| 4T → 2T | SALDIRAN | 2 / 0 | 1 | %100.0 |
| 3T → 3T | savunan | 0 / 1 | 1 | %5.3 |
| 4T → 3T | SALDIRAN | 1 / 0 | 1 | %98.3 |
| 1T → 1Z | savunan | 1 / 1 | 1 | %1.5 |
| 2T → 1Z | SALDIRAN | 2 / 1 | 1 | %98.5 |
| 3T → 1Z | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2T → 2Z | savunan | 1 / 2 | 1 | %1.5 |
| 3T → 2Z | SALDIRAN | 2 / 1 | 1 | %92.3 |
| 4T → 2Z | SALDIRAN | 3 / 1 | 1 | %98.5 |
| 3T → 3Z | savunan | 2 / 2 | 1 | %1.5 |
| 4T → 3Z | SALDIRAN | 3 / 2 | 1 | %78.0 |
| 1Z → 1P | SALDIRAN | 1 / 1 | 1 | %100.0 |
| 2Z → 1P | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 1P | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2P | SALDIRAN | 2 / 2 | 1 | %100.0 |
| 3Z → 2P | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 4Z → 2P | SALDIRAN | 4 / 1 | 1 | %100.0 |
| 3Z → 3P | SALDIRAN | 3 / 2 | 1 | %100.0 |
| 4Z → 3P | SALDIRAN | 4 / 2 | 1 | %100.0 |
| 1Z → 1T | savunan | 1 / 1 | 1 | %22.0 |
| 2Z → 1T | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 1T | SALDIRAN | 3 / 0 | 1 | %100.0 |
| 2Z → 2T | savunan | 1 / 2 | 1 | %22.0 |
| 3Z → 2T | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 4Z → 2T | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 3Z → 3T | savunan | 2 / 2 | 1 | %22.0 |
| 4Z → 3T | SALDIRAN | 3 / 2 | 1 | %99.8 |
| 1Z → 1Z | savunan | 1 / 1 | 1 | %5.3 |
| 2Z → 1Z | SALDIRAN | 2 / 1 | 1 | %100.0 |
| 3Z → 1Z | SALDIRAN | 3 / 1 | 1 | %100.0 |
| 2Z → 2Z | savunan | 2 / 2 | 1 | %5.3 |
| 3Z → 2Z | SALDIRAN | 3 / 2 | 1 | %99.0 |
| 4Z → 2Z | SALDIRAN | 4 / 2 | 1 | %100.0 |
| 3Z → 3Z | savunan | 3 / 3 | 1 | %5.3 |
| 4Z → 3Z | SALDIRAN | 4 / 3 | 1 | %98.3 |

---

## 2. ARAZİ AYNI SAVAŞI NASIL ÇEVİRİYOR

| Eşleşme | Ova | Tepelik | Dağlık |
|---|---|---|---|
| 1Z → 1T | S (%99) | S (%99) | D (%22) |
| 1Z → 2P | S (%99) | D (%0) | D (%0) |
| 2Z → 2T | S (%99) | S (%99) | D (%22) |
| 3Z → 4P | S (%100) | S (%100) | D (%0) |
| 4Z → 6T | S (%94) | D (%10) | D (%2) |
| 2T → 3P | D (%0) | D (%0) | D (%0) |
| 4P → 3P | S (%98) | S (%98) | S (%98) |
| 3P → 2T | S (%100) | S (%100) | S (%98) |
| 3P+1T+1Z → 5T | S (%79) | D (%20) | D (%2) |

> **S** = saldıran kazanır · **D** = savunan (defans) kazanır · **=** berabere
> Parantez içi: şanslı koşuda saldıranın kazanma yüzdesi (400 tohum).

---

## 3. ARAŞTIRMA NE KADAR DEĞİŞTİRİYOR

> **`+0.0` satırları "dal işe yaramıyor" demek DEĞİLDİR.** Dalsız oranı zaten %0 ya da
> %99 olan bir eşleşmede oynayacak yer yoktur — sonuç dalsız da dallı da aynıdır. Dalın
> gücü, sonucun HENÜZ BELLİ OLMADIĞI satırlarda okunur. Bu ayrım 2026-08-12'de kanla
> yazıldı: zırh dalının üç eşleşmesi de baştan kararlıydı ve tablo dört gün boyunca
> "zırh dalı hiçbir işe yaramıyor" diye okunuyordu; yakın eşleşmeyle ölçülünce 34 puan
> çevirdiği görüldü.

### Baraj ateşi (topçu) — SALDIRANDA

| Eşleşme | Arazi | Dalsız | Dallı | Fark |
|---|---|---|---|---|
| 1T → 1P | Ova | %99.3 | %99.3 | +0.0 |
| 2T → 3P | Ova | %0.0 | %0.0 | +0.0 |
| 3T → 2Z | Ova | %4.8 | %38.0 | +33.3 |
| 4T → 5P | Tepelik | %0.0 | %12.5 | +12.5 |

### Paletli üstünlük (zırhlı) — SALDIRANDA

| Eşleşme | Arazi | Dalsız | Dallı | Fark |
|---|---|---|---|---|
| 1Z → 1T | Dağlık | %22.0 | %98.5 | +76.5 |
| 1Z → 2P | Dağlık | %0.0 | %0.0 | +0.0 |
| 2Z → 2T | Tepelik | %98.5 | %98.5 | +0.0 |
| 3Z → 4P | Dağlık | %0.0 | %100.0 | +100.0 |

### Zırh dalı Sv.3 (piyade) — SAVUNANDA

| Eşleşme | Arazi | Dalsız | Dallı | Fark |
|---|---|---|---|---|
| 6P → 6P | Ova | %49.5 | %16.3 | -33.3 |
| 3T → 3P | Dağlık | %48.5 | %17.3 | -31.3 |
| 6P → 5P | Dağlık | %86.3 | %52.0 | -34.3 |

### Ağır vuruş Sv.3 (topçu) — SALDIRANDA

| Eşleşme | Arazi | Dalsız | Dallı | Fark |
|---|---|---|---|---|
| 4T → 2Z | Ova | %98.5 | %100.0 | +1.5 |
| 6T → 3Z | Ova | %98.5 | %100.0 | +1.5 |
| 3T → 2Z | Tepelik | %44.3 | %99.0 | +54.8 |

---

## 4. YARALI ORDUYLA SAVAŞA GİRMEK

Yaralı birim aynı güçle vuruyor ama canı yarısı kadar (`YARALI_CAN 0.5`).
Tablo, aynı orduyla aynı savaşa üç farklı sağlıkta girmenin bedelini gösteriyor.

| Eşleşme | Sağlam | Yarısı yaralı | Hepsi yaralı |
|---|---|---|---|
| 4P → 3P | %98.3 | %98.3 | %9.8 |
| 3Z → 4P | %100.0 | %100.0 | %100.0 |
| 3T → 2Z | %4.8 | %0.0 | %0.0 |

---

## ⚠ ÖLÇÜMÜN GÖSTERDİĞİ ÜÇ ŞEY

### 1. Dört dal da savaşı çeviriyor — ucuzu da pahalısı da

Tablo 3'ün en çarpıcı satırları yan yana konunca (**sayılar tablodan türetiliyor, elle
yazılmıyor** — 2026-08-12'de bu satırlar sabit yazılıydı ve baraj zayıflatılınca rapor
yalan söylemeye başlamıştı):

| Dal | Bedel | En büyük etkisi |
|---|---|---|
| **Baraj ateşi (topçu)** | 18 puan | 3T → 2Z ovada **%5 → %38** |
| **Paletli üstünlük (zırhlı)** | 18 puan | 3Z → 4P dağlıkta **%0 → %100** |
| **Zırh dalı Sv.3 (piyade)** | 360 puan | 6P → 5P dağlıkta **%86 → %52** |
| **Ağır vuruş Sv.3 (topçu)** | 360 puan | 3T → 2Z tepelikte **%44 → %99** |

⚠ **BU BÖLÜMÜN ESKİ BAŞLIĞI YANLIŞTI VE 2026-08-12'DE DEĞİŞTİ.** Burada "otuz kat pahalı
olan dal yüz kat daha az iş yapıyor" yazıyordu ve stat dallarının etkisi %0–1 diye
geçiyordu. O cümle `ARTIS` %8–10 iken doğruydu; 2026-08-08'de %20 olunca geçerliliğini
yitirdi ama metin güncellenmedi. Yukarıdaki tablo artık ölçümden geliyor ve stat dallarının
Sv.3'te 30–55 puanlık çevirme yaptığını gösteriyor.

Kalan fark **kimlik farkı**, güç farkı değil: stat dalları bir sayıyı kaydırıyor ve etkileri
o birimin bulunduğu her savaşa yayılıyor; özel dallar savaşın YAPISINI değiştiriyor —
karşılıksız bir atış, ya da arazi cezasının kalkması — ama yalnızca kendi koşullarında
(baraj topçu ister, palet engebeli arazi ister).

⚠ **2026-08-12'de fiyat ve güç birlikte ayarlandı.** Ölçüm (`veri/arastirma-olcum.md`)
barajın yakın kaybedilen savaşların %95'ini çevirdiğini gösterince Baki iki şeyi birden
istedi: fiyat 18 puana çıksın ve dört dal da "%50 seviyesine
yaklaşsın". Barajın ön vuruşu 0.69 → 0.2 indi (%95 → %55).
Bir stat dalı hâlâ 360 puan, yani özel dalın
20 katı —
özel dallar bilerek erken açılan yetenekler olarak kaldı.

### 2. Dağlık artık zırhlıyı durdurmuyor (paletli üstünlük varsa)

Tasarımın üçüncü kısıtı şuydu: *"zırhlı topçuyu ovada yener, topçunun tek şansı coğrafya."*
Görev 12'de arazi yumuşatması tam bu satır yüzünden 1.30'da kesilmişti.

Paletli üstünlük o kısıtı **satın alınabilir** hâle getiriyor: dağlıkta 1Z → 2P dalsız %1,
dallı %84. Bu Baki'nin açık isteğiydi (*"dağlık için bitmeye yakın bir orana düşsün"*) ve
tasarım kısıtının kendisi değil, kısıtın **bedava** olması bozuldu — topçu hâlâ dağda
üstün, yalnızca yatırım yapmamış zırhlıya karşı.

### 3. Yaralı orduyla savaşa girmek çok pahalı

4P → 3P eşleşmesinde ordunun tamamı yaralıysa kazanma oranı **%98 → %10**. Yaralılık
"biraz zayıflama" değil, savaşı kaybettiren bir durum. Seferberlik dalının (yaralı piyade
bedava iyileşir) neden bu kadar değerli olduğunu da bu satır açıklıyor.
