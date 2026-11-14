// DİPLOMASİ — ÜÇ İLİŞKİ DURUMU (Görev 09 / Adım 1 · tasarım §10 · Görev 11 revizyonu).
//
// ┌─ BAKİ'NİN KARARLARI ────────────────────────────────────────────────────────────────┐
// │ 2026-08-01 · Soru 2 → **A**: diplomasi yalnızca "tanıdıklarınla".                    │
// │ 2026-08-03 · Soru 1'in A cevabı DEĞİŞTİ: artık SAVAŞ İLANI VAR. *"Herkes ilk başta  │
// │ barış içinde olsun, daha sonra savaşlar açılsın."*                                   │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
//   BARIŞ  (varsayılan; kayıtta eski adıyla 'tarafsiz') → SALDIRAMAZSIN — önce ilan
//   İTTİFAK                 → saldıramazsın; bozmanın bedeli var
//   SAVAŞ HALİNDE           → saldırabilirsin; ateşkesle biter; zekâ öncelik verir
//
// ---- SALDIRI ARTIK İLAN DEĞİL, İLANIN SONUCU (Görev 11) ----
//
// Görev 09'un "saldırının kendisi ilandır" kuralı kalktı: `hareket.js` barıştaki tarafa
// verilen saldırı emrini KAPIDA reddediyor. Savaş `savasIlanEt` ile açılıyor — ilan
// anında ittifak zinciri de yayılıyor (§10/3 aynen işliyor). `savasBasla` duruyor ama
// işi artık yalnızca süren savaşın SON TEMAS turunu tazelemek.
//
// `TARAFSIZ` sabitinin ADI kayıt uyumu için korunuyor (eski kayıtlarda 'tarafsiz'
// satırı yok zaten — varsayılan hiç yazılmıyor); ekran bu durumu artık "barış" diye
// okuyor.
//
// ---- `rekabet.js`'İN KALIBI BİREBİR KULLANILIYOR ----
//
// İkisi de aynı problemin örneği: İKİ AKTÖR ARASINDA TURLARA YAYILAN BİR İLİŞKİ DURUMU.
// Anahtar üretimi, çift yönsüzlük, kayıtta yalnızca etkin olanları tutmak, tur sonunda
// süresi dolanları düşürmek — dördü de oradan geliyor. Yeni mimari icat edilmedi.
//
// ---- KAYITTA YALNIZCA VARSAYILAN OLMAYAN İLİŞKİLER DURUR (§7) ----
//
// 81 aktörün tam matrisi 3240 çift demek. Tarafsızlık VARSAYILAN olduğu için hiçbiri
// yazılmaz; yalnızca ittifak ve savaş satırı tutulur. Görev 06'nın `kadro` ve Görev 07'nin
// `sahip` kararlarıyla aynı kalıp: türetilebilen veya varsayılan olan kaydedilmez.

import { DENGE } from '../denge.js';
import { KOMSULUK, ILLER, PARCALAR } from './veri.js';
import { husumetBul, duelloBul } from './rekabet.js';
import { sayacArtir } from './sayac.js';

const D = DENGE.DIPLOMASI;

export const TARAFSIZ = 'tarafsiz';
export const ITTIFAK = 'ittifak';
export const SAVAS = 'savas';

// Çift YÖNSÜZ ve anahtar SIRALI üretiliyor — `rekabet.js`'teki kuralın aynısı.
// Simetri böylece TANIM GEREĞİ garanti: "ben onunla ittifaktayım ama o benimle değil"
// diye bir durum yazılamaz bile (§5.1). Tasarımda öyle bir şey yok ve arayüzde
// anlatılamazdı.
export const anahtar = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

export function iliskiler(durum) {
  return durum.iliskiler || {};
}

export function ihanetler(durum) {
  return durum.ihanetler || {};
}

// ---- OKUMA ----

// İki aktörün ilişkisi. Kayıtta satırı yoksa TARAFSIZ — varsayılan hiç yazılmıyor.
export function iliskiDurumu(durum, a, b) {
  if (!D.ACIK || !a || !b || a === b) return TARAFSIZ;
  const k = iliskiler(durum)[anahtar(a, b)];
  return k ? k.tip : TARAFSIZ;
}

export function ittifakMi(durum, a, b) {
  return iliskiDurumu(durum, a, b) === ITTIFAK;
}

export function savastaMi(durum, a, b) {
  return iliskiDurumu(durum, a, b) === SAVAS;
}

// Bu aktörün belirli tipteki ilişkileri — karşı tarafın kimlikleri.
export function iliskililer(durum, aktorId, tip) {
  const cikti = [];
  const tablo = iliskiler(durum);
  for (const k of Object.keys(tablo)) {
    if (tablo[k].tip !== tip) continue;
    const [a, b] = k.split('|');
    if (a === aktorId) cikti.push(b);
    else if (b === aktorId) cikti.push(a);
  }
  return cikti.sort();
}

