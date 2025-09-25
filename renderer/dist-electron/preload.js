"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  db: {
    query: (sql, params) => electron.ipcRenderer.invoke("db:query", sql, params),
    getTasks: () => electron.ipcRenderer.invoke("db:getTasks"),
    addTask: (task) => electron.ipcRenderer.invoke("db:addTask", task),
    updateTask: (task) => electron.ipcRenderer.invoke("db:updateTask", task),
    deleteTask: (id) => electron.ipcRenderer.invoke("db:deleteTask", id)
  },
  ai: {
    generate: (prompt) => electron.ipcRenderer.invoke("ai:generate", prompt),
    embedText: (text) => electron.ipcRenderer.invoke("ai:embedText", text),
    search: (query) => electron.ipcRenderer.invoke("ai:search", query)
  },
  sys: {
    openExternal: (url) => electron.ipcRenderer.invoke("sys:openExternal", url),
    log: (message) => electron.ipcRenderer.invoke("sys:log", message)
  }
});
