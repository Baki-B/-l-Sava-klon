// METİN YÜKÜ ÖLÇÜMÜ (Görev 20 / Adım 0)
// Çalıştırma:  node scripts/metin-olcum.js
// Çıktı:       veri/metin-olcum.md  (+ ekrana özet)
//
// NİYE VAR. Baki, 2026-09-23: *"Oyun şuan her şeyi kendisi açıklıyor ve bu benim gözüme
// karmaşık geliyor… sezgilerle anlayarak ve deneyimleyerek öğrensem daha iyi."* Kural
// CLAUDE.md §5/10'da. Kontrast denetiminin kalıbı: karar gözle verilir, yük ÖLÇÜLÜR.
// Her adımdan sonra bu betik yeniden koşulur ve düşüş sayıyla görülür.
//
// NE SAYILIYOR. Kaynak kod gerçek bir ayrıştırıcıyla okunuyor (düzenli ifadeyle değil:
// ilk deneme kod parçalarını da metin sandı). Sayılanlar:
//   • JSX içindeki çıplak metin (<Text>Böyle bir yazı</Text>)
//   • İki ve daha fazla kelimelik dizgiler (bildirim, açıklama, cümle)
//   • Tek kelimelik BÜYÜK HARFLİ etiketler (SALDIR, TURU BİTİR gibi düğmeler)
// Sayılmayanlar: yorumlar, içe aktarma yolları, nesne anahtarları, karşılaştırmalar
// (`=== 'savas'`), `new Error(...)` iletileri, stil değerleri.
//
// ⚠ SINIR: bu STATİK bir sayım. Bir cümlenin ekranda gerçekten ne sıklıkla göründüğünü
// bilmiyor. Bu yüzden dosyalar üç kümeye ayrıldı ve asıl hedef yalnızca ilk kümede:
//   OYUN İÇİ   oyuncunun istemeden, oynarken gördüğü metin (panel, bildirim, rapor…)
//   AÇILAN     oyuncunun kendi açtığı ekranlar (diplomasi, araştırma, ayarlar, kurallar…)
//   MENÜ/KAYIT maç dışı (ana menü, mod seçimi, kayıt hataları)
// HEDEF (GOREV-20 §4.7): OYUN İÇİ kümede 8+ kelimelik cümle sayısı SIFIR.
//
// ⚠ Ayrıştırıcı (`@babel/parser`, `@babel/traverse`) Expo'nun kendi Babel kurulumuyla
// geliyor; ayrı bir bağımlılık eklenmedi.

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const KOK = path.join(__dirname, '..');
const CIKTI = path.join(KOK, 'veri', 'metin-olcum.md');
const UZUN = 8; // bu kadar ve daha fazla kelime = "uzun cümle"

// ---- KÜMELER ----
// Listede olmayan dosya OYUN İÇİ sayılır: yeni bir dosya ölçümden kaçamasın, en katı
// kümeye düşsün.
const ACILAN = new Set([
  'src/bilesenler/DiplomasiEkrani.js',
  'src/bilesenler/ArastirmaEkrani.js',
  'src/bilesenler/UretimEkrani.js',
  'src/bilesenler/KomutanEkrani.js',
  'src/bilesenler/OrdularimEkrani.js',
  'src/bilesenler/BasarimEkrani.js',
  'src/bilesenler/Muhurler.js',
  'src/bilesenler/AyarMenusu.js',
  'src/bilesenler/GenelAyarlar.js',
  'src/bilesenler/YardimEkrani.js',
  'src/oyun/basarimlar.js',
  'src/oyun/arastirma.js',
  'src/oyun/ayarlar.js',
  'src/oyun/komutan.js',
  'src/oyun/rutbe.js',
  'src/denge.js', // metinleri araştırma ve komutan ekranlarında görünüyor
  'src/para/odul.js',
  'src/para/reklam.js',
]);
const MENU = new Set([
  'src/bilesenler/AnaMenu.js',
  'src/bilesenler/ModSecimi.js',
  'src/bilesenler/ModLogolari.js',
  'src/bilesenler/IlSecimi.js',
  'src/bilesenler/HataSiniri.js',
  'src/bilesenler/MenuPaneli.js',
  'src/oyun/kayit.js',
  'src/oyun/kayitVerisi.js',
  'src/oyun/senaryolar.js',
  'src/yonlendirme.js',
]);
// Oyuncuya HİÇ görünmeyen metin taşıyan dosyalar (Görev 20 / Adım 3b'de eklendi):
//   haritaCizim.js  ekran kartı programının kaynağı (SkSL) bir metin olarak duruyor
//   KareSayaci.js   yalnızca geliştirme kipinde görünen ölçer
const OLCUM_DISI = new Set(['src/haritaCizim.js', 'src/bilesenler/KareSayaci.js']);

