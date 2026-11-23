import index from '../index.html'
import { PYODIDE_DIR, PYODIDE_FILES } from './pyodide'

/** Dev server: the app with hot reload, plus the Python runtime files under /pyodide/. */
const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  routes: {
    '/': index,
    '/pyodide/:file': (req) =>
      PYODIDE_FILES.includes(req.params.file) ? new Response(Bun.file(`${PYODIDE_DIR}/${req.params.file}`)) : new Response('Not found', { status: 404 }),
  },
  development: { hmr: true, console: true },
})

console.log(`Dev server: ${server.url}`)
