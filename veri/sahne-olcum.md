# SAHNE ÖLÇÜMÜ (Görev 08 / Adım 1)

> Üretildi: `node scripts/sahne-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-07-31
> Tohum 20260730, 15 tur, oyuncu Bursa (16).

## a) TUR HESABI — animasyon bütçesinin tabanı

| Ölçü | Değer |
|---|---|
| Tur başına hesap (ortalama) | **42.3 ms** |
| En yavaş tur | 53.9 ms |
| En hızlı tur | 37.4 ms |
| Bir kare (60 kare/sn) | 16.67 ms |

Görev 07 raporu ~45 ms diyordu; ölçüm onu doğruluyor. **Bu süre perde arkasında
geçiyor** — oyuncu TURU BİTİR'e bastıktan sonra gösteri başlamadan önce. Yani
animasyonun bütçesini yemiyor, ona ekleniyor.

⚠ **Telefonda ölçülmedi.** Geliştirme makinesinin birkaç katı olabilir (Görev 07
§11/5). Cihazda tur perdesi gözle görülür şekilde bekletiyorsa ilk bakılacak yer burası.

## b) GÖSTERİ SÜRESİ — kapsam ayarı tempo tuzağını çözüyor mu?

| Kapsam | Tur başına gösteri | En yoğun tur | Ort. savaş | 50 turda toplam |
|---|---|---|---|---|
| `kapali` | **0.0 sn** | 0.0 sn | 0.0 | **0.0 dk** |
| `cephem` | **6.6 sn** | 16.2 sn | 0.9 | **5.5 dk** |
| `hepsi` | **13.5 sn** | 23.3 sn | 3.4 | **11.3 dk** |

**Okunuşu:** varsayılan `cephem` kapsamında oyuncu 50 turluk bir oyunda toplam
**5.5 dakika** gösteri
izliyor. `hepsi` seçilirse bu 2.0 katına çıkıyor.

Görev belgesi §4.4 "her tur 6 saniyelik gösteriye dönerse oyun oynanmaz hâle gelir"
diyordu. Ölçülen tur başına süre 6.6 sn — eşiğin altında,
ve bu TAM GÖSTERİMLE (`HIZ_CARPANI` = 1).

### Eşzamanlı efekt sayısı

Aynı parça üstünde en çok kaç olay üst üste biniyor:

| Kapsam | En yoğun parça |
|---|---|
| `kapali` | 0 olay |
| `cephem` | 12 olay |
| `hepsi` | 12 olay |

`DENGE.SAHNE.EN_COK_ESZAMANLI` = 4. **Ölçülen yoğunluk sınırın üstünde** — efektler sıralı oynayacak, gösteri uzayabilir.

## c) TAKVİYENİN MALİYETİ

| Ölçü | Değer |
|---|---|
| Yapay zekâ aktörü | 80 |
| Saldırı adayı (tur başına, ortalama) | 1206.7 |
| Takviye adayı (tur başına, ortalama) | **3.9** |
| Hamle uzayının büyümesi | **1.00×** |
| Saldırı adaylarını üretme süresi | 1.18 ms |
| Takviye adaylarını üretme süresi | **0.82 ms** |
| İç bölge parçası (cepheye uzaklık > 0) | 5.6 |

Görev belgesi §Soru 4 "aday sayısı yaklaşık **iki katına** çıkar" diyordu.
**Ölçüm 1.00× diyor** — beklentinin çok ALTINDA. Süre olarak takviye 0.82 ms ekliyor; tur hesabı 42.3 ms ve **hepsi perde arkasında**. Kare bütçesiyle ilgisi yok.

### Takviye ne değiştirdi — açık/kapalı karşılaştırması

Aynı tohum, aynı oyuncu davranışı, 15 tur. Değişen tek şey `DENGE.ZEKA.TAKVIYE.ACIK`.

| | `orta` kapalı | `orta` açık | `zor` kapalı | `zor` açık |
|---|---|---|---|---|
| Bağımsız aktör (15 tur sonunda) | 68 | 70 | 33 | 27 |
| En büyük imparatorluk (parça) | 15 | 8 | 26 | 24 |
| Cephe parçası | 169 | 172 | 145 | 142 |
| İç bölge parçası | 12 | 9 | 36 | 39 |
| **İç bölgede ÖLÜ BEKLEYEN birim** | **50** | **19** | **49** | **14** |
| Takviye adayı | 16 | 7 | 17 | 6 |
| Saldırı adayı | 1127 | 1160 | 639 | 592 |
| Hamle uzayının büyümesi | 1.01× | 1.01× | 1.03× | 1.01× |
| Takviye adaylarını üretme | 0.90 ms | 0.85 ms | 0.83 ms | 0.96 ms |

**BİTİŞ ÖLÇÜTÜ — ölü yatırım.** Görev 07 §11/1 sorunu şöyle koymuştu: *"aktör
genişledikçe kuvvetinin gitgide büyüyen kısmı ölü yatırıma dönüşüyor."* Ölçülen şey
tam olarak o: iç bölgede, düşmanla hiç teması olmayan parçalarda bekleyen birim sayısı.

- Orta kademe: **50 → 19 birim** (%62 azalma)
- Zor kademe: **49 → 14 birim** (%71 azalma)

Fark zor kademede daha büyük ve bu beklenen: orta kademede 15 turda kimse büyümüyor,
aktörlerin çoğu 1–3 parçalı ve her parçası zaten cephede. **İç bölge yoksa takviye
edecek bir şey de yok** — sorun konsolidasyonla birlikte doğuyor, çözümü de orada
görünüyor.

Maliyet tarafı: hamle uzayı en çok 1.03× büyüyor, yani görev belgesinin beklediği **iki kat maliyet hiçbir kademede doğmuyor.**
Sebebi `TAKVIYE.KUVVET_ADAYLARI` tek elemanlı: saldırıda her komşu için iki aday
üretiliyor (tümü / yarısı), takviyede bir tane (tümü) — ve yalnızca iç bölgeden.

## TUR TUR DÖKÜM

| Tur | Hesap (ms) | `cephem` gösteri | savaş | önemli | `hepsi` gösteri | savaş |
|---|---|---|---|---|---|---|
| 1 | 53.9 | 16.0 sn | 3 | 1 | 23.2 sn | 6 |
| 2 | 49.5 | 8.8 sn | 1 | 1 | 14.2 sn | 3 |
| 3 | 44.7 | 8.9 sn | 1 | 0 | 15.7 sn | 3 |
| 4 | 41.4 | 5.3 sn | 1 | 1 | 10.7 sn | 3 |
| 5 | 41.5 | 16.2 sn | 3 | 2 | 23.3 sn | 6 |
| 6 | 41.0 | 3.4 sn | 0 | 0 | 11.0 sn | 3 |
| 7 | 43.9 | 5.9 sn | 1 | 1 | 13.1 sn | 3 |
| 8 | 40.6 | 8.3 sn | 2 | 2 | 13.5 sn | 4 |
| 9 | 49.6 | 3.4 sn | 0 | 0 | 11.0 sn | 3 |
| 10 | 37.4 | 11.5 sn | 1 | 0 | 18.7 sn | 4 |
| 11 | 38.2 | 5.3 sn | 1 | 0 | 12.9 sn | 4 |
| 12 | 38.2 | 1.6 sn | 0 | 0 | 7.2 sn | 1 |
| 13 | 37.6 | 1.6 sn | 0 | 0 | 8.4 sn | 2 |
| 14 | 39.1 | 1.6 sn | 0 | 0 | 9.7 sn | 3 |
| 15 | 38.6 | 1.6 sn | 0 | 0 | 10.4 sn | 3 |

## CİHAZDA ÖLÇÜLECEKLER (bu betik ölçemez)

- **Kare süresi (fps)** rozet efektleri açıkken. Hedef 60 fps (16.7 ms), en kötü
  durumda 30 fps altına düşülmeyecek.
- **Kamera kaydırırken kare düşüyor mu.** `DENGE.SAHNE.KAMERA.ACIK` tek satırla kapatır.
- **Tur perdesinin gerçek süresi.** Yukarıdaki hesap süresi telefonda birkaç kat olabilir.
