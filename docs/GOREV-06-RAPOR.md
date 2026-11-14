# GÖREV 06 — BİTİŞ RAPORU

> Tarih: 2026-07-30 / 31 · Görev tanımı: `docs/GOREV-06-toplanma-ve-arastirma.md`
> Önceki: `docs/GOREV-05-RAPOR.md` · Günlük: `veri/URETIM-NOTU.md`

---

## 1. TEK CÜMLEYLE

**Ordular artık yıprandıkça erimiyor; toparlanabiliyorlar. Ordunun kalitesi artık sabit
değil; araştırmayla kalıcı olarak yükseliyor.** Tur döngüsündeki iki boş aşama doldu.

Oyun bu görevden sonra **tam ekonomiyle tek başına oynanabilir**: kaynak üret, asker bas,
yürü, savaş, fethet, toparlan, güçlen. Eksik olan tek şey **düşünen bir rakip**.

---

## 2. ALTI SORUNUN CEVABI

| Soru | Cevap | Sonucu |
|---|---|---|
| 1 — Kaybedilen birlikler nerede tutulacak | **A** — her orduya `kadro` alanı | Toparlanmanın doğal üst sınırı doğdu |
| 2 — Toparlanan ordu o tur saldırıya uğrarsa | **B** — çözümden sonra, tur sonunda | Ordu o tur yıpranmış savunur; bedel gerçek |
| 3 — Araştırma puanı nasıl kazanılır | **A** — ekonomiden pay × eğitim çarpanı | Eğitim statı ilk kez bir işe yarıyor |
| 4 — Dallar, seviyeler, tavan | **A** — 3 dal · Sv.N → +N · tavan ölçümle | Tavan Sv.2 çıktı |
| 5 — Kartopu bu görevde ele alınsın mı | **A** — mekanik eklenmez, ÖLÇÜLÜR | `veri/denge-simulasyonu.md` |
| + Diplomasi kapsama girsin mi | **Hayır** | Görev 07'ye |

**Görev ortasında gelen iki ek istek** (2026-07-31) tamamlandı: **yaralı birlikler** ve
**arayüz dili sadeleştirmesi**. İkisi de aşağıda ayrı başlıklarda.

---

## 3. NE YAPILDI

**Yeniden toplanma (§3.9).** Ordu artık üç durum taşıyor: **sağlam · yaralı · ölü**. Kadro
(kağıt üstündeki mevcut) toparlanmanın üst sınırı; onsuz oyuncu 1 birliklik ordusunu her tur
yarı fiyata 20 birliğe "doldurur" ve sanayi sınırı anlamsızlaşırdı.

**Araştırma (§6).** Üç dal (zırh · ağır vuruş · hafif vuruş), imparatorluk çapında etki,
ölçümle konmuş Sv.2 tavanı. Ekonomiden ayrılan pay eğitim gücüyle çarpılıp puana dönüşüyor.

**Eğitim statı hayata döndü.** Görev 06'ya kadar oyunda hiçbir yere girmiyordu; artık
araştırmanın verimini belirliyor, yani **eğitimli il fethetmek somut bir ödül**.

**Tek havuz, üç musluk.** Ekonomi artık üç yere gidiyor ve ikisi tur sonunda düşüyor.
`src/oyun/butce.js` bunların toplamının aşılamadığı **tek yer**.

---

## 4. EN DEĞERLİ DERS: ÖLÇÜT DE ÖLÇÜLMELİ

Görev 05'in dersi "tasarım boşluğunu tahminle değil ölçümle kapat"tı. Bu görev onun üstüne
bir kat daha koydu: **ölçütün kendisi de yanlış olabilir.**

Araştırma tavanı **dört kez** ölçüldü, ilk üçü kullanılamaz cevap verdi:

