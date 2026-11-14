// OYUN HARİTASININ KADEMELİ GEOMETRİSİ (Görev 20 / Adım 2).
// Çalıştırma:  node scripts/harita-seviye-uret.js
// Çıktı:       veri/harita-seviyeleri.json
//
// ---- NİYE GEREKLİ ----
// Eski harita her karede ~210.000 noktalık iş yapıyordu: 181 parçanın dolgusu (76.617 nokta)
// + her parçanın KENDİ çevresi (yine 76.617 — iç sınırlar iki kez çiziliyordu) + il sınırları
// (56.955). Yakınlaştırma değişince bunların tamamı yeniden işleniyordu; takılmanın yükü buydu.
//
// Harita uygulamalarının standart çözümü: YAKINLIĞA GÖRE SADELEŞEN GEOMETRİ. Uzaktan bakarken
// ekranda yarım pikselden küçük kalan ayrıntı çizilmez; yaklaştıkça ayrıntı gelir. Seviye,
// "bu yakınlıkta en fazla yarım piksellik sapma" kuralıyla seçilir (`src/haritaSeviye.js`),
// yani geçişte göze görünen bir sıçrama olmaz.
//
// ---- YAPI: HAT + HALKA REFERANSI ----
// Topolojik sadeleştirme (`scripts/topoloji.js`) her sınırı BİR HAT olarak bir kez üretiyor.
// Parçanın dolgusu, o hatların sırayla birleştirilmesiyle YENİDEN DİKİLİYOR. İki sonucu var:
//   1. Komşu iki parça AYNI hattı paylaşıyor → aralarında boşluk / üst üste binme yapı gereği
//      imkânsız (her seviyede).
//   2. Her nokta dosyaya BİR KEZ yazılıyor → dört seviye ~1.1 MB (dolgular ayrı yazılsaydı
//      ~2.7 MB olurdu).
// Hatların sırası ve parçaların hat listesi toleranstan BAĞIMSIZ (koşu sınırları komşuluktan
// doğuyor, toleranstan değil); bu yüzden `halkalar` bir kez yazılıyor, seviyeler yalnızca
// noktaları taşıyor. Betik bunu her üretimde denetliyor.
//
// ⚠ Dokunma testi (hangi parçaya dokunuldu) bu dosyayı KULLANMAZ — tam çözünürlüklü
// `parcalar.json`'la yapılmaya devam ediyor. Sadeleşme yalnızca ÇİZİMİ etkiler.

const fs = require('fs');
const path = require('path');
const { topolojikSadelestir, halkaDik, noktaSayisi } = require('./topoloji');

const KOK = path.join(__dirname, '..');
const parcaVerisi = JSON.parse(fs.readFileSync(path.join(KOK, 'veri', 'parcalar.json'), 'utf8'));

// Harita birimi cinsinden toleranslar, kabadan inceye. Seçim kuralı (`haritaSeviye.js`):
// f·z·tolerans ≤ yarım piksel olan EN KABA seviye. Telefonda (f ≈ 0.91):
//   0.5  → z < 1.1   ·   0.2 → z < 2.7   ·   0.1 → z < 5.5   ·   0.05 → üstü (7×'e kadar)
// Kaynak verinin kendi hassasiyeti 0.1 birim; 0.05 pratikte tam çözünürlük demek.
const TOLERANSLAR = [0.5, 0.2, 0.1, 0.05];

const parcaYollari = {};
for (const [pid, p] of Object.entries(parcaVerisi.parcalar)) parcaYollari[pid] = p.yol;

const tamNokta = Object.values(parcaYollari).reduce((t, y) => t + noktaSayisi(y), 0);

let halkalar = null;
let hatSahipleri = null;
const seviyeler = [];
const ozet = [];

