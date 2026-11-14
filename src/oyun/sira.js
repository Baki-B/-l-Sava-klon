// SIRA SİSTEMİ — tur döngüsünün 8. maddesi (Görev 07 / Adım 5, tasarım §8).
//
// ┌─ SORU 1 → BAKİ'NİN CEVABI: A2 (2026-07-31) ────────────────────────────────────────┐
// │ Görev belgesi düz EŞZAMANLI turu öneriyordu: herkes tur başındaki aynı fotoğrafa   │
// │ bakar, emirler tek çözümde işlenir. Baki bunu mantıksız buldu:                     │
// │                                                                                    │
// │   "Ben bir yeri aldım, adam alınan yerden başka bir yere saldırı yapmak istiyordu" │
// │                                                                                    │
// │ Klasik sırayı (herkes kendi sırasında oynar) daha mantıklı buldu ama ekranda 80    │
// │ aktörün turunu izlemek dayanılmaz yavaş olurdu. A2 ikisinin ortası:                │
// │                                                                                    │
// │   • Çözüm sırası her tur TOHUMLA KARIŞIR — kimse kalıcı ilk vuruş avantajı almaz.  │
// │   • Sıra bir aktöre geldiğinde O ANKİ duruma bakarak karar verir ve emri HEMEN     │
// │     çözülür. Yani yapay zekâ hep güncel dünyayı görür; ölü emir hiç doğmaz.        │
// │   • Tek TURU BİTİR anı korunur: oyuncu 80 turun geçmesini izlemez.                 │
// │                                                                                    │
// │ BEDELİ AÇIKÇA SÖYLENDİ: oyuncu emirlerini tur başında planlıyor, sırası ondan      │
// │ sonra gelen aktör onun hamlesini görmüş oluyor. Sıra her tur karıştığı için bu     │
// │ avantaj kimsede kalıcı değil — ama her tur birilerinde.                            │
// └────────────────────────────────────────────────────────────────────────────────────┘
//
// SIRA KAYITTA TUTULMAZ, TÜRETİLİR (görev belgesi §6): tohum ve tur numarasından yeniden
// üretiliyor. Kayıtta tutmak, aynı kaydı iki kez yükleyince farklı sıra çıkma riskini
// kapatmaz — türetmek kapatır.

import { DENGE } from '../denge.js';
import { rastgeleKur } from './rastgele.js';
import { toplanmaEmriVer } from './hareket.js';
import { hamleUygula } from './cozum.js';
import { komutanAta, zekaKomutanParcasi } from './komutan.js';
import { zekaYetenegi, zekaKademesi } from './yetenek.js';
import { baskinHuy } from './liderler.js';
import { birimUret } from './ordu.js';
import { ayrilaniAyarla, seviyeYukselt, aktorArastirmasi, dalDurumu } from './arastirma.js';
import {
  zekaEmirleri,
  uretimKarari,
  arastirmaKarari,
  toparlanmaKarari,
  diplomasiEmirleri,
  teklifKabulMu,
  savasIlaniSec,
} from './zeka.js';
import { teklifUygula, savasIlanEt } from './diplomasi.js';

// Bu turun çözüm sırası. Fisher–Yates, TOHUMLU üretecle — `Math.random` yok.
// Tohum tur numarasıyla karıştırılıyor ki her tur farklı bir sıra çıksın ama aynı
// kayıt her zaman aynı sırayı üretsin.
// ---- ⚠ ÖNCE İNSANLAR, SONRA BOTLAR (Görev 15 / Adım 3 — Baki 2026-09-19) ----
//
// *"Tek oyunculuda oyuncu her zaman ilk başlayan olsun; çok oyunculuda ise oyuncular
// kendi arasında sıralanır ama ilk başlayanlar oyunculardır, botlar sonra gelsin."*
//
// BU, A2 KARARININ BİR PARÇASINI TERSİNE ÇEVİRİYOR. Görev 07'de sıra tam olarak "kimse
// kalıcı ilk vuruş avantajı almasın" diye karıştırılıyordu. Hamle artık anında çözüldüğü
// için oyuncu zaten TURU BİTİR'e basmadan önce oynuyor; sırayı buna uydurmak, kodun
// söylediği ile oyunun yaptığını aynı yere getiriyor. Bedeli açık ve kabul edildi:
// oyuncu her tur ilk vuruşu yapıyor, yani fetih hızı artıyor. Ölçüm Adım 5'te,
// zorluk kademeleri ona göre ayarlanacak.
//
// KARIŞTIRMA İKİ KÜMEDE AYRI AYRI: insanlar kendi aralarında, botlar kendi aralarında.
// Çok oyunculu geldiğinde "1. oyuncu hep ilk vurur" diye bir adaletsizlik doğmasın —
// kural bugünden yazılı, tek insan varken de aynı kodu kullanıyor.
function karistir(idler, uretec) {
  for (let i = idler.length - 1; i > 0; i--) {
    const j = uretec.tamsayi(0, i);
    const t = idler[i];
    idler[i] = idler[j];
    idler[j] = t;
  }
  return idler;
}

