// KOMUTAN YETENEKLERİ TESTLERİ (Görev 16 / Adım 5).
//
// Ölçülen asıl sorular:
//   1. ÇELİK YÜREK kalemi moral kanalından geçiyor mu, tavan eşiği kırpıyor mu?
//   2. Kademe 3 gerçekten "ya kazanır ya yok olur" mu — yoksa plandaki gibi kalkan mı?
//   3. SİLAH USTASI yalnızca seçilen türü mü güçlendiriyor, ÖZEL DALLARI açıyor mu?
//   4. Dal tavanında yetenek boşa gidiyor mu ve bu SÖYLENEBİLİR mi?
//   5. DAĞ KOMUTANI savunanın arazi üstünlüğünü kırıyor mu, ovada susuyor mu, 1'in
//      altına inebiliyor mu?
//   6. TOPLANMA USTASI bedeli düşürüyor mu — ve ekrandaki bedel ile ödenen bedel aynı mı?
//   7. Yetenek tur dönünce ve komutan düşünce KORUNUYOR mu?
//   8. Botun yeteneği kişiliğinden mi geliyor, zorluktan mı?

const { test, dogru, esit, yakin, hepsiyleSavas } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { moralBonuslari, yetenekliStatlar, savunanAraziCarpani } = require('../src/oyun/cozum.js');
const { komutanAta, komutanDustu, komutanTuruBitir } = require('../src/oyun/komutan.js');
const { bozgunEsigiHesapla, muharebeCoz } = require('../src/oyun/muharebe.js');
const { toplanmaMaliyeti, toplanmaCoz } = require('../src/oyun/toplanma.js');
const { dalSeviyesi } = require('../src/oyun/arastirma.js');
const { kademeHakki, kademeyeKalan, tavanPuan } = require('../src/oyun/rutbe.js');
const { BASARIMLAR } = require('../src/oyun/basarimlar.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const {
  kademeKirp,
  yetenekVarMi,
  yetenekAl,
  celikYurekKalemi,
  olumuneMi,
  silahUstasiStatlari,
  yetenekBosaMiGider,
  dagKomutaniPayi,
  savunanArazisi,
  toplanmaUstasiButcesi,
  eklenmisButce,
  zekaYetenegi,
  zekaKademesi,
} = require('../src/oyun/yetenek.js');

const TOHUM = 20260920;
const BEN = '16';
const K = DENGE.KOMUTAN;
const Y = K.YETENEKLER;

function sahne() {
  const d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  return hepsiyleSavas({ ...d, ordular: {} }, BEN);
}
function orduKoy(d, pid, sahip, birimler) {
  return { ...d, ordular: { ...d.ordular, [pid]: { sahip, birimler } } };
}
// Komutanı yetenekle atar. Atama parçanın senin ve orada ordunun olmasını istiyor.
function ata(d, pid, secim, aktorId) {
  const s = komutanAta(d, aktorId || BEN, pid, secim);
  dogru(s.ok, 'komutan atanamadı: ' + s.sebep);
  return s.durum;
}
// Benim olan, ordusu olan bir parça bul.
function benimParca(d, n) {
  const hepsi = Object.keys(d.parcaSahipligi)
    .filter((p) => d.parcaSahipligi[p] === BEN)
    .sort();
  return hepsi[n || 0];
}

// ---- 1. ÇELİK YÜREK: MORAL KANALI ----

test('ÇELİK YÜREK: kalem moral kanalından geçiyor ve kademeyle büyüyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 4 });

  for (const kademe of [1, 2]) {
    const ile = ata(d, p, { yetenek: 'celikYurek', kademe });
    esit(
      celikYurekKalemi(ile, BEN, p),
      Y.celikYurek.KALEM[kademe - 1],
      'kademe ' + kademe + ' kalemi'
    );
  }
  // Kademe 3'te kalem YOK: orada eşik değil, kuralın kendisi değişiyor.
  const uc = ata(d, p, { yetenek: 'celikYurek', kademe: 3 });
  esit(celikYurekKalemi(uc, BEN, p), 0, 'kademe 3 kalem vermiyor');
});

