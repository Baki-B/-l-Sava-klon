// SAVAŞ ODASI — hedefe hangi kuvvetin gideceğine karar verilen ekran (Görev 05 / Adım 5,
// 2026-07-30'da Baki'nin geri bildirimiyle baştan yazıldı).
//
// NEDEN BAŞTAN YAZILDI. İlk hâli üretim ekranının kalıbının aynısıydı ("asker basmayı bilen
// asker göndermeyi de bilir"). Cihazda iki şey çıktı:
//   1. "+1 yaptı direkt gidiyor" — kutu arkayı KARARTMADIĞI için (üretim ekranından
//      devralınan davranış) `[+]` tuşuna basmak haritanın dokunmasını da tetikliyordu ve
//      hedef/kip değişiyordu. Asıl çözüm haritanın jestini susturmak oldu (Harita.js
//      `dokunmaKapali`), ama bu ekranın da tam perde çekmesi gerekiyordu: burada oyuncu
//      haritaya değil KARARA bakıyor.
//   2. "Savaş kısmı için ekranın ortasına yeni bir menü gelsin, detaylar da orada gözüksün"
//      — üretim ekranının dar kutusu muharebe kararı için yetersizdi.
//
// YERLEŞİM: iki sütun. Solda GÖNDERECEĞİN KUVVET (birim birim sayaç + muharebe statları),
// sağda KARŞINDAKİ (savunanın kadrosu, arazi, moral üstünlükleri, ganimet). Altta muharebe
// tahmini ve GÖNDER. Yatay telefonda yükseklik kıt olduğu için sütunlar yan yana kalır,
// yazılar küçülür (bkz. `dar` stilleri).
//
// GÖREV 20 / ADIM 5: BU EKRAN ARTIK AYRINTI YOLU. Hamlenin kendisi haritada (hedefe iki
// dokunuş, sayılar alttaki `HamleCubugu`nda); bu oda hedefe BASILI TUTUNCA açılıyor —
// karşı tarafın dökümü, arazi, moral ve kuvvetin ince ayarı için. Saldırı onayı kalktı
// (Baki, GOREV-20 Soru 1): GÖNDER doğrudan hamledir. Kuvvet çubukta ne seçildiyse onunla açılır.
//
// MUHAREBE TAHMİNİ KESİN SAYI VERMEZ — şanssız simülasyonun sonucu üç kademede.
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PANEL, YAZI, PERDE, ZEMIN, CIZGI, YAZI_RENK, VURGU, DURUM } from '../tema';
import { useOlcek } from '../olcu';
import { DENGE } from '../denge';
import { birimSayisi, orduDokumu } from '../oyun/ordu';
import { muharebeTahmini } from '../oyun/muharebe';
import { uyariGerekli } from '../oyun/hareket';

const BOS = {};

// ---- TAHMİN CÜMLELERİ (2026-08-01, Baki'nin sözleriyle) ----
//
// Eskiden tek kelimelik bir etiket (ÜSTÜN / DENK / ZAYIF) ve yanında yarım cümle vardı:
// *"saldırı rahat geçer"*, *"sonuç kıl payı belirlenir"*, *"saldırı kırılabilir"*.
// Baki hem cümleleri değiştirdi hem de yönü belirledi: **daha uzun olsa bile daha
// açıklayıcı.**
//
// ETİKET KALDIRILDI. "ÜSTÜN" yazıp yanına "saldırı zaferle sonuçlanır" eklemek aynı şeyi
// iki kez söylemekti; kademeyi zaten RENK taşıyor. Yerine tek net cümle + bir açıklama
// satırı kondu — ekranda daha az öge, kafada daha çok bilgi.
//
// KADEMENİN ANLAMI (`muharebe.js muharebeTahmini`): tahmin ŞANSSIZ simülasyondur.
//   ustun → saldıran kazanıyor ve sağ kalanların dörtte üçü senin
//   denk  → saldıran kazanıyor ama kıl payı, ya da berabere
//   zayif → SAVUNAN kazanıyor. "Mağlubiyet kesin" bu yüzden abartı değil: kuvvetler
//           açık ara olduğunda şans zaten devre dışı kalıyor (SANS_KAPANMA_ORANI).
const KADEME = {
  ustun: { renk: DURUM.arti, cumle: 'Saldırı zaferle sonuçlanır.' },
  denk: { renk: YAZI_RENK.ikincil, cumle: 'Sonucu şans belirleyecek.' },
  zayif: { renk: DURUM.eksi, cumle: 'Mağlubiyet kesin.' },
};

