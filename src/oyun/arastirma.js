// ARAŞTIRMA — ordu kalitesi (Görev 06 / tasarım §6, Görev 07 / Adım 2b'de yeniden kuruldu).
//
// BİRİM BAŞINA AĞAÇ (Baki'nin isteği, 2026-07-31). Her birim türünün kendi ağacı var:
// üç ana dal + bir kendine özgü dal, her biri 3 seviye. Bir dal seviye atlayınca YALNIZCA
// kendi biriminin statı kayar — eskiden tek "Zırh" dalı üç birimin zırhını birden
// kaydırıyordu ve tavanı zırhlı tek başına Sv.2'de tutuyordu (gerekçe `denge.js`'te).
//
// Araştırma aktöre aittir, toprağa değil — fethedilen ilin araştırması devralınmaz (§5/6).
//
// SAF FONKSİYONLAR: oyun durumunu tanımayan hesaplar burada. Kimin ne kadar puanı var,
// hangi tur ne oldu — o `turDongusu.js`'in işi.
//
// ARAŞTIRMANIN SAVAŞI ÇEVİRMESİ BİR ŞARTTIR, YAN ETKİ DEĞİL (2026-08-11, Baki: "araştırma
// yapılan birlikler savaşları kesinlikle değiştirebilsin"). Ölçüsü `veri/arastirma-olcum.md`:
// kıl payı kaybedilen savaşların %95'i tek dal Sv.3 ile dönüyor, ezilerek kaybedilenlerin
// yalnızca %15'i tam teçhizatla dönüyor. İkisi birden şart — ikincisi olmasaydı araştırma
// ordu büyüklüğünün yerine geçerdi. `testler/arastirma.test.js` ikisini de kilitliyor.
//
// `birimStatlari` hem oyunun hem o ölçümün kullandığı TEK fonksiyondur — ölçüm betiği bunu
// `require` ediyor. İki yere kopyalansaydı ayrışır ve ölçüm oyunu ölçmez olurdu (Görev
// 05'in en pahalı hatası harita↔ekran çevirisini üç yere kopyalamaktı).
//
// KAYIT: yalnızca araştırması OLAN aktörler için tutulur; 81 aktör için boş nesne yazılmaz.
// Dal kimliği "birim.dal" biçiminde DÜZ ANAHTAR — iç içe nesne yerine düz anahtar, çünkü
// kayıt dosyası küçük kalsın ve sürüm 6'nın düz yapısına en yakın biçim bu:
//   durum.arastirma["16"] = { "piyade.zirh": 2, "zirhli.yarma": 1, puan: 3.4, buTurAyrilan: 4 }
// `puan` KESİRLİ saklanır (§6.4 kesirli havuz kuralının aynısı) — yuvarlansaydı her tur
// biraz kaynak sessizce buharlaşırdı. Ekranda aşağı yuvarlanarak gösterilir.

import { DENGE } from '../denge.js';
import { parcaEgitimi } from './uretim.js';
import { havuzdanDus } from './butce.js';

const A = DENGE.ARASTIRMA;

// ---- DAL KİMLİĞİ ----
// Tek yerde tanımlı: hem yazan hem okuyan bunu kullanıyor, ayrışamazlar.
export function dalAnahtari(birim, dal) {
  return birim + '.' + dal;
}

// Bütün dalların düz listesi: [{ birim, dal, anahtar, tanim }]
export function tumDallar() {
  const liste = [];
  for (const birim of A.AGAC_SIRASI)
    for (const dal of A.DAL_SIRASI[birim])
      liste.push({ birim, dal, anahtar: dalAnahtari(birim, dal), tanim: A.AGACLAR[birim][dal] });
  return liste;
}

// Bir aktörün araştırma kaydından dal seviyesini okur. Kayıt yoksa (henüz hiç araştırma
// yapmamış aktör) 0 döner — 81 aktör için boş nesne saklamamamızın karşılığı (§6).
export function dalSeviyesi(arastirma, birim, dal) {
  const s = arastirma && arastirma[dalAnahtari(birim, dal)];
  return typeof s === 'number' && s > 0 ? s : 0;
}

