import { readFileSync, writeFileSync } from 'node:fs';
const file = process.argv[2];
if (!file) throw new Error('Expected commit message path');
const message = readFileSync(file, 'utf8');
/** @param {string} line */
function isAiCoauthor(line) {
  const match = /^\s*Co-Authored-By:\s*([^<>]*?)(?:\s*<([^>]+)>)?\s*$/i.exec(line);
  if (!match) return false;
  const [, name, email] = match;
  const botEmails = [['noreply', 'anthropic.com'], ['cursoragent', 'cursor.com']];
  if (botEmails.some(([local, domain]) => email?.toLowerCase() === `${local}@${domain}`)) return true;
  if (/^(?:copilot-swe-agent|gemini-code-assist)\[bot\]$/i.test(name)) return true;
  const version = String.raw`\d+(?:[.-]\d+)*`;
  const claude = String.raw`Claude(?: Code|[- ](?:Opus|Sonnet|Haiku|Fable)(?:[- ]${version})?(?: \(\d+[MK] context\))?)?`;
  const gemini = String.raw`Gemini(?: CLI|[- ]${version}(?:[- ](?:Pro|Flash)(?:[- ]Lite)?)?(?:[- ]Preview)?)?`;
  const gpt = String.raw`GPT(?:[- ]${version}(?:[- ]Codex(?:[- ]Max)?)?)?`;
  return new RegExp(String.raw`^(?:${claude}|${gemini}|${gpt}|ChatGPT|(?:OpenAI )?Codex(?: CLI)?|Cursor(?: Agent)?|(?:GitHub )?Copilot)(?:\s*\[bot\])?$`, 'i').test(name);
}
const cleaned = message.split(/(?<=\n)/).filter((line) =>
  !isAiCoauthor(line) && !/^\s*(?:[🤖✨]\s*)?Generated with\b/iu.test(line));
writeFileSync(file, cleaned.join(''));
