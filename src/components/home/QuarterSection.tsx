import type { QuarterGroup } from '../../types'
import { ProjectCard } from './ProjectCard'

interface QuarterSectionProps {
  group: QuarterGroup
  isFirstGroup: boolean
}

export function QuarterSection({ group, isFirstGroup }: QuarterSectionProps) {
  return (
    <div id={`quarter-${group.quarter.toLowerCase()}-${group.year}`} className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-bold text-[var(--gray-600)] tracking-widest">
          {group.quarter} {group.year}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="space-y-5">
        {group.projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            isFirst={isFirstGroup && index === 0}
          />
        ))}
      </div>
    </div>
  )
}
