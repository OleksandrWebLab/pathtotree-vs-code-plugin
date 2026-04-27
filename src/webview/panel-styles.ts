export const PANEL_STYLES = `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

body, body * { font-style: normal !important; }

.header {
    padding: 8px 10px 6px;
    border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border);
    flex-shrink: 0;
}
.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 6px;
}
.header-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vscode-sideBarSectionHeader-foreground);
}
.header-project {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.header-actions { display: flex; gap: 2px; }

.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 3px;
    color: var(--vscode-icon-foreground);
    font-size: 13px;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.1s, background 0.1s;
}
.icon-btn:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground); }

.search-box {
    width: 100%;
    padding: 4px 8px;
    background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border);
    color: var(--vscode-input-foreground);
    border-radius: 3px;
    font-size: 12px;
    outline: none;
}
.search-box:focus { border-color: var(--vscode-focusBorder); }
.search-box::placeholder { color: var(--vscode-input-placeholderForeground); }

.body {
    flex: 1;
    overflow-y: auto;
}

.welcome {
    padding: 18px 14px;
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    line-height: 1.5;
}
.welcome p { margin-bottom: 10px; }
.welcome-btn {
    display: inline-block;
    margin-top: 4px;
    padding: 6px 12px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}
.welcome-btn:hover { background: var(--vscode-button-hoverBackground); }

.section { border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border); }

.section-header {
    display: flex;
    align-items: center;
    height: 22px;
    padding: 0 4px 0 6px;
    background: var(--vscode-sideBarSectionHeader-background);
    color: var(--vscode-sideBarSectionHeader-foreground);
    cursor: pointer;
    user-select: none;
    gap: 4px;
}
.section-header:hover { background: var(--vscode-list-hoverBackground); }

.section-chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--vscode-icon-foreground);
}
.section-chevron svg {
    width: 16px;
    height: 16px;
    transition: transform 0.12s ease;
}
.section.collapsed .section-chevron svg { transform: rotate(-90deg); }

.section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.section-count {
    margin-left: 4px;
    color: var(--vscode-descriptionForeground);
    font-weight: 500;
}
.section-add {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    color: var(--vscode-icon-foreground);
    font-size: 14px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.1s, background 0.1s;
}
.section-header:hover .section-add { opacity: 0.8; }
.section-add:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground); }

.section.collapsed .section-list { display: none; }

.section-list {
    padding: 2px 0 6px;
    min-height: 4px;
}
.section-list.drop-target {
    background: color-mix(in srgb, var(--vscode-focusBorder) 12%, transparent);
}

.empty-section {
    padding: 6px 12px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
}

.card {
    position: relative;
    padding: 6px 10px;
    border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border);
    cursor: default;
    transition: background 0.1s;
}
.card:hover { background: var(--vscode-list-hoverBackground); }
.card.dragging { opacity: 0.4; }

.card[data-priority="highest"] { border-left: 2px solid #f14c4c; }
.card[data-priority="high"]    { border-left: 2px solid #ff9100; }
.card[data-priority="medium"]  { border-left: 2px solid #e0c000; }
.card[data-priority="low"]     { border-left: 2px solid #3b82f6; }
.card[data-priority="lowest"]  { border-left: 2px solid #8a8a8a; }

.card.error { border-left: 2px solid var(--vscode-charts-red); }

.card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
}
.card-priority {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.04em;
}
.card-priority[data-priority="highest"] { color: #f14c4c; }
.card-priority[data-priority="high"]    { color: #ff9100; }
.card-priority[data-priority="medium"]  { color: #e0c000; }
.card-priority[data-priority="low"]     { color: #3b82f6; }
.card-priority[data-priority="lowest"]  { color: #8a8a8a; }

.card-date { font-variant-numeric: tabular-nums; }

.meta-icons {
    margin-left: auto;
    display: inline-flex;
    gap: 2px;
}
.meta-icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    color: var(--vscode-icon-foreground);
    line-height: 0;
    opacity: 0.65;
    transition: opacity 0.1s, background 0.1s, color 0.1s;
}
.meta-icon-btn svg { display: block; width: 13px; height: 13px; }
.meta-icon-btn:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground); }
.meta-icon-btn.copied { color: var(--vscode-charts-green); opacity: 1; }

.card-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-foreground);
    line-height: 1.3;
    word-break: break-word;
    cursor: pointer;
}
.card-title:hover { text-decoration: underline; }

.card-summary {
    margin-top: 3px;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    line-height: 1.4;
    word-break: break-word;
    cursor: text;
    user-select: text;
}
.card-summary.collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-error-msg {
    margin-top: 3px;
    font-size: 11px;
    color: var(--vscode-charts-red);
    word-break: break-word;
}

.card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 4px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--vscode-textLink-foreground);
    font-size: 11px;
    padding: 1px 0;
    transition: color 0.1s;
    font-family: inherit;
}
.action-btn:hover { text-decoration: underline; }
.action-btn.copied { color: var(--vscode-charts-green); }

.menu-wrap { position: relative; display: inline-block; }
.menu {
    position: absolute;
    z-index: 10;
    top: calc(100% + 2px);
    left: 0;
    background: var(--vscode-menu-background);
    color: var(--vscode-menu-foreground);
    border: 1px solid var(--vscode-menu-border, var(--vscode-widget-border, transparent));
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    min-width: 130px;
    display: none;
    padding: 2px 0;
}
.menu.open { display: block; }
.menu-item {
    display: block;
    width: 100%;
    padding: 4px 10px 4px 24px;
    background: none;
    border: none;
    color: var(--vscode-menu-foreground);
    text-align: left;
    cursor: pointer;
    font-size: 11px;
    font-family: inherit;
    position: relative;
}
.menu-item:hover {
    background: var(--vscode-menu-selectionBackground);
    color: var(--vscode-menu-selectionForeground);
}
.menu-item.checked::before {
    content: '\\2713';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
}
`;