export function turSirasi(durum) {
  const idler = Object.keys(durum.aktorler).sort(); // sıralı başlangıç = tekrar üretilebilir
  const uretec = rastgeleKur(durum.rastgele.tohum >>> 0, (durum.rastgele.tohum + durum.tur) >>> 0);
  const insanMi = (id) =>
    (durum.aktorler[id] && durum.aktorler[id].tur === 'insan') || id === durum.oyuncuAktorId;
  const insanlar = idler.filter(insanMi);
  const botlar = idler.filter((id) => !insanMi(id));
  return karistir(insanlar, uretec).concat(karistir(botlar, uretec));
}

// ---- YAPAY ZEKÂNIN EKONOMİ TURU ----
//
// Oyuncu bunları tur İÇİNDE yapıyor (üretim ekranı, araştırma ekranı, toparlanma emri);
// yapay zekâ da turun başında yapar. Sıra §8'in kendi sırası: araştırma → üretim →
// toparlanma. Üçü de OYUNCUNUN GEÇTİĞİ AYNI fonksiyonlardan geçiyor — `birimUret`,
// `ayrilaniAyarla`, `seviyeYukselt`, `toplanmaEmriVer`. İkinci bir yol AÇILMADI (§9/tuzak 5).
export function zekaEkonomiTuru(durum, aktorId, kisilik) {
  let d = durum;

  // 1) ARAŞTIRMA — payı ayır, puanı yetiyorsa dalı yükselt.
  const ar = arastirmaKarari(d, aktorId, kisilik);
  if (ar) {
    if (ar.ayrilan > 0) d = ayrilaniAyarla(d, aktorId, ar.ayrilan);
    if (ar.birim && ar.dal) {
      // Puan yettiği sürece aynı dalı yükselt; tavana gelince durur.
      // `dalDurumu` hem bedeli hem yeterliliği söylüyor, ikinci bir hesap yapılmıyor.
      for (let i = 0; i < DENGE.ARASTIRMA.TAVAN; i++) {
        const durumu = dalDurumu(aktorArastirmasi(d, aktorId), ar.birim, ar.dal);
        if (!durumu.yeter) break;
        const s = seviyeYukselt(d, aktorId, ar.birim, ar.dal);
        if (!s.ok) break;
        d = s.durum;
      }
    }
  }

  // 2) ÜRETİM — sanayi hakkı bitene ya da para yetmeyene kadar.
  // Döngü, tek bir ilin hakkının birden çok siparişe bölünebilmesi için: `uretimKarari`
  // her çağrıda o anki bütçeyle bir sipariş üretiyor.
  for (let i = 0; i < DENGE.ZEKA.URETIM_DENEMESI; i++) {
    const karar = uretimKarari(d, aktorId);
    if (!karar) break;
    const s = birimUret(d, karar.parcaId, aktorId, karar.siparis);
    if (!s.ok) break;
    d = s.durum;
  }

  // 3) TOPARLANMA — emir kuyruğuna girer, tur sonunda `toplanmaAsamasi` işler (§3.9/2).
  for (const pid of toparlanmaKarari(d, aktorId)) {
    const s = toplanmaEmriVer(d, aktorId, pid);
    if (s.ok) d = s.durum;
  }
  return d;
}

