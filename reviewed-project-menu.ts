/**
 * Reviewed project / sidebar-view menu of the bundled thread-list plugin (MIT,
 * BB 0.49.0). No dictionary data.
 *
 * Two menus carry these fixed entries: the project row actions (right click and
 * the "..." button) and the sidebar header menu. The menu is owned by a plugin
 * boundary, which the translator protects as a whole, so only direct menu items
 * whose original text is an exact built-in label are admitted, and only in a menu
 * that holds a project-specific signature (a link to the project settings, or the
 * full "New section" + "Organize" + "Sort by" set).
 *
 * The Organize, Sort by and Filter items open radix submenus that hold only
 * fixed copy (SidebarViewItems.tsx). Each submenu is admitted as a whole, found
 * by `aria-labelledby` pointing at the admitted item that opened it. The
 * actions menu label `<project> actions` carries a user name and stays out.
 */
const LABELS = new Set([
  'New section', 'Organize', 'Sort by', 'Filter', 'Project settings', 'Rename',
  'Hide from list', 'Customize list', 'Remove',
]);
const SUBMENU_TRIGGERS = new Set(['Organize', 'Sort by', 'Filter']);

export function projectMenuScopes(
  document: Document,
  originalText: (element: Element) => string,
): Element[] {
  const scopes: Element[] = [];
  const label = (item: Element) => originalText(item).trim();
  for (const menu of document.querySelectorAll('[role="menu"][data-bb-plugin="thread-list"]')) {
    const items = [...menu.children].filter(child => child.getAttribute('role') === 'menuitem');
    const labels = items.map(label);
    const hasSettingsLink = items.some(item =>
      item.matches('a[href^="/settings/projects/"]') && label(item) === 'Project settings');
    const hasViewSet = ['New section', 'Organize', 'Sort by'].every(name => labels.includes(name));
    if (!hasSettingsLink && !hasViewSet) continue;
    for (const item of items) {
      // The built-in entries hold their label as direct text; a nested truncated
      // leaf is user or plugin content.
      if (!LABELS.has(label(item)) || item.querySelector('.truncate')) continue;
      scopes.push(item);
      if (!item.id || !SUBMENU_TRIGGERS.has(label(item)) || item.getAttribute('aria-haspopup') !== 'menu') continue;
      for (const submenu of document.querySelectorAll('[role="menu"][data-bb-plugin="thread-list"][aria-labelledby]')) {
        if (submenu.getAttribute('aria-labelledby') === item.id) scopes.push(submenu);
      }
    }
  }
  return scopes;
}
