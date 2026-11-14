// YATAY TUTUŞ KİLİDİ (Görev 04, Adım 1 — Baki'nin 2026-07-27 kararı).
//
// Neden: strateji haritası dik tutuşta oynanamıyor. Ölçüm: harita 1000×452 birim,
// dik tutuşta (412×915 dp) 1 harita birimi 0.412 piksel; yatayda (915×412 dp) 0.912.
// Yatayda harita 2.21 KAT büyük çiziliyor. Dik tutuşta 1× yakınlaştırmada hiçbir
// parçaya ordu rozeti sığmıyor.
//
// İki katmanlı kilit — biri tutmazsa öbürü tutsun:
//   1. app.json "orientation": "landscape"  → uygulama yatay açılır
//   2. buradaki çalışma anı kilidi          → açıldıktan sonra da dönmez
// Expo Go'da 1. madde bazen atlanır; asıl güvence 2. maddedir.
//
// Kilit kurulamazsa (web, eski istemci, izin yok) uygulama ÇÖKMEZ — sessizce atlanır.
// Yönlendirme oyun mantığı değil, sunum katmanıdır; başarısızlığı oyunu bozmamalı.

import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

// Uygulama açılırken bir kez çağrılır (App.js). Söz döndürür ama beklenmesi şart değil.
export async function yatayaKilitle() {
  try {
    // LANDSCAPE = iki yatay yön de serbest; telefonu ters çevirince ekran ters durmasın.
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return { ok: true };
  } catch (e) {
    return { ok: false, sebep: String(e && e.message ? e.message : e) };
  }
}

// ---- ANDROID GEZİNME ÇUBUĞU ----
// Sorun (Baki bildirdi, 2026-07-27): Samsung'da geri / ana sayfa düğmeleri yatay tutuşta
// yan yatık kalıyor. Sebep: uygulama yataya kilitli ama telefonun kendi otomatik döndürmesi
// kapalıysa sistem çubuğu dik konumda kalıyor, ikonları 90° dönük görünüyor.
//
// Çözüm: çubuğu GİZLE. Oyun tam ekran olur, yatık ikon sorunu kökten biter.
// Kenardan yukarı kaydırınca düğmeler geri gelir — kaybolmuyor, saklanıyor.
//
// NEDEN `setBehaviorAsync` YOK (2026-07-27, Baki uyarıyı bildirdi):
// Expo SDK 54'te Android'de "edge-to-edge" (arayüzün sistem çubuklarının altına da
// uzanması) her zaman açık ve o modda `setBehaviorAsync` DESTEKLENMİYOR — çağrılırsa
// hiçbir şey yapmadan konsola uyarı basıyor. `setVisibilityAsync` destekleniyor, işi o
// zaten görüyor. Çalışmayan bir çağrıyı uyarıyı susturmak için tutmanın anlamı yok.
// (expo-navigation-bar kaynağında doğrulandı: uyarı listesinde setBehaviorAsync var,
// setVisibilityAsync yok.)
//
// GERİ ALMAK İÇİN: aşağıdaki 'hidden' değerini 'visible' yap.
export async function gezinmeCubugunuGizle() {
  if (Platform.OS !== 'android') return { ok: false, sebep: 'yalnızca Android' };
  try {
    await NavigationBar.setVisibilityAsync('hidden');
    return { ok: true };
  } catch (e) {
    return { ok: false, sebep: String(e && e.message ? e.message : e) };
  }
}

// ---- TAM EKRAN: DURUM ÇUBUĞU + GEZİNME ÇUBUĞU ----
//
// Baki, iki kez bildirdi: *"HALA EKRANDA PİL SAAT KISMI ÜSTTEN KAYDIRDIĞIMIZ SEKME AÇIK
// AGA BUNU ÇÖZ!"*
//
// ---- İLK İKİ DENEME NEDEN TUTMADI ----
//
//   1. `<StatusBar hidden />` bileşeni — tek başına yetmedi.
//   2. Zorla `StatusBar.setHidden(true)` — o da yetmedi.
//
// Sebep API değil SIRA. `gezinmeCubugunuGizle()` bir SÖZ (async) döndürüyor ve içerideki
// `NavigationBar.setVisibilityAsync` sistem çubuğu denetleyicisini (WindowInsetsController)
// yeniden kuruyor. Durum çubuğunu ondan ÖNCE gizlersek, sonradan tamamlanan gezinme
// çağrısı denetleyiciyi tazeleyip durum çubuğunu geri getiriyor.
//
// ---- ÇÖZÜM: SIRALI VE TEKRARLI ----
//   • Önce gezinme çubuğu BEKLENEREK gizleniyor, sonra durum çubuğu.
//   • Ardından iki kez daha uygulanıyor (0.4 sn ve 1.5 sn). Sebep: bazı cihazlarda
//     yerleşim oturduktan sonra sistem çubuğu bir kez geri geliyor; tek atışlık bir
//     çağrı o yarışı kaybediyor.
//
// `setTranslucent` KALDIRILDI: edge-to-edge kipinde uygulama zaten çubukların altına
// uzanıyor, çağrı işe yaramıyor ve denetleyiciyi bir kez daha kurcalıyordu.
//
// ---- ⚠ EXPO GO'DA GİZLENMEYEBİLİR, VE BU BİR KOD HATASI DEĞİL ----
//
// Expo Go kendi Android etkinliğini (Activity) çalıştırıyor ve o etkinlik edge-to-edge
// kipinde açılıyor; uygulamanın gizleme isteği ana bilgisayarın ayarını her zaman
// yenemiyor. Gerçek derlemede çubukları uygulama kendisi yönetiyor ve gizleme tutuyor.
//
// ⚠ KENARDAN KENARA (edge-to-edge) ARTIK HER YERDE AÇIK. `app.json`'daki `edgeToEdgeEnabled:
// false` 2026-09-25'te kaldırıldı (DENETIM-2026-09-23 ⚠4): SDK 54 o alanı yalnızca `true` olarak
// tanıyor, Android 16 da kapatmaya izin vermiyor. Kalsaydı eski telefonlarda (Android 15 ve
// öncesi) oyun, Expo Go'da hiç denenmemiş bir yerleşimle açılırdı.
//
// BU YÜZDEN EKRANLAR GÜVENLİ ALANI OKUYOR (`useSafeAreaInsets`): çubuk gizlenirse
// insets sıfırlanır ve ekran kendiliğinden büyür, gizlenmezse hiçbir şey altında
// kalmaz. Tek yerleşim iki dünyada da doğru — "gizlemeye çalış, ama gizlenmemiş gibi
// yerleş" kuralı buradan geliyor.
export function durumCubugunuGizle() {
  try {
    RNStatusBar.setHidden(true, 'none');
    return { ok: true };
  } catch (e) {
    return { ok: false, sebep: String(e && e.message ? e.message : e) };
  }
}

// Uygulama açılışında ve HER ÖNE GELİŞTE çağrılıyor (App.js) — çubuklar bildirim
// çekmecesi açılıp kapandığında ya da arka plandan dönüldüğünde geri geliyor.
export async function tamEkranaGec() {
  await gezinmeCubugunuGizle();
  durumCubugunuGizle();
  // Yerleşim oturduktan sonraki iki tazeleme. Zamanlayıcılar döndürülüyor ki çağıran
  // bileşen sökülürken iptal edebilsin — sökülmüş ekrana dokunan bir çağrı kalmasın.
  return [setTimeout(durumCubugunuGizle, 400), setTimeout(durumCubugunuGizle, 1500)];
}
