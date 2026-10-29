import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) throw new Error('Expected commit message path');
const message = readFileSync(file, 'utf8');
/** @param {string} line */
function isAiCoauthor(line) {
  const match = /^\s*Co-Authored-By:\s*([^<>]*?)(?:\s*<([^>]+)>)?\s*$/i.exec(line);
  if (!match) return false;
  const [, name] = match;
  return /^(?:Claude(?: Code| (?:Opus|Sonnet|Haiku)(?:[- ][\d.]+)?)?|Codex|Cursor(?: Agent)?|(?:GitHub )?Copilot|Gemini(?:[- ][\d.]+(?: (?:Pro|Flash))?)?|GPT(?:[- ][\w.]+)?)(?:\s*\[bot\])?$/i.test(name);
}
const cleaned = message.split(/(?<=\n)/).filter((line) =>
  !isAiCoauthor(line) && !/^\s*(?:[🤖✨]\s*)?Generated with\b/iu.test(line));
writeFileSync(file, cleaned.join(''));
