// Seçili parçanın bilgi paneli — SOLDAN açılan şerit.
//
// ⚠ ORDU KONTROLÜ BURADA YOK (Görev 21 · Baki, 2026-09-24: "il panelindeki komutan kısmı belli
// değil … il panelinden ordu kontrol etmeyi kaldıralım, yeni panel olmadan halledelim").
// Kendi orduna dokununca alt çubuk açılıyor (`HamleCubugu.js`): hamle, KOMUTAN / KOMUTANI
// GETİR ve TOPARLAN orada. Bu panel artık yalnızca BİLGİ (bölge, il, buradaki askerlerin
// dökümü) + ASKER BAS.
// Güvenli alan (çentik / yuvarlak köşe / sistem tuşları) SafeArea insets ile korunur.
// Bölümler: BÖLGE (arazi/savunma/değer) + İL (5 sayısal stat) + KOMŞULAR (dokununca geç).
//
// ---- GÖREV 10A / ADIM 3: PANEL KÂĞIDA GEÇTİ ----
// Panel koyu slate bir kutuydu; harita açık, panel koyuydu ve oyunda iki ayrı dünya
// vardı. Artık haritanın DENİZİNDEN türetilmiş kâğıt zemin kullanıyor (`ZEMIN.yuzey`):
// haritadan bir tık AÇIK olduğu için "haritanın üstüne konmuş kâğıt" gibi duruyor.
//
// Üç kural bu dosyada geçerli:
//   1. KUTU İÇİNDE KUTU YOK. Bilgi dolgulu kutulara değil, İNCE ÇİZGİYLE ayrılmış
//      hizalı veri satırlarına yazılır (`s.bolum` + `s.kv`). Dolgu ve çerçeve, kâğıdın
//      üstünde gereksiz gürültüdür; ayraç yeter.
//   2. RENKLE VURGU YOK. Hiyerarşi punto, kalınlık ve harf arasıyla kurulur. (SALDIR düğmesi
//      Görev 21'de alt çubuğa taşındı; panelde kiremit renk artık hiç yok.)
//   3. KÖŞE: `KOSE.kutu` / `KOSE.dugme`. Düğme daha yuvarlak — yuvarlaklık tek bir şey
//      anlatır: "buraya basılır." (Değerler Baki'nin isteğiyle 0/4'ten 2/5'e çıktı.)
//
// Sol şerit yerleşimi ve genişlik ölçüleri (%25 / 190–300 dp) Görev 04'te ölçülmüştü,
// DEĞİŞMEDİ — bu adımda değişen yalnızca panelin hangi dünyaya ait olduğu.
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Olcut, { stattanOlcut } from './Olcut';
import {
  PANEL,
  ARAZI_AD,
  ARAZI_SAVUNMA_OLCUT,
  YAZI,
  ZEMIN,
  CIZGI,
  YAZI_RENK,
  DURUM,
  BOSLUK,
  KOSE,
} from '../tema';
import { gelirYaz } from '../bicim';

// Tasarım §5'teki 7 statın sayısal olan 5'i (arazi parça bölümünde, parça sayısı altta).
// ALTYAPI 2026-07-25'te kaldırıldı (Görev 03 / Karar 3).
const STATLAR = [
  ['nufus', 'NÜFUS'],
  ['ekonomi', 'EKONOMİ'],
  ['egitim', 'EĞİTİM'],
  ['sanayi', 'SANAYİ'],
  ['moral', 'MORAL'],
];

function Baslik({ metin }) {
  return <Text style={s.blokBaslik}>{metin}</Text>;
}

// "+3.9 nüfus / +3.6 ekonomi" — panelin her yerinde aynı biçim.
function gelirMetni(g) {
  return '+' + gelirYaz(g.nufus) + ' nüfus / +' + gelirYaz(g.ekonomi) + ' ekonomi';
}