// ---- SIRA + ÇÖZÜM ----
//
// Sırayla gezilir. Oyuncunun sırası gelince kuyruğundaki emirler çözülür; yapay zekânın
// sırası gelince O AN karar verir, emirleri kuyruğa girer ve hemen çözülür.
//
// KARAR ANINDA DURUM GÜNCEL. A2'nin bütün mesele bu: aktör kendinden önce oynayanların
// hamlelerini görmüş olur, ölü emir doğmaz.
//
// Dönen: { durum, satirlar } — satırlar tur raporunun ham dökümü.
// `secenekler.zekaKapali` — yapay zekâ hiç karar vermez, yalnızca kuyruktaki emirler
// çözülür. İki yerde gerekiyor:
//   1. TESTLER: "havuz geliri kadar arttı mı" gibi ölçümler, 80 aktör para harcarken
//      yapılamaz. Ölçülen kural (üretim aşaması) hâlâ doğru, ölçüm ortamı gürültülü.
//   2. DENGE SİMÜLASYONU: Görev 06'nın "dünya duruyor" satırı yeniden koşulabilsin ki
//      bu görevin getirdiği fark ölçülebilsin (görev belgesi §Adım 7'nin tablosu).
// ---- ZEKÂNIN DİPLOMASİSİ (Görev 09 / Adım 2) ----
//
// İKİ AYRI YOL, TEK KURAL KÜMESİ:
//   • Hedef YAPAY ZEKÂ ise teklif ANINDA cevaplanır — karşı taraf da bir puan hesabı,
//     beklemesinin bir anlamı yok ve bekleyen teklif kayda girerdi.
//   • Hedef OYUNCU ise teklif `durum.teklifler`e düşer ve tur raporunda kart olur
//     (§4/Soru 2'nin alt kuralı: "diplomasinin yarısı GELEN tekliftir").
//
// Teklifin kendisi de `teklifUygula`dan geçiyor — yani oyuncunun ve zekânın anlaşmaları
// AYNI KAPIDAN. `hareketGecerliMi`'nin kalıbının aynısı.
function diplomasiKarari(durum, aktorId, kisilikler, satirlar) {
  let d = durum;
  const tohum = (d.rastgele.tohum + d.tur) >>> 0;
  for (const teklif of diplomasiEmirleri(d, aktorId, kisilikler[aktorId], tohum)) {
    if (teklif.hedef === d.oyuncuAktorId) {
      // OYUNCUYA GELEN TEKLİF. Aynı kaynaktan aynı tip ikinci kez düşmesin.
      const bekleyen = d.teklifler || [];
      if (bekleyen.some((t) => t.kimden === aktorId && t.tip === teklif.tip)) continue;
      d = { ...d, teklifler: bekleyen.concat([{ kimden: aktorId, tip: teklif.tip }]) };
      continue;
    }
    if (!teklifKabulMu(d, teklif.hedef, aktorId, teklif.tip, kisilikler[teklif.hedef])) continue;
    const s = teklifUygula(d, aktorId, teklif.hedef, teklif.tip);
    if (!s.ok) continue;
    d = s.durum;
    satirlar.push({ tip: 'diplomasi', aktorId, ...s.olay });
  }
  return d;
}

