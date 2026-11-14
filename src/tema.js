// GÖRÜNTÜ KARARLARININ TEK KAYNAĞI. Bileşen dosyalarında `#rrggbb` / `rgba(...)` yazılmaz.
// Bölge ve arazi renkleri scripts/renkler.js ile aynı olmalı.
//
// DOSYANIN İÇİNDEKİLER:
//   1. RENK / ARAZI_* / BOLGE_RENK — HARİTANIN kendi renkleri (değişmez, ölçülmüş)
//   2. PANEL                        — ESKİ koyu arayüz dünyasının artıkları; 12 çağrı yeri
//                                     kaldı ve hepsi harita rozetinde/gölgede (bkz. blok)
//   3. YAZI                         — yazı tipi aileleri (değişmez)
//   4. karis / MENU_RENK            — renk karıştırıcı + EGE PALETİ (ana menü, mod ekranı)
//   5. HARITA_* / askeriTon / okunakliMetin / aktorRengi — harita çizim ayarları
//   6. ---- JETON TABLOSU ----      — ZEMIN · CIZGI · YAZI_RENK · VURGU · DURUM ·
//                                     BOSLUK · KOSE · puntolar()   (dosyanın SONUNDA)
// Yeni bir görsel karar dosyanın sonundaki jeton tablosuna yazılır.
//
// KONTRAST ORANLARI TAHMİN DEĞİL: `node scripts/tema-olcum.js` hepsini yeniden ölçer ve
// `veri/tema-olcum.md`'ye yazar. Zemin rengi her değiştiğinde ÜSTÜNDEKİ HER ŞEY yeniden
// ölçülmeli — bu bir kez canımızı yaktı (ayraçlar 1.21:1'e düşmüştü ve gözle fark
// edilmiyordu, çünkü kutular kalktığı için bilgiyi gruplayan tek şey onlardı).

export const RENK = {
  deniz: '#c7d5de',
  hud: 'rgba(17,27,37,0.92)',
  hudMetin: '#e9eef3',
  hudMetinSoluk: '#aeb9c4',
  mavi: '#4a90d9',
  parcaSinir: '#33404d',
  ilSinir: '#0b1119',
  secSinir: '#0b1622',
  komsuSinir: '#1f6fe0',
  // Hareket (Görev 05): hedef seçme kipinde gidilebilecek parçalar ve emir okları.
  // Ok rengi saldırı ile takviyeyi ayırır — oyuncu haritaya bakınca hangisi olduğunu görsün.
  hedef: '#b0904f', // seçilebilir hedef (panel pirincinin haritadaki karşılığı)
  kaynak: '#20241a', // kip açıkken kaynağın çerçevesi
  okSaldiri: '#c0492f', // cephe kırmızısı
  okTakviye: '#3f7f4f', // takviye yeşili
  panel: '#ffffff',
  murekkep: '#17242f',
  ikincil: '#5a6b78',
  golge: 'rgba(20,32,46,0.16)',
};

export const ARAZI_RENK = { ova: '#cfe0a8', tepelik: '#d8b781', daglik: '#a9805f' };
export const ARAZI_AD = { ova: 'Düzlük', tepelik: 'Tepelik', daglik: 'Dağlık' };
// ARAZI_CARPAN buradan KALDIRILDI (Görev 05 / Adım 0) — muharebe hesabına giren bir sayıydı,
// yani denge sayısıdır ve yeri `denge.js DENGE.ARAZI`. Bu dosya sunum dosyasıdır.
// Oyuncuya gösterilen sade savunma seviyesi (çarpan yerine) burada kalıyor:
export const ARAZI_SAVUNMA = { ova: 'Düşük', tepelik: 'Orta', daglik: 'Yüksek' };
// Aynı bilginin ÖLÇÜT karşılığı (Görev 10A / Adım 5): panelde savunma da öteki ölçütlerle
// aynı dille — 5 nokta — gösteriliyor, kelimeyle değil. Bu bir denge sayısı DEĞİL, sunum
// eşlemesi; muharebeye giren çarpan `denge.js DENGE.ARAZI`de ve oraya hiç dokunulmuyor.
export const ARAZI_SAVUNMA_OLCUT = { ova: 1, tepelik: 3, daglik: 5 };

// ---- ESKİ KOYU DÜNYANIN ARTIKLARI ----
// Bir zamanlar "Palet A" idi: koyu slate + antik pirinç + cephe kırmızısı. Panel, HUD ve
// tur çubuğu onu paylaşıyordu ve oyunda ÜÇÜNCÜ bir dünya yaratıyordu.
//
// 2026-08-03: arayüzün tamamı JETON TABLOSU'na (Ege paleti) geçtiği için bu bloktan
// kullanılmayan 12 giriş silindi (zemin · cerceve · ikincil · pirincKoyu · yesil · cizgi ·
// cubukArka · cipZemin · cipMetin · pirincUstu · pirincAcik · yaziGolgesi).
//
// KALANLAR ARAYÜZ RENGİ DEĞİL, o yüzden Ege'ye çevrilmediler:
//   · `pirinc` / `kirmizi` / `metin` — kalkan ROZETİN kendi renkleri. Rozet haritanın
//     üstünde duruyor ve harita paleti KİLİTLİ (görev belgesi §6).
//   · `vurguUstu` / `vurguUstuSoluk` — kiremit dolgunun üstündeki yazı; kiremit değişmedi.
//   · `golgeRenk` / `rozetKontur` / `noktaKontur` — nötr siyah/koyu; tonu yok.
//   · `hudSaydam` / `hudKoyu` / `parlakTul` / `sahneKart` — haritanın üstündeki saydam
//     katmanlar; haritayı KARARTMAK için varlar, bir renk anlatmak için değil.
//
// Buraya YENİ renk EKLENMEZ — yeni renk jeton tablosuna yazılır.
export const PANEL = {
  metin: '#e7e1d1', // krem-kemik yazı (rozet çizgisi)
  pirinc: '#b0904f', // antik pirinç (rozet parlaklığı)
  kirmizi: '#c0492f', // cephe kırmızısı (rozet yıpranma izi)
  vurguUstu: '#f4f1e8', // kiremit dolgu üstünde okunan açık yazı
  vurguUstuSoluk: '#f0d9d2', // aynı dolgu üstünde ikincil yazı
  rozetKontur: '#0e141a', // kalkan rozetin konturu
  noktaKontur: '#00000055', // renk noktasının ince halkası
  golgeRenk: '#000', // shadowColor (RENK.golge'den farklı: o bir gölge DOLGUSU)
  hudSaydam: 'rgba(17,27,37,0.7)', // RENK.hud'un daha saydam hâli
  hudKoyu: 'rgba(17,27,37,0.94)', // ve daha koyu hâli
  parlakTul: 'rgba(255,255,255,0.05)', // çok hafif aydınlatma tülü
  sahneKart: 'rgba(28,34,40,0.95)', // sahne kartının zemini
};

