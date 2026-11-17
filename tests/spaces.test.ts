import { afterEach, expect, it } from 'vitest';
import { spacesScopes } from '../reviewed-spaces';
import { mountTranslator } from '../translator';

const description = 'Each space shows only its projects in the sidebar. A project that is in no space shows in every space. While a space is active the thread list is grouped by project; All projects restores your grouping.';
const words = {
  'All projects': '@all', 'Edit Spaces…': '@edit-menu', 'Edit Spaces': '@edit',
  [description]: '@description', 'Add space': '@add', Icon: '@icon', Tint: '@tint',
  Projects: '@projects', 'Drag folders here': '@drag', Cancel: '@cancel', Save: '@save',
  Close: '@close', 'Space name': '@name', 'Move up': '@up', 'Move down': '@down',
  'Icon Code': '@code', 'Tint None': '@none', 'Tint Blue': '@blue',
  'Show other spaces’ projects under More': '@more',
  'Off: the thread list shows only the current space. More still appears if you hide a group yourself.': '@more-help',
  Done: '@done', 'Delete All projects': '@forbidden-delete', 'Space: All projects': '@forbidden-switcher',
  'Icon All projects': '@forbidden-icon', 'Tint All projects': '@forbidden-tint',
  'Each folder becomes a project in All projects': '@forbidden-folder',
  'Drop to add to All projects': '@forbidden-drop', 'all spaces': '@forbidden-membership',
};
const disposers: (() => void)[] = [];
function mount(html: string) {
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });
const rootAttrs = 'data-bb-plugin-root data-bb-plugin="spaces" data-bb-portaled-overlay';
const icon = '<svg data-icon-root aria-hidden="true"><title>Done</title></svg>';
function menu() {
  return `<div data-bb-plugin-root data-bb-plugin="spaces"><button data-testid="spaces-switcher" id="spaces-trigger" aria-controls="spaces-menu" aria-label="Space: All projects"><span class="truncate">All projects</span></button></div>
    <div ${rootAttrs} id="spaces-menu" role="menu" aria-labelledby="spaces-trigger" class="min-w-52 space-y-px">
      <div role="menuitemradio">${icon}<span class="truncate" data-user-space>All projects</span><span>⌃ ⌥ 1</span></div>
      <div role="menuitemradio">${icon}<span class="truncate" data-user-space>Edit Spaces…</span><span>⌃ ⌥ 2</span></div>
      <div role="menuitemradio">${icon}<span class="truncate" data-user-space>Done</span></div>
      <div role="separator"></div>
      <div role="menuitemradio">${icon}<span class="truncate" id="all-label">All projects</span></div>
      <div role="menuitem">${icon}<span id="edit-label">Edit Spaces…</span></div>
    </div>`;
}
function content() {
  return `<div class="space-y-1.5"><h2>Edit Spaces</h2><p>${description}</p></div>
    <div class="flex min-h-80 gap-4">
      <div data-spaces-sidebar>
        <button>${icon}<span class="truncate" data-user-space>All projects</span><span>⌃ ⌥ 1</span></button>
        <button>${icon}<span class="truncate" data-user-space>Done</span><span>⌃ ⌥ 2</span></button>
        <button id="add-space">${icon}Add space</button>
      </div>
      <div class="flex flex-col">
        <div><input aria-label="Space name" value="All projects" placeholder="Done" title="Done"><button aria-label="Move up" title="Done">${icon}</button><button aria-label="Move down">${icon}</button><button aria-label="Delete All projects">${icon}</button></div>
        <div><span id="icon-heading">Icon</span><div><button aria-pressed="true" aria-label="Icon Code">${icon}</button><button aria-pressed="false" aria-label="Icon All projects">${icon}</button></div></div>
        <div><span id="tint-heading">Tint</span><div><button aria-pressed="true" aria-label="Tint None"></button><button aria-pressed="false" aria-label="Tint Blue"></button><button aria-pressed="false" aria-label="Tint All projects"></button></div></div>
        <div data-testid="spaces-edit-folder-drop">
          <span id="projects-heading">Projects</span>
          <div aria-hidden="true" class="border-border"><span class="font-medium" id="drag-label">Drag folders here</span><span id="mixed-folder">Each folder becomes a project in All projects</span></div>
          <div><label><button role="checkbox"></button><span class="truncate" data-project-name>All projects</span><span class="truncate">all spaces</span></label><label><button role="checkbox"></button><span class="truncate" data-project-name>Done</span><span class="truncate">also in All projects</span></label></div>
        </div>
      </div>
    </div>
    <label><button role="checkbox"></button><span><span id="more-label">Show other spaces’ projects under More</span><span id="more-help">Off: the thread list shows only the current space. More still appears if you hide a group yourself.</span></span></label>
    <div class="flex-col-reverse"><button id="cancel">Cancel</button><button id="save" aria-label="Done" title="Done">Save</button></div>`;
}
function dialog(compact = false) {
  return `<div ${rootAttrs} role="dialog" id="editor">${compact ? `<div data-persistent-drawer-handle></div><div class="grid">${content()}</div>` : `${content()}<button><span class="sr-only">Close</span></button>`}</div>`;
}

it('admits only the switcher menu static tail, preserving identically named user spaces and trigger', () => {
  mount(menu());
  expect(document.getElementById('all-label')!.textContent).toBe('@all');
  expect(document.getElementById('edit-label')!.textContent).toBe('@edit-menu');
  expect([...document.querySelectorAll('[data-user-space]')].map(e => e.textContent)).toEqual(['All projects', 'Edit Spaces…', 'Done']);
  expect(document.querySelector('[data-testid="spaces-switcher"]')!.getAttribute('aria-label')).toBe('Space: All projects');
  expect(document.querySelector('[data-testid="spaces-switcher"]')!.textContent).toBe('All projects');
  expect([...document.querySelectorAll('svg title')].every(e => e.textContent === 'Done')).toBe(true);
});

