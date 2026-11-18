import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  'New section': 'Новый раздел', Organize: 'Упорядочить', 'Sort by': 'Сортировать по', Filter: 'Фильтр',
  'Project settings': 'Настройки проекта', Rename: 'Переименовать', 'Hide from list': 'Скрыть из списка',
  'Customize list': 'Настроить список', Remove: 'Убрать', Delete: 'Удалить', 'Copy link': 'Копировать ссылку',
  'Customize actions': 'Настроить действия', Sections: 'Разделы', 'By project': 'По проекту', Custom: 'Свой вариант',
  Sort: 'Сортировка', 'Updated at': 'Обновлено', 'Created at': 'Дата создания',
  'Created at, descending. Sort ascending': 'Дата создания, по убыванию. Сортировать по возрастанию',
  Active: 'Активные', 'Keep at least one filter selected': 'Нужен хотя бы один фильтр',
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

const owner = (plugin = 'thread-list') => `data-bb-plugin-root data-bb-plugin="${plugin}" data-bb-portaled-overlay`;
const svg = (icon: string) => `<svg data-icon="${icon}" data-icon-root aria-hidden="true"></svg>`;
const item = (icon: string, label: string, extra = '') => `<div role="menuitem" ${extra}>${svg(icon)}${label}</div>`;
const sub = (id: string, icon: string, label: string) =>
  `<div role="menuitem" id="${id}" aria-haspopup="menu" aria-expanded="false">${svg(icon)}${label}${svg('ChevronRight')}</div>`;
const sep = '<div role="separator" aria-orientation="horizontal"></div>';
const settingsLink = '<a href="/settings/projects/proj_1" role="menuitem">' + svg('Settings') + 'Project settings</a>';
const tail = `${settingsLink}${item('Edit', 'Rename')}${sep}${item('EyeOff', 'Hide from list')}${item('FilterHorizontal', 'Customize list')}${sep}${item('Trash2', 'Remove')}`;
const projectMenu = (plugin = 'thread-list') =>
  `<div role="menu" ${owner(plugin)} id="actions" aria-label="Мои дела actions">${tail}</div>`;
const headerMenu = (plugin = 'thread-list') =>
  `<div role="menu" ${owner(plugin)} id="m">${item('SectionAdd', 'New section')}${sep}${sub('s1', 'Layers', 'Organize')}${sub('s2', 'ArrowUpDown', 'Sort by')}${sub('s3', 'SlidersHorizontal', 'Filter')}${sep}${tail}</div>`;
const organize = (plugin = 'thread-list', by = 's1') => `<div role="menu" ${owner(plugin)} aria-labelledby="${by}" id="org">
  <div role="group" aria-label="Sections"><div>Sections</div>
    <div role="menuitemradio" aria-checked="true">By project<span>${svg('Check')}</span></div>
    <div role="menuitemradio" aria-checked="false">Custom<span></span></div></div></div>`;
const sort = (by = 's2') => `<div role="menu" ${owner()} aria-labelledby="${by}" id="sort"><div role="group" aria-label="Sort">
  <div role="menuitemradio" aria-checked="false" aria-label="Updated at">Updated at<span></span></div>
  <div role="menuitemradio" aria-checked="true" aria-label="Created at, descending. Sort ascending">Created at<span class="sr-only">, descending. Sort ascending</span><span>${svg('ArrowDown')}</span></div></div></div>`;
const filter = (by = 's3') => `<div role="menu" ${owner()} aria-labelledby="${by}" id="flt"><div role="group" aria-label="Filter">
  <div role="menuitemcheckbox" aria-checked="true" title="Keep at least one filter selected">Active<span>${svg('Check')}</span></div></div></div>`;
const text = (selector: string) => [...document.querySelectorAll(`${selector} > [role="menuitem"]`)]
  .map(node => node.textContent);

it('translates the direct entries of the sidebar header menu', async () => {
  mount(headerMenu());
  await settle();
  expect(text('#m')).toEqual(['Новый раздел', 'Упорядочить', 'Сортировать по', 'Фильтр', 'Настройки проекта',
    'Переименовать', 'Скрыть из списка', 'Настроить список', 'Убрать']);
});

it('translates the project actions menu opened by a right click and keeps the project name label', async () => {
  mount(projectMenu());
  await settle();
  expect(text('#actions')).toEqual(['Настройки проекта', 'Переименовать', 'Скрыть из списка', 'Настроить список', 'Убрать']);
  expect(document.querySelector('#actions')!.getAttribute('aria-label')).toBe('Мои дела actions');
});

