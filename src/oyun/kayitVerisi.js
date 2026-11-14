// KAYIT VERİSİ — oyun durumunu metne çevirme ve metinden geri okuma (Görev 03 §7 Adım 5).
//
// Bu dosya bilerek CİHAZ BELLEĞİNDEN BAĞIMSIZ: sadece metin dönüşümü ve doğrulama yapar.
// Depolama işi `kayit.js`'te. Ayrı durmalarının sebebi: dönüşüm mantığı böylece
// telefon olmadan, testlerle doğrulanabiliyor.

import { DENGE } from '../denge.js';
import { KAYIT_SURUMU, AKTOR_RENKLERI } from './oyunDurumu.js';
import { kayitKomutanlari } from './komutan.js';
import { kisilikUret } from './kisilik.js';
import { ILLER } from './veri.js';

// Durumu kayıt metnine çevirir. Durum düz veriden oluştuğu için (§6.6) ek iş gerekmez;
// geometri zaten duruma hiç girmediği için kayıt küçük kalır.
//
// TUR RAPORU KAYDA GİRMEZ (2026-07-30). Rapor, biten turun dökümü: her muharebenin tur tur
// hasar/kayıp/moral tablosunu taşıyor ve yalnızca sonuç ekranı bir kez okuyor. Yoğun bir
// turda tek başına 10 KB'a çıkıyordu — kaydı 23 KB'dan 29 KB'a şişiriyordu. Oyunun DURUMU
// değil, bir turluk GÖSTERİM verisi; kaydedilmesinin oyuna hiçbir faydası yok.
// Yüklenen oyunda alan `null` olur (bkz. metinCoz), yani sonuç ekranı açılmaz.
// Alan SİLİNMİYOR, `null`a çevriliyor: silinse anahtar sırası değişir ve "kaydedilip
// yüklenen oyun birebir aynı" testi metin karşılaştırmasında tutmaz.
//
// KİŞİLİKLER DE KAYDA GİRMEZ (Görev 07). Görev belgesi §6 "kayıtta tutulur ki yükleyince
// aynı rakiplerle devam edilsin" diyordu; aynı sonuç TÜRETEREK de elde ediliyor, üstelik
// daha güvenli: kişilik `kisilikUret(tohum, aktörler, zorluk)` ile üretiliyor ve üçü de
// zaten kayıtta. `durum.turSirasi`nın kayda girmeme gerekçesinin aynısı.
//
// ÖLÇÜLDÜ: 81 aktör × 4 ağırlık, anahtar adlarıyla birlikte kaydı 27.3 KB'a çıkarıyordu —
// görev belgesinin koyduğu 26 KB sınırının üstü. Türetince sınırın altına iniyor.
//
// ORDULARIN `sahip` ALANI DA KAYDA GİRMEZ (Görev 07). Bir parçada tek sahip vardır ve
// ordunun sahibi HER ZAMAN parçanın sahibidir — 15 turluk simülasyonda 2664 ordu kaydının
// hiçbirinde ayrışma çıkmadı, `testler/kayit.test.js` bu değişmezi ayrıca kilitliyor.
// (Görev 06 §6b/2'de geliştirici aracı bir kez ayrıştırmıştı; orada da hata sayılıp
// düzeltilmişti.) Alan yüklerken `parcaSahipligi`'nden geri konuyor.
//
// ---- AKTÖRÜN YALNIZCA HAVUZLARI KAYDA GİRER (Görev 09 / Adım 0) ----
//
// Aynı kuralın üçüncü uygulaması: TÜRETİLEBİLEN VEYA VARSAYILAN OLAN KAYDEDİLMEZ.
// Aktör nesnesinin altı alanının dördü türetiliyor:
//   `id`   → zaten nesnenin anahtarı
//   `ad`   → ILLER[kod].ad
//   `renk` → AKTOR_RENKLERI[kod] (oyun boyunca sabit, `oyunDurumu.js`'te bir kez hesaplanır)
//   `tur`  → kod === oyuncuAktorId ? 'insan' : 'yapayZeka'
// Gerçek durum yalnızca `nufusHavuzu` ve `ekonomiHavuzu`.
//
// ÖLÇÜLDÜ (`veri/kayit-boyut-olcum.md`): `aktorler` alanı 8.0 KB'dı, 3.2 KB'a iniyor —
// kayıttan 4.8 KB düşüyor. Bu, Görev 09'un ekleyeceği diplomasi + mod alanlarının
// toplamından fazla; yani yeni sistemin yeri, eskinin gereksiz yazdığı yerden çıkıyor.
//
// ⚠ `tur` ALANI SICAK KOLTUKTA TÜRETİLEMEZ HALE GELİR (Görev 10). İki insan oyuncu
// olduğunda "oyuncu = tek kimlik" varsayımı düşer ve alan yeniden kayda girmeli.
// Görev 10 sıcak koltuğu yazarken buraya bakmalı.
export function kayitMetni(durum) {
  const aktorler = {};
  for (const id of Object.keys(durum.aktorler)) {
    const { nufusHavuzu, ekonomiHavuzu } = durum.aktorler[id];
    aktorler[id] = { nufusHavuzu, ekonomiHavuzu };
  }

  const ordular = {};
  for (const pid of Object.keys(durum.ordular || {})) {
    const { sahip, ...kalan } = durum.ordular[pid];
    // Ayrışma olursa alan YİNE yazılır: sessizce yanlış yüklemektense birkaç byte fazla.
    ordular[pid] = sahip === durum.parcaSahipligi[pid] ? kalan : durum.ordular[pid];
  }
  // `kisilikler` SİLİNMİYOR, null'a çevriliyor — tur raporundaki kuralın aynısı: silinse
  // anahtar sırası değişir ve "kaydedilip yüklenen oyun birebir aynı" testi metin
  // karşılaştırmasında tutmaz. İçeriği gitmiş olduğu için tasarruf da korunuyor.
  // KOMUTANLAR (Görev 16 / Adım 4) süzülerek yazılıyor: ne sahada ne cezada olan kayıt
  // dosyaya girmiyor (`kadro` / `hamle` alanlarındaki kuralın aynısı).
  // TUR GÜNLÜĞÜ (Görev 15) kayda GİRMEZ: tek turluk döküm, `sonTurRaporu` ile aynı gerekçe.
  return JSON.stringify({
    ...durum,
    aktorler,
    ordular,
    kisilikler: null,
    sonTurRaporu: null,
    turGunlugu: [],
    komutanlar: kayitKomutanlari(durum.komutanlar) || {},
  });
}

