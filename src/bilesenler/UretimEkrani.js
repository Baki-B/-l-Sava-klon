// ÜRETİM EKRANI — doğrudan birim satın alma (Görev 04 / Adım 4, tasarım §4.2).
//
// Oyuncu ne dizdiyse motor TAM OLARAK onu üretir. Harmanlama, oran seçici, "uygun karışım
// önerisi" YOK — eski oran sisteminin kalıntısı kalmasın.
//
// TASARIM BELGESİNİN ÖZEL İSTEĞİ: bütçe yetmeyince hata mesajı ÇIKMAZ, o satırın [+] tuşu
// sessizce söner. Sebebi: her tıklamada uyarı çıkan ekran oyuncuyu yorar ve uyarıları
// okunmaz hâle getirir. Sönük tuş zaten "buraya param yetmiyor" diyor.
// Tek istisna SANAYİ SINIRI — o görünmeyen bir kural olduğu için yazıyla açıklanır.
//
// YERLEŞİM: ekranı kaplamaz, ORTADA bir kutu olarak durur ve arkayı KARARTMAZ.
// Sebebi görev belgesinde: "nereye asker bastığını görmeden karar vermek zor" — oyuncu
// haritayı görmeye devam etmeli. (Tur onayı farklı: orada arka bilerek kararıyor.)
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PANEL, YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';
import { useOlcek } from '../olcu';
import { DENGE } from '../denge';
import { siparisMaliyeti, birimSayisi, eklenebilirMi } from '../oyun/ordu';
import { Parilti } from './Ipucu';

const BOS = {};

