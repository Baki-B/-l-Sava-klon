// ROZET KAYDIRMASI — rozeti kendi şekline sığmayan birkaç yer (Görev 04 / Adım 5).
//
// Sorun: birkaç parça/il rozeti taşıyamayacak kadar ince. Görev belgesi §7.2 çözümü
// söylüyor: "rozeti elle belirlenmiş bir noktaya, parçanın dışına, denize doğru,
// ince bir çizgiyle parçaya bağlı" koy.
//
// KAYDIRMA EKRAN PİKSELİ CİNSİNDEN, harita birimi değil. Sebebi: rozet zaten haritayla
// büyümüyor. Kaydırma harita biriminde olsaydı yakınlaştırdıkça rozet parçasından
// giderek uzaklaşır, 7×'te 128 piksel öteye savrulurdu. Piksel cinsinden sabit tutunca
// bağlantı çizgisinin boyu ve açısı da her yakınlaştırmada aynı kalıyor.
//
// LİSTE NASIL ÇIKTI: `veri/rozet-katman-olcum.md` — katman sınırlarında (yakın 2.70×,
// orta 1.35×) rozeti hâlâ taşan şekiller. Her yön elle seçildi ve noktanın katmanın TÜM
// yakınlaştırma aralığı boyunca boş suya/boşluğa düştüğü betikle doğrulandı.
// (Çok yaklaşınca nokta kendi parçasının içine döner — sorun değil, orada zaten sığıyor.)
//
// Harita değişirse bu liste yeniden ölçülmeli: `node scripts/rozet-katman-olcum.js`

// Parça rozetleri (YAKIN katman, 2.70× ve üstü).
export const PARCA_KAYDIRMA = {
  // Gelibolu Yarımadası — iç çember 10.1, sığması için 2.83× gerekiyor.
  // Batıya, Ege'ye doğru. Yarımadanın batısı açık deniz, çizgi hiçbir yeri kesmiyor.
  '17-1': { dx: -24, dy: 0 },
  // Yalova — 8.6 ile haritanın en küçük parçası, 3.32× gerekiyor.
  // Kuzeybatıya, Marmara'ya doğru. Tam kuzey İstanbul'un Anadolu Yakası'na denk geliyor,
  // o yüzden çapraz.
  '77-1': { dx: -18, dy: -16 },
};

// İl rozetleri (ORTA katman, 1.35× – 2.70×).
export const IL_KAYDIRMA = {
  // Yalova ili tek parçalı, ölçüsü parçasıyla aynı — aynı yön.
  77: { dx: -18, dy: -16 },
  // Kilis — iç çember 13.6, sığması için 2.10× gerekiyor. Denizi yok; güneye,
  // Suriye tarafındaki boşluğa taşınıyor.
  79: { dx: 0, dy: 24 },
};

// Iğdır (1.36×) bilerek listede DEĞİL: yalnızca 1.35–1.36 arasındaki kıl payı şeritte
// taşıyor. Onun için kaydırma eklemek, rozeti hiç gerekmezken yerinden oynatırdı.
