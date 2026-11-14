# GÖREV 21 — GÖRSEL GÜZELLEŞTİRME: "VERİ HARİTASINDAN" OYUNA

> Başlangıç: 2026-09-24. Önceki görev: `GOREV-20-sezgi-ve-akicilik.md` (sürüyor; Adım 6–9
> açık). Bu görev onun görsel kardeşi: Görev 20 oyunun **metinsiz anlaşılmasını**, Görev 21
> **göze güzel ve canlı görünmesini** hedefliyor.

## 0. BAKİ'NİN SÖZLERİ

- 2026-09-24: *"Oyun şu anki hâliyle haritada bir simülasyon oyunu; görsel detaylar
  eklememiz gerektiğini hissediyorum, sence?"*
- Öneri görüntülerinden sonra: *"B olsun; il merkezinde kale ve bayrağa gerek yok; komutan
  halesi bence kötü olmuş, daha farklı gözükebilir — mesela insan silüeti ya da başka
  şeyler. Denizde hafif dalga çizgileri olabilir."*
- *"Veri haritasından çıkarmanın başka yollarını da düşün; arayüz tasarımının tüm
  detaylarını ver, onda güzelleştirmeler yapalım."*

## 1. ENVANTER VE ÖNERİLER — TEK KAYNAK

`scripts/arayuz-envanteri.js` → `onizleme/arayuz.html`. Sayfada: görsel kimlik, bütün renk
jetonları (`tema.js`'ten canlı okunuyor), yazı tipleri, harita görüntüleri, **25 ekranın
dökümü** (nereden açılır, zemini, içindekiler, yazı yükü) ve **27 numaralı öneri** (H =
harita, U = ana ekran, P = ekranlar, T = yazı ve renk). Liste burada kopyalanmıyor
(CLAUDE.md §5/5); karar verildikçe aşağıdaki tabloya yalnızca kimlik ve karar yazılır.

Öneri görüntüleri: `scripts/gorsel-oneri.js` → `onizleme/harita-skia/oneri-*.png` (oyunun
kendi çizimi, aynı maç).

## 2. KARARLAR

| Kimlik | Öneri | Karar | Durum |
|---|---|---|---|
| H1 | Kıyı gölgesi + dağ + tepe + dalga | **Evet** ("B olsun" + "dalga olabilir") | ✅ oyunda (`haritaCizim.js` SÜSLER, `veri/harita-susleri.json`) · telefonda denenmedi |
| — | İl merkezinde kale + bayrak | **Hayır** ("gerek yok") | — |
| — | Komutan halesi + yıldız + sancak | **Hayır** ("kötü olmuş") | — |
| H2 | Komutan silüeti: A büst · B ayakta · C madalyon | **Hayır** ("hiçbiri olmasın, beğenmedim") | Komutan pirinç konturla kalıyor |
| H3 | Nefes alan kalkan (hamle hakkı) | **Evet** — "çok soluk olmasınlar" + "5 askerin 3'ü oynadıysa hepsi mi soluk?" | 🔶 kodda, önizlemede (10, 10b, 11) · telefonda denenmedi |
| H4 | Cephe hattı (kırmızı + dişler) | **Evet** ("önerdiklerini ekle") | 🔶 kodda, önizlemede (12, 12b) |
| H6 | Başkent yıldızı | Evet → telefonda gördü → **Hayır** ("gerek yok bence") | ❌ kaldırıldı (kod, veri, test) |
| H10 | Birlik figürleri | **Evet** | 🔶 kodda, önizlemede (14, 14b) |
| U2 | Büyük TURU BİTİR | **Evet** | 🔶 kodda (`TurBitirDugmesi.js`) · telefonda denenmedi |
| H8 | Nehirler ve göller | **Evet** ("indir") · göller parçalardan AYRI ("yalnızca dekoratif") | 🔶 kodda: göller parçalardan oyuldu (`scripts/parca-gol-oy.js`), önizlemede (15, 15b, 15c) |
| P8 | Bölge panelinden ordu kontrolü | **Kaldır**, yeni panel yok ("komutan kısmı belli değil") | 🔶 ordu çubuğu (`HamleCubugu.js`): KOMUTAN / KOMUTANI GETİR · TOPARLAN · ASKER BAS |
| T4 | "Bazı ekranlarda açık sarı gibi renkler var, beğenmiyorum" | **A — kırık beyaz** | ✅ `tema.js KAGIT` (pirinç için cevap yok → kaldı) |
| P6 | İki yüzey kuralı (kâğıtta kâğıdın yazısı) | Hata düzeltmesi | ✅ komutan ekranı düzeltildi |
| H5, H7, H9, H11–H13, U1, U3–U5, P1–P5, P7, T1–T3 | — | Bekliyor | Sayfada |

## 2b. ARA NOKTA (2026-09-24, Baki: "uygun bir yerde checkpoint al")

Beşinci tur isteklerinden yapılanlar (her biri ayrı adım; Baki telefonda doğrulamadı):

1. **H3 hamle hakkı** — `oyun/hareket.js hamleHakkiTablosu` (kalan/toplam, gidecek yeri
   olmayan 0) → `rozetListesi.js` `hak` → `haritaCizim.js`: 10 dilimli halka (yanan dilim =
   oynayabilen askerin oranı, kısmi hiç "tam" ya da "boş" görünmez), koyu yatak rozet
   resminde, yanan dilimler karede nefesle (`halkaOynat`, `DENGE.ROZET.NEFES_SURE/ADIM`,
   saniyede ~20 güncelleme, üstte ekran varken durur). Hakkı biten kalkan açık tülle solar.
2. **H4 cephe hattı** — `haritaSeviye.js cepheHatlari` + `haritaCizim.js cepheResimleri`
   (şerit + dişler resim sayfasından, dişin yönü en ince seviyenin dolgusuyla bulunuyor).
   `tema.js CEPHE.disli: false` düz çizgi yapar (menüde Baki dişleri istememişti).
3. **H6 başkent yıldızı** — `harita-sus-uret.js` yıldız yerleri (81 il, merkez parça,
   rozetten uzak; çevresindeki dağ glifleri çekildi: dağ 574→563, tepe 304→295) →
   `yildizResimleri`; kurucusu tutuyorsa beyaz, düştüyse gri. 1.3× altında yok.
4. **H10 birlik figürleri** — `figurResmi`, `DENGE.ROZET.FIGUR_ESIGI` 5.5× üstünde kadro
   şeridinin yerine: açık gövdeli koyu konturlu figür + koyu balonda sayı.
5. **U2 TURU BİTİR** — `TurBitirDugmesi.js`, sağ altta harita düğmelerinin üstünde; ordu
   bekliyorsa sessiz + sayı rozeti, hepsi oynadıysa dolu. Tur çubuğundaki "BİTİR" kalktı.

Kare çağrı bütçesi 18 → 25 (en kötü hâl, üç geçiş birden); durağan karede ≤16 (test).

**Ara noktadan sonra (aynı gün) tamamlananlar:**
- Hız EKRAN KARTIYLA ölçüldü (`veri/harita-hiz-olcum.md` §6): gerçek maçta fark gürültünün
  içinde, katmanlar tek başına 0.3–0.6 ms; uydurma en ağır hâlde (bütün ordular halkalı,
  400 cephe hattı) ortanca en çok 9.8 ms. Nefes: boşta saniyede ~20 çizim.
- `CLAUDE.md` §6'ya "sürekli canlandırma = sürekli yeniden çizim" tuzağı; envanter
  durumları (H2 istenmedi · H3/H4/H6/H10/U2 kodda · H8 izin bekliyor); URETIM-NOTU.
- Renk seçenekleri: `scripts/renk-secenekleri.js` → `onizleme/renk-secenekleri.html`.
  Sarıya çalan yedi rengin yeri; kâğıt için bugünkü + 4 aday (A kırık beyaz · B adaçayı ·
  C haki dosya · D grafit), pirinç için bugünkü + 2 aday (P1 açık gümüş · P2 deniz
  yeşili), hepsi ölçülmüş kontrastla. ⚠ Ölçüm yan bulgusu: bugünkü `KAGIT.yaziSoluk`
  parşömende 3.4:1 (tema.js yorumu 4.2 diyor — yorum yanlış); dört adayın hepsi ≥ 4.3.
- Android paketi derlendi (`expo export`), kontrol 6/6, 852 test.

**Baki'den beklenen:** kâğıt için harf (A–D ya da "bugünkü kalsın") + pirinç için (P1, P2 ya
da "kalsın") · H8 için indirme izni: naturalearthdata.com'dan `ne_10m_rivers_lake_centerlines.zip`
(1.98 MB) ve `ne_10m_lakes.zip` (2.24 MB), kamu malı; işlenip küçük bir JSON'a çevrilir,
zip'ler depoya girmez · telefonda: halka + nefes, cephe, yıldız, figürler, TURU BİTİR.

