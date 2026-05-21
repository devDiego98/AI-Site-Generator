# Frontend — AI UI Builder

React + Vite app for the AI UI Builder challenge.

## Layout

```txt
src/
├── pages/BuilderPage/       # Main builder (sidebar + editor + output)
├── organisms/
│   ├── ProjectsSidebar/     # Project list and history
│   ├── EditorPanel/         # Prompt, style, regenerate, modifications
│   ├── OutputPanel/         # Preview / code, breakpoints, error banner
│   └── PreviewFrame/        # Sandboxed iframe
├── hooks/useBuilderState.ts # Projects, generate, modify, regenerate
├── services/generateUiApi.ts
└── utils/buildPreviewHtml.ts
```

Legacy `PromptPanel` / `HistoryPanel` were removed; history lives in `ProjectsSidebar` and `EditorPanel`.

## Commands

```bash
npm run dev      # Dev server (builds preview IIFEs first)
npm run build    # Production build
npm run test     # Vitest
```

## Environment

`VITE_API_URL` — backend base URL (see `frontend/.env.example`).

Architecture details: [`../docs/Frontend-README.md`](../docs/Frontend-README.md).
