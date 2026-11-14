# İL SAVAŞLARI — PROJE ANAYASASI

Bu dosya **kural** dosyasıdır, günlük değil. Ne yapıldığı `veri/URETIM-NOTU.md`'de,
niye yapıldığı `docs/GOREV-*.md` belgelerinde durur. Burada yalnızca **her seferinde
geçerli olan** şeyler yazar. Yeni bir kural doğduğunda buraya eklenir; anlatı eklenmez.

Oyun: Türkiye haritası üzerinde 81 il / 181 parça ile sıra tabanlı strateji.
Yığın: Expo SDK 54 · React Native 0.81 · react-native-skia (harita) · react-native-svg (simgeler) · reanimated 4.
Dil: kod, yorum, değişken adı ve arayüz **Türkçe**.

---

## 1. KOMUTLAR (Windows / PowerShell)

```
npm run kontrol    # ALTI bölüm — tek kapı, bunu çalıştır
npm run test       # yalnızca testler
npm run bicimle    # Prettier düzeltmesi
npx.cmd expo start # geliştirme sunucusu
```

`kontrol`un altı bölümü: **veri tutarlılığı · ESLint · Prettier · çıplak renk kodu ·
yazı okunurluğu (WCAG kontrast) · testler.** Son üçü sonradan eklendi; "dört bölüm"
yazan eski bir belge görürsen o belge eskimiştir.

- PowerShell'de **`npm.cmd` / `npx.cmd`** yaz. Çıplak `npm`/`npx` bu ortamda takılıyor.
- PowerShell'de `&&` yok. Sıralama için `;` veya `if ($?) { ... }`.
- Expo sürümü **SDK 54'e pinli** — telefondaki Expo Go 54. Yükseltilmez.
- İş bitmeden `npm run kontrol` **altı bölümde de** ✓ vermeli.

---

## 2. KLASÖR HARİTASI

```
src/App.js            EKRAN: yerleşim, bileşen bağlama. Oyun kuralı YOK.
src/oyunKancasi.js    OYUN: durum + eylem + türetme. Görsel bilgi YOK.
src/denge.js          Oyunu etkileyen HER sayı. Tek kaynak.
src/tema.js           Renk, yazı tipi, görsel jetonlar. Tek kaynak.
src/olcu.js           Telefon/tablet kararı (kısa kenar < 600 dp).
src/bicim.js          Sayının ekranda nasıl yazıldığı (havuz aşağı, gelir tek hane).
src/harita*.js        HARİTA (Görev 20): dönüşüm (tek kaynak), kademeli geometri, Skia
                      çizim çekirdeği. `haritaCizim.js` telefonda ve bilgisayarda AYNI kod.
src/bilesenler/       Görünen parçalar. Sadece çizerler.
src/oyun/             Kurallar: ordu, hareket, hamle hakkı, muharebe, diplomasi, zekâ, kayıt...
src/sahne/            Titreşim ve sahne kancası. (Ses KALICI olarak kapalı — §5/8.)
src/para/             Reklam/ödül altyapısı — KAPALI anahtar, hiçbir SDK yok.
onizleme/             Tarayıcıda açılan tasarım denemeleri (ikon, font, renk), harita hız
                      ölçümü (`harita-hiz.html`) ve arayüz envanteri (`arayuz.html`,
                      `scripts/arayuz-envanteri.js` üretir). Oyuna girmez.
veri/                 Üretilmiş JSON (harita, parçalar, komşuluk) + ölçüm raporları + URETIM-NOTU.md
scripts/              Veri üreten ve ölçen tek seferlik betikler (Node, CommonJS).
testler/              *.test.js — `node testler/calistir.js` hepsini koşar.
docs/                 Görev belgeleri ve raporları. Tasarım: il-savasi-tasarim.md
```

---

## 3. KATMAN SINIRI (en sık bozulan kural)

**`oyunKancasi.js` = oyun. `App.js` ve `bilesenler/` = ekran.**

