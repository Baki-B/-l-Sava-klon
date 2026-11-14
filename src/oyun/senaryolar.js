// KAPSAMLAR — oyunun hangi illerde geçtiği (Görev 03 §7 Adım 2, Görev 09'da genişletildi).
//
// Kapsam = oyuna dahil il listesi. Parçalar illerden türetilir; ayrı liste tutulmaz.
// Kapsam dışı kalan yerler haritada SOLUK görünür ve seçilemez.
//
// ---- LİSTE BURADA DEĞİL, `DENGE.MOD.KAPSAMLAR`TA (Görev 09 / Adım 0) ----
//
// Görev 03'te bu dosyanın kendi tablosu vardı (iki satır: turkiye + karadeniz). Görev 09
// mod seçim ekranını getirince aynı liste `DENGE.MOD.KAPSAMLAR`ta da gerekti — ve iki
// kopya, projenin dört görevdir tekrarladığı tuzağın ta kendisi (§10/4: aynı kural iki
// yerde tutulmaz). Ayrışsalardı bedeli sinsi olurdu: mod seçim ekranı bir listeyi gösterip
// oyun BAŞKA bir kapsamı kurardı ve hiçbir yerde hata çıkmazdı.
//
// Liste artık tek yerde ve `veri-dogrula.js` bölge adlarının `iller.json` ile tuttuğunu
// denetliyor. Bu dosyada kalan tek şey KAPSAM HESABI — yani listeyi il ve parça
// kimliklerine çeviren fonksiyon.
//
// Karadeniz ayrıca TEST aracı olarak kullanılmaya devam ediyor: 181 parçada hata aramak
// zor, 31 parçada kolay.

import { DENGE } from '../denge.js';
import { ILLER, PARCALAR } from './veri.js';

// { anahtar: {...} } biçiminde erişim — çağıranların dizide arama yapmasına gerek kalmasın.
export const SENARYOLAR = {};
for (const k of DENGE.MOD.KAPSAMLAR) SENARYOLAR[k.anahtar] = k;

// Kapsamın il ve parça listesini hesaplar.
//
// SAYILAR KODA YAZILMIYOR, BURADAN SAYILIYOR. Mod seçim ekranı "Karadeniz · 18 il ·
// 31 parça" yazacak ve o sayılar bu fonksiyondan gelecek — ekranda görünen kapsam ile
// oyunun gerçekten kurduğu kapsam ayrışamasın (görev belgesi §Adım 5/1).
export function senaryoKapsami(anahtar) {
  const s = SENARYOLAR[anahtar];
  if (!s) {
    const gecerli = Object.keys(SENARYOLAR).join(', ');
    throw new Error(
      'Bilinmeyen kapsam: "' +
        anahtar +
        '". src/denge.js içindeki MOD.KAPSAMLAR şunlardan birini tanıyor: ' +
        gecerli
    );
  }

  const kapsamIller = Object.keys(ILLER)
    .filter((kod) => s.bolge === null || ILLER[kod].bolge === s.bolge)
    .sort();

  const ilKumesi = new Set(kapsamIller);
  const kapsamParcalar = Object.keys(PARCALAR).filter((pid) => ilKumesi.has(PARCALAR[pid].kod));

  return {
    anahtar: s.anahtar,
    ad: s.ad,
    varsayilanOyuncu: s.varsayilanOyuncu,
    kapsamIller,
    kapsamParcalar,
  };
}

// ---- TUR SINIRI (Görev 09 / Adım 0) ----
//
// Baki süre verdi, tur değil (gerekçesi `DENGE.MOD` bloğunda). Süreyi tura çeviren hesap
// TEK YERDE burada: mod seçim ekranı, tur çubuğundaki hedef göstergesi ve kazanma kontrolü
// üçü de bunu çağıracak. Üçü ayrı hesaplasa, ekranda yazan sınır ile maçı bitiren sınır
// ayrışabilirdi.
//
//     turSiniri = TABAN + PARCA_BASINA × kapsamdaki parça sayısı
//
// Kapsama göre ölçekleniyor çünkü aynı mod hem 181 parçalık Türkiye'de hem 22 parçalık
// Güneydoğu'da oynanacak.
// SINIRSIZ MOD (2026-08-08): fetih ve %50 hâkimiyet artık tur sınırı tanımıyor. Infinity
// dönmek, çağıranların hiçbirini değiştirmeden işi görüyor — `durum.tur > Infinity` hiçbir
// zaman doğru olmaz, yani "süre doldu" dalı kendiliğinden ölü kalır. Ekranda kalan tur
// yazan yer (`mod.js hedefDurumu`) sonsuzluğu ayrıca sorup satırı kısaltıyor.
export function modTurSiniri(modTipi, kapsamAnahtari) {
  const t = DENGE.MOD.TIPLER[modTipi];
  if (!t) throw new Error('Bilinmeyen mod: "' + modTipi + '"');
  if (t.SINIRSIZ) return Infinity;
  const parca = senaryoKapsami(kapsamAnahtari).kapsamParcalar.length;
  return Math.round(t.TABAN + t.PARCA_BASINA * parca);
}

// Kazanmak için gereken parça sayısı. `puan` modunda eşik YOK (sıralama belirler) → null.
export function modKazanmaEsigi(modTipi, kapsamAnahtari) {
  const t = DENGE.MOD.TIPLER[modTipi];
  if (!t) throw new Error('Bilinmeyen mod: "' + modTipi + '"');
  if (t.ESIK_ORANI === null) return null;
  return Math.ceil(t.ESIK_ORANI * senaryoKapsami(kapsamAnahtari).kapsamParcalar.length);
}
