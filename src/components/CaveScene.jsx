import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace } from 'three'

import sourcePhoto from '../assets/layers/source_photo.png'
import structureWallsVines from '../assets/layers/structure_walls_vines.png'
import backgroundLightshaft from '../assets/layers/background_lightshaft.png'
import mainPoolWater from '../assets/layers/main_pool_water.png'
import waterfallCenter from '../assets/layers/waterfall_center.png'
import foregroundRocks from '../assets/layers/foreground_rocks.png'
import foregroundLOrchids from '../assets/layers/foreground_L_orchids.png'
import foregroundROrchids from '../assets/layers/foreground_R_orchids.png'

// Native canvas the layers were segmented from (px).
const CANVAS_W = 1915
const CANVAS_H = 821

// World-unit size of the frame at z = 0.
const REF_W = 10
const REF_H = REF_W * (CANVAS_H / CANVAS_W)

// Camera sits here on the Z axis looking at the origin. Depth (z) of each
// plane is expressed as distance-from-camera, so a plane's world size and
// position both scale by (BASE_DIST - z) / BASE_DIST -- that keeps every
// layer angularly aligned with the flat photo composition when the camera
// is centered, while still being genuinely spaced out in 3-D so the camera
// panning produces real parallax (nearer layers sweep further on screen).
const BASE_DIST = 8

// depth: negative = further from camera (background), positive = closer
// (pops toward the viewer). frame: {x, y, w, h} as fractions 0..1 of the
// segmentation canvas (top-left origin), same as CSS layout would use.
const LAYERS = [
  { tex: sourcePhoto, depth: -3.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: structureWallsVines, depth: -3.0, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: backgroundLightshaft, depth: -2.4, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: mainPoolWater, depth: -1.8, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: waterfallCenter, depth: -1.2, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundRocks, depth: -0.5, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundLOrchids, depth: 0.4, frame: { x: 0 / CANVAS_W, y: 242 / CANVAS_H, w: 219 / CANVAS_W, h: 264 / CANVAS_H } },
  { tex: foregroundROrchids, depth: 0.4, frame: { x: 1519 / CANVAS_W, y: 60 / CANVAS_H, w: 396 / CANVAS_W, h: 341 / CANVAS_H } },
]

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
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

// Every plane is sized to exactly cover the frame at its own depth (see
// frameToWorld), so panning the camera far enough exposes its raw edge --
// nothing is there to render, so the canvas clear color (black) shows
// through. A plane further from the camera is scaled up more (see the
// `scale` formula above) and so has more built-in overhang; the tightest
// fit is whichever full-frame layer sits closest to the camera. Moving
// the camera sideways without rotating shifts the visible window by the
// same world-space amount at every depth, so that single tightest-fit
// layer sets a hard ceiling on how far the camera can ever pan in X/Y
// before something's real edge is exposed, independent of scroll dolly
// (dollying only rescales the view around the still-centered axis).
const EDGE_SAFETY = 0.7 // stay under the true ceiling, don't ride the edge
function computePanLimits() {
  let minCushionX = Infinity
  let minCushionY = Infinity
  for (const layer of LAYERS) {
    if (layer.frame.w !== 1 || layer.frame.h !== 1) continue // partial crops don't need full coverage
    const scale = (BASE_DIST - layer.depth) / BASE_DIST
    minCushionX = Math.min(minCushionX, (REF_W / 2) * (scale - 1))
    minCushionY = Math.min(minCushionY, (REF_H / 2) * (scale - 1))
  }
  return { x: minCushionX * EDGE_SAFETY, y: minCushionY * EDGE_SAFETY }
}
const PAN_LIMIT = computePanLimits()

function Layer({ tex, depth, frame }) {
  const texture = useLoader(TextureLoader, tex)
  texture.colorSpace = SRGBColorSpace
  const { x, y, w, h } = useMemo(() => frameToWorld(frame, depth), [frame, depth])

  return (
    <mesh position={[x, y, depth]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const pointer = useRef({ x: 0, y: 0 })
  const scrollT = useRef(0)

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      scrollT.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useFrame(() => {
    // Deliberately no per-frame lookAt: re-aiming at the origin every
    // frame turns this into an orbit, which cancels out most of the
    // depth-based screen shift near the center of frame. Translating the
    // camera while holding its orientation fixed is what makes near
    // layers sweep further across the screen than far ones -- the actual
    // parallax cue.
    const targetX = clamp(pointer.current.x * PAN_LIMIT.x, -PAN_LIMIT.x, PAN_LIMIT.x)
    const targetY = clamp(-pointer.current.y * PAN_LIMIT.y, -PAN_LIMIT.y, PAN_LIMIT.y)
    const targetZ = BASE_DIST - scrollT.current * 2.2

    camera.position.x += (targetX - camera.position.x) * 0.06
    camera.position.y += (targetY - camera.position.y) * 0.06
    camera.position.z += (targetZ - camera.position.z) * 0.06
  })

  return null
}

export default function CaveScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, BASE_DIST], fov: 30, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <CameraRig />
      {LAYERS.map((layer, i) => (
        <Layer key={i} {...layer} />
      ))}
    </Canvas>
  )
}