// Araştırma kaydında hiç seviye var mı?
export function arastirmaVarMi(arastirma) {
  if (!arastirma) return false;
  return tumDallar().some((d) => dalSeviyesi(arastirma, d.birim, d.dal) > 0);
}

// ---- KAYDIRILMIŞ BİRİM STAT TABLOSU ----
//
// Muharebe motoru `DENGE.BIRIMLER`'i kendisi okumaz; tabloyu PARAMETRE olarak alır.
// Araştırma yoksa buradan `DENGE.BIRIMLER`'in KENDİSİ döner (kopyası değil) — yani
// araştırma 0'da motor kelimesi kelimesine eski davranışını gösterir ve §3.7'nin 15 satırı
// değişmeden geçer. Bitiş ölçütü buydu ve Görev 07'de de korundu.
//
// ARTIŞ ORANSAL: stat × (1 + ARTIS × seviye). Mutlak +N, statı düşük birime orantısız
// yarıyordu (piyadenin ağır vuruşu 3→4 %33, topçununki 8→9 %13) ve ölçümde piyade-ağır
// dalını Sv.1'de kırıyordu. Sonuç kesirli kalır; muharebe hesabı zaten kesirli çalışıyor.
export function birimStatlari(arastirma) {
  if (!arastirmaVarMi(arastirma)) return DENGE.BIRIMLER;

  const tablo = {};
  for (const tur of DENGE.BIRIM_SIRASI) tablo[tur] = { ...DENGE.BIRIMLER[tur] };

  for (const d of tumDallar()) {
    if (d.tanim.tip !== 'stat') continue;
    const seviye = dalSeviyesi(arastirma, d.birim, d.dal);
    if (seviye === 0) continue;
    // YUVARLAMA KAYAN NOKTA İÇİN, ölçek için değil: 50 × 1.16 kâğıtta 58, JavaScript'te
    // 57.99999999999999. Ölçek (denge.js STAT_OLCEGI) zaten her artışın tam sayı çıkmasını
    // garanti ediyor; buradaki `Math.round` yalnızca ikili kesir artığını siliyor.
    // Ölçek yanlış seçilirse bu satır hatayı GİZLEMEZ — `testler/ordu.test.js` ham çarpımı
    // ayrıca denetliyor.
    tablo[d.birim][d.tanim.stat] = Math.round(
      DENGE.BIRIMLER[d.birim][d.tanim.stat] * (1 + A.ARTIS * seviye)
    );
  }
  return tablo;
}

// ---- KENDİNE ÖZGÜ DALLARIN ETKİLERİ ----
//
// Dördü de stat tablosuna DOKUNMAZ; muharebe motoru, toplanma ve çekilme bunları ayrı bir
// "etkiler" nesnesi olarak alır. Böylece §3.7'nin doğrulama tablosu stat tarafında
// bozulmadan kalıyor ve her etkinin dengesi tek tek ölçülebiliyor.
//
// ---- DÖRDÜ DE AÇIK/KAPALI (2026-08-08) ----
// Eskiden seviyeyle çarpılan oranlardı; artık tek seviyeli yeteneklerin bayrağı. Etki
// nesnesi bu yüzden sayı değil DURUM taşıyor: `baraj` ön vuruş oranı (0 = yok), `palet`
// arazi başına telafi tablosu (null = yok), `yarma` imha bayrağı.
//
// Dönen: { baraj, palet, yarma } — hepsi boş ise motor araştırmasız davranışını gösterir.
export function ozelEtkiler(arastirma) {
  const O = A.OZEL;
  return {
    // Muharebe başlamadan yapılan KARŞILIKSIZ hazırlık ateşinin oranı (0 = etki yok).
    baraj: dalSeviyesi(arastirma, 'topcu', 'baraj') > 0 ? O.BARAJ_ON_VURUS : 0,
    // Zırhlının arazi cezasından geri aldığı pay — ARAZİ BAŞINA tablo, yoksa null.
    palet: dalSeviyesi(arastirma, 'zirhli', 'palet') > 0 ? O.PALET_TELAFI : null,
    // Bozguna uğrattığı ordu çekilemez, yok olur.
    yarma: dalSeviyesi(arastirma, 'zirhli', 'yarma') > 0 && !!O.YARMA_IMHA,
  };
}

