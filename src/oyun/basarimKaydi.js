// MÜHÜR KAYDI — KAZANILAN BAŞARIMLARIN KALICI SAKLAMASI (Görev 12 / Adım 11).
//
// `ayarlar.js`'in kalıbının aynısı: AsyncStorage, ayrı anahtar, hata yutuluyor.
//
// ---- NEDEN MAÇ KAYDINDA DEĞİL ----
// Mühür OYUNCUYA ait, maça değil. Maç kaydında dursaydı: (a) maç silinince mühürler de
// giderdi, (b) üç yuvada üç ayrı mühür listesi olurdu, (c) kayıt sürümü her yeni mühürde
// artardı. Ayarların kayıttan ayrı tutulma gerekçesinin aynısı.
//
// ---- BİÇİM ----
//   { "tamFetih": 1723456789, ... }   → mühür kimliği : kazanıldığı an (ms)
// Zaman damgası "yeni kazanıldı" bildirimi ve ileride sıralama için; kimlik anahtarın
// kendisi olduğu için ayrıca yazılmıyor (Görev 09'un aktör inceltmesinin kalıbı).

import AsyncStorage from '@react-native-async-storage/async-storage';

const ANAHTAR = 'ilsavasi.muhurler';

export async function muhurleriOku() {
  try {
    const metin = await AsyncStorage.getItem(ANAHTAR);
    const veri = metin ? JSON.parse(metin) : null;
    return veri && typeof veri === 'object' ? veri : {};
  } catch (e) {
    // Mühür listesi okunamazsa oyun durmaz — boş liste, oyuncu yeniden kazanır.
    return {};
  }
}

// Yeni kazanılanları ekler ve EKLENENLERİ döner. Zaten kazanılmış mühür yeniden
// yazılmıyor: zaman damgası "ilk ne zaman kazandın" olarak kalmalı.
export async function muhurleriEkle(kimlikler) {
  try {
    const mevcut = await muhurleriOku();
    const yeni = [];
    const simdi = Date.now();
    for (const id of kimlikler || []) {
      if (mevcut[id]) continue;
      mevcut[id] = simdi;
      yeni.push(id);
    }
    if (yeni.length > 0) await AsyncStorage.setItem(ANAHTAR, JSON.stringify(mevcut));
    return yeni;
  } catch (e) {
    return [];
  }
}

// Geliştirici aracı ve "ilerlemeyi sıfırla" için.
export async function muhurleriSil() {
  try {
    await AsyncStorage.removeItem(ANAHTAR);
  } catch (e) {
    // yut
  }
}
