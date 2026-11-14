// ÜRETİM HESABI — oyunun ana formülü (tasarım §4.1 ve §7).
//
// TAM SAYI KURALI (2026-07-26, Baki'nin kararı):
// Parça getirileri KESİRLİ DEĞİL, TAM SAYIDIR. "+1.8 nüfus" yerine "+2 nüfus" yazar.
// Sebep: oyuncu ondalık sayıyla düşünmesin; bir parçanın değeri tek bakışta anlaşılsın.
//
// İlin statı parçalarına şöyle bölünür (`parcaDegerleri`):
//   1. Oransal dağıtım — en büyük artık yöntemi. İl statı, parçaların paylarına göre
//      tam sayılara bölünür; toplam ilin statına EŞİT kalır.
//   2. En az 1 — hiçbir parça 0 üretmez. Sıfır kalan parçaya, o an en çok üreten
//      parçadan 1 aktarılır (toplam yine değişmez).
//   3. Tekdüzelik — payı büyük olan parça, payı küçükten ASLA az üretmez.
//      (Değerler büyükten küçüğe sıralanıp paylara aynı sırayla dağıtılır.)
//
// SONUÇ (81 ilin tamamında doğrulandı, `testler/uretim.test.js`):
//   • Nüfusta toplam üretim 353 → 353, ekonomide 326 → 326: hiç kayıp/kazanç yok.
//   • İSTİSNA KALMADI. Eskiden Erzurum ekonomide +1 sapıyordu (5 parça / stat 4);
//     Görev 03B yeniden bölümlemesinde Erzurum 4 parçaya indi ve sapma kayboldu.
//     Kural 2 yine de duruyor: bir ilin parça sayısı statını geçerse toplam 1 artar.
//   • Hiçbir parça 0 üretmiyor, hiçbir yerde büyük parça küçükten az üretmiyor.
//
// Havuzlar yine de KESİRLİ saklanır (§6.4): üretim çarpanı ileride 1.5 gibi bir değere
// çekilirse kesirler geri gelir ve yuvarlanarak kaybedilmemeleri gerekir.

import { DENGE } from '../denge.js';
import { ILLER, PARCALAR } from './veri.js';

// Bir ilin statını parçalarına tam sayı olarak böler. Yukarıdaki üç kural sırayla uygulanır.
// paylar: parçaların payları (toplamı 1.00), stat: ilin o statı (1–10).
//
// `enAzBir` (varsayılan true) 2. kuralı açar/kapatır. Kapatan tek yer EĞİTİM (Görev 06):
// o kuralın gerekçesi "hiçbir parça 0 ÜRETMEZ", yani akan bir kaynak hakkında. Eğitim
// akan bir kaynak değil, elde tutulan bir nitelik — bir parçanın eğitim katkısının 0
// olması "değersiz parça" hissi doğurmaz. Açık bırakılsaydı, parça sayısı statından çok
// olan 9 ilde toplam şişerdi (318 → 331) ve en çok da eğitimi ZAYIF iller kazanırdı
// (Şanlıurfa 1 → 4). Bu, eğitim statının ayırt etme işini tam tersine çevirirdi.
export function parcaDegerleri(paylar, stat, enAzBir = true) {
  const n = paylar.length;
  if (n === 0) return [];

  // 1) Oransal dağıtım — en büyük artık yöntemi
  const ham = paylar.map((p) => p * stat);
  const deger = ham.map((x) => Math.floor(x));
  const eksik = stat - deger.reduce((a, b) => a + b, 0);
  const artikSirasi = paylar
    .map((p, i) => ({ i, artik: ham[i] - Math.floor(ham[i]), pay: p }))
    .sort((a, b) => b.artik - a.artik || b.pay - a.pay || a.i - b.i);
  for (let k = 0; k < eksik; k++) deger[artikSirasi[k % n].i]++;

  // 2) En az 1 — sıfır kalan parçaya en çok üretenden aktar.
  //    Aktaracak yer yoksa (stat < parça sayısı) ilin toplamı 1 artar; nadir istisna.
  if (enAzBir)
    for (let i = 0; i < n; i++) {
      if (deger[i] > 0) continue;
      let enBuyuk = -1;
      for (let k = 0; k < n; k++)
        if (deger[k] >= 2 && (enBuyuk === -1 || deger[k] > deger[enBuyuk])) enBuyuk = k;
      if (enBuyuk >= 0) deger[enBuyuk]--;
      deger[i]++;
    }

  // 3) Tekdüzelik — büyük paylı parça küçük paylıdan az almasın.
  const buyuktenKucuge = [...deger].sort((a, b) => b - a);
  const payaGoreSira = paylar.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p || a.i - b.i);
  const sonuc = new Array(n);
  payaGoreSira.forEach((x, k) => (sonuc[x.i] = buyuktenKucuge[k]));
  return sonuc;
}

