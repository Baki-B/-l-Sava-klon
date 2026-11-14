// ANA MENÜNÜN FETİH DÖNGÜSÜ (Görev 10A / Adım 5).
//
// Üç güç — Bursa · Antalya · Erzurum — 81 ilin bağımsız olduğu haritayı yedi turda
// paylaşıyor, sonra sefer baştan başlıyor. Karar belgesi §6 bunu menünün savaş hissini
// veren ASIL öğe diye tanımlıyor: *"bu olmadan değişim fark edilmiyordu."*
//
// Kural seti ve sayılar: `docs/GOREV-10A-ANA-MENU-KARARI.md` §6.
// Sefer `veri/menu-seferi.json`'da ÖNCEDEN HESAPLI (Adım 1) — burada yayılma hesabı yok,
// rastgelelik yok. Sefer her açılışta birebir aynı gidiyor.
//
// ═══════════════════════════════════════════════════════════════════════════
// ÜÇ KATMAN — "SADECE FARKI ÇİZ"
// ═══════════════════════════════════════════════════════════════════════════
//
// Sekiz durumu sekiz katman olarak çizip aralarında geçiş yapmak AKLA İLK GELEN yol ve
// yanlış: 8 × 181 = 1448 yol aynı anda ağaçta durur. Tarayıcıda (önizleme böyle yapıldı)
// sorun değil, telefonda çok. Uygulama belgesi §5 bunu açıkça yasaklıyor.
//
// Bir turda ortalama 26 parça değişiyor, 181 değil. Üç katman yetiyor:
//
//   1. TABAN    `MenuHaritasi` — o anki sahiplik renkleriyle. Turda BİR KEZ değişiyor.
//   2. GEÇİŞ    yalnızca bu turda değişenler, YENİ renkleriyle. Opaklık 0 → 1.
//               Dolunca taban bir sonraki duruma geçiyor ve bu katman boşalıyor.
//   3. PARLAMA  aynı parçalar, açık renkte. Opaklık 0.6 → 0.
//
// Canlandırılan şey iki katmanın OPAKLIĞI. 181 yolun hiçbiri canlanmıyor.
//
// ---- NİYE `reanimated` DEĞİL ----
// Canlandırılan tek şey iki opaklık. `reanimated` worklet'leri bu iş için fazla; üstelik
// worklet'e fonksiyon geçirilemediği için tur ilerletme zaten JS tarafında kalmak zorunda
// (CLAUDE.md §6). RN'in kendi `Animated`'ı `useNativeDriver: true` ile opaklığı JS
// köprüsüne hiç dokunmadan oynatıyor.
//
// ---- NİYE AYRI `Svg` KATMANLARI ----
// Geçiş ve parlama, haritanın Svg ağacının İÇİNE konsaydı opaklıkları SVG özelliği olurdu
// ve SVG özellikleri donanım sürücüsüyle canlandırılamaz — animasyon JS'e düşerdi. Ayrı
// birer `Animated.View` içindeki Svg olarak durduklarında opaklık sıradan bir görünüm
// özelliği ve donanımda oynuyor.