// Kayıt metnini oyun durumuna çevirir.
// Dönen: { ok: true, durum } veya { ok: false, hata: 'okunabilir mesaj' }
export function metinCoz(metin) {
  if (typeof metin !== 'string' || metin.length === 0) return { ok: false, hata: 'Kayıt boş.' };

  let veri;
  try {
    veri = JSON.parse(metin);
  } catch (e) {
    return { ok: false, hata: 'Kayıt dosyası bozuk (okunamadı).' };
  }

  // Sürüm kontrolü: ileride yapı değişirse eski kayıtlar burada çevrilecek.
  if (typeof veri.surum !== 'number') return { ok: false, hata: 'Kayıtta sürüm bilgisi yok.' };
  if (veri.surum > KAYIT_SURUMU)
    return {
      ok: false,
      hata: 'Bu kayıt oyunun daha yeni bir sürümünden (' + veri.surum + '). Açılamaz.',
    };
  // Eski sürümler çevrilmiyor, açıkça reddediliyor. Sebepleri:
  //   1–2 → parçalar birleşti, kimlikler değişti (Görev 03B); silinen parçaların
  //         sahipliğinin nereye gideceği belirsiz.
  //   3   → orduların olmadığı sürüm (Görev 04 öncesi); yüklenirse oyuncu ordusuz bir
  //         oyuna düşer ve neden asker basamadığını anlamaz.
  //   4   → hareketin olmadığı sürüm (Görev 05 öncesi). Harita ve ordular aynı ama emir
  //         kuyruğu ve kuruluş garnizonları yok: oyuncu kimsenin savunmadığı bir haritada
  //         yürür, muharebeyi hiç göremez. Ret sebebi ayrı yazılıyor çünkü kayıt "çalışıyor
  //         gibi" görünür — asıl tehlike de bu.
  //   5   → toplanma ve araştırmanın olmadığı sürüm (Görev 06 öncesi). Aynı tehlike bir
  //         kademe daha sinsi: oyun tamamen çalışıyor görünür ama hiçbir ordu toplanamaz
  //         (kadro alanı yok, hepsi "eksiksiz" sayılır) ve araştırma bomboş açılır.
  // Sessizce bozuk yüklemektense açıkça reddetmek daha dürüst.
  const ESKI_SEBEP = {
    // 11 → maç sayaçlarından önce kaydedilmiş. Yüklenirse oyun ÇALIŞIR ama o maçta ne
    // olduğu bilinmez: istatistik boş çıkar, kazanılması gereken mühürler kazanılmaz.
    11:
      'Bu kayıt oyunun eski bir sürümünden (11): maç istatistikleri ve başarımlar gelmeden ' +
      'önce kaydedilmiş. Yüklenirse o maçta kazandıkların sayılmaz. Yeni oyun başlatmalısın.',
    // 10 → karakterlerden önce kaydedilmiş. Kişilik kayda girmiyor, yüklerken yeniden
    // türetiliyor ve türetim artık aktör başına fazladan bir sayı çekiyor. Yüklenirse oyun
    // ÇALIŞIR ama bütün rakiplerin huyu değişir — hiçbir yerde hata görünmez, oyuncu
    // yalnızca "komşum neden birden saldırdı" diye şaşırır.
    10:
      'Bu kayıt oyunun eski bir sürümünden (10): illerin karakterleri (Saldırgan · ' +
      'Dengeli · Çekimser) gelmeden önce kaydedilmiş. Yüklenirse bütün rakiplerin huyu ' +
      'değişir ve maçın geri kalanı bambaşka ilerler. Yeni oyun başlatmalısın.',
    9:
      'Bu kayıt oyunun eski bir sürümünden (9): savaş ilanından önce kaydedilmiş. ' +
      'Yeni kuralda saldırmak için önce savaş ilan etmek gerekiyor; eski kaydın ' +
      'ilişkileri buna göre yazılmadığı için ordularını kullanamazsın. ' +
      'Yeni oyun başlatmalısın.',
    4:
      'Bu kayıt oyunun eski bir sürümünden (4): muharebeden önce kaydedilmiş, ' +
      'karşı tarafın garnizonları yok ve ordular hareket edemez. Yeni oyun başlatmalısın.',
    5:
      'Bu kayıt oyunun eski bir sürümünden (5): toplanma ve araştırmadan önce kaydedilmiş. ' +
      'Yıpranmış ordularını dolduramaz, araştırma yapamazsın. Yeni oyun başlatmalısın.',
    // 6 → yapay zekâdan önce kaydedilmiş. İki ayrı sebep, ikisi de sinsi: dünya duruyordu
    // (kayıtta kimsenin kişiliği yok, 80 aktör hareketsiz kalır ve oyuncu oyunun
    // bozulduğunu sanır) ve araştırma kaydı birim başına ağaca geçti (eski anahtarlar
    // okunmaz, oyuncunun araştırması sessizce sıfır görünür).
    6:
      'Bu kayıt oyunun eski bir sürümünden (6): rakipler daha düşünmeye başlamamıştı. ' +
      'Yüklenirse dünya hareketsiz kalır ve araştırmaların kaybolur. Yeni oyun başlatmalısın.',
    // 7 → kutsal savaşlardan önce kaydedilmiş. Sinsiliği Görev 05'in dersiyle aynı: oyun
    // tamamen çalışıyor GÖRÜNÜR. Ama düello tetikleyicisi "iki hasım ilin İLK saldırısı"
    // ve o saldırı çoktan olmuştur; yani hasım iller bir daha asla kutsal savaşa girmez,
    // üçüncü taraf kısıtı hiç işlemez ve §11'in tamamı sessizce ölü kalır.
    7:
      'Bu kayıt oyunun eski bir sürümünden (7): kutsal savaşlardan önce kaydedilmiş. ' +
      'Hasım illerin arasındaki düellolar bir daha tetiklenmez. Yeni oyun başlatmalısın.',
    // 8 → mod sisteminden önce kaydedilmiş. Ret sebebi diplomasi DEĞİL (onun varsayılanı
    // var: tarafsız), MOD. Modu olmayan kayıtta kazanma koşulu tanımsız kalır ve maç hiç
    // bitmez — oyun çalışıyor görünür, sadece kazanılamaz.
    8:
      'Bu kayıt oyunun eski bir sürümünden (8): mod sisteminden önce kaydedilmiş. ' +
      'Hangi koşulla kazanacağın yazmıyor, yani maç hiç bitmez. Yeni oyun başlatmalısın.',
  };
  if (veri.surum < KAYIT_SURUMU)
    return {
      ok: false,
      hata:
        ESKI_SEBEP[veri.surum] ||
        'Bu kayıt oyunun eski bir sürümünden (' + veri.surum + '). Yeni oyun başlatmalısın.',
    };

  const eksik = eksikAlan(veri);
  if (eksik) return { ok: false, hata: 'Kayıt eksik: ' + eksik };

  // Tur raporu kayda hiç girmiyor (yukarıdaki nota bak); alan yine de HER ZAMAN yerinde
  // olsun ki durumun biçimi kaydedilmiş ile yüklenmiş arasında değişmesin.
  //
  // KİŞİLİKLER BURADA YENİDEN ÜRETİLİYOR — tohum, aktör listesi ve zorluk kayıtta olduğu
  // için sonuç birebir aynı çıkar (üretim belirlenimci, bkz. `kisilik.js`).
  const zorluk = DENGE.ZEKA.ZORLUK[veri.zorluk] ? veri.zorluk : DENGE.ZEKA.VARSAYILAN_ZORLUK;

  // Orduların `sahip` alanı kayda girmiyor (yukarıdaki nota bak); parçanın sahibinden
  // geri konuyor. Kayıtta yazılıysa (ayrışma durumu) o değer korunuyor.
  // `sahip` BAŞA konuyor: kaydedilen nesnede de ilk alandı, anahtar sırası korunsun.
  const ordular = {};
  for (const pid of Object.keys(veri.ordular || {})) {
    const o = veri.ordular[pid];
    ordular[pid] = o.sahip ? o : { sahip: veri.parcaSahipligi[pid], ...o };
  }

  // Aktörün türetilen dört alanı geri konuyor (yukarıdaki nota bak). ALAN SIRASI
  // `oyunDurumu.js oyunKur`'daki sırayla BİREBİR aynı: kaydedilip yüklenen oyunun metin
  // karşılaştırmasında tutması buna bağlı. Kayıtta yazılıysa (eski kayıt) o değer korunuyor
  // — orduların `sahip` alanındaki kalıbın aynısı.
  const aktorler = {};
  for (const id of Object.keys(veri.aktorler)) {
    const a = veri.aktorler[id];
    aktorler[id] = {
      id: a.id || id,
      ad: a.ad || (ILLER[id] ? ILLER[id].ad : id),
      renk: a.renk || AKTOR_RENKLERI[id],
      nufusHavuzu: a.nufusHavuzu,
      ekonomiHavuzu: a.ekonomiHavuzu,
      tur: a.tur || (id === veri.oyuncuAktorId ? 'insan' : 'yapayZeka'),
    };
  }

  return {
    ok: true,
    durum: {
      ...veri,
      aktorler,
      ordular,
      zorluk,
      kisilikler: kisilikUret(veri.rastgele.tohum, Object.keys(veri.aktorler), zorluk),
      sonTurRaporu: null,
      turGunlugu: [],
      // Eski kayıtta komutan alanı yoksa boş başlar — komutan bir maç içi durum, kayıt
      // biçiminin zorunlu parçası değil.
      komutanlar: veri.komutanlar && typeof veri.komutanlar === 'object' ? veri.komutanlar : {},
    },
  };
}

