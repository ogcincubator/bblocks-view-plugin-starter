// Type-only reference for the bblocks-viewer view-plugin contract. Not imported by any runtime
// code in this package — plain JS files can still get editor autocomplete/checking against it via
// a JSDoc `@implements {ViewPluginClass}` / `@type {ViewPluginCandidate[]}` comment, or a
// TypeScript plugin can `import type` it directly. See README.md "Plugin interface" for the
// prose version of the same contract, with the reasoning behind each field.

/** One representation of the content a plugin may render — a single example snippet, or the
 * single executed output of a transform. A plugin's `candidates` array holds one of these per
 * available representation (e.g. one per example snippet language); a plugin picks whichever one
 * it actually wants. */
export interface ViewPluginCandidate {
  /** MIME type, e.g. 'application/geo+json'. Never a bare language slug — the host always
   * resolves it to a real MIME type where one is known, and passes the raw declared value through
   * verbatim otherwise. May be null if the host has no type information at all. */
  type: string | null;
  /** Resolved text content, if the host already fetched/inlined it. Null if not yet resolved —
   * a plugin should treat a null-content candidate as unusable, not attempt its own fetch. */
  content: string | null;
  /** Absolute URL the content was (or would be) fetched from, if any. */
  url: string | null;
  /** Human-readable label for this candidate (e.g. the snippet's language label, or the
   * transform's id) — not meant for matching logic, only for a plugin's own UI if it needs one. */
  label: string;
}

/** Host information beyond the candidates themselves, passed as the constructor's second
 * argument. Always supplied by bblocks-viewer, whether a plugin is statically bundled in or
 * loaded from a register-declared url — a plugin that doesn't need it simply doesn't declare the
 * parameter. */
export interface ViewPluginContext {
  /** The full bblock (json-full shape) this candidate set belongs to. Null if unavailable. */
  bblock: Record<string, unknown> | null;
  /** The viewer's resolved runtime config (fallback Rainbow/SPARQL endpoints, etc). Null if
   * unavailable. */
  viewerConfig: Record<string, unknown> | null;
}

/** An instantiated plugin — one instance per example/transform-output it was matched against, not
 * a global singleton. Instantiation itself may do content inspection (see `matches`); reuse
 * whatever state that computed in `render` rather than reparsing. */
export interface ViewPluginInstance {
  /** Content-based filter, for when the static `supportedTypes` soft filter isn't enough (e.g.
   * "is this actually valid GeoJSON with geometry"). Only called for candidates whose `content`
   * resolved. Return false to withdraw the match entirely — the host won't add a tab. Omit this
   * method (or always return true) to accept on type alone. */
  matches?(): boolean;
  /** Mount into `el`, an empty <div> the plugin owns. May be async — the host awaits it before
   * treating the tab as ready. */
  render(el: HTMLElement): void | Promise<void>;
  /** Optional teardown when the tab/component unmounts. Not called automatically on re-render;
   * only on actual unmount. */
  destroy?(el: HTMLElement): void;
}

/** The class a plugin module exports (default or named) — constructed fresh per matching
 * candidate set, never reused across examples/transform-outputs. */
export interface ViewPluginClass {
  new(candidates: ViewPluginCandidate[], context?: ViewPluginContext): ViewPluginInstance;
  /** Soft filter: MIME types this plugin might handle, checked against each candidate's `type`
   * before instantiation. Supports wildcards ('text/*', '*\/*'). Required — a plugin with no
   * overlapping type is never instantiated. */
  supportedTypes: string[];
  /** Tab label. Falls back to the class name if omitted. */
  viewName?: string;
  /** MDI icon name (e.g. 'mdi-map') for the tab. Falls back to 'mdi-puzzle-outline' if omitted. */
  icon?: string;
}
