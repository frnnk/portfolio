import type { Blog, BlogQuarterGroup } from '../types'

export const blogs: Blog[] = [
  {
    slug: 'building-a-tray-app-for-journaling',
    title: 'Deep Dive: Building a Tray App for Journaling',
    date: '2026-06-17',
    quarter: 'Q2',
    year: 2026,
    categories: ['technical'],
    tags: ['python', 'desktop app', 'concurrency'],
    projectSlugs: ['transient-thoughts'],
    content: `
# Deep Dive: Building a Tray App for Journaling

## Overview

I built my first desktop application recently. It's a Windows tray app that allows me to note down any quick thoughts or ideas I might have in the moment, serving as a lightweight journal that I can look back upon later. The app triggers via a manual flow or using a configurable timer, and is designed to be unintrusive.

It's my first desktop application in the sense that I packaged it and ensured that it could run in the background on Windows startup (or via an entrypoint command), allowing the app to fit seamlessly into my workspace. In other words, this was a piece of software I designed and built
with the intention of using everyday. 

Right now, it only works on Windows because I focused on the getting the simplest version up and running. However, I want to add cross-platform support (MacOS, Linux types) in the future. 

What follows below is a deep dive into several problems that shaped the design of this app, in roughly the order I hit them. Let's dive in!


## Architecture

> The first problem to any project is *architectural layout*. How should the code be structured? 

To start, we want a journaling app that can sit in the Windows tray and periodically notify us to jot something down while also saving it automatically. Besides it triggering in the background, we also want to be able to enter an entry via a manual flow.

The tray app we described has at least three concerns that don't belong together: it has to manage a tray icon and fire notifications, it has to pop up a window to type into, and it has to persist notes somewhere. And on top of all that, *something* has to tie those features together.

### Design

For architectural simplicity, we can go forward with a four-file split. Each file handles logic for its own concerns to decouple components and allow further change to be easier in the future.

1. \`storage.py\` (SQLite for data persistence, e.g. reads/writes)
2. \`tray.py\` (tray and notification handlers)
3. \`ui.py\` (prompt/view windows and specific ui)
4. \`app.py\` (orchestrator and periodic-notification timer)

With this design, dependency relationships happen in one direction: \`app.py\` imports \`tray\`, \`ui\`, and \`storage\`, allowing the orchestrator to know about its supporting modules, but not the other way around.

> So how do the supporting modules contribute to the journaling app if they don't know anything about each other? The answer lies in *callbacks*. 

### Tray

When \`app.py\` builds the tray, it first imports \`TrayIcon\` from \`tray.py\` and then hands it a set of callback functions to call: one for opening a prompt, one for viewing past entries, and one for quitting the app, all defined within \`app.py\`. The tray doesn't know what those callbacks do, but invokes them when they're needed.

\`\`\`python
self._tray = TrayIcon(
    on_prompt=self._on_prompt,
    on_view=self._on_view,
    on_quit=self._on_quit,
)
\`\`\`

### UI

\`ui.py\` is a similar story: when \`app.py\` needs to open a window, it calls an imported function from \`ui.py\` to generate the needed window, but also passes in any needed callback functions the window uses for its related logic. Thus, \`ui.py\` is only responsible for showing the window and tweaking any UI changes while any other logic is gated behind \`app.py\`.

\`\`\`python
ui.show_input_window(
    self._on_submit,
    on_view=self._on_view,
    on_quit=self._on_quit,
)
\`\`\`

### Storage

\`storage.py\` is even simpler: it does not need any callback functions, so \`app.py\` only imports its functions and calls them there.

This is the heart of the layout: every concern talks only to the orchestrator, and the orchestrator is the only place that knows how the pieces fit together.

### Timer

Finally, \`app.py\` is also where the periodic behavior lives. On startup, it kicks off a timer that fires off notifications at set intervals, nudging you to note down any ideas or thoughts in the moment. Like the other modules mentioned above, it's also owned by the orchestrator with the difference being that all the timer logic is stored directly within \`app.py\`.


## Cleanup

The second problem is somewhat subtle and requires more planning in the sense that **the journaling tray app is not single-threaded.**

Most Python projects are single-threaded because running their entrypoint commands create OS processes with a single Python user thread, and the program / app only needs that single thread to run its related logic.

With this journaling app, there are multiple modules that must sit in the background and continously monitor for certain conditions; these modules include any window that awaits a user's feedback, the timer that periodically sends out notications, and even the tray app itself as it must respond to the user clicking on it. Thus, these items all require their own threads.

That observation immediately raises some questions about cleanup issues:

> How can we ensure that threads spawned by this app do not keep the app hanging when it is shut down?

> What happens in the case of failure for all operations with side effects?

### Daemon Threads

To begin, after our initial setup, the main user thread spawned by our entrypoint command is occupied by the tray app defined within \`tray.py\`. This thread handles everything related to how the tray responds to user interaction and has injected callbacks from \`app.py\` like \`_on_prompt\`, \`_on_view\`, and \`_on_quit\`. It is also the sole user thread in our application.

For other items in our application that need to monitor events, we choose to create them within the same OS process as their own separate **daemon threads**. 

\`\`\`python
def _run():
    ...

threading.Thread(target=_run, daemon=True).start()
\`\`\`
> But why create them in daemon threads rather than regular user threads?

Daemon threads have less priority than user threads; they do not block the app's OS process from exiting and gets killed abruptly instead. This means that all daemon threads live and die by the sole user tray thread; if the user quits the tray or the tray is killed, the app process instantly exits and all other daemon threads get wiped out.

For operations that don't create side effects, this design solves our problem of thread cleanup and ensures no runaway thread can prevent our application from closing.

### Operations with Side Effects

However, there are also operations that do have side effects and we should be aware of what happens with thread cleanup in those cases.

The first type of side effect in this journal app is interaction with persistent data storage. Namely, \`_on_prompt\` generates a text entry window within a separate daemon thread where the user can enter in a journal entry. This entry is then written via a single operation to persistent storage (SQLite), which results in stateful changes outside of our app.

Because we are using SQLite which is **ACID-compliant** as well as **singular write operations**, our worst case scenario can be managed; if the entry window thread is killed mid-write, the journal entry will either be successfully commited or dropped entirely. Thus, we are fine with daemon threads making SQLite writes being killed at any time and accept the worst-case scenario of a single dropped entry. 

The second type of side effect is more benign: the timer thread fires off notifications within \`_timer_loop\` in \`app.py\` and if it is killed, notifications being may still fire even after the journaling app is dead. Yet, we are fine with this outcome since notifications are ephemeral and only one notification will launch in this manner once the timer thread is killed entirely.

\`\`\`python
def _timer_loop(self):
    while not self._stop_event.is_set():
        self._stop_event.wait(timeout=self.settings.interval_minutes * 60)
        if self._stop_event.is_set():
            break
        self._tray.send_notification(...)
\`\`\`

## Concurrency

So far, we've answered *what happens when the app shuts down*. Now, a different question remains: what happens when two of those threads try to reach for the same resource at the same time?

In this app there are two shared resources worth worrying about: the **database** that every entry is read from and written to, and the **GUI** that every window is drawn with. Almost everything a thread does eventually touches one of these edges.

> So what are the kinds of collisions that can happen?

Some examples:

- We open the viewer to read past entries: a thread starts reading the database, while an entry we submitted a second ago is still being written by *another* thread.
- A notification toast opens an entry window at the exact moment we manually open an entry window through the tray. 

### Database Collision

The database is a shared resource that protects itself. In the cleanup section we leaned on SQLite being **ACID-compliant** to argue that a half-finished write either commits or vanishes. That same property is what makes concurrent access safe as well: SQLite serializes operations internally, so a thread reading every entry for the viewer and a thread appending a new one wil never corrupt each other: the reader sees either the old state or the new one, never a mangled in-between. Thus, database collisions have no effect for our app.

### Window Construction

The danger with GUI collision is not inherent to graphical toolkits. Instead, it comes from a shortcut we took in how the windows are generated, so it is worth laying that out before we talk about the collision itself.

Every window in the app, whether it is the prompt or the viewer, is a single self-contained function in \`ui.py\`. When constructing a specific window, the orchestrator calls one of these functions from a daemon thread, which then builds the window according to its specifications and blocks until the user closes it.

\`\`\`python
def show_input_window(on_submit, ...):
    root = tk.Tk() # a fresh Tkinter root, owned by this thread
    
    # build the card, the text box, the buttons

    root.mainloop() # blocks this thread until the window closes
\`\`\`

The textbook way to use Tkinter is to create one \`tk.Tk()\` root for the whole application and open every other window as a lightweight \`Toplevel\` child of it. However, the shortcut we took does not do that. Instead, each window here builds its own fresh \`tk.Tk()\` root, and there is no long-lived GUI thread anywhere. A window lives on whatever daemon thread opened it and dies when that thread's \`mainloop()\` returns.

We made this decision on purpose because it matches the rest of the design: a trigger fires, the orchestrator spawns a daemon thread, the thread calls a \`ui\` function and blocks in \`mainloop()\`, and when the user closes the window the thread ends. WIth this design, there is a clean separation of concerns: there is no central event loop to route calls through, and \`ui.py\` never has to handle any thread logic. On top of that, it fits in cleanly with the daemon-thread lifecycle used for cleanup.

However while what we've mentioned so far is great, there is also an equivalent cost to this shortcut that sets up the next section.

### GUI Collision

Modern Tkinter can operate with \`tk.Tk()\` roots in their separate threads but not if construction of those roots happen at exactly the same time. 

For the view window, construction is gated behind either a tray click or an option to open it through an entry window. Both options make a race condition very unlikely: manual triggers are limited by the user.

However, the entry window carries the opposite story. Unlike the viewer, it can be opened three different ways, one of which is asynchronous:

- the tray menu's "New thought" item,
- left-clicking the tray icon directly,
- through the notification toast

The main problem here is that the menu and the toast run on the tray's own thread, while the timer's notification path asynchronously runs on the timer thread, allowing a potential race condition. And in the future, if we add callback-based automation to open an entry window, there could be even more issues.

> So, if two or more triggers call \`_on_prompt\` at the same instant from different threads, what should happen?

The answer we want is simple: the first one opens the window, and the rest quietly do nothing. In other words, the mechanism we want comes in the form of a single lock:

\`\`\`python
self._prompt_lock = threading.Lock()

def _on_prompt(self):
    if not self._prompt_lock.acquire(blocking=False):
        return  # a window is already opening; drop this trigger

    def _run():
        try:
            ui.show_input_window(...)
        finally:
            self._prompt_lock.release()

    threading.Thread(target=_run, daemon=True).start()
\`\`\`

The important detail here is \`acquire(blocking=False)\`. A plain \`acquire()\` waits until the lock is free, which would queue up a second window to open the moment the first one closes. Instead, the non-blocking form returns \`False\` immediately if the lock is already held, and \`_on_prompt\` returns without doing anything. Thus, the trigger is dropped, and the lock is eventually released in a \`finally\` block, allowing the next genuine trigger to work normally. In this way, we also gain the benefit that entry windows are never duplicated.

> #### Side note: how do different threads even see the same lock?
>
> The answer is that threads share the memory of their process. Every thread spawned in this app lives inside one Python process. There is exactly one \`TransientThoughtsApp\` instance on that process's heap, and every callback is a bound method on that one instance, so every \`self._prompt_lock\` resolves to the same lock object. The lock itself is an OS-level mutex, so the underlying kernel guarantees that two threads can never acquire it at the same time.
>
> However, if we launched the app twice, we would get two separate app processes with their separate heaps and two unrelated locks.

## Settings

For a while, the only configurable setting was the asynchronous prompting interval, and it lived in a single command-line flag, \`--interval 30\`. A configurable startup option is fine, but real, consistent app use needs more than that: a user should be able to configure parameters and window placement dynamically while the app is running.

Thus, the interval graduated into a \`Settings\` object that the orchestrator holds, edited through a custom \`ui.py\` settings window reachable from the tray. That window follows the same callback pattern as the rest of the app: it operates in its own thread and blocks until it collects the user's choices; then, it hands them back to the orchestrator that then persists them.

\`\`\`python
def _on_settings(self):
    def _run():
        ui.show_settings_window(self.settings, self._on_settings_save)

    threading.Thread(target=_run, daemon=True).start()

def _on_settings_save(self, new_settings):
    self.settings = new_settings
    settings_module.save(new_settings)
\`\`\`

However, now we have two separate problems to think about. The first is making a change take effect on an app that is already running, and the second is writing it to disk without ever corrupting what is there.

### Live Reload

> When the user saves a new interval, how does a loop that is already running pick it up?

The answer is that nothing caches the interval. The timer re-reads \`self.settings\` on every pass rather than reading it once at startup:

\`\`\`python
def _timer_loop(self):
    while not self._stop_event.is_set():
        # more close to the actual code, than the _timer_loop presented above
        # re-read on every pass, never cached at startup
        wait_seconds = max(60, self.settings.interval_minutes * 60)
        self._stop_event.wait(timeout=wait_seconds)
        ...
\`\`\`

So when the save callback swaps \`self.settings\` for a new object, the timer will read the new value the next time it wakes up.

### Safe Persistence

> A change also has to survive a round-trip to disk. How do we load and save settings without a half-written file, or an old build choking on a field it has never seen?

The settings are an ordinary dataclass written to disk as JSON, so the only part we need to worry about is making that round-trip safe in both directions.

On the way in, anything in the file that is not a known field is dropped:

\`\`\`python
try:
    data = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
except (OSError, ValueError):
    return Settings()

fields = Settings.__dataclass_fields__
return Settings(**{k: v for k, v in data.items() if k in fields})
\`\`\`

This gives us **forward compatibility** for free. A file written by a *newer* version, carrying fields this build has never heard of, still loads instead of throwing, meaning we never have to explicitly version the schema.

On the way out, the write is **atomic**. We dump to a temporary file and then rename it over the target:

\`\`\`python
tmp_path.write_text(json.dumps(asdict(settings), indent=2))
os.replace(tmp_path, SETTINGS_PATH)  # a rename cannot half-finish
\`\`\`

So a reader can never catch a partially written file. It sees the complete old settings or the complete new ones, and never a blend of the two. This is the same all-or-nothing guarantee SQLite gave us for writes back in the concurrency section, but now ported over to plain JSON with a single \`os.replace\`.

## Deployment

Everything so far assumes we launch the app by hand from a terminal. For something meant to run every day and alert you proactively, that quickly becomes tedious. We want two things: the ability to install it as a real program and for the program to automatically launch at system startup.

### Packaging

> How does a project sitting in a repo become a command we can run from anywhere, with no virtualenv to activate?

It comes from how \`pyproject.toml\` declares entry points. This project declares two:

\`\`\`toml
[project.scripts]
transient-thoughts = "transient_thoughts.main:main"

[project.gui-scripts]
transient-thoughts-gui = "transient_thoughts.main:main"
\`\`\`

Both run the same \`main\`, but the \`gui-scripts\` entry is built against the windowless Python launcher, so it starts with **no console window attached**. That difference does nothing here, but makes a clean login possible later. Installing is then one command:

\`\`\`
uv tool install git+https://github.com/frnnk/transient-thoughts
\`\`\`

\`uv tool install\` builds the project in its own isolated environment and puts both entry point commands on the \`PATH\`, so both \`transient-thoughts\` and \`transient-thoughts-gui\` run from anywhere with no virtualenv to activate. Doing this covers installing it system-wide; the next step is getting it to start on its own.

### Startup at Login

> Installed is not the same as running. How do we make the app come up at login, without a console window flashing on every boot?

We can do this via \`startup.py\`, exposed through a \`--setup-startup\` flag. On Windows, "run at login" means writing an entry under the \`Run\` registry key that points at an executable. We point it at \`transient-thoughts-gui\`, the windowless entry point wrapper declared above, so the tray icon appears at login with no terminal flash.

However, we do have to be careful about what type of executable we point the registry key towards:

\`\`\`python
def _is_inside_venv(exe: str) -> bool:
    # detect if the exe lives in <venv>/Scripts (a virtual environment)
    # a pyvenv.cfg two levels up means a venv
    return (Path(exe).parent.parent / "pyvenv.cfg").exists()
\`\`\`

A executable path written into the registry outlives the shell that wrote it. If we run \`--setup-startup\` from inside a development virtual environment, the executable it finds will also live inside that venv. After that, the moment we rebuild the venv (i.e. from uv adding or removing dependencies) or move the project, the executable we saved now points at nothing.

As a result, the app quietly stops starting, with no error to explain why. So before writing anything, \`startup.py\` refuses a venv-local executable path and prints the global \`uv tool install\` command to run instead.

With both halves in place, deployment is now complete. We now have a journaling tray app that automatically launches with every startup.

## Closing Thoughts

During this project I often decided to go the simplest route and tried to see where that would take me. The four-module decoupling architecture, with the orchestrator owning every callback, was something I've already experimented with in previous projects. Then, after the basic app was fully functional, I added on more features that built on top of that established architecture.

Looking back, what I expected to be a simple journaling project instead turned out to be a very insightful experiment: it helped me bridge the gap between building isolated apps/scripts and full-on desktop apps interfacing with operating systems. 

I'll end here with a lesson I learned: a sizable portion of the difficult in building an app will come from where it meets the system around it, not in what it was built to do.
    `,
  },
  {
    slug: 'graduation-and-a-record-of-curiosities',
    title: 'Graduation and a Record of Curiosities',
    date: '2026-05-19',
    quarter: 'Q2',
    year: 2026,
    categories: ['lifestyle', 'creative'],
    tags: ['lifestyle'],
    projectSlugs: [],
    content: `
# Graduation and a Record of Curiosities

My graduation at MIT is near and that means I finally have free time to update this website. First, let me dust off my creative writing skills. 

I first created this website to catalog my projects and improve my software development skills, serving as a way to motivate myself.
I find that it's easy to fall into a lull of complacency where outside self-learning stalls, especially when learning new things is inherently uncomfortable.

But now it has blossomed into something more meaningful.

As my time at mit enters its twilight chapter, I realize I have developed this annoying curiosity for the domain I'm entering, with it clinging to me like a sticky and durable web. 
It's a nagging itch that can't be scratched properly, an unquenchable thirst, and a cry for new knowledge and understanding. 

Yet, even I remain skeptical as to whether this fervor will last. Maybe that curiosity will transform
into something else more grounded or even fade out entirely. 

Even so, this website now takes up the role of capturing this very special period of my life. It is a record of curiosities, a snapshot of passion, and most importantly, a 
momento of my fresh eyes after graduation.

So, into the abyss I go.

I look forward to my next chapter.
    `,
  },
  {
    slug: 'building-small-agentic-systems',
    title: 'Building Small Agentic Systems with HITL',
    date: '2026-01-26',
    updated: '2026-06-20',
    quarter: 'Q1',
    year: 2026,
    categories: ['technical'],
    tags: ['agentic systems', 'architecture'],
    projectSlugs: ['messaging-agent'],
    content: `
# Building Small Agentic Systems with HITL

## Overview

When I first heard about AI agents, the term was more like a buzz word. I knew it was relevant, I knew it had something to do with large language models (LLMs), 
but I didn't know how it worked at all. With this in mind, I want to talk more about my initial learning experiences building AI agents in this blog, 
in the form of designing and constructing a lightweight but powerful Langgraph harness for cheap models. 

## Harnesses

> But first, what are AI agents and harnesses?

Ai agents are llms (like Claude, GPT, Gemini) paired with the ability to use tools that can execute tasks. On the other hand, **harnesses** compose of the underlying 
code infrastructure that allow llms to interact with these tools and other llms.

In other words, *AI agents are workers with specific goals, while harnesses enable agents to perform specific actions that reach these goals*. 
Consider **Claude Code** as an example: it's a powerful yet lightweight harness that allows anthropic's claude models to act as an agent; by allowing the model to use 
numerous built-in tools, it becomes a worker and completes tasks on your behalf.

## Tools

> Another term that's been thrown around: **tools**. What are they?

Tools are functions written with code. To see these tools, an llm's prompt is injected with a list of key attributes: *the function name, its description and when to use it, 
as well as the signature of its arguments and the value it returns*.

The llm never receives the function itself, only a text rendering of it. A potential \`search_files\` function in our harness reaches the model as three plain lines of text 
within the prompt:

\`\`\`python
def search_files(query: str) -> list[str]:  # the real function, lives in the harness
    """Find files in the project whose contents match the query."""
    ...

# the llm only ever sees this text rendering of the tool, never the function
tool_prompt = """
name: search_files
description: Find files in the project whose contents match the query.
signature: search_files(query: str) -> list[str]
"""

# the tool text is injected straight into the prompt the model receives
prompt = system_instructions + tool_prompt + user_message
\`\`\`

The model reads \`prompt\` from top to bottom, with \`tool_prompt\` sitting inside of it like any other instruction. When it decides the tool is needed, 
it cannot run \`search_files\` on its own; instead, it replies with a structured **tool call** that names the tool and fills in its arguments. 

The harness then *intercepts that call*, runs the real function with the arguments, and feeds the return value back into the prompt as the next message.


## Handling Ambiguity

Now that we have some context on this project, let's get back to designing our harness.

Starting out, there are some priorities for our harness that we want to design for. We want to construct a
*lightweight but powerful harness, that allows cheaper models to accomplish simple and structured tasks efficiently*. This implies that our
intended scope would be small: no need for parallel agents or complex orchestration, but rather an emphasis on solving problems
that arise with using cheaper models.

Choosing cheaper models require model agnosticism but that can be solved by building the harness using **Langgraph**, a model-agnostic framework
for building agents. The harder problem in a sense is *making cheaper models less dumb*. Even with a simplified task surface, problems with agent execution 
arose when task ambiguity varied. 

### The Problem of Consistency

The first problem was a *lack of consistency*: fully autonomous agents (even cheap models) equipped with a toolbox can be powerful with tasks that are explicitly instructed, but under those with 
even a little ambiguity, a sole focus on task execution creates inconsistent results that may not align with user intent. 

With tighter prompt tuning and tool description writing, this risk can be mitigated but cheaper models still lack in the ability to *predict user intent* compared
to frontier models. To remedy this, we instead allow our agent to voice concerns and flag ambiguity when they spot it.

### Pre-emptive Clarification

Before an agent takes action, it should assess whether it has enough information to complete the task and whether it understands the task itself. If there is ambiguity that can distort the intent
of the request, the agent uses a special **clarification tool** that asks the end-user one or more clarification questions.

\`\`\`python
@tool
def request_clarification(question: str, context: str = "") -> str:
    """Request clarification from the user when information is ambiguous."""
    return "Clarification pending"


async def human_clarification(state: RequestState):
    """
    Human-in-the-loop clarification node. When a model uses the 
    request_clarification tool, the harness state is routed to this node.

    Interrupts execution to get user clarification when information is ambiguous.
    Handles remaining tool calls after clarification is received.
    """
    pending = state['pending_action']
    clarifications = pending['clarifications']

    # interrupt and wait for user responses
    result = interrupt(None)
    responses = result.get('responses', [])
    ...
\`\`\`

These clarification questions will be sent back to the end-user to be answered, and the state of the harness can be saved and then restored when answers arrive.

### The Problem of Hand Holding

> Naturally another question comes up. Can an agent ask for too much clarification?

At this point, we've given agents plenty of room for clarifying any ambiguity. However, another end of the spectrum is dealing with too much clarification, which leads to a feeling of **hand holding**.

By nature, we should expect agents to be independent and agentic: *they shouldn't ask clarification questions that can be inferred from logic, common sense, or retrieved via tools*.
This expectation becomes harder to manage when we deal with cheaper models, but tighter prompt tuning and designating a reviewer agent helps out significantly. However, at the end of the day, this problem is
a lot better to have than agents being misaligned to user intent and we are okay with dealing with this trade-off.

## Handling Side Effects

Up to this point, our focus has been on making sure an agent understands *what it should do* before acting. 

But getting the intent right is only half of the battle. 
The moment an agent acts on that intent, the concern naturally *shifts from understanding to responsibility*: not whether it read the task correctly,
but whether its actions leave behind any consequences once they run. For cheaper agents in our use case, this issue is more pronounced since user misalignment is
even easier.

### The Problem with Destructive Actions

> What happens once we hand an agent tools that change state and can be destructive?

For harness efficiency, a common dilemma is *lack of control*: if we want to give agents more power to complete tasks, we
need to give them access to tools that modify state, but these tools often create noticible side-effects or artifacts.

Therefore, if agents are given access to tools that have destructive side-effects, there should be a way to monitor and green light their use. 

### Human-in-the-Loop Confirmation

We can install *strategic checkpoints for confirmation* when actions with side effects (writes, updates, deletes) are decided on by an agent. These checkpoints will require explicit user 
confirmation and adds an additional safety layer without sacrificing the agent's ability to reason and plan.

\`\`\`python
async def human_confirmation(state: RequestState):
    """
    Human-in-the-loop confirmation node. Automatically routes to this node
    if the model calls a tool that carries a side effect.

    Interrupts execution to get user approval for tool calls with side effects.
    Resume with /resume, and processes approval results, modifying state accordingly.

    Preserves memory by appending new messages instead of modifying existing ones.
    """
    tool_calls = state['pending_action']['tool_calls']

    # the interrupt() function pauses execution and returns when resumed
    # requires at least one argument (the value is not used)
    approval_results = interrupt(None)
    ...
\`\`\`

Similar to pre-emptive clarification, a summary of the tool call is sent back to the end-user for confirmation, and requires harness state to be saved and then restored to resume the conversation.

## Closing Thoughts

Practically, I believe that *a small harness is enough for most everyday tasks*, as these tasks are often not complex enough 
to warrant the use of frontier models (and API credits are already expensive enough). Through a more robust harness, we can 
stick to cheaper models to perform these tasks effectively and efficiently.

In the future, I'll continue to try and scale the design to see where the limit lies, but its good enough to customize for your own use as is.

Feel free to take a look at the source code on my Github; it's still very experimental but I am excited to learn a lot more as I keep building!
    `,
  },
  {
    slug: 'mcp-oauth-patterns',
    title: 'OAuth Design Patterns for HTTP MCP Servers',
    date: '2026-01-11',
    updated: '2026-06-22',
    quarter: 'Q1',
    year: 2026,
    categories: ['technical'],
    tags: ['mcp tooling', 'oauth', 'architecture'],
    projectSlugs: ['mcp-server-framework'],
    content: `
# OAuth Design Patterns for HTTP MCP Servers

## Overview

Before this project, OAuth was something very opaque: I'd clicked through many "Sign in with..." screens as a user, but I'd never 
completely understood the logic behind them. Adding it to an MCP server became my way of understanding more about these procedures, 
and the first thing I learned is that implementing OAuth differs in difficulty depending on your intended scope.

For local use on a *single machine*, that difficulty stays manageable. Constructing standard input/output (**stdio**) transport-based MCP
servers makes incorporating OAuth easy, since you're only ever keeping track of a handful of credentials that can be set up by hand.

## Beyond local use

However, if we want to serve *multiple* end-user clients operating from their own machines, that becomes a different story.
The mcp server must now keep track of multiple OAuth credentials while simultaneously establishing a seamless, 
hands-off flow that end-users can use to authenticate themselves automatically.

As such, we turn to **streamable http** mcp servers, which can either be stateful or stateless depending on the nature of the tool calls being implemented.

## A Layered Approach

> With a streamable http server chosen, the next problem is *architectural layout*. How should the server's logic be structured?

When designing this mcp server, our goal is to provide an architectural design that can:
1. serve end-users and manage their oauth credentials asynchronously
2. provide an authorization flow for end users to authenticate themselves securely
3. decouple OAuth, API, tool calling, and database related logic from each other to allow for extensibility in the future

These goals translate into two central layers: a gateway that decides whether a tool call needs authorization, and a flow that authenticates the end-user when it does.

### The OAuth Gateway

One of the key architecture decisions is to establish a centralized **OAuth gateway**, a singular source of truth that handles all OAuth routing logic. *All tool
call requests pass through this node*, and the logic here determines if an OAuth-related authorization flow should be triggered. Likewise, if credentials are 
already present, the tool call request will finish without a problem.

In practice, we attempt to retrieve the credentials associated with an end-user id for all tool call requests that require authorization. If the credentials 
are not present, then the *authorization flow is triggered by throwing a custom error* that is caught further upstream. 

In this manner, OAuth routing logic is decoupled from authorization flow logic.

### The Authorization Flow

When the gateway throws that custom error, it hands control to the authorization flow.

The **authorization flow** encompasses the latter half of the authorization process, but the logic here is shared between provider-specific OAuth procedures, the
API layer, and the end-user. It is a standard OAuth 2.0 flow designed so that third-party authorization is only exposed to the end-user, and *not* to any middleware.

At a high level, the authorization flow for third-party auth can be broken down as follows:
1. save the third-party provider state (permission scopes and other metadata)
2. generate a server-hosted link to return to the end-user, that the end-user can click on
3. when the end-user hits the server endpoint, build a third-party auth link from the saved state, including a specific server callback endpoint
4. redirect the end-user to the third-party auth link to authorize
5. third-party service uses the specific server callback to provide confirmation details
6. the server uses the confirmation details to exchange for end-user credentials from the third-party service

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