- Kancada renk, ölçü, punto, yerleşim **bulunmaz**.
- Ekranda oyun kuralı, denge hesabı **bulunmaz**; hazır sonucu alır ve çizer.
- Yeni bir düğme → ekran tarafı. Yeni bir kural → `src/oyun/` + kanca.
- `src/oyun/` içindeki dosyalar React'i **hiç** tanımaz; saf fonksiyondurlar,
  bu yüzden Node ile test edilebiliyorlar.

---

## 4. HANGİ SAYI NEREDE YAŞAR

| Sayı türü                                               | Yeri                          |
| ------------------------------------------------------- | ----------------------------- |
| Denge (gelir, güç, maliyet, eşik, yapay zekâ katsayısı) | `src/denge.js` → `DENGE`      |
| Renk, yazı tipi, boşluk, köşe                           | `src/tema.js`                 |
| Ekran boyutu kararı                                     | `src/olcu.js`                 |
| Sayının yazım biçimi                                    | `src/bicim.js`                |
| Harita geometrisi                                       | `veri/*.json` (koda gömülmez) |

Bir sayıyı değiştirip oyunun nasıl değiştiğini görmek isteyen kişi **tek dosyaya**
bakabilmeli. Bileşenin içinde `* 1.4` görüyorsan orada bir denge sayısı kaçmış demektir.

---

## 5. YASAKLAR

