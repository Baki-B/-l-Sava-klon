// KOMUTAN EKRANI — yetenek ve kademe (Görev 16 / Adım 6; kartlara dönüş Görev 20).
//
// ┌─ NEDEN BAŞTAN KURULDU (Baki, 2026-09-23: "komutan ekleme bölümü şu anki hâliyle kötü")┐
// │ Ekran bir FORMDU: dört yetenek birer cümleyle, kademe sayıyla, en altta ordular        │
// │ ADLARIYLA bir liste — komutanı nereye koyduğunu haritada göremiyordun ve listeye       │
// │ dokunmak onu anında atıyordu. Öneri Baki'ye sunuldu, cevap "olsun":                   │
// │   • ATAMA HARİTADAN: kendi orduna dokun → bölge panelinde ordunun başlığındaki         │
// │     komutan simgesi (`IlPaneli KomutanSimgesi`). Ordular listesi buradan kalktı.       │
// │   • BURADA yalnızca komutanın KENDİSİ: dört simgeli yetenek kartı, kartta tek sayı,    │
// │     üç yıldızlı kademe. Kilitli yıldız: kilit + kalan mühür puanı.                     │
// └────────────────────────────────────────────────────────────────────────────────────────┘
//
// SEÇİM NE ZAMAN İŞLER: yetenek, kademe ve birlik bir TASLAK (App.js `komutanTaslagi`).
//   • Komutan sahadaysa UYGULA taslağı yerinde uygular — bu turun atama hakkını harcar
//     (motorun kuralı: yetenek değişimi bir atamadır, `komutan.js komutanAta`).
//   • Sahada değilse taslak bekler; haritadan atadığın an o yetenekle geçer.
//
// ⚠ KÂĞIT ZEMİN, KÂĞIDIN YAZI RENKLERİ (düzeltme 2026-09-24): ekran kâğıt yüzeyde (`KAGIT`)
// ama yazı ve simgeler koyu zeminin AÇIK renkleriyle (`YAZI_RENK`) çiziliyordu — açık
// kâğıtta açık yazı, okunmuyordu. Öteki kâğıt ekranları (mühürler, tur raporu, ordular)
// gibi artık `KAGIT` üçlüsü; vurgu pirinç yerine koyu altın (`METAL.altin.govde`), çünkü
// pirinç açık kâğıtta silikleşiyor.
//
// ---- BU EKRAN KURAL BİLMEZ ----
// Hangi kademenin açık olduğu, yeteneğin boşa gidip gitmediği, atama hakkı — hepsi
// kancadan hazır geliyor (CLAUDE.md §3). Kademenin SAYISI `DENGE`den okunuyor.

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { YAZI, PERDE, BOSLUK, KOSE, KAGIT, METAL } from '../tema';
import { useOlcek } from '../olcu';
import { DENGE } from '../denge';
import {
  IkonKomutan,
  IkonYildiz,
  IkonKilit,
  IkonTik,
  IkonCarpi,
  IkonDalZirh,
  YETENEK_IKONU,
  BIRIM_IKONU,
} from './Ikonlar';

// Kartların sırası ve adı. Tarif cümlesi YOK: simge + ad + tek sayı.
const YETENEKLER = [
  { anahtar: 'celikYurek', ad: 'ÇELİK YÜREK' },
  { anahtar: 'silahUstasi', ad: 'SİLAH USTASI' },
  { anahtar: 'dagKomutani', ad: 'DAĞ KOMUTANI' },
  { anahtar: 'toplanmaUstasi', ad: 'TOPLANMA USTASI' },
];

// Kartın tek sayısı — seçili kademede ne verdiği. DENGE'den okunuyor: denge sayısı
// değişirse ekran kendiliğinden düzelir (Görev 06'nın kuralı).
function kademeDegeri(anahtar, kademe) {
  const Y = DENGE.KOMUTAN.YETENEKLER[anahtar];
  if (!Y) return { sayi: '' };
  const i = kademe - 1;
  if (anahtar === 'celikYurek')
    // Kademe 3 bir eşik değil, kural değişimi: hiç çekilmez (ya kazanır ya yok olur).
    return Y.OLUMUNE[i]
      ? { sayi: 'ÖLÜMÜNE', kelime: true }
      : { sayi: '+' + Y.KALEM[i], ek: 'moral' };
  if (anahtar === 'silahUstasi') return { sayi: '+' + Y.SEVIYE[i], ek: 'kademe' };
  if (anahtar === 'dagKomutani') return { sayi: '%' + Math.round(Y.TELAFI[i] * 100), ek: 'arazi' };
  if (anahtar === 'toplanmaUstasi') return { sayi: '+' + Y.EK_BUTCE[i], ek: 'bütçe' };
  return { sayi: '' };
}

