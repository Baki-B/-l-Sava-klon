# v1.1 YOL HARİTASI — GÖREV 16, 17, 18, 19

> Tarih: **2026-09-19** · Baki: *"Çok oyunculu kısmı hariç hepsini eklemeni istiyorum,
> nasıl ekleneceğini tasarımsal detaylarıyla iyice düşün."*
>
> Kaynak kararlar: `docs/GOREV-14-komutan-para-ve-cok-oyunculu.md`
> Devam eden iş: `docs/GOREV-15-aninda-cozum.md` (Adım 1 bitti)
>
> ⚠ Bu belge **plan**dır. Her görev kendi `GOREV-XX-*.md` belgesiyle açılır, adımları
> ayrı ayrı Baki'nin onayıyla yürür (CLAUDE.md §7).

---

## 0. SIRA VE NEDEN BU SIRA

| Sıra | Görev | Niye burada |
|---|---|---|
| **1** | **Görev 15** — anında çözüm (devam ediyor) | Tur akışını ve hareketi değiştiriyor. Komutan, merkez parça ve maç tekrarı hep buna dayanıyor; önce bu oturmalı |
| **2** | **Görev 16** — Komutan | Dengeye dokunuyor. Görev 15'in ölçümü bitmeden ölçülemez |
| **3** | **Görev 17** — Merkez parça + kadro şeridi | Aynı ölçüm koşusunu paylaşıyor (fetih hızı) |
| **4** | **Görev 18** — Konfor, maç tekrarı, meydan okuma, paylaşım | Dengeye dokunmuyor, sunucu istemiyor. Kod tarafı bağımsız |
| **5** | **Görev 19** — Para altyapısı | **İki kapıya bağlı:** Expo Go biter, Play Console hesabı gerekir (§19.0) |

