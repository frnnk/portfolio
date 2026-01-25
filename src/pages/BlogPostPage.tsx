import { useParams, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { BlogHeader } from '../components/blog/BlogHeader'
import { BlogContent } from '../components/blog/BlogContent'
import { getProjectBySlug, getAdjacentProjects } from '../data/projects'

export function BlogPostPage() {
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
      <BlogHeader project={project} />
      <BlogContent content={project.content} prevProject={prev} nextProject={next} />
    </MainLayout>
  )
}
