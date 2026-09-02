/* =====================================================================
   The Hollow — temple.js
   The sanctuary facade: the backmost, foundational 3D layer. Built per
   threejs-towers technique — shared vertex/normal/UV/index arrays merged
   into one geometry (one draw call for the whole structure), UVs written
   in real world units (not BoxGeometry's default 0..1 per face, which
   makes a tiny cap and a huge wall slab share the same texture grain and
   read as plastic), and every proportion computed as a fraction of the
   facade width rather than picked by eye.
   Depends on: THREE, scene, C, srand, lerp, makeCanvas, toTex, texGlow,
   texLeafCard, applyFbmGrain, WORLD (all from core.js, loaded first).
   ===================================================================== */

/* one shared quad-appender: every solid stone part (walls, pilasters,
   pediment, cornice, steps) pushes into the same arrays so the whole
   facade ends up as a single Mesh */
function templeBox(positions, normals, uvs, indices, cx, cy, cz, sx, sy, sz, uvScale) {
  const x0 = cx-sx/2, x1 = cx+sx/2, y0 = cy-sy/2, y1 = cy+sy/2, z0 = cz-sz/2, z1 = cz+sz/2;
  const s = uvScale || .45;
  const addQuad = (p0,p1,p2,p3, n, du, dv) => {
    const vi = positions.length / 3;
    [p0,p1,p2,p3].forEach(p => { positions.push(p[0],p[1],p[2]); normals.push(n[0],n[1],n[2]); });
    uvs.push(0,0, du*s,0, du*s,dv*s, 0,dv*s);
    indices.push(vi,vi+1,vi+2, vi,vi+2,vi+3);
  };
  addQuad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1], [0,0,1],  sx,sy); /* +Z front  */
  addQuad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0], [0,0,-1], sx,sy); /* -Z back   */
  addQuad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1], [1,0,0],  sz,sy); /* +X right  */
  addQuad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0], [-1,0,0], sz,sy); /* -X left   */
  addQuad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0], [0,1,0],  sx,sz); /* +Y top    */
  addQuad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1], [0,-1,0], sx,sz); /* -Y bottom */
}

/* ashlar-block wall texture: panel lines suggesting carved stone courses,
   per-block shading variance, moss concentrated at the top edge and in
   the panel cracks, finished with real fBm grain */
function texTempleWall() {
  const c = makeCanvas(512), g = c.getContext('2d');
  const grad = g.createLinearGradient(0,0,0,512);
  grad.addColorStop(0,'#7c8468'); grad.addColorStop(1,'#4e5a3e');
  g.fillStyle = grad; g.fillRect(0,0,512,512);

  const cols = 5, rows = 6;
  for (let cx=0; cx<cols; cx++){
    for (let ry=0; ry<rows; ry++){
      const shade = (srand()-.5)*26;
      g.fillStyle = `rgba(${shade>0?255:10},${shade>0?255:10},${shade>0?245:8},${Math.abs(shade)/255*.5})`;
      g.fillRect(cx*512/cols+2, ry*512/rows+2, 512/cols-4, 512/rows-4);
    }
  }
  g.strokeStyle = 'rgba(18,22,12,.55)'; g.lineWidth = 2;
  for (let cx=0; cx<=cols; cx++){ const x=cx*512/cols; g.beginPath(); g.moveTo(x,0); g.lineTo(x,512); g.stroke(); }
  for (let ry=0; ry<=rows; ry++){ const y=ry*512/rows; g.beginPath(); g.moveTo(0,y); g.lineTo(512,y); g.stroke(); }

  /* moss concentrated at the top edge */
  for (let i=0;i<260;i++){
    const yy = srand()*180;
    g.fillStyle = `rgba(${40+srand()*40|0},${80+srand()*50|0},${30+srand()*30|0},${.3+srand()*.5})`;
    g.beginPath(); g.arc(srand()*512, yy, 3+srand()*8, 0, 6.28); g.fill();
  }
  /* moss creeping along the panel cracks */
  for (let i=0;i<220;i++){
    const cx = Math.round(srand()*cols)*512/cols;
    const y = srand()*512;
    g.fillStyle = `rgba(${40+srand()*40|0},${90+srand()*40|0},${30+srand()*30|0},${.25+srand()*.4})`;
    g.beginPath(); g.arc(cx+(srand()-.5)*10, y, 2+srand()*5, 0, 6.28); g.fill();
  }
  applyFbmGrain(g, 512, 512, .1, 24);
  return c;
}