// ---- Tablo bir kez kurulur (veri değişmediği sürece sonuç hep aynı) ----
// parça kimliği -> { nufus, ekonomi, egitim } tam sayı temel değer (çarpan uygulanmamış)
const TEMEL = {};
// il kodu -> { nufus, ekonomi, egitim } o ilin parçalarının toplamı
const IL_TOPLAM = {};

// EĞİTİM, ÜÇÜNCÜ PARÇA DEĞERİ (Görev 06 / Soru 3 → Baki'nin cevabı A, 2026-07-30).
// Yeni formül YOK: yukarıdaki üç kural (oransal dağıtım · en az 1 · tekdüzelik) eğitime
// aynen uygulanıyor, `parcaDegerleri` üçüncü kez çağrılıyor. Nüfus ve ekonomiden tek
// farkı, eğitimin bir HAVUZ doldurmaması — aktörün eğitim gücü elindeki parçaların
// toplamıdır ve araştırmanın verimini belirler (§5/3, §6). Yan faydası: eğitimli ili
// fethetmek somut bir ödül olur; Görev 06'ya kadar eğitim statı oyunda hiçbir işe yaramıyordu.
//
// EĞİTİME ÜRETİM ÇARPANI UYGULANMAZ. `URETIM_CARPANI` tur başına kaynak akışını
// hızlandıran bir düğme; eğitim akan bir kaynak değil, elde tutulan bir nitelik.
const STATLAR = ['nufus', 'ekonomi', 'egitim'];

(function tabloyuKur() {
  const ilinParcalari = {};
  for (const pid of Object.keys(PARCALAR)) {
    const kod = PARCALAR[pid].kod;
    (ilinParcalari[kod] = ilinParcalari[kod] || []).push(pid);
  }

  for (const kod of Object.keys(ilinParcalari)) {
    // Sıralı kimlik = tekrar üretilebilir sonuç (16-1, 16-2, 16-3 ...)
    const ids = ilinParcalari[kod].sort();
    const statlar = ILLER[kod].statlar;
    const toplam = {};
    for (const stat of STATLAR) {
      // Payların hangi statta hangi sütundan okunduğu: nüfus ve ekonomi parçanın kendi
      // paylarından, eğitim ise NÜFUS PAYINDAN. Parça belgesinde eğitim payı yok —
      // uydurmak yerine "insanın olduğu yerde okul vardır" varsayımıyla nüfus payı
      // kullanılıyor; alternatifi her parçaya eşit dağıtmaktı, o da ili tek tip yapardı.
      const paylar = ids.map((id) => (stat === 'egitim' ? PARCALAR[id].nufus : PARCALAR[id][stat]));
      const degerler = parcaDegerleri(paylar, statlar[stat], stat !== 'egitim');
      let t = 0;
      ids.forEach((id, i) => {
        (TEMEL[id] || (TEMEL[id] = {}))[stat] = degerler[i];
        t += degerler[i];
      });
      toplam[stat] = t;
    }
    IL_TOPLAM[kod] = toplam;
  }
})();

