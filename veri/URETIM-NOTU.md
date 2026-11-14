# VERİ ÜRETİM NOTU

Bu dosya `veri/` klasöründeki verilerin **nereden, ne zaman, nasıl** geldiğini kaydeder.
Amaç: aylar sonra "bu sayı/sınır nereden geldi?" sorusunu cevaplayabilmek.

Her adım tamamlandıkça bu dosya güncellenir. Tarih formatı: YYYY-AA-GG.

---

## ADIM 1 — Sınır verisi (81 il)

**Tarih:** 2026-07-24

### Seçilen kaynak: geoBoundaries — Türkiye ADM1 (il düzeyi)

- **Dosya:** `veri/ham/geoBoundaries-TUR-ADM1.geojson` (~10,1 MB, tam çözünürlük)
- **Meta veri:** `veri/ham/geoBoundaries-TUR-ADM1-meta.json` (geoBoundaries API cevabı, provenans için saklandı)
- **İndirme yolu:** geoBoundaries API → `https://www.geoboundaries.org/api/current/gbOpen/TUR/ADM1/` → `gjDownloadURL` alanındaki tam sürüm bağlantısı (GitHub LFS, `-L` ile yönlendirme takip edilerek indirildi).
- **Temsil ettiği yıl:** 2021 sınırları. Kaynak verinin güncelleme tarihi: 2023-08-31, geoBoundaries derleme tarihi: 2023-12-12.
- **Ham veri kaynağı:** OpenStreetMap (geoBoundaries `licenseSource: www.openstreetmap.org/copyright`).
- **Lisans:** **Creative Commons Attribution-ShareAlike 2.0 (CC BY-SA 2.0).**
  - Anlamı: (1) **Atıf** — oyunda "harita verisi: geoBoundaries / OpenStreetMap katkıcıları" gibi bir kaynak belirtmek gerekir. (2) **ShareAlike** — bu sınır verisinden türetilen harita verisi (bizim `harita.json` gibi) dağıtılırsa aynı açık lisansla paylaşılmalı. Bu, oyunun **kodunu** açık yapmayı gerektirmez; yalnızca sınır verisi dosyasını kapsar. Ticari oyunda kullanılabilir; sadece bu iki şart yerine getirilir.

### Neden bu kaynak?

Üç aday değerlendirildi:

| Kaynak | Detay | Lisans | Karar |
|---|---|---|---|
| **geoBoundaries ADM1** | Çok yüksek (il başına ort. ~4521 nokta) | CC BY-SA 2.0 | **SEÇİLDİ** |
| alpers/Turkey-Maps-GeoJSON | Çok düşük (il başına ort. ~74 nokta) | Apache 2.0 | Elendi — kalite |
| cihadturhan/tr-geojson | Düşük (~74 nokta) | Lisans dosyası yok | Elendi — kalite + lisans belirsiz |

alpers verisi lisans olarak (Apache 2.0) ticari kullanıma daha uygundu, ama geometrisi aşırı sadeleştirilmişti: topolojik komşuluk testinde birçok gerçek sınır **kayıp** çıktı (Yalova–Kocaeli, Kilis–Hatay, İstanbul–Kırklareli, Rize–Erzurum/Bayburt, Sinop–Çorum). Bu, sınırların birbirine oturmadığını gösterir → haritada iller arasında beyaz boşluklar + bozuk komşuluk. Bu yüzden elendi.

geoBoundaries tam sürümü detaylı ve topolojik olarak tutarlı; üzerinde **topolojik sadeleştirme** (Adım 2) yapılıp hedeflenen boyuta indirilecek. Ham dosya `veri/ham/` içinde **dokunulmadan** saklanır.

### Doğrulama sonuçları (hepsi geçti)

| Kontrol | Sonuç |
|---|---|
| İl sayısı | **81** ✓ |
| Plaka kodları (01–81) | Tam, `shapeISO` alanından (`TR-01` … `TR-81`), eksik/tekrar yok ✓ |
| Geometri türü | Polygon / MultiPolygon, bozuk geometri yok ✓ |
| Bounding box | lon[25.7, 44.8] lat[35.8, 42.1] — Türkiye ✓ |
| Komşusuz il | Yok ✓ |

### İsim eşleştirme — kanonik listeye göre 2 küçük fark

İllerin kanonik yazımı `scripts/iller-kanonik.js` dosyasında tutuluyor (kaynak: tasarım belgeleri). Kaynak veriyle karşılaştırıldığında 81 ilin 79'u birebir; 2 fark (ikisi de görevde uyarılan tuzaklar):

- **03 Afyonkarahisar** — geoBoundaries'te değil, ama alpers'te `Afyon` kısa adıyla geçiyordu (not amaçlı). geoBoundaries `Afyonkarahisar` kullanıyor, uyumlu.
- **30 Hakkari** — geoBoundaries `Hakkâri` (şapkalı â) yazıyor; kanonik `Hakkari`.

Çözüm: Görünen ad her zaman `scripts/iller-kanonik.js`'ten (kanonik yazım) alınacak, kaynak dosyanın `shapeName` alanı yalnızca eşleştirme için kullanılacak. Böylece panel/harita hep tutarlı Türkçe yazım gösterir.

---

## ADIM 2 — Harita çizime hazırlama

**Tarih:** 2026-07-24
**Betik:** `scripts/harita-uret.js` (tek çalıştırma: `node scripts/harita-uret.js`)
**Çıktılar:** `veri/harita.json` (828 KB) + `onizleme/harita.html` (+ `onizleme/harita-artifact.html` tablet için).

Adımlar:

1. **Küçük ada temizliği.** Ayrık poligonların dış halka alanı hesaplandı (turf). **6 km²** altındaki parçalar (kayalıklar) elendi: 619 kayalık atıldı, **12 anlamlı ada korundu** (Gökçeada, Bozcaada, Marmara, Avşa, Cunda vb.). Her ilin en büyük poligonu her zaman korunur.

2. **Topolojik sadeleştirme.** `topojson-server` ile topoloji kuruldu (quantization 2e4), `topojson-simplify` ile presimplify (küresel üçgen alanı ağırlığı) + quantile eşiği ile sadeleştirildi. **Komşu illerin ortak sınırı birlikte sadeleşir → boşluk açılmaz.** Parametre `SADELIK = 0.25` (topojson quantile; DÜŞÜK değer = daha sade). Sonuç: **74.658 nokta**, il başına ~920.
   - Not: tam çözünürlük (366k nokta) → 1,2 MB idi; hedef <1 MB için 0.25'e ayarlandı → 828 KB. Şekiller gözle 1,2 MB sürümüyle ayırt edilemiyor.

3. **Projeksiyon.** Ham enlem/boylam doğrudan çizilirse Türkiye basık görünür. **Lambert Conformal Conic** uygulandı (standart paraleller 37°/41°, merkez 35°D 39°K) — elle kodlandı, ek kütüphane yok. Sonuç doğru orantılı (bkz. önizleme).

4. **Ekrana sığdırma.** Projekte edilen koordinatlar 1000 px genişliğe ölçeklendi, Y ekseni ters çevrildi (SVG y-aşağı), 12 px kenar boşluğu. Çıktı boyutu **1000 × 452**.

5. **Etiket noktası.** Her ilin en büyük poligonunun **polylabel**'i (sınırlara en uzak iç nokta) hesaplandı — centroid içbükey illerde (Muğla, Antalya) denize/dışarı düşerdi. Görsel doğrulamada tüm etiketler il içinde.

**Doğrulama:** 81 il tam (yol + etiket var, eksik yok). Önizleme tarayıcıda/tablette Türkiye'ye benziyor, iller arası boşluk yok, adalar yerinde, etiketler il içinde.

**Ayarlanabilir parametreler** (`harita-uret.js` başında): `MIN_ADA_KM2`, `QUANT`, `SADELIK`, `GENISLIK`, `PAD`.

## YÖN DEĞİŞİKLİĞİ — Parça bölümlemesi (2026-07-24)

Baki, il seviyesi komşuluk yerine doğrudan **195 parça bölümlemesine** geçmeyi seçti (harita/il paneli ertelendi). Aşağısı bu işi belgeler.

### PARÇA — kaynak veri

- **İlçe sınırları:** `veri/ham/geoBoundaries-TUR-ADM2.geojson` (~16 MB, **973 ilçe**). Lisans: **ODbL 1.0** (OSM). İndirme: geoBoundaries API → gjDownloadURL (LFS). Meta: `...-ADM2-meta.json`.
- **Parça tablosu:** `veri/ham/parca-tablo.json` — `docs/il-savasi-parca-bolumleme-v2.md`'den `scripts/parca-tablo-ayristir.js` ile ayrıştırıldı. **195 parça**, dağılım {1:17, 2:32, 3:18, 4:10, 5:4} belgeyle bire bir; pay toplamları ~1.

### PARÇA — üretim (`scripts/parca-uret.js`)

1. **İlçe→il bağlama:** her ilçenin iç noktası hangi il (ADM1) poligonundaysa o ile bağlandı (turf). 973/973 bağlandı, hata yok.
2. **İlçe→parça eşleştirme:** tablodaki ilçe adları ADM2 adlarıyla Türkçe-normalize eşleştirildi. Çözülen isim farkları: Gökçeada=**Imbros**, Giresun Merkez=**Giresun District**, "Gediz"=**Gediz Merkez** (ilçe merkezi adlandırması), "Merkez"=**"<İl> merkez / (Merkez İlçe)"**. Sonuç: 973/973 atandı.
3. **Belgenin unuttuğu 5 ilçe** (elle atandı, Baki onayı — paylaşılan sınır uzunluğuna göre): Karayazı→Erzurum p3, Bakırköy→İstanbul p2, Sarıyer→İstanbul p1, Gürün→Sivas p2, Adalar(Prince Islands)→İstanbul p3.
4. **Parça geometrisi:** ilçe topolojisi kuruldu (quantization 1e5), ilçeler parçalara göre **topolojik birleştirildi** (topojson merge → ortak sınır korunur). Küçük kayalıklar (<6 km²) elendi. Çizim için parça topolojisi ayrıca sadeleştirildi (SADELIK 0.20).
5. **Komşuluk:** ilçe komşuluğundan parça komşuluğu türetildi + **3 deniz geçişi** elle eklendi (İstanbul Boğazı: 34-1/34-2↔34-3; Çanakkale Boğazı: 17-1↔17-2/17-3; İzmit Körfezi: 41-1/41-2↔41-3). Sonuç: **515 komşuluk çifti**, komşusuz parça yok.
6. **DOĞRULAMA:** her parça komşuluğu il komşuluk grafiğiyle denetlendi (komşu parçalar ya aynı il ya illeri komşu olmalı). **Aykırılık: 0.** İl komşuluk grafiği ADM1'den topolojik olarak hesaplandı (doğrulayıcı olarak).

### PARÇA — çıktılar

- `veri/parcalar.json` (~1,57 MB): `parcalar{pid:{kod,il,no,ad,arazi,nufus,ekonomi,yol,etiket}}` + `iller{kod:{ad,bolge,yol}}` (il dış hat yolları — beyaz sınır için). 195 parça + 81 il sınırı, 1000×452.
- `veri/parca-komsuluk.json`: parça → komşu parça listesi (515 çift, deniz geçişleri dahil).
- Önizleme: `scripts/parca-onizleme-uret.js` → `onizleme/parca.html` + `parca-artifact.html`. **3 mod:** İller (her il ayrı renk, parçaları aynı renk), Arazi (Düzlük/Tepelik/Dağlık — "ova" arayüzde **Düzlük**), Bölge (7 bölge). Sınırlar: parçalar arası **siyah**, iller arası **beyaz** (sahiplik sistemine hazır: aynı grup=siyah, farklı grup=beyaz). Dokun→komşular yanar, parmakla zoom.

### PARÇA — revizyonlar (Baki geri bildirimi, 2026-07-24)

- **Kopuk parça temizliği:** Bazı parçaların kara olarak kopuk (başka parçanın içinde kalan) bölümleri vardı (ör. Çankırı Merkez'in Ilgaz-Çerkeş içinde kalan ilçesi). `parca-uret.js` `kopukTemizle()`: ilçe komşuluk grafiğinden her parçanın bağlı bileşenleri bulunur, en büyüğü kalır, diğer kara bileşenleri en çok sınır paylaştığı komşu parçaya (aynı il) devredilir. Deniz adaları (kara komşusu olmayan) dokunulmaz. **25 ilçe devredildi**; artık Çanakkale-3 (Gökçeada+Bozcaada, gerçek ada) hariç kopuk kara parçası yok. Tüm illerde uygulanır.
- **Tam birleştirme (`BIRLESTIR`):** Rize Kaçkar Vadileri → Rize Kıyı; Muğla Bodrum → Menteşe-Milas. Birleşen parçanın nüfus/ekonomi payı hedefe eklenir. Toplam **193 parça**.
- **Kopuk-temizlikten muaf iller (`KOPUK_ISTISNA`):** Ankara (06). Sebep: Güney Bozkır (Polatlı+Haymana ile Bala+Şereflikoçhisar+Evren) bilerek tek parça ama ilçeleri kara olarak iki kümede; otomatik temizlik Polatlı/Haymana'yı Kuzeybatı'ya taşıyordu, Baki eski 5 parçalı hali istedi. Muaf iller belgedeki bölünmeyi aynen korur.
- **Önizleme = mobil oyun HUD'u (HOI4 tarzı):** `parca-onizleme-uret.js` — **tam ekran harita** (100dvh), sol üst başlık, **sağ altta DİKEY kontrol paneli** (İller/Arazi/Bölge + Adlar/Sınırlar/↺, düğmeler ~%20 küçük, alt alta), sol altta seçili parça bilgi kartı. İl sınırı beyazı yumuşak (opaklık .5). Boşluğa dokun→seçim kalkar.
  - **Renkler mat (savaş teması):** BOLGE_RENK doygunluğu düşürüldü, il tonlama doygunluk üst sınırı 52; hue'lar korundu, neon giderildi. 11'li ofset → komşu iller aynı renk çıkmaz.
  - **Kaydırma akıcılığı:** rAF throttle + gezerken il sınırı/etiket katmanları gizlenir + parçalarda `shape-rendering:optimizeSpeed` & `pointer-events:none` + **backdrop-filter blur kaldırıldı** (mobilde en büyük gizli maliyet).
  - **Harita sınırlama (`clampVb`):** dikdörtgen içinde ama her yönde oynama payı (yatay ~%9, dikey ~%22); sonsuz kaydırma yok.

### PARÇA — düzeltilen hata (İstanbul)

İstanbul Avrupa Yakası (34-2) haritada minik lekeye dönüşüyordu. Sebep: topojson `merge` çıktısındaki halkalar **kapalı değil** (ilk≠son nokta); `turf.polygon` bunu reddedince ada temizliği ana gövdeyi "0 alan" sanıp eliyordu. Çözüm: alan hesabında halka kapatılıyor (`alanKm2`). Ayrıca sadeleştirme artık **ilçe düzeyinde** yapılıp sonra birleştiriliyor (birleşik parçalardan ikinci topoloji kurmak karmaşık geometrileri bozuyordu).

### Bilinen/açık nokta

- İl grafiği geometriden geldiği için birkaç **kısa/tartışmalı il sınırı** eksik olabilir (ör. İstanbul–Kırklareli, Kilis–Hatay). Bu, parça komşuluğuna da yansır (o illerin parçaları komşu görünmeyebilir). Tasarım belgesi İstanbul için Kırklareli'yi komşu sayıyor. Gerekirse il grafiğine elle eklenip parçalara yansıtılabilir. Baki'ye bildirildi.

## İL STATLARI (Adım 4 / Görev 02 Adım 4)

_(ÜRETİLDİ — ayrıntı aşağıdaki "Görev 02 / Adım 4" kaydında.)_

---

# GÖREV 02 — KARARI SABİTLE, İL STATLARINI ÜRET

## Görev 02 / Adım 1 — Tasarım §7 güncellendi (parça temel birim)

**Tarih:** 2026-07-25

**Karar:** Parça, oyunun temel birimidir; bu kesinleşti, geri dönülmeyecek. Sebep: parça belgesi her parçaya kendi arazisini ve payını veriyor, arazi muharebe çarpanına giriyor (tasarım §3.5) — muharebenin hangi parçada geçtiği hesaba girdiği için parça haritada gerçek bir bölge olmak zorunda. Tasarım §7 buna göre güncellendi.

**§7'nin ESKİ hali (değişiklikten önce, iz olarak saklanıyor):**

> - Haritada **yalnızca iller** görünür — her il tek tıklanabilir bölge.
> - Her ilin yüzölçümü + nüfus yoğunluğuna göre **1–5 arası "parça"** sayısı vardır (Yalova 1, Ankara 5).
> - Parça = görünmez bir **kontrol çubuğu**. Ankara'yı almak için 5 kez, Yalova'yı almak için 1 kez galip gelmek gerekir.
> - Çubuk 0'a inince il tamamen el değiştirir; nüfusunun **%60'ı** fatihe geçer, sınır bağlantıları fatihe devrolur (cephe içeri genişler).
> - Ekstra harita çizimi gerekmez.
> - **Komşuluk grafiği:** 81 il, kara sınırı esaslı, simetrisi programatik doğrulanmış. Mevcut projeden aynen taşınır. Bir il yalnızca sınırdaşına saldırabilir.

**Ne değişti:** "Görünmez kontrol çubuğu" kavramı kaldırıldı; yerini gerçek parça fetihleri aldı. İl artık gruplama + stat taşıma katmanı. Komşuluk kuralı il yerine parça komşuluğuna dayanıyor.

## Görev 02 / (Adım 1 sonrası) — Kod & veri kontrol sistemi kuruldu

**Tarih:** 2026-07-25. Baki'nin isteği: kod bug'a/spagettiye kaçmasın.

Kurulan katmanlar (tek komut: `npm run kontrol`, kılavuz: `docs/KONTROL.md`):

- **`scripts/veri-dogrula.js`** — veri/ JSON'larının değişmez kurallarını denetler: 81 il / 193 parça, kod 01–81 eksiksiz, arazi ∈ {ova,tepelik,daglik}, bölge ∈ 7 bölge, **her ilin parça payları toplamı = 1.0** (il-statı×pay formülünün temeli), çizim yolu geçerli (NaN yok), komşuluk simetrisi/tekrarı/izole/kendine-komşuluk. `iller.json` ve `komsuluk.json` henüz yoksa "NORMAL" der (Görev 02 çıktısı). Hata varsa çıkış kodu 1.
- **ESLint** (flat config, `eslint.config.js`, `eslint-config-expo`) — gerçek kod hataları. `caughtErrors:'none'`, `_` önekli değişkenler yok sayılır. Biçim kuralları `eslint-config-prettier` ile kapatıldı.
- **Prettier** (`.prettierrc.json`, tek tırnak/2 girinti/100 satır) — `src/` + `scripts/` biçimlenir; `docs/` ve `veri/` biçimden muaf (`.prettierignore`).
- **`scripts/kontrol.js`** — üçünü çalıştırıp Türkçe ÖZET verir. Araçlar doğrudan `node <bin>` ile çağrılır (Windows'ta `npx.cmd` spawn sorununu atlar).

devDeps eklendi: eslint, eslint-config-expo, prettier, eslint-config-prettier. package.json betikleri: `kontrol`, `veri-dogrula`, `lint`, `bicimle`. İlk çalıştırma tertemiz (0 hata/uyarı); bu sırada 3 ölü değişken (harita-uret OUT_HTML; parca-tablo beklenenParca, sapan) temizlendi, Harita.js'teki reanimated hook uyarısı gerekçeli susturuldu, kod bir kez Prettier'den geçirildi.

## Görev 02 / Adım 3 — 195/193 farkı çözüldü

**Tarih:** 2026-07-25

Parça belgesi (v2) tasarımda **195** parça hedefliyordu; üretilen veri **193**. Fark, `scripts/parca-uret.js`'teki `BIRLESTIR` ayarındaki **iki birleştirmeden** geliyor (Baki'nin Görev 01 sırasındaki geri bildirimleriyle yapılmıştı, o an kalıcı gerekçelendirilmemişti — şimdi kayda geçti):

| # | Kaynak parça (silinen) | Hedef parça | İl | İlçe(ler) | Gerekçe |
|---|---|---|---|---|---|
| 1 | `53-2` Kaçkar Vadileri (Dağlık) | `53-1` Rize Kıyı | Rize | Güneysu, Kalkandere, İkizdere, Çamlıhemşin, Hemşin | Baki'nin tercihi: Rize küçük bir il, tek parça tutulsun. **Not:** burada arazi kontrastı (Dağlık↔Tepelik) VAR — belgenin "kontrast varsa aç" kuralına uymayan tek istisna. Baki onayı isteniyor. |
| 2 | `48-2` Bodrum (Tepelik) | `48-1` Menteşe-Milas | Muğla | Bodrum | Bodrum ile Menteşe-Milas aynı arazi (Tepelik) → belgenin kendi kuralı gereği ayrı parça olmayı hak etmiyordu. İlkeyle tutarlı. |

**Pay aktarımı** (birleşen parçanın payı hedefe eklenir, `parca-uret.js` satır ~480):
- Rize Kıyı: 0.72+0.28 = **1.00** nüfus, 0.74+0.26 = **1.00** ekonomi (Rize tek parça, tüm il).
- Menteşe-Milas: 0.30+0.20 = **0.50** nüfus, 0.30+0.24 = **0.54** ekonomi.

**Belge güncellendi** (`docs/il-savasi-parca-bolumleme-v2.md`): toplam 195→**193**; Muğla 4→3 ve Rize 2→1 bölümleri; bölge tablosu (Ege 24→23, Karadeniz 35→34); arazi tablosu (Tepelik 57→56, Dağlık 62→61, oranlar %39/%29/%32 sabit); "Karadeniz dağlık 15→14". Belge ile veri artık aynı sayıyı söylüyor. `veri-dogrula.js` de 193'ü meta ile karşılaştırıp geçiyor.

## Görev 02 / Adım 4 — `veri/iller.json` üretildi (81 il × 8 stat)

**Tarih:** 2026-07-25. Üretici: `scripts/iller-uret.js` (ham veri betiğin içinde, tekrar üretilebilir). Doğrulama: `veri-dogrula.js` geçiyor (81 il, kod 01–81, statlar 1–10 tam sayı, parçaSayisi toplamı 193).

**Stat başına yöntem ve kaynak:**

| Stat | Tür | Yöntem / kaynak |
|---|---|---|
| **nüfus** | GERÇEK | TÜİK ADNKS **2023** il nüfusu. Logaritmik ölçek: `1 + 9·(ln n − ln n_min)/(ln n_max − ln n_min)`, yuvarlanır (İstanbul=max→10, Bayburt=min→1). Kaynak: Wikipedia "Provinces of Turkey by population" (TÜİK türevi), 2026-07-25 çekildi. |
| **ekonomi** | GERÇEK | **Toplam GSYİH = nüfus × kişi başı GSYİH (2024, TL)**. Aynı logaritmik ölçek. Kişi başı GSYİH kaynağı: Wikipedia "List of Turkish provinces by GDP" (TÜİK), 2026-07-25 çekildi. |
| **arazi** | GERÇEK | `parcalar.json`'dan: ilin parçalarının **ekonomi payına göre ağırlıklı baskın arazisi** (ova/tepelik/daglik). |
| **parcaSayisi** | GERÇEK | `parcalar.json`'dan sayılır (toplam 193). |
| **egitim** | TAHMİN | Kişi başı gelirden türetilen gelişmişlik indeksi (doğrusal 1–10). |
| **altyapi** | TAHMİN | 0.55·gelişmişlik + 0.45·nüfus statı. |
| **sanayi** | TAHMİN | 0.45·nüfus + 0.45·gelişmişlik + elle "sanayi katsayısı" (bilinen sanayi illeri +, tarım/doğu illeri −; katsayılar `iller-uret.js` `SANAYI_BONUS`). |
| **moral** | TAHMİN | Gelişmişlik etrafında hafif yayılım (`5 + (gelişmişlik−5.5)·0.5`). |

> **Eğitim, sanayi, altyapı ve moral statları ilk taslaktır. Gerçek veriye değil tahmine dayanır. Oyun dengesi test edilirken elle ayarlanacaktır.**

**Neden logaritmik:** İstanbul (~15.7M) ile en küçük il (Bayburt ~86K) arası ~180 kat. Doğrusal ölçekte İstanbul 10, ikinci il ~3, kalan 79 il 1'e ezilirdi. Logaritmik ölçekte dağılım: nüfus→ İstanbul 10, Ankara/İzmir 8, orta iller 3–5, küçük iller 1–2. Ekonomide de aynı (İstanbul toplam GSYİH açık ara önde).

**Elle ayarlanabilir yerler:** stat formülleri ve `SANAYI_BONUS` haritası `iller-uret.js` içinde; ham nüfus/gelir de orada (`HAM`). Değer değişince `node scripts/iller-uret.js` yeniden üretir, `npm.cmd run kontrol` doğrular.

## Görev 02 / Adım 5 — `veri/komsuluk.json` üretildi (il komşuluğu)

**Tarih:** 2026-07-25. Üretici: `scripts/komsuluk-uret.js`. **81 il, 199 komşuluk çifti, 0 izole.**

**Yöntem:** Temel birim parça olduğu için il komşuluğunu doğrudan **parça komşuluğundan türettim** (iki ilin herhangi iki parçası komşuysa iller komşudur) — böylece `parca-komsuluk.json` ile tutarlı. Bu, deniz geçişlerini de kapsar (İstanbul Boğazı, Çanakkale Boğazı, İzmit Körfezi zaten parça grafiğinde).

**Elle eklenen 2 kısa sınır** (`EK_KOMSU`): **İstanbul–Kırklareli (34–39)** ve **Kilis–Hatay (79–31)**. Geometri temelli grafik bu kısa temasları kaçırıyordu (memory ve Görev 01 §3'te öngörülmüştü); ikisi de gerçek kara sınırıdır. Eklendikten sonra Görev tanımı §5'teki 6 elle kontrol örneğinin **hepsi tutuyor** (Yalova, Kilis, Bartın, Rize, İstanbul, Sinop) ve `veri-dogrula.js` simetri/tekrar/izole/kendine-komşuluk kontrollerinden geçiyor.

**Rolü:** Oyun kuralı DEĞİL (saldırı kuralı parça komşuluğu). Kullanımı: uzak-zoom il gösterimi + parça verisi değişirse çapraz kontrol.

## Görev 02 / Adım 6 — Panel birleştirildi (parça + il)

**Tarih:** 2026-07-25. Dosyalar: `src/bilesenler/IlPaneli.js` (yeniden yazıldı), `src/App.js` (iller.json yüklendi, il+komşu listesi panele geçiriliyor, panel açıkken HUD gizleniyor), `src/tema.js` (`ARAZI_CARPAN` eklendi).

Bir parçaya dokununca alttan açılan panel (bottom sheet, ScrollView, %54 maks yükseklik):
- **Parça bölümü:** parça adı + bağlı il, arazi + savunma çarpanı (§3.5: ova ×1.00 / tepelik ×1.15 / dağlık ×1.35), il içindeki nüfus/ekonomi payı (%).
- **Türetilmiş satır** (mavi kutu, oyunun ana formülü): "Bu parçayı alırsan {il} ilinin nüfusunun %X'ini, ekonomisinin %Y'sini kazanırsın" — X,Y = parça payı × 100.
- **İl bölümü:** ad · kod · bölge; 6 stat (nüfus/ekonomi/eğitim/sanayi/altyapı/moral) sayı + çubuk grafik; parça sayısı + "bu ili tamamen almak için N parçasının hepsini almalısın".
- **Komşu parçalar:** çip listesi, dokununca o parçaya geçilir (`onKomsuSec` → seçim değişir).
- **Kapatma:** × düğmesi veya haritanın boş yerine dokunma (parça seçimi kalkar). Not: aşağı-kaydırıp-kapatma (swipe) EKLENMEDİ — ScrollView ile jest çakışmasını önlemek ve cihazsız test riskini azaltmak için; istenirse eklenir.

**Doğrulama:** `npm.cmd run kontrol` temiz; `npx.cmd expo export` ile Android bundle hatasız derlendi (1093 modül). **Cihazda görsel/dokunma testi Baki'de (Adım 2 ile birlikte).**

## Görev 03 / Adım 0 — Belge senkronu + altyapı statı kaldırıldı

**Tarih:** 2026-07-25. Kaynak: `docs/GOREV-03-ekonomi-v2.md` §3 (Baki'nin 23 Temmuz 2026 tasarım oturumundaki dört kararı) ve §7 Adım 0.

### Dört karar — nereye ne işlendi

| Karar | Ne değişti | Dokunulan yerler |
|---|---|---|
| **1 — Sabit maç süresi kalktı, mod sistemi geldi** | "Hedef maç süresi 20–30 dakika" silindi; yerine **§8.1** mod tablosu (Bölge savaşı / Türkiye / Serbest). İki sonucu da yazıldı: kayıt/yükleme **çekirdek özellik**, asenkron çevrimiçi **v1.5**. | tasarım §8 (yeni §8.1), §12.3, §12.4, §13.1, §13.3 |
| **2 — Oran seçici kalktı, doğrudan birim satın alma geldi** | §4.2 yeniden yazıldı (bütçe + `[−] n [+]` satırları, bütçe bitince `[+]` pasif). §4.3 (\"statlar harmanlanmamalıdır\") **tamamen silindi** — o uyarı oran seçiciye özeldi. §4.5 tablosunun **statüsü** değişti: kural değil, beklenen sonuç + YZ referansı. | tasarım §4.2, §4.3 (silindi), §4.5, §8 madde 3, §13.3, §15 madde 3 ve 8, sözlük ("Tarif (recipe)" satırı silindi) |
| **3 — Altyapı statı kalktı** | 8 stat → **7 stat**. Veri, üretici betik, doğrulayıcı ve panel temizlendi. | tasarım §5 (başlık + numaralandırma), §3.8, §7, §13.3; `scripts/iller-uret.js`, `scripts/veri-dogrula.js`, `veri/iller.json`, `src/bilesenler/IlPaneli.js` |
| **4 — Parça haritada fiziksel bölgedir** | Görev 02 Adım 1'de zaten işlenmişti (§7). Bu turda ek değişiklik yok. | — |

**Numaralandırma notu:** §4.3 silindi ama **§4.4 ve §4.5 numaraları korundu** (yeniden numaralandırılmadı). Sebep: görev belgeleri bu bölümlere numarayla atıf yapıyor (ör. GOREV-03 §11 → "garnizon/sefer bölüşümü (§4.4)"). Belgede §4.3'ün yerinde tek satırlık bir açıklama duruyor.

### Silinen metinlerin arşivi

**Eski §4.2 — "Tarif (oran) sistemi — üretim akışı":**

> 1. Oyuncu **oran seçicide** karışımı belirler (üçgen seçici: piyade / topçu / zırhlı).
> 2. Arayüz birim başına nüfus + ekonomi bedelini gösterir.
> 3. Bütçenin yettiği kadar birim basılır.
>
> Ucuz tarif → çok birim. Pahalı tarif → az ama sert birim.

**Eski §4.3 — "⚠ KRİTİK UYGULAMA NOTU":**

> **Statlar HARMANLANMAMALIDIR.** Tek bir birimin statlarını ortalamak (%50 piyade + %50 zırhlı → Zırh 8 yerine 5) zırhın koruma eşiğini yok eder ve zırhlıyı işlevsizleştirir. Test: harmanlı modelde ucuz piyade tarifi her şeyi eziyor (12 birim vs 8 birim → 4.86-0.00 blowout).
>
> **Doğru uygulama:** Oran sadece **arayüzdedir**. Motor, oranı tipli birimlere çevirir. ("%60/%20/%20 oranıyla 5 birlik bas" → 3 piyade + 1 topçu + 1 zırhlı.) Kullanıcı deneyimi aynı (tek oran seçici), matematik doğru çalışır.

**Eski §5 madde 6:** "**Altyapı / ulaşım** → hareket menzili, takviye hızı".

### Altyapı verisi ne zaman ve nasıl silindi

- **2026-07-25**, `scripts/iller-uret.js` içindeki `altyapi = round(0.55·gelişmişlik + 0.45·nüfus)` formülü kaldırıldı, betik yeniden çalıştırıldı → `veri/iller.json` **81 il, 5 sayısal stat** (nüfus, ekonomi, eğitim, sanayi, moral) + `arazi` + `parcaSayisi` ile yeniden üretildi. Diğer statların değerleri **değişmedi** (altyapı hiçbir formüle girmiyordu).
- `scripts/veri-dogrula.js`: `STAT_ALANLARI` listesinden `altyapi` çıkarıldı **ve yeni bir kontrol eklendi** — statlar içinde tanınmayan bir alan kalırsa (ör. eski `altyapi`) doğrulama hata verir. Böylece "artık kaldı mı" sorusu `npm run kontrol` ile cevaplanır.
- `src/bilesenler/IlPaneli.js`: panelde 6 stat çubuğu vardı → **5 çubuk** (altyapı satırı gitti). Arazi zaten parça bölümünde, parça sayısı panelin altında gösteriliyor; tasarım §5'in 7 statının tamamı ekranda karşılığını buluyor.

### Sahte / yer tutucu alan envanteri (Adım 0d)

Görev 02'de kurulan arayüzde gerçek hesaba bağlı **olmayan** alanların tam listesi. Adım 6'da hepsi ya gerçeğe bağlanacak ya kaldırılacak.

| # | Yer | Alan | Şu anki hali | Adım 6 planı |
|---|---|---|---|---|
| 1 | `TurCubugu.js` | Para: **"₺ 1.240"** | Sabit metin, hiçbir yerden gelmiyor | **Bağlanacak** → ekonomi havuzu (tam sayıya yuvarlanmış). "₺" işareti kalkar, "ekonomi" olur |
| 2 | `TurCubugu.js` | Gelir: **"+180"** | Sabit metin | **Bağlanacak** → tur geliri (+X nüfus / +Y ekonomi) |
| 3 | `TurCubugu.js` | Asker: **"24 asker"** | Sabit metin | **KALDIRILACAK** — ordu Görev 04'te geliyor, o zamana kadar ekranda asker sayısı olmamalı. Yerine nüfus havuzu gelecek |
| 4 | `TurCubugu.js` | Tur sayacı **"TUR 01"** | Bileşenin kendi içinde `useState`; oyun durumu yok | **Bağlanacak** → `oyunDurumu.tur` |
| 5 | `TurCubugu.js` | **"TURU BİTİR"** düğmesi | Sadece yerel sayacı 1 artırıyor, başka hiçbir şey olmuyor | **Bağlanacak** → tur döngüsü (gelir hesapla → havuza ekle → geçmişe yaz → tur +1) |

**Sahte olmayan (kontrol edildi, gerçek veriye bağlı):** `IlPaneli` parça adı/il/arazi, savunma (arazi → §3.5 çarpanı), "önem" nokta göstergesi (parçanın gerçek nüfus+ekonomi payından), il statları (`iller.json`), parça sayısı, komşu çipleri (`parca-komsuluk.json`); `Harita.js`'te sahte veri yok.

**Eksik HUD alanları (Adım 6'da eklenecek, şu an hiç yok):** parça sayısı "12 / 193", tam il sayısı "3 il".

## Görev 03 / Adım 1 — Denge dosyası + tohumlu rastgelelik

**Tarih:** 2026-07-25. Yeni dosyalar: `src/denge.js`, `src/oyun/rastgele.js`, `testler/` (yardimci.js + calistir.js + rastgele.test.js).

### `src/denge.js` — tek denge kaynağı

Kural: **oyun dengesini etkileyen hiçbir sayı koda gömülmez.** Başlangıç içeriği (Görev 03 §7 Adım 1):

| Sabit | Değer | Anlamı |
|---|---|---|
| `URETIM_CARPANI` | **1** | Tur başına gelir çarpanı (§6.3). Gelir = parça payı × ilin statı × çarpan. 1 = tasarımdaki temel hız; §4.5'teki birikmiş bütçelere birkaç turda ulaşılır. |
| `GELISTIRICI_MODU` | `true` | Adım 8'deki sahiplik test aracını açar. Yayın sürümünde `false`. |
| `TUR_GECMISI_UZUNLUGU` | 50 | Kaç turluk gelir kaydı tutulacak. |

Dosyanın başında **tasarım §14'teki denge düğmelerinin tamamı yorum olarak listeli** — hangi görevde hangi sabitin buraya geleceği belli (Görev 04: birim maliyetleri, toplanma indirimi; Görev 05: hafif vuruş böleni 12, zırh sönüm böleni 40, isabet tabanı 0.55/böleni 20, zırhlı dayanıklılık 24, dağlık zırhlı cezası 0.50, moral böleni 2, şans bandı %10; fetih nüfus oranı 0.60).

### `src/oyun/rastgele.js` — tohumlu üreteç

**Algoritma: mulberry32.** Seçim gerekçesi: durumu **tek bir 32-bit sayı** (kayıt dosyasına bir alan olarak sığar), kısa ve hızlı, tekrarlanabilirliği tam. Kriptografik güvenlik aranmadı — gereken tekrarlanabilirlik (Görev 03 §6.5).

**Tohum yaklaşımı:** Tohum `oyunDurumu.rastgele.tohum`'da, üretecin o anki hali `oyunDurumu.rastgele.durum`'da saklanır (Adım 2'de kurulacak yapı). Yeni oyunda `durum = tohum`. Her turda/kayıtta `durumAl()` ile alınıp duruma yazılır; yüklerken `rastgeleKur(tohum, durum)` ile kaldığı yerden devam eder.

**API:** `rastgeleKur(tohum, durum?)` → `{ tohum, sonraki(), aralik(min,max), tamsayi(min,max), durumAl(), durumuYukle(d) }`, ayrıca `yeniTohum()` (yalnızca yeni oyun kurarken, `Date.now()` tabanlı).

**`Math.random()` yasağı:** Oyunun her rastgele sayısı bu modülden geçecek. Bu kural sonradan uygulanamaz — rastgelelik koda dağılırsa hepsini bulmak gerekir (asenkron çok oyunculu v1.5 için şart).

### Test altyapısı — `npm run test`

Dışarıdan kütüphane **kurulmadı** (jest yok). `testler/yardimci.js` küçük bir doğrulama yardımcısı, `testler/calistir.js` klasördeki her `*.test.js` dosyasını çalıştırıp Türkçe ✓/✗ özet basıyor. Node 26, ESM yazılmış `src/` dosyalarını `require` ile doğrudan okuyabildiği için ek derleme adımı gerekmedi.

**`npm run kontrol` artık dört adım:** veri → kod (ESLint) → biçim (Prettier) → **testler**. Yani bir şey bozulursa tek komutta görünür.

**Adım 1 testleri (10/10 geçti):** aynı tohum ilk 100 sayıda birebir aynı (görevin istediği doğrulama) · farklı tohum farklı dizi · sayılar 0–1 arasında · 20.000 sayının ortalaması ~0.5 · **kaydet/yükle: durum yüklenince dizi kaldığı yerden devam ediyor** · `durumuYukle` ile geri sarma · durum tek sayı (kayda sığar) · `tamsayi(1,6)` sınır içinde ve 6 yüzü de üretiyor · `aralik(0.9,1.1)` sınır içinde (§3.6 şans bandı) · `yeniTohum()` geçerli tohum.

## Görev 03 / Adım 2 — Oyun durumu + senaryo kapsamı

**Tarih:** 2026-07-25. Yeni dosyalar: `src/oyun/oyunDurumu.js`, `src/oyun/senaryolar.js`, `src/oyun/veri.js`, `testler/oyunDurumu.test.js`. Değişen: `src/denge.js` (SENARYO ayarı), `src/tema.js` (`aktorRengi`, `KAPSAM_DISI_SOLUKLUK`), `src/App.js`, `src/bilesenler/Harita.js`.

### Oyun durumu — tek merkezi yapı

`oyunKur({ senaryo, tohum, oyuncuAktorId })` şu yapıyı üretir (Görev 03 §7 Adım 2'deki taslağın birebir aynısı): `surum`, `tur`, `senaryo{anahtar, ad, kapsamIller, kapsamParcalar}`, `rastgele{tohum, durum}`, `oyuncuAktorId`, `aktorler{}`, `parcaSahipligi{}`, `turGecmisi[]`.

- **Sahiplik yalnızca parçada** (§6.2). "İlin sahibi" alanı YOK; bir ilin kime ait olduğu parçalardan türetilir. İki kaynak tutulmadığı için çelişme ihtimali sıfır.
- **Havuzlar kesirli** saklanır (§6.4), başlangıçta 0.
- Taslakta olmayan tek ek alan: `senaryo.anahtar` (`turkiye`/`karadeniz`). Gerekçe: yüklenen kaydın hangi senaryo olduğunu koddan sormak gerekiyor; `ad` görünen isim, `anahtar` kimlik.
- **Aktör türü** alanı `tur: 'insan' | 'yapayZeka'` — oyuncunun ili insan, diğerleri yapay zekâ (yapay zekâ mantığı bu görevde YOK, sadece etiket).

### Senaryolar

| Anahtar | Ad | Kapsam | Varsayılan oyuncu |
|---|---|---|---|
| `turkiye` | Türkiye | 81 il, **193 parça** | Bursa (16) |
| `karadeniz` | Karadeniz | 18 il, **34 parça** | Samsun (55) |

Kapsam, `iller.json`'daki `bolge` alanından süzülerek hesaplanır; parçalar illerden türetilir (ayrı liste tutulmaz, tutarsızlık kaynağı olmasın).

> **BELGE FARKI:** `GOREV-03-ekonomi-v2.md` Karadeniz için **35 parça** diyor, gerçek veri **34**. Sebep bilinen ve kayıtlı: Görev 02'de Rize 2 parçadan 1'e indirildi (`53-2` → `53-1`, Baki'nin tercihi) ve toplam 195→193 oldu. Karadeniz bölgesi de 35→34'e düştü. Veri doğru, görev belgesindeki sayı eski. Kod hiçbir yere sabit sayı yazmıyor, veriden sayıyor.

### Senaryo nasıl değiştirilir

`src/denge.js` içindeki `SENARYO: 'turkiye'` satırı. `'karadeniz'` yazılıp uygulama yenilenince oyun 18 ile daralır. **Mod seçim ekranı bu görevde yok** (§7 Adım 2 sınırı).

### Kapsam dışı parçalar

Harita 81 ilin tamamını çizmeye devam eder; senaryo dışındaki parçalar **soluk** görünür (`tema.js` `KAPSAM_DISI_SOLUKLUK = 0.22`) ve **dokunmaya cevap vermez** (`Harita.js` hem çizimde hem vuruş testinde kapsamı kontrol ediyor). Panelde komşu listesi de kapsama göre süzülür — gidilemeyecek yer çip olarak gösterilmez.

### Aktör rengi

`tema.js`'e `aktorRengi(ilHaritaRengi)` eklendi; ilin haritadaki askeri tonlu rengini döndürür. Böylece panelde "Sahibi: Bursa ●" yazan renk ile haritadaki Bursa rengi birebir aynı olur (Adım 7'de kullanılacak).

### Teknik not — `src/oyun/veri.js` neden CommonJS

Oyun mantığı testleri Node ile çalışıyor; Node, ESM dosyalarda JSON'u içe aktarmak için fazladan sözdizimi istiyor ve uzantısız `import`'u kabul etmiyor. Çözüm: veri okuma tek dosyaya (`src/oyun/veri.js`, CommonJS) alındı — hem Metro (telefon) hem Node aynı dosyayı okuyor. Ayrıca `src/oyun/` içindeki içe aktarmalar `.js` uzantılı yazılıyor. **Doğrulandı:** `npx expo export --platform android` 1108 modülü hatasız paketledi (4.7 MB).

**Adım 2 testleri (14 test, hepsi geçti):** Türkiye 81 il/193 parça/81 aktör · Karadeniz 18 il/34 parça/18 aktör · Karadeniz illerinin bölgesi doğru · her parçanın sahibi kendi ili · **kapsam dışı sızıntı yok** (Antalya parçaları Karadeniz oyununda hiç yok) · aktörün parça sayısı `iller.json` ile tutarlı · oyuncu "insan", diğerleri "yapayZeka" · havuzlar 0 / tur 1 / sürüm var · tohum durumu · aktör renkleri geçerli · **durum JSON gidiş-dönüşünde birebir aynı** · **geometri sızmamış, boyut 50 KB altı** · aynı tohum aynı oyun · bilinmeyen senaryo anlaşılır hata veriyor.

## Görev 03 / Adım 3 — Üretim hesabı

**Tarih:** 2026-07-25. Yeni dosyalar: `src/oyun/uretim.js`, `testler/uretim.test.js`.

### Formül (tasarım §4.1 / Görev 03 §6.3)

```
parçanın tur başına getirisi:
    nüfus   = parçanın nüfus payı   × ilinin nüfus statı   × URETIM_CARPANI
    ekonomi = parçanın ekonomi payı × ilinin ekonomi statı × URETIM_CARPANI

aktörün geliri = elinde tuttuğu parçaların toplamı
```

`URETIM_CARPANI = 1` (`src/denge.js`). Çarpan **her hesapta denge dosyasından okunur**, hiçbir yere kopyalanmaz — değeri değiştirince tüm oyun anında değişir.

**Fonksiyonlar:** `parcaGeliri(parcaId)` (sahipten bağımsız — "bu parçayı alırsan" satırı da bunu kullanacak), `aktorGeliri(durum, aktorId)`, `tumGelirler(durum)` (tur döngüsü için tek geçiş), `ilGeliri(durum, ilKodu, aktorId)` (panel için: o ilden gelen gelir + kaç/kaç parça).

**Kesirli döner, yuvarlanmaz** (§6.4). Yuvarlama yalnızca ekranda yapılacak (Adım 6).

### Gerçek sayılar (başlangıç durumu, çarpan 1)

| Aktör | Tur başına |
|---|---|
| İstanbul | +10.00 nüfus / +10.00 ekonomi |
| Bursa | +7.00 / +7.00 |
| Samsun | +6.00 / +5.00 |
| Bayburt | +1.00 / +1.00 |
| *tek parça:* Bursa Ovası (16-1) | +3.85 / +3.64 |
| *tek parça:* Uludağ Güneyi (16-4) | +0.28 / +0.28 |

> **BELGE FARKI:** Görev belgesindeki örnek "Bursa'nın nüfus statı 8 → Bursa Ovası 4.4" diyor. `iller.json`'da Bursa'nın nüfus statı **7**, dolayısıyla Bursa Ovası **3.85** getiriyor. Formül birebir belgedeki formül; farklı olan yalnızca örnekteki stat değeri (belge yazılırken varsayılmış sayı). Testler veriden okunan gerçek değerle yazıldı.

### Altı doğrulama testi — hepsi geçiyor

| # | Test | Nasıl doğrulandı |
|---|---|---|
| 1 | Tam sahiplik | **81 ilin hepsi** için: tüm parçaları elindeyken gelir = ilin statı × çarpan |
| 2 | Kısmi sahiplik | Bursa Ovası tek başına = 0.55 × 7 = **3.85** |
| 3 | Sıfır sahiplik | Bursa'nın tüm parçaları alınınca geliri 0 (tekil ve toplu hesapta) |
| 4 | **Toplam korunumu** | Üç dağılımda da toplam sabit: başlangıç · **193 parça rastgele karıştırılmış** · hepsi tek aktörde |
| 5 | Kapsam dışı sızıntı | Karadeniz oyununda Antalya parçaları hiçbir toplama girmiyor; Samsun'un geliri senaryoya göre değişmiyor |
| 6 | Kesir korunumu | 3.85 gelirli aktör 10 turda **38.5** biriktiriyor (40 veya 30 değil) |

Ek olarak `ilGeliri` testi: Bursa'nın 4 parçası da elindeyken tam stat; en büyük parçası (0.55) alınınca kalan 3 parça 7 × 0.45 getiriyor.

**Toplam test sayısı: 31** (`npm run test`, `npm run kontrol` içinde de çalışıyor).

## Görev 03 / Adım 4 — Tur döngüsü

**Tarih:** 2026-07-25. Yeni dosyalar: `src/oyun/turDongusu.js`, `src/bicim.js`, `testler/turDongusu.test.js`. Değişen: `src/bilesenler/TurCubugu.js` (yeniden yazıldı), `src/App.js`.

### Döngü

`turuBitir(durum)` → **yeni** bir durum döndürür (geleni değiştirmez; arayüzün tazelenmesi buna bağlı):

1. Her aktörün geliri hesaplanır (`tumGelirler`, tek geçiş) ve havuzuna **kesirli** eklenir
2. Biten tur geçmişe yazılır
3. Tur sayacı 1 artar

Tasarım §8'in kalan yedi aşaması (araştırma, takviye, toplanma, hareket, çözüm, diplomasi, sıra) dosyanın başında yorum olarak sıralı duruyor — hangi aşamanın hangi görevde ekleneceği belli. **Şimdilik tüm aktörler aynı anda üretir**; sıra sistemi yapay zekâ geldiğinde kurulacak.

**Tur geçmişi kapsamı:** Görev taslağındaki satır yapısı (`{tur, aktorId, nufus, ekonomi}`) korundu ama her tur **yalnızca oyuncunun satırı** yazılıyor. Gerekçe: 81 aktör × 50 tur = 4050 satır kayıt dosyasını ~200 KB'a çıkarırdı ve §6.6'daki "birkaç on KB" sınırını deler. Geçmişin işi "geçen tur ne kazandım" sorusunu cevaplamak; oyuncu satırı bunu karşılıyor. Yapay zekâ hata ayıklaması için ileride genişletilebilir (satır yapısında `aktorId` zaten var). Sayılar iki haneye kısaltılıyor — havuzun kendisi tam kesirli, geçmiş yalnızca bilgi.

### Arayüz — tur çubuğu gerçeğe bağlandı

Adım 0d'deki sahte alan listesinin **beşinden dördü kapandı**:

| Sahte alan | Yeni hali |
|---|---|
| `₺ 1.240` | **Ekonomi havuzu** (gerçek, aşağı yuvarlanmış) |
| `+180` | **Tur geliri** (gerçek, yeşil) |
| `24 asker` | **KALDIRILDI** — yerine nüfus havuzu + geliri. Ordu Görev 04'te gelecek. |
| `TUR 01` (yerel sayaç) | `oyunDurumu.tur` |
| `TURU BİTİR` (sahte) | Gerçek tur döngüsünü çalıştırıyor |

Kalan (Adım 6'da eklenecek): parça sayısı "12 / 193" ve tam il sayısı "3 il".

`src/bicim.js` — ekranda sayı gösterme kuralları tek yerde: **havuz aşağı yuvarlanır** (oyuncuya elinde olmayan kaynağı göstermemek için), **gelir** tam sayıysa düz (`+7`), kesirliyse tek haneli (`+3.9`). Oyun başında iller bölünmemiş olduğu için gelirler tam sayıdır.

**Adım 4 testleri (10 test):** tur sayacı artıyor · her aktörün havuzu kendi geliri kadar artıyor · **eski durum değişmiyor** (yeni nesne dönüyor) · 10 turda 3.85 × 10 = 38.5 (yuvarlanmıyor) · sahiplik sabitken artış her tur aynı · **sahiplik değişince gelir anında düşüyor** (Bursa 7 → 3.15) · geçmiş biten turun gelirini yazıyor · geçmiş 50 turda kalıyor, en eskisi düşüyor · 60 tur sonra durum hâlâ 50 KB altı · aynı tohumla iki oyun 20 tur sonra birebir aynı.

**Toplam test: 41.** `npx expo export --platform android` hatasız (4.71 MB).

## Görev 03 / Adım 5 — Kayıt ve yükleme

**Tarih:** 2026-07-25. Yeni dosyalar: `src/oyun/kayit.js`, `src/oyun/kayitVerisi.js`, `src/bilesenler/GelistiriciCubugu.js`, `testler/kayit.test.js`. Değişen: `src/App.js`. Yeni bağımlılık: `@react-native-async-storage/async-storage` **2.2.0** (`npx expo install` ile SDK 54'e uygun sürüm; Expo Go içinde hazır gelen paketlerden).

### Neden iki dosya

- `kayitVerisi.js` — **cihazdan bağımsız**: durumu metne çevirme, metinden geri okuma, sürüm ve alan doğrulaması. Telefon olmadan test edilebilsin diye ayrıldı.
- `kayit.js` — yalnızca depolama (AsyncStorage), tek anahtar: `ilsavasi.kayit.tek`. **Tek kayıt yuvası** (§7 Adım 5 sınırı).

### Kayıt yapısı ve boyut

Kayıt = oyun durumunun kendisi (düz veri, §6.6). Ek bir biçim yok; `surum` alanı durumun içinde.

| Oyun | Kayıt boyutu |
|---|---|
| Türkiye, 10 tur oynanmış | **12.9 KB** |
| Karadeniz, yeni | 2.7 KB |

Geometri kayda hiç girmiyor (parça kimlikleri yazılıyor, şekilleri değil) — testler `"yol"` alanının kayıtta olmadığını her seferinde kontrol ediyor.

### Bozuk kayıt davranışı

Yükleme **asla oyunu çökertmez**; `metinCoz` her durumda `{ok, hata}` döndürür ve geliştirici çubuğunda Türkçe mesaj görünür: bozuk JSON, boş kayıt, eksik alan (sürüm/aktör/sahiplik/oyuncu), ileri sürümlü kayıt ("bu kayıt oyunun daha yeni bir sürümünden"). Sürüm alanı bugün tek işe yarıyor: yarın yapı değişince eski kayıtları çevirecek dönüşüm zinciri buraya bağlanacak.

### Arayüz

`GelistiriciCubugu` — ekranın **alt ortasında**, kırmızı çerçeveli, "GELİŞTİRİCİ" etiketli küçük çubuk: KAYDET / YÜKLE + durum mesajı ("Kaydedildi · tur 8 · 12.9 KB"). Yalnızca `DENGE.GELISTIRICI_MODU` açıkken görünür, yayın sürümünde tamamen kaybolur. Adım 8'deki sahiplik araçları da buraya eklenecek. Yükleme sonrası seçili parça temizlenir (yüklenen oyunun kapsamı farklı olabilir).

**Adım 5 testleri (11 test):** gidiş-dönüş birebir aynı · tur/havuz/sahiplik korunuyor (fethedilmiş parçalar dahil) · **kesirli havuz yuvarlanmadan dönüyor** (15.4) · üretecin durumu kayıtta · sürüm alanı var · boyut 50 KB altı ve geometri yok · Karadeniz oyunu da kaydediliyor · bozuk JSON reddediliyor · eksik alanlı kayıt reddediliyor · ileri sürümlü kayıt reddediliyor · **yüklenen oyun tur döngüsünde kaldığı yerden aynı şekilde devam ediyor.**

**Toplam test: 52.** `npx expo export --platform android` hatasız.

### Adım 5 — sonradan gelen düzeltme: ayarlar menüsü (Baki'nin isteği)

**Tarih:** 2026-07-25, Adım 5 onaylandıktan hemen sonra. Yeni: `src/bilesenler/AyarMenusu.js`, `Ikonlar.js`'e `IkonAyar` (dişli). **Silinen:** `src/bilesenler/GelistiriciCubugu.js` — işini ayarlar menüsü devraldı.

- **Sağ üst köşeye dişli düğmesi** kondu; **tur çubuğu 52 piksel sola kaydırıldı** (`TurCubugu` yeni `sagBosluk` özelliği — konum sabiti `App.js`'te `AYAR_GENISLIK`, tek yerde).
- Dişliye basınca menü açılır: senaryo + oynanan il bilgisi, **OYUNU KAYDET**, **OYUNU YÜKLE**, ayraç, sonra **ANA MENÜ / SES VE GÖRÜNTÜ / YENİ OYUN**.
- **Yapılmamış bölümler kesikli çerçeveli, soluk ve "yakında" etiketli — basılamıyorlar.** Sebep: görev kuralı "uydurma"; çalışmayan düğmeyi çalışıyormuş gibi göstermek yerine ekranda dürüstçe işaretlendi. Bu üç bölüm sonraki görevlere ait (mod seçimi/ana menü Görev 03 kapsamı dışında, §4).
- Kaydet/yükle **artık geliştirici aracı değil, oyuncu özelliği** — tasarım §8.1'e göre kayıt çekirdek özellik, dolayısıyla ayarlar menüsü doğru yeri. `GELISTIRICI_MODU` kapatılınca da erişilebilir.
- Menü ekranın en üstünde çiziliyor; dışına dokununca kapanıyor, açıkken alttaki düğmeler tıklanmıyor.

Adım 8'in sahiplik test araçları için ayrı bir geliştirici çubuğu kurulmayacak; araçlar panele (`IlPaneli`) "GELİŞTİRİCİ" etiketiyle eklenecek.

## Görev 03 / Adım 6 — HUD gerçek sayılara bağlandı

**Tarih:** 2026-07-25. Değişen: `src/oyun/oyunDurumu.js` (`aktorOzeti`), `src/bilesenler/TurCubugu.js`, `src/App.js`, `testler/oyunDurumu.test.js`.

### Sahte alan envanteri KAPANDI

Adım 0d'de çıkarılan beş sahte alanın hepsi Adım 4'te gerçeğe bağlandı ya da kaldırıldı. Bu adımda eksik kalan iki alan eklendi:

| Alan | Biçim | Durum |
|---|---|---|
| Tur | "TUR 07" | ✔ gerçek (Adım 4) |
| Nüfus havuzu | tam sayı | ✔ gerçek (Adım 4) |
| Ekonomi havuzu | tam sayı | ✔ gerçek (Adım 4) |
| Tur geliri | "+7" (havuzun yanında, yeşil) | ✔ gerçek (Adım 4) |
| **Parça sayısı** | "4/193 parça" | ✔ **bu adımda eklendi** |
| **Tam il sayısı** | "1 tam il" | ✔ **bu adımda eklendi** |
| Turu bitir | düğme | ✔ gerçek (Adım 4) |

**Ekranda gerçek hesaba dayanmayan tek bir sayı kalmadı.**

### `aktorOzeti(durum, aktorId)`

Tek geçişte döner: `{ parca, toplamParca, tamIl, toplamIl }`.

**TAM İL tanımı:** o ilin oyundaki bütün parçaları o aktörde. Hiçbir yerde saklanmaz, her seferinde sahiplik tablosundan türetilir (§6.2) — "ilin sahibi" alanı olmadığı için çelişme ihtimali yok. Payda senaryoya göre değişir: Türkiye'de 193/81, Karadeniz'de 34/18.

### Küçük ekran

Toprak bilgisi tur çubuğunda **ayrı sütun açmadan**, kaynakların altına tek satır olarak kondu (9.5 punto, soluk ikincil renk): `4/193 parça · 1 tam il`. Çubuk genişlemedi, yalnızca ~13 piksel uzadı — harita boğulmadı. Yeni tasarım dili icat edilmedi, mevcut Palet A hiyerarşisi korundu (asıl sayılar krem, gelir yeşil, ikincil bilgi haki).

**Adım 6 testleri (5 yeni test):** başlangıçta Bursa 4/193 · 1 tam il · **tek parça kaybedilince tam il 1 → 0** · Yalova'nın tek parçası alınınca tam il 1 → 2 · Karadeniz'de payda 34/18 · parçası olmayan aktör 0/193 · 0 tam il.

**Toplam test: 57.** `npm run kontrol` temiz, `npx expo export --platform android` hatasız.

## Görev 03 / Adım 7 — Panele sahiplik ve üretim bilgisi

**Tarih:** 2026-07-25. Değişen: `src/bilesenler/IlPaneli.js`, `src/oyun/oyunDurumu.js` (`ilSahiplikDagilimi`), `src/oyun/uretim.js` (`ilGeliri` artık `aktorId` de döndürüyor), `src/App.js`, `src/bilesenler/TurCubugu.js` (aralıklar). Yeni: `testler/panelBilgisi.test.js`.

### Panele eklenenler

**Parça bölümü:**
- `SAHİBİ` — aktörün adı + **renk noktası** (harita rengiyle birebir aynı, `tema.js aktorRengi`). Oyuncunun kendi parçasında "(sen)" pirinç renkle.
- `GETİRİSİ` — bu parçanın sahibine tur başına kazandırdığı: "+3.9 nüfus / +3.6 ekonomi".
- **"BU PARÇAYI ALIRSAN"** kutusu — yalnızca parça oyuncunun değilse görünür. Pirinç çerçeveli, yeşil sayı, altında "her tur, senin kasana".

**İl bölümü:**
- `2/4 parça sende` başlığı + kalan parçaların kimde olduğu, renk noktalı satırlar: "1 parça — İstanbul". (Türkçe ek uydurmamak için "-de/-da" yerine tire kullanıldı; "Balıkesir'de/İstanbul'da" ayrımı yazım hatası riski taşıyordu.)
- `SANA GELİRİ` — oyuncunun o ilden aldığı toplam (parçası yoksa satır çıkmaz).
- 5 stat çubuğu (altyapı Adım 0'da çıkmıştı) + parça sayısı satırı yerinde.

**Panelde oyun mantığı yok** — ordu/üretim/saldır düğmesi eklenmedi (§7 Adım 7 sınırı). Sadece bilgi.

### Türetilmiş satır neden önemli

"Bu parçayı alırsan +X nüfus / +Y ekonomi" oyunun ana formülünün ekrandaki halidir. Görev 02'de yüzde gösteriyordu (il statı henüz yoktu), artık **gerçek sayı**. Baki parmakla dokunup sayının saçma olup olmadığını kod okumadan görebiliyor — hata yakalamanın en hızlı yolu bu.

### Tur çubuğu ferahlatıldı (Baki'nin isteği)

"Yazılar birbirine yakın" geri bildirimi: TUR bölmesi büyütüldü (min genişlik 58, iç boşluk 12/9, tur numarası 16 → **22 punto**), kaynak satırları arası boşluk 2 → 5, satır yükseklikleri ayarlandı.

**Adım 7 testleri (7 test):** parça sahibi başlangıçta kendi ili · "alırsan" satırı gerçek getiriyle aynı ve sahip değişince değişmiyor · il dağılımı tek sahiplide doğru · bölününce **çoktan aza sıralı** ve doğru sayıda · "sana geliri" hem oyuncu hem rakip için doğru · **illerden gelen gelirlerin toplamı aktörün toplam geliriyle tutarlı** · yabancı/kendi parça ayrımı doğru.

**Toplam test: 64.** `npm run kontrol` temiz, `npx expo export --platform android` hatasız.

### Adım 7 — Baki'nin geri bildirimi sonrası düzeltmeler

**Tarih:** 2026-07-25. Değişen: `IlPaneli.js`, `TurCubugu.js`, `AyarMenusu.js`, `App.js`.

**1. "BU PARÇAYI ALIRSAN" kutusu görünmüyordu.** Kod incelendi: koşul (`parcaGelir && sahip && !sahip.benimMi`) ve App'ten geçen veriler doğruydu — sorun büyük olasılıkla telefondaki eski paketti (yeniden yükleme yapılmamış). Yine de kaçırılmayacak yere alındı: **sahiplik bloğu panelin en üstüne**, parça adının hemen altına taşındı. Yeni sıra: parça adı → SAHİBİ → GETİRİSİ → *alırsan kutusu* → ayraç → ARAZİ/SAVUNMA/ÖNEM → il bölümü. Panel `minWidth` 150 → **190** (gelir satırları sıkışmasın).

**2. Kutular büyütüldü, yazılar aynı kaldı** (Baki: "yazıları büyütme, kutuyu büyüt, boşluklar güzel dursun"):

| Yer | Eski → Yeni |
|---|---|
| Tur bölmesi iç boşluk | 12/9 → **14/14**, min genişlik 58 → 64 |
| Kaynak bölmesi iç boşluk | 13/9 → **17/14**, satır arası 5 → **8** |
| TURU BİTİR yan boşluk | 12 → 16 |
| Ayarlar dişlisi | 44×44 → **54×54** (ikon 22 → 26) |
| Ayarlar menüsü | genişlik 230 → **258**, satır iç boşluğu 10 → 13, aralar 6 → 8 |

Yazı puntoları **değişmedi**; ferahlığın tamamı boşluktan geliyor. Ayar düğmesinin boyutu `App.js`'te tek sabit (`AYAR_BOYUT`), tur çubuğunun sola kayması ondan hesaplanıyor — biri değişince diğeri kendiliğinden uyuyor.

## TAM SAYI ÜRETİM KARARI (2026-07-26, Baki)

**Karar:** Parça getirileri kesirli olmayacak. "Bu parçayı alırsan +1.8 nüfus / +1.7 ekonomi" yerine **"+2 nüfus / +2 ekonomi"**. Gerekçe: oyuncu ondalık sayıyla düşünmemeli, bir parçanın değeri tek bakışta anlaşılmalı.

**Eski formül:** `parça getirisi = payı × ilin statı` (kesirli, ör. 0.55 × 7 = 3.85).
**Yeni kural:** ilin statı parçalarına **tam sayı olarak bölünür** (`src/oyun/uretim.js` → `parcaDegerleri`).

### Üç kural, sırayla

1. **Oransal dağıtım (en büyük artık yöntemi).** Stat, paylara göre tam sayılara bölünür; artan birimler en büyük ondalık artığı olan parçalara verilir. Toplam ilin statına **eşit** kalır.
2. **Her parça en az 1.** Sıfır kalan parçaya, o an en çok üreten parçadan 1 aktarılır — toplam yine değişmez.
3. **Tekdüzelik.** Değerler büyükten küçüğe sıralanıp paylara aynı sırayla dağıtılır; böylece payı büyük parça küçükten asla az üretmez.

**Üçüncü kural neden gerekti:** ilk denemede yalnızca 1+2 uygulanmıştı ve Konya'da **merkez parça (pay %60) ile en küçük parça (pay %6) aynı değeri** alıyordu. Sıralama garantisi eklenince Konya Kenti 3, küçükler 1 oldu.

### Sonuç — 81 ilin tamamında ölçüldü

| | Statların toplamı | Üretim toplamı | Fark |
|---|---|---|---|
| Nüfus | 353 | **353** | 0 |
| Ekonomi | 326 | **327** | +1 |

Tek sapma **Erzurum**: 5 parçası var ama ekonomi statı 4 — "her parça en az 1" kuralı 5 birim gerektiriyor. Kabul edildi; alternatifi bir parçanın 0 üretmesiydi.

Ayrıca: hiçbir parça 0 üretmiyor, hiçbir ilde büyük parça küçükten az üretmiyor (ikisi de test ediliyor).

### Örnekler

| İl (stat) | Parça değerleri |
|---|---|
| Bursa (nüfus 7) | Bursa Ovası **3**, Doğu **2**, Batı Ova **1**, Uludağ Güneyi **1** |
| İstanbul (nüfus 10) | Avrupa Yakası **6**, Anadolu Yakası **3**, Suriçi-Galata **1** |
| Konya (nüfus 7) | Konya Kenti **3**, diğer dört parça **1**'er |
| Balıkesir (nüfus 6) | Kuzey-Marmara **2**, Orta **2**, Batı-Ege **1**, Doğu Dağlık **1** |

Baki'nin verdiği örnek (Balıkesir Kuzey-Marmara Kıyısı 1.8/1.7 → düz 2) birebir tuttu.

### Kesirli havuz kuralı DEVAM EDİYOR

Üretim tam sayı ama **havuzlar hâlâ kesirli saklanıyor** (§6.4). Sebep: `URETIM_CARPANI` ileride 1.5 gibi bir değere çekilirse kesirler geri gelir; her tur yuvarlansaydı kaynak sessizce buharlaşırdı. Test bunu çarpanı geçici 0.5 yapıp doğruluyor (3 → 1.5, 10 turda 15).

### Etkilenen yerler

`src/oyun/uretim.js` yeniden yazıldı (`parcaDegerleri`, `ilUretimi` eklendi). Testler yeni değerlere göre güncellendi: `uretim.test.js` (4 yeni tam sayı testi + altı doğrulama), `turDongusu.test.js`, `kayit.test.js`, `panelBilgisi.test.js`. Tasarım §7'ye tam sayı kuralı ve örneği işlendi. **Toplam test: 68, hepsi geçiyor.**

## Arayüz düzeltmeleri (2026-07-26, Baki'nin geri bildirimi)

- **Tur çubuğu dikeyde daraldı:** iç boşluk 14 → **8**, satır araları 8 → **4**, TUR bölmesi 4 → 2. Yazı puntoları değişmedi. ("Çok yer kaplıyor, aralarında daha az ama okunabilirliği bozmayacak boşluk.")
- **Ayarlar dişlisi artık tur çubuğuyla aynı kalınlıkta.** Çubuk `onLayout` ile yüksekliğini bildiriyor, düğme o yüksekliği alıyor — biri büyük biri küçük görünmüyor. Sabit yükseklik yazılmadı; çubuk değişirse düğme kendiliğinden uyum sağlar.
- **Panelden "her tur, senin kasana" satırı kaldırıldı** (zaten anlaşılıyor).

## Harita netliği — bulanıklık düzeltmesi (2026-07-26)

**Sorun:** Harita SVG bir kez çizilip yakınlaştırmada büyütülüyordu; çizim ekran çözünürlüğünde olduğu için yakınlaşınca bulanıklaşıyordu (Görev 02'den beri açık madde).

**Yapılan:** Harita artık **ekranın 2 katı büyüklükte** çizilip 1/2 oranında küçültülerek gösteriliyor (`tema.js` → `HARITA_NETLIK = 2`). Ölçek küçültme kutunun merkezine göre olduğundan kutu kenarlardan (N−1)/2 kadar taşırılıyor; sonuçta ekranı birebir kaplıyor.

**Neden bu yol seçildi:** Alternatif "jest bitince haritayı yeniden çiz" (bake-on-gesture-end) yöntemi çizim mantığına ve jest zincirine dokunuyordu — bırakınca zıplama ve pinch düzeltmesini bozma riski vardı. Bu çözüm **jest ve dokunma mantığına hiç dokunmuyor**: kutu ekranla birebir aynı yeri kapladığı için vuruş testi (hit-test) aynen çalışıyor.

**Bedeli:** bellek kullanımı 4 kat piksel (2² ). Cihaz zorlanırsa veya harita kaybolursa `HARITA_NETLIK = 1` yapmak tek satırlık geri dönüş. Netlik yakınlaştırmanın ~2 katına kadar korunuyor; sonrasında yine yumuşuyor (tam çözüm için ileride bake yöntemi gerekir).

## Telefona özel arayüz ölçüsü (2026-07-26, Baki'nin isteği)

**Sorun:** Tur çubuğu ve harita tipi düğmeleri telefonda haritanın büyük kısmını kapatıyordu; aynı arayüz tablette rahat sığıyor.

**Çözüm:** `src/olcu.js` — "telefon mu tablet mi" kararı **tek yerden** verilir. Ölçüt **kısa kenar < 600 dp** (Android'in kendi küçük/geniş ekran sınırı). Kısa kenar seçildi çünkü telefon yatay tutulunca genişliği tablet kadar olabilir ama kısa kenarı hep küçüktür — böylece karar ekran döndürülünce değişmez.

| Öğe | Tablet | Telefon |
|---|---|---|
| Tur no | 22 punto | 16 |
| Kaynak satırları | 11.5 | 10 |
| Toprak satırı | 10 | 8.5 |
| Çubuk iç boşluğu | 16/8 | 9/6 |
| Turu bitir düğmesi | "TURU BİTİR" | **"BİTİR"** (yer kazanmak için) |
| Ayarlar dişlisi | 54 px | 40 |
| Harita tipi düğmeleri | 44 px, **dikey** sütun | 36 px, **yatay** şerit |

Harita tipi düğmeleri telefonda yataya alındı: dikey sütun ekran yüksekliğinin ~%23'ünü kaplıyordu, yatay şerit yalnızca alt kenarda ince bir bant. Ayraç çizgisi de yönle birlikte döner (yatayda dikey çizgi).

Ayarlar dişlisinin genişliği artık `App.js`'te tek yerden geliyor ve tur çubuğunun kayması ondan hesaplanıyor — biri değişince diğeri kendiliğinden uyuyor.

## Görev 03 / Adım 8 — Sahiplik test aracı

**Tarih:** 2026-07-26. Değişen: `src/oyun/oyunDurumu.js`, `src/bilesenler/Harita.js`, `src/bilesenler/IlPaneli.js`, `src/App.js`. Yeni: `testler/gelistirici.test.js`.

### Durum fonksiyonları (hepsi yeni durum döndürür)

| Fonksiyon | İş |
|---|---|
| `parcayiVer(durum, parcaId, aktorId)` | Tek parçayı bir aktöre verir |
| `iliVer(durum, ilKodu, aktorId)` | İlin **tüm** parçalarını verir ("tam il" davranışını test etmek için) |
| `parcayiEskiHaline(durum, parcaId)` | Parçayı oyun başındaki sahibine, yani kendi iline döndürür |

**Korumalar:** senaryo dışı parça sahiplenilemez, olmayan aktöre verilemez, **değişiklik yoksa aynı nesne döner** (arayüz boşuna tazelenmez).

### Arayüz

- **Haritada parçaya uzun basma (450 ms)** → parça oyuncuya geçer ve paneli açılır. Jest kurulumu `Simultaneous(pan, pinch, Exclusive(uzunBas, tap))`: uzun basma önceliklidir, tetiklenince tek dokunuş çalışmaz. **Kaydırma ve yakınlaştırma etkilenmez** — pinch düzeltmesine dokunulmadı.
- **Panelde GELİŞTİRİCİ kutusu** (kırmızı kesikli çerçeve, normal arayüzden bilerek ayrı): `BU PARÇAYI AL` (yalnız senin değilse), `TÜM İLİ AL`, `GERİ VER` (yalnız kendi ilinde değilse) + uzun basma ipucu.
- Tamamı `DENGE.GELISTIRICI_MODU` ile kapanır; yayın sürümünde hiç görünmez.

**Adım 8 testleri (8 test):** sahiplenince gelir anında artıyor ve eski sahibinki aynı miktarda düşüyor · parça sayısı + **tam il sayacı** doğru (Yalova alınca 2 tam il, Ankara'dan tek parça alınca hâlâ 2) · tüm ili alma · geri verme · eski durum değişmiyor · gereksiz değişiklikte aynı nesne · **kapsam koruması** (Karadeniz oyununda Antalya alınamıyor) · sahiplik değişikliği tur döngüsüne ve kayda doğru yansıyor.

**Toplam test: 76.** `npm run kontrol` temiz, `npx expo export --platform android` hatasız.

## Cihaz testi sonrası düzeltmeler (2026-07-26)

Baki telefonda Adım 8'i test etti; dördü uygulandı:

**1. FETHEDİLEN PARÇA ARTIK SENİN RENGİNE DÖNÜYOR.** ("Aldığımı Sahibi kısmına bakana kadar göremedim.")
`Harita.js` "il" modunda dolguyu artık **parçanın sahibinden** alıyor (`sahiplik` + `aktorRenk` özellikleri, `App.js`'ten geçiyor). Oyun başında her parçanın sahibi kendi ili olduğu için görüntü aynı; fetih olunca alınan parça oyuncunun rengine geçiyor. Arazi ve bölge modları etkilenmedi. Aktör rengi oyun durumunda zaten askeri tonlu olduğu için haritada **ikinci kez ton uygulanmıyor** (üst üste binerse renk sönükleşirdi).

**2. Tur çubuğundan "tam il" sayacı kaldırıldı** (Baki: gereksiz). Yalnızca "4/193 parça" kaldı. `aktorOzeti` hâlâ `tamIl` hesaplıyor ve testleri duruyor — kazanma koşulu (Görev 05+) bunu kullanacak.

**3. TÜM İLİ GERİ VER eklendi.** "GERİ VER" yalnızca seçili parçayı döndürüyordu; `iliEskiHaline(durum, ilKodu)` ile ilin tamamı tek dokunuşta kendi iline döner. Panel düğmesi de "PARÇAYI GERİ VER" olarak netleştirildi.

**4. Font** — Baki'ye öneri sunuldu (Oswald + Barlow Semi Condensed), kararı bekleniyor. Henüz uygulanmadı.

Doğrulanan davranışlar (Baki'nin cihaz testi): uzun basma sahiplenme, TÜM İLİ AL, parça sayacı ve gelirin anında artması, kaydet/yükle sonrası sahipliğin ve kaynakların korunması — **hepsi çalışıyor**.

**Toplam test: 77.**

## Yazı tipleri (2026-07-26, Baki "A seçeneği" dedi)

Kurulan paketler: `expo-font`, `@expo-google-fonts/oswald`, `@expo-google-fonts/barlow-semi-condensed`.

| Kullanım | Yazı tipi |
|---|---|
| Etiketler (ARAZİ, SAHİBİ, TUR) | **Oswald 500** — dar, dik, askeri afiş hissi |
| Başlıklar ve düğmeler (PARÇA, AYARLAR, BİTİR) | **Oswald 600** |
| Gövde metni | **Barlow Semi Condensed 400** |
| Vurgulu metin / değerler | **Barlow Semi Condensed 600** |
| Öne çıkan sayılar (havuz, stat, getiri) | **Barlow Semi Condensed 700** |

Tanımlar `src/tema.js` → `YAZI`; değiştirmek için tek yer orası. Fontlar `src/App.js`'te `useFonts` ile yükleniyor, yüklenene kadar ekran deniz renginde boş kalıyor (yazılar önce sistem fontuyla çizilip sonra zıplamasın diye).

**Dikkat:** özel yazı tipi kullanılınca React Native'de `fontWeight` çalışmaz — kalınlık ailenin kendi sürümünden gelir. Bu yüzden tüm bileşenlerdeki `fontWeight` satırları kaldırılıp yerine uygun aile kondu. Yeni bir yazı eklerken `fontWeight` yerine `YAZI.*` kullanılmalı.

Punto boyutları yarım punto büyütüldü (Barlow dar olduğu için aynı boyutta daha küçük görünüyor).

---

# GÖREV 03 KAPANIŞ — 2026-07-26

Dokuz adımın (0–8) tamamı bitti. `npm run kontrol` dört bölümde de temiz, **77 test geçiyor**, `npx expo export --platform android` hatasız (4.78 MB).

## Görev §10 bitiş ölçütü

**Belge senkronu:** tasarım §4.2/§4.3/§4.5/§5/§8/§12/§13/§15 + sözlük güncellendi ✓ · `iller.json` altyapısız, 81 il ✓ · panelde 7 stat ✓ · sahte alan envanteri çıkarıldı ve kapatıldı ✓
**Altyapı:** `src/denge.js` ✓ · tohumlu üreteç, aynı tohum aynı dizi ✓
**Oyun durumu:** iki senaryo ✓ · kapsam dışı soluk ve seçilemez ✓ · her parçanın sahibi kendi ili ✓
**Ekonomi:** altı doğrulama testi ✓ · toplam korunumu ✓ · kesir korunumu ✓ (üretim tam sayıya çevrildi, kesir kuralı çarpan üzerinden korunuyor)
**Tur ve kayıt:** turu bitir ✓ · kaydet/yükle gidiş-dönüş ✓ · kayıt 12.9 KB ✓ · sürüm alanı ✓
**Arayüz:** HUD gerçek ✓ · panel sahip + gelir ✓ · "bu parçayı alırsan" ✓ · geliştirici sahiplik aracı ✓
**Genel:** telefonda test edildi ✓ · `URETIM-NOTU.md` güncel ✓

## Görev tanımının dışında, Baki'nin isteğiyle eklenenler

1. **Ayarlar menüsü** (sağ üst dişli) — kaydet/yükle buraya taşındı; ana menü / ses / yeni oyun "yakında" etiketiyle duruyor.
2. **Tam sayı üretim** — parça getirileri ondalıktan çıkarıldı (bu görevin en büyük tasarım değişikliği).
3. **Telefona özel arayüz ölçüsü** (`src/olcu.js`).
4. **Harita netliği** — Görev 02'den kalan bulanıklık sorunu (2 kat çözünürlük).
5. **Fethedilen parçanın oyuncunun rengine dönmesi.**
6. **Yazı tipleri** — Oswald + Barlow Semi Condensed.

## Sonraki görev

**Görev 04 — Ordu üretimi.** Biriken nüfus ve ekonomi burada harcanacak: doğrudan birim satın alma ekranı (§4.2), birim maliyetleri (§4.1), garnizon/sefer bölüşümü (§4.4), "geçen turun siparişini tekrarla" düğmesi. `denge.js` başındaki yorum listesi hangi sabitlerin ekleneceğini söylüyor.

# GÖREV 03B — HARİTA REVİZYONU

## Adım 0 — Komşuluk denetimi (2026-07-26)

Yeni betik: `scripts/komsuluk-denetim.js` (hiçbir dosyayı değiştirmez, yalnızca rapor basar). İl grafiğinde komşu görünüp parça grafiğinde bağlantısı olmayan çiftleri bulur ve her biri için, iki ilin parçaları arasındaki **en kısa mesafeyi** ölçerek o sınıra fiilen değen parça çiftini gösterir.

**Kalibrasyon:** hâlihazırda komşu olan 346 il-arası parça çiftinin **hepsinde** mesafe 0.000 birim. Yani "komşu" ile "yakın ama ayrı" arasındaki fark ölçülebilir durumda.

### Soru 1 — İki kısa sınır parça grafiğinde var mıydı?

**Yoktu, ikisi de.** Ama sonuçları farklı çıktı:

**a) İstanbul–Kırklareli → GERÇEK SINIR, EKLENDİ.**
- Ham ilçe verisinde (`geoBoundaries ADM2`) **Çatalca (İstanbul) ↔ Vize (Kırklareli) teması EVET**.
- Çatalca `34-2 Avrupa Yakası`, Vize `39-2 Istranca` parçasında → eksik bağlantı **34-2 ~ 39-2**.
- Bizim sadeleştirilmiş haritamızda da bu iki parça arasındaki mesafe **0.00 birim** — yani değiyorlar; topolojiden komşuluk çıkarma çok kısa ortak kenarı kaçırmış.
- `parca-uret.js`'e `EK_KARA_SINIRI` ayarı eklendi (deniz geçişleriyle aynı mantık, gerekçesi kodda yazılı). Veri yeniden üretildi: parça komşuluk çifti 499 → **500**, il çifti parça grafiğinden 197 → **198**.

**b) Kilis–Hatay → SINIR YOK. Görev 02'de yanlış eklenmiş.**
- Ham **il** verisinde Kilis ile Hatay arasında **3.69 km boşluk** var, sınır teması **yok**.
- Ham **ilçe** verisinde Kilis'in dört ilçesinin (Merkez, Musabeyli, Polateli, Elbeyli) hiçbiri Hatay'ın Hassa/Kırıkhan ilçelerine değmiyor (en yakın merkez mesafesi 33.8 km).
- Karşılaştırma: Kilis–Gaziantep teması **EVET (0.00 km)**, Hatay–Gaziantep teması **EVET (0.00 km)**. Yani ikisinin arasına **Gaziantep** (İslahiye/Nurdağı) giriyor.
- Bu çift Görev 02'de `komsuluk-uret.js`'teki `EK_KOMSU` listesine "gerçek kara sınırı" varsayımıyla elle eklenmişti; kaynağı Görev 02 tanımının §5 örnek listesiydi. Ölçüm bunun **doğru olmadığını** gösteriyor.
- **Düzeltilmedi — Baki'nin kararı bekleniyor** (görev tanımı §4: "düzeltmeden önce Baki'ye göster").

### Soru 2 — Başka kaçan kısa sınır var mı?

**Yok.** 81 ilin tüm komşuluk çiftleri tarandı; İstanbul–Kırklareli düzeltildikten sonra parça grafiğinde bağlantısı olmayan tek çift Kilis–Hatay kaldı, o da yukarıdaki sebeple zaten gerçek bir sınır değil.

## Adım 0 — sonuç: Kilis–Hatay kaldırıldı (Baki onayı, 2026-07-26)

`komsuluk-uret.js`'teki `EK_KOMSU` listesi **boşaltıldı**; artık il komşuluğunun tamamı parça grafiğinden türüyor. `veri-dogrula.js`'teki §5 elle kontrol örneği de düzeltildi: **Kilis'in tek kara komşusu Gaziantep** (eskiden "Gaziantep, Hatay" yazıyordu — Görev 02 tanımından gelen hatalı varsayım).

İl komşuluk çifti: 199 → **198**. İstanbul–Kırklareli artık elle değil, parça grafiğinden (34-2 ~ 39-2) geliyor.

## Adım 1 — Rize'nin arazisi Dağlık

`parca-uret.js`'e **`ARAZI_ZORLA`** ayarı eklendi (gerekçe kodda yazılı): `53-1` → `daglik`.

- Birleşme sonrası otomatik hesap **Tepelik** veriyordu (Kaçkar Vadileri kıyıya katılınca ağırlık tepeliğe kaymıştı).
- Rize'nin coğrafi kimliği dağdır ve tasarım belgesi Rize'yi **iki yerde** dağlık savunma örneği olarak kullanıyor (§3.5 "Rize dağlık", §5 "yüksek arazi savunması"). Savunma çarpanı ×1.15 → **×1.35**.
- `iller.json` yeniden üretildi: Rize ilinin arazisi de `daglik` (il arazisi parçalardan türüyor). Doğrulandı.
- **Kalıcı test eklendi** (`uretim.test.js`): parça ve il arazisi `daglik` mi. Elle geçersiz kılma sessizce kaybolmasın.

## Adım 2 — İstanbul 3 parçadan 2'ye

`BIRLESTIR`'e eklendi: `34-1` (Suriçi ve Galata) → `34-2` (Avrupa Yakası).

| Parça | Arazi | Nüfus | Ekonomi |
|---|---|---|---|
| **34-2 Avrupa Yakası** (eski 1 + 2) | Ova | 0.09+0.56 = **0.65** | 0.18+0.47 = **0.65** |
| **34-3 Anadolu Yakası** (değişmedi) | Tepelik | **0.35** | **0.35** |

Arazi ağırlıklı baskın kuralla Ova çıktı (0.47 ova / 0.18 tepelik) — beklendiği gibi. `DENIZ_GECISLERI`'nden artık var olmayan `34-1 ~ 34-3` satırı kaldırıldı; boğaz geçişi `34-2 ~ 34-3` olarak duruyor.

**Kayan nokta düzeltmesi:** birleşen paylar `0.18+0.47 = 0.6499999…` çıkıyordu; toplama artık 2 haneye yuvarlanıyor ki **il payları toplamı tam 1.00** kalsın.

**Tam sayı üretime etkisi:** İstanbul nüfus statı 10, paylar 0.65/0.35 → Avrupa **7**, Anadolu **3**. (Eskiden 6/3/1 idi.)

### ARŞİV — silinen "Suriçi ve Galata" parçasının tasarım metni

> **1. parça = Bizans'tan fethedilen alan.** Konstantinopolis'in sur içi (Fatih), surların bittiği Yedikule hattı (Zeytinburnu), sur dışı Eyüp ve Ceneviz Galatası (Beyoğlu-Beşiktaş). Küçük nüfus, orantısız büyük ekonomi — liman, tarihi ticaret, turizm ve finans burada. Ayrıca tek "tepelik" parça: yedi tepe savunmaya değer.
>
> İlçeler: Fatih, Eyüpsultan, Zeytinburnu, Beyoğlu, Beşiktaş. Arazi: Tepelik. Nüfus payı 0.09, ekonomi payı 0.18.

**Neden silindi:** Görev 04'te gelecek ordu rozeti (26 px) bu parçaya sığmıyordu. Kayıp tarihsel lezzet öğesi, kazanç oynanabilirlik — Baki'nin bilinçli tercihi (2026-07-26).

## Adım 1–2 sonrası veri durumu

| | Önce | Sonra |
|---|---|---|
| Parça sayısı | 193 | **192** |
| Parça komşuluk çifti | 499 | **498** |
| İl komşuluk çifti | 199 | **198** |
| Arazi dağılımı | Ova 76 / Tepelik 56 / Dağlık 61 | Ova 76 / Tepelik **54** / Dağlık **62** |

Yeniden üretilenler: `parcalar.json`, `parca-komsuluk.json`, `iller.json`, `komsuluk.json`, `onizleme/*.html`. (`harita.json` il geometrisidir, parça birleştirmesinden etkilenmez.)

**Belge eşitlemesi:** `il-savasi-parca-bolumleme-v2.md` — İstanbul ve Rize tabloları, birleştirme notları, başlık toplamı (192), bölge özeti (Marmara 29→28), arazi dağılımı, parça sayısı dağılımı (1 parçalı il 17→18), kimlik kuralı notu ("birleşen parçanın numarası yeniden kullanılmaz"). `il-savasi-tasarim.md` §7 toplam parça 192. §3.5 ve §5'teki Rize örnekleri artık veriyle tutarlı.

**Testler:** sabit yazılmış parça sayıları veriden okunur hâle geldi (`oyunDurumu.test.js`, `kayit.test.js`). Yeni testler: Rize arazisi, İstanbul iki parça + payları. **Toplam test: 79, hepsi geçiyor.** `npm run kontrol` temiz, `npx expo export --platform android` hatasız.

## Adım 3 — Parça ölçümü ve rozet önizlemesi (2026-07-26)

Yeni betik: `scripts/parca-olcum.js`. Çıktılar: **`veri/parca-olcum.md`** (192 parça, sıralı tablo) ve **`onizleme/rozet-testi.html`** (tarayıcıda açılan görsel test).

### Yöntem

- **Ölçü: iç çember çapı** — parçanın içine sığan en büyük dairenin çapı. Alan kullanılmadı; uzun ince bir kıyı şeridi büyük alana sahip olabilir ama rozeti taşıyamaz.
- Değer **polylabel**'den geliyor: etiket noktası hesaplanırken zaten "sınıra en uzak iç nokta" ve o uzaklık bulunuyor; çap = 2 × uzaklık.
- **Adalar hariç:** ölçüm her parçanın **en büyük kara gövdesi** üzerinde yapılıyor (Çanakkale 3'ün Gökçeada'sı ölçüme girmiyor).
- **Referanslar:** telefon 412×915 dp, rozet çapı 26 px, harita 1000×452 birim.

### Ölçek gerçeği — kritik bulgu

| Tutuş | 1 harita birimi | Rozet için gereken iç çember |
|---|---|---|
| **Dik** (412 dp geniş) | 0.412 px | 63 birim |
| **Yatay** (915 dp geniş) | 0.912 px | 28.5 birim |

Telefon yan çevrilince harita **2.2 kat** büyük çiziliyor. Strateji haritası için asıl oynanacak tutuş yatay.

| Yakınlaştırma | Dik: sığan | Yatay: sığan |
|---|---|---|
| 1× (tüm Türkiye) | **0** / 192 | **68** / 192 |
| 2× | 38 | — |
| 3× | 130 | — |

**Dik tutuşta 1× yakınlaştırmada hiçbir parçaya 26 px rozet sığmıyor.** Sebep basit: 412 px genişliğe sığdırılan Türkiye'de 26 px ≈ 100 km. Bu bir veri sorunu değil ölçek sorunu — rozet ya yakınlaştırınca görünecek ya da Görev 04'te yakınlaştırmaya göre küçülüp büyüyecek.

### Eşik seçenekleri (Baki'nin kararı için)

| Eşik (iç çember, birim) | Eşiğin altında | Birleştirilebilir | Kalan parça |
|---|---|---|---|
| 10 | 1 | 0 | 192 |
| 12 | 7 | 6 | 186 |
| 14 | 14 | 12 | 180 |
| 16 | 22 | 20 | 172 |
| 18 | 33 | 31 | 161 |
| 20 | 48 | 46 | 146 |
| 22 | 70 | 67 | 125 |
| 25 | 97 | 93 | 99 |

("Birleştirilebilir" = eşiğin altındaki parçalardan tek parçalı illere ait olmayanlar; bir il 1 parçanın altına inemez. "Kalan parça" en iyi durumdur, zincirleme birleşmede biraz daha düşebilir.)

### En küçük 5 parça

| Parça | İl | İç çember | Not |
|---|---|---|---|
| Yalova | Yalova | 8.6 | **Tek parçalı il — birleştirilemez** |
| Gelibolu Yarımadası | Çanakkale | 10.1 | Aynı ilde kara komşusu yok (boğazın Avrupa yakası) — özel durum |
| İskenderun Sanayi | Hatay | 10.3 | |
| Güney Kıyı | Kocaeli | 10.8 | |
| Dörtyol-Erzin | Hatay | 10.9 | |

**Eşik Baki tarafından belirlenecek — bu adımda hiçbir birleştirme yapılmadı.**

## Adım 4 — Birleştirme önerisi (2026-07-26, ONAY BEKLİYOR)

**Baki'nin eşiği:** "yatay tutuşta 2×'te kırmızı kalanlar birleşsin" → 26 px rozet, yatayda 1 birim = 0.912 px, 2× → **iç çember < 14.25 birim**. (Dik tutuşta 2× 31.6 birim demek olurdu; 154 parça birleşir, harita çökerdi — kastedilenin bu olmadığı açık.)

Yeni betik: `scripts/birlestirme-oner.js` (hiçbir dosyayı değiştirmez) + ortak yardımcılar `scripts/parca-geometri.js`. Hedef seçimi görev §8.1 kurallarıyla: aynı il içinde, **en uzun ortak sınır**, eşitlikte aynı arazi sonra büyük pay. Ortak sınır **kenar kümesi kesişimiyle** hesaplanıyor (parçalar aynı topolojiden geldiği için ortak kenarların köşeleri birebir aynı) — deniz geçişlerinde 0 çıkar, yani "kara bağlantısı yok" otomatik yakalanır. Birleşme sonrası geometri turf union ile alınıp iç çember yeniden ölçülüyor (zincirleme birleşme için).

### Öneri (9 birleştirme, 192 → 183 parça, 6 il)

| # | Silinecek | Hedef | İl | Yeni pay | Arazi |
|---|---|---|---|---|---|
| 1 | 31-2 İskenderun Sanayi (10.3) | 31-1 Antakya ve Amik | Hatay | 0.88/0.87 | ova |
| 2 | 41-3 Güney Kıyı (10.8) | 41-2 İzmit | Kocaeli | 0.55/0.48 | ova |
| 3 | 31-3 Dörtyol-Erzin (10.9) | 31-1 Antakya ve Amik | Hatay | 1.00/1.00 | ova |
| 4 | 35-1 İzmir Metropol (11.1) | 35-4 Küçük Menderes | İzmir | 0.78/0.72 | ova |
| 5 | 52-2 Batı İç (12.0) | 52-1 Ordu Kıyı | Ordu | 0.82/0.82 | tepelik |
| 6 | 55-1 Samsun Kenti (12.2) | 55-3 İç Kesim | Samsun | 0.65/0.68 | tepelik → ova |
| 7 | 35-3 Çeşme Yarımadası (12.7) | 35-4 Küçük Menderes | İzmir | 0.84/0.79 | ova |
| 8 | 41-1 Gebze Sanayi (13.0) | 41-2 İzmit | Kocaeli | 1.00/1.00 | ova → tepelik |
| 9 | 37-3 Güney (13.9) | 37-2 Kıyı Şeridi | Kastamonu | 0.55/0.52 | daglik |

İl sonuçları: Hatay 3→1, Kocaeli 3→1, Ordu 3→1, İzmir 4→2, Samsun 3→2, Kastamonu 3→2.

### Baki'nin "arazi/ekonomi/nüfusa dikkat" uyarısı — riskli satırlar

Dört satırda **silinen parça hedeften büyük** (geometrik olarak küçük ama ekonomik olarak baskın; yoğun kent dokusu):

| Satır | Silinen | Hedef | Sorun |
|---|---|---|---|
| 4 | İzmir Metropol 0.60/0.55 | Küçük Menderes 0.18/0.17 | İlin **kalbi** kırsal parçanın adı altında kalıyor |
| 6 | Samsun Kenti 0.52/0.57 | İç Kesim 0.13/0.11 | Aynı sorun + arazi ova→tepelik'ten ova'ya |
| 8 | Gebze Sanayi 0.45/0.52 | İzmit 0.31/0.28 | Kocaeli tek parçaya iner, sanayi/kent ayrımı gider |
| 9 | Kastamonu Güney 0.30/0.30 | Kıyı Şeridi 0.25/0.22 | Küçük fark, sorun sayılmaz |

**Yapı olarak birleşme doğru** (birleşince rozet sığıyor), sorun **kimlik/ad**: ekonomik olarak baskın parçanın adı kaybolmamalı. Çözüm önerisi: birleşmiş parçanın adı, **ekonomi payı büyük olan parçadan** gelsin (ör. 35-4 → "İzmir Metropol", 55-3 → "Samsun Kenti", 41-2 → "Kocaeli Sanayi").

### Baki'ye sorulacak iki özel durum

- **17-1 Gelibolu Yarımadası (10.1):** aynı ilde **kara komşusu yok** (boğazın Avrupa yakası; 17-2 ve 17-3 ile yalnızca deniz geçişi var). Birleşirse parça kopuk kalır — kural 8 gereği dokunulmadı.
- **06-2 Ankara Batı (12.1):** Ankara `KOPUK_ISTISNA` listesinde, 5 parçalı hâli Baki'nin bilinçli tercihi — otomatik birleştirilmedi.

Eşiğin altında kalan diğerleri: **Yalova (8.6)** ve **Kilis (13.6)** — tek parçalı iller, dokunulamaz (kural 6).

## Adım 5 — Birleştirmeler uygulandı (2026-07-26)

**Baki'nin düzeltmesi:** ilk öneri Hatay, Kocaeli ve Ordu'yu tek parçaya indiriyordu. Baki "çok kötü olur, 2 parça olacak şekilde düzenle — mesela Ordu için kıyı ve kıyının altı gibi" dedi. Öneri buna göre yeniden kuruldu. (Ayrıca ilk mesajda "Ordu 3→1" yazılmıştı; **yanlıştı**, öneride Ordu'da zaten tek birleştirme vardı ve 2 parça kalıyordu.)

### Uygulanan 7 birleştirme (`parca-uret.js` → `BIRLESTIR`)

| Silinen | Hedef | İl | Sonuç | Not |
|---|---|---|---|---|
| 31-3 Dörtyol-Erzin | 31-2 İskenderun Sanayi | Hatay | 2 parça | Kıyı şeridi birleşti; ad **İskenderun Körfezi** |
| 41-3 Güney Kıyı | 41-2 İzmit | Kocaeli | 2 parça | Gebze ayrı kaldı (Baki'nin kararı) |
| 52-2 Batı İç | 52-1 Ordu Kıyı | Ordu | 2 parça | Kıyı + Güney Yayla ayrımı korundu |
| 35-1 İzmir Metropol | 35-4 Küçük Menderes | İzmir | 2 parça | Ad **İzmir Metropol** oldu |
| 35-3 Çeşme Yarımadası | 35-4 | İzmir | — | |
| 55-1 Samsun Kenti | 55-3 İç Kesim | Samsun | 2 parça | Ad **Samsun Kenti** oldu |
| 37-3 Güney | 37-2 Kıyı Şeridi | Kastamonu | 2 parça | Ad **Güney ve Kıyı** oldu |

**Hatay 2 parçada tutulunca** ortaya çıkan alternatif: Dörtyol-Erzin'i Antakya'ya değil İskenderun'a bağlamak. Ölçüm: 31-2+31-3 birleşince iç çember 12.8 (eşiğin biraz altında ama tek başlarına 10.3 ve 10.9 idi), Antakya ve Amik 24.4'te kaldı. Coğrafi olarak da doğru: körfez şeridi tek parça.

**Kocaeli'de** Gebze ile Güney Kıyı arasında **kara bağlantısı yok** (körfez ayırıyor, ortak sınır 0), o yüzden Güney Kıyı yalnızca İzmit'e katılabilirdi. Gebze 13.0 ile eşiğin hemen altında kaldı — bilinçli istisna.

### Ad devri kuralı (`parca-uret.js` → `AD_DEGISTIR`)

Baki'nin uyarısı gereği ("birleştirirken arazi/ekonomi/nüfusa dikkat"), birleşen parçanın adı **ekonomik olarak baskın parçadan** devralınır: 35-4 → İzmir Metropol, 55-3 → Samsun Kenti, 31-2 → İskenderun Körfezi, 37-2 → Güney ve Kıyı. Yoksa İzmir'in %60 nüfuslu kent dokusu "Küçük Menderes" adı altında kaybolurdu.

### Kayıt sürümü 2

Parça kimlikleri değişti → **`KAYIT_SURUMU = 2`**. Sürüm 1 kayıtları artık "Bu kayıt oyunun eski harita sürümünden. Yeni oyun başlatmalısın." mesajıyla **reddediliyor** (`kayitVerisi.js`). Sessizce bozuk yüklemek yerine açık ret; testi de yazıldı.

### Veri durumu

| | Görev 03 sonu | Adım 1–2 sonrası | **Adım 5 sonrası** |
|---|---|---|---|
| Parça | 193 | 192 | **185** |
| Parça komşuluk çifti | 499 | 498 | **481** |
| İl komşuluk çifti | 199 | 198 | **198** |
| Arazi (ova/tepelik/dağlık) | 76/56/61 | 76/54/62 | **73/52/60** |
| Bölge (Marmara/Ege/Akdeniz/İç/Karadeniz/Doğu/Güneydoğu) | — | — | **27/21/24/31/31/29/22** |
| Parça sayısı dağılımı (1/2/3/4/5 parçalı il) | — | 18/32/18/9/4 | **18/38/13/8/4** |

Yeniden üretilenler: `parcalar.json`, `parca-komsuluk.json`, `iller.json`, `komsuluk.json`, `onizleme/*.html`, `parca-olcum.md`.

### Eşiğin altında kalan 6 parça — hepsi bilinçli istisna

| Parça | İç çember | Gerekçe |
|---|---|---|
| 77-1 Yalova | 8.6 | Tek parçalı il — bir il 1 parçanın altına inemez |
| 17-1 Gelibolu Yarımadası | 10.1 | Aynı ilde kara komşusu yok; birleşirse parça kopuk kalır |
| 06-2 Ankara Batı | 12.1 | Ankara 5 parçalı kalsın (Baki'nin tasarım tercihi) |
| 31-2 İskenderun Körfezi | 12.8 | Hatay 2 parça kalsın (Baki'nin kararı) |
| 41-1 Gebze Sanayi | 13.0 | Kocaeli 2 parça kalsın (Baki'nin kararı) |
| 79-1 Kilis | 13.6 | Tek parçalı il |

## Adım 6 — Belgeler ve testler eşitlendi

**`docs/il-savasi-parca-bolumleme-v2.md`:** altı ilin (Hatay, Kocaeli, Ordu, İzmir, Samsun, Kastamonu) parça tabloları yeniden yazıldı, her birine tarihli birleştirme notu düşüldü; başlık toplamı 185; bölge özeti, arazi dağılımı ve parça sayısı dağılımı tabloları güncellendi; kimlik kuralı notu ("birleşen parçanın numarası yeniden kullanılmaz") duruyor.

**`docs/il-savasi-tasarim.md`:** §7 toplam parça 185 + yeni kural satırı: "parça, üstünde ordu rozetini taşıyacak kadar büyük olmalı — iç çember ≥ 14.25 birim; istisnalar testte listeli".

**Testler:**
- Yeni dosya **`testler/haritaOlcusu.test.js`** (4 test): her parça eşiğin üstünde mi · **istisna listesi güncel mi** (listedeki parça hâlâ var mı ve hâlâ eşiğin altında mı — gereksiz istisna birikmesin) · etkilenen illerin parça sayıları (Hatay 2, Kocaeli 2, Ordu 2, Ankara 5) · Gelibolu gerçekten kara bağlantısız mı (istisnanın gerekçesi doğrulanıyor).
- Sabit yazılmış parça sayıları veriden okunur hâle getirildi (`oyunDurumu.test.js`, `kayit.test.js`).
- Kayıt sürümü testleri: sürüm 2 kontrolü + eski harita kaydının reddi.

**Toplam test: 84, hepsi geçiyor.** `npm run kontrol` dört bölümde temiz, `npx expo export --platform android` hatasız.

---

# YENİDEN BÖLÜMLEME (2026-07-26) — Baki'nin karar değişikliği

Görev 03B'nin kalan adımları (birleştirme listesi) bu işin içinde eridi: Baki bölümleme
mantığını değiştirdi, parçalar birleştirilmek yerine **baştan çizildi**.

## Yeni kurallar (eski "coğrafi kontrast" kuralının yerine)

1. **Parça sayısı 1–4.** Beşinci parçaya izin yok — az parça, az yük, okunaklı harita.
2. **Birincil ölçüt okunabilirlik:** parça, ordu rozetini taşıyacak kadar tıknaz olmalı.
   Ölçü **iç çember çapı**; hedef ≥ 14.25 harita birimi.
3. **İkincil ölçüt nüfus/ekonomi dengesi:** "ölü parça" olmasın; hedef ≥ %10 pay, alt sınır %6.
4. **Arazi bölmeyi belirlemez:** parçanın baskın arazisi (ekonomi payına göre ağırlıklı)
   parçanın arazisi olur. **İstisna:** arazisi üçe yakın eşit dağılmış illerde (her tip ≥ %28)
   arazi birincil ölçüt olur.
5. **Bütünlük:** parça kara olarak bütün; adalar bağlı oldukları parçanın içinde.

## Yöntem

Yeni betikler: `parca-yeniden-bol.js` (hazırlık) + `parca-yeniden-bol-2.js` (kümeleme) +
`bolumleme-onizleme.js` (eski/yeni karşılaştırma) + `bolumleme-belgesi-uret.js` (belge).
Ortak yardımcılar `parca-geometri.js`, elle kararlar `parca-ayarlar.js`.

- İlçeler il içinde kümelenir; küme = parça. K (parça sayısı) 4'ten 1'e denenir, ölçütleri
  geçen **en büyük K** seçilir. **Parça sayısı artmaz**, gerekirse azalır.
- Her K için birden çok aday üretilir (uzak tohumlardan bölge büyütme + sınır ilçelerini
  taşıyarak iyileştirme + **bugünkü bölümleme de aday**), seçim **iç çemberi en büyük olan**
  adaya göre yapılır.
- **Paylar:** ilçe bazında nüfus verisi yok (Baki: "payları sen takdir et, tek ölçüt nüfus
  değil"). Her ilçe bugünkü parçasının payını ilçe sayısına bölerek devralır; yeni parçanın
  payı bunların toplamıdır. Yani elle verilmiş paylar korunur, yalnızca yeniden gruplanır.

### Yol boyunca çıkan ve düzeltilen hatalar

| Sorun | Kök sebep | Çözüm |
|---|---|---|
| Kayseri'nin kent merkezi ikiye bölündü | Geometri tek başına yerel bilgiyi taşımıyor | **Bütünlük cezası**: bugünkü parçaları dağıtmak maliyetli |
| Ordu/Trabzon 1 parçaya düştü | Uzun kıyı illerinde taze tohumlar doğu-batı bölüyordu | Bugünkü bölümleme de aday listesine kondu |
| İstanbul/Hatay/Kocaeli birleştirmeleri geri diriliyordu | Başlangıç noktası ham tablo (birleştirme öncesi) idi | `parca-uret.js` artık **gerçek ilçe→parça eşlemesini** (`veri/ham/ilce-parca.json`) yazıyor, kümeleme onu okuyor |
| Çanakkale, Balıkesir, İstanbul tamamen atlandı | Adaların kara komşusu yok → "parça bütün değil" | Adalar bütünlük kontrolünden muaf |
| Malatya 2→1 düştü | İyileştirme "yayılım"ı optimize ederken iç çemberi bozuyordu | Aday seçimi doğrudan **iç çembere** göre |
| Çanakkale hâlâ atlanıyordu | Gelibolu ayrı kara gövdesi → "tek parça" seçeneği geometrik olarak imkânsız | Son çare "tek parça" değil, **en büyük geçerli bölümleme** |
| Ankara 3'e iniyordu | Kural "ideali tuttur, yoksa küçült" idi | Baki'nin tercihleri okundu: **"biraz küçük parça" > "ilin yapısını kaybetmek"** → yumuşak tabanı geçen en büyük K |
| "Kozan-Pozantı" parçasında Kozan yok | Ad devralma, ilçe ayrılmasını görmüyordu | Ad, artık parçada olmayan ilçeye atıf yapıyorsa yön adına döner |
| "Ankara Doğu 4" gibi adlar | Aynı yöne düşen iki parça | `ELLE_AD`: 06-2 "Çankaya ve Güney", 06-4 "Ankara Kenti" |
| 183 parça + hayalet 34-3, 06-5 | Eski tabloya göre yazılmış elle atamalar (Adalar→34-3, Gölbaşı→06-5) | Yeni tablo 973 ilçenin tamamını içeriyor → `ELLE`/`ELLE_TASI` boşaltıldı |

## Sonuç

**185 → 181 parça.** 74 il hiç değişmedi; 4 il parça sayısı düşürdü (Ankara, Antalya,
Erzurum, Konya: 5→4), 3 il sınır düzeltmesi aldı (Adana, Diyarbakır, Van).

| | Önce | Sonra |
|---|---|---|
| Parça | 185 | **181** |
| Parça komşuluk çifti | 481 | **469** |
| İl komşuluk çifti | 198 | 198 |
| Parça sayısı dağılımı (1/2/3/4/5 parçalı il) | 18/38/13/8/**4** | 18/38/13/**12**/**0** |
| Arazi (ova/tepelik/dağlık) | 73/52/60 | 73/52/56 |
| Eşik altı parça | 6 | **5** |

**Korunan iller** (Baki beğendi, yeniden bölünmez): Kayseri, Giresun, Sinop, Kastamonu,
İstanbul, Çanakkale, **Bursa**. Bursa'da algoritma %4'lük Uludağ Güneyi dengesizliğini
İnegöl'ü katarak düzeltiyordu; Baki "A" seçeneğini seçti — bugünkü hâl korundu.

**Eşiğin altında kalan 5 parça:** Yalova 8.6 (tek parçalı il) · Gelibolu 10.1 (kara komşusu
yok, rozet denize doğru kaydırılacak) · İskenderun Körfezi 12.8 · Gebze Sanayi 13.0 (ikisi de
"il 2 parça kalsın" kararı) · Kilis 13.6 (tek parçalı il). Ankara Batı listeden çıktı —
yeni 4'lü bölümleme onu 26.6'ya yükseltti.

## Kayıt sürümü 3

Parça kimlikleri baştan numaralandı → `KAYIT_SURUMU = 3`. Sürüm 1 ve 2 kayıtları
"Bu kayıt oyunun eski harita sürümünden. Yeni oyun başlatmalısın." mesajıyla reddediliyor.

## Belgeler

- **`docs/il-savasi-parca-bolumleme-v3.md` YENİ** — kurallar elle yazılı, 81 ilin tablosu
  **veriden üretiliyor** (`node scripts/bolumleme-belgesi-uret.js`). Belge-veri ayrışması
  bir daha yaşanmasın diye.
- `docs/il-savasi-parca-bolumleme-v2.md` — başına "GEÇERLİ DEĞİL" uyarısı kondu, tarihsel
  kayıt olarak duruyor.
- `docs/il-savasi-tasarim.md` §7 — 181 parça + yeni dört kural özet hâlinde.

## Testler

`testler/haritaOlcusu.test.js` güncellendi: istisna listesi 5 parçaya indi, **yeni test:
her il 1–4 parça**. `uretim.test.js`: İstanbul kimlikleri 34-1/34-2, "il üretimi = statı"
artık **istisnasız** (Erzurum sapması yeni bölümlemeyle kayboldu). `kayit.test.js`: sürüm 3.
**Toplam 85 test, hepsi geçiyor.** `npm run kontrol` temiz, `npx expo export` hatasız.

---

# GÖREV 04 — ORDU ÜRETİMİ, YATAY TUTUŞ VE ROZET KATMANLARI

Görev tanımı: `docs/GOREV-04-ordu-uretimi.md` (Baki 2026-07-27'de verdi).
Kapsam: ordu üretilir ve haritada görünür. **Hareket ve muharebe YOK** — onlar Görev 05.

## Dört sorunun cevapları (Baki, 2026-07-27)

Belge kod yazmadan önce dördünün cevaplanmasını şart koşuyordu. Baki dördünde de önerilen
seçeneği seçti.

**Soru 1 — Ordu nerede üretilir? → A: Seç ve üret.**
Oyuncu kendi parçasına dokunur, panelde ÜRET düğmesi çıkar, birim o parçada doğar.
Gerekçe: hareket Görev 05'te geleceği için, ordunun doğduğu yer bu görevde tek
konumlandırma aracı. "Merkezde doğar" seçilseydi tüm ordu tek noktada yığılır ve harita
üzerindeki rozet/katman işi test edilemez hâle gelirdi. Bütçe yine imparatorluk düzeyinde
tek havuz (§13.3 il bazlı kompozisyonu kapsam dışı bırakıyor); değişen sadece birimin
nereye konduğu.

**Soru 2 — Sanayi statı ne yapıyor? → A: Tur başına üretim üst sınırı.**
Bir ilde tur başına en fazla o ilin `sanayi` statı kadar birim üretilebilir. İstanbul
(sanayi 10) turda 10, Bayburt (sanayi 1) turda 1 birim.
Gerekçe: oran seçici kalkıp doğrudan satın almaya geçilince "üretim hızı" diye bir şey
kalmamıştı, stat boşta duruyordu. Bu cevap ekonomik gücü coğrafyaya bağlıyor — zengin ama
sanayisiz oyuncu parasını tek turda orduya çevirip baskın yapamıyor. Ayrıca altyapı
statının kaldırılmasıyla oluşan "coğrafya yavaşlatır" boşluğunu dolduruyor.
Maliyet indirimi (B) seçilmedi: §4.5 denge tablosu sabit maliyetlerle test edilmişti.

**Soru 3 — Garnizon/sefer ayrımı? → A: Kaldır.**
Birim bir parçada durur; kalırsa savunur, çıkarsa saldırır. Ayrı etiket yok.
Gerekçe: kural, parça haritada görünmezken yazılmıştı. Parça artık fiziksel bir bölge
olduğu için ayrım kendiliğinden oluşuyor. Altyapı statı da tam bu gerekçeyle kalkmıştı:
coğrafyanın zaten yaptığı işi ikinci bir mekanikle tekrarlamamak. B'nin tek faydası
(oyuncunun kendini yanlışlıkla savunmasız bırakması) Görev 05'te hareket ekranındaki bir
uyarıyla çözülecek. **Tasarım §4.4 buna göre yeniden yazılacak (Adım 7).**

**Soru 4 — Parça başına birim sınırı? → B: Yumuşak sınır, "99+".**
Sayı sınırı yok; rozet 99'da durur, üstünü "99+" yazar, rozet büyümez.
Gerekçe: tasarım belgesinde sert bir sınır yok, şimdi icat etmek erken. Ama rozet ölçümü
iki haneli sayı (26 px) varsayımıyla yapıldığı için taşmama garantisi gerekiyordu.

## Adım 0 — Belgedeki üç kalıntı düzeltildi

**1. Ankara 5 → 4 parça.** `docs/il-savasi-tasarim.md` §7'de iki satır çelişiyordu: aynı
bölüm hem "her ilin 1–4 parçası var (Ankara 4)" hem "Ankara'yı tamamen almak = 5 parçasının
5'ini de almak" diyordu. İkincisi yeniden bölümleme öncesinden kalmış; düzeltildi.

**2. Erzurum istisnası kaldırıldı.** §7'deki tam sayı kuralı hâlâ "tek istisna Erzurum'un
ekonomisi" diyordu. Yeniden bölümlemede Erzurum 5'ten 4 parçaya indi ve sapma kayboldu.
Veriden yeniden doğrulandı: **nüfus 353 → 353, ekonomi 326 → 326, sapan il YOK.**
(Kural metinde duruyor ama "şu an istisna yok" notu eklendi — ileride bölümleme değişirse
kuralın neden var olduğu anlaşılsın.) Aynı bayat cümle `src/oyun/uretim.js` dosya başı
yorumunda da vardı ("326 → 327: yalnızca Erzurum'da +1"), o da düzeltildi.

**3. §13.1 motor satırı.** "Godot önerilir" yazıyordu, proje Görev 01'den beri Expo'da.
Satır "React Native / Expo — seçildi ve kullanılıyor" olarak yeniden yazıldı; gerekçe
Baki'nin görsel editör kullanmadan doğrudan telefonda deneyerek ilerlemesi.

**Bonus:** `src/denge.js` senaryo yorumu "81 il, 193 parça" diyordu → 181 parça.

## Adım 1 — Yatay tutuş ve yerleşim

**Kilit iki katmanlı.** `app.json` `"orientation": "landscape"` (uygulama yatay açılır) +
`src/yonlendirme.js` çalışma anı kilidi (`expo-screen-orientation`, `OrientationLock.LANDSCAPE`
— iki yatay yön de serbest, telefonu ters çevirince ekran ters durmasın). Expo Go bazen
app.json yönlendirmesini atladığı için asıl güvence ikincisi. Kilit kurulamazsa uygulama
çökmüyor, sessizce atlanıyor — yönlendirme sunum katmanı, oyun mantığı değil.

**Yerleşim işi göründüğünden KÜÇÜK çıktı.** Görev belgesinin §6b tablosu üç öğenin de
değişmesi gerektiğini söylüyordu; koda bakınca ikisi zaten yatay-uyumluydu:

| Öğe | Belge ne diyordu | Kodun gerçeği |
|---|---|---|
| Panel | "Alttan açılır, %54 yükseklik → yan panele dönmeli" | **Zaten sol yan panel** — `IlPaneli.js` tam boy sol şerit (%25 genişlik, min 190 / maks 300). Görev 03'te böyle yazılmış. Değişiklik gerekmedi. Baki de sol kenarı seçti, denk geldi. |
| Tur çubuğu | "Üstte tam genişlik → yatayda çok geniş kalır" | **Zaten tam genişlik değil** — sağ üstte kompakt kutu, telefonda ayrıca daralıyor (`dar` stil seti). Değişiklik gerekmedi. |
| Harita tipi düğmeleri | "Dikey sütuna geri dönmeli, yan kenara" | **Ölçüm belgeyi çürüttü — yatay şerit korundu.** Aşağıya bak. |

**Harita tipi düğmeleri: belgenin tavsiyesi ölçümle reddedildi.**
Belgenin gerekçesi "yatayda yükseklik kıt" idi, ama vardığı sonuç kendi gerekçesiyle ters
düşüyor — dikey sütun yüksekliği yatay şeritten DAHA ÇOK yiyor. Yatay telefon (915×412 dp)
üzerinden iki ölçü:

- **Yükseklik bedeli:** yatay şerit 44 dp = ekran yüksekliğinin **%11'i**.
  Dikey sütun 169 dp = **%41'i**. (Görev 03'te sütun zaten bu yüzden şeride çevrilmişti:
  dik tutuşta yüksekliğin %23'ünü kaplıyordu — yatayda oran neredeyse iki katına çıkıyor.)
- **Kapattığı toprak:** haritanın 1× yatay ölçeği 0.9115 px/birim (harita 1000×452 birim →
  ekranda 912×412 px, yani yatayda harita ekranı tam dolduruyor). Bu ölçekte:
  - yatay şerit (sağ alt 164×44) → **0 parça** kapatıyor; harita kutusunun o köşesi deniz.
  - dikey sütun (sağ kenar 46×169) → yerine göre **3–6 parça** kapatıyor:
    Hakkari-Çukurca, Yüksekova-Şemdinli, Özalp-Başkale, Iğdır, Doğubayazıt, Erciş-Muradiye.

İki ölçünün ikisi de yatay şeridi işaret ediyor, o yüzden şerit korundu. Gerekçe `App.js`'e
yorum olarak yazıldı; fikir değişirse tek satır (`telefon ?` koşulunu ters çevir).
**Tasarım belgesine ayrıca işlenecek (Adım 7).**

**`olcu.js` ölçütü aynen kaldı.** "Kısa kenar < 600 dp = telefon" doğru; kısa kenar tam bu
yüzden seçilmişti, döndürmeden etkilenmiyor. Değişen tek şey: yatayda kısa kenar artık
YÜKSEKLİK, yani arayüz kutuları dikeyde cimri davranmalı.

**Ölçüm rakamı (Adım 2'ye girdi):** dik tutuş 0.412 px/birim, yatay tutuş 0.9115 px/birim
→ yatayda harita **2.21 kat** büyük. Belgedeki 0.912 ve "2.2 kat" doğrulandı.
Türkiye karasının harita kutusundaki gerçek sınırları: x 12.0–988.0, y 12.0–439.7.

`npm run kontrol` temiz (85 test), `npx expo export` hatasız (4.76 MB).

## Adım 1 eki — iki cihaz düzeltmesi (Baki geri bildirimi, 2026-07-27)

Cihaz testi olumlu geçti (yatay açılıyor, harita alanı yeterli, düğmeler rahat, panel iyi).
İki istek geldi:

**1. Tur bitirmeye onay.** `src/bilesenler/Onay.js` — yeni ortak onay kutusu. Sistemin kendi
uyarısı (`Alert`) kullanılmadı: beyaz/yuvarlak görünüyor, oyunun koyu komuta masası havasını
bozuyor ve Android ile iPhone'da farklı çıkıyor. Kutu oyunun temasında, her cihazda aynı.
BİTİR düğmesi artık doğrudan turu bitirmiyor, kutuyu açıyor; kutu **ne kazanılacağını da
gösteriyor** ("KASANA GİRECEK +10 nüfus / +10 ekonomi"), böylece onay boş bir "emin misin?"
olmuyor. Dışarı dokunmak vazgeçiriyor. Bileşen genel yazıldı — Adım 4'teki ÜRET onayında da
kullanılacak.
> Kural olarak yazıldı: onay yalnızca GERİ ALINAMAZ işlerde sorulur. Her tıklamada soru
> çıkarsa oyuncu okumadan onaylamaya başlar ve onayın faydası kalmaz.

**2. Samsung gezinme çubuğu yatakta yan kalıyordu.** Sebep: uygulama yataya kilitli ama
telefonun otomatik döndürmesi kapalıyken sistem çubuğu dik konumda kalıyor, geri/ana sayfa
ikonları 90° dönük görünüyor. Çözüm: **çubuğu gizle** (`expo-navigation-bar`,
`setVisibilityAsync('hidden')` + `setBehaviorAsync('overlay-swipe')`). Oyun tam ekran oluyor,
yatık ikon sorunu kökten bitiyor; kenardan kaydırınca düğmeler geçici olarak geliyor — yani
kaybolmuyor, saklanıyor (tam ekran oyunların standart davranışı). Sistem uygulamaya geri
dönüldüğünde çubuğu tekrar açabildiği için `AppState` ile her öne gelişte yeniden gizleniyor.
Geri almak için `yonlendirme.js`'te `'hidden'` → `'visible'`.

## Adım 2 — Yakınlaştırma katmanları (ÖLÇÜM BİTTİ, Baki'nin kararı bekleniyor)

Yeni betik: `scripts/rozet-katman-olcum.js`. Çıktılar: **`veri/rozet-katman-olcum.md`** +
**`onizleme/rozet-katman-testi.html`** (kaydırıcılı önizleme). Görev 03B'nin
`veri/parca-olcum.md` belgesi dik tutuş referanslı ve yalnızca parça ölçüyordu; başına
"güncel ölçüm burası değil" uyarısı kondu, tarihsel kayıt olarak duruyor.

**1. Gerçek yakınlaştırma aralığı raporlandı: `0.9× – 7×`.** Koddan okundu —
`src/bilesenler/Harita.js` pinch sınırları (`if (n < 0.9) n = 0.9; if (n > 7) n = 7`).
Yani 1×'in biraz ALTINA inilebiliyor, en fazla 7 kat yaklaşılabiliyor.

**2. Ölçüm yatay tutuşa göre yeniden yapıldı.** 1 harita birimi = **0.9115 px**
(dik tutuşta 0.4120 — yatayda harita **2.21 kat** büyük). Rozet 26 px ve **haritayla
büyümüyor**, o yüzden ölçüt: `iç çember × 0.9115 × zoom ≥ 26`.

**3. Belgede olmayan ama gereken ikinci ölçü: ÇAKIŞMA.** Görev belgesi yalnızca "rozet
şekle sığıyor mu" diye soruyor. Ama asıl okunabilirlik sorusu "rozet komşusunun rozetini
eziyor mu" — bu ölçülmezse orta katman 1×'te kalabalıktan okunmaz çıkabilirdi. İki rozet
merkezi ekranda 26 pikselden yakınsa daireler biniyor; bu da tarandı. Sonuç: çakışmanın
tamamen bitmesi **il için 1.05×**, **parça için 1.97×**.

**4. Katman sınırı önerisi — elle yazılmadı, ölçümden TÜREDİ.** Ölçüt: şekillerin ≥%90'ına
rozet sığsın VE hiç çakışma olmasın. Bu ikisini birlikte karşılayan ilk yakınlaştırma:

| Katman | Aralık | Ne görünür | O sınırda durum |
|---|---|---|---|
| **Uzak** | 0.9× – 1.15× | yalnızca harita | — |
| **Orta** | 1.15× – 2.15× | il başına tek rozet | 74/81 il sığıyor, 0 çakışma |
| **Yakın** | 2.15× – 7× | parça başına rozet | 177/181 parça sığıyor, 0 çakışma |

**5. BULGU — "uzak katman" bir zorunluluk değil, tercih.** En uzak seviyede (0.9×) bile il
rozetlerinin **%70'i zaten sığıyor** ve yalnızca 8 tanesi çakışıyor. Yani harita yatayda o
kadar büyük çiziliyor ki, il rozetleri neredeyse hemen okunur hâle geliyor. "Uzakta harita
temiz kalsın" kararı okunabilirlik gereği değil, görsel sadelik tercihi — istenirse ilk
sınır yukarı çekilip uzak katman genişletilebilir. **Bu karar Baki'nin.**

**6. Gelibolu sorunu küçüldü ama bitmedi.** 7×'te sığmayan parça **sıfır** — yani yeterince
yaklaşınca hepsine rozet sığıyor. Ama önerilen yakın sınırında (2.15×) hâlâ 4 parça taşıyor:

| Parça | İç çember | Rozetin sığması için gereken |
|---|---|---|
| Yalova | 8.6 | 3.32× |
| Gelibolu Yarımadası | 10.1 | 2.83× |
| İskenderun Körfezi | 12.8 | 2.23× |
| Gebze Sanayi | 13.0 | 2.20× |
| (Kilis 13.6 → 2.10×, önerilen sınırda sığıyor) |||

Çözüm Adım 5'te: bu dördünün rozeti elle belirlenen bir noktaya (şeklin dışına, denize/boşluğa
doğru, ince çizgiyle bağlı) konacak. Kaydırma her yakınlaştırmada geçerli olacağı için
sorun tek seferde kapanıyor.

**Önizlemede ayrıca:** "kaç parçada ordu var" kaydırıcısı — gerçek oyunda **boş parçada rozet
yoktur**, parçaların çoğu boş olacağı için kalabalık ölçümün gösterdiğinden az. Önizleme bunu
taklit ediyor (varsayılan %35).

`npm run kontrol` temiz (85 test), `npx expo export` hatasız.

### Katman sınırları — Baki'nin kararı (2026-07-27)

| Katman | Aralık | Kararın o sınırdaki karşılığı |
|---|---|---|
| **Uzak** | 0.90× – 1.35× | harita temiz |
| **Orta** | 1.35× – 2.70× | 78/81 il rozeti sığıyor (%96), **0 çakışma** |
| **Yakın** | 2.70× – 7× | 179/181 parça rozeti sığıyor (%99), **0 çakışma** |

Baki önerdiğim sınırlardan (1.15× / 2.15×) daha geniş seçti ve bu **daha iyi çıktı**:
yakın katman 2.70×'te açıldığı için elle kaydırılacak parça **4'ten 2'ye indi**.

**Elle kaydırılacaklar (Adım 5'te yapılacak):**
- Yakın katman: **Gelibolu Yarımadası** (2.83× gerek) ve **Yalova** (3.32× gerek).
- Orta katman (il rozeti): **Yalova** (3.31×) ve **Kilis** (2.10×). Iğdır 1.36× gerektiriyor,
  yani yalnızca 1.35–1.36 arasındaki kıl payı şeritte taşıyor — kaydırma gerektirmez.

Sınırlar `src/denge.js` → `DENGE.ROZET` içinde (`ORTA_SINIR`, `YAKIN_SINIR`, `CAP`).

## Adım 3 — Ordu veri modeli ve denge sabitleri

**`src/denge.js`** — birim tablosu tasarım §3.1'den birebir girildi (`DENGE.BIRIMLER`):
piyade 3 nüfus/1 ekonomi, topçu 2/3, zırhlı 1/6. Muharebe statları (zırh, ağır vuruş,
hafif vuruş, dayanıklılık) da şimdiden modele kondu — Görev 05 onları okuyacak, o zaman
birim tanımı yeniden icat edilmesin. Ayrıca `BIRIM_SIRASI`, `SANAYI_SINIRI_ACIK` ve
`ROZET` (çap + iki katman sınırı + 99 kuralı). **Hiçbir denge sayısı kodun içinde değil**;
testte kanıtlanıyor: denge sayısı değiştirilip bedelin değiştiği doğrulanıyor.

**`src/oyun/ordu.js` (YENİ)** — tüm ordu mantığı. `durum.ordular` yapısı görev belgesi
§8.2'deki gibi: `{ "16-1": { sahip: "16", birimler: { piyade: 3, topcu: 1 } } }`.
Boş parça için kayıt tutulmuyor. Fonksiyonlar: `siparisMaliyeti`, `birimSayisi`,
`parcaBirimSayisi`, `aktorBirimSayisi`, `ilOrduDurumu`, `tumIlOrdulari` (orta katman her
karede çizileceği için tek geçiş), `ilUretimHakki`, `siparisGecerliMi`, `birimUret`,
`rozetYazisi`, `rozetKatmani`, `orduDokumu`.

**Sanayi sınırı — bir tasarım boşluğu doldurmam gerekti.** Cevap A "o ilde tur başına en
fazla sanayi kadar birim" diyor ama sayacın KİME ait olduğunu söylemiyor. Aynı ilin
parçaları iki düşmanın elindeyse tek sayacı paylaşmaları saçma olurdu (birinin ürettiği
ötekinin hakkını yerdi). Sayaç **aktör başına** tutuluyor:
`durum.buTurUretim[aktorId][ilKodu]`, her tur sıfırlanıyor (`turDongusu.js`).
Kapasite ilin kendi statından geliyor, kaç parçasını tuttuğundan DEĞİL — orantılamak
tasarımda olmayan yeni bir kural icat etmek olurdu.

**Bütçe karşılaştırması aşağı yuvarlanıyor.** Havuz kesirli saklanıyor (§6.4) ama ekranda
aşağı yuvarlanarak gösteriliyor. Oyuncu ekranda "18 nüfus" görüp 18'lik sipariş
verebilmeli, o yüzden yeterlilik kontrolü de `Math.floor` ile yapılıyor. Yoksa "18 yazıyor
ama yetmiyor" gibi açıklanamaz bir ret çıkardı.

**Kayıt sürümü 3 → 4.** Sürüm 1–3 reddediliyor. Sürüm 3 için sebep ayrı: harita aynı ama
ordu alanı yok; yüklenirse oyuncu ordusuz bir oyuna düşer ve neden asker basamadığını
anlamaz. `kayitVerisi.js` `ordular` ve `buTurUretim` alanlarını doğruluyor — ama **boş
olmalarına izin veriyor** (oyun başında hiç ordu yoktur; `parcaSahipligi` gibi "dolu mu"
kontrolü yapılamaz).

**Kayıt boyutu ölçüldü:** ordusuz 12.0 KB · oyuncu 10 tur asker basmış 12.8 KB ·
**en kötü durum (181 parçanın hepsinde 99 birim) 24.4 KB**. Boş parça kaydı tutulmadığı
için gerçek oyunlarda 13 KB civarında kalacak.

**Testler:** `testler/ordu.test.js` — 23 yeni test. Kapsananlar: maliyetler denge.js'ten
türüyor (gömülü değil), bütçe aşılamıyor, kesirli havuz aşağı yuvarlanıyor, yabancı ve
kapsam dışı parçaya basılamıyor, boş parça kayıt tutmuyor, sanayi sınırı tutuyor /
ilin iki parçası tek havuzu paylaşıyor / sayaç her tur sıfırlanıyor / sayaç aktör başına /
denge düğmesiyle kapanıyor, il ve parça toplamları doğru, baskın sahip en çok birimi olan,
99+ kuralı, katman sınırları. `kayit.test.js` sürüm 4'e güncellendi + ordu gidiş-dönüş testi.

**Toplam 114 test geçiyor**, `npm run kontrol` temiz, `npx expo export` hatasız (4.77 MB).
Bu adımda ekranda hiçbir şey değişmedi — ordular var ama henüz satın alma ekranı (Adım 4)
ve rozetler (Adım 5) yok.

## Adım 4 — Üretim ekranı

**`src/bilesenler/UretimEkrani.js` (YENİ).** Tasarım §4.2'deki ekran: üstte BÜTÇE, üç birim
satırı (`[−] n [+]`, yanında birim bedeli), altta KALAN + ÜRET. Kalan anlık güncelleniyor.
Hiçbir harmanlama yok — oyuncu ne dizdiyse motor tam olarak onu üretiyor.

**Panelden açılıyor** (Soru 1 → cevap A): kendi parçana dokununca panelde **ASKER BAS**
düğmesi çıkıyor, ordu o parçada doğuyor. Yabancı parçada düğme yok.

**Yerleşim: ortada kutu, arka KARARTILMIYOR.** Görev belgesi bunu özellikle istiyor —
"nereye asker bastığını görmeden karar vermek zor". Tur onayı kutusu tam tersi: orada arka
bilerek kararıyor, çünkü orada haritaya bakmanın faydası yok. Yatay telefonda yükseklik kıt
olduğu için kutu telefonda dikeyde sıkılaşıyor (380→330 genişlik, iç boşluklar küçülüyor).

**`[+]` tuşu kuralı iki yerde ama TEK kaynaktan.** Ekran oyun durumunu tanımıyor (diğer
bileşenler gibi düz veri alıyor), ama tuşun ne zaman söneceği kuralı motorunkinden
ayrışmamalı — ayrışırsa oyuncu basabildiği bir tuşta ret yer. Bu yüzden `ordu.js`'e
`eklenebilirMi(tur, siparis, havuz, kalanHak)` eklendi; ekran onu, satın alma
`siparisGecerliMi`'yi kullanıyor, ikisi de aynı `siparisMaliyeti` ve aynı DENGE sayılarını
okuyor. **Test bunu kanıtlıyor:** 125 farklı sipariş × 3 birim türü taranıp iki kuralın hep
aynı cevabı verdiği doğrulanıyor.

**Ret sebepleri ayrıştırıldı.** `siparisGecerliMi` artık `kod` da döndürüyor
(`nufus` | `ekonomi` | `sanayi` | `sahiplik` | `kapsam` | `bos` | `aktor`). Sebebi:
belgenin özel isteği — **bütçe yetmeyince hata mesajı ÇIKMIYOR**, o satırın `[+]` tuşu
sessizce sönüyor (her tıklamada uyarı çıkan ekran uyarıları okunmaz hâle getirir).
Ama **sanayi sınırı görünmeyen bir kural** olduğu için yazıyla açıklanıyor:
"Sanayi sınırı: 4/7 — bu ilde bu tur bu kadar."

Sönük tuş **yerinde duruyor**, kaybolmuyor — kaybolsaydı satırlar zıplar, oyuncu şaşırırdı.

**İki boş durum ayrı ayrı karşılanıyor** (§9: "boş liste gösterme"):
- Sanayi hakkı bittiyse → "Bu ilin sanayisi bu tur doldu (7/7). Turu bitirince yenilenecek."
- Bütçe hiçbir şeye yetmiyorsa → "Bütçen hiçbir birime yetmiyor. Turu bitirip kaynak
  biriktirmen gerek."
İkisi ayrı mesaj, çünkü oyuncunun yapması gereken şey farklı.

**Seçim değişince ekran kapanıyor** (`App.js onSec`). Yoksa başlıkta yazan parça ile askerin
doğacağı parça ayrışır ve oyuncu askeri yanlış yere basar.

**ÜRET yalnızca başarıysa kapanıyor.** Ekran geçersiz siparişi zaten engelliyor; oraya
düşmek bir hata olur ve o durumda kapatmak oyuncunun dizdiği siparişi sessizce çöpe atardı.

**4 yeni test (toplam 118).** `npm run kontrol` temiz, `npx expo export` hatasız.

## Adım 5 — Rozetler haritada

**`src/bilesenler/Rozet.js` (YENİ)** — tek bir sayı balonu. **`KatmanIzleyici.js` (YENİ)** —
yakınlaştırmayı izleyip hangi katmanda olduğumuzu React'e bildiren köprü.
**`rozetKaydirma.js` (YENİ)** — rozeti kendi şekline sığmayan yerlerin elle seçilmiş yönleri.

**Rozet haritanın İÇİNDE değil, ÜSTÜNDE ayrı bir katmanda.** Harita katmanı yakınlaştırmayla
ölçekleniyor; rozet ölçeklenmemeli (Baki'nin kararı, Adım 2 ölçümünün dayanağı). Bu yüzden
her rozet kendi ekran yerini `Harita.js`'in dokunma testinin TERSİ hesapla buluyor
(orada ekran→harita, burada harita→ekran).

**Kare başına rozet başına TEK hesap.** Rozetin haritadaki çıpası her karede hareket ediyor
ama kaydırma ekran pikseli cinsinden sabit; bu yüzden yalnızca çıpa canlandırılıyor,
bağlantı çizgisi ile balon onun içinde sabit duruyor. Boş parça/il listeye hiç girmiyor —
"boş parçada rozet yok" kuralı (§7.2) aynı zamanda performansın kaynağı: **181 rozet asla
aynı anda çizilmiyor.**

**Katman geçişi solmalı** (§10: "ani olmasın") — reanimated `FadeIn`/`FadeOut`, 160 ms.

**Yazı rengi hesaplanıyor.** Rozet sahibinin rengiyle doluyor; 81 ilin rengi açıktan koyuya
değişiyor ve tek bir yazı rengi hepsinde okunmuyor. `tema.js okunakliMetin()` parlaklığa
(BT.601) bakıp koyu veya açık yazı seçiyor. "99+" için balon YATAYDA genişliyor,
yüksekliği 26 px kalıyor — ölçümün varsayımı bozulmasın.

### Kaydırılan rozetler ve dokunma

Kaydırma **ekran pikseli** cinsinden, harita birimi değil. Harita biriminde olsaydı
yakınlaştırdıkça rozet parçasından uzaklaşır, 7×'te 128 piksel öteye savrulurdu. Piksel
sabit olunca bağlantı çizgisinin boyu ve açısı da her yakınlaştırmada aynı kalıyor.
Her yön elle seçildi ve **katmanın tüm yakınlaştırma aralığı boyunca boş suya/boşluğa
düştüğü betikle doğrulandı**:

| Şekil | Katman | Yön | Nereye |
|---|---|---|---|
| Gelibolu Yarımadası (17-1) | yakın | (−24, 0) | batıya, Ege'ye |
| Yalova (77-1) | yakın | (−18, −16) | kuzeybatıya, Marmara'ya (tam kuzey İstanbul'a denk geliyor) |
| Yalova ili (77) | orta | (−18, −16) | aynı yön |
| Kilis ili (79) | orta | (0, +24) | güneye, Suriye tarafındaki boşluğa |

**Dokunma çözümü.** Rozet katmanı dokunma almıyor (`pointerEvents="none"`), yani parmak
rozetin üstüne bassa bile dokunma haritaya geçiyor ve altındaki parça seçiliyor — "rozet
seçimi engellemesin" kuralı kendiliğinden sağlanıyor. Kaydırılmış iki rozet denizin üstünde
durduğu için `hitSelect`'e küçük bir ön kontrol eklendi: kaydırma tablosundaki noktalara
basmak o parçayı seçiyor.
> **Yan etki bilinçli:** tablo sabit olduğu için rozetin o an çizili olup olmadığına
> bakılmıyor. Yani Gelibolu ve Yalova, ordusu olmasa bile bu küçük ek alandan seçilebiliyor.
> Haritanın en küçük iki parçası oldukları için bu bir kolaylık, kusur değil.

### Lint engeli ve çözümü (not: tekrar yaşanabilir)

Katman köprüsünü ilk olarak `Harita.js` içine koydum. React derleyicisinin lint kuralı
reanimated shared value'larını "ref" sayıp **çalışan pan/pinch/tap kodunu** hatalı
işaretledi. İki adımda çözüldü, ikisi de çalışan jest koduna dokunmadan:
1. Köprü ayrı bir bileşene alındı (`KatmanIzleyici.js`) — o dosyada başka shared value
   kullanımı yok, yan etki oluşmuyor.
2. Dokunma testindeki `useRef` kaldırıldı; kaydırma tablosu zaten **sabit bir modül
   içe aktarımı**, ref'e gerek yoktu. (Ref, `hitSelect` üzerinden jeste geçtiği için
   "render sırasında ref okuma" hatası veriyordu.)

Bu yüzden `jest` useMemo'su rozetlere BAĞLI DEĞİL — bağlı olsaydı her asker basıldığında
veya katman değiştiğinde jest yeniden kurulur, süren yakınlaştırma kesilirdi.

### Panelde ordu

Seçili parçanın altında **BURADAKİ ORDU** kutusu: toplam sayı, "3 piyade, 1 topçu, 1 zırhlı"
dökümü ve her birimin zırh/dayanıklılık statları. Rozet yalnızca sayıyı gösteriyor
(rozete üç sayı sığmaz, §7.2); karışım panelde. Görev 05'te muharebe tahmini bu kutunun
altına gelecek.

**7 yeni test (toplam 125).** Kaydırma testleri **ölçümü yeniden çalıştırıyor**: harita veya
katman sınırları değişirse "şu parça taşıyor ama kaydırılmamış" diye patlıyorlar — rozetler
sessizce taşmaya başlamasın. `npm run kontrol` temiz, `npx expo export` hatasız.

### Düzeltme — `setBehaviorAsync` uyarısı (Baki bildirdi, 2026-07-27)

`WARN setBehaviorAsync isn't supported with edge-to-edge enabled` uyarısı geliyordu.
Sebep: **Expo SDK 54'te Android'de edge-to-edge her zaman açık** (arayüz sistem
çubuklarının altına da uzanıyor) ve o modda `setBehaviorAsync` desteklenmiyor — çağrı
hiçbir şey yapmadan konsola uyarı basıyor.

`expo-navigation-bar` kaynağından doğrulandı: uyarı listesinde `setBehaviorAsync`,
`setPositionAsync`, `setBackgroundColorAsync` vb. var; **`setVisibilityAsync` YOK**, yani
o destekleniyor ve çubuğu gizleme işini tek başına görüyor. Çalışmayan çağrı KALDIRILDI —
uyarıyı susturmak için işe yaramayan bir satır tutmanın anlamı yok.

**Davranış farkı (bilinmeli):** `overlay-swipe` ayarlanamadığı için, oyuncu kenardan
kaydırıp çubuğu geri getirirse çubuk kendiliğinden çekilmiyor, görünür kalıyor.
Uygulamadan çıkıp geri girince tekrar gizleniyor (`AppState` kancası). Bu davranış
rahatsız ederse çözüm, çubuk her göründüğünde yeniden gizlemek olur — ama o da oyuncunun
bilerek açtığı çubukla inatlaşmak demek, o yüzden şimdilik yapılmadı.

### Düzeltme — "rozetKatmani is not a function" (Baki bildirdi, 2026-07-27)

Oyun açılınca hata veriyordu, rozet katmanı hiç çalışmıyordu.

**Sebep:** `KatmanIzleyici.js`'in içindeki karşılaştırma **UI iş parçacığında** (worklet)
çalışıyor. Oraya yalnızca "worklet" olarak işaretlenmiş kod ve düz değerler geçebiliyor;
başka bir dosyadan içe aktarılmış SIRADAN bir fonksiyon (`ordu.js`'teki `rozetKatmani`)
orada yok sayılıyor ve çağrılınca "is not a function" hatası veriyor. Babel eklentisi
(`react-native-worklets/plugin`) yalnızca `'worklet'` etiketli fonksiyonları taşıyor,
`rozetKatmani`'nde o etiket yoktu.

**Çözüm:** katman sınırları `KatmanIzleyici`'ye **düz sayı** olarak geçiriliyor ve
karşılaştırma worklet'in içinde yerinde yapılıyor. `ordu.js rozetKatmani` JS tarafı için
duruyor (paneller, testler).

**Kural artık iki yerde** — bu bilinçli bir ödün, alternatifi yoktu. Ayrışmayı yakalamak
için `testler/rozet.test.js`'e test eklendi: 0.9× – 7.0× aralığını 0.01 adımlarla tarayıp
iki kuralın **aynı cevabı** verdiğini doğruluyor, sınırların tam üstünü ayrıca sınıyor.
Biri değişip öteki unutulursa test patlar.

**Ders (Görev 05'te tekrar yaşanacak):** UI iş parçacığında çalışan koda başka dosyadan
fonksiyon geçirilemez. Ya fonksiyona `'worklet'` yazılır ya da değer olarak geçirilip
hesap yerinde yapılır. Denetim yapıldı: `Rozet.js`'in `useAnimatedStyle`'ı yalnızca
`Math.min` ve shared value okuyor, başka dış çağrı yok.

126 test geçiyor, `npm run kontrol` temiz, `npx expo export` hatasız.

### Rozet tasarımı: daire → KALKAN (Baki isteği, 2026-07-27)

"Dümdüz yuvarlak yerine savaşı yansıtan bir şey" istendi. Rozet artık **armalı kalkan**:
düz omuzlar, yanlardan daralıp uca inen klasik biçim; sahibin rengiyle dolu, koyu kenarlı,
üstte yarı saydam **pirinç şerit** (oyunun komuta masası paletiyle aynı vurgu — düz dolgu
yassı duruyordu). `react-native-svg` ile çiziliyor, sayı üstüne normal yazı olarak
konuyor (özel yazı tipleri SVG yazısında değil, normal yazıda net çıkıyor).

**Kalkan 26×26 kutunun İÇİNDE kalıyor** — bu şart. Adım 2 ölçümünün tamamı "26 piksellik
rozet şekle sığıyor mu" sorusuna dayanıyor; kalkanı büyütmek 181 parçalık o ölçümü
geçersiz kılardı. Bu yüzden üç haneli sayıda ("99+") kalkan GENİŞLEMİYOR, yazı küçülüyor.
(Eski daire tasarımında balon yanlara genişliyordu; o yaklaşım terk edildi.)

Tasarım tahminle değil, çizilip bakılarak onaylandı: `onizleme/rozet-tasarim.html` —
gerçek boyda (26 px) sekiz farklı il renginde + 4 kat büyütülmüş biçim denetimi.
Açık ve koyu il renklerinin ikisinde de sayı okunuyor (`tema.js okunakliMetin`).

### Katman geçişindeki sertlik — asıl sebep sınırda TİTREME imiş

Baki: "haritada uzaklaşıp yakınlaşınca birlikler ana merkezde birleşiyor ayrılıyor,
hiç soft değil."

**Teşhis:** kusur solma süresinde değildi. Tek eşikle çalışırken parmak tam sınırın
(2.70×) üstünde dururken minik titremeler yakınlaştırmayı 2.69 ↔ 2.71 arasında oynatıyor,
katman saniyede birkaç kez değişiyordu. Parça rozetleri il rozetine "birleşip" tekrar
"ayrılıyor" gibi görünmesinin sebebi buydu.

**Çözüm 1 — histerezis (`DENGE.ROZET.GECIS_PAYI = 0.25`).** Geçişin artık iki eşiği var:
yakınlaşırken sınırda geçiliyor, uzaklaşırken sınırın 0.25 altına inmek gerekiyor. Kapı
yayı gibi: bir kez geçtikten sonra geri dönmek zorlaşıyor, sınırda oyalanmak katmanı
titretmiyor. Şu anki katman `KatmanIzleyici`'ye düz metin olarak geçiyor (worklet'e nesne
değil değer gitmeli).

**Çözüm 2 — çıkış solması artık gerçekten çalışıyor.** Rozet kabı `cizilecek` boşken
tamamen sökülüyordu; kap sökülünce içindekilerin çıkış animasyonu iptal oluyor ve "uzak"
katmana geçerken rozetler birden yok oluyordu. Kap artık HER ZAMAN duruyor, içi boşalıyor.
Solma süresi 160 → **220 ms**.

**Testler (toplam 127).** Histerezis testi üç şeyi birden doğruluyor: (1) sınırda titrerken
katman değişmiyor, (2) gerçekten uzaklaşınca geçiş yine oluyor — katman kilitlenmiyor,
(3) pay orta katmanı yutacak kadar geniş değil ve alt sınır 0.9× yakınlaştırmanın altına
inmiyor. Ayrıca JS ve UI kurallarının ayrışma testi histerezise göre yenilendi: geçiş
bantlarının dışında, hangi katmandan başlanırsa başlansın iki kural aynı yere oturmalı.

## Adım 6 — Geçen turun siparişini tekrarla

Baki 23 Temmuz'da işaret etmişti: 40 ili olan oyuncunun her tur tek tek birim basması
yorucu; uzun maçlarda bu düğme zorunlu hâle geliyor.

**Hafıza:** `durum.sonSiparis = { parcaId, birimler }`. **Tek sipariş** tutuluyor — geçmiş
listesi yok, şablon kaydetme/yükleme yok (§11 kapsam sınırı). Tur geçince silinmiyor; adı
"geçen tur" ama aslında "en son verdiğin sipariş". Kayda giriyor, gidiş-dönüşte korunuyor.

**Düğme tur çubuğunun içinde**, sol ucunda. Ayrı bir yüzen düğme eklemedim: yatay tutuşta
yükseklik zaten kıt. Yalnızca hatırlanan bir sipariş varken görünüyor. Tablette altına
özet de yazıyor ("4 piyade, 1 topçu · Bursa Ovası"), telefonda yalnızca "TEKRARLA".

**`src/bilesenler/Bildirim.js` (YENİ)** — tur çubuğunun altında beliren, ~4.5 saniyede
kendiliğinden kaybolan tek satır. Gerekliydi: §11 "ne bastığını SÖYLER" diyor. Onay kutusu
bu iş için ağır (cevap beklemiyoruz), panel de kapalı olabilir. Dokununca hemen kapanıyor.

### İki ince karar

**1. Kısmi basımda KARIŞIM ORANI korunuyor.** Bütçe yetmediğinde türler arasında sırayla
ilerlenip her turdan birer tane ekleniyor. Tek türü sonuna kadar basmak, "2 piyade +
2 zırhlı" siparişini bütçe yarıya inince "2 piyade"ye çevirirdi — oyuncunun kurduğu denge
bozulurdu. Şimdi "1 piyade + 1 zırhlı" çıkıyor.

**2. Yarım basım HAFIZAYI BOZMUYOR.** `birimUret`'e `hatirla` parametresi eklendi;
tekrarlama sırasında `false` geçiliyor. Yoksa bütçe yetmeyip yarısı basıldığında hafıza da
yarıya düşer ve sipariş her turda biraz daha küçülürdü — oyuncu bunu fark bile etmezdi.

### Mesajlar (hepsi test ediliyor)

| Durum | Mesaj |
|---|---|
| Hafıza boş | "Henüz sipariş vermedin — tekrarlanacak bir şey yok." |
| Parça senaryo dışı | "<Parça> artık oyunun dışında — sipariş atlandı." |
| Parça artık senin değil | "<Parça> artık senin değil — sipariş atlandı." |
| Tam basıldı | "<Parça>: 4 piyade, 1 topçu basıldı." |
| Kısmi | "<Parça>: 2 piyade basıldı. 2 piyade için bütçe yetmedi." |
| Hiç basılamadı | "<Parça>: hiçbir şey basılamadı — bütçe yetmedi / sanayi sınırı doldu." |

Sanayi sınırı ile bütçe yetmezliği **ayırt ediliyor** — oyuncunun yapması gereken şey
farklı (biri "turu bitir", öteki "başka ile bas").

**10 yeni test (toplam 137).** `npm run kontrol` temiz, `npx expo export` hatasız.

### Geçiş, ikinci düzeltme — çapraz solma → SÜRÜKLENEN BİRLEŞME (Baki, 2026-07-27)

Histerezis sınırdaki titremeyi durdurdu ama Baki asıl şikâyeti tekrarladı: "hızlıca yapınca
birleşme ayrılma hiç güzel değil."

**Teşhis (ilk teşhisim eksikmiş):** iki ayrı kusur vardı, birincisini çözmüştüm.
İkincisi şuydu — rozetler sınırda **takas** ediliyordu: bir takım sökülüp öteki kuruluyor,
aradaki geçiş de ZAMANA bağlı bir solma animasyonuyla örtülüyordu. Hızlı yakınlaştırmada
bu animasyonlar birbirini kesiyor, üstelik il rozeti ile parça rozetleri farklı yerlerde
belirip kaybolduğu için "birleşme" diye bir hareket hiç görünmüyordu.

**Çözüm: geçişi zamandan koparıp doğrudan YAKINLAŞTIRMAYA bağladım.**

1. **Saydamlık artık her karede `sc.value`'dan hesaplanıyor** (`Rozet.js`). Zamana bağlı
   `FadeIn`/`FadeOut` tamamen kaldırıldı — ikisi aynı özelliği (opacity) çekiştirip
   titreme yapardı. Sonuç: parmağını durdurursan geçiş de durur, yarı yolda kalır.
   Kesilecek animasyon olmadığı için hızlı yakınlaştırma sadece "hızlı geçiş" demek.
2. **Parça rozetleri artık İLİNİN rozetinden DOĞUYOR.** Konum, görünürlük ilerlemesi
   boyunca birleşme noktasından asıl yere karışıyor (`kaynakX/kaynakY`). Uzaklaşırken
   geri kayıp sönüyorlar. "Birleşme / ayrılma" böylece gerçek bir hareket oldu.
3. **Geçiş bandında İKİ TAKIM DA kurulu duruyor** (`KatmanIzleyici` artık
   'yok' | 'il' | 'ikisi' | 'parca' döndürüyor). Ekleme/çıkarma hep saydamlık sıfırken
   yapılıyor (`HAZIRLIK_PAYI`), yani oyuncu hiçbir zaman bir rozetin birden belirdiğini
   görmüyor.

**Histerezis (`GECIS_PAYI`) KALDIRILDI** — artık gereksiz. Ayrık bir katman anahtarı
kalmadığı için sınırda titreyecek bir şey de yok; sorunu kaynağında çözen tasarım,
üstüne yama koymaktan iyi. Yerine `SOLMA_BANDI` (0.25) ve `HAZIRLIK_PAYI` (0.1) geldi.

**Testler yenilendi (toplam 140).** Dördü bu tasarımın kurallarını koruyor:
- **Görünen her rozet KURULU** — saydamlığı sıfırdan büyük olan bir rozetin takımı
  kurulu değilse oyuncu onun birden belirdiğini görür. Asıl kusur buydu.
- **Ekleme/çıkarma hep saydamlık sıfırken** oluyor.
- **Geçişin ortasında ekran boşalmıyor** — il rozeti sönerken parça rozeti doğduğu için
  toplam görünürlük 1'in altına düşmemeli.
- **Parça rozeti ilinin rozetinden doğuyor** — konum karışımı uçlarda tam oturuyor,
  arada gerçekten yol alıyor (atlamıyor).
Ayrıca solma aralıklarının katman sınırlarıyla (`rozetKatmani`) birebir oturduğu
doğrulanıyor: il rozeti tam 1.35×'te görünür, tam 2.70×'te sönmüş; parça rozeti tam
2.70×'te görünür olur.

## Adım 7 — Belgeler ve testler

### `docs/il-savasi-tasarim.md`

- **§4.2** — sipariş tekrarı eklendi (kısmi basımda oran korunur, tek sipariş hatırlanır).
- **§4.3** — DOKUNULMADI. Bilerek boş; eski belgeler bu numaraya atıf yapıyor. (İlk
  denemede yeni konuyu buraya yazmıştım, geri aldım: eski atıflar bambaşka bir konuya
  işaret ederdi.) Yeni konular §4.6'dan devam ediyor.
- **§4.4** — garnizon/sefer ayrımının KALDIRILDIĞI ve gerekçesi yazıldı (Soru 3).
- **§4.6 YENİ** — "Ordu nerede üretilir: seç ve üret" (Soru 1) + sanayi sınırı +
  "bir parçada sert birim sınırı yok, yalnızca rozet 99'da durur" (Soru 4).
- **§5 madde 4** — sanayi statının tanımı "üretim hızı" → **tur başına üretim üst sınırı**
  (Soru 2), eski tanımın neden boşa düştüğü açıklandı.
- **§7** — rozet katman sistemi tek paragraf halinde eklendi: üç katman ve sınırları,
  rozetin haritayla büyümediği, 99+ kuralı, boş parçada rozet olmadığı, kaydırılan
  şekiller ve geçişin yakınlaştırmaya bağlı olduğu.
- **§8 madde 3** — takviye aşaması yeni akışa göre yazıldı (garnizon bölüşümü çıktı).
- **§14** — iki yeni denge düğmesi: sanayi üretim sınırı, rozet katman sınırları.
- **§15 madde 3** — uygulama sırası güncellendi.
- (§13.1 Expo düzeltmesi Adım 0'da yapılmıştı.)

### Doğrulamalar

- `denge.js` birim tablosu ile tasarım §3.1 **birebir** karşılaştırıldı: 18 sayının hepsi
  aynı (zırh / ağır / hafif / dayanıklılık / nüfus / ekonomi).
- Maliyetlerin koda gömülü OLMADIĞI testle kanıtlanıyor (denge sayısı değiştirilip
  bedelin değiştiği doğrulanıyor).
- `app.json` yönlendirme `landscape`.

### Görev 04 bitiş ölçütü — madde madde

**Kararlar**
- [x] Dört soru Baki tarafından cevaplandı, gerekçeleriyle bu belgeye yazıldı
- [x] Belgedeki üç kalıntı düzeltildi (Ankara 4, Erzurum istisnası, Expo)

**Yatay tutuş**
- [x] Uygulama yalnızca yatay açılıyor (`app.json` + `expo-screen-orientation`)
- [x] Harita tipi düğmeleri, tur çubuğu ve panel yatay ekrana uyarlandı — ikisi zaten
      uygundu, düğmeler ÖLÇÜMLE yatay şeritte bırakıldı (gerekçe yukarıda)
- [x] Telefonda test edildi, Baki onayladı ("harita alanı yeterli, düğmeler rahat")
- [x] Ek: Samsung gezinme çubuğu sorunu çözüldü, tur bitirmeye onay eklendi

**Rozet katmanları**
- [x] Gerçek yakınlaştırma aralığı raporlandı: **0.9× – 7×** (koddan okundu)
- [x] Ölçüm yatay tutuşa göre yeniden yapıldı (0.9115 px/birim) + çakışma ölçüsü eklendi
- [x] `onizleme/rozet-katman-testi.html` çalışıyor
- [x] Katman sınırları Baki tarafından onaylandı: 0.90–1.35 / 1.35–2.70 / 2.70–7
- [x] Boş parçada rozet yok, sahibinin renginde, 99+ kuralı çalışıyor
- [x] Gelibolu + Yalova (parça) ve Yalova + Kilis (il) için rozet konumu çözüldü
- [x] Ek: rozet tasarımı KALKAN oldu, geçiş yakınlaştırmaya bağlandı (Baki istekleri)

**Ordu ve üretim**
- [x] Birim maliyetleri `denge.js`'te, §3.1 ile birebir aynı (18 sayı karşılaştırıldı)
- [x] Üretim ekranı çalışıyor, bütçe anlık güncelleniyor, aşılamıyor
- [x] Bütçe yetmeyince `[+]` pasifleşiyor (hata mesajı YOK — belgenin özel isteği)
- [x] Üretilen birimler haritada rozet olarak görünüyor
- [x] Panelde ordu kompozisyonu görünüyor (BURADAKİ ORDU kutusu)
- [x] Sipariş tekrarı çalışıyor, kısmi basma doğru davranıyor (oran korunuyor)

**Genel**
- [x] Kayıt sürümü 4, sürüm 1–3 anlaşılır mesajla reddediliyor
- [x] `npm run kontrol` temiz, **140 testin hepsi geçiyor**
- [ ] Telefonda yatay tutuşta SON test — Baki'de (Adım 5–7 birlikte denenecek)
- [x] `URETIM-NOTU.md` güncel

**Kapsam korundu:** hareket ve muharebe YOK, araştırma/diplomasi/YZ YOK, yeniden toplanma
YOK, mod seçim ekranı YOK. Kaynak birikip orduya dönüşüyor, ordular üretildikleri yerde
duruyor — Görev 05'in girdisi hazır.

---

# AKICILIK VE DÜZEN ONARIMI (2026-07-27)

Baki: "oyunun genel akıcılığı biraz azalmış, kodların tamamına genel bir optimizasyon yap,
spagetti kodlar varsa düzelt."

## Bulunan üç gerçek performans sorunu

**1. Aktör renk tablosunun kimliği her hamlede değişiyordu.** `App.js` renk tablosunu
`oyun.aktorler`'den türetiyordu; ama o nesne HER TURDA ve HER SATIN ALMADA yeniden
doğuyor (havuzlar değiştiği için). Harita da bu tabloya bağlı olduğundan **181 parçanın
tamamı yeniden çiziliyordu** — asker basmak ve turu bitirmek boşuna tam çizim tetikliyordu.
Oysa aktör renkleri oyun boyunca hiç değişmez.
→ `oyunDurumu.js`'te `AKTOR_RENKLERI` sabiti: 81 il için bir kez hesaplanıyor, kimliği
hiç değişmiyor. `oyunKur` da artık aynı tablodan okuyor (tek kaynak).

**2. Her dokunuşta yine 181 parça yeniden çiziliyordu.** Seçim çerçevesi parçaların kendi
çizimlerinin içindeydi; parça seçmek tüm listeyi geçersiz kılıyordu — oysa değişen tek şey
bir çerçeveydi.
→ Harita iki katmana ayrıldı: `tabanEl` (dolgular, yalnızca renk/sahiplik değişince) +
`vurguEl` (seçili parça ve komşuları, yalnızca çerçeve). **Bir dokunuşun maliyeti 181
parçadan en fazla ~6 parçaya indi.** Yan fayda: vurgu artık il sınırlarının da üstünde
çizildiği için seçim daha net görünüyor.

**3. Rozetler her yeniden çizimde boşuna güncelleniyordu.** Panel açmak, tur bitirmek,
parça seçmek — hepsi ekrandaki bütün rozetleri yeniden çizdiriyordu.
→ `Rozet` artık `React.memo` ile sarılı. Konum ve saydamlık zaten UI iş parçacığında
güncelleniyor, React'in haberi olması gerekmiyor.

## Düzen: App.js ikiye ayrıldı

`App.js` **549 satıra** çıkmıştı ve tek başına yazı tipi yüklemeyi, ekran kilidini, oyun
durumunu, geliştirici araçlarını, rozet listelerini, üretim ekranını, bildirimleri ve tüm
yerleşimi yapıyordu. Ne olduğunu anlamak için tamamını okumak gerekiyordu.

**`src/oyunKancasi.js` (YENİ)** — iki kanca:
- `useOyun()` — durum, eylemler (tur, üretim, tekrar, kayıt, geliştirici), haritalık
  türetmeler (gelir, özet, rozet listeleri, bütçe).
- `useSeciliParca()` — yalnızca seçili parçanın panel bilgisi. Ayrı olmasının sebebi:
  seçim ekranın işi, oyunun değil; panel kapalıyken hesapları hiç çalışmıyor.

**Sınır net: burası OYUN, App.js EKRAN.** Kancada hiç görsel bilgi yok (renk, ölçü,
yerleşim); App.js'te hiç oyun kuralı yok. Yeni bir oyun kuralı kancaya, yeni bir düğme
ekrana. `App.js` 549 → **~330 satır**, üstelik yarısı yerleşim.

## Refactor sırasında yakalanan gizli çökme

Geliştirici araçları eskiden `if (!secili) return;` ile korunuyordu; taşırken bu koruma
düştü ve `iliAl(null)` → `PARCALAR[null].kod` çökmesi ortaya çıktı. Pratikte tetiklenmezdi
(düğmeler yalnızca panel açıkken görünüyor) ama çağıranın dikkatine bırakılamaz.
Koruma dört eylemin de içine kondu.

## Ölü kod

- `olcu.js sec()` — hiçbir yerde kullanılmıyordu, SİLİNDİ (yerine niye silindiğini anlatan
  tek satır not).
- `ordu.js rozetKatmani()` — ekran artık çağırmıyor ama ölü değil: katmanların **resmî
  tanımı** ve `rozet.test.js` çizimin solma aralıklarının bu sınırlarla oturduğunu ona
  bakarak doğruluyor. Bu rol yorumla yazıldı.
- `tema.js ARAZI_CARPAN` — muharebe çarpanları, Görev 05'te okunacak. "Henüz
  kullanılmıyor" notu eklendi.
- `aktorParcalari`, `sonTurGeliri` — küçük ve doğru API'ler, testleri var; bırakıldı.

**140 testin hepsi geçiyor**, `npm run kontrol` temiz, `npx expo export` hatasız.
Oyun mantığında hiçbir değişiklik yok — bu bölüm yalnızca hız ve düzen.

## Dokunma hassasiyeti (Baki, 2026-07-27)

"Hareket ederken yanlışlıkla bir parçaya basılı kalıyorum, onu almış oluyorum" +
"haritada akıcı hareket edemiyorum". Bakınca **iki ayrı kusur** çıktı.

**1. Uzun basma kaydırmanın arasına giriyordu.** Ayarlar 450 ms / 14 piksel idi. Kaydırma
ancak 12 piksel yol alınınca başlıyor; yani parmak basılıp biraz duraksadığında kaydırma
henüz başlamamış oluyor ama uzun basma sayacı doluyor ve **geliştirici aracı parçayı
alıyordu.** İki parmakla yakınlaştırırken de ilk parmak yeterince beklerse aynı şey oluyordu.
Üç kat koruma kondu:
- Süre **450 → 700 ms**, izin verilen kayma **14 → 6 piksel** (`denge.js JEST`).
- `jestAktif` bayrağı: kaydırma veya yakınlaştırma sürerken uzun basma **hiç çalışmıyor**.
  İki parmak değdiği anda yakınlaştırma başladığı için o sırada da tetiklenmiyor.
- `kilit`: bir kez çalıştıktan sonra parmak kalkana dek tekrar çalışmıyor.

**2. Her sürüklemenin başında harita 12 piksel ZIPLIYORDU.** Bu beklemediğim bir bulgu.
Kaydırma eşiği (`minDistance`) kaydırmayı 12 piksel sonra başlatıyor, ama parmağın kat
ettiği yol ilk dokunduğu yerden ölçülüyor. Telafi edilmediği için kaydırma başlar başlamaz
harita bir anda 12 piksel sıçrıyordu — "akıcı hareket edemiyorum" şikâyetinin asıl sebebi
büyük ihtimalle buydu. Etkinleşme anındaki yol artık kaydedilip düşülüyor: hareket ilk
milimetreden itibaren parmağı birebir takip ediyor.

**Eşiğin kendisine dokunulmadı** (12 piksel). Görev 02'de yakınlaştırmadan sonra parmak
kalkarken oluşan kaymayı o çözmüştü; telafi sayesinde bedeli olmadan duruyor. Yine de
`denge.js JEST` altında ayarlanabilir — parmak hassasiyeti kişiden kişiye değişir.

---

# GÖREV 05 — HAREKET VE MUHAREBE (2026-07-27)

Tanım: `docs/GOREV-05-hareket-ve-muharebe.md`. Önceki: Görev 04 (ordu üretimi).
Bu görevin sonunda ordular yürüyor, çarpışıyor, bozguna uğrayıp çekiliyor ve toprak el
değiştiriyor.

## Beş sorunun cevapları (Baki, 2026-07-27)

| Soru | Cevap | Öneri neydi |
|---|---|---|
| 1 — Muharebe ne zaman çözülür | **B — emir kuyruğu** | A (anında) |
| 2 — Karşı tarafın ordusu | A — kuruluş garnizonu | A |
| 3 — Hareket hakkı / kısmi gönderim | A — seç ve gönder | A (zorunlu sayılmıştı) |
| 4 — Bozgun çekilme yönü | A — motor seçer | A |
| 5 — Yeniden toplanma | B — Görev 06'ya | B |

**Soru 1'de öneriden sapıldı ve bunun bir bedeli oldu.** Belge kuyruğun üç ek iş getirdiğini
yazıyordu (oklar, iptal, çakışma); üçü de yapıldı. Üstüne belgede öngörülmeyen iki şey daha
çıktı:

1. **Onay kutusunun yeri değişti.** Görev 04'te konan kural: "onay yalnızca geri alınamaz
   işte sorulur". Kuyrukta emir vermek geri alınabilir bir iş — tur bitene kadar iptal
   edilebiliyor. Dolayısıyla kuvvet seçicide onay YOK; onay, emirlerin geri alınamaz hâle
   geldiği yere, TURU BİTİR'e taşındı ve orada kaç emrin çözüleceği yazıyor.
2. **"Muharebe sonuç kutusu" tur raporuna dönüştü.** Bir turda birden çok muharebe olabildiği
   için tek kutu yetmiyor; `TurRaporu.js` bir liste gösteriyor.

**Çakışma sorununu rezervasyon çözdü.** Belge "aynı orduyu iki yere göndermek" işini ayrı bir
çakışma çözümü sanıyordu; gerek kalmadı. Emre yazılan birim parçadan düşülmüş sayılıyor
(`kullanilabilirBirimler`), ikinci emir onu göremiyor. Bunun güzel bir yan etkisi: tasarımın
"her birimin turda tek hamle hakkı" kuralı için ayrı bir `hamleHakki` bayrağı yazmaya gerek
kalmadı (görev belgesi §5 onu öneriyordu). Kuyruk zaten hamle hakkı defteri. **Art arda fetih
zinciri de kendiliğinden imkânsız:** emirler tur sonunda çözüldüğü için, fethedilecek
parçadan aynı tur emir verilemiyor (henüz senin değil).

## Adım 0 — Denge sayıları ve tema.js düzeltmesi

`ARAZI_CARPAN` yanlış dosyadaydı: muharebe hesabına giren bir sayı `tema.js`'te (sunum
dosyası) duruyordu. `DENGE.ARAZI`'ye taşındı; oyuncuya gösterilen sade karşılık
(`ARAZI_SAVUNMA`: Düşük/Orta/Yüksek) temada kaldı.

Yeni denge blokları: `DENGE.ARAZI`, `DENGE.MUHAREBE` (12 sabit), `DENGE.FETIH`,
`DENGE.GARNIZON`, `DENGE.HAMLE_HAKKI`. Muharebe formülünde çıplak sayı yok; testler bunu
sabiti değiştirip sonucun değiştiğini görerek kanıtlıyor (6 ayrı sabit için).

## Adım 1 — Muharebe motoru ve §3.7 tablosunun çözülmesi

### Tablonun arkasındaki model yazılı değildi

Tasarım §3.7 "sürekli modelin ham çıktısı" diyor ama modelin kendisi hiçbir yerde yok. 15
satırın sayılarından geri çözüldü:

1. Her tarafın bir CAN HAVUZU var (birimlerin dayanıklılık toplamı).
2. Tur tur ve EŞZAMANLI: iki taraf da tur başındaki durumuna göre hasar verir.
3. Verilen hasar, kalan can oranıyla ölçeklenir (yarısı ölmüş ordu yarı hasar verir).
4. "Kalan kuvvet" = başlangıç birim sayısı × kalan can oranı.

Bu model `scripts/muharebe-referans.js`'e kondu ve 15 satırı ±0.02 ile yeniden üretiyor.
Testte de kullanılıyor: tablo iki yere kopyalanmasın diye oradan `require` ediliyor.

### Boşluk 1: zırhlı arazi çarpanı neye uygulanıyor — ÖLÇÜLDÜ

Tasarım §3.5 "Zırhlı birim çarpanı" diyor, neye uygulandığını söylemiyor. Üç yorum da
kodlanıp tabloya karşı çalıştırıldı (`veri/muharebe-referans.md`):

| Yorum | 15 satırdan kaçı tuttu |
|---|---|
| **hasar** (zırhlının verdiği hasarı çarpar) | **15/15** |
| dayanıklılık | 6/15 |
| ikisi birden | 3/15 |

Tahmin değil ölçüm. Zırhlı çarpanı hangi tarafta olduğuna bakılmadan uygulanıyor —
dağdaki zırhlı savunurken de yarı hasar veriyor.

### Tam sayı sınırında beraberlik bozma (tasarımda olmayan yeni kural)

İlk uygulamada 15 satırın **12'si** tuttu. Tutmayan üçü (1z–1t dağlık, 1p–1t ova,
3p1t1z–5t ova) tesadüf değildi: hepsi sürekli modelde **kıl payı** biten satırlar
(0.18, 0.07, 1.50 kalan kuvvet). Hasar eşzamanlı olduğu için tam sayı motorda iki taraf aynı
turda birden imha oluyor ya da birden bozuluyor; sürekli modelde temsil edilen "bir kırıntı
kadar önde bitirme" tam sayıda kayboluyor.

Çözüm ad hoc değil, **sürekli modelin kendi ölçütü**: oransal olarak daha az yıpranmış taraf
üstündür (alınan hasar / başlangıç canı), eşitlikte savunan kazanır çünkü toprak onda.
Karşılıklı imhada ayakta kalması gereken tarafın son birimi geri veriliyor. Kural konunca
**15/15** oldu ve öteki 12 satır değişmedi.

### Öteki doldurulan boşluklar

- **Hasar eşzamanlı.** Sıralı olsaydı "kim önce vurur" gizli ve çok güçlü bir kural olurdu.
- **Orantılı kayıp → en büyük artık**, eşitlikte `BIRIM_SIRASI`. Belirlenimci: aynı girdi hep
  aynı türü öldürüyor. Sıradaki kurbanın dayanıklılığı havuzdan büyükse kimse ölmüyor, hasar
  havuzda bekliyor — "ucuz birim hasarı emer" sömürüsü böyle kapandı.
- **Şansın "kuvvet oranı" ölçüsü = ham hasar** (arazi ve şans öncesi). Birim sayısı olsaydı
  3 piyade 1 zırhlıya "3:1 üstün" sayılırdı; oysa §3.7'ye göre orada zırhlı kazanıyor.
- **Muharebe üst sınırı 20 tur.** Sınıra gelinirse berabere: saldıran kaynağına döner,
  çekilme kaybı YOK (çekilme kaybı bozgun cezasıdır, burada kimse bozulmadı).
- **Moral bonusları veriden okunuyor:** moral statı parçanın ilinden, dağlık parçanın
  arazisinden (yalnızca savunana), kendi toprağı sahiplikten. "Yüksek" eşiği **5** seçildi —
  81 ilin 23'ü (%28) sağlıyor. 6 olsaydı yalnızca 4 il alırdı, bonus ölü kural olurdu.
- **Hasar havuzu ordu bölününce birim sayısına oranla bölünüyor.** Yoksa yıpranmış orduyu
  ikiye ayırıp hasarı bir tarafa yıkmak bedava temizlik olurdu.

## Adım 2–4 — Hareket, çözüm, fetih

Üç dosya: `hareket.js` (ne emredebilirsin), `cozum.js` (ne oldu), `fetih.js` (el değiştirme).

- **Komşuluk yalnızca `parca-komsuluk.json`'dan.** İl komşuluğu hareket kuralı değil; testte
  Bursa Ovası'ndan Bilecik'e geçilemediği ayrıca doğrulanıyor (iller komşu, parçalar değil).
- **Tek kaynak kuralı** Görev 04'teki gibi testle kilitlendi: arayüzün "bu hedef seçilebilir
  mi" sorusu ile motorun emir kontrolü aynı fonksiyondan geliyor, 181 parçanın hepsinde aynı
  cevabı verdikleri test ediliyor.
- **Emirler VERİLİŞ SIRASIYLA çözülüyor, birleşik saldırı yok.** Aynı hedefe giden iki emir
  omuz omuza vurmuyor, arka arkaya vuruyor. Eşzamanlı çözüm üç yeni kural isterdi (birleşik
  orduda kayıp hangi kaynağa yazılır, çekilme nereye olur, havuz nasıl bölünür) ve bu görev
  zaten muharebe + hareket + fetih + arayüz taşıyor. Bedeli oyuncudan saklanmıyor: emirler
  arayüzde numaralı görünüyor.
- **Fetih ganimeti = parçanın nüfus payının %60'ı, tek seferlik nüfus** (seferberlik).
  Ekonomi ganimeti yok: yağmalanan sanayi çalışmaz, parçanın kalıcı geliri zaten sahibine
  yazılıyor. Parça her el değiştirdiğinde bir kez veriliyor — kaybedilip geri alınırsa iki
  kez. Bilinçli ve testte kayıtlı: sürekli el değiştiren cephe her seferinde yeni seferberlik.
- **Gelir ÖNCE, çözüm SONRA.** §8 üretimi birinci aşama sayıyor; bu sıra "fethedilen parçada
  üretim aynı tur başlar mı" sorusunu ek kural yazmadan cevaplıyor (başlamaz). Testte açıkça
  doğrulanıyor.
- **Yok olan birimlerin nüfusu havuza dönmüyor** (§3.9/6). Hiçbir yerde iade yapılmıyor ve
  bu ayrı bir testle kilitlendi — unutulursa kayıp cezasız kalır.

## Adım 6 — Kuruluş garnizonu

`⌈(nüfus statı + sanayi statı) / 4⌉` birim, karışım §4.5'teki il tipine göre (kalabalık →
saf piyade, sanayi → 2 topçu + 3 zırhlı, dengeli → 3 piyade + 1 topçu + 1 zırhlı). İstanbul 5,
Bursa 4, Bayburt 1. **181 parçada toplam 470 birim.**

**Rastgelelik yok.** Görev belgesi tohumlu üretim öneriyordu; gerek kalmadı — formül tamamen
veriden türüyor, yani zaten belirlenimci. İki faydası: her oyun aynı adil açılışla başlıyor,
ve üreteç kurulumda hiç ilerlemediği için muharebelerin şansı tohumla birebir eşleşiyor
(test bunu ayrıca doğruluyor: `rastgele.durum === rastgele.tohum`).

**Oyuncunun parçaları da garnizonlu.** Belge "tarafsız parçaya" diyordu ama oyun başında
herkes tarafsız: her il kendi parçalarını tutan bağımsız bir aktör (§6.1). Oyuncuyu istisna
yapmak onu tek savunmasız taraf yapardı.

## Adım 5 — Arayüz

Akış: kendi parçana dokun → panelde **HAREKET / SALDIR** → harita **hedef seçme kipine**
girer → hedefe dokun → **kuvvet seçici** → EMİR VER. Emirler haritada ok olarak duruyor
(saldırı kırmızı, takviye yeşil), tur çubuğunda **EMİR n** sayacı, iptal hem panelde hem
emir listesinde.

**Belgeden sapılan nokta: "ötekiler soluklaşır" YAPILMADI.** Solukluk 181 parçanın dolgusuna
dokunuyor, yani `tabanEl` her kip açılışında baştan kurulurdu — görev belgesinin kendi §9/2
tuzağı. Yerine hedefler vurgu katmanında pirinç renkle işaretleniyor; o katman zaten yalnızca
seçim değişince kuruluyor. Emir okları da ayrı bir katmanda, yalnızca emir listesine bağlı.

**Uzun basma hedef kipinde tamamen kapalı** (§9/3 tuzağı). Kip bayrağı jest tanımına
paylaşılan değer olarak gidiyor — Görev 04'ün "worklet'e fonksiyon geçmez" dersi.

**Muharebe tahmini kesin sayı vermiyor:** şanssız simülasyonun sonucu üç kademede
(üstün · denk · zayıf) ve yanında beklenen kalan birim. Kesin yüzde vermek muharebeyi hesap
tablosuna çevirirdi.

**Panelde düğme sırası değişti:** HAREKET / SALDIR dolu pirinç ve üstte, ASKER BAS dolgusuz
ve altında. Tur içinde en sık yapılan iş artık hareket.

## Yolda çıkan ve not edilmesi gereken bir tuzak

`veri.js`'e `KOMSULUK` eklenince `import { KOMSULUK } from './veri.js'` "böyle bir dışa
aktarım yok" diye patladı — ama `ILLER` ve `PARCALAR` çalışıyordu. Sebep: ESM tarafındaki
`import { X }`, CommonJS bir dosyanın adlarını Node'un metin tarayıcısıyla buluyor ve
`module.exports = { ... }` biçiminde alanların bir kısmını göremiyor. `exports.X = ...`
biçimi hepsini gösteriyor. `veri.js` o biçime çevrildi, dosyaya da not düşüldü.

## Testler ve ölçüler

- **242 test** (Görev 04 sonunda 140 idi; hedef ~200'dü). Yeni: `muharebe.test.js` (40),
  `hareket.test.js` (45), `garnizon.test.js` (16) + kayıt testlerine 4 ekleme.
- 675 girdi kombinasyonunda muharebenin sonsuza gitmediği taranıyor.
- **Uzun oyun testi**: 15 tur boyunca üretim + saldırı, her turda kayıt gidiş-dönüşü
  doğrulanıyor. Motorun parçaları tek tek değil BİRLİKTE de ayakta.
- **Kayıt sürümü 5.** Sürüm 4 için ayrı ret sebebi yazıldı (garnizonsuz kayıt "çalışıyor gibi"
  görünür, asıl tehlike bu). Kayıt boyutu: oyun başı **21.6 KB**, 15 tur fetihten sonra
  **23.3 KB** — Görev 04'ün en kötü ölçümü 24.4 KB idi, sınırın altında.
- `npm run kontrol` temiz (veri + ESLint + biçim + 242 test), `npx expo export` hatasız.

## Denge gözlemi (bütçesi sınırsız bir oyuncuyla 15 tur)

Tur 1'de 3 emir / 3 fetih, tur 10'da 21 emir / 14 fetih, tur 15 sonunda 90/181 parça.
Erken turlarda saldırıların yaklaşık yarısı kırılıyor — garnizonlar iş görüyor. Kartopu
etkisi belgede kabul edilmişti (garnizon tükenince yerine yenisi gelmiyor); düzeltmesi
Görev 07'nin yapay zekâsı.

## Cihaz geri bildirimi — üç sorun (Baki, 2026-07-30)

### 1. "Yakınlaştırmalarda takılmalar var, genel takılmalar var ve yavaş"

**Sebebi benim hatamdı ve tam olarak şuydu:** Görev 04'ün performans kazancı açıkça
*"boş parçada rozet yok — 181 rozet asla aynı anda çizilmez"* varsayımına dayanıyordu
(`veri/rozet-katman-olcum.md` ve `oyunKancasi.js` yorumu). **Kuruluş garnizonları her parçaya
ordu koyunca o varsayım çöktü:** 181 parça rozeti + 81 il rozeti, her biri kendi SVG'sini
taşıyor ve kare başına kendi konumunu hesaplıyor. Geçiş bandında iki takım birden kurulu
olduğu için 262 canlandırma aynı anda dönüyordu. Katman sınırını geçerken 181 SVG'nin birden
kurulması da tam o noktada takılmaya yol açıyordu — "yakınlaştırmalarda takılma" bu.

Rozetler yalnızca 1.35× üstünde çiziliyor; Baki ordu hareket ettirmek için hep o
yakınlıkta oynadığı için "genel takılma" da aynı sebep.

**Üç düzeltme yapıldı:**

1. **Görünüm ayıklaması** (`Harita.js`) — ekranda GÖRÜNMEYEN rozet hiç kurulmuyor. Görünen
   harita dikdörtgeni `useAnimatedReaction` ile izleniyor, 32 harita birimine kabalaştırılıyor
   (yalnızca o kadar kayınca JS'e haber gidiyor, yoksa çare hastalıktan kötü olurdu) ve
   listeler ona göre süzülüyor. Pay 24 birim, sınırlar floor/ceil ile taşınıyor — rozet
   ekranın içinde belirmiyor. Yatay telefonda (900×412) ölçülen sonuç:

   | Yakınlaştırma | Önce | Sonra |
   |---|---|---|
   | 1.35× (il katmanı başı) | 81 il | 74 il |
   | 2.35–2.8× (geçiş bandı) | **262** | **107** |
   | 2.7× (parça katmanı başı) | 181 parça | 62 parça |
   | 4× | 181 | 35 |
   | 7× | 181 | 13 |

2. **Rozet donanım dokusuna alındı** (`Rozet.js`) — `renderToHardwareTextureAndroid`, sabit
   ölçülü kutuya (26×26), çıpaya değil (çıpa 0×0, sıfır boyutlu görünümü dokuya çizmek
   içeriği kırpabilir). SVG taşıyan bir görünümü her karede taşımak Android'de yeniden
   çizime yol açıyor; doku bunu bir kereye indiriyor. **Cihazda doğrulanmamış tek satır bu.**
   `shouldRasterizeIOS` bilerek eklenmedi (iOS'ta gölgeyi kırpıyor).

3. **Gereksiz yeniden hesaplamalar kesildi** — `ilRozetleri` bağımlılığı `[oyun]` idi, yani
   her seçimde/siparişte 81 rozet nesnesi baştan kuruluyor ve 181 parça taranıyordu. Artık
   `[oyun.ordular]`. Bunun için `tumIlOrdulari(durum)` → `tumIlOrdulari(ordular)` yapıldı:
   bağımlılığın GERÇEK olması gerekiyordu, "tüm oyun durumu" değil.

**Kalan zayıf nokta, dürüstçe:** 1.35×'te hâlâ ~74 il rozeti var. Ayıklama orada az işe
yarıyor çünkü o yakınlıkta haritanın neredeyse tamamı ekranda. Görev 05'ten önce o katmanda
~5 rozet vardı (yalnızca ordusu olan iller); garnizonlar her ile bir sayı verdiği için hem
performans hem GÖRSEL GÜRÜLTÜ arttı. Hâlâ ağırsa üç düğme var, üçü de Baki'nin kararı:
il rozetini yalnızca garnizondan farklı orduya sahip illerde göstermek · `ORTA_SINIR`'ı
yükseltmek (ölçümle seçilmişti) · rozet gölgesini (`elevation`) kaldırmak.

### 2. "+1 yaptı direkt gidiyor, sayısını ayarlayabilmem lazım" + "savaş için ortada yeni menü"

**Sebep:** kuvvet seçici üretim ekranının kalıbını devralmıştı ve arkayı KARARTMIYORDU
(üretim ekranında bu bilinçliydi: "nereye asker bastığını görmeden karar vermek zor").
Harita jestleri yerel katmanda kurulu; üstteki kutunun dokunmayı yutması garanti değil, bu
yüzden `[+]` tuşuna basmak haritanın dokunmasını da tetikleyip hedefi/kipi değiştiriyordu.

**İki katlı çözüm:**

1. `Harita.js`'e **`dokunmaKapali`** eklendi: ekranda açık bir menü varken harita dokunma
   ALMIYOR (jestin kendisi susuyor — perde çizmek yetmez). Kaydırma ve yakınlaştırma serbest
   kalıyor, oyuncu menü açıkken haritaya bakmaya devam edebiliyor. Uzun basma da kapalı.
2. **`HareketEkrani.js` baştan yazıldı — SAVAŞ ODASI.** Tam perde (Onay kutusuyla aynı),
   ekranın ortasında geniş kutu, iki sütun:
   - **Solda GÖNDERECEĞİN KUVVET:** birim başına büyük `[−] n [+]` sayaç (38 px tuşlar),
     altında her birimin muharebe statları, ve **TÜMÜ / YARISI / SIFIRLA** hızlı seçimleri —
     8 birimlik orduyu tek tek artırmak yorucuydu. Altında "kaç birim geride kalıyor" satırı.
   - **Sağda KARŞINDAKİ:** hedefin adı/ili/sahibi, arazi ve savunma gücü, savunanın kadrosu
     tür tür statlarıyla, moral üstünlüklerinin SEBEPLERİ ve fetih ganimeti.
   - Altta muharebe tahmini (üstün/denk/zayıf + beklenen kalan) ve **SALDIR** düğmesi.
     Düğme kaydırmanın DIŞINDA: ekran ne kadar dolu olursa olsun hep görünür.

   Onay kutusu yine YOK — emir kuyruğunda emir vermek geri alınabilir bir iş, onay
   TURU BİTİR'de.

   **Moral cümleleri artık tahminle kurulmuyor.** İlk hâli toplam bonustan geri çıkarmaya
   çalışıyordu; dağlık ile "kendi toprağı" aynı sayıyı verdiği için yanlış cümle kurabiliyordu.
   Sebepler oyun katmanından açık açık geliyor (`hareketBilgisi.moralSebepleri`).

### 3. "Sonuç ekranında savaşların detayları gözüksün"

`cozum.js` raporuna eklendi: savunanın muharebeye GİRDİĞİ kadro, **tür tür kayıplar** (iki
taraf için), başlangıç moralleri ve **tur tur döküm**. Rapor ekranında her muharebe satırı
artık şunları yazıyor: ne gönderdin / kaybın ne / kalanın kaç · karşındaki neydi / kaybı ne /
kalanı kaç · arazi, moral, kaç tur sürdü. Altında **TUR TUR DÖKÜM** çekmecesi (kapalı başlar):
tur numarası, iki tarafın o turdaki vuruşu, kayıplar, kalanlar, moraller ve o turda şansın
devrede olup olmadığı. Üstte turun toplam kaybı da var.

Çekmece kapalı başlıyor çünkü hepsi birden açık olsa ekran sayı duvarına dönüyor; oyuncu
merak ettiği muharebeyi açıp bakıyor.

**Kayıt boyutu sorunu buradan çıktı ve çözüldü.** Döküm eklenince kayıt 23.3 → **28.6 KB**
oldu; yoğun bir turda raporun kendisi tek başına 9.9 KB tutuyordu. Rapor oyunun DURUMU değil,
bir turluk GÖSTERİM verisi — sonuç ekranı bir kez okuyor. Bu yüzden **kayda hiç girmiyor**
(`kayitVerisi.js`, alan `null` yazılıyor; silinmiyor çünkü anahtar sırası değişirse
gidiş-dönüş testi metin karşılaştırmasında tutmaz). Kayıt **22.1 KB**'a döndü ve rapor
bellekte tam detaylı duruyor. Yeni test bunu kilitliyor: raporun kayda sızmadığını VE kaydın
26 KB altında kaldığını doğruluyor.

### Bu turda düzeltilen küçük şeyler

- `IlPaneli` kapatılınca hedef seçme kipi açık kalıyordu → kip de kapanıyor.
- Savaş odasına `key={emirHedefi}` verildi: hedef değişirse birim seçimi sıfırdan kurulur.
- Savaş odasında iç içe kaydırma alanı kaldırıldı (en fazla üç birim türü var, kaydıracak
  bir şey yoktu; iç içe kaydırma parmağı hangisinin alacağını da belirsiz yapıyordu).
- `hitSelect`'in eksik `parcalar` bağımlılığı eklendi (Görev 04'ten kalma uyarı).
- Kullanılmayan `emirleriTemizle` ve `emirOzetleri.hedefIl/sayi` silindi.

**244 test geçiyor** (243 idi; kayıt testleri arttı), `npm run kontrol` ve
`npx expo export` temiz.

## Akıcılık onarımı — ikinci tur (2026-07-30)

Baki: *"Takılma ve donma hâlâ var."* İlk turda görünüm ayıklaması eklenmişti; rozet sayısını
262'den ~107'ye indirdi ama **işin CİNSİNİ değiştirmedi.** Bu turda cins değişti.

### Neden ilk düzeltme yetmedi

Maliyet rozet SAYISIYLA doğru orantılıydı: her rozetin kendi `useAnimatedStyle`'ı vardı, yani
ekranda kaç rozet varsa kare başına o kadar hesap ve o kadar yerel görünüm güncellemesi
yapılıyordu. 107 de çok. Üstüne, ayıklamanın kendisi yeni bir sorun getirmişti: jest sırasında
React durumu güncelliyordu ve o tazeleme **270 vektör yol taşıyan `<Svg>` ağacını** baştan
uzlaştırıyordu. "Donma" büyük olasılıkla buydu.

### Üç yapısal değişiklik

**1. Rozet katmanı baştan kuruldu — kare başına maliyet artık rozet sayısından BAĞIMSIZ.**
Yeni dosya `src/bilesenler/RozetKatmani.js`.

- Rozetler ARTIK CANLANDIRILMIYOR. Her biri sıradan bir görünüm; yeri `left/top` olarak JS'te
  bir kez hesaplanıyor. `Rozet.js`'ten Reanimated tamamen çıktı.
- Kaydırma/yakınlaştırmayı **TEK bir kapsayıcı** taşıyor: kare başına bir hesap, bir görünüm
  güncellemesi. Rozet 5 de olsa 262 de olsa bedel aynı — O(n) yerine O(1).
- Kapsayıcının dönüşümü matematiksel olarak TAM: kaydırmada `T = t − t₀·k`, ölçek `k = z/z₀`
  verildiğinde rozetin ekran yeri her karede birebir doğru çıkıyor (türetme dosya başında).
  Sapan tek şey rozetin BOYUTU ve o da en fazla yarım zoom adımı (≈%3) — gözle görülmez.
- Yakınlaştırma %6 adım aştığında veya harita 32 piksel kaydığında yerler JS'te yeniden
  hesaplanıp sabitleniyor. Eşik, ayıklama payından (en dar katmanda 49 px) küçük tutuldu:
  yoksa rozet kurulmadan ekrana girer ve içeride birden belirirdi.
- Görev 04'ün yumuşak birleşme/ayrılma geçişi AYNEN korundu — solma ve "parça rozeti ilinin
  rozetinden doğar" karışımı aynı formüllerle, yalnızca artık her karede değil sabitleme
  anında hesaplanıyor. `testler/rozet.test.js` formülleri sınadığı için değişmeden geçiyor.
- `KatmanIzleyici.js` silindi: katman kararı artık sabitlenmiş yakınlaştırmadan JS'te veriliyor,
  ayrı bir worklet gerekmiyor.

**2. Harita çizimi ayrı ve HAFIZALANMIŞ bileşene taşındı (`HaritaCizim`).**
181 parça + 81 il sınırı + vurgular + oklar = ~270 `<Path>`. Bu ağaç artık `Harita` her
tazelendiğinde yeniden uzlaştırılmıyor. Özellikleri hep aynı diziler olduğu için `React.memo`
gerçekten iş görüyor.

**3. Jest sürerken harita DONANIM DOKUSUNA alınıyor** (`tema.js HARITA_JEST_DOKUSU`).
Ölçek değişince Android çizim listesindeki 270 yolu yeni ölçekte baştan işliyor — bu,
"yakınlaştırmada takılma"nın doğrudan sebebi. Parmak ekranda olduğu sürece harita bir kez
dokuya çizilip yalnızca GPU'da taşınıyor.

> **Bedeli açıkça:** parmak ekranda VE harita çok yakınken çizim bir tık yumuşak görünür,
> parmak kalkınca anında keskinliğine döner. `HARITA_NETLIK` 2 olduğu için ~2× yakınlaştırmaya
> kadar fark edilmez. Rahatsız ederse `tema.js`'te `HARITA_JEST_DOKUSU = false` — tek satır,
> eski davranışa döner (keskin ama ağır).

### Yan düzeltmeler

- `tumIlOrdulari` artık oyun durumu değil doğrudan `ordular` alıyor: `useMemo` bağımlılığının
  GERÇEK olması için. Önceden her seçimde/siparişte 181 parça boşuna taranıyordu.
- `Bildirim.js`'te kullanılmayan içe aktarma, `turRaporu`'nda eksik bağımlılık düzeltildi.

---

## TEKRARLA düğmesi kaldırıldı

Baki: *"gerek yok."* Görev 04'te eklenmişti; hareket geldikten sonra turun asıl işi asker
basmak değil asker SÜRMEK oldu ve düğme yer tutmaya başladı. Yeri EMİRLER sayacına verildi.

Kaldırılanlar: tur çubuğundaki düğme, kancadaki `tekrarOzeti`/`tekrarla`, `ordu.js`'teki
`siparisiTekrarla` + `temizSiparis` + `birimUret`'in `hatirla` parametresi, durumdaki
`sonSiparis` alanı ve 10 test. **Kayıt sürümü artırılmadı:** alanı kimse okumuyor, eski bir
kayıt taşıyorsa zararsızca yok sayılıyor — Baki'nin elindeki oyun geçerli kalsın.

---

## ASKER TAŞI ile SALDIR ayrıldı

Baki: *"kendi bölgelerimize SALDIR ile asker transfer edebiliyoruz, bunu değiştir, askeri taşı
kısmı falan ekle."*

Ayrım **SAHİPLİĞE** göre yapılıyor, savunan orduya göre değil (`hareket.js hedefleriAyir`):

| | Hedef parça | Ne demek |
|---|---|---|
| **ASKER TAŞI** | senin | Birlikler birleşir, muharebe yok |
| **SALDIR** | senin değil | Fetih girişimi — ordusu olmasa bile toprak el değiştiriyor |

Boş bir düşman parçasına yürümek de SALDIRI sayılıyor; orası "taşıma" değil, toprak alma.
Bu ayrı bir testle kayıtlı.

Arayüzde:
- Panelde iki düğme: **SALDIR** (cephe kırmızısı, üstte, "3 komşu düşman parçası") ve
  **ASKER TAŞI** (dolgusuz, altında, "2 komşu kendi parçan"). Her biri yalnızca gidilecek yer
  varsa çıkıyor — iç bölgede SALDIR düğmesi hiç görünmüyor.
- Hedef seçme kipi kipe göre renk değiştiriyor: saldırıda kırmızı, taşımada pirinç. Şerit de
  "NEREYE SALDIRILACAK?" / "NEREYE TAŞINACAK?" yazıyor.
- Savaş odasının başlığı ve düğmesi de sahipliğe bakıyor: "SALDIRI EMRİ / SALDIR" ile
  "ASKER TAŞI / TAŞI". Muharebe tahmini yalnızca karşıda gerçekten ordu varsa çıkıyor
  (önce "savunan var mı"ya bakıyordu, o yüzden boş düşman parçasına saldırı yanlışlıkla
  "hareket" diye görünüyordu).

**238 test geçiyor** (244 idi; 10 TEKRAR testi çıktı, 4 taşıma/saldırı testi girdi),
`npm run kontrol` ve `npx expo export` temiz.

## Rozet titremesi (2026-07-30, Baki'nin ikinci geri bildirimi)

Akıcılık düzeldi ama: *"rozetler herhangi bir harekette titreme yapıyor... uzaktan
yakınlaşmaya başladıkça silikken gözükmeye başlıyor veya ilde birleşiyor."*

**Titreme, akıcılık düzeltmesinin kendi yan etkisiydi.** Yerler kesikli aralıklarla (32 px
kayma / %6 yakınlaştırma) yeniden hesaplanıyordu ve bu üç ayrı soruna yol açıyordu:

| # | Sebep | Görünen |
|---|---|---|
| a | Yerler **JS'te**, taşıma **UI iş parçacığında** güncelleniyor. İkisi aynı kareye denk gelmezse tek karelik sıçrama olur; bir kaydırmada onlarca kez tekrarlanır. | "herhangi bir harekette titreme" |
| b | Solma ve "parça rozeti ilinin rozetinden doğar" karışımı sürekli değil, **1–2 basamakta** atlıyordu (parça bandı 2.45→2.70, %6 adımla iki basamak). | "silikken gözükmeye başlıyor / ilde birleşiyor" |
| c | Yakınlaştırma tam sınırda duraklarsa katman **gidip geliyordu**. | sınırda çakışma/titreme |

### Yeni kural: HAREKET EDERKEN HESAP YOK

**a) Kaydırmada hiçbir şey yeniden hesaplanmıyor.** Kapsayıcının ötelemesi kaydırmayı birebir
doğru taşıyor (k = 1 iken matematik tam), yani rozetler haritaya çivilenmiş gibi duruyor.
Yer hesabı kaydırmadan hiç etkilenmediği için iki iş parçacığının aynı kareye denk gelmesi
GEREKMİYOR — sıçrama artık imkânsız.

Sabitleme (yer hesabı) yalnızca **jest sayacı sıfıra indiğinde** yapılıyor. Sayaç, bayrak
değil: kaydırma ve yakınlaştırma üst üste binebildiği için (`Gesture.Simultaneous`) 0/1
bayrağı biri biterken öteki sürerken sıfırlanıyor ve yeri hareketin ortasında sabitliyordu.

**b) Yakınlaştırmada rozetler SÖNÜYOR.** Ölçek sapması büyüdükçe saydamlık düşüyor; parmak
kalkınca yerler bir kez hesaplanıp doğru yerlerinde geri geliyorlar. Katman değişimi (il ↔
parça) hep bu sönük anda oluyor, yani basamaklı geçiş görünmüyor.

**ÖLÜ BÖLGE:** %8'e kadar yakınlaştırmada hiç sönmüyor. Küçük parmak ayarlarında rozetler
kaybolmasın diye; bedeli rozetin en fazla %8 büyüyüp küçülmesi (26 px'te ±2 px, fark edilmez).

**c) Katman seçimine HİSTEREZİS geldi** (`DENGE.ROZET.KATMAN_HISTEREZIS = 0.15`). Yukarı geçiş
sınırda, aşağı dönüş sınırın 0.15 altında. Sınırda salınan bir yakınlaştırmada katman sabit
kalıyor — test bunu 40 salınımla doğruluyor.

> Görev 04'te histerezis denenip kaldırılmıştı. O zaman geçiş her karede hesaplanan sürekli
> bir SOLMA ile yapılıyordu ve solma sınırdaki titremeyi kendiliğinden yutuyordu. Çizim artık
> kare başına değil hareket durunca hesaplandığı için histerezis yeniden gerekli oldu.

### Bilerek kaldırılan: birleşme/ayrılma canlandırması

Görev 04'ün "parça rozeti ilinin rozetinden doğup yerine kayar" hareketi kalktı. Geçiş artık
sönük anda olduğu için görülecek bir hareket yok; ara saydamlık ve doğuş karışımı da gereksiz
kaldı. O canlandırma **5 rozetle** güzeldi — garnizonlardan sonra ekranda **262 rozet** var ve
aynı hareket görsel gürültüye dönüşüyordu. Baki'nin şikâyeti de tam buydu.

`SOLMA_BANDI` ve `HAZIRLIK_PAYI` `denge.js`'ten kaldırıldı, yerlerine `KATMAN_HISTEREZIS`
geldi. `Rozet.js`'ten `saydamlik` özelliği çıktı (saydamlık artık takımın kapsayıcısında,
tek tek rozetlerin değil). `oyunKancasi`'ndeki `kaynakX/kaynakY` alanları da silindi.

### Yan kazanç

`ordu.js rozetKatmani` Görev 04'ten beri "resmî tanım ama kimse çağırmıyor" durumundaydı —
katman kararı UI iş parçacığında veriliyordu ve oraya fonksiyon geçemiyordu. Karar artık JS'te
verildiği için **çizim doğrudan o fonksiyonu çağırıyor**: tanım ile çizimin ayrışma ihtimali
kalmadı.

`testler/rozet.test.js`'teki beş geçiş testi yenilendi (solma formülleri yerine histerezis,
salınım kararlılığı ve "ekran boş kalmıyor" kuralları). **238 test geçiyor**, `npm run kontrol`
ve `npx expo export` temiz.

## Rozet titremesi — kalan kısım kapatıldı (2026-07-30, üçüncü tur)

Baki: *"Titreme hâlâ yapıyor ama azalmış baya. Bitirirken başka yerlerden patlamayalım ve
ileride yapacağımız değişiklikler sonucunda da etkilenmeyecek şekilde olmalı."*

### Kalan tek kaynak: ayıklama hâlâ hareket sırasında React tazeliyordu

İkinci turda yer hesabını hareketin sonuna almıştım ama **ayıklama** (görünmeyen rozeti
kurmama) hareket sırasında çalışmaya devam ediyordu: her 64 pikselde bir React durumu
güncelliyordu.

Mekanizma şu: kapsayıcı bir **canlandırma stili** taşıyor ve o stil UI iş parçacığında her
karede güncelleniyor. Aynı görünüm bir yandan React tarafından yeniden çizilirse, React'in
yazdığı (bir kare eski) stil ile UI iş parçacığının yazdığı stil çakışıyor → tek karelik
sapma. Kaydırma boyunca onlarca kez tekrarlanınca gözle titreme oluyor.

**Çözüm:** ayıklama da hareketin sonuna taşındı. Artık *hareket sürerken bu ağaçta hiçbir
React tazelemesi olmuyor.* Ayıklama payı, görünen alanın bir katına çıkarıldı — tek bir
kaydırmanın gidebileceği yolu kapsıyor, yani kaydırırken yeni rozet kurmaya gerek kalmıyor.
`taban`, `gorunum` ve `katman` tek bir durum nesnesinde toplandı: bir sabitleme artık üç değil
tek tazeleme.

**İkinci kaynak — kalan pırıltı:** 60 rozetin SVG'si her karede yeniden çiziliyordu.
Kapsayıcı donanım dokusuna alındı (`renderToHardwareTextureAndroid`): bir kez dokuya çizilip
GPU'da taşınıyor. İçerik hareket sırasında zaten hiç değişmediği için doku bayatlamıyor.

### "Başka yerlerden patlamayalım" — yapısal güvenceler

**1. Kapsayıcı ayrı ve hafızalanmış bir bileşen (`Kapsayici`).** Üstteki bileşen ne sebeple
tazelenirse tazelensin — yeni bir prop, yeni bir özellik, herhangi bir şey — `stil` ve `liste`
aynı kaldığı sürece canlandırılan görünüme hiç dokunulmuyor. Değişmez kural artık yoruma değil
yapıya dayanıyor.

**2. Dosyanın başına büyük harflerle DEĞİŞMEZ KURAL yazıldı:** *"Hareket sürerken bu ağaçta
hiçbir React tazelemesi olmaz."* Altında sebebi ve "yeni özellik eklerken ne yapmamalı" notu.

**3. Harita dönüşümü tek kaynağa indi — asıl kalıcı düzeltme bu.**
`src/haritaDonusum.js` yeni dosya. Harita koordinatı ↔ ekran pikseli çevirisi ÜÇ ayrı yerde
elle kopyalanmıştı:
- `Harita.js hitSelect` (parmağın hangi parçaya değdiği)
- `Harita.js` rozet kaydırma denetimi
- `RozetKatmani.js` (rozetlerin yeri)

Üçü aynı formülün kopyasıydı. Biri değişip öteki değişmediğinde ortaya çıkan şey tam olarak
"rozetler haritayla aynı yerde durmuyor". Hepsi tek dosyadan geçiyor artık.

**4. `testler/haritaDonusum.test.js` — 11 yeni test.** İleride yakınlaştırma/kaydırma mantığı
değişirse burası patlar:
- harita → ekran → harita çevirisi 768 kombinasyonda birebir geri geliyor
- yakınlaştırma 1'de harita çizim alanına tam ortalanıyor
- kaydırma ekranda birebir yansıyor *(rozetlerin tek ötelemeyle taşınabilmesinin dayanağı)*
- görünen alanın köşeleri ekran köşelerine denk geliyor
- **rozetin çizildiği nokta, dokunma testinin okuduğu noktayla aynı** — bu ikisi ayrışırsa
  oyuncu rozete basar, altındaki başka parça seçilir
- bir ekran boyu kaydırma ayıklama payının içinde kalıyor

Saf hesap bileşenden çıkarılıp `haritaDonusum.js`'e alındı; bileşenin içinde kalsaydı Node
onu ayrıştıramaz (JSX) ve hiç test edilemezdi.

**249 test geçiyor**, `npm run kontrol` ve `npx expo export` temiz.

### Hâlâ titrerse nereye bakılacak

Sırayla denenecek üç şey, üçü de tek satır:
1. `RozetKatmani.js` → `Kapsayici`'daki `renderToHardwareTextureAndroid` kaldır (doku
   yerine her kare çizim).
2. `tema.js` → `HARITA_JEST_DOKUSU = false` (harita dokusu kapanır, keskin ama ağır).
3. `Rozet.js` → `kutu` stilindeki `elevation: 5` kaldır (Android gölgesi hareket eden
   görünümlerde pırıldayabiliyor).

## Rozet yükleme kusuru — dördüncü tur (2026-07-30)

Baki: *"Kaydırırken basılı tutuyorum, soldaki rozetler yüklenmeden kalıyor; bazıları
kaydırmadan önceki ekranın bölgesinde YARISI YÜKLENDİĞİ için o hâliyle kalıyor, elimi
bırakınca düzeliyor. Yüklenmeler genel olarak böyle, hepsi bir anda yükleniyor."*

Bu tarif teşhis koydurdu: **"yarısı yüklenmiş hâlde kalan rozet"** = bir rozetin tam ortadan
kesilmiş olması. Kesen şey donanım dokusu.

### Üçüncü turda iki hata birden yapmışım

**Hata 1 — DONANIM DOKUSU KESİYORDU.** Rozet kapsayıcısına `renderToHardwareTextureAndroid`
koymuştum. Doku, görünümün SINIRLARI kadar büyük oluyor; kapsayıcı tam ekran olduğu için
ekran dışındaki rozetler dokuya hiç girmiyor, kenardakiler de ortadan kesiliyor. Kaydırınca
doku kayıyor ama içi boş kalıyor — parmak kalkınca yeniden çizilip düzeliyor.

> Haritanın kendisinde aynı doku SORUNSUZ (`tema.js HARITA_JEST_DOKUSU`), çünkü orada çizim
> görünümün sınırlarını birebir dolduruyor. Rozet katmanında doldurmuyor. Fark bu; koda da
> böyle yazıldı ki bir daha eklenmesin.

**Hata 2 — AYIKLAMA HAREKETİN SONUNA ALINMIŞTI.** Titremeyi bitirmek için "hareket ederken
hiç React tazelemesi olmasın" demiştim ve ayıklamayı da (hangi rozetler kurulacak) oraya
dahil etmiştim. Sonuç: kaydırırken ekrana giren bölge için hiç rozet kurulmuyor, hepsi
parmak kalkınca bir anda kuruluyor — "hepsi bir anda yükleniyor" tam bu.

### Çözüm: doğru şeyi doğru yere koymak

İkisi ayrı işmiş, ayrıldı:

| | Ne zaman | Neden |
|---|---|---|
| **Yer hesabı** (`taban`) | yalnızca hareket bitince | Duran rozetin yeri hareket sırasında değişirse titrer. |
| **Ayıklama** (`alan`) | kaydırma sırasında da | Yalnızca listeye ekleyip çıkarır, duranların yerini oynatmaz — titretmez. |

Ayıklama, **ayrı bir alt bileşenin (`RozetListesi`) kendi durumunda** tutuluyor. Alt bileşen
tazelendiğinde React yalnızca onun çıktısını uzlaştırıyor; üstteki `Animated.View`'in
özellikleri değişmediği için stiline hiç dokunulmuyor. Titreme bu yüzden geri gelmiyor.

**Üçüncü bir kaynak daha bulundu ve kapatıldı:** `Harita`, jest BAŞLARKEN ve BİTERKEN
tazeleniyor (donanım dokusu bayrağı bir React özelliği, paylaşılan değerden beslenemiyor).
`RozetKatmani` hafızalanmamıştı, yani o tazelemeler canlandırılan görünümü tam parmağın
değdiği anda yeniden kuruyordu. `React.memo` eklendi; bütün özellikleri sabit kimlikli
olduğu için hafızalama gerçekten tutuyor.

### Ayıklama sözleşmesi ve emniyet payı

Ayıklama her **300 pikselde** bir gözden geçiriliyor, pay **görünen alanın 0.75 katı**.
İkisi arasındaki ilişki bir KURAL: bir adımlık kaydırma payın içinde kalmalı, yoksa kenarda
rozetsiz boşluk görünür. Ölçülen emniyet payı her yakınlaştırmada **2.2–2.3 kat**:

| Yakınlaştırma | Bir adım (harita birimi) | Pay | Emniyet |
|---|---|---|---|
| 1.35× | 247 | 556 | 2.2× |
| 2.7× | 123 | 278 | 2.2× |
| 7× | 48 | 107 | 2.3× |

`testler/haritaDonusum.test.js` bu ilişkiyi kilitliyor — pay veya adım değiştirilirse test
patlar. Ayrıca "bir adım kaydırıldığında kenardaki rozet hâlâ kurulu" testi somut hâlini
sınıyor.

### Dosyanın başındaki iki değişmez kural

1. **Canlandırılan görünüm hareket sürerken yeniden çizilmez.** Yapısal güvencesi: ayıklama
   alt bileşende + `React.memo`.
2. **Bu katmanda donanım dokusu kullanılmaz.** Sebebi ve haritadan farkı yazılı.

**251 test geçiyor**, `npm run kontrol` ve `npx expo export` temiz.

### Hâlâ kalıntı varsa sırayla denenecekler

1. `tema.js` → `HARITA_JEST_DOKUSU = false` (haritanın dokusu; keskinleşir, ağırlaşır).
2. `Rozet.js` → `kutu` stilindeki `elevation: 5` (Android gölgesi hareket eden görünümlerde
   pırıldayabiliyor).
3. `haritaDonusum.js` → `AYIKLAMA_ADIM`'ı küçült (daha sık ayıklama, daha erken yükleme).

## Sabit rozet yerleşimi — kökün kendisi (2026-07-30, beşinci tur)

Baki: *"Hızlı kaydırınca takılma oluyor, ve her hareket ettirdiğimde rozetler yeniden
oluşuyor TAMAMI. Rozetlerin yerlerini sabit yapınca, yani haritada sadece hareket edeceğiz
rozet yeniden yüklenmeyecek gibi bir sistem yapamıyor muyuz?"*

**Teşhis doğru, önerilen sistem de doğru.** Dört turdur belirtiyi kovalıyordum; kök buymuş.

### Kök: rozetin yeri kaydırmaya bağlıydı

Rozetler `taban.tx`/`taban.ty` içeren bir formülle konumlanıyordu. Kaydırma bittiğinde yeni
kaydırma sabitleniyor, bütün rozetlerin `left/top` değeri değişiyor ve **hepsi yeniden
çiziliyordu**. Kapsayıcının ötelemesi de `tX − tx₀` olduğu için bu kaçınılmazdı.

### Çözüm: kaydırmayı yerden tamamen çıkarmak

Rozetin yeri artık **kaydırma sıfırken** hesaplanıyor: yalnızca sabitlenmiş yakınlaştırmaya
(z₀) ve ekran ölçüsüne bağlı. Kaydırmayı kapsayıcının kendi ötelemesi taşıyor:

```
rozetin sabit yeri  P₀ = ekran(x, y, z₀, kaydırma = 0)
kapsayıcı           ölçek k = z/z₀ , öteleme (tx, ty)     [görünümün merkezine göre]
sonuç               cx + (P₀ − cx)·k + tx = ekran(x, y, z, tx, ty)   ✓ birebir
```

Kaydırmada k = 1 ve öteleme kaydırmanın kendisi. Yani:

| | Önce | Şimdi |
|---|---|---|
| Kaydırma sırasında JS işi | ayıklama (rozet kurma) | **hiç** |
| Kaydırma bitince | bütün rozetler yeniden hesaplanır ve çizilir | **hiçbir şey olmaz** |
| Yakınlaştırma bitince | aynı | rozetler bir kez yeniden konumlanır |

Sabitleme fonksiyonu, yakınlaştırma ve ekran ölçüsü aynıysa **aynı durum nesnesini geri
döndürüyor** — React o yüzden yeniden çizmiyor. Kaydırmanın rozetlere hiç dokunmamasının
teknik dayanağı bu tek satır.

### Ayıklama kaldırıldı

Katmandaki bütün rozetler bir kez kuruluyor. Ayıklama iki turdur sorun çıkarıyordu: hareketin
sonuna alınınca "kaydırırken soldaki rozetler yüklenmiyor", hareket sırasına alınınca
"kaydırırken iş yapılıyor". Yer artık kaydırmadan bağımsız olduğu için ayıklamaya gerek de
kalmadı: ekran dışındaki görünümlerin çizim maliyeti sıfıra yakın, Android onları zaten
atlıyor. Bir sorun kaynağı tamamen ortadan kalktı.

### Hızlı kaydırmadaki takılma: doku artık yalnızca yakınlaştırmada

Harita, jest sürerken donanım dokusuna alınıyordu — kaydırmada da. Dokuyu oluşturmak TEK
SEFERLİK ama ağır bir iş: bütün harita o anda dokuya çizilir. Kaydırmada bunun hiçbir faydası
yok, çünkü öteleme vektörleri zaten yeniden işletmiyor; sadece hareketin **ilk karesinde**
takılma yapıyordu — "hızlı kaydırınca takılma" bu.

Doku artık **yalnızca yakınlaştırmada** açılıyor (ölçek değişince vektörler gerçekten yeniden
işleniyor, orada kazanç var). Kaydırma dokusuz: ne rasterleştirme maliyeti var, ne de bayrak
değiştiği için oluşan iki React tazelemesi.

### Testler — tasarımın dayandığı eşitlik kilitlendi

`testler/haritaDonusum.test.js`:
- **"rozetin yeri KAYDIRMAYA BAĞLI DEĞİL"** — kaydırma girdiye hiç girmiyor.
- **"sabit yer + kapsayıcı dönüşümü = doğru ekran yeri"** — 1000+ (z₀, z, tx, ty) birleşiminde
  haritanın kendi dönüşümüyle birebir aynı sonuç. Bu tutmazsa rozetler haritayla aynı yerde
  durmaz; testin varlık sebebi bu.
- **"yakınlaştırma değişmediyse ölçek TAM 1"** — kaydırmada rozet ne büyür ne söner.
- **"dokunma testiyle aynı yeri gösteriyor"** — rozete basınca altındaki doğru parça seçilir.
- **"katmandaki her rozet kuruluyor"** — ayıklamanın kaldırıldığını kilitliyor.

**249 test geçiyor**, `npm run kontrol` ve `npx expo export` temiz.

### Dosyanın başındaki üç değişmez kural

1. **Kaydırma hiçbir şeyi yeniden hesaplatmaz** — rozet yerine `tx`/`ty` karıştırılırsa
   "hepsi yeniden oluşuyor" kusuru geri gelir.
2. **Ayıklama yok** — kaydırırken rozet kurmak, kaçınmak istediğimiz durumun kendisi.
3. **Bu katmanda donanım dokusu kullanılmaz** — doku görünüm sınırında kesiyor, kenardaki
   rozetler yarım kalıyor. (Haritada sorunsuz, çünkü orada çizim sınırları birebir dolduruyor.)

---

# GÖREV 06 — YENİDEN TOPLANMA VE ARAŞTIRMA (2026-07-30 / 31)

Tanım: `docs/GOREV-06-toplanma-ve-arastirma.md`. Tur döngüsündeki iki boş aşama dolduruldu:
2. Araştırma ve 4. Toplanma. Bu görevin asıl konusu **"guns vs butter"** — ekonomiyi yeni
asker basmaya mı, yıpranmış orduyu doldurmaya mı, ordunun kalitesini kalıcı yükseltmeye mi
harcayacaksın. Görev 05'e kadar tek seçenek vardı, artık üç.

## Altı sorunun cevabı (Baki, 2026-07-30)

| Soru | Cevap |
|---|---|
| 1 — Kaybedilen birimler nerede tutulacak | **A** — her orduya `kadro` alanı |
| 2 — Toplanan ordu o tur saldırıya uğrarsa | **B** — çözümden sonra, tur sonunda dolar |
| 3 — Araştırma puanı nasıl kazanılır | **A** — ekonomiden pay ayrılır × eğitim çarpanı |
| 4 — Dallar, seviyeler, tavan | **A** — 3 dal · Sv.N → +N · tavan ölçümle |
| 5 — Kartopu bu görevde ele alınsın mı | **A** — mekanik eklenmez, ÖLÇÜLÜR |
| + Diplomasi kapsama girsin mi | **Hayır** — Görev 07'ye |

## En değerli ders: ÖLÇÜT DE ÖLÇÜLMELİ

Araştırma tavanı üç kez ölçüldü, ilk ikisi saçma cevap verdi. Sayının kendisinden çok bu
süreç kalıcı:

1. **"Kazanan değişmesin"** → tavan **Sv.0** ("araştırma hiç olmasın"). Sebep §3.7'nin
   kendisinde: kazananın kendi kuvvetinin yalnızca %7–18'iyle bitirdiği ÜÇ satır var
   (#1, #6, #10) — Görev 05'te tam sayı sınırında beraberlik bozma kuralını yazdıran aynı
   üç satır. Orada kazananın değişmesi denge bozulması değil, yazı-turanın öbür yüze düşmesi.
2. **Yazı-turayı affet** → tavan **Sv.12**; bu sefer kıl payı kazanılan bir muharebenin
   kesin yenilgiye dönmesini de affediyordu.
3. **Doğrusu:** kazanan değişti **ve** taraflardan biri için sonuç kesindi → bozulma.
   Kesinlik eşiği (kazananın kendi kuvvetinin %25'i) uydurma değil: tablonun kendi verisinde
   **0.18 ile 0.29 arasında boş bir bant** var, eşik oraya kondu.

**Sonra dördüncü bir şey daha çıktı: SÜREKLİ MODEL YETMİYOR.** Sürekli model bir ölçüttür,
oyun değildir — kesirli birim tanır, moral ve bozgun bilmez. Motor daha hassas: sürekli
modelde "kıl payı"na düşen sonuç motorda tam zafere/yenilgiye dönüşüyor. Yalnız sürekli
modele bakılsaydı tavan **Sv.3** kalır ve oyunun kendisinde tutmazdı; bunu Adım 3'te yazılan
"TAVANIN ANLAMI" testi yakaladı. Ölçüm betiği artık **iki modeli birden** koşturuyor ve
`DENGE` ile ayrışırsa uyarı basıyor. **Tavan Sv.2.**

*Elenen hipotez:* "yumuşama sürekli modelin sabit Euler adımından gelen sayısal hata olabilir".
Alt adıma bölünerek sınandı — sayılar değişti ama **aynı satırlar yine ters döndü**, yani
kırılmalar gerçek. Ayrıca ince adım §3.7'yi yeniden üretemiyor: tasarımın tablosu kaba adımla
üretilmiş.

**Zırhın Sv.3'te kırılması tasarımın kendi öngörüsü:** §3.3'te hafif vuruş etkinliği
`clamp(1 − zOrt/12, 0.10, 1.00)`; zırhlının zırhı Sv.3'te 11 olup tabana oturuyor ve 3 piyade
1 zırhlıyı yenemez hâle geliyor. Belgenin tahmini ("zırhlı 8'de, +4 ile eşiğe varır") bir
seviye iyimsermiş; gerçek eşik +3.

**Ağır vuruşun dar olması ayrı bir sebep:** +N herkese EŞİT eklendiği için en çok düşük
statlıya yarıyor — piyadenin ağır vuruşu 3→6 (iki katı), topçununki 8→11 (%38). Bu aynı
zamanda `SEVIYE_ARTISI`'nı büyütmenin de sınırı.

## Kadro — bu görevin veri modeli

Ordu iki sayı taşıyor: `kadro` (kağıt üstündeki mevcut) ve `birimler` (sahadaki mevcut).
Kadro toplanmanın DOĞAL ÜST SINIRI; onsuz 1 birimlik ordu her tur yarı fiyata 20 birime
"doldurulur" ve sanayi sınırı anlamsızlaşırdı.

- **Kayıt kuralı:** `kadro` yalnızca `birimler`'den FARKLIYSA yazılır → başlangıç kaydı
  **21.6 KB**, Görev 05'le birebir aynı; hiç büyümedi.
- **Değişmez kural:** her tür için `kadro ≥ birimler`. Beş yol (üretim · kayıp · bölünme ·
  birleşme · toplanma) ayrı ayrı test ediliyor.
- **Bölünme:** kadronun kendisi değil EKSİK kısmı, birim sayısına oranla bölünür — hasar
  havuzuyla aynı kural, `hareket.js orduBol` artık `toplanma.js kadroBol`'u çağırıyor
  (kopyalanmadı; Görev 05'in en pahalı hatası aynı hesabı üç yere kopyalamaktı).

**Yapı kararı — döngüsel bağımlılık:** `kadroAl` ve `kayitKadrosu` toplanma.js'te DEĞİL
`ordu.js`'te. toplanma.js ordu.js'ten `birimSayisi` alıyor, ordu.js de üretimde kadro yazmak
zorunda → döngü olurdu. Kayıt yapısının sahibi ordu.js.

## Tek havuz, üç musluk — `src/oyun/butce.js` YENİ

Ekonomi artık üç yere gidiyor ve ikisi TUR SONUNDA düşüyor (toplanma, araştırma). Havuzun
kendisine bakmak yanıltıcı: oyuncu 10 ekonomiyi araştırmaya ayırıp aynı 10 ekonomiyle zırhlı
basabilirdi. Harcanabilir bütçe **tek yerde** hesaplanıyor; görev belgesi bunu ayrı bir tuzak
olarak yazmıştı (§9/7).

Dosya yalnızca `denge.js`'e bağlı. Toplanma emrinin bedeli **emrin üstünde yazılı** — hem
emir listesi zaten o sayıyı gösteriyor, hem de `butce.js` toplanma.js'i ithal etseydi
`ordu.js → butce.js → toplanma.js → ordu.js` döngüsü doğardı.

## Muharebe motoruna tek dokunuş

`muharebeCoz` artık taraf başına **stat tablosu** alıyor; motor `DENGE.BIRIMLER`'i kendisi
okumuyor. Tablo verilmezse temel tablo kullanılıyor → araştırma 0'da motor kelimesi
kelimesine eski davranışını gösteriyor. **§3.7'nin 15 satırı ve Görev 05'in 40 muharebe
testi değişmeden geçti** — adımın bitiş ölçütü buydu.

`birimStatlari` hem oyunun hem ölçüm betiğinin kullandığı TEK fonksiyon; ölçüm betiği onu
`require` ediyor, yani ölçüm ile oyun ayrışamıyor.

## Eğitim — üçüncü parça değeri

`parcaDegerleri` üçüncü kez çağrılıyor (nüfus, ekonomi, eğitim), payı NÜFUS payından alıyor
(parça belgesinde eğitim payı yok; "insanın olduğu yerde okul vardır").

**"Her parça en az 1" kuralı eğitimde KAPALI** — `parcaDegerleri(paylar, stat, enAzBir)`
üçüncü parametre aldı. O kuralın gerekçesi "hiçbir parça 0 ÜRETMEZ", eğitim ise akan bir
kaynak değil. Açık bırakılınca parça sayısı statından çok olan 9 ilde toplam 318 → 331
şişiyordu ve en çok da eğitimi ZAYIF iller kazanıyordu (Şanlıurfa 1 → 4) — statın ayırt etme
işi tersine dönüyordu.

## Yol boyunca bulunan ve düzeltilen iki eski hata

1. **`birimUret` hasar havuzunu siliyordu.** Yıpranmış orduya 1 piyade basmak havuzu
   bedavaya temizliyordu (Görev 04'ten beri). Artık koruyor.
2. **`savunanKadro` → `savunanGiren`.** Rapor alanının adı "kadro" idi; bu görevde kadro
   ordunun kağıt üstündeki mevcudu anlamını kazandı ve iki anlam aynı ada bindi. Görev
   belgesi bunu §9/4'te "bu görevin en olası sessiz hatası" diye yazmıştı.

## Denge ölçümü — kartopu (Soru 5/A)

`node scripts/denge-simulasyonu.js` → `veri/denge-simulasyonu.md`. Görev 05'in gözlemi
elle yapılmıştı; artık oyuncu davranışı betikte yazılı ve tekrar edilebilir. 15 tur, iki
bütçe rejimi:

| Koşu | Sınırsız bütçe | Gerçek gelir |
|---|---|---|
| Temel (Görev 05 oyunu) | 72/181 | 13/181 |
| + Toplanma | 69/181 (−3) | **24/181 (+11)** |
| + Toplanma + Araştırma | 71/181 (−1) | 21/181 (+8) |

**Okunuşu:** toplanma para KITKEN çok değerli (13 → 24, neredeyse iki katı), para BOLKEN
işe yaramıyor hatta zararlı (−3: orduyu bir tur sahadan çekiyorsun, oysa yenisini
basabilirdin). Tasarımın istediği tam buydu (§3.9/4: kayıp gerçekten cezalandırılır, sadece
sıfırdan basmaktan ucuzdur). Araştırma 15 turda kendini amorti etmiyor — uzun oyun yatırımı;
katkısının sınırlı kalmasının sebebi tavan: üç dal da en fazla Sv.2 olabildiği için toplam
yatırım 54 puanla sınırlı, yani araştırma **tek seferlik bir sıçrama, süren bir kartopu değil.**

*Simülasyonda iki kurgu hatası düzeltildi (betikte yazılı): "her parçadan her şeyle saldır"
politikası kuvveti dağıtıyordu (26/181'de kalıyordu) ve toplanma saldırıdan SONRA çağrıldığı
için hiç tetiklenmiyordu — saldırı bütün birimleri rezerve etmişti.*

## Ölçüler

| | Görev 05 | Görev 06 |
|---|---|---|
| Test | 249 | **330** |
| Kayıt sürümü | 5 | **6** (1–5 reddediliyor, 5'e ayrı sebep) |
| Kayıt boyutu (başlangıç) | 21.6 KB | **21.6 KB** — değişmedi |
| Kayıt boyutu (15 tur) | 23.3 KB | 21.7–22.3 KB (sınır 26) |
| Yeni dosya | — | `toplanma.js` · `arastirma.js` · `butce.js` · `ArastirmaEkrani.js` · `scripts/denge-simulasyonu.js` |


---

# GÖREV 07 — DÜŞÜNEN RAKİP (2026-07-31)

> Rapor: `docs/GOREV-07-RAPOR.md` · Görev tanımı: `docs/GOREV-07-yapay-zeka.md`

Dünya artık kendi kendine oynuyor. Aşağısı kararların **gerekçeleri**; sayılar ve sonuçlar
raporda.

## Baki'nin kararları

| Soru | Cevap | Gerekçe |
|---|---|---|
| Aktörler aynı anda mı oynar | **A2** | Belge düz eşzamanlı öneriyordu; Baki "alınan yerden saldırı" itirazını yaptı. Ara yol: sıra tohumla karışır, aktör O ANKİ duruma bakar. Tek TURU BİTİR anı korunur, ölü emir doğmaz. |
| Kuvvet bölme | **A** (tümü/yarısı) | Tam arama §9.3'te zaten dışlanmış; ölçüm bu bütçeyle tur başına ~8 ms verdi. |
| Garnizon il ölçeğinde | **A** | Değer÷savunma yayılımı 6.67 → 1.56 kat. |
| Kişilik + zorluk | **A** (ekransız) | Zorluk ölçümün parçası: "YZ çok mu sert" sorusu ancak kademe varsa cevaplanabilir. |
| Tur raporu | **A** (kademeli) | 80 aktörün turu okunacak metin değil. |

## Neden bazı şeyler belgeden farklı yapıldı

**Kişilikler kayda yazılmadı, türetiliyor.** Belge "kayıtta tutulur" diyordu. Aynı sonucu
türeterek almak hem daha küçük (27.3 KB → 19.4 KB; sınır 26) hem daha güvenli: tohum, aktör
listesi ve zorluk zaten kayıtta, üretim belirlenimci. Tur sırasının kayda girmeme gerekçesinin
aynısı.

**Zorluğa üretim bonusu verilmedi.** §9.4 "zor: + küçük üretim bonusu" diyordu. Ölçüm
bonussuz da yeterli fark olduğunu gösterdi (15 turda kalan aktör kolayda 79, zorda 32) ve
gizli bonus §9/tuzak 5'in tam olarak uyardığı şey — oyuncu aldatıldığını hissederse haklıdır.
Tasarım belgesi bu satırıyla birlikte güncellendi.

**`kisilik.js` diye yeni bir dosya açıldı.** Kişilik üretimi `zeka.js`'teydi ve
`oyunDurumu.js` onu kurulumda çağırınca döngü doğdu (oyunDurumu → zeka → oyunDurumu).
Görev 06'da `kadroAl` aynı sebeple toplanma.js yerine ordu.js'e konmuştu.

**Dost parçaya takviye hamlesi YAZILMADI.** Zekânın fayda formülü fetih üstüne kurulu (§9.1).
Takviye eklemek, ölçülemeyen bir davranış eklemek olurdu ve "zekâ neden hiç saldırmıyor"
sorusunun cevabını gizlerdi. Bilinen sınır olarak rapora yazıldı; Görev 08'de cephe
yönetimiyle birlikte anlamlı olacak.

## Ölçütün kendisi de yanlış olabilir — bu sefer ÜÇ KEZ

Görev 06'nın dersi bu görevde en pahalı derse dönüştü. Moral ölçümünde:

1. İlk koşuda beş modelin beşi de "§3.7 TAM" dedi. Testler koşulunca **dördü kırıldı** —
   ölçüt kıl payı biten satırları atlıyordu, testler atlamıyordu.
2. Ölçüt 15 satırın tamamına genişletildi; bu sefer **bugünkü oyun bile 8/15 verdi**. Fazla
   sıkıydı: §3.7 sürekli modelin çıktısı, motor bazı satırları zaten farklı bitiriyor.
3. Ölçüt testlerin baktığı **dört kısıta** hizalandı ve doğru cevabı verdi.

Aynı şey ağaç ölçümünde de oldu: "ölçülen sınır = tavan" varsayımı yanlıştı. Ölçüm "buraya
kadar bozulmuyor" der; tavan bir kademe altında durmalı ki §3.7 tam sınırda oynamasın.

## Bozgun modeli: neden kayıp sayısı çalışmıyor

Görev belgesi dört aday sayıyordu. Üçü aynı kapıya çıkıyor:

```
sayaç:          bozgun ⟺ k ≥ ⌈n/2⌉ + bonus
kesirli taban:  bozgun ⟺ k ≥ n/2 + bonus ⟺ aynı eşik (k tam sayı!)
oransal kayıp:  bozgun ⟺ 2k/n ≥ 1 ⟺ aynı eşik
```

**Granülerliğin kaynağı formül değil, kaybın tam sayı olması.** Tek yönlülük ancak bozgun
sürekli bir büyüklüğe — ordunun kaybettiği can oranına — bağlanınca kazanılıyor.

Bir incelik: oran modeli bozgunu birim kaybından koparınca ordu **hiç kimse ölmeden**
dağılabiliyor. 1 zırhlı vs 1 piyade'de zırhlının ilk vuruşu piyadenin canının %75'ini
götürüyor ama öldürmüyor; oransız kontrol piyadeyi orada bozguna uğratıp kaçırıyordu — oysa
§3.7'nin en net satırı "zırhlı piyadeyi 1v1 EZER". "En az bir kayıp" şartı bunu düzeltti.

## Ondalık temizliği: neden ölçek büyütmek

Baki "oyunda ondalıklı hiçbir şey istemiyorum" dedi. Kök sebep %8 oransal araştırma artışıydı
(6 → 6,48). Üç yol vardı:

- **Mutlak +N'e dönmek** — ölçüm karşı çıktı: mutlak artışta piyade-ağır dalı Sv.1'de
  kırılıyor, çünkü +1 statı düşük birime orantısız yarıyor (piyade 3→4 %33, topçu 8→9 %13).
- **Artışı yuvarlamak** — Sv.1'de hiç artış olmuyor (round(6.48) = 6). Ölü seviye.
- **Ölçeği büyütmek** ✓ — dört muharebe statı da aynı sayıyla çarpılınca hasar ve can aynı
  oranda büyür, **oranlar hiç değişmez**. §3.7 birebir korundu (ölçüldü: kırık yok).

25, %8'in tam sayı çıkmasını sağlayan en küçük katsayı. Nüfus/ekonomi ölçeklenmedi — onlar
fiyat, muharebe statı değil.

## Zırhlının savunma dalı neden yok

Ölçümün en net bulgusu. Zırhlının zırhı 8, dayanıklılığı 24 — ikisi de tavanda. Birini bir
tık artırmak §3.7'nin "3 piyade 1 zırhlıyı yener" satırını anında kırıyor; **her artış
oranında Sv.0** çıktı. Üçüncü ana dalı bu yüzden savunma değil **paletli üstünlük**: arazinin
zırhlıya verdiği cezayı yumuşatıyor. Zırhlının gerçek zayıflığı zaten arazi (§3.5), zırhı değil.

Yan bulgu: tavanı Görev 06'da Sv.2'de tutan şey de tam buydu. Dal birime özgü olunca o
kırılma piyade ile topçuyu hiç ilgilendirmiyor ve tavan Sv.3'e çıkabiliyor.

## Ölçüler

| | Görev 06 | Görev 07 |
|---|---|---|
| Test | 348 | **436** |
| Kayıt sürümü | 6 | **7** |
| Kayıt boyutu (başlangıç / 15 tur) | 21.6 / 22.3 KB | **19.4 / 25.2 KB** (sınır 26) |
| Araştırma | 3 dal, tavan Sv.2 | **12 dal, tavan Sv.3** |
| Muharebe statları | §3.1'in ham sayıları | **25× ölçekli** (ondalık olmasın diye) |
| Yeni dosya | — | `zeka.js` · `kisilik.js` · `sira.js` · `TurPerdesi.js` · beş ölçüm betiği |

---

# GÖREV 08 — HİSSİYAT (2026-08-01)

Görev tanımı: `docs/GOREV-08-hissiyat.md`. Baki'nin isteği: *"Oyunun hissiyatının
artırılması gerek. Savaşların daha çarpıcı olmasını isterim; oyuncu oynarken o fetih,
kayıp hissiyatını, savaşma hissiyatını almalı."*

## Görev 08 / Adım 0 — Zemin

Beş sorunun cevabı alındı, denge sayıları kondu, husumet tablosunun yapısı kuruldu,
ses listesi çıkarıldı, kayıt sürümü kararı verildi. **Ekranda hiçbir şey değişmedi.**

### Baki'nin kararları

| Soru | Cevap |
|---|---|
| 1 — Savaş nerede oynatılır | **c** karma — ama önce görmek istedi; iki seçenek de canlandırılıp gösterildi |
| 2 — Ses ve titreşim | **A** ikisi de |
| 3 — Varsayılan tempo | Hız kademesi DEĞİL, **kapsam ayarı** (aşağıda) |
| 4 — Yapay zekâ takviyesi | **A** tek yönlü, iç bölgeden cepheye |
| 5 — Rekabet olayı | **B + A'nın üçüncü taraf kısıtı** (aşağıda) |

### Tempo tuzağının çözümü süreyi değil KAPSAMI daraltmak

Görev belgesi §5/Soru 3 üç hız kademesi öneriyordu (kapalı / hızlı / tam). Baki
*"bizi ilgilendiren savaşların üzerinde durabilirsek güzel olur... en kısa olacak
şekilde uygula"* dedi ve bu, §4.4'ün tuzağını başka bir yerden çözdü:

**50 turluk oyunu işkenceye çeviren şey bir savaşın 5 saniye sürmesi değil, 80 aktörün
savaşını izlemek.** Oyuncunun savaşı turda 1–3 tane; onlar tam ayrıntıyla oynasa bile tur
birkaç saniye sürer.

Sonuç: kullanıcıya çıkan tek ayar `kapalı / cephem / hepsi`, varsayılan **cephem**.
İki ayar yerine bir ayar — hem Baki'nin istediği "en kısa uygulama", hem daha iyi tasarım:
"izlemek istediğim savaş atlandı" durumu tanım gereği doğmuyor. Süre `HIZ_CARPANI`'nda tek
sayı olarak duruyor, kullanıcı ayarına çıkmıyor.

**Yan fayda:** Baki'nin Soru 1'deki *"önemli savaşların neye göre seçileceğine düzgün karar
vermek lazım"* endişesi de büyük ölçüde kapandı. `ONEMLI_ESIGI` artık neyin oynayacağına
değil, neyin AYRINTILI oynayacağına karar veriyor (eşiğin üstü birlik şeridi açar).
Hiçbir savaş sessizce atlanmıyor.

### Kararı görsel olarak vermek — karma vs. ayrı sahne

Baki Soru 1'e *"önce karmanın nasıl olacağını görmem gerek, B bana en güzel geleni"* dedi.
Tarifle karar verilecek bir şey değildi; aynı muharebe iki biçimde de canlandırılıp
gösterildi (harita + rozet yanı şerit vs. tam ekran sahne). Gördükten sonra karma'yı
seçti, iki şartla: **haritaya yakınlaşmada bug olmayacak** ve **önemli savaş ölçütü
düzgün olacak.**

Kamera için üç koruma baştan kondu (`DENGE.SAHNE.KAMERA`):
`ACIK` tek satırla kapatır · `EN_COK: 1` tur başına tek kaydırma (§6/4) ·
`YAKINLIK` 2.8 — haritanın gerçek aralığının (0.9×–7×) ve `ROZET.YAKIN_SINIR`'ın (2.7)
içinde, yani kamera durduğunda parça başına rozet görünür. Üçü de testle kilitli.

### Düello: "üçüncü devlet karışamaz" tek cümle, üç ayrı kural

Baki B'yi seçti ama A'nın birinci maddesini de istedi: *"Kutsal savaşların en önemli
işlevi 2 ilin bir düelloya çıkması."* Haklı — kısıt olmadan düello, iki tarafa bonus veren
sıradan bir savaştır.

Ama tasarım §11'in tek cümlesi kodda üç ayrı kural olabiliyor ve aralarındaki fark oyunu
ciddi biçimde değiştiriyor:

```
kapali    → kısıt yok (saf B)
cephe     → üçüncü aktör, iki tarafın BİRBİRİYLE SINIRDAŞ olduğu parçalara saldıramaz
topraklar → üçüncü aktör, iki ilin asıl topraklarına hiç saldıramaz
```

`topraklar` tematik olarak en güçlüsü ama **sömürülebilir**: oyuncu hasmına bilerek
saldırıp sınırını 10 tur dokunulmaz yapabilir. Varsayılan `cephe` seçildi — kısıt tam
olarak kavganın olduğu yerde geçerli, sömürüsü yok (zaten savaştığın hattı koruyorsun) ve
komşuluk grafiğinden tek geçişte çıkıyor. **Seçim Adım 7'nin başında Baki'ye sorulacak**,
değiştirmek tek kelime.

### Kayıt sürümü: 8, ama Adım 7'de

Düello turlara yayıldığı için (`durum.duellolar`) sürüm 8 gerekiyor. Ama Görev 07'nin dersi
(rapor §8/4) "sürüm, durumun BİÇİMİ değiştiği adımda yükseltilir" — ne önce ne sonra.
Şimdi yükseltmek, hiçbir şey değişmemişken Baki'nin elindeki kaydı reddetmek olurdu.
Gerekçe `oyunDurumu.js`'te KAYIT_SURUMU'nun üstüne yazıldı.

Pay analitik olarak bağlandı: 15 turda 25.2 KB, sınır 26 → ~0.8 KB. `EN_COK_ETKIN: 8`
düello kaydına **garanti kapak** koyuyor (~0.25 KB) ve bir test bunu kilitliyor. Kapak
aynı zamanda ekranın "her yer kutsal savaş" hissine boğulmasını da engelliyor.

Olay listesi ve ses/titreşim/gösterim ayarları kayda GİRMİYOR — biri bir turluk gösterim
verisi (tur raporunun kuralının aynısı), öteki cihaz tercihi.

### Husumet tablosu: kod hiçbir rekabet uydurmuyor

`veri/husumetler.js` açıldı. Tasarım §11 dört çift sayıyor ama ikisinin konusu ve savaş
adı belgede yazılı değil — **uydurulmadı**, şablon olarak yorum satırında duruyor:

| İl A | İl B | Konu | Savaş adı | Komşu mu |
|---|---|---|---|---|
| Ordu (52) | Giresun (28) | fındık | Kutsal Fındık Savaşı | evet |
| Siirt (56) | Gaziantep (27) | fıstık | Fıstık Savaşı | **hayır** |
| Trabzon (61) | Rize (53) | *Baki yazacak* | *Baki yazacak* | evet |
| İstanbul (34) | Ankara (06) | *Baki yazacak* | *Baki yazacak* | **hayır** |

**Denetim yazılırken çıkan bulgu:** dört çiftin ikisi komşu değil. Komşu olmayan iller
ancak biri ötekine kadar genişleyince karşılaşır, yani düello oyunun geç saatlerine kalır.
Hata değil ama bilinmeli — `veri-dogrula.js` bunu **uyarı** olarak yazıyor, Baki yeni satır
eklerken görecek.

Tablo `npm run kontrol`'e bağlandı: geçersiz il kodu, kendisiyle hasım, tekrar eden çift,
tekrar eden savaş adı, boş alan — hepsi yakalanıyor. Ayrıca bir test §9'un açık şartını
kilitliyor: **hiçbir savaş adı/konusu `src/` içine gömülmemiş.** Bu olmadan "satır eklemek
yalnızca veri değişikliği" kuralı sessizce ölür ve kimse fark etmez.

`ZEKA.HUSUMET_ACIK` bilerek `false` bırakıldı: açmak zekânın kararlarını bugün değiştirir
ve Adım 0'ın "ekranda hiçbir şey değişmez" kuralını bozardı. Adım 7'de açılacak.

### Takviye: kuvvet bölünmüyor

`ZEKA.TAKVIYE` konurken bir şey ölçüm yapmadan da netleşti: takviyede kuvvet aday
oranlarına bölünmemeli. Gönderen parçanın düşman komşusu yok, yani savunacak cephesi de
yok — tümünü gönderir. Yan faydası hamle uzayında: saldırı adayları parça başına
2 × komşu üretiyor, takviye tek aday üretince toplam ~4× değil ~3× komşu oluyor. Görev
belgesi §Soru 4 "aday sayısı yaklaşık iki katına çıkar" diyordu; beklenti bunun altında,
Adım 1 ölçecek.

`ACIK` anahtarı zorunlu: Adım 1 ölçümü "takviye açık / kapalı" karşılaştırması istiyor.

### Ses listesi

`docs/GOREV-08-SES-LISTESI.md` — 12 ses, her biri için süre/nerede çalar/öncelik, biçim
şartları (mp3, ≤150 KB, toplam ≤1 MB), kaynak önerileri ve lisans künyesi tablosu.
Görevin tek dış bağımlılığı; Adım 3 tıkanmasın diye şimdi çıkarıldı. Sesler gecikirse
Adım 3 yine cihazda denenebilir — titreşim dış bağımlılık değil ve tek başına ne kadar iş
yaptığı bilerek ölçülecek.

### Ölçüler

| | Görev 07 sonu | Adım 0 sonu |
|---|---|---|
| Test | 436 | **452** (+16) |
| Kayıt sürümü | 7 | 7 (8'e Adım 7'de) |
| Yeni dosya | — | `veri/husumetler.js` · `testler/rekabet.test.js` · `docs/GOREV-08-SES-LISTESI.md` |
| Değişen | — | `denge.js` (SAHNE, REKABET, ZEKA.TAKVIYE) · `oyunDurumu.js` (yorum) · `veri-dogrula.js` |

## Görev 08 / Adım 1–9 — Sahne katmanı, kutsal savaşlar, takviye

Rapor: `docs/GOREV-08-RAPOR.md`. Buraya yalnızca **ölçümün fikir değiştirdiği** yerler.

### Ölçüm üç kez fikir değiştirdi

**1. `hepsi` kapsamı tur başına 14.4 saniyeydi ve sebebi savaşlar değil KARTLARDI.**
İlk tahmin raunt dökümüne yüklenmekti; döküm uzaktakilerden kesilince süre yalnızca
14.4 → 13.6 sn indi. Asıl sebep şuydu: haritada 81 ilin çoğu 1–2 parçalı, yani uzaktaki
hemen her fetih bir "il tamamlandı" + bir "il kaybedildi" kartı doğuruyor. İkisi birden
3.4 saniye — tek bir uzak savaş, oyuncunun bütün turundan uzun sürüyordu.

Kart yalnızca oyuncuyu ilgilendiren fetihte açılınca 13.6 → 7.6 sn. Kural zaten §4.4/3'te
yazılıydı ("cephede ayrıntı, uzakta manşet"); ölçüm onu kartlara da uygulamayı öğretti.

**2. "Takviye gereksiz" cevabı yanlıştı ve sebebi ölçüm değil DÜNYANIN HÂLİYDİ.**
İlk koşu (orta kademe, 15 tur) 1216 saldırı adayına karşı 14 takviye adayı verdi — yani
%1. Bakınca sebep açıktı: orta kademede kimse büyümüyor, aktörlerin çoğu 1–3 parçalı ve
her parçası cephede. **İç bölge yoksa takviye edecek bir şey de yok.**

Görev 07 raporu zor kademede 81 aktörün 32'ye indiğini ölçmüştü. Ölçüm orada tekrarlandı:
iç bölge parçası 16 → 39, ölü bekleyen birim 61 → 95. Sorun konsolidasyonla doğuyor.

Sonra ölçüm bir kez daha değişti: takviye AÇILINCA aynı sayıyı yeniden ölçmek gerekiyordu.
Açık/kapalı karşılaştırması kuruldu (aynı tohum, aynı oyuncu davranışı) ve asıl sayı çıktı:
**zor kademede ölü bekleyen birim 65 → 44, yani %32 azalma.** Yan etki de ölçüldü: en büyük
imparatorluk 18 → 25 parça.

**3. Belgenin "iki kat maliyet" beklentisi tutmadı: ölçüm 1.02× dedi.**
Sebebi `TAKVIYE.KUVVET_ADAYLARI`'nın tek elemanlı olması. İç bölge parçasının düşman
komşusu yok, yani geride tutacak cephesi de yok — tümünü gönderiyor, tek aday üretiyor.

### Şaşırtıcı biçimde temiz bir sonuç: iki aday kümesi AYRIK

Takviye puanının saldırı puanıyla aynı ölçekte olması gerektiğini varsaymıştım; ikisi aynı
sıralamada yarışacaktı. Yarışmıyorlar:

```
adayHamleler     → yalnızca kendisinin OLMAYAN komşusu bulunan parçadan  (cephe uzaklığı 0)
takviyeAdaylari  → yalnızca öyle bir komşusu OLMAYAN parçadan            (uzaklık > 0)
```

Aynı parça ikisine birden giremez ve "tek kaynaktan tek emir" kuralı kaynağa göre çalıştığı
için listeler hiç karışmıyor. Ölçek yalnızca eşiğe karşı anlamlı. Bu, takviye puanına
kişilik ağırlığı ve kuvvet çarpanı koymamayı da haklı çıkardı.

Bir yan etki yakalandı: eşik artık türe göre, o yüzden sıralı listedeki `break` `continue`
oldu. `break` düşük puanlı bir saldırının arkasında duran geçerli bir takviyeyi sessizce
yerdi.

### Rozet katmanı: belgenin önerdiği yol değil, daha güvenli olanı

Belge "efekt rozetin üstündeki dönüşümü oynatır" diyordu — rozetin kendisine dokunmayı.
Bunun yerine efektler rozetlerin ÜSTÜNDE ayrı bir katmana çizildi ve iki katman AYNI sabit
yerleşimi okuyor (`haritaSabitleme.js`).

Yerleşimin ortak dosyaya taşınması şart oldu: ikinci bir kopya, Görev 05'te akıcılığı altı
tur kovalatan ayrışmanın ta kendisi olurdu. İki katman bir piksel ayrışsa efekt rozetin
yanında patlar.

Kazanç ölçülebilir: gösteri boyunca rozet katmanının özellikleri hiç değişmiyor, yani
`React.memo` tutuyor ve **rozet başına maliyet sıfır.**

### Husumet bayrağı üreteçten bir sayı tüketiyor

`HUSUMET_ACIK` false iken `uretec.aralik` hiç çağrılmıyordu, true iken çağrılıyor. Sonuç:
aynı tohumla üretilen BÜTÜN kişilikler kayıyor. Kayıt sürümünün 8'e çıkmasının ikinci
sebebi bu — sürüm 7 kaydı yüklenseydi rakipler sessizce başka insanlara dönüşürdü.

### Düello gerçekten tetikleniyor

25 turluk koşuda hem orta hem zor kademede *Kutsal Fındık Savaşı* başladı (Ordu ↔ Giresun).
Tabloda iki satır var ve biri (Siirt–Gaziantep) komşu bile değil; satır eklendikçe artacak.

### "Üçüncü devlet karışamaz" tek cümle, kodda üç kural

`kapali` / `cephe` / `topraklar`. `topraklar` tematik olarak en güçlüsü ama sömürülebilir:
oyuncu hasmına bilerek saldırıp sınırını 10 tur dokunulmaz yapabilir. `cephe` seçildi —
korunan yer yalnızca kavganın fiilen sürdüğü hat. Karar `DENGE.REKABET.UCUNCU_TARAF`'ta
tek kelime ve cihaz denemesinden sonra değiştirilebilir.

### Ölçüler

| | Görev 07 | Görev 08 |
|---|---|---|
| Test | 436 | **496** |
| Kayıt sürümü | 7 | **8** |
| Kayıt boyutu (başlangıç / 15 tur) | 19.4 / 25.2 KB | **19.4 / 24.8 KB** (sınır 26) |
| Tur başına hesap | ~45 ms | **~52 ms** |
| Gösteri (cephem / hepsi) | — | **3.5 / 8.7 sn** |
| İç bölgede ölü birim (zor) | 65 | **44** |
| Yeni dosya | — | `olaylar.js` · `rekabet.js` · `ayarlar.js` · `sahne/` (3) · `SahneKatmani.js` · `SahneKarti.js` · `haritaSabitleme.js` · `husumetler.js` · `sahne-olcum.js` |

## Görev 08 / Cihaz denemesi sonrası — dört düzeltme (2026-08-01)

Baki oyunu telefonda denedi ve dört şey söyledi. Dördü de yapıldı.

### 1. "Savaşlar fazla hızlı… bir bakıyorum sonuç ekranı geliyor"

Teşhis iki parçalıydı ve ikincisi gözden kaçmıştı:

- **Bir raunt 260 ms sürüyordu.** Gözün rozete gidip düşen birliği ve uçuşan kaybı okuması
  bu kadar sürmüyor bile. Süreler yaklaşık iki katına çıkarıldı; en kritik olan `vurus`
  260 → 650 ms.
- **Son olaydan sonra tur raporu ANINDA açılıyordu.** Gösterinin bittiği an ile perdenin
  kapandığı an aynıydı; son fetih ekranda otururken üstüne metin biniyordu. `SON_BEKLEME`
  (700 ms) eklendi.

`TEKRAR_KISALTMA` da gevşetildi (3/0.55 → 4/0.70): kısaltma çok erken ve çok sert
başlıyordu, dört raunt süren sıradan bir muharebede bile son raundlar okunamıyordu.

Sonuç: `cephem` 3.5 → **6.6 sn/tur** (50 turda 5.5 dk).

**Yolda bir kusur yakalandı:** `EN_COK_SAVAS` sınırı OYUNCUNUN kendi savaşlarına da
uygulanıyordu. Sekiz cephede savaşan bir oyuncunun iki savaşı sessizce atlanırdı — yani
ayarın bütün sözü ("izlemek istediğim savaş atlanmaz") kâğıt üstünde çiğneniyordu. Sınır
artık yalnızca uzaktakilere; test kilitledi.

### 2. "Bir tık, sadece bir tık daha agresif olabilirler"

Şikâyet orta kademeydi ve suçlu `TERIM.ACIKTA` çıktı: aktör kuvvetini gönderdiğinde
arkasının açık kalması cezalandırılıyor ve ceza `temkin` ile çarpılıyor. Katsayı büyük
olunca temkinli aktör hiç saldırmıyor.

Taranan beş nokta (15 tur, oyuncu hiç emir vermiyor, **saldırı sayısı**):

| ACIKTA | SALDIRI | kolay | orta | zor |
|---|---|---|---|---|
| 2.0 | 0.50 | 22 | 122 | 705 |
| **1.9** | **0.60** | **25** | **169** | **818** |
| 1.8 | 0.65 | 26 | 177 | 866 |
| 1.75 | 0.70 | 30 | 229 | 855 |
| 1.5 | 0.80 | 42 | 273 | 1028 |

**1.9 / 0.60 seçildi.** Orta kademede %39 artış — gözle görülür ama oyunu başkalaştırmıyor;
kolay hâlâ sakin (22 → 25), zor zaten doymuş. "Bir tık" tam olarak bu. Bir sonraki kademe
(1.8/0.65) not edildi, hâlâ pasif gelirse tek satır.

`ACIKTA`'nın 1.75'in altına inmesi "bir tık" değil başka bir oyun: orta kademe iki katına
çıkıyor ve aktörler arkalarını hiç kollamaz oluyor.

### 3. Husumet tablosu Baki'ye sunuldu

İki satır var (Ordu–Giresun fındık, Siirt–Gaziantep fıstık). Baki listeyi görüp ekleme
yapacak. Denetim uyarısı da sunuldu: Siirt–Gaziantep komşu değil, yani düellosu ancak
biri ötekine kadar genişleyince tetiklenir.

### 4. Ayar metinleri oyuncu diline çevrildi

> *"Ayarlar kısmında seninle teknik tasarımda konuştuğumuz cümleler var, onları oyuncuya
> sunulacak cinsten cümlelere çevir. Artık oyunu çıkarmaya hazırlanıyoruz."*

Haklıydı: ekranda bana yazılmış cümleler vardı. *"Ekstra kaynak ya da gizli avantaj
vermez"* bir geliştirici savunmasıydı; *"sonuç değişmez"* benim güvencemdi; *"manşet
geçer"* bir kod terimiydi.

| Önce | Sonra |
|---|---|
| "Rakiplerin ne kadar atak olduğunu belirler. Ekstra kaynak ya da gizli avantaj vermez — yalnızca nasıl düşündüklerini değiştirir." | "Karşındaki illerin ne kadar gözü kara olduğunu belirler. Hepsi seninle aynı kurallarla oynar; değişen tek şey ne kadar risk aldıkları." |
| "Turu bitirince ne izleyeceğin. Gösteri sırasında ekrana dokunmak her zaman atlar — sonuç değişmez." | "Turu bitirdiğinde savaşların nasıl geçtiğini izleyebilirsin. İzlemek istemediğin an ekrana dokun, gösteri biter." |
| "Yalnızca senin savaşların oynar. Uzaktakiler manşet geçer." | "Kendi savaşlarını baştan sona izlersin. Uzaktakiler rapora yazılır." |
| "Tur anında biter, hiçbir şey oynatılmaz." | "Savaşlar bir anda biter. Sonucu doğrudan raporda okursun." |
| "Senaryo: Türkiye" | "Harita: Türkiye" |

**Yayın hazırlığı olarak bir kelime tutarsızlığı da düzeltildi:** oyuncuya görünen her
yerde **BÖLGE** deniyordu ama üç yerde "parça" sızmıştı (hedef seçme şeridi, tur raporu
özeti, il panelinin başlığı). "Parça" bir geliştirme terimi; hepsi bölgeye çevrildi.

## Husumet tablosu dolduruldu — yedi savaş (2026-08-01)

Baki listeyi verdi, iki kelime kararını bana bıraktı, biri de araştırmadan çıktı.

### "Kutsal" → "BÜYÜK"

> *"Kutsal Fındık Savaşı hem güzel hem absürt duruyor."*

Teşhis doğruydu ve sebebi şu: sıfat mizahı KELİMEYE yüklüyordu, oysa mizah zaten KONUDA
var — iki il fındık için savaşıyor. "Büyük" ciddi duruyor, "Büyük Savaş" çağrışımı komuta
masası tonuna oturuyor, ve cümle ciddi durdukça ne için savaşıldığı daha komik oluyor.
Kadim / Ebedi / sıfatsız da sunuldu; Büyük seçildi.

### Trabzon – Rize: "Karadeniz'in başkenti" elendi, ÇAY seçildi

Araştırmadan ilk çıkan konu kuymak–mıhlama çekişmesiydi; Baki *"ana kapışma sanki bu değil
gibi"* dedi. İkinci öneri "Karadeniz'in başkenti" idi ve ona da haklı bir itiraz geldi:

> *"Büyük Karadeniz gibi bir isme yatkınım ama diğer Karadeniz illerini ignorelamış oluruz."*

Doğru — Samsun da Ordu da o iddiayı taşır. Çay itirazı tam olarak çözüyor: çay **yalnızca
bu iki ilin işi** (Rize birinci, Trabzon ikinci üretici), Ordu ve Giresun fındık yetiştiriyor.
Yan fayda: Karadeniz'de iki komşu çift, her birinin kendi ürünü — tabloda simetri.

### İstanbul – Ankara: tek yemeksiz husumet

Baki konuyu tarif etti: *"İstanbul'un trafiği, kalabalığı; Ankara'nın romantize edilmesi;
öte yandan Ankara'da deniz olmaması ve İstanbul'un ekonomi, ulaşımda daha gelişmiş olması."*

Payitaht / başkentlik / taht elendi — kavga resmî unvanla ilgili değil. **"Büyük Şehir
Savaşı"** seçildi: ikisi de büyükşehir, yani ad hem sıfatı hem unvanı birden okuyor.
Konu alanı `şehir üstünlüğü`.

### Araştırmadan eklenenler ve elenenler

| Aday | Karar |
|---|---|
| Adıyaman–Şanlıurfa / çiğ köfte | **eklendi** (komşu) |
| Trabzon–Rize / kuymak–mıhlama | elendi, yerine çay |
| Gaziantep–Şanlıurfa / lahmacun | eklenmedi |
| Hatay–Mersin / künefe | eklenmedi (komşu da değiller) |

### Ölçüm: tablo dolunca düello gerçekten sıklaştı

| | 2 satır | **7 satır** |
|---|---|---|
| orta, 30 tur | 1 düello | **4 düello** |
| zor, 30 tur | 1 düello | **5 düello** |
| en çok eşzamanlı | 1 | **4** |

Yedi satırın üçü komşu olmayan çift (Siirt–Gaziantep, Afyon–Kayseri, İstanbul–Ankara);
onların düellosu ancak taraflardan biri ötekine kadar genişleyince başlıyor. Buna rağmen
İstanbul–Ankara orta kademede tetiklendi.

### Ekranda kalan "kutsal" izleri temizlendi

Düello kartının başlığı `KUTSAL SAVAŞ` → **`BÜYÜK SAVAŞ`** (başlık ile altındaki ad aynı
dili konuşmalı) ve üçüncü taraf kısıtının ret cümlesi yeniden yazıldı:

> ~~"Burada bir kutsal savaş sürüyor. İki tarafın cephesine karışamazsın."~~
> **"Bu iki ilin kendi hesabı var. Aralarındaki savaş bitene kadar bu cepheye giremezsin."**

**Test kendini kanıtladı:** "hiçbir savaş adı/konusu `src/` içine gömülmemiş" testi, kart
başlığını değiştirirken yazdığım YORUM satırındaki savaş adını yakaladı. Kural yorumlarda
da geçerli olsun diye yorum yeniden yazıldı — test gevşetilmedi.

## Yayın diline geçiş — cümleler ve sadeleştirme (2026-08-01)

Baki üç şeyi birden istedi ve üçü aynı işin parçasıydı: **tahmin cümleleri değişsin ·
devrik cümleler düzelsin, daha uzun olsa bile daha açıklayıcı olsun · ama ekranda daha az
şey olsun** — *"bir anda çok şey verme, saldırı ekranı ve sonuç ekranı sadeleşebilir."*

Bu ikisi ilk bakışta çelişiyor (daha açıklayıcı = daha çok metin), ama değil: **çelişkiyi
çözen şey SAYIYI atıp CÜMLEYİ bırakmak.** Ekrandaki ham sayılar hem yer kaplıyor hem
oyuncunun kafasında bir işe yaramıyordu; yerlerine gelen cümleler daha az yer kaplıyor ve
daha çok şey söylüyor.

### Savaş tahmini: etiket gitti, cümle geldi

Eskiden tek kelimelik bir etiket ve yanında yarım cümle vardı. İkisi aynı şeyi söylüyordu;
kademeyi zaten RENK taşıyor.

| Önce | Sonra |
|---|---|
| **ÜSTÜN** · "saldırı rahat geçer" | **"Saldırı zaferle sonuçlanır."** + "Savaştan yaklaşık 4 birliğin sağ döner." |
| **DENK** · "sonuç kıl payı belirlenir" | **"Sonucu şans belirleyecek."** + "İki taraf da kazanabilir; savaşı son raunt belirleyecek." |
| **ZAYIF** · "saldırı kırılabilir" | **"Mağlubiyet kesin."** + "Bu kuvvetle saldırırsan ordunu kaybedersin." |

"Mağlubiyet kesin" abartı değil: tahmin ŞANSSIZ simülasyondur ve `zayif` kademesi
savunanın kazandığı hâldir; kuvvetler açık ara olduğunda şans zaten devre dışı kalıyor
(`SANS_KAPANMA_ORANI`).

### Saldırı ekranından kaldırılanlar

- **Ham stat satırları.** Her birimin altında "zırh 50 · ağır 75 · hafif 150 · dayanıklılık
  300" yazıyordu — üç birim × dört sayı = **ekranda on iki sayı**, ve o hesabı zaten savaş
  tahmini yapıyor. Karşı tarafın statları da aynı gerekçeyle gitti. Statların gerçekten
  okunacağı yer araştırma ekranı; orada duruyorlar.
- **İki satırlık arazi tablosu** ("ARAZİ: Dağlık" + "SAVUNMA GÜCÜ: Yüksek") tek açıklayıcı
  cümleye indi: *"Arazi dağlık; savunan taraf burada belirgin biçimde güçlü."*
- **Çift uyarı.** Savunmasız kalındığında hem sol sütunda hem tahminin altında ayrı ayrı
  yazıyordu. Tek cümlede birleşti — üstelik eskisi devrikti ("5 birim Bursa'yı savunmak
  için kalıyor" → "Bursa savunmasında 5 birlik geride kalıyor").

### Sonuç ekranı: ayrıntılar çekmeceye girdi

Muharebe satırı aynı anda şunları gösteriyordu: yol · KAZANDIN/KAYBETTİN · sonuç cümlesi ·
"Sen: … gönderdin, … kaybettin, … sağ döndü" · "Karşı taraf: …" · "Yer: dağlık arazi,
4 raunt" · yaralı notu · çekilme · ganimet. Bir turda üç muharebe olunca bu bir sayı
duvarıydı.

Çekmece zaten vardı (raunt raunt döküm). İki ayrı açılır bölüm yerine **tek bir "SAVAŞIN
AYRINTISI"** oldu ve ayrıntı satırları oraya taşındı. Üstte kalan şey oyuncunun gerçekten
baktığı şey: kim kazandı, ne oldu, ne kazandın.

### Devriklik ve "log" kalıpları

`X olmadı: sebep` kalıbı bir kayıt satırı gibi okunuyordu; hepsi düz cümleye çevrildi:

| Önce | Sonra |
|---|---|
| "Emir iptal oldu: gönderecek asker kalmamıştı." | "Bu emir işlenemedi çünkü gönderecek askerin kalmamıştı." |
| "Toparlanma olmadı: bütçen tek birliğe bile yetmedi." | "Bu ordu toparlanamadı çünkü bütçen tek bir birliğe bile yetmedi." |
| "Saldırın kırıldı, ordun dağıldı." | "Saldırın kırıldı ve ordun dağıldı; Serdivan karşı tarafta kaldı." |
| "Dağlar savunanın işine yarıyor" | "Arazi dağlık; savunan taraf burada daha uzun dayanır." |
| "Alırsan +4 nüfus seferberlik" | "Burayı alırsan seferberlikten 4 nüfus kazanırsın." |

Ayrıca `ordu.js`'te bir "parça" daha bulundu ve bölgeye çevrildi: *"Bu parça oyunun
dışında"* → *"Bu bölge oyunun dışında"*.

---

# GÖREV 09 — DİPLOMASİ VE ÇERÇEVE (2026-08-01)

Görev tanımı: `docs/GOREV-09-diplomasi-ve-cerceve.md`. Sekiz görevdir **maç** yapıldı;
bu görevde **oyun** yapılıyor — ana menü, mod, kazanma koşulu, diplomasi.

## Görev 09 / Adım 0 — Zemin

### Baki'nin kararları

| Soru | Cevap |
|---|---|
| 1 — Savaş ilanı zorunlu mu | **A** — üç durum (tarafsız · ittifak · savaş halinde), ilan yok |
| 2 — Diplomasi kimlerle | **A** — yalnızca "tanıdıkların" |
| 3 — Mod ve maç uzunluğu | **Belgeden farklı** — mod = kazanma koşulu (aşağıda) |
| 4 — Bölge modunun kapsamı | **A** — 7 coğrafi bölge, hazır liste |
| 5 — Kayıt yapısı | **A** — üç yuva |
| Ses dosyaları | Yok — Adım 7 atlanır, borç Görev 10'a |
| Üçüncü taraf kısıtı | `topraklar` + iki yeni kısıt (aşağıda) |
| Kutsal savaş süresi | Henüz görülmedi — cihaz denemesine |

### Mod sistemi: belge kapsama göre kurmuştu, Baki koşula göre kurdu

Belge modları **kapsama** göre tanımlıyordu (Bölge · Türkiye · Serbest). Baki
**kazanma koşuluna** göre tanımladı: tüm Türkiye'yi fethet · %50'sini fethet · sınırlı
turda en çok güçlenen il ol.

**Ayrım daha iyi ve bölge modunu dışlamıyor** — ikisi dik eksen:

```
KAPSAM (Türkiye / 7 coğrafi bölge)  ×  KAZANMA KOŞULU (Fetih / Yarım Fetih / Güç Yarışı)
```

Bölge modu kaybolmuyor, üç koşulun üçüyle de oynanabiliyor. Belgenin "Serbest" modu
düşüyor çünkü karşılığı artık kapsam + koşul seçiminin kendisi. Baki'nin Soru 4 cevabı
(7 coğrafi bölge) bu okumayla çelişmiyor, tamamlıyor.

### Süreyi tura çeviren sayı — bu görevin en zayıf varsayımı

Baki süre verdi, tur değil: Türkiye fethi üst sınır ~1 saat (iyi oynanırsa 30–40 dk) ·
%50 üst sınır 30–40 dk · güç yarışı 20–30 dk.

Çevrim `DENGE.MOD.SANIYE_PER_TUR` = **45 sn** üzerinden. İki bileşeni var ve **yalnızca
biri ölçülü**: gösteri 6.6 sn (`veri/sahne-olcum.md`, Görev 08) + oyuncunun karar süresi
~38 sn (TAHMİN). Cihaz denemesinde düzeltilecek ve düzeltilecek yer tur sınırları değil
bu tek sayı — üç modu birden kaydırıyor.

Tur sınırı **kapsam büyüklüğüne göre ölçekleniyor**: `TABAN + PARCA_BASINA × parça`.
Sabit sayı olsaydı, bölge maçı 80 turun 20'sinde biter ve kalanı formalite olurdu.
Türkiye kapsamında çıkanlar: Fetih 80 tur (~60 dk) · Yarım Fetih 50 tur (~38 dk) ·
Güç Yarışı 35 tur (~26 dk). Baki'nin verdiği üç aralığı da tutturuyor.

### Üçüncü taraf kısıtı: Görev 08'in borcunu Görev 09'un sistemi kapattı

Görev 08 `topraklar`ı tematik olarak daha güçlü bulmuş ama **sömürülebilir** diye geri
çevirmişti: *"oyuncu hasmına bilerek saldırıp sınırını 10 tur dokunulmaz yapabilir."*

Baki `topraklar` istedi ama sömürüyü kapatan iki kısıtı da aynı cevapta verdi:

| Kısıt | Sömürüye etkisi |
|---|---|
| `DUELLO_SURESI` 10 → **5** | Dokunulmazlık yarı yarıya kısaldı |
| `GIRIS_SARTI: 'baskaSavasYok'` | Sömürüyü yapacak oyuncu tanım gereği saldırgandır, yani başkalarıyla da savaş halindedir → **düellosu hiç başlamaz** |

**Seçenek değişmedi, etrafındaki kurallar değişti.** Görev 08 seçenekten kaçarak
korunuyordu; artık davranışın kendisi engelleniyor.

Dikkat çeken taraf: giriş şartı "savaş hali" kavramına dayanıyor ve o kavram **bu
görevde doğuyor.** Görev 08 bu kısıtı yazamazdı — yazacak malzemesi yoktu.

⚠ Giriş şartı düelloyu fazla nadir hale getirebilir (Görev 08'de 30 turda 4–5 düello
başlıyordu). Adım 3'ün ölçümü bunu sayacak; çıkmazsa gevşetilecek yer `GIRIS_SARTI`.

### Kayıt boyutu: sınır keyfiydi ve zaten aşılıyordu

Yeni ölçüm aracı: `scripts/kayit-boyut-olcum.js` → `veri/kayit-boyut-olcum.md`
(60 tur, üç koşu, alan başına döküm).

**Üç bulgu:**

1. **26 KB bir depolama sınırı değil, bir kanarya.** Görev 03 §7: *"yüzlerce KB ise
   GEOMETRİ SIZMIŞ demektir."* 26, o gün ölçülenin biraz üstüne konmuş ve bir daha hiç
   sorgulanmamış. Gerçek kısıt AsyncStorage'da ve kat kat yukarıda (Android ~6 MB).

2. **Sınır 40+ turluk maçta zaten aşılıyordu.** Bugüne kadarki bütün ölçümler 15 tur
   üzerindendi — 50 turluk Türkiye maçı **26.4 KB** ölçüldü. Yani diplomasi ve mod daha
   eklenmeden dışarıdaydık. Boyut testi artık 15 değil **50 tur** oynuyor.

3. **`aktorler` alanının 4.8 KB'ı boşuna yazılıyordu.** Aktörün altı alanının dördü
   türetilebiliyor: `id` zaten nesnenin anahtarı · `ad` ILLER'den · `renk` sabit
   tablodan · `tur` `oyuncuAktorId`'den. Gerçek durum yalnızca iki havuz.
   **Kayıt 26.4 → 22.0 KB.**

Bu üçüncüsü `kisilikler` (Görev 07) ve `ordu.sahip` (Görev 07) ile aynı kuralın üçüncü
uygulaması: **türetilebilen veya varsayılan olan kaydedilmez.** Kazanılan yer,
diplomasi + mod + üç yuvanın ekleyeceğinden fazla — yani yeni sistemin yeri, eskinin
gereksiz yazdığından çıktı.

Yeni sınır `DENGE.KAYIT_SINIRI_KB = 32`. Kanarya işlevi duruyor: bir parçanın geometrisi
ortalama ~8.7 KB (1.58 MB / 181), yani **tek bir parça sızsa bile** 30 KB'ı geçer ve test
öter. Sınır gevşedi, işlevi durdu.

⚠ `tur` alanı SICAK KOLTUKTA türetilemez hale gelir (Görev 10): iki insan oyuncu olunca
"oyuncu = tek kimlik" varsayımı düşer ve alan yeniden kayda girmeli. Not `kayitVerisi.js`'te.

### Yolda kapatılan tuzak: kapsam listesi iki yerde olacaktı

`senaryolar.js` kendi kapsam tablosunu tutuyordu (turkiye + karadeniz). Mod seçim ekranı
aynı listeyi gerektirince ikinci kopya doğacaktı — §10/4'ün ta kendisi.

Bedeli özellikle sinsi olurdu: **mod ekranı bir kapsamı gösterip oyun başkasını kurardı
ve hiçbir yerde hata çıkmazdı.** Liste tek yere toplandı (`DENGE.MOD.KAPSAMLAR`),
`senaryolar.js`'te yalnızca HESAP kaldı, `veri-dogrula.js` bölge adlarının `iller.json`
ile tuttuğunu denetliyor (yanlış yazılmış tek bir bölge adı = sıfır illi kapsam).

İl ve parça sayıları da koda yazılmıyor, kapsamdan sayılıyor: mod ekranında görünen
sayı ile oyunun kurduğu kapsam ayrışamasın.

### Kayıt sürümü — belgeye uyulmadı

Belge sürüm 9'u Adım 8'e yazmıştı. Adım 0'da kayıt biçimi zaten değişti, **yine de
yükseltilmedi**: değişiklik geriye dönük uyumlu yazıldı (`a.ad || türet`), sürüm 8 kaydı
bugün sorunsuz yükleniyor. Yükseltmek, hiçbir şey bozulmamışken Baki'nin elindeki kaydı
reddetmek olurdu — Görev 07'nin dersi (rapor §8/4) tam buna karşıydı.

Sürüm 9 **Adım 5'te** yükselecek: sürüm 8'i gerçekten kıran şey `durum.mod`'un yokluğu.
Modu olmayan kayıtta kazanma koşulu tanımsız kalır ve maç hiç bitmez — oyun çalışıyor
görünür, sadece kazanılamaz.

### Ölçüler (Adım 0 sonu)

| | Görev 08 sonu | Adım 0 sonu |
|---|---|---|
| Test | 497 | **499** |
| Kayıt (başlangıç / 50 tur) | 19.4 / 26.4 KB | **14.7 / 22.0 KB** |
| Kayıt sınırı | 26 KB (keyfî) | **32 KB** (gerekçeli, kanarya duruyor) |
| Kayıt sürümü | 8 | 8 (Adım 5'te 9 olacak) |

## Görev 09 / Adım 1 — Diplomasi motoru

`src/oyun/diplomasi.js` — üç durum, teklif, ateşkes, ihanet, zincir. 32 yeni test (531).

### "İlan yok" demek "savaş hali yok" demek değil

Soru 1/A'nın en önemli sonucu: **saldırının kendisi ilandır.** Oyuncu bugünkü gibi dokunup
saldırıyor — hiçbir ekran fazladan açılmıyor, hiçbir tur kaybedilmiyor — ama saldırı
çözülürken arkada savaş hali doğuyor. B seçeneğinin "tören"i alınmadan işlevi alınmış
oluyor: savaşın bir başlangıcı, bir sonu (ateşkes) ve haritada bir görüntüsü var.

`cozum.js`'te savaş hali `duelloDene`'nin **hemen yanına**, ondan **sonra** kondu.
Sıra önemli: düellonun giriş şartı "başka savaşı olmasın" ve o soruyu bu saldırının
kendisi kirletmemeli.

### `son` alanı neden var

Savaş satırı `{ tip, turdan, son }` — `son` = son temas turu. `SAVAS_UST_SINIRI`
"unutulmuş savaşlar birikmesin" diye konuldu; başlangıç turuna baksaydı **20 turdur
fiilen süren bir savaş da otomatik tarafsıza dönerdi**, yani kuralın tam tersi. İttifak
satırında bu alan yok.

### Döngü kırıldı: rekabet ↔ diplomasi

`diplomasi.js`, `rekabet.js`'i ithal ediyor (husumet ve düello sorguları için). Ama
düellonun giriş şartı savaş halini okumak zorunda — ters yön döngü olurdu.

Çözüm `rekabet.js`'in kendi precedent'i: **komşuluğu ham veriden okuma** notunun aynısı.
`baskaSavasVarMi` `durum.iliskiler`i doğrudan okuyor ve notu açıkça diyor ki bu bir KURAL
değil, aynı verinin tek satırlık sorgusu. Kuralın kendisi (`GIRIS_SARTI` karşılaştırması)
tek yerde.

### ⚠ GİRİŞ ŞARTININ BEDELİ ÖLÇÜLDÜ — ucuz değil

Adım 0'da "şart düelloyu fazla nadir yapabilir, Adım 3 ölçecek" diye not düşülmüştü.
Ölçüm beklemedi, çünkü Adım 1 biter bitmez ölçülebiliyordu. 30 turluk üç koşuda
**başlayan düello sayısı**:

| kademe | `yok` | `saldiranTemiz` | `baskaSavasYok` |
|---|---|---|---|
| kolay | 4 | 4 | 1 |
| orta | 11 | 7 | 5 |
| **zor** | **23** | **11** | **4** |

**Zor kademede sıkı şart §11'in tamamını fiilen susturuyor** (23 → 4): orada kimse "başka
savaşı olmayan" duruma hiç girmiyor, çünkü herkes sürekli birileriyle savaşta.

Üçüncü bir kademe eklendi: **`saldiranTemiz`** — yalnızca saldıranın başka savaşı
olmamalı. Sömürüyü **yine kapatıyor**, çünkü sömürüyü yapan taraf saldırandır; ama
savunanı cezalandırmıyor (savunanın başka cephesi olması onun tercihi değil).

Değer **değiştirilmedi** (`baskaSavasYok`, Baki'nin tarifi); seçim ona bırakıldı.

### Yolda yakalanan test kusuru

`zeka.test.js`'in "takviye salınımı yok" testi kaldı. İncelendiğinde **gerçek salınım
değildi**: süzgeç "dost parçaya giriş = takviye" diyordu, oysa emirler tur içinde sırayla
çözülüyor — bir aktör aynı turda önce 40-1'i fethedip sonra 68-1'den oraya asker yürütürse
o satır da `eskiSahip === aktorId` oluyor. Ama o bir takviye değil, az önce alınan toprağa
yapılan **takip hamlesi**; kaynağın (68-1) o turdaki cephe uzaklığı 0'dı, yani takviye
kuralının ön şartını hiç sağlamıyordu.

Süzgeç artık kuralın kendi ön şartını kullanıyor (kaynağın düşman komşusu olmamalı).
Dört tohumda doğrulandı: süzgeçle salınım 0, süzgeçsiz sahte salınım çıkıyor.
**Testin kapsamı daralmadı, doğru şeye nişan aldı.**

## Görev 09 / Adım 2–3 — Zekânın diplomasisi ve ÖLÇÜM

540 test. Ölçümler: `veri/diplomasi-olcum.md` · `veri/mod-esik-olcum.md`.

### Doygunluk gerçekten çıktı — ve iki kez yanlış yerden düzeltilmeye çalışıldı

Belge §10/6 "bu görevin oyunu bozabileceği tek yer" demişti. İlk koşu bunu doğruladı:
zor kademede 30. turda hayatta kalan **27 aktörün 26'sı tek ittifak bloğundaydı.**

**Birinci bulgu — ölçüt yanlıştı.** İlk denemede "etkin savaş sayısı" ölçüldü ve ölçüm
yalan söyledi: diplomasi kapalıyken savaş hali diye bir şey YOK, sayı tanım gereği 0
çıkıyor ve "diplomasi savaşı artırmış" gibi görünüyordu. Doğru ölçü tur raporundaki
**muharebe satırları** — iki rejimde de aynı şeyi sayıyor. (Görev 08'in dersinin aynısı:
ölçüt de yanlış olabilir, önce ölçütü sına.)

**İkinci bulgu — formül dünyanın büyüklüğüne bağlıydı.** `ORTAK_DUSMAN` terimi ham SAYI
kullanıyordu. Dünya konsolide oldukça herkesin herkesle 5–6 ortak düşmanı oluyor, terim
tek başına eşiği 10 kat aşıyor ve öteki bütün terimler anlamsızlaşıyordu. Terim **orana**
çevrildi (düşmanlarımın ne kadarı onun da düşmanı, 0–1); cephe yükü de öyle. Artık
`FAYDA.ESIK` oyunun her aşamasında aynı anlama geliyor.

**Üçüncü bulgu — ittifakın bedeli formülde hiç yoktu.** Yalnızca ZAYIF komşuyla anlaşmak
cezalıydı. Oysa HER komşu ittifakı genişleyebileceğin bir cepheyi kapatır — ittifakın
oyundaki asıl bedeli bu. `FAYDA.KOMSU` eklendi (açgözlülükle çarpılıyor: temkinli aktör
komşusuyla seve seve anlaşır).

### Eşik taraması: dar bir bant

| ESIK | kolay | orta | zor |
|---|---|---|---|
| 0.5 | 1% | 8% | **65% ✗** |
| 0.65 | 1% | 13% | 44% |
| **0.7** | **1%** | **10%** | **33%** |
| 0.8 | 0% | 1% | 6% (diplomasi ölü) |

Bant dardı çünkü **adayların neredeyse hepsi komşuydu** — hepsi `KOMSU` cezasını yiyor,
eşik biraz kalkınca hiçbiri geçemiyordu. Uzak aday üretmek için `BUYUKLUK_ESIGI` 10 → 4
indirildi; bu da tanıdık listesini **26 satıra** çıkardı, yani §10/9'un ("diplomasi
arayüzü şişebilir") tam olarak engellemek istediği şey.

Çözüm eşiği geri almak değil, **listeye kapak** koymak oldu (`TANIDIK.EN_COK: 10`):
sınırdaşların ve ilişkili olduğun herkes her zaman listede, "adı duyulmuş" uzak devletler
kalan yeri dolduruyor. Kesilen şey her zaman en az ilgili olan.

**Yerleşen değerler:** `ESIK 0.5→0.7` · `EN_COK_ITTIFAK 3→2` · `BUYUKLUK_ESIGI 10→4` +
`EN_COK 10` kapağı · `KOMSU -1.0` yeni terim.

| Kademe | Muharebe (kapalı→açık) | İttifaklı aktör | En büyük blok / canlı |
|---|---|---|---|
| kolay | 34 → 34 | 1% | 0.7 / 80 |
| orta | 170 → 162 | 10% | 3.0 / 63 |
| zor | 919 → 942 | 33% | 3.0 / 17 |

Üç sağlık ölçütü de üç kademede geçiyor ve **diplomasi zorlukla birlikte artıyor** —
baskı arttıkça anlaşma arayışı artıyor, istenen his bu.

### ⚠ ADIM 3/c — TAM FETİH TÜRKİYE'DE TUTTURULAMIYOR

En büyük imparatorluk kaçıncı turda hangi orana ulaşıyor (`veri/mod-esik-olcum.md`):

| Kapsam | Zorluk | Sınır | %25 | %50 | %75 | %100 |
|---|---|---|---|---|---|---|
| Türkiye | orta | 80 | 61 / 68 | — | — | — |
| Türkiye | zor | 80 | 26 / 50 | 56 / — | — | — |
| Karadeniz | orta | 30 | — / 26 | — | — | — |
| **Karadeniz** | **zor** | **30** | 9 / 6 | 16 / 15 | 23 / 20 | **29 / 25** |

**Bölge kapsamında üç mod da çalışıyor** (zor kademede tam fetih 25–29. turda, sınır 30).
**Türkiye kapsamında tam fetih 80 turda hiçbir aktör tarafından başarılamıyor**; %50 bile
yalnızca zor kademede ve 56. turda geliyor (Yarım Fetih sınırı 50).

Belge bunu §4/Soru 3'te öngörmüştü: *"181 parçanın tamamını almak hiçbir modda gerçekçi
değil."* Baki modu yine de istedi. Karar Baki'de — **eşikler onaylanmadan Adım 5'e
geçilmiyor** (belgenin kendi kuralı).

## Görev 09 / Adım 4–8 — Çerçeve, arayüz ve kapanış

561 test · kayıt sürümü 9 · paket 5.97 MB. Rapor: `docs/GOREV-09-RAPOR.md`.

### Tur sınırı yükseltildi ama tek başına çözmedi

Baki "tur sınırını yükseltelim" dedi. 250 turluk koşu **bunun da yetmediğini** gösterdi:

| Zorluk | tur 25 | tur 75 | tur 125 | tur 200 |
|---|---|---|---|---|
| orta | %11 · 6 muharebe | %26 · 3 | %28 · 0 | **%36 · 0** |
| zor | %23 · 17 muharebe | %56 · 4 | %69 · 0 | **%69 · 0** |

Dünya kilitleniyor: zor kademede 125. turdan sonra tek parça el değiştirmiyor.

Karar bunu gizlemiyor, **tanımlıyor**: sınır 80 → 150 (tavanın üstü, oyuncuya alan kalsın) ·
Yarım Fetih 50 → 70 (ölçüm %50'ye 56. turda ulaşıyordu, 50 eşiği kıl payı imkânsız
kılıyordu) · **`SURE_DOLUNCA: 'toprak'`** — süre dolunca en çok bölgeyi tutan kazanır.
Sonuncusu kritik: maçın bitmemesi bu görevin çözmeye geldiği sorunun ta kendisiydi.

Türkiye süreleri: Fetih 150 tur ≈ **1 sa 53 dk** · Yarım Fetih 70 tur ≈ 53 dk ·
Güç Yarışı 35 tur ≈ 26 dk. Bölgelerde 12–24 dk.

### Kazanma kontrolü tek yere taşındı

Görev 07'nin asgari kontrolü `oyunKancasi`'ndaydı (hiç parçan yok → yenildin, hepsi senin →
kazandın). Mod sistemiyle o kontrol **yanlış cevap vermeye başlardı**: Yarım Fetih'te
oyuncu %50'de kazanmış olmasına rağmen oyun devam eder, Güç Yarışı'nda hiç bitmezdi.
İkisi de sessiz hata — oyun çalışıyor görünür, sadece bitmez.

Kontrol `mod.js sonucKontrol`'e taşındı ve `turDongusu` onu TEK KEZ çağırıyor.
Sonuç cümlesi de orada: koşul moda göre değiştiği için cümle de değişiyor, ekranda kurmak
kazanma kuralını ikinci kez yazmak olurdu.

### Sürüm 9 nihayet Adım 5'te yükseldi

Adım 0'da kayıt biçimi değişmişti ama geriye dönük uyumlu yazıldığı için yükseltilmemişti.
Sürüm 8'i **gerçekten kıran** şey Adım 5'te geldi: `durum.mod`. Modu olmayan kayıtta
kazanma koşulu tanımsız kalır ve maç hiç bitmez.

### Üç yuva: özet ayrı anahtarda tutulmuyor

Ana menünün yuva listesi (mod, tur, ilerleme) kaydın KENDİSİNDEN okunuyor. İkinci bir
"özet" kaydı, iki kaydın ayrışabileceği ilk yer olurdu: menüde "tur 30" yazarken yüklenen
oyun tur 12'de olabilirdi. Bedeli üç kaydı okumak — yalnızca menü açılırken.

### Menü ↔ maç: §10/8'in "en olası sessiz hatası"

Oyun durumu **yalnızca iki yerde** kuruluyor: `macBaslat` ve `yuvayiYukle`. Üçüncü bir
kurulum yolu eklenirse menüyle harita arasında gidip gelirken sessizce yanlış maç yüklenir
— çökmez, yanlış olur. Kancada not düşüldü, testte kilitlendi.

### Harita jesti beşinci kez susturuldu

Diplomasi ekranı ve ana menü için `dokunmaKapali`'ya iki bayrak daha eklendi. React
Native'de üstteki kutu yerel katmandaki harita jestini engellemiyor; bu tuzağa Görev 05,
06 ve 08'de üç kez düşülmüştü.

## Arayüz revizyonu — ana menü baştan (2026-08-01)

Baki: *"Ana menüyü hiç sevmedim. Klasik mobil oyun ana menüleri gibi olsa bile daha iyi
olurmuş, bu onlardan da kötü."*

Haklıydı ve sebebi tek cümleyle söylenebilir: **ilk sürüm bir ayar penceresiydi, oyunun
kapağı değil.** Ekranın ortasında bir kutu, kutunun içinde ortalanmış düğmeler, üstünde
"NASIL KAZANILIR" diye bir başlık. Oyunun ilk kararını bir tercihe değil bir forma
çevirmişti.

### Ne değişti

| Önce | Sonra |
|---|---|
| Ortada kutu, ortalanmış düğmeler | **Sola yatık** düğmeler, kutu yok, tam ekran |
| Düz koyu arka plan | **Yüzen Türkiye haritası** (`MenuHaritasi.js`) |
| "NASIL KAZANILIR" başlığı + üç küçük etiket | **Üç büyük logo kartı** (`ModLogolari.js`) |
| Her şey tek ekranda | **Dört adım**: menü → mod → kurulum → il seçimi |
| Başlangıç ili sabit (kapsamın varsayılanı) | **Oyuncu haritadan seçiyor** (`IlSecimi.js`) |
| Durum çubuğu (saat, pil) açık | **Gizli** — gezinme çubuğu zaten gizliydi |

**"Yarım Fetih" → "%50 Hâkimiyet"** (Baki: *"yarım fetih kötü, %50'lik hâkimiyet kullan"*).
Yeni ad hem ne yapılacağını sayıyla söylüyor hem yarım kalmışlık çağrıştırmıyor.

### Üç logo neyi anlatıyor

Vektör, görsel dosyası yok (`Ikonlar.js`'in kuralı) — üçü de aynı viewBox'ta ve aynı çizgi
kalınlığında, yan yana durduklarında tek elden çıkmış görünsünler.

- **Fetih** → burca dikilmiş bayrak: "her karışı al"
- **%50 Hâkimiyet** → tam ortadan bölünmüş kalkan, yarısı dolu: "yarısı yeter"
- **Güç Yarışı** → yükselen üç basamak, tepesinde yıldız: "en büyük ol, süre dolsun"

### İl seçimi neden ayrı ekran

Sekiz görevdir oyuncu Bursa'ydı: başlangıç ili `varsayilanOyuncu`ydu ve seçilemiyordu.
Oysa **hangi ilden başladığın oyunun en belirleyici tercihi** — komşuların, arazin,
sanayin hepsi ondan geliyor.

Ekranda **jest yok** (yakınlaştırma/kaydırma): seçim tek dokunuş olmalı. `Harita.js`'in
jest katmanı gelseydi "ili seçeyim derken haritayı kaydırdım" hatası doğardı — o hata
projede iki kez yaşandı. Kapsam dışı iller **çiziliyor ama soluk** (§6/8): bölge maçında
oyuncu haritanın tamamını görüyor ve nerede oynadığını anlıyor.

### Tur çubuğu: iki katlı yerleşim

Baki: *"sağ üstteki diplomasi ve 'Fetih: 4/181 bölge' falan bunlar çok kötü duruyor."*

Sebep yapısaldı: ikisi de çubuğun İÇİNE konmuştu ve çubuk `flexDirection: 'row'`.
Hedef yazısı ile diplomasi düğmesi öteki bölmelerin arasına sıkışıp eziliyordu.

Şimdi **hedef çubuğun üstünde kendi şeridinde**, diplomasi ise **çubuğun kendi
bölmelerinden biri** (emir ve araştırma ile aynı kalıp). Hedef bir DURUM, düğme bir
EYLEM — ikisi aynı kutuda yaşamamalıydı.

Metin de sadeleşti: **mod adı artık hedef şeridinde tekrar etmiyor.** Oyuncu modu
kurulumda seçti; her tur "Fetih:" yazmak şeridi uzatıyor ve hiçbir şey söylemiyordu.
Kalan şey iki gerçek sayı: `4 / 181 BÖLGE · 145 TUR KALDI`.

### Yolda yakalanan iki tuzak

1. **`useRef(...).current` çizim sırasında okunuyordu** (`MenuHaritasi`). ESLint yakaladı;
   tembel `useState` ile değiştirildi — ikisi de değeri bir kez kuruyor.

2. **JavaScript Türkçe bilmiyor.** `'SIRADASIN'.toLowerCase()` **noktalı** `i` veriyor
   (`siradasin`), yani `'sırada'` araması tutmuyor. Bir test bu yüzden kaldı; metin zaten
   büyük harfle üretildiği için olduğu gibi aranıyor. **Türkçe metinde `toLowerCase()` ile
   arama yapmak güvenli değil** — projede bir daha karşılaşılırsa buraya bakılsın.

### Dil taraması

`IlPaneli.js`'te iki "parça" daha bulunup **"bölge"**ye çevrildi. Arazi anahtarı
(`daglik`) il seçim ekranında **"dağlık"** olarak yazılıyor. Sonuç cümleleri moda göre
ayrıldı ve düz cümleye çevrildi: *"Haritadaki bütün bölgeler senin oldu. Karşında duracak
kimse kalmadı."*

## Arayüz revizyonu — ikinci tur (2026-08-01)

Baki telefonda denedi, yedi madde geldi. Hepsi kapandı.

### 1. Durum çubuğu hâlâ açıktı — bileşen yetmiyormuş

`<StatusBar hidden />` bileşeni SDK 54'te Android'in **edge-to-edge** kipinde güvenilir
uygulanmıyor: uygulama zaten sistem çubuklarının altına uzanıyor ve bildirim temelli ayar
yutuluyor. Gezinme çubuğunda aynı sorun yaşanmış ve orada da zorla (imperative) çağrıya
geçilmişti — **kalıp aynıydı, ilk seferde uygulanmadı.**

`yonlendirme.js durumCubugunuGizle()` eklendi; `App.js` açılışta ve **her öne gelişte**
(`AppState`) çağırıyor, çünkü çubuk bildirim çekmecesi açılıp kapanınca geri geliyor.

### 2. Harita arka planda görünmüyordu — üç şey üst üste binmişti

Dolgu koyuydu (`cipZemin`), çizgi soluktu (`pirincKoyu`), opaklık 0.28'di **ve** menü
ekranın TAMAMINA `rgba(8,12,16,0.62)` perde çekiyordu. Dördü çarpılınca harita fiilen
siyahtı.

Dolgu ve çizgi parlatıldı (`zemin` + `pirinc`, kalınlık 0.9), opaklık 0.5'e çıktı ve
**perde yalnızca sol %56'ya alındı**: solda yazı okunuyor, sağda harita görünüyor.
Harita mod ekranında da aynı katmandan geliyor — ayrı bir çizim yok.

### 3. Ayarlar ikiye ayrıldı

Baki: *"Oyun içindeki ayarlar menüsü ile aynı yapmışsın, direkt dostum olmaz böyle."*

Ayrımın sınavı tek soru oldu: **maç yokken de anlamlı mı?**

| Genel Ayarlar (ana menü, ekranın ortasında) | Maç Ayarları (oyun içi, sağ üst) |
|---|---|
| Savaş gösterisi · titreşim · ses | Zorluk · kaydet · yükle · **ana menüye dön** |

Yeni dosya `GenelAyarlar.js`. `AyarMenusu.js`'ten gösterim/titreşim/ses bölümü çıktı;
"ANA MENÜ" satırı "yakında" olmaktan çıkıp gerçek düğme oldu.

### 4. "Nerede oynanacak" adımı kaldırıldı

Baki: *"Buna ne gerek var? Zaten map gelecek karşıma, oradan seçeceğim... zorluk da
mapten seçerken ayarlansın, sağ alta bir yere koy."*

Akış **dörtten üçe** indi: `menü → mod → il seçimi → oyna`. Zorluk il seçim ekranının
sağ altında. Bölge kapsamları **silinmedi** — motor, ölçüm betikleri ve testler onları
kullanmaya devam ediyor; yalnızca kurulum akışından çıktılar ve maçlar Türkiye
kapsamında kuruluyor.

### 5. İl seçiminde tıklama çalışmıyordu — iki sebep

1. **Harita küçüktü.** 1000×452 birimlik harita telefonda 340 piksele sığdırılıyordu;
   Yalova, Kilis, Bartın gibi iller ekranda birkaç pikseldi.
2. **SVG yol isabeti ince.** `<Path onPress>` dolgunun TAM sınırına bakıyor; sınıra yakın
   her dokunuş boşa gidiyordu.

Çözüm ikisini birden kaldırıyor: harita **ekranı dolduruyor** ve dokunma **SVG'ye değil
kapsayıcı görünüme** bağlı. Dokunulan nokta harita birimine çevriliyor, kapsam içindeki
**en yakın il etiketi** seçiliyor. Yani her dokunuş mutlaka bir il seçiyor — "hiçbir şey
olmadı" durumu tanım gereği yok. Etiket noktaları illerin iç merkezleri (`polylabel`),
o yüzden en yakın etiket pratikte dokunulan ilin kendisi.

### 6. İç içe geçme riski

Baki uyardı: *"bu iç içe geçmeye sebep olmamalı."* İl ekranı menünün içine gömülmüyor,
erken dönüşle **kendi tam ekranını** çiziyor. Sebep somut: il ekranının kendisi bir
harita; arkasında ikinci bir yüzen harita olsaydı ikisi üst üste biner ve hangisine
dokunulduğu anlaşılmazdı.

### 7. Süre ifadeleri ekrandan kalktı

Baki: *"maç yaklaşık 1 saat 53 dk sürer gibi bizim kararlaştırmada kullandığımız
ifadelere yer verme. Oyuncuya verilecek şey var, verilmeyecek gereksiz şey var."*

`sureMetni` tamamen silindi. `DENGE.MOD.SANIYE_PER_TUR` hâlâ tur sınırlarını hesaplıyor
ama **ekrana çıkmıyor** — o sayı bizim denge kararımızdı, oyuncunun kararı değil. Mod
kartlarının altında kalan tek cümle hedefin kendisi: *"181 bölgenin 181 tanesi senin
olacak."*

## Arayüz revizyonu — üçüncü tur (2026-08-01)

### Durum çubuğu: sorun API'de değil SIRADAYDI

İki deneme tutmamıştı: `<StatusBar hidden />` bileşeni, sonra zorla
`StatusBar.setHidden(true)`. Üçüncüde sebep bulundu ve **API değil sıraydı.**

`gezinmeCubugunuGizle()` bir SÖZ döndürüyor; içindeki `NavigationBar.setVisibilityAsync`
sistem çubuğu denetleyicisini (WindowInsetsController) yeniden kuruyor. Durum çubuğunu
ondan **önce** gizlediğimiz için, sonradan tamamlanan gezinme çağrısı denetleyiciyi
tazeleyip durum çubuğunu geri getiriyordu.

Yeni `tamEkranaGec()`: önce gezinme çubuğu **beklenerek** gizleniyor, sonra durum çubuğu,
ardından **0.4 sn ve 1.5 sn sonra iki kez daha** uygulanıyor — bazı cihazlarda yerleşim
oturduktan sonra çubuk bir kez geri geliyor ve tek atışlık çağrı o yarışı kaybediyor.
`setTranslucent` kaldırıldı: edge-to-edge kipinde işe yaramıyor, denetleyiciyi bir kez
daha kurcalıyordu.

### Menü perdesi kalktı, yerini yazı gölgesi aldı

Baki: *"soldaki butonların olduğu bölmeye siyah bir arka plan falan yapmışsın, ekranın
yarısına kadar o engelliyor."*

Perde okunabilirliği çözerken haritanın yarısını yiyordu. Artık okunabilirlik **perdeyle
değil yazıyla**: her başlık ve düğme metninin altında koyu gölge var. Gölge yalnızca
harfin arkasını karartıyor — kaplanan alan harfin kendisi kadar. Yalnızca yuva satırları
yarı saydam zemin tutuyor, çünkü onlar çok bilgi taşıyor ve gölge yetmiyor.

Yerleşim de ekrana **oranlı** oldu (`width * 0.06`, `height * 0.13`): sabit piksel küçük
telefonda taşıyor, büyük ekranda köşede sıkışık duruyordu.

### Harita hareketi hızlandı

Süreler yarıya indi (21/27/24 sn → 11/14/12.5 sn), genlik iki katına çıktı. Üçü hâlâ
farklı: aynı olsalardı hareket her N saniyede aynı kareye döner ve döngü fark edilirdi.

### İl seçimi neden taşıyordu

Şeritlere **sabit yükseklik** verilmişti (44/64 px) ve harita kalan alana sığdırılıyordu.
Küçük telefonda alt şerit 64 pikselden büyük çıkıyor, fark ekranın dışına taşıyordu —
üstelik taşan kısım tam da BAŞLA düğmesiydi.

Şimdi tersi: şeritler içeriklerine göre yer kaplıyor, harita **artan** alanı alıyor.
Bilgi kısmı büzülebiliyor (`flex: 1, minWidth: 0`), sağdaki düğme büzülemiyor
(`flexShrink: 0`) — yer daralınca il adı kısalıyor, düğme asla kesilmiyor.

### Hedef şeridi kalktı, sayı çubuğun içine girdi

Baki: *"3/181 bölge 150 tur kaldı kısmını kaldıralım, küçük bir şekilde kaç parçadan kaçı
bizde onu görebilelim; o tur bölmesinin olduğu yer çok büyümesin fakat okunaklılık
sınırında da kalsın."*

Ayrı şerit silindi. Sayı, çubukta **zaten var olan** toprak satırına taşındı; eklenen tek
şey eşik ve kalan tur: `3/181 bölge · 150 tur`. Sahip olunan sayı pirinç renginde vurgulu,
gerisi soluk — göz önce "kaçım var"a düşüyor. **Çubuk bir satır bile büyümedi.**

### Diplomasi ekranı: liste değil, masa

Baki: *"Direkt anlaşma yapa basıyon, onlar da reddediyor falan; olmamış. Konuştuğumuz her
şeyi ekle güzelce."*

İlk sürüm bir liste + bir düğmeydi. Diplomasinin tamamı motorda çalışıyordu — ortak
düşman, cephe yükü, husumet, zincir, ihanet bedeli, kabul hesabı — ama **ekranda hiçbiri
görünmüyordu.** Oyuncu kör bir düğmeye basıp "reddetti" cevabı alıyordu.

Artık her satırda:

| Ne | Nereden geliyor |
|---|---|
| **Tutum** ("kabule açık" / "şu an sıcak bakmıyor") | `teklifKabulMu` — zekânın KENDİ hesabı |
| Ortak düşmanlar, adlarıyla | `dusmanlar` kesişimi |
| Kaç cephede savaşıyor | `dusmanlar().length` |
| Müttefikleri, adlarıyla | `muttefikler` |
| "Müttefikiyle savaştasın — ona saldırırsan bu da karşına çıkar" | zincir kuralının görünen yüzü |
| Husumet ve süren düello uyarısı | `husumetBul`, `duelloBul` |
| Bozmanın bedeli, **bozmadan önce** | `DENGE.DIPLOMASI.IHANET_SURESI` |
| Karşı tarafın boyu, oyuncuya göre ("senden büyük") | parça oranı |

**Hiçbir kural ekranda değil:** "kabul eder mi" sorusunun cevabı zekânın fonksiyonundan,
düğmenin etkinliği `teklifGecerliMi`'den, ret sebebi de oradan geliyor. Ekran çiziyor.

## Arayüz revizyonu — dördüncü tur (2026-08-01)

### Tam ekran: asıl hata gizleme değil, YERLEŞİMDİ

Üç turdur sistem çubuklarını gizlemeye çalışıyorduk. Baki dördüncüde sonucu gösterdi:
*"Tam ekrana yine geçmedi, geçmediği için de haritada seçim sırasında geri düğmesine
basamıyorum ve gezinme çubuğu 'nereden başlıyorsun' yazısını kaplıyor."*

İkinci cümle asıl hatayı söylüyor: **ekranlar `useSafeAreaInsets`'i hiç sormuyordu.**
Yani çubuklar gizlense de gizlenmese de yerleşim aynıydı; gizlenemediği anda GERİ düğmesi
durum çubuğunun, başlık gezinme çubuğunun altında kalıyordu.

Yeni kural: **gizlemeye çalış, ama gizlenmemiş gibi yerleş.** Gizlenirse insets zaten
sıfırlanır ve ekran kendiliğinden büyür; gizlenmezse hiçbir şey kapanmaz. Tek yerleşim
iki dünyada da doğru. `IlSecimi` ve `AnaMenu` artık insets okuyor, köşelere ayrıca pay
veriyor (Baki'nin "başla düğmesinin küçük bir kısmı sığmıyor" dediği yer).

**Expo Go'da neden gizlenmiyor:** Expo Go kendi Android etkinliğini çalıştırıyor ve o
etkinlik edge-to-edge kipinde açılıyor; uygulamanın gizleme isteği ana bilgisayarın
ayarını her zaman yenemiyor. Gerçek derlemede `app.json`'a eklenen
`android.edgeToEdgeEnabled: false` devreye giriyor ve çubuklar kapanıyor. **Bu bir kod
hatası değil, barındırma farkı** — ve artık ikisinde de ekran doğru görünüyor.

### İl seçimine yakınlaştırma

Baki: *"Yalova falan fazla küçük, yakınlaştırabilme gelsin."*

Dört kademe (1× · 1.8× · 3× · 4.5×), düğmeyle. **Çimdik jesti bilerek yok:** aynı
responder'ı ikinci parmakla paylaşmak seçim eşiğiyle çakışıyor; düğme her cihazda aynı
çalışıyor.

Yakınlaştırma ve kaydırma **tek jestten** ayrılıyor: parmak `DENGE.JEST.KAYDIRMA_ESIGI`
kadar kaydıysa KAYDIRMA, azsa SEÇİM. `Harita.js`'in jest katmanı buraya getirilseydi
"ili seçeyim derken haritayı kaydırdım" hatası geri gelirdi — o hata projede iki kez
yaşandı.

İki incelik: seçim hesabı kaydırma ve yakınlaştırmayı **hesaba katıyor** (yoksa
yakınlaştırdıktan sonra yanlış il seçilir, sessiz ve can sıkıcı bir hata) ve çizgi
kalınlığı yakınlaştırmayla **inceliyor** (sabit kalsaydı 4.5×'te sınırlar kalınlaşıp
küçük illeri yutardı).

### Menü tireleri

18×2 → 10×1.5 (Baki: *"tire'ler biraz büyük"*). İşaret yazının yanında bir vurgu olmalı,
yazıyla yarışan bir çizgi değil.

## Arayüz revizyonu — beşinci tur (2026-08-01)

Baki: *"Yakınlaştırma kısmı çok kötü olmuş, normal oyundaki gibi yapamıyor muyuz? Ayrıca
değişen hiçbir şey yok dostum, bocalamaya başladın."*

Uyarı yerindeydi. İki hatanın da kökü aynı: **elimde çalışan bir çözüm varken yenisini
yazmaya kalkmışım.**

### 1. Yakınlaştırma: oyunun kendi jesti kullanılmalıydı

Dördüncü turda +/− düğmeleriyle kademeli yakınlaştırma yazdım ve gerekçem "çimdik jesti
kendi dokunma denetleyicimle çakışır" idi. Yanlış gerekçe: `Harita.js` o çakışmayı bir yıl
önce çözmüş, kodu orada duruyordu.

Artık `Harita.js` ile **birebir aynı** parçalar kullanılıyor:
`Gesture.Simultaneous(pan, pinch, tap)` · aynı reanimated paylaşılan değerleri · aynı
eşikler (`DENGE.JEST`) · aynı kaydırma sınırı (`kaydirmaSiniri`) · **aynı dönüşüm dosyası**
(`haritaDonusum.js`). Ekran pikselini harita birimine çeviren satır tek yerde; iki harita
da oradan besleniyor, kopyalanan hesap yok.

Eşik telafisi ve "canlı odak takibi yok" incelikleri de aynen taşındı — ikisi de
`Harita.js`'te Baki'nin geri bildirimiyle çözülmüş sorunlardı (kaydırma başında zıplama,
çimdik bırakınca kayma). Yeniden yazsaydım ikisini de yeniden yaşardık.

### 2. "Değişen hiçbir şey yok": pay eklendi ama pay SIFIRDI

Üçüncü turda `useSafeAreaInsets` eklenmişti ve mantık doğruydu — ama Expo Go'da insets
büyük olasılıkla **0 geliyor**. Yani kod "güvenli alan kadar boşluk bırak" diyordu, güvenli
alan sıfırdı, ekran hiç değişmedi.

Düzeltme: Android'de **TABAN değer** var (`Math.max(insets.top, 26)`). Sistem ne söylerse
söylesin GERİ düğmesi ve başlık çubukların altında kalmıyor. Insets doğru gelirse zaten
büyük olan kazanıyor; gelmezse taban tutuyor.

**Ders:** platformdan gelen bir ölçüye tek başına güvenmek, o ölçü 0 geldiğinde sessizce
hiçbir şey yapmamak demek. Ölçü + taban birlikte kullanılmalı.

## Arayüz revizyonu — altıncı tur (2026-08-01, ekran görüntüsü üzerinden)

Baki ekran görüntüsü gönderdi: *"neleri yanlış görüyorsun onları düzelt, il seçme ekranı
da bok gibi olmuş."* Görüntüde üç kusur vardı, üçünün de kökü **ölçü**ydü.

### 1. Menü listesi ekrana sığmıyordu

Görüntüde "İL SAVAŞI" saatin altında kalmış, "HARİTAYA DÖN" alttan taşmıştı.
`justifyContent: 'center'` taşan içeriği **iki uçtan birden** kırpar — belirti tam olarak
buydu.

Hesap: yatay telefonda kullanılabilir yükseklik ~320 dp. Eski ölçülerle başlık 46 dp +
beş düğme × 44 dp + boşluklar ≈ 340 dp. 20 dp taşıyordu.

Ölçüler artık **ekran yüksekliğinden değil, KULLANILABİLİR yükseklikten** türetiliyor ve
**düğme sayısına bölünüyor**: `satirYuksekligi = (kullanilabilir − başlık payı) / düğme
sayısı`. Liste kaç düğme olursa olsun sığmak zorunda; sabit sayı yok, taşacak fark da yok.

### 2. Arka plandaki harita Türkiye'ye benzemiyordu

`Math.max(...) * 1.25` ile çiziliyordu, yani ekranı doldurmak için ülkenin ortasından bir
parça gösteriliyordu — silueti okunmuyordu.

`Math.min(...) * 1.06` oldu: ülkenin tamamı görünüyor. Şanslıyız, harita 1000×452 (en/boy
**2.21**) ve yatay telefon ekranı buna çok yakın — sığdırmak neredeyse tamamen dolduruyor,
kenarda boşluk kalmıyor. Yüzme genliği de sığdırma payının içine çekildi (38 → 14 px),
yoksa hareket kenarları açardı.

### 3. İl seçimi: şeritler haritanın yerini yiyordu

Ölçtüm: üst + alt şerit ~110 dp, kalan ~210 dp. 1000×452'lik harita oraya sığdırılınca
ölçek **0.21**'e düşüyor, harita 210×95 dp'lik bir pula dönüşüyor ve ekranın iki yanı
bomboş kalıyordu. "Bok gibi" tarifi fazlasıyla yerindeydi.

Yerleşim tersine çevrildi: **şeritler haritadan yer çalmıyor, üstünde yüzüyor.** Harita
`absoluteFill` ile ekranın tamamını alıyor; başlık üstte, bilgi ve düğmeler altta, hepsi
yarı saydam zeminli birer katman.

İki incelik: katmanlar `pointerEvents="box-none"` — boş yerleri dokunmayı **geçiriyor**,
yani başlığın yanından haritayı kaydırmaya devam edebiliyorsun; yalnızca düğmeler dokunma
alıyor. Ve başlık kutu yerine **gölge** kullanıyor, çünkü kutu haritayı kapatırdı.

**Ortak ders:** üç kusur da "ekranda ne kadar yer var" sorusunu sormadan sabit sayı
yazmaktan çıktı. Yatay telefonda dikey alan çok kıt ve tahmine yer yok.

## Arayüz revizyonu — yedinci tur (2026-08-01)

### İl seçimi YANLIŞ İL seçiyordu — Baki sebebini kendi buldu

Baki: *"Vana dokunuyorum soldaki ili seçiyor. Merkezi falan mı var illerin, ona göre mi
seçiyor?"* — **Tam olarak öyleydi ve hatalıydı.**

Seçim, dokunulan noktaya EN YAKIN İL ETİKETİNİ buluyordu. Etiket, ilin iç merkezi
(`polylabel`). Küçük ve düzgün illerde iş görüyor ama büyük, uzun ya da girintili bir ilin
kenarına dokunduğunda komşunun merkezi daha yakın kalıyor ve yanlış il seçiliyordu.

Bu yaklaşımı üçüncü turda "SVG `<Path onPress>` küçük illerde tutmuyor" diye seçmiştim.
Doğru teşhis, yanlış ilaç: `Harita.js` bu işi bir görevdir **poligon içi testiyle**
yapıyor ve o kod orada duruyordu.

Artık aynı test: yol dizgisi `M`/`L` ile halkalara ayrılıyor, sınır kutusuyla eleniyor,
sonra ray-casting. **Doğrulandı: 81 ilin etiket noktasının 81'i kendi poligonunun içinde
çıkıyor** (`yanlış: 0`).

En yakın etiket **yedek** olarak duruyor ama artık dar bir yarıçapla (22 harita birimi):
denize ya da iki ilin arasındaki saç teline dokunulduysa yakındaki il seçiliyor, uzağa
dokunulduysa hiçbir şey seçilmiyor — yanlış il seçmektense seçmemek iyidir.

### Menü hâlâ taşıyordu: hesap tahmine dayanıyormuş

Altıncı turda ölçüler kullanılabilir yükseklikten türetilmişti ama **yetmedi**, çünkü
hesap yazının gerçek satır yüksekliğini bilmiyordu: `fontSize` verilip `lineHeight`
verilmeyince satır yüksekliğini yazı tipi belirliyor ve toplam, hesaplanandan birkaç
piksel büyük çıkıyor. Yatay telefonda o birkaç piksel taşma demek.

İki düzeltme:
1. **`lineHeight` açıkça yazılıyor** — başlıkta da düğmelerde de alt yazıda da. Bir
   düğmenin kapladığı yer artık tam olarak `lineHeight + 2 × pay`, tahmin yok.
2. **%88 güvenlik payı** — kalan alanın tamamı doldurulmuyor.

Aritmetik beş ekran yüksekliğinde sınandı (300/324/360/412/480 dp): hepsinde sığıyor,
en dar ekranda bile 19 dp pay kalıyor.

**Ders:** yerleşimi piksel piksel hesaplayacaksan, hesabın girdilerini de sen vermelisin.
`fontSize` yazıp `lineHeight`i yazı tipine bırakmak, hesabı tahmine çevirir.

---

## GÖREV 10A — GÖRÜNTÜ KİMLİĞİ, Adım 0–2 (2026-08-02)

Üçü de **görünür değişiklik içermeyen** hazırlık adımları. Oyun bu üç adımdan sonra
birebir aynı görünüyor; asıl görünen iş Adım 3'te başlıyor.

### Adım 0 — `CLAUDE.md` (proje anayasası)

Kök dizine 91 satırlık kural dosyası. Günlük değil kural: komutlar · klasör haritası ·
katman sınırı · hangi sayı nerede yaşar · yasaklar · bilinen tuzaklar · çalışma düzeni.
Bu dosya (`URETIM-NOTU.md`) günlük olarak kalıyor; `CLAUDE.md` onun yerine geçmiyor.

### Adım 1 — `tema.js` jeton tablosu

Baki'nin dört kararı: vurgu **sönük kiremit** · panel zemini **denizin bir tık açığı** ·
menü zemini **düz kâğıt + küçük mühür** · ölçüt dili **5 nokta**.

Hiçbir zemin rengi sıfırdan icat edilmedi — hepsi haritanın kendi denizinden
(`askeriTon(RENK.deniz)` = `#b2bdc4`) türetildi. Aynı renk ailesi, sadece açıklık farkı:

| Katman | Renk | Göreli parlaklık |
|---|---|---|
| harita (mevcut) | `#b2bdc4` | 0.4985 |
| kâğıt-koyu (kart içi) | `#bdc6cd` | 0.5561 |
| mühür (menü zemini) | `#c5cdd3` | 0.6024 |
| kâğıt (panel) | `#ced5da` | 0.6577 |

Panel haritadan **açık** olduğu için "üstüne konmuş kâğıt", kart içi kâğıttan **koyu**
olduğu için "çukur" gibi duruyor. Merdiven bozulursa derinlik kaybolur.

Yazı renkleri kâğıt üstünde **ölçüldü** (WCAG 2.1, tahmin değil):
birincil 10.6:1 · ikincil 6.1:1 · soluk 3.7:1. Vurgu `#9c4634` beyaz yazıyla 5.6:1.
Eski `#c0492f`in doygunluğu 0.61→0.45, açıklığı 0.47→0.40 çekilmiş hâli — aynı ton.

Punto ölçeği iki **hazır** nesne olarak duruyor (`PUNTO_TELEFON` / `PUNTO_TABLET`),
her çağrıda yenisi üretilmiyor: `React.memo`'lu bileşene giden nesnenin kimliği sabit olmalı.

### Adım 2 — Çıplak renk avı

Bileşenlerdeki **83 çıplak renk** `tema.js`'e taşındı, 21 dosya. `npm run kontrol`'e
dördüncü bölüm eklendi (`scripts/renk-denetim.js`): **çıplak renk sayısı = 0**, aksi
hâlde kontrol kırmızı yanıyor.

**Kanıt gözle değil değer karşılaştırmasıyla verildi:** 32 eşlemenin 32'si birebir aynı
renk (`scratchpad/deger-es-mi.mjs`). Eşitse görüntü değişemez. Kalan iki değişiklik
(`Ikonlar.js` ve `ModLogolari.js`'in öntanımlı renkleri) **ölü koda** ait — 8 çizim
yerinin 8'i de rengi kendisi veriyor, öntanımlı hiç okunmuyor.

**Renkler tek yere toplanınca üç kusur ortaya çıktı** (Görev 10A'nın yedi kusuruna ek):

1. **Perde sekiz koyulukta.** Arka karartma 0.62 / 0.68 / 0.72 / 0.78 / 0.82 / 0.86 /
   0.90 / 0.95 — aynı iş, sekiz sayı.
2. **Pirinç tülü beş yoğunlukta.** "Seçili" hissi beş ekranda beş farklı güçte:
   0.06 / 0.12 / 0.14 / 0.16 / 0.22. Oyuncu aynı şeyin aynı göründüğünü göremiyor.
3. **Aynı koyu-yeşil iki dosyada ayrı yazılmış.** `#3f7f4f` zaten `RENK.okTakviye`
   olarak vardı; `EmirListesi.js` ve `TurRaporu.js` onu bilmeden yeniden yazmış.
   Bu üçüncüsü Adım 2'de kapandı, ilk ikisi Adım 3–6'da teke inecek.

Üçü de tek başına bakınca görünmeyen, ancak envanter çıkarılınca fark edilen kusurlar —
adımın asıl getirisi bu oldu.

### Adım 3 — Panel kâğıda geçti (damga `y2`)

İlk **görünür** adım. Dosya: `src/bilesenler/IlPaneli.js` (+ `denge.js` damgası).

Panel koyu slate bir kutuydu (`#262d33`); artık haritanın kendi denizinden türetilmiş
kâğıt (`ZEMIN.kagit` `#ced5da`). Haritadan bir tık **açık** olduğu için "haritanın üstüne
konmuş kâğıt" gibi duruyor. Gölge kaldı ama 0.35'ten 0.18'e indi — koyu panelde gereken
gölge, açık kâğıtta kir gibi görünüyordu.

**Sol şerit yerleşimi ve genişlik ölçüleri (%25 / 190–300 dp) DEĞİŞMEDİ.** Görev 04'te
ölçülmüştü; bu adımda değişen yalnızca panelin hangi dünyaya ait olduğu.

#### Kutu içinde kutu kalktı

Beş dolgulu kutu (`orduKutu`, `emirKutu`, `kazanc`, çip, geliştirici) panelin içinde
ikinci bir kutu dünyası kuruyordu. Hepsi **üstünde ince çizgi olan bölüme** (`s.bolum`)
ya da **hizalı veri satırına** (`s.kv`) indi. Dolgu ve çerçeve kâğıt üstünde gürültü;
hizanın kendisi yetiyor.

#### Renkle vurgu kalktı

Pirinç başlıklar (bölüm başlığı, ordu başlığı, emir başlığı, "(sen)", ASKER BAS) gitti.
Hiyerarşi artık **punto, kalınlık ve harf arasıyla** kuruluyor. Vurgu rengi panelde
**tek yerde**: SALDIR düğmesi. İki yer daha kırmızıydı, ikisi de düzeltildi:

- **SAVUNMA değeri** kırmızıydı → normal değer. Savunma bir tehlike değil, bir ölçüt.
- **Geliştirici kutusu** kırmızı kesikliydi → soluk kesikli. Bir test aracı oyunun en
  güçlü rengini taşıyamaz; "bu geçici" demeyi kesikli çizgi zaten yapıyor.

Kayıp/yaralı sayıları vurguyla **aynı rengi** kullanıyor ama `DURUM.eksi` adıyla: vurgu
"saldır" der, eksi "kaybettin" der. Jeton tablosunda ikisi ayrı adla duruyor.

#### Köşe kuralı uygulandı

Kutu 0, düğme 4. Panelin kendisi, bölümler ve gösterge çentikleri keskin; SALDIR,
ASKER TAŞI, ASKER BAS, TOPARLAN, komşu çipleri ve × düğmesi 4. Renk noktası da kare
oldu — haritacılıkta lejant işareti karedir ve o bir düğme değil.

#### İki gösterge rengi ölçüyle düzeltildi

İlk yazımda boş nokta `○` ayraç rengindeydi: kâğıt üstünde **1.33:1**, yani halka
neredeyse görünmüyor ve "üçte beş" okunamıyordu. `soluk`a çekildi (**3.7:1**) — dolu
noktadan açıkça ayrı ama sayılabilir. Çubuk yolağı `CIZGI.ince`e alındı (1.8:1); o
bir yazı değil zemin şeridi, orada 1.8 yeterli.

#### Kapsam dışı bırakılanlar (bilerek)

- "GETİRİSİ" ve "BURAYI ALIRSAN" **hâlâ ikisi birden** çıkıyor → Adım 4.
- Gösterge **hâlâ 10 çentik** → Adım 5'te 5 noktaya inecek.
- × düğmesinin başlığa binmesi → Adım 7.
- Punto değerleri **hiç değiştirilmedi**: bu adımın işi dünya değişimi, ölçü değil.

Doğrulama: stil tablosunun 60 anahtarının hepsi hem tanımlı hem kullanılıyor (ESLint
tanımsız stil anahtarını yakalamaz, sessizce boş geçer — elle tarandı). `npm run kontrol`
beş bölümde de temiz, 561 test geçiyor, Metro paketi 1329 modülle hatasız kuruldu.

### Baki'nin Adım 3 geri bildirimi — kâğıt tonu ve köşe (2026-08-02)

> *"Panel açık kâğıda dönmüş kötü durmuyor ama daha koyu veya tonlu bir renk olabilir…
> menünün köşelerini çok az yumuşat, çok küçük radüs ekle."*

İkisi de jetona işlendi, yani tek dosyadan tüm oyuna yayıldı:

- **Kâğıt koyulaştı:** göreli parlaklık 0.658 → 0.587, doygunluk 0.14 → 0.11. Yeni renk
  ailesi icat edilmedi (belge §0 bunu kilitliyor) — hâlâ haritanın denizinin tonu.
- **Köşe 0 → 2 (kutu), 4 → 5 (düğme).**

**Koyulaşmanın iki yan etkisi ölçülüp düzeltildi.** Zemin koyulaşınca üstündeki her şeyin
kontrastı düşer; gözle bakılsa fark edilmezdi:

| Jeton | Eski kâğıtta | Yeni kâğıtta (düzeltmeden önce) | Düzeltildi |
|---|---|---|---|
| `YAZI_RENK.soluk` | 3.7:1 | 3.33:1 | `#5e6b76` → `#55616b` (3.9:1) |
| `CIZGI.ayrac` | 1.79:1 | 1.21:1 | `#b0bac2` → `#8d99a2` (1.8:1) |
| `CIZGI.ince` | 2.22:1 | 1.64:1 | `#93a0aa` → `#7c8892` (2.2:1) |

Ayraçlar kritikti: Adım 3'te kutular kalktığı için bilgiyi gruplayan **tek şey** o
çizgiler. 1.21:1'de görünmez olurlar ve panel yazı yığınına dönerdi.

---

### Adım 4 — Tekrarlar ve söz kısaltma (damga `y3`)

Dört tekrar kapandı:

1. **Panelde getiri iki kez yazıyordu.** "GETİRİSİ +4/+3" ve kutu içinde "BURAYI ALIRSAN
   +4/+3" — ikisi de aynı `parcaGelir`den. Tek satır kaldı, yalnızca ETİKET sahipliğe
   göre değişiyor (S4).
2. **"4 piyade" + "4 × Piyade".** `ordu.dokum` satırı kaldırıldı; alttaki satırlar aynı
   sayıyı zaten söylüyor ve üstüne zırh/dayanıklılık/yaralı da veriyor. `orduDokumu()`
   duruyor — emir listesi gibi satırların olmadığı yerlerde hâlâ tek doğru özet o.
3. **Saldırı emrinde arazi iki kez.** Hedef kutusundaki cümle ile moral maddesi aynı şeyi
   söylüyordu. Madde kaldırıldı; üstelik o madde yalnız dağlıkta çıktığı için dengesizlik
   de yapıyordu (düzlük ve tepelik hiç görünmüyordu).
4. **Alt not her açılışta.** "Emirler tur bitince çözülür…" artık bir kez gösterilip
   kapanıyor. Karar ekranda değil `oyun/ayarlar.js`'te (`emirIpucu`) — cihaz tercihi
   olduğu için yeni maçta geri gelmiyor. Değer açılışta donduruluyor, yoksa not oyuncu
   okumaya fırsat bulamadan kaybolurdu.

**Diplomasi satırı yeniden kuruldu.** Sekiz satırlık blok üç satıra indi: **ad · durum ·
büyüklük · tek gerekçe.** Altı madde birden listelenebiliyordu; üç devlete bakan oyuncu
24 satır okuyup hiçbirini okumuyordu. Artık öncelik sırası var ("kararı en çok ne
değiştirir") ve yalnızca birincisi yazılıyor. 🤝/⚔/◇ işaretleri kalktı — üç ayrı çizim
dilindendiler ve hiçbiri kelimenin söylemediğini söylemiyordu. Bölge SAYISI da kalktı:
"12 bölge" tek başına iyi mi kötü mü belli değil, kararı veren "senden büyük".

"Hiç savaşı yok; anlaşmaya ihtiyaç duymuyor" maddesi listeden tamamen çıktı — düğmenin
yanındaki "şu an sıcak bakmıyor" ile birebir aynı bilgiydi.

---

### Adım 5 — Tek ölçüt dili (damga `y4`)

Panelde üç ayrı derecelendirme dili yan yana duruyordu: 10 kareli çubuk (il statları),
5 noktalı sıra (bölge değeri), kelime ("Orta" savunma). Üçü de "bu ne kadar?" sorusunu
cevaplıyordu ama oyuncu her seferinde ölçeği yeniden öğreniyordu.

Baki'nin kararı **5 nokta**. Yeni dosya `src/bilesenler/Olcut.js` — ölçüt gösteren her yer
oradan çağırıyor; ikinci bir biçim doğarsa üçüncü dil de doğar.

- Boş nokta **dolgusuz halka**: dolu olanla farkı renk değil BİÇİM. Yalnız renk farkı
  olsaydı koyulaşan kâğıtta sayılamazdı.
- İl statları 0–10 → 0–5'e iniyor ama **kesin sayı kaybolmuyor**: noktaların yanında
  rakam duruyor. Nokta "ne kadar", rakam "tam olarak ne kadar" diyor.
- Savunma kelimesi de ölçüte döndü (`ARAZI_SAVUNMA_OLCUT`, sunum eşlemesi — muharebeye
  giren çarpan `DENGE.ARAZI`de ve ona dokunulmadı).

---

### Adım 6 — Bütün oyun tek zemin dünyasına geçti (damga `y5`)

Adım 3 yalnızca paneli taşımıştı. Kalan **21 dosya** hâlâ koyu dünyadaydı; yarısı kâğıt
yarısı koyu bir oyun başladığımızdan kötü olurdu.

**Özellik-duyarlı süpürme.** Aynı jetonun rolü nereye yazıldığına göre değişiyor:
`PANEL.pirinc` bir yerde yazı, başka yerde çerçeve, başka yerde dolgu. Hepsini tek
karşılığa çevirmek dolguları simsiyah yapardı. Eşleme `(özellik, jeton)` çiftine bakıyor:
`color: PANEL.pirinc` → mürekkep, `borderColor: PANEL.pirinc` → ince çizgi,
`backgroundColor: PANEL.pirinc` → elle karar (11 yer). Toplam **~300 çağrı yeri**.

Süpürmenin iki tuzağı vardı, ikisi de yakalandı:

1. **Koyu dolgulu düğmelerin yazısı da koyuya dönüyordu** — TURU BİTİR, ASKER BAS, TAMAM,
   DEVAM görünmez olurdu. Dördü de açık yazıya (`PANEL.vurguUstu`) çevrildi.
2. **Yazı gölgesi silme deseni üç yerde nesneyi yarıda kesti** (`textShadowOffset:
   { width: 0, height: 1 }` → `height: 1 },` kalıntısı). ESLint ayrıştırma hatası olarak
   yakaladı; üçü de onarıldı.

**Beş ayrı "seçili" yoğunluğu teke indi.** Envanter bulgusu 2 kapandı: `PIRINC_TUL`'ün
0.06/0.12/0.14/0.16/0.22 tonlarının hepsi `ZEMIN.kagitKoyu`ya indi — seçililik artık her
ekranda birebir aynı görünüyor.

**Menü harita duvar kâğıdı → mühür (S3).** Ekranı baştan başa kaplayan harita, ekranın
yarısı kadar, sağa yaslı, **dolgusuz** bir kontura indi (opaklık 0.5 → 0.22). Yazılar sol
kolonda olduğu için artık hiçbir harfin arkasına girmiyor — eski duvar kâğıdının asıl
kusuru buydu. Menü yazı gölgeleri de kalktı: gölgenin sebebi koyu zemindi.

**Mod kartlarındaki öksüz cümle kartın içine girdi.** "181 bölgenin 181 tanesi senin
olacak." kartların altında tek başına duruyordu. Artık her kart kendi hedefini kendi
söylüyor. Seçili karta özel yazılmadı — o zaman kartlar farklı yükseklikte olur ve seçim
değiştikçe satır zıplardı.

---

### Adım 7 — Üç yerleşim hatası (damga `y6`)

**1. Panelde × düğmesi başlığa biniyordu, kaydırınca başlık kayboluyordu.** İkisi de aynı
köşedeydi ve biri `absolute`'du. Başlık kaydırmanın DIŞINA çıktı; × ile başlık artık aynı
satırı paylaşıyor, yani binmeleri imkânsız. Kaydırırken başlık da yerinde kalıyor.

**2. Ana menüde "Kayıtlı maçın yok" DEVAM ET ile çakışıyordu.** Sebep hesaptaydı: yerleşim
aritmetiği her düğmeyi `lineHeight + 2 × pay` sayıyor, ama alt satırı olan düğme 13 px
daha uzundu ve bu fazlalık hesaba hiç girmiyordu. Liste alanı aşınca
`justifyContent: 'center'` taşmayı iki uçtan birden kırpıyor. Alt yazı silinmedi (sebep
yazılmalı) — etiketin YANINA, aynı temel çizgiye alındı. Düğme yüksekliği alt yazı olsa
da olmasa da artık birebir aynı, aritmetik her durumda tutuyor.

**3. Saldırı emrinde "Bunu alırsan seferberlikten…" satırı ortadan kesiliyordu.** Dosyanın
kendi dersi: `fontSize` `b.kucuk` ile veriliyor ama `lineHeight` hiç verilmiyordu. Satır
yüksekliğini yazı tipi belirleyince `maxHeight: '94%'` kutusundaki hesap tahmine dönüyor.
Satır yüksekliği açıkça yazıldı (15) + kaydırma alanına alt pay eklendi.

**Ek olarak:** il seçimindeki zorluk düğmelerine **ZORLUK** etiketi geldi — Kolay/Orta/Zor
etiketsiz duruyordu ve ne oldukları tahmine kalıyordu.

---

### Bu turda YAPILMAYANLAR (bilerek, açıkça)

Görev belgesindeki iki madde bu turda kapanmadı:

1. **Tek ikon dili (Adım 5'in ikinci yarısı).** Mod logoları, harita tipi düğmeleri ve
   birim ikonları hâlâ **dolu siluet**; belgedeki hedef "kontur, dolgusuz, tek kalınlık".
   Renkleri kâğıda uydu ama çizim dilleri değişmedi. Kalkan rozetin imza öğe olarak
   uygulama ikonuna/açılışa taşınması da yapılmadı.
2. **İl seçiminin tek sütun karar akışına dönmesi.** ZORLUK etiketi eklendi ama "dört köşe
   kalkar" yerleşim revizyonu yapılmadı; ekran hâlâ dört köşeye dağılmış durumda.

Doğrulama: `npm run kontrol` beş bölümde de temiz, 561 test geçiyor,
`npx expo export --platform android` hatasız (1329 modül). Bileşenlerdeki 21 dosyanın
stil anahtarları tarandı — tanımsız anahtar yok.

---

## YENİ VERİ — `veri/turkiye-hat.json` (2026-08-02)

**Üreten:** `scripts/turkiye-hat-uret.js` · **İçerik:** Türkiye'nin tek dış hattı (SVG yolu)

### Niye gerekti

`harita.json` illeri ayrı ayrı tutuyor — oyun haritası için doğru, **amblem için yanlış**.
Logo/mühür çiziminde 81 ili tek tek konturlayınca ülke değil bir karalama çıkıyor, çünkü
bütün il sınırları da çiziliyor. Amblemde gereken tek şey dış hat.

### Niye turf ile yapılmadı

Önce `@turf/turf` union'ı denendi ve **çöp üretti**: 377 karakterlik, negatif koordinatlı
4 kırıntı. Sebep, turf'ün koordinatları enlem/boylam sanması. Bizim koordinatlarımız
projekte edilmiş düzlem koordinatları (0–1000 × 0–452) ve geçerli enlem aralığı ±90
olduğu için turf'ün geodezik hesapları anlamsızlaşıyor.

### Kullanılan yöntem — koordinat sisteminden bağımsız

1. **Taramalı doldurma:** 93 halka 3002×1358'lik ikili ızgaraya dolduruluyor.
   Birleşim = "herhangi bir ilin içi".
2. **Marching squares:** ızgaranın sınırı çıkarılıyor. Parça uçları hücre kenarlarının
   tam ortasına düştüğü için birleştirme kayan nokta hatası olmadan yapılabiliyor.
3. **Douglas–Peucker** ile sadeleştirme.

**Tuzak:** DP kapalı halkaya doğrudan uygulanamıyor. Başlangıç ve bitiş noktası aynı
olduğu için aradaki "doğru" sıfır uzunlukta çıkıyor, bütün mesafeler anlamsızlaşıyor ve
halka iki noktaya çöküyor — ilk denemede 19 halkanın 19'u da elendi. Çözüm: halka,
başlangıçtan en uzak noktadan ikiye bölünüp iki açık parça ayrı ayrı sadeleştiriliyor.

**Sonuç:** 4 parça, 2262 nokta, 25.3 KB. Gözle doğrulandı (`onizleme/hat-kontrol.html`).

### Ayrıca üretilenler

- **`assets/muhur.png`** — Baki'nin mühür görselinin oyunda kullanılabilir hâli.
  Krem arka plan kenardan taşma (flood fill) ile silindi — düz eşikle silinse mührün
  içindeki açık metal parlamaları da delinirdi. Yıldızlar bağlı bileşen analiziyle bulunup
  çevre dokusundan örnek alınarak dolduruldu (düz renkle doldurmak yamayı belli ediyordu;
  ilk denemede eşik geniş kalıp mühre iki düz gri disk kondurmuştu). Kenardaki spekülar
  parlamalar %58 söndürüldü, renk oranları korunarak. 2048² → 720×744, 822 KB.
- **`assets/gren.png`** — 128×128 gürültü karosu, arka plan dokusu için (14 KB, döşenir).

---

## YENİ VERİ — `veri/menu-seferi.json` (2026-08-03)

**Üreten:** `scripts/menu-seferi-uret.js` · **İçerik:** ana menü fetih döngüsünün 8 durumu

### Niye gerekti

Ana menünün arkasındaki harita boş durmuyor: üç güç (Bursa 16 · Antalya 07 · Erzurum 25)
81 ilin bağımsız olduğu haritayı yedi turda paylaşıyor, sonra baştan başlıyor. Karar
belgesi (`docs/GOREV-10A-ANA-MENU-KARARI.md` §6) bunu menünün savaş hissini veren
**asıl öğe** diye tanımlıyor.

Hesap 181 parça × komşuluk taraması × 7 tur. Telefonda her menü açılışında yapılacak iş
değil — üstelik sonucu **her zaman aynı**. Değişmeyen bir hesabı çalışma anına bırakmak,
pil harcayıp aynı cevabı yeniden bulmak demek.

### Kural seti (Baki)

- Her tur, her güç **komşusu olan ve hiçbir güce ait olmayan** parçaların hepsini alır.
- Birbirlerinin parçalarına dokunmuyorlar.
- Harita paylaşılınca döngü biter.
- **Beraberlik sabit sırayla bozulur: Bursa → Antalya → Erzurum. Rastgelelik YOK.**
  Rastgele olsaydı sefer her açılışta başka türlü gider, menüye ikinci kez bakan oyuncu
  "bir şeyler bozuk" hissederdi. Sefer bir animasyon, bir simülasyon değil.

**Tuzak:** güç, o tur yeni aldığı parçalardan tekrar genişlemiyor. Genişleseydi tek turda
bütün haritayı yutardı ve döngü diye bir şey kalmazdı. Betikte okuma tur başı
sahipliğinden, yazma o turun kovasına.

### Sonuç — haritadan çıkan, elle ayarlanmamış

| | |
|---|---|
| Tur sayısı | **7** |
| Tur başına alınan parça | **26 / 37 / 36 / 34 / 25 / 10 / 1** |
| Son dağılım | Bursa **56** · Antalya **54** · Erzurum **71** |
| Cephe parça (durum 0→7) | 180 / 163 / 136 / 105 / 77 / 46 / 37 / 37 |

Erzurum kazanıyor çünkü doğu daha az bölünmüş: büyük parçalar, az rakip. Başlangıçta
180/181 parça cephede — doğrusu bu, o an gerçekten herkes herkesle sınır komşusu.

**Dördü de önizlemeyle (`onizleme/ana-menu-final.html`) birebir tuttu.** Betik bu
sayıları kendi içinde denetliyor: harita verisi değişip sefer kayarsa ekrana sapma yazıyor.

### Dosya içeriği

`durumlar[i]` = i. turun sonundaki sahiplik (parça → il kodu), `durumlar[0]` = 81 il
bağımsız. `degisenler[i]` = o turda el değiştirenler — çizim 181 yolu değil yalnızca
bunları canlandırıyor. `cepheler[i]` = komşusu farklı sahipte olan parçalar, dişli
konturla çiziliyor.

İkisi de durumlardan **türetilebilir**, o yüzden ayrışabilirler; `veri-dogrula.js`
her ikisini de durumlardan yeniden hesaplayıp karşılaştırıyor.

---

## EK — `veri/turkiye-hat.json` içine `meta.enUstY` (2026-08-03)

Ana menü ve mod ekranının başlığı ("SEFERİN AMACINI SEÇ") **karaya değmemeli**. Konumu
göz kararı değil hesapla bulunuyor:

```
karaninUstu = haritaUst + meta.enUstY × ölçek
baslikY     = karaninUstu − 10
```

Sabit sayı yazılsaydı dar ekranda kıyıya binerdi. Ekran her açılışta 2262 noktayı
taramasın diye dış hattın en küçük y'si bir kez hesaplanıp meta'ya yazıldı:
**`enUstY = 11.8`**.

Uygulama belgesi bu değeri 12.5 diye tahmin ediyordu; ölçülen **11.8**. Betik yeniden
çalıştırıldı, `yol` alanı **byte byte aynı** kaldı — yalnızca meta genişledi.

---

## YENİ ÖLÇÜM — `veri/tema-olcum.md` (2026-08-03)

**Üreten:** `scripts/tema-olcum.js` · **İçerik:** arayüz renklerinin WCAG kontrast oranları

### Niye gerekti

Görev 10A'nın en pahalı dersi: **zemin rengi değişince üstündeki HER ŞEYİN kontrastı
yeniden ölçülmeli.** İki kez yaşandı, ikisinde de gözle fark edilmedi:

1. Ayraç çizgileri bir turda **1.21:1**'e düşmüştü. Kutular kaldırıldığı için bilgiyi
   gruplayan tek şey o çizgilerdi — panel sessizce okunamaz hâle gelmişti.
2. Ege paletine geçişte kayıp/gider sayıları (`DURUM.eksi`) **1.76:1**'e düştü. Betiğin
   ilk çalıştırmasında yakalandı; gözle bakınca "kırmızı işte" görünüyordu.

Renk kararı gözle verilir ama **okunurluk ölçülür**. Oranlar artık `tema.js`'in
yorumlarında yazılı değil, ölçülü.

### Kapıya eklendi

`npm run kontrol` artık **altı** bölüm: VERİ · KOD · BİÇİM · RENK · **KONTRAST** · TESTLER.
Bir yazı zemininin üstünde okunmuyorsa kapı kapanıyor.

### Ölçü

WCAG 2.1 kontrast oranı (1.0 = aynı renk, 21 = siyah/beyaz). Eşikler: normal yazı **4.5**,
büyük yazı ve arayüz öğesi **3.0**, en katı **7.0**.

Tabloda ayrıca **ton farkı** sütunu var ve gerekli: düşük parlaklık kontrastını neyin
taşıdığını gösteriyor. Kiremit vurgusu lacivert zeminde 1.76:1 ile zayıf görünüyor ama
aralarında 161° var — göz onları parlaklıktan değil tondan ayırıyor. Bu sütun olmasa tablo
yanlış alarm verirdi.

### Zemin merdiveni de denetleniyor

`cukur < taban < yuzey < kabartma`. Sıra bozulursa panel "üstte" durmayı bırakır ve oyuk
satırlar gömülü görünmez — bu da gözle geç fark edilen bir kusur.

---

## YENİ VERİ — `veri/parca-kenarlari.json` (2026-08-03)

**Üreten:** `scripts/parca-kenarlari-uret.js` · **İçerik:** komşu parça çiftlerinin
paylaştığı sınır çizgileri (465 çift, 348 KB)

### Niye gerekti

Baki ana menüyü cihazda görünce itiraz etti: *"sınırlar sadece düşman sınırlarında koyu
renk olacak."* İlk uygulama cephedeki parçanın TÜM ÇEVRESİNİ koyu çiziyordu — parçanın
kendi tarafına bakan kenarları da. Üstelik karar belgesindeki "dişli kontur" (kesik
çizgi) da istenmiyormuş; o da kaldırıldı.

Doğrusu için parçanın çevresi değil, **iki parçanın paylaştığı kenar** lazım. Çizim
anında sahipliğe bakılıyor: iki yakası farklı sahipte olan çiftlerin çizgisi koyu, gerisi
silik. Böylece koyu çizgi tam olarak iki ordunun karşı karşıya olduğu hatta düşüyor.

### Yöntem — niye tolerans gerekmedi

Parçalar ortak bir bölümlemeden üretildiği için komşular kenarlarını **nokta nokta**
paylaşıyor. Ölçüldü: 45.718 kenarın 30.589'u tam olarak iki parçaya ait, 15.126'sı tek
parçaya (kıyı/dış hat), 1'i bozuk. Eşleştirme metin karşılaştırmasıyla yapıldı; kayan
nokta toleransı yok.

Ardışık kenarlar tek çizgide birleştirildi (654 KB ham → 348 KB). Halka kapalı olduğu
için başlangıç, komşunun değiştiği bir noktaya kaydırılıyor — yoksa halkanın başında
bölünen diziler aynı çizgiyi iki parça yazıp dosyayı şişiriyordu.

### Ortak kenarı olmayan 4 komşu çifti — BEKLENEN

Komşuluk grafiği kara sınırıyla sınırlı değil; boğazın iki yakası da komşu (oyunda
oradan geçilebiliyor) ama aralarında çizilecek kenar yok, deniz var:

| Çift | Açıklık | Ne |
|---|---|---|
| 17-1 / 17-2 | 1.71 birim | Çanakkale Boğazı |
| 17-1 / 17-3 | 0.71 birim | Çanakkale Boğazı |
| 34-1 / 34-2 | 0.40 birim | İstanbul Boğazı |
| 34-1 / 39-2 | tek nokta | köşe teması, kenar değil |

Bunların sınırı koyu çizilmiyor — doğrusu da bu.

### Kullanım

`MenuHaritasi.koyuKenarYolu(sahiplik)` iki yakası farklı olan çiftleri tek SVG yolunda
birleştiriyor. Fetih döngüsü bunu turda bir kez hesaplıyor (`useMemo`); sekiz durumun
hepsini önden hesaplamak megabaytlar tutardı. `menu-seferi.json`'daki `cepheler` listesi
ekranda artık kullanılmıyor (parça listesiydi, kenar değil); veri doğrulama hâlâ
denetlediği için dosyada duruyor.

---

## YENİ VERİ — `veri/mod-hedefleri.json` (2026-08-03)

**Üreten:** `scripts/mod-hedefleri-uret.js` · **İçerik:** mod kartlarının mini harita kümeleri

### Niye gerekti

Mod seçme ekranındaki üç kart, o modun **kazanma hâlini** gösteren mini haritalar taşıyor:
fetihte 181 parçanın hepsi oyuncunun, %50'de tam 91'i, güç yarışında üç blok (48/30/44 +
59 bağımsız) ve en büyüğü oyuncunun.

### Kaynak: onaylanan önizleme, algoritma değil

Kümeler `onizleme/mod-ekrani.html`'den çıkarıldı — Baki'nin gördüğü ve onayladığı
karelerden. Kural setinden türetme **denendi ve tutmadı**: %50 kümesi için düz BFS
(Bursa'dan halka halka büyü, en yakın 91) onaylanan kümeyle 88/91 örtüşüyor; önizlemedeki
"fazlalığı en uzaktakinden geri ver" adımı beraberlikleri başka kırmış. Piksel piksel aynı
görüntü isteniyorsa kaynak, onaylanan görüntünün kendisidir.

Önizlemedeki `p0..p180` sırasının `parcalar.json`'daki ekleme sırası olduğu doğrulandı
(ana menü önizlemesinin durum-0 dolgularıyla birebir örtüşme).

### Denetimler — "ekran sayı uyduramaz"

- %50 kümesi = `denge.js`'teki eşik: `ceil(ESIK_ORANI × 181)` = **91**. Üretici de
  `veri-dogrula.js` de bunu her koşuda karşılaştırıyor (bir kez ayrışmıştı: resim 101
  parça gösterip 91 yazıyordu).
- Güç yarışı blokları ayrık ve en büyüğü oyuncunun.
- Oyuncu tonu %92 karışım formülüyle (`tema.js`) birebir tutuyor — tutmasaydı ya formül
  ya önizleme değişmiş demekti.

---

## YENİ VERİ — `veri/menu-geometri.json` (2026-08-03)

**Üreten:** `scripts/menu-geometri-uret.js` · **İçerik:** menü ekranlarının sadeleşmiş
geometrisi (181 parça + 81 il + 465 komşu çifti sınır çizgisi)

### Niye gerekti — "yeni sefere basınca 3-4 saniye bekliyor" (Baki)

Menü ekranları haritayı OYUNUN tam çözünürlüklü verisiyle çiziyordu. Oyun haritası 7×
yakınlaştığı için o ayrıntıya muhtaç; menü hiç yakınlaşmıyor ve ~0.9 piksel/birim ölçekte
duruyor. Ölçüldü: mod ekranı açılırken ayrıştırılan yol verisi **6.6 MB** (arka harita +
sınır + 3 mini kart), il seçimi **824 KB**. Gecikme buydu.

### Sonuç

| Küme | Önce | Sonra |
|---|---|---|
| 181 parça | 850 KB · 76.428 nokta | **84 KB (%10)** |
| 81 il | 824 KB · 74.565 nokta | **59 KB (%7)** |
| komşu çifti çizgileri | 348 KB | **43 KB** |

Tolerans 1.0 birim ≈ 1 piksel — menü ölçeğinde gözle görülmez.

### Topolojik sadeleştirme — her parça ayrı ayrı SADELEŞTİRİLMEZ

Her parça kendi başına sadeleştirilse komşu taraflar farklı noktaları atar, ortak sınır
iki farklı çizgiye ayrışır (kıl aralıklar). Bunun yerine her halka komşu değişim
noktalarından koşulara bölünüyor, **her koşu bir kez** sadeleştiriliyor, iki sahibi de
aynı sonucu kullanıyor. Douglas–Peucker nokta **siler, kaydırmaz** — kalan noktalar
orijinal metinlerin birebir alt kümesi (doğrulandı). Paylaşılan kenarlar iki tarafta
hâlâ birebir aynı.

### Kullananlar ve tur başına işin sıfırlanması

`MenuHaritasi` (mozaik + sınır + koyu kenarlar), `MenuSeferi`, `ModSecimi` mini kartları
(artık renk başına TEK yol), `IlSecimi` (çizim + dokunma testi AYNI setten — çizim/dokunma
ayrışması bir daha doğmasın).

Veri küçülünce `MenuSeferi`nin tur başına yaptığı metin birleştirmeleri (300–700 KB/tur —
menüde düğmeleri geciktiren ikinci etken) tamamen ÖNDEN hesaplanır oldu: geçiş, parlama
ve koyu kenar yolları modül yüklenirken bir kez kuruluyor.

### `veri/parca-kenarlari.json` SİLİNDİ (aynı gün üretilmişti)

`ciftler` tablosu artık bu dosyanın içinde ve sadeleşmiş. Tam çözünürlüklü kopyanın
tüketicisi kalmadı; iki kopya yaşatmak §5 kuralına aykırı. Üreticisi
`scripts/parca-kenarlari-uret.js` de kaldırıldı — koşu bölme mantığı yeni betiğin içinde
yaşıyor.

### Düğme denetimi (aynı gün)

83 `onPress` bağlantısının tamamı tarandı: boş ya da kopuk işleyici yok; `onPress`
almayan `Pressable` yok. Oyun mantığı 561 testle ayrıca yeşil.

---

## YENİ ÖLÇÜM — `veri/karakter-olcum.md` (2026-08-06)

Üretici: `node scripts/karakter-olcum.js`. Görev 12 / Adım 2'nin bitiş ölçütü.

**Soru:** "her oyun farklı hissetsin" ölçülebilir bir şey mi? Evet — aynı zorluk, aynı
kapsam, **oyuncu hiç emir vermiyor**, yalnızca tohum değişiyor. Oyuncu karışsaydı, farkın
karakterlerden mi tesadüfen başka düşen hamlelerden mi geldiği ayrılamazdı.

25 tur × 5 tohum × 3 kademe:

| Kademe | En büyük imparatorluk | Ayrışma | Muharebe | Ayrışma | İlk savaş turu |
|---|---|---|---|---|---|
| Kolay | 5 – 8 parça | %21.4 | 4 – 11 | %35.0 | **4 – 13** |
| Orta | 8 – 15 parça | %22.2 | 68 – 106 | %16.3 | 3 |
| Zor | 16 – 31 parça | %22.5 | 469 – 567 | %7.1 | 3 |

**Okunuşu:** üç kademede de maçlar birbirinden ~%22 ayrışıyor — aynı zorlukta oynanan iki
maç aynı yerde bitmiyor. En anlatıcı sütun **kolay kademedeki ilk savaş turu**: 8 saldırgan
il çıkan maçta dünya 5. turda kızışıyor, 20 saldırgan çıkanda 4. turda; 13 saldırganlı
maçta 10. tura kadar kimse kimseye saldırmıyor. Karakter dağılımı tempoyu gerçekten
değiştiriyor.

**Denge korundu:** zor kademede ortalama en büyük imparatorluk ~24 parça, Görev 11'in
ölçtüğü 22'nin hemen üstünde. Yani karakterler çeşitliliği getirirken dengeyi kaydırmadı —
sebebi tasarım kararı: karakter dilimi zorluk BANDININ İÇİNDEN alınıyor, bandı genişletmiyor.

### ⚠ ÖLÇÜM BİR KEZ YALAN SÖYLEDİ

İlk koşuda üç kademede de "0 muharebe" çıktı; dünya büyüyordu ama hiç savaş görünmüyordu.
Sebep betikteydi: `rapor.muharebeler` diye **olmayan bir alan** okunuyordu. Rapor muharebeyi
ayrı listede tutmuyor, satırların `tip` alanında tutuyor (`cozum.js`). Düzeltildi ve not
betiğin içine yazıldı — Görev 06'nın "ölçütün kendisi de yanlış olabilir" dersinin küçük bir
tekrarı.

---

## YENİ ÖLÇÜM — `veri/sans-olcum.md` ve `veri/cikmaz-olcum.md` (2026-08-06)

Üreticiler: `node scripts/sans-olcum.js` · `node scripts/cikmaz-olcum.js`. Görev 12 / Adım 3–5.

### Şans: üç yaklaşım denendi, ikisi çürüdü

| Denenen | Sonuç |
|---|---|
| `SANS_BANDI` 0.10 → 0.16 → 0.25 | Zayıf tarafın kazanma oranı **üçünde de %0**; değişen tek şey güçlünün zaferinin bozulması (dağlıkta %100 → %90). Şans her raundda AYRI çekildiği için ortalamaya yakınsıyor. |
| Bozgun eşiğini düşürmek (moral −1, −2) | **Hiçbir eşleşme dönmedi.** Motor bir yıpranma yarışı; zayıf taraf kendi eşiğine her hâlükârda önce varıyor. |
| **Gün çarpanı + baskın** | İşe yarayan bileşim. Gün çarpanı muharebe başına tek kez çekiliyor (ortalamaya yakınsamıyor), baskın ise savaşın YAPISINI değiştiriyor. |

Yerleşen ayar: `SANS_BANDI 0.15` · `GUN_BANDI 0.10` · `BASKIN.OLASILIK 0.02` · şans artık
rampayla sönüyor (oran 1 → tam, oran 2 → sıfır; eskiden 2.0'da bıçak gibi kesiliyordu).

Sonuç: zayıf %0.8–1.5 · umutsuz **%0.0** · üstün %98.8–100.

### Arazi yumuşatması bir satırda durdu

Baki §3.7'den uzaklaşmaya izin verdi ama tarama sınırı gösterdi: dağlık savunma 1.25'e
inince **"1 zırhlı vs 1 topçu (dağlık)" ters dönüyor** ve §3.7'nin 3. kısıtı ("topçunun tek
şansı coğrafya") ölüyor — topçu her arazide zırhlıdan kötü bir birime düşüyor. Satır kılıç
sırtında: **1.35 → topçu 0.18 kalanla kazanır · 1.30 → 0.12 · 1.25 → 0.02 farkla kaybeder.**
Yumuşatma 1.30'da kesildi (tepelik 1.15 → 1.10), zırhlının dağ cezasına (0.50) dokunulmadı.
Kazanan hiçbir satırda değişmedi; dört satırın kalan kuvvet sayısı yeniden ölçülüp
`scripts/muharebe-referans.js`'e yazıldı.

### Çıkmaz — Baki'nin şikâyeti sayıya çevrildi

Ölçüt: bir aktörün aynı hedefe boşuna saldırma sayısı. Kapı (`UMUTSUZ_SALDIRI`) açıkken
zor kademede **boşa giden saldırı 26.0 → 10.8 (−%58)**, tekrar eden saldırı **1.4 → 0.0**,
en büyük imparatorluk **26.8 → 28.8** (dünya donmadı, tersine daha çok genişledi).

⚠ İlk ölçüt fazla dardı: "arka arkaya turlarda aynı hedef" arıyordu ve neredeyse hiç
ateşlenmiyordu (kaybeden ordu çoğu kez imha oluyor, ertesi tur saldıracak kimse kalmıyor).
Ölçüt "maç boyunca aynı cepheye kaç kez boşuna" olarak düzeltildi. Görev 06'nın "ölçütün
kendisi de yanlış olabilir" dersinin ikinci tekrarı.

---

## KÂĞIT YÜZEY — İKİNCİ RENK DÜNYASI (2026-08-06)

Baki: *"Renk paletinden memnunum ama oyunda genel hep mavi renk var; başarımlar çok yavan
olmuş."* Tespit ölçülebilir çıktı: arayüzün **%90'ı tek bir mavi ailesinden** (ZEMIN dörtlüsü
+ CIZGI ikilisi + YAZI_RENK üçlüsü) ve sıcak tarafta yalnızca SALDIR düğmesi var. Mühürler de
yalnızca yazı renkleriyle çiziliyordu — 34 rozet, arayüzün geri kalanıyla aynı iki renkte.

**Seçilen yol renk EKLEMEK değil, YÜZEY AYIRMAK:** oyunun kimliği "kâğıt atlas", o hâlde
deniz ve harita mavi kalsın, oyuncunun OKUDUĞU her şey parşömene taşınsın. Renk çeşitliliği
böylece süs olarak değil **bilgi sınıfı** olarak geliyor: mavi ekran "oynuyorsun", kâğıt ekran
"belge okuyorsun" demek.

`tema.js` → yeni `KAGIT` jeton kümesi (yüzey, oyuk, kabartma, üç yazı rengi, çizgi, mürekkep,
solmuş mürekkep, artı, eksi). Taşınan ekranlar: **MÜHÜRLER · NASIL OYNANIR · ORDULARIM ·
TUR RAPORU**.

### ⚠ ZEMİN DEĞİŞTİ, HER ŞEY YENİDEN ÖLÇÜLDÜ

Görev 10A'nın en pahalı dersi burada da geçerliydi: koyu zeminin yazı renkleri açık kâğıtta
okunmuyor. `DURUM.arti` (yeşil) kâğıtta **1.5:1**'e düşüyordu — yani gelir satırı görünmez
olurdu. Kâğıdın kendi renkleri ayrı tanımlandı ve `scripts/tema-olcum.js`'e yedi yeni çift
eklendi. Ölçüm (`veri/tema-olcum.md`):

| Çift | Oran | Asgari |
|---|---|---|
| `KAGIT.yazi` / yüzey | 10.27:1 | 7.0 |
| `KAGIT.yaziIkincil` / yüzey | 6.53:1 | 4.5 |
| `KAGIT.yaziSoluk` / yüzey | 3.36:1 | 3.0 |
| `KAGIT.murekkep` / yüzey | 8.92:1 | 4.5 |
| `KAGIT.arti` / yüzey | 4.83:1 | 4.5 |
| `KAGIT.eksi` / yüzey | 5.25:1 | 4.5 |

**Mühürler mürekkebe geçti.** Beyaz yazı rengiyle çiziliyorlardı; kâğıtta neredeyse
görünmezlerdi. Artık koyu mürekkep — gerçekten kâğıda basılmış duruyorlar. Kazanılmamış
mühür de "solmuş mürekkep" (opaklık 0.38 → 0.55, çünkü açık zeminde silik çizim kayboluyor).

### Mühür metalleri ve kâğıdın KURALI (2026-08-06, aynı gün ikinci tur)

Baki iki şey istedi: *"Mühürlere metal kademesi eklenebilir ama panellere metalik doku
YANSIMASIN"* ve *"kâğıt dokusunun benzer amaçtaki panellerde olması — oyuncu nerede
geleceğini tahmin edebilsin; mavi panelin etkisi azalmasın, beyazlar niş gibi olsun."*

**METAL — kademe artık İKİ KANALDAN kodlanıyor.** Biçim (tek halka / çift halka / çift
halka + defne) duruyor, metal onun ÜSTÜNE biniyor. Renk körü oyuncu kademeyi hâlâ biçimden
okuyor; bir bilgi iki kanaldan verildiğinde hiçbir kanal zorunlu olmuyor.

Metal resim değil **SVG geçişi**: koyu gövde → parlak vurgu → orta ton, sol üstten sağ alta.
İki duraklı geçiş "maden" değil "renk geçişi" gibi duruyordu; üçüncü durak yuvarlaklığı
veriyor. Ölçeklenince bozulmuyor, dosya boyutu artmıyor.

⚠ **Klasik metal tonları kullanılamadı.** `#CD7F32` (bronz) ve `#FFD700` (altın) açık
parşömende **1.6:1**'e düşüyor — ışıltı değil silik leke. Gövde tonları koyu taraftan
seçildi ve ölçüldü: bronz 5.65:1 · gümüş 5.37:1 · altın 4.43:1 (eşik 3.0, arayüz öğesi).

Kazanılmamış mühür **maden almıyor**, solmuş mürekkep kalıyor: ödül alınmadan madeni
göstermek kazanılmışla kazanılmamışı aynı ağırlığa getirirdi.

**KÂĞIDIN KURALI — "kâğıt = DÖKÜM, mavi = KARAR".** Sınav sorusu: *bu ekranda bir şey
YAPIYOR muyum, yoksa olmuş bitmiş bir şeyi OKUYOR muyum?*

| Kâğıt (6) | Mavi (14) |
|---|---|
| tur raporu · mühürler · ordularım · nasıl oynanır · **harekât arşivi** · **maç sonu istatistiği** | il paneli · savaş odası · üretim · araştırma · diplomasi · emir listesi · maç ayarları · genel ayarlar · onaylar · tur perdesi · sahne kartları · bildirim · ana menü paneli · mod ve il seçimi |

Oran bilerek 6/14: mavi baskın, kâğıt niş. **Diplomasi mavi bırakıldı** — GÜÇ sekmesi
teknik olarak döküm ama o panelde asıl iş karar vermek; tek panelin içinde yüzey
değiştirmek kuralı bulanıklaştırırdı.

**Maç sonu ekranında iki yüzey birden var ve bu bilinçli:** "KAZANDIN" bir andır, mavi
kalıyor; altındaki sicil tablosu kâğıt karta basılıyor. Kural kendini tam orada öğretiyor.

Harekât Arşivi'nin kâğıda taşınması Görev 10A'dan kalan borcu da kapattı (arşiv o günden
beri "eski düz zeminde" duruyordu).

---

## BAKİ'NİN BEŞ İSTEĞİ — DÖRT DAL, DİPLOMASİ, SINIRSIZ MOD (2026-08-08)

Kayıt sürümü **12 → 13**. Test 628 → **635**. Yeni ölçüm dosyası: `veri/savas-dokumu.md`,
`veri/bitirme-olcum.md`. Yeni betik: `scripts/savas-dokumu.js`, `scripts/bitirme-olcum.js`.

### Dört özel dal yeniden yazıldı — ve hepsi aynı kalıba oturdu

Baki dördünü tek tek tarif etti; tarifler bir yüzdeyi değil, oyunun bir KURALINI
değiştiriyordu. Bu yüzden dördü de **tek seviyeli** oldu (`OZEL_TAVAN: 1`) ve fiyatları
ayrıldı (`OZEL_MALIYET: 12`, stat dalları 60/120/180'de kaldı). Ara kademe icat etmek,
Baki'nin tarif etmediği iki seviye uydurmak olurdu.

| Dal | Eskiden | Şimdi |
|---|---|---|
| Seferberlik | seviye başına %10 indirim | yaralı piyade **bedava ve anında** |
| Baraj ateşi | ilk raundda %6 çarpan | savaştan **önce karşılıksız** atış |
| Paletli üstünlük | tek oran, her arazide aynı | tepelikte ceza **biter**, dağlıkta %80 kalkar |
| Yarma | çekilene 1 fazla kayıp | bozulan ordu **çekilemez, yok olur** |

**Baraj artık raundun içinde değil, raunt 0.** Eski hâli Baki'nin tarifini karşılamıyordu:
%6'lık çarpandı ve piyade aynı raundda karşılık veriyordu. Yeni hâli baskın olayının
kalıbını kullanıyor ("bir taraf o raunt vuramaz"). Oran 0.80 **Baki'nin örneğinden
türetildi**: 1 topçunun 1 piyadeye normal hasarı 186, piyadenin yarı canı 150,
150/186 = 0.806. Yani "1 topçu 1 piyadeyi yarı cana indirir" cümlesi sayının tanımı.

**Yarma için yeni yol açılmadı.** `cozum.js cekil` zaten "gidecek yer yoksa ordu yok olur"
durumunu biliyordu; yarma o durumu bir sebep daha ile tetikliyor.

### ⚠ YOL BOYUNDA BULUNAN ESKİ HATA — seferberlik hiç işlemiyordu

`toplanmaMaliyeti` (ekranda görünen bedel) seferberlik indirimini hesaba katıyordu ama
`toplanmaCoz` (gerçek harcama) **katmıyordu** — parametre hiç geçirilmemişti. Oyuncu
panelde indirimli bedeli görüyor, tur sonunda tam bedel ödüyordu. Görev 06'nın kuralı
("ekranla gerçek hesap ayrışmaz") tam burada kırılmış. İkisi artık aynı çağrıdan geçiyor
ve testi var.

### ⚠ ÖLÇÜM BİR DENGE SORUNU GÖSTERDİ — `veri/savas-dokumu.md`

| Dal | Bedel | En büyük etkisi |
|---|---|---|
| Baraj ateşi | **12 puan** | 3T → 2Z ovada %0 → **%98** |
| Paletli üstünlük | **12 puan** | 1Z → 2P dağlıkta %1 → **%84** |
| Zırh Sv.3 | **360 puan** | %0–1 |
| Ağır vuruş Sv.3 | **360 puan** | %0.3 |

**Otuz kat pahalı olan dal, yüz kat daha az iş yapıyor.** Sebep: stat dalları bir sayıyı
%8 kaydırıyor ve yıpranma yarışında o fark bozgun eşiğinin hangi raundda geçildiğini
çoğu eşleşmede değiştirmiyor; özel dallar savaşın YAPISINI değiştiriyor. Sonuç: oyuncunun
ilk araştırma kararı hep aynı olacak — önce dört ucuz yetenek. Düzeltmek tek satır
(`OZEL_MALIYET`), karar Baki'ye bırakıldı.

### Diplomasi: barış turu kalktı, ittifaka güç tavanı geldi

`BARIS_TURU 2 → 0`. Kural kodda duruyor, sayısı sıfır — geri getirmek tek satır, ve iki
test birden var (sıfırken engellemiyor / sayı verilince yine engelliyor).

**Erken ittifak eşiği** eklendi (`ERKEN_TUR 8`, `ERKEN_INDIRIM 0.10`). Sorun şuydu: ittifak
puanının en büyük terimi ORTAK DÜŞMAN oranı ama maç başında kimsenin düşmanı yok, terim
sıfır kalıyor ve hiçbir teklif eşiği aşamıyordu. Aynı kısır döngü savaş ilanında da
yaşanmış ve `GENISLEME` terimiyle kırılmıştı; çözüm aynı kalıp.

⚠ **İLK DENEME (0.25) DOYGUNLUK ÜRETTİ** ve testi kırdı (zor kademe, 30 tur: canlı 17
aktörün 9'u ittifaklı) — Görev 09'un üç kök sebeple çözdüğü sorunun aynısı. Tarandı
(5 tohum): 10. turdaki ittifak sayısı 0 → 1.2, 0.10 → **3.0**, 0.15 → 6.6, 0.20 → 7.4.
Baki "biraz artsın" dedi; 0.10 iki buçuk kat, 0.15 ve üstü "biraz"dan çok fazlası.

**Güç tavanı** (`GUC_KISITI.ORAN 0.40`): iki devlet birleşince haritanın %40'ını aşıyorsa
anlaşamıyor. Oyuncuya ve zekâya aynı kapıdan. Kurulmuş ittifak sonradan büyüdü diye
BOZULMUYOR — kural kapıda çalışıyor, geriye dönük el koyma değil.

### Fetih ve %50 hâkimiyet sınırsız — ve bedeli ödendi

`SINIRSIZ: true`. Tur sınırı bir **emniyet kemeriydi**: dünya kilitlense bile maç "süre
doldu, toprağa bak" ile bitiyordu. Sınır kalkınca kilitlenen dünyada maç hiç bitmez.

Karşılığı `ZEKA.BITIRME`: iştah turla büyüyor (0 → 1, `DOYMA_TURU 60`), saldırı terimini
büyütüyor, **açıkta kalma cezasını söndürüyor** (asıl anahtar) ve savaş ilanı iştahını
artırıyor.

⚠ **UMUTSUZ SALDIRI KAPISINA DOKUNULMADI.** Kilidi o kapıyı gevşeterek açmak mümkündü ama
Baki'nin çıkmaz şikâyetini geri getirirdi. İştah "daha çok kuvvetle saldır" diyor,
"kaybedeceğin saldırıyı yap" demiyor.

**Ölçüm (`veri/bitirme-olcum.md`, 150 tur):**

| Kademe | İştah kapalı | İştah açık |
|---|---|---|
| Orta | %7 → **%12**, muharebe 4.1 → 0.5 (net kilit) | %11 → **%70** |
| Zor | %19 → %76, canlı 3 | %16 → %52, canlı 4 |

Orta kademede kilit gerçekten vardı ve açıldı. Zor kademede iştah hızlandırmıyor,
**dengeliyor** — herkesi cesaretlendirdiği için tek bir devin sıyrılması zorlaşıyor.

### Kutsal savaş denetimi — kurallar tutuyor

Baki'nin saydığı her kural ayrı ayrı sorgulandı ve **hepsi doğru uygulanıyor**: düello
ömrü tam 5 tur, giriş şartı iki tarafı da kesiyor, üçüncü taraf kısıtı `topraklar`
(cephe değil, tüm topraklar), moral ve ganimet bonusu yalnızca çiftte, kapak çalışıyor.
Yedi denetim testi eklendi.

En kritik yeni test **Görev 11 ile kesişen yer**: barış varsayılan olduğu için hasım A,
hasım B'ye saldırmadan önce savaş İLAN etmek zorunda ve ilan zinciri yayıyor. Zincir A'yı
üçüncü bir devletle savaşa sokarsa düellonun giriş şartı kendiliğinden bozulur. Müttefiksiz
iki hasımda yol temiz — test onu kilitliyor.

---

## MUHAREBE MİMARİSİ SIFIRDAN KURULDU (2026-08-08, aynı gün ikinci tur)

> Baki: *"Statlarımızın her birini dengeleyelim… baştan aşağı dengeli bir mimari oluştur
> sıfırdan, ama kazanımlarımızı yeniden sağlam bir matematiğe oturtarak."*

Kayıt sürümü **13 → 14**. Test **635 → 637**. Yeni betik: `scripts/denge-mimarisi.js`.
Yeni ölçüm: `veri/denge-mimarisi.md`.

### Yeni stat tablosu

| Birim | Zırh | Ağır | Hafif | Dayanıklılık | Rol |
|---|---|---|---|---|---|
| Piyade | 50 | **75** | **175** | **1400** | kalabalığa karşı, ucuz et |
| Topçu | 100 | **250** | 75 | **1100** | zırhlı avcısı |
| Zırhlı | 200 | **175** | **150** | **2200** | her şeye vurur, arazi kölesi |

Zırh değerleri **değişmedi** — etkinlik eğrileri (§3.3) o üç sayıya kalibre; oynatmak
formülün tamamını yeniden türetmek olurdu ve Baki zırh için bir şey istemedi.

### ⚠ SAVAŞ SÜRESİ: MORAL İSTEĞİ İLK ÖLÇÜMDE KARŞILANAMADI

Baki *"moral savaşların ne kadar süreceğini etkilesin"* dedi. İlk mimari ölçüldüğünde
karşılaşma matrisindeki **bütün savaşlar 1 raunt** sürüyordu — tek raundda ordunun yarısı
gidiyor, bozgun eşiği ne olursa olsun savaş ilk raundda bitiyordu. Bir raunt süren savaşta
"moral ne kadar dayandırdı" diye bir soru yok.

Çözüm dayanıklılıkları **4× büyütmek** oldu (350/275/550 → 1400/1100/2200). **Oranlar
birebir aynı**, yani kim kazanır hiç değişmiyor; değişen tek şey hasar/can oranının
%50'den %12.6'ya inmesi ve savaşların **3–6 rounda** çıkması. Hasarı bölmek yerine canı
büyütmek seçildi: hasar sayıları Baki'nin profil tarifini taşıyor ve dörde bölmek onları
ölçeğin katı olmaktan çıkarırdı; dayanıklılık ise hiçbir bölene girmiyor.

### Moral: taban + ilin statı + durum kalemleri

```
bozgun eşiği = TABAN 0.40 + 0.25 × (ilin moral statı / 10) + kalem × 0.08
```

**Eski yapı ilin moral statını fiilen ölü bırakıyordu:** stat bir EŞİKTEN geçiyordu
(`MORAL_YUKSEK_ESIGI: 5`) ve 81 ilin 44'ü aynı değerde (4) olduğu için moral 3 ile moral 4
arasında hiçbir fark yoktu. Artık stat sürekli giriyor ve savaş süresini belirliyor:

| Moral statı | Eşik | 6P → 6P raunt |
|---|---|---|
| 3 | 0.48 | 4 |
| 5 | 0.53 | 5 |
| 7 | 0.57 | 6 |

⚠ **TABANIN ALT SINIRINI TASARIM KISITI ÇİZDİ.** İlk deneme 0.35'ti ve §3.7'nin ikinci
kısıtını kırıyordu (*"zırhlı 3 piyadeye KAYBEDER"*). Sebep ince: bozgun eşiğini düşürmek
ÇOK BİRİMLİ orduyu cezalandırıyor, TEK BİRİMLİYİ cezalandırmıyor — tek birimlik ordu
bozulamaz, ancak imha olur. Tarama: 0.35 → 14/15 satır, **0.40 ve üstü → 15/15**.
0.40/0.25 en büyük göreli moral farkını veriyor (moralli ordu %50 daha uzun dayanıyor).

### ⚠ BASKIN MİMARİ DEĞİŞİNCE SESSİZCE ÖLDÜ

Savaşlar 3 raunttan 6 raunda çıkınca tek raundluk baskının göreli ağırlığı yarıya indi ve
zayıf tarafın kazanma oranı **%1 → %0.0**'a düştü — Baki'nin Görev 12'deki "~%1 sürpriz"
şartı kayboldu.

**Ölçüm önce iki yanlış kola baktı:** baskın olasılığı %2 → %12'ye çıkarıldı, sonuç %0.2'de
kaldı; gün bandı 0.10 → 0.50'ye çıkarıldı, zayıf taraf %2.8'e çıktı ama ÜSTÜN taraf
%100'den %96.7'ye düştü — yani sürpriz değil kumar üretiyordu. Sorun olasılık değil
baskının **SÜRESİYDİ**: `BASKIN.RAUNT: 2` ile zayıf taraf **%1.1**, üstün taraf **%98.9**.

### §3.7 tablosu yeniden çivilendi — ve biçimi değişti

Eski tablo, beklenen kazananı sürekli modelin ürettiği iki kalan-kuvvet sayısından
TÜRETİYORDU. Yeni mimaride bu yol tıkandı: **sürekli model bozgun bilmiyor** ve tek
birimlik orduyu da dağıtıyor, motor ise dağıtmıyor. Savaşlar uzayınca fark belirginleşti.

Artık tabloda **beklenen kazanan açıkça yazılı** (dört tasarım kısıtından gelir) ve yanında
motordan ölçülmüş bir **kalan oran çıpası** duruyor (regresyon koruması). "Motordan üretip
motora sorma" tuzağına düşülmedi: kazananlar tasarım kararı, çıpa sayısı ise gelecekte biri
statı oynatırsa öten alarm.

Sürekli model silinmedi, **emekliye ayrıldı**: `testler/muharebe.test.js` artık ayrışmanın
VAR olduğunu ve tek yönlü olduğunu (yalnız tek birimlik taraflarda) kilitliyor.

### Denetim sonucu

- **Rol profilleri 6/6** — Baki'nin tarif ettiği her ilişki tutuyor
- **Fiyat sapması %9.7** — hiçbir birim "hep bunu bas" cevabı vermiyor
- **Dört tasarım kısıtı 15/15** — taş-kağıt-makas ve coğrafya kuralı yerinde
- Karşılaşma matrisi: ovada zırhlı hâkim, dağlıkta piyade hâkim, topçu savunma birimi

---

## SAVAŞ SÜRESİ VE STAT ÖLÇEĞİ (2026-08-08, aynı gün üçüncü tur)

> Baki: *"Savaşların raund sayısı büyüklüğüne göre 1–4 arasında değişse güzel olur…
> birlik türlerinin statlarını normalize etmek istiyorum, 1400 gibi sayıları 2 basamağa
> indirsek ve tam/5'lik sayılar kullansak."*

Kayıt sürümü **14 → 15**. Test **638**. İki istek aynı taşın iki yüzü çıktı.

### Raunt sayısı artık bir KURAL, yan ürün değil

| Toplam birim | Raunt |
|---|---|
| 1–9 | 1 |
| 10–19 | 2 |
| 20–49 | 3 |
| 50+ | 4 |

Ölçü **iki tarafın toplamı**. Kademe bir ÜST SINIR: bozgun ya da imha daha erken bitirir.
Raunt tavanı dolunca sonuç **berabere değil** — oransal olarak az yıpranan kazanır
(eşitlikte savunan). Eski "berabere" kuralı kalsaydı bütün küçük çarpışmalar sonuçsuz
biterdi, çünkü artık her savaş tavanla bitebiliyor.

### ⚠ KADEME TEK BAŞINA ÇALIŞMADI — HASAR BÖLÜNMESİ GEREKTİ

İlk uygulamada tablo kuruldu ama ölçüm şunu gösterdi: **40 piyadeye 40 piyade, kademesi
4 raunt olmasına rağmen 1 rauntta bitiyordu.** Bir raundluk hasar savunanın canının
~%50'si, bozgun eşiği %40 — ordu ikinci raunt gelmeden dağılıyordu. Bütün kademeler aynı
sebeple 1'e çöküyordu.

Çözüm: **bir raundun hasarı savaşın uzunluğuna bölünüyor.** Savaşın toplam şiddeti
değişmiyor (4 raunt süren savaşta her raunt dörtte bir vuruyor), yalnızca hasar kaç
parçaya yayıldığı değişiyor. Kim kazanır sorusunun cevabı aynı kaldı. Sonuç: kademe
tablosu ile motorun oynattığı raunt **birebir tutuyor**.

### Statlar iki basamağa indi

| Birim | Zırh | Ağır | Hafif | Dayanıklılık |
|---|---|---|---|---|
| Piyade | 10 | 10 | 35 | 70 |
| Topçu | 20 | 50 | 15 | 55 |
| Zırhlı | 40 | 45 | 30 | 90 |

Hepsi **iki basamaklı ve 5'in katı**. Zırh ve bölenler birlikte /5 ölçeklendi
(HAFIF_BOLEN 300 → 60, ZIRH_SONUM_BOLEN 1000 → 200, ISABET_BOLEN 500 → 100), yani etkinlik
eğrileri birebir korundu. `STAT_OLCEGI` 25 → 5.

Dayanıklılıkların 4 basamaktan inebilmesi tam da raunt kuralı sayesinde oldu: süre artık
büyüklükten geldiği için dayanıklılık/hasar oranının süre ayarlama görevi bitti.

### ⚠ ARAŞTIRMA ARTIŞI %8 → %10 (yuvarlama yüzünden)

En küçük stat 10 olunca %8 artış orada 0.8 ediyor ve sonuç yuvarlandığı için **iki seviye
aynı sayıya düşüyordu**: `stat 10 → Sv.1 11 · Sv.2 12 · Sv.3 12`. Oyuncu 180 puan ödeyip
hiçbir şey almıyor — sessiz ve en kötü türden bir hata. %10, en küçük statta bile seviye
başına tam +1 veriyor ve bütün statlarda artış monoton.

### Denge yeniden ölçüldü

- **Rol profilleri 6/6** — Baki'nin tarif ettiği her ilişki yerinde
- **Fiyat sapması %5.4** — şimdiye kadarki en dengeli hâl (önceki tur %9.7)
- **Dört tasarım kısıtı 15/15**

Kademeli savaş bir kısıtı çevirdi ("zırhlı 4v6 ölçeğinde ovada kazanır") — topçu ikinci
raundda da vurunca zırhlı eriyordu. Tarama yapıldı; zırhlı ağır vuruş 45 + can 90 hem
15/15 kısıtı tutuyor hem sapmayı %14.4'ten %5.4'e indiriyor, üstelik iki basamakta kalıyor.

---

## RAUNT ÖLÇÜSÜ · YIĞILIMLI ETKİ · STAT DALLARI (2026-08-08, dördüncü tur)

Kayıt sürümü **15 → 16**. Test **638**. Baki'nin üç isteği.

### 1. Asimetri sorunu — Baki'nin tespiti doğruydu

> *"10–19 birim için 2 tur dedik ama bir taraf 15 diğeri 1 kişi olursa da bu durum
> oluyor; bu varsayım iki tarafın aynı sayıda birliğe sahip olduğunu varsayıyor."*

Ölçü **toplam birim** yerine **2 × küçük taraf** oldu. Savaşı uzatan şey büyük tarafın
kalabalığı değil, **küçük tarafın ne kadar direnebildiği**:

| Eşleşme | Eski | Yeni |
|---|---|---|
| 15 vs 1 | 2 raunt | **1 raunt** |
| 50 vs 5 | 4 raunt | **2 raunt** |
| 40 vs 20 | 4 raunt | **3 raunt** |
| 10 vs 10 | 3 raunt | 3 raunt |

İki taraf eşitken `2 × min = toplam`, yani Baki'nin verdiği kademe tablosu (1–9 → 1,
10–19 → 2, 20–49 → 3, 50+ → 4) **birebir korunuyor**. Formül, o tablonun sessiz
varsayımını kuralın kendisi hâline getiriyor.

### 2. Yığılımlı etki — `MUHAREBE.IVME`

> *"İlk tur oynansın, şans faktörüdür falan her şey belirlensin… ondan sonra 2. tur da
> bunlara göre oynansın; 1. turun sonuçları 2. turu etkilesin, yığılımlı etki olsun."*

Bir kısmı zaten vardı (kayıplar ve hasar havuzu raunttan raunda taşınıyordu). Eksik olan
**moral üstünlüğü**ydü: savaşın gidişatının kendisinin bir ağırlığı yoktu.

Artık bir raundda oransal olarak daha az yıpranan taraf sonraki raundda daha sert vuruyor;
etki **çarpılarak birikiyor** ve tavanla kırpılıyor (`PAY 0.12`, `TAVAN 1.3`).

Ölçüm — 30 piyade vs 28 piyade, raunt raunt vuruşlar:

```
İvme KAPALI:  265/247   239/221   212/186   186/159
İvme AÇIK:    265/247   242/217   220/179   198/149
```

Öndeki taraf farkı açıyor. **36 eşleşmede hiçbir sonuç değişmedi** — ivme dengeyi
bozmuyor, savaşa doku veriyor. Tavan olmasaydı 4 rauntluk savaşlar ilk raundun tekrarına
döner, şans/gün çarpanı/baskın anlamsızlaşırdı.

### 3. Stat dalları artık gerçekten iş yapıyor

Ölçüm bir önceki turda 360 puanlık dalların savaşı **%0–1** oranında değiştirdiğini
göstermişti. Baki: *"360 puanlıkları düzenleyelim, 10 olan statı ilk 12 sonra 15 yapsınlar
gibi düzgün sayılarla düzenle ve bozuk olmasın."*

`ARTIS %10 → %20`. Seçimin sebebi ölçüm:

| ARTIS | 10 olan stat | Ondalık çıkan stat |
|---|---|---|
| %10 | 11 · 12 · 13 | 6 adet |
| %15 | 12 · 13 · 15 | 17 adet |
| **%20** | **12 · 14 · 16** | **YOK** |
| %25 | 13 · 15 · 18 | 17 adet |

**%20 tek "bozuk olmayan" seçenek**: bütün statlar 5'in katı ve 5 × 0.20 = 1, yani her
stat her seviyede tam sayı. Baki'nin örneği "12 sonra 15"ti; %20 ikinci seviyede 14
veriyor — aradaki bir birim, hiçbir statta ondalık görünmemesinin bedeli.

Sonuç (`veri/savas-dokumu.md`): zırh dalı Sv.3 artık savaşı **%10.8** çeviriyor (önce %0–1).

### ⚠ ÖLÇÜMÜN KENDİSİ BİR KEZ YALAN SÖYLEDİ

"Ağır vuruş Sv.3" satırı dal açılınca oranı %1.8'den **%0'a düşürüyordu** — dal zayıfladı
diye değil, seçilen eşleşmeler (2T → 2Z) topçunun zaten kaybettiği satırlardı ve topçu
güçlenince güç farkı şans eşiğini aşıp sürprizi kapatıyordu. Eşleşmeler topçunun gerçekten
çevirebileceği satırlarla değiştirildi: 3T → 2Z tepelikte **%92.5 → %100**.

Görev 06'nın "ölçütün kendisi de yanlış olabilir" dersinin bir tekrarı daha.

### Kademeli savaş bir kısıtı çevirdi

Raunt ölçüsü değişince "4 zırhlı vs 6 topçu ovada kazanır" satırı 2 raunttan 1 raunda
indi ve sonuç döndü. 75 bileşim tarandı; **zırhlı ağır 45 · hafif 30 · can 95** hem 15/15
kısıtı tutuyor hem iki basamakta kalıyor. Denetim: rol 6/6 · sapma %9.2 · kısıt 15/15.

## AĞIR VURUŞ: BONUS DEĞİL DELİCİLİK (2026-08-11)

Test **641**. Kayıt sürümü değişmedi (kayıt biçimine dokunulmadı). Baki'nin iki isteği
aynı hatanın iki yüzü çıktı.

> *"Ağır vuruş zırha karşı delicilik versin, bonus hasar kazanmasın — yani zırhın bir
> kısmına ignore atsın, ona göre hesaplansın. Onun dışında araştırmalar kısmında 3 tür
> için de statlar geliştirildikçe kalitesinin azalma durumu gibi şeyler olmasın."*

### Eski formül gerçekten bonus veriyordu

    agir = (1 − zırh/200) × (0.55 + zırh/100)

Birinci çarpan zırhı **koruma** sayıyordu, ikincisi ("yumuşak hedefte mermi israfı")
zırhı **ödül** sayıyordu — ve ikincisi kazanıyordu:

| Hedef | Zırhı | ESKİ ağır etkinlik | YENİ ağır etkinlik |
|---|---|---|---|
| Piyade | 10 | 0.617 | **0.760** |
| Topçu | 20 | 0.675 | **0.720** |
| Zırhlı | 40 | 0.760 | **0.640** |

Ağır vuruş, en zırhlı hedefte en verimliydi. Zırh bir davetiyeydi.

### ⚠ BUNUN BEDELİ: ARAŞTIRMA GERİ TEPİYORDU

İki istek burada birleşti. Zırh dalını yükseltmek gelen ağır ateşin etkinliğini
**artırıyordu**. Ölçülen en net olay (`veri/delicilik-olcum.md` §3) — 3 topçu vs 3 topçu, ova:

| Savunanın zırh dalı | Zırhı | Gelen ağır etkinlik | Sonuç |
|---|---|---|---|
| Sv.0 | 20 | 0.675 | **kazanıyor** |
| Sv.1 | 24 | 0.695 | *kaybediyor* |

60 araştırma puanı ödeyip kazanılan savaşı kaybetmek. Ekranda "zırhın 20 → 24" yazıyor,
sahada ordu zayıflıyor — sessiz ve en kötü türden hata.

### Yeni model: tek zırh eğrisi, iki vuruş

    kalanZırh = zırh × (1 − AGIR_DELICILIK)
    agir      = AGIR_VERIM × (1 − kalanZırh / HAFIF_BOLEN)
    hafif     = 1 − zırh / HAFIF_BOLEN

İki vuruş **aynı** eğriden geçiyor; ağır vuruşun tek ayrıcalığı zırhın %70'ini yok saymak.
"Mermi israfı" fikri ölmedi, **sabitlendi** (`AGIR_VERIM`) — sabit olduğu için hedefin
zırhına bakmıyor, bonusa dönüşemiyor.

⚠ **Zırhın ağır vuruşu ne kadar azalttığı değişmedi**: eski sönüm böleni 200'dü ve
`60/(1−0.70) = 200`. Delicilik yeni bir mekanik değil, zaten oradaki şeyin doğru adı.

### İki sayı ölçümle seçildi

`node scripts/delicilik-olcum.js` → `veri/delicilik-olcum.md`. Hakem: §3.7'nin 15 satırı,
kalan-oran çıpaları, eşit para matrisi ve **araştırmanın tek yönlülüğü** (6144 muharebe).

| Delicilik | Verim | 15 satır | Çıpa sapması | Zafer kaybı |
|---|---|---|---|---|
| %70 | 0.75 | 15/15 | 0.00 | 0 |
| **%70** | **0.80** | **15/15** | **0.00** | **0** ← seçilen |
| %70 | 0.85 | 15/15 | 0.33 | 0 |
| %70 | 0.90 | 14/15 ✗ | 0.33 | 0 |

0.90'da "3p+1t+1z vs 5 topçu" ters dönüyor: topçu her şeye karşı iyi bir birime dönüşüyor
ve taş-kağıt-makas kapanıyor. 0.80 ayrıca en temiz sayı: `agir = 0.80 − 0.004 × zırh`.

### Baraj oranı üçüncü kez yeniden çözüldü

Bu oran topçunun piyadeye verdiği normal hasara bölünerek çıkıyor (Baki: *"1 topçu, 1
piyadeyi savaşın başında yarı dayanıklılığa indirsin"*), yani etkinlik eğrisi her
değiştiğinde yeniden çözülmek zorunda. Vuruş 43.38 → 50.50 çıktı, oran **0.80 → 0.69**.
Bırakılsaydı baraj piyadeyi yarıya değil %58'ine indirirdi. Sayı değil, cümle sabit.

### Ne değişti, ne değişmedi

Değişmedi: 15 satır ve dört tasarım kısıtı (15/15), kalan-oran çıpalarının hepsi, hafif
vuruş eğrisi, bütün statlar, fiyatlar, moral, arazi. Rol 6/6 · fiyat sapması %9.4.

Değişti (isteğin doğrudan sonucu): piyade ağır ateşe karşı biraz daha kırılgan, zırhlı
savaşları biraz daha uzun, zırh araştırmak artık gerçekten koruyor.

### ⚠ ÖLÇÜM İKİ ESKİ KUSURU DA ORTAYA ÇIKARDI

1. **`muharebe-referans.js`'in özet bölümü 2026-08-08'den beri bozuktu.** Tablo biçimi
   değişince (5. alan artık sayı değil, kazananın adı) `Math.abs(sayı − 'saldiran')` her
   satırda NaN veriyordu; rapor üç yorumu da 0/15 gösterip "model gözden geçirilmeli"
   diye bitiyordu — hiçbir şey bozuk olmadığı hâlde. Hiçbir test o bölümü okumuyordu.
   Ölçüt kazanan üzerinden yeniden yazıldı; artık üç yorum da 15/15 veriyor, yani ölçüt
   **körelmiş** durumda (Görev 05'te kararı veren ondalıklar tablodan çıkmıştı). Rapor
   bunu artık açıkça söylüyor, sessizce yanlış söylemiyor.

2. **`arastirma-olcum.js` "TAVAN ÖLÇÜLEN SINIRI AŞIYOR" diyor — ve bu yeni değil.**
   Aynı uyarı eski eğriyle de çıkıyor (A/B ile doğrulandı; eski eğri daha kötü: bağlayıcı
   sütunda 4 dal Sv.0, yeni eğride 3). Sebep 2026-08-08'de `ARTIS`'ın %8 → %20 çıkması
   ve tavan ölçümünün o gün yeniden koşulmaması. **AÇIK KARAR, Baki'ye soruldu.**

## ARAŞTIRMA SAVAŞI ÇEVİRMELİ — ÖLÇÜT DEĞİŞTİ (2026-08-12)

> *"Tüm sistemleri en son değişikliklere göre yenile. Araştırmaları yapılan birlikler
> savaşları kesinlikle değiştirebilsin; mesela araştırmadan önce sınırdan kaybedilen
> savaşlar bir taraf araştırmaları yapınca sınırdan kazanmaya veya ezmeye başlasın.
> Bunları uygula tüm birlik ve muharebe mekaniklerine."*

Kayıt sürümü değişmedi. Yeni bir dal, yeni bir sayı EKLENMEDİ — istenen davranışın zaten
var olup olmadığı ölçüldü, ölçüt yeniden kuruldu ve teste bağlandı.

### Eski ölçüt ISTEĞİN TERSİNİ savunuyordu

`arastirma-olcum.js` şunu soruyordu: *"her dal hangi seviyeye kadar §3.7'yi BOZMUYOR?"*
Yani araştırmanın dengeyi değiştirmemesi isteniyor, tavan oradan seçiliyordu. Baki'nin
isteği bunun tam tersi. Ölçüt emekliye ayrıldı.

⚠ **Üstelik eski ölçütün ÇÖZÜMÜ DE YOKTU** ve bu ölçüldü: sekiz stat dalından hangi alt
küme açılırsa açılsın, tam teçhizatta §3.7'nin en az bir satırı kayıyor. Zırhlıya zırh ya
da dayanıklılık dalı eklemek de kurtarmıyor — yalnızca kayan satırı değiştiriyor.

### Yeni ölçüt: sınırdaki savaş dönüyor mu

Kaybedilen savaşlar **kalan can marjına** göre bantlara ayrıldı (0.50 = başa baş). Birim
sayısı bu soruyu cevaplayamıyordu: 3'e 2 biten iki ayrı savaş aynı görünüyor.

| Araştıran | Bant | Savaş | Sv.1 | Sv.2 | Sv.3 | Tam teçhizat |
|---|---|---|---|---|---|---|
| saldıran | kıl payı (0.45–0.50) | 123 | %46 | %87 | **%95** | **%100** |
| saldıran | yakın (0.40–0.45) | 159 | %16 | %52 | **%70** | %98 |
| saldıran | farklı (0.30–0.40) | 409 | %2 | %10 | %25 | %73 |
| saldıran | ezildim (<0.30) | 1706 | %0 | %1 | **%1** | **%15** |

**İki rol de ölçülüyor** (2026-08-12'de eklendi): savunanın arazi çarpanı var ve bozgunu
başka zamanda geliyor; tek rol ölçmek kapsamın yarısını görmemek olurdu.

Son satır ilki kadar önemli: **ezilerek kaybedilen savaş dönmüyor.** Araştırma umutsuz
savaşı kazandırsaydı ordu büyüklüğü anlamını yitirir, oyun "kim çok araştırdı"ya inerdi.
Tavanı artık bu uç bağlıyor — test tavanı 2 kademe yükseltip bu oranın gerçekten
büyüdüğünü görerek "tavan gereksiz bir kısıtlama değil" diyor.

### Tam teçhizat sağlıklı

Herkes her şeyi araştırdığında eşit para matrisinde üçgen hâlâ dönüyor (her birim en az
bir eşleşme kazanıyor, en az bir eşleşme kaybediyor) ve bedel başına değer sapması
**%9 → %11**. Araştırma dengeyi KAYDIRIYOR ama ÇÖKERTMİYOR.

### ⚠ 2026-08-08'İN BİÇİM DEĞİŞİKLİĞİ DÖRT YERDE SESSİZCE KANAMIŞ

§3.7 tablosunun satır biçimi o gün değişti (5. alan artık kalan-kuvvet sayısı değil,
beklenen kazananın adı) ama **dört çağrı yeri eski biçimde kaldı.** Hepsi
`sayı > 'saldiran'` karşılaştırması yapıp sessizce `false` üretiyordu:

| Yer | Sonucu |
|---|---|
| `muharebe-referans.js` rapor özeti | üç yorum da 0/15, rapor "model gözden geçirilmeli" diye bitiyordu |
| `arastirma-olcum.js` özel dal ölçümü | tavan hep Sv.0 → **"TAVAN ÖLÇÜLEN SINIRI AŞIYOR" yanlış alarmı** |
| `moral-olcum.js` (iki yerde) | beş modelin beşi de "15/15 ✓", ayrıca bugünkü oyun bile 5 satırda "kazanan ters döndü" |
| `testler/arastirma.test.js` simetri testi | her satır "kıl payı" sayılıp atlanıyordu — **yeşil yanan boş bir test** |

Hiçbirini test yakalamamıştı, çünkü üçü rapor üreten kod ve dördüncüsü testin kendisiydi.
Kural: **§3.7 satırının biçimini okuyan tek yer `muharebe-referans.js beklenenBant`.**
Artık dışa açık ve üç betik de oradan geçiyor.

### Yenilenen ölçümler

`arastirma-olcum` · `delicilik-olcum` · `denge-mimarisi` · `muharebe-referans` ·
`savas-dokumu` · `moral-olcum` · `sans-olcum` · `garnizon-olcum` · `cikmaz-olcum` ·
`diplomasi-olcum` · `karakter-olcum` · `mod-esik-olcum` · `bitirme-olcum` · `zeka-olcum` ·
`zeka-butce-olcum` · `denge-simulasyonu`

### Araştırmanın DOKUNMADIĞI tek muharebe mekaniği

Stat dalları hasara, zırha, bozgun zamanlamasına ve yaralı sayısına giriyor; özel dallar
baraja, araziye, toplanmaya ve çekilmeye. **Bozgun eşiğinin kendisi** (ilin moral statı +
durum kalemleri) araştırmadan hiç etkilenmiyor — oraya dokunan bir dal yok. İstenirse yeni
bir dal gerekir; **Baki'ye soruldu, kendiliğinden eklenmedi.**

## ÖZEL DAL FİYATI VE GÜCÜ + SONSUZ DÖNGÜ (2026-08-12, aynı gün ikinci tur)

Baki'ye üç karar sunuldu, üçü de cevaplandı.

| Soru | Cevap | Yapılan |
|---|---|---|
| Bozgun eşiğine araştırma dalı eklensin mi | **Dursun, dokunma** | değişiklik yok |
| Özel dallar aynı fiyata çok farklı güçte | **"60 çok fazla, 18'e çıkaralım hepsini ve hepsini %50 seviyesine yaklaştır"** | `OZEL_MALIYET 12 → 18`, `BARAJ_ON_VURUS 0.69 → 0.20` |
| Bozgun tabanı 0.40 → 0.60 olsun mu | **0.40 kalsın** | değişiklik yok |

### Baraj %95 → %55: iki cümle aynı anda tutmuyordu

`BARAJ_ON_VURUS` 2026-08-08'den beri tek bir cümlenin çözümüydü: *"1 topçu, 1 piyadeyi
savaşın başında yarı dayanıklılığa indirsin."* Etkinlik eğrisi her değiştiğinde yeniden
çözülüyordu (0.80 → 3.25 → 0.80 → 0.69).

Ölçüm o ayarda barajın **yakın kaybedilen savaşların %95'ini** çevirdiğini gösterdi —
18 puanlık bir dal, 360 puanlık stat dalı kadar iş yapıyordu. "Yarı can" ile "%50 seviyesi"
aynı anda tutmuyor; **yeni ve açık olan istek seçildi, eski cümle bilerek terk edildi.**

Ön vuruş oranı → yakın kaybedilen savaşı çevirme:

| oran | 0.69 | 0.40 | 0.30 | 0.25 | **0.20** | 0.15 |
|---|---|---|---|---|---|---|
| çevirme | %95 | %84 | %71 | %64 | **%55** | %45 |

Somut karşılığı: 1 topçunun barajı 1 piyadeyi yarı cana değil, canının yaklaşık yedide
birine kadar götürüyor. Hâlâ karşılıksız bir atış, artık tek başına savaş kazanmıyor.

### ⚠ PALETİN TAVANI ÖLÇÜLDÜ: %50'ye ÇIKAMAZ, ÇÜNKÜ ÖLÇÜ YANLIŞTI

Palet için de bir sayı düşürmek/yükseltmek denendi ve **tavanı %30 çıktı**:

| telafi | üç arazi ortalaması |
|---|---|
| 1.0 / 0.8 (bugün) | %27 |
| 1.0 / 1.0 (tam telafi) | %30 ← matematiksel tavan |
| ova dahil tam telafi | %30 (ovada ceza yok, verecek şey yok) |

Sebep dalın zayıflığı değil, **ÖLÇÜNÜN KENDİSİ**: palet ovada tanım gereği hiçbir şey
yapmıyor (%0) ve tarama üç araziyi eşit ağırlıkla geziyor. Dalın çalıştığı yerde ölçülünce:

| Dal | Üç arazi | **Çalıştığı arazide** |
|---|---|---|
| Baraj ateşi | %55 | **%55** (her arazide çalışır) |
| Paletli üstünlük | %27 | **%43** (tepelik + dağlık) |

Yani palet zaten hedefteydi; görünmeyen şey ölçünün ova ile seyreltmesiydi. `PALET_TELAFI`
DEĞİŞMEDİ — dağlığı 1.0 yapmak üç puan uğruna Baki'nin "dağlık için bitmeye yakın"
cümlesini bozardı. Rapor artık iki sütunu birden yazıyor.

**Dört daldan yalnızca ikisi bu eksende ölçülebiliyor.** Seferberlik ve yarma muharebenin
KAZANANINI değiştirmiyor: biri savaştan önceki bütçeye, öteki savaştan sonraki sonuca
dokunuyor. Bu eksende %0 çıkmaları zayıflık değil, kapsam farkı.

### ⚠ `mod-esik-olcum.js` 2026-08-08'DEN BERİ SONSUZ DÖNGÜDEYDİ

Görev 13'te Fetih ve %50 Hâkimiyet **sınırsız** oldu ve `modTurSiniri` `Infinity` dönmeye
başladı. Betik onu doğrudan döngü sınırı yapıyordu: `for (t = 1; t <= Infinity; t++)`.
Dört gündür hiç bitmiyordu; 2026-08-12'de **61 dakika** koşarken yakalandı ve durduruldu.

Çözüm: sınırsız modda ölçüm bir UFUKLA yapılıyor ve ufuk uydurulmuyor — modun kendi
`TABAN + PARCA_BASINA × parça` formülünden geliyor (turkiye 150, karadeniz 32 tur), yani
modun tasarlandığı tempo. Betik artık **62 saniyede** bitiyor. Tur maliyeti ~100 ms ve
oyun ilerledikçe DÜŞÜYOR (aktörler eleniyor) — yani hiçbir zaman yavaş değildi, sonsuzdu.

Aynı taramada `zeka.js`'in iki alanı da kontrol edildi: yanlış alarm, temiz.

### ⚠ İKİ RAPOR DAHA YALAN SÖYLÜYORDU (aynı gün, `savas-dokumu.md`)

**1. Özet tablosunun sayıları ELLE YAZILIYDI.** `| Baraj ateşi | ... | 3T → 2Z ovada
%0 → %98 |` satırı sabitti. Baraj 0.69'dan 0.20'ye inince üst tablo `%5 → %38` derken
özet hâlâ `%0 → %98` diyordu. Artık her dalın "en büyük etkisi" ölçümden türetiliyor.

**2. Zırh dalının eşleşmeleri baştan KARARLIYDI.** Seçilen üç satır dalsız hâlde
%0.0 · %99.3 · %98.3 veriyordu — böyle bir satırda dal ne yaparsa yapsın sonuç kıpırdamaz.
Tablo "zırh dalı hiçbir işe yaramıyor" diye okunuyordu. Betik bu tuzağı 2026-08-08'de
TOPÇU dalı için not etmiş ama piyade satırını düzeltmemişti. Yakın eşleşmelerle ölçülünce:

| Eşleşme | Dalsız | Dallı |
|---|---|---|
| 6P → 6P (ova) | %49.5 | **%16.3** |
| 3T → 3P (dağlık) | %48.5 | **%17.3** |
| 6P → 5P (dağlık) | %86.3 | **%52.0** |

Kural kondu: **dalsız oranı %25–%92 bandında olmayan eşleşme bu tabloya girmez.**

**Sonuç: raporun ana iddiası çürüdü.** "Otuz kat pahalı olan dal yüz kat daha az iş
yapıyor" cümlesi `ARTIS` %8–10 iken doğruydu; %20'ye çıkınca geçersizleşti ama metin
kalmıştı. Ölçülen gerçek: stat dalları Sv.3'te **30–55 puan** çeviriyor.

| Dal | Bedel | En büyük etkisi |
|---|---|---|
| Baraj ateşi | 18 puan | 3T → 2Z ovada %5 → %38 |
| Paletli üstünlük | 18 puan | 3Z → 4P dağlıkta %0 → %100 |
| Zırh Sv.3 (piyade) | 360 puan | 6P → 5P dağlıkta %86 → %52 |
| Ağır vuruş Sv.3 (topçu) | 360 puan | 3T → 2Z tepelikte %44 → %99 |

Kalan fark kimlik farkı: stat dalı o birimin girdiği HER savaşa yayılıyor, özel dal
yalnızca kendi koşulunda çalışıyor (baraj topçu ister, palet engebeli arazi ister).

Ayrıca raporda bozuk Türkçe üretiliyordu ("ovata", "tepelikta") — bulunma hâli ekleri
üçünde üç farklı olduğu için artık tablodan okunuyor.

## SİLAHLANMA YARIŞI KIRILDI (2026-08-12, üçüncü tur)

> Baki: *"İller yakınındaki bir il asker bastığında o basıyor, diğeri basıyor, döngüye
> giriyorlar; 100–200 askere kadar devam ediyorlar. Bazı parça sayısı az iller oyun
> sonlarına doğru yapsa anlarım ama oyun başı için kesinlikle azaltılsın. Fırsat bulununca
> fetihler yapılsın, fırsatlar yaratılsın. Oyunun modlarına göre simülasyonlar falan yap."*

### Şikâyet ölçüldü, birebir doğruydu

Orta zorluk, 60 tur: en büyük yığın **10 → 258** birim, ortalama ordu 3 → 39, toplam
538 → 5648. `DURUM-RAPORU` §7a'daki "dünya kilitleniyor" sorunu bunun diğer yüzüydü.

### Sebep tahmin edilen yerde DEĞİLDİ

İlk hipotez "umutsuz saldırı kapısı fazla katı, kazanılabilir saldırıları da eliyor"du.
Ölçüm çürüttü: elenen saldırıların **%97.6'sı gerçekten kaybediyor**. Kapı haklıydı.

Taranan diğer şüpheliler de temiz çıktı: kuvvet yoğunlaşması zaten var (ordunun **%89'u
tek yığında**), komşu çiftlerin **%42'si** savaşta.

Sebep `zeka.js uretimKarari`'ndaki bir EKSİKTİ: **"yeterince askerim var mı?" diye hiç
sormuyordu.** Bütçenin `URETIM_PAYI` kadarı her tur, koşulsuz orduya gidiyordu. İki komşu
da aynı kuralı işletince aradaki ORAN hiç değişmiyor — kimse saldıramıyor, ikisi de
basmaya devam ediyor. Saldırı adaylarının %63–82'si eleniyor, **%1–4'ü geçiyordu**.

### Çözüm iki denemede oturdu

**1. deneme — tehdit TOPLAM olarak ölçüldü: hiç çalışmadı.** Toplam ordu 5648'den 5648'e.
8 komşulu bir aktörün "toplam tehdidi" ~300 çıkıyor, kendi ordusu 39; koşul asla
sağlanmıyor. Üstelik ölçü SİMETRİK ŞİŞİYOR — o sekiz komşunun her biri de beni kendi
tehdidine ekliyor, herkes kendini kuşatılmış sanıyor.

**2. deneme — tehdit EN GÜÇLÜ TEK YIĞIN:** yığın 258 → 131. Ama büyüme durmadı: oran
tabanlı tavanı iki taraf da uygulayınca geri besleme doğuyor (A, B'nin 1.2 katına; B
geride kaldı, A'nın 1.2 katına…). **Oranın çıpası yok.**

**Çalışan hâli iki çıpalı:**

    tavan = max(4, min(1.2 × en güçlü komşu yığını, 8 × parça sayısı))

Toprak çıpası Baki'nin cümlesini kodluyor: 3 parçalı ilin 100 askeri saçma, 20 parçalının
normal. **Sınır TOPLAMA konuyor, üstünlük YOĞUNLAŞMAYLA kuruluyor** — "fırsat yaratmak"
buradan çıkıyor: toplamda 1.2 kat olan aktör ordusunun %89'unu tek cepheye yığıp orada
3 kata çıkabiliyor, fetih için gereken oran o.

| Ölçü (orta, 60. tur) | Önce | Sonra |
|---|---|---|
| En büyük yığın | 258 | **24** |
| 10. turda | 45 | **15** |
| Ortalama ordu | 39 | **6.4** |
| Toplam fetih | 241 | **513** |
| Kalan sahip (81'den) | 59 | **48** |

### ⚠ ZAMANLA GEVŞEYEN TAVAN DENENDİ, BAKİ GERİ ALDI

Cümlenin ikinci yarısı (*"oyun sonlarına doğru yapsa anlarım"*) için tavan 6 → 18
gevşetildi. Kazanç küçük (orta: 48 → 44 sahip), bedel büyük: **kolay kademede zirve yığın
21 → 59**. Sebebi, kolayda yapay zekânın neredeyse hiç saldırmaması (60 turda 41 fetih) —
ordular savaşta erimediği için takvim gevşedikçe boş yere birikiyor. Üç seçenek ölçümle
sunuldu, Baki **sabit tavanı** seçti.

### Yeni ölçüm: `veri/mod-simulasyon.md`

Üç mod × üç zorluk × iki tohum. Hiçbir yapay zekâ Fetih (181/181) ya da %50 (91/181)
eşiğine ulaşmıyor **ama bu artık kilit değil**: dünya 81 sahipten 15–22'ye iniyor, zor
kademede 150 turda ~3900 parça el değiştiriyor. Harita bölgesel güçlere bölünüyor.

⚠ Betiğin ilk sürümü Güç Yarışı satırlarına "—" yazıyordu ve "hedefe ulaşılamadı" diye
okunuyordu; oysa o modda **eşik yok**, süre dolunca sıralamaya bakılıyor. Düzeltildi.

## CESARET: ÜÇ KAPI (2026-08-12, dördüncü tur)

> Baki: *"Yapay zekâların cesareti de biraz artsın ama aptallığa çok kaymasın; oyunu daha
> hızlı bitirmeye yöneltecek veya ellerinde güç varken acımayacak yapılar ekleyelim."*

### ⚠ CESARETİ KÖRLEMESİNE ARTIRMAK APTALLIKTIR — VE BUNUN SAYISI VAR

`UMUTSUZ_SALDIRI.TABAN`'ı düşürmek akla ilk gelen çözümdü ve **yanlıştı**: ölçüm kapının
elediği saldırıların **%96'sının gerçekten kaybettiğini** gösteriyor. Eşiği indirmek
orduları bile bile eritmek olurdu. Cesaret bu yüzden üç ayrı kapıdan artırıldı; üçü de
"kaybedilecek savaşa girme" kuralını bozmuyor.

### 1. Kapı artık "kazanıyor muyum" diye de soruyor

`hamleUstunlugu` yalnızca `ustunluk` döndürüyor, `muharebeTahmini`'nin verdiği `kazanan`
sessizce atılıyordu. Fark önemsiz değil: **bozguna uğrayan savunan birlikleriyle çekiliyor**,
yani parçayı ALDIĞIN hâlde üstünlüğün eşiğin altında kalabiliyor. Ölçüm kapının her tur
**~35 kazanılabilir saldırıyı** reddettiğini gösterdi (elenenlerin %3.7–4.2'si).

Yeni `hamleKestirimi` ikisini birden döndürüyor; `hamleUstunlugu` eski imzasıyla duruyor
(testler onu düz sayı olarak çağırıyor).

### 2. Elinde güç varken acıma — ezici üstünlükte dürtü

Adayların **%15–28'i** ezici üstünlükte (≥ `MUHAREBE.USTUNLUK_ESIGI`) ama kaynak başına tek
emir kuralı yüzünden bazen sıradan bir takviyeye yeniliyorlardı. `CESARET.EZICI_DURTU`
(0.8, `TERIM.SALDIRI` ile aynı büyüklük sınıfı) o hamleleri sıralamada öne alıyor ve
**bitirme iştahıyla çarpılıyor** — maç ilerledikçe acımasızlık artıyor.

Eşik uydurulmadı: zekânın "ezici" dediği sayı, savaş odasında oyuncuya **ÜSTÜN** yazan
sayının ta kendisi.

### 3. Umutsuz eşiği maç ilerledikçe düşüyor

`CESARET.ESIK_SONUMU` 0.3 → bitirme iştahı dolduğunda eşik %30 iniyor. Erken oyunda etkisi
**yok** (iştah 0), yani açılıştaki temkin bozulmuyor. "Oyunu daha hızlı bitirmeye yöneltecek
yapı" isteğinin karşılığı bu.

### Ölçüm: cesaret arttı, akıl yerinde kaldı

Aynı tohum, 40 tur, savunulan parçaya verilen saldırı emirleri:

| | Cesaretsiz | Cesaretli |
|---|---|---|
| Saldırı emri | 404 | **857** (+%112) |
| Kazanacağı tahmin edilen | %100 | **%99.6** |
| **Kaybedeceği tahmin edilen** | %0 | **%0.4** ← aptallık ölçüsü |
| Ortalama üstünlük | 0.968 | 0.972 |

**Saldırı sayısı ikiye katlandı, kalitesi düşmedi.** Cesaret, kötü savaşlara girerek değil,
iyi fırsatları kaçırmayarak arttı.

Maç akışı (orta, 60 tur), üretim freni sonrasına göre:

| | Fren sonrası | + Cesaret |
|---|---|---|
| Toplam fetih | 513 | **925** |
| Son 20 turda fetih | 296 | **455** |
| Kalan sahip (81'den) | 48 | **36** |
| En büyük yığın | 24 | **16** |

Ordular daha da küçüldü çünkü artık **depolanmıyor, kullanılıyor**.

## İTTİFAK + ÜÇ ARAYÜZ DÜZELTMESİ (2026-08-12, beşinci tur)

> Baki: *"Yapay zekâ ittifakları yapılmıyor ve oyuncu istek attığında da genelde
> reddediyorlar bu düzeltilmeli. Diplomasi ekranında dünya yerine ülke yaz. Ana menüde
> ayarlarda savaş gösterisi yeri gereksiz. Diplomaside ekranı aşağı indirirken sağdaki
> çubuk hareket edince gelirlerin üstüne geliyor."*

### 1. İttifak — sebep tahmin edilen yerde DEĞİLDİ

İlk hipotez: "komşu cezaları oyuncuyu vuruyor". **Ölçüm çürüttü.** Puan ayrıştırması
(20. tur, orta, oyuncuya teklif veren 19 geçerli hedef):

| Terim | Ortalama katkı | Kaç hedefte ateşliyor |
|---|---|---|
| ORTAK_DUSMAN | +0.025 | **2 / 19** |
| CEPHE_YUKU | +0.270 | 17 / 19 |
| ZAYIF_KOMSU | −0.084 | 2 / 19 |
| KOMSU | −0.070 | 2 / 19 |
| **TOPLAM** | **0.141** | eşik **0.70** |

Cezalar 19 hedeften ikisini etkiliyor — sorun onlar değil. Sorun **olumlu terimlerin hiç
ateşlememesi**: formül ittifakı tek gerekçeye bağlamış ("ortak düşman") ve 81 aktörlük bir
haritada iki devletin ortak düşmanı nadiren oluyor.

⚠ **BU HATA BİR KEZ DAHA YAŞANDI VE ÇÖZÜMÜ ZATEN KAYITLIYDI.** Savaş ilanı formülünde de
bütün terimler durumsaldı, hiçbiri ateşlemiyordu, dünya kilitlenmişti;
`ILAN.FAYDA.GENISLEME` (temel iştah) eklenerek çözülmüştü. İttifak tarafı o dersi hiç
almamış. `FAYDA.TEMEL` onun ittifaktaki karşılığı ve **temkinle** çarpılıyor —
`GENISLEME`'nin açgözlülükle çarpılmasının simetriği.

**⚠ DENENDİ, ÖLÇÜLDÜ, GERİ ALINDI — terim 0 (kapalı).** Tarama şunu gösterdi:

| TEMEL | oyuncu kabul/geçerli | ittifaklı/canlı | 60 turda fetih |
|---|---|---|---|
| 0 (önce) | **0/11** | 23/61 | 925 |
| 0.5 | 3/13 | 32/55 | 899 |
| **0.70** | **4/13** | 37/56 | **900** |
| 0.9 | 6/10 | 48/58 (%83) | — |

0.9 ve üstü Görev 09'un tam da engellediği doygunluğu üretiyor. 0.70'te oyuncunun kabul
oranı ~1/3: teklif kumar olmaktan çıkıyor ama "herkes evet der"e de dönmüyor.

⚠ **DÜNYA DONMUYOR — ayrıca ölçüldü**: fetih 925 → 900, kalan sahip 36 → 36. Görev 09'daki
doygunluk korkusu O GÜNKÜ PASİF dünyaya aitti; aynı gün eklenen üretim freni ve cesaret
sayesinde saldırgan yapay zekâ müttefiği olmayanla savaşmaya devam ediyor.

### 2. Diplomasi ekranı: "DÜNYA" → "ÜLKE"

Harita 81 ille Türkiye, bir dünya değil. Sekme adı ve iki boş-liste metni değişti.
Veri alanının adı (`dunya`, `diplomasiDunyasi`) bilerek DEĞİŞMEDİ — kancadan
`oyun/diplomasi.js`'e uzanıyor ve oyuncunun görmediği bir şey için oyun katmanına
dokunmak olurdu. Uyumsuzluk bileşenin başında yazılı, sessiz değil.

### 3. Kaydırma çubuğu gelirin üstüne biniyordu

`dosyaIc.paddingRight` **2 → 12** (`BOSLUK.orta`). GÜÇ SIRALAMASI'nın en sağdaki sütunu
GELİR ve çubuk belirdiği anda üstüne biniyordu. Çubuk Android'de ~4–6 dp, iOS'ta ~3 dp
artı kenar payı; 12 ikisini de temizliyor ve **telefon/tablet ayrımı gerektirmiyor** —
çubuk genişliği ekran boyutuyla değişmiyor.

⚠ Çubuğu gizlemek çözüm değildi: liste 81 devlete kadar uzuyor ve oyuncunun nerede
olduğunu gösteren tek işaret o. Kaldırmak sorunu değil belirtiyi silerdi.

### 4. Ana menü ayarları inceldi

**Savaş gösterisi** maç içi ayarlara taşındı: kapsamı ancak gösteriyi İZLERKEN
yargılıyorsun, ana menüde görmediğin bir şeyi ayarlıyordun. Ayarın kendisi yine cihaz
tercihi, kayda girmiyor — yalnızca düğmesi taşındı.

**SES satırı kaldırıldı**: *"hazır olduğunda buradan açacaksın"* diyordu ve 2026-08-12
kararından sonra bu bir YALAN. Verilmeyecek bir söz, çalışmayan düğmeden kötüdür.
Ana menü ayarlarında artık yalnızca titreşim ve lisans satırı var.

#### ⚠ TEMEL TERİMİ NEDEN KAPALI BIRAKILDI

Yukarıdaki tablo `orta` kademede ölçülmüştü. Doygunluk testi `zor` kademede koşuyor ve
oradaki tablo bambaşka çıktı:

| TEMEL | oyuncu kabul/geçerli (zor, 30t) | ittifaklı/canlı |
|---|---|---|
| 0 | 0/18 | 11/26 ✓ |
| 0.2 | **0/17** | 14/35 ✓ |
| 0.3 | **0/18** | 16/29 ✗ |
| 0.4 | **0/17** | 11/29 ✓ |
| 0.5 | **0/17** | 11/29 ✓ |

**Zor kademede terim oyuncuya HİÇ yaramıyor.** Sebebi `temkin` ile çarpılması: zor
kademede kişilikler saldırgan üretiliyor, temkin ≈ 0, terim ölü. Yani tam da ittifak
isteyen oyuncunun karşısına çıkan aktörlerde susuyor.

Üstelik oran %50 çizgisinin dibinde ve GÜRÜLTÜLÜ — üç tohumda 0.3 için 16/29 ✗, 11/32 ✓,
10/30 ✓. Hangi değerin `DOYGUNLUK` testini geçeceği tohuma kalıyor. Böyle bir ayar çözüm
değil, kumar.

**Terim silinmedi, 0'a çekildi**: bulgu ve ölçüm kaybolmasın. Baki'nin şikâyeti gerçek —
oyuncu 19 geçerli hedeften 0–1'inden kabul alıyor — ama çaresi bu kol değil. Muhtemel
doğru kol: *"gelen teklifi değerlendirmek, kendi sırasını harcayıp teklif vermekten
UCUZDUR"* ayrımı, yani kabul eşiğinin teklif eşiğinden düşük olması. Bu ayrı bir tasarım
kararı ve **Baki'ye soruldu**.

### KABUL EŞİĞİ TEKLİF EŞİĞİNDEN AYRILDI (2026-08-12, Baki'nin onayıyla)

Tek eşik iki ayrı soruyu cevaplıyordu:

- *"Kendi diplomasi sıramı harcayıp buna teklif eder miyim?"* → pahalı karar
- *"Önüme gelmiş teklife evet der miyim?"* → ucuz karar (sıra harcanmıyor, fırsat maliyeti
  yok, karşı taraf zaten istekli olduğunu göstermiş)

`kabulEsigi = ittifakEsigi × (1 − KABUL_INDIRIMI)`, indirim **0.30**.

⚠ **TARAFSIZ KURAL, OYUNCUYA KAYIRMA DEĞİL**: yapay zekâlar birbirinin teklifini de bu
eşikle değerlendiriyor. Oyuncunun kazancı ayrıcalıktan değil, TEKLİF EDEN taraf olmasından
geliyor (§9/tuzak 5).

| indirim | oyuncu kabul/geçerli (orta, 10./30. tur) | doygunluk (zor, 3 tohum) |
|---|---|---|
| 0 | 0/17 · 0/11 | ✓✓✓ |
| **0.30** | **1/20 · 1/15** | **✓✓✓** |
| 0.40 | 2/21 · 2/18 | ✓✓✗ |
| 0.50 | 2/18 · 3/16 | ✗✓✗ |

0.30 seçildi çünkü üç tohumda da doygunluk testini geçen en yüksek değer.

**⚠ BU KISMİ BİR DÜZELTME.** Oyuncunun kabul oranı 0'dan 1–2'ye çıktı; "genelde
reddediyorlar" şikâyeti tamamen kalkmadı. Ölçüm asıl eksiği gösteriyor: formülde
**"bu iyi bir ortak mı"** diye bir terim YOK. `ZAYIF_KOMSU: −1.2` zayıf komşuyu
cezalandırıyor ama güçlü komşuyu ödüllendiren simetriği hiç yazılmamış — oysa gerçek
diplomaside yiyemeyeceğin komşuyla anlaşırsın. Sıradaki aday terim bu; Baki'ye sorulacak.

---

## LOGO LACİVERTİ + BELGE DENETİMİ (2026-08-16)

### 1. Logonun laciverti matlaştırıldı ve açıldı

> Baki: *"Logodaki laciverti bir tık daha matlaştır ama koyuluğunu azalt."*

İki ayrı eksen, karıştırılmaması gerekiyordu: **mat olmak** doygunluğun düşmesi,
**açılmak** parlaklığın artması. Mavinin tonuna (209°) hiç dokunulmadı.

| | Önce | Sonra | Doygunluk | Parlaklık |
|---|---|---|---|---|
| taban (`ZEMIN_UST`) | `#29435C` | **`#3B5268`** | %38 → %28 | %26 → %32 |
| çukur (`ZEMIN_ALT`) | `#203448` | **`#304355`** | %38 → %28 | %20 → %26 |

Üst–alt arasındaki 6 puanlık fark korundu, yani geçişin derinliği aynı kaldı; yalnızca
kütle açıldı. Okunurluk önden kontrol edildi: beyaz yazı **7.5:1** (sınır 4.5), harita
silueti **4.2:1** (metin dışı sınır 3) — ikisi de rahat geçiyor.

**Üretilenler** (`onizleme/ikon.html` → `varyantUret()` → POST /kaydet): `icon.png`,
`android-icon-foreground/background/monochrome.png`, `splash-icon.png`, `favicon.png`.
Tuvalden okunan kontrol değerleri: üst köşe `#3a5167`, alt köşe `#304355`, orta `#354a5e`
(dikey geçiş beklendiği gibi).

⚠ **BU DEĞERLER ARTIK `src/tema.js` İLE BİREBİR DEĞİL.** İkon renkleri Görev 10A'da
"oyunun kendi jetonlarından" alınmıştı; bu tur yalnızca ikona uygulandı. Oyun ekranındaki
`ZEMIN` hâlâ eski koyu hâlinde — **bekleyen karar**, Baki'ye soruldu. Açılış zemini
(`app.json` `#1B2A38`) logodan koyu olduğu için splash karesinin kenarı hafif seçiliyor;
o da aynı kararın parçası.

### 2. Belge denetimi — "bugünü anlatan" dosyalar taze değildi

Baki: *"Tüm dosyaların güncelliğini incele ve düzelt."* Denetimin ayrımı şu oldu:
**görev raporları ve bu günlük TARİH KAYDIDIR, eskimeleri normaldir** (Görev 05'in
raporunda 249 test yazması hâlâ doğrudur). Düzeltilenler yalnızca *bugünü anlatma
iddiasındaki* dosyalar.

| Dosya | Eskimiş olan |
|---|---|
| `CLAUDE.md` | `kontrol` "dört bölüm" (altı) · `src/para` ve `onizleme/` haritada yok · `Oswald_600SemiBold` örneği · "geliştirici modu yayında false olacak" (zaten false) · **"Baki 18 yaşın altında"** (19) · başlık tekil |
| `docs/DURUM-RAPORU.md` | **On madde** — baştan yazıldı, listesi belgenin §11'inde |
| `docs/YAYIN-KONTROL.md` | Yazı tipi atfı ⚠ (kapanmış) + Oswald/Barlow adları · ikon tarifi (%60, Oswald 700, amber "İL") · açılış zemin renkleri |
| `docs/il-savasi-tasarim.md` | §8.1: "Yarım Fetih" adı, 150/70 tur sınırları, "%69'da kilitleniyor" |
| `src/tema.js` | Yeni font notunun ÜSTÜNDE eski Oswald/Barlow tarifi duruyordu (ikisi çelişiyordu) |
| `src/App.js` | "Palet A askeri tema" — o ad Görev 10A'da düştü |
| `scripts/onizleme-uret.js`, `scripts/parca-onizleme-uret.js` | Ürettikleri sayfaların başlığı "İl Savaşı" (tekil) |

**Yeni kural doğdu — CLAUDE.md §5'e iki madde eklendi:** (8) ses aranmaz/sorulmaz, kalıcı
iptal; (9) oyunun adı **İL SAVAŞLARI**, tekil yazım yanlış.

### 3. Kırık bağ bulundu ve onarıldı

Üç kod yorumu **var olmayan** bir dosyaya işaret ediyordu: `veri/silahlanma-olcum.md`
(`src/denge.js` ×2, `src/oyun/zeka.js` ×1). Ölçüm hiç ayrı dosyaya yazılmamış, bu günlüğün
2026-08-12 girdisinde duruyor; atıflar oraya çevrildi.

Sonra bütün proje bu gözle taradı — `veri/*.md`, `docs/*.md`, `src/**.js`, `scripts/*.js`,
`testler/*.js` atıfları gerçek dosya listesiyle karşılaştırıldı. **Kalan kırık bağ yok**
ve `veri/*.md` iki yönlü tam örtüşüyor: her ölçüm dosyasına en az bir atıf var, her atıf
gerçek bir dosyaya gidiyor (yani ne yetim ölçüm ne hayalet atıf kaldı).

Kalan üç uyuşmazlık **kasıtlı**: `GOREV-XX-RAPOR.md` bir kalıp adı, `KatmanIzleyici.js` ve
`parca-kenarlari-uret.js` ise günlüğün kendi içinde "eklendi… sonra kaldırıldı" diye
kayıtlı — tarih kaydı olarak duruyorlar.

### 4. Bu girdinin kapatmadığı boşluk

Günlük **2026-08-12'de duruyordu**; 13 ve 16 Ağustos'ta yapılan işler (reklam altyapısı,
yayın denetimi, ses iptali, font sistemi, ikon üretimi) buraya hiç yazılmamış. O günlerin
girdisi **uydurulmadı** — ne yapıldığı dosya yorumlarında ve `docs/YAYIN-KONTROL.md`'de
duruyor, ama günlük sırası eksik. Görev 11/12/13 raporlarının borcuyla birlikte kapatılmalı
(`docs/DURUM-RAPORU.md` §7e).

**Kontrol:** `npm run kontrol` altı bölümde temiz, **659 test** geçiyor.

---

## GÖREV 15 — ANINDA ÇÖZÜM (2026-09-19)

> Baki: *"Emirler verildiği turlarda işlenecekler… orası benim olmuş sayılır ve askerlerim
> oraya transfer olurlar."* Belge: `docs/GOREV-15-aninda-cozum.md`.

Beş adım bitti: hamle hakkı defteri (`src/oyun/hamle.js`) · anında çözüm (`hamleUygula`,
emir kuyruğunun kaldırılması, kayıt sürümü **17**) · sıra düzeni (önce insanlar, sonra
botlar) · ekran (emir listesi → **tur günlüğü**, saldırı onayı, hamle hakkı notu, gösterinin
hamlede oynaması) · ölçüm.

Hamle hakkı artık **türe göre**: piyade 1 · topçu 1 · zırhlı 2 (`DENGE.HAREKET.HAMLE_HAKKI`).
Görev 11'in "her birliğin iki hamlesi" kuralı böylece değişti; ikinci hamle zincir emriyle
değil, birliğin **fiilen vardığı** parçadan veriliyor.

### Veri üreten betikler koşturuldu

`node scripts/denge-simulasyonu.js` · `node scripts/mod-simulasyon.js`
→ `veri/denge-simulasyonu.md`, `veri/mod-simulasyon.md` yenilendi.

### ⚠ BİR ÖLÇÜM ARACI SESSİZCE KÖRLEŞMİŞ

`denge-simulasyonu.js` altı koşusunda da **4/181** veriyordu (yani hiçbir fetih yok) ama
tablo dolu görünüyordu. İki sebep, ikisi de Görev 15'ten ÖNCE oluşmuş:

1. Betik savaş ilan etmiyordu; Görev 11'den beri (2026-08-03) barıştakine saldırılamıyor,
   yani `hedefleriAyir` hiç düşman hedef döndürmüyordu.
2. Üretim "en çok sanayi hakkı kalan" parçaya yapılıyordu — Bursa'da o parça **16-1**, yani
   düşman komşusu olmayan iç parça. Ordu orada birikiyor, sınır parçaları 1–2 birimle
   kalıyor, betiğin saldırı şartı hiç sağlanmıyordu.

İkisi de düzeltildi (ölçüm oyuncusu herkesle savaşta başlıyor · üretim cephedeki parçaya
yapılıyor). Yeni sonuç: sınırsız bütçeyle 15 turda **18/181**, gerçek gelirle 4–12/181.
**Ders:** bütün satırların aynı çıkması "değişmedi" değil, "ölçülmüyor" demek olabilir.

### Bot dünyası — önce / sonra (`mod-simulasyon.md`, 3 mod × 3 zorluk × 2 tohum)

| Mod · Zorluk | El değiştiren parça (2026-08-13) | (2026-09-19) | Değişim |
|---|---|---|---|
| Fetih · kolay | 861.0 | **408.5** | −53% |
| Fetih · orta | 3765.0 | **3009.0** | −20% |
| Fetih · zor | 4164.0 | **3475.0** | −17% |
| %50 · orta | 1305.0 | **1097.0** | −16% |
| Güç Yarışı · zor | 1148.5 | **1125.5** | −2% |

Dünya yavaşladı ama **kilitlenmedi** — 2026-08-12'de kırılan kilidin geri gelme riski
gerçekleşmedi. Yavaşlama en çok kolay kademede, en az zorda: istenen yön bu. Konsolidasyon
azalmadı, arttı (Fetih/orta'da kalan sahip 17–19 → **15–17**): daha az el değiştirmeyle
aynı sonuç, yani gidip gelen cephe azaldı. Zirve yığınlar 19.5–27.5 bandından 21–25'e
geldi, silahlanma yarışı geri gelmedi.

**Zorluk kademelerine dokunulmadı ve bu bilinçli:** oyuncunun ilk vuruş avantajı ancak bir
insan maçıyla ölçülür; aynı maç `SANIYE_PER_TUR = 45` borcunu da kapatıyor.

**Kontrol:** `npm run kontrol` altı bölümde temiz, **676 test** geçiyor.


---

## 2026-09-20 — `komutan-olcum.js` (Görev 16 / Adım 7)

Yeni betik: `node scripts/komutan-olcum.js` → `veri/komutan-olcum.md`.
5 tohum × 40 tur, zorluk **zor**, `DENGE.KOMUTAN.ACIK` kapalı/açık karşılaştırması.

| | Canlı aktör | En büyük aktör | Sahadaki birlik | En büyük yığın |
|---|---|---|---|---|
| Komutan KAPALI | 28.2 | 17.6 | 281.8 | 13.2 |
| Komutan AÇIK | 27.8 | **20.4** | 259.0 | 14.4 |
| fark | −1.4% | **+15.9%** | −8.1% | +9.1% |

**Okuma:** komutan savaşları daha KESİN yapıyor (sahada %8 daha az birlik kalıyor) ve
lideri belirgin biçimde büyütüyor (**+%16**). Dünya kilitlenmiyor: 40. turda hâlâ ~28 aktör
yaşıyor ve en büyüğü haritanın yalnızca %11'ini (20/181) tutuyor. Zirve yığın 13.2 → 14.4,
yani 2026-08-12'de kırılan silahlanma yarışının (258'lik yığınlar) yakınından geçmiyor.

⚠ **+%16 bir kartopu işareti ve izlenecek.** Bugün zararsız görünüyor ama komutan
"güçlüyü daha güçlü yapan" tarafta duruyor; bir sonraki denge turunda ilk bakılacak sayı bu.

### Bekleme cezası taraması (`KOMUTAN.BEKLEME`)

| Bekleme | Komutan düşmesi (40 tur) | Cezalı geçen tur | Yorum |
|---|---|---|---|
| 1 | 166.4 | **0.0** | Ceza fiilen YOK — aynı turun sonunda sönüyor |
| 2 | 153.6 | 94.8 | Hafif |
| **3** | 153.8 | **183.6** | **Seçilen.** ~28 aktör × 40 tur = ~1120 aktör-turun %16'sı |
| 5 | 146.0 | 355.0 | %32 — komutan zamanın üçte birinde sahada değil |

**3 doğrulandı:** ceza hissediliyor (komutan zamanın altıda birinde sahada değil) ama
komutanı oyundan çıkarmıyor. Adım 4'te "Adım 7'de bakılacak" diye bırakılan borç kapandı.

⚠ **Bir ölçüm körlüğü yakalandı ve düzeltildi:** ilk örnekleyici düşmeleri `bekleme`
alanının yükselişinden sayıyordu ve BEKLEME=1'de **hiçbir şey göremiyordu** (ceza aynı
turun sonunda 0'a iniyor, örnekleyici tur sonunda bakıyor). Tablo "0 düşme" diye yalan
söylüyordu. Artık düşme `parcaId`'nin null'a dönmesinden sayılıyor.


---

## 2026-09-20 — `merkez-parca-uret.js` + `merkez-olcum.js` (Görev 17)

### Üretim

`node scripts/merkez-parca-uret.js` → `veri/parcalar.json`'a **`merkez: true`** alanı eklendi.
81 il, 81 merkez. İl başına parça: 1→18 · 2→38 · 3→13 · 4→12.

⚠ **Geometriye HİÇ DOKUNULMADI ve bu doğrulandı.** Betik `parca-uret.js`'i çalıştırmıyor;
mevcut JSON'u okuyup alanı ekliyor. Yazmadan önce gidiş-dönüşün dosyayı birebir ürettiğini
kendisi sınıyor, tutmazsa duruyor. Üretimden sonra 181 parçanın `yol` ve `etiket` değerleri
tek tek karşılaştırıldı: **0 değişiklik**.

`veri-dogrula.js` artık her ilin TAM BİR merkezi olduğunu denetliyor.

### ⚠ ÖLÇÜM: MERKEZ PARÇA HEDEFİNİ TUTTURMADI

Ölçüt (YOL-HARITASI §17.1): *"fetih AZALSIN ama dünya kilitlenmesin."*
5 tohum × 40 tur, zorluk zor:

| Koşu | Parça fethi | Tam il fethi | Canlı aktör | En büyük yığın |
|---|---|---|---|---|
| Merkez yok | 1491.4 | 631.4 | 27.8 | 14.4 |
| Yalnız garnizon ağırlığı | 1557.6 | 668.6 | 25.6 | 8.6 |
| Yalnız moral kalemi | 1554.2 | 652.6 | 26.6 | 11.6 |
| **İkisi birden (bugünkü)** | 1511.8 | 623.6 | 26.6 | 10.0 |
| **fark** | **+1.4%** | **−1.2%** | −4.3% | −31% |

**Fetih azalmadı.** Tam il fethi −%1.2, yani gürültü seviyesinde.

**Sebebi yapısal ve baştan belliymiş:** garnizon ağırlığı ilin TOPLAM savunmasını
değiştirmiyor, yalnızca dağıtıyor (bu bilinçliydi — 2026-07-31'de ölçülen açılış sertliği
475 birim korunsun diye). İlin toplam savunması aynı kalınca ili almanın TOPLAM BEDELİ de
aynı kalıyor; değişen tek şey hangi parçanın ne zaman düştüğü.

**Değişen şeyler var ama başka yerde:**
- **Zirve yığın 14.4 → 10.0 (−%31).** Ordular merkeze harcanıyor, birikmiyor.
- **Canlı aktör −%4.3.** Dünya biraz hızlandı, yavaşlamadı.

⚠ **AÇIK KARAR BAKİ'DE:** merkez parça bugünkü hâliyle ilin bir *kalbi* olmasını sağlıyor
(merkez, diğer parçalardan %76 kalabalık ve 63 çok parçalı ilin 59'unda en güçlü parça) ama
fetih ucuzluğunu ÇÖZMÜYOR. Çözmesi için ilin toplam savunmasının artması gerekiyor ve o,
Görev 07'de bilerek sabitlenen açılış sertliğini değiştirmek demek.

## 2026-09-23 — `metin-olcum.js` (Görev 20 / Adım 0)

### Neden

Baki, 2026-09-23: *"Oyun şuan her şeyi kendisi açıklıyor ve bu benim gözüme karmaşık
geliyor… sezgilerle anlayarak ve deneyimleyerek öğrensem daha iyi. Bu önemli bir kural."*
Kural CLAUDE.md §5/10'a yazıldı. Kontrast denetiminin kalıbıyla metin yükü de artık
**ölçülüyor**: `node scripts/metin-olcum.js` → `veri/metin-olcum.md`.

### Ölçüm

Kaynak kod Babel ayrıştırıcısıyla okunuyor (ilk deneme düzenli ifadeydi ve kod parçalarını
metin saydı; atıldı). Dosyalar üç kümeye ayrıldı, hedef yalnızca ilkinde:

| Küme | Adım 0'dan önce | Adım 0'dan sonra |
|---|---|---|
| OYUN İÇİ (oyuncunun istemeden gördüğü) | 1.284 kelime · 45 uzun cümle | **1.260 kelime · 43 uzun cümle** |
| AÇILAN (oyuncunun kendi açtığı ekranlar) | 1.517 · 51 | 1.517 · 51 |
| MENÜ/KAYIT | 370 · 20 | 370 · 20 |

Uzun cümle = 8+ kelime. **Hedef (GOREV-20 §4.7): OYUN İÇİ kümede uzun cümle 0.**

### ⚠ Ölçüm iki yanlış kural yakaladı

İlk koşunun "OYUN İÇİ uzun cümleler" listesinde Görev 15'ten (anında çözüm) beri **yanlış**
olan iki cümle çıktı. İkisi de yeni oyuncuya olmayan bir kuralı öğretiyordu:

1. Savaş odası, ilk açılışta: *"Emirler tur bitince çözülür; o zamana dek iptal
   edebilirsin."* Hamle anında çözülüyor ve iptal edilemiyor. Not ve onu besleyen
   `emirIpucu` cihaz ayarı kaldırıldı.
2. Tur bitirme onayı: *"N emrin sırayla işlenecek: savaşlar yapılacak, bozulanlar
   çekilecek, alınan yerler senin olacak."* Kuyrukta yalnızca toplanma emirleri kalıyor.
   Cümle *"Tur N kapanacak, sıra rakiplere geçecek."* oldu.

**Ders:** kural değişince eski kuralı anlatan metin kodun içinde sessizce yaşamaya devam
ediyor ve hiçbir test onu yakalamıyor. Metin ölçümü bu yüzden bir **denetim** de sayılır:
uzun cümle listesi her kural değişikliğinden sonra okunmalı.

## 2026-09-23 — Skia haritası: `topoloji.js` · `harita-seviye-uret.js` · `harita-skia-onizleme.js` (Görev 20 / Adım 2–3)

### Neden

Baki: *"grafiksel açıdan oyun hâlâ akıcı değil, bir Antiyoy bir Polytopia gibi değil."*
Geliştirme kipi kapalıyken de fark görmedi → sorun haritanın yapısında. Eski harita her
karede ~210.000 noktalık iş yapıyordu (181 dolgu 76.617 + her parçanın kendi çevresi yine
76.617, yani iç sınırlar İKİ KEZ + il sınırları 56.955).

### `scripts/topoloji.js` (taşıma)

`menu-geometri-uret.js`'in içindeki topolojik sadeleştirici ortak dosyaya taşındı; yanına
`hatlar` (her sınır bir kez) ve `halkaHatlari` (parça → hat referansları) çıktıları eklendi.
Menü betiği yeniden koşuldu: `parcalar`, `ciftler`, `iller` alanları **birebir aynı**. Tek
fark `meta`'ya Görev 17'de eklenen `merkezUretim` satırıydı; gereksiz değişiklik olmasın diye
dosya git'ten geri alındı.

### `scripts/harita-seviye-uret.js` → `veri/harita-seviyeleri.json` (1.37 MB)

| Tolerans | Hat noktası | Telefonda kullanıldığı yakınlık |
|---|---|---|
| 0.5 | 10.792 | < 1.1× |
| 0.2 | 22.850 | < 2.7× |
| 0.1 | 37.577 | < 5.5× |
| 0.05 | 49.068 | 7×'e kadar |

689 hat (76'sı kıyı/ada), 7 ada halkası, iç içe parça yok. Öz denetim: 181 parçanın her
seviyede hatlardan dikilen halkası klasik yolla BİREBİR aynı; hat dizilişi ve halka
referansları dört seviyede özdeş (koşu sınırları komşuluktan doğuyor, toleranstan değil).
`veri-dogrula.js` artık dosyanın `parcalar.json` ile güncelliğini (toplam nokta) denetliyor:
parça verisi değişip bu dosya üretilmezse çizim ile dokunma testi ayrışır.

### `scripts/harita-skia-onizleme.js` → `veri/harita-skia-olcum.md` + `onizleme/harita-skia/`

Telefonun her karesini çizen `haritaCizim.js sahneyiCiz` bilgisayarda Skia'nın CanvasKit
sürümüyle AYNEN çağrılıyor; gerçek bir maçın 15. turundan beş yakınlıkta görüntü. Sadeleşme
denetimi: seçilen seviye ile en ince seviye arasında renk kanalı 48'den fazla ayrışan piksel
%0–0.57 (kenar yumuşatma).

**Önizleme iki tasarım hatası yakaladı, ikisi de düzeltildi:**
1. Yakınlığa bağlı il/parça rozeti karışımı (2.3×–2.7×) iki katmanı yarı saydam üst üste
   bırakıyordu → eşikte 180 ms'lik zamanlı geçiş + histerezis.
2. Çizgiler harita ile aynı oranda kalınlaşıyordu (7×'te il sınırı 9 px, seçim 15 px — eski
   haritada da böyleydi) → karekök oranında kalınlaşma (`tema.js CIZGI_BUYUME 0.5`).
   Yakın görünümlerde işlemci karesi 45–75 ms'den 19–30 ms'ye indi: kalın çizgi pahalıymış.

⚠ Süreler işlemcide (CanvasKit). Telefonda çizimi ekran kartı yapıyor; asıl ölçüm
geliştirme kipindeki kare sayacı (`KareSayaci.js`).

## 2026-09-23 — Görev 20 / Adım 3b: haritanın akıcılığı (ekran kartıyla ölçüm)

### `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md` (YENİ ölçüm aracı)

Baki ilk Skia haritasında *"30 fps gibi"* dedi. İşlemcideki önizleme bunu göremezdi; bu
sayfa oyunun çizim kodunu tarayıcıda **ekran kartıyla** ve telefonun yüzey ayarlarıyla
(çoklu örnekleme yok, şablon yok) çalıştırıp kare süresini ölçüyor. Açmak:
`node scripts/harita-skia-onizleme.js` (maçı üretir) → `node scripts/onizleme-sunucu.js` →
`http://localhost:4173/onizleme/harita-hiz.html`. Sunucu artık `.js`/`.wasm` da sunuyor ve
uzantısız içe aktarmayı çözüyor (react-native-skia'nın modülleri uzantı yazmıyor).

Sonuç: ilk Skia sürümü 22–74 ms/kare → yeni 3.0–6.1 ms/kare (ortanca, **7–23 kat**). Asıl
bedel yumuşatılmış karmaşık yollardı (sınır çizgileri 31 ms); çözüm ve gerekçe
`src/haritaCizim.js` başında.

### `scripts/harita-skia-onizleme.js` yeniden koşuldu

Görüntüler yeni çizimle üretildi (`onizleme/harita-skia/`). Sadeleşme denetimi: seçilen
seviye ile en ince seviye arasında renk kanalı 48'den fazla ayrışan piksel %0.47–0.80
(önceki %0–0.57; dolgu artık yumuşatmasız, kenardaki pikseller ya tam ya hiç).
Önizleme bu adımda bir hata daha yakaladı: seçim vurgusunun şeridi bütün yakınlıklara
yetecek genişlikte kurulunca kısa parçalarda kendi üstüne katlanıp çizgiyi diken diken
yapıyordu → vurgu şeridi seviye başına kuruluyor. İşlemcideki kare süresi artık 170–340 ms:
şerit programı işlemcide yorumlanıyor; telefonda ekran kartı çalıştırıyor, bu sayı telefonu
söylemiyor (hız için `harita-hiz.html`).

### `scripts/kadro-serit-olcum.js` → `veri/kadro-serit-olcum.md` (YENİ)

Kadro şeridinin (parça kalkanının altında figür + sayı; `DENGE.ROZET.SERIT_ESIGI`) iki
ölçüm borcu: okunurluk (eşik yakınlıkta sayının büyük harfi kaç dp) ve çakışma (şerit
komşu rozete biniyor mu). Rozet haritanın parçası olduğu için çakışma yakınlıktan bağımsız,
tek hesap. Sonuç: 4×'te sayı 8.7 dp (ölçüt ≥ 7), gerçek maçta 1 çakışma, en kötü durumda
(her parçada üç tür, iki haneli) 21 rozet. Eşik 4 seçildi.

### `scripts/metin-olcum.js` yeniden koşuldu → `veri/metin-olcum.md`

Diplomasi kartları ve araştırma ağacından sonra AÇILAN küme **1.517 → 1.257 kelime**, uzun
cümle 51 → 43; OYUN İÇİ 1.261 kelime · 43 uzun (değişmedi). Betiğe iki kural eklendi:
`console.*` içindeki geliştirici uyarıları sayılmıyor; oyuncuya hiç görünmeyen dosyalar
(`haritaCizim.js`'teki ekran kartı programı, geliştirme kare sayacı) ölçüm dışı.

## 2026-09-24 — Görev 20 / üçüncü tur: doğrudan hamle, komutan, diplomasi haritası

### `scripts/harita-skia-onizleme.js` yeniden koşuldu (9. görünüm eklendi)

Haritanın vurgusu değişti (hedefler iki renkte, ikinci dokunuşu bekleyen hedef tahminin
renginde). Yeni görünüm `9-dogrudan-hamle`: oyuncunun SINIRDAKİ bir parçası kaynak
(iç parçanın bütün komşuları kendi toprağı olduğu için ilk denemede kırmızı hedef
çıkmamıştı). Barışta düşman hedefi yoksa sınırdaki yabancı parçalar saldırı hedefi
sayılıyor — yalnızca görüntü denetimi için. Sadeleşme farkı %0.37–0.80, öncekiyle aynı aralık.

### `scripts/metin-olcum.js` yeniden koşuldu → `veri/metin-olcum.md`

OYUN İÇİ 1.244 kelime · 41 uzun cümle (önce 1.261 · 43); AÇILAN 1.167 · 38 (önce 1.257 · 43).
Düşüşün kaynağı saldırı onay kutusu, hedef kipi şeridi ve komutan ekranı (108 → 11 kelime).

## 2026-09-24 — Görev 20 / dördüncü tur

### `scripts/gorsel-oneri.js` (YENİ) → `onizleme/harita-skia/oneri-*.png` + `oneri.html`

Baki'nin "görsel detay eklemeli miyiz" sorusu için öneri görüntüleri. Oyunun çizimi
(`haritaCizim.js`) aynı maçla (tohum 7, 15 tur) çiziliyor, araya öneri katmanları giriyor:
kıyı gölgesi, arazi çizimi (dağ/tepe; yerleşim belirlenimci, rozetin çevresi boş), il
merkezlerinde kale + bayrak, komutan halesi + yıldız + sancak. Oyuna GİRMEZ; renkleri taslak,
seçilirse `tema.js`'e taşınır. İlk denemede dağlar koyu illerde kayboldu ve kaleler çok
küçüktü → dağa aydınlık yamaç eklendi, glifler büyütüldü.

### `scripts/metin-olcum.js` yeniden koşuldu

OYUN İÇİ 1.244 → **1.276 kelime** (uzun cümle 41, aynı). Artış BİLİNÇLİ: Baki reddin
sebebini istedi (`zeka.js RET_SEBEBI`, 6 kısa cümle) ve saldırı tahminine tek kelimelik
sonuç eklendi.

## 2026-09-24 — Görev 20 / beşinci tur: harita süsleri, komutan seçenekleri, arayüz envanteri

### `scripts/harita-sus-uret.js` (YENİ) → `veri/harita-susleri.json` (20 KB)

Baki öneri görüntülerinden B'yi seçti ("B olsun") ve denize dalga istedi. Dağlık parçalara
dağ (574), tepeliklere tepe (304), denize dalga (365) yerleri. Kurallar: glif parçanın
sınırından 2.6–2.8 birim içeride, parça rozetinin yerinden (etiket noktası) telefon ekranına
göre ~10 birim uzakta; dalga yalnızca üç deniz kutusunda (Karadeniz+Marmara, Ege, Akdeniz)
ve karadan (ülke hattı VE parçalar) 6 birim açıkta — doğu/güneydoğudaki komşu ülke
toprağına dalga düşmüyor. Yerleşim belirlenimci. ⚠ İlk koşuda bir dalga Muğla'nın girintili
kıyısında parçanın İÇİNE düştü (ülke hattı parçalardan sade): test yakaladı, deniz testine
parçalar da eklendi. **parcalar.json ya da turkiye-hat.json değişirse yeniden koşulur.**

### `scripts/harita-skia-onizleme.js` yeniden koşuldu (süsler eklendi)

Süsler maç başına 18–65 ms hazırlık (bilgisayar). Sadeleşme farkı %0.35–0.76, öncekiyle
aynı aralık. Önizleme bir hata yakaladı: kıyı gölgesi geniş şeritle çizilince girintili
kıyıda yıldız gibi dikenler → gölge maç başında bulanık bir resme çiziliyor.

### `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md` §5

Süsler karede +0.6–1.6 ms (ekran kartıyla). "yeni, süssüz" ve "yalnız süs" seçenekleri eklendi.

### `scripts/gorsel-oneri.js` ikinci tur

Taban artık oyunun süslü haritası. Kale ve hale çıktı (Baki: "gerek yok · kötü"); komutan için
üç silüet (A büst · B ayakta · C madalyon), büyük portreler ve hamle hakkı ("nefes") örneği.

### `scripts/arayuz-envanteri.js` (YENİ) → `onizleme/arayuz.html`

Baki: "arayüz tasarımının tüm detaylarını ver". Renkler `tema.js`'ten okunuyor, yazı yükü
`veri/metin-olcum.md`'den; 25 ekranın dökümü ve 27 numaralı öneri (tek kaynak bu betik).
Görüntüler sayfanın içine gömülü (4 MB, tek dosya).

## 2026-09-24 — Görev 21 / altıncı tur (ARA NOKTA): başkent yıldızları + önizleme

### `scripts/harita-sus-uret.js` yeniden koşuldu → `veri/harita-susleri.json` (22 KB)

Başkent yıldızı (H6) için yeni alan `yildiz`: il kodu → [merkez parça, x, y]. 81 il, hepsi
kendi merkez parçasının içinde, sınırdan 3.2 birim içeride, parça rozetine (halkasıyla) ve il
rozetine olan uzaklığı en iyi yeten nokta; hiçbiri rozetin 8 birim yakınında değil (test).
Yıldızın 5 birim çevresindeki dağ/tepe glifleri çekildi: dağ 574 → 563, tepe 304 → 295.
Dalga değişmedi (365).

### `scripts/harita-skia-onizleme.js` yeniden koşuldu

Yeni görünümler: 10/10b/11 hamle hakkı halkası (tam · kısmi · soluk, nefesin en sönük anı,
il katmanı), 12/12b cephe hattı, 13/13b başkent yıldızı, 14/14b birlik figürleri. Önizleme
iki tasarım hatası yakaladı: sönmüş yıldız içi boşken koyu illerde görünmüyordu (→ gri
dolgu) ve figürler sahibinin renginde kendi toprağında kayboluyordu (→ açık gövde).
⚠ Hız henüz EKRAN KARTIYLA ölçülmedi (`onizleme/harita-hiz.html`'e yeni katmanlar eklenecek).

### `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md` §6 (Görev 21 katmanları)

Sayfaya "yeni, Görev 21 yok", "yeni, en ağır" ve "yalnız Görev 21" eklendi; `sahne.json`
artık cephe listesini de taşıyor (`harita-skia-onizleme.js`). Sonuç §6'da.

### `scripts/renk-secenekleri.js` (YENİ) → `onizleme/renk-secenekleri.html` (417 KB)

Baki: "bazı arayüz ekranlarında açık sarı gibi renkler var, beğenmiyorum". Karar sayfası:
aday renkler yalnızca bu betikte (oyuna girmez), seçilen `tema.js`'e geçer. Yazı tipleri
sayfanın içine gömülü (tek dosya, telefonda da açılır).

### `scripts/arayuz-envanteri.js` yeniden koşuldu

Öneri durumları: H2 İSTENMEDİ · H3, H4, H6, H10, U2 KODDA · H8 İNDİRME İZNİ BEKLİYOR; H3'ün
tarifi yapılan hâle (dilimli halka) güncellendi.

## 2026-09-24 — Görev 21 / yedinci tur: kâğıt rengi A, nehirler ve göller

### `scripts/tema-olcum.js` yeniden koşuldu → `veri/tema-olcum.md`

`KAGIT` parşömenden kırık beyaza (Baki: "Renk için A"). Kâğıttaki bütün yazı ve mühür
renkleri eşiğin üstünde; soluk yazı 3.4 → 4.3 (eski yorumdaki 4.2 yanlıştı).

### `scripts/harita-nehir-uret.js` (YENİ) → `veri/harita-nehirler.json` (16 KB)

Kaynak: Natural Earth 10m fiziksel — `ne_10m_rivers_lake_centerlines`, `ne_10m_lakes`
(kamu malı; atıf gerekmiyor). İndirme: naciscdn.org/naturalearth/10m/physical/ (sitenin
eski yolu 500 verdi). Zip'ler depoya girmez; betik açılmış klasörü argüman olarak alır.
Yerleşim geri hesabı: ölçek 3747.80, kayma (478.10, 231.19), il kutusu hatası ortanca 0.05 /
en kötü 4.1 birim (adalı bir il). 20 nehir parçası (12 nehir), 7 göl.
**parcalar.json değişirse bu betik de yeniden koşulur**, ardından `harita-sus-uret.js`.

### `scripts/harita-sus-uret.js` yeniden koşuldu (iki kez)

Dağ ve tepe artık gölün içine ve nehrin 1.6 birim yakınına konmuyor; yıldız yalnızca gölden
kaçıyor (nehir payı Sakarya'nın yıldızını rozetin dibine itmişti — test yakaladı).
Dağ 563 → 495, tepe 295 → 269, yıldız 81, dalga 365.

### `scripts/harita-skia-onizleme.js` + `onizleme/harita-hiz.html`

Görünümler 15 (uzak), 15b (Van gölü), 15c (Tuz gölü). Hız §6b.

## 2026-09-24 — Görev 21 / sekizinci tur: yıldız kalktı, göller parçalardan oyuldu

### `scripts/harita-sus-uret.js` yeniden koşuldu (yıldızsız)

Baki: "mapteki yıldızları kaldır". `yildiz` alanı ve dağların yıldızdan kaçışı kalktı.

### `scripts/parca-gol-oy.js` (YENİ) → `veri/parcalar.json`, `veri/harita.json` YERİNDE

Baki: "göller parçaların içinde olmasın, yalnızca dekoratif dursunlar, il sınırlarını
yeniden çiz". 7 göl (`veri/harita-nehirler.json`) 21 parçadan ve 12 ilden çıkarıldı; 1 birim²'den
küçük kırıntı halkalar yazılmadı (ilk koşuda kaba seviye onları silip seviyeleri ayrıştırdı).
Rozet yeri taşınan: parça 65-4, 13-1, 02-2 · il 13, 32. Su üstünden komşu kalan 4 çift
(`meta.golOyma.suUstuKomsu`): 02-1|63-1, 02-1|63-3, 13-1|65-4, 23-1|62-1 — komşuluk
DEĞİŞMEDİ. ⚠ `parca-uret.js` yeniden koşulursa bu betik de koşulur (sıra betiğin başında).

### Yeniden koşulanlar (bu sırayla)

`harita-nehir-uret.js` (göl testi artık ülke hattına — göller parçalarda değil) →
`parca-gol-oy.js` → `harita-seviye-uret.js` (hat 917 → 883, kıyı/ada 227; öz denetim ✓) →
`harita-sus-uret.js` (dağ 496, tepe 279) → `menu-geometri-uret.js` (461 çift).
`veri-dogrula.js` su üstü çiftlerini tanıyor ("4 boğaz ve 4 göl üstü çift hariç").

### `scripts/metin-olcum.js` → `veri/metin-olcum.md`

Bölge panelinden ordu kontrolü kalktı: OYUN İÇİ 1276 → 1239 kelime, 41 → 39 uzun cümle.

## 2026-09-24 — Görev 21 / dokuzuncu tur: metin ve taraf düzeltmeleri

### `scripts/metin-olcum.js` → `veri/metin-olcum.md`

Kartlar, savunan cümleleri ve kayıp satırları eklendi (yanlış taraftan konuşan metinler
düzeltildi, `docs/GOREV-21` §2e): OYUN İÇİ 1239 → 1300 kelime, 39 → 40 uzun cümle.

## 2026-09-25 — Görev 20 / altıncı tur: eğitim, tek harita, açılış kamerası

### `scripts/metin-olcum.js` → `veri/metin-olcum.md`

Eski SVG haritası emekliye ayrıldı (oyuncuya metni yoktu) ve eğitim geldi: şeridin altı
adımı (en çok iki kelime), HAZIRSIN kartı, eğitimden çıkış sorusu. OYUN İÇİ 1300 → 1322
kelime, uzun cümle 40 → 40. Veri dosyası değişmedi (eğitim kurulumu `DENGE.EGITIM`'den).
