// SKIA HARİTASI (Görev 20 / Adım 2–3, akıcılık Adım 3b) — Antiyoy ve Polytopia ölçütüyle.
//
// ┌─ NEDEN YENİDEN YAZILDI ──────────────────────────────────────────────────────────────┐
// │ Baki, 2026-09-23: *"grafiksel açıdan oyun hâlâ akıcı değil, bir Antiyoy bir Polytopia │
// │ gibi değil — gerek yakınlaştırmalar gerek okunurluk."* Geliştirme kipi kapalıyken de   │
// │ "çok fark göremedi": sorun JavaScript'te değil haritanın yapısındaydı.                │
// │                                                                                       │
// │ Eski harita (`Harita.js`) react-native-svg ile çiziliyordu ve telefonu dondurmamak    │
// │ için beş ödün veriyordu (GOREV-20 §2.2): yakınlaşırken resme çevirme, 2 katlık netlik, │
// │ sönen rozetler, parmak kalkınca yeniden yerleşme, uzakta rozetsizlik. Bu harita        │
// │ HİÇBİRİNİ vermiyor: her kare Skia ile, ekran kartında, baştan çiziliyor.               │
// └───────────────────────────────────────────────────────────────────────────────────────┘
//
// NASIL AKICI KALIYOR (Adım 3b — ilk sürüm telefonda "30 fps gibi"ydi, sebebi ölçüldü):
//   • Kare başına React ÇALIŞMIYOR. Kaydırma/yakınlaştırma paylaşılan değerlerde; çizim
//     `useDerivedValue` ile arayüz iş parçacığında (`haritaCizim.js sahneyiCiz`).
//   • Karede ~10 Skia çağrısı: dolgu, çizgi, vurgu ve rozetler veri değişince bir kez RESİM
//     olarak kaydediliyor, karede kamerayla oynatılıyor.
//   • Skia'ya yalnızca ekran kartının hızlı yaptığı iş veriliyor: yumuşatmasız dolgu, hazır
//     üçgen şeridi olarak sınır çizgisi, resim sayfasından basılan rozet. Gerekçe ve ölçüm
//     `haritaCizim.js` başında ve `veri/harita-hiz-olcum.md`'de.
//   • Harita KADEMELİ geometriyle çiziliyor: uzakta 10.792 nokta, en yakında 49.068.
//
// ESKİ HARİTADAN DEVRALINANLAR:
//   • Dönüşüm tek kaynaktan (`haritaDonusum.js`); dokunma testi tam çözünürlüklü veriyle.
//   • Jest kuralları: kaydırma eşiği ve telafisi (parmak eşiği geçince harita ilk
//     milimetreden izlesin, zıplamasın), odak sabit yakınlaştırma (bırakınca kaymasın), uzun
//     basma korumaları (kaydırırken ya da iki parmakla tetiklenmesin), açık menüde dokunma
//     kilidi. Uzun gerekçeleri eski `Harita.js`'teydi — git geçmişinde, 2026-09-25 öncesi.
//   • Savaş gösterisi (`SahneKatmani`) haritanın ÜSTÜNDE, aynı sabit yerleşimi okuyor.
//
// YENİLER:
//   • Rozetler haritanın parçası: harita ile büyüyor (Baki'nin cevabı: "büyüsün"), uzakta
//     da görünüyor. İl → parça geçişi eşikte kısa ve zamanlı (`DENGE.ROZET.DUNYA_GECIS_SURE`).
//   • Sınır ve seçim çizgileri yakınlaştıkça yavaş kalınlaşıyor (`tema.js CIZGI_BUYUME`).
//   • Kaydırma parmak kalkınca SÜZÜLÜYOR (`DENGE.JEST.SUZULME`).
//
// TEK HARİTA (GOREV-20 Adım 9, 2026-09-25): eski SVG haritası, ikisi arasındaki ayar ve
// "Skia hata verirse eskisine dön" kalkanı emekliye ayrıldı. Kalkanın sınırı zaten dardı:
// yalnızca JS iş parçacığındaki hatayı yakalıyordu; her karede çalışan `sahneyiCiz` bu yüzden
// bilgisayarda çalıştırılıp denetleniyor (`scripts/harita-skia-onizleme.js`, testler).

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PixelRatio } from 'react-native';
import { Canvas, Picture, Skia, createPicture, useFont } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
  useFrameCallback,
  runOnJS,
  withTiming,
  withDecay,
  cancelAnimation,
} from 'react-native-reanimated';
import seviyeVerisi from '../../veri/harita-seviyeleri.json';
import susVerisi from '../../veri/harita-susleri.json';
import nehirVerisi from '../../veri/harita-nehirler.json';
import hatVerisi from '../../veri/turkiye-hat.json';
import { HARITA_SEVIYE_HATASI } from '../tema';
import { DENGE } from '../denge';
import { PARCA_KAYDIRMA } from '../rozetKaydirma';
import {
  haritaOlcusu,
  haritadanEkrana,
  ekrandanHaritaya,
  kameraKaydirmasi,
  kaydirmaSiniri,
  kameraDonusumu,
  dokunmaGeometrisi,
  parcaBul,
} from '../haritaDonusum';
import {
  haritaKaynagiKur,
  bantlariKur,
  hatSeritleriKur,
  hatResimleri,
  susGeometrisiKur,
  susResimleri,
  nehirGeometrisiKur,
  nehirResimleri,
  sekilleriKur,
  dolgulariHesapla,
  dolguResimleri,
  vurguResimleri,
  cepheResimleri,
  rozetAtlasiKur,
  rozetResimleri,
  katmanBoyasi,
  sahneRenkleri,
  sahneyiCiz,
  rozetBoyutu,
  rozetKatmaniSec,
  seritKatmaniSec,
  figurKatmaniSec,
} from '../haritaCizim';
import { useSabitYerlesim } from '../haritaSabitleme';
import { cepheHatlari } from '../haritaSeviye';
import SahneKatmani from './SahneKatmani';
import { IpucuHalkasi } from './Ipucu';

