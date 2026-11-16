/** Exact-match UI translation. Never reads form values or sends data. */
export type Dictionary = Readonly<Record<string, string>>;

// BB public source markers and browser/editor conventions. Unknown rich content
// is excluded. Public marker references are documented in SELECTORS.md.
// Fixed route IDs from BB's public settings-sections.ts; no user entity routes.
const settingsRoutes = new Set([
  '/settings', ...['providers', 'ai-services', 'appearance', 'keyboard', 'browser',
    'files', 'projects', 'machines', 'mobile', 'environment-variables', 'updates',
    'plugins', 'marketplaces', 'experiments', 'community', 'archived']
    .map(section => `/settings/${section}`),
]);
const settingsLinkSelector = [...settingsRoutes].map(path => `a[href="${path}"]`).join(',');
const pluginBoundary = ['data', 'bb', 'plugin', 'root'].join('-');
const NAV_RAIL_SELECTOR = '[data-testid="app-nav-rail"]';
const protectedSelectors = [
  'input', 'textarea', 'select', 'option', 'pre', 'code', 'kbd', 'script', 'style',
  'svg', 'math', 'iframe', 'object', 'canvas',
  '[contenteditable]:not([contenteditable="false"])', '[role="textbox"]',
  '[translate="no"]', '[data-rus-ignore]',
  '[data-message-id]', '[data-message-column]', '[data-timeline-row-id]',
  '[data-timeline-row-list]', '[data-thread-toc]', '[data-thread-title]',
  '[data-thread-row-metadata]', '.bb-thread-title',
  '[data-bb-source-code-line-number]', '[data-bb-source-code-viewport]',
  '[data-line]', '[data-diff]', '[data-user-name]', '[data-project-name]',
  '.monaco-editor', '.cm-editor', '.xterm', '.tiptap', '.ProseMirror',
  '.markdown', '.prose', '.font-mono', '.whitespace-pre',
  'a[href*="/threads/"]', 'a[href*="/thread/"]',
];
export const PROTECTED_SELECTOR = protectedSelectors.join(',');
// SVG icon contents remain protected, but their presence must not suppress a
// button's own accessible label. Other protected descendants still veto it.
const ATTRIBUTE_CONTENT_SELECTOR = [...protectedSelectors.filter(selector => selector !== 'svg'), `[${pluginBoundary}]`, '.truncate'].join(',');
const UI_SELECTOR = [
  'button', 'label', 'summary', 'legend',
  '[role="button"]', '[role="menuitem"]', '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]', '[role="tab"]', '[role="switch"]',
  '[role="checkbox"]', '[role="radio"]', '[role="tooltip"]',
  '[data-slot="dialog-title"]', '[data-slot="dialog-description"]',
  '[data-slot="alert-dialog-title"]', '[data-slot="alert-dialog-description"]',
  '[data-rus-ui]', 'nav a', settingsLinkSelector,
  // Reviewed BB SettingsSection / SettingsWithControl label-only branches.
  '[data-settings-anchor] > div:first-child > div:first-child > p',
  '[data-settings-anchor] > div:first-child > div:first-child > div:first-child > p',
  '[data-settings-anchor] > div:first-child > div:first-child > div:first-child > h2',
  // This section's paragraphs are built-in command labels/descriptions.
  '[data-settings-anchor="Keyboard shortcuts"] p',
  '[data-settings-anchor="Keyboard shortcuts"] h3',
].join(',');
const SAFE_ATTRIBUTES = ['title', 'aria-label', 'placeholder'] as const;
type Attr = typeof SAFE_ATTRIBUTES[number];
type Change = { original: string; translated: string };

/** Only own dictionary entries are copied. Runtime lookup never uses prototypes. */
export function createLookup(dictionary: Dictionary): ReadonlyMap<string, string> {
  return new Map(Object.entries(dictionary).filter(([key, value]) =>
    key.length > 0 && typeof value === 'string' && value.length > 0 && key !== value));
}
export function translateExact(value: string, lookup: ReadonlyMap<string, string>): string | null {
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
  if (!match || !match[2]) return null;
  const translated = lookup.get(match[2]);
  return translated === undefined ? null : match[1] + translated + match[3];
}

