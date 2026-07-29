/**
 * Starting point for a new plugin, JavaScript variant. Implement the methods below, then update
 * src/index.ts's export to point at this file (swap the plugin.ts import for this one) — or
 * rename this file and update the export accordingly.
 *
 * See README.md "Plugin interface" for the full contract, src/examples/ for two complete worked
 * examples (delete that directory once you no longer need it — see README.md "Adding your own
 * plugin"), and the @ogc/bblocks-viewer-plugin-types import below (a devDependency — see
 * README.md "Plugin interface") for the types referenced.
 *
 * @implements {import('@ogc/bblocks-viewer-plugin-types').ViewPluginClass}
 */
export default class MyPlugin {
  // MIME types this plugin might handle — required. Supports wildcards ('text/*', '*/*').
  static supportedTypes = [];

  // Tab label and icon shown to the user — optional, both have host-side fallbacks.
  static viewName = 'My view';
  static icon = 'mdi-puzzle-outline';

  /**
   * @param {import('@ogc/bblocks-viewer-plugin-types').ViewPluginCandidate[]} candidates
   * @param {import('@ogc/bblocks-viewer-plugin-types').ViewPluginContext} [context]
   */
  constructor(candidates, context = {}) {
    this.candidates = candidates;
  }

  // Optional: return false to withdraw the match after inspecting candidate content (only called
  // for candidates whose `content` resolved). Omit this method entirely to always match once the
  // type filter above passes.
  // matches() {
  //   return true;
  // }

  render(el) {
    // Mount your view into `el` here.
  }

  // Optional teardown, called when the tab/component unmounts.
  // destroy(el) {}
}
