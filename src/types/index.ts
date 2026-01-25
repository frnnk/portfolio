export interface Project {
  slug: string
  name: string
  description: string
  quarter: string
  year: number
  tags: string[]
  content: string
}

export interface QuarterGroup {
  quarter: string
  year: number
  projects: Project[]
}