export default function IlPaneli({
  parca,
  il,
  sahip, // { ad, renk, benimMi } — parçanın sahibi
  parcaGelir, // { nufus, ekonomi } — bu parçanın sahibine tur başına getirisi
  ilDagilim, // { toplam, sahipler: [{ aktorId, ad, renk, sayi }] }
  ilGelirim, // { nufus, ekonomi, parca, toplamParca } — oyuncunun bu ilden aldığı
  komsuListe,
  ordu, // { sayi, dokum, satirlar } — bu parçada duran ordu (yoksa null)
  onKomsuSec,
  onKapat,
  onUret, // kendi parçandaysa ASKER BAS düğmesi (Görev 04 / Soru 1 → "seç ve üret")
  gelistirici, // GELISTIRICI_MODU açıksa sahiplik test araçları görünür (Adım 8)
  onParcayiAl,
  onIliAl,
  onGeriVer,
  onIliGeriVer,
}) {
  const insets = useSafeAreaInsets();
  if (!parca) return null;

  // ---- ÜÇ ÖLÇÜT, TEK DİL (Görev 10A / Adım 5) ----
  // Savunma artık kelimeyle DEĞİL, öteki ölçütlerle aynı 5 noktayla gösteriliyor.
  const savunmaOlcut = ARAZI_SAVUNMA_OLCUT[parca.arazi] ?? 3;
  const pay = (parca.nufus + parca.ekonomi) / 2;
  const onem = Math.max(1, Math.min(5, Math.round(pay * 5)));
  const onemAd = onem >= 4 ? 'büyük' : onem === 3 ? 'orta' : 'küçük';

  return (
    <View style={s.tabaka} pointerEvents="box-none">
      <View
        style={[s.panel, { top: insets.top + 8, left: insets.left + 8, bottom: insets.bottom + 8 }]}
      >
        {/* ---- SABİT BAŞLIK (Görev 10A / Adım 7) ----
            İki kusur birdenti: × düğmesi başlığın ÜSTÜNE biniyordu (ikisi de aynı köşede,
            biri `absolute`), ve kaydırınca başlık kayboluyordu — oyuncu panelin ortasında
            hangi bölgeye baktığını bilmiyordu.
            Çözüm: başlık kaydırmanın DIŞINA çıktı. Artık × ile başlık aynı satırda ve
            yan yana duruyorlar; biniyor olmaları imkânsız, çünkü satır onları paylaşıyor. */}
        <View style={s.baslikSatiri}>
          <View style={s.baslikMetin}>
            {/* Başlık 2026-08-01'de "PARÇA"dan "BÖLGE"ye değişti: oyuncunun kelimesi
                bölge, "parça" bir geliştirme terimiydi. */}
            <Baslik metin="BÖLGE" />
            <Text style={s.parcaAd} numberOfLines={1}>
              {parca.ad}
            </Text>
            <Text style={s.altBilgi} numberOfLines={1}>
              {parca.il} ili
            </Text>
          </View>
          <Pressable style={s.kapat} onPress={onKapat} hitSlop={12}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.icerik}>
          <View style={s.ayracIlk} />

          {/* ---- SAHİPLİK VE GETİRİ — panelin en görünür yeri ---- */}
          {sahip && (
            <View style={s.kv}>
              <Text style={s.k}>SAHİBİ</Text>
              <View style={s.sahipSatir}>
                <View style={[s.renkNokta, { backgroundColor: sahip.renk }]} />
                <Text style={s.v}>
                  {sahip.ad}
                  {sahip.benimMi ? <Text style={s.sen}> (sen)</Text> : null}
                  {/* KARAKTER (Görev 12 / Adım 2): Saldırgan · Dengeli · Çekimser.
                      Yalnızca TANIDIĞIN devletlerde dolu geliyor (Baki'nin kararı) —
                      uzaktakinin huyunu bilmiyorsun, kanca null gönderiyor. */}
                  {sahip.karakter ? <Text style={s.karakter}> · {sahip.karakter}</Text> : null}
                </Text>
                {/* LİDER (Görev 16 / Adım 2): karakterle aynı süzgeçten geçiyor —
                    tanımadığın ilin başında kimin olduğunu da bilmiyorsun. */}
                {sahip.lider ? (
                  <Text style={s.lider} numberOfLines={1}>
                    {sahip.lider}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* ---- GETİRİ: TEK SATIR ---- (Görev 10A / Adım 4)
              Eskiden aynı sayı panelde İKİ KEZ yazıyordu: yukarıda "GETİRİSİ +4/+3",
              aşağıda kutu içinde "BURAYI ALIRSAN +4/+3". İkisi de aynı `parcaGelir`den
              geliyordu. Artık tek satır; yalnızca ETİKET sahipliğe göre değişiyor —
              senin yerin için "alırsan" demek zaten anlamsızdı. */}
          {parcaGelir && (
            <View style={s.kv}>
              <Text style={s.k}>{sahip && !sahip.benimMi ? 'BURAYI ALIRSAN' : 'GETİRİSİ'}</Text>
              <Text style={[s.v, s.gelir]}>{gelirMetni(parcaGelir)}</Text>
            </View>
          )}

          {/* ---- BURADAKİ ORDU ---- (Görev 04 / Adım 5)
              Rozet yalnızca SAYIYI gösterir; hangi birimlerden oluştuğu buraya yazılır —
              rozete üç sayı sığmaz (§7.2). Muharebe statları da burada, Görev 05'te
              muharebe tahmini bu kutunun altına gelecek. */}
          {ordu && ordu.sayi > 0 && (
            <View style={s.bolum}>
              <View style={s.orduBaslikSatir}>
                <Text style={s.orduBaslik}>BURADAKİ ASKERLER</Text>
                <Text style={s.orduSayi}>{ordu.sayi}</Text>
              </View>
              {/* `ordu.dokum` ("4 piyade, 2 topçu") BURADAN KALDIRILDI (Adım 4):
                  hemen altındaki satırlar zaten "4 × Piyade" diyordu, aynı sayı iki kez.
                  Satırlar daha çok şey söylüyor (zırh, dayanıklılık, yaralı) — kalan o.
                  `orduDokumu()` duruyor; emir listesi gibi satırların olmadığı yerlerde
                  hâlâ tek doğru özet o. */}
              {ordu.satirlar.map((b) => (
                <View key={b.anahtar} style={s.orduSatir}>
                  <Text style={s.orduSatirAd}>
                    {b.sayi} × {b.ad}
                    {/* Kaçı yaralı — sayının hemen yanında, ayrı renkte. */}
                    {b.yarali > 0 ? <Text style={s.yaraliEk}> ({b.yarali} yaralı)</Text> : null}
                  </Text>
                  <Text style={s.orduSatirStat}>
                    zırh {b.zirh} · dayanıklılık {b.dayaniklilik}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ASKER BAS — yalnızca KENDİ parçanda. Ordu, seçtiğin parçada doğar
              (Görev 04 / Soru 1 → cevap A "seç ve üret"). */}
          {sahip && sahip.benimMi && onUret && (
            <Pressable style={s.uretDugme} onPress={onUret}>
              <Text style={s.uretMetin}>ASKER BAS</Text>
            </Pressable>
          )}

          <View style={s.ayrac} />

          <View style={s.kv}>
            <Text style={s.k}>ARAZİ</Text>
            <Text style={s.v}>{ARAZI_AD[parca.arazi]}</Text>
          </View>
          <View style={s.kv}>
            <Text style={s.k}>SAVUNMA</Text>
            {/* Eskiden kırmızı bir KELİMEYDİ ("Orta"). Artık öteki ölçütlerle aynı dil. */}
            <Olcut deger={savunmaOlcut} />
          </View>
          <View style={s.kv}>
            <Text style={s.k}>DEĞER</Text>
            <View style={s.olcutSatir}>
              <Olcut deger={onem} />
              <Text style={s.sonuk}>{onemAd}</Text>
            </View>
          </View>

          {/* ---- İL ---- */}
          {il && (
            <>
              <View style={s.ayrac} />
              <Baslik metin={'İL DURUMU — ' + il.ad + ' · ' + il.kod} />

              <View style={s.statKutu}>
                {STATLAR.map(([anahtar, ad]) => (
                  <View key={anahtar} style={s.statSatir}>
                    <Text style={s.statAd}>{ad}</Text>
                    {/* 10 kareli çubuk yerine 5 nokta. Kesin sayı KAYBOLMUYOR: hemen
                        yanında rakam duruyor. Nokta "ne kadar", rakam "tam ne kadar". */}
                    <View style={s.statOlcut}>
                      <Olcut deger={stattanOlcut(il.statlar[anahtar])} />
                    </View>
                    <Text style={s.statSayi}>{il.statlar[anahtar]}</Text>
                  </View>
                ))}
              </View>

              {/* Bu ilin parçaları kimlerde */}
              {ilDagilim && (
                <View style={s.dagilim}>
                  <Text style={s.dagilimBaslik}>
                    {/* Oyuncunun kelimesi BÖLGE (tur çubuğu, rapor, mühürler) — "parça" iç ad. */}
                    {ilGelirim ? ilGelirim.parca : 0}/{ilDagilim.toplam} bölge sende
                  </Text>
                  {ilDagilim.sahipler
                    .filter((x) => !ilGelirim || x.aktorId !== ilGelirim.aktorId)
                    .map((x) => (
                      <View key={x.aktorId} style={s.dagilimSatir}>
                        <View style={[s.renkNoktaKucuk, { backgroundColor: x.renk }]} />
                        <Text style={s.dagilimMetin}>
                          {x.sayi} bölge — {x.ad}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              {ilGelirim && ilGelirim.parca > 0 && (
                <View style={s.kv}>
                  <Text style={s.k}>SANA KAZANDIRACAĞI</Text>
                  <Text style={[s.v, s.gelir]}>{gelirMetni(ilGelirim)}</Text>
                </View>
              )}

              <Text style={s.parcaSay}>
                {il.parcaSayisi} bölge — ili tamamen almak için hepsini almalısın.
              </Text>
            </>
          )}

          {/* ---- GELİŞTİRİCİ ARAÇLARI ----
              Muharebe Görev 05'te gelecek; o zamana kadar sahiplik elle değişebilsin diye.
              Kırmızı çerçeve ve etiket, bunun geçici bir test aracı olduğunu hatırlatır. */}
          {gelistirici && (
            <>
              <View style={s.ayrac} />
              <View style={s.devKutu}>
                <Text style={s.devEtiket}>GELİŞTİRİCİ</Text>
                <Text style={s.devIpucu}>Haritada bir bölgeye uzun basmak da onu sana verir.</Text>
                <View style={s.devDugmeler}>
                  {sahip && !sahip.benimMi && (
                    <Pressable style={s.devDugme} onPress={onParcayiAl}>
                      <Text style={s.devDugmeMetin}>BURAYI BANA VER</Text>
                    </Pressable>
                  )}
                  <Pressable style={s.devDugme} onPress={onIliAl}>
                    <Text style={s.devDugmeMetin}>TÜM İLİ AL</Text>
                  </Pressable>
                  {sahip && sahip.ad !== parca.il && (
                    <Pressable style={s.devDugme} onPress={onGeriVer}>
                      <Text style={s.devDugmeMetin}>BURAYI GERİ VER</Text>
                    </Pressable>
                  )}
                  <Pressable style={s.devDugme} onPress={onIliGeriVer}>
                    <Text style={s.devDugmeMetin}>TÜM İLİ GERİ VER</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {/* ---- KOMŞULAR ---- */}
          {komsuListe && komsuListe.length > 0 && (
            <>
              <View style={s.ayrac} />
              <Baslik metin={'KOMŞULAR · ' + komsuListe.length} />
              <View style={s.cipKutu}>
                {komsuListe.map((n) => (
                  <Pressable
                    key={n.pid}
                    style={s.cip}
                    onPress={() => onKomsuSec(n.pid)}
                    hitSlop={4}
                  >
                    <Text style={s.cipMetin}>{n.ad}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// Bütün yazılarda `lineHeight` AÇIKÇA yazılı. `fontSize` verip satır yüksekliğini yazı
// tipine bırakmak, yerleşim hesabını tahmine çevirir (CLAUDE.md §6 — altıncı turda menü
// tam bu yüzden taşmıştı). Punto değerleri Adım 3'te BİLEREK değiştirilmedi: bu adımın
// işi dünyayı değiştirmek, ölçüleri değil.
const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject },
  panel: {
    position: 'absolute',
    // ---- ÖLÇÜLER GÖREV 04'TEN, DOKUNULMADI ----
    width: '25%',
    maxWidth: 300,
    minWidth: 190, // gelir satırları ("+3.9 nüfus / +3.6 ekonomi") sıkışmasın
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: KOSE.kutu, // 0 — atlas sayfasının köşesi keskindir
    // Gölge KALIYOR ama yumuşadı: kâğıdın haritanın ÜSTÜNDE durduğunu anlatan tek şey o.
    // Koyu panelde 0.35 gerekiyordu; açık kâğıtta aynı değer kir gibi görünüyor.
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 3, height: 0 },
    elevation: 10,
  },
  icerik: {
    paddingBottom: BOSLUK.cokGenis,
    paddingHorizontal: BOSLUK.genis,
  },

  // Başlık artık kaydırmanın dışında ve × ile AYNI SATIRDA — üst üste binemezler.
  baslikSatiri: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: BOSLUK.dar,
    paddingTop: BOSLUK.genis,
    paddingHorizontal: BOSLUK.genis,
  },
  baslikMetin: { flex: 1, minWidth: 0 },
  // İlk ayraç kaydırmanın İÇİNDE: sabit başlığın altına yapışık dursun, kaydırma
  // başlayınca da içerikle birlikte yukarı gitsin.
  ayracIlk: {
    height: 1,
    backgroundColor: CIZGI.ayrac,
    marginTop: BOSLUK.orta,
    marginBottom: BOSLUK.orta,
  },

  kapat: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kapatX: { fontSize: 24, lineHeight: 26, color: YAZI_RENK.ikincil },

  // Bölüm başlığı: eskiden pirinçti. Artık renk taşımıyor — küçük punto, geniş harf
  // arası ve ikincil mürekkep. Başlığı başlık yapan renk değil, biçimdir.
  blokBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2.5,
    color: YAZI_RENK.ikincil,
  },
  parcaAd: {
    fontFamily: YAZI.baslik,
    fontSize: 19,
    lineHeight: 24,
    color: YAZI_RENK.birincil,
    marginTop: BOSLUK.cokDar,
    // `paddingRight: 26` KALKTI: × artık aynı satırda, altına girme ihtimali yok.
  },
  altBilgi: {
    fontFamily: YAZI.govde,
    fontSize: 12.5,
    lineHeight: 16,
    color: YAZI_RENK.ikincil,
    marginTop: 2,
  },

  ayrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: BOSLUK.orta },

  // ---- HİZALI VERİ SATIRI ----
  // Panelin taşıyıcı deseni: solda etiket, sağda değer. Etiket etiketler, değer sayar;
  // hiçbiri ikisini birden yapmaz. Dolgu ve çerçeve yok — hizanın kendisi yeter.
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    gap: BOSLUK.dar,
  },
  k: {
    fontFamily: YAZI.etiket,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    color: YAZI_RENK.ikincil,
  },
  v: { fontFamily: YAZI.govdeKalin, fontSize: 13.5, lineHeight: 17, color: YAZI_RENK.birincil },
  // Ölçüt + yanındaki kelime ("büyük"/"orta"/"küçük") aynı hizada.
  olcutSatir: { flexDirection: 'row', alignItems: 'center', gap: BOSLUK.dar },
  sonuk: { color: YAZI_RENK.soluk, fontSize: 12, lineHeight: 15 },

  // ---- BÖLÜM ----
  // Eskiden dolgulu, çerçeveli, yuvarlak köşeli bir KUTUYDU ve panelin içinde ikinci
  // bir kutu dünyası kuruyordu. Artık yalnızca üstünde ince bir çizgi var: bilgi
  // gruplanıyor ama kâğıttan kopmuyor.
  bolum: {
    marginTop: BOSLUK.orta,
    borderTopWidth: 1,
    borderTopColor: CIZGI.ayrac,
    paddingTop: BOSLUK.orta,
  },

  statKutu: { marginTop: BOSLUK.dar },
  statSatir: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  statAd: {
    width: 58,
    fontFamily: YAZI.etiket,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 0.8,
    color: YAZI_RENK.ikincil,
  },
  // Ölçüt sabit genişlikte değil ama sola yaslı: beş nokta her satırda aynı yerde başlar.
  statOlcut: { flex: 1, marginHorizontal: BOSLUK.dar },
  statSayi: {
    width: 14,
    textAlign: 'right',
    fontFamily: YAZI.sayi,
    fontSize: 13,
    lineHeight: 16,
    color: YAZI_RENK.birincil,
  },

  parcaSay: {
    marginTop: BOSLUK.orta,
    fontFamily: YAZI.govde,
    fontSize: 12.5,
    lineHeight: 18,
    color: YAZI_RENK.soluk,
  },

  // ---- SAHİPLİK ----
  sahipSatir: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  // Renk noktası artık KARE: haritacılıkta lejant işareti karedir, ve köşe kuralı
  // (kutu 0) burada da geçerli. Nokta bir düğme değil, bir lejant.
  renkNokta: {
    width: 11,
    height: 11,
    borderRadius: KOSE.kutu,
    borderWidth: 1,
    borderColor: PANEL.noktaKontur,
  },
  renkNoktaKucuk: { width: 8, height: 8, borderRadius: KOSE.kutu },
  // "(sen)" eskiden pirinçti. Artık sessiz bir dipnot — asıl bilgi sahibin ADI.
  sen: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.ikincil },
  // Karakter, sahibin adının yanında ama ondan sessiz: ad kararı, karakter ipucu taşır.
  karakter: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },
  lider: { fontFamily: YAZI.govde, fontSize: 11.5, color: YAZI_RENK.ikincil, marginTop: 1 },
  gelir: {
    fontFamily: YAZI.govdeKalin,
    color: DURUM.arti,
    fontSize: 12.5,
    lineHeight: 16,
    flexShrink: 1,
    textAlign: 'right',
  },

  // ---- BURADAKİ ORDU ---- (haritadaki rozetin panel karşılığı)
  orduBaslikSatir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orduBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 1.4,
    color: YAZI_RENK.ikincil,
  },
  orduSayi: { fontFamily: YAZI.sayi, fontSize: 16, lineHeight: 20, color: YAZI_RENK.birincil },
  orduSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  orduSatirAd: { fontFamily: YAZI.govde, fontSize: 11.5, lineHeight: 15, color: YAZI_RENK.ikincil },
  // Eskiden `opacity: 0.8` ile soluklaştırılıyordu; artık soluk bir RENK var, saydamlık
  // gerekmiyor. Saydamlık zeminle karışır, renk karışmaz.
  orduSatirStat: { fontFamily: YAZI.govde, fontSize: 10.5, lineHeight: 14, color: YAZI_RENK.soluk },

  yaraliEk: { fontFamily: YAZI.govde, color: DURUM.eksi },

  // ASKER BAS — ikincil eylem, dolgusuz.
  uretDugme: {
    marginTop: BOSLUK.dar,
    borderWidth: 1,
    borderColor: YAZI_RENK.ikincil,
    borderRadius: KOSE.dugme,
    paddingVertical: 10,
    alignItems: 'center',
  },
  uretMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 1.2,
    color: YAZI_RENK.birincil,
  },

  // ---- İL PARÇA DAĞILIMI ----
  dagilim: { marginTop: BOSLUK.orta, gap: BOSLUK.cokDar },
  dagilimBaslik: {
    fontFamily: YAZI.govdeKalin,
    fontSize: 12.5,
    lineHeight: 16,
    color: YAZI_RENK.birincil,
  },
  dagilimSatir: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dagilimMetin: { fontFamily: YAZI.govde, fontSize: 12, lineHeight: 15, color: YAZI_RENK.ikincil },

  // ---- GELİŞTİRİCİ ARAÇLARI ----
  // Oyun arayüzünden bilerek ayrışır ama artık KIRMIZI değil: vurgu rengi yalnızca
  // saldırınındır ve bir test aracı oyunun en güçlü rengini taşıyamaz. Ayrışmayı
  // kesikli çizgi yapıyor — zaten "bu geçici" demenin en sessiz yolu o.
  devKutu: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: YAZI_RENK.soluk,
    borderRadius: KOSE.kutu,
    padding: BOSLUK.orta,
  },
  devEtiket: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 1.6,
    color: YAZI_RENK.soluk,
  },
  devIpucu: {
    fontFamily: YAZI.govde,
    fontSize: 11,
    lineHeight: 15,
    color: YAZI_RENK.ikincil,
    marginTop: BOSLUK.cokDar,
  },
  devDugmeler: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: BOSLUK.dar },
  devDugme: {
    borderWidth: 1,
    borderColor: YAZI_RENK.soluk,
    borderRadius: KOSE.dugme,
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  devDugmeMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.5,
    color: YAZI_RENK.ikincil,
  },

  // ---- KOMŞULAR ----
  // Çip DOLGUSUZ ama köşesi 4: dokunulabilir olan tek şey bunlar, yuvarlak köşe onu söylüyor.
  cipKutu: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: BOSLUK.dar },
  cip: {
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: KOSE.dugme,
    paddingVertical: 6,
    paddingHorizontal: BOSLUK.orta,
  },
  cipMetin: {
    fontFamily: YAZI.govdeKalin,
    fontSize: 12.5,
    lineHeight: 16,
    color: YAZI_RENK.birincil,
  },
});
