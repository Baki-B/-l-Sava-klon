// HAREKÂT MÜHÜRLERİ — ROZET ÇİZİMİ (Görev 12 / Adım 11).
//
// ┌─ TASARIM KARARI ────────────────────────────────────────────────────────────────────┐
// │ Rozet dili MÜHÜR: yuvarlak kontur çerçeve + içinde tek sembol. Oyunun kâğıt atlas     │
// │ temasına oturuyor ve Görev 10A'da düşen mum mührü fikrini geri getiriyor.             │
// └───────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- KADEME İKİ KEZ KODLANIYOR: BİÇİM + METAL (Baki, 2026-08-06) ----
//
// İlk sürümde kademe YALNIZCA biçimle ayrılıyordu (tek halka / çift halka / defne) ve
// gerekçesi renk körlüğüydü. Baki metal istedi — ikisi ÇELİŞMİYOR, üst üste biniyor:
//
//   bronz  → tek halka        + bronz metali
//   gümüş  → çift halka       + gümüş metali
//   altın  → çift halka+defne + altın metali
//
// Renk körü bir oyuncu kademeyi HÂLÂ biçimden okuyor; ötekiler madeni görüyor. Bir bilgi
// iki kanaldan verildiğinde hiçbir kanal zorunlu olmuyor.
//
// ⚠ METAL YALNIZCA MÜHÜRDE. Baki'nin şartı: *"panellere metalik doku yansımasın."* Panel
// zeminleri, çizgileri ve yazıları kâğıt paletinde kalıyor; metal bir YÜZEY DİLİ değil,
// bir ÖDÜL işareti. Madenin görünmesi için gereken koyu gövde + parlak ışık, resim değil
// SVG geçişiyle çiziliyor: ölçeklenince bozulmuyor, dosya boyutu artmıyor.
//
// ---- KAZANILMAMIŞ MÜHÜR SİLİK ÇİZİLİR, GİZLENMEZ ----
// Kilitli mühür de görünüyor (soluk renk, düşük opaklık). Gizlenseydi oyuncu neyi
// hedefleyeceğini bilemezdi; başarım listesinin yarısı "hedef" olarak iş görüyor.
//
// ---- 34 MÜHÜR, 30 GLİF ----
// Bazı glifler paylaşılıyor. 34 ayrı çizim 34 ayrı bakım yüküydü; paylaşılan glif
// kategoriyle birlikte okunduğunda karışmıyor (mühürün adı zaten altında yazıyor).

import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { KAGIT, METAL } from '../tema';

// Glif çizimleri — hepsi 24×24 kutuda, kontur, tek kalınlık.
// `d` yolları elle yazıldı; hiçbiri dolgulu değil.
const GLIFLER = {
  ok: 'M6 12 H17 M13 8.5 L17 12 L13 15.5',
  kilic: 'M7 17 L17 7 M15.5 5.5 L18.5 8.5 M6 15 L9 18',
  cizgi: 'M4 15 L9 10 L14 14 L20 8',
  sancak: 'M8 19 V5 M8 6 H18 L15.5 9 L18 12 H8',
  halka: 'M10 12 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M14 12 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0',
  altigen: 'M12 5 L18 8.5 V15.5 L12 19 L6 15.5 V8.5 Z',
  ucAltigen:
    'M8 6 L11 7.7 V11.3 L8 13 L5 11.3 V7.7 Z M16 6 L19 7.7 V11.3 L16 13 L13 11.3 V7.7 Z M12 13 L15 14.7 V18.3 L12 20 L9 18.3 V14.7 Z',
  yarimDaire: 'M12 5 a7 7 0 0 1 0 14 Z M12 5 a7 7 0 0 0 0 14',
  daire: 'M12 12 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0',
  bogaz: 'M6 5 C9 9 9 15 6 19 M18 5 C15 9 15 15 18 19 M9 12 H15',
  uzunOk: 'M4 12 H20 M16.5 8.5 L20 12 L16.5 15.5 M7.5 8.5 L4 12 L7.5 15.5',
  kirik: 'M6 8 L11 12 L8 14 L14 19 M17 6 L13 10',
  hilal: 'M15.5 6 a7 7 0 1 0 0 12 a5.5 5.5 0 1 1 0 -12',
  kalkan: 'M12 5 L18 7.5 V13 C18 16.5 15.3 18.6 12 19.5 C8.7 18.6 6 16.5 6 13 V7.5 Z',
  dag: 'M4 18 L10 8 L14 14 L16.5 10.5 L20 18 Z',
  catlak: 'M12 12 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M9 6 L13 12 L10 14 L14 18',
  ciftKalkan:
    'M9 5.5 L14 7.5 V12 C14 14.8 11.8 16.6 9 17.4 C6.2 16.6 4 14.8 4 12 V7.5 Z M17 8 L21 9.6 V13.2 C21 15.4 19.2 16.9 17 17.5',
  firtina: 'M13 4 L7 13 H12 L10 20 L17 10 H12 Z',
  ucHalka:
    'M8 10 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0 M16 10 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0 M12 16 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0',
  kirikKilic: 'M7 17 L11 13 M13.5 10.5 L17 7 M15.5 5.5 L18.5 8.5 M11 13 L13.5 10.5',
  kesikIp: 'M4 12 C7 8 9 16 12 12 M20 12 C17 16 15 8 12 12 M12 8 V16',
  dugum: 'M8 8 C14 8 10 16 16 16 M16 8 C10 8 14 16 8 16',
  iz: 'M9 8 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M15 9 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 M12 16 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0',
  disli:
    'M12 12 m-3.2 0 a3.2 3.2 0 1 0 6.4 0 a3.2 3.2 0 1 0 -6.4 0 M12 4.5 V7 M12 17 V19.5 M4.5 12 H7 M17 12 H19.5 M6.8 6.8 L8.6 8.6 M15.4 15.4 L17.2 17.2 M17.2 6.8 L15.4 8.6 M8.6 15.4 L6.8 17.2',
  erlen: 'M10 4 H14 M10.5 4 V9 L6.5 18 A1.6 1.6 0 0 0 8 20 H16 A1.6 1.6 0 0 0 17.5 18 L13.5 9 V4',
  ucCizgi: 'M5 8 H19 M5 12 H19 M5 16 H19',
  artiOk: 'M12 6 V18 M6 12 H18 M9 9 L12 6 L15 9',
  kumSaati:
    'M7 4 H17 M7 20 H17 M7 4 C7 9 12 11 12 12 C12 13 17 15 17 20 M17 4 C17 9 12 11 12 12 C12 13 7 15 7 20',
  zeytin:
    'M12 20 V9 M12 11 C8 11 6 8 6 5 C9 5 12 7 12 11 M12 13 C16 13 18 10 18 7 C15 7 12 9 12 13',
  merdiven: 'M5 19 H9 V15 H13 V11 H17 V7 H20',
  yildiz: 'M12 4 L14.2 9.6 L20 10.2 L15.6 14 L17 19.8 L12 16.7 L7 19.8 L8.4 14 L4 10.2 L9.8 9.6 Z',
  kivilcim:
    'M12 4 V9 M12 15 V20 M4 12 H9 M15 12 H20 M7 7 L10 10 M14 14 L17 17 M17 7 L14 10 M10 14 L7 17',
  guvercin: 'M5 13 C8 9 13 8 18 6 C17 12 14 16 9 17 L7 20 M9 17 L5 13',
};

