// BİRİM FİGÜRLERİNİN ŞEKLİ — piyade, topçu, zırhlı (24×24'lük kutuda).
//
// NEDEN AYRI DOSYA (Görev 20 / kadro şeridi). Şekiller `bilesenler/Ikonlar.js`'in içindeydi;
// kullanıcıları SVG ekranlarıydı (araştırma, savaş gösterisi). Skia haritası da AYNI
// figürleri kalkanın altındaki kadro şeridinde çiziyor ve o dosya (`haritaCizim.js`)
// bilgisayarda da çalışıyor — React Native'i tanıyan bir dosyadan şekil alamaz. İki kopya
// CLAUDE.md §5/5'in tuzağı olurdu (`rozetSekli.js` ile aynı gerekçe).
//
// Her figür AYRI parçaların dizisi: parçalar tek tek doldurulur. Tek bir yol olarak
// birleştirilseler, üst üste binen parçalar dolgu kuralı yüzünden birbirini delebilirdi.
// Şekillerin tasarım gerekçesi `Ikonlar.js`'te (BİRİM İKONLARI başlığı).

// Yuvarlak (daire) — SVG'nin iki yay komutuyla.
function daire(cx, cy, r) {
  return (
    'M' +
    (cx - r) +
    ' ' +
    cy +
    ' a' +
    r +
    ' ' +
    r +
    ' 0 1 0 ' +
    2 * r +
    ' 0 a' +
    r +
    ' ' +
    r +
    ' 0 1 0 ' +
    -2 * r +
    ' 0 Z'
  );
}

// PİYADE — cepheden çelik miğfer: kubbe + geniş siperlik.
export const PIYADE = [
  'M4.2 14.2 C4.2 8.6 7.7 5 12 5 C16.3 5 19.8 8.6 19.8 14.2 Z',
  'M2.6 14.6 h18.8 c0.7 0 1.2 0.5 1.2 1.2 v0.9 c0 0.7 -0.5 1.2 -1.2 1.2 H2.6 c-0.7 0 -1.2 -0.5 ' +
    '-1.2 -1.2 v-0.9 c0 -0.7 0.5 -1.2 1.2 -1.2 Z',
];

// TOPÇU — yukarı eğik namlulu obüs: namlu, ağız freni, kundak, iki tekerlek.
// Ağız freni eskiden döndürülmüş bir dikdörtgendi (−43.5°, köşe yuvarlağı 0.9); burada
// köşeleri hesaplanmış dörtgen — 24'lük kutuda fark görünmüyor.
export const TOPCU = [
  'M7.4 15.8 L19.2 4.6 l2.5 2.6 L9.9 18.4 Z',
  'M17.67 5.03 L21.01 1.86 L22.73 3.67 L19.39 6.84 Z',
  'M3.2 17.2 h9.4 l-2.2 3.1 H4.6 Z',
  daire(6.1, 19.9, 2.4),
  daire(12.6, 19.9, 1.7),
];

// ZIRHLI — paletli gövde: taret + gövde tek parça, altında palet bandı.
export const ZIRHLI = [
  'M7.6 8.4 h6.2 c0.9 0 1.5 0.6 1.5 1.4 v1.5 h4.9 v1.9 H3.1 v-1.9 h2.9 V9.8 c0 -0.8 0.6 -1.4 ' +
    '1.6 -1.4 Z',
  'M3.4 14.4 h17.2 c1.2 0 2.1 0.9 2.1 2.1 v1.4 c0 1.2 -0.9 2.1 -2.1 2.1 H3.4 c-1.2 0 -2.1 -0.9 ' +
    '-2.1 -2.1 v-1.4 c0 -1.2 0.9 -2.1 2.1 -2.1 Z',
];
// Palet dişleri — ekranlarda yarı saydam (`Ikonlar.js`). Haritanın şeridinde çizilmiyor:
// o boyutta görünmüyorlar.
export const ZIRHLI_DIS = [daire(6.1, 17.2, 1.15), daire(12, 17.2, 1.15), daire(17.9, 17.2, 1.15)];

// Tür → figür. Sıra da buradan: şeritte piyade, topçu, zırhlı.
export const BIRIM_SEKLI = { piyade: PIYADE, topcu: TOPCU, zirhli: ZIRHLI };
export const BIRIM_SIRASI = ['piyade', 'topcu', 'zirhli'];

// Figür kutusunun kenarı (şekiller bu ölçüde çizildi).
export const BIRIM_KUTU = 24;
