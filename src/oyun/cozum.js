// ÇÖZÜM — emir kuyruğunun işlenmesi (Görev 05 / Adım 3–4 — tasarım §8/6).
//
// `hareket.js` "ne emredebilirsin"i söyler; BURASI "ne oldu"yu söyler. TURU BİTİR'e
// basılınca `turDongusu.js` bunu çağırır.
//
// EMİRLER SIRAYLA ÇÖZÜLÜR — verildikleri sırayla. Eşzamanlı çözüm (aynı hedefe giden iki
// emrin birleşik saldırı sayılması) BİLEREK YAPILMADI: birleşik orduda kaybın hangi
// kaynağa yazılacağı, çekilmenin nereye olacağı ve hasar havuzunun nasıl bölüneceği üç
// yeni kural demek — bu görev zaten muharebe + hareket + fetih + arayüz taşıyor.
// Bedeli oyuncudan SAKLANMIYOR: emirler arayüzde numaralı görünür, sıra bellidir.
//
// TUR DÖNGÜSÜNDEKİ YERİ ÖNEMLİ: gelir ÖNCE hesaplanır, emirler SONRA çözülür. Yani
// fethedilen parça geliri o tur değil, SONRAKİ tur vermeye başlar (görev belgesi §6/Adım 3).
//
// TEK DURUM GÜNCELLEMESİ: bütün emirler tek bir durum zinciri üzerinde işlenir ve sonunda
// tek nesne döner. Parça parça yazılsaydı harita ara durumları çizerdi (görev belgesi §9/4).

import { DENGE } from '../denge.js';
import { PARCALAR, ILLER } from './veri.js';
import { kapsamdaMi } from './oyunDurumu.js';
import {
  birimSayisi,
  parcaOrdusu,
  kadroAl,
  kayitKadrosu,
  yaraliAl,
  kayitYaralilari,
} from './ordu.js';
import { muharebeCoz, orantiliKayip } from './muharebe.js';
import { emirler, emirEkle, komsular, orduBol } from './hareket.js';
import { hamleHarca, hamleBirlestir, defterKirp, defterAl, kayitHamlesi } from './hamle.js';
import { komutanKalemi, komutanBurada, komutanTasi, komutanDustu } from './komutan.js';
import {
  celikYurekKalemi,
  olumuneMi,
  silahUstasiStatlari,
  dagKomutaniPayi,
  savunanArazisi,
} from './yetenek.js';
import { kadroBirlestir } from './toplanma.js';
import { aktorStatlari, aktorEtkileri, aktorArastirmasi, dalSeviyesi } from './arastirma.js';
import { parcayiFethet } from './fetih.js';
import { duelloDene, duelloMoralBonusu } from './rekabet.js';
import { savasBasla } from './diplomasi.js';

const M = DENGE.MUHAREBE;

// ---- KÜÇÜK YARDIMCILAR ----

function havuzKisalt(x) {
  return Math.round(x * 100) / 100;
}

// Orduyu parçaya yazar. Boş ordu KAYIT TUTMAZ (Görev 04 kuralı — rozet performansının
// kaynağı bu). Havuz 0 ise alan da yazılmaz; kayıt dosyası gereksiz büyümesin.
//
// KADRO da yalnızca mevcuttan FARKLIYSA yazılır (Görev 06) — `kayitKadrosu` karar veriyor.
// İMHA OLAN ORDUNUN KADROSU DA SİLİNİR (§3.9/6): kayıt tamamen kalkıyor, dolayısıyla
// sıfırdan basmak tam fiyat. Ayrı bir silme koduna gerek yok, aşağıdaki `delete` yapıyor.
function orduYaz(ordular, parcaId, ordu) {
  const yeni = { ...ordular };
  if (!ordu || birimSayisi(ordu.birimler) === 0) {
    delete yeni[parcaId];
    return yeni;
  }
  const kayit = { sahip: ordu.sahip, birimler: ordu.birimler };
  const kadro = kayitKadrosu(ordu.birimler, kadroAl(ordu));
  if (kadro) kayit.kadro = kadro;
  // YARALILAR da yalnızca varsa yazılır (kadroyla aynı kayıt kuralı).
  const yarali = kayitYaralilari(yaraliAl(ordu));
  if (yarali) kayit.yarali = yarali;
  const havuz = havuzKisalt(ordu.hasarHavuzu || 0);
  if (havuz > 0) kayit.hasarHavuzu = havuz;
  // HAMLE DEFTERİ (Görev 15) da aynı kayıt kuralına uyuyor: eldeki birime göre kırpılır,
  // yalnızca doluysa yazılır. Kırpma BURADA olmak zorunda — muharebeden çıkan ordunun
  // birimleri erimiş olabilir ve defter ondan habersizdir.
  const hamle = kayitHamlesi(defterKirp(ordu.birimler, defterAl(ordu)));
  if (hamle) kayit.hamle = hamle;
  yeni[parcaId] = kayit;
  return yeni;
}

