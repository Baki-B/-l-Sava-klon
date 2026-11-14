// MENÜ ARKA PLANI — EGE HARİTASI (Görev 10A / Adım 3).
//
// Ana menünün ve mod ekranının arkasındaki harita. Kesinleşen tasarım:
// `docs/GOREV-10A-ANA-MENU-KARARI.md` §3. Önizleme: `onizleme/ana-menu-final.html`.
//
// ---- NE ÇİZİYOR (dıştan içe beş katman) ----
//   1. DENİZ      — ekranın tamamına radyal geçiş: merkezde açık, kenarda koyu
//   2. KIYI HALESİ— ülke hattının 16/11/7/4 kalınlıkta, artan opaklıkta dört kopyası
//   3. KARA       — ülke hattının dolgusu; halenin İÇ yarısını örtüyor, dışta hale kalıyor
//   4. MOZAİK     — 181 parça, her biri kendi ilinin renginde
//   5. SINIRLAR   — parça sınırları + kıyı çizgisi
//
// ---- OYUN HARİTASI DEĞİL, AYNI VERİ ----
// `Harita.js` kullanılmıyor ve kullanılmamalı: o bileşen jest, yakınlaştırma, rozet
// katmanı, sahiplik renkleri ve hedef kipi taşıyor — hiçbiri burada gerekmiyor ve hepsi
// menüde boşuna çalışırdı.
//
// ---- ESKİ HÂLİ (2026-08-01 → 2026-08-03) ----
// Bu dosya önce "yüzen Türkiye" çiziyordu (`Animated` ile ağır ağır salınan dolgusuz
// kontur), sonra kullanımdan kalkıp yerini mum mührüne bıraktı. İkisi de gitti: menü artık
// haritanın ÜSTÜNDE duruyor, harita da menünün arkasında bir süs değil zeminin kendisi.
// Salınım geri gelmedi çünkü ana menüde artık gerçek bir hareket var — fetih döngüsü
// (Adım 5). İki hareket birbiriyle yarışırdı.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, G, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { MENU_RENK, askeriTon, karis } from '../tema';
import parcaVerisi from '../../veri/parcalar.json';
import hatVerisi from '../../veri/turkiye-hat.json';
import menuGeo from '../../veri/menu-geometri.json';

// ---- ⚠ ÇİZİM SADELEŞTİRİLMİŞ GEOMETRİDEN (2026-08-03, Baki: "3-4 saniye bekliyor") ----
// Parça YOLLARI `menu-geometri.json`dan geliyor (850 KB → 84 KB): menü hiç yakınlaşmadığı
// için tam çözünürlük saf israftı — mod ekranı açılırken 6.6 MB yol ayrıştırılıyordu.
// `parcalar.json` yalnızca ÜSTVERİ için duruyor (kod, renkIl); yol alanları burada
// kullanılmıyor. Oyun haritası (Harita.js) tam çözünürlükte KALIR, o yakınlaşıyor.
const META = parcaVerisi.meta;
const PARCALAR = parcaVerisi.parcalar;
const YOLLAR = menuGeo.parcalar;
const HAT = hatVerisi.yol;

// Parça kimlikleri SIRALI ve sabit — çizim sırası her tazelemede aynı olsun.
export const PARCA_IDLER = Object.keys(PARCALAR).sort();

// ---- ÇİZİM SABİTLERİ ----
// Hepsi EKRAN birimi. Harita ölçeklenmiş bir grubun içinde çizildiği için kod bunları
// ölçeğe böler; yoksa harita büyüdükçe çizgiler de kalınlaşır ve ölçüler kayar.
const HALE = [
  { kalinlik: 16, opaklik: 0.1 },
  { kalinlik: 11, opaklik: 0.15 },
  { kalinlik: 7, opaklik: 0.2 },
  { kalinlik: 4, opaklik: 0.25 },
];
const KIYI_CIZGI = { kalinlik: 1.6, opaklik: 0.55 };

