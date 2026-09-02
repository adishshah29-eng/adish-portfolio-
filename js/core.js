/* =====================================================================
   The Hollow — core.js
   Shared math helpers, palette, procedural texture generators, and the
   renderer/scene/camera setup that every other module depends on.
   Load order: three.r149.min.js -> core.js -> temple.js -> ... -> main.js
   (classic <script> tags share one global scope, so no bundler/imports
   are needed — this file's top-level const/function declarations are
   visible to every script loaded after it)
   ===================================================================== */
'use strict';
const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ============================================== 1 · math helpers */
const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
const lerp  = (a,b,t) => a + (b-a)*t;
const smooth= (a,b,x) => { const t = clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const damp  = (cur,to,rate,dt) => lerp(cur,to,1-Math.exp(-rate*dt));
const rand  = (a=1,b) => b===undefined ? Math.random()*a : a + Math.random()*(b-a);
const rlist = (arr) => arr[Math.floor(Math.random()*arr.length)];
const vpW = () => innerWidth, vpH = () => innerHeight;

/* seeded PRNG for stable procedural textures */
let __seed = 20260902;
const srand = () => { __seed = (__seed * 1664525 + 1013904223) >>> 0; return __seed / 4294967296; };

/* seeded bilinear value-noise + fBm, for genuine per-pixel grain/roughness
   in the generated textures (bark, stone) instead of random-shape speckle */
function makeValueNoise2D(size) {
  const N = size || 64;
  const grid = new Float32Array(N * N);
  for (let i=0;i<N*N;i++) grid[i] = srand();
  const at = (x,y) => grid[((y & (N-1)) * N) + (x & (N-1))];
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf);
    const a = at(xi,yi), b = at(xi+1,yi), c = at(xi,yi+1), d = at(xi+1,yi+1);
    return a + (b-a)*u + (c-a)*v + (a-b-c+d)*u*v;
  };
}
function fbm2D(noise, x, y, octaves, lacunarity, gain) {
  let amp = .5, freq = 1, sum = 0, norm = 0;
  for (let i=0;i<(octaves||4);i++){
    sum += amp * noise(x*freq, y*freq);
    norm += amp;
    amp *= (gain||.5); freq *= (lacunarity||2);
  }
  return sum / norm;
}
/* stamps fbm-driven per-pixel grain onto an already-drawn canvas region —
   real roughness variation rather than randomly placed circles */
function applyFbmGrain(g, w, h, scale, strength, bias) {
  const noise = makeValueNoise2D(64);
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  const b = bias == null ? 0 : bias;
  for (let y=0;y<h;y++){
    for (let x=0;x<w;x++){
      const n = fbm2D(noise, x*scale, y*scale, 5, 2.1, .52) - .5 + b;
      const i = (y*w + x) * 4;
      d[i]   = Math.max(0, Math.min(255, d[i]   + n*strength));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n*strength));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n*strength));
    }
  }
  g.putImageData(img, 0, 0);
}

/* ============================================== 2 · palette */
const C = {
  ink:       0x1a2b1e,
  canopy:    0x3d6a3a,
  moss:      0x4f7d42,
  moss2:     0x6a9450,
  leaf:      0x8ec46e,
  jade:      0x9fe89a,
  gold:      0xffcc44,
  sun:       0xffeeb0,
  stone:     0x6e7a5e,
  stoneDark: 0x445238,
  water:     0x1f4a3a,
  mist:      0xd8e8b8,
  lotus:     0xffd0e0,
};

/* ============================================== 3 · procedural textures */
function makeCanvas(size) {
  const c = document.createElement('canvas'); c.width = c.height = size; return c;
}
function toTex(canvas, opts={}) {
  const t = new THREE.CanvasTexture(canvas);
  if (opts.aniso) t.anisotropy = opts.aniso;
  if (opts.wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.needsUpdate = true;
  return t;
}

/* radial glow — used for haze, halos, god-rays */
function texGlow(inner, outer) {
  const c = makeCanvas(256), g = c.getContext('2d');
  const grad = g.createRadialGradient(128,128,0,128,128,128);
  grad.addColorStop(0, inner); grad.addColorStop(.55, outer); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0,0,256,256);
  return c;
}

