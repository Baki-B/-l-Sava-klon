// İL SEÇİM EKRANI (2026-08-01 arayüz revizyonu, dördüncü tur).
//
// ┌─ BAKİ'NİN İTİRAZI ──────────────────────────────────────────────────────────────────┐
// │ *"Yakınlaştırma kısmı çok kötü olmuş, normal oyundaki gibi yapamıyor muyuz?"*        │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// Haklıydı. Bir önceki sürüm +/− DÜĞMELERİYLE kademeli yakınlaştırıyordu ve bunu bilerek
// seçmiştim: çimdik jestinin kendi yazdığım dokunma denetleyicisiyle çakışmasından
// çekiniyordum. Yanlış karar — oyunun haritası zaten çimdikle çalışıyor ve oyuncu iki
// ekranda iki farklı harita davranışı bulmamalı.
//
// ---- ARTIK OYUNUN KENDİ JEST SİSTEMİ KULLANILIYOR ----
//
// `Harita.js` ile AYNI parçalar: `Gesture.Simultaneous(pan, pinch, tap)`, aynı reanimated
// paylaşılan değerleri, aynı eşikler (`DENGE.JEST`) ve **aynı dönüşüm dosyası**
// (`haritaDonusum.js`). Kopyalanan bir hesap yok: ekran pikselini harita birimine çeviren
// satır tek yerde ve iki harita da oradan besleniyor.
//
// Buraya GELMEYEN tek şey uzun basma (geliştirici aracı) — bu ekranda sahiplenilecek bir
// parça yok.
//
// ---- SEÇİM: POLİGON İÇİ TESTİ (2026-08-01, altıncı tur) ----
//
// Baki: *"Vana dokunuyorum soldaki ili seçiyor, dokunduğum ili seçmiyor. Merkezi falan mı
// var illerin, ona göre mi seçiyor?"* — Tam olarak öyleydi ve hatalıydı.
//
// Önceki sürüm dokunulan noktaya EN YAKIN İL ETİKETİNİ seçiyordu. Etiket, ilin iç merkezi
// (`polylabel`). Küçük ve düzgün illerde iş görüyor ama büyük, uzun ya da girintili bir
// ilin kenarına dokunduğunda komşunun merkezi daha yakın kalıyor ve YANLIŞ İL seçiliyor.
// Van'ın batı kıyısına dokunmak Bitlis'i seçiyordu.
//
// Artık `Harita.js`'in kullandığı testin aynısı: DOKUNULAN NOKTA HANGİ POLİGONUN İÇİNDE.
// Yol dizgisi halkalara ayrılıyor, önce sınır kutusu eleniyor, sonra ray-casting.
//
// EN YAKIN ETİKET YEDEK OLARAK DURUYOR: hiçbir poligon tutmazsa (denize ya da iki ilin
// arasındaki saç teline dokunulduysa) yakın bir yarıçap içindeki en yakın il seçiliyor.
// Böylece hem doğru il seçiliyor hem "hiçbir şey olmadı" hissi doğmuyor.
//
// ---- YERLEŞİM: ŞERİTLER HARİTANIN ÜSTÜNDE, YANINDA DEĞİL ----
//
// Baki: *"il seçme ekranı da bok gibi olmuş."* Sebebi ölçülebilir bir şeydi: yatay
// telefonda kullanılabilir yükseklik ~320 dp ve üst/alt şeritler bunun ~110 dp'sini
// yiyordu. Kalan 210 dp'ye 1000×452'lik harita SIĞDIRILINCA ölçek 0.21'e düşüyor, harita
// 210×95 dp'lik bir pula dönüşüyor ve ekranın iki yanı bomboş kalıyordu.
//
// Çözüm: şeritler artık haritadan YER ÇALMIYOR, üstünde yüzüyor. Harita ekranın tamamını
// alıyor (`absoluteFill`), başlık üstte, bilgi ve düğmeler altta, hepsi yarı saydam
// zeminli birer katman. Yatay ekranda haritanın en/boyu (2.21) ekranınkine çok yakın,
// yani tam ekranda neredeyse hiç boşluk kalmıyor.
//
// ---- GÜVENLİ ALAN: ANDROID'DE EN AZ PAY VAR ----
// Üçüncü turda `useSafeAreaInsets` eklendi ama Baki *"değişen hiçbir şey yok"* dedi.
// Sebebi büyük olasılıkla insets'in Expo Go'da 0 gelmesi: pay eklendi ama pay sıfırdı.
// Artık Android'de TABAN değerler var — sistem ne söylerse söylesin, GERİ düğmesi ve
// başlık çubukların altında kalmıyor.

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { YAZI, ZEMIN, CIZGI, YAZI_RENK } from '../tema';
import { DENGE } from '../denge';
import { haritaOlcusu, ekrandanHaritaya, kaydirmaSiniri } from '../haritaDonusum';
import { senaryoKapsami } from '../oyun/senaryolar';
import { AKTOR_RENKLERI } from '../oyun/oyunDurumu';
import haritaData from '../../veri/harita.json';
import menuGeo from '../../veri/menu-geometri.json';
import illerData from '../../veri/iller.json';