// ---- İKİ AYRI SINIR (Baki, 2026-08-03) ----
// Baki ilk hâli görünce itiraz etti: *"sınırlar sadece düşman sınırlarında koyu renk
// olacak."* Yani sınır tek bir çizgi değil, İKİ İŞ:
//
//   SILIK  — bütün parçaların çevresi. 181 parçalık mozaik görünsün diye var; olmazsa
//            harita üç renkli düz bir lekeye döner (mod ekranında ölçülmüştü).
//   KOYU   — yalnızca İKİ YAKASI FARKLI SAHİPTE olan kenarlar. Ordu nerede orduyla
//            karşı karşıya, onu söylüyor.
//
// ⚠ KOYU ÇİZGİ PARÇANIN ÇEVRESİ DEĞİL, PAYLAŞILAN KENAR. İlk uygulamada cephedeki
// parçanın bütün çevresi koyu çiziliyordu — kendi tarafına bakan kenarları da. Baki'nin
// gördüğü kusur buydu. Doğrusu `veri/menu-geometri.json`un `ciftler` tablosundan geliyor.
const SILIK_SINIR = { kalinlik: 0.4, opaklik: 0.16 };
// Kalınlık 1.0 → 0.65 (Baki, 2026-08-03 ikinci cihaz düzeltmesi: "fazla kalın olmuş,
// biraz incelt — belirli olacak miktarda olsun yine"). Opaklık %75'te kaldı: çizgiyi
// belirli tutan o; inceltmeyle birlikte soluklaştırılsaydı cephe hattı kaybolurdu.
const KOYU_SINIR = { kalinlik: 0.65, opaklik: 0.75 };

// Haritanın ekranda kapladığı pay. Karar belgesi §3: harita ekranın %80'i, ortalı.
const HARITA_PAYI = 0.8;
// Dikey emniyet: alışılmadık geniş bir ekranda (en/boy > 2.77) genişlik kuralı haritayı
// ekrandan taşırırdı. Böyle bir ekranda yükseklik kuralı devreye giriyor ve harita
// kırpılmıyor. Normal telefonlarda (2.0–2.3) bu satır hiç çalışmıyor.
const DIKEY_PAYI = 0.92;

// ---- PARÇA DOLGULARI — MODÜL YÜKLENİRKEN BİR KEZ ----
// `askeriTon(renkIl)` sonucu kara rengiyle %62 karıştırılıyor (karar belgesi §3).
// Sonuç: 81 ilin ölçülmüş paleti korunuyor ama hepsi denizin/karanın ailesine çekiliyor;
// harita bir mozaik gibi duruyor, 81 ayrı renk lekesi gibi değil.
//
// Hesap burada çünkü değişmiyor: her menü açılışında 181 renk karıştırmanın anlamı yok.
export const DOGAL_DOLGULAR = {};
for (const pid of PARCA_IDLER) {
  DOGAL_DOLGULAR[pid] = karis(MENU_RENK.kara, askeriTon(PARCALAR[pid].renkIl), 0.62);
}

// ---- SINIR ÇİZGİSİ: 181 YOL DEĞİL, TEK YOL ----
// Her parçanın yolu kapalı (`Z` ile bitiyor), yani hepsi arka arkaya eklenince tek bir
// çizim yolu oluyor ve TEK düğümle çizilebiliyor. Çizim sonucu 181 ayrı kontur çizmekle
// birebir aynı (paylaşılan kenarlar yine iki kez çiziliyor), ağaçtaki düğüm sayısı 181
// yerine 1. Dolgular için aynı numara yapılamıyor çünkü her parçanın rengi farklı.
// Dışa veriliyor: mod ekranının mini haritaları da parça sınırlarını tek yolda çiziyor.
export const TUM_SINIRLAR = PARCA_IDLER.map((pid) => YOLLAR[pid]).join('');