export function muttefikler(durum, aktorId) {
  return iliskililer(durum, aktorId, ITTIFAK);
}

export function dusmanlar(durum, aktorId) {
  return iliskililer(durum, aktorId, SAVAS);
}

// BAŞKA BİR AKTÖRLE SAVAŞTA MI? `DENGE.REKABET.GIRIS_SARTI` bunu okuyor: Baki'nin
// düello giriş şartı ("başka illerle savaşta olmamalı") tam olarak bu soru.
// `haric` verilirse o aktörle olan savaş sayılmaz — düellonun kendi karşı tarafı.
export function baskasiylaSavastaMi(durum, aktorId, haric) {
  return dusmanlar(durum, aktorId).some((x) => x !== haric);
}

// İhanet bedeli sürüyor mu? (§5.3 — teklif veremez, teklif alamaz.)
export function ihanetliMi(durum, aktorId) {
  const bitis = ihanetler(durum)[aktorId];
  return typeof bitis === 'number' && durum.tur < bitis;
}

export function ihanetKalanTur(durum, aktorId) {
  const bitis = ihanetler(durum)[aktorId];
  return typeof bitis === 'number' && durum.tur < bitis ? bitis - durum.tur : 0;
}

// ---- "TANIDIKLARIN" SÜZGECİ (Soru 2/A) ----
//
// 80 aktörle teklif alışverişi bir liste ekranı değil, bir kâbus. Süzgeç BAŞTAN konuyor,
// sonradan kısaltılmaya çalışılmıyor (§10/9): liste doğal olarak 3–10 satırda kalıyor ve
// oyun ilerledikçe büyüyor.
//
// Üç yoldan biriyle tanınıyorsun: SINIRDAŞSIN · ARANIZDA BİR İLİŞKİ VAR · BÜYÜKSÜN.
// Üçüncüsü §10/2'yi ("uzaktaki illerle ittifak kurulabilir") mümkün kılan madde —
// olmasaydı diplomasinin coğrafya oyunu kısmı düşerdi.
// ---- ⚠ İKİ AYRI SORU, TEK FONKSİYON (Görev 12) ----
//
// 1. "KİMİNLE KONUŞABİLİRİM" (kapı) — oyuncunun listesi ve teklif geçerliliği. Bölge
//    kuralı BURADA geçerli: aynı bölgede toprağın varsa masaya oturabilirsin.
// 2. "ZEKÂ KİME TEKLİF GÖTÜRÜR" (iştah) — yapay zekânın kendi aday taraması. Bölge kuralı
//    burada KAPALI ve sebebi ölçülmüş: açık bırakıldığında aday havuzu üçe katlanıyor,
//    zor kademede canlı 21 aktörün 13'ü tek bloğa giriyor ve harita donuyor. Bu, Görev
//    09'un üç kök sebeple çözdüğü DOYGUNLUK sorununun geri gelmesi demek.
//
// İKİSİ AYNI KAPIDAN GEÇİYOR, farklı olan İŞTAH: oyuncu bölgedeşine teklif GÖTÜREBİLİR,
// zekâ da gelen teklifi aynı formülle değerlendirir — yalnızca kendisi uzak bölgedeşini
// arayıp teklif götürmez. "Aynı kural, farklı girişkenlik" (§10/4 bozulmuyor: kural tek).
export function tanidiklar(durum, aktorId, secenek) {
  if (!D.ACIK || !durum.aktorler[aktorId]) return [];
  const T = D.TANIDIK;
  const bolgeAcik = T.BOLGE && !(secenek && secenek.bolgesiz);

  // Tek geçişte: kimin kaç parçası var, benim parçalarım kimlere sınırdaş ve HANGİ
  // BÖLGELERDE toprağım var (Görev 12 — Baki'nin bölge kuralı).
  const parcaSayisi = {};
  const sinirdas = new Set();
  const benimBolgelerim = new Set();
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    const sahip = durum.parcaSahipligi[pid];
    parcaSayisi[sahip] = (parcaSayisi[sahip] || 0) + 1;
    if (sahip !== aktorId) continue;
    const il = ILLER[PARCALAR[pid].kod];
    if (il) benimBolgelerim.add(il.bolge);
    for (const k of KOMSULUK[pid] || []) {
      const komsuSahip = durum.parcaSahipligi[k];
      if (komsuSahip && komsuSahip !== aktorId) sinirdas.add(komsuSahip);
    }
  }

  // İKİNCİ GEÇİŞ: benim bölgelerimde toprağı olan aktörler. Ölçü "ilin kendi bölgesi"
  // DEĞİL, "nerede toprağı var" — Marmaralı bir devlet Karadeniz'e yayıldıysa orada
  // seninle komşu olmasa bile artık aynı bölgeyi paylaşıyorsunuz.
  const bolgedes = new Set();
  if (bolgeAcik && benimBolgelerim.size > 0) {
    for (const pid of Object.keys(durum.parcaSahipligi)) {
      const sahip = durum.parcaSahipligi[pid];
      if (!sahip || sahip === aktorId || bolgedes.has(sahip)) continue;
      const il = ILLER[PARCALAR[pid].kod];
      if (il && benimBolgelerim.has(il.bolge)) bolgedes.add(sahip);
    }
  }

  const cikti = [];
  for (const id of Object.keys(durum.aktorler)) {
    if (id === aktorId) continue;
    // ELENMİŞ AKTÖR TANIDIK DEĞİLDİR. Elinde hiç parça kalmamış bir ille diplomasi
    // yapmak anlamsız; "yaşıyor mu" ölçüsü `rekabet.js`'teki ile aynı: parçası var mı.
    if (!parcaSayisi[id]) continue;
    // SIRA ÖNEMLİ: en yakın ilişki kazanır. Sınırdaşın aynı zamanda bölgedeşinse satırda
    // "sınırdaş" yazar — kararı en çok değiştiren bilgi o.
    const nasil =
      T.SINIRDAS && sinirdas.has(id)
        ? 'sinirdas'
        : T.SAVASTIGIM && iliskiDurumu(durum, aktorId, id) !== TARAFSIZ
          ? 'iliski'
          : bolgedes.has(id)
            ? 'bolge'
            : parcaSayisi[id] >= T.BUYUKLUK_ESIGI
              ? 'buyuk'
              : null;
    if (nasil) cikti.push({ id, nasil, parca: parcaSayisi[id] });
  }
  // Sıra BELİRLENİMCİ olmalı: aynı tohum aynı diplomasiyi vermeli (Adım 2'nin şartı) ve
  // ekranda satırlar her açılışta yer değiştirmemeli.
  //
  // ÖNCE YAKINLIK, SONRA BÜYÜKLÜK: sınırdaşın ve ilişkili olduğun herkes her zaman listede
  // — onlar oyunun O ANKİ meselesi. "Adı duyulmuş" uzak devletler kalan yeri büyükten
  // küçüğe dolduruyor. Kapak (`EN_COK`) yalnızca sonuncu grubu kesiyor, yani kesilen şey
  // her zaman en az ilgili olan.
  // Yakınlık sırası: sınırdaş/ilişkili → bölgedeş → adı duyulmuş. Kapak (`EN_COK`) hep
  // sondan keser, yani kesilen şey her zaman en az ilgili olan.
  const ONCELIK = { sinirdas: 0, iliski: 0, bolge: 1, buyuk: 2 };
  const oncelik = (t) => (ONCELIK[t.nasil] === undefined ? 3 : ONCELIK[t.nasil]);
  cikti.sort((x, y) => oncelik(x) - oncelik(y) || y.parca - x.parca || (x.id < y.id ? -1 : 1));
  // Kapak da ikiye ayrılıyor: oyuncunun listesi uzun olabilir (kaydırmalı, süzgeçli),
  // zekânın havuzu Görev 09'un ölçtüğü boyutta kalır.
  return cikti.slice(0, bolgeAcik ? T.EN_COK_EKRAN || T.EN_COK : T.EN_COK);
}

