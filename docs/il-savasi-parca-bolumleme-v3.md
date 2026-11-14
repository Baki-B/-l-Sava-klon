# İL SAVAŞI — 81 İL PARÇA BÖLÜMLEMESİ (v3)

> Oyun haritasının alt bölge (parça) tablosu. Toplam **181 parça**.
> Bu belge `il-savasi-tasarim.md` §7'nin veri katmanıdır.
>
> **Bu belge elle yazılmaz, üretilir.** Kaynak: `veri/parcalar.json` + `veri/iller.json`.
> Yeniden üretmek için: `node scripts/bolumleme-belgesi-uret.js`
> Bölümlemenin kendisi `scripts/parca-yeniden-bol.js` + `-bol-2.js` ile hesaplanır.
>
> v2 (coğrafi kontrast kuralıyla çizilmiş 195/185 parçalık hâl) tarihsel kayıt olarak durur.

---

## BÖLÜMLEME KURALLARI

Bu kurallar 2026-07-26'da Baki tarafından belirlendi ve eski "coğrafi kontrast"
kuralının yerine geçti. Eski kural parçaları **araziye göre** açıyordu; yeni kural
**haritada nasıl göründüklerine** göre açıyor.

### 1. Parça sayısı: her ilde 1–4

Beşinci parçaya izin yok. Gerekçe: daha az parça = oyuncu için daha az yük, haritada
daha az kalabalık. Karmaşıklık, oynanışa bir şey katmadığı yerde kırpılır.

### 2. Birincil ölçüt: okunabilirlik

Bir parça, **üstünde ordu rozetini taşıyabilecek kadar tıknaz** olmalı. Ölçü:
**iç çember çapı** — parçanın içine sığan en büyük dairenin çapı. Alan kullanılmaz;
uzun ve ince bir kıyı şeridi büyük alana sahip olabilir ama üstüne rozet konamaz.

Hedef: **iç çember ≥ 14.25 harita birimi.** Bu, telefon yatay tutulduğunda
2× yakınlaştırmada 26 piksellik rozetin parçaya sığmasına denk gelir.

### 3. İkincil ölçüt: nüfus ve ekonomi dengesi

Parçalar birbirine yakın büyüklükte olmalı — eşitlik aranmaz, ama **"ölü parça"**
(ilin payının çok küçük bir dilimini taşıyan parça) istenmez. Hedef: her parça ilin
payının en az **%10**'unu taşısın; kesin alt sınır **%6**.

### 4. Arazi artık bölmeyi belirlemez

Eskiden bir il, dağlık ve düz kesimi ayrışıyorsa bölünürdü. Artık tersi: parça önce
geometriye göre çizilir, sonra **içindeki baskın arazi** (ekonomi payına göre ağırlıklı)
o parçanın arazisi olur.

**İstisna:** arazisi üçe yakın eşit dağılmış illerde (her tip ≥ %28) arazi **birincil**
ölçüt olur, geometri ve pay ikincil kalır. Yoksa o illerde arazi tamamen anlamsızlaşırdı.

### 5. Bütünlük

Parça kara olarak bütün olmalı. **Adalar muaftır** — bağlı oldukları kara parçasının
içindedir (Adalar, Bozcaada, Gökçeada). Ayrı kara gövdesi olan yerler (Gelibolu gibi)
kendi parçası olur.

### 6. Kimlikler sabittir

Parça kimlikleri (`34-1` gibi) veri üretiminde baştan numaralanır. Harita değişince
eski kayıtlar geçersizleşir; oyun bunu `surum` alanıyla yakalar ve kaydı reddeder.

---

## KORUNAN İLLER

Baki'nin bugünkü hâlini beğendiği iller yeniden bölünmez, olduğu gibi bırakılır:
**Kayseri, Giresun, Sinop, Kastamonu, İstanbul, Çanakkale, Bursa.**
Liste `scripts/parca-yeniden-bol-2.js` içindeki `KORUNAN` ayarındadır.

Bursa bu listede özel bir yerde: Uludağ Güneyi ilin nüfusunun yalnızca **%4**'ünü
taşıyor, yani 3. kurala uymuyor. Algoritma İnegöl'ü oraya katarak dengeyi düzeltiyordu;
Baki bugünkü hâlin korunmasını seçti (2026-07-26).

---

## TABLO OKUMA

| Sütun | Anlamı |
|---|---|
| Nüfus payı | Parçanın, ilin toplam nüfusundan aldığı oran. İl içinde toplam 1.00. |
| Ekonomi payı | Aynısı ekonomi için. Nüfus payından farklı olabilir. |
| Arazi | Ova (savunma ×1.00) / Tepelik (×1.15) / Dağlık (×1.35) |
| İç çember | Parçanın içine sığan en büyük dairenin çapı (harita birimi). Rozet ölçüsü. |

Eğitim, sanayi ve moral için ayrı pay tutulmaz; bunlar **ekonomi payını** takip eder.

---

# MARMARA BÖLGESİ

## 10 BALIKESİR — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kuzey — Marmara Kıyısı | Susurluk, Manyas, Bandırma, Gönen, Erdek, Marmara | Ova | 0.30 | 0.33 | 24.6 |
| 2 | Batı — Ege Kıyısı | İvrindi, Havran, Burhaniye, Edremit, Ayvalık, Gömeç | Ova | 0.27 | 0.27 | 20.3 |
| 3 | Orta | Kepsut, Balya, Savaştepe, Altıeylül, Karesi | Tepelik | 0.28 | 0.28 | 20.2 |
| 4 | Doğu Dağlık | Bigadiç, Sındırgı, Dursunbey | Dağlık | 0.15 | 0.12 | 27.4 |

