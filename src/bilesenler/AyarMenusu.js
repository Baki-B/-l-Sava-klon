// AYARLAR MENÜSÜ — sağ üstteki dişli düğmesine basınca açılır (Palet A).
//
// Kural: burada ÇALIŞMAYAN düğme yok. Henüz yapılmamış bölümler "yakında" etiketiyle
// soluk görünür ve basılamaz — Baki neyin hazır neyin olmadığını ekranda görsün.
//
// Şu an çalışan: oyunu kaydet / oyunu yükle (Görev 03 Adım 5).
// Sonraki görevlerde açılacak: ana menü, ses ve görüntü ayarları.
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PANEL, YAZI, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';

// Açık/kapalı düğmesi — "yakında" etiketli satırlarla aynı kutu biçimi, tek fark sağdaki
// durum yazısı. Ayrı bir anahtar bileşeni yazmadık: menüde iki tane var ve ikisi de bu
// kadar basit (kural: burada ÇALIŞMAYAN düğme yok, çalışan da abartılı olmasın).
function Satir({ metin, altMetin, onPress, yakinda }) {
  if (yakinda) {
    return (
      <View style={[s.satir, s.satirPasif]}>
        <Text style={[s.satirMetin, s.pasifMetin]}>{metin}</Text>
        <Text style={s.yakinda}>yakında</Text>
      </View>
    );
  }
  return (
    <Pressable style={s.satir} onPress={onPress}>
      <Text style={s.satirMetin}>{metin}</Text>
      {altMetin ? <Text style={s.satirAlt}>{altMetin}</Text> : null}
    </Pressable>
  );
}