1. **Denge sayısını koda gömme.** Her biri `denge.js`'e gider, yorumuyla birlikte.
2. **`tema.js` dışında renk yazma.** Bileşende `#rrggbb` veya `rgba(...)` yasak.
3. **81 il paletini değiştirme.** Ölçülmüş; komşu iller aynı renge düşmüyor.
4. **Yazı tipi ailesini keyfî değiştirme.** İki aile var, ikisi de `tema.js YAZI`'da:
   **Black Ops One** = başlık/etiket (askeri şablon) · **Chakra Petch** = gövde/sayı.
   Üçüncü aile YOK ve bu bilinçli (gerekçe `tema.js`'te). 2026-08-12'de Oswald+Barlow'dan
   geçildi; adaylar Türkçe glif sınavından geçirildi (`onizleme/font-deneme.html`).
5. **Aynı listeyi iki yere yazma.** İki kopya doğduğu an biri eskir.
6. **Harita geometrisini kayda yazma.** Kayıt yalnızca parça **kimliği** tutar.
7. **Kayıt biçimi değişirse sürüm numarası artar** (`oyunDurumu.js`), yoksa eski
   kayıt sessizce bozuk yüklenir. (Bugün: **19**.)
8. **Ses arama, ses ekleme, ses sorma.** 2026-08-12'de KALICI olarak iptal edildi;
   hissiyat titreşimle taşınıyor (`src/sahne/titresimDeseni.js`). `src/sahne/ses.js`
   silinmedi, `SES_HAZIR = false` kapalı anahtarı olarak duruyor — silmek `useSahne`'i,
   ayar menüsünü ve ayar şemasını birden değiştirmek olurdu. `docs/GOREV-08-SES-LISTESI.md`
   bir tarih kaydıdır, yapılacaklar listesi DEĞİL.
9. **Oyunun adını tekil yazma.** Ad **İL SAVAŞLARI**; "İl Savaşı" yanlıştır
   (`docs/GOREV-10A-ANA-MENU-KARARI.md`). Klasör ve `slug` `il-savasi` kalır — onlar
   kimlik, ad değil.
10. **Oyunu metinle anlatma.** (Baki, 2026-09-23: *"sezgilerle anlayarak ve deneyimleyerek
    öğrensem daha iyi; bir sürü açıklama karmaşıklığı arttırıyor. Bu önemli bir kural."*)
    Oyuncu bir şeyi dokunup sonucunu görerek öğrenir. Yeni bir bilgi ekrana girecekse önce
    şu sorulur: **bunu metinsiz nasıl gösteririm?** Vurgu, renk + biçim, simge, canlandırma
    ya da tek bir sayı. Açıklama cümlesi varsayılan değil, son çaredir. Geliştirici
    gerekçesi ("ölçümle kondu", dosya boyutu) oyuncuya asla yazılmaz. Ölçüt Antiyoy ve
    Polytopia'dır; metin yükü `scripts/metin-olcum.js` ile ölçülür
    (`docs/GOREV-20-sezgi-ve-akicilik.md`).

---

## 6. BİLİNEN TUZAKLAR (hepsi bir kez canımızı yaktı)

- **Worklet'e fonksiyon geçirilemez.** `reanimated` jestleri UI iş parçacığında
  çalışır; oraya **değer** gider (paylaşılan değer veya sayı), React callback'i değil.
  Kip açık/kapalı gibi bayraklar `useSharedValue` + `useEffect` ile taşınır. Worklet
  içinden `DENGE`'ye başvurulmaz: 2.700 satırlık nesnenin tamamı kopyalanır. Gereken sayı
  modül düzeyinde bir sabite alınır (`HaritaSkia.js SUZULME`).
- **Worklet'in çağırdığı her yardımcı (ve okuduğu modül sabiti) ondan ÖNCE tanımlanır.**
  Reanimated derleyicisi `'worklet'` fonksiyon bildirimini sabite çeviriyor; yukarı taşınma
  yok. Sonra tanımlanan yardımcı telefonda "… is not a function" verir, bilgisayarda
  (önizleme, testler) çalışır — 2026-09-24'te `halkaOynat` ile yaşandı. Test: "WORKLET SIRASI".
- **Paylaşılan değeri okuyan kanca, onu yazan jestten ve kameradan SONRA tanımlanır**
  (`useDerivedValue`, `useAnimatedReaction`, `useAnimatedStyle`). React Compiler bir kancaya
  verilmiş değerin sonradan yazılmasına izin vermiyor; ESLint `react-hooks/immutability`
  diye yakalıyor. İki haritada da bir kez yaşandı. **Aynı paylaşılan değeri iki ayrı
  `useEffect` de yazamaz** (ikincisi "önceki etkinin kullandığı değer" diye reddediliyor):
  savaş kamerası ile açılış kamerası bu yüzden TEK etkide (`HaritaSkia.js`, 2026-09-25).
- **Node'da da yüklenen `src` dosyası içe aktarmayı `.js` uzantısıyla yazar**
  (`from './tema.js'`). Testler ve betikler bu dosyaları Node'la açıyor; uzantısız yol
  Metro'da çalışır, Node'da "modül bulunamadı" der.
- **Türetilmiş nesnenin kimliği her hamlede değişir.** `React.memo`'lu bir bileşene
  giden her özellik sabit kimlikli olmalı: liste ise `useMemo`, fonksiyon ise
  `useCallback`. Yoksa hafızalama hiç çalışmaz ve harita jest sırasında takılır.
- **Özel yazı tipiyle `fontWeight` çalışmaz.** Kalınlık ailenin kendi sürümünden gelir
  (`ChakraPetch_600SemiBold` gibi). `fontWeight: 'bold'` yazmak hiçbir şey yapmaz.
  ⚠ **Black Ops One'ın tek kesimi var (400)** — başlıkta kalınlık ayarı diye bir şey yok.
- **Kâğıt ekranda kâğıdın yazı renkleri.** İki yüzey var: oyun ekranları lacivert
  (`ZEMIN` + `YAZI_RENK`), belge ekranları kâğıt (`KAGIT` + `KAGIT.yazi/yaziIkincil/...`).
  Açık kâğıtta `YAZI_RENK` (açık) okunmaz; vurgu da pirinç değil koyu altın
  (`METAL.altin.govde`). Kontrast denetimi bileşendeki bu karışıklığı YAKALAMAZ — komutan
  ekranı Görev 16'dan 2026-09-24'e kadar böyle kaldı.
- **`fontSize` yazıp `lineHeight` yazmamak yerleşim hesabını tahmine çevirir.** Piksel
  hesabı yapan her yerde `lineHeight` açıkça verilir.
- **Yatay tutuşta dar olan yön YÜKSEKLİK** (telefonda ~412 dp). Ölçüler dikeyde cimri,
  yatayda cömert olmalı; sabit yükseklik yazmadan önce kalan alan ölçülür.
- **Harita tek: Skia (`HaritaSkia.js`).** Eski SVG haritası 2026-09-25'te emekliye ayrıldı
  (GOREV-20 Adım 9); menüdeki küçük haritalar ve simgeler hâlâ SVG. Skia haritası her şeyi
  veri değişince RESİM olarak kaydeder, karede yalnızca kamerayla oynatır; ağırlığı
  kademeli geometri taşır (`veri/harita-seviyeleri.json`). ⚠
  `parcalar.json` değişirse `node scripts/harita-seviye-uret.js` ŞART, önünde göl oyma ve
  arkasında süs: `harita-nehir-uret` → `parca-gol-oy` → `harita-seviye-uret` →
  `harita-sus-uret` → `menu-geometri-uret` (sıra `parca-gol-oy.js` başında), yoksa çizim ile
  dokunma testi ayrışır (`veri-dogrula` yakalar).
- **Skia'da kenarı YUMUŞATILMIŞ karmaşık şekil telefonda çok pahalı.** react-native-skia'nın
  Android yüzeyinde çoklu örnekleme ve şablon tamponu yok; Skia böyle bir şekli her karede
  işlemcide maske olarak çizip yüklüyor (ilk Skia haritası: sınır çizgileri tek başına
  31 ms/kare). Haritada: dolgu `antiAlias` KAPALI, çizgi hazır üçgen şeridi + ekran kartı
  programı, rozet resim sayfasından (`haritaCizim.js` başı). Yeni bir harita çizimi
  eklenirken bu üç yoldan biri seçilir ve `onizleme/harita-hiz.html` ile ÖLÇÜLÜR —
  işlemcideki önizleme bu farkı göstermez.
- **Haritada sürekli canlandırma = sürekli yeniden çizim.** Kare, okuduğu paylaşılan değer
  değiştikçe BÜTÜN haritayı baştan çiziyor. Hamle halkasının nefesi (Görev 21) bu yüzden her
  karede değil saniyede ~20 kez güncelleniyor (`DENGE.ROZET.NEFES_ADIM`) ve haritanın üstünde
  bir ekran açıkken duruyor (`HaritaSkia.js nefesAcik`). Yeni bir kıpırtı (dalga, sancak)
  eklenecekse aynı saate bağlanır; ikinci bir saat pili iki kat yorar.
- **Skia karesi bilgisayarda çizilebilir ve çizilmeli.** Kare fonksiyonu
  (`haritaCizim.js sahneyiCiz`) arayüz iş parçacığında çalışır; oradaki hata React hata
  sınırına ULAŞMAZ. Haritanın çizimine dokunan her değişiklikten sonra
  `node scripts/harita-skia-onizleme.js` koşulur ve görüntülere gözle bakılır (görüntü),
  `onizleme/harita-hiz.html` açılır (hız, ekran kartıyla). Önizleme üç tasarım hatasını
  telefona gitmeden yakaladı.
- **HAMLE VERİLDİĞİ AN ÇÖZÜLÜR (Görev 15).** Emir kuyruğu yok. Bunun iki tuzağı var:
  (1) bir testte ya da betikte ayarı (araştırma dalı, ilişki, para) hamleden SONRA vermek
  hiçbir şey yapmaz — hamle çoktan çözülmüştür; (2) hamle hakkı `ordu.hamle` defterinde
  (`src/oyun/hamle.js`) ve TÜRE GÖRE: piyade 1 · topçu 1 · zırhlı 2.
- **Uzun basmanın üç anlamı var** (`App.js onUzunBas`): hamle kipinde bir HEDEFE → savaş
  odası; kip yokken başka devletin iline → diplomasi (o devletin kartı); geliştirici modunda
  (`DENGE.GELISTIRICI_MODU`) → parçayı oyuncuya verir. Geliştirici modu **şu an `false`**
  ve yayına kadar öyle kalacak; test için açan kişi kapatmayı unutmamalı.
- **Rapor satırı kimin gözünden?** Bir hamle satırında üç kimlik var: `aktorId`/`sahip`
  (saldıran), `savunanId` (savunan ORDU — boş parçaya yürüyüşte YOK) ve `eskiSahip`
  (parçanın önceki sahibi). "Bu oyuncuya mı oldu" sorusu üçüne birden bakar; "iyi mi kötü mü"
  oyuncunun hangi tarafta olduğuna. 2026-09-24'te dört yer yanlış taraftan konuşuyordu
  (il kartı, tur raporu, başlık özeti, maç sayacı) — Kocaeli İstanbul'un parçasını alınca
  "İL KAYBEDİLDİ" görüyordu.
- **Otomatik kayıt yalnızca maç oynanırken** (`oyunKancasi.js macAktif`). Yeni bir menüye
  dönüş yolu eklenirse `O.mactanCik()` çağrılmalı; yoksa menüdeyken arka plana geçmek
  bellekteki maçı yuvaya yazar ("kaydetmeden çık" anlamını yitirir).
- **Eğitim maçı kayda ve mühüre girmez** (`durum.egitim`, `oyun/egitim.js`). Kolaylaştırılmış
  bir maç (zayıf hedef, hazır bütçe): yuvaya yazılsa oyuncunun kaydını ezer, mühür verse rütbeye
  bedava puan olur. Yeni bir kayıt ya da mühür yolu eklenirse bu işarete bakmalı.
- **Hedef kipinde haritaya dokunmanın dört anlamı var** (`App.js onSec`): seçili hedef →
  HAMLE · başka hedef → seçer · başka ordun → kaynak olur · başka her yer → vazgeç. Kip
  yokken kendi orduna dokunmak — hamle hakkı bitmiş olsa da — ORDU ÇUBUĞUNU açar (Görev 21):
  komutan, toparlanma ve ASKER BAS orada; bölge paneli yalnızca bilgi. Haritanın üstüne yeni bir düğme konacaksa ARKA PLANI olmalı: arka planı olmayan
  kutu dokunmayı alttaki haritaya geçirebilir (Görev 05'te kuvvet seçicide yaşandı) ve o
  dokunuş hamle sayılır. Kuşkuda harita jesti `dokunmaKapali` ile susturulur.
- **`viewBox` + elle sığdırma dönüşümü BİRLİKTE kullanılmaz.** `viewBox` haritayı zaten
  ölçekleyip ortalıyor; içine bir de `translate/scale` grubu koymak sığdırmayı iki kez
  uygular. Görüntü %9 küçülür (göz fark etmez) ama dokunma testi tek sığdırmaya göre
  hesapladığı için parmak kenarlarda ~80 piksel şaşar — il seçiminde komşu il seçiliyordu.
  Sığdırmayı YA `viewBox` yapar YA elle dönüşüm; ikisi asla üst üste binmez.

---

## 7. ÇALIŞMA DÜZENİ

- Her görev `docs/GOREV-XX-*.md` belgesiyle başlar, `docs/GOREV-XX-RAPOR.md` ile kapanır.
- Adımlar **birleştirilmez**. Bir adım bitince: dokunulan dosyalar + Baki'nin telefonda
  göreceği tek cümlelik gözlem yazılır; Baki doğrulamadan sonraki adıma geçilmez.
- Cevapsız tasarım sorusuyla kod yazılmaz.
- Veri üreten bir betik koşturulduysa `veri/URETIM-NOTU.md` güncellenir.
- Baki kod yazmıyor: açıklamalar sade Türkçe, jargonsuz olmalı.
