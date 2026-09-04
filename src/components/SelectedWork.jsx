import { useRef, useState } from 'react'
import useRevealOnScroll from '../hooks/useRevealOnScroll'
import './SelectedWork.css'

// Real projects. Order matters: Parmar Properties is explicitly the
// strongest work and stays the default-active (centered) card rather
// than something the carousel might drift away from -- there's no
// autoplay, so "always displayed" just means it's where the carousel
// rests until someone navigates it elsewhere.
//
// Blurbs for VisuallyLearn, Resunova, and DJS ASTRA come straight from
// the resume. The rest (Grece, its walkthrough, Bike Marketplace, Meta
// CRM, Interior Design, DJS Code AI) only came with a name and a URL --
// their blurbs stay deliberately minimal rather than inventing specifics
// (a tech stack, an outcome, a feature list) that were never provided.
const PROJECTS = [
  {
    id: 'parmar-properties',
    title: 'Parmar Properties',
    blurb:
      'A scroll-animated real estate marketing site built with GSAP and Framer Motion, backed by Supabase as a lightweight CMS for blog content.',
    tags: ['Next.js', 'GSAP'],
    href: 'https://parmarproperties.in',
  },
  {
    id: 'resunova',
    title: 'Resunova',
    blurb:
      'An AI-powered resume tailoring and job-matching platform. Shipped UI/UX improvements and a new CV builder tool as part of the engineering team.',
    tags: ['Next.js', 'Full Stack'],
    href: 'https://resunova.io',
  },
  {
    id: 'grece',
    title: 'Grece',
    blurb: 'A client site best viewed on desktop.',
    tags: [],
    href: 'https://grece-henna.vercel.app',
  },
  {
    id: 'grece-walkthrough',
    title: 'Grece — 3D Walkthrough',
    blurb: 'An interactive 3D walkthrough built for the Grece site.',
    tags: [],
    href: 'https://grece-henna.vercel.app/walkthrough',
  },
  {
    id: 'bike-marketplace',
    title: 'Bike Marketplace',
    blurb: 'A marketplace platform for buying and selling bikes.',
    tags: [],
    href: 'https://bike-three-theta.vercel.app',
  },
  {
    id: 'meta-crm',
    title: 'Meta CRM Dashboard',
    blurb: 'A CRM dashboard for managing leads and campaigns.',
    tags: [],
    href: 'https://meta-crm-phi.vercel.app/dashboard',
  },
  {
    id: 'interior-design',
    title: 'Interior Design',
    blurb: 'An interior design studio’s portfolio site.',
    tags: [],
    href: 'https://interior-designer-two-omega.vercel.app',
  },
  {
    id: 'djs-astra',
    title: 'DJS ASTRA',
    blurb:
      "The official site for DJSCE's combat robotics team, paired with a Python email pipeline automating sponsorship outreach.",
    tags: ['Team site', 'Python automation'],
    href: 'https://djs-astra.vercel.app',
  },
  {
    id: 'djs-code-ai',
    title: 'DJS Code AI',
    blurb: 'A DJSCE project.',
    tags: [],
    href: 'https://djscodeai.vercel.app',
  },
]

// Shortest-path offset from the active card, wrapped around the ends of
// the list -- without this, going from card 0 to the last card would
// swing the whole carousel the long way around instead of stepping one
// place to the left.
function wrappedOffset(index, active, length) {
  let offset = index - active
  if (offset > length / 2) offset -= length
  if (offset < -length / 2) offset += length
  return offset
}

