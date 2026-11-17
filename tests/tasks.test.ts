import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

// Shapes below follow the shipped Tasks UI, including compact menu buttons.
const words = {
  Done: 'Готово', Cancel: 'Отмена', Save: 'Сохранить', Settings: 'Настройки',
  Activity: 'Действия', 'No activity yet.': 'Действий нет.', Properties: 'Свойства',
  Labels: 'Метки', Project: 'Проект', Agents: 'Агенты', 'Dispatch target': 'Цель запуска',
  'none active': 'Активных нет', Manage: 'Управление',
  'Labels, agent presets, and folders.': 'Метки, пресеты и папки.',
  Presets: 'Пресеты', Folders: 'Папки', Name: 'Название', Provider: 'Провайдер',
  'Edit labels': 'Изменить метки', 'Move to project': 'Переместить в проект',
  'Attach file': 'Прикрепить файл', Comment: 'Комментарий', Dismiss: 'Закрыть',
  'Task title': 'Название задачи', 'Label name': 'Название метки',
  'Add labels…': 'Добавить метки…', 'Choose status…': 'Выбрать статус…',
  'Choose project…': 'Выбрать проект…', 'Extra instructions prepended to dispatched threads': 'Инструкции для запуска',
  'Delete label': 'Удалить метку', 'Detach thread?': 'Отсоединить тред?',
  'New preset': 'Новый пресет',
  'Presets pick the provider, model, and guardrails for dispatched threads.': 'Параметры запуска тредов.',
  Status: 'Статус', Priority: 'Приоритет', Label: 'Метка', Sort: 'Сортировка',
  Manual: 'Вручную', 'Due date': 'Срок', Created: 'Создано', Updated: 'Обновлено',
  'No matching projects.': 'Нет подходящих проектов.',
};
const disposers: (() => void)[] = [];
const icon = (name: string) => `<svg data-icon="${name}" aria-hidden="true"></svg>`;
const enumIcon = '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6"/></svg>';
const tasks = (body: string, attrs = '') => `<div data-bb-plugin-root data-bb-plugin="tasks" ${attrs}>${body}</div>`;
function mount(body: string) {
  document.body.innerHTML = body;
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  return dispose;
}
function get(selector: string) { return document.querySelector(selector)!; }
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; });

const activity = (entries = '<div class="text-xs text-muted-foreground">No activity yet.</div>') => `
  <section aria-label="Activity"><div class="mt-6 border-t border-border-hairline"></div>
    <h2 class="pb-3 pt-4 text-sm font-semibold">Activity</h2><div class="relative">${entries}</div>
    <div class="mt-3.5 rounded-lg"><div class="bb-tasks-editor" contenteditable="true">Settings</div>
      <div class="mt-2 flex items-center gap-1.5"><button aria-label="Attach file">${icon('Paperclip')}</button>
        <button aria-label="Comment">${icon('ArrowUp')}</button></div></div>
  </section>`;

it('translates Activity and Properties leaves without granting their data branches', () => {
  mount(tasks(`${activity()}<aside><h2>Properties</h2><div class="mb-1 mt-3 text-2xs font-semibold">Labels</div>
    <div class="flex flex-wrap"><span><span aria-hidden="true" style="background:red"></span>Done</span></div>
    <div class="mb-1 mt-3 text-2xs font-semibold">Project</div>
    <button aria-label="Move to project"><span class="truncate">Settings</span></button>
    <div class="mb-1 mt-3 text-2xs font-semibold">Dispatch target</div>
    <div class="mb-1 mt-3 text-2xs font-semibold">Agents</div><div class="flex flex-col"><span class="text-muted-foreground">none active</span></div></aside>`));
  expect(get('section').getAttribute('aria-label')).toBe('Действия');
  expect(get('section h2').textContent).toBe('Действия');
  expect(get('section > .relative > div').textContent).toBe('Действий нет.');
  expect(get('aside h2').textContent).toBe('Свойства');
  expect(get('aside > div.flex-wrap').textContent).toBe('Done');
  expect(get('aside button').getAttribute('aria-label')).toBe('Переместить в проект');
  expect(get('aside button span').textContent).toBe('Settings');
  expect(get('[aria-label="Комментарий"]').textContent).toBe('');
  expect(get('[contenteditable]').textContent).toBe('Settings');
});

