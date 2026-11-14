// YENİDEN TOPLANMA — yıpranmış orduyu doldurma (Görev 06 / tasarım §3.9/2–6).
//
// KADRO KAVRAMI (Soru 1 → Baki'nin cevabı A, 2026-07-30). Ordu artık iki sayı taşır:
//   birimler → SAHADAKİ mevcut (kim savaşıyor)
//   kadro    → KAĞIT ÜSTÜNDEKİ mevcut (kaç kişilik birlik olduğu)
// Üretim ikisini de artırır, muharebe kaybı yalnızca birimleri azaltır, toplanma
// birimleri kadroya kadar yükseltir. Kadro, toplanmanın DOĞAL ÜST SINIRIDIR: onsuz
// oyuncu 1 birimlik ordusunu her tur yarı fiyata 20 birime "doldurur" ve üretim sistemi
// (sanayi sınırı dahil) anlamsızlaşırdı.
//
// KAYIT KURALI: `kadro` yalnızca `birimler`'den FARKLIYSA saklanır. Yıpranmamış ordunun
// kadro alanı hiç yazılmaz — boş parçanın kayıt tutmaması (Görev 04) ve garnizonun
// formülden türemesi (Görev 05) ile aynı mantık. Bu yüzden kadro her yerde `kadroAl` ile
// okunur, `ordu.kadro` diye DOĞRUDAN OKUNMAZ.
//
// ┌─ DEĞİŞMEZ KURAL ───────────────────────────────────────────────────────────────────┐
// │ HER TÜR İÇİN kadro ≥ birimler. Her zaman, her yolda: üretim · kayıp · bölünme ·     │
// │ birleşme · toplanma. Beşi de ayrı ayrı test ediliyor (`testler/toplanma.test.js`).  │
// └────────────────────────────────────────────────────────────────────────────────────┘
//
// BU DOSYANIN EN OLASI SESSİZ HATASI kadro ile mevcudun karışmasıdır. İkisi de aynı şekle
// benziyor ({ piyade: 3, topcu: 1 }) ve yanlışı çökmez, sadece yanlış sayı yazar. Rozet,
// panel, aktör özeti, muharebe girdisi ve tur raporu **mevcut** göstermek zorunda.

// KADRONUN İKİ TEMEL OKUYUCUSU (`kadroAl`, `kayitKadrosu`) BURADA DEĞİL, `ordu.js`'te.
// Sebep döngüsel bağımlılık: bu dosya `birimSayisi`'nı ordu.js'ten alıyor, ordu.js de
// üretim yaparken kadroyu yazmak zorunda. Kayıt yapısının sahibi ordu.js olduğu için
// (dosya başındaki VERİ YAPISI notu orada) iki okuyucu oraya kondu; toplanmanın kendi
// mantığı — maliyet, doldurma, bölüşüm — burada.

import { DENGE } from '../denge.js';
import { birimSayisi, kadroAl, kayitKadrosu, yaraliAl, kayitYaralilari } from './ordu.js';
import { havuzdanDus } from './butce.js';
import { aktorArastirmasi, seferberlikBedava } from './arastirma.js';
import { toplanmaUstasiButcesi, eklenmisButce } from './yetenek.js';

const T = DENGE.TOPLANMA;

// Kadro ile mevcut arasındaki fark: "kaç birim eksik". Yalnızca pozitifler yazılır.
export function eksikKadro(ordu) {
  const kadro = kadroAl(ordu);
  const birimler = (ordu && ordu.birimler) || {};
  const eksik = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (kadro[tur] || 0) - (birimler[tur] || 0);
    if (n > 0) eksik[tur] = n;
  }
  return eksik;
}

// Bu ordu toplanabilir mi — ya doldurulacak boşluğu ya da iyileştirilecek yaralısı var mı?
export function toplanabilirMi(ordu) {
  return birimSayisi(eksikKadro(ordu)) > 0 || birimSayisi(yaraliAl(ordu)) > 0;
}

