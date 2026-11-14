// MOD VE KAZANMA KOŞULU (Görev 09 / Adım 5 · tasarım §8.1).
//
// ┌─ BAKİ'NİN KARARI (2026-08-01) — BELGEDEN FARKLI ────────────────────────────────────┐
// │ Görev belgesi modları KAPSAMA göre tanımlıyordu (Bölge · Türkiye · Serbest).        │
// │ Baki KAZANMA KOŞULUNA göre tanımladı:                                                │
// │   Fetih (tümü) · Yarım Fetih (%50) · Güç Yarışı (sınırlı turda en çok güçlenen)     │
// │ Kapsam (Türkiye / 7 coğrafi bölge) DİK EKSEN olarak duruyor — bölge modu kaybolmadı,│
// │ üç koşulun üçüyle de oynanabiliyor.                                                  │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- KAZANMA KONTROLÜ TEK YERDE (§10/4) ----
//
// `sonucKontrol` bu dosyadaki TEK bitiş kararıdır ve `turDongusu` onu TEK KEZ çağırır.
// Görev 07'nin asgari kontrolü (tüm parçalar / hiç parça) buraya taşındı; iki yerde iki
// kontrol bırakılmadı. Sebep somut: iki kontrol ayrışırsa oyun ya iki kez kazanılır ya
// da kazanıldığı hâlde devam eder, ve ikisi de kayda yazılır.

import { DENGE } from '../denge.js';
import { modTurSiniri, modKazanmaEsigi, senaryoKapsami } from './senaryolar.js';

// Yeni maçın mod kaydı. Kayda `tip` ve `kapsam` giriyor; tur sınırı ve eşik TÜRETİLİYOR
// (§7'nin kuralı: türetilebilen kaydedilmez). Böylece `DENGE.MOD` ayarlanınca süren
// maçlar da yeni sayılarla oynanıyor — sayıyı kayda yazsaydık eski maçlar yalan söylerdi.
export function modKur(tip, kapsam) {
  if (!DENGE.MOD.TIPLER[tip]) throw new Error('Bilinmeyen mod: "' + tip + '"');
  return { tip, kapsam };
}

export function modBilgisi(durum) {
  const mod = durum.mod || {
    tip: DENGE.MOD.VARSAYILAN_TIP,
    kapsam: durum.senaryo ? durum.senaryo.anahtar : DENGE.MOD.VARSAYILAN_KAPSAM,
  };
  const tanim = DENGE.MOD.TIPLER[mod.tip] || DENGE.MOD.TIPLER[DENGE.MOD.VARSAYILAN_TIP];
  return {
    tip: mod.tip,
    kapsam: mod.kapsam,
    ad: tanim.ad,
    turSiniri: modTurSiniri(mod.tip, mod.kapsam),
    esik: modKazanmaEsigi(mod.tip, mod.kapsam),
    toplamParca: senaryoKapsami(mod.kapsam).kapsamParcalar.length,
  };
}

// Aktör başına parça sayısı — tek geçişte. Kazanma kontrolünün ve sıralamanın ortak girdisi.
function parcaSayimi(durum) {
  const sayim = {};
  for (const sahip of Object.values(durum.parcaSahipligi)) sayim[sahip] = (sayim[sahip] || 0) + 1;
  return sayim;
}

// ---- HEDEF GÖSTERGESİ (§6/12) ----
// "Görünmeyen hedef hedef değildir." Tur çubuğundaki tek satır ilerleme bunu okuyor.
// Kazanma kontrolüyle AYNI sayılardan besleniyor: ekranda yazan ilerleme ile maçı bitiren
// ilerleme ayrışamaz.
export function hedefDurumu(durum) {
  const m = modBilgisi(durum);
  const sayim = parcaSayimi(durum);
  const benim = sayim[durum.oyuncuAktorId] || 0;
  // SINIRSIZ MODDA "kalan tur" diye bir şey yok (2026-08-08). `kalanTur` null oluyor ve
  // şeritteki tur kısmı hiç yazılmıyor — "Infinity TUR KALDI" yazmak yerine sustuk.
  const sinirsiz = !isFinite(m.turSiniri);
  const kalanTur = sinirsiz ? null : Math.max(0, m.turSiniri - durum.tur + 1);
  const turMetni = sinirsiz ? '' : ' · ' + kalanTur + ' TUR KALDI';

  if (m.esik === null) {
    // GÜÇ YARIŞI: eşik yok, sıralama var. Oyuncuya "kaçıncı sıradasın" söyleniyor —
    // "13 parçan var" tek başına iyi mi kötü mü belli değil.
    const sirali = Object.values(sayim).sort((a, b) => b - a);
    const sira = sirali.indexOf(benim) + 1;
    return {
      ...m,
      benim,
      kalanTur,
      sira,
      toplamAktor: sirali.length,
      // MOD ADI METNE GİRMİYOR (2026-08-01). Oyuncu modu maç kurulurken zaten seçti;
      // her tur "Güç Yarışı:" diye tekrarlamak şeridi uzatıyor ve hiçbir şey söylemiyordu.
      // Kalan şey iki gerçek sayı: kaçıncı sıradasın ve ne kadar vaktin var.
      metin: sira + '. SIRADASIN' + turMetni,
    };
  }
  return {
    ...m,
    benim,
    kalanTur,
    // Eşik sayısı modu zaten söylüyor (181 tam fetih, 91 yarısı) — ad tekrar edilmiyor.
    metin: benim + ' / ' + m.esik + ' BÖLGE' + turMetni,
  };
}

