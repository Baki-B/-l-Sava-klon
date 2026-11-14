// KURULUŞ GARNİZONU (Görev 05 / Adım 6 · Soru 2 → Baki'nin cevabı A, 2026-07-27).
//
// SORUN: muharebe yazıldı ama karşısında kimse yok. Oyuncudan başka hiçbir aktör asker
// basmıyor; garnizon olmasaydı her saldırı boş parçaya yürümekten ibaret kalır ve yazılan
// muharebe kodu yalnızca testlerde çalışırdı.
//
// ÇÖZÜM: oyun kurulurken her parçaya ilinin statlarından türetilmiş sabit bir savunma
// ordusu konur. Görev 07'de gerçek yapay zekâ gelince bu ordular onun başlangıç kuvveti
// oldu; artık "karar vermeyen veri" değiller — oynayan aktörlerin açılış kuvvetiler.
//
// OYUNCUNUN PARÇALARI DA GARNİZONLU. "Tarafsız parçaya" denmişti ama oyun başında herkes
// tarafsız: her il kendi parçalarını tutan bağımsız bir aktör (§6.1). Oyuncuyu istisna
// yapmak onu tek savunmasız taraf yapardı.
//
// RASTGELELİK YOK. Görev belgesi tohumlu üretim öneriyordu; gerek kalmadı — formül tamamen
// veriden türüyor, yani zaten belirlenimci ve tekrar üretilebilir. Tohum harcamamanın iki
// faydası var: her oyun aynı, adil ve test edilebilir bir açılışla başlıyor; üreteç
// kurulumda hiç ilerlemediği için muharebelerin şansı tohumla birebir eşleşiyor.
//
// ---- GÖREV 07 / ADIM 2: BÜTÇE İL DÜZEYİNDE (Soru 3 → Baki'nin cevabı A) ----
//
// Garnizon eskiden PARÇA BAŞINA hesaplanıyordu ve ilin toplam savunması parça sayısıyla
// çarpılıyordu. Parça sayısı §7'ye göre YÜZÖLÇÜMÜNDEN geliyor, güçten değil; sonuç,
// en değerli illerin en kârlı hedefler olmasıydı (ölçüm: Görev 06 §13/1c, 6.67 kat yayılım).
//
// Artık ilin TOPLAM savunması değerine orantılı belirleniyor, sonra parçalara bölünüyor.
// Bölüşüm için yeni bir kural yazılmadı: `uretim.js parcaDegerleri` — §7'nin üç kuralı
// (oransal dağıtım · en az 1 · tekdüzelik) — üretimde ne yapıyorsa burada da onu yapıyor.
// Aynı kuralın iki yerde tutulmaması bu projenin en pahalı dersiydi (Görev 05).

import { DENGE } from '../denge.js';
import { PARCALAR, ILLER } from './veri.js';
import { parcaDegerleri } from './uretim.js';

// İl tipi §4.5'teki "hangi il hangi orduyu doğurur" tablosundan seçilir.
// KARIŞIMI hâlâ nüfus–sanayi farkı belirliyor; il düzeyi bütçeye geçiş yalnızca KAÇ birim
// olacağını değiştirdi, HANGİ birimler olacağını değil.
export function ilTipi(ilKodu) {
  const s = ILLER[ilKodu].statlar;
  const fark = s.nufus - s.sanayi;
  if (fark >= DENGE.GARNIZON.FARK_ESIGI) return 'kalabalik';
  if (fark <= -DENGE.GARNIZON.FARK_ESIGI) return 'sanayi';
  return 'dengeli';
}

// Bir ilin TOPLAM garnizonu: ⌈(nüfus statı + ekonomi statı) × KATSAYI⌉, en az 1.
// İstanbul 14, Ankara 12, Iğdır 4 çıkar; 181 parçada toplam 470 birim (ölçüm raporunda).
export function ilGarnizonBoyu(ilKodu) {
  const s = ILLER[ilKodu].statlar;
  return Math.max(1, Math.ceil((s.nufus + s.ekonomi) * DENGE.GARNIZON.KATSAYI));
}

// Bir ilin parçaları, kimlik sırasında (16-1, 16-2, …). Sıralı olması sonucun tekrar
// üretilebilir olmasını sağlıyor — `uretim.js`'teki tablo kurulumunun aynı kuralı.
function ilinParcalari(ilKodu) {
  return Object.keys(PARCALAR)
    .filter((pid) => PARCALAR[pid].kod === ilKodu)
    .sort();
}