| # | Ölçüt | Sonuç | Neden yanlış |
|---|---|---|---|
| 1 | "Kazanan değişmesin" | **Sv.0** | §3.7'de kazananın kendi kuvvetinin %7–18'iyle bitirdiği ÜÇ satır var. Orada kazananın değişmesi denge bozulması değil, **yazı-turanın öbür yüze düşmesi**. |
| 2 | Yazı-turayı affet | **Sv.12** | Bu sefer kıl payı kazanılan bir savaşın **kesin yenilgiye dönmesini** de affediyordu. |
| 3 | Kazanan değişti **ve** biri için sonuç kesindi | **Sv.3** | Doğru ölçüt ama yanlış model: yalnız sürekli modele bakıyordu. |
| 4 | Aynı ölçüt, **iki modelle** | **Sv.2** | Oyunun motoru daha hassas. Doğrusu bu. |

**Kesinlik eşiği (0.25) uydurma değil.** §3.7'nin 15 satırında kazananın kalan kuvvet
oranları sıralandığında `0.07 · 0.15 · 0.18` ile `0.29 · 0.30 · 0.31 …` arasında **boş bir
bant** var; eşik oraya kondu. O üç satır, Görev 05'te tam sayı sınırında beraberlik bozma
kuralını yazdıran satırların ta kendisi — iki bağımsız yoldan aynı üç satır işaretlendi.

**Dördüncü adım nasıl yakalandı:** Adım 3'te yazılan "TAVANIN ANLAMI" testi, Sv.3'te motorun
§3.7'nin iki satırını ters çevirdiğini gösterdi. Ölçüm betiği artık **iki modeli birden**
koşturuyor ve `DENGE` ile ayrışırsa uyarı basıyor.

