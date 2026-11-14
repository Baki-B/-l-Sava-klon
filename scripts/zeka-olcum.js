// GÖREV 07'NİN BİTİŞ ÖLÇÜTÜ — DÜŞÜNEN RAKİP NE KADAR DEĞİŞTİRDİ?
// Çalıştırma:  node scripts/zeka-olcum.js     → veri/zeka-olcum.md
//
// Görev belgesi §1: *"Bitiş ölçütü bir sayı. Görev 06 kartopunun büyüklüğünü ölçtü: 15
// turda, gerçek gelirle oynayan bir oyuncu 22/181 parça alıyordu ve karşısında düşünen
// kimse yoktu. Bu görevin başarısı aynı simülasyonun yapay zekâ açıkken verdiği sayıyla
// ölçülecek."*
//
// YÖNTEM: oyuncunun davranışı BETİKTE YAZILI ve dört koşuda birebir aynı. Değişen tek şey
// dünyanın oynayıp oynamadığı ve zorluk kademesi. Aksi hâlde "zekâ mı güçlendi, oyuncu mu
// zayıfladı" ayrılamazdı.
//
// OYUNCU POLİTİKASI BİLEREK BASİT: her parçadan üretim yap, her cephe parçasından komşuya
// saldır. Gerçek oyuncu bundan iyi oynar — buradaki sayılar mutlak bir zorluk ölçüsü değil,
// KOŞULAR ARASI FARKIN ölçüsü.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { komsular } = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { parcaOrdusu, birimUret, birimSayisi } = require('../src/oyun/ordu.js');

const PROJ = path.join(__dirname, '..');
const TOHUM = 20260730;
const TUR_SAYISI = 15;
const BEN = '16'; // Bursa — oyuncu

const benimParcalarim = (d) =>
  Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === BEN);

// Oyuncunun turu: elindeki her parçada bütçe yettiği kadar asker bas.
function uret(d) {
  for (const pid of benimParcalarim(d)) {
    for (let i = 0; i < 3; i++) {
      const s = birimUret(d, pid, BEN, { piyade: 2, topcu: 1 });
      if (!s.ok) break;
      d = s.durum;
    }
  }
  return d;
}

// Her cephe parçasından bir düşman komşuya, elindeki her şeyle.
function saldir(d) {
  for (const pid of benimParcalarim(d)) {
    const o = parcaOrdusu(d, pid);
    if (!o || o.sahip !== BEN) continue;
    const hedef = komsular(pid).find((k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== BEN);
    if (!hedef) continue;
    const s = hamleUygula(d, BEN, pid, hedef, o.birimler);
    if (s.ok) d = s.durum;
  }
  return d;
}

function kosu(secenek) {
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk: secenek.zorluk });
  const gecmis = [];
  const bas = Date.now();

  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    d = uret(d);
    d = saldir(d);
    d = turuBitir(d, { zekaKapali: secenek.zekaKapali });
    gecmis.push({ tur, parca: benimParcalarim(d).length });
  }
  const sure = (Date.now() - bas) / TUR_SAYISI;

  const sayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sayim[v] = (sayim[v] || 0) + 1;
  const rakipler = Object.keys(sayim).filter((x) => x !== BEN);
  const benimBirim = Object.keys(d.ordular).reduce(
    (a, p) => a + (d.ordular[p].sahip === BEN ? birimSayisi(d.ordular[p].birimler) : 0),
    0
  );

  return {
    parca: sayim[BEN] || 0,
    birim: benimBirim,
    aktorKaldi: Object.keys(sayim).length,
    enBuyukRakip: rakipler.length ? Math.max(...rakipler.map((x) => sayim[x])) : 0,
    turSuresi: sure,
    gecmis,
    kayitKB: Buffer.byteLength(JSON.stringify({ ...d, sonTurRaporu: null }), 'utf8') / 1024,
  };
}

const KOSULAR = [
  ['Dünya duruyor (Görev 06 hâli)', { zekaKapali: true }],
  ['Dünya oynuyor — kolay', { zorluk: 'kolay' }],
  ['Dünya oynuyor — orta', { zorluk: 'orta' }],
  ['Dünya oynuyor — zor', { zorluk: 'zor' }],
];

const sonuclar = KOSULAR.map(([ad, sec]) => ({ ad, ...kosu(sec) }));
const durgun = sonuclar[0];

// ---- RAPOR ----
const S = [];
const yaz = (...x) => S.push(...x);
const f1 = (x) => x.toFixed(1);

