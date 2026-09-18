// Ambient type for Vite's `?raw` import suffix (returns the file's contents as a string), used by
// csv-table-plugin.js for CSS injection. Needed because plain TS/tsc has no built-in knowledge of
// Vite-specific import suffixes — see README "Injecting CSS".
declare module '*.css?raw' {
  const css: string;
  export default css;
}

// Ambient type for importing a .vue single-file component from a .ts file, used by
// register-info-tab-plugin.ts. Only needed because this template checks types with plain `tsc`,
// not `vue-tsc` — a real Vue-heavy plugin repo would likely add `vue-tsc` instead for full SFC
// prop/template checking.
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
