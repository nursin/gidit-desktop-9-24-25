Repository Guidelines
Project Structure & Module Organization
renderer/src/ → React renderer
routes/ → page components
components/ui/ → UI primitives and widgets
context/ → shared state/providers
electron/ → Electron main process
main.ts → creates BrowserWindow, manages app lifecycle
preload.ts → safe IPC API via contextBridge
ipc/ → domain-specific IPC handlers (db.ipc.ts, ai.ipc.ts, sys.ipc.ts)
db/ → SQLCipher setup and Drizzle schemas
ai/ → Ollama, Chroma, Python bridges
shared/ → types/constants shared with renderer
python/ → OCR, embeddings, preprocessing, Chroma utilities
resources/ → bundled runtimes and ML models
scripts/ → automation (e.g., setup-models.cjs)
dist/, dist-electron/ → build artefacts (ignored in Git)
Build, Test & Development Commands
npm install → runs scripts/setup-models.cjs (stages model placeholders)
npm run dev → starts Vite and Electron (via vite-plugin-electron)
npm run build → compiles renderer and main process (tsconfig.main.json)
npm run package → builds installers with electron-builder → outputs under release/
npm run lint → ESLint for TypeScript sources
Coding Style & Naming Conventions
Language: TypeScript across renderer + Electron
React: functional components, explicit return types where practical
Indentation: 2 spaces (ESLint + editor formatting handles imports/ordering)

Naming:
Components/hooks → PascalCase (DashboardPage.tsx, useSettings.ts)
Utilities → kebab-case (lib/model-registry.ts)
Styling: Tailwind CSS, tokens in renderer/src/styles/ + tailwind.config.ts
IPC: export named handlers to enable tree-shaking

Testing Guidelines
Automated suite: not configured yet
When adding: colocate specs → *.test.tsx with Vitest
Manual validation: document in PRs (especially renderer ↔ Electron flows)
Python: provide reproducible CLI examples (e.g., python extract_receipt_data.py sample.pdf) and list dependencies in requirements.txt

Commit & Pull Request Guidelines
Commit messages: short, imperative; prefer Conventional prefixes (feat, fix, chore)

Pull Requests:
Summarize scope, link issues
List tests (manual/automated)
Add screenshots for UI changes
Highlight updates to models or Python deps
Workflow for local commits:
git add .
git commit -m "<changes made>"
git push

Model & Python Services
Python: pinned deps in python/requirements.txt (target Python 3.11+)
Packaging: includes interpreter from resources/python-runtime/ → avoid OS-specific assumptions
Models: commit descriptors only (not full weights) under resources/models/
Update scripts/setup-models.cjs whenever download logic changes
Expose service configs via electron/shared/ so renderer usage stays declarative
Project Blueprint
App Name: Gidit

Tech Stack
Electron shell (main + preload)
Vite + React + Tailwind renderer
Radix + shadcn UI components
Drag-and-drop dashboard builder

Core Features
Modular Workspace: drag-and-drop quadrants, timeboxing, calendar, notes
AI Note Assistance: brain-dump triage & summarization
Gamified Progress Tracking: streaks, variable rewards, gentle transitions
Personalization: themes, fonts, soundscapes, context-based profiles
Tasks/Prioritization: quadrant display, accordion views, granular zoom

Style Guidelines
Primary color: #3391F3 (HSL 210, 75%, 50%)
Background color: #F0F5FA (HSL 210, 20%, 95%)
Accent color: #33F3CD (HSL 180, 75%, 50%)
Font: Inter (Google Fonts)
Design: modular cards, stackable on mobile, animated transitions

File Structure (Reference)
gidit-desktop/
├── .env
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.main.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── electron-builder.yml
│
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   ├── db/
│   ├── ai/
│   ├── chromadb.ts
│   ├── updater.ts
│   └── shared/
│
├── renderer/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── routes/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── services/
│       ├── lib/
│       └── styles/
│
├── python/
│   ├── requirements.txt
│   ├── chroma_server.py
│   ├── embed.py
│   ├── search.py
│   ├── ocr.py
│   ├── preprocess.py
│   └── extract_receipt_data.py
│
├── resources/
│   ├── python-runtime/
│   └── models/
│
├── scripts/
│   ├── first-run.ts
│   ├── install_qwen.sh
│   ├── install_qwen.ps1
│   └── setup-models.js
│
├── build/
│   ├── icons/
│   ├── entitlements.mac.plist
│   └── electron-builder.yml
│
├── dist/
└── release/