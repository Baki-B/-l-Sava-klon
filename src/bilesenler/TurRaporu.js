// TUR RAPORU — turu bitirince ne olduğunu anlatan sonuç ekranı (Görev 05 / Adım 5).
//
// Görev belgesi tek bir "muharebe sonuç kutusu" öngörüyordu; emir kuyruğu seçildiği için
// (Soru 1 → cevap B) bir turda birden çok muharebe olabiliyor, dolayısıyla kutu bir LİSTE.
//
// DETAYLAR (2026-07-30, Baki: "sonuç ekranında savaşların detayları gözüksün"):
// Her muharebe satırında artık kim ne gönderdi, karşısında ne vardı, TÜR TÜR kim ne
// kaybetti, arazi ve moral yazıyor. Tur tur döküm ayrı bir çekmecede duruyor — hepsi birden
// açık olsa ekran sayı duvarına dönüyor; oyuncu merak ettiği muharebeyi açıp bakıyor.
//
// DİL: sayı değil, olan biten. "Kazandın / kaybettin", "X senin oldu", "Y'ye çekildi".
// Sayılar cümlenin yanında duruyor, tablo hâlinde değil (tasarım dili: sade, 18 altı da okur).
//
// CANLANDIRMA YOK — tur tur animasyon bu görevin işi değil; döküm metin olarak veriliyor.
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { PANEL, YAZI, PERDE, RENK, ARAZI_AD, KAGIT } from '../tema';
import { useOlcek } from '../olcu';

const YESIL = RENK.okTakviye;

// Bir muharebe satırını tek cümleye çevirir.
// Cümleler 2026-08-01'de uzatıldı: eskiden ne olduğunu söylüyor, SONUCUNU söylemiyorlardı.
// "Saldırın kırıldı, ordun dağıldı" doğruydu ama oyuncu "peki şimdi ne oldu" diye kalıyordu.
//
// SAVUNAN GÖZÜNDEN (2026-09-24 düzeltmesi): `r.taraf === 'savunan'` ise oyuncu SALDIRAN
// değil — rakip ona saldırdı. Eskiden bu satırlar da "burası artık senin" diye yazılıyordu.
function muharebeCumlesi(r) {
  if (r.taraf === 'savunan') {
    const o = r.saldiranAd || 'Karşı taraf';
    if (r.kazanan === 'saldiran')
      return r.sebep === 'imha'
        ? r.hedefAd + ' savunmasında tek birliğin kalmadı; burası artık ' + o + ' elinde.'
        : r.hedefAd + ' savunman dayanamadı; burası artık ' + o + ' elinde.';
    if (r.kazanan === 'savunan')
      return r.sebep === 'imha'
        ? o + ' ordusu ' + r.hedefAd + ' önünde tamamen yok oldu.'
        : o + ' saldırısını püskürttün; ' + r.hedefAd + ' senin kaldı.';
    return 'Savaş sonuçsuz bitti. İki taraf da yıprandı, kimse yer değiştirmedi.';
  }
  if (r.kazanan === 'saldiran')
    return r.sebep === 'imha'
      ? r.hedefAd + ' savunmasında tek bir birlik bile kalmadı; burası artık senin.'
      : r.hedefAd + ' savunması dayanamadı ve dağıldı; burası artık senin.';
  if (r.kazanan === 'savunan')
    return r.sebep === 'imha'
      ? 'Gönderdiğin birlikler ' + r.hedefAd + ' önünde tamamen yok oldu.'
      : 'Saldırın kırıldı ve ordun dağıldı; ' + r.hedefAd + ' karşı tarafta kaldı.';
  return 'Savaş sonuçsuz bitti. İki taraf da yıprandı, kimse yer değiştirmedi.';
}