// İki kadroyu birleştirir (takviye, çekilme, aynı parçada buluşma). Toplanır — §5/2.
export function kadroBirlestir(orduA, orduB) {
  if (!orduA) return { ...kadroAl(orduB) };
  if (!orduB) return { ...kadroAl(orduA) };
  const a = kadroAl(orduA),
    b = kadroAl(orduB);
  const kadro = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (a[tur] || 0) + (b[tur] || 0);
    if (n > 0) kadro[tur] = n;
  }
  return kadro;
}

// ---- MALİYET (§3.9/3) ----
//
// TABLO GÖMÜLÜ DEĞİL, TÜRETİLİYOR. Tasarım §3.9/3 bedelleri tablo hâlinde veriyor
// (piyade 2/1, topçu 1/2, zırhlı 1/3) ama o tablo BIRIMLER'in yarısından başka bir şey
// değil. Elle yazılsaydı biri BIRIMLER'i değiştirince tablo sessizce yalan söylerdi.
// Test hem indirimi değiştirip bedelin değiştiğini, hem de türetilenin §3.9/3 ile
// birebir tuttuğunu doğruluyor.
export function birimToplanmaBedeli(tur) {
  const b = DENGE.BIRIMLER[tur];
  return {
    nufus: Math.ceil(b.nufus * T.INDIRIM),
    ekonomi: Math.ceil(b.ekonomi * T.INDIRIM),
  };
}

// YARALI BİR BİRİMİ İYİLEŞTİRMENİN BEDELİ (2026-07-31). Ölenin yerine yenisini koymaktan
// ucuz: asker zaten sahada, ona bakmak yeni asker toplamaktan hafif. Bedava değil.
// Piyade için: ölen 2 nüfus/1 ekonomi, yaralı 1 nüfus/1 ekonomi.
//
// ---- SEFERBERLİK: PİYADE YARALISI BEDAVA (2026-08-08, Baki) ----
//
// > *"Yaralı piyadelerin toparlanmaya basıldığı anda ücretsiz şekilde o tur direkt
// > toparlanmasını sağlasın."*
//
// Eskiden seviye başına %10 indirimdi ve bedel yukarı yuvarlandığı için en az 1 kalıyordu.
// Artık tam sıfır — ama YALNIZCA PİYADE YARALISI için. Topçu ve zırhlı yaralısı, ölen
// birimin yerine konan yeni birim ve üretim bundan hiç etkilenmiyor.
//
// ⚠ BEDEL SIFIR OLUNCA BÜTÇE KAPISI DA AÇILIYOR: `toplanmaCoz` bedeli bütçeyle
// karşılaştırıyor, sıfır bedel her bütçeye sığar. Baki'nin "o tur direkt toparlansın"
// şartı buradan geliyor — parası olmayan oyuncu bile piyadesini ayağa kaldırıyor.
export function birimIyilestirmeBedeli(tur, seferberlik) {
  const b = DENGE.BIRIMLER[tur];
  if (tur === 'piyade' && seferberlik) return { nufus: 0, ekonomi: 0 };
  return {
    nufus: Math.ceil(b.nufus * T.INDIRIM * T.IYILESTIRME),
    ekonomi: Math.ceil(b.ekonomi * T.INDIRIM * T.IYILESTIRME),
  };
}

// Bir toplanmanın toplam bedeli: ölenlerin yerine yenisi + yaralıların bakımı.
// `seferberlik` verilmezse etki yok — motor Görev 06 davranışını gösterir.
//
//
// ⚠ KOMUTANIN TOPLANMA USTASI YETENEĞİ BURAYA HİÇ GİRMİYOR (Görev 16 / Adım 5) ve bu
// bilinçli: o yetenek BEDELE değil BÜTÇEYE dokunuyor. Bedel tek gerçek kalıyor, yani
// ekranda görünen bedel ile ödenen bedel ayrışması imkânsız. (İlk tasarım yüzdelik indirimdi
// ve ölçüm onu ölü buldu — bedeller 1–3 ve `Math.ceil` indirimi yutuyor. `denge.js`'te.)
export function toplanmaMaliyeti(eksik, yarali, seferberlik) {
  let nufus = 0,
    ekonomi = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const olen = (eksik && eksik[tur]) || 0;
    if (olen > 0) {
      const b = birimToplanmaBedeli(tur);
      nufus += b.nufus * olen;
      ekonomi += b.ekonomi * olen;
    }
    const yarali_ = (yarali && yarali[tur]) || 0;
    if (yarali_ > 0) {
      const b = birimIyilestirmeBedeli(tur, seferberlik);
      nufus += b.nufus * yarali_;
      ekonomi += b.ekonomi * yarali_;
    }
  }
  return { nufus, ekonomi };
}

