# TEMA KONTRAST ÖLÇÜMÜ

> Üreten: `scripts/tema-olcum.js` · Tarih: 2026-10-29
>
> Bu dosya ELLE YAZILMAZ. `src/tema.js`'te bir renk değişince betik yeniden çalıştırılır.

Ölçü: WCAG 2.1 kontrast oranı (1.0 = aynı renk, 21 = siyah/beyaz).
Ton sütunu, düşük parlaklık kontrastını neyin taşıdığını gösterir — iki renk arasında
yeterli ton farkı varsa göz onları parlaklıktan değil renkten ayırır.

| Renk | Zemin | Oran | Asgari | Ton farkı | Ne için |
|---|---|---|---|---|---|
| `YAZI_RENK.birincil` | `ZEMIN.yuzey` | 7.77:1 | 7 | 8° | başlık, sayı, karar |
| `YAZI_RENK.ikincil` | `ZEMIN.yuzey` | 5.40:1 | 4.5 | 5° | etiket, açıklama |
| `YAZI_RENK.soluk` | `ZEMIN.yuzey` | 3.99:1 | 3 | 4° | birim, dipnot (bilerek zayıf) |
| `YAZI_RENK.birincil` | `ZEMIN.cukur` | 11.82:1 | 7 | 8° | oyuk satırda başlık |
| `YAZI_RENK.ikincil` | `ZEMIN.cukur` | 8.21:1 | 4.5 | 5° | oyuk satırda etiket |
| `YAZI_RENK.soluk` | `ZEMIN.cukur` | 6.07:1 | 3 | 4° | oyuk satırda dipnot |
| `KAGIT.yazi` | `#E4E8EB` | 11.85:1 | 7 | 3° | kâğıtta başlık ve karar |
| `KAGIT.yaziIkincil` | `#E4E8EB` | 7.42:1 | 4.5 | 1° | kâğıtta etiket ve açıklama |
| `KAGIT.yaziSoluk` | `#E4E8EB` | 4.31:1 | 3 | 2° | kâğıtta dipnot (bilerek zayıf) |
| `KAGIT.yazi` | `#D5DBE0` | 10.46:1 | 7 | 2° | kâğıt oyuk satırda başlık |
| `KAGIT.yaziIkincil` | `#D5DBE0` | 6.55:1 | 4.5 | 0° | kâğıt oyuk satırda etiket |
| `KAGIT.murekkep` | `#E4E8EB` | 9.73:1 | 4.5 | 5° | mühür ve ikon çizimi |
| `KAGIT.murekkepSoluk` | `#E4E8EB` | 2.34:1 | 2 | 1° | kazanılmamış mühür |
| `KAGIT.arti` | `#E4E8EB` | 5.15:1 | 4.5 | 64° | kâğıtta kazanç/olumlu |
| `KAGIT.eksi` | `#E4E8EB` | 5.60:1 | 4.5 | 166° | kâğıtta kayıp/uyarı |
| `METAL.bronz` | `#E4E8EB` | 6.02:1 | 3 | 179° | bronz mühür gövdesi |
| `METAL.gumus` | `#E4E8EB` | 5.72:1 | 3 | 4° | gümüş mühür gövdesi |
| `METAL.altin` | `#E4E8EB` | 4.72:1 | 3 | 163° | altın mühür gövdesi |
| `DURUM.arti` | `ZEMIN.yuzey` | 4.74:1 | 4.5 | 70° | gelir + |
| `DURUM.eksi` | `ZEMIN.yuzey` | 4.58:1 | 4.5 | 172° | gider − (YAZI, okunmalı) |
| `DURUM.eksi` | `ZEMIN.cukur` | 6.96:1 | 4.5 | 172° | oyuk satırda gider − |
| `DURUM.arti` | `ZEMIN.cukur` | 7.21:1 | 4.5 | 70° | oyuk satırda gelir + |
| `VURGU.saldiri` | `ZEMIN.yuzey` | 1.76:1 | 1.5 | 160° | saldırı dolgusu (tonla ayrışır) |
| `VURGU.uzeriYazi` | `VURGU.saldiri` | 4.78:1 | 4.5 | — | saldırı düğmesinin YAZISI |
| `CIZGI.ince` | `ZEMIN.yuzey` | 1.88:1 | 1.4 | 1° | kutu kenarı |
| `CIZGI.ayrac` | `ZEMIN.yuzey` | 1.48:1 | 1.3 | 0° | panel içi ayraç |
| `ZEMIN.cukur` | `ZEMIN.yuzey` | 1.52:1 | 1.2 | 0° | oyuk satır (gömülü dursun) |
| `ZEMIN.taban` | `ZEMIN.yuzey` | 1.22:1 | 1.1 | 1° | alt katman |
| `ZEMIN.kabartma` | `ZEMIN.yuzey` | 1.37:1 | 1.2 | 0° | seçili yüzey (üstte dursun) |
| `MENU_RENK.yazi` | `ZEMIN.yuzey` | 7.77:1 | 7 | 8° | menü paneli başlığı |
| `MENU_RENK.yaziSolu` | `ZEMIN.yuzey` | 5.40:1 | 4.5 | 5° | menü köşe parantezi |
| `MENU_RENK.kara` | `MENU_RENK.deniz` | 1.98:1 | 1.5 | 111° | kara/deniz ayrımı |
| `MENU_RENK.kiyi` | `MENU_RENK.deniz` | 3.89:1 | 1.5 | 5° | kıyı çizgisi |
| `MENU_RENK.sinir` | `MENU_RENK.kara` | 16.16:1 | 1.5 | — | parça sınırı (siyah) |

## Zemin merdiveni

✓ `cukur` < `taban` < `yuzey` < `kabartma` — derinlik sırası sağlam.

Merdiven bozulursa panel "üstte" durmayı bırakır ve oyuk satırlar gömülü görünmez.
