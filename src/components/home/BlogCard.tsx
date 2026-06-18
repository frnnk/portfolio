import { Link } from 'react-router-dom'
import type { Blog } from '../../types'

interface BlogCardProps {
  blog: Blog
  isFirst: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BlogCard({ blog, isFirst }: BlogCardProps) {
  return (
    <Link to={`/blogs/${blog.slug}`} className="block pb-0">
      <article className="data-stream pl-6 group">
        <div
          className={`absolute -left-1 top-0 w-1.5 h-1.5 ${
            isFirst ? 'bg-[var(--gray-600)]' : 'bg-[var(--gray-800)]'
          }`}
        />
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-0.5">
          <h3 className="text-fluid-sm font-medium tracking-normal text-[var(--gray-200)] group-hover:text-white transition-colors">
            {blog.title}
          </h3>
          {blog.categories.map((category) => (
            <span key={category} className="text-fluid-xs text-[var(--gray-600)] tracking-wider">
              [{category}]
            </span>
          ))}
        </div>
        <p className="text-[var(--gray-600)] max-w-lg leading-normal text-fluid-xs">
          {formatDate(blog.date)}
        </p>
      </article>
    </Link>
  )
}
