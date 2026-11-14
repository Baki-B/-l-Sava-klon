// EĞİTİM ŞERİDİ VE SONU (GOREV-20 Adım 8).
//
// Şerit: sol üstte küçük bir kutu — ilerleme noktaları + en çok iki kelime. Asıl işaret
// haritadaki halka ya da düğmedeki parıltı (`Ipucu.js`); şerit yalnızca "ne yapıyorum"
// sorusunu iki kelimeyle cevaplıyor. Cümle YOK (CLAUDE.md §5/10, GOREV-20 §4.6: "en fazla
// birkaç kelime").
//
// Son: eğitim bitince ortada tek kelime (HAZIRSIN) ve iki yol: gerçek bir sefere başlamak ya
// da bu haritada oynamaya devam etmek.
//
// KURAL BİLMEZ: hangi adımda olunduğu `oyun/egitim.js egitimAdimi`nden (App.js) geliyor.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PANEL, YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, IPUCU } from '../tema';

// Adımın iki kelimesi. Anahtarlar `EGITIM_ADIMLARI` ile aynı.
const METIN = {
  ordu: 'ORDUNA DOKUN',
  hedef: 'HEDEFE DOKUN',
  asker: 'ASKER SEÇ',
  saldir: 'TEKRAR DOKUN',
  uret: 'ASKER BAS',
  tur: 'TURU BİTİR',
};

// `sira`: kaçıncı adım (0'dan) · `toplam`: adım sayısı.
export function EgitimSeridi({ adim, sira, toplam, stil }) {
  const metin = METIN[adim];
  if (!metin) return null;
  return (
    <View style={[s.serit, stil]} pointerEvents="none">
      <View style={s.noktalar}>
        {Array.from({ length: toplam }, (_, i) => (
          <View key={i} style={[s.nokta, i < sira && s.noktaBitti, i === sira && s.noktaSimdi]} />
        ))}
      </View>
      <Text style={s.metin}>{metin}</Text>
    </View>
  );
}

export function EgitimSonu({ onBasla, onDevam }) {
  return (
    <View style={s.tabaka}>
      <View style={s.perde} />
      <View style={s.kutu}>
        <Text style={s.baslik}>HAZIRSIN</Text>
        <View style={s.dugmeler}>
          <Pressable style={[s.dugme, s.ikincil]} onPress={onDevam}>
            <Text style={[s.dugmeMetin, s.ikincilMetin]}>DEVAM ET</Text>
          </Pressable>
          <Pressable style={[s.dugme, s.asil]} onPress={onBasla}>
            <Text style={[s.dugmeMetin, s.asilMetin]}>SEFERE BAŞLA</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  serit: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  noktalar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nokta: { width: 6, height: 6, borderRadius: 3, backgroundColor: CIZGI.ince },
  noktaBitti: { backgroundColor: YAZI_RENK.ikincil },
  noktaSimdi: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: IPUCU.renk },
  metin: {
    fontFamily: YAZI.baslik,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.2,
    color: YAZI_RENK.birincil,
  },

  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.enHafif },
  kutu: {
    alignItems: 'center',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 22,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 24,
  },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 3,
    color: YAZI_RENK.birincil,
  },
  dugmeler: { flexDirection: 'row', gap: 10, marginTop: 16 },
  dugme: { borderRadius: 9, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  ikincil: { borderWidth: 1, borderColor: CIZGI.ince, backgroundColor: ZEMIN.cukur },
  asil: { backgroundColor: YAZI_RENK.birincil },
  dugmeMetin: { fontFamily: YAZI.baslik, fontSize: 12, lineHeight: 15, letterSpacing: 0.6 },
  ikincilMetin: { color: YAZI_RENK.birincil },
  asilMetin: { color: ZEMIN.taban },
});
