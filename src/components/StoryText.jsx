import { SHOTS, DWELL_FRACTION, INTRO_FRACTION } from '../scene/shots'
import './StoryText.css'

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function smoothstep(t) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// Mirrors CaveScene's dwellRemap: text is fully opaque while the camera is
// fully held on its shot (within DWELL_FRACTION of a segment on either
// side), then fades out through the transition window. Critically, each
// shot's text reaches zero by the *midpoint* between it and its neighbor
// (not at the neighbor's own dwell boundary) -- fading the whole way there
// would overlap with the incoming shot's fade-in for the second half of
// the transition, and two headings double-exposed on top of each other
// reads as garbled nonsense, not a cinematic crossfade. Reaching zero at
// the midpoint means at most one shot's text is ever visible at a time.
const N = SHOTS.length
const SEGMENT = 1 / (N - 1)
const FULL_DIST = DWELL_FRACTION * SEGMENT
const ZERO_DIST = SEGMENT / 2

// shotProgress is clamped flat at 0 for the entire locked-camera intro
// (see remapAfterIntro), so without this, shot 0's heading reads as
// "already arrived" and shows in full right from the first frame --
// simultaneously with AdishName still wiping in. Gate it on raw scroll
// progress instead: nothing shows until the intro's own reveal is done,
// then a brief fade-in of its own rather than an abrupt pop.
const INTRO_GATE_FADE = 0.02

export default function StoryText({ shotProgress, rawProgress }) {
  const introGate = smoothstep((rawProgress - INTRO_FRACTION) / INTRO_GATE_FADE)

  return (
    <div className="story-text">
      {SHOTS.map((shot, i) => {
        const shotT = i / (N - 1)
        const dist = Math.abs(shotProgress - shotT)
        const shotOpacity = 1 - smoothstep((dist - FULL_DIST) / (ZERO_DIST - FULL_DIST))
        const opacity = i === 0 ? shotOpacity * introGate : shotOpacity
        return (
          <div
            key={shot.id}
            className="story-text__block"
            style={{ opacity, visibility: opacity > 0.01 ? 'visible' : 'hidden' }}
          >
            <h1>{shot.heading}</h1>
            <p>{shot.body}</p>
          </div>
        )
      })}
    </div>
  )
}