// ---- PERDE (arka karartma) ----
// Açılır ekranın arkasındaki karartma. Beş koyuluk, hepsi aynı siyah-maviden.
//
// Envanter turunda bunun SEKİZ ayrı koyulukta yazıldığı ortaya çıkmıştı; beşe indi,
// üçü (MENU_ESKI'nin siyah menü dünyası) 2026-08-03'te tamamen silindi çünkü menü artık
// haritanın üstünde duruyor, siyah bir tabakanın üstünde değil.
export const PERDE = {
  enHafif: 'rgba(8,12,16,0.62)', // onay kutusu
  hafif: 'rgba(8,12,16,0.68)', // tur raporu
  orta: 'rgba(8,12,16,0.72)', // araştırma · hareket · tur perdesi
  koyu: 'rgba(8,12,16,0.82)', // genel ayarlar
  enKoyu: 'rgba(8,12,16,0.86)', // diplomasi
};

// SİLİNDİLER (2026-08-03, Ege paletine geçiş):
//   PIRINC_TUL — "seçili" durumun pirinç tülü, beş yoğunlukta. Pirinç Ege paletinde yok
//                ve hiçbir bileşen kullanmıyordu.
//   MENU_ESKI  — menü ekranlarının siyah dünyası. Menü artık haritanın üstünde;
//                bu grup da kullanılmıyordu.
// İkisi de sıfır çağrı yeriyle duruyordu, yani silinmeleri hiçbir ekranı değiştirmiyor.

export const BOLGE_RENK = {
  'Marmara': '#7593b0',
  'Ege': '#529a93',
  'Karadeniz': '#82a87e',
  'İç Anadolu': '#ccbf7a',
  'Akdeniz': '#d59860',
  'Güneydoğu Anadolu': '#c58a8a',
  'Doğu Anadolu': '#a897b5',
};

// Kapsam dışı (senaryoya dahil olmayan) parçanın soluk görünürlüğü — 0 = görünmez, 1 = normal.
export const KAPSAM_DISI_SOLUKLUK = 0.22;

// ---- YAZI TİPLERİ ----
// DEĞİŞTİRMEK İÇİN: aşağıdaki değerleri değiştir, tüm arayüz birden değişir.
// Fontlar `src/App.js`'te yükleniyor; yeni bir aile eklerken oraya da eklemek gerekir.
//
// NOT: özel yazı tipi kullanılınca `fontWeight` çalışmaz — kalınlık ailenin kendi
// sürümünden gelir (bu yüzden aşağıda ayrı "kalın" girdileri var).
// ---- YAZI TİPLERİ: İKİ AİLE (2026-08-12, Baki'nin kararı) ----
//
// ESKİSİ: Oswald (etiket/başlık) + Barlow Semi Condensed (gövde/sayı). İkisi de nötr iş
// atlarıydı; Baki *"font havalı dursun, oyunun genel font tasarımını değiştirmek
// istiyorum"* dedi ve adaylar Türkçe sınavından geçirilerek seçildi
// (`onizleme/font-deneme.html` — on iki adayın hepsi Ğ/Ş/İ/ı destekliyor, ölçüldü).
//
//   BASLIK → Black Ops One · askeri ŞABLON (stencil). Oyunun kimliğini tek başına taşıyor.
//   GÖVDE  → Chakra Petch · köşeli, teknik; şablonla aynı dili konuşuyor ama okunaklı.
//
// ---- ⚠ ÜÇÜNCÜ FONT YOK VE BU BİR EKSİK DEĞİL ----
// Üçüncü bir aile "mühür anları" (başarım, savaş ilanı) için düşünülmüştü ve o rol için
// şablon bir font önerilmişti. Başlık fontu ŞABLONUN KENDİSİ olunca o rol boşa düştü:
// üçüncü aile eklemek artık karakter değil gürültü katardı.
//
// ---- ⚠ BLACK OPS ONE'IN TEK KESİMİ VAR (yalnızca 400) ----
// "İnceltip gövdede de kullanalım" denendi ve ÖLÇÜLDÜ: ağırlık 100/400/700/900 dördü de
// birebir aynı çiziliyor (730 px). Tarayıcı var olmayan bir inceyi uyduramaz — sentetik
// KALINLAŞTIRMA yapar, sentetik inceltme diye bir şey yoktur. Ayrıca 15 px'te şablon
// kesikleri okunmayı bitiriyor. Bu yüzden `baslik` ve `etiket` AYNI dosyayı gösteriyor:
// ailede başka kesim yok, sahte bir ayrım yazmak yanıltıcı olurdu.
export const YAZI = {
  etiket: 'BlackOpsOne_400Regular', // ARAZİ, SAHİBİ, TUR gibi küçük büyük-harf etiketler
  baslik: 'BlackOpsOne_400Regular', // PARÇA, AYARLAR, düğme yazıları
  govde: 'ChakraPetch_400Regular', // normal metin
  govdeKalin: 'ChakraPetch_600SemiBold', // vurgulu metin, değerler
  sayi: 'ChakraPetch_700Bold', // öne çıkan sayılar
};

// ---- KADEMELİ GEOMETRİNİN EKRANDAKİ EN BÜYÜK SAPMASI (Görev 20 · Skia haritası) ----
// Skia haritası her yakınlıkta, sınırları bu kadar pikselden fazla kaydırmayan EN KABA
// geometriyi çizer (`src/haritaSeviye.js seviyeSec`, veri: `veri/harita-seviyeleri.json`).
// Yarım piksel göze görünmez; seviye geçişi de bu yüzden fark edilmez.
// Küçültmek daha ince geometri (daha ağır çizim), büyütmek daha kaba (daha hafif) demek.
// (Eski SVG haritasının `HARITA_NETLIK` ve `HARITA_JEST_DOKUSU` ayarları onunla birlikte
// 2026-09-25'te kalktı: Skia haritası her karede yeniden çizdiği için ikisine de gerek yok.)
export const HARITA_SEVIYE_HATASI = 0.5;

