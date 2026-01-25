import { Link } from 'react-router-dom'
import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  isFirst: boolean
}

export function ProjectCard({ project, isFirst }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.slug}`} className="block pb-0">
      <article className="data-stream pl-6 group">
        <div
          className={`absolute -left-1 top-0 w-1.5 h-1.5 ${
            isFirst ? 'bg-[var(--gray-600)]' : 'bg-[var(--gray-800)]'
          }`}
        />
        <h3 className="text-xs font-medium tracking-normal text-[var(--gray-200)] group-hover:text-white transition-colors mb-0.5">
          {project.name}
        </h3>
        <p className="text-[var(--gray-600)] max-w-lg leading-normal text-[11px]">
          {project.description}
        </p>
      </article>
    </Link>
  )
}
