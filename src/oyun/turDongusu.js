// TUR DÖNGÜSÜ (Görev 03 §7 Adım 4, Görev 05'te genişletildi).
//
// Tasarım §8 sekiz aşama tanımlıyor:
//
//   Turu bitir:
//     1. Üretim     — her aktör için gelir hesapla, havuzuna ekle        ← VAR (Görev 03)
//     2. Araştırma  — ayrılan ekonomi puana dönüşür                      ← VAR (Görev 06)
//     3. Takviye    — birim üretimi; tur İÇİNDE yapılıyor (Görev 04)
//     4. Toplanma   — yıpranmış ordular dolar                            ← VAR (Görev 06)
//     5. Hareket & saldırı — emirler tur içinde diziliyor (Görev 05)
//     6. Çözüm      — muharebeler, fetihler                             ← VAR (Görev 05)
//     7. Diplomasi  — (Görev 07)
//     8. Sıra       — sonraki oyuncuya / yapay zekâya (yapay zekâ gelince)
//
// SIRA ÖNEMLİ: GELİR ÖNCE, ÇÖZÜM SONRA. §8 üretimi birinci aşama sayıyor; ayrıca bu sıra
// "fethedilen parçada üretim aynı tur başlar mı" sorusunu ek kural yazmadan cevaplıyor:
// başlamaz, parça o tur geliri eski sahibine yazdıktan sonra el değiştirir.
//
// TOPLANMA, NUMARASI 4 OLMASINA RAĞMEN ÇÖZÜMDEN SONRA İŞLER (Görev 06 / Soru 2 →
// Baki'nin cevabı B, 2026-07-30). Tasarım §3.9 kendi içinde çelişiyordu: §3.9/2 "tur
// sonunda dolar", §8 "4. aşama", §3.9/5 "o tur savaşamaz". Seçilen kural: ordu o tur
// YIPRANMIŞ hâliyle savunur, tur sonunda dolar. Bedeli gerçek — parayı verdin ve bir tur
// zayıf durdun. Çözümden önce işleseydi toplanma savunmada bedava güç olurdu.
//
// KAYNAK, EMİR VERİLİRKEN DEĞİL BURADA DÜŞER. Ordu o tur imha olduysa hiçbir şey
// harcanmaz — "para buharlaştı" hissi olmaz. Bozguna uğrayıp çekilen ordu ise geçerli bir
// parçada durduğu için toplanmasını tamamlar (aşağıda ordunun YENİ yeri aranıyor).
//
// ŞİMDİLİK TÜM AKTÖRLER AYNI ANDA ÜRETİR. "Kimin sırası" sistemi yapay zekâ geldiğinde
// kurulacak; şimdi kurulmuyor (Görev 03 §7 Adım 4).

import { sayaclariIlerlet } from './sayac.js';
import { DENGE } from '../denge.js';
import { tumGelirler } from './uretim.js';
import { ozetCikar } from './cozum.js';
import { sirayiCoz } from './sira.js';
import { arastirmaAsamasi } from './arastirma.js';
import { toplanmaAsamasi } from './toplanma.js';
import { hamleleriSifirla } from './hamle.js';
import { komutanTuruBitir } from './komutan.js';
import { duellolariGuncelle } from './rekabet.js';
import { iliskileriGuncelle } from './diplomasi.js';
import { sonucKontrol } from './mod.js';

// TUR ÖZETİ ARTIK OYUNCUNUN SATIRLARINDAN ÇIKIYOR (Görev 07). Özet "kaç savaş kazandım,
// kaç parça aldım" diye oyuncuya konuşan bir kutu; 80 aktörün savaşları oraya karışırsa
// hiçbir şey anlatmaz. Uzaktaki olaylar tur raporunda ayrı bir bölümde (Adım 6).
function siraOzeti(satirlar, oyuncuAktorId) {
  return ozetCikar(satirlar.filter((s) => s.aktorId === oyuncuAktorId));
}

// Tur geçmişine yazılan sayılar bilgi amaçlıdır (havuzun kendisi tam kesirli tutulur),
// kayıt dosyası şişmesin diye iki haneye kısaltılır.
function kisalt(x) {
  return Math.round(x * 100) / 100;
}

