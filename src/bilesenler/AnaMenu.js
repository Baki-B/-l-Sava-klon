// ANA MENÜ VE MAÇ KURULUM AKIŞI (Görev 09 · 2026-08-01 arayüz revizyonu).
//
// ┌─ BAKİ'NİN İTİRAZI ──────────────────────────────────────────────────────────────────┐
// │ *"Ana menüyü hiç sevmedim. Klasik mobil oyun ana menüleri gibi olsa bile daha iyi   │
// │  olurmuş, bu onlardan da kötü."*                                                     │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// İlk sürüm ekranın ortasında bir kutu, kutunun içinde ortalanmış düğmelerdi — yani bir
// AYAR PENCERESİ. Oyunun kapağı değil. Yeniden kurulan hâli:
//
//   • Düğmeler SOLA YATIK ve tam ekran; kutu yok
//   • Ortada mum mührü damgası (`Muhur`) — arka planda, filigran gibi
//   • Mod seçimi üç büyük LOGO — "Nasıl kazanılır" başlığı kaldırıldı, çünkü mod bir
//     ayar değil oyunun ilk kararı ve başlığa ihtiyacı yok
//
// ---- ÜÇ ADIMLI KURULUM ----
//   menu → mod (üç logo) → il seçimi (harita + zorluk sağ altta) → oyna
//
// Arada bir "NEREDE OYNANACAK" adımı vardı ve KALDIRILDI (2026-08-01, Baki: *"buna ne
// gerek var? Zaten map gelecek karşıma, oradan seçeceğim... zorluk da mapten seçerken
// ayarlansın, sağ alta bir yere koy."*). Haklıydı: harita zaten geliyor ve kapsam sorusu
// oyuncuya cevabı belli bir soru soruyordu. Zorluk da il seçim ekranına taşındı.
//
// Bölge kapsamları (`DENGE.MOD.KAPSAMLAR`) SİLİNMEDİ — motor, ölçüm betikleri ve testler
// onları kullanmaya devam ediyor. Yalnızca kurulum akışından çıktılar; maçlar Türkiye
// kapsamında kuruluyor.
//
// ---- BURASI EKRAN, OYUN DEĞİL ----
// Hiçbir oyun kuralı burada yok. Kapsam listesi `DENGE.MOD.KAPSAMLAR`tan, il/bölge
// sayıları `senaryoKapsami`den, tur sınırı ve eşik `modTurSiniri`/`modKazanmaEsigi`den —
// mod ekranında görünen sayı ile oyunun kurduğu maç ayrışamaz.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM, MENU_RENK, KAGIT } from '../tema';
import { DENGE } from '../denge';
import MenuSeferi from './MenuSeferi';
import MenuPaneli from './MenuPaneli';
import IlSecimi from './IlSecimi';
import ModSecimi from './ModSecimi';
import { IkonCop, IkonOynat } from './Ikonlar';

// ⚠ SÜRE METNİ KALDIRILDI (2026-08-01, Baki: *"maç yaklaşık 1 saat 53 dk sürer gibi
// bizim kararlaştırmada kullandığımız ifadelere yer verme"*). O sayı bizim denge
// kararımızdı — `DENGE.MOD.SANIYE_PER_TUR` hâlâ tur sınırlarını hesaplıyor ama ekrana
// çıkmıyor. Oyuncuya lazım olan şey ne yapması gerektiği, kaç dakika süreceği değil.

// Gürültü karosu — `require` modül düzeyinde, her çizimde yeniden çözülmesin.
const GREN = require('../../assets/gren.png');

// ---- ANA MENÜ PANELİNİN ÖLÇÜLERİ (Görev 10A / Adım 4) ----
// Hepsi ONİZLEME BİRİMİ: `onizleme/ana-menu-final.html` 880×400'lük bir kutuda çizildi ve
// Baki onu onayladı. Bu sayılar o çizimdeki ölçüler; kodda `k` katsayısıyla ekranın
// gerçek boyutuna çevriliyorlar (uygulama belgesi §1 — "piksel sayılarını kopyalama").
//
// Dikey yerleşim önizlemedeki TEMEL ÇİZGİLERDEN türetildi (başlık 106, alt satır 124,
// ayraç 140, satırlar 178/221/264/307 — hepsi panelin 62'deki üst kenarına göre).
const PANEL_OLCU = {
  ONIZLEME_G: 290.4, // önizlemedeki panel genişliği (880 × 0.33)
  ONIZLEME_Y: 276, // önizlemedeki panel yüksekliği (400 × 0.69)

  GENISLIK_PAYI: 0.33, // karar belgesi §4: ekranın üçte biri
  YUKSEKLIK_PAYI: 0.69,
  UST_PAYI: 0.155,

  BASLIK_UST: 21,
  BASLIK: 26,
  BASLIK_SATIR: 33,
  BASLIK_ARA: 4,

  ALT: 11.5,
  ALT_SATIR: 15,
  ALT_ARA: 2.2,

  AYRAC_UST: 78,
  AYRAC_PAYI: 26,

  SATIRLAR_UST: 90.5, // ilk satırın kutusunun üstü
  SATIR_ADIMI: 43,
  SATIR: 16,
  SATIR_YUKSEKLIK: 21,
  SATIR_ARA: 2.4,
};

