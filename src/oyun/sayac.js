// MAÇ SAYAÇLARI (Görev 12 / Adım 11).
//
// Maç sonu istatistiği ve başarımların ikisi de "bu maçta ne oldu" sorusuna bakıyor ve
// oyunun hiçbir yerinde o soru cevaplanmıyordu: tur raporu YALNIZCA O TURU biliyor,
// bittiğinde de siliniyor (`sonTurRaporu` kayda hiç girmiyor).
//
// ---- SAYAÇ TURA GÖRE İŞLER, OLAYA GÖRE DEĞİL ----
// Her tur sonunda rapor bir kez taranıyor ve sayaçlar artıyor. Olay olay tetiklemek
// (muharebe biterken sayaç artırmak) motorun içine ikinci bir sorumluluk sokardı; motor
// çözer, sayaç okur.
//
// ---- YALNIZCA OYUNCUNUN SAYAÇLARI ----
// 81 aktör için sayaç tutmak kaydı şişirirdi ve hiçbir yerde kullanılmıyor. Rakiplerin
// neyi kaç kez yaptığı oyuncuya gösterilmiyor.

import { DENGE } from '../denge.js';
import { PARCALAR } from './veri.js';

// Yeni maçın sıfır noktası. `baslangicParca` kurulumda yazılıyor: "tek bölgeli ille
// başlayıp kazan" mührü buna bakıyor ve maç ilerledikçe öğrenilemez.
export function yeniSayaclar(baslangicParca) {
  return {
    tur: 0,
    emir: 0,
    savas: 0,
    kazanilanSavas: 0,
    kaybedilenSavas: 0,
    bozgun: 0,
    fetih: 0,
    kayipBolge: 0,
    baskinZaferi: 0,
    kayipsizZafer: 0,
    daglikZafer: 0,
    duelloZaferi: 0,
    savunmaSerisi: 0,
    enUzunSavunmaSerisi: 0,
    enCokTurFetih: 0,
    enCokTurUretim: 0,
    toparlanan: 0,
    kaybedilenBirlik: 0,
    dusurulenBirlik: 0,
    ilan: 0,
    anlasma: 0,
    ateskes: 0,
    ihanet: 0,
    // ÖDÜL KULLANIMI (Görev 19 / Adım 1): bu maçta kaç ödüllü reklam ödülü kullanıldı.
    // Maç sayaçlarının yanında çünkü maça ait: yeni maç açınca sıfırlanmalı. TEMİZ ZAFER
    // ve KİRLİ ZAFER mühürleri bu sayıya bakacak.
    odul: 0,
    baslangicParca: baslangicParca || 0,
    enDusukParca: baslangicParca || 0,
  };
}

