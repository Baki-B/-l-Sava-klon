// DİPLOMASİ TESTLERİ (Görev 09 / Adım 1 — görev belgesi §9).
//
// Bu adımın bitiş ölçütü: ÜÇ İLİŞKİ DURUMU ÇALIŞIYOR VE KURALLAR TEK KAPIDAN GEÇİYOR.
// Testler beş şeyi kilitliyor:
//   1. İlişkiler simetrik; aynı çift iki kez yazılamıyor.
//   2. Müttefike saldırı engelleniyor — OYUNCU VE YAPAY ZEKÂ AYNI KAPIDAN.
//   3. Zincir TEK ADIM yayılıyor (yoksa ilk savaşta harita ikiye bölünür).
//   4. İhanet bedeli işliyor, süresi dolunca diplomasi açılıyor.
//   5. Düello diplomasiden ÜSTÜN (§11 "düello kutsaldır, bölünmez").

const { test, dogru, esit, savasYaz } = require('./yardimci');
const { DENGE } = require('../src/denge.js');
const { oyunKur } = require('../src/oyun/oyunDurumu.js');
const { turuBitir } = require('../src/oyun/turDongusu.js');
const { kayitMetni, metinCoz } = require('../src/oyun/kayitVerisi.js');
const { hareketGecerliMi } = require('../src/oyun/hareket.js');
const { savasIlanPuani } = require('../src/oyun/zeka.js');
const { husumetBul } = require('../src/oyun/rekabet.js');
const { KOMSULUK } = require('../src/oyun/veri.js');
const { HUSUMETLER } = require('../veri/husumetler.js');
const {
  TARAFSIZ,
  ITTIFAK,
  SAVAS,
  anahtar,
  iliskiDurumu,
  ittifakMi,
  savastaMi,
  muttefikler,
  dusmanlar,
  baskasiylaSavastaMi,
  ihanetliMi,
  tanidiklar,
  tanidikMi,
  teklifGecerliMi,
  teklifUygula,
  savasBasla,
  savasIlanGecerliMi,
  savasIlanEt,
  zincirYay,
  ittifakBoz,
  savasBitir,
  iliskileriGuncelle,
  ittifakEsigi,
  ittifakGucu,
} = require('../src/oyun/diplomasi.js');

const D = DENGE.DIPLOMASI;
const kur = (sec) => oyunKur({ senaryo: 'turkiye', tohum: 20260801, ...(sec || {}) });

// Bir ilişkiyi doğrudan kurar — teklif kapısından geçmeden, kuralları tek tek sınamak için.
function iliskiKoy(d, a, b, tip, ek) {
  return {
    ...d,
    iliskiler: { ...(d.iliskiler || {}), [anahtar(a, b)]: { tip, turdan: d.tur, ...(ek || {}) } },
  };
}

// ---- SİMETRİ VE ANAHTAR ----

test('İLİŞKİ: varsayılan TARAFSIZ ve kayda hiç girmiyor', () => {
  const d = kur();
  esit(iliskiDurumu(d, '16', '06'), TARAFSIZ, 'başlangıçta tarafsız olmalı');
  esit(Object.keys(d.iliskiler).length, 0, 'başlangıçta ilişki satırı olmamalı');
  esit(kayitMetni(d).includes('"iliskiler":{}'), true, 'ilişkiler alanı kayda boş girmeli');
});

test('İLİŞKİ: SİMETRİK — hangi sırayla sorulursa sorulsun aynı', () => {
  const d = iliskiKoy(kur(), '34', '06', ITTIFAK);
  esit(iliskiDurumu(d, '34', '06'), ITTIFAK, 'A→B');
  esit(iliskiDurumu(d, '06', '34'), ITTIFAK, 'B→A');
  dogru(ittifakMi(d, '06', '34'), 'ittifakMi simetrik değil');
});

test('İLİŞKİ: aynı çift İKİ KEZ yazılamıyor (anahtar sıralı)', () => {
  esit(anahtar('34', '06'), anahtar('06', '34'), 'anahtar yön duyarlı çıktı');
  let d = iliskiKoy(kur(), '34', '06', ITTIFAK);
  d = iliskiKoy(d, '06', '34', SAVAS); // ters sırayla ikinci kez
  esit(Object.keys(d.iliskiler).length, 1, 'aynı çift için iki satır oluştu');
});

// ---- İTTİFAKIN GÜÇ TAVANI (2026-08-08, Baki: "ittifaklara bir güç kısıtı koyulsun") ----

// Bir aktöre istenen sayıda parça verir — güç tavanını sınamak için.
// `korunan` listesindeki aktörlerin parçalarına DOKUNULMAZ: iki devi arka arkaya
// büyütürken ikinci çağrı birincinin parçalarını çalmasın (ilk yazımda tam bu oldu ve
// test "aşmıyor" dedi — toplam hiç büyümüyordu).
function parcaVer(d, aktorId, adet, korunan) {
  const sahiplik = { ...d.parcaSahipligi };
  const dokunma = new Set([aktorId].concat(korunan || []));
  let kalan = adet;
  for (const pid of Object.keys(sahiplik)) {
    if (kalan <= 0) break;
    if (dokunma.has(sahiplik[pid])) continue;
    sahiplik[pid] = aktorId;
    kalan--;
  }
  return { ...d, parcaSahipligi: sahiplik };
}

test('GÜÇ TAVANI: maç başında kimseyi engellemiyor', () => {
  const d = kur();
  const g = ittifakGucu(d, '16', '06');
  esit(g.asiyor, false, 'herkes 2-3 parçayken tavan tutmamalı');
  dogru(g.toplam > 0, 'kapsam parça sayısı okunmalı');
});

test('GÜÇ TAVANI: iki dev birleşemiyor', () => {
  const oran = D.GUC_KISITI.ORAN;
  let d = kur();
  const toplam = Object.keys(d.parcaSahipligi).length;
  // İkisi birden tavanı AŞACAK kadar parça: tavan payın tam sayıya yuvarlanmışı.
  d = parcaVer(d, '16', Math.ceil(toplam * oran * 0.6));
  d = parcaVer(d, '06', Math.ceil(toplam * oran * 0.6), ['16']);

  const g = ittifakGucu(d, '16', '06');
  esit(g.asiyor, true, 'iki dev tavanı aşmalı');

  const s = teklifGecerliMi(d, '16', '06', ITTIFAK);
  esit(s.ok, false, 'tavanı aşan ittifak kabul edildi');
  esit(s.kod, 'guc');
});

test('GÜÇ TAVANI: dev ile CÜCE anlaşabiliyor (kural toplama bakıyor)', () => {
  let d = kur();
  const toplam = Object.keys(d.parcaSahipligi).length;
  // Tek başına tavanın altında kalan bir dev + küçük bir devlet: toplam yine altında.
  d = parcaVer(d, '16', Math.floor(toplam * D.GUC_KISITI.ORAN) - 5);
  dogru(teklifGecerliMi(d, '16', '06', ITTIFAK).ok, 'dev–cüce ittifakı engellenmemeli');
});

