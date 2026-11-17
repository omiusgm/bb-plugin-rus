import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';

const dictionary = {
  Settings: 'Настройки', Plugins: 'Плагины', Archived: 'В архиве',
  'Sidebar navigation': 'Навигация', 'Machine access': 'Доступ к компьютерам',
  'Accessing bb from your phone': 'Доступ с телефона', 'Mobile app downloads': 'Приложения',
  'Early adopter': 'Ранний доступ', 'Bulk update actions': 'Групповое обновление',
  'Prompt actions': 'Действия с промптом', 'Start voice input': 'Начать запись',
  'Enter a prompt or attach a file.': 'Ввести промпт или прикрепить файл.',
  'Collapse prompt box': 'Свернуть поле', 'Stop run': 'Остановить запуск',
  Environment: 'Окружение', Branch: 'Ветка', 'Permission mode': 'Режим доступа',
  'Find, identify, organize, or archive threads.': 'Управление тредами.',
  'Discover plugins for bb. Install one, or describe your own and build it from a prompt.': 'Поиск и создание плагинов.',
};
const disposers: (() => void)[] = [];
function mount(html: string, path = '/') {
  history.replaceState(null, '', path);
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, dictionary); disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; history.replaceState(null, '', '/'); });

const protectedChildren = '<span data-user-name title="Settings">Settings</span><div data-bb-plugin-root data-bb-plugin="unknown"><button aria-label="Settings">Settings</button></div>';
it.each([
  ['Sidebar navigation', '<nav data-testid="sidebar-navigation-rail" data-sidebar-navigation-placement="rail"', '</nav>'],
  ['Machine access', '<section', '</section>'],
  ['Accessing bb from your phone', '<section', '</section>'],
  ['Mobile app downloads', '<section', '</section>'],
  ['Early adopter', '<section data-settings-anchor="Early adopter"', '</section>'],
  ['Bulk update actions', '<div data-updates-domain="provider-clis"><div role="toolbar"', '</div></div>'],
] as const)('translates the static %s aria name while preserving nested user and plugin content', async (label, open, close) => {
  const path = label === 'Machine access' ? '/settings/machines' : label === 'Early adopter' ? '/settings/experiments' : label === 'Bulk update actions' ? '/settings/updates' : '/settings/mobile';
  mount(`${open} aria-label="${label}">${protectedChildren}${close}`, path);
  const landmark = document.querySelector('[aria-label]')!;
  await settle();
  expect(landmark.getAttribute('aria-label')).toBe(dictionary[label]);
  expect(document.querySelector('[data-user-name]')!.textContent).toBe('Settings');
  expect(document.querySelector('[data-user-name]')!.getAttribute('title')).toBe('Settings');
  expect(document.querySelector('button')!.getAttribute('aria-label')).toBe('Settings');
  expect(document.querySelector('button')!.textContent).toBe('Settings');
});
it('does not grant landmark exceptions inside an unknown plugin or message', () => {
  mount(`<div data-bb-plugin-root data-bb-plugin="unknown"><section aria-label="Machine access">${protectedChildren}</section></div><div data-message-column><nav data-testid="sidebar-navigation-rail" data-sidebar-navigation-placement="rail" aria-label="Sidebar navigation"></nav></div>`);
  expect(document.querySelector('section')!.getAttribute('aria-label')).toBe('Machine access');
  expect(document.querySelector('nav')!.getAttribute('aria-label')).toBe('Sidebar navigation');
});
it('restores a static landmark aria label when its identifying marker changes', async () => {
  mount('<nav data-testid="sidebar-navigation-rail" data-sidebar-navigation-placement="rail" aria-label="Sidebar navigation"><div data-bb-plugin-root></div></nav>');
  const nav = document.querySelector('nav')!;
  expect(nav.getAttribute('aria-label')).toBe('Навигация');
  nav.removeAttribute('data-testid');
  await settle();
  expect(nav.getAttribute('aria-label')).toBe('Sidebar navigation');
});
it('translates outer settings chrome on plugin detail routes while retaining the plugin identity', () => {
  mount('<div data-app-content-shell><div data-testid="app-page-header-content-row"><p class="truncate text-sm font-semibold">Settings</p></div><main><h1>Settings</h1></main></div><div data-testid="settings-sidebar-body"><div class="mt-4"><div class="text-xs font-normal leading-5">Plugins</div></div><div class="mt-4"><div class="text-xs font-normal leading-5">Archived</div></div><a href="/settings/plugins/custom"><span class="truncate">Settings</span></a></div>', '/settings/plugins/rus');
  expect(document.querySelector('p')!.textContent).toBe('Настройки');
  expect([...document.querySelectorAll('.mt-4')].map(e => e.textContent)).toEqual(['Плагины', 'В архиве']);
  expect(document.querySelector('h1')!.textContent).toBe('Settings');
  expect(document.querySelector('a')!.textContent).toBe('Settings');
});
it('translates the host category and hero descriptions without translating plugin cards or demo content', () => {
  mount('<div id="plugins-browse-results"><section aria-roledescription="carousel" aria-label="What you can build with bb plugins"><h2>Settings</h2><p>Discover plugins for bb. Install one, or describe your own and build it from a prompt.</p><div><p>Settings</p></div></section><div data-testid="plugin-browse-shelves"><section><div><div><div><h3 class="truncate">Settings</h3></div><div><p>Find, identify, organize, or archive threads.</p></div></div></div><div><div data-plugin-shelf><h3>Settings</h3><p>Find, identify, organize, or archive threads.</p></div></div></section></div></div>', '/plugins');
  expect(document.querySelector('section > p')!.textContent).toBe('Поиск и создание плагинов.');
  expect(document.querySelector('[data-testid] > section > div:first-child p')!.textContent).toBe('Управление тредами.');
  expect(document.querySelector('[data-plugin-shelf] p')!.textContent).toBe('Find, identify, organize, or archive threads.');
  expect([...document.querySelectorAll('h2,h3')].map(e => e.textContent)).toEqual(['Settings', 'Settings', 'Settings']);
});

