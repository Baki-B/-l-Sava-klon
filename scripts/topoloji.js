// TOPOLOJİK SADELEŞTİRME — paylaşılan kenarları bozmadan geometri inceltme.
//
// Bu dosya `menu-geometri-uret.js`'in içindeydi ve orada doğruydu; tek kullanıcısı oydu.
// Görev 20'de ikinci kullanıcı doğdu: oyun haritasının kademeli geometrisi
// (`harita-seviye-uret.js`). İki kopya yazmak CLAUDE.md §5/5'in tuzağı olurdu, üstelik
// burada bedeli ağır: iki kopya bir noktada ayrışırsa menü ile oyun haritasının sınırları
// farklı yerden geçer. Taşıma sonrası menü çıktısı BİREBİR aynı kaldı (sha256 ile
// doğrulandı, `veri/URETIM-NOTU.md` 2026-09-23).
//
// ---- NEDEN TOPOLOJİK — her parça ayrı ayrı SADELEŞTİRİLMEZ ----
// Komşu parçalar sınırlarını nokta nokta paylaşıyor. Her parça KENDİ BAŞINA sadeleştirilse
// iki taraf farklı noktaları atar, ortak sınır iki farklı çizgiye ayrışır: kıl aralıklar +
// üst üste binmeler. Bunun yerine:
//   1. Her halka, komşusu değiştiği yerlerden PARÇALARA (koşulara) bölünür.
//   2. Her koşu BİR KEZ sadeleştirilir (iki sahibi de aynı sonucu kullanır).
//   3. Halkalar sadeleşmiş koşulardan yeniden dikilir.
// Douglas–Peucker nokta SİLER, asla kaydırmaz — kalan noktalar orijinal metinlerin
// birebir kendisi. Paylaşılan kenarlar bu yüzden iki tarafta hâlâ birebir aynı.

function halkalar(yol) {
  return yol
    .split('M')
    .filter(Boolean)
    .map((s) => s.replace(/Z$/, '').split('L'))
    .filter((r) => r.length >= 3);
}

// Douglas–Peucker — nokta METİNLERİ üstünde; seçilenler aynen geri döner.
function dp(noktalar, tol) {
  if (noktalar.length < 3) return noktalar;
  const [ax, ay] = noktalar[0].split(',').map(Number);
  const [bx, by] = noktalar[noktalar.length - 1].split(',').map(Number);
  const uz = Math.hypot(bx - ax, by - ay) || 1;
  let enUzak = 0,
    dizin = 0;
  for (let i = 1; i < noktalar.length - 1; i++) {
    const [x, y] = noktalar[i].split(',').map(Number);
    const d = Math.abs((bx - ax) * (ay - y) - (ax - x) * (by - ay)) / uz;
    if (d > enUzak) {
      enUzak = d;
      dizin = i;
    }
  }
  if (enUzak <= tol) return [noktalar[0], noktalar[noktalar.length - 1]];
  return [...dp(noktalar.slice(0, dizin + 1), tol).slice(0, -1), ...dp(noktalar.slice(dizin), tol)];
}

