// EKRAN ÖLÇÜSÜ — "telefon mu, tablet mi" kararı TEK yerden verilir.
//
// Neden: telefonda arayüz kutuları haritayı boğuyordu. Aynı arayüz tablette rahat sığıyor.
// Bu yüzden bileşenler kendi içinde ekran boyutu tahmini yapmaz, buradan sorar.
//
// Ölçüt KISA KENAR: telefon yatay tutulduğunda genişliği bir tablet kadar olabilir,
// ama kısa kenarı hep küçüktür. Böylece karar ekran döndürülünce değişmez.
// 600 dp, Android'in kendi "küçük ekran / geniş ekran" sınırıdır.
//
// GÖREV 04'TE DOĞRULANDI: oyun yatay tutuşa kilitlendi (src/yonlendirme.js) ama bu ölçüt
// aynen geçerli — kısa kenar tam bu yüzden seçilmişti. Değişen tek şey, yatayda kısa
// kenarın artık YÜKSEKLİK olması: arayüz kutuları dikeyde cimri, yatayda cömert olmalı.

import { useWindowDimensions } from 'react-native';

export const TELEFON_SINIRI = 600;

export function useOlcek() {
  const { width, height } = useWindowDimensions();
  const kisaKenar = Math.min(width, height);
  return {
    telefon: kisaKenar < TELEFON_SINIRI,
    kisaKenar,
    // Yatay tutuş kilidi sonrası pratikte hep true; yine de ölçülür (kilit tutmazsa,
    // web'de veya bölünmüş ekranda gerçeği söylesin).
    yatay: width > height,
  };
}

// NOT: burada bir `sec(telefon, a, b)` yardımcısı vardı; hiçbir yerde kullanılmadı
// (bileşenler ayrı stil setleri veya doğrudan `telefon ? a : b` kullanıyor) ve
// 2026-07-27 temizliğinde silindi.
