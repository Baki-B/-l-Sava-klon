// ARAYÜZ ENVANTERİ VE GÜZELLEŞTİRME ÖNERİLERİ (Görev 21 · Baki, 2026-09-24: "arayüz
// tasarımının tüm detaylarını ver, onda güzelleştirmeler yapalım" + "veri haritasından
// çıkarmanın başka yollarını da düşün").
//
// Çalıştırma:  node scripts/arayuz-envanteri.js
// Çıktı:       onizleme/arayuz.html   (tarayıcıda: node scripts/onizleme-sunucu.js →
//              http://localhost:4173/onizleme/arayuz.html)
//
// RENKLER ELLE YAZILMIYOR: `src/tema.js` doğrudan okunup her jeton kendi rengiyle
// çiziliyor — sayfa kodla asla ayrışmaz (CLAUDE.md §5/5). Yazı yükü de
// `veri/metin-olcum.md`'den okunuyor. Elle yazılan tek şey ekranların tarifi ve öneriler;
// bu betik onların TEK kaynağı (görev belgesi buraya işaret ediyor, listeyi kopyalamıyor).
// Harita görüntüleri `harita-skia-onizleme.js` ve `gorsel-oneri.js`'in çıktıları — önce
// onlar koşulmalı.

const fs = require('fs');
const path = require('path');
const T = require('../src/tema.js');

const KOK = path.join(__dirname, '..');
const CIKTI = path.join(KOK, 'onizleme', 'arayuz.html');

