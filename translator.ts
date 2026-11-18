import { tasksScopes, type PluginScopes } from './reviewed-tasks';
import { spacesScopes } from './reviewed-spaces';
import { notificationMenuScopes } from './reviewed-notifications';
import { threadRowMenuScopes } from './reviewed-thread-menu';

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
const NATIVE_HINT_SELECTOR = 'input:not([type="password"]):not([type="hidden"]),textarea';
const NON_NATIVE_PROTECTED_SELECTOR = protectedSelectors.filter(selector =>
  selector !== 'input' && selector !== 'textarea' && selector !== '[role="textbox"]' && selector !== '.font-mono').join(',');
const ATTRIBUTE_DATA_SELECTOR = [...protectedSelectors.filter(selector => selector !== 'svg'), `[${pluginBoundary}]`].join(',');
const ATTRIBUTE_CONTENT_SELECTOR = [ATTRIBUTE_DATA_SELECTOR, '.truncate'].join(',');
// MachineLabel (the first child row) stays excluded. Only the status row and
// host-rendered badges are eligible, from MachinesSettingsSection.tsx.
const MACHINE_COPY_SELECTOR = [
  '[data-settings-anchor="Machines"] [data-machine-row] > a > div > div:nth-child(2) > span:first-child > span.truncate',
  '[data-settings-anchor="Machines"] [data-machine-row] > a > div > div:nth-child(2) > span:last-child.shrink-0',
  '[data-settings-anchor="Machines"] [data-machine-row] > a > div > div:first-child > span.rounded-sm.border',
].join(',');
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
  '[data-settings-anchor="Keyboard shortcuts"] div[aria-label^="Default shortcut"] span',
  '[data-settings-anchor="Keyboard shortcuts"] span.rounded-sm.border',
  // Only the built-in empty/list label branches, never app schemes/errors.
  '[data-settings-anchor="App links"] > div > div:last-child > p.text-subtle-foreground',
  '[data-settings-anchor="App links"] > div > div:last-child > div > p[id]',
  '[data-settings-anchor="Configuration"] > div:last-child > div.border-t > div:first-child > h3',
  '[data-settings-anchor="Configuration"] > div:last-child > div.border-t > div:first-child > p',
  '[data-settings-anchor="Machines"] [role="note"] > div > p',
  '[data-settings-anchor="Machines"] [role="note"]',
  '[data-settings-anchor="Early adopter"] > div:nth-child(2) > h3',
  '[data-settings-anchor="Early adopter"] > div:nth-child(2) > p',
  '[data-settings-anchor="Browsers"] > div:last-child > p.text-subtle-foreground',
  MACHINE_COPY_SELECTOR,
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
  let automationScopeCache = new WeakMap<Element, Element[]>();
  let pluginScopeCache = new WeakMap<Element, PluginScopes>();
  let notificationScopeCache: Element[] | null = null;

  function originalAttribute(element: Element, attribute: Attr): string | null {
    const current = element.getAttribute(attribute);
    const change = attributeChanges.get(element)?.get(attribute);
    return change && current === change.translated ? change.original : current;
  }
  function originalText(element: Element): string {
    // Source-label comparisons must survive our own translation. Never inspect
    // native values, and exclude decorative SVG text from control labels.
    if (element.matches('input,textarea,select,svg')) return '';
    return [...element.childNodes].map(node => {
      if (node.nodeType !== 3) return node.nodeType === 1 ? originalText(node as Element) : '';
      const change = textChanges.get(node as Text);
      return change && node.textContent === change.translated ? change.original : node.textContent ?? '';
    }).join('');
  }
  function originalNode(node: Text): string {
    const change = textChanges.get(node);
    return change && node.data === change.translated ? change.original : node.data;
  }
  function notificationScopes(): Element[] {
    return notificationScopeCache ??= [
      ...notificationMenuScopes(document, originalNode),
      ...threadRowMenuScopes(document, originalText),
    ];
  }
  function reviewedScopes(boundary: Element): PluginScopes {
    let scopes = pluginScopeCache.get(boundary);
    if (!scopes) {
      scopes = boundary.getAttribute('data-bb-plugin') === 'tasks'
        ? tasksScopes(boundary, originalAttribute, originalText)
        : spacesScopes(boundary, originalAttribute);
      pluginScopeCache.set(boundary, scopes);
    }
    return scopes;
  }
  function reviewedBoundary(element: Element): Element | null {
    const boundary = element.closest(`[${pluginBoundary}]`);
    return boundary && ['tasks', 'spaces'].includes(boundary.getAttribute('data-bb-plugin') ?? '') ? boundary : null;
  }
  function isStaticLandmarkLabel(element: Element): boolean {
    const label = originalAttribute(element, 'aria-label');
    if (label === 'Sidebar navigation') return element.matches('nav[data-sidebar-navigation-placement][data-testid="sidebar-navigation-rail"],nav[data-sidebar-navigation-placement][data-testid="sidebar-navigation-region"]');
    if (label === 'Machine access') return view!.location.pathname === '/settings/machines' && element.matches('section');
    if (label === 'Accessing bb from your phone' || label === 'Mobile app downloads') return view!.location.pathname === '/settings/mobile' && element.matches('section');
    if (label === 'Early adopter') return view!.location.pathname === '/settings/experiments' && element.matches('section[data-settings-anchor="Early adopter"]');
    if (label === 'Bulk update actions') return view!.location.pathname === '/settings/updates' && element.matches('[data-updates-domain="provider-clis"] [role="toolbar"]');
    return false;
  }
  function isPickerStaticControl(element: Element): boolean {
    if (!element.matches('button') || !element.closest('[data-app-composer][data-promptbox-shell]')) return false;
    const label = originalAttribute(element, 'aria-label');
    if (label === 'Environment') return element.hasAttribute('data-promptbox-shrinkable-control');
    if (label === 'Permission mode') return Boolean(element.querySelector('[data-promptbox-full-label]') && element.querySelector('[data-promptbox-compact-label]'));
    return label === 'Branch' && element.matches('[role="combobox"]') && Boolean(element.closest('[data-new-thread-footer]')) &&
      element.closest(`[${pluginBoundary}]`)?.getAttribute('data-bb-plugin') === 'environment-project-checkout';
  }
  function isStaticControl(element: Element): boolean {
    return isComposerStaticControl(element) || isPickerStaticControl(element);
  }
  function isComposerStaticControl(element: Element): boolean {
    if (!element.matches('button') || !element.closest('[data-promptbox]')) return false;
    const label = originalAttribute(element, 'aria-label');
    if (label === 'Prompt actions' || label === 'Start voice input') return Boolean(element.closest('[data-promptbox-action-row]'));
    if (label === 'Collapse prompt box') return Boolean(element.closest('[data-promptbox-standard-actions]'));
    if (label === 'Stop run' || label === 'Enter a prompt or attach a file.') return element.hasAttribute('data-promptbox-submit-action');
    return false;
  }
  function isReasoningCopy(element: Element): boolean {
    // The model label is a sibling without this marker. Never admit it.
    const label = element.closest('span[data-promptbox-hide-compact].shrink-0');
    const button = label?.parentElement?.parentElement;
    return Boolean(button?.matches('button') &&
      /^Provider, model and reasoning(?: \([^()]+\))?$/.test(originalAttribute(button, 'aria-label') ?? '') &&
      label?.closest(`[${pluginBoundary}]`)?.getAttribute('data-bb-plugin') === 'bb--composer');
  }
  function automationScopes(boundary: Element): Element[] {
    const cached = automationScopeCache.get(boundary);
    if (cached) return cached;
    // Scopes are structural and constant during this scan/flush. Cache even
    // rejected boundaries; rebuild before the next mutation reconciliation.
    const scopes: Element[] = [];
    automationScopeCache.set(boundary, scopes);
    const tab = boundary.querySelector('button#automations-collection-installed-tab[role="tab"]');
    const modes = tab?.parentElement?.parentElement?.parentElement;
    const collection = modes?.parentElement;
    if (!collection || !modes?.querySelector('button#automations-collection-browse-tab[role="tab"]') ||
      tab?.closest(`[${pluginBoundary}]`) !== boundary) return scopes;
    scopes.push(...[tab, modes.querySelector('#automations-collection-browse-tab'),
      collection.firstElementChild?.querySelector(':scope > div > p')].filter((node): node is Element => Boolean(node)));
    // Reviewed Create button, not template prompts or arbitrary collection rows.
    for (const button of modes.querySelectorAll('button')) {
      if (['New automation', 'New automation options'].includes(originalAttribute(button, 'aria-label') ?? '')) scopes.push(button);
    }
    const panel = collection.querySelector('#automations-collection-installed-panel');
    if (panel) {
      for (const node of panel.querySelectorAll('[data-resource-toolbar] form[role="search"], [role="status"], [role="alert"]')) {
        if (!node.closest('[data-resource-row],[data-resource-card-pointer-action],[data-resource-prompt-content]')) scopes.push(node);
      }
      for (const button of panel.querySelectorAll('[data-resource-toolbar] button')) {
        if (['Filters', 'Sort'].includes(originalAttribute(button, 'aria-label') ?? '')) scopes.push(button);
      }
    }
    return scopes;
  }
  function insideScope(element: Element, scopes: Element[], traversal: boolean): boolean {
    return scopes.some(scope => scope === element || scope.contains(element) || (traversal && element.contains(scope)));
  }
  function isHostStaticUi(element: Element): boolean {
    const pathname = view!.location.pathname;
    if (settingsRoutes.has(pathname) || /^\/settings\/plugins\/[^/]+$/.test(pathname)) {
      if (element.matches('[data-testid="settings-sidebar-body"] .mt-4 > div.text-xs.font-normal.leading-5')) return true;
      // Only the fixed Settings route family, never project/plugin page titles.
      if (element.matches('[data-app-content-shell] [data-testid="app-page-header-content-row"] p.truncate.text-sm.font-semibold')) return true;
    }
    if (pathname === '/settings/archived' && element.matches('section.space-y-5 > div:first-child > h2, section.space-y-5 > div:first-child > p')) return true;
    if (pathname === '/plugins') {
      // ResourceSourceShelf's header description comes only from known host
      // category metadata; catalog cards are in the section's second branch.
      if (element.matches('[data-testid="plugin-browse-shelves"] > section > div:first-child > div:first-child > div:last-child > p')) return true;
      const hero = element.parentElement;
      if (element.matches('p') && hero?.matches('#plugins-browse-results section[aria-roledescription="carousel"]') &&
        originalAttribute(hero, 'aria-label') === 'What you can build with bb plugins') return true;
    }
    if (isReviewedSearchForm(element)) return true;
    const section = element.closest('section[aria-label]');
    const label = section && originalAttribute(section, 'aria-label');
    if (label === 'Mobile app downloads') {
      // Static platform download cards. dl values and plugin-owned mobile UI are excluded.
      return element === section || element.matches('section > div:first-child > h2, section > div:first-child > p') ||
        element.matches('section.space-y-5 > div.space-y-5 > section p, section.space-y-5 > div.space-y-5 > section h2, section.space-y-5 > div.space-y-5 > section a, section.space-y-5 > div.space-y-5 > section dt');
    }
    if (label === 'Machine access' || label === 'Accessing bb from your phone') {
      return element === section || element.matches('section > div:first-child > h2, section > div:first-child > p, p.inline-flex.shrink-0.font-medium, a[href^="/settings/plugins/"]');
    }
    return false;
  }
  function isReviewedSearchForm(element: Element): boolean {
    if (!element.matches('form[role="search"]')) return false;
    const label = originalAttribute(element, 'aria-label');
    const pathname = view!.location.pathname;
    return ((pathname === '/plugins' || pathname === '/settings/plugins') &&
      (label === 'Search plugins' || label === 'Search installed plugins')) ||
      ((pathname === '/skills' || pathname === '/skills/registry') && label === 'Search skills') ||
      (pathname === '/plugins/automations/automations' && label === 'Search automations');
  }
  function canTranslateNativeHint(element: Element): boolean {
    if (!element.matches(NATIVE_HINT_SELECTOR) || isProtected(element, false, true)) return false;
    const boundary = reviewedBoundary(element);
    if (boundary && reviewedScopes(boundary).hints.includes(element)) return true;
    if (element.closest('[data-rus-ui]')) return true;
    const label = originalAttribute(element, 'aria-label');
    if (label === 'Search settings' && element.closest('[data-testid="settings-sidebar-body"]')) return true;
    if (label === 'Search archived threads' && view!.location.pathname === '/settings/archived') return true;
    if (label === 'Search keyboard shortcuts' && element.closest('[data-settings-anchor="Keyboard shortcuts"]')) return true;
    if (label === 'New branch prefix' && element.closest('[data-settings-anchor="New branch prefix"]')) return true;
    if (['Automatic variable name', 'Automatic GH_TOKEN value'].includes(label ?? '') &&
      element.closest('[data-settings-anchor="Environment variables"]')) return true;
    if (['Marketplace source', 'Marketplace subdirectory'].includes(label ?? '') &&
      element.closest('[data-settings-anchor="Plugin marketplaces"]')) return true;
    // Search forms identify static host hints; values and custom input labels stay untouched.
    const form = element.closest('form[role="search"]');
    return form !== null && isReviewedSearchForm(form);
  }
  function isProtected(element: Element, traversal = false, nativeHint = false, staticAttribute = false): boolean {
    if (nativeHint) {
      if (element.matches(NON_NATIVE_PROTECTED_SELECTOR) || element.parentElement?.closest(PROTECTED_SELECTOR)) return true;
    } else if (element.closest(PROTECTED_SELECTOR)) return true;
    // Reviewed notifications menu: fixed plugin copy inside truncated leaves.
    // Ancestors only let the walker reach the item: their own text stays protected.
    if (!nativeHint && insideScope(element, notificationScopes(), traversal)) return false;
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
      if (pluginId === 'bb--composer' && (isReasoningCopy(element) ||
        (staticAttribute && isStaticControl(element)) ||
        (traversal && ([...element.querySelectorAll('span[data-promptbox-hide-compact].shrink-0')].some(isReasoningCopy) ||
          [...element.querySelectorAll('button')].some(isStaticControl))))) continue;
      if (pluginId === 'environment-project-checkout' &&
        ((staticAttribute && isPickerStaticControl(element)) ||
          (traversal && [...element.querySelectorAll('button')].some(isPickerStaticControl)))) continue;
      if (pluginId === 'tasks' || pluginId === 'spaces') {
        const scopes = reviewedScopes(boundary);
        if (insideScope(element, scopes.text, traversal) ||
          ((nativeHint || traversal) && insideScope(element, scopes.hints, traversal)) ||
          ((staticAttribute || traversal) && insideScope(element, scopes.attributes, traversal))) continue;
      }
      if (pluginId === 'automations' && insideScope(element, automationScopes(boundary), traversal)) continue;
      if (pluginId !== 'navigation' && !spacesInHostRail) return true;
      const rail = element.closest(NAV_RAIL_SELECTOR);
      if (rail?.closest(`[${pluginBoundary}]`) === boundary) continue;
      // Let TreeWalker pass through the wrapper/ancestors to reach the rail;
      // this grants no permission to translate sibling content or wrapper copy.
      const containsOwnRail = traversal && [...element.querySelectorAll(NAV_RAIL_SELECTOR)]
        .some(candidate => candidate.closest(`[${pluginBoundary}]`) === boundary);
      if (!containsOwnRail) return true;
    }
    const reviewed = reviewedBoundary(element);
    if (reviewed && insideScope(element, reviewedScopes(reviewed).text, false)) {
      const truncated = element.closest('.truncate');
      // A control may contain a selected user label. Only an explicitly
      // reviewed leaf inside that truncated branch can override its boundary.
      if (!truncated || (reviewedScopes(reviewed).text.includes(truncated) &&
        !truncated.parentElement?.closest('.truncate'))) return false;
    }
    if (isReasoningCopy(element) || element.matches(MACHINE_COPY_SELECTOR)) return false;
    if (nativeHint && element.matches('.truncate')) return false;
    if (isHostStaticUi(element)) return false;
    const truncated = element.closest('.truncate');
    if (!truncated) return false;
    const link = truncated.closest('a');
    return !link || !settingsRoutes.has(link.getAttribute('href') ?? '');
  }
  function isUi(element: Element): boolean {
    if (isProtected(element)) return false;
    if (insideScope(element, notificationScopes(), false)) return true;
    const boundary = element.closest(`[${pluginBoundary}]`);
    if (boundary && ['tasks', 'spaces'].includes(boundary.getAttribute('data-bb-plugin') ?? '') &&
      insideScope(element, reviewedScopes(boundary).text, false)) return true;
    if (boundary?.getAttribute('data-bb-plugin') === 'automations') return insideScope(element, automationScopes(boundary), false);
    return element.closest(UI_SELECTOR) !== null || isHostStaticUi(element) || isReasoningCopy(element);
  }
  function canTranslateAttribute(element: Element, attribute?: Attr): boolean {
    if (!element.matches('input,textarea') && insideScope(element, notificationScopes(), false)) return true;
    const boundary = reviewedBoundary(element);
    if (boundary) {
      const scopes = reviewedScopes(boundary);
      if (element.matches('input,textarea')) return attribute !== 'title' &&
        (boundary.getAttribute('data-bb-plugin') !== 'spaces' || attribute === 'aria-label') &&
        scopes.hints.includes(element) && canTranslateNativeHint(element);
      if (scopes.attributes.includes(element) && !isProtected(element, false, false, true)) {
        if (attribute === 'aria-label') return true;
        // Tasks icon titles are static only when they repeat the reviewed aria
        // name. Spaces grants no title attributes. Selected/user titles stay out.
        if (attribute === 'title' && boundary.getAttribute('data-bb-plugin') === 'tasks')
          return originalAttribute(element, 'title') === originalAttribute(element, 'aria-label') ||
            (element.closest('nav') !== null && ['New project', 'New preset'].includes(originalAttribute(element, 'title') ?? ''));
      }
      // Existing rail controls retain their previous policy. Other reviewed
      // text leaves never implicitly grant arbitrary attributes.
      if (!element.closest(NAV_RAIL_SELECTOR)) return false;
    }
    if (element.matches('input,textarea')) return attribute !== 'title' && canTranslateNativeHint(element);
    // These labels describe source-proven host landmarks or controls. Their
    // own static aria name is independent from nested user/plugin content.
    if (attribute === 'aria-label' && (isStaticLandmarkLabel(element) || isStaticControl(element)) &&
      !isProtected(element, false, false, true)) return true;
    if (attribute === 'aria-label' && isReviewedSearchForm(element) && !isProtected(element)) return true;
    // SettingsWithControl/ChoiceDropdownSetting labels belong to the setting,
    // even when their selected value is a truncated user/provider name.
    if (attribute === 'aria-label' && element.matches('button') && isUi(element) &&
      originalAttribute(element, 'aria-label') === element.closest('[data-settings-anchor]')?.getAttribute('data-settings-anchor') &&
      !element.querySelector(ATTRIBUTE_DATA_SELECTOR)) return true;
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
      if (!element.isConnected || !canTranslateAttribute(element, attribute)) {
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
      updateAttributes(root as Element);
      if (isProtected(root as Element, true)) return;
    }
    const walker = document.createTreeWalker(root, 1 | 4, {
      acceptNode(node) {
        if (node.nodeType === 1 && isProtected(node as Element, true)) {
          // Reviewed native hints and static plugin-control aria names get a
          // separate attribute pass; their protected content stays unvisited.
          updateAttributes(node as Element);
          return 2;
        }
        return 1;
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
      for (const [attribute, change] of changes) {
        if (!element.isConnected || !canTranslateAttribute(element, attribute)) restoreAttribute(element, attribute, change);
      }
    }
  }
  const observer = new view.MutationObserver(records => {
    if (disposed) return;
    for (const record of records) {
      pending.add(record.target);
      if (record.type === 'attributes' || record.type === 'childList') {
        const element = record.target.nodeType === 1 ? record.target as Element : record.target.parentElement;
        const boundary = element && reviewedBoundary(element);
        if (boundary) pending.add(boundary);
        // A Spaces menu uses its switcher identity outside the portaled root.
        if (element?.matches('button') && record.type === 'attributes') {
          for (const overlay of document.querySelectorAll('[data-bb-plugin="spaces"][data-bb-portaled-overlay]')) pending.add(overlay);
        }
      }
      for (const node of record.addedNodes) pending.add(node);
    }
    if (queued) return;
    queued = true;
    view.queueMicrotask(() => {
      queued = false;
      if (disposed) return;
      automationScopeCache = new WeakMap();
      pluginScopeCache = new WeakMap();
      notificationScopeCache = null;
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
      'data-user-name', 'data-project-name', 'data-promptbox-hide-compact',
      'data-resource-toolbar', 'data-resource-row', 'data-resource-card-pointer-action',
      'data-resource-prompt-content', 'data-app-content-shell', 'id', 'type', 'aria-roledescription',
      'data-task-key', 'data-status-group-header', 'data-bb-portaled-overlay',
      'cmdk-root', 'cmdk-input', 'cmdk-item', 'cmdk-empty', 'data-value', 'data-icon', 'viewBox',
      'aria-haspopup', 'aria-labelledby', 'aria-describedby', 'aria-pressed', 'data-spaces-sidebar',
      'data-machine-row', 'data-updates-domain', 'data-promptbox', 'data-promptbox-action-row',
      'data-promptbox-standard-actions', 'data-promptbox-submit-action',
      'data-app-composer', 'data-promptbox-shell', 'data-new-thread-footer',
      'data-promptbox-shrinkable-control', 'data-promptbox-full-label', 'data-promptbox-compact-label',
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