// İki orduyu birleştirir (takviye, çekilme). Hasar havuzları ve KADROLAR da toplanır (§5/2).
function orduBirlestir(a, b) {
  if (!a) return b;
  if (!b) return a;
  const birimler = { ...a.birimler };
  for (const tur of DENGE.BIRIM_SIRASI)
    if (b.birimler[tur] > 0) birimler[tur] = (birimler[tur] || 0) + b.birimler[tur];
  // Yaralılar da toplanır: iki ordu birleşince yaralılar iyileşmez, sadece bir araya gelir.
  const ya = yaraliAl(a),
    yb = yaraliAl(b);
  const yarali = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (ya[tur] || 0) + (yb[tur] || 0);
    if (n > 0) yarali[tur] = n;
  }
  return {
    sahip: a.sahip,
    birimler,
    kadro: kadroBirlestir(a, b),
    yarali,
    hasarHavuzu: (a.hasarHavuzu || 0) + (b.hasarHavuzu || 0),
    // HAMLE DEFTERLERİ de toplanır (Görev 15): gelen birlikler hamlelerini yanlarında
    // taşır. Toplanmasaydı bir parçaya varan yorgun birlik, oradaki taze orduya karışıp
    // hakkını geri kazanırdı — "birleş, tazelen" diye bedava bir hamle doğardı.
    hamle: hamleBirlestir(defterAl(a), defterAl(b)),
  };
}

// ---- §3.9/1 GERİ ÇEKİLME YÖNÜ (Görev 05 / Soru 4 → Baki'nin cevabı A) ----
// Öncelik sırası sabittir, oyuncuya sorulmaz — bozgun bir cezadır, ortasında seçim vermek
// cezayı yumuşatır; ayrıca Görev 07'de yapay zekânın da aynı kararı vermesi gerekecek.
//   1. Saldıran için: saldırıya ÇIKTIĞI parça (hâlâ elindeyse).
//   2. Kendi parçaları arasında EN ÇOK BİRİMİ olan komşu (eşitlikte kimlik sırası).
//   3. Hiçbiri yoksa ordu yok olur.
function cekilmeHedefi(durum, aktorId, nereden, tercih) {
  if (
    tercih &&
    kapsamdaMi(durum, tercih) &&
    durum.parcaSahipligi[tercih] === aktorId &&
    tercih !== nereden
  )
    return tercih;

  let en = null,
    enSayi = -1;
  for (const k of komsular(nereden)) {
    if (!kapsamdaMi(durum, k) || durum.parcaSahipligi[k] !== aktorId) continue;
    const o = parcaOrdusu(durum, k);
    const sayi = o && o.sahip === aktorId ? birimSayisi(o.birimler) : 0;
    if (sayi > enSayi || (sayi === enSayi && en !== null && k < en)) {
      en = k;
      enSayi = sayi;
    }
  }
  return en;
}

// Bozulan orduyu çeker: §3.9/1 çekilirken CEKILME_KAYBI kadar birim DAHA kaybeder.
// Gidecek yer yoksa ordu yok olur. YOK OLAN BİRİMLERİN NÜFUSU HAVUZA DÖNMEZ (§3.9/6) —
// burada kimseye kaynak iade edilmemesinin sebebi budur, unutulursa kayıp cezasız kalır.
// ---- YARMA: ÇEKİLME DİYE BİR ŞEY KALMIYOR (2026-08-08, Baki) ----
//
// > *"Yendiği düşmanlar yaralanmasın, direkt yok olsunlar; toparlanmaya izin vermesin."*
//
// Eskiden kovalayanın zırhlı araştırması çekilene EK KAYIP verdiriyordu (seviye başına 1
// birim). Artık kaçış yok: bozguna uğrayan ordu olduğu yerde dağılır ve yok olur.
//
// Yeni bir yol AÇILMADI — bu fonksiyon "gidecek yer yoksa ordu yok olur" durumunu zaten
// biliyordu (aşağıdaki iki `yokOldu` dönüşü). Yarma o durumu bir sebep daha ile tetikliyor.
// `kayip` alanı tur raporunda "kaç birlik gitti" diye yazıldığı için ordunun tamamı.
//
// Muharebe SONRASINA dokunuyor, yani §3.7'nin doğrulama tablosu bundan hiç etkilenmiyor —
// o tablo muharebenin kendisini ölçüyor, kaçanın arkasından olanı değil.
function cekil(durum, ordular, ordu, nereden, tercih, yarma) {
  if (yarma) return { ordular, hedef: null, kayip: birimSayisi(ordu.birimler), yokOldu: true };

  const kayip = M.CEKILME_KAYBI;
  const kalanSonrasi = orantiliKayip(ordu.birimler, kayip);
  if (birimSayisi(kalanSonrasi.birimler) === 0)
    return { ordular, hedef: null, kayip, yokOldu: true };

  const hedef = cekilmeHedefi(durum, ordu.sahip, nereden, tercih);
  if (!hedef) return { ordular, hedef: null, kayip, yokOldu: true };

  // ÇEKİLME KAYBINI DA ÖNCE YARALILAR VERİR — muharebedeki kuralın aynısı (`birimCani`).
  // Bozgunda geride kalan, yürüyemeyen yaralıdır.
  const yaraliOnce = yaraliAl(ordu);
  const yaraliSonra = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (yaraliOnce[tur] || 0) - (kalanSonrasi.kayiplar[tur] || 0);
    if (n > 0) yaraliSonra[tur] = n;
  }
  const gelen = {
    sahip: ordu.sahip,
    birimler: kalanSonrasi.birimler,
    kadro: kadroAl(ordu), // çekilirken de kadro korunur; ordu küçüldü, birlik durmuyor
    yarali: yaraliSonra,
    hasarHavuzu: ordu.hasarHavuzu,
  };
  const mevcut = ordular[hedef];
  const birlesik = mevcut && mevcut.sahip === ordu.sahip ? orduBirlestir(mevcut, gelen) : gelen;
  return { ordular: orduYaz(ordular, hedef, birlesik), hedef, kayip, yokOldu: false };
}