/* soft round for firefly/spore points */
function texFirefly() {
  const c = makeCanvas(64), g = c.getContext('2d');
  const grad = g.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0, 'rgba(255,240,180,1)');
  grad.addColorStop(.35, 'rgba(255,220,140,.75)');
  grad.addColorStop(1, 'rgba(255,180,80,0)');
  g.fillStyle = grad; g.fillRect(0,0,64,64);
  return c;
}

/* moss/stone splotchy texture */
function texMoss() {
  const c = makeCanvas(512), g = c.getContext('2d');
  g.fillStyle = '#293c22'; g.fillRect(0,0,512,512);
  for (let i=0;i<3200;i++){
    const r = 2 + srand()*6;
    const hue = 90 + srand()*40;
    const l = 20 + srand()*22;
    g.fillStyle = `hsla(${hue|0},${(30+srand()*35)|0}%,${l|0}%,${.35+srand()*.4})`;
    g.beginPath(); g.arc(srand()*512, srand()*512, r, 0, 6.28); g.fill();
  }
  for (let i=0;i<80;i++){
    g.fillStyle = `rgba(210,190,120,${.06+srand()*.06})`;
    g.beginPath(); g.arc(srand()*512, srand()*512, 10+srand()*40, 0, 6.28); g.fill();
  }
  return c;
}

/* stone with fine crack lines */
function texStone() {
  const c = makeCanvas(512), g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,0,512);
  grad.addColorStop(0,'#4d4c42'); grad.addColorStop(1,'#2b2a24');
  g.fillStyle = grad; g.fillRect(0,0,512,512);
  for (let i=0;i<800;i++){
    g.fillStyle = `rgba(${120+srand()*60|0},${115+srand()*40|0},${100+srand()*30|0},${srand()*.4})`;
    g.beginPath(); g.arc(srand()*512, srand()*512, 1+srand()*3, 0, 6.28); g.fill();
  }
  g.strokeStyle = 'rgba(20,20,15,.6)'; g.lineWidth = 1;
  for (let i=0;i<28;i++){
    g.beginPath(); g.moveTo(srand()*512, srand()*512);
    let x = srand()*512, y = srand()*512;
    for (let j=0;j<5;j++){ x += (srand()-.5)*90; y += (srand()-.5)*90; g.lineTo(x,y); }
    g.stroke();
  }
  /* moss creeping in from bottom */
  for (let i=0;i<380;i++){
    const yy = 380 + srand()*132;
    g.fillStyle = `rgba(${40+srand()*40|0},${80+srand()*40|0},${30+srand()*30|0},${.3+srand()*.5})`;
    g.beginPath(); g.arc(srand()*512, yy, 2+srand()*5, 0, 6.28); g.fill();
  }
  /* fbm grain — real per-pixel roughness instead of only shape-based detail */
  applyFbmGrain(g, 512, 512, .09, 26);
  return c;
}

/* canopy sky texture — low-key daylight-through-canopy, near-black at the
   horizon so it blends into the fog color instead of reading as a bright dome */
