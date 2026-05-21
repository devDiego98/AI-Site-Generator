# Backend

NestJS API for the AI UI Builder challenge. Exposes `POST /generate-ui`, which calls **Groq** to generate React + Tailwind UI code from a natural-language prompt.

## Run

```bash
npm install
cp .env.example .env   # set AI_API_KEY from https://console.groq.com
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
- `502` — Groq API failure or empty AI response

## Environment variables

| Variable       | Description                    | Example                      |
|----------------|--------------------------------|------------------------------|
| `PORT`         | HTTP port                      | `3000`                       |
| `CORS_ORIGIN`  | Allowed frontend origin        | `http://localhost:5173`      |
| `AI_PROVIDER`  | Provider id (informational)    | `groq`                       |
| `AI_API_KEY`   | Groq API key (server only)     | `gsk_…`                      |
| `AI_MODEL`     | Groq chat model                | `meta-llama/llama-4-scout-17b-16e-instruct` |

## Structure

```txt
src/
  ai/                 # Groq client + system prompt + code extraction
  generate-ui/        # POST /generate-ui — controller, service, DTO
  common/types/       # GeneratedUi response type
  app.module.ts
  main.ts             # CORS + ValidationPipe
```
