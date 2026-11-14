// ÖNİZLEME ÜRETİM BETİĞİ — Görev 01 / Adım 2
// veri/harita.json + scripts/iller-kanonik.js okur, iki kontrol sayfası yazar:
//   onizleme/harita.html          -> çift tıklayınca açılan tam sayfa
//   onizleme/harita-artifact.html -> Artifact (tablet) için gövde-only sürüm
// Sayfa: parmakla yakınlaştır/kaydır, bölgeye göre renk, ile dokununca bilgi.
//
// Çalıştırma:  node scripts/onizleme-uret.js   (veya harita-uret.js otomatik çağırır)

const fs = require('fs');
const path = require('path');
const kanonik = require('./iller-kanonik');

const PROJ = path.join(__dirname, '..');

// Bölge renkleri — pastel, birbirinden ayırt edilebilir, kartografik ton.
const BOLGE_RENK = {
  'Marmara': '#6f9fd8',
  'Ege': '#4fb8a3',
  'Akdeniz': '#e6a35c',
  'İç Anadolu': '#cbb267',
  'Karadeniz': '#7cbf7f',
  'Doğu Anadolu': '#b58fc9',
  'Güneydoğu Anadolu': '#dd8a8a',
};

function govde(harita) {
  const W = harita.meta.genislik,
    H = harita.meta.yukseklik;

  let paths = '';
  Object.entries(harita.iller).forEach(([kod, il]) => {
    const bolge = kanonik[kod] ? kanonik[kod].bolge : '';
    const ad = kanonik[kod] ? kanonik[kod].ad : kod;
    paths +=
      '<path d="' +
      il.yol +
      '" fill="' +
      (BOLGE_RENK[bolge] || '#9bb') +
      '" ' +
      'data-kod="' +
      kod +
      '" data-ad="' +
      ad +
      '" data-bolge="' +
      bolge +
      '"/>';
  });
  let labels = '';
  Object.entries(harita.iller).forEach(([kod, il]) => {
    const ad = kanonik[kod] ? kanonik[kod].ad : kod;
    labels += '<text x="' + il.etiket.x + '" y="' + il.etiket.y + '">' + ad + '</text>';
  });

  let legend = '';
  Object.entries(BOLGE_RENK).forEach(([b, c]) => {
    legend += '<span class="lj"><i style="background:' + c + '"></i>' + b + '</span>';
  });

  // NOT: script içinde ${W}/${H} kullanacağımız için tek kaçış: JSON ile gömüyoruz.
  const cfg = JSON.stringify({ W: W, H: H });

  return `<style>
:root{
  --kagit:#eef2f5; --deniz:#dbe4ea; --murekkep:#17242f; --ikincil:#5a6b78;
  --cizgi:#ffffff; --panel:#ffffff; --vurgu:#12202e; --golge:rgba(20,32,46,.12);
}
*{box-sizing:border-box}
.app{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--murekkep);
  background:var(--kagit);min-height:100%;display:flex;flex-direction:column}
.ust{display:flex;gap:14px 20px;align-items:baseline;flex-wrap:wrap;
  padding:12px 16px;background:var(--panel);border-bottom:1px solid var(--golge)}
.ust h1{margin:0;font-size:17px;font-weight:700;letter-spacing:.2px}
.ust .alt{font-size:13px;color:var(--ikincil)}
.rozet{margin-left:auto;font-size:13.5px;font-weight:600;color:var(--vurgu);
  background:var(--deniz);padding:5px 11px;border-radius:999px;min-height:28px;display:inline-flex;align-items:center}
.arac{display:flex;gap:8px;align-items:center;padding:8px 16px;background:var(--panel);
  border-bottom:1px solid var(--golge);flex-wrap:wrap;font-size:13px}
.arac button{font:inherit;border:1px solid var(--golge);background:#fff;color:var(--murekkep);
  padding:6px 12px;border-radius:8px;cursor:pointer}
.arac button:hover{background:var(--deniz)}
.arac label{display:inline-flex;gap:6px;align-items:center;cursor:pointer;user-select:none}
.efsane{display:flex;gap:10px 14px;flex-wrap:wrap;flex-basis:100%;margin-top:2px;
  padding-top:8px;border-top:1px dashed var(--golge)}
.lj{display:inline-flex;gap:5px;align-items:center;font-size:12px;color:var(--ikincil)}
.lj i{width:11px;height:11px;border-radius:3px;display:inline-block}
.sahne{flex:1;position:relative;background:var(--deniz);overflow:hidden;min-height:60vh}
svg{width:100%;height:100%;display:block;touch-action:none;cursor:grab}
svg.tut{cursor:grabbing}
#iller path{stroke:rgba(23,36,47,.34);stroke-width:.6;stroke-linejoin:round;vector-effect:non-scaling-stroke}
#iller path:hover{filter:brightness(1.08)}
#iller path.sec{stroke:var(--vurgu);stroke-width:2;filter:brightness(1.12)}
#etiketler text{font-size:7.5px;text-anchor:middle;fill:var(--vurgu);paint-order:stroke;
  stroke:rgba(255,255,255,.75);stroke-width:1.6px;pointer-events:none;font-family:system-ui,sans-serif}
.bilgi{position:absolute;left:12px;bottom:12px;background:var(--panel);border:1px solid var(--golge);
  border-radius:12px;padding:10px 14px;box-shadow:0 6px 20px var(--golge);min-width:150px;font-size:13px}
.bilgi b{font-size:16px;display:block}
.bilgi .k{color:var(--ikincil);font-size:12px}
.bilgi.bos{color:var(--ikincil)}
</style>
<div class="app">
  <div class="ust">
    <h1>İl Savaşları — Harita Önizleme</h1>
    <span class="alt">Adım 2 kontrolü · kaynak: geoBoundaries</span>
    <span class="rozet" id="sayac">81 il</span>
  </div>
  <div class="arac">
    <button id="sifirla">↺ Sığdır</button>
    <label><input type="checkbox" id="lbl" checked> İl adları</label>
    <span class="efsane">${legend}</span>
  </div>
  <div class="sahne">
    <svg id="hrt" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Türkiye 81 il haritası">
      <g id="iller">${paths}</g>
      <g id="etiketler">${labels}</g>
    </svg>
    <div class="bilgi bos" id="bilgi">Bir ile dokun</div>
  </div>
</div>
<script>
(function(){
  var cfg = ${cfg};
  var svg = document.getElementById('hrt');
  var iller = document.getElementById('iller');
  var etk = document.getElementById('etiketler');
  var bilgi = document.getElementById('bilgi');
  var W = cfg.W, H = cfg.H;
  var vb = {x:0,y:0,w:W,h:H};
  function uygula(){ svg.setAttribute('viewBox', vb.x+' '+vb.y+' '+vb.w+' '+vb.h); }
  function sigdir(){ vb={x:0,y:0,w:W,h:H}; uygula(); }
  document.getElementById('sifirla').addEventListener('click', sigdir);
  document.getElementById('lbl').addEventListener('change', function(e){
    etk.style.display = e.target.checked ? '' : 'none';
  });

  // ekran(px) -> svg koordinati
  function svgNokta(cx, cy){
    var r = svg.getBoundingClientRect();
    return { x: vb.x + (cx - r.left)/r.width*vb.w, y: vb.y + (cy - r.top)/r.height*vb.h };
  }
  function zoom(factor, cx, cy){
    var p = svgNokta(cx, cy);
    var nw = vb.w*factor, nh = vb.h*factor;
    var maxW = W*1.2, minW = W*0.05;
    if(nw>maxW){nw=maxW;nh=maxW*(H/W);} if(nw<minW){nw=minW;nh=minW*(H/W);}
    factor = nw/vb.w;
    vb.x = p.x - (p.x - vb.x)*factor;
    vb.y = p.y - (p.y - vb.y)*factor;
    vb.w = nw; vb.h = nh; uygula();
  }
  // fare tekerlegi
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    zoom(e.deltaY>0 ? 1.12 : 0.89, e.clientX, e.clientY);
  }, {passive:false});

  // isaretci (fare + tek/cift parmak)
  var noktalar = new Map(), suruklendi=false, basX=0, basY=0, pinchD=0, pinchM=null;
  svg.addEventListener('pointerdown', function(e){
    noktalar.set(e.pointerId, {x:e.clientX, y:e.clientY});
    suruklendi=false; basX=e.clientX; basY=e.clientY;
    if(noktalar.size===2){ var a=[...noktalar.values()]; pinchD=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      pinchM={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2}; }
    svg.classList.add('tut');
  });
  svg.addEventListener('pointermove', function(e){
    if(!noktalar.has(e.pointerId)) return;
    var onceki = noktalar.get(e.pointerId);
    noktalar.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(noktalar.size===2){
      var a=[...noktalar.values()], d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      var m={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2};
      if(pinchD>0){ zoom(pinchD/d, m.x, m.y); }
      pinchD=d; pinchM=m; suruklendi=true; return;
    }
    // tek parmak: kaydir
    var r = svg.getBoundingClientRect();
    var dx=(e.clientX-onceki.x)/r.width*vb.w, dy=(e.clientY-onceki.y)/r.height*vb.h;
    vb.x-=dx; vb.y-=dy; uygula();
    if(Math.abs(e.clientX-basX)+Math.abs(e.clientY-basY)>4) suruklendi=true;
  });
  var secili=null;
  function secEt(t){
    if(!t || t.tagName!=='path') return;
    if(secili) secili.classList.remove('sec');
    secili=t; t.classList.add('sec');
    bilgi.classList.remove('bos');
    bilgi.innerHTML='<b>'+t.getAttribute('data-ad')+'</b><span class="k">Plaka '+
      t.getAttribute('data-kod')+' · '+t.getAttribute('data-bolge')+'</span>';
  }
  function birak(e){
    var tap = (noktalar.size===1 && !suruklendi && e.type!=='pointercancel');
    noktalar.delete(e.pointerId);
    if(noktalar.size<2) pinchD=0;
    if(noktalar.size===0){
      svg.classList.remove('tut');
      if(tap){
        var el=document.elementFromPoint(e.clientX, e.clientY);
        if(el && el.tagName==='path' && el.parentNode && el.parentNode.id==='iller') secEt(el);
      }
    }
  }
  svg.addEventListener('pointerup', birak);
  svg.addEventListener('pointercancel', birak);
  // fare (masaüstü) için tıklama
  iller.addEventListener('click', function(e){ if(!suruklendi) secEt(e.target); });
})();
</script>`;
}

function uret() {
  const harita = JSON.parse(fs.readFileSync(path.join(PROJ, 'veri/harita.json'), 'utf8'));
  const g = govde(harita);
  const tam =
    '<!doctype html><html lang="tr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
    '<title>İl Savaşları — Harita Önizleme</title>' +
    '<style>html,body{margin:0;height:100%}</style></head><body>' +
    g +
    '</body></html>';
  fs.writeFileSync(path.join(PROJ, 'onizleme/harita.html'), tam);
  fs.writeFileSync(path.join(PROJ, 'onizleme/harita-artifact.html'), g);
  console.log('Önizleme yazıldı: onizleme/harita.html + harita-artifact.html');
}

module.exports = { uret, govde };
if (require.main === module) uret();