test('GÜÇ TAVANI: kapatılınca kural hiç işlemiyor', () => {
  const eski = D.GUC_KISITI.ACIK;
  D.GUC_KISITI.ACIK = false;
  try {
    let d = kur();
    const toplam = Object.keys(d.parcaSahipligi).length;
    d = parcaVer(d, '16', Math.ceil(toplam * 0.5));
    d = parcaVer(d, '06', Math.ceil(toplam * 0.3));
    esit(ittifakGucu(d, '16', '06').asiyor, false, 'kapalıyken tavan tutmamalı');
  } finally {
    D.GUC_KISITI.ACIK = eski;
  }
});

// ---- ERKEN TUR İTTİFAK KOLAYLIĞI (2026-08-08) ----

test('EŞİK: oyun başında düşük, sonra normale dönüyor', () => {
  const erken = ittifakEsigi({ tur: 1 });
  const gec = ittifakEsigi({ tur: D.FAYDA.ERKEN_TUR + 1 });
  esit(gec, D.FAYDA.ESIK, 'erken tur bitince normal eşiğe dönmeli');
  esit(erken, D.FAYDA.ESIK - D.FAYDA.ERKEN_INDIRIM);
  dogru(erken < gec, 'oyun başında eşik daha düşük olmalı');
  // Sınır turu HÂLÂ erken sayılıyor — "ilk N tur" kapsayıcı.
  esit(ittifakEsigi({ tur: D.FAYDA.ERKEN_TUR }), erken);
});

test('İLİŞKİ: aktörün kendisiyle ilişkisi TARAFSIZ', () => {
  esit(iliskiDurumu(kur(), '16', '16'), TARAFSIZ, 'kendisiyle ilişki kurulmuş');
});

// ---- MÜTTEFİKE SALDIRI: TEK KAPI ----

// Oyuncunun komşu bir düşman parçası — saldırı denemesi için.
function komsuDusmanCifti(d, aktorId) {
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== aktorId) continue;
    for (const k of KOMSULUK[pid] || []) {
      const sahip = d.parcaSahipligi[k];
      if (sahip && sahip !== aktorId) return { kaynak: pid, hedef: k, sahip };
    }
  }
  return null;
}

test('MÜTTEFİK: saldırı engelleniyor — oyuncu ve yapay zekâ AYNI KAPIDAN', () => {
  const d0 = kur();
  const c = komsuDusmanCifti(d0, d0.oyuncuAktorId);
  dogru(c !== null, 'komşu düşman parçası bulunamadı');

  const ordu = d0.ordular[c.kaynak];
  const secilen = { ...ordu.birimler };

  // ---- BARIŞTA SALDIRI ENGELLİ (Görev 11) ----
  // Eskiden tarafsızken saldırı GEÇERLİYDİ ("saldırı ilandır"). Baki bunu tersine
  // çevirdi: barış varsayılan, saldırmak için önce savaş ilan edilmeli.
  const barisSonuc = hareketGecerliMi(d0, d0.oyuncuAktorId, c.kaynak, c.hedef, secilen);
  esit(barisSonuc.ok, false, 'barıştayken saldırı geçerli sayıldı');
  esit(barisSonuc.kod, 'baris', 'ret kodu baris değil');

  // Savaş hali kurulunca AYNI saldırı geçerli.
  const savasta = savasYaz(d0, d0.oyuncuAktorId, c.sahip);
  dogru(
    hareketGecerliMi(savasta, d0.oyuncuAktorId, c.kaynak, c.hedef, secilen).ok,
    'savaşta saldırı engellenmiş'
  );

  // İttifak kurulunca AYNI saldırı engelleniyor.
  const d = iliskiKoy(d0, d0.oyuncuAktorId, c.sahip, ITTIFAK);
  const sonuc = hareketGecerliMi(d, d0.oyuncuAktorId, c.kaynak, c.hedef, secilen);
  esit(sonuc.ok, false, 'müttefike saldırı geçerli sayıldı');
  esit(sonuc.kod, 'ittifak', 'ret kodu ittifak değil');

  // AYNI FONKSİYON yapay zekânın emrini de doğruluyor (zeka.js oradan geçiyor) — kapı
  // tek olduğu için ayrı bir yapay zekâ testi YAZILAMAZ, bu testin kendisi ikisini birden
  // kilitliyor. Kural ikinci bir yere yazılırsa bu satır anlamını yitirir.
  const zekaAktoru = c.sahip;
  const tersC = komsuDusmanCifti(d, zekaAktoru);
  if (tersC && tersC.sahip === d0.oyuncuAktorId) {
    const tersOrdu = d.ordular[tersC.kaynak];
    esit(
      hareketGecerliMi(d, zekaAktoru, tersC.kaynak, tersC.hedef, { ...tersOrdu.birimler }).kod,
      'ittifak',
      'yapay zekâ müttefikine saldırabildi'
    );
  }
});

// ---- ZİNCİR (§10/3) ----

test('ZİNCİR: müttefikime saldıran BENİMLE DE savaş haline giriyor', () => {
  let d = kur();
  d = iliskiKoy(d, '06', '34', ITTIFAK); // Ankara – İstanbul müttefik
  const s = savasBasla(d, '35', '34'); // İzmir, İstanbul'a saldırıyor
  esit(iliskiDurumu(s.durum, '35', '34'), SAVAS, 'saldıran ile savunan savaşta değil');
  esit(iliskiDurumu(s.durum, '35', '06'), SAVAS, 'zincir müttefike yayılmadı');
  dogru(
    s.olaylar.some((o) => o.tip === 'zincir' && o.b === '06'),
    'zincir olayı üretilmedi'
  );
});

test('ZİNCİR: TEK ADIM — müttefikimin müttefikinin düşmanı benim düşmanım DEĞİL', () => {
  let d = kur();
  d = iliskiKoy(d, '06', '34', ITTIFAK); // Ankara – İstanbul
  d = iliskiKoy(d, '06', '01', ITTIFAK); // Ankara – Adana
  const s = savasBasla(d, '35', '34'); // İzmir, İstanbul'a saldırıyor

  esit(iliskiDurumu(s.durum, '35', '06'), SAVAS, 'birinci adım yayılmadı');
  // İKİNCİ ADIM YAYILMAMALI: Adana, İstanbul'un değil ANKARA'nın müttefiki.
  esit(iliskiDurumu(s.durum, '35', '01'), TARAFSIZ, 'zincir ikinci adıma yayıldı');
});

test('ZİNCİR: zaten savaşta olan ilişkiyi TAZELEMİYOR', () => {
  let d = kur();
  d = iliskiKoy(d, '06', '34', ITTIFAK);
  d = iliskiKoy(d, '35', '06', SAVAS, { turdan: 1, son: 1 });
  const s = zincirYay({ ...d, tur: 9 }, '35', '34');
  esit(
    s.durum.iliskiler[anahtar('35', '06')].turdan,
    1,
    'zincir süren savaşın başlangıcını değiştirdi'
  );
  esit(s.olaylar.length, 0, 'zaten savaşta olan için zincir olayı üretildi');
});

// ---- SAVAŞ HALİ: SALDIRI İLANDIR ----