// ---- §3.8 MORAL BONUSLARI (görev belgesi §4, boşluk 6) ----
// Hepsi VERİDEN okunur, elle liste yok:
//   moral statı → parçanın İLİNDEN (saldıran için kaynak parçanın, savunan için hedefin)
//   dağlık      → PARÇANIN arazisinden, yalnızca SAVUNANA
//   kendi toprağı → savunulan parçanın sahibi o taraf mı
//
// ---- İLİN MORAL STATI ARTIK KALEM DEĞİL, SAYI (2026-08-08, Baki) ----
//
// Eskiden stat bir EŞİKTEN geçiyordu (`MORAL_YUKSEK_ESIGI: 5`) ve geçen il +1 kalem
// alıyordu. 81 ilin 44'ü aynı değerde (4) olduğu için stat pratikte ölü bir sayıydı:
// moral 3 ile moral 4 arasında hiçbir fark yoktu. Artık stat DOĞRUDAN geçiyor ve bozgun
// eşiğine sürekli bir katkı yapıyor (`muharebe.js bozgunEsigiHesapla`).
//
// Dönen biçim: `{ moral, kalem }` taraf başına. `kalem` yalnızca DURUM bonuslarını sayıyor
// (dağlık · kendi toprağı · kutsal savaş) — ilin statı artık o listede değil.
//
// Dışa açık: muharebe TAHMİNİ de aynı bonusları kullanmak zorunda, yoksa ekranda görünen
// tahmin ile tur sonunda olan şey ayrışır.
export function moralBonuslari(durum, kaynak, hedef, saldiranId, savunanId) {
  const hedefP = PARCALAR[hedef];
  const sahibi = durum.parcaSahipligi[hedef];

  let saldiranKalem = 0,
    savunanKalem = 0;
  if (hedefP.arazi === 'daglik') savunanKalem++; // savunmada dağlık arazi
  if (sahibi === savunanId) savunanKalem++; // kendi toprağında
  if (sahibi === saldiranId) saldiranKalem++; // kendi parçasını geri alıyorsa
  // MERKEZ PARÇA (Görev 17): ilin kalbi savunmada bir kalem daha alıyor. Yeni kanal
  // açılmadı — dağlık arazinin ve kendi toprağının kullandığı listenin aynısı.
  // ⚠ Yalnızca SAVUNANA: merkez bir yer avantajıdır, saldıranın merkezden çıkması
  // ona bir şey kazandırmaz.
  if (hedefP.merkez && DENGE.MERKEZ.MORAL_KALEMI > 0) savunanKalem += DENGE.MERKEZ.MORAL_KALEMI;

  // KUTSAL SAVAŞ (Görev 08 / §6/7): listeye BİR KALEM daha, iki tarafa da.
  const duello = duelloMoralBonusu(durum, saldiranId, savunanId);

  // KOMUTAN (Görev 16 / Adım 4): aynı kanaldan bir kalem daha. Saldıran tarafta komutan
  // ÇIKTIĞI parçada olmalı (orduyla gidiyor), savunan tarafta savunulan parçada.
  //
  // ÇELİK YÜREK (Adım 5) aynı toplama giriyor, ayrı bir kanal açmıyor. Tek yerde olması
  // şart: bu fonksiyon muharebe TAHMİNİNİ de besliyor, yoksa ekranda görünen dayanıklılık
  // ile sahada olan şey ayrışır.
  const saldiranKomutan =
    komutanKalemi(durum, saldiranId, kaynak) + celikYurekKalemi(durum, saldiranId, kaynak);
  const savunanKomutan =
    komutanKalemi(durum, savunanId, hedef) + celikYurekKalemi(durum, savunanId, hedef);

  return {
    saldiran: {
      moral: ILLER[PARCALAR[kaynak].kod].statlar.moral,
      kalem: saldiranKalem + duello + saldiranKomutan,
    },
    savunan: {
      moral: ILLER[hedefP.kod].statlar.moral,
      kalem: savunanKalem + duello + savunanKomutan,
    },
  };
}

