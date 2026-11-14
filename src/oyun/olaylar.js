// OLAY LİSTESİ — SAHNENİN VERİ KAYNAĞI (Görev 08 / Adım 2).
//
// ┌─ BU GÖREVİN BELKEMİĞİ: MOTOR KARAR VERİR, SAHNE OYNATIR (görev belgesi §4.2) ────────┐
// │                                                                                      │
// │   TURU BİTİR  →  motor her şeyi çözer (bugünkü gibi)                                 │
// │              →  ortaya SIRALI BİR OLAY LİSTESİ çıkar        ← BU DOSYA               │
// │              →  sahne o listeyi oynatır                                              │
// │                                                                                      │
// │ Animasyon başladığında oyunun durumu ÇOKTAN KESİNLEŞMİŞTİR. Sahne yalnızca olmuş     │
// │ bitmiş bir şeyi gösterir — maç bitmiştir, skor bellidir, oynatılan şey özettir.      │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- DEĞİŞMEZ KURAL (testle kilitli) ----
//
// OLAY LİSTESİ OYUN DURUMUNU DEĞİŞTİRMEZ. Bu dosya `durum` almıyor bile — yalnızca
// TUR RAPORUNU okuyor, yani zaten olmuş bitmiş bir dökümü. Atlamak, hızlandırmak, hiç
// oynatmamak: üçü de sonucu değiştiremez, çünkü değiştirecek bir kanal yok.
//
// Görev belgesi §10/7 bunu "en tehlikeli hata" diye işaretliyordu: bir efektin içinden
// durum değiştirilirse atlama bozulur ve OYUN KAYDI BOZULUR. Kanalı hiç açmamak, kapalı
// tutmaktan güvenli.
//
// ---- SAF VERİ, GÖRSEL BİLGİ YOK ----
// Olaylar PARÇA VE İL KİMLİĞİ taşır, ad taşımaz; renk, piksel, süre birimi bilmez.
// Adları ve renkleri ekran çözer — `cozum.js`'in raporu için konan kuralın aynısı.
// Tek istisna `oynatimPlani`: süreleri o hesaplıyor ama o da yalnızca DENGE'den okuyor.

import { DENGE } from '../denge.js';
import { ILLER } from './veri.js';
import { birimSayisi } from './ordu.js';
// Döküm kompakt dizi olarak saklanıyor; alan sırası TEK YERDE tanımlı ve yazan da okuyan
// da aynı listeyi kullanıyor (`cozum.js`). Elle indis yazmak bu görevin en sinsi hatası
// olurdu: sıra değişse kimse fark etmez, yalnızca sahnede yanlış sayı uçardı.
import { DOKUM_ALANLARI } from './cozum.js';

const S = DENGE.SAHNE;

// Oynatılabilir satır türleri. `iptal`, `arastirma` ve `toplanma` sahneye girmez:
// üçü de ekranda gösterilecek bir OLAY değil, tur raporunda okunacak bir SONUÇ.
const OYNATILIR = ['muharebe', 'giris'];

// ---- BU SATIR BENİ İLGİLENDİRİYOR MU ----
// Üç yoldan biriyle: saldıran benim, savunan benim, ya da el değişen parça benimdi.
// Üçüncüsü kolayca unutulur ve tam da en çok acıtan hâldir — toprağını kaybetmek.
function beniIlgilendirir(satir, ben) {
  return satir.aktorId === ben || satir.savunanId === ben || satir.eskiSahip === ben;
}

// ---- HANGİ SAVAŞLAR OYNAR (kapsam ayarı) ----
//
//   'kapali' → hiçbiri
//   'cephem' → yalnızca beni ilgilendirenler (varsayılan)
//   'hepsi'  → benimkiler önce, sonra uzaktakiler EN_COK_SAVAS'a kadar
//
// SENİN SAVAŞLARIN HER ZAMAN ÖNCE SIRAYA GİRER. Sınıra takılan uzaktakilerdir; yani
// "izlemek istediğim savaş atlandı" durumu hiçbir kapsamda doğmuyor (Baki'nin Soru 1 ve
// Soru 3 cevaplarının ortak şartı).
export function oynatilacakSatirlar(satirlar, ben, kapsam) {
  if (kapsam === 'kapali') return [];
  const uygun = (satirlar || []).filter((s) => OYNATILIR.includes(s.tip));
  const benim = uygun.filter((s) => beniIlgilendirir(s, ben));

  // ---- SENİN SAVAŞLARIN HİÇBİR ZAMAN KESİLMEZ (2026-08-01 düzeltmesi) ----
  // Sınır önce benim savaşlarıma da uygulanıyordu: sekiz cephede birden savaşan bir
  // oyuncunun iki savaşı sessizce atlanırdı. Bu, bütün ayarın dayandığı sözü —
  // "izlemek istediğim savaş atlanmaz" — tam olarak çiğniyordu.
  // Sınır artık YALNIZCA uzaktakilere; ölçüm de zaten oyuncunun turda 1–3 savaşı
  // olduğunu söylüyor, yani kesilen bir şey olmayacak ama söz kâğıt üstünde de duruyor.
  if (kapsam !== 'hepsi') return benim;

  const uzak = uygun.filter((s) => !beniIlgilendirir(s, ben));
  return benim.concat(uzak.slice(0, S.EN_COK_SAVAS));
}

