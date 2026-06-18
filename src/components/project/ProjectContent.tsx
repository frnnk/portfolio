import { Link } from 'react-router-dom'
import type { Project } from '../../types'
import { getBlogsByProjectSlug } from '../../data/blogs'
import { Markdown } from '../common/Markdown'

interface ProjectContentProps {
  content: string
  prevProject: Project | null
  nextProject: Project | null
  projectSlug?: string
}

export function ProjectContent({ content, prevProject, nextProject, projectSlug }: ProjectContentProps) {
  const relatedBlogs = projectSlug ? getBlogsByProjectSlug(projectSlug) : []

  return (
    <section className="max-w-2xl 2xl:max-w-3xl 2xl:mx-auto">
      <Markdown content={content} />

      {relatedBlogs.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-[var(--gray-600)] tracking-widest mb-4">
            RELATED BLOGS
          </h3>
          <ul className="space-y-3">
            {relatedBlogs.map((blog) => (
              <li key={blog.slug}>
                <Link
                  to={`/blogs/${blog.slug}`}
                  className="text-[11px] text-[var(--gray-400)] hover:text-[var(--highlight)] transition-colors"
                >
                  {blog.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between text-[10px]">
        {prevProject ? (
          <Link
            to={`/projects/${prevProject.slug}`}
            className="text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors"
          >
            <span className="block text-[8px] text-[var(--gray-800)] mb-1">prev project</span>
            {prevProject.name}
          </Link>
        ) : (
          <div />
        )}
        {nextProject ? (
          <Link
            to={`/projects/${nextProject.slug}`}
            className="text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors text-right"
          >
            <span className="block text-[8px] text-[var(--gray-800)] mb-1">next project</span>
            {nextProject.name}
          </Link>
        ) : (
          <div />
        )}
      </div>
    </section>
  )
}
