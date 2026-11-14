# KOD & VERİ KONTROLÜ — Baki için kısa kılavuz

Amaç: kodun bug'a/karmaşaya, verinin tutarsızlığa kaçmasını **oyun açılmadan** yakalamak.

> **Önemli (senin PowerShell'in için):** Komutu `npm` değil **`npm.cmd`** diye yaz. PowerShell, `npm` yazınca `npm.ps1` betiğini çalıştırmaya çalışır ve güvenlik ayarı bunu engeller ("running scripts is disabled" hatası). `npm.cmd` aynı işi yapar ama engellenmez. (Aynı sebeple `npx` yerine `npx.cmd` kullanıyoruz.)

## Tek komut

Bilgisayarda proje klasöründe şunu çalıştır:

```bash
npm.cmd run kontrol
```

Sonunda bir ÖZET çıkar. Üç satırın da başında **✓** varsa her şey yolunda:

```
  ✓ Veri tutarlılığı — temiz
  ✓ Kod hataları (ESLint) — temiz
  ✓ Biçim (Prettier) — temiz
```

Herhangi birinde **✗** görürsen: o bölümün satırlarını bana getir, çözerim.

## Üç kontrol ne yapıyor?

1. **Veri tutarlılığı** — 81 il / 193 parça / komşuluk / statlar mantıklı mı otomatik denetler. Örneğin bir ilin parça payları toplamı 1 değilse, bir komşuluk tek yönlüyse, bir stat 1–10 dışındaysa burada yakalanır. (Oyunun kalbi bu veri; en çok buna güvenmeliyiz.)
2. **Kod hataları (ESLint)** — tanımsız değişken, kullanılmayan kod, yanlış React kancası gibi **gerçek bug sebeplerini** bulur.
3. **Biçim (Prettier)** — kodu tek tip girinti/boşlukla biçimler; "spagetti" görünümü engeller.

## Biçim bozulursa otomatik düzelt

Sadece biçim (3. madde) ✗ ise, şu komut kendiliğinden düzeltir:

```bash
npm.cmd run bicimle
```

## Ne zaman çalıştırmalı?

- Telefonda test etmeden **önce** bir kez (`npm.cmd run kontrol`).
- Ben veri (iller.json vb.) ürettikten sonra — doğru çıktı mı görmek için.

> Not: kurulumdaki "35 vulnerabilities" uyarısı yalnızca bu **geliştirme araçlarına** aittir, telefondaki oyuna girmez; güvenlik sorunu değildir.
