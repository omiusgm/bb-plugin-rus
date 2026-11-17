import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountTranslator } from '../translator';

const words = {
  Settings: 'Настройки', Plugins: 'Плагины', Archived: 'Архив',
  'Archived threads': 'Архив тредов', 'Find and restore archived threads from across your projects.': 'Поиск и восстановление тредов.',
  'Search settings': 'Поиск настроек', Search: 'Поиск',
  'Search archived threads': 'Поиск в архиве', 'Search archived threads…': 'Поиск в архиве…',
  'Search keyboard shortcuts': 'Поиск сочетаний', 'Search shortcuts': 'Найти сочетания',
  'New branch prefix': 'Префикс веток', 'No prefix': 'Без префикса',
  'Automatic variable name': 'Имя переменной', 'Automatic GH_TOKEN value': 'Значение GH_TOKEN',
  'Not available': 'Недоступно', 'Marketplace source': 'Источник каталога',
  'No apps are always allowed.': 'Разрешённых приложений нет.', 'Always allowed': 'Всегда разрешено',
  'Collapse finished turns': 'Сворачивать завершённые ответы',
  'Default:': 'По умолчанию:', 'Defaults:': 'По умолчанию:', Web: 'Браузер', Desktop: 'Приложение',
  'Machine access': 'Доступ к компьютерам', 'Accessing bb from your phone': 'Доступ с телефона',
  'Choose how your devices reach this bb server.': 'Способ подключения устройств.', Ready: 'Готово',
  'Mobile app downloads': 'Загрузка приложений', 'Mobile apps': 'Мобильные приложения',
  'Use bb from your phone': 'Работа с телефона', 'Available through TestFlight': 'Доступно через TestFlight',
  'Download Android APK': 'Скачать APK', Version: 'Версия',
  'Become an early adopter': 'Ранний доступ', 'Only available in the BB desktop app.': 'Доступно в приложении BB.',
  'How machines connect': 'Подключение компьютеров', Online: 'В сети', 'Full Access': 'Полный доступ', server: 'сервер', Medium: 'Средний', High: 'Высокий',
  Installed: 'Установленные', Browse: 'Обзор', 'New automation': 'Новая автоматизация',
  'Search automations': 'Поиск автоматизаций', Filters: 'Фильтры', Sort: 'Сортировка',
  'No automations installed.': 'Автоматизаций нет.', 'Search plugins': 'Поиск плагинов',
};
const disposers: (() => void)[] = [];
function mount(html: string, path = '/') {
  history.replaceState(null, '', path);
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; history.replaceState(null, '', '/'); });

const header = '<div data-app-content-shell><div data-testid="app-page-header-content-row"><div><p class="truncate text-sm font-semibold">Settings</p></div></div></div>';

it('translates fixed settings chrome, preserving installed plugin names and other page titles', () => {
  mount(`${header}<div data-testid="settings-sidebar-body"><div data-sidebar="content"><div><div class="mt-4"><div class="text-xs font-normal leading-5">Plugins</div></div><a href="/settings/plugins/user"><span class="truncate">Settings</span></a></div></div></div>`, '/settings');
  expect(document.querySelector('p')!.textContent).toBe('Настройки');
  expect(document.querySelector('.mt-4')!.textContent).toBe('Плагины');
  expect(document.querySelector('a')!.textContent).toBe('Settings');
  disposers.pop()!();
  mount(header, '/projects/user');
  expect(document.querySelector('p')!.textContent).toBe('Settings');
});

it('keeps the archive heading branch separate from archived project and thread names', () => {
  mount('<section class="space-y-5"><div><h2>Archived threads</h2><p>Find and restore archived threads from across your projects.</p></div><div><section><div><h3 class="truncate">Settings</h3></div><a href="/projects/p/threads/t">Settings</a></section></div></section>', '/settings/archived');
  expect(document.querySelector('h2')!.textContent).toBe('Архив тредов');
  expect(document.querySelector('h3')!.textContent).toBe('Settings');
  expect(document.querySelector('a')!.textContent).toBe('Settings');
});

