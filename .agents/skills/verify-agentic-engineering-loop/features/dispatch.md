# CLI dispatch

## Sub-features

Show help, reject unknown arguments, and dispatch the all-agent target.

## How to get to it (user POV)

Use `--help`, `--unknown`, or `--agent all` on either installer.

## Driving it with the CLI harness

Run `npm run verify`. It invokes each public installer with a fresh synthetic HOME.
Help exits zero with usage. Unknown arguments exit one. Node all-agent mode
installs every target. Bash all-agent mode fails when it reaches OpenCode, after
installing Hermes, Claude, and Codex; the helper checks those partial writes.
The transcript names each surface, agent, mode, and observed result.

## Gotchas

The base Bash installer advertises OpenCode but has no OpenCode dispatch branch.
Direct OpenCode requests fail before writes. Bash `all` fails after partial writes.
These are recorded base limitations, not successful installations. Product fixes
are outside this kit. Node supports all advertised agent targets.
