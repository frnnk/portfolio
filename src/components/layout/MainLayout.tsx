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
    <div className="bg-background-dark text-[var(--gray-400)] min-h-screen overflow-x-hidden pt-[50px]">
      <AsciiBackground />
      <HalftoneOverlay />

      <Header />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[110rem] mx-auto flex min-h-[calc(100vh-50px)]">
        <LeftSidebar />
        {/* Spacer reserves room for the fixed sidebar at lg/xl. Dropped at 2xl so
            the content's 2xl:mx-auto centers against the full container (= true
            viewport center) rather than the narrower post-sidebar area. */}
        <div className="w-64 hidden lg:block 2xl:hidden shrink-0" />
        <main className="flex-1 min-w-0 p-4 sm:p-8 md:p-16 relative">
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
