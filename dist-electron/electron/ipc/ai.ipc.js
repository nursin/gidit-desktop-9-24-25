"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ollama_js_1 = require("../ai/ollama.js");
// IPC handlers for AI operations.  These stubs call the Ollama wrappers.
electron_1.ipcMain.handle('ai:generate', async (_event, prompt) => {
    return (0, ollama_js_1.generate)(prompt);
});
electron_1.ipcMain.handle('ai:embedText', async (_event, text) => {
    return (0, ollama_js_1.embedText)(text);
});
electron_1.ipcMain.handle('ai:search', async (_event, query) => {
    return (0, ollama_js_1.search)(query);
});
