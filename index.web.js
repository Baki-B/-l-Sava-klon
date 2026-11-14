import '@expo/metro-runtime';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb({
  locateFile: (file) => `${process.env.EXPO_BASE_URL || ''}/${file}`,
})
  .then(() => {
    // Skia kullanan oyun bileşenleri ancak CanvasKit hazırken yüklenebilir.
    require('./index.js');
  })
  .catch((error) => {
    console.error('İl Savaşları yüklenemedi:', error);
    document.getElementById('root').textContent =
      'İl Savaşları açılamadı. Sayfayı yenileyip tekrar deneyin.';
  });
