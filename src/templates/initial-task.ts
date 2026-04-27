export const INITIAL_TASK_FILENAME = 'welcome-to-pathtotree.md';

export const INITIAL_TASK_BODY = `
Welcome to PathToTree.

This is your first task. It was created automatically during initialization so you have something concrete to play with.

## Try this

- Open the PathToTree sidebar (checklist icon in the Activity Bar)
- Right-click this task and use Change Status to move it between columns
- Right-click and use Change Priority to switch between high / medium / low
- Click the "+" button in the panel header to create a new task
- Open \`tasks/README.md\` to see the task format documented for AI agents

## How it works

Each task is a separate markdown file under \`tasks/\`. The YAML frontmatter at the top stores metadata (status, priority, created, updated). Everything below the frontmatter is free-form markdown for the task description.

Task files are committed alongside your code, so the task list travels with the project instead of living in a separate service.

Feel free to delete this task or move it to \`done\` / \`archived\` once you have explored the plugin.
`;
