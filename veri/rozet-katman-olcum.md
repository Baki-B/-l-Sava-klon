# ROZET KATMAN ÖLÇÜMÜ — üç katmanın sınırı nerede?

> Üreten: `scripts/rozet-katman-olcum.js` (Görev 04 / Adım 2). **Elle düzenleme yok.**
> Görsel karşılığı: `onizleme/rozet-katman-testi.html`
>
> Görev 03B'deki `veri/parca-olcum.md` **dik tutuş** referanslıydı ve yalnızca parçaları
> ölçüyordu. Oyun yatay tutuşa kilitlendi (Görev 04 / Adım 1) ve orta katman için **il**
> rozeti de gerekiyor. Bu belge ikisini de kapsar ve o belgenin yerini alır.

## Ölçüm koşulları

| | Değer | Nereden |
|---|---|---|
| Harita kutusu | 1000 × 452 birim | `veri/parcalar.json` meta |
| Referans ekran | 915 × 412 dp (yatay telefon) | `src/olcu.js` — kısa kenar < 600 dp |
| 1 harita birimi | **0.9115 piksel** | `Math.min(915/1000, 412/452)` — `Harita.js` sığdırma mantığı |
| (dik tutuşta) | 0.4120 piksel | yatay tutuş 2.21 kat büyük |
| Rozet çapı | 26 piksel | iki haneli sayı / "99+" için ölçülen boy |
| **Yakınlaştırma aralığı** | **0.9× – 7×** | `src/bilesenler/Harita.js` pinch sınırları (koddan okundu) |

**Rozet haritayla büyümez** (Baki kararı) — ekranda sabit 26 px kalır.
Bu yüzden sığma ölçütü: `iç çember (birim) × 0.9115 × yakınlaştırma ≥ 26`

## Yakınlaştırma taraması

Her yakınlaştırma adımında kaç ile / kaç parçaya rozet sığıyor:

**Sığan** = rozet şeklin içine sığıyor. **Çakışan** = rozet komşusunun rozetiyle üst üste
biniyor (hepsinde ordu varsayımıyla, en kötü durum). İkisi ayrı sorudur; okunabilirliği
çoğu zaman ikincisi belirler.

| Yakınlaştırma | İl: sığan (81) | İl: çakışan | Parça: sığan (181) | Parça: çakışan |
|---|---|---|---|---|
| 0.9× | 57 (%70) | 8 | 41 (%23) | 108 |
| 1.15× | 74 (%91) | 0 | 104 (%57) | 36 |
| 1.4× | 79 (%98) | 0 | 141 (%78) | 13 |
| 1.65× | 79 (%98) | 0 | 166 (%92) | 2 |
| 1.9× | 79 (%98) | 0 | 175 (%97) | 2 |
| 2.15× | 80 (%99) | 0 | 177 (%98) | 0 |
| 2.4× | 80 (%99) | 0 | 179 (%99) | 0 |
| 2.65× | 80 (%99) | 0 | 179 (%99) | 0 |
| 2.9× | 80 (%99) | 0 | 180 (%99) | 0 |
| 3.15× | 80 (%99) | 0 | 180 (%99) | 0 |
| 3.65× | 81 (%100) | 0 | 181 (%100) | 0 |
| 4.15× | 81 (%100) | 0 | 181 (%100) | 0 |
| 4.65× | 81 (%100) | 0 | 181 (%100) | 0 |
| 5.15× | 81 (%100) | 0 | 181 (%100) | 0 |
| 5.65× | 81 (%100) | 0 | 181 (%100) | 0 |
| 6.15× | 81 (%100) | 0 | 181 (%100) | 0 |
| 6.65× | 81 (%100) | 0 | 181 (%100) | 0 |

Hiç çakışma kalmaması için gereken yakınlaştırma: **il 1.05×**, **parça 1.97×**.

## Eşik önerileri — bu tablo kararın kendisi