test('SAVAŞ: saldırı tarafsızlığı savaş haline çeviriyor (ilan yok — Soru 1/A)', () => {
  const d = kur();
  const s = savasBasla(d, '16', '10');
  esit(iliskiDurumu(s.durum, '16', '10'), SAVAS, 'saldırı savaş hali doğurmadı');
  dogru(
    s.olaylar.some((o) => o.tip === 'savasBasladi'),
    'savaş başladı olayı yok'
  );
});

test('SAVAŞ: süren savaşta SON TEMAS tazeleniyor, başlangıç sabit kalıyor', () => {
  let d = { ...kur(), tur: 3 };
  d = savasBasla(d, '16', '10').durum;
  const kayitBir = d.iliskiler[anahtar('16', '10')];
  esit(kayitBir.turdan, 3, 'başlangıç turu yanlış');

  d = savasBasla({ ...d, tur: 9 }, '16', '10').durum;
  const kayitIki = d.iliskiler[anahtar('16', '10')];
  esit(kayitIki.turdan, 3, 'başlangıç turu tazelendi (olmamalıydı)');
  esit(kayitIki.son, 9, 'son temas turu tazelenmedi');
});

test('SAVAŞ: unutulmuş savaş üst sınırda kendiliğinden TARAFSIZA dönüyor', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '10', SAVAS, { turdan: 1, son: 1 });

  // Sınırın bir altında: hâlâ savaş.
  const erken = iliskileriGuncelle({ ...d, tur: D.SAVAS_UST_SINIRI });
  esit(iliskiDurumu(erken, '16', '10'), SAVAS, 'savaş erken düştü');

  // Sınırda: düşüyor.
  const gec = iliskileriGuncelle({ ...d, tur: 1 + D.SAVAS_UST_SINIRI });
  esit(iliskiDurumu(gec, '16', '10'), TARAFSIZ, 'unutulmuş savaş düşmedi');
});

test('SAVAŞ: süren savaş üst sınıra rağmen DÜŞMÜYOR (son temas tazeleniyor)', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '10', SAVAS, { turdan: 1, son: 20 });
  const sonra = iliskileriGuncelle({ ...d, tur: 21 });
  esit(iliskiDurumu(sonra, '16', '10'), SAVAS, 'fiilen süren savaş kendiliğinden bitti');
});

test('İLİŞKİ: elenen aktörün satırları düşüyor', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '10', SAVAS, { son: d.tur });
  // 10'un bütün parçalarını başkasına ver — elenmiş sayılır.
  const sahiplik = { ...d.parcaSahipligi };
  for (const pid of Object.keys(sahiplik)) if (sahiplik[pid] === '10') sahiplik[pid] = '16';
  const sonra = iliskileriGuncelle({ ...d, parcaSahipligi: sahiplik });
  esit(Object.keys(sonra.iliskiler).length, 0, 'elenen aktörün ilişkisi kayıtta kaldı');
});

// ---- İHANET ----

test('İHANET: ittifakı bozan diplomasi yapamıyor, süresi dolunca açılıyor', () => {
  let d = iliskiKoy(kur(), '16', '06', ITTIFAK);
  const b = ittifakBoz(d, '16', '06');
  dogru(b.ok, 'ittifak bozulamadı');
  d = b.durum;

  esit(iliskiDurumu(d, '16', '06'), TARAFSIZ, 'bozulan ittifak tarafsıza dönmedi');
  dogru(ihanetliMi(d, '16'), 'bozan tarafa ihanet bedeli işlemedi');
  dogru(!ihanetliMi(d, '06'), 'bozulmayan tarafa da bedel işlemiş');

  // Bedel sürerken teklif veremiyor.
  esit(teklifGecerliMi(d, '16', '34', ITTIFAK).kod, 'ihanet', 'ihanetli teklif verebildi');
  // ...ve teklif ALAMIYOR da (§5.3 iki yönlü).
  esit(teklifGecerliMi(d, '34', '16', ITTIFAK).kod, 'ihanet', 'ihanetli teklif alabildi');

  // Süre dolunca açılıyor.
  const sonra = { ...d, tur: d.tur + D.IHANET_SURESI };
  dogru(!ihanetliMi(sonra, '16'), 'ihanet süresi dolduğu hâlde bitmedi');
});

test('İHANET: süresi dolan kayıt tur bakımında SİLİNİYOR (kayıt şişmesin)', () => {
  let d = kur();
  d = { ...d, ihanetler: { 16: 3 } };
  const sonra = iliskileriGuncelle({ ...d, tur: 3 });
  esit(Object.keys(sonra.ihanetler).length, 0, 'süresi dolan ihanet kaydı kaldı');
});

test('İHANET: müttefikine saldırmak da ihanet sayılıyor', () => {
  const d = iliskiKoy(kur(), '16', '06', ITTIFAK);
  const s = savasBasla(d, '16', '06');
  dogru(ihanetliMi(s.durum, '16'), 'müttefikine saldıran bedel ödemedi');
  esit(iliskiDurumu(s.durum, '16', '06'), SAVAS, 'saldırı sonrası savaş hali kurulmadı');
  dogru(
    s.olaylar.some((o) => o.tip === 'ihanet'),
    'ihanet olayı üretilmedi'
  );
});

// ---- TEKLİF KURALLARI ----

// İki hasım il — tablodan okunuyor, koda savaş adı yazılmıyor (Görev 08'in kuralı).
const HASIM = HUSUMETLER[0];

test('TEKLİF: HASIM illerle ittifak kurulamıyor', () => {
  let d = kur();
  // Tanıdık olsunlar diye aralarına bir ilişki koy (savaş = tanıdık).
  d = iliskiKoy(d, HASIM.ilA, HASIM.ilB, SAVAS, { son: d.tur });
  esit(
    teklifGecerliMi(d, HASIM.ilA, HASIM.ilB, ITTIFAK).kod,
    'husumet',
    'hasım illerle ittifak kurulabildi'
  );
});

test('TEKLİF: ittifak sayısı sınırı aşılamıyor', () => {
  let d = kur();
  const dostlar = ['06', '34', '35', '01', '07'];
  for (let i = 0; i < D.EN_COK_ITTIFAK; i++) d = iliskiKoy(d, '16', dostlar[i], ITTIFAK);
  esit(muttefikler(d, '16').length, D.EN_COK_ITTIFAK, 'kurulum yanlış');

  // Bir tane daha: tanıdık olması için savaş ilişkisi koyalım.
  d = iliskiKoy(d, '16', '10', SAVAS, { son: d.tur });
  esit(teklifGecerliMi(d, '16', '10', ITTIFAK).kod, 'dolu', 'ittifak sınırı aşılabildi');
});

test('TEKLİF: TANIMADIĞIN devletle diplomasi yapılamıyor', () => {
  const d = kur();
  const uzak = tanidiklar(d, '16').map((t) => t.id);
  const yabanci = Object.keys(d.aktorler).find((id) => id !== '16' && !uzak.includes(id));
  dogru(yabanci !== undefined, 'tanınmayan aktör bulunamadı — süzgeç çalışmıyor olabilir');
  esit(teklifGecerliMi(d, '16', yabanci, ITTIFAK).kod, 'tanimiyor', 'yabancıyla teklif geçti');
});

