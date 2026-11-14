// İL SAVAŞLARI — harita ekranı (kâğıt atlas teması; "Palet A" adı Görev 10A'da düştü).
// Sol: parça+il paneli. Sağ üst: tur çubuğu + ayarlar dişlisi. Sağ alt: TURU BİTİR (büyük,
// yuvarlak) + altında harita tipi düğmeleri.
// Güvenli alan (çentik / yuvarlak köşe / sistem tuşları) SafeArea insets ile korunur.
//
// BU DOSYA YALNIZCA EKRANDIR. Oyun durumu, kuralları ve hesapları `src/oyunKancasi.js`'te.
// Sınır: burada oyun kuralı yok, orada görsel bilgi yok. Yeni bir düğme buraya, yeni bir
// oyun kuralı oraya. (2026-07-27 düzenlemesi: dosya 549 satıra çıkmış ve her şeyi birden
// yapıyordu.)
//
// YATAY TUTUŞ (Görev 04, Adım 1): oyun yalnızca yatay açılıyor (src/yonlendirme.js).
// Yerleşim dört köşeye dağıtılmıştır: panel soldaki tam boy şerit, ağır arayüz parçaları
// sağ köşelerde. Yatayda DAR olan yön YÜKSEKLİK (telefonda ~412 dp) — ölçüler dikeyde cimri.
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  AppState,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// `useFonts` `expo-font`'un kendisinden alınıyor. Eskiden Oswald paketinden geliyordu
// (o paketler onu yeniden dışa açıyor) ama artık Oswald kullanılmıyor — kullanılmayan bir
// paketten fonksiyon içe aktarmak, paketi silmeyi imkânsız kılan görünmez bir bağ olurdu.
import { useFonts } from 'expo-font';
import { BlackOpsOne_400Regular } from '@expo-google-fonts/black-ops-one';
import {
  ChakraPetch_400Regular,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
} from '@expo-google-fonts/chakra-petch';
// Görev 20: Skia haritası. Eski SVG haritası (`Harita.js`) ve ikisi arasındaki seçici
// 2026-09-25'te emekliye ayrıldı (GOREV-20 Adım 9).
import HaritaSkia from './bilesenler/HaritaSkia';
import KareSayaci from './bilesenler/KareSayaci';
import IlPaneli from './bilesenler/IlPaneli';
import TurCubugu from './bilesenler/TurCubugu';
import AyarMenusu from './bilesenler/AyarMenusu';
import Onay from './bilesenler/Onay';
import { turBitisTitresimi } from './sahne/titresim';
import UretimEkrani from './bilesenler/UretimEkrani';
import HareketEkrani from './bilesenler/HareketEkrani';
import HamleCubugu from './bilesenler/HamleCubugu';
import TurBitirDugmesi from './bilesenler/TurBitirDugmesi';
import ArastirmaEkrani from './bilesenler/ArastirmaEkrani';
import TurGunlugu from './bilesenler/TurGunlugu';
import TurRaporu from './bilesenler/TurRaporu';
import { TurPerdesi, OyunSonu } from './bilesenler/TurPerdesi';
import SahneKarti from './bilesenler/SahneKarti';
import DiplomasiEkrani from './bilesenler/DiplomasiEkrani';
import AnaMenu from './bilesenler/AnaMenu';
import GenelAyarlar from './bilesenler/GenelAyarlar';
import YardimEkrani from './bilesenler/YardimEkrani';
import OrdularimEkrani from './bilesenler/OrdularimEkrani';
import KomutanEkrani from './bilesenler/KomutanEkrani';
import BasarimEkrani from './bilesenler/BasarimEkrani';
import Bildirim from './bilesenler/Bildirim';
import { Parilti } from './bilesenler/Ipucu';
import { EgitimSeridi, EgitimSonu } from './bilesenler/EgitimSeridi';
import {
  IkonIller,
  IkonArazi,
  IkonBolge,
  IkonSinir,
  IkonAyar,
  IkonIttifak,
} from './bilesenler/Ikonlar';
import { RENK, PANEL, YAZI, askeriTon, ZEMIN, CIZGI, YAZI_RENK } from './tema';
import { gelirYaz } from './bicim';
import { useOlcek } from './olcu';
import { yatayaKilitle, tamEkranaGec } from './yonlendirme';
import { DENGE } from './denge';
import { AKTOR_RENKLERI } from './oyun/oyunDurumu';
import { GOSTERIM_ETIKETLERI } from './oyun/ayarlar';
import { useOyun, useSeciliParca } from './oyunKancasi';
import parcalarData from '../veri/parcalar.json';
import { parcaTamAdi } from './oyun/veri';
import { egitimAdimi, egitimOdagi, EGITIM_ADIMLARI } from './oyun/egitim';

const MODLAR = [
  ['il', IkonIller],
  ['arazi', IkonArazi],
  ['bolge', IkonBolge],
  // İTTİFAK HARİTASI (Görev 12 · Baki'nin isteği): parçalar sahiplerinin SANA GÖRE
  // durumuna boyanıyor — müttefik, savaş halinde, tarafsız, sen. Renkler `tema.js`'te,
  // eşleme `oyunKancasi.ittifakDurumlari`nda; burada yalnızca düğme duruyor.
  ['ittifak', IkonIttifak],
];
const DENIZ = askeriTon(RENK.deniz);
// İkinci dokunuşu bekleyen hedefin haritadaki rengi — tahminin kademesine göre (Görev 20 /
// Adım 5). Haritanın kendi renkleri: takviye yeşili, hedef pirinci, cephe kırmızısı.
// Çubuktaki simge aynı ailenin arayüz tonlarında (`HamleCubugu TAHMIN_RENGI`).
const TAHMIN_HARITA = { ustun: RENK.okTakviye, denk: RENK.hedef, zayif: RENK.okSaldiri };
// Ayarlar dişlisinin genişliği (tablet); telefonda küçülür. Yüksekliği tur çubuğundan
// ÖLÇÜLÜR — ikisi aynı kalınlıkta dursun. Tur çubuğu bu genişlik + boşluk kadar sola kayar.
const AYAR_BOYUT = 54;
// Yazı tipleri bu süre içinde gelmezse oyun sistem fontuyla açılır (aşağıdaki nota bak).
// Ölçü değil karar: 6 sn, yerelden yükleme göz kırpması kadar sürdüğü için fazlasıyla
// cömert; bu süreyi aşan her durum zaten "bir şeyler ters gitti" demektir.
const YAZI_BEKLEME_MS = 6000;

