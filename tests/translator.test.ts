import { afterEach, describe, expect, it } from 'vitest';
import { createLookup, mountTranslator, translateExact } from '../translator';

const dictionary = { Settings: 'Настройки', Cancel: 'Отмена', 'New thread': 'Новый тред' };
const disposers: (() => void)[] = [];
function mount(html: string, signal?: AbortSignal) {
  document.body.innerHTML = html;
  const dispose = mountTranslator(document, dictionary, signal);
  disposers.push(dispose);
  return dispose;
}
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }
afterEach(() => { for (const dispose of disposers.splice(0)) dispose(); document.body.innerHTML = ''; });

describe('exact interface copy', () => {
  it('preserves whitespace, punctuation, unknown copy, and arbitrary page text', () => {
    mount('<button> \n Settings\t </button><button>Settings!</button><p>Settings</p><button>Settings for Vladimir</button>');
    expect(document.querySelector('button')!.textContent).toBe(' \n Настройки\t ');
    expect(document.querySelectorAll('button')[1]!.textContent).toBe('Settings!');
    expect(document.querySelector('p')!.textContent).toBe('Settings');
    expect(document.querySelectorAll('button')[2]!.textContent).toBe('Settings for Vladimir');
  });
  it('does not read inherited dictionary keys or interpolate user data', () => {
    const lookup = createLookup(Object.assign(Object.create({ Settings: 'inherited' }), { Cancel: 'Отмена' }));
    expect(translateExact('Settings', lookup)).toBeNull();
    expect(translateExact('constructor', lookup)).toBeNull();
    expect(translateExact('Cancel Vladimir', lookup)).toBeNull();
  });
  it('translates safe attributes and never changes form values or identifiers', () => {
    mount('<button title="Settings" aria-label="Cancel" data-id="Settings">Settings</button><label>Settings<input value="Settings" title="Settings" placeholder="Settings"></label>');
    const button = document.querySelector('button')!;
    expect(button.title).toBe('Настройки');
    expect(button.getAttribute('aria-label')).toBe('Отмена');
    expect(button.dataset.id).toBe('Settings');
    const input = document.querySelector('input')!;
    expect([input.value, input.title, input.placeholder]).toEqual(['Settings', 'Settings', 'Settings']);
  });
});

describe('protected data boundaries', () => {
  const roots = [
    '<div data-message-column>', '<div data-timeline-row-id="message">',
    '<div contenteditable="true">', '<div role="textbox">', '<div class="xterm">',
    '<div class="monaco-editor">', '<div class="cm-editor">', '<div data-bb-source-code-viewport>',
    '<div data-bb-plugin-root>', '<div translate="no">', '<div data-rus-ignore>',
    '<div class="bb-thread-title">', '<div data-user-name>', '<div class="prose">',
    '<div class="truncate">', '<div data-thread-toc>',
  ];
  for (const root of roots) {
    it(`preserves user text and attrs under ${root}`, () => {
      mount(`${root}<button title="Settings" aria-label="Cancel">Settings</button></div>`);
      const button = document.querySelector('button')!;
      expect(button.textContent).toBe('Settings');
      expect(button.title).toBe('Settings');
      expect(button.getAttribute('aria-label')).toBe('Cancel');
    });
  }
  it('preserves code and user titles, including tooltips on their parent controls', () => {
    mount('<button title="Settings"><span class="bb-thread-title">Settings</span></button><button><code>Settings</code></button>');
    expect(document.body.textContent).toBe('SettingsSettings');
    expect(document.querySelector('button')!.title).toBe('Settings');
  });
  it('restores copy when a protected marker appears on an existing ancestor', async () => {
    mount('<div id="root"><button title="Settings">Settings</button></div>');
    expect(document.querySelector('button')!.textContent).toBe('Настройки');
    document.getElementById('root')!.setAttribute('contenteditable', 'true');
    await settle();
    expect(document.querySelector('button')!.textContent).toBe('Settings');
    expect(document.querySelector('button')!.title).toBe('Settings');
  });
  it('restores a control moved into a message and translates it when moved back', async () => {
    mount('<button title="Settings">Settings</button><div data-message-column></div>');
    const button = document.querySelector('button')!;
    document.querySelector('[data-message-column]')!.append(button);
    await settle();
    expect([button.textContent, button.title]).toEqual(['Settings', 'Settings']);
    document.body.append(button);
    await settle();
    expect([button.textContent, button.title]).toEqual(['Настройки', 'Настройки']);
  });
});

