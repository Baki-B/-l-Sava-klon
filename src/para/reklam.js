// REKLAM VE ÖDÜL KATMANI — KURULU AMA KAPALI (2026-08-12, Baki: "koda hazır ama kapalı kur").
//
// ---- ⚠ BUGÜN HİÇBİR ŞEY YAPMIYOR ----
//
// `REKLAM_HAZIR = false` olduğu sürece: hiçbir SDK kurulu değil, hiçbir ekranda düğme
// görünmüyor, hiçbir ağ isteği yok, hiçbir veri toplanmıyor. Bu dosya bir KAPALI ANAHTAR.
// Kalıp `sahne/ses.js`'in aynısı ve sebebi de aynı: ödül noktalarını sonradan aramak
// yerine BUGÜN adlandırmak, açılış gününde ekranların yeniden yazılmasını önlüyor.
//
// ---- ⚠ KIRMIZI ÇİZGİ DEĞİŞTİ (Baki, 2026-09-17 · Görev 19) ----
//
// ESKİ ÇİZGİ: *"Reklamın ödülü asla oyun içi güç olmamalı."* Ödüller ona göre seçilmişti
// (savaş tekrarı, tur analizi, gösteri hızlandırma) ve Baki bunları OYUNCU GÖZÜYLE
// reddetti: *"reklam izlemeye değecek şeyler değil gibi geldi."*
//
// YENİ ÇİZGİ: **ÜSTÜNLÜK satılmaz, İKİNCİ ŞANS satılır.** Ödül hata yapan oyuncuya
// hatasını düzeltme imkânı verir; kalıcı güç, kalıcı bonus vermez. Dört ödül ve üç koruma
// artık `src/para/odul.js`'te (tek oyunculu · maç başına sınır · meydan okuma/dereceli
// kapalı). ÖDÜLLERİN TEK LİSTESİ ORASI. Eski liste (savaş tekrarı, tur analizi, harita teması,
// gösteriyi hızlandır) burada ikinci bir liste olarak duruyordu ve 2026-09-25'te silindi
// (CLAUDE.md §5/5; DENETIM-2026-09-23 ⚠8). O ödüllerin üçü ücretsiz oyuna girecek (Baki).
//
// > **"Para zamandan tasarruf ettirebilir, güçten değil."** — bu cümle ÜRÜN tarafında
// > (Komutan Paketi, kozmetikler) hâlâ geçerli; değişen yalnızca REKLAM ÖDÜLÜ.
//
// Bu çizgi bir tercih değil, oyunun kimliği. Aşağıdaki ödül listesi ona göre yazıldı ve
// yeni bir ödül eklenecekse aynı sınavdan geçmeli: **bu ödül, aynı maçta rakibime karşı
// bana avantaj sağlıyor mu?** Cevap "evet" ise listeye giremez.
//
// ⚠ EN SİNSİ TUZAK: İSTİHBARAT DA GÜÇTÜR. "Reklam izle, düşmanın ordusunu gör" masum
// görünüyor ama strateji oyununda bilgi doğrudan güce çevriliyor. Baki 2026-09-17'de bunu
// BİLEREK ve SINIRLI açtı: `casusRaporu` tek rakibi gösteriyor, maç başına sınıra takılıyor ve
// yalnızca botlara karşı tek oyunculuda var (`odul.js`, `DENGE.ODUL`). Meydan okuma, dereceli
// ve çok oyunculuda KAPALI kalmak zorunda — orada bilgi, rakibe karşı satın alınmış üstünlük
// olur. "Bir tur daha düşün" ise hiçbir modda giremez.
//
// ⚠ KAYIT/YÜKLEME ASLA BURAYA GİREMEZ (§8.1, §12.3). Uzun maç tek oturumda bitmiyor;
// kaydı reklama bağlamak oyunu oynanamaz yapar. Bu, 2026-07-23'te bir kez karara bağlandı.