it.each(['Done', 'Cancel', 'Save', 'Settings'])('keeps %s as task titles, keys, comment authors, labels and preset metadata', word => {
  const entries = `<div class="relative mb-3.5 flex gap-2.5"><div class="min-w-0 flex-1">
    <div class="mb-0.5 flex items-baseline gap-1.5 text-xs"><span class="font-semibold">${word}</span>
      <span class="rounded-sm bg-secondary px-1 py-px text-2xs font-semibold text-muted-foreground">${word}</span></div>
    <div class="bb-tasks-editor" contenteditable="false"><p>${word}</p><button>${word}</button></div></div></div>`;
  mount(tasks(`<h1 contenteditable="true" role="textbox" aria-label="Task title">${word}</h1>
    <div data-task-key="${word}"><button><span class="shrink-0 text-xs">${word}</span><span class="truncate">${word}</span></button></div>
    ${activity(entries)}<aside><div class="flex flex-wrap"><span><span style="background:red"></span>${word}</span></div></aside>
    <div class="space-y-3"><div class="divide-y"><div class="px-3 py-2"><div class="group flex items-center gap-2">
      <span class="flex-1 text-sm">${word}</span><button aria-label="Edit label ${word}">${icon('Edit')}</button></div></div></div></div>
    <table><tbody><tr><td><span class="flex items-center gap-2">${icon('Bot')}${word}</span></td><td>${word}</td><td>${word}</td></tr></tbody></table>`));
  expect(get('h1').textContent).toBe(word);
  expect(get('h1').getAttribute('aria-label')).toBe('Task title');
  expect(get('[data-task-key]').textContent).toBe(word + word);
  expect(get('.font-semibold:not(h1,h2)').textContent).toBe(word);
  expect(get('.rounded-sm.bg-secondary').textContent).toBe(word);
  expect(get('.bb-tasks-editor p').textContent).toBe(word);
  expect(get('.bb-tasks-editor button').textContent).toBe(word);
  expect(get('aside span').textContent).toBe(word);
  expect(get('.group > span').textContent).toBe(word);
  expect(get('tbody').textContent).toBe(word.repeat(3));
});

it.each(['Done', 'Cancel', 'Save', 'Settings'])('preserves %s in filter selections and compact label menus', word => {
  mount(tasks(`<button class="h-6 border" aria-haspopup="menu">${icon('ListTodo')}Label<span class="max-w-48 truncate font-medium">${word}</span></button>
    <div role="menu"><button role="menuitemcheckbox" aria-checked="true"><span class="absolute right-2"></span><span class="flex items-center gap-2"><span aria-hidden="true" class="size-2 rounded-full" style="background:red"></span>${word}</span></button></div>`));
  expect(get('button[aria-haspopup]').firstChild?.nextSibling?.textContent).toBe('Метка');
  expect(get('button[aria-haspopup] .truncate').textContent).toBe(word);
  expect(get('[role="menuitemcheckbox"]').textContent).toBe(word);
});

it.each(['Done', 'Cancel', 'Save', 'Settings'])('preserves %s in cmdk labels, project options and dispatch menus', word => {
  mount(tasks(`<div cmdk-root><input cmdk-input placeholder="Add labels…"><div cmdk-list role="listbox"><div cmdk-group><div cmdk-group-items>
    <div cmdk-item role="option" data-value="${word}"><span style="background:red"></span><span class="flex-1">${word}</span></div></div></div></div></div>
    <div cmdk-root><input cmdk-input placeholder="Choose project…"><div cmdk-item role="option" data-value="done"><span class="flex-1">${word}</span></div></div>
    <div role="listbox"><div role="option" tabindex="0"><span class="absolute right-2"></span><span>${word}</span></div></div>
    <div role="menu"><button role="menuitem"><span class="min-w-0 flex-1 truncate">${word}</span><span class="text-xs text-muted-foreground">${word}</span></button></div>`));
  expect([...document.querySelectorAll('[role="option"]')].map(node => node.textContent)).toEqual([word, word, word]);
  expect(get('[role="menuitem"]').textContent).toBe(word + word);
});

