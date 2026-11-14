// TİTREŞİM DESENİ TESTLERİ (2026-08-12, Baki: "titreşimlerin hissiyatını arttıralım").
//
// ⚠ BU TESTLER NEDEN ŞİMDİ DOĞDU: hissiyat kuralları `titresim.js`'in içindeydi ve o dosya
// `expo-haptics`'i içe aktarıyor — Node onu çözemediği için kurallar HİÇBİR TESTTEN
// ERİŞİLEMİYORDU. Saf mantık `titresimDeseni.js`'e ayrılınca denetlenebilir hâle geldi.
//
// Asıl sorular: uzaktaki olay elde zil oluyor mu, raundun ağırlığı hissediliyor mu,
// senin kaybınla düşmanın kaybı ayrışıyor mu, desen sınırı tutuyor mu?

const { test, dogru, esit, diziEsit } = require('./yardimci');
const {
  olayDeseni,
  kademe,
  EN_COK_DARBE,
  VURUS_ORTA,
  VURUS_AGIR,
  OLAY_TITRESIMI,
} = require('../src/sahne/titresimDeseni.js');

// ---- UZAKTAKİ OLAY SUSUYOR ----

test('UZAK: beni ilgilendirmeyen bozgun/çekilme/imha HİÇ titremiyor', () => {
  for (const tip of ['bozgun', 'cekilme', 'imha'])
    diziEsit(olayDeseni({ tip, benim: false }), [], tip + ' uzakta susmalı');
});

test('UZAK: fetih uzakta da olsa tek hafif darbe (dünya dönüyor hissi)', () => {
  diziEsit(olayDeseni({ tip: 'fetih', benim: false }), ['hafif']);
});

test('UZAK: damga YOKSA eski davranış korunuyor (susturma değil)', () => {
  // `benim` alanı olmayan bir olay eski kayıttan ya da elle kurulmuş olabilir; onu
  // susturmak sessiz bir gerileme olurdu.
  dogru(olayDeseni({ tip: 'bozgun' }).length > 0, 'damgasız bozgun susmamalı');
  dogru(olayDeseni({ tip: 'fetih' }).length > 0, 'damgasız fetih susmamalı');
});

// ---- ŞİDDET KAYIPLA ÖLÇEKLENİYOR ----

test('VURUŞ: kayıpsız raunt titremiyor', () => {
  diziEsit(olayDeseni({ tip: 'vurus', saldiranKayip: 0, savunanKayip: 0 }), []);
});

test('VURUŞ: şiddet düşen birim sayısıyla artıyor', () => {
  const desen = (n) => olayDeseni({ tip: 'vurus', saldiranKayip: n, savunanKayip: 0 })[0];
  esit(desen(1), 'hafif', 'tek kayıp hafif');
  esit(desen(VURUS_ORTA), 'orta', VURUS_ORTA + ' kayıp orta');
  esit(desen(VURUS_AGIR), 'agir', VURUS_AGIR + ' kayıp ağır');
  esit(desen(VURUS_AGIR + 10), 'agir', 'tavanı aşmıyor');
});

test('VURUŞ: iki tarafın kaybı TOPLANIYOR (savaşın ağırlığı ikisinden gelir)', () => {
  const a = olayDeseni({ tip: 'vurus', saldiranKayip: 1, savunanKayip: 1 })[0];
  esit(a, 'orta', '1+1 = 2 kayıp orta olmalı');
});

test('VURUŞ: eşikler koda gömülü değil (değiştir → sonuç değişsin)', () => {
  // Eşik sabitleri dışa açık; ölçüt onların GERÇEKTEN kullanıldığı.
  const altinda = olayDeseni({ tip: 'vurus', saldiranKayip: VURUS_ORTA - 1 })[0];
  const ustunde = olayDeseni({ tip: 'vurus', saldiranKayip: VURUS_ORTA })[0];
  dogru(altinda !== ustunde, 'eşiğin altı ve üstü aynı titreşimi vermemeli');
});

// ---- KİMİN BAŞINA GELDİ ----

test('İMHA: benim ordum yıkım, düşmanınki zafer hissi veriyor', () => {
  const benim = olayDeseni({ tip: 'imha', benim: true, bana: true });
  const onun = olayDeseni({ tip: 'imha', benim: true, bana: false });
  dogru(benim.join() !== onun.join(), 'ikisi aynı hissi vermemeli');
  esit(benim[0], 'agir', 'kendi ordumun imhası ağır açmalı');
  esit(onun[0], 'basari', 'düşmanın imhası başarı açmalı');
});

test('BOZGUN: benim bozgunum uyarı, düşmanınki hafif', () => {
  esit(olayDeseni({ tip: 'bozgun', benim: true, bana: true })[0], 'uyari');
  esit(olayDeseni({ tip: 'bozgun', benim: true, bana: false })[0], 'hafif');
});

test('SAVAŞ: benim savaşım bir kademe daha sert açılıyor', () => {
  const benim = olayDeseni({ tip: 'savas', benim: true })[0];
  const uzak = olayDeseni({ tip: 'savas', benim: false })[0];
  esit(uzak, OLAY_TITRESIMI.savas, 'uzak savaş temel kademede kalmalı');
  esit(benim, kademe(OLAY_TITRESIMI.savas, +1), 'benim savaşım bir üst kademe');
  dogru(benim !== uzak, 'ikisi ayrışmalı');
});

// ---- DESEN ----

test('DESEN: il anları ve düello çok darbeli', () => {
  for (const tip of ['ilTamamlandi', 'ilKaybedildi', 'duello'])
    dogru(olayDeseni({ tip, benim: true }).length >= 2, tip + ' tek darbe olmamalı');
});

test('DESEN: hiçbir desen darbe sınırını aşmıyor', () => {
  const tipler = Object.keys(OLAY_TITRESIMI);
  for (const tip of tipler)
    for (const bana of [true, false]) {
      const d = olayDeseni({ tip, benim: true, bana, saldiranKayip: 9 });
      dogru(
        d.length <= EN_COK_DARBE,
        tip + ' deseni ' + d.length + ' darbe — sınır ' + EN_COK_DARBE
      );
    }
});

test('DESEN: bilinmeyen olay türü sessiz (kamera bir olay değil)', () => {
  diziEsit(olayDeseni({ tip: 'kamera' }), [], 'kamera titrememeli');
  diziEsit(olayDeseni({ tip: 'yokboyle' }), []);
  diziEsit(olayDeseni(null), []);
});

// ---- MERDİVEN ----

test('MERDİVEN: bildirim türleri kademelenmiyor (uyarı/başarı/hata)', () => {
  // Bunlar şiddet değil BİLDİRİM türü; "bir üstü" diye bir şey yok.
  for (const b of ['uyari', 'basari', 'hata']) esit(kademe(b, +1), b, b + ' kaymamalı');
});

test('MERDİVEN: uçlarda taşmıyor', () => {
  esit(kademe('agir', +1), 'agir', 'tavan');
  esit(kademe('hafif', -1), 'hafif', 'taban');
});
