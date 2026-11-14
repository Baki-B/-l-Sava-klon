// OYUN KANCASI — oyun durumu, eylemleri ve türetilmiş bilgileri tek yerde toplar.
//
// NEDEN AYRI DOSYA (2026-07-27 düzenlemesi): `App.js` 549 satıra çıkmış ve tek başına
// yazı tipi yüklemeyi, ekran kilidini, oyun durumunu, geliştirici araçlarını, rozet
// listelerini, üretim ekranını, bildirimleri ve tüm yerleşimi birden yapıyordu. Ne
// olduğunu anlamak için tamamını okumak gerekiyordu.
//
// Sınır şu: BURASI OYUN, App.js EKRAN.
//   • Burada: durum, kurallar, hesaplar. Hiçbir görsel bilgi yok (renk, ölçü, yerleşim).
//   • Orada: yerleşim ve bileşenler. Oyun kuralı yok.
// Yeni bir oyun kuralı eklerken buraya, yeni bir düğme eklerken oraya bakılır.
//
// İki kanca var:
//   useOyun()              — oyunun bütünü: durum + eylemler + haritalık türetmeler
//   useSeciliParca(...)    — yalnızca SEÇİLİ parçanın panel bilgisi
// Ayrı olmalarının sebebi: seçim ekranın işi, oyunun değil. Panel kapalıyken ikinci
// kancanın hesapları hiç çalışmaz.

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { DENGE } from './denge';
import { parcaRozetListesi, ilRozetListesi } from './rozetListesi';
import {
  oyunKur,
  aktorOzeti,
  aktorParcalari,
  ilSahiplikDagilimi,
  parcayiVer,
  iliVer,
  parcayiEskiHaline,
  iliEskiHaline,
} from './oyun/oyunDurumu';
import { turuBitir } from './oyun/turDongusu';
import { egitimKur } from './oyun/egitim';
import { muharebeTahmini } from './oyun/muharebe';
import { aktorGeliri, parcaGeliri, ilGeliri } from './oyun/uretim';
import {
  birimUret,
  ilUretimHakki,
  birimSayisi,
  parcaOrdusu,
  orduDokumu,
  yaraliAl,
  saglamBirimler,
} from './oyun/ordu';
import {
  gecerliHedefler,
  hedefleriAyir,
  emirKaldir,
  kullanilabilirBirimler,
  parcaninEmirleri,
  dusmanaSinirdasMi,
  komsular,
  toplanmaEmriVer,
  toplanmaEmriVarMi as toplanmaEmriVar,
  hamleHakkiTablosu,
  bekleyenOrduSayisi,
} from './oyun/hareket';
import { moralBonuslari, dokumSatiri, hamleUygula, ozetCikar } from './oyun/cozum';
import {
  aktorStatlari,
  aktorArastirmasi,
  egitimPuani,
  turPuani,
  dalDurumu,
  dalEtkisi,
  ayrilaniAyarla,
  seviyeYukselt,
  seviyeGeriAl,
  seferberlikBedava,
  aktorEtkileri,
  dalSeviyesi,
} from './oyun/arastirma';
import { ayrilanArastirma, arastirmayaAyrilabilir, kullanilabilirButce } from './oyun/butce';
import { eksikKadro, eksikDokumu, toplanmaMaliyeti } from './oyun/toplanma';
import { fetihGanimeti } from './oyun/fetih';
import { kaydet, yukle, yuvaOzetleri, sonYuva, kaydiSil } from './oyun/kayit';
import { gucSiralamasi } from './oyun/guc';
import { kazanilanlar } from './oyun/basarimlar';
import { muhurleriOku, muhurleriEkle } from './oyun/basarimKaydi';
import { macOzeti } from './oyun/sayac';
import { KOMSULUK, parcaTamAdi } from './oyun/veri';
import { ilOlcegi } from './oyun/olaylar';
import { sonucKontrol, sonucMetni, hedefDurumu } from './oyun/mod';
import {
  tanidiklar,
  iliskiDurumu,
  ittifakMi,
  savastaMi,
  muttefikler,
  dusmanlar,
  teklifGecerliMi,
  teklifUygula,
  ittifakBoz,
  ihanetKalanTur,
  savasIlanGecerliMi,
  savasIlanEt,
} from './oyun/diplomasi';
import { teklifKabulMu, retSebebi } from './oyun/zeka';
import { karakterAdi } from './oyun/kisilik';
import { liderAdi } from './oyun/liderler';
import { rutbeHesapla, kademeHakki, kademeyeKalan } from './oyun/rutbe';
import { komutanAta, komutanAl, komutanBurada, atamaGecerliMi } from './oyun/komutan';
import { yetenekAl, yetenekBosaMiGider } from './oyun/yetenek';
import { odulKullanilabilirMi, odulKullan, sayaciTasi, kalanOdul } from './para/odul';
import { casusAc, seferberlikAc } from './para/odulEtki';
import { husumetBul, duelloBul } from './oyun/rekabet';
import { ayarlariOku, ayarlariYaz, VARSAYILAN_AYARLAR } from './oyun/ayarlar';
import { useSahne } from './sahne/useSahne';
import { emirTitresimi, retTitresimi } from './sahne/titresim';
import parcalarData from '../veri/parcalar.json';
import haritaData from '../veri/harita.json';
import illerData from '../veri/iller.json';

const PARCALAR = parcalarData.parcalar;
const IL_GEOM = haritaData.iller;

// Toparlanma emrinin tek satırlık özeti: "2 piyade yaralı · 3 piyade eksik".
// Yaralı ve ölü AYRI yazılıyor — ikisinin bedeli de anlamı da farklı, tek sayıda
// birleştirmek oyuncuya neyin ne olduğunu kaybettirirdi.
function toparlanmaDokumu(emir) {
  const p = [];
  if (birimSayisi(emir.yarali) > 0) p.push(eksikDokumu(emir.yarali) + ' yaralı');
  if (birimSayisi(emir.eksik) > 0) p.push(eksikDokumu(emir.eksik) + ' eksik');
  return p.join(' · ');
}

