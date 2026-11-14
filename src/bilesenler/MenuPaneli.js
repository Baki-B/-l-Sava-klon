// MENÜ PANELİ — haritanın üstünde duran lacivert yüzey (Görev 10A / Adım 4).
//
// Kesinleşen tasarım: `docs/GOREV-10A-ANA-MENU-KARARI.md` §4.
// Ana menünün büyük paneli de, mod ekranının üç kartı da bu bileşen.
//
// ---- İKİ EKRAN, TEK BİLEŞEN ----
// Karar belgesi ikisini de aynı dille tarif ediyor: yuvarlatılmış lacivert yüzey +
// dört köşede L şeklinde parantez. Aralarındaki tek fark ölçü ve koyuluk. İki yere iki
// kez yazılsaydı biri değişince öteki eskirdi (CLAUDE.md §5).
//
// ---- OPAKLIK NİYE KAPSAYICIYA VERİLMİYOR ----
// Panel %90 opak ama İÇİNDEKİ YAZI tam opak. React Native'de bir View'un `opacity`si
// çocuklarına da işler; kapsayıcıya verilseydi başlık da soluklaşırdı. Bu yüzden zemin
// AYRI bir mutlak katman: saydamlık onda kalıyor, içerik onun üstünde tam parlaklıkta.
//
// ---- KÖŞE PARANTEZİ NİYE SVG DEĞİL ----
// L şekli iki kenarlıklı bir kutudan ibaret: sol + üst kenarlığı olan 18×18'lik bir View
// tam olarak o L'i çiziyor. Bunun için SVG açmak, ölçek hesabı ve dört ayrı yol demekti.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MENU_RENK } from '../tema';

// ---- ÖLÇÜLER (önizlemeden, karar belgesi §4) ----
// Parantez kenardan 7 birim içeride ve kolları 18 birim. Panel büyüdükçe bu ölçüler
// büyümüyor: parantez bir çerçeve değil bir İŞARET — dört köşeyi gösteriyor, o kadar.
const PARANTEZ = { pay: 7, kol: 18, kalinlik: 1.6, opaklik: 0.8 };
const KOSE_YARICAPI = 10;
const PANEL_OPAKLIK = 0.9;

// Dört köşenin her biri: nereye oturacak + hangi iki kenarlık çizilecek.
// Yalnızca o iki kenarlığa kalınlık veriliyor — böylece kutu değil L çıkıyor.
const KOSELER = [
  { ad: 'solUst', yer: { top: 0, left: 0 }, kenarlar: ['borderLeftWidth', 'borderTopWidth'] },
  { ad: 'sagUst', yer: { top: 0, right: 0 }, kenarlar: ['borderRightWidth', 'borderTopWidth'] },
  { ad: 'solAlt', yer: { bottom: 0, left: 0 }, kenarlar: ['borderLeftWidth', 'borderBottomWidth'] },
  {
    ad: 'sagAlt',
    yer: { bottom: 0, right: 0 },
    kenarlar: ['borderRightWidth', 'borderBottomWidth'],
  },
];

export default function MenuPaneli({
  stil,
  cocuklar,
  dolgu = MENU_RENK.panel,
  opaklik = PANEL_OPAKLIK,
  parantezOpakligi = PARANTEZ.opaklik,
  // Mod kartlarının parantezi ana panelinkinden küçük (kol 13'e 18) ve seçili kart
  // parantezi tam parlak beyaz. Ölçü/renk bu yüzden dışarıdan verilebiliyor;
  // verilmezse ana menü panelinin değerleri geçerli.
  parantezOlcu = PARANTEZ,
  parantezRenk = MENU_RENK.yaziSolu,
  // Mod ekranının SEÇİLİ kartı ayrıca ince bir hat taşıyor (karar belgesi §Seçili kart).
  // Ana menü panelinde yok, o yüzden varsayılan kapalı.
  hat = false,
}) {
  return (
    <View style={stil}>
      {/* ZEMİN — saydamlık burada kalıyor, içerik etkilenmiyor (yukarıdaki nota bak). */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: dolgu, opacity: opaklik, borderRadius: KOSE_YARICAPI },
        ]}
      />
      {hat ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            s.hat,
            { borderRadius: KOSE_YARICAPI - 0.5, margin: 0.75 },
          ]}
        />
      ) : null}

      {KOSELER.map((k) => (
        <View
          key={k.ad}
          pointerEvents="none"
          style={[
            s.parantez,
            k.yer,
            {
              margin: parantezOlcu.pay,
              width: parantezOlcu.kol,
              height: parantezOlcu.kol,
              borderColor: parantezRenk,
              opacity: parantezOpakligi,
              [k.kenarlar[0]]: parantezOlcu.kalinlik,
              [k.kenarlar[1]]: parantezOlcu.kalinlik,
            },
          ]}
        />
      ))}

      {cocuklar}
    </View>
  );
}

const s = StyleSheet.create({
  parantez: { position: 'absolute' },
  hat: { borderWidth: 1.4, borderColor: MENU_RENK.yazi, opacity: 0.7 },
});
