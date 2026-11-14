// MERKEZ PARÇA ÜRETİMİ (Görev 17 / Adım 1).
// Çalıştırma:  node scripts/merkez-parca-uret.js
//
// ┌─ SORUN ÖLÇÜLÜ ──────────────────────────────────────────────────────────────────────┐
// │ 18 il tek parça · 38 il iki · 13 il üç · 12 il dört. İllerin %69'u en çok İKİ        │
// │ hamlede düşüyor. Fetih çok ucuz; ilin bir "kalbi" olmalı.                            │
// └─────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ⚠ NEDEN `parca-uret.js` DEĞİL DE AYRI BİR BETİK ----
//
// Merkez alanını `parca-uret.js`'e eklemek, 181 parçanın `yol` GEOMETRİSİNİ de yeniden
// üretmek demekti. Geometri bir piksel kaysa dokunma testi şaşar ve oyuncu komşu ili seçer
// — CLAUDE.md §6'daki "parmak 80 piksel şaşıyor" hatasının kardeşi.
//
// Bu betik geometriye HİÇ DOKUNMUYOR: mevcut JSON'u okuyor, her parçaya `merkez` alanını
// ekliyor, geri yazıyor. Dosya zaten `JSON.stringify` ile (boşluksuz) yazıldığı için
// gidiş-dönüş birebir aynı çıkıyor — betik bunu ÇALIŞMADAN ÖNCE kendisi doğruluyor ve
// tutmazsa hiçbir şey yazmadan duruyor.
//
// ---- MERKEZ NASIL SEÇİLİYOR ----
//
// İlin bütün parçalarının etiket çıpalarının ORTALAMASI ilin merkez noktasıdır; merkez
// parça, o noktaya en yakın etiketi olan parçadır. Tek parçalı ilde parçanın kendisi.
//
// ⚠ KODA İL LİSTESİ YAZILMIYOR. Merkez VERİDEN türetiliyor; elle yazılsaydı harita bir gün
// yeniden bölündüğünde tablo sessizce yalan söylerdi (CLAUDE.md §5/5).
//
// Eşitlikte parça kimliği sırası karar veriyor: aynı veri her zaman aynı merkezi versin.

const fs = require('fs');
const path = require('path');

const PROJ = path.join(__dirname, '..');
const DOSYA = path.join(PROJ, 'veri/parcalar.json');

const ham = fs.readFileSync(DOSYA, 'utf8');

// ---- ÖNCE GÜVENLİK: gidiş-dönüş geometriyi bozuyor mu? ----
// Bozuyorsa hiçbir şey yazmıyoruz. Bu kontrol olmasaydı betik bir gün sessizce 181 parçanın
// koordinat basamaklarını değiştirebilirdi.
const veri = JSON.parse(ham);
if (JSON.stringify(veri) !== ham) {
  console.error('DURDURULDU: JSON gidiş-dönüşü dosyayı birebir üretmiyor.');
  console.error('Geometri değişme riski var; merkez alanı YAZILMADI.');
  process.exit(1);
}

const parcalar = veri.parcalar;

// İl → parçaları
const ilParcalari = {};
for (const pid of Object.keys(parcalar)) {
  const p = parcalar[pid];
  (ilParcalari[p.kod] = ilParcalari[p.kod] || []).push(pid);
}

let degisen = 0;
const dokum = { 1: 0, 2: 0, 3: 0, 4: 0 };

for (const kod of Object.keys(ilParcalari)) {
  const liste = ilParcalari[kod].slice().sort();
  dokum[liste.length] = (dokum[liste.length] || 0) + 1;

  // İlin merkez noktası: parça etiketlerinin ortalaması.
  let mx = 0,
    my = 0;
  for (const pid of liste) {
    mx += parcalar[pid].etiket.x;
    my += parcalar[pid].etiket.y;
  }
  mx /= liste.length;
  my /= liste.length;

  // En yakın etiket. Eşitlikte kimlik sırası (liste zaten sıralı) — belirlenimci.
  let enYakin = liste[0];
  let enKisa = Infinity;
  for (const pid of liste) {
    const e = parcalar[pid].etiket;
    const d = (e.x - mx) * (e.x - mx) + (e.y - my) * (e.y - my);
    if (d < enKisa) {
      enKisa = d;
      enYakin = pid;
    }
  }

  for (const pid of liste) {
    const merkezMi = pid === enYakin;
    // Alan YALNIZCA merkez parçada yazılıyor: `true` olmayan alan kayıtta durmaz
    // (projenin her yerindeki kalıp — boş alan yazılmaz).
    if (merkezMi && parcalar[pid].merkez !== true) {
      parcalar[pid].merkez = true;
      degisen++;
    } else if (!merkezMi && parcalar[pid].merkez !== undefined) {
      delete parcalar[pid].merkez;
      degisen++;
    }
  }
}

veri.meta.merkezUretim = 'scripts/merkez-parca-uret.js';
fs.writeFileSync(DOSYA, JSON.stringify(veri));

const merkezSayisi = Object.keys(parcalar).filter((p) => parcalar[p].merkez).length;
const ilSayisi = Object.keys(ilParcalari).length;

console.log('MERKEZ PARÇA ÜRETİMİ');
console.log('  il sayısı      : ' + ilSayisi);
console.log('  merkez parça   : ' + merkezSayisi + (merkezSayisi === ilSayisi ? ' ✓' : ' ✗'));
console.log('  değişen alan   : ' + degisen);
console.log(
  '  il başına parça: 1→' + dokum[1] + ' · 2→' + dokum[2] + ' · 3→' + dokum[3] + ' · 4→' + dokum[4]
);
