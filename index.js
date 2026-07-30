var a = Object.defineProperty;
var o = (t, e, c) => e in t ? a(t, e, { enumerable: !0, configurable: !0, writable: !0, value: c }) : t[e] = c;
var i = (t, e, c) => o(t, typeof e != "symbol" ? e + "" : e, c);
class s {
  constructor(e, c = { bblock: null, viewerConfig: null }) {
    i(this, "candidates");
    this.candidates = e;
  }
  // Optional: return false to withdraw the match after inspecting candidate content (only called
  // for candidates whose `content` resolved). Omit this method entirely to always match once the
  // type filter above passes.
  // matches(): boolean {
  //   return true;
  // }
  render(e) {
  }
  // Optional teardown, called when the tab/component unmounts.
  // destroy(el: HTMLElement): void {}
}
// MIME types this plugin might handle — required. Supports wildcards ('text/*', '*/*').
i(s, "supportedTypes", []), // Tab label — required, also used to generate the tab's shareable link.
i(s, "viewName", "My view"), // Tab icon — optional, has a host-side fallback.
i(s, "icon", "mdi-puzzle-outline");
export {
  s as MyPlugin
};
