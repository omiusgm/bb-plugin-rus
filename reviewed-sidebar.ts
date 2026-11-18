/**
 * Reviewed fixed labels of the thread sidebar (BB 0.49.0 thread-list plugin and
 * the Spaces new-thread row). No dictionary data.
 *
 * The sidebar is owned by plugin boundaries that the translator protects as a
 * whole, because rows hold thread, project and space names. Only these fixed
 * controls are admitted, each by structure and by exact original label:
 * - the "New thread" button, wherever it is drawn: the built-in navigation
 *   header slot, or the Spaces row when that plugin is enabled (text and aria-label);
 * - the empty-state paragraph next to the MessageSquare icon;
 * - the "More" row trigger;
 * - a row's actions button (aria-label only);
 * - the status indicator that precedes a row's actions (aria-label only);
 * - the single "Customize navigation" item of the rail's "More" menu (built-in
 *   navigation, or Spaces, MIT).
 * Rows, links, titles and name labels are never scopes.
 */
export function sidebarScopes(
  document: Document,
  originalText: (element: Element) => string,
): Element[] {
  const scopes: Element[] = [];
  const label = (element: Element) => originalText(element).trim();
  // The owner may disable Spaces, so the rule keys on the button itself (shortcut
  // hint, plus icon, exact label) inside the sidebar, not on the plugin that drew it.
  for (const button of document.querySelectorAll(
    '[data-testid="sidebar-header-slot"] button[aria-keyshortcuts],' +
    '[data-testid="app-sidebar-body"] button[aria-keyshortcuts],' +
    '[data-spaces-new-thread-row] button[aria-keyshortcuts]')) {
    if (label(button) === 'New thread' && button.querySelector(':scope > svg[data-icon="MessageSquarePlus"]')) scopes.push(button);
  }
  for (const paragraph of document.querySelectorAll(
    '[data-sidebar-project-id] p, [data-sidebar-visibility-group] p')) {
    if (paragraph.previousElementSibling?.matches('svg[data-icon="MessageSquare"]') &&
      label(paragraph) === 'No threads') scopes.push(paragraph);
  }
  for (const button of document.querySelectorAll('button[data-testid="sidebar-thread-list-more-trigger"]')) {
    if (label(button) === 'More') scopes.push(button);
  }
  for (const button of document.querySelectorAll('[data-sidebar-row-controls] > button[data-thread-actions-trigger]')) {
    scopes.push(button);
  }
  for (const indicator of document.querySelectorAll('[data-sidebar-thread-trailing-indicator]')) {
    scopes.push(indicator);
  }
  for (const item of document.querySelectorAll(
    '[role="menu"][data-testid="nav-rail-more-menu"][data-bb-plugin="navigation"] > [role="menuitem"],' +
    '[role="menu"][data-testid="nav-rail-more-menu"][data-bb-plugin="spaces"] > [role="menuitem"]')) {
    if (label(item) === 'Customize navigation' && !item.querySelector('.truncate')) scopes.push(item);
  }
  return scopes;
}
