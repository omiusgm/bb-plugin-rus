/**
 * Reviewed thread-actions menu item of the bundled push-notifications plugin
 * (MIT, BB 0.49.0). No dictionary data.
 *
 * The item and its level submenu contain only fixed plugin copy, but both are
 * rendered inside `.truncate` leaves that the translator protects by default.
 * The scope is structural: one of the plugin's own level icons (they differ per
 * level and may be an svg or a masked span), a label whose first text node is
 * exactly "Notifications", and the radix submenu that this item itself labels.
 * Any change restores the original text.
 */
const LABEL = 'Notifications';
const LEVEL_ICONS = ['BellDot', 'push-notifications/ringing', 'push-notifications/off'];

export function notificationMenuScopes(
  document: Document,
  originalNode: (node: Text) => string,
): Element[] {
  const scopes: Element[] = [];
  const items = document.querySelectorAll('[role="menuitem"][aria-haspopup="menu"]');
  for (const item of items) {
    const [icon, label] = [item.children[0], item.children[1]];
    if (!icon || !LEVEL_ICONS.includes(icon.getAttribute('data-icon') ?? '') || !label?.matches('span')) continue;
    const first = label.firstChild;
    if (first?.nodeType !== 3 || originalNode(first as Text).trim() !== LABEL) continue;
    scopes.push(item);
    if (!item.id) continue;
    for (const menu of document.querySelectorAll('[role="menu"][aria-labelledby]')) {
      if (menu.getAttribute('aria-labelledby') === item.id) scopes.push(menu);
    }
  }
  return scopes;
}