// Panelin içindeki tek menü satırı.
//
// ---- NİYE MUTLAK KONUM ----
// Satırlar akışta dizilseydi yükseklikleri yazı tipinin gerçek satır yüksekliğine bağlı
// olurdu ve toplam, hesaplanandan birkaç piksel şişerdi. Bu tam olarak 2026-08-01'de
// menüyü taşıran hataydı. Her satır kendi `top`unda ve kendi yüksekliğinde: panelin
// içine sığdığı ARİTMETİKLE biliniyor, ölçülerek değil.
//
// ---- SEBEP YAZISI YÜKSEKLİĞE GİRMİYOR ----
// Pasif satırın sebebi ("Kayıtlı seferin yok") satırın İÇİNDE mutlak konumlu. Akışa
// girseydi o satır ötekilerden uzun olur ve aynı taşma geri gelirdi.
function PanelSatiri({
  metin,
  sebep,
  pasif,
  birincil,
  onPress,
  ust,
  yukseklik,
  boy,
  satirYuksekligi,
  harfArasi,
}) {
  return (
    <Pressable
      style={[m.panelSatir, { top: ust, height: yukseklik }]}
      disabled={pasif}
      onPress={onPress}
    >
      {({ pressed }) => (
        <>
          <Text
            style={[
              m.panelSatirMetin,
              birincil ? m.panelSatirBirincil : m.panelSatirIkincil,
              {
                fontSize: boy,
                lineHeight: satirYuksekligi,
                letterSpacing: harfArasi,
              },
              pasif && m.panelSatirPasif,
              pressed && !pasif && m.panelSatirBasili,
            ]}
            numberOfLines={1}
          >
            {metin}
          </Text>
          {pasif && sebep ? (
            <Text
              style={[m.panelSebep, { fontSize: boy * 0.62, lineHeight: boy * 0.82 }]}
              numberOfLines={1}
            >
              {sebep}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

// Sola yatık ana düğme. Alt satır ZORUNLU DEĞİL: pasif düğmenin sebebini yazmak için var
// (§6/10 — "yuva yoksa düğme pasif ve sebebi yazılı").
// ---- ⚠ ALT SATIR ARTIK ALTTA DEĞİL, YANDA (Görev 10A / Adım 7) ----
//
// Kusur: "Kayıtlı maçın yok" yazısı DEVAM ET'in üstüne biniyordu.
//
// Sebebi hesapta: yukarıdaki yerleşim aritmetiği her düğmeyi `lineHeight + 2 × pay`
// sayıyor. Alt satırı olan düğme ise 13 px DAHA UZUN oluyordu ve bu fazlalık hesaba hiç
// girmiyordu. Liste kullanılabilir alanı aşınca `justifyContent: 'center'` taşmayı İKİ
// UÇTAN birden kırpıyor — sonuç, üst üste binmiş iki yazı.
//
// Çözüm alt satırı silmek değil (sebep yazılmalı, §6/10), YÜKSEKLİĞE EKLENMEMESİNİ
// sağlamak: alt yazı artık etiketin sağında, aynı temel çizgide. Düğmenin yüksekliği
// alt yazı olsa da olmasa da birebir aynı, yani aritmetik her durumda tutuyor.
function MenuTusu({ metin, alt, onPress, pasif, boy, pay, satir }) {
  return (
    <Pressable
      style={[m.tus, pay ? { paddingVertical: pay } : null, pasif && m.tusPasif]}
      disabled={pasif}
      onPress={onPress}
    >
      <View style={[m.cizgi, pasif && m.cizgiPasif]} />
      <Text
        style={[
          m.tusMetin,
          boy ? { fontSize: boy, lineHeight: satir } : null,
          pasif && m.tusMetinPasif,
        ]}
        numberOfLines={1}
      >
        {metin}
      </Text>
      {alt ? (
        <Text style={m.tusAlt} numberOfLines={1}>
          {alt}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function AnaMenu({
  gorunum,
  setGorunum,
  ozetler,
  devamYuvasi,
  onDevam,
  onYukle,
  onSil,
  onBasla,
  onAyarlar,
  onEgitim,
  onBasarimlar,
  rutbe,
}) {
  const { width, height } = useWindowDimensions();
  // ⚠ GÜVENLİ ALAN OKUNUYOR (2026-08-01, üçüncü tur). Sistem çubukları gizlenemezse bile
  // (Expo Go'da gizlenemiyor) hiçbir yazı onların altında kalmamalı. Kural şu:
  // GİZLEMEYE ÇALIŞ, AMA GİZLENMEMİŞ GİBİ YERLEŞ — gizlenirse insets zaten sıfırlanır.
  const insets = useSafeAreaInsets();
  // ⚠ ANDROID TABANI (2026-08-01, dördüncü tur). Baki üçüncü turdan sonra *"değişen
  // hiçbir şey yok"* dedi; sebebi büyük olasılıkla `insets`in Expo Go'da 0 gelmesiydi —
  // pay eklendi ama pay sıfırdı. Artık sistem ne söylerse söylesin bir taban var.
  const [mod, setMod] = useState(DENGE.MOD.VARSAYILAN_TIP);
  const [zorluk, setZorluk] = useState(DENGE.ZEKA.VARSAYILAN_ZORLUK);

  // Yan boşluk ekrana oranlı; güvenli alanın solu da eklenmiş (çentikli ekranlar).
  const yanBosluk = Math.round(width * 0.06) + Math.max(insets.left, 8);

  const androidTaban = Platform.OS === 'android' ? 26 : 0;
  const ustPay = Math.max(insets.top, androidTaban);
  const altPay = Math.max(insets.bottom, androidTaban);

  // ---- ⚠ LİSTE EKRANA SIĞMIYORDU (2026-08-01, ekran görüntüsü) ----
  //
  // Belirti: "İL SAVAŞI" saatin altında kalmış, "HARİTAYA DÖN" alttan taşmıştı.
  // `justifyContent: 'center'` taşan içeriği İKİ UÇTAN birden kırpar — ve taşan içerik
  // kapsayıcının `padding`ini de tanımaz, o yüzden güvenli alan payı da işe yaramaz.
  //
  // İlk düzeltme yetmedi çünkü hesap TAHMİNE dayanıyordu: yazının gerçek satır yüksekliği
  // yazı tipine göre değişiyor ve toplam, hesapladığımdan birkaç piksel büyük çıkıyordu.
  //
  // Şimdi iki şey birden yapılıyor:
  //   1. SATIR YÜKSEKLİĞİ AÇIKÇA YAZILIYOR (`lineHeight`). Tahmin kalmıyor: bir düğmenin
  //      kapladığı yer tam olarak `lineHeight + 2 × pay`.
  //   2. GÜVENLİK PAYI (%88). Kalan alanın tamamı doldurulmuyor; alt yazılar, yuvarlama
  //      ve yazı tipi farkı için pay bırakılıyor.

  // ---- ANA MENÜ PANELİ (Görev 10A / Adım 4) ----
  // Ölçüler karar belgesi §4'ten: panel ekranın %33'ü genişliğinde, ortada.
  // Önizleme 880×400'de çizildi; buradaki sayılar o çizimin ORANLARI, kopyası değil.
  const panelGenislik = width * PANEL_OLCU.GENISLIK_PAYI;
  const panelYukseklik = height * PANEL_OLCU.YUKSEKLIK_PAYI;
  const panelUst = height * PANEL_OLCU.UST_PAYI;

  // Tek ölçek katsayısı: iç yerleşimin tamamı önizlemedeki oranı koruyor. İki ayrı
  // katsayı (yatay/dikey) kullanılsaydı farklı en-boy oranlı ekranlarda kompozisyon
  // gerilir, yazılar panele göre büyüyüp küçülürdü.
  const k = Math.min(panelGenislik / PANEL_OLCU.ONIZLEME_G, panelYukseklik / PANEL_OLCU.ONIZLEME_Y);

  // Satır adımı önizlemedeki 43 birim; dört satır panele rahat sığıyor.
  const satirAdimi = PANEL_OLCU.SATIR_ADIMI * k;

  // ---- KOMUTA DİLİ (karar belgesi §5) ----
  // Baki'nin savaş teması turunda beğendiği tek şey buydu: *"yalnızca kelimeleri değişmek
  // güzel."* Yani menü aynı menü, sadece askeri ağızdan konuşuyor.
  //
  // ---- "CEPHEYE DÖN" YOK (Baki, 2026-08-03) ----
  // Beşinci bir satır olarak vardı ve KALDIRILDI: *"ana menüde cepheye dön gereksiz
  // olmuş... sefere devam aynı mantığa gelicek zaten."* Menüye dönüş artık kayıt
  // sorusundan geçiyor (App.js'teki çıkış onayı), yani menü açıldığında sürmekte olan
  // maç ya kaydedilmiş ya bilerek bırakılmıştır — ikisinde de geri yol SEFERE DEVAM.
  // Dört satır sabit; panel yerleşimi de bu yüzden tek adım sayısıyla hesaplanabiliyor.
  const satirlar = useMemo(
    () => [
      {
        metin: 'SEFERE DEVAM',
        onPress: onDevam,
        pasif: devamYuvasi === null,
        sebep: 'Kayıtlı seferin yok',
      },
      { metin: 'YENİ SEFER', onPress: () => setGorunum('mod') },
      { metin: 'HAREKÂT ARŞİVİ', onPress: () => setGorunum('yuvalar') },
      { metin: 'KOMUTA AYARLARI', onPress: onAyarlar },
    ],
    [devamYuvasi, onAyarlar, onDevam, setGorunum]
  );

  // Önizlemede İLK satır kalın ve tam parlak, ötekiler ince ve %82 — yani vurgulanan şey
  // "seçili satır" değil ASIL EYLEM (karar belgesi §4: sıcak seçili satır YOK).
  // Kayıtlı sefer yoksa o satır pasif; asıl eylem de bir alt satıra, YENİ SEFER'e geçiyor.
  // Pasif bir satırı kalın yazmak oyuncuya basılamayacak bir şeyi işaret etmek olurdu.
  const birincilSatir = satirlar.findIndex((satir) => !satir.pasif);

  const kapsam = DENGE.MOD.VARSAYILAN_KAPSAM;

  // ---- İL SEÇİMİ TAM EKRAN, KENDİ BİLEŞENİNDE ----
  // ⚠ MENÜNÜN İÇİNE GÖMÜLMÜYOR (Baki: *"bu iç içe geçmeye sebep olmamalı"*). İl ekranının
  // kendisi zaten bir harita; arkasında ikinci bir yüzen harita olsaydı iki harita üst
  // üste biner ve hangisine dokunduğun anlaşılmazdı. Erken dönüşle menünün arka planı
  // hiç çizilmiyor.
  if (gorunum === 'il')
    return (
      <IlSecimi
        kapsam={kapsam}
        zorluk={zorluk}
        onZorluk={setZorluk}
        onGeri={() => setGorunum('mod')}
        onSec={(ilKodu) => onBasla({ mod, kapsam, zorluk, ilKodu })}
      />
    );

  return (
    <View style={m.tabaka}>
      {/* ARKA HARİTA (Görev 10A / Adım 3) — menünün zemini artık haritanın kendisi.
          Öncesinde burada mum mührü vardı, ondan önce yüzen bir Türkiye konturu; ikisi de
          "yazının arkasındaki süs" idi ve Baki'nin envanterindeki tespit ikisi için de
          geçerliydi: *"harita hiçbir iş yapmıyor."* Şimdi iş yapıyor — ekranın zemini o.

          ⚠ YALNIZCA ANA MENÜDE. Kayıt yuvaları listesi hâlâ eski koyu zeminde duruyor;
          harita onun da arkasına konsaydı liste okunmaz olurdu. Mod ekranı Adım 6'da
          kendi dosyasına çıkıp haritayı oraya götürecek — ama fetih döngüsü GELMEYECEK:
          orada oyuncu karar veriyor, arkada bir şey oynasa kartlardan dikkat çalardı. */}
      {gorunum === 'menu' ? <MenuSeferi genislik={width} yukseklik={height} /> : null}

      {/* ---- EĞİTİM (Baki, 2026-08-06) ----
          *"Ana menüde ekranın başka bir bölümünde olması daha iyi olur, sağ üstte falan,
          EĞİTİM adında bir bölüm."* Panelin içine dördüncü satır olarak koymak yerine
          ekranın sağ üst köşesinde kendi başına duruyor: eğitim bir MENÜ SEÇENEĞİ değil,
          oyunun kapısındaki ayrı bir davet.

          ⚠ ŞU AN KURALLAR EKRANINI AÇIYOR. Baki'nin istediği İNTERAKTİF eğitim (adım adım
          yönlendiren, oyuncuya gerçekten oynatan tür) ayrı bir iş olarak sonraya bırakıldı
          — düğme şimdiden yerinde dursun diye burada. İnteraktif eğitim geldiğinde
          `onEgitim` onu açar, bu dosyada başka hiçbir şey değişmez. */}
      {gorunum === 'menu' ? (
        <View style={[m.kose, { top: insets.top + 14, right: insets.right + 18 }]}>
          {onEgitim ? (
            <Pressable style={m.egitim} onPress={onEgitim} hitSlop={8}>
              <Text style={m.egitimMetin}>EĞİTİM</Text>
            </Pressable>
          ) : null}
          {/* MÜHÜRLER — başarımlar maça değil OYUNCUYA ait, o yüzden menüde ve panelin
              içinde değil: panel maç kurma akışı, burası oyuncunun kendi ilerlemesi. */}
          {onBasarimlar ? (
            <Pressable style={m.egitim} onPress={onBasarimlar} hitSlop={8}>
              <Text style={m.egitimMetin}>
                MÜHÜRLER
                {/* RÜTBE (Görev 16 / Adım 3): oyuncunun kendi kariyeri, maça ait değil.
                    Düğmenin yanında duruyor çünkü kaynağı da orası — mühürler. */}
                {rutbe ? <Text style={m.rutbe}>{'  ·  ' + (rutbe.onur || rutbe.ad)}</Text> : null}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {gorunum === 'menu' ? (
        <MenuPaneli
          stil={[
            m.anaPanel,
            {
              left: (width - panelGenislik) / 2,
              top: panelUst,
              width: panelGenislik,
              height: panelYukseklik,
            },
          ]}
          cocuklar={
            <>
              <Text
                style={[
                  m.panelBaslik,
                  {
                    top: PANEL_OLCU.BASLIK_UST * k,
                    fontSize: PANEL_OLCU.BASLIK * k,
                    lineHeight: PANEL_OLCU.BASLIK_SATIR * k,
                    letterSpacing: PANEL_OLCU.BASLIK_ARA * k,
                  },
                ]}
              >
                İL SAVAŞLARI
              </Text>
              <Text
                style={[
                  m.panelAlt,
                  {
                    top: (PANEL_OLCU.BASLIK_UST + PANEL_OLCU.BASLIK_SATIR) * k,
                    fontSize: PANEL_OLCU.ALT * k,
                    lineHeight: PANEL_OLCU.ALT_SATIR * k,
                    letterSpacing: PANEL_OLCU.ALT_ARA * k,
                  },
                ]}
              >
                81 İL · BAĞIMSIZ · SAVAŞ HÂLİNDE
              </Text>
              <View
                style={[
                  m.panelAyrac,
                  {
                    top: PANEL_OLCU.AYRAC_UST * k,
                    left: PANEL_OLCU.AYRAC_PAYI * k,
                    right: PANEL_OLCU.AYRAC_PAYI * k,
                  },
                ]}
              />
              {satirlar.map((satir, i) => (
                <PanelSatiri
                  key={satir.metin}
                  metin={satir.metin}
                  sebep={satir.sebep}
                  pasif={satir.pasif}
                  birincil={i === birincilSatir}
                  onPress={satir.onPress}
                  ust={PANEL_OLCU.SATIRLAR_UST * k + i * satirAdimi}
                  yukseklik={satirAdimi}
                  boy={PANEL_OLCU.SATIR * k}
                  satirYuksekligi={PANEL_OLCU.SATIR_YUKSEKLIK * k}
                  harfArasi={PANEL_OLCU.SATIR_ARA * k}
                />
              ))}
            </>
          }
        />
      ) : gorunum === 'yuvalar' ? (
        <View
          style={[
            m.solKolon,
            {
              paddingLeft: yanBosluk,
              paddingRight: yanBosluk,
              paddingTop: ustPay,
              paddingBottom: altPay,
            },
          ]}
        >
          <Text style={m.baslik}>KAYITLI OYUNLAR</Text>
          <View style={m.tusListesi}>
            {/* ---- İKİ DÜĞME: SİL VE OYNA (Görev 12 · Baki'nin isteği) ----
                Eskiden satırın tamamı tek bir "yükle" düğmesiydi ve silmenin hiçbir yolu
                yoktu: üç yuva dolunca yeni maç ancak ÜSTÜNE YAZARAK açılıyordu.
                Şimdi satır bilgi, sağdaki iki ikon eylem taşıyor. Renkler işin niteliğini
                söylüyor: kırmızı geri alınamaz, yeşil devam. Okunamayan (eski sürüm)
                kayıtta OYNA kapalı ama SİL AÇIK — yer açabilmelisin. */}
            {ozetler.map((o) => (
              <View key={o.yuva} style={[m.yuva, !o.dolu && m.yuvaBos]}>
                <View style={m.yuvaBilgi}>
                  <Text style={m.yuvaBaslik}>{o.yuva + 1}. MAÇ</Text>
                  {!o.dolu ? (
                    <Text style={m.yuvaAlt}>Bu yuva boş.</Text>
                  ) : o.okunamiyor ? (
                    <Text style={m.yuvaHata}>{o.hata}</Text>
                  ) : (
                    <Text style={m.yuvaAlt}>
                      {o.modAdi} · {o.kapsamAdi} · {o.tur}. tur · {o.parca}/{o.toplamParca} bölge
                      {o.sonuc === 'kazandi'
                        ? ' · kazanıldı'
                        : o.sonuc === 'yenildi'
                          ? ' · kaybedildi'
                          : ''}
                    </Text>
                  )}
                </View>

                {o.dolu ? (
                  <View style={m.yuvaTuslar}>
                    <Pressable
                      style={m.yuvaIkon}
                      hitSlop={8}
                      onPress={() => onSil(o.yuva)}
                      accessibilityLabel={o.yuva + 1 + '. maçı sil'}
                    >
                      <IkonCop size={20} color={KAGIT.eksi} />
                    </Pressable>
                    <Pressable
                      style={[m.yuvaIkon, o.okunamiyor && m.yuvaIkonPasif]}
                      hitSlop={8}
                      disabled={o.okunamiyor}
                      onPress={() => onYukle(o.yuva)}
                      accessibilityLabel={o.yuva + 1 + '. maçı oyna'}
                    >
                      <IkonOynat size={20} color={o.okunamiyor ? KAGIT.yaziSoluk : KAGIT.arti} />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
            <MenuTusu metin="GERİ" onPress={() => setGorunum('menu')} />
          </View>
        </View>
      ) : gorunum === 'mod' ? (
        // ---- MOD SEÇİMİ (Görev 10A / Adım 6) ----
        // Kendi dosyasında: üç kart, her birinde o modun kazanma hâlini gösteren mini
        // harita. Eski üç-logo bloğu buradan çıktı; logolar artık kullanılmıyor.
        <ModSecimi
          mod={mod}
          onMod={setMod}
          onGeri={() => setGorunum('menu')}
          onIleri={() => setGorunum('il')}
        />
      ) : null}

      {/* GREN — EN ÜSTTE, panelin de üstünde (karar belgesi §3: "tüm ekrana %10 gürültü").
          Haritanın içine konsaydı panelin altında kalır ve ekranın yarısı dokusuz olurdu.
          Dokunuşları geçiriyor, yoksa altındaki her düğmeyi yutardı. */}
      {gorunum === 'menu' ? (
        <Image
          source={GREN}
          resizeMode="repeat"
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, m.gren]}
        />
      ) : null}

      {/* YAPIM DAMGASI (Görev 10 / Adım 0). Sol kolonun İÇİNE konmuyor: `m.solKolon`
          `maxWidth: 520` ile sınırlı, oraya konsa "sağ alt" ekranın sağ altı değil
          kolonun sağ altı olurdu. Tabakaya çocuk olarak veriliyor ki gerçekten ekranın
          sağ alt köşesine otursun.
          YALNIZCA GELİŞTİRMEDE (Görev 20 / Adım 0): oyuncuya bir şey anlatmıyor (CLAUDE.md
          §5/10), ama Expo Go'da "telefon son kodu mu çiziyor" sorusuna hâlâ cevap veriyor.
          `__DEV__` yayın paketinde false — damga orada hiç çizilmez. */}
      {__DEV__ && gorunum === 'menu' ? (
        <Text style={[m.damga, { bottom: altPay + 6, right: Math.max(insets.right, 0) + 12 }]}>
          {'menu:' + DENGE.YAPIM}
        </Text>
      ) : null}
    </View>
  );
}

const m = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, backgroundColor: ZEMIN.taban },

  // ---- ANA MENÜ PANELİ (Görev 10A / Adım 4) ----
  // Konum ve ölçü kullanım yerinde veriliyor (ekrana oranlı); burada yalnızca görünüm.
  anaPanel: { position: 'absolute' },
  // Başlık, alt satır ve ayraç MUTLAK konumlu — dikey yerleşim önizlemedeki temel
  // çizgilerden hesaplanıyor, akışa bırakılmıyor (bkz. PanelSatiri'ndeki not).
  panelBaslik: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: YAZI.baslik,
    color: MENU_RENK.yazi,
  },
  panelAlt: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: YAZI.govde,
    color: MENU_RENK.yaziSolu,
    opacity: 0.85,
  },
  panelAyrac: { position: 'absolute', height: 1, backgroundColor: MENU_RENK.yazi, opacity: 0.3 },

  panelSatir: { position: 'absolute', left: 0, right: 0, justifyContent: 'center' },
  panelSatirMetin: { textAlign: 'center', color: MENU_RENK.yazi },
  // Kalınlık ailenin kendi sürümünden geliyor; `fontWeight` özel yazı tipinde çalışmıyor
  // (CLAUDE.md §6). Önizlemedeki 600/500 ayrımının karşılığı bu iki aile.
  panelSatirBirincil: { fontFamily: YAZI.baslik },
  panelSatirIkincil: { fontFamily: YAZI.etiket, opacity: 0.82 },
  panelSatirPasif: { opacity: 0.38 },
  // Basılı geri bildirimi opaklıkla — karar belgesi §4 "sıcak seçili satır YOK" diyor,
  // yani basınca arkasında renkli bir şerit belirmiyor.
  panelSatirBasili: { opacity: 0.55 },
  // Sebep yazısı etiketin ALTINDA, akışta. Satırın yüksekliği `height` ile SABİTLENDİĞİ
  // için bu yazı yerleşimi kaydıramaz — ikisi birlikte satırın ortasına hizalanır.
  // (2026-08-01'de menüyü taşıran hata, alt yazının satır yüksekliğini büyütmesiydi;
  // burada yükseklik dışarıdan veriliyor, yazı ona karışamıyor.)
  panelSebep: {
    textAlign: 'center',
    fontFamily: YAZI.govde,
    color: MENU_RENK.yaziSolu,
    opacity: 0.6,
  },

  // ---- GREN (karar belgesi §3) ----
  // 128×128'lik gürültü karosu, tüm ekrana döşenip %10 opaklıkla bindiriliyor. Amaç
  // düz renk alanlarındaki bantlaşmayı kırmak — basılı bir haritanın kâğıt dokusu gibi.
  // `mixBlendMode` desteklenmeyen bir sürümde sessizce yok sayılır; doku yine görünür,
  // sadece bir tık daha açık durur.
  gren: { opacity: 0.1, mixBlendMode: 'multiply' },

  // ---- YAPIM DAMGASI (Görev 10 / Adım 0 — yalnızca geliştirmede, Görev 20 / Adım 0) ----
  // Soluk ve küçük: bir şey anlatmıyor, yalnızca "bu dosya çizildi" diyor. Konum
  // (top/bottom/left/right) kullanım yerinde veriliyor; burada yalnız görünüm var.
  damga: {
    position: 'absolute',
    fontFamily: YAZI.govde,
    fontSize: 10,
    color: YAZI_RENK.ikincil,
    opacity: 0.5,
    letterSpacing: 1,
  },
  // ⚠ PERDE TAMAMEN KALDIRILDI (2026-08-01, ikinci tur). Baki: *"soldaki butonların
  // olduğu bölmeye siyah bir arka plan falan yapmışsın, ekranın yarısına kadar o
  // engelliyor."* Haklıydı — perde okunabilirliği çözerken haritanın yarısını yiyordu.
  //
  // Okunabilirlik PERDEYLE DEĞİL YAZIYLA sağlanıyordu: her başlık ve düğme metninin
  // altında koyu bir gölge vardı.
  //
  // ---- GÖREV 10A / ADIM 6: GÖLGELER DE KALKTI ----
  // Gölgenin sebebi zemindi: koyu harita duvar kâğıdının üstünde açık yazı okunmuyordu.
  // Menü artık kâğıt zeminde (`ZEMIN.taban`) ve yazı koyu — arkasını karartacak bir şey
  // yok. Açık kâğıtta yazı gölgesi okunurluğa katkı vermiyor, yalnızca kir gibi duruyor.

  // ---- SOLA YATIK KOLON ----
  solKolon: { flex: 1, justifyContent: 'center', maxWidth: 520 },
  oyunAdi: {
    fontFamily: YAZI.baslik,
    color: YAZI_RENK.birincil,
    letterSpacing: 6,
  },
  oyunAlt: {
    fontFamily: YAZI.govde,
    fontSize: 12,
    color: YAZI_RENK.ikincil,
    letterSpacing: 1,
    marginTop: 2,
  },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 22,
    color: YAZI_RENK.birincil,
    letterSpacing: 3,
  },
  tusListesi: { marginTop: 10, gap: 0, alignItems: 'flex-start' },

  // `alignItems: 'baseline'`: etiket ile yanındaki küçük sebep yazısı AYNI temel çizgide
  // otursun. 'center' olsaydı iki farklı puntolu yazı birbirine göre kayardı.
  tus: { flexDirection: 'row', alignItems: 'baseline', paddingVertical: 7, gap: 10 },
  tusPasif: { opacity: 0.42 },
  // Sol kenardaki kısa pirinç çizgi — düğmelerin "sola yatık" hissini veren şey.
  // 18×2 → 10×1.5 (2026-08-01, Baki: *"tire'ler yani '-' bunlar biraz büyük"*).
  // İşaret, yazının yanında bir vurgu olmalı; yazıyla yarışan bir çizgi değil.
  cizgi: { width: 10, height: 1.5, backgroundColor: YAZI_RENK.ikincil },
  cizgiPasif: { backgroundColor: CIZGI.ayrac },
  // `cizgi` dikey ortada dursun: satır artık `baseline` hizalı, çizgi metin kutusu değil.
  tusMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 20,
    color: YAZI_RENK.birincil,
    letterSpacing: 2.4,
    flexShrink: 0,
  },
  tusMetinPasif: { color: YAZI_RENK.ikincil },
  // Etiketin YANINDA duran sebep yazısı. `flexShrink: 1` + `numberOfLines={1}`: dar
  // ekranda kısalır ama ASLA alt satıra düşmez — alt satıra düşse düğme uzar ve
  // düzeltilen taşma geri gelirdi.
  tusAlt: {
    fontFamily: YAZI.govde,
    fontSize: 10.5,
    lineHeight: 13,
    color: YAZI_RENK.ikincil,
    flexShrink: 1,
  },

  // ---- HAREKÂT ARŞİVİ KÂĞITTA (Görev 12 · "kâğıt = döküm" kuralı) ----
  // Kayıtlı maçlar listesi geçmişin DÖKÜMÜ: olmuş bitmiş maçları okuyorsun, karar
  // vermiyorsun. Kural gereği kâğıt. Bu aynı zamanda Görev 10A'dan kalan borcu da
  // kapatıyor — arşiv o günden beri "eski düz zeminde" duruyordu.
  yuva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 12,
    borderLeftWidth: 2,
    borderLeftColor: KAGIT.cizgi,
    alignSelf: 'stretch',
    // Yuva satırı ÇOK BİLGİ taşıyor (mod, tur, ilerleme); gölge yetmiyor, zemin gerekiyor.
    backgroundColor: KAGIT.yuzey,
  },
  // EĞİTİM — ekranın sağ üstünde, panelden bağımsız. Köşe parantezi menü panelinin
  // dilinden geliyor; zemin yarı saydam ki harita altından görünmeye devam etsin.
  kose: { position: 'absolute', alignItems: 'flex-end', gap: 8 },
  egitim: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: MENU_RENK.yaziSolu,
    borderRadius: 4,
  },
  egitimMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    color: MENU_RENK.yazi,
  },
  // Rütbe düğmenin yazısından sessiz: MÜHÜRLER bir eylem, rütbe bir durum.
  rutbe: { fontFamily: YAZI.govde, fontSize: 11, letterSpacing: 0, color: MENU_RENK.yaziSolu },
  yuvaBos: { borderLeftColor: KAGIT.cizgi, opacity: 0.55 },
  // Bilgi sütunu esner, düğmeler sabit kalır: uzun kapsam adı düğmeleri ekrandan itmesin.
  yuvaBilgi: { flex: 1, minWidth: 0 },
  yuvaTuslar: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  yuvaIkon: { padding: 6 },
  yuvaIkonPasif: { opacity: 0.4 },
  yuvaBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 15,
    color: KAGIT.yazi,
    letterSpacing: 1.4,
  },
  yuvaAlt: { fontFamily: YAZI.govde, fontSize: 11.5, color: KAGIT.yaziIkincil, marginTop: 2 },
  yuvaHata: { fontFamily: YAZI.govde, fontSize: 11.5, color: KAGIT.eksi, marginTop: 2 },

  // Mod ekranının stilleri Adım 6'da `ModSecimi.js`'e taşındı — burada mod stili kalmadı.
});
