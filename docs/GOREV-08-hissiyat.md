# GÖREV 08 — HİSSİYAT

> Tarih: 2026-07-31 · Önceki: `docs/GOREV-07-yapay-zeka.md` + `GOREV-07-RAPOR.md`
> Tasarım referansı: `docs/il-savasi-tasarim.md` §11 (rekabet olayları), §9 (yapay zekâ),
> §14 (denge düğmeleri)
> Günlük: `veri/URETIM-NOTU.md`

---

## 1. BU GÖREV NE YAPIYOR

Baki, Görev 07'den sonra şunu söyledi:

> *"Oyun oynanabilir, yapay zekâsı da güzel olmuş. Fakat oyunun hissiyatının artırılması
> gerek. Savaşların daha çarpıcı olmasını isterim; oyuncu oynarken o fetih, kayıp
> hissiyatını, savaşma hissiyatını almalı."*

Yedi görevdir **kural** yazıldı. Bu görevde **his** yazılıyor. Oyunun ne yaptığı değişmiyor;
oyuncunun onu nasıl yaşadığı değişiyor.

Yanına iki iş daha alındı, çünkü ikisi de aynı şeye hizmet ediyor:
- **Rekabet olayları (§11)** — Kutsal Fındık Savaşı. Bu bir kural değil, bir **an**.
- **Yapay zekânın takviye taşıması** — Görev 07'nin bilinen sınırı. Düzeltilince yapay zekâ
  hem daha iyi oynayacak hem de **haritada canlı görünecek**: iç bölgeden cepheye yürüyen
  ordular, oyuncunun izlediği bir dünya demek.

---

## 2. KAPSAM

**Dahil:**
- Hissiyat katmanı: olay akışı, harita oynatımı, ses, titreşim, fetih/kayıp anları
- Rekabet olayları (§11) ve husumet veri tablosu
- Yapay zekânın dost parçalarına takviye taşıması
- Hız ve ses ayarları, her şeyin atlanabilirliği

**Hariç (Görev 09):** diplomasi (§10) · mod seçim ekranı ve tam kazanma koşulu (§8.1) ·
ana menü · sıcak koltuk · para kazanma (§12).

### Neden diplomasi yine ertelendi

İki sebep:

1. **Bu görevin hakemi sayı değil, sen.** Hissiyat ölçülemiyor; §3.7 tablosu gibi bir hakemi
   yok. Cihazda deneyip "bu iyi / bu fazla / bu az" demen gerekecek, muhtemelen birkaç kez.
   Yanına kural değiştiren bir sistem koymak, "oyun tuhaf hissettiriyor"un sebebinin his
   katmanında mı diplomasi mekaniğinde mi olduğunu bulunamaz yapar. Bu, dört görevdir
   kaçınılan hata.
2. **Husumet verisi bu görevde doğuyor.** Görev 07 raporu §11/2: *"Husumet ağırlığı 0.
   Hasım çiftleri verisi depoda yok."* Rekabet olayları o tabloyu üretecek; Görev 09'un
   diplomasisi hazır bulacak.

**Dürüst olmam gereken şey:** yol haritası bir görev daha uzuyor. Görev 08 hissiyat,
Görev 09 diplomasi + modlar + menü, Görev 10 yayın ve para kazanma.
*(Sıkıştırmamı istersen söyle — 08 ve 09'u birleştirebilirim ama iki katı sürer ve
yukarıdaki 1. madde riski gerçek.)*

---

## 3. NEREDEN BAŞLIYORUZ

436 test geçiyor, kayıt sürümü 7. Oyun baştan sona oynanıyor.

**Hazır girdiler — bu görev tahmin ettiğinden çok daha az sıfırdan başlıyor:**

| Girdi | Nerede | Bu görevde ne işe yarayacak |
|---|---|---|
| **Raunt raunt döküm** | `TurRaporu.js`, Görev 06 | **Animasyonun veri kaynağı bu.** Savaşın her raundunda kimin kaç kaybettiği zaten hesaplanıyor ve saklanıyor |
| Kademeli tur raporu (cephede ayrıntı, uzakta manşet) | Görev 07/Soru 5 | Neyin oynatılacağı, neyin tek satır geçileceği kuralı **zaten konmuş** |
| Üç birim ikonu (miğfer · obüs · paletli tank) | `Ikonlar.js`, Görev 07 | Savaş şeridinde düşen birlikler bunlar — yeni çizim gerekmiyor |
| Tur perdesi | `TurPerdesi.js`, Görev 07 | Oynatımın çerçevesi hazır |
| Sabit rozet yerleşimi + üç değişmez | `RozetKatmani.js`, `haritaDonusum.js` | Sarsıntı ve darbe efektleri buranın kurallarına uyacak |
| Emir okları | Görev 05 | Saldırı oynatımının iskeleti |
| Fayda formülü ve "açıkta kalma cezası" | `zeka.js`, Görev 07 | **Takviye kararı bunu tersinden okuyacak** — yeni tehdit ölçüsü yazılmayacak |
| Ölçüm betiği düzeneği | `scripts/*-olcum.js` | Kare bütçesi ve tur süresi aynı kalıpla ölçülecek |
| §11'in dört rekabet örneği | tasarım §11 | Tablonun ilk satırları |

**Devralınan iki uyarı:**
- **Kayıt 15 turda 25.2 KB, sınır 26.** Dar geçiyor. Duruma eklenecek her alan bu sınırı
  zorlar (Görev 07 §11/4).
- **Tur perdesi cihazda ölçülmedi.** Geliştirme makinesinde tur ~45 ms; telefonda birkaç kat
  olabilir (Görev 07 §11/5). Bu görev tam olarak oraya animasyon ekliyor — **Adım 1 bunu
  ölçmeden başlamıyor.**

