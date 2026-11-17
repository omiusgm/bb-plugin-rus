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
  const sourceRecord = provenance.entries[en];
  if (sourceRecord.commit) {
    assert.match(sourceRecord.commit, /^[a-f0-9]{40}$/, `Invalid source commit: ${en}`);
    assert.deepEqual(sourceRecord.sourceUrls, sourceRecord.sources.map(source => {
      const match = /^(.*):(\d+)$/.exec(source);
      assert(match && !match[1].startsWith('/'), `Invalid source location: ${en}`);
      return `https://github.com/get-bb/bb/blob/${sourceRecord.commit}/${match[1]}#L${match[2]}`;
    }), `Source URL mismatch: ${en}`);
  }
  const tokens = text => (text.match(/\$\{[^}]+\}|\{[A-Za-z_][\w.]*\}|%[sd]/g) || []).sort();
  assert.deepEqual(tokens(en), tokens(ru), `Placeholder mismatch: ${en}`);
}
assert.equal(provenance.translated, entries.length);
assert.equal(provenance.reviewed, entries.length + Object.keys(provenance.excluded).length);
console.log(`${entries.length} translations: format, placeholders, and source references verified`);