function texSky() {
  const c = makeCanvas(1024), g = c.getContext('2d');
  /* pale yellow-green sunlit haze at the top, deepening to forest green at
     the horizon — a humid, bright jungle sky, not a night dome */
  const grad = g.createLinearGradient(0,0,0,1024);
  grad.addColorStop(0,'#eaf0b8');
  grad.addColorStop(.28,'#cfe098');
  grad.addColorStop(.6,'#8fb868');
  grad.addColorStop(1,'#3d6a3a');
  g.fillStyle = grad; g.fillRect(0,0,1024,1024);
  /* blazing sun + broad scattered glow, top-right, piercing the haze */
  const sx = 700, sy = 160;
  const sunGrad = g.createRadialGradient(sx,sy,0,sx,sy,60);
  sunGrad.addColorStop(0,'rgba(255,250,225,1)');
  sunGrad.addColorStop(1,'rgba(255,238,176,0)');
  g.fillStyle = sunGrad; g.beginPath(); g.arc(sx,sy,60,0,6.28); g.fill();
  for (let i=0;i<6;i++){
    const x = 520 + srand()*380, y = 40 + srand()*280;
    const r = 140 + srand()*220;
    const grad2 = g.createRadialGradient(x,y,0,x,y,r);
    grad2.addColorStop(0,'rgba(255,238,176,.55)');
    grad2.addColorStop(1,'rgba(255,238,176,0)');
    g.fillStyle = grad2; g.beginPath(); g.arc(x,y,r,0,6.28); g.fill();
  }
  /* leaf silhouettes — mid-tone forest green, readable against the bright
     haze without turning into a black mass */
  for (let i=0;i<1400;i++){
    const y = srand()*1024;
    g.fillStyle = `rgba(${28+srand()*30|0},${58+srand()*40|0},${26+srand()*26|0},${.3+srand()*.4})`;
    g.beginPath(); g.ellipse(srand()*1024, y, 3+srand()*10, 1.5+srand()*6, srand()*6.28, 0, 6.28); g.fill();
  }
  return c;
}

/* leaf silhouette (for drifting leaf sprites) */
function texLeaf() {
  const c = makeCanvas(64), g = c.getContext('2d');
  g.translate(32,32);
  g.fillStyle = '#3d5f2e';
  g.beginPath();
  g.moveTo(0,-24);
  g.bezierCurveTo(18,-16, 20,10, 0,24);
  g.bezierCurveTo(-20,10, -18,-16, 0,-24);
  g.fill();
  g.strokeStyle = '#1e321a'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0,-22); g.lineTo(0,22); g.stroke();
  return c;
}
/* the same leaf silhouette, duller/paler — the "back" face for tumbling
   leaves so a leaf reads as a solid object rather than a spinning cut-out */
function texLeafBack() {
  const c = makeCanvas(64), g = c.getContext('2d');
  g.translate(32,32);
  g.fillStyle = '#6b7a5a';
  g.beginPath();
  g.moveTo(0,-24);
  g.bezierCurveTo(18,-16, 20,10, 0,24);
  g.bezierCurveTo(-20,10, -18,-16, 0,-24);
  g.fill();
  g.strokeStyle = '#4a5540'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0,-22); g.lineTo(0,22); g.stroke();
  return c;
}

/* a small cluster of overlapping leaves on one alpha-cutout card — used as
   an instanced billboard so a single draw call can carry the whole
   forest's foliage detail instead of one draw call per blob */
function texLeafCard() {
  const c = makeCanvas(128), g = c.getContext('2d');
  const tones = ['#2e5222','#3a6a2c','#4a8038','#5a9440'];
  const drawLeaf = (cx,cy,s,rot,tone) => {
    g.save(); g.translate(cx,cy); g.rotate(rot); g.scale(s,s);
    g.fillStyle = tone;
    g.beginPath();
    g.moveTo(0,-16);
    g.bezierCurveTo(11,-10, 12,7, 0,16);
    g.bezierCurveTo(-12,7, -11,-10, 0,-16);
    g.fill();
    g.restore();
  };
  for (let i=0;i<8;i++){
    drawLeaf(30+srand()*68, 30+srand()*68, .5+srand()*.6, srand()*6.28, tones[(srand()*4)|0]);
  }
  return c;
}

