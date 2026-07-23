// Ships whatever this file exports as dist/index.js — see README.md "Quick start" and "Build &
// bundling". This is the one file the build actually starts from: src/examples/ is never reached
// from here, so it's automatically excluded from the built output without any extra config.
//
// Points at the TS skeleton by default (explicit '.ts' extension so it resolves unambiguously
// even with plugin.js sitting right next to it — see README.md "TypeScript vs. JavaScript"). If
// you're writing your plugin in JS instead, change this to `export { default as MyPlugin } from
// './plugin.js';`.
export { default as MyPlugin } from './plugin.ts';
