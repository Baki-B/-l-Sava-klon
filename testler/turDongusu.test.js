// TUR DÖNGÜSÜ TESTLERİ (Görev 03 / Adım 4).
// Asıl sorular: her tur doğru miktar birikiyor mu, kesirler korunuyor mu,
// tur geçmişi son 50 turda kalıyor mu, kayıt dosyası şişiyor mu?

const { test, dogru, esit, yakin } = require('./yardimci');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir, sonTurGeliri } = require('../src/oyun/turDongusu.js');
const { aktorGeliri } = require('../src/oyun/uretim.js');
const { DENGE } = require('../src/denge.js');
const illerData = require('../veri/iller.json');

// DÜNYA DURGUN (Görev 07): bu dosyadaki testler kendi mekaniklerini ölçüyor, yapay zekâyı
// değil. Zekâ açıkken 80 aktör para harcıyor ve toprak alıyor; "havuz geliri kadar arttı mı"
// gibi ölçümler gürültüye boğuluyor. Zekânın kendi testleri `testler/zeka.test.js`'te.
const DURGUN = { zekaKapali: true };

const TOHUM = 20260725;
const yeni = () => oyunKur({ senaryo: 'turkiye', tohum: TOHUM });

test('turu bitirince tur sayacı 1 artıyor', () => {
  const d = turuBitir(yeni(), DURGUN);
  esit(d.tur, 2, 'tur');
  esit(turuBitir(d, DURGUN).tur, 3, 'ikinci turdan sonra');
});

test('her aktörün havuzu kendi geliri kadar artıyor (hepsi aynı anda üretir)', () => {
  const once = yeni();
  const sonra = turuBitir(once, DURGUN);
  for (const id of Object.keys(once.aktorler)) {
    const g = aktorGeliri(once, id);
    yakin(sonra.aktorler[id].nufusHavuzu, g.nufus, 1e-9, id + ' nüfus havuzu');
    yakin(sonra.aktorler[id].ekonomiHavuzu, g.ekonomi, 1e-9, id + ' ekonomi havuzu');
  }
  // Bursa'nın statı 7 → ilk turdan sonra havuzunda 7 olmalı.
  yakin(sonra.aktorler['16'].nufusHavuzu, illerData['16'].statlar.nufus, 1e-9, 'Bursa havuzu');
});

test('turuBitir eski durumu DEĞİŞTİRMİYOR (yeni durum döndürüyor)', () => {
  const d = yeni();
  const kopya = JSON.stringify(d);
  const yeniDurum = turuBitir(d, DURGUN);
  esit(JSON.stringify(d), kopya, 'eski durum');
  dogru(yeniDurum !== d, 'aynı nesne döndürülmüş');
  dogru(yeniDurum.aktorler !== d.aktorler, 'aktör tablosu paylaşılıyor');
});

test('10 tur sonra havuz = 10 × tur geliri', () => {
  let d = yeni();
  // Bursa'nın elinde sadece tek parça kalsın: tur başına 3 nüfus (16-1'in tam sayı değeri).
  for (const pid of Object.keys(d.parcaSahipligi)) d.parcaSahipligi[pid] = '34';
  d.parcaSahipligi['16-1'] = '16';

  for (let i = 0; i < 10; i++) d = turuBitir(d, DURGUN);

  esit(d.tur, 11, 'tur');
  esit(d.aktorler['16'].nufusHavuzu, 30, 'Bursa 10 turluk birikim');
});

test('gelir her turda aynı (sahiplik değişmediyse)', () => {
  let d = yeni();
  const beklenen = aktorGeliri(d, '16').nufus;
  let oncekiHavuz = 0;
  for (let i = 0; i < 5; i++) {
    d = turuBitir(d, DURGUN);
    const artis = d.aktorler['16'].nufusHavuzu - oncekiHavuz;
    yakin(artis, beklenen, 1e-9, i + 1 + '. turdaki artış');
    oncekiHavuz = d.aktorler['16'].nufusHavuzu;
  }
});

test('sahiplik değişince gelir ANINDA değişiyor', () => {
  let d = yeni();
  d = turuBitir(d, DURGUN);
  const ilkArtis = d.aktorler['16'].nufusHavuzu;

  // Bursa Ovası İstanbul'a geçti (3 nüfusluk parça) → Bursa'nın geliri 7 → 4 düşmeli.
  d = { ...d, parcaSahipligi: { ...d.parcaSahipligi, '16-1': '34' } };
  const oncekiHavuz = d.aktorler['16'].nufusHavuzu;
  d = turuBitir(d, DURGUN);
  const yeniArtis = d.aktorler['16'].nufusHavuzu - oncekiHavuz;

  esit(ilkArtis, 7, 'tam ilin geliri');
  esit(yeniArtis, 4, 'parça kaybettikten sonraki gelir');
  dogru(yeniArtis < ilkArtis, 'parça kaybına rağmen gelir düşmedi');
});

test('tur geçmişi biten turun gelirini yazıyor', () => {
  const d = turuBitir(yeni(), DURGUN);
  const son = sonTurGeliri(d);
  esit(son.tur, 1, 'kaydedilen tur');
  esit(son.aktorId, d.oyuncuAktorId, 'aktör');
  yakin(son.nufus, 7, 1e-9, 'Bursa geliri');
  esit(sonTurGeliri(yeni()), null, 'oyun başında geçmiş boş');
});

