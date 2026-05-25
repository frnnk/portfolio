import { Clock } from '../common/Clock'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/5 py-4 px-8 flex justify-between items-center text-[10px] tracking-widest bg-black/60 backdrop-blur-md">
      <div className="flex gap-6">
        <span className="text-[var(--gray-200)] opacity-60"></span>
      </div>
      <div className="flex gap-4 opacity-40">
        <Clock />
      </div>
    </header>
  )
}
