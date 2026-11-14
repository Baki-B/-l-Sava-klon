# GARNİZON DENGESİ ÖLÇÜMÜ (Görev 07 / Adım 2)

> Üretildi: `node scripts/garnizon-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Görev 06 §13/1c devri, Baki: *"Ankara'da 20 asker var ama İstanbul'da 10,
Şanlıurfa'da İstanbul'dan fazla"*. Ölçüldü, doğruydu.

## SONUÇ

| | Eski (parça başına) | **Yeni (il düzeyinde)** |
|---|---|---|
| Yayılım (en yüksek ÷ en düşük oran) | **6.67 kat** | **1.56 kat** |
| Oranların standart sapması | 0.85 | **0.10** |
| En kârlı il | 5.00 | 1.56 |
| En sert il | 0.75 | 1.00 |
| Toplam garnizon birimi | 470 | **475** |

Oyun açılışının SERTLİĞİ bilerek korundu (toplam birim yakın); değişen tek şey
DAĞILIM. `DENGE.GARNIZON.KATSAYI = 0.64`.

## Parça bölüşümü — §7'nin üç kuralı

Bölüşüm `uretim.js parcaDegerleri` ile yapılıyor; üretimde ne yapıyorsa burada da
onu yapıyor. Yeni bir bölüşüm mantığı YAZILMADI.

| Kural | Durum |
|---|---|
| Toplam korunuyor (parça toplamı = il bütçesi) | ✓ |
| Hiçbir parça 0 almıyor | ✓ |
| Tekdüzelik (payı büyük olan az almıyor) | ✓ |
| Haritadaki toplam birim | 475 |

## En kârlı ve en sert on il

`oran = değer ÷ savunma` — yüksekse ucuz lokma, düşükse sert ceviz.

### Yeni dağılımda en kârlı beş

| İl | Değer | Parça | Eski savunma | Yeni savunma | Eski oran | **Yeni oran** |
|---|---|---|---|---|---|---|
| Antalya | 14 | 4 | 16 | 9 | 0.88 | **1.56** |
| Bursa | 14 | 4 | 16 | 9 | 0.88 | **1.56** |
| Kocaeli | 14 | 2 | 10 | 9 | 1.40 | **1.56** |
| Ankara | 17 | 4 | 20 | 11 | 0.85 | **1.55** |
| İstanbul | 20 | 2 | 10 | 13 | 2.00 | **1.54** |

### Yeni dağılımda en sert beş

| İl | Değer | Parça | Eski savunma | Yeni savunma | Eski oran | **Yeni oran** |
|---|---|---|---|---|---|---|
| Ardahan | 2 | 1 | 1 | 2 | 2.00 | **1.00** |
| Bayburt | 2 | 1 | 1 | 2 | 2.00 | **1.00** |
| Iğdır | 5 | 1 | 1 | 4 | 5.00 | **1.25** |
| Bartın | 5 | 1 | 2 | 4 | 2.50 | **1.25** |
| Sinop | 5 | 2 | 4 | 4 | 1.25 | **1.25** |

## Görev 06'nın şikâyet tablosu, yeni sayılarla

| İl | Değer | Eski savunma | **Yeni savunma** | Eski oran | **Yeni oran** |
|---|---|---|---|---|---|
| **İstanbul** | 20 | 10 | **13** | 2.00 | **1.54** |
| **Kocaeli** | 14 | 10 | **9** | 1.40 | **1.56** |
| **Şanlıurfa** | 12 | 12 | **8** | 1.00 | **1.50** |
| **Ankara** | 17 | 20 | **11** | 0.85 | **1.55** |
| **Iğdır** | 5 | 1 | **4** | 5.00 | **1.25** |

## 81 ilin tamamı

| İl | Değer | Parça | Eski | Yeni | Eski oran | Yeni oran |
|---|---|---|---|---|---|---|
| Adana | 13 | 4 | 12 | 9 | 1.08 | 1.44 |
| Adıyaman | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Afyonkarahisar | 9 | 3 | 9 | 6 | 1.00 | 1.50 |
| Ağrı | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Aksaray | 8 | 1 | 2 | 6 | 4.00 | 1.33 |
| Amasya | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Ankara | 17 | 4 | 20 | 11 | 0.85 | 1.55 |
| Antalya | 14 | 4 | 16 | 9 | 0.88 | 1.56 |
| Ardahan | 2 | 1 | 1 | 2 | 2.00 | 1.00 |
| Artvin | 4 | 2 | 4 | 3 | 1.00 | 1.33 |
| Aydın | 11 | 3 | 9 | 8 | 1.22 | 1.38 |
| Balıkesir | 11 | 4 | 12 | 8 | 0.92 | 1.38 |
| Bartın | 5 | 1 | 2 | 4 | 2.50 | 1.25 |
| Batman | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Bayburt | 2 | 1 | 1 | 2 | 2.00 | 1.00 |
| Bilecik | 6 | 1 | 3 | 4 | 2.00 | 1.50 |
| Bingöl | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Bitlis | 6 | 2 | 2 | 4 | 3.00 | 1.50 |
| Bolu | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Burdur | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Bursa | 14 | 4 | 16 | 9 | 0.88 | 1.56 |
| Çanakkale | 8 | 3 | 6 | 6 | 1.33 | 1.33 |
| Çankırı | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Çorum | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Denizli | 10 | 3 | 9 | 7 | 1.11 | 1.43 |
| Diyarbakır | 11 | 4 | 12 | 8 | 0.92 | 1.38 |
| Düzce | 8 | 1 | 2 | 6 | 4.00 | 1.33 |
| Edirne | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Elazığ | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Erzincan | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Erzurum | 9 | 4 | 12 | 6 | 0.75 | 1.50 |
| Eskişehir | 10 | 2 | 6 | 7 | 1.67 | 1.43 |
| Gaziantep | 13 | 2 | 8 | 9 | 1.63 | 1.44 |
| Giresun | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Gümüşhane | 4 | 1 | 1 | 3 | 4.00 | 1.33 |
| Hakkari | 6 | 2 | 2 | 4 | 3.00 | 1.50 |
| Hatay | 11 | 2 | 6 | 8 | 1.83 | 1.38 |
| Iğdır | 5 | 1 | 1 | 4 | 5.00 | 1.25 |
| Isparta | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| İstanbul | 20 | 2 | 10 | 13 | 2.00 | 1.54 |
| İzmir | 16 | 2 | 8 | 11 | 2.00 | 1.45 |
| Kahramanmaraş | 10 | 3 | 9 | 7 | 1.11 | 1.43 |
| Karabük | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Karaman | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Kars | 6 | 2 | 4 | 4 | 1.50 | 1.50 |
| Kastamonu | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Kayseri | 11 | 3 | 9 | 8 | 1.22 | 1.38 |
| Kırıkkale | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Kırklareli | 8 | 2 | 6 | 6 | 1.33 | 1.33 |
| Kırşehir | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Kilis | 3 | 1 | 1 | 2 | 3.00 | 1.50 |
| Kocaeli | 14 | 2 | 10 | 9 | 1.40 | 1.56 |
| Konya | 13 | 4 | 12 | 9 | 1.08 | 1.44 |
| Kütahya | 8 | 3 | 6 | 6 | 1.33 | 1.33 |
| Malatya | 9 | 2 | 6 | 6 | 1.50 | 1.50 |
| Manisa | 12 | 3 | 9 | 8 | 1.33 | 1.50 |
| Mardin | 9 | 3 | 6 | 6 | 1.50 | 1.50 |
| Mersin | 12 | 4 | 12 | 8 | 1.00 | 1.50 |
| Muğla | 10 | 3 | 9 | 7 | 1.11 | 1.43 |
| Muş | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Nevşehir | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Niğde | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Ordu | 9 | 2 | 4 | 6 | 2.25 | 1.50 |
| Osmaniye | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Rize | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Sakarya | 10 | 3 | 9 | 7 | 1.11 | 1.43 |
| Samsun | 11 | 2 | 6 | 8 | 1.83 | 1.38 |
| Siirt | 6 | 2 | 2 | 4 | 3.00 | 1.50 |
| Sinop | 5 | 2 | 4 | 4 | 1.25 | 1.25 |
| Sivas | 8 | 4 | 8 | 6 | 1.00 | 1.33 |
| Şanlıurfa | 12 | 4 | 12 | 8 | 1.00 | 1.50 |
| Şırnak | 8 | 2 | 4 | 6 | 2.00 | 1.33 |
| Tekirdağ | 12 | 3 | 12 | 8 | 1.00 | 1.50 |
| Tokat | 8 | 3 | 6 | 6 | 1.33 | 1.33 |
| Trabzon | 9 | 2 | 6 | 6 | 1.50 | 1.50 |
| Tunceli | 3 | 1 | 1 | 2 | 3.00 | 1.50 |
| Uşak | 7 | 1 | 3 | 5 | 2.33 | 1.40 |
| Van | 9 | 4 | 8 | 6 | 1.13 | 1.50 |
| Yalova | 6 | 1 | 2 | 4 | 3.00 | 1.50 |
| Yozgat | 7 | 2 | 4 | 5 | 1.75 | 1.40 |
| Zonguldak | 8 | 2 | 4 | 6 | 2.00 | 1.33 |

## Ölçümün kuralları

- Yeni savunma sayıları oyunun kendi `garnizon.js` fonksiyonlarından okunuyor;
  formül bu betikte KOPYALANMADI. Eski formül yalnızca karşılaştırma için burada.
- Karışım (hangi birim tipi) bu ölçümün konusu değil — o §4.5'ten geliyor ve
  değişmedi. Ölçülen şey KAÇ birim olduğu.
- Yayılım iki ölçüyle veriliyor: uçların oranı (kat) ve standart sapma. İlki tek bir
  aykırı ile kayabilir, ikincisi tabloyu bütün olarak anlatır.
