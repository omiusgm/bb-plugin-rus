import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';
import dictionary from '../dict/ru.json';

const disposers: (() => void)[] = [];
function mount(html: string) {
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, dictionary as Record<string, string>);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });

const plugin = 'data-bb-plugin-root data-bb-plugin="thread-list"';
const svg = (icon: string) => `<svg data-icon="${icon}" data-icon-root></svg>`;
const header = (group: string, name: string) => `<div data-sidebar-visibility-group="${group}">
  <div data-sidebar-sticky-group data-sidebar-rename-row><div role="button" data-sidebar="group-label">
    <span><span title="${name}">${name}</span><button type="button" aria-expanded="true" aria-label="Collapse ${name} section">${svg('ChevronRight')}</button></span>
    <span data-sidebar-trailing-controls><span><span data-sidebar-row-controls>
      <button type="button" aria-label="New thread in ${name}">${svg('MessageSquarePlus')}</button>
      <button type="button" aria-label="${name} actions" aria-haspopup="menu">${svg('MoreHorizontal')}</button>
    </span></span></span></div></div></div>`;
const q = (selector: string) => document.querySelector(selector)!;

it('translates the headers of the built-in sections and their control labels', async () => {
  mount(`<div ${plugin}>${header('threads', 'Threads')}${header('pinned', 'Pinned')}</div>`);
  await settle();
  const threads = q('[data-sidebar-visibility-group="threads"]');
  expect(threads.querySelector('span[title]')?.textContent).toBe('Треды');
  expect(threads.querySelector('span[title]')?.getAttribute('title')).toBe('Треды');
  const labels = [...threads.querySelectorAll('button')].map(button => button.getAttribute('aria-label'));
  expect(labels).toEqual(['Свернуть раздел «Треды»', 'Новый тред в разделе «Треды»', 'Действия с разделом «Треды»']);
  expect(threads.querySelector('button')?.getAttribute('data-rus-original-aria-label')).toBe('Collapse Threads section');
  const pinned = q('[data-sidebar-visibility-group="pinned"]');
  expect(pinned.querySelector('span[title]')?.textContent).toBe('Закреплено');
  expect(pinned.querySelectorAll('button')[2]?.getAttribute('aria-label')).toBe('Действия с разделом «Закреплено»');
});

it('leaves a custom section named like a built-in one, and its labels, untouched', async () => {
  mount(`<div ${plugin}>${header('section:sec_1', 'Threads')}${header('section:sec_2', 'Мой раздел')}</div>`);
  await settle();
  expect(q('[data-sidebar-visibility-group="section:sec_1"] span[title]').textContent).toBe('Threads');
  expect(q('[data-sidebar-visibility-group="section:sec_1"] button').getAttribute('aria-label')).toBe('Collapse Threads section');
  expect(q('[data-sidebar-visibility-group="section:sec_2"] button').getAttribute('aria-label')).toBe('Collapse Мой раздел section');
  expect(q('[data-sidebar-visibility-group="section:sec_2"] span[title]').textContent).toBe('Мой раздел');
});

it('does not translate a built-in header whose label was changed to user text', async () => {
  mount(`<div ${plugin}>${header('threads', 'Threads')}</div>`);
  await settle();
  q('[data-sidebar-visibility-group="threads"] span[title]').firstChild!.textContent = 'Pinned';
  await settle();
  expect(q('[data-sidebar-visibility-group="threads"] span[title]').textContent).not.toBe('Закреплено');
});

const closeButton = `<button type="button">${svg('X')}<span>Close</span></button>`;
const dialog = (title: string, body: string, footer: string, role = 'dialog') =>
  `<div role="${role}" ${plugin} data-bb-portaled-overlay><div><h2>${title}</h2>${body}</div>${footer}${closeButton}</div>`;

it('translates the New section dialog, its validation error and Close', async () => {
  mount(dialog('New section', '<p>Create a section for threads.</p>',
    '<form><div><input aria-label="Section name" value="Мой"><p>Section name cannot be empty.</p></div><div><button type="submit">Create section</button></div></form>'));
  await settle();
  const d = q('[role="dialog"]');
  expect(d.querySelector('h2')?.textContent).toBe('Новый раздел');
  expect(d.querySelector('div > p')?.textContent).toBe('Создать раздел для тредов.');
  expect(d.querySelector('form p')?.textContent).toBe('Название раздела не может быть пустым.');
  expect(d.querySelector('button[type="submit"]')?.textContent).toBe('Создать раздел');
  expect(d.querySelector('button:not([type="submit"]) span')?.textContent).toBe('Закрыть');
  expect((d.querySelector('input') as HTMLInputElement).value).toBe('Мой');
});

