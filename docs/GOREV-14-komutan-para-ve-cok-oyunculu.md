# GÖREV 14 — KOMUTAN, PARA KAZANMA VE ÇOK OYUNCULU

> Tarih: **2026-09-18** · Baki'nin isteği: para kazanma yollarının tek tek oylanması,
> komutan sisteminin oyuna girmesi, birlik görünümü, il fethinin zorlaşması ve çok
> oyunculu için internetten ilham toplanması.
>
> ⚠ **BU BELGE KOD DEĞİL, KARAR BELGESİDİR.** Hiçbir madde uygulanmadı. CLAUDE.md §7
> gereği her adım ayrı ayrı Baki'nin onayıyla açılır.
>
> ⚠ **V1 YAYINI BEKLEMEZ.** Buradaki hiçbir madde `docs/YAYIN-KONTROL.md`'deki yayın
> sırasını geciktirmemeli. Oyun bugün yayınlanabilir durumda; bunlar v1.1 ve sonrasıdır.

---

## 0. PROJE YEDEĞİ (2026-09-18, yapıldı)

Figürlü gösterim gibi denemeler kodu kalıcı bozabilir; öncesinde geri dönüş noktası şart.

- **Yerel sürüm geçmişi kuruldu:** `git init`, dal adı **`ana`**, ilk kayıt 289 dosya.
  `node_modules`, `.expo` ve `dist` kayda girmiyor (`.gitignore`).
- **Deneme öncesi:** `git add -A` + `git commit -m "..."` → o an dondurulur.
- **Deneme bozarsa:** `git restore .` son kayda döndürür.
- ✅ **Dış yedek kararı (2026-09-18): GitHub'da ÖZEL depo açılacak.** Baki depoyu açıyor,
  bağlama ve ilk gönderim ardından yapılacak. Depo **private** kalacak: oyun ticari bir
  ürün ve kaynak kodu herkese açılmamalı.
- ⚠ Gönderilecek boyut ~130 MB (`veri/ham` 40 MB ham harita verisi + `onizleme` 71 MB
  tasarım denemeleri). En büyük tek dosya 16 MB, GitHub sınırlarının altında; ilk gönderim
  birkaç dakika sürebilir.

---

## 1. BAKİ'NİN KARARLARI (2026-09-17/18)

| Karar | Durum |
|---|---|
| Harita temaları · il bayrağı/mühür/renk setleri | ✅ |
| Birlik simgeleri + yakınlaşınca figür | ✅ (§4) |
| "Geliştiriciye çay ısmarla" | ✅ |
| Maç sonu reklamı + tek oyunculuda ara reklam | ✅ (§6) |
| Maç tekrarı · gösteriyi atla · ayrıntılı tur raporu | ✅ **ücretsiz**, satılmaz |
| Günlük + haftalık meydan okuma | ✅ |
| Şehir rekabeti paylaşım kartı · Memleket Ligi · dereceli | ✅ |
| Komutan rütbesi (gerçek rütbe sırası, ~10–14 kademe) | ✅ (§3.1) |
| Rakip il liderleri (gerçek isim YOK) | ✅ (§3.2) |
| Haritada komutan birimi + satılabilir yetenekler | ✅ (§3.3–3.4) |
| Merkez parça | ✅ (§7) |
| Düello: komşu kilidi | ✅ |
| İsyan modu önce tek oyunculuda | ✅ |
| **Komutan dili (telgraf üslubu)** | ❌ **İPTAL** — Baki: *"aynı cümleleri gördürmek kötü."* Tekrar eden metin oyunu ucuzlatır; üslup işi liderlerin adına (§3.2) yatırılıyor |
| Son direniş kuralı | ❌ merkez parça yeterli |
| Bölge harita paketleri · senaryo paketleri · klasik sezon ödül yolu | ❌ |
| Bozgundan kurtar · diplomatik ikinci şans ödülleri | ❌ |
| Haritayı komşu ülkeleri kapsayacak şekilde büyütmek | ❌ **harita aynı kalıyor** |

**Kural değişikliği:** "Reklam ödülü asla güç vermez" çizgisi **tek oyunculu maçlar için**
gevşiyor (§5). Yeni çizgi: **üstünlük satılmaz.**

---

## 2. (BOŞ — komutan dili iptal edildi)

Karar §1'de. Bu başlık, ileride "acaba konuşulmuş muydu" diye sorulmasın diye duruyor.

---

## 3. KOMUTAN SİSTEMİ

### 3.1 Oyuncunun rütbesi

