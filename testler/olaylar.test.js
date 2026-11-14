// OLAY LİSTESİ TESTLERİ (Görev 08 / Adım 2).
//
// Bu dosya "ekranda güzel görünüyor mu" sorusunu HİÇ SORMUYOR — o sorunun testi yok, cihaz
// denemesi var. Burada sınanan şey: DOĞRU OLAYLAR, DOĞRU SIRADA, DOĞRU SAYIDA üretiliyor mu
// ve liste oyunun durumuna dokunuyor mu.
//
// EN ÖNEMLİ TEST BU DOSYADA: "olay listesi oyun durumunu değiştirmez". Görev belgesi §10/7
// bunu en tehlikeli hata diye işaretledi — bir efektin içinden durum değişirse atlama
// bozulur ve OYUN KAYDI BOZULUR.

const { test, dogru, esit, diziEsit } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { komsular } = require('../src/oyun/hareket.js');
const { hamleUygula } = require('../src/oyun/cozum.js');
const { parcaOrdusu, birimUret } = require('../src/oyun/ordu.js');
const {
  olaylariCikar,
  oynatimPlani,
  toplamSure,
  oynatilacakSatirlar,
  onemliSavasMi,
  ilOlcegi,
} = require('../src/oyun/olaylar.js');

const S = DENGE.SAHNE;
const BEN = '16'; // Bursa

// ---- ELDE KURULMUŞ RAPOR ----
// Gerçek bir oyundan rapor almak sırayı sınamak için fazla gürültülü: hangi savaşın kaç
// raunt sürdüğü tohuma bağlı. Sıra ve sayı testleri bu elle kurulmuş rapordan geçiyor,
// "durumu değiştirmiyor" testi ise GERÇEK bir oyundan (aşağıda).
function rapor() {
  return {
    tur: 7,
    satirlar: [
      {
        tip: 'muharebe',
        aktorId: BEN,
        kaynak: '16-1',
        hedef: '41-1',
        savunanId: '41',
        eskiSahip: '41',
        arazi: 'ova',
        gonderilen: { piyade: 3, topcu: 1 },
        savunanGiren: { piyade: 2, zirhli: 1 },
        kazanan: 'saldiran',
        saldiranKalan: 3,
        savunanKalan: 0,
        savunanBozgun: false,
        saldiranBozgun: false,
        turSayisi: 3,
        dokum: [
          [40, 30, 0, 1, 4, 2, 2, 2, 0],
          [35, 20, 1, 1, 3, 1, 2, 1, 0],
          [30, 10, 0, 1, 3, 0, 2, 0, 0],
        ],
        fethedildi: true,
        ganimet: 4,
        ilTamamlandi: true,
        ilKaybedildi: true,
        ilKodu: '41',
        cekilme: null,
      },
      // Uzaktaki bir yapay zekâ savaşı — beni hiç ilgilendirmiyor.
      {
        tip: 'muharebe',
        aktorId: '65',
        kaynak: '65-1',
        hedef: '04-1',
        savunanId: '04',
        eskiSahip: '04',
        arazi: 'daglik',
        gonderilen: { piyade: 5 },
        savunanGiren: { piyade: 4 },
        kazanan: 'saldiran',
        saldiranKalan: 3,
        savunanKalan: 1,
        savunanBozgun: true,
        saldiranBozgun: false,
        turSayisi: 2,
        dokum: [
          [20, 20, 1, 1, 4, 3, 3, 2, 0],
          [18, 12, 1, 2, 3, 1, 2, 1, 0],
        ],
        fethedildi: true,
        ganimet: 3,
        ilTamamlandi: true,
        ilKaybedildi: true,
        ilKodu: '04',
        cekilme: { taraf: 'savunan', hedef: '04-2', kayip: 1, yokOldu: false },
      },
      // Dost parçaya giriş = takviye.
      {
        tip: 'giris',
        aktorId: BEN,
        kaynak: '16-2',
        hedef: '16-1',
        birimler: { piyade: 2 },
        fethedildi: false,
        ganimet: 0,
        ilTamamlandi: false,
        ilKaybedildi: false,
        eskiSahip: BEN,
      },
      // Sahneye HİÇ girmemesi gerekenler:
      { tip: 'iptal', aktorId: BEN, kaynak: '16-3', hedef: '11-1', sebep: 'ordu-yok' },
      { tip: 'arastirma', aktorId: BEN, birim: 'piyade', dal: 'zirh' },
    ],
  };
}

