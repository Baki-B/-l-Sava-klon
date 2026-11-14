// BİRLEŞTİRME ÖNERİSİ — Görev 03B / Adım 4.
// Çalıştırma:  node scripts/birlestirme-oner.js [eşik]
//   örnek:     node scripts/birlestirme-oner.js 14.25
//
// HİÇBİR ŞEYİ DEĞİŞTİRMEZ — yalnızca öneri tablosu basar. Uygulama Adım 5'te,
// Baki onayladıktan sonra `parca-uret.js` içindeki BIRLESTIR ayarına satır eklenerek yapılır.
//
// Görev tanımı §8.1'deki kurallar sırayla uygulanır:
//   1. Yalnızca aynı il içinde birleştirilir.
//   2. Hedef: aynı ildeki komşular arasından EN UZUN ORTAK SINIRI paylaşan.
//   3. Eşitlik bozucu: önce aynı arazi tipi, sonra payı büyük olan.
//   4. Paylar toplanır (nüfus ve ekonomi ayrı).
//   5. Birleşen parçanın arazisi: ekonomi payına göre ağırlıklı baskın arazi.
//   6. Bir il 1 parçanın altına inemez.
//   7. Zincirleme: birleşen parça hâlâ eşiğin altındaysa tekrarla.
//   8. Bütünlük: ortak sınırı 0 olan (deniz aşırı) parça birleştirilmez — Baki'ye bildirilir.

const path = require('path');
const turf = require('@turf/turf');
const { halkalar, icCember, kenarKumesi, ortakSinir } = require('./parca-geometri');

const PROJ = path.join(__dirname, '..');
const parcalarDosya = require(path.join(PROJ, 'veri', 'parcalar.json'));
const P = parcalarDosya.parcalar;
const KOMSU = require(path.join(PROJ, 'veri', 'parca-komsuluk.json'));

const ESIK = Number(process.argv[2] || 14.25);
// Baki'nin bilinçli tercihi olan bölünmeler — kendi başına birleştirme yapma, ayrıca sor.
const OZEL_IL = { '06': 'Ankara — 5 parçalı hâli Baki tarafından bilerek istendi' };

// ---- çalışma modeli ----
const model = {};
for (const pid of Object.keys(P)) {
  const rings = halkalar(P[pid].yol);
  model[pid] = {
    pid,
    kod: P[pid].kod,
    il: P[pid].il,
    ad: P[pid].ad,
    arazi: P[pid].arazi,
    nufus: P[pid].nufus,
    ekonomi: P[pid].ekonomi,
    rings,
    kenar: kenarKumesi(rings),
    komsu: new Set(KOMSU[pid] || []),
    cap: icCember(rings).cap,
    yutulanlar: [],
  };
}
const ilinParcalari = (kod) => Object.keys(model).filter((p) => model[p].kod === kod);

// İki parçanın geometrisini birleştir (turf union) → yeni halkalar
function birlestirGeometri(a, b) {
  const poly = (rings) => turf.multiPolygon(rings.map((r) => [[...r, r[0]]]));
  try {
    const u = turf.union(turf.featureCollection([poly(a.rings), poly(b.rings)]));
    if (!u) return null;
    const c = u.geometry.coordinates;
    const parcalar = u.geometry.type === 'Polygon' ? [c] : c;
    return parcalar.map((p) => p[0].slice(0, -1)); // dış halkalar (delikler ölçüme girmez)
  } catch (e) {
    return null;
  }
}

// ---- öneri döngüsü ----
const oneriler = [];
const uyarilar = [];
let guvenlik = 0;

for (;;) {
  if (++guvenlik > 500) break;
  const adaylar = Object.values(model)
    .filter((m) => m.cap < ESIK)
    .filter((m) => ilinParcalari(m.kod).length > 1) // kural 6
    .filter((m) => !OZEL_IL[m.kod]) // kural §8.2
    .sort((x, y) => x.cap - y.cap);
  if (adaylar.length === 0) break;

  const kaynak = adaylar[0];
  const kardesler = ilinParcalari(kaynak.kod).filter((p) => p !== kaynak.pid);
  const secenekler = kardesler
    .map((p) => ({
      hedef: model[p],
      sinir: ortakSinir(kaynak.kenar, model[p].kenar),
    }))
    .filter((s) => s.sinir > 0) // kural 8: kara bağlantısı olmayanla birleşme
    .sort(
      (a, b) =>
        b.sinir - a.sinir || // kural 2: en uzun ortak sınır
        (a.hedef.arazi === kaynak.arazi ? -1 : 0) - (b.hedef.arazi === kaynak.arazi ? -1 : 0) || // kural 3a
        b.hedef.nufus + b.hedef.ekonomi - (a.hedef.nufus + a.hedef.ekonomi) // kural 3b
    );

  if (secenekler.length === 0) {
    uyarilar.push({
      pid: kaynak.pid,
      ad: kaynak.ad,
      il: kaynak.il,
      cap: kaynak.cap,
      sebep:
        'Aynı ilde KARA komşusu yok (yalnızca deniz geçişi) — birleştirilirse parça kopuk kalır.',
    });
    kaynak.cap = Infinity; // bir daha aday olmasın
    continue;
  }

  const hedef = secenekler[0].hedef;
  const yeniRings = birlestirGeometri(kaynak, hedef);
  if (!yeniRings) {
    uyarilar.push({
      pid: kaynak.pid,
      ad: kaynak.ad,
      il: kaynak.il,
      cap: kaynak.cap,
      sebep: 'Geometri birleştirilemedi (turf union başarısız) — elle bakılmalı.',
    });
    kaynak.cap = Infinity;
    continue;
  }

  // kural 4 — paylar toplanır (2 haneye yuvarlanır, il toplamı tam 1.00 kalsın)
  const yeniNufus = +(hedef.nufus + kaynak.nufus).toFixed(2);
  const yeniEkonomi = +(hedef.ekonomi + kaynak.ekonomi).toFixed(2);
  // kural 5 — arazi: ekonomi payına göre ağırlıklı baskın
  const agirlik = {};
  for (const p of [hedef, kaynak]) agirlik[p.arazi] = (agirlik[p.arazi] || 0) + p.ekonomi;
  const yeniArazi = Object.keys(agirlik).sort((a, b) => agirlik[b] - agirlik[a])[0];

  oneriler.push({
    kaynak: kaynak.pid,
    kaynakAd: kaynak.ad,
    kaynakCap: kaynak.cap,
    kaynakArazi: kaynak.arazi,
    kaynakPay: kaynak.nufus + '/' + kaynak.ekonomi,
    hedef: hedef.pid,
    hedefAd: hedef.ad,
    il: kaynak.il,
    ilKod: kaynak.kod,
    sinir: secenekler[0].sinir,
    yeniNufus,
    yeniEkonomi,
    eskiArazi: hedef.arazi,
    yeniArazi,
  });

  // modeli güncelle
  hedef.rings = yeniRings;
  hedef.kenar = kenarKumesi(yeniRings);
  hedef.nufus = yeniNufus;
  hedef.ekonomi = yeniEkonomi;
  hedef.arazi = yeniArazi;
  hedef.cap = icCember(yeniRings).cap;
  hedef.yutulanlar.push(kaynak.pid + ' ' + kaynak.ad);
  for (const k of kaynak.komsu) if (k !== hedef.pid) hedef.komsu.add(k);
  for (const p of Object.values(model)) if (p.komsu.has(kaynak.pid)) p.komsu.add(hedef.pid);
  delete model[kaynak.pid];
}