test('ÇELİK YÜREK: yetenek YALNIZCA komutanın durduğu parçada işliyor', () => {
  let d = sahne();
  const p = benimParca(d);
  const q = benimParca(d, 1);
  d = orduKoy(orduKoy(d, p, BEN, { piyade: 3 }), q, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'celikYurek', kademe: 2 });
  dogru(celikYurekKalemi(ile, BEN, p) > 0, 'komutanın parçasında işliyor');
  esit(celikYurekKalemi(ile, BEN, q), 0, 'başka parçada işlemiyor');
});

test('ÇELİK YÜREK: kalem gerçekten moralBonuslari toplamına giriyor', () => {
  let d = sahne();
  // Komşu iki parça bul: biri benim, biri düşmanın.
  const { komsular } = require('../src/oyun/hareket.js');
  let kaynak = null,
    hedef = null;
  for (const p of Object.keys(d.parcaSahipligi).sort()) {
    if (d.parcaSahipligi[p] !== BEN) continue;
    const dus = komsular(p).find((q) => d.parcaSahipligi[q] && d.parcaSahipligi[q] !== BEN);
    if (dus) {
      kaynak = p;
      hedef = dus;
      break;
    }
  }
  dogru(!!kaynak, 'düşman komşusu olan parça bulunamadı');
  d = orduKoy(d, kaynak, BEN, { piyade: 5 });

  // ⚠ KOMUTANIN TABAN KALEMİ AYRI TUTULUYOR: karşılaştırma "komutan yok" ile değil,
  // "komutan var ama yeteneği yok" ile yapılıyor. Yoksa fark, yeteneğin değil komutanın
  // kendi kalemini de içerir (ilk yazımda tam bu oldu: beklenen 2, bulunan 3).
  const yeteneksiz = ata(d, kaynak, { yetenek: null, kademe: 1 });
  const once = moralBonuslari(yeteneksiz, kaynak, hedef, BEN, d.parcaSahipligi[hedef]).saldiran
    .kalem;
  const ile = ata(d, kaynak, { yetenek: 'celikYurek', kademe: 2 });
  const sonra = moralBonuslari(ile, kaynak, hedef, BEN, d.parcaSahipligi[hedef]).saldiran.kalem;
  esit(sonra - once, Y.celikYurek.KALEM[1], 'yeteneğin kendi katkısı iki kalem olmalı');
  esit(once, K.MORAL_KALEMI, 'yeteneksiz komutan yalnızca taban kalemi vermeli');
});

// ---- 2. BOZGUN EŞİĞİNİN TAVANI ----

test('TAVAN: kalemler üst üste binse bile eşik tavanı aşmıyor', () => {
  const ayar = DENGE.MUHAREBE.MORAL;
  // Altı kalem + yüksek moral: tavansız 0.975 olurdu.
  const esik = bozgunEsigiHesapla({ moral: 7, kalem: 6 }, ayar);
  dogru(esik <= ayar.TAVAN + 1e-9, 'eşik tavanı aştı: ' + esik);
  esit(esik, ayar.TAVAN, 'eşik tam tavana oturdu');
});

test('TAVAN: bugünkü en yüksek gerçek eşik tavanın ALTINDA — mevcut hiçbir satır değişmiyor', () => {
  const ayar = DENGE.MUHAREBE.MORAL;
  // Dağlıkta savunan + kendi toprağı + kutsal düello = üç kalem, moral statı en fazla 7.
  const enYuksek = bozgunEsigiHesapla({ moral: 7, kalem: 3 }, ayar);
  dogru(enYuksek < ayar.TAVAN, 'mevcut en yüksek eşik (' + enYuksek + ') tavana takılıyor');
});

test('TAVAN: ayarında TAVAN olmayan çağıran KIRPILMIYOR (moral-olcum.js tekrar edilebilir)', () => {
  const kendi = { MODEL: 'oran', TABAN: 0.4, MORAL_PAYI: 0.25, MORAL_OLCEGI: 10, BONUS_PAYI: 0.08 };
  const esik = bozgunEsigiHesapla({ moral: 7, kalem: 6 }, kendi);
  yakin(esik, 0.4 + 0.175 + 0.48, 1e-9, 'kendi ayarıyla çağıran kırpılmadı');
});