// ---- DÜŞMAN KENARLARI ----
// `menu-geometri.json` her komşu çifti için ARALARINDAKİ ortak çizgiyi tutuyor
// (sadeleşmiş — toplam 43 KB). Sahiplik verilince iki yakası farklı olanlar seçilip
// tek yolda birleşiyor; veri küçüldüğü için sefer artık sekiz durumun hepsini önden
// hesaplayabiliyor (MenuSeferi'ye bak).
const CIFTLER = menuGeo.ciftler;
const CIFT_IDLER = Object.keys(CIFTLER);

export function koyuKenarYolu(sahiplik) {
  let yol = '';
  for (const anahtar of CIFT_IDLER) {
    const ayrac = anahtar.indexOf('|');
    const a = anahtar.slice(0, ayrac),
      b = anahtar.slice(ayrac + 1);
    if (sahiplik[a] !== sahiplik[b]) yol += CIFTLER[anahtar];
  }
  return yol;
}

// Haritanın kendi hâli: her parça kendi ilinin. Yani koyu çizgiler İL sınırları, silik
// çizgiler ilin içindeki parça bölünmeleri. Değişmiyor, bir kez hesaplanıyor.
const DOGAL_SAHIPLIK = {};
for (const pid of PARCA_IDLER) DOGAL_SAHIPLIK[pid] = PARCALAR[pid].kod;
const DOGAL_KOYU_KENARLAR = koyuKenarYolu(DOGAL_SAHIPLIK);

// ---- GEOMETRİ ----
// Haritanın ekrandaki yeri ve ölçeği. Menü haritasını çizen ve onun ÜSTÜNE bir şey koyan
// herkes (fetih döngüsü, başlık konumu) aynı hesabı kullanmak zorunda — iki ayrı yerde
// hesaplanırsa bir gün ayrışırlar ve katmanlar birbirini tutmaz.
export function menuHaritaGeometrisi(genislik, yukseklik) {
  const olcek = Math.min(
    (genislik * HARITA_PAYI) / META.genislik,
    (yukseklik * DIKEY_PAYI) / META.yukseklik
  );
  return {
    olcek,
    sol: (genislik - META.genislik * olcek) / 2,
    ust: (yukseklik - META.yukseklik * olcek) / 2,
    // Karanın ekrandaki en üst noktası. Başlık buraya değmemeli (uygulama belgesi §1);
    // `meta.enUstY` dış hattın en küçük y'si, Adım 1'de ölçülüp veriye yazıldı.
    karaninUstu: (yukseklik - META.yukseklik * olcek) / 2 + hatVerisi.meta.enUstY * olcek,
  };
}

