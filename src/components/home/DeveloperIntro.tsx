export function DeveloperIntro() {
  return (
    <section id="about" className="max-w-2xl mb-16">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-lg font-bold tracking-tighter text-[var(--highlight)]">
          frank liu.
        </h1>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="space-y-4 text-sm leading-relaxed font-light text-[var(--gray-400)]">
        <p>
          i'm a cs grad from mit, interested in theoretical distributed and agentic systems, as well as building personal automation and tooling systems.
        </p>
        <p>
          i'm currently experimenting with Hermes agent and rolling up custom MCP tooling infrastructure
        </p>
        <p>
          when i'm free, i enjoy reading, creative writing, and playing rougelike games.
          for my active side, you'll find me at pickup basketball, on a run, or bumping a volleyball around.
        </p>
      </div>
    </section>
  )
}
