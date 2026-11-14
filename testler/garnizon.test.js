// KURULUŞ GARNİZONU TESTLERİ (Görev 05 / Adım 6 · Soru 2 → cevap A).
//
// Asıl sorular: her parçaya garnizon konuyor mu, sayı ilin statlarından mı türüyor,
// karışım §4.5 tablosuna uyuyor mu, sonuç belirlenimci mi (her oyun aynı mı), senaryo
// dışına taşıyor mu, oyuncu da garnizonlu mu?
//
// GÖREV 07 / ADIM 2: bütçe artık İL DÜZEYİNDE hesaplanıp parçalara bölünüyor (Soru 3 →
// cevap A). Eskiden parça başına hesaplanıyordu ve ilin toplam savunması PARÇA SAYISIYLA
// çarpılıyordu; parça sayısı yüzölçümünden geldiği için en değerli iller en kârlı hedefler
// oluyordu (Görev 06 §13/1c). Bu dosyanın yeni bölümü o dengeyi kilitliyor.

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { ILLER, PARCALAR } = require('../src/oyun/veri.js');
const { birimSayisi } = require('../src/oyun/ordu.js');
const {
  garnizonBoyu,
  garnizonBirimleri,
  ilGarnizonBoyu,
  ilParcaGarnizonlari,
  ilTipi,
  garnizonlariKur,
} = require('../src/oyun/garnizon.js');

const yeni = (sec) => oyunKur({ senaryo: 'turkiye', tohum: 20260727, ...(sec || {}) });
const ilDegeri = (kod) => ILLER[kod].statlar.nufus + ILLER[kod].statlar.ekonomi;

// ---- İL BÜTÇESİ ----

test('BÜTÇE: ilin toplam garnizonu DEĞERİNDEN türüyor (nüfus + ekonomi)', () => {
  for (const kod of Object.keys(ILLER))
    esit(
      ilGarnizonBoyu(kod),
      Math.max(1, Math.ceil(ilDegeri(kod) * DENGE.GARNIZON.KATSAYI)),
      ILLER[kod].ad
    );
});

test('BÜTÇE: hiçbir il garnizonsuz kalmıyor', () => {
  for (const kod of Object.keys(ILLER))
    dogru(ilGarnizonBoyu(kod) >= 1, ILLER[kod].ad + ' garnizonsuz');
});

test('BÜTÇE: parça SAYISI artık savunmaya girmiyor', () => {
  // Kusurun kendisi buydu: iki il aynı değerdeyse, parçası çok olan daha sert oluyordu.
  const gruplar = {};
  for (const kod of Object.keys(ILLER)) (gruplar[ilDegeri(kod)] ||= []).push(kod);
  let karsilastirilan = 0;
  for (const deger of Object.keys(gruplar)) {
    const g = gruplar[deger];
    if (g.length < 2) continue;
    for (let i = 1; i < g.length; i++) {
      karsilastirilan++;
      esit(
        ilGarnizonBoyu(g[i]),
        ilGarnizonBoyu(g[0]),
        ILLER[g[i]].ad +
          ' (' +
          ILLER[g[i]].parcaSayisi +
          ' parça) ile ' +
          ILLER[g[0]].ad +
          ' (' +
          ILLER[g[0]].parcaSayisi +
          ' parça) aynı değerde ama savunmaları farklı'
      );
    }
  }
  dogru(karsilastirilan > 20, 'karşılaştırma gerçekten koştu: ' + karsilastirilan);
});

test('BÜTÇE: denge sabiti koda gömülü değil', () => {
  const once = ilGarnizonBoyu('34');
  DENGE.GARNIZON.KATSAYI = 1.5;
  const sonra = ilGarnizonBoyu('34');
  DENGE.GARNIZON.KATSAYI = 0.64;
  dogru(sonra > once, 'katsayı büyüyünce garnizon büyümeli');
  esit(ilGarnizonBoyu('34'), once, 'eski değere dönmeli');
});

// ---- PARÇALARA BÖLÜŞÜM (§7'nin üç kuralı) ----

test('BÖLÜŞÜM: parça toplamı ilin bütçesine EŞİT (toplam korunumu)', () => {
  for (const kod of Object.keys(ILLER)) {
    const d = ilParcaGarnizonlari(kod);
    const toplam = Object.keys(d).reduce((a, id) => a + d[id], 0);
    esit(toplam, ilGarnizonBoyu(kod), ILLER[kod].ad);
  }
});

test('BÖLÜŞÜM: hiçbir parça savunmasız doğmuyor (en az 1 kuralı)', () => {
  for (const pid of Object.keys(PARCALAR))
    dogru(garnizonBoyu(pid) >= 1, pid + ' (' + PARCALAR[pid].ad + ') savunmasız');
});

