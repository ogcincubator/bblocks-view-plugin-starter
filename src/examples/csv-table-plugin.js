// Sample view plugin: renders a `text/csv` candidate as an HTML table. Deliberately simple —
// no framework, no build-time-only tricks beyond the one documented in the README ("Injecting
// CSS") — while still demonstrating every part of the interface a real plugin uses:
//   - static supportedTypes / viewName / icon
//   - constructor(candidates, context) picking the one candidate it wants
//   - matches() as a real content-based check, not just accepting on type alone
//   - render(el) lazily importing its only real dependency (papaparse) rather than at module
//     load time — see README "Third-party dependencies" for why this matters
//   - destroy(el) cleanup
//   - CSS injection via a static `?raw` import (see README "Injecting CSS")

// Must be a *static* top-level import, not inside an async function/render() — a dynamic
// `import('./file.css?raw')` gets served with the wrong Content-Type by most static hosts and the
// browser refuses it as a module script. See README "Injecting CSS" for the full explanation.
import css from './csv-table-plugin.css?raw';

let cssInjected = false;

function injectCss() {
  if (cssInjected) return;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  cssInjected = true;
}

/** @implements {import('@ogc/bblocks-viewer-plugin-types').ViewPluginClass} */
export default class CsvTablePlugin {
  static supportedTypes = ['text/csv'];
  static viewName = 'Table';
  static icon = 'mdi-table';

  /**
   * @param {import('@ogc/bblocks-viewer-plugin-types').ViewPluginCandidate[]} candidates
   * @param {import('@ogc/bblocks-viewer-plugin-types').ViewPluginContext} [context]
   */
  constructor(candidates, context = {}) {
    // Candidates carry whatever content the host already resolved; a null-content candidate (not
    // yet fetched, or fetch failed) simply can't be picked here.
    this.candidate = candidates.find((c) => c.type === 'text/csv' && c.content) ?? null;
    this.bblock = context.bblock ?? null;
  }

  matches() {
    // A real content check, not just "type said text/csv so accept it" — e.g. an empty file
    // technically has the right type but nothing worth rendering as a table.
    return this.candidate !== null && this.candidate.content.trim().length > 0;
  }

  async render(el) {
    injectCss();

    // Lazy: only fetched/evaluated once a matching tab is actually opened, not for every
    // candidate set this plugin gets checked against. Cheap here (papaparse is tiny), but this is
    // the same pattern bblocks-viewer-base-plugins uses for leaflet/three, which are not.
    const { default: Papa } = await import('papaparse');
    const { data } = Papa.parse(this.candidate.content.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'bblocks-csv-table-plugin';

    if (data.length === 0) {
      wrapper.textContent = 'No rows to display.';
      el.appendChild(wrapper);
      return;
    }

    const table = document.createElement('table');
    const columns = Object.keys(data[0]);

    const thead = table.createTHead();
    const headRow = thead.insertRow();
    for (const column of columns) {
      const th = document.createElement('th');
      th.textContent = column;
      headRow.appendChild(th);
    }

    const tbody = table.createTBody();
    for (const row of data) {
      const tr = tbody.insertRow();
      for (const column of columns) {
        tr.insertCell().textContent = row[column] ?? '';
      }
    }

    wrapper.appendChild(table);
    el.appendChild(wrapper);
    this._el = el;
  }

  destroy(el) {
    (el ?? this._el)?.replaceChildren();
  }
}
