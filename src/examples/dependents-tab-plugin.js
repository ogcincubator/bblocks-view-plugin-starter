// Sample tab plugin, plain JS variant — adds a whole-bblock "Used by" tab listing every other
// bblock in the register that depends on this one, rather than rendering into an existing
// example/transform-output slot the way a view plugin does. See README.md "Tab plugins" for the
// contract this implements, and register-info-tab-plugin.ts for the TS+Vue counterpart.
//
// Demonstrates:
//   - static tabId / tabLabel / icon / weight
//   - constructor(context) receiving the whole-bblock TabPluginContext (not per-candidate)
//   - matches() as a real, async, content-based check using context.getBBlocks — not just
//     accepting unconditionally once instantiated
//   - render(el)/destroy(el) owning the entire tab body, no fullscreen-toggle chrome

/** @implements {import('@ogc/bblocks-viewer-plugin-types').TabPluginClass} */
export default class DependentsTabPlugin {
  static tabId = 'used-by';
  static tabLabel = 'Used by';
  static icon = 'mdi-arrow-left-bold-box-outline';
  static weight = 10;

  /** @param {import('@ogc/bblocks-viewer-plugin-types').TabPluginContext} context */
  constructor(context) {
    this.context = context;
    this.dependents = [];
  }

  async matches() {
    const { bblock, getBBlocks } = this.context;
    const allBBlocks = await getBBlocks(true);
    this.dependents = Object.values(allBBlocks).filter((candidate) =>
      [candidate.dependsOn, candidate.isProfileOf, candidate.profileOf].some(
        (refs) => Array.isArray(refs) && refs.some((ref) => refToId(ref) === bblock.itemIdentifier),
      ),
    );
    // Only worth its own tab if something actually depends on this bblock — the same
    // "real content check, not just type/presence" spirit as csv-table-plugin.js's matches().
    return this.dependents.length > 0;
  }

  render(el) {
    const list = document.createElement('ul');
    list.className = 'bblocks-dependents-tab-plugin';
    for (const dependent of this.dependents) {
      const item = document.createElement('li');
      item.textContent = `${dependent.name} (${dependent.itemIdentifier})`;
      list.appendChild(item);
    }
    el.appendChild(list);
    this._el = el;
  }

  destroy(el) {
    (el ?? this._el)?.replaceChildren();
  }
}

// dependsOn/isProfileOf/profileOf entries may arrive as plain itemIdentifier strings or
// `bblocks://itemIdentifier` URIs — see bblocks-viewer's own normalization for the same ambiguity.
function refToId(ref) {
  return ref.startsWith('bblocks://') ? ref.slice('bblocks://'.length) : ref;
}