it('translates only reviewed settings subheadings, empty states and descriptions', () => {
  mount('<section data-settings-anchor="Configuration"><div><div><div><h2>Settings</h2></div></div></div><div><div class="border-t"><div><h3>Collapse finished turns</h3><p>Settings</p></div><div><p>Settings</p></div></div></div></section><div data-settings-anchor="App links"><div><div></div><div><p class="text-subtle-foreground">No apps are always allowed.</p><p class="text-destructive-text">Settings</p><div><p id="allowed">Always allowed</p><ul><li><span>Settings</span></li></ul></div></div></div></div><section data-settings-anchor="Early adopter"><div></div><div><h3>Become an early adopter</h3><p>Settings</p></div></section><section data-settings-anchor="Browsers"><div></div><div><p class="text-subtle-foreground">Only available in the BB desktop app.</p><p class="text-destructive-text">Settings</p></div></section>');
  expect(document.querySelector('h2')!.textContent).toBe('Настройки');
  expect(document.querySelector('h3')!.textContent).toBe('Сворачивать завершённые ответы');
  expect(document.querySelector('.border-t > div:last-child p')!.textContent).toBe('Settings');
  expect(document.querySelector('[data-settings-anchor="App links"] p')!.textContent).toBe('Разрешённых приложений нет.');
  expect(document.getElementById('allowed')!.textContent).toBe('Всегда разрешено');
  expect(document.querySelector('li')!.textContent).toBe('Settings');
  expect([...document.querySelectorAll('.text-destructive-text')].map(e => e.textContent)).toEqual(['Settings', 'Settings']);
  expect(document.querySelector('[data-settings-anchor="Early adopter"] h3')!.textContent).toBe('Ранний доступ');
  expect(document.querySelector('[data-settings-anchor="Browsers"] p')!.textContent).toBe('Доступно в приложении BB.');
});

it('translates shortcut metadata without translating keycaps or shortcut user input', () => {
  mount('<section data-settings-anchor="Keyboard shortcuts"><div aria-label="Default shortcuts for Settings"><span>Defaults:</span><span><span>Web</span><kbd>Settings</kbd></span><span><span>Desktop</span><kbd>High</kbd></span></div><input value="Settings"><div class="truncate">Settings</div></section>');
  expect([...document.querySelectorAll('span span')].map(e => e.textContent)).toEqual(['Браузер', 'Приложение']);
  expect([...document.querySelectorAll('kbd')].map(e => e.textContent)).toEqual(['Settings', 'High']);
  expect(document.querySelector('input')!.value).toBe('Settings');
  expect(document.querySelector('.truncate')!.textContent).toBe('Settings');
});

it('translates mobile downloads and connection chrome while retaining provider messages, URLs and versions', async () => {
  mount('<section aria-label="Mobile app downloads" class="space-y-5"><div><h2>Mobile apps</h2><p>Use bb from your phone</p></div><section aria-label="Accessing bb from your phone"><div><h2>Accessing bb from your phone</h2><p>Choose how your devices reach this bb server.</p></div><div><p class="inline-flex shrink-0 font-medium">Ready</p><p class="break-words">Settings</p></div><div data-bb-plugin-root data-bb-plugin="connect"><h3>Settings</h3><p>Settings</p></div></section><div class="space-y-5"><section><div><div><div><h2>Android</h2></div><p>Available through TestFlight</p></div></div><div><p>Settings</p><a href="https://example.com/Settings">Download Android APK</a><dl><dt>Version</dt><dd>Settings</dd></dl></div></section></div></section>');
  await settle();
  expect(document.querySelector('h2')!.textContent).toBe('Мобильные приложения');
  expect(document.querySelector('section section h2')!.textContent).toBe('Доступ с телефона');
  expect(document.querySelector('.font-medium')!.textContent).toBe('Готово');
  expect(document.querySelector('.break-words')!.textContent).toBe('Settings');
  expect(document.querySelector('[data-bb-plugin-root]')!.textContent).toBe('SettingsSettings');
  expect(document.querySelector('dt')!.textContent).toBe('Версия');
  expect(document.querySelector('dd')!.textContent).toBe('Settings');
  expect(document.querySelector('a')!.getAttribute('href')).toBe('https://example.com/Settings');
  expect(document.querySelector('a')!.textContent).toBe('Скачать APK');
});

