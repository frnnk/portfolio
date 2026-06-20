import { useEffect, useRef, useState } from 'react'

// Each diagram needs a DOM-id unique across the page. Mermaid uses the id in a
// CSS selector, so it must be selector-safe (no colons from React's useId).
let counter = 0

let initialized = false

// Tune mermaid to the site's dark, monospace palette. `theme: 'base'` lets the
// themeVariables below fully override colors; everything else inherits the
// page's lowercase transform so diagrams match the rest of the site.
function initMermaid(mermaid: typeof import('mermaid').default) {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      background: 'transparent',
      primaryColor: '#161616',
      primaryBorderColor: '#333333',
      primaryTextColor: '#cccccc',
      secondaryColor: '#111111',
      tertiaryColor: '#0a0a0a',
      lineColor: '#666666',
      textColor: '#999999',
      fontFamily: "'Ioskeley Mono', monospace",
      fontSize: '13px',
    },
  })
  initialized = true
}

interface MermaidProps {
  chart: string
}

export function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState('')
  const [failed, setFailed] = useState(false)
  const idRef = useRef('')
  if (!idRef.current) idRef.current = `mermaid-${counter++}`

  useEffect(() => {
    let cancelled = false
    // Load mermaid on demand so it lands in its own chunk rather than the main
    // bundle — it only renders on project pages that define a diagram.
    import('mermaid')
      .then(({ default: mermaid }) => {
        initMermaid(mermaid)
        return mermaid.render(idRef.current, chart)
      })
      .then(({ svg }) => {
        if (!cancelled) {
          setSvg(svg)
          setFailed(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('mermaid render failed', err)
          setFailed(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [chart])

  // Fall back to the raw source so the diagram's information is never lost.
  if (failed) {
    return (
      <pre className="my-6 overflow-x-auto rounded-md border border-white/10 bg-[#161616] p-4 text-[var(--gray-400)] text-fluid-sm [text-transform:none]">
        {chart}
      </pre>
    )
  }

  return (
    <div
      className="my-6 overflow-x-auto rounded-md border border-white/10 bg-[#0c0c0c] p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
