# PARÇA ÖLÇÜMÜ — ordu rozeti sığıyor mu?

> Üreten: `scripts/parca-olcum.js` (Görev 03B / Adım 3). **Elle düzenleme yok** — veri değişince yeniden üret.
> Görsel karşılığı: `onizleme/rozet-testi.html`
>
> ⚠️ **GÜNCEL ÖLÇÜM BURASI DEĞİL.** Bu belge **dik tutuş** referanslıdır ve yalnızca
> parçaları ölçer. Oyun Görev 04 / Adım 1'de **yatay tutuşa kilitlendi**; ayrıca rozet
> katmanları için **il** ölçümü de gerekiyor. Güncel ölçüm ve katman sınırları:
> **`veri/rozet-katman-olcum.md`** (`node scripts/rozet-katman-olcum.js`).
> Bu belge Görev 03B'nin bölümleme kararlarının tarihsel dayanağı olarak duruyor.

## Yöntem

**Ölçü: iç çember çapı.** Parçanın içine sığan en büyük dairenin çapı. Alan kullanılmadı:
uzun ve ince bir kıyı şeridi büyük alana sahip olabilir ama üstüne rozet konamaz.
Değer, etiket noktası için kullanılan **polylabel** algoritmasının döndürdüğü
"sınıra en uzak iç nokta" uzaklığının iki katıdır.

**Adalar hariç:** ölçüm her parçanın **en büyük kara gövdesi** üzerinde yapıldı.

**Piksele çevirme:** harita 1000×452 birim; referans telefon 412×915 dp (dik tutuş).
1× = tüm Türkiye ekranda → **1 harita birimi = 0.412 piksel**.

