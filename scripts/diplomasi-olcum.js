// DİPLOMASİ ÖLÇÜMÜ — İTTİFAK DOYGUNLUĞU (Görev 09 / Adım 3).
// Çalıştırma:  node scripts/diplomasi-olcum.js
//
// ---- BU GÖREVİN OYUNU BOZABİLECEĞİ TEK YER (görev belgesi §10/6) ----
//
// "Herkes herkesle anlaşırsa savaş durur ve oyun donar." Belge bunu Adım 3'te, KOD
// TAMAMLANMADAN ölçmeyi şart koşmuştu. İlk koşu doygunluğu ANINDA gösterdi: zor kademede
// hayatta kalan 27 aktörün 26'sı tek bir ittifak bloğundaydı.
//
// ---- SAVAŞ ÖLÇÜSÜ "ETKİN SAVAŞ HALİ" DEĞİL, GERÇEK MUHAREBE ----
//
// İlk denemede "etkin savaş sayısı" ölçüldü ve ölçüm YALAN SÖYLEDİ: diplomasi kapalıyken
// savaş hali diye bir şey YOK, yani sayı tanım gereği 0 çıkıyor ve "diplomasi savaşı
// artırmış" gibi görünüyordu. Doğru ölçü tur raporundaki MUHAREBE SATIRLARI — o sayı
// diplomasiden bağımsız ve iki rejimde de aynı şeyi sayıyor.
//
// (Görev 08'in dersinin aynısı: ölçüt de yanlış olabilir, önce ölçütü sına.)
//
// Çıktı: veri/diplomasi-olcum.md

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { iliskiler, muttefikler } = require('../src/oyun/diplomasi.js');

const PROJ = path.join(__dirname, '..');
const TOHUMLAR = [20260801, 20260802, 20260803];
const TUR = 30;
const KADEMELER = ['kolay', 'orta', 'zor'];

// En büyük ittifak BLOĞU — bağlı bileşen. Tek tek ittifak sayısı yanıltıcı: 10 ayrı
// ikili ittifak zararsız, 10 aktörlük tek blok haritayı dondurur.
function enBuyukBlok(durum) {
  const tablo = iliskiler(durum);
  const komsu = {};
  for (const k of Object.keys(tablo)) {
    if (tablo[k].tip !== 'ittifak') continue;
    const [a, b] = k.split('|');
    (komsu[a] = komsu[a] || []).push(b);
    (komsu[b] = komsu[b] || []).push(a);
  }
  let en = 0;
  const gorulen = new Set();
  for (const s of Object.keys(komsu)) {
    if (gorulen.has(s)) continue;
    let n = 0;
    const yigin = [s];
    gorulen.add(s);
    while (yigin.length) {
      const x = yigin.pop();
      n++;
      for (const y of komsu[x] || [])
        if (!gorulen.has(y)) {
          gorulen.add(y);
          yigin.push(y);
        }
    }
    en = Math.max(en, n);
  }
  return en;
}

function kosu({ acik, zorluk, tohum }) {
  const asil = DENGE.DIPLOMASI.ACIK;
  DENGE.DIPLOMASI.ACIK = acik;
  try {
    let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk });
    let muharebe = 0;
    let fetih = 0;
    let kurulanIttifak = 0;
    for (let t = 0; t < TUR; t++) {
      d = turuBitir(d);
      const r = d.sonTurRaporu;
      if (!r) continue;
      for (const s of r.satirlar) {
        if (s.tip === 'muharebe') muharebe++;
        if (s.fethedildi) fetih++;
        if (s.tip === 'diplomasi' && s.tip2 === undefined && s.a) kurulanIttifak++;
      }
    }
    const canli = new Set(Object.values(d.parcaSahipligi));
    const tablo = iliskiler(d);
    let ittifakli = 0;
    for (const id of canli) if (muttefikler(d, id).length > 0) ittifakli++;
    return {
      muharebe,
      fetih,
      kurulanIttifak,
      canli: canli.size,
      ittifakli,
      etkinIttifak: Object.values(tablo).filter((x) => x.tip === 'ittifak').length,
      blok: enBuyukBlok(d),
      ittifakliOran: canli.size ? ittifakli / canli.size : 0,
    };
  } finally {
    DENGE.DIPLOMASI.ACIK = asil;
  }
}

