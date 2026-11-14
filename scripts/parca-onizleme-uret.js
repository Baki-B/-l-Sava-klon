// PARÇA ÖNİZLEME (mobil oyun HUD'u) — veri/parcalar.json + veri/parca-komsuluk.json.
// Tam ekran harita + üstünde yüzen kontrol paneli (HOI4 tarzı, sağ altta).
// 3 mod: İller / Arazi / Bölge. Sınırlar: parça arası siyah, il arası (yumuşak) beyaz.
// Parçaya dokun -> bilgi + komşular; boşluğa dokun -> seçim kalkar. Parmakla zoom/kaydır.
// Çıktı: onizleme/parca.html (tam) + onizleme/parca-artifact.html (tablet/mobil).

const fs = require('fs');
const path = require('path');
const kanonik = require('./iller-kanonik');
const PROJ = path.join(__dirname, '..');

const ARAZI_RENK = { ova: '#cfe0a8', tepelik: '#d8b781', daglik: '#a9805f' };
const ARAZI_AD = { ova: 'Düzlük', tepelik: 'Tepelik', daglik: 'Dağlık' };
// Bölge renkleri — aynı hue'lar, doygunluk DÜŞÜRÜLDÜ (neon değil, savaş oyunu / mat tonlar).
const BOLGE_RENK = {
  'Marmara': '#7593b0', // mat çelik mavi
  'Ege': '#529a93', // mat turkuaz
  'Karadeniz': '#82a87e', // mat adaçayı yeşili
  'İç Anadolu': '#ccbf7a', // mat haki/altın
  'Akdeniz': '#d59860', // mat oker/turuncu
  'Güneydoğu Anadolu': '#c58a8a', // mat gül
  'Doğu Anadolu': '#a897b5', // mat mor
};

function hexHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255,
    g = parseInt(hex.slice(3, 5), 16) / 255,
    b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hslHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;
    const t = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = t(h + 1 / 3);
    g = t(h);
    b = t(h - 1 / 3);
  }
  const x = (v) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}
function ilRenkleri() {
  // Aynı bölgedeki illere geniş açıklık + ton + doygunluk kaydırması ver ki
  // komşu iller birbirinden net ayrışsın. Liste uzunluğu ASAL (11) -> 8 aralıklı
  // illerde çakışma olmaz (ör. Giresun/Trabzon aynı renk çıkmaz).
  const DL = [24, 6, -10, -26, 16, -18, 34, 0, -34, 12, -6];
  const DH = [0, 22, -18, 12, -26, 30, -8, 16, 6, -14, 26];
  const DS = [0, -16, 14, -8, 18, -22, 8, -12, 22, -6, 4];
  const perRegion = {},
    out = {};
  Object.keys(kanonik)
    .sort()
    .forEach((kod) => {
      const b = kanonik[kod].bolge;
      perRegion[b] = perRegion[b] || 0;
      const idx = perRegion[b]++;
      const [h, s, l] = hexHsl(BOLGE_RENK[b] || '#aaaaaa');
      const i = idx % 11;
      // doygunluk üst sınırı düşük (52) -> il tonları da neon olmaz
      out[kod] = hslHex(
        (h + DH[i] + 360) % 360,
        Math.max(14, Math.min(52, s + DS[i])),
        Math.max(27, Math.min(84, l + DL[i]))
      );
    });
  return out;
}

