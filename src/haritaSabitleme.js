// SABİT YERLEŞİM — rozetlerin ve sahne efektlerinin ORTAK zemini (Görev 08 / Adım 4).
//
// ┌─ NEDEN AYRI DOSYA ──────────────────────────────────────────────────────────────────┐
// │ Bu kural `RozetKatmani.js`'in içindeydi ve orada doğruydu; tek kullanıcısı oydu.     │
// │ Görev 08'de ikinci bir kullanıcı doğdu: sahne efektleri (sarsıntı, uçuşan sayı,      │
// │ renk darbesi, savaş şeridi) rozetlerin TAM ÜSTÜNDE durmak zorunda.                   │
// │                                                                                      │
// │ İkinci bir kopya yazmak §10/4'ün tuzağı olurdu ("aynı kural iki yerde tutulmaz") ve  │
// │ bu tuzağın bedeli burada özellikle ağır: iki katman bir piksel ayrışsa efekt rozetin │
// │ yanında patlar. Görev 05'te akıcılık altı tur kovalanmıştı, kök sebep tam da rozet   │
// │ yerleşiminin ikiye ayrılmasıydı.                                                     │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ROZET KATMANININ ÜÇ DEĞİŞMEZİ BURADA DA GEÇERLİ ----
//
//   1. KAYDIRMA HİÇBİR ŞEYİ YENİDEN HESAPLATMAZ. Yer, kaydırma SIFIRKEN hesaplanıyor;
//      kaydırmayı kapsayıcının kendi dönüşümü taşıyor. `sabitle` yalnızca yakınlaştırma
//      ya da ekran ölçüsü değişince yeni nesne döndürüyor — aynıysa ÖNCEKİ NESNEYİ
//      döndürüyor ki React yeniden çizmesin.
//   2. AYIKLAMA YOK. Görünmeyeni kurmama denendi ve geri alındı (RozetKatmani.js).
//   3. DONANIM DOKUSU YOK. Doku görünüm sınırında kesiyor; kenardaki rozet yarım kalıyor.
//
// Sabitleme YALNIZCA hareket bittiğinde (jest sayacı sıfıra indiğinde) veya ekran ölçüsü
// değiştiğinde yapılır. Hareketin ORTASINDA asla.

import { useState, useCallback } from 'react';
import { useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { rozetKatmani } from './oyun/ordu';
import { haritaOlcusu } from './haritaDonusum';

// Dönen: { olcu, z, lw, lh, katman } veya null (ilk ölçüm bekleniyor).
export function useSabitYerlesim({ lw, lh, sc, jestSayaci, W, H }) {
  const [sabit, setSabit] = useState(null);

  const sabitle = useCallback(
    (o) => {
      setSabit((onceki) => {
        if (onceki && onceki.z === o.z && onceki.lw === o.lw && onceki.lh === o.lh) return onceki;
        return {
          olcu: haritaOlcusu(o.lw, o.lh, W, H),
          z: o.z,
          lw: o.lw,
          lh: o.lh,
          katman: rozetKatmani(o.z, onceki && onceki.katman),
        };
      });
    },
    [W, H]
  );

  useAnimatedReaction(
    () => {
      'worklet';
      const LW = lw.value,
        LH = lh.value;
      if (LW < 2 || LH < 2) return null;
      return { jest: jestSayaci.value, olcu: Math.round(LW) * 10000 + Math.round(LH) };
    },
    (yeni, eski) => {
      'worklet';
      if (!yeni || yeni.jest !== 0) return; // hareket sürüyorsa sabitleme yok
      const jestBitti = !eski || eski.jest !== 0;
      const olcuDegisti = !eski || yeni.olcu !== eski.olcu;
      if (!jestBitti && !olcuDegisti) return;
      runOnJS(sabitle)({ z: sc.value, lw: lw.value, lh: lh.value });
    }
  );

  return sabit;
}
