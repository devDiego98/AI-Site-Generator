# Project Improvements

Index for planned work on the AI UI Builder (NestJS + React/Vite + Groq + iframe preview). Details live in linked docs — this file stays short.

---

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/Frontend-README.md](./docs/Frontend-README.md) | Frontend architecture, file structure, preview runtime |
| [docs/Backend-README.md](./docs/Backend-README.md) | Backend architecture, AI pipeline, API |
| [docs/frontend-flow.excalidraw](./docs/frontend-flow.excalidraw) | Excalidraw — user → API → iframe flow |
| [docs/backend-flow.excalidraw](./docs/backend-flow.excalidraw) | Excalidraw — generate/modify pipeline |
| [Challenge.md](./Challenge.md) | Challenge requirements and scope |

---

## Roadmap

| Doc | Contents |
|-----|----------|
| **[FUTURE-FEATURES.md](./FUTURE-FEATURES.md)** | Product UX: regenerate, streaming, share links, auth, templates, export, collaboration |
| **[TECH-DEBT.md](./TECH-DEBT.md)** | Engineering: security, provider abstraction, DB migration, CI/CD, validation parity, observability |

---

## Current gaps (summary)

**Product** — See [FUTURE-FEATURES.md](./FUTURE-FEATURES.md). Highlights: dedicated regenerate, streaming preview, shareable links, template gallery, cloud project history.

**Engineering** — See [TECH-DEBT.md](./TECH-DEBT.md). Highlights:

- Projects stored in **`localStorage` only** — should move to a **database** for multi-device and multi-user use
- Public API with no auth or rate limits (demo OK, not production-ready)
- Groq-coupled `AiService`; preview relies on **CDN scripts** and in-browser Babel
- No CI/CD or Docker setup in repo

---

## Priority at a glance

| Priority | Focus | Details in |
|----------|--------|------------|
| P0 | Security hardening | [TECH-DEBT.md](./TECH-DEBT.md#security) |
| P1 | Core UX + API quality | [FUTURE-FEATURES.md](./FUTURE-FEATURES.md#suggested-priority), [TECH-DEBT.md](./TECH-DEBT.md#suggested-priority) |
| P2 | Streaming, DB, infra | Both roadmap docs |
| P3 | Auth, sharing, deploy export | [FUTURE-FEATURES.md](./FUTURE-FEATURES.md) |

---

*Revisit as features ship. Architecture diagrams: [docs/README.md](./docs/README.md).*