const META = haritaData.meta;
const IL_GEOM = haritaData.iller; // yalnız etiket noktaları; YOLLAR sadeleşmiş setten
// ---- ⚠ ÇİZİM DE DOKUNMA TESTİ DE SADELEŞMİŞ GEOMETRİDEN (2026-08-03) ----
// Tam çözünürlüklü il yolları 824 KB — bu ekran hiç o kadar yakınlaşmıyor ve açılışta
// hepsini ayrıştırmak gecikmenin parçasıydı. Sadeleşmiş set 59 KB. İkisi de AYNI setten
// geliyor ki az önce düzeltilen türden bir çizim/dokunma ayrışması bir daha doğmasın.
const IL_YOLLARI = menuGeo.iller;
const KODLAR = Object.keys(IL_GEOM).sort();
const W = META.genislik;
const H = META.yukseklik;

// Arazi anahtarı oyuncunun okuyacağı kelimeye çevriliyor: "daglik" bir veri değeri,
// ekranda "dağlık" yazmalı.
const ARAZI_ADI = { ova: 'ova', tepelik: 'tepelik', daglik: 'dağlık' };

// İL POLİGONLARI — dokunma testi için bir kez ayrıştırılıyor.
// Ayrıştırma `Harita.js`'in `geom` hesabıyla AYNI: yol "M" ile halkalara, halkalar "L" ile
// noktalara bölünüyor. Modül düzeyinde çünkü veri sabit; her açılışta yeniden kurmanın
// anlamı yok.
const IL_POLIGON = KODLAR.map((kod) => {
  const rings = IL_YOLLARI[kod]
    .split('M')
    .filter(Boolean)
    .map((parca) =>
      parca
        .replace('Z', '')
        .split('L')
        .map((nokta) => {
          const p = nokta.split(',');
          return [+p[0], +p[1]];
        })
    );
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const r of rings)
    for (const p of r) {
      if (p[0] < x0) x0 = p[0];
      if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1];
      if (p[1] > y1) y1 = p[1];
    }
  return { kod, rings, bbox: [x0, y0, x1, y1] };
});

// Nokta bu ilin içinde mi? Ray-casting — `Harita.js`'teki testin aynısı.
function icindeMi(g, x, y) {
  const b = g.bbox;
  if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) return false;
  let icinde = false;
  for (const r of g.rings)
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const yi = r[i][1],
        yj = r[j][1];
      if (yi > y !== yj > y && x < ((r[j][0] - r[i][0]) * (y - yi)) / (yj - yi) + r[i][0])
        icinde = !icinde;
    }
  return icinde;
}

// Poligon tutmadığında kullanılacak yedek yarıçap (harita birimi). Küçük tutuluyor:
// amaç kıyıya/saç teline denk gelen dokunuşu kurtarmak, uzaktaki ili seçmek değil.
const YEDEK_YARICAP = 22;

// Yakınlaştırma sınırları — `Harita.js` ile aynı aralık, oyuncu iki ekranda aynı hissi
// bulsun.
const EN_AZ_YAKIN = 0.9;
const EN_COK_YAKIN = 7;

