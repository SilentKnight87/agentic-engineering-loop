# Copy installation

## Sub-features

Install all four skills into the requested agent directories.

## How to get to it (user POV)

Run either installer with `--agent TARGET --mode copy`.

## Driving it with the CLI harness

Run `npm run verify`. It invokes each public installer with a fresh synthetic HOME.
Every installed directory has identical entries and bytes to `skills/`. The second
installation must produce the same result.
The transcript names each surface, agent, mode, and observed result.

## Gotchas

The base Bash installer advertises OpenCode but has no OpenCode dispatch branch.
Direct OpenCode requests fail before writes. Bash `all` fails after partial writes.
These are recorded base limitations, not successful installations. Product fixes
are outside this kit. Node supports all advertised agent targets.