describe('host updates and cleanup', () => {
  it('handles added controls and subsequent host copy changes', async () => {
    const dispose = mount('<button title="Settings">Settings</button>');
    const button = document.querySelector('button')!;
    button.firstChild!.textContent = 'Cancel';
    button.title = 'Cancel';
    document.body.insertAdjacentHTML('beforeend', '<button>New thread</button>');
    await settle();
    expect([button.textContent, button.title]).toEqual(['Отмена', 'Отмена']);
    expect(document.querySelectorAll('button')[1]!.textContent).toBe('Новый тред');
    dispose();
    expect([button.textContent, button.title]).toEqual(['Cancel', 'Cancel']);
  });
  it('restores only values still owned by this generation, even before observer delivery', () => {
    const dispose = mount('<button title="Settings" aria-label="Cancel">Settings</button>');
    const button = document.querySelector('button')!;
    button.firstChild!.textContent = 'Host update';
    button.title = 'Host title';
    button.removeAttribute('aria-label');
    dispose(); dispose();
    expect([button.textContent, button.title, button.getAttribute('aria-label')]).toEqual(['Host update', 'Host title', null]);
  });
  it('aborts pending work, restores originals, and never observes after cleanup', async () => {
    const controller = new AbortController();
    mount('<button>Settings</button>', controller.signal);
    document.body.insertAdjacentHTML('beforeend', '<button>Cancel</button>');
    controller.abort();
    await settle();
    expect(document.body.textContent).toBe('SettingsCancel');
    document.body.insertAdjacentHTML('beforeend', '<button>New thread</button>');
    await settle();
    expect(document.body.textContent).toBe('SettingsCancelNew thread');
  });
  it('does nothing with an already aborted lifecycle', () => {
    const controller = new AbortController(); controller.abort();
    mount('<button>Settings</button>', controller.signal);
    expect(document.body.textContent).toBe('Settings');
  });
  it('restores detached controls and permits a clean new generation', async () => {
    const dispose = mount('<button>Settings</button>');
    const button = document.querySelector('button')!;
    button.remove();
    await settle();
    expect(button.textContent).toBe('Settings');
    dispose();
    document.body.append(button);
    disposers.push(mountTranslator(document, dictionary));
    expect(button.textContent).toBe('Настройки');
  });
});

it('translates reviewed settings labels and keyboard descriptions while preserving values', () => {
  const original = '<section data-settings-anchor="Keyboard shortcuts"><div><div><div><h2>Settings</h2></div><p>New thread</p></div></div><div><div><p>Cancel</p><kbd>Settings</kbd><div class="truncate">Settings</div></div></div></section>';
  mount(original);
  expect(document.querySelector('h2')!.textContent).toBe('Настройки');
  expect([...document.querySelectorAll('p')].map(p => p.textContent)).toEqual(['Новый тред', 'Отмена']);
  expect(document.querySelector('kbd')!.textContent).toBe('Settings');
  expect(document.querySelector('.truncate')!.textContent).toBe('Settings');
});
it('does not translate general settings value paragraphs outside reviewed label branches', () => {
  mount('<section data-settings-anchor="Settings"><div><div><div><p>Settings</p></div><p>Cancel</p></div></div><div><p>New thread</p></div></section>');
  expect([...document.querySelectorAll('p')].map(p => p.textContent)).toEqual(['Настройки', 'Отмена', 'New thread']);
});
it('translates fixed settings navigation labels but preserves dynamic entity routes', () => {
  mount('<a href="/settings/keyboard"><span class="truncate">Settings</span></a><a href="/settings/plugins/custom-plugin"><span class="truncate">Settings</span></a><a href="/threads/123"><span class="truncate">Settings</span></a>');
  expect([...document.querySelectorAll('a')].map(a => a.textContent)).toEqual(['Настройки', 'Settings', 'Settings']);
});

