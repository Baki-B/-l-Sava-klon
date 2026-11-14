// MOD LOGOLARI (Görev 09 / 2026-08-01 arayüz revizyonu).
//
// ┌─ BAKİ'NİN İTİRAZI ──────────────────────────────────────────────────────────────────┐
// │ *"Nasıl kazanılır kısmına gelirsek, 'Nasıl kazanılır' diye bir şey olması bile      │
// │  kötü. Burayı baştan tasarlayalım: ekranın büyük bir kısmını kaplayan 3 adet logo    │
// │  gelsin."*                                                                           │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// Haklıydı: bir başlık atıp altına üç küçük etiket dizmek, oyuncuya "şimdi bir ayar
// yapacaksın" demekti. Oysa mod seçimi oyunun İLK KARARI — ayar değil, tercih.
//
// ---- VEKTÖR, GÖRSEL DOSYASI YOK ----
// `Ikonlar.js`'in kuralının aynısı: her boyutta net, birkaç byte, paket büyümüyor.
// Üçü de AYNI viewBox'ta (64×64) ve aynı çizgi kalınlığında — yan yana durduklarında
// tek elden çıkmış görünsünler.
//
// ---- LOGOLAR NEYİ ANLATIYOR ----
//   Fetih          → burca dikilmiş bayrak: "her karışı al"
//   %50 Hâkimiyet  → tam ortadan bölünmüş kalkan, yarısı dolu: "yarısı yeter"
//   Güç Yarışı     → yükselen üç basamak ve tepesinde yıldız: "en büyük ol, süre dolsun"

import React from 'react';
import Svg, { Path, Rect, Polygon, Line } from 'react-native-svg';
import { YAZI_RENK } from '../tema';

// NOT (Görev 10A / Adım 2): aşağıdaki `color` / `ikincil` ÖNTANIMLI değerleri ölü —
// tek çağrı yeri (`AnaMenu.js`) ikisini de kendisi veriyor. Yine de çıplak renk
// oldukları için jetona çevrildiler; çıplak renk sayısı SIFIR olmalı, ölüsü de dahil.

// FETİH — kaleye dikilmiş bayrak.
export function LogoFetih({ size = 64, color = YAZI_RENK.birincil, ikincil = YAZI_RENK.ikincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Burç — mazgallı duvar */}
      <Path
        d="M10 44 h44 v12 h-44 z M10 44 v-6 h6 v6 M22 44 v-6 h6 v6 M34 44 v-6 h6 v6 M46 44 v-6 h6 v6"
        fill={ikincil}
      />
      {/* Gönder */}
      <Rect x="30" y="8" width="3" height="30" fill={color} />
      {/* Dalgalı bayrak */}
      <Path d="M33 10 L52 15 L46 21 L52 27 L33 24 Z" fill={color} />
    </Svg>
  );
}

// %50 HÂKİMİYET — ortadan bölünmüş kalkan, sol yarısı dolu.
export function LogoYarim({ size = 64, color = YAZI_RENK.birincil, ikincil = YAZI_RENK.ikincil }) {
  const kalkan = 'M32 6 L54 14 v18 c0 12 -10 20 -22 26 C20 52 10 44 10 32 V14 Z';
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Boş kalkan — çerçeve */}
      <Path d={kalkan} fill="none" stroke={ikincil} strokeWidth="3" />
      {/* SOL YARI AYRI BİR YOL OLARAK ÇİZİLİYOR, clipPath ile kırpılmıyor.
          Sebep: react-native-svg'de `Defs`/`clipPath` Android ve iOS'ta farklı
          davranabiliyor ve tek işi bir yarıyı doldurmak olan bir logo için o riski
          almanın anlamı yok. Yol kalkanla aynı kenarları paylaşıyor, sonuç birebir aynı. */}
      <Path d="M32 6 L10 14 V32 c0 12 10 20 22 26 Z" fill={color} />
      {/* Orta çizgi — bölünmüşlük okunsun */}
      <Line x1="32" y1="6" x2="32" y2="58" stroke={ikincil} strokeWidth="2" />
    </Svg>
  );
}

// GÜÇ YARIŞI — yükselen üç basamak, tepesinde yıldız.
export function LogoPuan({ size = 64, color = YAZI_RENK.birincil, ikincil = YAZI_RENK.ikincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Basamaklar — soldan sağa yükseliyor */}
      <Rect x="8" y="40" width="13" height="16" fill={ikincil} />
      <Rect x="25" y="30" width="13" height="26" fill={ikincil} />
      <Rect x="42" y="18" width="13" height="38" fill={color} />
      {/* En yüksek basamağın tepesinde yıldız — birinci olan */}
      <Polygon
        points="48.5,4 50.6,10.2 57.2,10.2 51.9,14.1 53.9,20.3 48.5,16.4 43.1,20.3 45.1,14.1 39.8,10.2 46.4,10.2"
        fill={color}
      />
    </Svg>
  );
}

// Mod anahtarı → logo. Yeni bir mod eklenirse buraya bir satır; ekran hiç değişmiyor.
export const MOD_LOGOSU = {
  fetih: LogoFetih,
  yarim: LogoYarim,
  puan: LogoPuan,
};

// Logonun altındaki tek cümle. Kazanma koşulunun SAYISI ekranda ayrıca yazıyor
// (`modKazanmaEsigi`); burada yalnızca modun NE OLDUĞU var — sayı ile cümle iki ayrı iş.
export const MOD_CUMLESI = {
  fetih: 'Haritadaki her bölgeyi al.',
  yarim: 'Bölgelerin yarısı senin olsun, yeter.',
  puan: 'Süre dolduğunda en çok bölgeyi tutan sen ol.',
};
