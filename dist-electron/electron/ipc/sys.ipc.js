"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// IPC handlers for system‑level utilities
electron_1.ipcMain.handle('sys:openExternal', async (_event, url) => {
    await electron_1.shell.openExternal(url);
});
electron_1.ipcMain.handle('sys:log', async (_event, message) => {
    console.log(`[Renderer] ${message}`);
});