it.each(['Done', 'Cancel', 'Save', 'Settings'])('keeps %s toast errors and attachment titles while translating Dismiss', word => {
  mount(tasks(`<div class="pointer-events-none fixed inset-x-0 bottom-4 z-50"><div role="status" class="pointer-events-auto flex">
    ${icon('AlertCircle')}<span class="min-w-0 flex-1">${word}</span><button aria-label="Dismiss">${icon('X')}</button></div></div>
    <figure><button aria-label="View ${word}" title="${word}"><img alt="${word}"></button><figcaption class="truncate" title="${word}">${word}</figcaption></figure>
    <a title="${word}"><span class="truncate">${word}</span></a>`));
  expect(get('[role="status"] > span').textContent).toBe(word);
  expect(get('[role="status"] button').getAttribute('aria-label')).toBe('Закрыть');
  expect(get('figure button').getAttribute('title')).toBe(word);
  expect(get('figure button').getAttribute('aria-label')).toBe(`View ${word}`);
  expect(get('figcaption').getAttribute('title')).toBe(word);
  expect(get('a').getAttribute('title')).toBe(word);
});

it('translates only enum options identified by the status command and enum icons', () => {
  mount(tasks(`<div cmdk-root><input cmdk-input placeholder="Choose status…"><div cmdk-item role="option" data-value="done"><span class="flex-1 truncate">Done</span></div>
    <div cmdk-item role="option" data-value="custom"><span class="flex-1 truncate">Settings</span></div></div>
    <button aria-haspopup="menu">${enumIcon}Done</button><div role="menu"><div role="menuitem">${enumIcon}Done</div></div>`));
  expect(get('[data-value="done"]').textContent).toBe('Готово');
  expect(get('[data-value="custom"]').textContent).toBe('Settings');
  expect(get('button[aria-haspopup]').textContent).toBe('Готово');
  expect(get('[role="menuitem"]').textContent).toBe('Готово');
});

it('restores a translated enum leaf when the command hint or option value changes', async () => {
  mount(tasks('<div cmdk-root><input cmdk-input placeholder="Choose status…"><div cmdk-item role="option" data-value="done"><span class="flex-1 truncate">Done</span></div></div>'));
  const option = get('[cmdk-item]');
  expect(option.textContent).toBe('Готово');
  option.setAttribute('data-value', 'custom');
  await settle();
  expect(option.textContent).toBe('Done');
  option.querySelector('span')!.textContent = 'Settings';
  await settle();
  expect(option.textContent).toBe('Settings');
  option.setAttribute('data-value', 'done');
  option.querySelector('span')!.textContent = 'Done';
  await settle();
  expect(option.textContent).toBe('Готово');
  get('input').setAttribute('placeholder', 'Choose project…');
  await settle();
  expect(option.textContent).toBe('Done');
});

it('translates the complete fixed sort menu while keeping colored label choices intact', () => {
  const labels = ['Manual', 'Priority', 'Due date'];
  mount(tasks(`<div id="sort" role="menu">${labels.map(label => `<button role="menuitemcheckbox" aria-checked="false"><span class="absolute right-2"></span>${label}</button>`).join('')}</div>
    <div id="labels" role="menu">${labels.map(label => `<button role="menuitemcheckbox" aria-checked="false"><span class="absolute right-2"></span><span class="flex items-center gap-2"><span style="background:red"></span>${label}</span></button>`).join('')}</div>`));
  expect([...document.querySelectorAll('#sort button')].map(node => node.textContent)).toEqual(['Вручную', 'Приоритет', 'Срок']);
  expect([...document.querySelectorAll('#labels button')].map(node => node.textContent)).toEqual(labels);
});

