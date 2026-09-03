import { SHOTS } from '../scene/shots'
import './StoryText.css'

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function smoothstep(t) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// Each shot's text is fully visible right at its own progress point and
// fades out toward its neighbors -- readable while the camera holds near
// that shot, gone by the time it's mid-pan to the next one.
const N = SHOTS.length
const HALF_WINDOW = (1 / (N - 1)) * 0.55

export default function StoryText({ progress }) {
  return (
    <div className="story-text">
      {SHOTS.map((shot, i) => {
        const shotT = i / (N - 1)
        const dist = Math.abs(progress - shotT)
        const opacity = smoothstep(clamp(1 - dist / HALF_WINDOW, 0, 1))
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