// ---- ÖDÜL NOKTALARI → `src/para/odul.js ODULLER` ----
// (Buradaki eski liste 2026-09-25'te silindi; yukarıdaki nota bak.)
import { ODULLER } from './odul.js';

// ---- ⛔ AÇIKÇA YASAKLANANLAR ----
// Liste burada duruyor ki bir gün biri "şunu da ekleyelim" dediğinde cevap yazılı olsun.
// Hepsi kırmızı çizgiyi geçiyor; gerekçeleri yanlarında.
export const YASAK_ODULLER = {
  ekstraOrdu: "Doğrudan güç. P2W'nin reklam sürümü.",
  savasBonusu: 'Doğrudan güç.',
  // (`dusmanIstihbarati` 2026-09-25'te çıktı: `casusRaporu` onun sınırlı, bilinçli hâli —
  // yukarıdaki "sinsi tuzak" notu. Sınırsız ya da çok oyunculu istihbarat hâlâ yasak.)
  surekliIstihbarat: 'Bütün rakipleri her tur göstermek — bilgi güçtür, sınırsızı üstünlüktür.',
  ekTurDusunme: 'Zaman değil, karar avantajı.',
  kayitYuvasi: 'Kayıt çekirdek özellik (§8.1) — hiçbir koşulda kapatılamaz.',
};

// ---- ANAHTAR ----
//
// false: katman tamamen kapalı. Ekranlar bunu okuyup düğmeyi HİÇ çizmiyor — "yakında"
// bile yazmıyor. Verilmeyecek bir söz, çalışmayan düğmeden kötüdür (2026-08-12'de ses
// satırı tam bu yüzden kaldırıldı).
export const REKLAM_HAZIR = false;

// Bir ödül şu an reklamla alınabilir mi? Katman kapalıyken her zaman false — çağıran
// yerlerin ayrıca bayrak kontrol etmesi gerekmesin. Ödülün kendi kuralları (mod, sınır,
// yenilgi) `odul.js odulKullanilabilirMi`'de; bu yalnızca "reklam katmanı açık mı".
export function odulAlinabilir(anahtar) {
  return REKLAM_HAZIR && !!ODULLER[anahtar];
}

// ---- AÇILIŞ GÜNÜ NE YAPILACAK ----
//
// 1. `npx expo install react-native-google-mobile-ads` — SDK yerel kod içeriyor, yani
//    Expo Go ile test bitiyor; development build almak gerekiyor (`YAYIN-KONTROL.md` §7).
// 2. `app.json`'a AdMob uygulama kimliği eklenir.
// 3. `REKLAM_HAZIR = true` yapılır ve aşağıdaki iki fonksiyon doldurulur.
// 4. Gizlilik politikası ve Play "Veri Güvenliği" formu YENİDEN yazılır — oyun artık
//    veri toplayan bir uygulama olur (AdMob cihaz tanımlayıcısı kullanıyor).
//
// İkisi de bugün boş ve bilerek: çağrı yerleri bugünden yazılabilsin, açılış günü
// yalnızca bu dosya değişsin.

// Ödüllü reklamı gösterir. Dönen: ödül hak edildi mi.
// eslint-disable-next-line no-unused-vars
export async function odulluReklamGoster(anahtar) {
  // Açılışta: SDK'nın ödüllü reklamını yükle, göster, tamamlanınca true döndür.
  // Reklam yüklenemezse ya da kullanıcı yarıda kapatırsa FALSE dönmeli — ödül verilmez
  // ama oyun da hata vermez (kural: reklam bir süs, bir kanal değil).
  return false;
}

// Şerit/geçiş reklamı. Ayrı tutuluyor çünkü ödüllü reklamdan farklı bir sözleşmesi var:
// oyuncu bir şey KAZANMIYOR, sadece görüyor. Yerleştirmesi de ayrı düşünülmeli —
// oyunun ortasında değil, doğal duraklarda (maç sonu ekranı gibi).
export function reklamGoster() {}
