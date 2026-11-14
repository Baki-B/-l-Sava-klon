// HARİTA DÖNÜŞÜMÜ — harita koordinatı ↔ ekran pikseli çevirisinin TEK KAYNAĞI.
//
// NEDEN AYRI DOSYA (2026-07-30). Bu hesap üç ayrı yerde, üç ayrı kopya olarak duruyordu:
//   • `Harita.js hitSelect`  — ekran → harita (parmağın hangi parçaya değdiği)
//   • `Harita.js` rozet kaydırma denetimi — harita → ekran
//   • `RozetKatmani.js`      — harita → ekran (rozetlerin yeri)
// Üçü aynı formülün elle yazılmış kopyalarıydı. Biri değişip öteki değişmediğinde ortaya
// çıkan şey "rozetler haritayla aynı yerde durmuyor" oluyor — Baki'nin bildirdiği titremenin
// zeminini hazırlayan tam da bu tür bir ayrışma riskiydi.
//
// Artık hepsi buradan geçiyor ve `testler/haritaDonusum.test.js` ileri-geri çevirinin birebir
// tuttuğunu doğruluyor. İleride yakınlaştırma/kaydırma mantığı değişirse tek dosya değişecek,
// test de o değişikliği yakalayacak.
//
// DÖNÜŞÜMÜN TANIMI (`Harita.js`'teki katman dönüşümüyle birebir aynı olmak ZORUNDA):
//   harita katmanının stili: [{ translateX: tx }, { translateY: ty }, { scale: z }]
//   yani bir nokta önce ÖLÇEKLENİR, sonra ÖTELENİR ve her ikisi de görünümün MERKEZİNE göredir.
//
//   ekranX = cx + (ox + x·f − cx)·z + tx
//   ekranY = cy + (oy + y·f − cy)·z + ty
//
// f: haritayı çizim alanına sığdıran ölçek · (ox, oy): ortalama payı · (cx, cy): alanın merkezi.

// Çizim alanı ölçüsünden türeyen sabitler. Alan boyutu değişmedikçe bir kez hesaplanır.
// lw, lh: çizim alanının piksel ölçüsü · W, H: haritanın kendi birimindeki ölçüsü.
export function haritaOlcusu(lw, lh, W, H) {
  const f = Math.min(lw / W, lh / H);
  return {
    f,
    ox: (lw - W * f) / 2,
    oy: (lh - H * f) / 2,
    cx: lw / 2,
    cy: lh / 2,
    lw,
    lh,
  };
}

// Harita koordinatı → ekran pikseli. `o` = haritaOlcusu(...), z/tx/ty = yakınlaştırma+kaydırma.
export function haritadanEkrana(x, y, o, z, tx, ty) {
  return {
    x: o.cx + (o.ox + x * o.f - o.cx) * z + tx,
    y: o.cy + (o.oy + y * o.f - o.cy) * z + ty,
  };
}

// Ekran pikseli → harita koordinatı. Yukarıdakinin TERSİ; dokunma testi bunu kullanıyor.
export function ekrandanHaritaya(sx, sy, o, z, tx, ty) {
  return {
    x: (o.cx + (sx - o.cx - tx) / z - o.ox) / o.f,
    y: (o.cy + (sy - o.cy - ty) / z - o.oy) / o.f,
  };
}

// ---- KAMERA (Görev 08 / Adım 5) ----
//
// Sahne, cephedeki en önemli olaya bir kez kayıyor (§6/4). Hedef kaydırmayı hesaplayan yer
// burası: dönüşümün tersini alıp "bu harita noktası ekranın MERKEZİNE gelsin" diyoruz.
//
//   ekranX = cx + (ox + x·f − cx)·z + tx   ve   ekranX = cx  istiyoruz
//   ⇒ tx = −(ox + x·f − cx)·z
export function kameraKaydirmasi(x, y, o, z) {
  return { tx: -(o.ox + x * o.f - o.cx) * z, ty: -(o.oy + y * o.f - o.cy) * z };
}

