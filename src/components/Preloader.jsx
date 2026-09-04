import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import './Preloader.css'

// The cave scene's 25 photo layers add up to a lot of texture weight
// (several run 2-3MB each). Without this, useLoader still blocks the
// canvas from painting anything until they're all in -- but silently:
// what the visitor actually sees is a black rectangle for however long
// that takes, then everything pops in at once with no indication
// anything was happening. useProgress reads Three's own default loading
// manager, which every TextureLoader reports to automatically, so this
// tracks the real download/decode progress rather than a guessed timer.
//
// Lives outside the Canvas -- useProgress is a plain hook backed by a
// module-level store, it doesn't need to be inside the R3F tree.
export default function Preloader() {
  const { progress, active } = useProgress()
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const doneAt = useRef(null)

  useEffect(() => {
    if (!visible) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  useEffect(() => {
    if (active || progress < 100) return undefined
    // Hold on the completed bar for a beat rather than cutting the instant
    // the last byte lands -- 100% flashing by in the same frame it appears
    // reads as a glitch, not a finish.
    if (doneAt.current === null) doneAt.current = Date.now()
    const holdMs = 350
    const elapsed = Date.now() - doneAt.current
    const timer = setTimeout(() => setLeaving(true), Math.max(0, holdMs - elapsed))
    return () => clearTimeout(timer)
  }, [active, progress])

  useEffect(() => {
    if (!leaving) return undefined
    const timer = setTimeout(() => setVisible(false), 700)
    return () => clearTimeout(timer)
  }, [leaving])

  if (!visible) return null

  return (
    <div className={`preloader${leaving ? ' preloader--leaving' : ''}`} aria-hidden={leaving}>
      <div className="preloader__mark">Adish Shah</div>
      <div className="preloader__bar">
        <div className="preloader__bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
      <div className="preloader__count">{Math.floor(Math.min(100, progress))}</div>
    </div>
  )
}
