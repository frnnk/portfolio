export function DeveloperIntro() {
  return (
    <section id="about" className="max-w-2xl mb-16">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-lg font-bold tracking-tighter text-[var(--highlight)]">
          hi im frank!
        </h1>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="space-y-4 text-sm leading-relaxed font-light text-[var(--gray-400)]">
        <p>
          im a cs student @ mit interested in distributed and agentic systems. 
          currently working on agents that can play minigames and releasing cross-platform installation for a journaling app I made.
        </p>
        <p>
          to satisfy my creative urges, i enjoy reading fiction, creative writing, and solving rougelike games with differing strategies.
          for my active side, you'll find me at pickup basketball, on a run, or bumping a volleyball around.
        </p>
      </div>
    </section>
  )
}
