# (ESKİ) İL SAVAŞI — 81 İL PARÇA BÖLÜMLEMESİ (v2)

> ⚠ **BU BELGE ARTIK GEÇERLİ DEĞİL — tarihsel kayıt olarak duruyor.**
> Güncel bölümleme: **`docs/il-savasi-parca-bolumleme-v3.md`** (181 parça, veriden üretilir).
>
> v2, parçaları **coğrafi kontrasta** göre açıyordu ("bir ilin dağlık ve düz kesimi
> ayrışıyorsa böl"). 2026-07-26'da Baki bu kuralı değiştirdi: parçalar artık **haritada
> nasıl göründüklerine ve ordu rozetinin okunabilirliğine** göre çiziliyor, parça sayısı
> 1–4 ile sınırlı. Gerekçeler `veri/URETIM-NOTU.md`'de.
>
> Buradaki tablolar 195 → 185 parçalık döneme aittir; **veriyle uyuşmazlar.**

> Oyun haritasının alt bölge (parça) tablosu. Toplam **185 parça**.
> Bu belge `il-savasi-tasarim.md` §7'nin veri katmanıdır.
>
> **Not (2026-07-26):** Tasarım aşamasında 195 parça hedeflendi; üretimde birleştirmelerle **185**'e indi — Rize 2→1 (Kaçkar Vadileri → Rize Kıyı), Muğla 4→3 (Bodrum → Menteşe-Milas), İstanbul 3→2 (Suriçi ve Galata → Avrupa Yakası). Gerekçeler `veri/URETIM-NOTU.md`'de. Bu belge artık üretilen veriyle (185) aynı sayıyı söyler. **Görev 03B (2026-07-26):** ordu rozeti sığmayan 7 parça daha birleştirildi (Hatay, Kocaeli, Ordu, İzmir ×2, Samsun, Kastamonu); ölçüm ve gerekçeler `veri/parca-olcum.md` ve `veri/URETIM-NOTU.md`'de.
>
> **Kimlik kuralı:** Parça kimlikleri sabit tutulur; birleşen parçanın numarası yeniden kullanılmaz. Bu yüzden numaralarda boşluk olabilir (Muğla'da 2, İstanbul'da 1 yok).

---

## v1'DEN FARKLAR

**1. Merkez parçası mantığı kaldırıldı.** Artık ★ işareti, "il merkezi parçası" kavramı ve merkezi tutmaya bağlı stat kuralı yok.

**Yerine geçen kural:** İlin **beş statı da** (nüfus, ekonomi, eğitim, sanayi, moral) elde tutulan parçaların **pay toplamıyla orantılı** çalışır. 0.40 pay tutuyorsan o ilin sanayisinin de %40'ını alırsın. Tek kural, istisnasız.

Bu, tasarımı iki yerden sadeleştiriyor: parça başına "merkez mi değil mi" bayrağı tutmaya gerek kalmıyor, ve yarı fethedilmiş ilin ne ürettiği tek bir çarpmayla hesaplanıyor.

**2. Bölümleme seyreltildi.** 250 → **195** → üretimde **185 parça**. v1'de her il gereksiz yere ufalanmıştı. Yeni kural: **parça, ancak gerçek bir arazi veya ekonomi kontrastı varsa açılır.** Bir ilin dağlık ve düz kesimi belirgin biçimde ayrışmıyorsa o il bölünmez.

**3. İstanbul yeniden kurgulandı** — 6 parçadan 3'e (tarihsel mantıkla), Görev 03B'de rozet sığsın diye **2'ye** indi.

**4. Adalar ayrı parça değil.** Bozcaada, Gökçeada, Marmara Adası, Avşa gibi adalar bağlı oldukları kara parçasının içindedir. Kara parçası alınınca adalar da geçer. Deniz aşırı ayrı parça yok.

### Parça sayısı dağılımı

| Parça | İl sayısı |
|---|---|
| 1 | 18 |
| 2 | 38 |
| 3 | 13 |
| 4 | 8 |
| 5 | 4 |

**5 parçalık iller:** Ankara, Konya, Antalya, Erzurum. Hepsi hem çok geniş hem de birden fazla ayrı coğrafi havzaya sahip.

**1 parçalık iller:** Yalova, Bilecik, Uşak, Aksaray, Nevşehir, Kırşehir, Kırıkkale, Karabük, Bartın, Düzce, Gümüşhane, Bayburt, Bingöl, Tunceli, Ardahan, Iğdır, Kilis, Rize. Bunlar ya küçük ya da baştan sona tek arazi karakterinde.

### Tablo okuma

| Sütun | Anlamı |
|---|---|
| Nüfus payı | Parçanın, ilin toplam nüfusundan aldığı oran. İl içinde toplam 1.00. |
| Ekonomi payı | Aynısı ekonomi için. Nüfus payından farklı olabilir — sanayi parçası az insan, çok üretim taşır. |
| Arazi | Ova (savunma ×1.00) / Tepelik (×1.15) / Dağlık (×1.35) |

Eğitim, sanayi ve moral için ayrı pay tutulmuyor; bunlar **ekonomi payını** takip eder.

---

# MARMARA BÖLGESİ

## 34 İSTANBUL — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 2 | Avrupa Yakası | Fatih, Eyüpsultan, Zeytinburnu, Beyoğlu, Beşiktaş, Bağcılar, Bahçelievler, Güngören, Esenler, Sultangazi, Gaziosmanpaşa, Bayrampaşa, Şişli, Kağıthane, Küçükçekmece, Avcılar, Beylikdüzü, Esenyurt, Başakşehir, Silivri, Çatalca, Büyükçekmece, Arnavutköy | Ova | 0.65 | 0.65 |
| 3 | Anadolu Yakası | Kadıköy, Üsküdar, Ataşehir, Ümraniye, Maltepe, Beykoz, Kartal, Pendik, Tuzla, Sancaktepe, Sultanbeyli, Çekmeköy, Şile | Tepelik | 0.35 | 0.35 |

> **Birleştirme (2026-07-26, Görev 03B):** Eski 1. parça **Suriçi ve Galata** (Fatih, Eyüpsultan, Zeytinburnu, Beyoğlu, Beşiktaş — Tepelik, 0.09/0.18), 2. parça Avrupa Yakası'na katıldı; paylar eklendi (0.09+0.56 = 0.65 nüfus, 0.18+0.47 = 0.65 ekonomi), arazi ağırlıklı baskın kuralla **Ova** kaldı. Gerekçe: parça coğrafi olarak çok küçüktü, Görev 04'te gelecek **ordu rozetini taşıyamıyordu**. Silinen parçanın tasarım metni `veri/URETIM-NOTU.md`'de arşivlendi — kayıp: tarihsel lezzet öğesi; kazanç: oynanabilirlik. Baki'nin bilinçli tercihi.

## 16 BURSA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bursa Ovası | Osmangazi, Yıldırım, Nilüfer, Kestel, Gürsu | Ova | 0.55 | 0.52 |
| 2 | Batı Ova | Mudanya, Karacabey, Mustafakemalpaşa | Ova | 0.13 | 0.13 |
| 3 | Doğu | Gemlik, Orhangazi, İznik, İnegöl, Yenişehir | Tepelik | 0.28 | 0.31 |
| 4 | Uludağ Güneyi | Orhaneli, Keles, Büyükorhan, Harmancık | Dağlık | 0.04 | 0.04 |

## 10 BALIKESİR — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kuzey — Marmara Kıyısı | Bandırma, Erdek, Marmara, Gönen, Manyas, Susurluk | Ova | 0.30 | 0.33 |
| 2 | Batı — Ege Kıyısı | Edremit, Ayvalık, Burhaniye, Havran, Gömeç, İvrindi | Ova | 0.27 | 0.27 |
| 3 | Orta | Karesi, Altıeylül, Kepsut, Savaştepe, Balya | Tepelik | 0.28 | 0.28 |
| 4 | Doğu Dağlık | Dursunbey, Sındırgı, Bigadiç | Dağlık | 0.15 | 0.12 |

> Marmara, Avşa ve Ekinlik adaları 1. parçanın içindedir.

## 41 KOCAELİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Gebze Sanayi | Gebze, Darıca, Çayırova, Dilovası, Körfez | Tepelik | 0.45 | 0.52 |
| 2 | İzmit | İzmit, Derince, Kandıra, Gölcük, Başiskele, Kartepe, Karamürsel | Ova | 0.55 | 0.48 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 3. parça **Güney Kıyı** (körfezin güney yakası, 0.24/0.20), 2. parça İzmit'e katıldı. **Kocaeli 1 parçaya indirilmedi** — Baki'nin kararı: batıdaki sanayi kuşağı (Gebze) ile İzmit ayrı kalsın. Gebze'nin iç çemberi 13.0 birim, eşiğin (14.25) hemen altında; bilinçli istisna. Not: Gebze ile Güney Kıyı arasında **kara bağlantısı yok** (körfez ayırıyor), Güney Kıyı yalnızca İzmit'e katılabilirdi.

## 59 TEKİRDAĞ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Çorlu-Çerkezköy Sanayi | Çorlu, Ergene, Çerkezköy, Kapaklı, Saray | Ova | 0.53 | 0.62 |
| 2 | Süleymanpaşa Kıyı | Süleymanpaşa, Muratlı, Marmaraereğlisi | Ova | 0.25 | 0.20 |
| 3 | Güney Trakya | Malkara, Hayrabolu, Şarköy | Tepelik | 0.22 | 0.18 |

## 17 ÇANAKKALE — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Gelibolu Yarımadası | Gelibolu, Eceabat | Tepelik | 0.15 | 0.14 |
| 2 | Biga-Çan | Biga, Çan, Yenice, Lapseki | Tepelik | 0.40 | 0.45 |
| 3 | Çanakkale ve Kaz Dağları | Merkez, Ezine, Ayvacık, Bayramiç, Bozcaada, Gökçeada | Dağlık | 0.45 | 0.41 |

> 1. parça boğazın Avrupa yakasında; kara bağlantısı yalnızca Tekirdağ ve Edirne iledir. Bozcaada ve Gökçeada 3. parçanın içindedir.

## 54 SAKARYA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Adapazarı Ovası | Adapazarı, Serdivan, Erenler, Arifiye, Söğütlü, Ferizli | Ova | 0.50 | 0.50 |
| 2 | Kıyı ve Doğu | Karasu, Kocaali, Kaynarca, Hendek, Akyazı, Karapürçek | Tepelik | 0.29 | 0.28 |
| 3 | Sapanca-Geyve | Sapanca, Geyve, Pamukova, Taraklı | Tepelik | 0.21 | 0.22 |

## 22 EDİRNE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Edirne ve Meriç | Merkez, Havsa, Lalapaşa, Süloğlu, Uzunköprü, Meriç | Ova | 0.67 | 0.65 |
| 2 | Keşan-İpsala | Keşan, Enez, İpsala | Ova | 0.33 | 0.35 |

## 39 KIRKLARELİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ergene Ovası | Lüleburgaz, Babaeski, Pehlivanköy | Ova | 0.48 | 0.55 |
| 2 | Istranca | Merkez, Kofçaz, Pınarhisar, Vize, Demirköy | Tepelik | 0.52 | 0.45 |

## 11 BİLECİK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bilecik | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

## 77 YALOVA — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Yalova | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

---

# EGE BÖLGESİ

## 35 İZMİR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 2 | Kuzey Kıyı ve Aliağa | Bergama, Dikili, Kınık, Aliağa, Foça, Menemen | Tepelik | 0.16 | 0.21 |
| 4 | İzmir Metropol | Konak, Bornova, Buca, Karşıyaka, Bayraklı, Çiğli, Karabağlar, Gaziemir, Balçova, Narlıdere, Güzelbahçe, Çeşme, Urla, Karaburun, Seferihisar, Menderes, Torbalı, Selçuk, Kemalpaşa, Bayındır, Ödemiş, Tire, Kiraz, Beydağ | Ova | 0.84 | 0.79 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 1. parça **İzmir Metropol** (0.60/0.55) ve 3. parça **Çeşme Yarımadası** (0.06/0.07), 4. parça Küçük Menderes'e katıldı. Kent dokusu coğrafi olarak çok küçüktü (iç çember 11.1 birim), rozet sığmıyordu. Birleşen parçanın adı **ekonomik olarak baskın parçadan** alındı: "Küçük Menderes" değil **İzmir Metropol** (Baki'nin kuralı: birleştirirken ekonomi ve nüfusa dikkat).