// Piyade yaralıları bedava ve anında iyileşiyor mu — `toplanma.js` kullanıyor.
export function seferberlikBedava(arastirma) {
  return dalSeviyesi(arastirma, 'piyade', 'seferberlik') > 0 && !!A.OZEL.SEFERBERLIK_BEDAVA;
}

// Bir aktörün araştırma kaydı (yoksa null). Kayıt tutmayan aktör = hiç araştırma yapmamış.
export function aktorArastirmasi(durum, aktorId) {
  return (durum.arastirma && durum.arastirma[aktorId]) || null;
}

// Bir aktörün muharebeye gireceği stat tablosu. Kısa yol — cozum.js ve arayüzdeki
// muharebe tahmini AYNI satırdan geçsin diye; ayrışırlarsa ekrandaki tahmin ile tur
// sonunda olan şey tutmaz.
export function aktorStatlari(durum, aktorId) {
  return birimStatlari(aktorArastirmasi(durum, aktorId));
}

// Bir aktörün muharebeye gireceği özel etkiler.
export function aktorEtkileri(durum, aktorId) {
  return ozelEtkiler(aktorArastirmasi(durum, aktorId));
}

// ---- EĞİTİM GÜCÜ (§5/3) ----
//
// Aktörün eğitim gücü = elindeki parçaların eğitim değerlerinin toplamı. Hesap `uretim.js`
// içindeki `parcaDegerleri`'nin ÜÇÜNCÜ kullanımı; yeni formül icat edilmedi.
// Fetihle doğrudan büyür: eğitimli il almak somut bir ödül.
export function egitimPuani(durum, aktorId) {
  let toplam = 0;
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (durum.parcaSahipligi[pid] !== aktorId) continue;
    toplam += parcaEgitimi(pid);
  }
  return toplam;
}

// ---- PUAN KAZANIMI (§6, Soru 3 → cevap A) ----
//
// Araştırmaya ayrılan 1 ekonomi kaç puan eder:
//     verim = VERIM_TABANI + EGITIM_KATSAYISI × √(eğitim gücü)
//
// KAREKÖK bilerek. Büyüyen imparatorluk zaten daha çok ekonomi ayırabiliyor; çarpan da
// doğrusal büyüseydi araştırma imparatorluk büyüklüğünün KARESİYLE artar, kartopunu ikinci
// kez beslerdi (Soru 5). Karekökle ikinci ilin katkısı birincisinden az olur.
export function arastirmaVerimi(egitim) {
  return A.VERIM_TABANI + A.EGITIM_KATSAYISI * Math.sqrt(Math.max(0, egitim));
}

// Bu tur kazanılacak araştırma puanı. Ayrılan ekonomi ORDU BÜTÇESİNDEN düşer — tek havuz,
// üç musluk (yeni birim · toplanma · araştırma).
//
// TAM SAYI (2026-07-31, Baki: "oyunda ondalıklı hiçbir şey istemiyorum"). Görev 06'da puan
// KESİRLİ birikiyordu ve ekranda "+2.4/tur" diye görünüyordu. Kesir tutmanın gerekçesi
// "her tur biraz kaynak buharlaşmasın"dı; puan ölçeği 10× büyütülünce (MALIYET_TABANI 6 →
// 60) yuvarlama kaybı kazancın ~%1'ine düştü ve gerekçe ortadan kalktı.
export function turPuani(ayrilanEkonomi, egitim) {
  const ayrilan = Math.max(0, ayrilanEkonomi || 0);
  return Math.round(ayrilan * arastirmaVerimi(egitim));
}

