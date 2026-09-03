import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace, Vector3 } from 'three'

import { SHOTS } from '../scene/shots'
import AdishName from './AdishName'
import sourcePhoto from '../assets/layers/source_photo.png'
import structureWallsVines from '../assets/layers/structure_walls_vines.png'
import backgroundLightshaft from '../assets/layers/background_lightshaft.png'
import mainPoolWater from '../assets/layers/main_pool_water.png'
import waterfallCenter from '../assets/layers/waterfall_center.png'
import foregroundRocks from '../assets/layers/foreground_rocks.png'
import foregroundLOrchids from '../assets/layers/foreground_L_orchids.png'
import foregroundROrchids from '../assets/layers/foreground_R_orchids.png'
import rockVine1 from '../assets/patches/rock_vine_1.png'
import rockVine2 from '../assets/patches/rock_vine_2.png'
import rockVine3 from '../assets/patches/rock_vine_3.png'
import rockVine4 from '../assets/patches/rock_vine_4.png'
import stone1 from '../assets/patches/stone_1.png'
import stone2 from '../assets/patches/stone_2.png'
import stone3 from '../assets/patches/stone_3.png'
import wfWaterPool from '../assets/chapters/wf_water_pool.png'
import wfRockAndFalls from '../assets/chapters/wf_rock_and_falls.png'
import wfBackgroundWalls from '../assets/chapters/wf_background_walls.png'
import weWaterReflection from '../assets/chapters/we_water_reflection.png'
import weRockRidge from '../assets/chapters/we_rock_ridge.png'

// Native canvas the layers were segmented from (px).
const CANVAS_W = 1915
const CANVAS_H = 821

// World-unit size of the frame at z = 0.
const REF_W = 10
const REF_H = REF_W * (CANVAS_H / CANVAS_W)

// Every full-frame layer's world size is computed as if the camera always
// sits exactly BASE_DIST away (see the `scale` formula below) -- that's
// what keeps the composition matching the flat photo when the camera is
// centered. But shots.js dollies the camera anywhere from z=6.1 to z=9.2,
// and a plane sized for BASE_DIST=8 is genuinely too small once the camera
// is actually further away than that (at z=9.2 the frustum's footprint at
// a layer's depth is bigger than what an 8-away sizing gives it, exposing
// its edge as black -- this bit twice: first read as "natural photo
// darkness" like the real dark top edge, but pixel-checked at true black,
// not the source photo's actual ~25-35 brightness there).
//
// Fix: size every layer as if the camera sits much closer than it ever
// really does (well under the nearest shot's z, not just the farthest) --
// scale grows as this shrinks, so every layer ends up with generous
// built-in overhang at every real camera distance shots.js uses. The
// tradeoff (the composition would only match the flat photo exactly at
// this hypothetical close distance) doesn't cost anything: no shot camera
// actually sits there.
const BASE_DIST = 4.5

// Patch layers (rock_vine_*, stone_*) are separately-generated, separately
// -segmented cutouts, not slices of the main photo -- they don't have a
// natural position in CANVAS_W/CANVAS_H space, so they're placed by native
// pixel size (so they don't get stretched) times a hand-picked scale, at
// a hand-picked top-left corner. Purpose: cover the black void that's
// exposed past the original photo's edge when the story camera tilts up
// toward the light shaft (top) or looks down toward the pool (bottom) --
// see shots.js and the "these are flat planes, not a panorama" note there.
function patchFrame(imgW, imgH, scale, x, y) {
  return { x, y, w: (imgW * scale) / CANVAS_W, h: (imgH * scale) / CANVAS_H }
}

// Chapter backdrops (waterfall_base, water_edge_rocks) are entirely new
// photo compositions, not slices of the main cave photo -- they have no
// natural position in CANVAS_W/CANVAS_H space at all. Each one is placed
// as its own self-contained "island": centered on a world x far enough
// from the main cluster (and from each other) that their view frustums
// never overlap at any camera position shots.js uses, sized to fill the
// frame the way REF_W does for the main layers. The empty space the
// camera crosses between islands reads as the passage darkening between
// chambers -- deliberate, not a gap to hide (see shots.js).
function standaloneRect(imgW, imgH, depth, cx, cy) {
  const scale = (BASE_DIST - depth) / BASE_DIST
  const w = REF_W * scale
  const h = w * (imgH / imgW)
  return { x: cx, y: cy, w, h }
}

// Each island center -- also referenced by shots.js for camera position/target.
const CHAPTER2_X = 32
const CHAPTER3_X = 64

