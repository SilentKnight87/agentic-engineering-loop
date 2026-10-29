import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
test('real installers preserve contents and repeat safely in synthetic homes', () => {
  const result = spawnSync(process.execPath, ['.agents/skills/verify-agentic-engineering-loop/scripts/drive.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS: isolated CLI verification/);
});
