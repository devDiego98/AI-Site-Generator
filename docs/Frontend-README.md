# Frontend Architecture

React + TypeScript app (Vite) for an AI UI builder: users describe interfaces in natural language, the backend returns JSX, and the app renders a live preview in a sandboxed iframe.

## High-level architecture

The frontend splits into three layers:

1. **Main app** — Builder UI, state, API calls, project history (localStorage).
2. **Preview assembler** — `buildPreviewHtml` turns generated TSX into a self-contained HTML document.
3. **Preview runtime** — Prebuilt IIFEs + inline shadcn globals so generated code runs without imports or a separate build step.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Main React App (Vite)                        │
│  BuilderPage → useBuilderState → generateUiApi → NestJS backend │
│  OutputPanel → buildPreviewHtml → PreviewFrame (iframe srcDoc)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Sandboxed iframe (Babel + globals)                  │
│  React UMD │ Tailwind CDN │ shadcnRuntime │ ReactBits │ Motion  │
│  + AI-generated TSX compiled at runtime                            │
└─────────────────────────────────────────────────────────────────┘
```

## Flow diagram

Open **[frontend-flow.excalidraw](./frontend-flow.excalidraw)** in [Excalidraw](https://excalidraw.com) or the VS Code Excalidraw extension for the full interactive diagram (user → state → API → iframe layers).

To regenerate the diagram from source:

```bash
node docs/generate-excalidraw.mjs
```

## End-to-end flow

### 1. Bootstrap and routing

| Step | What happens |
|------|----------------|
| Entry | `index.html` loads `src/main.tsx` |
| Styles | `styles/tokens.css`, `styles/global.css` |
| Router | `App.tsx` uses `usePathname()` — `/` → `BuilderPage`, `/debug` → `ComponentDebugPage` |
| Toasts | `ToastProvider` wraps the app |

### 2. Generate or modify UI

| Step | File(s) | What happens |
|------|---------|----------------|
| User input | `EditorPanel` → `PromptFieldWithAction` | Prompt or modification instruction |
| Submit | `useBuilderState.handleSubmit` | Sets loading, clears error |
| API | `services/generateUiApi.ts` | `POST /generate-ui` or `POST /modify-ui` |
| State | `useBuilderState` | New `Project` + version, or new version on existing project |
| Persist | `utils/projectStorage.ts` | `localStorage` key `ai-ui-builder-projects` |

### 3. Preview rendering

| Step | File(s) | What happens |
|------|---------|----------------|
| Code source | `activeVersion.code` from builder state | Latest or reverted version |
| HTML build | `utils/buildPreviewHtml.ts` | Strips imports, injects mount, embeds runtimes |
| Display | `OutputPanel` + `PreviewFrame` | `srcDoc` iframe, `sandbox="allow-scripts"` |
| Runtime | `public/*.iife.js` + `preview/shadcnRuntime.ts` | Globals: `Button`, `Aurora`, `motion`, etc. |

### 4. Debug path (no backend)

`ComponentDebugPage` at `/debug` lets you paste TSX and run preview locally. Code is saved under `component-debug-code` in localStorage. Same `buildPreviewHtml` + `PreviewFrame` pipeline.

## Directory structure

```
frontend/
├── index.html                 # Vite HTML shell
├── package.json               # Scripts; preview runtime built before dev/build
├── vite.config.ts             # Main app (@ → src/)
├── vite.preview.config.ts     # ReactBits → public/react-bits-preview.iife.js
├── vite.framer-preview.config.ts  # Framer Motion IIFE
├── public/                    # Static assets + preview IIFE bundles
│   ├── react-bits-preview.iife.js
│   ├── react-bits-preview.css
│   └── framer-motion-preview.iife.js
└── src/
    ├── main.tsx               # App entry
    ├── App.tsx                # Path-based routing
    ├── atoms/                 # Button, Text, Textarea, Tab, Spinner, Badge, Icon
    ├── molecules/             # PromptField, CodeBlock, ViewModeToggle, skeletons, …
    ├── organisms/             # EditorPanel, OutputPanel, PreviewFrame, ProjectsSidebar, …
    ├── templates/             # BuilderLayout (header + 3-column body)
    ├── pages/
    │   ├── BuilderPage/       # Main AI builder
    │   └── ComponentDebugPage/  # Manual TSX preview (/debug)
    ├── hooks/
    │   ├── useBuilderState.ts # Central state: projects, API, submit
    │   ├── usePathname.ts     # Lightweight client router
    │   └── useToast.ts
    ├── contexts/              # ToastProvider
    ├── services/
    │   └── generateUiApi.ts   # Backend HTTP client
    ├── utils/
    │   ├── buildPreviewHtml.ts    # Iframe document builder
    │   ├── projectStorage.ts      # localStorage CRUD
    │   └── reportError.ts         # Toast helpers for API errors
    ├── preview/               # Iframe runtime (see below)
    ├── ReactBits/             # 24 animated backgrounds (preview IIFE only)
    ├── styles/                # Design tokens + global CSS
    └── types/                 # Project, GeneratedUi, ViewMode
```

## Atomic design layout

| Layer | Role in this app |
|-------|------------------|
| **Atoms** | Primitives (buttons, text, icons) for the builder chrome |
| **Molecules** | Composed controls (prompt field + submit, code block, view toggle) |
| **Organisms** | Feature sections (sidebar, editor, output, preview frame) |
| **Templates** | `BuilderLayout` — page shell without business logic |
| **Pages** | Wire hooks + templates (`BuilderPage`, `ComponentDebugPage`) |

## Preview system (`src/preview/`)

Generated code is written as if it lived in a project with shadcn, Framer Motion, and ReactBits — but it cannot use ES imports inside the iframe. The preview folder supplies **global bindings** instead.

| File | Purpose |
|------|---------|
| `shadcnRuntime.ts` | Core shadcn-style components (`Button`, `Card`, `Dialog`, …) as inline JSX strings |
| `shadcnExtendedRuntime.ts` | Additional UI primitives |
| `shadcnCatalogRuntime.ts` | Catalog-style components |
| `shadcnChartsRuntime.ts` | Chart wrappers (uses Recharts from CDN) |
| `lucideIconsRuntime.ts` | Lucide icons as globals |
| `reactBitsPreviewEntry.ts` | Vite lib entry — exposes all `ReactBits` on `globalThis` |
| `reactBitsGlobalNames.ts` | `var Aurora = globalThis.Aurora` for Babel strict mode |
| `framerMotionPreviewEntry.ts` | Vite lib entry — `motion`, `AnimatePresence`, hooks |
| `framerMotionGlobalNames.ts` | Global bindings for motion APIs |
| `reactBitsPreviewStyles.ts` | CSS for background layers |
| `previewNavigationGuard.ts` | Prevents links from unloading the iframe document |

`buildPreviewHtml` also loads from CDN: React 19, ReactDOM, Tailwind, Babel standalone, Recharts, and applies `SHADCN_PREVIEW_THEME_DARK` for shader backgrounds.

## ReactBits (`src/ReactBits/`)

24 WebGL/Three/GSAP background effects (`Aurora`, `Galaxy`, `LiquidEther`, …). They are **excluded from the main app TypeScript build** (`tsconfig.app.json`) and only compiled into `react-bits-preview.iife.js`.

Sync from upstream scripts:

```bash
npm run sync:reactbits
```

## State model

```typescript
Project {
  id, initialPrompt, createdAt, updatedAt,
  versions: ProjectVersion[]
}

ProjectVersion {
  id, instruction, code, createdAt,
  type: 'generation' | 'modification'
}
```

- **New prompt** → `generateUi` → first version, new project.
- **Modification** → `modifyUi(instruction, currentCode)` → append version.
- **Revert** → select an older `activeVersionId` (read-only until user modifies again from latest).

## API integration

| Env | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:3000`) |

| Client function | Endpoint | Body |
|-----------------|----------|------|
| `generateUi(prompt)` | `POST /generate-ui` | `{ prompt }` |
| `modifyUi(instruction, currentCode)` | `POST /modify-ui` | `{ instruction, currentCode }` |

Response shape (`types/generatedUi.ts`):

```typescript
{ id: string; prompt: string; code: string; createdAt: string }
```

Errors are mapped to user-facing toasts (502 AI failure, 503 missing API key, validation messages).

## NPM scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Build preview IIFEs, then start Vite (port 5173) |
| `npm run build` | Preview runtime + `tsc` + production Vite build |
| `npm run build:preview-runtime` | Both IIFE bundles into `public/` |
| `npm run sync:reactbits` | Sync ReactBits sources from repo scripts |
| `npm run lint` | ESLint |

## Key files quick reference

| Concern | Path |
|---------|------|
| App entry | `src/main.tsx` |
| Routing | `src/App.tsx`, `src/hooks/usePathname.ts` |
| Builder UI | `src/pages/BuilderPage/BuilderPage.tsx` |
| State + orchestration | `src/hooks/useBuilderState.ts` |
| Backend HTTP | `src/services/generateUiApi.ts` |
| Preview HTML | `src/utils/buildPreviewHtml.ts` |
| Iframe host | `src/organisms/PreviewFrame/PreviewFrame.tsx` |
| Shadcn iframe runtime | `src/preview/shadcnRuntime.ts` |
| Env example | `.env.example` |

## Local development

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Ensure the backend is running on the URL configured in `VITE_API_URL`. Preview IIFEs are rebuilt automatically on `dev` and `build`.