// Bir parçanın eğitim değeri (araştırma verimine giren sayı, §6).
export function parcaEgitimi(parcaId) {
  const t = TEMEL[parcaId];
  return t ? t.egitim : 0;
}

// Bir ilin bütün parçaları tek eldeyse o ilin verdiği toplam üretim.
// Neredeyse her zaman ilin statına eşittir (tek istisna için dosya başındaki nota bak).
export function ilUretimi(ilKodu) {
  return IL_TOPLAM[ilKodu] || { nufus: 0, ekonomi: 0 };
}

// Tek bir parçanın tur başına getirisi. Sahibi kim olursa olsun aynıdır —
// "bu parçayı alırsan" satırı da (panel) bunu kullanır.
export function parcaGeliri(parcaId) {
  const t = TEMEL[parcaId];
  if (!t) return { nufus: 0, ekonomi: 0 };
  return { nufus: t.nufus * DENGE.URETIM_CARPANI, ekonomi: t.ekonomi * DENGE.URETIM_CARPANI };
}

// Bir aktörün tur başına toplam geliri.
export function aktorGeliri(durum, aktorId) {
  let nufus = 0,
    ekonomi = 0;
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (durum.parcaSahipligi[pid] !== aktorId) continue;
    const g = parcaGeliri(pid);
    nufus += g.nufus;
    ekonomi += g.ekonomi;
  }
  return { nufus, ekonomi };
}

// Tüm aktörlerin geliri, tek geçişte. Tur döngüsü (Adım 4) bunu kullanır —
// aktör başına ayrı ayrı hesaplamak 81 aktörde gereksiz iş olurdu.
export function tumGelirler(durum) {
  const gelirler = {};
  for (const aktorId of Object.keys(durum.aktorler)) gelirler[aktorId] = { nufus: 0, ekonomi: 0 };

  // ---- EL DEĞİŞTİREN PARÇA O TUR GELİR VERMEZ (Görev 15) ----
  // Eskiden bu kural BEDAVA geliyordu: gelir çözümden önce hesaplanıyordu, yani fetih
  // olduğunda o turun geliri çoktan eski sahibine yazılmıştı. Hamle artık tur ortasında
  // çözüldüğü için kural AÇIKÇA yazılmak zorunda — yoksa oyuncu bir parçayı alıp hemen
  // ardından TURU BİTİR'e basarak aynı turda gelirini de toplardı.
  // Baki (2026-09-19): *"aldığında bir şey kazanma ama sonraki tur hâlâ o parçaya
  // sahipsen gelir kazanmalısın."*
  const yeniFethedilen = new Set(durum.buTurFethedilen || []);

  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (yeniFethedilen.has(pid)) continue;
    const sahip = durum.parcaSahipligi[pid];
    const hedef = gelirler[sahip];
    if (!hedef) continue; // sahibi oyunda olmayan parça (olmamalı, yine de güvenli tarafta kal)
    const g = parcaGeliri(pid);
    hedef.nufus += g.nufus;
    hedef.ekonomi += g.ekonomi;
  }
  return gelirler;
}

// Bir aktörün TEK BİR İLDEN aldığı gelir + o ilin kaç parçasını tuttuğu.
// Panelde "bu ilin 3/4 parçası sende, sana getirisi +X / +Y" satırı için.
export function ilGeliri(durum, ilKodu, aktorId) {
  let nufus = 0,
    ekonomi = 0,
    parca = 0,
    toplamParca = 0;

  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (PARCALAR[pid].kod !== ilKodu) continue;
    toplamParca++;
    if (durum.parcaSahipligi[pid] !== aktorId) continue;
    parca++;
    const g = parcaGeliri(pid);
    nufus += g.nufus;
    ekonomi += g.ekonomi;
  }
  return { aktorId, nufus, ekonomi, parca, toplamParca };
}