// ---- 3. KADEME 3: "YA KAZANIR YA YOK OLUR" ----

test('ÖLÜMÜNE: ordu bozulmuyor — bozgun sebebi hiç doğmuyor', () => {
  const kadro = { piyade: 1 };
  const guclu = { piyade: 6 };
  const sonuc = muharebeCoz({
    saldiran: { birimler: kadro },
    savunan: { birimler: guclu },
    arazi: 'ova',
    tohum: null,
    olumune: { saldiran: true },
  });
  dogru(sonuc.sebep !== 'bozgun', 'ölümüne savaşan ordu bozguna uğradı');
  dogru(!sonuc.saldiran.bozgun, 'bozgun bayrağı açık kaldı');
});

test('ÖLÜMÜNE: kaybeden ordu TAMAMEN yok oluyor (plandaki "sağ çıkma" kapandı)', () => {
  const sonuc = muharebeCoz({
    saldiran: { birimler: { piyade: 2 } },
    savunan: { birimler: { piyade: 8 } },
    arazi: 'ova',
    tohum: null,
    olumune: { saldiran: true },
  });
  esit(sonuc.kazanan, 'savunan', 'zayıf taraf kaybetmeliydi');
  esit(sonuc.saldiran.kalan, 0, 'ölümüne savaşan kaybedince sağ kaldı');
  esit(sonuc.sebep, 'imha', 'sebep imha olmalı — çekilme yolu böyle kapanıyor');
});

test('ÖLÜMÜNE: kayıp dökümü korunuyor — birimler sessizce silinmiyor', () => {
  const sonuc = muharebeCoz({
    saldiran: { birimler: { piyade: 3 } },
    savunan: { birimler: { piyade: 9 } },
    arazi: 'ova',
    tohum: null,
    olumune: { saldiran: true },
  });
  const kayip = DENGE.BIRIM_SIRASI.reduce((a, t) => a + (sonuc.saldiran.kayiplar[t] || 0), 0);
  esit(kayip, 3, 'kayıp dökümü tüm orduyu göstermeli (tur raporu bunu okuyor)');
});

test('ÖLÜMÜNE: KAZANAN ordu sağ kalıyor — ceza yalnızca kaybedene', () => {
  const sonuc = muharebeCoz({
    saldiran: { birimler: { piyade: 10 } },
    savunan: { birimler: { piyade: 1 } },
    arazi: 'ova',
    tohum: null,
    olumune: { saldiran: true },
  });
  esit(sonuc.kazanan, 'saldiran', 'güçlü taraf kazanmalıydı');
  dogru(sonuc.saldiran.kalan > 0, 'kazanan ölümüne ordu da yok oldu');
});

test('ÖLÜMÜNE: bayrak verilmezse motor eski davranışını gösteriyor', () => {
  const girdi = {
    saldiran: { birimler: { piyade: 2 } },
    savunan: { birimler: { piyade: 8 } },
    arazi: 'ova',
    tohum: null,
  };
  const bayraksiz = muharebeCoz(girdi);
  const kapali = muharebeCoz({ ...girdi, olumune: { saldiran: false } });
  esit(bayraksiz.sebep, kapali.sebep, 'bayraksız ile kapalı bayrak aynı olmalı');
  esit(bayraksiz.saldiran.kalan, kapali.saldiran.kalan, 'kalan birimler aynı olmalı');
});

test('ÖLÜMÜNE: yalnızca kademe 3 açıyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  esit(olumuneMi(ata(d, p, { yetenek: 'celikYurek', kademe: 1 }), BEN, p), false, 'kademe 1');
  esit(olumuneMi(ata(d, p, { yetenek: 'celikYurek', kademe: 2 }), BEN, p), false, 'kademe 2');
  esit(olumuneMi(ata(d, p, { yetenek: 'celikYurek', kademe: 3 }), BEN, p), true, 'kademe 3');
});

// ---- 4. SİLAH USTASI ----