**Zırhın Sv.3'te kırılması tasarımın kendi öngörüsü.** §3.3'te hafif vuruş etkinliği
`clamp(1 − zOrt/12, 0.10, 1.00)`; zırhlının zırhı Sv.3'te 11 olup **tabana oturuyor** ve
3 piyade 1 zırhlıyı yenemez hâle geliyor. Belgenin tahmini ("zırhlı 8'de, +4 ile eşiğe
varır") bir seviye iyimsermiş; gerçek eşik +3.

*Elenen hipotez:* "yumuşama sürekli modelin sabit Euler adımından gelen sayısal hata
olabilir". Alt adıma bölünerek sınandı — sayılar değişti ama **aynı satırlar yine ters
döndü**, yani kırılmalar gerçek.

---

## 5. GÖREV ORTASINDA GELEN İSTEK: YARALI BİRLİKLER

> Baki, 2026-07-31: *"Toparlanma emri verdiğimizde hepsi toparlanmak zorunda kalıyor; ben
> bunun yalnızca yaralı birlikler için geçerli olmasını, yaralı olmayanların savaşmaya devam
> edebilmesini istiyorum. Savaşlarda bazı birlikler ölsün, bazıları yaralansın, bazılarına
> bir şey olmasın (bir şey olmama durumu savaş kazanıldığında geçerli olur)."*

İki okuma vardı ve çok farklı iş demekti, o yüzden soruldu: **küçük düzeltme** (sadece kilidi
kaldır) ya da **gerçek yaralı durumu**. Baki ikincisini seçti.

**Kim yaralanır — yeni formül YOK.** Motor zaten bir **yıpranma oranı** tutuyordu (alınan
hasar / başlangıç canı) ve beraberlik bozmakta kullanıyordu. Hayatta kalanların bu oran
kadarı yaralı çıkıyor:

- ezici kazanan → oran ~0 → **kimseye bir şey olmaz** (Baki'nin istediği durum)
- kanlı zafer → bir kısmı yaralı
- bozulup kaçan → neredeyse hepsi yaralı

Muharebeye yaralı girip sağ çıkan yaralı kalır: **savaşmak kimseyi iyileştirmez.**

**Yaralı ne yapar:** aynı güçle vurur, **canı yarıdır** (`YARALI_CAN`). Tek etki bu — iki
etki olsaydı ikisinin dengesini ayrı ayrı ölçmek gerekirdi. Kayıpları **önce yaralılar**
verir; çekilme kaybında da geride kalan yaralıdır.

**§3.7'nin 15 satırı hiç etkilenmedi**, çünkü o tablo hep taze ordularla çalışıyor.
Yaralılık ancak ikinci savaştan itibaren devreye giriyor. Bu, isteğin ucuza karşılanmasını
sağlayan asıl şey oldu.

**Asıl istenen kısım:** toparlanma emri artık **yalnızca yaralıları** rezerve ediyor.
Sağlam birlikler aynı tur saldırabiliyor. Yalnızca ölü kaybı olan bir ordu, emir almış olsa
bile **tam güçle savaşıyor** — takviye henüz sahada değil, kimseyi bekletmiyor. Bunun için
yeni bir bayrak yazılmadı: rezervasyon defteri işi kendiliğinden yapıyor.

**Hareket bölünmesinde sağlamlar önce gider.** Oyuncu kaç birlik göndereceğini seçer,
hangilerini değil; sefere sağlam asker gider, yaralı geride kalır.

---

## 6. GÖREV ORTASINDA GELEN İSTEK: ARAYÜZ DİLİ

> Baki: *"Genel bir kelime sadeleştirmesi ve daha açıklayıcılık lazım; Türkçe cümle
> kurallarına uygun olsun, güzel okunsun."* Sonra: *"TUR TUR DÖKÜM kısmında açıklamaları
> beğenmedim, developer gibi arayüzü bırakalım."*

**Terim kararları** (kod adları değişmedi, yalnızca ekran metinleri):

| Kod | Ekranda | Neden |
|---|---|---|
| birim | **birlik** | Baki'nin kendi kelimesi |
| toplanma | **toparlanma** | Türkçede daha doğal |
| muharebe | **savaş** | Ağır terim, oyuncu "savaş" diyor |
| kuvvet | **birlikler** | |
| kadro | ekranda hiç geçmiyor | "eksik" yeterli |
| muharebe turu | **raunt** | Oyunun turuyla aynı kelimeydi, gerçekten karıştırıyordu |

**TUR TUR DÖKÜM tabloyu bıraktı.** Altı sütunluk bir tablo ve altında "iki sayı varsa soldaki
SENİN, sağdaki düşmanın…" diye bir kullanım kılavuzu vardı. Artık raunt raunt **cümle**:

> **3** · 1 birlik kaybettin, 2 birlik düşürdün.
> Vuruşun 24, onunki 18 · sende 5, onda 3 birlik kaldı · şans devreye girdi
> *Karşı tarafın morali bitmek üzere.*

Moral yalnızca **kritikken** yazılıyor; her raunt yazılsaydı gürültü olurdu.

**Cihazda bildirilen iki görsel hata düzeltildi:**

1. **Toparlanma kutusu sıkışıyor ve kırpılıyordu** ("yaralılar bu tur savaşmaz; sahada s…").
   Tek uzun cümleydi ve `numberOfLines={3}` kesiyordu. Artık panelin geri kalanıyla aynı
   **etiket/değer satırları**: `YARALI · KAYIP · BEDELİ`, altında sınırsız satırlı açıklama.
2. **Araştırma düğmesi** telefonda "ARŞ" diye kısaltılıyordu, okunmuyordu.

**Araştırma ikonu** (Baki isteği: *"HOI4'teki gibi balon joje"*): `IkonArastirma` — konik
erlen, boyun dudağı, içinde sıvı ve iki kabarcık. Çizgi değil **dolu** çizildi: tur
çubuğundaki düğme 15–19 piksel ve ince çizgi o boyutta kayboluyor. Sıvı zemin rengiyle değil
kendi rengiyle ayrılıyor — dişli çarktaki "halka" kuralının aynısı, her zeminde doğru görünür.

---

## 6b. CİHAZ TESTİNDE ÇIKAN ÜÇ HATA (2026-07-31)

### 1. Birlik eklemek tahmini KÖTÜLEŞTİRİYORDU

> Baki: *"1 piyade 1 zırhlı ile saldırıyorum ÜSTÜN diyor, 1 de topçu ekleyince DENK oluyor.
> Topçu eklenince daha güçlenmesi gerek."*

Haklıydı. Tahmin kademesi **`kalan ÷ gönderilen`** oranına bakıyordu ve **payda gönderdiğin
birlik sayısıydı**:

| Saldırı | Sağ kalanın | Oran | Kademe | Savunanın kalanı |
|---|---|---|---|---|
| 3 piyade + 1 zırhlı | 2 / 4 | %50 | **ÜSTÜN** | 1 (hayatta) |
| 3 piyade + 1 zırhlı + 1 topçu | 2 / 5 | %40 | **DENK** | **0 (yok edildi)** |

Yani savunanı tamamen silen saldırı, sağ bırakan saldırıdan kötü görünüyordu.

**Doğru ölçü kendi kaybın değil, muharebe sonundaki ÜSTÜNLÜK:**
`kalanın ÷ (kalanın + onun kalanı)`. Karşıda kimse kalmadıysa 1.00, başa başsa 0.50; eşik
`DENGE.MUHAREBE.USTUNLUK_ESIGI = 0.75`. Birlik eklemek senin kalanını artırır ve savunanın
kalanını azaltır — yani bu oran **hiçbir zaman düşmez**.

**Ölçüldü** (211.167 durumluk tarama, her kompozisyona her türden +1 birlik ekleyerek):

| | Tahminin kötüleştiği durum | Bunların UYDURMA olanı |
|---|---|---|
| Eski ölçü | 824 | **398** |
| Yeni ölçü | 1138 | **0** |

Yeni ölçüde kademe düşen 1138 durumun **tamamı**, motorun gerçekten daha kötü bir sonuç
ürettiği durumlar — yani tahmin artık yalan söylemiyor. Üç test kilitliyor.

### 2. Geliştirici modunda alınan ilin ordusu yerinde kalıyordu

> Baki: *"Kocaeli'yi aldım ama Kocaeli'nin askerleri ilde kaldı, bana geçmediler veya yok
> olmadılar."*

`parcayiVer` yalnızca `parcaSahipligi`'ni değiştiriyordu. Ortaya oyunun hiçbir yerinde
oluşamayacak bir durum çıkıyordu: **senin parçanda başkasının ordusu.** O parçadan emir
veremiyor, oraya asker basamıyordun — panel "senin" diyor, motor "değil" diyordu.

Ordu artık toprakla birlikte el değiştiriyor. **Yok edilmiyor, sana geçiyor:** (a) `geri ver`
düğmesi simetrik çalışsın, hiçbir bilgi kaybolmasın; (b) bu bir test aracı — aldığın toprağın
ordusuyla hareket ve muharebe denemek isteyeceksin. Gerçek fetihte ordu elbette savaşarak yok
oluyor (§3.9). İki test kilitliyor.

### 3. TUR TUR DÖKÜM "developer gibi"ydi

> Baki: *"Artık oyunda developer gibi arayüzü bırakalım, her şey oyuncuya hitap etsin."*

Altı sütunluk bir tablo ve altında *"iki sayı varsa soldaki SENİN, sağdaki düşmanın…"* diye
bir kullanım kılavuzu vardı. Tablo okumayı öğretmek yerine olanı anlatıyoruz artık:

> **3** · 1 birlik kaybettin, 2 birlik düşürdün.
> Vuruşun 24, onunki 18 · sende 5, onda 3 birlik kaldı · şans devreye girdi
> *Karşı tarafın morali bitmek üzere.*

Moral yalnızca **kritikken** yazılıyor. Ayrıca savaşın turlarına **raunt** dendi: oyunun
turuyla aynı kelimeydi ve *"4 muharebe turu"* gerçekten karıştırıyordu.

**Aynı geçişte düzelen iki görsel hata:** toparlanma kutusu sıkışıp kırpılıyordu (*"yaralılar
bu tur savaşmaz; sahada s…"*) — tek uzun cümle + `numberOfLines={3}` kesiyordu, artık
etiket/değer satırları ve sınırsız satırlı açıklama. Araştırma düğmesi telefonda "ARŞ" diye
okunmuyordu — yerine **erlen (balon joje) ikonu** geldi.

---

## 7. TASARIMDA DOLDURULAN BOŞLUKLAR

| Boşluk | Nasıl dolduruldu |
|---|---|
| Ordu bölününce kadro | Hasar havuzuyla **aynı kural, aynı fonksiyon** — `orduBol` artık `kadroBol`'u çağırıyor, kopyalamıyor |
| İki ordu birleşince | Kadrolar ve yaralılar toplanır |
| Takviye kadroyu artırır mı | Evet — parası ödenmiş birlik kadroya girer |
| Kaynak yetmezse | Görev 04'ün kısmi sipariş kalıbı: türlerden sırayla birer tane, oran korunur |
| Toparlanma kuyruğa girer mi | Evet; iptal edilebilir, rezervasyon defteri kullanılır |
| Fetihle araştırma devralınır mı | Hayır — aktöre ait, toprağa değil |
| Tarafsız garnizonun araştırması | 0 — garnizon belirlenimci kalıyor |
| Araştırma motora nasıl girer | `muharebeCoz` taraf başına **stat tablosu** alıyor; motor `DENGE.BIRIMLER`'i kendisi okumuyor |
| Araştırma geri alınabilir mi | Tur içinde evet (yığın mantığı), TURU BİTİR'den sonra hayır |
| İmha olan ordunun kadrosu | Silinir; sıfırdan basmak tam fiyat |
| **Eğitim payı hangi sütundan** | Parça belgesinde eğitim payı yok → **nüfus payı** kullanıldı |
| **Yaralı kim olur** | Hayatta kalanların **yıpranma oranı** kadarı |

---

## 8. BELGEYE UYMADIĞIM YERLER

1. **Kayıt sürümü 6, Adım 7'de değil Adım 4'te yükseltildi.** Durumun biçimi orada değişti;
   sürümü sonraya bırakmak, arada sürüm 5 kaydı yükleyip sessizce bozulmak demekti.

2. **`kadroAl` ve `kayitKadrosu` `toplanma.js`'te değil `ordu.js`'te.** Belge hepsini
   toplanma.js'e koyuyordu; döngüsel bağımlılık doğuyordu (toplanma.js → ordu.js →
   toplanma.js). Kayıt yapısının sahibi ordu.js.

3. **Toparlanma emrinin doğrulaması `hareket.js`'te.** Yaralı kuralı gelince emrin
   geçerliliği rezervasyon defterini okumayı gerektirdi ve defter orada. hareket.js zaten
   "ne emredebilirsin"in dosyası.

4. **"Her parça en az 1 üretir" kuralı eğitimde KAPATILDI.** Açık bırakılınca 9 ilde toplam
   318 → 331 şişiyordu ve **en çok eğitimi zayıf iller kazanıyordu** (Şanlıurfa 1 → 4) —
   statın ayırt etme işi tersine dönüyordu. O kuralın gerekçesi "hiçbir parça 0 ÜRETMEZ";
   eğitim akan bir kaynak değil.

5. **`butce.js` diye belgede olmayan bir dosya açıldı.** §9/7 "toplamın aşılamadığı tek
   yerde denetlenmeli" diyordu; o tek yer bir dosya olmayı hak etti.

---

## 9. YOL BOYUNCA BULUNAN VE DÜZELTİLEN ESKİ HATALAR

1. **`birimUret` hasar havuzunu siliyordu** (Görev 04'ten beri). Yıpranmış orduya 1 piyade
   basmak havuzu bedavaya temizliyordu — sessiz bir sömürü. Artık koruyor.

2. **`savunanKadro` → `savunanGiren`.** Rapor alanının adı "kadro" idi; bu görevde kadro
   ordunun kağıt üstündeki mevcudu anlamını kazandı ve iki anlam aynı ada bindi. Görev
   belgesi bunu §9/4'te "bu görevin en olası sessiz hatası" diye önceden yazmıştı.

3. **Emir okları ve emir listesi toplanma emrinde çökerdi** (`hedef` alanı yok).

---

## 10. DENGE ÖLÇÜMÜ — KARTOPUNUN BÜYÜKLÜĞÜ

`node scripts/denge-simulasyonu.js` → `veri/denge-simulasyonu.md`. Görev 05'in gözlemi elle
yapılmıştı; artık **oyuncu davranışı betikte yazılı ve tekrar edilebilir**. 15 tur:

| Koşu | Sınırsız bütçe | Gerçek gelir |
|---|---|---|
| Temel (Görev 05 oyunu) | 69/181 | 13/181 |
| + Toparlanma | 71/181 (+2) | **25/181 (+12)** |
| + Toparlanma + Araştırma | 73/181 (+4) | 22/181 (+9) |

**Okunuşu:** toparlanma para **kıtken** çok değerli (13 → 25, neredeyse iki katı), para
bolken az. Tasarımın istediği tam bu (§3.9/4: kayıp gerçekten cezalandırılır, sadece
sıfırdan basmaktan ucuzdur). Araştırma 15 turda kendini amorti etmiyor — uzun oyun yatırımı;
katkısının sınırlı kalmasının sebebi **tavan**: üç dal da en fazla Sv.2 olabildiği için
toplam yatırım 54 puanla sınırlı, yani araştırma **tek seferlik bir sıçrama, süren bir
kartopu değil.**

*Simülasyonda iki kurgu hatası düzeltildi (betikte yazılı): "her parçadan her şeyle saldır"
politikası kuvveti dağıtıyordu (26/181'de kalıyordu) ve toparlanma saldırıdan SONRA
çağrıldığı için hiç tetiklenmiyordu.*

**Görev 07 kartopu kararını bu tabloyla verecek.**

---

## 11. DEĞİŞEN DOSYALAR

**Yeni:**

| Dosya | İşi |
|---|---|
| `src/oyun/toplanma.js` | Kadro, yaralı, toparlanma bedeli ve çözümü, bölüşüm |
| `src/oyun/arastirma.js` | Dallar, eğitim gücü, puan, seviye, kaydırılmış stat tablosu |
| `src/oyun/butce.js` | Tek havuz üç musluk — harcanabilir bütçenin tek kaynağı |
| `src/bilesenler/ArastirmaEkrani.js` | Araştırma tam perdesi |
| `scripts/denge-simulasyonu.js` | Kartopu ölçümü |
| `veri/arastirma-olcum.md` | Tavan ölçümünün raporu |
| `veri/denge-simulasyonu.md` | Kartopu ölçümünün raporu |
| `testler/toplanma.test.js` · `testler/arastirma.test.js` | 94 yeni test |

**Değişen:** `denge.js` (TOPLANMA, ARASTIRMA, YARALI_CAN, USTUNLUK_ESIGI) · `muharebe.js` (stat tablosu
parametresi, yaralı, tahmin ölçüsü) · `ordu.js` (kadro/yaralı okuyucuları, bütçe) · `hareket.js` (kadro
bölüşümü, toparlanma emri) · `cozum.js` (kadro/yaralı taşıma) · `turDongusu.js` (2. ve 4.
aşama) · `oyunDurumu.js` + `kayitVerisi.js` (sürüm 6, geliştirici ordu aktarımı) · `uretim.js` (eğitim) ·
`oyunKancasi.js` · `App.js` · `IlPaneli.js` · `TurCubugu.js` · `TurRaporu.js` ·
`EmirListesi.js` · `HareketEkrani.js` · `UretimEkrani.js` · `Rozet.js` · `Ikonlar.js` (erlen ikonu)

**Belgeler:** `il-savasi-tasarim.md` (§3.9, §5/3, §6, §8, §14, sözlük) · `URETIM-NOTU.md`

---

## 12. SAYILAR

| | Görev 05 | Görev 06 |
|---|---|---|
| Test | 249 | **348** |
| Kayıt sürümü | 5 | **6** (1–5 reddediliyor, 5'e ayrı sebep) |
| Kayıt boyutu (başlangıç) | 21.6 KB | **21.6 KB** — hiç büyümedi |
| Kayıt boyutu (15 tur) | 23.3 KB | 21.7–22.3 KB (sınır 26) |
| Paket | 5.49 MB | 5.81 MB |
| Araştırma tavanı | — | **Sv.2** (ölçümle) |

`npm run kontrol` temiz: veri tutarlı, ESLint temiz, biçim temiz, 348 test geçiyor.
`npx expo export` hatasız.

**Kayıt boyutunun hiç büyümemesi tesadüf değil:** `kadro` ve `yarali` alanları yalnızca
mevcuttan farklıysa yazılıyor, araştırma kaydı yalnızca araştırması olan aktörler için
tutuluyor. Oyunun başında 181 garnizonun hiçbiri yıpranmamış.

---

## 13. YAPILMAYANLAR VE BİLİNEN BORÇLAR

**Bilerek yapılmayanlar:** yapay zekâ (§9) · diplomasi (§10) · rekabet olayları (§11) ·
kazanma koşulu ekranı · mod seçim ekranı · ana menü · sıcak koltuk · para kazanma.

**Bilinen ve kabul edilen kusurlar:**

1. **Kartopu.** Garnizon tükenince yenisi gelmiyor. Artık **ölçülü**: yukarıdaki tablo
   Görev 07'nin girdisi.

1b. **MOTORDA TEK YÖNLÜLÜK KUSURU — ölçüldü, DÜZELTİLMEDİ.** Nadiren birlik eklemek muharebe
   sonucunu kötüleştirebiliyor:

   | | Oran |
   |---|---|
   | Birlik ekleyince kazanırken KAYBEDEN | 423 / 211.167 = **%0.20** |
   | Birlik ekleyince sağ kalanı AZALAN | 12.796 / 211.167 = **%6.06** |

   **Kök sebep moralin granülerliği:** `moral = ⌈birim/2⌉`. 3 birlik → moral 2, 4 birlik →
   yine moral 2. Dördüncü birlik moral getirmiyor ama ölünce moral götürüyor. Somut örnek:
   savunan 3 topçu + 1 zırhlı, ova. Saldıran 2 topçu + 1 zırhlı → 1. raundda 1 birlik
   kaybeder, moral 1'de kalır, **kazanır**. Saldıran 3 topçu + 1 zırhlı → aynı 30 hasara
   iki topçu birden düşer, moral 0, **kaybeder**.

   **Denendi ve geri alındı:** moral kesir tabanlı yapıldı (`⌊birim × 0.5⌋`). Anomali yarıya
   indi (%0.20 → %0.06, %6.06 → %3.43) **ama §3.7'nin doğrulama tablosunu bozdu** — "1 zırhlı
   vs 2 piyade (ova)" ters döndü ve "zırhlı 1v1 piyadeyi ezer" kısıtı kırıldı. Tablo bu
   projenin kırmızı çizgisi olduğu için değişiklik geri alındı.

   **Görev 07'ye bırakılan iş:** §3.8'in moral formülü, doğrulama tablosunu bozmadan tek
   yönlü hâle getirilmeli. Muhtemel yol: moral kaybını birim sayısına oranlamak (her kayıp
   1 değil `2/n` moral götürsün) — bu, küçük ordularda mevcut davranışı korurken büyük
   orduları kırılgan olmaktan çıkarır. Ölçüm aracı hazır: yukarıdaki tarama betiği.

1c. **GARNİZON DAĞILIMI DEĞER İLE ORANTILI DEĞİL** *(Baki, 2026-07-31: "Ankara'da 20 asker
   var ama İstanbul'da 10, Şanlıurfa'da İstanbul'dan fazla")*. Ölçüldü, doğru:

   | İl | Değer (nüfus+ekonomi) | Savunma | Parça | Değer ÷ savunma |
   |---|---|---|---|---|
   | **İstanbul** | 20 | **10** | 2 | **2.00** |
   | Kocaeli | 14 | 10 | 2 | 1.40 |
   | Şanlıurfa | 10 | 12 | 4 | 0.83 |
   | **Ankara** | 17 | **20** | 4 | **0.85** |
   | Iğdır | 5 | 1 | 1 | 5.00 |

   **Sebep:** garnizon PARÇA BAŞINA hesaplanıyor (`⌈(nüfus+sanayi)/4⌉`), toplam savunma da
   parça sayısıyla çarpılıyor. Parça sayısı ise §7'ye göre **yüzölçümünden** geliyor, güçten
   değil. İstanbul Türkiye'nin en değerli ili ama fiziksel olarak küçük → 2 parça → toplam
   savunması Ankara'nın yarısı.

   Sonuç: **en zengin iller en kârlı hedefler.** İstanbul'un değer/savunma oranı Ankara'nın
   **2.4 katı**. Tek parçalı küçük iller ise 3–5 kat oranla en kolay lokma.

   *Bu tam bir hata değil* — parça başına savunma doğru çalışıyor, İstanbul'un her parçası
   Ankara'nınki kadar sert (5 birlik). Sorun il ÖLÇEĞİNDE. Görev 07 seçenekleri:
   (a) garnizonu il düzeyinde bütçelemek ve parçalara bölmek, (b) `GARNIZON.BOLEN`'i parça
   sayısına göre ayarlamak, (c) kabul etmek — küçük zengin iller riskli hedefler olsun.
   **Karar Görev 07'nin; bu tablo girdisi.**
2. **İl rozeti gürültüsü.** 1.35×–2.7× arasında 81 ilin hepsinde rozet var. Görev belgesi
   §Adım 6'da "isteğe bağlı süzgeç" diye bırakmıştı; Baki istemedi, eklenmedi.
3. **Araştırma tavanı Sv.2 cihazda denenmedi.** Sayı ölçümle geldi ama oynanışta sığ gelirse
   `DENGE.ARASTIRMA.TAVAN` tek satır.
4. **Yaralı canı (%50) ölçülmedi, seçildi.** §3.7'yi etkilemediği için ölçüm gerekmedi ama
   oynanışta yaralılık fazla/az acıtırsa `DENGE.MUHAREBE.YARALI_CAN` ayarlanabilir.

---

## 14. SIRADAKİ: GÖREV 07

**Düşünen rakip.** Kuruluş garnizonları onun başlangıç kuvveti; atılacak kod yok. Yanında
diplomasi, rekabet olayları, kazanma koşulu ve ana menü.

Görev 07'nin elinde bu görevden çıkan iki hazır girdi olacak:
- **Kartopunun sayısı** (§10'daki tablo)
- **Araştırma tavanı ve maliyet eğrisi** — yapay zekânın da aynı ekonomiden geçmesi gerekecek

**Görev 07'nin devraldığı ölçülmüş üç iş:**

1. **Kartopu** — §10'daki tablo
2. **Moral formülünün tek yönlü hâle getirilmesi** — §13/1b
3. **Garnizonun il ölçeğinde dengelenmesi** — §13/1c

**Kapanmadan önce:** araştırma tavanı Sv.2'nin cihazda onayı (ölçümle geldi; sığ gelirse
`DENGE.ARASTIRMA.TAVAN` tek satır).