function ortalama(liste, alan) {
  return liste.reduce((a, x) => a + x[alan], 0) / liste.length;
}

function kademeOlc(zorluk) {
  const kapali = TOHUMLAR.map((tohum) => kosu({ acik: false, zorluk, tohum }));
  const acik = TOHUMLAR.map((tohum) => kosu({ acik: true, zorluk, tohum }));
  return {
    zorluk,
    muharebeKapali: ortalama(kapali, 'muharebe'),
    muharebeAcik: ortalama(acik, 'muharebe'),
    fetihKapali: ortalama(kapali, 'fetih'),
    fetihAcik: ortalama(acik, 'fetih'),
    ittifakliOran: ortalama(acik, 'ittifakliOran'),
    blok: ortalama(acik, 'blok'),
    canli: ortalama(acik, 'canli'),
    etkinIttifak: ortalama(acik, 'etkinIttifak'),
  };
}

// ---- SAĞLIK ÖLÇÜTLERİ (görev belgesi §Adım 3/a) ----
function saglikli(k) {
  return {
    // "Tur başına savaş sayısı, diplomasi açık/kapalı → belirgin düşüş YOK"
    savasDurmadi: k.muharebeAcik >= k.muharebeKapali * 0.7,
    // "Aynı anda etkin ittifak oranı → aktörlerin yarısından azı"
    oranSaglikli: k.ittifakliOran < 0.5,
    // "En büyük ittifak bloğunun büyüklüğü → haritanın yarısından küçük"
    blokSaglikli: k.blok < k.canli / 2,
  };
}

const AYARLAR = process.argv.slice(2);
if (AYARLAR.length) {
  // Düğme taraması: `node scripts/diplomasi-olcum.js ESIK=1.5 EN_COK_ITTIFAK=2`
  for (const a of AYARLAR) {
    const [ad, deger] = a.split('=');
    if (ad === 'ESIK') DENGE.DIPLOMASI.FAYDA.ESIK = Number(deger);
    else if (ad === 'CEPHE_YUKU') DENGE.DIPLOMASI.FAYDA.CEPHE_YUKU = Number(deger);
    else if (ad === 'ZAYIF_KOMSU') DENGE.DIPLOMASI.FAYDA.ZAYIF_KOMSU = Number(deger);
    else if (ad === 'KOMSU') DENGE.DIPLOMASI.FAYDA.KOMSU = Number(deger);
    else if (ad === 'EN_COK_ITTIFAK') DENGE.DIPLOMASI.EN_COK_ITTIFAK = Number(deger);
    else if (ad === 'TUR_BASINA_TEKLIF') DENGE.DIPLOMASI.TUR_BASINA_TEKLIF = Number(deger);
    else if (ad === 'BUYUKLUK_ESIGI') DENGE.DIPLOMASI.TANIDIK.BUYUKLUK_ESIGI = Number(deger);
    else throw new Error('Bilinmeyen düğme: ' + ad);
  }
  console.log('DÜĞME TARAMASI: ' + AYARLAR.join(' '));
}

const sonuclar = KADEMELER.map(kademeOlc);

console.log('\nDİPLOMASİ ÖLÇÜMÜ — ' + TUR + ' tur × ' + TOHUMLAR.length + ' tohum');
console.log('kademe   muharebe(kapalı→açık)   ittifaklı oran   en büyük blok / canlı');
for (const k of sonuclar) {
  const s = saglikli(k);
  console.log(
    '  ' +
      k.zorluk.padEnd(7) +
      (k.muharebeKapali.toFixed(0) + ' → ' + k.muharebeAcik.toFixed(0)).padEnd(24) +
      ((k.ittifakliOran * 100).toFixed(0) + '%').padEnd(17) +
      (k.blok.toFixed(1) + ' / ' + k.canli.toFixed(0)).padEnd(14) +
      (s.savasDurmadi ? '' : ' ✗SAVAŞ-DURDU') +
      (s.oranSaglikli ? '' : ' ✗ORAN') +
      (s.blokSaglikli ? '' : ' ✗BLOK')
  );
}

