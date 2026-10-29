#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, readdirSync, lstatSync, realpathSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const scratch = mkdtempSync(path.join(os.tmpdir(), 'loop-verify-'));
const skills = ['agentic-engineering-loop', 'software-factory', 'factory-review', 'factory-frontend'];
const destinations = {
  hermes: ['.hermes/skills/software-development'], claude: ['.claude/skills'],
  codex: ['.agents/skills', '.codex/skills'], opencode: ['.config/opencode/skills'], omp: ['.agents/skills'],
};
/** @param {string} source @param {string} target */
function sameTree(source, target) {
  assert.deepEqual(readdirSync(target).sort(), readdirSync(source).sort());
  for (const entry of readdirSync(source)) {
    const src = path.join(source, entry), dest = path.join(target, entry);
    if (lstatSync(src).isDirectory()) sameTree(src, dest);
    else assert.deepEqual(readFileSync(dest), readFileSync(src));
  }
}
/** @param {string} surface @param {string[]} args @param {string} home */
function invoke(surface, args, home) {
  return spawnSync(surface === 'node' ? process.execPath : 'bash',
    [path.join(root, surface === 'node' ? 'bin/install.js' : 'install.sh'), ...args],
    { encoding: 'utf8', env: { ...process.env, HOME: home }, cwd: root });
}
const lines = [];
try {
  for (const surface of ['node', 'shell']) {
    const help = invoke(surface, ['--help'], scratch);
    assert.equal(help.status, 0); assert.match(help.stdout, /Usage:/);
    const invalid = invoke(surface, ['--unknown'], scratch);
    assert.equal(invalid.status, 1); assert.match(invalid.stderr, /Unknown arg:/);
    for (const args of [[], ['install'], ['--mode', 'invalid']]) {
      const home = path.join(scratch, surface, `dispatch-${args.join('-') || 'default'}`);
      mkdirSync(home, { recursive: true });
      const result = invoke(surface, args, home);
      const positionalRejected = surface === 'shell' && args[0] === 'install';
      const invalidMode = args[0] === '--mode';
      assert.equal(result.status, positionalRejected || invalidMode ? 1 : 0, result.stderr);
      if (positionalRejected) assert.match(result.stderr, /Unknown arg: install/);
      else if (invalidMode) assert.match(result.stderr, /Unsupported --mode: invalid/);
      else for (const skill of skills) {
        const target = path.join(home, destinations.hermes[0], skill);
        assert.equal(lstatSync(target).isSymbolicLink(), false);
        sameTree(path.join(root, 'skills', skill), target);
      }
      lines.push(`${surface} ${args.join(' ') || 'default'}: dispatch and result verified`);
    }
    for (const mode of ['copy', 'symlink']) {
      for (const [agent, bases] of Object.entries(destinations)) {
        const home = path.join(scratch, surface, mode, agent);
        mkdirSync(home, { recursive: true });
        if (surface === 'shell' && agent === 'opencode') {
          const rejected = invoke(surface, ['--agent', agent, '--mode', mode], home);
          assert.equal(rejected.status, 1); assert.match(rejected.stderr, /Unsupported --agent: opencode/);
          assert.deepEqual(readdirSync(home), []);
          lines.push(`${surface} ${agent} ${mode}: confirmed base limitation, no writes`);
          continue;
        }
        for (let attempt = 0; attempt < 2; attempt++) {
          const result = invoke(surface, ['--agent', agent, '--mode', mode], home);
          assert.equal(result.status, 0, result.stderr);
          for (const base of bases) for (const skill of skills) {
            const target = path.join(home, base, skill), src = path.join(root, 'skills', skill);
            assert.equal(lstatSync(target).isSymbolicLink(), mode === 'symlink');
            if (mode === 'symlink') assert.equal(realpathSync(target), src);
            sameTree(src, target);
          }
        }
        lines.push(`${surface} ${agent} ${mode}: installed all four skills, content and repeat verified`);
      }
      const home = path.join(scratch, surface, mode, 'all'); mkdirSync(home, { recursive: true });
      const result = invoke(surface, ['--agent', 'all', '--mode', mode], home);
      assert.equal(result.status, surface === 'node' ? 0 : 1, result.stderr);
      if (surface === 'shell') assert.match(result.stderr, /Unsupported --agent: opencode/);
      for (const [agent, bases] of Object.entries(destinations)) {
        if (surface === 'shell' && ['opencode', 'omp'].includes(agent)) continue;
        for (const base of bases) for (const skill of skills) sameTree(path.join(root, 'skills', skill), path.join(home, base, skill));
      }
      lines.push(`${surface} all ${mode}: ${surface === 'node' ? 'all destinations verified' : 'base partial-install failure confirmed'}`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
assert.equal(existsSync(scratch), false);
mkdirSync(path.join(root, '.verify'), { recursive: true });
writeFileSync(path.join(root, '.verify', 'installer-transcript.txt'), lines.join('\n') + '\nScratch HOME removed; evidence retained.\n');
console.log(lines.join('\n'));
console.log('PASS: isolated CLI verification; scratch HOME removed');
