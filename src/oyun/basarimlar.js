// HAREKÂT MÜHÜRLERİ — BAŞARIMLAR (Görev 12 / Adım 11 · Baki'nin isteği).
//
// ┌─ İKİ AYRI ŞEY, İKİ AYRI YER ────────────────────────────────────────────────────────┐
// │ SAYAÇLAR  → maça ait. `durum.sayaclar`da tutulur, kayda girer, maç bitince ölür.     │
// │ MÜHÜRLER  → oyuncuya ait. Maçtan bağımsız, `basarimKaydi.js` ayrı saklar.            │
// │                                                                                      │
// │ Ayrımın sınavı: yeni maç açınca sıfırlanmalı mı? Sayaç evet, mühür hayır.            │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- KOŞULLAR BURADA, HESAP DEĞİL ----
// Her mührün `kosul(b)` fonksiyonu tek satırlık bir sorgudur ve yalnızca `b` (bağlam)
// nesnesine bakar. Bağlam bir kez hesaplanıp bütün mühürlere veriliyor — 34 mühür için
// 34 kez harita taramak, tur sonunda telefonda ölçülebilir bir bedel olurdu.
//
// ---- YENİ MÜHÜR EKLEMEK ----
// Listeye bir satır eklemek yeter. Kimlik (`id`) BİR DAHA DEĞİŞMEZ: kayıtta o duruyor,
// değişirse oyuncunun kazandığı mühür sessizce kaybolur.

import { DENGE } from '../denge.js';
import { ILLER, PARCALAR } from './veri.js';
import { muttefikler } from './diplomasi.js';
import { tumDallar, dalSeviyesi, aktorArastirmasi } from './arastirma.js';

// Mühür kademeleri — çerçeve biçimini belirliyor (renk değil biçim: her zeminde okunur).
export const KADEME = { bronz: 'bronz', gumus: 'gumus', altin: 'altin' };

export const KATEGORILER = [
  ['ilk', 'İLK ADIMLAR'],
  ['fetih', 'FETİH'],
  ['savas', 'SAVAŞ'],
  ['diplomasi', 'DİPLOMASİ'],
  ['ekonomi', 'EKONOMİ VE ARAŞTIRMA'],
  ['zor', 'ZORLAYICI'],
];