export function useOyun() {
  const [oyun, setOyun] = useState(() => oyunKur());
  // Sonucu ekranda gösterilecek kısa haber ({ mesaj, iyi }) — kaydetme, sipariş tekrarı.
  const [haber, setHaber] = useState(null);
  const haberiKapat = useCallback(() => setHaber(null), []);

  // ---- DİPLOMASİ CEVABI (Görev 12 / Adım 1) ----
  //
  // HATA: teklifin cevabı yalnızca `haber`e yazılıyordu ve haber şeridi HARİTA ekranında
  // duruyor. Diplomasi ekranı tam perde olduğu için cevap perdenin ALTINDA kalıyordu —
  // oyuncu teklif veriyor, ekranda hiçbir şey olmuyor sanıyordu (Baki, 2026-08-06).
  //
  // TEK KAYNAK, İKİ YÜZEY: mesaj bir kez üretilir; panel açıkken SATIRIN kendisinde,
  // kapalıyken bildirim şeridinde görünür. İki ayrı metin yazılmıyor (§10/4).
  const [diplomasiCevabi, setDiplomasiCevabi] = useState(null);
  const diplomasiCevabiTemizle = useCallback(() => setDiplomasiCevabi(null), []);
  // `sebep` (Görev 20 · Baki: "neden reddettiğine dair küçük bir mesaj"): yalnızca
  // reddedilen teklifte, diplomasi ekranında sonuç satırının altında.
  const diplomasiBildir = useCallback((id, mesaj, iyi, sebep) => {
    setDiplomasiCevabi({ id, mesaj, iyi, sebep: sebep || null });
    setHaber({ mesaj, iyi });
  }, []);

  const oyuncu = oyun.aktorler[oyun.oyuncuAktorId];
  // Senaryoya dahil parçalar — dışındakiler haritada soluk ve seçilemez.
  const kapsam = useMemo(() => new Set(oyun.senaryo.kapsamParcalar), [oyun.senaryo]);
  const gelir = useMemo(() => aktorGeliri(oyun, oyun.oyuncuAktorId), [oyun]);
  const ozet = useMemo(() => aktorOzeti(oyun, oyun.oyuncuAktorId), [oyun]);

  // ---- ROZET LİSTELERİ ----
  // İkisi de hazır verilir; hangisinin ne kadar görüneceğine yakınlaştırma karar verir
  // (bkz. Rozet.js). BOŞ olanlar listeye hiç girmez — hem "boş parçada rozet yok" kuralı
  // (§7.2) hem de performansın kaynağı: 181 rozet asla aynı anda çizilmez.
  // Oyuncunun komutanının yeri — rozet katmanının okuduğu tek alan. Ayrı `useMemo`:
  // `parcaRozetleri` 181 parçayı tarıyor ve bağımlılığı bilerek dar tutulmuş (§performans
  // notu aşağıda). Komutanın yeri turda en çok bir kez değişiyor, yani bu hesap neredeyse
  // hiç tazelenmiyor ve rozet listesini boşuna yeniden kurmuyor.
  const komutanYerleri = useMemo(() => {
    const k = (oyun.komutanlar || {})[oyun.oyuncuAktorId];
    const pid = (k && k.parcaId) || null;
    return { benim: pid, benimIl: pid && PARCALAR[pid] ? PARCALAR[pid].kod : null };
  }, [oyun.komutanlar, oyun.oyuncuAktorId]);

  // Liste kuralları `src/rozetListesi.js`'te (Görev 20): Skia haritasının bilgisayardaki
  // önizlemesi de aynı listeyi kurabilsin diye kancadan çıktı. Bağımlılıklar değişmedi.
  // HAMLE HAKKI (Görev 21): haritadaki halka ve TURU BİTİR'in sayısı. Gidecek yer sorusu
  // sahipliğe ve diplomasiye bakıyor, o yüzden bağımlılığı bütün oyun — ama yalnızca
  // oyuncunun ordularını geziyor (bir tur içinde birkaç düzine parça).
  const hakTablosu = useMemo(() => hamleHakkiTablosu(oyun, oyun.oyuncuAktorId), [oyun]);
  const bekleyenOrdu = useMemo(() => bekleyenOrduSayisi(hakTablosu), [hakTablosu]);

  const parcaRozetleri = useMemo(
    () => parcaRozetListesi(oyun.ordular, komutanYerleri.benim, hakTablosu),
    [oyun.ordular, komutanYerleri, hakTablosu]
  );

  // `tumIlOrdulari` yalnızca `oyun.ordular`'ı okuyor. Önceden `[oyun]`a bağlıydı ve her durum
  // değişiminde 81 rozet nesnesi baştan kuruluyordu (2026-07-30 gözden geçirmesi). Görev 21'de
  // hamle hakkı tablosu eklendi ve o oyunun tamamına bağlı; bu artık bilinçli: halka her
  // hamlede değişmeli. Seçim (`secili`) ekranın durumu, buraya hiç uğramıyor.
  const ilRozetleri = useMemo(
    () =>
      ilRozetListesi(oyun.ordular, komutanYerleri.benimIl, IL_GEOM, hakTablosu, oyun.oyuncuAktorId),
    [oyun.ordular, komutanYerleri, hakTablosu, oyun.oyuncuAktorId]
  );

  // ---- TUR ----
  // TUR İŞLENİYOR PERDESİ (Görev 07 / Adım 6a). Dünya artık kendi kendine oynuyor: 80
  // aktörün kararı + çözümü geliştirme makinesinde ~40 ms, telefonda birkaç kat fazla.
  // Perde olmadan oyuncu TURU BİTİR'e basınca kısa bir donma görür ve ne olduğunu anlamaz.
  //
  // HESAP BİR SONRAKİ KAREYE BIRAKILIYOR: aynı karede yapılsaydı perde hiç çizilmez,
  // React state değişimi ile ağır hesap tek bir bloğa sıkışırdı. `setTimeout(…, 0)` React'in
  // perdeyi çizmesine izin veriyor, hesap ondan sonra başlıyor.
  const [turIsleniyor, setTurIsleniyor] = useState(false);
  // Oyun sonu kutusundan yeniden başlamak için. Zorluk korunuyor — oyuncu "zor" seçtiyse
  // kaybettikten sonra sessizce ortaya düşmemeli.
  const yeniOyunEylem = useCallback(() => {
    setOyun((o) => oyunKur({ senaryo: o.senaryo.anahtar, zorluk: o.zorluk }));
  }, []);
  // ZORLUK DEĞİŞTİRMEK YENİ OYUN BAŞLATIR: kişilikler kurulumda tohumdan üretiliyor
  // (kayıtta değil, türetiliyor). Ortada değiştirmek süregelen oyunun rakiplerini bir anda
  // başka insanlara çevirirdi — sessiz bir tutarsızlık olurdu.
  const zorlukSecEylem = useCallback((yeni) => {
    setOyun((o) => (o.zorluk === yeni ? o : oyunKur({ senaryo: o.senaryo.anahtar, zorluk: yeni })));
  }, []);
  // ---- MÜHÜRLER (Görev 12 / Adım 11) ----
  //
  // Kazanılanlar CİHAZDA saklanıyor (`basarimKaydi.js`), maç kaydında değil. Her tur
  // sonunda koşullar bir kez sınanıyor ve YENİ kazanılanlar diske yazılıyor.
  //
  // ⚠ SINAMA TUR SONUNDA, ÇİZİM SIRASINDA DEĞİL. Her çizimde sınansaydı 34 koşul saniyede
  // onlarca kez çalışırdı; üstelik "yeni kazandın" bildirimi de tekrar tekrar doğardı.
  const [muhurler, setMuhurler] = useState({});
  const [yeniMuhurler, setYeniMuhurler] = useState([]);
  useEffect(() => {
    let iptal = false;
    muhurleriOku().then((m) => !iptal && setMuhurler(m));
    return () => {
      iptal = true;
    };
  }, []);

  const muhurleriTazele = useCallback(async (durum) => {
    const yeni = await muhurleriEkle(kazanilanlar(durum));
    if (yeni.length === 0) return [];
    setMuhurler(await muhurleriOku());
    setYeniMuhurler(yeni);
    return yeni;
  }, []);

  const yeniMuhurleriTemizle = useCallback(() => setYeniMuhurler([]), []);

  // ---- RÜTBE (Görev 16 / Adım 3) ----
  // Mühürlerden TÜRETİLİYOR, ayrı kayıt yok. Mühürler değişmediği sürece yeniden
  // hesaplanmıyor — ana menü her çizimde 33 mührü taramasın.
  const rutbe = useMemo(() => rutbeHesapla(muhurler), [muhurler]);

  // ---- ÖDÜL ANLIK GÖRÜNTÜLERİ (Görev 19 / Adım 2) ----
  //
  // "Turu geri al" ve "yenilgiden dön" ödülleri için son turların başlangıç durumu
  // saklanıyor. ⚠ YALNIZCA BELLEKTE (`useRef`), kayda YAZILMIYOR: üç turluk tam durum
  // ~3 × 22 KB eder ve kayıt sınırını deldirirdi (`DENGE.ODUL` notu). Oyun kapanınca hak
  // düşüyor ve bu bilinçli — ödül o oturumun ikinci şansı.
  //
  // Zincirin sonu EN YENİ tur. `DENGE.ODUL.GERI_TUR` kadar tutuluyor: "turu geri al" son
  // görüntüye, "yenilgiden dön" en eskisine döner.
  const anlikRef = useRef([]);

  // ---- HAMLE ANINDA OYNAYAN GÖSTERİ (Görev 15 / Adım 4) ----
  // Gösteri eskiden yalnızca tur sonunda oynuyordu (`sonTurRaporu`). Hamle artık verildiği
  // an çözüldüğü için o anın da bir gösterisi olmalı: saldırıyı yaptın, savaşı GÖRÜYORSUN.
  // Tek bir `rapor` girişi var ve öncelik hamlenindir; turu bitirirken temizleniyor ki
  // botların turu kendi gösterisini oynatabilsin.
  const [hamleRaporu, setHamleRaporu] = useState(null);

  const turuBitirEylem = useCallback(() => {
    // Hamle gösterisi bitti sayılıyor: sıra botların turunu oynatmakta (Görev 15 / Adım 4).
    setHamleRaporu(null);
    setTurIsleniyor(true);
    setTimeout(() => {
      setOyun((o) => {
        // Tur BİTMEDEN önceki hâli anlık görüntü zincirine yaz (Görev 19 / Adım 2).
        anlikRef.current = anlikRef.current.concat([o]).slice(-DENGE.ODUL.GERI_TUR);
        const sonrasi = turuBitir(o);
        // MÜHÜR SINAMASI TUR SONUNDA (Görev 12). `muhurleriTazele` sabit kimlikli
        // (`useCallback(..., [])`), yani bağımlılığa girmesi TURU BİTİR düğmesinin
        // hafızalamasını bozmuyor — kimlik tuzağı (CLAUDE.md §6) burada tetiklenmiyor.
        // EĞİTİMDE MÜHÜR YOK (GOREV-20 Adım 8): eğitim maçı kolaylaştırılmış (zayıf hedef,
        // hazır bütçe); oradan gelen mühür rütbeye bedava puan olurdu.
        if (!sonrasi.egitim) muhurleriTazele(sonrasi);
        return sonrasi;
      });
      setTurIsleniyor(false);
    }, 0);
  }, [muhurleriTazele]);

  // ---- CİHAZ AYARLARI (Görev 08 / §6/10) ----
  // Kayıtta DEĞİL, ayrı bir anahtarda (`oyun/ayarlar.js`): oyun durumu değil cihaz tercihi.
  // Açılışta okunuyor, her değişiklikte yazılıyor. Okuma bitene kadar varsayılanlar geçerli —
  // ilk turda ayar dosyası okunmadığı için gösteri kapalı kalmasın.
  const [ayarlar, setAyarlar] = useState(VARSAYILAN_AYARLAR);
  useEffect(() => {
    let iptal = false;
    ayarlariOku().then((a) => {
      if (!iptal) setAyarlar(a);
    });
    return () => {
      iptal = true;
    };
  }, []);
  const ayarDegistir = useCallback((yama) => {
    setAyarlar((a) => {
      const yeni = { ...a, ...yama };
      ayarlariYaz(yeni);
      return yeni;
    });
  }, []);

  // ---- SAHNE (Görev 08) ----
  //
  // Gösteri bitince tur raporu açılıyor. Sıra önemli: rapor gösterinin ÜSTÜNE açılırsa
  // oyuncu ne olduğunu göremeden metni okur ve bu görevin tamamı boşa gider.
  // Gösterim kapalıyken `useSahne` hiç olay üretmiyor ve `onBitti` hemen çağrılıyor,
  // yani rapor bugünkü gibi anında açılıyor.
  const [raporHazir, setRaporHazir] = useState(0);
  const sahneBitti = useCallback(() => setRaporHazir((n) => n + 1), []);

  const sahne = useSahne({
    rapor: hamleRaporu || oyun.sonTurRaporu,
    oyuncuAktorId: oyun.oyuncuAktorId,
    gosterim: ayarlar.gosterim,
    titresim: ayarlar.titresim,
    ses: ayarlar.ses,
    onBitti: sahneBitti,
  });

  // Kartın METNİ burada çözülüyor, sahnede değil: sahne kimlik taşıyor, ad taşımıyor
  // (oyun katmanının kuralı). Ölçek de burada — `ilOlcegi` kartın süresini belirleyen
  // katsayının aynısı, yani kartın BOYU ile SÜRESİ aynı sayıdan besleniyor.
  const sahneKarti = useMemo(() => {
    const k = sahne.kart;
    if (!k) return null;
    const ilAd = (kod) => (illerData[kod] ? illerData[kod].ad : kod);
    const aktorAd = (id) => (oyun.aktorler[id] ? oyun.aktorler[id].ad : id);
    if (k.tip === 'turAcilisi') return { tip: k.tip, no: k.no, baslik: 'TUR', ad: String(k.tur) };
    if (k.tip === 'ilTamamlandi')
      return {
        tip: k.tip,
        no: k.no,
        baslik: 'İL FETHEDİLDİ',
        ad: ilAd(k.il).toLocaleUpperCase('tr'),
        alt: k.ganimet > 0 ? '+' + k.ganimet + ' nüfus ganimet' : null,
        olcek: ilOlcegi(k.il),
      };
    if (k.tip === 'ilKaybedildi')
      return {
        tip: k.tip,
        no: k.no,
        baslik: 'İL KAYBEDİLDİ',
        ad: ilAd(k.il).toLocaleUpperCase('tr'),
        alt: aktorAd(k.yeni) + ' eline geçti',
        olcek: ilOlcegi(k.il),
      };
    // BÖLGE kartları (Görev 21): il kartından küçük, parçanın tam adıyla.
    if (k.tip === 'bolgeAlindi')
      return {
        tip: k.tip,
        no: k.no,
        baslik: 'BÖLGE ALINDI',
        ad: parcaTamAdi(k.parca).toLocaleUpperCase('tr'),
        alt: k.ganimet > 0 ? '+' + k.ganimet + ' nüfus ganimet' : null,
      };
    if (k.tip === 'bolgeKaybedildi')
      return {
        tip: k.tip,
        no: k.no,
        baslik: 'BÖLGE KAYBEDİLDİ',
        ad: parcaTamAdi(k.parca).toLocaleUpperCase('tr'),
        alt: aktorAd(k.yeni) + ' eline geçti',
      };
    if (k.tip === 'duello')
      return {
        tip: k.tip,
        no: k.no,
        // Kart başlığı, `veri/husumetler.js`'teki savaş adlarının sıfatıyla aynı kelimeyi
        // taşıyor (2026-08-01): başlık ile altındaki ad aynı dili konuşmalı. Sıfat orada
        // değişirse burası da değişmeli — ve tablodaki HİÇBİR ad buraya yazılmamalı,
        // `testler/rekabet.test.js` bunu kilitliyor (yazarken bu yoruma bile takıldı).
        baslik: 'BÜYÜK SAVAŞ',
        ad: (k.ad || '').toLocaleUpperCase('tr'),
        alt: ilAd(k.ilA) + ' — ' + ilAd(k.ilB),
        // İKİ LİDERİN ADI (Görev 16 / Adım 2): hasım illerin lakapları elle yazıldı ve
        // husumetin konusuyla konuşuyor ("Tavşan Kanı" — "Demli"). Kart böylece iki il
        // arasındaki kavgayı iki KİŞİ arasındaki kavgaya çeviriyor.
        liderA: liderAdi(oyun.rastgele.tohum, k.ilA, (oyun.kisilikler || {})[k.ilA]).lakap,
        liderB: liderAdi(oyun.rastgele.tohum, k.ilB, (oyun.kisilikler || {})[k.ilB]).lakap,
      };
    return null;
  }, [sahne.kart, oyun.aktorler, oyun.kisilikler, oyun.rastgele.tohum]);

  // ---- ÜRETİM ----
  // Bütçe AŞAĞI YUVARLANIR: ekranda görünen sayı ile harcanabilen sayı aynı olsun.
  //
  // HAVUZUN KENDİSİ DEĞİL, HARCANABİLİR OLAN (Görev 06). Araştırmaya ayrılan pay ve
  // bekleyen toplanma emirleri havuzda hâlâ duruyor ama artık senin değil; hesap tek
  // yerde (`butce.js`) ve `ordu.js` de aynı satırdan geçiyor — üç musluk üç ayrı yerde
  // denetlenirse biri kaçar (§9/7).
  const butce = useMemo(() => kullanilabilirButce(oyun, oyun.oyuncuAktorId), [oyun]);
  const uretimHakki = useCallback(
    (parcaId) => (parcaId ? ilUretimHakki(oyun, PARCALAR[parcaId].kod, oyun.oyuncuAktorId) : null),
    [oyun]
  );

  // ---- ARAŞTIRMA VE TOPLANMA (Görev 06) ----
  // Oyuncunun kaydırılmış stat tablosu. Üretim ekranı, panel ve savaş odası bunu
  // gösteriyor; araştırma yoksa `DENGE.BIRIMLER`'in kendisi döner.
  const birimStatlari = useMemo(
    () => aktorStatlari(oyun, oyun.oyuncuAktorId),
    [oyun.arastirma, oyun.oyuncuAktorId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Araştırma ekranının okuduğu her şey, düz veri olarak. Ekran oyun durumunu tanımaz.
  // Etki sayıları UYDURULMUYOR, `dalEtkisi` ile gerçek hesaptan çıkıyor (§Adım 5/1).
  const arastirma = useMemo(() => {
    const id = oyun.oyuncuAktorId;
    const kayit = aktorArastirmasi(oyun, id);
    const egitim = egitimPuani(oyun, id);
    const ayrilan = ayrilanArastirma(oyun, id);
    return {
      egitim,
      puan: kayit ? kayit.puan || 0 : 0,
      ayrilan,
      enCokAyrilabilir: arastirmayaAyrilabilir(oyun, id),
      turBasiKazanc: turPuani(ayrilan, egitim),
      geriAlinabilir: !!(kayit && (kayit.buTurAtlanan || []).length > 0),
      // Özel yeteneğin kapısı (Görev 20): ekran kilitli düğmenin yerine bu sayıyı çiziyor.
      ozelOnkosul: DENGE.ARASTIRMA.OZEL_ONKOSUL,
      // BİRİM BAŞINA AĞAÇ (Görev 07 / Adım 2b). Ekran artık düz bir dal listesi değil,
      // ağaç listesi alıyor: her birimin kendi üç ana dalı + bir kendine özgü dalı.
      agaclar: DENGE.ARASTIRMA.AGAC_SIRASI.map((birim) => {
        const dallar = DENGE.ARASTIRMA.DAL_SIRASI[birim].map((dal) => ({
          birim,
          dal,
          ad: DENGE.ARASTIRMA.AGACLAR[birim][dal].ad,
          ozel: DENGE.ARASTIRMA.AGACLAR[birim][dal].tip === 'ozel',
          aciklama: DENGE.ARASTIRMA.AGACLAR[birim][dal].aciklama,
          ...dalDurumu(kayit, birim, dal),
          etki: dalEtkisi(kayit, birim, dal),
        }));
        return {
          birim,
          ad: DENGE.BIRIMLER[birim].ad,
          dallar,
          // Ağaç seçim ekranının kartında görünen özet: kaç seviye alınmış, kaç mümkün,
          // ve şu an parası yeten bir yükseltme var mı (kart o zaman "hazır" işaretlenir).
          alinan: dallar.reduce((a, d) => a + d.seviye, 0),
          enCok: dallar.length * DENGE.ARASTIRMA.TAVAN,
          hazir: dallar.some((d) => d.yeter),
        };
      }),
    };
  }, [oyun]);

  const arastirmayaAyir = useCallback(
    (miktar) => setOyun((o) => ayrilaniAyarla(o, o.oyuncuAktorId, miktar)),
    []
  );
  const dalYukselt = useCallback((birim, dal) => {
    setOyun((o) => {
      const s = seviyeYukselt(o, o.oyuncuAktorId, birim, dal);
      if (!s.ok) setHaber({ mesaj: s.sebep, iyi: false });
      return s.durum;
    });
  }, []);
  const yukseltmeyiGeriAl = useCallback(() => {
    setOyun((o) => seviyeGeriAl(o, o.oyuncuAktorId).durum);
  }, []);

  // Toplanma emri — kuyruğa girer, iptali `emirIptal` ile (aynı listede).
  const toplan = useCallback((parcaId) => {
    let oldu = false;
    setOyun((o) => {
      const s = toplanmaEmriVer(o, o.oyuncuAktorId, parcaId);
      oldu = s.ok;
      if (!s.ok) setHaber({ mesaj: s.sebep, iyi: false });
      return s.durum;
    });
    return oldu;
  }, []);
  // Dönen: sipariş gerçekten basıldı mı. Ekran buna göre kapanır — basılamayan sipariş
  // sessizce çöpe gitmesin, oyuncu düzeltip tekrar denesin.
  const uret = useCallback(
    (parcaId, siparis) => {
      const s = birimUret(oyun, parcaId, oyun.oyuncuAktorId, siparis);
      if (s.ok) setOyun(s.durum);
      return s.ok;
    },
    [oyun]
  );

  // ---- HAREKET VE EMİR KUYRUĞU (Görev 05) ----
  //
  // Emirler haritada OK olarak çizilir. Liste `oyun.emirler`e bağlı; harita katmanı da
  // yalnızca ona bağlanıyor (bkz. Harita.js `emirEl`). Sahiplik/renk listesine
  // bağlanmıyor: 181 parçanın taban çizimini her emir vermede yeniden kurdurmamak için.
  // TOPLANMA EMRİNİN OKU YOKTUR — ordu bir yere gitmiyor, yerinde toparlanıyor.
  // Kuyrukta durmasının sebebi rezervasyon (bkz. `toplanma.js`), hareket değil.
  const emirOklari = useMemo(
    () =>
      (oyun.emirler || [])
        .map((e, sira) => ({ e, sira }))
        .filter(({ e }) => e.tip !== 'toplanma')
        .map(({ e, sira }) => {
          const k = PARCALAR[e.kaynak],
            h = PARCALAR[e.hedef];
          const hedefOrdu = oyun.ordular[e.hedef];
          return {
            anahtar: 'e' + sira,
            x1: k.etiket.x,
            y1: k.etiket.y,
            x2: h.etiket.x,
            y2: h.etiket.y,
            // Saldırı mı takviye mi: ok rengi bunu söyler, oyuncu haritaya bakınca anlasın.
            saldiri: !!(hedefOrdu && hedefOrdu.sahip !== e.sahip),
          };
        }),
    [oyun.emirler, oyun.ordular]
  );

  // Emir listesi ekranının okuduğu döküm (adlar burada çözülüyor, oyun katmanında değil).
  // SIRA NUMARASI FİLTRELENMEZ: iptal düğmesi `emirKaldir(sira)` ile tam listeye
  // indeksliyor, ara bir eleman atlanırsa yanlış emir iptal edilir.
  const emirOzetleri = useMemo(
    () =>
      (oyun.emirler || []).map((e, sira) => {
        if (e.tip === 'toplanma')
          return {
            sira,
            tip: 'toplanma',
            kaynakAd: parcaTamAdi(e.kaynak),
            dokum: toparlanmaDokumu(e),
            bedel: e.bedel,
          };
        const hedefOrdu = oyun.ordular[e.hedef];
        return {
          sira,
          tip: 'hareket',
          kaynakAd: parcaTamAdi(e.kaynak),
          hedefAd: parcaTamAdi(e.hedef),
          dokum: orduDokumu(e.birimler),
          saldiri: !!(hedefOrdu && hedefOrdu.sahip !== e.sahip),
        };
      }),
    [oyun.emirler, oyun.ordular]
  );

  // ---- TUR GÜNLÜĞÜ (Görev 15 / Adım 4) ----
  // Emir listesinin yerini alıyor. Eskiden ekran BEKLEYEN emirleri gösteriyordu; hamle
  // anında çözüldüğü için bekleyen emir kalmadı, gösterilecek şey OLUP BİTENLER oldu.
  // Kaynak `oyun.turGunlugu` — `hamleUygula` her hamleyi oraya yazıyor, tur bitince
  // boşalıyor. Burada yalnızca OYUNCUNUN satırları süzülüyor ve adlar çözülüyor
  // (ad çözümü ekranın işi, oyun katmanı kimlik taşır).
  const gunlukOzetleri = useMemo(() => {
    const satirlar = (oyun.turGunlugu || []).filter((x) => x.aktorId === oyun.oyuncuAktorId);
    return satirlar.map((x, sira) => {
      const kaynakAd = parcaTamAdi(x.kaynak);
      const hedefAd = parcaTamAdi(x.hedef);
      if (x.tip === 'giris')
        return {
          sira,
          tip: 'giris',
          kaynakAd,
          hedefAd,
          dokum: orduDokumu(x.birimler),
          sonuc: x.fethedildi
            ? 'alındı' + (x.ganimet > 0 ? ' · +' + x.ganimet + ' nüfus' : '')
            : 'takviye',
          iyi: true,
        };
      if (x.tip === 'muharebe') {
        const kazandin = x.kazanan === 'saldiran';
        return {
          sira,
          tip: 'muharebe',
          kaynakAd,
          hedefAd,
          dokum: orduDokumu(x.gonderilen),
          sonuc:
            (kazandin ? 'kazanıldı' : 'püskürtüldü') +
            ' · ' +
            x.saldiranKayip +
            ' kayıp' +
            (kazandin && x.ganimet > 0 ? ' · +' + x.ganimet + ' nüfus' : ''),
          iyi: kazandin,
        };
      }
      return { sira, tip: x.tip, kaynakAd, hedefAd, dokum: '', sonuc: 'iptal', iyi: false };
    });
  }, [oyun.turGunlugu, oyun.oyuncuAktorId]);

  // Hedef seçme kipinde vurgulanacak parçalar. Kural motorun kendi kuralı —
  // arayüz ayrı bir "seçilebilir mi" mantığı yazmıyor (bkz. hareket.js tek kaynak notu).
  //
  // `tur`: 'tasi' (kendi parçalarına takviye) | 'saldir' (başkasının parçası) | yoksa hepsi.
  // Ayrım sahipliğe göre; ikisi de aynı geçerli hedef kümesinden geliyor (`hedefleriAyir`).
  const hedefler = useCallback(
    (kaynak, tur) => {
      if (!kaynak) return [];
      if (!tur) return gecerliHedefler(oyun, oyun.oyuncuAktorId, kaynak);
      const a = hedefleriAyir(oyun, oyun.oyuncuAktorId, kaynak);
      return tur === 'tasi' ? a.dost : a.dusman;
    },
    [oyun]
  );

  // Kuvvet seçicinin ihtiyacı olan HER ŞEY, düz veri olarak. Ekran oyun durumunu tanımaz.
  const hareketBilgisi = useCallback(
    (kaynak, hedef) => {
      if (!kaynak || !hedef || !PARCALAR[kaynak] || !PARCALAR[hedef]) return null;
      const ben = oyun.oyuncuAktorId;
      const hedefP = PARCALAR[hedef];
      const hedefOrdu = parcaOrdusu(oyun, hedef);
      const dusman = hedefOrdu && hedefOrdu.sahip !== ben ? hedefOrdu : null;
      const sahipId = oyun.parcaSahipligi[hedef];
      // ARAŞTIRMA (Görev 06): iki taraf da KENDİ kaydırılmış stat tablosuyla görünür ve
      // savaşır. Ekranda temel tablo gösterilseydi araştırma büsbütün görünmez bir güç
      // olurdu — oyuncu zırhını yükseltir, savaş odası hâlâ "zırh 2" yazardı (§9/5).
      const benStatlari = aktorStatlari(oyun, ben);
      const dusmanStatlari = dusman ? aktorStatlari(oyun, dusman.sahip) : benStatlari;
      return {
        // Muharebe tahmini bunu motora aynen geçirir; ekrandaki tahmin ile tur sonunda
        // olan şey ancak böyle aynı satırdan geçer.
        statlar: { saldiran: benStatlari, savunan: dusmanStatlari },
        // Kendine özgü dallar da tahmine giriyor (Görev 07 / Adım 2b): baraj ateşi ilk
        // raundu, paletli üstünlük arazi cezasını değiştiriyor. Geçmeselerdi savaş odası
        // araştırmanın bir kısmını görmezden gelir ve tur sonuyla ayrışırdı.
        etkiler: {
          saldiran: aktorEtkileri(oyun, ben),
          savunan: dusman ? aktorEtkileri(oyun, dusman.sahip) : aktorEtkileri(oyun, ben),
        },
        kaynakAd: PARCALAR[kaynak].ad,
        hedefAd: hedefP.ad,
        // Hamle çubuğunun üst satırı ili ayrıca yazmıyor: orada tam ad (Görev 21).
        hedefTamAd: parcaTamAdi(hedef),
        hedefIl: hedefP.il,
        arazi: hedefP.arazi,
        eldeki: kullanilabilirBirimler(oyun, kaynak),
        // HAMLE HAKKI GÖSTERGESİ (Görev 15 / Adım 4): bu parçada durup da bu tur hakkını
        // tüketmiş birimler. Kuvvet seçici "hazır" sayısını zaten `eldeki`den okuyor;
        // bu alan farkın SEBEBİNİ söylüyor, yoksa oyuncu birliğin nereye gittiğini arar.
        yorgunSayi: (() => {
          const o = parcaOrdusu(oyun, kaynak);
          if (!o) return 0;
          const kullanilabilir = kullanilabilirBirimler(oyun, kaynak);
          return Math.max(0, birimSayisi(o.birimler) - birimSayisi(kullanilabilir));
        })(),
        // Kaynaktaki yaralılar — savaş odası "sağlamlar önce gider" kuralını yazabilsin.
        kaynakYarali: yaraliAl(parcaOrdusu(oyun, kaynak)),
        kaynakSaglamSayi: birimSayisi(saglamBirimler(parcaOrdusu(oyun, kaynak))),
        benimMi: sahipId === ben,
        sahipAd: oyun.aktorler[sahipId] ? oyun.aktorler[sahipId].ad : '—',
        // ---- KOMUTAN BURADA MI (Görev 16 / Adım 6) ----
        // Kuvvet seçici bunu görürse "komutan da gitsin" kutusunu çıkarıyor. Kutu YALNIZCA
        // komutan bu parçadayken görünüyor; her hamlede sorulan bir kutu, bir süre sonra
        // okunmadan işaretlenen bir kutudur (saldırı onayındaki aynı gerekçe).
        //
        // ⚠ KUTU SALDIRI ONAYINDA DEĞİL BURADA: onay yalnızca SALDIRIDA çıkıyor, oysa
        // komutan kendi toprağına yapılan taşımayla da gitmeli. Kuvvet seçici iki durumda
        // da açık — "ne gidiyor" kararının verildiği tek yer burası.
        komutanBurada: komutanBurada(oyun, ben, kaynak),
        // Savunma yoksa null: ekran "savunmasız" yazar, muharebe tahmini göstermez.
        // `satirlar` savaş odasının sağ sütunu için: karşındakinin kadrosu tür tür,
        // statlarıyla. Panelin BURADAKİ ORDU kutusuyla aynı biçim.
        savunan: dusman
          ? {
              birimler: dusman.birimler,
              sayi: birimSayisi(dusman.birimler),
              dokum: orduDokumu(dusman.birimler),
              satirlar: DENGE.BIRIM_SIRASI.filter((t) => dusman.birimler[t] > 0).map((t) => ({
                anahtar: t,
                sayi: dusman.birimler[t],
                ...dusmanStatlari[t],
              })),
            }
          : null,
        moralBonuslari: dusman
          ? moralBonuslari(oyun, kaynak, hedef, ben, dusman.sahip)
          : { saldiran: 0, savunan: 0 },
        // Moral üstünlüğünün SEBEPLERİ (§3.8). Savaş odası bunları cümleye çeviriyor;
        // toplam bonustan geri çıkarmaya çalışmıyor — dağlık ile "kendi toprağı" aynı
        // sayıyı verdiği için tahmin yanlış cümle kurabiliyordu (2026-07-30).
        moralSebepleri: {
          daglik: hedefP.arazi === 'daglik',
          savunanKendiTopragi: !!dusman && sahipId === dusman.sahip,
          savunanIlMorali: illerData[hedefP.kod].statlar.moral >= DENGE.MUHAREBE.MORAL_YUKSEK_ESIGI,
          saldiranIlMorali:
            illerData[PARCALAR[kaynak].kod].statlar.moral >= DENGE.MUHAREBE.MORAL_YUKSEK_ESIGI,
        },
        ganimet: sahipId === ben ? 0 : fetihGanimeti(hedef),
        // Savunmasız bırakma uyarısının veri tarafı; kuralın kendisi hareket.js'te.
        dusmanaSinirdas: dusmanaSinirdasMi(oyun, ben, kaynak),
      };
    },
    [oyun]
  );

  // ---- DOĞRUDAN HAMLE (Görev 20 / Adım 5 · Baki: ikinci dokunuş = hamle) ----
  //
  // Bir parça hamle KAYNAĞI olabilir mi: senin, bu tur hakkı olan birliği var ve gidecek
  // yeri var. Dönen: { dost, dusman } (hedef kimlikleri) ya da null. Ekran buna bakarak
  // kendi orduna dokunulunca paneli değil hedefleri açıyor.
  const hamleHedefleri = useCallback(
    (kaynak) => {
      if (!kaynak || oyun.parcaSahipligi[kaynak] !== oyun.oyuncuAktorId) return null;
      if (birimSayisi(kullanilabilirBirimler(oyun, kaynak)) === 0) return null;
      const a = hedefleriAyir(oyun, oyun.oyuncuAktorId, kaynak);
      return a.dost.length + a.dusman.length > 0 ? a : null;
    },
    [oyun]
  );

  // ORDU ÇUBUĞU (Görev 21 · Baki: "il panelinden ordu kontrol etmeyi kaldıralım"): kendi
  // orduna dokununca — hamle hakkı bitmiş olsa da — alt çubuk açılır; komutan ve toparlanma
  // orada. Dönen: bu parça oyuncunun mu ve üstünde asker var mı.
  const orduKaynagiMi = useCallback(
    (pid) =>
      !!pid &&
      oyun.parcaSahipligi[pid] === oyun.oyuncuAktorId &&
      birimSayisi((oyun.ordular[pid] || {}).birimler || {}) > 0,
    [oyun]
  );

  // Seçili hedefin TAHMİNİ — haritada hedefin rengi ve çubuktaki simge buradan. Savaş
  // odasıyla AYNI girdi (`hareketBilgisi`) ve aynı motor satırı: ikisi ayrışamaz.
  // Dönen: null (kuvvet seçilmedi ya da kendi toprağın) ·
  //        { kademe, gonderilen, kalan, savunan, savunanKalan, bos }.
  // `bos`: karşıda ordu yok — savaşmadan alınır, kademe 'ustun' sayılıyor.
  const hamleTahmini = useCallback((bilgi, birimler) => {
    if (!bilgi || bilgi.benimMi || birimSayisi(birimler || {}) === 0) return null;
    if (!bilgi.savunan) {
      const n = birimSayisi(birimler);
      return { kademe: 'ustun', gonderilen: n, kalan: n, savunan: 0, savunanKalan: 0, bos: true };
    }
    const t = muharebeTahmini({
      saldiran: { birimler },
      savunan: { birimler: bilgi.savunan.birimler },
      arazi: bilgi.arazi,
      moralBonuslari: bilgi.moralBonuslari,
      statlar: bilgi.statlar,
      etkiler: bilgi.etkiler,
    });
    return {
      kademe: t.kademe,
      gonderilen: birimSayisi(birimler),
      kalan: t.kalan,
      savunan: bilgi.savunan.sayi,
      savunanKalan: t.savunanKalan,
      bos: false,
    };
  }, []);

  // Emir verince HAFİF TIK, geçersizse kısa bir ret (§4.3/Katman 1'in ilk maddesi).
  // Oyunun ELDE hissini asıl değiştiren yer burası: gösterim kapalı olsa bile çalışıyor,
  // çünkü bu bir gösteri değil, dokunmanın karşılığı.
  // Ayar çizim sırasında DEĞİL, etkide ref'e yazılıyor (React'in ref kuralı); değer
  // yalnızca dokunma anında okunuyor, yani bir kare gecikmenin görünür etkisi yok.
  const titresimRef = useRef(ayarlar.titresim);
  useEffect(() => {
    titresimRef.current = ayarlar.titresim;
  }, [ayarlar.titresim]);
  // HAMLE ANINDA ÇÖZÜLÜR (Görev 15 / Adım 2). Eskiden burada emir kuyruğa giriyordu ve
  // sonuç TURU BİTİR'de görülüyordu; artık saldırı verildiği an muharebeye dönüşüyor,
  // fethedilen parça hemen el değiştiriyor ve ordu oraya geçiyor.
  //
  // ⚠ Ekran tarafı bu adımda henüz kaba: sonucun gösterimi (günlük, gösterinin anında
  // oynaması, onay kutusu) Adım 3–4'ün işi. Burada yalnızca motor bağlandı.
  // `secenekler` (Görev 16 / Adım 6): { komutan: true } → komutan orduyla birlikte gider.
  // Motor tarafı Adım 4'ten beri hazırdı (`emirEkle` → `emir.komutan`); eksik olan tek şey
  // oyuncunun bunu söyleyebilmesiydi.
  // Geçersiz dokunuşun karşılığı (Görev 20 / Adım 5): kuvvet seçilmeden hedefe ikinci kez
  // dokunmak gibi. Cümle yok, kısa bir ret titreşimi.
  const reddet = useCallback(() => retTitresimi(titresimRef.current), []);
  const emirVer = useCallback(
    (kaynak, hedef, birimler, secenekler) => {
      const s = hamleUygula(oyun, oyun.oyuncuAktorId, kaynak, hedef, birimler, secenekler);
      if (s.ok) {
        setOyun(s.durum);
        // Bu hamlenin kendi gösterisi — tur sonunu beklemeden oynuyor.
        setHamleRaporu({ tur: s.durum.tur, satirlar: s.satirlar, ozet: ozetCikar(s.satirlar) });
        emirTitresimi(titresimRef.current);
      } else {
        setHaber({ mesaj: s.sebep, iyi: false });
        retTitresimi(titresimRef.current);
      }
      return s.ok;
    },
    [oyun]
  );
  const emirIptal = useCallback((sira) => setOyun((o) => emirKaldir(o, sira)), []);

  // ---- KOMUTAN (Görev 16 / Adım 6) ----
  //
  // ⚠ KADEME BURADA HESAPLANIYOR, MOTORDA DEĞİL. Mühürler `durum`un içinde değil, cihazda
  // (`basarimKaydi.js`) ve motor depolamayı tanımaz (CLAUDE.md §3). Kanca kademeyi
  // mühürlerden türetip `komutanAta`ya VERİ olarak geçiyor; motor onu yalnızca aralığa
  // kırpıyor. Motor mühür okusaydı `denge-simulasyonu` çalışmaz ve aynı tohum farklı sonuç
  // verirdi. Gerekçe: `docs/HATA-AVI-2026-09-20.md` §3.
  const komutanKademeHakki = useMemo(() => kademeHakki(muhurler), [muhurler]);
  const komutanKalan = useMemo(() => kademeyeKalan(muhurler), [muhurler]);

  // Komutanın ekranda görünen hâli. TEK YERDE türetiliyor: harita rozeti, ordular ekranı ve
  // kuvvet seçicinin "komutan da gitsin" kutusu aynı nesneyi okuyor, yoksa üçü ayrışır.
  //
  // `bosaGider`: Silah Ustası seçili birliğin bütün stat dalları tavandaysa yetenek
  // HİÇBİR ŞEY yapmıyor. Sessizce boşa gitmesin diye ekrana taşınıyor (Görev 19'da yedi
  // mührü kaybettiren sinsiliğin aynısı — `docs/HATA-AVI-2026-09-20.md` §8).
  const komutanBilgisi = useMemo(() => {
    const ben = oyun.oyuncuAktorId;
    const k = komutanAl(oyun, ben);
    const y = yetenekAl(oyun, ben);
    const arastirma = aktorArastirmasi(oyun, ben);
    return {
      parcaId: (k && k.parcaId) || null,
      // Komutan ekranının "komutanın burada" çipi (Görev 20): yerin adı, dokununca oraya gider.
      parcaAd: k && k.parcaId && PARCALAR[k.parcaId] ? parcaTamAdi(k.parcaId) : null,
      // Silah Ustası HANGİ birlikte boşa gider — ekran seçim sırasında o birliğin simgesine
      // çarpı koyuyor (Görev 20: uyarı cümlesi yerine). Ek seviye en az 1 olduğu için
      // kademeden bağımsız: bir birliğin ortak dallarının hepsi tavandaysa her kademede boşa.
      bosaBirimler: Object.fromEntries(
        DENGE.BIRIM_SIRASI.map((t) => [
          t,
          yetenekBosaMiGider('silahUstasi', 1, t, arastirma, dalSeviyesi),
        ])
      ),
      bekleme: (k && k.bekleme) || 0,
      atamaHakki: Math.max(0, DENGE.KOMUTAN.TUR_BASINA_ATAMA - ((k && k.atama) || 0)),
      yetenek: y ? y.yetenek : null,
      kademe: y ? y.kademe : 1,
      birim: y ? y.birim : DENGE.KOMUTAN.VARSAYILAN_BIRIM,
      kademeHakki: komutanKademeHakki,
      kademeyeKalan: komutanKalan,
      bosaGider: y
        ? yetenekBosaMiGider(y.yetenek, y.kademe, y.birim, arastirma, dalSeviyesi)
        : false,
    };
  }, [oyun, komutanKademeHakki, komutanKalan]);

  // Bu parçaya komutan atanabilir mi (ve atanamazsa NİYE). Motorun kapısından geçiyor:
  // ekranda "atanabilir" görünüp motorda reddedilen bir düğme olmasın.
  const komutanAtamaDurumu = useCallback(
    (parcaId) => atamaGecerliMi(oyun, oyun.oyuncuAktorId, parcaId),
    [oyun]
  );

  // Komutan bu parçada mı — harita rozeti ve kuvvet seçici bunu soruyor.
  const komutanBuradaMi = useCallback(
    (parcaId) => komutanBurada(oyun, oyun.oyuncuAktorId, parcaId),
    [oyun]
  );

  const komutanAtaEylem = useCallback(
    (parcaId, secim) => {
      const istenen = (secim && secim.kademe) || 1;
      // Oyuncu açmadığı kademeyi seçemez. Ekran da aynı sayıyı gösteriyor ama kapı BURADA:
      // ekran kısıtı bir çizim kararıdır, yetki kararı değil.
      const kademe = Math.min(istenen, komutanKademeHakki);
      const s = komutanAta(oyun, oyun.oyuncuAktorId, parcaId, { ...(secim || {}), kademe });
      if (s.ok) {
        setOyun(s.durum);
        emirTitresimi(titresimRef.current);
      } else {
        setHaber({ mesaj: s.sebep, iyi: false });
        retTitresimi(titresimRef.current);
      }
      return s.ok;
    },
    [oyun, komutanKademeHakki]
  );

  // ---- ÖDÜL EYLEMLERİ (Görev 19 / Adım 2) ----
  //
  // Dördü de AYNI KAPIDAN geçiyor (`odulKullanilabilirMi`): ekranda görünen ile motorun
  // izin verdiği ayrışmasın. Reklamın kendisi henüz yok (`REKLAM_HAZIR = false`), bu yüzden
  // bu eylemler bugün yalnızca motordan çağrılabiliyor — düğmeler SDK ile gelecek (Adım 4).
  //
  // ⚠ ANLIK GÖRÜNTÜYE DÖNERKEN SAYAÇ İLERİ TAŞINIYOR (`sayaciTasi`): yoksa geri alma kendi
  // bedelini siler ve sınır anlamını yitirir.
  const odulGeriAl = useCallback(
    (anahtar) => {
      const zincir = anlikRef.current;
      if (zincir.length === 0) return false;
      // turuGeriAl → son görüntü · yenilgidenDon → en eski (GERI_TUR tur öncesi)
      const hedef = anahtar === 'yenilgidenDon' ? zincir[0] : zincir[zincir.length - 1];
      const izin = odulKullanilabilirMi(oyun, anahtar);
      if (!izin.ok) {
        setHaber({ mesaj: izin.sebep, iyi: false });
        return false;
      }
      const tasinmis = sayaciTasi(hedef, oyun);
      const s = odulKullan(tasinmis, anahtar);
      if (!s.ok) return false;
      anlikRef.current = anahtar === 'yenilgidenDon' ? [] : zincir.slice(0, -1);
      setHamleRaporu(null);
      setOyun(s.durum);
      return true;
    },
    [oyun]
  );

  const odulCasus = useCallback(
    (hedefAktorId) => {
      const izin = odulKullanilabilirMi(oyun, 'casusRaporu');
      if (!izin.ok) {
        setHaber({ mesaj: izin.sebep, iyi: false });
        return false;
      }
      const s = odulKullan(casusAc(oyun, hedefAktorId), 'casusRaporu');
      if (s.ok) setOyun(s.durum);
      return s.ok;
    },
    [oyun]
  );

  const odulSeferberlik = useCallback(() => {
    const izin = odulKullanilabilirMi(oyun, 'acilSeferberlik');
    if (!izin.ok) {
      setHaber({ mesaj: izin.sebep, iyi: false });
      return false;
    }
    const s = odulKullan(seferberlikAc(oyun), 'acilSeferberlik');
    if (s.ok) setOyun(s.durum);
    return s.ok;
  }, [oyun]);

  // ---- TUR RAPORU ----
  // Çözümün ham dökümünü okunur satırlara çevirir. Oyun katmanı kimlik verir, ad vermez.
  const turRaporu = useMemo(() => {
    const r = oyun.sonTurRaporu;
    if (!r) return null;
    // Parçanın TAM adı: "Kuzeybatı" değil "Ankara Kuzeybatı" (Görev 21).
    const ad = parcaTamAdi;
    const ben = oyun.oyuncuAktorId;

    // ---- KADEMELİ RAPOR (Soru 5 → Baki'nin cevabı A) ----
    //
    // Dünya artık kendi kendine oynuyor: bir turda 80 aktörün savaşları oluyor. Hepsini
    // raunt raunt yazmak okunacak metin değil (§9/tuzak 8). Ayrım şu:
    //   • SENİN satırların (ve sana saldıranlar) tam ayrıntıyla — aşağıdaki `satirlar`.
    //   • Uzaktakiler tek cümlelik MANŞET, en fazla MANSET_SINIRI tane.
    //
    // ÖNEM SIRASI (görev belgesi §Adım 6b): sana yakınlık > el değiştiren ilin değeri >
    // aktörün büyüklüğü. Sınır BAŞTAN konuyor, sonradan kısaltılmaya çalışılmıyor.
    const benimParcalar = new Set(
      Object.keys(oyun.parcaSahipligi).filter((p) => oyun.parcaSahipligi[p] === ben)
    );
    const banaKomsuMu = (pid) =>
      komsular(pid).some((k) => benimParcalar.has(k)) || benimParcalar.has(pid);

    // Oyuncunun satırları: kendi hamleleri, ona saldıranlar VE boş parçasına yürüyenler
    // (`eskiSahip` — savunan ordu yoksa `savunanId` de yok; eskiden bu kayıp raporda hiç
    // görünmüyordu).
    const benimSatirlar = r.satirlar.filter(
      (s) => !s.aktorId || s.aktorId === ben || s.savunanId === ben || s.eskiSahip === ben
    );
    const uzakOlaylar = r.satirlar
      .filter((s) => s.aktorId && s.aktorId !== ben && s.savunanId !== ben && s.fethedildi)
      .map((s) => {
        const g = parcaGeliri(s.hedef);
        return {
          satir: s,
          yakin: banaKomsuMu(s.hedef),
          deger: g.nufus + g.ekonomi,
          buyukluk: Object.values(oyun.parcaSahipligi).filter((x) => x === s.aktorId).length,
        };
      })
      .sort(
        (a, b) => Number(b.yakin) - Number(a.yakin) || b.deger - a.deger || b.buyukluk - a.buyukluk
      )
      .slice(0, DENGE.ZEKA.MANSET_SINIRI);

    const mansetler = uzakOlaylar.map((o, i) => {
      const s = o.satir;
      const alan = oyun.aktorler[s.aktorId] ? oyun.aktorler[s.aktorId].ad : s.aktorId;
      const kaybeden =
        s.savunanId && oyun.aktorler[s.savunanId] ? oyun.aktorler[s.savunanId].ad : null;
      return {
        anahtar: 'm' + i,
        yakin: o.yakin,
        // İl tamamlandıysa "ilhak etti", tek parçaysa "aldı" — ikisi farklı büyüklükte olay.
        cumle: s.ilTamamlandi
          ? // İLİN adı: ham satırda `ilAd` yok (o alan aşağıda oyuncunun satırlarına ekleniyor);
            // eskiden buraya parçanın adı düşüyordu — "İstanbul Anadolu Yakası ilini" (2026-09-24).
            alan +
            ', ' +
            (s.ilKodu && illerData[s.ilKodu] ? illerData[s.ilKodu].ad : ad(s.hedef)) +
            ' ilini tümüyle ele geçirdi.'
          : kaybeden
            ? alan + ', ' + kaybeden + ' elindeki ' + ad(s.hedef) + ' bölgesini aldı.'
            : alan + ', ' + ad(s.hedef) + ' bölgesini aldı.',
      };
    });

    return {
      tur: r.tur,
      // ÖZET OYUNCUNUN GÖZÜNDEN (2026-09-24): çözümün özeti yalnızca oyuncunun SALDIRILARINI
      // sayıyor; rakip saldırıp oyuncu savunduysa başlık "Muharebe olmadı" diyordu ama altında
      // savaş satırları duruyordu. Savunmalar ve kaybedilen bölgeler de buraya giriyor.
      ozet: benimOzetim(benimSatirlar, ben),
      mansetler,
      // Manşete sığmayan uzak olayların sayısı — "ve 12 yerde daha el değişti" satırı için.
      digerFetih: r.satirlar.filter(
        (s) => s.aktorId && s.aktorId !== ben && s.savunanId !== ben && s.fethedildi
      ).length,
      satirlar: benimSatirlar.map((s, i) => {
        // TARAF (2026-09-24 düzeltmesi): rapor eskiden her satırı oyuncu SALDIRMIŞ gibi
        // anlatıyordu — sana saldırıp kazanan bir rakip "KAZANDIN · burası artık senin"
        // diye yazılıyordu. 'savunan': oyuncu savundu ya da boş parçası alındı.
        const savundum = !!s.aktorId && s.aktorId !== ben;
        const kendi = (saldiran, savunan) => (savundum ? savunan : saldiran);
        return {
          anahtar: 'r' + i,
          ...s,
          taraf: savundum ? 'savunan' : 'saldiran',
          saldiranAd: s.aktorId && oyun.aktorler[s.aktorId] ? oyun.aktorler[s.aktorId].ad : null,
          kaynakAd: ad(s.kaynak),
          hedefAd: ad(s.hedef),
          ilAd: s.ilKodu && illerData[s.ilKodu] ? illerData[s.ilKodu].ad : null,
          cekilmeAd: s.cekilme && s.cekilme.hedef ? ad(s.cekilme.hedef) : null,
          savunanAd:
            s.savunanId && oyun.aktorler[s.savunanId] ? oyun.aktorler[s.savunanId].ad : null,
          // Muharebe dökümü — kompakt diziler adlandırılmış satırlara çevriliyor (cozum.js).
          gonderilenDokum: s.gonderilen ? orduDokumu(s.gonderilen) : null,
          savunanGirenDokum: s.savunanGiren ? orduDokumu(s.savunanGiren) : null,
          // TOPLANMA satırı (Görev 06): kaç birim doldu, ne harcandı, ne kalmadı.
          dolanDokum: s.dolan && birimSayisi(s.dolan) > 0 ? orduDokumu(s.dolan) : null,
          iyilesenDokum: s.iyilesen && birimSayisi(s.iyilesen) > 0 ? orduDokumu(s.iyilesen) : null,
          basilamayanDokum: s.basilamayan ? orduDokumu(s.basilamayan) : null,
          iyilesemeyenDokum: s.iyilesemeyen ? orduDokumu(s.iyilesemeyen) : null,
          yerAd: s.yer ? ad(s.yer) : null,
          kendiKayipDokum: kendi(s.saldiranKayiplar, s.savunanKayiplar)
            ? orduDokumu(kendi(s.saldiranKayiplar, s.savunanKayiplar))
            : null,
          kendiYaraliDokum:
            !savundum && s.saldiranYarali && birimSayisi(s.saldiranYarali) > 0
              ? orduDokumu(s.saldiranYarali)
              : null,
          dusmanKayipDokum: kendi(s.savunanKayiplar, s.saldiranKayiplar)
            ? orduDokumu(kendi(s.savunanKayiplar, s.saldiranKayiplar))
            : null,
          turlar: s.dokum ? s.dokum.map(dokumSatiri) : null,
        };
      }),
    };
  }, [oyun.sonTurRaporu, oyun.aktorler, oyun.parcaSahipligi, oyun.oyuncuAktorId]);

  // ---- OYUN SONU (Görev 09 / Adım 5) ----
  //
  // KONTROLÜN KENDİSİ ARTIK BURADA DEĞİL, `oyun/mod.js sonucKontrol`'de — görev belgesi
  // §Adım 5/3'ün şartı: "Görev 07'nin asgari kontrolü buraya taşınır; iki yerde iki
  // kontrol kalmayacak."
  //
  // Görev 07'de burada iki satırlık bir kontrol vardı (hiç parçan yok → yenildin, hepsi
  // senin → kazandın). Mod sistemiyle koşul moda göre değiştiği için o kontrol yanlış
  // cevap vermeye başlardı: Yarım Fetih'te %50'de kazanmış olman gerekirken oyun devam
  // eder, Güç Yarışı'nda hiç bitmezdi. İkisi de SESSİZ hata olurdu — oyun çalışıyor
  // görünür, sadece bitmez.
  //
  // Burada kalan tek şey ekranın ihtiyaç duyduğu biçime çevirmek.
  const oyunSonu = useMemo(() => {
    if (Object.keys(oyun.parcaSahipligi).length === 0) return null;
    // Kayıtta yalnızca SONUÇ duruyor (kazandı/yenildi), sebebi yok. Sebep canlı kontrolden
    // okunuyor — aynı sonucu veriyorsa: "rakip hedefe ulaştı" cümlesi rakibin adını
    // taşıyor ve 'kayit' sebebiyle "süre doldu" diye yanlış yazılırdı (Görev 20).
    const canli = sonucKontrol(oyun);
    const s = oyun.sonuc
      ? canli && canli.sonuc === oyun.sonuc
        ? canli
        : { sonuc: oyun.sonuc, sebep: 'kayit' }
      : canli;
    if (!s) return null;
    const hedef = hedefDurumu(oyun);
    return {
      bitti: true,
      kazandin: s.sonuc === 'kazandi',
      sebep: s.sebep,
      metin: sonucMetni(oyun, s),
      parca: hedef.benim,
      toplam: hedef.toplamParca,
    };
  }, [oyun]);

  // ---- HEDEF GÖSTERGESİ (§6/12: "görünmeyen hedef hedef değildir") ----
  // Tur çubuğundaki tek satır ilerleme. Kazanma kontrolüyle AYNI sayılardan besleniyor.
  const hedef = useMemo(() => hedefDurumu(oyun), [oyun]);

  // ---- DİPLOMASİ (Görev 09 / Adım 4) ----
  //
  // Satırların KENDİSİ motordan (`tanidiklar`), hangi düğmenin etkin olduğu da motordan
  // (`teklifGecerliMi`). Bu memo yalnızca ikisini birleştirip ekranın okuyacağı biçime
  // çeviriyor — burada tek bir kural cümlesi yok (§10/4).
  const diplomasiSatirlari = useMemo(() => {
    const ben = oyun.oyuncuAktorId;
    const benimDusmanlar = new Set(dusmanlar(oyun, ben));
    const benimMuttefikler = new Set(muttefikler(oyun, ben));

    return tanidiklar(oyun, ben).map((t) => {
      const durum = iliskiDurumu(oyun, ben, t.id);
      const ittifak = teklifGecerliMi(oyun, ben, t.id, 'ittifak');
      const ilan = savasIlanGecerliMi(oyun, ben, t.id);
      const ateskes = teklifGecerliMi(oyun, ben, t.id, 'ateskes');
      const kayit = (oyun.iliskiler || {})[[ben, t.id].sort().join('|')];

      // ---- KARŞI TARAFIN DÜNYASI ----
      // Diplomasi "kabul et / reddet" düğmesi değil; kiminle konuştuğunu bilmekle başlıyor.
      // Bu satırlar oyuncunun karar verirken ihtiyaç duyduğu her şeyi taşıyor.
      const onunDusmanlari = dusmanlar(oyun, t.id);
      const ortakDusmanlar = onunDusmanlari.filter((x) => benimDusmanlar.has(x));
      const onunMuttefikleri = muttefikler(oyun, t.id);
      const hasim = !!husumetBul(ben, t.id);
      const duello = !!duelloBul(oyun, ben, t.id);

      // Teklifi kabul eder mi? Zekânın KENDİ hesabı sorulıyor — ekranda ayrı bir tahmin
      // yazılmıyor (§10/4). Oyuncu böylece boşa teklif yakmıyor.
      const tip = durum === 'savas' ? 'ateskes' : 'ittifak';
      const gecerli = tip === 'ateskes' ? ateskes : ittifak;
      const kabulEder =
        gecerli.ok && teklifKabulMu(oyun, t.id, ben, tip, (oyun.kisilikler || {})[t.id]);

      return {
        id: t.id,
        ad: oyun.aktorler[t.id] ? oyun.aktorler[t.id].ad : t.id,
        // KARAKTER (Görev 12 / Adım 2): Saldırgan · Dengeli · Çekimser. Burası zaten
        // "tanıdıklar" listesi olduğu için Baki'nin kararı (`tanıdıkça görünsün`)
        // kendiliğinden sağlanıyor — uzaktaki devletler bu listeye hiç girmiyor.
        karakter: karakterAdi((oyun.kisilikler || {})[t.id]),
        // LİDER (Görev 16 / Adım 2): "Konya Paşası — Demir Yumruk". Bu liste zaten
        // "tanıdıklar" olduğu için ad da tanıdıkça görünüyor; ayrı bir süzgeç yok.
        lider: liderAdi(oyun.rastgele.tohum, t.id, (oyun.kisilikler || {})[t.id]).tamAd,
        durum,
        nasil: t.nasil,
        parca: t.parca,
        benimParcam: aktorParcalari(oyun, ben).length,
        turdan: kayit ? oyun.tur - kayit.turdan : 0,
        ittifakGecerli: ittifak.ok,
        ateskesGecerli: ateskes.ok,
        // SAVAŞ İLANI (Görev 11): saldırmanın tek kapısı. Geçerlilik motordan geliyor —
        // ekran ayrı bir kural yürütmüyor.
        savasIlaniGecerli: ilan.ok,
        savasIlaniSebep: ilan.ok ? null : ilan.sebep,
        kabulEder,
        hasim,
        duello,
        // Karşı tarafın konumu — cümleye çevirmek ekranın işi, sayılar burada.
        ortakDusman: ortakDusmanlar.length,
        ortakDusmanAdlari: ortakDusmanlar
          .slice(0, 3)
          .map((x) => (oyun.aktorler[x] ? oyun.aktorler[x].ad : x)),
        // Kimlikler — ekran bunları renkli nokta olarak çiziyor (Görev 20: cümle yerine
        // simge). Renk ekranın işi, burada yalnızca kim olduğu.
        ortakDusmanIdleri: ortakDusmanlar,
        muttefikIdleri: onunMuttefikleri,
        cepheSayisi: onunDusmanlari.length,
        muttefikSayisi: onunMuttefikleri.length,
        muttefikAdlari: onunMuttefikleri.map((x) => (oyun.aktorler[x] ? oyun.aktorler[x].ad : x)),
        // Bana savaş açmış müttefiki var mı — zincir kuralının görünen yüzü.
        benimleSavasan: onunMuttefikleri.some((x) => benimDusmanlar.has(x)),
        benimMuttefikim: benimMuttefikler.has(t.id),
        sebep:
          durum === 'savas'
            ? ateskes.ok
              ? null
              : ateskes.sebep
            : ittifak.ok
              ? null
              : ittifak.sebep,
      };
    });
  }, [oyun]);

  // ---- ORDULARIM (Görev 12 / Adım 10 · Baki'nin isteği) ----
  //
  // Geç turlarda 20+ bölgeyle oynarken "nerede kaç askerim var" sorusunun cevabı YOKTU:
  // haritayı gezip parça parça bakmak gerekiyordu. Bu memo bütün orduları tek listeye
  // indiriyor — yeni hesap yok, `parcaOrdusu` ve `yaraliAl` zaten vardı.
  //
  // Sıra: ÖNCE CEPHEDEKİLER (düşman komşusu olanlar), sonra büyükten küçüğe. Oyuncunun
  // aradığı şey neredeyse her zaman "cephede kim var".
  const ordularim = useMemo(() => {
    const ben = oyun.oyuncuAktorId;
    const emirliler = new Set((oyun.emirler || []).map((e) => e.kaynak));
    const satirlar = [];

    for (const pid of Object.keys(oyun.ordular || {})) {
      const o = oyun.ordular[pid];
      if (!o || o.sahip !== ben) continue;
      const adet = birimSayisi(o.birimler);
      if (adet === 0) continue;

      const cephede = (KOMSULUK[pid] || []).some(
        (k) => oyun.parcaSahipligi[k] && oyun.parcaSahipligi[k] !== ben
      );
      const yarali = birimSayisi(yaraliAl(o));
      satirlar.push({
        id: pid,
        ad: parcaTamAdi(pid),
        adet,
        yarali,
        cephede,
        emirli: emirliler.has(pid),
        dokum: DENGE.BIRIM_SIRASI.filter((t) => (o.birimler || {})[t] > 0).map((t) => ({
          tur: t,
          ad: DENGE.BIRIMLER[t].ad,
          sayi: o.birimler[t],
        })),
      });
    }

    satirlar.sort(
      (a, b) =>
        (b.cephede ? 1 : 0) - (a.cephede ? 1 : 0) || b.adet - a.adet || (a.id < b.id ? -1 : 1)
    );
    return {
      satirlar,
      toplamBirlik: satirlar.reduce((t, x) => t + x.adet, 0),
      toplamYarali: satirlar.reduce((t, x) => t + x.yarali, 0),
      cephedeki: satirlar.filter((x) => x.cephede).length,
    };
  }, [oyun]);

  // Maç sonu istatistiği — sayaçlardan (Görev 12).
  const macIstatistigi = useMemo(() => macOzeti(oyun), [oyun]);

  // ---- GÜÇ SIRALAMASI (Görev 12 · Baki: "illerin sıralaması gibi bir güç ölçeği") ----
  // Hesap `oyun/guc.js`'te; burada yalnızca oyuncunun kendi sırası ekleniyor. Tur başına
  // BİR KEZ hesaplanıyor: satır satır çağrılsaydı 81 aktör × 181 parça taraması olurdu.
  const gucListesi = useMemo(() => {
    const liste = gucSiralamasi(oyun);
    const benim = liste.find((x) => x.id === oyun.oyuncuAktorId);
    return {
      satirlar: liste,
      benimSiram: benim ? benim.sira : null,
      toplam: liste.length,
    };
  }, [oyun]);

  // ---- İTTİFAK HARİTASI (Görev 12) ----
  // Harita "ittifak" tipinde parçayı SAHİBİNİN SANA GÖRE DURUMUNA boyuyor. Eşleme burada
  // kuruluyor çünkü ilişki bir oyun bilgisi; `Harita.js` yalnızca hazır tabloyu okuyor
  // (CLAUDE.md §3: ekranda oyun kuralı bulunmaz).
  const ittifakDurumlari = useMemo(() => {
    const ben = oyun.oyuncuAktorId;
    const tablo = {};
    for (const id of Object.keys(oyun.aktorler)) {
      tablo[id] =
        id === ben
          ? 'ben'
          : ittifakMi(oyun, ben, id)
            ? 'ittifak'
            : savastaMi(oyun, ben, id)
              ? 'savas'
              : 'tarafsiz';
    }
    return tablo;
  }, [oyun]);

  const diplomasiBilgisi = useMemo(
    () => ({
      ittifakSayisi: muttefikler(oyun, oyun.oyuncuAktorId).length,
      enCokIttifak: DENGE.DIPLOMASI.EN_COK_ITTIFAK,
      ihanetKalan: ihanetKalanTur(oyun, oyun.oyuncuAktorId),
      savasSayisi: dusmanlar(oyun, oyun.oyuncuAktorId).length,
      teklifler: (oyun.teklifler || []).map((t) => ({
        ...t,
        ad: oyun.aktorler[t.kimden] ? oyun.aktorler[t.kimden].ad : t.kimden,
      })),
    }),
    [oyun]
  );

  // OYUNCUNUN TEKLİFİ ANINDA CEVAPLANIYOR: karşı taraf da bir puan hesabı ve `sira.js`
  // yapay zekâ için aynısını yapıyor. Bekletmek, kayda bir "giden teklif" kuyruğu eklemek
  // ve oyuncuyu bir tur boş beklemek zorunda bırakmak olurdu.
  const teklifVer = useCallback(
    (hedefId, tip) => {
      setOyun((o) => {
        const g = teklifGecerliMi(o, o.oyuncuAktorId, hedefId, tip);
        if (!g.ok) {
          diplomasiBildir(hedefId, g.sebep, false);
          return o;
        }
        const ad = o.aktorler[hedefId] ? o.aktorler[hedefId].ad : hedefId;
        const kisilik = (o.kisilikler || {})[hedefId];
        if (!teklifKabulMu(o, hedefId, o.oyuncuAktorId, tip, kisilik)) {
          diplomasiBildir(
            hedefId,
            ad + ' teklifini geri çevirdi.',
            false,
            retSebebi(o, hedefId, o.oyuncuAktorId, tip, kisilik)
          );
          return o;
        }
        const s2 = teklifUygula(o, o.oyuncuAktorId, hedefId, tip);
        if (!s2.ok) {
          diplomasiBildir(hedefId, s2.sebep, false);
          return o;
        }
        diplomasiBildir(
          hedefId,
          tip === 'ittifak' ? ad + ' ile anlaştın.' : ad + ' ile ateşkes yapıldı.',
          true
        );
        return s2.durum;
      });
    },
    [diplomasiBildir]
  );

  // SAVAŞ İLANI GERİ ALINAMAZ İŞ: onayı App.js soruyor (ittifak bozmanın kalıbı).
  // Teklif DEĞİL — karşı tarafın kabulü yok, anında işliyor.
  const savasIlan = useCallback(
    (hedefId) => {
      setOyun((o) => {
        const s2 = savasIlanEt(o, o.oyuncuAktorId, hedefId);
        if (!s2.ok) {
          diplomasiBildir(hedefId, s2.sebep, false);
          return o;
        }
        const ad = (x) => (o.aktorler[x] ? o.aktorler[x].ad : x);
        // Zincir yayıldıysa oyuncu bunu ÖNCEDEN değil, olduğu anda öğrenmeli: müttefikleri
        // yüzünden kaç cephe birden açıldığı kararın asıl bedeli.
        const zincir = s2.olaylar.filter((x) => x.tip === 'zincir').map((x) => ad(x.b));
        diplomasiBildir(
          hedefId,
          ad(hedefId) +
            ' ile savaştasın.' +
            (zincir.length ? ' Müttefikleri de karşına geçti: ' + zincir.join(', ') + '.' : ''),
          false
        );
        return s2.durum;
      });
    },
    [diplomasiBildir]
  );

  // İTTİFAKI BOZMAK GERİ ALINAMAZ İŞ: onayı App.js soruyor (projenin onay kuralı).
  const ittifakiBoz = useCallback(
    (hedefId) => {
      setOyun((o) => {
        const s2 = ittifakBoz(o, o.oyuncuAktorId, hedefId);
        if (!s2.ok) {
          diplomasiBildir(hedefId, s2.sebep, false);
          return o;
        }
        const ad = o.aktorler[hedefId] ? o.aktorler[hedefId].ad : hedefId;
        diplomasiBildir(
          hedefId,
          ad +
            ' ile anlaşmayı bozdun. ' +
            DENGE.DIPLOMASI.IHANET_SURESI +
            ' tur diplomasi yapamazsın.',
          false
        );
        return s2.durum;
      });
    },
    [diplomasiBildir]
  );

  // Gelen teklifin cevabı. Cevaplanan kart listeden düşüyor — ekranda kalmamalı.
  // Cevap iki yerden gelebiliyor: panelin MASADAKİ TEKLİFLER bölümü ve (panel kapalıyken)
  // haritadaki onay kartı. İkisi de bu tek fonksiyondan geçiyor.
  const teklifCevapla = useCallback(
    (kimden, tip, kabul) => {
      setOyun((o) => {
        const kalan = (o.teklifler || []).filter((t) => !(t.kimden === kimden && t.tip === tip));
        const ad = o.aktorler[kimden] ? o.aktorler[kimden].ad : kimden;
        if (!kabul) {
          diplomasiBildir(kimden, ad + ' teklifini geri çevirdin.', false);
          return { ...o, teklifler: kalan };
        }
        const s2 = teklifUygula(o, kimden, o.oyuncuAktorId, tip);
        if (!s2.ok) {
          diplomasiBildir(kimden, s2.sebep, false);
          return { ...o, teklifler: kalan };
        }
        diplomasiBildir(
          kimden,
          tip === 'ittifak' ? ad + ' ile anlaştın.' : ad + ' ile ateşkes yapıldı.',
          true
        );
        return { ...s2.durum, teklifler: kalan };
      });
    },
    [diplomasiBildir]
  );

  // ---- KAYIT VE ÇERÇEVE (Görev 09 / Adım 6) ----
  //
  // ⚠ OYUN DURUMU YALNIZCA İKİ YERDE KURULUYOR: yeni maç başlarken (`macBaslat`) ve yuva
  // yüklenirken (`yuvayiYukle`). Görev belgesi §10/8 bunu "bu görevin en olası sessiz
  // hatası" ilan etti: yanlış yapılırsa oyun ÇÖKMEZ, sessizce yanlış maçı yükler.
  // Üçüncü bir kurulum yolu eklenirse o uyarı geçerliliğini yitirir.
  const [aktifYuva, setAktifYuva] = useState(0);
  // Kaçıncı maç kuruldu (yeni maç, yükleme, eğitim) — açılış kamerası buna bakıp oyuncunun
  // iline süzülüyor (GOREV-20 Adım 4). Kayda girmez.
  const [macSayaci, setMacSayaci] = useState(0);
  const [yuvaOzeti, setYuvaOzeti] = useState([]);
  const [devamYuvasi, setDevamYuvasi] = useState(null);

  const yuvalariTazele = useCallback(async () => {
    setYuvaOzeti(await yuvaOzetleri());
    setDevamYuvasi(await sonYuva());
  }, []);

  // KAYIT SİLME (Görev 12 · Harekât Arşivi'ndeki çöp kutusu). GERİ ALINAMAZ İŞ: onayı
  // App.js soruyor — ittifak bozmanın ve üstüne yazmanın kalıbı. Buradaki iş yalnızca
  // silmek ve listeyi tazelemek; liste tazelenmezse silinen maç ekranda durmaya devam
  // eder ve oyuncu silinmediğini sanır.
  const yuvayiSil = useCallback(
    async (yuva) => {
      await kaydiSil(yuva);
      await yuvalariTazele();
      return true;
    },
    [yuvalariTazele]
  );

  // Bildirimde dosya boyutu YOK (Görev 20 / Adım 0, CLAUDE.md §5/10): "22 KB" oyuncuya bir
  // şey anlatmıyor. Boyut `s.boyutKB`'de duruyor; ölçüm ve testler onu okumaya devam ediyor.
  const kaydetEylem = useCallback(async () => {
    if (oyun.egitim) return; // eğitim hiçbir yuvaya yazılmaz
    const s = await kaydet(oyun, aktifYuva);
    setHaber({
      mesaj: s.ok ? aktifYuva + 1 + '. maça kaydedildi · tur ' + oyun.tur : s.hata,
      iyi: s.ok,
    });
  }, [oyun, aktifYuva]);

  // ---- OTOMATİK KAYIT (Görev 20 · DENETIM-2026-09-23 ⛔1) ----
  //
  // Oyun yalnızca elle kaydediliyordu (ayar menüsü, KAYDET VE ÇIK). Telefon arka plandaki
  // oyunu kapatınca son kayıttan sonraki bütün turlar gidiyordu — Age of History 3'ün en
  // sert yorumlarının konusu. Artık üç anda SESSİZCE kaydediliyor:
  //   1. maç başlar başlamaz (yeni maç eskiden yalnızca bellekteydi),
  //   2. her tur bitince,
  //   3. uygulama arka plana geçerken.
  //
  // ⚠ YALNIZCA MAÇIN KENDİ YUVASINA (`aktifYuva`). Age of History'nin "otomatik kayıt öteki
  // kaydı sildi" hatasına düşülmesin: başka yuvaya asla dokunulmuyor.
  // ⚠ YALNIZCA MAÇ OYNANIRKEN (`macAktif`). Uygulama menüyle açılıyor ve bellekteki ilk
  // "oyun" hiçbir yuvaya ait değil; menüdeyken arka plana geçmek 1. yuvayı o boş maçla
  // ezerdi. "Kaydetmeden çık" da aynı sebeple otomatik kaydı durdurur (`mactanCik`).
  const macAktif = useRef(false);
  const sonOyun = useRef(oyun);
  const sonYuvaRef = useRef(aktifYuva);
  useEffect(() => {
    sonOyun.current = oyun;
    sonYuvaRef.current = aktifYuva;
  }, [oyun, aktifYuva]);
  const sessizKaydet = useCallback(() => {
    if (!macAktif.current) return;
    kaydet(sonOyun.current, sonYuvaRef.current);
  }, []);
  // 2) Tur bitince. (Yeni tur = yeni tur numarası; yükleme de tur değiştirir, aynı kaydı
  // geri yazmak zararsız.)
  useEffect(() => {
    sessizKaydet();
  }, [oyun.tur, sessizKaydet]);
  // 3) Arka plana geçerken.
  useEffect(() => {
    const abone = AppState.addEventListener('change', (d) => {
      if (d !== 'active') sessizKaydet();
    });
    return () => abone.remove();
  }, [sessizKaydet]);
  // Menüye dönülürken (App.js): otomatik kayıt durur.
  const mactanCik = useCallback(() => {
    macAktif.current = false;
  }, []);

  const yuvayiYukle = useCallback(async (yuva) => {
    const s = await yukle(yuva);
    if (!s.ok) {
      setHaber({ mesaj: s.hata, iyi: false });
      return false;
    }
    macAktif.current = true;
    setOyun(s.durum);
    setAktifYuva(yuva);
    setMacSayaci((n) => n + 1);
    setHaber({ mesaj: 'Yüklendi · tur ' + s.durum.tur, iyi: true });
    return true; // ekran seçimi temizlesin: yüklenen oyunun kapsamı farklı olabilir
  }, []);

  const yukleEylem = useCallback(() => yuvayiYukle(aktifYuva), [yuvayiYukle, aktifYuva]);

  // Yeni maç. Boş yuvaya gider; hepsi doluysa üzerine yazılacak yuvanın onayını App.js sorar.
  const macBaslat = useCallback(
    ({ mod, kapsam, zorluk, ilKodu }, yuva) => {
      const hedefYuva = yuva === undefined || yuva === null ? aktifYuva : yuva;
      // `ilKodu` OYUNCUNUN SEÇTİĞİ BAŞLANGIÇ İLİ (2026-08-01). Sekiz görevdir kapsamın
      // `varsayilanOyuncu`su kullanılıyordu ve oyuncu hiç seçemiyordu; artık il seçim
      // ekranından geliyor. Verilmezse eski davranış sürüyor (varsayılana düşer).
      const yeni = oyunKur({ senaryo: kapsam, mod, zorluk, oyuncuAktorId: ilKodu });
      setOyun(yeni);
      setAktifYuva(hedefYuva);
      // 1) Maç başlar başlamaz kendi yuvasına (otomatik kayıt, yukarıda). Dolu yuvanın
      // üstüne yazma onayını App.js bu çağrıdan ÖNCE soruyor.
      macAktif.current = true;
      kaydet(yeni, hedefYuva);
      setMacSayaci((n) => n + 1);
      return true;
    },
    [aktifYuva]
  );

  // ---- EĞİTİM (GOREV-20 Adım 8 · `oyun/egitim.js`) ----
  // Üçüncü bir kurulum yolu — ama YUVASIZ: `macAktif` kapalı kalıyor, yani otomatik kayıt
  // hiçbir yuvaya dokunmuyor; elle kaydetmek de kapalı (`kaydetEylem`). Oyuncunun kayıtlı
  // maçları eğitimden etkilenmez. Eğitimden çıkış `mactanCik` (menü) ile.
  const egitimBaslat = useCallback(() => {
    macAktif.current = false;
    setOyun(egitimKur());
    setMacSayaci((n) => n + 1);
    return true;
  }, []);

  // ---- GELİŞTİRİCİ ARAÇLARI (yayın sürümünde kapalı) ----
  // Muharebe Görev 05'te geliyor; o zamana kadar sahiplik elle değiştirilebilmeli.
  // Hepsi ÖNCE parçanın varlığını sorar: düğmeler yalnızca panel açıkken görünüyor ama
  // koruma burada dursun — `PARCALAR[null].kod` çökme sebebidir, çağıranın dikkatine
  // bırakılmamalı.
  const gelistirici = useMemo(
    () => ({
      parcayiAl: (pid) => PARCALAR[pid] && setOyun((o) => parcayiVer(o, pid, o.oyuncuAktorId)),
      iliAl: (pid) =>
        PARCALAR[pid] && setOyun((o) => iliVer(o, PARCALAR[pid].kod, o.oyuncuAktorId)),
      parcayiGeriVer: (pid) => PARCALAR[pid] && setOyun((o) => parcayiEskiHaline(o, pid)),
      iliGeriVer: (pid) => PARCALAR[pid] && setOyun((o) => iliEskiHaline(o, PARCALAR[pid].kod)),
    }),
    []
  );

  return {
    oyun,
    oyuncu,
    kapsam,
    gelir,
    ozet,
    parcaRozetleri,
    ilRozetleri,
    bekleyenOrdu,
    butce,
    birimStatlari,
    arastirma,
    arastirmayaAyir,
    dalYukselt,
    yukseltmeyiGeriAl,
    toplan,
    uretimHakki,
    uret,
    emirOklari,
    emirOzetleri,
    hedefler,
    hareketBilgisi,
    hamleHedefleri,
    orduKaynagiMi,
    hamleTahmini,
    reddet,
    emirVer,
    emirIptal,
    turRaporu,
    oyunSonu,
    hedef,
    // ---- DİPLOMASİ VE ÇERÇEVE (Görev 09) ----
    diplomasiSatirlari,
    diplomasiBilgisi,
    gucListesi,
    ittifakDurumlari,
    ordularim,
    muhurler,
    yeniMuhurler,
    muhurleriTazele,
    yeniMuhurleriTemizle,
    macIstatistigi,
    teklifVer,
    ittifakiBoz,
    savasIlan,
    teklifCevapla,
    // Diplomasi ekranının satırında duran cevap (Görev 12 / Adım 1).
    diplomasiCevabi,
    diplomasiCevabiTemizle,
    aktifYuva,
    yuvaOzeti,
    devamYuvasi,
    yuvalariTazele,
    yuvayiSil,
    yuvayiYukle,
    macBaslat,
    mactanCik,
    macSayaci,
    // EĞİTİM (GOREV-20 Adım 8): bu maç eğitim mi, ve onu başlatan kapı.
    egitim: !!oyun.egitim,
    egitimBaslat,
    turIsleniyor,
    // ---- SAHNE VE AYARLAR (Görev 08) ----
    sahne,
    sahneKarti,
    gunlukOzetleri, // bu tur yapılanlar (emir listesinin yerini aldı)
    rutbe, // oyuncunun kariyeri — mühürlerden türetiliyor (Görev 16 / Adım 3)
    // ---- KOMUTAN (Görev 16 / Adım 6) ----
    komutan: komutanBilgisi,
    komutanAta: komutanAtaEylem,
    komutanAtamaDurumu,
    komutanBuradaMi,
    // ÖDÜLLER (Görev 19): düğmeleri SDK ile gelecek, kurallar bugünden yerinde.
    odulGeriAl,
    odulCasus,
    odulSeferberlik,
    kalanOdul: kalanOdul(oyun),
    // Seçilen kuvvetin ekranda okunacak hâli ("2 piyade · 1 zırhlı"). Ekran `oyun/`
    // klasöründen ithal yapmasın diye kancadan geçiyor (CLAUDE.md §3 katman sınırı).
    dokum: orduDokumu,
    raporHazir, // gösteri bitince artıyor — App raporu o an açıyor
    ayarlar,
    ayarDegistir,
    yeniOyun: yeniOyunEylem,
    zorluk: oyun.zorluk,
    zorlukKademeleri: DENGE.ZEKA.ZORLUK_SIRASI.map((a) => ({
      anahtar: a,
      ad: DENGE.ZEKA.ZORLUK[a].ad,
    })),
    zorlukSec: zorlukSecEylem,
    turuBitir: turuBitirEylem,
    kaydet: kaydetEylem,
    yukle: yukleEylem,
    gelistirici,
    haber,
    haberiKapat,
  };
}

// Seçili parçanın panel bilgisi. `secili` null ise hepsi null döner ve hiçbir hesap
// çalışmaz — panel kapalıyken bedel ödenmesin.
// Tur raporunun başlık özeti — oyuncunun gözünden (bkz. turRaporu). Saldırdığı ve savunduğu
// muharebeler, kazandıkları, aldığı ve kaybettiği bölgeler, iki tarafın kaybı.
function benimOzetim(satirlar, ben) {
  const o = {
    muharebe: 0,
    kazanilan: 0,
    fetih: 0,
    kaybedilenBolge: 0,
    ilTamamlandi: 0,
    kendiKaybi: 0,
    dusmanKaybi: 0,
  };
  for (const s of satirlar) {
    const savundum = !!s.aktorId && s.aktorId !== ben;
    if (s.fethedildi) {
      if (savundum) o.kaybedilenBolge++;
      else {
        o.fetih++;
        if (s.ilTamamlandi) o.ilTamamlandi++;
      }
    }
    if (s.tip !== 'muharebe') continue;
    o.muharebe++;
    if (s.kazanan === (savundum ? 'savunan' : 'saldiran')) o.kazanilan++;
    const cekilen = (taraf) => (s.cekilme && s.cekilme.taraf === taraf ? s.cekilme.kayip : 0);
    const saldiranKaybi = (s.saldiranKayip || 0) + cekilen('saldiran');
    const savunanKaybi = (s.savunanKayip || 0) + cekilen('savunan');
    o.kendiKaybi += savundum ? savunanKaybi : saldiranKaybi;
    o.dusmanKaybi += savundum ? saldiranKaybi : savunanKaybi;
  }
  return o;
}

export function useSeciliParca(oyun, secili, kapsam) {
  const parca = secili ? PARCALAR[secili] : null;

  // TANIDIKLAR (Görev 12 / Adım 2): karakter yalnızca tanıdığın devletlerde yazılıyor
  // (Baki'nin kararı). Süzgeç diplomasinin kendi süzgeci — ikinci bir "tanıdık" tanımı
  // yazılmıyor (§10/4). Bir kez hesaplanıyor: seçim değişince değil, oyun değişince.
  const tanidikKumesi = useMemo(
    () => new Set(tanidiklar(oyun, oyun.oyuncuAktorId).map((t) => t.id)),
    [oyun]
  );

  const sahip = useMemo(() => {
    if (!secili) return null;
    const id = oyun.parcaSahipligi[secili];
    const a = oyun.aktorler[id];
    if (!a) return null;
    return {
      ad: a.ad,
      renk: a.renk,
      benimMi: id === oyun.oyuncuAktorId,
      // Kendi karakterin yazılmıyor: oyuncunun huyu yok, kararları kendisi veriyor.
      karakter:
        id === oyun.oyuncuAktorId || !tanidikKumesi.has(id)
          ? null
          : karakterAdi((oyun.kisilikler || {})[id]),
      // LİDER (Görev 16 / Adım 2) karakterle AYNI SÜZGEÇTEN geçiyor: tanımadığın ilin
      // başında kimin olduğunu da bilmiyorsun. İkinci bir "tanıdık" tanımı yazılmıyor.
      lider:
        id === oyun.oyuncuAktorId || !tanidikKumesi.has(id)
          ? null
          : liderAdi(oyun.rastgele.tohum, id, (oyun.kisilikler || {})[id]).tamAd,
    };
  }, [secili, oyun, tanidikKumesi]);

  // Ordunun panel dökümü — rozet sayıyı, panel karışımı gösterir (§7.2).
  // `sayi` ve `dokum` MEVCUDU gösterir, kadroyu değil (Görev 06 §9/4). Eksik varsa ayrı
  // satırda yazılıyor; kadroyu mevcut yerine yazmak bu görevin en olası sessiz hatasıydı.
  const ordu = useMemo(() => {
    const o = secili ? parcaOrdusu(oyun, secili) : null;
    if (!o) return null;
    const statlar = aktorStatlari(oyun, o.sahip);
    const eksik = eksikKadro(o);
    const yarali = yaraliAl(o);
    const saglam = saglamBirimler(o);
    return {
      sayi: birimSayisi(o.birimler),
      dokum: orduDokumu(o.birimler),
      satirlar: DENGE.BIRIM_SIRASI.filter((t) => o.birimler[t] > 0).map((t) => ({
        anahtar: t,
        sayi: o.birimler[t],
        yarali: yarali[t] || 0,
        ...statlar[t],
      })),
      // TOPARLANMA (Görev 06 + 2026-07-31 yaralı durumu).
      // ÜÇ AYRI SAYI, karıştırılmamalı:
      //   saglamSayi → savaşabilecek birlikler
      //   yaraliSayi → sahada ama zayıf; toparlanma bunları iyileştirir
      //   eksikSayi  → ölenler; toparlanma yerlerine yenisini getirir
      saglamSayi: birimSayisi(saglam),
      yaraliSayi: birimSayisi(yarali),
      yaraliDokum: eksikDokumu(yarali),
      eksik: birimSayisi(eksik) > 0 ? eksik : null,
      eksikDokum: eksikDokumu(eksik),
      eksikSayi: birimSayisi(eksik),
      toparlanabilir: birimSayisi(eksik) > 0 || birimSayisi(yarali) > 0,
      toplanmaBedeli: toplanmaMaliyeti(
        eksik,
        yarali,
        seferberlikBedava(aktorArastirmasi(oyun, oyun.oyuncuAktorId))
      ),
    };
  }, [secili, oyun]);

  // Parçanın getirisi yalnızca haritaya bağlı, oyun durumuna değil — ama yine de her
  // çizimde yeniden hesaplanmasın.
  const gelirParca = useMemo(() => (secili ? parcaGeliri(secili) : null), [secili]);

  const ilDagilim = useMemo(
    () => (parca ? ilSahiplikDagilimi(oyun, parca.kod) : null),
    [parca, oyun]
  );
  const ilGelirim = useMemo(
    () => (parca ? ilGeliri(oyun, parca.kod, oyun.oyuncuAktorId) : null),
    [parca, oyun]
  );

  // Kapsam dışı komşular listelenmez (dokunulunca gidilemeyecek yeri gösterme).
  const komsuListe = useMemo(() => {
    if (!secili) return [];
    return komsular(secili)
      .filter((pid) => kapsam.has(pid))
      .map((pid) => ({ pid, ad: parcaTamAdi(pid) }));
  }, [secili, kapsam]);

  // Haritada komşuları vurgulamak için (liste değil küme).
  const komsuKume = useMemo(() => (secili ? new Set(komsular(secili)) : null), [secili]);

  // ---- HAREKET (Görev 05) ----
  // Panelin eylem düğmeleri yalnızca EMREDİLECEK BİRİM VARSA çıkar: ordusu olan ama hepsini
  // bu tur çoktan yollamış bir parçada düğmenin sönük durması yerine hiç görünmemesi daha
  // az kafa karıştırıyor.
  //
  // İKİ AYRI EYLEM (2026-07-30): ASKER TAŞI (kendi parçana takviye) ve SALDIR (başkasının
  // parçasına). Her biri yalnızca GİDİLECEK YER VARSA çıkıyor — kendi içinde kapalı bir
  // bölgede "SALDIR" düğmesi görünmüyor, sınır parçasında ikisi birden görünüyor.
  const eylem = useMemo(() => {
    if (!secili) return { emredilebilir: 0, tasinabilir: 0, saldirilabilir: 0 };
    const emredilebilir = birimSayisi(kullanilabilirBirimler(oyun, secili));
    if (emredilebilir === 0) return { emredilebilir: 0, tasinabilir: 0, saldirilabilir: 0 };
    const a = hedefleriAyir(oyun, oyun.oyuncuAktorId, secili);
    return { emredilebilir, tasinabilir: a.dost.length, saldirilabilir: a.dusman.length };
  }, [secili, oyun]);

  // Bu parçadan verilmiş emirler — panelde iptal düğmeleriyle listeleniyor.
  // `saldiri` sahipliğe göre: hedef parça senin değilse saldırıdır (ordusu olmasa da).
  const emirlerim = useMemo(() => {
    if (!secili) return [];
    return parcaninEmirleri(oyun, secili).map((e) =>
      e.tip === 'toplanma'
        ? { sira: e.sira, hedefAd: 'yerinde toplanma', dokum: toparlanmaDokumu(e) }
        : {
            sira: e.sira,
            hedefAd: parcaTamAdi(e.hedef),
            dokum: orduDokumu(e.birimler),
            saldiri: oyun.parcaSahipligi[e.hedef] !== e.sahip,
          }
    );
  }, [secili, oyun]);

  // Bu parçaya bu tur toplanma emri verilmiş mi — panelin düğmesi buna göre pasifleşiyor.
  const toplanmaEmriVarMi = useMemo(
    () => (secili ? toplanmaEmriVar(oyun, secili) : false),
    [secili, oyun]
  );

  return {
    parca,
    il: parca ? illerData[parca.kod] : null,
    sahip,
    gelirParca,
    ordu,
    ilDagilim,
    ilGelirim,
    komsuListe,
    komsular: komsuKume,
    eylem,
    emirlerim,
    toplanmaEmriVar: toplanmaEmriVarMi,
  };
}
