const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_DIR = path.resolve(__dirname, '..', '.claude', 'skills');

describe('implement skill phase shape', () => {
  const implementPath = path.join(SKILLS_DIR, 'implement', 'SKILL.md');
  const content = fs.readFileSync(implementPath, 'utf8');

  const requiredHeadings = [
    '## Step 1: Plan',
    '## Step 2: Execute',
    '## Step 3: Verify',
    '## Step 4: Commit',
  ];

  for (const heading of requiredHeadings) {
    it(`contains the "${heading}" heading`, () => {
      assert.ok(
        content.includes(heading),
        `Missing required heading in implement/SKILL.md: ${heading}`
      );
    });
  }

  it('references running the test suite in the Verify phase', () => {
    // The skill is project-agnostic so it does not hard-code `npm test`,
    // but the Verify step must instruct Claude to run the test suite.
    const verifyIdx = content.indexOf('## Step 3: Verify');
    const commitIdx = content.indexOf('## Step 4: Commit');
    assert.ok(verifyIdx !== -1 && commitIdx !== -1);
    const verifySection = content.slice(verifyIdx, commitIdx);
    assert.match(
      verifySection,
      /test\s+suite/i,
      'Verify phase must reference running the test suite'
    );
  });

  it('references running the linter in the Verify phase', () => {
    const verifyIdx = content.indexOf('## Step 3: Verify');
    const commitIdx = content.indexOf('## Step 4: Commit');
    const verifySection = content.slice(verifyIdx, commitIdx);
    assert.match(
      verifySection,
      /linter/i,
      'Verify phase must reference running the linter'
    );
  });
});