// Rozet sayısının yazı tipi (Rozet.js'teki `YAZI.sayi` ile aynı aile ve kesim).
const ROZET_YAZISI = require('@expo-google-fonts/chakra-petch/700Bold/ChakraPetch_700Bold.ttf');

// Yakınlaştırma aralığı.
const EN_UZAK = 0.9;
const EN_YAKIN = 7;

// Arayüz iş parçacığına gidecek sayılar modül düzeyinde SAYI olarak alınıyor: jest
// fonksiyonları `DENGE`'ye doğrudan başvursaydı 2.700 satırlık nesnenin tamamı her
// kurulumda arayüz iş parçacığına kopyalanırdı (CLAUDE.md §6: worklet'e değer gider).
const SUZULME = DENGE.JEST.SUZULME;
const GECIS_SURE = DENGE.ROZET.DUNYA_GECIS_SURE;
const NEFES_SURE = DENGE.ROZET.NEFES_SURE;
const NEFES_ADIM = DENGE.ROZET.NEFES_ADIM;

// Rozet ayarı — sahneye düz sayı olarak gider.
const ROZET_AYARI = {
  CAP: DENGE.ROZET.CAP,
  ORTA: DENGE.ROZET.ORTA_SINIR,
  YAKIN: DENGE.ROZET.YAKIN_SINIR,
  HISTEREZIS: DENGE.ROZET.KATMAN_HISTEREZIS,
  SERIT: DENGE.ROZET.SERIT_ESIGI,
  FIGUR: DENGE.ROZET.FIGUR_ESIGI,
};

const BOS_EFEKT = [];
const BOS_LISTE = [];

// MAÇLAR ARASI ÖNBELLEK. Kaynak (dört seviyenin yolları, çizgi noktaları) yalnızca harita
// verisine bağlı ve kurması telefonda maç başının en ağır işi; her maçta yeniden kurmak
// gereksiz. Çizgi şeritleri de kapsam + ekran aynı kaldıkça aynı. Bileşen maçla birlikte
// kapanıp açıldığı için bunlar bileşenin dışında, modülde tutuluyor.
let onbellek = null;
function kaynakAl(parcalar) {
  if (!onbellek || onbellek.parcalar !== parcalar) {
    onbellek = {
      parcalar,
      kaynak: haritaKaynagiKur(Skia, seviyeVerisi, parcalar),
      seritler: new Map(),
      susler: new Map(),
      nehirler: new Map(),
    };
  }
  return onbellek;
}

