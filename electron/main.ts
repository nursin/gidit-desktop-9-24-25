import { app, BrowserWindow, nativeImage, protocol } from 'electron'
import fs from 'fs'
import path from 'path'

import './ipc/db.ipc.js'
import './ipc/ai.ipc.js'
import './ipc/sys.ipc.js'
import '../scripts/first-run.js'

const resolvedDir = __dirname

process.env.APP_ROOT = path.join(resolvedDir, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist/renderer')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'renderer/public')
  : RENDERER_DIST

const iconCandidates = ['gidit-logo.png']

function loadAppIcon(): { image?: Electron.NativeImage; path?: string } {
  const appRoot = process.env.APP_ROOT ?? ''
  const searchRoots = ([
    process.env.VITE_PUBLIC,
    path.join(appRoot, 'renderer/public'),
    path.resolve(appRoot, '..', 'renderer/public'),
    path.join(appRoot, 'public'),
    path.resolve(appRoot, '..', 'public'),
    path.join(appRoot, 'dist/renderer'),
    path.resolve(appRoot, '..', 'dist/renderer'),
  ] as Array<string | undefined>)
    .filter((dir): dir is string => Boolean(dir))
    .map((dir) => path.normalize(dir))

  console.log('[icon] search roots:', searchRoots)

  for (const root of searchRoots) {
    for (const candidate of iconCandidates) {
      const absolute = path.join(root, candidate)
      if (!fs.existsSync(absolute)) {
        continue
      }

      try {
        let image = nativeImage.createFromPath(absolute)

        if (image.isEmpty()) {
          const buffer = fs.readFileSync(absolute)
          image = nativeImage.createFromBuffer(buffer)
        }

        if (!image.isEmpty()) {
          const resized = image.resize({ width: 512, height: 512 })
          console.log('[icon] loaded', absolute)
          return { image: resized, path: absolute }
        }
      } catch (error) {
        console.warn(`[icon] failed to load ${absolute}:`, error)
      }
    }
  }

  console.warn('[icon] using Electron default icon – no custom icon found')
  return {}
}

const { image: logoIcon, path: logoPath } = loadAppIcon()

let mainWindow: BrowserWindow | null = null

async function loadRenderer(win: BrowserWindow) {
  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(RENDERER_DIST, 'index.html')
    await win.loadFile(indexPath)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    icon: logoIcon ?? logoPath,
    webPreferences: {
      preload: path.join(resolvedDir, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadRenderer(mainWindow).catch((error) => {
    console.error('Failed to load renderer:', error)
  })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.on('ready', async () => {
    protocol.registerFileProtocol('app', (request, callback) => {
      const url = request.url.slice(6)
      callback({ path: path.normalize(`${resolvedDir}/${url}`) })
    })

    if (process.platform === 'darwin' && logoIcon) {
      app.dock.setIcon(logoIcon)
    }

    createWindow()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
