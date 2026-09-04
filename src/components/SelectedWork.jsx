import './SelectedWork.css'

// Placeholder projects -- structure is real, content isn't. Swap these
// for the actual project list (title, blurb, tags, image, link) once
// it's ready; nothing else in the layout needs to change to support it.
const PROJECTS = [
  {
    id: 'project-one',
    title: 'Project One',
    blurb: 'A one-line description of what this project is and the problem it solved.',
    tags: ['Tag A', 'Tag B'],
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

export default function SelectedWork() {
  return (
    <section className="selected-work" id="work">
      <div className="selected-work__intro">
        <h2>Selected Work</h2>
        <p>A few things worth a closer look.</p>
      </div>
      <div className="selected-work__grid">
        {PROJECTS.map((project) => (
          <a key={project.id} className="work-card" href="#work">
            <div className="work-card__image" aria-hidden="true" />
            <h3>{project.title}</h3>
            <p>{project.blurb}</p>
            <div className="work-card__tags">
              {project.tags.map((tag) => (
                <span key={`${project.id}-${tag}`}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
