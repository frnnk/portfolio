import { projects } from './projects'
import { blogs } from './blogs'

export type SpotlightKind = 'project' | 'blog'

export interface SpotlightEntry {
  kind: SpotlightKind
  slug: string
}

export interface SpotlightItem {
  kind: SpotlightKind
  slug: string
  href: string
  title: string
  subtitle?: string
  snippet: string
}

export const spotlightEntries: SpotlightEntry[] = [
  { kind: 'blog', slug: 'building-a-tray-app-for-journaling' },
  { kind: 'blog', slug: 'building-small-agentic-systems'},
  { kind: 'project', slug: 'youtube-summarizer' },
]

export function getSpotlightItems(): SpotlightItem[] {
  const items: SpotlightItem[] = []
  for (const entry of spotlightEntries) {
    if (entry.kind === 'project') {
      const p = projects.find((p) => p.slug === entry.slug)
      if (!p) continue
      items.push({
        kind: 'project',
        slug: p.slug,
        href: `/projects/${p.slug}`,
        title: p.name,
        subtitle: p.description,
        snippet: getIntroSnippet(p.content),
      })
    } else {
      const b = blogs.find((b) => b.slug === entry.slug)
      if (!b) continue
      items.push({
        kind: 'blog',
        slug: b.slug,
        href: `/blogs/${b.slug}`,
        title: b.title,
        snippet: getIntroSnippet(b.content),
      })
    }
  }
  return items
}

const SNIPPET_MAX_CHARS = 280

function getIntroSnippet(content: string): string {
  const afterHeading = content.replace(/^\s*#\s+[^\n]+\n+/, '')
  const beforeNextHeading = afterHeading.split(/\n##\s/)[0].trim()
  if (beforeNextHeading.length <= SNIPPET_MAX_CHARS) return beforeNextHeading
  const sliced = beforeNextHeading.slice(0, SNIPPET_MAX_CHARS)
  const lastSpace = sliced.lastIndexOf(' ')
  const cut = lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced
  return cut.trimEnd() + '…'
}