export function tanidikMi(durum, aktorId, hedefId) {
  return tanidiklar(durum, aktorId).some((t) => t.id === hedefId);
}

// ---- KABUL EŞİĞİ — TURA BAĞLI (2026-08-08) ----
//
// Erken turlarda eşik düşük, sonra normale dönüyor. Gerekçesi `denge.js`'te: maçın
// başında kimsenin düşmanı olmadığı için ittifak puanının en büyük terimi (ortak düşman)
// sıfır kalıyor ve hiçbir teklif eşiği aşamıyordu.
//
// TEK KAYNAK: hem zekânın teklif verme kararı hem gelen teklifi kabul kararı buradan
// geçiyor. İki yerde iki eşik olsaydı "teklif ettiği ama aynısını kabul etmediği" bir
// zekâ doğardı — Görev 09'un tek eşik kuralının aynısı.
export function ittifakEsigi(durum) {
  const F = D.FAYDA;
  const erken = F.ERKEN_TUR || 0;
  if (!erken || durum.tur > erken) return F.ESIK;
  return F.ESIK - (F.ERKEN_INDIRIM || 0);
}

// ---- ⚠ MASADAKİ TEKLİFE EVET DEMEK, GİDİP TEKLİF ETMEKTEN UCUZDUR (2026-08-12) ----
//
// > Baki: *"Oyuncu istek attığında da genelde reddediyorlar, bu düzeltilmeli."*
//
// Ölçüm sorunu net gösterdi: oyuncu 19 geçerli hedefe teklif verse **0–1 tanesi** kabul
// ediyordu. İlk denenen çare (`FAYDA.TEMEL`, temel yakınlık) çürüdü — zor kademede terim
// `temkin` ile çarpıldığı için ölü kalıyor, orta kademede ise doygunluk çizgisini aşıyor.
//
// ASIL SORUN, TEK EŞİĞİN İKİ AYRI SORUYU CEVAPLAMASIYDI:
//   "Kendi diplomasi sıramı harcayıp buna teklif eder miyim?"  ← pahalı karar
//   "Önüme gelmiş teklife evet der miyim?"                      ← ucuz karar
// İkincisinde sıra harcanmıyor, fırsat maliyeti yok, karşı taraf zaten istekli olduğunu
// göstermiş. Aynı eşiği kullanmak, bu farkı yok saymaktı.
//
// ⚠ BU OYUNCUYA KAYIRMA DEĞİLDİR ve olmaması şart (§9/tuzak 5: "oyuncu aldatıldığını
// hissederse haklıdır"). Kural TARAFSIZ: yapay zekâlar birbirinin teklifini de bu daha
// düşük eşikle değerlendiriyor. Oyuncunun kazancı bir ayrıcalıktan değil, oyuncunun
// TEKLİF EDEN taraf olmasından geliyor — teklif eden kim olursa olsun aynı avantajı alır.
export function kabulEsigi(durum) {
  const F = D.FAYDA;
  return ittifakEsigi(durum) * (1 - (F.KABUL_INDIRIMI || 0));
}

