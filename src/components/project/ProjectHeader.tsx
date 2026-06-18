import { Link } from 'react-router-dom'
import type { Project } from '../../types'

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <section className="max-w-2xl 2xl:max-w-3xl 2xl:mx-auto mb-12">
      <Link
        to="/"
        state={{ scrollTo: 'projects' }}
        className="inline-flex items-center gap-2 text-fluid-xs text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors mb-8"
      >
        <span>&larr;</span>
        <span>return to projects</span>
      </Link>

      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-fluid-lg font-bold tracking-tighter text-[var(--highlight)]">
          {project.name}
        </h1>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fluid-xs text-[var(--gray-600)] hover:text-[var(--highlight)] transition-colors"
          >
            [github]
          </a>
        )}
        {project.pdf && (
          <a
            href={project.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fluid-xs text-[var(--gray-600)] hover:text-[var(--highlight)] transition-colors"
          >
            [pdf]
          </a>
        )}
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-fluid-2xs font-bold text-[var(--gray-800)] tracking-widest">
          {project.quarter} {project.year}
        </span>
        <div className="flex gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-fluid-2xs px-2 py-0.5 border border-white/10 text-[var(--gray-600)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="text-fluid-base leading-relaxed font-light text-[var(--gray-400)]">
        {project.description}
      </p>
    </section>
  )
}