function YetenekKarti({ y, secili, kademe, onPress }) {
  const Ikon = YETENEK_IKONU[y.anahtar];
  const d = kademeDegeri(y.anahtar, kademe);
  const renk = secili ? METAL.altin.govde : KAGIT.yazi;
  return (
    <Pressable style={[s.kart, secili && s.kartSecili]} onPress={onPress}>
      {Ikon ? <Ikon size={30} color={renk} /> : null}
      <Text style={[s.kartAd, secili && s.kartAdSecili]} numberOfLines={1}>
        {y.ad}
      </Text>
      <View style={s.degerSatir}>
        <Text style={[s.deger, d.kelime && s.degerKelime]}>{d.sayi}</Text>
        {d.ek ? <Text style={s.degerEk}>{d.ek}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function KomutanEkrani({
  komutan, // oyunKancasi.komutan — düz veri
  taslak, // { yetenek, kademe, birim } — ekranda seçili olan (App.js)
  onTaslak, // (taslak) => void
  onUygula, // () => void — komutan sahadayken taslağı yerinde uygular
  onGit, // () => void — komutanın durduğu bölgeyi haritada seç
  onKapat,
}) {
  const { telefon } = useOlcek();
  const hak = komutan.kademeHakki;
  const enCok = DENGE.KOMUTAN.EN_COK_KADEME;
  const cezali = komutan.bekleme > 0;
  const sahada = !!komutan.parcaId;
  const kademe = Math.min(taslak.kademe || 1, hak);
  const degisti =
    taslak.yetenek !== komutan.yetenek ||
    kademe !== komutan.kademe ||
    (taslak.yetenek === 'silahUstasi' && taslak.birim !== komutan.birim);
  const sec = (x) => onTaslak({ ...taslak, kademe, ...x });

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        {/* ---- BAŞLIK + KOMUTAN NEREDE ---- */}
        <View style={s.baslikSatiri}>
          <IkonKomutan size={22} color={METAL.altin.govde} />
          <Text style={s.baslik}>KOMUTAN</Text>
          <View style={{ flex: 1 }} />
          {cezali ? (
            // Ordusu bozuldu: kilit + kaç tur.
            <View style={[s.cip, s.cipUyari]}>
              <IkonKilit size={15} color={KAGIT.eksi} />
              <Text style={[s.cipSayi, { color: KAGIT.eksi }]}>{komutan.bekleme}</Text>
            </View>
          ) : sahada ? (
            // Sahada: yerin adı — dokununca haritada o bölge seçilir.
            <Pressable style={s.cip} onPress={onGit} hitSlop={8}>
              <IkonKomutan size={15} color={METAL.altin.govde} />
              <Text style={s.cipMetin} numberOfLines={1}>
                {komutan.parcaAd}
              </Text>
            </Pressable>
          ) : (
            // Henüz sahada değil: nasıl atanacağı resimle — ordu (kalkan) → komutan simgesi.
            <View style={s.cip}>
              <IkonDalZirh size={15} color={KAGIT.yaziIkincil} />
              <Text style={s.cipOk}>›</Text>
              <IkonKomutan size={15} color={KAGIT.yaziIkincil} />
            </View>
          )}
          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        {/* ---- DÖRT YETENEK ---- */}
        <View style={s.kartlar}>
          {YETENEKLER.map((y) => (
            <YetenekKarti
              key={y.anahtar}
              y={y}
              kademe={kademe}
              secili={taslak.yetenek === y.anahtar}
              onPress={() => sec({ yetenek: y.anahtar })}
            />
          ))}
        </View>

        {/* ---- KADEME YILDIZLARI + (Silah Ustası'nda) BİRLİK ---- */}
        <View style={s.altSatir}>
          <View style={s.yildizlar}>
            {Array.from({ length: enCok }, (_, i) => i + 1).map((n) => {
              const kilit = n > hak;
              return (
                <Pressable
                  key={n}
                  onPress={kilit ? undefined : () => sec({ kademe: n })}
                  disabled={kilit}
                  hitSlop={6}
                  style={s.yildiz}
                >
                  <IkonYildiz
                    size={26}
                    color={kilit ? KAGIT.cizgi : METAL.altin.govde}
                    dolu={!kilit && n <= kademe}
                  />
                </Pressable>
              );
            })}
            {/* Sonraki yıldız kilitliyse: kilit + kalan mühür puanı (mühürler başarımlardan). */}
            {hak < enCok ? (
              <View style={s.kilitNot}>
                <IkonKilit size={13} color={KAGIT.yaziIkincil} />
                <Text style={s.kilitSayi}>{komutan.kademeyeKalan}</Text>
              </View>
            ) : null}
          </View>

          {taslak.yetenek === 'silahUstasi' ? (
            <View style={s.birlikler}>
              {DENGE.BIRIM_SIRASI.map((t) => {
                const Ikon = BIRIM_IKONU[t];
                const secili = taslak.birim === t;
                // Bu birliğin araştırması zaten tavanda: yetenek orada bir şey yapmıyor.
                const bosa = komutan.bosaBirimler && komutan.bosaBirimler[t];
                return (
                  <Pressable
                    key={t}
                    style={[s.birlik, secili && s.birlikSecili]}
                    onPress={() => sec({ birim: t })}
                  >
                    {Ikon ? (
                      <Ikon size={22} color={secili ? METAL.altin.govde : KAGIT.yazi} />
                    ) : null}
                    {bosa ? (
                      <View style={s.bosa}>
                        <IkonCarpi size={11} color={KAGIT.eksi} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={{ flex: 1 }} />

          {/* UYGULA — yalnızca komutan sahadayken ve taslak farklıysa. Hak yoksa kilitli. */}
          {sahada && degisti ? (
            <Pressable
              style={[s.uygula, komutan.atamaHakki <= 0 && s.uygulaKapali]}
              onPress={onUygula}
              disabled={komutan.atamaHakki <= 0}
            >
              {komutan.atamaHakki <= 0 ? (
                <IkonKilit size={15} color={KAGIT.yaziSoluk} />
              ) : (
                <IkonTik size={15} color={KAGIT.yazi} />
              )}
              <Text style={[s.uygulaMetin, komutan.atamaHakki <= 0 && s.uygulaMetinKapali]}>
                UYGULA
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.koyu },
  kutu: {
    width: '78%',
    maxWidth: 680,
    maxHeight: '90%',
    backgroundColor: KAGIT.yuzey,
    borderRadius: KOSE.kutu,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    padding: BOSLUK.orta,
    gap: BOSLUK.orta,
  },
  kutuDar: { width: '92%', padding: BOSLUK.dar, gap: BOSLUK.dar },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.dar },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1.6,
    color: KAGIT.yazi,
  },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 22, lineHeight: 26, color: KAGIT.yaziIkincil },
  cip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: 220,
    paddingVertical: 4,
    paddingHorizontal: BOSLUK.dar,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
  },
  cipUyari: { borderColor: KAGIT.eksi },
  cipMetin: {
    flexShrink: 1,
    fontFamily: YAZI.govdeKalin,
    fontSize: 12.5,
    lineHeight: 16,
    color: KAGIT.yazi,
  },
  cipSayi: { fontFamily: YAZI.sayi, fontSize: 13, lineHeight: 16 },
  cipOk: { fontFamily: YAZI.govdeKalin, fontSize: 15, lineHeight: 17, color: KAGIT.yaziIkincil },

  kartlar: { flexDirection: 'row', gap: BOSLUK.dar },
  kart: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: BOSLUK.dar,
    paddingHorizontal: 4,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
  },
  kartSecili: { borderColor: METAL.altin.govde, borderWidth: 2, backgroundColor: KAGIT.kabartma },
  kartAd: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
    color: KAGIT.yaziIkincil,
  },
  kartAdSecili: { color: KAGIT.yazi },
  degerSatir: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  deger: { fontFamily: YAZI.sayi, fontSize: 19, lineHeight: 23, color: KAGIT.yazi },
  degerKelime: { fontFamily: YAZI.baslik, fontSize: 12, lineHeight: 23, letterSpacing: 0.8 },
  degerEk: { fontFamily: YAZI.govde, fontSize: 11, lineHeight: 14, color: KAGIT.yaziIkincil },

  altSatir: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.orta, minHeight: 40 },
  yildizlar: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  yildiz: { padding: 2 },
  kilitNot: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4 },
  kilitSayi: { fontFamily: YAZI.sayi, fontSize: 12, lineHeight: 15, color: KAGIT.yaziIkincil },
  birlikler: { flexDirection: 'row', gap: 6 },
  birlik: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
  },
  birlikSecili: { borderColor: METAL.altin.govde, borderWidth: 2, backgroundColor: KAGIT.kabartma },
  bosa: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: KAGIT.yuzey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uygula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: BOSLUK.orta,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: METAL.altin.govde,
  },
  uygulaKapali: { borderColor: KAGIT.cizgi },
  uygulaMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 1.2,
    color: KAGIT.yazi,
  },
  uygulaMetinKapali: { color: KAGIT.yaziSoluk },
});
