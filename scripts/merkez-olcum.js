// MERKEZ PARÇA ÖLÇÜMÜ (Görev 17 / Adım 1).
// Çalıştırma:  node scripts/merkez-olcum.js
//
// ┌─ ÖLÇÜT (YOL-HARITASI-v11 §17.1) ────────────────────────────────────────────────────┐
// │ "Fetih AZALSIN ama dünya KİLİTLENMESİN — 2026-08-12'de kırılan kilit (fetih 241 →   │
// │ 513) geri gelmemeli."                                                                │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// Merkez parçanın iki etkisi ayrı ayrı ölçülüyor ki hangisinin ne kadar katkı yaptığı
// görünsün: garnizon ağırlığı (`GARNIZON.MERKEZ_AGIRLIK`) ve savunma moral kalemi
// (`MERKEZ.MORAL_KALEMI`). Dört koşu = iki etki açık/kapalı.
//
// ⚠ ÖLÇÜM DEĞİŞTİRMEZ: `DENGE` geçici değiştirilip sonunda geri konuyor.
//
// Çıktı: veri/merkez-olcum.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { birimSayisi } = require('../src/oyun/ordu.js');
const { PARCALAR } = require('../src/oyun/veri.js');

const TOHUMLAR = [20260801, 20260802, 20260803, 20260901, 20260920];
const TUR = 40;

function dunyaOlc(tohum) {
  let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk: 'zor' });
  let fetih = 0;
  let merkezFethi = 0;
  // ---- ⚠ ASIL ÖLÇÜ BU: TAM İL FETHİ ----
  // Şikâyet "parça el değiştiriyor" değil, *"illerin %69'u en çok İKİ hamlede düşüyor"*du.
  // Ham fetih sayısı cephe salınımını da sayıyor ve merkez parça onu AZALTMIYOR (ölçüldü):
  // ilin toplam savunması değişmediği için ili almanın toplam bedeli de değişmiyor,
  // yalnızca sırası değişiyor. Tam il fethi, sorunun kendisini ölçen sayı.
  let ilFethi = 0;

  for (let i = 0; i < TUR; i++) {
    d = turuBitir(d);
    const r = d.sonTurRaporu;
    if (r && r.satirlar) {
      for (const sat of r.satirlar) {
        if (!sat.fethedildi) continue;
        fetih++;
        // Merkez parçanın el değiştirmesi ayrı sayılıyor: ilin kalbi gerçekten daha zor
        // mu düşüyor, yoksa yalnızca çevresi mi yavaşladı?
        if (sat.hedef && PARCALAR[sat.hedef] && PARCALAR[sat.hedef].merkez) merkezFethi++;
        if (sat.ilTamamlandi) ilFethi++;
      }
    }
  }

  const sahiplik = d.parcaSahipligi;
  const parcaSayisi = {};
  for (const pid of Object.keys(sahiplik)) {
    const s = sahiplik[pid];
    if (s) parcaSayisi[s] = (parcaSayisi[s] || 0) + 1;
  }
  const canli = Object.keys(parcaSayisi).length;
  const enBuyuk = Math.max(0, ...Object.values(parcaSayisi));

  let enBuyukYigin = 0;
  for (const pid of Object.keys(d.ordular || {})) {
    const n = birimSayisi(d.ordular[pid].birimler);
    if (n > enBuyukYigin) enBuyukYigin = n;
  }

  return { fetih, ilFethi, merkezFethi, canli, enBuyuk, enBuyukYigin };
}

function ort(liste, alan) {
  return liste.reduce((a, x) => a + x[alan], 0) / liste.length;
}

function kosu(etiket, agirlik, kalem) {
  const a1 = DENGE.GARNIZON.MERKEZ_AGIRLIK;
  const a2 = DENGE.MERKEZ.MORAL_KALEMI;
  DENGE.GARNIZON.MERKEZ_AGIRLIK = agirlik;
  DENGE.MERKEZ.MORAL_KALEMI = kalem;
  try {
    const s = TOHUMLAR.map(dunyaOlc);
    return {
      etiket,
      fetih: ort(s, 'fetih'),
      ilFethi: ort(s, 'ilFethi'),
      merkezFethi: ort(s, 'merkezFethi'),
      canli: ort(s, 'canli'),
      enBuyuk: ort(s, 'enBuyuk'),
      enBuyukYigin: ort(s, 'enBuyukYigin'),
    };
  } finally {
    DENGE.GARNIZON.MERKEZ_AGIRLIK = a1;
    DENGE.MERKEZ.MORAL_KALEMI = a2;
  }
}