export default function UretimEkrani({
  parcaAd,
  ilAd,
  havuz, // { nufus, ekonomi } — aşağı yuvarlanmış (ekranda görünen) bütçe
  hak, // { sinir, kullanilan, kalan } — ilin bu turluk sanayi hakkı
  statlar, // araştırmayla kaydırılmış birim tablosu (Görev 06); yoksa temel tablo
  onUret, // (siparis) => void
  onKapat,
  // EĞİTİM (GOREV-20 Adım 8): açıkken önce basılabilen ilk birimin [+] tuşu, sipariş dizilince
  // ÜRET parlıyor.
  ipucu,
}) {
  const { telefon } = useOlcek();
  const [siparis, setSiparis] = useState(BOS);

  const bedel = useMemo(() => siparisMaliyeti(siparis), [siparis]);
  const adet = birimSayisi(siparis);
  const kalan = { nufus: havuz.nufus - bedel.nufus, ekonomi: havuz.ekonomi - bedel.ekonomi };

  // Her satır için [+] açık mı, değilse neden? (Kural `ordu.js`'ten geliyor.)
  const satirlar = DENGE.BIRIM_SIRASI.map((tur) => ({
    tur,
    // Basacağın birim, ARAŞTIRMANLA kaydırılmış hâliyle görünür: zırh araştırması yapan
    // oyuncu üretim ekranında "zırh 2" değil "zırh 4" görmeli, yoksa araştırmanın işe
    // yaradığını hiçbir yerde göremez (§9/5).
    birim: (statlar && statlar[tur]) || DENGE.BIRIMLER[tur],
    sayi: siparis[tur] || 0,
    ekle: eklenebilirMi(tur, siparis, havuz, hak.kalan),
  }));

  // Sanayi hakkı bitmesi ile bütçenin yetmemesi AYRI durumlar — oyuncuya farklı şey
  // söylenmeli. Önce hak bakılır, sonra bütçe (§9: "boş liste gösterme").
  const hakBitti = hak.kalan <= 0;
  const hicYetmiyor = !hakBitti && adet === 0 && satirlar.every((r) => !r.ekle.ok);

  // Sanayi sınırına dayandık mı? (Bütçe değil, sınır engelliyorsa yazıyla söylenir.)
  const sanayiEngeli = !hakBitti && satirlar.some((s) => !s.ekle.ok && s.ekle.kod === 'sanayi');
  // Eğitimde parlayan [+]: bütçenin yettiği ilk birim (sipariş boşken).
  const parlayanTur =
    ipucu && adet === 0 ? (satirlar.find((r) => r.ekle.ok) || {}).tur || null : null;

  function degistir(tur, fark) {
    setSiparis((s) => {
      const yeni = { ...s, [tur]: Math.max(0, (s[tur] || 0) + fark) };
      if (yeni[tur] === 0) delete yeni[tur];
      return yeni;
    });
  }

  return (
    <View style={s.tabaka} pointerEvents="box-none">
      {/* Dışarı dokunmak kapatır. Şeffaf — harita görünmeye devam etsin. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onKapat} />

      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatir}>
          <View style={{ flexShrink: 1 }}>
            <Text style={s.baslik}>ASKER BAS</Text>
            <Text style={s.yer} numberOfLines={1}>
              {parcaAd}
              {ilAd ? <Text style={s.yerIl}> · {ilAd}</Text> : null}
            </Text>
          </View>
          <Pressable onPress={onKapat} hitSlop={12} style={s.kapat}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <View style={s.butceSatir}>
          <Text style={s.butceEtiket}>BÜTÇE</Text>
          <Text style={s.butceDeger}>
            {havuz.nufus} nüfus / {havuz.ekonomi} ekonomi
          </Text>
        </View>

        <View style={s.ayrac} />

        {hakBitti ? (
          <Text style={s.uyari}>
            Bu ilin sanayisi bu tur doldu ({hak.kullanilan}/{hak.sinir}). Turu bitirince
            yenilenecek.
          </Text>
        ) : hicYetmiyor ? (
          <Text style={s.uyari}>
            Bütçen hiçbir birime yetmiyor. Turu bitirip kaynak biriktirmen gerek.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={s.liste}>
            {satirlar.map(({ tur, birim, sayi, ekle }) => (
              <View key={tur} style={s.satir}>
                <View style={s.satirSol}>
                  <Text style={s.birimAd}>{birim.ad}</Text>
                  <Text style={s.birimBedel}>
                    {birim.nufus} nüfus / {birim.ekonomi} ekonomi
                  </Text>
                </View>
                <View style={s.sayac}>
                  <Pressable
                    onPress={() => degistir(tur, -1)}
                    disabled={sayi === 0}
                    hitSlop={6}
                    style={[s.tus, sayi === 0 && s.tusPasif]}
                  >
                    <Text style={[s.tusMetin, sayi === 0 && s.tusMetinPasif]}>−</Text>
                  </Pressable>
                  <Text style={s.sayi}>{sayi}</Text>
                  <Parilti acik={parlayanTur === tur}>
                    <Pressable
                      onPress={() => degistir(tur, +1)}
                      disabled={!ekle.ok}
                      hitSlop={6}
                      style={[s.tus, !ekle.ok && s.tusPasif]}
                    >
                      <Text style={[s.tusMetin, !ekle.ok && s.tusMetinPasif]}>+</Text>
                    </Pressable>
                  </Parilti>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Sanayi sınırı GÖRÜNMEYEN bir kural — tuş neden sönük, yazıyla söylenir. */}
        {sanayiEngeli && (
          <Text style={s.sanayi}>
            Sanayi sınırı: {hak.kullanilan + adet}/{hak.sinir} — bu ilde bu tur bu kadar.
          </Text>
        )}

        <View style={s.ayrac} />

        <View style={s.altSatir}>
          <View style={{ flexShrink: 1 }}>
            <Text style={s.kalanEtiket}>KALAN</Text>
            <Text style={s.kalanDeger}>
              {kalan.nufus} nüfus / {kalan.ekonomi} ekonomi
            </Text>
          </View>
          <Parilti acik={!!ipucu && adet > 0}>
            <Pressable
              onPress={() => onUret(siparis)}
              disabled={adet === 0}
              style={[s.uret, adet === 0 && s.uretPasif]}
            >
              <Text style={[s.uretMetin, adet === 0 && s.uretMetinPasif]}>
                {adet === 0 ? 'ÜRET' : 'ÜRET · ' + adet}
              </Text>
            </Pressable>
          </Parilti>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  kutu: {
    width: 380,
    maxWidth: '86%',
    maxHeight: '92%',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  // Yatay telefonda yükseklik kıt (~412 dp) — kutu dikeyde sıkılaşır.
  kutuDar: { width: 330, paddingVertical: 11, paddingHorizontal: 13 },

  baslikSatir: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 12.5,
    letterSpacing: 2.2,
    color: YAZI_RENK.birincil,
  },
  yer: { fontFamily: YAZI.govdeKalin, fontSize: 14, color: YAZI_RENK.birincil, marginTop: 2 },
  yerIl: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },
  kapat: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  kapatX: { fontSize: 23, color: YAZI_RENK.ikincil, lineHeight: 25 },

  butceSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  butceEtiket: {
    fontFamily: YAZI.etiket,
    fontSize: 10.5,
    letterSpacing: 1,
    color: YAZI_RENK.ikincil,
  },
  butceDeger: { fontFamily: YAZI.sayi, fontSize: 14, color: YAZI_RENK.birincil },

  ayrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: 10 },

  liste: { flexGrow: 0 },
  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  satirSol: { flexShrink: 1, paddingRight: 10 },
  birimAd: { fontFamily: YAZI.govdeKalin, fontSize: 14, color: YAZI_RENK.birincil },
  birimBedel: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil, marginTop: 1 },

  sayac: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tus: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
  },
  // Pasif tuş: sönük ama YERİNDE durur — kaybolursa satırlar zıplar, oyuncu şaşırır.
  tusPasif: { backgroundColor: 'transparent', borderColor: CIZGI.ayrac },
  tusMetin: { fontFamily: YAZI.sayi, fontSize: 19, lineHeight: 22, color: YAZI_RENK.birincil },
  tusMetinPasif: { color: YAZI_RENK.soluk },
  sayi: {
    minWidth: 26,
    textAlign: 'center',
    fontFamily: YAZI.sayi,
    fontSize: 16,
    color: YAZI_RENK.birincil,
  },

  uyari: {
    fontFamily: YAZI.govde,
    fontSize: 12.5,
    lineHeight: 18,
    color: YAZI_RENK.ikincil,
    paddingVertical: 6,
  },
  sanayi: { fontFamily: YAZI.govdeKalin, fontSize: 11.5, color: DURUM.eksi, marginTop: 6 },

  altSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  kalanEtiket: {
    fontFamily: YAZI.etiket,
    fontSize: 10.5,
    letterSpacing: 1,
    color: YAZI_RENK.ikincil,
  },
  kalanDeger: { fontFamily: YAZI.sayi, fontSize: 14, color: DURUM.arti, marginTop: 2 },
  uret: {
    backgroundColor: YAZI_RENK.birincil,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 17,
  },
  uretPasif: { backgroundColor: ZEMIN.cukur, borderWidth: 1, borderColor: CIZGI.ayrac },
  uretMetin: { fontFamily: YAZI.baslik, fontSize: 12, letterSpacing: 0.8, color: ZEMIN.taban },
  uretMetinPasif: { color: YAZI_RENK.soluk },
});