// İlin garnizon bütçesinin parçalara bölünmüş hâli: { "16-1": 5, "16-2": 4, … }
//
// PAY = parçanın nüfus ve ekonomi paylarının ORTALAMASI. İkisi ayrı ayrı toplamı 1 olan
// dizilerdir (bkz. `veri/parcalar.json`); garnizon tek bir sayı olduğu için tek bir pay
// dizisi gerekiyor ve ilin değeri de bu iki statın toplamı. Yalnız nüfus payı kullanılsaydı
// sanayi ağırlıklı parçalar savunmasız kalırdı.
//
// PAYLAR EŞİTE DOĞRU YUMUŞATILIR (2026-07-31, Baki: "8 güçte 1 parçaya 7 diğerine 1 vermek
// çok dengesiz"). Ham paylarla Gaziantep 9 güçte 8-1 çıkıyordu; yumuşatmayla 6-3 oluyor.
// Katsayı `DENGE.GARNIZON.PAY_YUMUSATMA` — gerekçesi ve ölçümü orada.
//
// Yumuşatma ÜRETİME UYGULANMAZ, yalnız garnizona: üretimde parçanın değeri onun getirisidir
// ve orada uçlar doğru davranış. Burada ölçülen şey "bu parçayı almak ne kadar zor",
// ve bir ilin tek bir parçasının imkânsız, ötekilerinin bedava olması iyi bir harita değil.
export function ilParcaGarnizonlari(ilKodu) {
  const ids = ilinParcalari(ilKodu);
  if (ids.length === 0) return {};
  const ham = ids.map((id) => (PARCALAR[id].nufus + PARCALAR[id].ekonomi) / 2);
  const toplam = ham.reduce((a, b) => a + b, 0);
  const esit = 1 / ids.length;
  const K = DENGE.GARNIZON.PAY_YUMUSATMA;
  let paylar = toplam > 0 ? ham.map((x) => (1 - K) * (x / toplam) + K * esit) : ids.map(() => esit);

  // ---- MERKEZ PARÇA DAHA SERT (Görev 17) ----
  //
  // ⚠ İLİN TOPLAMI DEĞİŞMİYOR. Merkezin payı ağırlaşıyor, sonra paylar yeniden
  // normalleştiriliyor — `parcaDegerleri` sabit bir toplamı bölüştürdüğü için ilin toplam
  // garnizonu aynı kalıyor. Değişen tek şey ilin NEREDE sert olduğu; 2026-07-31'de ölçülen
  // açılış sertliği (toplam 475 birim) korunuyor.
  //
  // Tek parçalı ilde çarpan 1.00, yani etki yok: o parça zaten ilin kendisi.
  const carpan = 1 + DENGE.GARNIZON.MERKEZ_AGIRLIK * (ids.length - 1);
  if (carpan !== 1) {
    const agirlikli = ids.map((id, i) => (PARCALAR[id].merkez ? paylar[i] * carpan : paylar[i]));
    const yeniToplam = agirlikli.reduce((a, b) => a + b, 0);
    paylar = yeniToplam > 0 ? agirlikli.map((x) => x / yeniToplam) : paylar;
  }

  const degerler = parcaDegerleri(paylar, ilGarnizonBoyu(ilKodu));
  const sonuc = {};
  ids.forEach((id, i) => (sonuc[id] = degerler[i]));
  return sonuc;
}

// Bir parçaya konacak birim sayısı.
export function garnizonBoyu(parcaId) {
  const p = PARCALAR[parcaId];
  if (!p) return 0;
  return ilParcaGarnizonlari(p.kod)[parcaId] || 0;
}

// Birim sayısını karışım oranına EN BÜYÜK ARTIK yöntemiyle böler (üretim.js'teki parça
// paylaştırmasının aynısı) — toplam her zaman istenen sayıya eşit çıkar.
export function garnizonBirimleri(parcaId) {
  const adet = garnizonBoyu(parcaId);
  if (adet <= 0) return {};
  const karisim = DENGE.GARNIZON.KARISIM[ilTipi(PARCALAR[parcaId].kod)];
  const turler = DENGE.BIRIM_SIRASI.filter((t) => karisim[t] > 0);
  const toplamPay = turler.reduce((a, t) => a + karisim[t], 0);

  const ham = turler.map((t) => (adet * karisim[t]) / toplamPay);
  const birimler = {};
  let dagitilan = 0;
  turler.forEach((t, i) => {
    const n = Math.floor(ham[i]);
    if (n > 0) birimler[t] = n;
    dagitilan += n;
  });
  // Kalanlar artığı en büyük türe, eşitlikte BIRIM_SIRASI'na göre.
  const sira = turler
    .map((t, i) => ({ t, artik: ham[i] - Math.floor(ham[i]), i }))
    .sort((a, b) => b.artik - a.artik || a.i - b.i);
  for (let k = 0; dagitilan < adet; k++, dagitilan++) {
    const t = sira[k % sira.length].t;
    birimler[t] = (birimler[t] || 0) + 1;
  }
  return birimler;
}

// Senaryodaki her parçaya garnizonunu koyar. Zaten ordusu olan parçaya DOKUNMAZ
// (yeni oyunda hiçbirinin yok; koruma, ileride kurulum sırası değişirse diye).
//
// GARNİZONU 0 ÇIKAN PARÇA OLMAZ: `parcaDegerleri`'nin "en az 1" kuralı her parçaya en az
// bir birim düşmesini garantiliyor — üretimde "hiçbir parça 0 üretmez" ne demekse burada
// da "hiçbir parça savunmasız doğmaz" o demek.
export function garnizonlariKur(durum) {
  const ordular = { ...(durum.ordular || {}) };
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (ordular[pid]) continue;
    const birimler = garnizonBirimleri(pid);
    if (Object.keys(birimler).length === 0) continue;
    ordular[pid] = { sahip: durum.parcaSahipligi[pid], birimler };
  }
  return { ...durum, ordular };
}
