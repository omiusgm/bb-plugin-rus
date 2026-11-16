import { useEffect, useState } from 'react';
import { definePluginApp } from '@get-bb/plugin-sdk/app';
import dictionary from './dict/ru.json';
import { mountTranslator } from './translator';
import { readEnabled, subscribeEnabled, writeEnabled } from './preferences';

function LanguageSettings() {
  const [enabled, setEnabled] = useState(() => readEnabled(window));
  useEffect(() => subscribeEnabled(window, setEnabled), []);
  return <section data-rus-ignore style={{ display: 'grid', gap: 12 }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" checked={enabled} onChange={event => {
        const next = event.currentTarget.checked;
        setEnabled(next);
        writeEnabled(window, next);
      }} />
      Переводить интерфейс на русский
    </label>
    <p style={{ margin: 0, opacity: 0.75 }}>Настройка действует в этом браузере. Сообщения, код и введённый текст не переводятся.</p>
  </section>;
}
export default definePluginApp(app => {
  app.slots.settingsSection({ id: 'language', title: 'Русский интерфейс', component: LanguageSettings });
  app.contentScripts.register({
    id: 'russian-interface',
    mount({ signal }) {
      if (signal.aborted) return;
      let stop: (() => void) | undefined;
      let disposed = false;
      const apply = (enabled: boolean) => {
        stop?.();
        stop = undefined;
        if (enabled && !disposed) stop = mountTranslator(document, dictionary, signal);
      };
      const unsubscribe = subscribeEnabled(window, apply);
      const dispose = () => {
        if (disposed) return;
        disposed = true;
        unsubscribe();
        stop?.();
        stop = undefined;
        signal.removeEventListener('abort', dispose);
      };
      signal.addEventListener('abort', dispose, { once: true });
      apply(readEnabled(window));
      return dispose;
    },
  });
});
