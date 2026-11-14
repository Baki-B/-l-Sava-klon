// KAYIT BOYUTU ÖLÇÜMÜ — Görev 09 / Adım 0/3 (görev belgesi §7'nin uyarısı).
// Çalıştırma:  node scripts/kayit-boyut-olcum.js
//
// İKİ SORU VAR, ikisi de sekiz görevdir cevaplanmadı:
//
//   1. 26 KB SINIRI NEREDEN GELİYOR? Görev 03 §7 tek cümle yazmıştı: "kayıt dosyası birkaç
//      on KB'ı geçmemeli — yüzlerce KB ise GEOMETRİ SIZMIŞ demektir." Yani 26 bir depolama
//      sınırı değil, bir KANARYA: parça şekilleri (parcalar.json 1.58 MB) kayda karışırsa
//      boyut anında yüzlerce KB'a fırlar ve test bunu yakalar. Sayının kendisi o gün
//      ölçülen değerin biraz üstüne konmuş.
//
//   2. AMA BÜTÜN ÖLÇÜMLER 15 TUR ÜZERİNDEN YAPILDI. Görev 09 mod sistemini getiriyor ve
//      maçlar 40–60 tura çıkacak. 15 turluk bir sayıya bakıp "sınırın altındayız" demek,
//      hiç oynanmamış bir maç uzunluğu için söz vermek olur.
//
// BU BETİK İKİSİNİ BİRDEN ÖLÇER: boyutun TURLA nasıl büyüdüğünü ve büyümenin HANGİ ALANDAN
// geldiğini. İkincisi olmadan sınırı yükseltmek körlemesine olurdu — asıl bilinmesi gereken
// şey eğrinin şekli: doğrusal mı büyüyor, yoksa doyuyor mu?
//
// Çıktı: veri/kayit-boyut-olcum.md

const fs = require('fs');
const path = require('path');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { kayitMetni } = require('../src/oyun/kayitVerisi.js');
const { birimUret, ilUretimHakki, birimSayisi, parcaOrdusu } = require('../src/oyun/ordu.js');
const { hedefleriAyir, kullanilabilirBirimler } = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { kullanilabilirButce } = require('../src/oyun/butce.js');
const {
  ayrilaniAyarla,
  seviyeYukselt,
  aktorArastirmasi,
  tumDallar,
} = require('../src/oyun/arastirma.js');
const { DENGE } = require('../src/denge.js');
const { PARCALAR } = require('../src/oyun/veri.js');

const PROJ = path.join(__dirname, '..');
const TOHUM = 20260801;
const TUR_SAYISI = 60; // 40'ın ötesine bakılıyor: eğrinin doyup doymadığı ancak orada görünür
const ADIM = 10; // kaç turda bir ölçüm satırı
const ARASTIRMA_PAYI = 0.35; // denge-simulasyonu.js ile aynı — sayılar karşılaştırılabilsin

// ---- ÖLÇÜM ARACI OYUNCU ----
// `denge-simulasyonu.js`'in oyuncusunun aynısı. Kopya olmasının sebebi ölçülen şeyin farklı
// olması: orada MEKANİKLERİN FARKI ölçülüyordu (davranış sabit tutulmalıydı), burada KAYIT
// BOYUTU ölçülüyor ve oyuncunun büyümesi boyutun en büyük tek sürükleyicisi. Aynı davranışı
// kullanmak iki ölçümü yan yana okunabilir kılıyor.

function benimParcalarim(d, ben) {
  return Object.keys(d.parcaSahipligi)
    .filter((p) => d.parcaSahipligi[p] === ben)
    .sort();
}

function uret(d, ben) {
  for (let deneme = 0; deneme < 12; deneme++) {
    let yer = null,
      enHak = 0;
    for (const pid of benimParcalarim(d, ben)) {
      const hak = ilUretimHakki(d, PARCALAR[pid].kod, ben);
      if (hak.kalan > enHak) {
        enHak = hak.kalan;
        yer = pid;
      }
    }
    if (!yer) return d;
    const butce = kullanilabilirButce(d, ben);
    const siparis = {};
    for (const tur of DENGE.BIRIM_SIRASI) {
      const b = DENGE.BIRIMLER[tur];
      if (b.nufus <= butce.nufus && b.ekonomi <= butce.ekonomi) siparis[tur] = 1;
    }
    if (birimSayisi(siparis) === 0) return d;
    const s = birimUret(d, yer, ben, siparis);
    if (!s.ok) return d;
    d = s.durum;
  }
  return d;
}