---

## 4. HİSSİYAT: TEŞHİS VE ARAÇ KUTUSU

> Baki: *"Neden hissiyat yok, çok fikrim yok; beyin fırtınası yapılması gerek."*
> Bu bölüm o beyin fırtınası. Kararlar §5'te.

### 4.1 Teşhis — sekiz eksik

Oyun şu an her şeyi **olup bittikten sonra, yazıyla** anlatıyor. Emir verirsin, TURU BİTİR'e
basarsın, raporu okursun. Gözünün önünde **hiçbir şey olmuyor.**

| # | Eksik | Neye mal oluyor |
|---|---|---|
| 1 | **Zaman yok** | Fetih ile başarısız saldırı aynı sürede biter: sıfır. Gerilim süre ister |
| 2 | **Ses yok** | Duygunun en ucuz ve en güçlü taşıyıcısı hiç kullanılmıyor |
| 3 | **Titreşim yok** | Telefon elde; fiziksel geri bildirim bedava duruyor |
| 4 | **Harita tepki vermiyor** | Fethedilen parça rengini anında değiştiriyor, o kadar |
| 5 | **Kamera hiç hareket etmiyor** | Oyuncu hiçbir yere **götürülmüyor**; olayın orada olduğunu hissetmiyor |
| 6 | **Ölçek duygusu yok** | Iğdır'ı almak İstanbul'u almakla aynı hissettiriyor |
| 7 | **Kayıp acıtmıyor** | Ordu kaybetmek, azalan bir sayı |
| 8 | **Anıtlaşan an yok** | Hiçbir olayın adı yok. Görev 07'nin manşetleri (*"Konya, Karaman'ı ilhak etti"*) bu boşluğun ilk kapanışı |

**Tek cümlelik teşhis:** oyunda **sonuç** var, **olay** yok.

### 4.2 Mimarinin belkemiği: motor karar verir, sahne oynatır

Bu görevin tamamı tek bir ayrıma dayanıyor ve o ayrım her şeyi güvenli yapıyor:

```
TURU BİTİR  →  motor her şeyi çözer (bugünkü gibi, ~45 ms)
            →  ortaya sıralı bir OLAY LİSTESİ çıkar
            →  sahne o listeyi oynatır
```

**Animasyon başladığında oyunun durumu çoktan kesinleşmiştir.** Sahne yalnızca olmuş bitmiş
bir şeyi gösterir.

Bunun üç faydası var:
- **Atlamak bedelsiz.** Oyuncu ekrana dokununca liste sonuna atlanır; hiçbir şey kaybolmaz.
- **Motor kirlenmez.** `muharebe.js` saf kalır — dört görevdir korunan özellik.
- **Test edilebilir.** Olay listesi animasyonsuz sınanır; "doğru olaylar doğru sırada
  üretiliyor mu" sorusu, "ekranda güzel görünüyor mu" sorusundan ayrılır.

*Günlük hayattan karşılığı:* maç bitmiştir, skor bellidir; sahne o maçın özetini oynatır.
Özeti kapatman skoru değiştirmez.

### 4.3 Araç kutusu — hissiyat kazancı ÷ maliyet sırasıyla

**Katman 1 · Çok ucuz, çok etkili — titreşim ve ses**

| Araç | Maliyet | Etki |
|---|---|---|
| Titreşim (`expo-haptics`) | Neredeyse sıfır; performans maliyeti yok | Emir verince hafif tık · fetihte ağır darbe · bozgunda çift titreşim. Oyunun **elde** hissi tamamen değişir |
| Efekt sesleri (`expo-av`) | ~8–12 kısa dosya, ~300 KB | Top gürültüsü, yürüyüş, fetih borusu, bozgun, tur açılışı |

> **Kritik pratik not:** ses dosyalarını kod üretemez. **Bunları senin bulman veya
> onaylaman gerekecek** (telifsiz kütüphaneler var). Bu, görevin tek dış bağımlılığı.
> İkisi de Expo SDK modülü — özel yerel kod gerekmiyor, mevcut kurulum bozulmuyor.

**Katman 2 · Ucuz, görsel — mevcut çizimin üstünde**

- **Uçuşan sayı:** birlik ölünce parçanın üstünde `−2` yükselip söner
- **Rozet sarsıntısı:** saldırı alan parçanın rozeti titrer
- **Renk darbesi:** fethedilen parça bir an parlar, sonra yeni sahibin rengine oturur
- **Ölçek darbesi:** rozet kısa süre büyüyüp normale döner

> ⚠ Bunlar **rozet katmanına dokunuyor** — projenin en kırılgan yeri. Görev 05'te akıcılık
> altı tur kovalandı ve kök sebep buydu. `RozetKatmani.js`'in başındaki üç değişmez kural
> bu görevin kırmızı çizgisi.

**Katman 3 · Orta maliyet, en yüksek getiri — savaşın oynatılması**

"Savaşma hissiyatı" burada yaşıyor. Üç yol var:

| | Yol | Artısı | Eksisi |
|---|---|---|---|
| **a** | **Haritada oynatım** | Kamera savaşa kayar, ok atar, rozetler titrer, sayılar düşer, sonra renk döner. Haritanın kimliğini kullanır, yeni yüzey açmaz | Küçük ekranda ayrıntı sınırlı |
| **b** | Ayrı savaş sahnesi | İki sıra birlik ikonu karşı karşıya, raunt raunt düşenler. Tam kontrol | Yeni bir ekran, haritadan kopuk, en pahalısı |
| **c** | **Karma** | Her şey haritada oynar; **önemli savaşlarda** rozetin yanında küçük bir şerit açılır: iki tarafın birlik ikonları, raunt raunt düşenler | İki düzeneği birden ayarlamak |