// ---- SONUÇ KONTROLÜ — TEK YER ----
//
// Dönen: null (maç sürüyor) veya { sonuc: 'kazandi'|'yenildi', sebep }
//
// SIRA ÖNEMLİ: önce YENİLGİ, sonra ZAFER, en son SÜRE. Oyuncu elenmişse tur sınırı ya da
// eşik hiç sorulmamalı — elenmiş oyuncu "toprakla kazanamaz".
export function sonucKontrol(durum) {
  const m = modBilgisi(durum);
  const sayim = parcaSayimi(durum);
  const benim = sayim[durum.oyuncuAktorId] || 0;

  // 1) YENİLGİ: elinde hiç parça kalmadı. Görev 07'nin asgari kontrolü buydu ve buraya
  //    taşındı — ikinci bir yerde kalmadı.
  if (benim === 0) return { sonuc: 'yenildi', sebep: 'elendin' };

  // 2) ZAFER: modun eşiği tutturuldu.
  if (m.esik !== null && benim >= m.esik) return { sonuc: 'kazandi', sebep: 'esik' };

  // 2b) RAKİBİN ZAFERİ (Görev 20 · denetim 2026-09-23 ⚠7): eşikli modda hedefe senden önce
  //     ulaşan bir rakip varsa maç biter. Eskiden yalnızca OYUNCUNUN sayısına bakılıyordu;
  //     bir bot haritanın yarısını alsa bile maç sürüyor, oyuncu ancak elinde tek bölge
  //     kalmayınca kaybediyordu — kaybedilmiş maçı sonuna kadar sürüklemek. Sıra önemli:
  //     oyuncunun zaferi önce bakılıyor, eşitlikte (çift sayılı kapsamda ikisi birden
  //     yarıda) oyuncu kazanır — süre dolunca beraberliğin kuralıyla aynı.
  //     Fetihte bu dal fiilen çalışmaz: rakip her yeri aldıysa oyuncu zaten elenmiştir.
  if (m.esik !== null && DENGE.MOD.RAKIP_ESIGI_BITIRIR) {
    for (const id of Object.keys(sayim).sort()) {
      if (id !== durum.oyuncuAktorId && sayim[id] >= m.esik)
        return { sonuc: 'yenildi', sebep: 'rakip', kazanan: id };
    }
  }

  // 3) SÜRE DOLDU. Tanımsız bırakılamaz: ölçüm (`veri/mod-esik-olcum.md`) dünyanın %69'da
  //    kilitlendiğini gösterdi, yani "kimse kazanamadan süre doldu" GERÇEK bir ihtimal.
  //    `DENGE.MOD.SURE_DOLUNCA: 'toprak'` → en çok parçası olan kazanır (Güç Yarışı'nın
  //    kuralı; ikinci bir bitiş mantığı yazılmıyor).
  if (durum.tur > m.turSiniri) {
    if (DENGE.MOD.SURE_DOLUNCA === 'yenilgi') return { sonuc: 'yenildi', sebep: 'sure' };
    const enBuyuk = Math.max(...Object.values(sayim));
    // BERABERLİK OYUNCUNUN LEHİNE: eşit toprakla süre dolduysa oyuncu kazanır. Keyfî bir
    // tercih değil — beraberlik ekranı için üçüncü bir sonuç türü ve üçüncü bir kart
    // gerekirdi, oysa fark tek bir parçalık ve oyuncu o maçı zaten oynadı.
    return benim >= enBuyuk
      ? { sonuc: 'kazandi', sebep: 'toprak' }
      : { sonuc: 'yenildi', sebep: 'toprak' };
  }
  return null;
}

// Modun kendi zafer cümlesi. Ortak bir kalıba ("X tamamlandı") sıkıştırılmadı: üç modun
// kazanma hissi farklı ve cümle onu taşımalı. Yeni bir mod eklenirse buraya bir satır.
const ZAFER_CUMLESI = {
  fetih: 'Haritadaki bütün bölgeler senin oldu. Karşında duracak kimse kalmadı.',
  yarim: 'Haritanın yarısını aldın. Hedefine ulaştın.',
};
// Rakip hedefe senden önce ulaştı (2b). Rakibin ADIYLA: kime kaybettiğin belli olsun.
const RAKIP_CUMLESI = {
  yarim: (ad) => ad + ' haritanın yarısını senden önce aldı.',
};

// Sonuç cümlesi — sonuç kartı bunu yazıyor. Metin BURADA, ekranda değil: aynı cümle iki
// yerde yazılırsa bir gün ayrışır.
//
// Cümleler DÜZ, devrik değil (2026-08-01 yayın dili kuralı): özne başta, yüklem sonda.
export function sonucMetni(durum, sonuc) {
  const m = modBilgisi(durum);
  if (!sonuc) return null;
  if (sonuc.sonuc === 'kazandi')
    return {
      baslik: 'KAZANDIN',
      alt:
        sonuc.sebep === 'esik'
          ? ZAFER_CUMLESI[m.tip] || m.ad + ' hedefine ulaştın.'
          : 'Süre doldu ve haritanın en büyük gücü sen oldun.',
    };
  if (sonuc.sebep === 'rakip') {
    const ad = (durum.aktorler[sonuc.kazanan] || {}).ad || 'Bir rakip';
    const cumle = RAKIP_CUMLESI[m.tip];
    return { baslik: 'YENİLDİN', alt: cumle ? cumle(ad) : ad + ' hedefe senden önce ulaştı.' };
  }
  return {
    baslik: 'YENİLDİN',
    alt:
      sonuc.sebep === 'elendin'
        ? 'Elinde tek bir bölge bile kalmadı. Ordun dağıldı, toprağın gitti.'
        : 'Süre doldu ve senden daha büyük bir güç vardı.',
  };
}