it('translates the Organize, Sort by and Filter submenus, groups and tooltips', async () => {
  mount(headerMenu() + organize() + sort() + filter());
  await settle();
  const org = document.querySelector('#org')!;
  expect(org.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Разделы');
  expect(org.querySelector('[role="group"] > div')!.textContent).toBe('Разделы');
  expect([...org.querySelectorAll('[role="menuitemradio"]')].map(node => node.firstChild!.textContent)).toEqual(['По проекту', 'Свой вариант']);
  const radios = [...document.querySelectorAll('#sort [role="menuitemradio"]')];
  expect(document.querySelector('#sort [role="group"]')!.getAttribute('aria-label')).toBe('Сортировка');
  expect(radios.map(node => node.firstChild!.textContent)).toEqual(['Обновлено', 'Дата создания']);
  expect(radios[1].getAttribute('aria-label')).toBe('Дата создания, по убыванию. Сортировать по возрастанию');
  const filterItem = document.querySelector('#flt [role="menuitemcheckbox"]')!;
  expect(filterItem.firstChild!.textContent).toBe('Активные');
  expect(filterItem.getAttribute('title')).toBe('Нужен хотя бы один фильтр');
});

it('keeps the original aria-label for other plugins while translated', async () => {
  const dispose = mount(headerMenu() + sort());
  await settle();
  const radio = document.querySelectorAll('#sort [role="menuitemradio"]')[1];
  expect(radio.getAttribute('data-rus-original-aria-label')).toBe('Created at, descending. Sort ascending');
  dispose();
  expect(radio.hasAttribute('data-rus-original-aria-label')).toBe(false);
  expect(radio.getAttribute('aria-label')).toBe('Created at, descending. Sort ascending');
  expect(document.querySelector('#m')!.textContent).toContain('New section');
});

it('keeps Remove of a project and Delete of a thread as different words', async () => {
  mount(`${projectMenu()}<div role="menu" ${owner()} id="row">${item('Copy', 'Copy link')}${item('Trash', 'Delete')}${item('Edit', 'Customize actions')}</div>`);
  await settle();
  expect(text('#actions').at(-1)).toBe('Убрать');
  expect(text('#row')).toEqual(['Копировать ссылку', 'Удалить', 'Настроить действия']);
});

it('does not translate menus of other owners or menus without a project signature', async () => {
  mount(`${headerMenu('some-plugin')}${organize('some-plugin')}
    <div role="menu" ${owner()} id="plain">${item('Edit', 'Rename')}${item('Trash2', 'Remove')}${sub('s9', 'Layers', 'Organize')}</div>
    <div role="menu" ${owner()} aria-labelledby="s9" id="orphan"><div role="menuitemradio">By project</div></div>`);
  await settle();
  expect(text('#m')[0]).toBe('New section');
  expect(document.querySelector('#org [role="menuitemradio"]')!.firstChild!.textContent).toBe('By project');
  expect(text('#plain')).toEqual(['Rename', 'Remove', 'Organize']);
  expect(document.querySelector('#orphan')!.textContent).toBe('By project');
});

it('does not open a submenu that no admitted item labels', async () => {
  mount(`${headerMenu()}${organize('thread-list', 'unrelated')}`);
  await settle();
  expect(document.querySelector('#org [role="menuitemradio"]')!.firstChild!.textContent).toBe('By project');
});

it('keeps user text and unknown entries of an admitted menu in English', async () => {
  mount(`<div role="menu" ${owner()} id="m">${settingsLink}${item('Edit', 'Мотивация')}${item('Trash2', 'Remove project data')}<div role="menuitem"><span class="truncate">Remove</span></div></div>`);
  await settle();
  expect(text('#m')).toEqual(['Настройки проекта', 'Мотивация', 'Remove project data', 'Remove']);
});

it('does not touch a project row or a thread titled like a menu entry', async () => {
  mount(`${headerMenu()}<div data-sidebar-project-id="p"><span class="truncate" title="Remove">Remove</span></div>
    <a href="/projects/p/threads/t"><span class="truncate">Filter</span></a>`);
  await settle();
  expect(document.querySelector('[data-sidebar-project-id] span')!.textContent).toBe('Remove');
  expect(document.querySelector('a span')!.textContent).toBe('Filter');
});
