import { getProjectsByQuarter } from '../../data/projects'
import { QuarterSection } from './QuarterSection'

export function ProjectManifest() {
  const quarterGroups = getProjectsByQuarter()

  return (
    <section id="projects" className="max-w-3xl mb-16 relative z-20">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-[11px] text-[var(--gray-600)] font-bold tracking-[0.3em]">
          projects
        </span>
        <div className="h-px w-24 bg-white/10" />
      </div>
      <div className="space-y-10">
        {quarterGroups.map((group, index) => (
          <QuarterSection
            key={`${group.quarter}-${group.year}`}
            group={group}
            isFirstGroup={index === 0}
          />
        ))}
      </div>
    </section>
  )
}
