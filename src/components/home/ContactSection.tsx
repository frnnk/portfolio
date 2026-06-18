export function ContactSection() {
  return (
    <section id="contact" className="max-w-3xl 2xl:mx-auto mb-32 relative z-20">
      <div className="flex items-center gap-4 mb-10">
        <span className="text-fluid-xs text-[var(--gray-600)] font-bold tracking-[0.3em]">
          contact
        </span>
        <div className="h-px w-24 bg-white/10" />
      </div>
      <div className="space-y-4">
        <a
          href={`https://linkedin.com/in/${import.meta.env.VITE_LINKEDIN_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <span className="text-fluid-2xs font-bold text-[var(--gray-800)] tracking-widest w-16">
            linkedin
          </span>
          <span className="text-fluid-sm text-[var(--gray-400)] group-hover:text-[var(--highlight)] transition-colors">
            /in/{import.meta.env.VITE_LINKEDIN_HANDLE}
          </span>
        </a>
        <a
          href={`https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <span className="text-fluid-2xs font-bold text-[var(--gray-800)] tracking-widest w-16">
            github
          </span>
          <span className="text-fluid-sm text-[var(--gray-400)] group-hover:text-[var(--highlight)] transition-colors">
            @{import.meta.env.VITE_GITHUB_HANDLE}
          </span>
        </a>
        <a
          // href={`mailto:${import.meta.env.VITE_EMAIL}`}
          className="flex items-center gap-3 group"
        >
          <span className="text-fluid-2xs font-bold text-[var(--gray-800)] tracking-widest w-16">
            email
          </span>
          <span className="text-fluid-sm text-[var(--gray-400)] group-hover:text-[var(--highlight)] transition-colors">
            {import.meta.env.VITE_EMAIL.replace("@", " [at] ").replace(/\./g, " [dot] ")}
          </span>
        </a>
      </div>
    </section>
  )
}
