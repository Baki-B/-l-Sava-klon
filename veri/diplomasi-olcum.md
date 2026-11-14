# DİPLOMASİ ÖLÇÜMÜ — İTTİFAK DOYGUNLUĞU (Görev 09 / Adım 3)

> Üretildi: `node scripts/diplomasi-olcum.js` — ELLE DÜZENLEME.
> Tarih: 2026-08-12

30 tur × 3 tohum × 3 zorluk, diplomasi açık ve kapalı.

## Neden bu ölçüldü

Görev belgesi §10/6: **"İttifak doygunluğu — bu görevin oyunu bozabileceği tek yer.
Herkes herkesle anlaşırsa savaş durur ve oyun donar."** Adım 3 bunu kod tamamlanmadan
ölçmeyi şart koşuyordu.

## Sonuç

| Kademe | Muharebe (kapalı → açık) | Fetih (kapalı → açık) | İttifaklı aktör | En büyük blok / canlı |
|---|---|---|---|---|
| kolay | 32 → 19 ⚠ | 34 → 20 | 29% | 3.7 / 79 |
| orta | 267 → 110 ⚠ | 376 → 136 | 32% | 4.3 / 67 |
| zor | 1003 → 595 ⚠ | 1777 → 988 | 32% | 2.0 / 21 |

**Sağlıklı aralık** (belge §Adım 3/a): muharebe sayısı belirgin düşmeyecek ·
ittifaklı aktör oranı yarıdan az · en büyük blok haritanın yarısından küçük.

## Düğmeler

Tarama: `node scripts/diplomasi-olcum.js ESIK=1.5 EN_COK_ITTIFAK=2`

| Düğme | Bugün | Ne yapar |
|---|---|---|
| `FAYDA.ESIK` | 0.7 | Teklifin verilmesi/kabulü için gereken en az puan |
| `FAYDA.CEPHE_YUKU` | 0.8 | Çok cepheli aktörün anlaşmaya açlığı |
| `FAYDA.KOMSU` | -1 | Komşuyla anlaşmanın maliyeti (cephe kapanır) |
| `FAYDA.ZAYIF_KOMSU` | -1.2 | Yiyebileceğim komşuyla anlaşmamak |
| `EN_COK_ITTIFAK` | 2 | Aynı anda en çok kaç ittifak |
| `TUR_BASINA_TEKLIF` | 2 | Tur başına teklif sayısı |
