// HUSUMET TABLOSU — BÜYÜK SAVAŞLAR (tasarım §11 · Görev 08)
//
// İki ilin arasındaki tarihî/kültürel çekişme. Bu iller birbirinin bölgesine ilk kez
// saldırdığında sıradan bir savaş değil, ADI OLAN BİR DÜELLO başlar: kart gelir, iki
// tarafa moral bonusu işler, kazanan fazladan ganimet alır ve düello sürerken üçüncü
// bir devlet aralarına giremez.
//
// ---- BURASI VERİ DOSYASIDIR, KOD DEĞİL ----
//
// Kod hiçbir rekabet UYDURMAZ. Yeni bir savaş eklemek = aşağıya bir satır yazmak;
// hiçbir dosyaya daha dokunmak gerekmez (tasarım §11: "yeni rekabet eklemek tek satır").
// Satırları Baki yazar — hangi iki ilin arası açık, sebebi ne, savaşın adı ne olmalı:
// bu tasarımcının işi, kodun değil.
//
// ---- NASIL SATIR EKLENİR ----
//
//   { ilA: '52', ilB: '28', konu: 'fındık', ad: 'Büyük Fındık Savaşı' },
//     │          │          │               └── düello kartında ve tur raporunda çıkan ad
//     │          │          └── çekişmenin sebebi (kartın alt satırı)
//     └──────────┴── il KODLARI, `veri/iller.json`'daki iki haneli kodlar (Ordu 52,
//                    Giresun 28). Sıra önemsiz: A–B ile B–A aynı husumettir.
//
// Kuralları `npm run kontrol` denetliyor (scripts/veri-dogrula.js):
//   • iki kod da 01–81 arasında geçerli bir il olmalı
//   • bir il kendisiyle hasım olamaz
//   • aynı çift iki kez yazılamaz
//   • konu ve ad boş olamaz, ad tekrar edemez
//   • iki il komşu değilse UYARI verilir (hata değil): düello ancak taraflardan biri
//     ötekine kadar genişleyince tetiklenebilir, yani oyunun geç saatlerinde
//
// ---- "BÜYÜK" NEDEN (2026-08-01, Baki) ----
//
// İlk deneme "Kutsal Fındık Savaşı"ydı. Baki: *"hem güzel hem absürt duruyor."* Haklıydı —
// "kutsal" sıfatı mizahı kelimeye yüklüyordu, oysa mizah zaten KONUDA var: iki il fındık
// için savaşıyor. "Büyük" sıfatı ciddi duruyor ve "Büyük Savaş" çağrışımıyla oyunun komuta
// masası tonuna oturuyor; komik olan şey cümlenin kendisi değil, ne için savaşıldığı.
//
// Sıfat BEŞİNDE DE AYNI olmak zorunda değil ama aynı tutuluyor: kartlar arasında ortak bir
// dil kuruyor ve oyuncu ikinci kartta "bu da onlardan biri" diyor.

export const HUSUMETLER = [
  // ---- KARADENİZ: iki komşu çift, her birinin kendi ürünü ----
  // Tasarım §11'in ilk örneği. Ordu ile Giresun'un fındık çekişmesi belgede adı konmuş
  // tek husumetti; bu tablonun başlangıç noktası.
  { ilA: '52', ilB: '28', konu: 'fındık', ad: 'Büyük Fındık Savaşı' },
  // Trabzon ile Rize'yi belge de sayıyordu ama konusunu vermiyordu. ÇAY seçildi
  // (2026-08-01): Rize Türkiye'nin birinci, Trabzon ikinci çay üreticisi — yani kavga
  // tam olarak bu iki ilin arasında. "Karadeniz'in başkenti" de düşünüldü ve elendi,
  // sebebi Baki'nin itirazı: *"diğer Karadeniz illerini ignorelamış oluruz."* Samsun da
  // Ordu da o iddiayı taşır; çay taşımaz.
  { ilA: '61', ilB: '53', konu: 'çay', ad: 'Büyük Çay Savaşı' },

  // ---- GÜNEYDOĞU: üç ilin birbirine bağlandığı üçgen ----
  // Tasarım §11'in ikinci örneği.
  { ilA: '56', ilB: '27', konu: 'fıstık', ad: 'Büyük Fıstık Savaşı' },
  // Çiğ köftenin memleketi tartışması. Şanlıurfa böylece haritanın en çok çekişilen ili
  // olmuyor ama Gaziantep'le birlikte güneydoğuyu husumetli bir bölgeye çeviriyor.
  { ilA: '02', ilB: '63', konu: 'çiğ köfte', ad: 'Büyük Çiğ Köfte Savaşı' },

  // ---- TRAKYA ----
  { ilA: '22', ilB: '59', konu: 'köfte', ad: 'Büyük Köfte Savaşı' },

  // ---- İÇ ANADOLU / EGE ----
  { ilA: '03', ilB: '38', konu: 'pastırma', ad: 'Büyük Pastırma Savaşı' },

  // ---- İSTANBUL – ANKARA: tek yemeksiz husumet ----
  // Konu bir ürün değil, ŞEHRİN KENDİSİ. Baki'nin tarifi: *"İstanbul'un trafiği ve
  // kalabalığı, Ankara'nın romantize edilmesi; öte yandan Ankara'da deniz olmaması ve
  // İstanbul'un ekonomi, ulaşım vb.de daha gelişmiş olması."*
  //
  // "Büyük Şehir Savaşı" bu yüzden seçildi: ikisi de büyükşehir, yani ad hem sıfatı hem
  // unvanı birden okuyor. Payitaht/başkentlik elendi — kavga resmî unvanla ilgili değil,
  // "hangisi daha iyi şehir" ile ilgili.
  { ilA: '34', ilB: '06', konu: 'şehir üstünlüğü', ad: 'Büyük Şehir Savaşı' },
];
