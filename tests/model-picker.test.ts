import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  Model: 'Модель', Models: 'Модели', Reasoning: 'Рассуждения', Low: 'Низкий', Medium: 'Средний', Med: 'Сред.',
  High: 'Высокий', Max: 'Макс.', 'Extra High': 'Очень высокий', XHigh: 'Очень высокий',
  'More models': 'Больше моделей', 'Search models': 'Поиск моделей', 'Fast mode': 'Быстрый режим',
  'Handoff to new thread': 'Продолжить в новом треде', Codex: 'Кодекс', 'Opus 5': 'Опус 5',
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

const svg = (name: string) => `<svg data-icon="${name}" data-icon-root></svg>`;
const radio = (label: string, inner = label) =>
  `<button type="button" role="radio" aria-checked="false" aria-label="${label}">${inner}</button>`;
function popover(plugin = 'bb--composer', extra = '') {
  return `<div role="dialog" data-bb-plugin-root data-bb-plugin="${plugin}" data-bb-portaled-overlay id="pop">
  <div><button type="button" title="Codex"><span aria-hidden="true"></span></button></div>
  <div><div>${svg('Search')}<input autocomplete="off" placeholder="Search models" aria-label="Search models" role="combobox" value="Opus 5"></div></div>
  <div><div role="listbox" aria-label="Models"><div>Model</div>
    <button type="button" role="option" aria-selected="false"><span title="Opus 5">Opus 5</span><span>${svg('Check')}</span></button>
    <button type="button" role="option" aria-selected="false"><span title="Max">Max</span></button>
    <button type="button" aria-haspopup="menu" aria-expanded="false"><span>More models</span>${svg('ChevronRight')}</button></div>
  <div><div>Reasoning</div><div role="radiogroup" aria-label="Reasoning">${radio('Low')}${radio('Medium', '<span>Medium</span><span>Med</span>')}${radio('Max')}${radio('Extra High', '<span>Extra High</span><span>XHigh</span>')}${radio('Ultracode')}</div></div>
  <div><div title="Faster responses on supported Opus models."><span>${svg('Zap')}<span>Fast mode</span></span><button aria-label="Fast mode" type="button" role="switch" aria-checked="false"><span></span></button></div></div>
  <div><button type="button">${svg('MessageSquarePlus')}<span class="truncate">Handoff to new thread</span></button></div>${extra}</div></div></div>`;
}
const q = (selector: string) => document.querySelector(selector)!;

it('translates the fixed chrome of the model popover', async () => {
  mount(popover());
  await settle();
  expect(q('[role="listbox"]').getAttribute('aria-label')).toBe('Модели');
  expect(q('[role="listbox"] > div').textContent).toBe('Модель');
  expect(q('[aria-haspopup="menu"] span').textContent).toBe('Больше моделей');
  const input = q('input');
  expect(input.getAttribute('aria-label')).toBe('Поиск моделей');
  expect(input.getAttribute('placeholder')).toBe('Поиск моделей');
  expect(q('[role="radiogroup"]').getAttribute('aria-label')).toBe('Рассуждения');
  expect(q('[role="radiogroup"]').previousElementSibling!.textContent).toBe('Рассуждения');
  expect([...document.querySelectorAll('[role="radio"]')].map(node => node.getAttribute('aria-label')))
    .toEqual(['Низкий', 'Средний', 'Макс.', 'Очень высокий', 'Ultracode']);
  expect([...document.querySelectorAll('[role="radio"]')].map(node => node.textContent))
    .toEqual(['Низкий', 'СреднийСред.', 'Макс.', 'Очень высокийОчень высокий', 'Ultracode']);
  expect(q('[role="switch"]').getAttribute('aria-label')).toBe('Быстрый режим');
  expect(q('[role="switch"]').previousElementSibling!.textContent).toBe('Быстрый режим');
  expect(q('[role="switch"]').parentElement!.getAttribute('title')).toBe('Faster responses on supported Opus models.');
  expect([...document.querySelectorAll('button')].some(node => node.textContent === 'Продолжить в новом треде')).toBe(true);
});

it('never touches model names, provider buttons or the typed query', async () => {
  mount(popover());
  await settle();
  expect([...document.querySelectorAll('[role="option"] span:first-child')].map(node => node.textContent)).toEqual(['Opus 5', 'Max']);
  expect([...document.querySelectorAll('[role="option"] span:first-child')].map(node => node.getAttribute('title'))).toEqual(['Opus 5', 'Max']);
  expect(q('[title="Codex"]')).toBeTruthy();
  expect((q('input') as HTMLInputElement).value).toBe('Opus 5');
});

it('requires the composer plugin and the popover structure', async () => {
  mount(popover('unknown') + `<div role="dialog" data-bb-plugin-root data-bb-plugin="bb--composer"><div role="listbox" aria-label="Models"><div>Model</div></div></div>`);
  await settle();
  expect(document.querySelectorAll('[role="listbox"] > div')[0].textContent).toBe('Model');
  expect(document.querySelectorAll('[role="listbox"] > div')[1].textContent).toBe('Model');
  expect(q('input').getAttribute('placeholder')).toBe('Search models');
});

it('restores the English chrome on dispose', async () => {
  const dispose = mount(popover());
  await settle();
  dispose();
  expect(q('[role="listbox"]').getAttribute('aria-label')).toBe('Models');
  expect(q('input').getAttribute('placeholder')).toBe('Search models');
  expect(q('[role="switch"]').previousElementSibling!.textContent).toBe('Fast mode');
});
