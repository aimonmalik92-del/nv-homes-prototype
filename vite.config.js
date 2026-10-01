import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Two front ends live in this repo:
//   /            static NEXTRACK pages (index.html, calculate-budget.html, ...)
//   /portal/     the React app (portal/index.html -> src/main.jsx, basename "/portal")
// The merge on 29 Sep replaced the React index.html with the static homepage,
// so the React routes were unreachable; they now have their own entry.

const root = dirname(fileURLToPath(import.meta.url))
const STATIC_PAGES = ['index', 'app', 'calculate-budget', 'budget-tracking-system', 'progress-timeline', 'quality-checklist']

// Dev only: deep links such as /portal/dashboard serve the React shell.
const portalFallback = () => ({
  name: 'portal-spa-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/portal(\/[^.]*)?(\?.*)?$/.test(req.url)) req.url = '/portal/index.html'
      next()
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), portalFallback()],
    server: {
      // Same-origin /api in dev: no CORS, no hard-coded host in the code.
      proxy: {
        '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000', changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        input: {
          portal: resolve(root, 'portal/index.html'),
          ...Object.fromEntries(STATIC_PAGES.map((p) => [p, resolve(root, `${p}.html`)])),
        },
      },
    },
  }
})
