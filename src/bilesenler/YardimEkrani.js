// NASIL OYNANIR — YARDIM EKRANI (Görev 12 / Adım 10).
//
// ┌─ NEDEN VAR ─────────────────────────────────────────────────────────────────────────┐
// │ On iki görevdir biriken bir sistem var — birlik türleri, arazi, moral, bozgun, şans, │
// │ baskın, sanayi sınırı, çift hamle, savaş ilanı, ihanet bedeli — ve oyuncunun bunları │
// │ öğrenebileceği HİÇBİR YER YOKTU. Savaş odasında tek cümlelik tahmin var, panelde     │
// │ gerekçe var; ama "zırhlıya karşı ne basmalıyım" sorusunun cevabı hiçbir ekranda      │
// │ yazmıyordu. Oyuncu 12 görevlik dengeyi deneyerek çözmek zorundaydı.                  │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ⚠ BU DOSYADA TEK BİR DENGE SAYISI YAZILI DEĞİL ----
//
// Her sayı `DENGE`'den OKUNUYOR. Sebebi tek bir cümle: elle yazılsaydı, bir denge sayısı
// değiştiği gün yardım ekranı YALAN SÖYLEMEYE BAŞLARDI ve kimse fark etmezdi — çünkü
// hiçbir test bir açıklama metnini denetlemez. Bu, projenin "aynı listeyi iki yere yazma"
// kuralının (CLAUDE.md §5/5) en sinsi ihlali olurdu.
//
// Muharebe statları ekranda `STAT_OLCEGI`'ne bölünerek gösteriliyor: motor 25× ölçekle
// çalışıyor (Görev 07, ondalık temizliği) ama oyuncuya "1875 ağır vuruş" demek hiçbir şey
// anlatmaz. Tasarımdaki ham sayı okunur olan.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, PERDE, BOSLUK, KOSE, KAGIT } from '../tema';
import { useOlcek } from '../olcu';
import { DENGE } from '../denge';

const M = DENGE.MUHAREBE;
const yuzde = (x) => Math.round(x * 100) + '%';
// Ham stat: motorun 25× ölçeğinden tasarımın okunur sayısına.
const ham = (x) => Math.round((x / DENGE.STAT_OLCEGI) * 10) / 10;

function Bolum({ baslik, children }) {
  return (
    <View style={s.bolum}>
      <Text style={s.bolumBaslik}>{baslik}</Text>
      {children}
    </View>
  );
}

function Madde({ children }) {
  return <Text style={s.madde}>{children}</Text>;
}