import React, { useState, useEffect } from 'react';
import { Animated, AppState, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { MENU_RENK, askeriTon, karis } from '../tema';
import MenuHaritasi, { menuHaritaGeometrisi, koyuKenarYolu } from './MenuHaritasi';
import parcaVerisi from '../../veri/parcalar.json';
import menuGeo from '../../veri/menu-geometri.json';
import seferVerisi from '../../veri/menu-seferi.json';

const PARCALAR = parcaVerisi.parcalar; // yalnız üstveri (kod, renkIl); yollar menuGeo'dan
const YOLLAR = menuGeo.parcalar;
const DURUMLAR = seferVerisi.durumlar;
const DEGISENLER = seferVerisi.degisenler;
const SON_DURUM = DURUMLAR.length - 1;

// ---- ZAMANLAMA (karar belgesi §6, ms) ----
//
// ⚠ BEKLEMELER TAM GÖRÜNÜR SÜRE (Baki, 2026-08-03 cihaz düzeltmesi). İlk uygulama
// önizlemeyi birebir kopyalıyordu: erime bekleme SÜRESİNİN İÇİNDEN yiyordu, yani durum 0
// aslında 1.54 sn tam görünüyordu, turlar 0.94 sn. Baki cihazda fark etti: *"kısalmış
// sanki, hızlı oluyor."* Artık her bekleme durumun TAM GÖRÜNDÜĞÜ süre; erime (0.26 sn)
// beklemelerin arasına ek olarak giriyor.
//
// Döngü böylece 11.4 sn'den 13.2 sn'ye uzadı: 1800 + 7×260 + 6×1200 + 2400 = 13220 ms.
// Karar belgesindeki 11.4 rakamı önizlemenin toplamıydı; tempoyu Baki cihazda düzeltti.
//
// ---- İKİNCİ TEMPO DÜZELTMESİ (Baki, 2026-08-06 cihazda) ----
// Başlangıç 1800 → 3000: menü AÇILIRKEN göz haritaya alışsın, sefer hemen üstüne binmesin.
// Bitiş 2400 → 1800: paylaşılmış harita görüldükten sonra bekleme uzun geliyordu.
// Döngü 13220 → 13820 ms: 3000 + 7×260 + 6×1200 + 1800.
const ZAMAN = {
  BASLANGIC: 3000, // durum 0 TAM görünür ("81 il bağımsız" okunsun)
  TUR: 1200, // durum 1–6 TAM görünür
  BITIS: 1800, // durum 7 TAM görünür (paylaşılmış harita görülsün)
  GECIS: 260, // erime — beklemelere EK
  PARLAMA: 850, // el değiştiren parçaların parlayıp sönmesi
};
const PARLAMA_BASI = 0.6;

// ---- CEPHE ÇİZGİSİ NASIL ÇİZİLİYOR ----
// Karar belgesi §6 cepheyi "dişli kontur" diye tarif ediyordu ve ilk uygulama parçanın
// TÜM ÇEVRESİNİ düz + kesik çizgiyle sarıyordu. Baki cihazda görünce ikisini de geri
// çevirdi (2026-08-03): *"dişleri boşver — sınırlar sadece düşman sınırlarında koyu renk
// olacak."* Artık cephe çizgisi `MenuHaritasi.koyuKenarYolu`ndan geliyor: yalnızca iki
// yakası farklı sahipte olan PAYLAŞILAN kenarlar, düz ve koyu. `menu-seferi.json`daki
// `cepheler` listesi bu yüzden burada artık kullanılmıyor — sahiplikten hesap daha doğru.

// ---- İL TONLARI ----
// Bir parçanın rengi SAHİBİNİN ili tarafından belirleniyor. `renkIl` il başına tek
// (doğrulandı), o yüzden il kodundan tona tek adımda gidilebiliyor.
const IL_TONU = {};
for (const p of Object.values(PARCALAR)) {
  if (!IL_TONU[p.kod]) IL_TONU[p.kod] = karis(MENU_RENK.kara, askeriTon(p.renkIl), 0.62);
}

// ---- SEKİZ DURUMUN DOLGU TABLOSU — MODÜL YÜKLENİRKEN BİR KEZ ----
// 8 × 181 kısa metin; küçük ve değişmiyor. Kimlikleri de sabit oluyor, yani `MenuHaritasi`
// `React.memo`'su gerçekten çalışıyor: taban yalnızca durum indeksi değişince yeniden
// kuruluyor (CLAUDE.md §6 — türetilmiş nesnenin kimliği).
const DURUM_DOLGULARI = DURUMLAR.map((sahiplik) => {
  const dolgu = {};
  for (const pid of Object.keys(sahiplik)) dolgu[pid] = IL_TONU[sahiplik[pid]];
  return dolgu;
});

// ---- TUR BAŞINA İŞ SIFIR — HER ŞEY ÖNDEN HESAPLI (2026-08-03) ----
// İlk sürüm geçiş/parlama/kenar yollarını turda bir `useMemo` ile birleştiriyordu; tam
// çözünürlüklü veriyle (850 KB) sekiz durumu önden tutmak 6 MB'dı, o yüzden mecburdu.
// Bu da her turda JS kanalını 300–700 KB'lık metin işiyle tıkıyordu — Baki menüde
// düğmelerin geç tepki verdiğini fark etti ("3-4 saniye bekliyor").
//
// Geometri sadeleşince (84 KB) tablo tersine döndü: sekiz durumun TAMAMI aşağıda modül
// yüklenirken bir kez hesaplanıyor (~150 KB metin, bir kez). Döngü çalışırken JS tarafında
// metin işi kalmadı; tur ilerledikçe yalnızca hazır diziler okunuyor.
const yolBirlestir = (idler) => idler.map((pid) => YOLLAR[pid]).join('');

// Tur → geçiş katmanının yolları (yeni sahibin renginde, renk başına tek yol; en fazla 3).
const GECIS_YOLLARI = DEGISENLER.map((degisen, tur) => {
  const gruplar = {};
  for (const pid of degisen) {
    const renk = IL_TONU[DURUMLAR[tur][pid]];
    (gruplar[renk] = gruplar[renk] || []).push(pid);
  }
  return Object.keys(gruplar).map((renk) => ({ renk, d: yolBirlestir(gruplar[renk]) }));
});

// Tur → parlama katmanının tek yolu (el değiştirenlerin tamamı, açık renkte).
const PARLAMA_YOLLARI = DEGISENLER.map((degisen) =>
  degisen.length ? yolBirlestir(degisen) : null
);

// Durum → koyu kenar yolu (iki yakası farklı sahipte olan paylaşılan kenarlar).
const KOYU_KENARLAR = DURUMLAR.map((sahiplik) => koyuKenarYolu(sahiplik));

export default function MenuSeferi({ genislik, yukseklik }) {
  // `adim` = tabanın gösterdiği durum. `gecis`/`parlayan` = o an canlanan TUR numarası.
  const [adim, setAdim] = useState(0);
  const [gecis, setGecis] = useState(null);
  const [parlayan, setParlayan] = useState(null);

  // `useRef(...).current` yerine tembel `useState`: ikisi de değeri bir kez kuruyor ama
  // ref'i çizim sırasında okumak React'in derleyici kuralını çiğniyor (ESLint yakalıyor).
  const [gecisOpaklik] = useState(() => new Animated.Value(0));
  const [parlamaOpaklik] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let zamanlayicilar = [];
    const bekle = (ms, is) => zamanlayicilar.push(setTimeout(is, ms));
    const temizle = () => {
      for (const z of zamanlayicilar) clearTimeout(z);
      zamanlayicilar = [];
    };

    const turBasla = (tur) => {
      setGecis(tur);
      setParlayan(tur);
      gecisOpaklik.setValue(0);
      parlamaOpaklik.setValue(PARLAMA_BASI);
      Animated.timing(gecisOpaklik, {
        toValue: 1,
        duration: ZAMAN.GECIS,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      Animated.timing(parlamaOpaklik, {
        toValue: 0,
        duration: ZAMAN.PARLAMA,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Geçiş dolunca taban yeni duruma atlıyor ve geçiş katmanı kalkıyor. İki durum
      // aynı geri çağrıda değiştiği için React ikisini tek çizimde topluyor — arada
      // bir kare bile eski hâl görünmüyor.
      bekle(ZAMAN.GECIS, () => {
        setAdim(tur);
        setGecis(null);
      });
      bekle(ZAMAN.PARLAMA, () => setParlayan(null));

      // Sonraki tur, BU turun erimesi bitip durum TAM 1.2 sn göründükten sonra başlıyor.
      if (tur < SON_DURUM) bekle(ZAMAN.GECIS + ZAMAN.TUR, () => turBasla(tur + 1));
      else bekle(ZAMAN.GECIS + ZAMAN.BITIS, dongu);
    };

    const dongu = () => {
      setAdim(0);
      setGecis(null);
      setParlayan(null);
      bekle(ZAMAN.BASLANGIC, () => turBasla(1));
    };

    dongu();

    // ⚠ ARKA PLANDA DURMALI. Menü görünmezken zamanlayıcı döndürmek boşuna pil yakar.
    // Geri dönünce sefer BAŞTAN başlıyor — kaldığı yerden sürdürmek için harcanacak
    // durumun karşılığı yok: oyuncu menüye yeni bakıyor, seferi baştan görmesi doğru.
    const abone = AppState.addEventListener('change', (aygitDurumu) => {
      temizle();
      if (aygitDurumu === 'active') dongu();
    });

    return () => {
      temizle();
      abone.remove();
    };
  }, [gecisOpaklik, parlamaOpaklik]);

  const { olcek, sol, ust } = menuHaritaGeometrisi(genislik, yukseklik);
  const donusum = 'translate(' + sol + ',' + ust + ') scale(' + olcek + ')';

  // Tur başına hesap yok: geçiş, parlama ve koyu kenar yolları modül yüklenirken
  // hazırlandı (yukarıdaki tablolar). Kimlikleri sabit — `React.memo` bozulmuyor.
  const gecisYollari = gecis === null ? null : GECIS_YOLLARI[gecis];
  const parlamaYolu = parlayan === null ? null : PARLAMA_YOLLARI[parlayan];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <MenuHaritasi
        genislik={genislik}
        yukseklik={yukseklik}
        dolgular={DURUM_DOLGULARI[adim]}
        koyuKenarlar={KOYU_KENARLAR[adim]}
      />

      {gecisYollari ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: gecisOpaklik }]}>
          <Svg width={genislik} height={yukseklik}>
            <G transform={donusum}>
              {gecisYollari.map((grup) => (
                <Path key={grup.renk} d={grup.d} fill={grup.renk} />
              ))}
            </G>
          </Svg>
        </Animated.View>
      ) : null}

      {parlamaYolu ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: parlamaOpaklik }]}>
          <Svg width={genislik} height={yukseklik}>
            <G transform={donusum}>
              <Path d={parlamaYolu} fill={MENU_RENK.yazi} />
            </G>
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}
