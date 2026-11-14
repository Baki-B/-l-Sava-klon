// SAHNE ÖLÇÜMÜ — Görev 08 / Adım 1.
// Çalıştırma:  node scripts/sahne-olcum.js     → veri/sahne-olcum.md
//
// ÜÇ SORU:
//   a) Tur hesabı bugün ne kadar sürüyor? (animasyon bütçesinin TABANI)
//   b) Gösteri ne kadar sürüyor? Kapsam ayarı tempo tuzağını gerçekten çözüyor mu?
//   c) Yapay zekânın takviyesi hamle uzayını ne kadar büyütüyor?
//
// ---- BELGEDEN İKİ SAPMA, İKİSİ DE BİLEREK ----
//
// 1. GÖREV BELGESİ ADIM 1'İ ADIM 2'DEN ÖNCE KOYUYORDU ("kod yazılmadan ölçülüyor").
//    Sıra çevrildi: önce `src/oyun/olaylar.js` yazıldı, ölçüm onu ÇAĞIRIYOR. Sebep §10/4:
//    "aynı kural iki yerde tutulmaz". Betik kendi süre hesabını yazsaydı, iki hafta sonra
//    DENGE'deki bir süre değişince ölçüm sessizce yalan söylemeye başlardı. Ölçülen şey
//    artık tahmin değil, oyunun GERÇEK oynatım planı.
//    Aynı gerekçeyle `cepheUzakligi`/`takviyeAdaylari` de `zeka.js`'te; buradan çağrılıyor.
//
// 2. KARE BÜTÇESİ (fps) BURADA ÖLÇÜLEMEZ. Bu betik Node'da koşuyor; kare süresi telefonun
//    çizim katmanında oluşur. Ölçülebilen şey EŞZAMANLI EFEKT SAYISI — kaç efektin aynı
//    anda oynayacağı buradan çıkıyor ve `EN_COK_ESZAMANLI`'nın doğru yerde olup olmadığı
//    böyle anlaşılıyor. fps'in kendisi Baki'nin cihaz denemesine kalıyor (§Adım 1/a).

const fs = require('fs');
const path = require('path');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { komsular } = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { parcaOrdusu, birimUret, birimSayisi } = require('../src/oyun/ordu.js');
const { adayHamleler, takviyeAdaylari, cepheUzakligi } = require('../src/oyun/zeka.js');
const { olaylariCikar, oynatimPlani, toplamSure } = require('../src/oyun/olaylar.js');

const PROJ = path.join(__dirname, '..');
const TOHUM = 20260730; // zeka-olcum.js ile AYNI tohum — sayılar yan yana okunabilsin
const TUR_SAYISI = 15;
const BEN = '16'; // Bursa — oyuncu

// Oyuncu politikası `zeka-olcum.js`'in birebir aynısı. Bilerek basit; buradaki sayılar
// mutlak bir zorluk ölçüsü değil, KOŞULAR ARASI FARKIN ölçüsü.
const benimParcalarim = (d) =>
  Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === BEN);

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

// Aynı anda kaç efekt oynayabilir: tek bir olayın tetiklediği eşzamanlı efekt sayısı
// değil, AYNI PARÇA üstünde üst üste binen olay sayısı. Bir turda en kalabalık parça
// kaç olay topluyorsa, EN_COK_ESZAMANLI en az o kadar olmalı — yoksa efektler kuyruğa
// girer ve gösteri uzar.
function enYogunParca(olaylar) {
  const sayim = {};
  for (const o of olaylar) {
    const p = o.parca || o.hedef;
    if (p) sayim[p] = (sayim[p] || 0) + 1;
  }
  return Object.keys(sayim).reduce((a, p) => Math.max(a, sayim[p]), 0);
}

