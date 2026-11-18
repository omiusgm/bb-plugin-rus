/**
 * Reviewed "Prompt actions" menu of the composer (BB 0.49.0 bb--composer, plus the
 * entries that bundled plugins add to it). No dictionary data.
 *
 * The menu and each plugin entry sit inside plugin boundaries, which the
 * translator protects. Only menu items whose original text is one of the six
 * fixed built-in labels are admitted, either as a direct item of the menu or as
 * the single item of an entry wrapper. User text and other plugins' entries stay
 * in English.
 */
const LABELS = new Set(['Attach files', 'Skills', 'Plan', 'Automation', 'Prompts…', 'Plugin']);

export function promptActionsMenuScopes(
  document: Document,
  originalText: (element: Element) => string,
  originalLabel: (element: Element) => string | null,
): Element[] {
  const scopes: Element[] = [];
  for (const menu of document.querySelectorAll('[role="menu"][data-bb-plugin="bb--composer"]')) {
    if (originalLabel(menu) !== 'Prompt actions' || !menu.closest('body')) continue;
    for (const child of menu.children) {
      const item = child.getAttribute('role') === 'menuitem' ? child
        : child.matches('[data-bb-plugin-root]') && child.children.length === 1 &&
          child.children[0].getAttribute('role') === 'menuitem' ? child.children[0] : null;
      if (item && LABELS.has(originalText(item).trim()) && !item.querySelector('.truncate')) scopes.push(item);
    }
  }
  return scopes;
}
