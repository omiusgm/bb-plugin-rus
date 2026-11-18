import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';
import dictionary from '../dict/ru.json';

const disposers: (() => void)[] = [];
function mount(html: string) {
  document.body.innerHTML = html;
  disposers.push(mountTranslator(document, dictionary as Record<string, string>));
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });
const svg = (icon: string) => `<svg data-icon="${icon}" data-icon-root></svg>`;
const q = (selector: string) => document.querySelector(selector)!;

const row = (icon: string, label: string, value: string) =>
  `<div><dt><span>${svg(icon)}<span>${label}</span></span></dt><dd>${value}</dd></div>`;
const panel = (names: { project?: string; machine?: string } = {}) => `<aside><div data-bb-plugin-root data-bb-plugin="core"><dl>
  ${row('UserRound', 'Parent', '<div><a href="/projects/p/threads/t0"><span title="Родитель-тред"><span>Родитель-тред</span></span></a><button type="button" aria-label="Clear parent thread">' + svg('X') + '</button></div>')}
  ${row('Megaphone02', 'Notify parent', '<button type="button" aria-label="Notify parent" aria-haspopup="menu"><span title="Notify parent: Auto - Every finished turn, failure, and blocker"><span>Auto</span></span></button>')}
  ${row('Folder', 'Project', `<span title="${names.project ?? 'Мой проект'}">${names.project ?? 'Мой проект'}</span>`)}
  ${row('Folder', 'Environment', '<span><span title="Project checkout">Project checkout</span><button type="button" aria-label="New thread in environment">' + svg('MessageSquarePlus') + '</button></span>')}
  ${row('Laptop', 'Machine', `<span title="${names.machine ?? 'MacBook Pro'} (connected)"><span>${names.machine ?? 'MacBook Pro'}</span></span>`)}
  ${row('FolderOpen', 'Directory', '<div><button type="button" aria-label="Copy directory"><span title="/home/x/p"><span>~/p</span></span></button></div>')}
</dl></div></aside>`;

it('translates the six row labels and the two fixed values of the details panel', async () => {
  mount(panel());
  await settle();
  expect([...document.querySelectorAll('dt')].map(dt => dt.textContent))
    .toEqual(['Родитель', 'Сообщать', 'Проект', 'Окружение', 'Компьютер', 'Папка']);
  expect(q('button[aria-label="Notify parent"] span[title] > span').textContent).toBe('Авто');
  expect(q('span[title="Рабочая копия проекта"]').textContent).toBe('Рабочая копия проекта');
});

it('leaves names and paths of the panel untouched', async () => {
  mount(panel({ project: 'Project', machine: 'Machine' }));
  await settle();
  const values = [...document.querySelectorAll('dd')].map(dd => dd.textContent);
  expect(values[0]).toContain('Родитель-тред');
  expect(values[2]).toBe('Project');
  expect(values[4]).toBe('Machine');
  expect(values[5]).toBe('~/p');
  expect(q('button[aria-label="Notify parent"] span[title]').getAttribute('title')).toBe('Notify parent: Auto - Every finished turn, failure, and blocker');
  expect(q('a span[title]').getAttribute('title')).toBe('Родитель-тред');
});

it('does not translate lookalike labels outside the core panel or in other leaves', async () => {
  mount(`<div data-bb-plugin-root data-bb-plugin="foreign"><dl>${row('Folder', 'Project', 'x')}</dl></div>
    <div data-bb-plugin-root data-bb-plugin="core"><dl><div><dt><span>${svg('Folder')}<span>Project <b>x</b></span></span></dt><dd><span><span title="Project checkout">Project checkout (copy)</span></span></dd></div></dl></div>`);
  await settle();
  expect(q('[data-bb-plugin="foreign"] dt').textContent).toBe('Project');
  expect(q('[data-bb-plugin="core"] dt').textContent).toBe('Project x');
  expect(q('[data-bb-plugin="core"] dd').textContent).toBe('Project checkout (copy)');
});

const projectButton = (label: string) => `<div data-app-composer data-promptbox-shell><button type="button" aria-label="Project: ${label}" data-promptbox-project-control><span>${svg('Folder')}<span class="truncate" data-promptbox-full-label>${label}</span><span class="truncate" data-promptbox-compact-label>${label}</span></span></button></div>`;

it('translates No project in the composer, keeps a selected project name', async () => {
  mount(projectButton('No project') + projectButton('Мой проект') + projectButton('Project'));
  await settle();
  const buttons = [...document.querySelectorAll('button')];
  expect([...buttons[0]!.querySelectorAll('span.truncate')].map(s => s.textContent)).toEqual(['Без проекта', 'Без проекта']);
  expect(buttons[0]!.getAttribute('aria-label')).toBe('Project: No project');
  expect([...buttons[1]!.querySelectorAll('span.truncate')].map(s => s.textContent)).toEqual(['Мой проект', 'Мой проект']);
  expect([...buttons[2]!.querySelectorAll('span.truncate')].map(s => s.textContent)).toEqual(['Project', 'Project']);
});

const working = (text: string, extra = '') => `<div data-page-scroll-viewport><div data-scroll-attached>${extra}<div class="mt-4"><span class="animate-shine">${text}</span></div></div></div>`;

it('translates the Working... line only as a lone leaf outside messages', async () => {
  mount(working('Working...') + `<div data-page-scroll-viewport><div data-message-id="m1"><div><span class="animate-shine">Working...</span></div></div></div>
    <div data-page-scroll-viewport><div><span class="animate-shine">Working... hard</span></div></div>
    <div data-page-scroll-viewport><div><span class="animate-shine">Working...</span><span>x</span></div></div>`);
  await settle();
  const spans = [...document.querySelectorAll('span.animate-shine')].map(s => s.textContent);
  expect(spans).toEqual(['Выполняется...', 'Working...', 'Working... hard', 'Working...']);
});

const chip = (word: string, link = '<a href="/projects/p/threads/t0"><span>Тред-родитель</span></a>') =>
  `<div data-app-composer data-promptbox-shell><section aria-label="Thread context before sending"><div title="${word} Тред-родитель"><span>${word} ${link}</span></div></section></div>`;

it('translates the Parent chip word, not the thread link', async () => {
  mount(chip('Parent') + chip('Parent', '<a href="/projects/p/threads/t1"><span>Project</span></a>'));
  await settle();
  const chips = [...document.querySelectorAll('section span')].filter(s => s.parentElement?.matches('div[title]'));
  expect(chips[0]!.textContent).toBe('Родитель Тред-родитель');
  expect(chips[1]!.textContent).toBe('Родитель Project');
});

it('translates the Open new tab and Hide right panel tooltips and keeps the original label', async () => {
  mount(`<div role="toolbar"><button type="button" data-panel-new-tab aria-label="Open new tab (⌘ T)" aria-keyshortcuts="Meta+T">${svg('Plus')}</button></div>
    <aside><button type="button" aria-label="Hide right panel (⌘ J)" aria-keyshortcuts="Meta+J">${svg('PanelRight')}</button></aside>`);
  await settle();
  expect(q('[data-panel-new-tab]').getAttribute('aria-label')).toBe('Открыть новую вкладку (⌘ T)');
  expect(q('[data-panel-new-tab]').getAttribute('data-rus-original-aria-label')).toBe('Open new tab (⌘ T)');
  expect(q('aside button').getAttribute('aria-label')).toBe('Скрыть правую панель (⌘ J)');
  expect(q('aside button').getAttribute('data-rus-original-aria-label')).toBe('Hide right panel (⌘ J)');
});
