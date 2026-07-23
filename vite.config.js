import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Library build producing dist/index.js plus on-demand chunk files for each plugin's own heavy
// dependencies (here, papaparse). Deliberately leaves Rollup's default code-splitting in place —
// CsvTablePlugin only reaches for papaparse inside its own lazy `import()` call at render() time
// (see csv-table-plugin.js), so declaring a plugin doesn't pull its dependency weight onto the
// page until that plugin actually renders. The host only ever needs one entry url (dist/index.js);
// the browser resolves chunk `import()`s relative to it, so the whole dist/ directory needs to be
// deployed together — see the README's "Build & bundling" section.
export default defineConfig({
  build: {
    minify: 'esbuild',
    assetsInlineLimit: Infinity,
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
});