## 11 BİLECİK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bilecik | Bilecik (merkez), Gölpazarı, Söğüt, Bozüyük, Pazaryeri, Yenipazar, İnhisar, Osmaneli | Tepelik | 1.00 | 1.00 | 30.2 |

## 16 BURSA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bursa Ovası | Yıldırım, Gürsu, Nilüfer, Osmangazi, Kestel | Ova | 0.55 | 0.52 | 19.9 |
| 2 | Batı Ova | Mudanya, Mustafakemalpaşa, Karacabey | Ova | 0.13 | 0.13 | 24.4 |
| 3 | Doğu | Yenişehir, İznik, Orhangazi, İnegöl, Gemlik | Tepelik | 0.28 | 0.31 | 20.7 |
| 4 | Uludağ Güneyi | Keles, Büyükorhan, Harmancık, Orhaneli | Dağlık | 0.04 | 0.04 | 24.6 |

## 17 ÇANAKKALE — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Gelibolu Yarımadası | Gelibolu, Eceabat | Tepelik | 0.15 | 0.14 | 10.1 ⚠ |
| 2 | Biga-Çan | Çan, Biga, Lapseki, Yenice | Tepelik | 0.40 | 0.45 | 29.4 |
| 3 | Çanakkale ve Kaz Dağları | Çanakkale merkez, Bayramiç, Imbros, Ayvacik, Bozcaada, Ezine | Dağlık | 0.45 | 0.41 | 28.2 |

> ⚠ Gelibolu Yarımadası (10.1) — hedef iç çemberin (14.25) altında. aynı ilde kara komşusu yok (boğazın karşı yakası).

## 22 EDİRNE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Edirne ve Meriç | Uzunköprü, Meriç, Edirne merkez, Lalapaşa, Havsa, Süloğlu | Ova | 0.67 | 0.65 | 21.7 |
| 2 | Keşan-İpsala | Keşan, İpsala, Enez | Ova | 0.33 | 0.35 | 23.6 |

## 34 İSTANBUL — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Avrupa Yakası | Avcılar, Küçükçekmece, Silivri, Çatalca, Bakırköy, Eyüpsultan, Sarıyer, Başakşehir, Esenyurt, Sultangazi, Beyoğlu, Büyükçekmece, Güngören, Bağcılar, Arnavutköy, Bahçelievler, Beşiktaş, Kağıthane, Beylikdüzü, Gaziosmanpaşa, Zeytinburnu, Şişli, Bayrampaşa, Fatih, Esenler | Ova | 0.65 | 0.65 | 25.1 |
| 2 | Anadolu Yakası | Maltepe, Üsküdar, Ümraniye, Kartal, Tuzla, Pendik, Sancaktepe, Çekmeköy, Beykoz, Sultanbeyli, Ataşehir, Kadıköy, Prince Islands, Şile | Tepelik | 0.35 | 0.35 | 20.8 |

## 39 KIRKLARELİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ergene Ovası | Babaeski, Pehlivanköy, Lüleburgaz | Ova | 0.48 | 0.55 | 17.8 |
| 2 | Istranca | Pınarhisar, Demirköy, Vize, Kofçaz, Kırklareli merkez | Tepelik | 0.52 | 0.45 | 28.9 |

## 41 KOCAELİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Gebze Sanayi | Darıca, Gebze, Körfez, Çayırova, Dilovası | Tepelik | 0.45 | 0.52 | 13.0 ⚠ |
| 2 | İzmit | Karamürsel, Gölcük, Başiskele, Kartepe, Derince, Kandıra, İzmit | Ova | 0.55 | 0.48 | 19.9 |

> ⚠ Gebze Sanayi (13.0) — hedef iç çemberin (14.25) altında. Kocaeli 2 parça kalsın (Baki kararı).

## 54 SAKARYA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Adapazarı Ovası | Serdivan, Ferizli, Söğütlü, Erenler, Arifiye, Adapazarı | Ova | 0.50 | 0.50 | 14.3 |
| 2 | Kıyı ve Doğu | Karasu, Hendek, Akyazı, Karapürçek, Kaynarca, Kocaali | Tepelik | 0.29 | 0.28 | 17.8 |
| 3 | Sapanca-Geyve | Geyve, Taraklı, Sapanca, Pamukova | Tepelik | 0.21 | 0.22 | 19.0 |

## 59 TEKİRDAĞ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Çorlu-Çerkezköy Sanayi | Çorlu, Ergene, Çerkezköy, Saray, Kapaklı, Marmaraereğlisi | Ova | 0.53 | 0.62 | 20.4 |
| 2 | Süleymanpaşa Kıyı | Süleymanpaşa, Muratlı | Ova | 0.25 | 0.20 | 15.9 |
| 3 | Güney Trakya | Şarköy, Hayrabolu, Malkara | Tepelik | 0.22 | 0.18 | 18.6 |

## 77 YALOVA — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Yalova | Yalova merkez, Çınarcık, Altınova, Armutlu, Çiftlikköy, Termal | Tepelik | 1.00 | 1.00 | 8.6 ⚠ |