// ---- SEVİYE ATLAMA ----

// ---- DAL TİPİNE GÖRE TAVAN VE BEDEL (2026-08-08) ----
//
// STAT dalları: 3 seviye, Sv.N = MALIYET_TABANI × N (60/120/180, toplam 360).
// ÖZEL dallar: tek seviye, sabit OZEL_MALIYET (12) — gerekçesi `denge.js`'te.
//
// İkisi TEK YERDEN okunuyor. Ekrandaki "yükselt" düğmesinin gösterdiği bedel ile ödenen
// bedel ayrışamasın diye `dalDurumu` da, `seviyeAtla` da, geri alma da buradan geçiyor.
function ozelMi(birim, dal) {
  const t = A.AGACLAR[birim] && A.AGACLAR[birim][dal];
  return !!(t && t.tip === 'ozel');
}

// Bir dalın çıkabileceği en yüksek seviye.
export function dalTavani(birim, dal) {
  return ozelMi(birim, dal) ? A.OZEL_TAVAN : A.TAVAN;
}

// Bir dalın hedefSeviye'ye çıkma bedeli. Tavanı aşan seviye Infinity döner — çağıranın
// ayrıca tavan kontrolü yapmasına gerek kalmasın.
export function seviyeMaliyeti(hedefSeviye, birim, dal) {
  if (hedefSeviye <= 0 || hedefSeviye > dalTavani(birim, dal)) return Infinity;
  return ozelMi(birim, dal) ? A.OZEL_MALIYET : A.MALIYET_TABANI * hedefSeviye;
}

// Böyle bir dal var mı?
export function dalVarMi(birim, dal) {
  return !!(A.AGACLAR[birim] && A.AGACLAR[birim][dal]);
}

// ---- ÖZEL YETENEK AĞACIN UCU (Görev 20 · Baki, 2026-09-23: "evet") ----
//
// Polytopia'da uç teknolojiler önce köklerini ister. Burada da özel yetenek (seferberlik,
// baraj, palet, yarma) ancak O BİRLİĞİN ortak dallarından biri `OZEL_ONKOSUL` kademesine
// çıkınca açılıyor. Hangi dalın olduğu fark etmiyor — yol oyuncunun.
//
// Görev 13'ten beri açık duran "özel dal ucuz, ilk karar hep aynı" sorununu da kapatıyor:
// yetenek artık maçın ilk turlarında 18 puana değil, bir dala yapılmış yatırımın ardından
// geliyor. Sayı ve gerekçe `DENGE.ARASTIRMA.OZEL_ONKOSUL`.
//
// Kayıt biçimi DEĞİŞMEDİ: kural yalnızca YENİ alımı kapıyor. Eski bir kayıtta önkoşulsuz
// alınmış bir yetenek açık kalır — geri almak oyuncunun ödediği puanı yakmak olurdu.
export function ozelAcikMi(arastirma, birim) {
  const dallar = A.DAL_SIRASI[birim] || [];
  return dallar.some(
    (dal) => !ozelMi(birim, dal) && dalSeviyesi(arastirma, birim, dal) >= A.OZEL_ONKOSUL
  );
}

// Bir dalın bir sonraki seviyesi hakkında her şey — ekran da motor da bunu kullanır,
// böylece "yükselt" düğmesinin gösterdiği bedel ile ödenen bedel ayrışamaz.
// Dönen: { seviye, sonraki, tavanda, kilitli, bedel, yeter, puan }
export function dalDurumu(arastirma, birim, dal) {
  const seviye = dalSeviyesi(arastirma, birim, dal);
  const puan = (arastirma && arastirma.puan) || 0;
  const tavan = dalTavani(birim, dal);
  const tavanda = seviye >= tavan;
  const kilitli = !tavanda && ozelMi(birim, dal) && !ozelAcikMi(arastirma, birim);
  const bedel = tavanda ? Infinity : seviyeMaliyeti(seviye + 1, birim, dal);
  return {
    seviye,
    sonraki: tavanda ? null : seviye + 1,
    tavan,
    tavanda,
    kilitli,
    bedel,
    yeter: !tavanda && !kilitli && puan >= bedel,
    puan,
  };
}

