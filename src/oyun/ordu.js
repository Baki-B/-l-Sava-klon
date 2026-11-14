// ORDU — birim satın alma ve ordu hesapları (Görev 04 / Adım 3).
//
// VERİ YAPISI (durum.ordular):
//   { "16-1": { sahip: "16", birimler: { piyade: 3, topcu: 1, zirhli: 1 } } }
//
// Kurallar:
//   • BOŞ PARÇA İÇİN KAYIT TUTULMAZ. Ordusu olmayan parça `ordular`da hiç görünmez —
//     181 parçanın çoğu boş olacak, kayıt dosyası böyle küçük kalır.
//   • Bir parçada TEK SAHİP. İki aktörün ordusu aynı parçada duramaz (muharebe Görev 05;
//     şimdilik böyle bir durum oluşmuyor çünkü sadece kendi parçana üretiyorsun).
//   • Düz veri — kayda olduğu gibi girer (§6.6).
//   • Son birim de gidince parçanın kaydı SİLİNİR, boş `birimler: {}` bırakılmaz.
//
// SİPARİŞ TEKRARI KALDIRILDI (2026-07-30, Baki: "tekrarla düğmesini kaldıralım, gerek yok").
// Görev 04'te eklenmişti; hareket geldikten sonra turun asıl işi asker basmak değil asker
// SÜRMEK oldu ve düğme yer tutmaya başladı. `durum.sonSiparis` alanı da kaldırıldı —
// kullanılmayan veriyi kayıtta taşımanın anlamı yok. Eski bir kayıt o alanı taşıyorsa
// zararsızca yok sayılır (kimse okumuyor), o yüzden kayıt sürümü artırılmadı.
//
// GARNİZON/SEFER AYRIMI YOK (Görev 04 / Soru 3 → Baki'nin cevabı A). Birim bir parçada
// durur: kalırsa savunur, çıkarsa saldırır. Parça artık haritada gerçek bir bölge olduğu
// için ayrım kendiliğinden oluşuyor; ikinci bir etiket mekaniği gereksiz.
//
// HAREKET YOK — ordular üretildikleri yerde durur (Görev 05).

import { DENGE } from '../denge.js';
import { PARCALAR, ILLER } from './veri.js';
import { kapsamdaMi } from './oyunDurumu.js';
import { kullanilabilirButce, havuzdanDus } from './butce.js';
import { seferberlikPayi } from '../para/odulEtki.js';
// NOT: bu dosya `toplanma.js`'i İTHAL ETMEZ — döngü olurdu (toplanma.js buradan
// `birimSayisi` ve `kadroAl` alıyor). Kadronun iki temel okuyucusu bu yüzden burada.
// `butce.js` yalnızca `denge.js`'e bağlı olduğu için ondan ithal etmek güvenli.

// ---- TEMEL SORGULAR ----

// Bir siparişin ({ piyade: 4, topcu: 1 }) toplam bedeli.
export function siparisMaliyeti(siparis) {
  let nufus = 0,
    ekonomi = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const adet = siparis[tur] || 0;
    if (adet <= 0) continue;
    nufus += DENGE.BIRIMLER[tur].nufus * adet;
    ekonomi += DENGE.BIRIMLER[tur].ekonomi * adet;
  }
  return { nufus, ekonomi };
}

// ---- KADRO (Görev 06) — kayıt yapısının iki temel okuyucusu ----
//
// Ordu iki sayı taşır: `birimler` (sahadaki mevcut) ve `kadro` (kağıt üstündeki mevcut).
// Toplanmanın kendi mantığı `toplanma.js`'te; bu iki okuyucu burada, çünkü kayıt yapısının
// sahibi bu dosya (yukarıdaki VERİ YAPISI notu) ve üretim de kadro yazmak zorunda.
//
// KADRO ALANI YALNIZCA FARKLIYSA SAKLANIR. Yıpranmamış ordunun kadro alanı hiç yazılmaz;
// bu yüzden kadro HER YERDE `kadroAl` ile okunur, `ordu.kadro` diye doğrudan okunmaz.

// Ordunun kadrosu. Alan yoksa kadro = mevcut demektir (ordu yıpranmamış).
// Dönen nesne DEĞİŞTİRİLMEMELİ — kayıttaki `birimler`'in kendisi olabilir.
export function kadroAl(ordu) {
  return (ordu && ordu.kadro) || (ordu && ordu.birimler) || {};
}

