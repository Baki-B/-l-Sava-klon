// SAHNE KATMANI — savaşın haritada görünen yüzü (Görev 08 / Adım 4–5).
//
// ┌─ NEDEN AYRI KATMAN, ROZETİN İÇİ DEĞİL ──────────────────────────────────────────────┐
// │ Görev belgesi §Adım 4 rozet katmanına dokunmayı "projenin en kırılgan yeri" diye     │
// │ işaretledi ve üç kural koydu. Bu katman üçünü de sağlıyor, üstelik en sağlam yoldan: │
// │                                                                                      │
// │   • SABİT YERLEŞİM BOZULMUYOR — çünkü `RozetKatmani`'ye hiç dokunulmadı. Efektler    │
// │     onun ÜSTÜNDE, AYNI yerleşimi okuyan (`haritaSabitleme.js`) ikinci bir katmanda.  │
// │   • ROZETLER YENİDEN ÇİZİLMİYOR — efekt açılıp kapanırken rozet katmanının özellikleri│
// │     değişmiyor, `React.memo` tutuyor. Gösteri boyunca rozet başına maliyet SIFIR.    │
// │   • DONANIM DOKUSU YOK — bu katmanda da yok. Efektin rozetin dışına taşması bu       │
// │     yüzden güvenli: kesecek doku yok (görev belgesi §10/3'ün şartı böyle karşılanıyor).│
// │                                                                                      │
// │ Belge "efekt rozetin üstündeki dönüşümü oynatır" diyordu; burada efekt rozetin       │
// │ ÜSTÜNE ÇİZİLİYOR. Sonuç gözle aynı, risk ise çok daha düşük.                          │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// Efektler kendi ömürlerini `useSahne` belirliyor; bu dosya yalnızca ÇİZİYOR. Bir efekt
// listeden düşünce bileşeni sökülüyor, animasyonu da onunla gidiyor.

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { PANEL, YAZI, CIZGI, YAZI_RENK, VURGU, DURUM } from '../tema';
import { DENGE } from '../denge';
import { PARCA_KAYDIRMA } from '../rozetKaydirma';
import { sabitEkranYeri } from '../haritaDonusum';
import { BIRIM_IKONU } from './Ikonlar';

const CAP = DENGE.ROZET.CAP;
const S = DENGE.SAHNE;
// Şeritte bir taraf için en çok kaç ikon çizilir. Fazlası "+3" diye yazılıyor: 20 birimlik
// orduyu 20 ikonla göstermek şeridi ekran genişliğine taşırır.
const EN_COK_IKON = 6;

// ---- SARSINTI ----
// Rozetin ÜSTÜNDE bir halka titriyor. Rozetin kendisi oynamıyor: sabit yerleşim (Görev
// 05'in beş turda çözülen kusuru) bu görevin kırmızı çizgisi.
function Sarsinti({ x, y, siddet }) {
  const t = useSharedValue(0);
  useEffect(() => {
    const px = S.SARSINTI.PIKSEL * (siddet || 1);
    t.value = withRepeat(
      withSequence(
        withTiming(px, { duration: S.SARSINTI.SURE / 4 }),
        withTiming(-px, { duration: S.SARSINTI.SURE / 2 }),
        withTiming(0, { duration: S.SARSINTI.SURE / 4 })
      ),
      S.SARSINTI.TEKRAR,
      false
    );
  }, [t, siddet]);
  const stil = useAnimatedStyle(() => ({ transform: [{ translateX: t.value }] }));
  const boyut = CAP + 8;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.halka,
        { left: x - boyut / 2, top: y - boyut / 2, width: boyut, height: boyut },
        siddet > 1 && s.halkaSert,
        stil,
      ]}
    />
  );
}

// ---- UÇUŞAN SAYI ----
// "−2" yükselip söner. §4.3/Katman 2'nin ilk maddesi; kaybın SAYIYA değil ANA dönüşmesi.
function UcanSayi({ x, y, deger, ikinci }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 620 });
  }, [t]);
  const stil = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateY: -26 * t.value }],
  }));
  // İki taraf da kayıp verdiyse sayılar üst üste binmesin: biri sola, öteki sağa.
  const kayma = ikinci ? 16 : -16;
  return (
    <Animated.View pointerEvents="none" style={[s.cipa, { left: x + kayma, top: y - 6 }, stil]}>
      <Text style={[s.ucanSayi, ikinci && s.ucanSayiIkinci]}>{deger}</Text>
    </Animated.View>
  );
}

