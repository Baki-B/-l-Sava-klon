// TUR GÜNLÜĞÜ — bu tur ne yaptın (Görev 15 / Adım 4).
//
// ┌─ EMİR LİSTESİNİN YERİNİ ALDI ───────────────────────────────────────────────────────┐
// │ Eskiden bu ekran BEKLEYEN emirleri gösteriyordu ve her satırın bir iptal düğmesi    │
// │ vardı. Hamle artık verildiği an çözülüyor (Görev 15): bekleyen emir yok, iptal yok. │
// │ Gösterilecek şey olup bitenler — "nereye saldırdım, ne oldu".                        │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// SIRA NUMARASI DURUYOR ama anlamı değişti: emirlerin çözülme sırası değil, OLAYLARIN olma
// sırası. Oyuncu "önce şuraya saldırdım, sonra oradan devam ettim" diye okuyabilsin.
//
// BEKLEYEN TOPLANMA AYRI BÖLÜM: kuyrukta bekleyen tek emir türü toplanma (§3.9/2 — ordu o
// tur yıpranmış hâliyle savunur, tur sonunda dolar). Yalnızca onun vazgeçmesi var.
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PANEL, YAZI, RENK, ZEMIN, CIZGI, YAZI_RENK, VURGU, DURUM } from '../tema';
import { useOlcek } from '../olcu';

export default function TurGunlugu({ gunluk, toplanmalar, onIptal, onKapat }) {
  const { telefon } = useOlcek();
  const bosMu = gunluk.length === 0 && toplanmalar.length === 0;

  return (
    <View style={s.tabaka} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onKapat} />

      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatir}>
          <View style={{ flexShrink: 1 }}>
            <Text style={s.baslik}>BU TUR</Text>
            <Text style={s.alt}>
              {bosMu ? 'Henüz bir şey yapmadın.' : gunluk.length + ' hamle · sonuçları aşağıda'}
            </Text>
          </View>
          <Pressable onPress={onKapat} hitSlop={12} style={s.kapat}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <View style={s.ayrac} />

        {bosMu ? (
          <Text style={s.bos}>
            Ordunun olduğu bölgeye dokun, parlayan hedeflerden birine iki kez dokun. Hamle hemen
            gerçekleşir.
          </Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={s.liste}>
            {gunluk.map((g) => (
              <View key={'g' + g.sira} style={s.satir}>
                <Text style={[s.no, g.iyi ? s.noIyi : s.noKotu]}>{g.sira + 1}</Text>
                <View style={s.satirSol}>
                  <Text style={s.yol} numberOfLines={1}>
                    {g.kaynakAd} <Text style={s.ok}>→</Text> {g.hedefAd}
                  </Text>
                  <Text style={s.dokum} numberOfLines={1}>
                    {g.dokum}
                  </Text>
                </View>
                <Text style={[s.sonuc, g.iyi ? s.sonucIyi : s.sonucKotu]} numberOfLines={2}>
                  {g.sonuc}
                </Text>
              </View>
            ))}

            {toplanmalar.length > 0 && (
              <View>
                <Text style={s.bolumBaslik}>TUR SONUNDA TOPLANACAK</Text>
                {toplanmalar.map((t) => (
                  <View key={'t' + t.sira} style={s.satir}>
                    <Text style={[s.no, s.noToplanma]}>·</Text>
                    <View style={s.satirSol}>
                      <Text style={s.yol} numberOfLines={1}>
                        {t.kaynakAd}
                      </Text>
                      <Text style={s.dokum} numberOfLines={1}>
                        {t.dokum} · {t.bedel.nufus} nüfus / {t.bedel.ekonomi} ekonomi
                      </Text>
                    </View>
                    <Pressable onPress={() => onIptal(t.sira)} hitSlop={8} style={s.iptal}>
                      <Text style={s.iptalMetin}>VAZGEÇ</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  kutu: {
    width: 400,
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
  kutuDar: { width: 340, paddingVertical: 11, paddingHorizontal: 13 },

  baslikSatir: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 12.5,
    letterSpacing: 2.2,
    color: YAZI_RENK.birincil,
  },
  alt: { fontFamily: YAZI.govde, fontSize: 12, color: YAZI_RENK.ikincil, marginTop: 2 },
  kapat: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  kapatX: { fontSize: 23, color: YAZI_RENK.ikincil, lineHeight: 25 },

  ayrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: 10 },
  bos: { fontFamily: YAZI.govde, fontSize: 12.5, lineHeight: 18, color: YAZI_RENK.ikincil },

  liste: { flexGrow: 0 },
  satir: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6 },
  no: {
    width: 22,
    height: 22,
    borderRadius: 6,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: YAZI.sayi,
    fontSize: 12,
    color: PANEL.vurguUstu,
    overflow: 'hidden',
  },
  // Sonucu RENK DE söylüyor ama tek kanal değil: sağdaki metin zaten "alındı / püskürtüldü"
  // yazıyor. Renk körü oyuncu bilgiyi yazıdan okuyor (mühür kademelerindeki kural).
  noIyi: { backgroundColor: VURGU.saldiri },
  noKotu: { backgroundColor: YAZI_RENK.ikincil },
  noToplanma: { backgroundColor: RENK.okTakviye },
  satirSol: { flex: 1 },
  yol: { fontFamily: YAZI.govdeKalin, fontSize: 13, color: YAZI_RENK.birincil },
  ok: { color: YAZI_RENK.birincil },
  dokum: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil, marginTop: 1 },
  sonuc: { fontFamily: YAZI.govde, fontSize: 11.5, maxWidth: 118, textAlign: 'right' },
  sonucIyi: { color: DURUM.arti },
  sonucKotu: { color: DURUM.eksi },
  bolumBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    letterSpacing: 1.6,
    color: YAZI_RENK.ikincil,
    marginTop: 12,
    marginBottom: 2,
  },
  iptal: {
    borderWidth: 1,
    borderColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iptalMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    letterSpacing: 0.6,
    color: YAZI_RENK.birincil,
  },
});
