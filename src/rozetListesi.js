// ORDU ROZETİ LİSTELERİ — oyun durumundan haritada çizilecek rozetlere (Görev 20).
//
// NEDEN AYRI DOSYA. Bu iki liste `oyunKancasi.js`'in içindeydi (useMemo gövdeleri) ve orada
// doğruydu; tek kullanıcısı kancaydı. Skia haritası bilgisayarda da çizilebiliyor
// (`scripts/harita-skia-onizleme.js`) ve önizlemenin oyunun kurduğu listenin AYNISINI
// görmesi gerekiyor — ikinci bir kopya CLAUDE.md §5/5'in tuzağı olurdu. Kanca artık bu
// fonksiyonları çağırıyor; bağımlılıkları (`oyun.ordular`, komutanın yeri) değişmedi.
//
// Kural değişmedi (bkz. eski yorumlar, aynen taşındı):
//   • BOŞ ordu listeye girmez — "boş parçada rozet yok" (§7.2) ve performansın kaynağı.
//   • İl rozetinde sayı ilin TOPLAMI, renk EN ÇOK BİRİMİ OLANIN.
//   • Komutan işareti YALNIZCA OYUNCUNUN komutanı için (Görev 16 / Adım 6).
//   • Hamle hakkı (Görev 21) YALNIZCA OYUNCUNUN ordularında: `hak` = kalan / toplam (0–1).
//     Rakibin ordusunda alan yok — onun hakkı oyuncuyu ilgilendirmiyor.
//
// İl geometrisi (`veri/harita.json`) PARAMETRE olarak geliyor: Metro JSON'u `import` ile
// alıyor, Node'da `require` ile; ikisini bu dosyaya gömmek `oyun/veri.js`'in anlattığı
// sözdizimi tuzağı olurdu.

import { PARCALAR } from './oyun/veri.js';
import { AKTOR_RENKLERI } from './oyun/oyunDurumu.js';
import { birimSayisi, rozetYazisi, tumIlOrdulari, yaraliAl } from './oyun/ordu.js';
import { eksikKadro } from './oyun/toplanma.js';
import { YAZI_RENK } from './tema.js';
import { PARCA_KAYDIRMA, IL_KAYDIRMA } from './rozetKaydirma.js';
import { BIRIM_SIRASI } from './birimSekli.js';

// Parça rozetleri. `komutanParca`: oyuncunun komutanının parçası (yoksa null).
// `hakTablosu`: oyuncunun ordularının hamle hakkı (`hareket.js hamleHakkiTablosu`) ya da null.
export function parcaRozetListesi(ordular, komutanParca, hakTablosu) {
  const liste = [];
  for (const pid of Object.keys(ordular)) {
    const o = ordular[pid];
    const sayi = birimSayisi(o.birimler);
    if (sayi === 0) continue;
    const parca = PARCALAR[pid];
    const k = PARCA_KAYDIRMA[pid];
    liste.push({
      anahtar: 'p' + pid,
      x: parca.etiket.x,
      y: parca.etiket.y,
      dx: k ? k.dx : 0,
      dy: k ? k.dy : 0,
      yazi: rozetYazisi(sayi),
      renk: AKTOR_RENKLERI[o.sahip] || YAZI_RENK.ikincil,
      // Yıpranmış ordu çentiği (Görev 06): kadrosu mevcudundan büyük olan ordu.
      yipranmis: birimSayisi(eksikKadro(o)) > 0 || birimSayisi(yaraliAl(o)) > 0,
      // KOMUTAN İŞARETİ (Görev 16 / Adım 6) — yalnızca oyuncunun komutanı. Botlarınki de
      // gösterilseydi oyuncu 80 rakibin komutanının yerini bedavaya öğrenirdi (casus
      // raporu bunun için ödül istiyor).
      komutan: komutanParca === pid,
      // KADRO ŞERİDİ (Görev 20): yakınlaşınca kalkanın altında figür + sayı. Rakiplerde de
      // görünür (Baki, 2026-09-23: "gözüksün, casus raporunu boşver").
      kadro: kadroListesi(o.birimler),
      hak: hakOrani(hakTablosu && hakTablosu[pid]),
    });
  }
  return liste;
}

// { kalan, toplam } → 0–1; tablo satırı yoksa (rakip ordusu) undefined.
function hakOrani(satir) {
  if (!satir || satir.toplam <= 0) return undefined;
  return Math.min(1, satir.kalan / satir.toplam);
}

// Ordunun türlere göre dökümü, şeritteki sırayla; boş tür yok. [{ tur, yazi }]
export function kadroListesi(birimler) {
  const liste = [];
  for (const tur of BIRIM_SIRASI) {
    const n = (birimler && birimler[tur]) || 0;
    if (n > 0) liste.push({ tur, yazi: rozetYazisi(n) });
  }
  return liste;
}

// İl rozetleri. `komutanIl`: komutanın bulunduğu il (yoksa null) · `ilGeom`: harita.json `iller`.
// `hakTablosu` + `benId`: il rozeti oyuncunun rengindeyse halka, ildeki OYUNCU ordularının
// toplamından (başka sahiplerin askerleri orana girmez).
export function ilRozetListesi(ordular, komutanIl, ilGeom, hakTablosu, benId) {
  const toplamlar = tumIlOrdulari(ordular);
  const ilHak = {};
  for (const pid of Object.keys(hakTablosu || {})) {
    const kod = PARCALAR[pid].kod;
    const h = ilHak[kod] || (ilHak[kod] = { kalan: 0, toplam: 0 });
    h.kalan += hakTablosu[pid].kalan;
    h.toplam += hakTablosu[pid].toplam;
  }
  const liste = [];
  for (const kod of Object.keys(toplamlar)) {
    const etiket = ilGeom[kod].etiket;
    const k = IL_KAYDIRMA[kod];
    liste.push({
      anahtar: 'i' + kod,
      x: etiket.x,
      y: etiket.y,
      dx: k ? k.dx : 0,
      dy: k ? k.dy : 0,
      yazi: rozetYazisi(toplamlar[kod].toplam),
      // Birden çok sahip varsa EN ÇOK BİRİMİ OLANIN rengi; sayı ilin toplamı (§7.2).
      renk: AKTOR_RENKLERI[toplamlar[kod].baskinAktorId] || YAZI_RENK.ikincil,
      // Bu ilde toparlanmayı bekleyen ordu var mı — hangi parçada olduğu yakın katmanda.
      yipranmis: toplamlar[kod].yipranmis,
      // Komutan bu ilin herhangi bir parçasındaysa uzak katmanda da işaretli.
      komutan: komutanIl === kod,
      hak: toplamlar[kod].baskinAktorId === benId ? hakOrani(ilHak[kod]) : undefined,
    });
  }
  return liste;
}