// Bir raundun BAŞA GELEN OLAYI — sayı değil cümle (2026-07-31, Baki: "developer gibi
// arayüzü bırakalım, her şey oyuncuya hitap etsin").
//
// Eskiden burada altı sütunluk bir tablo ve altında "iki sayı varsa soldaki SENİN..." diye
// bir kullanım kılavuzu vardı. Tablo okumayı öğretmek yerine olanı anlatıyoruz; sayılar
// cümlenin altında destek olarak duruyor.
function rauntOlayi(t, savundum) {
  const ben = savundum ? t.savunanKayip : t.saldiranKayip,
    o = savundum ? t.saldiranKayip : t.savunanKayip;
  if (ben === 0 && o === 0) return 'İki taraf da dayandı, kimse düşmedi.';
  if (ben === 0) return o + ' birlik düşürdün, sen kayıp vermedin.';
  if (o === 0) return ben + ' birlik kaybettin, karşı taraf kayıpsız çıktı.';
  return ben + ' birlik kaybettin, ' + o + ' birlik düşürdün.';
}

// Moral yalnızca KRİTİKKEN yazılıyor; her raunt yazılsa gürültü olurdu.
function moralUyarisi(t, savundum) {
  const benim = savundum ? t.savunanMoral : t.saldiranMoral,
    onun = savundum ? t.saldiranMoral : t.savunanMoral;
  if (benim <= 1 && onun <= 1) return 'İki ordunun da morali bitmek üzere.';
  if (benim <= 1) return 'Ordunun morali bitmek üzere.';
  if (onun <= 1) return 'Karşı tarafın morali bitmek üzere.';
  return null;
}