## 2c. YEDİNCİ TUR (2026-09-24, Baki: "1. A · 2. indir · 3. expo komutunu ver")

- **Telefonda hata:** "halkaOynat is not a function". Kare fonksiyonu `halkaOynat`'ı çağırıyordu
  ama o dosyada SONRA tanımlıydı; Reanimated derleyicisi worklet bildirimini sabite çevirdiği
  için telefonda tanımsızdı (bilgisayarda çalışıyordu). Yukarı taşındı; "WORKLET SIRASI"
  testi ve CLAUDE.md §6 tuzağı eklendi.
- **Renk A:** `KAGIT` kırık beyaz (`#E4E8EB` …); `scripts/tema-olcum.js` hepsini ölçtü, hepsi
  eşiğin üstünde (soluk yazı 3.4 → 4.3).
- **H8 nehir ve göl:** Natural Earth 10m (kamu malı) indirildi — naturalearthdata.com'un eski
  indirme yolu hata verdi, aynı dosyalar sitenin kendi sunucusundan (naciscdn.org) alındı:
  `ne_10m_rivers_lake_centerlines.zip` 1.98 MB, `ne_10m_lakes.zip` 2.24 MB. Zip'ler depoda
  YOK. `scripts/harita-nehir-uret.js`: haritanın yerleşimini (ölçek + kayma, hiçbir yerde
  yazılı değildi) 81 ilin ham sınır kutusundan en küçük karelerle geri buldu (ortanca hata
  0.05 birim), shapefile'ı ek paketsiz okudu, nehirleri karaya kırptı. 12 nehir (Fırat,
  Dicle, Kızılırmak, Sakarya, Murat, Kelkit, Ceyhan, Büyük Menderes, Simav, Aras, Kura, Meriç)
  ve 7 göl (Van, Tuz, Beyşehir, Eğirdir, Keban, Atatürk, bir baraj). Çizim `nehirResimleri`:
  göl dolgusu + kıyı şeridi + iki kalınlıkta nehir şeridi, bant başına tek resim.
  Önizlemenin yakaladıkları: göl denizin renginde Van'ın açık ilinde kayboldu (→ daha mavi),
  dağ glifleri ve bir yıldız gölün içine düştü (→ `harita-sus-uret.js` sudan uzak tutuyor);
  test yakaladı: nehir payı Sakarya'nın yıldızını rozetin dibine itti (→ yıldız yalnız gölden
  kaçıyor). Hız: bütün Görev 21 katmanları 0.4–1.0 ms (`veri/harita-hiz-olcum.md` §6b).

