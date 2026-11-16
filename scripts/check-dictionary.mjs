import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const dictionary = JSON.parse(readFileSync(new URL('../dict/ru.json', import.meta.url), 'utf8'));
const provenance = JSON.parse(readFileSync(new URL('../dict/provenance.json', import.meta.url), 'utf8'));
assert.equal(typeof dictionary, 'object');
assert(!Array.isArray(dictionary));
const entries = Object.entries(dictionary);
assert(entries.length > 1000, 'Dictionary is unexpectedly small');
for (const [en, ru] of entries) {
  assert.equal(typeof ru, 'string', en);
  assert(en.trim() === en && en.length > 0 && ru.trim() === ru && ru.length > 0, en);
  assert.notEqual(en, ru, en);
  assert(!/[\r\n]/.test(en + ru), `Multiline entry: ${en}`);
  assert(Object.hasOwn(provenance.entries, en), `No provenance: ${en}`);
  assert(provenance.entries[en].sources.length > 0, `No upstream source: ${en}`);
  const tokens = text => (text.match(/\$\{[^}]+\}|\{[A-Za-z_][\w.]*\}|%[sd]/g) || []).sort();
  assert.deepEqual(tokens(en), tokens(ru), `Placeholder mismatch: ${en}`);
}
assert.equal(provenance.translated, entries.length);
assert.equal(provenance.reviewed, entries.length + Object.keys(provenance.excluded).length);
console.log(`${entries.length} translations: format, placeholders, and source references verified`);