// Bir dalı bir seviye yükseltir. Dönen: { ok: true, arastirma } | { ok: false, kod, sebep }
// `kod` arayüz için: 'dal' | 'tavan' | 'kilit' | 'puan'.
//
// SEVİYE DÜŞÜRME YOK (§5/9): tur içinde emir kuyruğu mantığıyla geri alınabilir, TURU
// BİTİR'den sonra alınamaz.
export function seviyeAtla(arastirma, birim, dal) {
  if (!dalVarMi(birim, dal))
    return { ok: false, kod: 'dal', sebep: 'Böyle bir araştırma dalı yok.' };
  const d = dalDurumu(arastirma, birim, dal);
  if (d.tavanda)
    return {
      ok: false,
      kod: 'tavan',
      sebep: ozelMi(birim, dal)
        ? 'Bu yetenek zaten açık; bir kez alınıyor.'
        : 'Bu dal en üst seviyede (Sv.' + d.tavan + '). Daha ileri gitmek savaş dengesini bozuyor.',
    };
  // Ekran kilitli düğmeyi zaten kapalı çiziyor; bu cümle yalnızca kapıyı atlayan bir
  // çağrıya (betik, eski ekran) karşı.
  if (d.kilitli)
    return {
      ok: false,
      kod: 'kilit',
      sebep:
        'Bu yetenek, ' +
        DENGE.BIRIMLER[birim].ad.toLocaleLowerCase('tr') +
        ' dallarından biri ' +
        A.OZEL_ONKOSUL +
        '. kademeye çıkınca açılır.',
    };
  if (!d.yeter)
    return {
      ok: false,
      kod: 'puan',
      sebep: 'Puanın yetmiyor — bu yükseltme ' + d.bedel + ' puan istiyor.',
    };
  return {
    ok: true,
    arastirma: {
      ...(arastirma || {}),
      [dalAnahtari(birim, dal)]: d.seviye + 1,
      puan: d.puan - d.bedel,
    },
  };
}

// ---- TUR İÇİ EYLEMLER (Adım 4) ----
//
// GERİ ALMA (§5/9): tur içinde evet, TURU BİTİR'den sonra hayır. Seviye düşürme yok.
// Bunun için bu tur atlanan seviyeler `buTurAtlanan` listesinde sırayla tutuluyor ve geri
// alma YIĞIN mantığıyla çalışıyor — en son atlanan ilk geri alınır. Sıra önemli: bedel
// seviyeye bağlı, dolayısıyla ancak son atlama tam olarak iade edilebilir. Liste her tur
// sıfırlanır (sanayi sayacının yanında).
//
// SEVİYE ANINDA UYGULANIR, kuyruğa girmez. Sebep: araştırma ekranı etkiyi somut sayıyla
// gösteriyor ("piyaden 6 → 6.5 hafif vuruşa çıkar"); kuyruğa girseydi ekran tur sonuna
// kadar eski statları yazardı ve araştırma yine görünmez bir güç olurdu (§9/5). Tur sırası
// da buna uyuyor: §8'de araştırma 2. aşama, çözüm 6. aşama — zaten muharebeden önce işliyor.

// Bir aktörün araştırma kaydını yazar. Kayıt yalnızca gerektiğinde doğar (§6).
function arastirmayiYaz(durum, aktorId, yeni) {
  return { ...durum, arastirma: { ...(durum.arastirma || {}), [aktorId]: yeni } };
}