it('translates Manage header, tabs and table headers while preserving rows', () => {
  mount(tasks(`<div class="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4"><header class="space-y-1"><h2>Manage</h2><p>Labels, agent presets, and folders.</p></header>
    <div><div role="tablist"><button role="tab" id="tabs-trigger-labels">Labels</button><button role="tab" id="tabs-trigger-presets">Presets</button><button role="tab" id="tabs-trigger-folders">Folders</button></div>
    <div role="tabpanel"><table><thead><tr><th>Name</th><th>Provider</th></tr></thead><tbody><tr><td>Settings</td><td>Save</td></tr></tbody></table></div></div></div>`));
  expect(get('header h2').textContent).toBe('Управление');
  expect([...document.querySelectorAll('[role="tab"]')].map(node => node.textContent)).toEqual(['Метки', 'Пресеты', 'Папки']);
  expect([...document.querySelectorAll('th')].map(node => node.textContent)).toEqual(['Название', 'Провайдер']);
  expect(get('tbody').textContent).toBe('SettingsSave');
});

it('keeps dynamic confirmation headers and descriptions but translates footer actions', () => {
  mount(tasks(`<div class="flex flex-col space-y-1.5"><h2 id="title">Delete label “Settings”?</h2><p id="description">Settings</p></div>
    <div class="flex flex-col-reverse gap-2"><button class="border">Cancel</button><button class="bg-destructive">Delete label</button></div>`, 'data-bb-portaled-overlay role="dialog" aria-labelledby="title" aria-describedby="description"'));
  expect(get('h2').textContent).toBe('Delete label “Settings”?');
  expect(get('p').textContent).toBe('Settings');
  expect([...document.querySelectorAll('button')].map(node => node.textContent)).toEqual(['Отмена', 'Удалить метку']);
});

it('resolves static dialog labels by their relationship and leaves host replacements alone on disposal', async () => {
  const dispose = mount(tasks(`<div><h2 id="title">New preset</h2><p id="description">Presets pick the provider, model, and guardrails for dispatched threads.</p></div><div class="flex flex-col-reverse gap-2"><button>Cancel</button></div>`, 'data-bb-portaled-overlay role="dialog" aria-labelledby="title" aria-describedby="description"'));
  expect(get('h2').textContent).toBe('Новый пресет');
  get('h2').textContent = 'Settings';
  get('button').textContent = 'Save';
  await settle();
  expect(get('h2').textContent).toBe('Settings');
  expect(get('button').textContent).toBe('Сохранить');
  get('p').textContent = 'Host replacement';
  dispose();
  expect(get('button').textContent).toBe('Save');
  expect(get('p').textContent).toBe('Host replacement');
});

it('restores translated leaves and aria when their identity markers disappear', async () => {
  mount(tasks(activity()));
  const section = get('section');
  section.removeAttribute('aria-label');
  await settle();
  expect(get('h2').textContent).toBe('Activity');
  expect(get('section > .relative').textContent).toBe('No activity yet.');
  get('[data-bb-plugin-root]').setAttribute('data-bb-plugin', 'unknown');
  await settle();
  expect(get('button').getAttribute('aria-label')).toBe('Attach file');
});

it.each(['<div data-message-column>', '<div contenteditable="true">', '<div data-rus-ignore>', '<div class="truncate">', '<div data-bb-plugin-root data-bb-plugin="unknown">'])('keeps reviewed Tasks leaves blocked under %s', ancestor => {
  mount(`${ancestor}${tasks(activity())}</div>`);
  expect(get('h2').textContent).toBe('Activity');
  expect(get('section').getAttribute('aria-label')).toBe('Activity');
  expect(get('button').getAttribute('aria-label')).toBe('Attach file');
});

it('does not let an inner unknown plugin borrow Tasks grants or dialog relationships', () => {
  mount(tasks(`<div data-bb-plugin-root data-bb-plugin="unknown">${activity()}<button>Save</button></div>`));
  expect(get('h2').textContent).toBe('Activity');
  expect(get('button').getAttribute('aria-label')).toBe('Attach file');
  expect([...document.querySelectorAll('button')].at(-1)!.textContent).toBe('Save');
});

