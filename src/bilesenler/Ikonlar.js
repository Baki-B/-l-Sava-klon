// Vektör (SVG) ikonlar — büyük görsel dosyası YOK; her boyutta net, birkaç byte.
// İller / Arazi / Bölge / İl sınırları menüsü için.
import React from 'react';
import Svg, { Path, Line, Rect, Circle, G } from 'react-native-svg';
import { ANKARA_YOL, MARMARA_YOL } from '../ikon-yollari';
import { PIYADE, TOPCU, ZIRHLI, ZIRHLI_DIS } from '../birimSekli';
import { YAZI_RENK } from '../tema';

// NOT (Görev 10A / Adım 2): `color` öntanımlıları ölü — dokuz ikonun her çağrı yeri
// rengi kendisi veriyor. Çıplak renk sayısı sıfır olmalı, ölüsü de dahil.

// İller — Ankara ilinin şekli
export function IkonIller({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={ANKARA_YOL} fill={color} />
    </Svg>
  );
}

// Arazi — dağ silueti (tepe + zirve)
export function IkonArazi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 20 L8.5 10 C9.3 8.8 10.4 8.9 11 10 L13.5 14.5 L16.5 6.5 C17.1 5 18.4 5 19 6.5 L22 20 Z"
        fill={color}
      />
    </Svg>
  );
}

// Bölge — Marmara bölgesinin şekli
export function IkonBolge({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={MARMARA_YOL} fill={color} fillRule="nonzero" />
    </Svg>
  );
}

// Ayarlar — dişli çark (8 diş + orta delik)
export function IkonAyar({ size = 24, color = YAZI_RENK.birincil }) {
  const disler = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = 12 + Math.cos(a) * 8.6,
      y = 12 + Math.sin(a) * 8.6;
    disler.push(
      <Rect
        key={i}
        x={x - 2.1}
        y={y - 2.1}
        width="4.2"
        height="4.2"
        rx="1"
        fill={color}
        transform={'rotate(' + (i * 45).toFixed(0) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ')'}
      />
    );
  }
  // Halka, içi boş çizilir (dolgu + arka plan rengi hilesi yok) — her zeminde doğru görünür.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {disler}
      <Circle cx="12" cy="12" r="5.2" fill="none" stroke={color} strokeWidth="3.7" />
    </Svg>
  );
}

// ARAŞTIRMA — deney şişesi / erlen (Baki isteği, 2026-07-31: "HOI4'teki gibi balon joje").
//
// Neden çizgi değil de DOLU şişe: tur çubuğundaki düğme 14–18 piksel; ince çizgili bir
// şişe o boyutta kayboluyor. Şişenin camı tek parça dolu çiziliyor, İÇİNDEKİ SIVI ve
// kabarcıklar ZEMİN RENGİYLE değil, `sivi` rengiyle ayrılıyor — böylece ikon hangi zemine
// konursa konsun doğru görünür (dişli çarktaki "halka" kuralının aynısı).
//
// `sivi` verilmezse sıvı hiç çizilmez ve ikon tek renkli bir siluete döner; küçük
// boyutlarda ya da tek renk gerektiğinde kullanılır.
export function IkonArastirma({ size = 24, color = YAZI_RENK.birincil, sivi }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Boyun ağzındaki kalın dudak — şişeyi "laboratuvar camı" yapan detay. */}
      <Rect x="8.6" y="2" width="6.8" height="2.1" rx="1.05" fill={color} />
      {/* Gövde: boyundan aşağı açılan koni, altı yuvarlatılmış. */}
      <Path
        d="M9.9 4.1 h4.2 v5.2 L19.6 18.4 C20.5 20.1 19.4 21.9 17.5 21.9 H6.5
           C4.6 21.9 3.5 20.1 4.4 18.4 L9.9 9.3 Z"
        fill={color}
      />
      {sivi && (
        <>
          {/* Sıvı — koninin alt kısmını dolduruyor, üst yüzü düz. */}
          <Path
            d="M7.7 14.1 h8.6 l3.3 4.3 C20.5 20.1 19.4 21.9 17.5 21.9 H6.5
               C4.6 21.9 3.5 20.1 4.4 18.4 Z"
            fill={sivi}
          />
          {/* İki kabarcık — "bir şey pişiyor" hissi. */}
          <Circle cx="10" cy="18" r="1.35" fill={color} opacity={0.75} />
          <Circle cx="14.2" cy="19.4" r="0.95" fill={color} opacity={0.6} />
        </>
      )}
    </Svg>
  );
}