// Bu tur araştırmaya ayrılacak ekonomiyi belirler. `enCok` sınırını çağıran denetler
// (`butce.js arastirmayaAyrilabilir`); burada yalnızca negatife düşmesi engelleniyor.
export function ayrilaniAyarla(durum, aktorId, miktar) {
  const mevcut = aktorArastirmasi(durum, aktorId) || {};
  const yeni = Math.max(0, Math.floor(miktar || 0));
  if ((mevcut.buTurAyrilan || 0) === yeni) return durum;
  return arastirmayiYaz(durum, aktorId, { ...mevcut, buTurAyrilan: yeni });
}

// Bir dalı bir seviye yükseltir ve YENİ oyun durumu döndürür.
// Dönen: { ok: true, durum } veya { ok: false, kod, sebep, durum }
export function seviyeYukselt(durum, aktorId, birim, dal) {
  const mevcut = aktorArastirmasi(durum, aktorId) || {};
  const s = seviyeAtla(mevcut, birim, dal);
  if (!s.ok) return { ok: false, kod: s.kod, sebep: s.sebep, durum };
  const atlanan = (mevcut.buTurAtlanan || []).concat([dalAnahtari(birim, dal)]);
  return {
    ok: true,
    durum: arastirmayiYaz(durum, aktorId, { ...s.arastirma, buTurAtlanan: atlanan }),
  };
}

// Bu tur atlanan SON seviyeyi geri alır ve puanı iade eder.
// Dönen: { ok: true, durum } veya { ok: false, sebep, durum }
export function seviyeGeriAl(durum, aktorId) {
  const mevcut = aktorArastirmasi(durum, aktorId);
  const atlanan = (mevcut && mevcut.buTurAtlanan) || [];
  if (atlanan.length === 0)
    return { ok: false, sebep: 'Bu tur geri alınacak bir yükseltme yok.', durum };

  const anahtar = atlanan[atlanan.length - 1];
  const seviye = (mevcut && mevcut[anahtar]) || 0;
  // İade edilecek bedel dalın TİPİNE bağlı (stat: 60×N, özel: sabit 12), o yüzden anahtar
  // birim ve dala ayrılıyor. Ödenen ile iade edilen ayrışırsa geri alma bir puan pompası
  // olur — bu satır o yüzden `seviyeMaliyeti`'nin aynısından geçiyor.
  const [birim, dal] = anahtar.split('.');
  return {
    ok: true,
    durum: arastirmayiYaz(durum, aktorId, {
      ...mevcut,
      [anahtar]: seviye - 1,
      puan: (mevcut.puan || 0) + seviyeMaliyeti(seviye, birim, dal),
      buTurAtlanan: atlanan.slice(0, -1),
    }),
  };
}

// ---- TUR DÖNGÜSÜNÜN 2. AŞAMASI (§8) ----
//
// Ayrılan ekonomi havuzdan düşer ve puana dönüşür. Bütün aktörler için çalışır — Görev
// 07'den itibaren yapay zekâ da aynı yoldan geçiyor, ayrı bir yol açılmadı.
//
// Dönen: { aktorler, arastirma, ozet } — `ozet` tur raporunun satırı.
export function arastirmaAsamasi(durum, aktorler) {
  const kayitlar = durum.arastirma || {};
  let yeniAktorler = aktorler;
  const yeniKayitlar = {};
  const ozet = [];

  for (const aktorId of Object.keys(kayitlar)) {
    const k = kayitlar[aktorId];
    const ayrilan = Math.max(0, k.buTurAyrilan || 0);
    // Ayrılan, havuzda gerçekten var olandan fazla olamaz: tur içinde başka bir yol
    // havuzu eritmişse sessizce eksiye düşmek yerine olan kadarı harcanır.
    const a = yeniAktorler[aktorId];
    const harcanan = a ? Math.min(ayrilan, Math.floor(a.ekonomiHavuzu)) : 0;
    const kazanilan = harcanan > 0 ? turPuani(harcanan, egitimPuani(durum, aktorId)) : 0;

    if (harcanan > 0)
      yeniAktorler = havuzdanDus(yeniAktorler, aktorId, { nufus: 0, ekonomi: harcanan });

    // `buTurAyrilan` ve `buTurAtlanan` sıfırlanır — ikisi de turluk (§Adım 4).
    const guncel = { ...k, puan: (k.puan || 0) + kazanilan };
    delete guncel.buTurAyrilan;
    delete guncel.buTurAtlanan;
    yeniKayitlar[aktorId] = guncel;

    if (harcanan > 0 && aktorId === durum.oyuncuAktorId)
      ozet.push({ aktorId, harcanan, kazanilan });
  }

  return { aktorler: yeniAktorler, arastirma: yeniKayitlar, ozet };
}

