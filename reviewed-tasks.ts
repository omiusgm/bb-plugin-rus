/** Reviewed Tasks leaves from the shipped MIT BB plugin; no dictionary data. */
type Attr = 'title' | 'aria-label' | 'placeholder';
export type PluginScopes = { text: Element[]; attributes: Element[]; hints: Element[] };
const ROOT = `[${['data', 'bb', 'plugin', 'root'].join('-')}]`;
type OriginalAttribute = (element: Element, attribute: Attr) => string | null;
const statuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'canceled'];
const priorities = ['none', 'urgent', 'high', 'medium', 'low'];
const statusLabels = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done', 'Canceled'];
const priorityLabels = ['No priority', 'Urgent', 'High', 'Medium', 'Low'];
const sortLabels = ['Manual', 'Priority', 'Due date'];
const iconLabels = new Set([
  'Refresh tasks', 'New task', 'Back (Esc)', 'Previous task', 'Next task',
  'Edit labels', 'Move to project', 'Edit dispatch target', 'Choose dispatch preset',
  'Attach file', 'Attach files', 'Comment', 'Add reaction', 'Dismiss', 'Close',
  'No prior agent reply to notify', 'Open Tasks',
  ...statusLabels.map(label => `Change status, currently ${label}`),
  ...priorityLabels.map(label => `Set priority, currently ${label}`),
]);
const actionLabels = new Set([
  'Cancel', 'Save', 'Create task', 'Create project', 'Create preset', 'Save changes',
  'Create more', 'Add label', 'Delete label', 'Delete folder', 'Remove', 'Detach',
  'Retry', 'Retrying…', 'Clear filters', 'Add sub-task', 'Add a preset…', 'Unlink',
]);
const nativeHints = new Set([
  'Task title', 'Due date', 'Base branch', 'Choose status…', 'Choose priority…',
  'Choose project…', 'Add labels…', 'Move to project…', 'Label name', 'Folder name',
  'e.g. Sonnet · high', 'e.g. Tasks Plugin', 'project default base — leave empty',
  'Extra instructions prepended to dispatched threads',
]);