TSK'nın gerçek sırası esas alındı (kaynak §11). Önerilen **14 kademe**:

```
 1 Er            5 Teğmen         9 Yarbay        13 Korgeneral
 2 Onbaşı        6 Üsteğmen      10 Albay         14 Orgeneral
 3 Çavuş         7 Yüzbaşı       11 Tuğgeneral
 4 Başçavuş      8 Binbaşı       12 Tümgeneral
```

- Rütbe **oyuncunun kendi kariyeridir**, oyundaki ile ait değildir (Baki'nin şartı:
  ülke yöneticisi havası olmayacak).
- Kaynağı hazır: kazanılan mühürler (`basarimlar.js` · 34 mühür · bronz/gümüş/altın).
- Oyun kuralına dokunmaz, dengeye girmez.

✅ **MAREŞAL = ONUR UNVANI (karar 2026-09-18).** Rütbe merdiveninde yer almaz; **34 mührün
tamamını** toplayan oyuncuya verilen tek seferlik unvandır. Gerekçe: gerçekte savaşta üstün
başarı için verilen ve Türkiye'de yalnızca iki kişide olan bir rütbedir — sıradan bir
basamak yapmak yakışık almaz, en tepeye konması ise anlamını korur.

### 3.2 Rakip illerin liderleri (özelleştirilmiş sürüm)

Gerçek isim yok. Üç katman, hepsi **tohumdan** türetilir (`kisilik.js` kalıbı): aynı
tohumda aynı lider çıkar, kayıtta yer tutmaz, çizim gerektirmez.

**Katman 1 — Unvan.** İlin bölgesine göre seçilir, böylece Türkiye'nin dili haritaya
yayılır: *Paşa · Bey · Ağa · Reis · Komutan*. (⚠ **Vali kullanılmaz** — gerçek bir devlet
görevidir.)

**Katman 2 — Lakap, kişilikten doğar.** Lakap süs değil **bilgidir**; oyuncu adı okuyunca
huyu tahmin edebilmeli:

| Baskın huy | Lakap havuzu (örnek) |
|---|---|
| Saldırgan | Demir Yumruk · Kasırga · Yalın Kılıç |
| Açgözlü | Doymaz · Harita Yiyen · Aç Kurt |
| Husumetçi | Kan Davalı · Unutmaz |
| Temkinli | Yaşlı Tilki · Sabırlı · Duvar |

**Katman 3 — Hasımların adı olur.** `veri/husumetler.js`'teki **7 hasım çifti** düellosu
zaten adlandırılmış bir olay; o illerin liderleri sabit ve elle yazılmış lakaplar taşır.
Kutsal düello kartında iki adın karşı karşıya gelmesi, olayı bir maçtan hikâyeye çevirir.

**Nerede görünür:** diplomasi ekranı, savaş ilanı, tur raporu ve düello kartı. "Tanıdıkça"
kuralı korunur: tanımadığın ilin lideri "bilinmiyor" olarak durur.

**Bedeli:** ~20 lakap + 5 unvan + 14 hasım adı; tek dosya, çizim yok.

### 3.3 Haritada komutan birimi — uygulama tarifi

Amaç: **yeni birim türü açmadan** komutanı haritaya sokmak.

| Konu | Karar |
|---|---|
| Komutan nedir | Bir birlik değil, **bir orduya takılan işaret**. Maçta oyuncu başına **tek** komutan |
| Atama | Ordular ekranından "komutanı buraya ata". Tur başına bir kez değiştirilebilir |
| Hareket | Takılı olduğu orduyla gider. Ayrı hareket etmez, ayrı emir almaz |
| Görünüm | O ordunun kalkan rozetine küçük bir mühür işareti. **Yeni katman yok, animasyon yok** (CLAUDE.md §6 rozet kuralları korunur) |
| Etkisi | Mevcut **moral** sisteminden geçer; muharebe zaten moral bonusu alıyor. Yeni formül açılmaz |
| Kaybı | Ordu bozguna uğrarsa komutan çekilir ve **X tur** yeniden atanamaz. Esir düşme / ölme YOK — karmaşık ve cezalandırıcı |
| Yapay zekâ | Botların da komutanı var, kuralı tek: en güçlü ordusuna takar. Gizli bonus yok (§9.1 "tek beyin") |
| Sayılar | `denge.js → DENGE.KOMUTAN` altında tek yerde |
| Kayıt | Komutanın yeri ve yeteneği kayda girer → **kayıt sürümü artar** (CLAUDE.md §5/7) |
| Ölçüm | Komutanın fetih hızına etkisi `denge-simulasyonu.js` ile önce/sonra ölçülür |