// ┌─ §10/9: "DİPLOMASİ ARAYÜZÜ ŞİŞEBİLİR" ──────────────────────────────────────────────┐
// │ Bu testin kilitlediği şey Adım 3'te bir kez GERÇEKTEN kırıldı: `BUYUKLUK_ESIGI`     │
// │ dengeleme için 10'dan 4'e indirilince tanıdık listesi 26 satıra çıktı. Kapak         │
// │ (`TANIDIK.EN_COK`) o yüzden var; test kapağın kalkmadığını kilitliyor.               │
// └──────────────────────────────────────────────────────────────────────────────────────┘
test('TANIDIK: liste KAPAĞI aşmıyor — oyunun her aşamasında (§10/9)', () => {
  // ⚠ İKİ AYRI KAPAK (Görev 12): oyuncunun EKRAN listesi bölge kuralıyla uzayabiliyor
  // (kaydırmalı ve süzgeçli), zekânın havuzu Görev 09'un ölçtüğü boyutta kalıyor. Test
  // ikisini de kendi kapağına karşı sınıyor — asıl korunan şey MOTOR kapağı, çünkü
  // doygunluk oradan doğuyor.
  let d = kur({ zorluk: 'zor' });
  const motorKapagi = D.TANIDIK.EN_COK;
  const ekranKapagi = D.TANIDIK.EN_COK_EKRAN || D.TANIDIK.EN_COK;
  for (const tur of [0, 10, 20, 30]) {
    while (d.tur <= tur) d = turuBitir(d);
    for (const id of Object.keys(d.aktorler)) {
      const motor = tanidiklar(d, id, { bolgesiz: true }).length;
      dogru(
        motor <= motorKapagi,
        'tur ' +
          tur +
          ': ' +
          id +
          ' için MOTOR listesi ' +
          motor +
          ' satır (kapak ' +
          motorKapagi +
          ')'
      );
      const ekran = tanidiklar(d, id).length;
      dogru(
        ekran <= ekranKapagi,
        'tur ' +
          tur +
          ': ' +
          id +
          ' için EKRAN listesi ' +
          ekran +
          ' satır (kapak ' +
          ekranKapagi +
          ')'
      );
    }
  }
});

test('TANIDIK: BÖLGE kuralı — aynı bölgede toprağı olan devlet listeye giriyor', () => {
  const d = kur();
  const { ILLER, PARCALAR } = require('../src/oyun/veri.js');
  const benim = '16'; // Bursa — Marmara
  const liste = tanidiklar(d, benim);
  const bolgedesler = liste.filter((t) => t.nasil === 'bolge');
  dogru(bolgedesler.length > 0, 'bölge kuralı hiç aday üretmedi');
  // Üretilen her bölgedeş GERÇEKTEN benim bölgemde toprağı olan biri olmalı.
  const benimBolgelerim = new Set();
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== benim) continue;
    benimBolgelerim.add(ILLER[PARCALAR[pid].kod].bolge);
  }
  for (const t of bolgedesler) {
    const onunBolgeleri = new Set();
    for (const pid of Object.keys(d.parcaSahipligi)) {
      if (d.parcaSahipligi[pid] !== t.id) continue;
      onunBolgeleri.add(ILLER[PARCALAR[pid].kod].bolge);
    }
    dogru(
      [...onunBolgeleri].some((b) => benimBolgelerim.has(b)),
      t.id + ' bölgedeş sayıldı ama ortak bölge yok'
    );
  }
});

test('TANIDIK: ZEKÂNIN havuzunda bölge kuralı YOK (doygunluk koruması)', () => {
  const d = kur();
  const zeka = tanidiklar(d, '16', { bolgesiz: true });
  dogru(
    zeka.every((t) => t.nasil !== 'bolge'),
    'zekânın havuzuna bölgedeş sızdı — Görev 09un doygunluk düzeltmesi geri gelir'
  );
});

test('TANIDIK: sınırdaşlar kapak yüzünden ELENMİYOR (öncelik yakınlıkta)', () => {
  const d = kur();
  const liste = tanidiklar(d, '16');
  dogru(liste.length > 0, 'oyun başında hiç tanıdık yok');

  // Sınırdaş olan her aktör listede olmalı — kapak yalnızca "büyük" grubunu kesebilir.
  const sinirdaslar = new Set();
  for (const pid of Object.keys(d.parcaSahipligi)) {
    if (d.parcaSahipligi[pid] !== '16') continue;
    for (const k of KOMSULUK[pid] || []) {
      const s = d.parcaSahipligi[k];
      if (s && s !== '16') sinirdaslar.add(s);
    }
  }
  const listedeki = new Set(liste.map((t) => t.id));
  for (const s of sinirdaslar) dogru(listedeki.has(s), 'sınırdaş ' + s + ' listeden elenmiş');

  // Kesilen grup her zaman en az ilgili olan: "büyük"ler listenin SONUNDA.
  const ilkBuyuk = liste.findIndex((t) => t.nasil === 'buyuk');
  if (ilkBuyuk >= 0)
    dogru(
      liste.slice(ilkBuyuk).every((t) => t.nasil === 'buyuk'),
      'büyük tanıdıklar listenin sonuna toplanmamış'
    );
});

test('TANIDIK: ELENEN aktör listeden düşüyor', () => {
  const d = kur();
  const kurban = tanidiklar(d, '16')[0].id;
  const sahiplik = { ...d.parcaSahipligi };
  for (const pid of Object.keys(sahiplik)) if (sahiplik[pid] === kurban) sahiplik[pid] = '16';
  dogru(!tanidikMi({ ...d, parcaSahipligi: sahiplik }, '16', kurban), 'elenen aktör tanıdık kaldı');
});

// ---- ATEŞKES ----

test('ATEŞKES: savaşı bitiriyor ve TARAFSIZA döndürüyor', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '10', SAVAS, { son: d.tur });
  const s = savasBitir(d, '16', '10');
  dogru(s.ok, s.sebep);
  esit(iliskiDurumu(s.durum, '16', '10'), TARAFSIZ, 'ateşkes tarafsıza döndürmedi');
  esit(Object.keys(s.durum.iliskiler).length, 0, 'tarafsız ilişki kayıtta kaldı');
});

test('ATEŞKES: savaşta olmayan çift ateşkes yapamıyor', () => {
  esit(savasBitir(kur(), '16', '10').kod, 'savasyok', 'savaşsız ateşkes geçti');
});

test('ATEŞKES: DÜELLO SÜRERKEN yapılamıyor (§11 düello üstündür)', () => {
  let d = kur();
  d = iliskiKoy(d, HASIM.ilA, HASIM.ilB, SAVAS, { son: d.tur });
  d = { ...d, duellolar: [{ a: HASIM.ilA, b: HASIM.ilB, tur: d.tur }] };
  esit(savasBitir(d, HASIM.ilA, HASIM.ilB).kod, 'duello', 'düello sürerken ateşkes yapılabildi');
});

// ---- DÜELLO GİRİŞ ŞARTI (Baki 2026-08-01) ----