// ---- BİRİM İKONLARI (Görev 07 / Adım 2b — Baki isteği, 2026-07-31) ----
//
// > *"Araştırma ekranında tıklayınca 3 tane logo görmemiz: ilki piyadeyi, ikinci topçuyu,
// > üçüncü de zırhlıyı temsil eden simgeler."*
//
// ÜÇÜ DE DOLU SİLUET, erlen ikonundaki kuralın aynısı: bu simgeler 40–56 piksel çiziliyor
// ve ince çizgi o boyutta kayboluyor. Üçü aynı görsel ağırlıkta olmalı ki ekranda biri
// öne çıkmasın — hiçbiri "daha önemli" değil.
//
// Ayırt edici şekil seçimi, oyuncunun birimi tek bakışta tanıması için:
//   piyade → miğfer (insan)      · topçu → namlulu obüs (menzil) · zırhlı → paletli gövde

// Şekiller `src/birimSekli.js`'te (Skia haritasının kadro şeridi de onları çiziyor).
// PİYADE — cepheden çelik miğfer. Yuvarlak kubbe + geniş siperlik (siperlik miğferi
// şapkadan ayıran çıkıntı).
export function IkonPiyade({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {PIYADE.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

// TOPÇU — yukarı eğik namlulu obüs: namlu, ağız freni, kundak, iki tekerlek.
export function IkonTopcu({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {TOPCU.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

// ZIRHLI — paletli gövde: taret + gövde tek parça (silueti okunaklı tutan şey bu
// birleşiklik), palet bandı, yarı saydam palet dişleri.
export function IkonZirhli({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ZIRHLI.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
      {ZIRHLI_DIS.map((d, i) => (
        <Path key={'d' + i} d={d} fill={color} opacity={0.45} />
      ))}
    </Svg>
  );
}

// Birim türünden ikonuna — ekranlar tür anahtarıyla çağırabilsin diye tek yerde.
export const BIRIM_IKONU = {
  piyade: IkonPiyade,
  topcu: IkonTopcu,
  zirhli: IkonZirhli,
};

// İl sınırları — kesikli sınır çizgisi
export function IkonSinir({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line
        x1="3.5"
        y1="18"
        x2="20.5"
        y2="6"
        stroke={color}
        strokeWidth="2.4"
        strokeDasharray="3.2,2.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---- DİPLOMASİ — EL SIKIŞMA (Baki, 2026-08-03: "diplomasi için bir el sıkışma
// simgesi olsun, o kısımdaki 'DİPL' yazısı hoşuma gitmedi") ----
//
// KONTUR, DOLGUSUZ, TEK KALINLIK — Görev 10A'nın ikon dili. İki kol karşıdan gelip
// ortada kenetleniyor: iki bilek (yatay çizgiler) + kavuşan iki el (orta çokgen).
//
// Neden silüet değil: tur çubuğundaki düğme 14–18 piksel ve el sıkışma o boyutta dolu
// çizilirse tanınmaz bir lekeye dönüyor. Kontur, şeklin BOŞLUĞUNU okutuyor — parmakların
// kenetlendiği yer görünür kalıyor. `strokeLinejoin: round` köşeleri yumuşatıyor;
// keskin köşeler küçük boyutta diken gibi çıkıyordu.
export function IkonDiplomasi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {/* Soldan gelen kol ve sağdan gelen kol — aynı yükseklikte, simetrik. */}
        <Path d="M2 10.5 L6.2 10.5 L9.6 13.2" />
        <Path d="M22 10.5 L17.8 10.5 L14.4 13.2" />
        {/* Kenetlenen eller: ortada kavuşup aşağı doğru kapanan dörtgen. */}
        <Path d="M9.6 13.2 L11.2 16.4 L14.4 16.4 L14.4 13.2 Z" />
        {/* Başparmaklar — kavuşmanın üstünde kalan kısa çizgi. */}
        <Path d="M9.9 11.6 L12.6 11.6" />
      </G>
    </Svg>
  );
}

// ---- ÇÖP KUTUSU · OYNAT · İTTİFAK (Görev 12 · Baki'nin istekleri) ----
//
// Üçü de KONTUR, dolgusuz, tek kalınlık — Görev 10A'nın "tek ikon dili" borcunun ilk
// üç ödemesi. Eski ikonların çoğu hâlâ dolu siluet; yenileri o dile eklenmiyor.

// Harekât Arşivi'nde kaydı siler. Kırmızı çizilecek (çağıran renk veriyor) — geri
// alınamaz iş, rengi de onu söylüyor.
export function IkonCop({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {/* Kapak ve sap */}
        <Path d="M4 6.6 L20 6.6" />
        <Path d="M9.6 6.6 L9.6 4.6 L14.4 4.6 L14.4 6.6" />
        {/* Gövde — aşağı doğru hafif daralıyor, kova gibi dursun */}
        <Path d="M6.2 6.6 L7.2 19.6 L16.8 19.6 L17.8 6.6" />
        {/* İki dikey çizgi: küçük boyutta gövdeyi boş bir kutudan ayıran tek şey */}
        <Path d="M10.4 10 L10.4 16.4" />
        <Path d="M13.6 10 L13.6 16.4" />
      </G>
    </Svg>
  );
}

// Kayıtlı maçı açar. Yeşil çizilecek: "devam" hep olumlu renk taşıyor.
// Tek ok başı — çift ok (») "ileri sar" demek olurdu.
export function IkonOynat({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M9 5.5 L16.5 12 L9 18.5" />
      </G>
    </Svg>
  );
}

// İTTİFAK HARİTASI düğmesi. İki halka birbirine geçmiş — "bağ" fikrinin en sade hâli.
// El sıkışma (IkonDiplomasi) burada KULLANILMADI: o bir EYLEM ikonu (diplomasi ekranını
// açar), bu ise bir GÖRÜNÜM ikonu (haritayı boyar). Aynı simgeyi iki işe koşmak,
// oyuncuya "aynı şey" demek olurdu.
export function IkonIttifak({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth="1.9">
        <Circle cx="9" cy="12" r="5.2" />
        <Circle cx="15" cy="12" r="5.2" />
      </G>
    </Svg>
  );
}

// ---- DİPLOMASİ KARTLARI (Görev 20 · Baki: "diplomasi ekranı çok fazla karmaşık") ----
//
// Diplomasi ekranı cümle ve tablo yerine bu simgelerle konuşuyor (CLAUDE.md §5/10). Hepsi
// KONTUR, dolgusuz, tek kalınlık — el sıkışma ve ittifak halkasıyla aynı dil. Renk
// çağırandan: savaş kırmızı, dostluk yeşil, durgun gri.

function Kontur({ size, color, children, kalinlik = 1.9 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G
        fill="none"
        stroke={color}
        strokeWidth={kalinlik}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </G>
    </Svg>
  );
}

// SAVAŞ — çapraz iki kılıç (namlu, balçak, kabza).
export function IkonSavas({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M4.5 4.5 L15 15 M13 17 L17 13 M15.6 15.6 L19.4 19.4" />
      <Path d="M19.5 4.5 L9 15 M7 13 L11 17 M8.4 15.6 L4.6 19.4" />
    </Kontur>
  );
}

// KİLİT — "şu an masaya oturulmaz" (anlaşma kapısı kapalı).
export function IkonKilit({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <Path d="M8 10.5 V7.6 C8 5.4 9.8 3.8 12 3.8 C14.2 3.8 16 5.4 16 7.6 V10.5" />
      <Path d="M12 14.2 L12 16.4" />
    </Kontur>
  );
}

// YÜZ — karşı tarafın teklifine bakışı. `memnun`: kabule açık · değilse: sıcak bakmıyor.
export function IkonYuz({ size = 24, color = YAZI_RENK.birincil, memnun }) {
  return (
    <Kontur size={size} color={color}>
      <Circle cx="12" cy="12" r="8.6" />
      <Path d="M9.2 9.8 L9.2 10.4 M14.8 9.8 L14.8 10.4" strokeWidth={2.4} />
      {memnun ? <Path d="M8.4 14 C9.6 16.2 14.4 16.2 15.6 14" /> : <Path d="M8.8 15 L15.2 15" />}
    </Kontur>
  );
}

// HEDEF — ortak düşman (ikiniz de onunla savaşta).
export function IkonHedef({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Circle cx="12" cy="12" r="8.2" />
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 11.9 L12 12.1" strokeWidth={2.8} />
    </Kontur>
  );
}

// ZARF — masada seni bekleyen teklif.
export function IkonZarf({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Rect x="3.5" y="6" width="17" height="12" rx="2" />
      <Path d="M4.2 7 L12 12.8 L19.8 7" />
    </Kontur>
  );
}

// SİKKE — tur geliri (güç sıralamasında ekonomi sütunu).
export function IkonSikke({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Circle cx="12" cy="12" r="8.4" />
      <Circle cx="12" cy="12" r="4.6" />
    </Kontur>
  );
}

// ONAY / RET — gelen teklifin iki cevabı ve giden teklifin sonucu.
export function IkonTik({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color} kalinlik={2.3}>
      <Path d="M5 12.6 L10 17.2 L19 7.4" />
    </Kontur>
  );
}
export function IkonCarpi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color} kalinlik={2.3}>
      <Path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" />
    </Kontur>
  );
}

// ---- ARAŞTIRMA AĞACININ DALLARI (Görev 20 · Baki: "Polytopia'daki gibi ağaç") ----
//
// Ağaçta her düğüm bir simge: dalın ne yaptığı cümleyle değil şekille okunuyor. Üç ortak
// dal (zırh, ağır vuruş, hafif vuruş) her birimde aynı simge; dördüncü dal birime özgü.

// ZIRH — kalkan.
export function IkonDalZirh({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M12 3.2 L19.4 5.8 V11.6 C19.4 15.9 16.3 19.1 12 20.8 C7.7 19.1 4.6 15.9 4.6 11.6 V5.8 Z" />
    </Kontur>
  );
}

// AĞIR VURUŞ — iri top mermisi (zırh deler).
export function IkonDalAgir({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M12 3 C14.8 5.6 15.6 8.6 15.6 11.6 V20.2 H8.4 V11.6 C8.4 8.6 9.2 5.6 12 3 Z" />
      <Path d="M8.4 16.4 H15.6" />
    </Kontur>
  );
}

// HAFİF VURUŞ — üç küçük mermi (yayılan ateş, yaya birliğe karşı).
export function IkonDalHafif({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color} kalinlik={1.7}>
      <Path d="M5.6 8 C6.8 9 7.2 10.4 7.2 11.8 V18.6 H4 V11.8 C4 10.4 4.4 9 5.6 8 Z" />
      <Path d="M12 5 C13.2 6 13.6 7.4 13.6 8.8 V18.6 H10.4 V8.8 C10.4 7.4 10.8 6 12 5 Z" />
      <Path d="M18.4 8 C19.6 9 20 10.4 20 11.8 V18.6 H16.8 V11.8 C16.8 10.4 17.2 9 18.4 8 Z" />
    </Kontur>
  );
}

// SEFERBERLİK (piyade) — yuvarlak içinde artı: yaralı ayağa kalkar.
export function IkonDalSeferberlik({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Circle cx="12" cy="12" r="8.4" />
      <Path d="M12 7.8 V16.2 M7.8 12 H16.2" />
    </Kontur>
  );
}

// BARAJ ATEŞİ (topçu) — patlama.
export function IkonDalBaraj({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M12 3 L13.7 8.8 L19.6 8.4 L14.8 12.1 L17.4 18.2 L12 14.6 L6.6 18.2 L9.2 12.1 L4.4 8.4 L10.3 8.8 Z" />
    </Kontur>
  );
}

// PALETLİ ÜSTÜNLÜK (zırhlı) — palet bandı ve tekerlekler.
export function IkonDalPalet({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Rect x="3" y="8.2" width="18" height="8.2" rx="4.1" />
      <Circle cx="7.4" cy="12.3" r="1.4" />
      <Circle cx="12" cy="12.3" r="1.4" />
      <Circle cx="16.6" cy="12.3" r="1.4" />
    </Kontur>
  );
}

// YARMA (zırhlı) — hattı delip geçen ok.
export function IkonDalYarma({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M9.6 4.4 V9.2 M9.6 14.8 V19.6" />
      <Path d="M3.6 12 H18.8 M14.6 7.6 L19.2 12 L14.6 16.4" />
    </Kontur>
  );
}

// ---- DOĞRUDAN HAMLE (Görev 20 / Adım 5) ----

// TAHMİN — hedefe bu kuvvetle gidersen: ustun (iki yukarı ok) · denk (terazi çizgisi: iki
// yatay çizgi) · zayif (aşağı ok). Renk de ayırıyor ama yalnız renk değil (renk körü).
export function IkonTahmin({ size = 24, color = YAZI_RENK.birincil, kademe }) {
  return (
    <Kontur size={size} color={color} kalinlik={2.3}>
      {kademe === 'ustun' ? (
        <Path d="M6 12.4 L12 6.6 L18 12.4 M6 18.2 L12 12.4 L18 18.2" />
      ) : kademe === 'zayif' ? (
        <Path d="M6 8.6 L12 14.4 L18 8.6 M12 14.4 V4.4" />
      ) : (
        <Path d="M5.5 9.4 H18.5 M5.5 14.6 H18.5" />
      )}
    </Kontur>
  );
}

// BİLGİ — bölgenin ayrıntısı (panel). Daire içinde "i".
export function IkonBilgi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Circle cx="12" cy="12" r="8.6" />
      <Path d="M12 11 V16.4" />
      <Path d="M12 7.6 L12 7.8" strokeWidth={2.8} />
    </Kontur>
  );
}

