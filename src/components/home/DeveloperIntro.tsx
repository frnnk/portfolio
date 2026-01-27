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
          currently experimenting on agentic systems with MCP integration and human in the loop / tracability infra in place
        </p>
        <p>
          in my free time, i enjoy reading, running, and asking Claude random pieces of trivia
        </p>
      </div>
    </section>
  )
}