// Haritayı BİR KEZ çizen alt bileşen. `React.memo`: jest sırasında 81 vektör yol yeniden
// kurulmasın — dönüşüm üstteki `Animated.View`'da yaşıyor, çizim hiç değişmiyor.
const HaritaCizim = React.memo(function HaritaCizim({ kapsamIlleri, secili, olcu }) {
  return (
    // ---- ⚠ SIĞDIRMA BİR KEZ YAPILIR (Baki, 2026-08-03: "seçmek istediğim ile
    // basıyorum başka ile tıklıyor") ----
    //
    // Buradaki `viewBox`, haritayı lw×lh alanına ZATEN sığdırıyor: f ölçeği ve (ox, oy)
    // ortalaması viewBox'ın kendi işi (xMidYMid). Eski kodda bunun İÇİNDE bir de
    // `translate(ox,oy) scale(f)` grubu vardı — sığdırma İKİ KEZ uygulanıyordu.
    //
    // Dokunma testi (`ekrandanHaritaya`) tek sığdırmaya göre hesaplıyor. Çizim f² ile
    // küçülüp kayınca ikisi ayrıştı: telefonda sapma harita kenarına doğru ~80 piksele
    // çıkıyordu, yani basılan ilin KOMŞUSU seçiliyordu. Hata görselden okunamıyordu
    // çünkü küçülme %9 — göz "harita biraz küçük" demiyor, ama parmak testi şaşıyor.
    //
    // `Harita.js` bu tuzağa düşmüyor: orada sığdırmayı yalnızca viewBox yapar. Artık
    // burada da öyle — çizim ile dokunma testi aynı tek formülü paylaşıyor.
    <Svg width={olcu.lw} height={olcu.lh} viewBox={'0 0 ' + W + ' ' + H} pointerEvents="none">
      <G>
        {KODLAR.map((kod) => {
          const icinde = kapsamIlleri.has(kod);
          const bu = secili === kod;
          return (
            <Path
              key={kod}
              d={IL_YOLLARI[kod]}
              // Seçili il KENDİ RENGİNDE: oyuncu haritada hangi rengi taşıyacağını seçim
              // anında görüyor, oyun başlayınca sürpriz olmuyor.
              fill={bu ? AKTOR_RENKLERI[kod] : icinde ? ZEMIN.cukur : ZEMIN.yuzey}
              stroke={bu ? YAZI_RENK.birincil : YAZI_RENK.ikincil}
              strokeWidth={bu ? 2.2 : 0.6}
              opacity={icinde ? 1 : 0.28}
            />
          );
        })}
        {secili ? (
          <Circle
            cx={IL_GEOM[secili].etiket.x}
            cy={IL_GEOM[secili].etiket.y}
            r={3.5}
            fill={YAZI_RENK.birincil}
          />
        ) : null}
      </G>
    </Svg>
  );
});

