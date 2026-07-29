// Starting point for a new plugin. Implement the methods below, then update src/index.ts's
// export to point at this file (it already does, by default) — or rename this file and update
// the export accordingly.
//
// See README.md "Plugin interface" for the full contract, src/examples/ for two complete worked
// examples (delete that directory once you no longer need it — see README.md "Adding your own
// plugin"), and the @ogc/bblocks-viewer-plugin-types import below for the types referenced.

import type { ViewPluginCandidate, ViewPluginClass, ViewPluginContext } from '@ogc/bblocks-viewer-plugin-types';

export default class MyPlugin {
  // MIME types this plugin might handle — required. Supports wildcards ('text/*', '*/*').
  static supportedTypes: string[] = [];

  // Tab label and icon shown to the user — optional, both have host-side fallbacks.
  static viewName = 'My view';
  static icon = 'mdi-puzzle-outline';

  private readonly candidates: ViewPluginCandidate[];

  constructor(
    candidates: ViewPluginCandidate[],
    _context: ViewPluginContext = { bblock: null, viewerConfig: null },
  ) {
    this.candidates = candidates;
  }

  // Optional: return false to withdraw the match after inspecting candidate content (only called
  // for candidates whose `content` resolved). Omit this method entirely to always match once the
  // type filter above passes.
  // matches(): boolean {
  //   return true;
  // }

  render(el: HTMLElement): void {
    // Mount your view into `el` here.
  }

  // Optional teardown, called when the tab/component unmounts.
  // destroy(el: HTMLElement): void {}
}

// Compile-time check that the class above actually satisfies the host's contract.
void (MyPlugin satisfies ViewPluginClass);