// ---- "ÖNEMLİ SAVAŞ" (görev belgesi §6/3) ----
// İki şart birden: SEN taraf olacaksın VE toplam birlik sayısı eşiği aşacak.
// Eşiğin altı da oynar — yalnızca birlik şeridi açılmaz (§EK: "hiçbir savaş sessizce
// atlanmıyor, yalnızca ayrıntı kademesi değişiyor").
export function onemliSavasMi(satir, ben) {
  if (!beniIlgilendirir(satir, ben)) return false;
  const toplam = birimSayisi(satir.gonderilen || {}) + birimSayisi(satir.savunanGiren || {});
  return toplam >= S.ONEMLI_ESIGI;
}

// ---- ANA ÜRETİCİ ----
//
// Dönen: sıralı olay dizisi. `rapor` yoksa boş dizi (tur sessiz geçmiş).
//
// secenekler: { oyuncuAktorId, kapsam }
export function olaylariCikar(rapor, secenekler) {
  const ben = (secenekler || {}).oyuncuAktorId;
  const kapsam = (secenekler || {}).kapsam || S.VARSAYILAN_KAPSAM;
  if (!rapor || kapsam === 'kapali') return [];

  const olaylar = [{ tip: 'turAcilisi', tur: rapor.tur }];

  // DÜELLOLAR EN ÖNDE (Görev 08 / Adım 7). Kutsal savaşın ilanı, savaşın kendisinden
  // önce gelir — kart açılır, sonra kavga oynar.
  for (const d of rapor.duellolar || [])
    olaylar.push({ tip: 'duello', ilA: d.ilA, ilB: d.ilB, ad: d.ad, konu: d.konu });

  const oynanacak = oynatilacakSatirlar(rapor.satirlar, ben, kapsam);

  // KAMERA TUR BAŞINA BİR KEZ (§6/4). Hedefi ilk oynatılacak savaş, yani benimkilerin
  // ilki — sıralama zaten onları öne almış. Her olay için ayrı kaydırma baş döndürür.
  const kameraHedefi = oynanacak.length > 0 ? oynanacak[0].hedef : null;
  if (kameraHedefi && S.KAMERA.ACIK && S.KAMERA.EN_COK > 0)
    olaylar.push({ tip: 'kamera', parca: kameraHedefi });

  for (const s of oynanacak) {
    if (s.tip === 'giris') {
      girisOlaylari(olaylar, s, ben);
      continue;
    }
    muharebeOlaylari(olaylar, s, ben);
  }
  return olaylar;
}

// ---- MUHAREBESİZ GİRİŞ ----
// İki ayrı şey aynı satırdan çıkıyor ve ayırt eden şey fetih:
//   dost parçaya girdi   → TAKVİYE (kuvvet aktı, kimse ölmedi)
//   boş düşman parçasına → yürüyüş + fetih
function girisOlaylari(olaylar, s, ben) {
  if (!s.fethedildi) {
    olaylar.push({ tip: 'takviye', kaynak: s.kaynak, hedef: s.hedef, birimler: s.birimler });
    return;
  }
  olaylar.push({
    tip: 'yurus',
    kaynak: s.kaynak,
    hedef: s.hedef,
    birimler: s.birimler,
    saldiri: true,
  });
  fetihOlaylari(olaylar, s, ben);
}

