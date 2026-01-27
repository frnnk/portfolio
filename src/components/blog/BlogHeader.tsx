import { Link } from 'react-router-dom'
import type { Blog } from '../../types'
import { getProjectBySlug } from '../../data/projects'

interface BlogHeaderProps {
  blog: Blog
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BlogHeader({ blog }: BlogHeaderProps) {
  const linkedProjects = blog.projectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter(Boolean)

  return (
    <section className="max-w-2xl mb-12">
      <Link
        to="/"
        state={{ scrollTo: 'blogs' }}
        className="inline-flex items-center gap-2 text-[10px] text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors mb-8"
      >
        <span>&larr;</span>
        <span>return to blogs</span>
      </Link>

      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-lg font-bold tracking-tighter text-[var(--highlight)]">
          {blog.title}
        </h1>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-[8px] font-bold text-[var(--gray-800)] tracking-widest">
          {formatDate(blog.date)}
        </span>
        <div className="flex gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-[8px] px-2 py-0.5 border border-white/10 text-[var(--gray-600)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {linkedProjects.length > 0 && (
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-[var(--gray-800)]">related projects:</span>
          <div className="flex gap-2">
            {linkedProjects.map((project) => (
              <Link
                key={project!.slug}
                to={`/projects/${project!.slug}`}
                className="text-[var(--highlight)] hover:text-white transition-colors"
              >
                {project!.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
