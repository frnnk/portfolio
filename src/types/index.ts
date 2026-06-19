export interface Project {
  slug: string
  name: string
  description: string
  quarter: string
  year: number
  tags: string[]
  content: string
  github?: string
  pdf?: string
}

export interface QuarterGroup {
  quarter: string
  year: number
  projects: Project[]
}

export interface Blog {
  slug: string
  title: string
  date: string
  updated?: string
  quarter: string
  year: number
  categories: string[]
  tags: string[]
  projectSlugs: string[]
  content: string
  pdf?: string
}

export interface BlogQuarterGroup {
  quarter: string
  year: number
  blogs: Blog[]
}
