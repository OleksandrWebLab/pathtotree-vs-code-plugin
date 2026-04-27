import * as vscode from 'vscode';
import matter from 'gray-matter';
import { TaskStore } from '../store/task-store';
import { Task, TaskParseError, TaskPriority, TaskStatus, PRIORITIES, STATUSES } from '../types';
import { buildPanelHtml } from './panel-html';
import { updateFrontmatter } from '../parser/update-frontmatter';
import { atomicWrite } from '../file-system/atomic-write';
import { generateUniqueFilename } from '../file-system/path-utils';
import { ensureTasksFolder } from '../commands/ensure-tasks-folder';

type IncomingMessage =
    | { type: 'ready' }
    | { type: 'refresh' }
    | { type: 'initializeTasks' }
    | { type: 'newTask'; status: TaskStatus | null }
    | { type: 'openPreview'; id: string }
    | { type: 'openEditor'; id: string }
    | { type: 'copyText'; id: string }
    | { type: 'copyPath'; id: string }
    | { type: 'changeStatus'; id: string; status: TaskStatus }
    | { type: 'changePriority'; id: string; priority: TaskPriority }
    | { type: 'delete'; id: string }
    | { type: 'toggleSection'; sectionId: string; collapsed: boolean };

interface TaskDto {
    id: string;
    title: string;
    status: TaskStatus | null;
    priority: TaskPriority;
    created: string | null;
    updated: string | null;
    summary: string;
    body: string;
}

interface ErrorDto {
    id: string;
    fileName: string;
    message: string;
}

interface StateDto {
    tasks: TaskDto[];
    errors: ErrorDto[];
    hasTasksDir: boolean;
    projectName: string;
    collapsedSections: string[];
}

const COLLAPSED_SECTIONS_KEY = 'pathtotree.collapsedSections';
const DEFAULT_COLLAPSED_SECTIONS: readonly string[] = ['backlog', 'done', 'archived'];

export class TasksWebviewPanel implements vscode.WebviewViewProvider, vscode.Disposable {
    public static readonly VIEW_ID = 'pathtotree.tasks';

    private view: vscode.WebviewView | undefined;
    private readonly disposables: vscode.Disposable[] = [];

    public constructor(
        private readonly store: TaskStore,
        private readonly extensionUri: vscode.Uri,
        private readonly memento: vscode.Memento,
    ) {
        this.disposables.push(this.store.onDidChange(() => this.pushState()));
    }

    public resolveWebviewView(view: vscode.WebviewView): void {
        this.view = view;
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        view.webview.html = buildPanelHtml(view.webview, this.extensionUri);
        view.webview.onDidReceiveMessage((msg: IncomingMessage) => {
            void this.handleMessage(msg);
        });
        view.onDidChangeVisibility(() => {
            if (view.visible) {
                this.pushState();
            }
        });
        this.pushState();
    }

