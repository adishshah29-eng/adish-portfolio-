import { SHOTS, INTRO_FRACTION } from '../scene/shots'
import './StoryText.css'

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function smoothstep(t) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// Continuous crossfade, no held-at-full-opacity plateau: each shot's text
// peaks exactly at its own scroll position and smoothsteps down to zero by
// the *midpoint* to its neighbor (not the neighbor's own position) --
// fading the whole way there would overlap with the incoming shot's
// fade-in for the second half of that span, and two headings double-
// exposed on top of each other reads as garbled nonsense, not a cinematic
// crossfade. Reaching zero at the midpoint means at most one shot's text
// is ever visible at a time. smoothstep's flat derivative at 0 still keeps
// opacity near 1 for a little while around the peak, so it's not a bare
// linear fade, but nothing here is scroll-locked/held.
const N = SHOTS.length
const SEGMENT = 1 / (N - 1)
const ZERO_DIST = SEGMENT / 2

// shotProgress is clamped flat at 0 for the entire locked-camera intro
// (see remapAfterIntro), so without this, shot 0's heading reads as
// "already arrived" and shows in full right from the first frame --
// simultaneously with AdishName still wiping in. Gate it on raw scroll
// progress instead: nothing shows until the intro's own reveal is done,
// then a brief fade-in of its own rather than an abrupt pop.
const INTRO_GATE_FADE = 0.02

export default function StoryText({ shotProgress, rawProgress, fogOpacity = 0 }) {
  const introGate = smoothstep((rawProgress - INTRO_FRACTION) / INTRO_GATE_FADE)

  return (
    <div className="story-text">
      {SHOTS.map((shot, i) => {
        const shotT = i / (N - 1)
        const dist = Math.abs(shotProgress - shotT)
        const shotOpacity = 1 - smoothstep(dist / ZERO_DIST)
        // The final shot has no heading/body (see shots.js) and sits
        // right where fog rises to fully opaque -- fading every shot's
        // text out as fog comes in keeps the second-to-last shot's own
        // text from lingering, readable, under a half-opaque mist instead
        // of disappearing along with the scene it's describing.
        const opacity = (i === 0 ? shotOpacity * introGate : shotOpacity) * (1 - fogOpacity)
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