function tahminAciklamasi(tahmin) {
  if (tahmin.kademe === 'zayif') return 'Bu kuvvetle saldırırsan ordunu kaybedersin.';
  if (tahmin.kademe === 'denk') return 'İki taraf da kazanabilir; savaşı son raunt belirleyecek.';
  return 'Savaştan yaklaşık ' + tahmin.kalan + ' birliğin sağ döner.';
}

// Moral üstünlüklerinin sade karşılığı — sayı yerine SEBEP yazılır (tasarım dili).
// Sebepler oyun katmanından açık açık geliyor (`moralSebepleri`); toplam bonustan geri
// çıkarılmıyor, çünkü dağlık ile "kendi toprağı" aynı sayıyı verip yanlış cümle kurduruyordu.
//
// CÜMLELER 2026-08-01'de UZATILDI: yarım cümlelerdi ("Dağlar savunanın işine yarıyor") ve
// oyuncuya NE YAPTIĞINI söylemiyorlardı. Artık her biri sebebi ve sonucu birlikte veriyor.
function moralCumleleri(bilgi) {
  const m = bilgi.moralSebepleri || {};
  const c = [];
  // ARAZİ MADDESİ BURADAN KALDIRILDI (Görev 10A / Adım 4).
  // `araziCumlesi()` zaten hedef kutusunda "Arazi dağlık; savunan taraf burada belirgin
  // biçimde güçlü." diyordu; buradaki madde de aynı şeyi başka kelimelerle söylüyordu.
  // Arazi artık TEK YERDE — hem de her arazi için (düzlük ve tepelik zaten burada hiç
  // görünmüyordu, yalnız dağlık madde oluyordu; yani bu satır dengesizlik de yapıyordu).
  if (m.savunanKendiTopragi) c.push('Karşı taraf kendi toprağını koruyor, kolay geri çekilmez.');
  if (m.savunanIlMorali) c.push('Karşı tarafın ili yüksek moralli; askerleri inatçı savunur.');
  if (m.saldiranIlMorali) c.push('Senin ilin yüksek moralli; birliklerin geç bozulur.');
  return c;
}

// Arazinin tek cümlelik karşılığı. Sayı (çarpan) OYUNCUYA HİÇ GÖSTERİLMİYOR — tasarım
// dili gereği (§tema.js ARAZI_SAVUNMA); burada o sade karşılık cümleye çevriliyor.
function araziCumlesi(arazi) {
  if (arazi === 'daglik') return 'Arazi dağlık; savunan taraf burada belirgin biçimde güçlü.';
  if (arazi === 'tepelik') return 'Arazi tepelik; savunan tarafın işine yarıyor.';
  return 'Arazi düzlük; savunana ek bir avantaj vermiyor.';
}

