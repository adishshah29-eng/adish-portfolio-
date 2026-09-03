import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
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

export default function AdishName({ progress }) {
  const materialRef = useRef()
  const groupRef = useRef()

  useFrame(() => {
    const t = Math.min(1, progress / FADE_END)
    const opacity = 1 - t * t * (3 - 2 * t) // smoothstep fade
    if (materialRef.current) materialRef.current.opacity = opacity
    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.001
      // a faint upward drift as it dissolves, so it reads as receding
      // rather than just blinking out
      groupRef.current.position.y = 0.1 + (1 - opacity) * 0.6
    }
  })

  return (
    <group ref={groupRef}>
      <Text
        position={[-4.1, 0.3, NAME_DEPTH]}
        font={playfairBold}
        fontSize={2.4}
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
