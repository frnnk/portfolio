import { Children, isValidElement } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { LeftSidebar } from './LeftSidebar'
// import { RightSidebar } from './RightSidebar'
import { Footer } from './Footer'
import { HalftoneOverlay } from '../common/HalftoneOverlay'
import { AsciiBackground } from '../common/AsciiBackground'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation()

  return (
    <div className="bg-background-dark text-[var(--gray-400)] min-h-screen overflow-x-hidden">
      <AsciiBackground />
      <HalftoneOverlay />

      <Header />

      <div className="relative z-10 max-w-7xl mx-auto flex min-h-[calc(100vh-50px)]">
        <LeftSidebar />
        <div className="w-64 hidden lg:block shrink-0" /> {/* Spacer for fixed sidebar */}
        <main className="flex-1 p-8 md:p-16 relative">
          {/* key forces a remount on each route so the staggered reveal re-fires */}
          <div key={pathname} className="contents">
            {Children.map(children, (child, i) =>
              isValidElement(child) ? (
                <div
                  className="motion-safe:animate-fade-in-up"
                  style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
                >
                  {child}
                </div>
              ) : (
                child
              )
            )}
          </div>
        </main>
        {/* <RightSidebar /> */}
      </div>

      <Footer />
    </div>
  )
}
