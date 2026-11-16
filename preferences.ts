const KEY = 'bb-plugin-rus.enabled.v1';
const EVENT = 'bb-plugin-rus:preference';
export function readEnabled(window: Window): boolean {
  try { return window.localStorage.getItem(KEY) !== 'false'; }
  catch { return true; }
}
export function writeEnabled(window: Window, enabled: boolean): void {
  try { window.localStorage.setItem(KEY, String(enabled)); } catch { /* Session still works without storage. */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: enabled }));
}
export function subscribeEnabled(window: Window, listener: (enabled: boolean) => void): () => void {
  const local = (event: Event) => {
    const value = (event as CustomEvent<unknown>).detail;
    if (typeof value === 'boolean') listener(value);
  };
  const storage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) listener(readEnabled(window));
  };
  window.addEventListener(EVENT, local);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(EVENT, local);
    window.removeEventListener('storage', storage);
  };
}
