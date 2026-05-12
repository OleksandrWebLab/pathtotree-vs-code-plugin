> [!IMPORTANT]
> **This project has moved.**
>
> The plugin have been merged into a single extension — **Sonara**.
>
> 👉 New repository: **[github.com/ArtisanWebLab/sonara](https://github.com/ArtisanWebLab/sonara)**
>
> This repository is archived and will no longer receive updates, bug fixes, or new features. Please switch to Sonara for the latest version.

# PathToTree — Markdown Tasks for VS Code

Project tasks as markdown files committed alongside your code. One file per task, YAML frontmatter for metadata, a webview panel that renders them as cards grouped by status. The whole task list travels with the repo, so AI agents working in your project can read, create and update tasks the same way they touch any other file.

---

## Disclaimer / Personal License

This extension is a personal pet-project, built for myself and for fun.

### What this is
- An experiment and a way to scratch my own itch for a tasks panel that lives inside the repo
- Written on a "works for me, good enough" basis
- Never intended as a product

### What this is NOT
- **Supported** — please don't open issues asking for help, I won't respond
- **Open to pull requests** — I don't accept, review or merge them
- **On a roadmap** — there is no roadmap and there won't be one
- **Guaranteed** to be compatible, stable or secure — no guarantees whatsoever
- **Published on the VS Code Marketplace** — no, local `.vsix` only

### What you can do
- Download it, build it, install it for yourself
- Fork it and do whatever you want with it
- Use the code as an example or a starting point for your own extension

### Simple rules
- Works for me — great
- Doesn't work for you — feel free to dig in yourself or fork it
- Want a feature — fork the project, don't ping me

Provided **AS IS**, with no obligations on my side.

---

## Installation

### Option A — Install a prebuilt `.vsix` from GitHub Releases

1. Open the [Releases page](../../releases) and download the latest `pathtotree-<version>.vsix`
2. Install it into VS Code:
   ```bash
   code --install-extension pathtotree-<version>.vsix
   ```
   or in VS Code UI: `Extensions` panel → `...` menu → `Install from VSIX...` → pick the file
3. Reload VS Code
4. Open any workspace folder, click the PathToTree icon in the Activity Bar, and press **Initialize Tasks for This Project** — the extension creates a `tasks/` folder, a `tasks/README.md` for AI agents, and a starter task

### Option B — Build from source

Requires Docker + Docker Compose (no local Node.js needed).

```bash
git clone <your-repo-url> pathtotree
cd pathtotree

make install        # install npm deps (inside Docker)
make build          # compile TypeScript + package .vsix
make install-ext    # install the built .vsix into local VS Code
```

Other useful targets:

```bash
make compile        # tsc only
make watch          # tsc in watch mode
make lint           # eslint
make clean          # remove out/ and *.vsix
```

After `make install-ext`, reload VS Code.

---

## Releasing (maintainer notes)

Requires: `gh` CLI authenticated, git remote `origin` configured.

```bash
make release V=0.2.1
```

The [`tools/release.sh`](tools/release.sh) script will:

1. Validate the working tree is clean and the tag doesn't exist yet
2. Bump `package.json` + `package-lock.json` to the given version (via `npm version`)
3. Run `make clean && make build` to produce `pathtotree-<version>.vsix`
4. Commit `chore: release vX.Y.Z`, create tag `vX.Y.Z`, push both to `origin`
5. Create a GitHub Release with the `.vsix` attached and auto-generated notes from commits

---

## Usage

Tasks live in `tasks/` at the workspace root. Each `.md` file is one task. Subfolders are allowed and are scanned recursively — they are purely a way to organise files for the user, the plugin doesn't interpret them.

### Task file format

```markdown
---
title: Add login screen
status: backlog
priority: medium
created: 2026-04-27T12:00:00.000Z
updated: 2026-04-27T13:42:00.000Z
---

Free-form markdown body: context, links, code snippets.
```

**Frontmatter fields:**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | required | Short title shown in the panel; falls back to the filename if missing |
| `status` | required | One of the seven values below; missing or invalid → "No Status" group |
| `priority` | optional | Defaults to `medium` |
| `created` | required | ISO timestamp; set automatically by the plugin on creation |
| `updated` | optional | ISO timestamp; touched only when the plugin edits the task itself, not on manual edits |

Unknown fields (e.g. `tags`, `due`, custom IDs) are preserved as-is — the plugin reads what it understands and never strips fields it doesn't.

### Workflow — seven stages

```
inbox  →  backlog  →  todo  →  in-progress  →  review  →  done  →  archived
```

- `inbox` — entry point for everything new. Every task created by the plugin or by an AI agent lands here first. Review and promote manually
- `backlog` — long-term pile of ideas. May contain hundreds of items
- `todo` — pulled from backlog into the current iteration
- `in-progress` — actively being worked on right now
- `review` — work is finished and waiting for human verification
- `done` — reviewed and accepted, kept visible until you run a recap
- `archived` — closed, no longer relevant. Cancelled work also lives here, with a reason in the body

`inbox` is always expanded so new arrivals are immediately visible. `backlog`, `done` and `archived` are collapsed by default. The collapsed/expanded state of each section is remembered per workspace.

### Priorities — five Jira-style levels

`highest` → `high` → `medium` → `low` → `lowest`

Within a section, tasks are sorted by priority first (highest at the top), then by creation date (newest first). Each card has a coloured 2px left border matching its priority, plus the priority label in the meta row.

### Panel layout

Activity Bar → PathToTree → cards grouped by status. Each card shows:

- **Meta row:** priority label, creation date, two icon buttons on the right — copy text (the markdown body without frontmatter) and copy file path
- **Title** — clickable, opens Markdown Preview in the side editor group
- **Summary** — first ~160 chars of the body, click to expand/collapse
- **Action row:** `Show` (preview), `Edit` (open file in side editor group), `Status ▾`, `Priority ▾`, `Delete`

`Show` / Edit and Markdown Preview always open in the **side** column, so the chat tab or any file you were working with stays visible.

Section headers have a `+` button (visible on hover) that creates a new task pre-filled with that section's status.

### Drag-and-drop

Drag any card from one section's body to another to change its status. The card goes semi-transparent, the target section highlights, and on drop the file's frontmatter is updated atomically (and `updated` is touched to the current timestamp). There's no manual reordering inside a section — order is driven by priority + creation date.

### Search

The search box at the top of the panel filters by title, summary and full body content (debounced 200 ms). Search runs against the in-memory state, not the file system, so it's instant.

### Commands (Command Palette → `PathToTree: ...`)

- `PathToTree: New Task` — prompt for a title, create an `inbox` task, open it in the editor with the cursor in the body
- `PathToTree: Refresh` — re-read all task files from disk (in case the file watcher missed something)
- `PathToTree: Initialize for This Project` — same as the welcome button: create `tasks/`, `tasks/README.md`, and a starter task

The `+` and `↻` icons in the panel's title bar bind to **New Task** and **Refresh** respectively, plus each section header has its own `+` for status-pre-filled creation.

### Configuration

There is none. Statuses, priorities, colours, the location of `tasks/`, defaults — everything is hardcoded by design. If you want different statuses or a different folder, fork the project.

---

## How it works

- The single dependency is [`gray-matter`](https://github.com/jonschlinkert/gray-matter) for parsing and serialising frontmatter, plus the `js-yaml` it pulls in. Everything else is the VS Code API
- A `TaskStore` scans `tasks/` recursively at startup and on every refresh, parses each `.md` file, and keeps the result in memory
- A `FileSystemWatcher` on `tasks/**/*.md` reacts to creates, changes, deletes — including manual edits and `git pull` — and re-renders the panel automatically. The plugin never touches `updated` on manual edits, that's your responsibility
- `tasks/README.md` (in the root of the tasks folder) is excluded from parsing — it's the AI-agent-facing instruction file, not a task
- All writes go through an atomic `tmp + rename` so a crash mid-write can never leave a half-written task file
- When updating frontmatter the plugin only mutates the keys it knows about (`status`, `priority`, `updated`); the order of fields, unknown keys, and YAML formatting are preserved
- The panel itself is a `WebviewViewProvider` that renders cards in plain HTML/CSS/JS, themed with VS Code CSS variables (`--vscode-*`), and communicates with the extension host via `postMessage`
- `retainContextWhenHidden: true` keeps the panel's DOM and search state alive when you switch sidebar tabs; the list of collapsed sections is also persisted in `workspaceState` so it survives a VS Code restart

### What the plugin does NOT do

By design (see the spec):

- No drag-and-drop ordering inside a section
- No filters or sorting beyond priority + creation date
- No tags, no due dates, no reminders
- No GitHub Issues / Linear / Jira integration
- No reports, statistics or progress charts
- No multi-folder tasks, no synchronisation between machines (that's git's job)
- No undo/redo for plugin operations beyond what VS Code's file system gives you

Requirements on the host:

- VS Code 1.85+
- Docker + Docker Compose (only for building from source)