**Katman 4 · Anlatı ve ölçek — en duygusal an**

- **Fetih kartı.** Bir parça değil, **bir il** tamamlandığında kart gelir: ilin adı, şekli,
  *"İSTANBUL FETHEDİLDİ"*, ganimet. **İl duygusal birim, parça taktik birim** — bugün ilin
  düşmesi hiç işaretlenmiyor, oyunun en yüklü anı sessiz geçiyor.
- **Ölçek.** Kartın süresi, sesi ve büyüklüğü ilin değerine göre değişir. İstanbul'u almak
  Iğdır'ı almaktan büyük hissettirir.
- **Kayıp kartı.** İl kaybedince kart koyu, ses alçak, titreşim ağır.
- **Tur açılışı.** *"TUR 7"* + tek satır dünya durumu.

**Katman 5 · Pahalı ve şimdilik gereksiz**

Yürüyen asker sprite'ları, parçacık efektleri, arazi dokusu, arka plan müziği.
Müzik hissiyatı çok artırır ama telif, paket boyutu ve "bir süre sonra sinir bozar" riski
taşır — **ana menüyle birlikte Görev 09'da** ele alınması daha doğru.

### 4.4 Tempo tuzağı — bu bölümün en önemli maddesi

Sıra tabanlı oyunlarda animasyon **ilk 10 tur harika, sonraki 40 tur işkencedir.** Oyuncu
TURU BİTİR'e onlarca kez basacak. Her tur 6 saniyelik gösteriye dönerse oyun oynanmaz hâle
gelir ve bu görev oyunu **iyileştirmek yerine bozar.**

Dört koruma, baştan konacak:

