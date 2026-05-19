import type { Blog, BlogQuarterGroup } from '../types'

export const blogs: Blog[] = [
  {
    slug: 'graduation-and-a-record-of-curiosities',
    title: 'Graduation and a Record of Curiosities',
    date: '2026-05-19',
    quarter: 'Q2',
    year: 2026,
    tags: ['lifestyle'],
    projectSlugs: [],
    content: `
# Graduation and a Record of Curiosities

My graduation at MIT is near and that means I finally have free time to update this website. First, let me dust off my creative writing skills. 

I first created this website to catalog my projects and improve my software development skills, serving as a way to motivate myself.
I find that it's easy to fall into a lull of complacency where outside self-learning stalls, especially when learning new things is inherently uncomfortable.

But it has blossomed into something much more meaningful. 

As my time at mit enters its twilight chapter, I realize I have developed this annoying curiosity for the domain I'm entering, an insight that has slowly creeped up
on me. It's a nagging itch that can't be scratched properly, an unquenchable thirst, a cry for new knowledge and understanding. 

Yet, even I remain skeptical as to whether it will last a couple years down the line. Maybe that curiosity will transform
into something else more grounded or even fade entirely. 

Even so, this website now takes up the role of capturing this very special period of my life. It is a record of curiosities, a snapshot of passion, and most importantly, a 
momento of youth.

So, into the abyss I go.

I look forward to what I will learn next.
    `,
  },
  {
    slug: 'building-agentic-systems',
    title: 'Building Agentic Systems with HITL',
    date: '2026-01-26',
    quarter: 'Q1',
    year: 2026,
    tags: ['agentic systems', 'architecture'],
    projectSlugs: ['messaging-agent'],
    content: `
# Building Agentic Systems with HITL

Ai agents are llms with the autonomy to use tools to complete tasks. And agentic systems compose of the underlying infrastructure (harness) that allows ai agents to interact with said tools and each other.

Thus, agentic systems are nothing without their harnesses. Consider Claude Code as an example, which demonstrates a powerful yet lightweight terminal-based agentic system which features anthropic's harness
wrapped around their llms.

So in this blog, I want to talk about some learning experiences I had when designing and constructing my own harness using Langgraph.

## Declaring Scope

When I first started building my harness, my intended scope was small: no need for parallel agentic flows or complex orchestration, a decision driven by my desired usecases. 
Yet even with this simplified preface, I often came across problems with agent execution when task ambiguity varied. 

## The Problem of Consistency

The first problem was a lack of consistency: fully autonomous agents equipped with a toolbox can be powerful with tasks that leave little to no ambiguity, but under those with ambiguity, 
a sole focus on task execution creates inconsistent results that may not align with user intent. 

Even with tighter prompt tuning and tool description writing, ai agents can still make decisions that defy previous established consistency, given the large surface area of available requests.

The solution to this isn't to remove the singular task execution focus entirely, but to allow agents to voice concerns and flag ambiguity when they spot it.

## Pre-emptive Clarification

Before an agent takes action, it should assess whether it has enough information to complete the task and whether it understands the task itself. If there is ambiguity that can distort the intent
of the request, the agent can use a special clarification tool that allows it to ask the end-user one or more clarification questions.

These clarification questions will be sent back to the end-user to be answered, and the state of the agentic system can be saved and restored to be resumed when answers arrive.

## The Problem of Hand Holding

At this point, we've given agents plenty of room for clarifying any ambiguity. However, another end of the spectrum is dealing with too much clarification, which leads to a feeling of hand holding.

By nature, we should expect agents to be independent and agentic: they shouldn't ask clarification questions that can be inferred from logic / common sense or retrieved via tools.
Tighter prompt tuning and designating a reviewer agent can help here. However, implementing a separate reviewer agent incurs tradeoffs of extra latency cost.

## The Problem with Destructive Actions

For fully autonomous agentic systems, another common problem is lack of control: if we want to give ai agents more power to complete tasks, we
should give them access to tools that modify state, but these tools often create noticible side-effects or artifacts.

Therefore, if agents are given access to tools that have destructive side-effects, there should be a way to monitor and green light their use. 

## Human-in-the-Loop Confirmation

We can install strategic checkpoints for confirmation when actions with side effects (writes, updates, deletes) are decided on by an agent. These checkpoints will require explicit user 
confirmation and adds an additional safety layer without sacrificing the agent's ability to reason and plan.

Similar to pre-emptive clarification, a summary of the tool call is sent back to the end-user for confirmation, and requires the state of the graph to be saved and restored.

## Closing Thoughts

I'm currently still experimenting with this project and hope to learn a lot more as I keep on building. I've already learned a lot about building agentic systems through this project 
and I feel like some of the ideas and principles highlighted here can also be applied to larger ai systems.

Practically, I believe that a small harness is enough for most agentic tasks in your life. I'll continue to try and scale the design to see where the limit lies, but its good enough
to customize for your own use as is.
    `,
  },
  {
    slug: 'mcp-oauth-patterns',
    title: 'OAuth Design Patterns for HTTP MCP Servers',
    date: '2026-01-11',
    quarter: 'Q1',
    year: 2026,
    tags: ['mcp tooling', 'oauth', 'architecture'],
    projectSlugs: ['mcp-server-framework'],
    content: `
# OAuth Design Patterns for HTTP MCP Servers

Implementing OAuth in MCP servers differs in difficulty depending on your intended scope. For local use limited to a constant number of 
end-user clients, constructing stdio transport-based MCP servers greatly lower the difficulty of incorporating OAuth. 

## Beyond local use

However, for enterprise implementations or larger scope usecases, mcp servers must be capable of serving a large number of end-user clients at once, each with
their OAuth credentials. Furthermore, given the expanded scope of different authorizations, there needs to exist both a seamless flow that end-users can use 
to authenticate themselves as well as a way to track credentials.

Here, we turn to streamable http mcp servers, which can either be stateful or stateless HTTP depending on the nature of the tool calls being implemented.

## A Layered Approach

When designing this mcp server, my goal was to provide an architectural design that can:
- serve end-users and manage their oauth credentials asynchronously
- provide an authorization flow for end users to authenticate themselves
- decouple OAuth, API, tool calling, and database related logic from each other to allow for extensibility in the future

## The OAuth Gateway

One of the key architecture decisions was to establish a centralized OAuth gateway, a singular source of truth that handles all OAuth routing logic. All tool
call requests pass through this node, and the logic here dedetermines if an OAuth-related authorization flow should be triggered. Likewise, if credentials are 
already present, the tool call request will finish without a problem.

In practice, we attempt to retrieve the credentials associated with an end-user id for all tool call requests that require authorization. If the credentials 
are not present, then the authorization flow is triggered by throwing a custom error that is caught further upstream. 

In this manner, OAuth routing logic is decoupled from authorization flow logic.

## The Authorization Flow

The authorization flow encompasses the latter half of the authorization process, but the logic here is shared between provider-specific OAuth procedures, the
API layer, and the end-user. It is a standard OAuth 2.0 flow designed so that third-party authorization is only exposed to the end-user, and not to any middleware.

At a high level, the authorization flow for third-party auth can broken down as follows:
- save the third-party provider state (permission scopes and other metadata)
- generate a server-hosted link to return to the end-user, that the end-user can click on
- when the end-user hits the server endpoint, build a third-party auth link from the saved state, including a specific server callback endpoint
- redirect the end-user to the third-party auth link to authorize
- third-party service uses the specific server callback to provide confirmation details
- the server uses the confirmation details to exchange for end-user credentials from the third-party service

To decouple the authorization flow from any database-related logic, a thin abstraction around database methods is used to save state.
Similarly, abstractions are created around third-party providers to allow for further extensibility in the future.

## Closing thoughts

There is currently room for improvement in several domains for this project like logging and traceability, database abstractions, and documentation. Even looking back
now, I see some areas where the design could potentially be improved. 

However, this is my first time architecting and designing a system like this, so I'm happy with how it turned out. There were a lot of challenges and I learned 
a ton along the way.
    `,
  },
]

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((b) => b.slug === slug)
}

export function getBlogsByQuarter(): BlogQuarterGroup[] {
  const groups: Record<string, BlogQuarterGroup> = {}

  for (const blog of blogs) {
    const key = `${blog.quarter}-${blog.year}`
    if (!groups[key]) {
      groups[key] = {
        quarter: blog.quarter,
        year: blog.year,
        blogs: [],
      }
    }
    groups[key].blogs.push(blog)
  }

  return Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    const quarterOrder = ['Q4', 'Q3', 'Q2', 'Q1']
    return quarterOrder.indexOf(a.quarter) - quarterOrder.indexOf(b.quarter)
  })
}

export function getAdjacentBlogs(slug: string): { prev: Blog | null; next: Blog | null } {
  const sortedBlogs = [...blogs].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
  const index = sortedBlogs.findIndex((b) => b.slug === slug)
  return {
    prev: index > 0 ? sortedBlogs[index - 1] : null,
    next: index < sortedBlogs.length - 1 ? sortedBlogs[index + 1] : null,
  }
}

export function getBlogsByProjectSlug(projectSlug: string): Blog[] {
  return blogs.filter((blog) => blog.projectSlugs.includes(projectSlug))
}
