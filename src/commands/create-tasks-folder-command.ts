import * as vscode from 'vscode';
import { TaskStore } from '../store/task-store';
import { ensureTasksFolder } from './ensure-tasks-folder';
import { INITIAL_TASK_FILENAME } from '../templates/initial-task';

export async function executeCreateTasksFolder(store: TaskStore): Promise<void> {
    const ensured = await ensureTasksFolder(store);
    if (!ensured) {
        return;
    }

    if (ensured.initialized) {
        const welcomeUri = vscode.Uri.joinPath(ensured.tasksDir, INITIAL_TASK_FILENAME);
        try {
            const document = await vscode.workspace.openTextDocument(welcomeUri);
            await vscode.window.showTextDocument(document);
        } catch {
            // welcome file not present, skip silently
        }
    }
}