1. **Her şey atlanabilir** — ekrana dokunmak gösteriyi bitirir, durum zaten kesin
2. **Hız ayarı** — kapalı / hızlı / tam
3. **Yalnızca senin cephen oynar** — uzaktaki yapay zekâ savaşları anında çözülür, manşet
   olarak geçer (Görev 07/Soru 5'te konan kural aynen sürüyor)
4. **İlki tam, tekrarı kısa** — aynı türden olayın onuncusu birincisi kadar uzun sürmez

---

## 5. CEVAP BEKLEYEN BEŞ SORU

### Soru 1 — Savaş nerede oynatılır? *(mimari — §4.3/Katman 3)*

| | Seçenek | Ne demek |
|---|---|---|
| a | Yalnızca haritada | En ucuz, en bütünleşik. Ayrıntı sınırlı |
| b | Ayrı savaş sahnesi | En pahalı, haritadan kopuk |
| **c** | **Karma: haritada oynatım + önemli savaşta birlik şeridi** *(önerim)* | Sıradan savaş akıp geçer, **senin büyük savaşın** izlenir. Şerit, mevcut birim ikonlarını kullanır — yeni çizim yok |

**"Önemli savaş" ölçütü** `DENGE`'de olacak: senin taraf olduğun **ve** belirli bir
büyüklüğü aşan savaşlar. Sayı ayarlanabilir kalır.

### Soru 2 — Ses ve titreşim var mı? *(dış bağımlılık)*

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **İkisi de** *(önerim)* | En yüksek hissiyat kazancı. Ses dosyalarını **senin bulman/onaylaman** gerekir |
| B | Yalnızca titreşim | Dış bağımlılık sıfır, hemen yapılır, kazancın yarısı |
| C | İkisi de yok, sadece görsel | En düşük kazanç; §4.1'in en ucuz iki maddesi boşa gider |

**A seçilirse iş akışı:** Adım 2'de hangi seslerin gerektiğinin listesi çıkar (ör. *"top
gürültüsü, 1 sn"*), sen dosyaları bulur/seçersin, kod bağlar. **B ile başlayıp sesi
sonradan eklemek de mümkün** — ses katmanı ayrı tutulacağı için sonradan takmak ucuz.

### Soru 3 — Varsayılan tempo ne olsun? *(oyun hissi — §4.4)*

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Varsayılan "hızlı" (~2 sn), tam gösterim seçenek** *(önerim)* | 50 turluk oyun sürüklenmez, isteyen tam gösterimi açar |
| B | Varsayılan "tam" | İlk izlenim güçlü, uzun oyun yorucu |
| C | Varsayılan kapalı, isteyen açar | Çoğu oyuncu ayarlara girmez; yapılan iş görülmez |

### Soru 4 — Yapay zekâ takviyesi nasıl çalışsın? *(senin isteğin)*

> Baki: *"Yapay zekâların kendi illeri arasında asker transferi yapmasını isterim ama bu
> sistemi zorlarsa, yapay zekâ zayıf bölgelerine asker basabilir."*

**Önce bir tespit:** yapay zekâ **zaten cephede asker basıyor** (Görev 07 §7: *"düşmana
sınırdaş, sanayi hakkı kalan kendi parçası"*). Yani B planın mevcut davranışın biraz
üstü olur ve **asıl sorunu çözmez.** Asıl sorun şu: iç bölgede kalmış ordular **sonsuza
kadar orada duruyor.** Yapay zekâ genişledikçe kuvvetinin gitgide büyüyen kısmı ölü yatırıma
dönüşüyor. Üretim bunu düzeltemez, yalnızca üstüne para harcar.

| | Seçenek | Ne demek |
|---|---|---|
| **A** | **Tek yönlü takviye: iç bölgeden cepheye** *(önerim)* | Yalnızca **düşman komşusu olmayan** parça takviye gönderebilir ve yalnızca cepheye **daha yakın** dost parçaya. Sıkışmış orduyu çözer, salınım (ileri-geri gidip gelme) imkânsız |
| B | Yalnızca zayıf parçaya üretim | Senin B planın. Ucuz ama iç bölge sorununu çözmez |
| C | Serbest takviye (her dost parçadan her dost parçaya) | En doğru karar ama hamle uzayını büyütür ve salınım riski taşır |

**A'nın maliyeti ölçülecek.** Aday hamle sayısı bugün parça başına ~2 × komşu; A bunu
yaklaşık **iki katına** çıkarır. Tur hesabı zaten ~45 ms ve perde arkasında; ölçüm Adım 1'de.

**A'nın hissiyata katkısı bedava:** haritada, yapay zekânın iç bölgeden cepheye yürüyen
orduları görünür. Dünya yalnızca *sonuç veren* değil, *hazırlanan* bir yer hâline gelir.

### Soru 5 — Rekabet olayı ne yapsın? *(§11'in kapsamı)*

§11 dört şey sayıyor: üçüncü taraf düelloya karışamaz · iki tarafa tematik etki · kazanana
ek ödül · oyuncuya başarım.

| | Seçenek | Ne demek |
|---|---|---|
| A | §11'in tamamı | *"Üçüncü devlet saldıramaz"* kuralı 80 aktörü kısıtlar; yapay zekâya açıklanması ve oyuncuya gösterilmesi ayrı iş. Diplomasi gelmeden erken |
| **B** | **Sunum + moral bonusu + ganimet bonusu** *(önerim)* | Adı, kartı, sesi, iki tarafa moral bonusu, kazanana ek ganimet. Kısıt kuralı yok. §11'in duygusal kısmının tamamı, mekanik yükün küçük kısmı |
| C | Yalnızca sunum | Ad ve kart var, mekanik etki yok. En ucuz ama "kutsal düello" bir isimden ibaret kalır |

**Husumet tablosu.** §11: *"Yeni rekabet eklemek tek satır."* Yapı hazırlanacak, **satırları
sen dolduracaksın** — bu tam olarak tasarımcının işi ve senin bildiğin bir alan.
Belgeden gelen dördü kesin:

| İl A | İl B | Konu | Savaş adı |
|---|---|---|---|
| Ordu | Giresun | fındık | Kutsal Fındık Savaşı |
| Siirt | Gaziantep | fıstık | Fıstık Savaşı |
| Trabzon | Rize | (belgede konu yazılı değil) | ? |
| İstanbul | Ankara | (belgede konu yazılı değil) | ? |

Kalanları ve savaş adlarını sen yazacaksın; **kod hiçbir rekabet uydurmayacak.**

---

## 6. TASARIMDA DOLDURULACAK BOŞLUKLAR

| # | Boşluk | Nasıl doldurulacak |
|---|---|---|
| 1 | Olay listesi hangi olayları taşır | Rapordan türer: vuruş (raunt) · bozgun · imha · çekilme · fetih · il tamamlandı · il kaybedildi · düello başladı · takviye vardı |
| 2 | Uzaktaki savaşlar oynatılır mı | Hayır — Görev 07/Soru 5'in kademeli kuralı aynen: cephede ayrıntı, uzakta manşet |
| 3 | "Önemli savaş" ölçütü | Senin taraf olduğun **ve** toplam birlik sayısı `DENGE.SAHNE.ONEMLI_ESIGI` üstündeki savaş |
| 4 | Kamera nereye gider | Cephendeki en önemli olaya bir kez; her olay için ayrı ayrı kaydırma yapılmaz (baş döndürür) |
| 5 | Düello ne zaman başlar | İki hasım il **birbirinin parçasına ilk saldırdığında**; diplomasi olmadığı için "savaş açmak" = saldırmak |
| 6 | Düello ne zaman biter | Taraflardan biri ötekinin **tüm illerini** kaybedince, ya da `DUELLO_SURESI` turu geçince |
| 7 | Düello moral bonusu nereye girer | Mevcut moral bonusu listesine bir kalem daha — yeni formül yok (§3.8) |
| 8 | Takviye emri kuyruğun neresinde | Hareket emriyle aynı kuyrukta; rezervasyon defteri zaten çakışmayı engelliyor |
| 9 | Takviye "cepheye daha yakın" nasıl ölçülür | Komşuluk grafiğinde düşman parçaya uzaklık; graf zaten var, tek geçişte hesaplanır |
| 10 | Ses/titreşim/hız ayarları nereye | **Kayda değil, ayarlara.** Oyun durumu değil, cihaz tercihi |

---

## 7. VERİ MODELİ VE KAYIT

**Kayıt sürümü kararı Adım 0'da verilecek.** İki durum var:

- Düello durumu **turlara yayılıyorsa** (`durum.duellolar`) → **sürüm 8**
- Düello tek turda başlayıp bitiyorsa ve olay listesi kaydedilmiyorsa → **sürüm 7'de kalır**

> ⚠ **Kayıt 15 turda 25.2 KB, sınır 26 KB.** Duruma eklenecek her alan bu sınırı zorlar.
> Düello kaydı eklenecekse **aynı adımda ölçülecek**; aşarsa Görev 07 §11/4'ün önerdiği
> kısaltma (`kadro`/`yarali` alanları) uygulanır.

**Olay listesi kayda GİRMEZ.** Tur çözüldüğünde doğar, oynatılır, atılır. Kaydedilen şey
sonuçtur — zaten öyle.

**Ayarlar** (`ses`, `titresim`, `hiz`) kayıttan ayrı tutulur: farklı oyunlar arasında
taşınmalı, kayıt boyutuna girmemeli.

---

## 8. ADIMLAR

> **Bu görevde dört görevlik bir kural tersine dönüyor.**
> Görev 04–07'de *"Adım 1–4 ekranda hiçbir şey değiştirmez"* kuralı vardı ve doğruydu:
> motor testle doğrulanmadan arayüz yazılırsa hata nerede bilinmez.
> **Burada ölçüt test değil, senin hissin.** Bir animasyonun "fazla mı az mı" olduğu
> tarifinden anlaşılmaz; denenmesi gerekir. Bu yüzden **her katman eklenir eklenmez cihazda
> denenecek**, sonra tutulacak, ayarlanacak veya atılacak.

| Adım | İş | Cihazda denenir mi | Durum |
|---|---|---|---|
| 0 | Denge/ayar yerleri, kayıt sürümü kararı, ses listesi | hayır | ✅ |
| 1 | **ÖLÇÜM:** kare bütçesi ve takviyenin maliyeti | hayır | ✅ |
| 2 | Olay listesi (animasyonsuz, testli) | hayır | ✅ |
| 3 | Katman 1: titreşim + ses iskeleti | **evet** | ✅ kod · ses **ertelendi** |
| 4 | Katman 2: rozet efektleri, uçuşan sayılar | **evet** | ✅ kod · cihaz Baki'de |
| 5 | Katman 3: savaş oynatımı ve kamera | **evet** | ✅ kod · cihaz Baki'de |
| 6 | Katman 4: fetih/kayıp kartı, tur açılışı, ölçek | **evet** | ✅ kod · cihaz Baki'de |
| 7 | Rekabet olayları + husumet tablosu | **evet** | ✅ |
| 8 | Yapay zekâ takviyesi | **evet** | ✅ |
| 9 | Hız/ses ayarları, ölçüm, belgeler, testler, kayıt | evet | ✅ |

> **Adım 3–6'nın cihaz denemesi yapılmadı** ve bu, görevin bilerek açık bırakılan tek yeri.
> §8'in kuralı "her katman eklenir eklenmez cihazda denenecek" diyordu; bu görevde katmanlar
> tek seferde yazıldı çünkü Baki *"kalan adımları tamamla"* dedi. Bedeli açıkça yazılı:
> hangi katmanın fazla/az geldiği ancak denendikten sonra ayrışacak. Karşılığında
> `DENGE.SAHNE`'nin bütün düğmeleri hazır ve her biri tek satır.

---

### Adım 0 — Zemin ✅ BİTTİ (2026-08-01)

1. ~~`DENGE.SAHNE` açılır~~ ✅ Kapsam ayarı, hız çarpanı, 11 olay süresi, önemli savaş
   eşiği, tekrar kısaltması, eşzamanlı efekt sınırı, sarsıntı, ölçek gücü, kamera.
   **Formülde çıplak sayı yok** — yedi görevdir aynı kural.
2. ~~`DENGE.REKABET`~~ ✅ Düello süresi 10 tur, moral bonusu (kalem olarak), ganimet
   bonusu, üçüncü taraf kısıtı, etkin düello kapağı.
3. ~~`DENGE.ZEKA.TAKVIYE`~~ ✅ Açma anahtarı (Adım 1 ölçümü için şart), en az kuvvet,
   en az puan, tehdit tavanı, iki terim katsayısı, tek kuvvet adayı.
4. ~~**Kayıt sürümü kararı** (§7)~~ ✅ **Sürüm 8, ama Adım 7'de** — gerekçesi
   `oyunDurumu.js`'te KAYIT_SURUMU'nun üstünde. Düello turlara yayılıyor (`durum.duellolar`),
   olay listesi ve ayarlar kayda girmiyor. Pay ölçüldü: ~0.8 KB var, düello en kötü
   durumda ~0.25 KB (kapak testle kilitli).
5. ~~**Ses listesi çıkarılır**~~ ✅ `docs/GOREV-08-SES-LISTESI.md` — 12 ses, öncelik
   sırası, biçim şartları, kaynak önerileri, lisans künyesi.
6. ~~Husumet tablosunun **boş yapısı**~~ ✅ `veri/husumetler.js` — §11'in adı konmuş iki
   çifti girildi (Ordu–Giresun, Siirt–Gaziantep), adı konmamış ikisi şablon olarak duruyor.
   `npm run kontrol` tabloyu denetliyor; 16 test biçimi kilitliyor.

**Adım 0 ekranda hiçbir şey değiştirmedi** — bu adım için doğru olan bu; §8'in "her katman
cihazda denenecek" kuralı Adım 3'ten itibaren geçerli.

---

### Adım 1 — ÖLÇÜM: kare bütçesi ve takviyenin maliyeti

> Kod yazılmadan ölçülüyor. Görev 07'nin Adım 2'sinde bu işe yaramıştı; akıcılık bu projede
> iki kez ele avuca sığmadı (Görev 04 ve 05).

**a) Bugünkü durum ölçülür.** Görev 07 §11/5: tur ~45 ms ama **cihazda ölçülmedi.**
Telefonda gerçek sayı çıkarılır. Bu, animasyon bütçesinin tabanı.

**b) En yoğun tur kurgulanır** — çok savaşlı, çok fetihli bir durum. Ölçülecek:
- Rozet efektleri açıkken kare süresi
- Aynı anda kaç uçuşan sayı/sarsıntı olabilir
- Kamera kaydırırken kare düşüyor mu