function ChevronIcon({ direction }) {
  const d = direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function CarouselCard({ project, offset, isActive, onActivate, dragState }) {
  const abs = Math.abs(offset)
  const translateX = offset * 74
  const translateZ = -abs * 170
  const rotateY = offset * -32
  const scale = Math.max(0.42, 1 - abs * 0.15)
  const opacity = Math.max(0.12, 1 - abs * 0.32)

  const handleClick = (e) => {
    // A mouseup/pointerup ending on the same element as mousedown still
    // fires a native "click" right after, regardless of preventDefault()
    // on the pointer event -- that suppression only applies to touch
    // input, not mouse. Without this check, a drag ending back over its
    // starting (now-inactive) card fires this handler a moment later,
    // reading the leftover click as "activate this card" and undoing
    // the drag that just happened.
    if (dragState.current.justDragged) {
      e.preventDefault()
      return
    }
    if (!isActive) {
      e.preventDefault()
      onActivate()
    }
  }

  return (
    <a
      className={`work-card${isActive ? ' is-active' : ''}`}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onClick={handleClick}
      tabIndex={isActive ? 0 : -1}
      aria-hidden={abs > 1.5}
      style={{
        transform: `translate(-50%, -50%) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity,
        zIndex: 100 - Math.round(abs * 10),
        // Only the front-most few cards are meaningfully clickable/visible.
        // Cards further back are heavily scaled and translated far
        // sideways, but their untransformed layout box can still overlap
        // screen regions (like the nav buttons) that their tiny, faint
        // visible sliver doesn't actually reach -- cutting pointer events
        // off well before the low-opacity tail avoids stealing clicks
        // meant for something else.
        pointerEvents: abs > 1.5 ? 'none' : 'auto',
      }}
    >
      <div className="work-card__image" aria-hidden="true">
        <div className="work-card__image-fill" />
      </div>
      {/* Title/blurb/tags only ever show for the active card. Earlier
          this rendered for every card at reduced opacity, but at the
          spacing a 3D coverflow actually needs, neighboring cards'
          text blocks overlapped the active card's -- multiple project
          titles and blurbs all legible at once, fighting for the same
          screen space. Every real coverflow (Apple's original included)
          shows metadata for the centered item only; side items are just
          image. Kept in the DOM (not conditionally rendered) so it's
          still there for search engines and screen readers, just
          visually suppressed. */}
      <div className="work-card__body">
        <h3>{project.title}</h3>
        <p>{project.blurb}</p>
        {project.tags.length > 0 && (
          <div className="work-card__tags">
            {project.tags.map((tag) => (
              <span key={`${project.id}-${tag}`}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}

export default function SelectedWork() {
  const [introRef, introVisible] = useRevealOnScroll()
  const [carouselRef, carouselVisible] = useRevealOnScroll({ threshold: 0.1 })
  const [active, setActive] = useState(0)
  const dragState = useRef({ startX: 0, dragging: false, justDragged: false })

  const go = (i) => setActive(((i % PROJECTS.length) + PROJECTS.length) % PROJECTS.length)
  const next = () => go(active + 1)
  const prev = () => go(active - 1)

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    }
  }

  const handlePointerDown = (e) => {
    dragState.current = { startX: e.clientX, dragging: true }
  }

  const handlePointerUp = (e) => {
    if (!dragState.current.dragging) return
    dragState.current.dragging = false
    const dx = e.clientX - dragState.current.startX
    // Flag any real movement (not just movement past the nav threshold)
    // so CarouselCard's own click handler can recognize and swallow the
    // native "click" that still fires right after this, on whichever
    // card the pointer happened to end over -- see the comment there.
    // Cleared shortly after: long enough to catch that one ghost click,
    // short enough to never affect an intentional next click.
    if (Math.abs(dx) > 8) {
      dragState.current.justDragged = true
      setTimeout(() => {
        dragState.current.justDragged = false
      }, 300)
    }
    const NAV_THRESHOLD = 40
    if (dx > NAV_THRESHOLD) prev()
    else if (dx < -NAV_THRESHOLD) next()
  }

  return (
    <section className="selected-work" id="work">
      <div ref={introRef} className={`selected-work__intro${introVisible ? ' is-visible' : ''}`}>
        <h2>Selected Work</h2>
        <p>A few things worth a closer look.</p>
      </div>

      <div ref={carouselRef} className={`selected-work__carousel-wrap${carouselVisible ? ' is-visible' : ''}`}>
        <div className="work-carousel">
          <button type="button" className="work-carousel__nav work-carousel__nav--prev" onClick={prev} aria-label="Previous project">
            <ChevronIcon direction="left" />
          </button>

          <div
            className="work-carousel__viewport"
            tabIndex={0}
            role="group"
            aria-label="Selected work carousel"
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div className="work-carousel__track">
              {PROJECTS.map((project, i) => (
                <CarouselCard
                  key={project.id}
                  project={project}
                  offset={wrappedOffset(i, active, PROJECTS.length)}
                  isActive={i === active}
                  dragState={dragState}
                  onActivate={() => go(i)}
                />
              ))}
            </div>
          </div>

          <button type="button" className="work-carousel__nav work-carousel__nav--next" onClick={next} aria-label="Next project">
            <ChevronIcon direction="right" />
          </button>
        </div>

        <div className="work-carousel__dots" role="tablist" aria-label="Choose a project">
          {PROJECTS.map((project, i) => (
            <button
              key={project.id}
              type="button"
              className={`work-carousel__dot${i === active ? ' is-active' : ''}`}
              role="tab"
              aria-selected={i === active}
              aria-label={`Show ${project.title}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