## 48 MUĞLA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Menteşe-Milas | Menteşe, Ula, Kavaklıdere, Milas, Yatağan, Bodrum | Tepelik | 0.50 | 0.54 |
| 3 | Marmaris-Datça | Marmaris, Datça, Köyceğiz | Dağlık | 0.15 | 0.16 |
| 4 | Fethiye | Fethiye, Seydikemer, Ortaca, Dalaman | Tepelik | 0.35 | 0.30 |

> **Birleştirme (2026-07-24):** Eski 2. parça **Bodrum** (tek ilçe, Tepelik), 1. parça Menteşe-Milas'a katıldı; payları eklendi (0.30+0.20=0.50 nüfus, 0.30+0.24=0.54 ekonomi). Gerekçe: Bodrum ile Menteşe-Milas aynı arazi tipinde (Tepelik) — belgenin kendi kuralı gereği ("parça ancak gerçek arazi/ekonomi kontrastı varsa açılır") Bodrum ayrı parça olmayı hak etmiyordu.

## 45 MANİSA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Gediz Ovası | Şehzadeler, Yunusemre, Saruhanlı, Turgutlu, Ahmetli, Salihli, Alaşehir, Sarıgöl, Gölmarmara | Ova | 0.65 | 0.68 |
| 2 | Akhisar-Soma | Akhisar, Kırkağaç, Soma | Tepelik | 0.24 | 0.23 |
| 3 | Doğu Dağlık | Demirci, Gördes, Kula, Selendi, Köprübaşı | Dağlık | 0.11 | 0.09 |