> ⚠ Yalova (8.6) — hedef iç çemberin (14.25) altında. tek parçalı il.

---

# EGE BÖLGESİ

## 03 AFYONKARAHİSAR — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Sandıklı-Dinar | Hocalar, Şuhut, Sandıklı, Kızılören, Dinar, Dazkırı, Evciler, Başmakçı | Tepelik | 0.30 | 0.27 | 24.6 |
| 2 | Bolvadin-Emirdağ | Bolvadin, Bayat, Emirdağ, Sultandağı, Çay | Ova | 0.25 | 0.25 | 33.3 |
| 3 | Afyon Ovası | İhsaniye, Sinanpaşa, İscehisar, Afyonkarahisar (Merkez İlçe), Çobanlar | Ova | 0.45 | 0.48 | 30.5 |

## 09 AYDIN — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Menderes Ovası | Sultanhisar, Yenipazar, Köşk, Buharkent, Nazilli, Efeler, Kuyucak, Germencik, İncirliova | Ova | 0.55 | 0.52 | 17.5 |
| 2 | Söke-Kuşadası | Koçarlı, Didim, Söke, Kuşadası | Ova | 0.35 | 0.40 | 19.5 |
| 3 | Çine Dağlık | Bozdoğan, Çine, Karacasu, Karpuzlu | Dağlık | 0.10 | 0.08 | 18.3 |

## 20 DENİZLİ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Denizli Ovası | Babadağ, Güney, Sarayköy, Merkezefendi, Buldan, Honaz, Pamukkale | Ova | 0.65 | 0.70 | 23.0 |
| 2 | Çivril-Çal | Çivril, Çal, Çardak, Bozkurt, Bekilli, Baklan | Ova | 0.15 | 0.14 | 22.0 |
| 3 | Güney Dağlık | Serinhisar, Kale, Acıpayam, Tavas, Çameli, Beyağaç | Dağlık | 0.20 | 0.16 | 37.0 |

## 35 İZMİR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kuzey Kıyı ve Aliağa | Kınık, Foça, Menemen, Aliağa, Dikili, Bergama | Tepelik | 0.16 | 0.21 | 27.0 |
| 2 | İzmir Metropol | Selçuk, Urla, Karaburun, Seferihisar, Menderes, Gaziemir, Torbalı, Karabağlar, Çiğli, Buca, Bornova, Karşıyaka, Ödemiş, Kemalpaşa, Beydağ, Kiraz, Konak, Balçova, Güzelbahçe, Bayındır, Bayraklı, Çeşme, Tire, Narlıdere | Ova | 0.84 | 0.79 | 33.8 |

## 43 KÜTAHYA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kütahya Ovası | Kütahya merkez, Altıntaş, Aslanapa, Çavdarhisar, Dumlupınar | Ova | 0.50 | 0.52 | 33.3 |
| 2 | Tavşanlı-Emet | Domaniç, Emet, Tavşanlı, Hisarcık | Tepelik | 0.25 | 0.28 | 27.5 |
| 3 | Simav-Gediz | Pazarlar, Simav, Gediz Merkez, Şaphane | Dağlık | 0.25 | 0.20 | 19.4 |

## 45 MANİSA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Gediz Ovası | Saruhanlı, Yunusemre, Şehzadeler, Alaşehir, Salihli, Ahmetli, Sarıgöl, Gölmarmara, Turgutlu | Ova | 0.65 | 0.68 | 23.9 |
| 2 | Akhisar-Soma | Akhisar, Kırkağaç, Soma | Tepelik | 0.24 | 0.23 | 27.7 |
| 3 | Doğu Dağlık | Kula, Selendi, Demirci, Gördes, Köprübaşı | Dağlık | 0.11 | 0.09 | 28.2 |

## 48 MUĞLA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Menteşe-Milas | Yatağan, Ula, Milas, Menteşe, Kavaklıdere, Bodrum | Tepelik | 0.50 | 0.54 | 29.7 |
| 2 | Marmaris-Datça | Köyceğiz, Marmaris, Datça | Dağlık | 0.15 | 0.16 | 16.7 |
| 3 | Fethiye | Seydikemer, Fethiye, Dalaman, Ortaca | Tepelik | 0.35 | 0.30 | 22.4 |

## 64 UŞAK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Uşak | Sivaslı, Banaz, Ulubey, Uşak merkez, Eşme, Karahallı | Tepelik | 1.00 | 1.00 | 32.1 |

---

# AKDENİZ BÖLGESİ

## 01 ADANA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Çukurova Kenti | Yüreğir, Sarıçam, Çukurova, Seyhan | Ova | 0.57 | 0.55 | 25.8 |
| 2 | Ceyhan Ovası | İmamoğlu, Karataş, Ceyhan, Yumurtalık | Ova | 0.20 | 0.22 | 17.4 |
| 3 | Adana Batı | Pozantı, Karaisalı, Aladağ | Tepelik | 0.14 | 0.15 | 29.3 |
| 4 | Adana Kuzey | Kozan, Feke, Saimbeyli, Tufanbeyli | Tepelik | 0.09 | 0.08 | 28.5 |

