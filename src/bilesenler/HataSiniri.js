// HATA SINIRI — ÇÖKME KORUMASI (Görev 12 / Adım 6).
//
// NEDEN VAR: React'te bir bileşen çizim sırasında hata verirse React BÜTÜN AĞACI söker.
// Ekran bembeyaz kalır, hiçbir yazı çıkmaz, uygulama kapanmaz da — oyuncu telefonu
// kapatıp açmaktan başka bir şey yapamaz ve neyin olduğunu asla öğrenemez.
//
// Kayıt katmanında koruma zaten vardı (`kayit.js` her okuma/yazmayı try/catch içinde
// yapıyor); ekran tarafında hiç yoktu. Yayına çıkacak bir oyunun bunsuz gitmesi olmaz.
//
// ⚠ HATA SINIRI SINIF BİLEŞENİ OLMAK ZORUNDA. `componentDidCatch` / `getDerivedStateFromError`
// kancalarla YAZILAMAZ — React bunun için hook vermiyor. Projede React.Component kullanan
// tek yer burası ve sebebi bu.
//
// NE YAPMAZ: hatayı düzeltmez, oyunu kurtarmaz. Yaptığı tek şey ekranı ayakta tutmak ve
// oyuncuya bir çıkış kapısı göstermek. Kaydedilmiş maç diskte duruyor; "YENİDEN BAŞLAT"
// uygulamayı sıfırdan kurar ve oyuncu yuvasından devam eder.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM, BOSLUK, KOSE } from '../tema';
import { DENGE } from '../denge';

export default class HataSiniri extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hata: null, ayrinti: null };
  }

  static getDerivedStateFromError(hata) {
    return { hata };
  }

  componentDidCatch(hata, bilgi) {
    // Geliştirici modunda yığın izini ekranda gösteriyoruz — Baki telefonda deniyor ve
    // "ekran beyaz oldu" demek yerine hatanın kendisini okuyup gönderebilsin.
    this.setState({ ayrinti: (bilgi && bilgi.componentStack) || String(hata) });
  }

  render() {
    if (!this.state.hata) return this.props.children;

    return (
      <View style={s.zemin}>
        <View style={s.kutu}>
          <Text style={s.baslik}>BİR ŞEYLER TERS GİTTİ</Text>
          <Text style={s.metin}>
            Oyun beklenmedik bir hatayla karşılaştı ve bu ekranı gösterdi. Kaydettiğin maçlar
            yerinde duruyor; uygulamayı yeniden başlatınca kaldığın yuvadan devam edebilirsin.
          </Text>
          <Text style={s.metinIkincil}>
            Bu ekranı gördüysen hata gerçek bir kusurdur — ne yaptığını hatırlıyorsan not et, aynı
            adımlar hatayı tekrar üretir.
          </Text>

          {DENGE.GELISTIRICI_MODU && this.state.ayrinti ? (
            <ScrollView style={s.ayrintiKutu}>
              <Text style={s.ayrintiMetin}>{String(this.state.hata)}</Text>
              <Text style={s.ayrintiMetin}>{this.state.ayrinti}</Text>
            </ScrollView>
          ) : null}

          {/* Tek düğme: durumu sıfırlayıp yeniden çizmeyi dener. Hata kalıcıysa aynı ekran
              geri gelir — bu da bir bilgidir, sessiz beyaz ekrandan iyidir. */}
          <Pressable
            style={s.tus}
            onPress={() => this.setState({ hata: null, ayrinti: null })}
            hitSlop={8}
          >
            <Text style={s.tusMetin}>YENİDEN DENE</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

const s = StyleSheet.create({
  zemin: {
    flex: 1,
    backgroundColor: ZEMIN.taban,
    alignItems: 'center',
    justifyContent: 'center',
    padding: BOSLUK.genis,
  },
  kutu: {
    width: '90%',
    maxWidth: 620,
    maxHeight: '90%',
    padding: BOSLUK.genis,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: KOSE.kutu,
    gap: BOSLUK.dar,
  },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 2,
    color: DURUM.eksi,
  },
  metin: { fontFamily: YAZI.govde, fontSize: 13, lineHeight: 19, color: YAZI_RENK.birincil },
  metinIkincil: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 16,
    color: YAZI_RENK.ikincil,
  },
  ayrintiKutu: {
    maxHeight: 140,
    marginTop: BOSLUK.dar,
    padding: BOSLUK.dar,
    backgroundColor: ZEMIN.cukur,
    borderRadius: KOSE.dugme,
  },
  ayrintiMetin: { fontFamily: YAZI.govde, fontSize: 10, lineHeight: 14, color: YAZI_RENK.soluk },
  tus: {
    alignSelf: 'flex-start',
    marginTop: BOSLUK.orta,
    paddingVertical: 8,
    paddingHorizontal: BOSLUK.genis,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    borderRadius: KOSE.dugme,
  },
  tusMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    letterSpacing: 1.2,
    color: YAZI_RENK.birincil,
  },
});