// ---- MUHAREBE ----
// Sıra ekranda görüleceği sıradır: ordu yürür → şerit açılır → raunt raunt vuruşur →
// bozulan çekilir / imha olan dağılır → parça el değiştirir → il kartı gelir.
function muharebeOlaylari(olaylar, s, ben) {
  const parca = s.hedef;
  olaylar.push({
    tip: 'yurus',
    kaynak: s.kaynak,
    hedef: parca,
    birimler: s.gonderilen,
    saldiri: true,
  });

  const benim = beniIlgilendirir(s, ben);
  const onemli = onemliSavasMi(s, ben);
  olaylar.push({
    tip: 'savas',
    parca,
    kaynak: s.kaynak,
    arazi: s.arazi,
    saldiran: s.gonderilen,
    savunan: s.savunanGiren,
    saldiranId: s.aktorId,
    savunanId: s.savunanId,
    onemli,
    benim,
  });

  // ---- RAUNT RAUNT, AMA YALNIZCA SENİN SAVAŞLARINDA ----
  //
  // Veri kaynağı motorun zaten tuttuğu döküm (görev belgesi §3: "animasyonun veri kaynağı
  // bu"). Yeni bir hesap yapılmıyor, tek satır bile yeniden çözülmüyor.
  //
  // UZAKTAKİ SAVAŞLAR RAUNT DÖKÜMÜ ALMAZ. §4.4/3'ün kuralı: "cephede ayrıntı, uzakta
  // manşet". `hepsi` kapsamı o kuralı gevşetiyor ama gevşetmenin doğrusu "haritada görün"
  // — "her raundunu izle" değil. ÖLÇÜLDÜ (Adım 1): döküm uzaktakilere de verilince
  // `hepsi` kapsamı tur başına 14.4 saniyeye çıkıyordu, yani §4.4'ün "oyunu bozar" dediği
  // yere. Dökümü kısarak yarısından fazlası geri alındı ve dünya hâlâ canlı görünüyor.
  if (benim) {
    const dokum = s.dokum || [];
    for (let i = 0; i < dokum.length; i++) {
      const r = dokumSatiriniOku(dokum[i]);
      olaylar.push({
        tip: 'vurus',
        parca,
        raunt: i + 1,
        saldiranKayip: r.saldiranKayip,
        savunanKayip: r.savunanKayip,
        saldiranKalan: r.saldiranKalan,
        savunanKalan: r.savunanKalan,
      });
    }
  }

  // BOZGUN ve İMHA AYRI OLAYLAR. Bozulan ordu dağılır ama yaşar; imha olan hiç dönmez.
  // Titreşimi, sesi ve efekti farklı olacak — ikisini tek olaya sıkıştırmak, sonradan
  // ayırması pahalı bir sadeleştirme olurdu.
  //
  // ---- `benim` VE `bana` DAMGALARI (2026-08-12) ----
  // `benim` = bu savaş beni ilgilendiriyor mu · `bana` = bu KÖTÜ ŞEY BENİM BAŞIMA MI GELDİ.
  // İkisi de titreşim katmanı için: uzaktaki bir bozgun ile senin ordunun dağılması aynı
  // şeyi hissettirmemeli, ve `taraf` tek başına bunu söyleyemiyor ('saldiran'/'savunan'
  // aktör kimliği değil). Damga BURADA basılıyor çünkü aktör kimlikleri burada elimizde;
  // titreşim katmanının olayın kimin olduğunu tahmin etmeye çalışması gerekmiyor.
  const banaAit = (taraf) => ben !== undefined && ben !== null && taraf2Id(s, taraf) === ben;
  if (s.savunanBozgun)
    olaylar.push({ tip: 'bozgun', parca, taraf: 'savunan', benim, bana: banaAit('savunan') });
  if (s.saldiranBozgun)
    olaylar.push({ tip: 'bozgun', parca, taraf: 'saldiran', benim, bana: banaAit('saldiran') });
  if (s.savunanKalan === 0)
    olaylar.push({ tip: 'imha', parca, taraf: 'savunan', benim, bana: banaAit('savunan') });
  if (s.saldiranKalan === 0)
    olaylar.push({ tip: 'imha', parca, taraf: 'saldiran', benim, bana: banaAit('saldiran') });

  // Çekilme yalnızca BOZGUNDA oynatılıyor. Berabere biten muharebede de çekilme kaydı var
  // (saldıran kaynağına döner, kayıpsız) ama orada kimse kaçmıyor — oynatmak yanlış anlatır.
  const c = s.cekilme;
  if (c && c.kayip > 0 && !c.yokOldu)
    olaylar.push({
      tip: 'cekilme',
      parca,
      hedef: c.hedef,
      taraf: c.taraf,
      kayip: c.kayip,
      benim,
      bana: banaAit(c.taraf),
    });
  if (c && c.yokOldu)
    olaylar.push({ tip: 'imha', parca, taraf: c.taraf, benim, bana: banaAit(c.taraf) });

  fetihOlaylari(olaylar, s, ben);
}

