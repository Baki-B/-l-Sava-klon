// BAŞARIM VE SAYAÇ TESTLERİ (Görev 12 / Adım 11).
//
// Asıl sorular: sayaçlar gerçek bir maçta artıyor mu, mühür koşulları hak edilmeden
// açılmıyor mu, kimlikler benzersiz mi, koşullar patlarsa oyun duruyor mu?
//
// ⚠ KİMLİK TESTİ ÖNEMLİ: mühür kimliği kayıtta duruyor. İki mühür aynı kimliği alırsa
// oyuncunun kazandığı mühür sessizce başka bir mühre yazılır.

const { test, dogru, esit } = require('./yardimci');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { yeniSayaclar, macOzeti } = require('../src/oyun/sayac.js');
const {
  BASARIMLAR,
  KATEGORILER,
  kazanilanlar,
  basarimBaglami,
} = require('../src/oyun/basarimlar.js');

const kur = (sec) => oyunKur({ senaryo: 'turkiye', tohum: 20260806, ...(sec || {}) });

test('MÜHÜR: kimlikler BENZERSİZ (kayıt bunun üstünde duruyor)', () => {
  const gorulen = new Set();
  for (const b of BASARIMLAR) {
    dogru(!gorulen.has(b.id), 'iki mühür aynı kimliği taşıyor: ' + b.id);
    gorulen.add(b.id);
  }
  esit(gorulen.size, BASARIMLAR.length, 'kimlik sayısı');
});

test('MÜHÜR: her mührün kategorisi ve kademesi tanımlı', () => {
  const kategoriler = new Set(KATEGORILER.map(([k]) => k));
  for (const b of BASARIMLAR) {
    dogru(kategoriler.has(b.kategori), b.id + ' tanımsız kategoride: ' + b.kategori);
    dogru(['bronz', 'gumus', 'altin'].includes(b.kademe), b.id + ' tanımsız kademe');
    dogru(typeof b.aciklama === 'string' && b.aciklama.length > 0, b.id + ' açıklaması yok');
    dogru(typeof b.glif === 'string' && b.glif.length > 0, b.id + ' glifi yok');
  }
});

test('MÜHÜR: yeni oyunda HİÇBİRİ kazanılmış sayılmıyor', () => {
  // Tek istisna olmamalı: oyuncu daha hiçbir şey yapmadı.
  const kazanilan = kazanilanlar(kur());
  esit(kazanilan.length, 0, 'yeni oyunda kazanılan mühür: ' + kazanilan.join(', '));
});

test('MÜHÜR: koşul patlarsa oyun DURMUYOR, o mühür kazanılmamış sayılıyor', () => {
  const d = kur();
  const bozuk = { ...d, sayaclar: null };
  const kazanilan = kazanilanlar(bozuk);
  dogru(Array.isArray(kazanilan), 'bozuk durumda çöktü');
});

test('SAYAÇ: yeni maçta sıfırdan başlıyor ve başlangıç bölgesi yazılı', () => {
  const d = kur();
  dogru(d.sayaclar, 'sayaç alanı yok');
  esit(d.sayaclar.savas, 0, 'savaş sayacı');
  esit(d.sayaclar.fetih, 0, 'fetih sayacı');
  dogru(d.sayaclar.baslangicParca > 0, 'başlangıç bölgesi yazılmamış');
  esit(d.sayaclar.enDusukParca, d.sayaclar.baslangicParca, 'en düşük bölge');
});

test('SAYAÇ: gerçek maçta tur ilerliyor ve sayaçlar birikiyor', () => {
  let d = kur({ zorluk: 'zor' });
  for (let i = 0; i < 12; i++) d = turuBitir(d);
  esit(d.sayaclar.tur, 12, 'tur sayacı');
  dogru(d.sayaclar.enDusukParca <= d.sayaclar.baslangicParca, 'en düşük bölge artmış');
});

test('SAYAÇ: diplomasi eylemleri YALNIZCA oyuncu için sayılıyor', () => {
  const { teklifUygula } = require('../src/oyun/diplomasi.js');
  const d = kur();
  // Oyuncunun kendi anlaşması sayılmalı.
  const benim = teklifUygula(d, d.oyuncuAktorId, '10', 'ittifak');
  if (benim.ok) esit(benim.durum.sayaclar.anlasma, 1, 'oyuncunun anlaşması sayılmadı');
  // İki yapay zekânın kendi arasındaki anlaşması SAYILMAMALI.
  const onlarin = teklifUygula(d, '06', '42', 'ittifak');
  if (onlarin.ok) esit(onlarin.durum.sayaclar.anlasma, 0, 'zekânın anlaşması oyuncuya yazıldı');
});

test('SAYAÇ: maç özeti sayaçlardan üretiliyor ve satırları dolu', () => {
  let d = kur();
  for (let i = 0; i < 3; i++) d = turuBitir(d);
  const ozet = macOzeti(d);
  dogru(ozet.length >= 5, 'özet satırı az');
  for (const [etiket, deger] of ozet) {
    dogru(typeof etiket === 'string' && etiket.length > 0, 'etiket boş');
    dogru(typeof deger === 'string' && deger.length > 0, etiket + ' değeri boş');
  }
});

test('BAĞLAM: bölge/il sayımı kapsam içinde kalıyor', () => {
  const d = kur();
  const b = basarimBaglami(d);
  esit(b.toplamParca, 181, 'Türkiye kapsamında toplam bölge');
  dogru(b.parca > 0 && b.parca < b.toplamParca, 'oyuncunun bölgesi');
  dogru(b.tamIl >= 1, 'oyuncunun kendi ili tam olmalı');
});

test('BAĞLAM: yeni sayaç tablosu bütün alanları taşıyor', () => {
  const s = yeniSayaclar(2);
  for (const alan of ['savas', 'fetih', 'ilan', 'anlasma', 'ateskes', 'ihanet', 'toparlanan']) {
    esit(s[alan], 0, alan + ' alanı yok ya da sıfır değil');
  }
});

// ---- SAVAŞSIZ ALINAN / BOŞKEN KAYBEDİLEN BÖLGE (2026-09-24 düzeltmesi) ----
// Giriş satırında `savunanId` yok (savunan ordu yok) ve eskiden `sahip` de yoktu: savaşsız
// alınan bölge "bölge alındı"ya, boş bırakılıp kaybedilen bölge "kaybedildi"ye sayılmıyordu.
test('SAYAÇ: savaşsız alınan ve boşken kaybedilen bölge sayılıyor', () => {
  const { sayaclariIlerlet } = require('../src/oyun/sayac.js');
  const ben = '16';
  const rapor = {
    satirlar: [
      // Benim boş bir parçaya yürüyüşüm (hamle kapısından: yalnız aktorId).
      { tip: 'giris', aktorId: ben, kaynak: '16-1', hedef: '10-1', fethedildi: true },
      // Rakip benim boş parçama yürüdü.
      {
        tip: 'giris',
        aktorId: '41',
        sahip: '41',
        kaynak: '41-1',
        hedef: '16-2',
        fethedildi: true,
        eskiSahip: ben,
      },
      // Rakip rakibe — beni ilgilendirmiyor.
      {
        tip: 'giris',
        aktorId: '41',
        sahip: '41',
        kaynak: '41-2',
        hedef: '54-1',
        fethedildi: true,
        eskiSahip: '54',
      },
    ],
  };
  const s = sayaclariIlerlet(yeniSayaclar(3), rapor, ben, 3, {});
  esit(s.fetih, 1, 'savaşsız alınan bölge sayılmadı');
  esit(s.kayipBolge, 1, 'boşken kaybedilen bölge sayılmadı');
});
