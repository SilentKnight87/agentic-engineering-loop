import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) throw new Error('Expected commit message path');
const message = readFileSync(file, 'utf8');
const cleaned = message.split(/(?<=\n)/).filter((line) =>
  !/^\s*Co-Authored-By:.*\b(?:Claude|Codex|Cursor|Copilot|Gemini|GPT(?:-\w+)?)\b/i.test(line) &&
  !/^\s*(?:[🤖✨]\s*)?Generated with\b/iu.test(line));
writeFileSync(file, cleaned.join(''));
