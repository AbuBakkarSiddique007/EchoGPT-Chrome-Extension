# EchoGPT — Chrome Extension Popup

> A design prototype of the **EchoGPT browser-extension assistant** — chat, writing, reading, translation, image & video generation, model comparison, and MCP tool management, all in one popup-sized UI.

## Try the live demo

The latest build is deployed on both platforms. Open either link in a browser and resize the window to **400 × 700 px** (the target popup viewport) to see it exactly as the extension popup would appear:

| Platform | URL |
| --- | --- |
| **Vercel** | [https://echo-gpt-chrome-extension.vercel.app](https://echo-gpt-chrome-extension.vercel.app) |
| **Netlify** | [https://echo-gpt-chrome-extension.netlify.app](https://echo-gpt-chrome-extension.netlify.app) |

**Source code:** [github.com/AbuBakkarSiddique007/EchoGPT-Chrome-Extension](https://github.com/AbuBakkarSiddique007/EchoGPT-Chrome-Extension)

## About the project

EchoGPT is a productivity assistant popup for your browser: an AI chat, a writing studio, a page reader, a translator, an image/video generator, a model-comparison arena, and an MCP connector toolbox behind a single right-hand capability rail — the compact, always-available tool surface a browser extension lives in.

This repository is a **high-fidelity design prototype** of that popup, built as a local Next.js app and rendered in an ordinary browser tab so the complete flow can be experienced with no account, backend, or model access. It is **not a loadable browser extension** — there is no `manifest.json`, service worker, or content script, and none are planned for this prototype. All AI outputs are simulated and explicitly labeled as demo results.

## Feature Overview

The popup shell provides a right-hand capability rail with the following workspaces:

| Capability | Description |
| --- | --- |
| **Chat** | Conversational interface with a model selector, quick actions, streaming-style reply animation, and error/rate-limit states |
| **Write** | Compose / Reply / Grammar modes with format, tone, length, and output-language controls |
| **Read** | Summarize, extract key points, explain, or answer questions over a current page, URL, or uploaded file |
| **Translate** | Two-language pair with auto-detect, language swap, import from page, and character/word counts |
| **Image & Video Studio** | Aspect-ratio and model controls with a simulated generation queue and a session-only creation history |
| **Compare** | Select up to three model tones and observe a simulated "model arena" verdict |
| **MCP Toolbox** | Connector management — status checks, connection lifecycle states, and an add-connector dialog with validation |
| **Settings** | Appearance (light / dark / system), defaults, page-context preference, history controls, shortcuts, and about |

Supporting chrome includes an account/settings area, avatars, tooltips, toast-style notices, and full keyboard support (Enter to send, Shift+Enter for newline, Escape to dismiss).

## Honest Demo Policy

Nothing in this prototype reaches a real service:

- No LLM, translation model, reading engine, or image/video model is ever called.
- No MCP server is contacted; connector tokens never leave the popup.
- No network requests, backend contracts, authentication, or billing are involved.
- Simulated output is labeled with **Demo** (or **Error**) markers; unimplemented capabilities render explicit disabled or "coming soon" states.

## Requirements

- **Node.js** 20.9+ (the project targets Node ≥ 20; Next.js 16 requires a modern runtime)
- **pnpm** 10.x (`packageManager`: `pnpm@10.28.1`)

Install dependencies from the repository root:

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to preview the popup. The target popup viewport is **400 × 700 px** and must remain usable down to **320 × 520 px**; resize the browser window to exercise these stress sizes.

## Scripts

| Command | Action |
| --- | --- |
| `pnpm dev` | Start the Next.js development server (Turbopack) |
| `pnpm lint` | Run ESLint over the project |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm build` | Create an optimized production build (Next.js 16 + Turbopack) |
| `pnpm start` | Serve the production build |

All of `lint`, `typecheck`, and `build` are expected to pass before a workspace is considered complete.

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Design tokens, brand palette, layout & workspace styles
│   ├── layout.tsx         # Root layout + pre-paint theme initialization
│   └── page.tsx           # Shared popup shell, capability rail, and Chat workspace
├── components/
│   ├── compare-workspace.tsx
│   ├── mcp-workspace.tsx
│   ├── read-workspace.tsx
│   ├── settings-workspace.tsx
│   ├── studio-workspace.tsx
│   ├── translate-workspace.tsx
│   ├── write-workspace.tsx
│   └── ui/                # shadcn/ui primitives (button, avatar, dialog, dropdown, separator, tooltip)
└── lib/
    ├── types.ts           # Typed local contracts (ToolId, Message, Connector, ThemePreference, …)
    ├── models.ts          # Shared demo model catalog
    ├── languages.ts       # Shared language catalogs
    └── settings.ts        # Typed localStorage store (echogpt.demo.settings.v1)
```

## Technology Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI runtime | React 19 |
| Styling | Tailwind CSS 4 + hand-authored design tokens |
| Component library | shadcn/ui (New York style) on Radix UI |
| Icons | lucide-react |
| Package manager | pnpm 10.28.1 |

## Design & Theming

- **Brand**: violet `#7650ec`, delivered as CSS custom properties (`--accent`, `--focus`, …) so a single token change propagates to every shadcn-aware component.
- **Themes**: light and dark palettes follow the operating system by default and can be overridden in Settings. The choice is persisted to `localStorage` (`echogpt.demo.settings.v1`), and a pre-paint inline script restores it before first render to avoid a flash.
- **Responsiveness**: the shell is a flex column with definite sizing and internal scroll regions reserved for each workspace — see `globals.css` for the `min-height: 0` chain that keeps content scrollable within the popup viewport.
- **Accessibility baseline**: accessible names on icon-only controls, `aria-current` on the active rail item, visible focus rings, polite live regions for generating/error states, and `prefers-reduced-motion` support.

## Implementation Status

Capabilities are implemented per the numbered parts of the product specification:

| Part | Scope | Status |
| --- | --- | --- |
| 00–03 | Foundation, brand tokens, extension shell, capability rail | ✅ |
| 04 | Chat workspace | ✅ |
| 05 | Session history (archive + restore) | ✅ |
| 06 | Write | ✅ |
| 07 | Read | ✅ |
| 08 | Translate | ✅ |
| 09 | Image & Video Studio, Compare arena | ✅ |
| 10 | MCP toolbox | ✅ |
| 11 | Settings + persistence | ✅ |

The product requirements document (PRD) and a running status ledger live in `documents_chrome_extension/` at the workspace root (outside this Git repository — back it up separately).

## Repository Layout

- The **Git repository root is this directory** (`EchoGPT-Chrome-Extension/`); the workspace root above it holds `documents_chrome_extension/`, which is tracked separately and outside version control.
- Branch `main` is the stable line; feature work is integrated through the `development` branch.

## License

Not specified — this is an internal design prototype and all rights belong to the EchoGPT project.