// SÜSLER (Görev 20): kıyı gölgesi, dağ, tepe, dalga — şeritleriyle aynı kalıp: kapsam ve
// ekran değişmedikçe bir kez kurulur, maçlar arası saklanır.
function susAl(ob, kapsam, bantlar, ekran, meta) {
  const anahtar =
    (kapsam ? [...kapsam].sort().join(',') : 'hepsi') + '|' + ekran.f + '|' + ekran.yogunluk;
  let s = ob.susler.get(anahtar);
  if (!s) {
    s = susResimleri(
      Skia,
      susGeometrisiKur(susVerisi, hatVerisi.yol, kapsam),
      bantlar,
      meta,
      ekran
    );
    ob.susler.clear();
    ob.susler.set(anahtar, s);
  }
  return s;
}
// NEHİRLER VE GÖLLER (Görev 21): kapsamdan bağımsız; ekran değişmedikçe bir kez.
function nehirAl(ob, bantlar, ekran, meta) {
  const anahtar = ekran.f + '|' + ekran.yogunluk;
  let n = ob.nehirler.get(anahtar);
  if (n === undefined) {
    n = nehirResimleri(Skia, nehirGeometrisiKur(nehirVerisi), bantlar, meta, ekran);
    ob.nehirler.clear();
    ob.nehirler.set(anahtar, n);
  }
  return n;
}
function seritAl(ob, kapsam, bantlar, ekran) {
  const anahtar =
    (kapsam ? [...kapsam].sort().join(',') : 'hepsi') + '|' + ekran.f + '|' + ekran.yogunluk;
  let s = ob.seritler.get(anahtar);
  if (!s) {
    s = hatSeritleriKur(Skia, ob.kaynak, kapsam, bantlar, ekran);
    // Ekran dönerse ya da başka senaryo açılırsa eskisi bırakılır — birden çoğunu tutmaya
    // gerek yok (bellek).
    ob.seritler.clear();
    ob.seritler.set(anahtar, s);
  }
  return s;
}

