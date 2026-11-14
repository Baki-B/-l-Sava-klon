// BÖLÜMLEME BELGESİ ÜRETİCİ — docs/il-savasi-parca-bolumleme-v3.md yazar.
// Çalıştırma:  node scripts/bolumleme-belgesi-uret.js
//
// NEDEN ÜRETİLİYOR: 81 ilin parça tablosu artık elle yazılmıyor, `parca-yeniden-bol*.js`
// ile hesaplanıyor. Belgeyi elle güncellemek her seferinde veriyle belgenin ayrışması
// demek olurdu; bu yüzden tablolar doğrudan veriden basılıyor.
// Kural metinleri (aşağıdaki KURALLAR bölümü) elle yazılır ve burada durur.

const fs = require('fs');
const path = require('path');
const { halkalar, icCember } = require('./parca-geometri');

const PROJ = path.join(__dirname, '..');
const parcalarDosya = require(path.join(PROJ, 'veri/parcalar.json'));
const P = parcalarDosya.parcalar;
const ILLER = require(path.join(PROJ, 'veri/iller.json'));
const TABLO = require(path.join(PROJ, 'veri/ham/parca-tablo.json'));

const ESIK = 14.25;
const ARAZI_AD = { ova: 'Ova', tepelik: 'Tepelik', daglik: 'Dağlık' };
const BOLGE_SIRA = [
  'Marmara',
  'Ege',
  'Akdeniz',
  'İç Anadolu',
  'Karadeniz',
  'Doğu Anadolu',
  'Güneydoğu Anadolu',
];

// ölçümler
const cap = {};
for (const pid of Object.keys(P)) cap[pid] = icCember(halkalar(P[pid].yol)).cap;

// istisnalar (eşiğin altında kalmasına bilerek izin verilenler)
const ISTISNA = {
  '77-1': 'tek parçalı il',
  '79-1': 'tek parçalı il',
  '17-1': 'aynı ilde kara komşusu yok (boğazın karşı yakası)',
  '31-2': 'Hatay 2 parça kalsın (Baki kararı)',
  '41-1': 'Kocaeli 2 parça kalsın (Baki kararı)',
};

const s = [];
const y = (x) => s.push(x);