test('DÜELLO: başka savaşı olan taraf düelloya çıkamıyor', () => {
  const { duelloDene } = require('../src/oyun/rekabet.js');
  const asil = DENGE.REKABET.GIRIS_SARTI;
  DENGE.REKABET.GIRIS_SARTI = 'baskaSavasYok';
  try {
    let temiz = kur();
    // Şart sağlanıyor: ikisinin de başka savaşı yok → düello başlar.
    dogru(
      duelloDene(temiz, HASIM.ilA, HASIM.ilB).duello !== null,
      'temiz durumda düello başlamadı'
    );

    // Bir tarafın ÜÇÜNCÜ bir aktörle savaşı var → düello başlamaz.
    const ucuncu = Object.keys(temiz.aktorler).find((id) => id !== HASIM.ilA && id !== HASIM.ilB);
    const mesgul = iliskiKoy(temiz, HASIM.ilA, ucuncu, SAVAS, { son: temiz.tur });
    esit(duelloDene(mesgul, HASIM.ilA, HASIM.ilB).duello, null, 'başka savaşı olan düelloya çıktı');

    // Ama BİRBİRLERİYLE savaşta olmaları şartı BOZMUYOR — düello zaten onların kavgası.
    const kendiSavasi = iliskiKoy(temiz, HASIM.ilA, HASIM.ilB, SAVAS, { son: temiz.tur });
    dogru(
      duelloDene(kendiSavasi, HASIM.ilA, HASIM.ilB).duello !== null,
      'kendi aralarındaki savaş düelloyu engelledi'
    );
  } finally {
    DENGE.REKABET.GIRIS_SARTI = asil;
  }
});

// ---- KAYIT ----

test('KAYIT: ilişkiler ve ihanetler gidiş dönüşte BİREBİR aynı', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '06', ITTIFAK);
  d = iliskiKoy(d, '35', '10', SAVAS, { son: d.tur });
  d = { ...d, ihanetler: { 34: 12 } };

  const geri = metinCoz(kayitMetni(d));
  dogru(geri.ok, geri.hata);
  esit(
    JSON.stringify(geri.durum.iliskiler),
    JSON.stringify(d.iliskiler),
    'ilişkiler kayıttan dönerken ayrıştı'
  );
  esit(
    JSON.stringify(geri.durum.ihanetler),
    JSON.stringify(d.ihanetler),
    'ihanetler kayıttan dönerken ayrıştı'
  );
});

test('KAYIT: bozuk ilişki satırı anlaşılır mesajla reddediliyor', () => {
  const d = kur();
  const bozuk = JSON.parse(kayitMetni(d));
  bozuk.iliskiler = { '16|06': { tip: 'dostluk' } };
  const s = metinCoz(JSON.stringify(bozuk));
  esit(s.ok, false, 'bozuk ilişki kabul edildi');
  dogru(s.hata.includes('ilişki'), 'hata mesajı ilişkiden bahsetmiyor: ' + s.hata);
});

// ---- GERÇEK OYUNDA ----

test('GERÇEK OYUN: 15 turda savaş halleri doğuyor ve simetri bozulmuyor', () => {
  let d = kur();
  for (let i = 0; i < 15; i++) d = turuBitir(d);

  const tablo = d.iliskiler || {};
  dogru(Object.keys(tablo).length > 0, '15 turda hiç ilişki doğmadı — savaş hali yazılmıyor');
  for (const k of Object.keys(tablo)) {
    const [a, b] = k.split('|');
    dogru(a < b, 'anahtar sıralı değil: ' + k);
    esit(iliskiDurumu(d, a, b), iliskiDurumu(d, b, a), 'ilişki simetrisi bozuldu: ' + k);
    dogru(tablo[k].tip !== TARAFSIZ, 'tarafsız ilişki kayda yazılmış: ' + k);
  }
});

test('GERÇEK OYUN: savaşan aktörün düşman listesi çift yönlü tutuyor', () => {
  let d = kur();
  for (let i = 0; i < 10; i++) d = turuBitir(d);
  for (const id of Object.keys(d.aktorler)) {
    for (const x of dusmanlar(d, id)) {
      dogru(dusmanlar(d, x).includes(id), id + ' ile ' + x + ' arasındaki savaş tek yönlü');
      dogru(savastaMi(d, id, x), 'savastaMi listeyle tutmuyor');
      dogru(baskasiylaSavastaMi(d, id, null), 'baskasiylaSavastaMi düşmanı görmüyor');
    }
  }
});

test('BELİRLENİMCİ: aynı tohum aynı ilişki tablosunu veriyor', () => {
  const kos = () => {
    let d = kur();
    for (let i = 0; i < 12; i++) d = turuBitir(d);
    return JSON.stringify(d.iliskiler);
  };
  esit(kos(), kos(), 'aynı tohum farklı diplomasi üretti');
});

test('KAPALI: DIPLOMASI.ACIK false iken hiç ilişki doğmuyor', () => {
  const asil = D.ACIK;
  D.ACIK = false;
  try {
    let d = kur();
    for (let i = 0; i < 5; i++) d = turuBitir(d);
    esit(Object.keys(d.iliskiler).length, 0, 'kapalıyken ilişki doğdu');
    esit(iliskiDurumu(d, '16', '06'), TARAFSIZ, 'kapalıyken ilişki okundu');
  } finally {
    D.ACIK = asil;
  }
});

test('TEKLİF UYGULA: ittifak kuruluyor ve olay üretiliyor', () => {
  const d = kur();
  const dost = tanidiklar(d, '16').find(
    (t) => !HUSUMETLER.some((h) => h.ilA === t.id || h.ilB === t.id)
  );
  dogru(dost !== undefined, 'hasım olmayan tanıdık bulunamadı');
  const s = teklifUygula(d, '16', dost.id, ITTIFAK);
  dogru(s.ok, s.sebep);
  dogru(ittifakMi(s.durum, '16', dost.id), 'ittifak kurulmadı');
  esit(s.olay.tip, 'ittifakKuruldu', 'olay üretilmedi');
});