## 09 AYDIN — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Menderes Ovası | Efeler, İncirliova, Köşk, Germencik, Nazilli, Sultanhisar, Kuyucak, Buharkent, Yenipazar | Ova | 0.55 | 0.52 |
| 2 | Söke-Kuşadası | Söke, Kuşadası, Didim, Koçarlı | Ova | 0.35 | 0.40 |
| 3 | Çine Dağlık | Çine, Karacasu, Karpuzlu, Bozdoğan | Dağlık | 0.10 | 0.08 |

## 20 DENİZLİ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Denizli Ovası | Merkezefendi, Pamukkale, Honaz, Sarayköy, Buldan, Babadağ, Güney | Ova | 0.65 | 0.70 |
| 2 | Çivril-Çal | Çivril, Çal, Bekilli, Baklan, Bozkurt, Çardak | Ova | 0.15 | 0.14 |
| 3 | Güney Dağlık | Acıpayam, Tavas, Kale, Çameli, Serinhisar, Beyağaç | Dağlık | 0.20 | 0.16 |

## 43 KÜTAHYA — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kütahya Ovası | Merkez, Altıntaş, Aslanapa, Çavdarhisar, Dumlupınar | Ova | 0.50 | 0.52 |
| 2 | Tavşanlı-Emet | Tavşanlı, Emet, Domaniç, Hisarcık | Tepelik | 0.25 | 0.28 |
| 3 | Simav-Gediz | Simav, Gediz, Şaphane, Pazarlar | Dağlık | 0.25 | 0.20 |

## 03 AFYONKARAHİSAR — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Afyon Ovası | Merkez, İscehisar, Çobanlar, Sinanpaşa, İhsaniye | Ova | 0.45 | 0.48 |
| 2 | Bolvadin-Emirdağ | Bolvadin, Çay, Sultandağı, Bayat, Emirdağ | Ova | 0.25 | 0.25 |
| 3 | Sandıklı-Dinar | Sandıklı, Şuhut, Hocalar, Kızılören, Dinar, Dazkırı, Başmakçı, Evciler | Tepelik | 0.30 | 0.27 |

## 64 UŞAK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Uşak | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

---

# AKDENİZ BÖLGESİ

## 07 ANTALYA — 5 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Antalya Ovası | Muratpaşa, Kepez, Konyaaltı, Döşemealtı, Aksu | Ova | 0.45 | 0.45 |
| 2 | Alanya | Alanya, Gazipaşa | Tepelik | 0.16 | 0.17 |
| 3 | Manavgat-Serik | Manavgat, Serik | Ova | 0.16 | 0.17 |
| 4 | Batı Kıyı | Kemer, Kumluca, Finike, Demre, Kaş | Dağlık | 0.13 | 0.13 |
| 5 | Toros İçi | Korkuteli, Elmalı, Akseki, İbradı, Gündoğmuş | Dağlık | 0.10 | 0.08 |