### 3.4 Yetenekler: yatay + dikey (Baki: "ikisi de olsun")

- **Yatay = çeşit.** *Zırhlı ustası · Topçu ustası · Dağ komutanı · Seferberlik ustası.*
  Hiçbiri diğerinden güçlü değil, farklı oynatır.
- **Dikey = kademe.** Her yetenek 1–3 kademe yükselir, etkisi artar.

✅ **Kapsam kararı (2026-09-18): dört çeşit × üç kademe yeterli.** Daha geniş bir liste
dengeyi ölçülemez hâle getirir; gerekirse sonra eklenir, baştan şişirilmez.

**P2W şikâyetini önleyen tek kural:** *dikey ilerleme **oynayarak** kazanılır; para yalnızca
kestirmedir.* Yani ödeyen kişi yeni bir tavan satın almaz, aynı tavana **erken** çıkar
(tasarım §12.2/1: "tavan ortak, para hızı satar").

**İnsan rakipli maçta:** komutan kademeleri **eşitlenir** — herkes aynı tavanla girer,
yetenek çeşidi serbest kalır. Böylece çok oyunculu "para yatıran kazanır" olmaz, ama
komutan seçimi yine de bir karar olarak kalır.

⚠ Bu iki cümle yazılı kalmazsa ilk güncellemede "şu yetenek biraz daha güçlü olsun" diye
delinir. Mağaza yorumlarında bunun bedeli ağırdır.

---

## 4. BİRLİK GÖRÜNÜMÜ — YAKINLAŞINCA FİGÜR

İki gerçek kısıt:

- **Performans:** 262 rozete kadar çıkabiliyor; rozetleri tek tek canlandırma denendi ve
  oyun dondu (`Rozet.js` başlığı). Figürler **hareketsiz** olacak.
- **Yer darlığı:** **18 il tek parça · 38 il iki · 13 il üç · 12 il dört parça.**

### Çözüm: rozet yakınlaşınca "kadro şeridi"ne açılır

| Yakınlık | Görünen |
|---|---|
| Uzak | Bugünkü kalkan + toplam sayı (hiç değişmiyor) |
| Yakın | Kalkanın altında en çok **3 küçük figür** (piyade · topçu · zırhlı), her figürün yanında kendi sayısı |

- Bir parçada tek ordu var; "3 parçalı ilde 3 farklı birlik" durumu **her parçanın kendi
  şeridi** olarak çözülür.
- Şerit yalnızca yakınlaşma eşiği aşılınca kurulur. Yakınlaştırma zaten rozet yerlerini
  yeniden hesaplatan tek olay — yeni bir kırılganlık doğmuyor.
- **Ölçüm borcu:** en küçük parçada şerit okunuyor mu? `scripts/parca-olcum.js` kalıbıyla
  ölçülmeden kapanmaz.
- Animasyon yalnızca savaş gösterisinde (`SahneKatmani`): figür ok boyunca ilerler,
  çarpışmada sarsılır.

---

## 5. ÖDÜLLÜ REKLAM (tek oyunculu, botlara karşı)

İlke: **kalıcı güç değil, ikinci şans.**

| Ödül | Ne yapar |
|---|---|
| Yenilgiden dön | "Kaybettin" ekranından 3 tur öncesine döner |
| Turu geri al | Son turun başına döner |
| Casus raporu | Bir rakibin ordusunu ve araştırmasını gösterir |
| Acil seferberlik | Bir tur üretim sınırını aşar |

**Sınırlar:** maç başına toplam 3 kullanım. Meydan okuma, dereceli ve çok oyunculuda
**tamamen kapalı**.

**İki yeni mühür:** **TEMİZ ZAFER** (hiç ödül kullanmadan kazanmak) ve **KİRLİ ZAFER**
(ödüllerle kazanmak — ceza değil, gülümseten bir kayıt).

⚠ Uygulama anında iki yer birden güncellenir: `src/para/reklam.js` (YASAK_ODULLER +
kırmızı çizgi yorumu) ve `docs/il-savasi-tasarim.md` §12.4.

---

## 6. ARA REKLAM YERLEŞİMİ

- Yeri: tur gösterisi bittikten sonra, yeni tur perdesinde (`TurPerdesi`).
- Şart: **en az 8 tur VE en az 5 dakika** geçmiş olacak.
- İlk maç tamamen reklamsız. Maç sonu reklamı ana menüye dönüşte.
- Komutan Paketi alan hiç görmez.