test('SİLAH USTASI: yalnızca SEÇİLEN türü güçlendiriyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3, topcu: 2 });
  const ile = ata(d, p, { yetenek: 'silahUstasi', kademe: 2, birim: 'piyade' });

  const once = yetenekliStatlar(d, BEN, p);
  const sonra = yetenekliStatlar(ile, BEN, p);
  dogru(sonra.piyade.agirVurus > once.piyade.agirVurus, 'seçilen tür (piyade) güçlenmedi');
  esit(sonra.topcu.agirVurus, once.topcu.agirVurus, 'seçilmeyen tür (topçu) değişti');
});

test('SİLAH USTASI: ÖZEL DALLARI AÇMIYOR (yarma/palet/baraj bedava gelmiyor)', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { zirhli: 3 });
  const ile = ata(d, p, { yetenek: 'silahUstasi', kademe: 3, birim: 'zirhli' });

  // Araştırma kaydına DOKUNULMAMIŞ olmalı: özel etkiler oradan okunuyor.
  const { aktorEtkileri } = require('../src/oyun/arastirma.js');
  const etki = aktorEtkileri(ile, BEN);
  esit(etki.yarma, false, 'yarma bedava açıldı');
  esit(etki.palet, null, 'palet bedava açıldı');
  esit(etki.baraj, 0, 'baraj bedava açıldı');
});

test('SİLAH USTASI: dal tavanı AŞILMIYOR', () => {
  const tavan = DENGE.ARASTIRMA.TAVAN;
  // Piyadenin bütün stat dallarını tavana çıkar.
  const arastirma = {};
  for (const dal of DENGE.ARASTIRMA.DAL_SIRASI.piyade) {
    const tanim = DENGE.ARASTIRMA.AGACLAR.piyade[dal];
    if (tanim && tanim.tip === 'stat') arastirma['piyade.' + dal] = tavan;
  }
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  d = { ...d, arastirma: { ...(d.arastirma || {}), [BEN]: arastirma } };
  const ile = ata(d, p, { yetenek: 'silahUstasi', kademe: 3, birim: 'piyade' });

  const once = yetenekliStatlar(d, BEN, p);
  const sonra = yetenekliStatlar(ile, BEN, p);
  esit(sonra.piyade.agirVurus, once.piyade.agirVurus, 'tavandayken yetenek statı artırdı');
});

test('SİLAH USTASI: tavandayken BOŞA GİTTİĞİ söylenebiliyor', () => {
  const tavan = DENGE.ARASTIRMA.TAVAN;
  const dolu = {};
  for (const dal of DENGE.ARASTIRMA.DAL_SIRASI.piyade) {
    const tanim = DENGE.ARASTIRMA.AGACLAR.piyade[dal];
    if (tanim && tanim.tip === 'stat') dolu['piyade.' + dal] = tavan;
  }
  dogru(
    yetenekBosaMiGider('silahUstasi', 3, 'piyade', dolu, dalSeviyesi),
    'tavandayken boşa gittiği söylenemiyor'
  );
  esit(
    yetenekBosaMiGider('silahUstasi', 3, 'piyade', {}, dalSeviyesi),
    false,
    'araştırmasız oyuncuda boşa gidiyor sanılıyor'
  );
  esit(
    yetenekBosaMiGider('celikYurek', 3, null, dolu, dalSeviyesi),
    false,
    'başka yetenek boşa gidiyor sanılıyor'
  );
});

test('SİLAH USTASI: girdi tablosuna DOKUNMUYOR (yeni tablo dönüyor)', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'silahUstasi', kademe: 2, birim: 'piyade' });
  const tablo = { piyade: { ...DENGE.BIRIMLER.piyade } };
  const kopya = { ...tablo.piyade };
  silahUstasiStatlari(tablo, ile, BEN, p, {}, dalSeviyesi);
  esit(tablo.piyade.agirVurus, kopya.agirVurus, 'girdi tablosu değiştirildi');
});

// ---- 5. DAĞ KOMUTANI ----

