// Sağ üst tur çubuğu (Palet A). Gösterilen her sayı GERÇEK oyun durumundan gelir.
// Havuz = birikmiş kaynak, yeşil sayı = tur başına gelen. İkisi ayrı gösterilir:
// oyuncunun asıl merak ettiği "bu tur ne kazanıyorum" sorusudur.
//
// TELEFONDA DARALIR: küçük ekranda çubuk haritayı boğmasın diye yazılar ve boşluklar
// küçülür, düğme "BİTİR" olur. Tablette geniş hâli kullanılır (bkz. src/olcu.js).
//
// TEKRARLA DÜĞMESİ KALDIRILDI (2026-07-30, Baki: "gerek yok"). Görev 04'te eklenmişti;
// hareket geldikten sonra turun asıl işi asker basmak değil asker SÜRMEK oldu. Yeri
// EMİRLER sayacına verildi.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PANEL, YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';
import { IkonArastirma, IkonDiplomasi } from './Ikonlar';
import { havuzYaz, gelirYaz } from '../bicim';
import { useOlcek } from '../olcu';
// YAPIM DAMGASI (Görev 10 / Adım 0). Yalnızca geliştirmede çiziliyor (Görev 20 / Adım 0).
import { DENGE } from '../denge';

// sagBosluk: sağdaki ayarlar düğmesine yer bırakmak için kaydırma miktarı (piksel).
// ozet: { parca, toplamParca, tamIl } — elindeki toprak.
// onOlcu: çubuğun yüksekliğini bildirir (ayarlar düğmesi aynı kalınlıkta dursun diye).
export default function TurCubugu({
  tur,
  nufusHavuzu,
  ekonomiHavuzu,
  gelir,
  ozet,
  sagBosluk = 0,
  onOlcu,
  onTuruBitir,
  emirSayisi, // bu tur bekleyen emir sayısı (Görev 05) — 0 ise düğme çıkmaz
  onEmirler,
  arastirmaPuani, // biriken araştırma puanı (Görev 06) — düğmenin altında görünür
  onArastirma,
  // HEDEF GÖSTERGESİ (Görev 09 / §6/12: "görünmeyen hedef hedef değildir").
  // Metin `oyun/mod.js hedefDurumu`'ndan geliyor; burada kurulmuyor — ekranda yazan
  // ilerleme ile maçı bitiren ilerleme aynı hesaptan çıkmak zorunda.
  // İLERLEME: kaç bölgem var, kaçta kazanıyorum, kaç tur kaldı. Üçü de tek satırda,
  // çubuğun içinde — ayrı bir şerit çubuğu büyütüyordu (2026-08-01).
  hedefEsigi,
  hedefKalanTur,
  onDiplomasi,
  diplomasiRozeti, // bekleyen teklif sayısı — 0 ise rozet çıkmaz
}) {
  const insets = useSafeAreaInsets();
  const { telefon } = useOlcek();
  const b = telefon ? dar : genis;

  return (
    // ┌─ İKİ KATLI YERLEŞİM (2026-08-01, Baki: "sağ üstteki diplomasi ve 'Fetih: 4/181
    // │  bölge' falan bunlar çok kötü duruyor") ────────────────────────────────────────┐
    // │ İlk sürümde ikisi de ÇUBUĞUN İÇİNE konmuştu; çubuk `flexDirection: 'row'` olduğu │
    // │ için hedef yazısı ve diplomasi düğmesi öteki bölmelerin arasına sıkışıp ezildi.  │
    // │                                                                                  │
    // │ Şimdi hedef ÇUBUĞUN ÜSTÜNDE kendi şeridinde, diplomasi ise çubuğun kendi         │
    // │ bölmelerinden biri (emir ve araştırma ile aynı kalıp). Hedef bir DURUM, düğme    │
    // │ bir EYLEM — ikisi aynı kutuda yaşamamalıydı.                                     │
    // └──────────────────────────────────────────────────────────────────────────────────┘
    <View style={[s.sarmal, { top: insets.top + 8, right: insets.right + 12 + sagBosluk }]}>
      {/* ⚠ ÖLÇÜ ÇUBUĞUN KENDİSİNDEN ALINIYOR, SARMALDAN DEĞİL (Baki, 2026-08-03:
          "ayarlar düğmesi çarkı tur sekmesi ile aynı boyutta olsun uzunluk olarak").
          Ölçü sarmaldaydı ve sarmal çubuğun ALTINDAKİ yapım damgasını da kapsıyordu —
          ayarlar dişlisi bu yüzden çubuktan damga kadar uzun çiziliyordu. */}
      <View style={s.bar} onLayout={(e) => onOlcu && onOlcu(e.nativeEvent.layout.height)}>
        {/* DİPLOMASİ — araştırma gibi HER ZAMAN duruyor: giriş görünmezse oyuncu
            diplomasinin varlığını fark etmez. Bekleyen teklif sayısı altında yazıyor.

            ---- TELEFONDA YAZI DEĞİL İKON (Baki, 2026-08-03) ----
            *"Diplomasi için bir el sıkışma simgesi olsun; o kısımdaki 'DİPL' yazısı
            hoşuma gitmedi."* Kısaltma zaten kelimenin yarısıydı ve hiçbir şey
            anlatmıyordu. Tablette yer var, tam kelime duruyor. */}
        {onDiplomasi ? (
          <Pressable style={[s.emir, b.emir]} onPress={onDiplomasi}>
            {telefon ? (
              <IkonDiplomasi size={19} color={YAZI_RENK.birincil} />
            ) : (
              <Text style={[s.emirBaslik, b.emirBaslik]}>DİPLOMASİ</Text>
            )}
            {!telefon && (
              <Text style={[s.emirAlt, b.kucuk]} numberOfLines={1}>
                {diplomasiRozeti > 0 ? diplomasiRozeti + ' teklif bekliyor' : 'anlaşma ve ateşkes'}
              </Text>
            )}
            {/* Telefonda ikon tek başına duruyor; bekleyen teklif sayısı yazıyla değil
                küçük bir rakamla veriliyor — yer yok, ama sayı kaybolmamalı. */}
            {telefon && diplomasiRozeti > 0 ? (
              <Text style={[s.emirAlt, b.kucuk]}>{diplomasiRozeti}</Text>
            ) : null}
          </Pressable>
        ) : null}

        {/* EMİRLER — bekleyen emir varken çıkar, listeyi ve iptal düğmelerini açar.
          Çubuğun içinde duruyor: yatayda yükseklik kıt, ekranda ayrı düğme yüzmesin. */}
        {onEmirler && emirSayisi > 0 && (
          <Pressable style={[s.emir, b.emir]} onPress={onEmirler}>
            <Text style={[s.emirBaslik, b.emirBaslik]}>EMİR {emirSayisi}</Text>
            {!telefon && (
              <Text style={[s.emirAlt, b.kucuk]} numberOfLines={1}>
                turu bitirince işlenir
              </Text>
            )}
          </Pressable>
        )}

        {/* ARAŞTIRMA (Görev 06) — emir düğmesinin aksine HER ZAMAN duruyor: araştırma
          görünmez bir güç, girişi de görünmezse oyuncu varlığını hiç fark etmez.
          Biriken puan düğmenin üstünde yazıyor ki "girip bakmaya değer mi" belli olsun. */}
        {onArastirma && (
          <Pressable style={[s.emir, b.emir, s.arastirmaKutu]} onPress={onArastirma}>
            {/* Şişe ikonu yazının yerini alıyor: telefonda "ARŞ" diye kısaltma okunmuyordu,
              ikon her boyutta anlaşılıyor ve puanın yanında durunca cümle kuruyor. */}
            <IkonArastirma size={telefon ? 15 : 19} color={YAZI_RENK.birincil} sivi={ZEMIN.yuzey} />
            <View style={{ flexShrink: 1 }}>
              <Text style={[s.arastirmaBaslik, b.emirBaslik]}>
                {Math.floor(arastirmaPuani || 0)} PUAN
              </Text>
              {!telefon && (
                <Text style={[s.emirAlt, b.kucuk]} numberOfLines={1}>
                  araştırma
                </Text>
              )}
            </View>
          </Pressable>
        )}

        <View style={[s.turKutu, b.turKutu]}>
          <Text style={[s.turAd, b.turAd]}>TUR</Text>
          <Text style={[s.turNo, b.turNo]}>{String(tur).padStart(2, '0')}</Text>
        </View>

        <View style={[s.kaynaklar, b.kaynaklar]}>
          <Text style={[s.kaynak, b.kaynak]}>
            {havuzYaz(nufusHavuzu)} <Text style={[s.kaynakAlt, b.kucuk]}>nüfus</Text>{' '}
            <Text style={[s.artis, b.kucuk]}>+{gelirYaz(gelir.nufus)}</Text>
          </Text>
          <Text style={[s.kaynak, b.kaynak]}>
            {havuzYaz(ekonomiHavuzu)} <Text style={[s.kaynakAlt, b.kucuk]}>ekonomi</Text>{' '}
            <Text style={[s.artis, b.kucuk]}>+{gelirYaz(gelir.ekonomi)}</Text>
          </Text>
          {/* ---- İLERLEME (2026-08-01, ikinci tur) ----
              Baki: *"3/181 bölge 150 tur kaldı kısmını kaldıralım, küçük bir şekilde kaç
              parçadan kaçı bizde onu görebilelim; o tur bölmesinin olduğu yer çok
              büyümesin fakat okunaklılık sınırında da kalsın."*

              Ayrı hedef şeridi kalktı; sayı ÇUBUĞUN İÇİNDEKİ bu satıra taşındı. Zaten
              burada "kaç bölgem var" yazıyordu — eklenen tek şey EŞİK (kaçta kazanırsın)
              ve kalan tur. Çubuk bir satır bile büyümedi. */}
          <Text style={[s.toprak, b.toprak]} numberOfLines={1}>
            <Text style={s.toprakSayi}>{ozet.parca}</Text>
            {'/' + (hedefEsigi || ozet.toplamParca) + ' bölge'}
            {hedefKalanTur != null ? '  ·  ' + hedefKalanTur + ' tur' : ''}
          </Text>
        </View>

        {/* TURU BİTİR artık sağ altta büyük yuvarlak düğme (Görev 21 · U2,
            `TurBitirDugmesi.js`). Burada yalnızca `onTuruBitir` verilirse çıkıyor. */}
        {onTuruBitir ? (
          <Pressable style={[s.bitir, b.bitir]} onPress={onTuruBitir}>
            <Text style={[s.bitirMetin, b.bitirMetin]}>{telefon ? 'BİTİR' : 'TURU BİTİR'}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* YAPIM DAMGASI (Görev 10 / Adım 0). Çubuğun ALTINDA, sağa yaslı — sarmal zaten
          `alignItems: 'flex-end'`. Metin BU DOSYADA kuruluyor: kanıtlanmak istenen şey
          "oyun içi çubuğu çizen dosya bu dosya mı" sorusu, ortak bir damga bileşeni onu
          kanıtlamazdı. Ölçünün dışında kalıyor (yukarıdaki `onLayout` notu).
          YALNIZCA GELİŞTİRMEDE (Görev 20 / Adım 0, CLAUDE.md §5/10): yayın paketinde
          `__DEV__` false, damga oyuncuya hiç görünmez. */}
      {__DEV__ ? <Text style={s.damga}>{'tur:' + DENGE.YAPIM}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  // Dış sarmal konumu taşıyor; içindeki iki kat (hedef şeridi + çubuk) sağa yaslı.
  sarmal: { position: 'absolute', alignItems: 'flex-end' },
  // YAPIM DAMGASI (Görev 10 / Adım 0 — yalnızca geliştirmede). 10 punto, soluk.
  damga: {
    fontFamily: YAZI.govde,
    fontSize: 10,
    color: YAZI_RENK.ikincil,
    opacity: 0.5,
    letterSpacing: 1,
    marginTop: 3,
    marginRight: 2,
  },
  // Sahip olunan bölge sayısı VURGULU, gerisi soluk: göz önce "kaçım var"a düşsün.
  toprakSayi: { color: YAZI_RENK.birincil, fontFamily: YAZI.baslik },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  turKutu: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: CIZGI.ince,
  },
  turAd: { fontFamily: YAZI.etiket, letterSpacing: 2, color: YAZI_RENK.ikincil },
  turNo: { fontFamily: YAZI.baslik, color: YAZI_RENK.birincil },
  kaynaklar: {
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: CIZGI.ince,
  },
  kaynak: { fontFamily: YAZI.sayi, color: YAZI_RENK.birincil },
  toprak: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },
  artis: { fontFamily: YAZI.govdeKalin, color: DURUM.arti },
  kaynakAlt: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },
  bitir: { backgroundColor: YAZI_RENK.birincil, alignItems: 'center', justifyContent: 'center' },
  bitirMetin: { fontFamily: YAZI.baslik, letterSpacing: 0.5, color: ZEMIN.taban },
  // Emirler — çubuğun en solunda, kırmızı vurgulu: bekleyen bir iş olduğunu söylüyor.
  emir: {
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
  },
  emirBaslik: { fontFamily: YAZI.baslik, letterSpacing: 0.6, color: DURUM.eksi },
  // Araştırma kırmızı DEĞİL pirinç: emir kırmızısı "bu tur çözülecek bir iş var" demek,
  // araştırma ise sürekli açık bir kapı. İki düğme yan yana duruyor, karışmasınlar.
  arastirmaBaslik: { fontFamily: YAZI.baslik, letterSpacing: 0.6, color: YAZI_RENK.birincil },
  // İkon ile yazı yan yana; ikonun sıvısı panel zemini olduğu için kutu zemini de o.
  arastirmaKutu: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  emirAlt: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 1 },
});

