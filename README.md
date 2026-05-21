https://github.com/user-attachments/assets/2048105a-c748-425a-a4f2-fbb6088b1b04

# AI UI Builder

Simplified v0-style app: describe a UI in natural language, the NestJS backend calls an AI provider, and the React frontend renders the result in a sandboxed iframe preview.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, CSS Modules |
| Backend | NestJS, TypeScript, class-validator |
| AI | Groq, OpenAI, Anthropic, Ollama, or Mistral (env-driven) |
| Shared types | `packages/types` (`GeneratedUi` contract) |
| Persistence | Projects and versions in browser `localStorage` |

---

## Quick start

### Prerequisites

- Node.js 20.13+ (22+ recommended)
- npm 10+
- AI API key for your chosen provider

### Install

From the repository root (npm workspaces):

```bash
npm install
```

Or install each app separately:

```bash
cd frontend && npm install
cd ../backend && npm install
```

### Environment

**Backend** — copy and configure:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:5173`) |
| `AI_PROVIDER` | `groq` \| `openai` \| `anthropic` \| `ollama` \| `mistral` |
| `AI_API_KEY` | Provider secret (not required for Ollama) |
| `AI_MODEL` | Model id (provider-specific default if omitted) |
| `AI_BASE_URL` | Optional API base override |
| `PEXELS_API_KEY` | Optional stock photos for themed generation |

**Frontend**:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | NestJS base URL, e.g. `http://localhost:3000` |

### Run locally

Two terminals:

```bash
cd backend && npm run start:dev
```

```bash
cd frontend && npm run dev
```

- UI: http://localhost:5173  
- API health: http://localhost:3000  

### Docker Compose

```bash
# Set AI_API_KEY in backend/.env or export it
docker compose up --build
```

- UI: http://localhost:5173  
- API: http://localhost:3000  

---

## What the app does

1. **Generate** — User enters a prompt (optional visual style: minimal, bold, corporate, playful).
2. **Preview** — Generated TSX is compiled in an isolated iframe (`sandbox="allow-scripts"`, `srcDoc`).
3. **Modify** — Follow-up instructions append versions on the active iteration.
4. **Regenerate** — Same initial prompt, new iteration branch (variants).
5. **History** — Projects, iterations, and versions in `localStorage`; revert to any past version.

Tabs: **Preview** | **Code** (syntax-highlighted, copy button). Preview toolbar: desktop / tablet / mobile widths.

---

## API

### `POST /generate-ui`

```json
{
  "prompt": "Create a landing page for an AI course.",
  "visualStyle": "minimal"
}
```

`visualStyle` is optional: `auto` | `minimal` | `bold` | `corporate` | `playful`.

### `POST /modify-ui`

```json
{
  "instruction": "Make the hero background dark blue",
  "currentCode": "<generated TSX…>"
}
```

### Response (`GeneratedUi`)

```json
{
  "id": "uuid",
  "prompt": "…",
  "code": "<tsx>",
  "createdAt": "2026-05-21T12:00:00.000Z"
}
```

Errors: `400` validation, `502` AI/validation failure, `503` provider not configured.

---

## Technical decisions

- **Provider abstraction** — `AiChatProvider` + `AI_PROVIDER` env; Groq/OpenAI/Mistral/Ollama share an OpenAI-compatible client; Anthropic uses its SDK.
- **Backend pipeline** — Extract code from model output → `validate-ui-code` (syntax, unsafe patterns, max size) → optional AI fix loop → themed assets (Pexels when configured).
- **Preview runtime** — Prebuilt IIFEs (ReactBits, Framer Motion) + inline shadcn globals; Babel in iframe compiles generated TSX. No imports in generated code.
- **State** — `useBuilderState` coordinates projects, iterations, versions, generate/modify/regenerate.
- **Shared contract** — `packages/types/generated-ui.ts` imported by both apps.

Deeper docs: [`docs/Frontend-README.md`](./docs/Frontend-README.md), [`docs/Backend-README.md`](./docs/Backend-README.md).

---

## How generated code is rendered (security)

| Measure | Implementation |
|---------|----------------|
| Isolation | Preview only inside iframe; parent never `eval`s model output |
| Sandbox | `sandbox="allow-scripts"` (no top navigation, no form submit to parent) |
| Static checks | Backend rejects `<script>`, `eval`, `dangerouslySetInnerHTML`, oversized payloads |
| CDN in preview | Tailwind + React UMD + bundled runtimes loaded in iframe only |
| Secrets | API keys only in `backend/.env`; frontend uses `VITE_API_URL` only |

**Risks:** Model output is still untrusted code with script capability inside the iframe. A compromised or malicious model could attempt phishing UI or network calls from the iframe. **Production** would use a stronger sandbox (WebContainer, server-side compile to static HTML, CSP, network denylist).

**Limitations:** Cross-origin CDN scripts may surface generic “Script error.” in the parent; preview errors show an inline banner + toast. No server-side persistence of projects.

---

## Known limitations

- Projects are **client-only** (`localStorage`, ~5MB quota).
- Long AI calls have no cangress UI.
- No streaming or step-by-step pro (gate behind env for production).

---

## Future improvements

Highlights:

- Streaming tokens and generation step progress  
- Cloud persistence and shareable preview links  
- Request cancellation and rate-limit UX  
- Stronger sandbox / server-side compile  
- OpenAPI docs and CI pipeline  

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| Root | `npm install` | Workspaces: frontend, backend, types |
| `frontend` | `npm run dev` | Dev server + preview runtime build |
| `frontend` | `npm run build` | Production build |
| `frontend` | `npm run test` | Vitest unit tests |
| `backend` | `npm run start:dev` | Nest watch mode |
| `backend` | `npm run test` | Unit tests |
| `backend` | `npm run test:e2e` | E2E (includes mocked `generate-ui`) |

---

## Project layout

```txt
/
├── packages/types/       # Shared GeneratedUi contract
├── frontend/             # React app
├── backend/              # NestJS API
├── docker/               # Dockerfiles for Compose
├── docs/                 # Architecture READMEs + diagrams
├── Challenge.md
└── MissingFromChallenge.md
```