"Şeklin yüzde kaçına rozet sığarsa o katman açılsın?" sorusunun karşılığı:

| Kapsama | İl rozeti için gereken yakınlaştırma | Parça rozeti için gereken |
|---|---|---|
| %50 ' ine sığar | **0.80×** | **1.08×** |
| %75 ' ine sığar | **0.94×** | **1.37×** |
| %90 ' ine sığar | **1.14×** | **1.63×** |
| %95 ' ine sığar | **1.29×** | **1.81×** |
| %100 ' ine sığar | **3.31×** | **3.32×** |

## ÖNERİ — ölçümden türeyen sınırlar

Ölçüt: rozet şekle sığsın (**≥%90**) **VE** komşusunun rozetini ezmesin (**çakışma 0**).
Tarama adımları içinde bu iki koşulu birlikte karşılayan ilk yakınlaştırma:

| Katman | Aralık | Ne görünür |
|---|---|---|
| **Uzak** | 0.9× – 1.15× | yalnızca harita, rozet yok |
| **Orta** | 1.15× – 2.15× | il başına tek rozet |
| **Yakın** | 2.15× – 7× | parça başına rozet |

**Dikkat çeken bulgu:** uzak katman DAR bir şerit. En uzak seviyede (0.9×) bile

il rozetlerinin %70'i zaten sığıyor ve yalnızca 8 tanesi çakışıyor. Yani
"uzak katmanda harita temiz kalsın" kararı okunabilirlik ZORUNLULUĞU değil, **tercih**.
Haritanın daha uzun süre temiz kalmasını istersen ilk sınırı yukarı çekmek serbest.

### Bunu okuma kılavuzu

- **Uzak → Orta sınırı** = il rozetlerinin okunur olduğu yakınlaştırma. Yukarıdaki
  "İl rozeti" sütunundan seçilir.
- **Orta → Yakın sınırı** = parça rozetlerinin okunur olduğu yakınlaştırma. "Parça
  rozeti" sütunundan seçilir.
- %100 aramak pahalıdır: en küçük birkaç şekil bütün eşiği yukarı çeker. %90–95 seçip
  kalan birkaç şeklin rozetini **kaydırmak** (aşağıya bak) daha ucuz.

## Kaydırma gereken parçalar

En yakın yakınlaştırmada (7×) bile rozeti sığmayan parça: **0**

Yok — yeterince yaklaşınca hepsine sığıyor.

Görev belgesi §7.2'nin adıyla andığı beş küçük parça, gereken yakınlaştırmayla:

| Parça | Ad | İç çember | Rozetin sığması için gereken yakınlaştırma |
|---|---|---|---|
| 17-1 | Gelibolu Yarımadası | 10.1 | **2.83×** |
| 77-1 | Yalova | 8.6 | **3.32×** |
| 31-2 | İskenderun Körfezi | 12.8 | **2.23×** |
| 41-1 | Gebze Sanayi | 13.0 | **2.20×** |
| 79-1 | Kilis | 13.6 | **2.10×** |

## En küçük 25 il (orta katman rozeti)