// ---- İTTİFAKIN GÜÇ TAVANI (2026-08-08, Baki: "ittifaklara bir güç kısıtı koyulsun") ----
//
// İki tarafın parça toplamı haritanın GUC_KISITI.ORAN payını aşıyorsa ittifak kurulamaz.
// Ölçü `durum.parcaSahipligi`'nden geliyor, yani KAPSAMDAKİ parçalar: bölge maçında 22
// parçanın %40'ı, Türkiye maçında 181'in %40'ı. Kapsam büyüklüğünü ayrıca sormaya gerek
// yok, tablo zaten kapsam kadar.
//
// Dönen: { asiyor, benim, onun, toplam, tavan } — ret cümlesi sayıları yazabilsin diye.
export function ittifakGucu(durum, a, b) {
  const K = D.GUC_KISITI || {};
  const toplam = Object.keys(durum.parcaSahipligi || {}).length;
  let benim = 0,
    onun = 0;
  for (const sahip of Object.values(durum.parcaSahipligi || {})) {
    if (sahip === a) benim++;
    else if (sahip === b) onun++;
  }
  const tavan = Math.floor(toplam * (K.ORAN || 1));
  return { asiyor: !!K.ACIK && toplam > 0 && benim + onun > tavan, benim, onun, toplam, tavan };
}

