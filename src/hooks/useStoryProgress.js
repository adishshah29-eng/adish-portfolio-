import { useEffect, useState } from 'react'

// Scroll position through the story container, as 0..1. rAF-throttled so
// fast scroll events don't trigger a React re-render per event.
//
// Measures against `containerRef`'s own height, not the whole document.
// The 3D scene used to BE the entire page, so document height and the
// scene's height were the same thing -- but flat sections (Selected Work,
// Contact) now follow it in normal document flow. Without scoping to the
// container, progress would keep climbing while scrolling through THOSE
// sections too, so shotProgress would never actually reach 1 until the
// very bottom of the whole page -- the camera sequence would play in
// slow motion and never finish, and the fog/final-shot timing (tuned
// against shotProgress reaching 1 right as the container ends) would be
// wrong by whatever height the later sections add.
export default function useStoryProgress(containerRef) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const read = () => {
      const el = containerRef.current
      if (!el) return
      const max = el.offsetHeight - window.innerHeight
      const scrollY = window.scrollY - el.offsetTop
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0)
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    read()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [containerRef])

  return progress
}