it('translates official navigation rail icon labels without translating SVG content or sibling plugin UI', () => {
  const labels = { Home: 'Главная', Plugins: 'Плагины', Skills: 'Навыки', Automations: 'Автоматизации', More: 'Ещё' };
  document.body.innerHTML = `<div data-bb-plugin-root data-bb-plugin="navigation"><button id="outside" aria-label="Home">Home</button><div><div data-testid="app-nav-rail">${Object.keys(labels).map(label => `<button aria-label="${label}" title="${label}"><svg aria-hidden="true"><title>${label}</title><path d="M0 0"/></svg></button>`).join('')}</div></div></div>`;
  const dispose = mountTranslator(document, labels);
  disposers.push(dispose);
  expect([...document.querySelectorAll('[data-testid="app-nav-rail"] button')].map(button => [button.getAttribute('aria-label'), button.getAttribute('title')]))
    .toEqual(Object.values(labels).map(label => [label, label]));
  expect([...document.querySelectorAll('svg title')].map(title => title.textContent)).toEqual(Object.keys(labels));
  expect(document.getElementById('outside')!.getAttribute('aria-label')).toBe('Home');
  expect(document.getElementById('outside')!.textContent).toBe('Home');
  dispose();
  expect([...document.querySelectorAll('[data-testid="app-nav-rail"] button')].map(button => button.getAttribute('aria-label'))).toEqual(Object.keys(labels));
});

it('preserves unknown plugins even with a rail marker or nested navigation plugin wrapper', () => {
  mount('<div data-bb-plugin-root data-bb-plugin="unknown"><div data-testid="app-nav-rail"><button aria-label="Settings"><svg/></button></div><div data-bb-plugin-root data-bb-plugin="navigation"><div data-testid="app-nav-rail"><button aria-label="Settings"><svg/></button></div></div></div><div data-bb-plugin-root data-bb-plugin="navigation"><button aria-label="Settings"><svg/></button></div>');
  expect([...document.querySelectorAll('button')].map(button => button.getAttribute('aria-label'))).toEqual(['Settings', 'Settings', 'Settings']);
});

it('allows a decorative SVG under a host button but preserves user title descendants', () => {
  mount('<button id="icon" aria-label="Settings" title="Cancel"><svg aria-hidden="true"><title>Settings</title></svg></button><button id="user" aria-label="Settings" title="Settings"><svg aria-hidden="true"/><span class="bb-thread-title">Settings</span></button>');
  expect([document.getElementById('icon')!.getAttribute('aria-label'), document.getElementById('icon')!.getAttribute('title')]).toEqual(['Настройки', 'Отмена']);
  expect(document.querySelector('svg title')!.textContent).toBe('Settings');
  expect([document.getElementById('user')!.getAttribute('aria-label'), document.getElementById('user')!.getAttribute('title')]).toEqual(['Settings', 'Settings']);
  expect(document.getElementById('user')!.textContent).toBe('Settings');
});

it('restores official rail labels when its plugin identity or rail marker changes', async () => {
  mount('<div id="plugin" data-bb-plugin-root data-bb-plugin="navigation"><div id="rail" data-testid="app-nav-rail"><button aria-label="Settings"><svg aria-hidden="true"/></button></div></div>');
  const button = document.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Настройки');
  document.getElementById('plugin')!.setAttribute('data-bb-plugin', 'unknown');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Settings');
  document.getElementById('plugin')!.setAttribute('data-bb-plugin', 'navigation');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Настройки');
  document.getElementById('rail')!.removeAttribute('data-testid');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Settings');
});