// Kademe çerçevesi — halka sayısı ve defne.
function Cerceve({ kademe, renk }) {
  return (
    <G fill="none" stroke={renk} strokeWidth="1.6" strokeLinecap="round">
      <Circle cx="24" cy="24" r="20" />
      {kademe !== 'bronz' ? <Circle cx="24" cy="24" r="17" strokeWidth="0.9" /> : null}
      {kademe === 'altin' ? (
        <>
          {/* Defne: iki yandan yukarı kıvrılan iki yay. Altın kademenin tek işareti. */}
          <Path d="M8 32 C6 26 8 20 12 17" strokeWidth="1.1" />
          <Path d="M40 32 C42 26 40 20 36 17" strokeWidth="1.1" />
        </>
      ) : null}
    </G>
  );
}

// Tek mühür. `kazanildi` false ise silik çizilir.
//
// ⚠ RENK KÂĞITTAN GELİYOR (Görev 12, kâğıt yüzey). Mühürler beyaz yazı rengiyle
// çiziliyordu; başarım ekranı parşömene taşınınca o renk kâğıtta neredeyse görünmez
// oldu. Artık koyu MÜREKKEP: mühür gerçekten kâğıda basılmış gibi duruyor — kazanılmamış
// olan da solmuş mürekkep, silinmiş değil.
export default function Muhur({ glif, kademe, kazanildi, boyut = 48 }) {
  const maden = METAL[kademe] || METAL.bronz;
  // ⚠ GEÇİŞ KİMLİĞİ BENZERSİZ OLMALI. Ekranda 34 mühür var; hepsi aynı `id`yi kullansa
  // SVG ilk tanımı geçerli sayar ve bütün mühürler tek madene döner.
  const gecisId = 'maden-' + kademe + '-' + glif;
  // Kazanılmamış mühür MADEN DEĞİL: solmuş mürekkep. Ödül henüz alınmadıysa madeni
  // göstermek, kazanılmışla kazanılmamışı aynı ağırlığa getirirdi.
  const renk = kazanildi ? 'url(#' + gecisId + ')' : KAGIT.murekkepSoluk;
  const yol = GLIFLER[glif] || GLIFLER.daire;
  return (
    <Svg width={boyut} height={boyut} viewBox="0 0 48 48" opacity={kazanildi ? 1 : 0.55}>
      {kazanildi ? (
        <Defs>
          {/* Sol üstten sağ alta ışık: koyu gövde → parlak vurgu → orta ton. Madenin
              yuvarlaklığını veren şey bu üç durak; iki durak olsaydı düz bir renk geçişi
              gibi durur, maden gibi durmazdı. */}
          <LinearGradient id={gecisId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={maden.govde} />
            <Stop offset="0.45" stopColor={maden.parlak} />
            <Stop offset="1" stopColor={maden.orta} />
          </LinearGradient>
        </Defs>
      ) : null}
      <Cerceve kademe={kademe} renk={renk} />
      {/* Glif 24×24 kutuda çizildi; mührün ortasına ölçeklenip taşınıyor. */}
      <G
        transform="translate(24 24) scale(0.72) translate(-12 -12)"
        fill="none"
        stroke={renk}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={yol} />
      </G>
    </Svg>
  );
}