/* vertical bark streaks + moss creep, for trunks and branches */
function texBark() {
  const c = makeCanvas(256), g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,256,0);
  grad.addColorStop(0,'#3a2a1a'); grad.addColorStop(.5,'#2c2013'); grad.addColorStop(1,'#20160a');
  g.fillStyle = grad; g.fillRect(0,0,256,256);
  g.lineCap = 'round';
  for (let i=0;i<46;i++){
    const x0 = srand()*256;
    g.strokeStyle = `rgba(${8+srand()*10|0},${5+srand()*8|0},${2+srand()*6|0},${.35+srand()*.35})`;
    g.lineWidth = .6+srand()*1.8;
    g.beginPath(); let cx = x0; g.moveTo(cx,0);
    for (let y=0;y<=256;y+=14){ cx += (srand()-.5)*7; g.lineTo(cx,y); }
    g.stroke();
  }
  for (let i=0;i<10;i++){
    g.strokeStyle = `rgba(90,70,45,${.15+srand()*.2})`; g.lineWidth = .5+srand();
    const x0 = srand()*256; g.beginPath(); let cx = x0; g.moveTo(cx,0);
    for (let y=0;y<=256;y+=18){ cx += (srand()-.5)*8; g.lineTo(cx,y); }
    g.stroke();
  }
  /* moss creeping up from the base */
  for (let i=0;i<60;i++){
    const yy = 170 + srand()*86;
    g.fillStyle = `rgba(${34+srand()*30|0},${70+srand()*40|0},${28+srand()*24|0},${.22+srand()*.35})`;
    g.beginPath(); g.arc(srand()*256, yy, 3+srand()*10, 0, 6.28); g.fill();
  }
  /* fbm grain — real per-pixel roughness instead of only shape-based detail */
  applyFbmGrain(g, 256, 256, .16, 22);
  return c;
}

/* water ripple */
function texWater() {
  const c = makeCanvas(256), g = c.getContext('2d');
  g.fillStyle = '#1a2e34'; g.fillRect(0,0,256,256);
  for (let i=0;i<24;i++){
    g.strokeStyle = `rgba(180,215,220,${.06+srand()*.08})`; g.lineWidth = 1;
    g.beginPath(); g.arc(srand()*256, srand()*256, 10+srand()*40, 0, 6.28); g.stroke();
  }
  for (let i=0;i<200;i++){
    g.fillStyle = `rgba(200,230,235,${srand()*.35})`;
    g.beginPath(); g.arc(srand()*256, srand()*256, 1, 0, 6.28); g.fill();
  }
  return c;
}

/* grain texture for the CSS overlay */
function grainDataUrl() {
  const c = makeCanvas(180), g = c.getContext('2d');
  const im = g.createImageData(180,180);
  for (let i=0;i<im.data.length;i+=4){
    const v = 130 + (Math.random()*90)|0;
    im.data[i]=v; im.data[i+1]=v; im.data[i+2]=v; im.data[i+3]=255;
  }
  g.putImageData(im,0,0);
  return c.toDataURL('image/png');
}

/* ============================================== 4 · scene setup */
const canvas = document.getElementById('gl');
/* WebGL can legitimately fail to initialize (old browser, disabled GPU,
   context limit, a locked-down environment). If it does, the rest of this
   script must still run: DOM chrome, reveals, nav, and the full readable
   story are the fallback — not a dead page stuck behind a preloader. */
let webglOK = true, renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x2a402c, 1);
} catch (e) {
  webglOK = false;
  document.body.classList.add('no-webgl');
  console.warn('The Hollow: WebGL unavailable, falling back to static DOM story.', e);
}

const scene = new THREE.Scene();
/* dense, bright, humid mist — scatters the sunlight and hides the far
   background clipping instead of pitch-black horizon fog */
scene.fog = new THREE.FogExp2(0x2a402c, 0.045);
const FOG_BY_CHAPTER = [0.05, 0.04, 0.036, 0.046, 0.03, 0.026];

const camera = new THREE.PerspectiveCamera(38, 1, .35, 240);
scene.add(camera);

/* every module appends its own pieces here; main.js's tick() reads it */
const WORLD = {
  leaves: [], fireflies: [], godrays: [], trees: [],
  temple: null, relic: null, relicHalo: null,
  pond: null, waterfall: null, grass: null, stones: null,
  sun: null, jadeFill: null,
};
