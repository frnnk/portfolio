import { getBlogsByQuarter } from '../../data/blogs'
import { QuarterSection } from './QuarterSection'
import { BlogCard } from './BlogCard'

export function BlogManifest() {
  const quarterGroups = getBlogsByQuarter()

  return (
    <section id="blogs" className="max-w-3xl mb-16 relative z-20">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-[11px] text-[var(--gray-600)] font-bold tracking-[0.3em]">
          blogs
        </span>
        <div className="h-px w-24 bg-white/10" />
      </div>
      <div className="space-y-10">
        {quarterGroups.map((group, index) => (
          <QuarterSection
            key={`${group.quarter}-${group.year}`}
            quarter={group.quarter}
            year={group.year}
            items={group.blogs}
            renderItem={(blog, isFirst) => (
              <BlogCard key={blog.slug} blog={blog} isFirst={isFirst} />
            )}
            idPrefix="blog-quarter"
            isFirstGroup={index === 0}
          />
        ))}
      </div>
    </section>
  )
}
