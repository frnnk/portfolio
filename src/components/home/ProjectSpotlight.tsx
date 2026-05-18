import { Link } from 'react-router-dom'
import { getSpotlightProjects, getOverviewSnippet } from '../../data/projects'

export function ProjectSpotlight() {
  const featured = getSpotlightProjects()
  if (featured.length === 0) return null

  return (
    <section id="spotlight" className="max-w-2xl mb-16 relative z-20">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-[11px] text-[var(--gray-600)] font-bold tracking-[0.3em]">
          spotlight
        </span>
        <div className="h-px w-24 bg-white/10" />
      </div>
      <div className="space-y-4">
        {featured.map((project) => {
          const snippet = getOverviewSnippet(project.content)
          return (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="block group"
            >
              <article className="bg-[var(--gray-900)] border border-white/5 rounded-sm px-6 py-5 hover:border-white/10 transition-colors">
                <h3 className="text-sm font-medium text-[var(--gray-200)] group-hover:text-white transition-colors mb-1">
                  {project.name}
                </h3>
                <p className="text-[var(--gray-400)] leading-normal text-[11px] mb-3">
                  {project.description}
                </p>
                <p className="text-[var(--gray-600)] leading-relaxed text-[11px] line-clamp-3 whitespace-pre-line">
                  {snippet}
                </p>
              </article>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