y('# İL SAVAŞI — 81 İL PARÇA BÖLÜMLEMESİ (v3)');
y('');
y('> Oyun haritasının alt bölge (parça) tablosu. Toplam **' + Object.keys(P).length + ' parça**.');
y("> Bu belge `il-savasi-tasarim.md` §7'nin veri katmanıdır.");
y('>');
y('> **Bu belge elle yazılmaz, üretilir.** Kaynak: `veri/parcalar.json` + `veri/iller.json`.');
y('> Yeniden üretmek için: `node scripts/bolumleme-belgesi-uret.js`');
y('> Bölümlemenin kendisi `scripts/parca-yeniden-bol.js` + `-bol-2.js` ile hesaplanır.');
y('>');
y('> v2 (coğrafi kontrast kuralıyla çizilmiş 195/185 parçalık hâl) tarihsel kayıt olarak durur.');
y('');
y('---');
y('');
y('## BÖLÜMLEME KURALLARI');
y('');
y('Bu kurallar 2026-07-26\'da Baki tarafından belirlendi ve eski "coğrafi kontrast"');
y('kuralının yerine geçti. Eski kural parçaları **araziye göre** açıyordu; yeni kural');
y('**haritada nasıl göründüklerine** göre açıyor.');
y('');
y('### 1. Parça sayısı: her ilde 1–4');
y('');
y('Beşinci parçaya izin yok. Gerekçe: daha az parça = oyuncu için daha az yük, haritada');
y('daha az kalabalık. Karmaşıklık, oynanışa bir şey katmadığı yerde kırpılır.');
y('');
y('### 2. Birincil ölçüt: okunabilirlik');
y('');
y('Bir parça, **üstünde ordu rozetini taşıyabilecek kadar tıknaz** olmalı. Ölçü:');
y('**iç çember çapı** — parçanın içine sığan en büyük dairenin çapı. Alan kullanılmaz;');
y('uzun ve ince bir kıyı şeridi büyük alana sahip olabilir ama üstüne rozet konamaz.');
y('');
y('Hedef: **iç çember ≥ ' + ESIK + ' harita birimi.** Bu, telefon yatay tutulduğunda');
y('2× yakınlaştırmada 26 piksellik rozetin parçaya sığmasına denk gelir.');
y('');
y('### 3. İkincil ölçüt: nüfus ve ekonomi dengesi');
y('');
y('Parçalar birbirine yakın büyüklükte olmalı — eşitlik aranmaz, ama **"ölü parça"**');
y('(ilin payının çok küçük bir dilimini taşıyan parça) istenmez. Hedef: her parça ilin');
y("payının en az **%10**'unu taşısın; kesin alt sınır **%6**.");
y('');
y('### 4. Arazi artık bölmeyi belirlemez');
y('');
y('Eskiden bir il, dağlık ve düz kesimi ayrışıyorsa bölünürdü. Artık tersi: parça önce');
y('geometriye göre çizilir, sonra **içindeki baskın arazi** (ekonomi payına göre ağırlıklı)');
y('o parçanın arazisi olur.');
y('');
y('**İstisna:** arazisi üçe yakın eşit dağılmış illerde (her tip ≥ %28) arazi **birincil**');
y('ölçüt olur, geometri ve pay ikincil kalır. Yoksa o illerde arazi tamamen anlamsızlaşırdı.');
y('');
y('### 5. Bütünlük');
y('');
y('Parça kara olarak bütün olmalı. **Adalar muaftır** — bağlı oldukları kara parçasının');
y('içindedir (Adalar, Bozcaada, Gökçeada). Ayrı kara gövdesi olan yerler (Gelibolu gibi)');
y('kendi parçası olur.');
y('');
y('### 6. Kimlikler sabittir');
y('');
y('Parça kimlikleri (`34-1` gibi) veri üretiminde baştan numaralanır. Harita değişince');
y('eski kayıtlar geçersizleşir; oyun bunu `surum` alanıyla yakalar ve kaydı reddeder.');
y('');
y('---');
y('');
y('## KORUNAN İLLER');
y('');
y("Baki'nin bugünkü hâlini beğendiği iller yeniden bölünmez, olduğu gibi bırakılır:");
y('**Kayseri, Giresun, Sinop, Kastamonu, İstanbul, Çanakkale, Bursa.**');
y('Liste `scripts/parca-yeniden-bol-2.js` içindeki `KORUNAN` ayarındadır.');
y('');
y("Bursa bu listede özel bir yerde: Uludağ Güneyi ilin nüfusunun yalnızca **%4**'ünü");
y("taşıyor, yani 3. kurala uymuyor. Algoritma İnegöl'ü oraya katarak dengeyi düzeltiyordu;");
y('Baki bugünkü hâlin korunmasını seçti (2026-07-26).');
y('');
y('---');
y('');
y('## TABLO OKUMA');
y('');
y('| Sütun | Anlamı |');
y('|---|---|');
y('| Nüfus payı | Parçanın, ilin toplam nüfusundan aldığı oran. İl içinde toplam 1.00. |');
y('| Ekonomi payı | Aynısı ekonomi için. Nüfus payından farklı olabilir. |');
y('| Arazi | Ova (savunma ×1.00) / Tepelik (×1.15) / Dağlık (×1.35) |');
y('| İç çember | Parçanın içine sığan en büyük dairenin çapı (harita birimi). Rozet ölçüsü. |');
y('');
y('Eğitim, sanayi ve moral için ayrı pay tutulmaz; bunlar **ekonomi payını** takip eder.');
y('');

// ---- il tabloları ----
const ilKodlari = Object.keys(ILLER).sort();
for (const bolge of BOLGE_SIRA) {
  const bolgeIlleri = ilKodlari.filter((k) => ILLER[k].bolge === bolge);
  if (bolgeIlleri.length === 0) continue;
  y('---');
  y('');
  y('# ' + bolge.toLocaleUpperCase('tr-TR') + ' BÖLGESİ');
  y('');
  for (const kod of bolgeIlleri) {
    const il = ILLER[kod];
    const ps = Object.keys(P)
      .filter((pid) => P[pid].kod === kod)
      .sort();
    y('## ' + kod + ' ' + il.ad.toLocaleUpperCase('tr-TR') + ' — ' + ps.length + ' parça');
    y('');
    y('| # | Parça | İlçeler | Arazi | Nüfus | Ekonomi | İç çember |');
    y('|---|---|---|---|---|---|---|');
    for (const pid of ps) {
      const p = P[pid];
      const satir = TABLO.find((t) => t.kod + '-' + t.parcaNo === pid);
      const ilceler = satir ? satir.ilceler.join(', ') : '—';
      const c = cap[pid];
      const isaret = c < ESIK ? ' ⚠' : '';
      y(
        '| ' +
          pid.split('-')[1] +
          ' | ' +
          p.ad +
          ' | ' +
          ilceler +
          ' | ' +
          (ARAZI_AD[p.arazi] || p.arazi) +
          ' | ' +
          p.nufus.toFixed(2) +
          ' | ' +
          p.ekonomi.toFixed(2) +
          ' | ' +
          c.toFixed(1) +
          isaret +
          ' |'
      );
    }
    const kucukler = ps.filter((pid) => cap[pid] < ESIK);
    if (kucukler.length)
      y(
        '\n> ⚠ ' +
          kucukler.map((pid) => P[pid].ad + ' (' + cap[pid].toFixed(1) + ')').join(', ') +
          ' — hedef iç çemberin (' +
          ESIK +
          ') altında. ' +
          kucukler
            .map((pid) => ISTISNA[pid] || 'ilin coğrafyası el vermiyor')
            .filter((v, i, a) => a.indexOf(v) === i)
            .join('; ') +
          '.'
      );
    y('');
  }
}

