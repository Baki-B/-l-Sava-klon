// BÜTÇE — TEK HAVUZ, ÜÇ MUSLUK (Görev 06 / görev belgesi §9/7).
//
// Görev 06'dan itibaren ekonomi üç ayrı yere gidiyor:
//   1. YENİ BİRİM   — anında düşer (`ordu.js birimUret`)
//   2. TOPLANMA     — emir verilir, TUR SONUNDA düşer (Soru 2 → cevap B)
//   3. ARAŞTIRMA    — pay ayrılır, TUR SONUNDA düşer (Soru 3 → cevap A)
//
// İkisi tur sonunda düştüğü için havuzun kendisine bakmak YANILTICI: oyuncu 10 ekonomiyi
// araştırmaya ayırıp aynı 10 ekonomiyle zırhlı basabilir, tur sonunda hesap tutmazdı.
// Bu yüzden "harcanabilir bütçe" TEK YERDE hesaplanıyor — burada. Üç musluk üç ayrı yerde
// denetlenseydi biri kaçardı; görev belgesi bunu ayrı bir tuzak olarak yazmıştı.
//
// BAĞIMLILIĞI BİLEREK YOK. Bu dosya yalnızca `denge.js`'i tanır; emirlerin bedeli emrin
// KENDİSİNDE yazılı olduğu için `toplanma.js`'i ithal etmesi gerekmiyor. Etseydi
// ordu.js → butce.js → toplanma.js → ordu.js döngüsü doğardı. Bedelin emirde yazılı
// olmasının ikinci faydası: emir listesi zaten o sayıyı gösteriyor, iki yerde hesaplanmıyor.

import { DENGE } from '../denge.js';

// Bir aktörün ham havuzu — KESİRLİ (§6.4). Karşılaştırmalar için değil, hesap için.
export function hamHavuz(durum, aktorId) {
  const a = durum.aktorler && durum.aktorler[aktorId];
  return { nufus: (a && a.nufusHavuzu) || 0, ekonomi: (a && a.ekonomiHavuzu) || 0 };
}

// Bu tur araştırmaya ayrılmış ekonomi (henüz düşmedi).
export function ayrilanArastirma(durum, aktorId) {
  const a = durum.arastirma && durum.arastirma[aktorId];
  return Math.max(0, (a && a.buTurAyrilan) || 0);
}

// Bekleyen toplanma emirlerinin toplam bedeli (henüz düşmedi).
export function ayrilanToplanma(durum, aktorId) {
  let nufus = 0,
    ekonomi = 0;
  for (const e of durum.emirler || []) {
    if (e.tip !== 'toplanma' || e.sahip !== aktorId || !e.bedel) continue;
    nufus += e.bedel.nufus;
    ekonomi += e.bedel.ekonomi;
  }
  return { nufus, ekonomi };
}

// HARCANABİLİR BÜTÇE — ekranların ve `ordu.js`'in tek doğru kaynağı.
// AŞAĞI YUVARLANIR: ekranda görünen sayı ile harcanabilen sayı aynı olsun (Görev 04 kuralı).
export function kullanilabilirButce(durum, aktorId) {
  const havuz = hamHavuz(durum, aktorId);
  const toplanma = ayrilanToplanma(durum, aktorId);
  return {
    nufus: Math.max(0, Math.floor(havuz.nufus) - toplanma.nufus),
    ekonomi: Math.max(
      0,
      Math.floor(havuz.ekonomi) - toplanma.ekonomi - ayrilanArastirma(durum, aktorId)
    ),
  };
}

// Araştırmaya ayrılabilecek EN ÇOK ekonomi. Ayrılmış olan geri sayılıyor, çünkü oyuncu
// sayacı aşağı da çekebilmeli: "4 ayırdım, 6'ya çıkarabilir miyim" sorusunun cevabı
// mevcut ayrımı yok sayarak verilir.
export function arastirmayaAyrilabilir(durum, aktorId) {
  return kullanilabilirButce(durum, aktorId).ekonomi + ayrilanArastirma(durum, aktorId);
}

// Bir bedel bu bütçeye sığıyor mu? Dönen: { ok } veya { ok: false, kod: 'nufus' | 'ekonomi' }
export function yetiyorMu(butce, bedel) {
  if (bedel.nufus > butce.nufus) return { ok: false, kod: 'nufus' };
  if (bedel.ekonomi > butce.ekonomi) return { ok: false, kod: 'ekonomi' };
  return { ok: true };
}

// Havuzdan bedel düşülmüş YENİ aktör tablosu. Havuz kesirli kalır; bedel tam sayıdır.
// Havuzun altına inilmez — tur sonunda iki musluk birden akarken eksiye düşmesin.
export function havuzdanDus(aktorler, aktorId, bedel) {
  const a = aktorler[aktorId];
  if (!a) return aktorler;
  return {
    ...aktorler,
    [aktorId]: {
      ...a,
      nufusHavuzu: Math.max(0, a.nufusHavuzu - (bedel.nufus || 0)),
      ekonomiHavuzu: Math.max(0, a.ekonomiHavuzu - (bedel.ekonomi || 0)),
    },
  };
}