// Savaşın raunt raunt günlüğü. Kapalı başlar; başlığa dokununca açılır.
//
// "TUR" DEĞİL "RAUNT": oyunun turu ile savaşın turu aynı kelimeydi ve bu gerçekten
// karıştırıyordu ("4 muharebe turu" — hangi tur?). Savaşın içindeki turlara raunt dendi.
// ---- SADELEŞTİRME (2026-08-01, Baki: "bir anda çok şey verme, sonuç ekranı sadeleşebilir") ----
//
// Muharebe satırı şunları AYNI ANDA gösteriyordu: kim kime saldırdı · KAZANDIN/KAYBETTİN ·
// sonuç cümlesi · "Sen: … gönderdin, … kaybettin, … sağ döndü" · "Karşı taraf: … ile
// savundu, …" · "Yer: dağlık arazi, 4 raunt sürdü" · yaralı notu · çekilme · ganimet.
// Bir turda üç muharebe olduğunda bu bir sayı duvarıydı.
//
// AYRINTI SATIRLARI ARTIK ÇEKMECEDE. Çekmece zaten vardı (raunt raunt döküm); iki ayrı
// açılır bölüm yerine tek bir "SAVAŞIN AYRINTISI" oldu. Üstte kalan şey oyuncunun
// gerçekten baktığı şey: kim kazandı, ne oldu, ne kazandın.
function Dokum({ r, kucuk }) {
  const [acik, setAcik] = useState(false);
  const rauntVar = r.turlar && r.turlar.length > 0;
  const savundum = r.taraf === 'savunan';
  const karsi = savundum ? r.saldiranAd : r.savunanAd;

  return (
    <View style={s.dokumKutu}>
      <Pressable onPress={() => setAcik((a) => !a)} hitSlop={6}>
        <Text style={s.dokumBaslik}>
          {acik ? '▾' : '▸'} SAVAŞIN AYRINTISI
          {rauntVar ? ' · ' + r.turlar.length + ' raunt' : ''}
        </Text>
      </Pressable>

      {acik && (
        <View style={s.detay}>
          {r.kendiYaraliDokum && (
            <Text style={[s.ayrinti, s.yaraliSatir, kucuk]}>
              Sağ dönen birliklerinden {r.kendiYaraliDokum} yaralı; toparlanmaya ihtiyaçları var.
            </Text>
          )}
          <Text style={[s.ayrinti, kucuk]}>
            <Text style={s.ayrintiEtiket}>Sen: </Text>
            {savundum
              ? (r.savunanGirenDokum || '—') + ' ile savundun'
              : (r.gonderilenDokum || '—') + ' gönderdin'}
            {r.kendiKayipDokum ? ', ' + r.kendiKayipDokum + ' kaybettin' : ', kayıp vermedin'}
            {savundum
              ? r.savunanKalan > 0
                ? ', ' + r.savunanKalan + ' birliğin ayakta kaldı.'
                : '.'
              : r.saldiranKalan > 0
                ? ', ' + r.saldiranKalan + ' birliğin sağ döndü.'
                : '.'}
          </Text>
          <Text style={[s.ayrinti, kucuk]}>
            <Text style={s.ayrintiEtiket}>{karsi || 'Karşı taraf'}: </Text>
            {savundum
              ? (r.gonderilenDokum || '—') + ' ile saldırdı'
              : (r.savunanGirenDokum || '—') + ' ile savundu'}
            {r.dusmanKayipDokum ? ', ' + r.dusmanKayipDokum + ' kaybetti' : ', kayıp vermedi'}
            {savundum
              ? r.saldiranKalan > 0
                ? ', ' + r.saldiranKalan + ' birliği sağ döndü.'
                : '.'
              : r.savunanKalan > 0
                ? ', ' + r.savunanKalan + ' birliği ayakta kaldı.'
                : '.'}
          </Text>
          <Text style={[s.ayrinti, kucuk]}>
            <Text style={s.ayrintiEtiket}>Yer: </Text>
            {ARAZI_AD[r.arazi]} arazide savaşıldı; muharebe {r.turSayisi} raunt sürdü.
          </Text>
        </View>
      )}

      {acik &&
        rauntVar &&
        r.turlar.map((t, i) => {
          const uyari = moralUyarisi(t, savundum);
          return (
            <View key={i} style={s.raunt}>
              <Text style={s.rauntNo}>{i + 1}</Text>
              <View style={s.rauntGovde}>
                <Text style={[s.rauntOlay, kucuk]}>{rauntOlayi(t, savundum)}</Text>
                <Text style={[s.rauntSayi, kucuk]}>
                  Vuruşun {savundum ? t.savunanVurus : t.saldiranVurus}, onunki{' '}
                  {savundum ? t.saldiranVurus : t.savunanVurus} · sende{' '}
                  {savundum ? t.savunanKalan : t.saldiranKalan}, onda{' '}
                  {savundum ? t.saldiranKalan : t.savunanKalan} birlik kaldı
                  {t.sans ? ' · şans devreye girdi' : ''}
                </Text>
                {uyari && <Text style={[s.rauntMoral, kucuk]}>{uyari}</Text>}
              </View>
            </View>
          );
        })}
    </View>
  );
}

// Toparlanma satırının cümlesi. İyileşen ve yerine gelen AYRI yazılıyor: ikisi farklı
// şeyler ve bedelleri de farklı, tek sayıda birleştirmek bilgiyi kaybettirirdi.
function toparlanmaCumlesi(r) {
  const olan = [];
  if (r.iyilesenDokum) olan.push(r.iyilesenDokum + ' iyileşti');
  if (r.dolanDokum) olan.push(r.dolanDokum + ' yerine yenisi geldi');
  const kalan = [];
  if (r.iyilesemeyenDokum) kalan.push(r.iyilesemeyenDokum + ' hâlâ yaralı');
  if (r.basilamayanDokum) kalan.push(r.basilamayanDokum + ' hâlâ eksik');

  return (
    (r.cekildi ? 'Çekildiği yerde toparlandı — ' : '') +
    olan.join(', ') +
    '. Bedeli: ' +
    r.harcanan.nufus +
    ' nüfus / ' +
    r.harcanan.ekonomi +
    ' ekonomi.' +
    (kalan.length ? ' Bütçe yetmedi: ' + kalan.join(', ') + '.' : '')
  );
}