const AGIRLIK = DENGE.GARNIZON.MERKEZ_AGIRLIK;
const KALEM = DENGE.MERKEZ.MORAL_KALEMI;

const kosular = [
  kosu('MERKEZ YOK (ikisi de kapalı)', 0, 0),
  kosu('yalnız garnizon ağırlığı', AGIRLIK, 0),
  kosu('yalnız moral kalemi', 0, KALEM),
  kosu('İKİSİ BİRDEN (bugünkü)', AGIRLIK, KALEM),
];

const taban = kosular[0];
function fark(a, b) {
  if (!a) return '—';
  const f = ((b - a) / a) * 100;
  return (f >= 0 ? '+' : '') + f.toFixed(1) + '%';
}
const s1 = (x) => x.toFixed(1);

let md = `# MERKEZ PARÇA ÖLÇÜMÜ

> Üretim: \`node scripts/merkez-olcum.js\` · ${TOHUMLAR.length} tohum × ${TUR} tur, zorluk **zor**.
> Sayılar tohumların ORTALAMASI. Bugünkü ayar: \`GARNIZON.MERKEZ_AGIRLIK = ${AGIRLIK}\` ·
> \`MERKEZ.MORAL_KALEMI = ${KALEM}\`.

## 1. İki etki ayrı ayrı

| Koşu | Parça fethi | **Tam il fethi** | Merkez fethi | Canlı aktör | En büyük yığın |
|---|---|---|---|---|---|
${kosular
  .map(
    (r) =>
      `| ${r.etiket} | ${s1(r.fetih)} | **${s1(r.ilFethi)}** | ${s1(r.merkezFethi)} | ${s1(r.canli)} | ${s1(r.enBuyukYigin)} |`
  )
  .join('\n')}

## 2. Tabana göre fark

| Koşu | Parça fethi | **Tam il fethi** | Canlı aktör | En büyük aktör |
|---|---|---|---|---|
${kosular
  .slice(1)
  .map(
    (r) =>
      `| ${r.etiket} | ${fark(taban.fetih, r.fetih)} | **${fark(taban.ilFethi, r.ilFethi)}** | ${fark(taban.canli, r.canli)} | ${fark(taban.enBuyuk, r.enBuyuk)} |`
  )
  .join('\n')}

**Ölçüt:** *fetih AZALSIN ama dünya KİLİTLENMESİN.*
- **Fetih** düşmeli — merkez parça işini yapıyorsa el değiştirme azalır.
- **Canlı aktör** çok YÜKSELİRSE dünya donmuş demektir: kimse kimseyi eleyemiyor.
- **En büyük yığın** şişerse ordular birikiyordur (2026-08-12'de kırılan silahlanma yarışı).
`;

fs.writeFileSync(path.join(__dirname, '..', 'veri', 'merkez-olcum.md'), md, 'utf8');

console.log('MERKEZ PARÇA ÖLÇÜMÜ');
for (const r of kosular) {
  console.log(
    '  ' +
      r.etiket.padEnd(30) +
      ' parça ' +
      s1(r.fetih).padStart(7) +
      ' · TAM İL ' +
      s1(r.ilFethi).padStart(6) +
      ' · canlı ' +
      s1(r.canli).padStart(5) +
      ' · yığın ' +
      s1(r.enBuyukYigin)
  );
}
console.log(
  '  FARK (ikisi birden): parça ' +
    fark(taban.fetih, kosular[3].fetih) +
    ' · TAM İL ' +
    fark(taban.ilFethi, kosular[3].ilFethi) +
    ' · canlı ' +
    fark(taban.canli, kosular[3].canli)
);
console.log('Yazıldı: veri/merkez-olcum.md');