// ---- FETİH VE İL ----
// Parçanın el değişmesi TAKTİK, ilin el değişmesi DUYGUSAL olaydır (§4.4/Katman 4:
// "il duygusal birim, parça taktik birim"). O yüzden üç ayrı olay.
//
// ---- İL KARTI YALNIZCA SENİN İÇİN AÇILIR ----
// Kart, oyuncunun anıdır: *"İSTANBUL FETHEDİLDİ"*. Uzaktaki bir yapay zekânın uzaktaki bir
// ili alması kart değil, MANŞETTİR — ve manşet zaten var (Görev 07, `MANSET_SINIRI`).
//
// ÖLÇÜMLE KONDU (Adım 1). Kartlar herkes için açılınca `hepsi` kapsamı tur başına 13.6
// saniyeye çıkıyordu ve sebebi kartlardı: haritada 81 ilin çoğu 1–2 parçalı, yani uzaktaki
// hemen her fetih bir "il tamamlandı" + bir "il kaybedildi" kartı doğuruyor. İkisi birden
// 3.4 saniye — tek bir uzak savaş, senin bütün turundan uzun sürüyordu.
//
// ---- KART KİMİN GÖZÜNDEN (2026-09-24 düzeltmesi · Baki: "İstanbul Anadolu'yu aldım, 'il
// kaybedildi' yazıyor; aslında parça kazanıldı yazmalı") ----
// `ilKaybedildi` ESKİ SAHİBİN ili elden çıktı demek, `ilTamamlandi` ALANIN ili tamamlandı
// demek. Eskiden ikisi de "savaş beni ilgilendiriyorsa" açılıyordu: Kocaeli olarak İstanbul'un
// bir parçasını alan oyuncuya İstanbul'un kaybı "İL KAYBEDİLDİ" diye gösteriliyordu. Artık:
//   ben aldım     → il tamamlandıysa İL FETHEDİLDİ, yoksa BÖLGE ALINDI
//   benden alındı → il elden çıktıysa İL KAYBEDİLDİ, yoksa BÖLGE KAYBEDİLDİ
//   başkaları     → kart yok (manşet ve renk darbesi var)
// Bölge kartları kısa (`DENGE.SAHNE.SURE.bolgeKarti`): il kartı "anıt", bölge kartı haber.
function fetihOlaylari(olaylar, s, ben) {
  if (!s.fethedildi) return;
  // Parçanın rengi HER OYNATILAN savaşta döner — harita canlı görünsün.
  olaylar.push({ tip: 'fetih', parca: s.hedef, eski: s.eskiSahip, yeni: s.aktorId });
  const aldim = ben !== undefined && ben !== null && s.aktorId === ben;
  const kaybettim = ben !== undefined && ben !== null && !aldim && s.eskiSahip === ben;
  if (aldim) {
    if (s.ilTamamlandi)
      olaylar.push({ tip: 'ilTamamlandi', il: s.ilKodu, yeni: s.aktorId, ganimet: s.ganimet });
    else olaylar.push({ tip: 'bolgeAlindi', parca: s.hedef, yeni: s.aktorId, ganimet: s.ganimet });
  } else if (kaybettim) {
    if (s.ilKaybedildi)
      olaylar.push({ tip: 'ilKaybedildi', il: s.ilKodu, eski: s.eskiSahip, yeni: s.aktorId });
    else olaylar.push({ tip: 'bolgeKaybedildi', parca: s.hedef, yeni: s.aktorId });
  }
}

// 'saldiran'/'savunan' → o tarafın aktör kimliği. Muharebe satırı ikisini de taşıyor;
// bozgun/imha/çekilme olayları yalnızca `taraf` taşıdığı için çeviri burada yapılıyor.
function taraf2Id(s, taraf) {
  return taraf === 'saldiran' ? s.aktorId : s.savunanId;
}