// Kapalı halka DP'ye doğrudan verilemez (turkiye-hat-uret'teki tuzağın aynısı):
// başlangıçtan EN UZAK noktadan ikiye bölünüp iki açık parça ayrı sadeleştirilir.
function dpHalka(r, tol) {
  const [ax, ay] = r[0].split(',').map(Number);
  let uzak = 0,
    dizin = 0;
  for (let i = 1; i < r.length; i++) {
    const [x, y] = r[i].split(',').map(Number);
    const d = Math.hypot(x - ax, y - ay);
    if (d > uzak) {
      uzak = d;
      dizin = i;
    }
  }
  const a = dp(r.slice(0, dizin + 1), tol);
  const b = dp([...r.slice(dizin), r[0]], tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

// Kapalı bir halkanın YÖNDEN ve BAŞLANGIÇTAN bağımsız anahtarı. İç içe iki parçada (biri
// ötekinin içinde) aynı halka iki tarafta farklı noktadan ve ters yönde başlayabiliyor;
// ikisinin aynı sadeleşmiş sonucu kullanması için önce aynı biçime getiriliyor.
function kanonikHalka(r) {
  let enKucuk = 0;
  for (let i = 1; i < r.length; i++) if (r[i] < r[enKucuk]) enKucuk = i;
  const ileri = [...r.slice(enKucuk), ...r.slice(0, enKucuk)];
  const geri = [ileri[0], ...ileri.slice(1).reverse()];
  const i = ileri.join('L'),
    g = geri.join('L');
  return i <= g ? { anahtar: i, noktalar: ileri } : { anahtar: g, noktalar: geri };
}

// Bir birim kümesini (kod → yol) topolojik sadeleştirir.
//
// Dönen:
//   yollar      kod → sadeleşmiş halka yolu (dolgu için)
//   ciftler     "a|b" → iki komşunun arasındaki çizgi (menünün "koyu çizgi yalnız düşman
//               kenarında" kuralı). ⚠ Tek komşulu halkalar (iç içe parça) buraya girmez —
//               menü çıktısı birebir korunsun diye eski davranış aynen duruyor.
//   hatlar      [{ yol, a, b, kapali }] — BÜTÜN sınır hatları, her biri TEK KEZ. `b` null ise
//               kıyı / dış hat. Oyun haritası (Görev 20) kenarları buradan çiziyor: iki komşu
//               ortak sınırı iki kez çizmesin (eski haritada her parça kendi çevresini
//               çiziyordu, yani her iç sınır iki kez çiziliyordu).
//   halkaHatlari  kod → halkalar → [[hat sırası, ters], …]. Parçanın dolgusu bu hatlardan
//               YENİDEN DİKİLİYOR: iki komşu aynı hattı paylaştığı için aralarında boşluk
//               kalması yapı gereği imkânsız, dosyaya da her nokta bir kez yazılıyor.
//   paylasilan / tekli   istatistik — topolojik yaklaşımın geçerli olduğunun kanıtı
function topolojikSadelestir(birimler, tol) {
  const KODLAR = Object.keys(birimler).sort();

  // 1. Her kenarın sahipleri (kenar = sıralı iki uç noktası).
  const kenarSahipleri = new Map();
  for (const kod of KODLAR) {
    for (const halka of halkalar(birimler[kod])) {
      for (let i = 0; i < halka.length; i++) {
        const a = halka[i],
          b = halka[(i + 1) % halka.length];
        if (a === b) continue;
        const anahtar = a < b ? a + '|' + b : b + '|' + a;
        let liste = kenarSahipleri.get(anahtar);
        if (!liste) kenarSahipleri.set(anahtar, (liste = []));
        if (!liste.includes(kod)) liste.push(kod);
      }
    }
  }

  const hatlar = [];

  // Koşu önbelleği: aynı koşu iki sahibi tarafından da işlenir; sadeleştirme BİR KEZ
  // yapılmalı ki iki taraf aynı noktaları kullansın. Anahtar yönden bağımsız. Koşu ilk
  // görüldüğünde bir HAT olur (kanonik yönde); ikinci sahibi aynı hattı ters yönde kullanır.
  const kosuOnbellek = new Map();
  function sadelesmisKosu(noktalar, kod, hedef) {
    const ileri = noktalar.join('L');
    const geri = [...noktalar].reverse().join('L');
    const anahtar = ileri < geri ? ileri : geri;
    let kayit = kosuOnbellek.get(anahtar);
    if (!kayit) {
      const kanonik = ileri < geri ? noktalar : [...noktalar].reverse();
      const sonuc = dp(kanonik, tol);
      hatlar.push({ yol: 'M' + sonuc.join('L'), a: kod, b: hedef || null, kapali: false });
      kayit = { sonuc, hat: hatlar.length - 1 };
      kosuOnbellek.set(anahtar, kayit);
    }
    const ters = !(ileri < geri);
    return { s: ters ? [...kayit.sonuc].reverse() : kayit.sonuc, hat: kayit.hat, ters };
  }

  // Tek komşulu kapalı halkaların (ada, iç içe parça) önbelleği — aynı kural, halka biçimi.
  const halkaOnbellek = new Map();
  function sadelesmisHalka(halka, kod, komsu) {
    const k = kanonikHalka(halka);
    let kayit = halkaOnbellek.get(k.anahtar);
    if (!kayit) {
      const s = dpHalka(k.noktalar, tol);
      if (s.length < 3) return null;
      hatlar.push({ yol: 'M' + s.join('L') + 'Z', a: kod, b: komsu || null, kapali: true });
      kayit = { hat: hatlar.length - 1 };
      halkaOnbellek.set(k.anahtar, kayit);
    }
    return kayit.hat;
  }

  const yeniYollar = {};
  const ciftler = {};
  const halkaHatlari = {};
  const ciftAnahtari = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

  for (const kod of KODLAR) {
    const halkaYollari = [];
    const halkaRef = [];
    halkaHatlari[kod] = halkaRef;
    for (const halka of halkalar(birimler[kod])) {
      const n = halka.length;

      // Her kenarın komşusu (yoksa null = kıyı/dış hat).
      const komsu = [];
      for (let i = 0; i < n; i++) {
        const a = halka[i],
          b = halka[(i + 1) % n];
        if (a === b) {
          komsu.push(komsu.length ? komsu[komsu.length - 1] : null);
          continue;
        }
        const liste = kenarSahipleri.get(a < b ? a + '|' + b : b + '|' + a) || [];
        komsu.push(liste.find((x) => x !== kod) || null);
      }

      // Halkanın tamamı tek komşuya bakıyorsa (ada, tek koşu) kapalı halka sadeleştirmesi.
      let bas = 0;
      while (bas < n && komsu[bas] === komsu[(bas - 1 + n) % n]) bas++;
      if (bas === n) {
        // Menü çıktısı (yollar) ESKİ yoldan: birebir korunmalı.
        const s = dpHalka(halka, tol);
        if (s.length >= 3) halkaYollari.push('M' + s.join('L') + 'Z');
        // Hat ve dolgu referansı KANONİK yoldan: iç içe iki parça aynı halkayı paylaşsın.
        const hat = sadelesmisHalka(halka, kod, komsu[0]);
        if (hat !== null) halkaRef.push([[hat, 0]]);
        continue;
      }

      // Koşulara böl, her koşuyu (önbellekten) sadeleştir, halkayı yeniden dik.
      const halkaNokta = [];
      const ref = [];
      let i = 0;
      while (i < n) {
        const hedef = komsu[(bas + i) % n];
        let uzunluk = 1;
        while (i + uzunluk < n && komsu[(bas + i + uzunluk) % n] === hedef) uzunluk++;

        const kosu = [];
        for (let t = 0; t <= uzunluk; t++) kosu.push(halka[(bas + i + t) % n]);
        const { s, hat, ters } = sadelesmisKosu(kosu, kod, hedef);
        ref.push([hat, ters ? 1 : 0]);

        // Halkaya koşunun SON noktası hariç ekle — sonraki koşu aynı kavşakla başlıyor.
        for (let t = 0; t < s.length - 1; t++) halkaNokta.push(s[t]);

        // Komşu çifti çizgisi (her çift bir kez: küçük kod yazar).
        if (hedef && kod < hedef) {
          const anahtar = ciftAnahtari(kod, hedef);
          ciftler[anahtar] = (ciftler[anahtar] || '') + 'M' + s.join('L');
        }
        i += uzunluk;
      }
      if (halkaNokta.length >= 3) {
        halkaYollari.push('M' + halkaNokta.join('L') + 'Z');
        halkaRef.push(ref);
      }
    }
    yeniYollar[kod] = halkaYollari.join('');
  }

  let paylasilan = 0,
    tekli = 0;
  for (const liste of kenarSahipleri.values()) liste.length === 2 ? paylasilan++ : tekli++;
  return { yollar: yeniYollar, ciftler, hatlar, halkaHatlari, paylasilan, tekli };
}

// Bir yol metnindeki nokta sayısı.
function noktaSayisi(yol) {
  return (yol.match(/[ML]/g) || []).length;
}

// Hat referanslarından halkayı yeniden diker (üretim betiğinin öz denetimi için; oyundaki
// karşılığı `src/haritaSeviye.js`). Her koşunun SON noktası atlanır: bir sonraki koşu aynı
// kavşakla başlıyor. Kapalı hat (ada) tek başına bir halkadır.
function halkaDik(ref, hatlar) {
  if (ref.length === 1 && hatlar[ref[0][0]].kapali) return hatlar[ref[0][0]].yol;
  const noktalar = [];
  for (const [h, ters] of ref) {
    let n = hatlar[h].yol.slice(1).split('L');
    if (ters) n = n.reverse();
    for (let t = 0; t < n.length - 1; t++) noktalar.push(n[t]);
  }
  return 'M' + noktalar.join('L') + 'Z';
}

module.exports = { halkalar, dp, dpHalka, topolojikSadelestir, noktaSayisi, halkaDik };