if (!AYARLAR.length) {
  const S = [];
  const yaz = (...x) => S.push(...x);
  yaz(
    '# DİPLOMASİ ÖLÇÜMÜ — İTTİFAK DOYGUNLUĞU (Görev 09 / Adım 3)',
    '',
    '> Üretildi: `node scripts/diplomasi-olcum.js` — ELLE DÜZENLEME.',
    '> Tarih: ' + new Date().toISOString().slice(0, 10),
    '',
    TUR + ' tur × ' + TOHUMLAR.length + ' tohum × 3 zorluk, diplomasi açık ve kapalı.',
    '',
    '## Neden bu ölçüldü',
    '',
    'Görev belgesi §10/6: **"İttifak doygunluğu — bu görevin oyunu bozabileceği tek yer.',
    'Herkes herkesle anlaşırsa savaş durur ve oyun donar."** Adım 3 bunu kod tamamlanmadan',
    'ölçmeyi şart koşuyordu.',
    '',
    '## Sonuç',
    '',
    '| Kademe | Muharebe (kapalı → açık) | Fetih (kapalı → açık) | İttifaklı aktör | En büyük blok / canlı |',
    '|---|---|---|---|---|'
  );
  for (const k of sonuclar) {
    const s = saglikli(k);
    yaz(
      '| ' +
        k.zorluk +
        ' | ' +
        k.muharebeKapali.toFixed(0) +
        ' → ' +
        k.muharebeAcik.toFixed(0) +
        (s.savasDurmadi ? '' : ' ⚠') +
        ' | ' +
        k.fetihKapali.toFixed(0) +
        ' → ' +
        k.fetihAcik.toFixed(0) +
        ' | ' +
        (k.ittifakliOran * 100).toFixed(0) +
        '%' +
        (s.oranSaglikli ? '' : ' ⚠') +
        ' | ' +
        k.blok.toFixed(1) +
        ' / ' +
        k.canli.toFixed(0) +
        (s.blokSaglikli ? '' : ' ⚠') +
        ' |'
    );
  }
  yaz(
    '',
    '**Sağlıklı aralık** (belge §Adım 3/a): muharebe sayısı belirgin düşmeyecek ·',
    'ittifaklı aktör oranı yarıdan az · en büyük blok haritanın yarısından küçük.',
    '',
    '## Düğmeler',
    '',
    'Tarama: `node scripts/diplomasi-olcum.js ESIK=1.5 EN_COK_ITTIFAK=2`',
    '',
    '| Düğme | Bugün | Ne yapar |',
    '|---|---|---|',
    '| `FAYDA.ESIK` | ' +
      DENGE.DIPLOMASI.FAYDA.ESIK +
      ' | Teklifin verilmesi/kabulü için gereken en az puan |',
    '| `FAYDA.CEPHE_YUKU` | ' +
      DENGE.DIPLOMASI.FAYDA.CEPHE_YUKU +
      ' | Çok cepheli aktörün anlaşmaya açlığı |',
    '| `FAYDA.KOMSU` | ' +
      DENGE.DIPLOMASI.FAYDA.KOMSU +
      ' | Komşuyla anlaşmanın maliyeti (cephe kapanır) |',
    '| `FAYDA.ZAYIF_KOMSU` | ' +
      DENGE.DIPLOMASI.FAYDA.ZAYIF_KOMSU +
      ' | Yiyebileceğim komşuyla anlaşmamak |',
    '| `EN_COK_ITTIFAK` | ' + DENGE.DIPLOMASI.EN_COK_ITTIFAK + ' | Aynı anda en çok kaç ittifak |',
    '| `TUR_BASINA_TEKLIF` | ' +
      DENGE.DIPLOMASI.TUR_BASINA_TEKLIF +
      ' | Tur başına teklif sayısı |',
    ''
  );
  fs.writeFileSync(path.join(PROJ, 'veri', 'diplomasi-olcum.md'), S.join('\n'), 'utf8');
  console.log('\nYazıldı: veri/diplomasi-olcum.md');
}
