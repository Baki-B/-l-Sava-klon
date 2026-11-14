// 81 ilin kanonik listesi — tasarim belgelerindeki (docs/) yazimla.
// Kod (iki haneli metin) -> { ad, bolge }
// Kaynak: docs/il-savasi-parca-bolumleme-v2.md bolge basliklari ve il basliklari.
// Bu dosya hem sinir verisi dogrulamasinda hem de veri/iller.json uretiminde kullanilir.

module.exports = {
  // MARMARA (11)
  '34': { ad: 'İstanbul', bolge: 'Marmara' },
  '16': { ad: 'Bursa', bolge: 'Marmara' },
  '10': { ad: 'Balıkesir', bolge: 'Marmara' },
  '41': { ad: 'Kocaeli', bolge: 'Marmara' },
  '59': { ad: 'Tekirdağ', bolge: 'Marmara' },
  '17': { ad: 'Çanakkale', bolge: 'Marmara' },
  '54': { ad: 'Sakarya', bolge: 'Marmara' },
  '22': { ad: 'Edirne', bolge: 'Marmara' },
  '39': { ad: 'Kırklareli', bolge: 'Marmara' },
  '11': { ad: 'Bilecik', bolge: 'Marmara' },
  '77': { ad: 'Yalova', bolge: 'Marmara' },

  // EGE (8)
  '35': { ad: 'İzmir', bolge: 'Ege' },
  '48': { ad: 'Muğla', bolge: 'Ege' },
  '45': { ad: 'Manisa', bolge: 'Ege' },
  '09': { ad: 'Aydın', bolge: 'Ege' },
  '20': { ad: 'Denizli', bolge: 'Ege' },
  '43': { ad: 'Kütahya', bolge: 'Ege' },
  '03': { ad: 'Afyonkarahisar', bolge: 'Ege' },
  '64': { ad: 'Uşak', bolge: 'Ege' },

  // AKDENİZ (8)
  '07': { ad: 'Antalya', bolge: 'Akdeniz' },
  '33': { ad: 'Mersin', bolge: 'Akdeniz' },
  '01': { ad: 'Adana', bolge: 'Akdeniz' },
  '31': { ad: 'Hatay', bolge: 'Akdeniz' },
  '46': { ad: 'Kahramanmaraş', bolge: 'Akdeniz' },
  '32': { ad: 'Isparta', bolge: 'Akdeniz' },
  '15': { ad: 'Burdur', bolge: 'Akdeniz' },
  '80': { ad: 'Osmaniye', bolge: 'Akdeniz' },

  // İÇ ANADOLU (13)
  '06': { ad: 'Ankara', bolge: 'İç Anadolu' },
  '42': { ad: 'Konya', bolge: 'İç Anadolu' },
  '58': { ad: 'Sivas', bolge: 'İç Anadolu' },
  '38': { ad: 'Kayseri', bolge: 'İç Anadolu' },
  '26': { ad: 'Eskişehir', bolge: 'İç Anadolu' },
  '66': { ad: 'Yozgat', bolge: 'İç Anadolu' },
  '18': { ad: 'Çankırı', bolge: 'İç Anadolu' },
  '70': { ad: 'Karaman', bolge: 'İç Anadolu' },
  '51': { ad: 'Niğde', bolge: 'İç Anadolu' },
  '68': { ad: 'Aksaray', bolge: 'İç Anadolu' },
  '50': { ad: 'Nevşehir', bolge: 'İç Anadolu' },
  '40': { ad: 'Kırşehir', bolge: 'İç Anadolu' },
  '71': { ad: 'Kırıkkale', bolge: 'İç Anadolu' },

  // KARADENİZ (18)
  '52': { ad: 'Ordu', bolge: 'Karadeniz' },
  '55': { ad: 'Samsun', bolge: 'Karadeniz' },
  '37': { ad: 'Kastamonu', bolge: 'Karadeniz' },
  '60': { ad: 'Tokat', bolge: 'Karadeniz' },
  '67': { ad: 'Zonguldak', bolge: 'Karadeniz' },
  '28': { ad: 'Giresun', bolge: 'Karadeniz' },
  '61': { ad: 'Trabzon', bolge: 'Karadeniz' },
  '53': { ad: 'Rize', bolge: 'Karadeniz' },
  '08': { ad: 'Artvin', bolge: 'Karadeniz' },
  '57': { ad: 'Sinop', bolge: 'Karadeniz' },
  '05': { ad: 'Amasya', bolge: 'Karadeniz' },
  '14': { ad: 'Bolu', bolge: 'Karadeniz' },
  '19': { ad: 'Çorum', bolge: 'Karadeniz' },
  '78': { ad: 'Karabük', bolge: 'Karadeniz' },
  '74': { ad: 'Bartın', bolge: 'Karadeniz' },
  '81': { ad: 'Düzce', bolge: 'Karadeniz' },
  '29': { ad: 'Gümüşhane', bolge: 'Karadeniz' },
  '69': { ad: 'Bayburt', bolge: 'Karadeniz' },

  // DOĞU ANADOLU (14)
  '25': { ad: 'Erzurum', bolge: 'Doğu Anadolu' },
  '65': { ad: 'Van', bolge: 'Doğu Anadolu' },
  '04': { ad: 'Ağrı', bolge: 'Doğu Anadolu' },
  '24': { ad: 'Erzincan', bolge: 'Doğu Anadolu' },
  '36': { ad: 'Kars', bolge: 'Doğu Anadolu' },
  '44': { ad: 'Malatya', bolge: 'Doğu Anadolu' },
  '49': { ad: 'Muş', bolge: 'Doğu Anadolu' },
  '13': { ad: 'Bitlis', bolge: 'Doğu Anadolu' },
  '23': { ad: 'Elazığ', bolge: 'Doğu Anadolu' },
  '30': { ad: 'Hakkari', bolge: 'Doğu Anadolu' },
  '12': { ad: 'Bingöl', bolge: 'Doğu Anadolu' },
  '62': { ad: 'Tunceli', bolge: 'Doğu Anadolu' },
  '75': { ad: 'Ardahan', bolge: 'Doğu Anadolu' },
  '76': { ad: 'Iğdır', bolge: 'Doğu Anadolu' },

  // GÜNEYDOĞU ANADOLU (9)
  '21': { ad: 'Diyarbakır', bolge: 'Güneydoğu Anadolu' },
  '63': { ad: 'Şanlıurfa', bolge: 'Güneydoğu Anadolu' },
  '47': { ad: 'Mardin', bolge: 'Güneydoğu Anadolu' },
  '27': { ad: 'Gaziantep', bolge: 'Güneydoğu Anadolu' },
  '73': { ad: 'Şırnak', bolge: 'Güneydoğu Anadolu' },
  '02': { ad: 'Adıyaman', bolge: 'Güneydoğu Anadolu' },
  '72': { ad: 'Batman', bolge: 'Güneydoğu Anadolu' },
  '56': { ad: 'Siirt', bolge: 'Güneydoğu Anadolu' },
  '79': { ad: 'Kilis', bolge: 'Güneydoğu Anadolu' },
};
