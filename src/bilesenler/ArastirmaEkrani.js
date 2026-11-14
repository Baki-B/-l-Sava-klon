// ARAŞTIRMA EKRANI — ordu kalitesinin yükseltildiği yer (Görev 06, 07; ağaç Görev 20).
//
// ┌─ AĞAÇ OLARAK ÇİZİLİYOR (Baki, 2026-09-23: "araştırmaları Polytopia'daki gibi bir ağaç
// │ gibi yapalım") ─────────────────────────────────────────────────────────────────────┐
// │ Eskiden iki kademeliydi: önce birlik seçiliyor, sonra o birliğin dört dalı uzun        │
// │ açıklamalarıyla alt alta diziliyordu. Oyuncu "neyi açtım, sırada ne var" sorusunu     │
// │ okuyarak cevaplıyordu. Artık TEK EKRAN: üç birlik yan yana, her birinin altında dört   │
// │ dal, dalda kademeler düğüm düğüm. Polytopia'nın teknoloji ağacı gibi bakınca okunur:  │
// │   • dolu düğüm  = alınmış kademe                                                       │
// │   • çerçeveli   = sıradaki kademe (pirinç: puanın yetiyor; soluk: henüz yetmiyor)      │
// │   • silik       = daha ileri kademe                                                    │
// │ Dala dokununca altta sıradaki kademenin etkisi SAYIYLA ("10 → 12") ve ARAŞTIR düğmesi.│
// │                                                                                        │
// │ ÖZEL YETENEK AĞACIN UCU (Baki: "evet", GOREV-20 §13): ortak dalların altında, kilitli │
// │ düğüm. O birliğin herhangi bir dalı 2. kademeye çıkınca kilit düşer ve uca inen yol   │
// │ pirinçle yanar — kural `arastirma.js ozelAcikMi`, ekran yalnızca `kilitli`'yi okur.  │
// └────────────────────────────────────────────────────────────────────────────────────────┘
//
// SAYILAR BURADA UYDURULMUYOR: etki `arastirma.js dalEtkisi`'nden (gerçek `birimStatlari`
// hesabı), durum `dalDurumu`'ndan geliyor. Ekran kendi sayısını yazarsa muharebede olan
// başka olur (Görev 06'nın kuralı).
//
// TAM PERDE, savaş odasının kalıbıyla: perde hem gözü karara odaklıyor hem arkadaki
// dokunmayı yutuyor; harita jesti ayrıca `dokunmaKapali` ile susturuluyor (App.js).

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PANEL, YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, DURUM } from '../tema';
import { IkonArastirma, IkonSikke, IkonTik, IkonKilit, BIRIM_IKONU, DAL_IKONU } from './Ikonlar';
import { useOlcek } from '../olcu';

// Puan kesirli birikiyor ama ekranda AŞAĞI yuvarlanıyor — Görev 04'te bütçe için konan
// kuralın aynısı: oyuncu "12 puan" görüp 12'lik yükseltmeyi yapabilmeli.
function puanYazi(x) {
  return String(Math.floor(x));
}

function Sayac({ deger, enCok, onAz, onCok }) {
  const azPasif = deger <= 0;
  const cokPasif = deger >= enCok;
  return (
    <View style={s.sayac}>
      <Pressable
        onPress={onAz}
        disabled={azPasif}
        hitSlop={8}
        style={[s.tus, azPasif && s.tusPasif]}
      >
        <Text style={[s.tusMetin, azPasif && s.tusMetinPasif]}>−</Text>
      </Pressable>
      <Text style={s.sayi}>{deger}</Text>
      <Pressable
        onPress={onCok}
        disabled={cokPasif}
        hitSlop={8}
        style={[s.tus, cokPasif && s.tusPasif]}
      >
        <Text style={[s.tusMetin, cokPasif && s.tusMetinPasif]}>+</Text>
      </Pressable>
    </View>
  );
}

// Dalın kademe sayısı: özel yetenek tek, ortak dallar üç (tavan `dalDurumu`'ndan da
// okunabilir ama düğüm çizmek için seviye + sıradaki yeter).
function kademeSayisi(d) {
  return d.ozel ? 1 : Math.max(d.seviye, d.sonraki || 0, 3);
}

