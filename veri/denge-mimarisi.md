# DENGE MİMARİSİ DENETİMİ

> Üretici: `node scripts/denge-mimarisi.js`
> Baki'nin isteği: *"baştan aşağı dengeli bir mimari oluştur, kazanımlarımızı sağlam bir
> matematiğe oturtarak."*

## Stat tablosu

| Birim | Nüfus | Ekonomi | Zırh | Ağır vuruş | Hafif vuruş | Dayanıklılık |
|---|---|---|---|---|---|---|
| Piyade | 3 | 1 | 10 | 10 | 35 | 70 |
| Topçu | 2 | 3 | 20 | 50 | 15 | 55 |
| Zırhlı | 1 | 6 | 40 | 45 | 30 | 95 |

---

## 1. ROL DENETİMİ — tablo kendi tarifine sadık mı

| | Kural | Ölçü |
|---|---|---|
| ✓ | Piyade: hafif vuruş ağır vuruşundan belirgin yüksek | 35 / 10 |
| ✓ | Topçu: ağır vuruş hafif vuruşundan belirgin yüksek | 50 / 15 |
| ✓ | Zırhlı: iki vuruş da yüksek (ikisi de piyadenin ağırından fazla) | 45 / 30 |
| ✓ | Dayanıklılık sırası: zırhlı > piyade > topçu | 95 > 70 > 55 |
| ✓ | Zırh sırası: zırhlı > topçu > piyade | 40 > 20 > 10 |
| ✓ | Bütün statlar ölçeğin katı (araştırma artışı tam sayı kalsın) | ölçek 5 |

**Altı kuralın altısı da tutuyor.**

---

## 2. FİYAT — maliyet başına savaş değeri

Savaş değeri = dayanıklılık × üç hedefe ortalama hasar. Zırhlının hasarı üç arazinin
ortalamasıyla alınıyor (ova 1.15 · tepelik 0.85 ·
dağlık 0.5 → 0.83); yalnız ovaya bakmak
onu olduğundan güçlü gösterirdi.

| Birim | Bedel (nüfus+ekonomi) | Ort. hasar | Savaş değeri | Bedel başına | Ortalamadan sapma |
|---|---|---|---|---|---|
| Piyade | 4 | 28 | 1.992 | 498 | -3.9% |
| Topçu | 5 | 45 | 2.448 | 490 | -5.5% |
| Zırhlı | 7 | 42 | 3.969 | 567 | +9.4% |

**En büyük sapma: %9.4.** Sapma ne kadar küçükse oyuncunun birim seçimi
o kadar gerçek bir karar; büyük sapma "hep aynı birimi bas" demektir.

---

## 3. KARŞILAŞMA MATRİSİ — taş-kağıt-makas dönüyor mu

Her hücre **eşit parayla** kurulmuş bir muharebe: iki tarafa da aynı bütçe verilip birim
sayısına çevriliyor (bu yüzden 6v10 gibi eşitsiz sayılar görüyorsun — eşit olan PARA).
Parantez: kuvvetler ve savaşın kaç raunt sürdüğü.

### OVA

| Saldıran ↓ / Savunan → | Piyade | Topçu | Zırhlı |
|---|---|---|---|
| **Piyade** | kaybeder (10v10, 3r) | **KAZANIR** (10v8, 2r) | kaybeder (10v6, 2r) |
| **Topçu** | kaybeder (8v10, 2r) | kaybeder (8v8, 1r) | kaybeder (8v6, 1r) |
| **Zırhlı** | **KAZANIR** (6v10, 2r) | **KAZANIR** (6v8, 1r) | kaybeder (6v6, 2r) |

### TEPELIK

| Saldıran ↓ / Savunan → | Piyade | Topçu | Zırhlı |
|---|---|---|---|
| **Piyade** | kaybeder (10v10, 3r) | **KAZANIR** (10v8, 2r) | kaybeder (10v6, 2r) |
| **Topçu** | kaybeder (8v10, 2r) | kaybeder (8v8, 1r) | kaybeder (8v6, 2r) |
| **Zırhlı** | **KAZANIR** (6v10, 2r) | **KAZANIR** (6v8, 2r) | kaybeder (6v6, 2r) |

### DAGLIK

| Saldıran ↓ / Savunan → | Piyade | Topçu | Zırhlı |
|---|---|---|---|
| **Piyade** | kaybeder (10v10, 2r) | kaybeder (10v8, 2r) | kaybeder (10v6, 2r) |
| **Topçu** | kaybeder (8v10, 1r) | kaybeder (8v8, 1r) | **KAZANIR** (8v6, 2r) |
| **Zırhlı** | kaybeder (6v10, 2r) | kaybeder (6v8, 2r) | kaybeder (6v6, 2r) |

---

## 4. SAVAŞ KAÇ RAUNT SÜRER — ORDU BÜYÜKLÜĞÜ

Baki (2026-08-08): *"Savaşların raund sayısı büyüklüğüne göre 1–4 arasında değişse güzel
olur: küçük 1–9 birimlik savaşlar için 1 tur, 10–19 için 2 tur, 20–49 için 3 tur, 50–99
için 4 tur gibisinden."*

Ölçü **iki tarafın toplam birim sayısı**. Kademe bir ÜST SINIR: bozgun ya da imha savaşı
daha erken bitirebilir — son sütun motorun gerçekten kaç raunt oynattığını gösteriyor.

| Toplam birim | Kademe | Örnek | Motorun oynattığı |
|---|---|---|---|
| 2 | 1 raunt | 1P → 1P | 1 (sure) |
| 9 | 1 raunt | 5P → 4P | 1 (bozgun) |
| 10 | 2 raunt | 5P → 5P | 2 (bozgun) |
| 19 | 2 raunt | 10P → 9P | 2 (bozgun) |
| 20 | 3 raunt | 10P → 10P | 3 (bozgun) |
| 49 | 3 raunt | 25P → 24P | 3 (bozgun) |
| 50 | 4 raunt | 25P → 25P | 4 (bozgun) |
| 80 | 4 raunt | 40P → 40P | 4 (bozgun) |

---

## 5. MORAL SAVAŞIN SÜRESİNİ BELİRLİYOR MU

Baki: *"moral etkisi savaşların ne kadar süreceğini etkilesin; moral düşükse ordu nispeten
hızlı dağılsın, fakat morali düşük bile olsa o kadar hızlı dağılmamalı — tüm birliklerin
temel bir seviyesi olmalı, moral ek ne kadar olacağını belirlemeli."*

Bozgun eşiği = `TABAN 0.4` +
`MORAL_PAYI 0.25` × (moral statı / 10)
+ durum kalemleri × `0.08`

| İlin moral statı | Bozgun eşiği | 30P → 30P raunt | 20Z → 30T raunt | 30T → 30P raunt |
|---|---|---|---|---|
| 3 | 0.48 | 4 | 3 | 3 |
| 4 | 0.50 | 4 | 3 | 4 |
| 5 | 0.53 | 4 | 3 | 4 |
| 6 | 0.55 | 4 | 3 | 4 |
| 7 | 0.57 | 4 | 3 | 4 |

Taban, moral ne olursa olsun geçerli: en düşük moralli ordu bile canının
**%40**'i gitmeden dağılmıyor.