| İl | Parça | İç çember (birim) | 1×'te px | Gereken yakınlaştırma |
|---|---|---|---|---|
| Yalova | 1 | 8.6 | 7.8 | 3.31× |
| Kilis | 1 | 13.6 | 12.4 | 2.10× |
| Iğdır | 1 | 21.0 | 19.1 | 1.36× |
| Kocaeli | 2 | 21.6 | 19.7 | 1.32× |
| Bartın | 1 | 22.1 | 20.1 | 1.29× |
| Edirne | 2 | 23.7 | 21.6 | 1.21× |
| Osmaniye | 2 | 24.7 | 22.5 | 1.15× |
| Amasya | 2 | 25.0 | 22.8 | 1.14× |
| İstanbul | 2 | 25.0 | 22.8 | 1.14× |
| Trabzon | 2 | 25.1 | 22.9 | 1.14× |
| Rize | 1 | 25.9 | 23.6 | 1.10× |
| Düzce | 1 | 26.1 | 23.8 | 1.09× |
| Zonguldak | 2 | 26.3 | 24.0 | 1.08× |
| Batman | 2 | 26.5 | 24.1 | 1.08× |
| Karabük | 1 | 27.5 | 25.0 | 1.04× |
| Sakarya | 3 | 28.7 | 26.2 | 0.99× |
| Hatay | 2 | 28.8 | 26.3 | 0.99× |
| Şırnak | 2 | 29.0 | 26.4 | 0.98× |
| Bayburt | 1 | 29.7 | 27.0 | 0.96× |
| Muğla | 3 | 29.7 | 27.1 | 0.96× |
| Bilecik | 1 | 30.2 | 27.5 | 0.94× |
| Ardahan | 1 | 30.9 | 28.2 | 0.92× |
| Kırıkkale | 1 | 31.3 | 28.5 | 0.91× |
| Burdur | 2 | 31.5 | 28.7 | 0.91× |
| Ordu | 2 | 31.8 | 29.0 | 0.90× |

## En küçük 25 parça (yakın katman rozeti)

| Parça | Ad | İl | İç çember (birim) | 1×'te px | Gereken yakınlaştırma |
|---|---|---|---|---|---|
| 77-1 | Yalova *(tek parçalı il)* | Yalova | 8.6 | 7.8 | 3.32× |
| 17-1 | Gelibolu Yarımadası | Çanakkale | 10.1 | 9.2 | 2.83× |
| 31-2 | İskenderun Körfezi | Hatay | 12.8 | 11.7 | 2.23× |
| 41-1 | Gebze Sanayi | Kocaeli | 13.0 | 11.8 | 2.20× |
| 79-1 | Kilis *(tek parçalı il)* | Kilis | 13.6 | 12.4 | 2.10× |
| 54-1 | Adapazarı Ovası | Sakarya | 14.3 | 13.1 | 1.99× |
| 56-1 | Siirt Merkez | Siirt | 15.1 | 13.8 | 1.89× |
| 61-2 | Güney Vadiler | Trabzon | 15.1 | 13.8 | 1.88× |
| 80-1 | Osmaniye | Osmaniye | 15.6 | 14.3 | 1.82× |
| 47-3 | Midyat-Dargeçit | Mardin | 15.7 | 14.3 | 1.81× |
| 59-2 | Süleymanpaşa Kıyı | Tekirdağ | 15.9 | 14.5 | 1.79× |
| 48-2 | Marmaris-Datça | Muğla | 16.7 | 15.2 | 1.71× |
| 46-3 | Göksun-Andırın | Kahramanmaraş | 16.8 | 15.3 | 1.70× |
| 67-1 | Ereğli Sanayi | Zonguldak | 16.8 | 15.3 | 1.70× |
| 73-1 | Cizre-Silopi | Şırnak | 17.0 | 15.5 | 1.67× |
| 49-2 | Varto | Muş | 17.4 | 15.9 | 1.64× |
| 01-2 | Ceyhan Ovası | Adana | 17.4 | 15.9 | 1.63× |
| 80-2 | Kadirli-Düziçi | Osmaniye | 17.5 | 16.0 | 1.63× |
| 09-1 | Menderes Ovası | Aydın | 17.5 | 16.0 | 1.63× |
| 58-4 | Suşehri | Sivas | 17.6 | 16.1 | 1.62× |
| 39-1 | Ergene Ovası | Kırklareli | 17.8 | 16.2 | 1.60× |
| 54-2 | Kıyı ve Doğu | Sakarya | 17.8 | 16.2 | 1.60× |
| 09-3 | Çine Dağlık | Aydın | 18.3 | 16.6 | 1.56× |
| 59-3 | Güney Trakya | Tekirdağ | 18.6 | 16.9 | 1.53× |
| 27-2 | İslahiye-Nurdağı | Gaziantep | 18.7 | 17.0 | 1.53× |
