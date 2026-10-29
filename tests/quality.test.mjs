import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, cpSync, symlinkSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

test('the quality gate rejects synthetic defects and tool errors', { timeout: 240000 }, () => {
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
    const directives = [
      '// @ts-nocheck', '// @TS-NOCHECK', '// @Ts-NoChEcK', '/// @ts-nocheck', '// @ts-ignore', '/// @ts-ignore',
      '// @ts-expect-error', '/// @ts-expect-error', '/* @ts-ignore */',
      '/** @ts-expect-error */', '/*\n * @ts-ignore */', '/*\n @ts-expect-error */',
      '/**/ // @ts-nocheck', 'const value = 1; // @ts-ignore',
      '/*\n * jscpd:ignore-start\n */', ...['public', 'internal', 'alpha', 'beta', 'alias'].map((tag) => `/** @${tag} */`),
    ];
    const probes = directives.map((comment, i) => {
      const file = `scripts/directive-${i}.cjs`;
      writeFileSync(path.join(dir, file), `${comment}\nconsole.log('probe');\n`);
      return file;
    });
    const hook = path.join(dir, '.githooks/commit-msg');
    const hookText = readFileSync(hook, 'utf8');
    writeFileSync(hook, hookText + '\n# shellcheck source=/dev/null\n');
    const shell = '.githooks/synthetic-shell';
    writeFileSync(path.join(dir, shell), '#!/usr/bin/env bash\n# shellcheck disable=SC2086\necho $unquoted\n');
    const suppressed = gate(['--checks-only']);
    assert.equal(suppressed.status, 1, suppressed.stdout + suppressed.stderr);
    const suppressionFindings = JSON.parse(suppressed.stderr);
    for (const file of [...probes, '.githooks/commit-msg', shell]) {
      assert.ok(suppressionFindings.some(/** @param {{tool: string, file: string}} finding */
        (finding) => finding.tool === 'suppression' && finding.file === file), file);
    }
    for (const file of probes) rmSync(path.join(dir, file));
    writeFileSync(hook, hookText);
    writeFileSync(path.join(dir, shell), '#!/bin/sh\necho $unquoted\n');
    const shellError = gate(['--checks-only']);
    assert.equal(shellError.status, 1, shellError.stdout + shellError.stderr);
    assert.match(shellError.stderr, /SC2086/);
    rmSync(path.join(dir, shell));

    const locations = ['', 'bin/', 'scripts/', 'lib/', 'src/', '.githooks/', '.hidden/nested/', 'skills/synthetic/scripts/'];
    const sources = locations.flatMap((location) => ['js', 'mjs', 'cjs'].map((extension) => `${location}synthetic.${extension}`));
    for (const file of sources) {
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(path.join(dir, file), 'const unused = 1;\nconsole.log((1).toUpperCase());\n');
    }
    const coverage = gate(['--checks-only']);
    assert.equal(coverage.status, 1, coverage.stdout + coverage.stderr);
    const coverageFindings = JSON.parse(coverage.stderr);
    for (const file of sources) {
      for (const tool of ['eslint', 'types']) assert.ok(coverageFindings.some(
        /** @param {{tool: string, file: string}} finding */
        (finding) => finding.tool === tool && finding.file === file), `${tool}: ${file}`);
      rmSync(path.join(dir, file));
    }
    const unsupported = ['ts', 'mts', 'cts', 'jsx', 'tsx'].map((extension) => `src/unsupported.${extension}`);
    for (const file of unsupported) writeFileSync(path.join(dir, file), 'export const value = 1;\n');
    const uncovered = gate(['--checks-only']);
    assert.equal(uncovered.status, 1, uncovered.stdout + uncovered.stderr);
    const uncoveredFindings = JSON.parse(uncovered.stderr);
    for (const file of unsupported) {
      assert.ok(uncoveredFindings.some(/** @param {{rule: string, file: string}} finding */
        (finding) => finding.rule === 'unsupported-source-extension' && finding.file === file), file);
      rmSync(path.join(dir, file));
    }
    const deleted = path.join(dir, 'scripts/deleted.cjs');
    writeFileSync(deleted, 'console.log("deleted");\n');
    execFileSync('git', ['add', 'scripts/deleted.cjs'], { cwd: dir });
    rmSync(deleted);
    const strings = path.join(dir, 'scripts/strings.cjs');
    writeFileSync(strings, 'console.log("// @ts-nocheck", `/** @public */`);\n');
    const clean = gate(['--checks-only']);
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    rmSync(strings);
    writeFileSync(path.join(dir, 'bin/unused.cjs'), 'exports.unused = 1;\n');
    const unused = spawnSync(path.resolve('node_modules/.bin/knip'), [], { cwd: dir, encoding: 'utf8' });
    assert.notEqual(unused.status, 0); assert.match(unused.stdout, /bin\/unused.cjs/);
    rmSync(path.join(dir, 'bin/unused.cjs'));
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
