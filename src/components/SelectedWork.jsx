import useRevealOnScroll from '../hooks/useRevealOnScroll'
import './SelectedWork.css'

// Placeholder projects -- structure is real, content isn't. Swap these
// for the actual project list (title, blurb, tags, image, link) once
// it's ready; nothing else in the layout needs to change to support it.
//
// One `featured: true` project, not three equal ones: a row of three
// identical cards is the single most common AI-portfolio tell (every
// section reduces to the same three-box grid regardless of content).
// One large featured slot plus two smaller ones also degrades better --
// it still holds up with 2 projects or 5, where a fixed 3-up grid
// doesn't.
const PROJECTS = [
  {
    id: 'project-one',
    title: 'Project One',
    blurb: 'A short description of what this project is and the specific problem it solved.',
    tags: ['Tag A', 'Tag B'],
    featured: true,
  },
  {
    id: 'project-two',
    title: 'Project Two',
    blurb: 'A one-line description of what this project is and the problem it solved.',
    tags: ['Tag A', 'Tag B'],
  },
  {
    id: 'project-three',
    title: 'Project Three',
    blurb: 'A one-line description of what this project is and the problem it solved.',
    tags: ['Tag A', 'Tag B'],
  },
]

function WorkCard({ project, index }) {
  const [ref, visible] = useRevealOnScroll()
  return (
    <a
      ref={ref}
      className={`work-card${project.featured ? ' work-card--featured' : ''}${visible ? ' is-visible' : ''}`}
      href="#work"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="work-card__image" aria-hidden="true" />
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
