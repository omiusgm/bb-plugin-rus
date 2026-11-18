/**
 * Reviewed section copy of the bundled thread-list plugin (MIT, BB 0.49.0) for
 * the "Custom" (chronological) layout. No dictionary data.
 *
 * The list is owned by a plugin boundary that the translator protects as a
 * whole, because headers carry user section names. Only fixed copy is admitted,
 * each element by structure and by exact original text:
 * - the headers of the two built-in sections ("Threads", "Pinned") and their four
 *   control labels. Custom section names and the labels built from them stay out;
 * - the dialogs "New section", "Remove section?" and the rename dialog, found by
 *   their exact title, then only their fixed paragraphs, errors and buttons;
 * - the inline rename editor: the "Clear custom name" button, the "Saving name"
 *   status and the fixed error messages. The input and its draft are never scopes.
 * The rename dialog builds its copy from two or three text nodes around the
 * kind word ("section", "thread", "project"), so those nodes are dictionary keys.
 */
type AttributeReader = (element: Element, attribute: 'title' | 'aria-label') => string | null;

const BUILTIN_SECTIONS = ['Threads', 'Pinned'] as const;
const HEADER_LABELS = new Map<string, Set<string>>(BUILTIN_SECTIONS.map(name => [name, new Set([
  `Collapse ${name} section`, `Expand ${name} section`, `New thread in ${name}`, `${name} actions`,
])]));
const DIALOG_TITLES = new Set(['New section', 'Remove section?']);
const RENAME_TITLE = /^Rename (section|thread|project)$/;
const RENAME_TEXT = /^Choose a new name for this (section|thread|project)\.$/;
const FIXED_TEXT = new Set([
  'Create a section for threads.', 'Threads in this section will move back to Threads.',
  'Section name cannot be empty.', 'Name cannot be empty.', 'A section with this name already exists.',
  'Could not save the name. Try again.', 'This item no longer exists.',
  'You do not have permission to rename this item.',
]);
const BUTTONS = new Set(['Create section', 'Cancel', 'Remove section', 'Clear custom name', 'Close']);
const RENAME_BUTTON = /^Rename (section|thread|project)$/;

export function sectionScopes(
  document: Document,
  originalText: (element: Element) => string,
  originalAttribute: AttributeReader,
): Element[] {
  const scopes: Element[] = [];
  const label = (element: Element) => originalText(element).trim();

  for (const name of BUILTIN_SECTIONS) {
    for (const group of document.querySelectorAll(
      `[data-bb-plugin="thread-list"] [data-sidebar-visibility-group="${name.toLowerCase()}"]`)) {
      const header = group.querySelector('[data-sidebar="group-label"]');
      if (!header) continue;
      const title = header.querySelector(':scope > span:first-child > span[title]');
      if (title && label(title) === name && originalAttribute(title, 'title') === name) scopes.push(title);
      for (const button of header.querySelectorAll('button[aria-label]')) {
        if (HEADER_LABELS.get(name)!.has(originalAttribute(button, 'aria-label') ?? '')) scopes.push(button);
      }
    }
  }

  for (const dialog of document.querySelectorAll(
    '[role="dialog"][data-bb-plugin="thread-list"], [role="alertdialog"][data-bb-plugin="thread-list"]')) {
    const title = dialog.querySelector(':scope > div > h2');
    const titleText = title ? label(title) : '';
    if (!title || !(DIALOG_TITLES.has(titleText) || RENAME_TITLE.test(titleText))) continue;
    scopes.push(title);
    for (const paragraph of dialog.querySelectorAll('p')) {
      const text = label(paragraph);
      if (FIXED_TEXT.has(text) || RENAME_TEXT.test(text)) scopes.push(paragraph);
    }
    for (const button of dialog.querySelectorAll('button')) {
      const text = label(button);
      if (BUTTONS.has(text) || RENAME_BUTTON.test(text)) scopes.push(button);
    }
  }

  for (const editor of document.querySelectorAll('[data-bb-plugin="thread-list"] [data-sidebar-rename-editor]')) {
    for (const button of editor.querySelectorAll(':scope > button')) {
      if (originalAttribute(button, 'aria-label') === 'Clear custom name') scopes.push(button);
    }
    for (const status of editor.querySelectorAll(':scope > span[role="status"]')) {
      if (originalAttribute(status, 'aria-label') === 'Saving name' && label(status) === 'Saving name') scopes.push(status);
    }
    for (const alert of editor.querySelectorAll(':scope > span[role="alert"]')) {
      if (FIXED_TEXT.has(label(alert))) scopes.push(alert);
    }
  }
  return scopes;
}