function Sayac({ deger, enCok, onAz, onCok }) {
  const azPasif = deger === 0;
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

export default function HareketEkrani({
  bilgi, // oyunKancasi.hareketBilgisi(kaynak, hedef) — düz veri
  onEmir, // (secilen) => void
  onKapat,
  baslangic, // hamle çubuğunda seçilmiş olan kuvvet (Görev 20 / Adım 5)
  // ⚠ ALT NOT KALDIRILDI (Görev 20 / Adım 0). Görev 10A'dan kalma "Emirler tur bitince
  // çözülür; o zamana dek iptal edebilirsin" notu Görev 15'ten (anında çözüm) beri YANLIŞTI:
  // yeni oyuncuya ilk saldırısında olmayan bir kuralı öğretiyordu. Doğru hâliyle yeniden
  // yazılmadı, çünkü kural artık kendini gösteriyor (saldırı anında oluyor) ve CLAUDE.md
  // §5/10 metni son çare sayıyor. Onu besleyen `emirIpucu` ayarı da kalktı.
}) {
  const { telefon } = useOlcek();
  const b = telefon ? dar : genis;
  const [secilen, setSecilen] = useState(baslangic || BOS);
  // ---- KOMUTAN DA GİTSİN Mİ (Görev 16 / Adım 6) ----
  //
  // ⚠ VARSAYILAN KAPALI ve bu bilinçli: komutanın ordusu bozulursa komutan sahadan çekilip
  // `DENGE.KOMUTAN.BEKLEME` tur atanamıyor. Varsayılan AÇIK olsaydı oyuncu her hamlesinde
  // farkında olmadan komutanını riske atardı. Açmak bir karar, kapalı kalmak bedava değil
  // ama güvenli.
  const [komutanGelsin, setKomutanGelsin] = useState(false);

  const adet = birimSayisi(secilen);
  const eldeki = bilgi.eldeki;
  const yaraliSayi = birimSayisi(bilgi.kaynakYarali || {});
  const toplamEldeki = birimSayisi(eldeki);
  // SALDIRI MI TAŞIMA MI — SAHİPLİĞE bakılır, savunan orduya değil (2026-07-30).
  // Boş bir düşman parçasına yürümek de saldırıdır: toprak el değiştiriyor.
  const saldiriMi = !bilgi.benimMi;
  // Muharebe tahmini yalnızca karşıda ordu VARSA anlamlı.
  const savunmaVar = !!bilgi.savunan;

  const tahmin = useMemo(() => {
    if (!bilgi.savunan || adet === 0) return null;
    return muharebeTahmini({
      saldiran: { birimler: secilen },
      savunan: { birimler: bilgi.savunan.birimler },
      arazi: bilgi.arazi,
      moralBonuslari: bilgi.moralBonuslari,
      // Araştırma tabloları da geçiyor (Görev 06): tahmin ile tur sonunda olan şey
      // ancak aynı girdiyle aynı satırdan geçerse tutar. Kendine özgü dalların etkileri
      // de aynı sebeple burada (Görev 07 / Adım 2b).
      statlar: bilgi.statlar,
      etkiler: bilgi.etkiler,
    });
  }, [secilen, adet, bilgi]);

  // Savunmasız bırakma uyarısı — kural `hareket.js`'te, burada yalnızca çağrılıyor.
  const uyari = uyariGerekli(eldeki, secilen, bilgi.dusmanaSinirdas);

  function degistir(tur, fark) {
    setSecilen((s) => {
      const yeni = { ...s, [tur]: Math.min(eldeki[tur] || 0, Math.max(0, (s[tur] || 0) + fark)) };
      if (yeni[tur] === 0) delete yeni[tur];
      return yeni;
    });
  }
  // Hızlı seçimler: tek tek artırmak 8 birimlik orduda yorucu.
  function orana(pay) {
    const t = {};
    for (const tur of DENGE.BIRIM_SIRASI) {
      const n = Math.floor((eldeki[tur] || 0) * pay);
      if (n > 0) t[tur] = n;
    }
    setSecilen(t);
  }

  const satirlar = DENGE.BIRIM_SIRASI.filter((t) => eldeki[t] > 0);
  const kalanSayi = toplamEldeki - adet;
  const cumleler = savunmaVar ? moralCumleleri(bilgi) : [];

  return (
    <View style={s.tabaka}>
      {/* TAM PERDE: burada oyuncu haritaya değil karara bakıyor. Dışarı dokunmak vazgeçer. */}
      <Pressable style={s.perde} onPress={onKapat} />

      <View style={[s.kutu, b.kutu]}>
        {/* ---- BAŞLIK ---- */}
        <View style={s.baslikSatir}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[s.baslik, b.baslik, !saldiriMi && s.baslikTasi]}>
              {saldiriMi ? 'SALDIRI EMRİ' : 'ASKER TAŞI'}
            </Text>
            <Text style={[s.yer, b.yer]} numberOfLines={1}>
              {bilgi.kaynakAd} <Text style={s.ok}>→</Text> {bilgi.hedefAd}
            </Text>
          </View>
          <Pressable onPress={onKapat} hitSlop={14} style={s.kapat}>
            <Text style={s.kapatX}>×</Text>
          </Pressable>
        </View>

        <View style={s.ayrac} />

        {/* TEK DIŞ KAYDIRMA. Yatay telefonda yükseklik ~412 dp; kutu bu sınırı aşarsa
            içerik kırpılır ve GÖNDER düğmesi görünmez kalırdı. Sütunların İÇİNDE ayrı
            kaydırma YOK: en fazla üç birim türü var, kaydıracak bir şey yok — iç içe
            kaydırma alanı da parmağı hangisinin alacağını belirsiz yapardı. */}
        {/* `contentContainerStyle` ile ALT PAY: son satır kaydırma alanının kenarına
            yapışmasın. Kesilme kusurunun ikinci yarısı buydu (Adım 7). */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={s.govdeKaydirma}
          contentContainerStyle={s.govdeIcerik}
        >
          {/* ---- İKİ SÜTUN ---- */}
          <View style={s.sutunlar}>
            {/* SOL: gönderilecek kuvvet */}
            <View style={s.sol}>
              <Text style={s.blokBaslik}>GÖNDERECEĞİN BİRLİKLER</Text>
              {/* SAĞLAMLAR ÖNCE GİDER (2026-07-31). Oyuncu kaç birlik göndereceğini
                  seçiyor, hangilerini değil — kural bunu onun yerine yapıyor, o yüzden
                  yazıyla söylenmeli, yoksa "neden yaralım gitti" sorusu doğar. */}
              {yaraliSayi > 0 && (
                <Text style={[s.yaraliNot, b.kucuk]}>
                  {yaraliSayi} birliğin yaralı. Önce sağlamlar yola çıkar
                  {bilgi.kaynakSaglamSayi > 0
                    ? ' — ' + bilgi.kaynakSaglamSayi + ' sağlam birliğin var.'
                    : '; sağlam birliğin kalmadı.'}
                </Text>
              )}
              {/* ---- HAM STAT SATIRI KALDIRILDI (2026-08-01) ----
                  Her birimin altında "zırh 50 · ağır 75 · hafif 150 · dayanıklılık 300"
                  yazıyordu: üç birim × dört sayı = ekranda on iki sayı, ve hiçbiri
                  oyuncunun kafasında bir işe yaramıyordu — o hesabı zaten SAVAŞ TAHMİNİ
                  yapıyor. Baki: *"bir anda çok şey verme, saldırı ekranı sadeleşebilir."*
                  Statların gerçekten okunacağı yer araştırma ekranı; orada duruyorlar. */}
              {satirlar.map((tur) => {
                const birim = (bilgi.statlar && bilgi.statlar.saldiran[tur]) || DENGE.BIRIMLER[tur];
                const sayi = secilen[tur] || 0;
                return (
                  <View key={tur} style={s.satir}>
                    <View style={s.satirSol}>
                      <Text style={[s.birimAd, b.birimAd]}>
                        {birim.ad}
                        <Text style={s.birimEldeki}> · {eldeki[tur]} hazır</Text>
                      </Text>
                    </View>
                    <Sayac
                      deger={sayi}
                      enCok={eldeki[tur]}
                      onAz={() => degistir(tur, -1)}
                      onCok={() => degistir(tur, +1)}
                    />
                  </View>
                );
              })}

              <View style={s.hizli}>
                <Pressable onPress={() => orana(1)} hitSlop={6} style={s.hizliTus}>
                  <Text style={s.hizliMetin}>TÜMÜ</Text>
                </Pressable>
                <Pressable onPress={() => orana(0.5)} hitSlop={6} style={s.hizliTus}>
                  <Text style={s.hizliMetin}>YARISI</Text>
                </Pressable>
                <Pressable onPress={() => setSecilen(BOS)} hitSlop={6} style={s.hizliTus}>
                  <Text style={s.hizliMetin}>SIFIRLA</Text>
                </Pressable>
              </View>

              {/* GERİDE KALAN + UYARI TEK CÜMLEDE (2026-08-01). Eskiden ikisi ayrı
                  satırdı ve savunmasız kalındığında ikisi birden çıkıp aynı şeyi iki kez
                  söylüyordu. Cümle de devrikti ("5 birim Bursa'yı savunmak için kalıyor"). */}
              <Text style={[s.geride, b.kucuk, kalanSayi === 0 && uyari && s.gerideUyari]}>
                {kalanSayi > 0
                  ? bilgi.kaynakAd + ' savunmasında ' + kalanSayi + ' birlik geride kalıyor.'
                  : uyari
                    ? bilgi.kaynakAd +
                      ' tamamen savunmasız kalıyor ve düşman sınırında. Yine de gönderebilirsin.'
                    : bilgi.kaynakAd + ' savunmasız kalıyor.'}
              </Text>

              {/* HAMLE HAKKI (Görev 15): bu tur hakkını kullanmış birlikler listede
                  görünmüyor. Sebebi yazılmazsa oyuncu "askerim nerede" diye arar. */}
              {bilgi.yorgunSayi > 0 && (
                <Text style={[s.geride, b.kucuk]}>
                  {bilgi.yorgunSayi} birlik bu tur hakkını kullandı. Piyade ve topçu turda bir,
                  zırhlı iki kez hareket eder.
                </Text>
              )}
            </View>

            {/* SAĞ: karşındaki */}
            <View style={s.sag}>
              <Text style={s.blokBaslik}>{saldiriMi ? 'KARŞINDAKİLER' : 'GİDECEĞİ YER'}</Text>

              <View style={s.bilgiKutu}>
                <Text style={[s.hedefAd, b.birimAd]} numberOfLines={1}>
                  {bilgi.hedefAd}
                </Text>
                <Text style={[s.hedefAlt, b.kucuk]}>
                  {bilgi.hedefIl} ili · {bilgi.sahipAd}
                </Text>
                {/* İKİ SATIRLIK ARAZİ TABLOSU TEK CÜMLEYE İNDİ (2026-08-01).
                    "ARAZİ: Dağlık" + "SAVUNMA GÜCÜ: Yüksek" iki ayrı satırdı ve ikisi de
                    aynı şeyi söylüyordu. Şimdi tek cümle, üstelik NE DEMEK olduğuyla. */}
                <Text style={[s.araziCumle, b.kucuk]}>{araziCumlesi(bilgi.arazi)}</Text>
              </View>

              {savunmaVar ? (
                <View style={s.bilgiKutu}>
                  <Text style={[s.k, b.kucuk]}>SAVUNAN ORDU · {bilgi.savunan.sayi} BİRLİK</Text>
                  {/* Karşı tarafın ham statları da kaldırıldı (sol sütundakiyle aynı
                      gerekçe): oyuncu "zırh 50 · day. 300" ile hesap yapmıyor, tahmine
                      bakıyor. Kalan bilgi neyle savunduğu — asıl merak edilen bu. */}
                  {bilgi.savunan.satirlar.map((x) => (
                    <View key={x.anahtar} style={s.dusmanSatir}>
                      <Text style={[s.dusmanAd, b.kucuk]}>
                        {x.sayi} × {x.ad}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={s.bilgiKutu}>
                  <Text style={[s.v, b.kucuk]}>
                    {bilgi.benimMi
                      ? 'Burası senin — birlikler orada birleşir.'
                      : 'Savunan yok — burası savaşmadan senin olur.'}
                  </Text>
                </View>
              )}

              {cumleler.length > 0 && (
                <View style={s.moralKutu}>
                  {cumleler.map((c) => (
                    <Text key={c} style={[s.moralSatir, b.kucuk]}>
                      • {c}
                    </Text>
                  ))}
                </View>
              )}

              {bilgi.ganimet > 0 && (
                <Text style={[s.ganimet, b.kucuk]}>
                  Burayı alırsan seferberlikten {bilgi.ganimet} nüfus kazanırsın.
                </Text>
              )}
            </View>
          </View>

          {/* ---- TAHMİN ---- yalnızca karşıda savunan bir ordu varsa.
              Tek kelimelik kademe etiketi kaldırıldı; kademeyi RENK taşıyor, anlamı CÜMLE.
              Savunmasız kalma uyarısı da buradan kalktı — sol sütundaki geride kalan
              satırıyla birleşti, aynı şeyi iki yerde söylemeyelim. */}
          {savunmaVar && (
            <View style={s.tahminKutu}>
              <Text style={[s.tahminBaslik, b.kucuk]}>SAVAŞ TAHMİNİ</Text>
              {tahmin ? (
                <>
                  <Text style={[s.tahminCumle, { color: KADEME[tahmin.kademe].renk }]}>
                    {KADEME[tahmin.kademe].cumle}
                  </Text>
                  <Text style={[s.tahminAlt, b.kucuk]}>{tahminAciklamasi(tahmin)}</Text>
                </>
              ) : (
                <Text style={[s.tahminAlt, b.kucuk]}>
                  Kaç birlik göndereceğini seç, tahmini burada göreceksin.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* ---- ALT ---- GÖNDER düğmesi kaydırmanın DIŞINDA: ekran ne kadar dolu olursa
            olsun hep aynı yerde ve hep görünür kalır. */}
        {/* KOMUTAN KUTUSU — yalnızca komutan bu parçadayken çıkıyor. Her hamlede sorulan
            bir kutu, bir süre sonra okunmadan işaretlenen bir kutudur. */}
        {bilgi.komutanBurada && (
          <Pressable
            style={s.komutanKutu}
            onPress={() => setKomutanGelsin((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: komutanGelsin }}
          >
            <View style={[s.kutucuk, komutanGelsin && s.kutucukDolu]}>
              {komutanGelsin && <Text style={s.tik}>✓</Text>}
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={[s.komutanMetin, b.kucuk]}>KOMUTAN DA GİTSİN</Text>
              <Text style={[s.komutanNot, b.kucuk]}>
                {saldiriMi
                  ? 'Saldırı kırılırsa komutan sahadan çekilir.'
                  : 'Komutan yeni yerinde ordunun başına geçer.'}
              </Text>
            </View>
          </Pressable>
        )}

        <View style={s.altSatir}>
          <View style={{ flexShrink: 1 }}>
            <Text style={[s.k, b.kucuk]}>GİDECEK</Text>
            <Text style={[s.gidecek, b.birimAd]} numberOfLines={1}>
              {adet === 0 ? '—' : orduDokumu(secilen)}
            </Text>
          </View>
          <Pressable
            onPress={() => onEmir(secilen, { komutan: komutanGelsin && bilgi.komutanBurada })}
            disabled={adet === 0}
            style={[s.gonder, adet === 0 && s.gonderPasif]}
          >
            <Text style={[s.gonderMetin, adet === 0 && s.gonderMetinPasif]}>
              {adet === 0
                ? saldiriMi
                  ? 'SALDIR'
                  : 'TAŞI'
                : (saldiriMi ? 'SALDIR · ' : 'TAŞI · ') + adet}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Onay kutusuyla aynı perde: göz karara gitsin, arkadaki hiçbir şeye basılmasın.
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.orta },
  kutu: {
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 14,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.55,
    shadowRadius: 26,
    elevation: 26,
  },

  baslikSatir: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  baslik: { fontFamily: YAZI.baslik, letterSpacing: 2.2, color: DURUM.eksi },
  yer: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil, marginTop: 2 },
  ok: { color: YAZI_RENK.birincil },
  yaraliNot: { fontFamily: YAZI.govde, color: DURUM.eksi, marginBottom: 5 },
  kapat: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  kapatX: { fontSize: 24, color: YAZI_RENK.ikincil, lineHeight: 26 },

  ayrac: { height: 1, backgroundColor: CIZGI.ayrac, marginVertical: 9 },

  // Kutunun kaydırılabilen gövdesi. `flexShrink: 1` şart: kutu maxHeight'a dayandığında
  // kaydırma alanı küçülsün, alt satırı (GÖNDER) ekranın dışına itmesin.
  govdeKaydirma: { flexShrink: 1 },
  govdeIcerik: { paddingBottom: 8 },
  sutunlar: { flexDirection: 'row', gap: 12 },
  sol: { flex: 1.15 },
  sag: { flex: 1 },
  blokBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    letterSpacing: 1.6,
    color: YAZI_RENK.birincil,
    marginBottom: 5,
  },

  satir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  satirSol: { flexShrink: 1 },
  birimAd: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil },
  birimEldeki: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },
  birimStat: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 1 },

  sayac: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tus: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
  },
  // Pasif tuş sönük ama YERİNDE durur — kaybolursa satırlar zıplar.
  tusPasif: { backgroundColor: 'transparent', borderColor: CIZGI.ayrac },
  tusMetin: { fontFamily: YAZI.sayi, fontSize: 21, lineHeight: 24, color: YAZI_RENK.birincil },
  tusMetinPasif: { color: YAZI_RENK.soluk },
  sayi: {
    minWidth: 28,
    textAlign: 'center',
    fontFamily: YAZI.sayi,
    fontSize: 17,
    color: YAZI_RENK.birincil,
  },

  hizli: { flexDirection: 'row', gap: 6, marginTop: 6 },
  hizliTus: {
    borderWidth: 1,
    borderColor: CIZGI.ince,
    backgroundColor: ZEMIN.cukur,
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  hizliMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    letterSpacing: 0.8,
    color: YAZI_RENK.birincil,
  },
  geride: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 6, lineHeight: 15 },
  gerideUyari: { fontFamily: YAZI.govdeKalin, color: DURUM.eksi },

  bilgiKutu: {
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 9,
    marginBottom: 6,
  },
  hedefAd: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil },
  hedefAlt: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 1, marginBottom: 3 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  k: { fontFamily: YAZI.etiket, letterSpacing: 1, color: YAZI_RENK.ikincil },
  v: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil },
  dusmanSatir: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, gap: 6 },
  dusmanAd: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil, flexShrink: 1 },
  dusmanStat: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil },

  moralKutu: { marginBottom: 6 },
  moralSatir: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, lineHeight: 15 },
  // ---- ⚠ BU SATIR ORTADAN KESİLİYORDU (Görev 10A / Adım 7) ----
  // "Burayı alırsan seferberlikten N nüfus kazanırsın." cümlesinin ALT YARISI kırpılıyordu.
  // Sebep dosyanın kendi dersi: `fontSize` `b.kucuk` ile veriliyor ama `lineHeight` HİÇ
  // verilmiyordu. Satır yüksekliğini yazı tipi belirleyince kutunun (maxHeight %94)
  // içindeki hesap tahmine dönüyor ve son satır kenardan taşıyor.
  // Artık satır yüksekliği açık — 15, hem 10 hem 11.5 puntoyu rahat alıyor.
  ganimet: { fontFamily: YAZI.govdeKalin, lineHeight: 15, color: DURUM.arti },

  tahminKutu: {
    marginTop: 4,
    backgroundColor: ZEMIN.cukur,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tahminBaslik: { fontFamily: YAZI.baslik, letterSpacing: 1.4, color: YAZI_RENK.ikincil },
  tahminCumle: { fontFamily: YAZI.baslik, fontSize: 14, marginTop: 3, letterSpacing: 0.5 },
  tahminAlt: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 2, lineHeight: 15 },
  araziCumle: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 3, lineHeight: 15 },

  komutanKutu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: PANEL.pirinc,
    backgroundColor: ZEMIN.cukur,
  },
  kutucuk: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: PANEL.pirinc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kutucukDolu: { backgroundColor: PANEL.pirinc },
  tik: { color: ZEMIN.cukur, fontFamily: YAZI.govdeKalin, fontSize: 12, lineHeight: 14 },
  komutanMetin: { fontFamily: YAZI.govdeKalin, color: PANEL.pirinc },
  komutanNot: { fontFamily: YAZI.govde, color: YAZI_RENK.ikincil, marginTop: 1 },
  altSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 9,
  },
  gidecek: { fontFamily: YAZI.govdeKalin, color: YAZI_RENK.birincil, marginTop: 1 },
  baslikTasi: { color: YAZI_RENK.birincil },
  gonder: {
    backgroundColor: VURGU.saldiri,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  gonderPasif: { backgroundColor: ZEMIN.cukur, borderWidth: 1, borderColor: CIZGI.ayrac },
  gonderMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 12.5,
    letterSpacing: 0.9,
    color: PANEL.vurguUstu,
  },
  gonderMetinPasif: { color: YAZI_RENK.soluk },
});

// Tablet / geniş ekran.
const genis = StyleSheet.create({
  kutu: {
    width: 620,
    maxWidth: '92%',
    maxHeight: '94%',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  baslik: { fontSize: 13 },
  yer: { fontSize: 15 },
  birimAd: { fontSize: 14 },
  kucuk: { fontSize: 11.5 },
});

// Yatay telefon — dar olan yön YÜKSEKLİK, o yüzden dikeyde cimri.
const dar = StyleSheet.create({
  kutu: {
    width: 540,
    maxWidth: '95%',
    maxHeight: '96%',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  baslik: { fontSize: 11 },
  yer: { fontSize: 13 },
  birimAd: { fontSize: 12.5 },
  kucuk: { fontSize: 10 },
});
