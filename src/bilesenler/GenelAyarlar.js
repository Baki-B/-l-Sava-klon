// GENEL AYARLAR — ANA MENÜDEN AÇILAN AYAR EKRANI (2026-08-01).
//
// ┌─ BAKİ'NİN İTİRAZI ──────────────────────────────────────────────────────────────────┐
// │ *"Ayarlar kısmına basınca ekranın ortasına bir menü gelsin. Oyun içindeki ayarlar   │
// │  menüsü ile aynı yapmışsın, direkt dostum olmaz böyle. Orası oyunun genel           │
// │  oynanışıyla alakalı tüm ayarları içerecek, maç içindeki ayarlar ise maçta          │
// │  yapılabilecek ayarları içerecek."*                                                  │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- AYRIM: TERCİH Mİ, MAÇ İŞİ Mİ ----
//
//   BURASI (genel)      → oyuncunun CİHAZ TERCİHLERİ. Bütün maçlarda geçerli, kayda
//                         girmez (`oyun/ayarlar.js` ayrı saklıyor): savaş gösterisi,
//                         titreşim, ses.
//   MAÇ AYARLARI        → yalnızca SÜREN MAÇI ilgilendiren işler: kaydet, yükle, zorluk,
//   (`AyarMenusu.js`)     ana menüye dön.
//
// Ayrımın sınavı tek soru: **maç yokken de anlamlı mı?** Titreşim anlamlı, "kaydet"
// değil. İkisi aynı menüde olsaydı ana menüde yarısı ölü düğme olarak dururdu.
//
// ---- EKRANIN ORTASINDA ----
// Maç ayarları sağ üstte açılıyor çünkü orada bir çubuk var ve menü ondan sarkıyor.
// Burada çubuk yok; menü ekranın ortasında, kendi başına duruyor.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK } from '../tema';
import { useOlcek } from '../olcu';

function Satir({ baslik, aciklama, cocuk }) {
  return (
    <View style={s.satir}>
      <Text style={s.satirBaslik}>{baslik}</Text>
      {aciklama ? <Text style={s.satirAciklama}>{aciklama}</Text> : null}
      <View style={s.satirIc}>{cocuk}</View>
    </View>
  );
}

function Secenek({ metin, secili, pasif, onPress }) {
  return (
    <Pressable
      style={[s.secenek, secili && s.secenekSecili, pasif && s.secenekPasif]}
      disabled={pasif}
      onPress={onPress}
    >
      <Text style={[s.secenekMetin, secili && s.secenekMetinSecili]}>{metin}</Text>
    </Pressable>
  );
}

