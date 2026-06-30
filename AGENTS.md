# User Preferences

- When using PostPlus skills or generating social marketing content for the user, write user-facing deliverables in Simplified Chinese by default unless the user asks for another language. Preserve platform names, source quotes, commands, file paths, and product names in their original language when that is clearer.
- For normal repo work, answer the user in Chinese unless they explicitly ask for another language.

# Repository Guidelines

## Project Structure & Module Organization

This repository is now a monorepo web application for an LLM teaching tool, with the older static DC prototype still present at the root.

- `apps/web/` is the primary frontend: Next.js 15, React 19, TypeScript, App Router.
  - `apps/web/src/app/` contains routes such as Chat, Lab, Code, Jargon, and Job.
  - `apps/web/src/components/` contains shared UI components.
  - `apps/web/src/lib/` contains API and streaming helpers.
- `apps/api/` is the FastAPI backend.
  - `app/routers/` owns HTTP routes such as health, chat streaming, and conversations.
  - `app/services/` owns orchestration, rate limiting, and conversation behavior.
  - `app/adapters/` isolates provider-specific OpenAI-compatible API behavior.
  - `app/db/` owns SQLite connection/schema code and the PostgreSQL migration SQL.
- `packages/shared/` stores frontend TypeScript contract types for chat, provider settings, pipeline events, and stream events.
- `packages/content/` is reserved for teaching-content modules.
- `specs/` contains feature specs, plans, tasks, contracts, and acceptance notes. Check the relevant spec before broad product changes.
- Root files such as `index.html`, `Lab.dc.html`, `Code.dc.html`, `Jargon.dc.html`, `Job.dc.html`, `Nav.dc.html`, `Job.data.js`, `styles.css`, and `support.js` are the legacy static/DC prototype. Keep them only when the task explicitly touches the prototype.
- `support.js` is generated DC runtime code; do not edit it manually.
- `apps/api/data/teaching_tool.db` is runtime SQLite data. Do not change or commit it unless the user explicitly asks to update stored local data.

## Build, Test, and Development Commands

Install Node dependencies from the repository root:

```sh
npm install
```

Run the full Docker development stack:

```sh
docker compose up -d
```

Then open:

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`

Run the backend manually:

```sh
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Run the frontend manually from the repository root:

```sh
npm run dev --workspace @teaching-tool/web
```

Useful verification commands:

```sh
npm run typecheck --workspace @teaching-tool/web
cd apps/api && python -m compileall app
docker compose config
```

For legacy DC prototype validation only, serve the repository root on a port that does not conflict with the API:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8080/index.html`.

Quick JavaScript syntax check for embedded DC scripts:

```sh
node -e "for (const f of ['index.html','Nav.dc.html','Lab.dc.html','Code.dc.html','Jargon.dc.html','Job.dc.html']) { const s=require('fs').readFileSync(f,'utf8'); for (const m of s.matchAll(/<script[^>]*data-dc-script[^>]*>([\\s\\S]*?)<\\/script>/g)) new Function(m[1]); console.log(f,'OK') }"
```

## Coding Style & Naming Conventions

- Prefer the current monorepo implementation over the legacy DC prototype unless the task explicitly targets the prototype.
- Frontend code should follow the existing App Router and component patterns. Use TypeScript types from `@teaching-tool/shared` when they describe API or stream contracts.
- Keep student-facing UI copy in Simplified Chinese. Preserve provider names such as OpenRouter, AI HubMix, Packy API, and Custom in their product form.
- Keep the existing dark teaching-tool visual language unless the user asks for a redesign.
- Backend routers should stay thin. Put provider orchestration in services and provider-specific behavior in adapters.
- Keep API errors normalized and user-friendly in Chinese. Do not leak provider raw errors when they may contain credentials or sensitive request details.
- If updating shared request/event shapes, update `packages/shared/`, frontend usage, backend models, and the relevant spec/contract together.
- For legacy `.dc.html` work, keep the existing `<x-dc>` plus `<script type="text/x-dc" data-dc-script>` pattern. Put shared animations or global element rules in `styles.css`.

## Testing Guidelines

There is no single root test suite. Match validation to the changed surface:

- Frontend TypeScript or UI changes: run `npm run typecheck --workspace @teaching-tool/web`; run `npm run build --workspace @teaching-tool/web` when route, rendering, or deployment behavior changes.
- Backend Python changes: run `cd apps/api && python -m compileall app`; start Uvicorn and check `/health` for route or startup changes.
- Docker/deployment changes: run `docker compose config`; when practical, run `docker compose up -d` and confirm the web/API health paths.
- Chat/provider changes: manually test missing-key behavior and at least one configured provider path. Never use real API keys in committed files, logs, screenshots, or docs.
- Legacy DC changes: run the embedded-script syntax check and manually open the affected `.dc.html` page in a browser.

## Commit & Pull Request Guidelines

History uses short descriptive commits, mostly Chinese, with occasional Conventional Commit prefixes such as `feat:`. Prefer concise messages that name the visible change, for example `feat: add multi-provider API settings` or `更新导航栏文案`.

PRs should include a short summary, affected apps/pages, manual test notes, and screenshots or screen recordings for UI changes. Link related issues or specs when available.

## Security & Configuration Tips

- Do not commit API keys, local credentials, `.env*` files, captured request logs, or provider responses containing secrets.
- Provider settings are stored in browser `localStorage['llm_viz_settings']`; the anonymous session id is stored in `localStorage['teaching_tool_session_id']`.
- API keys are sent to the backend only for the current request and must not be persisted, logged, returned in errors, or written to the database.
- The backend defaults to SQLite via `DATABASE_URL` or `apps/api/data/teaching_tool.db`. Treat the local database as runtime state, not source configuration.
- Keep generated/cache artifacts out of commits, including `node_modules/`, `.next/`, `.venv/`, `__pycache__/`, `*.pyc`, and TypeScript build info.
