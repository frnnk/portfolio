import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { DeveloperIntro } from '../components/home/DeveloperIntro'
import { ProjectManifest } from '../components/home/ProjectManifest'
import { ContactSection } from '../components/home/ContactSection'

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null
    if (state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(state.scrollTo!)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate])

  return (
    <MainLayout>
      <DeveloperIntro />
      <ProjectManifest />
      <ContactSection />
    </MainLayout>
  )
}
