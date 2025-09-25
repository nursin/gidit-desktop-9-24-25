# Repository Guidelines

## Project Structure & Module Organization
`renderer/src/` contains the React renderer—routes in `routes/`, composable UI in `components/ui/`, shared state in `context/`. Electron code sits in `electron/` (entry `main.ts`, preload bridge, IPC adapters in `ipc/`, AI helpers in `ai/`). Python utilities for OCR, embeddings, and Chroma live under `python/` and are invoked from the Electron process. Packaged assets and runtimes live in `resources/`, automation scripts in `scripts/` (notably `setup-models.cjs`), and build artefacts surface in `dist/` and `dist-electron/`.

## Build, Test, and Development Commands
- `npm install` triggers `scripts/setup-models.cjs` to stage placeholder model assets.
- `npm run dev` starts Vite and the Electron shell via `vite-plugin-electron`.
- `npm run build` emits the renderer bundle and compiles the main process with `tsconfig.main.json`.
- `npm run package` runs `electron-builder` and drops installers under `release/`.
- `npm run lint` runs ESLint across TypeScript sources; fix or suppress issues before committing.

## Coding Style & Naming Conventions
Use TypeScript across renderer and Electron layers with functional React components and explicit return types where practical. Follow the prevailing two-space indentation and let ESLint plus editor formatting settle imports. Components/hooks use PascalCase (`DashboardPage.tsx`, `useSettings.ts`), utilities stay kebab-case (`lib/model-registry.ts`). Tailwind utility classes drive styling; share tokens through `renderer/src/styles/` and `tailwind.config.ts`. Keep IPC channels named exports so consumers can tree-shake.

## Testing Guidelines
An automated suite is not yet configured. When adding coverage, colocate renderer specs as `*.test.tsx` beside the component and align with Vitest to match the Vite ecosystem. Document manual validation in PRs, especially cross-process flows (`electron/ipc` ↔ `renderer/src/api`). For Python scripts, include reproducible CLI snippets (e.g., `python extract_receipt_data.py sample.pdf`) and specify environment requirements.

## Commit & Pull Request Guidelines
Recent history uses short imperative subjects (e.g., `first commit`); keep messages concise and prefer Conventional prefixes (`feat`, `fix`, `chore`) for cross-team clarity. Each PR should summarise scope, link issues, list manual or automated tests, and attach screenshots for UI changes. Call out updates to model bundles or Python dependencies so reviewers can refresh local assets. When finished with code changes, enter terminal command a git add . && git commit -m "<changes made>" && git push  

## Model & Python Services
Python tasks rely on versions pinned in `python/requirements.txt`; confirm compatibility with system Python 3.11+ during development. Packaging bundles interpreters from `resources/python-runtime/`, so avoid platform-specific assumptions. Commit only lightweight descriptors to `resources/models/` and update `scripts/setup-models.cjs` whenever download logic evolves. Surface new service configuration through `electron/shared/` constants to keep renderer usage declarative.