const cikar = (kapsam) => olaylariCikar(rapor(), { oyuncuAktorId: BEN, kapsam });
const tipleri = (olaylar) => olaylar.map((o) => o.tip);

// ═══════════════════════════════════════════════════════════════════════
// DEĞİŞMEZ KURAL — LİSTE DURUMU DEĞİŞTİRMEZ
// ═══════════════════════════════════════════════════════════════════════

test('DEĞİŞMEZ: olay listesi tur raporuna dokunmuyor', () => {
  const r = rapor();
  const once = JSON.stringify(r);
  for (const kapsam of S.KAPSAM_SIRASI)
    oynatimPlani(olaylariCikar(r, { oyuncuAktorId: BEN, kapsam }));
  esit(JSON.stringify(r), once, 'rapor değişti');
});

test('DEĞİŞMEZ: gerçek oyunda liste üretmek durumu değiştirmiyor', () => {
  let d = oyunKur({ senaryo: 'karadeniz', tohum: 20260801 });
  for (const pid of Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === '61')) {
    const s = birimUret(d, pid, '61', { piyade: 2 });
    if (s.ok) d = s.durum;
  }
  for (const pid of Object.keys(d.parcaSahipligi).filter((p) => d.parcaSahipligi[p] === '61')) {
    const o = parcaOrdusu(d, pid);
    if (!o || o.sahip !== '61') continue;
    const hedef = komsular(pid).find((k) => d.parcaSahipligi[k] && d.parcaSahipligi[k] !== '61');
    if (!hedef) continue;
    const e = hamleUygula(d, '61', pid, hedef, o.birimler);
    if (e.ok) d = e.durum;
  }
  d = turuBitir(d);

  const once = JSON.stringify(d);
  for (const kapsam of S.KAPSAM_SIRASI) {
    const plan = oynatimPlani(olaylariCikar(d.sonTurRaporu, { oyuncuAktorId: '61', kapsam }));
    toplamSure(plan);
  }
  esit(JSON.stringify(d), once, 'oyun durumu değişti');
});

// "Atlanan tur ile tam izlenen tur aynı sonucu verir" — sahne bir GİRDİ değil, ÇIKTI
// okuyucusu. Aynı rapordan hangi kapsamla liste üretilirse üretilsin oyunun sonucu aynı.
test('DEĞİŞMEZ: kapsam ne olursa olsun rapor ve sonuç aynı kalıyor', () => {
  const r = rapor();
  const kapali = JSON.stringify(r);
  olaylariCikar(r, { oyuncuAktorId: BEN, kapsam: 'kapali' });
  const a = JSON.stringify(r);
  olaylariCikar(r, { oyuncuAktorId: BEN, kapsam: 'hepsi' });
  esit(a, kapali, 'kapalı kapsam raporu değiştirdi');
  esit(JSON.stringify(r), kapali, 'hepsi kapsamı raporu değiştirdi');
});

// ═══════════════════════════════════════════════════════════════════════
// KAPSAM
// ═══════════════════════════════════════════════════════════════════════

test('kapsam kapalı: hiç olay üretilmiyor', () => {
  esit(cikar('kapali').length, 0, 'kapalıyken olay çıktı');
});

test('uzaktaki savaş cephem kapsamına GİRMİYOR', () => {
  const parcalar = cikar('cephem')
    .filter((o) => o.tip === 'savas')
    .map((o) => o.parca);
  dogru(parcalar.includes('41-1'), 'benim savaşım listede yok');
  dogru(!parcalar.includes('04-1'), 'uzaktaki savaş cephem kapsamına girmiş');
});

test('uzaktaki savaş hepsi kapsamına giriyor ama raunt dökümü almıyor', () => {
  const olaylar = cikar('hepsi');
  const uzak = olaylar.find((o) => o.tip === 'savas' && o.parca === '04-1');
  dogru(uzak, 'uzaktaki savaş hepsi kapsamında da yok');
  esit(uzak.benim, false, 'uzaktaki savaş benim sayılmış');
  const uzakVurus = olaylar.filter((o) => o.tip === 'vurus' && o.parca === '04-1');
  esit(uzakVurus.length, 0, 'uzaktaki savaşın raunt dökümü oynatılıyor');
});