// ---- ETKİNİN SOMUT ANLATIMI (arayüz) ----
//
// "Ağır vuruş Sv.3" tek başına hiçbir şey anlatmaz; "piyaden 3 → 3.7 ağır vuruşa çıkar"
// anlatır. SAYILAR UYDURULMAZ, `birimStatlari` ile gerçek hesaptan çıkar.
//
// Özel dallar için stat yerine kendi cümlesi döner — onların "önce/sonra"sı bir stat
// sütunu değil (bkz. `ozelEtkiler`).
//
// Dönen: { tip, birim, stat?, once?, sonra?, cumle }
export function dalEtkisi(arastirma, birim, dal) {
  const tanim = A.AGACLAR[birim] && A.AGACLAR[birim][dal];
  if (!tanim) return null;
  const seviye = dalSeviyesi(arastirma, birim, dal);
  const sonrakiSeviye = Math.min(seviye + 1, dalTavani(birim, dal));
  const birimAdi = DENGE.BIRIMLER[birim].ad;

  if (tanim.tip === 'stat') {
    const simdi = birimStatlari(arastirma);
    const sonraki = birimStatlari({
      ...(arastirma || {}),
      [dalAnahtari(birim, dal)]: sonrakiSeviye,
    });
    const once = simdi[birim][tanim.stat];
    const sonra = sonraki[birim][tanim.stat];
    return {
      tip: 'stat',
      birim,
      stat: tanim.stat,
      once,
      sonra,
      artis: sonra - once,
      cumle: birimAdi + ' ' + tanim.ad.toLocaleLowerCase('tr') + ' ' + once + ' → ' + sonra,
    };
  }

  // ÖZEL DALLAR TEK SEVİYELİ (2026-08-08): cümle artık seviyeye göre değişmiyor, çünkü
  // ara kademe yok — ya kapalı ya açık. Sayılar yine DENGE'den okunuyor, elle yazılmıyor;
  // biri `denge.js`'te oranı değiştirirse araştırma ekranındaki cümle kendiliğinden düzelir.
  const O = A.OZEL;
  const yuzde = (x) => '%' + Math.round(x * 100);
  const cumleler = {
    seferberlik: () => 'Yaralı piyaden bedava ve anında iyileşir',
    baraj: () =>
      'Topçun savaş başlamadan karşılıksız ateş açar — normal vuruşunun ' +
      yuzde(O.BARAJ_ON_VURUS) +
      "'i kadar",
    palet: () =>
      'Zırhlının arazi cezası tepelikte tamamen, dağlıkta ' +
      yuzde(O.PALET_TELAFI.daglik) +
      ' oranında kalkar',
    yarma: () => 'Bozguna uğrattığın ordu çekilemez, olduğu yerde yok olur',
  };
  const yap = cumleler[tanim.etki];
  return {
    tip: 'ozel',
    birim,
    cumle: yap ? yap(sonrakiSeviye) : tanim.ad,
    simdiki: yap && seviye > 0 ? yap(seviye) : null,
  };
}

// NOT: burada bir ondalık biçimlendirici vardı ("6,5" gibi). Muharebe statları 25× ölçekli
// olduğu için (denge.js BIRIMLER) araştırma artışları artık tam sayı; gerek kalmadı.
