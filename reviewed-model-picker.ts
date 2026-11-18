/**
 * Reviewed model and reasoning popover of the composer (BB 0.49.0
 * ModelReasoningMenu.tsx / ModelReasoningPicker.tsx). No dictionary data.
 *
 * The popover sits in the bb--composer plugin boundary and lists provider and
 * model names, which must never be translated. Only fixed chrome is admitted,
 * element by element, each by structure and exact original text:
 * - text scopes: the `Model` and `Reasoning` section labels, the `More models`
 *   toggle label, the reasoning level buttons, the single service-tier row
 *   (switch plus its label) and the `Handoff to new thread` button;
 * - attribute-only scopes (the element's own aria-label / placeholder, never its
 *   content): the `Models` listbox, the `Reasoning` radio group, the search input.
 * Model options, provider buttons and tooltips stay as the host rendered them.
 */
const LEVELS = new Set(['Low', 'Medium', 'High', 'Extra High', 'Ultracode', 'Max']);

export interface ModelPickerScopes { text: Element[]; attributes: Element[] }

export function modelPickerScopes(
  document: Document,
  originalText: (element: Element) => string,
  originalLabel: (element: Element) => string | null,
): ModelPickerScopes {
  const text: Element[] = [];
  const attributes: Element[] = [];
  const own = (element: Element) => originalText(element).trim();
  for (const popover of document.querySelectorAll('[role="dialog"][data-bb-plugin="bb--composer"]')) {
    const input = popover.querySelector('input[role="combobox"]');
    const listbox = popover.querySelector('[role="listbox"]');
    if (!input || originalLabel(input) !== 'Search models' || !listbox || originalLabel(listbox) !== 'Models') continue;
    attributes.push(input, listbox);
    const heading = listbox.firstElementChild;
    if (heading?.matches('div') && heading.children.length === 0 && own(heading) === 'Model') text.push(heading);
    for (const toggle of listbox.querySelectorAll(':scope > button[aria-haspopup="menu"]')) {
      const label = toggle.querySelector(':scope > span');
      if (label && label.children.length === 0 && ['More models', 'Fewer models'].includes(own(label))) text.push(label);
    }
    for (const group of popover.querySelectorAll('[role="radiogroup"]')) {
      if (originalLabel(group) !== 'Reasoning') continue;
      attributes.push(group);
      const title = group.previousElementSibling;
      if (title?.matches('div') && title.children.length === 0 && own(title) === 'Reasoning') text.push(title);
      for (const button of group.querySelectorAll(':scope > button[role="radio"]')) {
        if (LEVELS.has(originalLabel(button) ?? '')) text.push(button);
      }
    }
    for (const toggle of popover.querySelectorAll('button[role="switch"]')) {
      const label = originalLabel(toggle);
      const row = toggle.parentElement;
      const leaf = row?.querySelector(':scope > span > span');
      if (label !== 'Fast mode' || !leaf || leaf.children.length !== 0 || own(leaf) !== label) continue;
      text.push(toggle, leaf);
    }
    for (const button of popover.querySelectorAll('button')) {
      if (!button.hasAttribute('role') && !button.hasAttribute('aria-haspopup') &&
        own(button) === 'Handoff to new thread') text.push(button);
    }
  }
  return { text, attributes };
}
