import './FogOverlay.css'

// A DOM overlay, not a WebGL effect -- volumetric fog done properly in
// Three.js (real particles/raymarched density) is a lot of engineering
// for what's fundamentally a transition effect seen once per visit. A few
// layered, softly blurred radial-gradient "puffs" with independent CSS
// drift animations reads as billowing mist at a fraction of the cost, and
// it sits on its own layer above the canvas so it never has to know
// anything about what's rendered underneath it.
//
// Pointer-events stay off until the fog is nearly opaque, so it doesn't
// swallow mouse-driven camera jitter (CaveScene's pointermove listener)
// while still translucent.

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

// Cream mist (233, 224, 201) at rest, but by the time the overlay is fully
// opaque it's blended almost all the way to Selected Work's own background
// (10, 9, 6). Without this the sequence was "whiteout, then a hard cut to
// black" -- the fog would finish rising and the very next scroll pixel
// snapped straight to the flat section underneath, since position: sticky
// unpins instantly with no crossfade of its own. Darkening the wash itself
// over the same span means the screen is already nearly black by the time
// that cut happens, so it reads as one continuous "mist swallows the
// light" beat instead of two effects stitched together.
const CREAM = [233, 224, 201]
const DARK = [10, 9, 6]

function mix([r1, g1, b1], [r2, g2, b2], t) {
  return `rgb(${r1 + (r2 - r1) * t}, ${g1 + (g2 - g1) * t}, ${b1 + (b2 - b1) * t})`
}

export default function FogOverlay({ opacity }) {
  const darkness = clamp01((opacity - 0.55) / 0.45)
  const washColor = mix(CREAM, DARK, darkness)

  return (
    <div
      className="fog-overlay"
      style={{
        opacity,
        visibility: opacity > 0.01 ? 'visible' : 'hidden',
        pointerEvents: opacity > 0.85 ? 'auto' : 'none',
      }}
    >
      <div className="fog-overlay__puffs" style={{ opacity: 1 - darkness * 0.75 }}>
        <div className="fog-overlay__puff fog-overlay__puff--a" />
        <div className="fog-overlay__puff fog-overlay__puff--b" />
        <div className="fog-overlay__puff fog-overlay__puff--c" />
      </div>
      <div className="fog-overlay__wash" style={{ backgroundColor: washColor }} />
    </div>
  )
}
