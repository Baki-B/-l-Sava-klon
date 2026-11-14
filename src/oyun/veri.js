// OYUN VERİSİ — oyun mantığının okuduğu JSON dosyaları tek kapıdan geçer.
//
// Bu dosya bilerek CommonJS (`require` / `module.exports`) yazıldı:
// telefondaki paketleyici (Metro) da, testleri çalıştıran Node da aynı dosyayı
// sorunsuz okuyabilsin diye. JSON'u modern `import` ile almak Node tarafında
// fazladan sözdizimi istiyor; bu yol her iki tarafta da çalışıyor.
//
// Buradan gelen veri SALT OKUNURDUR — oyun durumu bunları değiştirmez, sadece okur.

const iller = require('../../veri/iller.json');
const parcalar = require('../../veri/parcalar.json');
const parcaKomsuluk = require('../../veri/parca-komsuluk.json');

// DIŞA AKTARIMLAR TEK TEK YAZILIR, `module.exports = { ... }` KULLANILMAZ.
// Sebebi (2026-07-27'de KOMSULUK eklenirken çıktı): ESM tarafındaki `import { X }`,
// CommonJS bir dosyanın adlarını Node'un METİN TARAYICISIYLA bulur. Nesne biçiminde
// tarayıcı alanların bir kısmını göremiyor — `ILLER` ve `PARCALAR` görünürken `KOMSULUK`
// "böyle bir dışa aktarım yok" diye patlıyordu. `exports.X = ...` biçimi hepsini gösteriyor.

// il kodu -> { ad, bolge, arazi, parcaSayisi, statlar }
exports.ILLER = iller;

// parça kimliği -> { kod, il, ad, arazi, nufus, ekonomi, renkIl, yol }
exports.PARCALAR = parcalar.parcalar;

// parça kimliği -> sınırdaş parça kimlikleri (469 çift).
// HAREKETİN TEK KAYNAĞI BUDUR (§7): ordu yalnızca sınırdaş parçaya gidebilir. İl komşuluğu
// (`veri/komsuluk.json`) bir hareket kuralı DEĞİLDİR — iki il komşu olsa da parçaları
// sınırdaş olmayabilir.
exports.KOMSULUK = parcaKomsuluk;

// PARÇANIN TAM ADI — cümlede ve listede (Görev 21 · Baki: "İstanbul Anadolu'yu aldım").
// 181 parçanın 112'sinin adı ilini içermiyor ("Anadolu Yakası", "Kuzeybatı", "Çukurova
// Kenti"); tek başına "Kuzeybatı savunması dayanamadı" hangi il olduğunu söylemiyordu. Ad
// ilini zaten içeriyorsa olduğu gibi ("Ankara Batı", "Yalova"), içermiyorsa önüne il gelir
// ("İstanbul Anadolu Yakası", "Ankara Kuzeybatı"). Bölge panelinin başlığı gibi ilin ayrıca
// yazdığı yerlerde çıplak ad kalır.
exports.parcaTamAdi = function parcaTamAdi(pid) {
  const p = parcalar.parcalar[pid];
  if (!p) return pid;
  return p.ad.includes(p.il) ? p.ad : p.il + ' ' + p.ad;
};
