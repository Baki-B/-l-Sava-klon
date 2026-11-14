// SAHNE OYNATICI — olay listesini zamana yayar (Görev 08 / Adım 3–6).
//
// ┌─ NE YAPAR, NE YAPMAZ ───────────────────────────────────────────────────────────────┐
// │ YAPAR : `olaylar.js`'in ürettiği sıralı listeyi sırayla işler, her olayda titreşim   │
// │         verir, efekt açar, kamerayı kaydırır, kart gösterir.                          │
// │ YAPMAZ: OYUN DURUMUNA DOKUNMAZ. Buradan `setOyun` çağrısı YOKTUR ve olmayacak —      │
// │         görev belgesi §10/7'nin "en tehlikeli hata" dediği şey tam olarak budur.     │
// │         Gösteri başladığında durum çoktan kesinleşmiştir; burası yalnızca okur.      │
// └──────────────────────────────────────────────────────────────────────────────────────┘
//
// ---- ATLAMA BEDELSİZ ----
// Ekrana dokunmak bütün zamanlayıcıları iptal eder ve gösteri biter. Hiçbir şey kaybolmaz,
// çünkü kaybolacak bir şey yok: sonuç zaten kesin. §4.4'ün dört korumasından birincisi.
//
// ---- ZAMANLAYICI DEFTERİ ----
// Açılan HER zamanlayıcı `zamanlar` defterine yazılıyor ve tek bir yerden süpürülüyor.
// Sebebi somut: tur biterken oyuncu ekranı kapatırsa ya da yeni tur başlarsa, arkada kalan
// bir zamanlayıcı çoktan geçmiş bir turun efektini açar. React'in "unmounted component"
// uyarısından beter olan şey, oyuncunun ekranında sebepsiz titreyen bir rozet.

import { useState, useRef, useEffect, useCallback } from 'react';
import { DENGE } from '../denge';
import { olaylariCikar, oynatimPlani } from '../oyun/olaylar';
import { olayTitresimi } from './titresim';
import { sesCal } from './ses';

const BOS = { oynuyor: false, efektler: [], kamera: null, kart: null, serit: null };

// Efektin ekranda kalma süresi, olayın süresinden UZUN: olay bitince sıradakine geçiliyor
// ama sönme animasyonu devam etmeli. Yoksa her efekt bir sonraki olay başlarken aniden
// kesilir ve gösteri kesik kesik görünür.
const EFEKT_KUYRUGU = 320;

