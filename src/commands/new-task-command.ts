import * as vscode from 'vscode';
import matter from 'gray-matter';
import { TaskStore } from '../store/task-store';
import { atomicWrite } from '../file-system/atomic-write';
import { generateUniqueFilename } from '../file-system/path-utils';
import { ensureTasksFolder } from './ensure-tasks-folder';

export async function executeNewTask(store: TaskStore): Promise<void> {
    const ensured = await ensureTasksFolder(store);
    if (!ensured) {
        return;
    }
    const tasksDir = ensured.tasksDir;

    const title = await vscode.window.showInputBox({
        prompt: 'Task title',
        placeHolder: 'e.g. Add login screen',
        ignoreFocusOut: true,
        validateInput: value => (value.trim() === '' ? 'Title cannot be empty' : null),
    });
    if (!title) {
        return;
    }
    const trimmedTitle = title.trim();

    const filename = await generateUniqueFilename(tasksDir, trimmedTitle);
    const fileUri = vscode.Uri.joinPath(tasksDir, filename);

    const data: Record<string, unknown> = {
        title: trimmedTitle,
        status: 'inbox',
        priority: 'medium',
        created: new Date(),
    };
    const content = matter.stringify('\n', data);
    await atomicWrite(fileUri, content);

    const document = await vscode.workspace.openTextDocument(fileUri);
    const editor = await vscode.window.showTextDocument(document);
    const lastLine = document.lineCount - 1;
    const cursor = new vscode.Position(lastLine, document.lineAt(lastLine).text.length);
    editor.selection = new vscode.Selection(cursor, cursor);
}