export function sirayiCoz(durum, secenekler) {
  const s = secenekler || {};
  const zorluk = s.zorluk || durum.zorluk || DENGE.ZEKA.VARSAYILAN_ZORLUK;
  const kisilikler = durum.kisilikler || {};
  let d = durum;
  const satirlar = [];

  for (const aktorId of turSirasi(durum)) {
    // İNSAN AKTÖRÜN SIRASINDA BURADA İŞ YOK (Görev 15). Oyuncu hamlelerini TURU BİTİR'e
    // basmadan önce yapıyor ve her biri o anda çözülüyor; burada yapılacak bir şey kalmıyor.
    // Sırada yine de görünüyor çünkü sıra "kim önce oynadı"nın kaydı: insanlar en başta.
    const insanMi =
      aktorId === d.oyuncuAktorId || (d.aktorler[aktorId] && d.aktorler[aktorId].tur === 'insan');

    if (!insanMi && !s.zekaKapali) {
      // Ekonomi kararları — asker basmak, araştırmak, yaralıları toplamak.
      d = zekaEkonomiTuru(d, aktorId, kisilikler[aktorId]);

      // KOMUTAN (Görev 16 / Adım 4): tek kural — en kalabalık ordunun başına geç. Oyuncunun
      // geçtiği AYNI kapıdan (`komutanAta`) geçiyor, yani bekleme cezası ve turluk atama
      // hakkı botlara da işliyor. Gizli bonus yok (§9.1 "tek beyin").
      // ÜRETİMDEN SONRA: bu turun askerleri de sayıya girsin.
      const komutanYeri = zekaKomutanParcasi(d, aktorId);
      if (komutanYeri) {
        // YETENEK KİŞİLİKTEN (Adım 5): baskın huy hangisiyse yeteneği o belirliyor —
        // lakap seçiminde kullanılan aynı `baskinHuy`. Böylece "Demir Yumruk" diye
        // tanıdığın saldırgan bot gerçekten Silah Ustası oluyor.
        //
        // ⚠ KADEME ZORLUKTAN GELMİYOR, SABİT. §9.4: "zorluk = ağırlık ayarı, gizli bonus
        // değil" — zor kademede bota kademe 3 vermek tam olarak gizli bonus olurdu.
        const huy = baskinHuy(kisilikler[aktorId]);
        const ka = komutanAta(d, aktorId, komutanYeri, {
          yetenek: zekaYetenegi(huy),
          kademe: zekaKademesi(),
          birim: DENGE.KOMUTAN.VARSAYILAN_BIRIM,
        });
        if (ka.ok) d = ka.durum;
      }

      // DİPLOMASİ, HAREKETTEN ÖNCE (Görev 09 / Adım 2). Sıra önemli: bu turda kurulan
      // ittifak, aynı turun hareket kararlarını da bağlasın. Sonra gelseydi zekâ, bir
      // saniye sonra müttefiki olacak aktöre saldırmayı planlar ve emri kapıda
      // (`hareketGecerliMi`) reddedilirdi — hamle hakkı boşa yanardı.
      const dip = diplomasiKarari(d, aktorId, kisilikler, satirlar);
      d = dip;

      // SAVAŞ İLANI, HAREKETTEN ÖNCE (Görev 11). Barıştakine saldırılamıyor; ilan bu
      // sıranın içinde verilmezse zekânın bütün saldırı adayları kapıda reddedilir ve
      // dünya kilitlenir. Diplomasiden SONRA: bu turda ittifak kurduğu aktöre ilan
      // etmeye kalkmasın (ilan kapısı ittifakı zaten reddeder ama aday boşa yanardı).
      const ilanHedefi = savasIlaniSec(
        d,
        aktorId,
        kisilikler[aktorId],
        (d.rastgele.tohum + d.tur) >>> 0
      );
      if (ilanHedefi) {
        const ilan = savasIlanEt(d, aktorId, ilanHedefi);
        if (ilan.ok) {
          d = ilan.durum;
          for (const olay of ilan.olaylar) satirlar.push({ tip: 'diplomasi', aktorId, ...olay });
        }
      }

      // ---- HAREKET KARARLARI: İKİ GEÇİŞ (Görev 11 · Görev 15'te sadeleşti) ----
      // Zırhlının iki hamle hakkı var, ikinci hamle FETHETTİĞİ parçadan veriliyor. Hamle
      // anında çözüldüğü için ikinci geçiş artık gerçek haritaya bakıyor: birinci geçişte
      // alınan parçalar zaten aktörün toprağı olmuş oluyor, ayrı bir "zincir havuzu"
      // kurgusuna gerek kalmadı. Oyuncu da tam olarak bunu yapıyor.
      //
      // Tohum İKİ GEÇİŞTE FARKLI (+1): aynı tohumla aynı gürültü çıkar ve ikinci geçiş
      // birincinin kopyası gibi davranırdı. Yine belirlenimci — kayıt aynı, sonuç aynı.
      for (let gecis = 0; gecis < 2; gecis++) {
        const karar = zekaEmirleri(
          d,
          aktorId,
          kisilikler[aktorId],
          (d.rastgele.tohum + d.tur + gecis) >>> 0,
          zorluk
        );
        if (karar.hareketler.length === 0) break;
        for (const h of karar.hareketler) {
          // SON SÖZ OYUNCUNUN DOĞRULAMASINDA: `hamleUygula` zekâ için de aynı kapıdan
          // geçiyor (`emirEkle` → `hareketGecerliMi`) ve hemen çözüyor.
          // Satırları BURADA TOPLAMIYORUZ: `hamleUygula` hepsini tur günlüğüne yazıyor ve
          // `turuBitir` raporu oradan kuruyor. İki yerde toplamak aynı muharebeyi tur
          // raporunda iki kez gösterirdi.
          const s = hamleUygula(d, aktorId, h.kaynak, h.hedef, h.birlikler);
          if (s.ok) d = s.durum;
        }
      }
    }
  }

  return { durum: d, satirlar };
}
