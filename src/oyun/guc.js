// GÜÇ SIRALAMASI (Görev 12 · Baki: "genel bir illerin sıralaması gibi bir güç ölçeği
// olsun, diplomasi bölümünden görebilelim"). Formül Görev 20'de yeniden kuruldu.
//
// NEDEN AYRI DOSYA: sıralama bir DİPLOMASİ kuralı değil — diplomasi ekranında görünüyor
// ama savaş, mod ve yapay zekâ da aynı soruyu soruyor ("kim güçlü"). `diplomasi.js`'e
// konsaydı, ilerideki her kullanım oraya bağımlı olurdu.
//
// FORMÜL (gerekçesi ve ölçümü `DENGE.GUC`'te): güç = Türkiye'deki gücün yüzde kaçı sende.
//   puan = 100 × (ASKER × askeri pay + EKONOMI × gelir payı + TOPRAK × bölge payı)
//
// ⚠ YENİ KAYNAK ÜRETMİYOR. Üç bileşenin üçü de oyunun zaten tuttuğu şeyler: sahadaki
// sağlam birimler (araştırmalı statlarıyla), tur geliri, bölge sayısı.
//
// SIRALAMA GÖSTERGEDİR, KURAL DEĞİL. Hiçbir mekanik buna bakmıyor; kazanma koşulu hâlâ
// `mod.js`'te ve orası parça sayar. İkisi ayrışabilir ve bu bir hata değil — "en güçlü"
// olmak "kazanıyor olmak" demek değildir.

import { DENGE } from '../denge.js';
import { PARCALAR } from './veri.js';
import { birimSayisi, saglamBirimler } from './ordu.js';
import { aktorGeliri } from './uretim.js';
import { aktorStatlari } from './arastirma.js';

// Bir birim türünün savaş değeri: verdiği zarar × dayanabildiği zarar.
function savasDegeriHam(stat) {
  return (stat.agirVurus + stat.hafifVurus) * (stat.dayaniklilik + stat.zirh);
}
// Temel (araştırmasız) piyade = 1.
const PIYADE_DEGERI = savasDegeriHam(DENGE.BIRIMLER.piyade);

// Bir birim türünün, verilen stat tablosuyla (araştırma dahil) savaş değeri.
export function savasDegeri(statlar, tur) {
  return savasDegeriHam(statlar[tur]) / PIYADE_DEGERI;
}

// Tek geçişte bütün aktörlerin gücü. 81 aktör × 181 parça için tur başına bir kez
// çağrılmalı (ekran `useMemo` ile tutuyor); satır satır çağrılırsa 81 kat pahalı olur.
// Satır: { id, ad, parca, ordu (birim sayısı), askeri (savaş değeri), gelir, puan, sira }
export function gucSiralamasi(durum) {
  const G = DENGE.GUC;
  const parca = {};
  const ordu = {};
  const askeri = {};
  const statlar = {};

  for (const pid of Object.keys(durum.parcaSahipligi)) {
    const sahip = durum.parcaSahipligi[pid];
    if (!sahip) continue;
    parca[sahip] = (parca[sahip] || 0) + 1;
  }
  for (const pid of Object.keys(durum.ordular || {})) {
    const o = durum.ordular[pid];
    if (!o || !o.sahip) continue;
    ordu[o.sahip] = (ordu[o.sahip] || 0) + birimSayisi(o.birimler);
    const st = statlar[o.sahip] || (statlar[o.sahip] = aktorStatlari(durum, o.sahip));
    const saglam = saglamBirimler(o);
    let deger = 0;
    for (const tur of Object.keys(saglam)) deger += saglam[tur] * savasDegeri(st, tur);
    askeri[o.sahip] = (askeri[o.sahip] || 0) + deger;
  }

  const satirlar = [];
  for (const id of Object.keys(durum.aktorler)) {
    // ELENMİŞ AKTÖR SIRALAMADA YOK. Parçası kalmayan il oyunun dışındadır; listede
    // tutmak "0 güçle 40. sırada" gibi anlamsız bir satır üretirdi.
    if (!parca[id]) continue;
    const gelirim = aktorGeliri(durum, id);
    satirlar.push({
      id,
      ad: durum.aktorler[id] ? durum.aktorler[id].ad : id,
      parca: parca[id],
      ordu: ordu[id] || 0,
      askeri: askeri[id] || 0,
      gelir: (gelirim.nufus || 0) + (gelirim.ekonomi || 0),
    });
  }

  // Payların paydası: yaşayan bütün aktörlerin toplamı.
  const toplam = { askeri: 0, gelir: 0, parca: 0 };
  for (const x of satirlar) {
    toplam.askeri += x.askeri;
    toplam.gelir += x.gelir;
    toplam.parca += x.parca;
  }
  const pay = (x, t) => (t > 0 ? x / t : 0);
  for (const x of satirlar) {
    x.puan =
      100 *
      (G.ASKER * pay(x.askeri, toplam.askeri) +
        G.EKONOMI * pay(x.gelir, toplam.gelir) +
        G.TOPRAK * pay(x.parca, toplam.parca));
  }

  // Yüksek puan önce; eşitlikte kimlik — sıralama belirlenimci olmalı, yoksa ekran her
  // çizimde satırların yerini değiştirir.
  satirlar.sort((a, b) => b.puan - a.puan || (a.id < b.id ? -1 : 1));
  return satirlar.map((x, i) => ({ ...x, sira: i + 1 }));
}

// Bir aktörün sıradaki yeri — panelin "sen kaçıncısın" satırı için.
export function gucSirasi(siralama, aktorId) {
  const satir = siralama.find((x) => x.id === aktorId);
  return satir ? satir.sira : null;
}

// Parça kimliğinden ilin bölgesi — sıralamayı bölgeye göre süzmek isteyen ekran için.
// (Şimdilik kullanılmıyor.)
export function parcaBolgesi(parcaId) {
  const p = PARCALAR[parcaId];
  return p ? p.bolge : null;
}