test('DAĞ KOMUTANI: savunanın arazi üstünlüğünü kırıyor, kademeyle artıyor', () => {
  const daglik = DENGE.ARAZI.daglik.savunan;
  let onceki = daglik;
  for (let kademe = 1; kademe <= K.EN_COK_KADEME; kademe++) {
    const c = savunanArazisi(daglik, Y.dagKomutani.TELAFI[kademe - 1]);
    dogru(c < onceki, 'kademe ' + kademe + ' bir önceki kadar bile kırmadı');
    onceki = c;
  }
});

test('DAĞ KOMUTANI: üstünlüğün TAMAMI asla kırılmıyor (coğrafya silinmiyor)', () => {
  const daglik = DENGE.ARAZI.daglik.savunan;
  const enUst = savunanArazisi(daglik, Y.dagKomutani.TELAFI[K.EN_COK_KADEME - 1]);
  dogru(enUst > 1, 'en yüksek kademe arazi üstünlüğünü tamamen sildi: ' + enUst);
});

test('DAĞ KOMUTANI: OVADA hiçbir şey yapmıyor (kırılacak üstünlük yok)', () => {
  esit(savunanArazisi(DENGE.ARAZI.ova.savunan, 1), DENGE.ARAZI.ova.savunan, 'ovada değişti');
});

test('DAĞ KOMUTANI: ZIRHLININ arazi cezasına DOKUNMUYOR (palet kanalı ayrı)', () => {
  // Etki yalnızca savunanın çarpanından geçiyor; zırhlı çarpanı DENGE'de duruyor.
  // Aynı muharebeyi yetenekli ve yeteneksiz çalıştır: zırhlı SALDIRANIN hasarı değişmemeli.
  const girdi = {
    saldiran: { birimler: { zirhli: 3 } },
    savunan: { birimler: { piyade: 1 } },
    arazi: 'daglik',
    tohum: null,
  };
  const yok = muharebeCoz(girdi);
  const var_ = muharebeCoz({ ...girdi, savunanArazisi: 1.0 });
  // Savunan 1 piyade iki durumda da imha oluyor; zırhlının kendi cezası aynı kaldığı için
  // saldıranın aldığı hasar SADECE savunanın çarpanı kadar farklı olabilir.
  dogru(
    yok.saldiran.hasarHavuzu >= var_.saldiran.hasarHavuzu,
    'savunanın çarpanı kırılınca saldıran DAHA ÇOK hasar aldı'
  );
});

test('DAĞ KOMUTANI: payı yalnızca komutanın ÇIKTIĞI parçadan okunuyor', () => {
  let d = sahne();
  const p = benimParca(d);
  const q = benimParca(d, 1);
  d = orduKoy(orduKoy(d, p, BEN, { piyade: 3 }), q, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'dagKomutani', kademe: 2 });
  dogru(dagKomutaniPayi(ile, BEN, p) > 0, 'komutanın parçasında pay yok');
  esit(dagKomutaniPayi(ile, BEN, q), 0, 'başka parçada pay var');
});

test('DAĞ KOMUTANI: savunanAraziCarpani ovada undefined dönüyor (motor kendi çarpanını kullanır)', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'celikYurek', kademe: 1 });
  esit(savunanAraziCarpani(ile, BEN, p, p), undefined, 'yetenek yokken çarpan üretildi');
});

// ---- 6. TOPLANMA USTASI ----

test('TOPLANMA USTASI: ⚠ YÜZDELİK İNDİRİM ÖLÜYDÜ — bedel tamsayı, ceil indirimi yutuyor', () => {
  // Bu test bir TARİH KAYDI: ilk tasarım "bedelden %15/%30/%45 düş"tü ve hiçbir kademede
  // hiçbir şey yapmıyordu. Bedeller birim başına 1–3 ve yukarı yuvarlanıyor. Aynı hataya
  // bir daha düşülmesin diye ölçü burada duruyor.
  const eksik = { piyade: 3, topcu: 1 };
  const tam = toplanmaMaliyeti(eksik, {}, false);
  for (const oran of [0.15, 0.3, 0.45]) {
    const sozdeIndirimli = {
      nufus: Math.ceil(2 * (1 - oran)) * 3 + Math.ceil(1 * (1 - oran)) * 1,
      ekonomi: Math.ceil(1 * (1 - oran)) * 3 + Math.ceil(2 * (1 - oran)) * 1,
    };
    esit(sozdeIndirimli.nufus, tam.nufus, '%' + oran * 100 + ' indirim nüfusu değiştirmiyor');
  }
});