it('translates machine connection notes but preserves machine names', () => {
  mount('<section data-settings-anchor="Machines"><div><div><div><h2>Settings</h2></div></div></div><div role="note" aria-label="About the bb server"><div><p>How machines connect</p></div></div><div data-machine-row><a href="/settings/machines/custom"><span class="truncate">Settings</span></a></div></section>');
  expect(document.querySelector('[role="note"] p')!.textContent).toBe('Подключение компьютеров');
  expect(document.querySelector('[data-machine-row]')!.textContent).toBe('Settings');
});

describe('native hint attributes are separate from form data', () => {
  it('translates settings hints and restores them without reading or changing form values', async () => {
    history.replaceState(null, '', '/settings');
    document.body.innerHTML = '<div data-testid="settings-sidebar-body"><input aria-label="Search settings" placeholder="Search" title="Settings" value="Settings"></div><div data-rus-ui><textarea aria-label="Settings" placeholder="Search">Settings</textarea></div>';
    const input = document.querySelector('input')!;
    const textarea = document.querySelector('textarea')!;
    const value = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!;
    Object.defineProperty(input, 'value', { configurable: true, get() { throw new Error('must not read value'); }, set() { throw new Error('must not write value'); } });
    const dispose = mountTranslator(document, words); disposers.push(dispose);
    await settle();
    expect(input.getAttribute('aria-label')).toBe('Поиск настроек');
    expect(input.placeholder).toBe('Поиск');
    expect(input.title).toBe('Settings');
    expect(input.getAttribute('value')).toBe('Settings');
    expect(value.get!.call(input)).toBe('Settings');
    expect([textarea.value, textarea.defaultValue, textarea.textContent, textarea.placeholder]).toEqual(['Settings', 'Settings', 'Settings', 'Поиск']);
    input.placeholder = 'Host hint';
    dispose();
    expect([input.getAttribute('aria-label'), input.placeholder]).toEqual(['Search settings', 'Host hint']);
    expect(textarea.textContent).toBe('Settings');
  });
  it('keeps all protected parents and unknown plugins above a matching hint', () => {
    mount(['data-message-column', 'class="monaco-editor"', 'data-bb-plugin-root data-bb-plugin="unknown"', 'translate="no"', 'contenteditable="true"'].map(attrs => `<div ${attrs}><div data-rus-ui><input aria-label="Settings" placeholder="Search" value="Settings"></div></div>`).join(''));
    expect([...document.querySelectorAll('input')].map(input => [input.getAttribute('aria-label'), input.placeholder, input.value])).toEqual(Array(5).fill(['Settings', 'Search', 'Settings']));
  });
  it('admits only known native settings hints, including fields that render monospace values', () => {
    mount('<div data-settings-anchor="New branch prefix"><input class="font-mono" aria-label="New branch prefix" placeholder="No prefix" value="Settings"></div><div data-settings-anchor="Environment variables"><input class="font-mono" aria-label="Automatic variable name" value="GH_TOKEN"><input class="font-mono" aria-label="Automatic GH_TOKEN value" placeholder="Not available" value="••••"></div><section data-settings-anchor="Plugin marketplaces"><input class="font-mono" aria-label="Marketplace source" placeholder="https://example.com/Settings" value="Settings"></section><section data-settings-anchor="Keyboard shortcuts"><input aria-label="Search keyboard shortcuts" placeholder="Search shortcuts" value="Settings"></section><input aria-label="Settings" placeholder="Search" value="Settings">');
    expect([...document.querySelectorAll('input')].map(e => e.getAttribute('aria-label'))).toEqual(['Префикс веток', 'Имя переменной', 'Значение GH_TOKEN', 'Источник каталога', 'Поиск сочетаний', 'Settings']);
    expect([...document.querySelectorAll('input')].map(e => e.value)).toEqual(['Settings', 'GH_TOKEN', '••••', 'Settings', 'Settings', 'Settings']);
    expect(document.querySelector('[data-settings-anchor="Plugin marketplaces"] input')!.getAttribute('placeholder')).toBe('https://example.com/Settings');
  });
  it('handles newly inserted hints, host updates and moves into protected content', async () => {
    mount('<div data-testid="settings-sidebar-body"></div><div data-message-column></div>', '/settings');
    document.querySelector('[data-testid]')!.innerHTML = '<input aria-label="Search settings" placeholder="Search" value="Settings">';
    await settle();
    const input = document.querySelector('input')!;
    expect(input.placeholder).toBe('Поиск');
    document.querySelector('[data-message-column]')!.append(input);
    await settle();
    expect([input.getAttribute('aria-label'), input.placeholder, input.value]).toEqual(['Search settings', 'Search', 'Settings']);
  });
  it('limits archive and resource-search hints to reviewed routes', () => {
    mount('<input aria-label="Search archived threads" placeholder="Search archived threads…" value="Settings">', '/settings/archived');
    expect(document.querySelector('input')!.placeholder).toBe('Поиск в архиве…');
    disposers.pop()!();
    mount('<form role="search" aria-label="Search plugins"><input aria-label="Search plugins" placeholder="Search plugins" value="Settings"></form>', '/plugins');
    expect(document.querySelector('input')!.placeholder).toBe('Поиск плагинов');
    expect(document.querySelector('form')!.getAttribute('aria-label')).toBe('Поиск плагинов');
  });
});

