import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
  root: 'renderer',
  plugins: [
    react(),
    tsconfigPaths(),
    electron({
      main: {
        entry: path.join(__dirname, 'electron/main.ts'),
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'renderer/src'),
    },
  },
})