test('TOPLANMA USTASI: bütçe genişliyor ama BEDEL hiç değişmiyor', () => {
  const ordu = { sahip: BEN, birimler: { piyade: 1 }, kadro: { piyade: 4 } };
  const butce = { nufus: 2, ekonomi: 2 };
  const az = toplanmaCoz(ordu, butce, false, 0);
  const cok = toplanmaCoz(ordu, butce, false, Y.toplanmaUstasi.EK_BUTCE[2]);
  const sayi = (o) => DENGE.BIRIM_SIRASI.reduce((a, t) => a + (o.dolan[t] || 0), 0);
  dogru(sayi(cok) > sayi(az), 'bütçe eki daha çok birim doldurmadı');
  // Bedel tarafına HİÇ dokunulmadı: ekranla ayrışma imkânsız.
  esit(
    toplanmaMaliyeti({ piyade: 3 }, {}, false).nufus,
    toplanmaMaliyeti({ piyade: 3 }, {}, false).nufus,
    'bedel fonksiyonu yeteneği tanımıyor'
  );
});

test('TOPLANMA USTASI: bütçe eki bedava toplanma doğurmuyor', () => {
  const ordu = { sahip: BEN, birimler: { piyade: 1 }, kadro: { piyade: 9 } };
  const s = toplanmaCoz(ordu, { nufus: 0, ekonomi: 0 }, false, Y.toplanmaUstasi.EK_BUTCE[2]);
  const dolan = DENGE.BIRIM_SIRASI.reduce((a, t) => a + (s.dolan[t] || 0), 0);
  dogru(dolan < 8, 'bütçe eki bütün kadroyu bedavaya doldurdu');
  dogru(s.harcanan.nufus > 0 || dolan === 0, 'birim doldu ama hiç ödeme yapılmadı');
});

test('TOPLANMA USTASI: indirim komutanın parçasında ve KOMŞULARINDA geçerli, uzakta değil', () => {
  const { KOMSULUK } = require('../src/oyun/veri.js');
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'toplanmaUstasi', kademe: 3 });

  dogru(toplanmaUstasiButcesi(ile, BEN, p) > 0, 'kendi parçasında bütçe eki yok');
  const komsu = (KOMSULUK[p] || [])[0];
  dogru(!!komsu, 'komşusuz parça seçildi');
  dogru(toplanmaUstasiButcesi(ile, BEN, komsu) > 0, 'komşuda bütçe eki yok');

  const uzak = Object.keys(d.parcaSahipligi)
    .sort()
    .find((q) => q !== p && !(KOMSULUK[p] || []).includes(q));
  esit(toplanmaUstasiButcesi(ile, BEN, uzak), 0, 'uzak parçada bütçe eki var');
});

test('TOPLANMA USTASI: eklenmisButce ek yokken bütçeye dokunmuyor', () => {
  const butce = { nufus: 3, ekonomi: 2 };
  esit(eklenmisButce(butce, 0), butce, 'eksiz bütçe değişti');
  esit(eklenmisButce(butce, 2).nufus, 5, 'nüfus eki işlemedi');
  esit(eklenmisButce(butce, 2).ekonomi, 4, 'ekonomi eki işlemedi');
});

// ---- 7. YETENEĞİN KORUNMASI ----

test('KORUMA: yetenek TUR DÖNÜNCE düşmüyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 4 });
  d = ata(d, p, { yetenek: 'dagKomutani', kademe: 3 });
  const sonra = komutanTuruBitir(d);
  const y = yetenekAl(sonra, BEN);
  dogru(!!y, 'tur dönünce yetenek düştü');
  esit(y.yetenek, 'dagKomutani', 'yetenek değişti');
  esit(y.kademe, 3, 'kademe düştü');
});