// ---- TEKLİF GEÇERLİLİĞİ ----
//
// TEK KAYNAK KURALI: arayüzün "bu düğme etkin mi" kontrolü ile motorun kontrolü aynı
// fonksiyondan gelir — `hareket.js hareketGecerliMi`'nin kalıbı. Ret sebebi oyuncuya
// gösterilebilecek düz bir cümle; §10'un "görünmeyen kural yoktur" ilkesi.
//
// Dönen: { ok: true } veya { ok: false, kod, sebep }
export function teklifGecerliMi(durum, kaynak, hedef, tip) {
  if (!D.ACIK) return { ok: false, kod: 'kapali', sebep: 'Diplomasi bu oyunda kapalı.' };
  if (!durum.aktorler[kaynak] || !durum.aktorler[hedef] || kaynak === hedef)
    return { ok: false, kod: 'aktor', sebep: 'Böyle bir devlet yok.' };

  if (ihanetliMi(durum, kaynak))
    return {
      ok: false,
      kod: 'ihanet',
      sebep:
        'Sözünden döndüğün için kimse seninle masaya oturmuyor. ' +
        ihanetKalanTur(durum, kaynak) +
        ' tur daha bekleyeceksin.',
    };
  // İhanet İKİ YÖNLÜ kesiyor: teklif veremez, teklif ALAMAZ (§5.3).
  if (ihanetliMi(durum, hedef))
    return {
      ok: false,
      kod: 'ihanet',
      sebep: 'Sözünden döndüğü için kimse onunla masaya oturmuyor.',
    };

  if (!tanidikMi(durum, kaynak, hedef))
    return {
      ok: false,
      kod: 'tanimiyor',
      sebep: 'Onu henüz tanımıyorsun. Sınırın oraya ulaşmalı ya da adı duyulmalı.',
    };

  const mevcut = iliskiDurumu(durum, kaynak, hedef);

  if (tip === ITTIFAK) {
    if (mevcut === ITTIFAK) return { ok: false, kod: 'zaten', sebep: 'Zaten müttefiksiniz.' };
    // ---- HASIMLA İTTİFAK KURULAMAZ (§6/2) ----
    // Husumet ağırlığı Adım 2'nin fayda formülünde de var; burada KURAL olarak duruyor.
    // İkisi birden bilinçli: formül bir TERCİH, bu bir KAPI. Tercih yanlış ayarlanırsa
    // (katsayı küçük kalırsa) kapı yine tutar.
    if (husumetBul(kaynak, hedef))
      return {
        ok: false,
        kod: 'husumet',
        sebep: 'Bu iki ilin arası tarihten beri açık. Anlaşma masası kurulmaz.',
      };
    if (muttefikler(durum, kaynak).length >= D.EN_COK_ITTIFAK)
      return {
        ok: false,
        kod: 'dolu',
        sebep: 'Elin dolu — en fazla ' + D.EN_COK_ITTIFAK + ' devletle aynı anda anlaşabilirsin.',
      };
    if (muttefikler(durum, hedef).length >= D.EN_COK_ITTIFAK)
      return { ok: false, kod: 'dolu', sebep: 'Onun eli dolu; başka anlaşma yapamaz.' };
    // ---- GÜÇ TAVANI (2026-08-08) ----
    // İki dev birleşip haritayı paylaşamaz. Kapı oyuncuya da zekâya da aynı işliyor.
    const g = ittifakGucu(durum, kaynak, hedef);
    if (g.asiyor)
      return {
        ok: false,
        kod: 'guc',
        sebep:
          'İkiniz birden haritanın çok büyük bir kısmını tutuyorsunuz (' +
          (g.benim + g.onun) +
          ' / ' +
          g.toplam +
          ' bölge). Böyle bir anlaşmaya kimse razı olmaz.',
      };
    return { ok: true };
  }

  if (tip === 'ateskes') {
    if (mevcut !== SAVAS)
      return { ok: false, kod: 'savasyok', sebep: 'Onunla zaten savaşta değilsin.' };
    // ---- DÜELLO ÜSTÜNDÜR (§6/6) ----
    // §11: "düello kutsaldır, bölünmez." Kutsal savaş sürerken o çift ateşkes yapamaz.
    // Sıralamanın önemi var: iki sistem çakıştığında hangisinin kazandığı TEK YERDE
    // yazılı olmalı, yoksa `rekabet.js` ile burası birbirini sessizce iptal ederdi.
    if (duelloBul(durum, kaynak, hedef))
      return {
        ok: false,
        kod: 'duello',
        sebep: 'Bu kavganın kendi hesabı var. Bitmeden masaya oturulmaz.',
      };
    return { ok: true };
  }

  return { ok: false, kod: 'tip', sebep: 'Bilinmeyen teklif.' };
}

// ---- İLİŞKİ YAZMA ----
// Hepsi YENİ durum döndürür, geleni değiştirmez (projenin değişmezi).

function iliskiYaz(durum, a, b, kayit) {
  const yeni = { ...iliskiler(durum) };
  if (kayit === null) delete yeni[anahtar(a, b)];
  else yeni[anahtar(a, b)] = kayit;
  return { ...durum, iliskiler: yeni };
}

// ---- TEKLİF UYGULA ----
//
// Dönen: { ok, durum, olay } — `olay` sahne ve tur raporu için (§Adım 4/d).
export function teklifUygula(durum, kaynak, hedef, tip) {
  const gecerli = teklifGecerliMi(durum, kaynak, hedef, tip);
  if (!gecerli.ok) return { ok: false, kod: gecerli.kod, sebep: gecerli.sebep, durum, olay: null };

  // ---- SAYAÇ (Görev 12) ----
  // YALNIZCA OYUNCUNUN eylemleri sayılıyor: mühürler ve maç istatistiği oyuncuya ait,
  // 81 aktörün diplomasi sayacını tutmak kaydı boşuna şişirirdi.
  const benim = kaynak === durum.oyuncuAktorId || hedef === durum.oyuncuAktorId;

  if (tip === ITTIFAK) {
    const d = iliskiYaz(durum, kaynak, hedef, { tip: ITTIFAK, turdan: durum.tur });
    return {
      ok: true,
      durum: benim ? sayacArtir(d, 'anlasma') : d,
      olay: { tip: 'ittifakKuruldu', a: kaynak, b: hedef },
    };
  }
  // Ateşkes savaşı bitirir ve TARAFSIZA döndürür — satır siliniyor, çünkü tarafsızlık
  // varsayılan ve varsayılan kaydedilmez (§7).
  const d = iliskiYaz(durum, kaynak, hedef, null);
  return {
    ok: true,
    durum: benim ? sayacArtir(d, 'ateskes') : d,
    olay: { tip: 'ateskes', a: kaynak, b: hedef },
  };
}

