# GÖREV 16 — KOMUTAN

> Tarih: **2026-09-20** · Kaynak kararlar: `docs/GOREV-14-komutan-para-ve-cok-oyunculu.md`
> §3, plan: `docs/YOL-HARITASI-v11.md` §16.
>
> Önceki görev (`GOREV-15`) tur akışını değiştirdi ve kapandı. Bu görev, oyuna **komutan**
> fikrini üç ayrı katmanda getiriyor: oyuncunun rütbesi, rakip illerin liderleri, haritadaki
> komutan birimi.
>
> ⚠ CLAUDE.md §7: adımlar birleştirilmez, her adım Baki'nin doğrulamasıyla kapanır.

---

## 1. BAKİ'NİN KARARLARI (2026-09-17/19)

| Konu | Karar |
|---|---|
| Rütbe | Gerçek TSK sırası, **14 kademe** (Er → Orgeneral). Rütbe oyuncunun kendi kariyeri, ülke yöneticisi havası YOK |
| Mareşal | Merdivende değil: **34 mührün tamamını** toplayana verilen onur unvanı |
| Rakip il liderleri | **Gerçek isim YOK.** Unvan + lakap, tohumdan türetilir; 7 hasım çiftinin liderleri elle yazılır |
| Komutan birimi | Haritada olacak. Yeni birim türü değil: **bir orduya takılan işaret** |
| Komutanın hareketi | Orduyla birlikte gider (emir onayında "komutan da gitsin") |
| Esir/ölüm | YOK. Ordu bozulursa komutan bir süre yeniden atanamaz |
| Yetenekler | **Dört çeşit × üç kademe.** Silah Ustası, komutanın atandığı ORDUYA göre değişir |
| Satış kuralı | **Üstünlük satılmaz:** kademeler oynayarak kazanılır, para yalnızca kestirmedir; insan rakipli maçta kademeler eşitlenir |

---

## 2. ADIMLAR

| Adım | İş | Dengeye dokunuyor mu |
|---|---|---|
| ✅ **1** | **Liderler motoru:** `veri/liderler.js` (unvan · lakap havuzları · hasım liderleri) + `src/oyun/liderler.js` + testler | Hayır |
| ✅ **2** | **Liderler ekranda:** diplomasi ekranı, savaş ilanı onayı, düello kartı, il paneli | Hayır |
| ✅ **3** | **Rütbe:** mühürlerden türetme + ana menü ve başarım ekranı | Hayır |
| ✅ **4** | **Komutan birimi motoru:** `durum.komutanlar`, atama, orduyla taşınma, moral kalemi, bozgun beklemesi, botların komutanı, kayıt sürümü 18 | **Evet** |
| ✅ **5** | **Yetenekler:** dört çeşit × üç kademe, Çelik Yürek tavanı, kademelerin mühürle açılması | **Evet** |
| ✅ **6** | **Komutan ekranda:** atama ekranı, rozette mühür işareti, "komutan da gitsin" kutusu | Hayır |
| ✅ **7** | **Ölçüm + belge:** `komutan-olcum` (yeni) ve `muharebe-referans` (§3.7 tablosu), tasarım belgesi ve DURUM-RAPORU | — |

Sıra bilinçli: **dengeye dokunmayan üç adım önce.** Böylece komutan biriminin ölçümü
(Adım 7) yalnızca kendi etkisini görür, lider adlarıyla karışmaz.

---

## 3. ADIM 1 — LİDERLER MOTORU

### 3.1 Üç katman

```
unvan  ← ilin BÖLGESİNDEN        (Karadeniz → Reis, Ege → Efe, …)
lakap  ← ilin KİŞİLİĞİNDEN       (baskın huy hangisiyse o havuzdan)
özel   ← HASIM ÇİFTLERİ          (7 çift · 14 il, elle yazılmış, sabit)
```

**Tohumdan türetiliyor, kayıtta tutulmuyor** — `kisilik.js`'in kuralının aynısı: aynı
tohumda aynı lider çıkar, kayıt dosyası büyümez. Kişilikler zaten tohumdan doğduğu için
lakap da onunla tutarlı olur.

### 3.2 Lakap süs değil, BİLGİ

Baskın huy hangisiyse lakap o havuzdan geliyor. Oyuncu adı okuyunca huyu tahmin
edebilmeli: *Demir Yumruk* saldırgan, *Yaşlı Tilki* temkinli. Böylece "tanıdıkça"
kuralı (§10) bir bilgi kanalı daha kazanıyor.

