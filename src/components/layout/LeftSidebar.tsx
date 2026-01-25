import { useLocation, useNavigate } from 'react-router-dom'
import { getProjectsByQuarter } from '../../data/projects'

export function LeftSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const quarterGroups = getProjectsByQuarter()

  const scrollToSection = (id: string) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
  }

  const handleProjectClick = (slug: string) => {
    navigate(`/projects/${slug}`)
  }

  return (
    <aside className="w-64 border-r border-white/5 p-8 hidden lg:block fixed top-[50px] left-0 h-[calc(100vh-50px)] overflow-y-auto">
      <div className="mb-10">
        <h2 className="text-[10px] font-bold mb-6 text-[var(--gray-600)] tracking-tighter">
          navigate
        </h2>
        <ul className="space-y-3 text-[11px]">
          <li
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => scrollToSection('about')}
          >
            <span className="text-[var(--gray-800)]">├─</span>
            <span className="text-[var(--highlight)] hover:text-white">about.md</span>
          </li>
          <li
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => scrollToSection('projects')}
          >
            <span className="text-[var(--gray-800)]">├─</span>
            <span className="hover:text-[var(--highlight)]">projects/</span>
          </li>
          {quarterGroups.map((group, groupIndex) => {
            const quarterId = `quarter-${group.quarter.toLowerCase()}-${group.year}`
            const isLastGroup = groupIndex === quarterGroups.length - 1
            return (
              <li key={quarterId} className="pl-4">
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => scrollToSection(quarterId)}
                >
                  <span className="text-[var(--gray-800)]">├─</span>
                  <span className="text-[var(--highlight)] hover:text-white">
                    {group.quarter.toLowerCase()}-{group.year}/
                  </span>
                </div>
                <ul className="pl-4 space-y-2 mt-2">
                  {group.projects.map((project, projectIndex) => {
                    const isLastProject = isLastGroup && projectIndex === group.projects.length - 1
                    return (
                      <li
                        key={project.slug}
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={() => handleProjectClick(project.slug)}
                      >
                        <span className="text-[var(--gray-800)]">
                          {isLastProject ? '└─' : '├─'}
                        </span>
                        <span className="text-[var(--gray-200)] hover:text-[var(--highlight)]">
                          {project.slug}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
          <li
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => scrollToSection('contact')}
          >
            <span className="text-[var(--gray-800)]">└─</span>
            <span className="text-[var(--gray-200)] hover:text-[var(--highlight)]">contact.txt</span>
          </li>
        </ul>
      </div>
    </aside>
  )
}
