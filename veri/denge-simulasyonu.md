# DENGE SİMÜLASYONU — KARTOPUNUN BÜYÜKLÜĞÜ (Görev 06 / Adım 7)

> Üretildi: `node scripts/denge-simulasyonu.js` — ELLE DÜZENLEME.
> Tarih: 2026-09-19

Soru 5’in cevabı **"bu görevde kartopuna mekanik ekleme, ama ÖLÇ"** idi. Ölçüm bu.
Görev 07 kartopu düzeltmesine karar verirken tahminle değil bu tabloyla girecek.

**Oyuncu davranışı** (betikte yazılı, tekrar edilebilir): sanayi hakkı olan en uygun
ilinde bütçesi yettiği kadar birim basar · ordusu olan her parçadan komşu bir düşman
parçasına elindeki her şeyle saldırır · yıpranmış ordulara toplanma emri verir ·
ekonomisinin %35’ini araştırmaya ayırıp ucuzdan pahalıya
seviye atlar. Bu bir yapay zekâ değil, ÖLÇÜM ARACI: basit ve belirlenimci.

Tohum 20260731 · 15 tur · oyuncu Bursa.

İKİ BÜTÇE REJİMİ birden koşuluyor, çünkü iki ayrı soru var:

- **Bütçesi sınırsız** (Görev 05’in gözlem düzeni; havuz her tur 400’e çekiliyor): ekonomiyi denklemden çıkarır, yalnızca muharebe ve hareket
  sistemini zorlar → kartopunun **tavanı**.
- **Gerçek geliriyle**: oyunun asıl temposu → kartopunun **tabanı**.

## Bütçesi sınırsız oyuncu

| Koşu | Tur 15 parça | Fark | Birim | Araştırma | Kayıt |
|---|---|---|---|---|---|
| Temel (Görev 05 oyunu) | **18/181** | — | 203 | — | 43.3 KB |
| + Toplanma | **18/181** | — | 203 | — | 43.3 KB |
| + Toplanma + Araştırma | **13/181** | -5 | 217 | piyade.zirh Sv.3 · piyade.agir Sv.3 · piyade.hafif Sv.3 · piyade.seferberlik Sv.1 · topcu.zirh Sv.3 · topcu.agir Sv.3 · topcu.hafif Sv.3 · topcu.baraj Sv.1 · zirhli.palet Sv.1 · zirhli.agir Sv.3 · zirhli.hafif Sv.3 · zirhli.yarma Sv.1 | 43.2 KB |

### Tur tur (parça sayısı)

| Tur | Temel (Görev 05 oyunu) | + Toplanma | + Toplanma + Araştırma |
|---|---|---|---|
| 1 | 5 | 5 | 5 |
| 2 | 6 | 6 | 6 |
| 3 | 8 | 8 | 8 |
| 4 | 9 | 9 | 9 |
| 5 | 12 | 12 | 12 |
| 6 | 13 | 13 | 13 |
| 7 | 13 | 13 | 13 |
| 8 | 15 | 15 | 16 |
| 9 | 16 | 16 | 18 |
| 10 | 17 | 17 | 17 |
| 11 | 19 | 19 | 19 |
| 12 | 22 | 22 | 21 |
| 13 | 22 | 22 | 18 |
| 14 | 19 | 19 | 14 |
| 15 | 18 | 18 | 13 |

## Gerçek geliriyle oyuncu

| Koşu | Tur 15 parça | Fark | Birim | Araştırma | Kayıt |
|---|---|---|---|---|---|
| Temel (Görev 05 oyunu) | **4/181** | — | 3 | — | 42.9 KB |
| + Toplanma | **12/181** | +8 | 23 | — | 43.2 KB |
| + Toplanma + Araştırma | **7/181** | +3 | 15 | piyade.zirh Sv.1 · piyade.agir Sv.1 · piyade.hafif Sv.1 · piyade.seferberlik Sv.1 · topcu.zirh Sv.1 · topcu.agir Sv.1 · topcu.baraj Sv.1 · zirhli.palet Sv.1 · zirhli.yarma Sv.1 | 43.7 KB |

### Tur tur (parça sayısı)

| Tur | Temel (Görev 05 oyunu) | + Toplanma | + Toplanma + Araştırma |
|---|---|---|---|
| 1 | 4 | 4 | 4 |
| 2 | 4 | 4 | 5 |
| 3 | 5 | 5 | 5 |
| 4 | 6 | 6 | 5 |
| 5 | 7 | 7 | 7 |
| 6 | 9 | 9 | 8 |
| 7 | 7 | 10 | 7 |
| 8 | 7 | 11 | 5 |
| 9 | 6 | 11 | 6 |
| 10 | 5 | 10 | 7 |
| 11 | 3 | 10 | 9 |
| 12 | 3 | 9 | 9 |
| 13 | 2 | 11 | 8 |
| 14 | 3 | 12 | 8 |
| 15 | 4 | 12 | 7 |

## Nasıl okunmalı

- **Mutlak sayı değil, FARK anlamlı.** Görev 05’in "tur 15’te 90/181" gözlemi betiği
  yazılmadan, elle yapılmıştı; buradaki oyuncunun davranışı yazılı ve tekrar edilebilir,
  o yüzden iki sayı doğrudan karşılaştırılamaz.
- Toplanma satırındaki fark: "yıpranmış orduyu doldurabilmek" ne kadar hızlandırıyor.
- Araştırma satırındaki EK fark: ordu kalitesinin bunun üstüne ne koyduğu.
- **Araştırmanın katkısının sınırlı kalmasının sebebi TAVANDIR.** Üç dal da en fazla
  Sv.3 olabildiği için toplam yatırım 4320 puanla sınırlı — araştırma
  tek seferlik bir sıçrama, süren bir kartopu değil. Tavan kalkarsa bu satır büyür.
- Bu oyuncunun rakibi KARAR VERMİYOR (tarafsız garnizonlar, Görev 05). Kartopunun asıl
  ilacı Görev 07’nin düşünen rakibi; bu tablo onun ne kadar iş yapması gerektiğini söyler.
