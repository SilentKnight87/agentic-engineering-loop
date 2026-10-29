import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, cpSync, symlinkSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

test('the quality gate rejects synthetic defects and tool errors', { timeout: 120000 }, () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'loop-gate-'));
  try {
    const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
    for (const file of files) cpSync(file, path.join(dir, file), { recursive: true });
    symlinkSync(path.resolve('node_modules'), path.join(dir, 'node_modules'), 'dir');
    execFileSync('git', ['init', '-q', dir]);
    execFileSync('git', ['add', '.'], { cwd: dir });
    /** @param {string[]} args */
    const gate = (args) => spawnSync(process.execPath, ['scripts/quality.mjs', ...args], { cwd: dir, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    writeFileSync(path.join(dir, 'scripts/bad.mjs'), 'const unused = 1;\nconst number = 1;\nconsole.log(number.toUpperCase());\ntry { JSON.parse("x"); } catch {}\n// eslint-disable-next-line no-unused-vars\nconst hidden = 2;\n');
    writeFileSync(path.join(dir, 'bad.md'), '# Title\n\n# Second title\n');
    writeFileSync(path.join(dir, 'bad.sh'), '#!/bin/sh\necho $unquoted\n');
    const rejected = gate(['--checks-only']);
    assert.equal(rejected.status, 1, rejected.stdout + rejected.stderr);
    for (const rule of ['no-unused-vars', 'no-empty', 'TS2339', 'MD025', 'SC2086']) assert.ok(rejected.stderr.includes(rule), rule + rejected.stderr);
    rmSync(path.join(dir, 'scripts/bad.mjs')); rmSync(path.join(dir, 'bad.md')); rmSync(path.join(dir, 'bad.sh'));
    writeFileSync(path.join(dir, 'bin/unused.mjs'), 'export const unused = 1;\n');
    const unused = spawnSync(path.resolve('node_modules/.bin/knip'), [], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(unused.status, 0); assert.match(unused.stdout, /bin\/unused.mjs/);
    rmSync(path.join(dir, 'bin/unused.mjs'));
    writeFileSync(path.join(dir, 'bin/library.mjs'), 'export const used = 1;\nexport const unused = 2;\n');
    writeFileSync(path.join(dir, 'scripts/consumer.mjs'), 'import { used } from "../bin/library.mjs";\nconsole.log(used);\n');
    const exported = spawnSync(path.resolve('node_modules/.bin/knip'), [], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(exported.status, 0); assert.match(exported.stdout, /Unused exports/);
    rmSync(path.join(dir, 'bin/library.mjs')); rmSync(path.join(dir, 'scripts/consumer.mjs'));

    execFileSync('git', ['fetch', '-q', path.resolve('.'), JSON.parse(readFileSync('quality-baseline.json', 'utf8')).base], { cwd: dir });
    const clone = Array.from({ length: 30 }, (_, i) => `console.log('synthetic clone ${i}');`).join('\n') + '\n';
    for (const name of ['clone-a', 'clone-b']) writeFileSync(path.join(dir, `scripts/${name}.mjs`), clone);
    const duplicate = gate(['--skip-tests']);
    assert.equal(duplicate.status, 1, duplicate.stdout + duplicate.stderr);
    assert.match(duplicate.stderr, /jscpd found 1 new clones/);
    for (const name of ['clone-a', 'clone-b']) rmSync(path.join(dir, `scripts/${name}.mjs`));
    writeFileSync(path.join(dir, 'eslint.config.mjs'), 'throw new Error("synthetic tool failure");\n');
    const broken = gate(['--checks-only']);
    assert.notEqual(broken.status, 0); assert.match(broken.stderr, /synthetic tool failure/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