// Birlik tablosu — sütunlar sabit genişlikte, yoksa rakamlar hizalanmaz ve tablo
// okunmaz hâle gelir (diplomasi GÜÇ sekmesindeki kuralın aynısı).
function BirlikTablosu() {
  return (
    <View>
      <View style={s.tabloBaslik}>
        <Text style={[s.hucreAd, s.tabloBaslikMetin]}>BİRLİK</Text>
        <Text style={[s.hucre, s.tabloBaslikMetin]}>BEDEL</Text>
        <Text style={[s.hucre, s.tabloBaslikMetin]}>ZIRH</Text>
        <Text style={[s.hucre, s.tabloBaslikMetin]}>AĞIR</Text>
        <Text style={[s.hucre, s.tabloBaslikMetin]}>HAFİF</Text>
        <Text style={[s.hucre, s.tabloBaslikMetin]}>CAN</Text>
      </View>
      {DENGE.BIRIM_SIRASI.map((tur) => {
        const b = DENGE.BIRIMLER[tur];
        return (
          <View key={tur} style={s.tabloSatir}>
            <Text style={s.hucreAd}>{b.ad}</Text>
            <Text style={s.hucre}>
              {b.nufus}n {b.ekonomi}e
            </Text>
            <Text style={s.hucre}>{ham(b.zirh)}</Text>
            <Text style={s.hucre}>{ham(b.agirVurus)}</Text>
            <Text style={s.hucre}>{ham(b.hafifVurus)}</Text>
            <Text style={s.hucre}>{ham(b.dayaniklilik)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function YardimEkrani({ onKapat }) {
  const { telefon } = useOlcek();
  const A = DENGE.ARAZI;
  const D = DENGE.DIPLOMASI;

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>NASIL OYNANIR</Text>
          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <ScrollView style={s.liste} contentContainerStyle={s.listeIc}>
          <Bolum baslik="AMAÇ">
            <Madde>
              Bir ilin başındasın. Ordu basıp komşu bölgeleri alarak seçtiğin kazanma koşuluna
              ulaşmaya çalışıyorsun.
            </Madde>
            {Object.keys(DENGE.MOD.TIPLER).map((k) => {
              const t = DENGE.MOD.TIPLER[k];
              return (
                <Madde key={k}>
                  <Text style={s.vurgu}>{t.ad}</Text> —{' '}
                  {t.ESIK_ORANI === null
                    ? 'süre dolduğunda en çok bölgeyi tutan kazanır.'
                    : 'kapsamdaki bölgelerin ' + yuzde(t.ESIK_ORANI) + "'ini al."}
                </Madde>
              );
            })}
            <Madde>
              Süre dolduğunda kimse eşiğe ulaşamamışsa{' '}
              {DENGE.MOD.SURE_DOLUNCA === 'toprak'
                ? 'en çok bölgeyi tutan kazanır.'
                : 'eşiğe ulaşamayan kaybeder.'}
            </Madde>
          </Bolum>

          <Bolum baslik="BİRLİKLER">
            <Madde>
              Bedel <Text style={s.vurgu}>n</Text> nüfus, <Text style={s.vurgu}>e</Text> ekonomi
              demek. Zırh HAFİF vuruşu çok keser, AĞIR vuruşu az — ağır vuruş zırhı deler.
            </Madde>
            <BirlikTablosu />
            <Madde>
              Yani: <Text style={s.vurgu}>zırhlıya karşı topçu</Text>, kalabalık piyadeye karşı yine{' '}
              <Text style={s.vurgu}>piyade</Text> daha iyi iş görür. Zırhlının zayıflığı arazidir.
            </Madde>
            <Madde>
              Bir ilde tur başına en fazla o ilin <Text style={s.vurgu}>sanayi</Text> kadar birlik
              basabilirsin.
            </Madde>
          </Bolum>

          <Bolum baslik="ARAZİ">
            <Madde>
              Savaş HEDEF bölgenin arazisinde geçer. Savunan tarafın vuruşu araziye göre güçlenir:
            </Madde>
            <Madde>
              • Ova — savunana katkı yok, zırhlı{' '}
              <Text style={s.vurgu}>{yuzde(A.ova.zirhli - 1)}</Text> güçlü
            </Madde>
            <Madde>
              • Tepelik — savunan <Text style={s.vurgu}>+{yuzde(A.tepelik.savunan - 1)}</Text>,
              zırhlı {yuzde(A.tepelik.zirhli - 1)} zayıf
            </Madde>
            <Madde>
              • Dağlık — savunan <Text style={s.vurgu}>+{yuzde(A.daglik.savunan - 1)}</Text>, zırhlı{' '}
              {yuzde(A.daglik.zirhli - 1)} zayıf
            </Madde>
          </Bolum>

          <Bolum baslik="SAVAŞ">
            <Madde>
              {/* ⚠ BURADA "NaN%" YAZIYORDU (2026-08-12'de bulundu). `M.MORAL.BOZGUN_ORANI`
                  2026-08-08'de `M.MORAL.TABAN`'a taşındı ama bu satır eski adı okumaya devam
                  etti; `yuzde(undefined)` → "NaN%". Telefonda dört gün boyunca öyle göründü.
                  Artık taban okunuyor ve moralin EK olduğu cümleyle anlatılıyor — çünkü eşik
                  tek bir sayı değil (taban + ilin morali + durum kalemleri). */}
              Savaş raunt raunt çözülür. İki taraf da aynı anda vurur; bir ordu canının{' '}
              <Text style={s.vurgu}>{yuzde(M.MORAL.TABAN)}</Text> kadarını kaybedince bozulup
              çekilir ve çekilirken {M.CEKILME_KAYBI} birlik daha kaybeder. Morali yüksek iller daha
              uzun dayanır.
            </Madde>
            <Madde>
              Sağ kalanların bir kısmı <Text style={s.vurgu}>yaralı</Text> döner: aynı güçle vurur
              ama canı {yuzde(M.YARALI_CAN)} kadardır. Ezici kazanılan savaşta kimseye bir şey
              olmaz.
            </Madde>
            <Madde>
              <Text style={s.vurgu}>Şans</Text> yalnızca güçler yakınken devrededir. Güç farkı{' '}
              {M.SANS_KAPANMA_ORANI} katı aşarsa şans tamamen kapanır — zayıf ordu güçlü orduyu asla
              tesadüfen yenemez.
            </Madde>
            {M.BASKIN.ACIK ? (
              <Madde>
                Denk savaşlarda küçük bir ihtimalle <Text style={s.vurgu}>BASKIN</Text> olur: zayıf
                taraf ilk raundu bedavaya alır, güçlü taraf o raunt karşılık veremez.
              </Madde>
            ) : null}
          </Bolum>

          <Bolum baslik="TUR">
            {/* Görev 15'ten beri hamle VERİLDİĞİ AN çözülüyor (emir kuyruğu yok) ve hak türe
                göre — eski metin "emirler tur sonunda çözülür, her birlik iki hamle" diyordu. */}
            <Madde>
              Hamlen verdiğin an olur: orduna dokun, parlayan hedeflerden birine iki kez dokun. Bir
              turda piyade <Text style={s.vurgu}>{DENGE.HAREKET.HAMLE_HAKKI.piyade}</Text>, topçu{' '}
              <Text style={s.vurgu}>{DENGE.HAREKET.HAMLE_HAKKI.topcu}</Text>, zırhlı{' '}
              <Text style={s.vurgu}>{DENGE.HAREKET.HAMLE_HAKKI.zirhli}</Text> kez hareket eder. TURU
              BİTİR deyince sıra rakiplere geçer.
            </Madde>
            <Madde>
              Yıpranmış ordu, orduna dokununca çıkan <Text style={s.vurgu}>TOPARLAN</Text> ile
              doldurulur — sıfırdan basmaktan ucuz, ama o tur yaralılar savaşmaz.
            </Madde>
          </Bolum>

          <Bolum baslik="DİPLOMASİ">
            <Madde>
              Herkesle <Text style={s.vurgu}>barış</Text> halinde başlarsın ve barıştaki bir devlete
              saldıramazsın: önce <Text style={s.vurgu}>savaş ilan</Text> etmelisin. İlk{' '}
              {D.ILAN.BARIS_TURU} tur boyunca kimse ilan edemez.
            </Madde>
            <Madde>
              Bir devlete savaş ilan edersen <Text style={s.vurgu}>müttefikleri de</Text> karşına
              geçer.
            </Madde>
            <Madde>
              En fazla {D.EN_COK_ITTIFAK} anlaşman olabilir. Anlaşmayı bozarsan {D.IHANET_SURESI}{' '}
              tur boyunca kimse seninle masaya oturmaz.
            </Madde>
            <Madde>
              Diplomasi listende <Text style={s.vurgu}>komşuların</Text> ve{' '}
              <Text style={s.vurgu}>toprağının bulunduğu bölgelerdeki</Text> devletler görünür.
            </Madde>
          </Bolum>

          <Bolum baslik="RAKİPLER">
            <Madde>
              Her il bir <Text style={s.vurgu}>karakter</Text> taşır ve her yeni oyunda yeniden
              dağılır:
            </Madde>
            {DENGE.ZEKA.KARAKTER_SIRASI.map((k) => (
              <Madde key={k}>
                • <Text style={s.vurgu}>{DENGE.ZEKA.KARAKTERLER[k].ad}</Text>
                {k === 'saldirgan'
                  ? ' — çabuk savaş açar, fırsat kollar.'
                  : k === 'cekimser'
                    ? ' — kolay saldırmaz, anlaşmaya açıktır.'
                    : ' — ortada durur.'}
              </Madde>
            ))}
            <Madde>
              Karakteri yalnızca <Text style={s.vurgu}>tanıdığın</Text> devletlerde görebilirsin;
              uzaktakinin huyu bilinmez.
            </Madde>
          </Bolum>

          <Text style={s.dipnot}>
            Buradaki bütün sayılar oyunun kendi denge tablosundan okunur — oyun güncellenirse bu
            ekran da kendiliğinden güncellenir.
          </Text>
        </ScrollView>
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
    width: '82%',
    maxWidth: 660,
    height: '92%',
    paddingVertical: BOSLUK.genis,
    paddingHorizontal: BOSLUK.genis,
    backgroundColor: KAGIT.yuzey,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    borderRadius: KOSE.kutu,
  },
  kutuDar: { width: '94%', paddingHorizontal: BOSLUK.orta },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: 2.2,
    color: KAGIT.yazi,
  },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 24, lineHeight: 26, color: KAGIT.yaziIkincil },
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
    marginBottom: 4,
  },
  madde: {
    fontFamily: YAZI.govde,
    fontSize: 12,
    lineHeight: 17,
    color: KAGIT.yaziIkincil,
    marginBottom: 3,
  },
  vurgu: { fontFamily: YAZI.govdeKalin, color: KAGIT.yazi },

  tabloBaslik: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
    marginTop: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: KAGIT.cizgi,
  },
  tabloBaslikMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 9,
    letterSpacing: 0.8,
    color: KAGIT.yaziSoluk,
  },
  tabloSatir: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  hucreAd: {
    flex: 1,
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 15,
    color: KAGIT.yazi,
  },
  hucre: {
    width: 52,
    fontFamily: YAZI.govde,
    fontSize: 11,
    lineHeight: 15,
    color: KAGIT.yaziIkincil,
    textAlign: 'right',
  },

  dipnot: {
    fontFamily: YAZI.govde,
    fontSize: 10,
    lineHeight: 14,
    color: KAGIT.yaziSoluk,
    marginTop: BOSLUK.genis,
  },
});
