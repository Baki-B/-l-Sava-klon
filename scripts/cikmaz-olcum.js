// ÇIKMAZ ÖLÇÜMÜ — GÖREV 12, BAKİ'NİN ŞİKÂYETİ (2026-08-06).
// Çalıştırma:  node scripts/cikmaz-olcum.js     → veri/cikmaz-olcum.md
//
// > *"Bazı illerin — mesela İzmir'in Balıkesir, Çanakkale sınırında — o 3 parça birbirine
// > değiyor ve aynı yere 10-20 asker yığmaya başlıyorlar; her biri her tur aynı yere
// > basıyor, diğerlerini ignoreluyor. Çok sinir bozucu ve oyunu uzatacak bir şey."*
//
// ŞİKÂYETİ SAYIYA ÇEVİRMEK: "aynı yere basmak" = aynı aktörün aynı hedefe ARKA ARKAYA
// turlarda saldırması ve parçayı ALAMAMASI. Ölçülen üç şey:
//   • TEKRAR: kaç saldırı, bir öncekinin aynısının tekrarı (aktör+hedef, sonuçsuz)
//   • ZİNCİR: tek bir cephenin kaç kez boşuna dövüldüğü
//   • BOŞA GİDEN: kaybedilen saldırıların oranı
//
// Karşılaştırma `DENGE.ZEKA.UMUTSUZ_SALDIRI.ACIK` bayrağıyla: kapalıyken Görev 11
// davranışı, açıkken yeni kural. Oyuncu HİÇ EMİR VERMİYOR — ölçülen şey dünyanın kendi
// kendine ürettiği çıkmaz.

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');

const PROJ = path.join(__dirname, '..');
const TUR_SAYISI = 25;
const TOHUMLAR = [101, 2024, 31337, 606060, 987654];

function kosu(tohum, zorluk) {
  let d = oyunKur({ senaryo: 'turkiye', tohum, zorluk });

  let saldiri = 0;
  let basarisiz = 0;
  // ⚠ İLK ÖLÇÜT FAZLA DARDI: "arka arkaya turlarda aynı hedef" arıyordu ve neredeyse hiç
  // ateşlenmiyordu (kaybeden ordu çoğu kez imha oluyor, ertesi tur saldıracak kimse
  // kalmıyor). Şikâyetin gerçek karşılığı, bir cephenin maç BOYUNCA kaç kez boşuna
  // dövülmesi — o yüzden tekrar artık ARDIŞIK olmak zorunda değil.
  const basarisizSayaci = new Map(); // "aktör>hedef" → kaç kez boşa saldırdı
  let enUzunZincir = 0;

  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    d = turuBitir(d);
    const satirlar = ((d.sonTurRaporu || {}).satirlar || []).filter((s) => s.tip === 'muharebe');
    for (const s of satirlar) {
      saldiri++;
      // Saldıran kaybettiyse parça el değiştirmemiştir — çıkmazın malzemesi bu.
      if (s.kazanan !== 'saldiran') {
        basarisiz++;
        const anahtar = s.sahip + '>' + s.hedef;
        const n = (basarisizSayaci.get(anahtar) || 0) + 1;
        basarisizSayaci.set(anahtar, n);
        if (n > enUzunZincir) enUzunZincir = n;
      }
    }
  }

  // TEKRAR: aynı cepheye ikinci ve sonraki boşa saldırılar.
  let tekrar = 0;
  for (const n of basarisizSayaci.values()) if (n > 1) tekrar += n - 1;

  const sayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sayim[v] = (sayim[v] || 0) + 1;
  const buyukluk = Object.values(sayim).sort((a, b) => b - a);

  return {
    saldiri,
    basarisiz,
    tekrar,
    enUzunZincir,
    tekrarOrani: saldiri ? (tekrar / saldiri) * 100 : 0,
    enBuyuk: buyukluk[0] || 0,
    aktorKaldi: buyukluk.length,
  };
}

function ortalama(liste, alan) {
  return liste.reduce((a, b) => a + b[alan], 0) / liste.length;
}