// ---- DAĞILMA (imha) ----
// Ordu tamamen yok oldu. Genişleyip sönen bir halka — "burada bir şey vardı, artık yok".
function Dagilma({ x, y }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 520 });
  }, [t]);
  const stil = useAnimatedStyle(() => ({
    opacity: 0.9 * (1 - t.value),
    transform: [{ scale: 1 + 1.4 * t.value }],
  }));
  const boyut = CAP + 4;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.halka,
        s.halkaImha,
        { left: x - boyut / 2, top: y - boyut / 2, width: boyut, height: boyut },
        stil,
      ]}
    />
  );
}

// ---- RENK DARBESİ (fetih) ----
// Parça el değiştirdi. Yeni sahibin renginde bir dalga yayılıyor; haritanın kendi rengi
// zaten değişmiş oluyor, bu onu İŞARETLİYOR.
function Darbe({ x, y, renk }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 560 });
  }, [t]);
  const stil = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - t.value),
    transform: [{ scale: 0.4 + 2.2 * t.value }],
  }));
  const boyut = CAP + 10;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.darbe,
        {
          left: x - boyut / 2,
          top: y - boyut / 2,
          width: boyut,
          height: boyut,
          borderRadius: boyut,
        },
        renk ? { backgroundColor: renk } : null,
        stil,
      ]}
    />
  );
}

// ---- OK ----
// Ordunun yürüyüşü. Emir okları tur bitince kuyrukla birlikte siliniyor; gösterideki ok
// ayrı ve GEÇİCİ. Çizgi kendi uzunluğunca uzuyor: hareket hissini veren şey bu.
function Ok({ x1, y1, x2, y2, saldiri, cekilme }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 340 });
  }, [t]);
  const uzunluk = Math.hypot(x2 - x1, y2 - y1);
  const aci = Math.atan2(y2 - y1, x2 - x1) + 'rad';
  const stil = useAnimatedStyle(() => ({
    width: uzunluk * t.value,
    opacity: t.value < 0.8 ? 1 : (1 - t.value) / 0.2,
  }));
  const renk = cekilme ? YAZI_RENK.ikincil : saldiri ? DURUM.eksi : DURUM.arti;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.ok,
        {
          left: x1,
          top: y1 - 1.5,
          backgroundColor: renk,
          transform: [{ translateX: 0 }, { rotate: aci }],
        },
        stil,
      ]}
    />
  );
}

// ---- BİRLİK ŞERİDİ (§Adım 5) ----
// "Önemli savaş"ta rozetin yanında açılır: iki tarafın birlikleri, raunt raunt düşenler.
// Yeni çizim gerekmiyor — Görev 07'nin üç birim ikonu (miğfer / obüs / paletli tank).
function Taraf({ birimler, kalan, renk }) {
  const ikonlar = [];
  let toplam = 0;
  for (const tur of DENGE.BIRIM_SIRASI) {
    const n = (birimler && birimler[tur]) || 0;
    for (let i = 0; i < n; i++) {
      toplam++;
      if (ikonlar.length < EN_COK_IKON) ikonlar.push(tur);
    }
  }
  // Kalan bilinmiyorsa (savaş henüz başlamadı) hepsi ayakta.
  const ayakta = kalan === null || kalan === undefined ? toplam : kalan;
  return (
    <View style={s.seritSatir}>
      {ikonlar.map((tur, i) => {
        const Ikon = BIRIM_IKONU[tur];
        // Görsel ölçek: gerçek kayıp oranını ikon sayısına indiriyoruz. Şeritte 6 ikon
        // varken 20 birimlik orduda tek tek düşenleri göstermek zaten mümkün değil.
        const dusmusMu = i >= Math.round((ayakta / (toplam || 1)) * ikonlar.length);
        return (
          <View key={i} style={dusmusMu ? s.dusmus : null}>
            <Ikon size={14} color={dusmusMu ? CIZGI.ayrac : renk} />
          </View>
        );
      })}
      {toplam > EN_COK_IKON && <Text style={s.seritArti}>+{toplam - EN_COK_IKON}</Text>}
      <Text style={[s.seritSayi, ayakta < toplam && s.seritSayiDusen]}>{ayakta}</Text>
    </View>
  );
}

function Serit({ x, y, veri, aktorRenk }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 200 });
  }, [t]);
  const stil = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.9 + 0.1 * t.value }],
  }));
  const GEN = 132;
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.serit, { left: x - GEN / 2, top: y + CAP / 2 + 6, width: GEN }, stil]}
    >
      <Text style={s.seritBaslik}>{veri.raunt > 0 ? 'RAUNT ' + veri.raunt : 'MUHAREBE'}</Text>
      <Taraf
        birimler={veri.saldiran}
        kalan={veri.saldiranKalan}
        renk={(aktorRenk && aktorRenk[veri.saldiranId]) || YAZI_RENK.birincil}
      />
      <View style={s.seritAyrac} />
      <Taraf
        birimler={veri.savunan}
        kalan={veri.savunanKalan}
        renk={(aktorRenk && aktorRenk[veri.savunanId]) || YAZI_RENK.ikincil}
      />
    </Animated.View>
  );
}

