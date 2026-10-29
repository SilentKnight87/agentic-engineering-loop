import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
test('Git invokes the hook and preserves human attribution and message text', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'loop-hook-'));
  try {
    /** @param {string[]} args */
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
    git('init', '-q');
    git('config', 'user.name', 'Synthetic Tester'); git('config', 'user.email', 'tester@example.invalid');
    git('config', 'core.hooksPath', '.githooks');
    mkdirSync(path.join(dir, 'scripts'));
    cpSync('.githooks', path.join(dir, '.githooks'), { recursive: true });
    cpSync('scripts/strip-ai-trailers.mjs', path.join(dir, 'scripts/strip-ai-trailers.mjs'));
    const humans = [
      ['Human Tester', 'human', 'example.invalid'], ['Claude Martin', 'claude.martin', 'example.invalid'],
      ['Gemini Patel', 'gemini', 'example.invalid'], ['Human Tester', 'human', 'cursor.com'],
    ].map(([name, local, domain]) => `${name} <${local}@${domain}>`);
    const message = 'Verify hook\n\nKeep this body.\n' + ['Claude', 'Codex', 'Cursor', 'Copilot', 'Gemini', 'GPT-6', 'Claude Code', 'GitHub Copilot', 'Cursor Agent', 'Claude Sonnet 4.5', 'Gemini 2.5 Pro', 'Claude Opus 4.6 (1M context)', 'Gemini CLI', 'OpenAI Codex'].map((ai) => `Co-Authored-By: ${ai} <bot@example.invalid>\n`).join('') + 'Co-Authored-By: Claude\nGenerated with a tool\n🤖 Generated with another tool\n' + humans.map((human) => `Co-Authored-By: ${human}\n`).join('');
    const file = path.join(dir, 'message'); writeFileSync(file, message);
    git('add', '.'); git('commit', '-q', '-F', file);
    const committed = git('log', '-1', '--format=%B');
    assert.match(committed, /Keep this body/); assert.match(committed, /Co-Authored-By: Human Tester/);
    for (const human of humans) assert.ok(committed.includes(`Co-Authored-By: ${human}`), human);
    assert.doesNotMatch(committed, /Generated with|<bot@example.invalid>|Co-Authored-By: Claude\n/);
    const cleanedFile = path.join(dir, '.git/COMMIT_EDITMSG');
    const once = readFileSync(cleanedFile, 'utf8');
    execFileSync(process.execPath, ['scripts/strip-ai-trailers.mjs', cleanedFile]);
    assert.equal(readFileSync(cleanedFile, 'utf8'), once);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
