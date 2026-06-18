import { Link } from 'react-router-dom'
import { getSpotlightItems } from '../../data/spotlight'

export function ProjectSpotlight() {
  const items = getSpotlightItems()
  if (items.length === 0) return null

  return (
    <section id="spotlight" className="max-w-2xl 2xl:mx-auto mb-16 relative z-20">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-fluid-xs text-[var(--gray-600)] font-bold tracking-[0.3em]">
          spotlight
        </span>
        <div className="h-px w-24 bg-white/10" />
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={`${item.kind}-${item.slug}`}
            to={item.href}
            className="block group"
          >
            <article className="bg-[var(--gray-900)] border border-white/5 rounded-sm px-6 py-5 hover:border-white/10 transition-colors">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-fluid-base font-medium text-[var(--gray-200)] group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <span className="text-fluid-xs text-[var(--gray-600)] tracking-wider">
                  [{item.kind}]
                </span>
              </div>
              {item.subtitle && (
                <p className="text-[var(--gray-400)] leading-normal text-fluid-xs mb-3">
                  {item.subtitle}
                </p>
              )}
              <p className="text-[var(--gray-600)] leading-relaxed text-fluid-xs line-clamp-3 whitespace-pre-line">
                {item.snippet}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
