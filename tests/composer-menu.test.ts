import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  'Attach files': 'Прикрепить файлы', Skills: 'Навыки', Plan: 'План', Automation: 'Автоматизация',
  'Prompts…': 'Промпты…', Plugin: 'Плагин', 'Prompt actions': 'Действия с промптом', Settings: 'Настройки',
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

const icon = (name: string) => `<svg data-icon="${name}" data-icon-root></svg>`;
const item = (name: string, label: string) => `<div role="menuitem">${icon(name)}${label}</div>`;
const wrapped = (plugin: string, name: string, label: string) =>
  `<div data-bb-plugin-root data-bb-plugin="${plugin}">${item(name, label)}</div>`;
const menu = (inner: string, plugin = 'bb--composer', label = 'Prompt actions') =>
  `<div role="menu" data-bb-plugin-root data-bb-plugin="${plugin}" data-bb-portaled-overlay aria-label="${label}" id="m">${inner}</div>`;
const texts = () => [...document.querySelectorAll('#m [role="menuitem"]')].map(node => node.textContent);

it('translates the built-in and bundled plugin entries of the prompt actions menu', async () => {
  mount(menu(`${item('Paperclip', 'Attach files')}<div role="separator"></div>${item('Zap', 'Skills')}${item('ListTodo', 'Plan')}
    ${wrapped('automations', 'Repeat', 'Automation')}${wrapped('bb--prompt-library', 'Clock', 'Prompts…')}${wrapped('bb-guide', 'Plug02', 'Plugin')}`));
  await settle();
  expect(texts()).toEqual(['Прикрепить файлы', 'Навыки', 'План', 'Автоматизация', 'Промпты…', 'Плагин']);
});

it('keeps unknown entries, user text and other menus in English', async () => {
  mount(menu(`${item('Paperclip', 'Settings')}${wrapped('mine', 'Zap', 'Skills')}
    <div data-bb-plugin-root data-bb-plugin="mine">${item('Zap', 'Plan')}${item('Zap', 'Plan')}</div>
    <div role="menuitem"><span class="truncate">Plan</span></div>`)
    + menu(item('Paperclip', 'Attach files'), 'unknown').replace('id="m"', 'id="o"')
    + menu(item('Paperclip', 'Attach files'), 'bb--composer', 'Something else').replace('id="m"', 'id="e"'));
  await settle();
  expect(texts()).toEqual(['Settings', 'Навыки', 'Plan', 'Plan', 'Plan']);
  expect(document.querySelector('#o')!.textContent).toBe('Attach files');
  expect(document.querySelector('#e')!.textContent).toBe('Attach files');
});

it('restores the English labels on dispose', async () => {
  const dispose = mount(menu(item('Paperclip', 'Attach files')));
  await settle();
  expect(texts()).toEqual(['Прикрепить файлы']);
  dispose();
  expect(texts()).toEqual(['Attach files']);
});
