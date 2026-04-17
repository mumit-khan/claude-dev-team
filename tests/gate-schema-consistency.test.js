const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REQUIRED_FIELDS } = require('../.claude/hooks/gate-validator.js');
const GATES_MD = path.resolve(__dirname, '..', '.claude', 'rules', 'gates.md');

/**
 * Extract the first fenced ```json``` block that appears after the
 * "Required Fields (all gates)" heading in gates.md.
 */
function extractCanonicalExample(content) {
  const headingIdx = content.indexOf('## Required Fields');
  assert.ok(headingIdx !== -1, 'gates.md is missing the "Required Fields" heading');

  const after = content.slice(headingIdx);
  const match = after.match(/```json\s*\n([\s\S]*?)\n```/);
  assert.ok(match, 'No fenced JSON block follows "Required Fields" heading');
  return JSON.parse(match[1]);
}

describe('gate-schema consistency', () => {
  const content = fs.readFileSync(GATES_MD, 'utf8');
  const example = extractCanonicalExample(content);
  const exampleKeys = Object.keys(example);

  it('exposes a non-empty REQUIRED_FIELDS constant', () => {
    assert.ok(Array.isArray(REQUIRED_FIELDS));
    assert.ok(REQUIRED_FIELDS.length > 0);
  });

  it('canonical example in gates.md has every REQUIRED_FIELDS key', () => {
    const missing = REQUIRED_FIELDS.filter(k => !(k in example));
    assert.deepEqual(
      missing,
      [],
      `gates.md canonical example is missing required keys: ${missing.join(', ')}`
    );
  });

  it('canonical example in gates.md has no extra keys beyond REQUIRED_FIELDS', () => {
    const extra = exampleKeys.filter(k => !REQUIRED_FIELDS.includes(k));
    assert.deepEqual(
      extra,
      [],
      `gates.md canonical example has keys not in REQUIRED_FIELDS: ${extra.join(', ')}`
    );
  });
});