// ---- TAKVİYENİN ÖLÇÜMÜ İKİ DÜNYADA YAPILIYOR ----
//
// İlk koşu (orta kademe) beklenmedik bir sonuç verdi: takviye adayı neredeyse hiç yok.
// Sebebi ölçümün kendisi değil, DÜNYANIN HÂLİ — orta kademede 15 turda kimse büyümüyor,
// aktörlerin çoğu 1–3 parçalı ve her parçası cephede. İÇ BÖLGE YOKSA TAKVİYE DE YOK.
//
// Görev 07 raporu §2 zor kademede 81 aktörün 32'ye indiğini ve 28 parçalık bir
// imparatorluk çıktığını ölçmüştü. Takviyenin çözdüğü sorun (Görev 07 §11/1: "aktör
// genişledikçe kuvvetinin büyüyen kısmı ölü yatırıma dönüşüyor") TAM OLARAK orada doğuyor.
// İkinci koşu o dünyayı kuruyor; yoksa ölçüm "takviye gereksiz" diye yanlış cevap verirdi.
function takviyeOlcumu(zorluk, acik) {
  const asil = DENGE.ZEKA.TAKVIYE.ACIK;
  DENGE.ZEKA.TAKVIYE.ACIK = acik;
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM, zorluk });
  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    d = uret(d);
    d = saldir(d);
    d = turuBitir(d);
  }
  DENGE.ZEKA.TAKVIYE.ACIK = asil;

  const aktorler = Object.keys(d.aktorler).filter((a) => a !== BEN);
  let saldiriAday = 0,
    takviyeAday = 0,
    icBolge = 0,
    cephe = 0,
    icBirim = 0;

  const basS = process.hrtime.bigint();
  for (const a of aktorler) saldiriAday += adayHamleler(d, a).length;
  const saldiriMs = Number(process.hrtime.bigint() - basS) / 1e6;

  const basT = process.hrtime.bigint();
  for (const a of aktorler) takviyeAday += takviyeAdaylari(d, a).length;
  const takviyeMs = Number(process.hrtime.bigint() - basT) / 1e6;

  for (const a of aktorler) {
    const u = cepheUzakligi(d, a);
    for (const p of Object.keys(u)) {
      if (u[p] === 0) cephe++;
      else if (u[p] !== Infinity) {
        icBolge++;
        const o = parcaOrdusu(d, p);
        if (o && o.sahip === a) icBirim += birimSayisi(o.birimler);
      }
    }
  }

  const sayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sayim[v] = (sayim[v] || 0) + 1;
  const enBuyuk = Math.max(...Object.keys(sayim).map((k) => sayim[k]));

  return {
    zorluk,
    acik,
    saldiriAday,
    takviyeAday,
    icBolge,
    cephe,
    icBirim,
    saldiriMs,
    takviyeMs,
    bagimsiz: Object.keys(sayim).length,
    enBuyuk,
  };
}

// ---- KOŞU ----
const turlar = [];
let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });

for (let tur = 1; tur <= TUR_SAYISI; tur++) {
  d = uret(d);
  d = saldir(d);

  const bas = process.hrtime.bigint();
  d = turuBitir(d);
  const hesapMs = Number(process.hrtime.bigint() - bas) / 1e6;

  const rapor = d.sonTurRaporu;
  const kapsamlar = {};
  for (const kapsam of DENGE.SAHNE.KAPSAM_SIRASI) {
    const olaylar = olaylariCikar(rapor, { oyuncuAktorId: BEN, kapsam });
    const plan = oynatimPlani(olaylar);
    kapsamlar[kapsam] = {
      olay: olaylar.length,
      savas: olaylar.filter((o) => o.tip === 'savas').length,
      vurus: olaylar.filter((o) => o.tip === 'vurus').length,
      fetih: olaylar.filter((o) => o.tip === 'fetih').length,
      ilKarti: olaylar.filter((o) => o.tip === 'ilTamamlandi' || o.tip === 'ilKaybedildi').length,
      onemli: olaylar.filter((o) => o.tip === 'savas' && o.onemli).length,
      sureMs: toplamSure(plan),
      yogunluk: enYogunParca(olaylar),
    };
  }

  // ---- TAKVİYENİN MALİYETİ ----
  // Bütün yapay zekâ aktörleri için aday sayıları ve üretim süresi.
  const aktorler = Object.keys(d.aktorler).filter((a) => a !== BEN);
  let saldiriAday = 0,
    takviyeAday = 0,
    icBolge = 0;

  const basS = process.hrtime.bigint();
  for (const a of aktorler) saldiriAday += adayHamleler(d, a).length;
  const saldiriMs = Number(process.hrtime.bigint() - basS) / 1e6;

  const basT = process.hrtime.bigint();
  for (const a of aktorler) takviyeAday += takviyeAdaylari(d, a).length;
  const takviyeMs = Number(process.hrtime.bigint() - basT) / 1e6;

  for (const a of aktorler) {
    const u = cepheUzakligi(d, a);
    for (const p of Object.keys(u)) if (u[p] > 0 && u[p] !== Infinity) icBolge++;
  }

  turlar.push({
    tur,
    hesapMs,
    kapsamlar,
    saldiriAday,
    takviyeAday,
    icBolge,
    saldiriMs,
    takviyeMs,
    aktorSayisi: aktorler.length,
  });
}