test('tur geçmişi son ' + DENGE.TUR_GECMISI_UZUNLUGU + ' turda kalıyor (eskisi düşüyor)', () => {
  let d = yeni();
  const toplamTur = DENGE.TUR_GECMISI_UZUNLUGU + 10;
  for (let i = 0; i < toplamTur; i++) d = turuBitir(d, DURGUN);

  esit(d.turGecmisi.length, DENGE.TUR_GECMISI_UZUNLUGU, 'geçmiş uzunluğu');
  esit(d.turGecmisi[0].tur, toplamTur - DENGE.TUR_GECMISI_UZUNLUGU + 1, 'en eski kayıt');
  esit(d.turGecmisi[d.turGecmisi.length - 1].tur, toplamTur, 'en yeni kayıt');
});

test('KAYIT: 60 tur sonra bile durum küçük kalıyor (geçmiş şişmiyor)', () => {
  let d = yeni();
  for (let i = 0; i < 60; i++) d = turuBitir(d, DURGUN);
  const kb = JSON.stringify(d).length / 1024;
  dogru(kb < 50, 'durum ' + kb.toFixed(1) + ' KB (50 KB altı bekleniyor)');
});

test('aynı tohumla iki oyun 20 tur sonra da birebir aynı', () => {
  let a = yeni(),
    b = yeni();
  for (let i = 0; i < 20; i++) {
    a = turuBitir(a, DURGUN);
    b = turuBitir(b, DURGUN);
  }
  esit(JSON.stringify(a), JSON.stringify(b), '20 tur sonra');
});

// ---- ONDALIK AVI (Görev 07, Baki: "oyunda ondalıklı hiçbir şey istemiyorum") ----
//
// Oyuncunun EKRANDA gördüğü her sayı tam olmalı. Bu test oyunu gerçekten oynatıp
// (üretim, fetih, araştırma, toparlanma) havuzların ve puanların kesir tutup tutmadığına
// bakıyor. Tek tek ekranları denetlemek yerine kaynağı kilitliyor: ekranda ondalık
// görünmesinin tek yolu, motorun ondalık üretmesi.
//
// Kesir tutmasına İZİN VERİLEN tek alan `hasarHavuzu` — o muharebenin iç defteri, oyuncuya
// hiçbir yerde gösterilmiyor (kayıtta iki haneye kısaltılıyor, bkz. cozum.js).
test('ONDALIK YOK: 15 tur boyunca havuzlar ve puanlar TAM SAYI kalıyor', () => {
  const { oyunKur } = require('../src/oyun/oyunDurumu.js');
  const { hamleUygula } = require('../src/oyun/cozum.js');
  const { komsular } = require('../src/oyun/hareket.js');
  const { parcaOrdusu } = require('../src/oyun/ordu.js');
  const { ayrilaniAyarla } = require('../src/oyun/arastirma.js');

  let d = oyunKur({ senaryo: 'turkiye', tohum: 20260731 });
  const ben = d.oyuncuAktorId;
  const kusurlu = [];

  for (let tur = 0; tur < 15; tur++) {
    // Elindeki her parçadan bir komşuya saldır — fetih ganimeti devreye girsin.
    for (const pid of Object.keys(d.parcaSahipligi)) {
      if (d.parcaSahipligi[pid] !== ben) continue;
      const o = parcaOrdusu(d, pid);
      if (!o || o.sahip !== ben) continue;
      const hedef = komsular(pid).find((k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== ben);
      if (!hedef) continue;
      const s = hamleUygula(d, ben, pid, hedef, o.birimler);
      if (s.ok) d = s.durum;
    }
    // Araştırmaya pay ayır — puan üretimi devreye girsin.
    d = ayrilaniAyarla(d, ben, 3);
    d = turuBitir(d, DURGUN);

    for (const id of Object.keys(d.aktorler)) {
      const a = d.aktorler[id];
      if (a.nufusHavuzu % 1 !== 0)
        kusurlu.push('tur ' + tur + ' ' + id + ' nüfus ' + a.nufusHavuzu);
      if (a.ekonomiHavuzu % 1 !== 0)
        kusurlu.push('tur ' + tur + ' ' + id + ' ekonomi ' + a.ekonomiHavuzu);
    }
    for (const id of Object.keys(d.arastirma || {})) {
      const p = d.arastirma[id].puan || 0;
      if (p % 1 !== 0) kusurlu.push('tur ' + tur + ' ' + id + ' puan ' + p);
    }
  }
  dogru(kusurlu.length === 0, 'ondalık bulundu: ' + kusurlu.slice(0, 5).join(' | '));
});

test('ONDALIK YOK: araştırma stat artışları tam sayı, ekran cümlesi ondalık içermiyor', () => {
  const { tumDallar, dalEtkisi } = require('../src/oyun/arastirma.js');
  const A = DENGE.ARASTIRMA;
  for (const d of tumDallar()) {
    for (let sv = 0; sv < A.TAVAN; sv++) {
      const kayit = { [d.anahtar]: sv };
      const e = dalEtkisi(kayit, d.birim, d.dal);
      dogru(!!e, d.anahtar + ' etkisi yok');
      if (e.tip === 'stat') {
        esit(e.once % 1, 0, d.anahtar + ' Sv.' + sv + ' önce = ' + e.once);
        esit(e.sonra % 1, 0, d.anahtar + ' Sv.' + sv + ' sonra = ' + e.sonra);
      }
      // Ekrana giden cümlede ondalık ayırıcı olmamalı ("6,5" veya "6.5").
      dogru(!/\d[.,]\d/.test(e.cumle), d.anahtar + ' cümlesinde ondalık var: ' + e.cumle);
    }
  }
});
