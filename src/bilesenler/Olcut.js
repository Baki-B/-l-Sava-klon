// ÖLÇÜT — oyundaki TEK derecelendirme biçimi (Görev 10A / Adım 5).
//
// ┌─ NEDEN TEK DOSYA ───────────────────────────────────────────────────────────────────┐
// │ Görev belgesi §2/3: oyunda ÜÇ ayrı derecelendirme dili vardı ve üçü de tek panelde  │
// │ yan yana duruyordu:                                                                  │
// │   • 10 kareli çubuk  (il statları)                                                   │
// │   • 5 noktalı sıra   (bölgenin değeri)                                               │
// │   • kelime           (savunma: "Düşük" / "Orta" / "Yüksek")                          │
// │ Üçü de "bu ne kadar?" sorusunu cevaplıyordu ama oyuncu her seferinde ölçeği yeniden  │
// │ öğrenmek zorunda kalıyordu.                                                          │
// │                                                                                      │
// │ Baki'nin kararı (2026-08-02): **5 nokta.** Gerekçesi: 10 kare telefonda okunmuyor    │
// │ ve panelin yarısını yiyor.                                                           │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// Ölçüt gösteren her yer BURAYI çağırır. İkinci bir biçim doğarsa üçüncü dil de doğar.
//
// NOKTA YUVARLAK: `KOSE` kuralı ("yuvarlak köşe = buraya basılır") KUTULAR için geçerli.
// 7 dp'lik bir işaret kutu değil, işarettir — kimse ona basmayı denemez.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { YAZI_RENK, CIZGI } from '../tema';

export const NOKTA_SAYISI = 5;

// 0–10 arası bir statı 0–5 noktaya indirir. Kesin sayı kaybolmuyor: panelde noktaların
// yanında rakam da yazıyor. Nokta "ne kadar", rakam "tam olarak ne kadar" diyor.
export function stattanOlcut(deger) {
  return Math.max(0, Math.min(NOKTA_SAYISI, Math.round(deger / 2)));
}

export default function Olcut({ deger, boyut = 7 }) {
  const dolu = Math.max(0, Math.min(NOKTA_SAYISI, Math.round(deger)));
  return (
    <View style={s.sira}>
      {Array.from({ length: NOKTA_SAYISI }).map((_, i) => (
        <View
          key={i}
          style={[
            { width: boyut, height: boyut, borderRadius: boyut / 2 },
            i < dolu ? s.dolu : s.bos,
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  sira: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dolu: { backgroundColor: YAZI_RENK.birincil },
  // Boş nokta DOLGUSUZ HALKA: dolu olanla karışmasın diye renk değil BİÇİM farkı var.
  // Yalnız renk farkı olsaydı (eski hâlde olduğu gibi) kâğıt üstünde sayılamıyordu.
  bos: { borderWidth: 1, borderColor: CIZGI.ince },
});
