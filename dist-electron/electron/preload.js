"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// The preload script runs before the renderer is loaded and exposes a safe API.
// We only expose functions that call into the main process via ipcRenderer.invoke.
electron_1.contextBridge.exposeInMainWorld('api', {
    db: {
        query: (sql, params) => electron_1.ipcRenderer.invoke('db:query', sql, params),
        getTasks: () => electron_1.ipcRenderer.invoke('db:getTasks'),
        addTask: (task) => electron_1.ipcRenderer.invoke('db:addTask', task),
        updateTask: (task) => electron_1.ipcRenderer.invoke('db:updateTask', task),
        deleteTask: (id) => electron_1.ipcRenderer.invoke('db:deleteTask', id)
    },
    ai: {
        generate: (prompt) => electron_1.ipcRenderer.invoke('ai:generate', prompt),
        embedText: (text) => electron_1.ipcRenderer.invoke('ai:embedText', text),
        search: (query) => electron_1.ipcRenderer.invoke('ai:search', query)
    },
    sys: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('sys:openExternal', url),
        log: (message) => electron_1.ipcRenderer.invoke('sys:log', message)
    }
});
