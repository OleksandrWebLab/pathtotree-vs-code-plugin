import * as vscode from 'vscode';
import matter from 'gray-matter';
import { TaskStore } from '../store/task-store';
import { atomicWrite } from '../file-system/atomic-write';
import { pathExists } from '../file-system/path-utils';
import { TASKS_README_CONTENT } from '../templates/tasks-readme';
import { INITIAL_TASK_BODY, INITIAL_TASK_FILENAME } from '../templates/initial-task';

export interface EnsureTasksFolderResult {
    tasksDir: vscode.Uri;
    initialized: boolean;
}

export async function ensureTasksFolder(store: TaskStore): Promise<EnsureTasksFolderResult | undefined> {
    if (!vscode.workspace.workspaceFolders?.length) {
        await vscode.window.showErrorMessage('Open a workspace folder first to manage tasks.');
        return undefined;
    }

    const alreadyExisted = store.hasTasksDir();
    const tasksDir = await store.ensureTasksDir();
    if (!tasksDir) {
        return undefined;
    }

    let initialized = false;

    const readmeUri = vscode.Uri.joinPath(tasksDir, 'README.md');
    if (!(await pathExists(readmeUri))) {
        await atomicWrite(readmeUri, TASKS_README_CONTENT);
        initialized = true;
    }

    if (!alreadyExisted) {
        const welcomeUri = vscode.Uri.joinPath(tasksDir, INITIAL_TASK_FILENAME);
        if (!(await pathExists(welcomeUri))) {
            const data: Record<string, unknown> = {
                title: 'Welcome to PathToTree',
                status: 'backlog',
                priority: 'medium',
                created: new Date(),
            };
            await atomicWrite(welcomeUri, matter.stringify(INITIAL_TASK_BODY, data));
            initialized = true;
        }
    }

    if (initialized) {
        await store.rescan();
    }

    return { tasksDir, initialized };
}
