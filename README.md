# bblocks-view-plugin-starter

A starter template for building [bblocks-viewer](https://github.com/opengeospatial/bblocks-viewer)
**view plugins** — small client-side modules that add a custom visualization tab for an example
snippet or a transform output (e.g. rendering GeoJSON on a map, or CSV as a table), without that
code living inside bblocks-viewer's own source tree.

This repo is meant to be **cloned and its contents replaced with your own** — click
["Use this template"](https://github.com/ogcincubator/bblocks-view-plugin-starter) on GitHub, or
`git clone` it, then work through "Adding your own plugin" below.

It contains:

- `src/plugin.ts` / `src/plugin.js` — minimal skeleton plugins, one per language. `src/index.ts`
  exports `plugin.ts` by default; delete whichever language you're not using.
- A `@ogc/bblocks-viewer-plugin-types` devDependency, pulling in the plugin interface as types
  from [`bblocks-viewer-plugin-types`](https://github.com/ogcincubator/bblocks-viewer-plugin-types)
  (the canonical, dependency-free source) — referenced by both skeletons, and by your own plugin,
  for editor autocomplete and type checking. See "Plugin interface" below.
- `src/examples/` — two complete, working reference plugins (a JSON tree view and a CSV table
  view) — **not** wired into the build by default, and meant to be deleted once you've read them.
  See "Adding your own plugin" below.
- A build setup (`vite.config.js`) producing a single deployable `dist/index.js`, mirroring what
  [`bblocks-viewer-base-plugins`](https://github.com/ogcincubator/bblocks-viewer-base-plugins)
  (the viewer's own first-party plugins) uses.

See `bblocks-viewer-base-plugins` for real, production plugins (map/3D/web view) built against
this same interface, if you want a larger reference beyond the two examples here.

<!-- TODO: link to the official bblocks-viewer / register-authoring docs page for view plugins,
     once published. -->

## Quick start

```bash
git clone git@github.com:ogcincubator/bblocks-view-plugin-starter.git my-plugin
cd my-plugin
npm install
npm run typecheck   # type-checks src/**/*.ts (see "TypeScript vs. JavaScript")
npm run build        # -> dist/index.js
```

The skeleton builds and typechecks as-is (it has `supportedTypes: []`, so it simply never
matches anything until you fill it in). Then serve `dist/` (any static host with permissive
CORS — GitHub Pages works out of the box) and declare it in a register's `bblocks-config.yaml`:

```yaml
viewer:
  view-plugins:
    - url: https://your-host/dist/index.js
      export: MyPlugin      # or an array of names, or omit for the default export
      weight: 100            # optional; higher sorts earlier among plugin tabs
```

bblocks-viewer picks this up as `register.viewer.viewPlugins` and loads it via a native, runtime
`import()` — no build step or config on the viewer's side. See "Declaring plugins" below for the
full shape.

## Plugin interface

A plugin module exports one or more classes (default export, or named exports — see "Declaring
plugins" below). Each class:

```ts
class MyPlugin {
  // Soft filter: MIME types this plugin might handle, checked against each candidate's
  // *resolved* MIME type before the class is even instantiated. Supports wildcards ('text/*',
  // '*/*'). Required.
  static supportedTypes = ['application/geo+json'];

  // Tab label. Optional — falls back to the class name.
  static viewName = 'Map';

  // MDI icon name for the tab (e.g. 'mdi-map'). Optional — falls back to 'mdi-puzzle-outline'.
  static icon = 'mdi-map';

  // candidates: always an array, one entry per available representation of the same underlying
  // content — one per example snippet language, or a single-element array for a transform output.
  // Each candidate is { type, content, url, label } — see "Candidate shape" below. A plugin picks
  // whichever candidate(s) it actually wants; nothing is pre-filtered to "the best one" for you.
  //
  // context: host information beyond the candidates — { bblock, viewerConfig, depResolver }.
  // Always supplied; using it is what's optional. See "Context object" below.
  constructor(candidates, context = {}) {
    this.candidates = candidates;
  }

  // Content-based filter, for when the static type filter isn't precise enough (e.g. "the type
  // said application/json, but does this actually parse, and does it have the shape I need?").
  // Only called for candidates whose `content` resolved. Return false to withdraw the match — no
  // tab gets added. Optional — a plugin without this method is assumed to always match.
  matches() { return true; }

  // el: an empty <div> the plugin owns, sized to the viewer's existing plugin-tab chrome
  // (small box by default, with a fullscreen toggle the host provides around it). May be async.
  render(el) { /* mount your view here */ }

  // Optional teardown when the tab/component unmounts.
  destroy(el) {}
}
```

The full typed version of this contract lives in the dependency-free
[`bblocks-viewer-plugin-types`](https://github.com/ogcincubator/bblocks-viewer-plugin-types) repo,
pulled in here as a `github:ogcincubator/bblocks-viewer-plugin-types` devDependency (types only —
this package has no runtime dependency on bblocks-viewer or on this types package, same as any
other view plugin). The skeletons and examples all reference it — TypeScript via
`import type { ... } from '@ogc/bblocks-viewer-plugin-types'`, JavaScript via a JSDoc
`@implements {import('@ogc/bblocks-viewer-plugin-types').ViewPluginClass}` comment — so start there if
your editor supports either.

### Candidate shape

```ts
interface ViewPluginCandidate {
  type: string | null;     // resolved MIME type, e.g. 'application/geo+json'
  content: string | null;  // resolved text, or null if not (yet) available
  url: string | null;      // the URL this content came from, if any
  label: string;           // human-readable label (snippet language, or transform id)
}
```

`content` can be `null` even for a matching `type` — the host resolves content on a best-effort
basis before matching runs, but doesn't guarantee every candidate got fetched. A plugin should
treat a null-content candidate as unusable, not attempt its own fetch of `url`.

### Context object

```ts
interface ViewPluginContext {
  bblock: object | null;         // the full bblock (json-full shape) this content belongs to
  viewerConfig: object | null;   // the viewer's resolved runtime config
  depResolver?: DependencyResolver;  // optional shared-dependency cache — see below
}
```

Always passed by the host, whether your plugin is loaded from a register-declared URL or bundled
directly into a viewer fork — declaring the second constructor parameter is what's optional on the
plugin's side. `bblocks-viewer-base-plugins`'s `GeoJsonMapPlugin` is a real example of using this:
it reads `context.bblock.ldContext` to resolve JSON-LD terms in map popups, falling back to
whatever `@context` the content carries inline if no bblock was supplied.

## Adding your own plugin

1. Read `src/examples/json-tree-plugin.ts` and/or `src/examples/csv-table-plugin.js` for two
   complete, working references — including the CSS-injection and lazy-dependency patterns
   covered below.
2. Pick `src/plugin.ts` or `src/plugin.js` (delete the other) and implement it against the class
   shape above.
3. Update `src/index.ts`'s export to point at the file you kept (it already points at `plugin.ts`
   by default — see the comment there for the one-line change if you're using the JS skeleton
   instead).
4. Run `npm run typecheck` (if using TS) and `npm run build`.
5. If your plugin needs a third-party dependency, see "Third-party dependencies" below before
   adding it to `package.json`.
6. **Delete `src/examples/`.** It's reference material, not part of your plugin, and isn't wired
   into `src/index.ts` — the build already ignores it (Vite's library build only bundles what's
   reachable from `src/index.ts`'s own imports), but keeping it around after you're done reading
   it is just dead weight in the repo.

To try an example plugin itself in a real viewer before deleting it, temporarily add e.g.
`export { default as JsonTreePlugin } from './examples/json-tree-plugin.ts';` to `src/index.ts`,
build, and declare it in a register as usual — then remove that line again once you're done.

## Build & bundling

```bash
npm run build
```

Produces `dist/index.js` (one named export per plugin class) plus separate chunk files for any
dependency a plugin only reaches for lazily (see below) — e.g. building with the CSV example
wired in emits `dist/index.js` and `dist/papaparse.min-*.js` as two separate files. **Deploy the
whole `dist/` directory together** — chunk files are fetched by the browser relative to
`index.js`'s own URL, so moving `index.js` alone without its chunks will break at render time, not
at load time.

This is Vite's default library-mode code-splitting, left deliberately in place rather than forcing
everything into one file: it's what makes "lazy third-party dependencies" (next section) actually
pay off — a dependency only downloads once a plugin that needs it actually renders, not just
because the plugin's *class* got imported and type-checked for a match. It's also what keeps
`src/examples/` out of `dist/` automatically: nothing in `src/index.ts` imports it, so Vite never
walks into it in the first place — no `exclude` config needed.

## Third-party dependencies

Bundle your own dependencies into your plugin rather than assuming the host viewer has them
available — a plugin is a self-contained embeddable widget, not code sharing the host app's
runtime, similar to a Grafana panel or an Observable cell. This also means you're never coupled to
whatever version of a library bblocks-viewer happens to ship internally.

**Import heavy dependencies lazily, inside `render()`, not at the top of the module:**

```js
// Bad — pulls the full dependency weight onto the page for every plugin that gets *checked*,
// even ones that never end up matching or rendering:
import L from 'leaflet';

class MyPlugin {
  render(el) { /* use L */ }
}
```

```js
// Good — only downloaded once this specific plugin actually renders:
class MyPlugin {
  async render(el) {
    const { default: L } = await import('leaflet');
    /* use L */
  }
}
```

Every declared plugin module gets `import()`-ed unconditionally to read its `static
supportedTypes`, so a *lightweight* top-level import is fine — this only matters for genuinely
heavy dependencies (mapping/3D libraries, parsers). `src/examples/csv-table-plugin.js`
demonstrates the pattern, lazily importing `papaparse` inside `render()`;
`src/examples/json-tree-plugin.ts` needs no dependency at all, so it has nothing to lazy-load. The
skeletons don't include a dependency import at all — add one following the same pattern once you
need it.

### Sharing a dependency via `context.depResolver`

Bundling your own copy (above) is still the right default. Reach for `context.depResolver` only
when your plugin shares a genuinely heavy dependency with *another* plugin the same host might load
at the same time (e.g. two view plugins both built on `three`) — it lets both instances share one
runtime copy instead of each fetching (and paying the parse/execute cost for) their own:

```js
const THREE_VERSION = '0.184.0';
const loadThree = () => import(`https://esm.sh/three@${THREE_VERSION}`);

class MyPlugin {
  constructor(candidates, context = {}) {
    this.candidates = candidates;
    this._context = context;
  }

  async render(el) {
    const THREE = this._context.depResolver
      ? await this._context.depResolver.resolve({
          name: 'three', range: `^${THREE_VERSION}`, version: THREE_VERSION, load: loadThree,
        })
      : await loadThree();
    /* use THREE */
  }
}
```

A few things worth knowing before reaching for this:

- **It requires loading from a CDN, not a bundled copy.** `resolve()`'s `load` function has nothing
  to dedupe against if every plugin bundles its own build of the dependency — two separately
  bundled copies are two separate module instances no matter what `depResolver` does. This is a
  bigger commitment than it looks: it means your plugin now depends on a public CDN being reachable
  at runtime for every user, including any host deployment behind a restrictive network. Don't
  adopt it purely out of habit.
- **It dedupes only the exact `name`/`range` you register, nothing more.** It does not walk a
  package's own dependency tree, and it does not discover that two *different* top-level packages
  happen to share some common transitive dependency — if that transitive dependency isn't
  independently registered under the same `name` by both plugin authors, `depResolver` has no way
  to know it exists, let alone dedupe it. Treat it as "share this one specific named thing I
  already know is shared," not general dependency deduplication.
- **`range`/`version` are your responsibility to keep aligned.** `resolve()` doesn't check that
  `range` was actually derived from `version` — passing a `range` unrelated to what `load()` would
  actually fetch just means a future cache hit for your own plugin degrades silently back to "load
  your own copy," not a correctness bug for anyone else.
- Its absence (`context.depResolver` undefined — an older host, or a bare test harness) doesn't mean
  "fall back to a bundled copy": if you've adopted the CDN pattern, still load from the CDN, just
  without the sharing optimization, same as the ternary above.

See bblocks-viewer's `.claude/shared-dependency-resolver-design.md` and
`@ogc/bblocks-viewer-base-plugins`' `three-d-plugin.js` (`resolveThree()`) for the full design and a
real worked example.

## Injecting CSS

A plugin can't rely on the host page having a `<link>` tag or bundler step for its stylesheet — it
has to inject its own CSS at runtime. The pattern used in `src/examples/csv-table-plugin.js`:

```js
// Must be a *static*, top-level import — not a dynamic import() inside render() or any other
// function. A dynamic `import('./file.css?raw')` gets served by most static hosts with a
// Content-Type the browser refuses to treat as a JS module, and the import throws.
import css from './my-plugin.css?raw';

let injected = false;
function injectCss() {
  if (injected) return; // guard against re-injecting on every render() call
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  injected = true;
}
```

Call `injectCss()` from `render()`. See `src/examples/csv-table-plugin.js` /
`src/examples/csv-table-plugin.css` for the full working version, and
`src/examples/vite-env.d.ts` for the TS ambient type that makes `?raw` imports type-check — copy
that file back into `src/` if you keep using this pattern after deleting `src/examples/`.

## TypeScript vs. JavaScript

Both are fully supported and produce the same `dist/index.js` output — Vite/esbuild transpiles
`.ts` at build time with no separate compile step. TypeScript is the recommended default (hence
`src/index.ts` exporting `plugin.ts` out of the box): you get real autocomplete and compile-time
checking against `view-plugin.d.ts` via `npm run typecheck`, which catches an interface mismatch
(wrong method name, wrong candidate field) before you ever load the plugin in a browser.

`src/plugin.js` is there because plain JS is just as fully supported — nothing in the interface or
build requires TypeScript. A JS plugin can still opt into editor checking against the same types
via JSDoc, as `src/plugin.js` and `src/examples/csv-table-plugin.js` both already do:

```js
/** @implements {import('@ogc/bblocks-viewer-plugin-types').ViewPluginClass} */
export default class MyPlugin { /* ... */ }
```

`npm run typecheck` intentionally does **not** type-check `.js` files (`checkJs: false` in
`tsconfig.json`) — the JSDoc annotation is opt-in editor assistance, not an enforced gate, so
JS-only authors aren't forced into strict-mode TS errors.

`src/index.ts` imports `./plugin.ts` with an explicit extension (needs
`allowImportingTsExtensions` in `tsconfig.json`, already set) rather than the bare `./plugin` —
with both `plugin.ts` and `plugin.js` present, a bare specifier would resolve ambiguously (Vite's
default resolution tries `.js` before `.ts`), which would silently pick the wrong one once you'd
deleted `plugin.ts` in favor of the JS skeleton without also fixing the import.

## Declaring plugins in a register

```yaml
# bblocks-config.yaml
viewer:
  view-plugins:
    - url: https://your-host/dist/index.js
      export: MyPlugin
      weight: 100
```

- `export` may be a single name, an array of names (if your bundle ships more than one plugin
  class), or omitted/`null`/`""`/`[]` to take the module's default export.
- `weight` (optional, default `0`) controls tab ordering among plugin tabs — higher sorts earlier.
  bblocks-viewer's own built-in plugins (map/3D/web) always sort first regardless of weight.
- Multiple config entries can point at the same `url` with different `export` values; the
  browser's module cache dedupes the actual fetch by URL either way, so there's no cost to
  splitting one bundle across several entries if you'd rather declare weights per-plugin.

## FAQ

**Why do I need to bundle my own dependencies instead of the viewer providing common ones?**
Decouples plugin authors from whatever version the viewer ships internally, and keeps the trust/
loading model simple (one self-contained module per plugin bundle). See "Third-party dependencies"
above.

**Is there a way to test a plugin locally without deploying it anywhere?**
Serve `dist/` from any local static file server and point a local bblocks-viewer dev instance's
register config at `http://localhost:<port>/index.js`. A few hosting options **don't** work: a
GitHub Gist's raw URL fails (GitHub serves gist raw content as `text/plain` unconditionally,
regardless of extension, and browsers refuse that as a module script), and jsDelivr's `gh` CDN path
doesn't cover gists either (only real `user/repo` GitHub repositories). Regular GitHub Pages (a
real repo, not a gist) works. Simplest for local dev: same-origin — serve the plugin file from the
same static server as the register/build directory you're testing against.

**My plugin's host page must serve `dist/` with CORS enabled — why?** The viewer loads plugin
modules via a runtime, cross-origin `import()`. GitHub Pages sends permissive CORS headers by
default, which covers the common case of a register hosted there; a different static host may need
explicit configuration.

**What happens if my plugin throws, or fails to load?** The host logs a console warning and skips
the tab — no user-facing error, and no effect on any other plugin. Applies to import failures
(bad URL, CORS), and to exceptions thrown from your `matches()`/`render()`.

**Can one bundle ship more than one plugin?** Yes — export more than one class as named exports
from `src/index.ts` and list them all in `export:` (see "Declaring plugins" above).

**Does my plugin need to sandbox itself (iframe, etc.) for security?** No — a register author
declaring your plugin's URL is trusting it the same way they'd trust an inline `<script>` on a
page they control. Render directly into the `<div>` you're given.

**Do I need to handle a `matches()` call for every candidate, or just some?** `matches()` takes no
arguments — it's a yes/no on the whole instance (which already has `this.candidates` from the
constructor), not a per-candidate filter. Pick which candidate(s) you actually want in the
constructor; `matches()` just decides whether to show a tab at all.

## Related repos

- [bblocks-viewer](https://github.com/opengeospatial/bblocks-viewer) — the viewer this interface
  belongs to.
- [bblocks-viewer-base-plugins](https://github.com/ogcincubator/bblocks-viewer-base-plugins) —
  the viewer's own first-party map/3D/web-view plugins, built against this exact interface; a
  larger, real-world reference beyond this template's two examples.