export function mountTranslator(document: Document, dictionary: Dictionary, signal?: AbortSignal): () => void {
  if (signal?.aborted) return () => {};
  const view = document.defaultView;
  if (!view || !document.documentElement) return () => {};
  const lookup = createLookup(dictionary);
  const textChanges = new Map<Text, Change>();
  const attributeChanges = new Map<Element, Map<Attr, Change>>();
  let disposed = false;
  let queued = false;
  const pending = new Set<Node>();

  function isProtected(element: Element, traversal = false): boolean {
    if (element.closest(PROTECTED_SELECTOR)) return true;
    // Admit the reviewed navigation rail, and the same DOM-observed Spaces
    // integration only within the host's rail navigation container.
    // Walk every enclosing plugin boundary so a nested unknown plugin cannot
    // gain access by placing a navigation-looking subtree inside itself.
    for (let boundary = element.closest(`[${pluginBoundary}]`); boundary;
      boundary = boundary.parentElement?.closest(`[${pluginBoundary}]`) ?? null) {
      const pluginId = boundary.getAttribute('data-bb-plugin');
      const spacesInHostRail = pluginId === 'spaces' && Boolean(
        boundary.parentElement?.closest('nav[data-sidebar-navigation-placement="rail"]'),
      );
      if (pluginId !== 'navigation' && !spacesInHostRail) return true;
      const rail = element.closest(NAV_RAIL_SELECTOR);
      if (rail?.closest(`[${pluginBoundary}]`) === boundary) continue;
      // Let TreeWalker pass through the wrapper/ancestors to reach the rail;
      // this grants no permission to translate sibling content or wrapper copy.
      const containsOwnRail = traversal && [...element.querySelectorAll(NAV_RAIL_SELECTOR)]
        .some(candidate => candidate.closest(`[${pluginBoundary}]`) === boundary);
      if (!containsOwnRail) return true;
    }
    const truncated = element.closest('.truncate');
    if (!truncated) return false;
    const link = truncated.closest('a');
    return !link || !settingsRoutes.has(link.getAttribute('href') ?? '');
  }
  function isUi(element: Element): boolean {
    return !isProtected(element) && element.closest(UI_SELECTOR) !== null;
  }
  function canTranslateAttribute(element: Element): boolean {
    // A parent control's tooltip can contain its child user title.
    return isUi(element) && !element.querySelector(ATTRIBUTE_CONTENT_SELECTOR);
  }
  function restoreText(node: Text, change: Change): void {
    if (node.data === change.translated) node.data = change.original;
    textChanges.delete(node);
  }
  function restoreAttribute(element: Element, attribute: Attr, change: Change): void {
    if (element.getAttribute(attribute) === change.translated) element.setAttribute(attribute, change.original);
    const changes = attributeChanges.get(element);
    changes?.delete(attribute);
    if (!changes?.size) attributeChanges.delete(element);
  }
  function updateText(node: Text): void {
    const previous = textChanges.get(node);
    const element = node.parentElement;
    if (!element || !node.isConnected || !isUi(element)) {
      if (previous) restoreText(node, previous);
      return;
    }
    if (previous && node.data === previous.translated) return;
    // Host updates supersede the previous original, even for unknown strings.
    textChanges.delete(node);
    const original = node.data;
    const translated = translateExact(original, lookup);
    if (translated !== null) {
      textChanges.set(node, { original, translated });
      node.data = translated;
    }
  }
  function updateAttributes(element: Element): void {
    for (const attribute of SAFE_ATTRIBUTES) {
      const previous = attributeChanges.get(element)?.get(attribute);
      if (!element.isConnected || !canTranslateAttribute(element)) {
        if (previous) restoreAttribute(element, attribute, previous);
        continue;
      }
      const original = element.getAttribute(attribute);
      if (previous && original === previous.translated) continue;
      attributeChanges.get(element)?.delete(attribute);
      if (!attributeChanges.get(element)?.size) attributeChanges.delete(element);
      if (original === null) continue;
      const translated = translateExact(original, lookup);
      if (translated === null) continue;
      let changes = attributeChanges.get(element);
      if (!changes) attributeChanges.set(element, changes = new Map());
      changes.set(attribute, { original, translated });
      element.setAttribute(attribute, translated);
    }
  }
  function scan(root: Node): void {
    if (root.nodeType === 3) { updateText(root as Text); return; }
    if (root.nodeType !== 1 && root !== document) return;
    if (root.nodeType === 1) {
      if (isProtected(root as Element, true)) return;
      updateAttributes(root as Element);
    }
    const walker = document.createTreeWalker(root, 1 | 4, {
      acceptNode(node) {
        return node.nodeType === 1 && isProtected(node as Element, true) ? 2 : 1;
      },
    });
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.nodeType === 1) updateAttributes(node as Element);
      else updateText(node as Text);
    }
  }
  function reconcile(): void {
    // The host may move an existing translated node into a protected root.
    for (const [node, change] of textChanges) {
      if (!node.isConnected || !node.parentElement || !isUi(node.parentElement)) restoreText(node, change);
    }
    for (const [element, changes] of attributeChanges) {
      if (!element.isConnected || !canTranslateAttribute(element)) {
        for (const [attribute, change] of changes) restoreAttribute(element, attribute, change);
      }
    }
  }
  const observer = new view.MutationObserver(records => {
    if (disposed) return;
    for (const record of records) {
      pending.add(record.target);
      for (const node of record.addedNodes) pending.add(node);
    }
    if (queued) return;
    queued = true;
    view.queueMicrotask(() => {
      queued = false;
      if (disposed) return;
      reconcile();
      // A childList target already covers its new descendants. Scan each
      // affected branch once instead of revisiting every inserted child.
      const roots = [...pending].filter(node => {
        for (let parent = node.parentNode; parent; parent = parent.parentNode) {
          if (pending.has(parent)) return false;
        }
        return true;
      });
      pending.clear();
      for (const root of roots) if (root.isConnected) scan(root);
    });
  });
  // Protection markers can change after mount. No timer or polling.
  observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: [
      ...SAFE_ATTRIBUTES, 'class', 'role', 'href', 'contenteditable', 'translate',
      'data-bb-plugin', 'data-testid', 'data-sidebar-navigation-placement', 'data-settings-anchor', 'data-slot', 'data-rus-ui', 'data-rus-ignore', pluginBoundary,
      'data-message-id', 'data-message-column', 'data-timeline-row-id',
      'data-timeline-row-list', 'data-thread-toc', 'data-thread-title',
      'data-thread-row-metadata', 'data-bb-source-code-line-number',
      'data-bb-source-code-viewport', 'data-line', 'data-diff',
      'data-user-name', 'data-project-name',
    ],
  });
  scan(document.documentElement);
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    pending.clear();
    signal?.removeEventListener('abort', dispose);
    for (const [node, change] of textChanges) restoreText(node, change);
    for (const [element, changes] of attributeChanges) {
      for (const [attribute, change] of changes) restoreAttribute(element, attribute, change);
    }
  }
  signal?.addEventListener('abort', dispose, { once: true });
  return dispose;
}
