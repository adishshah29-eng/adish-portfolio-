import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { INTRO_FRACTION } from '../scene/shots'
import playfairBold from '../assets/fonts/playfair-display-700.ttf'

const TEXT = 'Adish Portfolio'

// Depth chosen to sit in FRONT of waterfallCenter (-2.6) and
// foregroundRocks (-1.6) rather than behind them, but still behind
// foregroundLOrchids/foregroundROrchids (0.3) so those keep crossing over
// the letters. The original "sandwich" design put this behind those two
// layers instead -- but they're full-frame transparent PNGs rendered with
// depthWrite disabled, so being behind them doesn't occlude by their
// silhouette, it occludes by transparent-sort order across their *entire*
// plane: anything further back that falls inside that plane's world-space
// footprint gets cut with a hard, non-silhouette edge, regardless of
// whether that specific spot in the PNG is visually transparent. That's a
// fixed WORLD-SPACE boundary, so it bit both desktop and mobile alike (on
// mobile's much narrower frustum, the boundary ate almost the entire
// visible width, cutting the word after just "A"). Sitting in front of
// both layers removes that whole class of bug instead of chasing a safe
// x-position per aspect ratio.
const NAME_DEPTH = -1.5

// Reveal sweeps across the whole INTRO_FRACTION (shots.js) -- the camera is
// hard-locked at shot 0 for exactly that long (see remapAfterIntro), so
// "letters finish appearing" and "camera is now free to move" are the same
// instant by construction, not two timings that happen to be tuned close.
// After that, hold briefly, then dissolve as the shot sequence gets moving.
// Kept short on purpose: now that the shot sequence has no dwell/hold of
// its own (see shots.js), shot 1's heading starts crossfading in almost
// immediately once the camera is free to move, so this needs to fully
// clear before that -- a longer hold here used to be safe only because
// the old dwell zone kept shot 1 from appearing for a while regardless.
const HOLD_FRACTION = 0.02
const FADE_FRACTION = 0.04

// How many characters' worth of transition each letter takes to fade in,
// as the reveal front passes it -- a soft cascade rather than a hard
// per-letter on/off pop.
const REVEAL_WINDOW_CHARS = 1.4

