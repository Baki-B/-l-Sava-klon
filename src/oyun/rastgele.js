// TOHUMLU RASTGELE SAYI ÜRETECİ (Görev 03 §6.5)
//
// Oyunun HER rastgele sayısı buradan geçer. `Math.random()` kullanılmaz.
// Sebep üç tane:
//   1) Hata ayıklama — "şu muharebe garip bitti" denince aynı durum tekrar üretilebilsin.
//   2) Kayıt/yükleme — kaydedilip yüklenen oyun aynı şekilde devam etsin.
//   3) Asenkron çok oyunculu (v1.5) — iki cihaz aynı hamleden aynı sonucu çıkarsın.
//
// Algoritma: mulberry32. 32 bitlik tek sayılık durum, hızlı ve kısa.
// Kriptografik güvenlik AMAÇLANMAZ (para/şifre işi değil); istenen tekrarlanabilirliktir.
//
// Kullanım:
//   const r = rastgeleKur(oyunDurumu.rastgele.tohum, oyunDurumu.rastgele.durum);
//   const x = r.sonraki();                 // 0 ile 1 arası
//   oyunDurumu.rastgele.durum = r.durumAl();   // kayda giren şey

// Yeni oyun kurarken bir kez çağrılır — oyun sırasında ASLA kullanılmaz.
export function yeniTohum() {
  return (Date.now() ^ (Date.now() >>> 9)) >>> 0;
}

// tohum: oyunun rastgeleliğini başlatan sayı.
// durum: üretecin o anki hali (kayıttan dönerken verilir; verilmezse tohumdan başlar).
export function rastgeleKur(tohum, durum) {
  const baslangicTohum = tohum >>> 0;
  let d = (durum === undefined || durum === null ? baslangicTohum : durum) >>> 0;

  // mulberry32: durumu ilerlet, 0 ≤ x < 1 döndür.
  function sonraki() {
    d = (d + 0x6d2b79f5) >>> 0;
    let t = Math.imul(d ^ (d >>> 15), 1 | d);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    tohum: baslangicTohum,

    // 0 ≤ x < 1
    sonraki,

    // min ≤ x < max (kesirli) — ör. muharebedeki ±%10 şans bandı
    aralik(min, max) {
      return min + sonraki() * (max - min);
    },

    // min ≤ n ≤ max (tam sayı, iki uç da dahil)
    tamsayi(min, max) {
      return min + Math.floor(sonraki() * (max - min + 1));
    },

    // Üretecin o anki durumu — kayıt dosyasına bu yazılır.
    durumAl() {
      return d >>> 0;
    },

    // Kayıttan dönerken durumu geri yükler (kaldığı yerden devam eder).
    durumuYukle(yeniDurum) {
      d = yeniDurum >>> 0;
    },
  };
}