// ---- KOMUTAN YETENEKLERİNİN MUHAREBEYE GİRİŞİ (Görev 16 / Adım 5) ----
//
// ⚠ ÜÇÜ DE DIŞA AÇIK VE TEK KAPI. `moralBonuslari` ile aynı sebep: muharebe tahmini
// (`HareketEkrani`), yapay zekânın hamle puanı (`zeka.js`) ve gerçek çözüm AYNI sayıları
// görmek zorunda. Ayrışırsa oyuncuya "kazanırsın" denip kaybettirilir, bot da yanlış
// hesapla saldırır. Üç fonksiyon, üç yetenek — dördüncüsü (Toplanma Ustası) muharebede
// değil, toplanmada yaşıyor.

// SİLAH USTASI: bir aktörün stat tablosunun yetenekten sonraki hâli.
export function yetenekliStatlar(durum, aktorId, parcaId) {
  return silahUstasiStatlari(
    aktorStatlari(durum, aktorId),
    durum,
    aktorId,
    parcaId,
    aktorArastirmasi(durum, aktorId),
    dalSeviyesi
  );
}

// DAĞ KOMUTANI: savunanın arazi çarpanının, SALDIRANIN yeteneğinden sonraki hâli.
// `undefined` dönerse motor arazinin kendi çarpanını kullanıyor (etki yok).
export function savunanAraziCarpani(durum, saldiranId, kaynak, hedef) {
  const pay = dagKomutaniPayi(durum, saldiranId, kaynak);
  if (!pay) return undefined;
  const A = DENGE.ARAZI[PARCALAR[hedef].arazi] || DENGE.ARAZI.ova;
  return savunanArazisi(A.savunan, pay);
}

// ÇELİK YÜREK kademe 3: "ya kazanır ya yok olur" bayrakları.
export function olumuneBayraklari(durum, saldiranId, kaynak, savunanId, hedef) {
  return {
    saldiran: olumuneMi(durum, saldiranId, kaynak),
    savunan: olumuneMi(durum, savunanId, hedef),
  };
}

// ---- TUR TUR DÖKÜMÜN OKUNMASI ----
// Döküm kayıtta kompakt dizi olarak duruyor (yer kazancı); ekran onu buradan okur.
// Sıra TEK YERDE tanımlı: hem yazan (`emirleriCoz`) hem okuyan aynı listeyi kullanıyor.
export const DOKUM_ALANLARI = [
  'saldiranVurus',
  'savunanVurus',
  'saldiranKayip',
  'savunanKayip',
  'saldiranKalan',
  'savunanKalan',
  'saldiranMoral',
  'savunanMoral',
  'sans',
];

export function dokumSatiri(dizi) {
  const o = {};
  DOKUM_ALANLARI.forEach((ad, i) => (o[ad] = dizi[i]));
  o.sans = !!o.sans;
  return o;
}

