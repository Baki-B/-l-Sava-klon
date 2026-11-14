// YAPAY ZEKÂNIN HESAP BÜTÇESİ — Görev 07 / Adım 2b.
// Çalıştırma:  node scripts/zeka-butce-olcum.js     → veri/zeka-butce-olcum.md
//
// SORU: 80 aktörün tur başına verdiği kararlar TELEFONDA bir kareye sığıyor mu?
//
// NEDEN KOD YAZILMADAN ÖNCE ÖLÇÜLÜYOR: tasarım §9.3 "bölünmüş hesaplama (time-slicing)"
// öneriyor ama bir sayı vermiyor. Gerekliyse zeka.js baştan öyle kurulmalı; gereksizse
// yazılmamalı — Görev 04 ve 05'te akıcılığın peşinden KOD YAZILDIKTAN SONRA koşulmuştu ve
// iki kez ele avuca sığmamıştı. Bu sefer sıra tersine çevrildi.
//
// KARAR EŞİĞİ: 60 kare/saniyede bir kare ≈ 16.7 ms. Tur başına toplam hesap bunu aşıyorsa
// bölünmüş hesaplama ZORUNLU, aşmıyorsa gereksiz.
//
// ---- HAMLE UZAYI (Soru 2 → Baki'nin cevabı A) ----
// Aktör başına: sahip olduğu her parça × o parçanın komşuları × KUVVET_ADAYLARI.
// Her aday hamle bir MUHAREBE SİMÜLASYONU ister (fayda formülündeki "üstünlük" terimi
// `muharebe.js`'in üstünlük oranından geliyor — yeniden tahmin yazılmıyor, §9.1).
// Ölçülen şey bu simülasyonun maliyeti.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { PARCALAR, KOMSULUK } = require('../src/oyun/veri.js');
const { muharebeTahmini } = require('../src/oyun/muharebe.js');
const { garnizonBirimleri } = require('../src/oyun/garnizon.js');

const PROJ = path.join(__dirname, '..');
const KARE_MS = 1000 / 60;

// ---- HAMLE UZAYININ BÜYÜKLÜĞÜ ----
const parcaIdler = Object.keys(PARCALAR);
const komsuSayilari = parcaIdler.map((pid) => (KOMSULUK[pid] || []).length);
const toplamKomsuluk = komsuSayilari.reduce((a, b) => a + b, 0);
const ortKomsu = toplamKomsuluk / parcaIdler.length;
const adaySayisi = DENGE.ZEKA.KUVVET_ADAYLARI.length;

// Oyunun BAŞINDAKİ en kötü hâl: her parça ayrı bir aktörün ve hepsi karar veriyor.
// Konsolidasyon ilerledikçe bağımsız aktör sayısı düşer (§9.3), yani bu bir ÜST SINIR.
const enCokHamle = toplamKomsuluk * adaySayisi;

// ---- TEK SİMÜLASYONUN MALİYETİ ----
// Gerçekçi girdiler: haritadaki gerçek garnizonlar. Uydurma ordularla ölçmek yanıltıcı
// olurdu — muharebenin süresi ordu büyüklüğüne ve kaç raunt sürdüğüne bağlı.
const ornekOrdular = parcaIdler.map((pid) => garnizonBirimleri(pid));
const araziler = parcaIdler.map((pid) => PARCALAR[pid].arazi);

function tekOlcum(tekrar) {
  const bas = process.hrtime.bigint();
  let sayac = 0;
  for (let i = 0; i < tekrar; i++) {
    const a = ornekOrdular[i % ornekOrdular.length];
    const b = ornekOrdular[(i * 7 + 3) % ornekOrdular.length];
    const r = muharebeTahmini({
      saldiran: { birimler: a },
      savunan: { birimler: b },
      arazi: araziler[i % araziler.length],
      moralBonuslari: { saldiran: 0, savunan: 1 },
    });
    if (r.kademe) sayac++;
  }
  const sure = Number(process.hrtime.bigint() - bas) / 1e6;
  return { sure, tekrar, birim: sure / tekrar, sayac };
}

// Isınma turu — JIT derleyicisi ilk çağrılarda yavaştır, ölçüme karışmasın.
tekOlcum(2000);

const olcumler = [tekOlcum(20000), tekOlcum(20000), tekOlcum(20000)];
const birimSure = Math.min(...olcumler.map((o) => o.birim));
const ortalamaSure = olcumler.reduce((a, o) => a + o.birim, 0) / olcumler.length;

const turSuresi = enCokHamle * birimSure;
const kareSayisi = turSuresi / KARE_MS;
const bolunmusGerekli = turSuresi > KARE_MS;

// ---- RAPOR ----
const f2 = (x) => x.toFixed(2);
const f4 = (x) => x.toFixed(4);

let md = '# YAPAY ZEKÂNIN HESAP BÜTÇESİ (Görev 07 / Adım 2b)\n\n';
md += '> Üretildi: `node scripts/zeka-butce-olcum.js` — ELLE DÜZENLEME.\n';
md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n\n';
md += 'Tasarım §9.3 bölünmüş hesaplama (time-slicing) öneriyor ama bir SAYI vermiyor.\n';
md += 'Gerekli mi değil mi — kod yazılmadan ölçüldü.\n\n';

