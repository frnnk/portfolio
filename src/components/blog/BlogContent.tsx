import { Link } from 'react-router-dom'
import type { Blog } from '../../types'
import { Markdown } from '../common/Markdown'

interface BlogContentProps {
  content: string
  prevBlog: Blog | null
  nextBlog: Blog | null
}

export function BlogContent({ content, prevBlog, nextBlog }: BlogContentProps) {
  return (
    <section className="max-w-2xl 2xl:max-w-3xl 2xl:mx-auto">
      <Markdown content={content} />

      <div className="mt-16 pt-8 border-t border-white/5 flex justify-between gap-4 text-fluid-xs">
        {prevBlog ? (
          <Link
            to={`/blogs/${prevBlog.slug}`}
            className="min-w-0 break-words text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors"
          >
            <span className="block text-fluid-2xs text-[var(--gray-800)] mb-1">prev blog</span>
            {prevBlog.title}
          </Link>
        ) : (
          <div />
        )}
        {nextBlog ? (
          <Link
            to={`/blogs/${nextBlog.slug}`}
            className="min-w-0 break-words text-[var(--gray-600)] hover:text-[var(--gray-400)] transition-colors text-right"
          >
            <span className="block text-fluid-2xs text-[var(--gray-800)] mb-1">next blog</span>
            {nextBlog.title}
          </Link>
        ) : (
          <div />
        )}
      </div>
    </section>
  )
}
