// DİPLOMASİ EKRANI — Görev 20'de sadeleştirildi (Baki, 2026-09-23: "çok fazla karmaşık").
//
// ┌─ NEDEN BAŞTAN KURULDU ───────────────────────────────────────────────────────────────┐
// │ Ekran bir OKUMA ekranıydı: üç sekme, üç süzgeç, her devlet için üç cümle ve 6–8       │
// │ satırlık bir tablo ("NASIL TANIDIN", "BÜYÜKLÜK: senden belirgin büyük", "CEPHESİ"…). │
// │ Her parça tek tek haklı gerekçeyle eklenmişti (2026-08-01: "direkt anlaşma yapa     │
// │ basıyon, reddediyor; olmamış") ama toplamı CLAUDE.md §5/10'un tam tersiydi.          │
// │                                                                                       │
// │ Baki'nin kararları (GOREV-20 §12):                                                    │
// │   1. ÜLKE sekmesi kalktı (bloklar haritanın ittifak görünümünde zaten renkli),        │
// │      GÜÇ kaldı — formülü yeni (`oyun/guc.js`, `DENGE.GUC`).                           │
// │   2. "Neden kabul etmiyor" YALNIZCA SİMGEYLE: kilit / soğuk yüz / gülen yüz.          │
// │   3. Diplomasi haritadan da açılıyor: bir ilin üstüne uzun basınca o devletin kartı.  │
// │   4. Soldaki küçük Türkiye (Baki: "hangi il neye göre gözüküyor orada?"): listedekiler │
// │      kendi renginde, kalanı sis — kim neden listede, bakınca görülüyor.               │
// └───────────────────────────────────────────────────────────────────────────────────────┘
//
// NASIL OKUNUYOR (Polytopia'nın kabile kartları gibi — bakınca anlaşılır):
//   • Kart = bir devlet: sahibinin renginde kare + adı + sağda ilişki simgesi
//     (kılıç: savaştasınız · el sıkışma: müttefik · zarf: masada teklifi var).
//   • Çubuk: toprağı; üstündeki çentik SENİN toprağın — büyük mü küçük mü tek bakışta.
//   • Yüz: teklifine bakışı (gülen: kabul eder · düz: sıcak bakmıyor · kilit: masa kapalı).
//   • Hedef + renkli noktalar: ortak düşmanlarınız. Kılıç + sayı: kaç cephede savaşıyor.
//   • Karta (ya da haritadaki toprağına) dokununca o devlet haritada parlar, eylemleri
//     haritanın altında açılır. Giden teklifin sonucu kartta tik ya da çarpı.
//
// HİÇBİR KURAL BURADA DEĞİL: "kabul eder mi" zekânın kendi hesabından (`teklifKabulMu`),
// düğmenin açık olup olmadığı `teklifGecerliMi`'den geliyor (kanca hazır veriyor).
//
// ⚠ HARİTA JESTİ AYRICA SUSTURULUYOR (App.js `dokunmaKapali`) — savaş odasının kalıbı.
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, DURUM, BOSLUK, KOSE, PANEL } from '../tema';
import { useOlcek } from '../olcu';
import {
  IkonDiplomasi,
  IkonSavas,
  IkonKilit,
  IkonYuz,
  IkonHedef,
  IkonZarf,
  IkonSikke,
  IkonTik,
  IkonCarpi,
  IkonIller,
} from './Ikonlar';
import DiplomasiHaritasi from './DiplomasiHaritasi';

// Kartların sırası: önce masada teklifi olan, sonra savaştığın, müttefiğin, komşun,
// bölgendeki, en son uzaktaki büyükler — yakından uzağa. Süzgeç düğmeleri bu sırayla
// gereksizleşti — aradığın devlet zaten üstte.
function oncelik(satir, teklifVar) {
  if (teklifVar) return 0;
  if (satir.durum === 'savas') return 1;
  if (satir.durum === 'ittifak') return 2;
  if (satir.nasil === 'sinirdas' || satir.nasil === 'iliski') return 3;
  if (satir.nasil === 'bolge') return 4;
  return 5;
}

