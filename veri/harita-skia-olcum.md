# SKIA HARİTASI — BİLGİSAYAR ÖLÇÜMÜ

> Üretim: `node scripts/harita-skia-onizleme.js` · 2026-09-24 · görev: `docs/GOREV-20-sezgi-ve-akicilik.md`
> Maç: Türkiye, tohum 7, 15. tur · ekran 915×412 dp (yatay telefon), çizim 2× yoğunlukta.
> Görüntüler: `onizleme/harita-skia/` (depoya girmiyor, bu betik yeniden üretir).

⚠ Süreler bilgisayarın İŞLEMCİSİNDE ölçüldü (CanvasKit). Telefonda çizimi ekran kartı yapıyor; mutlak süre farklıdır. Bu tablo sadeleşmenin görünürlüğünü söyler; hız için `onizleme/harita-hiz.html` → `veri/harita-hiz-olcum.md` (ekran kartıyla).

## 1. Hazırlık (maç başında / veri değişince, JS iş parçacığı)

| İş | Süre |
|---|---|
| 4 seviyenin 181'er dolgu yolu + tam yollar (bir kez) | 207 ms |
| Sınır çizgisi şeritleri (maç başına) | 69 ms |
| 16 bandın çizgi resmi (maç başına) | 27 ms |
| Süsler: kıyı gölgesi, dağ, tepe, dalga (maç başına) | 54 ms |
| Rozet resimleri (ordular değişince) | 7 ms |
| Cephe hattı: 7 hat (sahiplik/savaş değişince) | 4 ms |
| Nehirler ve göller (maç başına) | 3 ms |
| 4 dolgu resminin kaydı (sahiplik değişince) | 2 ms |

## 2. Kare başına çizim ve sadeleşme denetimi

| Görünüm | Yakınlık | Seçilen tolerans | Nokta | Kare (işlemci) | En ince seviyeyle kare | Farklı piksel |
|---|---|---|---|---|---|---|
| 1-uzak-turkiye | 0.9× | 0.5 | 11055 | 414.4 ms | 543.0 ms | %0.795 |
| 2-il-rozetleri-ankara | 1.6× | 0.2 | 22766 | 671.6 ms | 458.1 ms | %0.492 |
| 3-gecis-istanbul | 2.5× | 0.2 | 22766 | 500.5 ms | 567.1 ms | %0.457 |
| 4-parca-rozetleri-marmara | 4× | 0.1 | 37035 | 583.7 ms | 741.9 ms | %0.478 |
| 5-en-yakin-yalova | 7× | 0.05 | 48230 | 693.4 ms | 925.4 ms | %0.533 |
| 6-secili-parca | 3.2× | 0.1 | 37035 | 551.2 ms | 718.8 ms | %0.517 |
| 7-kadro-seridi-ege | 4.5× | 0.1 | 37035 | 473.8 ms | 622.0 ms | %0.464 |
| 8-kadro-seridi-marmara | 4× | 0.1 | 37035 | 534.5 ms | 739.2 ms | %0.489 |
| 9-dogrudan-hamle | 3.2× | 0.1 | 37035 | 552.7 ms | 750.3 ms | %0.356 |
| 10-hamle-hakki | 3.4× | 0.1 | 37035 | 547.1 ms | 716.2 ms | %0.531 |
| 10b-hamle-hakki-sonuk-an | 3.4× | 0.1 | 37035 | 547.4 ms | 718.4 ms | %0.531 |
| 11-hamle-hakki-il | 1.8× | 0.2 | 22766 | 536.6 ms | 619.8 ms | %0.453 |
| 15-nehir-goller-uzak | 1× | 0.5 | 11055 | 518.0 ms | 635.6 ms | %0.968 |
| 15b-nehir-van-golu | 3× | 0.1 | 37035 | 368.2 ms | 439.2 ms | %0.254 |
| 15c-nehir-tuz-golu | 2.2× | 0.2 | 22766 | 590.7 ms | 656.8 ms | %0.495 |
| 14-birlik-figurleri | 6× | 0.05 | 48230 | 482.2 ms | 696.0 ms | %0.361 |
| 14b-birlik-figurleri-marmara | 7× | 0.05 | 48230 | 608.1 ms | 871.6 ms | %0.604 |
| 12-cephe-hatti | 2.2× | 0.2 | 22766 | 539.7 ms | 621.6 ms | %0.601 |
| 12b-cephe-hatti-yakin | 7× | 0.05 | 48230 | 260.6 ms | 350.1 ms | %0.251 |

**Farklı piksel**: seçilen seviye ile en ince seviyenin görüntüsünde renk kanalı 48'den fazla ayrışan piksellerin oranı. Sıfıra yakın olmalı — kademeli geometri göze görünmemeli.