**Karar eşiği:** hedef **60 fps (16.7 ms)**; en kötü durumda 30 fps'in altına düşülmeyecek.
Aşılıyorsa efektler eşzamanlı değil **sıralı** oynatılır (aynı anda en fazla N efekt).

**c) Takviyenin maliyeti** (Soru 4/A): aday hamle sayısı ve tur süresi, takviye açık/kapalı
ölçülür. Perde arkasında olduğu için sınır gevşek, ama **iki katına çıkması bekleniyor** ve
doğrulanması gerekiyor.

**Çıktı:** `veri/sahne-olcum.md` + Baki'ye tek sayfa.

---

### Adım 2 — Olay listesi (`src/oyun/olaylar.js`)

Çözümün ürettiği sıralı liste. **Saf veri; animasyon bilmiyor.**

```
[ { tip: "vurus",  parca: "16-1", raunt: 1, saldiranKayip: 1, savunanKayip: 2 },
  { tip: "bozgun", parca: "16-1", taraf: "savunan" },
  { tip: "fetih",  parca: "16-1", eski: "16", yeni: "34" },
  { tip: "ilTamamlandi", il: "16", yeni: "34", ganimet: 12 },
  { tip: "duello", ilA: "52", ilB: "28", ad: "Kutsal Fındık Savaşı" } ]
```