// Turu bitirir ve YENİ bir oyun durumu döndürür — gelen durum değiştirilmez.
// (Arayüzün değişikliği fark edip ekranı tazelemesi buna bağlı.)
// `secenekler.zekaKapali` — dünyayı hareketsiz tutar (testler ve denge simülasyonu için;
// gerekçesi `sira.js`'te). Oyun bunu hiç kullanmıyor.
export function turuBitir(durum, secenekler) {
  const gelirler = tumGelirler(durum);

  // 1) Gelirleri havuzlara ekle. Havuz KESİRLİ birikir (§6.4), yuvarlama yok.
  const aktorler = {};
  for (const id of Object.keys(durum.aktorler)) {
    const a = durum.aktorler[id];
    const g = gelirler[id];
    aktorler[id] = {
      ...a,
      nufusHavuzu: a.nufusHavuzu + g.nufus,
      ekonomiHavuzu: a.ekonomiHavuzu + g.ekonomi,
    };
  }

  // 2) Biten turu geçmişe yaz. Oyuncunun satırı tutulur ("geçen tur ne kazandım").
  const oyuncuGelir = gelirler[durum.oyuncuAktorId] || { nufus: 0, ekonomi: 0 };
  const turGecmisi = durum.turGecmisi
    .concat([
      {
        tur: durum.tur,
        aktorId: durum.oyuncuAktorId,
        nufus: kisalt(oyuncuGelir.nufus),
        ekonomi: kisalt(oyuncuGelir.ekonomi),
      },
    ])
    .slice(-DENGE.TUR_GECMISI_UZUNLUGU); // son N tur (eskisi düşer)

  // 2b) EL DEĞİŞTİREN PARÇA LİSTESİ BURADA BOŞALIR (Görev 15). Gelir hesabı onları az önce
  //     atladı; bundan sonra fethedilenler BİR SONRAKİ turun gelirini kaçıracak. Liste
  //     `fetih.js`'te doluyor, tek boşaltma yeri burası.
  const fetihSifirlanmis = { ...durum, aktorler, turGecmisi, buTurFethedilen: [] };

  // 3) ARAŞTIRMA (§8/2). Ayrılan ekonomi havuzdan düşer, puana dönüşür, sayaçlar sıfırlanır.
  //    Çözümden ÖNCE: §8'in sırası bu ve seviye zaten tur içinde uygulanmış oluyor.
  const arastirmaSonucu = arastirmaAsamasi(fetihSifirlanmis, aktorler);

  // 4) SIRA + ÇÖZÜM (§8/5–6 ve §8/8). Hareketler, muharebeler, çekilmeler ve fetihler
  //    burada olur. Gelirden SONRA gelmesi bilinçli (dosya başındaki nota bak).
  //
  //    GÖREV 07'DEN İTİBAREN DÜNYA KENDİ KENDİNE OYNUYOR. Emirler artık tek seferde
  //    çözülmüyor: çözüm sırası tohumla karışıyor ve sıra bir yapay zekâ aktörüne
  //    geldiğinde o aktör O ANKİ duruma bakarak karar veriyor (Soru 1 → Baki'nin cevabı
  //    A2). Ayrıntı ve gerekçe `sira.js`'te.
  const siraSonucu = sirayiCoz(
    {
      ...fetihSifirlanmis,
      aktorler: arastirmaSonucu.aktorler,
      arastirma: arastirmaSonucu.arastirma,
      turGecmisi,
      // CEVAPLANMAYAN TEKLİFLER BURADA DÜŞER. Emir kuyruğunun kuralının aynısı: teklif
      // turluk bir haktır. Biriktirilseydi oyuncu 20. turda 30 satırlık bir yığınla
      // karşılaşır ve hiçbirini okumazdı — süzgecin (§10/9) bütün emeği boşa giderdi.
      // Sıfırlama sirayiCoz'DAN ÖNCE: bu turun teklifleri hemen ardından üretiliyor.
      teklifler: [],
    },
    secenekler
  );
  const cozulmus = siraSonucu.durum;
  // ---- RAPOR İKİ KAYNAKTAN GELİYOR (Görev 15) ----
  // TUR GÜNLÜĞÜ: turu bitirmeden ÖNCE çözülmüş hamleler (oyuncunun kendi saldırıları) ve
  // sıra sırasında botların hamleleri — hepsi `hamleUygula` tarafından yazıldı.
  // SIRA SATIRLARI: hamle olmayan olaylar (diplomasi, savaş ilanı).
  // Günlük ÖNCE geliyor: oyuncu raporun başında kendi turunu görmeli.
  const tumSatirlar = (cozulmus.turGunlugu || []).concat(siraSonucu.satirlar);
  const rapor = {
    tur: durum.tur,
    satirlar: tumSatirlar,
    ozet: siraOzeti(tumSatirlar, durum.oyuncuAktorId),
    // BU TUR BAŞLAYAN KUTSAL SAVAŞLAR (Görev 08 / Adım 7). Satırlardan toplanıyor:
    // düelloyu başlatan şey bir muharebe ya da giriş, yani zaten satırı olan bir olay.
    // Ayrı bir liste tutmak aynı bilgiyi ikinci kez saklamak olurdu.
    duellolar: tumSatirlar.filter((s) => s.duelloBasladi).map((s) => s.duelloBasladi),
  };

  // 5) TOPLANMA (§8/4, çözümden SONRA — dosya başındaki nota bak). Hayatta kalan ordular
  //    kadrolarına dolar; kaynak burada, fiilen dolarken düşer.
  const toplanmaSonucu = toplanmaAsamasi(cozulmus, rapor);

  // 6) Sanayi üretim sayacını, emir kuyruğunu ve HAMLE DEFTERİNİ sıfırla — üçü de turluk
  //    haktır (Görev 15: hak artık kuyruğun boşalmasıyla değil, defterin silinmesiyle
  //    yenileniyor — bkz. `src/oyun/hamle.js`). Araştırmanın sayaçları 3. adımda sıfırlandı.
  // 7) Tur sayacını artır. (8) Ekranın tazelenmesi yeni durumun döndürülmesiyle olur.
  const satirlar = rapor.satirlar
    .concat(arastirmaSonucu.ozet.map((o) => ({ tip: 'arastirma', ...o })))
    .concat(toplanmaSonucu.satirlar);

  // 6b) KUTSAL SAVAŞLAR (Görev 08 / §6/6). Süresi dolan ya da taraflarından biri elenen
  //     düellolar burada düşüyor. ÇÖZÜMDEN SONRA: bir düello, kendisini bitiren muharebenin
  //     olduğu turda hâlâ etkin olmalı — yoksa son savaşta moral bonusu kaybolurdu.
  const duellolu = duellolariGuncelle({ ...toplanmaSonucu.durum, tur: durum.tur });

  // 6c) DİPLOMASİ BAKIMI (Görev 09 / §6/5). Unutulmuş savaşlar tarafsıza döner, elenen
  //     aktörlerin satırları ve süresi dolan ihanet kayıtları düşer. Düello bakımıyla
  //     AYNI YERDE ve aynı gerekçeyle: ikisi de "turlara yayılan ilişki" ve ikisi de
  //     çözümden SONRA temizlenmeli — bir ilişki, kendisini bitiren muharebenin olduğu
  //     turda hâlâ etkin olmalı.
  const diplomasili = iliskileriGuncelle(duellolu);

  // 6d) KOMUTAN BAKIMI (Görev 16 / Adım 4): bekleme bir azalır, turluk atama hakkı
  //     yenilenir, parçası elden çıkmış komutan düşer. Diplomasi bakımıyla aynı yerde ve
  //     aynı gerekçeyle: ikisi de turlara yayılan durumlar ve ikisi de çözümden SONRA.
  const komutanli = komutanTuruBitir(diplomasili);

  // 7) KAZANMA / YENİLGİ — TEK YER, TEK ÇAĞRI (§Adım 5/3).
  //    Tur sayacı ARTTIKTAN SONRAKİ dünya sınanıyor: "süre doldu" kontrolü yeni tura göre
  //    yapılmalı, yoksa oyuncu sınırın son turunu hiç oynayamazdı.
  //    Sonuç bir kez yazılıyor ve kayıtta duruyor; sonraki turlar onu ezmez, çünkü oyuncu
  //    kazandıktan sonra "devam et" derse maç bitmiş SAYILMAYA devam etmeli (§6/7).
  const bitmis = { ...komutanli, tur: durum.tur + 1 };
  const sonuc = komutanli.sonuc || (sonucKontrol(bitmis) || {}).sonuc || null;

  return {
    ...bitmis,
    sonuc,
    buTurUretim: {},
    emirler: [],
    // TUR GÜNLÜĞÜ boşalır: raporu kurdu, işi bitti (Görev 15).
    turGunlugu: [],
    ordular: hamleleriSifirla(bitmis.ordular),
    // MAÇ SAYAÇLARI (Görev 12): rapor bir kez taranıp sayaçlar ilerliyor. Burada olmalı —
    // `buTurUretim` bir satır aşağıda sıfırlanıyor, o yüzden okunacak son an burası.
    sayaclar: sayaclariIlerlet(
      durum.sayaclar,
      satirlar.length > 0 ? { ...rapor, satirlar } : rapor,
      durum.oyuncuAktorId,
      Object.values(bitmis.parcaSahipligi).filter((x) => x === durum.oyuncuAktorId).length,
      durum.buTurUretim
    ),
    sonTurRaporu: satirlar.length > 0 ? { ...rapor, satirlar } : null,
  };
}

// "Geçen tur ne kazandım" — geçmişteki son satır (yoksa null).
export function sonTurGeliri(durum) {
  if (durum.turGecmisi.length === 0) return null;
  return durum.turGecmisi[durum.turGecmisi.length - 1];
}
