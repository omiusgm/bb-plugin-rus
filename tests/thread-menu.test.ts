import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  'Open in split': 'Открыть рядом', 'Copy link': 'Копировать ссылку', Pin: 'Закрепить',
  'Mark read': 'Отметить прочитанным', 'Mark unread': 'Отметить непрочитанным', Rename: 'Переименовать',
  'Regenerate title': 'Создать название заново', 'Customize actions': 'Настроить действия',
  Archive: 'В архив', Delete: 'Удалить', Notifications: 'Уведомления', Muted: 'Без звука', 'Move to section': 'Переместить в раздел',
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

const icon = '<svg data-icon="Copy" data-icon-root aria-hidden="true"></svg>';
const item = (label: string) => `<div role="menuitem">${icon}<span class="min-w-0 flex-1 truncate">${label}</span></div>`;
const owner = (plugin = 'thread-list') => `data-bb-plugin-root data-bb-plugin="${plugin}" data-bb-portaled-overlay`;
const rowMenu = (plugin = 'thread-list', labels = ['Open in split', 'Copy link', 'Pin', 'Mark unread', 'Rename',
  'Regenerate title', 'Customize actions', 'Archive', 'Delete']) =>
  `<div role="menu" ${owner(plugin)}>${labels.map(item).join('')}</div>`;
const texts = () => [...document.querySelectorAll('[role="menu"] > [role="menuitem"]')].map(node => node.textContent);

it('translates the built-in entries of the thread row menu', async () => {
  mount(rowMenu());
  await settle();
  expect(texts()).toEqual(['Открыть рядом', 'Копировать ссылку', 'Закрепить', 'Отметить непрочитанным',
    'Переименовать', 'Создать название заново', 'Настроить действия', 'В архив', 'Удалить']);
});

it('keeps entries that are not built-in labels and submenus in English', async () => {
  mount(`${rowMenu('thread-list', ['Copy link', 'Notify parent, Off', 'Мотивация', 'Muted', 'Delete'])}
    <div role="menu" ${owner()}><div role="menuitem"><span class="truncate">Delete</span></div><div role="menuitem"><span class="truncate">Pin</span></div></div>`);
  await settle();
  expect(texts()).toEqual(['Копировать ссылку', 'Notify parent, Off', 'Мотивация', 'Muted', 'Удалить', 'Delete', 'Pin']);
});

it('requires a row-specific entry and the thread-list owner', async () => {
  mount(`${rowMenu('thread-list', ['Rename', 'Delete'])}${rowMenu('some-plugin')}`);
  await settle();
  expect(texts().slice(0, 2)).toEqual(['Rename', 'Delete']);
  expect(texts().slice(2, 4)).toEqual(['Open in split', 'Copy link']);
});

it('keeps a thread titled like an action untouched outside the menu', async () => {
  mount(`${rowMenu()}<a href="/projects/p/threads/t"><span class="truncate">Pin</span></a><div data-thread-title class="truncate">Delete</div>`);
  await settle();
  expect(document.querySelector('a span')?.textContent).toBe('Pin');
  expect(document.querySelector('[data-thread-title]')?.textContent).toBe('Delete');
});

it('translates the menu together with the notifications entry and restores on dispose', async () => {
  const bell = '<svg data-icon="BellDot" data-icon-root></svg>';
  const html = `<div role="menu" ${owner()} id="m">${item('Copy link')}
    <div role="menuitem" id="n1" aria-haspopup="menu">${bell}<span class="truncate">Notifications<span class="sr-only">, Muted</span></span></div>
    ${item('Customize actions')}</div>`;
  const dispose = mount(html);
  await settle();
  expect(document.querySelector('#m')?.textContent).toContain('Копировать ссылку');
  expect(document.querySelector('#n1 .truncate')?.firstChild?.textContent).toBe('Уведомления');
  expect(document.querySelector('#m')?.textContent).toContain('Настроить действия');
  dispose();
  expect(document.querySelector('#m')?.textContent?.replace(/\s+/g, ' ')).toContain('Copy link Notifications, Muted Customize actions');
});

it('translates the Move to section entry of the Custom layout row menu', async () => {
  mount(rowMenu('thread-list', ['Copy link', 'Move to section', 'Customize actions']));
  await settle();
  expect(texts()).toEqual(['Копировать ссылку', 'Переместить в раздел', 'Настроить действия']);
});