## 2d. SEKİZİNCİ TUR (2026-09-24 · Baki telefonda denedi)

Baki'nin gözlemi: halka yanıp sönüyor ✓, cephe kırmızı ve dişli ✓, figür/nehir görünüyor ✓,
belge ekranları beyazımsı ✓. İstekleri (her biri ayrı adım):

1. **Yıldızlar kalktı** ("gerek yok bence"): `yildizResimleri`, `BASKENT`, resim sayfasının
   yıldız hücreleri, `harita-sus-uret.js`'teki yıldız yerleri ve dağların yıldızdan kaçışı,
   testler. Dağlar geri geldi (495 → 503 → göl oyulduktan sonra 496).
2. **Göller parçalardan AYRI** ("parçaların içinde olmasın, yalnızca dekoratif dursunlar, il
   sınırlarını yeniden çiz"): `scripts/parca-gol-oy.js` 7 gölü 21 parçadan ve 12 ilden oydu
   (turf farkı; alan ve uzaklık düzlemde — turf'ünkiler enlem-boylam sanıyor). Kırıntı halkalar
   (≤ 0.2 birim²) kaba seviyede siliniyor ve seviyeleri ayrıştırıyordu → 1 birim²'den küçük
   halka yazılmıyor (`harita-seviye-uret.js` öz denetimi yakaladı). 3 parça ve 2 il rozeti
   gölden çıkarıldı (polylabel). Göl kıyısını artık sınır çizgileri çiziyor; eski ayrı kıyı
   şeridi kalktı. Göle dokunmak hiçbir şey seçmiyor (çift-tek kuralı).
   **SU ÜSTÜNDEN KOMŞULAR:** 4 çiftin arasında artık yalnızca göl var (Adıyaman–Şanlıurfa ×2
   Atatürk Barajı, Bitlis–Van Van Gölü, Elazığ–Tunceli Keban). Oyun kuralı DEĞİŞMEDİ —
   boğazlar gibi komşu kalıyorlar; liste `parcalar.json meta.golOyma.suUstuKomsu`,
   `veri-dogrula.js` biliyor.
3. **Bölge panelinden ordu kontrolü kalktı, yeni panel yok** ("komutan kısmı belli değil"):
   kendi orduna dokununca — hakkı bitmiş olsa da — alt çubuk açılıyor: askerleri (simge +
   sayı), **KOMUTAN** (buradaysa, dokun: ekranı) / **KOMUTANI GETİR** (yazılı), yaralı varsa
   **TOPARLAN** (bedeliyle), **ASKER BAS**, ⓘ bölge paneli, ×. Bölge panelinde SALDIR / ASKER
   TAŞI, komutan simgesi, toparlanma kutusu ve emir listesi yok; askerlerin dökümü (bilgi) ve
   ASKER BAS kaldı. Komutan ekranı açıkken harita dokunmaya kapalı (eksikti). Metin yükü:
   OYUN İÇİ 1276 → 1239 kelime, 41 → 39 uzun cümle.

## 2e. DOKUZUNCU TUR (2026-09-24 · Baki: "oyun şu anki hâliyle güzel")

Baki: *"İstanbul Anadolu'yu Kocaeli olarak aldım, 'il kaybedildi İstanbul Anadolu' yazıyor;
aslında parça kazanıldı yazmalı. Bu ve bunun gibi düzeltilmesi gereken her şeyi tespit et."*
Bütün oyuncu metinleri (784 satır) tek tek okundu. Bulunanlar — hepsi "yanlış taraftan konuşma"
ya da eskimiş anlatım:

1. **Sahne kartı yanlış taraf** (`olaylar.js fetihOlaylari`): `ilKaybedildi` ESKİ SAHİBİN
   kaybıydı ama "savaş beni ilgilendiriyor" diye oyuncuya gösteriliyordu; test bu hatayı
   kilitliyordu (düzeltildi). Artık: ben aldım → İL FETHEDİLDİ / **BÖLGE ALINDI** (yeni) ·
   benden alındı → İL KAYBEDİLDİ / **BÖLGE KAYBEDİLDİ** (yeni) · başkaları → kart yok.
   Bölge kartları kısa (`DENGE.SAHNE.SURE.bolgeKarti` 1100 ms) ve küçük.
2. **Tur raporu savunanı saldıran gibi anlatıyordu:** sana saldırıp kazanan rakip
   "KAZANDIN · burası artık senin · Sen: … gönderdin" diye yazılıyordu. Satırlar artık
   `taraf` taşıyor; cümle, döküm, raunt ve çekilme oyuncunun tarafından.
3. **Boş parçan alındığında raporda hiçbir şey yoktu** (satırda `savunanId` yok) → kayıp
   satırı eklendi; maç sayacı da bu kayıpları saymıyordu (düzeltildi).
4. **Savaşsız alınan bölgeler maç sayacına girmiyordu** (giriş satırında `sahip` yoktu) —
   "bölge alındı" ve fetih mühürleri eksik sayıyordu. Test eklendi.
5. **Rapor başlığı yalnızca saldırıları sayıyordu:** savunduğun turda "Muharebe olmadı" yazıp
   altında savaş gösteriyordu → oyuncunun gözünden özet + "N bölge kaybedildi".
6. **Manşette il yerine parça adı:** "X, İstanbul Anadolu Yakası ilini tümüyle ele geçirdi".
7. **Parçanın çıplak adı belirsizdi** ("Kuzeybatı savunması dayanamadı") → `veri.js
   parcaTamAdi`: "Ankara Kuzeybatı", "İstanbul Anadolu Yakası" (rapor, kart, manşet, günlük,
   ordularım, komşular, komutanın yeri, hamle çubuğu).
8. **Eskimiş anlatım:** tur günlüğü ("soldaki panelden SALDIR"), Nasıl Oynanır · TUR ("emirler
   tur sonunda çözülür, her birlik iki hamle" — Görev 15'ten beri yanlış; artık DENGE'den
   piyade/topçu/zırhlı), ayarlar menüsü komutan alt yazısı, "Turu geri al" ödülü ("emir" →
   "hamle"), mühür "İlk Emir" → "İlk Hamle" (kimlik aynı).
9. **Bölge panelinde "parça"** → "bölge" (oyuncunun kelimesi her yerde bölge).

CLAUDE.md §6'ya "rapor satırı kimin gözünden" tuzağı. Metin yükü: OYUN İÇİ 1239 → 1300
kelime (savunan cümleleri — eskiden saldıran cümlesi yanlış yerde kullanılıyordu).

## 3. H1 NASIL YAPILDI (kısa)

- Yerler bir kez hesaplanıyor (`scripts/harita-sus-uret.js`): dağ 574, tepe 304, dalga 365.
  Dalga yalnızca üç deniz kutusunda ve karadan açıkta — komşu ülke toprağına düşmüyor.
- Çizim sınır çizgilerinin hızlı yolundan: çizgiler hazır üçgen şeridi + ekran kartı
  programı, yamaçlar düz üçgen, kıyı gölgesi maç başında bir kez çizilen bulanık resim.
  Karede +0.6–1.6 ms (`veri/harita-hiz-olcum.md` §5).
- Uzakta (1.3× altı) dağ/tepe çizilmiyor: yüzlerce küçük glif gürültüye dönüyor.
- ⚠ Önizlemenin yakaladığı iki hata: kıyı gölgesi şeritken girintili kıyıda yıldız gibi
  dikenler (→ resim); bir dalga Muğla'da parçanın içine düşüyordu (→ deniz testine parçalar).

## 4. SONRAKİ ADIMLAR

Baki H2'de bir seçenek ve öneri listesinden istediklerini seçince, her seçim ayrı adım
olarak yapılır (CLAUDE.md §7). Harita katmanları `onizleme/harita-hiz.html` ile ÖLÇÜLÜR.