// ---- SAVAŞ İLANI (Görev 11, Baki 2026-08-03) ----
//
// Savaş açmanın TEK kapısı. Geçerlilik ve uygulama ayrı — `teklifGecerliMi` /
// `teklifUygula` kalıbının aynısı: arayüzün "düğme etkin mi" sorusu ile motorun kararı
// aynı fonksiyondan geçer.
//
// İlan bir TEKLİF DEĞİL: karşı tarafın kabulü yok, anında işler. İhanet cezası ilanı
// ENGELLEMEZ — ihanet masaya oturmayı yasaklar, savaş açmak masaya oturmak değildir.
export function savasIlanGecerliMi(durum, ilanEden, hedef) {
  if (!D.ACIK || !D.ILAN || !D.ILAN.ACIK)
    return { ok: false, kod: 'kapali', sebep: 'Savaş ilanı bu oyunda kapalı.' };
  if (!durum.aktorler[ilanEden] || !durum.aktorler[hedef] || ilanEden === hedef)
    return { ok: false, kod: 'aktor', sebep: 'Böyle bir devlet yok.' };
  if (durum.tur <= D.ILAN.BARIS_TURU)
    return {
      ok: false,
      kod: 'erken',
      sebep:
        'Savaşlar ' + (D.ILAN.BARIS_TURU + 1) + '. turdan itibaren açılabilir. Şimdilik barış var.',
    };
  const mevcut = iliskiDurumu(durum, ilanEden, hedef);
  if (mevcut === SAVAS) return { ok: false, kod: 'zaten', sebep: 'Onunla zaten savaştasın.' };
  if (mevcut === ITTIFAK)
    return {
      ok: false,
      kod: 'ittifak',
      sebep: 'Onunla anlaşman var. Savaş istiyorsan önce anlaşmayı bozmalısın.',
    };
  return { ok: true };
}

// Dönen: { ok, durum, olaylar } — ilk olay 'savasIlani', ardından varsa zincir olayları.
export function savasIlanEt(durum, ilanEden, hedef) {
  const gecerli = savasIlanGecerliMi(durum, ilanEden, hedef);
  if (!gecerli.ok) return { ok: false, kod: gecerli.kod, sebep: gecerli.sebep, durum, olaylar: [] };

  let d = iliskiYaz(durum, ilanEden, hedef, { tip: SAVAS, turdan: durum.tur, son: durum.tur });
  const olaylar = [{ tip: 'savasIlani', a: ilanEden, b: hedef }];
  // İlan da zinciri yayar (§10/3): müttefikine savaş açan, müttefikleriyle de savaşa girer.
  const zincir = zincirYay(d, ilanEden, hedef);
  const sonrasi =
    ilanEden === durum.oyuncuAktorId ? sayacArtir(zincir.durum, 'ilan') : zincir.durum;
  return { ok: true, durum: sonrasi, olaylar: olaylar.concat(zincir.olaylar) };
}

// ---- SAVAŞ HALİ BAKIMI (eski adıyla "saldırı ilandır") ----
//
// `cozum.js` her saldırıda bunu çağırıyor — `duelloDene`'nin hemen yanında, aynı yerde.
// Görev 11'den beri asıl işi 2. madde:
//   1. Tarafsızsa savaş hali başlatır — normal akışta ARTIK OLMAZ (`hareket.js` barışta
//      saldırıyı kapıda kesiyor); emniyet kemeri olarak duruyor, ILAN kapatılırsa da
//      eski davranış buradan geri gelir.
//   2. Zaten savaştaysa SON TEMAS turunu tazeler — süren savaş kendiliğinden bitmesin.
//
// `son` alanı yalnızca savaş satırında var ve gerekli: `SAVAS_UST_SINIRI` "unutulmuş
// savaşlar birikmesin" diye konuldu (§6/5). Başlangıç turuna baksaydı, 20 turdur fiilen
// süren bir savaş da otomatik tarafsıza dönerdi — kuralın tam tersi.
//
// Dönen: { durum, olaylar } — zincir birden çok olay doğurabilir.
export function savasBasla(durum, saldiran, savunan) {
  if (!D.ACIK || !saldiran || !savunan || saldiran === savunan) return { durum, olaylar: [] };
  if (!durum.aktorler[saldiran] || !durum.aktorler[savunan]) return { durum, olaylar: [] };

  const olaylar = [];
  let d = durum;

  const mevcut = iliskiDurumu(d, saldiran, savunan);
  if (mevcut === ITTIFAK) {
    // ---- MÜTTEFİKİNE SALDIRMAK İHANETTİR (§5.3) ----
    // `hareket.js` bunu zaten kapıda engelliyor, yani normal oyunda buraya düşülmez.
    // Yine de yazılı: kural iki sistemin (hareket + çözüm) arasında kaybolmasın ve
    // ileride kapı gevşerse sessizce bedava ihanet doğmasın.
    d = ihanetIsle(d, saldiran);
    olaylar.push({ tip: 'ihanet', a: saldiran, b: savunan });
  } else if (mevcut === TARAFSIZ) {
    olaylar.push({ tip: 'savasBasladi', a: saldiran, b: savunan });
  }
  d = iliskiYaz(d, saldiran, savunan, {
    tip: SAVAS,
    turdan: mevcut === SAVAS ? iliskiler(d)[anahtar(saldiran, savunan)].turdan : d.tur,
    son: d.tur,
  });

  // ---- ZİNCİR (§10/3) ----
  const zincir = zincirYay(d, saldiran, savunan);
  return { durum: zincir.durum, olaylar: olaylar.concat(zincir.olaylar) };
}