const LAYERS = [
  { tex: sourcePhoto, depth: -5.3, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: structureWallsVines, depth: -4.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: backgroundLightshaft, depth: -3.9, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: mainPoolWater, depth: -3.2, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: waterfallCenter, depth: -2.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundRocks, depth: -1.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundLOrchids, depth: 0.3, frame: { x: 0 / CANVAS_W, y: 242 / CANVAS_H, w: 219 / CANVAS_W, h: 264 / CANVAS_H } },
  { tex: foregroundROrchids, depth: 0.3, frame: { x: 1519 / CANVAS_W, y: 60 / CANVAS_H, w: 396 / CANVAS_W, h: 341 / CANVAS_H } },
  // top edge: rock+vine ceiling patches, sitting just in front of the
  // structure layer so they read as more ceiling detail, not a separate object
  { tex: rockVine1, depth: -4.5, frame: patchFrame(615, 571, 0.5, -0.05, -0.20) },
  { tex: rockVine2, depth: -4.5, frame: patchFrame(493, 570, 0.5, 0.29, -0.20) },
  { tex: rockVine3, depth: -4.5, frame: patchFrame(394, 559, 0.5, 0.59, -0.20) },
  { tex: rockVine4, depth: -4.5, frame: patchFrame(315, 506, 0.5, 0.87, -0.20) },
  // bottom edge: mossy stones, foreground depth near the existing rocks layer
  { tex: stone1, depth: -1.4, frame: patchFrame(568, 231, 0.6, 0.0, 0.90) },
  { tex: stone2, depth: -1.4, frame: patchFrame(921, 225, 0.6, 0.34, 0.90) },
  { tex: stone3, depth: -1.4, frame: patchFrame(691, 236, 0.6, 0.78, 0.90) },
  // chapter 2 island (waterfall_base source, split into 3 depth layers the
  // same way the main cave photo was -- see segment_waterfall.py)
  { tex: wfBackgroundWalls, depth: -5, rect: standaloneRect(1915, 821, -5, CHAPTER2_X, 0) },
  { tex: wfRockAndFalls, depth: -3, rect: standaloneRect(1915, 821, -3, CHAPTER2_X, 0) },
  { tex: wfWaterPool, depth: -1.3, rect: standaloneRect(1915, 821, -1.3, CHAPTER2_X, 0) },
  // chapter 3 island (water_edge_rocks source, split into 2 depth layers)
  { tex: weRockRidge, depth: -3.5, rect: standaloneRect(1839, 855, -3.5, CHAPTER3_X, -0.3) },
  { tex: weWaterReflection, depth: -1.8, rect: standaloneRect(1839, 855, -1.8, CHAPTER3_X, -0.3) },
]

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function smoothstep(t) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// Continuous camera state for a given story progress (0..1): shot i sits
// at progress i/(N-1), eased-interpolated between consecutive shots.
function getShotState(progress) {
  const n = SHOTS.length
  const idx = progress * (n - 1)
  const i0 = clamp(Math.floor(idx), 0, n - 2)
  const eased = smoothstep(idx - i0)
  const a = SHOTS[i0]
  const b = SHOTS[i0 + 1]
  return { position: lerp3(a.position, b.position, eased), target: lerp3(a.target, b.target, eased) }
}

function frameToWorld(frame, depth) {
  const scale = (BASE_DIST - depth) / BASE_DIST
  const w = frame.w * REF_W * scale
  const h = frame.h * REF_H * scale
  const cxFrac = frame.x + frame.w / 2 - 0.5
  const cyFrac = frame.y + frame.h / 2 - 0.5
  const x = cxFrac * REF_W * scale
  const y = -cyFrac * REF_H * scale
  return { x, y, w, h }
}

function Layer({ tex, depth, frame, rect }) {
  const texture = useLoader(TextureLoader, tex)
  texture.colorSpace = SRGBColorSpace
  // `rect` (standaloneRect) is already fully computed in world units;
  // `frame` (patchFrame/CANVAS-fraction based) still needs frameToWorld.
  const { x, y, w, h } = useMemo(() => (rect ? rect : frameToWorld(frame, depth)), [rect, frame, depth])

  return (
    <mesh position={[x, y, depth]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

// Small amount of mouse-driven life layered on top of the authored path --
// kept deliberately tiny so it never competes with the story move itself.
const JITTER_X = 0.12
const JITTER_Y = 0.08

function CameraRig({ progress }) {
  const { camera } = useThree()
  const progressRef = useRef(progress)
  const pointer = useRef({ x: 0, y: 0 })
  const smoothedTarget = useRef(new Vector3())
  const initialized = useRef(false)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(() => {
    const { position, target } = getShotState(progressRef.current)
    const jitterX = pointer.current.x * JITTER_X
    const jitterY = -pointer.current.y * JITTER_Y

    const desiredPos = [position[0] + jitterX, position[1] + jitterY, position[2]]

    if (!initialized.current) {
      camera.position.set(...desiredPos)
      smoothedTarget.current.set(...target)
      initialized.current = true
    } else {
      camera.position.x += (desiredPos[0] - camera.position.x) * 0.08
      camera.position.y += (desiredPos[1] - camera.position.y) * 0.08
      camera.position.z += (desiredPos[2] - camera.position.z) * 0.08
      smoothedTarget.current.x += (target[0] - smoothedTarget.current.x) * 0.08
      smoothedTarget.current.y += (target[1] - smoothedTarget.current.y) * 0.08
      smoothedTarget.current.z += (target[2] - smoothedTarget.current.z) * 0.08
    }

    camera.lookAt(smoothedTarget.current)
  })

  return null
}

export default function CaveScene({ progress }) {
  return (
    <Canvas
      camera={{ position: SHOTS[0].position, fov: 30, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <CameraRig progress={progress} />
      {LAYERS.map((layer, i) => (
        <Layer key={i} {...layer} />
      ))}
      <AdishName progress={progress} />
    </Canvas>
  )
}
