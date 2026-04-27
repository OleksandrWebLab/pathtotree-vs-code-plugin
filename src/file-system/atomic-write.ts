import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export async function atomicWrite(fileUri: vscode.Uri, content: string): Promise<void> {
    const target = fileUri.fsPath;
    const dir = path.dirname(target);
    const base = path.basename(target);
    const tmpPath = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);

    await fs.writeFile(tmpPath, content, 'utf8');
    await fs.rename(tmpPath, target);
}
