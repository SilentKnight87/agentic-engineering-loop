#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
let agent = 'hermes';
let mode = 'copy';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--agent') agent = args[++i];
  else if (args[i] === '--mode') mode = args[++i];
  else if (args[i] === '-h' || args[i] === '--help') {
    console.log('Usage: npx github:SilentKnight87/agentic-engineering-loop --agent hermes|claude|codex|opencode|all [--mode copy|symlink]');
    process.exit(0);
  } else if (args[i] === 'install') {
    // allow: npx ... install --agent hermes
  } else {
    console.error(`Unknown arg: ${args[i]}`);
    process.exit(1);
  }
}

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'skills', 'agentic-engineering-loop');

function copyDir(srcDir, destDir) {
  fs.rmSync(destDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  if (mode === 'symlink') fs.symlinkSync(srcDir, destDir, 'dir');
  else if (mode === 'copy') fs.cpSync(srcDir, destDir, { recursive: true });
  else throw new Error(`Unsupported --mode: ${mode}`);
}

function installOne(name, dest) {
  copyDir(src, dest);
  console.log(`installed ${name} -> ${dest}`);
}

const home = os.homedir();
const targets = {
  hermes: [["hermes", path.join(home, '.hermes', 'skills', 'software-development', 'agentic-engineering-loop')]],
  claude: [["claude", path.join(home, '.claude', 'skills', 'agentic-engineering-loop')]],
  codex: [["codex", path.join(home, '.agents', 'skills', 'agentic-engineering-loop')], ["codex-legacy", path.join(home, '.codex', 'skills', 'agentic-engineering-loop')]],
  opencode: [["opencode", path.join(home, '.config', 'opencode', 'skills', 'agentic-engineering-loop')]],
};

if (agent === 'all') {
  Object.values(targets).flat().forEach(([name, dest]) => installOne(name, dest));
} else if (targets[agent]) {
  targets[agent].forEach(([name, dest]) => installOne(name, dest));
} else {
  console.error(`Unsupported --agent: ${agent}`);
  process.exit(1);
}