test('oynatılan savaş sayısı EN_COK_SAVAS ile sınırlı', () => {
  const cokSatir = { ...rapor(), satirlar: [] };
  for (let i = 0; i < S.EN_COK_SAVAS + 5; i++)
    cokSatir.satirlar.push({
      tip: 'giris',
      aktorId: '65',
      kaynak: '65-1',
      hedef: '0' + i + '-1',
      birimler: { piyade: 1 },
      fethedildi: true,
      ilKodu: '0' + i,
      eskiSahip: '0' + i,
    });
  const secilen = oynatilacakSatirlar(cokSatir.satirlar, BEN, 'hepsi');
  esit(secilen.length, S.EN_COK_SAVAS, 'sınır uygulanmamış');
});

// 2026-08-01 düzeltmesi: sınır önce BENİM savaşlarıma da uygulanıyordu ve sekiz cephede
// savaşan bir oyuncunun savaşları sessizce atlanıyordu — ayarın bütün sözü buydu.
test('SENİN savaşların sınıra takılmıyor', () => {
  const cok = { tur: 1, satirlar: [] };
  const n = S.EN_COK_SAVAS + 4;
  for (let i = 0; i < n; i++)
    cok.satirlar.push({
      tip: 'giris',
      aktorId: BEN,
      kaynak: '16-1',
      hedef: '1' + i + '-1',
      birimler: { piyade: 1 },
      fethedildi: true,
      ilKodu: '1' + i,
      eskiSahip: '1' + i,
    });
  for (const kapsam of ['cephem', 'hepsi'])
    esit(
      oynatilacakSatirlar(cok.satirlar, BEN, kapsam).length,
      n,
      kapsam + ' kapsamında benim savaşım kesilmiş'
    );
});

test('iptal, araştırma ve toplanma satırları sahneye girmiyor', () => {
  const tipler = tipleri(cikar('hepsi'));
  dogru(!tipler.includes('iptal'), 'iptal satırı sahneye girmiş');
  dogru(!tipler.includes('arastirma'), 'araştırma satırı sahneye girmiş');
});

// ═══════════════════════════════════════════════════════════════════════
// SIRA VE SAYI
// ═══════════════════════════════════════════════════════════════════════

test('tur açılışı ilk olay, kamera ondan sonra', () => {
  const t = tipleri(cikar('cephem'));
  esit(t[0], 'turAcilisi', 'ilk olay tur açılışı değil');
  esit(t[1], 'kamera', 'kamera ikinci sırada değil');
});

test('kamera tur başına EN_COK kadar kayıyor', () => {
  const kamera = cikar('hepsi').filter((o) => o.tip === 'kamera');
  dogru(kamera.length <= S.KAMERA.EN_COK, 'kamera birden çok kez kaymış');
});

test('raunt sayısı raporun dökümüyle birebir tutuyor', () => {
  const r = rapor();
  const beklenen = r.satirlar[0].dokum.length;
  const vurus = cikar('cephem').filter((o) => o.tip === 'vurus' && o.parca === '41-1');
  esit(vurus.length, beklenen, 'raunt sayısı dökümle tutmuyor');
  esit(vurus[0].raunt, 1, 'raunt numarası 1den başlamıyor');
  esit(vurus[vurus.length - 1].raunt, beklenen, 'son raunt numarası yanlış');
});

// Sıra ekranda görüleceği sıradır: yürüyüş → şerit → vuruşlar → fetih → il kartları.
test('bir savaşın olayları doğru sırada', () => {
  const t = tipleri(cikar('cephem'));
  const yurus = t.indexOf('yurus');
  const savas = t.indexOf('savas');
  const ilkVurus = t.indexOf('vurus');
  const fetih = t.indexOf('fetih');
  const ilKarti = t.indexOf('ilTamamlandi');
  dogru(yurus < savas, 'yürüyüş şeritten sonra gelmiş');
  dogru(savas < ilkVurus, 'şerit vuruşlardan sonra açılmış');
  dogru(ilkVurus < fetih, 'fetih vuruşlardan önce gelmiş');
  dogru(fetih < ilKarti, 'il kartı fetihten önce gelmiş');
});