// Tur raporundan sayaçları ilerletir. SAF: girdiyi değiştirmez, yenisini döner.
//
// `parcaSayisi` o turun SONUNDAKİ bölge sayın — "tek bölgeye düştükten sonra kazan"
// mührü bunun en düşüğüne bakıyor.
export function sayaclariIlerlet(sayaclar, rapor, ben, parcaSayisi, buTurUretim) {
  const s = { ...(sayaclar || yeniSayaclar(parcaSayisi)) };
  s.tur += 1;

  // Bu turda kaç birlik ürettim: `buTurUretim` il başına sayaç tutuyor (sanayi sınırı
  // için), tur sonunda sıfırlanıyor — o yüzden BURADA okunmalı.
  // Yapı: `buTurUretim[aktorId][ilKodu] = adet` (`ordu.js`).
  let uretim = 0;
  const benimUretim = (buTurUretim || {})[ben] || {};
  for (const il of Object.keys(benimUretim)) uretim += benimUretim[il] || 0;
  if (uretim > s.enCokTurUretim) s.enCokTurUretim = uretim;

  let turFetih = 0;
  for (const ham of (rapor && rapor.satirlar) || []) {
    // Satırın sahibi: `sahip` (çözüm) ya da `aktorId` (hamle kapısı) — ikisinden biri yeter.
    const satir = ham.sahip ? ham : { ...ham, sahip: ham.aktorId };
    if (satir.tip === 'muharebe') {
      const saldiranBen = satir.sahip === ben;
      const savunanBen = satir.savunanId === ben;
      if (!saldiranBen && !savunanBen) continue;

      s.savas += 1;
      const kazandim =
        (saldiranBen && satir.kazanan === 'saldiran') ||
        (savunanBen && satir.kazanan === 'savunan');

      if (kazandim) {
        s.kazanilanSavas += 1;
        if (satir.baskin) s.baskinZaferi += 1;
        if (satir.duelloBasladi) s.duelloZaferi += 1;
        // Dağlık zaferi yalnızca SALDIRAN için sayılıyor: dağda savunup kazanmak
        // arazinin işi, "dağ adamı" olmak saldırıp kırmak.
        if (saldiranBen && satir.arazi === 'daglik') s.daglikZafer += 1;
        if (saldiranBen && kayipYok(satir)) s.kayipsizZafer += 1;
        if (savunanBen) {
          s.savunmaSerisi += 1;
          if (s.savunmaSerisi > s.enUzunSavunmaSerisi) s.enUzunSavunmaSerisi = s.savunmaSerisi;
        }
      } else {
        s.kaybedilenSavas += 1;
        if (savunanBen) s.savunmaSerisi = 0;
      }
      if (satir.bozgun || satir.sebep === 'bozgun') {
        // Bozgun mührü KARŞI TARAFI bozguna uğratmayı sayıyor.
        if (kazandim) s.bozgun += 1;
      }
    }

    // Fetih: hem muharebeyle hem boş parçaya girişle olur. Alan adı `fethedildi`
    // (`cozum.js`) — "fetih" adında bir satır alanı YOK, o yalnızca özet sayacında var.
    if (satir.fethedildi && satir.sahip === ben) {
      s.fetih += 1;
      turFetih += 1;
    }
    // Kayıp: savunan ordum yenildi YA DA boş parçama yüründü (`eskiSahip`; savunan ordu
    // olmayınca `savunanId` yok — 2026-09-24'e kadar bu kayıplar sayılmıyordu).
    if (
      satir.fethedildi &&
      satir.sahip !== ben &&
      (satir.savunanId === ben || satir.eskiSahip === ben)
    )
      s.kayipBolge += 1;
  }

  if (turFetih > s.enCokTurFetih) s.enCokTurFetih = turFetih;
  if (typeof parcaSayisi === 'number' && parcaSayisi < s.enDusukParca) s.enDusukParca = parcaSayisi;
  return s;
}

function kayipYok(satir) {
  const k = satir.saldiranKayip || satir.kayiplar;
  if (!k) return false;
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) toplam += k[tur] || 0;
  return toplam === 0;
}

// Diplomasi eylemleri turdan bağımsız olduğu için sayaçları KENDİ yerlerinde artırıyorlar
// (`diplomasi.js`). Tek satırlık yardımcı: alan yoksa sayaç hiç doğmasın diye.
export function sayacArtir(durum, alan, miktar) {
  const s = durum.sayaclar;
  if (!s) return durum;
  return {
    ...durum,
    sayaclar: { ...s, [alan]: (s[alan] || 0) + (miktar === undefined ? 1 : miktar) },
  };
}

// Maç sonu özeti — `OyunSonu` ekranının okuduğu satırlar. Sayı yerine CÜMLE üretmiyor;
// etiket ve değer veriyor, cümleyi ekran kuruyor.
export function macOzeti(durum) {
  const s = durum.sayaclar || yeniSayaclar(0);
  const benim = Object.values(durum.parcaSahipligi).filter((x) => x === durum.oyuncuAktorId).length;
  return [
    ['SÜRE', s.tur + ' tur'],
    ['BÖLGE', benim + ' bölge'],
    ['SAVAŞ', s.savas + ' savaş · ' + s.kazanilanSavas + ' kazanıldı'],
    ['FETİH', s.fetih + ' bölge alındı · ' + s.kayipBolge + ' kaybedildi'],
    ['DİPLOMASİ', s.anlasma + ' anlaşma · ' + s.ilan + ' savaş ilanı · ' + s.ateskes + ' ateşkes'],
    ['EN İYİ TUR', s.enCokTurFetih + ' bölge tek turda'],
  ];
}

// Parça kimliğinden il kodu — sayaçların il bazlı sorgusu gerekirse (şimdilik yok).
export function ilKodu(parcaId) {
  const p = PARCALAR[parcaId];
  return p ? p.kod : null;
}