// Kaydırmanın izin verilen sınırı. `Harita.js`'in jest sınırlayıcısı da BU SAYILARI
// kullanıyor — kamera oyuncunun elle gidemeyeceği bir yere gidemez, yoksa gösteri bitince
// harita "yasak bölgede" kalır ve ilk dokunuşta zıplar.
//   yatay pay geniş: sol panel açılınca soldaki iller sağa kaydırılıp görülebilsin.
export const KAYDIRMA_PAYI = { yatay: 0.42, dikey: 0.15 };

export function kaydirmaSiniri(lw, lh, z) {
  'worklet';
  return {
    fx: Math.max(0, (lw * z - lw) / 2) + lw * KAYDIRMA_PAYI.yatay,
    fy: Math.max(0, (lh * z - lh) / 2) + lh * KAYDIRMA_PAYI.dikey,
  };
}

// Ekranda görünen harita dikdörtgeni, kenarına `pay` (harita birimi) eklenmiş hâliyle.
// Rozet ayıklaması bunu kullanıyor: dışarıda kalan rozet hiç kurulmuyor.
export function gorunenAlan(o, z, tx, ty, pay) {
  const solUst = ekrandanHaritaya(0, 0, o, z, tx, ty);
  const sagAlt = ekrandanHaritaya(o.lw, o.lh, o, z, tx, ty);
  const p = pay || 0;
  return {
    x0: solUst.x - p,
    y0: solUst.y - p,
    x1: sagAlt.x + p,
    y1: sagAlt.y + p,
    // Görünen alanın harita birimindeki ölçüsü — pay bundan türetilebilsin diye.
    genislik: sagAlt.x - solUst.x,
    yukseklik: sagAlt.y - solUst.y,
  };
}

// ---- ROZET YERLEŞİMİ ----
//
// TEMEL FİKİR (Baki'nin önerisi, 2026-07-30): "rozetlerin yerlerini sabit yapalım, haritada
// sadece hareket edelim, rozet yeniden yüklenmesin."
//
// Rozetin yeri KAYDIRMADAN BAĞIMSIZ hesaplanıyor (pan = 0). Kaydırmayı kapsayıcının kendi
// dönüşümü taşıyor. Sonuç: harita ne kadar kaydırılırsa kaydırılsın rozetlerin `left/top`
// değerleri DEĞİŞMİYOR, yani hiçbiri yeniden çizilmiyor. Önceki tasarımda yer, o anki
// kaydırmaya bağlıydı ve her hareketin sonunda BÜTÜN rozetler baştan hesaplanıyordu.
//
// Yer yalnızca SABİTLENMİŞ YAKINLAŞTIRMAYA (z0) ve çizim alanı ölçüsüne bağlı. İkisi de
// ancak yakınlaştırma değişince ya da ekran döndüğünde değişir.

// Rozetin sabit yeri: kaydırma sıfırken, sabitlenmiş yakınlaştırmadaki ekran noktası.
export function sabitEkranYeri(x, y, olcu, z0) {
  return haritadanEkrana(x, y, olcu, z0, 0, 0);
}

// Kapsayıcının dönüşümü: sabit yerleri O ANKİ kaydırma/yakınlaştırmaya taşır.
// `olcek` görünümün MERKEZİNE göre uygulanır (kapsayıcı tam ekran olduğu için merkez = cx,cy).
export function kapsayiciDonusumu(z0, z, tx, ty) {
  return { olcek: z / z0, tx, ty };
}

// Dönüşümü bir ekran noktasına uygular. Yalnızca sınama için: gerçekte bunu RN'in kendi
// dönüşüm dizisi yapıyor ([translateX, translateY, scale]). Test, ikisinin aynı sonucu
// verdiğini doğruluyor — sabit yerleşimin bütün dayanağı bu eşitlik.
export function donusumuUygula(nokta, olcu, d) {
  return {
    x: olcu.cx + (nokta.x - olcu.cx) * d.olcek + d.tx,
    y: olcu.cy + (nokta.y - olcu.cy) * d.olcek + d.ty,
  };
}

