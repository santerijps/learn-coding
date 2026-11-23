import { rm, mkdir, copyFile } from 'node:fs/promises'
import { PYODIDE_DIR, PYODIDE_FILES } from './pyodide'

/** Production build: bundle the app into dist/ and copy the Python runtime next to it. */
await rm('dist', { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: ['./index.html'],
  outdir: 'dist',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
})
if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}
for (const output of result.outputs) console.log(`  ${output.path.replace(process.cwd() + '/', '')}  ${(output.size / 1024).toFixed(1)} KB`)

await mkdir('dist/pyodide', { recursive: true })
for (const file of PYODIDE_FILES) await copyFile(`${PYODIDE_DIR}/${file}`, `dist/pyodide/${file}`)
console.log(`  dist/pyodide/  (${PYODIDE_FILES.length} files)`)