// ---- TOPLANMANIN ÇÖZÜMÜ ----
//
// KISMİ DOLDURMA, Görev 04'ün kısmi sipariş kalıbıyla AYNI: türlerden SIRAYLA BİRER TANE.
// Tek türü sonuna kadar doldurmak, bütçe yarıya inince "3 piyade + 3 zırhlı" eksiğini
// "3 piyade"ye çevirirdi — ordunun karışımı sessizce bozulurdu. Sırayla dolunca oran korunur.
//
// butce: { nufus, ekonomi } — AŞAĞI YUVARLANMIŞ (ekranda görünen) değerler, üretimdeki
// kuralın aynısı: oyuncu ekranda "8 nüfus" görüp 8'lik toplanma yapabilmeli.
//
// Dönen: { yeniOrdu, harcanan, iyilesen, dolan, iyilesemeyen, basilamayan }
//
// ÖNCE YARALIYA BAKILIR, SONRA ÖLENİN YERİ DOLDURULUR (2026-07-31). Sebep: iyileştirme
// ucuz ve o asker zaten sahada — bütçe kısıtlıysa en çok kuvveti en az parayla ayağa
// kaldıran sıra budur. İki iş de kendi içinde türlerden SIRAYLA birer tane ilerliyor
// (Görev 04'ün kısmi sipariş kalıbı), böylece ordunun karışımı bozulmuyor.
// ⚠ `seferberlik` PARAMETRESİ 2026-08-08'DE EKLENDİ — ÖNCESİNDE BİR AYRIŞMA VARDI.
// `toplanmaMaliyeti` (ekranda görünen bedel) seferberliği hesaba katıyordu ama bu
// fonksiyon katmıyordu: oyuncu panelde indirimli bedeli görüyor, tur sonunda tam bedel
// düşüyordu. Görev 06'nın kuralı ("ekranla gerçek hesap ayrışmaz") tam burada kırılmıştı.
// Artık ikisi de aynı `birimIyilestirmeBedeli` çağrısından geçiyor.
export function toplanmaCoz(ordu, butce, seferberlik, ekButce) {
  const eksik = eksikKadro(ordu);
  const yarali = yaraliAl(ordu);
  const iyilesen = {};
  const dolan = {};
  const harcanan = { nufus: 0, ekonomi: 0 };
  // TOPLANMA USTASI (Görev 16 / Adım 5): komutanın yakınında bütçe genişliyor. BEDELE
  // dokunulmuyor — bedel tek gerçek kalsın, ekranla ayrışma imkânsız olsun.
  const b = eklenmisButce(butce, ekButce);
  let kalanNufus = Math.floor((b && b.nufus) || 0);
  let kalanEkonomi = Math.floor((b && b.ekonomi) || 0);

  // Tek bir işlem denemesi: bedel bütçeye sığıyorsa harca ve say.
  function dene(bedel, sayac, tur) {
    if (bedel.nufus > kalanNufus || bedel.ekonomi > kalanEkonomi) return false;
    kalanNufus -= bedel.nufus;
    kalanEkonomi -= bedel.ekonomi;
    harcanan.nufus += bedel.nufus;
    harcanan.ekonomi += bedel.ekonomi;
    sayac[tur] = (sayac[tur] || 0) + 1;
    return true;
  }

  for (const [hedefler, sayac, bedelci] of [
    [yarali, iyilesen, (tur) => birimIyilestirmeBedeli(tur, seferberlik)],
    [eksik, dolan, birimToplanmaBedeli],
  ]) {
    let eklendi = true;
    while (eklendi) {
      eklendi = false;
      for (const tur of DENGE.BIRIM_SIRASI) {
        if ((sayac[tur] || 0) >= (hedefler[tur] || 0)) continue;
        if (dene(bedelci(tur), sayac, tur)) eklendi = true;
      }
    }
  }

  const basilamayan = {};
  const iyilesemeyen = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const a = (eksik[tur] || 0) - (dolan[tur] || 0);
    if (a > 0) basilamayan[tur] = a;
    const b = (yarali[tur] || 0) - (iyilesen[tur] || 0);
    if (b > 0) iyilesemeyen[tur] = b;
  }

  // Hiçbir şey olmadıysa orduya DOKUNULMAZ: kaynak harcanmaz, hasar havuzu da durur.
  // "Para gitti ama ordu aynı" hissi olmasın (Soru 2'nin ek kuralıyla aynı gerekçe).
  if (birimSayisi(dolan) === 0 && birimSayisi(iyilesen) === 0)
    return {
      yeniOrdu: ordu,
      harcanan: { nufus: 0, ekonomi: 0 },
      dolan: {},
      iyilesen: {},
      basilamayan,
      iyilesemeyen,
    };

  const birimler = { ...ordu.birimler };
  for (const tur of DENGE.BIRIM_SIRASI)
    if (dolan[tur] > 0) birimler[tur] = (birimler[tur] || 0) + dolan[tur];

  // §3.9/2: hasar havuzu SIFIRLANIR. Ordu yalnızca birim saymıyor, toparlanıyor da.
  // Kısmen dolan ordu için de sıfırlanır — "yarım toplanma yarım iyileşir" ayrı bir
  // kural olurdu ve tasarımda yok.
  const yeniOrdu = { ...ordu, birimler, hasarHavuzu: 0 };
  const kadro = kayitKadrosu(birimler, kadroAl(ordu));
  if (kadro) yeniOrdu.kadro = kadro;
  else delete yeniOrdu.kadro;
  const kalanYarali = kayitYaralilari(iyilesemeyen);
  if (kalanYarali) yeniOrdu.yarali = kalanYarali;
  else delete yeniOrdu.yarali;

  return { yeniOrdu, harcanan, dolan, iyilesen, basilamayan, iyilesemeyen };
}

