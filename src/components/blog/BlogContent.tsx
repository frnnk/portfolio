import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import type { Project } from '../../types'

interface BlogContentProps {
  content: string
  prevProject: Project | null
  nextProject: Project | null
}

export function BlogContent({ content, prevProject, nextProject }: BlogContentProps) {
  return (
    <section className="max-w-2xl">
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:text-[var(--gray-200)] prose-headings:font-bold prose-headings:tracking-wider
        prose-h2:text-[11px] prose-h2:mb-4 prose-h2:mt-8
        prose-h3:text-[10px] prose-h3:mb-3 prose-h3:mt-6
        prose-p:text-[var(--gray-400)] prose-p:font-light prose-p:leading-relaxed prose-p:text-sm
        prose-strong:text-[var(--highlight)] prose-strong:font-medium
        prose-ul:space-y-2 prose-ul:my-4
        prose-li:text-[var(--gray-400)] prose-li:font-light prose-li:text-sm prose-li:pl-4 prose-li:border-l prose-li:border-white/5
        prose-code:text-[var(--highlight)] prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
        prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded
        prose-a:text-[var(--highlight)] prose-a:no-underline hover:prose-a:underline
      ">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

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
