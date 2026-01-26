import type { Project, QuarterGroup } from '../types'

export const projects: Project[] = [
  {
    slug: 'messaging-agent',
    name: 'messaging-agent',
    description: 'mini agentic harness/scaffold providing human confirmation + clarification and mcp integration',
    quarter: 'Q1',
    year: 2026,
    tags: ['agentic systems', 'langgraph', 'observability'],
    content: `
# Overview

This is a small LangGraph harness that supports basic agentic tasks, with additional human in the loop and observability features built in. 
supports modular tool calling additions, and is ideal for simple yet generic tasks where tool calling order is not determined

## Features

- **Pre-emptive Clarification**: automatically requests end-user clarification if a request is missing important context
- **Side-effect Confirmation**: designate write/update tool calls that require end-user confirmation
- **MCP and tool integration**: load and unload tools via MCP servers or directly construct custom tools 
- **Observability**: pathing and model inputs logging with request trace ids
    `,
  },
  {
    slug: 'mcp-server-framework',
    name: 'mcp-server-framework',
    description: 'framework for spinning up mcp servers with third party oauth infra in-place',
    quarter: 'Q1',
    year: 2026,
    tags: ['mcp tooling', 'oauth'],
    content: `
# Overview

This project presents a layered architecture for mcp servers that promotes single responsibility principles 
with three configurable layers: an API layer, an OAuth layer, and a tool-call layer. allows for independent 
configuration, customization, and logging of each layer

## Features

- **Authorization Code Flow**: handles end-user authentication and provides a redirect URI callback endpoint
- **Centralized OAuth Handling**: provides a centralized OAuth gateway for each tool call to initiate the Authorization Code Flow
- **Modular OAuth Providers**: dependency injection of OAuth provider implementations into a centralized OAuth gateway
    `,
  },
  {
    slug: 'video-sync-lobbies',
    name: 'video-sync-lobbies',
    description: 'persistent lobbies where users can watch videos with synchronized playback operations',
    quarter: 'Q4',
    year: 2025,
    tags: ['websockets', 'typescript', 'sqlite'],
    content: `
# Overview

This project allows users to load YouTube videos up and watch them together. Automatically synchronizes the video across all users in 
the same lobby, and also provides sychronized playback operations.

## Features

- **Youtube Video Loader**: load up any youtube video by providing a link
- **Late User Joining**: users joining late are automatically caught up to speed to the video being played
- **Playback Operations**: any user can use pause/play/skip operations that propagate to another user
- **Persistent Lobbies**: lobbies save the video state allowing resumable progress later
    `,
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getProjectsByQuarter(): QuarterGroup[] {
  const groups: Record<string, QuarterGroup> = {}

  for (const project of projects) {
    const key = `${project.quarter}-${project.year}`
    if (!groups[key]) {
      groups[key] = {
        quarter: project.quarter,
        year: project.year,
        projects: [],
      }
    }
    groups[key].projects.push(project)
  }

  return Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    const quarterOrder = ['Q4', 'Q3', 'Q2', 'Q1']
    return quarterOrder.indexOf(a.quarter) - quarterOrder.indexOf(b.quarter)
  })
}

export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const index = projects.findIndex((p) => p.slug === slug)
  return {
    prev: index > 0 ? projects[index - 1] : null,
    next: index < projects.length - 1 ? projects[index + 1] : null,
  }
}
