/**
 * Reviewed thread-row action menu of the bundled thread-list plugin (MIT, BB
 * 0.49.0). No dictionary data.
 *
 * The menu is owned by a plugin boundary, which the translator protects as a
 * whole. Its direct entries are fixed action labels, so only direct menu items
 * whose original text is an exact built-in label are admitted, and only inside
 * a thread-list menu that also holds a row-specific signature entry. Submenus
 * (spaces, sections, user names) are separate menus and stay excluded.
 */
const LABELS = new Set([
  'Open in split', 'Copy link', 'Pin', 'Unpin', 'Mark read', 'Mark unread', 'Rename',
  'Regenerate title', 'Customize actions', 'Move to section', 'Archive', 'Unarchive', 'Delete', 'View details',
]);
const SIGNATURES = ['Copy link', 'Customize actions'];

export function threadRowMenuScopes(
  document: Document,
  originalText: (element: Element) => string,
): Element[] {
  const scopes: Element[] = [];
  for (const menu of document.querySelectorAll('[role="menu"][data-bb-plugin="thread-list"]')) {
    const items = [...menu.children].filter(child => child.getAttribute('role') === 'menuitem');
    const label = (item: Element) => originalText(item).trim();
    if (!items.some(item => SIGNATURES.includes(label(item)))) continue;
    scopes.push(...items.filter(item => LABELS.has(label(item))));
  }
  return scopes;
}
