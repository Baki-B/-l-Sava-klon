// OYUN KATEGORİSİ — Android'e "bu uygulama bir OYUN" demek (Görev 20 · DENETIM-2026-09-23 ⛔3).
//
// Android 16 (API 36) tabletlerde (kısa kenar ≥ 600 dp) uygulamaların YÖN KİLİDİNİ yok
// sayıyor: `app.json`'daki "orientation": "landscape" de, `src/yonlendirme.js`'teki çalışma
// anı kilidi de tutmuyor ve oyun tablette dik açılabiliyor. Dik tutuşta harita 2,2 kat küçük
// çiziliyor, rozetler sığmıyor (`yonlendirme.js` başındaki ölçüm).
//
// Google OYUNLARI bu kuraldan muaf tutuyor — ama uygulamanın kendini oyun diye tanıtması
// gerek: manifestte `android:appCategory="game"`. Expo'nun ayar dosyasında bu alan yok;
// bu küçük eklenti manifeste o tek satırı yazıyor.
//
// ⚠ EXPO GO'DA ETKİSİ GÖRÜNMEZ: Expo Go kendi manifestiyle çalışıyor. Fark yalnızca GERÇEK
// kurulum dosyasında (EAS derlemesi) ortaya çıkar; orada tablette denenmeli. Play Console'da
// kategori de "Oyun › Strateji" seçilmeli (docs/YAYIN-KONTROL.md).
// Kaynak: https://developer.android.com/about/versions/16/behavior-changes-16
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function oyunKategorisi(config) {
  return withAndroidManifest(config, (ayar) => {
    const uygulama =
      ayar.modResults.manifest.application && ayar.modResults.manifest.application[0];
    if (uygulama) uygulama.$['android:appCategory'] = 'game';
    return ayar;
  });
};
