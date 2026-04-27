import * as vscode from 'vscode';
import * as path from 'path';
import matter from 'gray-matter';
import {
    PRIORITIES,
    STATUSES,
    Task,
    TaskEntry,
    TaskPriority,
    TaskStatus,
} from '../types';

export async function parseTaskFile(fileUri: vscode.Uri): Promise<TaskEntry> {
    const fileName = path.basename(fileUri.fsPath, '.md');

    let raw: string;
    try {
        const bytes = await vscode.workspace.fs.readFile(fileUri);
        raw = Buffer.from(bytes).toString('utf8');
    } catch (e) {
        return errorEntry(fileUri, fileName, `Cannot read file: ${(e as Error).message}`);
    }

    const stripped = raw.replace(/^﻿/, '');
    if (!/^---\s*\r?\n/.test(stripped)) {
        return errorEntry(fileUri, fileName, 'Missing YAML frontmatter');
    }

    let parsed: ReturnType<typeof matter>;
    try {
        parsed = matter(stripped);
    } catch (e) {
        return errorEntry(fileUri, fileName, `Invalid YAML frontmatter: ${(e as Error).message}`);
    }

    const data = parsed.data as Record<string, unknown>;

    const titleRaw = data.title;
    const title = typeof titleRaw === 'string' && titleRaw.trim() !== ''
        ? titleRaw.trim()
        : fileName;

    const statusRaw = data.status;
    const status: TaskStatus | null =
        typeof statusRaw === 'string' && (STATUSES as readonly string[]).includes(statusRaw)
            ? (statusRaw as TaskStatus)
            : null;

    const priorityRaw = data.priority;
    const priority: TaskPriority =
        typeof priorityRaw === 'string' && (PRIORITIES as readonly string[]).includes(priorityRaw)
            ? (priorityRaw as TaskPriority)
            : 'medium';

    const body = parsed.content.trim();
    const summary = buildSummary(body);

    const task: Task = {
        fileUri,
        title,
        status,
        priority,
        created: stringifyDate(data.created),
        updated: stringifyDate(data.updated),
        summary,
        body,
    };

    return { kind: 'task', task };
}

function buildSummary(body: string): string {
    if (!body) {
        return '';
    }
    const lines = body.split(/\r?\n/);
    const meaningful: string[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (meaningful.length > 0) {
                break;
            }
            continue;
        }
        if (/^#{1,6}\s/.test(trimmed)) {
            continue;
        }
        meaningful.push(trimmed.replace(/^[-*+]\s+/, '').replace(/`+/g, ''));
        if (meaningful.length >= 3) {
            break;
        }
    }
    const joined = meaningful.join(' ');
    if (joined.length <= 160) {
        return joined;
    }
    return joined.slice(0, 157).trimEnd() + '...';
}

function errorEntry(fileUri: vscode.Uri, fileName: string, message: string): TaskEntry {
    return {
        kind: 'error',
        error: { fileUri, fileName, message },
    };
}

function stringifyDate(value: unknown): string | null {
    if (value === undefined || value === null) {
        return null;
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'string') {
        return value;
    }
    return null;
}