// ---- Yazı yükü: metin ölçümünden dosya başına kelime ----
const metin = {};
try {
  const md = fs.readFileSync(path.join(KOK, 'veri', 'metin-olcum.md'), 'utf8');
  for (const m of md.matchAll(/\| `([^`]+)` \| [^|]+ \| (\d+) \| (\d+) \|/g))
    metin[m[1]] = { kelime: +m[2], uzun: +m[3] };
} catch (e) {
  // ölçüm yoksa sütun boş kalır
}
const yuk = (dosyalar) => {
  let k = 0,
    u = 0;
  for (const d of dosyalar) {
    if (!metin[d]) continue;
    k += metin[d].kelime;
    u += metin[d].uzun;
  }
  return k ? k + ' kelime' + (u ? ' · ' + u + ' uzun cümle' : '') : '—';
};

// ---- Görüntüler sayfanın İÇİNE gömülüyor: sayfa tek dosya olarak gönderilebilsin (görüntüler
// ayrı dosyada kalırsa başka yerde açılınca kaybolur). Görüntü yoksa yol olduğu gibi kalır.
const resim = (ad) => {
  try {
    return (
      'data:image/png;base64,' + fs.readFileSync(path.join(KOK, 'onizleme', ad)).toString('base64')
    );
  } catch (e) {
    return ad;
  }
};

// ---- Kontrast (WCAG 2.1) ----
function parlaklik(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    })
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
}
function kontrast(a, b) {
  const [x, y] = [parlaklik(a), parlaklik(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ---- RENK GRUPLARI (tema.js'ten) ----
const GRUPLAR = [
  ['ZEMIN', 'Oyun ekranlarının zemini (lacivert, "komuta masası")'],
  ['CIZGI', 'Kutu kenarları ve ayraçlar'],
  ['YAZI_RENK', 'Lacivert zemin üstündeki yazı'],
  ['VURGU', 'TEK sıcak renk: yalnızca saldırı'],
  ['DURUM', 'Artı / eksi değer'],
  ['KAGIT', 'Belge ekranları (kâğıt): tur raporu, mühürler, ordular, komutan, yardım'],
  ['METAL', 'Mühür madenleri (bronz · gümüş · altın)'],
  ['MENU_RENK', 'Ana menü ve Ege haritası'],
  ['ITTIFAK_RENK', 'Harita "ittifak" görünümü'],
  ['DIPLOMASI_HARITA', 'Diplomasi ekranındaki küçük Türkiye'],
  ['HARITA_SUS', 'Harita süsleri: kıyı gölgesi, dağ, tepe, dalga (Görev 20)'],
  ['RENK', 'Haritanın kendi renkleri (deniz, sınır, hedef, ok)'],
  ['ARAZI_RENK', 'Arazi görünümü'],
  ['BOLGE_RENK', 'Bölge görünümü'],
  ['PANEL', 'Eski koyu dünyanın artıkları (rozet, pirinç, gölge)'],
  ['PERDE', 'Açılır ekranların arkasındaki karartma'],
];
function renkler(obj, onEk = '') {
  const cikti = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && /^(#|rgba?\()/.test(v)) cikti.push([onEk + k, v]);
    else if (v && typeof v === 'object') cikti.push(...renkler(v, onEk + k + '.'));
  }
  return cikti;
}

// ---- EKRANLAR (elle; kaynak dosyaları okunarak yazıldı) ----
const EKRANLAR = [
  // [ad, nereden açılır, zemin, içindekiler, dosyalar, not]
  [
    'Ana menü',
    'Uygulama açılınca',
    'Lacivert panel, Ege haritası mozaiği',
    'SEFERE DEVAM · YENİ SEFER · HAREKÂT ARŞİVİ · MÜHÜRLER · AYARLAR · EĞİTİM; arkada üç gücün fetih döngüsü, ortada mum mührü',
    ['bilesenler/AnaMenu.js'],
    "Güçlü: haritanın kendisi zemin, hareket var. Görev 10A'da kesinleşti.",
  ],
  [
    'Mod seçimi',
    'YENİ SEFER',
    'Lacivert kartlar',
    'Üç kart (Fetih · %50 Hâkimiyet · Güç Yarışı), her birinde modun kazanma hâlini gösteren mini harita',
    ['bilesenler/ModSecimi.js', 'bilesenler/ModLogolari.js'],
    'Metinsiz anlatımın iyi örneği: mini harita = kazanma hâli.',
  ],
  [
    'İl seçimi',
    'Mod seçiminden sonra',
    'Harita',
    'Yakınlaşan Türkiye, il seçilir, BAŞLA',
    ['bilesenler/IlSecimi.js'],
    'Seçilen ilin gücü (nüfus, ekonomi, ordu) sayıyla değil his olarak gösterilebilir.',
  ],
  [
    'Harekât Arşivi',
    'Ana menü',
    'Lacivert',
    'Üç kayıt yuvası: mod, tur, ilerleme; silme (çöp kutusu)',
    [],
    'Yuvada o maçın küçük haritası olsaydı hangi maç olduğu okumadan anlaşılırdı.',
  ],
  [
    'Genel ayarlar',
    'Ana menü → AYARLAR',
    'Lacivert',
    'Harita motoru (yeni/eski), titreşim, gösterim',
    ['bilesenler/GenelAyarlar.js'],
    '',
  ],
  [
    'Mühürler (başarımlar)',
    'Ana menü',
    'KÂĞIT',
    'Rütbe, mühür ızgarası (bronz/gümüş/altın metal çerçeve)',
    ['bilesenler/BasarimEkrani.js', 'oyun/basarimlar.js'],
    'Kâğıt + metal dili oturmuş. Mühür açıklamaları 225 kelime.',
  ],
  [
    'Nasıl Oynanır',
    'Ana menü → EĞİTİM · ayar menüsü',
    'KÂĞIT',
    'Kurallar: birlikler, arazi, moral, bozgun, şans, diplomasi…',
    ['bilesenler/YardimEkrani.js'],
    'Oyunun en uzun metni. Eğitim gelince küçülmeli; o zamana dek resimli kart olabilir.',
  ],
  [
    'HARİTA',
    'Maç başlayınca, tam ekran',
    'Deniz (gri-mavi) + il renkleri',
    "Parçalar sahibinin renginde; ordu kalkanları (sayı), 4×'ten itibaren kadro şeridi (figür + sayı); yeni: kıyı gölgesi, dağ, tepe, dalga",
    ['bilesenler/HaritaSkia.js'],
    "Oyunun %80'i burada geçiyor — güzelleştirmenin asıl yeri.",
  ],
  [
    'Tur çubuğu',
    'Sağ üst, hep açık',
    'Lacivert şerit',
    'Tur · nüfus ve ekonomi havuzu + tur başı gelir · hedef ilerlemesi · araştırma · diplomasi (zarf rozeti) · günlük · TURU BİTİR',
    ['bilesenler/TurCubugu.js'],
    'Kaynaklar yazıyla ("nüfus", "ekonomi"); simge yok. TURU BİTİR diğer düğmelerle aynı boyda.',
  ],
  [
    'Ayar menüsü',
    'Sağ üstteki dişli',
    'Lacivert',
    'Kaydet/yükle, zorluk, gösterim, ORDULARIM, KOMUTAN, NASIL OYNANIR, ana menü',
    ['bilesenler/AyarMenusu.js'],
    'Ordularım ve Komutan gibi oyun ekranları "ayar"ın içinde saklı.',
  ],
  [
    'Harita tipi düğmeleri',
    'Sağ alt, hep açık',
    'Lacivert şerit',
    'İl · arazi · bölge · ittifak · il sınırları',
    [],
    'Beş düğme sürekli ekranda; çoğu oyuncu il görünümünde kalıyor.',
  ],
  [
    'Bölge paneli',
    'Bir bölgeye dokununca (kendi ordunda çubuktaki ⓘ)',
    'Lacivert, soldan şerit',
    'Bölge adı, sahibi, getirisi, buradaki askerler (+ komutan simgesi), toplanma, SALDIR/TAŞI, ASKER BAS, arazi/savunma/değer, il statları, komşular',
    ['bilesenler/IlPaneli.js'],
    "Etiket–değer listesi: okunarak anlaşılıyor. Adım 7'de simge + sayı kartına dönecek.",
  ],
  [
    'Hamle çubuğu',
    'Kendi orduna dokununca, sol alt',
    'Lacivert',
    'Hedefin adı, sonuç kelimesi, iki tarafın n → m sayısı; birlik başına − sayı +, TÜMÜ, komutan, SALDIR/TAŞI',
    ['bilesenler/HamleCubugu.js'],
    'Görev 20 / Adım 5. En az metinli oyun ekranı.',
  ],
  [
    'Savaş odası',
    'Hedefe basılı tutunca',
    'Lacivert, tam perde',
    'İki sütun: gönderilecek kuvvet / karşıdakiler, arazi ve moral cümleleri, ganimet, tahmin',
    ['bilesenler/HareketEkrani.js'],
    'Hâlâ cümleli (6 uzun cümle). Artık yalnızca ayrıntı yolu.',
  ],
  [
    'Üretim',
    'Panel → ASKER BAS',
    'Lacivert kutu',
    'Birlik başına sayaç, bedel, sanayi hakkı',
    ['bilesenler/UretimEkrani.js'],
    '',
  ],
  [
    'Araştırma',
    'Tur çubuğu',
    'Lacivert',
    'Üç ağaç (piyade/topçu/zırhlı), kademe düğümleri, uçta kilitli özel yetenek; alt satırda etki ve ARAŞTIR',
    ['bilesenler/ArastirmaEkrani.js', 'oyun/arastirma.js'],
    'Görev 20: ağaç + önkoşul.',
  ],
  [
    'Diplomasi',
    'Tur çubuğu · başka devletin iline basılı tut',
    'Lacivert',
    'MASA: solda küçük Türkiye + seçilinin eylemleri ve cevabı; sağda devlet kartları. GÜÇ: sıralama',
    ['bilesenler/DiplomasiEkrani.js', 'oyun/diplomasi.js'],
    'Baki: "beğendim".',
  ],
  [
    'Komutan',
    'Ayar menüsü · panelde komutan simgesi',
    'KÂĞIT',
    "Dört yetenek kartı (simge + tek sayı), üç yıldız kademe, Silah Ustası'nda birlik, UYGULA",
    ['bilesenler/KomutanEkrani.js'],
    'Bu tur düzeltildi: kâğıt zeminde açık renk yazı vardı (okunmuyordu). Haritadaki görünüşü seçim bekliyor.',
  ],
  [
    'Ordularım',
    'Ayar menüsü',
    'KÂĞIT',
    'Bütün ordular listede, cephedekiler önce; dokununca haritada seçilir',
    ['bilesenler/OrdularimEkrani.js'],
    '',
  ],
  [
    'Tur günlüğü',
    'Tur çubuğu',
    'Lacivert',
    'Bu tur yaptıkların, toplanma emirleri',
    ['bilesenler/TurGunlugu.js'],
    '',
  ],
  [
    'Tur raporu',
    'Her tur sonunda kendiliğinden',
    'KÂĞIT',
    'Muharebe satırları, kayıplar, fetihler, gelir',
    ['bilesenler/TurRaporu.js'],
    'Oyun içinin en uzun metni. Adım 7: isteğe bağlı + haritada olay işaretleri.',
  ],
  [
    'Tur perdesi / oyun sonu',
    'TURU BİTİR · maç bitince',
    'Karartma + kutu',
    '"Dünya oynuyor" perdesi; KAZANDIN/YENİLDİN kutusu ve maç istatistikleri',
    ['bilesenler/TurPerdesi.js'],
    '',
  ],
  [
    'Sahne kartı',
    'Fetih, kayıp, kutsal savaş anları',
    'Koyu kart, harita görünür',
    'Anın başlığı, lider adı',
    ['bilesenler/SahneKarti.js'],
    '',
  ],
  [
    'Onay kutuları',
    'Geri alınamaz işler',
    'Lacivert kutu',
    'Başlık, cümle, 1–3 düğme',
    ['bilesenler/Onay.js'],
    "TURU BİTİR onayı Baki'nin isteğiyle duruyor.",
  ],
  [
    'Bildirim şeridi',
    'Kısa haberler',
    'Lacivert şerit',
    'Tek satır, kendiliğinden kaybolur',
    ['bilesenler/Bildirim.js'],
    '',
  ],
];

// ---- ÖNERİLER ----
// [kimlik, başlık, ne, neden, bedel, durum, görsel]
const ONERILER = {
  'HARİTA — veri haritasından çıkış': [
    [
      'H1',
      'Kıyı gölgesi + dağ + tepe + dalga',
      'Kıyıda denizin koyulaşması, dağlık bölgede dağ, tepelikte tepe, denizde dalga.',
      'Haritayı veri tablosu gibi değil, bir ülke gibi gösteren ilk katman.',
      'yapıldı',
      'yapildi',
      'harita-skia/4-parca-rozetleri-marmara.png',
    ],
    [
      'H2',
      'Komutan silüeti',
      'Komutanın ordusunda paşa silüeti: A büst · B ayakta · C madalyon.',
      'Baki: "komutanın komutan olduğu anlaşılmıyor, paşa aurası yok" → üç seçeneği de görünce "hiçbiri olmasın".',
      'küçük',
      'hayir',
    ],
    [
      'H3',
      'Nefes alan kalkan (hamle hakkı)',
      'Bu tur hâlâ oynayabilen ordunun kalkanında dilimli bir halka: yanan dilim sayısı oynayabilen askerin oranı (5 askerden 3 tanesi oynadıysa 2/5), yanan dilimler yavaşça parlayıp söner. Hakkı biten ordu hafifçe solar.',
      '"Hangi ordum daha oynamadı?" sorusu okumadan cevaplanır. Planın 6. adımı.',
      'orta',
      'kodda',
      'harita-skia/10-hamle-hakki.png',
    ],
    [
      'H4',
      'Cephe hattı',
      'Savaştığın devletle ortak sınır kırmızı, dişli bir çizgi (askerî haritalardaki cephe işareti).',
      'Savaşın nerede sürdüğü tek bakışta görünür; ittifak haritasına geçmek gerekmez.',
      'orta',
      'kodda',
      'harita-skia/12b-cephe-hatti-yakin.png',
    ],
    [
      'H5',
      'Kendi toprağında desen',
      'Senin bölgelerinde çok ince çapraz tarama.',
      '"Burası benim" hissi + renk körü oyuncu için yalnızca renge dayanmayan ayrım.',
      'küçük',
      'oneri',
    ],
    [
      'H6',
      'Başkent yıldızı',
      'Her devletin kurulduğu ilin merkezinde küçük bir yıldız; il düşerse yıldız söner.',
      'Harita bir hikâye anlatır: kimin nereden çıktığı, kimin başkentini kaybettiği.',
      'küçük',
      'hayir',
    ],
    [
      'H7',
      'Savaş izi',
      'Son iki turda el değiştiren bölgede kararmış bir yanık lekesi ya da çapraz kılıç.',
      'Tur raporu okumadan "neresi el değiştirdi" görünür (Adım 7 ile birlikte).',
      'orta',
      'oneri',
    ],
    [
      'H8',
      'Nehirler ve göller',
      'Kızılırmak, Fırat, Dicle, Sakarya, Yeşilırmak; Van, Tuz, Beyşehir gölleri.',
      'Gerçek coğrafya: harita tanıdık bir ülkeye döner. Veri Natural Earth (kamu malı), indirildi.',
      'orta',
      'kodda',
      'harita-skia/15b-nehir-van-golu.png',
    ],
    [
      'H9',
      'Kâğıt dokusu + kenar karartması',
      'Karanın üstünde çok hafif kâğıt greni, ekranın kenarlarında hafif kararma.',
      '"Kâğıt atlas" kimliğini haritanın kendisine taşır.',
      'küçük',
      'oneri',
    ],
    [
      'H10',
      'Birlik figürleri',
      'Yakınlaşınca kalkanın yanında piyade / top / tank figürleri (kadro şeridinin büyüğü).',
      'Polytopia hissi: sayı değil, orada duran bir ordu.',
      'orta',
      'kodda',
      'harita-skia/14-birlik-figurleri.png',
    ],
    [
      'H11',
      'İl adları',
      'Orta yakınlıkta ilin adı haritada soluk, büyük harflerle (atlas yazısı).',
      'Açıklama değil ad; oyuncu nerede savaştığını bilir.',
      'küçük',
      'oneri',
    ],
    [
      'H12',
      'Canlılık',
      'Dalgaların hafifçe kıpırdaması, sancakların dalgalanması, fethedilen bölgede kısa bir parıltı.',
      'Durağan bir resim değil, yaşayan bir dünya.',
      'orta',
      'oneri',
    ],
  ],
  'ANA EKRAN (HUD)': [
    [
      'U1',
      'Tur çubuğunda simgeler',
      'Nüfus = insan simgesi, ekonomi = sikke; tur sayısı damga gibi büyük; hedef ince bir ilerleme çubuğu.',
      'Yazılar ("nüfus", "ekonomi") kalkar, çubuk daralır.',
      'küçük',
      'oneri',
    ],
    [
      'U2',
      'Büyük TURU BİTİR',
      'Sağ altta büyük yuvarlak düğme; üstünde hâlâ hakkı olan ordu sayısı.',
      'Polytopia ve Antiyoy\'da en belirgin düğme bu; "işim bitti mi" okumadan görünür.',
      'küçük',
      'kodda',
    ],
    [
      'U3',
      'Katlanır harita tipi düğmesi',
      'Beş düğme yerine tek düğme; dokununca dört görünüm açılır.',
      'Ekranın sağ altı boşalır, harita genişler.',
      'küçük',
      'oneri',
    ],
    [
      'U4',
      'Olaylar haritada',
      'Tur raporu kendiliğinden açılmaz; olaylar haritada simgeyle, rapor çubuktaki simgeden.',
      'Planın 7. adımı.',
      'orta',
      'oneri',
    ],
    [
      'U5',
      'Ordularım ve Komutan dışarıda',
      'İkisi ayar menüsünden çıkıp tur çubuğuna simge olarak gelir.',
      'Oyun ekranları "ayar"ın içinde saklanmasın.',
      'küçük',
      'oneri',
    ],
  ],
  'EKRANLAR VE PANELLER': [
    [
      'P1',
      'Bölge paneli kart olsun',
      'Etiket–değer listesi yerine: arazi simgesi, savunma noktaları, ordu figür şeridi, simgeli eylem düğmeleri.',
      '107 kelime → sayı + simge (Adım 7).',
      'orta',
      'oneri',
    ],
    [
      'P2',
      'Savaş odası görsel',
      'İki ordu karşı karşıya figürlerle, ortada tahmin çubuğu; cümleler kalkar.',
      '170 kelime, 6 uzun cümle.',
      'orta',
      'oneri',
    ],
    [
      'P3',
      'Tur raporu gazete gibi',
      'Büyük manşet + küçük harita + olay simgeleri.',
      'Oyun içinin en uzun metni (239 kelime).',
      'orta',
      'oneri',
    ],
    [
      'P4',
      'Ekranlar kayarak açılsın',
      'Açılır ekranlar alttan kayarak, perde solarak gelsin (0,2 sn).',
      'Bugün aniden beliriyorlar; kayma "bir şey açıldı" hissi verir.',
      'küçük',
      'oneri',
    ],
    [
      'P5',
      'Tek düğme dili',
      'Üç kademe her ekranda aynı: ana eylem dolu (kiremit ya da pirinç), ikincil çerçeveli, üçüncül yalnız yazı.',
      'Bugün her ekran kendi düğmesini çiziyor.',
      'küçük',
      'oneri',
    ],
    [
      'P6',
      'İki yüzey kuralı',
      'Oyun = lacivert, belge = kâğıt; kâğıtta yalnız kâğıdın yazı renkleri.',
      'Komutan ekranı bu kuralı bozuyordu (açık yazı açık kâğıtta) — düzeltildi.',
      'yapıldı',
      'yapildi',
    ],
    [
      'P7',
      'Kayıt yuvasında küçük harita',
      "Harekât Arşivi'nde her maçın küçük haritası.",
      'Hangi maç olduğu okumadan anlaşılır.',
      'küçük',
      'oneri',
    ],
  ],
  'YAZI VE RENK': [
    [
      'T1',
      'Sayılar büyük, etiketler küçük',
      'Her yerde aynı: sayı Chakra Petch kalın ve büyük, etiketi küçük ve soluk.',
      'Tek bakışta okuma.',
      'küçük',
      'oneri',
    ],
    [
      'T2',
      'Pirinç = sen / seçili',
      'Pirinç (altın) yalnızca "senin" ve "seçili" anlamında; kiremit yalnızca saldırı.',
      'Bugün seçili bazen beyaz, bazen pirinç.',
      'küçük',
      'oneri',
    ],
    [
      'T3',
      'Simge seti birliği',
      'Bütün simgeler aynı kutu ve çizgi kalınlığında; eksik simgeler (nüfus, ekonomi, arazi türleri) çizilir.',
      'Görsel dil tek elden çıkmış gibi durur.',
      'küçük',
      'oneri',
    ],
  ],
};

// ---- HTML ----
const kacir = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const DURUM_ETIKET = {
  yapildi: ['YAPILDI', T.DURUM.arti],
  kodda: ['KODDA · TELEFONDA DENE', T.DURUM.arti],
  secim: ['SEÇİMİN BEKLİYOR', T.PANEL.pirinc],
  izin: ['İNDİRME İZNİ BEKLİYOR', T.PANEL.pirinc],
  hayir: ['İSTENMEDİ', T.YAZI_RENK.soluk],
  oneri: ['ÖNERİ', T.YAZI_RENK.ikincil],
};

let html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Arayüz Envanteri</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Chakra+Petch:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root{--zemin:${T.ZEMIN.taban};--yuzey:${T.ZEMIN.yuzey};--cukur:${T.ZEMIN.cukur};--cizgi:${T.CIZGI.ince};
--yazi:${T.YAZI_RENK.birincil};--ikincil:${T.YAZI_RENK.ikincil};--soluk:${T.YAZI_RENK.soluk};
--pirinc:${T.PANEL.pirinc};--kiremit:${T.VURGU.saldiri};--kagit:${T.KAGIT.yuzey};--kagitYazi:${T.KAGIT.yazi};
--kagitCizgi:${T.KAGIT.cizgi};--kagitIkincil:${T.KAGIT.yaziIkincil}}
*{box-sizing:border-box}
body{margin:0;background:var(--zemin);color:var(--yazi);font-family:'Chakra Petch',sans-serif;font-size:15px;line-height:1.5}
main{max-width:1080px;margin:0 auto;padding:24px 16px 64px}
h1,h2,h3{font-family:'Black Ops One',sans-serif;font-weight:400;letter-spacing:.08em;margin:0}
h1{font-size:30px}
h2{font-size:20px;margin:40px 0 12px;padding-top:12px;border-top:1px solid var(--cizgi)}
h3{font-size:14px;color:var(--ikincil);margin:18px 0 8px}
p{margin:6px 0;color:var(--ikincil)}
nav a{color:var(--pirinc);margin-right:14px;font-family:'Black Ops One';font-size:12px;letter-spacing:.1em;text-decoration:none}
.renkler{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.renk{background:var(--cukur);border:1px solid var(--cizgi);border-radius:4px;overflow:hidden}
.renk i{display:block;height:46px}
.renk b{display:block;font-size:12px;padding:4px 8px 0}
.renk span{display:block;font-size:11px;color:var(--soluk);padding:0 8px 6px}
.ornek{background:var(--yuzey);border:1px solid var(--cizgi);border-radius:4px;padding:14px 16px;margin:8px 0}
.ornek.kagit{background:var(--kagit);color:var(--kagitYazi);border-color:var(--kagitCizgi)}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{text-align:left;font-family:'Black Ops One';font-weight:400;font-size:11px;letter-spacing:.1em;color:var(--ikincil);padding:6px 8px;border-bottom:1px solid var(--cizgi)}
td{padding:8px;border-bottom:1px solid ${T.CIZGI.ayrac};vertical-align:top}
td.ad{font-weight:600;white-space:nowrap}
.kagitRozet{display:inline-block;background:var(--kagit);color:var(--kagitYazi);font-size:11px;padding:1px 6px;border-radius:3px}
.kartlar{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px}
.kart{background:var(--yuzey);border:1px solid var(--cizgi);border-radius:6px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.kart .ust{display:flex;align-items:baseline;gap:10px}
.kart .kim{font-family:'Black Ops One';color:var(--pirinc);font-size:15px}
.kart .bas{font-weight:700;font-size:15.5px;flex:1}
.kart .etiket{font-family:'Black Ops One';font-size:10px;letter-spacing:.08em;padding:2px 6px;border-radius:3px;border:1px solid}
.kart .ne{color:var(--yazi)}
.kart .neden{color:var(--ikincil);font-size:13.5px}
.kart .bedel{color:var(--soluk);font-size:12px}
.kart img{width:100%;border-radius:4px;border:1px solid var(--cizgi);margin-top:4px}
.gorseller{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:12px}
.gorseller figure{margin:0}.gorseller img{width:100%;border-radius:4px;border:1px solid var(--cizgi)}
figcaption{font-size:12.5px;color:var(--ikincil);margin-top:4px}
@media (max-width:600px){h1{font-size:24px}.gorseller{grid-template-columns:1fr}}
</style></head><body><main>
<h1>ARAYÜZ ENVANTERİ</h1>
<p>İL SAVAŞLARI'nın bugünkü görsel dili, ekran ekran. Renkler doğrudan <code>src/tema.js</code>'ten okunuyor — bu sayfa kodla aynı. Üretim: <code>node scripts/arayuz-envanteri.js</code>.</p>
<nav><a href="#kimlik">KİMLİK</a><a href="#renk">RENKLER</a><a href="#yazi">YAZI</a><a href="#harita">HARİTA</a><a href="#ekran">EKRANLAR</a><a href="#oneri">ÖNERİLER</a></nav>

<h2 id="kimlik">1. KİMLİK</h2>
<p><b style="color:var(--yazi)">Kâğıt atlas + komuta masası.</b> Harita ve oyun ekranları lacivert (Ege denizi), okunan belgeler (tur raporu, mühürler, ordular, komutan, yardım) sararmış kâğıt. Ekranda <b style="color:var(--kiremit)">tek sıcak renk</b> var: kiremit, yalnızca saldırı için. Pirinç/altın "senin / seçili / ödül" demek.</p>
<p>İki yazı ailesi: <b>Black Ops One</b> (askerî şablon — başlık, düğme) ve <b>Chakra Petch</b> (gövde, sayı). Üçüncü aile yok ve bu bilinçli.</p>
<p>Kural (CLAUDE.md §5/10): oyun kendini <b style="color:var(--yazi)">metinle anlatmaz</b> — simge, renk, biçim, tek sayı. Ölçüt Antiyoy ve Polytopia.</p>
`;

// Renkler
html += '<h2 id="renk">2. RENKLER</h2>';
for (const [ad, aciklama] of GRUPLAR) {
  const obj = T[ad];
  if (!obj) continue;
  const liste = renkler(obj);
  if (liste.length === 0) continue;
  html += `<h3>${ad} — ${kacir(aciklama)}</h3><div class="renkler">`;
  for (const [k, v] of liste)
    html += `<div class="renk"><i style="background:${v}"></i><b>${kacir(k)}</b><span>${kacir(v)}</span></div>`;
  html += '</div>';
}
const kL = kontrast(T.YAZI_RENK.birincil, T.ZEMIN.yuzey).toFixed(1);
const kK = kontrast(T.KAGIT.yazi, T.KAGIT.yuzey).toFixed(1);
html += `<p>Okunurluk (WCAG): lacivert zeminde ana yazı <b>${kL}:1</b>, kâğıtta <b>${kK}:1</b>. Her zemin değişikliğinde <code>scripts/tema-olcum.js</code> yeniden ölçer.</p>`;

// Yazı
html += `<h2 id="yazi">3. YAZI</h2>
<div class="ornek"><div style="font-family:'Black Ops One';font-size:24px;letter-spacing:.1em">SEFERE DEVAM · TURU BİTİR</div>
<div style="font-family:'Chakra Petch';font-size:15px;color:var(--ikincil)">Chakra Petch 400 — gövde yazısı: Bursa'dan Balıkesir'e 5 birlik gidiyor.</div>
<div style="font-family:'Chakra Petch';font-weight:600;font-size:15px">Chakra Petch 600 — vurgulu gövde</div>
<div style="font-family:'Chakra Petch';font-weight:700;font-size:26px">1.276 · +12 · %35</div></div>
<div class="ornek kagit"><div style="font-family:'Black Ops One';font-size:18px;letter-spacing:.1em">TUR RAPORU</div>
<div style="color:var(--kagitIkincil)">Kâğıt zeminde kendi koyu yazı renkleri kullanılır; lacivertin açık yazısı burada okunmaz.</div></div>
<p>Punto (telefon / tablet): minik 9/10 · küçük 11/12 · orta 12/14 · büyük 15/17 · dev 20/23. Satır yüksekliği her yerde açıkça yazılır. Boşluklar: ${Object.values(T.BOSLUK).join(' · ')} · köşe: kutu ${T.KOSE.kutu}, düğme ${T.KOSE.dugme}.</p>`;

// Harita
html += `<h2 id="harita">4. HARİTA (oyunun %80'i)</h2><div class="gorseller">
<figure><img src="${resim('harita-skia/1-uzak-turkiye.png')}"><figcaption>Uzaktan: il kalkanları, kıyı gölgesi (yeni)</figcaption></figure>
<figure><img src="${resim('harita-skia/4-parca-rozetleri-marmara.png')}"><figcaption>4×: parça kalkanları + kadro şeridi, dağ/tepe/dalga (yeni)</figcaption></figure>
<figure><img src="${resim('harita-skia/9-dogrudan-hamle.png')}"><figcaption>Doğrudan hamle: pirinç = taşı, kırmızı = saldır, açık çerçeve = ikinci dokunuş</figcaption></figure>
<figure><img src="${resim('harita-skia/oneri-hamle-hakki.png')}"><figcaption>Öneri H3: hakkı olan ordu halkalı, biten soluk</figcaption></figure>
</div>`;

// Ekranlar
html += `<h2 id="ekran">5. EKRANLAR (${EKRANLAR.length})</h2>
<p>Zemin sütununda <span class="kagitRozet">KÂĞIT</span> olanlar belge ekranları. Yazı yükü <code>veri/metin-olcum.md</code>'den.</p>
<table><tr><th>Ekran</th><th>Nereden</th><th>Zemin</th><th>İçinde</th><th>Yazı</th><th>Not</th></tr>`;
for (const [ad, nereden, zemin, ic, dosyalar, not] of EKRANLAR)
  html += `<tr><td class="ad">${kacir(ad)}</td><td>${kacir(nereden)}</td><td>${
    zemin.startsWith('KÂĞIT') ? '<span class="kagitRozet">KÂĞIT</span>' : kacir(zemin)
  }</td><td>${kacir(ic)}</td><td>${yuk(dosyalar)}</td><td>${kacir(not)}</td></tr>`;
html += '</table>';

// Öneriler
html += `<h2 id="oneri">6. GÜZELLEŞTİRME ÖNERİLERİ</h2>
<p>Her öneri bir kimlikle; beğendiklerini kimliğiyle söylemen yeter (örneğin "H4, H6, U2"). Bedel: küçük = bir oturum, orta = birkaç oturum.</p>`;
for (const [grup, liste] of Object.entries(ONERILER)) {
  html += `<h3>${kacir(grup)}</h3><div class="kartlar">`;
  for (const [kim, bas, ne, neden, bedel, durum, gorsel] of liste) {
    const [et, renk] = DURUM_ETIKET[durum];
    html += `<div class="kart"><div class="ust"><span class="kim">${kim}</span><span class="bas">${kacir(
      bas
    )}</span><span class="etiket" style="color:${renk};border-color:${renk}">${et}</span></div>
<div class="ne">${kacir(ne)}</div><div class="neden">${kacir(neden)}</div><div class="bedel">Bedel: ${kacir(
      bedel
    )}</div>${gorsel ? `<img src="${resim(gorsel)}">` : ''}</div>`;
  }
  html += '</div>';
}
html += '</main></body></html>';

fs.writeFileSync(CIKTI, html);
const sayi = Object.values(ONERILER).reduce((a, l) => a + l.length, 0);
console.log('Yazıldı: onizleme/arayuz.html · ' + EKRANLAR.length + ' ekran · ' + sayi + ' öneri');
