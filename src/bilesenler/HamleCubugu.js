// HAMLE ÇUBUĞU — doğrudan hamlenin tek arayüzü (Görev 20 / Adım 5).
//
// ┌─ NEDEN ────────────────────────────────────────────────────────────────────────────────┐
// │ Saldırmak 5 dokunuş ve 3 ekrandı: parça → panel SALDIR → hedef → savaş odası GÖNDER → │
// │ onay EVET. Baki'nin kararları (GOREV-20 §6): onay yerine İKİNCİ DOKUNUŞ (1), kuvvet    │
// │ seçimi KALIR ama haritanın üstünde küçük bir sayı seçicide (2), bölgenin ayrıntısı     │
// │ köşedeki bir simgeyle (7). Akış artık:                                                 │
// │     ordu → hedef (bu çubuk açılır, sayıları seç) → AYNI hedefe bir daha dokun          │
// └────────────────────────────────────────────────────────────────────────────────────────┘
//
// İKİ HÂL:
//   • hedef yok  — ORDUNUN KENDİ ÇUBUĞU (Görev 21 · Baki: "il panelinden ordu kontrol etmeyi
//                  kaldıralım, yeni panel olmadan halledelim"): kaynağın adı, askerleri
//                  (simge + sayı), KOMUTAN / KOMUTANI GETİR, yaralı varsa TOPARLAN, ASKER BAS, ayrıntı
//                  simgesi (bölge paneli) ve vazgeç. Hamle hakkı varsa hedefler haritada
//                  parlıyor; bitmişse yalnızca bu düğmeler. Baki: "komutan kısmı belli değil,
//                  başkası nasıl anlayacak" → komutan düğmesi artık YAZILI.
//   • hedef var  — birlik başına sayı seçici, TÜMÜ, tahmin simgesi, (varsa) komutan,
//                  SALDIR/TAŞI. Hedefe ikinci dokunuş da aynı düğmedir.
// Tahmin renk + biçimle (iki yukarı ok / çizgi / aşağı ok) ve haritada hedefin kendisi aynı
// renge boyanıyor. Baki (2026-09-24): *"güzel bir şey ama bu kısım biraz daha açıklayıcı
// olabilir"* → hedef seçiliyken çubuğun ÜST SATIRI: hedefin adı, tek kelimelik sonuç
// (KAZANIRSIN · KIL PAYI · KAYBEDERSİN) ve iki tarafın kaç birlikle girip kaçla çıkacağı
// (kılıç: sen 5 → 4 · kalkan: o 3 → 0). Cümle değil, sonuç + sayı (CLAUDE.md §5/10).
// Daha fazlasını isteyen hedefe BASILI TUTAR: savaş odası (döküm, arazi, moral).
//
// KURAL BİLMEZ: hangi birliğin hazır olduğu (`bilgi.eldeki`) ve tahmin kancadan geliyor.
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { YAZI, ZEMIN, CIZGI, YAZI_RENK, VURGU, DURUM, PANEL, KOSE, BOSLUK } from '../tema';
import { DENGE } from '../denge';
import { birimSayisi } from '../oyun/ordu';
import {
  BIRIM_IKONU,
  IkonTahmin,
  IkonBilgi,
  IkonKomutan,
  IkonKilit,
  IkonSavas,
  IkonDalZirh,
} from './Ikonlar';
import { Parilti } from './Ipucu';

// Tahmin kademesinin rengi — haritadaki hedef dolgusu da aynı aileden (App.js).
export const TAHMIN_RENGI = {
  ustun: DURUM.arti,
  denk: PANEL.pirinc,
  zayif: DURUM.eksi,
};

// Sonucun tek kelimesi. Karşıda ordu yoksa savaş da yok.
function sonucKelimesi(t) {
  if (t.bos) return 'SAVAŞSIZ ALIRSIN';
  if (t.kademe === 'ustun') return 'KAZANIRSIN';
  if (t.kademe === 'denk') return 'KIL PAYI';
  return 'KAYBEDERSİN';
}

// "5 → 4": kaç birlikle girip kaçla çıkıyor. Kayıp varsa sonraki sayı eksi renginde.
function Degisim({ Ikon, once, sonra }) {
  return (
    <View style={s.degisim}>
      <Ikon size={14} color={YAZI_RENK.ikincil} />
      <Text style={s.degisimMetin}>
        {once}
        <Text style={s.ok}> → </Text>
        <Text style={sonra < once ? s.kayip : null}>{sonra}</Text>
      </Text>
    </View>
  );
}

