// TURU BİTİR — sağ altta büyük yuvarlak düğme (Görev 21 · U2).
//
// Baki (2026-09-24, öneri listesinden): Polytopia ve Antiyoy'da ekranın en belirgin düğmesi
// bu; "işim bitti mi" okumadan görünür. Önceden tur çubuğunun en sağında küçük bir "BİTİR"
// yazısıydı.
//
// İKİ HÂL — metinsiz (CLAUDE.md §5/10):
//   • hâlâ oynayabilen ordun var → düğme sessiz (panel rengi), yanında KAÇ ORDU beklediği.
//     Haritada o orduların kalkanında halka yanıyor; sayı ile halkalar aynı tablodan
//     (`oyun/hareket.js hamleHakkiTablosu`).
//   • hepsi oynadı → düğme dolar (açık zemin, koyu simge): "sıra sende değil, turu bitir".
// Basınca eskisi gibi onay kutusu açılıyor (turu bitirmek geri alınamaz).
//
// KURAL BİLMEZ: sayı kancadan (`O.bekleyenOrdu`) geliyor.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { YAZI, ZEMIN, CIZGI, YAZI_RENK, PANEL } from '../tema';
import { IkonTurBitir } from './Ikonlar';

export default function TurBitirDugmesi({ bekleyen, onPress, boyut }) {
  const hazir = !(bekleyen > 0);
  const on = hazir ? ZEMIN.taban : YAZI_RENK.birincil;
  const rozet = Math.round(boyut * 0.4);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        s.dugme,
        { width: boyut, height: boyut, borderRadius: boyut / 2 },
        hazir && s.hazir,
        pressed && s.basili,
      ]}
    >
      <IkonTurBitir size={Math.round(boyut * 0.4)} color={on} />
      <Text style={[s.yazi, { color: on, fontSize: boyut < 60 ? 9 : 10.5 }]}>BİTİR</Text>
      {!hazir && (
        <View
          style={[
            s.rozet,
            { minWidth: rozet, height: rozet, borderRadius: rozet / 2, top: -3, left: -3 },
          ]}
        >
          <Text
            style={[
              s.rozetYazi,
              { fontSize: Math.round(rozet * 0.55), lineHeight: Math.round(rozet * 0.75) },
            ]}
          >
            {bekleyen}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  // Arka planı VAR: haritanın üstündeki her düğme dokunmayı yutmalı (CLAUDE.md §6).
  dugme: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1.5,
    borderColor: CIZGI.ince,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  hazir: { backgroundColor: YAZI_RENK.birincil, borderColor: YAZI_RENK.birincil },
  basili: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  yazi: { fontFamily: YAZI.baslik, letterSpacing: 0.6, lineHeight: 12 },
  rozet: {
    position: 'absolute',
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZEMIN.taban,
    borderWidth: 1.5,
    borderColor: YAZI_RENK.birincil,
  },
  rozetYazi: { fontFamily: YAZI.sayi, color: YAZI_RENK.birincil },
});