// ---- SINIR ÇİZGİLERİNİN YAKINLAŞINCA KALINLAŞMASI (Görev 20 · Skia haritası) ----
// Ekrandaki kalınlık z^CIZGI_BUYUME ile büyür. 1 olsaydı çizgi harita ile AYNI oranda
// kalınlaşırdı (eski harita böyleydi: 7×'te il sınırı 9, seçim çizgisi 15 piksel — kalın ve
// kaba). 0.5 (karekök): 1×'te eskisiyle birebir aynı, 7×'te yalnızca 2.6 katı. 0 olsaydı
// her yakınlıkta aynı piksel kalınlığı. Önizleme: `scripts/harita-skia-onizleme.js`.
export const CIZGI_BUYUME = 0.5;
// ---- HARİTA SÜSLERİ (Görev 20 · Baki, 2026-09-24: "B olsun" + "denizde hafif dalga") ----
// Harita düz renkli bir veri haritası gibi duruyordu. Eski atlaslardaki gibi: kıyıda denizin
// koyulaşan gölgesi, dağlık bölgede dağ, tepelik bölgede tepe, denizde dalga çizgisi.
// Yerleri `veri/harita-susleri.json` (scripts/harita-sus-uret.js), çizim `haritaCizim.js`.
// Kalınlık ve genişlikler HARİTA BİRİMİ (harita 1000 × 452): haritayla birlikte büyürler.
// Önizleme: `onizleme/harita-skia/oneri-B-kiyi-arazi.png` (Baki'nin seçtiği).
export const HARITA_SUS = {
  hale: '#5F7A8C', // kıyı gölgesi: denizin koyusu
  haleSaydam: 0.34, // kıyıdaki koyuluk; dışa doğru sıfıra söner
  haleGenislik: 6, // gölgenin kıyıdan denize uzandığı mesafe
  murekkep: '#2B3326', // dağ ve tepe çizgisi
  murekkepSaydam: 0.6,
  cizgi: 0.42, // dağ / tepe çizgisinin kalınlığı
  isik: '#FFFFFF', // dağın aydınlık (sol) yamacı — koyu illerde de dağ görünsün diye
  isikSaydam: 0.22,
  golgeSaydam: 0.22, // gölgeli (sağ) yamaç, mürekkep renginde
  dalga: '#F2F6F8', // dalga çizgisi: denizden açık
  dalgaSaydam: 0.5,
  dalgaCizgi: 0.34,
  // Uzakta yüzlerce küçük glif bir doku gürültüsüne dönüyor: bu yakınlığın altında çizilmez.
  araziEsigi: 1.3,
  dalgaEsigi: 1.1,
};

// ---- NEHİRLER VE GÖLLER (Görev 21 · H8 — Baki: "indir") ----
// Veri Natural Earth 10m (kamu malı) → `veri/harita-nehirler.json`
// (`scripts/harita-nehir-uret.js`). Göl denizden biraz mavi; göller parçalardan OYULDUĞU için
// (`scripts/parca-gol-oy.js` — Baki: "göller parçaların içinde olmasın") kıyılarını haritanın
// sınır çizgileri çiziyor. Nehir orta mavi: hem açık hem koyu ilde okunuyor. Kalınlıklar harita
// birimi, 1× yakınlıkta; sınır çizgileri gibi yavaş kalınlaşır.
export const NEHIR = {
  renk: '#4E86B0',
  saydam: 0.9,
  buyuk: 1.0, // büyük nehir (Natural Earth ölçek sırası ≤ 5): Fırat, Dicle, Kızılırmak…
  kucuk: 0.7,
  // Göl suyu denizden biraz daha mavi. ⚠ İlk deneme denizin kendi rengiydi: Van gibi açık
  // gri-lila illerin üstünde göl neredeyse kayboldu (önizleme 15b).
  gol: '#A3BCCF',
};

// ---- HAMLE HAKKI: HALKA VE SOLUK KALKAN (Görev 21 · H3) ----
// Bu tur hâlâ oynayabilen ordunun kalkanının çevresinde dilimli bir halka: yanan dilim sayısı
// oynayabilen askerin oranı (Baki: "5 askerin 3'ü oynadıysa hepsi mi soluk olacak?" — hayır,
// halkanın 2/5'i yanar). Yanan dilimler yavaşça "nefes alır" (parlaklığı iner çıkar; süre
// `DENGE.ROZET.NEFES_SURE`). Hakkı biten ordu hafifçe solar — Baki: "çok soluk olmasın".
// Önizleme: `onizleme/harita-skia/10-hamle-hakki.png`.
export const HAMLE_HAKKI = {
  halka: '#F4F8FA', // yanan dilim — her il renginin üstünde okunsun diye koyu yatağın üstünde
  yatak: '#0E141A', // bütün dilimlerin altındaki koyu yatak (yanmayan dilim yalnız bu)
  yatakSaydam: 0.55,
  nefesEn: 0.4, // nefesin en sönük anında yanan dilimin parlaklığı (1 = hiç sönmez)
  soluk: '#C3CCD2', // hakkı biten kalkanın üstüne serilen tül
  solukSaydam: 0.42,
};

// ---- EĞİTİM PARILTISI (GOREV-20 Adım 8) ----
// Eğitimde "şimdi buraya dokun" diyen işaret: haritada bir halka ve dışa açılıp sönen bir
// dalga, düğmede nabız gibi yanıp sönen bir çerçeve. BEYAZ: 81 il renginin, kırmızı saldırı
// hedefinin ve pirinç taşıma hedefinin hiçbirine benzemesin. Koyu kontur açık illerin
// (Van, Konya gibi) üstünde de okunsun diye. Süre `DENGE.EGITIM.PARILTI_SURE`.
export const IPUCU = {
  renk: '#FFFFFF',
  kontur: '#0E141A',
  halkaCap: 46, // haritadaki halkanın çapı (ekran pikseli; yakınlaştırmayla değişmez)
  kalinlik: 3,
};