// Bir düğüm: alınmış / sıradaki (hazır ya da değil) / silik / kilitli (özel yetenek).
function Dugum({ d, kademe, secili, onPress }) {
  const Ikon = DAL_IKONU[d.dal];
  const alinmis = kademe <= d.seviye;
  const siradaki = !d.tavanda && !d.kilitli && kademe === d.seviye + 1;
  const hazir = siradaki && d.yeter;
  const renk = alinmis
    ? ZEMIN.taban
    : hazir
      ? PANEL.pirinc
      : siradaki
        ? YAZI_RENK.ikincil
        : CIZGI.ince;
  return (
    <Pressable onPress={onPress} hitSlop={4} style={s.dugumKap}>
      <View
        style={[
          s.dugum,
          alinmis && s.dugumAlinmis,
          siradaki && s.dugumSiradaki,
          hazir && s.dugumHazir,
          secili && siradaki && s.dugumSecili,
        ]}
      >
        {Ikon ? <Ikon size={16} color={renk} /> : null}
        {/* Kilit köşede: yeteneğin ne olduğu görünsün, alınamadığı da. */}
        {d.kilitli ? (
          <View style={s.kilitRozet}>
            <IkonKilit size={11} color={YAZI_RENK.ikincil} />
          </View>
        ) : null}
      </View>
      {secili && d.kilitli ? <View style={s.seciliCizgi} /> : null}
    </Pressable>
  );
}

// n sütunun ortalarını birleştiren yatay kolun genişliği: ilk ve son sütunun ortası
// arası = (n − 1) / n. (3 sütun → %66.7, 2 sütun → %50.)
function kolGenisligi(n) {
  return n > 1 ? ((n - 1) / n) * 100 + '%' : 0;
}