// ---- özet ----
y('---');
y('');
y('# ÖZET');
y('');
y('## Bölgelere göre dağılım');
y('');
y('| Bölge | İl | Parça |');
y('|---|---|---|');
let toplamIl = 0,
  toplamParca = 0;
for (const bolge of BOLGE_SIRA) {
  const b = ilKodlari.filter((k) => ILLER[k].bolge === bolge);
  const pc = Object.keys(P).filter((pid) => ILLER[P[pid].kod].bolge === bolge).length;
  toplamIl += b.length;
  toplamParca += pc;
  y('| ' + bolge + ' | ' + b.length + ' | ' + pc + ' |');
}
y('| **Toplam** | **' + toplamIl + '** | **' + toplamParca + '** |');
y('');
y('## Parça sayısı dağılımı');
y('');
y('| Parça | İl sayısı |');
y('|---|---|');
for (let n = 1; n <= 4; n++)
  y('| ' + n + ' | ' + ilKodlari.filter((k) => ILLER[k].parcaSayisi === n).length + ' |');
y('');
y(
  '**4 parçalı iller:** ' +
    ilKodlari
      .filter((k) => ILLER[k].parcaSayisi === 4)
      .map((k) => ILLER[k].ad)
      .join(', ') +
    '.'
);
y('');
y(
  '**1 parçalık iller:** ' +
    ilKodlari
      .filter((k) => ILLER[k].parcaSayisi === 1)
      .map((k) => ILLER[k].ad)
      .join(', ') +
    '.'
);
y('');
y('## Arazi dağılımı');
y('');
y('| Arazi | Parça | Oran |');
y('|---|---|---|');
const araziSay = { ova: 0, tepelik: 0, daglik: 0 };
Object.keys(P).forEach((pid) => araziSay[P[pid].arazi]++);
const t = Object.values(araziSay).reduce((a, b) => a + b, 0);
for (const a of ['ova', 'tepelik', 'daglik'])
  y('| ' + ARAZI_AD[a] + ' | ' + araziSay[a] + ' | %' + Math.round((araziSay[a] / t) * 100) + ' |');
y('');
y('## Okunabilirlik');
y('');
const altinda = Object.keys(P)
  .filter((pid) => cap[pid] < ESIK)
  .sort((a, b) => cap[a] - cap[b]);
y(
  'Hedef iç çemberin (' +
    ESIK +
    ') altında kalan parça: **' +
    altinda.length +
    '** / ' +
    Object.keys(P).length +
    '. Hepsi bilinçli istisna:'
);
y('');
y('| Parça | İl | İç çember | Sebep |');
y('|---|---|---|---|');
for (const pid of altinda)
  y(
    '| ' +
      P[pid].ad +
      ' | ' +
      P[pid].il +
      ' | ' +
      cap[pid].toFixed(1) +
      ' | ' +
      (ISTISNA[pid] || 'ilin coğrafyası el vermiyor') +
      ' |'
  );
y('');
y('Ölçümün tamamı: `veri/parca-olcum.md`. Görsel testi: `onizleme/rozet-testi.html`.');
y('');

fs.writeFileSync(path.join(PROJ, 'docs/il-savasi-parca-bolumleme-v3.md'), s.join('\n'), 'utf8');
console.log(
  'docs/il-savasi-parca-bolumleme-v3.md yazıldı (' +
    Object.keys(P).length +
    ' parça, ' +
    ilKodlari.length +
    ' il).'
);