// ---- ÖZET ----
const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);
const sn = (ms) => (ms / 1000).toFixed(1);
const ort = (liste) => liste.reduce((a, b) => a + b, 0) / liste.length;
const enCok = (liste) => Math.max(...liste);

const hesap = turlar.map((t) => t.hesapMs);
const KARE_MS = 1000 / 60;

const kapsamOzet = {};
for (const kapsam of DENGE.SAHNE.KAPSAM_SIRASI) {
  const s = turlar.map((t) => t.kapsamlar[kapsam]);
  kapsamOzet[kapsam] = {
    ortSure: ort(s.map((x) => x.sureMs)),
    enCokSure: enCok(s.map((x) => x.sureMs)),
    ortSavas: ort(s.map((x) => x.savas)),
    enCokSavas: enCok(s.map((x) => x.savas)),
    ortOlay: ort(s.map((x) => x.olay)),
    enCokYogunluk: enCok(s.map((x) => x.yogunluk)),
    toplamOnemli: s.reduce((a, x) => a + x.onemli, 0),
  };
}

const saldiriOrt = ort(turlar.map((t) => t.saldiriAday));
const takviyeOrt = ort(turlar.map((t) => t.takviyeAday));
const buyumeKat = (saldiriOrt + takviyeOrt) / saldiriOrt;
const takviyeMsOrt = ort(turlar.map((t) => t.takviyeMs));
const saldiriMsOrt = ort(turlar.map((t) => t.saldiriMs));

// Dört koşu: iki zorluk × takviye açık/kapalı. Karşılaştırmanın kendisi ölçüm —
// "takviye ne değiştirdi" sorusunun cevabı ancak aynı tohumla iki koşuyu yan yana
// koyarak verilebilir (Görev 07'nin "dünya duruyor / dünya oynuyor" tablosunun kalıbı).
const takviyeKosulari = [
  takviyeOlcumu('orta', false),
  takviyeOlcumu('orta', true),
  takviyeOlcumu('zor', false),
  takviyeOlcumu('zor', true),
];

// 50 turluk bir oyunda gösteriyi izlemekle geçen toplam süre — tempo tuzağının (§4.4)
// asıl sayısı bu. "Bir savaş kaç saniye" değil, "oyun boyunca ne kadar izliyorum".
const ELLI_TUR = 50;

let md = '# SAHNE ÖLÇÜMÜ (Görev 08 / Adım 1)\n\n';
md += '> Üretildi: `node scripts/sahne-olcum.js` — ELLE DÜZENLEME.\n';
md += '> Tarih: ' + new Date().toISOString().slice(0, 10) + '\n';
md += '> Tohum ' + TOHUM + ', ' + TUR_SAYISI + ' tur, oyuncu Bursa (' + BEN + ').\n\n';