### 3.3 Veri dosyası, kod değil

`veri/liderler.js` — `husumetler.js` kalıbı: tabloyu **Baki** doldurur, kod hiçbir ad
uydurmaz. Yeni bir lakap eklemek = bir satır.

⚠ **Vali kullanılmıyor.** Gerçek bir devlet görevi; gerçek kişiyi çağrıştırır. Unvanlar
tarihî/kültürel: Paşa · Bey · Ağa · Reis · Efe.

### 3.4 Hasımların adı sabit

7 husumet çiftinin 14 ili, konularıyla uyumlu elle yazılmış lakaplar taşıyor (*Rize Reisi —
Tavşan Kanı*, *Kayseri Paşası — Çemenci*). Düello kartında iki ad karşı karşıya gelince
olay bir maçtan hikâyeye dönüşüyor.


---

## 4. ADIM 2 — LİDERLER EKRANDA (2026-09-20)

Dört yerde görünüyor, hepsi **aynı süzgeçten** geçiyor (tanıdıklar — §10). Tanımadığın ilin
başında kimin olduğunu bilmiyorsun; ikinci bir "tanıdık" tanımı yazılmadı (§10/4).

| Yer | Ne görünüyor |
|---|---|
| **İl paneli** | Sahibin adının altında tam ad: *"Konya Paşası — Demir Yumruk"* |
| **Diplomasi ekranı** | Dosya görünümünde ilin adının hemen altında |
| **Savaş ilanı onayı** | *"Rize Reisi — Tavşan Kanı ile savaşa giriyorsun…"* — ilan bir devlete değil, adı olan birine yapılıyormuş gibi okunuyor |
| **Düello kartı** | İki lakap karşı karşıya: *"Tavşan Kanı × Demli"* |

Kendi ilinin lideri YOK: oyuncunun huyu yok, kararları kendisi veriyor (karakter satırının
kuralının aynısı).


---

## 5. ADIM 3 — RÜTBE (2026-09-20)

**Mühürlerden türetiliyor, kayda yazılmıyor** (`src/oyun/rutbe.js`). Puan: bronz 1 · gümüş 2
· altın 3. Bugünkü liste **33 mühür = 71 puan** tavan veriyor.

On dört kademe (`DENGE.RUTBE.KADEMELER`): Er · Onbaşı · Çavuş · Başçavuş · Teğmen ·
Üsteğmen · Yüzbaşı · Binbaşı · Yarbay · Albay · Tuğgeneral · Tümgeneral · Korgeneral ·
**Orgeneral (65 puan)**. Son altı puan Mareşal'in: **bütün mühürler** toplanınca gelen onur
unvanı, merdivende değil ve rütbenin YERİNE yazılıyor.

Örnek ilerleme: 6 mühür → Çavuş · 12 → Üsteğmen · 18 → Yarbay · 24 → Tuğgeneral ·
30 → Korgeneral.

**Nerede görünüyor:** ana menüdeki MÜHÜRLER düğmesinin yanında (kaynağı orası) ve mühür
ekranının üstünde bir şerit olarak ("YÜZBAŞI 7/14 · Binbaşı'a 6 puan kaldı").

⚠ **Belgelerde "34 mühür" yazıyordu, gerçek sayı 33.** Kod artık sayıyı listeden sayıyor
(`BASARIMLAR.length`), yani mühür eklenince hedef kendiliğinden büyüyor. Eşikler ise elle
yazılı: `testler/rutbe.test.js` Orgeneral eşiğinin tavanın **%80–97** bandında kalmasını
kilitliyor — liste büyüyüp eşikler eskirse test öter.


---

## 6. ADIM 4 — KOMUTAN BİRİMİ MOTORU (2026-09-20)

**Yeni birim türü açılmadı.** Aktör başına tek komutan, bir parçada durur:
`durum.komutanlar['16'] = { parcaId, bekleme, atama }`. Kurallar `src/oyun/komutan.js`'te.

| Konu | Nasıl çalışıyor |
|---|---|
| Etki | **Moral kalemi** (`DENGE.KOMUTAN.MORAL_KALEMI = 1`) — kutsal düellonun kullandığı kanalın aynısı. Yeni muharebe formülü YOK |
| Atama | Kendi ordunun bulunduğu parçaya, **tur başına bir kez** (`TUR_BASINA_ATAMA`) |
| Taşınma | Emirde "komutan da gitsin" işaretliyse orduyla gider. **Taşıma atama hakkını harcamaz** |
| Bozgun | Komutanın olduğu ordu kırılırsa komutan düşer, **3 tur** (`BEKLEME`) atanamaz. Esir/ölüm yok |
| Savunanda | Parçasını kaybeden savunanın komutanı da düşer |
| Botlar | En kalabalık ordunun başına geçer; oyuncunun geçtiği aynı kapıdan (`komutanAta`), yani bekleme ve turluk hak onlara da işliyor |
| Kayıt | **Sürüm 18.** Ne sahada ne cezada olan komutan kayda yazılmaz |

