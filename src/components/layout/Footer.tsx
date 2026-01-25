export function Footer() {
  const funNotes = [
    "no pixels were harmed in the making of this site",
    "powered by existential dread and determination",
    "ctrl+s is my cardio",
    "debugged extensively on production",
  ]

  const randomNote = funNotes[Math.floor(Math.random() * funNotes.length)]

  return (
    <footer className="pt-16 pb-8 flex items-center justify-center text-xs">
      <span className="text-[var(--gray-800)] font-light tracking-wide">
        {randomNote}
      </span>
    </footer>
  )
}
