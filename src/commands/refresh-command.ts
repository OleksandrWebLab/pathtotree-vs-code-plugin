import { TaskStore } from '../store/task-store';

export async function executeRefresh(store: TaskStore): Promise<void> {
    await store.rescan();
}