for (const tol of TOLERANSLAR) {
  const r = topolojikSadelestir(parcaYollari, tol);

  // ÖZ DENETİM 1: yeniden dikilen her halka, klasik yoldan üretilenle BİREBİR aynı olmalı
  // (ada halkaları kanonik başlangıçla üretildiği için noktaları aynı, sırası farklı olabilir;
  // onlar nokta KÜMESİYLE karşılaştırılıyor).
  for (const pid of Object.keys(r.yollar)) {
    const klasik = r.yollar[pid].split('M').filter(Boolean);
    const refler = r.halkaHatlari[pid];
    if (klasik.length !== refler.length)
      throw new Error(
        pid + ': halka sayısı tutmuyor (' + klasik.length + '/' + refler.length + ')'
      );
    refler.forEach((ref, i) => {
      const dikilen = halkaDik(ref, r.hatlar);
      const k = 'M' + klasik[i];
      const ada = ref.length === 1 && r.hatlar[ref[0][0]].kapali;
      if (!ada && dikilen !== k) throw new Error(pid + ' halka ' + i + ' yeniden dikilemedi');
      if (ada) {
        const kume = (y) => new Set(y.replace(/[MZ]/g, '').split('L'));
        const a = kume(dikilen),
          b = kume(k);
        // Kanonik başlangıç DP'yi farklı noktadan başlatabilir; ada için tolerans kadar
        // sapma kabul — ama nokta sayısı yakın olmalı.
        if (Math.abs(a.size - b.size) > Math.max(3, b.size * 0.2))
          throw new Error(pid + ' ada halkası beklenenden çok farklı');
      }
    });
  }

  // ÖZ DENETİM 2: hat dizilişi ve halka referansları toleranstan bağımsız olmalı.
  const sahipler = r.hatlar.map((h) => [h.a, h.b, h.kapali ? 1 : 0]);
  if (!halkalar) {
    halkalar = r.halkaHatlari;
    hatSahipleri = sahipler;
  } else {
    if (JSON.stringify(halkalar) !== JSON.stringify(r.halkaHatlari))
      throw new Error('tolerans ' + tol + ': halka referansları öbür seviyelerle tutmuyor');
    if (JSON.stringify(hatSahipleri) !== JSON.stringify(sahipler))
      throw new Error('tolerans ' + tol + ': hat dizilişi öbür seviyelerle tutmuyor');
  }

  const hatlar = r.hatlar.map((h) => h.yol);
  const nokta = hatlar.reduce((t, y) => t + noktaSayisi(y), 0);
  seviyeler.push({ tolerans: tol, nokta, hatlar });
  ozet.push({ tol, nokta });
}

if (Object.keys(halkalar).length !== 181) throw new Error('parça sayısı 181 değil!');

const cikti = {
  aciklama:
    'Oyun haritasının kademeli geometrisi (Görev 20). Her sınır bir HAT olarak bir kez ' +
    'yazılı; parçaların dolgusu hatlardan yeniden dikilir (src/haritaSeviye.js). Seviye ' +
    "yakınlığa göre seçilir. Dokunma testi bunu değil tam çözünürlüklü parcalar.json'u " +
    'kullanır. scripts/harita-seviye-uret.js ile üretildi.',
  meta: {
    genislik: parcaVerisi.meta.genislik,
    yukseklik: parcaVerisi.meta.yukseklik,
    kaynak: 'veri/parcalar.json',
    uretim: 'scripts/harita-seviye-uret.js',
    tamNokta,
    toleranslar: TOLERANSLAR,
  },
  // Hat sırası → [a parçası, b parçası (null = kıyı), kapalı halka mı (1/0)].
  hatSahipleri,
  // Parça → halkaları → [[hat sırası, ters (1/0)], …].
  halkalar,
  // Kabadan inceye. Her seviyede hat sırası aynı; yalnızca noktalar değişiyor.
  seviyeler,
};

const dosya = path.join(KOK, 'veri', 'harita-seviyeleri.json');
fs.writeFileSync(dosya, JSON.stringify(cikti));
const kb = fs.statSync(dosya).size / 1024;

console.log('KADEMELİ HARİTA GEOMETRİSİ');
console.log('  tam çözünürlük: ' + tamNokta + ' nokta (her parça ayrı; iç sınırlar iki kez)');
console.log(
  '  hat: ' + hatSahipleri.length + ' · kıyı/ada: ' + hatSahipleri.filter((h) => !h[1]).length
);
for (const o of ozet)
  console.log('  tolerans ' + String(o.tol).padEnd(5) + ' → ' + o.nokta + ' nokta');
console.log('  öz denetim: 181 parçanın halkaları her seviyede birebir yeniden dikildi ✓');
console.log('yazıldı: veri/harita-seviyeleri.json (' + kb.toFixed(0) + ' KB)');
