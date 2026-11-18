import { afterEach, expect, it } from 'vitest';
import { mountTranslator } from '../translator';
import { editorPlaceholderCss } from '../reviewed-placeholder';

const words = {
  'Ask anything.': 'Задать любой вопрос.',
  'Ask anything. @ to mention files or folders': 'Задать любой вопрос. @ — указать файл или папку',
  'Ask for a follow-up. @ to mention files, folders, sections, or threads': 'Задать уточняющий вопрос. @ — указать файл, папку, раздел или тред',
  'Ask a follow-up': 'Задать уточняющий вопрос', Pinned: 'Закреплено',
};
const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).forEach(dispose => dispose()); document.body.innerHTML = ''; document.head.innerHTML = ''; });
const styles = () => [...document.head.querySelectorAll('style')].map(style => style.textContent ?? '').join('\n');

it('builds one rule per placeholder of the prompt editor family and nothing else', () => {
  const css = editorPlaceholderCss(words);
  expect(css.split('\n')).toHaveLength(3);
  expect(css).toContain('[data-promptbox-editor-content] p[data-placeholder="Ask anything."]::before{content:"Задать любой вопрос." !important}');
  expect(css).not.toContain('Закреплено');
  expect(css).not.toContain('Ask a follow-up"');
});

it('escapes quotes and backslashes in both the match and the text', () => {
  const css = editorPlaceholderCss({ 'Ask anything. "x" \\': 'Вопрос "x" \\' });
  expect(css).toContain('data-placeholder="Ask anything. \\"x\\" \\\\"]');
  expect(css).toContain('content:"Вопрос \\"x\\" \\\\"');
});

it('adds the stylesheet on mount, leaves the editor DOM alone, removes it on dispose', () => {
  document.body.innerHTML = `<div data-promptbox-editor-content><div contenteditable="true" role="textbox" aria-label="Ask anything." data-placeholder="Ask anything."><p data-placeholder="Ask anything."><br></p></div></div>`;
  const dispose = mountTranslator(document, words);
  disposers.push(dispose);
  expect(styles()).toContain('p[data-placeholder="Ask anything."]::before{content:"Задать любой вопрос."');
  const editor = document.querySelector('[role="textbox"]')!;
  const paragraph = document.querySelector('p')!;
  expect(paragraph.getAttribute('data-placeholder')).toBe('Ask anything.');
  expect(editor.getAttribute('data-placeholder')).toBe('Ask anything.');
  expect(editor.getAttribute('aria-label')).toBe('Ask anything.');
  dispose();
  expect(styles()).toBe('');
});

it('adds no stylesheet when the dictionary has no placeholder entries', () => {
  disposers.push(mountTranslator(document, { Pinned: 'Закреплено' }));
  expect(document.head.querySelectorAll('style')).toHaveLength(0);
});