function Satir({ r, kucuk }) {
  // İyi mi kötü mü OYUNCUNUN gözünden: savunduğu savaşta kazanan 'savunan' olmalı; boş
  // parçasına yürünmesi (giriş + savunan taraf) her zaman kötü.
  const savundum = r.taraf === 'savunan';
  const iyi =
    r.tip === 'muharebe'
      ? r.kazanan === (savundum ? 'savunan' : 'saldiran')
      : r.tip !== 'iptal' && !savundum;

  // ---- ARAŞTIRMA (Görev 06 / §8/2) ----
  if (r.tip === 'arastirma')
    return (
      <View style={s.satir}>
        <View style={[s.serit, { backgroundColor: KAGIT.yazi }]} />
        <View style={s.govde}>
          <Text style={s.yol}>Araştırma</Text>
          <Text style={[s.aciklama, kucuk]}>
            {r.harcanan} ekonomi ayrıldı, {r.kazanilan} puan kazanıldı.
          </Text>
        </View>
      </View>
    );

  // ---- YENİDEN TOPLANMA (Görev 06 / §3.9) ----
  if (r.tip === 'toplanma')
    return (
      <View style={s.satir}>
        <View style={[s.serit, { backgroundColor: r.olmadi ? KAGIT.yaziIkincil : KAGIT.yazi }]} />
        <View style={s.govde}>
          <Text style={s.yol}>
            {r.kaynakAd}
            {r.cekildi ? <Text style={s.ok}> → {r.yerAd}</Text> : null} · toparlanma
          </Text>
          <Text style={[s.aciklama, kucuk]}>
            {r.olmadi === 'ordu-yok'
              ? 'Bu ordu toparlanamadı çünkü aynı tur yok oldu. Hiçbir kaynağın harcanmadı.'
              : r.olmadi === 'butce'
                ? 'Bu ordu toparlanamadı çünkü bütçen tek bir birliğe bile yetmedi.'
                : r.olmadi
                  ? 'Bu ordu toparlanamadı çünkü iyileştirilecek ya da yerine konacak bir şey kalmamıştı.'
                  : toparlanmaCumlesi(r)}
          </Text>
        </View>
      </View>
    );

  if (r.tip === 'iptal')
    return (
      <View style={s.satir}>
        <View style={[s.serit, { backgroundColor: KAGIT.yaziIkincil }]} />
        <View style={s.govde}>
          <Text style={s.yol}>
            {r.kaynakAd} <Text style={s.ok}>→</Text> {r.hedefAd}
          </Text>
          <Text style={[s.aciklama, kucuk]}>
            {/* "Emir iptal oldu: sebep" kalıbı bir kayıt satırı gibi okunuyordu (2026-08-01).
                Artık sebebi düz cümleyle anlatıyor. */}
            {r.sebep === 'ordu-yok'
              ? 'Bu emir işlenemedi çünkü gönderecek askerin kalmamıştı.'
              : 'Bu emir işlenemedi çünkü askerin yola çıkacağı bölge elden gitmişti.'}
          </Text>
        </View>
      </View>
    );

  // Boş parçan savaşmadan alındı (2026-09-24: eskiden raporda hiç görünmüyordu).
  if (r.tip === 'giris' && savundum)
    return (
      <View style={s.satir}>
        <View style={[s.serit, { backgroundColor: KAGIT.eksi }]} />
        <View style={s.govde}>
          <Text style={s.yol}>
            {r.kaynakAd} <Text style={s.ok}>→</Text> {r.hedefAd}
          </Text>
          <Text style={[s.aciklama, kucuk]}>
            {(r.saldiranAd || 'Karşı taraf') +
              ', boş kalan ' +
              r.hedefAd +
              ' bölgeni savaşmadan aldı.'}
          </Text>
          {r.ilKaybedildi && r.ilAd ? (
            <Text style={[s.kayipIl, kucuk]}>{r.ilAd} ilinin tamamı artık senin değil.</Text>
          ) : null}
        </View>
      </View>
    );

  if (r.tip === 'giris')
    return (
      <View style={s.satir}>
        <View style={[s.serit, { backgroundColor: YESIL }]} />
        <View style={s.govde}>
          <Text style={s.yol}>
            {r.kaynakAd} <Text style={s.ok}>→</Text> {r.hedefAd}
          </Text>
          <Text style={[s.aciklama, kucuk]}>
            {r.fethedildi
              ? r.hedefAd + ' savaşmadan senin oldu.'
              : 'Birliklerin ' + r.hedefAd + ' bölgesine yerleşti.'}
          </Text>
          {r.gonderilenDokum && (
            <Text style={[s.ayrinti, kucuk]}>Giden birlikler: {r.gonderilenDokum}</Text>
          )}
          {r.fethedildi && <Kazanc r={r} kucuk={kucuk} />}
        </View>
      </View>
    );

  return (
    <View style={s.satir}>
      <View style={[s.serit, { backgroundColor: iyi ? YESIL : KAGIT.eksi }]} />
      <View style={s.govde}>
        <Text style={s.yol}>
          {r.kaynakAd} <Text style={s.ok}>→</Text> {r.hedefAd}
        </Text>
        <Text style={[s.sonuc, { color: iyi ? KAGIT.arti : KAGIT.eksi }]}>
          {iyi ? 'KAZANDIN' : 'KAYBETTİN'}
        </Text>
        <Text style={[s.aciklama, kucuk]}>{muharebeCumlesi(r)}</Text>

        {r.cekilme && (
          <Text style={[s.cekilme, kucuk]}>
            {r.cekilme.taraf === (savundum ? 'savunan' : 'saldiran')
              ? 'Ordun'
              : 'Karşı tarafın ordusu'}{' '}
            {r.cekilme.yokOldu
              ? 'kaçacak yer bulamadı ve dağıldı.'
              : r.cekilmeAd +
                ' bölgesine çekildi' +
                (r.cekilme.kayip > 0
                  ? '; kaçarken ' + r.cekilme.kayip + ' birlik daha gitti.'
                  : '.')}
          </Text>
        )}

        <Dokum r={r} kucuk={kucuk} />
        {r.fethedildi && !savundum && <Kazanc r={r} kucuk={kucuk} />}
        {r.fethedildi && savundum && r.ilKaybedildi && r.ilAd ? (
          <Text style={[s.kayipIl, kucuk]}>{r.ilAd} ilinin tamamı artık senin değil.</Text>
        ) : null}
      </View>
    </View>
  );
}

