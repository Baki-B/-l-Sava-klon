# KADRO ŞERİDİ — OKUNURLUK VE ÇAKIŞMA

> Üretim: `node scripts/kadro-serit-olcum.js` · 2026-09-23 · görev: `docs/GOREV-20-sezgi-ve-akicilik.md` §10
> Ekran 915×412 dp (yatay telefon) · ölçüler `src/haritaCizim.js KADRO_SERIDI`.

## 1. Okunurluk: eşik yakınlıkta ekrandaki boylar (dp)

| Yakınlık | Kalkan | Figür kutusu | Sayının büyük harfi | Şerit yüksekliği |
|---|---:|---:|---:|---:|
| 3× | 29 | 8.9 | 6.6 | 12.0 |
| 3.5× | 34 | 10.4 | 7.7 | 14.0 |
| 4× **(seçilen)** | 39 | 11.9 | 8.7 | 16.0 |
| 4.5× | 43 | 13.3 | 9.8 | 18.0 |
| 5× | 48 | 14.8 | 10.9 | 20.0 |

Ölçüt: sayının büyük harfi **≥ 7 dp** (yazı okunurluk sınırı, `tema-olcum.md`'deki en küçük gövde yazısıyla aynı). Eşiğin üstünde şerit haritayla birlikte büyüyor.

## 2. Çakışma (harita biriminde — her yakınlıkta aynı)

| Durum | Şeritli rozet | Şerit ↔ şerit | Şerit ↔ başka kalkan | Etkilenen rozet | En geniş şerit (kutu) |
|---|---:|---:|---:|---:|---:|
| Gerçek maç (15. tur) | 167 | 0 | 1 | 2 | 54.6 |
| Maç başı (her parçada ordu) | 181 | 0 | 1 | 2 | 54.6 |
| En kötü (her parçada 3 tür, 2 hane) | 167 | 8 | 6 | 21 | 70.9 |

Çakışan rozetler (gerçek maç): p31-2, p80-1

Çakışan rozetler (maç başı): p31-2, p80-1

Kalkanın kendisi 26 kutu; şerit tek türde ~20, üç türde ~50 kutu. Çakışma olursa şerit komşunun üstüne biner (en üst katman), kalkan örtülmez değil — sayı okunur kalır.