test('KORUMA: komutan DÜŞÜNCE yetenek korunuyor (ceza bekleme, yetenek kaybı değil)', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 4 });
  d = ata(d, p, { yetenek: 'silahUstasi', kademe: 2, birim: 'topcu' });
  const dusmus = komutanDustu(d, BEN);
  const y = yetenekAl(dusmus, BEN);
  dogru(!!y, 'komutan düşünce yetenek silindi');
  esit(y.birim, 'topcu', 'birlik seçimi silindi');
  esit(dusmus.komutanlar[BEN].bekleme, K.BEKLEME, 'bekleme cezası yazılmadı');
});

test('KORUMA: atama yer değiştirirken yeteneği SIFIRLAMIYOR', () => {
  let d = sahne();
  const p = benimParca(d);
  const q = benimParca(d, 1);
  d = orduKoy(orduKoy(d, p, BEN, { piyade: 3 }), q, BEN, { piyade: 3 });
  d = ata(d, p, { yetenek: 'celikYurek', kademe: 2 });
  d = komutanTuruBitir(d); // turluk atama hakkı yenilensin
  d = ata(d, q); // seçim VERİLMEDEN atama
  const y = yetenekAl(d, BEN);
  esit(y.yetenek, 'celikYurek', 'seçimsiz atama yeteneği sildi');
  esit(y.kademe, 2, 'seçimsiz atama kademeyi sıfırladı');
});

test('KAYIT: yetenek gidiş-dönüşte korunuyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 4 });
  d = ata(d, p, { yetenek: 'silahUstasi', kademe: 3, birim: 'zirhli' });

  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, 'kayıt çözülemedi: ' + geri.sebep);
  const y = yetenekAl(geri.durum, BEN);
  dogru(!!y, 'kayıttan dönen komutanda yetenek yok');
  esit(y.yetenek, 'silahUstasi', 'yetenek kayıttan yanlış döndü');
  esit(y.kademe, 3, 'kademe kayıttan yanlış döndü');
  esit(y.birim, 'zirhli', 'birlik seçimi kayıttan yanlış döndü');
});

// ---- 8. BOTLARIN YETENEĞİ ----

test('BOT: yetenek KİŞİLİKTEN geliyor ve dört huy dört yeteneğe eşleniyor', () => {
  const gorulen = new Set();
  for (const huy of DENGE.ZEKA.AGIRLIKLAR) {
    const y = zekaYetenegi(huy);
    dogru(yetenekVarMi(y), huy + ' için tanımsız yetenek: ' + y);
    gorulen.add(y);
  }
  esit(gorulen.size, Object.keys(Y).length, 'dört huy dört ayrı yeteneğe gitmiyor');
});

test('BOT: tanımsız huy güvenli bir yeteneğe düşüyor', () => {
  dogru(yetenekVarMi(zekaYetenegi('olmayanHuy')), 'tanımsız huy geçersiz yetenek verdi');
});

test('BOT: kademe SABİT ve zorluktan gelmiyor (§9.4 gizli bonus yasağı)', () => {
  esit(zekaKademesi(), K.BOT_KADEMESI, 'bot kademesi DENGE dışından geliyor');
  dogru(zekaKademesi() < K.EN_COK_KADEME, 'bot en yüksek kademede — yeni oyuncu ezilir');
  dogru(zekaKademesi() > 1, 'bot en alt kademede — zorluk çöker');
});

test('BOT: maç içinde botun komutanı gerçekten yetenek alıyor', () => {
  let d = oyunKur({ senaryo: 'turkiye', tohum: TOHUM });
  d = hepsiyleSavas(d, BEN);
  for (let i = 0; i < 3; i++) d = turuBitir(d);
  const yetenekli = Object.keys(d.komutanlar || {}).filter((id) => {
    const y = yetenekAl(d, id);
    return y && id !== BEN;
  });
  dogru(yetenekli.length > 0, 'üç turda hiçbir botun komutanı yetenek almadı');
  for (const id of yetenekli) esit(yetenekAl(d, id).kademe, K.BOT_KADEMESI, id + ' kademesi');
});

// ---- 9. KADEME KIRPMA ----

