import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import playfairBold from '../assets/fonts/playfair-display-700.ttf'

// Depth chosen so this sits genuinely *inside* the layer stack rather than
// on top of it: behind waterfallCenter (-2.6) and foregroundRocks (-1.6),
// so the falling water and foreground rock silhouette pass in front of the
// letters, but in front of backgroundLightshaft/structure/backdrop
// (-3.9/-4.6/-5.3), so the cave wall reads behind it. That's what makes it
// a real sandwich instead of a flat overlay.
const NAME_DEPTH = -3.0

// Fully visible only in the first sliver of scroll, then gone -- a title
// card, not a persistent element competing with the chapter text.
const FADE_END = 0.07

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
const DESKTOP = { fontSize: 2.4, x: -4.1, y: 0.3 }
const MOBILE = { fontSize: 0.85, x: -1.15, y: 0.5 }

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export default function AdishName({ progress }) {
  const materialRef = useRef()
  const groupRef = useRef()
  const { size } = useThree()

  const aspect = size.width / size.height
  const t = clamp01((aspect - MOBILE_ASPECT) / (DESKTOP_ASPECT - MOBILE_ASPECT))
  const fontSize = lerp(MOBILE.fontSize, DESKTOP.fontSize, t)
  const x = lerp(MOBILE.x, DESKTOP.x, t)
  const y = lerp(MOBILE.y, DESKTOP.y, t)

  useFrame(() => {
    const ft = Math.min(1, progress / FADE_END)
    const opacity = 1 - ft * ft * (3 - 2 * ft) // smoothstep fade
    if (materialRef.current) materialRef.current.opacity = opacity
    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.001
      // a faint upward drift as it dissolves, so it reads as receding
      // rather than just blinking out
      groupRef.current.position.y = y + (1 - opacity) * 0.6
    }
  })

  return (
    <group ref={groupRef}>
      <Text
        position={[x, y, NAME_DEPTH]}
        font={playfairBold}
        fontSize={fontSize}
        letterSpacing={0.02}
        color="#f4ead8"
        anchorX="center"
        anchorY="middle"
      >
        Adish
        <meshBasicMaterial ref={materialRef} transparent depthWrite={false} color="#f4ead8" toneMapped={false} />
      </Text>
    </group>
  )
}
