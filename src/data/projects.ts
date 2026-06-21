import type { Project, QuarterGroup } from '../types'

export const projects: Project[] = [
  {
    slug: 'youtube-summarizer',
    name: 'youtube-summarizer',
    description: 'command-line tool that turns a youtube link into a concise, configurable summary',
    quarter: 'Q2',
    year: 2026,
    tags: ['langgraph', 'map-reduce', 'langchain', 'cli'],
    github: `https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}/youtube-summarizer`,
    architecture: `
flowchart TB
    subgraph entry["Entry Point / Orchestrator"]
        app["app.py<br/>argparse + wiring"]
    end

    subgraph modules["Modules (decoupled)"]
        fetch["fetch.py<br/>transcript fetching"]
        summary["summary.py<br/>LangChain / LangGraph summarizer"]
        ui["ui.py<br/>Rich panels + questionary editor"]
    end

    subgraph helpers["Helpers"]
        util["util.py<br/>URL parsing, chunking"]
        settings["settings.py<br/>config: env + JSON"]
    end

    subgraph external["External"]
        yt[/"YouTube<br/>transcripts"/]
        llm[/"LLM provider<br/>Anthropic / OpenAI"/]
        json[("settings.json")]
        user(["User"])
    end

    app --> fetch
    app --> summary
    app --> ui
    app --> util
    app --> settings
    fetch --> util
    summary --> util
    ui --> settings

    app -.injects progress callback.-> summary
    fetch -.fetch transcript.-> yt
    summary -.summarize.-> llm
    settings <-.read / write.-> json
    user -.runs command.-> app
    app -.summary panel.-> user
    `,
    content: `
# Overview

A small command-line tool that turns a YouTube link into a concise summary: paste a URL, get the gist in your
terminal without watching the whole thing. Short transcripts are summarized in a single pass; long ones are split
into chunks, summarized in parallel via a LangGraph map-reduce graph, then stitched back into one coherent summary.

## Features

- **Flexible URL handling**: accepts any YouTube URL shape (watch, youtu.be, shorts, embed, live, share links) or a bare video id
- **Map-reduce summarization**: parallel chunk summarization via a LangGraph state graph for long transcripts
- **Model-agnostic backend**: swap LLM provider (anthropic, openai, google) with a single flag or setting
- **Configurable output**: tune summary style (bullets or prose), length (short, medium, long), and caption language
- **Persistent, layered config**: CLI flags over environment over .env over JSON config over defaults, with an interactive settings editor
    `,
  },
  {
    slug: 'ai-inference-kernels',
    name: 'ai-inference-kernels',
    description: 'custom NKI kernels for running qwen3-30B-A3B inference',
    quarter: 'Q2',
    year: 2026,
    tags: ['aws-trainium', 'kernel-programming'],
    pdf: '/pdfs/model-inference.pdf',
    content: `
# Overview

A series of custom kernels written in NKI, allowing them to interface with AWS Trainium hardware accelerators to speed up
model inference.

## Features

A comprehensive list of features and optimizations is available in the attached pdf.
    `,
  },
  {
    slug: 'transient-thoughts',
    name: 'transient-thoughts',
    description: 'unintrusive desktop journaling app to quickly unload tangent thoughts',
    quarter: 'Q2',
    year: 2026,
    tags: ['installation', 'multithreading', 'locks', 'sqlite'],
    github: `https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}/transient-thoughts`,
    architecture: `
flowchart TB
    subgraph entry["Entry Point"]
        main["main.py<br/>argparse + launch"]
    end

    subgraph orchestrator["Orchestrator"]
        app["app.py<br/>TransientThoughtsApp<br/>timer · signal handler · settings"]
    end

    subgraph layers["Layers"]
        storage["storage.py<br/>ThoughtStorage<br/>SQLite"]
        settings["settings.py<br/>Settings dataclass<br/>JSON persistence"]
        ui["ui.py<br/>show_input_window<br/>show_viewer_window<br/>show_settings_window"]
        tray["tray.py<br/>TrayIcon<br/>pystray · windows-toasts"]
    end

    subgraph external["External"]
        db[("SQLite DB<br/>thoughts.db")]
        json[("settings.json")]
        toast[/"Windows<br/>Toast (WinRT)"/]
        trayicon[/"System Tray<br/>Icon"/]
        user(["User"])
    end

    main --> app
    app --> storage
    app --> settings
    app --> ui
    app --> tray
    ui --> settings
    storage <--> db
    settings <--> json
    tray --> toast
    tray --> trayicon
    toast -.nudges.-> user
    user -.clicks toast.-> app
    user -.clicks tray.-> app
    user -.types thought.-> ui
    `,
    content: `
# Overview

A small journaling app that periodically prompts for quick, transient thoughts: the mundane and tangential ideas that detract from your focus or otherwise
 would be forgotten. By seamlessly noting down these thoughts, you free your mind's resources to the current task at hand.

## Features

- **Periodically Prompts**: unintrusive toast notifications to periodically note down ideas or thoughts
- **Quick Shortcut**: provides a quick shortcut to automatically bring up the text entry box to note down an idea or thought 
- **Variable Settings**: declare quiet hours (time zone dependent), placement of the text entry box, and how often toast notifications pop up 
- **Entry Viewing**: simple persistent store of all logged ideas and thoughts
    `,
  },
  {
    slug: 'messaging-agent',
    name: 'messaging-agent',
    description: 'mini agentic harness providing human confirmation + clarification and mcp integration',
    quarter: 'Q1',
    year: 2026,
    tags: ['agentic systems', 'langgraph', 'observability'],
    github: `https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}/msg-agent`,
    architecture: `
flowchart TD
    START((START)) --> policy_router
    policy_router --> task_executor

    task_executor -->|clarification needed| human_clarification
    task_executor -->|HITL tools| human_confirmation
    task_executor -->|tool calls| use_tools
    task_executor -->|no tool calls| END

    human_clarification[["human_clarification<br/>(interrupt)"]]
    human_clarification -->|HITL remaining| human_confirmation
    human_clarification -->|tools remaining| use_tools
    human_clarification -->|no remaining| task_executor

    human_confirmation[["human_confirmation<br/>(interrupt)"]]
    human_confirmation -->|approved| use_tools
    human_confirmation -->|all rejected| task_executor

    use_tools -->|OAuth URL| oauth_needed
    use_tools -->|continue| task_executor

    oauth_needed --> END((END))
    `,
    content: `
# Overview

This is a small but powerful LangGraph harness that supports basic agentic tasks, with additional human in the loop and observability features built in.
it provides modular tool calling additions, and is ideal as a starting base for custom agentic systems

It comes with a simple command line client, but you may build your own as well. Designed with the option to be spun up locally or over the cloud

## Features

- **Pre-emptive Clarification**: automatically requests end-user clarification if an agent spots ambiguity with the request
- **Side-effect Confirmation**: designate write/update tool calls that require end-user confirmation
- **MCP and tool integration**: load and unload tools via MCP servers or directly construct custom tools 
- **Observability**: simple pathing and model inputs logging tagged with request trace ids
    `,
  },
  {
    slug: 'mcp-server-framework',
    name: 'mcp-server-framework',
    description: 'framework for spinning up mcp servers with third party oauth infra in-place',
    quarter: 'Q1',
    year: 2026,
    tags: ['mcp tooling', 'oauth'],
    github: `https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}/assistant-mcp`,
    content: `
# Overview

This project presents a layered architecture for mcp servers that promotes single responsibility principles 
across three decoupled layers: an API layer, an OAuth layer, and a tool-call layer. allows for independent 
configuration, customization, and logging of each layer

Ideal as a starting for developing custom MCP servers, as it provides extensible architecture with OAuth infra
built in 

## Features

- **Authorization Code Flow**: handles end-user authorization and provides a redirect URI callback setup
- **Centralized OAuth Handling**: provides a centralized logic node for each tool call to initiate the Authorization Code Flow
- **Modular OAuth Providers**: dependency injection of third-party OAuth provider implementations into a centralized OAuth gateway
    `,
  },
  {
    slug: 'video-sync-lobbies',
    name: 'video-sync-lobbies',
    description: 'persistent lobbies where users can watch videos with synchronized playback operations',
    quarter: 'Q4',
    year: 2025,
    tags: ['websockets', 'typescript', 'sqlite'],
    github: `https://github.com/${import.meta.env.VITE_GITHUB_HANDLE}/watch-party`,
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

