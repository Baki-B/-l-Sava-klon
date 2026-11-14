// ONAY KUTUSU — "emin misin?" soran ortak bileşen (Palet A).
//
// Neden sistemin kendi uyarısı (Alert) değil: sistem uyarısı beyaz ve yuvarlak, oyunun
// koyu komuta masası havasını bozuyor; ayrıca Android ile iPhone'da farklı görünüyor.
// Bu kutu her cihazda aynı ve oyunun temasıyla aynı dilde.
//
// Kural: geri alınamayan işlerden ÖNCE sorulur (tur bitirme gibi). Sık tekrarlanan ve
// zararsız işlerde kullanılmaz — her tıklamada soru çıkarsa oyuncu okumadan onaylamaya
// başlar, o zaman onayın hiçbir faydası kalmaz.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { PANEL, YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';
import { useOlcek } from '../olcu';

export default function Onay({
  baslik, // "TURU BİTİR"
  mesaj, // ne olacağını anlatan tek cümle
  vurgu, // isteğe bağlı: öne çıkarılacak satır (ör. "+10 nüfus / +10 ekonomi")
  vurguBaslik, // vurgu kutusunun küçük başlığı
  onayMetin = 'DEVAM',
  onOnay,
  onIptal,
  // İsteğe bağlı ÜÇÜNCÜ yol (2026-08-03, çıkışta kayıt sorusu için). İki cevaplı soruya
  // sıkışmayan durumlar var: "kaydet ve çık / kaydetmeden çık / vazgeç" üç ayrı niyet.
  // Görünümü iptal düğmesiyle aynı — vurgulu yol her zaman TEK (onay düğmesi), yoksa
  // oyuncu hangisinin asıl eylem olduğunu seçemez.
  ikincilMetin,
  onIkincil,
}) {
  const { telefon } = useOlcek();
  return (
    <View style={s.tabaka}>
      {/* Dışarı dokununca vazgeç — yanlışlıkla açılan kutu kolayca kapansın. */}
      <Pressable style={s.perde} onPress={onIptal} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <Text style={s.baslik}>{baslik}</Text>
        <Text style={s.mesaj}>{mesaj}</Text>

        {vurgu ? (
          <View style={s.vurguKutu}>
            {vurguBaslik ? <Text style={s.vurguBaslik}>{vurguBaslik}</Text> : null}
            <Text style={s.vurguDeger}>{vurgu}</Text>
          </View>
        ) : null}

        {ikincilMetin ? (
          // ÜÇ YOL İKİ SIRADA (Baki, 2026-09-23: "vazgeç dışarı taşmış"). Üç düğme yan yana
          // 283 px (Black Ops One ile ölçüldü: 83 + 53 + 130 + aralıklar); telefondaki
          // kutunun içi 248, tablettekinin 276. Sıra sağa yaslı olduğu için taşan hep en
          // soldaki VAZGEÇ'ti. Asıl eylem üstte tam genişlikte, öteki ikisi altta yarı yarıya.
          <View style={s.ucluDugmeler}>
            <Pressable style={[s.dugme, s.onay]} onPress={onOnay}>
              <Text style={[s.dugmeMetin, s.onayMetin]}>{onayMetin}</Text>
            </Pressable>
            <View style={s.ikiliSira}>
              <Pressable style={[s.dugme, s.iptal, s.esit]} onPress={onIptal}>
                <Text style={[s.dugmeMetin, s.iptalMetin]}>VAZGEÇ</Text>
              </Pressable>
              <Pressable style={[s.dugme, s.iptal, s.esit]} onPress={onIkincil}>
                <Text style={[s.dugmeMetin, s.iptalMetin]}>{ikincilMetin}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={s.dugmeler}>
            <Pressable style={[s.dugme, s.iptal]} onPress={onIptal}>
              <Text style={[s.dugmeMetin, s.iptalMetin]}>VAZGEÇ</Text>
            </Pressable>
            <Pressable style={[s.dugme, s.onay]} onPress={onOnay}>
              <Text style={[s.dugmeMetin, s.onayMetin]}>{onayMetin}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Arkayı karart: göz kutuya gitsin, arkadaki düğmelere yanlışlıkla basılmasın.
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.enHafif },
  kutu: {
    // 340 → 312 (Baki, 2026-08-03): çıkış onayı ayar paneliyle üst üste geliyordu,
    // ikisi de az küçüldü (AyarMenusu 258 → 238). Üç düğmeli hâl iki sırada (aşağıda).
    width: 312,
    maxWidth: '82%',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 24,
  },
  // Yatay telefonda yükseklik kıt — kutu dikeyde daralır.
  kutuDar: { width: 276, paddingVertical: 13, paddingHorizontal: 14 },

  baslik: { fontFamily: YAZI.baslik, fontSize: 13, letterSpacing: 2.2, color: YAZI_RENK.birincil },
  mesaj: {
    fontFamily: YAZI.govde,
    fontSize: 13.5,
    lineHeight: 19,
    color: YAZI_RENK.birincil,
    marginTop: 8,
  },

  vurguKutu: {
    marginTop: 11,
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  vurguBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: YAZI_RENK.birincil,
  },
  vurguDeger: { fontFamily: YAZI.sayi, fontSize: 15, color: DURUM.arti, marginTop: 3 },

  dugmeler: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 16 },
  ucluDugmeler: { gap: 9, marginTop: 16 },
  ikiliSira: { flexDirection: 'row', gap: 9 },
  esit: { flex: 1 },
  dugme: { borderRadius: 9, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center' },
  iptal: { borderWidth: 1, borderColor: CIZGI.ince, backgroundColor: ZEMIN.cukur },
  onay: { backgroundColor: YAZI_RENK.birincil },
  dugmeMetin: { fontFamily: YAZI.baslik, fontSize: 11.5, letterSpacing: 0.6 },
  iptalMetin: { color: YAZI_RENK.birincil },
  onayMetin: { color: ZEMIN.taban },
});