// ---- KOMUTAN (Görev 20 · Baki: "komutan ekleme bölümü şu anki hâliyle kötü" → "olsun") ----
//
// Komutan ekranı cümle yerine simgeyle konuşuyor: komutanın kendisi (rütbe işareti), dört
// yetenek ve kademe yıldızı. Harita rozetindeki pirinç kontur değişmedi; bu simge onun
// ekrandaki adı.

// KOMUTAN — rütbe işareti: yıldız ve altında iki çavuş şeridi.
export function IkonKomutan({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M12 2.8 L13.4 6.3 L17 6.5 L14.2 8.8 L15.1 12.3 L12 10.4 L8.9 12.3 L9.8 8.8 L7 6.5 L10.6 6.3 Z" />
      <Path d="M5.5 15.2 L12 12.8 L18.5 15.2 M5.5 19.6 L12 17.2 L18.5 19.6" />
    </Kontur>
  );
}

// KADEME YILDIZI — dolu: seçili kademeye kadar; boş: açık ama seçili değil.
export function IkonYildiz({ size = 24, color = YAZI_RENK.birincil, dolu }) {
  return (
    <Kontur size={size} color={color} kalinlik={1.6}>
      <Path
        d="M12 3.2 L14.6 9 L20.8 9.5 L16.1 13.6 L17.6 19.8 L12 16.4 L6.4 19.8 L7.9 13.6 L3.2 9.5 L9.4 9 Z"
        fill={dolu ? color : 'none'}
      />
    </Kontur>
  );
}