## 33 MERSİN — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Mersin Kenti | Akdeniz, Toroslar, Yenişehir, Mezitli | Ova | 0.50 | 0.50 |
| 2 | Tarsus | Tarsus, Çamlıyayla | Ova | 0.20 | 0.20 |
| 3 | Erdemli-Silifke | Erdemli, Silifke, Mut | Tepelik | 0.21 | 0.21 |
| 4 | Anamur | Anamur, Bozyazı, Aydıncık, Gülnar | Dağlık | 0.09 | 0.09 |

## 01 ADANA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Çukurova Kenti | Seyhan, Yüreğir, Çukurova, Sarıçam | Ova | 0.58 | 0.55 |
| 2 | Ceyhan Ovası | Ceyhan, İmamoğlu, Karataş, Yumurtalık | Ova | 0.20 | 0.22 |
| 3 | Kozan-Pozantı | Kozan, Aladağ, Karaisalı, Pozantı | Tepelik | 0.18 | 0.20 |
| 4 | Kuzey Toros | Feke, Saimbeyli, Tufanbeyli | Dağlık | 0.04 | 0.03 |

## 31 HATAY — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Antakya ve Amik | Antakya, Defne, Samandağ, Altınözü, Yayladağı, Kırıkhan, Reyhanlı, Kumlu, Hassa | Ova | 0.58 | 0.49 |
| 2 | İskenderun Körfezi | İskenderun, Arsuz, Belen, Payas, Dörtyol, Erzin | Ova | 0.42 | 0.51 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 3. parça **Dörtyol-Erzin** (0.12/0.13), 2. parça İskenderun Sanayi'ye katıldı; birleşen parça körfezin tamamını kapsadığı için adı **İskenderun Körfezi** oldu. Gerekçe: iki parça da tek başına ordu rozetini taşıyamıyordu. **Hatay 1 parçaya indirilmedi** — Baki'nin kararı: Amik/Antakya ovası ile körfez ayrı kalsın.

## 46 KAHRAMANMARAŞ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Maraş Ovası | Onikişubat, Dulkadiroğlu, Türkoğlu, Pazarcık, Çağlayancerit | Ova | 0.68 | 0.71 |
| 2 | Elbistan-Afşin | Elbistan, Afşin, Ekinözü, Nurhak | Ova | 0.20 | 0.20 |
| 3 | Göksun-Andırın | Göksun, Andırın | Dağlık | 0.12 | 0.09 |

## 32 ISPARTA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Isparta Ovası | Merkez, Atabey, Gönen, Keçiborlu, Senirkent, Uluborlu | Ova | 0.62 | 0.65 |
| 2 | Eğirdir-Yalvaç | Eğirdir, Sütçüler, Aksu, Yalvaç, Şarkikaraağaç, Gelendost, Yenişarbademli | Dağlık | 0.38 | 0.35 |

## 15 BURDUR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Burdur Ovası | Merkez, Ağlasun, Çeltikçi, Bucak | Ova | 0.60 | 0.62 |
| 2 | Gölhisar-Tefenni | Gölhisar, Yeşilova, Tefenni, Karamanlı, Çavdır, Altınyayla, Kemer | Tepelik | 0.40 | 0.38 |

## 80 OSMANİYE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Osmaniye | Merkez, Toprakkale, Bahçe, Hasanbeyli | Ova | 0.55 | 0.60 |
| 2 | Kadirli-Düziçi | Kadirli, Düziçi, Sumbas | Tepelik | 0.45 | 0.40 |

---

# İÇ ANADOLU BÖLGESİ

## 06 ANKARA — 5 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ankara Doğu | Çankaya, Altındağ, Keçiören, Mamak, Pursaklar, Gölbaşı | Ova | 0.48 | 0.50 |
| 2 | Ankara Batı | Yenimahalle, Etimesgut, Sincan | Ova | 0.32 | 0.28 |
| 3 | Kuzeybatı | Nallıhan, Beypazarı, Ayaş, Güdül, Kahramankazan, Çamlıdere, Kızılcahamam | Dağlık | 0.08 | 0.09 |
| 4 | Kuzeydoğu | Çubuk, Akyurt, Kalecik, Elmadağ | Tepelik | 0.06 | 0.07 |
| 5 | Güney Bozkır | Polatlı, Haymana, Bala, Şereflikoçhisar, Evren | Ova | 0.06 | 0.06 |

> Metropol ikiye bölündü çünkü tek parça olsaydı payı 0.80 çıkardı ve ilin kalan dört parçası anlamsızlaşırdı.

## 42 KONYA — 5 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Konya Kenti | Selçuklu, Meram, Karatay | Ova | 0.60 | 0.60 |
| 2 | Ereğli-Karapınar | Ereğli, Karapınar, Halkapınar, Emirgazi | Ova | 0.10 | 0.11 |
| 3 | Beyşehir-Seydişehir | Beyşehir, Seydişehir, Derebucak, Hüyük, Yalıhüyük, Doğanhisar | Dağlık | 0.08 | 0.08 |
| 4 | Kuzey Bozkır | Akşehir, Ilgın, Derbent, Tuzlukçu, Cihanbeyli, Kulu, Yunak, Sarayönü, Altınekin, Kadınhanı, Çeltik | Ova | 0.16 | 0.15 |
| 5 | Güney Toros | Çumra, Bozkır, Hadim, Taşkent, Ahırlı, Akören, Güneysınır | Dağlık | 0.06 | 0.06 |

