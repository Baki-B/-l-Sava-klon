// LİDER TABLOSU — İLLERİN BAŞINDAKİ İSİMLER (Görev 16 / Adım 1)
//
// ---- BURASI VERİ DOSYASIDIR, KOD DEĞİL ----
//
// `husumetler.js` ile aynı kalıp: satırları Baki yazar, kod hiçbir ad UYDURMAZ. Yeni bir
// lakap eklemek = aşağıya bir satır. Kural motoru `src/oyun/liderler.js`'te.
//
// ---- ⚠ GERÇEK KİŞİ ADI YOK, "VALİ" DE YOK (Baki, 2026-09-19) ----
//
// Rakip iller karakter kazansın diye ad alıyorlar ama hiçbiri gerçek bir insana ya da
// gerçek bir göreve işaret etmiyor. "Vali" bilerek dışarıda: gerçek bir devlet görevi,
// gerçek bir kişiyi çağrıştırır. Unvanlar tarihî ve kültürel: Paşa · Bey · Ağa · Reis · Efe.
//
// ---- AD NASIL KURULUYOR ----
//
//   "Konya Paşası — Demir Yumruk"
//    └─ il adı  └─ UNVAN (bölgeden)  └─ LAKAP (baskın huydan)
//
// Unvan BÖLGEDEN geliyor: Türkiye'nin dili haritaya yayılsın, her ilin adı aynı kelimeyle
// bitmesin. Lakap KİŞİLİKTEN geliyor ve bu bilinçli — lakap süs değil BİLGİ: oyuncu
// "Demir Yumruk" duyunca saldırgan, "Yaşlı Tilki" duyunca temkinli bir rakip beklemeli.

// ---- UNVANLAR: BÖLGE → unvan ----
//
// İyelik biçimi ayrı yazılıyor ("Paşa" → "Paşası"): Türkçe eki koda hesaplatmak, il adı
// ünlüyle bitince ("Rize Beyi" / "Ordu Ağası") hata yapmaya açık bir iş. Tabloda yazılı
// olan, okunduğu gibi kullanılır.
export const UNVANLAR = {
  Marmara: { ad: 'Paşa', iyelik: 'Paşası' },
  Ege: { ad: 'Efe', iyelik: 'Efesi' },
  Akdeniz: { ad: 'Bey', iyelik: 'Beyi' },
  'İç Anadolu': { ad: 'Paşa', iyelik: 'Paşası' },
  Karadeniz: { ad: 'Reis', iyelik: 'Reisi' },
  'Doğu Anadolu': { ad: 'Bey', iyelik: 'Beyi' },
  'Güneydoğu Anadolu': { ad: 'Ağa', iyelik: 'Ağası' },
};

// Bölgesi tabloda bulunamazsa (veri değişirse) bu kullanılır — oyun ad alamayan bir ille
// karşılaşıp boş satır göstermesin.
export const VARSAYILAN_UNVAN = { ad: 'Komutan', iyelik: 'Komutanı' };

// ---- LAKAPLAR: BASKIN HUY → havuz ----
//
// Dört huy `DENGE.ZEKA.AGIRLIKLAR` ile birebir aynı adları taşıyor; biri eklenirse buraya
// da bir havuz eklenmeli (`veri-dogrula.js` bunu denetliyor).
export const LAKAPLAR = {
  saldirganlik: ['Demir Yumruk', 'Kasırga', 'Yalın Kılıç', 'Şahin', 'Ateş Elli', 'Boran'],
  acgozluluk: ['Doymaz', 'Harita Yiyen', 'Aç Kurt', 'Ambarcı', 'Hesapçı', 'Pay Vermez'],
  husumet: ['Kan Davalı', 'Unutmaz', 'Kindar', 'Defterci', 'Sözü Sert', 'Affetmez'],
  temkin: ['Yaşlı Tilki', 'Sabırlı', 'Duvar', 'Ölçülü', 'Gözcü', 'Sakin Su'],
};

// ---- HASIM LİDERLERİ: SABİT ADLAR ----
//
// `husumetler.js`'teki 7 çiftin 14 ili. Bu adlar tohumdan türetilmiyor, ELLE yazılmış ve
// husumetin konusuyla konuşuyor: düello kartında iki ad karşı karşıya geldiğinde olay bir
// maçtan hikâyeye dönüşsün diye. Satırın sonundaki yorum hangi düelloya ait olduğunu söyler.
export const HASIM_LIDERLERI = {
  '52': 'Fındık Kıran', // Ordu — Büyük Fındık Savaşı
  '28': 'Kabuk Soyan', // Giresun — Büyük Fındık Savaşı
  '61': 'Demli', // Trabzon — Büyük Çay Savaşı
  '53': 'Tavşan Kanı', // Rize — Büyük Çay Savaşı
  '56': 'Dal Fıstık', // Siirt — Büyük Fıstık Savaşı
  '27': 'Yeşil Altın', // Gaziantep — Büyük Fıstık Savaşı
  '02': 'Yoğuran', // Adıyaman — Büyük Çiğ Köfte Savaşı
  '63': 'Acı Usta', // Şanlıurfa — Büyük Çiğ Köfte Savaşı
  '22': 'Kıyma Ustası', // Edirne — Büyük Köfte Savaşı
  '59': 'Izgaracı', // Tekirdağ — Büyük Köfte Savaşı
  '03': 'Sucukçu', // Afyonkarahisar — Büyük Pastırma Savaşı
  '38': 'Çemenci', // Kayseri — Büyük Pastırma Savaşı
  '34': 'Boğaz Bekçisi', // İstanbul — İstanbul–Ankara husumeti
  '06': 'Bozkır Kartalı', // Ankara — İstanbul–Ankara husumeti
};
