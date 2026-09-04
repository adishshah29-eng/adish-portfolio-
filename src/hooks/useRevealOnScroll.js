import { useEffect, useRef, useState } from 'react'

// Whether an element has scrolled into view, once. Used to trigger a
// one-time fade/rise-in on the flat sections after the 3D scene -- those
// sections previously had zero entrance motion (they just appeared fully
// rendered), which reads as static/templated next to how much motion the
// cave scene has. IntersectionObserver instead of a scroll listener: no
// per-frame work, and it's the standard, cheap way to do this without
// pulling in an animation library for one effect.
export default function useRevealOnScroll({ threshold = 0.2 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, visible]
}