function dokumSatiriniOku(dizi) {
  const o = {};
  DOKUM_ALANLARI.forEach((ad, i) => (o[ad] = dizi[i]));
  return o;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// OYNATIM PLANI — hangi olay kaç milisaniye sürer
// ═══════════════════════════════════════════════════════════════════════════════════════
//
// Listeyi DEĞİŞTİRMEZ, her olaya bir `sure` ekler. Ayrı durmasının sebebi test edilebilirlik:
// "doğru olaylar doğru sırada mı" sorusu ile "gösteri ne kadar sürüyor" sorusu ayrı ayrı
// sınanabiliyor.

// Olay türünden DENGE.SAHNE.SURE anahtarına. Kartların iki ayrı süresi var (fetih uzun
// ve parlak, kayıp daha uzun ve ağır); geri kalanlar birebir eşleşiyor.
const SURE_ANAHTARI = {
  turAcilisi: 'turAcilisi',
  duello: 'duelloKarti',
  kamera: 'kamera',
  yurus: 'yurus',
  takviye: 'takviye',
  savas: 'savas',
  vurus: 'vurus',
  bozgun: 'bozgun',
  cekilme: 'cekilme',
  imha: 'imha',
  fetih: 'fetih',
  ilTamamlandi: 'ilKarti',
  ilKaybedildi: 'ilKaybiKarti',
  bolgeAlindi: 'bolgeKarti',
  bolgeKaybedildi: 'bolgeKaybiKarti',
};

// ---- ÖLÇEK DUYGUSU (§4.1/6) ----
// "Iğdır'ı almak İstanbul'u almakla aynı hissettiriyor." Kartın süresi ilin DEĞERİNE göre
// uzuyor. Değer ölçüsü nüfus + ekonomi — oyunun her yerinde "ilin değeri" bu.
//
// En değersiz ve en değerli il bir kez hesaplanıp önbelleğe alınıyor: 81 ilin statları
// oyun boyunca değişmiyor.
let _bant = null;
function ilDegerBandi() {
  if (_bant) return _bant;
  let enAz = Infinity,
    enCok = -Infinity;
  for (const kod of Object.keys(ILLER)) {
    const st = ILLER[kod].statlar;
    const d = st.nufus + st.ekonomi;
    if (d < enAz) enAz = d;
    if (d > enCok) enCok = d;
  }
  _bant = { enAz, enCok };
  return _bant;
}

// çarpan = 1 + OLCEK_GUCU × (2 × oran − 1)
//   OLCEK_GUCU 0   → bütün iller aynı
//   OLCEK_GUCU 0.4 → en değerli 1.4×, en değersiz 0.6×
export function ilOlcegi(ilKodu) {
  const il = ILLER[ilKodu];
  if (!il) return 1;
  const { enAz, enCok } = ilDegerBandi();
  if (enCok === enAz) return 1;
  const deger = il.statlar.nufus + il.statlar.ekonomi;
  const oran = (deger - enAz) / (enCok - enAz);
  return 1 + S.OLCEK_GUCU * (2 * oran - 1);
}

// Her olaya süre yazar. Üç şey süreyi belirliyor:
//   1. Türünün taban süresi (DENGE.SAHNE.SURE)
//   2. İLKİ TAM, TEKRARI KISA (§4.4/4) — aynı türün TEKRAR_ESIGI'ncisinden sonrası kısalır.
//      Onuncu vuruş birincisi kadar uzun sürerse uzun bir muharebe tek başına turu yer.
//   3. İl kartlarında ilin ölçeği
// Hepsinin üstünde HIZ_CARPANI: cihazda "uzun geliyor" denirse değişecek tek sayı.
export function oynatimPlani(olaylar) {
  const sayac = {};
  return (olaylar || []).map((o) => {
    const taban = S.SURE[SURE_ANAHTARI[o.tip]] || 0;
    const kacinci = (sayac[o.tip] = (sayac[o.tip] || 0) + 1);
    const kisaltma = kacinci > S.TEKRAR_ESIGI ? S.TEKRAR_KISALTMA : 1;
    const olcek = o.tip === 'ilTamamlandi' || o.tip === 'ilKaybedildi' ? ilOlcegi(o.il) : 1;
    return { ...o, sure: Math.round(taban * kisaltma * olcek * S.HIZ_CARPANI) };
  });
}

// Gösterinin toplam süresi (ms). Ölçüm betiği ve ayar ekranı bunu okuyor.
// Son nefes payı (SON_BEKLEME) dahil: oyuncunun ekran başında geçirdiği süre bu.
export function toplamSure(plan) {
  const olay = (plan || []).reduce((a, o) => a + (o.sure || 0), 0);
  return olay > 0 ? olay + S.SON_BEKLEME : 0;
}