// ---- ⚠ TEKDÜZELİK 2026-09-20'DE YENİDEN YAZILDI (Görev 17) ----
//
// Eski hâli BÜTÜN parçalarda "payı büyük olan az almaz" diyordu ve merkez parça o
// sıralamayı BİLEREK bozuyor: ilin kalbi, değeri daha düşük olsa bile daha çok garnizon
// alıyor (`GARNIZON.MERKEZ_AGIRLIK`).
//
// Test GEVŞETİLMEDİ, DOĞRU BİÇİMDE YAZILDI. Korunan şey hâlâ aynı: bölüşüm keyfî
// olmamalı. Artık iki parça hâlinde sınanıyor:
//   1. MERKEZ DIŞI parçalar kendi aralarında tekdüze (dağıtım hatası buradan yakalanır).
//   2. Merkez, ağırlıksız hâlinden AZ ALMIYOR (ağırlık yanlış yöne uygulanmamış).
test('BÖLÜŞÜM: tekdüzelik — merkez dışı parçalarda payı büyük olan az almıyor', () => {
  for (const kod of Object.keys(ILLER)) {
    const d = ilParcaGarnizonlari(kod);
    const sirali = Object.keys(d)
      .filter((id) => !PARCALAR[id].merkez)
      .map((id) => ({ id, pay: (PARCALAR[id].nufus + PARCALAR[id].ekonomi) / 2 }))
      .sort((a, b) => b.pay - a.pay);
    for (let i = 1; i < sirali.length; i++)
      dogru(
        d[sirali[i].id] <= d[sirali[i - 1].id],
        ILLER[kod].ad + ': ' + sirali[i].id + ' payı küçükken daha çok aldı'
      );
  }
});

test('BÖLÜŞÜM: merkez parça ağırlıksız hâlinden AZ ALMIYOR', () => {
  const asil = DENGE.GARNIZON.MERKEZ_AGIRLIK;
  try {
    DENGE.GARNIZON.MERKEZ_AGIRLIK = 0;
    const agirliksiz = {};
    for (const kod of Object.keys(ILLER)) Object.assign(agirliksiz, ilParcaGarnizonlari(kod));
    DENGE.GARNIZON.MERKEZ_AGIRLIK = asil;

    for (const kod of Object.keys(ILLER)) {
      const d = ilParcaGarnizonlari(kod);
      for (const id of Object.keys(d)) {
        if (!PARCALAR[id].merkez) continue;
        dogru(
          d[id] >= agirliksiz[id],
          ILLER[kod].ad +
            ': merkez ' +
            id +
            ' ağırlıkla DAHA AZ aldı (' +
            agirliksiz[id] +
            '→' +
            d[id] +
            ')'
        );
      }
    }
  } finally {
    DENGE.GARNIZON.MERKEZ_AGIRLIK = asil;
  }
});

test('BÖLÜŞÜM: merkez ağırlığı ilin TOPLAMINI değiştirmiyor', () => {
  const asil = DENGE.GARNIZON.MERKEZ_AGIRLIK;
  try {
    const topla = () => {
      let t = 0;
      for (const kod of Object.keys(ILLER)) t += ilGarnizonBoyu(kod);
      return t;
    };
    DENGE.GARNIZON.MERKEZ_AGIRLIK = 0;
    const once = topla();
    DENGE.GARNIZON.MERKEZ_AGIRLIK = asil;
    esit(topla(), once, 'merkez ağırlığı toplam garnizonu değiştirdi — açılış sertliği kaydı');
  } finally {
    DENGE.GARNIZON.MERKEZ_AGIRLIK = asil;
  }
});

// ---- BU ADIMIN BİTİŞ ÖLÇÜTÜ ----

test('DENGE: değer ÷ savunma yayılımı daraldı (Görev 06 §13/1c kapanışı)', () => {
  const oranlar = Object.keys(ILLER)
    .map((kod) => ilDegeri(kod) / ilGarnizonBoyu(kod))
    .sort((a, b) => a - b);
  const kat = oranlar[oranlar.length - 1] / oranlar[0];
  // Eski kuralda 6.67 kattı (ölçüm: veri/garnizon-olcum.md). Sınır 2.0, ölçülen ~1.56;
  // aradaki pay yuvarlamanın oynaması için — sayı 2'yi aşarsa dağılım gerçekten bozulmuş
  // demektir ve ölçüm yeniden koşulmalı.
  dogru(kat < 2.0, 'yayılım çok geniş: ' + kat.toFixed(2) + ' kat');
});

// ---- KARIŞIM (§4.5) ----

test('KARIŞIM: birim toplamı parçanın garnizon boyuna EŞİT', () => {
  for (const pid of Object.keys(PARCALAR))
    esit(birimSayisi(garnizonBirimleri(pid)), garnizonBoyu(pid), pid);
});

test('KARIŞIM: il tipi §4.5 tablosuna göre seçiliyor', () => {
  const s = (kod) => ILLER[kod].statlar;
  for (const kod of Object.keys(ILLER)) {
    const fark = s(kod).nufus - s(kod).sanayi;
    const beklenen =
      fark >= DENGE.GARNIZON.FARK_ESIGI
        ? 'kalabalik'
        : fark <= -DENGE.GARNIZON.FARK_ESIGI
          ? 'sanayi'
          : 'dengeli';
    esit(ilTipi(kod), beklenen, ILLER[kod].ad);
  }
});

