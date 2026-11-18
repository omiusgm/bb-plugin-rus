/**
 * Reviewed fixed copy of three daily surfaces (BB 0.49.0). No dictionary data.
 *
 * - The thread details panel (plugin `core`): the six row labels and two fixed
 *   values. Names of projects, machines, directories and parent threads sit in the
 *   same rows and stay untouched: only exact original text in a leaf is admitted.
 * - The composer project button: the "No project" label (both full and compact
 *   copies). A selected project name is the same leaf, so exact text decides.
 * - The "New tab" pill of an empty right panel tab.
 * - The "Parent" chip above the composer (the word only; the thread link is protected).
 * - The "Working..." line of the thread timeline, one leaf that is the only child of
 *   its line, outside messages and timeline rows (those stay protected anyway).
 */
const ROW_LABELS = new Set(['Parent', 'Notify parent', 'Project', 'Environment', 'Machine', 'Directory']);

export function detailsScopes(
  document: Document,
  originalText: (element: Element) => string,
  originalAttribute: (element: Element, attribute: 'title' | 'aria-label') => string | null,
): Element[] {
  const scopes: Element[] = [];
  const text = (element: Element) => originalText(element).trim();

  for (const panel of document.querySelectorAll('[data-bb-plugin="core"]')) {
    for (const row of panel.querySelectorAll('dl dt')) {
      const leaf = row.querySelector(':scope > span > span:last-child');
      if (leaf && leaf.children.length === 0 && ROW_LABELS.has(text(leaf))) scopes.push(leaf);
    }
    for (const leaf of panel.querySelectorAll('dl dd > button[aria-label="Notify parent"] > span[title] > span')) {
      if (leaf.children.length === 0 && text(leaf) === 'Auto') scopes.push(leaf);
    }
    for (const leaf of panel.querySelectorAll('dl dd > span > span[title]')) {
      if (leaf.children.length === 0 && text(leaf) === 'Project checkout' &&
        originalAttribute(leaf, 'title') === 'Project checkout') scopes.push(leaf);
    }
  }

  for (const leaf of document.querySelectorAll(
    '[data-app-composer] button[data-promptbox-project-control] [data-promptbox-full-label],' +
    '[data-app-composer] button[data-promptbox-project-control] [data-promptbox-compact-label]')) {
    if (leaf.children.length === 0 && text(leaf) === 'No project') scopes.push(leaf);
  }

  // Right panel tab pill of an empty tab: the NewTab icon plus the fixed title. Pills of
  // real tabs carry page or file names, so the icon and the exact text decide.
  for (const leaf of document.querySelectorAll('[data-tab-pill] > button > span.truncate[title]')) {
    const icon = leaf.previousElementSibling?.querySelector('svg[data-icon="NewTab"]');
    if (icon && leaf.children.length === 0 && text(leaf) === 'New tab' &&
      originalAttribute(leaf, 'title') === 'New tab') scopes.push(leaf);
  }

  // "Parent <thread>" chip above the composer: the span holds the word and the link.
  // The link text stays protected by the translator (thread links), only "Parent " is ours.
  for (const chip of document.querySelectorAll('[data-app-composer] section[aria-label="Thread context before sending"] span')) {
    const link = chip.children.length === 1 ? chip.children[0] : null;
    if (link?.matches('a[href*="/threads/"]') && originalText(chip).startsWith('Parent ') &&
      text(chip) === `Parent ${text(link)}`.trim()) scopes.push(chip);
  }

  for (const leaf of document.querySelectorAll('[data-page-scroll-viewport] div > span.animate-shine')) {
    const line = leaf.parentElement;
    if (leaf.children.length === 0 && text(leaf) === 'Working...' && line?.children.length === 1 &&
      !leaf.closest('[data-message-id],[data-timeline-row-id],[data-bb-plugin-root]')) scopes.push(leaf);
  }
  return scopes;
}
