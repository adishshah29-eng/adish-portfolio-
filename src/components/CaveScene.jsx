import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace, Vector3 } from 'three'

import { SHOTS } from '../scene/shots'
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

// The story camera (see shots.js) swings much further from center than the
// old idle-parallax rig did, to actually reframe on different parts of the
// cave. Layer depths are spaced out further than before so every full-frame
// layer's built-in overhang (see the `scale` formula in frameToWorld) gives
// enough cushion for that travel without exposing a plane's raw edge.
const BASE_DIST = 8

const LAYERS = [
  { tex: sourcePhoto, depth: -5.3, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: structureWallsVines, depth: -4.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: backgroundLightshaft, depth: -3.9, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: mainPoolWater, depth: -3.2, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: waterfallCenter, depth: -2.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundRocks, depth: -1.6, frame: { x: 0, y: 0, w: 1, h: 1 } },
  { tex: foregroundLOrchids, depth: 0.3, frame: { x: 0 / CANVAS_W, y: 242 / CANVAS_H, w: 219 / CANVAS_W, h: 264 / CANVAS_H } },
  { tex: foregroundROrchids, depth: 0.3, frame: { x: 1519 / CANVAS_W, y: 60 / CANVAS_H, w: 396 / CANVAS_W, h: 341 / CANVAS_H } },
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
    </Canvas>
  )
}