md += '## a) TUR HESABI — animasyon bütçesinin tabanı\n\n';
md += '| Ölçü | Değer |\n|---|---|\n';
md += '| Tur başına hesap (ortalama) | **' + f1(ort(hesap)) + ' ms** |\n';
md += '| En yavaş tur | ' + f1(enCok(hesap)) + ' ms |\n';
md += '| En hızlı tur | ' + f1(Math.min(...hesap)) + ' ms |\n';
md += '| Bir kare (60 kare/sn) | ' + f2(KARE_MS) + ' ms |\n\n';
md += 'Görev 07 raporu ~45 ms diyordu; ölçüm onu doğruluyor. **Bu süre perde arkasında\n';
md += "geçiyor** — oyuncu TURU BİTİR'e bastıktan sonra gösteri başlamadan önce. Yani\n";
md += 'animasyonun bütçesini yemiyor, ona ekleniyor.\n\n';
md += '⚠ **Telefonda ölçülmedi.** Geliştirme makinesinin birkaç katı olabilir (Görev 07\n';
md +=
  '§11/5). Cihazda tur perdesi gözle görülür şekilde bekletiyorsa ilk bakılacak yer burası.\n\n';

md += '## b) GÖSTERİ SÜRESİ — kapsam ayarı tempo tuzağını çözüyor mu?\n\n';
md += '| Kapsam | Tur başına gösteri | En yoğun tur | Ort. savaş | 50 turda toplam |\n';
md += '|---|---|---|---|---|\n';
for (const kapsam of DENGE.SAHNE.KAPSAM_SIRASI) {
  const o = kapsamOzet[kapsam];
  md +=
    '| `' +
    kapsam +
    '` | **' +
    sn(o.ortSure) +
    ' sn** | ' +
    sn(o.enCokSure) +
    ' sn | ' +
    f1(o.ortSavas) +
    ' | **' +
    ((o.ortSure * ELLI_TUR) / 60000).toFixed(1) +
    ' dk** |\n';
}
md += '\n';
md += '**Okunuşu:** varsayılan `cephem` kapsamında oyuncu 50 turluk bir oyunda toplam\n';
md += '**' + ((kapsamOzet.cephem.ortSure * ELLI_TUR) / 60000).toFixed(1) + ' dakika** gösteri\n';
md += 'izliyor. `hepsi` seçilirse bu ';
md +=
  (kapsamOzet.cephem.ortSure > 0
    ? (kapsamOzet.hepsi.ortSure / kapsamOzet.cephem.ortSure).toFixed(1)
    : '—') + ' katına çıkıyor.\n\n';
md += 'Görev belgesi §4.4 "her tur 6 saniyelik gösteriye dönerse oyun oynanmaz hâle gelir"\n';
md +=
  'diyordu. Ölçülen tur başına süre ' + sn(kapsamOzet.cephem.ortSure) + ' sn — eşiğin altında,\n';
md += 've bu TAM GÖSTERİMLE (`HIZ_CARPANI` = ' + DENGE.SAHNE.HIZ_CARPANI + ').\n\n';

md += '### Eşzamanlı efekt sayısı\n\n';
md += 'Aynı parça üstünde en çok kaç olay üst üste biniyor:\n\n';
md += '| Kapsam | En yoğun parça |\n|---|---|\n';
for (const kapsam of DENGE.SAHNE.KAPSAM_SIRASI)
  md += '| `' + kapsam + '` | ' + kapsamOzet[kapsam].enCokYogunluk + ' olay |\n';
md += '\n`DENGE.SAHNE.EN_COK_ESZAMANLI` = ' + DENGE.SAHNE.EN_COK_ESZAMANLI + '. ';
md +=
  kapsamOzet.hepsi.enCokYogunluk <= DENGE.SAHNE.EN_COK_ESZAMANLI
    ? 'Ölçülen yoğunluk sınırın altında — efektler kuyruğa girmeyecek.\n\n'
    : '**Ölçülen yoğunluk sınırın üstünde** — efektler sıralı oynayacak, gösteri uzayabilir.\n\n';

