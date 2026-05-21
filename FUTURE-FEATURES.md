# Future Features

Product and UX enhancements beyond the current MVP. For technical gaps and refactors, see [TECH-DEBT.md](./TECH-DEBT.md).

---

## Generation & preview UX

| Feature | Description |
|---------|-------------|
| **Regenerate** | One-click variant from the same initial prompt (new version, no retyping) |
| **Streaming** | Stream tokens from the AI provider; live code + partial preview |
| **Step progress** | Status steps: `generating` → `validating` → `enhancing` (SSE or polling) |
| **Actionable errors** | Map validation failures to user-friendly hints in the UI |
| **Version branching** | “Branch from this version” vs “Revert and continue” for clearer lineage |
| **Responsive preview** | Mobile / tablet / desktop breakpoints in the preview frame |
| **Copy & export** | Copy code, download `.tsx`, export static HTML (zip with assets) |
| **Fix from preview** | “Send error to AI to fix” from compact parent-app error summary |
| **Open links in new tab** | Toggle for marketing landings inside preview |

---

## Projects & history

| Feature | Description |
|---------|-------------|
| **Cloud persistence** | Move `localStorage` projects to a database (see [TECH-DEBT.md](./TECH-DEBT.md#projects--history)) |
| **Search & filter** | Find projects by prompt text, date, tags |
| **Preview thumbnails** | Tiny snapshot per version in the history list |
| **Rename & organize** | Custom titles, tags, pin/favorite |
| **Soft delete** | Undo delete within a short window |

---

## Core product

1. **Shareable preview link** — read-only public view (server-stored project + version or signed token)
2. **Template gallery** — starter prompts (“SaaS pricing”, “event page”) one-click insert
3. **Design system picker** — light/dark, accent color, font pair as generation context
4. **Component library browser** — in-app docs for shadcn, ReactBits, Framer Motion globals
5. **Side-by-side compare** — visual + code diff between two versions
6. **AI chat panel** — conversational edits with full code context

---

## Collaboration & accounts

- **Auth (OAuth)** — Google / GitHub login
- **Teams & shared projects** — RBAC on generations
- **Comments on versions** — design review workflow

---

## Developer experience

- **OpenAPI / Swagger** — document `generate-ui` and `modify-ui`
- **Webhook** — notify when generation completes
- **CLI** — `npx ai-ui-builder generate "prompt" > App.tsx`
- **VS Code extension** — send selection to API, paste result

---

## Quality & AI

- **User feedback** — thumbs up/down per version for prompt tuning
- **A/B system prompts** — measure render success and ratings
- **Accessibility audit** — axe rules in `evaluate-ui-design` + auto-fix pass
- **Performance budget** — warn on deep trees or too many WebGL backgrounds
- **Multi-model routing** — cheaper model for draft, stronger model for fix loop only

---

## Operations & export

- **Admin dashboard** — usage, cost per provider, error rates
- **Feature analytics** — which ReactBits backgrounds are used most
- **Deploy export** — one-click Vercel / Netlify static deploy
- **Figma handoff** — screenshot + spec (stretch)
- **i18n generation** — translate UI strings from a single instruction

---

## Suggested priority

| Priority | Features |
|----------|----------|
| P1 | Regenerate, copy/download code, clearer errors |
| P2 | Streaming, step progress, responsive preview |
| P3 | Share links, template gallery, auth, deploy export |

---

## Related docs

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) — overview and index
- [TECH-DEBT.md](./TECH-DEBT.md) — security, architecture, infrastructure
- [Challenge.md](./Challenge.md) — original requirements
- [docs/Frontend-README.md](./docs/Frontend-README.md) — frontend architecture
- [docs/Backend-README.md](./docs/Backend-README.md) — backend architecture
