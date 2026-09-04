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
export default function FogOverlay({ opacity }) {
  return (
    <div
      className="fog-overlay"
      style={{
        opacity,
        visibility: opacity > 0.01 ? 'visible' : 'hidden',
        pointerEvents: opacity > 0.85 ? 'auto' : 'none',
      }}
    >
      <div className="fog-overlay__puff fog-overlay__puff--a" />
      <div className="fog-overlay__puff fog-overlay__puff--b" />
      <div className="fog-overlay__puff fog-overlay__puff--c" />
      <div className="fog-overlay__wash" />
    </div>
  )
}