function automationHtml() {
  return '<div data-bb-plugin-root data-bb-plugin="automations"><div class="collection"><div><div><p>Settings</p></div></div><div><div><div role="tablist"><button role="tab" id="automations-collection-installed-tab">Installed</button><button role="tab" id="automations-collection-browse-tab">Browse</button></div><div><button aria-label="New automation"><span>New automation</span></button></div></div></div><div id="automations-collection-installed-panel" role="tabpanel"><div data-resource-toolbar><form role="search" aria-label="Search automations"><input class="truncate" aria-label="Search automations" placeholder="Search automations" value="Settings"></form><button aria-label="Filters">Filters</button></div><div role="status"><div><span>No automations installed.</span></div></div><div data-resource-row><button title="Settings"><span>Settings</span></button><span role="status">High</span><p>Settings</p></div><div data-resource-prompt-content><button>Settings</button></div></div></div></div>';
}
it('translates only reviewed automations chrome, not job names, prompts or status in user rows', async () => {
  const dispose = mount(automationHtml(), '/plugins/automations/automations');
  await settle();
  expect(document.querySelector('p')!.textContent).toBe('Настройки');
  expect([...document.querySelectorAll('[role="tab"]')].map(e => e.textContent)).toEqual(['Установленные', 'Обзор']);
  expect(document.querySelector('input')!.placeholder).toBe('Поиск автоматизаций');
  expect(document.querySelector('input')!.value).toBe('Settings');
  expect(document.querySelector('[role="status"]')!.textContent).toBe('Автоматизаций нет.');
  expect(document.querySelector('[data-resource-row]')!.textContent).toBe('SettingsHighSettings');
  expect(document.querySelector('[data-resource-prompt-content]')!.textContent).toBe('Settings');
  dispose();
  expect(document.querySelector('input')!.placeholder).toBe('Search automations');
});
it('restores automations chrome when plugin identity or collection markers change', async () => {
  mount(automationHtml(), '/plugins/automations/automations');
  const tab = document.querySelector('[role="tab"]')!;
  expect(tab.textContent).toBe('Установленные');
  document.querySelector('[data-bb-plugin-root]')!.setAttribute('data-bb-plugin', 'unknown');
  await settle();
  expect(tab.textContent).toBe('Installed');
  document.querySelector('[data-bb-plugin-root]')!.setAttribute('data-bb-plugin', 'automations');
  await settle();
  expect(tab.textContent).toBe('Установленные');
  document.getElementById('automations-collection-browse-tab')!.removeAttribute('id');
  await settle();
  expect(tab.textContent).toBe('Installed');
});
it('does not admit an automations collection nested in an unknown plugin', () => {
  mount(`<div data-bb-plugin-root data-bb-plugin="unknown">${automationHtml()}</div>`, '/plugins/automations/automations');
  expect(document.querySelector('[role="tab"]')!.textContent).toBe('Installed');
});
it('translates composer reasoning only at its reviewed source marker, preserving model and project labels', async () => {
  mount('<div data-bb-plugin-root data-bb-plugin="bb--composer"><button aria-label="Provider, model and reasoning"><span title="High"><span class="min-w-0 truncate">High</span><span class="shrink-0" data-promptbox-hide-compact>Medium</span></span></button><button><span data-project-name>Medium</span></button></div>');
  const spans = document.querySelectorAll('span span');
  expect(spans[0]!.textContent).toBe('High');
  expect(spans[1]!.textContent).toBe('Средний');
  expect(document.querySelector('[data-project-name]')!.textContent).toBe('Medium');
  document.querySelector('[data-promptbox-hide-compact]')!.removeAttribute('data-promptbox-hide-compact');
  await settle();
  expect(spans[1]!.textContent).toBe('Medium');
});