**Değişmez kural (koda ve teste yazılacak):** *olay listesi oyun durumunu değiştirmez.*
Liste oluştuğunda durum zaten kesindir. Atlamak, hızlandırmak, hiç oynatmamak — üçü de
sonucu değiştirmez.

**Bu adım animasyonsuz test edilir:** doğru olaylar, doğru sırada, doğru sayıda üretiliyor
mu. "Ekranda güzel mi" sorusundan tamamen ayrı.

---

### Adım 3 — Katman 1: titreşim ve ses *(ilk cihaz denemesi)*

`expo-haptics` ve (Soru 2 = A ise) `expo-av` bağlanır. Olay listesinin her türüne bir
titreşim ve bir ses eşlenir.

**Baki bu adımda ilk kez farkı hissedecek.** Görsel hiçbir şey değişmemiş olacak — bu
bilinçli: **tek başına ses ve titreşimin ne kadar iş yaptığını görmek** için. Yeterli
gelirse Katman 2–4'ün dozu buna göre azaltılır.

Ses eklenirse paket boyutu ölçülür.

---

### Adım 4 — Katman 2: rozet efektleri

Uçuşan sayı, sarsıntı, renk darbesi, ölçek darbesi.

> ⚠ **`RozetKatmani.js`'in başındaki üç değişmez kural okunmadan bu dosyaya dokunulmayacak.**
> Görev 05'te akıcılık altı tur kovalandı, kök sebep rozet yerleşimiydi. Bu adımın kuralları:
> - **Sabit yerleşim bozulmayacak** — efekt rozetin *yerini* değil, üstündeki dönüşümü oynatır
> - **Yeni katman açılmayacak**
> - **Rozetin dışına taşan efekt yok** — donanım dokusu görünüm sınırında keser (Görev 05'in
>   5. turunda yaşandı). Uçuşan sayı ayrı, hafif bir katmanda durur
> - Animasyon stili taşıyan görünüm hareket sırasında React'çe yeniden çizilmeyecek

Adım 1'in kare ölçümü burada **tekrarlanır**; düşüş varsa eşzamanlı efekt sayısı sınırlanır.

---

### Adım 5 — Katman 3: savaş oynatımı ve kamera

Soru 1'in cevabına göre. c seçilirse:

1. Kamera cephendeki en önemli olaya **bir kez** kayar
2. Emir oku çizilir, hedefe ulaşır
3. Rozetlerin yanında birlik şeridi açılır (mevcut üç ikon)
4. Raunt raunt: düşen birlikler solar, sayılar uçar, rozetler titrer
5. Bozgun → çekilme oku · imha → rozet dağılır
6. Fetih → renk döner

**Atlama her aşamada çalışır** ve son duruma anında geçer. Bu, Adım 2'nin değişmez kuralı
sayesinde bedelsiz.

---

### Adım 6 — Katman 4: fetih ve kayıp anları

- **İl tamamlandı kartı** — ilin adı, şekli, ganimet. Süresi ve sesi **ilin değerine** göre
- **İl kaybedildi kartı** — koyu, alçak sesli, ağır titreşimli
- **Tur açılışı** — *"TUR 7"* + tek satır dünya durumu

**Ölçek kuralı `DENGE`'de:** en değerli il ile en değersiz il arasındaki kart süresi farkı
tek katsayıyla ayarlanabilir olacak — cihazda "İstanbul yeterince büyük hissettirmiyor"
denirse tek satır değişir.

---

### Adım 7 — Rekabet olayları

1. `veri/husumetler.js` — Baki'nin doldurduğu tablo
2. Düello tetikleyicisi (§6/5), süresi (§6/6)
3. Moral bonusu mevcut listeye kalem olarak eklenir — **yeni formül yok**
4. Kazanana ganimet bonusu
5. Sunum: düello başlarken kart, savaş adı tur raporunda, düello süresince iki ilin
   haritada işaretlenmesi

---

### Adım 8 — Yapay zekâ takviyesi

Soru 4/A ise:

```
cepheUzakligi(durum, aktorId)   → parça başına, düşman parçaya uzaklık (komşuluk grafiği)
takviyeAdaylari(durum, aktorId) → yalnızca iç bölge parçalarından, uzaklığı azaltan yönlere
takviyePuani(...)               → hedefteki tehdit açığı × gönderilen kuvvet
```

