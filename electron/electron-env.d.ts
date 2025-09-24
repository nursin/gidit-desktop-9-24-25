/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, exposed via `preload.ts`
interface Window {
  api: {
    db: {
      query: (sql: string, params?: unknown[]) => Promise<unknown>
      getTasks: () => Promise<unknown>
      addTask: (task: unknown) => Promise<unknown>
      updateTask: (task: unknown) => Promise<unknown>
      deleteTask: (id: number) => Promise<unknown>
    }
    ai: {
      generate: (prompt: string) => Promise<string>
      embedText: (text: string) => Promise<unknown>
      search: (query: string) => Promise<unknown>
    }
    sys: {
      openExternal: (url: string) => Promise<void>
      log: (message: string) => Promise<void>
    }
  }
}
