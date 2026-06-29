# Repository Guidelines

## Project Structure & Module Organization

This repository is a static front-end teaching tool: no backend, package manager, or build step is required for normal development. Main pages live at the repository root:

- `index.html` is the Chat / Playground entry page.
- `Lab.dc.html`, `Code.dc.html`, `Jargon.dc.html`, and `Job.dc.html` are feature pages.
- `Nav.dc.html` is the shared left navigation and settings panel.
- `Job.data.js` stores the interview-question data.
- `styles.css` contains global resets, shared form styles, scrollbars, and keyframes.
- `support.js` is generated DC runtime code; do not edit it manually.

## Build, Test, and Development Commands

Run locally with a static file server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/index.html`. There is no `npm install`, `npm test`, or production build command in this repo. Deploy by serving all root files from the same directory on any static host.

For a quick JavaScript syntax check of DC scripts:

```sh
node -e "for (const f of ['index.html','Nav.dc.html','Lab.dc.html','Code.dc.html','Jargon.dc.html','Job.dc.html']) { const s=require('fs').readFileSync(f,'utf8'); for (const m of s.matchAll(/<script[^>]*data-dc-script[^>]*>([\\s\\S]*?)<\\/script>/g)) new Function(m[1]); console.log(f,'OK') }"
```

## Coding Style & Naming Conventions

Follow the existing `.dc.html` pattern: an `<x-dc>` template plus one `<script type="text/x-dc" data-dc-script>` class. Keep page-level UI styles close to the template unless the style is truly shared. Put shared animations or global element rules in `styles.css`. Use descriptive state and handler names such as `toggleSettings`, `setModel`, or `updateApiKey`.

## Testing Guidelines

There is no automated test suite. Before opening a PR, run the local server, visit each page, and check the browser console. For API work, verify missing-key behavior without committing secrets. API keys must stay in browser `localStorage`, never in source files.

## Commit & Pull Request Guidelines

History uses short descriptive commits, mostly Chinese, with occasional Conventional Commit prefixes such as `feat:`. Prefer concise messages that name the visible change, for example `feat: add multi-provider API settings` or `更新导航栏文案`.

PRs should include a short summary, affected pages, manual test notes, and screenshots or screen recordings for UI changes. Link related issues when available.

## Security & Configuration Tips

Do not commit API keys, local credentials, or captured request logs. Provider settings are stored under `localStorage['llm_viz_settings']`; keep documentation examples as placeholders only.
