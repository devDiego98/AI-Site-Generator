# Frontend — AI UI Builder

React + TypeScript UI with **Atomic Design** architecture.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Atomic structure

```txt
src/
├── styles/          # Design tokens (palette) + global CSS
├── atoms/           # Button, Text, Textarea, Tab, Spinner, Badge, Icon
├── molecules/       # PromptField, GenerateActions, TabGroup, CodeBlock, ViewModeToggle
├── organisms/       # PromptPanel, OutputPanel, PreviewFrame, AppHeader
├── templates/       # BuilderLayout (header + two-column shell)
├── pages/           # BuilderPage
├── hooks/           # useBuilderState
├── services/        # generateUiApi → POST /generate-ui
├── utils/           # buildPreviewHtml (iframe sandbox)
└── types/
```

## Color palette

Defined in `src/styles/tokens.css` — **Midnight Aurora**:

- **Primary** — Indigo scale (`--palette-primary-*`)
- **Accent** — Cyan highlights (`--palette-accent-*`)
- **Neutrals** — Slate surfaces and text
- **Semantic** — `--color-bg-*`, `--color-text-*`, `--color-accent`

## Environment

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:3000
```

Requires the NestJS backend running with a valid `AI_API_KEY`.

## Behavior

- Left: prompt textarea, Generate / Regenerate → `POST /generate-ui`
- Right: **Preview** | **Code** toggle
- Preview: sandboxed iframe (React + Tailwind via CDN, Babel in iframe)
- Code: TSX returned by the backend

See [root README](../README.md) for full challenge plan.