it('translates machine status and permission copy while keeping adjacent machine names and project counts', () => {
  mount('<section data-settings-anchor="Machines"><div data-machine-row><a href="/settings/machines/custom"><div><div><span class="truncate">Settings</span><span class="rounded-sm border">server</span></div><div><span><i></i><span class="truncate">Online</span></span><span class="truncate">macOS</span><span class="shrink-0">Settings</span><span class="shrink-0">Full Access</span></div></div></a></div></section>');
  const row = document.querySelector('[data-machine-row]')!;
  expect(row.querySelector('div > div > span.truncate')!.textContent).toBe('Settings');
  expect(row.textContent).toBe('SettingsсерверВ сетиmacOSSettingsПолный доступ');
});
it('translates a setting control accessible label without translating its selected provider name or tooltip', () => {
  mount('<div data-settings-anchor="Settings"><div><div></div><div><button aria-label="Settings" title="Settings"><span class="truncate">Settings</span></button></div></div></div>');
  const button = document.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Настройки');
  expect(button.title).toBe('Settings');
  expect(button.textContent).toBe('Settings');
});

it('restores machine status text after the machine-row identity marker is removed', async () => {
  mount('<section data-settings-anchor="Machines"><div data-machine-row><a><div><div></div><div><span><span class="truncate">Online</span></span><span class="shrink-0">Full Access</span></div></div></a></div></section>');
  const status = document.querySelector('.truncate')!;
  expect(status.textContent).toBe('В сети');
  document.querySelector('[data-machine-row]')!.removeAttribute('data-machine-row');
  await settle();
  expect(status.textContent).toBe('Online');
});
it('reads automation collection structure once per initial scan rather than once per user row', () => {
  history.replaceState(null, '', '/plugins/automations/automations');
  document.body.innerHTML = automationHtml();
  const panel = document.getElementById('automations-collection-installed-panel')!;
  panel.insertAdjacentHTML('beforeend', '<div data-resource-row><button>Settings</button><span role="status">High</span></div>'.repeat(120));
  const boundary = document.querySelector('[data-bb-plugin-root]')!;
  const query = vi.spyOn(boundary, 'querySelector');
  const dispose = mountTranslator(document, words); disposers.push(dispose);
  expect(query.mock.calls.filter(([selector]) => selector === 'button#automations-collection-installed-tab[role="tab"]')).toHaveLength(1);
  query.mockRestore();
});
