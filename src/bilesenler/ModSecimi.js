// MOD SEÇME EKRANI (Görev 10A / Adım 6).
//
// Kesinleşen tasarım: `docs/GOREV-10A-ANA-MENU-KARARI.md` "MOD SEÇME EKRANI" bölümü.
// Önizleme: `onizleme/mod-ekrani.html`. Önceden `AnaMenu.js` içinde bir bloktu; kendi
// dosyasına çıktı (uygulama belgesi §4).
//
// Ana menünün teması birebir: aynı harita, aynı panel dili, aynı köşe parantezleri.
// İKİ BİLİNÇLİ FARK:
//   • Arka harita DURAĞAN — fetih döngüsü ana menüde kalıyor. Burada oyuncu karar
//     veriyor; arkada bir şey oynasa kartlardan dikkat çalardı.
//   • Kartlarda soyut logo YOK. Her kart o modun KAZANMA HÂLİNİ gösteren mini harita
//     taşıyor. Bu, görevin en pahalı dersi: genel semboller (bayrak, kalkan, basamak)
//     reddedildi; oyunun KENDİ verisinden çıkanlar kabul edildi.
//
// ---- SAYILAR EKRANDA UYDURULMUYOR ----
// Kart altındaki "91 / 181 BÖLGE" eşiği `modKazanmaEsigi`den geliyor; mini haritadaki
// parça kümesi `veri/mod-hedefleri.json`dan. Üretici (scripts/mod-hedefleri-uret.js)
// ikisinin aynı sayıyı verdiğini denetliyor — resim ile yazı ayrışamaz. Bir keresinde
// ayrışmıştı: %50 kartı 101 parça gösterip 91 yazıyordu.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { MENU_RENK, YAZI, askeriTon, karis } from '../tema';
import { DENGE } from '../denge';
import { modKazanmaEsigi, senaryoKapsami } from '../oyun/senaryolar';
import MenuHaritasi, { DOGAL_DOLGULAR, TUM_SINIRLAR, menuHaritaGeometrisi } from './MenuHaritasi';
import MenuPaneli from './MenuPaneli';
import parcaVerisi from '../../veri/parcalar.json';
import menuGeo from '../../veri/menu-geometri.json';
import hatVerisi from '../../veri/turkiye-hat.json';
import hedefVerisi from '../../veri/mod-hedefleri.json';

const PARCALAR = parcaVerisi.parcalar; // yalnız üstveri (kod, renkIl); yollar menuGeo'dan
const YOLLAR = menuGeo.parcalar;
const META = parcaVerisi.meta;
const PARCA_IDLER = Object.keys(PARCALAR).sort();

// ---- ÖLÇÜLER — ÖNİZLEME BİRİMİ ----
// Önizleme 880×400'lük kutuda çizildi. Yatay ölçüler ve puntolar ekran genişliğine
// (`o = width/880`), kart içi dikey ölçüler kart yüksekliğine (`dy = kartY/178`)
// oranlanıyor — uygulama belgesi §1'in tablosu, sayı kopyalamadan.
const OLCU = {
  KART_G: 196,
  KART_Y: 178,
  KART_ARA: 20,
  KART_UST_PAYI: 0.25, // ekran yüksekliğine oran
  KART_Y_PAYI: 0.445,

  MINI_X: 14,
  MINI_UST: 16,
  MINI_G: 168,

  AD_UST: 103, // kart içinde, mod adının ÜSTÜ (taban çizgisi 118 − punto payı)
  AD_PUNTO: 15,
  AD_ARA: 2.2,

  AYRAC_UST: 148,
  AYRAC_YAN: 22,

  ALT_UST: 154, // alt satırın üstü (taban çizgisi 165)
  ALT_PUNTO: 10.5,
  ALT_ARA: 1.6,

  BASLIK_PUNTO: 15,
  BASLIK_ARA: 4.6,
  BASLIK_KARA_PAYI: 6, // yazının altı karaya bu kadar kala biter (önizlemede 5.7)

  DUGME_G: 104,
  DUGME_Y: 30,
  DUGME_ARA: 16,
  DUGME_UST_PAYI: 0.87,
  DUGME_PUNTO: 12.5,
};