export default function IlSecimi({ kapsam, zorluk, onZorluk, onSec, onGeri }) {
  const insets = useSafeAreaInsets();
  const [secili, setSecili] = useState(null);
  const [olcu, setOlcu] = useState(null);

  const kapsamIlleri = useMemo(() => new Set(senaryoKapsami(kapsam).kapsamIller), [kapsam]);
  const seciliBilgi = secili && illerData[secili] ? illerData[secili] : null;

  // ---- GÜVENLİ ALAN + ANDROID TABANI ----
  // `insets` 0 gelse bile (Expo Go) çubukların altına girmiyoruz. Taban değerler Android
  // durum çubuğu (~24 dp) ve gezinme çubuğu (~24 dp) ölçülerinden.
  const androidTaban = Platform.OS === 'android' ? 26 : 0;
  const ustPay = Math.max(insets.top, androidTaban) + 6;
  const altPay = Math.max(insets.bottom, androidTaban) + 6;
  const solPay = Math.max(insets.left, 14);
  const sagPay = Math.max(insets.right, 14);

  // ---- JEST (Harita.js'in kalıbı) ----
  const tX = useSharedValue(0);
  const tY = useSharedValue(0);
  const sc = useSharedValue(1);
  const bX = useSharedValue(0);
  const bY = useSharedValue(0);
  const bS = useSharedValue(1);
  const bfx = useSharedValue(0);
  const bfy = useSharedValue(0);
  const pdx = useSharedValue(0);
  const pdy = useSharedValue(0);
  const lw = useSharedValue(1);
  const lh = useSharedValue(1);

  // Dokunulan ekran noktası → harita birimi → İÇİNDE BULUNDUĞU il.
  const secimYap = useCallback(
    (sx, sy, tx, ty, z, LW, LH) => {
      const o = haritaOlcusu(LW, LH, W, H);
      const p = ekrandanHaritaya(sx, sy, o, z, tx, ty);

      // 1) ASIL TEST: nokta hangi ilin poligonu içinde.
      for (const g of IL_POLIGON) {
        if (!kapsamIlleri.has(g.kod)) continue;
        if (icindeMi(g, p.x, p.y)) {
          setSecili(g.kod);
          return;
        }
      }

      // 2) YEDEK: hiçbir poligon tutmadı (deniz, sınır çizgisi, iki ilin arası).
      // Yakın bir yarıçap içindeki en yakın il seçiliyor; uzağa dokunulduysa hiçbir şey
      // seçilmiyor — yanlış il seçmektense seçmemek iyidir.
      let enYakin = null;
      let enKisa = YEDEK_YARICAP * YEDEK_YARICAP;
      for (const kod of KODLAR) {
        if (!kapsamIlleri.has(kod)) continue;
        const e = IL_GEOM[kod].etiket;
        const d = (e.x - p.x) * (e.x - p.x) + (e.y - p.y) * (e.y - p.y);
        if (d < enKisa) {
          enKisa = d;
          enYakin = kod;
        }
      }
      if (enYakin) setSecili(enYakin);
    },
    [kapsamIlleri]
  );

  const jest = useMemo(() => {
    // Kaydırma sınırı `haritaDonusum.js`'ten — oyunun haritasıyla AYNI kural, yani harita
    // burada da elle gidilemeyecek bir yere kaçmıyor.
    const sinirla = () => {
      'worklet';
      const sinir = kaydirmaSiniri(lw.value, lh.value, sc.value);
      if (tX.value > sinir.fx) tX.value = sinir.fx;
      if (tX.value < -sinir.fx) tX.value = -sinir.fx;
      if (tY.value > sinir.fy) tY.value = sinir.fy;
      if (tY.value < -sinir.fy) tY.value = -sinir.fy;
    };

    const pan = Gesture.Pan()
      .maxPointers(1)
      .minDistance(DENGE.JEST.KAYDIRMA_ESIGI)
      .onStart((e) => {
        bX.value = tX.value;
        bY.value = tY.value;
        // EŞİK TELAFİSİ — `Harita.js`'in notu birebir geçerli: telafi edilmezse harita
        // kaydırma başlar başlamaz eşik kadar zıplıyor.
        pdx.value = e.translationX;
        pdy.value = e.translationY;
      })
      .onUpdate((e) => {
        tX.value = bX.value + (e.translationX - pdx.value);
        tY.value = bY.value + (e.translationY - pdy.value);
        sinirla();
      });

    const pinch = Gesture.Pinch()
      .onStart((e) => {
        bS.value = sc.value;
        bX.value = tX.value;
        bY.value = tY.value;
        bfx.value = e.focalX;
        bfy.value = e.focalY;
      })
      .onUpdate((e) => {
        let n = bS.value * e.scale;
        if (n < EN_AZ_YAKIN) n = EN_AZ_YAKIN;
        if (n > EN_COK_YAKIN) n = EN_COK_YAKIN;
        const r = n / bS.value;
        const Cx = lw.value / 2;
        const Cy = lh.value / 2;
        // Başlangıç odağı sabit tutularak yakınlaştırma. Canlı odak takibi BİLEREK yok —
        // parmak bırakırken son karedeki odak zıplaması haritayı kaydırıyordu.
        tX.value = (bfx.value - Cx) * (1 - r) + bX.value * r;
        tY.value = (bfy.value - Cy) * (1 - r) + bY.value * r;
        sc.value = n;
        sinirla();
      });

    const tap = Gesture.Tap()
      .maxDistance(12)
      .onEnd((e) => {
        runOnJS(secimYap)(e.x, e.y, tX.value, tY.value, sc.value, lw.value, lh.value);
      });

    return Gesture.Simultaneous(pan, pinch, tap);
    // Paylaşılan değerlerin kimliği değişmez; bağımlılık listesine girmeleri gereksiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secimYap]);

  const stil = useAnimatedStyle(() => ({
    transform: [{ translateX: tX.value }, { translateY: tY.value }, { scale: sc.value }],
  }));

  return (
    <View style={s.tabaka}>
      {/* HARİTA EKRANIN TAMAMI — şeritler yer çalmıyor, üstünde yüzüyor. */}
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          lw.value = width;
          lh.value = height;
          setOlcu((o) =>
            o && o.lw === width && o.lh === height ? o : haritaOlcusu(width, height, W, H)
          );
        }}
      >
        <GestureDetector gesture={jest}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[StyleSheet.absoluteFill, stil]} pointerEvents="none">
              {olcu ? (
                <HaritaCizim kapsamIlleri={kapsamIlleri} secili={secili} olcu={olcu} />
              ) : null}
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      {/* ---- ÜST KATMAN: başlık ve GERİ ----
          `pointerEvents="box-none"` — katmanın boş yeri dokunmayı GEÇİRİYOR, yani
          başlığın yanından haritayı kaydırmaya devam edebiliyorsun. Yalnızca düğmenin
          kendisi dokunma alıyor. */}
      <View
        style={[s.ustKatman, { top: ustPay, left: solPay, right: sagPay }]}
        pointerEvents="box-none"
      >
        <Text style={s.baslik} numberOfLines={1}>
          NEREDEN BAŞLIYORSUN?
        </Text>
        <Pressable style={s.geri} onPress={onGeri} hitSlop={16}>
          <Text style={s.geriMetin}>GERİ</Text>
        </Pressable>
      </View>

      {/* ---- ALT KATMAN: seçilen il, zorluk, başlat ---- */}
      <View
        style={[s.altKatman, { bottom: altPay, left: solPay, right: sagPay }]}
        pointerEvents="box-none"
      >
        <View style={s.bilgi}>
          {seciliBilgi ? (
            <>
              <Text style={s.ilAd} numberOfLines={1}>
                {seciliBilgi.ad}
              </Text>
              <Text style={s.ilAlt} numberOfLines={2}>
                {seciliBilgi.parcaSayisi} bölge · {ARAZI_ADI[seciliBilgi.arazi]} arazi · nüfus{' '}
                {seciliBilgi.statlar.nufus} · sanayi {seciliBilgi.statlar.sanayi}
              </Text>
            </>
          ) : (
            <Text style={s.ilAlt} numberOfLines={2}>
              Haritaya dokunup başlayacağın ili seç.{'\n'}Küçük iller için iki parmakla yakınlaştır.
            </Text>
          )}
        </View>

        <View style={s.sagAlt}>
          {/* ---- ⚠ ETİKET EKLENDİ (Görev 10A / Adım 7) ----
              Üç düğme (Kolay/Orta/Zor) etiketsiz duruyordu ve NE OLDUKLARI tahmine
              kalıyordu — ekranda başka seçenek grupları da var, oyuncu bunun zorluk
              olduğunu ancak deneyerek anlıyordu. Etiket satırın üstünde, düğmelerle
              aynı hizada başlıyor. */}
          <Text style={s.zorlukEtiket}>ZORLUK</Text>
          <View style={s.zorlukSatiri}>
            {DENGE.ZEKA.ZORLUK_SIRASI.map((x) => (
              <Pressable
                key={x}
                style={[s.zorluk, zorluk === x && s.zorlukSecili]}
                onPress={() => onZorluk(x)}
              >
                <Text style={[s.zorlukMetin, zorluk === x && s.zorlukMetinSecili]}>
                  {DENGE.ZEKA.ZORLUK[x].ad}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[s.basla, !secili && s.baslaPasif]}
            disabled={!secili}
            onPress={() => onSec(secili)}
          >
            <Text style={[s.baslaMetin, !secili && s.baslaMetinPasif]}>BAŞLA</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, backgroundColor: ZEMIN.taban },

  // Katmanlar haritanın ÜSTÜNDE yüzüyor; yer kaplamıyorlar (`position: absolute`).
  ustKatman: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  baslik: {
    flexShrink: 1,
    fontFamily: YAZI.baslik,
    fontSize: 14,
    color: YAZI_RENK.birincil,
    letterSpacing: 2,
    // Harita üstünde okunabilirlik: gölge, kutu değil — kutu haritayı kapatırdı.
  },
  geri: {
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 8,
    backgroundColor: ZEMIN.yuzey,
  },
  geriMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    color: YAZI_RENK.birincil,
    letterSpacing: 1.2,
  },

  altKatman: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  // Bilgi kısmı BÜZÜLEBİLİR, sağ taraf büzülemez: yer daralınca il adı kısalsın,
  // BAŞLA düğmesi asla kesilmesin.
  bilgi: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: ZEMIN.yuzey,
  },
  ilAd: { fontFamily: YAZI.baslik, fontSize: 17, color: YAZI_RENK.birincil, letterSpacing: 1.1 },
  ilAlt: {
    fontFamily: YAZI.govde,
    fontSize: 11,
    color: YAZI_RENK.ikincil,
    marginTop: 2,
    lineHeight: 15,
  },
  sagAlt: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  zorlukEtiket: {
    fontFamily: YAZI.etiket,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 1.6,
    color: YAZI_RENK.ikincil,
    marginBottom: 3,
    textAlign: 'right',
  },
  zorlukSatiri: { flexDirection: 'row', gap: 5 },
  zorluk: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
    borderRadius: 7,
    backgroundColor: ZEMIN.yuzey,
  },
  zorlukSecili: { borderColor: YAZI_RENK.ikincil, backgroundColor: ZEMIN.cukur },
  zorlukMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    color: YAZI_RENK.ikincil,
    letterSpacing: 0.9,
  },
  zorlukMetinSecili: { color: YAZI_RENK.birincil },
  basla: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    borderRadius: 9,
    backgroundColor: ZEMIN.yuzey,
  },
  baslaPasif: { borderColor: CIZGI.ayrac, opacity: 0.45 },
  baslaMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 13,
    color: YAZI_RENK.birincil,
    letterSpacing: 1.6,
  },
  baslaMetinPasif: { color: YAZI_RENK.ikincil },
});