**Ret sırası bir testle kilitlendi:** komutan cezalıyken hangi parçaya dokunulduğu
ikincildir — "burada ordun yok" demek soruyu yanlış cevaplamak olur, o yüzden önce
**bekleme**, sonra **hak**, en son **sahiplik** bakılıyor.

⚠ **Durumun iki yeni alanı baştan tanımlandı** (`oyunDurumu.js`): `komutanlar` ve
`turGunlugu`. Sonradan eklenmiş olsalar "kaydedilip yüklenen oyun birebir aynı" testi
anahtar sırasından ötüyordu — kayıt biçimi alan SIRASINI da sayıyor.

Testler: `testler/komutan.test.js` (18 test). Kontrol altı bölüm temiz, **721 test**.


---

## ADIM 5 NOTLARI (2026-09-20) — YETENEKLER

> Öncesinde bir **hata avı** yapıldı: `docs/HATA-AVI-2026-09-20.md`. Bulduğu 12 şeyden
> üçü tasarım sorusuydu ve Baki üçünü de cevapladı; dokuzu uygulama sırasında kapandı.

### Dört yetenek, dört MEVCUT kanal

| Yetenek | Kanal | Kademe 1 · 2 · 3 |
|---|---|---|
| **ÇELİK YÜREK** | Moral kalemi | +1 kalem · +2 kalem · **ya kazanır ya yok olur** |
| **SİLAH USTASI** | Stat tablosu (araştırmanın kanalı) | Seçilen tür +1 · +2 · +3 seviye gibi savaşır |
| **DAĞ KOMUTANI** | `ARAZI[x].savunan` | Savunanın arazi üstünlüğünün %30 · %45 · %75'i kırılır |
| **TOPLANMA USTASI** | Toplanma **bütçesi** | Komutanın parçası ve komşularında +1 · +2 · +3 bütçe |

Yeni muharebe formülü açılmadı; `muharebe-referans.js` yine **15/15**.

### Baki'nin üç kararı

1. **ÇELİK YÜREK 3 = "ya kazanır ya yok olur."** Plandaki *"bozgun kapalı: ölümüne
   savaşır"* motorda **tam tersini** yapıyordu: bozgun tetiklenmeyince muharebe raunt
   tavanında bitiyor, ordu **sağ çıkıyor** ve çekilme kaybını **ödemiyor**. Yani fedakârlık
   diye satılan şey bir kalkandı — üstelik Komutan Paketi onu parayla kestirmeye açıyordu.
   Yeni hâli gerçek bir kumar: ordu moralden asla bozulmaz ama kaybederse **tamamen yok
   olur**. İmha, `yarma` dalının zaten kullandığı kanal.
2. **DAĞ KOMUTANI savunanın arazi üstünlüğünü kırar**, zırhlının arazi cezasına dokunmaz —
   o ceza `palet` araştırmasının kanalı ve ikisi üst üste binse §3.7'nin "topçunun tek
   şansı coğrafya" kısıtı 0.12 farkla kırılırdı. Üstünlüğün **tamamı asla kırılmaz**.
3. **Botların yeteneği kişilikten, kademesi sabit.** Zorluğa bağlamak §9.4'ün
   *"zorluk = ağırlık ayarı, gizli bonus değil"* kuralını çiğnerdi. Baskın huy hangisiyse
   (`baskinHuy` — lakap seçiminin aynı fonksiyonu) yeteneği o belirliyor.

### Uygulamada çıkan dört tuzak

1. **⚠ TOPLANMA USTASI'NIN İLK HÂLİ TAMAMEN ÖLÜYDÜ.** Yüzdelik indirim olarak yazılmıştı
   (%15/%30/%45). Ölçüm hiçbir kademede hiçbir fark göstermedi: toplanma bedelleri birim
   başına **1–3** ve `Math.ceil` ile yukarı yuvarlanıyor — `3 piyade + 1 topçu` {7,5} →
   %45 indirimle yine **{7,5}**. Yol haritası (§16.4) zaten iki seçenek veriyordu
   (*"maliyeti düşer / **dolum artar**"*); ikincisi seçildi. Bütçe tarafının ek faydası:
   bedel hiç değişmediği için "ekranda görünen bedel ≠ ödenen bedel" ayrışması **imkânsız**.