---

## 7. MERKEZ PARÇA (il fethinin zorlaşması)

**Sorun:** illerin **%69'u** (18 tek + 38 çift parçalı) en çok iki hamlede düşüyor;
"ilhak ettim" hissi ucuz.

**Kural:** Her ilin bir **merkez parçası** olur (veride merkez noktası zaten var).

- Merkez parçanın garnizonu ve savunma bonusu belirgin şekilde yüksektir.
- İl, merkezi alınmadan **tamamlanmış sayılmaz**.
- Tek parçalı ilde merkez zaten tek parçadır; zorluk garnizon farkından gelir.
- Büyük illerde merkez daha da güçlüdür (parça sayısına bağlı tek katsayı).

**Son direniş kuralı iptal** (Baki: merkez parça yeterli). Not: merkez parça tek başına
yetmezse geri dönülecek yer burasıdır.

⚠ **Bedeli:** fetih hızını doğrudan değiştirir. `denge-simulasyonu.js` ile önce/sonra
ölçülmeden kapanmaz ve **yayından sonra** yapılır.

---

## 8. ÇOK OYUNCULU

### 8.1 İnternet araştırması (2026-09-18)

| Oyun / kaynak | Ne yapıyor | Dersi |
|---|---|---|
| **Polytopia** | Asenkron **5–12 kişi**, **24 saat** tur süresi, boş yerleri **bot** doldurabiliyor | Bot doldurmak türün standardı |
| **OpenFront.io** | Her halka açık maçta **400 bot**; botlar doldurucu ve hızlı büyümeyi frenliyor | **79 bot kusur değil, tasarım aracı** |
| **Süper Auto Pets / Mechabellum** | Kaydedilmiş **hayalet** rakiplere karşı oynanıyor; belirlenimci motor sonucu her cihazda aynı üretiyor, bu hile de engelliyor | Bizim motorumuz buna hazır (§8.3/1) |
| **Davet kodlu özel oda** | Küçük oyuncu tabanında halka açık eşleştirme yerine kodla arkadaş çağırma | İlk adım bu olmalı |

### 8.2 Sıra

**1 · DÜELLO (davet kodlu, asenkron, 2–4 kişi)**
- Oda kodu WhatsApp'tan gider. Halka açık eşleştirme yok.
- Tur süresi 24 saat; süre dolarsa o turu **bot oynar**, oyuncu atılmaz.
- **Komşu kilidi (✅ karar):** oyuncular başlangıç illerini kendi seçer, ama seçilen ilin
  belli mesafedeki komşuları kapanır. Mevcut komşuluk verisiyle tek fonksiyon.
- Botlar bu modda savunmacı: insanlara savaş ilan etmez. Tek düğme, kişilik ağırlıkları.

**2 · İSYAN MODU** (§8.4)

**3 · TÜRKİYE KAPIŞMASI (6–8 kişi)**
- Oda oyuncu bekleyip takılmaz: geri sayım biter, boş yerleri bot alır, maç başlar.
- **Randevulu maç:** her akşam sabit saatte büyük maç. Az oyuncuyu aynı ana toplamanın
  bilinen tek çaresi.
- ⚠ Halka açık eşleştirme, günlük aktif oyuncu belli bir sayıyı geçmeden açılmaz.

### 8.3 Sunucu gerektirmeyen iki ek fikir (araştırmadan çıktı)

1. **HAYALET DÜELLO.** Rakibin gerçek maçındaki emirleri saklanır; sen o kayda karşı
   oynarsın. Rakip çevrimdışı olabilir, oyuncu sayısı az olabilir — maç yine de "insana
   karşı" hissettirir. Motorun belirlenimci olması (`Math.random` hiç kullanılmıyor) bunu
   doğrudan mümkün kılıyor; saklanan şey koca bir maç değil, **tohum + emir listesi**.
2. **TOHUM KODU MEYDAN OKUMASI — sunucu YOK, bugün bile yapılabilir.** Maç sonunda kısa bir
   kod çıkar: *"Bu haritayı 30 turda aldım, sen dene."* Kod WhatsApp'tan gider, arkadaşın
   **birebir aynı maçı** oynar, sonuçlar kıyaslanır. Çok oyunculunun en ucuz hâli ve
   şehir rekabeti paylaşımıyla aynı kastan. **Öneri: v1.1'e alınsın.**

