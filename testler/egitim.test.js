// EĞİTİM TESTLERİ (GOREV-20 Adım 8).
//
// Ölçülen asıl sorular:
//   1. Eğitim maçı söz verdiği gibi mi kuruluyor (savaş açık, güçlü kaynak, zayıf hedef,
//      ilk turda asker basacak bütçe)?
//   2. Oyuncu parıltıyı izlerse ilk saldırı GERÇEKTEN kazanılıyor ve il fethediliyor mu?
//      Eğitimin ilk dersinin "kaybettin" olması en kötü açılış olurdu.
//   3. Adımlar durumdan doğru çıkıyor mu — atlanan, geri alınan, başarısız hamlede de?

const { test, dogru, esit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { egitimKur, egitimAdimi, egitimOdagi, EGITIM_ADIMLARI } = require('../src/oyun/egitim.js');
const { savastaMi } = require('../src/oyun/diplomasi.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { birimUret, ilUretimHakki } = require('../src/oyun/ordu.js');
const { kullanilabilirBirimler, hedefleriAyir } = require('../src/oyun/hareket.js');
const { ilTamamMi } = require('../src/oyun/fetih.js');
const { muharebeTahmini } = require('../src/oyun/muharebe.js');
const { moralBonuslari } = require('../src/oyun/cozum.js');
const { aktorStatlari, aktorEtkileri } = require('../src/oyun/arastirma.js');
const { PARCALAR } = require('../src/oyun/veri.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');

const E = DENGE.EGITIM;

// ---- 1. KURULUM ----

test('EĞİTİM: Marmara, oyuncu Bursa, sabit tohum', () => {
  const d = egitimKur();
  esit(d.senaryo.anahtar, E.KAPSAM);
  esit(d.oyuncuAktorId, E.OYUNCU);
  esit(d.rastgele.tohum, E.TOHUM);
  esit(d.tur, 1);
  // Aynı kurulum her seferinde aynı (tohum sabit, rastgelelik yok).
  esit(JSON.stringify(egitimKur()), JSON.stringify(d), 'kurulum kararsız');
});

test('EĞİTİM: hedefin sahibiyle SAVAŞ baştan açık, başkasıyla değil', () => {
  const d = egitimKur();
  const hedefSahibi = d.parcaSahipligi[E.HEDEF];
  dogru(hedefSahibi !== E.OYUNCU, 'hedef oyuncunun olmamalı');
  dogru(savastaMi(d, E.OYUNCU, hedefSahibi), 'savaş açık değil');
  const savas = Object.values(d.iliskiler).filter((r) => r.tip === 'savas').length;
  esit(savas, 1, 'tek savaş olmalı');
});

test('EĞİTİM: kaynak hedefe komşu ve saldırabiliyor', () => {
  const d = egitimKur();
  esit(d.parcaSahipligi[E.KAYNAK], E.OYUNCU);
  const a = hedefleriAyir(d, E.OYUNCU, E.KAYNAK);
  dogru(a.dusman.includes(E.HEDEF), 'hedef saldırı hedefleri arasında değil');
});

test('EĞİTİM: ilk turda asker basacak bütçe var (normal maç sıfırla başlar)', () => {
  const d = egitimKur();
  const hak = ilUretimHakki(d, PARCALAR[E.URETIM_PARCA].kod, E.OYUNCU);
  dogru(hak.kalan >= 2, 'sanayi hakkı yetmiyor');
  const s = birimUret(d, E.URETIM_PARCA, E.OYUNCU, { piyade: 2 });
  dogru(s.ok, 'iki piyade basılamadı: ' + (s.sebep || ''));
});

test('EĞİTİM: işaret hamleden ve tur sonundan sağ çıkıyor (kayıt/mühür kilidi ona bağlı)', () => {
  // Kanca kaydı, otomatik kaydı ve mühür sınamasını `durum.egitim`e bakarak kapatıyor.
  // Bir fonksiyon durumu bilinen alanlardan yeniden kursaydı işaret düşer ve eğitim
  // oyuncunun yuvasına yazılırdı.
  const d = egitimKur();
  esit(d.egitim, true);
  const s = hamleUygula(d, E.OYUNCU, E.KAYNAK, E.HEDEF, kullanilabilirBirimler(d, E.KAYNAK));
  esit(s.durum.egitim, true, 'hamleden sonra düştü');
  const t = turuBitir(s.durum);
  esit(t.egitim, true, 'tur sonunda düştü');
  esit(t.tur, 2);
  // Normal maçta işaret yok.
  dogru(!oyunKur({ senaryo: 'marmara' }).egitim, 'normal maç eğitim sanılıyor');
});

// ---- 2. İLK SALDIRI KAZANILIYOR ----

test('EĞİTİM: TÜMÜ ile saldırı hedefi ALIYOR ve il fethediliyor', () => {
  const d = egitimKur();
  const tumu = kullanilabilirBirimler(d, E.KAYNAK);
  const s = hamleUygula(d, E.OYUNCU, E.KAYNAK, E.HEDEF, tumu);
  dogru(s.ok, 'hamle reddedildi: ' + (s.sebep || ''));
  esit(s.durum.parcaSahipligi[E.HEDEF], E.OYUNCU, 'hedef alınamadı');
  // Yalova tek parçalı: ilk fetih aynı zamanda ilk il ("İL FETHEDİLDİ" kartı).
  dogru(ilTamamMi(s.durum, PARCALAR[E.HEDEF].kod, E.OYUNCU), 'il tamamlanmadı');
});

test('EĞİTİM: yalnızca piyadelerle de kazanılıyor (oyuncu TÜMÜ demeyebilir)', () => {
  const d = egitimKur();
  const s = hamleUygula(d, E.OYUNCU, E.KAYNAK, E.HEDEF, { piyade: E.KAYNAK_ORDU.piyade });
  dogru(s.ok, 'hamle reddedildi');
  esit(s.durum.parcaSahipligi[E.HEDEF], E.OYUNCU, 'hedef alınamadı');
});

test('EĞİTİM: "KAZANIRSIN" diyen HER kuvvet gerçekten kazanıyor', () => {
  // Eğitim "asker seç" adımında tahmin yeşile dönene kadar bekliyor. Yeşil deyip kaybetmek
  // ilk dersi yalan yapardı; sabit tohumla her olası kuvvet denenir.
  const d = egitimKur();
  const dus = d.parcaSahipligi[E.HEDEF];
  const tahmin = (birimler) =>
    muharebeTahmini({
      saldiran: { birimler },
      savunan: { birimler: d.ordular[E.HEDEF].birimler },
      arazi: PARCALAR[E.HEDEF].arazi,
      moralBonuslari: moralBonuslari(d, E.KAYNAK, E.HEDEF, E.OYUNCU, dus),
      statlar: { saldiran: aktorStatlari(d, E.OYUNCU), savunan: aktorStatlari(d, dus) },
      etkiler: { saldiran: aktorEtkileri(d, E.OYUNCU), savunan: aktorEtkileri(d, dus) },
    }).kademe;
  const K = E.KAYNAK_ORDU;
  let yesil = 0;
  for (let p = 0; p <= (K.piyade || 0); p++)
    for (let t = 0; t <= (K.topcu || 0); t++)
      for (let z = 0; z <= (K.zirhli || 0); z++) {
        const b = {};
        if (p) b.piyade = p;
        if (t) b.topcu = t;
        if (z) b.zirhli = z;
        if (!p && !t && !z) continue;
        if (tahmin(b) !== 'ustun') continue;
        yesil++;
        const s = hamleUygula(d, E.OYUNCU, E.KAYNAK, E.HEDEF, b);
        esit(s.durum.parcaSahipligi[E.HEDEF], E.OYUNCU, JSON.stringify(b) + ' yeşil ama kaybetti');
      }
  dogru(yesil >= 3, 'yeterince yeşil kuvvet yok: ' + yesil);
});

// ---- 3. ADIMLAR ----

// Eğitimin başındaki anlık görüntü; testler üstüne yazıyor.
const bas = (ek) => ({
  fetih: false,
  kaynakHazir: true,
  kaynakVar: true,
  uretildi: false,
  turBitti: false,
  kipKaynak: null,
  emirHedefi: null,
  tahminKademe: null,
  uretimAcik: false,
  ...ek,
});

test('EĞİTİM ADIMI: sırayla ordu → hedef → asker → saldır', () => {
  const a1 = egitimAdimi(bas());
  esit(a1.anahtar, 'ordu');
  esit(a1.parca, E.KAYNAK);
  const a2 = egitimAdimi(bas({ kipKaynak: E.KAYNAK }));
  esit(a2.anahtar, 'hedef');
  esit(a2.parca, E.HEDEF);
  const a3 = egitimAdimi(bas({ kipKaynak: E.KAYNAK, emirHedefi: E.HEDEF }));
  esit(a3.anahtar, 'asker');
  esit(a3.dugme, 'tumu');
  // Kuvvet "kıl payı"yken hâlâ asker seç: ilk saldırı zayıf başlamasın.
  esit(
    egitimAdimi(bas({ kipKaynak: E.KAYNAK, emirHedefi: E.HEDEF, tahminKademe: 'denk' })).anahtar,
    'asker'
  );
  const a4 = egitimAdimi(bas({ kipKaynak: E.KAYNAK, emirHedefi: E.HEDEF, tahminKademe: 'ustun' }));
  esit(a4.anahtar, 'saldir');
  esit(a4.parca, E.HEDEF);
});

test('EĞİTİM ADIMI: başka ordu seçilirse kaynağa geri çağırıyor', () => {
  const a = egitimAdimi(bas({ kipKaynak: E.URETIM_PARCA }));
  esit(a.anahtar, 'ordu');
  esit(a.parca, E.KAYNAK);
});

test('EĞİTİM ADIMI: saldıramıyorsa (hak bitti) turu bitir', () => {
  const a = egitimAdimi(bas({ kaynakHazir: false }));
  esit(a.anahtar, 'tur');
  // Ara tur: bitirmek eğitimi BİTİRMEZ (fetih ve üretim hâlâ önde).
  dogru(!a.son, 'ara tur son sanıldı');
});

test('EĞİTİM ADIMI: fetihten sonra asker bas — harita → çubuk → üretim ekranı', () => {
  const a1 = egitimAdimi(bas({ fetih: true }));
  esit(a1.anahtar, 'uret');
  esit(a1.parca, E.URETIM_PARCA);
  esit(egitimAdimi(bas({ fetih: true, kipKaynak: E.URETIM_PARCA })).dugme, 'askerBas');
  esit(egitimAdimi(bas({ fetih: true, uretimAcik: true })).dugme, 'uretEkrani');
});

test('EĞİTİM ADIMI: üretimden sonra turu bitir, sonra bitti', () => {
  const a = egitimAdimi(bas({ fetih: true, uretildi: true }));
  esit(a.anahtar, 'tur');
  esit(a.dugme, 'turBitir');
  esit(a.son, true, 'son tur işaretsiz');
  esit(egitimAdimi(bas({ fetih: true, uretildi: true, turBitti: true })).anahtar, 'bitti');
});

test('EĞİTİM ADIMI: kaynakta ordu kalmadıysa fetih dersi atlanıyor (takılmıyor)', () => {
  esit(egitimAdimi(bas({ kaynakVar: false, kaynakHazir: false })).anahtar, 'uret');
});

test('EĞİTİM: her adım ilerleme listesinde, odak iki parçanın arasında', () => {
  for (const k of ['ordu', 'hedef', 'asker', 'saldir', 'uret', 'tur'])
    dogru(EGITIM_ADIMLARI.includes(k), k + ' listede yok');
  const o = egitimOdagi();
  const a = PARCALAR[E.KAYNAK].etiket,
    b = PARCALAR[E.HEDEF].etiket;
  dogru(o.x >= Math.min(a.x, b.x) && o.x <= Math.max(a.x, b.x), 'odak x dışarıda');
  dogru(o.y >= Math.min(a.y, b.y) && o.y <= Math.max(a.y, b.y), 'odak y dışarıda');
});
