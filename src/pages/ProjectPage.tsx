import { useParams, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { ProjectHeader } from '../components/project/ProjectHeader'
import { ProjectContent } from '../components/project/ProjectContent'
import { getProjectBySlug, getAdjacentProjects } from '../data/projects'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to="/" replace />
  }

  const project = getProjectBySlug(slug)

  if (!project) {
    return <Navigate to="/" replace />
  }

  const { prev, next } = getAdjacentProjects(slug)

  return (
    <MainLayout>
      <ProjectHeader project={project} />
      <ProjectContent content={project.content} prevProject={prev} nextProject={next} projectSlug={slug} />
    </MainLayout>
  )
}
