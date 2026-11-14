# MORAL / BOZGUN MODELİ ÖLÇÜMÜ (Görev 07 / Adım 1)

> Üretildi: `node scripts/moral-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

Görev 06 §13/1b devri: **birlik eklemek muharebe sonucunu kötüleştirebiliyordu.**
Yapay zekânın fayda hesabı (§9.1) bunun tersine dayandığı için zekâdan ÖNCE ölçüldü.

## SONUÇ

**Seçilen: `oran 0.60`**

> ⚠ Bu seçim **yalnızca anomali ölçütüne** göre. Oyundaki taban (`MORAL.TABAN = 0.4`) 2026-08-08'de başka bir ölçütle seçilmişti: 0.35 "zırhlı 3 piyadeye kaybeder"
> kısıtını kırıyor ve 0.40 o kısıtı kurtaran en küçük değer. İki ölçüt farklı soru
> soruyor; buradaki kazanan tek başına tabanı değiştirme gerekçesi değildir.

| | Bugünkü (sayaç) | Seçilen |
|---|---|---|
| Birlik ekleyince KAZANIRKEN KAYBEDEN | 8 / 416025 = **0.00%** | 0 = **0.00%** |
| Birlik ekleyince SAĞ KALANI AZALAN | 14256 = **3.43%** | 10786 = **2.59%** |
| §3.7 doğrulama tablosu | 15/15 | **15/15** |

## Tüm adaylar

Tarama: her (saldıran × savunan × arazi) üçlüsünde saldırana her türden **birer
birim eklenip** sonuç karşılaştırılıyor. Şans kapalı — ölçüm belirlenimci.

| Model | Kritik anomali | Yumuşak anomali | Kritik (savunan +1 moral) | Bugünkü oyunla uyum | §3.7 kesin satırlar | §3.7 dört kısıt |
|---|---|---|---|---|---|---|
| `sayaç (bugünkü)` | 8 (0.00%) | 14256 (3.43%) | 102 (0.02%) | — (temel) | ✓ 15/15 | ✓ tam |
| `oran 0.40` | 0 (0.00%) | 23321 (5.61%) | 0 (0.00%) | 99.44% | ✓ 15/15 | ✓ tam |
| `oran 0.50` | 0 (0.00%) | 17972 (4.32%) | 0 (0.00%) | 99.44% | ✓ 15/15 | ✓ tam |
| `oran 0.50 · bonus 0.10` | 0 (0.00%) | 17972 (4.32%) | 0 (0.00%) | 99.44% | ✓ 15/15 | ✓ tam |
| `oran 0.60` | 0 (0.00%) | 10786 (2.59%) | 0 (0.00%) | 99.44% | ✓ 15/15 | ✓ tam |

Taranan durum sayısı: **416.025** (kompozisyon uzayı tür başına 0–5 birim, üç arazi).

## Görev belgesinin dört adayı — üçü aynı kapıya çıkıyor

Belge dört aday sayıyordu. Ölçüme girmeden önce analitik olarak elenen üçü:

| Aday | Bozgun koşulu | Neden sayaç modeliyle AYNI |
|---|---|---|
| 1 — kesirli taban | `k ≥ n/2 + bonus` | `k` tam sayı olduğu için `k ≥ ⌈n/2 + bonus⌉` ile aynı eşik |
| 3 — kayıp başına `2/n` moral | `2k/n ≥ 1` ⟺ `k ≥ n/2` | aynı eşik, yalnızca ölçek değişmiş |
| 2/4 — bozgun kayıp ORANINA bakar | `k/n ≥ 0.5` ⟺ `k ≥ n/2` | **birim** oranı da tam sayıya çarpıyor |

Üçü de `n = 3` ve `n = 4` için aynı kayıp sayısında (2) bozuluyor — yani dördüncü
birim hâlâ moral getirmiyor. **Granülerliğin kaynağı formül değil, kaybın tam sayı
olması.** Tek yönlülük ancak bozgun SÜREKLİ bir büyüklüğe bağlanınca kazanılıyor:
ordunun kaybettiği **can oranı**. Birlik eklemek başlangıç canını artırır, yani
aynı hasar daha küçük bir oran demektir — bu ölçü tanımı gereği tek yönlüdür.

## İki model birden — ayrışma kontrolü

Görev 06'nın dersi: **ölçütün kendisi de yanlış olabilir.** Sürekli referans model
moral ve bozgun TANIMAZ (kesirli birimlerle çalışır), yani bozgun modeli onu hiç
etkilemez — bu ölçümde sabit bir hakem olarak duruyor.

- Sürekli model, §3.7: **15/15** satır tutuyor (3 yumuşak)
- `sayaç (bugünkü)` motorla: **15/15** kesin satır tutuyor
- `oran 0.40` motorla: **15/15** kesin satır tutuyor
- `oran 0.50` motorla: **15/15** kesin satır tutuyor
- `oran 0.50 · bonus 0.10` motorla: **15/15** kesin satır tutuyor
- `oran 0.60` motorla: **15/15** kesin satır tutuyor

## Bugünkü modelin somut anomalileri (seçilen modelde hiçbiri yok)

- **4 topçu + 5 zırhlı** vs **1 piyade + 3 topçu + 5 zırhlı** (ova): saldıran kazanıyor. 1 topçu eklenince **kaybediyor** (sure → bozgun).
- **4 topçu + 5 zırhlı** vs **5 piyade + 4 topçu + 3 zırhlı** (ova): saldıran kazanıyor. 1 piyade eklenince **kaybediyor** (bozgun → bozgun).
- **1 piyade + 3 topçu + 5 zırhlı** vs **5 topçu + 5 zırhlı** (ova): saldıran kazanıyor. 1 piyade eklenince **kaybediyor** (bozgun → bozgun).

## Ölçümün kuralları

- Muharebeler oyunun kendi motoruyla koşuluyor (`src/oyun/muharebe.js`), şans kapalı.
- Bozgun modeli motora PARAMETRE olarak giriyor (`muharebeCoz({ moral })`); ölçüm
  ile oyun aynı satırdan besleniyor, ikinci bir motor yazılmadı.
- §3.7 kontrolünde kıl payı biten üç satır değerlendirilmiyor: motorda kazanan her
  zaman en az 1 birimle çıkar, o yüzden orada "ne kadar kesin kazandı" ölçülemez
  (gerekçe `scripts/muharebe-referans.js` içinde).
- Seçim ölçütü: §3.7 tam (15/15) **ve** kritik anomali toplamı en düşük.
