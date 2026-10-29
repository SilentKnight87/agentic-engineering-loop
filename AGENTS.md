# Working agreement

## Proof

Use `.agents/skills/verify-agentic-engineering-loop/SKILL.md` for the installer CLI.
Run `npm run quality` for lint, types, duplication, unused code, and tests.
Run both before claiming done.

Install dependencies with `npm ci`. Install ShellCheck separately (`brew install
shellcheck` on macOS, `sudo apt-get install shellcheck` on Ubuntu).
Enable the repository commit message hook with `git config core.hooksPath .githooks`.
The hook removes AI co-author trailers and generated-with lines while preserving
human co-authors. It does not change global Git configuration.

The accepted findings in `quality-baseline.json` come from the recorded base commit,
using the current gate configuration. Fingerprints include rule, path, message,
source text, and occurrence, so moved findings survive and added copies fail.
Do not grow the baseline or add suppressions to pass a change.
See `docs/quality.md` for the reproducible baseline procedure and gate checks.