// Bir birimin ağacı: kökte birlik, altında ortak dallar, en altta (UÇTA) özel yetenek.
function Agac({ agac, secili, onSec }) {
  const Kok = BIRIM_IKONU[agac.birim];
  const hazir = agac.hazir;
  const ortak = agac.dallar.filter((d) => !d.ozel);
  const uclar = agac.dallar.filter((d) => d.ozel);
  // Uca inen yol yanıyor mu: yetenek alınabilir ya da alınmış (kilitli değil).
  const acik = uclar.some((d) => !d.kilitli);
  const seciliMi = (d) => secili && secili.birim === d.birim && secili.dal === d.dal;
  return (
    <View style={s.agac}>
      <View style={[s.kok, hazir && s.kokHazir]}>
        {Kok ? <Kok size={26} color={YAZI_RENK.birincil} /> : null}
      </View>
      {/* Kökten dallara inen çatal: dikey sap + yatay kol. */}
      <View style={s.sap} />
      <View style={[s.kol, { width: kolGenisligi(ortak.length) }]} />
      <View style={s.dallar}>
        {ortak.map((d) => (
          <View key={d.dal} style={s.dalSutun}>
            {Array.from({ length: kademeSayisi(d) }, (_, i) => i + 1).map((k) => (
              <View key={k} style={s.dalAdim}>
                <View style={[s.bag, k <= d.seviye + 1 && s.bagAcik]} />
                <Dugum
                  d={d}
                  kademe={k}
                  secili={seciliMi(d)}
                  onPress={() => onSec({ birim: d.birim, dal: d.dal })}
                />
              </View>
            ))}
            {/* Dalın ucundan özel yeteneğe inen bağ. */}
            <View style={[s.bag, acik && s.bagUc]} />
          </View>
        ))}
      </View>
      {/* Dalları uçta birleştiren kol → özel yeteneğe inen sap. */}
      <View style={[s.kol, { width: kolGenisligi(ortak.length) }, acik && s.kolUc]} />
      <View style={[s.sap, acik && s.sapUc]} />
      {uclar.length > 1 ? (
        <View style={[s.kol, { width: kolGenisligi(uclar.length) }, acik && s.kolUc]} />
      ) : null}
      <View style={s.dallar}>
        {uclar.map((d) => (
          <View key={d.dal} style={s.dalSutun}>
            {uclar.length > 1 ? <View style={[s.bag, acik && s.bagUc]} /> : null}
            <Dugum
              d={d}
              kademe={1}
              secili={seciliMi(d)}
              onPress={() => onSec({ birim: d.birim, dal: d.dal })}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ArastirmaEkrani({
  arastirma, // oyunKancasi.arastirma — düz veri, ekran oyun durumunu tanımaz
  onAyir, // (miktar) => void
  onYukselt, // (birim, dal) => void
  onGeriAl, // () => void
  onKapat,
}) {
  const { telefon } = useOlcek();
  const a = arastirma;
  const [secili, setSecili] = useState(null);
  const agac = secili ? a.agaclar.find((x) => x.birim === secili.birim) : null;
  const d = agac ? agac.dallar.find((x) => x.dal === secili.dal) : null;
  const Ikon = d ? DAL_IKONU[d.dal] : null;

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />

      <View style={[s.kutu, telefon && s.kutuDar]}>
        {/* ---- BAŞLIK: puan ve tur başı kazanç ---- */}
        <View style={s.baslikSatir}>
          <IkonArastirma size={telefon ? 20 : 24} color={YAZI_RENK.birincil} sivi={ZEMIN.yuzey} />
          <Text style={s.baslik}>ARAŞTIRMA</Text>
          <View style={s.puan}>
            <Text style={s.puanSayi}>{puanYazi(a.puan)}</Text>
            {a.turBasiKazanc > 0 ? <Text style={s.kazanc}>+{a.turBasiKazanc}</Text> : null}
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onKapat} hitSlop={14} style={s.kapat}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        {/* ---- AĞAÇ ---- */}
        <ScrollView style={s.govde} contentContainerStyle={s.agaclar}>
          {a.agaclar.map((x) => (
            <Agac key={x.birim} agac={x} secili={secili} onSec={setSecili} />
          ))}
        </ScrollView>

        {/* ---- SEÇİLEN DAL: sıradaki kademenin etkisi, bedeli, ARAŞTIR ---- */}
        <View style={s.secim}>
          {d ? (
            <>
              {Ikon ? <Ikon size={20} color={YAZI_RENK.birincil} /> : null}
              <View style={s.secimMetin}>
                <Text style={s.secimAd} numberOfLines={1}>
                  {d.ad.toLocaleUpperCase('tr')}
                </Text>
                <Text style={s.secimEtki} numberOfLines={2}>
                  {d.tavanda
                    ? d.etki && d.etki.simdiki
                      ? d.etki.simdiki
                      : d.etki && d.etki.tip === 'stat'
                        ? String(d.etki.once)
                        : ''
                    : d.etki && d.etki.tip === 'stat'
                      ? d.etki.once + ' → ' + d.etki.sonra
                      : d.etki
                        ? d.etki.cumle
                        : ''}
                </Text>
              </View>
              {d.tavanda ? (
                <IkonTik size={20} color={DURUM.arti} />
              ) : d.kilitli ? (
                // KAPI simgeyle: kilit + içinde kademe sayısı yazan bir düğüm — "bir dalı bu
                // kademeye çıkar". Cümle yok (§5/10).
                <View style={s.kapi}>
                  <IkonKilit size={18} color={YAZI_RENK.ikincil} />
                  <View style={s.kapiDugum}>
                    <Text style={s.kapiSayi}>{a.ozelOnkosul}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={[s.bedel, !d.yeter && s.bedelYetmez]}>{d.bedel}</Text>
                  <Pressable
                    onPress={() => onYukselt(d.birim, d.dal)}
                    disabled={!d.yeter}
                    style={[s.yukselt, !d.yeter && s.yukseltPasif]}
                  >
                    <Text style={[s.yukseltMetin, !d.yeter && s.yukseltMetinPasif]}>ARAŞTIR</Text>
                  </Pressable>
                </>
              )}
            </>
          ) : null}
        </View>

        {/* ---- BÜTÇE: bu tur araştırmaya ne kadar ayrılıyor (Görev 04 kalıbı) ---- */}
        <View style={s.altSatir}>
          <IkonSikke size={18} color={YAZI_RENK.ikincil} />
          <Sayac
            deger={a.ayrilan}
            enCok={a.enCokAyrilabilir}
            onAz={() => onAyir(a.ayrilan - 1)}
            onCok={() => onAyir(a.ayrilan + 1)}
          />
          <View style={{ flex: 1 }} />
          {a.geriAlinabilir ? (
            <Pressable onPress={onGeriAl} style={s.geriAl} hitSlop={6}>
              <Text style={s.geriAlMetin}>GERİ AL</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const DUGUM = 30;

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.orta },
  kutu: {
    width: 640,
    maxWidth: '94%',
    maxHeight: '94%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 14,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.55,
    shadowRadius: 26,
    elevation: 26,
  },
  kutuDar: { paddingVertical: 9, paddingHorizontal: 12 },

  baslikSatir: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 2.2,
    color: YAZI_RENK.birincil,
  },
  puan: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginLeft: 6 },
  puanSayi: { fontFamily: YAZI.sayi, fontSize: 18, lineHeight: 22, color: YAZI_RENK.birincil },
  kazanc: { fontFamily: YAZI.sayi, fontSize: 12, lineHeight: 16, color: DURUM.arti },
  kapat: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  kapatX: { fontSize: 24, color: YAZI_RENK.ikincil, lineHeight: 26 },

  govde: { flexShrink: 1, marginTop: 8 },
  agaclar: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },

  agac: { flex: 1, alignItems: 'center' },
  kok: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kokHazir: { borderColor: PANEL.pirinc },
  sap: { width: 1.5, height: 8, backgroundColor: CIZGI.ince },
  // Yatay kol dal sütunlarının ortalarını birleştiriyor; genişliği `kolGenisligi`.
  kol: { height: 1.5, backgroundColor: CIZGI.ince },
  // Uca giden yol: kilit açıkken pirinç (ağacın "yanan" kısmı), kapalıyken sessiz.
  kolUc: { backgroundColor: PANEL.pirinc },
  sapUc: { backgroundColor: PANEL.pirinc },
  bagUc: { backgroundColor: PANEL.pirinc },
  dallar: { flexDirection: 'row', alignSelf: 'stretch' },
  dalSutun: { flex: 1, alignItems: 'center' },
  dalAdim: { alignItems: 'center' },
  bag: { width: 1.5, height: 7, backgroundColor: CIZGI.ayrac },
  bagAcik: { backgroundColor: CIZGI.ince },

  dugumKap: { alignItems: 'center' },
  dugum: {
    width: DUGUM,
    height: DUGUM,
    borderRadius: DUGUM / 2,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dugumAlinmis: { backgroundColor: PANEL.pirinc, borderColor: PANEL.pirinc },
  dugumSiradaki: { borderColor: YAZI_RENK.ikincil, backgroundColor: ZEMIN.cukur },
  dugumHazir: { borderColor: PANEL.pirinc, borderWidth: 2 },
  dugumSecili: { borderColor: YAZI_RENK.birincil, borderWidth: 2 },
  kilitRozet: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: ZEMIN.yuzey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Kilitli düğüm seçilince halka yerine altında kısa bir çizgi (düğüm "sıradaki" değil).
  seciliCizgi: {
    width: 16,
    height: 2,
    marginTop: 3,
    borderRadius: 1,
    backgroundColor: YAZI_RENK.birincil,
  },
  kapi: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kapiDugum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: YAZI_RENK.ikincil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kapiSayi: { fontFamily: YAZI.sayi, fontSize: 13, lineHeight: 16, color: YAZI_RENK.birincil },

  secim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CIZGI.ayrac,
  },
  secimMetin: { flex: 1, minWidth: 0 },
  secimAd: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: YAZI_RENK.birincil,
  },
  secimEtki: {
    fontFamily: YAZI.govdeKalin,
    fontSize: 13,
    lineHeight: 17,
    color: YAZI_RENK.birincil,
  },
  bedel: { fontFamily: YAZI.sayi, fontSize: 16, lineHeight: 20, color: PANEL.pirinc },
  bedelYetmez: { color: YAZI_RENK.soluk },
  yukselt: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: PANEL.pirinc,
    backgroundColor: ZEMIN.cukur,
  },
  yukseltPasif: { borderColor: CIZGI.ayrac, backgroundColor: 'transparent' },
  yukseltMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.4,
    color: YAZI_RENK.birincil,
  },
  yukseltMetinPasif: { color: YAZI_RENK.soluk },

  altSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: CIZGI.ayrac,
  },
  sayac: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tus: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tusPasif: { borderColor: CIZGI.ayrac },
  tusMetin: { fontSize: 19, lineHeight: 21, color: YAZI_RENK.birincil },
  tusMetinPasif: { color: YAZI_RENK.soluk },
  sayi: {
    fontFamily: YAZI.govdeKalin,
    fontSize: 17,
    lineHeight: 21,
    color: YAZI_RENK.birincil,
    minWidth: 26,
    textAlign: 'center',
  },
  geriAl: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
  },
  geriAlMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.2,
    color: YAZI_RENK.ikincil,
  },
});