// ---- İTTİFAK DOYGUNLUĞU (Adım 3 — görev belgesi §10/6) ----
//
// "Bu görevin oyunu bozabileceği TEK YER: herkes herkesle anlaşırsa savaş durur ve oyun
// donar." Ölçümün tamamı `veri/diplomasi-olcum.md`'de (30 tur × 3 tohum × 3 kademe);
// burada tek koşuyla ÜÇ SAĞLIK ÖLÇÜTÜ birden kilitleniyor.
//
// ZOR KADEME SEÇİLDİ çünkü doygunluk orada doğdu: ilk sürümde 27 canlı aktörün 26'sı tek
// bloktaydı. Kolay kademe bu testi hiç zorlamaz.
// ---- ⚠ BU TEST 2026-09-20'DE TEK TOHUMDAN ÇOK TOHUMA ÇEVRİLDİ ----
//
// Eski hâli TEK tohumla ölçüyordu ve eşiği (ittifaklı oran < 0.50) o tohumun sonucunun
// tam üstündeydi. Ölçüm (Görev 16 / Adım 5 sırasında) beş tohumda şunu gösterdi:
//   0.45 · 0.55 · 0.39 · 0.66 · 0.42   → ortalama 0.49, yani eşik ORTALAMANIN ÜSTÜNDE değil
//                                         TAM ÜSTÜNDE. İki tohum zaten kalıyordu.
// Yani test "ittifak doygunluğu" değil, "seçilen tohum şanslı mı" sorusunu ölçüyordu.
//
// ASIL DEĞİŞMEZ İKİNCİSİ ve testin kendi yorumu bunu zaten söylüyordu: *"tek tek ittifak
// sayısı yanıltıcıdır — 10 ayrı ikili ittifak zararsız, 10 aktörlük tek blok haritayı
// dondurur."* En büyük blok beş tohumda haritanın %10–23'ü, yani sınırın çok altında.
//
// Yeni hâli: BLOK ölçüsü her tohumda tek tek sınanıyor (asıl değişmez), ittifaklı oran ise
// tohumlar ORTALAMASINDA bir tavanla sınanıyor (gürültüye değil eğilime bakıyor).
const DOYGUNLUK_TOHUMLARI = [20260801, 20260802, 20260803, 20260901, 20260920];
// Ortalama tavanı. Ölçülen: 0.49 (Görev 16 öncesi) → 0.56 (komutan yetenekleri sonrası).
// 0.70 seçildi: gerçek doygunluk (herkes ittifaklı → 1.00) hâlâ yakalanıyor ama tohum
// gürültüsü testi kırmıyor. Eğilim buraya yaklaşırsa ittifak iştahı gerçekten artmış demektir.
const DOYGUNLUK_TAVANI = 0.7;

test('DOYGUNLUK: 30 turda harita tek ittifak bloğuna dönüşmüyor', () => {
  let oranToplami = 0;
  for (const tohum of DOYGUNLUK_TOHUMLARI) {
    let d = kur({ zorluk: 'zor', tohum });
    for (let i = 0; i < 30; i++) d = turuBitir(d);

    const canli = new Set(Object.values(d.parcaSahipligi));
    let ittifakli = 0;
    for (const id of canli) if (muttefikler(d, id).length > 0) ittifakli++;
    oranToplami += ittifakli / canli.size;

    // ---- ASIL DEĞİŞMEZ: EN BÜYÜK BLOK HARİTANIN YARISINDAN KÜÇÜK ----
    // Her tohumda tek tek sınanıyor; burada ortalama almak bir tohumdaki donmayı gizlerdi.
    const komsu = {};
    for (const k of Object.keys(d.iliskiler)) {
      if (d.iliskiler[k].tip !== ITTIFAK) continue;
      const [a, b] = k.split('|');
      (komsu[a] = komsu[a] || []).push(b);
      (komsu[b] = komsu[b] || []).push(a);
    }
    let enBuyuk = 0;
    const gorulen = new Set();
    for (const s of Object.keys(komsu)) {
      if (gorulen.has(s)) continue;
      let n = 0;
      const yigin = [s];
      gorulen.add(s);
      while (yigin.length) {
        const x = yigin.pop();
        n++;
        for (const y of komsu[x] || [])
          if (!gorulen.has(y)) {
            gorulen.add(y);
            yigin.push(y);
          }
      }
      enBuyuk = Math.max(enBuyuk, n);
    }
    dogru(
      enBuyuk < canli.size / 2,
      'tohum ' +
        tohum +
        ': en büyük ittifak bloğu ' +
        enBuyuk +
        '/' +
        canli.size +
        ' — harita donar'
    );
  }

  const ortalama = oranToplami / DOYGUNLUK_TOHUMLARI.length;
  dogru(
    ortalama < DOYGUNLUK_TAVANI,
    'ittifaklı aktör oranı ortalaması ' + ortalama.toFixed(2) + ' — doygunluk eğilimi'
  );
});

test('DOYGUNLUK: diplomasi SAVAŞI DURDURMUYOR (açık/kapalı muharebe sayısı)', () => {
  const muharebeSay = (acik) => {
    const asil = D.ACIK;
    D.ACIK = acik;
    try {
      let d = kur({ zorluk: 'zor' });
      let n = 0;
      for (let i = 0; i < 20; i++) {
        d = turuBitir(d);
        if (d.sonTurRaporu) n += d.sonTurRaporu.satirlar.filter((s) => s.tip === 'muharebe').length;
      }
      return n;
    } finally {
      D.ACIK = asil;
    }
  };
  const kapali = muharebeSay(false);
  const acik = muharebeSay(true);
  // ÖLÇÜT "ETKİN SAVAŞ HALİ" DEĞİL, GERÇEK MUHAREBE. İlk denemede savaş hali sayılmıştı ve
  // ölçüm yalan söylüyordu: diplomasi kapalıyken savaş hali diye bir şey YOK, sayı tanım
  // gereği 0 çıkıyordu. Muharebe satırı iki rejimde de aynı şeyi sayıyor.
  //
  // ---- ⚠ ORAN 0.7 → 0.30 (Görev 11) ----
  // Eşik düştü çünkü KARŞILAŞTIRMANIN ANLAMI DEĞİŞTİ. Diplomasi kapalıyken savaş ilanı da
  // kapalı: herkes 1. turdan itibaren herkese saldırabiliyor (eski "saldırı ilandır"
  // dünyası, 20 turda ~723 muharebe). Açıkken Baki'nin istediği düzen işliyor: ilk iki tur
  // TAM BARIŞ, sonra ilan edilen savaşlar (~258 muharebe).
  //
  // Yani aradaki farkın çoğu ittifakların savaşı durdurmasından DEĞİL, savaşın artık
  // gerekçe istemesinden geliyor — testin kovaladığı doygunluk tuzağı değil. Alt sınır
  // yine de var: diplomasi savaşı ÜÇTE BİRİN altına indiriyorsa ittifaklar gerçekten
  // haritayı dondurmuş demektir.
  dogru(
    acik >= kapali * 0.3,
    'diplomasi savaşı durdurdu: kapalı ' + kapali + ' muharebe, açık ' + acik
  );
});

// Barış varsayılanının GÖRÜNEN yüzü: ilk turlarda hiç savaş yok, sonra savaşlar açılıyor.
// Yukarıdaki oran testi "savaş durmadı" diyor; bu test "savaş DOĞRU ZAMANDA başladı" diyor.
// İkisi ayrı sorular ve Baki'nin isteği (§"herkes ilk başta barış içinde olsun") ikincisi.
test('BARIŞ ÖNCE: ilk turlar savaşsız, sonra zekâ savaş açıyor', () => {
  const savasSayisi = (d) =>
    Object.values(d.iliskiler || {}).filter((k) => k.tip === 'savas').length;
  let d = kur({ zorluk: 'zor' });
  const B = DENGE.DIPLOMASI.ILAN.BARIS_TURU;

  // Barış turları boyunca tek bir savaş satırı bile doğmamalı.
  for (let i = 0; i < B; i++) {
    d = turuBitir(d);
    esit(savasSayisi(d), 0, i + 1 + '. turda savaş çıktı — barış turu olmalıydı');
  }

  // Barış bitince zekâ ilan vermeye başlamalı ve savaşlar yayılmalı.
  for (let i = 0; i < 4; i++) d = turuBitir(d);
  dogru(savasSayisi(d) > 5, 'barış bitti ama savaş açılmadı: ' + savasSayisi(d) + ' savaş');

  // Muharebe de olmalı — savaş satırı yazılıp kimse saldırmıyorsa ilan ölü satırdır.
  dogru(
    d.sonTurRaporu && d.sonTurRaporu.satirlar.some((s) => s.tip === 'muharebe'),
    'savaşlar açıldı ama muharebe olmuyor'
  );
});

