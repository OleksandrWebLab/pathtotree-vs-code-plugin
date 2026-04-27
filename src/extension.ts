import * as vscode from 'vscode';
import { TaskStore } from './store/task-store';
import { TasksWebviewPanel } from './webview/tasks-webview-panel';
import { executeNewTask } from './commands/new-task-command';
import { executeRefresh } from './commands/refresh-command';
import { executeCreateTasksFolder } from './commands/create-tasks-folder-command';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const output = vscode.window.createOutputChannel('PathToTree');
    context.subscriptions.push(output);
    output.appendLine('[Extension] Activated');

    const store = new TaskStore(output);
    context.subscriptions.push(store);

    const panel = new TasksWebviewPanel(store, context.extensionUri, context.workspaceState);
    context.subscriptions.push(panel);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(TasksWebviewPanel.VIEW_ID, panel, {
            webviewOptions: { retainContextWhenHidden: true },
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('pathtotree.newTask', () => executeNewTask(store)),
        vscode.commands.registerCommand('pathtotree.refresh', () => executeRefresh(store)),
        vscode.commands.registerCommand('pathtotree.createTasksFolder', () => executeCreateTasksFolder(store)),
    );

    await store.initialize();
}

export async function deactivate(): Promise<void> {
    // Disposables registered in subscriptions handle cleanup.
}
