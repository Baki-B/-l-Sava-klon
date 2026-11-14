// KADEMELİ HARİTA GEOMETRİSİ — okuma tarafı (Görev 20 · Skia haritası).
//
// Veri `veri/harita-seviyeleri.json`'da (üreten: `scripts/harita-seviye-uret.js`, gerekçesi
// orada). Bu dosya o veriyi ÇİZİME HAZIR metne çeviriyor. Skia'yı tanımıyor: düz metin ve
// sayı döndürüyor, bu yüzden Node'da test edilebiliyor. Skia nesnesine çevirme işi
// `haritaCizim.js`'te.
//
// Veri bu dosyaya PARAMETRE olarak geliyor, içe aktarılmıyor: telefonda Metro JSON'u
// `import` ile alıyor, Node'da betikler `require` ile. İkisini de bu dosyaya gömmek
// `oyun/veri.js`'in anlattığı sözdizimi tuzağına düşmek olurdu.

// ---- SEVİYE SEÇİMİ ----
//
// Bu yakınlıkta sapması yarım pikseli aşmayan EN KABA seviye. `f·z` harita biriminin
// ekrandaki pikseli; toleransla çarpımı, sadeleşmenin ekranda en çok kaç piksel
// kaydırabileceği. Seviyeler kabadan inceye sıralı; hiçbiri yetmezse en ince seviye.
// Arayüz iş parçacığında her karede çağrılıyor ('worklet').
export function seviyeSec(f, z, toleranslar, hataPiksel) {
  'worklet';
  for (let i = 0; i < toleranslar.length; i++) {
    if (f * z * toleranslar[i] <= hataPiksel) return i;
  }
  return toleranslar.length - 1;
}

function hatNoktalari(yol) {
  return yol.replace(/^M/, '').replace(/Z$/, '').split('L');
}

// Bir parçanın o seviyedeki dolgu yolu — hatlarından yeniden dikilir. Her koşunun SON
// noktası atlanır (bir sonraki koşu aynı kavşakla başlıyor); kapalı hat (ada) olduğu gibi.
// Üretim betiği aynı dikişin klasik yolla birebir tuttuğunu her üretimde denetliyor.
export function dolguYolu(veri, seviye, pid) {
  const hatlar = veri.seviyeler[seviye].hatlar;
  let yol = '';
  for (const ref of veri.halkalar[pid]) {
    const tek = ref.length === 1 && veri.hatSahipleri[ref[0][0]][2] === 1;
    if (tek) {
      yol += hatlar[ref[0][0]];
      continue;
    }
    const noktalar = [];
    for (const [h, ters] of ref) {
      let n = hatNoktalari(hatlar[h]);
      if (ters) n = n.reverse();
      for (let t = 0; t < n.length - 1; t++) noktalar.push(n[t]);
    }
    yol += 'M' + noktalar.join('L') + 'Z';
  }
  return yol;
}

// Her hattın çizim türü:
//   ilSiniri  iki yanı ayrı illerde ya da kıyı → "il sınırları" açıkken kalın çizgiyle çizilir
//   soluk     yanındaki BÜTÜN parçalar kapsam dışında → eski haritadaki gibi soluk çizilir
//             (bir yanı kapsam içindeyse o parçanın kendi çizgisi tam koyulukta kalıyordu)
//   il        hattın grubu (a parçasının ili) — gruplar ekran dışındaysa çizilmez
export function hatTurleri(veri, parcaIl, kapsam) {
  const disi = (pid) => (kapsam ? !kapsam.has(pid) : false);
  return veri.hatSahipleri.map(([a, b]) => ({
    ilSiniri: !b || parcaIl[a] !== parcaIl[b],
    soluk: disi(a) && (!b || disi(b)),
    il: parcaIl[a],
  }));
}

// Hatları çizim gruplarına toplar: il × tür × solukluk. Her grup TEK bir yol olur (az
// çizim çağrısı); grup il ölçeğinde kaldığı için yakınlaşınca ekran dışındakiler Skia'nın
// sınır kutusu denetimiyle hiç çizilmez.
export function hatGruplari(veri, seviye, turler) {
  const gruplar = new Map();
  veri.seviyeler[seviye].hatlar.forEach((yol, i) => {
    const t = turler[i];
    const anahtar = t.il + '|' + (t.ilSiniri ? 1 : 0) + '|' + (t.soluk ? 1 : 0);
    let g = gruplar.get(anahtar);
    if (!g) {
      g = { il: t.il, ilSiniri: t.ilSiniri, soluk: t.soluk, yol: '' };
      gruplar.set(anahtar, g);
    }
    g.yol += yol;
  });
  return [...gruplar.values()];
}

// ---- CEPHE HATLARI (Görev 21 · H4) ----
// Oyuncu ile SAVAŞTIĞI bir devletin parçaları arasındaki hatlar. `durumlar`: aktör → 'ben' /
// 'ittifak' / 'savas' / 'tarafsiz' (kancanın `ittifakDurumlari`'ı). Dönen: [{ hat, ben }] —
// `ben`: hattın hangi yakası oyuncunun ('a' | 'b'); dişler öbür yakaya, düşmana bakıyor.
// Kıyı hattı (b yok) cephe olamaz.
export function cepheHatlari(veri, sahiplik, durumlar) {
  const sonuc = [];
  if (!sahiplik || !durumlar) return sonuc;
  veri.hatSahipleri.forEach(([a, b], hat) => {
    if (!b) return;
    const da = durumlar[sahiplik[a]],
      db = durumlar[sahiplik[b]];
    if (da === 'ben' && db === 'savas') sonuc.push({ hat, ben: 'a' });
    else if (db === 'ben' && da === 'savas') sonuc.push({ hat, ben: 'b' });
  });
  return sonuc;
}
