# Symlink installation

## Sub-features

Link all four skill directories to the checkout.

## How to get to it (user POV)

Run either installer with `--agent TARGET --mode symlink`.

## Driving it with the CLI harness

Run `npm run verify`. It invokes each public installer with a fresh synthetic HOME.
Each installed skill is a symlink resolving to its matching `skills/` directory.
All content remains readable after the second installation.
The transcript names each surface, agent, mode, and observed result.

## Gotchas

The base Bash installer advertises OpenCode but has no OpenCode dispatch branch.
Direct OpenCode requests fail before writes. Bash `all` fails after partial writes.
These are recorded base limitations, not successful installations. Product fixes
are outside this kit. Node supports all advertised agent targets.