// ---- ORDU BÖLÜNÜNCE KADRO (§5/1) ----
//
// HASAR HAVUZUYLA AYNI KURAL: birim sayısına oranla (Görev 05, `hareket.js orduBol`).
// Bölünen şey kadronun kendisi değil EKSİK KISMI — birimler zaten kimin yanına gidiyorsa
// onun kadrosuna yazılıyor. Eksiğin orantılı bölünmesi toplamı korur ve iki tarafta da
// kadro ≥ mevcut değişmezini bozmaz.
//
// Tam sayıya bölüşüm, projenin üç ayrı yerinde kullanılan EN BÜYÜK ARTIK yöntemiyle
// (`parcaDegerleri`, muharebedeki kayıp dağıtımı); eşitlikte BIRIM_SIRASI karar verir,
// yani sonuç belirlenimci.
//
// Dönen: { giden, kalan } — iki kadro nesnesi (kalan ordu boşsa `kalan` boş nesnedir).
export function kadroBol(ordu, gidenBirimler) {
  const birimler = ordu.birimler || {};
  const eksik = eksikKadro(ordu);
  const toplam = birimSayisi(birimler);
  const gidenSayi = birimSayisi(gidenBirimler);
  const toplamEksik = birimSayisi(eksik);

  const kalanBirimler = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler[tur] || 0) - ((gidenBirimler && gidenBirimler[tur]) || 0);
    if (n > 0) kalanBirimler[tur] = n;
  }

  // Ordunun tamamı gidiyorsa (ya da hiç birim kalmıyorsa) kadronun tamamı da gider —
  // arkada kadro bırakmak onu buharlaştırmak olurdu.
  const gidenEksik = {};
  if (birimSayisi(kalanBirimler) === 0) {
    for (const tur of DENGE.BIRIM_SIRASI) if (eksik[tur]) gidenEksik[tur] = eksik[tur];
  } else if (gidenSayi > 0 && toplamEksik > 0) {
    const oran = gidenSayi / toplam;
    const hedef = Math.round(toplamEksik * oran);
    const artiklar = [];
    let dagitilan = 0;
    for (const tur of DENGE.BIRIM_SIRASI) {
      if (!eksik[tur]) continue;
      const ham = eksik[tur] * oran;
      const taban = Math.floor(ham);
      gidenEksik[tur] = taban;
      dagitilan += taban;
      artiklar.push({ tur, artik: ham - taban });
    }
    artiklar.sort((a, b) => b.artik - a.artik);
    for (let i = 0; dagitilan < hedef && i < artiklar.length; i++) {
      const tur = artiklar[i].tur;
      if (gidenEksik[tur] >= eksik[tur]) continue;
      gidenEksik[tur]++;
      dagitilan++;
    }
    for (const tur of DENGE.BIRIM_SIRASI) if (!gidenEksik[tur]) delete gidenEksik[tur];
  }

  const kadroTopla = (temel, ek) => {
    const k = {};
    for (const tur of DENGE.BIRIM_SIRASI) {
      const n = (temel[tur] || 0) + (ek[tur] || 0);
      if (n > 0) k[tur] = n;
    }
    return k;
  };

  const kalanEksik = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (eksik[tur] || 0) - (gidenEksik[tur] || 0);
    if (n > 0) kalanEksik[tur] = n;
  }

  return {
    giden: kadroTopla(gidenBirimler || {}, gidenEksik),
    kalan: kadroTopla(kalanBirimler, kalanEksik),
  };
}