// Bu devletle masadaki tek eylem: müttefiği bozmak, düşmanla ateşkes, kalanla anlaşma.
function eylemi(satir) {
  const eylem = satir.durum === 'ittifak' ? 'boz' : satir.durum === 'savas' ? 'ateskes' : 'ittifak';
  const gecerli = eylem === 'ateskes' ? satir.ateskesGecerli : satir.ittifakGecerli;
  return { eylem, gecerli };
}

// İlişki simgesi: teklif > savaş > müttefik; tarafsızda boş (varsayılan hâl).
function IliskiSimgesi({ satir, teklif, boyut }) {
  if (teklif) return <IkonZarf size={boyut} color={PANEL.pirinc} />;
  if (satir.durum === 'savas') return <IkonSavas size={boyut} color={DURUM.eksi} />;
  if (satir.durum === 'ittifak') return <IkonDiplomasi size={boyut} color={DURUM.arti} />;
  return null;
}

function Nokta({ renk }) {
  return <View style={[s.nokta, { backgroundColor: renk }]} />;
}

// Kartın ana eylem düğmesi: simge + tek kelime.
function Tus({ Ikon, metin, onPress, uyari, kapali }) {
  const renk = kapali ? YAZI_RENK.soluk : uyari ? DURUM.eksi : YAZI_RENK.birincil;
  return (
    <Pressable
      style={[s.tus, uyari && s.tusUyari, kapali && s.tusKapali]}
      onPress={onPress}
      disabled={kapali}
      hitSlop={6}
    >
      {kapali ? <IkonKilit size={14} color={renk} /> : <Ikon size={14} color={renk} />}
      <Text style={[s.tusMetin, { color: renk }]}>{metin}</Text>
    </Pressable>
  );
}