function kume(dosya) {
  if (ACILAN.has(dosya)) return 'AÇILAN';
  if (MENU.has(dosya)) return 'MENÜ/KAYIT';
  return 'OYUN İÇİ';
}

const HARF = /[A-Za-zÇĞİÖŞÜçğıöşü]/;
const kelimeler = (t) => t.split(/\s+/).filter((w) => /[A-Za-zÇĞİÖŞÜçğıöşü]{2,}/.test(w));

// Oyuncuya görünmeyen bağlamlar.
const STIL_ANAHTARI =
  /^(fontFamily|color|backgroundColor|position|align|justify|flex|kod|tip|id|anahtar|tur|durum|ikon|renk)/;
const GORUNMEZ_OZELLIK =
  /^(key|style|testID|source|name|pointerEvents|resizeMode|d|fill|stroke|accessibilityRole)$/;
function gorunmez(p) {
  const ust = p.parentPath;
  if (!ust) return false;
  if (ust.isImportDeclaration() || ust.isExportAllDeclaration() || ust.isExportNamedDeclaration())
    return true;
  if (ust.isObjectProperty() && ust.node.key === p.node) return true;
  if (ust.isBinaryExpression() && /[=!]==?/.test(ust.node.operator)) return true;
  if (ust.isSwitchCase() || ust.isMemberExpression() || ust.isNewExpression()) return true;
  if (ust.isCallExpression() && ust.node.callee.name === 'require') return true;
  // Geliştirici uyarısı (console.warn / log / error) — oyuncu görmüyor.
  if (
    ust.isCallExpression() &&
    ust.node.callee.type === 'MemberExpression' &&
    ust.node.callee.object.name === 'console'
  )
    return true;
  if (ust.isJSXAttribute() && GORUNMEZ_OZELLIK.test(ust.node.name.name)) return true;
  if (ust.isObjectProperty()) {
    const k = ust.node.key.name || ust.node.key.value;
    if (STIL_ANAHTARI.test(String(k))) return true;
  }
  return false;
}

function dosyaMetinleri(goreli) {
  const kod = fs.readFileSync(path.join(KOK, goreli), 'utf8');
  const ast = parse(kod, { sourceType: 'module', plugins: ['jsx'] });
  const metinler = [];
  traverse(ast, {
    JSXText(p) {
      const t = p.node.value.replace(/\s+/g, ' ').trim();
      if (HARF.test(t) && t.length > 1) metinler.push(t);
    },
    StringLiteral(p) {
      const t = p.node.value.trim();
      if (!HARF.test(t) || gorunmez(p)) return;
      if (kelimeler(t).length >= 2 || /^[A-ZÇĞİÖŞÜ]{3,}[.!?]?$/.test(t)) metinler.push(t);
    },
    TemplateLiteral(p) {
      if (gorunmez(p)) return;
      const t = p.node.quasis
        .map((q) => q.value.cooked)
        .join('…')
        .trim();
      if (kelimeler(t).length >= 2) metinler.push(t);
    },
  });
  return metinler;
}