// Bir rozet listesini SABİT ekran yerlerine çevirir. Ayıklama YOK: katmandaki bütün rozetler
// kurulur ve kaydırma boyunca hiç dokunulmaz. Ayıklama denendi ve geri alındı — kaydırırken
// yeni rozet kurmak, tam da kaçınmak istediğimiz "hareket ederken iş yapma" durumuydu
// (eski SVG haritasının rozet katmanı; 2026-09-25'te emekliye ayrıldı, kural sahne katmanı
// için geçerli). Ekran dışındaki görünümlerin çizim maliyeti zaten sıfıra yakın.
export function rozetleriYerlestir(liste, olcu, z0) {
  if (!liste || liste.length === 0 || !olcu) return [];
  return liste.map((r) => {
    const p = sabitEkranYeri(r.x, r.y, olcu, z0);
    return { ...r, ekranX: p.x, ekranY: p.y };
  });
}

// ---- TUVAL DÖNÜŞÜMÜ (Görev 20 · Skia haritası) ----
//
// Skia'da `viewBox` yok: harita bir DÖNÜŞÜM MATRİSİYLE çiziliyor ve o matris BURADAN geliyor.
// Yukarıdaki tanım doğrusal olduğu için tek bir ölçek + öteleme yetiyor:
//
//   ekranX = cx + (ox + x·f − cx)·z + tx  =  x·(f·z) + (cx + (ox − cx)·z + tx)
//
//   k  = f·z                      (harita biriminin ekrandaki pikseli)
//   bx = cx + (ox − cx)·z + tx    ·    by = cy + (oy − cy)·z + ty
//
// Tuval: `translate(bx, by)` → `scale(k, k)` → haritayı kendi biriminde çiz.
// ⚠ CLAUDE.md §6'daki "viewBox + elle sığdırma birlikte" tuzağı burada doğamaz: sığdırma
// (f, ox, oy) bu tek matrisin içinde, ikinci bir kez uygulanacak yer yok. Test, matrisin
// `haritadanEkrana` ile birebir aynı noktayı verdiğini kilitliyor (dokunma testi o yoldan
// gidiyor; ikisi ayrışırsa parmak yanlış parçayı seçer).
export function kameraDonusumu(o, z, tx, ty) {
  'worklet';
  return {
    k: o.f * z,
    bx: o.cx + (o.ox - o.cx) * z + tx,
    by: o.cy + (o.oy - o.cy) * z + ty,
  };
}

// ---- DOKUNMA TESTİ (Görev 20 · eski haritadaki satır içi hesabın test edilebilir hâli) ----
//
// Parmağın değdiği harita noktası hangi parçanın içinde? TAM ÇÖZÜNÜRLÜKLÜ geometriyle
// (`parcalar.json`) yapılır: çizimdeki sadeleşme (`harita-seviyeleri.json`) yarım pikselden
// küçük olduğu için dokunmayı etkilemez, ama doğruluk kaynağı yine de tam veri kalır.
//
// Hazırlık bir kez: yol metni halkalara, halkalar sınır kutusuna.
export function dokunmaGeometrisi(parcalar) {
  const g = [];
  for (const pid of Object.keys(parcalar)) {
    const halkalar = parcalar[pid].yol
      .split('M')
      .filter(Boolean)
      .map((s) =>
        s
          .replace('Z', '')
          .split('L')
          .map((t) => {
            const p = t.split(',');
            return [+p[0], +p[1]];
          })
      );
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const r of halkalar)
      for (const p of r) {
        if (p[0] < x0) x0 = p[0];
        if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1];
        if (p[1] > y1) y1 = p[1];
      }
    g.push({ pid, halkalar, kutu: [x0, y0, x1, y1] });
  }
  return g;
}

// Harita noktası → parça kimliği (yoksa null). Çift-tek kuralı: iç içe halkalar doğru çalışır.
export function parcaBul(geom, wx, wy) {
  for (let k = 0; k < geom.length; k++) {
    const g = geom[k],
      b = g.kutu;
    if (wx < b[0] || wx > b[2] || wy < b[1] || wy > b[3]) continue;
    let icinde = false;
    for (let ri = 0; ri < g.halkalar.length; ri++) {
      const r = g.halkalar[ri];
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const yi = r[i][1],
          yj = r[j][1];
        if (yi > wy !== yj > wy && wx < ((r[j][0] - r[i][0]) * (wy - yi)) / (yj - yi) + r[i][0])
          icinde = !icinde;
      }
    }
    if (icinde) return g.pid;
  }
  return null;
}