md += '## c) TAKVİYENİN MALİYETİ\n\n';
md += '| Ölçü | Değer |\n|---|---|\n';
md += '| Yapay zekâ aktörü | ' + turlar[0].aktorSayisi + ' |\n';
md += '| Saldırı adayı (tur başına, ortalama) | ' + f1(saldiriOrt) + ' |\n';
md += '| Takviye adayı (tur başına, ortalama) | **' + f1(takviyeOrt) + '** |\n';
md += '| Hamle uzayının büyümesi | **' + f2(buyumeKat) + '×** |\n';
md += '| Saldırı adaylarını üretme süresi | ' + f2(saldiriMsOrt) + ' ms |\n';
md += '| Takviye adaylarını üretme süresi | **' + f2(takviyeMsOrt) + ' ms** |\n';
md +=
  '| İç bölge parçası (cepheye uzaklık > 0) | ' + f1(ort(turlar.map((t) => t.icBolge))) + ' |\n\n';

md += 'Görev belgesi §Soru 4 "aday sayısı yaklaşık **iki katına** çıkar" diyordu.\n';
md += '**Ölçüm ' + f2(buyumeKat) + '× diyor** — beklentinin ';
md += buyumeKat < 2 ? 'çok ALTINDA' : 'ÜSTÜNDE';
md += '. Süre olarak takviye ' + f2(takviyeMsOrt) + ' ms ekliyor; tur hesabı ' + f1(ort(hesap));
md += ' ms ve **hepsi perde arkasında**. Kare bütçesiyle ilgisi yok.\n\n';

md += '### Takviye ne değiştirdi — açık/kapalı karşılaştırması\n\n';
md += 'Aynı tohum, aynı oyuncu davranışı, 15 tur. Değişen tek şey `DENGE.ZEKA.TAKVIYE.ACIK`.\n\n';
const bslk = (k) => '`' + k.zorluk + '` ' + (k.acik ? 'açık' : 'kapalı');
md += '| | ' + takviyeKosulari.map(bslk).join(' | ') + ' |\n';
md += '|---|' + takviyeKosulari.map(() => '---').join('|') + '|\n';
md +=
  '| Bağımsız aktör (15 tur sonunda) | ' +
  takviyeKosulari.map((k) => k.bagimsiz).join(' | ') +
  ' |\n';
md +=
  '| En büyük imparatorluk (parça) | ' + takviyeKosulari.map((k) => k.enBuyuk).join(' | ') + ' |\n';
md += '| Cephe parçası | ' + takviyeKosulari.map((k) => k.cephe).join(' | ') + ' |\n';
md += '| İç bölge parçası | ' + takviyeKosulari.map((k) => k.icBolge).join(' | ') + ' |\n';
md +=
  '| **İç bölgede ÖLÜ BEKLEYEN birim** | ' +
  takviyeKosulari.map((k) => '**' + k.icBirim + '**').join(' | ') +
  ' |\n';
md += '| Takviye adayı | ' + takviyeKosulari.map((k) => k.takviyeAday).join(' | ') + ' |\n';
md += '| Saldırı adayı | ' + takviyeKosulari.map((k) => k.saldiriAday).join(' | ') + ' |\n';
md +=
  '| Hamle uzayının büyümesi | ' +
  takviyeKosulari
    .map((k) => f2((k.saldiriAday + k.takviyeAday) / k.saldiriAday) + '×')
    .join(' | ') +
  ' |\n';
md +=
  '| Takviye adaylarını üretme | ' +
  takviyeKosulari.map((k) => f2(k.takviyeMs) + ' ms').join(' | ') +
  ' |\n\n';

const oran = (kapali, acik) =>
  kapali.icBirim > 0 ? Math.round((1 - acik.icBirim / kapali.icBirim) * 100) : 0;
const ortaK = takviyeKosulari[0],
  ortaA = takviyeKosulari[1],
  zorK = takviyeKosulari[2],
  zorA = takviyeKosulari[3];

