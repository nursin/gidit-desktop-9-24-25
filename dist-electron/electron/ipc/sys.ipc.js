import { ipcMain, shell } from 'electron';
// IPC handlers for system‑level utilities
ipcMain.handle('sys:openExternal', async (_event, url) => {
    await shell.openExternal(url);
});
ipcMain.handle('sys:log', async (_event, message) => {
    console.log(`[Renderer] ${message}`);
});