## 07 ANTALYA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Manavgat-Serik | İbradi, Manavgat, Akseki, Gündoğmuş, Serik | Ova | 0.26 | 0.25 | 37.3 |
| 2 | Batı Kıyı | Kemer, Korkuteli, Elmalı, Finike, Demre, Kaş, Kumluca | Dağlık | 0.13 | 0.13 | 38.0 |
| 3 | Alanya | Alanya, Gazipaşa | Tepelik | 0.16 | 0.17 | 20.6 |
| 4 | Antalya Ovası | Döşemealtı, Konyaaltı, Muratpaşa, Aksu, Kepez | Ova | 0.45 | 0.45 | 19.6 |

## 15 BURDUR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Burdur Ovası | Burdur (merkez), Bucak, Ağlasun, Çeltikçi | Ova | 0.60 | 0.62 | 28.0 |
| 2 | Gölhisar-Tefenni | Yeşilova, Tefenni, Çavdır, Karamanlı, Altınyayla, Gölhisar, Kemer | Tepelik | 0.40 | 0.38 | 20.5 |

## 31 HATAY — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Antakya ve Amik | Antakya, Kırıkhan, Yayladağı, Samandağ, Reyhanlı, Kumlu, Defne, Altınözü, Hassa | Ova | 0.58 | 0.49 | 24.4 |
| 2 | İskenderun Körfezi | Payas, Arsuz, İskenderun, Dörtyol, Erzin, Belen | Ova | 0.42 | 0.51 | 12.8 ⚠ |

> ⚠ İskenderun Körfezi (12.8) — hedef iç çemberin (14.25) altında. Hatay 2 parça kalsın (Baki kararı).

## 32 ISPARTA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Isparta Ovası | Senirkent, Isparta merkez, Gönen, Keçiborlu, Atabey, Uluborlu | Ova | 0.62 | 0.65 | 19.3 |
| 2 | Eğirdir-Yalvaç | Aksu, Yalvaç, Şarkîkaraağaç, Eğirdir, Sütçüler, Gelendost, Yenişarbademli | Dağlık | 0.38 | 0.35 | 35.6 |

## 33 MERSİN — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Mersin Kenti | Toroslar, Mezitli, Yenişehir, Akdeniz | Ova | 0.50 | 0.50 | 19.2 |
| 2 | Tarsus | Çamlıyayla, Tarsus | Ova | 0.20 | 0.20 | 20.0 |
| 3 | Erdemli-Silifke | Mut, Silifke, Erdemli | Tepelik | 0.21 | 0.21 | 42.5 |
| 4 | Anamur | Gülnar, Bozyazı, Anamur, Aydıncık | Dağlık | 0.09 | 0.09 | 25.2 |

## 46 KAHRAMANMARAŞ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Maraş Ovası | Onikişubat, Dulkadiroğlu, Pazarcık, Çağlayancerit, Türkoğlu | Ova | 0.68 | 0.71 | 36.9 |
| 2 | Elbistan-Afşin | Elbistan, Afşin, Nurhak, Ekinözü | Ova | 0.20 | 0.20 | 33.3 |
| 3 | Göksun-Andırın | Göksun, Andırın | Dağlık | 0.12 | 0.09 | 16.8 |

## 80 OSMANİYE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Osmaniye | Bahçe, Hasanbeyli, Osmaniye (merkez), Toprakkale | Ova | 0.55 | 0.60 | 15.6 |
| 2 | Kadirli-Düziçi | Düziçi, Kadirli, Sumbas | Tepelik | 0.45 | 0.40 | 17.5 |

---

# İÇ ANADOLU BÖLGESİ

## 06 ANKARA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ankara Batı | Haymana, Sincan, Yenimahalle, Etimesgut, Polatlı | Ova | 0.34 | 0.30 | 34.4 |
| 2 | Çankaya ve Güney | Şereflikoçhisar, Çankaya, Gölbaşı, Evren, Bala | Ova | 0.14 | 0.14 | 26.6 |
| 3 | Kuzeybatı | Ayaş, Beypazarı, Çamlıdere, Kızılcahamam, Kahramankazan, Güdül, Nallıhan | Dağlık | 0.08 | 0.09 | 30.2 |
| 4 | Ankara Kenti | Keçiören, Pursaklar, Altındağ, Elmadağ, Mamak, Çubuk, Akyurt, Kalecik | Ova | 0.44 | 0.47 | 32.0 |

## 18 ÇANKIRI — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Çankırı Merkez | Şabanözü, Çankırı merkez, Yapraklı, Eldivan, Korgun, Kızılırmak | Tepelik | 0.62 | 0.64 | 29.9 |
| 2 | Ilgaz-Çerkeş | Çerkeş, Ilgaz, Kurşunlu, Orta, Bayramören, Atkaracalar | Dağlık | 0.38 | 0.36 | 26.5 |

## 26 ESKİŞEHİR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Eskişehir Ovası | İnönü, Odunpazarı, Alpu, Tepebaşı, Mihalgazi, Sarıcakaya | Ova | 0.83 | 0.85 | 30.9 |
| 2 | Sivrihisar | Mahmudiye, Sivrihisar, Günyüzü, Han, Çifteler, Beylikova, Seyitgazi, Mihalıççık | Tepelik | 0.17 | 0.15 | 37.9 |