export default function AyarMenusu({
  senaryoAd,
  oyuncuAd,
  mesaj,
  zorluk,
  zorlukKademeleri,
  onZorluk,
  onKaydet,
  onYukle,
  onOrdularim,
  onKomutan,
  onYardim,
  onAnaMenu,
  onKapat,
  // ---- SAVAŞ GÖSTERİSİ BURAYA TAŞINDI (2026-08-12, Baki) ----
  // Ana menü ayarlarındaydı; oyuncu göremediği bir şeyi ayarlıyordu. Gösterinin yavaş ya
  // da fazla geldiğini ancak İZLERKEN anlıyorsun ve tam o an değiştirmek istiyorsun —
  // yeri burası. Ayarın kendisi yine cihaz tercihi (`oyun/ayarlar.js`), kayda girmiyor.
  gosterim,
  onGosterim,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.tabaka}>
      {/* Menünün dışına dokununca kapanır */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onKapat} />

      <View style={[s.menu, { top: insets.top + 70, right: insets.right + 12 }]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>AYARLAR</Text>
          <Pressable onPress={onKapat} hitSlop={12}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s.bilgiKutu}>
            {/* "Senaryo" bir geliştirme terimiydi; oyuncu için bu HARİTA (2026-08-01). */}
            <Text style={s.bilgi}>
              Harita: <Text style={s.bilgiVurgu}>{senaryoAd}</Text>
            </Text>
            <Text style={s.bilgi}>
              Oynadığın il: <Text style={s.bilgiVurgu}>{oyuncuAd}</Text>
            </Text>
          </View>

          {/* ORDULARIM ve NASIL OYNANIR (Görev 12 / Adım 10). Maç ayarlarının içindeler
              çünkü ikisi de MAÇLA ilgili: biri sahadaki ordunu gösteriyor, öteki oyunun
              kurallarını. Tur çubuğuna yeni düğme eklenmedi — orası yatayda zaten dar ve
              her yeni düğme haritadan yer yiyor (CLAUDE.md §6). */}
          <Satir metin="ORDULARIM" altMetin="Sahadaki bütün ordularını gör" onPress={onOrdularim} />
          {/* KOMUTAN (Görev 16 / Adım 6). Ordularım'ın hemen altında: ikisi de "sahada
              neyim var" sorusunun parçası. Tur çubuğuna yeni düğme eklenmedi — orası
              yatayda zaten dar (CLAUDE.md §6). */}
          <Satir metin="KOMUTAN" altMetin="Yeteneğini seç, yerini gör" onPress={onKomutan} />
          <Satir
            metin="NASIL OYNANIR"
            altMetin="Birlikler, arazi, savaş ve diplomasi"
            onPress={onYardim}
          />

          <View style={s.ayrac} />

          {/* EĞİTİMDE kayıt ve zorluk YOK (GOREV-20 Adım 8): eğitim hiçbir yuvaya yazılmaz,
              zorluk değiştirmek de onu normal bir maça çevirirdi. App.js üçünü de null veriyor. */}
          {onKaydet ? <Satir metin="OYUNU KAYDET" onPress={onKaydet} /> : null}
          {onYukle ? <Satir metin="OYUNU YÜKLE" onPress={onYukle} /> : null}

          {mesaj ? <Text style={s.mesaj}>{mesaj}</Text> : null}

          {onKaydet || onYukle ? <View style={s.ayrac} /> : null}

          {/* ---- ZORLUK (Görev 07 / Adım 7 · §9.4) ----
              "Zorluk = ağırlık ayarı, hesap değil." Kademe yalnızca rakiplerin kişilik
              aralıklarını ve karar gürültüsünü değiştiriyor; GİZLİ BONUS YOK. Verilseydi
              burada yazardı (§9/tuzak 5: oyuncu aldatıldığını hissederse haklıdır).

              Kademe DEĞİŞTİRMEK YENİ OYUN İSTER: kişilikler oyun kurulurken tohumdan
              üretiliyor ve kayıtta değil, türetiliyor. Ortada değiştirmek, süregelen
              oyunun rakiplerini bir anda başka insanlara çevirirdi. */}
          {onZorluk ? (
            <>
              <Text style={s.bolumBaslik}>ZORLUK</Text>
              <Text style={s.bolumAlt}>
                Karşındaki illerin ne kadar gözü kara olduğunu belirler. Hepsi seninle aynı
                kurallarla oynar; değişen tek şey ne kadar risk aldıkları.
              </Text>
              <View style={s.kademeler}>
                {zorlukKademeleri.map((k) => {
                  const secili = k.anahtar === zorluk;
                  return (
                    <Pressable
                      key={k.anahtar}
                      onPress={() => onZorluk(k.anahtar)}
                      style={[s.kademe, secili && s.kademeSecili]}
                    >
                      <Text style={[s.kademeMetin, secili && s.kademeMetinSecili]}>{k.ad}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={s.kademeNot}>Zorluğu değiştirirsen oyun baştan başlar.</Text>

              <View style={s.ayrac} />
            </>
          ) : null}

          {/* ---- SAVAŞ GÖSTERİSİ GERİ GELDİ (2026-08-12, Baki) ----
              2026-08-01'de bütün genel tercihler ana menüye taşınmıştı ("maç yokken de
              anlamlı mı?" sınavıyla). Savaş gösterisi o sınavı geçiyordu ama PRATİKTE
              kalmıyordu: Baki *"ana menüde ayarlarda savaş gösterisi yeri gereksiz"* dedi
              ve haklı — kapsamı ancak gösteriyi İZLERKEN yargılıyorsun.

              Titreşim ana menüde kaldı (maç yokken de anlamlı, gerçek cihaz tercihi).
              Ayarın kendisi yine kayda GİRMİYOR (`oyun/ayarlar.js`), yalnızca düğmesi
              buraya taşındı. */}
          {gosterim && onGosterim ? (
            <>
              <Text style={s.bolumBaslik}>SAVAŞ GÖSTERİSİ</Text>
              <Text style={s.bolumAlt}>{gosterim.aciklama}</Text>
              <View style={s.kademeler}>
                {gosterim.secenekler.map((k) => {
                  const secili = k.anahtar === gosterim.secili;
                  return (
                    <Pressable
                      key={k.anahtar}
                      onPress={() => onGosterim(k.anahtar)}
                      style={[s.kademe, secili && s.kademeSecili]}
                    >
                      <Text style={[s.kademeMetin, secili && s.kademeMetinSecili]}>{k.ad}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={s.ayrac} />
            </>
          ) : null}

          <Pressable style={s.anaMenuTus} onPress={onAnaMenu}>
            <Text style={s.anaMenuMetin}>ANA MENÜYE DÖN</Text>
          </Pressable>
          <Text style={s.anaMenuAlt}>
            Maçın kayboluyor değil; kaydetmediysen son kaydettiğin yerden devam edersin.
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  anaMenuTus: {
    marginTop: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
  },
  anaMenuMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12.5,
    color: YAZI_RENK.birincil,
    letterSpacing: 1.4,
  },
  anaMenuAlt: {
    fontFamily: YAZI.govde,
    fontSize: 11,
    color: YAZI_RENK.ikincil,
    marginTop: 5,
    lineHeight: 15,
  },
  tabaka: { ...StyleSheet.absoluteFillObject, zIndex: 20 },
  menu: {
    position: 'absolute',
    // 258 → 238 (Baki, 2026-08-03): çıkış onayı kutusu bu panelin üstüne açılıyor ve
    // ikisi neredeyse aynı genişlikteydi — kenarları çakışınca hangisinin üstte olduğu
    // okunmuyordu. İkisi de bir tık küçüldü; aradaki fark artık katmanları ayırıyor.
    width: 238,
    maxHeight: '72%',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 13,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 18,
  },
  baslikSatiri: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 11.5,
    letterSpacing: 2.5,
    color: YAZI_RENK.birincil,
  },
  kapatX: { fontSize: 22, color: YAZI_RENK.ikincil, lineHeight: 24 },

  bilgiKutu: {
    backgroundColor: ZEMIN.cukur,
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginBottom: 10,
    gap: 4,
  },
  bilgi: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil },
  bilgiVurgu: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil },

  satir: {
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  satirPasif: { backgroundColor: 'transparent', borderStyle: 'dashed', opacity: 0.55 },
  anahtarSatir: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  anahtarSol: { flex: 1 },
  anahtarDurum: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    letterSpacing: 1.2,
    color: YAZI_RENK.ikincil,
  },
  anahtarAcik: { color: YAZI_RENK.birincil },
  satirMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    letterSpacing: 0.8,
    color: YAZI_RENK.birincil,
  },
  satirAlt: { fontFamily: YAZI.govde, fontSize: 10.5, color: YAZI_RENK.ikincil, marginTop: 2 },
  pasifMetin: { color: YAZI_RENK.ikincil },
  yakinda: { fontFamily: YAZI.govde, fontSize: 9.5, color: YAZI_RENK.ikincil, marginTop: 2 },

  mesaj: {
    fontFamily: YAZI.govde,
    fontSize: 10.5,
    color: DURUM.arti,
    marginTop: 2,
    marginBottom: 4,
    lineHeight: 14,
  },
  bolumBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 10.5,
    letterSpacing: 1.8,
    color: YAZI_RENK.birincil,
    marginBottom: 3,
  },
  bolumAlt: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil, lineHeight: 15 },
  kademeler: { flexDirection: 'row', gap: 6, marginTop: 8 },
  kademe: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
    alignItems: 'center',
  },
  kademeSecili: { borderColor: YAZI_RENK.ikincil, backgroundColor: ZEMIN.cukur },
  kademeMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: YAZI_RENK.ikincil,
  },
  kademeMetinSecili: { color: YAZI_RENK.birincil },
  kademeNot: { fontFamily: YAZI.govde, fontSize: 11, color: YAZI_RENK.ikincil, marginTop: 6 },
  ayrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: 8 },
});