// ---- ZEKÂNIN DİPLOMASİSİ (Adım 2) ----

test('ZEKÂ: fethedebileceği ZAYIF KOMŞUSUYLA ittifak yapmıyor', () => {
  const { ittifakPuani } = require('../src/oyun/zeka.js');
  let d = kur();
  // '16' (Bursa) büyütülüyor; komşusu zayıf kalıyor.
  const komsuId = tanidiklar(d, '16').find((t) => t.nasil === 'sinirdas').id;
  const sahiplik = { ...d.parcaSahipligi };
  let verildi = 0;
  for (const pid of Object.keys(sahiplik))
    if (sahiplik[pid] !== '16' && sahiplik[pid] !== komsuId && verildi++ < 20) sahiplik[pid] = '16';
  d = { ...d, parcaSahipligi: sahiplik };

  const acgozlu = { saldirganlik: 0.5, acgozluluk: 1, husumet: 0, temkin: 0.2 };
  const temkinli = { saldirganlik: 0.5, acgozluluk: 0, husumet: 0, temkin: 1 };
  dogru(
    ittifakPuani(d, '16', komsuId, acgozlu) < ittifakPuani(d, '16', komsuId, temkinli),
    'açgözlü aktör zayıf komşusuyla temkinliden daha istekli — terim çalışmıyor'
  );
});

test('ZEKÂ: teklif verme ve kabul AYNI EŞİKTEN geçiyor', () => {
  const { ittifakPuani, teklifKabulMu } = require('../src/oyun/zeka.js');
  const d = kur();
  const hedef = tanidiklar(d, '16')[0].id;
  const kisilik = d.kisilikler[hedef];
  const puan = ittifakPuani(d, hedef, '16', kisilik);
  esit(
    teklifKabulMu(d, hedef, '16', ITTIFAK, kisilik),
    puan >= D.FAYDA.ESIK && teklifGecerliMi(d, '16', hedef, ITTIFAK).ok,
    'kabul kararı eşikten bağımsız çıktı'
  );
});

// Görev 20 (Baki: "neden reddettiğine dair küçük bir mesaj olsun"): reddedilen her teklifin
// kısa bir sebebi var ve sebep KABULÜ ENGELLEYEN terimden geliyor.
test('RET SEBEBİ: reddedilen her teklifte kısa bir cümle; komşu için komşu cümlesi', () => {
  const { teklifKabulMu, retSebebi, RET_SEBEBI } = require('../src/oyun/zeka.js');
  const d = kur();
  const cumleler = new Set(Object.values(RET_SEBEBI));
  let ret = 0;
  for (const t of tanidiklar(d, '16')) {
    const kisilik = d.kisilikler[t.id];
    if (teklifKabulMu(d, t.id, '16', ITTIFAK, kisilik)) continue;
    ret++;
    const c = retSebebi(d, t.id, '16', ITTIFAK, kisilik);
    dogru(cumleler.has(c), t.id + ' için tanımsız cümle: ' + c);
    dogru(c.split(' ').length <= 6, 'cümle kısa değil: ' + c);
  }
  dogru(ret > 0, 'başlangıçta hiç ret yok — sınama boş kaldı');

  // Açgözlü sınırdaş: ortak düşman yokken engelleyen terim komşuluk.
  const komsu = tanidiklar(d, '16').find((t) => t.nasil === 'sinirdas');
  const acgozlu = { saldirganlik: 0.5, acgozluluk: 1, husumet: 0, temkin: 0 };
  dogru(
    [RET_SEBEBI.komsu, RET_SEBEBI.zayifKomsu].includes(
      retSebebi(d, komsu.id, '16', ITTIFAK, acgozlu)
    ),
    'sınırdaşın reddi komşulukla açıklanmalı'
  );
  esit(retSebebi(d, komsu.id, '16', 'ateskes', acgozlu), RET_SEBEBI.ateskes);
});

test('ZEKÂ: teklif sayısı TUR_BASINA_TEKLIF sınırını aşmıyor', () => {
  const { diplomasiEmirleri } = require('../src/oyun/zeka.js');
  let d = kur({ zorluk: 'zor' });
  for (let i = 0; i < 12; i++) d = turuBitir(d);
  for (const id of Object.keys(d.aktorler)) {
    const n = diplomasiEmirleri(d, id, d.kisilikler[id], 1234).length;
    dogru(n <= D.TUR_BASINA_TEKLIF, id + ' için ' + n + ' teklif — sınır ' + D.TUR_BASINA_TEKLIF);
  }
});

test('ZEKÂ: ihanetli aktör hiç teklif üretmiyor', () => {
  const { diplomasiEmirleri } = require('../src/oyun/zeka.js');
  const d = { ...kur(), ihanetler: { 16: 99 } };
  esit(diplomasiEmirleri(d, '16', d.kisilikler['16'], 1).length, 0, 'ihanetli teklif üretti');
});

test('ZEKÂ: gelen teklif OYUNCUYA kart olarak düşüyor', () => {
  let d = kur({ zorluk: 'zor' });
  let goruldu = false;
  for (let i = 0; i < 30 && !goruldu; i++) {
    d = turuBitir(d);
    if ((d.teklifler || []).length > 0) goruldu = true;
  }
  dogru(goruldu, '30 turda oyuncuya hiç teklif gelmedi — "diplomasinin yarısı gelen tekliftir"');
});

test('ZEKÂ: cevaplanmayan teklif tur bitince DÜŞÜYOR (yığılmıyor)', () => {
  let d = kur({ zorluk: 'zor' });
  let enCok = 0;
  for (let i = 0; i < 30; i++) {
    d = turuBitir(d);
    enCok = Math.max(enCok, (d.teklifler || []).length);
  }
  dogru(enCok <= D.TUR_BASINA_TEKLIF * 3, 'teklifler yığılıyor: ' + enCok + ' bekleyen');
});

// ═══════════════════════════════════════════════════════════════════════
// SAVAŞ İLANI (Görev 11 · Baki 2026-08-03)
// ═══════════════════════════════════════════════════════════════════════

// ---- BARIŞ TURU KALDIRILDI (2026-08-08, Baki) ----
// Kural kodda duruyor, sayısı sıfır. İki test birden: sıfırken hiç engellemiyor, sayı
// verilince yine engelliyor. İkincisi olmadan "kural silinmiş" ile "kural sıfırlanmış"
// ayırt edilemezdi — geri getirmek tek satır olsun diye kural bilerek yerinde bırakıldı.

test('İLAN: ilk turdan itibaren savaş açılabiliyor (barış turu 0)', () => {
  esit(DENGE.DIPLOMASI.ILAN.BARIS_TURU, 0, 'barış turu sıfırlanmış olmalı');
  const d = kur();
  const hedef = Object.keys(d.aktorler).find((x) => x !== d.oyuncuAktorId);
  dogru(savasIlanGecerliMi(d, d.oyuncuAktorId, hedef).ok, '1. turda ilan reddedildi');
});

