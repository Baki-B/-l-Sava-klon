// EĞİTİM İŞARETLERİ — "şimdi buraya dokun" (GOREV-20 Adım 8 · §4.6).
//
// İki işaret, ikisi de metinsiz (CLAUDE.md §5/10):
//   • `IpucuHalkasi` — haritada bir bölgenin üstünde beyaz bir halka ve dışa açılıp sönen bir
//     dalga. Harita ile birlikte kayar, yakınlaşınca yerinde kalır, boyu sabit.
//   • `Parilti` — bir düğmenin çevresinde nabız gibi yanıp sönen çerçeve.
//
// ⚠ SKIA HARİTASINA ÇİZİLMİYOR, ÜSTÜNDE DURUYOR. Haritada sürekli bir kıpırtı bütün haritayı
// her karede yeniden çizdirir (CLAUDE.md §6 "sürekli canlandırma = sürekli yeniden çizim").
// Halka haritanın üstünde küçük bir görünüm: canlandırması yalnızca kendini çizer, yerini
// kameranın paylaşılan değerlerinden (`tX`, `tY`, `sc`) arayüz iş parçacığında okur.
// Dokunmayı ALMAZ (`pointerEvents="none"`): altındaki bölgeye dokunmak haritanın işi.
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { IPUCU } from '../tema';
import { DENGE } from '../denge';
import { kameraDonusumu } from '../haritaDonusum';

const SURE = DENGE.EGITIM.PARILTI_SURE;
const CAP = IPUCU.halkaCap;

// Sonsuz dönen 0 → 1 sayacı. `gidipGel`: 0→1→0 (nabız); değilse hep 0→1 (dalga).
function useDongu(gidipGel) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: SURE, easing: Easing.inOut(Easing.quad) }),
      -1,
      gidipGel
    );
    return () => cancelAnimation(t);
  }, [t, gidipGel]);
  return t;
}

// Haritadaki halka. `x`, `y`: harita birimi (parçanın etiket noktası). `o`: haritanın
// sığdırma ölçüsü (`haritaOlcusu`, HaritaSkia'dan düz sayılar).
export function IpucuHalkasi({ x, y, o, tX, tY, sc }) {
  const dalga = useDongu(false);
  const yer = useAnimatedStyle(() => {
    const d = kameraDonusumu(o, sc.value, tX.value, tY.value);
    return {
      transform: [
        { translateX: d.bx + d.k * x - CAP / 2 },
        { translateY: d.by + d.k * y - CAP / 2 },
      ],
    };
  });
  const dalgaStil = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - dalga.value),
    transform: [{ scale: 1 + 0.9 * dalga.value }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[s.halkaKutu, yer]}>
      <Animated.View style={[s.halka, s.dalga, dalgaStil]} />
      <View style={[s.halka, s.kontur]} />
      <View style={s.halka} />
    </Animated.View>
  );
}

// Düğmenin çevresindeki nabız. Sarmal HER ZAMAN duruyor (yalnızca çerçeve gelip gidiyor):
// sarmal açılıp kapansaydı içindeki düğme yeniden kurulur, basılı hâli kaybolurdu.
// `yaricap`: düğmenin köşe yuvarlağı; `pay`: çerçevenin düğmeden ne kadar taştığı.
export function Parilti({ acik, yaricap = 9, pay = 4, stil, children }) {
  return (
    <View style={stil}>
      {children}
      {acik ? <Cerceve yaricap={yaricap} pay={pay} /> : null}
    </View>
  );
}

function Cerceve({ yaricap, pay }) {
  const t = useDongu(true);
  const a = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * t.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.cerceve,
        { top: -pay, left: -pay, right: -pay, bottom: -pay, borderRadius: yaricap + pay },
        a,
      ]}
    />
  );
}

const s = StyleSheet.create({
  halkaKutu: { position: 'absolute', left: 0, top: 0, width: CAP, height: CAP },
  halka: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CAP / 2,
    borderWidth: IPUCU.kalinlik,
    borderColor: IPUCU.renk,
  },
  // Beyaz halkanın dışında ince koyu bir kontur: açık renkli illerin üstünde de okunsun.
  kontur: {
    top: -1.5,
    left: -1.5,
    right: -1.5,
    bottom: -1.5,
    borderRadius: CAP / 2 + 1.5,
    borderWidth: IPUCU.kalinlik + 3,
    borderColor: IPUCU.kontur,
    opacity: 0.55,
  },
  dalga: { borderWidth: 2 },
  cerceve: { position: 'absolute', borderWidth: 2.5, borderColor: IPUCU.renk },
});
