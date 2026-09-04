import useRevealOnScroll from '../hooks/useRevealOnScroll'
import './SelectedWork.css'

// Real projects, from the resume. One `featured: true`, not four equal
// cards: a row of identical cards is the single most common AI-portfolio
// tell (every section reduces to the same box grid regardless of
// content). VisuallyLearn is the featured slot -- it's the one built and
// shipped independently, with a real usage story (adopted by a coaching
// class), rather than a feature shipped inside someone else's codebase.
const PROJECTS = [
  {
    id: 'visually-learn',
    title: 'VisuallyLearn',
    blurb:
      'A full-stack interactive physics learning platform, with a scraped and cleaned dataset of 10,000+ MCQs powering practice tests. Adopted by a coaching class for student use.',
    tags: ['React', 'Supabase', 'Python'],
    href: 'https://physics-visual-learning.vercel.app',
    featured: true,
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
    id: 'parmar-properties',
    title: 'Parmar Properties',
    blurb:
      'A scroll-animated real estate marketing site built with GSAP and Framer Motion, backed by Supabase as a lightweight CMS for blog content.',
    tags: ['Next.js', 'GSAP'],
    href: 'https://parmar-properties-two.vercel.app',
  },
  {
    id: 'djs-astra',
    title: 'DJS ASTRA',
    blurb:
      "The official site for DJSCE's combat robotics team, paired with a Python email pipeline automating sponsorship outreach.",
    tags: ['Team site', 'Python automation'],
    href: 'https://djs-astra.vercel.app',
  },
]

function WorkCard({ project, index }) {
  const [ref, visible] = useRevealOnScroll()
  return (
    <a
      ref={ref}
      className={`work-card${project.featured ? ' work-card--featured' : ''}${visible ? ' is-visible' : ''}`}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="work-card__image" aria-hidden="true">
        <div className="work-card__image-fill" />
      </div>
      <div className="work-card__body">
        <h3>{project.title}</h3>
        <p>{project.blurb}</p>
        <div className="work-card__tags">
          {project.tags.map((tag) => (
            <span key={`${project.id}-${tag}`}>{tag}</span>
          ))}
        </div>
      </div>
    </a>
  )
}

export default function SelectedWork() {
  const [introRef, introVisible] = useRevealOnScroll()
  const featured = PROJECTS.find((p) => p.featured)
  const rest = PROJECTS.filter((p) => !p.featured)

  return (
    <section className="selected-work" id="work">
      <div ref={introRef} className={`selected-work__intro${introVisible ? ' is-visible' : ''}`}>
        <h2>Selected Work</h2>
        <p>A few things worth a closer look.</p>
      </div>
      <div className="selected-work__grid">
        {featured && <WorkCard project={featured} index={0} />}
        <div className="selected-work__secondary">
          {rest.map((project, i) => (
            <WorkCard key={project.id} project={project} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