**Değişmezler:**
- Takviye emri oyuncunun emirleriyle **aynı doğrulamadan** geçer (`hareketGecerliMi`)
- **Salınım imkânsız:** kuvvet yalnızca cepheye doğru akar, geri dönmez
- Cephedeki ordu takviye göndermez — savunmasını boşaltmaz

**Ölçüm:** `scripts/zeka-olcum.js` yeniden koşar. Beklenen: yapay zekânın toprak kazancı
artar, kalan bağımsız aktör sayısı düşer. Görev 07 tablosuyla yan yana yazılır.

---

### Adım 9 — Ayarlar, ölçüm, belgeler, kayıt

1. Ayarlar menüsüne: **ses açık/kapalı · titreşim açık/kapalı · hız (kapalı/hızlı/tam)**
2. Kare bütçesi ve tur süresi son kez ölçülür (`veri/sahne-olcum.md` güncellenir)
3. Paket boyutu ve kayıt boyutu ölçülür
4. Tasarım belgesi: §11 (düello kuralları), §14 (yeni düğmeler), yeni bölüm: **sahne katmanı**
5. `veri/URETIM-NOTU.md`: kararlar **gerekçesiyle**
6. `npm.cmd run kontrol` + `npx.cmd expo export`

---

## 9. TESTLER VE BİTİŞ ÖLÇÜTÜ

**Sayı hedefi:** Görev 07 sonunda 436 test vardı; bu görev **~45 test** eklemeli
(hedef ~480). Animasyonun kendisi test edilmez; **olay listesi, takviye kararı ve rekabet
tablosu** edilir.

### Geri gidiş kilidi

- [ ] §3.7'nin 15 satırı 15/15
- [ ] `haritaDonusum.test.js` — rozet efektleri eklendikten sonra da geçiyor
- [ ] Görev 07'nin zekâ ve sıra testleri değişmeden geçiyor

### Olay listesi

- [ ] **Olay listesi oyun durumunu değiştirmiyor** — liste üretilmiş ve üretilmemiş durumlar birebir aynı
- [ ] Atlanan tur ile tam izlenen tur **aynı sonucu** veriyor
- [ ] Uzaktaki savaşlar oynatım listesine girmiyor, manşete giriyor
- [ ] Olaylar doğru sırada; raunt sayısı raporla tutuyor

### Rekabet

- [ ] Düello doğru tetikleniyor, doğru bitiyor
- [ ] Moral bonusu mevcut moral listesine kalem olarak giriyor, formülü değiştirmiyor
- [ ] Husumet tablosuna satır eklemek **yalnızca veri değişikliği** — kod değişmiyor
- [ ] Tabloda olmayan il çifti düello tetiklemiyor

### Yapay zekâ takviyesi

- [ ] Takviye emri oyuncunun doğrulamasından geçiyor
- [ ] Cephedeki parça takviye göndermiyor
- [ ] Kuvvet yalnızca cepheye doğru akıyor — **salınım yok** (20 tur koşuldu, ileri-geri gidiş sıfır)
- [ ] Belirlenimci: aynı tohum → aynı takviye kararı

### Genel

- [ ] Ayarlar çalışıyor; ses kapalıyken hiç ses yok, hız kapalıyken hiç animasyon yok
- [ ] Kare bütçesi ölçüldü, en kötü durumda 30 fps altına düşmüyor
- [ ] Kayıt boyutu 26 KB sınırının altında
- [ ] Paket boyutu ölçüldü
- [ ] `npm.cmd run kontrol` temiz · `npx.cmd expo export` hatasız

### Asıl bitiş ölçütü

- [ ] **Baki cihazda oynadı ve "fetih hissi geldi" dedi.** Bu görevin hakemi bu.
      Adım 3'ten itibaren her adım ayrı ayrı denenecek; "az/fazla/yanlış" geri bildirimi
      `DENGE.SAHNE` düğmeleriyle karşılanacak.

---

## 10. TUZAKLAR

**Önceki görevlerden taşınanlar:**

1. **Rozet katmanı projenin en kırılgan yeri.** Üç değişmez kural okunmadan dokunulmaz.
2. **Üstteki kutu, yerel katmandaki harita jestini engellemez.** Fetih kartı ve savaş şeridi
   açıkken harita jesti susturulacak — savaş odasının kalıbı, üçüncü kez.
3. **Donanım dokusu görünüm sınırında keser.** Rozetin dışına taşan efekt aynı hatayı doğurur.
4. **Aynı kural iki yerde tutulmaz.** Sahne, muharebe sonucunu yeniden hesaplamayacak;
   olay listesini okuyacak.
5. **Denge sayısı sızıntısı.** Süreler, şiddetler, eşikler `DENGE.SAHNE`'de.

**Bu göreve özgü:**

6. **Tempo — bu görevin oyunu bozabileceği tek yer.** §4.4'ün dört koruması baştan konacak,
   sonradan eklenmeye çalışılmayacak.
7. **Animasyon oyun durumuna dokunamaz.** Bir efektin içinden durum değiştirilirse atlama
   bozulur ve **oyun kaydı bozulur.** En tehlikeli hata bu; testle kilitleniyor.
8. **Ses dosyaları dış bağımlılık.** Kod üretemez. Adım 3 tıkanmasın diye Adım 0'da liste
   çıkarılıyor; dosyalar gecikirse ses katmanı ayrı tutulduğu için sonradan takılabilir.
9. **"Güzel görünüyor" testi yoktur.** Bu yüzden adım adım cihaz denemesi zorunlu; toplu
   teslim edilirse hangi katmanın fazla geldiği ayrıştırılamaz.
