import * as vscode from 'vscode';

export async function pathExists(uri: vscode.Uri): Promise<boolean> {
    try {
        await vscode.workspace.fs.stat(uri);
        return true;
    } catch {
        return false;
    }
}

export function toKebabCase(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export async function generateUniqueFilename(tasksDir: vscode.Uri, title: string): Promise<string> {
    const base = toKebabCase(title) || 'task';
    let candidate = `${base}.md`;
    let counter = 2;
    while (await pathExists(vscode.Uri.joinPath(tasksDir, candidate))) {
        candidate = `${base}-${counter}.md`;
        counter += 1;
    }
    return candidate;
}
