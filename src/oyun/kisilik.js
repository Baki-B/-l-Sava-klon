// KİŞİLİK ÜRETİMİ (Görev 07 / Adım 4 — tasarım §9.4).
//
// NEDEN AYRI DOSYA: `zeka.js`'in içindeydi ve `oyunDurumu.js` onu çağırınca DÖNGÜ doğdu —
// oyunDurumu → zeka → oyunDurumu (zeka `kapsamdaMi` ve `aktorParcalari` kullanıyor).
// Görev 06'da aynısı yaşanmış ve `kadroAl` toplanma.js yerine ordu.js'e konmuştu; kural
// aynı: kayıt yapısını kuran şey, kuralları uygulayan şeye bağımlı olmamalı.
//
// Bu dosya YALNIZCA `denge.js` ve `rastgele.js` tanıyor. Oyun durumunu bilmiyor, bilmesine
// de gerek yok: kişilik aktör kimliklerinden ve tohumdan türeyen düz bir tablo.
//
// TOHUMDAN, BELİRLENİMCİ. İl verisinden sapma yok: aynı tohumla kurulan iki oyunda Konya
// hep aynı huyda olur (garnizon kararının aynısı, Görev 05 §6/4). Hata ayıklamanın ve
// "geçen sefer ne olmuştu" sorusunun şartı bu.

import { DENGE } from '../denge.js';
import { rastgeleKur } from './rastgele.js';

const Z = DENGE.ZEKA;

// Kişilik ağırlıkları iki haneye kısaltılıyor — kayıt dosyası 80 aktör × 4 ağırlıkla
// şişmesin (görev belgesi §6: "gerekirse kişilik ağırlıkları iki haneye kısaltılacak").
function kirp(x) {
  return Math.round(x * 100) / 100;
}

// ---- KARAKTER SEÇİMİ (Görev 12 / Adım 2) ----
// Karışım tablosundaki paylara göre tohumlu çekiliş. Paylar toplamı 1 olmak zorunda değil:
// toplama bölünüyor, böylece `denge.js`'te oranları elle 1'e tamamlamak gerekmiyor.
// SIRA SABİT (`KARAKTER_SIRASI`) — nesne anahtar sırası değişse bile aynı tohum aynı
// karakterleri vermeli.
function karakterSec(uretec, karisim) {
  const sira = Z.KARAKTER_SIRASI;
  let toplam = 0;
  for (const ad of sira) toplam += (karisim && karisim[ad]) || 0;
  if (toplam <= 0) return sira[0];
  let x = uretec.aralik(0, toplam);
  for (const ad of sira) {
    x -= (karisim && karisim[ad]) || 0;
    if (x <= 0) return ad;
  }
  return sira[sira.length - 1];
}

// Aktör başına bir KARAKTER ve dört ağırlık.
//
// Bant ZORLUK KADEMESİNDEN geliyor (§9.4: "zorluk = ağırlık ayarı, hesap değil"), bandın
// içindeki DİLİM ise karakterden. İkisi çarpılmıyor, iç içe geçiyor:
//   ağırlık = bantAlt + dilimOranı × (bantÜst − bantAlt)
// Böylece zor kademedeki çekimser il, kolay kademedeki çekimserden yine daha serttir.
//
// Dönen: { "06": { karakter, saldirganlik, acgozluluk, husumet, temkin }, … }
//
// ⚠ KAYDA YAZILMIYOR, TÜRETİLİYOR (Görev 07 §8/1). `kayitVerisi.js` yüklerken bu
// fonksiyonu yeniden çağırıyor — o yüzden buradaki çekiliş sırası değişirse ESKİ KAYITTAKİ
// RAKİPLER SESSİZCE BAŞKA İNSANLARA DÖNÜŞÜR. Karakter çekilişi üreteçten fazladan bir sayı
// tükettiği için kayıt sürümü 11'e çıktı (bkz. oyunDurumu.js).
export function kisilikUret(tohum, aktorIdler, zorluk) {
  const kademe = Z.ZORLUK[zorluk] || Z.ZORLUK[Z.VARSAYILAN_ZORLUK];
  const karisim = (Z.KARISIM || {})[zorluk] || (Z.KARISIM || {})[Z.VARSAYILAN_ZORLUK];
  const uretec = rastgeleKur(tohum >>> 0, tohum >>> 0);
  const kisilikler = {};
  // SIRALI GEZİLİYOR: nesne anahtar sırası değişse bile aynı tohum aynı kişilikleri versin.
  for (const id of [...aktorIdler].sort()) {
    const karakter = karakterSec(uretec, karisim);
    const dilim = (Z.KARAKTERLER[karakter] || {}).dilim || {};
    const k = { karakter };
    for (const ad of Z.AGIRLIKLAR) {
      if (ad === 'husumet') {
        // HUSUMET AÇILDI (Görev 08 / Adım 7): hasım tablosu artık `veri/husumetler.js`'te.
        // Ağırlık zorluk kademesine bağlı DEĞİL — husumet bir karakter özelliği, bir zorluk
        // ayarı değil; her kademede 0–1 arası dağılıyor.
        //
        // ⚠ BAYRAK ÜRETEÇTEN BİR SAYI TÜKETİYOR. Kapalıyken `aralik` hiç çağrılmıyordu,
        // açıkken çağrılıyor: aynı tohumla üretilen BÜTÜN kişilikler kayıyor. Bu, kayıt
        // sürümünün 8'e çıkmasının ikinci sebebi — sürüm 7 kaydı yüklenseydi rakipler
        // sessizce başka insanlara dönüşürdü (zaten reddediliyor, bkz. kayitVerisi.js).
        k[ad] = Z.HUSUMET_ACIK ? kirp(uretec.aralik(0, 1)) : 0;
        continue;
      }
      const aralik = kademe.aralik[ad];
      if (!aralik) {
        k[ad] = 0.5;
        continue;
      }
      // Karakterin dilimi bandın İÇİNDE bir alt aralık açıyor. Dilim tanımsızsa (yeni bir
      // ağırlık eklenmişse) bandın tamamı kullanılıyor — eski davranış.
      const d = dilim[ad] || [0, 1];
      const alt = aralik[0] + d[0] * (aralik[1] - aralik[0]);
      const ust = aralik[0] + d[1] * (aralik[1] - aralik[0]);
      k[ad] = kirp(uretec.aralik(alt, ust));
    }
    kisilikler[id] = k;
  }
  return kisilikler;
}

// Karakterin ekranda yazılacak adı. Ekran `denge.js`'i okumasın diye burada çevriliyor;
// karakter anahtarı bilinmiyorsa null döner (kişiliksiz aktör = eski kayıt, garnizon).
export function karakterAdi(kisilik) {
  const anahtar = kisilik && kisilik.karakter;
  const k = anahtar && Z.KARAKTERLER[anahtar];
  return k ? k.ad : null;
}

// Dört ağırlıktan birini okur. Eksik alan gelirse ORTA değer varsayılıyor: aktörün kişiliği
// kaydedilmemiş olabilir ve bu yüzden karar veremez hâle gelmemeli.
export function agirlik(kisilik, ad) {
  const v = kisilik && kisilik[ad];
  return typeof v === 'number' ? v : 0.5;
}
