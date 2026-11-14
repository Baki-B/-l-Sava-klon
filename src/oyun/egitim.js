// EĞİTİM — ilk maç, metinsiz (GOREV-20 Adım 8 · §4.6, §12.3/3).
//
// Baki (2026-09-23): *"sezgilerle anlayarak ve deneyimleyerek öğrensem daha iyi."* Eğitim bir
// kurallar sayfası DEĞİL, küçük bir maç: Marmara, sen Bursa, sabit tohum. Her adımda haritada
// ya da bir düğmede tek bir parıltı ve en çok iki kelime. Oyuncu kuralı yaparak öğrenir:
//
//   ORDUNA DOKUN → HEDEFE DOKUN → ASKER SEÇ → TEKRAR DOKUN (ilk fetih) → ASKER BAS → TURU BİTİR
//
// Bu dosya iki şey yapıyor ve ikisi de saf (React yok, Node'da test ediliyor):
//   1. `egitimKur`   — eğitim maçının başlangıç durumu. Normal kurulum + dört küçük dokunuş.
//   2. `egitimAdimi` — o anki durumdan sıradaki adımı çıkarır. Adımlar SAYAÇLA değil DURUMLA
//      ilerliyor: oyuncu bir adımı atlarsa, geri dönerse ya da saldırısı başarısız olursa
//      eğitim kendiliğinden doğru adıma döner. Ekran (`App.js`) yalnızca parıltıyı çizer.
//
// ⚠ EĞİTİM KAYDA GİRMEZ: hiçbir yuvaya yazılmaz, otomatik kayıt da kapalıdır
// (`oyunKancasi.js egitimBaslat`). Oyuncunun kayıtlı maçlarına dokunmaz.

import { DENGE } from '../denge.js';
import { oyunKur } from './oyunDurumu.js';
import { savasBasla } from './diplomasi.js';
import { PARCALAR } from './veri.js';

const E = DENGE.EGITIM;

// Eğitim maçının başlangıcı. Normal `oyunKur`un üstüne dört dokunuş (sayılar DENGE.EGITIM'de):
//   • hedefin sahibiyle SAVAŞ hâli — barış varsayılan; ilk dersi diplomasi ekranına
//     götürmemek için savaş baştan açık (haritada kırmızı dişli cephe hattı da bunu gösteriyor),
//   • kaynak ordu güçlü, hedefte tek piyade — ilk saldırı "KAZANIRSIN" desin,
//   • ilk turda asker basabilecek kadar bütçe — normal maç sıfır havuzla başlıyor.
export function egitimKur() {
  const d0 = oyunKur({
    senaryo: E.KAPSAM,
    oyuncuAktorId: E.OYUNCU,
    zorluk: E.ZORLUK,
    tohum: E.TOHUM,
  });
  const hedefSahibi = d0.parcaSahipligi[E.HEDEF];
  const d = savasBasla(d0, E.OYUNCU, hedefSahibi).durum;
  const oyuncu = d.aktorler[E.OYUNCU];
  return {
    ...d,
    // Eğitim işareti. Kancanın okuduğu tek alan: kayıt, otomatik kayıt ve mühür sınaması
    // bu maçta kapalı (`oyunKancasi.js`). Durum hiçbir yuvaya yazılmadığı için kayıt
    // biçimini (sürüm 19) etkilemiyor.
    egitim: true,
    aktorler: {
      ...d.aktorler,
      [E.OYUNCU]: { ...oyuncu, nufusHavuzu: E.HAVUZ.nufus, ekonomiHavuzu: E.HAVUZ.ekonomi },
    },
    ordular: {
      ...d.ordular,
      [E.KAYNAK]: { sahip: E.OYUNCU, birimler: { ...E.KAYNAK_ORDU } },
      [E.HEDEF]: { sahip: hedefSahibi, birimler: { ...E.HEDEF_ORDU } },
    },
  };
}

// Kameranın eğitimde açıldığı nokta: kaynak ile hedefin ortası (harita birimi).
export function egitimOdagi() {
  const a = PARCALAR[E.KAYNAK].etiket || PARCALAR[E.KAYNAK].merkez;
  const b = PARCALAR[E.HEDEF].etiket || PARCALAR[E.HEDEF].merkez;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Adımların sırası — ekrandaki ilerleme noktaları bu diziden sayılıyor.
export const EGITIM_ADIMLARI = ['ordu', 'hedef', 'asker', 'saldir', 'uret', 'tur'];

// SIRADAKİ ADIM. Girdi düz bir anlık görüntü (ekran ve kanca doldurur):
//   fetih        — hedef artık oyuncunun mu
//   kaynakHazir  — kaynak ordu şu an hedefe saldırabilir mi (hakkı var, savaştayız)
//   kaynakVar    — kaynakta hâlâ oyuncunun ordusu var mı
//   uretildi     — oyuncu eğitimde en az bir kez asker bastı mı
//   turBitti     — ilk fetih ve üretimden SONRA tur bitirildi mi
//   kipKaynak, emirHedefi — haritanın hamle kipi (App.js)
//   tahminKademe — seçili kuvvetin tahmini ('ustun' | 'denk' | 'zayif' | null)
//   uretimAcik   — üretim ekranı açık mı
// Dönen: { anahtar, parca?, dugme? } — `parca`: haritada halkalanacak bölge; `dugme`:
// parlayacak düğme ('tumu' | 'saldir' | 'askerBas' | 'uretEkrani' | 'turBitir').
// `anahtar: 'bitti'` → eğitim tamamlandı. `son: true` → bu tur bitince eğitim biter.
export function egitimAdimi(d) {
  // Kaynakta ordu kalmadıysa (oyuncu başka yere taşıdı, yenildi) fetih dersi atlanır:
  // eğitimin sonsuza dek "turu bitir" demesinden iyidir.
  const fetihBitti = d.fetih || !d.kaynakVar;
  if (!fetihBitti) {
    // Saldıramıyor (hakkı bitti — örneğin saldırı başarısız oldu): tur bitince hak tazelenir.
    if (!d.kaynakHazir) return { anahtar: 'tur', dugme: 'turBitir' };
    if (d.kipKaynak !== E.KAYNAK) return { anahtar: 'ordu', parca: E.KAYNAK };
    if (d.emirHedefi !== E.HEDEF) return { anahtar: 'hedef', parca: E.HEDEF };
    if (d.tahminKademe !== 'ustun') return { anahtar: 'asker', dugme: 'tumu' };
    return { anahtar: 'saldir', parca: E.HEDEF, dugme: 'saldir' };
  }
  if (!d.uretildi) {
    if (d.uretimAcik) return { anahtar: 'uret', dugme: 'uretEkrani' };
    if (d.kipKaynak === E.URETIM_PARCA) return { anahtar: 'uret', dugme: 'askerBas' };
    return { anahtar: 'uret', parca: E.URETIM_PARCA };
  }
  // `son`: eğitimin SON adımı — bu turu bitirmek eğitimi bitirir (yukarıdaki ara 'tur' değil).
  if (!d.turBitti) return { anahtar: 'tur', dugme: 'turBitir', son: true };
  return { anahtar: 'bitti' };
}
