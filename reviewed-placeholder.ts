/**
 * Prompt editor placeholder ("Ask anything. …"). No dictionary data.
 *
 * The placeholder is drawn by CSS (`content: attr(data-placeholder)` on the empty
 * paragraph of the rich editor), and the editor re-renders that attribute on every
 * change. The translator never edits editor DOM, so rewriting the attribute is both
 * forbidden and futile. Instead a stylesheet replaces the drawn text for the exact
 * original placeholder strings only: attribute value must equal a reviewed key, and
 * the paragraph must sit in the prompt editor content. The page DOM, the typed
 * text and the editor state stay untouched; disposing the translator removes the
 * stylesheet and the English text returns.
 */
const FAMILIES = ['Ask anything.', 'Ask for a follow-up.'];
const EDITOR = '[data-promptbox-editor-content] p[data-placeholder="';

const cssString = (value: string) => `"${value.replace(/[\\"]/g, '\\$&').replace(/[\r\n]+/g, ' ')}"`;

export function editorPlaceholderCss(dictionary: Readonly<Record<string, string>>): string {
  return Object.entries(dictionary)
    .filter(([source]) => FAMILIES.some(family => source.startsWith(family)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([source, translated]) =>
      `${EDITOR}${source.replace(/[\\"]/g, '\\$&')}"]::before{content:${cssString(translated)} !important}`)
    .join('\n');
}