## 38 KAYSERİ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kayseri Kenti | Hacılar, Kocasinan, Melikgazi, İncesu, Talas | Ova | 0.75 | 0.78 | 29.0 |
| 2 | Develi-Yahyalı | Yahyalı, Develi, Yeşilhisar | Tepelik | 0.11 | 0.10 | 28.5 |
| 3 | Doğu Bozkır | Tomarza, Sarız, Felahiye, Özvatan, Akkışla, Sarıoğlan, Bünyan, Pınarbaşı | Dağlık | 0.14 | 0.12 | 42.5 |

## 40 KIRŞEHİR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kırşehir | Kırşehir merkez, Kaman, Mucur, Çiçekdağı, Boztepe, Akpınar, Akçakent | Ova | 1.00 | 1.00 | 41.2 |

## 42 KONYA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Konya Kenti | Karatay, Selçuklu, Meram | Ova | 0.60 | 0.60 | 31.1 |
| 2 | Kuzey Bozkır | Tuzlukçu, Cihanbeyli, Kadınhanı, Sarayönü, Altınekin, Yunak, Çeltik, Kulu, Akşehir, Ilgın, Derbent | Ova | 0.16 | 0.15 | 53.9 |
| 3 | Konya Güney | Doğanhisar, Hadim, Taşkent, Bozkır, Çumra, Beyşehir, Seydişehir, Ahırlı, Derebucak, Akören, Güneysınır, Hüyük, Yalıhüyük | Dağlık | 0.14 | 0.14 | 37.9 |
| 4 | Ereğli-Karapınar | Karapınar, Ereğli, Emirgazi, Halkapınar | Ova | 0.10 | 0.11 | 31.6 |

## 50 NEVŞEHİR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Nevşehir | Kozaklı, Ürgüp, Gülşehir, Hacıbektaş, Nevşehir merkez, Acıgöl, Derinkuyu, Avanos | Tepelik | 1.00 | 1.00 | 33.3 |

## 51 NİĞDE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Niğde Ovası | Çiftlik, Bor, Altunhisar, Niğde (merkez) | Ova | 0.85 | 0.87 | 32.3 |
| 2 | Bolkar Geçidi | Ulukisla, Çamardı | Dağlık | 0.15 | 0.13 | 20.8 |

## 58 SİVAS — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Sivas Ovası | Ulaş, Yıldızeli, Hafik, Sivas merkez | Ova | 0.58 | 0.60 | 50.3 |
| 2 | Şarkışla-Kangal | Gemerek, Gürün, Şarkışla, Altınyayla, Kangal | Tepelik | 0.16 | 0.15 | 29.8 |
| 3 | Zara-Divriği | Divriği, Zara, İmranlı | Dağlık | 0.12 | 0.13 | 34.0 |
| 4 | Suşehri | Koyulhisar, Suşehri, Akıncılar, Doğanşar, Gölova | Dağlık | 0.14 | 0.12 | 17.6 |

## 66 YOZGAT — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bozok Platosu | Şefaatli, Sarıkaya, Boğazlıyan, Yozgat merkez, Sorgun, Yerköy, Yenifakılı | Ova | 0.63 | 0.64 | 41.1 |
| 2 | Akdağ | Çandır, Çayıralan, Çekerek, Akdağmadeni, Saraykent, Kadışehri, Aydıncık | Dağlık | 0.37 | 0.36 | 24.9 |

## 68 AKSARAY — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Aksaray | Sarıyahşi, Aksaray merkez, Eskil, Ortaköy, Ağaçören, Gülağaç, Güzelyurt, Sultanhanı | Ova | 1.00 | 1.00 | 41.7 |

## 70 KARAMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Karaman Ovası | Ayrancı, Karaman merkez, Kazımkarabekir | Ova | 0.78 | 0.82 | 36.6 |
| 2 | Ermenek | Ermenek, Sarıveliler, Başyayla | Dağlık | 0.22 | 0.18 | 21.1 |

## 71 KIRIKKALE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kırıkkale | Çelebi, Karakeçeli, Delice, Balışeyh, Kırıkkale (merkez), Keskin, Sulakyurt, Yahşihan, Bahşılı | Tepelik | 1.00 | 1.00 | 31.3 |

---

# KARADENİZ BÖLGESİ

## 05 AMASYA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Amasya Ovası | Amasya merkez, Göynücek, Suluova, Taşova | Ova | 0.55 | 0.55 | 24.5 |
| 2 | Merzifon-Taşova | Merzifon, Gümüşhacıköy, Hamamözü | Tepelik | 0.45 | 0.45 | 20.5 |

## 08 ARTVİN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Çoruh Kıyı | Borçka, Artvin Merkez, Arhavi, Yusufeli, Murgul, Hopa, Kemalpaşa | Dağlık | 0.62 | 0.63 | 27.8 |
| 2 | Yusufeli-Şavşat | Şavşat, Ardanuç | Dağlık | 0.38 | 0.37 | 23.9 |

## 14 BOLU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bolu Ovası | Mengen, Dörtdivan, Gerede, Bolu Merkez, Yeniçağa | Ova | 0.72 | 0.75 | 31.4 |
| 2 | Güney Dağlık | Kıbrıscık, Mudurnu, Seben, Göynük | Dağlık | 0.28 | 0.25 | 21.5 |

## 19 ÇORUM — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Çorum Ovası | Sungurlu, Çorum merkez, Mecitözü, Alaca, Laçin, Uğurludağ, Boğazkale, Ortaköy | Ova | 0.78 | 0.80 | 40.6 |
| 2 | Kuzey | Dodurga, Oğuzlar, Kargı, Bayat, Osmancık, İskilip | Tepelik | 0.22 | 0.20 | 28.7 |

