// MUM MÜHRÜ — menü ekranlarının ortasındaki arka damga (Görev 10A, 2026-08-02).
//
// ┌─ BAKİ'NİN İSTEĞİ ───────────────────────────────────────────────────────────────────┐
// │ *"Türkiye haritasının mini halini bir damga bir tuğra haline getirelim ekranın      │
// │  ortasında o olsun… onun içine bir türkiye haritası konmuş ve YAZILARIN OLMADIĞI    │
// │  KÜÇÜK bir arka damga bekliyorum ekranın ortasına doğru."*                           │
// │  (Örnek olarak klasik kırmızı mum mührü fotoğrafı gönderdi.)                         │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ÖNCEKİ DENEMEDEN FARKI ----
// İlk tuğrada halka + Türkiye + "İL SAVAŞI" + "81 İL · TEK HARİTA" vardı ve Baki'nin
// tespiti doğruydu: **çok yer kaplıyordu.** Yazılar mührü bir afişe çeviriyordu.
// Şimdi yazı YOK — mühür yalnızca bir işaret. Oyunun adı zaten menüde büyük yazıyor;
// mührün onu tekrar etmesi Adım 4'te temizlediğimiz "aynı şeyi iki kez söyleme"nin
// aynısı olurdu.
//
// ---- MUM MÜHRÜ NASIL ÇİZİLİYOR ----
// Fotoğraftaki mühür üç katman: (1) dışta erimiş mumun tırtıklı, düzensiz kenarı,
// (2) içte kalıbın bastığı iki eşmerkezli halka, (3) ortada kabartma.
// Tırtıklı kenar matematiksel: yarıçap açıya göre dalgalanıyor
// `r(θ) = R · (1 + a·cos(nθ))`, sonra noktalar Catmull-Rom eğrisiyle yumuşatılıyor —
// köşeli bir çokgen değil, akmış mum gibi yuvarlak bir kenar çıkıyor.
//
// ---- HAREKET YOK ----
// Önceki harita yüzüyordu (Görev 09 isteği). Damga yüzmez: mühür sayfaya BASILMIŞTIR.
// Hareket istenirse tek satır (`Animated`) ile geri gelir.
//
// ---- ARKA PLANDA KALMALI ----
// Opaklık düşük ve `pointerEvents="none"`. Bu bir süs değil bir FİLİGRAN: fark edilmeli
// ama okunmaya çalışılmamalı. Menü yazılarıyla yarışırsa Baki'nin ilk şikâyeti
// ("harita hiçbir iş yapmıyor, yazının altında gürültü") geri gelir.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { MUHUR_RENK, MUHUR_OYUK } from '../tema';
import haritaData from '../../veri/harita.json';

const META = haritaData.meta;
const YOLLAR = Object.keys(haritaData.iller)
  .sort()
  .map((k) => haritaData.iller[k].yol);

// Çizim 100×100'lük bir kutuda; ölçek dışarıdan veriliyor.
const KUTU = 100;
const MERKEZ = KUTU / 2;

// ---- TIRTIKLI MUM KENARI ----
// `LOB` = kaç çıkıntı, `GENLIK` = çıkıntının derinliği. Fotoğraftaki mühürde 8 lob var.
// `SAPMA` elle basılmış hissi veriyor: her lob birbirinin tıpatıp aynısı olsaydı çizim
// makine üretimi bir dişli gibi dururdu.
const LOB = 8;
const GENLIK = 0.085;
const SAPMA = 0.022;
const DIS_YARICAP = 46;

function mumKenari() {
  const n = LOB * 8; // her lob 8 örnekle taranıyor — eğri pürüzsüz çıksın
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // İkinci sinüs bileşeni düzensizliği veriyor (asal olmayan bir kat sayı seçildi ki
    // desen kendini tekrar etmesin).
    const r = DIS_YARICAP * (1 + GENLIK * Math.cos(LOB * a) + SAPMA * Math.sin(3 * a + 0.9));
    p.push([MERKEZ + r * Math.cos(a), MERKEZ + r * Math.sin(a)]);
  }
  // Catmull-Rom → kübik Bézier (kapalı halka). Noktaları köşesiz birleştirir.
  let d = 'M' + p[0][0].toFixed(2) + ',' + p[0][1].toFixed(2);
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d +=
      'C' +
      c1x.toFixed(2) +
      ',' +
      c1y.toFixed(2) +
      ' ' +
      c2x.toFixed(2) +
      ',' +
      c2y.toFixed(2) +
      ' ' +
      p2[0].toFixed(2) +
      ',' +
      p2[1].toFixed(2);
  }
  return d + 'Z';
}

// Modül düzeyinde BİR KEZ hesaplanıyor: şekil sabit, her çizimde yeniden üretmenin anlamı yok.
const MUM_YOLU = mumKenari();

// Türkiye, kalıbın bastığı iç alana sığdırılıyor.
const IC_ALAN = 62; // iç halkanın çapı
const OLCEK = IC_ALAN / META.genislik;
const TR_G = META.genislik * OLCEK;
const TR_H = META.yukseklik * OLCEK;

export default function Muhur({ boyut, opaklik = 0.13 }) {
  return (
    <View style={[StyleSheet.absoluteFill, s.tabaka]} pointerEvents="none">
      <Svg width={boyut} height={boyut} viewBox={'0 0 ' + KUTU + ' ' + KUTU} opacity={opaklik}>
        {/* 1. Erimiş mumun gövdesi */}
        <Path d={MUM_YOLU} fill={MUHUR_RENK} />
        {/* 2. Kalıbın bastığı iki halka. İLK DENEMEDE gövdeyle AYNI renkteydiler ve
               mühür düz bir leke çıktı — hiçbir şey görünmüyordu. Artık gövdenin
               üstüne binen koyu bir gölge (): kalıp mumu bastırmış. */}
        <Circle cx={MERKEZ} cy={MERKEZ} r={36} fill="none" stroke={MUHUR_OYUK} strokeWidth={1.6} />
        <Circle cx={MERKEZ} cy={MERKEZ} r={33} fill="none" stroke={MUHUR_OYUK} strokeWidth={0.9} />
        {/* 3. Türkiye — mumun içine basılmış. Halkalarla aynı gölge rengi, çünkü ikisi
               de aynı kalıbın işi. */}
        <G
          transform={
            'translate(' +
            (MERKEZ - TR_G / 2) +
            ',' +
            (MERKEZ - TR_H / 2) +
            ') scale(' +
            OLCEK +
            ')'
          }
        >
          {YOLLAR.map((d, i) => (
            <Path key={i} d={d} fill={MUHUR_OYUK} />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { alignItems: 'center', justifyContent: 'center' },
});