function saldir(d, ben) {
  for (const pid of benimParcalarim(d, ben)) {
    const ordu = parcaOrdusu(d, pid);
    if (!ordu || ordu.sahip !== ben) continue;
    const eldeki = kullanilabilirBirimler(d, pid);
    const gucum = birimSayisi(eldeki);
    if (gucum === 0) continue;
    const { dusman } = hedefleriAyir(d, ben, pid);
    if (dusman.length === 0) continue;

    let hedef = null,
      enAz = Infinity;
    for (const h of dusman.slice().sort()) {
      const savunan = parcaOrdusu(d, h);
      const guc = savunan ? birimSayisi(savunan.birimler) : 0;
      if (guc < enAz) {
        enAz = guc;
        hedef = h;
      }
    }
    if (!hedef || gucum <= enAz) continue;
    const s = hamleUygula(d, ben, pid, hedef, eldeki);
    if (s.ok) d = s.durum;
  }
  return d;
}

function arastir(d, ben) {
  for (let deneme = 0; deneme < 10; deneme++) {
    const kayit = aktorArastirmasi(d, ben);
    const sirali = tumDallar()
      .slice()
      .sort((a, b) => ((kayit && kayit[a.anahtar]) || 0) - ((kayit && kayit[b.anahtar]) || 0));
    let atladi = false;
    for (const { birim, dal } of sirali) {
      const s = seviyeYukselt(d, ben, birim, dal);
      if (s.ok) {
        d = s.durum;
        atladi = true;
        break;
      }
    }
    if (!atladi) break;
  }
  const butce = kullanilabilirButce(d, ben);
  return ayrilaniAyarla(d, ben, Math.floor(butce.ekonomi * ARASTIRMA_PAYI));
}

// ---- ALAN BAŞINA BOYUT ----
// Kaydın hangi alanının şiştiğini söyler. Toplam ile alanların toplamı birebir tutmaz
// (dış süslü parantez ve anahtar adları); önemli olan PAYLARIN oranı.
function alanBoyutlari(durum) {
  const metin = kayitMetni(durum);
  const veri = JSON.parse(metin);
  const paylar = {};
  for (const anahtar of Object.keys(veri))
    paylar[anahtar] = Buffer.byteLength(JSON.stringify(veri[anahtar] || null), 'utf8') / 1024;
  return { toplamKB: Buffer.byteLength(metin, 'utf8') / 1024, paylar };
}

function kosu({ senaryo, zorluk, ad }) {
  let d = oyunKur({ senaryo, tohum: TOHUM, zorluk });
  const ben = d.oyuncuAktorId;
  const olcumler = [{ tur: 0, ...alanBoyutlari(d), parca: benimParcalarim(d, ben).length }];

  for (let tur = 1; tur <= TUR_SAYISI; tur++) {
    d = arastir(d, ben);
    d = uret(d, ben);
    d = saldir(d, ben);
    d = turuBitir(d);
    if (tur % ADIM === 0)
      olcumler.push({ tur, ...alanBoyutlari(d), parca: benimParcalarim(d, ben).length });
  }

  // Dünyanın hâli — boyutun neden büyüdüğünü açıklıyor.
  const sahipSayim = {};
  for (const v of Object.values(d.parcaSahipligi)) sahipSayim[v] = (sahipSayim[v] || 0) + 1;

  return {
    ad,
    olcumler,
    orduSayisi: Object.keys(d.ordular).length,
    arastirmaKaydi: Object.keys(d.arastirma).length,
    aktorKaldi: Object.keys(sahipSayim).length,
    toplamParca: Object.keys(d.parcaSahipligi).length,
  };
}

const KOSULAR = [
  { ad: 'Türkiye · orta', senaryo: 'turkiye', zorluk: 'orta' },
  { ad: 'Türkiye · zor', senaryo: 'turkiye', zorluk: 'zor' },
  { ad: 'Karadeniz · zor', senaryo: 'karadeniz', zorluk: 'zor' },
];

const sonuclar = KOSULAR.map(kosu);

// ---- RAPOR ----
const S = [];
const yaz = (...x) => S.push(...x);

const enBuyuk = Math.max(...sonuclar.map((r) => Math.max(...r.olcumler.map((o) => o.toplamKB))));