## 28 GİRESUN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Giresun Kıyı | Doğankent, Bulancak, Espiye, Giresun District, Görele, Dereli, Tirebolu, Güce, Keşap, Çanakçı, Piraziz, Yağlıdere, Eynesil | Dağlık | 0.80 | 0.82 | 28.2 |
| 2 | Şebinkarahisar | Şebinkarahisar, Alucra, Çamoluk | Dağlık | 0.20 | 0.18 | 25.5 |

## 29 GÜMÜŞHANE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Gümüşhane | Gümüşhane merkez, Kelkit, Torul, Şiran, Kürtün, Köse | Dağlık | 1.00 | 1.00 | 36.5 |

## 37 KASTAMONU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kastamonu Merkez | Daday, Devrekani, Hanönü, İhsangazi, Kastamonu merkez, Taşköprü, Araç, Tosya, Seydiler | Tepelik | 0.45 | 0.48 | 41.0 |
| 2 | Güney ve Kıyı | Azdavay, Pınarbaşı, Küre, Çatalzeytin, Doğanyurt, Bozkurt, Şenpazar, Ağlı, Abana, Cide, İnebolu | Dağlık | 0.55 | 0.52 | 27.2 |

## 52 ORDU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ordu Kıyı | İkizce, Akkuş, Ünye, Gürgentepe, Çamaş, Fatsa, Altınordu, Perşembe, Korgan, Kumru, Çatalpınar, Gülyalı, Çaybaşı, Kabataş | Tepelik | 0.82 | 0.82 | 26.0 |
| 2 | Güney Yayla | Mesudiye, Gölköy, Ulubey, Aybastı, Kabadüz | Dağlık | 0.18 | 0.18 | 19.8 |

## 53 RİZE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Rize Kıyı | Çamlıhemşin, Çayeli, İkizdere, Rize merkezi, Fındıklı, Pazar, Güneysu, Kalkandere, Ardeşen, İyidere, Derepazarı, Hemşin | Dağlık | 1.00 | 1.00 | 25.8 |

## 55 SAMSUN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bafra ve Çarşamba Ovaları | Çarşamba, Ayvacık, Salıpazarı, Terme | Ova | 0.35 | 0.32 | 21.2 |
| 2 | Samsun Kenti | Alaçam, Ladik, Vezirköprü, Atakum, 19 Mayıs, Tekkeköy, Yakakent, Bafra, Canik, Asarcık, Havza, Kavak, İlkadım | Tepelik | 0.65 | 0.68 | 41.9 |

## 57 SİNOP — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Sinop Kıyı | Erfelek, Dikmen, Ayancık, Gerze, Sinop merkez, Türkeli | Dağlık | 0.60 | 0.62 | 19.6 |
| 2 | Boyabat | Durağan, Boyabat, Saraydüzü | Tepelik | 0.40 | 0.38 | 24.6 |

## 60 TOKAT — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Erbaa-Niksar | Niksar, Almus, Başçiftlik, Erbaa, Reşadiye | Dağlık | 0.36 | 0.34 | 25.0 |
| 2 | Turhal-Zile | Turhal, Zile | Ova | 0.22 | 0.24 | 21.8 |
| 3 | Tokat Ovası | Tokat merkez, Sulusaray, Pazar, Artova, Yeşilyurt | Ova | 0.42 | 0.42 | 22.6 |

## 61 TRABZON — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Trabzon Kıyı | Maçka, Araklı, Ortahisar, Akçaabat, Şalpazarı, Sürmene, Tonya, Yomra, Düzköy, Vakfıkebir, Beşikdüzü, Çarşıbaşı, Arsin, Of | Tepelik | 0.72 | 0.75 | 25.1 |
| 2 | Güney Vadiler | Köprübaşı, Çaykara, Hayrat, Dernekpazarı | Dağlık | 0.28 | 0.25 | 15.1 |

## 67 ZONGULDAK — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ereğli Sanayi | Ereğli, Alaplı | Tepelik | 0.35 | 0.42 | 16.8 |
| 2 | Zonguldak Havzası | Kozlu, Devrek, Çaycuma, Zonguldak merkez, Kilimli, Gökçebey | Tepelik | 0.65 | 0.58 | 22.2 |

## 69 BAYBURT — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bayburt | Bayburt merkez, Demirözü, Aydıntepe | Dağlık | 1.00 | 1.00 | 29.6 |

## 74 BARTIN — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bartın | Ulus, Bartın merkez, Amasra, Kurucaşile | Tepelik | 1.00 | 1.00 | 22.1 |

## 78 KARABÜK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Karabük | Safranbolu, Merkez, Eskipazar, Eflani, Yenice, Ovacık | Tepelik | 1.00 | 1.00 | 27.4 |

## 81 DÜZCE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Düzce | Yığılca, Düzce merkez, Kaynaşlı, Çilimli, Gümüşova, Gölyaka, Cumayeri, Akçakoca | Tepelik | 1.00 | 1.00 | 26.1 |

---

# DOĞU ANADOLU BÖLGESİ

## 04 AĞRI — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ağrı Ovası | Hamur, Ağrı merkez, Patnos, Tutak, Eleşkirt | Tepelik | 0.68 | 0.68 | 38.4 |
| 2 | Doğubayazıt | Doğubayazıt, Taşlıçay, Diyadin | Dağlık | 0.32 | 0.32 | 32.0 |

