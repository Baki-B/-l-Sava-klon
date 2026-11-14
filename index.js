import 'react-native-gesture-handler';
import React from 'react';
import { registerRootComponent } from 'expo';

import App from './src/App';
import HataSiniri from './src/bilesenler/HataSiniri';

// ÇÖKME KORUMASI (Görev 12 / Adım 6): hata sınırı EN DIŞTA duruyor. İçeride bir yerde
// olsaydı yalnızca o dalı korurdu; App'in kendi kurulumunda (yazı tipi, yönlendirme,
// kayıt okuma) çıkan bir hata yine beyaz ekranla biterdi.
function Kok() {
  return (
    <HataSiniri>
      <App />
    </HataSiniri>
  );
}

// registerRootComponent, uygulamanin ana bileseni olarak Kok'u kaydeder.
// Uygulama ister Expo Go'da ister derlenmis surumde acilsin, dogru sekilde baslar.
registerRootComponent(Kok);