function Sayac({ tur, deger, enCok, onDegis }) {
  const Ikon = BIRIM_IKONU[tur];
  const az = deger <= 0;
  const cok = deger >= enCok;
  return (
    <View style={s.sayac}>
      {Ikon ? <Ikon size={18} color={YAZI_RENK.birincil} /> : null}
      <Pressable
        style={[s.tus, az && s.tusPasif]}
        onPress={() => onDegis(deger - 1)}
        disabled={az}
        hitSlop={4}
      >
        <Text style={[s.tusMetin, az && s.tusMetinPasif]}>−</Text>
      </Pressable>
      <Text style={s.sayi}>
        {deger}
        <Text style={s.enCok}>/{enCok}</Text>
      </Text>
      <Pressable
        style={[s.tus, cok && s.tusPasif]}
        onPress={() => onDegis(deger + 1)}
        disabled={cok}
        hitSlop={4}
      >
        <Text style={[s.tusMetin, cok && s.tusMetinPasif]}>+</Text>
      </Pressable>
    </View>
  );
}

// Ordunun askerleri: tür simgesi + sayısı (yaralısı varsa sayının yanında eksi renkte).
function Kadro({ satirlar }) {
  return (
    <View style={s.kadro}>
      {satirlar.map((b) => {
        const Ikon = BIRIM_IKONU[b.anahtar];
        return (
          <View key={b.anahtar} style={s.kadroOge}>
            {Ikon ? <Ikon size={17} color={YAZI_RENK.birincil} /> : null}
            <Text style={s.kadroSayi}>
              {b.sayi}
              {b.yarali > 0 ? <Text style={s.kayip}> −{b.yarali}</Text> : null}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// KOMUTAN düğmesi — üç hâl, üçü de YAZILI (Baki: "komutan olduğunu başkası nasıl anlayacak"):
//   burada     → dolu pirinç "KOMUTAN" (dokun: komutan ekranı)
//   atanabilir → çerçeveli "KOMUTANI GETİR" (dokun: komutan bu orduya geçer)
//   geçemez    → soluk + kilit; ordusu bozulduysa kalan tur sayısı
function KomutanDugmesi({ komutan, onAta, onEkran }) {
  if (komutan.burada)
    return (
      <Pressable style={[s.yaziDugme, s.komutanBurada]} onPress={onEkran} hitSlop={4}>
        <IkonKomutan size={16} color={ZEMIN.taban} />
        <Text style={[s.yaziDugmeMetin, s.komutanBuradaMetin]}>KOMUTAN</Text>
      </Pressable>
    );
  if (komutan.atanabilir)
    return (
      <Pressable style={[s.yaziDugme, s.komutan]} onPress={onAta} hitSlop={4}>
        <IkonKomutan size={16} color={PANEL.pirinc} />
        <Text style={s.yaziDugmeMetin}>KOMUTANI GETİR</Text>
      </Pressable>
    );
  return (
    <View style={[s.yaziDugme, s.yaziDugmePasif]}>
      <IkonKomutan size={15} color={YAZI_RENK.soluk} />
      <IkonKilit size={11} color={YAZI_RENK.soluk} />
      {komutan.bekleme > 0 ? <Text style={s.pasifMetin}>{komutan.bekleme}</Text> : null}
    </View>
  );
}

export default function HamleCubugu({
  kaynakAd,
  // ---- ORDUNUN KENDİ ÇUBUĞU (hedef yokken; Görev 21) ----
  ordu, // useSeciliParca(...).ordu — { satirlar, toparlanabilir, toplanmaBedeli } ya da null
  komutan, // { burada, atanabilir, bekleme } ya da null (komutan bu orduya hiç gelemiyor)
  onKomutanAta,
  onKomutanEkrani,
  onToplan,
  toplanmaEmriVar,
  onUret, // ASKER BAS — bölge paneliyle aynı üretim ekranını açar
  bilgi, // oyunKancasi.hareketBilgisi(kaynak, hedef) — hedef seçilmediyse null
  kuvvet, // { piyade: 2, ... } — gönderilecekler
  onKuvvet, // (yeni) => void
  tahmin, // oyunKancasi.hamleTahmini — null: kuvvet yok ya da kendi toprağın
  komutanGelsin,
  onKomutan,
  onGonder,
  onAyrinti,
  onKapat,
  stil,
  // EĞİTİM (GOREV-20 Adım 8): parlayacak düğme — 'tumu' | 'saldir' | 'askerBas' | null.
  ipucu,
}) {
  if (!bilgi) {
    return (
      <View style={[s.cubuk, stil]}>
        <Text style={s.kaynak} numberOfLines={1}>
          {kaynakAd}
        </Text>
        {ordu ? <Kadro satirlar={ordu.satirlar} /> : null}
        {komutan ? (
          <KomutanDugmesi komutan={komutan} onAta={onKomutanAta} onEkran={onKomutanEkrani} />
        ) : null}
        {/* TOPARLAN — yalnızca yaralı ya da kayıp varsa. Bedeli altında, iki sayı. */}
        {ordu && ordu.toparlanabilir && onToplan ? (
          <Pressable
            style={[s.yaziDugme, toplanmaEmriVar && s.yaziDugmePasif]}
            onPress={onToplan}
            disabled={toplanmaEmriVar}
            hitSlop={4}
          >
            <View>
              <Text style={[s.yaziDugmeMetin, toplanmaEmriVar && s.pasifMetin]}>
                {toplanmaEmriVar ? 'EMİR VERİLDİ' : 'TOPARLAN'}
              </Text>
              {!toplanmaEmriVar ? (
                <Text style={s.bedel}>
                  {ordu.toplanmaBedeli.nufus} nüfus · {ordu.toplanmaBedeli.ekonomi} ekonomi
                </Text>
              ) : null}
            </View>
          </Pressable>
        ) : null}
        {/* ASKER BAS: ordulu parçaya dokununca panel yerine bu çubuk açıldığı için üretim
            bir dokunuş uzakta kalsın (eskiden panelin düğmesiydi). */}
        {onUret ? (
          <Parilti acik={ipucu === 'askerBas'}>
            <Pressable style={s.yaziDugme} onPress={onUret} hitSlop={4}>
              <Text style={s.yaziDugmeMetin}>ASKER BAS</Text>
            </Pressable>
          </Parilti>
        ) : null}
        <Pressable style={s.simge} onPress={onAyrinti} hitSlop={6}>
          <IkonBilgi size={20} color={YAZI_RENK.birincil} />
        </Pressable>
        <Pressable style={s.simge} onPress={onKapat} hitSlop={6}>
          <Text style={s.kapatX}>×</Text>
        </Pressable>
      </View>
    );
  }

  const eldeki = bilgi.eldeki || {};
  const turler = DENGE.BIRIM_SIRASI.filter((t) => eldeki[t] > 0);
  const adet = birimSayisi(kuvvet || {});
  const saldiri = !bilgi.benimMi;
  const degis = (tur, n) => {
    const yeni = { ...kuvvet, [tur]: Math.max(0, Math.min(eldeki[tur] || 0, n)) };
    if (yeni[tur] === 0) delete yeni[tur];
    onKuvvet(yeni);
  };
  const tumu = () => {
    const t = {};
    for (const tur of turler) t[tur] = eldeki[tur];
    onKuvvet(t);
  };

  return (
    <View style={[s.kutu, stil]}>
      {/* ÜST SATIR: nereye + ne olur. */}
      <View style={s.ustSatir}>
        <Text style={s.hedefAd} numberOfLines={1}>
          {bilgi.hedefTamAd || bilgi.hedefAd}
        </Text>
        {saldiri && tahmin ? (
          <>
            <IkonTahmin size={18} kademe={tahmin.kademe} color={TAHMIN_RENGI[tahmin.kademe]} />
            <Text style={[s.sonuc, { color: TAHMIN_RENGI[tahmin.kademe] }]}>
              {sonucKelimesi(tahmin)}
            </Text>
            <Degisim Ikon={IkonSavas} once={tahmin.gonderilen} sonra={tahmin.kalan} />
            {!tahmin.bos ? (
              <Degisim Ikon={IkonDalZirh} once={tahmin.savunan} sonra={tahmin.savunanKalan} />
            ) : null}
          </>
        ) : saldiri && bilgi.savunan ? (
          // Kuvvet seçilmedi: karşıdakinin sayısı yine görünsün.
          <Degisim Ikon={IkonDalZirh} once={bilgi.savunan.sayi} sonra={bilgi.savunan.sayi} />
        ) : null}
      </View>

      <View style={s.cubukSatir}>
        {turler.map((t) => (
          <Sayac
            key={t}
            tur={t}
            deger={(kuvvet && kuvvet[t]) || 0}
            enCok={eldeki[t]}
            onDegis={(n) => degis(t, n)}
          />
        ))}
        <Parilti acik={ipucu === 'tumu'}>
          <Pressable style={s.tumu} onPress={tumu} hitSlop={4}>
            <Text style={s.tumuMetin}>TÜMÜ</Text>
          </Pressable>
        </Parilti>

        {/* KOMUTAN DA GİTSİN — yalnızca komutan bu ordunun başındayken. Varsayılan kapalı:
          komutanın ordusu bozulursa komutan birkaç tur sahadan çekilir (Görev 16). */}
        {bilgi.komutanBurada ? (
          <Pressable
            style={[s.simge, s.komutan, komutanGelsin && s.komutanAcik]}
            onPress={onKomutan}
            hitSlop={4}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!komutanGelsin }}
          >
            <IkonKomutan size={18} color={komutanGelsin ? ZEMIN.taban : PANEL.pirinc} />
          </Pressable>
        ) : null}

        <Parilti acik={ipucu === 'saldir'}>
          <Pressable
            style={[s.gonder, !saldiri && s.gonderTasi, adet === 0 && s.gonderPasif]}
            onPress={onGonder}
            disabled={adet === 0}
          >
            <Text style={[s.gonderMetin, adet === 0 && s.gonderMetinPasif]}>
              {(saldiri ? 'SALDIR' : 'TAŞI') + (adet > 0 ? ' · ' + adet : '')}
            </Text>
          </Pressable>
        </Parilti>

        <Pressable style={s.simge} onPress={onKapat} hitSlop={6}>
          <Text style={s.kapatX}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Ordu çubuğu dar telefonda iki satıra iner (komutan + toparlan + asker bas yan yana sığmazsa).
  cubuk: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: BOSLUK.dar,
    paddingVertical: 6,
    paddingHorizontal: BOSLUK.dar,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  // Hedef seçiliyken iki satır: üstte sonuç, altta sayılar ve düğmeler.
  kutu: {
    position: 'absolute',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: BOSLUK.dar,
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  ustSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BOSLUK.dar,
    minHeight: 22,
    paddingHorizontal: 4,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: CIZGI.ayrac,
  },
  cubukSatir: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.dar },
  hedefAd: {
    flexShrink: 1,
    maxWidth: 200,
    fontFamily: YAZI.baslik,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0.8,
    color: YAZI_RENK.birincil,
    marginRight: 4,
  },
  sonuc: { fontFamily: YAZI.baslik, fontSize: 13, lineHeight: 17, letterSpacing: 1 },
  degisim: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 4 },
  degisimMetin: {
    fontFamily: YAZI.sayi,
    fontSize: 14,
    lineHeight: 18,
    color: YAZI_RENK.birincil,
  },
  ok: { color: YAZI_RENK.soluk },
  kayip: { color: DURUM.eksi },
  kaynak: {
    flexShrink: 1,
    maxWidth: 220,
    fontFamily: YAZI.baslik,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: YAZI_RENK.birincil,
    paddingHorizontal: 4,
  },
  simge: {
    width: 34,
    height: 34,
    borderRadius: KOSE.dugme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kapatX: { fontFamily: YAZI.baslik, fontSize: 22, lineHeight: 24, color: YAZI_RENK.ikincil },

  sayac: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tus: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
  },
  tusPasif: { backgroundColor: 'transparent', borderColor: CIZGI.ayrac },
  tusMetin: { fontFamily: YAZI.sayi, fontSize: 18, lineHeight: 21, color: YAZI_RENK.birincil },
  tusMetinPasif: { color: YAZI_RENK.soluk },
  sayi: {
    minWidth: 34,
    textAlign: 'center',
    fontFamily: YAZI.sayi,
    fontSize: 15,
    lineHeight: 19,
    color: YAZI_RENK.birincil,
  },
  enCok: { fontFamily: YAZI.govde, fontSize: 10.5, color: YAZI_RENK.soluk },

  tumu: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
  },
  tumuMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 0.8,
    color: YAZI_RENK.birincil,
  },
  komutan: { borderWidth: 1, borderColor: PANEL.pirinc },
  komutanAcik: { backgroundColor: PANEL.pirinc },

  // Ordunun kendi çubuğu (Görev 21).
  kadro: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.dar },
  kadroOge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  kadroSayi: { fontFamily: YAZI.sayi, fontSize: 14, lineHeight: 18, color: YAZI_RENK.birincil },
  yaziDugme: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: KOSE.dugme,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
  },
  yaziDugmeMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.8,
    color: YAZI_RENK.birincil,
  },
  komutanBurada: { backgroundColor: PANEL.pirinc, borderColor: PANEL.pirinc },
  komutanBuradaMetin: { color: ZEMIN.taban },
  yaziDugmePasif: { backgroundColor: 'transparent', borderColor: CIZGI.ayrac },
  pasifMetin: { fontFamily: YAZI.sayi, fontSize: 11, lineHeight: 14, color: YAZI_RENK.soluk },
  bedel: { fontFamily: YAZI.govde, fontSize: 9.5, lineHeight: 12, color: YAZI_RENK.ikincil },

  gonder: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: VURGU.saldiri,
  },
  // Taşıma saldırı değil: dolgusuz, çerçeveli (panelin ASKER TAŞI düğmesiyle aynı dil).
  gonderTasi: { backgroundColor: ZEMIN.cukur, borderWidth: 1, borderColor: YAZI_RENK.ikincil },
  gonderPasif: { backgroundColor: 'transparent', borderWidth: 1, borderColor: CIZGI.ayrac },
  gonderMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.9,
    color: PANEL.vurguUstu,
  },
  gonderMetinPasif: { color: YAZI_RENK.soluk },
});