test('dost parçaya giriş takviye olayı üretiyor, saldırı değil', () => {
  const olaylar = cikar('cephem');
  const takviye = olaylar.find((o) => o.tip === 'takviye');
  dogru(takviye, 'takviye olayı yok');
  esit(takviye.hedef, '16-1', 'takviyenin hedefi yanlış');
  dogru(
    !olaylar.some((o) => o.tip === 'yurus' && o.hedef === '16-1'),
    'dost parçaya giriş saldırı olarak da yazılmış'
  );
});

test('bozgun ile imha ayrı olaylar', () => {
  const olaylar = cikar('hepsi');
  dogru(
    olaylar.some((o) => o.tip === 'imha' && o.parca === '41-1' && o.taraf === 'savunan'),
    'kalanı 0 olan taraf için imha olayı yok'
  );
  dogru(
    olaylar.some((o) => o.tip === 'bozgun' && o.parca === '04-1' && o.taraf === 'savunan'),
    'bozgun olayı yok'
  );
});

// ⚠ 2026-09-24 DÜZELTMESİ (Baki: "İstanbul Anadolu'yu aldım, 'il kaybedildi' yazıyor"). Bu test
// eskiden "benim fethimde bir kazanç BİR DE KAYIP kartı" bekliyordu — yani hatayı kilitliyordu:
// `ilKaybedildi` eski sahibin kaybı, oyuncunun değil. Kart artık kimin gözünden bakılıyorsa o.
test('il kartı yalnızca OYUNCUNUN kazancında: aldığım ilde yalnız İL FETHEDİLDİ', () => {
  const olaylar = cikar('hepsi');
  const kartlar = olaylar.filter((o) => o.tip === 'ilTamamlandi' || o.tip === 'ilKaybedildi');
  esit(kartlar.length, 1, 'kart sayısı yanlış');
  esit(kartlar[0].tip, 'ilTamamlandi', 'oyuncunun fethinde kayıp kartı açılmış');
  esit(kartlar[0].il, '41', 'uzaktaki ilin kartı açılmış');
});

// Tek satırlık rapor: `satir` alanları muharebe satırının üstüne yazılır.
function tekSatir(ek) {
  const temel = rapor().satirlar[0];
  return olaylariCikar(
    { tur: 5, satirlar: [{ ...temel, ...ek }], olaylar: [] },
    { oyuncuAktorId: BEN, kapsam: 'cephem' }
  );
}
const kartTipi = (olaylar) =>
  olaylar.filter((o) => /^(il|bolge)(Tamamlandi|Kaybedildi|Alindi)$/.test(o.tip)).map((o) => o.tip);

test('KART: ili tamamlamayan fetih BÖLGE ALINDI, parçanın kimliğiyle', () => {
  const o = tekSatir({ ilTamamlandi: false, ilKaybedildi: true });
  diziEsit(kartTipi(o), ['bolgeAlindi'], 'kısmi fetihte il kartı açılmış');
  const k = o.find((x) => x.tip === 'bolgeAlindi');
  esit(k.parca, '41-1', 'parça');
  esit(k.ganimet, 4, 'ganimet');
});

test('KART: benden alınan parça BÖLGE KAYBEDİLDİ, il elden çıktıysa İL KAYBEDİLDİ', () => {
  const benden = { aktorId: '41', savunanId: BEN, eskiSahip: BEN };
  diziEsit(
    kartTipi(tekSatir({ ...benden, ilTamamlandi: false, ilKaybedildi: false })),
    ['bolgeKaybedildi'],
    'parça kaybı'
  );
  const il = tekSatir({ ...benden, ilTamamlandi: true, ilKaybedildi: true });
  diziEsit(kartTipi(il), ['ilKaybedildi'], 'il kaybı: yalnız kayıp kartı (rakibin kazancı değil)');
  const k = il.find((x) => x.tip === 'ilKaybedildi');
  esit(k.eski, BEN, 'kaybeden taraf');
  esit(k.yeni, '41', 'alan taraf');
});