// NOT: kurallar ekranı buradan ÇIKTI (2026-08-06) — ana menünün sağ üstündeki
// EĞİTİM düğmesine taşındı. Ayarlar bir tercih ekranı; öğretmek onun işi değil.
export default function GenelAyarlar({ ayarlar, onAyar, onKapat }) {
  const { telefon } = useOlcek();

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>AYARLAR</Text>
          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={s.icerik}>
          {/* ---- ⚠ SAVAŞ GÖSTERİSİ BURADAN ÇIKTI (2026-08-12, Baki: "ana menüde
              ayarlarda savaş gösterisi yeri gereksiz") ----

              Ayarın kendisi DURUYOR, yalnızca yeri değişti: artık maç içindeki ayarlar
              menüsünde (`AyarMenusu.js`). Sebebi bu dosyanın kendi sınavı — "maç yokken
              de anlamlı mı?" Savaş gösterisinin kapsamını ana menüde seçmek, görmediğin
              bir şeyi ayarlamak demek; oyuncu onu ancak gösteriyi İZLERKEN yavaş ya da
              hızlı buluyor ve tam o an değiştirmek istiyor.

              Geriye titreşim kaldı; ekran inceldi ve bu bir kayıp değil: ana menü ayarı
              olarak gerçekten cihaz tercihi olan tek şey oydu. */}

          <Satir
            baslik="TİTREŞİM"
            aciklama="Savaş, fetih ve kayıp anlarında telefon kısa kısa titrer."
            cocuk={
              <>
                <Secenek
                  metin="AÇIK"
                  secili={ayarlar.titresim}
                  onPress={() => onAyar('titresim', true)}
                />
                <Secenek
                  metin="KAPALI"
                  secili={!ayarlar.titresim}
                  onPress={() => onAyar('titresim', false)}
                />
              </>
            }
          />

          {/* HARİTA satırı (yeni/eski seçimi) 2026-09-25'te kalktı: eski harita emekliye
              ayrıldı (GOREV-20 Adım 9). */}

          {/* ---- ⚠ SES SATIRI KALDIRILDI (2026-08-12, Baki: "oyuna ses eklemeyeceğim") ----
              Satır "hazır olduğunda buradan açacaksın" diyordu — artık bu bir YALAN.
              Verilmeyecek bir söz, çalışmayan bir düğmeden daha kötü: oyuncu bekler.
              Ses katmanı kodda kapalı anahtar olarak duruyor (`sahne/ses.js`), ekranda
              hiç görünmüyor. */}

          {/* ---- KAYNAK VE LİSANS (Görev 12 / Adım 6) ----
              ⚠ BU SATIR SÜS DEĞİL, ZORUNLULUK. Haritanın geometrisi OpenStreetMap
              verisinden üretildi (`veri/harita.json`, `scripts/harita-uret.js`) ve ODbL
              lisansı ATIF şartı koşuyor. Yayına çıkarken bu satır olmadan olmaz.
              Ekranın en altında, en sessiz yerde duruyor — kural yerine gelsin ama
              oyuncunun gözüne girmesin. */}
          {/* ---- YAZI TİPİ ATFI EKLENDİ (2026-08-12, yayın denetimi) ----
              Black Ops One ve Chakra Petch, SIL Open Font License ile geliyor. OFL
              yazı tipini uygulamaya gömmene ve para kazanmana izin veriyor AMA lisans
              metninin ürünle birlikte gelmesini şart koşuyor. Lisans dosyaları yalnızca
              `node_modules` içindeydi, yani oyuncuya hiç ulaşmıyordu. */}
          <Text style={s.kaynak}>
            Harita verisi © OpenStreetMap katkıcıları · ODbL lisansı{'\n'}
            Yazı tipleri: Black Ops One ve Chakra Petch · SIL Open Font License
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.koyu },
  kutu: {
    width: '70%',
    maxWidth: 520,
    maxHeight: '88%',
    paddingVertical: 16,
    paddingHorizontal: 22,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 14,
  },
  kutuDar: { width: '90%', paddingHorizontal: 16 },
  baslikSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  baslik: { fontFamily: YAZI.baslik, fontSize: 17, color: YAZI_RENK.birincil, letterSpacing: 2.4 },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 24, color: YAZI_RENK.ikincil, lineHeight: 26 },
  icerik: { paddingBottom: 4 },
  satir: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CIZGI.ayrac,
    marginTop: 10,
  },
  satirBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    color: YAZI_RENK.birincil,
    letterSpacing: 1.4,
  },
  satirAciklama: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    color: YAZI_RENK.ikincil,
    marginTop: 3,
    lineHeight: 16,
  },
  satirIc: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  secenek: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
    borderRadius: 8,
  },
  secenekSecili: { borderColor: YAZI_RENK.ikincil, backgroundColor: ZEMIN.cukur },
  secenekPasif: { opacity: 0.45 },
  secenekMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11.5,
    color: YAZI_RENK.ikincil,
    letterSpacing: 1,
  },
  secenekMetinSecili: { color: YAZI_RENK.birincil },
  // Lisans satırı: en küçük punto, en soluk renk — okunur ama hiçbir şeyle yarışmaz.
  kaynak: {
    fontFamily: YAZI.govde,
    fontSize: 10,
    lineHeight: 14,
    color: YAZI_RENK.soluk,
    textAlign: 'center',
    marginTop: 14,
  },
});
