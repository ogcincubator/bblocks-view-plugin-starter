// Sample tab plugin, TypeScript+Vue variant — a "Register info" tab showing the bblock's parent
// register's name/url/imports, with a small piece of interactive state (a raw-JSON toggle) to
// justify mounting a real framework instead of plain DOM. See README.md "Tab plugins" for the
// contract, and dependents-tab-plugin.js for the plain-JS counterpart.
//
// Demonstrates that render(el)/destroy(el) is a plain DOM-element handoff — a tab plugin can
// `createApp(...).mount(el)` here exactly like a view plugin could (see
// bblocks-viewer-base-plugins' ThreeDPlugin for the same handoff pattern with Three.js), unmounting
// in destroy(). The plugin bundles its own copy of Vue rather than assuming the host provides one
// — see README.md "Third-party dependencies".

import { createApp, type App } from 'vue';
import type { TabPluginClass, TabPluginContext, TabPluginInstance } from '@ogc/bblocks-viewer-plugin-types';
import RegisterInfoTab from './RegisterInfoTab.vue';

export default class RegisterInfoTabPlugin implements TabPluginInstance {
  static tabId = 'register-info';
  static tabLabel = 'Register info';
  static icon = 'mdi-book-open-variant';
  static weight = 0;

  private readonly context: TabPluginContext;
  private app: App | null = null;

  constructor(context: TabPluginContext) {
    this.context = context;
  }

  render(el: HTMLElement): void {
    this.app = createApp(RegisterInfoTab, { register: this.context.register });
    this.app.mount(el);
  }

  destroy(): void {
    this.app?.unmount();
    this.app = null;
  }
}

// Compile-time check only — asserts the class above actually satisfies the host's contract.
void (RegisterInfoTabPlugin satisfies TabPluginClass);