test('KART: boş parçama yürünmesi de kayıp kartı (savunan yok, eski sahip benim)', () => {
  const o = olaylariCikar(
    {
      tur: 5,
      satirlar: [
        {
          tip: 'giris',
          aktorId: '41',
          kaynak: '41-1',
          hedef: '16-2',
          birimler: { piyade: 1 },
          fethedildi: true,
          ganimet: 2,
          ilTamamlandi: false,
          ilKaybedildi: false,
          eskiSahip: BEN,
        },
      ],
      olaylar: [],
    },
    { oyuncuAktorId: BEN, kapsam: 'cephem' }
  );
  diziEsit(kartTipi(o), ['bolgeKaybedildi']);
});

// ═══════════════════════════════════════════════════════════════════════
// ÖNEMLİ SAVAŞ
// ═══════════════════════════════════════════════════════════════════════

test('önemli savaş: benim VE eşiği aşan', () => {
  const r = rapor();
  dogru(onemliSavasMi(r.satirlar[0], BEN), 'benim büyük savaşım önemli sayılmadı');
  dogru(!onemliSavasMi(r.satirlar[1], BEN), 'uzaktaki savaş önemli sayıldı');
});

test('eşiğin altındaki savaş oynuyor ama önemli değil', () => {
  const r = rapor();
  const kucuk = {
    ...r.satirlar[0],
    gonderilen: { piyade: 1 },
    savunanGiren: { piyade: 1 },
  };
  dogru(!onemliSavasMi(kucuk, BEN), 'küçük savaş önemli sayıldı');
  const olaylar = olaylariCikar({ tur: 1, satirlar: [kucuk] }, { oyuncuAktorId: BEN });
  dogru(
    olaylar.some((o) => o.tip === 'savas'),
    'eşiğin altındaki savaş hiç oynatılmıyor — atlanmamalı, yalnızca şerit açılmamalı'
  );
});

// ═══════════════════════════════════════════════════════════════════════
// OYNATIM PLANI
// ═══════════════════════════════════════════════════════════════════════

test('her olaya süre yazılıyor ve toplam pozitif', () => {
  const plan = oynatimPlani(cikar('cephem'));
  for (const o of plan) dogru(typeof o.sure === 'number' && o.sure >= 0, o.tip + ' süresiz');
  dogru(toplamSure(plan) > 0, 'toplam süre sıfır');
});

test('İLKİ TAM, TEKRARI KISA: eşikten sonraki olay kısalıyor', () => {
  const cokVurus = [];
  for (let i = 0; i < S.TEKRAR_ESIGI + 3; i++)
    cokVurus.push({ tip: 'vurus', parca: 'x', raunt: i });
  const plan = oynatimPlani(cokVurus);
  const ilk = plan[0].sure;
  const son = plan[plan.length - 1].sure;
  dogru(son < ilk, 'tekrarlayan olay kısalmamış (' + ilk + ' → ' + son + ')');
  esit(plan[S.TEKRAR_ESIGI - 1].sure, ilk, 'eşiğin içindeki olay erken kısalmış');
});

test('HIZ_CARPANI bütün süreleri ölçekliyor', () => {
  const asil = S.HIZ_CARPANI;
  const olaylar = cikar('cephem');
  const tam = toplamSure(oynatimPlani(olaylar));
  S.HIZ_CARPANI = asil / 2;
  const yarim = toplamSure(oynatimPlani(olaylar));
  S.HIZ_CARPANI = asil;
  dogru(yarim < tam, 'hız çarpanı süreyi değiştirmedi');
});

// İstanbul (nüfus+ekonomi en yüksek) kartı, en değersiz ilin kartından uzun durmalı —
// "Iğdır'ı almak İstanbul'u almakla aynı hissettiriyor" şikâyetinin ölçülebilir hâli.
test('ÖLÇEK: değerli ilin kartı değersizinkinden uzun', () => {
  dogru(ilOlcegi('34') > ilOlcegi('76'), 'İstanbul kartı Iğdırdan uzun değil');
  const kart = (il) => oynatimPlani([{ tip: 'ilTamamlandi', il }])[0].sure;
  dogru(kart('34') > kart('76'), 'kart süresi ölçekten etkilenmiyor');
});

test('ÖLÇEK: OLCEK_GUCU sıfırlanınca bütün iller eşitleniyor', () => {
  const asil = S.OLCEK_GUCU;
  S.OLCEK_GUCU = 0;
  const esitMi = ilOlcegi('34') === ilOlcegi('76');
  S.OLCEK_GUCU = asil;
  dogru(esitMi, 'ölçek gücü 0 iken iller hâlâ farklı');
});
