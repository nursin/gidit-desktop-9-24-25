import { contextBridge, ipcRenderer } from 'electron';
// The preload script runs before the renderer is loaded and exposes a safe API.
// We only expose functions that call into the main process via ipcRenderer.invoke.
contextBridge.exposeInMainWorld('api', {
    db: {
        query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),
        getTasks: () => ipcRenderer.invoke('db:getTasks'),
        addTask: (task) => ipcRenderer.invoke('db:addTask', task),
        updateTask: (task) => ipcRenderer.invoke('db:updateTask', task),
        deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id)
    },
    ai: {
        generate: (prompt) => ipcRenderer.invoke('ai:generate', prompt),
        embedText: (text) => ipcRenderer.invoke('ai:embedText', text),
        search: (query) => ipcRenderer.invoke('ai:search', query)
    },
    sys: {
        openExternal: (url) => ipcRenderer.invoke('sys:openExternal', url),
        log: (message) => ipcRenderer.invoke('sys:log', message)
    }
});
