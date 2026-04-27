import * as vscode from 'vscode';
import matter from 'gray-matter';
import { atomicWrite } from '../file-system/atomic-write';

export type FrontmatterPatch = Record<string, string | Date | null>;

export async function updateFrontmatter(fileUri: vscode.Uri, patch: FrontmatterPatch): Promise<void> {
    const bytes = await vscode.workspace.fs.readFile(fileUri);
    const raw = Buffer.from(bytes).toString('utf8');

    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;

    for (const [key, value] of Object.entries(patch)) {
        if (value === null) {
            delete data[key];
        } else {
            data[key] = value;
        }
    }

    const output = matter.stringify(parsed.content, data);
    await atomicWrite(fileUri, output);
}