// `glif` = mühürün içindeki sembol (`Muhurler.js` çiziyor). Birden çok mühür aynı glifi
// paylaşabilir; 34 ayrı çizim, 34 ayrı bakım yükü demekti.
export const BASARIMLAR = [
  // ---- İLK ADIMLAR ----
  {
    id: 'ilkEmir', // kimlik kayıtta duruyor, değişmez; görünen ad Görev 21'de "hamle" oldu
    ad: 'İlk Hamle',
    kategori: 'ilk',
    kademe: 'bronz',
    glif: 'ok',
    aciklama: 'İlk hamleni yap.',
    kosul: (b) => b.s.emir >= 1,
  },
  {
    id: 'vaftiz',
    ad: 'Vaftiz',
    kategori: 'ilk',
    kademe: 'bronz',
    glif: 'kilic',
    aciklama: 'İlk savaşını kazan.',
    kosul: (b) => b.s.kazanilanSavas >= 1,
  },
  {
    id: 'sinirAsildi',
    ad: 'Sınır Aşıldı',
    kategori: 'ilk',
    kademe: 'bronz',
    glif: 'cizgi',
    aciklama: 'İlk bölgeni fethet.',
    kosul: (b) => b.s.fetih >= 1,
  },
  {
    id: 'sancak',
    ad: 'Sancak',
    kategori: 'ilk',
    kademe: 'bronz',
    glif: 'sancak',
    aciklama: 'Bir ili tamamen al.',
    kosul: (b) => b.tamIl >= 2,
  },
  {
    id: 'tanisma',
    ad: 'Tanışma',
    kategori: 'ilk',
    kademe: 'bronz',
    glif: 'halka',
    aciklama: 'İlk anlaşmanı imzala.',
    kosul: (b) => b.s.anlasma >= 1,
  },

  // ---- FETİH ----
  {
    id: 'bolgeHakimi',
    ad: 'Bölge Hâkimi',
    kategori: 'fetih',
    kademe: 'gumus',
    glif: 'altigen',
    aciklama: 'Bir coğrafi bölgenin tamamını al.',
    kosul: (b) => b.tamBolge >= 1,
  },
  {
    id: 'ucBolge',
    ad: 'Üç Bölge',
    kategori: 'fetih',
    kademe: 'altin',
    glif: 'ucAltigen',
    aciklama: 'Üç coğrafi bölgeyi tamamen al.',
    kosul: (b) => b.tamBolge >= 3,
  },
  {
    id: 'yarimHakimiyet',
    ad: 'Yarım Hâkimiyet',
    kategori: 'fetih',
    kademe: 'gumus',
    glif: 'yarimDaire',
    aciklama: 'Haritanın yarısını ele geçir.',
    kosul: (b) => b.parca >= b.toplamParca / 2,
  },
  {
    id: 'tamFetih',
    ad: 'Tam Fetih',
    kategori: 'fetih',
    kademe: 'altin',
    glif: 'daire',
    aciklama: 'Bütün bölgeler senin olsun.',
    kosul: (b) => b.parca >= b.toplamParca,
  },
  {
    id: 'bogazlar',
    ad: 'Boğazlar',
    kategori: 'fetih',
    kademe: 'gumus',
    glif: 'bogaz',
    aciklama: 'İstanbul ve Çanakkale aynı anda senin olsun.',
    kosul: (b) => b.ilTam('34') && b.ilTam('17'),
  },
  {
    id: 'doguBati',
    ad: 'Doğu ve Batı',
    kategori: 'fetih',
    kademe: 'altin',
    glif: 'uzunOk',
    aciklama: 'Edirne ile Hakkâri aynı anda senin olsun.',
    kosul: (b) => b.ilTam('22') && b.ilTam('30'),
  },

  // ---- SAVAŞ ----
  {
    id: 'bozgun',
    ad: 'Bozgun',
    kategori: 'savas',
    kademe: 'bronz',
    glif: 'kirik',
    aciklama: 'Bir orduyu bozguna uğrat.',
    kosul: (b) => b.s.bozgun >= 1,
  },
  {
    id: 'baskinci',
    ad: 'Baskıncı',
    kategori: 'savas',
    kademe: 'gumus',
    glif: 'hilal',
    aciklama: 'Baskınla bir savaş kazan.',
    kosul: (b) => b.s.baskinZaferi >= 1,
  },
  {
    id: 'kayipsiz',
    ad: 'Kayıpsız',
    kategori: 'savas',
    kademe: 'gumus',
    glif: 'kalkan',
    aciklama: 'Hiç birlik kaybetmeden bir savaş kazan.',
    kosul: (b) => b.s.kayipsizZafer >= 1,
  },
  {
    id: 'dagAdami',
    ad: 'Dağ Adamı',
    kategori: 'savas',
    kademe: 'gumus',
    glif: 'dag',
    aciklama: 'Dağlık bir bölgede savunmayı kır.',
    kosul: (b) => b.s.daglikZafer >= 1,
  },
  {
    id: 'buyukSavas',
    ad: 'Büyük Savaş',
    kategori: 'savas',
    kademe: 'altin',
    glif: 'catlak',
    aciklama: 'Bir kutsal savaşı kazan.',
    kosul: (b) => b.s.duelloZaferi >= 1,
  },
  {
    id: 'sarsilmaz',
    ad: 'Sarsılmaz',
    kategori: 'savas',
    kademe: 'altin',
    glif: 'ciftKalkan',
    aciklama: 'Üst üste beş savunma savaşı kazan.',
    kosul: (b) => b.s.enUzunSavunmaSerisi >= 5,
  },
  {
    id: 'firtina',
    ad: 'Fırtına',
    kategori: 'savas',
    kademe: 'gumus',
    glif: 'firtina',
    aciklama: 'Tek turda beş bölge fethet.',
    kosul: (b) => b.s.enCokTurFetih >= 5,
  },

  // ---- DİPLOMASİ ----
  {
    id: 'blok',
    ad: 'Blok',
    kategori: 'diplomasi',
    kademe: 'gumus',
    glif: 'ucHalka',
    aciklama: 'Aynı anda üç müttefikin olsun.',
    kosul: (b) => b.muttefik >= 3,
  },
  {
    id: 'arabulucu',
    ad: 'Arabulucu',
    kategori: 'diplomasi',
    kademe: 'bronz',
    glif: 'kirikKilic',
    aciklama: 'Bir savaşı ateşkesle bitir.',
    kosul: (b) => b.s.ateskes >= 1,
  },
  {
    id: 'hain',
    ad: 'Hain',
    kategori: 'diplomasi',
    kademe: 'bronz',
    glif: 'kesikIp',
    aciklama: 'Bir anlaşmayı boz. Bedelini de öde.',
    kosul: (b) => b.s.ihanet >= 1,
  },
  {
    id: 'sadik',
    ad: 'Sadık',
    kategori: 'diplomasi',
    kademe: 'altin',
    glif: 'dugum',
    aciklama: 'Anlaşma yapıp hiç bozmadan maçı kazan.',
    kosul: (b) => b.kazandi && b.s.anlasma >= 1 && b.s.ihanet === 0,
  },
  {
    id: 'yalnizKurt',
    ad: 'Yalnız Kurt',
    kategori: 'diplomasi',
    kademe: 'altin',
    glif: 'iz',
    aciklama: 'Hiç anlaşma yapmadan maçı kazan.',
    kosul: (b) => b.kazandi && b.s.anlasma === 0,
  },

  // ---- EKONOMİ VE ARAŞTIRMA ----
  {
    id: 'sanayi',
    ad: 'Sanayi',
    kategori: 'ekonomi',
    kademe: 'gumus',
    glif: 'disli',
    aciklama: 'Tek turda on birlik bas.',
    kosul: (b) => b.s.enCokTurUretim >= 10,
  },
  {
    id: 'bilim',
    ad: 'Bilim',
    kategori: 'ekonomi',
    kademe: 'gumus',
    glif: 'erlen',
    aciklama: 'Bir araştırma dalını en üst seviyeye çıkar.',
    kosul: (b) => b.enYuksekDal >= DENGE.ARASTIRMA.TAVAN,
  },
  {
    id: 'tamDonanim',
    ad: 'Tam Donanım',
    kategori: 'ekonomi',
    kademe: 'altin',
    glif: 'ucCizgi',
    aciklama: 'Üç birlik ağacının hepsinde araştırma yap.',
    kosul: (b) => b.arastirmaliAgac >= 3,
  },
  {
    id: 'toparlanan',
    ad: 'Toparlanan',
    kategori: 'ekonomi',
    kademe: 'bronz',
    glif: 'artiOk',
    aciklama: 'Toparlanmayla yirmi birlik geri kazan.',
    kosul: (b) => b.s.toparlanan >= 20,
  },

  // ---- ZORLAYICI ----
  {
    id: 'kisaSefer',
    ad: 'Kısa Sefer',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'kumSaati',
    aciklama: 'Bir maçı 60 turdan kısa sürede kazan.',
    kosul: (b) => b.kazandi && b.tur < 60,
  },
  {
    id: 'kansizZafer',
    ad: 'Kansız Zafer',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'zeytin',
    aciklama: "On'dan az savaşla maç kazan.",
    kosul: (b) => b.kazandi && b.s.savas < 10,
  },
  {
    id: 'kucuktenBuyuge',
    ad: 'Küçükten Büyüğe',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'merdiven',
    aciklama: 'Tek bölgeli bir ille başlayıp maçı kazan.',
    kosul: (b) => b.kazandi && b.baslangicParca === 1,
  },
  {
    id: 'zoraKarsi',
    ad: 'Zora Karşı',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'yildiz',
    aciklama: 'Zor kademede bir maç kazan.',
    kosul: (b) => b.kazandi && b.zorluk === 'zor',
  },
  {
    id: 'sonuncu',
    ad: 'Sonuncu',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'kivilcim',
    aciklama: 'Tek bölgeye düştükten sonra maçı kazan.',
    kosul: (b) => b.kazandi && b.s.enDusukParca <= 1,
  },
  {
    id: 'barisci',
    ad: 'Barışçı',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'guvercin',
    aciklama: 'Hiç savaş ilan etmeden haritanın yarısına ulaş.',
    kosul: (b) => b.parca >= b.toplamParca / 2 && b.s.ilan === 0,
  },
  // ---- TEMİZ ZAFER / KİRLİ ZAFER (Görev 19 / Adım 2) ----
  //
  // Ödüllü reklam artık "ikinci şans" veriyor (turu geri al, yenilgiden dön…). Bu iki
  // mühür o kararın karşılığı: ödül kullanan da kullanmayan da bir şey kazanıyor, kimse
  // küsmüyor. KİRLİ ZAFER BİR CEZA DEĞİL — metni gülümseten bir kayıt olmalı, utandıran
  // değil; oyuncu ödülü kullandığı için kendini kötü hissederse ödül de satılmaz.
  {
    id: 'temizZafer',
    ad: 'Temiz Zafer',
    kategori: 'zor',
    kademe: 'altin',
    glif: 'zeytin',
    aciklama: 'Hiç ödül kullanmadan bir maç kazan.',
    kosul: (b) => b.kazandi && b.odul === 0,
  },
  {
    id: 'kirliZafer',
    ad: 'Kirli Zafer',
    kategori: 'zor',
    kademe: 'bronz',
    glif: 'catlak',
    aciklama: 'Yardım alarak da olsa kazan. Zafer zaferdir.',
    kosul: (b) => b.kazandi && b.odul > 0,
  },
];

