# BİTİRME İŞTAHI ÖLÇÜMÜ

> Üretici: `node scripts/bitirme-olcum.js` · 2 tohum ortalaması · 150 tur
> Oyuncu hiç emir vermiyor — ölçülen şey dünyanın kendi kendine ne yaptığı.

Ayar: `DOYMA_TURU 60` · `SALDIRI_CARPANI 2` ·
`TEMKIN_SONUMU 0.6` · `ILAN_CARPANI 2`

---

## Neden ölçüldü

Fetih ve %50 hâkimiyet modlarında tur sınırı kaldırıldı. Sınır bir emniyet kemeriydi:
dünya kilitlense bile maç "süre doldu, toprağa bak" diye bitiyordu. Sınır kalkınca
kilitlenen bir dünyada maç **hiç bitmez**. Bitirme iştahı o riskin karşılığı.

Kilidin iki işareti birlikte okunur: en büyük imparatorluğun payı **büyümüyorsa** ve tur
başına muharebe **sıfıra iniyorsa** dünya donmuş demektir.

---

## İştah KAPALI (eski davranış)

### Orta kademe
| Tur | En büyük imparatorluk | Muharebe/tur | Canlı aktör |
|---|---|---|---|
| 25 | %6 | 3.0 | 68 |
| 50 | %8 | 0.7 | 67 |
| 75 | %9 | 0.7 | 65 |
| 100 | %9 | 0.5 | 65 |
| 150 | %10 | 0.1 | 64 |

### Zor kademe
| Tur | En büyük imparatorluk | Muharebe/tur | Canlı aktör |
|---|---|---|---|
| 25 | %13 | 17.4 | 28 |
| 50 | %25 | 7.4 | 19 |
| 75 | %41 | 4.6 | 15 |
| 100 | %57 | 3.3 | 10 |
| 150 | %72 | 1.6 | 5 |

---

## İştah AÇIK (bugünkü ayar)

### Orta kademe
| Tur | En büyük imparatorluk | Muharebe/tur | Canlı aktör |
|---|---|---|---|
| 25 | %8 | 4.2 | 64 |
| 50 | %14 | 3.1 | 57 |
| 75 | %13 | 6.1 | 51 |
| 100 | %17 | 3.8 | 46 |
| 150 | %22 | 1.8 | 41 |

### Zor kademe
| Tur | En büyük imparatorluk | Muharebe/tur | Canlı aktör |
|---|---|---|---|
| 25 | %18 | 19.5 | 26 |
| 50 | %44 | 13.8 | 10 |
| 75 | %74 | 10.9 | 6 |
| 100 | %99 | 3.8 | 2 |
| 150 | %99 | 0.0 | 2 |

---

## Okunuşu

**Orta kademe — kilit gerçekten vardı ve açıldı.** İştah kapalıyken en büyük imparatorluk
150 turda %6'den yalnızca
%10'e çıkıyor ve muharebe
3.0'den 0.1'e
sönüyor — tarif edilebilecek en net kilit. İştah açıkken aynı 150 turda pay
%22'e çıkıyor. **Maç artık bir yere varıyor.**

**Zor kademede iştah dünyayı hızlandırmıyor, DENGELİYOR.** Pay
%72 yerine %99'de
duruyor ve canlı aktör sayısı 5 yerine
2 kalıyor. Sebep: iştah HERKESİ cesaretlendiriyor,
yalnızca lideri değil. Tek bir devin sıyrılması zorlaşıyor.

⚠ **Bilinen sınır:** zor kademede tam fetih (%100) yapay zekâların kendi aralarında
gerçekleşmiyor. Bu bir kilit değil — muharebe
0.0/tur ile sürüyor, dünya canlı. Ama tur sınırı da
olmadığı için o moddaki maçı bitirecek olan **oyuncunun kendisi**.
