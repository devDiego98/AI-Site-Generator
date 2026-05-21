# AI UI Builder

Simplified v0-style app: the user describes a UI in natural language, the backend calls an AI provider, and the frontend renders the generated interface as a visual preview.

This repository is **scaffolded and runnable**. Feature implementation (generation, preview, history, AI integration) is documented below as the planned approach — see [Implementation checklist](#implementation-checklist).

---

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19 + TypeScript + Vite        |
| Backend  | NestJS + TypeScript (strict)        |
| AI       | Provider TBD (OpenAI, Anthropic, …) |
| Styling  | Tailwind CSS (planned)              |

---

## Project structure

```txt
/
├── README.md                 # This file — approach & run instructions
├── Challenge.md              # Full challenge spec
├── frontend/
│   ├── src/
│   │   ├── components/       # UI pieces (prompt, preview, history, …)
│   │   ├── services/         # API client → NestJS
│   │   ├── types/            # Shared TS types (contract with backend)
│   │   ├── hooks/            # State / history helpers (optional)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
└── backend/
    ├── src/
    │   ├── generate-ui/      # POST /generate-ui — controller, service, DTOs
    │   ├── ai/               # Provider abstraction + API calls
    │   ├── common/           # Shared types, filters, utils
    │   ├── app.module.ts
    │   └── main.ts
    ├── .env.example
    └── package.json
```

---

## Quick start

### Prerequisites

- Node.js 20.13+ (frontend uses Vite 6 for broad compatibility)
- npm
- An AI provider API key (when implementing generation)

### 1. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend (already installed if you used the Nest CLI scaffold)
cd ../backend && npm install
```

### 2. Environment variables

**Backend** — copy and fill in:

```bash
cp backend/.env.example backend/.env
```

**Frontend** — copy and adjust if needed:

```bash
cp frontend/.env.example frontend/.env
```

### 3. Run both apps

In two terminals:

```bash
# Terminal 1 — API (default http://localhost:3000)
cd backend && npm run start:dev

# Terminal 2 — UI (default http://localhost:5173)
cd frontend && npm run dev
```

- Frontend: http://localhost:5173  
- Backend health (default Nest scaffold): http://localhost:3000  

---

## Architecture & data flow

```txt
User prompt
    ↓
React (PromptInput, state, history)
    ↓  POST /generate-ui  { prompt }
NestJS GenerateUiController
    ↓  validation (DTO + class-validator)
GenerateUiService
    ↓  system + user prompt
AiService (provider-agnostic)
    ↓
OpenAI / Anthropic / …
    ↓
Generated UI code (string)
    ↓
Response { id, prompt, code, createdAt }
    ↓
PreviewRenderer + CodeViewer
    ↓
Visual preview + optional code tab
```

### Separation of concerns

| Concern              | Owner        | Notes |
|----------------------|--------------|-------|
| UX, loading, errors  | Frontend     | React state or lightweight context |
| API key & AI calls   | Backend only | Never expose keys in the browser |
| Prompt engineering   | Backend      | System prompt in `AiService` |
| Request validation   | Backend      | `GenerateUiDto` + `ValidationPipe` |
| Dynamic preview      | Frontend     | See [Preview strategy](#preview-strategy) |
| History              | Frontend     | In-memory and/or `localStorage` |

---

## API contract (planned)

### `POST /generate-ui`

**Request**

```json
{
  "prompt": "Create a landing page for an AI course for entrepreneurs."
}
```

**Response**

```json
{
  "id": "uuid-or-nanoid",
  "prompt": "Create a landing page for an AI course for entrepreneurs.",
  "code": "<generated-ui-code>",
  "createdAt": "2026-05-08T15:00:00.000Z"
}
```

**Errors**

- `400` — empty or invalid prompt  
- `502` / `503` — AI provider failure  
- `500` — unexpected server error  

During live coding, `GenerateUiService` may return a **mock** response with the same shape until `AiService` is wired to a real provider.

---

## Preview strategy (planned)

**Recommended approach for this challenge:** AI generates **self-contained TSX** using **Tailwind utility classes** (no external CDN). The frontend renders it inside a **sandboxed iframe** via `srcDoc`:

1. Build a minimal HTML document: Tailwind CDN (preview only) + transpiled/bundled component, **or** use a client-side TSX runner (e.g. `sucrase` + `react-dom` in iframe).
2. **Alternative (simpler, less safe):** `eval`/dynamic `Function` + React — acceptable for a demo if documented; prefer iframe isolation.
3. Catch render errors with an error boundary or iframe `onError` messaging → show “code not renderable” state.

**Security considerations (document in final README):**

- Untrusted code from the model — no `eval` in parent window if avoidable.
- Sanitize/strip `<script>`, `on*` handlers, `javascript:` URLs if rendering HTML.
- No network calls from generated code (enforce via prompt + post-processing).
- API keys only on server.

**Trade-off:** iframe + Tailwind CDN is fast to ship; production would use a proper sandbox (e.g. WebContainer, isolated VM, or pre-compile on server).

---

## Frontend implementation plan

| File / area | Responsibility |
|-------------|----------------|
| `PromptInput.tsx` | Controlled textarea, disabled while loading |
| `GenerateButton.tsx` | Submit / regenerate same prompt |
| `PreviewRenderer.tsx` | Render `code` visually (iframe or sandbox) |
| `CodeViewer.tsx` | Raw generated code (+ optional syntax highlight) |
| `HistoryList.tsx` | List past `{ id, prompt, createdAt }`, select to restore |
| `LoadingState.tsx` | Spinner / skeleton while generating |
| `ErrorMessage.tsx` | API, AI, empty, or render failures |
| `services/generateUiApi.ts` | `fetch(VITE_API_URL/generate-ui, …)` |
| `types/generatedUi.ts` | `GeneratedUi`, `GenerateUiRequest` |
| `App.tsx` | Compose layout; tabs **Preview** \| **Code** |

**State machine (planned):**

`idle` → `generating` → `success` \| `error`  
Regenerate: stay on same prompt, replace current result.  
History: append on success; selecting item restores preview + code.

---

## Backend implementation plan

| File / area | Responsibility |
|-------------|----------------|
| `generate-ui.controller.ts` | `POST /generate-ui`, delegates to service |
| `generate-ui.service.ts` | Orchestrate validation, AI call, map response |
| `dto/generate-ui.dto.ts` | `prompt: string` + `@IsNotEmpty()` |
| `ai/ai.service.ts` | Call provider; build system prompt; parse code from response |
| `ai/ai.module.ts` | Export `AiService`; read `ConfigModule` env |
| `common/types/generated-ui.ts` | Response interface shared with DTOs |
| `main.ts` | Enable CORS for `http://localhost:5173`, global `ValidationPipe` |

**System prompt (baseline)** — see `Challenge.md`; require: UI code only, no markdown fences, no `<script>`, self-contained React + Tailwind component.

**Provider abstraction:** `AiService` reads `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` so swapping OpenAI ↔ Anthropic is a small change.

---

## Implementation checklist

Use this as the build order for the take-home / live coding session.

### Phase 1 — Live coding base

- [ ] Backend: `GenerateUiModule`, controller, DTO, mock service response
- [ ] Backend: CORS + `ValidationPipe`
- [ ] Frontend: prompt textarea + Generate button
- [ ] Frontend: `generateUiApi.ts` calling backend
- [ ] Frontend: loading + error UI
- [ ] Frontend: preview placeholder (even static HTML first)

### Phase 2 — AI integration

- [ ] `AiService` with real provider + env vars
- [ ] Prompt engineering + strip markdown/code fences from model output
- [ ] Handle empty / invalid AI responses

### Phase 3 — Preview & code view

- [ ] `PreviewRenderer` with chosen sandbox strategy
- [ ] Preview \| Code tabs
- [ ] Render error handling (“code not renderable”)

### Phase 4 — History & regenerate

- [ ] Regenerate button (same prompt, new result)
- [ ] History list + select previous generation
- [ ] Persist history in `localStorage` (optional but valuable)

### Phase 5 — Polish

- [ ] Tailwind on app shell
- [ ] Syntax highlighting in `CodeViewer`
- [ ] Copy code button
- [ ] README: final decisions, limitations, security notes

---

## Environment variables

### Backend (`backend/.env`)

| Variable       | Description                          | Example        |
|----------------|--------------------------------------|----------------|
| `PORT`         | HTTP port                            | `3000`         |
| `AI_PROVIDER`  | Provider id                          | `openai`       |
| `AI_API_KEY`   | Secret key (server only)             | `sk-…`         |
| `AI_MODEL`     | Model name                           | `gpt-4o-mini`  |
| `CORS_ORIGIN`  | Allowed frontend origin (optional)   | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable        | Description              | Example                 |
|-----------------|--------------------------|-------------------------|
| `VITE_API_URL`  | NestJS base URL          | `http://localhost:3000` |

---

## Scripts reference

| Location   | Command              | Purpose              |
|------------|----------------------|----------------------|
| `frontend` | `npm run dev`        | Vite dev server        |
| `frontend` | `npm run build`      | Production build       |
| `backend`  | `npm run start:dev`  | Nest watch mode        |
| `backend`  | `npm run start`      | Nest production start  |
| `backend`  | `npm run test`       | Unit tests             |

---

## Known limitations (scaffold stage)

- No `POST /generate-ui` endpoint yet — only default Nest `GET /`.
- No AI integration or env validation.
- Frontend is the Vite starter shell, not the final AI UI Builder layout.
- Preview renderer and history are not implemented.

These are intentional; follow the [Implementation checklist](#implementation-checklist).

---

## Future improvements

- Iterative edits: “change the hero to …” on current generation  
- Streaming partial code from the model  
- Syntax highlighting + copy button  
- Responsive preview modes (desktop / tablet / mobile)  
- Docker Compose for frontend + backend  
- Stronger sandbox (WebContainer, server-side compile)  
- Integration tests for `POST /generate-ui`  
- Provider plugins (OpenAI, Anthropic, Ollama) via strategy pattern  
- Export as HTML or `.tsx` file  

---

## Challenge reference

Full requirements: [`Challenge.md`](./Challenge.md)