md += '## SONUÇ\n\n';
md +=
  (bolunmusGerekli ? '**Bölünmüş hesaplama GEREKLİ.**' : '**Bölünmüş hesaplama GEREKSİZ.**') +
  ' Tur başına en kötü hâlde **' +
  f2(turSuresi) +
  ' ms**, bir kare ' +
  f2(KARE_MS) +
  ' ms.\n';
md +=
  'Yani turun kararları ' +
  (kareSayisi < 1
    ? 'tek karenin ' + f2(kareSayisi * 100) + "'ine sığıyor"
    : f2(kareSayisi) + ' kare sürüyor') +
  '.\n\n';

md += '| Ölçü | Değer |\n|---|---|\n';
md += '| Haritadaki parça | ' + parcaIdler.length + ' |\n';
md += '| Ortalama komşu sayısı | ' + f2(ortKomsu) + ' |\n';
md += '| Yönlü komşuluk (toplam kaynak→hedef çifti) | ' + toplamKomsuluk + ' |\n';
md += '| Kuvvet adayı (DENGE.ZEKA.KUVVET_ADAYLARI) | ' + adaySayisi + ' |\n';
md += '| **Tur başına en çok aday hamle** | **' + enCokHamle.toLocaleString('tr') + '** |\n';
md += '| Tek muharebe tahmininin süresi | **' + f4(birimSure) + ' ms** |\n';
md += '| Tur başına toplam hesap | **' + f2(turSuresi) + ' ms** |\n';
md += '| Bir kare (60 kare/sn) | ' + f2(KARE_MS) + ' ms |\n\n';

md += '## Bu sayı bir ÜST SINIRDIR\n\n';
md += 'Ölçüm oyunun EN KÖTÜ ânını varsayıyor: haritanın her parçası ayrı bir aktörün ve\n';
md += 'hepsi her komşusuna karşı her kuvvet adayını hesaplıyor. Gerçekte üç şey bu sayıyı\n';
md += 'düşürüyor:\n\n';
md += '1. **Doğal konsolidasyon (§9.3)** — oyun ilerledikçe 81 aktör birkaç imparatorluğa\n';
md += '   dönüşür; bağımsız karar veren birim sayısı düşer.\n';
md += '2. **İç parçalar hesaplanmaz** — düşmana sınırdaş olmayan parçadan saldırı adayı\n';
md += '   üretilmez; hamle uzayı gerçekte CEPHE uzunluğuyla orantılıdır, harita alanıyla değil.\n';
md += '3. **Boş hedefler simülasyon istemez** — savunanı olmayan parçaya yürümek muharebe\n';
md += '   değil; orada üstünlük terimi zaten 1.00.\n\n';

md += '## Ölçümün kuralları\n\n';
md += '- Muharebe tahmini oyunun kendi `muharebeTahmini` fonksiyonu — ayrı bir ölçüm\n';
md += '  motoru yazılmadı (§9.1: "ikinci bir tahmin yazılmayacak").\n';
md += '- Ordular haritadaki GERÇEK garnizonlardan alınıyor; uydurma ordularla ölçmek\n';
md += '  yanıltıcı olurdu, muharebenin süresi ordu büyüklüğüne ve raunt sayısına bağlı.\n';
md += '- Üç koşunun EN İYİSİ alınıyor (JIT ısınması ve zamanlayıcı gürültüsü ölçüme\n';
md += '  karışmasın); ortalama ' + f4(ortalamaSure) + ' ms, en iyi ' + f4(birimSure) + ' ms.\n';
md += '- Ölçüm geliştirme makinesinde yapıldı. **Telefon daha yavaştır**; sonuç bu yüzden\n';
md += '  kat kat pay bırakacak şekilde okunmalı — ' + f2(KARE_MS / turSuresi) + '× pay var.\n';

fs.writeFileSync(path.join(PROJ, 'veri', 'zeka-butce-olcum.md'), md, 'utf8');

console.log('YAPAY ZEKÂNIN HESAP BÜTÇESİ');
console.log(
  '  parça ' + parcaIdler.length + ' · ort. komşu ' + f2(ortKomsu) + ' · kuvvet adayı ' + adaySayisi
);
console.log('  en çok aday hamle : ' + enCokHamle.toLocaleString('tr'));
console.log('  tek tahmin        : ' + f4(birimSure) + ' ms');
console.log('  tur başına toplam : ' + f2(turSuresi) + ' ms   (bir kare ' + f2(KARE_MS) + ' ms)');
console.log(
  '  KARAR: bölünmüş hesaplama ' +
    (bolunmusGerekli ? 'GEREKLİ' : 'GEREKSİZ — ' + f2(KARE_MS / turSuresi) + '× pay var')
);
console.log('Yazıldı: veri/zeka-butce-olcum.md');