const composerControls = [
  ['Prompt actions', ''], ['Start voice input', ''],
  ['Enter a prompt or attach a file.', 'data-promptbox-submit-action'],
  ['Collapse prompt box', ''], ['Stop run', 'data-promptbox-submit-action'],
] as const;
it.each(composerControls)('translates only the source-marked composer control aria name: %s', async (label, marker) => {
  const dispose = mount(`<div data-bb-plugin-root data-bb-plugin="bb--composer"><div data-promptbox><div data-promptbox-action-row data-promptbox-standard-actions><button ${marker} aria-label="${label}" title="Settings"><span class="truncate">Settings</span></button><div contenteditable="true">Settings</div><button aria-label="Settings"><span>Settings</span></button></div></div></div>`);
  const button = document.querySelector('button')!;
  await settle();
  expect(button.getAttribute('aria-label')).toBe(dictionary[label]);
  expect(button.getAttribute('title')).toBe('Settings');
  expect(button.textContent).toBe('Settings');
  expect(document.querySelector('[contenteditable]')!.textContent).toBe('Settings');
  expect(document.querySelectorAll('button')[1]!.textContent).toBe('Settings');
  dispose();
  expect(button.getAttribute('aria-label')).toBe(label);
});
it('keeps composer static controls protected when their source marker or outer plugin identity changes', async () => {
  mount('<div id="plugin" data-bb-plugin-root data-bb-plugin="bb--composer"><div data-promptbox><button data-promptbox-submit-action aria-label="Stop run">Settings</button></div></div>');
  const button = document.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Остановить запуск');
  button.removeAttribute('data-promptbox-submit-action');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Stop run');
  button.setAttribute('data-promptbox-submit-action', '');
  document.getElementById('plugin')!.setAttribute('data-bb-plugin', 'unknown');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Stop run');
});

it('translates the source-marked environment, permission and official branch picker aria names, preserving selected names and tooltips', async () => {
  mount('<div data-app-composer data-promptbox-shell><div data-new-thread-footer><button data-promptbox-shrinkable-control aria-label="Environment"><span class="truncate" data-promptbox-full-label>Settings</span><span class="truncate" data-promptbox-compact-label>Settings</span></button><button aria-label="Permission mode" title="Settings"><span title="Settings"><span class="truncate" data-promptbox-full-label>Settings</span><span class="truncate" data-promptbox-compact-label>Settings</span></span></button><div data-bb-plugin-root data-bb-plugin="environment-project-checkout"><button role="combobox" aria-label="Branch"><span title="Settings"><span class="truncate">Settings</span></span></button><p>Settings</p></div></div></div>');
  await settle();
  expect([...document.querySelectorAll('button')].map(button => button.getAttribute('aria-label'))).toEqual(['Окружение', 'Режим доступа', 'Ветка']);
  expect([...document.querySelectorAll('.truncate')].map(span => span.textContent)).toEqual(Array(5).fill('Settings'));
  expect([...document.querySelectorAll('[title]')].map(element => element.getAttribute('title'))).toEqual(Array(3).fill('Settings'));
  expect(document.querySelector('p')!.textContent).toBe('Settings');
});
it('does not admit picker exceptions in unknown plugins or outside the host composer shell', () => {
  mount('<div data-bb-plugin-root data-bb-plugin="unknown"><div data-app-composer data-promptbox-shell><button data-promptbox-shrinkable-control aria-label="Environment"><span class="truncate">Settings</span></button><div data-new-thread-footer><div data-bb-plugin-root data-bb-plugin="environment-project-checkout"><button role="combobox" aria-label="Branch"><span class="truncate">Settings</span></button></div></div></div></div><button aria-label="Permission mode"><span class="truncate" data-promptbox-full-label>Settings</span><span class="truncate" data-promptbox-compact-label>Settings</span></button>');
  expect([...document.querySelectorAll('button')].map(button => button.getAttribute('aria-label'))).toEqual(['Environment', 'Branch', 'Permission mode']);
});

it('restores a hero description when its carousel marker is removed', async () => {
  mount('<div id="plugins-browse-results"><section aria-roledescription="carousel" aria-label="What you can build with bb plugins"><p>Discover plugins for bb. Install one, or describe your own and build it from a prompt.</p></section></div>', '/plugins');
  const paragraph = document.querySelector('p')!;
  expect(paragraph.textContent).toBe('Поиск и создание плагинов.');
  document.querySelector('section')!.removeAttribute('aria-roledescription');
  await settle();
  expect(paragraph.textContent).toBe('Discover plugins for bb. Install one, or describe your own and build it from a prompt.');
});