function govde(harita, komsuluk) {
  const W = harita.meta.genislik,
    H = harita.meta.yukseklik;
  const IL_RENK = ilRenkleri();
  const parcaSayisi = Object.keys(harita.parcalar).length;
  let parcaPaths = '',
    labels = '',
    ilPaths = '';
  Object.entries(harita.parcalar).forEach(([pid, p]) => {
    parcaPaths +=
      '<path d="' +
      p.yol +
      '" data-pid="' +
      pid +
      '" data-kod="' +
      p.kod +
      '" data-arazi="' +
      p.arazi +
      '"/>';
    labels += '<text x="' + p.etiket.x + '" y="' + p.etiket.y + '">' + p.ad + '</text>';
  });
  Object.values(harita.iller || {}).forEach((il) => {
    ilPaths += '<path d="' + il.yol + '"/>';
  });

  const veri = JSON.stringify({
    W,
    H,
    parcalar: Object.fromEntries(
      Object.entries(harita.parcalar).map(([pid, p]) => [
        pid,
        {
          kod: p.kod,
          il: p.il,
          no: p.no,
          ad: p.ad,
          arazi: p.arazi,
          nufus: p.nufus,
          ekonomi: p.ekonomi,
          bolge: kanonik[p.kod] ? kanonik[p.kod].bolge : '',
        },
      ])
    ),
    komsu: komsuluk,
    ilRenk: IL_RENK,
    araziRenk: ARAZI_RENK,
    bolgeRenk: BOLGE_RENK,
    araziAd: ARAZI_AD,
  });

  return `<style>
:root{--deniz:#c7d5de;--murekkep:#17242f;--ikincil:#5a6b78;--panel:#fff;--golge:rgba(20,32,46,.16);--hud:rgba(17,27,37,.92);--hudmet:#e9eef3;--mavi:#4a90d9}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.app{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--murekkep);height:100dvh;position:relative;overflow:hidden;background:var(--deniz)}
.sahne{position:absolute;inset:0}
svg{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
svg.tut{cursor:grabbing}
#parcalar path{stroke:#141b22;stroke-width:.5;stroke-linejoin:round;vector-effect:non-scaling-stroke}
#parcalar.geziyor{pointer-events:none}
#parcalar.geziyor path{shape-rendering:optimizeSpeed}
#parcalar path.komsu{stroke:#1f6fe0;stroke-width:2.2;filter:brightness(1.06)}
#parcalar path.sec{stroke:#0b1622;stroke-width:2.6;filter:brightness(1.12)}
#ilSinir path{fill:none;stroke:#fff;stroke-opacity:.5;stroke-width:1.3;stroke-linejoin:round;vector-effect:non-scaling-stroke;pointer-events:none}
#etiketler{display:none}
#etiketler text{font-size:5.5px;text-anchor:middle;fill:#12202e;paint-order:stroke;stroke:rgba(255,255,255,.85);stroke-width:1.2px;pointer-events:none}
/* ---- HUD katmanı ---- */
.baslik{position:absolute;top:calc(10px + env(safe-area-inset-top));left:calc(10px + env(safe-area-inset-left));z-index:5;
  background:var(--hud);color:var(--hudmet);padding:7px 12px;border-radius:11px;font:700 13px/1.1 system-ui;
  display:flex;gap:8px;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.28)}
.baslik #say{font-weight:500;color:#a7b3bf;font-size:12px}
.hud{position:absolute;right:calc(10px + env(safe-area-inset-right));bottom:calc(10px + env(safe-area-inset-bottom));z-index:6;
  width:min(36vw,136px);background:var(--hud);border-radius:14px;padding:7px;
  box-shadow:0 10px 28px rgba(0,0,0,.34);display:flex;flex-direction:column;gap:6px}
.hud .efsane{display:flex;flex-wrap:wrap;gap:2px 7px;font-size:10px;color:#c2ccd6;padding:1px 2px;line-height:1.5}
.hud .efsane span{display:inline-flex;align-items:center}
.hud .efsane i{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:2px;border:1px solid rgba(255,255,255,.22)}
.modlar{display:flex;flex-direction:column;gap:4px}
.modlar button{width:100%;min-height:34px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);
  color:var(--hudmet);font:600 12px/1 system-ui;border-radius:9px;cursor:pointer}
.modlar button.aktif{background:#eef2f5;color:#12202e;border-color:#eef2f5}
.secenekler{display:flex;flex-direction:column;gap:4px}
.secenekler .cip{width:100%;min-height:29px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);
  color:var(--hudmet);font:500 11px/1 system-ui;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.secenekler .cip.aktif{background:var(--mavi);color:#fff;border-color:var(--mavi)}
.bilgi{position:absolute;left:calc(10px + env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom));z-index:6;
  width:min(42vw,260px);background:var(--panel);border:1px solid var(--golge);border-radius:14px;padding:11px 14px;
  box-shadow:0 8px 26px var(--golge);font-size:13px}
.bilgi.bos{background:var(--hud);color:#c2ccd6;border:0;box-shadow:0 6px 20px rgba(0,0,0,.28);width:auto;padding:8px 12px;font-weight:500}
.bilgi b{font-size:15px;display:block;margin-bottom:2px;padding-right:22px}
.bilgi .k{color:var(--ikincil);font-size:12px}
.bilgi .satir{margin-top:5px}
.bilgi .kapat{position:absolute;top:5px;right:7px;width:26px;height:26px;border:0;background:transparent;color:var(--ikincil);font-size:19px;cursor:pointer;line-height:1}
</style>
<div class="app">
  <div class="sahne">
    <svg id="hrt" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Türkiye parça haritası">
      <g id="parcalar">${parcaPaths}</g>
      <g id="ilSinir">${ilPaths}</g>
      <g id="etiketler">${labels}</g>
    </svg>
  </div>
  <div class="baslik">🧩 Parça Haritası <span id="say">${parcaSayisi} parça</span></div>
  <div class="bilgi bos" id="bilgi">Bir parçaya dokun</div>
  <div class="hud">
    <div class="efsane" id="efsane"></div>
    <div class="modlar" id="modlar">
      <button data-mod="il" class="aktif">İller</button>
      <button data-mod="arazi">Arazi</button>
      <button data-mod="bolge">Bölge</button>
    </div>
    <div class="secenekler">
      <button class="cip" id="lbl">Adlar</button>
      <button class="cip aktif" id="beyaz">Sınırlar</button>
      <button class="cip" id="sigdir" aria-label="Haritayı sığdır" title="Sığdır">↺</button>
    </div>
  </div>
</div>
<script>
(function(){
  var D = ${veri};
  var svg=document.getElementById('hrt'), gP=document.getElementById('parcalar'), gIl=document.getElementById('ilSinir'),
      etk=document.getElementById('etiketler'), bilgi=document.getElementById('bilgi'), efsane=document.getElementById('efsane'), say=document.getElementById('say');
  var W=D.W, H=D.H, vb={x:0,y:0,w:W,h:H};
  var pathById={}; [].forEach.call(gP.children,function(p){pathById[p.getAttribute('data-pid')]=p;});

  var mod='il';
  function renkVer(){
    [].forEach.call(gP.children,function(p){
      var pid=p.getAttribute('data-pid'),kod=p.getAttribute('data-kod'),arazi=p.getAttribute('data-arazi');
      p.style.fill = mod==='il' ? D.ilRenk[kod] : mod==='arazi' ? D.araziRenk[arazi] : D.bolgeRenk[D.parcalar[pid].bolge];
    });
    efsaneCiz();
  }
  function efsaneCiz(){
    var h='';
    if(mod==='arazi'){ ['ova','tepelik','daglik'].forEach(function(a){h+='<span><i style="background:'+D.araziRenk[a]+'"></i>'+D.araziAd[a]+'</span>';}); }
    else if(mod==='bolge'){ Object.keys(D.bolgeRenk).forEach(function(b){h+='<span><i style="background:'+D.bolgeRenk[b]+'"></i>'+b+'</span>';}); }
    else { h='<span>Her il ayrı renk · aynı ilin parçaları aynı ton</span>'; }
    efsane.innerHTML=h;
  }
  document.getElementById('modlar').addEventListener('click',function(e){
    if(e.target.tagName!=='BUTTON')return; mod=e.target.getAttribute('data-mod');
    [].forEach.call(e.currentTarget.children,function(b){b.classList.toggle('aktif',b===e.target);}); renkVer();
  });

  // Haritayı dikdörtgen içinde tut ama HER YÖNDE biraz oynama payı bırak.
  function clampVb(){ var mx=W*0.09, my=H*0.22;
    var loX=-mx, hiX=W-vb.w+mx; vb.x = (loX>hiX) ? (W-vb.w)/2 : Math.max(loX, Math.min(hiX, vb.x));
    var loY=-my, hiY=H-vb.h+my; vb.y = (loY>hiY) ? (H-vb.h)/2 : Math.max(loY, Math.min(hiY, vb.y));
  }
  // viewBox güncellemesini kareye başına bir kez uygula (akıcılık)
  var rafBekliyor=false;
  function uygula(){ clampVb(); if(rafBekliyor)return; rafBekliyor=true;
    requestAnimationFrame(function(){ rafBekliyor=false; svg.setAttribute('viewBox', vb.x+' '+vb.y+' '+vb.w+' '+vb.h); }); }
  function sigdir(){ vb={x:0,y:0,w:W,h:H}; uygula(); }
  // gezerken ağır katmanları (il sınırı + etiketler) gizle -> akıcı kaydırma
  var geziyor=false;
  function gezmeBasla(){ if(geziyor)return; geziyor=true; gP.classList.add('geziyor'); gIl.style.visibility='hidden'; etk.style.visibility='hidden'; }
  function gezmeBitir(){ if(!geziyor)return; geziyor=false; gP.classList.remove('geziyor'); gIl.style.visibility=''; etk.style.visibility=''; }
  document.getElementById('sigdir').addEventListener('click', sigdir);
  var lblCip=document.getElementById('lbl');
  lblCip.addEventListener('click',function(){ var on=!lblCip.classList.contains('aktif'); lblCip.classList.toggle('aktif',on); etk.style.display=on?'block':'none'; });
  var beyazCip=document.getElementById('beyaz');
  beyazCip.addEventListener('click',function(){ var on=!beyazCip.classList.contains('aktif'); beyazCip.classList.toggle('aktif',on); gIl.style.display=on?'':'none'; });

  function svgNokta(cx,cy){ var r=svg.getBoundingClientRect(); return {x:vb.x+(cx-r.left)/r.width*vb.w, y:vb.y+(cy-r.top)/r.height*vb.h}; }
  function zoom(factor,cx,cy){ var p=svgNokta(cx,cy),nw=vb.w*factor,nh=vb.h*factor,maxW=W*1.2,minW=W*0.02;
    if(nw>maxW){nw=maxW;nh=maxW*(H/W);} if(nw<minW){nw=minW;nh=minW*(H/W);} factor=nw/vb.w;
    vb.x=p.x-(p.x-vb.x)*factor; vb.y=p.y-(p.y-vb.y)*factor; vb.w=nw; vb.h=nh; uygula(); }
  svg.addEventListener('wheel',function(e){e.preventDefault();zoom(e.deltaY>0?1.12:0.89,e.clientX,e.clientY);},{passive:false});

  var noktalar=new Map(), suruklendi=false, basX=0, basY=0, pinchD=0;
  svg.addEventListener('pointerdown',function(e){ noktalar.set(e.pointerId,{x:e.clientX,y:e.clientY}); suruklendi=false; basX=e.clientX; basY=e.clientY;
    if(noktalar.size===2){var a=Array.from(noktalar.values());pinchD=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);} svg.classList.add('tut'); });
  svg.addEventListener('pointermove',function(e){ if(!noktalar.has(e.pointerId))return; var onceki=noktalar.get(e.pointerId); noktalar.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(noktalar.size===2){var a=Array.from(noktalar.values()),d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}; if(pinchD>0)zoom(pinchD/d,m.x,m.y); pinchD=d; suruklendi=true; gezmeBasla(); return;}
    var r=svg.getBoundingClientRect(),dx=(e.clientX-onceki.x)/r.width*vb.w,dy=(e.clientY-onceki.y)/r.height*vb.h; vb.x-=dx; vb.y-=dy; uygula();
    if(Math.abs(e.clientX-basX)+Math.abs(e.clientY-basY)>4){suruklendi=true; gezmeBasla();} });
  function birak(e){ var tap=(noktalar.size===1&&!suruklendi&&e.type!=='pointercancel'); noktalar.delete(e.pointerId); if(noktalar.size<2)pinchD=0;
    if(noktalar.size===0){ svg.classList.remove('tut'); gezmeBitir(); if(tap){ var el=document.elementFromPoint(e.clientX,e.clientY);
      if(el&&el.tagName==='path'&&el.parentNode.id==='parcalar') secEt(el.getAttribute('data-pid')); else temizle(); } } }
  svg.addEventListener('pointerup',birak); svg.addEventListener('pointercancel',birak);
  gP.addEventListener('click',function(e){ if(!suruklendi&&e.target.tagName==='path') secEt(e.target.getAttribute('data-pid')); });

  var oncekiSec=null, oncekiKomsu=[];
  function temizle(){ if(oncekiSec)oncekiSec.classList.remove('sec'); oncekiKomsu.forEach(function(p){p.classList.remove('komsu');});
    oncekiSec=null; oncekiKomsu=[]; bilgi.className='bilgi bos'; bilgi.textContent='Bir parçaya dokun'; }
  function secEt(pid){
    temizle();
    var p=pathById[pid]; if(!p)return; p.classList.add('sec'); oncekiSec=p;
    var ks=(D.komsu[pid]||[]);
    ks.forEach(function(k){ var pk=pathById[k]; if(pk){pk.classList.add('komsu');oncekiKomsu.push(pk);} });
    gP.appendChild(p);
    var d=D.parcalar[pid];
    bilgi.className='bilgi';
    bilgi.innerHTML='<button class="kapat" id="bkapat">×</button><b>'+d.ad+'</b><span class="k">'+d.il+' · parça '+d.no+' · '+D.araziAd[d.arazi]+'</span>'+
      '<div class="satir k">Pay: nüfus %'+Math.round(d.nufus*100)+' · ekonomi %'+Math.round(d.ekonomi*100)+' · '+ks.length+' komşu</div>';
    document.getElementById('bkapat').addEventListener('click',function(ev){ev.stopPropagation();temizle();});
  }
  renkVer();
})();
</script>`;
}

function uret() {
  const harita = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/parcalar.json'), 'utf8'));
  const komsuluk = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/parca-komsuluk.json'), 'utf8'));
  const g = govde(harita, komsuluk);
  const tam =
    '<!doctype html><html lang="tr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">' +
    '<title>İl Savaşları — Parça Haritası</title><style>html,body{margin:0;height:100%}</style></head><body>' +
    g +
    '</body></html>';
  fs.writeFileSync(path.join(PROJ, 'onizleme/parca.html'), tam);
  fs.writeFileSync(path.join(PROJ, 'onizleme/parca-artifact.html'), g);
  console.log('Önizleme yazıldı: onizleme/parca.html + parca-artifact.html');
}

module.exports = { uret };
if (require.main === module) uret();
