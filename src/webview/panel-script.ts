export const PANEL_SCRIPT = `
(function () {
    const vscode = acquireVsCodeApi();

    const STATUS_LABELS = {
        'backlog': 'Backlog',
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'review': 'Ready for Review',
        'done': 'Done',
        'archived': 'Archived',
    };
    const STATUS_ORDER = ['backlog', 'todo', 'in-progress', 'review', 'done', 'archived'];
    const PRIORITIES = ['highest', 'high', 'medium', 'low', 'lowest'];
    const PRIORITY_RANK = { highest: 0, high: 1, medium: 2, low: 3, lowest: 4 };
    const COLLAPSED_BY_DEFAULT = new Set(['backlog', 'done', 'archived']);
    const CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,6 8,10 12,6"/></svg>';
    const COPY_TEXT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="8" height="9" rx="1"/><path d="M3 11V3a1 1 0 0 1 1-1h7"/></svg>';
    const COPY_PATH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h3v3"/><path d="M13 3l-5 5"/><path d="M11 9v3.5A1.5 1.5 0 0 1 9.5 14h-6A1.5 1.5 0 0 1 2 12.5v-6A1.5 1.5 0 0 1 3.5 5H7"/></svg>';
    const COPIED_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,8 7,12 13,4"/></svg>';

    let state = {
        tasks: [],
        errors: [],
        hasTasksDir: false,
        projectName: '',
        collapsedSections: [],
    };
    let searchQuery = '';
    let collapsedSections = new Set();
    let expandedSummaries = new Set();
    let openMenu = null;

    const root = document.getElementById('root');
    const searchInput = document.getElementById('searchInput');

    let searchTimer = null;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            searchQuery = searchInput.value.trim().toLowerCase();
            render();
        }, 200);
    });


    document.addEventListener('click', function (e) {
        if (openMenu && !openMenu.contains(e.target)) {
            closeMenu();
        }
    });

    window.addEventListener('message', function (event) {
        const msg = event.data;
        if (msg.type === 'state') {
            state = msg.state;
            collapsedSections = new Set(state.collapsedSections || []);
            render();
        } else if (msg.type === 'copied') {
            flashCopied(msg.id, msg.kind);
        }
    });

    function render() {
        closeMenu();
        root.innerHTML = '';

        if (!state.hasTasksDir) {
            renderWelcome();
            return;
        }

        const filteredTasks = filterTasks(state.tasks, searchQuery);
        const filteredErrors = filterErrors(state.errors, searchQuery);

        const byStatus = new Map();
        const noStatus = [];
        for (const t of filteredTasks) {
            if (t.status === null) {
                noStatus.push(t);
            } else {
                if (!byStatus.has(t.status)) byStatus.set(t.status, []);
                byStatus.get(t.status).push(t);
            }
        }

        for (const status of STATUS_ORDER) {
            const list = byStatus.get(status) || [];
            list.sort(byCreatedDesc);
            renderStatusSection(status, list);
        }
        if (noStatus.length > 0) {
            noStatus.sort(byCreatedDesc);
            renderInfoSection('no-status', 'No Status', noStatus, false);
        }
        if (filteredErrors.length > 0) {
            renderInfoSection('errors', 'Parse Errors', filteredErrors, true);
        }
    }

    function renderWelcome() {
        const div = document.createElement('div');
        div.className = 'welcome';
        div.innerHTML =
            '<p>PathToTree is not initialized for this project yet.</p>' +
            '<p>Initialization creates a <code>tasks/</code> folder, a <code>tasks/README.md</code> with instructions for AI agents, and a starter task.</p>';
        const btn = document.createElement('button');
        btn.className = 'welcome-btn';
        btn.textContent = 'Initialize Tasks for This Project';
        btn.onclick = function () {
            vscode.postMessage({ type: 'initializeTasks' });
        };
        div.appendChild(btn);
        root.appendChild(div);
    }

    function renderStatusSection(status, tasks) {
        const section = buildSection(status, STATUS_LABELS[status], tasks.length, status);
        const list = section.querySelector('.section-list');
        list.dataset.status = status;
        list.addEventListener('dragover', function (e) {
            e.preventDefault();
            list.classList.add('drop-target');
        });
        list.addEventListener('dragleave', function () {
            list.classList.remove('drop-target');
        });
        list.addEventListener('drop', function (e) {
            e.preventDefault();
            list.classList.remove('drop-target');
            const id = e.dataTransfer.getData('text/plain');
            if (id) {
                vscode.postMessage({ type: 'changeStatus', id, status });
            }
        });

        if (tasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-section';
            empty.textContent = searchQuery ? 'No matches.' : 'Drop tasks here.';
            list.appendChild(empty);
        } else {
            for (const t of tasks) {
                list.appendChild(buildTaskCard(t));
            }
        }
        root.appendChild(section);
    }

    function renderInfoSection(id, label, items, isErrors) {
        const section = buildSection(id, label, items.length, null);
        const list = section.querySelector('.section-list');
        for (const item of items) {
            list.appendChild(isErrors ? buildErrorCard(item) : buildTaskCard(item));
        }
        root.appendChild(section);
    }

    function buildSection(id, label, count, statusForAdd) {
        const section = document.createElement('div');
        section.className = 'section' + (collapsedSections.has(id) ? ' collapsed' : '');
        section.dataset.sectionId = id;

        const header = document.createElement('div');
        header.className = 'section-header';
        header.onclick = function (e) {
            if (e.target.closest('.section-add')) return;
            const willCollapse = !collapsedSections.has(id);
            if (willCollapse) collapsedSections.add(id);
            else collapsedSections.delete(id);
            render();
            vscode.postMessage({ type: 'toggleSection', sectionId: id, collapsed: willCollapse });
        };

        const chevron = document.createElement('span');
        chevron.className = 'section-chevron';
        chevron.innerHTML = CHEVRON_SVG;
        header.appendChild(chevron);

        const title = document.createElement('span');
        title.className = 'section-title';
        title.innerHTML = escHtml(label) + '<span class="section-count">' + count + '</span>';
        header.appendChild(title);

        if (statusForAdd) {
            const add = document.createElement('button');
            add.className = 'section-add';
            add.title = 'Create task in ' + label;
            add.textContent = '+';
            add.onclick = function (e) {
                e.stopPropagation();
                vscode.postMessage({ type: 'newTask', status: statusForAdd });
            };
            header.appendChild(add);
        }
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'section-list';
        section.appendChild(list);

        return section;
    }

    function buildTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.taskId = task.id;
        card.dataset.priority = task.priority;
        card.draggable = true;

        card.addEventListener('dragstart', function (e) {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragend', function () {
            card.classList.remove('dragging');
        });

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        const dateStr = task.created ? formatDate(task.created) : '';
        meta.innerHTML =
            '<span class="card-priority" data-priority="' + task.priority + '">' + escHtml(task.priority) + '</span>' +
            '<span class="card-date">' + escHtml(dateStr) + '</span>';

        const icons = document.createElement('span');
        icons.className = 'meta-icons';
        icons.appendChild(buildIconBtn('Copy text', COPY_TEXT_SVG, task.id, 'text', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'copyText', id: task.id });
        }));
        icons.appendChild(buildIconBtn('Copy path', COPY_PATH_SVG, task.id, 'path', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'copyPath', id: task.id });
        }));
        meta.appendChild(icons);
        card.appendChild(meta);

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = task.title;
        title.title = 'Open preview';
        title.onclick = function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'openPreview', id: task.id });
        };
        card.appendChild(title);

        if (task.summary) {
            const isExpanded = expandedSummaries.has(task.id);
            const summary = document.createElement('div');
            summary.className = 'card-summary' + (isExpanded ? '' : ' collapsed');
            summary.textContent = task.summary;
            summary.onclick = function (e) {
                e.stopPropagation();
                if (isExpanded) expandedSummaries.delete(task.id);
                else expandedSummaries.add(task.id);
                render();
            };
            card.appendChild(summary);
        }

        card.appendChild(buildTaskActions(task));
        return card;
    }

    function buildTaskActions(task) {
        const wrap = document.createElement('div');
        wrap.className = 'card-actions';

        wrap.appendChild(makeActionBtn('Show', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'openPreview', id: task.id });
        }));

        wrap.appendChild(makeActionBtn('Edit', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'openEditor', id: task.id });
        }));

        wrap.appendChild(buildStatusMenu(task));
        wrap.appendChild(buildPriorityMenu(task));

        wrap.appendChild(makeActionBtn('Delete', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'delete', id: task.id });
        }));

        return wrap;
    }

    function buildStatusMenu(task) {
        return buildMenu('Status', STATUS_ORDER, task.status, function (value) {
            vscode.postMessage({ type: 'changeStatus', id: task.id, status: value });
        }, function (s) { return STATUS_LABELS[s]; });
    }

    function buildPriorityMenu(task) {
        return buildMenu('Priority', PRIORITIES, task.priority, function (value) {
            vscode.postMessage({ type: 'changePriority', id: task.id, priority: value });
        }, function (p) { return p.charAt(0).toUpperCase() + p.slice(1); });
    }

    function buildMenu(label, values, current, onPick, formatter) {
        const wrap = document.createElement('span');
        wrap.className = 'menu-wrap';

        const trigger = document.createElement('button');
        trigger.className = 'action-btn';
        trigger.textContent = label;
        trigger.onclick = function (e) {
            e.stopPropagation();
            const card = wrap.closest('.card');
            if (menu.classList.contains('open')) {
                closeMenu();
            } else {
                closeMenu();
                menu.classList.add('open');
                openMenu = menu;
                if (card) card.classList.add('actions-open');
            }
        };
        wrap.appendChild(trigger);

        const menu = document.createElement('div');
        menu.className = 'menu';
        for (const v of values) {
            const item = document.createElement('button');
            item.className = 'menu-item' + (v === current ? ' checked' : '');
            item.textContent = formatter(v);
            item.onclick = function (e) {
                e.stopPropagation();
                closeMenu();
                onPick(v);
            };
            menu.appendChild(item);
        }
        wrap.appendChild(menu);
        return wrap;
    }

    function closeMenu() {
        if (!openMenu) return;
        openMenu.classList.remove('open');
        const card = openMenu.closest('.card');
        if (card) card.classList.remove('actions-open');
        openMenu = null;
    }

    function buildErrorCard(error) {
        const card = document.createElement('div');
        card.className = 'card error';

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        meta.innerHTML = '<span>Parse error</span>';

        const icons = document.createElement('span');
        icons.className = 'meta-icons';
        icons.appendChild(buildIconBtn('Copy path', COPY_PATH_SVG, error.id, 'path', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'copyPath', id: error.id });
        }));
        meta.appendChild(icons);
        card.appendChild(meta);

        const title = document.createElement('div');
        title.className = 'card-title';
        title.textContent = error.fileName;
        title.onclick = function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'openEditor', id: error.id });
        };
        card.appendChild(title);

        const msg = document.createElement('div');
        msg.className = 'card-error-msg';
        msg.textContent = error.message;
        card.appendChild(msg);

        const actions = document.createElement('div');
        actions.className = 'card-actions';
        actions.appendChild(makeActionBtn('Edit', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'openEditor', id: error.id });
        }));
        actions.appendChild(makeActionBtn('Delete', function (e) {
            e.stopPropagation();
            vscode.postMessage({ type: 'delete', id: error.id });
        }));
        card.appendChild(actions);

        return card;
    }

    function makeActionBtn(text, onClick) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = text;
        btn.onclick = onClick;
        return btn;
    }

    function buildIconBtn(label, svg, taskId, kind, onClick) {
        const btn = document.createElement('button');
        btn.className = 'meta-icon-btn';
        btn.title = label;
        btn.innerHTML = svg;
        btn.dataset.copyKind = kind;
        btn.dataset.copyTarget = taskId;
        btn.dataset.iconOriginal = svg;
        btn.onclick = onClick;
        return btn;
    }

    function flashCopied(id, kind) {
        const selector = '.meta-icon-btn[data-copy-target="' + cssEscape(id) + '"][data-copy-kind="' + kind + '"]';
        const btn = document.querySelector(selector);
        if (!btn) return;
        const original = btn.dataset.iconOriginal;
        btn.innerHTML = COPIED_SVG;
        btn.classList.add('copied');
        setTimeout(function () {
            if (original) btn.innerHTML = original;
            btn.classList.remove('copied');
        }, 1500);
    }

    function filterTasks(tasks, q) {
        if (!q) return tasks.slice();
        return tasks.filter(function (t) {
            return (t.title || '').toLowerCase().includes(q)
                || (t.summary || '').toLowerCase().includes(q)
                || (t.body || '').toLowerCase().includes(q);
        });
    }

    function filterErrors(errors, q) {
        if (!q) return errors.slice();
        return errors.filter(function (e) {
            return (e.fileName || '').toLowerCase().includes(q)
                || (e.message || '').toLowerCase().includes(q);
        });
    }

    function byCreatedDesc(a, b) {
        const ra = PRIORITY_RANK[a.priority] !== undefined ? PRIORITY_RANK[a.priority] : 2;
        const rb = PRIORITY_RANK[b.priority] !== undefined ? PRIORITY_RANK[b.priority] : 2;
        if (ra !== rb) return ra - rb;
        const aHas = !!a.created, bHas = !!b.created;
        if (aHas !== bHas) return aHas ? -1 : 1;
        if (a.created !== b.created) return (b.created || '').localeCompare(a.created || '');
        return a.title.localeCompare(b.title);
    }

    function formatDate(iso) {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const pad = function (n) { return String(n).padStart(2, '0'); };
        return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
    }

    function escHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function cssEscape(s) {
        return String(s).replace(/[\\\\"']/g, '\\\\$&');
    }

    vscode.postMessage({ type: 'ready' });
})();
`;