**Rozet çapı: 26 piksel** (iki haneli sayı için makul başlangıç; Görev 04'te kesinleşecek).

## Özet

| Yakınlaştırma | Rozet sığan | Sığmayan |
|---|---|---|
| 1× (tüm Türkiye) | 0 | 181 |
| 2× | 42 | 139 |
| 3× | 131 | 50 |

Toplam **181 parça**. Bunların **18 tanesi tek parçalı ilin tek parçası** — küçük olsalar bile birleştirilemezler (bir il 1 parçanın altına inemez).

### Yatay tutuş (telefon yan çevrilince)

Harita yatayda çok daha büyük çizilir: **1 harita birimi = 0.912 piksel** (dik tutuşun 2.2 katı).

| Yakınlaştırma | Rozet sığan | Sığmayan |
|---|---|---|
| 1× | 70 | 111 |
| 2× | 176 | 5 |
| 3× | 180 | 1 |

## Eşik seçenekleri — kaç parça birleşir?

Karar "hangi yakınlaştırmada okunsun" sorusuna denk gelir. Aşağıdaki tablo, seçilecek
**en küçük iç çember** değerine göre kaç parçanın eşiğin altında kaldığını gösterir.
Tek parçalı illerin parçaları birleştirilemez (bir il 1 parçanın altına inemez), o yüzden
ayrı sayıldı.

| Eşik (birim) | Dik 1× | Yatay 1× | Eşiğin altında | Birleştirilebilir | Kalan parça |
|---|---|---|---|---|---|
| 10 | 4.1 px | 9.1 px | 1 | 0 | **181** |
| 12 | 4.9 px | 10.9 px | 2 | 1 | **180** |
| 14 | 5.8 px | 12.8 px | 5 | 3 | **178** |
| 16 | 6.6 px | 14.6 px | 11 | 9 | **172** |
| 18 | 7.4 px | 16.4 px | 22 | 20 | **161** |
| 20 | 8.2 px | 18.2 px | 37 | 35 | **146** |
| 22 | 9.1 px | 20.1 px | 57 | 54 | **127** |
| 25 | 10.3 px | 22.8 px | 80 | 76 | **105** |

> Not: "Kalan parça" en iyi durumdur — zincirleme birleşmede birleşen parça hâlâ eşiğin
> altında kalabilir ve tekrar birleşir; gerçek sayı biraz daha düşük çıkabilir.

## En küçük 30 parça

| Parça | Ad | İl | İç çember (birim) | 1× px | 2× px | 3× px | Sığar mı (1×/2×/3×) |
|---|---|---|---|---|---|---|---|
| 77-1 | Yalova *(tek parçalı il)* | Yalova | 8.6 | 3.5 | 7.1 | 10.6 | ❌ / ❌ / ❌ |
| 17-1 | Gelibolu Yarımadası | Çanakkale | 10.1 | 4.1 | 8.3 | 12.4 | ❌ / ❌ / ❌ |
| 31-2 | İskenderun Körfezi | Hatay | 12.8 | 5.3 | 10.5 | 15.8 | ❌ / ❌ / ❌ |
| 41-1 | Gebze Sanayi | Kocaeli | 13.0 | 5.3 | 10.7 | 16.0 | ❌ / ❌ / ❌ |
| 79-1 | Kilis *(tek parçalı il)* | Kilis | 13.6 | 5.6 | 11.2 | 16.8 | ❌ / ❌ / ❌ |
| 54-1 | Adapazarı Ovası | Sakarya | 14.3 | 5.9 | 11.8 | 17.7 | ❌ / ❌ / ❌ |
| 56-1 | Siirt Merkez | Siirt | 15.1 | 6.2 | 12.5 | 18.7 | ❌ / ❌ / ❌ |
| 61-2 | Güney Vadiler | Trabzon | 15.1 | 6.2 | 12.5 | 18.7 | ❌ / ❌ / ❌ |
| 80-1 | Osmaniye | Osmaniye | 15.6 | 6.4 | 12.9 | 19.3 | ❌ / ❌ / ❌ |
| 47-3 | Midyat-Dargeçit | Mardin | 15.7 | 6.5 | 13.0 | 19.4 | ❌ / ❌ / ❌ |
| 59-2 | Süleymanpaşa Kıyı | Tekirdağ | 15.9 | 6.6 | 13.1 | 19.7 | ❌ / ❌ / ❌ |
| 48-2 | Marmaris-Datça | Muğla | 16.7 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 46-3 | Göksun-Andırın | Kahramanmaraş | 16.8 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 67-1 | Ereğli Sanayi | Zonguldak | 16.8 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 73-1 | Cizre-Silopi | Şırnak | 17.0 | 7.0 | 14.0 | 21.0 | ❌ / ❌ / ❌ |
| 49-2 | Varto | Muş | 17.4 | 7.2 | 14.3 | 21.5 | ❌ / ❌ / ❌ |
| 01-2 | Ceyhan Ovası | Adana | 17.4 | 7.2 | 14.4 | 21.6 | ❌ / ❌ / ❌ |
| 80-2 | Kadirli-Düziçi | Osmaniye | 17.5 | 7.2 | 14.4 | 21.7 | ❌ / ❌ / ❌ |
| 09-1 | Menderes Ovası | Aydın | 17.5 | 7.2 | 14.4 | 21.7 | ❌ / ❌ / ❌ |
| 58-4 | Suşehri | Sivas | 17.6 | 7.3 | 14.5 | 21.8 | ❌ / ❌ / ❌ |
| 39-1 | Ergene Ovası | Kırklareli | 17.8 | 7.3 | 14.7 | 22.0 | ❌ / ❌ / ❌ |
| 54-2 | Kıyı ve Doğu | Sakarya | 17.8 | 7.3 | 14.7 | 22.0 | ❌ / ❌ / ❌ |
| 09-3 | Çine Dağlık | Aydın | 18.3 | 7.5 | 15.0 | 22.6 | ❌ / ❌ / ❌ |
| 59-3 | Güney Trakya | Tekirdağ | 18.6 | 7.7 | 15.3 | 23.0 | ❌ / ❌ / ❌ |
| 27-2 | İslahiye-Nurdağı | Gaziantep | 18.7 | 7.7 | 15.4 | 23.1 | ❌ / ❌ / ❌ |
| 54-3 | Sapanca-Geyve | Sakarya | 19.0 | 7.8 | 15.6 | 23.4 | ❌ / ❌ / ❌ |
| 33-1 | Mersin Kenti | Mersin | 19.2 | 7.9 | 15.8 | 23.7 | ❌ / ❌ / ❌ |
| 32-1 | Isparta Ovası | Isparta | 19.3 | 8.0 | 15.9 | 23.9 | ❌ / ❌ / ❌ |
| 43-3 | Simav-Gediz | Kütahya | 19.4 | 8.0 | 16.0 | 23.9 | ❌ / ❌ / ❌ |
| 09-2 | Söke-Kuşadası | Aydın | 19.5 | 8.0 | 16.1 | 24.1 | ❌ / ❌ / ❌ |

## Tüm parçalar (en küçükten büyüğe)

| Parça | Ad | İl | İç çember (birim) | 1× px | 2× px | 3× px | Sığar mı (1×/2×/3×) |
|---|---|---|---|---|---|---|---|
| 77-1 | Yalova *(tek parçalı il)* | Yalova | 8.6 | 3.5 | 7.1 | 10.6 | ❌ / ❌ / ❌ |
| 17-1 | Gelibolu Yarımadası | Çanakkale | 10.1 | 4.1 | 8.3 | 12.4 | ❌ / ❌ / ❌ |
| 31-2 | İskenderun Körfezi | Hatay | 12.8 | 5.3 | 10.5 | 15.8 | ❌ / ❌ / ❌ |
| 41-1 | Gebze Sanayi | Kocaeli | 13.0 | 5.3 | 10.7 | 16.0 | ❌ / ❌ / ❌ |
| 79-1 | Kilis *(tek parçalı il)* | Kilis | 13.6 | 5.6 | 11.2 | 16.8 | ❌ / ❌ / ❌ |
| 54-1 | Adapazarı Ovası | Sakarya | 14.3 | 5.9 | 11.8 | 17.7 | ❌ / ❌ / ❌ |
| 56-1 | Siirt Merkez | Siirt | 15.1 | 6.2 | 12.5 | 18.7 | ❌ / ❌ / ❌ |
| 61-2 | Güney Vadiler | Trabzon | 15.1 | 6.2 | 12.5 | 18.7 | ❌ / ❌ / ❌ |
| 80-1 | Osmaniye | Osmaniye | 15.6 | 6.4 | 12.9 | 19.3 | ❌ / ❌ / ❌ |
| 47-3 | Midyat-Dargeçit | Mardin | 15.7 | 6.5 | 13.0 | 19.4 | ❌ / ❌ / ❌ |
| 59-2 | Süleymanpaşa Kıyı | Tekirdağ | 15.9 | 6.6 | 13.1 | 19.7 | ❌ / ❌ / ❌ |
| 48-2 | Marmaris-Datça | Muğla | 16.7 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 46-3 | Göksun-Andırın | Kahramanmaraş | 16.8 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 67-1 | Ereğli Sanayi | Zonguldak | 16.8 | 6.9 | 13.8 | 20.7 | ❌ / ❌ / ❌ |
| 73-1 | Cizre-Silopi | Şırnak | 17.0 | 7.0 | 14.0 | 21.0 | ❌ / ❌ / ❌ |
| 49-2 | Varto | Muş | 17.4 | 7.2 | 14.3 | 21.5 | ❌ / ❌ / ❌ |
| 01-2 | Ceyhan Ovası | Adana | 17.4 | 7.2 | 14.4 | 21.6 | ❌ / ❌ / ❌ |
| 80-2 | Kadirli-Düziçi | Osmaniye | 17.5 | 7.2 | 14.4 | 21.7 | ❌ / ❌ / ❌ |
| 09-1 | Menderes Ovası | Aydın | 17.5 | 7.2 | 14.4 | 21.7 | ❌ / ❌ / ❌ |
| 58-4 | Suşehri | Sivas | 17.6 | 7.3 | 14.5 | 21.8 | ❌ / ❌ / ❌ |
| 39-1 | Ergene Ovası | Kırklareli | 17.8 | 7.3 | 14.7 | 22.0 | ❌ / ❌ / ❌ |
| 54-2 | Kıyı ve Doğu | Sakarya | 17.8 | 7.3 | 14.7 | 22.0 | ❌ / ❌ / ❌ |
| 09-3 | Çine Dağlık | Aydın | 18.3 | 7.5 | 15.0 | 22.6 | ❌ / ❌ / ❌ |
| 59-3 | Güney Trakya | Tekirdağ | 18.6 | 7.7 | 15.3 | 23.0 | ❌ / ❌ / ❌ |
| 27-2 | İslahiye-Nurdağı | Gaziantep | 18.7 | 7.7 | 15.4 | 23.1 | ❌ / ❌ / ❌ |
| 54-3 | Sapanca-Geyve | Sakarya | 19.0 | 7.8 | 15.6 | 23.4 | ❌ / ❌ / ❌ |
| 33-1 | Mersin Kenti | Mersin | 19.2 | 7.9 | 15.8 | 23.7 | ❌ / ❌ / ❌ |
| 32-1 | Isparta Ovası | Isparta | 19.3 | 8.0 | 15.9 | 23.9 | ❌ / ❌ / ❌ |
| 43-3 | Simav-Gediz | Kütahya | 19.4 | 8.0 | 16.0 | 23.9 | ❌ / ❌ / ❌ |
| 09-2 | Söke-Kuşadası | Aydın | 19.5 | 8.0 | 16.1 | 24.1 | ❌ / ❌ / ❌ |
| 07-4 | Antalya Ovası | Antalya | 19.6 | 8.1 | 16.1 | 24.2 | ❌ / ❌ / ❌ |
| 57-1 | Sinop Kıyı | Sinop | 19.6 | 8.1 | 16.2 | 24.2 | ❌ / ❌ / ❌ |
| 52-2 | Güney Yayla | Ordu | 19.8 | 8.2 | 16.3 | 24.5 | ❌ / ❌ / ❌ |
| 41-2 | İzmit | Kocaeli | 19.9 | 8.2 | 16.4 | 24.6 | ❌ / ❌ / ❌ |
| 21-1 | Diyarbakır Kenti | Diyarbakır | 19.9 | 8.2 | 16.4 | 24.6 | ❌ / ❌ / ❌ |
| 16-1 | Bursa Ovası | Bursa | 19.9 | 8.2 | 16.4 | 24.7 | ❌ / ❌ / ❌ |
| 33-2 | Tarsus | Mersin | 20.0 | 8.2 | 16.5 | 24.7 | ❌ / ❌ / ❌ |
| 10-3 | Orta | Balıkesir | 20.2 | 8.3 | 16.6 | 24.9 | ❌ / ❌ / ❌ |
| 10-2 | Batı — Ege Kıyısı | Balıkesir | 20.3 | 8.4 | 16.7 | 25.1 | ❌ / ❌ / ❌ |
| 02-2 | Kâhta-Gerger | Adıyaman | 20.4 | 8.4 | 16.8 | 25.2 | ❌ / ❌ / ❌ |
| 59-1 | Çorlu-Çerkezköy Sanayi | Tekirdağ | 20.4 | 8.4 | 16.8 | 25.3 | ❌ / ❌ / ❌ |
| 05-2 | Merzifon-Taşova | Amasya | 20.5 | 8.4 | 16.9 | 25.3 | ❌ / ❌ / ❌ |
| 15-2 | Gölhisar-Tefenni | Burdur | 20.5 | 8.4 | 16.9 | 25.3 | ❌ / ❌ / ❌ |
| 07-3 | Alanya | Antalya | 20.6 | 8.5 | 16.9 | 25.4 | ❌ / ❌ / ❌ |
| 16-3 | Doğu | Bursa | 20.7 | 8.5 | 17.0 | 25.6 | ❌ / ❌ / ❌ |
| 51-2 | Bolkar Geçidi | Niğde | 20.8 | 8.6 | 17.1 | 25.7 | ❌ / ❌ / ❌ |
| 34-2 | Anadolu Yakası | İstanbul | 20.8 | 8.6 | 17.2 | 25.7 | ❌ / ❌ / ❌ |
| 23-2 | Doğu Dağlık | Elazığ | 21.0 | 8.6 | 17.3 | 25.9 | ❌ / ❌ / ❌ |
| 76-1 | Iğdır *(tek parçalı il)* | Iğdır | 21.0 | 8.6 | 17.3 | 25.9 | ❌ / ❌ / ❌ |
| 56-2 | Doğu Dağlık | Siirt | 21.0 | 8.6 | 17.3 | 25.9 | ❌ / ❌ / ❌ |
| 70-2 | Ermenek | Karaman | 21.1 | 8.7 | 17.4 | 26.1 | ❌ / ❌ / ✅ |
| 55-1 | Bafra ve Çarşamba Ovaları | Samsun | 21.2 | 8.7 | 17.4 | 26.2 | ❌ / ❌ / ✅ |
| 14-2 | Güney Dağlık | Bolu | 21.5 | 8.9 | 17.7 | 26.6 | ❌ / ❌ / ✅ |
| 72-2 | Kozluk-Sason | Batman | 21.6 | 8.9 | 17.8 | 26.7 | ❌ / ❌ / ✅ |
| 22-1 | Edirne ve Meriç | Edirne | 21.7 | 9.0 | 17.9 | 26.9 | ❌ / ❌ / ✅ |
| 60-2 | Turhal-Zile | Tokat | 21.8 | 9.0 | 18.0 | 26.9 | ❌ / ❌ / ✅ |
| 20-2 | Çivril-Çal | Denizli | 22.0 | 9.1 | 18.1 | 27.2 | ❌ / ❌ / ✅ |
| 21-4 | Kuzey Dağlık | Diyarbakır | 22.0 | 9.1 | 18.1 | 27.2 | ❌ / ❌ / ✅ |
| 74-1 | Bartın *(tek parçalı il)* | Bartın | 22.1 | 9.1 | 18.2 | 27.3 | ❌ / ❌ / ✅ |
| 67-2 | Zonguldak Havzası | Zonguldak | 22.2 | 9.1 | 18.3 | 27.4 | ❌ / ❌ / ✅ |
| 36-2 | Sarıkamış-Kağızman | Kars | 22.4 | 9.2 | 18.4 | 27.7 | ❌ / ❌ / ✅ |
| 48-3 | Fethiye | Muğla | 22.4 | 9.2 | 18.4 | 27.7 | ❌ / ❌ / ✅ |
| 60-3 | Tokat Ovası | Tokat | 22.6 | 9.3 | 18.6 | 28.0 | ❌ / ❌ / ✅ |
| 47-1 | Mardin Eşiği | Mardin | 23.0 | 9.5 | 18.9 | 28.4 | ❌ / ❌ / ✅ |
| 20-1 | Denizli Ovası | Denizli | 23.0 | 9.5 | 18.9 | 28.4 | ❌ / ❌ / ✅ |
| 22-2 | Keşan-İpsala | Edirne | 23.6 | 9.7 | 19.4 | 29.2 | ❌ / ❌ / ✅ |
| 08-2 | Yusufeli-Şavşat | Artvin | 23.9 | 9.8 | 19.7 | 29.5 | ❌ / ❌ / ✅ |
| 45-1 | Gediz Ovası | Manisa | 23.9 | 9.9 | 19.7 | 29.6 | ❌ / ❌ / ✅ |
| 13-2 | Bitlis-Hizan | Bitlis | 24.0 | 9.9 | 19.8 | 29.6 | ❌ / ❌ / ✅ |
| 21-3 | Ergani-Çermik | Diyarbakır | 24.3 | 10.0 | 20.0 | 30.1 | ❌ / ❌ / ✅ |
| 31-1 | Antakya ve Amik | Hatay | 24.4 | 10.1 | 20.1 | 30.2 | ❌ / ❌ / ✅ |
| 16-2 | Batı Ova | Bursa | 24.4 | 10.1 | 20.1 | 30.2 | ❌ / ❌ / ✅ |
| 05-1 | Amasya Ovası | Amasya | 24.5 | 10.1 | 20.2 | 30.2 | ❌ / ❌ / ✅ |
| 57-2 | Boyabat | Sinop | 24.6 | 10.1 | 20.3 | 30.4 | ❌ / ❌ / ✅ |
| 16-4 | Uludağ Güneyi | Bursa | 24.6 | 10.1 | 20.3 | 30.4 | ❌ / ❌ / ✅ |
| 03-1 | Sandıklı-Dinar | Afyonkarahisar | 24.6 | 10.1 | 20.3 | 30.4 | ❌ / ❌ / ✅ |
| 10-1 | Kuzey — Marmara Kıyısı | Balıkesir | 24.6 | 10.1 | 20.3 | 30.4 | ❌ / ❌ / ✅ |
| 66-2 | Akdağ | Yozgat | 24.9 | 10.2 | 20.5 | 30.7 | ❌ / ❌ / ✅ |
| 21-2 | Dicle Ovası | Diyarbakır | 25.0 | 10.3 | 20.6 | 30.8 | ❌ / ❌ / ✅ |
| 60-1 | Erbaa-Niksar | Tokat | 25.0 | 10.3 | 20.6 | 30.9 | ❌ / ❌ / ✅ |
| 61-1 | Trabzon Kıyı | Trabzon | 25.1 | 10.3 | 20.7 | 31.0 | ❌ / ❌ / ✅ |
| 34-1 | Avrupa Yakası | İstanbul | 25.1 | 10.3 | 20.7 | 31.0 | ❌ / ❌ / ✅ |
| 73-2 | Şırnak Dağlık | Şırnak | 25.2 | 10.4 | 20.8 | 31.1 | ❌ / ❌ / ✅ |
| 33-4 | Anamur | Mersin | 25.2 | 10.4 | 20.8 | 31.2 | ❌ / ❌ / ✅ |
| 28-2 | Şebinkarahisar | Giresun | 25.5 | 10.5 | 21.0 | 31.6 | ❌ / ❌ / ✅ |
| 65-2 | Erciş-Muradiye | Van | 25.7 | 10.6 | 21.1 | 31.7 | ❌ / ❌ / ✅ |
| 01-1 | Çukurova Kenti | Adana | 25.8 | 10.6 | 21.2 | 31.9 | ❌ / ❌ / ✅ |
| 53-1 | Rize Kıyı *(tek parçalı il)* | Rize | 25.8 | 10.6 | 21.3 | 31.9 | ❌ / ❌ / ✅ |
| 52-1 | Ordu Kıyı | Ordu | 26.0 | 10.7 | 21.4 | 32.1 | ❌ / ❌ / ✅ |
| 81-1 | Düzce *(tek parçalı il)* | Düzce | 26.1 | 10.7 | 21.5 | 32.2 | ❌ / ❌ / ✅ |
| 47-2 | Kızıltepe-Nusaybin | Mardin | 26.3 | 10.9 | 21.7 | 32.6 | ❌ / ❌ / ✅ |
| 72-1 | Batman Ovası | Batman | 26.4 | 10.9 | 21.8 | 32.6 | ❌ / ❌ / ✅ |
| 18-2 | Ilgaz-Çerkeş | Çankırı | 26.5 | 10.9 | 21.9 | 32.8 | ❌ / ❌ / ✅ |
| 06-2 | Çankaya ve Güney | Ankara | 26.6 | 10.9 | 21.9 | 32.8 | ❌ / ❌ / ✅ |
| 44-2 | Kuzey-Doğu Dağlık | Malatya | 26.9 | 11.1 | 22.2 | 33.2 | ❌ / ❌ / ✅ |
| 35-1 | Kuzey Kıyı ve Aliağa | İzmir | 27.0 | 11.1 | 22.3 | 33.4 | ❌ / ❌ / ✅ |
| 37-2 | Güney ve Kıyı | Kastamonu | 27.2 | 11.2 | 22.4 | 33.6 | ❌ / ❌ / ✅ |
| 78-1 | Karabük *(tek parçalı il)* | Karabük | 27.4 | 11.3 | 22.6 | 33.9 | ❌ / ❌ / ✅ |
| 10-4 | Doğu Dağlık | Balıkesir | 27.4 | 11.3 | 22.6 | 33.9 | ❌ / ❌ / ✅ |
| 43-2 | Tavşanlı-Emet | Kütahya | 27.5 | 11.3 | 22.6 | 34.0 | ❌ / ❌ / ✅ |
| 63-2 | Harran ve Fırat | Şanlıurfa | 27.5 | 11.3 | 22.7 | 34.0 | ❌ / ❌ / ✅ |
| 45-2 | Akhisar-Soma | Manisa | 27.7 | 11.4 | 22.8 | 34.2 | ❌ / ❌ / ✅ |
| 08-1 | Çoruh Kıyı | Artvin | 27.8 | 11.5 | 22.9 | 34.4 | ❌ / ❌ / ✅ |
| 65-1 | Güney Dağlık | Van | 28.0 | 11.5 | 23.0 | 34.6 | ❌ / ❌ / ✅ |
| 15-1 | Burdur Ovası | Burdur | 28.0 | 11.5 | 23.0 | 34.6 | ❌ / ❌ / ✅ |
| 28-1 | Giresun Kıyı | Giresun | 28.2 | 11.6 | 23.2 | 34.8 | ❌ / ❌ / ✅ |
| 17-3 | Çanakkale ve Kaz Dağları | Çanakkale | 28.2 | 11.6 | 23.2 | 34.8 | ❌ / ❌ / ✅ |
| 45-3 | Doğu Dağlık | Manisa | 28.2 | 11.6 | 23.3 | 34.9 | ❌ / ❌ / ✅ |
| 63-1 | Urfa Kenti | Şanlıurfa | 28.4 | 11.7 | 23.4 | 35.1 | ❌ / ❌ / ✅ |
| 01-4 | Adana Kuzey | Adana | 28.5 | 11.7 | 23.5 | 35.2 | ❌ / ❌ / ✅ |
| 38-2 | Develi-Yahyalı | Kayseri | 28.5 | 11.7 | 23.5 | 35.2 | ❌ / ❌ / ✅ |
| 30-1 | Hakkari-Çukurca | Hakkari | 28.6 | 11.8 | 23.5 | 35.3 | ❌ / ❌ / ✅ |
| 19-2 | Kuzey | Çorum | 28.7 | 11.8 | 23.6 | 35.5 | ❌ / ❌ / ✅ |
| 39-2 | Istranca | Kırklareli | 28.9 | 11.9 | 23.9 | 35.8 | ❌ / ❌ / ✅ |
| 38-1 | Kayseri Kenti | Kayseri | 29.0 | 11.9 | 23.9 | 35.8 | ❌ / ❌ / ✅ |
| 24-1 | Erzincan Ovası | Erzincan | 29.1 | 12.0 | 24.0 | 35.9 | ❌ / ❌ / ✅ |
| 01-3 | Adana Batı | Adana | 29.3 | 12.1 | 24.1 | 36.2 | ❌ / ❌ / ✅ |
| 44-1 | Malatya Ovası | Malatya | 29.3 | 12.1 | 24.1 | 36.2 | ❌ / ❌ / ✅ |
| 17-2 | Biga-Çan | Çanakkale | 29.4 | 12.1 | 24.2 | 36.3 | ❌ / ❌ / ✅ |
| 69-1 | Bayburt *(tek parçalı il)* | Bayburt | 29.6 | 12.2 | 24.4 | 36.6 | ❌ / ❌ / ✅ |
| 48-1 | Menteşe-Milas | Muğla | 29.7 | 12.2 | 24.5 | 36.7 | ❌ / ❌ / ✅ |
| 58-2 | Şarkışla-Kangal | Sivas | 29.8 | 12.3 | 24.5 | 36.8 | ❌ / ❌ / ✅ |
| 49-1 | Muş Ovası | Muş | 29.8 | 12.3 | 24.6 | 36.9 | ❌ / ❌ / ✅ |
| 18-1 | Çankırı Merkez | Çankırı | 29.9 | 12.3 | 24.7 | 37.0 | ❌ / ❌ / ✅ |
| 30-2 | Yüksekova-Şemdinli | Hakkari | 30.0 | 12.4 | 24.7 | 37.1 | ❌ / ❌ / ✅ |
| 63-4 | Viranşehir-Ceylanpınar | Şanlıurfa | 30.1 | 12.4 | 24.8 | 37.2 | ❌ / ❌ / ✅ |
| 06-3 | Kuzeybatı | Ankara | 30.2 | 12.4 | 24.9 | 37.3 | ❌ / ❌ / ✅ |
| 11-1 | Bilecik *(tek parçalı il)* | Bilecik | 30.2 | 12.4 | 24.9 | 37.3 | ❌ / ❌ / ✅ |
| 02-1 | Adıyaman Ovası | Adıyaman | 30.4 | 12.5 | 25.0 | 37.5 | ❌ / ❌ / ✅ |
| 03-3 | Afyon Ovası | Afyonkarahisar | 30.5 | 12.6 | 25.2 | 37.7 | ❌ / ❌ / ✅ |
| 25-2 | Oltu-Tortum | Erzurum | 30.8 | 12.7 | 25.4 | 38.1 | ❌ / ❌ / ✅ |
| 65-4 | Van Kenti | Van | 30.9 | 12.7 | 25.5 | 38.2 | ❌ / ❌ / ✅ |
| 75-1 | Ardahan *(tek parçalı il)* | Ardahan | 30.9 | 12.7 | 25.5 | 38.2 | ❌ / ❌ / ✅ |
| 26-1 | Eskişehir Ovası | Eskişehir | 30.9 | 12.7 | 25.5 | 38.2 | ❌ / ❌ / ✅ |
| 42-1 | Konya Kenti | Konya | 31.1 | 12.8 | 25.6 | 38.5 | ❌ / ❌ / ✅ |
| 71-1 | Kırıkkale *(tek parçalı il)* | Kırıkkale | 31.3 | 12.9 | 25.8 | 38.7 | ❌ / ❌ / ✅ |
| 25-4 | Pasinler | Erzurum | 31.3 | 12.9 | 25.8 | 38.7 | ❌ / ❌ / ✅ |
| 25-1 | Hınıs-Tekman | Erzurum | 31.4 | 13.0 | 25.9 | 38.9 | ❌ / ❌ / ✅ |
| 14-1 | Bolu Ovası | Bolu | 31.4 | 13.0 | 25.9 | 38.9 | ❌ / ❌ / ✅ |
| 42-4 | Ereğli-Karapınar | Konya | 31.6 | 13.0 | 26.0 | 39.1 | ❌ / ✅ / ✅ |
| 06-4 | Ankara Kenti | Ankara | 32.0 | 13.2 | 26.3 | 39.5 | ❌ / ✅ / ✅ |
| 04-2 | Doğubayazıt | Ağrı | 32.0 | 13.2 | 26.4 | 39.5 | ❌ / ✅ / ✅ |
| 64-1 | Uşak *(tek parçalı il)* | Uşak | 32.1 | 13.2 | 26.5 | 39.7 | ❌ / ✅ / ✅ |
| 51-1 | Niğde Ovası | Niğde | 32.3 | 13.3 | 26.6 | 39.9 | ❌ / ✅ / ✅ |
| 13-1 | Tatvan-Ahlat | Bitlis | 32.3 | 13.3 | 26.6 | 40.0 | ❌ / ✅ / ✅ |
| 36-1 | Kars Ovası | Kars | 33.1 | 13.6 | 27.2 | 40.9 | ❌ / ✅ / ✅ |
| 43-1 | Kütahya Ovası | Kütahya | 33.3 | 13.7 | 27.4 | 41.1 | ❌ / ✅ / ✅ |
| 50-1 | Nevşehir *(tek parçalı il)* | Nevşehir | 33.3 | 13.7 | 27.4 | 41.2 | ❌ / ✅ / ✅ |
| 46-2 | Elbistan-Afşin | Kahramanmaraş | 33.3 | 13.7 | 27.4 | 41.2 | ❌ / ✅ / ✅ |
| 03-2 | Bolvadin-Emirdağ | Afyonkarahisar | 33.3 | 13.7 | 27.5 | 41.2 | ❌ / ✅ / ✅ |
| 25-3 | Erzurum Ovası | Erzurum | 33.4 | 13.8 | 27.5 | 41.3 | ❌ / ✅ / ✅ |
| 35-2 | İzmir Metropol | İzmir | 33.8 | 13.9 | 27.9 | 41.8 | ❌ / ✅ / ✅ |
| 58-3 | Zara-Divriği | Sivas | 34.0 | 14.0 | 28.0 | 42.0 | ❌ / ✅ / ✅ |
| 63-3 | Siverek-Hilvan | Şanlıurfa | 34.2 | 14.1 | 28.2 | 42.3 | ❌ / ✅ / ✅ |
| 23-1 | Elazığ Ovası | Elazığ | 34.4 | 14.2 | 28.3 | 42.5 | ❌ / ✅ / ✅ |
| 06-1 | Ankara Batı | Ankara | 34.4 | 14.2 | 28.4 | 42.6 | ❌ / ✅ / ✅ |
| 32-2 | Eğirdir-Yalvaç | Isparta | 35.6 | 14.7 | 29.4 | 44.0 | ❌ / ✅ / ✅ |
| 27-1 | Gaziantep Kenti | Gaziantep | 35.7 | 14.7 | 29.4 | 44.1 | ❌ / ✅ / ✅ |
| 29-1 | Gümüşhane *(tek parçalı il)* | Gümüşhane | 36.5 | 15.0 | 30.1 | 45.1 | ❌ / ✅ / ✅ |
| 70-1 | Karaman Ovası | Karaman | 36.6 | 15.1 | 30.2 | 45.3 | ❌ / ✅ / ✅ |
| 46-1 | Maraş Ovası | Kahramanmaraş | 36.9 | 15.2 | 30.4 | 45.6 | ❌ / ✅ / ✅ |
| 20-3 | Güney Dağlık | Denizli | 37.0 | 15.3 | 30.5 | 45.8 | ❌ / ✅ / ✅ |
| 07-1 | Manavgat-Serik | Antalya | 37.3 | 15.4 | 30.7 | 46.1 | ❌ / ✅ / ✅ |
| 26-2 | Sivrihisar | Eskişehir | 37.9 | 15.6 | 31.2 | 46.8 | ❌ / ✅ / ✅ |
| 42-3 | Konya Güney | Konya | 37.9 | 15.6 | 31.3 | 46.9 | ❌ / ✅ / ✅ |
| 07-2 | Batı Kıyı | Antalya | 38.0 | 15.6 | 31.3 | 46.9 | ❌ / ✅ / ✅ |
| 04-1 | Ağrı Ovası | Ağrı | 38.4 | 15.8 | 31.7 | 47.5 | ❌ / ✅ / ✅ |
| 24-2 | Batı Dağlık | Erzincan | 40.0 | 16.5 | 33.0 | 49.5 | ❌ / ✅ / ✅ |
| 19-1 | Çorum Ovası | Çorum | 40.6 | 16.7 | 33.5 | 50.2 | ❌ / ✅ / ✅ |
| 37-1 | Kastamonu Merkez | Kastamonu | 41.0 | 16.9 | 33.8 | 50.6 | ❌ / ✅ / ✅ |
| 66-1 | Bozok Platosu | Yozgat | 41.1 | 16.9 | 33.9 | 50.8 | ❌ / ✅ / ✅ |
| 40-1 | Kırşehir *(tek parçalı il)* | Kırşehir | 41.2 | 17.0 | 33.9 | 50.9 | ❌ / ✅ / ✅ |
| 68-1 | Aksaray *(tek parçalı il)* | Aksaray | 41.7 | 17.2 | 34.4 | 51.5 | ❌ / ✅ / ✅ |
| 62-1 | Tunceli *(tek parçalı il)* | Tunceli | 41.8 | 17.2 | 34.4 | 51.6 | ❌ / ✅ / ✅ |
| 55-2 | Samsun Kenti | Samsun | 41.9 | 17.2 | 34.5 | 51.7 | ❌ / ✅ / ✅ |
| 33-3 | Erdemli-Silifke | Mersin | 42.5 | 17.5 | 35.0 | 52.5 | ❌ / ✅ / ✅ |
| 38-3 | Doğu Bozkır | Kayseri | 42.5 | 17.5 | 35.1 | 52.6 | ❌ / ✅ / ✅ |
| 12-1 | Bingöl *(tek parçalı il)* | Bingöl | 44.0 | 18.1 | 36.3 | 54.4 | ❌ / ✅ / ✅ |
| 65-3 | Özalp-Başkale | Van | 47.3 | 19.5 | 39.0 | 58.5 | ❌ / ✅ / ✅ |
| 58-1 | Sivas Ovası | Sivas | 50.3 | 20.7 | 41.4 | 62.2 | ❌ / ✅ / ✅ |
| 42-2 | Kuzey Bozkır | Konya | 53.9 | 22.2 | 44.4 | 66.6 | ❌ / ✅ / ✅ |
