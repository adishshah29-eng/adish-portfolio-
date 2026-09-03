import { useEffect, useState } from 'react'

// Scroll position through the story container, as 0..1. rAF-throttled so
// fast scroll events don't trigger a React re-render per event.
export default function useStoryProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false

    const read = () => {
      const max = document.body.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
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
  }, [])

  return progress
}