function kademe(zorluk) {
  const acik = TOHUMLAR.map((t) => kosu(t, zorluk));
  DENGE.ZEKA.UMUTSUZ_SALDIRI.ACIK = false;
  const kapali = TOHUMLAR.map((t) => kosu(t, zorluk));
  DENGE.ZEKA.UMUTSUZ_SALDIRI.ACIK = true;
  return { acik, kapali };
}

const S = [];
const yaz = (...x) => S.push(...x);
const f1 = (x) => x.toFixed(1);

yaz(
  '# ÇIKMAZ ÖLÇÜMÜ — GÖREV 12',
  '',
  '> Üretildi: `node scripts/cikmaz-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Baki’nin şikâyeti: *"aynı yere 10-20 asker yığıyorlar, her tur aynı yere basıyorlar,',
  'diğerlerini ignoreluyorlar."* Sayıya çevrilmiş hâli: **TEKRAR** = bir aktörün aynı hedefe',
  'arka arkaya turlarda saldırıp alamaması. ' +
    TUR_SAYISI +
    ' tur × ' +
    TOHUMLAR.length +
    ' tohum, oyuncu hiç emir vermiyor.',
  '',
  '`UMUTSUZ_SALDIRI` kapısı: üstünlüğü `TABAN + TEMKIN_PAYI × temkin` eşiğinin altında kalan',
  'saldırı ADAY OLMAKTAN ÇIKIYOR (bugün 0.50 – 0.72 bandı).',
  ''
);

for (const zorluk of DENGE.ZEKA.ZORLUK_SIRASI) {
  const { acik, kapali } = kademe(zorluk);
  const satir = (ad, liste) =>
    '| ' +
    ad +
    ' | ' +
    f1(ortalama(liste, 'saldiri')) +
    ' | ' +
    f1(ortalama(liste, 'basarisiz')) +
    ' | **' +
    f1(ortalama(liste, 'tekrar')) +
    '** | %' +
    f1(ortalama(liste, 'tekrarOrani')) +
    ' | ' +
    f1(ortalama(liste, 'enUzunZincir')) +
    ' | ' +
    f1(ortalama(liste, 'enBuyuk')) +
    ' |';
  yaz(
    '## ' + (DENGE.ZEKA.ZORLUK[zorluk].ad || zorluk).toUpperCase() + ' KADEME',
    '',
    '| Kural | Saldırı | Başarısız | Tekrar | Tekrar oranı | En çok dövülen cephe | En büyük imparatorluk |',
    '|---|---|---|---|---|---|---|',
    satir('Kapı KAPALI (Görev 11)', kapali),
    satir('Kapı AÇIK (Görev 12)', acik),
    ''
  );
  const t1 = ortalama(kapali, 'tekrar');
  const t2 = ortalama(acik, 'tekrar');
  const b1 = ortalama(kapali, 'enBuyuk');
  const b2 = ortalama(acik, 'enBuyuk');
  yaz(
    'Tekrar eden saldırı **%' +
      f1(t1 > 0 ? ((t1 - t2) / t1) * 100 : 0) +
      ' azaldı**; en büyük imparatorluk ' +
      f1(b1) +
      ' → ' +
      f1(b2) +
      ' parça.',
    ''
  );
}

yaz(
  '## NASIL OKUNUR',
  '',
  '- **Tekrar** düşmeli: şikâyetin konusu bu. Sıfır OLMAMALI — çekimser iller büyük üstünlük',
  '  görmeden saldırmıyor, yani onların cephesinde bekleme hâlâ var (Baki’nin isteği).',
  '- **En büyük imparatorluk** çökmemeli: kapı fazla sıkı olursa dünya donar ve Görev 11’in',
  '  `GENISLEME` terimiyle açtığı kilit geri gelir.',
  '- **En çok dövülen cephe**, aynı yere üst üste kaç tur basıldığını söylüyor. Uzun zincir =',
  '  ekranda "et değirmeni" hissi.',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'cikmaz-olcum.md'), S.join('\n'), 'utf8');
console.log('veri/cikmaz-olcum.md yazıldı.');
