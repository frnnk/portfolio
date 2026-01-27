import { useParams, Navigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { BlogHeader } from '../components/blog/BlogHeader'
import { BlogContent } from '../components/blog/BlogContent'
import { getBlogBySlug, getAdjacentBlogs } from '../data/blogs'

export function BlogPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <Navigate to="/" replace />
  }

  const blog = getBlogBySlug(slug)

  if (!blog) {
    return <Navigate to="/" replace />
  }

  const { prev, next } = getAdjacentBlogs(slug)

  return (
    <MainLayout>
      <BlogHeader blog={blog} />
      <BlogContent content={blog.content} prevBlog={prev} nextBlog={next} />
    </MainLayout>
  )
}