function Kazanc({ r, kucuk }) {
  return (
    <View style={s.kazanc}>
      <Text style={[s.kazancMetin, kucuk]}>
        {r.hedefAd} senin oldu
        {r.ganimet > 0 ? ' · seferberlikten +' + r.ganimet + ' nüfus' : ''}
      </Text>
      {r.ilTamamlandi && r.ilAd && (
        <Text style={s.ilMetin}>{r.ilAd} ilinin tamamı artık senin!</Text>
      )}
    </View>
  );
}

export default function TurRaporu({ rapor, onKapat }) {
  const { telefon } = useOlcek();
  const kucuk = telefon ? s.kucuk : null;
  const o = rapor.ozet;

  return (
    <View style={s.tabaka}>
      <Pressable style={s.perde} onPress={onKapat} />
      <View style={[s.kutu, telefon && s.kutuDar]}>
        <Text style={s.baslik}>TUR {String(rapor.tur).padStart(2, '0')} — SONUÇ</Text>
        <Text style={s.ozet}>
          {o.muharebe > 0
            ? o.muharebe + ' muharebe · ' + o.kazanilan + ' kazanıldı'
            : 'Muharebe olmadı'}
          {/* Oyuncunun kelimesi BÖLGE (2026-08-01, yayın hazırlığı). */}
          {o.fetih > 0 ? ' · ' + o.fetih + ' bölge alındı' : ''}
          {o.ilTamamlandi > 0 ? ' · ' + o.ilTamamlandi + ' il tamamlandı' : ''}
          {o.kaybedilenBolge > 0 ? ' · ' + o.kaybedilenBolge + ' bölge kaybedildi' : ''}
        </Text>
        {o.muharebe > 0 && (
          <Text style={s.ozetKayip}>
            Toplam kaybın {o.kendiKaybi} birim · düşmanın {o.dusmanKaybi} birim
          </Text>
        )}

        <View style={s.ayrac} />

        <ScrollView showsVerticalScrollIndicator={false} style={s.liste}>
          {rapor.satirlar.length === 0 && rapor.mansetler.length === 0 ? (
            <Text style={s.bosTur}>Bu tur senin cephende bir şey olmadı.</Text>
          ) : null}

          {rapor.satirlar.map((r) => (
            <Satir key={r.anahtar} r={r} kucuk={kucuk} />
          ))}

          {/* ---- HARİTANIN GERİ KALANI (Görev 07 / Soru 5 → cevap A) ----
              Dünya kendi kendine oynuyor; 80 aktörün savaşını raunt raunt yazmak okunacak
              metin değil. Sana dokunmayan olaylar tek satırlık manşet olarak, ÖNEM
              SIRASINDA geliyor: yakınlık > ilin değeri > aktörün büyüklüğü. Sıralama ve
              sınır `oyunKancasi`'nda; burası yalnızca yazıyor. */}
          {rapor.mansetler.length > 0 && (
            <View style={s.mansetBolum}>
              <Text style={s.mansetBaslik}>HARİTANIN GERİ KALANI</Text>
              {rapor.mansetler.map((m) => (
                <Text key={m.anahtar} style={[s.manset, kucuk]}>
                  {/* Sınırındaki olay ayrı işaretli — seni ilgilendiren haber bu. */}
                  {m.yakin ? (
                    <Text style={s.mansetYakin}>▸ </Text>
                  ) : (
                    <Text style={s.mansetUzak}>· </Text>
                  )}
                  {m.cumle}
                </Text>
              ))}
              {rapor.digerFetih > rapor.mansetler.length && (
                <Text style={[s.mansetArtik, kucuk]}>
                  Haritanın başka yerlerinde {rapor.digerFetih - rapor.mansetler.length} bölge daha
                  el değiştirdi.
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <Pressable style={s.kapatTus} onPress={onKapat}>
          <Text style={s.kapatMetin}>TAMAM</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabaka: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  perde: { ...StyleSheet.absoluteFillObject, backgroundColor: PERDE.hafif },

  // ---- MANŞETLER (Görev 07) ----
  bosTur: { fontFamily: YAZI.govde, fontSize: 13, color: KAGIT.yaziIkincil, marginBottom: 10 },
  mansetBolum: { marginTop: 6, borderTopWidth: 1, borderTopColor: KAGIT.cizgi, paddingTop: 9 },
  mansetBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 10.5,
    letterSpacing: 1.8,
    color: KAGIT.yaziIkincil,
    marginBottom: 6,
  },
  manset: { fontFamily: YAZI.govde, fontSize: 13, color: KAGIT.yazi, marginBottom: 4 },
  // Sınırındaki olay pirinç okla; uzaktaki sönük noktayla. Aynı listede iki önem kademesi.
  mansetYakin: { color: KAGIT.yazi },
  mansetUzak: { color: KAGIT.yaziSoluk },
  mansetArtik: { fontFamily: YAZI.govde, fontSize: 12, color: KAGIT.yaziIkincil, marginTop: 3 },
  kutu: {
    width: 480,
    maxWidth: '90%',
    maxHeight: '94%',
    backgroundColor: KAGIT.yuzey,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 17,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  kutuDar: { width: 520, maxWidth: '95%', paddingVertical: 10, paddingHorizontal: 13 },

  baslik: { fontFamily: YAZI.baslik, fontSize: 13, letterSpacing: 2.2, color: KAGIT.yazi },
  ozet: { fontFamily: YAZI.govdeKalin, fontSize: 12.5, color: KAGIT.yazi, marginTop: 4 },
  ozetKayip: { fontFamily: YAZI.govde, fontSize: 11.5, color: KAGIT.yaziIkincil, marginTop: 2 },
  ayrac: { height: 1, backgroundColor: KAGIT.cizgi, marginVertical: 10 },

  liste: { flexGrow: 0 },
  satir: { flexDirection: 'row', gap: 10, paddingVertical: 7 },
  serit: { width: 3, borderRadius: 2 },
  govde: { flex: 1 },
  yol: { fontFamily: YAZI.govdeKalin, fontSize: 13, color: KAGIT.yazi },
  ok: { color: KAGIT.yazi },
  sonuc: { fontFamily: YAZI.baslik, fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
  aciklama: {
    fontFamily: YAZI.govde,
    fontSize: 12.5,
    lineHeight: 17,
    color: KAGIT.yazi,
    marginTop: 2,
  },

  detay: { marginTop: 4 },
  ayrinti: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 16,
    color: KAGIT.yaziIkincil,
    marginTop: 2,
  },
  cekilme: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    lineHeight: 16,
    color: KAGIT.yaziIkincil,
    marginTop: 4,
  },
  kucuk: { fontSize: 10.5, lineHeight: 14 },

  // Tur tur döküm çekmecesi
  dokumKutu: { marginTop: 6 },
  dokumBaslik: {
    fontFamily: YAZI.baslik,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: KAGIT.yazi,
    paddingVertical: 3,
  },
  // Raunt günlüğü — tablo değil, satır satır anlatım.
  raunt: { flexDirection: 'row', gap: 8, marginTop: 7 },
  rauntNo: {
    width: 18,
    height: 18,
    borderRadius: 5,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: YAZI.sayi,
    fontSize: 10,
    color: KAGIT.yaziIkincil,
    backgroundColor: KAGIT.cukur,
    overflow: 'hidden',
  },
  rauntGovde: { flex: 1 },
  rauntOlay: { fontFamily: YAZI.govdeKalin, color: KAGIT.yazi, lineHeight: 15 },
  rauntSayi: { fontFamily: YAZI.govde, color: KAGIT.yaziIkincil, lineHeight: 14, marginTop: 1 },
  rauntMoral: { fontFamily: YAZI.govde, color: KAGIT.eksi, lineHeight: 14, marginTop: 1 },
  ayrintiEtiket: { fontFamily: YAZI.govdeKalin, color: KAGIT.yazi },
  yaraliSatir: { color: KAGIT.eksi },

  kazanc: {
    marginTop: 6,
    backgroundColor: KAGIT.cukur,
    borderWidth: 1,
    borderColor: KAGIT.cizgi,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },
  kazancMetin: { fontFamily: YAZI.govdeKalin, fontSize: 12, color: KAGIT.arti },
  ilMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    letterSpacing: 0.8,
    color: KAGIT.yazi,
    marginTop: 3,
  },
  // İl elden çıktı (savunan gözünden, 2026-09-24): kazancın ters rengi.
  kayipIl: {
    fontFamily: YAZI.baslik,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
    color: KAGIT.eksi,
    marginTop: 3,
  },

  kapatTus: {
    marginTop: 13,
    alignSelf: 'flex-end',
    backgroundColor: KAGIT.yazi,
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  // Dolgu koyu mürekkep — yazı AÇIK olmalı. (Süpürmede ikisi de koyuya dönmüştü.)
  kapatMetin: {
    fontFamily: YAZI.baslik,
    fontSize: 11.5,
    letterSpacing: 0.8,
    color: KAGIT.yuzey,
  },
});