// ---- ZİNCİR KURALI (§10/3) ----
//
// "İttifakına saldıran sana da savaş açmış sayılır." Diplomasinin en özgün maddesi ve
// **bedava geliyor**: komşuluk grafiği zaten saldırıyı fiilen engelliyor, yani uzaktaki
// düşmanla "savaş halinde ama savaşamıyor" durumu kendiliğinden doğru çalışıyor.
// Yapılacak tek şey durumu GÖSTERMEK (Adım 4/c).
//
// ⚠ ZİNCİR TEK ADIM YAYILIR ve bu bir düğme değil, bir uyarı. Müttefikimin müttefikinin
// düşmanı benim düşmanım DEĞİLDİR — aksi hâlde ilk savaşta harita ikiye bölünürdü.
// Kod bunu yapı olarak garanti ediyor: yalnızca `savunan`ın müttefikleri geziliyor,
// dönen satırlar için tekrar çağrılmıyor.
export function zincirYay(durum, saldiran, savunan) {
  if (!D.ACIK || D.ZINCIR_ADIMI < 1) return { durum, olaylar: [] };
  let d = durum;
  const olaylar = [];
  for (const dost of muttefikler(durum, savunan)) {
    if (dost === saldiran) continue;
    const mevcut = iliskiDurumu(d, saldiran, dost);
    // Zaten savaştaysa tazelenmez: zincir bir BAŞLATMA kuralı, savaşı besleyen bir şey
    // değil. Müttefiki olduğu için savaşa çekilen taraf, o savaşı kendisi sürdürmeli.
    if (mevcut !== TARAFSIZ) continue;
    d = iliskiYaz(d, saldiran, dost, { tip: SAVAS, turdan: d.tur, son: d.tur });
    olaylar.push({ tip: 'zincir', a: saldiran, b: dost, yuzunden: savunan });
  }
  return { durum: d, olaylar };
}

// ---- İHANET (§5.3) ----
//
// İttifakı bozan taraf `IHANET_SURESI` tur boyunca hiçbir diplomasi yapamaz.
//
// NEDEN BU KADAR BASİT: tasarım §10 tek cümle veriyor. İtibar puanı / güven skoru gibi
// bir katman §10'da YOK ve oyuncuya açıklanması güç bir görünmez sayı üretirdi.
export function ihanetIsle(durum, aktorId) {
  return {
    ...durum,
    ihanetler: { ...ihanetler(durum), [aktorId]: durum.tur + D.IHANET_SURESI },
  };
}

// İttifakı bozar. Bozan taraf ihanet bedelini öder; ilişki TARAFSIZA döner.
//
// SAVAŞA DEĞİL TARAFSIZA: anlaşmayı bozmak saldırmak değildir. Saldırırsa `savasBasla`
// zaten savaş halini kuracak — iki ayrı fiil, iki ayrı sonuç.
export function ittifakBoz(durum, bozan, oteki) {
  if (!ittifakMi(durum, bozan, oteki))
    return { ok: false, sebep: 'Aranızda bozulacak bir anlaşma yok.', durum, olay: null };
  const d = ihanetIsle(iliskiYaz(durum, bozan, oteki, null), bozan);
  return {
    ok: true,
    durum: bozan === durum.oyuncuAktorId ? sayacArtir(d, 'ihanet') : d,
    olay: { tip: 'ittifakBozuldu', a: bozan, b: oteki },
  };
}

// Ateşkes — `teklifUygula`nın ateşkes yolunun adı konmuş hâli (§5.4).
// §10 bunun neden gerektiğini de yazıyor: "yoksa savaş halinde ama savaşamıyor kalıcı
// takılır."
export function savasBitir(durum, a, b) {
  return teklifUygula(durum, a, b, 'ateskes');
}