// ---- BAĞLAM ----
// Bütün mühürlerin baktığı tek nesne. BİR KEZ hesaplanıyor.
export function basarimBaglami(durum) {
  const ben = durum.oyuncuAktorId;
  const s = durum.sayaclar || {};

  // Tek geçişte: benim parçalarım, il başına toplam/benimki, bölge başına toplam/benimki.
  let parca = 0;
  let toplamParca = 0;
  const ilToplam = {};
  const ilBenim = {};
  const bolgeToplam = {};
  const bolgeBenim = {};
  const kapsam = new Set(durum.senaryo ? durum.senaryo.kapsamParcalar : []);

  for (const pid of Object.keys(durum.parcaSahipligi)) {
    if (kapsam.size > 0 && !kapsam.has(pid)) continue;
    const p = PARCALAR[pid];
    const il = ILLER[p.kod];
    const bolge = il ? il.bolge : '?';
    toplamParca++;
    ilToplam[p.kod] = (ilToplam[p.kod] || 0) + 1;
    bolgeToplam[bolge] = (bolgeToplam[bolge] || 0) + 1;
    if (durum.parcaSahipligi[pid] === ben) {
      parca++;
      ilBenim[p.kod] = (ilBenim[p.kod] || 0) + 1;
      bolgeBenim[bolge] = (bolgeBenim[bolge] || 0) + 1;
    }
  }

  let tamIl = 0;
  for (const kod of Object.keys(ilToplam)) if (ilBenim[kod] === ilToplam[kod]) tamIl++;
  let tamBolge = 0;
  for (const b of Object.keys(bolgeToplam)) if (bolgeBenim[b] === bolgeToplam[b]) tamBolge++;

  // Araştırma: en yüksek dal seviyesi ve kaç ağaçta yatırım var.
  const arastirma = aktorArastirmasi(durum, ben);
  let enYuksekDal = 0;
  const agaclar = new Set();
  for (const d of tumDallar()) {
    const sv = dalSeviyesi(arastirma, d.birim, d.dal);
    if (sv > enYuksekDal) enYuksekDal = sv;
    if (sv > 0) agaclar.add(d.birim);
  }

  return {
    s,
    parca,
    toplamParca,
    tamIl,
    tamBolge,
    ilTam: (kod) => ilToplam[kod] > 0 && ilBenim[kod] === ilToplam[kod],
    muttefik: muttefikler(durum, ben).length,
    enYuksekDal,
    arastirmaliAgac: agaclar.size,
    tur: durum.tur,
    zorluk: durum.zorluk,
    // ⚠ DÜZELTME (2026-09-20, Görev 19 / Adım 1'de yakalandı): burada
    // `durum.sonuc.sonuc === 'kazandi'` yazıyordu ama `durum.sonuc` bir NESNE DEĞİL, METİN
    // ('kazandi' | 'yenildi' — `turDongusu.js` öyle yazıyor). Yani bayrak HİÇ true olmadı
    // ve `b.kazandi` isteyen YEDİ MÜHÜR kazanılamıyordu (Zafer Yolu, Kansız Zafer, Tek
    // Parçadan, Zorlu Zafer…). Sinsiliği klasik: hiçbir yerde hata çıkmıyor, mühürler
    // sadece hiç gelmiyor. Rütbe sistemi (Görev 16 / Adım 3) buna bağlı olduğu için
    // tavan puan da fiilen ulaşılamazdı.
    kazandi: durum.sonuc === 'kazandi',
    // ÖDÜL SAYACI (Görev 19 / Adım 2): bu maçta kaç ödüllü reklam ödülü kullanıldı.
    // TEMİZ ZAFER ve KİRLİ ZAFER bunu okuyor.
    odul: s.odul || 0,
    baslangicParca: s.baslangicParca || 0,
  };
}

// Şu an hak edilmiş mühürlerin kimlikleri. `kosul` içinde hata olsa bile oyun durmamalı:
// bir mühür patlarsa yalnızca o mühür kazanılmamış sayılır.
export function kazanilanlar(durum) {
  const b = basarimBaglami(durum);
  const cikti = [];
  for (const m of BASARIMLAR) {
    try {
      if (m.kosul(b)) cikti.push(m.id);
    } catch (e) {
      // yut — mühür kazanılmadı sayılır
    }
  }
  return cikti;
}