// Kayda yazılacak kadro alanı: mevcutla AYNIYSA undefined döner (alan hiç yazılmaz).
// Kayıt boyutunun ilk turda hiç büyümemesinin sebebi bu fonksiyondur.
export function kayitKadrosu(birimler, kadro) {
  if (!kadro) return undefined;
  for (const tur of DENGE.BIRIM_SIRASI)
    if ((kadro[tur] || 0) !== (birimler[tur] || 0)) return { ...kadro };
  return undefined;
}

// ---- YARALI BİRİMLER (2026-07-31) ----
//
// Ordu artık ÜÇ durumu birden taşıyor:
//   birimler − yarali  → SAĞLAM birimler; savaşabilir, hareket edebilir
//   yarali             → sahada ama canı az; toplanmayla iyileşir
//   kadro − birimler   → ÖLENLER; toplanmayla yerine yenisi gelir
//
// Değişmez kural: her tür için `yarali ≤ birimler`. Yaralı olmayan ordunun `yarali` alanı
// hiç yazılmaz (kadroyla aynı kayıt kuralı).

// Ordunun yaralıları. Alan yoksa boş nesne — hiç yaralısı yok demektir.
export function yaraliAl(ordu) {
  return (ordu && ordu.yarali) || {};
}

// Sahada savaşabilecek SAĞLAM birimler: mevcut eksi yaralı.
export function saglamBirimler(ordu) {
  const birimler = (ordu && ordu.birimler) || {};
  const yarali = yaraliAl(ordu);
  const saglam = {};
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler[tur] || 0) - (yarali[tur] || 0);
    if (n > 0) saglam[tur] = n;
  }
  return saglam;
}

// Kayda yazılacak yaralı alanı: hiç yaralı yoksa undefined (alan yazılmaz).
export function kayitYaralilari(yarali) {
  if (!yarali) return undefined;
  for (const tur of DENGE.BIRIM_SIRASI) if (yarali[tur] > 0) return { ...yarali };
  return undefined;
}

// Bir birim yığınındaki toplam birim sayısı.
export function birimSayisi(birimler) {
  if (!birimler) return 0;
  let n = 0;
  for (const tur of DENGE.BIRIM_SIRASI) n += birimler[tur] || 0;
  return n;
}

// Parçadaki ordu ({ sahip, birimler }) veya ordu yoksa null.
export function parcaOrdusu(durum, parcaId) {
  return (durum.ordular && durum.ordular[parcaId]) || null;
}

// Parçadaki toplam birim sayısı (yakın katman rozeti).
export function parcaBirimSayisi(durum, parcaId) {
  const o = parcaOrdusu(durum, parcaId);
  return o ? birimSayisi(o.birimler) : 0;
}

// Bir aktörün sahadaki toplam birim sayısı.
export function aktorBirimSayisi(durum, aktorId) {
  let n = 0;
  for (const pid of Object.keys(durum.ordular || {})) {
    const o = durum.ordular[pid];
    if (o.sahip === aktorId) n += birimSayisi(o.birimler);
  }
  return n;
}

// Bir ildeki ordu durumu — ORTA KATMAN rozeti için.
// Dönen: { toplam, baskinAktorId, sahipler: [{ aktorId, sayi }] } (çoktan aza sıralı).
// Birden fazla sahip varsa rozet EN ÇOK BİRİMİ OLANIN rengiyle çizilir ama sayı
// ilin TOPLAMIDIR (görev belgesi §7.2); ayrıntı panelde verilir.
export function ilOrduDurumu(durum, ilKodu) {
  const sayim = {};
  let toplam = 0;
  for (const pid of Object.keys(durum.ordular || {})) {
    if (!PARCALAR[pid] || PARCALAR[pid].kod !== ilKodu) continue;
    const o = durum.ordular[pid];
    const n = birimSayisi(o.birimler);
    if (n === 0) continue;
    toplam += n;
    sayim[o.sahip] = (sayim[o.sahip] || 0) + n;
  }
  const sahipler = Object.keys(sayim)
    .map((aktorId) => ({ aktorId, sayi: sayim[aktorId] }))
    .sort((a, b) => b.sayi - a.sayi || (a.aktorId < b.aktorId ? -1 : 1));
  return { toplam, baskinAktorId: sahipler.length ? sahipler[0].aktorId : null, sahipler };
}

