# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **monorepo web application** (Next.js + FastAPI) — an interactive teaching tool for visualizing how LLMs work (Chinese-language UI). See `README.md` for the full feature/design spec and `AGENTS.md` for contributor conventions.

**Current Spec**: 004-provider-settings → see `specs/003-session-conversation/plan.md` for architectural context.

## Commands

Run locally with any static file server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# then open http://127.0.0.1:8000/index.html
```

There is no `npm install`, test runner, lint, or production build. "Building" = serving the root files from one directory.

JavaScript syntax check for the embedded DC scripts (the closest thing to a test):

```sh
node -e "for (const f of ['index.html','Nav.dc.html','Lab.dc.html','Code.dc.html','Jargon.dc.html','Job.dc.html']) { const s=require('fs').readFileSync(f,'utf8'); for (const m of s.matchAll(/<script[^>]*data-dc-script[^>]*>([\\s\\S]*?)<\\/script>/g)) new Function(m[1]); console.log(f,'OK') }"
```

Manual testing is the only QA: run the server, visit each page, watch the browser console.

## Architecture — the "DC" framework

This is the one thing that requires reading multiple files to understand. The project uses a custom client-side framework whose runtime is `support.js`.

- **`support.js` is generated** (built from a separate `dc-runtime/src/*.ts` repo via `bun run build`). **Never hand-edit it** — changes get overwritten on rebuild.
- Each feature page is a `.dc.html` file with two parts:
  - an `<x-dc>` template (supports `{{ }}` interpolation, `sc-if`, `sc-for`, `dc-import`, `<helmet>`)
  - a `<script type="text/x-dc" data-dc-script>` containing one `class Component extends DCLogic`
- On load, `support.js` loads React 18.3.1 from CDN, scans for `<x-dc>`/`data-dc-script`, compiles the template to a React render function, `eval`s the logic class via `new Function()`, and mounts it. `dc-import` auto-fetches sibling `.dc.html` files.
- **`index.html` is the exception**: it is standard HTML (not `.dc.html`) but embeds the same `<script type="text/x-dc">` DC logic. It is the Chat/Playground entry page and the only page that calls a real LLM API.

### DCLogic essentials
- Implement `renderVals()` — returns every value the template needs (merged with `props`, props win).
- Lifecycle: `componentDidMount()` (read localStorage / fetch here), `componentDidUpdate(prevProps)`, `componentWillUnmount()` (**clean up all timers here**).
- Template `{{ }}` accepts variables only (no expressions like `{{ a + b }}`); `{{ }}` values may be `React.createElement(...)` elements for dynamic UI (e.g. JSON syntax highlighting).
- Template directives require hint attributes: `sc-if` needs `hint-placeholder-val`, `sc-for` needs `hint-placeholder-count`, `dc-import` needs `hint-size` (these drive the streaming-render placeholders).
- External data files (e.g. `Job.data.js` → `window.JOB_DATA`) are loaded with a plain `<head>` `<script>` tag **outside** `<helmet>`, before the runtime, and read via `window.xxx`.

### Pages and navigation
- Pages: `index.html` (Chat), `Lab.dc.html`, `Code.dc.html`, `Jargon.dc.html`, `Job.dc.html`. `Nav.dc.html` is the shared left nav, imported via `dc-import` with an `active` prop (`chat`/`lab`/`code`/`jargon`/`job`).
- Navigation is plain `<a href>` full-page loads — no SPA router.
- The only cross-page state is user API settings in `localStorage['llm_viz_settings']` (provider + per-provider `{apiKey, baseUrl, model}`). Nav's settings modal writes it via `saveSettings()`; Chat reads it live in `componentDidMount` and again inside `handleRun`/`_streamReal` so a save takes effect without a refresh. Legacy `{apiKey}` configs are auto-migrated to OpenRouter.

### API integration (Chat page only)
- `POST {baseUrl}/chat/completions`, `stream: true`, parsed as SSE. Supports OpenRouter / AI HubMix / Packy / any OpenAI-compatible custom endpoint.
- API keys live **only** in browser localStorage — never commit keys, base URLs with creds, or request logs. Use placeholders in docs.
- Missing key/baseUrl/model produces a frontend `❌` error bubble; no request is sent.
- Model pricing is hardcoded in the Chat logic ($/1M tokens) for the cost display.

## Conventions

- **Design system is fixed** (dark terminal aesthetic). Do not introduce new colors or fonts. Palette and type scale are enumerated in `README.md` §3. Only main accent is brand green `#00ffa0`; per-feature secondary accents pick from existing blue/purple/orange. Fonts: JetBrains Mono (code/data/labels) and Inter (prose) only.
- Page-level styles stay in the page template; only truly shared rules (resets, scrollbars, form/slider styles, keyframes) go in `styles.css`.
- Handler/state names are descriptive verbs: `toggleSettings`, `setModel`, `updateApiKey`.
- Commit messages are short and mostly Chinese, occasionally with Conventional Commit prefixes (`feat:`). PRs note affected pages + manual test results + screenshots for UI changes.

## Adding a page
Create `Name.dc.html` (English PascalCase) with `<script src="./support.js">` in `<head>`, an `<x-dc>` template (`<helmet>` pulls in `styles.css` + Google Fonts), and a `DCLogic` class. Then register it in `Nav.dc.html` (add the `<a href>`, add the nav style entry, extend the `active` prop options). No build needed — open the file in a browser.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
specs/001-project-scaffold/plan.md
<!-- SPECKIT END -->