// TOPLANMA EMRİNİN KENDİSİ `hareket.js`'TE (2026-07-31'de oraya taşındı).
// Sebep: o dosyanın işi "ne emredebilirsin", emir doğrulaması oraya ait. Ayrıca emrin
// geçerliliği REZERVASYON DEFTERİNİ okumayı gerektiriyor (`kullanilabilirBirimler`) ve
// defter orada; buraya taşınsaydı ya döngüsel bağımlılık ya da defterin ikinci bir
// kopyası doğardı. Bu dosyada toplanmanın MEKANİĞİ kalıyor: bedel, doldurma, bölüşüm.

// ---- TUR DÖNGÜSÜNÜN 4. AŞAMASI — ÇÖZÜMDEN SONRA (§8/4, Soru 2 → cevap B) ----
//
// Ordu o tur yıpranmış hâliyle savundu; şimdi doluyor. Kaynak BURADA düşüyor, emir
// verilirken değil: ordu o tur imha olduysa hiçbir şey harcanmaz.
//
// ORDU YERİNDE OLMAYABİLİR. Üç durum var ve üçü de ayrı cevaplanıyor:
//   • yerinde duruyor            → orada dolar (savundu, belki daha da yıprandı)
//   • bozulup ÇEKİLDİ            → yeni parçasında dolar (§3.9/2 "dost bir parçada durur")
//   • imha oldu / parça düştü    → hiçbir şey olmaz, kuruş harcanmaz
// Çekilen orduyu bulmak için tur raporu okunuyor; çekilme yönünü zaten `cozum.js` yazıyor,
// burada ikinci kez hesaplanmıyor.
function toplananinYeri(durum, rapor, emir) {
  const yerinde = (durum.ordular || {})[emir.kaynak];
  if (yerinde && yerinde.sahip === emir.sahip) return emir.kaynak;

  for (const s of (rapor && rapor.satirlar) || []) {
    if (s.tip !== 'muharebe' || s.hedef !== emir.kaynak || !s.cekilme) continue;
    if (s.cekilme.taraf !== 'savunan' || s.cekilme.yokOldu || !s.cekilme.hedef) continue;
    const o = (durum.ordular || {})[s.cekilme.hedef];
    if (o && o.sahip === emir.sahip) return s.cekilme.hedef;
  }
  return null;
}

