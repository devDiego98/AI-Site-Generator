# Project documentation

Architecture and flow diagrams for the AI UI Builder challenge.

| Document | Description |
|----------|-------------|
| [Frontend-README.md](./Frontend-README.md) | React app structure, preview runtime, state, API integration |
| [Backend-README.md](./Backend-README.md) | NestJS modules, AI pipeline, DTOs, post-processing |
| [frontend-flow.excalidraw](./frontend-flow.excalidraw) | Excalidraw diagram — frontend end-to-end flow |
| [backend-flow.excalidraw](./backend-flow.excalidraw) | Excalidraw diagram — backend generate/modify flow |

## Roadmap (repo root)

| Document | Description |
|----------|-------------|
| [../IMPROVEMENTS.md](../IMPROVEMENTS.md) | Index — links to architecture docs and roadmap |
| [../FUTURE-FEATURES.md](../FUTURE-FEATURES.md) | Planned product and UX features |
| [../TECH-DEBT.md](../TECH-DEBT.md) | Security, architecture, and infrastructure debt |

Open `.excalidraw` files in [excalidraw.com](https://excalidraw.com) or the VS Code Excalidraw extension.

Regenerate diagrams after editing layout in `generate-excalidraw.mjs`:

```bash
node docs/generate-excalidraw.mjs
```