2. **SİLAH USTASI araştırma nesnesine yazılsaydı özel dalları bedava açardı.**
   `ozelEtkiler` dört özel dalı `dalSeviyesi(...) > 0` diye yokluyor; +1 seviye **yarma ·
   palet · baraj · seferberlik** demek olurdu. Bonus yalnızca **stat tablosuna** uygulanıyor,
   test bunu kilitliyor.
3. **Yetenek üç yerde sessizce düşüyordu.** `komutanTuruBitir` ve `komutanDustu` kaydı
   sıfırdan kuruyordu — yetenek her tur silinir, yalnızca atandığı turda çalışırdı.
   Üçü de `...k` ile korundu, üçünün de testi var.
4. **⚠ `sira.js` CRLF'e döndü ve belirlenimcilik testini kırdı.** Test, yorumları
   `/\/\/.*$/` ile eliyor; JavaScript'te `.` satır sonlandırıcıyla eşleşmez ve `
`
   satır sonlandırıcıdır — yani CRLF dosyada ayıklayıcı **hiç çalışmıyor**. Test, kendi
   içinde "`Math.random` yok" YAZAN bir yorumu ihlal sandı. Ayıklayıcı `split(/
?
/)`
   ile sağlamlaştırıldı, dosyalar LF'e döndürüldü.

### Ölçüm: ittifak doygunluğu testi dürüstleştirildi

`DOYGUNLUK: 30 turda harita tek ittifak bloğuna dönüşmüyor` testi **tek tohumla** ölçüyordu
ve eşiği o tohumun sonucunun tam üstündeydi. Beş tohumla ölçüldü:

| | ittifaklı oran (5 tohum) | ortalama | en büyük blok |
|---|---|---|---|
| Adım 5 öncesi | 0.45 · 0.55 · 0.39 · 0.66 · 0.42 | **0.49** | — |
| Adım 5 sonrası | 0.61 · 0.52 · 0.57 · 0.55 · 0.53 | **0.56** | %10–23 |

Yani test zaten **5 tohumun 2'sinde kalıyordu**: "ittifak doygunluğu"nu değil "tohum şanslı
mı"yı ölçüyordu. Asıl değişmez — testin kendi yorumunun söylediği gibi — **en büyük blok**;
o da beş tohumda haritanın %10–23'ü, yani %50 sınırının çok altında. Test artık blok ölçüsünü
**her tohumda tek tek**, oranı ise **tohumlar ortalamasında** sınıyor.

⚠ **Yine de gerçek bir kayma var:** komutan yetenekleri ittifaklı oranı ~7 puan artırdı.
Zararsız görünüyor (bloklar küçük kalıyor) ama **Adım 7'nin ölçüm listesine** yazıldı.

### Dokunulan dosyalar

`src/denge.js` (MORAL.TAVAN · KOMUTAN.YETENEKLER · BOT_YETENEGI · BOT_KADEMESI) ·
`src/oyun/yetenek.js` (**yeni**) · `src/oyun/muharebe.js` (tavan · ölümüne · savunan arazi
çarpanı · `yokEt`) · `src/oyun/cozum.js` (üç dışa açık kapı) · `src/oyun/komutan.js`
(yetenekli atama · korunma · kayıt) · `src/oyun/toplanma.js` · `src/oyun/hareket.js` ·
`src/oyun/sira.js` (botun yeteneği) · `src/oyun/oyunDurumu.js` (**kayıt sürümü 19**).

Testler: `testler/yetenek.test.js` (**30 yeni**), `kayit.test.js` ve `diplomasi.test.js`
güncellendi, `zeka.test.js` sağlamlaştırıldı. Kontrol altı bölüm temiz, **789 test**.

### Baki telefonda ne görecek

**Henüz hiçbir şey** — ve bu bilinçli. Yetenekler motorda çalışıyor (botlar kullanıyor) ama
oyuncunun atama ekranı **Adım 6**'nın işi. Adım 5'in tek görünür etkisi: botların komutanları
artık huylarına uygun yetenekle savaşıyor.


---

## ADIM 6 NOTLARI (2026-09-20) — KOMUTAN EKRANDA

Adım 4–5'te komutan motora girmişti ama oyuncu onu **hiç göremiyordu**: yalnızca botlar
kullanıyordu. Bu adım o boşluğu kapattı.

### Üç görünür parça

| Nerede | Ne |
|---|---|
| **Ayarlar → KOMUTAN** | Yeni ekran: yetenek seç · kademe seç · (Silah Ustası ise) birlik seç · bir ordunun başına geçir |
| **Harita rozeti** | Komutanın olduğu kalkanın **konturu pirince** dönüyor |
| **Kuvvet seçici** | Komutan o parçadaysa **"KOMUTAN DA GİTSİN"** kutusu çıkıyor |

### Kademe mühürle açılıyor — ama motor mühür tanımıyor

`rutbe.js kademeHakki(muhurler)`: toplam mühür puanının **%25'i** kademe 2'yi, **%60'ı**
kademe 3'ü açıyor. Kademe 1 herkeste baştan açık, aksi hâlde komutan yeni oyuncuda hiç
çalışmazdı.

⚠ **Eşikler mutlak puan değil ORAN.** Mühür listesi büyüdüğünde (Görev 19'da 33 → 35 oldu)
mutlak eşikler sessizce kolaylaşırdı. Tavan `basarimlar.js`'ten **sayılıyor**, koda yazılmıyor.

⚠ **Mühürler motora girmiyor.** `basarimKaydi.js` onları cihazda tutuyor; kanca kademeyi
hesaplayıp `komutanAta`ya **veri olarak** geçiyor, motor yalnızca aralığa kırpıyor. Motor
mühür okusaydı `denge-simulasyonu` çalışmaz ve aynı tohum farklı sonuç verirdi
(`docs/HATA-AVI-2026-09-20.md` §3).

### Dört tasarım kararı

1. **Rozette yeni glif YOK, kontur değişti.** 26×26'lık kutu dolu (üstte pirinç şerit,
   ortada sayı, altta yıpranma çentiği). Dördüncü bir şekil ya sayıyı okunmaz yapardı ya
   kalkanı taşırırdı — ikincisi Adım 2'nin **bütün ölçümünü** geçersiz kılar. Kontur
   değişimi uzaktan ayırt ediliyor ve geometri bir piksel bile değişmiyor.
2. **Rozet işareti yalnızca OYUNCUNUN komutanında.** Botlarınki de gösterilseydi haritaya
   bakan oyuncu 80 rakibin komutanının yerini bedavaya öğrenirdi; oysa rakibin ordusunu
   görmek bile TANIDIK kuralına bağlı ve casus raporu bunun için **para** istiyor.
3. **"Komutan da gitsin" kutusu saldırı onayında DEĞİL, kuvvet seçicide.** Onay yalnızca
   saldırıda çıkıyor; oysa komutan kendi toprağına yapılan taşımayla da gitmeli. Kuvvet
   seçici iki durumda da açık — "ne gidiyor" kararının verildiği tek yer orası.
   ⚠ Seçenekler **saldırı onayı yolunda da taşınıyor**: onay araya girdiği için seçim
   bekletiliyor, bekletilmeseydi işaretlenen kutu sessizce düşer ve komutan geride kalırdı.
4. **Kutu varsayılan KAPALI.** Komutanın ordusu bozulursa komutan sahadan çekilip
   `BEKLEME` tur atanamıyor. Varsayılan açık olsaydı oyuncu her hamlesinde farkında olmadan
   komutanını riske atardı.

### Boşa giden yetenek artık söyleniyor

Hata avının §8'i: Silah Ustası, seçilen birliğin bütün stat dalları tavandaysa **hiçbir şey
yapmıyor** ve hata da vermiyor. Atama ekranı bunu yazıyor: *"Bu birliğin araştırması zaten
tavanda — yetenek burada bir şey yapmıyor."*

### Dokunulan dosyalar

`src/bilesenler/KomutanEkrani.js` (**yeni**) · `src/bilesenler/Rozet.js` (pirinç kontur) ·
`src/bilesenler/HareketEkrani.js` (kutu) · `src/bilesenler/AyarMenusu.js` (giriş) ·
`src/App.js` (bağlantı + seçeneklerin onay yolunda taşınması) · `src/oyunKancasi.js`
(`komutan` türetmesi, `komutanAta`, `komutanAtamaDurumu`, `komutanBuradaMi`, rozet bayrağı,
`emirVer` seçenekleri) · `src/oyun/rutbe.js` (`kademeHakki`, `kademeyeKalan`) ·
`src/denge.js` (`KADEME_ORANLARI`).

Testler: `yetenek.test.js`'e 5 kademe testi. Kontrol altı bölüm temiz, **794 test**.

### Baki telefonda ne görecek

1. **Ayarlar → KOMUTAN**: dört yetenek, üç kademe (kilitliler 🔒 ile ve "kaç puan kaldı"
   yazısıyla), ordu listesi. Bir orduya dokununca komutan oraya geçiyor.
2. **Haritada**: komutanın olduğu kalkanın kenarı pirinç renginde.
3. **Saldırırken**: komutan o bölgedeyse kuvvet seçicide "KOMUTAN DA GİTSİN" kutusu.


---

## ADIM 7 NOTLARI (2026-09-20) — ÖLÇÜM

Yeni betik `scripts/komutan-olcum.js` → `veri/komutan-olcum.md`. Üç ölçüm borcu kapandı:
`MORAL_KALEMI` (Adım 4), `BEKLEME: 3` (Adım 4) ve yeteneklerin dengeye katkısı (Adım 5).

Yöntem: aynı tohumla iki dünya — `DENGE.KOMUTAN.ACIK` kapalı ve açık. Bu anahtar
(`DIPLOMASI.ACIK` kalıbı) bu adımda eklendi; bir mekaniğin katkısı ancak kapatılıp
açılarak ölçülebiliyor.

### Sonuç: komutan savaşı keskinleştiriyor, dünyayı kilitlemiyor

| | Canlı aktör | En büyük aktör | Sahadaki birlik | En büyük yığın |
|---|---|---|---|---|
| KAPALI | 28.2 | 17.6 | 281.8 | 13.2 |
| AÇIK | 27.8 | **20.4** | 259.0 | 14.4 |
| fark | −1.4% | **+15.9%** | −8.1% | +9.1% |

- **Savaşlar daha kesin:** sahada %8 daha az birlik kalıyor. Beklenen yön — moral kalemi
  orduyu geç dağıtıyor, yani savaş sonuna kadar gidiyor.
- **Dünya kilitlenmedi:** 40. turda ~28 aktör yaşıyor, en büyüğü haritanın **%11'i**.
- **Silahlanma yarışı geri gelmedi:** zirve yığın 13.2 → 14.4 (2026-08-12'de kırılan
  yarışta 258'lik yığınlar vardı).
- ⚠ **+%16 en büyük aktör bir KARTOPU İŞARETİ.** Komutan "güçlüyü daha güçlü yapan"
  tarafta duruyor. Bugün zararsız ama bir sonraki denge turunda ilk bakılacak sayı bu.

### `BEKLEME: 3` doğrulandı

| Bekleme | Cezalı geçen tur | Yorum |
|---|---|---|
| 1 | 0.0 | Ceza fiilen yok — aynı turun sonunda sönüyor |
| 2 | 94.8 | Hafif |
| **3** | **183.6** | Seçilen: aktör-turların **%16'sı** |
| 5 | 355.0 | %32 — komutan zamanın üçte birinde sahada değil |

⚠ **Bir ölçüm körlüğü yakalandı:** ilk örnekleyici düşmeleri `bekleme` alanının
yükselişinden sayıyordu ve BEKLEME=1'de hiçbir şey göremiyordu — ceza aynı turun sonunda
sıfırlanıyor, örnekleyici ise tur sonunda bakıyor. Tablo "0 düşme" diye **yalan
söylüyordu**. Bu, Görev 15'te ölçüm aracının kör çıkmasıyla aynı sınıf hata: *bütün satırlar
aynı çıkıyorsa ÖLÇÜLMEMİŞ olabilir.*

### §3.7 bozulmadı

`muharebe-referans.js` → **15/15**. Dağ Komutanı'nın kırabileceği kısıt yerinde: yetenek
`ARAZI[x].savunan`a dokunuyor, zırhlının arazi cezasına (paletin kanalı) değil.

### Kalan borç Baki'de

Oyuncunun HİSSİ ölçülemedi ve ölçülemez: komutanın "değer mi" sorusu bir insan maçı
gerektiriyor. Aynı maç `SANIYE_PER_TUR = 45` borcunu da kapatıyor
(`docs/YAYIN-KONTROL.md` §5/1).

---

## GÖREV 16 KAPANDI

Yedi adımın hepsi bitti: lider adları · rütbe · komutan birimi · dört yetenek × üç kademe ·
komutan ekranda · ölçüm. Kayıt sürümü **19**, kontrol altı bölüm temiz, **794 test**.
