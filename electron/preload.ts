import { contextBridge, ipcRenderer } from 'electron';

// The preload script runs before the renderer is loaded and exposes a safe API.
// We only expose functions that call into the main process via ipcRenderer.invoke.

contextBridge.exposeInMainWorld('api', {
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    getTasks: () => ipcRenderer.invoke('db:getTasks'),
    addTask: (task: any) => ipcRenderer.invoke('db:addTask', task),
    updateTask: (task: any) => ipcRenderer.invoke('db:updateTask', task),
    deleteTask: (id: number) => ipcRenderer.invoke('db:deleteTask', id)
  },
  ai: {
    generate: (prompt: string) => ipcRenderer.invoke('ai:generate', prompt),
    embedText: (text: string) => ipcRenderer.invoke('ai:embedText', text),
    search: (query: string) => ipcRenderer.invoke('ai:search', query)
  },
  sys: {
    openExternal: (url: string) => ipcRenderer.invoke('sys:openExternal', url),
    log: (message: string) => ipcRenderer.invoke('sys:log', message)
  }
});