function dosyalar() {
  const liste = [];
  for (const d of ['src', 'src/bilesenler', 'src/oyun', 'src/para', 'src/sahne', 'veri']) {
    for (const f of fs.readdirSync(path.join(KOK, d)))
      if (f.endsWith('.js') && !OLCUM_DISI.has(d + '/' + f)) liste.push(d + '/' + f);
  }
  return liste;
}

function olc() {
  const satirlar = [];
  for (const f of dosyalar()) {
    const m = dosyaMetinleri(f);
    const kelime = m.reduce((a, t) => a + kelimeler(t).length, 0);
    if (kelime === 0) continue;
    const uzun = m.filter((t) => kelimeler(t).length >= UZUN);
    satirlar.push({ dosya: f, kume: kume(f), metin: m.length, kelime, uzun });
  }
  satirlar.sort((a, b) => b.kelime - a.kelime);
  return satirlar;
}

function yaz(satirlar) {
  const toplam = (liste, k) => liste.reduce((a, r) => a + (k === 'uzun' ? r.uzun.length : r[k]), 0);
  const kumeler = ['OYUN İÇİ', 'AÇILAN', 'MENÜ/KAYIT'];
  const bugun = new Date().toISOString().slice(0, 10);
  let md = '# METİN YÜKÜ ÖLÇÜMÜ\n\n';
  md += '> Üretim: `node scripts/metin-olcum.js` · ' + bugun + ' · kural: CLAUDE.md §5/10 ·\n';
  md += '> görev: `docs/GOREV-20-sezgi-ve-akicilik.md`. Statik sayım; kümeler betiğin başında.\n\n';
  md += '## 1. Özet\n\n| Küme | Kelime | Metin | Uzun cümle (' + UZUN + '+ kelime) |\n';
  md += '|---|---|---|---|\n';
  for (const k of kumeler) {
    const l = satirlar.filter((r) => r.kume === k);
    md +=
      '| ' +
      k +
      ' | ' +
      toplam(l, 'kelime') +
      ' | ' +
      toplam(l, 'metin') +
      ' | ' +
      toplam(l, 'uzun') +
      ' |\n';
  }
  md +=
    '| **TOPLAM** | **' +
    toplam(satirlar, 'kelime') +
    '** | **' +
    toplam(satirlar, 'metin') +
    '** | **';
  md += toplam(satirlar, 'uzun') + '** |\n\n';
  md += '**Hedef (GOREV-20 §4.7):** OYUN İÇİ kümede uzun cümle **0**.\n\n';
  md += '## 2. Dosya başına\n\n| Dosya | Küme | Kelime | Uzun |\n|---|---|---|---|\n';
  for (const r of satirlar) {
    md +=
      '| `' +
      r.dosya.replace('src/', '') +
      '` | ' +
      r.kume +
      ' | ' +
      r.kelime +
      ' | ' +
      r.uzun.length +
      ' |\n';
  }
  md += '\n## 3. OYUN İÇİ uzun cümleler — yapılacaklar listesi\n\n';
  md += 'Her biri ya bir görsele (vurgu, simge, renk + biçim, sayı) dönüşecek ya da kalkacak.\n\n';
  for (const r of satirlar.filter((x) => x.kume === 'OYUN İÇİ' && x.uzun.length)) {
    md += '**`' + r.dosya.replace('src/', '') + '`**\n\n';
    for (const t of r.uzun) md += '- ' + t.replace(/\|/g, '/').replace(/\n/g, ' ') + '\n';
    md += '\n';
  }
  fs.writeFileSync(CIKTI, md);
  return { kumeler: kumeler.map((k) => [k, satirlar.filter((r) => r.kume === k)]), toplam };
}

const satirlar = olc();
const { kumeler, toplam } = yaz(satirlar);
console.log('METİN YÜKÜ');
for (const [k, l] of kumeler) {
  console.log(
    '  ' +
      k.padEnd(11) +
      String(toplam(l, 'kelime')).padStart(5) +
      ' kelime · ' +
      toplam(l, 'uzun') +
      ' uzun cümle'
  );
}
console.log('Yazıldı: ' + path.relative(KOK, CIKTI));