⚠ Belirlenimcilik iki farklı telefonda birebir tutmalı; mimari buna bağlanmadan önce
ölçülür.

### 8.4 İSYAN MODU — "elenen dışındaki botlar ne olacak?"

Baki'nin sorusu haklı: elenen herkes asi olursa harita geç turda asi denizine döner ve
fetih anlamsızlaşır. Ayrım şöyle:

| Kim elendi | Ne olur |
|---|---|
| **İnsan oyuncu** | Toprakları **ASİLER**'e geçer. Modun amacı bu: elenen oyuncu maçtan kopmaz, asi güç olarak oynamaya devam eder |
| **Bot** | Normal fethedilir, asi olmaz. Ama fetheden taraf **isyan riski** alır: yeni alınmış ve merkeze uzak parçalarda birkaç tur asi birlik çıkabilir |

- **ASİLER tek bir ortak güçtür**, diplomasi yapmaz, kimseyle barışmaz, herkese saldırır.
- **Asi kazanamaz.** Hedefi "en çok zarar"dır ve kendi mührü vardır.
- Asiler bastırılmazsa büyür, bastırılırsa söner. Büyüme hızı `denge.js`'te tek sayıdır.
- **Tek oyunculuda (✅ önce burada denenecek):** oyuncu elenince "Kaybettin" ekranı yerine
  **Asi Komutan** olarak devam etme teklifi gelir. Ödüllü reklamın "yenilgiden dön"
  ödülüyle çakışmaz: biri zamanı geri sarar, bu ise yeni bir rolle devam ettirir.

---

## 9. SIRA

| Sürüm | İçerik |
|---|---|
| **v1 (şimdi)** | Oyun olduğu gibi yayınlanır. Bu belgeden hiçbir şey girmez |
| **v1.1** | Ara + maç sonu reklamı · dört ikinci şans ödülü · Komutan Paketi · çay ısmarla · gösteriyi atla · maç tekrarı · paylaşım kartı · **tohum kodu meydan okuması** · Temiz/Kirli Zafer |
| **v1.2** | Harita temaları · il rengi/mührü · kalkan simgeleri + kadro şeridi · günlük/haftalık meydan okuma · komutan rütbesi · lider isimleri |
| **v1.3** | Haritada komutan birimi + yetenekler · merkez parça · **isyan modu (tek oyunculu)** |
| **v1.5** | Düello (davet kodlu asenkron) · hayalet düello · dereceli · Memleket Ligi · Türkiye Kapışması |

---

## 10. KARARA BAĞLANANLAR (2026-09-18) VE KALAN SORULAR

| Soru | Karar |
|---|---|
| Mareşal | ✅ Onur unvanı — 34 mührün tamamı (§3.1) |
| Dış yedek | ✅ GitHub'da **özel** depo açılacak (§0) |
| Komutan yetenek kapsamı | ✅ Dört çeşit × üç kademe (§3.4) |
| Tohum kodu meydan okuması | ✅ **v1.1'e alındı** (§8.3/2, §9) |

**Kalan sorular — uygulama adımı açılırken cevaplanacak:**

1. Komutanın moral etkisinin büyüklüğü. Tahminle değil `denge-simulasyonu.js` ölçümüyle
   verilecek bir sayı (proje geleneği).
2. Merkez parça garnizon katsayısı. Aynı şekilde ölçümle.
3. Asilerin büyüme hızı ve kaç tur sonra söndüğü. Önce tek oyunculuda denenecek.

---

## 11. KAYNAKLAR

- TSK rütbe sırası: https://tr.wikipedia.org/wiki/T%C3%BCrkiye'nin_asker%C3%AE_r%C3%BCtbeleri
- Polytopia asenkron çok oyunculu (5–12 oyuncu, 24 saat tur):
  https://en.wikipedia.org/wiki/The_Battle_of_Polytopia ·
  https://statelyplay.com/2018/01/16/battle-of-polytopia-going-multiplayer/
- OpenFront.io bot doldurma ve oda ayarları: https://openfront.miraheze.org/wiki/Bots ·
  https://openfront.miraheze.org/wiki/Game_Settings
- Hayalet (kayıtlı rakip) düellosu: https://kluppy.com/en/help/features/what-is-a-ghost-duel-asynchronous/
- Belirlenimci motorun tekrar ve hile korumasına etkisi:
  https://steamcommunity.com/app/669330/discussions/0/6980058383081206081/
- Davet kodlu özel oda tasarımı:
  https://multiplayguide.com/blog/multiplayer-join-codes-private-lobbies/
