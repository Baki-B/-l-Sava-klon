// ANA MENÜ FETİH DÖNGÜSÜ — sekiz durumun ÖNCEDEN hesaplanması.
// Çalıştırma:  node scripts/menu-seferi-uret.js
// Çıktı:       veri/menu-seferi.json
//
// NE İŞE YARIYOR. Ana menünün arkasındaki harita boş durmuyor: üç güç (Bursa · Antalya ·
// Erzurum) 81 ilin bağımsız olduğu haritayı yedi turda paylaşıyor, sonra baştan başlıyor.
// Menünün savaş hissini veren tek öğe bu (karar belgesi §6).
//
// ---- NİYE ÇALIŞMA ANINDA DEĞİL DE BURADA ----
// Yayılma hesabı 181 parça × komşuluk taraması × 7 tur. Telefonda her menü açılışında
// yapılacak iş değil; üstelik sonucu HER ZAMAN AYNI. Değişmeyen bir hesabı çalışma anına
// bırakmak, pil harcayıp aynı cevabı yeniden bulmak demek.
//
// ---- RASTGELELİK YOK (Baki'nin kuralı) ----
// Bir parçaya aynı turda iki güç birden ulaşabiliyor. Beraberliği SABİT SIRA bozuyor:
// Bursa → Antalya → Erzurum. Rastgele seçilseydi sefer her açılışta başka türlü gider,
// menüye ikinci kez bakan oyuncu "bir şeyler bozuk" hissederdi. Sefer bir animasyon,
// bir simülasyon değil: her seferinde aynı oynamalı.

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const parcaDosya = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'parcalar.json'), 'utf8'));
const PARCALAR = parcaDosya.parcalar;
const KOMSULUK = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'parca-komsuluk.json'), 'utf8'));

// Üç güç, SIRALI. Sıra hem beraberliği bozuyor hem de çıktıya yazılıyor —
// ekran tarafı hangi rengin kime ait olduğunu buradan öğreniyor.
const GUCLER = ['16', '07', '25']; // Bursa · Antalya · Erzurum
const GUC_KUMESI = new Set(GUCLER);

// Parça kimlikleri sıralı işleniyor. Beraberlik zaten güç sırasıyla bozuluyor ama
// çıktıdaki `degisenler` listelerinin de her üretimde aynı sırada olması isteniyor:
// dosya iki kez üretildiğinde satır satır aynı çıksın, gereksiz fark görünmesin.
const PARCA_IDLER = Object.keys(PARCALAR).sort();

// ---- CEPHE ----
// Komşularından en az biri BAŞKA sahipte olan parça cephededir; dişli konturla çizilir
// (karar belgesi §6 "Cephe"). Sabit bir çizgi değil: bloklar büyüdükçe cephe kendiliğinden
// içeri kayıyor, sonda üç güç arasındaki iki hatta iniyor.
//
// Başlangıç durumunda (81 il bağımsız) neredeyse HER parça cephede — doğrusu bu, çünkü
// o an gerçekten herkes herkesle sınır komşusu.
function cepheHesapla(sahiplik) {
  return PARCA_IDLER.filter((pid) =>
    (KOMSULUK[pid] || []).some((komsu) => sahiplik[komsu] !== sahiplik[pid])
  );
}

// ---- YAYILMA ----
// Bir tur: her güç, komşusu olan ve HİÇBİR GÜCE ait olmayan parçaların hepsini alır.
//
// ⚠ TUR BAŞI SAHİPLİĞİNDEN GENİŞLİYOR. Güç, o tur yeni aldığı parçalardan tekrar
// genişlemiyor — genişleseydi tek turda bütün haritayı yutardı ve döngü diye bir şey
// kalmazdı. Bu yüzden okuma `sahiplik`ten, yazma `yeni`ye.
function turIsle(sahiplik) {
  const yeni = {};
  for (const guc of GUCLER) {
    for (const pid of PARCA_IDLER) {
      if (sahiplik[pid] !== guc) continue;
      for (const komsu of KOMSULUK[pid] || []) {
        // Başka bir gücün toprağına dokunulmuyor (Baki'nin kuralı) ve bu turda
        // önceki güç tarafından alınmış parça geri alınmıyor (beraberlik = sabit sıra).
        if (GUC_KUMESI.has(sahiplik[komsu]) || yeni[komsu]) continue;
        yeni[komsu] = guc;
      }
    }
  }
  return yeni;
}

// ---- SEFER ----
// Durum 0: her parça kendi ilinin. Sonra harita paylaşılana kadar tur.
const sahiplik = {};
for (const pid of PARCA_IDLER) sahiplik[pid] = PARCALAR[pid].kod;

const durumlar = [{ ...sahiplik }];
const degisenler = [[]]; // durum 0'da el değiştiren yok
const cepheler = [cepheHesapla(sahiplik)];

