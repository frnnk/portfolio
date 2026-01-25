export function RightSidebar() {
  return (
    <aside className="w-16 border-l border-white/5 hidden xl:flex flex-col items-center py-8 gap-12">
      <div className="rotate-90 origin-center whitespace-nowrap text-[8px] text-[var(--gray-800)] font-bold tracking-[0.5em]">
        NAV_INDEX_STATUS
      </div>
      <div className="h-32 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      <div className="flex flex-col gap-3">
        <div className="w-1.5 h-1.5 border border-white/10" />
        <div className="w-1.5 h-1.5 border border-white/10" />
        <div className="w-1.5 h-1.5 bg-[var(--gray-600)]" />
        <div className="w-1.5 h-1.5 border border-white/10" />
      </div>
    </aside>
  )
}