test('KARIŞIM: kalabalık il saf piyade doğuruyor', () => {
  const parca = Object.keys(PARCALAR).find(
    (pid) => ilTipi(PARCALAR[pid].kod) === 'kalabalik' && garnizonBoyu(pid) >= 2
  );
  const b = garnizonBirimleri(parca);
  esit(b.topcu, undefined, parca + ' saf piyade olmalı');
  esit(b.zirhli, undefined, parca + ' saf piyade olmalı');
});

test('KARIŞIM: dengeli il karma doğuruyor (3:1:1)', () => {
  esit(ilTipi('16'), 'dengeli', 'Bursa dengeli olmalı');
  // Bursa'nın bütçesi 9 birim, en büyük parçasına 4 düşüyor — üç türün de görüneceği
  // en küçük boy bu (3:1:1 karışımı 4 birimde 2+1+1 veriyor).
  const parca = Object.keys(PARCALAR).find(
    (pid) => PARCALAR[pid].kod === '16' && garnizonBoyu(pid) >= 4
  );
  const b = garnizonBirimleri(parca);
  dogru(b.piyade > 0 && b.topcu > 0 && b.zirhli > 0, parca + ' üç türü de içermeli');
  dogru(b.piyade >= b.topcu && b.piyade >= b.zirhli, 'piyade baskın olmalı (3:1:1)');
});

test('KARIŞIM: yalnızca karışımda geçen türler basılıyor', () => {
  for (const pid of Object.keys(PARCALAR)) {
    const karisim = DENGE.GARNIZON.KARISIM[ilTipi(PARCALAR[pid].kod)];
    for (const tur of Object.keys(garnizonBirimleri(pid)))
      dogru(karisim[tur] > 0, pid + ' karışımda olmayan tür bastı: ' + tur);
  }
});

// ---- KURULUM ----

test('KURULUM: senaryodaki HER parçada garnizon var, sahibi kendi ili', () => {
  const d = yeni();
  const parcalar = Object.keys(d.parcaSahipligi);
  esit(Object.keys(d.ordular).length, parcalar.length, 'her parçada ordu olmalı');
  for (const pid of parcalar) {
    esit(d.ordular[pid].sahip, PARCALAR[pid].kod, pid + ' sahibi');
    esit(birimSayisi(d.ordular[pid].birimler), garnizonBoyu(pid), pid + ' boyu');
  }
});

test('KURULUM: oyuncunun parçaları da garnizonlu (tek savunmasız taraf olmasın)', () => {
  const d = yeni();
  const benim = Object.keys(d.parcaSahipligi).filter(
    (p) => d.parcaSahipligi[p] === d.oyuncuAktorId
  );
  dogru(benim.length > 0, 'oyuncunun parçası yok');
  for (const p of benim) dogru(birimSayisi(d.ordular[p].birimler) > 0, p + ' garnizonsuz');
});

test('KURULUM: senaryo dışına garnizon taşmıyor', () => {
  const d = oyunKur({ senaryo: 'karadeniz', tohum: 1 });
  for (const pid of Object.keys(d.ordular))
    dogru(d.parcaSahipligi[pid] !== undefined, pid + ' kapsam dışı ama garnizonlu');
  esit(Object.keys(d.ordular).length, Object.keys(d.parcaSahipligi).length);
});

test('BELİRLENİMCİ: farklı tohumlarda bile aynı garnizon (rastgelelik yok)', () => {
  const a = oyunKur({ senaryo: 'turkiye', tohum: 1 });
  const b = oyunKur({ senaryo: 'turkiye', tohum: 999999 });
  esit(JSON.stringify(a.ordular), JSON.stringify(b.ordular), 'garnizon tohumdan bağımsız olmalı');
});

test('BELİRLENİMCİ: kurulum üreteci HİÇ ilerletmiyor', () => {
  // Muharebelerin şansı tohumla birebir eşleşsin diye kurulumda rastgele sayı harcanmıyor.
  const d = yeni({ tohum: 4242 });
  esit(d.rastgele.durum, d.rastgele.tohum, 'kurulumda üreteç ilerlememeli');
});

test('KURULUM: zaten ordusu olan parçaya dokunmuyor', () => {
  const d = yeni();
  const elle = { ...d, ordular: { '16-1': { sahip: '16', birimler: { zirhli: 9 } } } };
  const sonra = garnizonlariKur(elle);
  esit(sonra.ordular['16-1'].birimler.zirhli, 9, 'var olan ordu korunmalı');
  dogru(birimSayisi(sonra.ordular['16-2'].birimler) > 0, 'boş parçalar doldurulmalı');
});

test('ÖLÇEK: toplam garnizon 181 parçada 475 birim (denge referansı)', () => {
  // Eski kuralda 470'ti; katsayı (0.64) tam da bu sayıya en çok yaklaşacak şekilde
  // ölçümle seçildi — açılışın sertliği korunsun, değişen yalnız DAĞILIM olsun.
  const d = yeni();
  let toplam = 0;
  for (const pid of Object.keys(d.ordular)) toplam += birimSayisi(d.ordular[pid].birimler);
  esit(toplam, 475, 'sayı değiştiyse denge yeniden gözden geçirilmeli');
});