**Çok oyunculu bu haritada yok** (Baki'nin isteği). Memleket Ligi, Düello, Hayalet Düello
ve Türkiye Kapışması `GOREV-14` belgesinde bekliyor.

---

## GÖREV 16 — KOMUTAN

### 16.1 Oyuncunun rütbesi (denge etkisi SIFIR)

**Saklanmaz, türetilir.** Projenin "il sahipliği saklanmaz, türetilir" kuralının aynısı:
rütbe kazanılan mühürlerden hesaplanır, kayda ayrı bir alan yazılmaz. İki kaynak olursa
biri eskir.

- Mühür puanı: bronz 1 · gümüş 2 · altın 3 (`basarimlar.js` kademeleri zaten var).
- 14 rütbe eşiği `DENGE.RUTBE.ESIKLER` dizisinde — tek yerde, ölçülüp ayarlanabilir.
- **Mareşal** eşikte değil: 34 mührün **tamamı** toplanınca gelen onur unvanı.
- Ekran: ana menüde adın altında rütbe; Başarım ekranında "bir sonraki rütbeye kalan".

### 16.2 Rakip illerin liderleri

Yeni dosya `src/oyun/liderler.js` + veri tablosu `veri/liderler.js` (`husumetler.js`
kalıbı: tabloyu insan yazar, kod uydurmaz).

```
liderAdi(tohum, ilKodu) → { unvan: 'Paşa', lakap: 'Demir Yumruk', tamAd: 'Konya Paşası — Demir Yumruk' }
```

- **Unvan bölgeden gelir** (`veri/iller.json`'da `bolge` alanı var): Karadeniz → Reis,
  Doğu/Güneydoğu → Bey, İç Anadolu → Ağa, Marmara/Ege/Akdeniz → Paşa. ⚠ **Vali yok** —
  gerçek devlet görevi.
- **Lakap kişilikten doğar.** Baskın huy (saldırganlık · açgözlülük · husumet · temkin)
  hangisiyse o havuzdan tohumla seçilir. Havuz 4 huy × 6 lakap = 24 satır. Böylece ad
  oyuncuya **bilgi** verir: "Demir Yumruk" duyan saldırgan bekler.
- **7 hasım çiftinin (14 il) liderleri elle yazılır** ve sabittir. Kutsal düello kartında
  iki ad karşı karşıya gelir; olayın adı olur.
- Görünürlük mevcut **TANIDIK** kuralına bağlı: tanımadığın ilin lideri "—".
- Test: aynı tohum aynı lider · lakap huyla tutarlı · hasım adları sabit.

### 16.3 Haritada komutan birimi

**Veri** (kayıt sürümü artar):

```
durum.komutanlar['16'] = { parcaId: '16-1', yetenek: 'celikYurek', kademe: 2, bekleme: 0 }
```

| Konu | Karar |
|---|---|
| Kaç komutan | Aktör başına **bir** (oyuncu ve her bot) |
| Atama | Ordular ekranından bir parçaya. Tur başına bir kez değiştirilebilir |
| Görünüm | O parçanın kalkan rozetinde küçük mühür işareti. Yeni katman yok, animasyon yok |
| **Hareket** | Komutan bir parçada durur. Oradan ordu çıkarken emir onayında **"komutan da gitsin"** kutusu çıkar (yalnızca komutan o parçadaysa). Kutu işaretliyse hedefe geçer, değilse yerinde kalır. Oyuncuya sorulmayan bir kural yerine tek kutu: anında çözümle uyumlu ve belirsizlik bırakmıyor |
| Bozgun | Komutanın bulunduğu ordu bozulursa komutan `DENGE.KOMUTAN.BEKLEME` tur atanamaz. Esir/ölüm yok |
| Botlar | `zeka.js` komutanı en güçlü ordusuna atar; yeteneği kişilikten seçer (saldırgan → Silah Ustası, temkinli → Çelik Yürek). Belirlenimci, gizli bonus yok |

### 16.4 Dört yetenek × üç kademe — hepsi MEVCUT kanallardan geçer

**Yeni muharebe formülü açılmıyor.** Her yetenek oyunun zaten kullandığı bir düğmeye basıyor:

| Yetenek | Kanal | Kademe 1 · 2 · 3 |
|---|---|---|
| **ÇELİK YÜREK** | Bozgun eşiği (moral kalemi — düellonun kullandığı kanalın aynısı) | +1 kalem · +2 kalem · **bozgun kapalı: ölümüne savaşır** |
| **SİLAH USTASI** | Araştırma seviyesi (atamada bir birlik türü seçilir) | O tür +1 · +2 · +3 seviye gibi savaşır, **dal tavanı aşılmaz** |
| **DAĞ KOMUTANI** | Arazi çarpanı | Tepelik/dağlık cezasını kademeli hafifletir |
| **SEFERBERLİK USTASI** | Toplanma | Komutanın parçasında ve komşularında toplanma maliyeti düşer / dolum artar |

**Üç koruma kuralı (P2W şikâyetini engelleyen şey):**
1. Dikey ilerleme **oynayarak** kazanılır; para yalnızca kestirmedir (tasarım §12.2/1).
2. Yatay çeşitler birbirinin üstü değil alternatifi.
3. İnsan rakipli maçta kademeler eşitlenir.

**⚠ İki ölçüm borcu:**
- **Çelik Yürek kademe 1–2 için tavan gerekli.** Bugünkü en yüksek bozgun eşiği %81,5
  (moral statı 7 + üç durum kalemi). Üstüne +2 kalem binerse %97,5 olur, yani kademe 3'ün
  bedava hâli. Tavan: **%90**. Kademe 3 bilinçli olarak tavanın dışında.
- **Dağ Komutanı §3.7'yi kırabilir.** "Zırhlı topçuyu ovada yener, topçunun tek şansı
  coğrafya" kısıtı kılıç sırtında duruyor (dağlık 1.30'da topçu 0.12 farkla kazanıyor).
  Yeteneğin etkisi `scripts/muharebe-referans.js` 15 satırı geçmeden kapanmaz.

---

## GÖREV 17 — MERKEZ PARÇA VE KADRO ŞERİDİ

### 17.1 Merkez parça (fetih ucuzluğunun ilacı)

**Sorun ölçülü:** 18 il tek parça · 38 il iki · 13 il üç · 12 il dört. İllerin **%69'u** en
çok iki hamlede düşüyor.

- **Merkez hangi parça:** veriden üretilir (il merkez noktasına en yakın parça), `parca-uret.js`
  çıktısına `merkez: true` yazılır ve `veri-dogrula.js` her ilin **tam bir** merkezi
  olduğunu denetler. Koda il listesi yazılmaz.
- **İki etki, ikisi de mevcut kanal:** garnizon boyu katsayısı (`GARNIZON`) + savunmada bir
  moral kalemi. Yeni formül yok.
- Büyük ilde merkez daha güçlü: katsayı parça sayısına bağlı tek sayı.
- **Son direniş kuralı iptal** (Baki: merkez parça yeterli).
- **Ölçüm:** `denge-simulasyonu.js` ile fetih sayısı önce/sonra. Ölçüt: fetih **azalsın ama
  dünya kilitlenmesin** — 2026-08-12'de kırılan kilit (fetih 241 → 513) geri gelmemeli.

### 17.2 Kadro şeridi (yakınlaşınca birlik figürü)

| Yakınlık | Görünen |
|---|---|
| Uzak | Bugünkü kalkan + toplam sayı (değişmiyor) |
| Yakın (`DENGE.ROZET.SERIT_ESIGI` üstünde) | Kalkanın altında en çok 3 hareketsiz figür + her birinin sayısı |

- Figürler zaten var: `Ikonlar.js → BIRIM_IKONU` (savaş gösterisi kullanıyor).
- Şerit rozet katmanının **içinde** doğar, ayrı katman açılmaz; yakınlaştırma zaten rozet
  yerlerini yeniden hesaplatan tek olay.
- **Animasyon yok.** 262 rozeti canlandırmak oyunu bir kez dondurdu (`Rozet.js` başlığı).
- İki ölçüm: en küçük parçada okunurluk (`parca-olcum.js` kalıbı) ve kare süresi
  (`rozet-katman-olcum.js` kalıbı).

---

## GÖREV 18 — KONFOR, MAÇ TEKRARI, MEYDAN OKUMA, PAYLAŞIM

Hiçbiri dengeye dokunmuyor, hiçbiri sunucu istemiyor. Hepsi **ücretsiz**.

### 18.1 Gösteriyi atla
Gösteri oynarken bir "atla" düğmesi; `useSahne` kuyruğunu boşaltır, sonuç hemen yazılır.

### 18.2 Ayrıntılı tur raporu
Yeni ekran değil: `TurRaporu`'na ikinci sekme. Veri zaten var (`siraSonucu.satirlar`), uzak
olaylar dahil.

### 18.3 Maç tekrarı — **kayıt dosyasına DEĞİL, ayrı dosyaya**
Motor belirlenimci (`Math.random` hiç yok), yani tekrar için **tohum + oyuncunun hamle
günlüğü** yeterli; botların hamleleri tohumdan yeniden doğar.

⚠ **Kayıt boyutu tuzağı:** 50 turluk maçta ~250 hamle × ~40 bayt ≈ 10 KB. Oyun kaydı 22
KB'lık ölçülü bir sınırda (`veri/kayit-boyut-olcum.md`); günlüğü oraya koymak sınırı
deldirir. Bu yüzden tekrar **ayrı bir dosyada** saklanır ve yuvalardan bağımsızdır.

Oynatma: tohumdan yeni oyun kurulur, günlük sırayla uygulanır, gösteri hızlandırılmış oynar.

### 18.4 Günlük ve haftalık meydan okuma
- Tohum **tarihten** üretilir (örn. 20260919) → herkes aynı haritayı, aynı bot huylarını
  alır. **İnternet gerekmez.**
- Hedef = mevcut mod sistemi + bir koşul ("20 turda 12 parça").
- Zorluk bronz/gümüş/altın → mühür kademeleri zaten var.
- Kayıt: hangi gün hangi kademe alındı (`basarimKaydi` yanında küçük bir tablo).
- ⚠ Meydan okumada **ödüllü reklam ve geliştirici modu kapalı**.

### 18.5 Şehir rekabeti paylaşımı — iki aşamalı
- **Şimdi:** metin paylaşımı. React Native'in yerleşik `Share`'i Expo Go'da çalışıyor:
  *"KONYA · 34 turda Türkiye'yi fethetti · Zor · İL SAVAŞLARI"*.
- **Sonra (Görev 19 ile):** görsel kart. Ekran görüntüsü almak yerel kod istiyor
  (`react-native-view-shot`), yani development build'i bekler. Aynı kapıdan geçtiği için
  para altyapısıyla aynı sürüme bırakıldı.

### 18.6 Tohum kodu meydan okuması (⚠ Baki'ye soru)
*"Bu haritayı 30 turda aldım, sen dene"* — kod WhatsApp'tan gider, arkadaş **birebir aynı
maçı** oynar. Sunucu yok, çok oyunculu altyapı yok; teknik olarak 18.4'ün kardeşi.
Baki çok oyunculuyu kapsam dışı tuttu ama bu ona girmiyor — **dahil edilsin mi?**

---

## GÖREV 19 — PARA ALTYAPISI

### 19.0 ⚠ İKİ KAPI — bu görev onlar olmadan başlamaz

1. **Expo Go biter.** Reklam ve satın alma SDK'ları yerel kod içerir. Telefonda test etme
   şeklin **development build**'e döner (`eas build --profile gelistirme`). Geri dönüşü var
   ama akış değişir.
2. **Play Console hesabı gerekir.** Uygulama içi ürünler (Komutan Paketi, çay) Play
   Console'da tanımlanmadan **test edilemez**. Kod hazır olabilir, ürünler hesap açılınca
   tanımlanır.

Ayrıca: gizlilik politikası ve **Veri Güvenliği formu yeniden yazılır** (AdMob cihaz
tanımlayıcısı topluyor) ve yaş derecesine göre kişiselleştirilmiş reklam kapatılır.

### 19.1 Reklamlar
- Kütüphane: `react-native-google-mobile-ads`. Kimlikler `app.json`'a, anahtar
  `src/para/reklam.js`'te (`REKLAM_HAZIR`).
- **Ara reklam:** tur perdesinde, "en az 8 tur **ve** en az 5 dakika" şartıyla. İlk maç
  reklamsız. Maç sonu reklamı ana menüye dönüşte.
- **Dört ödüllü reklam:** yenilgiden dön · turu geri al · casus raporu · acil seferberlik.
  Maç başına toplam 3 kullanım (`durum.sayaclar`). Meydan okuma ve derecelide kapalı.

⚠ **"Yenilgiden dön" ve "turu geri al" anlık görüntü ister.** Son 3 turun tam durumu
gerekiyor: 3 × ~22 KB. Karar: **yalnızca bellekte** tutulur, kayda yazılmaz — oyun
kapanınca hak düşer. Kayıt sınırı bu yüzden bozulmuyor.

- **İki yeni mühür:** TEMİZ ZAFER (hiç ödül kullanmadan kazanmak) · KİRLİ ZAFER (ödülle
  kazanmak; ceza değil, gülümseten bir kayıt).

### 19.2 Satın almalar
- **Komutan Paketi** (kalıcı): reklamlar kalkar + komutan görünümü + harita temaları +
  destekçi mührü.
- **Çay ısmarla** (tüketilebilir, üç boy): karşılığı destekçi rozeti.
- **Kozmetik paketleri:** harita teması · il rengi/mührü · birlik simge seti · fetih efekti.
- **Sunucu gerekmiyor ve bu bilinçli:** satılan hiçbir şey oyun gücü değil (üstünlük
  satılmaz kuralı). Play Billing'in imzalı yanıtı yerelde doğrulanır; hile riski yalnızca
  kozmetiği ve reklamsızlığı etkiler, dengeyi etkilemez.
- Sahiplik kaydı `basarimKaydi` yanında ayrı bir dosyada (`dukkanKaydi`).

### 19.3 Kozmetiklerin kazanılma yolu
Tasarım §12.2'nin kestirme modeli: her kozmetik **ya meydan okumayla kazanılır ya satın
alınır**. Ayrı bir oyun parası (altın/elmas) **yok** — karmaşıklık katardı.

---

## CEVAP BEKLEYEN SORULAR

1. **Komutanın hareketi:** emir onayında "komutan da gitsin" kutusu uygun mu? (§16.3)
2. **Silah Ustası'nın birlik türü** atama anında mı seçilsin (öneri), yoksa yetenek üç ayrı
   yeteneğe mi bölünsün?
3. **Tohum kodu meydan okuması** bu pakete dahil mi? (§18.6)
4. **Görev 19'un iki kapısı:** development build'e geçmeye ve Play hesabını açmaya hazır
   mısın? Değilse Görev 19 beklemeye alınır, 16–18 tamamlanır.
