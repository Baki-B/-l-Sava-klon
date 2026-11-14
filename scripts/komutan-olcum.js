// KOMUTAN ÖLÇÜMÜ — komutan dünyayı ne kadar değiştiriyor (Görev 16 / Adım 7).
// Çalıştırma:  node scripts/komutan-olcum.js
//
// ┌─ ÜÇ ÖLÇÜM BORCU KAPANIYOR ──────────────────────────────────────────────────────────┐
// │ 1. `KOMUTAN.MORAL_KALEMI` (Adım 4) hiç ölçülmemişti.                                 │
// │ 2. `KOMUTAN.BEKLEME: 3` seçilirken "Adım 7'de bakılacak" diye not düşülmüştü.        │
// │ 3. Yetenekler (Adım 5) dengeye dokunuyor ama etkisi yalnızca TAHMİN edilmişti.       │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// YÖNTEM: aynı tohumla iki dünya koşuluyor — `DENGE.KOMUTAN.ACIK` kapalı ve açık.
// Aradaki fark komutanın katkısıdır. Oyuncu YOK: bu ölçüm dünyayı ölçüyor, oyuncunun
// kartopunu değil (onun betiği `denge-simulasyonu.js`).
//
// ⚠ OYUNCU NEDEN YOK: komutan yeteneği oyuncuya da botlara da aynı kapıdan geliyor
// (`komutanAta`). Botların birbirine karşı oynadığı dünya, yeteneğin dengeye katkısını
// oyuncunun oynama biçiminden BAĞIMSIZ gösteriyor. Oyuncunun hissi ancak telefonda
// ölçülür ve o borç Baki'de (`docs/YAYIN-KONTROL.md` §5/1).
//
// ⚠ ÖLÇÜM DEĞİŞTİRMEZ: betik `DENGE`yi geçici olarak değiştirip SONUNDA geri koyuyor.
// `denge.js` dosyasına dokunulmuyor.
//
// Çıktı: veri/komutan-olcum.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { birimSayisi } = require('../src/oyun/ordu.js');

const TOHUMLAR = [20260801, 20260802, 20260803, 20260901, 20260920];
const TUR = 40;

// Bir dünyayı TUR tur koşturup özetini çıkarır.
function dunyaOlc(tohum) {
  let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk: 'zor' });

  let komutanDusmesi = 0;
  let cezaliTurToplami = 0;
  let oncekiSahada = {};

  for (let i = 0; i < TUR; i++) {
    d = turuBitir(d);

    const k = d.komutanlar || {};
    for (const id of Object.keys(k)) {
      const sahada = !!k[id].parcaId;
      // ---- ⚠ DÜŞME "SAHADAN ÇIKMA" İLE SAYILIYOR, BEKLEME İLE DEĞİL ----
      //
      // İlk yazım `bekleme` 0'dan büyüğe çıkışını sayıyordu ve BEKLEME=1'de HİÇBİR ŞEY
      // göremiyordu: `komutanDustu` beklemeyi 1 yazıyor, aynı turun sonunda
      // `komutanTuruBitir` onu 0'a indiriyor — örnekleyici tur sonunda baktığı için ceza
      // hiç görünmüyordu ve tablo "0 düşme" diye yalan söylüyordu.
      //
      // Sahadan çıkma bu tuzağa düşmüyor: komutan düştüğünde `parcaId` null oluyor ve
      // yeniden atanana kadar null kalıyor.
      if (oncekiSahada[id] && !sahada) komutanDusmesi++;
      if ((k[id].bekleme || 0) > 0) cezaliTurToplami++;
      oncekiSahada[id] = sahada;
    }
  }

  // Dünyanın hâli.
  const sahiplik = d.parcaSahipligi;
  const parcaSayisi = {};
  for (const pid of Object.keys(sahiplik)) {
    const s = sahiplik[pid];
    if (!s) continue;
    parcaSayisi[s] = (parcaSayisi[s] || 0) + 1;
  }
  const canli = Object.keys(parcaSayisi).length;
  const enBuyuk = Math.max(0, ...Object.values(parcaSayisi));

  // Sahadaki toplam kuvvet — yığınlar şişiyor mu?
  let toplamBirim = 0;
  let enBuyukYigin = 0;
  for (const pid of Object.keys(d.ordular || {})) {
    const n = birimSayisi(d.ordular[pid].birimler);
    toplamBirim += n;
    if (n > enBuyukYigin) enBuyukYigin = n;
  }

  return { canli, enBuyuk, toplamBirim, enBuyukYigin, komutanDusmesi, cezaliTurToplami };
}

function ortalama(liste, alan) {
  return liste.reduce((a, x) => a + x[alan], 0) / liste.length;
}

function kosu(etiket, acik) {
  const asil = DENGE.KOMUTAN.ACIK;
  DENGE.KOMUTAN.ACIK = acik;
  try {
    const sonuclar = TOHUMLAR.map(dunyaOlc);
    return {
      etiket,
      canli: ortalama(sonuclar, 'canli'),
      enBuyuk: ortalama(sonuclar, 'enBuyuk'),
      toplamBirim: ortalama(sonuclar, 'toplamBirim'),
      enBuyukYigin: ortalama(sonuclar, 'enBuyukYigin'),
      komutanDusmesi: ortalama(sonuclar, 'komutanDusmesi'),
      cezaliTurToplami: ortalama(sonuclar, 'cezaliTurToplami'),
      sonuclar,
    };
  } finally {
    DENGE.KOMUTAN.ACIK = asil;
  }
}