export default function HaritaSkia({
  parcalar,
  meta,
  mod,
  secili,
  komsular,
  sinirlar,
  kapsam,
  sahiplik,
  aktorRenk,
  ittifakDurumlari,
  onSec,
  onUzunBas,
  parcaRozetleri,
  ilRozetleri,
  emirOklari,
  hedefKipi,
  kipSaldiri,
  // Doğrudan hamle (Görev 20 / Adım 5): saldırı hedefleri ve ikinci dokunuşu bekleyen hedef.
  hedefSaldiri,
  hedefSecili,
  dokunmaKapali,
  sahneEfektleri,
  sahneSeridi,
  kamera,
  // AÇILIŞ KAMERASI (GOREV-20 Adım 4): { x, y, z } harita noktası + yakınlık. Nesne her maç
  // açılışında yenileniyor; kamera oraya bir kez süzülüyor.
  odak,
  // EĞİTİM HALKASI (GOREV-20 Adım 8): { x, y } harita noktası ya da null.
  ipucu,
}) {
  const W = meta.genislik,
    H = meta.yukseklik;

  // ---- PAYLAŞILAN DEĞERLER (eski haritayla aynı adlar ve anlamlar) ----
  const tX = useSharedValue(0),
    tY = useSharedValue(0),
    sc = useSharedValue(1);
  const bX = useSharedValue(0),
    bY = useSharedValue(0),
    bS = useSharedValue(1);
  const bfx = useSharedValue(0),
    bfy = useSharedValue(0);
  const lw = useSharedValue(1),
    lh = useSharedValue(1);
  const pdx = useSharedValue(0),
    pdy = useSharedValue(0);
  const jestAktif = useSharedValue(0),
    kilit = useSharedValue(0);
  const jestSayaci = useSharedValue(0);

  const dokunmaKilidi = useSharedValue(0);
  useEffect(() => {
    dokunmaKilidi.value = dokunmaKapali ? 1 : 0;
  }, [dokunmaKapali, dokunmaKilidi]);

  // HAMLE HAKKI HALKASININ NEFESİ (Görev 21): yalnızca halkalı ordu varken ve harita açıkken
  // (üstünde bir ekran yokken — dokunma kilidiyle aynı koşul). Kapalıyken halka tam parlak
  // durur ve harita hiç yeniden çizilmez.
  const halkaVar = useMemo(
    () =>
      (parcaRozetleri || BOS_LISTE).some((r) => r.hak > 0) ||
      (ilRozetleri || BOS_LISTE).some((r) => r.hak > 0),
    [parcaRozetleri, ilRozetleri]
  );
  const nefesAcik = useSharedValue(0);
  useEffect(() => {
    nefesAcik.value = halkaVar && !dokunmaKapali ? 1 : 0;
  }, [halkaVar, dokunmaKapali, nefesAcik]);

  const [olcu, setOlcu] = useState(null);

  // Savaş gösterisinin okuduğu sabit yerleşim (haritaSabitleme.js) — eskisiyle aynı.
  const sabit = useSabitYerlesim({ lw, lh, sc, jestSayaci, W, H });

  // ---- KAYNAKLAR (JS iş parçacığı, veri değişince) ----
  //
  // Hepsi RESİM olarak kaydedilir; kare bunları yalnızca kamerayla oynatır. Hangisinin ne
  // zaman yeniden kurulduğu aşağıda — ağır olanlar (kaynak, şeritler) maçlar arası önbellekte.

  // Ekran ölçüsüne bağlı sığdırma — `haritaOlcusu` arayüz iş parçacığında çağrılamıyor
  // (worklet değil), o yüzden burada hesaplanıp sahneye düz sayı olarak gidiyor.
  const o = useMemo(() => (olcu ? haritaOlcusu(olcu.g, olcu.y, W, H) : null), [olcu, W, H]);
  // Ekranın bir cihaz pikseli — çizgi kenarının yumuşatma genişliği buna göre.
  const ekran = useMemo(() => (o ? { f: o.f, yogunluk: PixelRatio.get() } : null), [o]);

  // Bir kez (önbellekte): dört seviyenin 181'er dolgu yolu, vurgu için tam yollar, çizgi
  // noktaları.
  const ob = useMemo(() => kaynakAl(parcalar), [parcalar]);
  const kaynak = ob.kaynak;
  const sekil = useMemo(() => sekilleriKur(Skia), []);
  const renk = useMemo(() => sahneRenkleri(Skia), []);
  const katmanBoya = useMemo(() => katmanBoyasi(Skia), []);
  // Hamle hakkı dilimlerinin boyası — katman boyasından AYRI: onun saydamlığı karede değişiyor.
  const atlasBoya = useMemo(() => katmanBoyasi(Skia), []);

  // Ekran değişince: yakınlık bantları (kademeli geometrinin seviye eşikleri ekrana bağlı).
  const bantlar = useMemo(
    () =>
      o ? bantlariKur(o.f, kaynak.toleranslar, HARITA_SEVIYE_HATASI, EN_UZAK, EN_YAKIN) : null,
    [o, kaynak]
  );

  // Maç başına (önbellekte): sınır çizgisi şeritleri; il sınırı açılıp kapanınca resimleri.
  const hatResmi = useMemo(() => {
    if (!bantlar) return null;
    const seritler = seritAl(ob, kapsam, bantlar, ekran);
    return hatResimleri(Skia, seritler, bantlar, !!sinirlar, renk, meta, ekran);
  }, [ob, kapsam, bantlar, ekran, sinirlar, renk, meta]);

  // Maç başına (önbellekte): kıyı gölgesi, dağ, tepe, dalga (Görev 20).
  const sus = useMemo(
    () => (bantlar ? susAl(ob, kapsam, bantlar, ekran, meta) : null),
    [ob, kapsam, bantlar, ekran, meta]
  );

  // Maç başına (önbellekte): nehirler ve göller (Görev 21).
  const nehir = useMemo(
    () => (bantlar ? nehirAl(ob, bantlar, ekran, meta) : null),
    [ob, bantlar, ekran, meta]
  );

  // Harita tipi / sahiplik değişince: dolgu renkleri ve dört seviyenin dolgu resmi.
  const dolgular = useMemo(
    () => dolgulariHesapla(parcalar, mod, sahiplik, aktorRenk, ittifakDurumlari, kapsam),
    [parcalar, mod, sahiplik, aktorRenk, ittifakDurumlari, kapsam]
  );
  const dolguResmi = useMemo(
    () => dolguResimleri(Skia, kaynak, dolgular, meta),
    [kaynak, dolgular, meta]
  );

  // Seçim değişince: vurgu (bant başına resim; oklar içinde).
  const vurgu = useMemo(
    () =>
      bantlar
        ? vurguResimleri(
            Skia,
            kaynak,
            {
              secili,
              komsular: hedefKipi ? null : komsular,
              hedefler: hedefKipi,
              hedefSaldiri,
              hedefSecili,
              kipSaldiri,
              oklar: emirOklari,
              kapsam,
            },
            bantlar,
            meta,
            ekran
          )
        : null,
    [
      kaynak,
      secili,
      komsular,
      hedefKipi,
      hedefSaldiri,
      hedefSecili,
      kipSaldiri,
      emirOklari,
      kapsam,
      bantlar,
      meta,
      ekran,
    ]
  );

  // Rozetler: resim sayfası yazı tipi gelince bir kez; katman resimleri ordular değişince.
  const font = useFont(ROZET_YAZISI, 13);
  const atlas = useMemo(() => rozetAtlasiKur(Skia, font, sekil), [font, sekil]);

  // CEPHE HATTI (Görev 21): savaştığın devletle ortak sınır. `ittifakDurumlari` her durum
  // değişiminde yeni nesne; hat listesi aynı kaldıkça (anahtar) resimler yeniden kurulmuyor.
  const cepheHam = useMemo(
    () => cepheHatlari(seviyeVerisi, sahiplik, ittifakDurumlari),
    [sahiplik, ittifakDurumlari]
  );
  const cepheAnahtar = cepheHam.map((c) => c.hat + c.ben).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cephe = useMemo(() => cepheHam, [cepheAnahtar]);
  const cepheResmi = useMemo(
    () => (bantlar ? cepheResimleri(Skia, kaynak, cephe, bantlar, atlas, meta, ekran) : null),
    [kaynak, cephe, bantlar, atlas, meta, ekran]
  );

  const rozetler = useMemo(
    () =>
      o
        ? rozetResimleri(
            Skia,
            { il: ilRozetleri || BOS_LISTE, parca: parcaRozetleri || BOS_LISTE },
            o.f,
            atlas,
            renk,
            ROZET_AYARI,
            meta
          )
        : null,
    [o, ilRozetleri, parcaRozetleri, atlas, renk, meta]
  );

  // KAREYE GİDEN HER ŞEY TEK NESNEDE. Değiştiğinde çizim fonksiyonu yeniden kuruluyor;
  // değişmediği sürece kareler yalnızca kamerayı okuyor. İçinde yalnızca kayıtlı resimler
  // ve düz sayılar var: arayüz iş parçacığına kopyalanması ucuz.
  const sahne = useMemo(
    () =>
      o && bantlar && hatResmi && rozetler
        ? {
            o,
            bantUst: bantlar.map((b) => b.ust),
            bantSeviye: bantlar.map((b) => b.seviye),
            dolgular: dolguResmi,
            hatlar: hatResmi,
            susAlt: sus ? sus.alt : null,
            susUst: sus ? sus.ust : null,
            nehir,
            cephe: cepheResmi,
            vurgu,
            rozetler,
            katmanBoya,
            atlasBoya,
          }
        : { o: null },
    [
      o,
      bantlar,
      hatResmi,
      sus,
      dolguResmi,
      nehir,
      cepheResmi,
      vurgu,
      rozetler,
      katmanBoya,
      atlasBoya,
    ]
  );

  // ---- DOKUNMA (JS iş parçacığı) ----
  const geom = useMemo(() => dokunmaGeometrisi(parcalar), [parcalar]);

  const hitSelect = useCallback(
    (sx, sy, tx, ty, z, LW, LH, uzun) => {
      const ol = haritaOlcusu(LW, LH, W, H);
      const sec = (pid) => {
        const gecerli = pid && kapsam && !kapsam.has(pid) ? null : pid;
        if (uzun) {
          if (gecerli && onUzunBas) onUzunBas(gecerli);
        } else {
          onSec(gecerli);
        }
      };

      // ÖNCE KAYDIRILMIŞ ROZETLERİN YERİNE BAK (Gelibolu, Yalova — rozetleri denizde).
      // Rozet artık harita ile büyüdüğü için kaydırma ve dokunma alanı da rozetle
      // birlikte büyüyor; kural eski haritayla aynı (tablo her zaman geçerli).
      const boy = rozetBoyutu(z, ROZET_AYARI.YAKIN, ROZET_AYARI);
      const kay = boy / ROZET_AYARI.CAP;
      const yaricap = boy / 2;
      for (const pid of Object.keys(PARCA_KAYDIRMA)) {
        const p = parcalar[pid];
        if (!p) continue;
        const k = PARCA_KAYDIRMA[pid];
        const e = haritadanEkrana(p.etiket.x, p.etiket.y, ol, z, tx, ty);
        const rx = e.x + k.dx * kay,
          ry = e.y + k.dy * kay;
        if ((sx - rx) * (sx - rx) + (sy - ry) * (sy - ry) > yaricap * yaricap) continue;
        sec(pid);
        return;
      }

      const h = ekrandanHaritaya(sx, sy, ol, z, tx, ty);
      const pid = parcaBul(geom, h.x, h.y);
      if (pid) sec(pid);
      else if (!uzun) onSec(null);
    },
    [geom, onSec, onUzunBas, kapsam, parcalar, W, H]
  );

  const jest = useMemo(() => {
    function sinirla() {
      'worklet';
      const { fx, fy } = kaydirmaSiniri(lw.value, lh.value, sc.value);
      if (tX.value > fx) tX.value = fx;
      if (tX.value < -fx) tX.value = -fx;
      if (tY.value > fy) tY.value = fy;
      if (tY.value < -fy) tY.value = -fy;
    }
    // Parmak değdiği anda süzülme ve kamera durur — oyuncu haritayı "tutar".
    function durdur() {
      'worklet';
      cancelAnimation(tX);
      cancelAnimation(tY);
    }
    const pan = Gesture.Pan()
      .maxPointers(1)
      .minDistance(DENGE.JEST.KAYDIRMA_ESIGI)
      .onBegin(() => {
        durdur();
      })
      .onStart((e) => {
        bX.value = tX.value;
        bY.value = tY.value;
        // Eşik telafisi (Harita.js'teki gerekçe): hareket ilk milimetreden parmağı izler.
        pdx.value = e.translationX;
        pdy.value = e.translationY;
        jestAktif.value = 1;
        jestSayaci.value += 1;
      })
      .onUpdate((e) => {
        tX.value = bX.value + (e.translationX - pdx.value);
        tY.value = bY.value + (e.translationY - pdy.value);
        sinirla();
      })
      .onEnd((e) => {
        // SÜZÜLME: parmağın hızıyla devam edip yavaşlayarak durur; sınır da durdurur.
        if (SUZULME > 0) {
          const { fx, fy } = kaydirmaSiniri(lw.value, lh.value, sc.value);
          tX.value = withDecay({ velocity: e.velocityX, deceleration: SUZULME, clamp: [-fx, fx] });
          tY.value = withDecay({ velocity: e.velocityY, deceleration: SUZULME, clamp: [-fy, fy] });
        }
      })
      .onFinalize(() => {
        jestAktif.value = 0;
        jestSayaci.value = Math.max(0, jestSayaci.value - 1);
      });
    const pinch = Gesture.Pinch()
      .onStart((e) => {
        durdur();
        jestAktif.value = 1;
        jestSayaci.value += 1;
        bS.value = sc.value;
        bX.value = tX.value;
        bY.value = tY.value;
        bfx.value = e.focalX;
        bfy.value = e.focalY;
      })
      .onUpdate((e) => {
        let n = bS.value * e.scale;
        if (n < EN_UZAK) n = EN_UZAK;
        if (n > EN_YAKIN) n = EN_YAKIN;
        const r = n / bS.value,
          Cx = lw.value / 2,
          Cy = lh.value / 2;
        // Başlangıç odağı sabit tutularak yakınlaştırma (Harita.js: bırakınca kayma sorunu).
        tX.value = (bfx.value - Cx) * (1 - r) + bX.value * r;
        tY.value = (bfy.value - Cy) * (1 - r) + bY.value * r;
        sc.value = n;
        sinirla();
      })
      .onFinalize(() => {
        jestAktif.value = 0;
        jestSayaci.value = Math.max(0, jestSayaci.value - 1);
      });
    const tap = Gesture.Tap()
      .maxDistance(12)
      .onBegin(() => {
        durdur();
      })
      .onEnd((e) => {
        if (dokunmaKilidi.value) return;
        runOnJS(hitSelect)(e.x, e.y, tX.value, tY.value, sc.value, lw.value, lh.value, false);
      });
    const uzunBas = Gesture.LongPress()
      .minDuration(DENGE.JEST.UZUN_BAS_SURE)
      .maxDistance(DENGE.JEST.UZUN_BAS_KAYMA)
      .onStart((e) => {
        // Hedef kipinde de çalışıyor (Görev 20 / Adım 5): hedefe basılı tutmak savaş
        // odasını açıyor — kuvvetin ayrıntılı ayarı ve karşı tarafın dökümü orada.
        if (dokunmaKilidi.value || jestAktif.value || kilit.value) return;
        kilit.value = 1;
        runOnJS(hitSelect)(e.x, e.y, tX.value, tY.value, sc.value, lw.value, lh.value, true);
      })
      .onFinalize(() => {
        kilit.value = 0;
      });
    return Gesture.Simultaneous(pan, pinch, Gesture.Exclusive(uzunBas, tap));
    // Paylaşılan değerler sabit referans; bağımlılığa girmeleri gereksiz (Harita.js ile aynı).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hitSelect]);

  // ---- KAMERA: savaş kamerası (Görev 08 / Adım 5) + açılış kamerası (GOREV-20 Adım 4) ----
  //
  // Savaş kamerası gösteride savaşın yerine iner. Açılış kamerası maç açılınca oyuncunun iline
  // (eğitimde ilk hamlenin iki bölgesine) süzülür — Polytopia oyunu başkentin yanında açıyor.
  // Kalıp aynı: sınırın içine kırpılmış hedef, zamanlı geçiş, geçiş boyunca jest sayacı dolu
  // (sabit yerleşim hareketin ortasında yeniden kurulmasın).
  //
  // ⚠ İKİSİ TEK ETKİDE. Paylaşılan değerleri (`sc`, `tX`, `tY`) iki ayrı etki yazamıyor: React
  // Compiler'ın değişmezlik kuralı ikinciyi "önceki etkinin kullandığı değer" diye reddediyor.
  // Hangisinin yeni olduğunu ref'ler söylüyor; aynı kamera/odak ikinci kez uygulanmıyor, yani
  // ekran ölçüsü değişince kamera oyuncunun baktığı yerden zorla geri çekilmiyor.
  // Zamanlayıcı etkinin temizliğinde İPTAL EDİLMİYOR: edilseydi, geçiş sürerken gelen ikinci
  // bir kamera jest sayacını hiç indirmez ve sabit yerleşim bir daha kurulmazdı.
  const kameraRef = useRef(null);
  const odakRef = useRef(null);
  useEffect(() => {
    if (!olcu || olcu.g < 2 || olcu.y < 2) return;
    let nokta = null,
      z = 0,
      sure = 1;
    if (odak && odak.z && odakRef.current !== odak) {
      odakRef.current = odak;
      nokta = odak;
      z = odak.z;
      sure = DENGE.JEST.ACILIS_SURE;
    } else if (kamera && DENGE.SAHNE.KAMERA.ACIK && kameraRef.current !== kamera) {
      kameraRef.current = kamera;
      const p = parcalar[kamera.parca];
      if (!p) return;
      nokta = p.etiket;
      z = DENGE.SAHNE.KAMERA.YAKINLIK;
      sure = DENGE.SAHNE.SURE.kamera * DENGE.SAHNE.HIZ_CARPANI;
    }
    if (!nokta) return;
    sure = Math.max(1, sure);

    const ol = haritaOlcusu(olcu.g, olcu.y, W, H);
    const hedef = kameraKaydirmasi(nokta.x, nokta.y, ol, z);
    const sinir = kaydirmaSiniri(olcu.g, olcu.y, z);
    const kirp = (v, sn) => Math.max(-sn, Math.min(sn, v));

    jestSayaci.value += 1;
    sc.value = withTiming(z, { duration: sure });
    tX.value = withTiming(kirp(hedef.tx, sinir.fx), { duration: sure });
    tY.value = withTiming(kirp(hedef.ty, sinir.fy), { duration: sure });
    setTimeout(() => {
      jestSayaci.value = Math.max(0, jestSayaci.value - 1);
    }, sure + 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kamera, odak, parcalar, olcu, W, H]);

  // ⚠ SIRA ÖNEMLİ: kareyi çizen blok, hareket değerlerini DEĞİŞTİREN jestlerden ve kameradan
  // SONRA duruyor. React Compiler'ın değişmezlik kuralı, bir kancaya (useDerivedValue,
  // useAnimatedReaction) verilmiş paylaşılan değerin sonradan yazılmasına izin vermiyor —
  // eski haritanın (Harita.js, KAMERA notu) aynı dersi.
  // ROZET KATMANI: il (0) ↔ parça (1). Eşiği geçince ZAMANLA değişir (DENGE.ROZET
  // DUNYA_GECIS_SURE); geri dönüş histerezisle aşağıda. İkisi de arayüz iş parçacığında —
  // yakınlaştırma sürerken React'e hiç uğramadan.
  // KADRO ŞERİDİ aynı kuralla kendi eşiğinde (DENGE.ROZET.SERIT_ESIGI) açılıp kapanıyor.
  const katman = useSharedValue(0);
  const gecis = useSharedValue(0);
  const serit = useSharedValue(0);
  const seritGecis = useSharedValue(0);
  // BİRLİK FİGÜRLERİ (Görev 21) de aynı kuralla, kendi eşiğinde.
  const figur = useSharedValue(0);
  const figurGecis = useSharedValue(0);
  useAnimatedReaction(
    () => sc.value,
    (z) => {
      const yeni = rozetKatmaniSec(z, katman.value, ROZET_AYARI);
      if (yeni !== katman.value) {
        katman.value = yeni;
        gecis.value = withTiming(yeni, { duration: GECIS_SURE });
      }
      const s = seritKatmaniSec(z, serit.value, ROZET_AYARI);
      if (s !== serit.value) {
        serit.value = s;
        seritGecis.value = withTiming(s, { duration: GECIS_SURE });
      }
      const fg = figurKatmaniSec(z, figur.value, ROZET_AYARI);
      if (fg !== figur.value) {
        figur.value = fg;
        figurGecis.value = withTiming(fg, { duration: GECIS_SURE });
      }
    }
  );

  // NEFES: her karede değil, NEFES_ADIM'da bir güncellenir — harita her güncellemede baştan
  // çiziliyor; saniyede ~20 çizim yavaş bir parlaklık değişimi için yetiyor (DENGE.ROZET).
  const nefes = useSharedValue(1);
  const nefesSira = useSharedValue(-1);
  useFrameCallback((bilgi) => {
    'worklet';
    if (!nefesAcik.value) {
      if (nefes.value !== 1) nefes.value = 1;
      return;
    }
    const t = bilgi.timeSinceFirstFrame;
    const sira = Math.floor(t / NEFES_ADIM);
    if (sira === nefesSira.value) return;
    nefesSira.value = sira;
    nefes.value = 0.5 + 0.5 * Math.cos((2 * Math.PI * t) / NEFES_SURE);
  });

  // HER KARE: kamera → dönüşüm → çizim. React'e hiç uğramıyor.
  const kare = useDerivedValue(() => {
    const s = sahne;
    if (!s.o) return createPicture(() => {});
    const z = sc.value;
    const d = kameraDonusumu(s.o, z, tX.value, tY.value);
    return createPicture(
      (c) => {
        sahneyiCiz(c, s, {
          k: d.k,
          bx: d.bx,
          by: d.by,
          z,
          parcaSaydam: gecis.value,
          // Şerit parça rozetlerinin parçası: il katmanına dönülürken onunla birlikte söner.
          seritSaydam: seritGecis.value * gecis.value,
          figurSaydam: figurGecis.value * gecis.value,
          nefes: nefes.value,
        });
      },
      { width: s.o.lw, height: s.o.lh }
    );
  }, [sahne]);

  return (
    <GestureDetector gesture={jest}>
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          lw.value = width;
          lh.value = height;
          setOlcu((x) => (x && x.g === width && x.y === height ? x : { g: width, y: height }));
        }}
      >
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <Picture picture={kare} />
        </Canvas>

        <SahneKatmani
          efektler={sahneEfektleri || BOS_EFEKT}
          serit={sahneSeridi}
          parcalar={parcalar}
          aktorRenk={aktorRenk}
          tX={tX}
          tY={tY}
          sc={sc}
          sabit={sabit}
        />

        {ipucu && o ? <IpucuHalkasi x={ipucu.x} y={ipucu.y} o={o} tX={tX} tY={tY} sc={sc} /> : null}
      </View>
    </GestureDetector>
  );
}
