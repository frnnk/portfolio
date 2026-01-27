import { Header } from './Header'
import { LeftSidebar } from './LeftSidebar'
// import { RightSidebar } from './RightSidebar'
import { Footer } from './Footer'
import { HalftoneOverlay } from '../common/HalftoneOverlay'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-background-dark text-[var(--gray-400)] min-h-screen overflow-x-hidden">
      <HalftoneOverlay />

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto flex min-h-[calc(100vh-50px)]">
        <LeftSidebar />
        <div className="w-64 hidden lg:block shrink-0" /> {/* Spacer for fixed sidebar */}
        <main className="flex-1 p-8 md:p-16 relative">
          {children}
        </main>
        {/* <RightSidebar /> */}
      </div>

      <Footer />
    </div>
  )
}