    private async handleMessage(msg: IncomingMessage): Promise<void> {
        switch (msg.type) {
            case 'ready':
            case 'refresh':
                await this.store.rescan();
                this.pushState();
                return;
            case 'initializeTasks':
                await ensureTasksFolder(this.store);
                this.pushState();
                return;
            case 'newTask':
                await this.handleNewTask(msg.status);
                return;
            case 'openPreview': {
                const uri = this.findUri(msg.id);
                if (uri) {
                    await vscode.commands.executeCommand('markdown.showPreviewToSide', uri);
                }
                return;
            }
            case 'openEditor': {
                const uri = this.findUri(msg.id);
                if (uri) {
                    const document = await vscode.workspace.openTextDocument(uri);
                    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside });
                }
                return;
            }
            case 'copyText': {
                const task = this.findTask(msg.id);
                if (task) {
                    await vscode.env.clipboard.writeText(task.body);
                    this.postCopied(msg.id, 'text');
                }
                return;
            }
            case 'copyPath': {
                const uri = this.findUri(msg.id);
                if (uri) {
                    await vscode.env.clipboard.writeText(uri.fsPath);
                    this.postCopied(msg.id, 'path');
                }
                return;
            }
            case 'changeStatus': {
                if (!STATUSES.includes(msg.status)) return;
                const task = this.findTask(msg.id);
                if (!task || task.status === msg.status) return;
                await updateFrontmatter(task.fileUri, { status: msg.status, updated: new Date() });
                return;
            }
            case 'changePriority': {
                if (!PRIORITIES.includes(msg.priority)) return;
                const task = this.findTask(msg.id);
                if (!task || task.priority === msg.priority) return;
                await updateFrontmatter(task.fileUri, { priority: msg.priority, updated: new Date() });
                return;
            }
            case 'delete':
                await this.handleDelete(msg.id);
                return;
            case 'toggleSection':
                await this.handleToggleSection(msg.sectionId, msg.collapsed);
                return;
        }
    }

    private async handleToggleSection(sectionId: string, collapsed: boolean): Promise<void> {
        const current = this.getCollapsedSections();
        const next = new Set(current);
        if (collapsed) {
            next.add(sectionId);
        } else {
            next.delete(sectionId);
        }
        await this.memento.update(COLLAPSED_SECTIONS_KEY, Array.from(next));
    }

    private getCollapsedSections(): string[] {
        return this.memento.get<string[]>(COLLAPSED_SECTIONS_KEY) ?? Array.from(DEFAULT_COLLAPSED_SECTIONS);
    }

    private async handleNewTask(status: TaskStatus | null): Promise<void> {
        const ensured = await ensureTasksFolder(this.store);
        if (!ensured) return;
        const tasksDir = ensured.tasksDir;

        const title = await vscode.window.showInputBox({
            prompt: 'Task title',
            placeHolder: 'e.g. Add login screen',
            ignoreFocusOut: true,
            validateInput: v => (v.trim() === '' ? 'Title cannot be empty' : null),
        });
        if (!title) return;
        const trimmed = title.trim();

        const filename = await generateUniqueFilename(tasksDir, trimmed);
        const fileUri = vscode.Uri.joinPath(tasksDir, filename);

        const data: Record<string, unknown> = {
            title: trimmed,
            status: status ?? 'backlog',
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

    private async handleDelete(id: string): Promise<void> {
        const uri = this.findUri(id);
        if (!uri) return;
        const task = this.findTask(id);
        const label = task ? task.title : this.findError(id)?.fileName ?? id;
        const choice = await vscode.window.showWarningMessage(
            `Delete task "${label}"? This cannot be undone from the plugin.`,
            { modal: true },
            'Delete',
        );
        if (choice !== 'Delete') return;
        await vscode.workspace.fs.delete(uri, { useTrash: true });
    }

    private postCopied(id: string, kind: 'text' | 'path'): void {
        this.view?.webview.postMessage({ type: 'copied', id, kind });
    }

    private pushState(): void {
        if (!this.view) return;
        this.view.webview.postMessage({ type: 'state', state: this.buildState() });
    }

    private buildState(): StateDto {
        const tasks: TaskDto[] = [];
        const errors: ErrorDto[] = [];
        for (const entry of this.store.getEntries()) {
            if (entry.kind === 'task') {
                tasks.push(taskToDto(entry.task));
            } else {
                errors.push(errorToDto(entry.error));
            }
        }
        return {
            tasks,
            errors,
            hasTasksDir: this.store.hasTasksDir(),
            projectName: vscode.workspace.workspaceFolders?.[0]?.name ?? '',
            collapsedSections: this.getCollapsedSections(),
        };
    }

    private findTask(id: string): Task | undefined {
        for (const entry of this.store.getEntries()) {
            if (entry.kind === 'task' && entry.task.fileUri.fsPath === id) {
                return entry.task;
            }
        }
        return undefined;
    }

    private findError(id: string): TaskParseError | undefined {
        for (const entry of this.store.getEntries()) {
            if (entry.kind === 'error' && entry.error.fileUri.fsPath === id) {
                return entry.error;
            }
        }
        return undefined;
    }

    private findUri(id: string): vscode.Uri | undefined {
        return this.findTask(id)?.fileUri ?? this.findError(id)?.fileUri;
    }

    public dispose(): void {
        for (const d of this.disposables) {
            d.dispose();
        }
    }
}

function taskToDto(task: Task): TaskDto {
    return {
        id: task.fileUri.fsPath,
        title: task.title,
        status: task.status,
        priority: task.priority,
        created: task.created,
        updated: task.updated,
        summary: task.summary,
        body: task.body,
    };
}

function errorToDto(error: TaskParseError): ErrorDto {
    return {
        id: error.fileUri.fsPath,
        fileName: error.fileName,
        message: error.message,
    };
}