// Kaydın beklenen alanları yerinde mi? (Bozuk kayıt oyunu çökertmesin.)
function eksikAlan(v) {
  if (typeof v.tur !== 'number') return 'tur';
  if (!v.senaryo || !Array.isArray(v.senaryo.kapsamIller)) return 'senaryo.kapsamIller';
  if (!Array.isArray(v.senaryo.kapsamParcalar)) return 'senaryo.kapsamParcalar';
  if (!v.rastgele || typeof v.rastgele.tohum !== 'number') return 'rastgele.tohum';
  if (typeof v.rastgele.durum !== 'number') return 'rastgele.durum';
  if (!v.aktorler || Object.keys(v.aktorler).length === 0) return 'aktörler';
  if (!v.parcaSahipligi || Object.keys(v.parcaSahipligi).length === 0) return 'parça sahipliği';
  if (!v.aktorler[v.oyuncuAktorId]) return 'oyuncu aktörü';
  if (!Array.isArray(v.turGecmisi)) return 'tur geçmişi';
  // Ordular (Görev 04). BOŞ OLABİLİR — oyun başında hiç ordu yok, o yüzden yalnızca
  // "nesne mi" diye bakılır; parçaSahipligi gibi "dolu mu" kontrolü YAPILMAZ.
  if (!v.ordular || typeof v.ordular !== 'object' || Array.isArray(v.ordular)) return 'ordular';
  if (!v.buTurUretim || typeof v.buTurUretim !== 'object' || Array.isArray(v.buTurUretim))
    return 'bu tur üretimi';
  // Araştırma (Görev 06). Ordular gibi BOŞ OLABİLİR — oyun başında kimse araştırma
  // yapmamıştır, kayıt yalnızca araştırması olan aktörler için tutulur.
  if (!v.arastirma || typeof v.arastirma !== 'object' || Array.isArray(v.arastirma))
    return 'araştırma';
  // Emir kuyruğu (Görev 05). BOŞ OLABİLİR — tur sonunda zaten boşalıyor; yalnızca "dizi mi"
  // diye bakılır. İçerik de sınanır: bozuk bir emir tur bitince çözüme girip çökertirdi.
  // Kutsal savaşlar (Görev 08). Ordular gibi BOŞ OLABİLİR — hiç düello başlamamış olabilir;
  // yalnızca "dizi mi" diye bakılıyor. İçerik de sınanıyor: bozuk bir kayıt tur sonunda
  // `duellolariGuncelle`'ye girip çökertirdi.
  if (!Array.isArray(v.duellolar)) return 'düellolar';
  for (const d of v.duellolar)
    if (!d || typeof d.a !== 'string' || typeof d.b !== 'string' || typeof d.tur !== 'number')
      return 'düello kaydı (a/b/tur)';
  // Diplomasi (Görev 09). Ordular gibi BOŞ OLABİLİR — oyun başında herkes tarafsız ve
  // varsayılan ilişkiler hiç yazılmıyor (§7). İçerik de sınanıyor: bozuk bir ilişki satırı
  // tur sonunda `iliskileriGuncelle`ye girip çökertirdi. `son` alanı yalnızca savaşta var,
  // o yüzden aranmıyor.
  if (!v.iliskiler || typeof v.iliskiler !== 'object' || Array.isArray(v.iliskiler))
    return 'ilişkiler';
  for (const k of Object.keys(v.iliskiler)) {
    const i = v.iliskiler[k];
    if (!i || (i.tip !== 'ittifak' && i.tip !== 'savas') || typeof i.turdan !== 'number')
      return 'ilişki kaydı (tip/turdan)';
  }
  if (!v.ihanetler || typeof v.ihanetler !== 'object' || Array.isArray(v.ihanetler))
    return 'ihanetler';
  // Bekleyen teklifler turluktur ama kayda girer: oyuncu tam teklif kartı ekrandayken
  // kaydedip çıkabilir ve döndüğünde kartı bulmalı.
  if (!Array.isArray(v.teklifler)) return 'teklifler';
  // Mod (Görev 09). BOŞ OLAMAZ — kazanma koşulunun türetilebilir bir varsayılanı yok.
  if (!v.mod || typeof v.mod.tip !== 'string' || typeof v.mod.kapsam !== 'string') return 'mod';
  for (const t of v.teklifler)
    if (!t || typeof t.kimden !== 'string' || typeof t.tip !== 'string')
      return 'teklif kaydı (kimden/tip)';
  if (!Array.isArray(v.emirler)) return 'emirler';
  for (const e of v.emirler)
    if (!e || typeof e.kaynak !== 'string' || typeof e.hedef !== 'string' || !e.birimler)
      return 'emir kaydı (kaynak/hedef/birimler)';
  return null;
}
