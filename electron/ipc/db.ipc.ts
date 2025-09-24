import { ipcMain } from 'electron';
import Store from 'electron-store';

/**
 * This IPC handler module uses electron-store to persist tasks in a JSON
 * file located in the userData directory.  It exposes CRUD operations
 * similar to those provided by the previous SQLite implementation, but
 * without requiring native modules or compilation during installation.
 */

type Task = { id: number; title: string; status: string };

// Initialise the store with default values.  electron-store will create
// a JSON file in the appropriate location within Electron's userData
// directory.  The `nextId` counter ensures unique IDs for new tasks.
const store = new Store<{ tasks: Task[]; nextId: number }>({
  defaults: { tasks: [], nextId: 1 }
});

// Retrieve all tasks, sorted by ID descending (latest first)
ipcMain.handle('db:getTasks', () => {
  const tasks = store.get('tasks');
  return tasks
    .slice()
    .sort((a: Task, b: Task) => b.id - a.id);
});

// Add a new task to the store
ipcMain.handle('db:addTask', (_event, task: { title: string; status?: string }) => {
  const tasks = store.get('tasks');
  const id = store.get('nextId');
  const status = task.status ?? 'todo';
  const newTask: Task = { id, title: task.title, status };
  store.set('tasks', [...tasks, newTask]);
  store.set('nextId', id + 1);
  return newTask;
});

// Update an existing task by ID
ipcMain.handle('db:updateTask', (_event, task: { id: number; title?: string; status?: string }) => {
  const tasks = store.get('tasks');
  const idx = tasks.findIndex((t: Task) => t.id === task.id);
  if (idx === -1) {
    throw new Error(`Task with id ${task.id} not found`);
  }
  const existing = tasks[idx];
  const updated: Task = {
    id: existing.id,
    title: task.title ?? existing.title,
    status: task.status ?? existing.status
  };
  const newTasks = [...tasks];
  newTasks[idx] = updated;
  store.set('tasks', newTasks);
  return updated;
});

// Delete a task by ID
ipcMain.handle('db:deleteTask', (_event, id: number) => {
  const tasks = store.get('tasks');
  const newTasks = tasks.filter((t: Task) => t.id !== id);
  store.set('tasks', newTasks);
  return { id };
});

// Generic query handler is not supported when using electron-store.  If
// called, throw an error so that the renderer knows this feature is
// unavailable.
ipcMain.handle('db:query', () => {
  throw new Error('db:query is not supported when using electron-store');
});
