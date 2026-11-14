// DİPLOMASİ HARİTASI — diplomasi ekranının solundaki küçük Türkiye (Görev 20).
//
// Baki (2026-09-23), kartları görünce: *"hangi il neye göre gözüküyor orada?"* Liste
// `oyun/diplomasi.js tanidiklar`'dan geliyor: sınırına değen, savaştığın/anlaştığın,
// toprağının olduğu bölgede duran ve uzakta büyüyen devletler. Kartlarda bunun hiçbir izi
// yoktu (eski ekranda "NASIL TANIDIN" satırıydı — cümleydi, kalktı).
//
// Cevap cümle değil HARİTA (CLAUDE.md §5/10): listedeki devletler kendi renklerinde,
// listede olmayanlar sis. Bakınca görülüyor: çoğu sana değiyor, kalanı bölgende ya da
// uzakta büyük. Seçili devlet parlak çevreli, ötekiler sönük; senin toprağın pirinç
// çevreli. Haritada bir devlete dokunmak onun kartını seçer.
//
// ÇİZİM: menünün sadeleşmiş geometrisi (`menu-geometri.json`, 200 KB) — mod ekranının mini
// haritalarıyla aynı kaynak. Dolgu RENK BAŞINA TEK YOL (ModSecimi'nin kalıbı): 181 parça
// yerine en çok ~30 yol. Sınırlar `koyuKenarYolu` ile yalnızca iki yakası farklı olan
// kenarlardan.
import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { DIPLOMASI_HARITA } from '../tema';
import { koyuKenarYolu } from './MenuHaritasi';
import { dokunmaGeometrisi, parcaBul } from '../haritaDonusum';
import menuGeo from '../../veri/menu-geometri.json';
import hatVerisi from '../../veri/turkiye-hat.json';

const META = menuGeo.meta;
const YOLLAR = menuGeo.parcalar;
const PARCA_IDLER = Object.keys(YOLLAR).sort();

// Ekran pikseli cinsinden kalınlıklar (grup ölçeklendiği için çizimde ölçeğe bölünüyor).
const KALINLIK = { sinir: 0.7, kiyi: 0.9, secili: 1.8, ben: 1.5 };
// `sonuk`: bir devlet seçiliyken ötekilerin opaklığı. 0.32 denendi: renk sisin üstünde
// kararıp sise karıştı, "listede mi değil mi" okunmaz oldu. Seçileni asıl parlak çevre
// ayırıyor; sönüklük yalnızca yardımcı.
const OPAKLIK = { sinir: 0.55, kiyi: 0.8, sonuk: 0.6 };
// Sisin içinde sınır çizilmez: listede olmayanların hepsi tek bir "bilinmeyen" toprak.
const SIS = '~sis';

// Dokunma testi sadeleşmiş geometriyle: mini haritada yarım birimlik sapma görünmez.
// İlk dokunuşta bir kez hazırlanıyor — ekran hiç açılmazsa hiç hazırlanmıyor.
let dokunma = null;
function dokunmaAl() {
  if (!dokunma) {
    const parcalar = {};
    for (const pid of PARCA_IDLER) parcalar[pid] = { yol: YOLLAR[pid] };
    dokunma = dokunmaGeometrisi(parcalar);
  }
  return dokunma;
}

// Aynı çizgiyi iki yakası "içeride / dışarıda" olan kenarlardan kur: seçili devletin ve
// senin toprağının çevresi. Kıyı tarafı ülke hattının kendisiyle zaten çiziliyor.
function cevreYolu(sahiplik, id) {
  if (!id) return '';
  const icerde = {};
  for (const pid of PARCA_IDLER) icerde[pid] = sahiplik[pid] === id ? 1 : 0;
  return koyuKenarYolu(icerde);
}

function DiplomasiHaritasi({
  genislik,
  sahiplik,
  aktorRenk,
  benimId,
  gorunenler,
  seciliId,
  onSec,
}) {
  const olcek = genislik / META.genislik;
  const yukseklik = META.yukseklik * olcek;

  // Renk başına tek yol; seçim varken ötekiler sönük (ayrı grup, aynı renk başka opaklık).
  const gruplar = useMemo(() => {
    const g = new Map();
    for (const pid of PARCA_IDLER) {
      const sahip = sahiplik[pid];
      if (!sahip) continue; // senaryonun dışı: yalnızca kara görünür
      let renk = DIPLOMASI_HARITA.sis;
      let opak = 1;
      if (sahip === benimId || gorunenler.has(sahip)) {
        renk = aktorRenk[sahip] || DIPLOMASI_HARITA.sis;
        if (seciliId && sahip !== seciliId && sahip !== benimId) opak = OPAKLIK.sonuk;
      }
      const anahtar = renk + '|' + opak;
      const grup = g.get(anahtar);
      if (grup) grup.d += YOLLAR[pid];
      else g.set(anahtar, { anahtar, renk, opak, d: YOLLAR[pid] });
    }
    return [...g.values()];
  }, [sahiplik, aktorRenk, benimId, gorunenler, seciliId]);

  const sinirlar = useMemo(() => {
    const gorunen = {};
    for (const pid of PARCA_IDLER) {
      const sahip = sahiplik[pid];
      gorunen[pid] = sahip && (sahip === benimId || gorunenler.has(sahip)) ? sahip : SIS;
    }
    return koyuKenarYolu(gorunen);
  }, [sahiplik, benimId, gorunenler]);
  const benimCevrem = useMemo(() => cevreYolu(sahiplik, benimId), [sahiplik, benimId]);
  const seciliCevre = useMemo(() => cevreYolu(sahiplik, seciliId), [sahiplik, seciliId]);

  const e = (px) => px / olcek;

  const dokun = (olay) => {
    const { locationX, locationY } = olay.nativeEvent;
    const pid = parcaBul(dokunmaAl(), locationX / olcek, locationY / olcek);
    const sahip = pid ? sahiplik[pid] : null;
    onSec(sahip && gorunenler.has(sahip) ? sahip : null);
  };

  return (
    <Pressable onPress={dokun} style={{ width: genislik, height: yukseklik }}>
      <Svg width={genislik} height={yukseklik} pointerEvents="none">
        <G transform={'scale(' + olcek + ')'}>
          <Path d={hatVerisi.yol} fill={DIPLOMASI_HARITA.sis} />
          {gruplar.map((x) => (
            <Path key={x.anahtar} d={x.d} fill={x.renk} opacity={x.opak} />
          ))}
          <Path
            d={sinirlar}
            fill="none"
            stroke={DIPLOMASI_HARITA.sinir}
            strokeWidth={e(KALINLIK.sinir)}
            opacity={OPAKLIK.sinir}
          />
          <Path
            d={hatVerisi.yol}
            fill="none"
            stroke={DIPLOMASI_HARITA.kiyi}
            strokeWidth={e(KALINLIK.kiyi)}
            opacity={OPAKLIK.kiyi}
          />
          {benimCevrem ? (
            <Path
              d={benimCevrem}
              fill="none"
              stroke={DIPLOMASI_HARITA.ben}
              strokeWidth={e(KALINLIK.ben)}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {seciliCevre ? (
            <Path
              d={seciliCevre}
              fill="none"
              stroke={DIPLOMASI_HARITA.secili}
              strokeWidth={e(KALINLIK.secili)}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
        </G>
      </Svg>
    </Pressable>
  );
}

export default React.memo(DiplomasiHaritasi);
