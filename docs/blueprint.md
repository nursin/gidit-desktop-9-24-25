# Project Blueprint


# **App Name**: Gidit

This document describes the high-level structure of the Electron + Vite + React application.

- Desktop app shell powered by Electron (main + preload).
- Renderer built with Vite + React + Tailwind.
- UI primitives via Radix + shadcn-style components.
- Drag-and-drop dashboard builder.

Replace this file with detailed design notes as the project evolves.

gidit-desktop/
├── .env                     # Local configuration (paths, API keys, etc.)
├── .gitignore               # Ignore build output, Python bytecode, node_modules, etc.
├── README.md                # Setup and development instructions
├── package.json             # App metadata, dependencies and electron-builder "build" config
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.main.json       # Overrides for Electron main/preload code
├── vite.config.ts           # Vite configuration for the React renderer
├── tailwind.config.ts       # TailwindCSS setup
├── postcss.config.js        # PostCSS for Tailwind
├── components.json          # shadcn/ui configuration (if using shadcn)
├── electron-builder.yml     # Optional separate build config
│
├── electron/                # Electron main side (Node context)
│   ├── main.ts              # Creates the BrowserWindow, handles app lifecycle
│   ├── preload.ts           # Exposes a safe IPC API via contextBridge
│   ├── ipc/                 # Domain‑specific IPC handlers
│   │   ├── db.ipc.ts        # Wrap database operations for the renderer
│   │   ├── ai.ipc.ts        # Wrap AI/ML operations (Ollama, Chroma, Python)
│   │   └── sys.ipc.ts       # System utilities (e.g. logs, updater)
│   ├── db/
│   │   ├── sqlite.ts        # Initialize SQLCipher/better‑sqlite3
│   │   └── schema.ts        # Drizzle schema and migrations
│   ├── ai/
│   │   ├── ollama.ts        # Spawn Ollama subprocess, manage embeddings
│   │   ├── chroma.ts        # Client for the local Chroma server / vector store
│   │   └── python-bridge.ts # Run Python scripts with child_process
│   ├── chromadb.ts          # Optional: centralise ChromaDB integration
│   ├── updater.ts           # Auto‑update logic and logging
│   └── shared/              # Types and utilities shared with the renderer
│
├── renderer/                # React + Vite frontend (Browser context)
│   ├── index.html
│   └── src/
│       ├── main.tsx         # Entry point for React
│       ├── App.tsx          # Root component (router and layout)
│       ├── routes/          # Route components/pages
│       ├── components/      # Reusable UI (ui/, layout/, custom widgets)
│       ├── hooks/           # Zustand/React hooks
│       ├── store/           # Global state stores (Zustand or Redux)
│       ├── services/        # Thin wrappers over `window.api` IPC calls (db.ts, ai.ts, sys.ts)
│       ├── lib/             # Utility functions (e.g. clsx/twMerge helpers)
│       └── styles/          # Global styles and Tailwind CSS
│
├── python/                  # Stand‑alone Python scripts (source form)
│   ├── requirements.txt     # Python dependencies (pytesseract, pillow, chromadb, etc.)
│   ├── chroma_server.py     # Optional: launch local Chroma server
│   ├── embed.py, search.py  # Embedding and vector operations
│   ├── ocr.py               # OCR via tesseract
│   ├── preprocess.py        # Preprocessing helpers
│   └── extract_receipt_data.py (etc.)  # Additional flows
│
├── resources/               # Bundled via electron-builder extraResources
│   ├── python-runtime/      # Portable Python interpreter per platform
│   └── models/              # ML models (e.g. gemma3‑270m, Qwen2.5VL)
│       └── bin/             # Platform‑specific Ollama binaries, if shipped
│
├── scripts/                 # Build/postinstall tasks
│   ├── first-run.ts         # Checks model presence and triggers install
│   ├── install_qwen.sh      # Shell script for macOS/Linux
│   ├── install_qwen.ps1     # PowerShell script for Windows
│   └── setup-models.js      # Downloads models during build
│
├── build/                   # Build-time assets
│   ├── icons/               # App icons (icns, ico, png)
│   ├── entitlements.mac.plist # macOS entitlements
│   └── electron-builder.yml # If not embedded in package.json
│
├── dist/                    # Compiled output after `npm run build` (ignored in Git)
└── release/                 # Final packaged apps (.exe, .dmg, etc., ignored in Git)



## Core Features:

- Design Your Own Workspace: Modular workspace: Allow users to create a personalized workspace using drag-and-drop components like quadrants, timeboxing, calendar, notes, etc.
- AI-Powered Note Assistance: AI Assistants: Provide AI-powered tools for brain-dump triage and note summarization. The tool will allow the user to extract and structure the output.
- Gamified Progress Tracking: Behavioral Design: Incorporate elements like streaks, variable rewards, and gentle transitions to enhance user engagement.
- App Personalization: Personalization: Enable the application's appearance (themes, fonts, soundscapes, etc.) to be customized to match user context profiles.
- Tasks and Prioritization: Tasks Section: Quadrant display of task information and task prioritization support, and the ability to display more/less granular views (eg accordion)

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) - A vibrant, classic blue representing focus and productivity; converted to Hex: #3391F3
- Background color: HSL(210, 20%, 95%) - Very light blue that's easy on the eyes for long sessions; converted to Hex: #F0F5FA
- Accent color: HSL(180, 75%, 50%) - A turquoise that offers a modern, techy contrast; converted to Hex: #33F3CD
- Body text and headline font: 'Inter', a grotesque-style sans-serif, gives a modern and neutral feel. Very suitable for all kinds of text display. Note: currently only Google Fonts are supported.
- Employ a modular design with drag-and-drop functionality. Structure each component as a card to allow repositioning. Consider stacking sections when mobile.
- Introduce subtle transitions for task completion and state changes. Animate the addition or removal of the module card.