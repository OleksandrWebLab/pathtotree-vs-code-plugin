export const TASKS_README_CONTENT = `# Tasks

This folder holds the project's task list. Each file is one task in markdown with a YAML frontmatter header. Task files are committed alongside the code, so the task list travels with the repository.

## Task file format

\`\`\`markdown
---
title: Short task title
status: backlog
priority: medium
created: 2026-04-27T12:00:00.000Z
updated: 2026-04-27T12:00:00.000Z
---

Free-form markdown body: context, links, code snippets.
\`\`\`

## Frontmatter fields

- \`title\` - short title (required)
- \`status\` - current status (required)
- \`priority\` - priority (optional, defaults to \`medium\`)
- \`created\` - ISO creation date (required, set automatically)
- \`updated\` - ISO date of the last change (optional)

Extra fields (e.g. \`tags\`, \`due\`) are preserved as-is. The plugin does not interpret or remove them.

## Workflow

The project follows a six-stage flow. Move tasks one stage at a time:

1. \`backlog\` - long-term pile of ideas. May contain hundreds of items. Most won't be touched soon.
2. \`todo\` - selected from backlog for the current iteration. A small, focused set.
3. \`in-progress\` - actively being worked on right now.
4. \`review\` - work is finished and waiting for human verification before being closed.
5. \`done\` - reviewed and accepted. Stays here until the user runs a recap and archives it.
6. \`archived\` - closed, no longer relevant. Cancelled tasks also live here; the cancellation reason is described in the task body.

\`backlog\`, \`done\`, and \`archived\` are collapsed by default in the panel.

## Allowed values

### status

- \`backlog\`
- \`todo\`
- \`in-progress\`
- \`review\`
- \`done\`
- \`archived\`

### priority

Five Jira-style levels, ordered from most urgent to least:

- \`highest\` - drop everything, do this now
- \`high\` - important, schedule into the current iteration
- \`medium\` - default, normal work
- \`low\` - nice to have, not blocking anything
- \`lowest\` - parking lot, may never be done

Within a section, tasks are sorted by priority first (highest at the top), then by creation date.

## Minimal example

\`\`\`markdown
---
title: Add login screen
status: backlog
created: 2026-04-27T12:00:00.000Z
---
\`\`\`

## Notes for AI agents

If you are an AI assistant working in this repository:

- To create a task, add a new markdown file in this folder following the format above. Default \`status\` is \`backlog\` unless the user asked for something else.
- Do not modify other tasks without an explicit request.
- When you change the status of a task, also update the \`updated\` field to the current timestamp.
- Move tasks through statuses in order: \`backlog\` -> \`todo\` -> \`in-progress\` -> \`review\` -> \`done\` -> \`archived\`. Skipping stages is allowed only when the user explicitly says so.
- Never write to \`done\` or \`archived\` directly without going through \`review\` unless the user explicitly tells you to skip review.
- Cancelled work goes to \`archived\` with a short note in the body explaining why.
`;