// ---- TUR SONU BAKIMI ----
//
// `rekabet.js duellolariGuncelle`'nin kardeşi ve aynı yerden (turDongusu) çağrılıyor.
// İki iş:
//   1. UNUTULMUŞ SAVAŞLAR düşer. Son teması `SAVAS_UST_SINIRI` turdan eski olan savaş
//      kendiliğinden tarafsıza döner — iki aktör 15 tur birbirine dokunmadıysa aralarında
//      savaş yoktur, kayıtta duran bir satır vardır.
//   2. ELENEN AKTÖRLERİN satırları düşer. "Yaşıyor mu" ölçüsü `rekabet.js`'teki ile aynı:
//      elinde parça var mı. Ayrı bir "yenildi" bayrağı tutulmuyor — sahiplik tek gerçek
//      kaynak ve ikinci bir kayıt ondan ayrışabilirdi.
//   3. Süresi dolan ihanet kayıtları silinir (kayıt boyutu birikmesin).
export function iliskileriGuncelle(durum) {
  if (!D.ACIK) return durum;
  const tablo = iliskiler(durum);
  const eskiIhanet = ihanetler(durum);

  const yasiyor = {};
  for (const sahip of Object.values(durum.parcaSahipligi)) yasiyor[sahip] = true;

  const yeni = {};
  let degisti = false;
  for (const k of Object.keys(tablo)) {
    const kayit = tablo[k];
    const [a, b] = k.split('|');
    const olu = !yasiyor[a] || !yasiyor[b];
    const unutuldu =
      kayit.tip === SAVAS &&
      durum.tur - (kayit.son === undefined ? kayit.turdan : kayit.son) >= D.SAVAS_UST_SINIRI;
    if (olu || unutuldu) degisti = true;
    else yeni[k] = kayit;
  }

  const yeniIhanet = {};
  for (const id of Object.keys(eskiIhanet)) {
    if (durum.tur < eskiIhanet[id] && yasiyor[id]) yeniIhanet[id] = eskiIhanet[id];
    else degisti = true;
  }

  return degisti ? { ...durum, iliskiler: yeni, ihanetler: yeniIhanet } : durum;
}

// ---- DÜNYA GÖRÜNÜMÜ (Görev 12 · Baki: "blok görünümü olsun") ----
//
// Diplomasi paneli bugüne kadar SATIR SATIR okunuyordu: kimin kiminle müttefik olduğunu
// anlamak için on satırı birleştirip kafanda kurman gerekiyordu. Bu iki fonksiyon o işi
// veriden yapıyor.
//
// ⚠ YENİ KURAL YOK. İkisi de `durum.iliskiler`in okunuşu — ittifak ve savaş tanımları
// yukarıdaki fonksiyonların aynısı. Ekran bunu kendi başına hesaplasaydı, "blok" kavramı
// iki yerde yaşar ve bir gün ayrışırdı (§10/4).

// Birbirine ittifakla bağlı aktör kümeleri. Tek başına duranlar DÖNMEZ: bir kişilik blok
// bir blok değildir, gürültüdür.
export function ittifakBloklari(durum) {
  const bagli = {};
  for (const [k, v] of Object.entries(iliskiler(durum))) {
    if (!v || v.tip !== ITTIFAK) continue;
    const [a, b] = k.split('|');
    (bagli[a] = bagli[a] || []).push(b);
    (bagli[b] = bagli[b] || []).push(a);
  }

  // Gezilmemiş her düğümden genişleyerek bağlı bileşenleri buluyoruz. Sıra BELİRLENİMCİ
  // olmalı: ekranda bloklar her açılışta yer değiştirmesin.
  const gorulen = new Set();
  const bloklar = [];
  for (const kok of Object.keys(bagli).sort()) {
    if (gorulen.has(kok)) continue;
    const yigin = [kok];
    const uyeler = [];
    gorulen.add(kok);
    while (yigin.length) {
      const x = yigin.pop();
      uyeler.push(x);
      for (const y of bagli[x] || []) {
        if (gorulen.has(y)) continue;
        gorulen.add(y);
        yigin.push(y);
      }
    }
    if (uyeler.length >= 2) bloklar.push(uyeler.sort());
  }
  // Büyük blok önce — oyuncunun bilmesi gereken ilk şey en büyük tehdit/güç.
  return bloklar.sort((a, b) => b.length - a.length);
}

// Süren savaşların çiftleri: [{ a, b, turdan }]. Eskiden yeniye değil, ESKİDEN YENİYE
// sıralı: en uzun süren savaş dünyanın en derin yarığıdır.
export function savasHatlari(durum) {
  const cikti = [];
  for (const [k, v] of Object.entries(iliskiler(durum))) {
    if (!v || v.tip !== SAVAS) continue;
    const [a, b] = k.split('|');
    cikti.push({ a, b, turdan: v.turdan || 0 });
  }
  return cikti.sort((x, y) => x.turdan - y.turdan || (x.a < y.a ? -1 : 1));
}
