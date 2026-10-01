# NV Homes / NEXTRACK frontend

Two front ends live here:

| URL | What | Source |
|---|---|---|
| `/` | Static NEXTRACK pages (home, calculator, budget tracking, checklists, timeline) | `*.html` in the repo root |
| `/portal/` | React app wired to the API | `portal/index.html` -> `src/` |

Portal routes: `/portal/dashboard`, `/portal/budget` (activity budgets and expenses),
`/portal/checklists` and `/portal/checklists/:no` (quality checklists, autosave),
`/portal/timeline` (CPM Gantt with baseline), `/portal/budget-calculator`.

The static budget, checklist and timeline pages saved data only in the browser. The
portal shows a one-time **Import** banner when it finds that data and copies it to the
server (`POST /api/projects/{id}/import/browser-data`); re-running it never duplicates
expenses. `app.html` now links to the portal versions of these three tools.

## Run locally

1. Start the API (FastAPI, in the `NVHomes_RAG_Prototype` repo):

   ```bash
   cd ../NVHomes_RAG_Prototype/backend
   uvicorn app.main:app --reload --port 8000
   ```

2. Start the frontend:

   ```bash
   cp .env.example .env      # defaults are fine for local dev
   npm install
   npm run dev               # http://localhost:5173/portal/
   ```

   Vite proxies `/api` to `http://localhost:8000`, so there is no CORS setup in dev.

## Talking to the API

- `src/api/client.js` - fetch wrapper (base URL, Bearer token, timeout, `ApiError` with `status`, `code`, `field`).
- `src/api/endpoints.js` - one function per endpoint; pages import from here, never call `fetch` directly.
- `src/hooks/useApi.js` - `{data, error, loading, reload}` with cancellation.
- API docs: http://localhost:8000/docs

## Build

`npm run build` outputs every static page plus `dist/portal/`. Set `VITE_API_BASE_URL`
to the API origin for production builds and add that frontend origin to the API's
`NVHOMES_CORS_ORIGINS`.