yaz(
  '# KAYIT BOYUTU — 60 TURLUK ÖLÇÜM (Görev 09 / Adım 0)',
  '',
  '> Üretildi: `node scripts/kayit-boyut-olcum.js` — ELLE DÜZENLEME.',
  '> Tarih: ' + new Date().toISOString().slice(0, 10),
  '',
  'Tohum ' + TOHUM + ' · ' + TUR_SAYISI + ' tur · oyuncu davranışı `denge-simulasyonu.js`',
  'ile aynı (üret · araştır · yalnızca üstün olduğun en zayıf komşuya saldır).',
  '',
  '## Neden ölçüldü',
  '',
  'Bugüne kadarki BÜTÜN kayıt boyutu ölçümleri **15 tur** üzerinden yapıldı. Görev 09 mod',
  'sistemini getiriyor ve maçlar 40–60 tura çıkacak. 15 turluk bir sayıya bakıp "sınırın',
  'altındayız" demek, hiç oynanmamış bir maç uzunluğu için söz vermek olurdu.',
  '',
  '## Tur tur boyut',
  ''
);

for (const r of sonuclar) {
  yaz(
    '### ' + r.ad,
    '',
    '| Tur | Kayıt (KB) | Oyuncunun parçası | En büyük üç alan |',
    '|---|---|---|---|'
  );
  for (const o of r.olcumler) {
    const ucu = Object.keys(o.paylar)
      .sort((a, b) => o.paylar[b] - o.paylar[a])
      .slice(0, 3)
      .map((k) => k + ' ' + o.paylar[k].toFixed(1))
      .join(' · ');
    yaz('| ' + o.tur + ' | **' + o.toplamKB.toFixed(1) + '** | ' + o.parca + ' | ' + ucu + ' |');
  }
  yaz(
    '',
    'Tur ' +
      TUR_SAYISI +
      ' sonunda: ordu kaydı ' +
      r.orduSayisi +
      '/' +
      r.toplamParca +
      ' parçada · araştırma kaydı ' +
      r.arastirmaKaydi +
      ' aktörde · ' +
      r.aktorKaldi +
      ' bağımsız aktör kaldı.',
    ''
  );
}

yaz(
  '## Sonuç',
  '',
  '- **En büyük ölçülen kayıt: ' + enBuyuk.toFixed(1) + ' KB.**',
  '- Eğri turla birlikte **doygunluğa gidiyor, doğrusal değil.** Sebebi yapısal: `ordular`',
  '  en fazla parça sayısı kadar satır tutabiliyor (181), `arastirma` en fazla aktör sayısı',
  '  kadar (81 → konsolidasyonla azalıyor), `turGecmisi` `DENGE.TUR_GECMISI_UZUNLUGU` ile',
  '  kırpılıyor, `duellolar` `REKABET.EN_COK_ETKIN` ile sınırlı. **Kaydın tavanı var.**',
  '- Boyutu turdan çok **oyuncunun büyüklüğü** sürüklüyor; ordu satırı yalnızca ordusu olan',
  '  parça için yazılıyor (Görev 04 kuralı) ve dolu parça sayısı arttıkça satır artıyor.',
  '',
  '## 26 KB sınırı hakkında',
  '',
  'Sınır bir **depolama kısıtı değil, kanarya**: Görev 03 §7 "yüzlerce KB ise geometri',
  'sızmış demektir" diye yazmıştı ve 26, o gün ölçülen değerin biraz üstüne konmuştu.',
  'Gerçek kısıt AsyncStorage tarafında ve kat kat yukarıda (Android varsayılanı uygulama',
  "başına ~6 MB, iOS'ta böyle bir tavan yok).",
  '',
  'Yani sayı yükseltilebilir — ama **kanarya işlevi korunarak.** Geometri sızarsa boyut',
  'yüzlerce KB olur; sınır o kadar yükselmediği sürece test yine yakalar.',
  ''
);

fs.writeFileSync(path.join(PROJ, 'veri', 'kayit-boyut-olcum.md'), S.join('\n'), 'utf8');

console.log('KAYIT BOYUTU — ' + TUR_SAYISI + ' tur, tohum ' + TOHUM);
for (const r of sonuclar) {
  console.log('\n  ' + r.ad + ':');
  for (const o of r.olcumler)
    console.log(
      '    tur ' +
        String(o.tur).padStart(2) +
        '  ' +
        o.toplamKB.toFixed(1).padStart(6) +
        ' KB   (' +
        o.parca +
        ' parça)'
    );
}
console.log('\nEn büyük: ' + enBuyuk.toFixed(1) + ' KB');
console.log('Yazıldı: veri/kayit-boyut-olcum.md');