## 58 SİVAS — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Sivas Ovası | Merkez, Yıldızeli, Ulaş, Hafik | Ova | 0.58 | 0.60 |
| 2 | Şarkışla-Kangal | Şarkışla, Gemerek, Altınyayla, Kangal | Tepelik | 0.16 | 0.15 |
| 3 | Zara-Divriği | Zara, Divriği, İmranlı | Dağlık | 0.12 | 0.13 |
| 4 | Suşehri | Suşehri, Koyulhisar, Gölova, Akıncılar, Doğanşar | Dağlık | 0.14 | 0.12 |

## 38 KAYSERİ — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kayseri Kenti | Melikgazi, Kocasinan, Talas, Hacılar, İncesu | Ova | 0.75 | 0.78 |
| 2 | Develi-Yahyalı | Develi, Yahyalı, Yeşilhisar | Tepelik | 0.11 | 0.10 |
| 3 | Doğu Bozkır | Bünyan, Pınarbaşı, Sarız, Tomarza, Akkışla, Sarıoğlan, Felahiye, Özvatan | Dağlık | 0.14 | 0.12 |

## 26 ESKİŞEHİR — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Eskişehir Ovası | Odunpazarı, Tepebaşı, İnönü, Alpu, Mihalgazi, Sarıcakaya | Ova | 0.83 | 0.85 |
| 2 | Sivrihisar | Sivrihisar, Çifteler, Mahmudiye, Beylikova, Günyüzü, Han, Seyitgazi, Mihalıççık | Tepelik | 0.17 | 0.15 |

## 66 YOZGAT — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bozok Platosu | Merkez, Yerköy, Şefaatli, Sorgun, Boğazlıyan, Sarıkaya, Yenifakılı | Ova | 0.63 | 0.64 |
| 2 | Akdağ | Akdağmadeni, Saraykent, Kadışehri, Çekerek, Aydıncık, Çayıralan, Çandır | Dağlık | 0.37 | 0.36 |

## 18 ÇANKIRI — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Çankırı Merkez | Merkez, Eldivan, Korgun, Şabanözü, Kızılırmak, Yapraklı, Atkaracalar | Tepelik | 0.62 | 0.64 |
| 2 | Ilgaz-Çerkeş | Ilgaz, Çerkeş, Kurşunlu, Orta, Bayramören | Dağlık | 0.38 | 0.36 |

## 70 KARAMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Karaman Ovası | Merkez, Ayrancı, Kazımkarabekir | Ova | 0.78 | 0.82 |
| 2 | Ermenek | Ermenek, Başyayla, Sarıveliler | Dağlık | 0.22 | 0.18 |

## 51 NİĞDE — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Niğde Ovası | Merkez, Altunhisar, Çiftlik, Bor | Ova | 0.85 | 0.87 |
| 2 | Bolkar Geçidi | Ulukışla, Çamardı | Dağlık | 0.15 | 0.13 |

## 68 AKSARAY — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Aksaray | Tüm ilçeler | Ova | 1.00 | 1.00 |

## 50 NEVŞEHİR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Nevşehir | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

## 40 KIRŞEHİR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kırşehir | Tüm ilçeler | Ova | 1.00 | 1.00 |

## 71 KIRIKKALE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kırıkkale | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

---

# KARADENİZ BÖLGESİ

## 52 ORDU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ordu Kıyı | Altınordu, Gülyalı, Perşembe, Ünye, Fatsa, Çaybaşı, İkizce, Akkuş, Kumru, Korgan, Kabataş, Gürgentepe, Çatalpınar, Çamaş | Tepelik | 0.82 | 0.82 |
| 3 | Güney Yayla | Aybastı, Gölköy, Mesudiye, Ulubey, Kabadüz | Dağlık | 0.18 | 0.18 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 2. parça **Batı İç** (0.17/0.15), 1. parça Ordu Kıyı'ya katıldı. Kalan ayrım Baki'nin tarif ettiği gibi: **kıyı şeridi ile güneydeki yayla**.

## 55 SAMSUN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 2 | Bafra ve Çarşamba Ovaları | Bafra, Alaçam, Yakakent, Çarşamba, Terme, Salıpazarı, Ayvacık | Ova | 0.35 | 0.32 |
| 3 | Samsun Kenti | İlkadım, Atakum, Canik, Tekkeköy, 19 Mayıs, Vezirköprü, Havza, Ladik, Kavak, Asarcık | Tepelik | 0.65 | 0.68 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 1. parça **Samsun Kenti** (0.52/0.57), 3. parça İç Kesim'e katıldı; ad ekonomik olarak baskın parçadan devralındı (**Samsun Kenti**). Arazi ağırlıklı baskın kuralla **Tepelik** oldu.

## 37 KASTAMONU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kastamonu Merkez | Merkez, Taşköprü, Daday, Hanönü, Devrekani, Seydiler, İhsangazi | Tepelik | 0.45 | 0.48 |
| 2 | Güney ve Kıyı | İnebolu, Cide, Bozkurt, Abana, Çatalzeytin, Doğanyurt, Şenpazar, Küre, Tosya, Araç, Azdavay, Pınarbaşı, Ağlı | Dağlık | 0.55 | 0.52 |

> **Birleştirme (2026-07-26, Görev 03B / Adım 5):** Eski 3. parça **Güney** (0.30/0.30), 2. parça Kıyı Şeridi'ne katıldı; birleşen parça hem güneyi hem kıyıyı kapsadığı için adı **Güney ve Kıyı** oldu. İkisi de Dağlık, arazi değişmedi.

## 60 TOKAT — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Tokat Ovası | Merkez, Pazar, Artova, Yeşilyurt, Sulusaray | Ova | 0.42 | 0.42 |
| 2 | Turhal-Zile | Turhal, Zile | Ova | 0.22 | 0.24 |
| 3 | Erbaa-Niksar | Erbaa, Niksar, Reşadiye, Almus, Başçiftlik | Dağlık | 0.36 | 0.34 |

