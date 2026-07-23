// Sample view plugin, TypeScript variant — a collapsible tree view for JSON/JSON-LD content. No
// third-party dependency needed here, so unlike csv-table-plugin.js there's nothing to
// lazy-import; it exists to show the TS side of the same interface (see ../view-plugin.d.ts), not to
// add a second technique. Pick whichever of the two samples matches how you'd rather write your
// own plugin — the build output and the interface contract are identical either way.

import type { ViewPluginCandidate, ViewPluginClass, ViewPluginContext } from '../view-plugin';

export default class JsonTreePlugin {
  static supportedTypes = ['application/json', 'application/ld+json'];
  static viewName = 'Tree';
  static icon = 'mdi-file-tree';

  private readonly candidate: ViewPluginCandidate | null;
  private parsed: unknown = null;
  private el: HTMLElement | null = null;

  constructor(candidates: ViewPluginCandidate[], _context: ViewPluginContext = { bblock: null, viewerConfig: null }) {
    this.candidate =
      candidates.find(
        (c) => c.type != null && JsonTreePlugin.supportedTypes.includes(c.type) && c.content,
      ) ?? null;
  }

  matches(): boolean {
    if (!this.candidate?.content) return false;
    try {
      this.parsed = JSON.parse(this.candidate.content);
      return true;
    } catch {
      // Not actually valid JSON despite the declared type — withdraw the match rather than
      // render broken output. This is exactly the kind of check `matches()` exists for.
      return false;
    }
  }

  render(el: HTMLElement): void {
    this.el = el;
    el.appendChild(buildNode(this.parsed, null));
  }

  destroy(el: HTMLElement): void {
    (el ?? this.el)?.replaceChildren();
  }
}

function buildNode(value: unknown, key: string | null): HTMLElement {
  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [String(i), v] as const)
      : (Object.entries(value as Record<string, unknown>));

    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    const label = Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`;
    summary.textContent = key !== null ? `${key}: ${label}` : label;
    details.appendChild(summary);

    for (const [childKey, childValue] of entries) {
      details.appendChild(buildNode(childValue, childKey));
    }
    return details;
  }

  const leaf = document.createElement('div');
  leaf.className = 'bblocks-json-tree-plugin-leaf';
  const valueText = typeof value === 'string' ? JSON.stringify(value) : String(value);
  leaf.textContent = key !== null ? `${key}: ${valueText}` : valueText;
  return leaf;
}

// Compile-time check only — asserts the class above actually satisfies the host's contract. Not
// required for a plugin to work; a nice guardrail to keep if you're already using TS.
void (JsonTreePlugin satisfies ViewPluginClass);