// Sağdaki kart: kim, ne kadar büyük, teklifine bakışı. Eylem düğmeleri kartta DEĞİL,
// soldaki haritanın altında (`Ayrinti`) — kart açılıp listeyi itmesin, seçilen devlet
// haritada görünsün.
function DevletKarti({ satir, renk, aktorRenk, secili, teklif, cevap, enBuyuk, onSec, onKonum }) {
  const { eylem, gecerli } = eylemi(satir);
  const olcek = (x) => Math.max(0.04, Math.min(1, x / enBuyuk));

  // Tutum simgesi — müttefikte yok (ona teklif gitmiyor, yalnızca bozulabilir).
  let tutum = null;
  if (eylem !== 'boz') {
    if (!gecerli) tutum = <IkonKilit size={15} color={YAZI_RENK.soluk} />;
    else if (satir.kabulEder) tutum = <IkonYuz size={15} color={DURUM.arti} memnun />;
    else tutum = <IkonYuz size={15} color={YAZI_RENK.soluk} />;
  }

  return (
    <Pressable
      style={[s.kart, secili && s.kartSecili, teklif && s.kartTeklif]}
      onPress={() => onSec(secili ? null : satir.id)}
      onLayout={(e) => onKonum(satir.id, e.nativeEvent.layout.y)}
    >
      <View style={s.kartUst}>
        <View style={[s.renkKare, { backgroundColor: renk }]} />
        <Text style={s.kartAd} numberOfLines={1}>
          {satir.ad}
        </Text>
        {/* Giden teklifin sonucu: tik ya da çarpı — cümle yok. */}
        {cevap ? (
          cevap.iyi ? (
            <IkonTik size={16} color={DURUM.arti} />
          ) : (
            <IkonCarpi size={16} color={DURUM.eksi} />
          )
        ) : null}
        <IliskiSimgesi satir={satir} teklif={teklif} boyut={16} />
      </View>

      {/* Toprağı: çubuk onun, çentik senin. */}
      <View style={s.cubuk}>
        <View style={[s.cubukDolu, { width: olcek(satir.parca) * 100 + '%' }]} />
        <View style={[s.centik, { left: olcek(satir.benimParcam) * 100 + '%' }]} />
      </View>

      <View style={s.kartAlt}>
        {tutum}
        {satir.ortakDusmanIdleri && satir.ortakDusmanIdleri.length > 0 ? (
          <View style={s.grup}>
            <IkonHedef size={13} color={YAZI_RENK.ikincil} />
            {satir.ortakDusmanIdleri.slice(0, 3).map((id) => (
              <Nokta key={id} renk={aktorRenk[id] || YAZI_RENK.soluk} />
            ))}
          </View>
        ) : null}
        {satir.cepheSayisi > 0 && satir.durum !== 'savas' ? (
          <View style={s.grup}>
            <IkonSavas size={12} color={YAZI_RENK.soluk} />
            <Text style={s.kucukSayi}>{satir.cepheSayisi}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// Seçili devletin eylemleri — soldaki haritanın altında.
//
// CEVAP BURADA (Görev 20 · Baki, 2026-09-24: "anlaşma yollayınca cevabı diplomasi ekranına
// gelsin, ekranı kapatmam gerekiyor görebilmem için"): cevap eskiden kartın köşesinde 16
// piksellik bir tik/çarpıydı, cümlesi ancak ekran kapanınca haritada çıkıyordu. Artık
// düğmelerin hemen altında: simge + sonuç + (reddedildiyse) tek satır sebep.
function Ayrinti({
  satir,
  renk,
  teklif,
  cevap,
  onTeklifCevapla,
  onIttifak,
  onAteskes,
  onBoz,
  onSavasIlan,
}) {
  const { eylem, gecerli } = eylemi(satir);
  return (
    <View style={s.ayrinti}>
      <View style={s.kartUst}>
        <View style={[s.renkKare, { backgroundColor: renk }]} />
        <Text style={s.ayrintiAd} numberOfLines={1}>
          {satir.ad}
        </Text>
        <IliskiSimgesi satir={satir} teklif={teklif} boyut={17} />
      </View>
      {satir.lider ? (
        <Text style={s.lider} numberOfLines={1}>
          {satir.lider}
        </Text>
      ) : null}
      <View style={s.tuslar}>
        {teklif ? (
          <>
            <Tus
              Ikon={IkonTik}
              metin="KABUL"
              onPress={() => onTeklifCevapla(teklif.kimden, teklif.tip, true)}
            />
            <Tus
              Ikon={IkonCarpi}
              metin="RET"
              uyari
              onPress={() => onTeklifCevapla(teklif.kimden, teklif.tip, false)}
            />
          </>
        ) : eylem === 'boz' ? (
          <Tus Ikon={IkonCarpi} metin="BOZ" uyari onPress={() => onBoz(satir.id)} />
        ) : (
          <Tus
            Ikon={IkonDiplomasi}
            metin={eylem === 'ateskes' ? 'ATEŞKES' : 'ANLAŞ'}
            kapali={!gecerli}
            onPress={() => (eylem === 'ateskes' ? onAteskes(satir.id) : onIttifak(satir.id))}
          />
        )}
        {/* SAVAŞ İLANI (Görev 11): barıştayken saldırmanın TEK yolu. */}
        {satir.savasIlaniGecerli ? (
          <Tus Ikon={IkonSavas} metin="SAVAŞ" uyari onPress={() => onSavasIlan(satir.id)} />
        ) : null}
      </View>
      {cevap ? (
        <View style={[s.cevap, cevap.iyi ? s.cevapIyi : s.cevapKotu]}>
          {cevap.iyi ? (
            <IkonTik size={18} color={DURUM.arti} />
          ) : (
            <IkonCarpi size={18} color={DURUM.eksi} />
          )}
          <View style={s.cevapMetinler}>
            <Text style={s.cevapMesaj}>{cevap.mesaj}</Text>
            {cevap.sebep ? <Text style={s.cevapSebep}>{cevap.sebep}</Text> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ---- GÜÇ SEKMESİ (Görev 12; formül Görev 20) ----
// Puan "Türkiye'deki gücün yüzde kaçı" — ekranda sayı olarak değil, EN GÜÇLÜYE GÖRE ÇUBUK
// olarak. Yanında üç bileşen simgeyle: kılıç askeri güç, sikke tur geliri, il bölge.
function Guc({ guc, benimId, aktorRenk }) {
  const satirlar = (guc && guc.satirlar) || [];
  const lider = satirlar.length > 0 ? satirlar[0].puan : 1;
  return (
    <ScrollView style={s.govde} contentContainerStyle={s.gucIc}>
      {guc && guc.benimSiram ? (
        <View style={s.siram}>
          <Text style={s.siramSayi}>{guc.benimSiram}.</Text>
          <Text style={s.siramToplam}>/ {guc.toplam}</Text>
        </View>
      ) : null}
      <View style={s.gucBaslik}>
        <View style={s.gucSira} />
        <View style={s.gucAdKolon} />
        <View style={s.gucCubukKolon} />
        <View style={s.gucSayiKolon}>
          <IkonSavas size={13} color={YAZI_RENK.soluk} />
        </View>
        <View style={s.gucSayiKolon}>
          <IkonSikke size={13} color={YAZI_RENK.soluk} />
        </View>
        <View style={s.gucSayiKolon}>
          <IkonIller size={13} color={YAZI_RENK.soluk} />
        </View>
      </View>
      {satirlar.map((x) => {
        const ben = x.id === benimId;
        return (
          <View key={x.id} style={[s.gucSatir, ben && s.gucSatirBenim]}>
            <Text style={[s.gucSira, s.gucMetin, ben && s.gucBenim]}>{x.sira}</Text>
            <View style={s.gucAdKolon}>
              <View style={[s.renkKare, { backgroundColor: aktorRenk[x.id] || YAZI_RENK.soluk }]} />
              <Text style={[s.gucMetin, s.gucAd, ben && s.gucBenim]} numberOfLines={1}>
                {x.ad}
              </Text>
            </View>
            <View style={s.gucCubukKolon}>
              <View style={s.cubuk}>
                <View
                  style={[
                    s.cubukDolu,
                    ben && s.cubukBenim,
                    { width: Math.max(2, (x.puan / lider) * 100) + '%' },
                  ]}
                />
              </View>
            </View>
            <Text style={[s.gucSayiKolon, s.gucMetin, ben && s.gucBenim]}>
              {Math.round(x.askeri)}
            </Text>
            <Text style={[s.gucSayiKolon, s.gucMetin, ben && s.gucBenim]}>{x.gelir}</Text>
            <Text style={[s.gucSayiKolon, s.gucMetin, ben && s.gucBenim]}>{x.parca}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export default function DiplomasiEkrani({
  satirlar,
  ittifakSayisi,
  enCokIttifak,
  savasSayisi,
  ihanetKalan,
  teklifler,
  cevap,
  guc,
  benimId,
  aktorRenk,
  // Parça → sahip: soldaki küçük haritanın boyası (Baki: "hangi il neye göre gözüküyor").
  sahiplik,
  // Haritada bir ile uzun basılınca açılan devlet (Baki: "haritadan da açılsın").
  baslangicId,
  onTeklifCevapla,
  onIttifak,
  onAteskes,
  onBoz,
  onSavasIlan,
  onKapat,
}) {
  const { telefon } = useOlcek();
  const [sekme, setSekme] = useState('masa');
  const [seciliId, setSeciliId] = useState(baslangicId || null);
  const masadakiler = useMemo(() => teklifler || [], [teklifler]);
  const renkler = aktorRenk || {};

  const sirali = useMemo(() => {
    const teklifli = new Set(masadakiler.map((t) => t.kimden));
    // Haritadan uzun basılarak açıldıysa o devlet en başta (kartı açık gelir).
    const sira = (x) => (x.id === baslangicId ? -1 : oncelik(x, teklifli.has(x.id)));
    return [...satirlar].sort(
      (a, b) => sira(a) - sira(b) || b.parca - a.parca || (a.ad < b.ad ? -1 : 1)
    );
  }, [satirlar, masadakiler, baslangicId]);
  // Çubuğun ölçeği: listedeki en büyük toprak (sen dahil).
  const enBuyuk = useMemo(
    () => Math.max(1, ...satirlar.map((x) => Math.max(x.parca, x.benimParcam))),
    [satirlar]
  );
  // Haritada renkli görünecekler: listedeki devletler (kalanı sis).
  const gorunenler = useMemo(() => new Set(satirlar.map((x) => x.id)), [satirlar]);
  const seciliSatir = seciliId ? satirlar.find((x) => x.id === seciliId) || null : null;

  // Haritanın genişliği sol sütundan ölçülüyor (telefon/tablet farkı kendiliğinden).
  const [solGenislik, setSolGenislik] = useState(0);
  // HARİTADAN SEÇİNCE KART GÖRÜNSÜN: kartların liste içindeki yeri `onLayout`'tan tutuluyor,
  // haritada dokunulan devletin kartına kaydırılıyor.
  const liste = useRef(null);
  const konumlar = useRef({});
  const onKonum = useCallback((id, y) => {
    konumlar.current[id] = y;
  }, []);
  const haritadanSec = useCallback((id) => {
    setSeciliId(id);
    const y = id ? konumlar.current[id] : undefined;
    if (y !== undefined && liste.current) {
      liste.current.scrollTo({ y: Math.max(0, y - 4), animated: true });
    }
  }, []);

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <View style={s.baslikSatiri}>
          <Text style={s.baslik}>DİPLOMASİ</Text>

          <View style={s.sekmeler}>
            <Pressable
              style={[s.sekme, sekme === 'masa' && s.sekmeSecili]}
              onPress={() => setSekme('masa')}
            >
              <Text style={[s.sekmeMetin, sekme === 'masa' && s.sekmeMetinSecili]}>MASA</Text>
              {masadakiler.length > 0 ? <IkonZarf size={13} color={PANEL.pirinc} /> : null}
            </Pressable>
            <Pressable
              style={[s.sekme, sekme === 'guc' && s.sekmeSecili]}
              onPress={() => setSekme('guc')}
            >
              <Text style={[s.sekmeMetin, sekme === 'guc' && s.sekmeMetinSecili]}>GÜÇ</Text>
            </Pressable>
          </View>

          {/* Sayaçlar simgeyle: dolu el sıkışma = anlaşman, soluk = boş yer; kılıç = savaş. */}
          <View style={s.sayaclar}>
            <View style={s.grup}>
              {Array.from({ length: enCokIttifak || 0 }, (_, i) => (
                <IkonDiplomasi
                  key={i}
                  size={16}
                  color={i < ittifakSayisi ? DURUM.arti : CIZGI.ince}
                />
              ))}
            </View>
            {savasSayisi > 0 ? (
              <View style={s.grup}>
                <IkonSavas size={15} color={DURUM.eksi} />
                <Text style={[s.sayacSayi, { color: DURUM.eksi }]}>{savasSayisi}</Text>
              </View>
            ) : null}
            {/* Sözünden döndün: kimse masaya oturmuyor — kilit ve kalan tur. */}
            {ihanetKalan > 0 ? (
              <View style={s.grup}>
                <IkonKilit size={15} color={DURUM.eksi} />
                <Text style={[s.sayacSayi, { color: DURUM.eksi }]}>{ihanetKalan}</Text>
              </View>
            ) : null}
          </View>

          <Pressable onPress={onKapat} hitSlop={14}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        {sekme === 'guc' ? (
          <Guc guc={guc} benimId={benimId} aktorRenk={renkler} />
        ) : (
          <View style={s.masa}>
            <View
              style={[s.sol, telefon && s.solDar]}
              onLayout={(e) => setSolGenislik(e.nativeEvent.layout.width)}
            >
              {solGenislik > 0 && sahiplik ? (
                <DiplomasiHaritasi
                  genislik={solGenislik}
                  sahiplik={sahiplik}
                  aktorRenk={renkler}
                  benimId={benimId}
                  gorunenler={gorunenler}
                  seciliId={seciliId}
                  onSec={haritadanSec}
                />
              ) : null}
              {seciliSatir ? (
                <Ayrinti
                  satir={seciliSatir}
                  renk={renkler[seciliSatir.id] || YAZI_RENK.soluk}
                  teklif={masadakiler.find((t) => t.kimden === seciliSatir.id) || null}
                  cevap={cevap && cevap.id === seciliSatir.id ? cevap : null}
                  onTeklifCevapla={onTeklifCevapla}
                  onIttifak={onIttifak}
                  onAteskes={onAteskes}
                  onBoz={onBoz}
                  onSavasIlan={onSavasIlan}
                />
              ) : null}
            </View>
            {satirlar.length === 0 ? (
              <Text style={s.bos}>Henüz tanıdığın devlet yok.</Text>
            ) : (
              <ScrollView ref={liste} style={s.liste} contentContainerStyle={s.kartlar}>
                {sirali.map((x) => (
                  <DevletKarti
                    key={x.id}
                    satir={x}
                    renk={renkler[x.id] || YAZI_RENK.soluk}
                    aktorRenk={renkler}
                    secili={seciliId === x.id}
                    teklif={masadakiler.find((t) => t.kimden === x.id) || null}
                    cevap={cevap && cevap.id === x.id ? cevap : null}
                    enBuyuk={enBuyuk}
                    onSec={setSeciliId}
                    onKonum={onKonum}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.enKoyu },
  // ⚠ KESİN YÜKSEKLİK — `maxHeight` DEĞİL (2026-08-06: içinde `flex: 1` çocuk olan perde
  // kutusu yüksekliğini içerikten alırsa çocuklar SIFIR yükseklik alıyor, liste görünmüyor).
  kutu: {
    width: '88%',
    maxWidth: 700,
    height: '92%',
    paddingVertical: BOSLUK.genis,
    paddingHorizontal: BOSLUK.genis,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: KOSE.kutu,
  },
  kutuDar: { width: '95%', paddingHorizontal: BOSLUK.orta },
  baslikSatiri: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.orta },
  baslik: {
    fontFamily: YAZI.baslik,
    fontSize: 17,
    lineHeight: 22,
    color: YAZI_RENK.birincil,
    letterSpacing: 2.2,
  },
  sekmeler: { flexDirection: 'row', gap: 4 },
  sekme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: BOSLUK.orta,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sekmeSecili: { borderColor: CIZGI.ince, backgroundColor: ZEMIN.cukur },
  sekmeMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.2,
    color: YAZI_RENK.soluk,
  },
  sekmeMetinSecili: { color: YAZI_RENK.birincil },
  sayaclar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: BOSLUK.genis,
  },
  sayacSayi: { fontFamily: YAZI.sayi, fontSize: 13, lineHeight: 16 },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 24, lineHeight: 26, color: YAZI_RENK.ikincil },
  bos: {
    fontFamily: YAZI.govde,
    fontSize: 13,
    lineHeight: 19,
    color: YAZI_RENK.ikincil,
    marginTop: BOSLUK.genis,
  },

  govde: { flex: 1, minHeight: 0, marginTop: BOSLUK.orta },
  // MASA: solda harita + seçilinin eylemleri, sağda kartlar (iki sütun).
  masa: { flex: 1, minHeight: 0, marginTop: BOSLUK.orta, flexDirection: 'row', gap: BOSLUK.orta },
  sol: { width: '36%', gap: BOSLUK.dar },
  solDar: { width: '38%' },
  liste: { flex: 1, minHeight: 0 },
  kartlar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: BOSLUK.orta },

  kart: {
    width: '48.9%',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: CIZGI.ayrac,
    backgroundColor: ZEMIN.cukur,
    gap: 6,
  },
  kartSecili: { borderColor: YAZI_RENK.birincil, backgroundColor: ZEMIN.kabartma },
  kartTeklif: { borderColor: PANEL.pirinc },
  kartUst: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  renkKare: { width: 11, height: 11, borderRadius: 3 },
  kartAd: {
    flex: 1,
    fontFamily: YAZI.baslik,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.5,
    color: YAZI_RENK.birincil,
  },

  cubuk: { height: 4, borderRadius: 2, backgroundColor: CIZGI.ayrac },
  cubukDolu: { height: 4, borderRadius: 2, backgroundColor: YAZI_RENK.ikincil },
  cubukBenim: { backgroundColor: DURUM.arti },
  centik: {
    position: 'absolute',
    top: -2.5,
    width: 2,
    height: 9,
    marginLeft: -1,
    borderRadius: 1,
    backgroundColor: YAZI_RENK.birincil,
  },

  kartAlt: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.orta, minHeight: 15 },
  grup: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  nokta: { width: 8, height: 8, borderRadius: 4 },
  kucukSayi: { fontFamily: YAZI.sayi, fontSize: 11, lineHeight: 14, color: YAZI_RENK.soluk },

  ayrinti: {
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: YAZI_RENK.birincil,
    backgroundColor: ZEMIN.kabartma,
  },
  cevap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  cevapIyi: { borderTopColor: DURUM.arti },
  cevapKotu: { borderTopColor: DURUM.eksi },
  cevapMetinler: { flex: 1 },
  cevapMesaj: {
    fontFamily: YAZI.govdeKalin,
    fontSize: 12.5,
    lineHeight: 16,
    color: YAZI_RENK.birincil,
  },
  cevapSebep: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 15,
    color: YAZI_RENK.ikincil,
    marginTop: 1,
  },
  ayrintiAd: {
    flex: 1,
    fontFamily: YAZI.baslik,
    fontSize: 15,
    lineHeight: 19,
    letterSpacing: 0.6,
    color: YAZI_RENK.birincil,
  },
  lider: { fontFamily: YAZI.govde, fontSize: 11.5, lineHeight: 15, color: YAZI_RENK.ikincil },
  tuslar: { flexDirection: 'row', flexWrap: 'wrap', gap: BOSLUK.dar },
  tus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: BOSLUK.orta,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    borderRadius: KOSE.dugme,
  },
  tusUyari: { borderColor: DURUM.eksi },
  tusKapali: { borderColor: CIZGI.ayrac },
  tusMetin: { fontFamily: YAZI.baslik, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 },

  gucIc: { paddingBottom: BOSLUK.orta },
  siram: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: BOSLUK.dar },
  siramSayi: { fontFamily: YAZI.sayi, fontSize: 24, lineHeight: 28, color: DURUM.arti },
  siramToplam: { fontFamily: YAZI.govde, fontSize: 12, lineHeight: 16, color: YAZI_RENK.soluk },
  gucBaslik: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BOSLUK.dar,
    paddingBottom: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CIZGI.ayrac,
  },
  gucSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BOSLUK.dar,
    paddingVertical: 3,
    borderRadius: KOSE.dugme,
  },
  gucSatirBenim: { backgroundColor: ZEMIN.kabartma },
  gucMetin: { fontFamily: YAZI.govde, fontSize: 11.5, lineHeight: 15, color: YAZI_RENK.ikincil },
  gucBenim: { color: YAZI_RENK.birincil, fontFamily: YAZI.govdeKalin },
  gucSira: { width: 24, textAlign: 'right' },
  gucAdKolon: { width: 130, flexDirection: 'row', alignItems: 'center', gap: 6 },
  gucAd: { flex: 1 },
  gucCubukKolon: { flex: 1 },
  gucSayiKolon: { width: 34, alignItems: 'flex-end', textAlign: 'right' },
});
