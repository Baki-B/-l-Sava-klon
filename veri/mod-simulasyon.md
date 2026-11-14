# MOD BAZLI SİMÜLASYON

> Üretildi: `node scripts/mod-simulasyon.js` — ELLE DÜZENLEME.
> Tarih: 2026-09-19

Baki (2026-08-12): *"oyunun modlarına göre simülasyonlar falan yap."*

Üç mod, üç zorluk, iki tohum — Türkiye kapsamı (181 parça). Her satırda iki koşunun sonucu `a / b` biçiminde.

## 1. Kazanma koşuluna ulaşılıyor mu

> **Güç Yarışı'nda "eşik yok" bir eksiklik değil, modun tanımı**: o modda kazanmak için
> bir parça sayısına ulaşmak gerekmiyor, süre dolunca SIRALAMAYA bakılıyor. Ölçüm buna
> "ulaşılmadı" yazarsa yanlış okunur.

| Mod | Zorluk | Eşik | Ufuk | Ulaşılan tur | Son en büyük imparatorluk |
|---|---|---|---|---|---|
| Fetih | kolay | 181/181 | 150 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 14 / 17 |
| Fetih | orta | 181/181 | 150 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 43 / 41 |
| Fetih | zor | 181/181 | 150 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 27 / 28 |
| %50 Hâkimiyet | kolay | 91/181 | 70 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 15 / 8 |
| %50 Hâkimiyet | orta | 91/181 | 70 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 17 / 16 |
| %50 Hâkimiyet | zor | 91/181 | 70 *(sınırsız)* | **ulaşılmadı / ulaşılmadı** | 24 / 27 |
| Güç Yarışı | kolay | sıralama | 35 | **eşik yok / eşik yok** | 5 / 5 |
| Güç Yarışı | orta | sıralama | 35 | **eşik yok / eşik yok** | 12 / 14 |
| Güç Yarışı | zor | sıralama | 35 | **eşik yok / eşik yok** | 18 / 24 |

## 2. Silahlanma — yığınlar kontrol altında mı

Baki'nin şikâyeti buydu: *"100–200 askere kadar devam ediyorlar."* Üretim freni
(`DENGE.ZEKA.DOYMA`) sonrası zirve değerler:

| Mod | Zorluk | Zirve en büyük yığın | Zirve ortalama ordu | Son toplam ordu |
|---|---|---|---|---|
| Fetih | kolay | **22.5** | 7.2 | 1022.5 |
| Fetih | orta | **25.0** | 5.7 | 161.5 |
| Fetih | zor | **22.5** | 3.5 | 163.0 |
| %50 Hâkimiyet | kolay | **22.5** | 7.2 | 1114.5 |
| %50 Hâkimiyet | orta | **25.0** | 5.7 | 318.5 |
| %50 Hâkimiyet | zor | **21.0** | 3.5 | 145.5 |
| Güç Yarışı | kolay | **21.0** | 6.3 | 1118.0 |
| Güç Yarışı | orta | **25.0** | 5.7 | 777.5 |
| Güç Yarışı | zor | **21.0** | 3.5 | 272.0 |

## 3. Dünya hareketli mi

El değiştiren parça sayısı = oyunun ne kadar aktığının ölçüsü. Sıfıra yakınsa dünya
kilitlenmiş demektir (2026-08-12 öncesindeki durum).

| Mod | Zorluk | El değiştiren parça | Kalan sahip sayısı |
|---|---|---|---|
| Fetih | kolay | **408.5** | 68 / 57 |
| Fetih | orta | **3009.0** | 15 / 17 |
| Fetih | zor | **3475.0** | 12 / 15 |
| %50 Hâkimiyet | kolay | **160.0** | 73 / 63 |
| %50 Hâkimiyet | orta | **1097.0** | 30 / 32 |
| %50 Hâkimiyet | zor | **1947.5** | 19 / 18 |
| Güç Yarışı | kolay | **11.5** | 80 / 79 |
| Güç Yarışı | orta | **292.5** | 53 / 57 |
| Güç Yarışı | zor | **1125.5** | 25 / 23 |

## Ölçümün kuralları

- Oyuncu yok: 81 aktörün hepsi yapay zekâ. Ölçülen şey DÜNYANIN kendi dinamiği.
- Kazanma eşiği `modKazanmaEsigi`'nden, tur sınırı `modTurSiniri`'nden okunuyor —
  ölçüm ile oyun ayrışamaz.
- Sınırsız modlarda (Fetih, %50 Hâkimiyet) ölçüm ufku modun kendi tempo formülünden
  geliyor; `modTurSiniri` orada `Infinity` döner ve döngü sınırı olarak KULLANILAMAZ.