// Üst sınır güvenlik kemeri: 181 parça varken 181 turdan fazlası ancak sonsuz döngüdür.
for (let tur = 1; tur <= PARCA_IDLER.length; tur++) {
  const yeni = turIsle(sahiplik);
  const alinan = Object.keys(yeni).sort();
  if (alinan.length === 0) break; // harita paylaşıldı
  for (const pid of alinan) sahiplik[pid] = yeni[pid];
  durumlar.push({ ...sahiplik });
  degisenler.push(alinan);
  cepheler.push(cepheHesapla(sahiplik));
}

// ---- ÖZET + DENETİM ----
const sonDagilim = {};
for (const pid of PARCA_IDLER) sonDagilim[sahiplik[pid]] = (sonDagilim[sahiplik[pid]] || 0) + 1;

const turSayisi = durumlar.length - 1;
const turBasina = degisenler.slice(1).map((d) => d.length);

console.log('SEFER — üç güç, sabit sıra ' + GUCLER.join(' → '));
console.log('  tur sayısı      : ' + turSayisi);
console.log('  tur başına alınan: ' + turBasina.join(' / '));
console.log('  son dağılım     : ' + GUCLER.map((g) => g + ':' + (sonDagilim[g] || 0)).join(' · '));
console.log('  cephe parça     : ' + cepheler.map((c) => c.length).join(' / '));

// Sefer bitmeden döngü kapanırsa menüde yarım kalmış bir harita döner durur. Sessizce
// geçilecek bir şey değil: haritada bir güce hiç ulaşamayan parça kaldı demektir.
const sahipsiz = PARCA_IDLER.filter((pid) => !GUC_KUMESI.has(sahiplik[pid]));
if (sahipsiz.length) {
  console.log(
    '\n✗ HATA: ' + sahipsiz.length + ' parça hiçbir güce ulaşmadı: ' + sahipsiz.join(', ')
  );
  process.exit(1);
}

// Karar belgesi §6'da yazan ve önizlemede Baki'nin onayladığı sonuç. Harita verisi
// değişirse (parça bölümlemesi, komşuluk) bu sayılar kayar; o zaman ÖNCE menü yeniden
// bakılır, sonra belgedeki sayılar güncellenir. Sessizce başka bir sefer akmaz.
const BEKLENEN = {
  turSayisi: 7,
  turBasina: [26, 37, 36, 34, 25, 10, 1],
  sonDagilim: { '16': 56, '07': 54, '25': 71 },
  cepheler: [180, 163, 136, 105, 77, 46, 37, 37],
};
const sapma = [];
if (turSayisi !== BEKLENEN.turSayisi)
  sapma.push('tur sayısı ' + turSayisi + ' (beklenen ' + BEKLENEN.turSayisi + ')');
if (turBasina.join(',') !== BEKLENEN.turBasina.join(','))
  sapma.push(
    'tur başına ' + turBasina.join('/') + ' (beklenen ' + BEKLENEN.turBasina.join('/') + ')'
  );
for (const g of GUCLER)
  if ((sonDagilim[g] || 0) !== BEKLENEN.sonDagilim[g])
    sapma.push(g + ' ' + (sonDagilim[g] || 0) + ' parça (beklenen ' + BEKLENEN.sonDagilim[g] + ')');
const cepheSay = cepheler.map((c) => c.length);
if (cepheSay.join(',') !== BEKLENEN.cepheler.join(','))
  sapma.push('cephe ' + cepheSay.join('/') + ' (beklenen ' + BEKLENEN.cepheler.join('/') + ')');

if (sapma.length) {
  console.log('\n⚠ ÖNİZLEMEDEN SAPMA (karar belgesi §6 ile tutmuyor):');
  for (const s of sapma) console.log('  · ' + s);
} else {
  console.log('\n✓ karar belgesi §6 ile birebir aynı');
}

fs.writeFileSync(
  path.join(KOK, 'veri', 'menu-seferi.json'),
  JSON.stringify({
    aciklama:
      'Ana menü fetih döngüsü — üç gücün (Bursa · Antalya · Erzurum) haritayı paylaştığı ' +
      turSayisi +
      ' turun önceden hesaplanmış hâli. scripts/menu-seferi-uret.js ile üretildi. ' +
      'Rastgelelik yok: sefer her açılışta birebir aynı gider.',
    guclerSirasi: GUCLER,
    turSayisi,
    sonDagilim,
    // durumlar[i] = i. turun SONUNDAKİ sahiplik. durumlar[0] = 81 il bağımsız.
    durumlar,
    // degisenler[i] = o turda EL DEĞİŞTİREN parçalar. Çizim yalnızca bunları
    // canlandırıyor (uygulama belgesi §5): 181 yol değil, tur başına ~26 yol.
    degisenler,
    // cepheler[i] = o durumda komşusu farklı sahipte olan parçalar; dişli konturla çizilir.
    cepheler,
  })
);
console.log('yazıldı: veri/menu-seferi.json');
