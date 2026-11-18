import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  Notifications: 'Уведомления', 'Same as default': 'Как по умолчанию', 'All activity': 'Вся активность',
  'Needs input only': 'Только когда нужен ответ', Muted: 'Без звука',
  'Limited by a parent thread': 'Ограничено родительским тредом',
  'Limited by an ancestor thread': 'Ограничено вышестоящим тредом',
  'Notifications unavailable': 'Уведомления недоступны',
};
const disposers: (() => void)[] = [];
function mount(html: string) {
  document.body.innerHTML = html;
  // React renders the screen-reader suffix as two text nodes: ", " and the level label.
  for (const node of document.querySelectorAll('.sr-only')) (node.firstChild as Text).splitText(2);
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });

const bell = '<svg data-icon="BellDot" data-icon-root aria-hidden="true"><title>Muted</title></svg>';
const offIcon = '<span aria-hidden="true" data-icon="push-notifications/off" data-icon-root data-plugin-icon-asset="/api/v1/plugins/push-notifications/assets/icons/off.svg"></span>';
const chevron = '<svg data-icon="ChevronRight" data-icon-root></svg>';
const check = '<svg data-icon="Check" data-icon-root></svg>';
const item = (label: string, current = false) =>
  `<div role="menuitem"${current ? ' aria-current="true"' : ''}><span class="min-w-0 flex-1 truncate">${label}</span>${current ? check : ''}</div>`;
function menu(opts: { id?: string; label?: string; detail?: string; hint?: string; icon?: string; owner?: string } = {}) {
  const { id = 'radix-1', label = 'Notifications', detail = ', Needs input only', hint = '', icon = bell, owner = '' } = opts;
  return `<div role="menu" id="parent-menu" ${owner}>
    <div role="menuitem" id="${id}" aria-haspopup="menu" aria-expanded="true">${icon}<span class="min-w-0 flex-1 truncate">${label}<span class="sr-only">${detail}</span></span>${chevron}</div>
    <div role="menuitem"><span class="min-w-0 flex-1 truncate">Muted</span></div>
  </div>
  <div role="menu" aria-labelledby="${id}" data-bb-portaled-overlay>
    ${item('Same as default')}${item('All activity')}${item('Needs input only', true)}${item('Muted')}${hint}
  </div>`;
}

it('translates the notifications item and its own level submenu', async () => {
  mount(menu());
  await settle();
  const items = [...document.querySelectorAll('[role="menu"][aria-labelledby] [role="menuitem"]')].map(node => node.textContent);
  expect(items).toEqual(['Как по умолчанию', 'Вся активность', 'Только когда нужен ответ', 'Без звука']);
  expect(document.querySelector('#radix-1 .truncate')?.firstChild?.textContent).toBe('Уведомления');
  expect(document.querySelector('#radix-1 .sr-only')?.textContent).toBe(', Только когда нужен ответ');
});

it('translates the limited-by hint and the unavailable detail', async () => {
  const hint = '<div role="menuitem" aria-disabled="true"><span class="truncate">Limited by a parent thread</span></div><p class="text-xs">Limited by an ancestor thread</p>';
  mount(menu({ hint, detail: ', Notifications unavailable' }));
  await settle();
  expect(document.body.textContent).toContain('Ограничено родительским тредом');
  expect(document.body.textContent).toContain('Ограничено вышестоящим тредом');
  expect(document.querySelector('#radix-1 .sr-only')?.textContent).toBe(', Уведомления недоступны');
});

it('recognises the item for every level icon, including the masked span of the muted level', async () => {
  mount(menu({ icon: offIcon, detail: ', Muted' }));
  await settle();
  expect(document.querySelector('#radix-1 .truncate')?.firstChild?.textContent).toBe('Уведомления');
  expect(document.querySelector('#radix-1 .sr-only')?.textContent).toBe(', Без звука');
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Как по умолчанию');
});

it('keeps a same-named user thread and a sibling menu entry in English', async () => {
  mount(`${menu()}
    <a href="/projects/p/threads/t1"><span class="truncate">Muted</span></a>
    <div class="truncate" data-thread-title>Notifications</div>
    <button><span class="truncate">All activity</span></button>
    <div role="menu" id="other" aria-labelledby="unrelated"><div role="menuitem"><span class="truncate">Muted</span></div></div>`);
  await settle();
  expect(document.querySelector('a span')?.textContent).toBe('Muted');
  expect(document.querySelector('[data-thread-title]')?.textContent).toBe('Notifications');
  expect(document.querySelector('button span')?.textContent).toBe('All activity');
  expect(document.querySelector('#other span')?.textContent).toBe('Muted');
});

it('reaches the item through a plugin-owned parent menu without opening its other entries', async () => {
  mount(menu({ owner: 'data-bb-plugin-root data-bb-plugin="thread-list" data-bb-portaled-overlay' }));
  await settle();
  expect(document.querySelector('#radix-1 .truncate')?.firstChild?.textContent).toBe('Уведомления');
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Как по умолчанию');
  expect(document.querySelector('#parent-menu > [role="menuitem"]:not([aria-haspopup]) span')?.textContent).toBe('Muted');
});

it('does not apply to a lookalike without the plugin icon or exact label', async () => {
  mount(menu({ icon: '<svg data-icon="Bell" data-icon-root></svg>' }));
  await settle();
  expect(document.querySelector('#radix-1 .truncate')?.firstChild?.textContent).toBe('Notifications');
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Same as default');
  document.body.innerHTML = '';
  mount(menu({ label: 'Notifications of Muted' }));
  await settle();
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Same as default');
});

it('restores the original text when the translator is disposed', async () => {
  const dispose = mount(menu());
  await settle();
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Как по умолчанию');
  dispose();
  expect(document.querySelector('[role="menu"][aria-labelledby] [role="menuitem"]')?.textContent).toBe('Same as default');
  expect(document.querySelector('#radix-1 .truncate')?.firstChild?.textContent).toBe('Notifications');
  expect(document.querySelector('#radix-1 .sr-only')?.textContent).toBe(', Needs input only');
});
