import { ipcMain } from 'electron';
import { generate, embedText, search } from '../ai/ollama.js';
// IPC handlers for AI operations.  These stubs call the Ollama wrappers.
ipcMain.handle('ai:generate', async (_event, prompt) => {
    return generate(prompt);
});
ipcMain.handle('ai:embedText', async (_event, text) => {
    return embedText(text);
});
ipcMain.handle('ai:search', async (_event, query) => {
    return search(query);
});
