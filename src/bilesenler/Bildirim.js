// BİLDİRİM — kısa süre görünüp kendiliğinden kaybolan tek satırlık haber (Görev 04 / Adım 6).
//
// Neden gerekli: sipariş tekrarlama "ne bastığını SÖYLEMEK" zorunda (§11) — bütçe yetmediyse
// neyin basılamadığını, parça artık senin değilse sebebini. Onay kutusu bunun için ağır
// (oyuncudan cevap beklemiyoruz), panelde de yeri yok (panel kapalı olabilir).
//
// Kendiliğinden kaybolur: oyuncunun kapatmakla uğraşması gerekmesin. Yine de dokununca
// hemen kapanır — uzun mesajı okuyup geçmek isteyene engel olmasın.
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PANEL, YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';

const SURE = 4500;

export default function Bildirim({ mesaj, iyi = true, ustBosluk = 0, onKapat }) {
  // Mesaj değişince sayaç baştan başlar — arka arkaya gelen bildirimler birbirini yemesin.
  useEffect(() => {
    if (!mesaj) return undefined;
    const zamanlayici = setTimeout(onKapat, SURE);
    return () => clearTimeout(zamanlayici);
  }, [mesaj, onKapat]);

  if (!mesaj) return null;

  return (
    <Animated.View
      style={[s.tabaka, { top: ustBosluk }]}
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(220)}
      pointerEvents="box-none"
    >
      <Pressable style={[s.kutu, !iyi && s.kutuUyari]} onPress={onKapat}>
        <Text style={s.metin}>{mesaj}</Text>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  // Ekranın üst ortasında; sol panel ve sağ üstteki tur çubuğu ile çakışmasın diye
  // yatayda ortalanıyor, dikeyde tur çubuğunun altına iniyor.
  tabaka: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  kutu: {
    maxWidth: '62%',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 13,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  kutuUyari: { borderColor: DURUM.eksi },
  metin: { fontFamily: YAZI.govde, fontSize: 12.5, lineHeight: 17, color: YAZI_RENK.birincil },
});