// ---- CEPHE HATTI (Görev 21 · H4) ----
// Savaştığın devletle ortak sınırın: kırmızı çizgi + düşmana bakan küçük dişler (askerî
// haritalardaki cephe işareti). Ölçüler harita birimi, 1× yakınlıkta; sınır çizgileri gibi
// yakınlaştıkça yavaş kalınlaşıyor (`CIZGI_BUYUME`), dişler de çizgiyle aynı oranda.
// ⚠ Ana menüde Baki 2026-08-03'te dişleri istememişti ("dişleri boşver") — orada BÜTÜN
// sınırlar dişliydi. Burada yalnızca savaş sınırı; yine beğenilmezse `disli: false` düz çizgi.
export const CEPHE = {
  renk: '#C0492F', // cephe kırmızısı (RENK.okSaldiri ile aynı dil)
  kalinlik: 1.9,
  disli: true,
  disEn: 4, // dişin tabanı (boyu tabanın 0.7'si)
  disAralik: 7.5, // iki diş arası
};

// ---- BİRLİK FİGÜRLERİ (Görev 21 · H10) ----
// En yakında kalkanın altındaki piyade / top / tank figürleri. Açık gövde + koyu kontur:
// her il renginin üstünde okunuyor. ⚠ İlk deneme figürü sahibinin renginde boyuyordu —
// kendi toprağının üstünde figür kayboldu, yalnızca konturu kaldı (önizleme). Sahibin rengi
// zaten hemen üstündeki kalkanda.
export const BIRLIK_FIGUR = {
  govde: '#F4F8FA',
  kontur: '#0E141A',
};

// Kalınlık her karede ayarlanmıyor (akıcılık, `haritaCizim.js` başı): yakınlık aralığı bu
// oranla bantlara bölünür, her bandın çizgisi bir kez kaydedilir. Bant değişince kalınlık
// √1.15 ≈ %7 sıçrar — göz görmüyor. Küçültmek daha çok bant (daha çok bellek, daha uzun
// hazırlık), büyütmek daha görünür sıçrama demek.
export const CIZGI_BANT_ORANI = 1.15;
// Rozet resim sayfasının parçaları (kalkan, kontur, rakam) BEYAZ çizilir; her rozet onları
// kendi rengiyle çarparak basar (`haritaCizim.js rozetAtlasiKur`). Bir renk değil, maske —
// değiştirilirse bütün rozetlerin rengi bozulur.
export const ROZET_MASKE = '#ffffff';

// ---- ASKERİ HARİTA TONU ----
// Haritanın (il/arazi/bölge dolguları + deniz) renklerini askeri/desatüre tona çeker.
// GERİ ALMAK İÇİN: aşağıyı `false` yap — tek satır, harita eski renklerine döner.
export const HARITA_ASKERI = true;

// Bir rengi askeri tona çevirir: doygunluğu düşür + hafif koyulaştır. Sonuç önbelleğe alınır.
// HARITA_ASKERI false ise renk aynen döner (böylece tek bayrakla eski hale dönülür).
const _tonCache = {};
export function askeriTon(hex) {
  if (!HARITA_ASKERI) return hex;
  if (_tonCache[hex]) return _tonCache[hex];
  const r = parseInt(hex.slice(1, 3), 16) / 255,
    g = parseInt(hex.slice(3, 5), 16) / 255,
    b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    sat = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  sat *= 0.5; // doygunluğu yarıya indir (askeri/mat)
  l = l * 0.84 + 0.04; // hafif koyulaştır
  const hue2 = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r2, g2, b2;
  if (sat === 0) r2 = g2 = b2 = l;
  else {
    const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
    const p = 2 * l - q;
    r2 = hue2(p, q, h + 1 / 3);
    g2 = hue2(p, q, h);
    b2 = hue2(p, q, h - 1 / 3);
  }
  const to = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  const out = '#' + to(r2) + to(g2) + to(b2);
  _tonCache[hex] = out;
  return out;
}

