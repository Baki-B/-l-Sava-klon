// HAREKÂT MÜHÜRLERİ — BAŞARIM EKRANI (Görev 12 / Adım 11).
//
// Ana menüden açılıyor: mühürler maça değil OYUNCUYA ait, yani maç olmadan da anlamlılar.
//
// ---- KİLİTLİ MÜHÜR GİZLENMİYOR ----
// Kazanılmamış mühür de listede duruyor (silik çerçeve + soluk yazı). Gizlenseydi
// oyuncu neyi hedefleyeceğini bilemezdi; listenin yarısı hedef olarak iş görüyor.
// Görev belgesinin "görünmeyen hedef hedef değildir" kuralının (§6/12) aynısı.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, PERDE, BOSLUK, KOSE, KAGIT } from '../tema';
import { useOlcek } from '../olcu';
import { BASARIMLAR, KATEGORILER } from '../oyun/basarimlar';
import Muhur from './Muhurler';

function Kart({ basarim, kazanildi, telefon }) {
  return (
    <View style={[s.kart, telefon && s.kartDar]}>
      <Muhur
        glif={basarim.glif}
        kademe={basarim.kademe}
        kazanildi={kazanildi}
        boyut={telefon ? 40 : 48}
      />
      <View style={s.kartMetin}>
        <Text style={[s.kartAd, !kazanildi && s.kilitli]} numberOfLines={1}>
          {basarim.ad}
        </Text>
        <Text style={[s.kartAciklama, !kazanildi && s.kilitli]} numberOfLines={2}>
          {basarim.aciklama}
        </Text>
      </View>
    </View>
  );
}

export default function BasarimEkrani({ muhurler, rutbe, onKapat }) {
  const { telefon } = useOlcek();
  const kazanilan = muhurler || {};
  const toplam = BASARIMLAR.length;
  const adet = BASARIMLAR.filter((b) => kazanilan[b.id]).length;

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>HAREKÂT MÜHÜRLERİ</Text>
          <Text style={s.sayac}>
            <Text style={s.sayacVurgu}>{adet}</Text> / {toplam}
          </Text>
          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        {/* RÜTBE ŞERİDİ (Görev 16 / Adım 3): mühürlerden türetilen kariyer. Mareşal
            merdivende değil — bütün mühürler toplanınca rütbenin YERİNE yazılıyor. */}
        {rutbe ? (
          <View style={s.rutbeSerit}>
            <Text style={s.rutbeAd}>
              {(rutbe.onur || rutbe.ad).toLocaleUpperCase('tr')}
              {rutbe.onur ? null : (
                <Text style={s.rutbeSira}>
                  {'  '}
                  {rutbe.sira}/14
                </Text>
              )}
            </Text>
            <Text style={s.rutbeAlt}>
              {rutbe.onur
                ? 'Bütün mühürleri topladın.'
                : // "rütbesine" her rütbe adıyla doğru çekimleniyor. Eskiden ada "'e"
                  // ekleniyordu ve 13 rütbenin 7'sinde yanlıştı ("Onbaşı'e", "Yarbay'e").
                  rutbe.sonraki + ' rütbesine ' + rutbe.kalan + ' puan kaldı'}
            </Text>
          </View>
        ) : null}

        <ScrollView style={s.liste} contentContainerStyle={s.listeIc}>
          {KATEGORILER.map(([anahtar, ad]) => {
            const grup = BASARIMLAR.filter((b) => b.kategori === anahtar);
            const grupAdet = grup.filter((b) => kazanilan[b.id]).length;
            return (
              <View key={anahtar} style={s.bolum}>
                <Text style={s.bolumBaslik}>
                  {ad}{' '}
                  <Text style={s.bolumSayac}>
                    {grupAdet}/{grup.length}
                  </Text>
                </Text>
                <View style={s.izgara}>
                  {grup.map((b) => (
                    <Kart key={b.id} basarim={b} kazanildi={!!kazanilan[b.id]} telefon={telefon} />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.enKoyu },
  // Kesin yükseklik — içindeki liste `flex: 1` (bkz. DiplomasiEkrani'ndeki kural).
  kutu: {
    width: '86%',
    maxWidth: 720,
    height: '92%',
    paddingVertical: BOSLUK.genis,
    paddingHorizontal: BOSLUK.genis,
    backgroundColor: KAGIT.yuzey,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    borderRadius: KOSE.kutu,
  },
  kutuDar: { width: '95%', paddingHorizontal: BOSLUK.orta },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.orta },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 2.2,
    color: KAGIT.yazi,
  },
  sayac: { flex: 1, fontFamily: YAZI.govde, fontSize: 12, color: KAGIT.yaziIkincil },
  sayacVurgu: { fontFamily: YAZI.baslik, color: KAGIT.yazi },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 24, lineHeight: 26, color: KAGIT.yaziIkincil },

  // RÜTBE ŞERİDİ — mühür ızgarasının üstünde, ondan çizgiyle ayrı.
  rutbeSerit: { marginTop: BOSLUK.dar, paddingBottom: 6 },
  rutbeAd: { fontFamily: YAZI.baslik, fontSize: 14, letterSpacing: 1.6, color: KAGIT.yazi },
  rutbeSira: { fontFamily: YAZI.govde, fontSize: 11.5, color: KAGIT.yaziIkincil },
  rutbeAlt: { fontFamily: YAZI.govde, fontSize: 11.5, color: KAGIT.yaziIkincil, marginTop: 1 },

  liste: { flex: 1, minHeight: 0, marginTop: BOSLUK.dar },
  listeIc: { paddingBottom: 8 },
  bolum: {
    marginTop: BOSLUK.orta,
    paddingTop: BOSLUK.dar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KAGIT.cizgi,
  },
  bolumBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    letterSpacing: 1.8,
    color: KAGIT.yaziSoluk,
    marginBottom: BOSLUK.dar,
  },
  bolumSayac: { color: KAGIT.yaziIkincil },
  izgara: { flexDirection: 'row', flexWrap: 'wrap', gap: BOSLUK.orta },

  // Kart genişliği SABİT: esnek olsaydı son satırdaki tek kart bütün satırı kaplardı.
  kart: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.dar, width: 300 },
  kartDar: { width: '100%' },
  kartMetin: { flex: 1, minWidth: 0 },
  kartAd: {
    fontFamily: YAZI.baslik,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.6,
    color: KAGIT.yazi,
  },
  kartAciklama: { fontFamily: YAZI.govde, fontSize: 11, lineHeight: 15, color: KAGIT.yaziIkincil },
  kilitli: { color: KAGIT.yaziSoluk },
});
