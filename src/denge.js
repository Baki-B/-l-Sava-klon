// DENGE SABİTLERİ — oyun dengesini etkileyen HİÇBİR sayı koda gömülmez, buraya yazılır.
// Bir sayıyı değiştirip oyunun nasıl değiştiğini görmek istiyorsan yer burasıdır.

export const DENGE = {
  // ---- YAPIM DAMGASI (Görev 10 / Adım 0 — TESLİMAT TEŞHİSİ) ----
  // Bu bir denge sayısı DEĞİL. Telefondaki Expo Go'nun gerçekten en son yazdığımız kodu mu
  // yoksa eski bir paketi mi çizdiğini kanıtlamak için var. Üç ekranın kenarına 10 punto
  // soluk basılıyor: 'menu:y1', 'mod:y1', 'tur:y1'. Ekranda görünmüyorsa o ekranı çizen
  // dosya bizim düzenlediğimiz dosya değildir — sorun arayüzde değil teslimattadır.
  // Silinmedi, çünkü o soru her Expo Go oturumunda yeniden doğuyor. Ama damgalar yalnızca
  // GELİŞTİRMEDE çiziliyor (`__DEV__`, Görev 20 / Adım 0): yayın paketinde oyuncu hiçbirini
  // görmez. Yeni bir teşhis gerekirse buradaki harf/numara artırılır.
  YAPIM: 'y6',

  // Kapsam listesi ARTIK BURADA DEĞİL, aşağıdaki MOD.KAPSAMLAR'da (Görev 09 / Adım 0).
  // Varsayılan kapsam da orada: MOD.VARSAYILAN_KAPSAM.
  //
  // Eskiden burada `SENARYO: 'turkiye'` vardı ve `senaryolar.js` kendi listesini tutuyordu.
  // Mod seçim ekranı aynı listeyi gerektirince iki kopya doğardı — §10/4'ün tuzağı. Liste
  // tek yere toplandı; oradan hem oyun kuruluyor hem mod ekranı çiziliyor.

  // Tur başına gelir çarpanı (tasarım §4.1 / Görev 03 §6.3).
  // Gelir = parçanın payı × ilinin statı × bu çarpan.
  // 1 = tasarımdaki temel hız. Büyütürsen oyun hızlanır, küçültürsen yavaşlar.
  URETIM_CARPANI: 1,

  // Geliştirici modu: haritada parça sahipliğini elle değiştirme aracını açar (Adım 8).
  //
  // ---- 2026-08-12: YAYIN İÇİN KAPATILDI ----
  // Açıkken haritada UZUN BASMAK parçayı oyuncuya veriyor. Mağazadaki bir oyunda bu,
  // "haritaya basılı tut, oyunu kazan" demek — üstelik kazayla da tetikleniyor (uzun
  // basma eşiği bu yüzden ayrıca ayarlanmıştı, bkz. aşağıdaki nota).
  // Geliştirirken tekrar açmak için tek satır; kapalıyken `IlPaneli`'ndeki test araçları
  // ve `HataSiniri`'nin ayrıntılı hata dökümü de gizleniyor.
  GELISTIRICI_MODU: false,

  // ---- HARİTA DOKUNMA HASSASİYETİ (2026-07-27, Baki: "yanlışlıkla parça alıyorum") ----
  // Uzun basma, geliştirici aracını çalıştırıyor (parçayı oyuncuya verir). Kaydırma
  // eşiğine takılan yavaş bir parmak, uzun basma sayılıp istemeden parça alıyordu.
  // Değerler burada: telefonda parmak hassasiyeti kişiden kişiye değişir, ayarlanabilsin.
  JEST: {
    // Kaydırmanın başlaması için gereken en az parmak hareketi (piksel).
    // Küçültürsen harita daha çabuk cevap verir ama yakınlaştırmadan sonra parmak
    // kalkarken minik oynamalar da kaydırma sayılabilir.
    KAYDIRMA_ESIGI: 12,
    // Uzun basmanın sayılması için parmağın kaç MİLİSANİYE beklemesi gerektiği.
    UZUN_BAS_SURE: 700,
    // Uzun basma sırasında izin verilen en fazla kayma (piksel). Bunu geçerse
    // "basma" değil "kaydırma" sayılır.
    UZUN_BAS_KAYMA: 6,
    // ---- SÜZÜLME (Görev 20 · Skia haritası) ----
    // Parmak hızlı kalkınca harita hafifçe süzülüp durur (Polytopia ve Antiyoy'un hissi).
    // Eski harita parmağın kalktığı yerde birden duruyordu. Sayı her karede korunan hız
    // payı: 1'e yaklaştıkça daha uzun süzülür. 0.997 kısa ve kontrollü bir süzülme verir;
    // haritanın sınırı (`haritaDonusum.js kaydirmaSiniri`) süzülmeyi de durdurur.
    // KAPATMAK İÇİN: 0 yap — harita eski hâli gibi parmağın kalktığı yerde durur.
    SUZULME: 0.997,
    // ---- AÇILIŞ KAMERASI (GOREV-20 Adım 4 · §3.3) ----
    // Maç açılınca (yeni maç, yükleme) harita bütün Türkiye'den oyuncunun iline süzülüyor —
    // Polytopia oyunu başkentin yanında açıyor. Bütün Türkiye ekrandayken 181 parça küçük
    // kalıyordu. YAKINLIK il kalkanlarının göründüğü kademede (ROZET.ORTA_SINIR 1.35 ile
    // YAKIN_SINIR 2.7 arası): komşular da ekranda. SURE milisaniye.
    // KAPATMAK İÇİN: ACILIS_YAKINLIK'ı 0 yap — harita eskisi gibi bütün Türkiye'yle açılır.
    ACILIS_YAKINLIK: 2.1,
    ACILIS_SURE: 900,
  },

  // Kaç turluk gelir kaydı tutulacak ("geçen tur ne kazandım" + hata ayıklama).
  TUR_GECMISI_UZUNLUGU: 50,

  // ---- KAYIT BOYUTU KANARYASI (Görev 09 / Adım 0) ----
  //
  // BU BİR DEPOLAMA SINIRI DEĞİL, BİR KANARYA. Görev 03 §7'nin cümlesi: *"kayıt dosyası
  // parça kimliklerini tutar, şekillerini değil… yüzlerce KB ise GEOMETRİ SIZMIŞ demektir."*
  // Sınırın işi budur: `parcalar.json` (1.58 MB) duruma sızarsa test bunu yakalar.
  //
  // 26 → 32 (gerekçesi ölçüldü, `veri/kayit-boyut-olcum.md`):
  //
  //   • 26 KEYFİYDİ. Görev 03'te o gün ölçülen değerin biraz üstüne konmuştu ve bir daha
  //     hiç sorgulanmadı. Gerçek kısıt AsyncStorage'da ve kat kat yukarıda (Android
  //     varsayılanı uygulama başına ~6 MB; üç yuva × ~23 KB = ~69 KB, yani %1'i bile değil).
  //   • 26 ZATEN AŞILIYORDU. Bugüne kadarki BÜTÜN ölçümler 15 tur üzerindendi; mod
  //     sistemiyle maçlar 50–80 tura çıkıyor. 50 turluk Türkiye maçı 26.4 KB ölçüldü —
  //     yani diplomasi ve mod daha eklenmeden sınırın üstündeydik.
  //   • 32 KANARYAYI ÖLDÜRMÜYOR. Kayıt inceltmeden sonra en büyük ölçüm ~22 KB; bir tek
  //     parçanın geometrisi ortalama ~8.7 KB (1.58 MB / 181). Yani TEK BİR parçanın şekli
  //     sızsa bile toplam 30 KB'ı geçer ve test yine öter. Sınır gevşedi, işlevi durdu.
  //
  // Sınır YUVA BAŞINA. Toplam boyut kaygısı yok: yuva sayısı DENGE.MOD.YUVA_SAYISI ile
  // sabit ve gerçek tavana göre önemsiz.
  KAYIT_SINIRI_KB: 32,

  // ---- BİRİMLER (Görev 04 / tasarım §3.1 ve §4.1) ----
  // Sayılar tasarım belgesinden BİREBİR alındı; orada test edilmişler, keyfi değiştirme.
  // Değiştirmek oyunun dengesini doğrudan kaydırır (§14: "zırhlı ekonomi maliyeti 6 →
  // doğrudan §4.5 karışım tablosunu kaydırır").
  //
  // nufus/ekonomi = SATIN ALMA bedeli. Diğer dördü MUHAREBE statları.
  //
  // Okuma: zırh = vurulmayı ne kadar kestiği · agirVurus = zırhlıya karşı ·
  // hafifVurus = piyadeye karşı · dayaniklilik = ne kadar hasar kaldırdığı.
  //
  // ---- MUHAREBE STATLARI 25× ÖLÇEKLİ (2026-07-31, Baki: "oyunda ondalıklı hiçbir şey
  // istemiyorum") ----
  //
  // Tasarım §3.1'in sayıları piyade 2/3/6/12, topçu 4/8/3/10, zırhlı 8/6/5/24 idi. Araştırma
  // birim başına ağaca geçince (Adım 2b) artış ORANSAL oldu ve kesirli statlar doğdu:
  // piyadenin hafif vuruşu 6 → 6,48 → 6,96. Ekranda ondalık görünüyordu.
  //
  // ÇÖZÜM ÖLÇEĞİ BÜYÜTMEK, formülü bozmak değil. Dört muharebe statının hepsi aynı sayıyla
  // çarpılınca hasar da canın da aynı oranda büyür — ORANLAR HİÇ DEĞİŞMEZ, yani §3.7'nin
  // 15 satırı birebir korunur (ölçüldü: kırık yok). Aşağıdaki HAFIF_BOLEN de aynı katsayıyla
  // büyütüldü; zırha bölünen her sabit ölçeğe bağlıdır. (2026-08-11'den beri zırha bölünen
  // TEK sabit HAFIF_BOLEN — ağır vuruş da aynı eğriden geçiyor, bkz. AGIR_DELICILIK.)
  //
  // NEDEN TAM 25: araştırma artışı %8 ve statın %8'inin tam sayı çıkması gerekiyor.
  // 25 bunu sağlayan EN KÜÇÜK katsayı (ölçüldü: ×10 ile %10 da tam sayı verir ama tavanı
  // Sv.3'e, yani tam sınıra düşürüyor; ×25 ile sınır Sv.4 ve bir kademe pay kalıyor).
  //
  // NÜFUS VE EKONOMİ ÖLÇEKLENMEDİ: onlar satın alma bedeli, muharebe statı değil.
  // Piyade hâlâ 3 nüfus / 1 ekonomi; §4.5'in karışım tablosu ve bütün fiyatlar aynı.
  // ---- MİMARİ SIFIRDAN KURULDU (2026-08-08, Baki) ----
  //
  // > *"Dayanıklılık zırhlıda fazla, askerde orta-fazla, topçuda orta olacak şekilde
  // > düzenle. Statlarımızın her birini dengeleyelim: piyade soft+hard vursun ama softu
  // > hardına göre yüksek olsun, hard hasarı az olsun; topçuda hard yüksek olsun; zırhlıda
  // > ikisi de yüksek olsun. Baştan aşağı dengeli bir mimari oluştur — ama kazanımlarımızı
  // > yeniden sağlam bir matematiğe oturtarak."*
  //
  // ÜÇ TASARIM EKSENİ, HER BİRİMİN AYRI PROFİLİ:
  //
  //            zırh    ağır vuruş   hafif vuruş   dayanıklılık   rol
  //   piyade   az      DÜŞÜK        YÜKSEK        orta-fazla     kalabalığa karşı, ucuz et
  //   topçu    orta    YÜKSEK       düşük         orta           zırhlı avcısı, cam kemik
  //   zırhlı   çok     yüksek       yüksek        FAZLA          her şeye vurur, arazi kölesi
  //
  // ---- SAYILAR NEREDEN GELDİ ----
  //
  // 1. HEPSİ ÖLÇEĞİN (STAT_OLCEGI = 25) KATI. Araştırmanın %8'lik artışının tam sayı
  //    çıkması buna bağlı — kural yeni değil, mimari ona uyacak şekilde kuruldu.
  // 2. ZIRH DEĞERLERİ DEĞİŞMEDİ (50/100/200). Etkinlik eğrileri bu üç sayıya kalibre
  //    (o gün HAFIF_BOLEN 300 · ZIRH_SONUM_BOLEN 1000 · ISABET_BOLEN 500); zırhı oynatmak
  //    §3.3'ün tamamını yeniden türetmek olurdu ve Baki zırh için bir şey istemedi.
  // 3. GERİ KALAN DOKUZ SAYI, dört tasarım kısıtı (§3.7) tutana ve maliyet başına savaş
  //    değeri birbirine yaklaşana kadar ölçümle ayarlandı: `node scripts/denge-mimarisi.js`
  //    → `veri/denge-mimarisi.md`. Betik üç şeyi birden denetliyor: rol profili, fiyat
  //    sapması, taş-kağıt-makasın gerçekten dönüp dönmediği.
  //
  // ---- NE DEĞİŞTİ, NİYE ----
  //
  //   piyade  ağır 75 → 50    : "hard hasarı az olsun". Piyadenin zırhlıya karşı işi
  //                             yokmuş gibi olmalı; 75 onu yarım bir tanksavar yapıyordu.
  //           hafif 150 → 175 : "softu hardına göre yüksek olsun" — oran 2:1'den 3.5:1'e.
  //           can 300 → 350   : "askerde orta-fazla". Topçudan belirgin ayrıldı.
  //   topçu   ağır 200 → 250  : "topçuda hard yüksek olsun". Zırhlı avcısı kimliği netleşti.
  //           can 250 → 275   : "orta". Piyadenin altında ama cam kemik olmaktan çıktı.
  //   zırhlı  ağır 150 → 175  : "ikisi de yüksek".
  //           hafif 125 → 150 : aynı gerekçe; artık piyadenin ağır vuruşunun üç katı.
  //           can (oran) 600 → 550 : ölçümün tek zorunlu düzeltmesi. 600'de zırhlı bedel
  //                             başına %30 fazla değer taşıyordu ve "hep zırhlı bas" cevabı
  //                             doğuyordu; 550 sapmayı kapatıyor, "fazla" sıralaması duruyor.
  //
  // ---- ⚠ DAYANIKLILIKLAR AYRICA 4× BÜYÜTÜLDÜ — SAVAŞ SÜRESİ İÇİN ----
  //
  // Baki'nin moral isteği ("moral savaşların ne kadar süreceğini etkilesin") ilk ölçümde
  // KARŞILANAMADI: `veri/denge-mimarisi.md`'nin karşılaşma matrisinde bütün savaşlar
  // **1 RAUNT** sürüyordu. Sebep hasar/can oranıydı — tek raundda ordunun yarısı gidiyor,
  // bozgun eşiği ne olursa olsun savaş ilk raundda bitiyordu. Bir raunt süren savaşta
  // moralin "ne kadar dayandığı" diye bir şey yok.
  //
  // Çözüm dayanıklılığı 4× büyütmek oldu: 350/275/550 → **1400/1100/2200**. ORANLAR
  // BİREBİR AYNI (hepsi aynı sayıyla çarpıldı), yani KİM KAZANIR hiç değişmiyor — §3.7'nin
  // dört kısıtı ve karşılaşma matrisi aynen duruyor. Değişen tek şey savaşın KAÇ RAUNTTA
  // bittiği: hasar/can oranı %50'den %12.6'ya iniyor ve savaşlar 3–5 raunda çıkıyor.
  // Moral farkı ancak o bantta görünür hâle geliyor (ölçüm: `denge-mimarisi.md` §4).
  //
  // Neden hasarı düşürmek yerine canı büyüttük: hasar sayıları Baki'nin profil tarifini
  // (soft/hard dağılımı) doğrudan taşıyor ve dörde bölmek onları ölçeğin katı olmaktan
  // çıkarırdı. Dayanıklılık ise hiçbir bölene girmiyor — zırha bölünen sabit (HAFIF_BOLEN)
  // yalnızca ZIRH'a bakıyor, o yüzden dayanıklılık serbestçe ölçeklenebilir.
  //
  // NÜFUS VE EKONOMİ DEĞİŞMEDİ: onlar satın alma bedeli, muharebe statı değil. §4.5'in
  // karışım tablosu ve bütün fiyatlar aynı kaldı.
  BIRIMLER: {
    piyade: {
      ad: 'Piyade',
      nufus: 3,
      ekonomi: 1,
      zirh: 10,
      agirVurus: 10,
      hafifVurus: 35,
      dayaniklilik: 70,
    },
    topcu: {
      ad: 'Topçu',
      nufus: 2,
      ekonomi: 3,
      zirh: 20,
      agirVurus: 50,
      hafifVurus: 15,
      dayaniklilik: 55,
    },
    zirhli: {
      ad: 'Zırhlı',
      nufus: 1,
      ekonomi: 6,
      zirh: 40,
      agirVurus: 45,
      hafifVurus: 30,
      dayaniklilik: 95,
    },
  },

  // Muharebe statlarının tasarım §3.1'deki ham sayıya oranı. Ölçüm betikleri ve testler
  // "belgede 6 yazan sayı kodda kaç" sorusunu buradan cevaplıyor; 25 iki yere yazılmasın.
  STAT_OLCEGI: 5,

  // Üretim ekranında ve panelde birimlerin görüneceği sıra (ucuzdan pahalıya).
  BIRIM_SIRASI: ['piyade', 'topcu', 'zirhli'],

  // ---- ÖDÜLLÜ REKLAM ÖDÜLLERİ (Görev 19 / Adım 1 · belge: docs/GOREV-19-para-altyapisi.md) ----
  //
  // ⚠ ESKİ KIRMIZI ÇİZGİ DEĞİŞTİ. Tasarım §12.4 "reklamın ödülü asla oyun içi güç olmamalı"
  // diyordu; Baki 2026-09-17'de bunu oyuncu gözüyle reddetti (*"tur analizi, savaş tekrarı…
  // reklam izlemeye değecek şeyler değil"*). Yeni çizgi: **ÜSTÜNLÜK satılmaz, İKİNCİ ŞANS
  // satılır** — ödül hata yapan oyuncuya hatasını düzeltme imkânı verir, kalıcı güç vermez.
  ODUL: {
    // Bir maçta toplam kaç ödül kullanılabilir. 3 SEÇİLDİ çünkü ikinci şansın değeri
    // KITLIĞINDAN geliyor: sınırsız olsa maç "yanlış yaptım, geri alırım" oyununa döner ve
    // hiçbir kararın bedeli kalmaz. Üç, uzun bir maçta iki kritik hatayı ve bir kazayı
    // kurtarmaya yeter.
    MAC_BASINA: 3,

    // "Yenilgiden dön" kaç tur öncesine döner. 3, maçı bitiren hatanın genelde bir tur
    // değil birkaç tur önce yapıldığı içindir — tek tur geri almak yenilgiyi tekrar
    // yaşatmaktan başka bir şey yapmazdı.
    //
    // ⚠ ANLIK GÖRÜNTÜLER YALNIZCA BELLEKTE (Adım 2). Kayda yazılsaydı üç turluk tam durum
    // (~3 × 22 KB) kayıt sınırını deldirirdi; oyun kapanınca hak düşüyor ve bu bilinçli.
    GERI_TUR: 3,

    // Acil seferberlik o tur üretim sınırını KAÇ BİRİM genişletir. Sınırı tamamen kaldırmak
    // değil genişletmek: kaldırmak, parası olan oyuncuyu tek turda ordu fabrikasına
    // çevirirdi. 3, sanayisi düşük bir ilde bile hissedilir ama İstanbul'u (sanayi 10)
    // iki katına çıkarmaz.
    EK_SANAYI: 3,

    // Ödüllerin KAPALI olduğu modlar. Meydan okuma ve dereceli maçta herkesin aynı şartta
    // olması ölçümün kendisi; orada ikinci şans ölçümü bozar.
    // (Bugün ikisi de yok — liste kural yazılı kalsın diye burada duruyor.)
    KAPALI_MODLAR: ['meydanOkuma', 'dereceli'],
  },

  // ---- REKLAM YERLEŞİMİ (Görev 19 / Adım 3 · belge: docs/GOREV-19-para-altyapisi.md) ----
  //
  // Baki (2026-09-17): *"Maç sonu reklamı da eklensin, hatta tek oyunculuda 5–10 turda bir
  // reklam da verilebilir."* Sayılar buradan okunuyor; SDK henüz yok (`REKLAM_HAZIR`).
  //
  // ⚠ İKİ ŞART BİRDEN: "en az şu kadar tur" VE "en az şu kadar dakika". Yalnızca tura
  // bakılsaydı hızlı oynayan biri üç dakikada iki reklam görürdü; yalnızca süreye
  // bakılsaydı tek turu uzun süren oyuncu tur ortasında reklam yerdi.
  REKLAM: {
    // Ara reklamlar arasında en az kaç tur geçmeli.
    EN_AZ_TUR: 8,

    // ...ve en az kaç saniye. 300 s = 5 dakika.
    EN_AZ_SANIYE: 300,

    // İlk maç tamamen reklamsız: yeni oyuncuyu ilk yarım saatte kaçırmamak, reklamdan
    // gelecek kuruştan değerli.
    ILK_MAC_REKLAMSIZ: true,

    // Maç sonu reklamı (sonuç ekranından ana menüye dönerken). Tur içi reklamdan AYRI
    // sayaç: maç sonu doğal bir duraktır, tur sınırına takılmasın.
    MAC_SONU_ACIK: true,
  },

  // ---- KOMUTAN (Görev 16 / Adım 4 · belge: docs/GOREV-16-komutan.md) ----
  //
  // Baki (2026-09-19): *"Haritada komutan birimi olur ise işte komutan sistemi iyi olur."*
  //
  // KOMUTAN BİR BİRİM DEĞİL, BİR İŞARET. Yeni birim türü açılmadı: aktörün TEK komutanı
  // var, bir parçada durur ve oradan çıkan orduyla birlikte gider. Etkisi de yeni bir
  // formülden değil, MORAL KALEMİ kanalından geçiyor — kutsal düellonun kullandığı kanalın
  // aynısı (§3.8). Yeni formül yazmamanın bedeli sıfır, kazancı ölçülebilirlik.
  KOMUTAN: {
    // ---- AÇIK/KAPALI ANAHTARI (Görev 16 / Adım 7) ----
    //
    // `DIPLOMASI.ACIK` kalıbının aynısı ve aynı sebeple var: bir mekaniğin dengeye
    // katkısı ancak KAPATILIP AÇILARAK ölçülebiliyor. Kapalıyken komutan hiç atanmıyor,
    // moral kalemi ve yetenekler hiç işlemiyor — yani oyun Görev 15'teki hâline dönüyor.
    //
    // ⚠ Yayında AÇIK. Ölçüm betiği (`scripts/komutan-olcum.js`) bunu geçici olarak
    // kapatıp iki dünyayı karşılaştırıyor.
    ACIK: true,

    // Komutanın bulunduğu orduya eklenen moral kalemi sayısı. Bir kalem bozgun eşiğini
    // `MUHAREBE.MORAL.BONUS_PAYI` kadar (0.08) yukarı taşıyor: ortalama bir ilde savaşan
    // ordu canının %50'si yerine %58'ini kaybedene kadar dayanıyor.
    //
    // ⚠ 1 SEÇİLDİ ÇÜNKÜ KALEMLER ÜST ÜSTE BİNİYOR. Dağlık savunma + kendi toprağı + kutsal
    // düello zaten üç kalem; komutan dördüncü olunca eşik %81.5'e çıkıyor. Daha fazlası
    // Adım 5'in ÇELİK YÜREK yeteneğinin işi ve orada bir TAVAN kuralı geliyor.
    MORAL_KALEMI: 1,

    // Ordusu bozguna uğrayan komutan kaç tur yeniden atanamaz. Esir düşme/ölme YOK
    // (Baki'nin kararı): karmaşık ve cezalandırıcı. Bekleme cezanın tamamı.
    //
    // 3 tur: bir cepheyi kaybetmenin bedeli hissedilsin ama maç bitmesin. Ölçüm borcu —
    // Adım 7'de `denge-simulasyonu` ile bakılacak.
    BEKLEME: 3,

    // Komutan tur başına kaç kez yeniden atanabilir. 1 = "atadın, o tur onunla oynuyorsun":
    // sınırsız olsa komutan bir işaret değil, her muharebeye yetişen bir bonus olurdu.
    TUR_BASINA_ATAMA: 1,

    // ---- DÖRT YETENEK × ÜÇ KADEME (Görev 16 / Adım 5) ----
    //
    // ⚠ YENİ MUHAREBE FORMÜLÜ AÇILMADI. Dördü de oyunun ZATEN kullandığı bir düğmeye
    // basıyor; her dizinin sırası kademe 1 · 2 · 3 demek.
    //
    // ⚠ "SEFERBERLİK USTASI" ADI KULLANILMADI VE BU BİLİNÇLİ. "Seferberlik" oyunda zaten
    // ÜÇ şey demek: piyade araştırma dalı (yaralı piyade bedava), fetihten gelen nüfus
    // ganimeti (`fetih.js` + arayüz metni) ve `ODUL.acilSeferberlik`. Dördüncü anlam
    // hem oyuncuyu hem kodu kaybettirirdi — üstelik ilk anlamla AYNI kanala (toplanma
    // maliyeti) dokunuyor. Adı TOPLANMA USTASI: oyuncu "TOPLANMA" düğmesini zaten tanıyor.
    // Ayrıntı: `docs/HATA-AVI-2026-09-20.md` §2.
    YETENEKLER: {
      // ---- ÇELİK YÜREK → bozgun eşiği (moral kalemi kanalı) ----
      // Kademe 1–2 komutanın TABAN kalemine EKLENİYOR: Sv.1'de toplam 2 kalem.
      // Üstte `MUHAREBE.MORAL.TAVAN` var, yoksa iki kalem eşiği 0.975'e taşıyor.
      celikYurek: {
        KALEM: [1, 2, 0], // kademe 3'te kalem yok — eşik değil, kural değişiyor
        // ---- ⚠ KADEME 3: "YA KAZANIR YA YOK OLUR" (Baki, 2026-09-20) ----
        //
        // Plandaki hâli "bozgun kapalı: ölümüne savaşır"dı ve motorda TAM TERSİNİ
        // yapıyordu. Üç açık birden doğuyordu: (1) bozgun tetiklenmeyince muharebe raunt
        // tavanında bitiyor ve ordu SAĞ çıkıyor, (2) `cozum.js` çekilme kaybını yalnızca
        // bozgunda uyguluyor, yani ceza ödenmiyor, (3) komutanın bekleme cezası da
        // `sonuc.*.bozgun` şartına bağlı — komutan kendi cezasından MUAF kalıyordu.
        // Yani "fedakârlık" diye satılan şey üç katlı bir kalkandı ve Komutan Paketi onu
        // parayla kestirmeye açıyordu: "üstünlük satılmaz" çizgisinin tam ihlali.
        //
        // Yeni hâli gerçek bir kumar: ordu moralden ASLA bozulmaz (hiç çekilmez) ama
        // muharebeyi kaybederse TAMAMEN yok olur. Yeni formül yok — imha, `yarma`
        // dalının zaten kullandığı kanal.
        OLUMUNE: [false, false, true],
      },

      // ---- SİLAH USTASI → araştırma seviyesi (stat tablosu kanalı) ----
      // Atamada BİR birlik türü seçilir (Baki: "atandığı birliğe göre değişsin") ve o tür
      // N seviye daha araştırılmış gibi savaşır.
      //
      // ⚠ BONUS YALNIZCA STAT TABLOSUNA UYGULANIR, ARAŞTIRMA NESNESİNE ASLA. Araştırmaya
      // seviye eklenseydi `ozelEtkiler` dört özel dalı `dalSeviyesi(...) > 0` diye
      // yokladığı için YARMA · PALET · BARAJ · SEFERBERLİK bedava açılırdı — yarma tek
      // başına "bozguna uğrattığın ordu yok olur" demek. `docs/HATA-AVI-2026-09-20.md` §4.
      //
      // ⚠ DAL TAVANI AŞILMAZ: dalını zaten Sv.3'e çıkarmış oyuncuda yetenek HİÇBİR ŞEY
      // yapmaz. Hata vermez, sessizce boşa gider — bu yüzden atama ekranı bunu YAZMAK
      // zorunda (§8). Görev 19'da yedi mührü kaybettiren sinsiliğin aynısı.
      silahUstasi: { SEVIYE: [1, 2, 3] },

      // ---- DAĞ KOMUTANI → savunanın arazi üstünlüğü (`ARAZI[x].savunan` kanalı) ----
      //
      // Baki'nin kararı (2026-09-20): yetenek SAVUNANIN arazi üstünlüğünü kırar, zırhlının
      // arazi cezasına DOKUNMAZ. Sebep: o ceza `palet` araştırmasının kanalı; ikisi üst
      // üste binse zırhlı dağda neredeyse cezasız kalır ve §3.7'nin "zırhlı topçuyu ovada
      // yener, topçunun tek şansı coğrafya" kısıtı 0.12 farkla kırılır.
      //
      // Kırılan pay, arazinin 1.0'ın ÜSTÜNDEKİ fazlasından alınıyor: dağlık 1.30'da
      // kademe 1 → 1.21 · kademe 2 → 1.165 · kademe 3 → 1.075.
      //
      // ⚠ TAMAMI ASLA KIRILMAZ (kademe 3'te bile %25 kalıyor). Coğrafya oyunun bir kuralı;
      // bir yetenekle tamamen silinmesi §3.7'yi ortadan kaldırırdı.
      dagKomutani: { TELAFI: [0.3, 0.45, 0.75] },

      // ---- TOPLANMA USTASI → toplanma BÜTÇESİ ----
      //
      // Komutanın parçasında ve KOMŞULARINDA toplanmaya ayrılan bütçeye eklenen pay
      // (nüfus ve ekonomi, ikisine de).
      //
      // ---- ⚠ YÜZDELİK İNDİRİM DENENDİ VE ÖLÇÜLDÜ: TAMAMEN ÖLÜYDÜ ----
      //
      // İlk tasarım "bedelden %15/%30/%45 düşer"di. Ölçüm (2026-09-20) her kademede ve her
      // ordu boyunda HİÇBİR fark göstermedi. Sebep: toplanma bedelleri birim başına 1–3
      // arasında ve `Math.ceil` ile yukarı yuvarlanıyor —
      //   piyade ölen {nüfus 2, ekonomi 1} → %45 indirimle {2, 1}   (değişmedi)
      //   3 piyade + 1 topçu  {7, 5}       → %45 indirimle {7, 5}   (değişmedi)
      // Yüzdelik indirim tamsayı bedellerde buharlaşıyor. Sessizce çalışmayan bir yetenek,
      // Görev 19'da yedi mührü kaybettiren sinsiliğin aynısıydı.
      //
      // Yol haritası (§16.4) zaten iki seçenek veriyordu: *"maliyeti düşer / DOLUM ARTAR."*
      // İkincisi seçildi çünkü tamsayı dünyada kesin çalışıyor: bütçeye eklenen pay
      // yuvarlamaya takılmıyor, ekranda görünen bedelle ödenen bedel hiç ayrışmıyor
      // (bedel DEĞİŞMİYOR, bütçe değişiyor) ve `ODUL.EK_SANAYI`'nin kanıtlanmış kalıbı bu.
      //
      // Bedava toplanma doğmuyor: bedel yerinde duruyor, oyuncu yine ödüyor — yalnızca
      // komutanının yanında ödeyecek daha çok şeyi oluyor.
      toplanmaUstasi: { EK_BUTCE: [1, 2, 3] },
    },

    // Kademe sayısı. Kod bu sayıyı okuyor, dizilerin uzunluğunu saymıyor: dizi yanlış
    // uzunlukta yazılırsa test gürültüyle kırılsın (sessizce kırpılmasın).
    EN_COK_KADEME: 3,

    // ---- BOTLARIN YETENEĞİ: KİŞİLİĞE GÖRE SABİT (Baki, 2026-09-20) ----
    //
    // ⚠ ZORLUĞA BAĞLANAMAZ. §9.4 açık: *"zorluk = ağırlık ayarı, gizli bonus değil."*
    // Zor kademede bota kademe 3 vermek tam olarak gizli bonus olurdu.
    //
    // Baskın huy hangisiyse (`liderler.js baskinHuy` — lakap seçiminde kullanılan aynı
    // fonksiyon) yeteneği o belirliyor. Böylece ad ile davranış tutarlı: "Demir Yumruk"
    // diye tanıdığın saldırgan bot gerçekten Silah Ustası oluyor.
    BOT_YETENEGI: {
      saldirganlik: 'silahUstasi',
      temkin: 'celikYurek',
      husumet: 'dagKomutani',
      acgozluluk: 'toplanmaUstasi',
    },

    // Botların kademesi: ORTA, sabit. Kademe 3 verilse yeni oyuncu ezilirdi; kademe 1
    // verilse mühür biriktirmiş oyuncu botları ezerdi. Ölçüm borcu — Adım 7.
    BOT_KADEMESI: 2,

    // Silah Ustası'nın birlik türü seçilmemişse hangisi varsayılan. Piyade: her orduda
    // bulunma olasılığı en yüksek tür, yani yetenek en az boşa gidiyor.
    VARSAYILAN_BIRIM: 'piyade',

    // ---- KADEMELER MÜHÜRLE AÇILIYOR (Görev 16 / Adım 6) ----
    //
    // Kademe N için toplam mühür puanının bu KESRİ gerekiyor. Dizinin i'inci elemanı
    // (i+2). kademeyi açıyor — kademe 1 herkeste baştan açık, aksi hâlde komutan yeni
    // oyuncuda hiç çalışmazdı.
    //
    // ⚠ MUTLAK PUAN DEĞİL ORAN. Mühür listesi büyüdüğünde (Görev 19'da 33 → 35 oldu)
    // mutlak eşikler sessizce kolaylaşırdı; oran, listenin boyundan bağımsız duruyor.
    // Tavan `rutbe.js tavanPuan()` ile mühür listesinden SAYILIYOR, koda yazılmıyor.
    //
    // 0.25 / 0.60 seçildi: kademe 2 birkaç maç sonra, kademe 3 ciddi bir kariyerde.
    // Orgeneral eşiği (%87) hâlâ ötede, yani kademe 3 rütbenin tepesi değil.
    //
    // ⚠ BU EŞİKLER MOTORA GİRMİYOR. Mühürler `durum`un dışında (cihazda) yaşıyor; kanca
    // kademeyi hesaplayıp `komutanAta`ya VERİ olarak geçiyor. Motor mühür tanımıyor —
    // tanısaydı `denge-simulasyonu` çalışmaz ve belirlenimcilik biterdi
    // (`docs/HATA-AVI-2026-09-20.md` §3).
    KADEME_ORANLARI: [0.25, 0.6],
  },

  // ---- MERKEZ PARÇA (Görev 17 · belge: docs/YOL-HARITASI-v11.md §17.1) ----
  //
  // Sorun ölçülü: illerin %69'u en çok İKİ hamlede düşüyor (18 il tek parça, 38 il iki).
  // Fetih çok ucuz. Çözüm: her ilin bir KALBİ var ve orası iki mevcut kanaldan sertleşiyor:
  //   1. Garnizon dağılımı (`GARNIZON.MERKEZ_AGIRLIK`) — ilin toplamı değişmiyor.
  //   2. Savunmada bir moral kalemi (aşağıda) — dağlık arazinin kullandığı kanalın aynısı.
  //
  // Yeni formül YOK. Hangi parçanın merkez olduğu VERİDEN geliyor
  // (`scripts/merkez-parca-uret.js` → `parcalar.json` `merkez: true`), koda il listesi
  // yazılmıyor; `veri-dogrula.js` her ilin TAM BİR merkezi olduğunu denetliyor.
  MERKEZ: {
    // Merkez parçayı savunana eklenen moral kalemi.
    //
    // ⚠ 1 SEÇİLDİ ÇÜNKÜ KALEMLER ÜST ÜSTE BİNİYOR. Dağlıkta savunan + kendi toprağı +
    // merkez = üç kalem, üstüne komutan ve Çelik Yürek binebiliyor. `MUHAREBE.MORAL.TAVAN`
    // (0.90) bu yığılmanın tavanı; 2'ye çıkarmak merkezi fiilen alınamaz yapardı.
    MORAL_KALEMI: 1,
  },

  // ---- RÜTBE (Görev 16 / Adım 3 · belge: docs/GOREV-16-komutan.md §16.1) ----
  //
  // Baki (2026-09-17): *"Komutanın Er'den Mareşal'e gerçek bir rütbeyle gitmesi mantıklı
  // ama ülke yöneticisi havası vermemeli, normal oyuncuyu yansıtacak olması yeter."*
  //
  // RÜTBE OYUNCUNUN KENDİ KARİYERİ — oyundaki ile ait değil. Kazanılan MÜHÜRLERDEN
  // türetiliyor ve KAYDA YAZILMIYOR (`src/oyun/rutbe.js`): iki kaynak olsa biri eskirdi.
  //
  // ⚠ MAREŞAL MERDİVENDE YOK (Baki'nin kararı, 2026-09-18). Gerçekte savaşta üstün başarı
  // için verilen ve Türkiye'de yalnızca iki kişide olan bir rütbe; sıradan bir basamak
  // yapmak yakışık almaz. BÜTÜN mühürleri toplayana verilen tek seferlik onur unvanı.
  RUTBE: {
    // Mühür kademesinin puanı. Altın mühür üç bronz eder: zor olan çok değer.
    PUAN: { bronz: 1, gumus: 2, altin: 3 },

    // On dört kademe, TSK'nın gerçek sırasıyla (bkz. GOREV-14 §3.1 kaynakları).
    // Eşikler bugünkü mühür listesine göre seçildi: 33 mühür = 71 puan tavan.
    // Orgeneral 65'te, yani tavandan ÖNCE ulaşılabiliyor — son altı puan Mareşal'in.
    // ⚠ Mühür listesi büyürse eşikler kaymalı; `testler/rutbe.test.js` oranı kilitliyor.
    KADEMELER: [
      { ad: 'Er', esik: 0 },
      { ad: 'Onbaşı', esik: 2 },
      { ad: 'Çavuş', esik: 5 },
      { ad: 'Başçavuş', esik: 9 },
      { ad: 'Teğmen', esik: 13 },
      { ad: 'Üsteğmen', esik: 18 },
      { ad: 'Yüzbaşı', esik: 23 },
      { ad: 'Binbaşı', esik: 29 },
      { ad: 'Yarbay', esik: 35 },
      { ad: 'Albay', esik: 41 },
      { ad: 'Tuğgeneral', esik: 47 },
      { ad: 'Tümgeneral', esik: 53 },
      { ad: 'Korgeneral', esik: 59 },
      { ad: 'Orgeneral', esik: 65 },
    ],

    // Onur unvanı: bütün mühürler toplanınca. Sayı koda yazılmıyor, mühür listesinden
    // sayılıyor (liste büyürse hedef de büyür).
    ONUR_UNVANI: 'Mareşal',
  },

  // ---- HAREKET (Görev 15 / Adım 1 · belge: docs/GOREV-15-aninda-cozum.md) ----
  //
  // Baki, 2026-09-19: *"Zırhlılar 2 kere hareket edebilsinler, piyadeler 1, topçular 1."*
  //
  // ⚠ BU SAYILAR GÖREV 11'İN "HER BİRLİĞİN İKİ HAMLESİ VAR" KURALINI DEĞİŞTİRİR. Eskiden
  // hak birim türüne bakmadan ikiydi ve kuyruktaki zincir emriyle veriliyordu; emir kuyruğu
  // kalkınca hak artık `src/oyun/hamle.js`'teki DEFTERDE tutuluyor ve türe göre değişiyor.
  //
  // Zırhlının iki hamlesi onun kimliği: pahalı (6 ekonomi), ovada güçlü, dağda cezalı.
  // Hareketliliği ona ovada bir iş daha veriyor — topçunun coğrafyası neyse, zırhlının
  // hızı o. Piyade ve topçu bir hamlelik kalarak cepheyi tutan birlikler oluyor.
  //
  // Hak birim türüne göre okunur; listede olmayan tür 1 hamle sayılır (güvenli varsayılan).
  HAREKET: {
    HAMLE_HAKKI: { piyade: 1, topcu: 1, zirhli: 2 },
  },

  // Sanayi statı = o ilde TUR BAŞINA üretilebilecek en fazla birim sayısı
  // (Görev 04 / Soru 2 → Baki'nin cevabı A, 2026-07-27).
  // İstanbul sanayi 10 → turda 10 birim; Bayburt sanayi 1 → turda 1 birim.
  // Amaç: zengin ama sanayisiz oyuncu parasını tek turda orduya çevirip baskın yapamasın.
  // false yaparsan sınır tamamen kalkar (para yettiği kadar üretilir).
  SANAYI_SINIRI_ACIK: true,

  // ---- ARAZİ ÇARPANLARI (Görev 05 / Adım 0 · tasarım §3.5) ----
  // `tema.js`'ten BURAYA TAŞINDI. Gerekçe: bu sayılar muharebe hesabına giriyor, yani
  // denge sayısı; `tema.js` sunum dosyasıdır. Oyuncuya gösterilen sade karşılık
  // (ARAZI_SAVUNMA: "Düşük/Orta/Yüksek") orada kaldı.
  //
  // savunan → SAVUNAN tarafın verdiği hasarı çarpar (§3.4 sözde kodu).
  // zirhli  → ZIRHLI birimin verdiği hasarı çarpar, hangi tarafta olduğuna bakmadan.
  //
  // "Zırhlı çarpanı neye uygulanır" tasarımda belirsizdi (hasara mı, dayanıklılığa mı).
  // TAHMİNLE DEĞİL ÖLÇÜMLE karara bağlandı: `node scripts/muharebe-referans.js` üç yorumu
  // da §3.7'deki 15 satıra karşı çalıştırıyor → `veri/muharebe-referans.md`. Yalnızca
  // "hasar" yorumu tablonun tamamını yeniden üretiyor.
  //
  // ---- ARAZİ BİR TIK YUMUŞADI (Görev 12 / Adım 3, Baki 2026-08-06) ----
  //
  // Baki: *"şans faktörünün etkisini bir tık artırıp arazi özelliklerinin etkisini
  // azaltmak; her türlü arazi etkisi daha yüksek olsun şanstan."*
  //   savunan: dağlık 1.35 → 1.30 · tepelik 1.15 → 1.10
  // Sıra korunuyor: dağlık savunma %30 veriyor, şans bandı %15 — arazi şanstan güçlü.
  //
  // ⚠ NEDEN DAHA FAZLA YUMUŞAMADI — ÖLÇÜM SINIRI GÖSTERDİ.
  // Baki §3.7'den *"biraz uzaklaşabiliriz"* dedi ve ilk deneme daha cesurdu: dağlık 1.25,
  // zırhlının dağ cezası 0.50 → 0.60. Tarama şunu gösterdi: o ayarda "1 zırhlı vs 1 topçu
  // (dağlık)" satırı TERS DÖNÜYOR — zırhlı dağda da kazanıyor. Bu tek bir tablo satırı
  // değil, bir TASARIM KISITININ ölümü: *"zırhlı topçuyu ovada yener, topçunun tek şansı
  // coğrafya"* (§3.7 kısıt 3). Kısıt ölünce topçu her arazide zırhlıdan kötü bir birim
  // olurdu, yani üç birimden biri fiilen çöpe giderdi.
  //
  // Satır kılıç sırtında duruyor: 1.35'te topçu 0.18 kalanla kazanıyor, 1.30'da 0.12,
  // 1.25'te 0.02 farkla KAYBEDİYOR. O yüzden yumuşatma 1.30'da kesildi ve zırhlının dağ
  // cezasına (0.50) hiç dokunulmadı — topçuyu dağda yaşatan sayı o.
  // Tarama: `veri/sans-olcum.md`.
  ARAZI: {
    ova: { savunan: 1.0, zirhli: 1.15 },
    tepelik: { savunan: 1.1, zirhli: 0.85 },
    daglik: { savunan: 1.3, zirhli: 0.5 },
  },

  // ---- MUHAREBE (Görev 05 · tasarım §3.3–§3.9) ----
  // Formülde ÇIPLAK SAYI YOK; muharebe hesabındaki her sabit buradan okunur. Testler bunu
  // kanıtlıyor: sabiti değiştirip sonucun değiştiği doğrulanıyor (`muharebe.test.js`).
  MUHAREBE: {
    // §3.3 hafif vuruş etkinliği: clamp(1 − zOrt/HAFIF_BOLEN, HAFIF_ALT, 1).
    // ANA DÜĞME (§14): küçültürsen zırh güçlenir ve zırhlı ezici olur; büyütürsen
    // piyade yığını öne çıkar.
    //
    // HAFIF_BOLEN STAT ÖLÇEĞİNE BAĞLI. Tasarım §3.3'te 12 yazıyor; muharebe statları 25×
    // ölçeklendiği için (bkz. BIRIMLER) bu da büyütüldü. Zırha bölünen sabit ölçekle
    // birlikte büyümek zorunda, yoksa etkinlik eğrileri kayar ve §3.7 bozulur.
    // Oransız sabitler (HAFIF_ALT, AGIR_VERIM, AGIR_ALT) ölçekten bağımsız.
    HAFIF_BOLEN: 60, // §3.3'te 12 × 5
    HAFIF_ALT: 0.1,

    // ---- AĞIR VURUŞ: ZIRHA KARŞI BONUS DEĞİL, DELİCİLİK (2026-08-11, Baki) ----
    //
    // > *"Ağır vuruş zırha karşı delicilik versin, bonus hasar kazanmasın — yani zırhın
    // > bir kısmına ignore atsın, ona göre hesaplansın."*
    //
    // ⚠ ESKİ FORMÜL GERÇEKTEN BONUS VERİYORDU ve bu bir yazım hatası değil, modelin
    // kendisiydi:
    //     agir = (1 − z/ZIRH_SONUM_BOLEN) × (ISABET_TABAN + z/ISABET_BOLEN)
    // İkinci çarpan ("yumuşak hedefte mermi israfı") ZIRHLA BİRLİKTE BÜYÜYORDU ve birinci
    // çarpanı yeniyordu. Sonuç: ağır vuruş, hedef ne kadar zırhlıysa o kadar VERİMLİ
    // oluyordu — 0.617 (piyade) · 0.675 (topçu) · 0.760 (zırhlı). Yani zırh, ağır vuruşa
    // karşı bir koruma değil, bir DAVETİYEYDİ.
    //
    // ⚠ BUNUN ÖLÇÜLEN BEDELİ: ARAŞTIRMA GERİ TEPİYORDU. Zırh dalını yükseltmek gelen ağır
    // vuruşun etkinliğini ARTIRIYORDU. En net örnek (`veri/delicilik-olcum.md` §3):
    //     3 topçu vs 3 topçu (ova) — savunan topçu zırh Sv.0 → KAZANIYOR
    //                               savunan topçu zırh Sv.1 → KAYBEDİYOR
    // Oyuncu 60 araştırma puanı ödeyip kazandığı savaşı kaybediyordu. Sessiz ve en kötü
    // türden bir hata — ekranda "zırhın 20 → 24" yazıyor, gerçekte ordu zayıflıyor.
    //
    // ---- YENİ MODEL: TEK ZIRH EĞRİSİ, İKİ VURUŞ ----
    //
    //     kalanZirh = zOrt × (1 − AGIR_DELICILIK)      ← delinen zırh yok sayılır
    //     agir      = clamp(AGIR_VERIM × (1 − kalanZirh/HAFIF_BOLEN), AGIR_ALT, 1)
    //     hafif     = clamp(1 − zOrt/HAFIF_BOLEN, HAFIF_ALT, 1)
    //
    // İki vuruş AYNI eğriden geçiyor; tek farkları ağır vuruşun zırhın %70'ini yok sayması
    // ve zırhsız hedefte bile tam verim vermemesi. Zırh artık ağır vuruşu da HER ZAMAN
    // azaltıyor (0.76 → 0.72 → 0.64), sadece hafif vuruşa göre 3.3 kat daha az.
    //
    // ⚠ "MERMİ İSRAFI" FİKRİ ÖLMEDİ, SABİTLENDİ. Ağır merminin tek noktaya vurması hâlâ
    // modelde — ama artık AGIR_VERIM olarak sabit bir katsayı. Sabit olduğu için hedefin
    // zırhına bakmıyor, dolayısıyla bonusa dönüşemiyor.
    //
    // ---- İKİ SAYI DA ÖLÇÜMLE SEÇİLDİ: `node scripts/delicilik-olcum.js` ----
    //
    // DELİCİLİK %70 SEÇİLDİ ÇÜNKÜ MEVCUT SÖNÜMÜN TA KENDİSİ. Eski ZIRH_SONUM_BOLEN 200'dü
    // ve 60/(1−0.70) = 200 — yani zırhın ağır vuruşu ne kadar azalttığı HİÇ DEĞİŞMEDİ,
    // yalnızca aynı şey artık doğru adıyla anılıyor. Değişen tek şey bonusun kalkması.
    //
    // VERİM 0.80 ÖLÇÜLDÜ. Tarama (§3.7'nin 15 satırı + kalan-oran çıpaları + araştırma
    // tek yönlülüğü + eşit para matrisi), delicilik %70'te:
    //   0.75 → 15/15 ✓ · çıpa sapması 0.00 · geri tepme 2
    //   0.80 → 15/15 ✓ · çıpa sapması 0.00 · geri tepme 1  ← seçilen
    //   0.85 → 15/15 ✓ · çıpa sapması 0.33 · geri tepme 5
    //   0.90 → 14/15 ✗ ("3p+1t+1z vs 5 topçu" ters dönüyor: topçu her şeye karşı iyi olur)
    // 0.80 ayrıca en temiz sayıyı veriyor: agir = 0.80 − 0.004 × zOrt, yani üç birimde de
    // iki haneli tam sonuç (0.76 · 0.72 · 0.64).
    //
    // ⚠ TEK BİLİNEN YAN ETKİ, RAPORLANDI: ağır vuruş artık yumuşak hedefte daha verimli
    // (0.617 → 0.76, %+23) ve zırhlıda daha az (0.760 → 0.64, %−16). Yani piyade topçuya
    // ve zırhlıya karşı biraz daha kırılgan, zırhlı savaşları biraz daha uzun. §3.7'nin
    // 15 satırı ve dört tasarım kısıtı bundan etkilenmedi; eşit para matrisinde değişen
    // iki hücre `veri/delicilik-olcum.md` §5'te tek tek yazılı.
    AGIR_DELICILIK: 0.7,
    AGIR_VERIM: 0.8,
    AGIR_ALT: 0.15,
    // §3.6 şans: hasar × (1 ± SANS_BANDI). Yalnızca güçler yakınken devrededir —
    // ham hasar oranı SANS_KAPANMA_ORANI'nı aşarsa şans SIFIRLANIR ("ezici ordumu iki
    // birimlik orduya kaptırdım" hissi olmasın).
    //
    // ---- 0.10 → 0.15 (Görev 12 / Adım 3, Baki: "şans bir tık artsın") ----
    // ⚠ TEK BAŞINA BU SAYININ İŞE YARAMADIĞI ÖLÇÜLDÜ. Bant 0.10'dan 0.25'e çıkarıldığında
    // zayıf tarafın kazanma şansı %0'da KALIYOR; değişen tek şey güçlünün zaferinin
    // bozulması (dağlıkta 4 piyade vs 3 piyade: %100 → %90). Sebep, şansın her raundda
    // AYRI çekilmesi: 5–10 raunt boyunca ortalamaya yakınsıyor. Sürprizi üreten şey
    // aşağıdaki GUN_BANDI ve BASKIN; buradaki bant yalnızca raunt raunt dokuyu veriyor.
    SANS_BANDI: 0.15,
    SANS_KAPANMA_ORANI: 2,

    // ---- ŞANS ARTIK RAMPAYLA SÖNÜYOR (Görev 12 / Adım 3) ----
    // Eskiden kapanma bir BIÇAKTI: oran 1.99'da şans tam güçte, 2.00'de birden sıfır.
    // Artık oran 1'den KAPANMA'ya giderken şans doğrusal olarak sönüyor:
    //   sönüm = (KAPANMA − oran) / (KAPANMA − 1),  0'ın altına inmez
    // Böylece "denk savaşta çok şans, farklı savaşta az şans, umutsuzda hiç şans" oluyor.
    // Baki'nin şartı korunuyor: 1 piyade vs 2 zırhlı ham oranı 3.68 → sönüm 0 → şans YOK.
    SANS_RAMPASI: true,

    // ---- GÜN ÇARPANI: MUHAREBE BAŞINA TEK ZAR (Görev 12 / Adım 4) ----
    //
    // Taraf başına BİR KEZ çekilir ve bütün raunt boyunca sabit kalır — "o gün iyi
    // savaştılar". Raunt şansının aksine ortalamaya yakınsamaz, o yüzden gerçek sürpriz
    // üretir. Ölçüldü (±%12): dağlıkta zayıf zırhlının kazanma şansı %1 → %8.9 çıkıyor,
    // güçlünün zaferi ise BOZULMUYOR (%99.1) — bandı büyütmenin tam tersi davranış.
    // Aynı sönüm rampasından geçiyor: umutsuz eşleşmede gün çarpanı da 1'e iner.
    // 0.12 → 0.10 (ölçümle): 0.12'de zayıf tarafın kazanma oranı %2.4–4.1'e çıkıyordu,
    // Baki'nin tarifi ise "~%1". Bant burada dokuyu veriyor, sürprizi BASKIN veriyor.
    GUN_BANDI: 0.1,

    // ---- BASKIN (Görev 12 / Adım 5) ----
    //
    // Baki: *"daha güçsüz gözüken orduların bile %1 şans ile galip gelme olasılığı olsun,
    // ama 1 piyade 2 zırhlı gibi savaşlarda 0 olmalı."*
    //
    // ÖLÇÜM ŞUNU GÖSTERDİ: çarpanla bu olmuyor. Motor bir YIPRANMA YARIŞI; zayıf taraf
    // kendi bozgun eşiğine her hâlükârda önce varıyor. Moral eşiğini iki kademe düşürmek
    // bile hiçbir eşleşmeyi çevirmedi. Yarışın kilidini kırmak için savaşın YAPISINI
    // değiştiren bir olay gerekiyordu.
    //
    // BASKIN: küçük bir olasılıkla ZAYIF taraf ilk raundu bedavaya alır — güçlü taraf o
    // raunt karşılık veremez (pusu / sabah baskını). Sönüm rampasının içinde: umutsuz
    // eşleşmede olasılık SIFIR, denk savaşta en yüksek.
    BASKIN: {
      ACIK: true,
      // Sönüm 1 iken (tam denk savaş) baskın olasılığı. Gerçek galibiyete dönüşme oranı
      // bundan düşüktür: baskın alan taraf yine de savaşı kazanmak zorunda.
      // ⚠ ÖLÇÜMLE SEÇİLDİ: `node scripts/sans-olcum.js` → `veri/sans-olcum.md`.
      // Tarama (zayıf tarafın gerçek kazanma oranı, gün bandı 0.10 ile):
      //   %5 → %2.6–3.6   ·   %3 → %1.4–1.9   ·   %2 → %0.7–1.2  ← seçilen
      // Baki'nin tarifi "kabaca %1". Baskın olan her savaş kazanılmıyor — baskını alan
      // taraf hâlâ savaşın geri kalanını götürmek zorunda, o yüzden %2 olasılık ~%1
      // galibiyete dönüşüyor.
      OLASILIK: 0.02,

      // ---- BASKIN KAÇ RAUNT SÜRER (2026-08-08, mimari yenilenince eklendi) ----
      //
      // ⚠ ÖNCE 1'DİDİ VE MİMARİ DEĞİŞİNCE SESSİZCE ÖLDÜ. Dayanıklılıklar 4× büyütülüp
      // savaşlar 3 raunttan 6 raunda çıkınca, tek raundluk baskının göreli ağırlığı
      // yarıya indi: zayıf tarafın kazanma oranı %1'den **%0.0**'a düştü. Yani Baki'nin
      // "daha güçsüz gözüken orduların bile ~%1 şansı olsun" şartı kayboldu.
      //
      // ÖLÇÜM ÖNCE YANLIŞ KOLA BAKTI: baskın olasılığı %2 → %12'ye çıkarıldı, sonuç
      // %0.2'de kaldı; gün bandı 0.10 → 0.50'ye çıkarıldı, zayıf taraf %2.8'e çıktı ama
      // ÜSTÜN taraf %100'den %96.7'ye düştü — yani sürpriz değil, kumar üretiyordu.
      // İkisi de yanlış kol: sorun olasılık değil, baskının SÜRESİYDİ.
      //
      // 2 raunt, savaş uzunluğu iki katına çıktığı için baskının eski göreli ağırlığını
      // geri veriyor. Olasılık %2'de kalıyor — Baki'nin tarifi olasılık değil sonuçtu.
      RAUNT: 2,

      // Baskının hangi güç farkına kadar mümkün olduğu. SANS_KAPANMA_ORANI ile aynı
      // olması şart değil ama aynı tutuldu: "şansın bittiği yerde baskın da biter"
      // tek cümlede anlatılabiliyor, iki ayrı eşik oyuncuya iki ayrı kural demek olurdu.
      KAPANMA_ORANI: 2,
    },
    // §3.8 moral = ⌈birim sayısı / MORAL_BOLEN⌉ + bonuslar. Her kaybedilen birim −1 moral,
    // 0'a inince BOZGUN. Böleni büyütürsen ordular çabuk bozulur, muharebeler daha az kanlı.
    MORAL_BOLEN: 2,
    // İlin moral statı bu değere EŞİT veya ÜSTÜNDEYSE +1 moral (§3.8 "moral statı yüksekse").
    // Tasarım "yüksek"in eşiğini vermiyordu; 5 seçildi çünkü 81 ilin 23'ü (≈%28) bunu
    // sağlıyor — 6 seçilse yalnızca 4 il alırdı ve bonus fiilen ölü kural olurdu.
    MORAL_YUKSEK_ESIGI: 5,
    // §3.9/1 bozulan ordu çekilirken bu kadar birim DAHA kaybeder.
    CEKILME_KAYBI: 1,

    // ---- BOZGUN MODELİ (Görev 07 / Adım 1 — Görev 06 §13/1b'nin devri) ----
    //
    // SORUN: moral sayacı BİRİM SAYISINA bakıyordu ve tam sayı olduğu için granülerdi.
    // `moral = ⌈n/2⌉`: 3 birim → 2, 4 birim → yine 2. Dördüncü birim moral GETİRMİYOR ama
    // ölünce moral GÖTÜRÜYOR. Sonuç ölçüldü (Görev 06): birlik eklemek muharebeyi
    // %0.20 oranında kazanırken kaybettiriyor, %6.06 oranında sağ kalanı azaltıyordu.
    //
    // Bu, yapay zekânın fayda hesabının dayandığı varsayımı çürütüyordu ("birlik eklersem
    // sonuç iyileşir"), o yüzden zekâdan ÖNCE düzeltildi.
    //
    // ÇÖZÜM ÖLÇÜMLE SEÇİLDİ: `node scripts/moral-olcum.js` → `veri/moral-olcum.md`.
    // Ölçümün gösterdiği asıl şey, görev belgesinin dört adayından ÜÇÜNÜN aynı kapıya
    // çıktığıydı: kayıp SAYISINA bakan hiçbir formül granülerliği çözemez, çünkü kayıp
    // tam sayıdır. Eşik nereye konursa konsun 3 ve 4 birimli ordu aynı sayıda kayıpta
    // bozulur. Tek yönlülük ancak bozgunu SÜREKLİ bir büyüklüğe bağlayınca kazanılıyor.
    // ---- MORAL YENİDEN KURULDU (2026-08-08, Baki) ----
    //
    // > *"Moral etkisi savaşların ne kadar süreceğini etkilesin; moral düşükse ordu
    // > nispeten hızlı dağılsın. Fakat birlikler morali düşük bile olsa askerler o kadar
    // > hızlı dağılmamalı — tüm birliklerin temel bir seviyesi olmalı, moral EK ne kadar
    // > olacağını belirlemeli."*
    //
    // ESKİ YAPI NEDEN KARŞILAMIYORDU: tek bir `BOZGUN_ORANI` (0.5) vardı ve ilin moral
    // statı formüle İKİLİ giriyordu — `MORAL_YUKSEK_ESIGI: 5` eşiğini geçen il +1 kalem
    // alıyordu, geçmeyen hiçbir şey. Moral statı 3 olan il ile 4 olan il ARASINDA HİÇBİR
    // FARK YOKTU; 81 ilin 44'ü aynı değerde (4) olduğu için stat pratikte ölü bir sayıydı.
    //
    // YENİ YAPI ÜÇ KATMANLI ve Baki'nin cümlesini birebir kodluyor:
    //
    //   bozgun eşiği = TABAN + MORAL_PAYI × (ilin moral statı / MORAL_OLCEGI)
    //                        + durum kalemleri × BONUS_PAYI
    //
    //   TABAN       → "temel bir seviye": moral ne olursa olsun ordu buraya kadar dayanır
    //   MORAL_PAYI  → "moral ek ne kadar olacağını belirlesin": statın SÜREKLİ katkısı
    //   BONUS_PAYI  → durum kalemleri (dağlık savunma · kendi toprağı · kutsal savaş)
    //
    // İllerin moral statı 3–7 bandında (44 il 4'te). Yani stat katkısı 0.09–0.21 arası
    // ve toplam eşik bonussuz 0.44–0.56 oluyor — eski tek değerin (0.50) etrafında,
    // ama artık her ilin kendi sayısı var ve savaş süresi ona göre değişiyor.
    MORAL: {
      // 'sayac' → moral sayacı 0'a inince bozgun (Görev 05–06 davranışı, granüler).
      // 'oran'  → ordu canının eşik kadarını kaybedince bozgun (tek yönlü).
      MODEL: 'oran',

      // ---- TEMEL SEVİYE ----
      // Baki'nin "o kadar hızlı dağılmamalı" şartı. Moral statı ne olursa olsun hiçbir
      // ordu canının bu kadarını kaybetmeden dağılmaz.
      //
      // ⚠ 0.40 ÖLÇÜMLE SEÇİLDİ VE ALT SINIRI TASARIM KISITI ÇİZDİ. İlk deneme 0.35'ti ve
      // §3.7'nin ikinci kısıtını kırıyordu: *"zırhlı piyadeyi 1v1 ezer · 2v1 dar kazanır ·
      // 3v1 KAYBEDER."* Sebep ince ve öğretici: bozgun eşiğini düşürmek ÇOK BİRİMLİ orduyu
      // cezalandırıyor, TEK BİRİMLİYİ cezalandırmıyor — tek birimlik ordu bozulamaz, ancak
      // imha olur (bozgun için "en az bir birim kaybı" şartı var). Yani düşük taban, 3
      // piyadeyi zırhlıdan önce dağıtıyordu.
      //
      // Tarama (taban × pay, 15 satırlık doğrulama tablosu + savaş süresi):
      //   0.35 → 14/15 (kısıt KIRIK)   ·   0.40 ve üstü → 15/15
      // Alt sınır 0.40; üstüne çıkmak kısıtı kurtarmıyor, yalnızca savaşları uzatıyor.
      TABAN: 0.4,

      // ---- MORALİN EKİ ----
      // İlin moral statının katkısı: `MORAL_PAYI × (stat / MORAL_OLCEGI)`.
      // Moral 3 → +0.075 (eşik 0.475) · moral 7 → +0.175 (eşik 0.575).
      //
      // 0.25 SEÇİLDİ ÇÜNKÜ MORAL FARKINI EN ÇOK O GÖSTERİYOR. Aynı tarama, 6 piyade vs
      // 6 piyade muharebesinin kaç raunt sürdüğünü de ölçtü (moral 3 → moral 7):
      //   taban 0.40: pay 0.15 → 4→5 raunt · pay 0.25 → **4→6** · pay 0.30 → 5→6
      //   taban 0.45: pay 0.20 → 5→6      · pay 0.30 → 5→7
      // 0.40/0.25 en büyük GÖRELİ farkı veriyor: moralli ordu %50 daha uzun dayanıyor.
      // Baki'nin "moral savaşların ne kadar süreceğini etkilesin" cümlesinin ölçüsü bu.
      MORAL_PAYI: 0.25,

      // Moral statının TAM sayıldığı değer. Veriden okunmuyor bilerek: veri değişince
      // (yeni il, düzeltilmiş stat) eşikler sessizce kaymasın. 10 = "statın tavanı 10
      // olsaydı" ölçeği; gerçek veri 3–7 bandında olduğu için bandın tamamı kullanılmıyor
      // ve bu kasıtlı — ilerde daha moralli bir il eklenirse yeri hazır.
      MORAL_OLCEGI: 10,

      // ---- DURUM KALEMLERİ ----
      // Dağlıkta savunmak · kendi toprağında olmak · kutsal savaşta olmak. Her kalem
      // eşiği bu kadar yukarı taşır. 0.15 → 0.08 İNDİRİLDİ: artık moral statı da eşiğe
      // giriyor ve eski payla üç kalem üst üste binince eşik 0.95'e çıkıyordu — o orduyu
      // bozguna uğratmak fiilen imha etmek demekti.
      BONUS_PAYI: 0.08,

      // ---- ⚠ EŞİĞİN TAVANI (Görev 16 / Adım 5) ----
      //
      // Kalemler ÜST ÜSTE BİNİYOR ve komutanın ÇELİK YÜREK yeteneği iki kalem daha
      // ekliyor. Tavan olmasaydı: dağlıkta savunan + kendi toprağı + kutsal düello
      // (üç kalem) + komutan (bir kalem) + Çelik Yürek Sv.2 (iki kalem) = altı kalem →
      // eşik 0.975. Yani ordu canının %97,5'ini kaybedene kadar dayanıyor: bu artık
      // "dayanıklı ordu" değil, fiilen BOZULMAYAN ordu — kademe 3'ün bedava hâli.
      //
      // 0.90 seçildi çünkü bugünkü en yüksek eşik 0.815 (moral statı 7 + üç durum kalemi).
      // Tavan onun ÜSTÜNDE, yani mevcut hiçbir satırı değiştirmiyor: §3.7'nin 15 satırlık
      // doğrulama tablosu ve `moral-olcum.js` aynı sonucu veriyor. Kademe 3 bilinçli olarak
      // tavanın dışında — o bir eşik değil, bambaşka bir kural ("ya kazanır ya yok olur").
      //
      // ⚠ TAVAN BURADA YAŞIYOR, `bozgunEsigiHesapla`'NIN İÇİNE GÖMÜLMEDİ: o fonksiyon
      // `moral-olcum.js`'ten KENDİ ayarıyla çağrılıyor ve o ölçüm tekrar edilebilir kalmak
      // zorunda (Görev 06 kuralı). Sert sayı yazılsaydı betiğin modeli sessizce değişirdi.
      TAVAN: 0.9,
    },

    // ---- YARALI BİRİMLER (2026-07-31, Baki: "bazı birlikler ölsün bazıları yaralansın
    // bazılarına bir şey olmasın") ----
    //
    // Muharebeden sağ çıkan birimlerin bir kısmı YARALI döner. Yaralı birim sahadadır ve
    // aynı güçle vurur ama CANI AZDIR — daha çabuk düşer. Tek etki bu: hem anlatması kolay
    // ("yaralı asker daha çabuk düşer"), hem de iki ayrı etkinin dengesini ölçmek gerekmiyor.
    //
    // Kaç birimin yaralandığı YENİ BİR FORMÜLLE hesaplanmıyor: motorun zaten tuttuğu
    // YIPRANMA ORANI (alınan hasar / başlangıç canı) kullanılıyor — beraberlik bozma kuralı
    // da aynı ölçüyü kullanıyor. Hayatta kalanların bu oran kadarı yaralı çıkar:
    //   • ezici kazanan  → oran ~0  → kimse yaralanmaz ("bir şey olmama" durumu)
    //   • kanlı muharebe → oran yüksek → sağ kalanların çoğu yaralı
    //   • bozulup kaçan  → oran en yüksek → neredeyse hepsi yaralı
    //
    // §3.7'nin 15 satırı ETKİLENMEZ: o tablo hep taze (yarasız) ordularla çalışıyor.
    // Yaralılık yalnızca ikinci ve sonraki muharebelerde devreye giriyor.
    YARALI_CAN: 0.5,
    // ---- SAVAŞ KAÇ RAUNT SÜRER: ORDU BÜYÜKLÜĞÜ BELİRLİYOR (2026-08-08, Baki) ----
    //
    // > *"Savaşların raund sayısı büyüklüğüne göre 1–4 arasında değişse güzel olur:
    // > küçük 1–9 birimlik savaşlar için 1 tur, 10–19 için 2 tur, 20–49 için 3 tur,
    // > 50–99 için 4 tur gibisinden."*
    //
    // ESKİDEN SÜRE BİR YAN ÜRÜNDÜ: muharebe bozguna ya da imhaya kadar sürüyordu ve kaç
    // raunt tuttuğu hasar/can oranından çıkıyordu. `EN_COK_TUR: 20` yalnızca sonsuz döngü
    // koruması olarak duruyordu, pratikte hiç görülmüyordu. Artık süre bir KURAL: savaşın
    // büyüklüğü kaç raunt süreceğini doğrudan söylüyor.
    //
    // BU DEĞİŞİKLİK BİR ZİNCİRİ ÇÖZDÜ. Süre büyüklükten geldiği için dayanıklılık/hasar
    // oranının savaş süresini ayarlama görevi bitti — dayanıklılıklar bu yüzden 4 basamaktan
    // 2 basamağa inebildi (bkz. BIRIMLER notu). İki istek aynı taşın iki yüzüydü.
    //
    // ÖLÇÜ: İKİ TARAFIN TOPLAM BİRİM SAYISI. "Savaşın büyüklüğü" tek tarafın değil,
    // sahaya çıkan toplam kuvvetin ölçüsü — 5v5 ile 9v1 aynı ölçekte bir çarpışmadır.
    //
    // MORAL HÂLÂ ERKEN BİTİREBİLİR ve bu bilinçli: kademe bir ÜST SINIR, hedef değil.
    // Morali düşük bir ordu 4 rauntluk bir savaşın 2. raundunda dağılabilir. Baki'nin bir
    // önceki isteği ("moral savaşların ne kadar süreceğini etkilesin") böylece ölmüyor,
    // yalnızca büyük savaşlara taşınıyor — küçük savaş zaten tek raunt.
    RAUNT_KADEMELERI: [
      { enCok: 9, raunt: 1 },
      { enCok: 19, raunt: 2 },
      { enCok: 49, raunt: 3 },
      { enCok: Infinity, raunt: 4 },
    ],

    // ---- İVME: ÖNCEKİ RAUNT SONRAKİNİ ETKİLER (2026-08-08, Baki) ----
    //
    // > *"2 tur süren bir savaşı düşünelim: ilk tur oynansın, şans faktörüdür falan her şey
    // > belirlensin — 1. taraf %55 ihtimalde, 2. taraf %45 mesela — ondan sonra 2. tur da
    // > bunlara göre oynansın. 1. turun sonuçları 2. turu etkilesin, yığılımlı etki olsun."*
    //
    // BİR KISMI ZATEN VARDI: kayıplar ve hasar havuzu raunttan raunda taşınıyor, yani ilk
    // raundda birlik kaybeden taraf ikinci raunda zayıf giriyor. Eksik olan şey MORAL
    // ÜSTÜNLÜĞÜ — savaşın gidişatının kendisinin bir ağırlığı yoktu.
    //
    // İVME onu ekliyor: bir raundda oransal olarak DAHA AZ YIPRANAN taraf, sonraki raundda
    // biraz daha sert vuruyor. Etki raunttan raunda ÇARPILARAK birikiyor (Baki'nin
    // "yığılımlı" dediği şey), ama TAVAN ile kırpılıyor.
    //
    // ⚠ NEDEN TAVAN ŞART: kırpma olmasaydı ilk raundu kazanan taraf her raundda daha da
    // güçlenir ve 4 rauntluk savaşlar ilk raundun tekrarına dönerdi — şans, gün çarpanı ve
    // baskının tamamı anlamsızlaşırdı. Tavan "öndeki avantajlı ama savaş hâlâ açık" diyor.
    //
    // ⚠ TEK RAUNTLUK SAVAŞLARDA HİÇ ÇALIŞMAZ ve bu doğru: ivme bir sonraki raunda etki
    // eder, sonraki raunt yoksa etkisi de yoktur.
    IVME: {
      ACIK: true,
      // Bir raundun sonucunun sonraki raunda taşıdığı ağırlık. 0.12 = tam üstünlük
      // kurulan bir raunt, sonrakinde %12 daha sert vuruş demek. Fark küçükse bonus da
      // küçük — ölçü iki tarafın o raundda aldığı hasarın ORANSAL farkı.
      PAY: 0.12,
      // Birikmiş ivmenin tavanı (ve tersi taban: 1/1.3). Dört rauntluk bir savaşta üst
      // üste üç raunt kazanan taraf bile bu duvarı aşamıyor.
      TAVAN: 1.3,
    },

    // Raunt tavanına gelindiğinde sonuç nasıl belirlenir:
    //   'yipranma' → oransal olarak daha az yıpranan taraf kazanır (eşitlikte savunan)
    //   'berabere' → eski davranış: kimse kazanmaz, saldıran kaynağına döner
    //
    // 'yipranma' seçildi çünkü artık HER SAVAŞ tavanla bitebiliyor: 1 rauntluk küçük
    // çarpışmada kimse bozulmaz, kimse imha olmaz. Eski kural o savaşların HEPSİNİ
    // sonuçsuz bırakır ve küçük çatışmalar oyunda hiçbir şey ifade etmezdi.
    // Kaybeden ÇEKİLME KAYBI ÖDEMEZ — bu bir bozgun değil, savaşın bitmesi.
    SURE_DOLUNCA: 'yipranma',

    // Savaş odasındaki tahminin "ÜSTÜN" diyeceği eşik (2026-07-31). Ölçü, muharebe
    // sonundaki ÜSTÜNLÜK: senin kalanın / (senin kalanın + onun kalanı).
    //   1.00 → karşıda kimse kalmadı   ·   0.50 → başa baş
    // 0.75 = "sağ kalanların dörtte üçü senin", yani üç katı kuvvetle çıkmışsın.
    // Bu ölçü TEK YÖNLÜ: birlik eklemek oranı asla düşürmez (bkz. `muharebeTahmini`).
    USTUNLUK_ESIGI: 0.75,
  },

  // ---- YENİDEN TOPLANMA (Görev 06 / Soru 1–2 → Baki'nin cevapları A ve B, 2026-07-30) ----
  // Yıpranmış ordu, KADROSUNA (kağıt üstündeki mevcuduna) kadar doldurulabilir.
  //
  // TABLO BURAYA YAZILMAZ, TÜRETİLİR. Tasarım §3.9/3 toplanma bedellerini tablo hâlinde
  // veriyor (piyade 2/1, topçu 1/2, zırhlı 1/3) ama o tablo BIRIMLER'in yarısından başka
  // bir şey değil. Elle yazılsaydı biri BIRIMLER'i değiştirdiğinde tablo sessizce yalan
  // söylerdi. `toplanma.js` bedeli her seferinde ⌈normal × INDIRIM⌉ ile hesaplıyor;
  // testi de §3.9/3'ün üç satırıyla karşılaştırıyor.
  TOPLANMA: {
    // Bir birimi yerine koymak, sıfırdan basmanın kaç katı (§3.9/3 "yarısı, yukarı
    // yuvarlanmış"). §14'ün düğmesi: küçültürsen savaşlar hızlanır (kayıp ucuzlar),
    // büyütürsen ordular uzun toparlanır ve her kayıp acıtır.
    INDIRIM: 0.5,

    // YARALI BİR BİRİMİ İYİLEŞTİRMEK, ÖLENİN YERİNE YENİSİNİ KOYMANIN KAÇI (2026-07-31).
    // Yaralı asker zaten sahada; ona bakmak, sıfırdan asker toplamaktan ucuz olmalı.
    // Sonuç: piyade için ölen 2 nüfus/1 ekonomi, yaralı 1 nüfus/1 ekonomi.
    // Bedava DEĞİL — bedava olsaydı her tur toplanma emri vermek düşünmeyi gerektirmezdi.
    IYILESTIRME: 0.5,
  },

  // ---- ARAŞTIRMA (Görev 06 / Soru 3–4 → Baki'nin cevapları A ve A, 2026-07-30) ----
  // Tasarım §6: araştırma birim statlarını İMPARATORLUK ÇAPINDA kaydırır. Tek bir yerde
  // toplanan bu tablo, muharebe motoruna PARAMETRE olarak girer (`arastirma.js
  // birimStatlari`); motor DENGE.BIRIMLER'i kendisi okumaz. Araştırma 0'ken tablo birebir
  // BIRIMLER olur — §3.7'nin 15 satırı bu yüzden değişmeden geçiyor.
  ARASTIRMA: {
    // ---- BİRİM BAŞINA AĞAÇ (Görev 07 / Adım 2b — Baki'nin isteği, 2026-07-31) ----
    //
    // > Baki: *"Güçlüler çok güçlü olur eğer 3'e çıkarırsak, bence azar azar buff verecek
    // > şekilde... veyahut her birlik türü için farklı bir ağaç yapalım: piyade için zırh,
    // > ağır vuruş, hafif vuruş, anlık toparlanma hakkı; topçu için de 3 ana 1 kendine
    // > özgü, zırhlı için de 3 ana 1 kendine özgü, 3 seviyeli ağaçlar."*
    //
    // ESKİ YAPI: üç dal, HER BİRİME birden uygulanıyordu, tavan Sv.2. Tavanı Sv.2'de tutan
    // şey tek bir dal-birim çiftiydi: "Zırh" dalı ZIRHLININ zaten 8 olan zırhını 11'e
    // çıkarıyor, hafif vuruş tabana oturuyor ve "3 piyade 1 zırhlıyı yener" kuralı ters
    // dönüyordu. Dal birime özgü olunca o kırılma piyade ve topçuyu HİÇ ilgilendirmiyor.
    //
    // ZIRHLININ ÜÇÜNCÜ ANA DALI SAVUNMA DEĞİL, **PALETLİ ÜSTÜNLÜK**. Gerekçesi 2026-08-11'de
    // yenilendi: eskiden "ölçüm zırhlının zırh/dayanıklılık dalına Sv.0 verdi" diyordu ve o
    // ölçüt (araştırma §3.7'yi bozmasın) artık emekli. Yeni gerekçe de ÖLÇÜLDÜ
    // (`veri/arastirma-olcum.md` §5): zırhlıya zırh ya da dayanıklılık dalı eklemek tam
    // teçhizat dengesini DÜZELTMİYOR, yalnızca kayan satırı değiştiriyor — dalın karşılığı
    // yok. Zırhlının gerçek zayıflığı zaten arazi (§3.5, dağlıkta 0.5 çarpan), zırhı değil;
    // palet tam oraya dokunuyor.
    //
    // ARTIŞ ORANSAL, MUTLAK DEĞİL. Mutlak +1, statı düşük birime orantısız yarıyordu:
    // piyadenin ağır vuruşu 3→4 (%33), topçununki 8→9 (%13). Ölçüm bunu doğruladı —
    // mutlak artışta piyade-ağır Sv.1'de kırılıyor, oransal artışta Sv.4'e çıkıyor.
    // `aciklama` = dalın DEĞİŞMEYEN tanımı, araştırma ekranında dalın altında duruyor
    // (2026-07-31, Baki: "detaylıca açıklamaları falan orada gözüksün"). Seviyeye bağlı
    // somut sayı ayrı bir cümledir ve `arastirma.js dalEtkisi`'nden gelir — burada
    // yazılmaz, yoksa ekranla gerçek hesap ayrışır (Görev 06'nın kuralı).
    AGACLAR: {
      piyade: {
        zirh: {
          ad: 'Zırh',
          tip: 'stat',
          stat: 'zirh',
          // 2026-08-11: eskiden yalnızca "hafif ateş" yazıyordu ve o gün DOĞRUYDU —
          // zırh ağır vuruşu azaltmıyor, artırıyordu (bkz. AGIR_DELICILIK). Artık ikisini
          // birden azaltıyor, cümle de onu söylüyor.
          aciklama: 'Piyaden daha kalın koruma taşır; ona gelen her türlü ateş daha az işler.',
        },
        agir: {
          ad: 'Ağır vuruş',
          tip: 'stat',
          stat: 'agirVurus',
          aciklama: 'Piyaden zırhlı hedeflere karşı sertleşir — tanksavar eğitimi.',
        },
        hafif: {
          ad: 'Hafif vuruş',
          tip: 'stat',
          stat: 'hafifVurus',
          aciklama: 'Piyadenin asıl işi: karşıdaki yaya birliklere verdiği zarar artar.',
        },
        seferberlik: {
          ad: 'Seferberlik',
          tip: 'ozel',
          etki: 'seferberlik',
          aciklama:
            'Yaralı piyaden bedava ve anında ayağa kalkar. Toplanma emri verdiğin tur ' +
            'hepsi iyileşir, tek kuruş harcamazsın.',
        },
      },
      topcu: {
        zirh: {
          ad: 'Zırh',
          tip: 'stat',
          stat: 'zirh',
          aciklama:
            'Topçun kendini daha iyi siper alır; hem hafif hem ağır ateşe karşı daha çok dayanır.',
        },
        agir: {
          ad: 'Ağır vuruş',
          tip: 'stat',
          stat: 'agirVurus',
          aciklama: 'Topçunun en güçlü yanı daha da güçlenir: zırhlıya karşı yıkım.',
        },
        hafif: {
          ad: 'Hafif vuruş',
          tip: 'stat',
          stat: 'hafifVurus',
          aciklama: 'Topçunun zayıf yanı: yaya birliklere karşı etkisi artar.',
        },
        baraj: {
          ad: 'Baraj ateşi',
          tip: 'ozel',
          etki: 'baraj',
          aciklama:
            'Savaş başlamadan topçun hazırlık ateşi açar ve düşman karşılık veremez. ' +
            'Tek topçu, tek piyadeyi daha ilk atışta yarı cana indirir.',
        },
      },
      zirhli: {
        palet: {
          ad: 'Paletli üstünlük',
          tip: 'ozel',
          etki: 'palet',
          aciklama:
            'Zırhlının arazi cezası tepelikte tamamen biter, dağlıkta bitmeye yaklaşır. ' +
            'Engebeli arazi artık zırhlını durduran şey olmaktan çıkar.',
        },
        agir: {
          ad: 'Ağır vuruş',
          tip: 'stat',
          stat: 'agirVurus',
          aciklama: 'Zırhlın düşman zırhlılarına karşı üstünlük kazanır.',
        },
        hafif: {
          ad: 'Hafif vuruş',
          tip: 'stat',
          stat: 'hafifVurus',
          aciklama: 'Zırhlın piyade yığınlarını daha hızlı dağıtır.',
        },
        yarma: {
          ad: 'Yarma',
          tip: 'ozel',
          etki: 'yarma',
          aciklama:
            'Bozguna uğrattığın ordu çekilemez, olduğu yerde yok olur. Düşman o orduyu ' +
            'bir daha toparlayamaz — kazandığın savaş kalıcı bir kayıp bırakır.',
        },
      },
    },
    // Zırhlının SAVUNMA dalı bilerek yok — ölçüm her artış oranında Sv.0 verdi (zaten
    // zırh ve dayanıklılık tavanında). Yerine paletli üstünlük kondu; ayrıntı
    // `veri/arastirma-olcum.md`.
    // Ekranda ve raporlarda görünecek sıra (ağaç başına dal sırası).
    AGAC_SIRASI: ['piyade', 'topcu', 'zirhli'],
    DAL_SIRASI: {
      piyade: ['zirh', 'agir', 'hafif', 'seferberlik'],
      topcu: ['zirh', 'agir', 'hafif', 'baraj'],
      zirhli: ['palet', 'agir', 'hafif', 'yarma'],
    },

    // Her seviye o statı bu ORANDA artırır: Sv.N → stat × (1 + ARTIS × N).
    //
    // ---- 0.08 → 0.10 → 0.20 (2026-08-08, iki ayrı sebeple) ----
    //
    // ⚠ BİRİNCİ SEBEP YUVARLAMAYDI. Statlar iki basamağa inince en küçük stat 10 oldu;
    // %8 artış orada 0.8 ediyor ve sonuç yuvarlandığı için İKİ SEVİYE AYNI SAYIYA
    // düşüyordu: `Sv.1 → 11 · Sv.2 → 12 · Sv.3 → 12`. Oyuncu 180 puan ödeyip hiçbir şey
    // almıyor — sessiz ve en kötü türden bir hata.
    //
    // ⚠ İKİNCİ SEBEP ÖLÇÜMDÜ. `veri/savas-dokumu.md` şunu gösterdi: 360 puanlık stat
    // dalları savaşı %0–1 oranında değiştiriyor, yani fiilen hiçbir işe yaramıyordu.
    // Baki: *"360 puanlıkları düzenleyelim, mesela 10 olan statı ilk 12 sonra 15 yapsınlar
    // gibi düzgün sayılarla düzenle ve bozuk olmasın."*
    //
    // %20 SEÇİLDİ ÇÜNKÜ TEK "BOZUK OLMAYAN" SEÇENEK O. Bütün statlar 5'in katı ve
    // 5 × 0.20 = 1, yani her stat her seviyede TAM SAYI çıkıyor. Tarama:
    //
    //   ARTIS   10 olan stat      ondalık çıkan stat
    //   %10     11 · 12 · 13      6 adet
    //   %15     12 · 13 · 15      17 adet
    //   %20     12 · 14 · 16      YOK ✓
    //   %25     13 · 15 · 18      17 adet
    //
    // Baki'nin örneği "12 sonra 15"ti; %20 ikinci seviyede 14 veriyor. Aradaki bir birim,
    // hiçbir statta ondalık görünmemesinin bedeli — ve "bozuk olmasın" şartı ondan ağır
    // basıyor. Sv.3'te toplam artış %60 (eskiden %24): dallar artık gerçekten hissediliyor.
    // Sonuçlar kesirli kalır; muharebe hesabı zaten kesirli çalışıyor (§3.3), yalnızca
    // BİRİM SAYILARI tam sayıdır. Ekranda bir haneye yuvarlanarak gösteriliyor.
    ARTIS: 0.2,

    // ---- KENDİNE ÖZGÜ DALLARIN ETKİLERİ ----
    //
    // ┌─ DÖRDÜ DE YENİDEN YAZILDI (2026-08-08, Baki) ───────────────────────────────────┐
    // │ Eski hâlleri "azar azar buff" idi: seviye başına küçük bir yüzde. Baki dördünü   │
    // │ de tek tek yeniden tarif etti ve hepsi AYNI KALIBA oturdu — kademeli bir yüzde   │
    // │ değil, oyunun bir kuralını DEĞİŞTİREN tek bir yetenek:                           │
    // │                                                                                  │
    // │   seferberlik → yaralı piyade bedava ve ANINDA ayağa kalkar                      │
    // │   baraj       → savaş başlamadan KARŞILIKSIZ bir hazırlık ateşi                  │
    // │   palet       → tepelik cezası biter, dağlık cezası bitmeye yaklaşır             │
    // │   yarma       → bozguna uğrattığın ordu çekilemez, YOK OLUR                      │
    // └──────────────────────────────────────────────────────────────────────────────────┘
    //
    // BU YÜZDEN ARTIK TEK SEVİYELİLER (aşağıdaki OZEL_TAVAN). Dördünün de tarifi bir
    // kademe tarif etmiyor, bir eşik tarif ediyor: "bedava" ile "yarı fiyat" arası bir
    // ara seviye yok, "çekilemez" ile "biraz daha kaybeder" arası bir ara seviye yok.
    // Seviye uydurmak, Baki'nin tarif etmediği iki ara kademe icat etmek olurdu.
    //
    // §3.7'NİN 15 SATIRI YİNE ETKİLENMİYOR: o tablo ARAŞTIRMASIZ ordularla çalışıyor,
    // dördü de araştırma gerektiriyor. Kırılan bir şey varsa oyunun İÇİNDE kırılır,
    // doğrulama tablosunda değil — o yüzden ölçüm `scripts/savas-dokumu.js` ile ayrıca
    // yapılıyor (her dal açık/kapalı karşılaştırması).
    OZEL: {
      // ---- SEFERBERLİK (piyade) ----
      // > Baki: *"Yaralı piyadelerin toparlanmaya basıldığı anda ücretsiz şekilde o tur
      // > direkt toparlanmasını sağlasın."*
      //
      // Eskiden seviye başına %10 indirimdi (Sv.3'te %30). Artık BEDAVA ve TAM: toplanma
      // emri verildiği tur piyade yaralılarının hepsi ayağa kalkar, kuruş harcanmaz.
      //
      // ⚠ "BEDAVA TOPARLANMA DÜŞÜNMEYİ GEREKTİRMEZ" İTİRAZI HÂLÂ GEÇERLİ ama artık
      // karşılığı var: eskiden bu bedavalık HERKESE açıktı, şimdi 12 puanlık bir yatırımın
      // ödülü. Üstelik yalnızca PİYADE yaralısını kapsıyor — topçu ve zırhlı yaralısı
      // tam bedel ödemeye devam ediyor, yani toplanma emri hâlâ bir bütçe kararı.
      // Ölen birimin yerine yenisini koymak da bundan etkilenmiyor (o `INDIRIM` yolu).
      SEFERBERLIK_BEDAVA: true,

      // ---- BARAJ ATEŞİ (topçu) ----
      // > Baki: *"Savaşın ilk raundunda bir ateşleme yapılsın ve belirli bir hasar
      // > atsınlar; mesela 1 piyade ile 1 topçu karşı karşıya geldi, savaşın başında
      // > yapılan ateş ile piyadeyi direkt yarı dayanıklılığa indirsin gibisinden."*
      //
      // ESKİ HÂLİ NEDEN BU TARİFİ KARŞILAMIYORDU: %6'lık bir çarpandı ve İLK RAUNDUN
      // İÇİNDEYDİ — yani piyade aynı raundda karşılık veriyordu. Baki'nin tarif ettiği şey
      // bir çarpan değil, savaş başlamadan yapılan KARŞILIKSIZ bir atış.
      //
      // YENİ HÂLİ: muharebenin 1. raundundan ÖNCE topçular bir kez ateş eder, karşı taraf
      // cevap veremez, sonra savaş normal başlar. Kalıp yeni değil — BASKIN olayı da
      // "bir taraf o raunt vuramaz" diye çalışıyor (bkz. muharebe.js).
      //
      // ---- ⚠ ORAN 2026-08-12'DE "YARI CAN" TARİFİNDEN KOPTU (Baki'nin kararı) ----
      //
      // 2026-08-08'den 2026-08-12'ye kadar bu sayı tek bir cümlenin çözümüydü:
      // *"1 topçu, 1 piyadeyi savaşın başında yarı dayanıklılığa indirsin."* Etkinlik
      // eğrisi her değiştiğinde yeniden çözülüyordu (0.80 → 3.25 → 0.80 → 0.69).
      //
      // Sonra ölçüm dört özel dalı YAN YANA koydu (`veri/arastirma-olcum.md`): yakın
      // kaybedilen savaşların baraj **%95'ini** çeviriyordu, paletli üstünlük %27'sini —
      // ikisi de aynı fiyata. Baki:
      //
      // > *"60 puan çok fazla, 18'e çıkaralım hepsini ve hepsini %50 seviyesine yaklaştır."*
      //
      // "Yarı can" cümlesi ile "%50 seviyesi" hedefi AYNI ANDA TUTMUYOR: yarı cana indiren
      // bir baraj savaşların %95'ini çeviriyor. Yeni ve açık istek olan ikincisi seçildi;
      // eski cümle bilerek bırakıldı, sessizce kaybolmadı.
      //
      // 0.20 ÖLÇÜMLE SEÇİLDİ. Ön vuruş oranı → yakın kaybedilen savaşı çevirme oranı:
      //   0.69 → %95   ·   0.40 → %84   ·   0.30 → %71
      //   0.25 → %64   ·   **0.20 → %55**   ·   0.15 → %45
      // Paletin çalıştığı arazide (tepelik+dağlık) ikisi artık yan yana: baraj %50,
      // palet %43. Baraj hâlâ üç arazide birden çalışıyor, palet ovada tanım gereği
      // çalışmıyor — kalan fark budur ve dalın kimliğinden geliyor.
      //
      // Somut karşılığı: 1 topçunun barajı 1 piyadeyi yarı cana değil, canının yaklaşık
      // **yedide birine** kadar götürüyor (10.1 hasar / 70 can). Yetenek hâlâ karşılıksız
      // bir atış ve hâlâ güçlü; artık tek başına savaş kazanmıyor.
      BARAJ_ON_VURUS: 0.2,

      // ---- PALETLİ ÜSTÜNLÜK (zırhlı) ----
      // > Baki: *"Paletli üstünlük ile arazi cezası tepelik için bitsin, dağlık için de
      // > bitmeye yakın bir orana düşsün."*
      //
      // Telafi ARTIK ARAZİ BAŞINA. Ceza = 1 − arazi çarpanı; telafi o cezanın geri alınan
      // payı (`muharebe.js zirhliArazi`):
      //
      //   tepelik  0.85 → ceza 0.15 → telafi 1.00 → çarpan 1.00  (ceza TAMAMEN biter)
      //   dağlık   0.50 → ceza 0.50 → telafi 0.80 → çarpan 0.90  ("bitmeye yakın")
      //   ova      1.15 → ceza YOK  → çarpan 1.15 (dokunulmaz — dal avantajı büyütmez)
      //
      // ⚠ BU, §3.5'İN "COĞRAFYA TOPÇUNUN TEK ŞANSI" KURALINI ZAYIFLATIYOR ve bu bilinçli
      // bir tercih: Görev 12'de arazi yumuşatması tam bu satır yüzünden 1.30'da kesilmişti
      // (`veri/sans-olcum.md`). Fark şu: orada yumuşama HERKESE bedavaydı, burada bir
      // yatırımın karşılığı ve yalnızca yatırımı yapanı ilgilendiriyor.
      //
      // ---- ⚠ %50 HEDEFİNDE BU DALIN TAVANI ÖLÇÜLDÜ (2026-08-12) ----
      // Baki dört özel dalın da "%50 seviyesine yaklaşmasını" istedi. Baraj bir sayı
      // düşürülerek oraya geldi; PALET GELEMEZ ve sebebi yapısal:
      //
      //   telafi 1.0/0.8 (bugün)      → üç arazi ortalaması %27
      //   telafi 1.0/1.0 (tam telafi) → %30   ← bu dalın MATEMATİKSEL TAVANI
      //   ova dahil tam telafi        → %30   (ovada zaten ceza yok, verecek şey yok)
      //
      // Ortalama düşük çünkü PALET OVADA TANIM GEREĞİ HİÇBİR ŞEY YAPMIYOR (%0) ve tarama
      // üç araziyi eşit ağırlıklı geziyor. Dalın gerçekten çalıştığı yerde ölçülünce:
      //
      //   tepelik + dağlık → **%43**   (baraj aynı arazilerde %50)
      //
      // Yani palet kendi alanında zaten hedefte. Ortalamayı %50'ye çıkarmanın tek yolu
      // dala ovada da bir şey yaptırmak olurdu — o da "telafi yalnızca cezayı yumuşatır,
      // avantajı asla büyütmez" kuralını kırardı. Sayı bu yüzden DEĞİŞMEDİ; dağlığı 1.0
      // yapmak Baki'nin "dağlık için bitmeye yakın" cümlesini üç puan uğruna bozardı.
      PALET_TELAFI: { tepelik: 1.0, daglik: 0.8 },

      // ---- YARMA (zırhlı) ----
      // > Baki: *"Yendiği düşmanlar yaralanmasın, direkt yok olsunlar; toparlanmaya izin
      // > vermesin."*
      //
      // Eskiden çekilen düşman seviye başına 1 birim FAZLA kaybediyordu. Artık çekilme
      // diye bir şey yok: bozguna uğrattığın ordu dağılır ve YOK OLUR. Kaçan kimse
      // olmadığı için toplanacak kadro da kalmıyor — Baki'nin "toparlanmaya izin vermesin"
      // şartı buradan geliyor, ayrı bir kural yazılmadı.
      //
      // Motor tarafında yeni bir yol AÇILMADI: `cozum.js cekil` zaten "gidecek yer yoksa
      // ordu yok olur" durumunu biliyor (`yokOldu`). Yarma o durumu tetikliyor, o kadar.
      //
      // ⚠ EN GÜÇLÜ DÖRT DALDAN BİRİ. Bozgun bu oyunda normalde "ordu kaçtı, yarısı sağ,
      // sonra toplanır" demek; yarmayla "ordu bitti" demek. Ölçümde zırhlı ağırlıklı
      // orduların maç boyu etkisi bu yüzden ayrıca izlendi.
      YARMA_IMHA: true,
    },

    // ---- ÖZEL DALLAR TEK SEVİYELİ VE AYRI FİYATLI ----
    //
    // Stat dalları eskisi gibi: 3 seviye, 60/120/180 puan (toplam 360). Özel dallar tek
    // seviye ve sabit fiyat. `arastirma.js` tavanı ve bedeli dalın TİPİNE göre okuyor.
    //
    // ---- 12 → 18 (2026-08-12, Baki) ----
    //
    // 2026-08-08'de 12'ydi ("bu yüksek özellikler 12 puan her biri") ve o gün ölçüm
    // "çok ucuz" demişti: dördü toplam 48 puan, kabaca 5–7 turluk yatırım — yani hepsi
    // maçın ilk çeyreğinde açılıyor ve oyunun geri kalanı "herkeste hepsi var"
    // dünyasında geçiyordu. Karşılaştırma: tek bir stat dalı 360 puan.
    //
    // 2026-08-12'de ölçüm dört dalı yan yana koydu ve fiyatın yanında GÜÇ FARKINI da
    // gösterdi (baraj yakın savaşların %95'ini çeviriyor, palet %27'sini). Baki:
    //
    // > *"60 puan çok fazla, 18'e çıkaralım hepsini ve hepsini %50 seviyesine yaklaştır."*
    //
    // İki iş birden yapıldı: fiyat 18 (dördü toplam 72 puan) ve barajın ön vuruşu
    // 0.69 → 0.20 (bkz. `OZEL.BARAJ_ON_VURUS`). Fiyat hâlâ bir stat dalının 20'de
    // biri. (2026-09-23'ten beri yetenek AĞACIN UCU — aşağıdaki `OZEL_ONKOSUL`. Asıl
    // bedeli artık bu 18 puan değil, önündeki kapı.)
    OZEL_TAVAN: 1,
    OZEL_MALIYET: 18,

    // ---- ÖZEL YETENEĞİN ÖNKOŞULU (Görev 20 · Baki, 2026-09-23: "evet") ----
    //
    // Araştırma ekranı Polytopia'nın teknoloji ağacına döndü ve Baki'ye soruldu: *"özel
    // yetenek ağacın ucu olsun mu — o birliğin bir dalı 2. kademeye çıkınca açılsın?"*
    // Cevap evet. Yetenek artık o birliğin ORTAK dallarından (zırh · ağır · hafif) herhangi
    // biri bu kademeye çıkınca alınabiliyor.
    //
    // NEDEN 2: kapı 60 + 120 = 180 puan. 1 olsaydı kapı 60 puan olurdu ve yetenek yine
    // maçın ilk turlarında alınırdı — Görev 13'ün "özel dal çok ucuz, ilk karar hep aynı"
    // sorunu (DENETIM-2026-09-23 · Görev 13 maddesi) çözülmeden kalırdı. 3 olsaydı yetenek
    // tam teçhizatın ÖDÜLÜ olurdu (360 puan) ve maçların çoğunda hiç görülmezdi.
    //
    // Yapay zekâ özel dal seçmiyor (`zeka.js arastirmaDali` yalnızca ortak dallara bakıyor),
    // yani bu kapı rakibin gücünü değiştirmiyor; yalnızca oyuncunun yolunu sıralıyor.
    OZEL_ONKOSUL: 2,

    // Bir dalın çıkabileceği en yüksek seviye.
    //
    // ---- ⚠ BU SAYIYI HANGİ ÖLÇÜTÜN BAĞLADIĞI 2026-08-11'DE DEĞİŞTİ ----
    //
    // ESKİ ÖLÇÜT: "araştırma §3.7'nin 15 satırını hangi seviyeye kadar BOZMUYOR" — tavan
    // ölçülen o sınırın bir kademe altına konuyordu. Baki'nin isteği bu ölçütü emekli etti:
    //
    // > *"Araştırmaları yapılan birlikler savaşları kesinlikle değiştirebilsin; sınırdan
    // > kaybedilen savaşlar araştırma yapılınca sınırdan kazanmaya veya ezmeye başlasın."*
    //
    // Yani tablonun kayması artık kusur değil, İSTENEN sonuç. Üstelik eski ölçütün ÇÖZÜMÜ
    // DE YOKTU ve bu ölçüldü (`veri/arastirma-olcum.md` §5): sekiz stat dalından hangi alt
    // küme açılırsa açılsın tam teçhizatta en az bir satır kayıyor. Zırhlıya zırh ya da
    // dayanıklılık dalı eklemek de kurtarmıyor, yalnızca kayan satırı değiştiriyor.
    //
    // YENİ ÖLÇÜT ÜÇ PARÇALI ve üçü de `veri/arastirma-olcum.md`'de ölçülü:
    //   1. ARAŞTIRMASIZ TABAN: §3.7 15/15 durmalı — oyunun kimliği araştırmasız orduların
    //      tarifidir. (Testte de var; bozulursa STATLAR bozulmuş demektir.)
    //   2. SINIRDAKİ SAVAŞ DÖNMELİ: kıl payı kaybedilen savaşların tek dalla dönme oranı
    //      Sv.1'de %46, Sv.2'de %87, Sv.3'te %95 (savunan araştırırsa %71 / %96 / %99);
    //      tam teçhizatta %100. Yani seviyeler basamak basamak hissediliyor, son
    //      basamak da bir şey ekliyor — tavanı buradan indirmek için sebep yok.
    //   3. UMUTSUZ SAVAŞ DÖNMEMELİ: ezilerek kaybedilen savaşların yalnızca %15'i tam
    //      teçhizatla dönüyor. Tavan büyürse bu sayı da büyür ve ordu büyüklüğü anlamını
    //      yitirir — asıl üst sınırı artık BU çiziyor.
    //
    // 3, Baki'nin 2026-07-31'de verdiği sayı ve yukarıdaki üç ölçütü birden tutuyor.
    TAVAN: 3,

    // Sv.N'e çıkmanın bedeli = MALIYET_TABANI × N puan. Yani 60, 120, 180 …
    // Seviye başına bedel doğrusal arttığı için TOPLAM bedel karesel olur (Sv.3 = 360 puan).
    //
    // DAL SAYISI 3'TEN 12'YE ÇIKTI, yani ağacın tamamı 12 × 360 puan. Görev 06'da toplam
    // 54 puandı (o zamanki ölçekle) ve 15 turda "tek seferlik sıçrama" olduğu ölçülmüştü.
    // Artık araştırma UZUN SOLUKLU bir yatırım: hiçbir oyuncu 15 turda ağacı bitiremez,
    // hangi birimine yatırım yapacağını seçmek zorunda kalır. Seçim yapmak zorunda olmak,
    // tek seferlik sıçramadan daha iyi bir oyun kararıdır. Denge ölçümü Adım 7'de yeniden
    // koşulacak ve gerekirse taban buradan düşürülecek (§14 düğmesi).
    //
    // PUAN ÖLÇEĞİ 10× (2026-07-31, Baki: "ondalıklı hiçbir şey istemiyorum"). Puan eskiden
    // KESİRLİ birikiyordu ve ekranda "+2.4/tur" diye görünüyordu. Artık tam sayı; ölçek
    // 10× olduğu için tur başına kazanç yine ince ayarlanabiliyor (yuvarlama, kazancın
    // yaklaşık %1'i — eskiden kesir tutmanın sebebi bu kaybı önlemekti).
    MALIYET_TABANI: 60,

    // Araştırmaya ayrılan 1 ekonomi kaç puan eder?
    //   verim = VERIM_TABANI + EGITIM_KATSAYISI × √(eğitim gücü)
    // Sonuç tur başında TAM SAYIYA yuvarlanır (`arastirma.js turPuani`).
    //
    // Eğitim gücü, aktörün elindeki parçaların eğitim değerlerinin toplamıdır (§5/3;
    // hesap `parcaDegerleri` ile, nüfus ve ekonomiyle AYNI yoldan). Böylece eğitimli ili
    // fethetmek somut bir ödül olur — şu ana kadar eğitim statı oyunda hiçbir işe yaramıyordu.
    //
    // KAREKÖK, çünkü büyüyen imparatorluk zaten daha çok ekonomi ayırabiliyor. Çarpan da
    // doğrusal büyüseydi araştırma imparatorluk büyüklüğünün KARESİYLE artardı — kartopunu
    // ikinci kez beslerdi (Soru 5). Karekökle ikinci ilin katkısı birincisinden azdır.
    VERIM_TABANI: 6,
    EGITIM_KATSAYISI: 1.2,
  },

  // Bir birim turda kaç komşu parça ileri gidebilir (§5'ten türetildi: "beş parçalı bir ili
  // baştan sona geçmek zaten beş tur sürüyor"). Emir kuyruğunda bu, "bir birim yalnızca tek
  // emre yazılabilir" kuralına karşılık gelir — art arda fetih zinciri kurulamaz.
  HAMLE_HAKKI: 1,

  // ---- FETİH (§13.2, §14) ----
  FETIH: {
    // Fethedilen parçanın NÜFUS PAYININ bu oranı kadar TEK SEFERLİK nüfus kazanılır
    // (seferberlik). Kartopu hızının ana düğmesi: büyütürsen fetih fethi besler.
    NUFUS_ORANI: 0.6,
  },

  // ---- KURULUŞ GARNİZONU (Görev 05 / Soru 2 → Baki'nin cevabı A, 2026-07-27) ----
  // Oyun kurulurken HER parçaya ilinin statlarından türetilmiş bir savunma ordusu konur.
  // Üretmez, hareket etmez, karar vermez — yapay zekâ değil, VERİ. Görev 07'de gerçek YZ
  // gelince bu ordular onun başlangıç kuvveti olur, atılacak kod olmaz.
  //
  // Bilinen kusuru (bilerek kabul edildi): garnizon tükenince yerine yenisi gelmez, oyuncu
  // ilerledikçe direnç azalır (kartopu). Düzelten şey Görev 07.
  GARNIZON: {
    // ---- İL DÜZEYİNDE BÜTÇE (Görev 07 / Soru 3 → Baki'nin cevabı A, 2026-07-31) ----
    //
    // ESKİ KURAL: garnizon PARÇA BAŞINA hesaplanıyordu (`⌈(nüfus+sanayi)/4⌉`) ve ilin
    // toplam savunması parça sayısıyla çarpılıyordu. Parça sayısı ise §7'ye göre
    // YÜZÖLÇÜMÜNDEN geliyor, güçten değil — sonuç ölçüldü (Görev 06 §13/1c):
    //
    //     İstanbul  değer 20 · savunma 10 → oran 2.00   (en değerli il, en kârlı hedef)
    //     Ankara    değer 17 · savunma 20 → oran 0.85
    //     Iğdır     değer  5 · savunma  1 → oran 5.00   (tek parçalı iller kolay lokma)
    //
    // 81 ilin yayılımı 6.67 KAT. En zengin iller en kârlı hedefler oluyordu ve bu KASTEN
    // seçilmiş bir tasarım değil, parça sayısının yan etkisiydi.
    //
    // YENİ KURAL: ilin toplam savunması DEĞERİNE orantılı — `⌈(nüfus + ekonomi) × KATSAYI⌉`
    // — sonra §7'nin üç kuralıyla (oransal · en az 1 · tekdüzelik) parçalarına bölünür.
    // O üç kural zaten yazılı ve testli (`uretim.js parcaDegerleri`); yeni bölüşüm mantığı
    // icat edilmedi. Ölçüm: `node scripts/garnizon-olcum.js` → `veri/garnizon-olcum.md`.
    //
    // NEDEN nüfus+EKONOMİ, nüfus+sanayi değil: çözülen sorun "değer ÷ savunma" oranıydı ve
    // oradaki DEĞER nüfus+ekonomidir. Savunmayı başka bir stat çiftine bağlamak oranı yine
    // ile göre dalgalandırırdı. Sanayi statı garnizondan düşmedi — KARIŞIMI hâlâ o belirliyor
    // (aşağıdaki FARK_ESIGI), yani "hangi il hangi orduyu doğurur" tablosu yerinde.
    //
    // KATSAYI 0.64 ÖLÇÜMLE SEÇİLDİ, yuvarlak diye değil: 0.58–0.70 arası tarandı ve toplam
    // garnizonu eski kuralın 470 birimine en çok yaklaştıran değer bu (475, %1 fark).
    // Oyun açılışının SERTLİĞİ bu görevde bilerek değiştirilmedi; değişen tek şey DAĞILIM.
    // Büyütürsen ilk fetih zorlaşır, küçültürsen açılış yumuşar (§14 düğmesi).
    KATSAYI: 0.64,

    // ---- MERKEZ PARÇA AĞIRLIĞI (Görev 17) ----
    //
    // Sorun ölçülü: 18 il tek parça · 38 il iki · 13 il üç · 12 il dört. İllerin %69'u en
    // çok İKİ hamlede düşüyor. İlin bir "kalbi" olmalı.
    //
    // ⚠ İLİN TOPLAM GARNİZONU DEĞİŞMİYOR, DAĞILIMI DEĞİŞİYOR. Merkezin payı bu katsayı
    // kadar ağırlaşıyor, kalan parçalarınki azalıyor — `parcaDegerleri` sabit bir toplamı
    // bölüştürdüğü için bu kendiliğinden oluyor. Böylece 2026-07-31'de ölçülen açılış
    // sertliği (toplam 475 birim) korunuyor; değişen tek şey ilin NEREDE sert olduğu.
    //
    // AĞIRLIK PARÇA SAYISIYLA BÜYÜYOR: çarpan = 1 + MERKEZ_AGIRLIK × (parça sayısı − 1).
    //   1 parçalı il → ×1.00 (parçanın kendisi zaten merkez, etki yok — doğru davranış)
    //   2 parçalı    → ×1.25 · 3 parçalı → ×1.50 · 4 parçalı → ×1.75
    // Büyük ilin kalbi daha sert olmalı: dört parçalı bir ili almak dört eşit lokma değil,
    // üç kolay lokma ve bir kale olsun.
    MERKEZ_AGIRLIK: 0.25,

    // ---- PARÇALARA BÖLÜŞÜMDE PAY YUMUŞATMA (2026-07-31, Baki) ----
    //
    // > *"İllerin genel sayılarını düzgün yapmışsın ama kendi içindeki parça dağılımları
    // > dengesiz olmuş. Bazı parçalar daha değersiz evet, ama ilin geneli 8 güçte 1 parçaya
    // > 7 diğerine 1 vermek çok dengesiz; 2-6 veya 3-5 gibi biraz daha yakın yap ama
    // > yakınlığı abartma."*
    //
    // Ham paylar doğrudan kullanılınca gerçekten uçlara gidiyordu (ölçüldü):
    // Gaziantep 9 güçte **8-1**, İzmir 11'de **9-2**, en dengesiz ilin payı %89.
    //
    // Pay, EŞİT DAĞILIMA DOĞRU çekiliyor:  pay' = (1−K) × pay + K × (1/parça sayısı)
    //   K = 0   → ham pay (bugünkü uçlar)
    //   K = 1   → hepsi eşit (parçanın değeri hiç sayılmaz)
    //
    // 0.5 ÖLÇÜMLE SEÇİLDİ, Baki'nin verdiği bandın tam ortasına oturuyor: en dengesiz ilin
    // payı %89 → **%75** (8 güçte 6-2), Gaziantep 6-3, İzmir 7-4. Ortalama pay %51 —
    // yani "yakınlığı abartma" da karşılanıyor, parçalar arasındaki fark duruyor.
    // Büyütürsen parçalar birbirine benzer, küçültürsen ilin tek bir kalesi olur.
    PAY_YUMUSATMA: 0.5,
    // Karışım §4.5'teki "hangi il hangi orduyu doğurur" tablosundan gelir. İl tipi
    // nüfus ve sanayi statının farkına bakılarak seçilir (eşik: FARK_ESIGI).
    //   kalabalık il (nüfus ≫ sanayi) → saf piyade
    //   sanayi ili   (sanayi ≫ nüfus) → 2 topçu + 3 zırhlı
    //   dengeli il                    → 3 piyade + 1 topçu + 1 zırhlı
    FARK_ESIGI: 2,
    KARISIM: {
      kalabalik: { piyade: 1 },
      sanayi: { topcu: 2, zirhli: 3 },
      dengeli: { piyade: 3, topcu: 1, zirhli: 1 },
    },
  },

  // ---- YAPAY ZEKÂ (Görev 07 / tasarım §9) ----
  //
  // TEK BEYİN, 80 AKTÖR (§9.1). Bir ilin durumunu alıp en iyi hamleyi döndüren tek bir
  // karar fonksiyonu var (`src/oyun/zeka.js`); aktör sayısı kadar çalıştırılıyor.
  // Aktörleri birbirinden ayıran şey kod değil, KİŞİLİK AĞIRLIKLARI (§9.4).
  //
  // BURADAKİ HER SAYI FORMÜLE DIŞARIDAN GİRER. `zeka.js`'te çıplak sayı yoktur; testler
  // bunu katsayıyı değiştirip kararın değiştiğini görerek kanıtlıyor. Kural Görev 05 ve
  // 06'nın aynısı — fayda formülü uzun olduğu için ara hesapta sayı yazmak çok kolay.
  ZEKA: {
    // §9.4'ün dört ağırlığı. Aktör başına tohumdan üretilir, kayıtta durur.
    AGIRLIKLAR: ['saldirganlik', 'acgozluluk', 'husumet', 'temkin'],

    // ---- HUSUMET AÇILDI (Görev 08 / Adım 7) ----
    // Aşağıdaki not Görev 07'de yazıldı ve o zaman doğruydu; artık `veri/husumetler.js`
    // var. Terim formülde zaten duruyordu, tek değişen bu bayrak — sözü tutuldu.
    //
    // ---- (Görev 07'nin notu, tarih kaydı olarak duruyor) ----
    // HUSUMET BU GÖREVDE KAPALI — veri yok, uydurulmadı.
    // Tasarım §13.2 "husumet çiftleri verisi ✅" diyor ama o liste ESKİ PROJEDEN
    // TAŞINACAKLAR listesidir; taşınmış değil. Depo arandı: `veri/iller.json`,
    // `veri/parcalar.json`, `veri/komsuluk.json` — hiçbirinde husumet/rekabet alanı yok,
    // kelime yalnızca `docs/` altındaki belgelerde geçiyor.
    //
    // Ağırlık yerinde duruyor ve fayda formülünde çarpanı var; kapalıyken hep 0 üretiliyor,
    // yani terim sessizce düşüyor. Hasım tablosu Görev 08'de rekabet olaylarıyla (§11)
    // gelince burası `true` olur ve formülün geri kalanına dokunulmaz.
    HUSUMET_ACIK: true,

    // ---- ZORLUK KADEMESİ (§9.4: "zorluk = ağırlık ayarı, hesap değil") ----
    //
    // Kademe yalnızca üç şeyi değiştirir: kişilik aralıkları, karar gürültüsü ve —
    // verilecekse — üretim çarpanı. GİZLİ BONUS YOKTUR. Zor kademede yapay zekâ daha çok
    // kaynak alacaksa oyuncu bunu EKRANDA görür; görmezse aldatıldığını hisseder ve
    // haklıdır. Bugün üçünde de çarpan 1: zorluk saf ağırlık farkı.
    //
    // `gurultu`, hamle puanına eklenen tohumlu sapmanın genliğidir (puanın oranı olarak).
    // Kolayda yüksek — aktör en iyi hamleyi bulur ama hep onu oynamaz; bu, "aptal yapay
    // zekâ" yazmadan zorluk düşürmenin dürüst yolu. Zorda 0: her zaman en iyisini oynar.
    VARSAYILAN_ZORLUK: 'orta',
    ZORLUK: {
      kolay: {
        ad: 'Kolay',
        aralik: { saldirganlik: [0.1, 0.5], acgozluluk: [0.2, 0.6], temkin: [0.5, 1.0] },
        gurultu: 0.35,
        uretimCarpani: 1,
      },
      orta: {
        ad: 'Orta',
        aralik: { saldirganlik: [0.3, 0.8], acgozluluk: [0.3, 0.8], temkin: [0.3, 0.8] },
        gurultu: 0.15,
        uretimCarpani: 1,
      },
      zor: {
        ad: 'Zor',
        aralik: { saldirganlik: [0.5, 1.0], acgozluluk: [0.5, 1.0], temkin: [0.1, 0.5] },
        gurultu: 0,
        uretimCarpani: 1,
      },
    },
    ZORLUK_SIRASI: ['kolay', 'orta', 'zor'],

    // ---- ÜÇ KARAKTER (Görev 12 / Adım 2 · Baki 2026-08-06) ----
    //
    // > *"Her yeni savede Agresif/Dengeli/Çekimser karakter özellikleri 81 il arasında
    // > rastgele dağıtılsın ve her oyun farklı hissettirsin; asıl olay her oyun aynı
    // > ilerlemelerin olmaması."*
    //
    // SORUN NEYDİ: kişilik zaten her maçta tohumdan rastgele üretiliyordu, ama ağırlıklar
    // TEK BİR BANTTAN çekiliyordu (ortada `[0.3–0.8]`). 81 ilin hepsi ortalama çıkıyor,
    // kimse belirgin bir karakter olmuyordu. Rastgelelik vardı, KARAKTER yoktu.
    //
    // ÇÖZÜM: karakter, zorluk bandının İÇİNDEN bir DİLİM alır. Aşağıdaki sayılar mutlak
    // ağırlık değil, bandın 0–1 arası oranıdır:
    //
    //     ağırlık = bandAlt + oran × (bandÜst − bandAlt)
    //
    // Neden oran: zorluk kademesi anlamını korusun. Kolay kademede "saldırgan" bir il
    // gerçekten saldırgandır ama zor kademedeki saldırganın seviyesine çıkmaz — yoksa
    // kolay kademe Görev 07–09'da ölçülmüş dengesinden sessizce sapardı.
    //
    // Toplam dağılım eskisine yakın kalıyor (bandın tamamı yine kullanılıyor); değişen
    // şey, TEK TEK aktörlerin birbirinden ayrışması.
    KARAKTER_SIRASI: ['saldirgan', 'dengeli', 'cekimser'],
    KARAKTERLER: {
      saldirgan: {
        ad: 'Saldırgan',
        // Bandın üst ucu: çok saldırır, çok ister, az çekinir.
        dilim: { saldirganlik: [0.6, 1.0], acgozluluk: [0.55, 1.0], temkin: [0.0, 0.4] },
      },
      dengeli: {
        ad: 'Dengeli',
        // Bandın ortası — bugünkü davranışın kendisi. Karışımın omurgası.
        dilim: { saldirganlik: [0.3, 0.7], acgozluluk: [0.3, 0.7], temkin: [0.3, 0.7] },
      },
      cekimser: {
        ad: 'Çekimser',
        // Bandın alt ucu: kolay saldırmaz, sırtını sağlama alır, anlaşmaya açıktır
        // (temkin yüksek → `FAYDA.KOMSU` ve ateşkes terimleri onun lehine çalışıyor).
        dilim: { saldirganlik: [0.0, 0.4], acgozluluk: [0.0, 0.45], temkin: [0.6, 1.0] },
      },
    },

    // Hangi karakterden kaç tane çıkacağı — ZORLUĞUN İKİNCİ İŞİ.
    // §9.4'ün "zorluk = ağırlık ayarı, gizli bonus değil" kuralı bozulmuyor: zor kademede
    // yapay zekâ fazladan kaynak almıyor, sadece KİMLERLE oynadığın değişiyor.
    // Paylar toplamı 1 olmak zorunda değil; `kisilikUret` toplama göre normalize ediyor.
    KARISIM: {
      kolay: { saldirgan: 0.2, dengeli: 0.35, cekimser: 0.45 },
      orta: { saldirgan: 0.33, dengeli: 0.34, cekimser: 0.33 },
      zor: { saldirgan: 0.5, dengeli: 0.33, cekimser: 0.17 },
    },

    // ---- FAYDA FORMÜLÜNÜN TERİM KATSAYILARI (§9.1) ----
    //
    //   puan = DEGER   × açgözlülük  × hedefin değeri × üstünlük
    //        − BEDEL   × temkin      × gönderilen kuvvetin bedeli × (1 − üstünlük)
    //        − ACIKTA  × temkin      × açıkta kalma cezası
    //        + HUSUMET × husumet     × (hedef hasım mı)
    //        + SALDIRI × saldırganlık
    //
    // Kişilik ağırlığı 0–1 arası; buradaki katsayılar terimleri AYNI ÖLÇEĞE getirir.
    // Hedef değeri parçanın nüfus+ekonomi değeri (2–8 bandında), bedel ise gönderilen
    // birimlerin satın alma bedeli (birim başına 4–7) — ikisi doğrudan toplanamaz.
    //
    // ---- "BİR TIK DAHA AGRESİF" (2026-08-01, Baki'nin cihaz denemesi) ----
    //
    // > *"Genel bir savunma yatkınlığı görüyorum orta seviyede... bir tık, sadece bir tık
    // > daha agresif olabilirler."*
    //
    // Teşhis doğruydu ve suçlu ACIKTA idi: aktör kuvvetini gönderdiğinde arkasının açık
    // kalması cezalandırılıyor ve ceza `temkin` ile çarpılıyor. Katsayı büyük olunca
    // temkinli aktör HİÇ saldırmıyor.
    //
    // TARANDI (15 tur, oyuncu hiç emir vermiyor, üç kademe · saldırı sayısı ölçüldü):
    //
    //   ACIKTA  SALDIRI   kolay   orta   zor
    //   2.0     0.50        22    122   705     ← bugünkü
    //   1.9     0.60        25    169   818     ← SEÇİLEN (+%39 orta)
    //   1.8     0.65        26    177   866
    //   1.75    0.70        30    229   855     ← "bir tık"tan fazlası
    //   1.5     0.80        42    273  1028     ← başka bir oyun
    //
    // 1.9/0.60 SEÇİLDİ: orta kademede gözle görülür (+%39) ama kolay hâlâ sakin (22 → 25)
    // ve zor zaten doymuş durumda. "Bir tık" tam olarak bu — bir sonraki kademe (1.8/0.65)
    // hazır bekliyor, hâlâ pasif gelirse tek satır.
    TERIM: {
      DEGER: 1.0,
      BEDEL: 0.25,
      ACIKTA: 1.9,
      HUSUMET: 3.0,
      SALDIRI: 0.6,
    },

    // Hedef parçayı almak İLİ TAMAMLIYORSA değerine eklenen bonus. Oyunun kazanma birimi
    // il: son parçayı almak haritada bir ili bütünüyle senin yapar. Bonus olmasaydı zekâ
    // ilin son parçasını herhangi bir parça gibi görür ve yarım kalmış illerle dolu bir
    // harita bırakırdı. Tipik parça değeri 2–8; 4 bu bandın ortası, yani "bir parça daha
    // değerinde" ek çekim.
    IL_BONUSU: 4,

    // Açıkta kalma cezasının üst sınırı. Ceza = düşman komşulardaki kuvvet ÷ (geride kalan
    // + 1); kırpılmasaydı tek bir dev komşu aktörü tamamen felç ederdi — 20 kat üstün bir
    // tehditle 200 kat üstün olan arasındaki fark kararı değiştirmiyor, ikisi de "gitme" der.
    ACIKTA_TAVAN: 6,

    // ---- EKONOMİ KARARLARI (Adım 4) ----
    //
    // AÇGÖZLÜLÜK EKONOMİYİ BÖLER (görev belgesi §5, boşluk 4): ne kadarı orduya, ne kadarı
    // araştırmaya. Açgözlü aktör bugünün ordusunu ister, açgözlü olmayan yarının kalitesini.
    // Oran kodda değil burada — açgözlülük 0 iken ARASTIRMA_PAYI_EN_COK, 1 iken EN_AZ.
    ARASTIRMA_PAYI_EN_AZ: 0.1,
    ARASTIRMA_PAYI_EN_COK: 0.45,

    // Yapay zekâ havuzunun bu oranından fazlasını tek turda orduya yatırmaz. Sınır olmasa
    // aktör her turu sıfır bakiyeyle kapatır ve tek bir kötü muharebeden sonra toparlanma
    // ya da araştırma için hiç parası kalmazdı. Oyuncu bu kısıtı yaşamıyor ama oyuncunun
    // önünde bir ekran var; zekânın yerine düşünen tek şey bu sayı.
    URETIM_PAYI: 0.75,

    // ---- ÜRETİM FRENİ / SİLAHLANMA YARIŞI (2026-08-12, Baki) ----
    //
    // > *"İller yakınındaki bir il asker bastığında o basıyor, diğeri basıyor, döngüye
    // > giriyorlar; 100–200 askere kadar devam ediyorlar. Bazı parça sayısı az iller
    // > oyun sonlarına doğru yapsa anlarım ama oyun başı için kesinlikle azaltılsın."*
    //
    // ÖLÇÜM ŞİKÂYETİ DOĞRULADI (`veri/URETIM-NOTU.md`, 2026-08-12 girdisi): orta zorlukta
    // 60 turda en büyük yığın **10 → 258** birim, ortalama ordu 3 → 39, toplam 538 → 5648.
    //
    // SEBEP: `zeka.js uretimKarari` "yeterince askerim var mı?" diye hiç sormuyordu.
    // İki komşu da bütçesinin %75'ini her tur orduya yatırınca ORAN hiç değişmiyor,
    // kimse saldıramıyor, ikisi de basmaya devam ediyor.
    //
    // FREN: toplam kuvvetim çevremdeki toplam tehdidin KAT katını aşarsa o tur asker
    // basmıyorum; para araştırmaya akıyor.
    DOYMA: {
      ACIK: true,

      // ⚠ BU SAYI "FIRSAT YARATMAK" İÇİN 1'İN BİRAZ ÜSTÜNDE. Baki aynı istekte
      // *"fırsatlar yaratılsın"* dedi ve mesele tam olarak burada dengeleniyor:
      //   • Çok düşük (1.0) → herkes tehdidiyle başa baş kalır, kimse saldıracak
      //     üstünlüğü kuramaz, dünya daha da kilitlenir.
      //   • Çok yüksek (3+) → fren fiilen çalışmaz, 258'lik yığınlar geri gelir.
      // 1.2 seçildi çünkü zekâ ordusunun **%89'unu tek yığında topluyor** (ölçüldü):
      // toplamda 1.2 kat olan bir aktör tek cephede 3 kata çıkabiliyor — fetih için
      // gereken oran o. Yani sınır TOPLAMA konuyor, üstünlük YOĞUNLAŞMAYLA kuruluyor.
      KAT: 1.2,

      // ---- ⚠ TOPRAK ÇIPASI — ORAN TEK BAŞINA YETMEDİ ----
      // Yalnız oranla ölçüldüğünde yığınlar 258 → 131'e indi ama BÜYÜME DURMADI: oran
      // tabanlı bir tavanı iki taraf da uygulayınca geri besleme doğuyor (A, B'nin 1.2
      // katına; B geride kaldı, A'nın 1.2 katına; …). Oranın çıpası yok.
      //
      // Toprak çıpası Baki'nin cümlesini birebir kodluyor: *"bazı parça sayısı az iller
      // oyun sonlarına doğru yapsa anlarım"* — 3 parçalı ilin 100 askeri saçma, 20 parçalı
      // imparatorluğun normal. Aktörün ordusu parça başına bu sayıyı aşamıyor.
      //
      // 8 seçildi: kuruluş garnizonu parça başına ~2.7 birim, yani tavan başlangıcın üç
      // katı — savunma için rahat pay var ama "asker deposu" kurmaya yetmiyor.
      //
      // ---- ⚠ ZAMANLA GEVŞEYEN TAVAN DENENDİ VE BAKİ GERİ ALDI (2026-08-12) ----
      // Baki'nin cümlesi iki yarımdı: *"…yapsa anlarım oyun sonlarına doğru, ama oyun başı
      // için kesinlikle azaltılsın."* İkinci yarım için tavan maç boyunca 6 → 18 gevşetildi
      // (eğri `bitirmeIstahi`). Ölçüm kazancı küçük, bedeli büyük buldu:
      //
      //   | | sabit 8 | zamana bağlı 6→18 |
      //   |---|---|---|
      //   | orta: kalan sahip | 48 | 44 (biraz daha konsolidasyon) |
      //   | orta: zirve yığın | 24 | 37 |
      //   | **kolay: zirve yığın** | **21** | **59** ← düzeltilmek istenen şeyin kendisi |
      //
      // Kolay kademede yapay zekâ neredeyse hiç saldırmıyor (60 turda 41 fetih); ordular
      // hiçbir savaşta erimediği için takvim gevşedikçe boş yere birikiyordu. Üç seçenek
      // ölçümle sunuldu, Baki **sabit tavanı** seçti. Gevşemeyi geri isteyen bu sayıyı
      // büyütür — ikinci bir mekanizmaya gerek yok.
      PARCA_BASINA: 8,

      // Tehdidi olmayan iç bölge aktörü bile bu kadar birlik bulundurur. 0 olsaydı iç
      // iller tamamen ordusuz kalır, cephe içeri sarktığında savunmasız yakalanırlardı.
      EN_AZ: 4,
    },

    // Sınırdaş düşmanların bu oranı ZIRHLIYSA ağır vuruş araştırılır, altındaysa hafif.
    // 0.30 = "üçte biri zırhlıysa tanksavar lazım"; §3.3'te ağır vuruş zaten yalnızca
    // zırhlıya karşı verimli, yaya yığınına karşı mermi israfı.
    AGIR_VURUS_ESIGI: 0.3,

    // Bir aktörün tek turda kaç kez sipariş denemesi yapacağı. Sanayi hakkı tek siparişe
    // sığmayabiliyor (bütçe kısmi doldurur), o yüzden döngü var; sayı bir GÜVENLİK SINIRI,
    // denge düğmesi değil — hak ya da para bitince döngü zaten kendi kendine duruyor.
    URETIM_DENEMESI: 4,

    // TOPARLANMA EŞİĞİ: ordunun kadrosunun bu kadarı eksikse toparlanma emri verilir.
    // Çok düşük olsaydı zekâ her tur bir birlik için para harcar, çok yüksek olsaydı
    // yıpranmış orduyla dolaşırdı. 0.25 = "dörtte biri gitmişse topla".
    TOPARLANMA_ESIGI: 0.25,

    // Bir hamlenin PUANI bu eşiğin altındaysa emir verilmez. 0 değil küçük bir pozitif
    // sayı: sıfır olsaydı aktör kıl payı kârlı her hamleyi oynar ve ordusunu bedavaya
    // dağıtırdı. Emir vermemek geçerli bir karardır (görev belgesi §5/10).
    EN_AZ_PUAN: 0.5,

    // ---- UMUTSUZ SALDIRI KAPISI (Görev 12 / Baki'nin çıkmaz şikâyeti, 2026-08-06) ----
    //
    // > *"Bazı illerin — mesela İzmir'in Balıkesir, Çanakkale sınırında — o 3 parça
    // > birbirine değiyor ve aynı yere 10-20 asker yığmaya başlıyorlar, her biri her tur
    // > aynı yere basıyor, diğerlerini ignoreluyor. Çok sinir bozucu ve oyunu uzatıyor."*
    //
    // KÖK SEBEP: üstünlük fayda formülünde bir ÇARPAN'dı, bir KAPI değil. Değerli bir
    // hedefte (İzmir gibi) `DEGER × açgözlülük × değer × üstünlük` terimi, üstünlük 0.3
    // olsa bile EN_AZ_PUAN'ı aşabiliyordu. Aktör her tur kaybedeceği saldırıyı tekrar
    // ediyor, ordusunu eritiyor, yerine yenisini basıyor — ve cephe hiç çözülmüyordu.
    //
    // ÇÖZÜM: kaybedeceği belli olan saldırı ADAY OLMAKTAN ÇIKIYOR. Aktör o zaman ya başka
    // hedefe bakıyor (şikâyetin "diğerlerini ignoreluyor" kısmı) ya da kuvvet biriktirip
    // üstünlüğü eşiğin üstüne çıkınca vuruyor. Ritim değişiyor: sürekli öğütme yerine
    // birikme + hamle.
    //
    // KİŞİLİĞE BAĞLI (Baki: *"bu çekimser karakterli illerde olsun ama kesinlikle
    // azalsın"*): eşik temkinle büyüyor. Çekimser il büyük bir üstünlük görmeden
    // saldırmıyor — yığılıp bekliyor, yani çıkmaz onun KARAKTERİ oluyor. Saldırgan il
    // daha ince farkla da vuruyor ama artık kaybedeceği saldırıyı yapmıyor.
    //
    //   eşik = TABAN + TEMKIN_PAYI × temkin      (0.50 – 0.72 bandı)
    //
    // Ölçü `muharebeTahmini().ustunluk`: 0.50 = başa baş, 1.00 = karşıda kimse kalmadı.
    // 0.50 tabanı "kaybedeceğim saldırıyı yapmam" demek — daha aşağısı zaten yenilgi.
    // KAPALIYKEN (`ACIK: false`) Görev 11 davranışına dönülür.
    // ---- CESARET (2026-08-12, Baki) ----
    //
    // > *"Yapay zekâların cesareti de biraz artsın ama aptallığa çok kaymasın; oyunu daha
    // > hızlı bitirmeye yöneltecek veya ellerinde güç varken acımayacak yapılar ekleyelim."*
    //
    // ⚠ CESARETİ KÖRLEMESİNE ARTIRMAK APTALLIKTIR VE BUNUN ÖLÇÜSÜ VAR: umutsuz kapısının
    // elediği saldırıların **%96'sı gerçekten kaybediyor** (`veri/URETIM-NOTU.md`).
    // Yani `UMUTSUZ_SALDIRI.TABAN`'ı düşürmek, orduları bile bile eritmek demek. Cesaret
    // buradaki üç kapıdan artıyor ve üçü de ölçülebilir bir gerekçeye dayanıyor.
    CESARET: {
      ACIK: true,

      // 1) KAZANANI SOR. Tahmin "bu saldırıyı kazanıyorsun" diyorsa hamle umutsuz
      // sayılmaz — üstünlüğü eşiğin altında olsa bile. Bozguna uğrayan savunan
      // birlikleriyle çekildiği için parçayı ALDIĞIN hâlde üstünlük düşük çıkabiliyor.
      // Ölçüm: kapı her tur **~35 kazanılabilir saldırıyı** reddediyordu (elenenlerin
      // %3.7–4.2'si). Bu, cesareti aptallığa kaymadan artırmanın tek dürüst yolu.
      KAZANANI_SOR: true,

      // 2) EZİCİ ÜSTÜNLÜKTE ACIMA. Üstünlük `MUHAREBE.USTUNLUK_ESIGI`'ni (0.75 — savaş
      // odasında oyuncuya "ÜSTÜN" yazan sayının aynısı) geçen hamleye eklenen dürtü.
      // Ölçüm adayların %15–28'inin ezici olduğunu gösterdi; kaynak başına tek emir
      // kuralı yüzünden bunlar bazen sıradan bir takviyeye yeniliyordu.
      // 0.8, `TERIM.SALDIRI` (0.60) ile aynı büyüklük sınıfında: sıralamayı çevirmeye
      // yetiyor, hesabı ezmiyor. Bitirme iştahıyla çarpılıyor — maç ilerledikçe artıyor.
      EZICI_DURTU: 0.8,

      // 3) EŞİK MAÇ İLERLEDİKÇE DÜŞÜYOR. Bitirme iştahı doyduğunda umutsuz eşiği bu
      // oranda iner (0.3 → eşik %30 düşer). "Oyunu daha hızlı bitirmeye yöneltecek yapı"
      // isteğinin karşılığı: geç oyunda beklemenin bedeli arttığı için aktör daha kötü
      // ihtimalleri de göze alıyor. Erken oyunda etkisi YOK (iştah 0), yani açılıştaki
      // temkin bozulmuyor.
      ESIK_SONUMU: 0.3,
    },

    UMUTSUZ_SALDIRI: {
      ACIK: true,
      TABAN: 0.5,
      TEMKIN_PAYI: 0.22,
    },

    // ---- BİTİRME İŞTAHI (2026-08-08, Baki) ----
    //
    // > *"Fetih ve %50 hâkimiyet için üst tur sınırları koyma, ama oyunun yapay zekâları
    // > da oyunu bitirme isteğiyle oynasın, o şekilde ayarlayabiliriz."*
    //
    // TUR SINIRINI KALDIRMANIN BEDELİ BUYDU. Sınır varken kilitlenen bir dünya yine de
    // bir sonuçla bitiyordu ("süre doldu, toprağa bak"). Sınır kalkınca o emniyet kemeri
    // de kalkıyor: dünya donarsa maç sonsuza kadar sürer. Ölçüm bunun gerçek bir risk
    // olduğunu zaten söylemişti (`veri/mod-esik-olcum.md`): zor kademede 125. turdan sonra
    // TEK BÖLGE EL DEĞİŞTİRMİYOR.
    //
    // ⚠ KİLİDİN SEBEBİ "YZ APTAL" DEĞİL, TAM TERSİ. Aktörler üstün olmadıkları saldırıyı
    // yapmıyor (doğru karar), herkes birbirine denk hâle geliyor ve kimse kıpırdamıyor.
    // Yani düzeltilecek şey zekânın AKLI değil, RİSK İŞTAHI.
    //
    // İŞTAH TURLA BÜYÜR:  iştah = min(1, tur / DOYMA_TURU)
    // Erken oyun bugünkü gibi temkinli, geç oyun gitgide bitirici. Oyuncunun hissedeceği
    // şey: ilk 20 tur sakin kurulum, sonrasında dünyanın üstüne gelmesi.
    //
    // ⚠ UMUTSUZ SALDIRI KAPISINA BİLEREK DOKUNULMUYOR. Kilidi o kapıyı gevşeterek açmak
    // teknik olarak mümkün ama Baki'nin çıkmaz şikâyetini (§UMUTSUZ_SALDIRI) geri getirir:
    // aktörler yine kaybedecekleri saldırıya koşar, ordular et değirmenine girer, cephe
    // yine çözülmez — üstelik bu sefer tur sınırı da yok. İştah "daha çok kuvvetle daha
    // çok yere saldır" diyor, "kaybedeceğin saldırıyı yap" demiyor.
    BITIRME: {
      ACIK: true,

      // İştahın tavana vurduğu tur. 60 seçildi çünkü ölçümde dünya ~%50–69'a bu bandın
      // sonunda ulaşıp donuyor; iştah tam orada devreye girmiş oluyor.
      DOYMA_TURU: 60,

      // Saldırı terimi doyma turunda kaç katına çıkar. `TERIM.SALDIRI` 0.60 → 1.20.
      SALDIRI_CARPANI: 2,

      // "Açıkta kalma" cezasının doyma turunda ne kadarı sönümlenir. Kilidin ASIL ANAHTARI
      // bu: aktör kuvvetini gönderirken arkasının açık kalmasından korkuyor ve korktukça
      // az kuvvet gönderiyor, az kuvvetle de üstünlük eşiğini aşamıyor. Ceza sönünce daha
      // büyük yığınlar yola çıkıyor, üstünlük gerçekten kuruluyor ve cephe çözülüyor.
      // 0.6 = geç oyunda ceza %40'ına iniyor; sıfırlanmıyor, çünkü sıfırlanırsa aktörler
      // başkentlerini bomboş bırakır ve oyuncu bedava fetih yapar.
      TEMKIN_SONUMU: 0.6,

      // Savaş ilanının "temel iştah" terimi (ILAN.FAYDA.GENISLEME) doyma turunda kaç
      // katına çıkar. Barış içinde donmuş bir haritayı çözen şey bu: kimse savaşmıyorsa
      // kimse büyüyemez, kimse büyümezse fırsat hiç doğmaz.
      ILAN_CARPANI: 2,
    },

    // ---- HAMLE UZAYI (Soru 2 → Baki'nin cevabı A, 2026-07-31) ----
    // Kaynak parçadaki kuvvetin hangi oranları aday olarak denenir. "Hiçbiri" listede yok,
    // çünkü o zaten "emir verme" durumu — ayrı bir aday değil, adayların hepsinin
    // EN_AZ_PUAN'ın altında kalması.
    //
    // Tam arama (§9.3 dışlıyor) yerine üç aday: parça başına ~3 × komşu sayısı hamle.
    // Sağlamlar önce gider — ayrı bir seçim mantığı yazılmadı, `orduBol` zaten öyle
    // bölüyor (Görev 06).
    KUVVET_ADAYLARI: [1, 0.5],

    // ---- TUR RAPORU (Soru 5 → Baki'nin cevabı A) ----
    // Uzaktaki olaylar için en fazla kaç manşet satırı yazılır. BAŞTAN konuyor, sonradan
    // kısaltılmaya çalışılmıyor: 80 aktör her tur bir şeyler yapacak (görev belgesi §9/8).
    MANSET_SINIRI: 5,

    // ---- TAKVİYE: İÇ BÖLGEDEN CEPHEYE (Görev 08 / Soru 4 → Baki'nin cevabı A) ----
    //
    // Görev 07'nin bilinen sınırı (§11/1): zekâ kuvvetini yalnızca ÜRETİMLE cephede
    // topluyor, iç bölgede kalmış ordusunu yürütmüyor. Aktör genişledikçe kuvvetinin
    // gitgide büyüyen kısmı ölü yatırıma dönüşüyor; üretim bunu düzeltemez, üstüne
    // para harcar.
    //
    // KURAL TEK YÖNLÜ: yalnızca DÜŞMAN KOMŞUSU OLMAYAN parça takviye gönderebilir ve
    // yalnızca cepheye DAHA YAKIN dost parçaya. İki sonucu var:
    //   • Salınım (ileri-geri gidip gelme) TANIM GEREĞİ imkânsız — kuvvet yalnızca
    //     cepheye doğru akar. Görev belgesi §10/10'un uyardığı tuzak buradan kapanıyor.
    //   • Cephedeki ordu takviye göndermez, yani kimse savunmasını boşaltmaz.
    //
    // "Cepheye yakınlık" YENİ BİR ÖLÇÜ DEĞİL: komşuluk grafiğinde düşman parçaya olan
    // uzaklık. Graf zaten var (`veri/parca-komsuluk.json`), tek geçişte hesaplanıyor.
    TAKVIYE: {
      // Adım 1 ölçümü "takviye açık / kapalı" karşılaştırması istiyor (görev belgesi
      // §Adım 1/c); anahtar olmadan o ölçüm yapılamaz. Cihazda hamle uzayı şişerse
      // tek satırla Görev 07 davranışına dönülür.
      ACIK: true,

      // Bu kadar birimden az kuvvet taşınmaz. Tek birimlik ordu yürütmek hem parçanın
      // hamle hakkını yakar hem haritayı anlamsız emirle doldurur — üstelik oyuncu
      // haritada "ne yapıyor bu adam" diye bakar, ki bu görevin amacı tam tersi.
      EN_AZ_KUVVET: 2,

      // Takviye puanı bu eşiğin altındaysa emir verilmez. ZEKA.EN_AZ_PUAN ile aynı
      // gerekçe ama AYRI TUTULUYOR: takviye puanı saldırı puanıyla aynı ölçekte
      // olmayabilir ve ikisi aynı sıralamada yarışacak. Ölçek hizası Adım 8'de
      // ölçülecek; ayrı sayı olmasa hizalamak için saldırı eşiğine dokunmak gerekirdi.
      EN_AZ_PUAN: 0.5,

      // Hedef parçadaki TEHDİT AÇIĞI = düşman komşulardaki kuvvet ÷ (oradaki kuvvet + 1),
      // yani ZEKA'nın "açıkta kalma cezası"nın tersten okunuşu (görev belgesi §3: yeni
      // tehdit ölçüsü yazılmayacak). Bu, o cezanın ACIKTA_TAVAN'ı ile aynı sebeple
      // kırpılıyor: 20 kat üstün tehditle 200 kat üstün olan arasındaki fark kararı
      // değiştirmiyor, ikisi de "oraya kuvvet lazım" der.
      TEHDIT_TAVANI: 6,

      // Fayda formülünün iki terimi:
      //   puan = TEHDIT   × hedefteki tehdit açığı × gönderilen kuvvet
      //        + YAKINLIK × (kaynağın cephe uzaklığı − hedefin cephe uzaklığı)
      //
      // YAKINLIK terimi olmasaydı iki eşit tehditli komşu arasında seçim rastgele
      // kalırdı; kuvvetin cepheye DOĞRU akması bu terimden geliyor. Tek adımda uzaklık
      // en fazla 1 azaldığı için terim fiilen "doğru yöne gidiyorsan sabit prim".
      TERIM: { TEHDIT: 1.0, YAKINLIK: 1.5 },

      // Takviyede kuvvet BÖLÜNMEZ, tümü gider. Gerekçesi kuralın kendisi: gönderen
      // parçanın düşman komşusu yok, yani savunacak cephesi de yok. Yan faydası ölçülebilir
      // — saldırı adayları KUVVET_ADAYLARI ile parça başına 2 × komşu üretiyor; takviye
      // tek aday üretince toplam ~4× değil ~3× komşu oluyor (görev belgesi §Soru 4:
      // "aday sayısı yaklaşık iki katına çıkar" beklentisinin altı).
      KUVVET_ADAYLARI: [1],
    },
  },

  // ---- SAHNE — HİSSİYAT KATMANI (Görev 08 / Adım 0) ----
  //
  // MOTOR KARAR VERİR, SAHNE OYNATIR (görev belgesi §4.2). TURU BİTİR'e basılınca motor
  // her şeyi bugünkü gibi çözer, ortaya sıralı bir OLAY LİSTESİ çıkar, sahne o listeyi
  // oynatır. Animasyon başladığında oyunun durumu ÇOKTAN KESİNLEŞMİŞTİR.
  //
  // Buradaki hiçbir sayı oyunun sonucuna dokunmaz — süreleri değiştirmek muharebeyi
  // değiştirmez, gösterimi kapatmak kaydı değiştirmez. Bu, görev belgesi §10/7'nin
  // "en tehlikeli hata" dediği şeye karşı konan sınır.
  SAHNE: {
    // ---- TEK DÜĞME: KAPSAM (2026-08-01, Baki'nin Soru 3 cevabı) ----
    //
    // Görev belgesi §5/Soru 3 üç HIZ kademesi öneriyordu (kapalı / hızlı / tam).
    // Baki bunu değiştirdi:
    //
    // > *"Bizi ilgilendiren savaşların üzerinde durabilirsek güzel olur, ayrıca bizi
    // > ilgilendiren savaşların animasyonunu izleyebilelim... bu istediklerimi en kısa
    // > olacak şekilde uygulamak için yaklaşımlar bul."*
    //
    // TEMPO TUZAĞININ (§4.4) ÇÖZÜMÜ SÜREYİ KISALTMAK DEĞİL, KAPSAMI DARALTMAK OLDU.
    // Sebep: 50 turluk oyunu işkenceye çeviren şey bir savaşın 5 saniye sürmesi değil,
    // 80 aktörün savaşını izlemek. Senin savaşların turda 1–3 tane; onlar TAM ayrıntıyla
    // oynasa bile tur birkaç saniye. Böylece iki ayar yerine bir ayar kalıyor ve
    // "izlemek istediğim savaş atlandı" durumu hiç doğmuyor.
    //
    //   'kapali' → hiç oynatım (Görev 07 davranışı; tur anında biter)
    //   'cephem' → yalnızca SENİN taraf olduğun savaşlar oynar, uzaktakiler manşet
    //   'hepsi'  → görüş alanındaki yapay zekâ savaşları da oynar
    //
    // 'hepsi' bile §4.4/3'ün kuralını bozmuyor: uzaktaki savaşlar yine manşet: sahneye
    // giren, yalnızca kameranın gördüğü savaşlar.
    KAPSAM_SIRASI: ['kapali', 'cephem', 'hepsi'],
    VARSAYILAN_KAPSAM: 'cephem',

    // Bütün süreleri birden ölçekleyen tek sayı. Hız KULLANICI AYARI DEĞİL (yukarıdaki
    // karar); cihazda "uzun geliyor / kısa geliyor" denirse burası değişir, tek satır.
    // 0.6 ≈ eski "hızlı" kademesi, 1 = tam gösterim.
    HIZ_CARPANI: 1,

    // ---- SÜRELER CİHAZ DENEMESİNDEN SONRA UZATILDI (2026-08-01, Baki) ----
    //
    // > *"Savaşlar fazla hızlı gerçekleşiyor, bunu biraz daha uzatmaktan zarar gelmez.
    // > Bir şey anlamıyorum, telefon titriyor falan, sonra bir bakıyorum sonuç ekranı
    // > geliyor direkt."*
    //
    // Teşhis iki parçalıydı: (a) tek bir raunt 260 ms sürüyordu — gözün rozete gidip
    // sayıyı okuması bile bu kadar sürmüyor; (b) son olaydan sonra tur raporu ANINDA
    // açılıyordu, yani gösterinin bittiği an ile perdenin kapandığı an aynıydı.
    //
    // (a) için süreler yaklaşık iki katına çıkarıldı, (b) için `SON_BEKLEME` eklendi.
    //
    // Olay başına süre (ms). Tipik bir fetih turu: turAcilisi 900 + kamera 450 +
    // yurus 550 + savaş 550 + 3 raunt × 650 + fetih 750 ≈ 5.2 sn. Kart gelirse üstüne
    // binen süre ilin değerine göre (bkz. OLCEK_GUCU).
    SURE: {
      turAcilisi: 900, // "TUR 7" + tek satır dünya durumu
      kamera: 450, // cephedeki en önemli olaya kayma (tur başına bir kez)
      yurus: 550, // emir okunun hedefe ulaşması
      savas: 550, // birlik şeridinin açılması — okunacak vakit bırakıyor
      vurus: 650, // bir muharebe raundu. EN ÖNEMLİ SAYI: gözün rozete gidip düşen
      // birliği ve uçuşan kaybı okuması bu sürede oluyor. Kısaltılırsa savaş
      // yine "bir anda olup biten bir şey"e döner.
      bozgun: 750, // ordu dağıldı
      cekilme: 500, // çekilme oku hedefe gider
      imha: 700, // ordu tamamen yok oldu, rozet dağılır
      fetih: 750, // parça el değiştirdi, renk döner
      ilKarti: 1900, // il tamamlandı kartı (OLCEK_GUCU ile çarpılır)
      ilKaybiKarti: 2100, // il kaybedildi kartı — kayıp, fetihten uzun durur
      // BÖLGE kartları (2026-09-24 · Baki: "parça kazanıldı yazmalı"): il kartından KISA —
      // il bir anıt, bölge bir haber. Oyuncunun kendi aldığı / kaybettiği her bölgede.
      bolgeKarti: 1100,
      bolgeKaybiKarti: 1300,
      duelloKarti: 2200, // kutsal savaş başladı
      takviye: 320, // dost parçaya kuvvet aktı (kısa, çünkü çok olacak)
    },

    // Son olaydan sonra tur raporu açılmadan önceki nefes payı (ms).
    // Baki'nin *"bir bakıyorum sonuç ekranı geliyor direkt"* şikâyetinin doğrudan cevabı:
    // son fetih ekranda otururken rapor perdesi üstüne biniyordu. Gösterinin bittiğini
    // görmeden gösterinin sonucunu okumak, gösteriyi hiç izlememekle aynı şey.
    SON_BEKLEME: 700,

    // `hepsi` kapsamında bir turda en fazla kaç UZAK savaş oynatılır.
    //
    // SENİN SAVAŞLARIN BU SINIRA HİÇ TAKILMAZ — hepsi her zaman oynar. Sınır yalnızca
    // 80 aktörün savaşları için: bir tur 20 savaş üretebiliyor ve hepsini oynatmak
    // §4.4'ün "oyunu bozar" dediği yer.
    //
    // 6 → 3 İNDİRİLDİ (2026-08-01), süreler uzatılınca: uzak savaş başına ~1.9 sn,
    // altı tanesi tek başına 11 saniye ediyordu. `hepsi` zaten "dünyayı izlemek isteyen"
    // için; dünyanın canlı görünmesine üç savaş yetiyor.
    EN_COK_SAVAS: 3,

    // ---- "ÖNEMLİ SAVAŞ" ÖLÇÜTÜ (görev belgesi §6/3) ----
    //
    // Baki'nin Soru 1 cevabındaki endişe: *"önemli savaşların neye göre seçileceğine
    // düzgün karar vermek lazım."* Kapsam ayarı bu endişenin BÜYÜK KISMINI zaten
    // kapatıyor: 'cephem'de senin HER savaşın oynar. Bu eşik neyin OYNAYACAĞINA değil,
    // neyin AYRINTILI oynayacağına karar veriyor:
    //
    //   eşiğin altı → haritada oynar (ok, sarsıntı, uçuşan sayı, renk darbesi)
    //   eşiğin üstü → üstüne rozetin yanında BİRLİK ŞERİDİ açılır (raunt raunt düşenler)
    //
    // Yani hiçbir savaş sessizce atlanmıyor; yalnızca ayrıntı kademesi değişiyor.
    //
    // 6 = İKİ TARAFIN TOPLAM BİRİM SAYISI. Ölçü buradan geliyor: §4.5'in karışım tablosunda
    // dengeli bir ilin garnizonu 5 birim. 6, "taraflardan biri kadrolu ordu getirmiş"
    // demek. 1v1 baskınlar (toplam 2) şerit açmaz — açsaydı şerit sıradanlaşırdı.
    ONEMLI_ESIGI: 6,

    // ---- İLKİ TAM, TEKRARI KISA (§4.4/4) ----
    // Aynı türden olayın TEKRAR_ESIGI'ncisinden sonrası bu oranda kısalır. Onuncu
    // vuruş birincisi kadar uzun sürmemeli; yoksa uzun bir muharebe tek başına turu yer.
    //
    // 2026-08-01'de ikisi de GEVŞETİLDİ (3 → 4 ve 0.55 → 0.70). Sebep Baki'nin şikâyetiyle
    // aynı: kısaltma çok erken ve çok sert başlıyordu, dört raunt süren sıradan bir
    // muharebede bile son raundlar okunamayacak kadar hızlanıyordu. Kural duruyor —
    // uzun muharebeyi hâlâ dizginliyor — ama sıradan muharebeye artık dokunmuyor.
    TEKRAR_ESIGI: 4,
    TEKRAR_KISALTMA: 0.7,

    // Aynı anda en fazla kaç efekt oynar. Görev belgesi §Adım 1'in karar eşiği: hedef
    // 60 fps, en kötü durumda 30 fps altına düşülmeyecek; aşılıyorsa efektler eşzamanlı
    // değil SIRALI oynatılır. Bu sayı o sınırın düğmesi — Adım 1 ölçümünden sonra
    // kesinleşecek, şimdilik tedbirli bir başlangıç.
    EN_COK_ESZAMANLI: 4,

    // Rozet sarsıntısı: kaç piksel, ne kadar, kaç kez. Rozetin YERİ değişmiyor, üstündeki
    // dönüşüm oynuyor — sabit rozet yerleşimi (Görev 05'in beşinci turu) bu görevin
    // kırmızı çizgisi. 3 piksel bilerek küçük: rozet çapı 26 ve efekt rozetin DIŞINA
    // taşarsa donanım dokusu görünüm sınırında keser (§10/3).
    SARSINTI: { PIKSEL: 3, SURE: 220, TEKRAR: 2 },

    // ---- ÖLÇEK DUYGUSU (§4.1/6, §Adım 6) ----
    // "Iğdır'ı almak İstanbul'u almakla aynı hissettiriyor." Fetih kartının süresi ve
    // büyüklüğü ilin değerine göre değişir:
    //
    //   çarpan = 1 + OLCEK_GUCU × (2 × oran − 1)      oran = ilin değerinin 0–1 arası yeri
    //
    //   0    → bütün iller aynı (ölçek duygusu yok)
    //   0.4  → en değerli il 1.4×, en değersiz 0.6× — İstanbul kartı Iğdır'ınkinin iki
    //          katından uzun durur
    //
    // Görev belgesi §Adım 6 tam olarak bunu şart koşuyor: fark TEK KATSAYIYLA
    // ayarlanabilir olacak ki cihazda "İstanbul yeterince büyük hissettirmiyor" denirse
    // tek satır değişsin.
    OLCEK_GUCU: 0.4,

    // ---- KAMERA ----
    // Baki'nin Soru 1 cevabındaki asıl uyarı buydu: *"haritaya yakınlaşma hususunda
    // buglar vs. oluşmaması lazım."* Üç koruma:
    //   1. ACIK tek satırla kapanır — kamera hiç oynamaz, gerisi çalışmaya devam eder
    //   2. EN_COK: tur başına kaç kez kayacağı (§6/4: bir kez; her olay için ayrı ayrı
    //      kaydırmak baş döndürür)
    //   3. YAKINLIK, haritanın gerçek yakınlaştırma aralığının (0.9× – 7×) içinde ve
    //      ROZET.YAKIN_SINIR'ın (2.7) hemen üstünde: kamera durduğunda PARÇA BAŞINA rozet
    //      görünür, yani sahne her zaman rozetlerin göründüğü kademede oynar.
    //      Sınırın DİBİNE değil ÜSTÜNE konuyor — KATMAN_HISTEREZIS payı sayesinde
    //      kamera dururken katman gidip gelmesin.
    KAMERA: { ACIK: true, YAKINLIK: 2.8, EN_COK: 1 },
  },

  // ---- REKABET OLAYLARI / KUTSAL SAVAŞLAR (Görev 08 / Soru 5 → Baki: B + kısıt) ----
  //
  // Tasarım §11. Baki'nin cevabı B'ydi (sunum + moral + ganimet) ama üstüne A'nın
  // birinci maddesini de istedi:
  //
  // > *"Kutsal savaşların en önemli işlevi 2 ilin bir düelloya çıkması, yani A'da dediğin
  // > üçüncü devlet düelloya karışamaz; onun dışında B iyi."*
  //
  // Hasım çiftleri KODDA DEĞİL, `veri/husumetler.js`'te. Kod hiçbir rekabet uydurmaz;
  // yeni bir kutsal savaş eklemek tek satırlık veri değişikliğidir (§11).
  REKABET: {
    // Kapatınca düello hiç tetiklenmez, husumet tablosu okunmaz. Adım 7'nin ölçümü
    // "rekabet açık / kapalı" karşılaştırması yapacak.
    ACIK: true,

    // Düello en fazla kaç tur sürer (§6/6: taraflardan biri ötekinin TÜM illerini
    // kaybedince ya da bu süre dolunca biter).
    //
    // 10 → 5 (Görev 09 / Adım 0, Baki 2026-08-01): *"düello maksimum 5 tur koruma
    // sağlamalı, saldırı ve savunma avantajları da maksimum 5 tur olmalı."*
    //
    // ÜÇÜ DE TEK SAYIYA BAĞLI ve öyle kalıyor: koruma (üçüncü taraf kısıtı), moral bonusu
    // ve ganimet bonusu düellonun ÖMRÜ boyunca geçerli. Baki ikisini ayrı ayrı saydı ama
    // ikisi için de 5 dedi; üç ayrı düğme yazmak, hepsi aynı değerdeyken ayrışma riski
    // üretmekten başka bir şey yapmazdı. Ayrılmaları gerekirse bölmek tek satır.
    //
    // 10'un eski gerekçesi (ölçüm koşusu 15 tur, düello hem başlayıp hem bitebilsin)
    // 5'te de sağlanıyor — daha da rahat.
    DUELLO_SURESI: 5,

    // Düello tarafına verilen moral bonusu — SAYI DEĞİL, KALEM SAYISI (§6/7).
    // §3.8'in mevcut bonus listesine ("yüksek moral statı · dağlık savunma · kendi
    // toprağı") bir kalem daha ekleniyor; her kalem bozgun eşiğini MUHAREBE.MORAL.
    // BONUS_PAYI kadar yukarı taşıyor. YENİ FORMÜL YOK.
    //
    // ⚠ BONUS_PAYI notu "bonuslar üst üste binebiliyor (en çok 2)" diyor; bu kalem
    // üçüncüyü mümkün kılıyor. Etkisi Adım 7'de ölçülecek — §3.7'nin 15 satırı
    // etkilenmez (o tablo düellosuz çalışıyor) ama oyun içi bozgun eşiği kayabilir.
    MORAL_BONUSU: 1,

    // Düelloyu kazanan tarafın fetih ganimeti bu ORANDA artar (§11 "kazanana ek ödül").
    // 0.5 = yarı yarıya fazla. FETIH.NUFUS_ORANI'nın üstüne biner, onu değiştirmez.
    GANIMET_BONUSU: 0.5,

    // ---- ÜÇÜNCÜ TARAF KISITI ----
    // "Üçüncü devlet düelloya karışamaz" tasarımda TEK CÜMLE, kodda üç ayrı kural
    // olabiliyor. Üçü de yazıldı çünkü aralarındaki fark oyunu ciddi biçimde değiştirir;
    // seçim Adım 7'nin başında Baki'ye sorulacak, değiştirmek tek kelime:
    //
    //   'kapali'    → kısıt yok (saf B seçeneği)
    //   'cephe'     → üçüncü aktör, düellonun İKİ TARAFININ BİRBİRİYLE SINIRDAŞ olduğu
    //                 parçalara saldıramaz. "Kavganın arasına giremezsin" — korunan yer
    //                 yalnızca düellonun fiilen sürdüğü hat.
    //   'topraklar' → üçüncü aktör, iki ilin ASIL topraklarına hiç saldıramaz.
    //
    // 'cephe' → 'topraklar' (Görev 09 / Adım 0, Baki 2026-08-01): *"üçüncü bir aktör
    // düelloya hiçbir şekilde karışamayacak."*
    //
    // Görev 08 raporu bu seçeneği tematik olarak daha güçlü bulmuş ama SÖMÜRÜLEBİLİR
    // diye geri çevirmişti: *"oyuncu hasmına bilerek saldırıp sınırını 10 tur dokunulmaz
    // yapabilir."* Baki aynı cevapta sömürüyü kapatan iki kısıtı da verdi:
    //
    //   1. DUELLO_SURESI 10 → 5 — dokunulmazlık yarı yarıya kısaldı.
    //   2. GIRIS_SARTI 'baskaSavasYok' — sömürüyü yapacak oyuncu tanım gereği saldırgandır,
    //      yani başkalarıyla da savaş halindedir ve düellosu hiç başlamaz.
    //
    // Yani seçenek değişmedi, ETRAFINDAKİ KURALLAR değişti. Görev 08'in korktuğu davranış
    // artık kuralın kendisiyle engelleniyor, seçenekten kaçarak değil.
    UCUNCU_TARAF: 'topraklar',

    // Aynı anda en fazla kaç düello etkin olabilir. İki işi birden yapıyor:
    //   1. KAYIT BOYUTU KAPAĞI. Düello kaydı `durum.duellolar`a giriyor (§7) ve kayıt
    //      15 turda 25.2 KB, sınır 26 — yani 0.8 KB pay var. Kayıt başına ~30 byte,
    //      8 düello ≈ 0.25 KB: sınırın altında ve bu kapak sayesinde GARANTİ altında.
    //   2. Ekranın "her yer kutsal savaş" hissine boğulmaması.
    // Kapak doluyken yeni düello başlamaz; oyuncunun taraf olduğu düello önceliklidir.
    EN_COK_ETKIN: 8,

    // ---- DÜELLOYA GİRİŞ ŞARTI (Görev 09 / Adım 0, Baki 2026-08-01) ----
    //
    // Baki: *"düelloyu başlatmanın şartları olmalı, öncelikle başka illerle savaşta
    // olmamalı düellonun her iki tarafı da."*
    //
    // Bu şart `topraklar` kısıtının sömürüsünü kapatıyor — Görev 08'in raporu tam olarak
    // o sömürüden korkup `cephe`de kalmıştı: *"oyuncu hasmına bilerek saldırıp sınırını
    // 10 tur dokunulmaz yapabilir."* Artık yapamıyor, çünkü saldırgan bir oyuncu tanım
    // gereği başkalarıyla da savaş halindedir ve düellosu hiç başlamaz. Dokunulmazlık
    // yalnızca gerçekten İKİ TARAFLI, başka cephesi olmayan bir kavgaya veriliyor.
    //
    //   'yok'            → şart yok (Görev 08 davranışı; sömürüye açık)
    //   'saldiranTemiz'  → yalnızca SALDIRANIN başka savaşı olmamalı
    //   'baskaSavasYok'  → İKİ TARAF da temiz olmalı (Baki'nin ilk tarifi)
    //
    // Savaş hali diplomasiden geliyor (DIPLOMASI bloğu); yani bu şart Görev 09'dan önce
    // yazılamazdı — Görev 08'in borcunu kapatan şey, Görev 09'un yeni sistemi.
    //
    // ⚠ BEDELİ ÖLÇÜLDÜ (Adım 1) — 30 turluk üç koşuda BAŞLAYAN DÜELLO SAYISI:
    //
    //   | kademe | 'yok' | 'saldiranTemiz' | 'baskaSavasYok' |
    //   |--------|-------|-----------------|-----------------|
    //   | kolay  |   4   |        4        |        1        |
    //   | orta   |  11   |        7        |        5        |
    //   | zor    |  23   |       11        |        4        |
    //
    // Sıkı şart ZOR KADEMEDE §11'in tamamını fiilen susturuyor (23 → 4): orada kimse
    // "başka savaşı olmayan" duruma hiç girmiyor. `saldiranTemiz` orta yol ve sömürüyü
    // yine kapatıyor — sömürüyü yapan taraf SALDIRANDIR, şart tam onu hedefliyor ve
    // savunanı cezalandırmıyor (savunanın başka cephesi olması onun tercihi değil).
    //
    // ÖLÇÜM SUNULDU, BAKİ 'baskaSavasYok'TA KALDI (2026-08-01). Önce şartın ne yaptığını
    // sordu — cevabı önemli, çünkü kural sanıldığından daha yumuşak:
    //
    //   Şart HİÇBİR ŞEYİ GERİ ALMIYOR ve hiçbir barış dayatmıyor. Saldırı normal şekilde
    //   olur, toprak el değiştirir, ganimet alınır; yalnızca kart/bonus/koruma gelmez.
    //   Üstelik düello İPTAL DEĞİL, ERTELENİYOR: her yeni saldırıda kontrol tekrarlanıyor,
    //   öteki savaş bitince sıradaki saldırı düelloyu başlatıyor.
    //
    // Bilinen bedel: zor kademede dünya hiç sakinleşmediği için erteleme pratikte iptale
    // yakın duruyor. Kabul edildi — kutsal savaş NADİR ve HAK EDİLMİŞ olsun.
    GIRIS_SARTI: 'baskaSavasYok',
  },

  // ---- DİPLOMASİ (Görev 09 / tasarım §10) ----
  //
  // ┌─ BAKİ'NİN KARARLARI (2026-08-01) ───────────────────────────────────────────────────┐
  // │ Soru 1 → **A**: üç durum, savaş ilanı YOK. Tarafsız · İttifak · Savaş halinde.      │
  // │ Soru 2 → **A**: diplomasi yalnızca "tanıdıklarınla" — sınırdaşın, savaştığın ya da  │
  // │          belli bir büyüklüğü aşmış aktörler.                                        │
  // └─────────────────────────────────────────────────────────────────────────────────────┘
  //
  // SAVAŞ HALİNE İLANLA DEĞİL, SALDIRIYLA GİRİLİR (Soru 1/A'nın doğrudan sonucu).
  // "İlan yok" demek "savaş hali yok" demek değil: saldırının KENDİSİ ilandır. Böylece
  // bugünkü akış hiç bozulmuyor (oyuncu yine dokunup saldırıyor) ama savaşın bir başlangıcı,
  // bir sonu ve haritada bir görüntüsü oluyor.
  DIPLOMASI: {
    // Kapatınca hiçbir ilişki kurulmaz, teklif üretilmez, harita işareti çizilmez.
    // Adım 3'ün ölçümü "diplomasi açık / kapalı" karşılaştırması yapacak — İTTİFAK
    // DOYGUNLUĞU bu görevin oyunu bozabileceği tek yer (§10/6) ve tek ölçüsü bu düğme.
    ACIK: true,

    // Bir aktör tur başına en çok kaç teklif verebilir (oyuncu ve zekâ aynı sınır).
    //
    // 2 SEÇİLDİ: sınırsız teklif, her tur 10 aktöre ittifak önerip birini tutturmaya
    // yol açardı — diplomasi piyangoya döner (§4/Soru 2). 1 fazla dar: reddedilen tek
    // teklif turu boşa yakardı. 2, "bir asıl bir yedek" demek.
    TUR_BASINA_TEKLIF: 2,

    // Aynı anda en çok kaç ittifak (§6/3). Sınırsız olursa herkes herkesle anlaşır ve
    // savaş durur — §10'un kendi yazdığı tuzak.
    //
    // 3 → 2 (Adım 3 ölçümü). İlk sürümde "doygunluk çıkarsa ilk düşürülecek düğme bu"
    // yazıyordu; doygunluk çıktı ve düşürüldü. 2, oyuncunun bir dost + bir yedek tutmasına
    // yetiyor ama ittifakların zincirlenip haritayı tek bloğa çevirmesini zorlaştırıyor.
    EN_COK_ITTIFAK: 2,

    // İttifakı bozan (ya da müttefikine saldıran) taraf kaç tur diplomasi yapamaz (§5.3).
    // Tasarım §10 tek cümle veriyor: "aniden bozan taraf birkaç tur diplomasi yapamaz."
    // İtibar puanı / güven skoru gibi bir katman BİLEREK yok: §10'da geçmiyor ve oyuncuya
    // açıklanamayan görünmez bir sayı üretirdi.
    IHANET_SURESI: 5,

    // Savaş hali en çok kaç tur sürer, sonra kendiliğinden tarafsıza döner (§6/5).
    // Unutulmuş savaşların birikmesini engelliyor: iki aktör 15 tur birbirine hiç
    // dokunmadıysa aralarında savaş yoktur, kayıtta duran bir satır vardır.
    // Her saldırı sayacı sıfırlar, yani SÜREN savaş kendiliğinden bitmez.
    SAVAS_UST_SINIRI: 15,

    // §10/3 zinciri kaç adım yayılır. 1: müttefikime saldıran benimle de savaş haline
    // girer, AMA müttefikimin müttefikinin düşmanı benim düşmanım DEĞİLDİR (§5.2).
    // 2 yapılırsa ilk savaşta harita ikiye bölünür — bu sayı bir düğme değil, bir uyarı.
    ZINCIR_ADIMI: 1,

    // ---- SAVAŞ İLANI (Görev 11, Baki 2026-08-03) ----
    //
    // ┌─ BAKİ'NİN KARARI — Görev 09'un Soru 1/A'sı DEĞİŞTİ ─────────────────────────────┐
    // │ *"Öncelikle herkes ilk başta barış içinde olsun, daha sonra savaşlar açılsın;    │
    // │  yapay zekâlar hesap yapıp kime savaş açacaklarını düzgünce seçebilmeli."*       │
    // └──────────────────────────────────────────────────────────────────────────────────┘
    //
    // Eski kural "saldırının kendisi ilandır" idi; artık BARIŞTAKİNE SALDIRILAMAZ
    // (`hareket.js` kapıda kesiyor). Savaş, açıkça İLAN EDİLEREK başlar; ilan anında
    // ittifak zinciri de yayılır (§10/3 aynen işler). Husumet kuralları değişmedi:
    // düello yine İLK SALDIRIYLA tetiklenir — ilan savaşı açar, kutsal savaşı saldırı açar.
    ILAN: {
      // Kapatılırsa eski davranışa dönülür: saldırı ilandır, barış kapısı kalkar.
      ACIK: true,
      // ---- BARIŞ TURU KALDIRILDI: 2 → 0 (2026-08-08, Baki) ----
      //
      // > *"İlk 2 tur kimse savaş ilan edemez kısıtını kaldır, edebilsin herkes direkt."*
      //
      // Kural kodda DURUYOR, yalnızca sayısı sıfır: `savasIlanGecerliMi` hâlâ
      // `durum.tur <= BARIS_TURU` diye soruyor ve sıfırda hiçbir turda tutmuyor. Kuralı
      // silmek yerine sıfırlamak, geri getirmeyi tek satırlık iş bırakıyor.
      //
      // ⚠ "BARIŞ VARSAYILAN" KURALI ÖLMEDİ. Görev 11'in asıl kararı buydu ve duruyor:
      // barıştakine SALDIRILAMAZ, önce ilan edilir. Değişen tek şey, ilanın ilk turdan
      // itibaren mümkün olması — yani oyun "herkes barışta" başlıyor ama isteyen daha
      // birinci turda masayı deviriyor.
      BARIS_TURU: 0,
      // Zekâ tur başına en çok bir ilan verir; oyuncuya sınır yok (zaten saldırmak için
      // ilan etmek zorunda, ikinci bir kapı oyuncuyu sadece yorardı).
      TUR_BASINA: 1,
      // ---- İLAN FAYDASI (zekâ) — `zeka.js savasIlanPuani` ----
      // Kalıp hamle/ittifak puanlarıyla aynı: katsayı × kişilik ağırlığı × dünya ölçüsü.
      FAYDA: {
        // ---- ⚠ TEMEL İŞTAH — ÖLÇÜMLE EKLENDİ ----
        // İlk sürümde bu terim YOKTU ve dünya kilitlendi: 25 turda zor kademede en büyük
        // aktör 70 parçadan 17'ye düştü. Sebep, oyunun BAŞLANGIÇ KOŞULU — herkes 2–3
        // parçayla başlıyor, yani hiç kimse "zayıf komşu" değil (`zayifKomsuMu` büyüklük
        // karşılaştırması). Fırsat terimleri sıfır kalıyor, kimse savaş açmıyor, kimse
        // büyümüyor ve fırsat hiç doğmuyor.
        //
        // Bu terim o kısır döngüyü kırıyor: aç gözlü bir devlet, komşusu zayıf olmasa da
        // genişlemek ister. Açgözlülükle çarpıldığı için temkinli aktörler yine beklemeyi
        // seçiyor — sabit bir "herkes savaş açar" kuralı değil, bir KİŞİLİK farkı.
        // 1.8 ÖLÇÜMLE SEÇİLDİ (25 turluk koşu, zor kademe, üç tohum ortalaması):
        //   0    → en büyük aktör 17 parça (dünya kilitli)
        //   1.25 → 20.7
        //   1.8  → 22.0  ← seçilen
        //   2.4  → 23.7 ama canlı aktör 30 → 26; kazanç artık savaştan değil, herkesin
        //          herkese ilan etmesinden geliyor ve "barış önce" hissi kayboluyor.
        GENISLEME: 1.8,
        // Yiyebileceğim sınırdaş — fırsatın kendisi, temel iştahın ÜSTÜNE biniyor.
        ZAYIF_KOMSU: 1.4,
        // Hasmım (husumet tablosu) — Ordu–Giresun gibi büyük savaşlar YAŞANSIN diye
        // yüksek: hasımlar birbirine ilan etmeye yatkın olmalı (husumet ağırlığıyla çarpılır).
        HUSUMET: 1.8,
        // Güç üstünlüğüm (parça oranı, 2 katta doyar; 0–1 aralığına kırpılır).
        GUC_USTUNLUGU: 1.0,
        // Zaten savaştayım — yeni cephe açma (temkinle çarpılır, katsayı NEGATİF).
        CEPHE_YUKU: -1.6,
        // Bu puanın altında ilan yok. Eşik bilinçli olarak sıfırın üstünde: barış
        // varsayılan durum, savaş gerekçe ister.
        ESIK: 0.9,
      },
    },

    // ---- "TANIDIKLARIN" SÜZGECİ (Soru 2/A) ----
    // Liste doğal olarak 3–10 satırda kalsın diye. Süzgeç BAŞTAN konuyor, sonradan
    // kısaltılmaya çalışılmıyor (§10/9).
    TANIDIK: {
      SINIRDAS: true, // sınırdaş olduğun herkes
      SAVASTIGIM: true, // daha önce savaştığın / savaştığın herkes
      // ---- AYNI BÖLGE (Baki, 2026-08-06) ----
      // > *"Aynı bölgede (Marmara, Ege gibi) bulunanlar gözüksün; ben Ankara'yla
      // > Karadeniz'den bir parça bile alsam o bölgedekilerle diplomasi yapabileyim."*
      //
      // Ölçü SENİN AYAK BASTIĞIN BÖLGELER: elinde en az bir parçası olan her bölge senin
      // "ilgi alanın" sayılıyor ve o bölgede toprağı olan herkes masaya gelebiliyor.
      // Coğrafyayla diplomasiyi birbirine bağlayan kural bu — uzaktaki bir bölgeye tek
      // parçayla girmek, oranın devletleriyle konuşma hakkı kazandırıyor.
      BOLGE: true,
      // Bu kadar parçayı aşmış aktörler uzaktan da tanınır — "adı duyulmuş devlet".
      //
      // 10 → 4 (Adım 3 ölçümü). Yüksek eşik UZAK ittifakı fiilen imkânsız kılıyordu ve
      // sonucu şuydu: bütün adaylar komşu, bütün komşular `KOMSU` cezasını yiyor, eşik
      // biraz yükseltilince diplomasi tamamen ölüyordu (orta kademede %1). Oysa §10/2
      // "uzaktaki illerle ittifak kurulabilir" diyor ve oyunun sağlıklı ittifakı ZATEN
      // uzak olanı — cephe kapatmıyor, ortak düşmana karşı işe yarıyor.
      BUYUKLUK_ESIGI: 4,
      // ⚠ LİSTE UZUNLUĞU KAPAĞI — eşik düşünce liste 26 satıra çıktı ve bu, §10/9'un
      // ("diplomasi arayüzü şişebilir") tam olarak engellemek istediği şey.
      //
      // Kapak eşiği düşürmenin bedelini ödüyor: sınırdaşların ve ilişkili olduğun herkes
      // HER ZAMAN listede, "adı duyulmuş" uzak devletler ise kalan yeri büyükten küçüğe
      // dolduruyor. Liste böylece hem 3–10 satırda kalıyor hem uzak aday içeriyor.
      //
      // ⚠ KAPAK İKİYE AYRILDI (Görev 12). Tek sayı olarak 30'a çıkarıldığında ÖLÇÜM
      // KIRILDI: zor kademede canlı 23 aktörün 18'i tek bloğa girdi. Sebep, kapağın
      // yalnızca ekranı değil ZEKÂNIN ADAY HAVUZUNU da açması — Görev 09 doygunluğu tam
      // olarak bu havuzu daraltarak çözmüştü.
      //
      //   EN_COK        → motorun/zekânın havuzu. Görev 09'un ölçtüğü sayı, DEĞİŞMEDİ.
      //   EN_COK_EKRAN  → oyuncunun listesi. Bölge kuralı açıkken geçerli; bir bölgede
      //                   11 il olabiliyor (Marmara) ve panelde kaydırma + süzgeç var.
      EN_COK: 10,
      EN_COK_EKRAN: 30,
    },

    // ---- FAYDA TERİMLERİ (Adım 2) ----
    // §9.1'in kalıbı, YENİ MANTIK DEĞİL. `zeka.js` neyi nasıl puanlıyorsa ittifak da
    // öyle puanlanıyor; ikinci bir karar mantığı yazılmıyor (§6/1).
    FAYDA: {
      // ---- ⚠ TEMEL YAKINLIK — ÖLÇÜMLE EKLENDİ (2026-08-12, Baki) ----
      //
      // > *"Yapay zekâ ittifakları yapılmıyor ve oyuncu istek attığında da genelde
      // > reddediyorlar, bu düzeltilmeli."*
      //
      // ÖLÇÜM ŞİKÂYETİ DOĞRULADI: oyuncu 19 geçerli hedefe teklif verse **0–1 tanesi**
      // kabul ediyordu. Puan ayrıştırması sebebi net gösterdi (20. tur, orta):
      //
      //   ORTAK_DUSMAN   +0.025   ← yalnızca 19 hedeften 2'sinde var
      //   CEPHE_YUKU     +0.270
      //   ZAYIF_KOMSU    −0.084   ← yalnızca 2 hedefte
      //   KOMSU          −0.070   ← yalnızca 2 hedefte
      //   TOPLAM          0.141   · eşik 0.70
      //
      // Yani sorun CEZALAR DEĞİL (ikisi de 19'da 2 hedefi etkiliyor): olumlu terimlerin
      // hiç ateşlememesi. Formül ittifakı tek bir gerekçeye bağlamıştı — "ortak düşman" —
      // ve 81 aktörlük bir haritada iki devletin ortak düşmanı nadiren oluyor.
      //
      // ⚠ BU HATA BİR KEZ DAHA YAŞANDI VE ÇÖZÜMÜ ZATEN KAYITLI: savaş ilanı formülünde
      // de bütün terimler durumsaldı, hiçbiri ateşlemiyordu ve dünya kilitlenmişti;
      // `ILAN.FAYDA.GENISLEME` (temel iştah) eklenerek çözülmüştü. İttifak tarafı o dersi
      // hiç almamış. TEMEL, onun ittifaktaki karşılığı.
      //
      // TEMKİNLE ÇARPILIYOR — `GENISLEME`'nin açgözlülükle çarpılmasının simetriği:
      // temkinli devlet dost arar, açgözlü devlet yalnız yürür. Yani sabit bir "herkes
      // anlaşır" kuralı değil, bir KİŞİLİK farkı.
      //
      // ---- ⚠ 0 — DENENDİ, ÖLÇÜLDÜ, İŞE YARAMADI (2026-08-12) ----
      //
      // Terim yerinde duruyor ve KAPALI (0). Sebebi, ölçümün onu çürütmesi:
      //
      // 1. ZOR KADEMEDE OYUNCUYA HİÇ YARAMIYOR. Terim `temkin` ile çarpılıyor; zor
      //    kademede kişilikler saldırgan üretiliyor, yani temkin ≈ 0 ve terim ölü.
      //    Oyuncunun kabul oranı 0/17'den 0/17'ye — TEMEL 0.5 olsa bile değişmiyor.
      // 2. ORTA KADEMEDE YARIYOR AMA KIRMIZI ÇİZGİYİ AŞIYOR. 0.70'te oyuncu 4/13 kabul
      //    alıyor ama canlı devletlerin %66'sı ittifaklı oluyor ve
      //    `testler/diplomasi.test.js` DOYGUNLUK testi ötüyor ("ittifaklı < canlı/2").
      // 3. ÜSTELİK GÜRÜLTÜLÜ. Zor kademede üç tohum: 0.3 → 16/29 ✗, 11/32 ✓, 10/30 ✓.
      //    Oran %50 çizgisinin dibinde geziniyor; hangi değerin testi geçeceği tohuma
      //    kalıyor. Böyle bir ayar "çözüm" değil, kumar.
      //
      // Yani Baki'nin şikâyeti gerçek ama çaresi burada değil: `temkin` ile çarpılan bir
      // TEMEL, tam da ittifak isteyen oyuncunun karşısına çıkan saldırgan aktörlerde
      // susuyor. Doğru kol muhtemelen "gelen teklifi değerlendirmek, kendi sırasını
      // harcayıp teklif vermekten UCUZDUR" ayrımı — ama o ayrı bir tasarım kararı ve
      // Baki'ye soruldu. Terim silinmedi ki bulgu ve ölçüm kaybolmasın.
      //
      // ---- Aşağıdaki tarama 0.70 için yapılmıştı, kayıt olarak duruyor ----
      // İki ölçüt birlikte: oyuncunun teklifi kabul görsün AMA dünya donmasın (Görev
      // 09'un kırmızı çizgisi: *"herkes herkesle anlaşırsa savaş durur ve oyun donar"*).
      //
      //   TEMEL | oyuncu kabul/geçerli (30. tur) | ittifaklı/canlı | 60 turda fetih
      //   ------|-------------------------------|-----------------|---------------
      //   0     |            0/11               |     23/61       |      925
      //   0.5   |            3/13               |     32/55       |      899
      //   0.70  |            4/13               |     37/56       |      900   ← seçilen
      //   0.9   |            6/10               |     48/58       |       —
      //   1.2   |             4/5               |     52/61       |       —
      //
      // 0.9 ve üstünde canlı devletlerin %83'ü ittifaklı — Görev 09'un tam da engellemeye
      // çalıştığı tablo. 0.70'te oyuncunun kabul oranı ~1/3'e çıkıyor: teklif bir kumar
      // olmaktan çıkıyor ama "herkes evet der"e de dönmüyor, doğru ortağı SEÇMEK gerekiyor
      // (diplomasi ekranı zaten hedef başına "kabul eder mi" yazıyor).
      //
      // ⚠ DÜNYA DONMUYOR ve bu ayrıca ölçüldü: 60 turda fetih 925 → 900, kalan sahip 36 →
      // 36. Sebebi aynı gün eklenen üretim freni ve cesaret — saldırgan bir yapay zekâ
      // müttefiği olmayanla savaşmaya devam ediyor. Görev 09'daki doygunluk korkusu o
      // günkü pasif dünyaya aitti; bugünkü dünyada bağlayıcı değil.
      TEMEL: 0,

      // Ortak düşmanımız varsa ittifak mantıklı.
      ORTAK_DUSMAN: 1.0,
      // Kendi cephe yüküm çoksa anlaşmaya daha açığım (temkin ağırlığıyla çarpılır).
      CEPHE_YUKU: 0.8,
      // Hasımla ittifak KURULMAZ (§6/2) — bu terim onu formülün içinde de cezalandırıyor,
      // yani "kurulamaz" kuralı tek yerde değil, tercihte de görünüyor.
      HUSUMET: -3.0,
      // ⚠ EN ÖNEMLİ TERİM: yiyebileceğim komşumla anlaşmam. Bu terim olmazsa ittifaklar
      // rastgele görünür ve oyuncu diplomasiyi anlamsız bulur (Adım 2'nin notu).
      // Açgözlülük ağırlığıyla çarpılır: açgözlü aktör zayıf komşusunu yer, temkinli
      // aktör onunla anlaşabilir.
      ZAYIF_KOMSU: -1.2,
      // HER komşu ittifakının maliyeti — zayıf olmasa bile. Bir komşuyla anlaşmak
      // GENİŞLEYEBİLECEĞİN BİR CEPHEYİ KAPATIR; bu, ittifakın oyundaki asıl bedeli ve
      // ilk sürümde formülde hiç yoktu.
      //
      // ⚠ DOYGUNLUĞUN ASIL SEBEBİ BUYDU (Adım 3 ölçümü): ittifak neredeyse bedavaydı,
      // zor kademede 27 canlı aktörün 26'sı tek bloğa girdi ve harita dondu.
      // Açgözlülükle çarpılıyor — temkinli aktör komşusuyla seve seve anlaşır.
      KOMSU: -1.0,
      // Teklifin kabul edilmesi için gereken en az puan. Altında kalan teklif verilmez
      // ve gelen teklif reddedilir — tek eşik, iki yönde de aynı.
      //
      // 0.5 → 0.7 (Adım 3 ölçümü). Eşik BU FORMÜLLE anlamlı: terimler normalize edildikten
      // sonra pozitif tarafın tavanı ~1.8, yani 0.7 "ortalamanın belirgin üstü" demek.
      // Tarama tablosu `veri/diplomasi-olcum.md`'de; 0.5 zor kademede doygunluk veriyor,
      // 0.8 diplomasiyi tamamen öldürüyor (her kademede %1'in altı).
      ESIK: 0.7,

      // ---- OYUN BAŞINDA İTTİFAK DAHA KOLAY (2026-08-08, Baki) ----
      //
      // > *"Oyun başı ittifak kurma oranları biraz artsın."*
      //
      // SORUN NEREDEYDİ: ittifak puanının en büyük terimi ORTAK DÜŞMAN oranı, ama maçın
      // başında kimsenin düşmanı yok — herkes barışta (Görev 11). Terim sıfır kalıyor,
      // eşik aşılamıyor ve ilk ittifaklar ancak savaşlar oturduktan sonra kuruluyordu.
      // Aynı kısır döngü savaş ilanında da yaşanmıştı ve orada `GENISLEME` terimiyle
      // kırılmıştı (bkz. ILAN.FAYDA); buradaki çözüm de aynı kalıp: eşiği erken turlarda
      // indirmek, formüle yeni terim eklememek.
      //
      // İlk ERKEN_TUR tur boyunca eşik `ESIK − ERKEN_INDIRIM` olur, sonra normale döner.
      //
      // ⚠ 0.10 ÖLÇÜMLE SEÇİLDİ — İLK DENEME (0.25) DOYGUNLUK ÜRETTİ ve testi kırdı
      // (zor kademe, 30 tur: canlı 17 aktörün 9'u ittifaklı). Görev 09'un üç kök sebeple
      // çözdüğü sorunun aynısıydı. Tarama (5 tohum, zor kademe):
      //
      //   indirim | 10. turda ittifak | 30. turda ittifaklı/canlı | en büyük blok
      //   --------|-------------------|---------------------------|---------------
      //   0       |        1.2        |        6.4 / 16.0         |      3.0
      //   0.10    |        3.0        |        6.6 / 17.0         |      2.8   ← seçilen
      //   0.15    |        6.6        |        6.8 / 18.0         |      2.8
      //   0.20    |        7.4        |        5.2 / 15.6         |      2.8
      //   0.25    |        7.0        |        6.0 / 17.4         |      3.0
      //
      // OKUNUŞU: asıl ölçü SOL sütun — Baki "oyun BAŞI ittifak oranları artsın" dedi.
      // 0.10 oyun başındaki ittifak sayısını 1.2'den 3.0'a çıkarıyor (iki buçuk katı),
      // 30. turdaki tabloyu ise tabanın üstünde bırakmıyor. 0.15 ve üstü "biraz"dan çok
      // fazlası: oyun başında altı-yedi ittifak, harita daha kurulmadan bloklaşıyor.
      //
      // ⚠ SAĞ İKİ SÜTUN GÜRÜLTÜLÜ (tohum başına ±2 dalgalanıyor), o yüzden karar tek
      // sütuna dayandırılmadı. Doygunluğun asıl kapısı zaten aşağıdaki GUC_KISITI.
      ERKEN_TUR: 8,
      ERKEN_INDIRIM: 0.1,

      // ---- KABUL EŞİĞİ İNDİRİMİ (2026-08-12, Baki'nin onayıyla) ----
      //
      // Masadaki teklife evet demek, gidip teklif etmekten ucuzdur: sıra harcanmıyor,
      // fırsat maliyeti yok, karşı taraf zaten istekli olduğunu göstermiş. Tek eşik bu
      // farkı yok sayıyordu ve oyuncu 19 hedeften 0–1 kabul alıyordu.
      //
      // Kabul eşiği = `ittifakEsigi × (1 − KABUL_INDIRIMI)`.
      //
      // ⚠ TARAFSIZ KURAL: yapay zekâlar birbirinin teklifini de bu eşikle değerlendiriyor.
      // Oyuncunun kazancı ayrıcalıktan değil, TEKLİF EDEN taraf olmasından geliyor.
      // Sayı aşağıdaki taramayla seçildi (`veri/URETIM-NOTU.md`).
      KABUL_INDIRIMI: 0.3,
    },

    // ---- İTTİFAKA GÜÇ TAVANI (2026-08-08, Baki) ----
    //
    // > *"İttifaklara bir güç kısıtı koyulsun, danaya girer gibi savaşlar dönmesin."*
    //
    // İki devlet, birleşince dünyanın belli bir payını aşıyorsa anlaşamaz. Kural HEM
    // OYUNCUYA HEM ZEKÂYA aynı biçimde uygulanıyor (`teklifGecerliMi` kapısı) — yani
    // "iki dev birleşip haritayı paylaşamaz" cümlesi tek yerde yazılı.
    //
    // NEDEN PARÇA SAYISI: kazanma koşulu parça sayıyor (`mod.js`) ve oyuncunun haritada
    // gördüğü şey o. (Güç sıralaması da toprağı sayıyor — `DENGE.GUC.TOPRAK` — ama askeri
    // güç ve gelirle birlikte; ittifak tavanı için tek ve görünen ölçü daha adil.)
    //
    // 0.40 SEÇİLDİ: iki tarafın toplamı haritanın %40'ını aşıyorsa masa kurulmuyor.
    //   • Maçın başında kimse takılmaz (herkes 2–3 parça, toplam %3).
    //   • Ortada zayıf–zayıf ve zayıf–güçlü ittifakları serbest kalır.
    //   • Sonda iki büyüğün birleşip maçı formaliteye çevirmesi engellenir.
    // Zaten kurulmuş bir ittifak sonradan büyüdü diye BOZULMAZ: kural kapıda çalışıyor,
    // geriye dönük bir el koyma değil. Sonradan bozmak, oyuncunun kendi kurduğu düzeni
    // haber vermeden dağıtmak olurdu.
    GUC_KISITI: {
      ACIK: true,
      ORAN: 0.4,
    },

    // Ateşkes kabul şartları (§5.4): kaybediyorsa, cephesi çoksa veya temkinliyse kabul.
    ATESKES: {
      // Karşı taraf benden BU ORANDA büyükse "kaybediyorum" sayılıyor (0.25 = %25 fazla).
      //
      // Savaş başına toprak kaybı TUTULMUYOR ve bilerek: o, kayda savaş başına ikinci bir
      // sayaç eklemek demekti (§7'nin "türetilebilen kaydedilmez" kuralı). Büyüklük farkı
      // zaten aynı soruyu cevaplıyor — kaybeden taraf küçülür.
      KAYBEDIYORUM_ORANI: 0.25,
      // Bu kadar ayrı AKTÖRLE savaştaysam cephem "çok" sayılır. Parça değil aktör sayısı:
      // üç ayrı devletle savaşmak, tek devletle üç parçada savaşmaktan ağırdır — ve
      // diplomasinin çözdüğü sorun tam olarak budur.
      COK_CEPHE: 3,
      // Temkin ağırlığının ateşkes isteğine katkısı.
      TEMKIN: 1.0,
    },
  },

  // ---- MOD SİSTEMİ VE MAÇ ÇERÇEVESİ (Görev 09 / tasarım §8.1) ----
  //
  // ┌─ BAKİ'NİN KARARI (2026-08-01) — BELGEDEN FARKLI ────────────────────────────────────┐
  // │ Görev belgesi modları KAPSAMA göre tanımlıyordu (Bölge · Türkiye · Serbest).        │
  // │ Baki modları KAZANMA KOŞULUNA göre tanımladı:                                       │
  // │                                                                                     │
  // │   *"1.si tüm Türkiye'yi fethetmek gerektiren, 2.si %50'sini fethetmenin yeterli     │
  // │    olduğu, 3.sü sınırlı sayıda turda en çok güçlenen il olmak."*                    │
  // │                                                                                     │
  // │ Bu daha iyi bir ayrım ve kapsamı DIŞLAMIYOR — ikisi dik eksen:                      │
  // │     KAPSAM (Türkiye / 7 coğrafi bölge)  ×  KAZANMA KOŞULU (üç mod)                  │
  // │ Bölge modu böylece kaybolmuyor, üç kazanma koşulunun üçüyle de oynanabiliyor.       │
  // │ (Baki Soru 4'te de "7 coğrafi bölge, hazır liste" demişti.)                         │
  // └─────────────────────────────────────────────────────────────────────────────────────┘
  MOD: {
    VARSAYILAN_TIP: 'fetih',
    VARSAYILAN_KAPSAM: 'turkiye',

    // Ana menüdeki maç yuvası sayısı (Soru 5 → Baki: A, üç yuva).
    // ÜCRETSİZ VE ÖYLE KALACAK — §12.3 bunu 2026-07-23'te karara bağladı, Görev 10'un
    // para kazanma katmanı buraya dokunmayacak.
    YUVA_SAYISI: 3,

    // ---- TUR SINIRI NASIL HESAPLANIYOR ----
    //
    // Baki süre verdi, tur değil: *"türkiyeyi fethettiğimiz modda süre sınırı üst sınır
    // olarak 1 saat civarı olacak şekilde ayarlansın, iyi oynanırsa ortalama 30-40 dk'de
    // bitsin. %50'de ise üst sınır 30-40 dk civarı olsun. En çok güçlenen il için de kaç
    // tur olması gerektiğini sen hesapla, o da 20-30 dk civarı sürsün."*
    //
    // SÜREYİ TURA ÇEVİREN SAYI `SANIYE_PER_TUR` (aşağıda) ve tur sınırı KAPSAM
    // BÜYÜKLÜĞÜNE göre ölçekleniyor:
    //
    //     turSiniri = TABAN + PARCA_BASINA × kapsamdakiParçaSayısı
    //
    // Sabit sayı yerine formül, çünkü aynı mod hem 181 parçalık Türkiye'de hem 22 parçalık
    // Güneydoğu'da oynanacak; sabit 80 tur, bölge maçını 80 turun 20'sinde bitirip geri
    // kalanını formaliteye çevirirdi (§4/Soru 3'ün C seçeneğine düşülen not).
    //
    // ⚠ SAYILAR ADIM 3'TE ÖLÇÜMLE KESİNLEŞECEK. Buradakiler hesaplanmış BAŞLANGIÇ
    // değerleri; "eşikler onaylanmadan Adım 5'e geçilmez" (görev belgesi §Adım 3).
    TIPLER: {
      // 1) TAM FETİH — kapsamdaki her parça senin olacak.
      fetih: {
        ad: 'Fetih',
        // Kazanmak için gereken parça oranı.
        ESIK_ORANI: 1.0,
        // ---- TUR SINIRI KALDIRILDI (2026-08-08, Baki) ----
        //
        // > *"Fetih ve %50 hâkimiyet için üst tur sınırları koyma, ama oyunun yapay
        // > zekâları da oyunu bitirme isteğiyle oynasın."*
        //
        // İki cümle birbirine bağlı ve ikincisi olmadan birincisi oyunu bozardı: sınırsız
        // bir maçta dünya kilitlenirse maç HİÇ bitmez. O yüzden bu satırın karşılığı
        // `DENGE.ZEKA.BITIRME` — maç uzadıkça yapay zekânın iştahı artıyor.
        //
        // SINIRSIZ olduğunda `TABAN`/`PARCA_BASINA` hiç okunmaz; `senaryolar.js` doğrudan
        // Infinity döner ve "süre doldu" dalı (`mod.js sonucKontrol`) hiç çalışmaz. Sayılar
        // silinmedi, geri açmak tek satır: `SINIRSIZ: false`.
        SINIRSIZ: true,
        // ⚠ 80 → 150 TUR (Adım 3/c ölçümü, Baki 2026-08-01: "tur sınırını yükseltelim").
        //
        // Ölçüm acı bir şey gösterdi: 80 tur yetmediği gibi 250 TUR DA YETMİYOR — dünya
        // kilitleniyor. Zor kademede 125. turda en büyük imparatorluk 125/181'e (%69)
        // çıkıyor, canlı aktör 3'e iniyor ve MUHAREBE SAYISI SIFIRA DÜŞÜYOR; 200. tura
        // kadar tek parça el değiştirmiyor. Orta kademede tavan %36.
        //
        // Yani sınır tek başına çözmüyor. Ama sınır bir HEDEF DEĞİL, ÜST SINIR: oyuncu
        // 90. turda bitirirse 90'da kazanır. 150, yapay zekânın tavana vurduğu turun
        // (125) üstünde duruyor — oyuncuya dünyanın durduğu noktadan sonra da alan
        // bırakıyor. Süre karşılığı ~1 sa 52 dk.
        //
        // SÜRE DOLARSA MAÇ BERABERE BİTMİYOR, TOPRAĞA BAKILIYOR (aşağıdaki SURE_DOLUNCA).
        TABAN: 8,
        PARCA_BASINA: 0.785,
      },
      // 2) YARIM FETİH — kapsamın yarısı yeter.
      yarim: {
        // AD DEĞİŞTİ (2026-08-01, Baki): "Yarım Fetih" kötü duruyordu. "%50 Hâkimiyet"
        // hem ne yapılacağını sayıyla söylüyor hem de yarım kalmışlık çağrıştırmıyor.
        ad: '%50 Hâkimiyet',
        ESIK_ORANI: 0.5,
        // Tur sınırı kaldırıldı — gerekçesi fetih modundaki notta.
        SINIRSIZ: true,
        // 50 → 70 tur (Adım 3/c). Ölçüm: zor kademede en büyük imparatorluk %50'ye
        // 56. TURDA ulaşıyor — 50 turluk sınır eşiği kıl payı imkânsız kılıyordu.
        // 70, o eşiğin üstünde ve hâlâ bir oturumluk (~52 dk).
        TABAN: 12,
        PARCA_BASINA: 0.32,
      },
      // 3) TUR LİMİTLİ — sınırlı turda EN ÇOK GÜÇLENEN il olmak.
      // Kazanma koşulu fetih değil SIRALAMA: tur dolduğunda en çok parçası olan kazanır.
      // Tur sınırı burada bir üst sınır değil, MAÇIN KENDİSİ — o yüzden en kısası.
      puan: {
        ad: 'Güç Yarışı',
        ESIK_ORANI: null, // eşik yok; sıralama belirler
        // ~25 dk: 1500 / 45 ≈ 33 → 35 tur (Türkiye). Baki'nin "20-30 dk"sı.
        // BU MOD ÖLÇÜMDEN ETKİLENMEDİ: fetih eşiği yok, kazanan sıralamayla belirleniyor,
        // yani dünyanın kilitlenmesi maçı bozmuyor — kilitlenen dünyada da bir birinci var.
        TABAN: 12,
        PARCA_BASINA: 5 / 39,
      },
    },

    // ---- SÜRE DOLDUĞUNDA NE OLUR ----
    //
    // Ölçüm (`veri/mod-esik-olcum.md`) fetih modunun tur sınırına dayanabileceğini
    // gösterdi: dünya %69'da kilitleniyor. O yüzden "süre doldu, kimse kazanamadı" hâli
    // GERÇEK bir ihtimal ve tanımsız bırakılamaz — maçın bitmemesi bu görevin çözmeye
    // geldiği sorunun ta kendisi.
    //
    //   'toprak' → en çok parçası olan kazanır (Güç Yarışı'nın kuralı)
    //   'yenilgi' → eşiğe ulaşamayan oyuncu kaybeder
    //
    // 'toprak' seçildi: her maç bir SONUÇLA bitiyor ve kural zaten oyunda var (üçüncü
    // modun kendisi). İkinci bir bitiş mantığı yazılmıyor (§10/4).
    SURE_DOLUNCA: 'toprak',

    // ---- RAKİP EŞİĞE ULAŞIRSA MAÇ BİTER (Görev 20 · DENETIM-2026-09-23 ⚠7) ----
    // %50 Hâkimiyet'te bir bot haritanın yarısını alınca oyuncu KAYBEDİYOR (`mod.js
    // sonucKontrol` 2b). Eskiden maç sürüyordu ve kaybedilmiş bir maç son bölgeye kadar
    // sürükleniyordu. Baki 2026-09-23'te uygulanabilir fikirler listesine "uygun gördüğünü
    // uygula" dedi; kural modun adından geliyor (hedefe İLK ulaşan kazanır). Geri almak tek
    // satır: `false` — o zaman oyuncu yalnızca elenince kaybeder.
    RAKIP_ESIGI_BITIRIR: true,

    // ⚠ BU SAYI ÖLÇÜLMEDİ, HESAPLANDI — ve bu görevin en zayıf varsayımı.
    //
    // İki bileşeni var:
    //   • GÖSTERİ: ölçüldü, `cephem` kapsamında 6.6 sn/tur (`veri/sahne-olcum.md`).
    //   • OYUNCUNUN KARAR SÜRESİ: ölçülmedi. Emir vermek, üretim, araştırma, rapor okuma.
    //
    // 45 sn tahmini, gösterinin ölçülen 6.6 saniyesi + ~38 sn karar. Erken turlar bunun
    // altında (1–2 emir), geç turlar üstünde (8+ emir) — 45 ortalamadır.
    //
    // CİHAZ DENEMESİNDE (Adım 8) DÜZELTİLECEK. Baki "maç uzun/kısa geldi" derse
    // düzeltilecek yer tur sınırları değil BURASI: tek sayı, üç modu birden kaydırır.
    SANIYE_PER_TUR: 45,

    // ---- KAPSAMLAR ----
    // Türkiye + 7 coğrafi bölge (Soru 4 → Baki: A). Bölge adları `veri/iller.json`'daki
    // `bolge` alanıyla BİREBİR eşleşmeli; `veri-dogrula.js` bunu denetliyor.
    // İl ve parça sayıları KODA YAZILMIYOR, kapsamdan sayılıyor — mod seçim ekranında
    // gösterilecek sayı ile oyunun gerçekten kurduğu kapsam ayrışamasın.
    KAPSAMLAR: [
      { anahtar: 'turkiye', ad: 'Türkiye', bolge: null, varsayilanOyuncu: '16' },
      { anahtar: 'akdeniz', ad: 'Akdeniz', bolge: 'Akdeniz', varsayilanOyuncu: '07' },
      { anahtar: 'doguAnadolu', ad: 'Doğu Anadolu', bolge: 'Doğu Anadolu', varsayilanOyuncu: '25' },
      { anahtar: 'ege', ad: 'Ege', bolge: 'Ege', varsayilanOyuncu: '35' },
      {
        anahtar: 'guneydoguAnadolu',
        ad: 'Güneydoğu Anadolu',
        bolge: 'Güneydoğu Anadolu',
        varsayilanOyuncu: '27',
      },
      { anahtar: 'karadeniz', ad: 'Karadeniz', bolge: 'Karadeniz', varsayilanOyuncu: '55' },
      { anahtar: 'marmara', ad: 'Marmara', bolge: 'Marmara', varsayilanOyuncu: '16' },
      { anahtar: 'icAnadolu', ad: 'İç Anadolu', bolge: 'İç Anadolu', varsayilanOyuncu: '06' },
    ],
  },

  // ---- EĞİTİM (GOREV-20 Adım 8 · `src/oyun/egitim.js`) ----
  //
  // Ana menüdeki EĞİTİM küçük bir maç açıyor: Marmara, sen Bursa, sabit tohum. Aşağıdaki
  // sayılar o maçın normal kurulumdan FARKI — ilk saldırı kazanılsın, ilk turda asker
  // basılabilsin diye. Eğitim kayda girmez; buradaki hiçbir sayı gerçek maçları etkilemez.
  EGITIM: {
    KAPSAM: 'marmara',
    OYUNCU: '16', // Bursa
    ZORLUK: 'kolay',
    // Sabit tohum: her oyuncu aynı eğitimi görsün (rakiplerin kişiliği, savaşın zarı).
    TOHUM: 20260925,
    // İlk hamle: Doğu Bursa'dan Yalova'ya. Yalova tek parçalı il — alınınca "İL
    // FETHEDİLDİ" kartı çıkıyor, yani ilk fetih aynı zamanda ilk il.
    KAYNAK: '16-3',
    HEDEF: '77-1',
    // Kaynakta güçlü bir ordu, hedefte tek piyade: tahmin "KAZANIRSIN" (yeşil) desin.
    // Normal kurulumda Doğu Bursa 2, Yalova 4 birlikle başlıyor.
    KAYNAK_ORDU: { piyade: 4, topcu: 1, zirhli: 1 },
    HEDEF_ORDU: { piyade: 1 },
    // Asker basma dersi başkentte: Bursa Ovası.
    URETIM_PARCA: '16-1',
    // İlk turun bütçesi — tam iki piyadelik (piyade 3 nüfus + 1 ekonomi). Normal maç sıfırla
    // başlıyor ve ilk turda hiçbir şey basılamıyor.
    HAVUZ: { nufus: 6, ekonomi: 2 },
    // Kamera açılışta kaynakla hedefin ortasına bu yakınlıkta iniyor: parça kalkanları
    // görünür (YAKIN_SINIR 2.7'nin üstü), Yalova parmakla seçilebilecek kadar büyük.
    KAMERA_YAKINLIK: 3.2,
    // Parıltının bir nefesi (milisaniye) — halka ve düğme ışığı aynı ritimde.
    PARILTI_SURE: 1100,
  },

  // ---- GÜÇ SIRALAMASI (Görev 12; formül Görev 20'de yeniden kuruldu) ----
  //
  // > Baki, 2026-09-23: *"Gücün hesaplamasında sahadaki aktif askeri güç, ekonomi ve bölge
  // > sayıları etkili olsun; İstanbul 1., Ankara 2. olacak şekilde formülünü tasarla."*
  //
  // GÜÇ = TÜRKİYE'DEKİ GÜCÜN YÜZDE KAÇI SENDE. Üç payın ağırlıklı ortalaması:
  //
  //   puan = 100 × ( ASKER   × senin askeri gücün  / bütün illerin askeri gücü
  //                + EKONOMI × senin tur gelirin   / bütün illerin tur geliri
  //                + TOPRAK  × senin bölge sayın   / bütün bölgeler )
  //
  // • ASKERİ GÜÇ = sahadaki SAĞLAM birimlerin savaş değeri toplamı (yaralı sayılmaz). Bir
  //   birimin savaş değeri = (ağır vuruş + hafif vuruş) × (dayanıklılık + zırh): verdiği
  //   zarar çarpı dayanabildiği zarar. Araştırmayla güçlenmiş statlar dahil — yani
  //   araştırma da güç. Temel piyadeye bölünüyor: 1 piyade = 1, topçu ≈ 1.35, zırhlı ≈ 2.8.
  // • EKONOMİ = tur başına nüfus + ekonomi geliri.
  // • TOPRAK = bölge (parça) sayısı — kazanma koşulunun birimi.
  //
  // PAY OLARAK, HAM SAYI OLARAK DEĞİL: üç bileşenin birimi farklı (savaş değeri, gelir,
  // bölge). Ham toplamda en büyük sayıyı üreten bileşen gizlice ağır basardı; pay olunca
  // ağırlık gerçekten ağırlık oluyor. Yan faydası: puanın bir anlamı var ("gücün %2.4'ü").
  //
  // AĞIRLIKLAR: 35 / 35 / 30 — ölçüldü (maç başı, her tohumda aynı):
  //   İstanbul 2.41 · Ankara 2.27 · Kocaeli 2.20 · Bursa 2.06 · Antalya 1.98
  // Kocaeli'nin zırhlı ağırlıklı ordusu İstanbul'unkinden bile GÜÇLÜ (19.5'e 17.7). Askere
  // %40'tan fazla ağırlık verilirse Kocaeli Ankara'yı geçiyor; Ankara'yı ikinci yapan şey
  // dört bölgesi ve ikinci büyük geliri. "Askeri güç en az ekonomi kadar ağır" koşulu
  // altında İstanbul 1 · Ankara 2'yi en geniş payla tutan ağırlık bu (tarama: 5'lik adım).
  // `testler/guc.test.js` sırayı kilitliyor — ağırlık değişirse test söyler.
  //
  // ⚠ SIRALAMA GÖSTERGEDİR, KURAL DEĞİL. Hiçbir mekanik bu puana bakmıyor; kazanma koşulu
  // `mod.js`'te ve orası yalnızca bölge sayıyor. "En güçlü" ile "kazanan" ayrışabilir.
  GUC: {
    ASKER: 0.35,
    EKONOMI: 0.35,
    TOPRAK: 0.3,
  },

  // ---- ORDU ROZETİ (Görev 04 / Adım 2) ----
  // Katman sınırları TAHMİN DEĞİL, ölçümden geldi: `node scripts/rozet-katman-olcum.js`
  // → `veri/rozet-katman-olcum.md`. Sınırları Baki seçti (2026-07-27).
  // Haritanın gerçek yakınlaştırma aralığı 0.9× – 7× (bkz. Harita.js pinch sınırları).
  ROZET: {
    // Rozetin ekrandaki çapı. HARİTAYLA BÜYÜMEZ — yakınlaştıkça parça büyür, rozet sabit
    // kalır. Ölçümün tamamı bu 26 sayısına dayanıyor; değiştirirsen ölçümü yeniden çalıştır.
    CAP: 26,
    // Bu yakınlaştırmanın ALTINDA rozet hiç yok (harita temiz kalsın).
    ORTA_SINIR: 1.35,
    // Bu yakınlaştırmadan İTİBAREN parça başına rozet; arada il başına tek rozet.
    YAKIN_SINIR: 2.7,
    // Bu sayının üstü "99+" yazılır — rozet büyümesin, ölçüm geçerli kalsın
    // (Görev 04 / Soru 4 → Baki'nin cevabı B: yumuşak sınır).
    EN_COK_GOSTERILEN: 99,
    // Katman sınırında GİDİP GELMEYİ engelleyen pay (2026-07-30, Baki: "rozetler titriyor").
    // Yakınlaştırma tam sınırın üstünde duraklarsa, en küçük parmak oynaması katmanı bir
    // ileri bir geri atlatır ve rozetler çakışıp titrer. Bu yüzden YUKARI geçiş sınırda,
    // AŞAĞI dönüş sınırın bu kadar altında olur.
    //
    // Görev 04'te histerezis denenip kaldırılmıştı; o zaman geçiş her karede sürekli
    // hesaplanan bir SOLMA ile yapılıyordu ve solma sınırdaki titremeyi kendiliğinden
    // yutuyordu. Çizim artık kare başına değil, hareket durunca hesaplanıyor (RozetKatmani);
    // sürekli solma kalmayınca histerezis yeniden gerekli oldu.
    KATMAN_HISTEREZIS: 0.15,

    // ---- HARİTA İLE BÜYÜYEN ROZET (Görev 20 · Skia haritası, Baki'nin cevabı: "büyüsün") ----
    //
    // Eski haritada rozet ekranda hep 26 pikseldi ve katman sınırlarında (1.35×, 2.70×)
    // birden değişiyordu. Yeni haritada rozet HARİTANIN PARÇASI: yakınlaştıkça büyür,
    // uzaklaştıkça küçülür (Polytopia gibi).
    //
    // ÖLÇÜMÜN DAYANAĞI KORUNUYOR. `veri/rozet-katman-olcum.md` "26 piksellik rozet
    // şekle sığıyor mu" sorusunu katman sınırlarında sordu: il rozeti 1.35×'te, parça rozeti
    // 2.70×'te. Yeni kuralda rozet TAM O YAKINLIKTA 26 piksel; ondan sonra şekille AYNI
    // oranda büyüyor. Şekil ve rozet birlikte büyüdüğü için "sığıyor" cevabı her
    // yakınlıkta aynı kalıyor — ölçüm yeniden yapılmadan geçerli.
    //
    //   il rozeti   = CAP · z / ORTA_SINIR    (1.35×'te 26 px)
    //   parça rozeti = CAP · z / YAKIN_SINIR  (2.70×'te 26 px)
    //
    // Uçlarda sınır YOK (Adım 3b): rozet haritaya kaydedilmiş bir resim, boyunu kamera
    // veriyor — sınır koymak her karede rozet başına iş demekti. Gerek de yok: il rozeti
    // en uzakta (0.9×) 17 px, parça rozeti en yakında (7×) 67 px.
    // İl rozetlerinden parça rozetlerine geçişin SÜRESİ (milisaniye). Yakınlık YAKIN_SINIR'ı
    // geçince katman bu sürede yumuşakça değişir; geri dönüş KATMAN_HISTEREZIS kadar aşağıda.
    // ⚠ Yakınlığa bağlı karışım (2.3×–2.7× arası iki katman birden) önizlemede denendi ve
    // atıldı: oyuncu o bantta durunca iki katman yarı saydam üst üste kalıyordu.
    DUNYA_GECIS_SURE: 180,
    // KADRO ŞERİDİ (Görev 20 · plan YOL-HARITASI-v11 §17.2): bu yakınlıktan itibaren parça
    // kalkanının altında birim figürleri + sayıları (rakipte de — Baki, 2026-09-23:
    // "gözüksün, casus raporunu boşver"). Geri kapanış KATMAN_HISTEREZIS kadar aşağıda,
    // geçiş DUNYA_GECIS_SURE kadar. Seçim ölçümle: sayının büyük harfi ≥ 7 dp
    // (`node scripts/kadro-serit-olcum.js` → `veri/kadro-serit-olcum.md`).
    SERIT_ESIGI: 4,
    // BİRLİK FİGÜRLERİ (Görev 21 · H10): bu yakınlıktan itibaren kadro şeridinin yerini
    // büyük figürler alıyor — sahibinin renginde piyade / top / tank, yanında sayısı
    // (Polytopia hissi: sayı değil, orada duran bir ordu). Kapanış ve geçiş şeritle aynı kural.
    FIGUR_ESIGI: 5.5,
    // HAMLE HAKKI HALKASININ NEFESİ (Görev 21 · H3): yanan dilimlerin bir kez sönüp yeniden
    // parlaması bu kadar sürer (milisaniye). Yavaş olmalı — hızlısı "uyarı" gibi yanıp söner.
    NEFES_SURE: 2400,
    // Nefes saniyede bu kadar kez güncellenir (her karede değil): harita her güncellemede
    // baştan çiziliyor, 60 yerine ~20 çizim pili üç kat az yoruyor; yavaş bir parlaklık
    // değişiminde fark görünmüyor.
    NEFES_ADIM: 50,
  },
};