// Mod kartlarının köşe paranteze ana panelden küçük (önizleme: kol 13, pay 6).
const KART_PARANTEZ = { pay: 6, kol: 13, kalinlik: 1.2 };
const KART_PARANTEZ_SECILI = { pay: 6, kol: 13, kalinlik: 2 };

// Mini haritanın kendi çizgileri (harita birimi — mini ölçeğe bölünmeden çizilir,
// önizlemede de öyle: 3.57 birim × 0.168 ölçek ≈ 0.6 ekran pikseli).
const MINI_SINIR = { kalinlik: 3.57, opaklik: 0.32 };
const MINI_KIYI = { kalinlik: 8.33, opaklik: 0.6 };

// ---- ÜÇ KARTIN DOLGU TABLOLARI — MODÜL YÜKLENİRKEN BİR KEZ ----
// Oyuncunun rengi %92 karışım (mini haritada daha doygun — uygulama belgesi §2),
// ötekiler haritanın olağan %62 tonları (`DOGAL_DOLGULAR`).
const OYUNCU_TONU = karis(
  MENU_RENK.kara,
  askeriTon(PARCALAR[PARCA_IDLER.find((p) => PARCALAR[p].kod === hedefVerisi.oyuncuIl)].renkIl),
  0.92
);

// Mini harita RENK BAŞINA TEK YOL çiziyor, parça başına değil (2026-08-03 hızlandırması):
// aynı renkteki parçaların yolları modül yüklenirken birleşiyor. Fetih kartı böylece tek
// yol, ötekiler ~90 — ve hepsi sadeleşmiş geometriden. Üç kartın açılışta ayrıştırdığı
// yol verisi 5.1 MB'tan ~350 KB'a indi; "YENİ SEFER"deki 3-4 saniyelik bekleme buydu.
function yolGruplari(tonu) {
  const gruplar = {};
  for (const pid of PARCA_IDLER) {
    const renk = tonu(pid) || DOGAL_DOLGULAR[pid];
    gruplar[renk] = (gruplar[renk] || '') + YOLLAR[pid];
  }
  return Object.entries(gruplar).map(([renk, d]) => ({ renk, d }));
}

const YARIM_KUMESI = new Set(hedefVerisi.yarim.oyuncu);
const PUAN_TONLARI = {};
for (const [il, parcalar] of Object.entries(hedefVerisi.puan.bloklar)) {
  const ton =
    il === hedefVerisi.oyuncuIl
      ? OYUNCU_TONU
      : karis(
          MENU_RENK.kara,
          askeriTon(PARCALAR[PARCA_IDLER.find((p) => PARCALAR[p].kod === il)].renkIl),
          0.62
        );
  for (const pid of parcalar) PUAN_TONLARI[pid] = ton;
}

const MOD_YOLLARI = {
  fetih: yolGruplari(() => OYUNCU_TONU),
  yarim: yolGruplari((pid) => (YARIM_KUMESI.has(pid) ? OYUNCU_TONU : null)),
  puan: yolGruplari((pid) => PUAN_TONLARI[pid] || null),
};

// Kart altındaki hedef satırı. Sayılar OYUN KATMANINDAN (senaryolar.js) — mod eşiği
// denge.js'te değişirse ekran kendiliğinden düzelir.
function hedefSatiri(tip, kapsam) {
  const esik = modKazanmaEsigi(tip, kapsam);
  if (esik === null) return 'SÜRE DOLUNCA EN BÜYÜK';
  return esik + ' / ' + senaryoKapsami(kapsam).kapsamParcalar.length + ' BÖLGE';
}