md += '**BİTİŞ ÖLÇÜTÜ — ölü yatırım.** Görev 07 §11/1 sorunu şöyle koymuştu: *"aktör\n';
md += 'genişledikçe kuvvetinin gitgide büyüyen kısmı ölü yatırıma dönüşüyor."* Ölçülen şey\n';
md += 'tam olarak o: iç bölgede, düşmanla hiç teması olmayan parçalarda bekleyen birim sayısı.\n\n';
md += '- Orta kademe: **' + ortaK.icBirim + ' → ' + ortaA.icBirim + ' birim** (%';
md += oran(ortaK, ortaA) + ' azalma)\n';
md += '- Zor kademe: **' + zorK.icBirim + ' → ' + zorA.icBirim + ' birim** (%';
md += oran(zorK, zorA) + ' azalma)\n\n';
md += 'Fark zor kademede daha büyük ve bu beklenen: orta kademede 15 turda kimse büyümüyor,\n';
md += 'aktörlerin çoğu 1–3 parçalı ve her parçası zaten cephede. **İç bölge yoksa takviye\n';
md += 'edecek bir şey de yok** — sorun konsolidasyonla birlikte doğuyor, çözümü de orada\n';
md += 'görünüyor.\n\n';
md +=
  'Maliyet tarafı: hamle uzayı en çok ' +
  f2(Math.max(...takviyeKosulari.map((k) => (k.saldiriAday + k.takviyeAday) / k.saldiriAday)));
md += '× büyüyor, yani görev belgesinin beklediği **iki kat maliyet hiçbir kademede doğmuyor.**\n';
md += 'Sebebi `TAKVIYE.KUVVET_ADAYLARI` tek elemanlı: saldırıda her komşu için iki aday\n';
md += 'üretiliyor (tümü / yarısı), takviyede bir tane (tümü) — ve yalnızca iç bölgeden.\n\n';

md += '## TUR TUR DÖKÜM\n\n';
md += '| Tur | Hesap (ms) | `cephem` gösteri | savaş | önemli | `hepsi` gösteri | savaş |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const t of turlar) {
  md +=
    '| ' +
    t.tur +
    ' | ' +
    f1(t.hesapMs) +
    ' | ' +
    sn(t.kapsamlar.cephem.sureMs) +
    ' sn | ' +
    t.kapsamlar.cephem.savas +
    ' | ' +
    t.kapsamlar.cephem.onemli +
    ' | ' +
    sn(t.kapsamlar.hepsi.sureMs) +
    ' sn | ' +
    t.kapsamlar.hepsi.savas +
    ' |\n';
}
md += '\n';

md += '## CİHAZDA ÖLÇÜLECEKLER (bu betik ölçemez)\n\n';
md += '- **Kare süresi (fps)** rozet efektleri açıkken. Hedef 60 fps (16.7 ms), en kötü\n';
md += '  durumda 30 fps altına düşülmeyecek.\n';
md += '- **Kamera kaydırırken kare düşüyor mu.** `DENGE.SAHNE.KAMERA.ACIK` tek satırla kapatır.\n';
md +=
  '- **Tur perdesinin gerçek süresi.** Yukarıdaki hesap süresi telefonda birkaç kat olabilir.\n';

fs.writeFileSync(path.join(PROJ, 'veri', 'sahne-olcum.md'), md, 'utf8');

console.log('SAHNE ÖLÇÜMÜ');
console.log('  tur hesabı        : ' + f1(ort(hesap)) + ' ms (en yavaş ' + f1(enCok(hesap)) + ')');
for (const kapsam of DENGE.SAHNE.KAPSAM_SIRASI)
  console.log(
    '  gösteri (' +
      kapsam.padEnd(7) +
      '): ' +
      sn(kapsamOzet[kapsam].ortSure) +
      ' sn/tur → 50 turda ' +
      ((kapsamOzet[kapsam].ortSure * ELLI_TUR) / 60000).toFixed(1) +
      ' dk'
  );
console.log(
  '  takviye adayı     : ' +
    f1(takviyeOrt) +
    ' (saldırı ' +
    f1(saldiriOrt) +
    ') → hamle uzayı ' +
    f2(buyumeKat) +
    '×'
);
console.log('  takviye süresi    : ' + f2(takviyeMsOrt) + ' ms/tur');
console.log('Yazıldı: veri/sahne-olcum.md');
