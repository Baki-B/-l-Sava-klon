// HARİTA ÖLÇÜSÜ TESTLERİ (Görev 03B / Adım 6).
// Kural: her parça, üstünde ordu rozeti taşıyabilecek kadar büyük olmalı.
// Ölçü: iç çember çapı (parçanın içine sığan en büyük dairenin çapı).
// Bu test ileride biri parça bölerse kuralın kendini korumasını sağlar.

const { test, dogru, esit } = require('./yardimci');
const { halkalar, icCember, ortakSinir, kenarKumesi } = require('../scripts/parca-geometri');
const parcalarData = require('../veri/parcalar.json');
const illerData = require('../veri/iller.json');

const P = parcalarData.parcalar;

// Baki'nin seçtiği eşik: "yatay tutuşta 2× yakınlaştırmada rozet sığsın"
// = 26 px rozet / (0.912 px-per-birim × 2) = 14.25 birim.
const ESIK = 14.25;

// Eşiğin altında kalmasına BİLEREK izin verilen parçalar. Her biri Baki'nin kararı;
// listeye yeni satır eklemek yeni bir karar demektir, sessizce eklenmemeli.
const ISTISNALAR = {
  '77-1': 'Yalova — tek parçalı il, bir il 1 parçanın altına inemez',
  '79-1': 'Kilis — tek parçalı il',
  '17-1': 'Gelibolu Yarımadası — aynı ilde kara komşusu yok, birleşirse parça kopuk kalır',
  '31-2': 'İskenderun Körfezi — Hatay 2 parça kalsın (Baki’nin kararı)',
  '41-1': 'Gebze Sanayi — Kocaeli 2 parça kalsın (Baki’nin kararı)',
};

const olcum = {};
for (const pid of Object.keys(P)) olcum[pid] = icCember(halkalar(P[pid].yol)).cap;

test('her parça ordu rozetini taşıyacak kadar büyük (iç çember ≥ ' + ESIK + ')', () => {
  const kucukler = Object.keys(olcum).filter((pid) => olcum[pid] < ESIK && !ISTISNALAR[pid]);
  dogru(
    kucukler.length === 0,
    'eşiğin altında beklenmeyen parça: ' +
      kucukler.map((p) => p + ' ' + P[p].ad + ' (' + olcum[p].toFixed(1) + ')').join(', ')
  );
});

test('istisna listesi güncel — listedeki her parça hâlâ var ve hâlâ eşiğin altında', () => {
  for (const pid of Object.keys(ISTISNALAR)) {
    dogru(P[pid] !== undefined, pid + ' artık haritada yok, istisna listesinden çıkarılmalı');
    dogru(
      olcum[pid] < ESIK,
      pid + ' artık eşiğin üstünde (' + olcum[pid].toFixed(1) + '), istisna gereksiz'
    );
  }
});

test('parça sayısı kuralı: her il 1–4 parça', () => {
  for (const kod of Object.keys(illerData)) {
    const n = illerData[kod].parcaSayisi;
    dogru(n >= 1 && n <= 4, kod + ' ' + illerData[kod].ad + ' ' + n + ' parça (1–4 olmalı)');
  }
});

test('tek parçalı illerin parçası ile çok parçalı il ayrımı doğru', () => {
  // İstisnaların gerekçeleri tutarlı mı: "tek parçalı il" diyenler gerçekten tek parçalı mı?
  esit(illerData['77'].parcaSayisi, 1, 'Yalova');
  esit(illerData['79'].parcaSayisi, 1, 'Kilis');
  esit(illerData['31'].parcaSayisi, 2, 'Hatay 2 parça kalmalı');
  esit(illerData['41'].parcaSayisi, 2, 'Kocaeli 2 parça kalmalı');
  esit(illerData['52'].parcaSayisi, 2, 'Ordu 2 parça kalmalı');
  esit(illerData['06'].parcaSayisi, 4, 'Ankara 4 parça (1–4 kuralı)');
});

test('Gelibolu gerçekten kara bağlantısız (istisnanın gerekçesi doğru)', () => {
  const kenar = {};
  for (const pid of Object.keys(P)) kenar[pid] = kenarKumesi(halkalar(P[pid].yol));
  const canakkale = Object.keys(P).filter((pid) => P[pid].kod === '17' && pid !== '17-1');
  for (const pid of canakkale)
    esit(ortakSinir(kenar['17-1'], kenar[pid]), 0, '17-1 ile ' + pid + ' ortak kara sınırı');
});
