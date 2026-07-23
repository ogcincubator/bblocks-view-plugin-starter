// Ambient type for Vite's `?raw` import suffix (returns the file's contents as a string), used by
// csv-table-plugin.js for CSS injection. Needed because plain TS/tsc has no built-in knowledge of
// Vite-specific import suffixes — see README "Injecting CSS".
declare module '*.css?raw' {
  const css: string;
  export default css;
}