// ---- ANA ÇÖZÜM ----
//
// Dönen: { durum, rapor }
// rapor.satirlar arayüzün okuduğu dökümdür; PARÇA KİMLİĞİ taşır, ad taşımaz — adları
// ekran çözer (oyun katmanında görsel bilgi yok).
// `secici` (Görev 07 / Adım 5): verilirse YALNIZCA seçilen emirler çözülür, kalanlar
// kuyrukta bekler. Sıra sistemi bunu kullanıyor — A2'de her aktörün emirleri KENDİ SIRASI
// gelince çözülüyor, hepsi bir arada değil (Baki'nin kararı, 2026-07-31). Verilmezse
// eskisi gibi hepsi çözülür; Görev 05–06 davranışı korunuyor.
export function emirleriCoz(durum, secici) {
  const hepsi = emirler(durum);
  const liste = secici ? hepsi.filter(secici) : hepsi;
  // Çözülen HAREKET emirleri kuyruktan düşer; toplanma emirleri kalır, onları tur sonunda
  // `toplanmaAsamasi` işliyor (§3.9/2).
  const kalanEmirler = secici
    ? hepsi.filter((e) => !liste.includes(e) || e.tip === 'toplanma')
    : hepsi.filter((e) => e.tip === 'toplanma');
  const satirlar = [];
  let d = durum;
  let ordular = { ...(durum.ordular || {}) };

  for (const emir of liste) {
    // TOPLANMA EMİRLERİ BURADA ÇÖZÜLMEZ (Görev 06 / Soru 2 → cevap B): ordu o tur
    // YIPRANMIŞ hâliyle savunur, tur sonunda dolar. `turDongusu.js` çözümden SONRA
    // işliyor. Kuyrukta durmasının sebebi rezervasyon: birimleri kendine ayırdığı için
    // aynı orduya hareket emri verilemiyor, ayrı bir bayrağa gerek kalmıyor.
    if (emir.tip === 'toplanma') continue;

    const { sahip, kaynak, hedef, birimler } = emir;
    // KOMUTAN ORDUYLA GİDİYOR MU (Görev 16 / Adım 4): bayrak emrin üstünde ve yalnızca
    // komutan gerçekten o parçadaysa bir şey ifade ediyor.
    const komutanGeliyor = !!emir.komutan && komutanBurada(d, sahip, kaynak);
    d = { ...d, ordular };

    // 1) Emir hâlâ geçerli mi? (Kuyruk boyunca dünya değişmiş olabilir: kaynak elden
    //    çıkmış, birimler başka bir muharebede erimiş olabilir.)
    const ordu = ordular[kaynak];
    const yeterli =
      ordu &&
      ordu.sahip === sahip &&
      DENGE.BIRIM_SIRASI.every((t) => (ordu.birimler[t] || 0) >= (birimler[t] || 0));
    if (!yeterli || d.parcaSahipligi[kaynak] !== sahip) {
      satirlar.push({
        tip: 'iptal',
        kaynak,
        hedef,
        sebep: !ordu || !yeterli ? 'ordu-yok' : 'kaynak-elden-cikti',
      });
      continue;
    }

    // 2) Orduyu böl — hasar havuzu birim sayısına oranla ayrılır.
    const bolum = orduBol(ordu, birimler);
    // HAMLE HAKKI BURADA HARCANIR (Görev 15 / Adım 2). Yola çıkanların defteri bir artar
    // ve ONLARLA BİRLİKTE gider: nereye varırlarsa (boş parça, dost ordu, muharebe sonrası
    // fetih, bozgunda geri çekilme) defter `orduYaz`/`orduBirlestir` üstünden onları takip
    // eder. Kaynakta kalanların defteri olduğu gibi kalır.
    const hamleSonuc = hamleHarca(ordu, birimler);
    ordular = orduYaz(ordular, kaynak, { ...bolum.kalan, hamle: hamleSonuc.kaynakHamle });
    const giden = { ...bolum.giden, hamle: hamleSonuc.gidenHamle };

    const hedefOrdu = ordular[hedef];
    const dusmanVar = hedefOrdu && hedefOrdu.sahip !== sahip && birimSayisi(hedefOrdu.birimler) > 0;

    // 3a) BOŞ VEYA DOST PARÇA — muharebe yok, doğrudan giriş.
    if (!dusmanVar) {
      // KUTSAL SAVAŞ boş bir düşman parçasına yürümekle de başlar: "savaş açmak =
      // saldırmak" (§6/5) ve `hareket.js`'in kendi kuralı boş düşman parçasına yürümeyi
      // saldırı sayıyor. Dost parçaya girişte `duelloDene` zaten null döner.
      const dg = duelloDene(d, sahip, d.parcaSahipligi[hedef]);
      d = dg.durum;
      // SAVAŞ HALİ: SALDIRI İLANDIR (Görev 09 / Soru 1 → A). Düellodan SONRA çağrılıyor
      // çünkü düellonun giriş şartı "başka savaşı olmasın" ve o soruyu bu saldırının
      // kendisi kirletmemeli — düello önce bakar, savaş sonra yazılır.
      const dip = savasBasla(d, sahip, d.parcaSahipligi[hedef]);
      d = dip.durum;
      ordular = orduYaz(ordular, hedef, orduBirlestir(hedefOrdu, giden));
      d = { ...d, ordular };
      // Komutan orduyla birlikte geçiyor (muharebe yok, kayıp yok).
      if (komutanGeliyor) d = komutanTasi(d, sahip, hedef);
      const f = parcayiFethet(d, hedef, sahip);
      d = f.durum;
      ordular = { ...d.ordular };
      satirlar.push({
        tip: 'giris',
        kaynak,
        hedef,
        // Muharebe satırıyla aynı alan (2026-09-24): maç sayaçları fetihi `sahip`ten sayıyor ve
        // bu alan yokken savaşsız alınan bölgeler "bölge alındı"ya hiç girmiyordu.
        sahip,
        birimler: giden.birimler,
        fethedildi: f.fethedildi,
        ganimet: f.ganimet,
        ilTamamlandi: f.ilTamamlandi,
        ilKodu: f.ilKodu,
        // Görev 08: sahne katmanı "kim kaybetti"yi de oynatıyor (fetih/kayıp kartı).
        eskiSahip: f.eskiSahip,
        ilKaybedildi: f.ilKaybedildi,
        duelloBasladi: dg.duello,
        diplomasi: dip.olaylar.length ? dip.olaylar : undefined,
      });
      continue;
    }

    // 3b) DÜŞMAN PARÇASI — muharebe.
    const savunanId = hedefOrdu.sahip;
    // DÜELLO MUHAREBEDEN ÖNCE BAŞLIYOR ve bu bilinçli: ilan ile ilk çarpışma aynı andır,
    // yani kutsal savaşın moral bonusu daha O SAVAŞTA işler. Sonraya bırakılsaydı düelloyu
    // başlatan muharebe, düellonun kendisinden etkilenmeyen tek muharebe olurdu.
    const duelloSonuc = duelloDene(d, sahip, savunanId);
    d = duelloSonuc.durum;
    // Savaş hali — düellodan sonra, muharebeden önce (yukarıdaki 3a'daki notun aynısı).
    const dipSonuc = savasBasla(d, sahip, savunanId);
    d = dipSonuc.durum;
    const sonuc = muharebeCoz({
      saldiran: giden,
      savunan: hedefOrdu,
      arazi: PARCALAR[hedef].arazi,
      moralBonuslari: moralBonuslari(d, kaynak, hedef, sahip, savunanId),
      tohum: d.rastgele.durum,
      // ARAŞTIRMA (Görev 06): her taraf kendi kaydırılmış stat tablosuyla savaşır.
      // Araştırması olmayan aktör (tarafsız garnizon dahil, §5/7) temel tabloyu alır ve
      // sonuç Görev 05'tekiyle birebir aynı olur — garnizon belirlenimci kalıyor.
      // KOMUTANIN SİLAH USTASI YETENEĞİ de bu tablodan geçiyor (Görev 16 / Adım 5):
      // araştırmanın kanalının aynısı, yeni bir çarpan açılmıyor.
      statlar: {
        saldiran: yetenekliStatlar(d, sahip, kaynak),
        savunan: yetenekliStatlar(d, savunanId, hedef),
      },
      // Kendine özgü araştırma dalları (Görev 07): baraj ateşi ve paletli üstünlük
      // muharebenin içinde, yarma çekilmede işliyor.
      etkiler: {
        saldiran: aktorEtkileri(d, sahip),
        savunan: aktorEtkileri(d, savunanId),
      },
      // ÇELİK YÜREK kademe 3 ve DAĞ KOMUTANI (Görev 16 / Adım 5).
      olumune: olumuneBayraklari(d, sahip, kaynak, savunanId, hedef),
      savunanArazisi: savunanAraziCarpani(d, sahip, kaynak, hedef),
    });
    d = { ...d, rastgele: { ...d.rastgele, durum: sonuc.rastgeleDurum } };

    const satir = {
      tip: 'muharebe',
      kaynak,
      hedef,
      sahip,
      savunanId,
      arazi: PARCALAR[hedef].arazi,
      gonderilen: giden.birimler,
      // Karşı tarafın muharebeye GİRDİĞİ mevcut (çıkan değil) — rapor dökümü için.
      // Adı eskiden `savunanKadro`'ydu; Görev 06'da "kadro" ordunun kağıt üstündeki
      // mevcudu anlamını kazandığı için değiştirildi. İki anlamın aynı ada binmesi
      // bu görevin en olası sessiz hatasıydı (görev belgesi §9/4).
      savunanGiren: { ...hedefOrdu.birimler },
      kazanan: sonuc.kazanan,
      sebep: sonuc.sebep,
      // ---- SAHNE İÇİN (Görev 08 / Adım 2) ----
      // Bozgun bayrakları AÇIKÇA yazılıyor, `cekilme`den ÇIKARILMIYOR: berabere biten
      // muharebede de çekilme kaydı var (saldıran kaynağına döner, kayıpsız). İkisini
      // çekilmenin kaybına bakarak ayırmak sessiz bir hataya davetiye — sahne "bozgun"
      // titreşimini beraberlikte de çalardı.
      saldiranBozgun: !!sonuc.saldiran.bozgun,
      savunanBozgun: !!sonuc.savunan.bozgun,
      // Parçanın muharebeden ÖNCEKİ sahibi — kaybeden tarafı sahne buradan biliyor.
      eskiSahip: d.parcaSahipligi[hedef],
      ilKaybedildi: false,
      // Bu muharebe bir kutsal savaş başlattıysa adı burada; sahne kartı ve tur raporu
      // bunu okuyor. Başlatmadıysa null.
      duelloBasladi: duelloSonuc.duello,
      // Bu saldırının doğurduğu diplomasi olayları (savaş hali başladı, zincir yayıldı).
      // Boşsa alan hiç yazılmıyor — tur raporu satırları da kayda girmiyor ama satır
      // sayısı çok ve `undefined` alanlar JSON'a yazılmıyor.
      diplomasi: dipSonuc.olaylar.length ? dipSonuc.olaylar : undefined,
      saldiranKayip: birimSayisi(sonuc.saldiran.kayiplar),
      savunanKayip: birimSayisi(sonuc.savunan.kayiplar),
      // Tür tür kayıp: "3 birim kaybettim" yerine "2 piyade, 1 topçu".
      saldiranKayiplar: sonuc.saldiran.kayiplar,
      savunanKayiplar: sonuc.savunan.kayiplar,
      saldiranKalan: sonuc.saldiran.kalan,
      savunanKalan: sonuc.savunan.kalan,
      // Sağ dönenlerden kaçı yaralı (2026-07-31) — tur raporu bunu yazıyor.
      saldiranYarali: sonuc.saldiran.yarali,
      saldiranMoral: sonuc.saldiran.baslangicMoral,
      savunanMoral: sonuc.savunan.baslangicMoral,
      turSayisi: sonuc.turlar.length,
      // TUR TUR DÖKÜM (2026-07-30, Baki: "sonuç ekranında savaşların detayları gözüksün").
      // KOMPAKT DİZİ olarak saklanıyor, kayıt dosyası şişmesin — alan adları 20 turluk bir
      // muharebede dokuz kat yer tutardı. Sırası `DOKUM_ALANLARI`'nda, okuması `dokumSatiri`.
      // Rapor yalnızca SON turu tutuyor, yani büyüme birikmiyor.
      dokum: sonuc.turlar.map((t) => [
        Math.round(t.saldiranVurus),
        Math.round(t.savunanVurus),
        t.saldiranKayip,
        t.savunanKayip,
        t.saldiranKalan,
        t.savunanKalan,
        t.saldiranMoral,
        t.savunanMoral,
        t.sans ? 1 : 0,
      ]),
      fethedildi: false,
      ganimet: 0,
      ilTamamlandi: false,
      cekilme: null,
    };

    // KADRO MUHAREBEDE DEĞİŞMEZ — kaybın anlamı da bu (Görev 06). Birimler azalır,
    // kadro yerinde kalır; aradaki fark tur sonunda "toplanabilir eksik" olur.
    // ---- ⚠ HAMLE DEFTERİ MUHAREBEDEN SAĞ ÇIKAR (2026-09-20 düzeltmesi) ----
    // Bu iki ordu muharebe sonrası SIFIRDAN kuruluyor ve ilk yazımda `hamle` alanı
    // taşınmamıştı: savaşan birlik hakkını geri kazanıyordu. Baki telefonda yakaladı —
    // *"piyade ile 2 kere hareket edip 1 piyadeyle 2 yer ele geçirdim."* Boş parçaya
    // yürüyüşte hata yoktu (`orduBirlestir` defteri taşıyor), yalnızca MUHAREBE yolunda
    // kayboluyordu. Kayıptan sonraki kırpmayı `orduYaz` zaten yapıyor.
    const saldiranOrdu = {
      sahip,
      birimler: sonuc.saldiran.birimler,
      kadro: kadroAl(giden),
      // Muharebeden kaç birim YARALI çıktığını motor söylüyor (`yaralariBelirle`).
      yarali: sonuc.saldiran.yarali,
      hasarHavuzu: sonuc.saldiran.hasarHavuzu,
      hamle: defterAl(giden),
    };
    const savunanOrdu = {
      sahip: savunanId,
      birimler: sonuc.savunan.birimler,
      kadro: kadroAl(hedefOrdu),
      yarali: sonuc.savunan.yarali,
      hasarHavuzu: sonuc.savunan.hasarHavuzu,
      hamle: defterAl(hedefOrdu),
    };

    if (sonuc.kazanan === 'saldiran') {
      // Savunan sahayı bırakıyor: bozulduysa çekilir, imha olduysa zaten yok.
      ordular = orduYaz(ordular, hedef, null);
      if (sonuc.savunan.bozgun && sonuc.savunan.kalan > 0) {
        d = { ...d, ordular };
        // Kovalayan SALDIRAN, yani ek kayıp onun yarma seviyesinden geliyor.
        const c = cekil(d, ordular, savunanOrdu, hedef, null, aktorEtkileri(d, sahip).yarma);
        ordular = c.ordular;
        satir.cekilme = { taraf: 'savunan', hedef: c.hedef, kayip: c.kayip, yokOldu: c.yokOldu };
      }
      // Hayatta kalan saldıran hedefe geçer. Hakkı kalmışsa (zırhlı) oradan devam
      // edebilir; kalmamışsa defter onu durdurur (Görev 15 — eskiden bunu kuyruk
      // yapıyordu, emirler tur sonunda çözüldüğü için ikinci hamle imkânsızdı).
      ordular = orduYaz(ordular, hedef, saldiranOrdu);
      d = { ...d, ordular };
      // KOMUTANLAR (Görev 16 / Adım 4): saldıranın komutanı orduyla hedefe geçer; savunanın
      // komutanı sahayı kaybettiği için düşer ve bekleme cezası başlar.
      if (komutanGeliyor) d = komutanTasi(d, sahip, hedef);
      if (komutanBurada(d, savunanId, hedef)) d = komutanDustu(d, savunanId);
      const f = parcayiFethet(d, hedef, sahip);
      d = f.durum;
      ordular = { ...d.ordular };
      satir.fethedildi = f.fethedildi;
      satir.ganimet = f.ganimet;
      satir.ilTamamlandi = f.ilTamamlandi;
      satir.ilKodu = f.ilKodu;
      satir.ilKaybedildi = f.ilKaybedildi;
    } else {
      // Savunan sahada kalıyor (yıpranmış olarak).
      ordular = orduYaz(ordular, hedef, savunanOrdu);
      // Saldırı kırıldı: orduyla giden komutan da bozgunun bedelini ödüyor.
      if (komutanGeliyor) d = komutanDustu(d, sahip);
      if (sonuc.saldiran.kalan > 0) {
        d = { ...d, ordular };
        if (sonuc.saldiran.bozgun) {
          // Bu kez kovalayan SAVUNAN.
          const c = cekil(
            d,
            ordular,
            saldiranOrdu,
            hedef,
            kaynak,
            aktorEtkileri(d, savunanId).yarma
          );
          ordular = c.ordular;
          satir.cekilme = { taraf: 'saldiran', hedef: c.hedef, kayip: c.kayip, yokOldu: c.yokOldu };
        } else {
          // BERABERE (üst sınır): saldıran kaynağına döner, çekilme kaybı YOK —
          // çekilme kaybı bozgun cezasıdır, burada kimse bozulmadı.
          const mevcut = ordular[kaynak];
          const geri =
            mevcut && mevcut.sahip === sahip ? orduBirlestir(mevcut, saldiranOrdu) : saldiranOrdu;
          ordular = orduYaz(ordular, kaynak, geri);
          satir.cekilme = { taraf: 'saldiran', hedef: kaynak, kayip: 0, yokOldu: false };
        }
      }
    }

    d = { ...d, ordular };
    satirlar.push(satir);
  }

  const rapor = {
    tur: durum.tur,
    satirlar,
    ozet: ozetCikar(satirlar),
  };
  return { durum: { ...d, ordular, emirler: kalanEmirler }, rapor };
}