// ---- rapor ----
console.log('BİRLEŞTİRME ÖNERİSİ — eşik: iç çember < ' + ESIK + ' birim');
console.log('(hiçbir dosya değiştirilmedi)\n');

if (oneriler.length === 0) console.log('  Eşiğin altında birleştirilebilir parça yok.');
else {
  console.log('| # | Silinecek | Hedef | İl | Yeni pay (nüfus/eko) | Arazi | Ortak sınır |');
  console.log('|---|---|---|---|---|---|---|');
  oneriler.forEach((o, i) => {
    console.log(
      '| ' +
        (i + 1) +
        ' | ' +
        o.kaynak +
        ' ' +
        o.kaynakAd +
        ' (' +
        o.kaynakCap.toFixed(1) +
        ') | ' +
        o.hedef +
        ' ' +
        o.hedefAd +
        ' | ' +
        o.il +
        ' | ' +
        o.yeniNufus +
        ' / ' +
        o.yeniEkonomi +
        ' | ' +
        (o.eskiArazi === o.yeniArazi ? o.yeniArazi : o.eskiArazi + ' → ' + o.yeniArazi) +
        ' | ' +
        o.sinir.toFixed(1) +
        ' |'
    );
  });
}

console.log('\nSONUÇ:');
const kalan = Object.keys(model).length;
console.log('  Birleşen parça : ' + oneriler.length);
console.log('  Kalan parça    : ' + kalan + ' (önce ' + Object.keys(P).length + ')');
const etkilenen = [...new Set(oneriler.map((o) => o.ilKod + ' ' + o.il))];
console.log('  Etkilenen il   : ' + etkilenen.length + ' — ' + etkilenen.join(', '));

const kalanKucuk = Object.values(model)
  .filter((m) => m.cap < ESIK)
  .sort((a, b) => a.cap - b.cap);
if (kalanKucuk.length) {
  console.log('\nEŞİĞİN ALTINDA KALANLAR (birleştirilemeyenler):');
  for (const m of kalanKucuk) {
    const tek = ilinParcalari(m.kod).length === 1;
    console.log(
      '  ' +
        m.pid.padEnd(7) +
        m.ad.padEnd(24) +
        m.il.padEnd(14) +
        m.cap.toFixed(1).padStart(6) +
        '  ' +
        (OZEL_IL[m.kod] ? 'ÖZEL: ' + OZEL_IL[m.kod] : tek ? 'tek parçalı il (dokunulamaz)' : '?')
    );
  }
}

if (uyarilar.length) {
  console.log("\nBAKİ'YE SORULACAKLAR:");
  for (const u of uyarilar)
    console.log(
      '  ' + u.pid + ' ' + u.ad + ' (' + u.il + ', ' + u.cap.toFixed(1) + ') — ' + u.sebep
    );
}

// Ad önerisi gereken durumlar: yutulan parçanın payı hedefin yarısından büyükse ad yanıltıcı olabilir
console.log('\nAD DEĞİŞİKLİĞİ DÜŞÜNÜLMELİ (yutulan parça küçük değilse ad yanıltıcı olur):');
let adVar = false;
for (const o of oneriler) {
  const h = model[o.hedef];
  if (!h) continue;
  const kaynakPay = +o.kaynakPay.split('/')[0];
  if (kaynakPay >= 0.25) {
    adVar = true;
    console.log(
      '  ' +
        o.hedef +
        ' "' +
        o.hedefAd +
        '" artık ' +
        o.kaynakAd +
        ' bölgesini de kapsıyor (' +
        o.il +
        ')'
    );
  }
}
if (!adVar) console.log('  (yok — yutulan parçaların hepsi küçük)');