// ---- MİNİ HARİTA ----
// Kara + 181 parça + sınırlar + kıyı. Hale ve deniz YOK: kart zaten lacivert, mini
// harita onun üstünde bir vinyet gibi duruyor (önizlemedeki katman yapısı).
//
// `React.memo` + modül düzeyi dolgu tabloları: üç kart 3 × 181 yol demek; seçim her
// değiştiğinde yeniden kurulmamalılar. Dolgu tablolarının kimliği sabit, o yüzden
// hafızalama gerçekten çalışıyor.
const MiniHarita = React.memo(function MiniHarita({ genislik, yollar }) {
  const olcek = genislik / META.genislik;
  return (
    <Svg width={genislik} height={META.yukseklik * olcek} pointerEvents="none">
      <G transform={'scale(' + olcek + ')'}>
        <Path d={hatVerisi.yol} fill={MENU_RENK.kara} />
        {yollar.map((grup) => (
          <Path key={grup.renk} d={grup.d} fill={grup.renk} />
        ))}
        {/* Parça sınırları ŞART (karar belgesi): fetih kartı tek renk olunca Türkiye'nin
            şekli kayboluyordu. Renk siyah (Baki 2026-08-03 — mavi olan düzeltildi). */}
        <Path
          d={TUM_SINIRLAR}
          fill="none"
          stroke={MENU_RENK.sinir}
          strokeWidth={MINI_SINIR.kalinlik}
          opacity={MINI_SINIR.opaklik}
        />
        <Path
          d={hatVerisi.yol}
          fill="none"
          stroke={MENU_RENK.kiyi}
          strokeWidth={MINI_KIYI.kalinlik}
          opacity={MINI_KIYI.opaklik}
        />
      </G>
    </Svg>
  );
});

