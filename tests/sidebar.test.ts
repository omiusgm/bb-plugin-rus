import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  'New thread': 'Новый тред', 'New thread (⇧ ⌘ O)': 'Новый тред (⇧ ⌘ O)', 'No threads': 'Нет тредов',
  More: 'Ещё', 'More projects': 'Другие проекты', 'Thread actions': 'Действия с тредом',
  'Thread working': 'Тред выполняется', 'Thread needs user input': 'Треду нужен ответ пользователя',
  'Claude Code': 'Клод Код',
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

const plugin = (id: string) => `data-bb-plugin-root data-bb-plugin="${id}"`;
const svg = (icon: string, label = '') => `<svg data-icon="${icon}" data-icon-root${label ? ` aria-label="${label}"` : ''}></svg>`;
function sidebar(extra = '') {
  return `<div data-testid="app-sidebar-body">
    <div data-spaces-new-thread-row data-bb-portaled-overlay ${plugin('spaces')}><div>
      <button type="button" aria-keyshortcuts="Shift+Meta+O" aria-label="New thread (⇧ ⌘ O)">${svg('MessageSquarePlus')}<span class="truncate">New thread</span></button>
    </div></div>
    <div ${plugin('thread-list')}>
      <div data-sidebar-visibility-group="p1"><div data-sidebar-sticky-project-item data-sidebar-project-id="proj_1">
        <div data-sidebar-rename-row><span class="truncate" title="No threads">No threads</span></div>
        <div><div>${svg('MessageSquare')}<p>No threads</p></div></div>
      </div></div>
      <div data-sidebar-thread-id="t1" data-sidebar-rename-row role="button">
        <span data-sidebar-thread-provider role="img" aria-label="Claude Code"></span>
        <a href="/projects/p/threads/t1"><span class="truncate">More</span></a>
        <span data-sidebar-thread-trailing><span data-sidebar-thread-trailing-indicator>${svg('CircleQuestion', 'Thread needs user input')}</span>
          <span data-sidebar-row-controls><button type="button" aria-label="Thread actions" data-thread-actions-trigger>${svg('MoreHorizontal')}</button></span></span>
      </div>
      <div data-testid="sidebar-thread-list-more-row"><div><button type="button" aria-label="More projects" data-testid="sidebar-thread-list-more-trigger">${svg('MoreHorizontal')}<span class="truncate">More</span><span data-sidebar-more-activity></span></button></div></div>
      ${extra}
    </div></div>`;
}

it('translates the reviewed fixed sidebar labels', async () => {
  mount(sidebar());
  await settle();
  const button = document.querySelector('[data-spaces-new-thread-row] button')!;
  expect(button.textContent).toBe('Новый тред');
  expect(button.getAttribute('aria-label')).toBe('Новый тред (⇧ ⌘ O)');
  expect(document.querySelector('[data-sidebar-project-id] p')?.textContent).toBe('Нет тредов');
  const more = document.querySelector('[data-testid="sidebar-thread-list-more-trigger"]')!;
  expect(more.querySelector('.truncate')?.textContent).toBe('Ещё');
  expect(more.getAttribute('aria-label')).toBe('Другие проекты');
  expect(document.querySelector('[data-thread-actions-trigger]')?.getAttribute('aria-label')).toBe('Действия с тредом');
  expect(document.querySelector('[data-sidebar-thread-trailing-indicator] svg')?.getAttribute('aria-label')).toBe('Треду нужен ответ пользователя');
  expect(document.querySelector('[data-sidebar-thread-trailing-indicator] svg')?.getAttribute('data-rus-original-aria-label')).toBe('Thread needs user input');
  expect(document.querySelector('[data-thread-actions-trigger]')?.getAttribute('data-rus-original-aria-label')).toBe('Thread actions');
});

it('keeps names, titles, links and the provider icon label untouched', async () => {
  mount(sidebar());
  await settle();
  expect(document.querySelector('[data-sidebar-rename-row] > .truncate')?.textContent).toBe('No threads');
  expect(document.querySelector('[data-sidebar-rename-row] > .truncate')?.getAttribute('title')).toBe('No threads');
  expect(document.querySelector('a span')?.textContent).toBe('More');
  expect(document.querySelector('[data-sidebar-thread-provider]')?.getAttribute('aria-label')).toBe('Claude Code');
});

it('does not admit lookalikes outside the reviewed structure', async () => {
  mount(`${sidebar(`<div data-sidebar-project-id="proj_2"><div><p>No threads</p></div></div>
    <div ${plugin('other')}><button type="button" aria-label="Thread actions" data-thread-actions-trigger>x</button>
    <button data-testid="sidebar-thread-list-more-trigger"><span class="truncate">More projects of mine</span></button></div>`)}
    <div ${plugin('spaces')}><button aria-keyshortcuts="x"><span class="truncate">New thread</span></button></div>`);
  await settle();
  expect(document.querySelector('[data-sidebar-project-id="proj_2"] p')?.textContent).toBe('No threads');
  expect(document.querySelector('[data-bb-plugin="other"] button')?.getAttribute('aria-label')).toBe('Thread actions');
  expect(document.querySelector('[data-bb-plugin="other"] .truncate')?.textContent).toBe('More projects of mine');
  expect(document.querySelectorAll('[data-bb-plugin="spaces"]')[1].textContent).toBe('New thread');
});