// Bekleme süresinin etkisi: komutan ne kadar süre sahada olmuyor?
function beklemeTaramasi() {
  const asil = DENGE.KOMUTAN.BEKLEME;
  const satirlar = [];
  try {
    for (const b of [1, 2, 3, 5]) {
      DENGE.KOMUTAN.BEKLEME = b;
      const r = kosu('bekleme ' + b, true);
      satirlar.push({ bekleme: b, ...r });
    }
  } finally {
    DENGE.KOMUTAN.BEKLEME = asil;
  }
  return satirlar;
}

const kapali = kosu('KOMUTAN KAPALI', false);
const acik = kosu('KOMUTAN AÇIK', true);
const bekleme = beklemeTaramasi();

function yuzdeFark(a, b) {
  if (!a) return '—';
  const f = ((b - a) / a) * 100;
  return (f >= 0 ? '+' : '') + f.toFixed(1) + '%';
}

function sayi(x) {
  return x.toFixed(1);
}

const satir = (r) =>
  `| ${r.etiket} | ${sayi(r.canli)} | ${sayi(r.enBuyuk)} | ${sayi(r.toplamBirim)} | ${sayi(r.enBuyukYigin)} |`;

let md = `# KOMUTAN ÖLÇÜMÜ

> Üretim: \`node scripts/komutan-olcum.js\` · ${TOHUMLAR.length} tohum × ${TUR} tur, zorluk **zor**.
> Sayılar tohumların ORTALAMASI.

## 1. Komutan dünyayı ne kadar değiştiriyor

| Koşu | Canlı aktör | En büyük aktör (parça) | Sahadaki birlik | En büyük yığın |
|---|---|---|---|---|
${satir(kapali)}
${satir(acik)}
| **fark** | ${yuzdeFark(kapali.canli, acik.canli)} | ${yuzdeFark(kapali.enBuyuk, acik.enBuyuk)} | ${yuzdeFark(kapali.toplamBirim, acik.toplamBirim)} | ${yuzdeFark(kapali.enBuyukYigin, acik.enBuyukYigin)} |

**Okuma kılavuzu:**
- **Canlı aktör** düşerse dünya hızlanmış (daha çok eleme) demektir.
- **En büyük aktör** çok büyürse kartopu güçlenmiş demektir — komutan güçlüyü daha da
  güçlendiriyorsa burada görünür.
- **En büyük yığın** şişerse ordular birikiyordur (2026-08-12'de kırılan silahlanma yarışı).

## 2. Bekleme cezası (\`KOMUTAN.BEKLEME\`)

Komutanın ordusu bozulunca kaç tur atanamadığı. Bugünkü değer **${DENGE.KOMUTAN.BEKLEME}**.

| Bekleme | Komutan düşmesi (${TUR} turda) | Cezalı geçen tur | Canlı aktör | En büyük aktör |
|---|---|---|---|---|
${bekleme
  .map(
    (r) =>
      `| **${r.bekleme}** | ${sayi(r.komutanDusmesi)} | ${sayi(r.cezaliTurToplami)} | ${sayi(r.canli)} | ${sayi(r.enBuyuk)} |`
  )
  .join('\n')}

**Ölçüt:** ceza hissedilmeli ama komutanı oyundan çıkarmamalı. "Cezalı geçen tur" toplamı
komutan sayısına göre çok büyükse komutan çoğu zaman sahada değil demektir.

## 3. Tohum tohum döküm (komutan AÇIK)

| Tohum | Canlı | En büyük | Birlik | En büyük yığın | Komutan düşmesi |
|---|---|---|---|---|---|
${acik.sonuclar
  .map(
    (r, i) =>
      `| ${TOHUMLAR[i]} | ${r.canli} | ${r.enBuyuk} | ${r.toplamBirim} | ${r.enBuyukYigin} | ${r.komutanDusmesi} |`
  )
  .join('\n')}
`;

const hedef = path.join(__dirname, '..', 'veri', 'komutan-olcum.md');
fs.writeFileSync(hedef, md, 'utf8');

console.log('KOMUTAN ÖLÇÜMÜ');
console.log('  kapalı → canlı ' + sayi(kapali.canli) + ' · en büyük ' + sayi(kapali.enBuyuk));
console.log('  açık   → canlı ' + sayi(acik.canli) + ' · en büyük ' + sayi(acik.enBuyuk));
console.log(
  '  fark   → canlı ' +
    yuzdeFark(kapali.canli, acik.canli) +
    ' · en büyük ' +
    yuzdeFark(kapali.enBuyuk, acik.enBuyuk) +
    ' · yığın ' +
    yuzdeFark(kapali.enBuyukYigin, acik.enBuyukYigin)
);
console.log('Yazıldı: veri/komutan-olcum.md');