// Dönen: { durum, satirlar } — `satirlar` tur raporuna eklenir.
export function toplanmaAsamasi(durum, rapor) {
  const emirler = (durum.emirler || []).filter((e) => e.tip === 'toplanma');
  if (emirler.length === 0) return { durum, satirlar: [] };

  let d = durum;
  const satirlar = [];
  const islenenYerler = {}; // çekilip birleşen iki ordu iki kez dolmasın

  for (const emir of emirler) {
    const yer = toplananinYeri(d, rapor, emir);
    if (!yer || islenenYerler[yer]) {
      satirlar.push({ tip: 'toplanma', kaynak: emir.kaynak, olmadi: 'ordu-yok' });
      continue;
    }
    islenenYerler[yer] = true;

    const ordu = d.ordular[yer];
    const aktor = d.aktorler[emir.sahip];
    if (!aktor || !toplanabilirMi(ordu)) {
      satirlar.push({ tip: 'toplanma', kaynak: emir.kaynak, yer, olmadi: 'gereksiz' });
      continue;
    }

    // Bütçe: bu noktada gelir eklenmiş, araştırma ve üretim düşmüş. Kalan havuz kadar.
    // Birden çok toplanma emri varsa sırayla harcarlar — ilk emir önce doyar.
    const s = toplanmaCoz(
      ordu,
      {
        nufus: Math.floor(aktor.nufusHavuzu),
        ekonomi: Math.floor(aktor.ekonomiHavuzu),
      },
      seferberlikBedava(aktorArastirmasi(d, emir.sahip)),
      // TOPLANMA USTASI (Görev 16 / Adım 5): komutanın parçası ve komşularında bütçe eki.
      toplanmaUstasiButcesi(d, emir.sahip, emir.kaynak)
    );

    if (birimSayisi(s.dolan) === 0 && birimSayisi(s.iyilesen) === 0) {
      satirlar.push({ tip: 'toplanma', kaynak: emir.kaynak, yer, olmadi: 'butce' });
      continue;
    }

    const kayit = { sahip: ordu.sahip, birimler: s.yeniOrdu.birimler };
    const kadro = kayitKadrosu(s.yeniOrdu.birimler, kadroAl(s.yeniOrdu));
    if (kadro) kayit.kadro = kadro;
    // İyileşemeyen yaralılar kalıyor; hepsi iyileştiyse alan hiç yazılmıyor.
    const kalanYarali = kayitYaralilari(yaraliAl(s.yeniOrdu));
    if (kalanYarali) kayit.yarali = kalanYarali;
    // hasarHavuzu yazılmıyor: toplanma onu sıfırladı, sıfır alan kayda girmez.

    d = {
      ...d,
      aktorler: havuzdanDus(d.aktorler, emir.sahip, s.harcanan),
      ordular: { ...d.ordular, [yer]: kayit },
    };
    satirlar.push({
      tip: 'toplanma',
      kaynak: emir.kaynak,
      yer,
      cekildi: yer !== emir.kaynak,
      dolan: s.dolan,
      iyilesen: s.iyilesen,
      harcanan: s.harcanan,
      basilamayan: birimSayisi(s.basilamayan) > 0 ? s.basilamayan : null,
      iyilesemeyen: birimSayisi(s.iyilesemeyen) > 0 ? s.iyilesemeyen : null,
    });
  }

  return { durum: d, satirlar };
}

// ---- DENETİM (testler ve geliştirici modu için) ----
// Değişmez kuralı tek satırda sorar: her tür için kadro ≥ mevcut mu?
export function kadroGecerliMi(ordu) {
  const kadro = kadroAl(ordu);
  const birimler = (ordu && ordu.birimler) || {};
  return DENGE.BIRIM_SIRASI.every((tur) => (kadro[tur] || 0) >= (birimler[tur] || 0));
}

// Ordunun okunabilir eksik dökümü: "3 piyade, 1 topçu eksik" (panel ve tur raporu).
export function eksikDokumu(eksik) {
  const parcalar = [];
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = eksik && eksik[tur];
    if (n > 0) parcalar.push(n + ' ' + DENGE.BIRIMLER[tur].ad.toLocaleLowerCase('tr'));
  }
  return parcalar.join(', ');
}
