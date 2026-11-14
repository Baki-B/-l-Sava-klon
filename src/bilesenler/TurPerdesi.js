// TUR İŞLENİYOR PERDESİ ve OYUN SONU KUTUSU (Görev 07 / Adım 6a ve 6c).
//
// ---- PERDE ----
// Dünya artık kendi kendine oynuyor: TURU BİTİR'e basınca 80 aktör karar veriyor, emirler
// çözülüyor, muharebeler işleniyor. Geliştirme makinesinde ~40 ms, telefonda birkaç kat
// fazla. Perde olmadan oyuncu kısa bir donma görür ve ne olduğunu anlamaz.
//
// ⚠ HARİTA JESTİ AYRICA SUSTURULUYOR. Görev 05 ve 06'da iki kez yaşandı: React Native'de
// ÜSTTEKİ KUTU, YEREL KATMANDAKİ HARİTA JESTİNİ ENGELLEMEZ. Perde arkadaki dokunmayı
// yutuyor ama haritanın kendi jesti `Harita.js dokunmaKapali` ile ayrıca kapatılıyor
// (App.js bu perde açıkken bayrağı kaldırıyor) — savaş odasındaki kalıbın aynısı.
//
// ---- OYUN SONU (Görev 09 / Adım 5) ----
// KARARIN KENDİSİ BURADA DEĞİL, `oyun/mod.js sonucKontrol`'de; başlık ve cümle de orada
// (`sonucMetni`). Bu bileşen yalnızca çiziyor.
//
// Metin neden motorda: kazanma koşulu MODA GÖRE değişiyor ve cümle de öyle ("181 bölge
// senin" ile "süre doldu, en büyük güç sendin" aynı ekran değil). Cümleyi burada
// kurmak, kazanma kuralını ikinci kez — üstelik ekranda — yazmak olurdu (§10/4).
//
// "DEVAM ET" SEÇENEĞİ (§6/7): kazanan oyuncu haritayı temizlemeye devam edebilir. Kayıt
// kazanıldı işaretiyle duruyor, yani maç bir daha kazanılmıyor ama oynanabiliyor.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, DURUM, KAGIT, BOSLUK, KOSE } from '../tema';
import { useOlcek } from '../olcu';

export function TurPerdesi() {
  const { telefon } = useOlcek();
  return (
    <View style={s.tabaka} pointerEvents="auto">
      <View style={s.perde} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <ActivityIndicator size="small" color={YAZI_RENK.birincil} />
        <Text style={[s.baslik, telefon && s.baslikDar]}>TUR İŞLENİYOR</Text>
        <Text style={[s.alt, telefon && s.altDar]}>Rakipler hamlelerini yapıyor…</Text>
      </View>
    </View>
  );
}

// `sonuc`: { kazandin, parca, toplam } — oyunKancasi.oyunSonu
export function OyunSonu({ sonuc, istatistik, onKapat, onMenu }) {
  const { telefon } = useOlcek();
  const kazandi = sonuc.kazandin;
  const metin = sonuc.metin || {};
  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, s.sonKutu, telefon && s.kutuDar]}>
        <Text style={[s.sonBaslik, kazandi ? s.kazandi : s.kaybetti]}>
          {metin.baslik || (kazandi ? 'KAZANDIN' : 'YENİLDİN')}
        </Text>
        <Text style={[s.sonMetin, telefon && s.altDar]}>{metin.alt || ''}</Text>

        {/* ---- MAÇ İSTATİSTİĞİ (Görev 12 / Adım 11) ----
            Eskiden burada tek satır vardı ("X/Y bölge senin oldu") ve 90 turluk bir maçın
            tamamı o cümleye sığıyordu. Sayılar `durum.sayaclar`dan geliyor; tablo
            `sayac.js macOzeti`'nde kuruluyor — ekran cümle uydurmuyor. */}
        {istatistik && istatistik.length > 0 ? (
          <View style={s.istatistik}>
            {istatistik.map(([etiket, deger]) => (
              <View key={etiket} style={s.istatistikSatir}>
                <Text style={s.istatistikEtiket}>{etiket}</Text>
                <Text style={s.istatistikDeger}>{deger}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={[s.sonOzet, telefon && s.altDar]}>
          {sonuc.parca}/{sonuc.toplam} bölge senin oldu.
        </Text>
        <View style={s.sonTuslar}>
          <Pressable style={s.sonTus} onPress={onMenu}>
            <Text style={s.sonTusMetin}>ANA MENÜ</Text>
          </Pressable>
          <Pressable style={[s.sonTus, s.sonTusIkincil]} onPress={onKapat}>
            <Text style={[s.sonTusMetin, s.sonTusMetinIkincil]}>DEVAM ET</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // ---- HÜKÜM MAVİ, KAYIT KÂĞIT (Görev 12 · "kâğıt = döküm" kuralı) ----
  // "KAZANDIN" bir ANDIR: dramatik, mavi kalıyor. Altındaki sicil tablosu ise maçın
  // DÖKÜMÜ — kâğıt bir karta basılıyor. Aynı ekranda iki yüzey görünüyor ve kural tam da
  // burada kendini öğretiyor: yaptığın şey mavi, olmuş bitmiş şey kâğıt.
  istatistik: {
    alignSelf: 'stretch',
    marginTop: 14,
    paddingVertical: BOSLUK.dar,
    paddingHorizontal: BOSLUK.orta,
    backgroundColor: KAGIT.yuzey,
    borderRadius: KOSE.dugme,
    gap: 2,
  },
  istatistikSatir: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  istatistikEtiket: {
    width: 96,
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    lineHeight: 15,
    letterSpacing: 0.8,
    color: KAGIT.yaziSoluk,
  },
  istatistikDeger: {
    flex: 1,
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 15,
    color: KAGIT.yazi,
  },
  sonOzet: { fontFamily: YAZI.govde, fontSize: 13, color: YAZI_RENK.ikincil, marginTop: 2 },
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.orta },
  kutu: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 22,
    paddingHorizontal: 34,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 14,
  },
  kutuDar: { paddingVertical: 16, paddingHorizontal: 24 },
  baslik: { fontFamily: YAZI.baslik, fontSize: 13, letterSpacing: 2.4, color: YAZI_RENK.birincil },
  baslikDar: { fontSize: 11 },
  alt: { fontFamily: YAZI.govde, fontSize: 12.5, color: YAZI_RENK.ikincil },
  altDar: { fontSize: 11 },

  sonKutu: { maxWidth: 460, gap: 12 },
  sonBaslik: { fontFamily: YAZI.baslik, fontSize: 22, letterSpacing: 3 },
  kazandi: { color: DURUM.arti },
  kaybetti: { color: DURUM.eksi },
  sonMetin: {
    fontFamily: YAZI.govde,
    fontSize: 13.5,
    color: YAZI_RENK.birincil,
    textAlign: 'center',
    lineHeight: 19,
  },
  sonTuslar: { flexDirection: 'row', gap: 10, marginTop: 4 },
  sonTus: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    backgroundColor: ZEMIN.cukur,
  },
  sonTusIkincil: { borderColor: CIZGI.ayrac, backgroundColor: 'transparent' },
  sonTusMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    letterSpacing: 1.5,
    color: YAZI_RENK.birincil,
  },
  sonTusMetinIkincil: { color: YAZI_RENK.ikincil },
});
