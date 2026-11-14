// KARE SAYACI — yalnızca GELİŞTİRMEDE görünen küçük ölçer (Görev 20 / Adım 2).
//
// NİYE VAR. "Akıcı mı" sorusunun cevabı bugüne kadar hep Baki'nin gözüydü ("takılıyor",
// "azalmış ama var"). Göz iyi bir hakem ama sayı vermiyor; iki harita arasındaki farkı ve
// hangi yakınlıkta düştüğünü söyleyemiyor. Bu sayaç arayüz iş parçacığının saniyedeki
// kare sayısını gösteriyor: haritanın çizildiği yer orası.
//
// OKUMA: 60 (120 Hz ekranlarda 120) = kusursuz. Yakınlaştırırken 45'in altına düşüyorsa
// göz takılmayı görür. Son saniyenin EN KÖTÜ karesi de yanında: ortalama iyi görünüp tek
// tük uzun kareler "takılma" hissini verebilir.
//
// Yayın paketinde hiç çizilmez (`__DEV__` false) — oyuncuya bir şey anlatmıyor (CLAUDE.md
// §5/10); Expo Go'da Baki'ye ölçüm aleti.

import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useFrameCallback, runOnJS, useSharedValue } from 'react-native-reanimated';
import { YAZI, YAZI_RENK } from '../tema';

// Ölçümün tazelenme aralığı (ms).
const ARALIK = 500;

export default function KareSayaci({ stil }) {
  const [olcum, setOlcum] = useState({ kps: 0, enKotu: 0 });
  const bas = useSharedValue(0);
  const sayi = useSharedValue(0);
  const enUzun = useSharedValue(0);

  useFrameCallback((kare) => {
    'worklet';
    const t = kare.timestamp;
    if (bas.value === 0) bas.value = t;
    sayi.value += 1;
    const d = kare.timeSincePreviousFrame || 0;
    if (d > enUzun.value) enUzun.value = d;
    const gecen = t - bas.value;
    if (gecen >= ARALIK) {
      const kps = Math.round((sayi.value * 1000) / gecen);
      runOnJS(setOlcum)({ kps, enKotu: Math.round(enUzun.value) });
      bas.value = t;
      sayi.value = 0;
      enUzun.value = 0;
    }
  });

  return (
    <Text style={[s.metin, stil]} pointerEvents="none">
      {olcum.kps + ' kare/sn · en uzun ' + olcum.enKotu + ' ms'}
    </Text>
  );
}

const s = StyleSheet.create({
  metin: {
    position: 'absolute',
    fontFamily: YAZI.govde,
    fontSize: 10,
    lineHeight: 12,
    color: YAZI_RENK.ikincil,
    opacity: 0.8,
  },
});
