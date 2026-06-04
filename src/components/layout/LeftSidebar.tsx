import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProjectsByQuarter } from '../../data/projects'
import { getBlogsByQuarter } from '../../data/blogs'

export function LeftSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const projectQuarterGroups = getProjectsByQuarter()
  const blogQuarterGroups = getBlogsByQuarter()
  const [openSections, setOpenSections] = useState(() => ({
    projects: location.pathname.startsWith('/projects/'),
    blogs: location.pathname.startsWith('/blogs/'),
  }))

  useEffect(() => {
    if (location.pathname.startsWith('/projects/')) {
      setOpenSections((s) => ({ ...s, projects: true }))
    } else if (location.pathname.startsWith('/blogs/')) {
      setOpenSections((s) => ({ ...s, blogs: true }))
    }
  }, [location.pathname])

  const scrollToSection = (id: string) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const handleProjectClick = (slug: string) => {
    navigate(`/projects/${slug}`)
  }

  const handleBlogClick = (slug: string) => {
    navigate(`/blogs/${slug}`)
  }

  return (
    <aside className="w-64 border-r border-white/5 p-8 hidden lg:block fixed top-[50px] left-0 h-[calc(100vh-50px)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <li>
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => {
                if (openSections.projects) {
                  setOpenSections((s) => ({ ...s, projects: false }))
                } else {
                  setOpenSections((s) => ({ ...s, projects: true }))
                  scrollToSection('projects')
                }
              }}
            >
              <span className="text-[var(--gray-800)]">├─</span>
              <span className="text-[var(--highlight)] hover:text-white">projects/</span>
            </div>
            <div
              id="nav-projects"
              className={`grid motion-safe:transition-[grid-template-rows] duration-200 ease-out ${
                openSections.projects ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
              <ul className="space-y-3 pt-3">
                {projectQuarterGroups.map((group) => {
                const quarterId = `quarter-${group.quarter.toLowerCase()}-${group.year}`
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
                        const isLastProject = projectIndex === group.projects.length - 1
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
              </ul>
              </div>
            </div>
          </li>
          <li>
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => {
                if (openSections.blogs) {
                  setOpenSections((s) => ({ ...s, blogs: false }))
                } else {
                  setOpenSections((s) => ({ ...s, blogs: true }))
                  scrollToSection('blogs')
                }
              }}
            >
              <span className="text-[var(--gray-800)]">├─</span>
              <span className="text-[var(--highlight)] hover:text-white">blogs/</span>
            </div>
            <div
              id="nav-blogs"
              className={`grid motion-safe:transition-[grid-template-rows] duration-200 ease-out ${
                openSections.blogs ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
              <ul className="space-y-3 pt-3">
                {blogQuarterGroups.map((group) => {
                  const quarterId = `blog-quarter-${group.quarter.toLowerCase()}-${group.year}`
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
                        {group.blogs.map((blog, blogIndex) => {
                          const isLastBlog = blogIndex === group.blogs.length - 1
                          return (
                            <li
                              key={blog.slug}
                              className="flex items-center gap-2 group cursor-pointer"
                              onClick={() => handleBlogClick(blog.slug)}
                            >
                              <span className="text-[var(--gray-800)]">
                                {isLastBlog ? '└─' : '├─'}
                              </span>
                              <span className="text-[var(--gray-200)] hover:text-[var(--highlight)]">
                                {blog.slug}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
              </div>
            </div>
          </li>
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