it.each([false, true])('admits static edit dialog leaves and aria names, retaining native values and mixed-name text (compact=%s)', compact => {
  const dispose = mount(dialog(compact));
  expect(document.querySelector('h2')!.textContent).toBe('@edit');
  expect(document.querySelector('p')!.textContent).toBe('@description');
  expect(document.getElementById('add-space')!.textContent).toBe('Done@add');
  expect(['icon-heading', 'tint-heading', 'projects-heading', 'drag-label', 'more-label', 'more-help', 'cancel', 'save'].map(id => document.getElementById(id)!.textContent)).toEqual(['@icon', '@tint', '@projects', '@drag', '@more', '@more-help', '@cancel', '@save']);
  expect([...document.querySelectorAll('[data-user-space],[data-project-name]')].map(e => e.textContent)).toEqual(['All projects', 'Done', 'All projects', 'Done']);
  expect(document.getElementById('mixed-folder')!.textContent).toBe('Each folder becomes a project in All projects');
  expect([...document.querySelectorAll('button[aria-label]')].map(e => e.getAttribute('aria-label'))).toEqual(['@up', '@down', 'Delete All projects', '@code', 'Icon All projects', '@none', '@blue', 'Tint All projects', 'Done']);
  expect(document.querySelector('button[title]')!.getAttribute('title')).toBe('Done');
  const input = document.querySelector('input')!;
  expect([input.getAttribute('aria-label'), input.value, input.getAttribute('value')]).toEqual(['@name', 'All projects', 'All projects']);
  expect([input.placeholder, input.title, document.getElementById('save')!.getAttribute('aria-label'), document.getElementById('save')!.getAttribute('title')]).toEqual(['Done', 'Done', 'Done', 'Done']);
  dispose();
  expect(document.querySelector('h2')!.textContent).toBe('Edit Spaces');
  expect(document.getElementById('drag-label')!.textContent).toBe('Drag folders here');
});

it('never reads or writes the Space name native value', () => {
  document.body.innerHTML = dialog();
  const input = document.querySelector('input')!;
  Object.defineProperty(input, 'value', { configurable: true, get() { throw new Error('must not read value'); }, set() { throw new Error('must not write value'); } });
  const dispose = mountTranslator(document, words); disposers.push(dispose);
  expect(input.getAttribute('aria-label')).toBe('@name');
  expect(input.getAttribute('value')).toBe('All projects');
});

it('restores a drag label before it becomes mixed user-name text and admits it again after dragging', async () => {
  mount(dialog());
  const label = document.getElementById('drag-label')!;
  const drop = label.parentElement!;
  drop.className = 'border-ring bg-state-hover';
  label.textContent = 'Drop to add to All projects';
  await settle();
  expect(label.textContent).toBe('Drop to add to All projects');
  drop.className = 'border-border';
  label.textContent = 'Drag folders here';
  await settle();
  expect(label.textContent).toBe('@drag');
});

it('restores admitted leaves when dialog markers or plugin identity disappear', async () => {
  mount(dialog());
  document.querySelector('[data-spaces-sidebar]')!.removeAttribute('data-spaces-sidebar');
  await settle();
  expect(document.getElementById('save')!.textContent).toBe('Save');
  expect(document.querySelector('input')!.getAttribute('aria-label')).toBe('Space name');
  const side = document.querySelector('.min-h-80')!.firstElementChild!;
  side.setAttribute('data-spaces-sidebar', '');
  await settle();
  expect(document.getElementById('save')!.textContent).toBe('@save');
  document.getElementById('editor')!.setAttribute('data-bb-plugin', 'unknown');
  await settle();
  expect(document.getElementById('save')!.textContent).toBe('Save');
});

it('restores menu copy when the switcher identity or tail structure changes', async () => {
  mount(menu());
  document.querySelector('[data-testid="spaces-switcher"]')!.removeAttribute('data-testid');
  await settle();
  expect(document.getElementById('all-label')!.textContent).toBe('All projects');
  document.getElementById('spaces-trigger')!.setAttribute('data-testid', 'spaces-switcher');
  document.getElementById('spaces-menu')!.insertAdjacentHTML('beforeend', '<div role="menuitemradio"><span class="truncate">Done</span></div>');
  await settle();
  expect(document.getElementById('edit-label')!.textContent).toBe('Edit Spaces…');
});

it.each(['<div data-message-column>', '<div data-bb-plugin-root data-bb-plugin="unknown">', '<div data-rus-ignore>'])('preserves the complete Spaces overlay under %s', wrapper => {
  mount(`${wrapper}${dialog()}</div>`);
  expect(document.getElementById('save')!.textContent).toBe('Save');
  expect(document.querySelector('input')!.getAttribute('aria-label')).toBe('Space name');
});

it('fails closed for unrelated Spaces menus, unidentified portals and compact menu drawers', () => {
  document.body.innerHTML = `<div ${rootAttrs} role="menu"><div role="menuitemradio"><span class="truncate">All projects</span></div><div role="menuitem"><span>Edit Spaces…</span></div></div><div ${rootAttrs} role="dialog" data-persistent-drawer-content><h2 class="sr-only">Menu</h2><div><button role="menuitemradio"><span class="truncate">All projects</span></button><button role="menuitem"><span>Edit Spaces…</span></button></div></div>`;
  for (const boundary of document.querySelectorAll('[data-bb-plugin-root]')) {
    expect(spacesScopes(boundary, (element, attr) => element.getAttribute(attr))).toEqual({ text: [], attributes: [], hints: [] });
  }
});