## 67 ZONGULDAK — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ereğli Sanayi | Ereğli, Alaplı | Tepelik | 0.35 | 0.42 |
| 2 | Zonguldak Havzası | Merkez, Kilimli, Kozlu, Çaycuma, Devrek, Gökçebey | Tepelik | 0.65 | 0.58 |

## 28 GİRESUN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Giresun Kıyı | Merkez, Keşap, Piraziz, Bulancak, Dereli, Espiye, Tirebolu, Görele, Eynesil, Yağlıdere, Güce, Çanakçı, Doğankent | Dağlık | 0.80 | 0.82 |
| 2 | Şebinkarahisar | Şebinkarahisar, Alucra, Çamoluk | Dağlık | 0.20 | 0.18 |

## 61 TRABZON — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Trabzon Kıyı | Ortahisar, Akçaabat, Yomra, Arsin, Vakfıkebir, Beşikdüzü, Çarşıbaşı, Sürmene, Of, Araklı | Tepelik | 0.72 | 0.75 |
| 2 | Güney Vadiler | Maçka, Çaykara, Dernekpazarı, Köprübaşı, Hayrat, Tonya, Şalpazarı, Düzköy | Dağlık | 0.28 | 0.25 |

## 53 RİZE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Rize Kıyı | Merkez, Çayeli, Derepazarı, İyidere, Ardeşen, Pazar, Fındıklı, Güneysu, Kalkandere, İkizdere, Çamlıhemşin, Hemşin | **Dağlık** | 1.00 | 1.00 |

> **Birleştirme (2026-07-24):** Eski 2. parça **Kaçkar Vadileri** (Dağlık), 1. parça Rize Kıyı'ya katıldı; Rize tek parça oldu (payları 1.00/1.00). Gerekçe: burada bir arazi kontrastı (Dağlık↔Tepelik) VARDI; birleştirme Baki'nin bilinçli tercihidir — Rize küçük bir il, tek parça olarak tutulması istendi. (Kontrast kuralına uymayan tek istisna.) **Baki onayladı (2026-07-26); tek parça kalır, arazi Dağlık'a sabitlendi.**
>
> **Arazi düzeltmesi (2026-07-26, Görev 03B):** Birleşme sonrası arazi otomatik hesapla **Tepelik** çıkıyordu; elle **Dağlık**'a sabitlendi (`parca-uret.js` → `ARAZI_ZORLA`). Gerekçe: Rize'nin coğrafi kimliği dağdır ve tasarım belgesi Rize'yi iki yerde dağlık savunmanın örneği olarak kullanır (§3.5, §5). Savunma çarpanı ×1.15 değil **×1.35**.

## 08 ARTVİN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Çoruh Kıyı | Merkez, Borçka, Murgul, Hopa, Arhavi, Kemalpaşa | Dağlık | 0.62 | 0.63 |
| 2 | Yusufeli-Şavşat | Yusufeli, Şavşat, Ardanuç | Dağlık | 0.38 | 0.37 |

## 57 SİNOP — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Sinop Kıyı | Merkez, Gerze, Erfelek, Ayancık, Türkeli, Dikmen | Dağlık | 0.60 | 0.62 |
| 2 | Boyabat | Boyabat, Durağan, Saraydüzü | Tepelik | 0.40 | 0.38 |

## 05 AMASYA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Amasya Ovası | Merkez, Suluova, Göynücek | Ova | 0.55 | 0.55 |
| 2 | Merzifon-Taşova | Merzifon, Gümüşhacıköy, Hamamözü, Taşova | Tepelik | 0.45 | 0.45 |

## 14 BOLU — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bolu Ovası | Merkez, Mengen, Gerede, Yeniçağa, Dörtdivan | Ova | 0.72 | 0.75 |
| 2 | Güney Dağlık | Mudurnu, Göynük, Seben, Kıbrıscık | Dağlık | 0.28 | 0.25 |

## 19 ÇORUM — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Çorum Ovası | Merkez, Mecitözü, Laçin, Sungurlu, Alaca, Boğazkale, Ortaköy, Uğurludağ | Ova | 0.78 | 0.80 |
| 2 | Kuzey | Osmancık, İskilip, Kargı, Bayat, Dodurga, Oğuzlar | Tepelik | 0.22 | 0.20 |

## 78 KARABÜK — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Karabük | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

## 74 BARTIN — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bartın | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

## 81 DÜZCE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Düzce | Tüm ilçeler | Tepelik | 1.00 | 1.00 |

## 29 GÜMÜŞHANE — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Gümüşhane | Tüm ilçeler | Dağlık | 1.00 | 1.00 |

## 69 BAYBURT — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bayburt | Tüm ilçeler | Dağlık | 1.00 | 1.00 |

---

# DOĞU ANADOLU BÖLGESİ

## 25 ERZURUM — 5 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Erzurum Ovası | Yakutiye, Palandöken, Aziziye, Aşkale | Ova | 0.57 | 0.60 |
| 2 | Pasinler | Pasinler, Horasan, Köprüköy, Narman | Tepelik | 0.13 | 0.12 |
| 3 | Hınıs-Tekman | Hınıs, Karaçoban, Tekman, Çat | Dağlık | 0.12 | 0.10 |
| 4 | Oltu-Tortum | Oltu, Olur, Şenkaya, Tortum, Uzundere | Dağlık | 0.12 | 0.12 |
| 5 | İspir | İspir, Pazaryolu | Dağlık | 0.06 | 0.06 |