it('translates the Remove section confirmation', async () => {
  mount(dialog('Remove section?', '<p>Threads in this section will move back to Threads.</p>',
    '<div><button type="button">Cancel</button><button type="button">Remove section</button></div>'));
  await settle();
  const d = q('[role="dialog"]');
  expect(d.querySelector('h2')?.textContent).toBe('Убрать раздел?');
  expect(d.querySelector('p')?.textContent).toBe('Треды из этого раздела вернутся в «Треды».');
  expect([...d.querySelectorAll('button')].map(b => b.textContent?.trim())).toEqual(['Отмена', 'Убрать раздел', 'Закрыть']);
});

it('translates the rename dialog built from split text nodes', async () => {
  document.body.innerHTML = `<div role="dialog" ${plugin}><div><h2 id="t"></h2><p id="d"></p></div>
    <form><div><input aria-label="Section name"><p role="alert">A section with this name already exists.</p></div>
    <div><button type="button" id="clear">Clear custom name</button><button type="submit" id="go"></button></div></form></div>`;
  const parts = (id: string, ...nodes: string[]) => nodes.forEach(text => q(`#${id}`).append(document.createTextNode(text)));
  parts('t', 'Rename ', 'section'); parts('d', 'Choose a new name for this ', 'section', '.'); parts('go', 'Rename ', 'section');
  disposers.push(mountTranslator(document, dictionary as Record<string, string>));
  await settle();
  expect(q('#t').textContent).toBe('Переименовать раздел');
  expect(q('#d').textContent).toBe('Новое название. Объект: раздел.');
  expect(q('#go').textContent).toBe('Переименовать раздел');
  expect(q('#clear').textContent).toBe('Сбросить своё название');
  expect(q('[role="alert"]').textContent).toBe('Раздел с таким названием уже существует.');
});

it('translates the fixed parts of the inline rename editor and keeps the draft', async () => {
  mount(`<div ${plugin}><span data-sidebar-rename-row><span data-sidebar-rename-editor aria-busy="false">
    <input aria-label="Section name" value="Threads"><button type="button" aria-label="Clear custom name">${svg('RotateCcw')}</button>
    <span role="status" aria-label="Saving name" class="sr-only">Saving name</span>
    <span role="alert">Name cannot be empty.</span></span></span></div>`);
  await settle();
  const editor = q('[data-sidebar-rename-editor]');
  expect(editor.querySelector('button')?.getAttribute('aria-label')).toBe('Сбросить своё название');
  expect(editor.querySelector('button')?.getAttribute('data-rus-original-aria-label')).toBe('Clear custom name');
  expect(editor.querySelector('[role="status"]')?.textContent).toBe('Сохранение названия');
  expect(editor.querySelector('[role="alert"]')?.textContent).toBe('Название не может быть пустым.');
  expect((editor.querySelector('input') as HTMLInputElement).value).toBe('Threads');
});

it('ignores dialogs it does not know and user text inside known ones', async () => {
  mount(`${dialog('Delete project?', '<p>Create a section for threads.</p>', '<div><button type="button">Cancel</button></div>')}
    ${dialog('New section', '<p>Мой текст</p><p>Cancel</p>', '<form><button type="submit">Remove section</button></form>')}`);
  await settle();
  const [other, known] = [...document.querySelectorAll('[role="dialog"]')];
  expect(other.querySelector('p')?.textContent).toBe('Create a section for threads.');
  expect(other.querySelector('button')?.textContent).toBe('Cancel');
  expect(known.querySelectorAll('p')[0]?.textContent).toBe('Мой текст');
  expect(known.querySelectorAll('p')[1]?.textContent).toBe('Cancel');
});

it('does not touch the dialog of another plugin with the same title', async () => {
  mount(`<div role="dialog" data-bb-plugin-root data-bb-plugin="foreign"><div><h2>New section</h2><p>Create a section for threads.</p></div></div>`);
  await settle();
  expect(q('h2').textContent).toBe('New section');
});
