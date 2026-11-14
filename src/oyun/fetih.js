// FETİH — parça ve il el değiştirmesi (Görev 05 / Adım 3 — tasarım §7, §13.2).
//
// İL SAHİPLİĞİ SAKLANMAZ, TÜRETİLİR (§6.2). "İlin sahibi" diye bir alan yoktur; bir il
// ancak bütün parçaları aynı aktördeyse onundur. Bu dosya o türetmeyi yapar ve fetih
// anında "il de tamamlandı mı" sorusunu cevaplar.
//
// FETİH GANİMETİ (görev belgesi §4, boşluk 8): §13.2/§14 "fetih nüfus oranı %60" diyor ama
// karşılığını tanımlamıyordu. Doldurma: fethedilen parçanın NÜFUS PAYININ %60'ı kadar
// TEK SEFERLİK nüfus kazanılır — seferberlik. Ekonomi ganimeti YOKTUR (yağmalanan sanayi
// çalışmaz); parçanın kalıcı geliri zaten tur döngüsünde sahibine yazılıyor.
// Oran `DENGE.FETIH.NUFUS_ORANI` — kartopu hızının ana düğmesi (§14).

import { DENGE } from '../denge.js';
import { PARCALAR } from './veri.js';
import { parcaGeliri } from './uretim.js';
import { duelloGanimetCarpani } from './rekabet.js';

// Bu ilin senaryoya dahil BÜTÜN parçaları bu aktörde mi?
export function ilTamamMi(durum, ilKodu, aktorId) {
  let bulundu = false;
  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (PARCALAR[pid].kod !== ilKodu) continue;
    bulundu = true;
    if (durum.parcaSahipligi[pid] !== aktorId) return false;
  }
  return bulundu;
}

// Bir parçanın fethedilmesiyle kazanılacak tek seferlik nüfus.
//
// TAM SAYIYA YUVARLANIR (2026-07-31, Baki: "oyunda ondalıklı hiçbir şey istemiyorum").
// Oran %60 olduğu için ham sonuç kesirli çıkıyordu (3 nüfuslu parça → 1.8) ve havuza
// kesirli giriyordu; savaş odasında "+1.8 nüfus seferberlik" diye görünen sayı buydu.
// EN AZ 1: bir parçayı fethetmek her zaman gözle görülür bir şey kazandırmalı — payı en
// küçük parça bile (nüfusu 1) ganimetsiz kalmasın, yoksa "aldım ama hiçbir şey olmadı".
export function fetihGanimeti(parcaId) {
  const ham = parcaGeliri(parcaId).nufus * DENGE.FETIH.NUFUS_ORANI;
  return ham > 0 ? Math.max(1, Math.round(ham)) : 0;
}

// Parçayı el değiştirtir, ganimeti aktörün havuzuna ekler ve ilin tamamlanıp
// tamamlanmadığını bildirir. YENİ durum döndürür.
//
// Zaten o aktördeyse hiçbir şey olmaz — ganimet de verilmez. (Fetih ganimeti parça HER EL
// DEĞİŞTİRDİĞİNDE bir kez verilir: aynı parça kaybedilip geri alınırsa iki kez kazanılır.
// Bu bilinçli — sürekli el değiştiren cephe, her seferinde yeni bir seferberlik demektir —
// ve `testler/hareket.test.js`'te kayıtlı.)
export function parcayiFethet(durum, parcaId, aktorId) {
  if (durum.parcaSahipligi[parcaId] === aktorId)
    return {
      durum,
      fethedildi: false,
      ganimet: 0,
      ilTamamlandi: false,
      ilKaybedildi: false,
      eskiSahip: aktorId,
      ilKodu: PARCALAR[parcaId].kod,
    };

  const ilKodu = PARCALAR[parcaId].kod;
  const oncekiTamdi = ilTamamMi(durum, ilKodu, aktorId);
  const aktor = durum.aktorler[aktorId];

  // ---- İLİN KAYBI (Görev 08 / Adım 2) ----
  // Fetih anına kadar oyunun kaydettiği tek şey KİMİN kazandığıydı; kimin KAYBETTİĞİ
  // hiçbir yere yazılmıyordu. Hissiyat katmanının en yüklü ikinci anı bu (§4.1/7–8:
  // "kayıp acıtmıyor", "anıtlaşan an yok"), o yüzden burada ölçülüyor:
  // parça el değiştirmeden ÖNCE eski sahibinin ili tamsa, bu hamle o ili ona kaybettiriyor.
  const eskiSahip = durum.parcaSahipligi[parcaId];
  const ilKaybedildi = !!eskiSahip && ilTamamMi(durum, ilKodu, eskiSahip);

  // ---- KUTSAL SAVAŞ GANİMETİ (Görev 08 / §11 "kazanana ek ödül") ----
  // Düellodaki rakibinden toprak alan taraf fazladan ganimet alır. `NUFUS_ORANI`'na
  // dokunulmuyor, üstüne biniyor — kartopu hızının ana düğmesi yerinde kalsın (§14).
  // TAM SAYIYA yuvarlanıyor: "oyunda ondalıklı hiçbir şey istemiyorum" (2026-07-31).
  const carpan = duelloGanimetCarpani(durum, aktorId, eskiSahip);
  const ganimet =
    carpan === 1 ? fetihGanimeti(parcaId) : Math.round(fetihGanimeti(parcaId) * carpan);

  const yeni = {
    ...durum,
    parcaSahipligi: { ...durum.parcaSahipligi, [parcaId]: aktorId },
    aktorler: aktor
      ? { ...durum.aktorler, [aktorId]: { ...aktor, nufusHavuzu: aktor.nufusHavuzu + ganimet } }
      : durum.aktorler,
    // EL DEĞİŞTİREN PARÇA O TUR GELİR VERMEZ (Görev 15). Liste bir sonraki gelir hesabına
    // kadar yaşar, `turDongusu.js` geliri yazdıktan hemen sonra boşaltır. Eskiden bu kural
    // aşamaların sırasından bedava geliyordu (gelir çözümden önceydi); hamle tur ortasında
    // çözüldüğü için artık açıkça izleniyor. Tek seferlik NÜFUS GANİMETİ bundan ayrıdır ve
    // hemen verilir — o fethin kendi ödülü, parçanın geliri değil.
    buTurFethedilen: (durum.buTurFethedilen || []).concat([parcaId]),
  };

  return {
    durum: yeni,
    fethedildi: true,
    ganimet,
    ilKodu,
    eskiSahip,
    ilKaybedildi,
    ilTamamlandi: !oncekiTamdi && ilTamamMi(yeni, ilKodu, aktorId),
  };
}