## 65 VAN — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Van Kenti | İpekyolu, Tuşba, Edremit | Ova | 0.45 | 0.50 |
| 2 | Erciş-Muradiye | Erciş, Muradiye, Çaldıran | Tepelik | 0.25 | 0.23 |
| 3 | Özalp-Başkale | Özalp, Saray, Başkale | Dağlık | 0.15 | 0.14 |
| 4 | Güney Dağlık | Gürpınar, Gevaş, Çatak, Bahçesaray | Dağlık | 0.15 | 0.13 |

## 04 AĞRI — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ağrı Ovası | Merkez, Hamur, Tutak, Patnos, Eleşkirt | Tepelik | 0.68 | 0.68 |
| 2 | Doğubayazıt | Doğubayazıt, Diyadin, Taşlıçay | Dağlık | 0.32 | 0.32 |

## 24 ERZİNCAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Erzincan Ovası | Merkez, Üzümlü, Çayırlı, Otlukbeli, Tercan | Ova | 0.75 | 0.77 |
| 2 | Batı Dağlık | Refahiye, Kemah, İliç, Kemaliye | Dağlık | 0.25 | 0.23 |

## 36 KARS — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kars Ovası | Merkez, Selim, Arpaçay, Akyaka, Susuz | Ova | 0.60 | 0.62 |
| 2 | Sarıkamış-Kağızman | Sarıkamış, Kağızman, Digor | Dağlık | 0.40 | 0.38 |

## 44 MALATYA — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Malatya Ovası | Battalgazi, Yeşilyurt, Yazıhan, Akçadağ, Doğanşehir, Darende | Ova | 0.86 | 0.87 |
| 2 | Kuzey-Doğu Dağlık | Hekimhan, Arapgir, Arguvan, Kuluncak, Pütürge, Kale, Doğanyol | Dağlık | 0.14 | 0.13 |

## 49 MUŞ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Muş Ovası | Merkez, Hasköy, Korkut, Bulanık, Malazgirt | Ova | 0.85 | 0.86 |
| 2 | Varto | Varto | Dağlık | 0.15 | 0.14 |

## 13 BİTLİS — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Tatvan-Ahlat | Tatvan, Ahlat, Adilcevaz | Dağlık | 0.50 | 0.50 |
| 2 | Bitlis-Hizan | Merkez, Güroymak, Hizan, Mutki | Dağlık | 0.50 | 0.50 |

## 23 ELAZIĞ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Elazığ Ovası | Merkez, Sivrice, Keban, Ağın, Baskil | Ova | 0.72 | 0.75 |
| 2 | Doğu Dağlık | Kovancılar, Karakoçan, Palu, Maden, Arıcak, Alacakaya | Dağlık | 0.28 | 0.25 |

## 30 HAKKARİ — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Hakkari-Çukurca | Merkez, Çukurca | Dağlık | 0.42 | 0.45 |
| 2 | Yüksekova-Şemdinli | Yüksekova, Şemdinli, Derecik | Dağlık | 0.58 | 0.55 |

## 12 BİNGÖL — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Bingöl | Tüm ilçeler | Dağlık | 1.00 | 1.00 |

## 62 TUNCELİ — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Tunceli | Tüm ilçeler | Dağlık | 1.00 | 1.00 |

## 75 ARDAHAN — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Ardahan | Tüm ilçeler | Dağlık | 1.00 | 1.00 |

## 76 IĞDIR — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Iğdır | Tüm ilçeler | Ova | 1.00 | 1.00 |

---

# GÜNEYDOĞU ANADOLU BÖLGESİ

## 21 DİYARBAKIR — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Diyarbakır Kenti | Bağlar, Kayapınar, Sur, Yenişehir | Ova | 0.58 | 0.60 |
| 2 | Dicle Ovası | Bismil, Silvan, Hazro, Çınar | Ova | 0.15 | 0.15 |
| 3 | Ergani-Çermik | Ergani, Dicle, Eğil, Kocaköy, Çüngüş, Çermik | Tepelik | 0.18 | 0.17 |
| 4 | Kuzey Dağlık | Hani, Lice, Kulp | Dağlık | 0.09 | 0.08 |

## 63 ŞANLIURFA — 4 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Urfa Kenti | Eyyübiye, Haliliye, Karaköprü | Ova | 0.50 | 0.52 |
| 2 | Harran ve Fırat | Harran, Akçakale, Suruç, Birecik, Bozova, Halfeti | Ova | 0.20 | 0.20 |
| 3 | Siverek-Hilvan | Siverek, Hilvan | Tepelik | 0.15 | 0.13 |
| 4 | Viranşehir-Ceylanpınar | Viranşehir, Ceylanpınar | Ova | 0.15 | 0.15 |

## 47 MARDİN — 3 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Mardin Eşiği | Artuklu, Yeşilli, Ömerli, Savur | Tepelik | 0.30 | 0.32 |
| 2 | Kızıltepe-Nusaybin | Kızıltepe, Nusaybin, Derik, Mazıdağı | Ova | 0.47 | 0.46 |
| 3 | Midyat-Dargeçit | Midyat, Dargeçit | Tepelik | 0.23 | 0.22 |

## 27 GAZİANTEP — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Gaziantep Kenti | Şahinbey, Şehitkamil, Oğuzeli, Nizip, Karkamış, Araban, Yavuzeli | Ova | 0.91 | 0.93 |
| 2 | İslahiye-Nurdağı | İslahiye, Nurdağı | Tepelik | 0.09 | 0.07 |

## 73 ŞIRNAK — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Cizre-Silopi | Cizre, Silopi, İdil | Ova | 0.60 | 0.65 |
| 2 | Şırnak Dağlık | Merkez, Güçlükonak, Uludere, Beytüşşebap | Dağlık | 0.40 | 0.35 |

