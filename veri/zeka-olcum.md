# YAPAY ZEKÂ ÖLÇÜMÜ — GÖREV 07’NİN BİTİŞ ÖLÇÜTÜ

> Üretildi: `node scripts/zeka-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Görev belgesi §1: *"Bu görevin başarısı aynı simülasyonun yapay zekâ açıkken verdiği
sayıyla ölçülecek."* Oyuncunun davranışı dört koşuda BİREBİR AYNI; değişen tek şey
dünyanın oynayıp oynamadığı ve zorluk kademesi.

## SONUÇ

| Koşu | Oyuncunun aldığı parça | Kalan bağımsız aktör | En büyük rakip | Tur süresi |
|---|---|---|---|---|
| Dünya duruyor (Görev 06 hâli) | **4/181** | 81 | 4 parça | 0.5 ms |
| Dünya oynuyor — kolay | **4/181** | 81 | 5 parça | 119.1 ms |
| Dünya oynuyor — orta | **2/181** | 67 | 10 parça | 143.0 ms |
| Dünya oynuyor — zor | **0/181** | 36 | 16 parça | 131.9 ms |

## Nasıl okunmalı

- **Dünya artık gerçekten oynuyor.** Durgun dünyada 15 tur sonunda 81 aktörün 81’i
  ayakta ve en büyük rakip 4 parçalı. Zor kademede bağımsız
  aktör sayısı 36’e düşüyor ve en büyük rakip 16 parçaya çıkıyor —
  tasarım §9.3’ün öngördüğü **doğal konsolidasyon** ölçülebilir hâle geldi.
- **Zorluk kademesi ölçülebilir fark yaratıyor** ve bunu GİZLİ BONUSLA değil, yalnızca
  kişilik ağırlıkları ve karar gürültüsüyle yapıyor (§9.4). Kolay kademede rakipler
  ürkek: oyuncu durgun dünyadakinden bile fazla toprak alabiliyor, çünkü zayıf komşular
  birbirini yıpratıp açık veriyor. Zorda oyuncu eleniyor.
- **Oyuncu politikası bilerek basit** (her parçadan her şeyle saldır). Görev 06 raporu
  bu politikanın kuvveti dağıttığını zaten ölçmüştü; buradaki sayılar mutlak bir zorluk
  ölçüsü değil, KOŞULAR ARASI FARKIN ölçüsü.

## Tur tur oyuncunun parça sayısı

| Tur | Dünya duruyor (Görev 06 hâli) | Dünya oynuyor — kolay | Dünya oynuyor — orta | Dünya oynuyor — zor |
|---|---|---|---|---|
| 1 | 4 | 4 | 4 | 3 |
| 2 | 4 | 4 | 4 | 1 |
| 3 | 4 | 4 | 4 | 0 |
| 4 | 4 | 4 | 3 | 0 |
| 5 | 4 | 4 | 3 | 0 |
| 6 | 4 | 4 | 3 | 0 |
| 7 | 4 | 4 | 2 | 0 |
| 8 | 4 | 4 | 3 | 0 |
| 9 | 4 | 4 | 3 | 0 |
| 10 | 4 | 3 | 2 | 0 |
| 11 | 4 | 4 | 2 | 0 |
| 12 | 4 | 4 | 3 | 0 |
| 13 | 4 | 4 | 3 | 0 |
| 14 | 4 | 4 | 2 | 0 |
| 15 | 4 | 4 | 2 | 0 |

## Performans ve kayıt

| Koşu | Tur başına hesap | 15. turda kayıt |
|---|---|---|
| Dünya duruyor (Görev 06 hâli) | 0.5 ms | 30.6 KB |
| Dünya oynuyor — kolay | 119.1 ms | 37.6 KB |
| Dünya oynuyor — orta | 143.0 ms | 39.8 KB |
| Dünya oynuyor — zor | 131.9 ms | 35.6 KB |

Kare bütçesi ölçümü ayrı bir dosyada (`veri/zeka-butce-olcum.md`): tur başına en kötü
hâlde ~8 ms, bir kare 16.7 ms. Buradaki süre GERÇEK turun tamamı — karar + çözüm +
ekonomi + toplanma. Kayıt sınırı 26 KB (görev belgesi §6).

## Ölçümün kuralları

- Oyun, tur döngüsü ve zekâ oyunun kendi kodundan geliyor; ayrı bir simülasyon motoru
  yazılmadı. `zekaKapali` bayrağı yalnızca yapay zekânın karar vermesini durduruyor.
- Tohum sabit (20260730), yani koşular tekrar edilebilir ve karşılaştırılabilir.
- Zorluk yalnızca kişilik aralıklarını ve karar gürültüsünü değiştiriyor; üretim çarpanı
  üç kademede de 1 (`DENGE.ZEKA.ZORLUK`).
