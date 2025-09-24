import { ipcMain, shell } from 'electron';

// IPC handlers for system‑level utilities

ipcMain.handle('sys:openExternal', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('sys:log', async (_event, message: string) => {
  console.log(`[Renderer] ${message}`);
});