export default function ModSecimi({ mod, onMod, onGeri, onIleri }) {
  const { width, height } = useWindowDimensions();
  const kapsam = DENGE.MOD.VARSAYILAN_KAPSAM;

  const o = width / 880; // yatay ölçek (önizleme genişliği)
  const kartG = OLCU.KART_G * o;
  const kartY = height * OLCU.KART_Y_PAYI;
  const dy = kartY / OLCU.KART_Y; // kart içi dikey ölçek
  const punto = Math.min(o, dy); // puntolar iki eksenin darına uyar

  const kartlar = Object.keys(DENGE.MOD.TIPLER); // fetih · yarim · puan (tanım sırası)
  const toplamG = kartlar.length * kartG + (kartlar.length - 1) * OLCU.KART_ARA * o;
  const ilkSol = (width - toplamG) / 2;
  const kartUst = height * OLCU.KART_UST_PAYI;

  // Başlık karaya değmez: konum ölçülüyor, yazılmıyor (uygulama belgesi §1).
  const { karaninUstu } = menuHaritaGeometrisi(width, height);
  const baslikSatir = Math.round(OLCU.BASLIK_PUNTO * punto * 1.25);
  const baslikUst = karaninUstu - OLCU.BASLIK_KARA_PAYI * dy - baslikSatir;

  const dugmeG = OLCU.DUGME_G * o;
  const dugmeY = OLCU.DUGME_Y * o;
  const dugmeUst = height * OLCU.DUGME_UST_PAYI;
  const dugmeSol = width / 2 - dugmeG - (OLCU.DUGME_ARA * o) / 2;

  const hedefler = useMemo(
    () => Object.fromEntries(kartlar.map((t) => [t, hedefSatiri(t, kapsam)])),
    // `kartlar` her çizimde yeni dizi ama içeriği DENGE'den, sabit — bağımlılık kapsam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kapsam]
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <MenuHaritasi genislik={width} yukseklik={height} />

      <Text
        style={[
          s.baslik,
          {
            top: baslikUst,
            fontSize: OLCU.BASLIK_PUNTO * punto,
            lineHeight: baslikSatir,
            letterSpacing: OLCU.BASLIK_ARA * punto,
          },
        ]}
      >
        SEFERİN AMACINI SEÇ
      </Text>

      {kartlar.map((tip, i) => {
        const secili = tip === mod;
        return (
          <Pressable
            key={tip}
            onPress={() => onMod(tip)}
            style={{
              position: 'absolute',
              left: ilkSol + i * (kartG + OLCU.KART_ARA * o),
              top: kartUst,
              width: kartG,
              height: kartY,
            }}
          >
            <MenuPaneli
              stil={StyleSheet.absoluteFill}
              dolgu={secili ? MENU_RENK.panelSecili : MENU_RENK.panel}
              opaklik={secili ? 0.97 : 0.72}
              hat={secili}
              parantezOlcu={secili ? KART_PARANTEZ_SECILI : KART_PARANTEZ}
              parantezRenk={secili ? MENU_RENK.yazi : MENU_RENK.yaziSolu}
              parantezOpakligi={secili ? 1 : 0.4}
              cocuklar={
                <>
                  <View style={{ marginLeft: OLCU.MINI_X * o, marginTop: OLCU.MINI_UST * dy }}>
                    <MiniHarita genislik={OLCU.MINI_G * o} yollar={MOD_YOLLARI[tip]} />
                  </View>
                  <Text
                    style={[
                      s.modAdi,
                      {
                        top: OLCU.AD_UST * dy,
                        fontSize: OLCU.AD_PUNTO * punto,
                        lineHeight: Math.round(OLCU.AD_PUNTO * punto * 1.3),
                        letterSpacing: OLCU.AD_ARA * punto,
                      },
                    ]}
                  >
                    {DENGE.MOD.TIPLER[tip].ad.toUpperCase()}
                  </Text>
                  <View
                    style={[
                      s.ayrac,
                      {
                        top: OLCU.AYRAC_UST * dy,
                        left: OLCU.AYRAC_YAN * o,
                        right: OLCU.AYRAC_YAN * o,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      s.hedef,
                      {
                        top: OLCU.ALT_UST * dy,
                        fontSize: OLCU.ALT_PUNTO * punto,
                        lineHeight: Math.round(OLCU.ALT_PUNTO * punto * 1.3),
                        letterSpacing: OLCU.ALT_ARA * punto,
                      },
                    ]}
                  >
                    {hedefler[tip]}
                  </Text>
                </>
              }
            />
          </Pressable>
        );
      })}

      <Pressable
        onPress={onGeri}
        style={[s.geri, { left: dugmeSol, top: dugmeUst, width: dugmeG, height: dugmeY }]}
      >
        <Text style={[s.geriMetin, { fontSize: OLCU.DUGME_PUNTO * punto }]}>GERİ</Text>
      </Pressable>
      <Pressable
        onPress={onIleri}
        style={[
          s.ileri,
          {
            left: dugmeSol + dugmeG + OLCU.DUGME_ARA * o,
            top: dugmeUst,
            width: dugmeG,
            height: dugmeY,
          },
        ]}
      >
        <Text style={[s.ileriMetin, { fontSize: OLCU.DUGME_PUNTO * punto }]}>İL SEÇ</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  baslik: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: YAZI.baslik,
    color: MENU_RENK.yazi,
    opacity: 0.95,
  },
  modAdi: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: YAZI.baslik,
    color: MENU_RENK.yazi,
  },
  ayrac: { position: 'absolute', height: 0.8, backgroundColor: MENU_RENK.yaziSolu, opacity: 0.28 },
  hedef: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: YAZI.govde,
    color: MENU_RENK.yaziSolu,
    opacity: 0.9,
  },
  geri: {
    position: 'absolute',
    borderWidth: 1.2,
    borderColor: MENU_RENK.yaziSolu,
    borderRadius: 5,
    opacity: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geriMetin: { fontFamily: YAZI.baslik, color: MENU_RENK.yazi, letterSpacing: 2 },
  ileri: {
    position: 'absolute',
    backgroundColor: MENU_RENK.yazi,
    borderRadius: 5,
    opacity: 0.94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ileriMetin: { fontFamily: YAZI.baslik, color: MENU_RENK.panel, letterSpacing: 2 },
});
