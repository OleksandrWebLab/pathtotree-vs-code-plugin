import * as vscode from 'vscode';
import { PANEL_STYLES } from './panel-styles';
import { PANEL_SCRIPT } from './panel-script';

export function buildPanelHtml(_webview: vscode.Webview, _extensionUri: vscode.Uri): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<title>Tasks</title>
<style nonce="${nonce}">${PANEL_STYLES}</style>
</head>
<body>
<div class="header">
    <input class="search-box" id="searchInput" type="text" placeholder="Search tasks...">
</div>
<div class="body" id="root"></div>
<script nonce="${nonce}">${PANEL_SCRIPT}</script>
</body>
</html>`;
}

function getNonce(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i += 1) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}