test('İLAN: barış turu kuralı hâlâ işliyor (sayı büyütülünce kesiyor)', () => {
  const eski = DENGE.DIPLOMASI.ILAN.BARIS_TURU;
  DENGE.DIPLOMASI.ILAN.BARIS_TURU = 2;
  try {
    const d = kur();
    const hedef = Object.keys(d.aktorler).find((x) => x !== d.oyuncuAktorId);
    const s = savasIlanGecerliMi(d, d.oyuncuAktorId, hedef);
    esit(s.ok, false, 'barış turunda ilan geçerli sayıldı');
    esit(s.kod, 'erken', 'ret kodu erken değil');
  } finally {
    DENGE.DIPLOMASI.ILAN.BARIS_TURU = eski;
  }
});

test('İLAN: barış bitince ilan geçerli ve savaş hali yazılıyor', () => {
  const d = { ...kur(), tur: DENGE.DIPLOMASI.ILAN.BARIS_TURU + 1 };
  const ben = d.oyuncuAktorId;
  const hedef = Object.keys(d.aktorler).find((x) => x !== ben);

  dogru(savasIlanGecerliMi(d, ben, hedef).ok, 'barış bitti ama ilan reddedildi');
  const s = savasIlanEt(d, ben, hedef);
  dogru(s.ok, 'ilan uygulanamadı: ' + s.sebep);
  dogru(savastaMi(s.durum, ben, hedef), 'ilandan sonra savaş hali yok');
  dogru(
    s.olaylar.some((o) => o.tip === 'savasIlani'),
    'ilan olayı üretilmedi'
  );
  // İkinci ilan anlamsız — zaten savaştasın.
  esit(savasIlanGecerliMi(s.durum, ben, hedef).kod, 'zaten', 'ikinci ilan geçerli sayıldı');
});

test('İLAN: müttefike savaş ilan edilemiyor — önce anlaşma bozulur', () => {
  let d = { ...kur(), tur: DENGE.DIPLOMASI.ILAN.BARIS_TURU + 1 };
  const ben = d.oyuncuAktorId;
  const hedef = Object.keys(d.aktorler).find((x) => x !== ben);
  d = iliskiKoy(d, ben, hedef, ITTIFAK);
  esit(savasIlanGecerliMi(d, ben, hedef).kod, 'ittifak', 'müttefike ilan geçerli sayıldı');
});

// §10/3 zinciri ilanla da yayılmalı: müttefikime savaş açan benimle de savaşa girer.
// İlan bir "tören" değil; savaşın bütün sonuçlarını doğuruyor.
test('İLAN: zincir yayılıyor — hedefin müttefiki de savaşa giriyor', () => {
  let d = { ...kur(), tur: DENGE.DIPLOMASI.ILAN.BARIS_TURU + 1 };
  const ben = d.oyuncuAktorId;
  const idler = Object.keys(d.aktorler).filter((x) => x !== ben);
  const hedef = idler[0];
  const dost = idler[1];
  d = iliskiKoy(d, hedef, dost, ITTIFAK);

  const s = savasIlanEt(d, ben, hedef);
  dogru(s.ok, 'ilan uygulanamadı');
  dogru(savastaMi(s.durum, ben, dost), 'zincir yayılmadı — müttefik savaşa girmedi');
  dogru(
    s.olaylar.some((o) => o.tip === 'zincir'),
    'zincir olayı üretilmedi'
  );
});

// Zekânın ilanı bir HESAP olmalı, rastgele değil: hasmına savaş açmaya yatkın olmalı.
// Ordu–Giresun gibi büyük savaşların oyunda gerçekten yaşanmasının şartı bu.
test('ZEKÂ: hasmına savaş açma puanı, hasım olmayana göre YÜKSEK', () => {
  const d = { ...kur(), tur: DENGE.DIPLOMASI.ILAN.BARIS_TURU + 1 };
  const ORDU = '52';
  const GIRESUN = '28';
  const TRABZON = '61';
  dogru(!!husumetBul(ORDU, GIRESUN), 'Ordu–Giresun husumeti tabloda yok — test dayanaksız');
  dogru(!husumetBul(ORDU, TRABZON), 'Ordu–Trabzon hasım çıktı — test dayanaksız');

  const kisilik = (d.kisilikler || {})[ORDU];
  const hasim = savasIlanPuani(d, ORDU, GIRESUN, kisilik);
  const sade = savasIlanPuani(d, ORDU, TRABZON, kisilik);
  dogru(hasim > sade, 'hasım puanı düşük kaldı: hasım ' + hasim + ', sade ' + sade);
});

// ---- DÜNYA GÖRÜNÜMÜ: BLOKLAR VE SAVAŞ HATLARI (Görev 12) ----
// Panelin DÜNYA sekmesi bunları çiziyor. Kural motorda kalsın diye burada hesaplanıyorlar;
// ekran ikinci bir "blok" tanımı yazmıyor (§10/4).

const { ittifakBloklari, savasHatlari } = require('../src/oyun/diplomasi.js');

test('BLOK: ittifakla bağlı aktörler tek blok sayılıyor (zincir dahil)', () => {
  let d = kur();
  d = iliskiKoy(d, '16', '10', ITTIFAK); // Bursa — Balıkesir
  d = iliskiKoy(d, '10', '35', ITTIFAK); // Balıkesir — İzmir  → üçü tek blok
  d = iliskiKoy(d, '06', '42', ITTIFAK); // Ankara — Konya     → ayrı blok

  const bloklar = ittifakBloklari(d);
  esit(bloklar.length, 2, 'blok sayısı yanlış');
  esit(bloklar[0].length, 3, 'en büyük blok önce gelmeli ve üç üyeli olmalı');
  dogru(bloklar[0].includes('35'), 'zincirin ucundaki aktör bloğa girmedi');
  esit(bloklar[1].join(','), '06,42', 'ikinci blok yanlış');
});

test('BLOK: tek başına duran aktör blok SAYILMIYOR', () => {
  const d = kur();
  esit(ittifakBloklari(d).length, 0, 'ittifaksız dünyada blok çıktı');
});

test('BLOK: savaş hali blok üretmiyor', () => {
  const d = iliskiKoy(kur(), '16', '10', SAVAS);
  esit(ittifakBloklari(d).length, 0, 'savaş bloğa dönüştü');
});

test('SAVAŞ HATTI: süren savaşlar EN ESKİDEN yeniye sıralanıyor', () => {
  let d = { ...kur(), tur: 20 };
  d = iliskiKoy(d, '16', '10', SAVAS, { turdan: 12 });
  d = iliskiKoy(d, '06', '42', SAVAS, { turdan: 3 });
  d = iliskiKoy(d, '34', '41', ITTIFAK);

  const hatlar = savasHatlari(d);
  esit(hatlar.length, 2, 'savaş hattı sayısı yanlış (ittifak sızmış olabilir)');
  esit(hatlar[0].turdan, 3, 'en eski savaş başta olmalı');
  esit(hatlar[1].turdan, 12, 'sıralama yanlış');
});