// Haritadaki tüm il toplamlarını TEK GEÇİŞTE hesaplar (orta katman her karede çizilir,
// 81 il için ayrı ayrı taramak israf olur). Dönen: { "16": { toplam, baskinAktorId } }
//
// OYUN DURUMU DEĞİL, DOĞRUDAN `ordular` TABLOSU alır (2026-07-30). Sebep: arayüz bunu
// `useMemo` ile önbelleğe alıyor ve bağımlılığın GERÇEK olması gerekiyor. Durum alsaydı
// bağımlılık "tüm oyun durumu" olur, her seçimde/siparişte 181 parça boşuna taranırdı.
export function tumIlOrdulari(ordular) {
  const sayim = {}; // ilKodu -> { aktorId: sayi }
  const yipranan = {}; // ilKodu -> o ilde kadrosu eksik ordu var mı (Görev 06)
  for (const pid of Object.keys(ordular || {})) {
    const p = PARCALAR[pid];
    if (!p) continue;
    const o = ordular[pid];
    const n = birimSayisi(o.birimler);
    if (n === 0) continue;
    (sayim[p.kod] || (sayim[p.kod] = {}))[o.sahip] = (sayim[p.kod][o.sahip] || 0) + n;
    // İl rozeti tek sayı gösteriyor; çentik "bu ilde toparlanmayı bekleyen ordu var"
    // demek. Hangi parçada olduğu yakın katmanda ve panelde görünür.
    if (o.kadro && !yipranan[p.kod]) {
      const kadro = kadroAl(o);
      yipranan[p.kod] = DENGE.BIRIM_SIRASI.some((t) => (kadro[t] || 0) > (o.birimler[t] || 0));
    }
  }
  const sonuc = {};
  for (const kod of Object.keys(sayim)) {
    let toplam = 0,
      baskin = null,
      enCok = -1;
    for (const aktorId of Object.keys(sayim[kod])) {
      const n = sayim[kod][aktorId];
      toplam += n;
      if (n > enCok) {
        enCok = n;
        baskin = aktorId;
      }
    }
    sonuc[kod] = { toplam, baskinAktorId: baskin, yipranmis: !!yipranan[kod] };
  }
  return sonuc;
}

// ---- SANAYİ ÜRETİM SINIRI ----
// Soru 2 → cevap A: bir ilde TUR BAŞINA en fazla o ilin `sanayi` statı kadar birim üretilir.
//
// Sayaç aktör BAŞINA tutulur (`durum.buTurUretim[aktorId][ilKodu]`): aynı ilin parçaları
// iki düşmanın elindeyse birinin ürettiği ötekinin hakkını yemesin. Sayaç her tur sıfırlanır
// (turDongusu.js). Kapasite ilin kendi statından gelir, kaç parçasını tuttuğundan değil —
// tasarım belgesi böyle diyor, orantılamak yeni bir kural icat etmek olurdu.
export function ilUretimHakki(durum, ilKodu, aktorId) {
  // ACİL SEFERBERLİK (Görev 19 / Adım 2): ödül kullanıldıysa O TUR sınır genişliyor.
  // Hesap BURADA çünkü sınırın tek sahibi bu fonksiyon — üretim ekranı, [+] tuşu ve motor
  // hepsi buradan okuyor (§9/7'nin "üç musluk üç ayrı yerde denetlenirse biri kaçar" dersi).
  const ek = seferberlikPayi(durum, aktorId);
  const sinir = DENGE.SANAYI_SINIRI_ACIK ? ILLER[ilKodu].statlar.sanayi + ek : Infinity;
  const aktorSayac = (durum.buTurUretim || {})[aktorId] || {};
  const kullanilan = aktorSayac[ilKodu] || 0;
  return { sinir, kullanilan, kalan: Math.max(0, sinir - kullanilan) };
}

// ---- SATIN ALMA ----

