// ORDULARIM — BÜTÜN ORDULARIN TEK LİSTEDE (Görev 12 / Adım 10 · Baki'nin isteği).
//
// ┌─ NEDEN VAR ─────────────────────────────────────────────────────────────────────────┐
// │ Geç turlarda 20+ bölgeyle oynarken "nerede kaç askerim var" sorusunun cevabı yoktu:  │
// │ haritayı gezip parça parça bakmak gerekiyordu. Ordunun tamamını görmeden hangi       │
// │ cepheye takviye göndereceğine karar vermek de mümkün değildi.                        │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- SIRA: ÖNCE CEPHE ----
// Liste düşman komşusu olan bölgelerle başlıyor (kancada sıralanıyor). Oyuncunun aradığı
// şey neredeyse her zaman "cephede kim var"; alfabetik sıra o soruyu cevaplamıyordu.
//
// ---- SATIRA DOKUNMAK O BÖLGEYİ SEÇER ----
// Liste kapanır ve sol paneldeki bölge o olur. Haritayı oraya KAYDIRMIYOR: kamera
// hareketi bugün yalnızca savaş gösterisinde var (`SAHNE.KAMERA`) ve oraya elle bir
// giriş açmak, jest sınırlarıyla çakışma riski taşıyor (Görev 05'in altı turluk
// akıcılık kovalamacası). Panelin açılması "nereye bakıyorum" sorusunu zaten cevaplıyor.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, PERDE, BOSLUK, KOSE, KAGIT } from '../tema';
import { useOlcek } from '../olcu';

function Satir({ satir, onSec }) {
  return (
    <Pressable style={s.satir} onPress={() => onSec(satir.id)}>
      <View style={s.kimlik}>
        <Text style={s.ad} numberOfLines={1}>
          {satir.ad}
        </Text>
        <Text style={s.dokum} numberOfLines={1}>
          {satir.dokum.map((d) => d.sayi + ' ' + d.ad.toLowerCase()).join(' · ')}
        </Text>
      </View>

      <View style={s.durumlar}>
        {/* CEPHEDE — en önemli işaret, o yüzden en görünür. */}
        {satir.cephede ? <Text style={s.cephe}>CEPHEDE</Text> : null}
        {satir.yarali > 0 ? <Text style={s.yarali}>{satir.yarali} yaralı</Text> : null}
        {satir.emirli ? <Text style={s.emirli}>emir verildi</Text> : null}
      </View>

      <Text style={s.adet}>{satir.adet}</Text>
    </Pressable>
  );
}

export default function OrdularimEkrani({ ordular, onSec, onKapat }) {
  const { telefon } = useOlcek();
  const satirlar = (ordular && ordular.satirlar) || [];

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>ORDULARIM</Text>
          <Text style={s.ozet}>
            {ordular ? ordular.toplamBirlik : 0} birlik · {satirlar.length} bölge
            {ordular && ordular.cephedeki > 0 ? ' · ' + ordular.cephedeki + ' cephede' : ''}
            {ordular && ordular.toplamYarali > 0 ? ' · ' + ordular.toplamYarali + ' yaralı' : ''}
          </Text>
          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        {satirlar.length === 0 ? (
          <Text style={s.bos}>Sahada hiç ordun yok. Bir bölge seçip ASKER BAS diyebilirsin.</Text>
        ) : (
          <ScrollView style={s.liste} contentContainerStyle={s.listeIc}>
            {satirlar.map((x) => (
              <Satir key={x.id} satir={x} onSec={onSec} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.enKoyu },
  // ⚠ KESİN YÜKSEKLİK — `maxHeight` DEĞİL (Baki, 2026-08-06: "diplomasi bölümünde sadece
  // ordu güç vs. butonları gözüküyor, il listesi gözükmüyor").
  //
  // KÖK SEBEP: kutunun yüksekliği İÇERİKTEN geliyordu (`maxHeight` yalnızca tavan koyar,
  // yükseklik vermez). İçerideki `flex: 1` çocuklar (liste, dosya) paylaşacak boş alan
  // bulamayınca SIFIR yükseklik alıyor — başlık ve sekmeler çiziliyor, liste görünmüyor.
  // Panel tek sütunlu ve akış tabanlıyken sorun yoktu; iki sütuna geçince ortaya çıktı.
  //
  // KURAL: içinde `flex: 1` çocuk olan perde kutusuna KESİN yükseklik verilir.
  kutu: {
    width: '78%',
    maxWidth: 620,
    height: '90%',
    paddingVertical: BOSLUK.genis,
    paddingHorizontal: BOSLUK.genis,
    backgroundColor: KAGIT.yuzey,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    borderRadius: KOSE.kutu,
  },
  kutuDar: { width: '94%', paddingHorizontal: BOSLUK.orta },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.orta },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 2.2,
    color: KAGIT.yazi,
  },
  ozet: { flex: 1, fontFamily: YAZI.govde, fontSize: 11, color: KAGIT.yaziIkincil },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 24, lineHeight: 26, color: KAGIT.yaziIkincil },
  bos: {
    fontFamily: YAZI.govde,
    fontSize: 12.5,
    lineHeight: 18,
    color: KAGIT.yaziIkincil,
    marginTop: BOSLUK.genis,
  },
  liste: { flex: 1, minHeight: 0, marginTop: BOSLUK.dar },
  listeIc: { paddingBottom: 6 },

  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BOSLUK.orta,
    paddingVertical: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: KAGIT.cizgi,
  },
  kimlik: { flex: 1, minWidth: 0 },
  ad: {
    fontFamily: YAZI.baslik,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.6,
    color: KAGIT.yazi,
  },
  dokum: { fontFamily: YAZI.govde, fontSize: 11, lineHeight: 15, color: KAGIT.yaziIkincil },
  durumlar: { alignItems: 'flex-end', flexShrink: 0 },
  cephe: { fontFamily: YAZI.baslik, fontSize: 9.5, letterSpacing: 0.8, color: KAGIT.eksi },
  yarali: { fontFamily: YAZI.govde, fontSize: 10, color: KAGIT.yaziSoluk },
  emirli: { fontFamily: YAZI.govde, fontSize: 10, color: KAGIT.arti },
  // Toplam birlik sayısı sağda ve büyük: listede göz önce buraya kayıyor.
  adet: {
    width: 34,
    textAlign: 'right',
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 21,
    color: KAGIT.yazi,
  },
});
