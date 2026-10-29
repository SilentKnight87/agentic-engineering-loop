import { ESLint } from 'eslint';
import { lint } from 'markdownlint/sync';
import ts from 'typescript';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/** @type {{tool: string, file: string, rule: string, message: string, source: string}[]} */
const findings = [];
/** @param {string} file @param {number} line */
const source = (file, line) => readFileSync(file, 'utf8').split(/\r?\n/)[line - 1]?.trim() ?? '';
/** @param {string} command @param {string[]} args @param {number[]} allowed */
function run(command, args, allowed = [0]) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  if (result.error || !allowed.includes(result.status ?? -1)) {
    throw new Error(`${command} failed (${result.status}): ${result.error ?? ''}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}
const files = run('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
  .split('\0').filter((file) => file && existsSync(file) && statSync(file).isFile());
for (const file of files.filter((file) => /\.(?:[cm]?ts|jsx|tsx)$/.test(file))) {
  findings.push({ tool: 'coverage', file, rule: 'unsupported-source-extension',
    message: 'Configure lint and type coverage before adding this source extension', source: '' });
}
const javascript = files.filter((file) => /\.(?:[cm]?js)$/.test(file));
const shells = files.filter((file) => file.endsWith('.sh') ||
  /^#!.*\b(?:bash|sh|dash|ksh|zsh)\b/.test(readFileSync(file, 'utf8').split('\n')[0]));
/** @param {string} file @param {string} comment */
function checkComment(file, comment) {
  if (/@ts-(?:ignore|nocheck|expect-error)|shellcheck\s+(?:disable|source\s*=\s*\/dev\/null)|jscpd:ignore|@(public|internal|alpha|beta|alias)\b/i.test(comment)) {
    findings.push({ tool: 'suppression', file, rule: 'no-suppressions', message: 'Do not suppress quality findings', source: comment.trim() });
  }
}
for (const file of javascript) {
  const text = readFileSync(file, 'utf8');
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const comments = new Map();
  /** @param {ts.Node} node */
  function visit(node) {
    for (const range of [...ts.getLeadingCommentRanges(text, node.pos) ?? [], ...ts.getTrailingCommentRanges(text, node.end) ?? []]) {
      comments.set(range.pos, text.slice(range.pos, range.end));
    }
    for (const child of node.getChildren(tree)) visit(child);
  }
  visit(tree);
  for (const comment of comments.values()) checkComment(file, comment);
}
for (const file of shells) {
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (/^\s*#/.test(line)) checkComment(file, line);
  }
}
const eslint = new ESLint();
for (const result of await eslint.lintFiles(javascript)) {
  for (const msg of result.messages) {
    if (msg.fatal) throw new Error(`ESLint could not analyze ${result.filePath}: ${msg.message}`);
    findings.push({ tool: 'eslint', file: path.relative(process.cwd(), result.filePath), rule: msg.ruleId ?? 'configuration-warning',
      message: msg.message, source: source(result.filePath, msg.line) });
  }
}
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
const program = ts.createProgram(javascript, parsed.options);
for (const diagnostic of [...parsed.errors, ...ts.getPreEmitDiagnostics(program)]) {
  if (!diagnostic.file || diagnostic.start === undefined) throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  const file = path.relative(process.cwd(), path.resolve(diagnostic.file.fileName));
  findings.push({ tool: 'types', file, rule: `TS${diagnostic.code}`,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    source: source(file, diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1) });
}
const markdown = lint({ files: files.filter((file) => file.endsWith('.md')),
  config: JSON.parse(readFileSync('.markdownlint.json', 'utf8')), noInlineConfig: true });
for (const [file, errors] of Object.entries(markdown)) {
  for (const error of errors) findings.push({ tool: 'markdownlint', file, rule: error.ruleNames[0],
    message: error.errorDetail ?? error.ruleDescription, source: source(file, error.lineNumber) });
}
/** @type {{file: string, line: number, code: number, message: string}[]} */
const shellFindings = JSON.parse(run('shellcheck', ['--norc', '--format=json', '--severity=style', ...shells], [0, 1]));
for (const msg of shellFindings) findings.push({ tool: 'shellcheck', file: msg.file,
  rule: `SC${msg.code}`, message: msg.message, source: source(msg.file, msg.line) });
const occurrences = new Map();
const records = findings.map((finding) => {
  const identity = JSON.stringify(finding);
  const occurrence = (occurrences.get(identity) ?? 0) + 1;
  occurrences.set(identity, occurrence);
  return { ...finding, occurrence, fingerprint: createHash('sha256').update(`${identity}:${occurrence}`).digest('hex') };
});
if (process.argv.includes('--write-baseline')) {
  const base = process.argv[process.argv.indexOf('--write-baseline') + 1];
  if (!/^[a-f0-9]{40}$/.test(base ?? '')) throw new Error('Baseline requires full base SHA');
  writeFileSync('quality-baseline.json', JSON.stringify({ base, findings: records }, null, 2) + '\n');
  console.log(`Recorded ${records.length} findings at ${base}`);
} else {
  const baseline = JSON.parse(readFileSync('quality-baseline.json', 'utf8'));
  const accepted = new Set(baseline.findings.map(/** @param {{fingerprint: string}} item */ (item) => item.fingerprint));
  const added = records.filter((item) => !accepted.has(item.fingerprint));
  console.log(`Lint/types: ${records.length} existing findings, ${added.length} new`);
  if (added.length) { console.error(JSON.stringify(added, null, 2)); process.exit(1); }
  if (process.argv.includes('--checks-only')) process.exit(0);
  mkdirSync('.verify', { recursive: true });
  console.log(run('node_modules/.bin/knip', []));
  console.log(run('npm', ['run', 'check:duplicates', '--', '--baseline-from-ref', baseline.base]));
  if (!process.argv.includes('--skip-tests')) console.log(run(process.execPath, ['--test', ...files.filter((file) => file.endsWith('.test.mjs'))]));
}
