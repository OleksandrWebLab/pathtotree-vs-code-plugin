export const TASKS_README_CONTENT = `# Tasks

This folder holds the project's task list. Each file is one task in markdown with a YAML frontmatter header. Task files are committed alongside the code, so the task list travels with the repository.

## Task file format

\`\`\`markdown
---
title: Short task title
status: inbox
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

The project follows a seven-stage flow:

1. \`inbox\` - entry point for all new tasks. Every new task lands here by default. The user reviews inbox and decides what to do with each item: promote to backlog, todo, or discard.
2. \`backlog\` - long-term pile of ideas. May contain hundreds of items. Most won't be touched soon.
3. \`todo\` - selected from backlog for the current iteration. A small, focused set.
4. \`in-progress\` - actively being worked on right now.
5. \`review\` - work is finished and waiting for human verification before being closed.
6. \`done\` - reviewed and accepted. Stays here until the user runs a recap and archives it.
7. \`archived\` - closed, no longer relevant. Cancelled tasks also live here; the cancellation reason is described in the task body.

\`backlog\`, \`done\`, and \`archived\` are collapsed by default in the panel. \`inbox\` is always expanded so new arrivals are immediately visible.

## Allowed values

### status

- \`inbox\`
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

## Notes for AI agents

If you are an AI assistant working in this repository:

### Task body structure

Break the task body into actionable checklist items so progress is trackable:

\`\`\`markdown
- [ ] Do this
- [ ] Check that
- [ ] Clarify something
\`\`\`

Each distinct action should be a separate checkbox. Add context, links, or code snippets after the checklist.

### Creating tasks

- Default \`status\` for any new task is \`inbox\` unless the user explicitly named a different status.
- Never put a newly created task directly into \`backlog\`, \`todo\`, or further without being asked.

### Merging or rewriting tasks

- When you merge two tasks into one, or substantially rewrite an existing task, set its status to \`inbox\` and ask the user what to do with it next: promote to \`backlog\`, pull into \`todo\`, or something else.
- Do not silently leave a merged/rewritten task in its original status — the user needs to consciously decide where it belongs after the content changed.

### General rules

- Do not modify other tasks without an explicit request.
- When you change the status of a task, also update the \`updated\` field to the current timestamp.
- Move tasks through statuses in order: \`inbox\` -> \`backlog\` -> \`todo\` -> \`in-progress\` -> \`review\` -> \`done\` -> \`archived\`. Skipping stages is allowed only when the user explicitly says so.
- Never write to \`done\` or \`archived\` directly without going through \`review\` unless the user explicitly tells you to skip review.
- Cancelled work goes to \`archived\` with a short note in the body explaining why.

### Closing a task (moving to \`done\` or \`archived\`)

When a task is complete or cancelled, do two things before changing the status:

1. **Mark each checklist item.** Check off completed items (\`- [x]\`). For skipped or cancelled items, leave them unchecked and append a short inline note, e.g. \`- [ ] Clarify X — skipped, no longer relevant\`.

2. **Append a short completion summary** at the bottom of the body:

\`\`\`markdown
---
Done: all items completed.

<!-- partial example: -->
Done: items 1-2 completed. Item 3 skipped — became irrelevant after the API change.
Also done outside original scope: updated the migration, cleaned up the old helper.
\`\`\`

Keep the summary to 2-4 sentences. Its purpose is to give future context without opening git history.
`;
