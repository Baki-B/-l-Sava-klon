// RÜTBE — oyuncunun kendi kariyeri (Görev 16 / Adım 3).
//
// ┌─ SAKLANMIYOR, TÜRETİLİYOR ──────────────────────────────────────────────────────────┐
// │ Rütbe kazanılan MÜHÜRLERDEN hesaplanıyor; ayrı bir "rütbe" kaydı tutulmuyor. Bu,     │
// │ projenin "il sahipliği saklanmaz, türetilir" kuralının aynısı (§6.2): iki kaynak     │
// │ olsaydı biri eskir ve oyuncu bir gün mühürleriyle uyuşmayan bir rütbe görürdü.       │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// RÜTBE OYUNA ETKİ ETMEZ. Ne muharebeye girer ne dengeye: maçtan bağımsız bir kariyer
// göstergesi. Baki'nin şartı buydu — *"ülke yöneticisi havası vermemeli, normal oyuncuyu
// yansıtacak olması yeter."*
//
// ---- PUAN ----
// Bronz 1 · Gümüş 2 · Altın 3 (`DENGE.RUTBE.PUAN`). Zor olan çok değer.
//
// ---- MAREŞAL ----
// Merdivende yok: BÜTÜN mühürler toplanınca gelen onur unvanı. Hedef sayısı koda
// yazılmıyor, mühür listesinden sayılıyor — liste büyürse hedef de büyür.

import { DENGE } from '../denge.js';
import { BASARIMLAR } from './basarimlar.js';

const R = DENGE.RUTBE;

// Bir mühür kimliğinin puanı. Tanımsız kademe 0 sayılır: yeni bir kademe eklenip puanı
// yazılmayı unutulursa rütbe sessizce şişmesin.
function muhurPuaniTek(basarim) {
  return (basarim && R.PUAN[basarim.kademe]) || 0;
}

// Bütün mühürlerin toplam puanı — rütbe tavanı. Listeden SAYILIYOR (koda yazılı değil).
export function tavanPuan() {
  let toplam = 0;
  for (const b of BASARIMLAR) toplam += muhurPuaniTek(b);
  return toplam;
}

// Kazanılmış mühürlerin puanı.
// `muhurler` biçimi `basarimKaydi.js`'ten gelir: { muhurId: zamanDamgasi }.
export function puanHesapla(muhurler) {
  const kazanilan = muhurler || {};
  let toplam = 0;
  for (const b of BASARIMLAR) if (kazanilan[b.id]) toplam += muhurPuaniTek(b);
  return toplam;
}

// Verilen puanın rütbesi ve bir sonrakine kalan.
//
// Dönen:
//   { sira, ad, puan, tavan, sonraki, kalan, muhur, toplamMuhur, onur }
//     sira        → 1'den başlayan kademe numarası (ekranda "3/14" yazmak için)
//     sonraki     → bir sonraki kademenin adı (tepedeyse null)
//     kalan       → sonraki kademeye kaç puan kaldı (tepedeyse 0)
//     onur        → bütün mühürler toplandıysa Mareşal unvanı, yoksa null
export function rutbeHesapla(muhurler) {
  const kazanilan = muhurler || {};
  const puan = puanHesapla(kazanilan);
  const kademeler = R.KADEMELER;

  let sira = 1;
  for (let i = 0; i < kademeler.length; i++) if (puan >= kademeler[i].esik) sira = i + 1;

  const simdiki = kademeler[sira - 1];
  const sonraki = sira < kademeler.length ? kademeler[sira] : null;

  const toplamMuhur = BASARIMLAR.length;
  const muhur = BASARIMLAR.filter((b) => kazanilan[b.id]).length;
  // ONUR UNVANI mühür SAYISINA bakıyor, puana değil: "hepsini topla" sözü sayıyla verildi.
  const onur = toplamMuhur > 0 && muhur >= toplamMuhur ? R.ONUR_UNVANI : null;

  return {
    sira,
    ad: simdiki.ad,
    puan,
    tavan: tavanPuan(),
    sonraki: sonraki ? sonraki.ad : null,
    kalan: sonraki ? Math.max(0, sonraki.esik - puan) : 0,
    muhur,
    toplamMuhur,
    onur,
  };
}

// Ekranda tek satır: "Yüzbaşı" ya da onur unvanı varsa "Mareşal".
// ⚠ İkisi birlikte YAZILMIYOR: Mareşal bir rütbe değil, rütbenin üstünde bir işaret.
export function rutbeYazisi(rutbe) {
  if (!rutbe) return '';
  return rutbe.onur || rutbe.ad;
}

// ---- KOMUTAN KADEMESİ (Görev 16 / Adım 6) ----
//
// Oyuncunun açabileceği EN YÜKSEK komutan kademesi. Rütbeyle aynı kaynaktan (mühürler)
// türetiliyor ama rütbeden BAĞIMSIZ: rütbe bir gösterge, kademe bir yetki.
//
// ⚠ BURASI MOTOR DEĞİL, MOTORUN DIŞI. `src/oyun/*` içinde duruyor çünkü saf bir
// fonksiyon (mühür nesnesi girer, sayı çıkar) ve Node ile test edilebiliyor — ama
// muharebe motoru bunu HİÇ çağırmıyor. Kanca çağırıp sonucu `komutanAta`ya veri olarak
// geçiyor. Motor mühür tanısaydı `denge-simulasyonu` çalışmaz, belirlenimcilik biterdi.
//
// Kademe 1 herkeste baştan açık: aksi hâlde komutan yeni oyuncuda hiç çalışmazdı.
export function kademeHakki(muhurler) {
  const oranlar = DENGE.KOMUTAN.KADEME_ORANLARI || [];
  const tavan = tavanPuan();
  if (tavan <= 0) return 1;
  const oran = puanHesapla(muhurler) / tavan;

  let hak = 1;
  for (let i = 0; i < oranlar.length; i++) if (oran >= oranlar[i]) hak = i + 2;
  return Math.min(hak, DENGE.KOMUTAN.EN_COK_KADEME);
}

// Bir sonraki kademeye kaç MÜHÜR PUANI kaldı (tepedeyse 0). Atama ekranı bunu yazıyor:
// kilitli bir kademe gören oyuncu "ne kadar kaldı" sorusunun cevabını görmeli.
export function kademeyeKalan(muhurler) {
  const oranlar = DENGE.KOMUTAN.KADEME_ORANLARI || [];
  const hak = kademeHakki(muhurler);
  if (hak >= DENGE.KOMUTAN.EN_COK_KADEME) return 0;
  const hedefOran = oranlar[hak - 1];
  if (hedefOran === undefined) return 0;
  return Math.max(0, Math.ceil(tavanPuan() * hedefOran - puanHesapla(muhurler)));
}