## 12 BİNGÖL — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Bingöl | Bingöl merkez, Karlıova, Genç, Solhan, Adaklı, Kiğı, Yedisu, Yayladere | Dağlık | 1.00 | 1.00 | 44.0 |

## 13 BİTLİS — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Tatvan-Ahlat | Tatvan, Adilcevaz, Ahlat | Dağlık | 0.50 | 0.50 | 32.3 |
| 2 | Bitlis-Hizan | Mutki, Bitlis merkez, Hizan, Güroymak | Dağlık | 0.50 | 0.50 | 24.0 |

## 23 ELAZIĞ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Elazığ Ovası | Elazığ merkez, Baskil, Sivrice, Keban, Ağın | Ova | 0.72 | 0.75 | 34.4 |
| 2 | Doğu Dağlık | Karakoçan, Kovancılar, Maden, Palu, Arıcak, Alacakaya | Dağlık | 0.28 | 0.25 | 21.0 |

## 24 ERZİNCAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Erzincan Ovası | Tercan, Erzincan merkez, Çayırlı, Üzümlü, Otlukbeli | Ova | 0.75 | 0.77 | 29.1 |
| 2 | Batı Dağlık | Kemah, Refahiye, Kemaliye, Ilıç | Dağlık | 0.25 | 0.23 | 40.0 |

## 25 ERZURUM — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Hınıs-Tekman | Tekman, Karayazı, Çat, Hınıs, Karaçoban | Dağlık | 0.12 | 0.10 | 31.4 |
| 2 | Oltu-Tortum | Olur, Tortum, Şenkaya, Oltu, Uzundere | Dağlık | 0.12 | 0.12 | 30.8 |
| 3 | Erzurum Ovası | İspir, Aşkale, Aziziye, Yakutiye, Pazaryolu, Palandöken | Ova | 0.63 | 0.66 | 33.4 |
| 4 | Pasinler | Horasan, Pasinler, Narman, Köprüköy | Tepelik | 0.13 | 0.12 | 31.3 |

## 30 HAKKARİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Hakkari-Çukurca | Hakkari merkez, Çukurca | Dağlık | 0.42 | 0.45 | 28.6 |
| 2 | Yüksekova-Şemdinli | Derecik, Yüksekova, Şemdinli | Dağlık | 0.58 | 0.55 | 30.0 |

## 36 KARS — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kars Ovası | Susuz, Kars merkez, Selim, Akyaka, Arpaçay | Ova | 0.60 | 0.62 | 33.1 |
| 2 | Sarıkamış-Kağızman | Sarıkamış, Kağızman, Digor | Dağlık | 0.40 | 0.38 | 22.4 |

## 44 MALATYA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Malatya Ovası | Kale, Doğanyol, Battalgazi, Yeşilyurt, Darende, Doğanşehir, Akçadağ, Yazıhan, Pütürge | Ova | 0.86 | 0.87 | 29.3 |
| 2 | Kuzey-Doğu Dağlık | Arguvan, Arapgir, Hekimhan, Kuluncak | Dağlık | 0.14 | 0.13 | 26.9 |

## 49 MUŞ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Muş Ovası | Bulanık, Hasköy, Korkut, Malazgirt, Muş merkez | Ova | 0.85 | 0.86 | 29.8 |
| 2 | Varto | Varto | Dağlık | 0.15 | 0.14 | 17.4 |

## 62 TUNCELİ — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Tunceli | Hozat, Ovacık, Pülümür, Tunceli merkez, Çemişgezek, Pertek, Mazgirt, Nazımiye | Dağlık | 1.00 | 1.00 | 41.8 |

## 65 VAN — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Güney Dağlık | Çatak, Gevaş, Bahçesaray | Dağlık | 0.11 | 0.10 | 28.0 |
| 2 | Erciş-Muradiye | Muradiye, Erciş, Çaldıran | Tepelik | 0.25 | 0.23 | 25.7 |
| 3 | Özalp-Başkale | Başkale, Gürpınar, Özalp, Saray | Dağlık | 0.19 | 0.17 | 47.3 |
| 4 | Van Kenti | Tuşba, Edremit, İpekyolu | Ova | 0.45 | 0.50 | 30.9 |

## 75 ARDAHAN — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Ardahan | Çıldır, Hanak, Göle, Ardahan, Posof, Damal | Dağlık | 1.00 | 1.00 | 30.9 |

## 76 IĞDIR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Iğdır | Tuzluca, Iğdır (merkez), Karakoyunlu, Aralık | Ova | 1.00 | 1.00 | 21.0 |

---

# GÜNEYDOĞU ANADOLU BÖLGESİ

## 02 ADIYAMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Adıyaman Ovası | Gölbaşı, Adıyaman merkez, Besni, Tut, Samsat | Ova | 0.70 | 0.72 | 30.4 |
| 2 | Kâhta-Gerger | Kahta, Gerger, Sincik, Çelikhan | Dağlık | 0.30 | 0.28 | 20.4 |

