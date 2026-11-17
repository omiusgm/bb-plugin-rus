/** Reviewed against tarasenko-by/bb-plugin-spaces v0.4.1 (MIT), commit
 * 8a12efd80db0253ffed3df30548f308926c674cd. This only identifies leaves;
 * the caller must retain all protected-ancestor and enclosing-plugin checks.
 */
type OriginalAttribute = (element: Element, attribute: 'title' | 'aria-label' | 'placeholder') => string | null;
export type SpacesScopes = { text: Element[]; attributes: Element[]; hints: Element[] };
const ROOT = `[${['data', 'bb', 'plugin', 'root'].join('-')}]`;
const ICON_NAMES = [
  'SpacesBriefcase', 'Laptop', 'SpacesOffice', 'Code', 'SpacesRocket',
  'ChartColumn', 'Megaphone02', 'Target', 'Toolbox', 'SpacesTeam', 'SpacesWallet',
  'Palette', 'SpacesPen', 'SpacesCamera', 'SpacesMusic', 'Mic', 'SpacesVideo',
  'News01', 'SpacesBook', 'SpacesGraduation', 'SpacesIdea', 'Brain',
  'Home', 'Coffee', 'SpacesHeart', 'SpacesGamepad', 'SpacesDumbbell',
  'SpacesAirplane', 'Globe', 'SpacesLeaf', 'SpacesMoon', 'Star', 'Layers',
];
const ICON_LABELS = new Set(ICON_NAMES.map(name => `Icon ${name}`));
const TINT_LABELS = new Set(['None', 'Blue', 'Teal', 'Green', 'Yellow', 'Orange', 'Red', 'Pink', 'Purple'].map(name => `Tint ${name}`));

export function spacesScopes(boundary: Element, originalAttribute: OriginalAttribute): SpacesScopes {
  const scopes: SpacesScopes = { text: [], attributes: [], hints: [] };
  if (!boundary.matches(`${ROOT}[data-bb-plugin="spaces"][data-bb-portaled-overlay]`)) return scopes;
  const own = (element: Element | null): element is Element => Boolean(element && element.closest(ROOT) === boundary);
  const addText = (element: Element | null) => { if (own(element)) scopes.text.push(element); };

  // SpaceSwitcher.tsx, 131–177. A space may itself be named All projects or
  // Edit Spaces…, so only the fixed two-item tail qualifies, never all radios.
  if (boundary.matches('[role="menu"].min-w-52.space-y-px')) {
    const triggerId = boundary.getAttribute('aria-labelledby');
    const trigger = triggerId && boundary.ownerDocument.getElementById(triggerId);
    if (!trigger || !trigger.matches('button[data-testid="spaces-switcher"]') ||
      trigger.closest(ROOT)?.getAttribute('data-bb-plugin') !== 'spaces') return scopes;
    const edit = boundary.lastElementChild;
    const all = edit?.previousElementSibling ?? null;
    if (!own(edit) || !edit.matches('[role="menuitem"]') || !own(all) || !all.matches('[role="menuitemradio"]')) return scopes;
    const editLabel = edit.querySelector(':scope > span:not(.truncate):last-child');
    const allLabel = all.querySelector(':scope > span.truncate:last-child');
    if (!editLabel || !allLabel || editLabel.children.length || allLabel.children.length) return scopes;
    addText(allLabel);
    addText(editLabel);
    return scopes;
  }

  // EditSpacesDialog.tsx, 187–446. Desktop content is the plugin root itself;
  // the compact drawer puts this same content one div below the plugin root.
  if (!boundary.matches('[role="dialog"]')) return scopes;
  const sidebar = boundary.querySelector('[data-spaces-sidebar]');
  const main = sidebar?.parentElement;
  const content = main?.parentElement;
  if (!own(sidebar) || !main || !content ||
    (content !== boundary && content.parentElement !== boundary) ||
    !main.matches('div.min-h-80') || sidebar !== main.firstElementChild) return scopes;
  const header = content.firstElementChild;
  const more = main.nextElementSibling;
  const footer = more?.nextElementSibling;
  if (!header?.matches('div.space-y-1\\.5') || header.nextElementSibling !== main ||
    !more?.matches('label') || !footer?.matches('div.flex-col-reverse') ||
    footer.querySelectorAll(':scope > button').length !== 2) return scopes;
  const title = header.querySelector(':scope > h2');
  const description = header.querySelector(':scope > p');
  if (!title || !description) return scopes;
  addText(title);
  addText(description);
  const add = sidebar.lastElementChild;
  if (add?.matches('button') && !add.querySelector('.truncate')) addText(add);
  for (const leaf of more.querySelectorAll(':scope > span > span')) addText(leaf);
  for (const button of footer.querySelectorAll(':scope > button')) addText(button);

  // Desktop DialogContent appends one close button; compact has a drawer handle.
  if (content === boundary) {
    const close = footer.nextElementSibling;
    if (close?.matches('button') && close === content.lastElementChild) addText(close.querySelector(':scope > span.sr-only'));
  }

  const editor = sidebar.nextElementSibling;
  if (!own(editor) || editor !== main.lastElementChild || !editor.matches('div.flex-col')) return scopes;
  const groups = [...editor.children];
  const controls = groups[0];
  const iconGroup = groups[1];
  const tintGroup = groups[2];
  const projects = groups[3];
  if (groups.length !== 4 || !projects?.matches('[data-testid="spaces-edit-folder-drop"]') || !own(projects)) return scopes;
  const name = controls?.querySelector(':scope > input');
  if (own(name) && originalAttribute(name, 'aria-label') === 'Space name') scopes.hints.push(name);
  for (const button of controls?.querySelectorAll(':scope > button') ?? []) {
    if (own(button) && ['Move up', 'Move down'].includes(originalAttribute(button, 'aria-label') ?? '')) scopes.attributes.push(button);
  }
  for (const [group, labels] of [[iconGroup, ICON_LABELS], [tintGroup, TINT_LABELS]] as const) {
    if (!group) continue;
    addText(group.querySelector(':scope > span:first-child'));
    for (const button of group.querySelectorAll(':scope > div > button[aria-pressed]')) {
      if (own(button) && labels.has(originalAttribute(button, 'aria-label') ?? '')) scopes.attributes.push(button);
    }
  }
  addText(projects.querySelector(':scope > span:first-child'));
  const dropTarget = projects.querySelector(':scope > div[aria-hidden="true"]');
  const dropLabel = dropTarget?.querySelector(':scope > span.font-medium');
  // The same span becomes `Drop to add to ${selected.name}` while dragging.
  // Its source-defined non-drag class identifies static copy without reading
  // user names or confusing a translated value with a host update.
  if (dropTarget?.classList.contains('border-border') && !dropTarget.classList.contains('border-ring')) addText(dropLabel ?? null);
  return scopes;
}