## 02 ADIYAMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Adıyaman Ovası | Merkez, Samsat, Besni, Gölbaşı, Tut | Ova | 0.70 | 0.72 |
| 2 | Kâhta-Gerger | Kâhta, Gerger, Çelikhan, Sincik | Dağlık | 0.30 | 0.28 |

## 72 BATMAN — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Batman Ovası | Merkez, Beşiri | Ova | 0.75 | 0.80 |
| 2 | Kozluk-Sason | Kozluk, Sason, Gercüş, Hasankeyf | Dağlık | 0.25 | 0.20 |

## 56 SİİRT — 2 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Siirt Merkez | Merkez, Tillo, Kurtalan | Tepelik | 0.65 | 0.68 |
| 2 | Doğu Dağlık | Pervari, Baykan, Eruh, Şirvan | Dağlık | 0.35 | 0.32 |

## 79 KİLİS — 1 parça

| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi |
|---|---|---|---|---|---|
| 1 | Kilis | Tüm ilçeler | Ova | 1.00 | 1.00 |

---

# ÖZET

## Bölgelere göre dağılım

| Bölge | İl | Parça |
|---|---|---|
| Marmara | 11 | 27 |
| Ege | 8 | 21 |
| Akdeniz | 8 | 24 |
| İç Anadolu | 13 | 31 |
| Karadeniz | 18 | 31 |
| Doğu Anadolu | 14 | 29 |
| Güneydoğu Anadolu | 9 | 22 |
| **Toplam** | **81** | **185** |

## Arazi dağılımı

| Arazi | Parça | Oran |
|---|---|---|
| Ova | 73 | %39 |
| Tepelik | 52 | %28 |
| Dağlık | 60 | %32 |

Dağlık parçaların yarısından fazlası Doğu Anadolu (18) ve Karadeniz'de (14). Bu, haritanın doğu yarısını doğal savunma bölgesi yapıyor: batıda hızlı ilerleyen ordu doğuda yavaşlar. Zırhlının dağlıkta ×0.50 ceza yediği düşünülürse, doğu illeri topçu ve piyade cephesi olacak.

## Seyreltmenin gerekçeleri

**Bölünmeyen iller neden bölünmedi.** Aksaray baştan sona ova, Kırıkkale baştan sona tepelik, Tunceli ve Bingöl baştan sona dağlık. Bunları ikiye ayırmak iki özdeş parça üretirdi — oyuncu için ekstra bir tıklama, oynanış için sıfır fark. Bilecik, Uşak, Nevşehir de aynı sebeple tek parça.

**En sert seyreltmeler:**

| İl | v1 | v2 | Sebep |
|---|---|---|---|
| İstanbul | 6 | 3 | Tarihsel mantık (sur içi / Avrupa / Anadolu) daha okunaklı |
| Ankara | 6 | 5 | Kuzey ormanlık ile batı vadi birleştirildi |
| Manisa | 5 | 3 | Gediz ovası kesintisiz tek koridor, bölmek yapaydı |
| Ordu | 5 | 3 | Kıyı şeridi tek bant; dört ayrı iç parça gereksizdi |
| Trabzon | 3 | 2 | Doğu-batı kıyı ayrımı zorlamaydı, kıyı-vadi ayrımı gerçek |
| Tekirdağ | 4 | 3 | Çerkezköy ile Çorlu aynı sanayi koridoru |
| Kayseri | 4 | 3 | Kuzey ilçeleri ayrı parça olacak kadar farklı değil |

**Merkez ağırlığı bilerek iller arasında farklı.** Gaziantep'te 1. parçanın payı 0.91, Muş'ta 0.85, Malatya'da 0.86. Bu iller "ana parçayı al, iş bitti" mantığıyla çalışır — hızlı fetihler. Buna karşılık Bitlis (0.50/0.50), Artvin, Hakkari, Kastamonu gibi illerde parçalar dengelidir; ili tamamen almak için hepsini fethetmek gerekir. Bu çeşitlilik istenen bir sonuç: harita boyunca her il aynı hissettirmez.

---

# SONRAKİ ADIM: PARÇA KOMŞULUK GRAFİĞİ

185 parça için yaklaşık 480 komşuluk çifti tanımlanacak (üretilen: 481). Elle yapılırsa hatalı olur; programatik yöntem:

1. Hazır ilçe sınır verisi alınır (GeoJSON, açık kaynaklı).
2. Yukarıdaki tabloya göre ilçeler gruplanır — her parçanın sınırı, içindeki ilçelerin sınırlarının birleşimidir.
3. İki parça sınır paylaşıyorsa komşudur; geometrik olarak otomatik hesaplanır.
4. **Doğrulama:** İki parça komşuysa ya aynı ildendir ya da illeri komşudur. Mevcut 81 il komşuluk grafiği bu kontrolü yapar. Kural dışına çıkan her çift elle incelenir.

Adım 4, mevcut il grafiğinin yeni işlevidir: artık oyun kuralı değil, **hata yakalama aracı**.

## Elle tanımlanması gereken deniz geçişleri

Geometrik hesap kara sınırı arar, bu üç geçişi bulamaz:

| Geçiş | Parçalar |
|---|---|
| İstanbul Boğazı | İstanbul-1 ve İstanbul-2 ↔ İstanbul-3 |
| Çanakkale Boğazı | Çanakkale-1 ↔ Çanakkale-2 ve Çanakkale-3 |
| İzmit Körfezi | Kocaeli-1 ve Kocaeli-2 ↔ Kocaeli-3 |

Adalar için ek kural gerekmiyor — hepsi bir kara parçasının içinde tanımlı.