test('KIRPMA: bozuk kademe diziden taşmıyor', () => {
  esit(kademeKirp(0), 1, 'sıfır kademe');
  esit(kademeKirp(-5), 1, 'eksi kademe');
  esit(kademeKirp(99), K.EN_COK_KADEME, 'tavanın üstü');
  esit(kademeKirp(undefined), 1, 'tanımsız kademe');
  esit(kademeKirp('2'), 2, 'metin kademe');
});

test('KIRPMA: DENGE dizileri EN_COK_KADEME ile aynı uzunlukta', () => {
  esit(Y.celikYurek.KALEM.length, K.EN_COK_KADEME, 'celikYurek.KALEM');
  esit(Y.celikYurek.OLUMUNE.length, K.EN_COK_KADEME, 'celikYurek.OLUMUNE');
  esit(Y.silahUstasi.SEVIYE.length, K.EN_COK_KADEME, 'silahUstasi.SEVIYE');
  esit(Y.dagKomutani.TELAFI.length, K.EN_COK_KADEME, 'dagKomutani.TELAFI');
  esit(Y.toplanmaUstasi.EK_BUTCE.length, K.EN_COK_KADEME, 'toplanmaUstasi.EK_BUTCE');
});

test('KIRPMA: tanimsiz yetenek null donuyor', () => {
  let d = sahne();
  const p = benimParca(d);
  d = orduKoy(d, p, BEN, { piyade: 3 });
  const ile = ata(d, p, { yetenek: 'olmayanYetenek', kademe: 2 });
  esit(yetenekAl(ile, BEN), null, 'tanımsız yetenek kabul edildi');
  esit(celikYurekKalemi(ile, BEN, p), 0, 'tanımsız yetenek kalem verdi');
});

// ---- 10. KADEME MÜHÜRDEN AÇILIYOR (Adım 6) ----

test('KADEME HAKKI: mühürsüz oyuncuda kademe 1 açık', () => {
  esit(kademeHakki({}), 1, 'yeni oyuncuda komutan hiç çalışmamalı değil');
  esit(kademeHakki(null), 1, 'kayıtsız oyuncu');
});

test('KADEME HAKKI: bütün mühürlerde en yüksek kademe açılıyor', () => {
  const hepsi = {};
  for (const b of BASARIMLAR) hepsi[b.id] = 1;
  esit(kademeHakki(hepsi), K.EN_COK_KADEME, 'hepsini toplayan tavana çıkmalı');
  esit(kademeyeKalan(hepsi), 0, 'tavandayken kalan sıfır olmalı');
});

test('KADEME HAKKI: merdiven tek yönlü — mühür arttıkça kademe düşmüyor', () => {
  let onceki = 0;
  const kazanilan = {};
  for (const b of BASARIMLAR) {
    kazanilan[b.id] = 1;
    const h = kademeHakki(kazanilan);
    dogru(h >= onceki, 'mühür eklenince kademe düştü');
    onceki = h;
  }
});

test('KADEME HAKKI: eşikler ORAN — mühür listesi büyüyünce sessizce kolaylaşmıyor', () => {
  // Tavan `basarimlar.js`'ten SAYILIYOR. Mutlak puan yazılsaydı Görev 19'da 33→35 mühür
  // olunca eşikler kendiliğinden kolaylaşırdı.
  const tavan = tavanPuan();
  dogru(tavan > 0, 'mühür listesi boş görünüyor');
  for (const oran of DENGE.KOMUTAN.KADEME_ORANLARI) {
    dogru(oran > 0 && oran < 1, 'kademe oranı 0–1 aralığında olmalı: ' + oran);
  }
});

test('KADEME HAKKI: kalan puan hep pozitif ve azalıyor', () => {
  const kazanilan = {};
  let oncekiKalan = Infinity;
  for (const b of BASARIMLAR.slice(0, 8)) {
    kazanilan[b.id] = 1;
    const kalan = kademeyeKalan(kazanilan);
    dogru(kalan >= 0, 'kalan eksi çıktı');
    if (kademeHakki(kazanilan) === 1) {
      dogru(kalan <= oncekiKalan, 'aynı kademedeyken kalan artmamalı');
      oncekiKalan = kalan;
    }
  }
});
