const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SCRIPT = path.resolve(__dirname, '..', 'docs', 'build-presentation.js');
const REPO_ROOT = path.resolve(__dirname, '..');

describe('build-presentation.js', () => {
  it('passes syntax check (node --check)', () => {
    const result = spawnSync(process.execPath, ['--check', SCRIPT], {
      encoding: 'utf8',
    });
    assert.equal(
      result.status,
      0,
      `Syntax check failed:\n${result.stderr}`
    );
  });

  describe('runtime smoke test', () => {
    let tmpDir;
    let outPath;

    before(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'presentation-smoke-'));
      outPath = path.join(tmpDir, 'deck.pptx');
    });

    after(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('builds a non-empty .pptx when run with --out', { timeout: 90000 }, () => {
      const result = spawnSync(
        process.execPath,
        [SCRIPT, `--out=${outPath}`],
        { cwd: REPO_ROOT, encoding: 'utf8' }
      );
      assert.equal(
        result.status,
        0,
        `Builder exited ${result.status}:\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
      );
      assert.ok(fs.existsSync(outPath), `Output file not created: ${outPath}`);
      const stat = fs.statSync(outPath);
      assert.ok(stat.size > 10000, `Output file unexpectedly small: ${stat.size} bytes`);
    });
  });
});
