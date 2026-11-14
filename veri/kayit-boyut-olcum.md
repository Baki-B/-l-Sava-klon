# KAYIT BOYUTU — 60 TURLUK ÖLÇÜM (Görev 09 / Adım 0)

> Üretildi: `node scripts/kayit-boyut-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-01

Tohum 20260801 · 60 tur · oyuncu davranışı `denge-simulasyonu.js`
ile aynı (üret · araştır · yalnızca üstün olduğun en zayıf komşuya saldır).

## Neden ölçüldü

Bugüne kadarki BÜTÜN kayıt boyutu ölçümleri **15 tur** üzerinden yapıldı. Görev 09 mod
sistemini getiriyor ve maçlar 40–60 tura çıkacak. 15 turluk bir sayıya bakıp "sınırın
altındayız" demek, hiç oynanmamış bir maç uzunluğu için söz vermek olurdu.

## Tur tur boyut

### Türkiye · orta

| Tur | Kayıt (KB) | Oyuncunun parçası | En büyük üç alan |
|---|---|---|---|
| 0 | **14.8** | 4 | ordular 7.3 · aktorler 3.2 · parcaSahipligi 2.1 |
| 10 | **20.9** | 7 | ordular 8.0 · arastirma 3.8 · aktorler 3.3 |
| 20 | **21.8** | 4 | ordular 8.4 · arastirma 3.8 · aktorler 3.3 |
| 30 | **22.4** | 7 | ordular 8.8 · arastirma 3.7 · aktorler 3.3 |
| 40 | **22.6** | 2 | ordular 8.7 · arastirma 3.6 · aktorler 3.3 |
| 50 | **22.7** | 2 | ordular 8.5 · arastirma 3.6 · aktorler 3.3 |
| 60 | **22.7** | 2 | ordular 8.6 · arastirma 3.6 · aktorler 3.3 |

Tur 60 sonunda: ordu kaydı 141/181 parçada · araştırma kaydı 79 aktörde · 50 bağımsız aktör kaldı.

### Türkiye · zor

| Tur | Kayıt (KB) | Oyuncunun parçası | En büyük üç alan |
|---|---|---|---|
| 0 | **14.8** | 4 | ordular 7.3 · aktorler 3.2 · parcaSahipligi 2.1 |
| 10 | **19.9** | 5 | ordular 7.8 · aktorler 3.3 · arastirma 2.3 |
| 20 | **19.4** | 0 | ordular 7.7 · aktorler 3.3 · arastirma 2.2 |
| 30 | **18.3** | 0 | ordular 6.6 · aktorler 3.3 · arastirma 2.2 |
| 40 | **17.5** | 0 | ordular 5.5 · aktorler 3.3 · parcaSahipligi 2.1 |
| 50 | **15.7** | 0 | ordular 3.4 · aktorler 3.3 · turGecmisi 2.3 |
| 60 | **14.7** | 0 | aktorler 3.3 · ordular 2.5 · turGecmisi 2.3 |

Tur 60 sonunda: ordu kaydı 39/181 parçada · araştırma kaydı 62 aktörde · 7 bağımsız aktör kaldı.

### Karadeniz · zor

| Tur | Kayıt (KB) | Oyuncunun parçası | En büyük üç alan |
|---|---|---|---|
| 0 | **3.1** | 2 | ordular 1.3 · aktorler 0.7 · senaryo 0.4 |
| 10 | **4.4** | 0 | ordular 1.6 · aktorler 0.7 · turGecmisi 0.5 |
| 20 | **4.9** | 0 | ordular 1.3 · turGecmisi 0.9 · aktorler 0.7 |
| 30 | **5.1** | 0 | turGecmisi 1.4 · ordular 1.2 · aktorler 0.7 |
| 40 | **5.2** | 0 | turGecmisi 1.9 · ordular 1.0 · aktorler 0.7 |
| 50 | **5.6** | 0 | turGecmisi 2.3 · ordular 0.9 · aktorler 0.7 |
| 60 | **5.7** | 0 | turGecmisi 2.3 · ordular 0.9 · aktorler 0.7 |

Tur 60 sonunda: ordu kaydı 14/31 parçada · araştırma kaydı 13 aktörde · 3 bağımsız aktör kaldı.

## Sonuç

- **En büyük ölçülen kayıt: 22.7 KB.**
- Eğri turla birlikte **doygunluğa gidiyor, doğrusal değil.** Sebebi yapısal: `ordular`
  en fazla parça sayısı kadar satır tutabiliyor (181), `arastirma` en fazla aktör sayısı
  kadar (81 → konsolidasyonla azalıyor), `turGecmisi` `DENGE.TUR_GECMISI_UZUNLUGU` ile
  kırpılıyor, `duellolar` `REKABET.EN_COK_ETKIN` ile sınırlı. **Kaydın tavanı var.**
- Boyutu turdan çok **oyuncunun büyüklüğü** sürüklüyor; ordu satırı yalnızca ordusu olan
  parça için yazılıyor (Görev 04 kuralı) ve dolu parça sayısı arttıkça satır artıyor.

## 26 KB sınırı hakkında

Sınır bir **depolama kısıtı değil, kanarya**: Görev 03 §7 "yüzlerce KB ise geometri
sızmış demektir" diye yazmıştı ve 26, o gün ölçülen değerin biraz üstüne konmuştu.
Gerçek kısıt AsyncStorage tarafında ve kat kat yukarıda (Android varsayılanı uygulama
başına ~6 MB, iOS'ta böyle bir tavan yok).

Yani sayı yükseltilebilir — ama **kanarya işlevi korunarak.** Geometri sızarsa boyut
yüzlerce KB olur; sınır o kadar yükselmediği sürece test yine yakalar.