10. **Takviye salınımı.** Yapay zekânın orduyu ileri geri taşıması hem aptal görünür hem
    hamle hakkını yakar. Tek yönlülük kuralı bunu tanım gereği engelliyor; test kilitliyor.

---

## 11. GÖREV 09 İÇİN BEKLEYENLER

Diplomasi (§10: ittifak · ateşkes · savaş hali · ittifak bozma bedeli) · mod seçim ekranı ve
tam kazanma koşulu (§8.1) · ana menü · arka plan müziği · sıcak koltuk · para kazanma (§12).

**Bu görevden Görev 09'a geçecek hazır girdiler:**
- **Husumet tablosu** — diplomasinin husumet ağırlığı (Görev 07 §11/2) veriyi hazır bulacak
- **Sahne katmanı** — diplomasi olayları (ittifak kuruldu, ateşkes bozuldu) aynı olay
  listesinden oynatılır
- **Kart düzeneği** — kazanma/kaybetme ekranı fetih kartının kalıbını kullanır

---

## EK — KARAR ÖZETİ

| Soru | Cevap | Tarih |
|---|---|---|
| 1 — Savaş nerede oynatılır (a/b/c) | **c** — karma (haritada oynatım + önemli savaşta birlik şeridi) | 2026-08-01 |
| 2 — Ses ve titreşim (A/B/C) | **A** — ikisi de. Ses listesi: `docs/GOREV-08-SES-LISTESI.md` | 2026-08-01 |
| 3 — Varsayılan tempo (A/B/C) | **Kapsam ayarı**, hız kademesi değil — aşağıya bak | 2026-08-01 |
| 4 — Yapay zekâ takviyesi (A/B/C) | **A** — tek yönlü, iç bölgeden cepheye | 2026-08-01 |
| 5 — Rekabet olayının kapsamı (A/B/C) | **B + A'nın kısıt kuralı** — aşağıya bak | 2026-08-01 |
| + Husumet tablosunun satırları | Yapı kuruldu (`veri/husumetler.js`), §11'in adı konmuş iki çifti girildi; kalanları Baki yazacak | 2026-08-01 |
| + Diplomasi kapsama girsin mi | **Hayır** — Görev 09 | 2026-08-01 |

### Cevapların belgeyi değiştirdiği üç yer

**1. Tempo: hız kademesi yerine KAPSAM ayarı.**

> Baki: *"Bizi ilgilendiren savaşların üzerinde durabilirsek güzel olur, ayrıca bizi
> ilgilendiren savaşların animasyonunu izleyebilelim... bu istediklerimi en kısa olacak
> şekilde uygulamak için yaklaşımlar bul."*

§5/Soru 3 üç hız kademesi (kapalı / hızlı / tam) öneriyordu. Baki'nin isteği tempo
tuzağını (§4.4) başka bir yerden çözüyor: **50 turluk oyunu işkenceye çeviren şey bir
savaşın 5 saniye sürmesi değil, 80 aktörün savaşını izlemek.** Senin savaşların turda 1–3
tane; onlar tam ayrıntıyla oynasa bile tur birkaç saniye sürer.

Bu yüzden kullanıcıya çıkan tek ayar **gösterim kapsamı**: `kapalı / cephem / hepsi`,
varsayılan **cephem**. İki ayar yerine bir ayar, ve "izlemek istediğim savaş atlandı"
durumu hiç doğmuyor. Süre ayarı `DENGE.SAHNE.HIZ_CARPANI`'nda tek sayı olarak duruyor;
cihazda uzun gelirse tek satır değişir, kullanıcı ayarına gerek kalmaz.

**2. Rekabet: B seçildi ama A'nın kısıt kuralı da girdi.**

> Baki: *"Kutsal savaşların en önemli işlevi 2 ilin bir düelloya çıkması, yani A'da dediğin
> üçüncü devlet düelloya karışamaz; onun dışında B iyi."*

§5/Soru 5'te bu kural A'ya aitti ve "diplomasi gelmeden erken" diye ertelenmişti. Baki
kuralın **düellonun asıl anlamı** olduğunu söyledi; haklı — kısıt olmadan "düello" iki
tarafa bonus veren sıradan bir savaştır. Kapsam: **B + üçüncü taraf kısıtı**, §11'in
kalan iki maddesi (oyuncu başarımı) yine Görev 09'a.

⚠ Kısıtın tanımı tek cümlelik değil; `DENGE.REKABET.UCUNCU_TARAF` üç ayrı kural sunuyor
(`kapali` / `cephe` / `topraklar`) ve gerekçeleri orada yazılı. Varsayılan `cephe`;
**Adım 7'nin başında Baki'ye sorulacak**, değiştirmek tek kelime.

**3. "Önemli savaş" ölçütünün işi daraldı.**

> Baki: *"Önemli savaşların neye göre seçileceğine düzgün karar vermek lazım... oyunda bug
> çıkarmaması lazım bu sistemin."*

Kapsam ayarı bu endişenin büyük kısmını kapatıyor: `cephem`de **senin her savaşın oynar.**
`DENGE.SAHNE.ONEMLI_ESIGI` artık neyin oynayacağına değil, neyin **ayrıntılı** oynayacağına
karar veriyor — eşiğin altı haritada oynar, üstü ayrıca birlik şeridi açar. Hiçbir savaş
sessizce atlanmıyor.

Kamera endişesi için üç koruma `DENGE.SAHNE.KAMERA`'da: `ACIK` tek satırla kapatır,
`EN_COK: 1` tur başına tek kaydırma, `YAKINLIK` haritanın gerçek aralığının ve rozet
katman sınırının içinde (testle kilitli).
