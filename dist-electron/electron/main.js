"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RENDERER_DIST = exports.MAIN_DIST = exports.VITE_DEV_SERVER_URL = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("./ipc/db.ipc.js");
require("./ipc/ai.ipc.js");
require("./ipc/sys.ipc.js");
require("../scripts/first-run.js");
const resolvedDir = __dirname;
process.env.APP_ROOT = path_1.default.join(resolvedDir, '..');
exports.VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
exports.MAIN_DIST = path_1.default.join(process.env.APP_ROOT, 'dist-electron');
exports.RENDERER_DIST = path_1.default.join(process.env.APP_ROOT, 'dist/renderer');
process.env.VITE_PUBLIC = exports.VITE_DEV_SERVER_URL
    ? path_1.default.join(process.env.APP_ROOT, 'renderer/public')
    : exports.RENDERER_DIST;
const iconCandidates = ['gidit-logo.png'];
function loadAppIcon() {
    const appRoot = process.env.APP_ROOT ?? '';
    const searchRoots = [
        process.env.VITE_PUBLIC,
        path_1.default.join(appRoot, 'renderer/public'),
        path_1.default.resolve(appRoot, '..', 'renderer/public'),
        path_1.default.join(appRoot, 'public'),
        path_1.default.resolve(appRoot, '..', 'public'),
        path_1.default.join(appRoot, 'dist/renderer'),
        path_1.default.resolve(appRoot, '..', 'dist/renderer'),
    ]
        .filter((dir) => Boolean(dir))
        .map((dir) => path_1.default.normalize(dir));
    console.log('[icon] search roots:', searchRoots);
    for (const root of searchRoots) {
        for (const candidate of iconCandidates) {
            const absolute = path_1.default.join(root, candidate);
            if (!fs_1.default.existsSync(absolute)) {
                continue;
            }
            try {
                let image = electron_1.nativeImage.createFromPath(absolute);
                if (image.isEmpty()) {
                    const buffer = fs_1.default.readFileSync(absolute);
                    image = electron_1.nativeImage.createFromBuffer(buffer);
                }
                if (!image.isEmpty()) {
                    const resized = image.resize({ width: 512, height: 512 });
                    console.log('[icon] loaded', absolute);
                    return { image: resized, path: absolute };
                }
            }
            catch (error) {
                console.warn(`[icon] failed to load ${absolute}:`, error);
            }
        }
    }
    console.warn('[icon] using Electron default icon – no custom icon found');
    return {};
}
const { image: logoIcon, path: logoPath } = loadAppIcon();
let mainWindow = null;
async function loadRenderer(win) {
    if (exports.VITE_DEV_SERVER_URL) {
        await win.loadURL(exports.VITE_DEV_SERVER_URL);
        win.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        const indexPath = path_1.default.join(exports.RENDERER_DIST, 'index.html');
        await win.loadFile(indexPath);
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 640,
        icon: logoIcon ?? logoPath,
        webPreferences: {
            preload: path_1.default.join(resolvedDir, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    loadRenderer(mainWindow).catch((error) => {
        console.error('Failed to load renderer:', error);
    });
}
if (!electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        if (!mainWindow)
            return;
        if (mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.focus();
    });
    electron_1.app.on('ready', async () => {
        electron_1.protocol.registerFileProtocol('app', (request, callback) => {
            const url = request.url.slice(6);
            callback({ path: path_1.default.normalize(`${resolvedDir}/${url}`) });
        });
        if (process.platform === 'darwin' && logoIcon) {
            electron_1.app.dock.setIcon(logoIcon);
        }
        createWindow();
    });
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
        mainWindow = null;
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