// ---- KATMANIN KENDİSİ ----
export default function SahneKatmani({ efektler, serit, parcalar, aktorRenk, tX, tY, sc, sabit }) {
  // Parça kimliğinden SABİT ekran yerine. Rozetlerin okuduğu yerleşimin aynısı
  // (`haritaSabitleme.js`) — bir piksel ayrışsa efekt rozetin yanında patlardı.
  const yer = useMemo(() => {
    if (!sabit) return null;
    return (pid) => {
      const p = parcalar[pid];
      if (!p) return null;
      const e = sabitEkranYeri(p.etiket.x, p.etiket.y, sabit.olcu, sabit.z);
      const k = PARCA_KAYDIRMA[pid];
      return { x: e.x + (k ? k.dx : 0), y: e.y + (k ? k.dy : 0) };
    };
  }, [parcalar, sabit]);

  const z0 = sabit && sabit.z;
  // Kapsayıcı dönüşümü ROZET KATMANIYLA BİREBİR AYNI. Ayrı yazılmasının sebebi ikisinin
  // farklı sönme eğrisi kullanması: rozetler yakınlaştırmada sönüyor, efektler sönmüyor —
  // efekt zaten kısa ömürlü, ortasında kaybolması "takıldı mı" hissi verirdi.
  const stil = useAnimatedStyle(() => {
    if (!z0) return { opacity: 0 };
    return {
      opacity: 1,
      transform: [{ translateX: tX.value }, { translateY: tY.value }, { scale: sc.value / z0 }],
    };
  }, [z0]);

  if (!yer || (efektler.length === 0 && !serit)) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, stil]} pointerEvents="none">
      {efektler.map((e) => {
        if (e.tip === 'ok') {
          const a = yer(e.kaynak),
            b = yer(e.hedef);
          if (!a || !b) return null;
          return (
            <Ok
              key={e.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              saldiri={e.saldiri}
              cekilme={e.cekilme}
            />
          );
        }
        const p = yer(e.parca);
        if (!p) return null;
        if (e.tip === 'sarsinti') return <Sarsinti key={e.id} x={p.x} y={p.y} siddet={e.siddet} />;
        if (e.tip === 'ucanSayi')
          return <UcanSayi key={e.id} x={p.x} y={p.y} deger={e.deger} ikinci={e.ikinci} />;
        if (e.tip === 'dagilma') return <Dagilma key={e.id} x={p.x} y={p.y} />;
        if (e.tip === 'darbe')
          return <Darbe key={e.id} x={p.x} y={p.y} renk={aktorRenk && aktorRenk[e.sahip]} />;
        return null;
      })}

      {serit &&
        (() => {
          const p = yer(serit.parca);
          return p ? <Serit x={p.x} y={p.y} veri={serit} aktorRenk={aktorRenk} /> : null;
        })()}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  cipa: { position: 'absolute', width: 0, height: 0, alignItems: 'center' },
  halka: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: YAZI_RENK.ikincil,
    opacity: 0.85,
  },
  halkaSert: { borderColor: DURUM.eksi, borderWidth: 2.5 },
  halkaImha: { borderColor: DURUM.eksi, borderWidth: 3 },
  darbe: { position: 'absolute', backgroundColor: VURGU.saldiri },
  ok: { position: 'absolute', height: 3, borderRadius: 2, transformOrigin: 'left center' },
  // Yazı gölgesi kaldırıldı: koyu zeminde okunurluk içindi, açık kâğıtta kir gibi duruyor.
  ucanSayi: {
    fontFamily: YAZI.sayi,
    fontSize: 15,
    lineHeight: 19,
    color: DURUM.eksi,
  },
  ucanSayiIkinci: { color: YAZI_RENK.birincil },

  serit: {
    position: 'absolute',
    backgroundColor: PANEL.hudKoyu,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 7,
    gap: 3,
  },
  seritBaslik: {
    fontFamily: YAZI.etiket,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: YAZI_RENK.birincil,
  },
  seritSatir: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seritAyrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: 1 },
  dusmus: { opacity: 0.35 },
  seritArti: { fontFamily: YAZI.govde, fontSize: 9.5, color: YAZI_RENK.ikincil, marginLeft: 1 },
  seritSayi: {
    marginLeft: 'auto',
    fontFamily: YAZI.sayi,
    fontSize: 12,
    color: YAZI_RENK.birincil,
  },
  seritSayiDusen: { color: DURUM.eksi },
});