export default function App() {
  // Yazı tipleri (tema.js YAZI). Yüklenene kadar ekran boş kalır — yazılar önce sistem
  // fontuyla çizilip sonra zıplamasın diye. Yükleme yerelden olduğu için göz kırpması kadar.
  // 2026-08-12: Oswald + Barlow yerine Black Ops One (başlık) + Chakra Petch (gövde).
  // Gerekçe ve Türkçe sınavı `tema.js YAZI` notunda. Beş dosyadan dörde indi — Black Ops
  // One'ın tek kesimi var, `etiket` ve `baslik` aynı dosyayı gösteriyor.
  const [yaziHazir, yaziHatasi] = useFonts({
    BlackOpsOne_400Regular,
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
    ChakraPetch_700Bold,
  });

  // ---- ⚠ AÇILIŞ ASLA SONSUZA KADAR BEKLEMEZ (Baki, 2026-08-06: "oyun açılmadı,
  // yüklenme ekranında kaldı") ----
  //
  // `useFonts` beş yazı tipini AĞDAN çekiyor. İstek takılırsa (zayıf Wi-Fi, geliştirme
  // sunucusuyla kopan bağlantı, sistemin isteği düşürmesi) bayrak HİÇ true olmuyor ve
  // yukarıdaki erken return yüzünden ekran boş kalıyor — oyun açılmamış gibi görünüyor.
  // Sebebi de hiçbir yerde yazmıyor, çünkü hata fırlatılmıyor: sadece bekleniyor.
  //
  // İki kapı eklendi: yükleme HATA verirse ve BEKLEME SÜRESİ aşılırsa oyun sistem
  // fontuyla açılıyor. Yazılar bir tık farklı görünür ama oyun oynanır — beklemekten iyi.
  // Yazı tipi sonradan gelirse React zaten yeniden çiziyor.
  const [beklemeAsildi, setBeklemeAsildi] = useState(false);
  useEffect(() => {
    const z = setTimeout(() => setBeklemeAsildi(true), YAZI_BEKLEME_MS);
    return () => clearTimeout(z);
  }, []);
  const cizmeyeHazir = yaziHazir || !!yaziHatasi || beklemeAsildi;

  // Yatay tutuş kilidi + Android gezinme çubuğunu gizleme (Görev 04, Adım 1).
  // Erken return'ün ÜSTÜNDE durmalı: React kancaları her çizimde aynı sırada çalışmalı.
  // Çubuk, uygulamaya geri dönüldüğünde sistem tarafından geri açılabiliyor; bu yüzden
  // yalnızca açılışta değil, her öne gelişte tekrar gizlenir.
  useEffect(() => {
    yatayaKilitle();
    let zamanlayicilar = [];
    tamEkranaGec().then((z) => (zamanlayicilar = z));
    const abone = AppState.addEventListener('change', (durum) => {
      // Çubuklar arka plandan dönünce geri geliyor — ikisi birlikte, sırayla tazeleniyor.
      if (durum === 'active') tamEkranaGec().then((z) => (zamanlayicilar = z));
    });
    return () => {
      abone.remove();
      for (const z of zamanlayicilar) clearTimeout(z);
    };
  }, []);

  if (!cizmeyeHazir) return <View style={[s.app, { backgroundColor: DENIZ }]} />;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Ekran />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function Ekran() {
  const insets = useSafeAreaInsets();
  const { telefon } = useOlcek();
  // Telefonda her şey biraz küçülür — harita mümkün olduğunca açıkta kalsın.
  const dugmeBoyut = telefon ? 36 : 44;
  const ikonBoyut = telefon ? 19 : 23;
  const ayarBoyut = telefon ? 40 : AYAR_BOYUT;
  // Hamle çubuğu harita tipi düğmelerinin soluna kadar uzanıyor: telefonda düğmeler yatay
  // bir şerit (5 düğme + ayraç + iç boşluk), tablette dikey tek sütun.
  const pencere = useWindowDimensions();
  const hudPay = (telefon ? 5 * dugmeBoyut + 30 : dugmeBoyut + 12) + 12;

  const O = useOyun();

  // ---- EKRANIN KENDİ DURUMU ----
  const [mod, setMod] = useState('il'); // harita tipi: il / arazi / bölge
  const [sinirlar, setSinirlar] = useState(true);
  const [secili, setSecili] = useState(null);
  const [ayarAcik, setAyarAcik] = useState(false);
  // ---- ÇERÇEVE (Görev 09 / Adım 6) ----
  // Uygulama ARTIK MENÜYLE AÇILIYOR. Sekiz görevdir doğrudan haritanın içindeydik;
  // nereden başladığın, ne zaman biteceği ve kazanınca ne olacağı belli değildi.
  const [menuGorunum, setMenuGorunum] = useState('menu');
  const [menuAcik, setMenuAcik] = useState(true);
  const [diplomasiAcik, setDiplomasiAcik] = useState(false);
  // Diplomasi haritadan açıldıysa hangi devletin kartı açık gelecek (uzun basma).
  const [diplomasiIlk, setDiplomasiIlk] = useState(null);
  // ---- ÇIKIŞTA KAYIT SORUSU (Baki, 2026-08-03) ----
  // Menüdeki "CEPHEYE DÖN" kaldırıldı; onun yerine ana menüye HER dönüş buradan geçiyor:
  // kaydet ve çık / kaydetmeden çık / vazgeç. Böylece menü açıkken sürmekte olan maç ya
  // kaydedilmiştir ya bilerek bırakılmıştır — SEFERE DEVAM ikisini de karşılıyor.
  // Bu ÖNEMLİ bir soru çünkü maç başlarken diske yazılmıyor (macBaslat yalnızca bellekte
  // kurar): hiç kaydedilmemiş bir sefer "kaydetmeden çık" ile gerçekten kaybolur.
  const [cikisOnayi, setCikisOnayi] = useState(false);
  // Genel ayarlar MAÇ AYARLARINDAN AYRI bir ekran (2026-08-01). Ana menüden açılıyor ve
  // ekranın ortasında duruyor; içinde yalnızca maçtan bağımsız tercihler var.
  const [genelAyarAcik, setGenelAyarAcik] = useState(false);
  // İttifakı bozmak GERİ ALINAMAZ İŞ — onay kuralı (§6/11).
  const [bozmaOnayi, setBozmaOnayi] = useState(null);
  // Savaş ilanı da geri alınamaz: aynı kural, aynı kalıp (Görev 11).
  const [savasOnayi, setSavasOnayi] = useState(null);
  // Menü açıldığında yuva özetleri TAZELENİYOR. Bir kez okuyup önbelleğe almak yetmezdi:
  // oyuncu oynayıp kaydettikten sonra menüye dönünce "tur 1" yazan bir liste görürdü.
  useEffect(() => {
    if (menuAcik) O.yuvalariTazele();
  }, [menuAcik, O.yuvalariTazele]);
  // Dolu yuvanın üstüne yazmak da geri alınamaz iş.
  const [yazmaOnayi, setYazmaOnayi] = useState(null);
  // Kaydı SİLMEK de öyle (Görev 12 · Harekât Arşivi'ndeki çöp kutusu).
  const [silmeOnayi, setSilmeOnayi] = useState(null);
  // NASIL OYNANIR ve ORDULARIM (Görev 12 / Adım 10). İkisi de hem maç ayarlarından hem
  // (yardım) ana menüden açılabiliyor.
  const [yardimAcik, setYardimAcik] = useState(false);
  const [ordularimAcik, setOrdularimAcik] = useState(false);
  const [komutanAcik, setKomutanAcik] = useState(false);
  // KOMUTAN TASLAĞI (Görev 20): komutan ekranında seçilen yetenek · kademe · birlik.
  // Haritadan atarken bu taslakla atanıyor; null ise komutanın o anki hâli geçerli.
  // Bir ekran seçimi, oyun durumu değil — kayda girmez. Hangi maça ait olduğu yanında
  // tutuluyor (`mac`): başka maça geçilince eski taslak kendiliğinden geçersiz.
  const [komutanTaslagi, setKomutanTaslagi] = useState(null);
  const [basarimAcik, setBasarimAcik] = useState(false);
  const [turOnayi, setTurOnayi] = useState(false);
  const [uretimAcik, setUretimAcik] = useState(false);
  // ARAŞTIRMA EKRANI (Görev 06). Tam perde açılıyor; haritanın jesti aşağıdaki
  // `dokunmaKapali` ile susuyor — RN'de üstteki kutu jesti kendiliğinden engellemiyor.
  const [arastirmaAcik, setArastirmaAcik] = useState(false);
  // ---- HAREKET — DOĞRUDAN HAMLE (Görev 05; Görev 20 / Adım 5) ----
  // `kipKaynak` null değilse harita HEDEF KİPİNDE: o ordunun gidebileceği yerler parlıyor
  // (kendi toprağın pirinç, düşman toprağı kırmızı — ikisi birden, Görev 20). `emirHedefi`
  // ikinci dokunuşu bekleyen hedef; `kuvvet` alttaki çubukta seçilen birlikler.
  // Saldırı onayı KALKTI (Baki, GOREV-20 Soru 1): aynı hedefe ikinci dokunuş hamledir.
  // `odaAcik`: hedefe basılı tutunca açılan savaş odası (ayrıntı + ince ayar).
  const [kipKaynak, setKipKaynak] = useState(null);
  const [emirHedefi, setEmirHedefi] = useState(null);
  const [kuvvet, setKuvvet] = useState({});
  const [komutanGelsin, setKomutanGelsin] = useState(false);
  const [odaAcik, setOdaAcik] = useState(false);
  const [gunlukAcik, setGunlukAcik] = useState(false);
  const [raporAcik, setRaporAcik] = useState(false);
  // Oyun sonu kutusu kapatılabiliyor: oyuncu haritaya bakıp ne olduğunu görmek isteyebilir.
  const [sonKutusuKapali, setSonKutusuKapali] = useState(false);
  // Dişli düğmesi tur çubuğuyla aynı yükseklikte olsun diye çubuğun ölçüsü alınır.
  const [cubukYukseklik, setCubukYukseklik] = useState(AYAR_BOYUT);
  // ---- EĞİTİM İZİ (GOREV-20 Adım 8) ----
  // Eğitimin iki adımı OLAYLA ilerliyor (durumdan okunamıyor): asker basıldı mı (üretim sayacı
  // her tur sıfırlanıyor) ve fetih + üretimden sonra tur bitti mi. `kapandi`: HAZIRSIN
  // kartında DEVAM denildi — işaretler söner, oyuncu haritada serbest. İz hangi maça aitse
  // (`mac`) yalnız onda geçerli: yeni eğitim temiz başlar.
  const [egitimIzi, setEgitimIzi] = useState(null);

  const sec = useSeciliParca(O.oyun, secili, O.kapsam);
  // Ordu çubuğunun ordusu (Görev 21): askerleri, yaralısı, toparlanma bedeli.
  const kipSec = useSeciliParca(O.oyun, kipKaynak, O.kapsam);

  // Komutanın geçerli taslağı: ekranda seçilmiş olan, yoksa komutanın bugünkü hâli.
  const { komutan } = O;
  const macKimligi = O.oyun.rastgele.tohum + '|' + O.oyun.oyuncuAktorId;
  const komutanSecimi = useMemo(
    () =>
      (komutanTaslagi && komutanTaslagi.mac === macKimligi && komutanTaslagi) || {
        yetenek: komutan.yetenek || 'celikYurek',
        kademe: Math.min(komutan.kademe || 1, komutan.kademeHakki),
        birim: komutan.birim,
      },
    [komutanTaslagi, komutan, macKimligi]
  );

  // Ordu çubuğundaki KOMUTAN düğmesi (Görev 20 · atama haritadan; Görev 21 · panelden
  // çubuğa taşındı). Hangi hâlde olduğu motorun kapısından (`atamaGecerliMi`) — ekran kural
  // yazmaz. Komutan hiç yoksa (kapalı) düğme de yok.
  const { komutanAtamaDurumu } = O;
  const kipKomutani = useMemo(() => {
    if (!kipKaynak) return null;
    const d = komutanAtamaDurumu(kipKaynak);
    if (d.kod === 'kapali') return null;
    return { burada: komutan.parcaId === kipKaynak, atanabilir: d.ok, bekleme: komutan.bekleme };
  }, [kipKaynak, komutanAtamaDurumu, komutan]);

  // Hedef kipindeki geçerli hedefler — İKİ TÜR BİRDEN (Görev 20 / Adım 5): eskiden oyuncu
  // önce SALDIR ya da ASKER TAŞI seçiyordu, sonra o türün hedefleri parlıyordu. Kural
  // motorun kendi kuralı (`hareket.js`); ekran ayrı bir "gidilebilir mi" mantığı yazmıyor.
  const { hamleHedefleri, orduKaynagiMi } = O;
  const kipHedefleri = useMemo(
    () => (kipKaynak ? hamleHedefleri(kipKaynak) : null),
    [kipKaynak, hamleHedefleri]
  );
  const hedefKumesi = useMemo(
    () => (kipHedefleri ? new Set([...kipHedefleri.dost, ...kipHedefleri.dusman]) : null),
    [kipHedefleri]
  );
  const saldiriKumesi = useMemo(
    () => (kipHedefleri ? new Set(kipHedefleri.dusman) : null),
    [kipHedefleri]
  );

  const kiptenCik = useCallback(() => {
    setKipKaynak(null);
    setEmirHedefi(null);
    setKuvvet({});
    setKomutanGelsin(false);
    setOdaAcik(false);
  }, []);
  // Bir ordu hamle kaynağı olur: panel kapanır (ayrıntısı çubuktaki simgede), hedefler parlar.
  const kipAc = useCallback((kaynak) => {
    setUretimAcik(false); // iki ekran birden açık kalmasın
    setSecili(null);
    setKipKaynak(kaynak);
    setEmirHedefi(null);
    setKuvvet({});
    setKomutanGelsin(false);
  }, []);
  // Hedef seçildi: kuvvet sıfırdan (Baki, Soru 2: "bütün birlikler" varsayılanı HAYIR).
  const hedefSec = useCallback((pid) => {
    setEmirHedefi(pid);
    setKuvvet({});
    setKomutanGelsin(false);
  }, []);

  // Kuvvet seçicinin okuduğu düz veri; hedef seçilmemişse hiç hesaplanmaz.
  const { hareketBilgisi, hamleTahmini } = O;
  const emirBilgisi = useMemo(
    () => (kipKaynak && emirHedefi ? hareketBilgisi(kipKaynak, emirHedefi) : null),
    [kipKaynak, emirHedefi, hareketBilgisi]
  );
  const tahmin = useMemo(
    () => hamleTahmini(emirBilgisi, kuvvet),
    [hamleTahmini, emirBilgisi, kuvvet]
  );
  // Haritada ikinci dokunuşu bekleyen hedef: TAHMİNİN RENGİNDE (yeşil ezer · pirinç kıl
  // payı · kırmızı kaybeder). Kuvvet seçilmediyse ya da kendi toprağınsa pirinç.
  const hedefSecili = useMemo(
    () =>
      emirHedefi
        ? { pid: emirHedefi, renk: tahmin ? TAHMIN_HARITA[tahmin.kademe] : RENK.hedef }
        : null,
    [emirHedefi, tahmin]
  );

  // HAMLE — ikinci dokunuş, çubuktaki SALDIR/TAŞI ya da savaş odasının GÖNDER'i. Onay yok.
  // (Eğitim adımı aşağıda, `onTuruBitir`'den önce; işaretlerin görünürlüğü ekranın sonunda.)
  // Kuvvet seçilmediyse bir şey olmaz, yalnızca kısa bir ret titreşimi.
  // Başarılıysa kip kapanır: ordu yerini değiştirdi, yeni hamle yeni bir dokunuşla başlar.
  const hamleYap = useCallback(
    (birimler, secenekler) => {
      const giden = birimler || kuvvet;
      if (!kipKaynak || !emirHedefi || !emirBilgisi) return;
      if (Object.values(giden).every((n) => !n)) {
        O.reddet();
        return;
      }
      const sec =
        secenekler || (komutanGelsin && emirBilgisi.komutanBurada ? { komutan: true } : {});
      if (O.emirVer(kipKaynak, emirHedefi, giden, sec)) kiptenCik();
    },
    [O, kipKaynak, emirHedefi, emirBilgisi, kuvvet, komutanGelsin, kiptenCik]
  );

  // HARİTAYA DOKUNMA — doğrudan hamlenin kalbi (GOREV-20 §4.1):
  //   kip yokken: KENDİ ordun → ordu çubuğu (hamle hakkı varsa hedefler de parlar; bitmişse
  //               yalnızca komutan / toparlanma — Görev 21) · başka her yer → bölge paneli.
  //   kipteyken:  seçili hedef → HAMLE (ikinci dokunuş) · başka hedef → o seçilir ·
  //               başka ordun → kaynak değişir · başka her yer → vazgeç.
  const onSec = useCallback(
    (pid) => {
      if (kipKaynak) {
        if (pid && pid === emirHedefi) hamleYap();
        else if (pid && hedefKumesi && hedefKumesi.has(pid)) hedefSec(pid);
        else if (pid && pid !== kipKaynak && orduKaynagiMi(pid)) kipAc(pid);
        else kiptenCik();
        return;
      }
      if (pid && O.kapsam.has(pid) && orduKaynagiMi(pid)) {
        kipAc(pid);
        return;
      }
      setSecili(pid && O.kapsam.has(pid) ? pid : null);
      setUretimAcik(false); // başka parçaya geçildi — açık üretim ekranı yanlış yeri gösterir
    },
    [
      O.kapsam,
      kipKaynak,
      emirHedefi,
      hedefKumesi,
      orduKaynagiMi,
      hamleYap,
      hedefSec,
      kipAc,
      kiptenCik,
    ]
  );

  // UZUN BASMA:
  //   • Hedef kipinde bir HEDEFE: savaş odası (kuvvetin ince ayarı + karşı tarafın dökümü,
  //     arazi, moral) — GOREV-20 §4.1'in "basılı tut" yolu.
  //   • Kip yokken başka bir devletin iline (Görev 20 · Baki: "diplomasi haritadan da
  //     açılsın" — evet): diplomasi, o devletin kartı açık. Kendi ilinde ya da tanımadığın
  //     bir devlette hiçbir şey olmaz (tanımadığınla masa yok).
  // Geliştirici modu açıkken eski davranış: parçayı oyuncuya verir (Görev 03 / Adım 8).
  const onUzunBas = useCallback(
    (pid) => {
      if (!pid) return;
      if (kipKaynak) {
        if (hedefKumesi && hedefKumesi.has(pid)) {
          if (pid !== emirHedefi) hedefSec(pid);
          setOdaAcik(true);
        }
        return;
      }
      if (DENGE.GELISTIRICI_MODU) {
        O.gelistirici.parcayiAl(pid);
        setSecili(pid); // ne olduğu görünsün diye panel o parçayı açsın
        return;
      }
      const sahip = O.oyun.parcaSahipligi[pid];
      if (!sahip || sahip === O.oyun.oyuncuAktorId) return;
      if (!O.diplomasiSatirlari.some((x) => x.id === sahip)) return;
      setDiplomasiIlk(sahip);
      setDiplomasiAcik(true);
    },
    [O.gelistirici, O.oyun, O.diplomasiSatirlari, kipKaynak, hedefKumesi, emirHedefi, hedefSec]
  );

  // ---- EĞİTİM ADIMI (GOREV-20 Adım 8 · `oyun/egitim.js`) ----
  // Sıradaki adım DURUMDAN çıkıyor: oyuncu bir adımı atlasa, geri alsa ya da saldırısı
  // başarısız olsa da eğitim doğru adıma döner. Ekran yalnızca işareti çiziyor.
  const { macSayaci } = O;
  // Eğitim izine yama: bu maçın izi yoksa temiz bir izle başlar.
  const egitimIzle = useCallback(
    (yama) =>
      setEgitimIzi((iz) => ({
        ...(iz && iz.mac === macSayaci
          ? iz
          : { mac: macSayaci, uretildi: false, turBitti: false, kapandi: false }),
        ...yama,
      })),
    [macSayaci]
  );
  const ben = O.oyun.oyuncuAktorId;
  const egitimIziBu = egitimIzi && egitimIzi.mac === macSayaci ? egitimIzi : null;
  // Düz değerler (nesne değil): adım yalnızca bunlar değişince yeniden hesaplansın.
  const egitimKaynakHedefleri = O.egitim ? hamleHedefleri(DENGE.EGITIM.KAYNAK) : null;
  const egitimKaynakHazir =
    !!egitimKaynakHedefleri && egitimKaynakHedefleri.dusman.includes(DENGE.EGITIM.HEDEF);
  const egitimFetih = O.oyun.parcaSahipligi[DENGE.EGITIM.HEDEF] === ben;
  const egitimKaynakVar = O.egitim && orduKaynagiMi(DENGE.EGITIM.KAYNAK);
  const tahminKademe = tahmin ? tahmin.kademe : null;
  const egitimAdim = useMemo(() => {
    if (!O.egitim || (egitimIziBu && egitimIziBu.kapandi)) return null;
    return egitimAdimi({
      fetih: egitimFetih,
      kaynakHazir: egitimKaynakHazir,
      kaynakVar: egitimKaynakVar,
      uretildi: !!(egitimIziBu && egitimIziBu.uretildi),
      turBitti: !!(egitimIziBu && egitimIziBu.turBitti),
      kipKaynak,
      emirHedefi,
      tahminKademe,
      uretimAcik,
    });
  }, [
    O.egitim,
    egitimIziBu,
    egitimFetih,
    egitimKaynakHazir,
    egitimKaynakVar,
    kipKaynak,
    emirHedefi,
    tahminKademe,
    uretimAcik,
  ]);
  const egitimAsamasi = egitimAdim ? egitimAdim.anahtar : null;

  // ---- RAPOR GÖSTERİDEN SONRA AÇILIR (Görev 08) ----
  // Rapor gösterinin ÜSTÜNE açılsaydı oyuncu savaşı göremeden metni okurdu ve bu görevin
  // tamamı boşa giderdi. Gösterim kapalıyken `useSahne` hiç olay üretmiyor ve bitişi hemen
  // bildiriyor — yani rapor Görev 07'deki gibi anında açılıyor.
  const raporBekliyor = useRef(false);
  const onTuruBitir = useCallback(() => {
    // ---- TURUN AĞIRLIĞI ELDE HİSSEDİLSİN (2026-08-12) ----
    // Turu bitirmek oyunun en büyük tek kararı: verdiğin bütün emirler aynı anda işliyor
    // ve geri alınamıyor (§5/9). Sıradan bir düğme tık'ıyla geçiyordu; artık iki darbelik
    // bir "mühür" hissi var.
    //
    // ⚠ KANCADA DEĞİL BURADA, ve sebebi mimari: bir düğmenin dokunma geri bildirimi EKRAN
    // işidir (CLAUDE.md §3). Kancaya konduğunda `react-hooks/immutability` de öttü — orada
    // titreşim ayarı bir ref'te tutuluyor ve ref'i tazeleyen `useEffect`, onu yakalayacak
    // `useCallback`'ten SONRA geliyor. Kural haklıydı; doğru yer zaten burasıydı.
    turBitisTitresimi(O.ayarlar.titresim);
    kiptenCik(); // yeni turda haklar tazeleniyor; eski seçim geçersiz
    // Eğitim: ilk fetih ve ilk üretimden SONRA biten tur, eğitimin son adımı.
    if (O.egitim && egitimAdim && egitimAdim.son) egitimIzle({ turBitti: true });
    O.turuBitir();
    setTurOnayi(false);
    setGunlukAcik(false);
    // ⚠ GÖREV 15: "emir varsa göster" ölçüsü öldü — bekleyen emir diye bir şey kalmadı.
    // Rapor artık her tur açılıyor, çünkü botların turu her tur bir şeyler yapıyor.
    raporBekliyor.current = true;
  }, [O, kiptenCik, egitimAdim, egitimIzle]);

  const { raporHazir } = O;

  // EĞİTİM İŞARETLERİ ne zaman görünür: haritanın üstünde bir perde ya da ekran yokken.
  // Gösteri, tur raporu, onay kutuları, menüler — hepsinde işaret söner, kapanınca döner.
  const egitimOrtulu =
    O.turIsleniyor ||
    O.sahne.oynuyor ||
    raporAcik ||
    turOnayi ||
    odaAcik ||
    ayarAcik ||
    diplomasiAcik ||
    arastirmaAcik ||
    gunlukAcik ||
    komutanAcik ||
    ordularimAcik ||
    yardimAcik ||
    cikisOnayi ||
    menuAcik ||
    O.diplomasiBilgisi.teklifler.length > 0;
  const egitimIsareti = !!egitimAdim && !egitimOrtulu;
  const egitimSonuAcik = egitimIsareti && egitimAsamasi === 'bitti';
  const egitimParca = egitimIsareti ? egitimAdim.parca || null : null;
  const egitimHalkasi = useMemo(() => {
    const p = egitimParca ? parcalarData.parcalar[egitimParca] : null;
    return p ? { x: p.etiket.x, y: p.etiket.y } : null;
  }, [egitimParca]);

  // AÇILIŞ KAMERASI (GOREV-20 Adım 4): maç açılınca (yeni maç, yükleme, eğitim) harita
  // oyuncunun iline süzülür — ilin bölgelerinin ortasına. Eğitimde ilk hamlenin iki
  // bölgesinin ortasına, parça kalkanlarının göründüğü yakınlıkta. Nesne yalnızca yeni maçta
  // yenileniyor; harita aynı odağı ikinci kez uygulamıyor.
  const acilisOdagi = useMemo(() => {
    if (!macSayaci) return null;
    if (O.egitim) return { ...egitimOdagi(), z: DENGE.EGITIM.KAMERA_YAKINLIK };
    if (!DENGE.JEST.ACILIS_YAKINLIK) return null;
    const bolgeler = Object.values(parcalarData.parcalar).filter((p) => p.kod === ben);
    if (bolgeler.length === 0) return null;
    const x = bolgeler.reduce((a, p) => a + p.etiket.x, 0) / bolgeler.length;
    const y = bolgeler.reduce((a, p) => a + p.etiket.y, 0) / bolgeler.length;
    return { x, y, z: DENGE.JEST.ACILIS_YAKINLIK };
  }, [macSayaci, O.egitim, ben]);

  useEffect(() => {
    if (raporHazir === 0 || !raporBekliyor.current) return;
    raporBekliyor.current = false;
    setRaporAcik(true);
  }, [raporHazir]);

  const onYukle = useCallback(async () => {
    const ok = await O.yukle();
    if (ok) {
      setSecili(null); // yüklenen oyunun kapsamı farklı olabilir
      kiptenCik();
    }
  }, [O, kiptenCik]);

  // Üretim ekranı yalnızca SEÇİLİ parça için açılır; seçim değişince kapanır (`onSec`).
  const uretimParcasi = uretimAcik ? secili : null;
  const { uretimHakki: uretimHakkiHesapla } = O;
  const uretimHakki = useMemo(
    () => uretimHakkiHesapla(uretimParcasi),
    [uretimHakkiHesapla, uretimParcasi]
  );
  const onUretimOnayla = useCallback(
    (siparis) => {
      // Yalnızca BAŞARIYSA kapan: ekran zaten geçersiz siparişi engelliyor, oraya düşmek
      // bir hatadır ve kapatmak oyuncunun dizdiği siparişi sessizce çöpe atardı.
      if (uretimParcasi && O.uret(uretimParcasi, siparis)) {
        setUretimAcik(false);
        if (O.egitim) egitimIzle({ uretildi: true });
      }
    },
    [O, uretimParcasi, egitimIzle]
  );

  // ---- ANDROID GERİ TUŞU (Görev 20 · DENETIM-2026-09-23 ⛔2) ----
  //
  // Kodda geri tuşunu dinleyen hiçbir yer yoktu: bir panel açıkken alışkanlıkla kenardan
  // geri kaydıran oyuncu paneli kapatmıyor, OYUNU arka plana atıyordu. Artık geri hareketi
  // en üstteki şeyi kapatıyor, sıra ekrandaki üst üste binme sırasıyla aynı:
  //   onay kutusu → açık ekran → hedef seçme kipi → bölge paneli → "ana menüye dön?".
  // Ana menüde: alt ekrandan ana menüye; ana menünün kendisinde sistem ne yapıyorsa o
  // (uygulamadan çıkış). Gelen teklif kutusu geri tuşuyla CEVAPLANMAZ — "ret" bir karar,
  // yanlışlıkla verilmemeli; tur işlenirken de geri tuşu yutuluyor.
  //
  // İşleyici her çizimde tazeleniyor (ref), abonelik bir kez kuruluyor — kapanış sırası
  // bu yüzden hep güncel durumu görüyor.
  const geriIsleyici = useRef(() => false);
  useEffect(() => {
    geriIsleyici.current = () => {
      if (O.turIsleniyor) return true;
      if (O.sahne.oynuyor) {
        O.sahne.atla();
        return true;
      }
      // Onay kutuları (en üstte duranlar önce).
      if (cikisOnayi) return (setCikisOnayi(false), true);
      if (yazmaOnayi) return (setYazmaOnayi(null), true);
      if (silmeOnayi !== null) return (setSilmeOnayi(null), true);
      if (turOnayi) return (setTurOnayi(false), true);
      if (savasOnayi) return (setSavasOnayi(null), true);
      if (bozmaOnayi) return (setBozmaOnayi(null), true);
      // Ana menünün üstündeki ekranlar.
      if (genelAyarAcik) return (setGenelAyarAcik(false), true);
      if (yardimAcik) return (setYardimAcik(false), true);
      if (basarimAcik) return (setBasarimAcik(false), true);
      if (menuAcik) {
        if (menuGorunum !== 'menu')
          return (setMenuGorunum(menuGorunum === 'il' ? 'mod' : 'menu'), true);
        return false; // ana menünün kendisi: sistem karar versin (çıkış)
      }
      if (!menuAcik && O.diplomasiBilgisi.teklifler.length > 0 && !diplomasiAcik) return true;
      if (egitimSonuAcik) return (egitimIzle({ kapandi: true }), true);
      // Oyun ekranları.
      if (ayarAcik) return (setAyarAcik(false), true);
      if (komutanAcik) return (setKomutanAcik(false), true);
      if (ordularimAcik) return (setOrdularimAcik(false), true);
      if (diplomasiAcik) {
        setDiplomasiAcik(false);
        setDiplomasiIlk(null);
        O.diplomasiCevabiTemizle();
        return true;
      }
      if (arastirmaAcik) return (setArastirmaAcik(false), true);
      if (uretimAcik) return (setUretimAcik(false), true);
      if (raporAcik) return (setRaporAcik(false), true);
      if (gunlukAcik) return (setGunlukAcik(false), true);
      if (odaAcik) return (setOdaAcik(false), true);
      if (emirHedefi) return (setEmirHedefi(null), true);
      if (kipKaynak) return (kiptenCik(), true);
      if (O.oyunSonu && !sonKutusuKapali) return (setSonKutusuKapali(true), true);
      if (secili) return (setSecili(null), true);
      // Haritada hiçbir şey açık değil: ana menüye dönüş sorusu (kaydet / çık / vazgeç).
      setCikisOnayi(true);
      return true;
    };
  });
  useEffect(() => {
    const abone = BackHandler.addEventListener('hardwareBackPress', () => geriIsleyici.current());
    return () => abone.remove();
  }, []);

  return (
    <View style={[s.app, { backgroundColor: DENIZ }]}>
      {/* DURUM ÇUBUĞU TAMAMEN GİZLİ (2026-08-01, Baki: "telefonun üst kısmında açılan yer
          var ya saat pil falan gözüküyor, orası kapansın, oyun boyu açık durmasın").
          Gezinme çubuğu zaten gizliydi (`yonlendirme.js`); ikisi birden gizlenince oyun
          gerçekten tam ekran oluyor. Kenardan kaydırınca ikisi de geri geliyor. */}
      <StatusBar hidden />

      <HaritaSkia
        parcalar={parcalarData.parcalar}
        meta={parcalarData.meta}
        mod={mod}
        // Hamle kipinde panel kapalı (`secili` boş); vurgulanan parça hamlenin KAYNAĞI.
        secili={kipKaynak || secili}
        komsular={sec.komsular}
        sinirlar={sinirlar}
        kapsam={O.kapsam}
        sahiplik={O.oyun.parcaSahipligi}
        aktorRenk={AKTOR_RENKLERI}
        ittifakDurumlari={O.ittifakDurumlari}
        onSec={onSec}
        onUzunBas={onUzunBas}
        parcaRozetleri={O.parcaRozetleri}
        ilRozetleri={O.ilRozetleri}
        emirOklari={O.emirOklari}
        hedefKipi={hedefKumesi}
        hedefSaldiri={saldiriKumesi}
        hedefSecili={hedefSecili}
        // ---- SAHNE (Görev 08) ----
        sahneEfektleri={O.sahne.efektler}
        sahneSeridi={O.sahne.serit}
        kamera={O.sahne.kamera}
        // Açılışta oyuncunun iline süzülme (Adım 4) ve eğitimin halkası (Adım 8).
        odak={acilisOdagi}
        ipucu={egitimHalkasi}
        // Açık menü varken harita DOKUNMA ALMAZ (2026-07-30). Jestler yerel katmanda
        // kurulu; üstteki kutunun dokunmayı yutması garanti değil, o yüzden jestin
        // kendisi susturuluyor. Kaydırma/yakınlaştırma serbest kalır — oyuncu menü
        // açıkken haritaya bakmaya devam edebilmeli.
        dokunmaKapali={
          // Hamle çubuğu haritayı KAPATMAZ (hedefe ikinci dokunuş haritada); savaş odası kapatır.
          odaAcik ||
          uretimAcik ||
          arastirmaAcik ||
          gunlukAcik ||
          raporAcik ||
          turOnayi ||
          O.turIsleniyor ||
          O.sahne.oynuyor ||
          (!!O.oyunSonu && !sonKutusuKapali) ||
          ayarAcik ||
          // ⚠ ÜSTTEKİ KUTU, YEREL KATMANDAKİ HARİTA JESTİNİ ENGELLEMEZ. Diplomasi ekranı
          // ve ana menü için de susturuluyor — savaş odasının kalıbı, dördüncü ve
          // beşinci kez (§10/1).
          diplomasiAcik ||
          menuAcik ||
          genelAyarAcik ||
          // Komutan ekranı artık ordu çubuğundan açılıyor (Görev 21) — haritanın üstünde.
          komutanAcik ||
          egitimSonuAcik
        }
      />

      {/* KARE SAYACI (Görev 20) — yalnızca geliştirmede. Haritanın akıcılığını sayıyla
          okumak için: Baki "takılıyor" yerine "yakınlaştırırken 38'e düşüyor" diyebilsin. */}
      {__DEV__ ? <KareSayaci stil={{ left: insets.left + 10, bottom: insets.bottom + 4 }} /> : null}

      {/* ---- GÖSTERİYİ ATLAMA (Görev 08 / §4.4/1) ----
          Ekranın herhangi bir yerine dokunmak gösteriyi bitirir. BEDELSİZ: durum zaten
          kesin, atlanan tur ile tam izlenen tur birebir aynı sonucu verir (testle kilitli).
          Haritanın jesti ayrıca susturuluyor (yukarıdaki `dokunmaKapali`) — üstteki kutu
          yerel katmandaki jesti engellemiyor, bu tuzağa üç kez düşüldü (§10/2). */}
      {O.sahne.oynuyor && (
        <Pressable style={StyleSheet.absoluteFill} onPress={O.sahne.atla}>
          <View style={[s.atlaKatman, { bottom: insets.bottom + 12 }]} pointerEvents="none">
            <Text style={s.atlaMetin}>dokun → atla</Text>
          </View>
        </Pressable>
      )}

      {/* HAMLE ÇUBUĞU (Görev 20 / Adım 5) — eski "NEREYE SALDIRALIM? · vazgeçmek için
          buraya dokun" şeridinin yerinde. Hedef yokken kaynağın adı + ayrıntı simgesi,
          hedef varken sayı seçici + tahmin + SALDIR/TAŞI. Sol altta, harita tipi
          düğmelerinin soluna kadar (telefonda onlar yatay bir şerit). */}
      {/* Ordu çubuğu hamle hakkı bitmiş orduda da açılır (Görev 21): komutan ve toparlanma
          artık burada, bölge panelinde değil. */}
      {kipKaynak && !odaAcik && (
        <HamleCubugu
          kaynakAd={parcaTamAdi(kipKaynak)}
          ordu={kipSec.ordu}
          komutan={kipKomutani}
          onKomutanAta={() => O.komutanAta(kipKaynak, komutanSecimi)}
          onKomutanEkrani={() => setKomutanAcik(true)}
          onToplan={() => O.toplan(kipKaynak)}
          toplanmaEmriVar={kipSec.toplanmaEmriVar}
          onUret={() => {
            const pid = kipKaynak;
            kiptenCik();
            setSecili(pid);
            setUretimAcik(true);
          }}
          bilgi={emirBilgisi}
          kuvvet={kuvvet}
          onKuvvet={setKuvvet}
          tahmin={tahmin}
          komutanGelsin={komutanGelsin}
          onKomutan={() => setKomutanGelsin((v) => !v)}
          onGonder={() => hamleYap()}
          onAyrinti={() => {
            const pid = kipKaynak;
            kiptenCik();
            setSecili(pid);
          }}
          onKapat={kiptenCik}
          ipucu={egitimIsareti ? egitimAdim.dugme : null}
          stil={{
            left: insets.left + 12,
            bottom: insets.bottom + 16,
            maxWidth: pencere.width - insets.left - insets.right - 24 - hudPay,
          }}
        />
      )}

      <TurCubugu
        tur={O.oyun.tur}
        nufusHavuzu={O.oyuncu.nufusHavuzu}
        ekonomiHavuzu={O.oyuncu.ekonomiHavuzu}
        gelir={O.gelir}
        ozet={O.ozet}
        sagBosluk={ayarBoyut + 8}
        onOlcu={setCubukYukseklik}
        emirSayisi={O.emirOzetleri.length}
        onEmirler={() => setGunlukAcik(true)}
        arastirmaPuani={O.arastirma.puan}
        onArastirma={() => setArastirmaAcik(true)}
        hedefEsigi={O.hedef.esik}
        hedefKalanTur={O.hedef.kalanTur}
        onDiplomasi={() => setDiplomasiAcik(true)}
        diplomasiRozeti={O.diplomasiBilgisi.teklifler.length}
      />

      {/* Kısa haberler (sipariş tekrarı, kaydetme) — çubuğun altında, kendiliğinden kaybolur.
          Ayarlar menüsü açıkken çıkmaz: kaydetme sonucu zaten menünün içinde yazıyor,
          ikisi birden görünürse aynı cümle iki yerde okunur.
          Diplomasi ekranı açıkken de çıkmaz (Görev 12 / Adım 1): cevap orada SATIRIN
          kendisinde duruyor, üstelik bu şerit perdenin altında kaldığı için hiç
          görünmüyordu — hatanın kaynağı buydu. */}
      <Bildirim
        mesaj={!ayarAcik && !diplomasiAcik && O.haber ? O.haber.mesaj : null}
        iyi={O.haber ? O.haber.iyi : true}
        ustBosluk={insets.top + 12 + cubukYukseklik}
        onKapat={O.haberiKapat}
      />

      {/* Ayarlar dişlisi — sağ üst köşe */}
      <Pressable
        onPress={() => setAyarAcik((a) => !a)}
        style={[
          s.ayarDugme,
          ayarAcik && s.ayarDugmeAcik,
          {
            top: insets.top + 8,
            right: insets.right + 12,
            width: ayarBoyut,
            height: cubukYukseklik,
          },
        ]}
      >
        <IkonAyar size={telefon ? 20 : 26} color={ayarAcik ? ZEMIN.taban : YAZI_RENK.birincil} />
      </Pressable>

      <IlPaneli
        parca={sec.parca}
        il={sec.il}
        sahip={sec.sahip}
        parcaGelir={sec.gelirParca}
        ilDagilim={sec.ilDagilim}
        ilGelirim={sec.ilGelirim}
        ordu={sec.ordu}
        komsuListe={sec.komsuListe}
        onKomsuSec={onSec}
        onKapat={() => {
          setSecili(null);
          kiptenCik(); // panel kapanınca hedef seçme kipi açık kalmasın
        }}
        onUret={() => setUretimAcik(true)}
        gelistirici={DENGE.GELISTIRICI_MODU}
        onParcayiAl={() => O.gelistirici.parcayiAl(secili)}
        onIliAl={() => O.gelistirici.iliAl(secili)}
        onGeriVer={() => O.gelistirici.parcayiGeriVer(secili)}
        onIliGeriVer={() => O.gelistirici.iliGeriVer(secili)}
      />

      {/* Harita tipi düğmeleri — telefonda YATAY şerit, tablette dikey sütun.
          ÖLÇÜLDÜ (Görev 04, Adım 1). Görev belgesi yatay tutuşta bunların dikey sütuna
          dönmesini öneriyordu; ölçüm tersini söyledi, o yüzden yatay şerit KORUNDU:
            • Yükseklik bedeli — yatay şerit 44 dp = ekran yüksekliğinin %11'i.
              Dikey sütun 169 dp = %41. Yatayda kıt olan yön yükseklik; sütun onu yiyor.
            • Kapattığı toprak — yatay şerit sağ alt köşede 0 (SIFIR) parça kapatıyor,
              orası harita kutusunun denizi. Dikey sütun sağ kenarda 3–6 parça kapatıyor
              (Hakkari-Çukurca, Yüksekova-Şemdinli, Özalp-Başkale, Iğdır, Doğubayazıt…).
          Fikir değişirse tek satır: aşağıdaki `telefon ?` koşulunu ters çevir. */}
      {/* SAĞ ALT SÜTUN: üstte TURU BİTİR (Görev 21 · U2 — tur çubuğundaki küçük "BİTİR"in
          yerine), altında harita tipi düğmeleri. Sütunun kendisi dokunmayı haritaya geçiriyor
          (box-none); içindeki iki kutunun da arka planı var. Gösteri ve tur işlenirken TURU
          BİTİR görünmüyor: o sırada basmak ikinci bir tur açmak olurdu. */}
      <View
        style={[s.sagAlt, { bottom: insets.bottom + 16, right: insets.right + 12 }]}
        pointerEvents="box-none"
      >
        {!O.sahne.oynuyor && !O.turIsleniyor && (
          <Parilti
            acik={egitimIsareti && egitimAdim.dugme === 'turBitir'}
            yaricap={(telefon ? 56 : 66) / 2}
          >
            <TurBitirDugmesi
              bekleyen={O.bekleyenOrdu}
              onPress={() => setTurOnayi(true)}
              boyut={telefon ? 56 : 66}
            />
          </Parilti>
        )}
        <View style={[s.hud, telefon ? s.hudYatay : s.hudDikey]}>
          {MODLAR.map(([k, Ikon]) => {
            const aktif = mod === k;
            return (
              <Pressable
                key={k}
                onPress={() => setMod(k)}
                style={[s.btn, { width: dugmeBoyut, height: dugmeBoyut }, aktif && s.btnAktif]}
              >
                <Ikon size={ikonBoyut} color={aktif ? ZEMIN.taban : YAZI_RENK.birincil} />
              </Pressable>
            );
          })}
          <View style={telefon ? s.ayracDikey : s.ayracYatay} />
          <Pressable
            onPress={() => setSinirlar((v) => !v)}
            style={[s.btn, { width: dugmeBoyut, height: dugmeBoyut }, sinirlar && s.btnAktif]}
          >
            <IkonSinir size={ikonBoyut} color={sinirlar ? ZEMIN.taban : YAZI_RENK.birincil} />
          </Pressable>
        </View>
      </View>

      {/* Üretim ekranı — ortada kutu, arka KARARMAZ (haritayı görmeye devam et). */}
      {uretimParcasi && sec.parca && uretimHakki && (
        <UretimEkrani
          parcaAd={sec.parca.ad}
          ilAd={sec.parca.il}
          havuz={O.butce}
          hak={uretimHakki}
          statlar={O.birimStatlari}
          onUret={onUretimOnayla}
          onKapat={() => setUretimAcik(false)}
          ipucu={!!egitimAdim && egitimAdim.dugme === 'uretEkrani'}
        />
      )}

      {/* Kuvvet seçici — hedef seçilince açılır. Onay YOK: emir vermek geri alınabilir
          bir iş (kuyruktan iptal edilebilir), onay geri alınamaz olan TURU BİTİR'de. */}
      {odaAcik && emirBilgisi && (
        <HareketEkrani
          // Hedef değişirse seçici SIFIRDAN kurulsun: içindeki birim seçimi o hedefe aitti.
          key={emirHedefi}
          bilgi={emirBilgisi}
          baslangic={kuvvet}
          onEmir={(birimler, secenekler) => hamleYap(birimler, secenekler)}
          onKapat={() => setOdaAcik(false)}
        />
      )}

      {/* Araştırma ekranı — ordu kalitesi (Görev 06 / §6). */}
      {arastirmaAcik && (
        <ArastirmaEkrani
          arastirma={O.arastirma}
          onAyir={O.arastirmayaAyir}
          onYukselt={O.dalYukselt}
          onGeriAl={O.yukseltmeyiGeriAl}
          onKapat={() => setArastirmaAcik(false)}
        />
      )}

      {/* Tur günlüğü — bu tur ne yaptın (Görev 15: emir listesinin yerini aldı). */}
      {gunlukAcik && (
        <TurGunlugu
          gunluk={O.gunlukOzetleri}
          toplanmalar={O.emirOzetleri.filter((e) => e.tip === 'toplanma')}
          onIptal={O.emirIptal}
          onKapat={() => setGunlukAcik(false)}
        />
      )}

      {/* Tur raporu — turu bitirince ne olduğu. */}
      {raporAcik && O.turRaporu && (
        <TurRaporu rapor={O.turRaporu} onKapat={() => setRaporAcik(false)} />
      )}

      {/* SAHNE KARTI (Görev 08 / Adım 6): il fethedildi · il kaybedildi · kutsal savaş ·
          tur açılışı. Perde YOK — harita görünmeye devam ediyor, kart bir kesinti değil vurgu. */}
      {O.sahneKarti && <SahneKarti kart={O.sahneKarti} />}

      {/* EĞİTİM ŞERİDİ (GOREV-20 Adım 8): sol üstte ilerleme noktaları + iki kelime. Bölge
          paneli açıkken onun sağına kayar. Asıl işaret haritadaki halka ya da düğmedeki
          parıltı; şerit yalnızca "ne yapıyorum" sorusunu cevaplıyor. */}
      {egitimIsareti && egitimAsamasi !== 'bitti' ? (
        <EgitimSeridi
          adim={egitimAsamasi}
          sira={EGITIM_ADIMLARI.indexOf(egitimAsamasi)}
          toplam={EGITIM_ADIMLARI.length}
          stil={{
            top: insets.top + 8,
            left: secili ? insets.left + 8 + pencere.width * 0.25 + 10 : insets.left + 12,
          }}
        />
      ) : null}
      {egitimSonuAcik && (
        <EgitimSonu
          onDevam={() => egitimIzle({ kapandi: true })}
          onBasla={() => {
            egitimIzle({ kapandi: true });
            kiptenCik();
            setSecili(null);
            O.mactanCik();
            setMenuGorunum('mod');
            setMenuAcik(true);
          }}
        />
      )}

      {/* TUR İŞLENİYOR PERDESİ (Görev 07): dünya kendi kendine oynuyor, 80 aktörün kararı
          ve çözümü telefonda gözle görülür bir an sürüyor. Perde her şeyin üstünde. */}
      {O.turIsleniyor && <TurPerdesi />}

      {/* DİPLOMASİ EKRANI (Görev 09 / Adım 4). Savaş odasının tam perde kalıbı; harita
          jesti yukarıdaki `dokunmaKapali` ile ayrıca susturuluyor (§10/1). */}
      {diplomasiAcik && (
        <DiplomasiEkrani
          satirlar={O.diplomasiSatirlari}
          ittifakSayisi={O.diplomasiBilgisi.ittifakSayisi}
          enCokIttifak={O.diplomasiBilgisi.enCokIttifak}
          savasSayisi={O.diplomasiBilgisi.savasSayisi}
          ihanetKalan={O.diplomasiBilgisi.ihanetKalan}
          // Gelen teklifler ve teklifin cevabı da BURADA (Görev 12 / Adım 1): ikisi de
          // haritadaki katmanlara yazılıyordu ve bu perdenin altında kalıyordu.
          teklifler={O.diplomasiBilgisi.teklifler}
          cevap={O.diplomasiCevabi}
          // GÜÇ sekmesi: illerin genel sıralaması (Görev 12; formül Görev 20). ÜLKE sekmesi
          // Görev 20'de kalktı (Baki): bloklar haritanın ittifak görünümünde zaten renkli.
          guc={O.gucListesi}
          benimId={O.oyun.oyuncuAktorId}
          // Kartlar sahibinin haritadaki renginde (renk ekranın işi, kanca kimlik veriyor).
          aktorRenk={AKTOR_RENKLERI}
          // Soldaki küçük Türkiye bununla boyanıyor (Baki: "hangi il neye göre gözüküyor").
          sahiplik={O.oyun.parcaSahipligi}
          // Haritada uzun basılan ilin sahibi — kartı açık gelir (Görev 20, Baki: "evet").
          baslangicId={diplomasiIlk}
          onTeklifCevapla={O.teklifCevapla}
          onIttifak={(id) => O.teklifVer(id, 'ittifak')}
          onAteskes={(id) => O.teklifVer(id, 'ateskes')}
          onBoz={(id) => setBozmaOnayi(id)}
          onSavasIlan={(id) => setSavasOnayi(id)}
          onKapat={() => {
            setDiplomasiAcik(false);
            setDiplomasiIlk(null);
            O.diplomasiCevabiTemizle();
          }}
        />
      )}

      {/* GELEN TEKLİF (Görev 09 / Adım 4b). "Diplomasinin yarısı GELEN tekliftir" —
          yalnızca giden teklif olsaydı oyuncu diplomasiyi kendi başlatmadıkça hiç
          yaşamazdı. Kart tur raporundan bağımsız: cevap tek dokunuş olmalı. */}
      {!menuAcik && !diplomasiAcik && O.diplomasiBilgisi.teklifler.length > 0 && (
        <Onay
          baslik={
            O.diplomasiBilgisi.teklifler[0].tip === 'ittifak'
              ? 'ANLAŞMA TEKLİFİ'
              : 'ATEŞKES TEKLİFİ'
          }
          mesaj={
            O.diplomasiBilgisi.teklifler[0].ad +
            (O.diplomasiBilgisi.teklifler[0].tip === 'ittifak'
              ? ' seninle anlaşmak istiyor. Kabul edersen birbirinize saldıramazsınız.'
              : ' savaşı bitirmek istiyor. Kabul edersen aranızdaki savaş hali sona erer.')
          }
          onayMetin="KABUL ET"
          onOnay={() =>
            O.teklifCevapla(
              O.diplomasiBilgisi.teklifler[0].kimden,
              O.diplomasiBilgisi.teklifler[0].tip,
              true
            )
          }
          onIptal={() =>
            O.teklifCevapla(
              O.diplomasiBilgisi.teklifler[0].kimden,
              O.diplomasiBilgisi.teklifler[0].tip,
              false
            )
          }
        />
      )}

      {/* İTTİFAKI BOZMA ONAYI — geri alınamaz iş (projenin onay kuralı). */}
      {/* SAVAŞ İLANI ONAYI (Görev 11). Geri alınamaz iş: ilan edilen savaş ancak
          ateşkesle biter ve zincir kuralı yüzünden hedefin müttefiklerini de karşına
          alabilirsin — ikisi de mesajda yazılı. */}
      {savasOnayi && (
        <Onay
          baslik="SAVAŞ İLAN ET"
          mesaj={
            // LİDERİN ADIYLA (Görev 16 / Adım 2): savaş ilanı bir devlete değil, adı olan
            // birine yapılıyormuş gibi okunsun. Lider yoksa ilin adına düşüyor.
            ((x) => x.lider || x.ad)(
              O.diplomasiSatirlari.find((x) => x.id === savasOnayi) || { ad: 'Bu devlet' }
            ) +
            ' ile savaşa giriyorsun. Savaş ancak ateşkesle biter ve müttefikleri de karşına geçebilir.'
          }
          onayMetin="İLAN ET"
          onOnay={() => {
            O.savasIlan(savasOnayi);
            setSavasOnayi(null);
          }}
          onIptal={() => setSavasOnayi(null)}
        />
      )}

      {bozmaOnayi && (
        <Onay
          baslik="ANLAŞMAYI BOZ"
          mesaj={
            'Bu anlaşmayı bozarsan sözünden dönmüş olursun ve ' +
            DENGE.DIPLOMASI.IHANET_SURESI +
            ' tur boyunca kimse seninle masaya oturmaz.'
          }
          onayMetin="BOZ"
          onOnay={() => {
            O.ittifakiBoz(bozmaOnayi);
            setBozmaOnayi(null);
          }}
          onIptal={() => setBozmaOnayi(null)}
        />
      )}

      {/* OYUN SONU (Görev 07): yapay zekâ gelince oyuncu ilk kez kaybedebilir hâle geldi.
          Kutu kapatılabiliyor — oyuncu haritaya bakıp ne olduğunu görmek isteyebilir. */}
      {O.oyunSonu && !sonKutusuKapali && (
        <OyunSonu
          sonuc={O.oyunSonu}
          istatistik={O.macIstatistigi}
          onKapat={() => setSonKutusuKapali(true)}
          onMenu={() => {
            O.mactanCik();
            setSonKutusuKapali(true);
            O.yuvalariTazele();
            setMenuGorunum('menu');
            setMenuAcik(true);
          }}
        />
      )}

      {/* ---- ANA MENÜ (Görev 09 / Adım 6) ----
          HER ŞEYİN ÜSTÜNDE ve uygulama bununla açılıyor. Oyun durumu YALNIZCA buradan
          kuruluyor (yeni maç ya da yuva yükleme) — görev belgesi §10/8 bunu "bu görevin
          en olası sessiz hatası" ilan etti: üçüncü bir kurulum yolu eklenirse menü ile
          harita arasında gidip gelirken sessizce yanlış maç yüklenir. */}
      {menuAcik && (
        <AnaMenu
          gorunum={menuGorunum}
          setGorunum={setMenuGorunum}
          ozetler={O.yuvaOzeti}
          devamYuvasi={O.devamYuvasi}
          onDevam={async () => {
            if (O.devamYuvasi === null) return;
            if (await O.yuvayiYukle(O.devamYuvasi)) {
              setSonKutusuKapali(false);
              setMenuAcik(false);
            }
          }}
          onYukle={async (yuva) => {
            if (await O.yuvayiYukle(yuva)) {
              setSonKutusuKapali(false);
              setMenuAcik(false);
            }
          }}
          onSil={(yuva) => setSilmeOnayi(yuva)}
          onEgitim={() => {
            // EĞİTİM (GOREV-20 Adım 8): kurallar sayfası değil, küçük bir maç. Hiçbir kayıt
            // yuvasına dokunmaz. Nasıl Oynanır sayfası maçın ayarlar menüsünde duruyor.
            O.egitimBaslat();
            kiptenCik();
            setSecili(null);
            setSonKutusuKapali(false);
            setMenuAcik(false);
            setMenuGorunum('menu');
          }}
          onBasarimlar={() => setBasarimAcik(true)}
          rutbe={O.rutbe}
          onBasla={(secim) => {
            // Boş yuva varsa oraya; yoksa dolu yuvanın üstüne yazmak için ONAY istenir.
            //
            // ⚠ LİSTE HENÜZ YÜKLENMEDİYSE ÜSTÜNE YAZMA SORULMAZ. `yuvaOzeti` diskten
            // asenkron geliyor ve ilk anda boş dizi; o anda `find` hiçbir şey bulamayınca
            // eskiden "1. maçta kayıtlı bir oyun var" diye YANLIŞ bir uyarı çıkıyordu.
            // Bilgi yoksa soru da sorulmaz: ilk yuvaya kurulur.
            const bos = O.yuvaOzeti.length === 0 ? { yuva: 0 } : O.yuvaOzeti.find((y) => !y.dolu);
            if (bos) {
              O.macBaslat(secim, bos.yuva);
              setSonKutusuKapali(false);
              setMenuAcik(false);
              // Menü bir dahaki açılışta BAŞTAN başlasın: oyuncu il seçim ekranında
              // bırakılmış bir menüye dönmemeli.
              setMenuGorunum('menu');
            } else {
              setYazmaOnayi({ secim, yuva: O.aktifYuva });
            }
          }}
          onAyarlar={() => setGenelAyarAcik(true)}
        />
      )}

      {/* ---- DOLU YUVAYA YAZMA ONAYI — geri alınamaz iş (§6/11) ----
          ⚠ ANA MENÜNÜN ALTINDA DEĞİL, ÜSTÜNDE ÇİZİLMELİ (Baki, 2026-08-06: *"il seçip
          başlaya basınca oyun başlamıyor"*). Bu blok eskiden `AnaMenu`'den ÖNCE yazılıydı;
          React Native'de sonra gelen kardeş üste çizdiği için onay kutusu tam ekran menünün
          ALTINDA kalıyordu. Görünmeyen bir onay kutusu, cevaplanmayan bir soru demek:
          BAŞLA'ya basan oyuncu hiçbir şey olmadığını sanıyor, menü de kapanmıyordu.
          Üç yuvanın üçü de doluyken HER yeni maç bu yola düşüyor — yani hata "bazen"
          değil, dolu kayıtla oynayan herkes için HER SEFERİNDE.
          KURAL: perde/onay katmanları, üstüne çıkacakları ekrandan SONRA yazılır. */}
      {yazmaOnayi && (
        <Onay
          baslik="MAÇIN ÜSTÜNE YAZ"
          mesaj={
            yazmaOnayi.yuva +
            1 +
            '. maçta kayıtlı bir oyun var ve yeni maç onun yerine geçecek. Eski maç geri getirilemez.'
          }
          onayMetin="ÜSTÜNE YAZ"
          onOnay={() => {
            O.macBaslat(yazmaOnayi.secim, yazmaOnayi.yuva);
            setYazmaOnayi(null);
            setSonKutusuKapali(false);
            setMenuAcik(false);
            setMenuGorunum('menu');
          }}
          onIptal={() => setYazmaOnayi(null)}
        />
      )}

      {/* ---- KAYDI SİLME ONAYI (Görev 12) ----
          Geri alınamaz iş; kalıp yazma onayının aynısı ve yeri de aynı sebeple ANA
          MENÜDEN SONRA: menü tam ekran, önce yazılan kutu altında kalır. */}
      {/* ---- YARDIM VE ORDULARIM (Görev 12 / Adım 10) ----
          Konumları ana menüden SONRA: ikisi de tam perde ve menünün üstünde durmalılar
          (2026-08-06'nın "görünmeyen onay kutusu" dersi). */}
      {yardimAcik && <YardimEkrani onKapat={() => setYardimAcik(false)} />}

      {basarimAcik && (
        <BasarimEkrani
          muhurler={O.muhurler}
          rutbe={O.rutbe}
          onKapat={() => setBasarimAcik(false)}
        />
      )}

      {ordularimAcik && (
        <OrdularimEkrani
          ordular={O.ordularim}
          onSec={(pid) => {
            setSecili(pid);
            setOrdularimAcik(false);
          }}
          onKapat={() => setOrdularimAcik(false)}
        />
      )}

      {/* KOMUTAN (Görev 20): ekran yalnızca yetenek + kademe; atama haritadan. */}
      {komutanAcik && (
        <KomutanEkrani
          komutan={O.komutan}
          taslak={komutanSecimi}
          onTaslak={(t) => setKomutanTaslagi({ ...t, mac: macKimligi })}
          onUygula={() => {
            // Yerinde uygulamak da bir atama (bu turun hakkı gider) — motorun kuralı.
            if (O.komutan.parcaId) O.komutanAta(O.komutan.parcaId, komutanSecimi);
          }}
          onGit={() => {
            setSecili(O.komutan.parcaId);
            setKomutanAcik(false);
          }}
          onKapat={() => setKomutanAcik(false)}
        />
      )}

      {silmeOnayi !== null && (
        <Onay
          baslik="KAYDI SİL"
          mesaj={
            silmeOnayi + 1 + '. maç kalıcı olarak silinecek. Bu kaydı geri getirmenin yolu yok.'
          }
          onayMetin="SİL"
          onOnay={async () => {
            await O.yuvayiSil(silmeOnayi);
            setSilmeOnayi(null);
          }}
          onIptal={() => setSilmeOnayi(null)}
        />
      )}

      {/* GENEL AYARLAR — ana menüden açılıyor, ekranın ortasında. Maç ayarlarıyla
          karıştırılmasın diye ayrı bileşen: buradakiler bütün maçlarda geçerli. */}
      {genelAyarAcik && (
        <GenelAyarlar
          ayarlar={O.ayarlar}
          onAyar={(ad, deger) => O.ayarDegistir({ [ad]: deger })}
          onKapat={() => setGenelAyarAcik(false)}
        />
      )}

      {/* Tur bitirme onayı — ne kazanacağını göstererek sorar.
          ⚠ EMİR CÜMLESİ KALKTI (Görev 20 / Adım 0). "N emrin sırayla işlenecek: savaşlar
          yapılacak, bozulanlar çekilecek, alınan yerler senin olacak" Görev 15'ten beri
          yanlıştı: savaşlar hamle anında çözülüyor, kuyrukta yalnızca toplanma kalıyor.
          Onayın kendisi kalsın mı, Baki'nin kararı (GOREV-20 Soru 6). */}
      {turOnayi && (
        <Onay
          baslik="TURU BİTİR"
          mesaj={'Tur ' + O.oyun.tur + ' kapanacak, sıra rakiplere geçecek.'}
          vurguBaslik="BU TUR KAZANACAĞIN"
          vurgu={
            '+' + gelirYaz(O.gelir.nufus) + ' nüfus / +' + gelirYaz(O.gelir.ekonomi) + ' ekonomi'
          }
          onayMetin="TURU BİTİR"
          onOnay={onTuruBitir}
          onIptal={() => setTurOnayi(false)}
        />
      )}

      {/* Ayarlar menüsü en üstte dursun — açıkken diğer düğmeler tıklanmasın. */}
      {ayarAcik && (
        <AyarMenusu
          senaryoAd={O.oyun.senaryo.ad}
          zorluk={O.zorluk}
          zorlukKademeleri={O.zorlukKademeleri}
          // Eğitimde kayıt ve zorluk yok: eğitim hiçbir yuvaya yazılmaz (GOREV-20 Adım 8).
          onZorluk={O.egitim ? null : O.zorlukSec}
          oyuncuAd={O.oyuncu.ad}
          mesaj={O.haber ? O.haber.mesaj : ''}
          onKaydet={O.egitim ? null : O.kaydet}
          onYukle={O.egitim ? null : onYukle}
          onOrdularim={() => {
            setAyarAcik(false);
            setOrdularimAcik(true);
          }}
          onKomutan={() => {
            setAyarAcik(false);
            setKomutanAcik(true);
          }}
          onYardim={() => {
            setAyarAcik(false);
            setYardimAcik(true);
          }}
          onAnaMenu={() => setCikisOnayi(true)}
          onKapat={() => setAyarAcik(false)}
          // Savaş gösterisi ayarı 2026-08-12'de ana menüden buraya taşındı (Baki'nin
          // isteği). Etiketler `oyun/ayarlar.js`'ten geliyor — ekran metin uydurmuyor.
          gosterim={{
            secili: O.ayarlar.gosterim,
            aciklama: (GOSTERIM_ETIKETLERI[O.ayarlar.gosterim] || {}).aciklama,
            secenekler: DENGE.SAHNE.KAPSAM_SIRASI.map((k) => ({
              anahtar: k,
              ad: GOSTERIM_ETIKETLERI[k].ad,
            })),
          }}
          onGosterim={(k) => O.ayarDegistir({ gosterim: k })}
        />
      )}

      {/* ÇIKIŞTA KAYIT SORUSU — ayar menüsünün ÜSTÜNDE (ağaçta ondan sonra geliyor).
          "VAZGEÇ" yalnızca kutuyu kapatır, ayar menüsü arkada açık kalır. */}
      {/* Eğitimden çıkış: kayıt sorusu yok (eğitim kaydedilmez). */}
      {cikisOnayi && O.egitim && (
        <Onay
          baslik="ANA MENÜYE DÖN"
          mesaj="Eğitimden çıkılsın mı?"
          onayMetin="ÇIK"
          onOnay={() => {
            O.mactanCik();
            kiptenCik();
            setSecili(null);
            setCikisOnayi(false);
            setAyarAcik(false);
            setMenuGorunum('menu');
            setMenuAcik(true);
          }}
          onIptal={() => setCikisOnayi(false)}
        />
      )}
      {cikisOnayi && !O.egitim && (
        <Onay
          baslik="ANA MENÜYE DÖN"
          mesaj="Sefer kaydedilsin mi? Kaydetmeden çıkarsan son kayıttan sonraki ilerleme kaybolur."
          onayMetin="KAYDET VE ÇIK"
          ikincilMetin="ÇIK"
          onOnay={async () => {
            await O.kaydet();
            O.mactanCik();
            setCikisOnayi(false);
            setAyarAcik(false);
            setMenuGorunum('menu');
            setMenuAcik(true);
          }}
          onIkincil={() => {
            O.mactanCik();
            setCikisOnayi(false);
            setAyarAcik(false);
            setMenuGorunum('menu');
            setMenuAcik(true);
          }}
          onIptal={() => setCikisOnayi(false)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  app: { flex: 1 },
  ayarDugme: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ayarDugmeAcik: { backgroundColor: YAZI_RENK.birincil, borderColor: YAZI_RENK.birincil },
  // Gösteri sürerken alttaki kılavuz — "burası dokunulabilir" demenin en sessiz yolu.
  atlaKatman: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  atlaMetin: {
    fontFamily: YAZI.govde,
    fontSize: 11.5,
    letterSpacing: 1,
    color: YAZI_RENK.ikincil,
    backgroundColor: PANEL.hudSaydam,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Sağ alt sütun (TURU BİTİR + harita tipi düğmeleri) — konumu sütun taşıyor.
  sagAlt: { position: 'absolute', alignItems: 'flex-end', gap: 10 },
  hud: {
    backgroundColor: ZEMIN.yuzey,
    borderWidth: 1,
    borderColor: CIZGI.ince,
    borderRadius: 12,
    shadowColor: PANEL.golgeRenk,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  hudDikey: { padding: 5, gap: 5 },
  hudYatay: { flexDirection: 'row', alignItems: 'center', padding: 4, gap: 4 },
  btn: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PANEL.parlakTul,
  },
  btnAktif: { backgroundColor: YAZI_RENK.birincil },
  ayracYatay: { height: 1, marginVertical: 1, backgroundColor: CIZGI.ayrac }, // dikey dizilimde
  ayracDikey: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 1,
    backgroundColor: CIZGI.ayrac,
  },
});