// Desktop values (tuned by eye against a ~1.78 aspect: left of the busy
// central arch, sized so only the orchid cluster crosses it) and mobile
// values (tuned against a narrow phone aspect: smaller and closer to
// center, since CaveScene's ResponsiveCameraFov only partially widens the
// frustum on narrow screens -- text isn't a finite photo plane with an
// edge-exposure risk like the layers, so it can just scale directly with
// aspect instead of needing that cushion-based clamping). Interpolated
// between the two by the live aspect ratio rather than picking one.
const DESKTOP_ASPECT = 1600 / 900
const MOBILE_ASPECT = 0.5
const DESKTOP = { fontSize: 0.68, x: -2.1, y: 0.3 }
const MOBILE = { fontSize: 0.32, x: -0.85, y: 1.1 }

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function smoothstep(t) {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

// Mirrors useStoryProgress's scroll->0..1 math exactly, but read directly
// inside the WebGL frame loop instead of via a React prop. AdishName used
// to take `progress` as a prop from CaveScene, but its internal `layout`
// state (set from troika's async onSync callback, firing outside React's
// normal batching) put it on a divergent re-render path: once that fired,
// this component stopped picking up new props from its parent entirely --
// confirmed by logging the prop on every render, which froze at whatever
// value it had at that moment and never changed again, even though the
// parent kept re-rendering with fresh numbers and CameraRig (a sibling
// using the identical prop-drilling pattern) tracked scroll correctly the
// whole time. Reading scroll state directly here, every frame, sidesteps
// that reconciliation issue rather than chasing its root cause further.
function readScrollProgress() {
  const max = document.body.scrollHeight - window.innerHeight
  return max > 0 ? clamp01(window.scrollY / max) : 0
}

// A single character, positioned by troika's own caret data (real glyph
// metrics/kerning, not a hand-estimated per-char width) rather than as a
// slice of one clipped mesh. Real per-character reveal turned out to need
// this: troika-three-text's `clipRect` is meant to be driven by direct
// per-frame assignment on the mesh instance (confirmed by reading its
// source -- it's not in the SYNCABLE_PROPS list that trigger a real
// re-sync), but even doing that, the rendered glyphs stayed visually stuck
// mid-reveal despite the computed clip value provably updating correctly
// every frame -- instrumented enough to rule out a logic bug on this end.
// Per-character opacity has none of that: it's the same plain
// material.opacity control already proven reliable for the whole-word
// fade-out below.
//
// `materialRef` is the parent's plain ref-box ({current: null}), passed
// straight through as the material's own `ref` -- not copied into a
// second, locally-created ref. An earlier version created its own
// `useRef()` here and pointed the parent's box *at that ref object*
// instead of at the material, so the parent's useFrame loop was setting
// `.opacity` on a React ref wrapper, not the Three.js material -- a
// silent no-op that left every glyph at its construction-time default
// opacity (1, fully visible) no matter what the reveal math computed.
function Char({ char, x, y, fontSize, materialRef }) {
  return (
    <Text
      position={[x, y, NAME_DEPTH]}
      font={playfairBold}
      fontSize={fontSize}
      letterSpacing={0.02}
      color="#f4ead8"
      anchorX="left"
      anchorY="middle"
    >
      {char}
      <meshBasicMaterial ref={materialRef} transparent depthWrite={false} color="#f4ead8" toneMapped={false} />
    </Text>
  )
}

export default function AdishName() {
  const groupRef = useRef()
  const charOpacityRefs = useRef([]).current
  const [layout, setLayout] = useState(null) // { caretPositions }
  const { size } = useThree()

  const aspect = size.width / size.height
  const t = clamp01((aspect - MOBILE_ASPECT) / (DESKTOP_ASPECT - MOBILE_ASPECT))
  const fontSize = lerp(MOBILE.fontSize, DESKTOP.fontSize, t)
  const x = lerp(MOBILE.x, DESKTOP.x, t)
  const y = lerp(MOBILE.y, DESKTOP.y, t)

  useFrame(() => {
    const p = readScrollProgress()
    const introT = clamp01(p / INTRO_FRACTION)

    const fadeStart = INTRO_FRACTION + HOLD_FRACTION
    const fadeT = clamp01((p - fadeStart) / FADE_FRACTION)
    const fadeOutOpacity = 1 - smoothstep(fadeT)

    const totalChars = TEXT.length
    for (let i = 0; i < totalChars; i++) {
      const charFront = introT * totalChars - i
      const revealOpacity = smoothstep(charFront / REVEAL_WINDOW_CHARS)
      const mat = charOpacityRefs[i]?.current
      if (mat) mat.opacity = revealOpacity * fadeOutOpacity
    }

    if (groupRef.current) {
      groupRef.current.visible = fadeOutOpacity > 0.001
      // a faint upward drift as it dissolves, so it reads as receding
      // rather than just blinking out -- each Char already carries the
      // base `y` itself, so the group only ever holds the drift delta,
      // not to double up on top of that base.
      groupRef.current.position.y = (1 - fadeOutOpacity) * 0.6
    }
  })

  return (
    <group ref={groupRef}>
      {!layout && (
        <Text
          font={playfairBold}
          fontSize={1}
          letterSpacing={0.02}
          anchorX="center"
          anchorY="middle"
          visible={false}
          onSync={(troikaMesh) => {
            const info = troikaMesh.textRenderInfo
            if (info?.caretPositions) {
              setLayout({ caretPositions: info.caretPositions })
            }
          }}
        >
          {TEXT}
        </Text>
      )}
      {layout &&
        TEXT.split('').map((char, i) => {
          if (!charOpacityRefs[i]) charOpacityRefs[i] = { current: null }
          if (char === ' ') return null
          const startX = layout.caretPositions[i * 4]
          return (
            <Char
              key={i}
              char={char}
              x={x + startX * fontSize}
              y={y}
              fontSize={fontSize}
              materialRef={charOpacityRefs[i]}
            />
          )
        })}
    </group>
  )
}
