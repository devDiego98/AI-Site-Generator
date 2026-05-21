# Backend

NestJS API for the AI UI Builder challenge. Exposes `POST /generate-ui`, which calls a configurable AI provider (Groq, OpenAI, Anthropic, Ollama, Mistral) to generate React + Tailwind UI code from a natural-language prompt.

## Run

```bash
npm install
cp .env.example .env   # set AI_PROVIDER, AI_API_KEY, AI_MODEL
npm run start:dev
```

API default: http://localhost:3000

## Endpoints

| Method | Path           | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/`            | Health / hello                       |
| POST   | `/generate-ui` | Generate UI code from `{ "prompt" }` |

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
  "id": "uuid",
  "prompt": "Create a landing page for an AI course for entrepreneurs.",
  "code": "export default function GeneratedPage() { ... }",
  "createdAt": "2026-05-08T15:00:00.000Z"
}
```

**Errors**

- `400` — invalid or empty prompt (class-validator)
- `503` — `AI_API_KEY` not configured
- `502` — AI provider failure or empty AI response

## Environment variables

| Variable       | Description                    | Example                      |
|----------------|--------------------------------|------------------------------|
| `PORT`         | HTTP port                      | `3000`                       |
| `CORS_ORIGIN`  | Allowed frontend origin        | `http://localhost:5173`      |
| `AI_PROVIDER`  | Provider: `groq`, `openai`, `anthropic`, `ollama`, `mistral` | `groq` |
| `AI_API_KEY`   | Provider API key (not required for Ollama) | `gsk_…` / `sk-…` |
| `AI_MODEL`     | Model id for the selected provider | `meta-llama/llama-4-scout-17b-16e-instruct` |
| `AI_BASE_URL`  | Optional API base URL override | `http://localhost:11434/v1` |

## Structure

```txt
src/
  ai/                 # Provider factory + prompts + code extraction
  ai/providers/       # Groq, OpenAI, Anthropic, Ollama, Mistral adapters
  generate-ui/        # POST /generate-ui — controller, service, DTO
  common/types/       # GeneratedUi response type
  app.module.ts
  main.ts             # CORS + ValidationPipe
```