// ÇELİK YÜREK — kalp: ordusu geç dağılır (kademe 3'te hiç çekilmez).
export function IkonCelikYurek({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M12 19.6 C7 15.9 3.8 12.9 3.8 9.2 C3.8 6.6 5.8 4.6 8.3 4.6 C9.9 4.6 11.2 5.5 12 6.8 C12.8 5.5 14.1 4.6 15.7 4.6 C18.2 4.6 20.2 6.6 20.2 9.2 C20.2 12.9 17 15.9 12 19.6 Z" />
      <Path d="M8.6 10.4 L12 13 L15.4 10.4" />
    </Kontur>
  );
}

// SİLAH USTASI — çekiç: seçilen birlik daha iyi eğitilmiş gibi savaşır.
export function IkonSilahUstasi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M5 7.4 L11.6 4.2 L15.4 8 L12.2 11.2 L8.8 7.8 Z" />
      <Path d="M12.2 11.2 L19.6 18.6 C20 19 20 19.8 19.6 20.2 C19.2 20.6 18.4 20.6 18 20.2 L10.6 12.8" />
    </Kontur>
  );
}

// DAĞ KOMUTANI — iki tepe: savunanın arazi üstünlüğünü kırar.
export function IkonDagKomutani({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M2.8 19.4 L9.2 8 L13 14.6 L15.6 10.6 L21.2 19.4 Z" />
      <Path d="M7.6 10.9 L9.2 12.2 L10.6 10.6" />
    </Kontur>
  );
}