export function tasksScopes(boundary: Element, originalAttribute: OriginalAttribute,
  originalText: (element: Element) => string): PluginScopes {
  const scopes: PluginScopes = { text: [], attributes: [], hints: [] };
  const own = (element: Element) => element.closest(ROOT) === boundary;
  const all = (selector: string) => [
    ...(boundary.matches(selector) ? [boundary] : []), ...boundary.querySelectorAll(selector),
  ].filter(own);
  const add = (selector: string) => scopes.text.push(...all(selector));
  const copy = (element: Element) => originalText(element).trim();
  const hasIcon = (element: Element, icon: string) => Boolean(element.querySelector(`svg[data-icon="${icon}"]`));
  const hasEnumIcon = (element: Element) => Boolean(element.querySelector(':scope > svg[viewBox="0 0 14 14"], :scope > span > svg[viewBox="0 0 14 14"]'));
  const noData = (element: Element) => !element.matches('.truncate') &&
    !element.querySelector('.truncate,input,textarea,[contenteditable],img,[data-task-key]');

  // List-group identity is independent from the adjacent task title and key.
  for (const group of all('[data-status-group-header]')) {
    if (statuses.includes(group.getAttribute('data-status-group-header') ?? '')) scopes.text.push(group);
  }
  add('main > header > div:first-child > span.whitespace-nowrap.font-semibold');
  add('main > header button[aria-pressed]'); // fixed List/Board switch
  add('nav > div:first-child > button > span.flex-1:not(.truncate)'); // All tasks / Active
  add('nav > div.mt-3\\.5.font-semibold:not(button)'); // fixed section headings; folders are buttons
  add('nav > div.space-y-px > div.text-xs'); // No presets yet
  for (const button of all('nav button, .bg-sidebar > div.border-t > button')) {
    if (hasIcon(button, 'Plus') || hasIcon(button, 'Settings')) {
      if (noData(button)) { scopes.text.push(button); scopes.attributes.push(button); }
    }
  }

  // Attribute grants do not open selected project/preset names in child spans.
  for (const button of all('button[aria-label]')) {
    if (iconLabels.has(originalAttribute(button, 'aria-label') ?? '')) scopes.attributes.push(button);
    if (originalAttribute(button, 'aria-label') === 'New task') scopes.text.push(button);
    if (['Status', 'Priority', 'Project'].includes(originalAttribute(button, 'aria-label') ?? '') &&
      button.matches('[aria-haspopup="dialog"]')) {
      scopes.attributes.push(button);
      if (originalAttribute(button, 'aria-label') !== 'Project') {
        const label = button.querySelector(':scope > span.truncate');
        if (label) scopes.text.push(label);
      }
    }
  }
  for (const input of all('input:not([type="password"]):not([type="hidden"]):not([type="file"]),textarea')) {
    if (nativeHints.has(originalAttribute(input, 'aria-label') ?? '') ||
      nativeHints.has(originalAttribute(input, 'placeholder') ?? '')) scopes.hints.push(input);
  }

  // Enum popovers have both a fixed search hint and enum-valued options.
  for (const command of all('[cmdk-root]')) {
    const input = command.querySelector('input[cmdk-input]');
    const hint = input && originalAttribute(input, 'placeholder');
    const values = hint === 'Choose status…' ? statuses : hint === 'Choose priority…' ? priorities : [];
    for (const option of command.querySelectorAll('[cmdk-item][role="option"]')) {
      if (values.includes(option.getAttribute('data-value') ?? '')) {
        const label = option.querySelector(':scope > span.truncate');
        if (label) scopes.text.push(label);
      }
    }
  }
  add('[cmdk-empty]:not(:has(button))'); // fixed empty copy; never Create “<name>”
  for (const button of all('button[aria-haspopup="menu"],button[aria-haspopup="dialog"]')) {
    if (hasEnumIcon(button) && noData(button)) scopes.text.push(button);
    // Filter labels are direct text; selected labels remain truncated/protected.
    if (button.matches('.h-6.border') && ['Circle', 'ArrowUpDown', 'ListTodo', 'Sort'].some(icon => hasIcon(button, icon))) {
      scopes.text.push(button);
    }
    if (hasIcon(button, 'Clock') && noData(button)) scopes.text.push(button);
    // New-task Labels uses a Plus only while empty. A selected label instead
    // renders colored spans and an untruncated user name in this same button.
    if (button.matches('.h-7.border-input.font-normal') && hasIcon(button, 'Plus') &&
      noData(button) && !button.querySelector('span[style]')) scopes.text.push(button);
  }
  for (const item of all('[role="menuitem"],[role="menuitemcheckbox"]')) {
    if (hasEnumIcon(item) && noData(item)) scopes.text.push(item);
    // Context-menu submenu labels have a static icon plus label span. Project
    // and label options use colored spans, not these icons.
    if (item.hasAttribute('aria-haspopup') && ['Circle', 'ArrowUpDown', 'Clock', 'ListTodo', 'ArrowUpRight'].some(icon => hasIcon(item, icon))) {
      const label = item.querySelector(':scope > span');
      if (label && !label.querySelector('svg')) scopes.text.push(label);
    }
  }
  for (const menu of all('[role="menu"]')) {
    const items = [...menu.querySelectorAll(':scope > [role="menuitemcheckbox"]')];
    if (items.length === sortLabels.length && items.every(item => noData(item) && sortLabels.includes(copy(item)) && !item.querySelector('span[style]'))) scopes.text.push(...items);
    add('[role="menu"] > div.font-medium.text-muted-foreground:not([role])'); // fixed menu section labels
  }

  // Form labels and table/tab chrome are separate from native values and rows.
  add('div.space-y-1\\.5 > label.block.text-xs.font-medium');
  add('thead th, [role="tablist"] > button[role="tab"]');
  add('aside > h2, aside > div.mb-1.mt-3.font-semibold');
  add('aside > div.flex-col > span.text-muted-foreground'); // none active
  for (const section of all('section[aria-label]')) {
    if (originalAttribute(section, 'aria-label') === 'Activity') {
      scopes.attributes.push(section);
      const heading = section.querySelector(':scope > h2');
      if (heading) scopes.text.push(heading);
      const empty = section.querySelector(':scope > div.relative > div.text-xs.text-muted-foreground');
      if (empty) scopes.text.push(empty); // comment entries have relative/flex wrappers
    }
  }
  add('header.space-y-1 > h2, header.space-y-1 > p'); // Manage
  add('div.items-center.justify-center.text-center > div.space-y-1 > p.font-medium'); // EmptyState title
  for (const paragraph of all('div.items-center.justify-center.text-center > div.space-y-1 > p.text-muted-foreground')) {
    if (['Create the first task to start tracking work.', 'Dispatch a task to an agent preset and it will show up here while it runs.'].includes(copy(paragraph))) scopes.text.push(paragraph);
  }
  for (const button of all('button:not([aria-haspopup]):not([role="option"]):not([role^="menuitem"])')) {
    if (button.closest('nav,[data-task-key],[cmdk-item],.bb-tasks-editor') || !noData(button)) continue;
    const label = originalAttribute(button, 'aria-label');
    if (label !== null && !iconLabels.has(label)) continue;
    if (actionLabels.has(copy(button))) scopes.text.push(button);
  }
  for (const manage of all('div.flex.h-full.min-h-0.flex-col.gap-4.overflow-y-auto.p-4')) {
    if (!['labels', 'presets', 'folders'].every(name => manage.querySelector(`button[role="tab"][id$="-trigger-${name}"]`))) continue;
    for (const node of manage.querySelectorAll('[role="tabpanel"] > div.space-y-3 > p:not([role]), [role="tabpanel"] div.divide-y > p:not([role]), [role="tabpanel"] > p:not([role]), [role="tabpanel"] td[colspan="8"], [role="tabpanel"] div.space-y-3 > div:first-child > p:not([role])')) {
      if (own(node)) scopes.text.push(node);
    }
  }
  // Native dialog title/description IDs are generated; resolve their relationship
  // rather than hard-coding Radix IDs. Mixed New task · <project> stays excluded.
  const dialogs = boundary.matches('[role="dialog"]') ? [boundary] : all('[role="dialog"]');
  for (const dialog of dialogs) {
    for (const relation of ['aria-labelledby', 'aria-describedby']) {
      const id = dialog.getAttribute(relation);
      const node = id && dialog.ownerDocument.getElementById(id);
      if (!node || !dialog.contains(node)) continue;
      if (relation === 'aria-labelledby' && ['New project', 'New preset', 'Edit preset', 'Remove attachment?', 'Detach thread?'].includes(copy(node))) scopes.text.push(node);
      if (relation === 'aria-describedby' && ['Create a task with a title, description, attributes, and attachments.', 'Projects group tasks under a shared key prefix.', 'Presets pick the provider, model, and guardrails for dispatched threads.'].includes(copy(node))) scopes.text.push(node);
    }
    // Dialog close button's sr-only leaf; other sr-only user content is excluded.
    add('[role="dialog"] > button.absolute > span.sr-only');
    if (dialog === boundary) add(':scope > button.absolute > span.sr-only');
  }
  return scopes;
}