it('translates Spaces rail only inside host rail navigation and preserves siblings and user titles', () => {
  mount('<nav data-testid="sidebar-navigation-rail" data-sidebar-navigation-placement="rail"><div data-bb-plugin-root data-bb-plugin="spaces"><button id="spaces-sibling" aria-label="Settings">Settings</button><div data-testid="app-nav-rail"><button id="spaces-home" aria-label="Settings"><svg aria-hidden="true"/></button><button id="spaces-user" aria-label="Settings" title="Settings"><svg aria-hidden="true"/><span class="bb-thread-title">Settings</span></button></div></div></nav><div data-bb-plugin-root data-bb-plugin="spaces"><div data-testid="app-nav-rail"><button id="spaces-outside" aria-label="Settings"><svg aria-hidden="true"/></button></div></div>');
  expect(document.getElementById('spaces-home')!.getAttribute('aria-label')).toBe('Настройки');
  expect(document.getElementById('spaces-sibling')!.getAttribute('aria-label')).toBe('Settings');
  expect(document.getElementById('spaces-sibling')!.textContent).toBe('Settings');
  expect([document.getElementById('spaces-user')!.getAttribute('aria-label'), document.getElementById('spaces-user')!.getAttribute('title'), document.getElementById('spaces-user')!.textContent]).toEqual(['Settings', 'Settings', 'Settings']);
  expect(document.getElementById('spaces-outside')!.getAttribute('aria-label')).toBe('Settings');
});

it('restores Spaces labels when the enclosing host navigation leaves rail mode', async () => {
  mount('<nav data-sidebar-navigation-placement="rail"><div data-bb-plugin-root data-bb-plugin="spaces"><div data-testid="app-nav-rail"><button aria-label="Settings"><svg aria-hidden="true"/></button></div></div></nav>');
  const button = document.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Настройки');
  document.querySelector('nav')!.setAttribute('data-sidebar-navigation-placement', 'list');
  await settle();
  expect(button.getAttribute('aria-label')).toBe('Settings');
});

describe('original aria-label marker', () => {
  const MARK = 'data-rus-original-aria-label';
  it('keeps the English aria-label in a data attribute only where it was translated', async () => {
    mount('<button id="a" aria-label="Cancel" title="Settings">x</button><button id="b" aria-label="Unknown">x</button><button id="c" title="Settings">x</button>');
    const [a, b, c] = ['a', 'b', 'c'].map(id => document.getElementById(id)!);
    expect(a.getAttribute('aria-label')).toBe('Отмена');
    expect(a.getAttribute(MARK)).toBe('Cancel');
    expect(b.hasAttribute(MARK)).toBe(false);
    expect(c.hasAttribute(MARK)).toBe(false);
    expect(a.hasAttribute('data-rus-original-title')).toBe(false);
  });
  it('follows a host update and drops the marker when the new value is not translated', async () => {
    mount('<button id="a" aria-label="Cancel">x</button>');
    const a = document.getElementById('a')!;
    a.setAttribute('aria-label', 'Settings'); await settle();
    expect([a.getAttribute('aria-label'), a.getAttribute(MARK)]).toEqual(['Настройки', 'Settings']);
    a.setAttribute('aria-label', 'Something else'); await settle();
    expect([a.getAttribute('aria-label'), a.hasAttribute(MARK)]).toEqual(['Something else', false]);
  });
  it('leaves no trace after dispose', () => {
    const dispose = mount('<button id="a" aria-label="Cancel">x</button>');
    dispose();
    const a = document.getElementById('a')!;
    expect(a.getAttribute('aria-label')).toBe('Cancel');
    expect(a.hasAttribute(MARK)).toBe(false);
  });
});