// ---- BİLEŞEN ----
// `dolgular` verilmezse parçalar kendi illerinin renginde (81 il bağımsız) çizilir.
// Fetih döngüsü (Adım 5) buraya o turun sahiplik renklerini geçiyor — böylece taban
// katmanı iki kez çizilmiyor, sadece rengi değişiyor.
//
// `cocuklar` ölçeklenmiş grubun İÇİNE giriyor: üstüne konan her şey (geçiş katmanı,
// parlama, cephe konturu) haritayla aynı koordinat sisteminde çizilsin diye.
function MenuHaritasi({
  genislik,
  yukseklik,
  dolgular = DOGAL_DOLGULAR,
  cocuklar = null,
  // Koyu çizilecek kenarlar (SVG yolu). Verilmezse ilin kendi sınırları — haritanın
  // "81 il bağımsız" hâli. Fetih döngüsü her tur kendi sahipliğinden hesaplayıp geçiyor
  // (`koyuKenarYolu`). Metin olduğu için kimliği değişmez, `React.memo`'yu bozmaz.
  koyuKenarlar = DOGAL_KOYU_KENARLAR,
}) {
  const { olcek, sol, ust } = menuHaritaGeometrisi(genislik, yukseklik);
  // Ölçeklenmiş grubun içindeki kalınlıklar ölçeğe bölünüyor (yukarıdaki nota bak).
  const e = (px) => px / olcek;

  return (
    // Mutlak katman: harita ZEMİN, akışta yer kaplamamalı. Yer kaplasaydı üstündeki
    // menü içeriğini aşağı iterdi. Dokunuşları da geçiriyor — arkada duran bir zemin
    // parmağı yakalamaz.
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={genislik} height={yukseklik}>
        <Defs>
          {/* Merkezde açık, kenarda koyu. Ekran kare olmadığı için geçiş elips oluyor —
            önizlemedeki hâliyle aynı, tarayıcı da böyle çiziyor. */}
          <RadialGradient id="menuDeniz" cx="50%" cy="50%" r="62%">
            <Stop offset="0%" stopColor={MENU_RENK.deniz} />
            <Stop offset="100%" stopColor={MENU_RENK.denizDip} />
          </RadialGradient>
        </Defs>
        <Rect width={genislik} height={yukseklik} fill="url(#menuDeniz)" />

        <G transform={'translate(' + sol + ',' + ust + ') scale(' + olcek + ')'}>
          {/* 2. KIYI HALESİ — kalından inceye, soluktan koyuya. Kara dolgusu bunların
            üstüne bindiği için yalnızca DIŞ yarıları görünüyor; sonuç, kıyıdan denize
            doğru sönen bir hale. Sıra önemli: kalın olan altta kalmalı. */}
          {HALE.map((h) => (
            <Path
              key={h.kalinlik}
              d={HAT}
              fill="none"
              stroke={MENU_RENK.denizKoyu}
              strokeWidth={e(h.kalinlik)}
              opacity={h.opaklik}
            />
          ))}

          {/* 3. KARA — tek dolgu. Parçaların altında duruyor ki aralarındaki kıl payı
            boşluklarda deniz görünmesin. */}
          <Path d={HAT} fill={MENU_RENK.kara} />

          {/* 4. MOZAİK — 181 parça, her biri kendi ilinin renginde. */}
          {PARCA_IDLER.map((pid) => (
            <Path key={pid} d={YOLLAR[pid]} fill={dolgular[pid] || DOGAL_DOLGULAR[pid]} />
          ))}

          {/* 5a. SİLİK SINIRLAR — bütün parçaların çevresi, tek yol. Mozaiği gösteriyor. */}
          <Path
            d={TUM_SINIRLAR}
            fill="none"
            stroke={MENU_RENK.sinir}
            strokeWidth={e(SILIK_SINIR.kalinlik)}
            opacity={SILIK_SINIR.opaklik}
          />

          {/* 5b. KOYU SINIRLAR — yalnızca iki yakası farklı sahipte olan kenarlar
              (Baki 2026-08-03: "sınırlar sadece düşman sınırlarında koyu renk olacak").
              Parçanın çevresi değil, komşuların PAYLAŞTIĞI çizgi — o yüzden bir cephenin
              iç tarafına bakan kenarlar koyu çizilmiyor. */}
          {koyuKenarlar ? (
            <Path
              d={koyuKenarlar}
              fill="none"
              stroke={MENU_RENK.sinir}
              strokeWidth={e(KOYU_SINIR.kalinlik)}
              opacity={KOYU_SINIR.opaklik}
            />
          ) : null}

          {/* 5b. KIYI ÇİZGİSİ — ülkenin dış hattı. Sınır kararına DAHİL DEĞİL: mavi kaldı,
            çünkü o bir sınır değil karanın bittiği yer. */}
          <Path
            d={HAT}
            fill="none"
            stroke={MENU_RENK.kiyi}
            strokeWidth={e(KIYI_CIZGI.kalinlik)}
            opacity={KIYI_CIZGI.opaklik}
          />

          {cocuklar}
        </G>
      </Svg>
    </View>
  );
}

// ⚠ `React.memo` ŞART. Harita 181 yol + dört hale kopyası; menüde her tazelemede yeniden
// kurulursa fetih döngüsü (Adım 5) her turda takılır. Bileşene giden her özelliğin kimliği
// sabit olmalı — `dolgular` bir nesne, çağıran tarafta `useMemo` ile tutulmazsa hafızalama
// hiç çalışmaz (CLAUDE.md §6).
export default React.memo(MenuHaritasi);