// ---- RENK KARIŞTIRICI ----
// İki rengin arasından bir ton üretir (`oran` 0 = a, 1 = b).
//
// ⚠ ÜÇ HANELİ HEX'İ ANLAMAK ZORUNDA. Bir önceki tur bu yüzden canımızı yaktı: karıştırıcı
// hex'i körü körüne dilimliyordu, `'#000'` verilince mavi kanal `NaN` çıkıyordu ve sonuç
// `'#1928NaN'` gibi GEÇERSİZ bir renk oluyordu. SVG geçersiz rengi sessizce SİYAHA
// düşürüyor — yani hata patlamıyor, sadece yanlış renk çiziliyor ve kimse fark etmiyor.
// (Ana menü önizlemesindeki cephe çizgileri tam bu yüzden siyah göründü.)
function hexAyristir(hex) {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

export function karis(a, b, oran) {
  const A = hexAyristir(a),
    B = hexAyristir(b);
  const kanal = (i) =>
    Math.round(A[i] + (B[i] - A[i]) * oran)
      .toString(16)
      .padStart(2, '0');
  return '#' + kanal(0) + kanal(1) + kanal(2);
}

// ---- EGE PALETİ — ANA MENÜ + MOD EKRANI (Görev 10A) ----
// Kesinleşen tasarım: `docs/GOREV-10A-ANA-MENU-KARARI.md`. Bu renkler menünün arkasındaki
// haritayı ve üstündeki paneli çiziyor. Oyun içi jeton tablosu (dosyanın sonu) da aynı
// aileden türetildi — Görev 10A'nın amacı buydu: tek dünya, üç değil.
//
// Panel koyu ama NÖTR DEĞİL: kendi tonu (lacivert) var. Baki'nin ilk itirazı
// "panel koyu kaçmış, net bir tona sahip olsun" idi.
export const MENU_RENK = {
  deniz: '#7FA6C4', // radyal geçişin MERKEZİ
  denizDip: '#4C6E8B', // geçişin dış ucu = karis(deniz, '#22405C', 0.55)
  denizKoyu: '#5D89AA', // kıyı halesi
  kara: '#DDE4D8', // il rengi bunun üstüne %62 karışıyor
  panel: '#31506E',
  panelSecili: '#29435E', // mod kartı seçiliyken
  yazi: '#F2F7FA', // panele karşı 7.8:1
  yaziSolu: '#BFD2E0', // köşe parantezleri, alt yazı — 5.4:1
  kiyi: '#2A4460', // kıyı çizgisi

  // ---- SINIR ÇİZGİLERİ: SİYAH (Baki, 2026-08-03) ----
  // Hem parça sınırları hem üç güç arasındaki dişli cephe çizgisi bu renkle çiziliyor;
  // ayrımı KALINLIK ve OPAKLIK yapıyor, renk değil.
  //
  // Bu bir düzeltmenin sonucu: onaylanan önizlemede cephe çizgileri bir hesap hatası
  // yüzünden siyah çıkmıştı (yukarıdaki `karis` uyarısı). Baki siyahı görüp beğendi ve
  // "öyle kalsın, mod ekranındaki mavi olanı da siyah yap" dedi. Yani siyah artık kaza
  // değil, KARAR.
  sinir: '#000000',
};

// Bir zemin renginin üstünde okunacak yazı rengi: koyu zeminde açık, açık zeminde koyu.
// Ordu rozetleri aktörün rengiyle dolduruluyor; 81 ilin rengi açıktan koyuya değişiyor,
// tek bir yazı rengi hepsinde okunmuyor. Ölçü ITU-R BT.601 parlaklığı.
export function okunakliMetin(hexZemin) {
  const r = parseInt(hexZemin.slice(1, 3), 16),
    g = parseInt(hexZemin.slice(3, 5), 16),
    b = parseInt(hexZemin.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#12181f' : '#f4f1e8';
}

// ---- AKTÖR RENGİ ----
// Aktör = oyundaki bir taraf (başlangıçta her il bir aktör). Rengi tek kapıdan geçer:
// ilin haritadaki rengi, haritayla birebir aynı tonda. Böylece panelde "Sahibi: Bursa ●"
// yazan renk ile haritadaki Bursa rengi aynı olur.
export function aktorRengi(ilHaritaRengi) {
  return askeriTon(ilHaritaRengi);
}

// ═══════════════════════════════════════════════════════════════════════════
// JETON TABLOSU — "KÂĞIT ATLAS" (Görev 10A / Adım 1)
// ═══════════════════════════════════════════════════════════════════════════
//
// YÖN: oyun bir haritadır; arayüz haritanın üstünde duran kâğıt ve lejanttır.
// Bu yüzden hiçbir zemin rengi sıfırdan icat edilmedi — hepsi haritanın kendi
// denizinden (`askeriTon(RENK.deniz)` = #b2bdc4) türetildi. Aynı renk ailesi
// (mavi-gri, ton ~205°, doygunluk ~0.13), sadece açıklık farkı.
//
// BU TABLO HENÜZ TAM KULLANIMDA DEĞİL. Adım 1'de yalnızca TANIMLANDI; bileşenler
// Adım 3–6'da buraya taşınıyor. Yani şu an bazı jetonların kullanımı sıfır — bu
// bir eksik değil, sıranın gereği.

// ═══ 60 / 30 / 10 ═══
// Baki'nin kuralı (2026-08-02): *"oyunun genelinde 60 30 10 kuralına uy."*
//
//   %60  ZEMİN      — Ege laciverti ailesi. Ekranın hâkim kütlesi.
//   %30  MÜREKKEP   — açık mavi-beyaz yazı, çizgi ve ikonlar. İkinci kütle.
//   %10  VURGU      — kiremit. YALNIZCA saldırı ve eksi değerler. Başka hiçbir yerde.
//
// Kuralın pratikteki karşılığı: bir ekrana bakınca gözün gördüğü şeyin çoğu lacivert,
// üstündeki her şey açık mavi, ve ekranda tek bir sıcak leke var. İkinci bir sıcak leke
// eklemek 10'u 20 yapar ve vurgu vurgu olmaktan çıkar.
//
// ⚠ GELİR (+) ARTIK AİLENİN İÇİNDEN ÇIKMIYOR — ve bu bilinçli.
// Koyu yeşil dünyada `arti` "%60 ailesinin en açık ucu" idi: mürekkep KREM olduğu için
// açık yeşil bir "+" ondan kolayca ayrılıyordu. Ege'de mürekkebin KENDİSİ açık mavi;
// ailenin açık ucunu almak "+"yı sıradan yazıyla aynı renge sokardı ve sayının işareti
// okunmaz olurdu. Bu yüzden `arti` mat bir deniz yeşili — dördüncü bir renk, ama VURGU
// değil VERİ rengi: düğmelerde, zeminlerde, çerçevelerde asla kullanılmıyor.

// ---- ZEMİN KATMANLARI (%60) ----
// Açıklık merdiveni (koyudan açığa): çukur → taban → yüzey → kabartma.
//   çukur    : panel içindeki oyulmuş satır
//   taban    : ekranın en alt katmanı (menüler, perdenin altı)
//   yüzey    : panel ve açılır ekranların zemini — EN ÇOK GÖRÜLEN RENK
//   kabartma : seçili / öne çıkan yüzey
// Yüzey tabandan AÇIK olduğu için panel "üstte" durur; çukur yüzeyden koyu olduğu için
// içeri gömülü durur. Merdiven bozulursa derinlik kaybolur.
//
// ---- NEDEN EGE LACİVERTİ (2026-08-03, koyu yeşilin yerine) ----
// Ana menü ve mod ekranı "Ege" paletinde kesinleşince (`MENU_RENK`) oyun içi arayüzün
// koyu yeşil kalması ÜÇÜNCÜ BİR DÜNYA yaratırdı — yani Görev 10A'nın çözmeye çalıştığı
// kusurun aynısı. Merdiven artık menü panelinin kendi renginden türüyor:
// `yuzey` = `MENU_RENK.panel`. Menüden oyuna geçince zemin DEĞİŞMİYOR.
//
// Dördü de tek bir ton/doygunluktan (209°, %38) çıkıyor; aralarındaki tek fark AÇIKLIK.
// Yeşil merdivenin açıklık oranları korundu, böylece derinlik hissi birebir aynı kaldı.
//
// Kiremit vurgusu lacivertten 161° uzakta (yeşilde 127° idi) — yani zeminde erimesi
// eskisinden bile zor.
//
// ⚠ HARİTA BU MERDİVENE DAHİL DEĞİL. Harita açık kalıyor (81 il paleti kilitli, görev
// belgesi §6). Yani arayüz artık "açık haritanın koyu çerçevesi" — duvara asılmış
// haritanın çerçevesi gibi. Bu bilinçli bir tercih: Görev 10A'nın asıl kusuru karanlık
// olması değil, ÜÇ ayrı paletin birbirini tanımamasıydı. Tek ton + tek vurgu kaldı.
export const ZEMIN = {
  harita: askeriTon(RENK.deniz), // #b2bdc4 — haritanın kendi zemini (MEVCUT, değişmez)
  cukur: '#203448', // panel içi oyuk satır (yüzeye 1.52:1)
  taban: '#29435C', // ekranın en alt katmanı (1.22:1)
  yuzey: MENU_RENK.panel, // panel / açılır ekran zemini — %60'ın kendisi
  kabartma: '#3E658B', // seçili yüzey (1.37:1)
};

// ---- ÇİZGİ (%30 ailesi) ----
// Kutular kalktığı için bilgiyi gruplayan TEK şey bu çizgiler; silikleşirlerse panel
// birbirine karışmış bir yazı yığınına döner. Koyu zeminde çizgi zeminden AÇIK olur.
export const CIZGI = {
  ince: '#4B7BA8', // kutu kenarı / kart çerçevesi (1.88:1) — görünür ama sessiz
  kalin: RENK.ilSinir, // il sınırı (haritada) — mevcut, değişmez
  ayrac: '#416A92', // panel içi ayraç (1.48:1) — sadece "burada satır bitti" der
};

// ---- MÜREKKEP (%30) ----
// Koyu zeminde yazı AÇIK olur. Üçü de `yuzey` (#31506E) üstünde ÖLÇÜLDÜ
// (WCAG 2.1 kontrast oranı, tahmin değil) — `scripts/tema-olcum.js` yeniden ölçer.
//
// ⚠ ORANLAR YEŞİL DÜNYAYA GÖRE DÜŞTÜ ve bu kaçınılmaz: Ege laciverti koyu yeşilden
// AÇIK. Aynı yazı rengi daha açık bir zeminde daha az ayrışır. `birincil` 10.1 → 7.8'e
// indi ama hâlâ WCAG'ın en katı eşiğinin (7:1) üstünde; bu değer zaten karar belgesinde
// "panele karşı 7.8:1" diye kilitlenmişti.
//
// `birincil` ve `ikincil` menüyle AYNI iki renk (`MENU_RENK.yazi` / `yaziSolu`) — menüde
// ve oyunda yazının rengi ayrışmasın diye. `soluk` onların bir basamak zayıfı.
//
// `soluk` bilinçli olarak zayıf — YALNIZCA birim adı, damga, dipnot gibi okunmasa da
// oyunun anlaşıldığı yazılar için. Önemli hiçbir bilgi `soluk` olmaz. En koyu katmanda
// (`cukur`) daha da zayıflar; orada ölçüt yazısı `ikincil` olmalı.
export const YAZI_RENK = {
  birincil: MENU_RENK.yazi, // başlık, sayı, karar (yüzeyde 7.8:1)
  ikincil: MENU_RENK.yaziSolu, // etiket, açıklama (5.4:1)
  soluk: '#9FB6C8', // birim, dipnot, damga (4.0:1)
};

// ---- VURGU: TEK RENK (%10) ----
// Kiremit. DEĞERİ DEĞİŞMEDİ — Ege'ye geçerken tek dokunulmayan renk bu oldu.
//
// KURAL: bu renk YALNIZCA SALDIRI ve EKSİ DEĞER için kullanılır. Başka hiçbir yerde
// vurgu yoktur; bir şeyi öne çıkarmak gerekiyorsa punto, kalınlık veya boşlukla yapılır.
// %10'un anlamı bu — ekranda tek sıcak leke.
//
// ---- NİYE AÇILMADI (ölçüldü, sonra vazgeçildi) ----
// Zemin açıldığı için kiremidin zemine kontrastı 2.60 → 1.76:1'e düştü. İlk tepki
// "kiremidi de açalım" oldu ve denendi: 2.60'ı yakalamak için gereken açıklıkta
// (#D17866) üstündeki BEYAZ YAZI 3.19:1'e iniyor — yani düğme zeminden ayrılsın diye
// düğmenin yazısı okunmaz oluyordu. İkisi aynı anda olmuyor.
//
// Seçim: yazı kazandı. Düğmenin zeminden ayrılmasını RENK AÇISI taşıyor — kiremit ile
// lacivert arasında 161° var (yeşilde 127° idi), yani göz onları parlaklıktan değil
// tondan ayırıyor. Üstündeki beyaz yazı 4.78:1 ile AA eşiğinin üstünde kaldı.
export const VURGU = {
  saldiri: '#BE5039',
  saldiriBasili: '#9C4029', // basılı durum — aynı renk, koyusu
  uzeriYazi: '#FFFFFF', // dolgunun üstünde okunan yazı (4.78:1)
};

// ---- DURUM RENKLERİ ----
// Vurgu DEĞİL: bunlar veri renkleri (sayının işareti). 60/30/10 bozulmuyor çünkü ekranda
// hâlâ tek SICAK leke var — deniz yeşili soğuk bir renk ve yalnızca sayının yanında,
// bir kelime genişliğinde görünüyor.
//
// `arti` neden ailenin içinden değil: yukarıdaki 60/30/10 bloğunda anlatıldı — Ege'de
// mürekkebin kendisi açık mavi, ailenin açık ucu "+"yı sıradan yazıyla aynı renge sokardı.
//
// Deniz yeşili mürekkepten TONLA ayrılıyor (140° / 206°, yani 66°), parlaklıkla değil —
// ikisi arasında 1.13:1 var. Yeşil dünyada da tam olarak böyleydi (orada da 1.13): ayrımı
// hep ton taşımış, ölçü değişmedi.
// ---- `eksi` NİYE ARTIK `VURGU.saldiri` DEĞİL (2026-08-03, ölçümle çıktı) ----
// İkisi aynı renkti ve gerekçesi "ayrı bir kırmızı icat edilmiyor" idi. Ama yaptıkları iş
// aynı değil: `saldiri` bir DOLGU (düğmenin zemini), `eksi` bir YAZI (12 çağrı yerinin
// hepsi metin ya da çerçeve — kayıp sayısı, "Mağlubiyet kesin.", yaralı notu).
//
// Dolgu ile yazının kontrast ihtiyacı farklı: dolgunun zeminden ayrılması yeter, yazının
// OKUNMASI gerekir. Koyu yeşil zeminde ikisi tek renkle idare ediyordu (2.60:1 — zaten
// sınırdaydı); açık lacivert zeminde 1.76:1'e düşünce kayıp sayıları okunmaz oldu.
// `scripts/tema-olcum.js` bunu ilk çalıştırmada yakaladı, gözle görülmemişti.
//
// Çözüm ikinci bir kırmızı DEĞİL: aynı sıcak ailenin açık ucu (kil). Ton 22°, kiremit 14°
// — yani ekranda hâlâ TEK sıcak leke var, 60/30/10 bozulmadı.
// ---- İTTİFAK HARİTASI RENKLERİ (Görev 12) ----
// Harita "ittifak" tipinde parça, sahibinin SANA GÖRE durumuna boyanıyor. Dört renk,
// dördü de haritada zaten kullanılan dilden: kendi toprağın vurgu, müttefik yeşil,
// düşman kırmızı, tarafsız sessiz gri. Bunlar ARAYÜZ rengi değil HARİTA rengi olduğu
// için `askeriTon` süzgecinden geçmiyorlar — harita zaten kendi tonunda çiziliyor.
export const ITTIFAK_RENK = {
  ben: '#D9C27A', // senin toprağın — haritanın en dikkat çeken tonu
  ittifak: '#7FB894', // müttefik (DURUM.arti ailesinden, haritada okunacak kadar doygun)
  savas: '#C77B63', // savaş halinde (DURUM.eksi ailesinden)
  tarafsiz: '#9AA7B2', // tarafsız — sessiz, geri planda
};

// ---- DİPLOMASİ HARİTASI (Görev 20 · Baki: "hangi il neye göre gözüküyor orada") ----
// Diplomasi ekranının solundaki küçük Türkiye. Listedeki devletler KENDİ RENKLERİNDE
// (haritadaki `AKTOR_RENKLERI`), listede olmayanlar SİS: panelden koyu, tek parça — toprağı
// orada ama seninle henüz bir işi yok. Kimin neden listede olduğu böylece yazısız okunuyor:
// sınırına değen, bölgende duran ya da uzakta büyüyen.
// ⚠ İlk deneme sis için panelin AÇIĞIYDI (#44637F): 81 ilin askeri tonlarının bir kısmı
// mavi-gri olduğu için listedekilerle karıştı (önizlemede görüldü). Sis artık panelden koyu.
export const DIPLOMASI_HARITA = {
  sis: '#1E3043', // listede olmayanların toprağı: TEK PARÇA koyu sis (iç sınır çizilmez)
  kiyi: MENU_RENK.kiyi, // ülke hattı
  sinir: MENU_RENK.sinir, // devletler arası sınır (siyah, düşük opaklık)
  secili: MENU_RENK.yazi, // seçili devletin çevresi — ekranın en açık rengi
  ben: '#D9C27A', // SENİN toprağının çevresi (= ITTIFAK_RENK.ben, haritadaki "sen")
};

export const DURUM = {
  arti: '#95D0A9', // gelir +, kazanç (yüzeye 4.74:1 — AA eşiğinin üstünde)
  eksi: '#E7B598', // gider −, kayıp — YAZI olarak kullanılıyor (4.58:1)
};

// ---- MÜHÜR ----
// Menü ekranlarının ortasındaki mum mührü damgası. Eskimiş pirinç.
// Bu bir ARAYÜZ rengi değil, bir marka işareti: yalnızca `Muhur.js` kullanır ve orada
// da çok düşük opaklıkla. Bu yüzden 60/30/10 hesabına girmiyor — ekrandaki payı
// bir fısıltı kadar.
export const MUHUR_RENK = '#C8A465';
// Kalıbın mumun içine bastığı yer. Mühür gövdesinin ÜSTÜNE binen koyu bir gölge —
// gövdeyle aynı renkte çizilince halkalar ve Türkiye görünmüyordu (ilk deneme düz bir
// leke çıktı). Saydam siyah seçilmesinin sebebi: gövde zaten opak, bu gölge onun
// üstünde duruyor, yani mühür hangi zemine konursa konsun aynı görünüyor.
export const MUHUR_OYUK = 'rgba(0,0,0,0.34)';

// ---- BOŞLUK ÖLÇEĞİ ----
// Aradaki her boşluk bu beş sayıdan biridir. 6, 9, 14 gibi ara değer yazılmaz:
// beş basamak yeterli, ara değerler hizayı gözle görülmeden bozar.
// ---- KÂĞIT YÜZEY (Görev 12 · Baki 2026-08-06) ----
//
// ┌─ BAKİ'NİN TESPİTİ ──────────────────────────────────────────────────────────────────┐
// │ *"Oyunda genel hep mavi renk var, başarımlar çok yavan olmuş."*                      │
// │ Haklıydı ve sebebi ölçülebilir: arayüzün %90'ı tek bir mavi ailesinden ve sıcak      │
// │ tarafta yalnızca SALDIR düğmesi var. Göz dinlenecek yer bulamıyor.                   │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- AYRIM: HARİTA MAVİ, BELGELER KÂĞIT ----
// Renk eklemenin en ucuz yolu yeni bir vurgu rengi atmak olurdu; onun yerine YÜZEY
// ayrımı yapıldı. Oyunun kimliği "kâğıt atlas": deniz ve harita mavi kalıyor, oyuncunun
// OKUDUĞU her şey (kurallar, mühürler, ordu dökümü, tur raporu) parşömene taşınıyor.
// Böylece renk çeşitliliği süs olarak değil, BİLGİ SINIFI olarak geliyor: mavi ekran
// "oyun oynuyorsun", kâğıt ekran "belge okuyorsun" demek.
//
// ⚠ KÂĞIDIN KENDİ YAZI RENKLERİ VAR. Koyu zeminin yazı renkleri (`YAZI_RENK`) açık
// kâğıtta okunmaz — birebir tersi gerekiyor. Bu yüzden `KAGIT` kendi üçlüsünü taşıyor
// ve kontrastları `scripts/tema-olcum.js` ölçüyor (Görev 10A'nın en pahalı dersi:
// zemin değişince üstündeki HER ŞEYİN kontrastı yeniden ölçülür).
//
// ---- PARŞÖMENDEN KIRIK BEYAZA (Görev 21 · Baki, 2026-09-24) ----
// *"Bazı arayüz ekranlarında açık sarı gibi renkler var, beğenmiyorum."* Sararmış parşömen
// (#E8E0CE) kalktı; seçenekler sayfasından (`onizleme/renk-secenekleri.html`, A–D) Baki
// **A — kırık beyaz**'ı seçti: soğuk, temiz, harita mavisiyle akraba. Yüzey ayrımı (mavi =
// oyun, açık = belge) aynen duruyor. Saf beyaz DEĞİL: ekranda beyaz sert.
// Yan bulgu: parşömendeki `yaziSoluk` 3.4:1'di (yorumda 4.2 yazıyordu — yanlıştı); şimdi 4.3.
// Oranlar `veri/tema-olcum.md`'de ölçülü; aşağıdaki yorumlardakiler o ölçümden.
export const KAGIT = {
  yuzey: '#E4E8EB', // kırık beyaz — soğuk kâğıt
  cukur: '#D5DBE0', // kâğıt üstünde oyuk satır / tablo şeridi
  kabartma: '#F1F4F6', // seçili satır — kâğıdın açık tarafı
  yazi: '#1E2A35', // başlık ve karar yazısı (kâğıtta 11.9:1)
  yaziIkincil: '#3A4A57', // etiket ve açıklama (7.4:1)
  yaziSoluk: '#5F6D79', // dipnot, birim (4.3:1 — bilerek zayıf)
  cizgi: '#AAB5BE', // kutu kenarı ve ayraç — mürekkep değil, kâğıdın kendi gölgesi
  murekkep: '#27384A', // mühür ve ikon çizimi: koyu mürekkep
  murekkepSoluk: '#8C9AA4', // kazanılmamış mühür — solmuş mürekkep
  // ⚠ DURUM RENKLERİNİN KÂĞIT KARŞILIĞI. `DURUM.arti/eksi` açık ve yumuşak tonlar —
  // koyu zeminde parlıyorlar, kâğıtta ise yok oluyorlar (yeşil 1.5:1'e düşüyor).
  // Aynı anlam, koyu mürekkep hâli.
  arti: '#2F6B45', // kazanç, müttefik, olumlu (kâğıtta 5.1:1)
  eksi: '#9B3B22', // kayıp, savaş, geri alınamaz (5.6:1)
};

// ---- MÜHÜR METALLERİ (Görev 12 · Baki 2026-08-06) ----
//
// > *"Mühürlere metal kademesi eklenebilir ama panellere metalik doku YANSIMASIN."*
//
// Metal YALNIZCA mühürün kendisinde: çerçeve halkası ve glif. Panel zeminleri, çizgiler,
// yazılar kâğıt paletinde kalıyor. Sınır net — metalik doku bir ÖDÜL işareti, bir yüzey
// dili değil. Yüzey dili kâğıt; metal onun üstüne basılan madalyonun kendisi.
//
// ---- HER KADEME ÜÇ TON ----
// Metal görüntüsü tek renkle olmuyor: madenin görünmesi için KOYU gövde + PARLAK ışık
// gerekiyor. Üçlü (koyu → parlak → orta) bir eğimle çiziliyor, yani gerçek bir doku
// (resim) değil — SVG geçişi. Böylece ölçeklenince bozulmuyor ve dosya boyutu artmıyor.
//
// ⚠ TONLAR KÂĞIDA GÖRE SEÇİLDİ. Klasik bronz/altın (#CD7F32, #FFD700) açık parşömende
// 1.6:1'e düşüyor — ışıltı gibi değil, silik bir leke gibi duruyor. Buradaki gövde
// tonları koyu tarafta; ölçüm `veri/tema-olcum.md`'de.
export const METAL = {
  bronz: { govde: '#7A4A22', parlak: '#C08A4E', orta: '#95602F' },
  gumus: { govde: '#4E5A66', parlak: '#AEBAC4', orta: '#6E7C89' },
  altin: { govde: '#7E611A', parlak: '#D9B24C', orta: '#A07F28' },
};

export const BOSLUK = { cokDar: 4, dar: 8, orta: 12, genis: 16, cokGenis: 24 };

// ---- KÖŞE ----
// Baştaki kural "kutu 0" idi (atlas sayfasının köşesi keskindir). 2026-08-02'de Baki
// cihazda görüp *"köşeleri çok az yumuşat, çok küçük radüs ekle"* dedi — 0 fazla sertti.
// 2 dp: köşenin kesildiği fark edilmiyor ama kenar bıçak gibi durmuyor.
// Düğme hâlâ daha yuvarlak, çünkü yuvarlaklık tek bir şey anlatıyor: "buraya basılır."
export const KOSE = { kutu: 2, dugme: 5 };

// ---- PUNTO ÖLÇEĞİ ----
// `olcu.js`'in telefon/tablet kararına bağlı. İki HAZIR nesne var, her çağrıda yenisi
// üretilmiyor: `React.memo`'lu bileşenlere giden her şeyin kimliği sabit olmalı
// (CLAUDE.md §6 — türetilmiş nesnenin kimliği her hamlede değişirse hafızalama çalışmaz).
//
// Satır yüksekliği HER ZAMAN açıkça yazılır: `fontSize` verip `lineHeight` vermemek
// yerleşim hesabını tahmine çevirir (altıncı turda menü tam bu yüzden taşmıştı).
const PUNTO_TELEFON = { minik: 9, kucuk: 11, orta: 12, buyuk: 15, dev: 20 };
const PUNTO_TABLET = { minik: 10, kucuk: 12, orta: 14, buyuk: 17, dev: 23 };

export function puntolar(telefon) {
  return telefon ? PUNTO_TELEFON : PUNTO_TABLET;
}

export function satir(punto) {
  return Math.round(punto * 1.3);
}