// Sipariş verilebilir mi? Dönen: { ok: true } veya { ok: false, kod, sebep }
// `kod` arayüz için: 'kapsam' | 'sahiplik' | 'bos' | 'aktor' | 'nufus' | 'ekonomi' | 'sanayi'.
// Üretim ekranı ret sebebini buna göre gösteriyor — bütçe yetmezliğinde SESSİZ kalıp
// yalnızca [+] tuşunu söndürmesi, sanayi sınırında ise sebebi yazması gerekiyor (§9).
export function siparisGecerliMi(durum, parcaId, aktorId, siparis) {
  if (!kapsamdaMi(durum, parcaId))
    // Oyuncunun kelimesi BÖLGE (2026-08-01, yayın hazırlığı) — "parça" bir geliştirme
    // terimi ve ekranın geri kalanı zaten bölge diyor.
    return { ok: false, kod: 'kapsam', sebep: 'Bu bölge oyunun dışında.' };
  if (durum.parcaSahipligi[parcaId] !== aktorId)
    return { ok: false, kod: 'sahiplik', sebep: 'Yalnızca kendi bölgene asker basabilirsin.' };

  const adet = birimSayisi(siparis);
  if (adet <= 0) return { ok: false, kod: 'bos', sebep: 'Hiç birlik seçmedin.' };

  const aktor = durum.aktorler[aktorId];
  if (!aktor) return { ok: false, kod: 'aktor', sebep: 'Böyle bir taraf yok.' };

  const bedel = siparisMaliyeti(siparis);
  // HAVUZA DEĞİL, HARCANABİLİR BÜTÇEYE bakılır (Görev 06): araştırmaya ayrılan pay ve
  // bekleyen toplanma emirleri havuzda hâlâ duruyor ama artık senin değil. Hesap tek
  // yerde — `butce.js`; üç musluk üç yerde denetlenirse biri kaçar (§9/7).
  //
  // Bütçe AŞAĞI YUVARLANMIŞ gelir: oyuncu ekranda "18 nüfus" görüp 18'lik sipariş
  // verebilmeli (Görev 04 kuralı).
  const butce = kullanilabilirButce(durum, aktorId);
  if (bedel.nufus > butce.nufus) return { ok: false, kod: 'nufus', sebep: 'Nüfusun yetmiyor.' };
  if (bedel.ekonomi > butce.ekonomi)
    return { ok: false, kod: 'ekonomi', sebep: 'Ekonomin yetmiyor.' };

  const hak = ilUretimHakki(durum, PARCALAR[parcaId].kod, aktorId);
  if (adet > hak.kalan)
    return {
      ok: false,
      kod: 'sanayi',
      sebep: 'Sanayi sınırı: bu ilde bu tur en fazla ' + hak.kalan + ' birlik daha basabilirsin.',
    };

  return { ok: true };
}

// Üretim ekranının `[+]` tuşu için: siparişe bu türden bir tane DAHA eklenebilir mi?
//
// Neden ayrı bir fonksiyon: ekran oyun durumunu tanımaz (diğer bileşenler gibi düz veri
// alır), ama kural motorunkinden ayrışmamalı. İkisi de aynı `siparisMaliyeti` ve aynı
// DENGE sayılarını kullanıyor; testte ikisinin hep aynı cevabı verdiği doğrulanıyor.
//
// havuz: { nufus, ekonomi } — AŞAĞI YUVARLANMIŞ (ekranda görünen) değerler.
// kalanHak: bu ilde bu tur basılabilecek birim sayısı (Infinity = sınır kapalı).
// Dönen: { ok: true } veya { ok: false, kod: 'nufus' | 'ekonomi' | 'sanayi' }
export function eklenebilirMi(tur, siparis, havuz, kalanHak) {
  if (birimSayisi(siparis) >= kalanHak) return { ok: false, kod: 'sanayi' };
  const bedel = siparisMaliyeti(siparis);
  const birim = DENGE.BIRIMLER[tur];
  if (bedel.nufus + birim.nufus > havuz.nufus) return { ok: false, kod: 'nufus' };
  if (bedel.ekonomi + birim.ekonomi > havuz.ekonomi) return { ok: false, kod: 'ekonomi' };
  return { ok: true };
}