// ---- ANINDA ÇÖZÜM (Görev 15 / Adım 2 — belge: docs/GOREV-15-aninda-cozum.md) ----
//
// TEK HAMLE: doğrula, hemen çöz, sonucu döndür. Emir kuyruğu kalktığı için oyuncunun ve
// yapay zekânın tek giriş kapısı burası.
//
// ┌─ NİYE `emirEkle` + `emirleriCoz` ─────────────────────────────────────────────────┐
// │ Ayrı bir çözüm yolu yazmak, muharebe/fetih/düello/savaş ilanı sırasını İKİNCİ kez  │
// │ kodlamak olurdu — iki yol bir gün ayrışır ve oyuncuyla botlar farklı kurallarla    │
// │ oynamaya başlar. Kuyruk artık bir VERİ YAPISI değil, tek emirlik bir geçiş.        │
// └────────────────────────────────────────────────────────────────────────────────────┘
//
// Dönen: { ok, durum, satirlar, kod?, sebep? } — reddedilen emirde durum DEĞİŞMEZ.
export function hamleUygula(durum, aktorId, kaynak, hedef, secilen, secenekler) {
  const ek = emirEkle(durum, aktorId, kaynak, hedef, secilen, secenekler);
  if (!ek.ok) return { ok: false, kod: ek.kod, sebep: ek.sebep, durum, satirlar: [] };

  const liste = emirler(ek.durum);
  const yeniEmir = liste[liste.length - 1];
  const { durum: cozulmus, rapor } = emirleriCoz(ek.durum, (e) => e === yeniEmir);

  // ---- TUR GÜNLÜĞÜ (Görev 15) ----
  // Hamle tur ortasında çözüldüğü için satırları `turuBitir` göremezdi; tur raporu da
  // oyuncunun kendi savaşlarını kaçırırdı. Günlük o boşluğu kapatıyor: her çözülen hamle
  // buraya yazılıyor, tur raporu turu bitirirken günlüğü okuyup boşaltıyor.
  // ⚠ KAYDA GİRMEZ (`kayitVerisi.js`): tek turluk döküm kayıt dosyasını şişirirdi —
  // `sonTurRaporu`'nun kaydedilmeme gerekçesinin aynısı.
  const satirlar = rapor.satirlar.map((s) => ({ ...s, aktorId }));
  return {
    ok: true,
    durum: { ...cozulmus, turGunlugu: (cozulmus.turGunlugu || []).concat(satirlar) },
    satirlar,
  };
}

export function ozetCikar(satirlar) {
  const o = {
    emir: satirlar.length,
    muharebe: 0,
    kazanilan: 0,
    kaybedilen: 0,
    fetih: 0,
    ilTamamlandi: 0,
    ganimetNufus: 0,
    kendiKaybi: 0,
    dusmanKaybi: 0,
    iptal: 0,
  };
  for (const s of satirlar) {
    if (s.tip === 'iptal') o.iptal++;
    if (s.fethedildi) o.fetih++;
    if (s.ilTamamlandi) o.ilTamamlandi++;
    o.ganimetNufus += s.ganimet || 0;
    if (s.tip !== 'muharebe') continue;
    o.muharebe++;
    if (s.kazanan === 'saldiran') o.kazanilan++;
    else o.kaybedilen++;
    o.kendiKaybi +=
      s.saldiranKayip + (s.cekilme && s.cekilme.taraf === 'saldiran' ? s.cekilme.kayip : 0);
    o.dusmanKaybi +=
      s.savunanKayip + (s.cekilme && s.cekilme.taraf === 'savunan' ? s.cekilme.kayip : 0);
  }
  o.ganimetNufus = havuzKisalt(o.ganimetNufus);
  return o;
}