// TOPLANMA USTASI — sancak: çevresinde toplanma bütçesi artar.
export function IkonToplanmaUstasi({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color}>
      <Path d="M6.4 20.6 V3.6" />
      <Path d="M6.4 4.4 H18.4 L15.6 8.2 L18.4 12 H6.4" />
    </Kontur>
  );
}

// Yetenek anahtarından simgeye (komutan ekranı ve panel aynı tablodan okusun).
export const YETENEK_IKONU = {
  celikYurek: IkonCelikYurek,
  silahUstasi: IkonSilahUstasi,
  dagKomutani: IkonDagKomutani,
  toplanmaUstasi: IkonToplanmaUstasi,
};

// Dal anahtarından simgeye — araştırma ağacı tek yerden okusun.
export const DAL_IKONU = {
  zirh: IkonDalZirh,
  agir: IkonDalAgir,
  hafif: IkonDalHafif,
  seferberlik: IkonDalSeferberlik,
  baraj: IkonDalBaraj,
  palet: IkonDalPalet,
  yarma: IkonDalYarma,
};

// TURU BİTİR (Görev 21 · U2) — "sonrakine geç": iki ileri ok + durak çizgisi.
export function IkonTurBitir({ size = 24, color = YAZI_RENK.birincil }) {
  return (
    <Kontur size={size} color={color} kalinlik={2.5}>
      <Path d="M4.5 6 L10.5 12 L4.5 18 M11 6 L17 12 L11 18" />
      <Path d="M20 6 V18" />
    </Kontur>
  );
}
