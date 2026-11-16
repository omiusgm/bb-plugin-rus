import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { loadPluginApp, mountPluginContentScripts, renderSlot } from '@get-bb/plugin-sdk/testing/app';
import { readEnabled, subscribeEnabled, writeEnabled } from '../preferences';
vi.mock('../dict/ru.json', () => ({ default: { Settings: 'Настройки', Cancel: 'Отмена' } }));
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const dispose of cleanup.splice(0).reverse()) await dispose();
  window.localStorage.clear(); document.body.innerHTML = '';
});
async function settle() { await new Promise(resolve => setTimeout(resolve, 0)); }

it('registers valid SDK slots and content scripts; toggle restores/reapplies and survives remount', async () => {
  const app = await loadPluginApp(() => import('../app'));
  document.body.innerHTML = '<button id="host">Settings</button>';
  const scripts = await mountPluginContentScripts(app, { pluginId: 'rus', generation: 1 });
  cleanup.push(() => scripts.lifecycle.dispose());
  expect(document.getElementById('host')!.textContent).toBe('Настройки');
  const slot = renderSlot(app.settingsSections[0]!, {});
  cleanup.push(() => slot.lifecycle.unmount());
  const checkbox = slot.getByRole('checkbox');
  expect((checkbox as HTMLInputElement).checked).toBe(true);
  fireEvent.click(checkbox);
  expect(document.getElementById('host')!.textContent).toBe('Settings');
  expect(readEnabled(window)).toBe(false);
  await scripts.lifecycle.dispose();
  const next = await mountPluginContentScripts(app, { pluginId: 'rus', generation: 2 });
  cleanup.push(() => next.lifecycle.dispose());
  expect(document.getElementById('host')!.textContent).toBe('Settings');
  fireEvent.click(checkbox);
  expect(document.getElementById('host')!.textContent).toBe('Настройки');
  await next.lifecycle.dispose();
  expect(document.getElementById('host')!.textContent).toBe('Settings');
  writeEnabled(window, true);
  document.body.insertAdjacentHTML('beforeend', '<button>Cancel</button>');
  await settle();
  expect(document.body.lastElementChild!.textContent).toBe('Cancel');
});

it('synchronizes preference events and stops listening after unsubscribe', () => {
  const changes: boolean[] = [];
  const stop = subscribeEnabled(window, value => changes.push(value));
  writeEnabled(window, false);
  window.localStorage.setItem('bb-plugin-rus.enabled.v1', 'true');
  window.dispatchEvent(new StorageEvent('storage', { key: 'bb-plugin-rus.enabled.v1' }));
  stop(); writeEnabled(window, false);
  expect(changes).toEqual([false, true]);
});

it('keeps session control usable when local storage is unavailable', () => {
  const changes: boolean[] = [];
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied'); });
  const stop = subscribeEnabled(window, value => changes.push(value));
  cleanup.push(stop);
  expect(readEnabled(window)).toBe(true);
  writeEnabled(window, false);
  expect(changes).toEqual([false]);
});
