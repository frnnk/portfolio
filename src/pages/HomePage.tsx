import { useEffect } from 'react'
import { MainLayout } from '../components/layout/MainLayout'
import { DeveloperIntro } from '../components/home/DeveloperIntro'
import { ProjectSpotlight } from '../components/home/ProjectSpotlight'
import { ProjectManifest } from '../components/home/ProjectManifest'
import { BlogManifest } from '../components/home/BlogManifest'
import { ContactSection } from '../components/home/ContactSection'

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <MainLayout>
      <DeveloperIntro />
      <ProjectSpotlight />
      <ProjectManifest />
      <BlogManifest />
      <ContactSection />
    </MainLayout>
  )
}
