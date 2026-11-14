// SAHNE KARTI — oyunun en yüklü anları (Görev 08 / Adım 6 · §4.3/Katman 4).
//
// ┌─ NEDEN KART ────────────────────────────────────────────────────────────────────────┐
// │ §4.1'in son iki maddesi: *"kayıp acıtmıyor"* ve *"anıtlaşan an yok"*.                │
// │                                                                                      │
// │ Parça el değiştirmek TAKTİK bir olaydır — haritada rengi döner, geçer.               │
// │ İL el değiştirmek DUYGUSAL bir olaydır ve bugüne kadar sessiz geçiyordu: oyunun en   │
// │ yüklü anı hiçbir yerde işaretlenmiyordu. Kart o boşluğu kapatıyor.                    │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ÖLÇEK DUYGUSU ----
// Kartın süresi ilin DEĞERİNE göre değişiyor (`olaylar.js ilOlcegi`) — İstanbul'u almak
// Iğdır'ı almaktan uzun sürüyor. Burada o ölçek kartın BOYUNA da yansıyor: aynı katsayı,
// iki yerde görünüyor. Katsayının kendisi `DENGE.SAHNE.OLCEK_GUCU`, tek düğme (§Adım 6).
//
// ---- HARİTA JESTİ ----
// Bu kart `pointerEvents="none"`: dokunmayı hiç almıyor, çünkü gösterinin atlanması
// ekranın HERHANGİ bir yerine dokunmakla oluyor (App.js'teki atlama katmanı). Görev
// belgesi §10/2'nin "üstteki kutu yerel jesti engellemez" tuzağı burada doğmuyor —
// kart bir düğme değil, bir an.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PANEL, YAZI, CIZGI, YAZI_RENK, DURUM } from '../tema';
import { useOlcek } from '../olcu';

// Kart türünden görünüme. Renk burada karara bağlanıyor, çağıran yerde değil:
// "fetih parlak, kayıp koyu" bir SUNUM kuralı ve tek yerde durmalı.
const BICIM = {
  ilTamamlandi: {
    cerceve: YAZI_RENK.birincil,
    baslikRenk: YAZI_RENK.birincil,
    adRenk: YAZI_RENK.birincil,
  },
  ilKaybedildi: { cerceve: DURUM.eksi, baslikRenk: DURUM.eksi, adRenk: YAZI_RENK.ikincil },
  // Bölge kartları (Görev 21): il kartlarının aynı dili, daha sessiz çerçeve.
  // `olcek`: bölge kartı il kartından küçük — il bir anıt, bölge bir haber.
  bolgeAlindi: {
    cerceve: CIZGI.ince,
    baslikRenk: DURUM.arti,
    adRenk: YAZI_RENK.birincil,
    olcek: 0.75,
  },
  bolgeKaybedildi: {
    cerceve: CIZGI.ince,
    baslikRenk: DURUM.eksi,
    adRenk: YAZI_RENK.ikincil,
    olcek: 0.75,
  },
  duello: { cerceve: YAZI_RENK.ikincil, baslikRenk: YAZI_RENK.ikincil, adRenk: YAZI_RENK.birincil },
  turAcilisi: { cerceve: CIZGI.ince, baslikRenk: YAZI_RENK.ikincil, adRenk: YAZI_RENK.birincil },
};

// kart: { tip, baslik, ad, alt, olcek, no }
export default function SahneKarti({ kart }) {
  const { telefon } = useOlcek();
  const t = useSharedValue(0);

  // `kart.no` her yeni kartta değişiyor; animasyon böylece her kartta baştan başlıyor.
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 240 });
  }, [t, kart.no]);

  const stil = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.86 + 0.14 * t.value }],
  }));

  const b = BICIM[kart.tip] || BICIM.turAcilisi;
  // Ölçek il kartlarında ilin değerine göre, bölge kartlarında sabit ve küçük; tur açılışı ve
  // düello sabit boyda.
  const olcek = kart.olcek || b.olcek || 1;
  const adBoyut = (telefon ? 24 : 30) * olcek;

  return (
    <View style={s.tabaka} pointerEvents="none">
      <Animated.View style={[s.kart, telefon && s.kartDar, { borderColor: b.cerceve }, stil]}>
        <Text style={[s.baslik, { color: b.baslikRenk }]}>{kart.baslik}</Text>
        <Text style={[s.ad, { color: b.adRenk, fontSize: adBoyut, lineHeight: adBoyut * 1.15 }]}>
          {kart.ad}
        </Text>
        {kart.alt ? <Text style={s.alt}>{kart.alt}</Text> : null}
        {/* İKİ LİDERİN LAKABI (Görev 16 / Adım 2). Yalnızca düello kartında dolu geliyor:
            iki il arasındaki kavga, iki KİŞİ arasındaki kavga gibi okunsun. */}
        {kart.liderA && kart.liderB ? (
          <Text style={s.liderler}>
            {kart.liderA} × {kart.liderB}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  // Perde YOK: harita görünmeye devam etsin. Kart bir kesinti değil, bir vurgu.
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  kart: {
    alignItems: 'center',
    gap: 3,
    minWidth: 240,
    paddingVertical: 18,
    paddingHorizontal: 34,
    backgroundColor: PANEL.sahneKart,
    borderWidth: 2,
    borderRadius: 14,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 20,
  },
  kartDar: { minWidth: 190, paddingVertical: 13, paddingHorizontal: 24 },
  baslik: { fontFamily: YAZI.etiket, fontSize: 11, letterSpacing: 3 },
  ad: { fontFamily: YAZI.baslik, letterSpacing: 1.5, textAlign: 'center' },
  alt: { fontFamily: YAZI.govde, fontSize: 12.5, color: DURUM.arti },
  liderler: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil, marginTop: 2 },
});
