# Backend Architecture

NestJS + TypeScript API that accepts natural-language prompts, calls **Groq** for UI generation, post-processes and validates JSX, and returns a single-file React component string for the frontend preview runtime.

There is no database, queue, or authentication layer.

## High-level architecture

```
┌──────────────┐     POST /generate-ui      ┌─────────────────────┐
│   Frontend   │ ─────────────────────────► │  GenerateUiModule   │
│  (React)     │     POST /modify-ui        │  Controller + DTOs  │
└──────────────┘ ◄───────────────────────── │  GenerateUiService  │
              GeneratedUi { code, … }       └──────────┬──────────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │      AiService      │
                                              │  Groq + prompts +   │
                                              │  validation pipeline│
                                              └──────────┬──────────┘
                                                         │
                         ┌───────────────────────────────┼───────────────────────────────┐
                         ▼                               ▼                               ▼
                   ┌──────────┐                   ┌──────────────┐                 ┌─────────────┐
                   │ Groq API │                   │ Pexels API   │                 │ Lorem Flickr│
                   │ (LLM)    │                   │ (optional)   │                 │ (fallback)  │
                   └──────────┘                   └──────────────┘                 └─────────────┘
```

## Flow diagram

Open **[backend-flow.excalidraw](./backend-flow.excalidraw)** in [Excalidraw](https://excalidraw.com) or the VS Code Excalidraw extension for the full interactive diagram (HTTP → services → AI pipeline → external APIs).

To regenerate the diagram from source:

```bash
node docs/generate-excalidraw.mjs
```

## Module graph

```
AppModule
├── ConfigModule (global, .env)
├── GenerateUiModule
│   ├── imports: AiModule
│   ├── GenerateUiController  → POST /generate-ui, POST /modify-ui
│   └── GenerateUiService       → wraps AiService, builds GeneratedUi
├── AiModule
│   ├── AiService             → Groq + pipeline
│   └── exports AiService
└── AppController             → GET / health check
```

## Directory structure

```
backend/
├── package.json
├── nest-cli.json
├── tsconfig.json / tsconfig.build.json
├── .env / .env.example
├── test/                      # E2E (health check only)
└── src/
    ├── main.ts                # Bootstrap, CORS, ValidationPipe
    ├── app.module.ts          # Root module
    ├── app.controller.ts      # GET / → { status: 'ok' }
    ├── common/
    │   └── types/
    │       └── generated-ui.ts    # API response contract
    ├── generate-ui/
    │   ├── generate-ui.module.ts
    │   ├── generate-ui.controller.ts
    │   ├── generate-ui.service.ts
    │   └── dto/
    │       ├── generate-ui.dto.ts   # { prompt }
    │       └── modify-ui.dto.ts     # { instruction, currentCode }
    └── ai/
        ├── ai.module.ts
        ├── ai.service.ts          # Groq orchestration
        ├── reactbits-background-usage.ts
        ├── prompts/
        │   ├── ui-generation.prompt.ts
        │   ├── ui-modification.prompt.ts
        │   ├── reactbits-site-generator.prompt.ts
        │   ├── reactbits-background-catalog.ts
        │   └── shadcn-catalog.ts
        └── utils/                 # Post-processing & quality (see below)
```

## HTTP API

| Method | Path | Request body | Response |
|--------|------|--------------|----------|
| `GET` | `/` | — | `{ "status": "ok" }` |
| `POST` | `/generate-ui` | `{ "prompt": string }` | `GeneratedUi` |
| `POST` | `/modify-ui` | `{ "instruction": string, "currentCode": string }` | `GeneratedUi` |

### Response contract (`GeneratedUi`)

```typescript
{
  id: string;        // randomUUID()
  prompt: string;    // user prompt OR modification instruction
  code: string;      // single-file JSX (export default function GeneratedApp)
  createdAt: string; // ISO 8601
}
```

The frontend uses `code` for the iframe preview; `id` and `createdAt` support version history on the client.

### Error responses

| Status | When |
|--------|------|
| `400` | DTO validation failed (class-validator) |
| `502` | Empty AI response, invalid code after fix loop, Groq rate limit / API error |
| `503` | `AI_API_KEY` missing or placeholder |

Nest returns JSON like `{ "statusCode": 502, "message": "..." }`.

## End-to-end flow: `POST /generate-ui`

```
Client { prompt }
  → GenerateUiController.generate(GenerateUiDto)
  → ValidationPipe (whitelist, transform)
  → GenerateUiService.generate(prompt)
  → AiService.generateUiCode(prompt)
  → completeUiRequest (generate path)
  → GenerateUiService wraps result with randomUUID() + timestamp
  → JSON response to frontend
```

### AI pipeline (`AiService.completeUiRequest` — generate)

| Step | Module | Description |
|------|--------|-------------|
| 1 | `generation-variation.ts` | Per-request seed for layout variety |
| 2 | `prompt-generation-profile.ts` | Prepends **GENERATION BRIEF** (archetype, theme, sections) |
| 3 | `ui-generation.prompt.ts` | System prompt: shadcn + ReactBits catalogs, no imports |
| 4 | Groq | `chat.completions.create` — model from `AI_MODEL`, temp `1`, max 4096 tokens |
| 5 | `extract-ui-code.ts` | Strip markdown fences from raw LLM output |
| 6 | `validate-ui-code.ts` | `prepareUiCode` — Babel parse, safety checks |
| 7 | `evaluate-ui-design.ts` / `fix-ui-design.ts` | Design quality rules |
| 8 | `ai-ui-fix-loop.ts` | Up to 3 Groq retries with validation errors as follow-up |
| 9 | `prompt-themed-generation.ts` | Inject ReactBits background if missing |
| 10 | `apply-topic-images.ts` | Replace image URLs via Pexels or Lorem Flickr |
| 11 | Return | Final `code` string |

## End-to-end flow: `POST /modify-ui`

```
Client { instruction, currentCode }
  → GenerateUiController.modify(ModifyUiDto)
  → GenerateUiService.modify(instruction, currentCode)
  → AiService.modifyUiCode(instruction, currentCode)
```

Differences from generate:

- System prompt: `ui-modification.prompt.ts`
- User message includes full current code + modification request
- Temperature `0.8` (vs `1` on generate)
- **No** `applyPromptThemedGeneration` step
- Optional `random-background-swap.ts` when instruction matches background-change heuristics

## DTO validation

| DTO | Field | Rules |
|-----|-------|-------|
| `GenerateUiDto` | `prompt` | string, 3–5000 chars, not empty |
| `ModifyUiDto` | `instruction` | string, 3–2000 chars |
| `ModifyUiDto` | `currentCode` | string, min 20 chars |

Global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`.

## AI prompts (`src/ai/prompts/`)

| File | Role |
|------|------|
| `ui-generation.prompt.ts` | System prompt for new UIs |
| `ui-modification.prompt.ts` | System prompt for edits |
| `reactbits-site-generator.prompt.ts` | `UI_DESIGN_STANDARDS` shared rules |
| `reactbits-background-catalog.ts` | Allowed ReactBits background components |
| `shadcn-catalog.ts` | Allowed shadcn-style components |

Generated code is instructed to:

- Export `export default function GeneratedApp()`
- Use **no imports** (React hooks, shadcn, Framer Motion, ReactBits, Recharts are globals in the frontend iframe)
- Follow design standards (contrast, layout, sections)

## Post-processing utilities (`src/ai/utils/`)

| File | Role |
|------|------|
| `extract-ui-code.ts` | Parse LLM output, remove code fences |
| `normalize-ui-code.ts` | `GeneratedPage` → `GeneratedApp`, JSX cleanup |
| `validate-ui-code.ts` | Babel parse, forbidden patterns, `prepareUiCode` |
| `ai-ui-fix-loop.ts` | Retry invalid code with Groq |
| `design-fix-prompt.ts` | User messages for fix loop |
| `evaluate-ui-design.ts` | Design rule evaluation |
| `fix-ui-design.ts` | Automated design fixes |
| `fix-orphan-ref.ts` | Remove invalid `ref={ref}` |
| `jsx-tag-utils.ts` / `contrast-utils.ts` | JSX and contrast helpers |
| `prompt-generation-profile.ts` | Generation brief builder |
| `generation-variation.ts` | Per-request variation |
| `prompt-themed-generation.ts` | Background + theme injection (generate) |
| `prompt-theme-inference.ts` | Theme detection from prompt |
| `apply-topic-images.ts` | Replace `<img>` / avatar sources |
| `pexels-image-provider.ts` | Pexels search client |
| `topic-image-urls.ts` | Lorem Flickr fallback URLs |
| `random-background-swap.ts` | Modify-time background swaps |

Many utilities have matching `*.spec.ts` unit tests.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No (default `3000`) | HTTP port |
| `CORS_ORIGIN` | No (default `http://localhost:5173`) | Allowed frontend origin |
| `AI_API_KEY` | Yes for generation | Groq API key |
| `AI_MODEL` | No | Groq model id (default Llama 4 Scout) |
| `PEXELS_API_KEY` | No | Stock photos; without it, Lorem Flickr URLs are used |

`AI_PROVIDER` appears in `.env.example` for documentation only; the code uses `groq-sdk` directly.

## External services

| Service | Usage |
|---------|--------|
| **Groq** | All LLM calls (generate, modify, fix loop) |
| **Pexels** | Optional topic-based images when `PEXELS_API_KEY` is set |
| **Lorem Flickr** | Fallback image URLs via `topic-image-urls.ts` |

## What `code` contains

A string the frontend can run in the preview iframe:

```tsx
export default function GeneratedApp() {
  return (
    <div className="relative min-h-screen">
      <Galaxy className="reactbits-bg" />
      {/* shadcn components, motion, charts, images — no import statements */}
    </div>
  );
}
```

Post-processing ensures valid JSX, sensible design, themed backgrounds on generate, and real image URLs where possible.

## Key files quick reference

| Concern | Path |
|---------|------|
| Bootstrap | `src/main.ts` |
| Root module | `src/app.module.ts` |
| HTTP routes | `src/generate-ui/generate-ui.controller.ts` |
| Response assembly | `src/generate-ui/generate-ui.service.ts` |
| AI orchestration | `src/ai/ai.service.ts` |
| Response type | `src/common/types/generated-ui.ts` |
| Generation prompt | `src/ai/prompts/ui-generation.prompt.ts` |

## Local development

```bash
cd backend
cp .env.example .env   # set AI_API_KEY, optional PEXELS_API_KEY
npm install
npm run start:dev
```

Default URL: `http://localhost:3000`. Match `CORS_ORIGIN` to the frontend dev server and set `VITE_API_URL` on the frontend to this base URL.

## Testing

- **Unit:** `src/ai/utils/*.spec.ts` — validation, theming, normalization, fix loop
- **E2E:** `test/app.e2e-spec.ts` — `GET /` health only (no live AI in CI by default)

```bash
npm test          # unit
npm run test:e2e  # e2e
```