// Siparişi üretir ve YENİ durum döndürür (gelen durum değiştirilmez — React tazelensin).
// Geçersizse durumu değiştirmeden { ok: false, sebep } döndürür.
export function birimUret(durum, parcaId, aktorId, siparis) {
  const gecerli = siparisGecerliMi(durum, parcaId, aktorId, siparis);
  if (!gecerli.ok) return { ok: false, sebep: gecerli.sebep, durum };

  const bedel = siparisMaliyeti(siparis);
  const adet = birimSayisi(siparis);
  const ilKodu = PARCALAR[parcaId].kod;

  // 1) Havuzdan düş
  const aktorler = havuzdanDus(durum.aktorler, aktorId, bedel);

  // 2) Birimleri parçaya ekle (varsa üstüne, yoksa yeni kayıt)
  const mevcut = parcaOrdusu(durum, parcaId);
  const birimler = { ...((mevcut && mevcut.birimler) || {}) };
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = siparis[tur] || 0;
    if (n > 0) birimler[tur] = (birimler[tur] || 0) + n;
  }

  // TAKVİYE KADROYU DA ARTIRIR (Görev 06 §5/3): parası ödenmiş birim kadroya girer.
  // Aksi hâlde yeni basılan birim ölünce doldurulamazdı — kadro onu hiç tanımamış olurdu.
  // Yıpranmış orduya takviye yapılırsa eksik korunur: kadro da mevcut da aynı kadar artar.
  const eskiKadro = mevcut ? kadroAl(mevcut) : {};
  const kadro = { ...eskiKadro };
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = siparis[tur] || 0;
    if (n > 0) kadro[tur] = (kadro[tur] || 0) + n;
  }
  const kayit = { sahip: aktorId, birimler };
  const kadroAlani = kayitKadrosu(birimler, kadro);
  if (kadroAlani) kayit.kadro = kadroAlani;
  if (mevcut && mevcut.hasarHavuzu > 0) kayit.hasarHavuzu = mevcut.hasarHavuzu;
  const ordular = { ...(durum.ordular || {}), [parcaId]: kayit };

  // 3) Sanayi sayacını ilerlet (tur sonunda sıfırlanır — turDongusu.js)
  const oncekiSayac = (durum.buTurUretim || {})[aktorId] || {};
  const buTurUretim = {
    ...(durum.buTurUretim || {}),
    [aktorId]: { ...oncekiSayac, [ilKodu]: (oncekiSayac[ilKodu] || 0) + adet },
  };

  return { ok: true, durum: { ...durum, aktorler, ordular, buTurUretim } };
}

// ---- GÖSTERİM ----

// Rozetin üstündeki yazı. 99'un üstü "99+" olur: rozet büyümesin, Adım 2 ölçümü
// (26 px, iki hane) geçerli kalsın. Soru 4 → cevap B, yumuşak sınır.
export function rozetYazisi(sayi) {
  const en = DENGE.ROZET.EN_COK_GOSTERILEN;
  return sayi > en ? en + '+' : String(sayi);
}

// Üç katmanın TANIMI: 'uzak' (rozet yok) | 'orta' (il rozeti) | 'yakin' (parça rozeti).
//
// ÇİZİM ARTIK BUNU DOĞRUDAN ÇAĞIRIYOR (2026-07-30). Eskiden çağıramıyordu: katman kararı
// her karede UI iş parçacığında veriliyordu, oraya başka dosyadan fonksiyon geçemez. Karar
// artık hareket durunca JS'te veriliyor (`RozetKatmani.js`), yani tanım ile çizim aynı
// satırdan besleniyor — "resmî tanım ama kimse çağırmıyor" durumu kapandı.
//
// HİSTEREZİS: `onceki` katman verilirse AŞAĞI dönüş sınırın KATMAN_HISTEREZIS kadar altında
// olur, yukarı çıkış sınırda kalır. Yakınlaştırma tam sınırda duraklayınca katmanın gidip
// gelip rozetleri titretmesini engeller (Baki, 2026-07-30). Verilmezse sade eşik davranışı.
export function rozetKatmani(olcek, onceki) {
  const R = DENGE.ROZET;
  const h = R.KATMAN_HISTEREZIS;
  const yakinSinir = onceki === 'yakin' ? R.YAKIN_SINIR - h : R.YAKIN_SINIR;
  const ortaSinir = onceki === 'orta' || onceki === 'yakin' ? R.ORTA_SINIR - h : R.ORTA_SINIR;
  if (olcek >= yakinSinir) return 'yakin';
  if (olcek >= ortaSinir) return 'orta';
  return 'uzak';
}

// Ordunun okunabilir dökümü: "3 piyade, 1 topçu, 1 zırhlı" (panelde gösterilir).
export function orduDokumu(birimler) {
  const parcalar = [];
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = birimler && birimler[tur];
    if (n > 0) parcalar.push(n + ' ' + DENGE.BIRIMLER[tur].ad.toLocaleLowerCase('tr'));
  }
  return parcalar.join(', ');
}
