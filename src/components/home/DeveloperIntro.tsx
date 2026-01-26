export function DeveloperIntro() {
  return (
    <section id="about" className="max-w-2xl mb-16">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-lg font-bold tracking-tighter text-[var(--highlight)]">
          hi im frank.
        </h1>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="space-y-4 text-sm leading-relaxed font-light text-[var(--gray-400)]">
        <p>
          im a software engineer interested in distributed and ai systems. 
          currently building ai systems where agents talk to MCP servers with human in the loop
          and tracability infra in place
        </p>
      </div>
    </section>
  )
}
