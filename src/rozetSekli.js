// ORDU ROZETİNİN ŞEKLİ — kalkan ve üstündeki işaretler (26×26'lık kutuda).
//
// NEDEN AYRI DOSYA (Görev 20). Şekil `bilesenler/Rozet.js`'in içindeydi ve orada doğruydu;
// tek kullanıcısı SVG haritasıydı. Skia haritası da AYNI kalkanı çiziyor (`haritaCizim.js`)
// ve o dosya bilgisayarda da çalışmak zorunda (önizleme betiği, testler) — yani React
// Native'i tanıyan bir dosyadan şekil alamaz. İki kopya yazmak CLAUDE.md §5/5'in tuzağı
// olurdu: bir gün biri kalkanı düzeltir, öteki eski hâliyle kalır.
//
// Şekillerin gerekçeleri (26 piksellik ölçüm, çentiğin kalkan içinde kalması, komutan
// konturu) `Rozet.js`'in başında yazılı; burada yalnızca ölçüler var.

// Kalkan: düz omuzlar + yanlardan aşağı daralıp uca inen klasik biçim.
// x 1.8–24.2 (22.4 geniş), y 1.2–25.0 (23.8 yüksek) — kutuyu taşırmıyor.
export const KALKAN =
  'M13 1.2 L24.2 4.0 V13.8 C24.2 19.3 19.6 23.2 13 25.0 C6.4 23.2 1.8 19.3 1.8 13.8 V4.0 Z';

// Üst kenardaki ince ışık şeridi — kalkana hacim hissi verir.
export const PARLAKLIK = 'M13 1.2 L24.2 4.0 V6.6 L13 4.0 L1.8 6.6 V4.0 Z';

// Yıpranmış ordu çentiği (Görev 06 / Adım 6) — kalkanın alt kısmında, kalkanın içinde.
export const YIPRANMA = 'M5.0 19.4 L21.0 19.4 L19.2 21.4 L6.8 21.4 Z';

// Kalkanın kenar kalınlığı: normal ve komutanlı (Görev 16 / Adım 6 — kontur pirince döner).
export const KONTUR = 2.6;
export const KOMUTAN_KONTUR = 3.2;

// Kutunun kenarı (şekiller bu ölçüde çizildi).
export const KUTU = 26;

// HAMLE HAKKI HALKASI (Görev 21): kalkanın çevresinde DILIM dilim; merkezi kalkanın ortası.
// Yarıçap kalkanın en uzak köşesinden (~14.4) ve konturdan (1.3) dışarıda kalacak kadar.
export const HALKA = {
  MERKEZ_X: 13,
  MERKEZ_Y: 13.1,
  YARICAP: 17.4,
  KALINLIK: 2.1, // yanan dilim
  YATAK: 3.3, // altındaki koyu yatak (yanan dilimin iki yanından taşar)
  DILIM: 10, // halka kaç dilim — oran bu çözünürlükle gösterilir
  ARALIK: 9, // iki dilim arası boşluk (derece)
};