export function useSahne({ rapor, oyuncuAktorId, gosterim, titresim, ses, onBitti }) {
  const [durum, setDurum] = useState(BOS);
  const zamanlar = useRef([]);
  const sayac = useRef(0);
  // `onBitti` her çizimde yeni bir fonksiyon olabilir; bağımlılığa koyup gösteriyi
  // baştan başlatmamak için ref'te tutuluyor.
  //
  // Ses ve titreşim ayarları da ref'te: gösteri ORTASINDA ayar değişirse gösteri baştan
  // başlamamalı, yalnızca bundan sonraki olaylar sessizleşmeli. Doğrudan okunsalardı
  // bağımlılık listesine girmeleri gerekirdi ve her ayar değişikliği turu yeniden oynatırdı.
  //
  // Atama ÇİZİM SIRASINDA DEĞİL, etkide yapılıyor (React'in ref kuralı). İkisi de yalnızca
  // zamanlayıcı içinden, yani çizimden çok sonra okunuyor — gecikme sorun değil.
  const bittiRef = useRef(onBitti);
  const ayarRef = useRef({ titresim, ses });
  useEffect(() => {
    bittiRef.current = onBitti;
    ayarRef.current = { titresim, ses };
  }, [onBitti, titresim, ses]);

  const temizle = useCallback(() => {
    for (const t of zamanlar.current) clearTimeout(t);
    zamanlar.current = [];
  }, []);

  const atla = useCallback(() => {
    temizle();
    setDurum(BOS);
    if (bittiRef.current) bittiRef.current();
  }, [temizle]);

  useEffect(() => {
    temizle();

    const zamanla = (fn, ms) => {
      const t = setTimeout(fn, ms);
      zamanlar.current.push(t);
    };

    const plan = rapor
      ? oynatimPlani(olaylariCikar(rapor, { oyuncuAktorId, kapsam: gosterim }))
      : [];

    // Efekt aç, süresi dolunca kendiliğinden kapansın.
    const efektAc = (efekt, sure) => {
      const id = ++sayac.current;
      setDurum((d) => ({ ...d, efektler: d.efektler.concat([{ ...efekt, id }]) }));
      zamanla(
        () => setDurum((d) => ({ ...d, efektler: d.efektler.filter((e) => e.id !== id) })),
        sure + EFEKT_KUYRUGU
      );
    };

    const isle = (olay) => {
      // Duyusal kanallar önce: görsel efektin bir kare gecikmesi olabilir, titreşim
      // olayın tam anında hissedilmeli.
      olayTitresimi(olay, ayarRef.current.titresim);
      sesCal(olay, ayarRef.current.ses);

      switch (olay.tip) {
        case 'kamera':
          // Kamera bir efekt değil, BAKIŞ. `no` her seferinde artıyor ki aynı parçaya
          // ikinci kez kayma istendiğinde harita bunu yeni bir istek olarak görsün.
          setDurum((d) => ({ ...d, kamera: { parca: olay.parca, no: ++sayac.current } }));
          break;

        case 'yurus':
        case 'takviye':
          efektAc(
            { tip: 'ok', kaynak: olay.kaynak, hedef: olay.hedef, saldiri: !!olay.saldiri },
            olay.sure
          );
          break;

        case 'savas':
          // Şerit YALNIZCA önemli savaşta açılır (§6/3). Önemsizde de savaş oynar —
          // sarsıntı ve uçuşan sayı çıkar, yalnızca birlik şeridi açılmaz.
          setDurum((d) => ({
            ...d,
            serit: olay.onemli
              ? {
                  parca: olay.parca,
                  saldiran: olay.saldiran,
                  savunan: olay.savunan,
                  saldiranId: olay.saldiranId,
                  savunanId: olay.savunanId,
                  arazi: olay.arazi,
                  raunt: 0,
                  saldiranKalan: null,
                  savunanKalan: null,
                }
              : null,
          }));
          break;

        case 'vurus':
          setDurum((d) => ({
            ...d,
            serit:
              d.serit && d.serit.parca === olay.parca
                ? {
                    ...d.serit,
                    raunt: olay.raunt,
                    saldiranKalan: olay.saldiranKalan,
                    savunanKalan: olay.savunanKalan,
                  }
                : d.serit,
          }));
          efektAc({ tip: 'sarsinti', parca: olay.parca, siddet: 1 }, olay.sure);
          // Uçuşan sayı YALNIZCA kayıp varsa. Kayıpsız raunda "−0" yazmak, olmayan bir
          // şeyi göstermek olurdu (§4.1/7: kayıp acıtmalı, gürültü yapmamalı).
          if (olay.savunanKayip > 0)
            efektAc({ tip: 'ucanSayi', parca: olay.parca, deger: -olay.savunanKayip }, olay.sure);
          if (olay.saldiranKayip > 0)
            efektAc(
              { tip: 'ucanSayi', parca: olay.parca, deger: -olay.saldiranKayip, ikinci: true },
              olay.sure
            );
          break;

        case 'bozgun':
          efektAc({ tip: 'sarsinti', parca: olay.parca, siddet: 2 }, olay.sure);
          break;

        case 'imha':
          efektAc({ tip: 'dagilma', parca: olay.parca }, olay.sure);
          break;

        case 'cekilme':
          efektAc({ tip: 'ok', kaynak: olay.parca, hedef: olay.hedef, cekilme: true }, olay.sure);
          break;

        case 'fetih':
          // Renk darbesi. Şerit de burada kapanıyor: savaş bitti, parça el değiştirdi.
          efektAc({ tip: 'darbe', parca: olay.parca, sahip: olay.yeni }, olay.sure);
          setDurum((d) => ({
            ...d,
            serit: d.serit && d.serit.parca === olay.parca ? null : d.serit,
          }));
          break;

        case 'turAcilisi':
        case 'ilTamamlandi':
        case 'ilKaybedildi':
        case 'bolgeAlindi':
        case 'bolgeKaybedildi':
        case 'duello': {
          // Kart kapanışı KARTIN KİMLİĞİNE bakıyor, türüne değil: aynı turda iki il kartı
          // arka arkaya gelirse, birincisinin kapanma zamanlayıcısı ikincisini silerdi.
          const no = ++sayac.current;
          setDurum((d) => ({ ...d, kart: { ...olay, no } }));
          zamanla(
            () => setDurum((d) => (d.kart && d.kart.no === no ? { ...d, kart: null } : d)),
            olay.sure
          );
          break;
        }

        default:
          break;
      }
    };

    let i = 0;
    const adim = () => {
      if (i >= plan.length) {
        // ---- SON NEFES PAYI (2026-08-01, Baki: "bir bakıyorum sonuç ekranı geliyor") ----
        // Son olay bitip rapor perdesi ANINDA açılıyordu. Son fetih ekranda otururken
        // üstüne metin binmesi, gösteriyi hiç izlememekle aynı şey. Efektler önce sönsün,
        // sonra rapor gelsin.
        setDurum(BOS);
        zamanla(() => {
          if (bittiRef.current) bittiRef.current();
        }, DENGE.SAHNE.SON_BEKLEME);
        return;
      }
      const olay = plan[i++];
      isle(olay);
      zamanla(adim, Math.max(1, olay.sure));
    };

    // BAŞLANGIÇ DA ZAMANLAYICIDAN GEÇİYOR. Etkinin gövdesinde doğrudan `setDurum` çağırmak
    // React'in "cascading render" uyarısına giriyor; sıfır gecikmeli zamanlayıcı hem o
    // uyarıyı kapatıyor hem de tur perdesinin kapanmasıyla gösterinin başlamasını aynı
    // kareye sıkıştırmıyor.
    zamanla(() => {
      if (plan.length === 0) {
        setDurum(BOS);
        if (rapor && bittiRef.current) bittiRef.current();
        return;
      }
      setDurum({ ...BOS, oynuyor: true });
      adim();
    }, 0);

    return temizle;
    // `ses` ve `titresim` bilerek bağımlılık DEĞİL (yukarıdaki `ayarRef` notuna bak):
    // ikisi de ref üzerinden okunuyor, o yüzden kural zaten şikâyet etmiyor.
  }, [rapor, oyuncuAktorId, gosterim, temizle]);

  return { ...durum, atla };
}