## 21 DİYARBAKIR — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Diyarbakır Kenti | Sur, Kayapınar, Bağlar, Yenişehir | Ova | 0.58 | 0.60 | 19.9 |
| 2 | Dicle Ovası | Çınar, Bismil, Silvan, Hazro | Ova | 0.15 | 0.15 | 25.0 |
| 3 | Ergani-Çermik | Ergani, Çermik, Dicle, Eğil, Çüngüş | Tepelik | 0.15 | 0.14 | 24.3 |
| 4 | Kuzey Dağlık | Kulp, Lice, Hani, Kocaköy | Dağlık | 0.12 | 0.11 | 22.0 |

## 27 GAZİANTEP — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Gaziantep Kenti | Nizip, Araban, Yavuzeli, Şehitkamil, Şahinbey, Oğuzeli, Karkamış | Ova | 0.91 | 0.93 | 35.7 |
| 2 | İslahiye-Nurdağı | İslahiye, Nurdağı | Tepelik | 0.09 | 0.07 | 18.7 |

## 47 MARDİN — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Mardin Eşiği | Nusaybin, Savur, Artuklu, Ömerli, Yeşilli | Tepelik | 0.30 | 0.32 | 23.0 |
| 2 | Kızıltepe-Nusaybin | Derik, Kızıltepe, Mazıdağı | Ova | 0.47 | 0.46 | 26.3 |
| 3 | Midyat-Dargeçit | Midyat, Dargeçit | Tepelik | 0.23 | 0.22 | 15.7 |

## 56 SİİRT — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Siirt Merkez | Tillo, Kurtalan, Siirt (merkez) | Tepelik | 0.65 | 0.68 | 15.1 |
| 2 | Doğu Dağlık | Baykan, Pervari, Eruh, Şirvan | Dağlık | 0.35 | 0.32 | 21.0 |

## 63 ŞANLIURFA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Urfa Kenti | Karaköprü, Haliliye, Eyyübiye | Ova | 0.50 | 0.52 | 28.4 |
| 2 | Harran ve Fırat | Akçakale, Suruç, Harran, Bozova, Birecik, Halfeti | Ova | 0.20 | 0.20 | 27.5 |
| 3 | Siverek-Hilvan | Siverek, Hilvan | Tepelik | 0.15 | 0.13 | 34.2 |
| 4 | Viranşehir-Ceylanpınar | Viranşehir, Ceylanpınar | Ova | 0.15 | 0.15 | 30.1 |

## 72 BATMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Batman Ovası | Gercüş, Beşiri, Batman Merkez, Hasankeyf | Ova | 0.75 | 0.80 | 26.4 |
| 2 | Kozluk-Sason | Kozluk, Sason | Dağlık | 0.25 | 0.20 | 21.6 |

## 73 ŞIRNAK — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Cizre-Silopi | İdil, Silopi, Cizre | Ova | 0.60 | 0.65 | 17.0 |
| 2 | Şırnak Dağlık | Şırnak merkez, Beytüşşebap, Güçlükonak, Uludere | Dağlık | 0.40 | 0.35 | 25.2 |

## 79 KİLİS — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |
|---|---|---|---|---|---|---|
| 1 | Kilis | Elbeyli, Polateli, Kilis (merkez), Musabeyli | Ova | 1.00 | 1.00 | 13.6 ⚠ |

> ⚠ Kilis (13.6) — hedef iç çemberin (14.25) altında. tek parçalı il.

---

# ÖZET

## Bölgelere göre dağılım

| Bölge | İl | Parça |
|---|---|---|
| Marmara | 11 | 27 |
| Ege | 8 | 21 |
| Akdeniz | 8 | 23 |
| İç Anadolu | 13 | 29 |
| Karadeniz | 18 | 31 |
| Doğu Anadolu | 14 | 28 |
| Güneydoğu Anadolu | 9 | 22 |
| **Toplam** | **81** | **181** |

## Parça sayısı dağılımı

| Parça | İl sayısı |
|---|---|
| 1 | 18 |
| 2 | 38 |
| 3 | 13 |
| 4 | 12 |

**4 parçalı iller:** Adana, Ankara, Antalya, Balıkesir, Bursa, Diyarbakır, Erzurum, Mersin, Konya, Sivas, Şanlıurfa, Van.

**1 parçalık iller:** Bilecik, Bingöl, Gümüşhane, Kırşehir, Nevşehir, Rize, Tunceli, Uşak, Aksaray, Bayburt, Kırıkkale, Bartın, Ardahan, Iğdır, Yalova, Karabük, Kilis, Düzce.

## Arazi dağılımı

| Arazi | Parça | Oran |
|---|---|---|
| Ova | 73 | %40 |
| Tepelik | 52 | %29 |
| Dağlık | 56 | %31 |

## Okunabilirlik

Hedef iç çemberin (14.25) altında kalan parça: **5** / 181. Hepsi bilinçli istisna:

| Parça | İl | İç çember | Sebep |
|---|---|---|---|
| Yalova | Yalova | 8.6 | tek parçalı il |
| Gelibolu Yarımadası | Çanakkale | 10.1 | aynı ilde kara komşusu yok (boğazın karşı yakası) |
| İskenderun Körfezi | Hatay | 12.8 | Hatay 2 parça kalsın (Baki kararı) |
| Gebze Sanayi | Kocaeli | 13.0 | Kocaeli 2 parça kalsın (Baki kararı) |
| Kilis | Kilis | 13.6 | tek parçalı il |

Ölçümün tamamı: `veri/parca-olcum.md`. Görsel testi: `onizleme/rozet-testi.html`.