it('walks through the plugin-owned sidebar without opening other entries', async () => {
  mount(sidebar('<div data-sidebar-section><span class="truncate">More</span><p>No threads</p></div>'));
  await settle();
  expect(document.querySelector('[data-sidebar-section] .truncate')?.textContent).toBe('More');
  expect(document.querySelector('[data-sidebar-section] p')?.textContent).toBe('No threads');
});

it('restores all original text and labels when disposed', async () => {
  const dispose = mount(sidebar());
  await settle();
  dispose();
  expect(document.querySelector('[data-spaces-new-thread-row] button')?.textContent).toBe('New thread');
  expect(document.querySelector('[data-spaces-new-thread-row] button')?.getAttribute('aria-label')).toBe('New thread (⇧ ⌘ O)');
  expect(document.querySelector('[data-sidebar-project-id] p')?.textContent).toBe('No threads');
  expect(document.querySelector('[data-thread-actions-trigger]')?.getAttribute('aria-label')).toBe('Thread actions');
  expect(document.querySelector('[data-sidebar-thread-trailing-indicator] svg')?.getAttribute('aria-label')).toBe('Thread needs user input');
  expect(document.querySelectorAll('[data-rus-original-aria-label]')).toHaveLength(0);
});

it('translates the single item of the rail More menu and nothing else in it', async () => {
  const withWords = { ...words, 'Customize navigation': 'Настроить навигацию' };
  document.body.innerHTML = `<div role="menu" data-bb-plugin-root data-bb-plugin="spaces" data-testid="nav-rail-more-menu"><div role="menuitem">${svg('SlidersHorizontal')}Customize navigation</div><div role="menuitem">Customize navigation</div></div>
    <div role="menu" data-bb-plugin-root data-bb-plugin="spaces" id="other"><div role="menuitem">Customize navigation</div></div>`;
  disposers.push(mountTranslator(document, withWords));
  await settle();
  const items = [...document.querySelectorAll('[role="menuitem"]')].map(node => node.textContent);
  expect(items).toEqual(['Настроить навигацию', 'Настроить навигацию', 'Customize navigation']);
});

const nativeNewThread = `<div data-testid="sidebar-header-slot" data-sidebar-header-slot><div ${plugin('navigation')}>
  <button type="button" aria-keyshortcuts="Shift+Meta+O" aria-label="New thread (⇧ ⌘ O)">${svg('MessageSquarePlus')}<span>New thread</span></button></div></div>`;

it('translates the built-in New thread button when Spaces is disabled', async () => {
  mount(nativeNewThread);
  await settle();
  const button = document.querySelector('[data-testid="sidebar-header-slot"] button')!;
  expect(button.textContent).toBe('Новый тред');
  expect(button.getAttribute('aria-label')).toBe('Новый тред (⇧ ⌘ O)');
  expect(button.getAttribute('data-rus-original-aria-label')).toBe('New thread (⇧ ⌘ O)');
});

it('still translates the Spaces New thread button', async () => {
  mount(sidebar());
  await settle();
  expect(document.querySelector('[data-spaces-new-thread-row] button')!.textContent).toBe('Новый тред');
});

it('keeps lookalike New thread buttons of another plugin and without the icon untouched', async () => {
  mount(`${nativeNewThread}
    <div id="foreign" ${plugin('foreign')}><button type="button" aria-keyshortcuts="Shift+Meta+O">${svg('MessageSquarePlus')}<span>New thread</span></button></div>
    <div data-testid="sidebar-header-slot"><div ${plugin('navigation')}><button type="button" aria-keyshortcuts="Meta+K"><span>New thread</span></button></div></div>`);
  await settle();
  expect(document.querySelector('#foreign button')!.textContent).toBe('New thread');
  expect(document.querySelectorAll('[data-testid="sidebar-header-slot"] button')[1]!.textContent).toBe('New thread');
});

it('translates the Customize navigation item of the built-in navigation More menu', async () => {
  document.body.innerHTML = `<div role="menu" ${plugin('navigation')} data-testid="nav-rail-more-menu"><div role="menuitem">${svg('SlidersHorizontal')}Customize navigation</div></div>
    <div role="menu" ${plugin('navigation')} id="other"><div role="menuitem">Customize navigation</div></div>`;
  disposers.push(mountTranslator(document, { ...words, 'Customize navigation': 'Настроить навигацию' }));
  await settle();
  expect([...document.querySelectorAll('[role="menuitem"]')].map(node => node.textContent))
    .toEqual(['Настроить навигацию', 'Customize navigation']);
});
