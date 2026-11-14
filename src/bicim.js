// EKRANDA SAYI GÖSTERME KURALLARI (Görev 03 §6.4).
//
// Havuzlar kesirli birikir (3.85 gibi), ekranda sade görünür. Kural:
//   • Havuz: aşağı yuvarlanır — oyuncuya elinde olmayan kaynağı göstermeyelim.
//   • Gelir: tam sayıysa düz yazılır (+7), kesirliyse tek haneye yuvarlanır (+3.9).
//     Oyun başında her il kendi parçalarının hepsine sahip olduğu için gelirler tam sayıdır;
//     kesirler ancak il bölünmeye başlayınca çıkar.

export function havuzYaz(deger) {
  return String(Math.floor(deger + 1e-9));
}

export function gelirYaz(deger) {
  const y = Math.round(deger * 10) / 10;
  return Number.isInteger(y) ? String(y) : y.toFixed(1);
}