it('restores Tasks text when an enclosing ancestor becomes truncated after mount', async () => {
  mount(`<div id="outer">${tasks(activity())}</div>`);
  expect(get('h2').textContent).toBe('Действия');
  get('#outer').className = 'truncate';
  await settle();
  expect(get('h2').textContent).toBe('Activity');
  expect(get('section').getAttribute('aria-label')).toBe('Activity');
});

it('translates native hints without reading values or textarea content and restores on a protected move', async () => {
  document.body.innerHTML = tasks(`<input aria-label="Task title" placeholder="Task title" title="Settings" value="Done">
    <textarea placeholder="Extra instructions prepended to dispatched threads">Cancel</textarea>`);
  const input = get('input') as HTMLInputElement;
  const textarea = get('textarea') as HTMLTextAreaElement;
  for (const element of [input, textarea]) {
    for (const property of ['value', 'defaultValue']) Object.defineProperty(element, property, {
      configurable: true, get() { throw new Error(`must not read ${property}`); }, set() { throw new Error(`must not write ${property}`); },
    });
  }
  Object.defineProperty(textarea, 'textContent', { configurable: true, get() { throw new Error('must not read textarea text'); }, set() { throw new Error('must not write textarea text'); } });
  const dispose = mountTranslator(document, words); disposers.push(dispose);
  expect(input.getAttribute('aria-label')).toBe('Название задачи');
  expect(input.getAttribute('placeholder')).toBe('Название задачи');
  expect(input.getAttribute('value')).toBe('Done');
  expect(input.getAttribute('title')).toBe('Settings');
  expect(textarea.getAttribute('placeholder')).toBe('Инструкции для запуска');
  expect(textarea.firstChild!.nodeValue).toBe('Cancel');
  input.setAttribute('placeholder', 'Host hint');
  const protectedRoot = document.createElement('div'); protectedRoot.setAttribute('data-message-column', '');
  get('[data-bb-plugin-root]').append(protectedRoot); protectedRoot.append(input);
  await settle();
  expect(input.getAttribute('aria-label')).toBe('Task title');
  expect(input.getAttribute('placeholder')).toBe('Host hint');
  dispose();
  expect(textarea.getAttribute('placeholder')).toBe('Extra instructions prepended to dispatched threads');
  expect(textarea.firstChild!.nodeValue).toBe('Cancel');
});

it('translates a sort menu whose portal is itself the plugin root, then restores on a missing item', async () => {
  mount(tasks('<button role="menuitemcheckbox">Manual</button><button role="menuitemcheckbox">Priority</button><button role="menuitemcheckbox">Due date</button>', 'data-bb-portaled-overlay role="menu"'));
  const first = get('button');
  expect(first.textContent).toBe('Вручную');
  document.querySelectorAll('button')[2]!.removeAttribute('role');
  await settle();
  expect(first.textContent).toBe('Manual');
});

it('translates a status group while preserving an identically named adjacent task and restores the group on marker removal', async () => {
  mount(tasks('<div data-status-group-header="done">Done<span>1</span></div><div data-task-key="NASTR-1"><span class="truncate">Done</span></div>'));
  const group = get('[data-status-group-header]');
  expect(group.textContent).toBe('Готово1');
  expect(get('[data-task-key]').textContent).toBe('Done');
  group.removeAttribute('data-status-group-header');
  await settle();
  expect(group.textContent).toBe('Done1');
});

it('translates the empty Labels trigger and restores it when it becomes an untruncated selected name', async () => {
  mount(tasks(`<button class="h-7 border-input font-normal" aria-haspopup="dialog">${icon('Plus')}Labels</button>`));
  const trigger = get('button');
  expect(trigger.textContent).toBe('Метки');
  trigger.innerHTML = '<span><span aria-hidden="true" style="background:red"></span></span>Done';
  await settle();
  expect(trigger.textContent).toBe('Done');
  trigger.innerHTML = `${icon('Plus')}Labels`;
  await settle();
  expect(trigger.textContent).toBe('Метки');
});