function buildTemple() {
  const positions = [], normals = [], uvs = [], indices = [];
  const B = (cx,cy,cz,sx,sy,sz,uvScale) => templeBox(positions,normals,uvs,indices, cx,cy,cz,sx,sy,sz,uvScale);

  /* every proportion below is a fraction of FACADE_W/FACADE_H — per
     threejs-towers: "measure the face first, then size the door, the
     colonnettes and the pediment as fractions of it" */
  const FACADE_W = 16, FACADE_H = 11, WALL_D = 1.6;
  const DOOR_W = FACADE_W * .22, DOOR_H = FACADE_H * .62;
  const PIL_W = DOOR_W * .18, PIL_PROTRUDE = .35;
  const doorHalf = DOOR_W/2 + PIL_W;
  const BASE_Y = 1.0; /* the facade sits on the steps, not on the ground */

  const wallW = FACADE_W/2 - doorHalf;
  B(-(doorHalf + wallW/2), BASE_Y + FACADE_H/2, 0, wallW, FACADE_H, WALL_D, .45);
  B( (doorHalf + wallW/2), BASE_Y + FACADE_H/2, 0, wallW, FACADE_H, WALL_D, .45);

  /* pediment — sized to the door+pilaster footprint, finishes under the
     cornice rather than through it (its top is exactly the wall height) */
  B(0, BASE_Y + DOOR_H + (FACADE_H-DOOR_H)/2, 0, doorHalf*2, FACADE_H-DOOR_H, WALL_D, .45);

  /* pilasters flanking the door, protruding slightly from the wall face */
  const pilZ = PIL_PROTRUDE/2;
  B(-(DOOR_W/2 + PIL_W/2), BASE_Y + DOOR_H/2, pilZ, PIL_W, DOOR_H, WALL_D+PIL_PROTRUDE, .6);
  B( (DOOR_W/2 + PIL_W/2), BASE_Y + DOOR_H/2, pilZ, PIL_W, DOOR_H, WALL_D+PIL_PROTRUDE, .6);

  /* cornice — overhangs the whole facade, its underside is the roofline */
  B(0, BASE_Y + FACADE_H + .25, 0, FACADE_W+.8, .5, WALL_D+.7, .35);

  /* steps: a real staircase receding toward the doorway, not a single slab */
  const stepCount = 4, stepH = BASE_Y/stepCount;
  for (let i=0;i<stepCount;i++){
    const yC = stepH*i + stepH/2;
    const w = lerp(FACADE_W*.8, doorHalf*2+1.2, i/(stepCount-1));
    const depth = .55;
    const zFront = WALL_D/2 + depth*(stepCount-i);
    const zC = zFront - depth/2;
    B(0, yC, zC, w, stepH, depth, .5);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);

  const wallTex = toTex(texTempleWall(), { wrap:true, aniso:8 });
  /* DoubleSide trades a little fill-rate for correctness: on a single
     merged mesh like this, a winding slip anywhere would otherwise show
     as a missing face, and the cost of rendering both sides once is
     negligible next to that risk */
  const stoneMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness:.9, metalness:.02, side: THREE.DoubleSide });

  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, stoneMat));

  /* dark doorway recess — an opening into shadow, not a flat black plane */
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x0a1208 });
  const doorRecess = new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W-.2, DOOR_H-.2), doorMat);
  doorRecess.position.set(0, BASE_Y + DOOR_H/2, -WALL_D/2 - .9);
  g.add(doorRecess);

  /* the relic — a glowing presence just inside the threshold */
  const relicCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.5, 1),
    new THREE.MeshBasicMaterial({ color: C.sun })
  );
  relicCore.position.set(0, BASE_Y + 2.0, -WALL_D/2 - .8);
  g.add(relicCore); WORLD.relic = relicCore;

  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: toTex(texGlow('rgba(255,235,160,.95)','rgba(240,180,90,.28)')),
      transparent:true, blending: THREE.AdditiveBlending, depthWrite:false })
  );
  halo.position.copy(relicCore.position); halo.renderOrder = 3;
  g.add(halo); WORLD.relicHalo = halo;

  /* hanging vines draped from the cornice, using the same leaf-card alpha
     texture as the canopy trees for a consistent foliage language */
  const leafTex = toTex(texLeafCard(), { aniso: 4 });
  const vineMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: .4, side: THREE.DoubleSide, roughness: .9 });
  for (let i=0;i<10;i++){
    const vx = -FACADE_W/2 + Math.random()*FACADE_W;
    const vlen = 2.5 + Math.random()*3.5;
    const vine = new THREE.Mesh(new THREE.PlaneGeometry(.6, vlen, 1, 6), vineMat);
    const pos = vine.geometry.attributes.position;
    for (let k=0;k<pos.count;k++){
      const t = (pos.getY(k) + vlen/2) / vlen;
      pos.setZ(k, Math.sin(t*Math.PI*.5) * .4 * (i%2===0 ? 1 : -1));
    }
    pos.needsUpdate = true;
    vine.geometry.computeVertexNormals();
    vine.position.set(vx, BASE_Y + FACADE_H + .4 - vlen/2, WALL_D/2 + .5 + Math.random()*.6);
    g.add(vine);
  }

  g.position.set(0, 0, -19);
  scene.add(g);
  WORLD.temple = g;
}
buildTemple();
