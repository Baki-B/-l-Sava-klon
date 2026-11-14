# YAPAY ZEKÂNIN HESAP BÜTÇESİ (Görev 07 / Adım 2b)

> Üretildi: `node scripts/zeka-butce-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Tasarım §9.3 bölünmüş hesaplama (time-slicing) öneriyor ama bir SAYI vermiyor.
Gerekli mi değil mi — kod yazılmadan ölçüldü.

## SONUÇ

**Bölünmüş hesaplama GEREKSİZ.** Tur başına en kötü hâlde **6.47 ms**, bir kare 16.67 ms.
Yani turun kararları tek karenin 38.80'ine sığıyor.

| Ölçü | Değer |
|---|---|
| Haritadaki parça | 181 |
| Ortalama komşu sayısı | 5.18 |
| Yönlü komşuluk (toplam kaynak→hedef çifti) | 938 |
| Kuvvet adayı (DENGE.ZEKA.KUVVET_ADAYLARI) | 2 |
| **Tur başına en çok aday hamle** | **1.876** |
| Tek muharebe tahmininin süresi | **0.0034 ms** |
| Tur başına toplam hesap | **6.47 ms** |
| Bir kare (60 kare/sn) | 16.67 ms |

## Bu sayı bir ÜST SINIRDIR

Ölçüm oyunun EN KÖTÜ ânını varsayıyor: haritanın her parçası ayrı bir aktörün ve
hepsi her komşusuna karşı her kuvvet adayını hesaplıyor. Gerçekte üç şey bu sayıyı
düşürüyor:

1. **Doğal konsolidasyon (§9.3)** — oyun ilerledikçe 81 aktör birkaç imparatorluğa
   dönüşür; bağımsız karar veren birim sayısı düşer.
2. **İç parçalar hesaplanmaz** — düşmana sınırdaş olmayan parçadan saldırı adayı
   üretilmez; hamle uzayı gerçekte CEPHE uzunluğuyla orantılıdır, harita alanıyla değil.
3. **Boş hedefler simülasyon istemez** — savunanı olmayan parçaya yürümek muharebe
   değil; orada üstünlük terimi zaten 1.00.

## Ölçümün kuralları

- Muharebe tahmini oyunun kendi `muharebeTahmini` fonksiyonu — ayrı bir ölçüm
  motoru yazılmadı (§9.1: "ikinci bir tahmin yazılmayacak").
- Ordular haritadaki GERÇEK garnizonlardan alınıyor; uydurma ordularla ölçmek
  yanıltıcı olurdu, muharebenin süresi ordu büyüklüğüne ve raunt sayısına bağlı.
- Üç koşunun EN İYİSİ alınıyor (JIT ısınması ve zamanlayıcı gürültüsü ölçüme
  karışmasın); ortalama 0.0037 ms, en iyi 0.0034 ms.
- Ölçüm geliştirme makinesinde yapıldı. **Telefon daha yavaştır**; sonuç bu yüzden
  kat kat pay bırakacak şekilde okunmalı — 2.58× pay var.
