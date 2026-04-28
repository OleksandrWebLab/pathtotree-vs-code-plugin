import * as vscode from 'vscode';

export const STATUSES = ['inbox', 'backlog', 'todo', 'in-progress', 'review', 'done', 'archived'] as const;
export type TaskStatus = (typeof STATUSES)[number];

export const PRIORITIES = ['highest', 'high', 'medium', 'low', 'lowest'] as const;
export type TaskPriority = (typeof PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
    'inbox': 'Inbox',
    'backlog': 'Backlog',
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Ready for Review',
    'done': 'Done',
    'archived': 'Archived',
};

export interface Task {
    fileUri: vscode.Uri;
    title: string;
    status: TaskStatus | null;
    priority: TaskPriority;
    created: string | null;
    updated: string | null;
    summary: string;
    body: string;
}

export interface TaskParseError {
    fileUri: vscode.Uri;
    fileName: string;
    message: string;
}

export type TaskEntry =
    | { kind: 'task'; task: Task }
    | { kind: 'error'; error: TaskParseError };