// Tablet / geniş ekran — ferah hâli.
const genis = StyleSheet.create({
  turKutu: { minWidth: 64, paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  turAd: { fontSize: 9.5 },
  turNo: { fontSize: 22, lineHeight: 24 },
  kaynaklar: { paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  kaynak: { fontSize: 11.5, lineHeight: 15 },
  kucuk: { fontSize: 10 },
  toprak: { fontSize: 10, lineHeight: 13, marginTop: 3 },
  bitir: { paddingHorizontal: 16 },
  bitirMetin: { fontSize: 11 },
  emir: { paddingHorizontal: 13, maxWidth: 150 },
  emirBaslik: { fontSize: 10 },
});

// Telefon — dar hâli. Harita mümkün olduğunca açıkta kalsın.
const dar = StyleSheet.create({
  turKutu: { minWidth: 42, paddingHorizontal: 7, paddingVertical: 6, gap: 0 },
  turAd: { fontSize: 8 },
  turNo: { fontSize: 16, lineHeight: 18 },
  kaynaklar: { paddingHorizontal: 9, paddingVertical: 6, gap: 2 },
  kaynak: { fontSize: 10, lineHeight: 13 },
  kucuk: { fontSize: 8.5 },
  toprak: { fontSize: 8.5, lineHeight: 11, marginTop: 2 },
  bitir: { paddingHorizontal: 9 },
  bitirMetin: { fontSize: 9.5, letterSpacing: 0.3 },
  // Telefonda alt satır hiç çizilmiyor (yukarıda `!telefon`), yalnızca etiket kalıyor.
  emir: { paddingHorizontal: 8 },
  emirBaslik: { fontSize: 8.5, letterSpacing: 0.2 },
});