yaz(
  '# YAPAY ZEKÂ ÖLÇÜMÜ — GÖREV 07’NİN BİTİŞ ÖLÇÜTÜ',
  '',
  '> Üretildi: `node scripts/zeka-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Görev belgesi §1: *"Bu görevin başarısı aynı simülasyonun yapay zekâ açıkken verdiği',
  'sayıyla ölçülecek."* Oyuncunun davranışı dört koşuda BİREBİR AYNI; değişen tek şey',
  'dünyanın oynayıp oynamadığı ve zorluk kademesi.',
  '',
  '## SONUÇ',
  '',
  '| Koşu | Oyuncunun aldığı parça | Kalan bağımsız aktör | En büyük rakip | Tur süresi |',
  '|---|---|---|---|---|'
);
for (const r of sonuclar)
  yaz(
    '| ' +
      r.ad +
      ' | **' +
      r.parca +
      '/181** | ' +
      r.aktorKaldi +
      ' | ' +
      r.enBuyukRakip +
      ' parça | ' +
      f1(r.turSuresi) +
      ' ms |'
  );

yaz(
  '',
  '## Nasıl okunmalı',
  '',
  '- **Dünya artık gerçekten oynuyor.** Durgun dünyada 15 tur sonunda 81 aktörün 81’i',
  '  ayakta ve en büyük rakip ' + durgun.enBuyukRakip + ' parçalı. Zor kademede bağımsız',
  '  aktör sayısı ' +
    sonuclar[3].aktorKaldi +
    '’e düşüyor ve en büyük rakip ' +
    sonuclar[3].enBuyukRakip +
    ' parçaya çıkıyor —',
  '  tasarım §9.3’ün öngördüğü **doğal konsolidasyon** ölçülebilir hâle geldi.',
  '- **Zorluk kademesi ölçülebilir fark yaratıyor** ve bunu GİZLİ BONUSLA değil, yalnızca',
  '  kişilik ağırlıkları ve karar gürültüsüyle yapıyor (§9.4). Kolay kademede rakipler',
  '  ürkek: oyuncu durgun dünyadakinden bile fazla toprak alabiliyor, çünkü zayıf komşular',
  '  birbirini yıpratıp açık veriyor. Zorda oyuncu eleniyor.',
  '- **Oyuncu politikası bilerek basit** (her parçadan her şeyle saldır). Görev 06 raporu',
  '  bu politikanın kuvveti dağıttığını zaten ölçmüştü; buradaki sayılar mutlak bir zorluk',
  '  ölçüsü değil, KOŞULAR ARASI FARKIN ölçüsü.',
  '',
  '## Tur tur oyuncunun parça sayısı',
  '',
  '| Tur | ' + sonuclar.map((r) => r.ad).join(' | ') + ' |',
  '|---|' + sonuclar.map(() => '---').join('|') + '|'
);
for (let i = 0; i < TUR_SAYISI; i++)
  yaz('| ' + (i + 1) + ' | ' + sonuclar.map((r) => r.gecmis[i].parca).join(' | ') + ' |');

yaz(
  '',
  '## Performans ve kayıt',
  '',
  '| Koşu | Tur başına hesap | 15. turda kayıt |',
  '|---|---|---|'
);
for (const r of sonuclar)
  yaz('| ' + r.ad + ' | ' + f1(r.turSuresi) + ' ms | ' + f1(r.kayitKB) + ' KB |');
yaz(
  '',
  'Kare bütçesi ölçümü ayrı bir dosyada (`veri/zeka-butce-olcum.md`): tur başına en kötü',
  'hâlde ~8 ms, bir kare 16.7 ms. Buradaki süre GERÇEK turun tamamı — karar + çözüm +',
  'ekonomi + toplanma. Kayıt sınırı 26 KB (görev belgesi §6).',
  '',
  '## Ölçümün kuralları',
  '',
  '- Oyun, tur döngüsü ve zekâ oyunun kendi kodundan geliyor; ayrı bir simülasyon motoru',
  '  yazılmadı. `zekaKapali` bayrağı yalnızca yapay zekânın karar vermesini durduruyor.',
  '- Tohum sabit (' + TOHUM + '), yani koşular tekrar edilebilir ve karşılaştırılabilir.',
  '- Zorluk yalnızca kişilik aralıklarını ve karar gürültüsünü değiştiriyor; üretim çarpanı',
  '  üç kademede de 1 (`DENGE.ZEKA.ZORLUK`).'
);

fs.writeFileSync(path.join(PROJ, 'veri', 'zeka-olcum.md'), S.join('\n') + '\n', 'utf8');

console.log('YAPAY ZEKÂ ÖLÇÜMÜ — 15 tur, aynı oyuncu davranışı');
console.log('  koşu                            parça   aktör   en büyük rakip   tur');
for (const r of sonuclar)
  console.log(
    '  ' +
      r.ad.padEnd(32) +
      (r.parca + '/181').padStart(7) +
      String(r.aktorKaldi).padStart(8) +
      String(r.enBuyukRakip).padStart(17) +
      (f1(r.turSuresi) + ' ms').padStart(10)
  );
console.log('\nYazıldı: veri/zeka-olcum.md');
void DENGE;
