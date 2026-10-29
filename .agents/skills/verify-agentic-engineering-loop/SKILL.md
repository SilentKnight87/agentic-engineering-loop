---
name: verify-agentic-engineering-loop
description: Verify the Agentic Engineering Loop Node and shell installer CLIs in isolated synthetic homes before claiming an installer or environment-kit change works.
---

# Verify Agentic Engineering Loop

## Launch

Run from the repository root with Node 22 or newer, npm, Git, Bash, and ShellCheck.
Run `npm ci`, then `node bin/install.js --help` and `bash install.sh --help`.
Both must exit zero and print `Usage:`. These are short-lived CLIs with no server,
login, credentials, ports, or database. Do not run an installer against your own HOME.

## Doctor

Run `node --version`, `git status --short`, and `npm ls --depth=0`.
Read `bin/install.js` and `install.sh` when a destination or agent changes.
A dirty tree is fine while developing; fleet receipts require a committed candidate.

## Drive

Run `npm run verify`. The executable helper is
`node .agents/skills/verify-agentic-engineering-loop/scripts/drive.mjs`.
It creates separate synthetic homes for each surface, target, and mode. It runs the
real CLI twice, checks every installed file against the source, and checks symlink
identity. It also drives help, invalid arguments, and the `all` target.

See [the feature map](features/README.md) for the journeys and base limitations.
A nonzero exit from the helper is a verification failure. Do not weaken a journey
to hide a product regression. No external service is mocked or contacted.

## Evidence

The helper records actions and assertions in `.verify/installer-transcript.txt`.
`npm run quality` also runs these installer tests, an actual Git commit through the
hook, and synthetic known-bad gate probes. All are portable in CI.

For a committed candidate, use the installed fleet tools if available:

```sh
fleet-evidence init --base origin/main --recipe .agents/skills/verify-agentic-engineering-loop/SKILL.md
fleet-evidence run -- npm run quality
fleet-evidence run -- npm run verify
fleet-evidence artifact .verify/installer-transcript.txt
fleet-evidence finalize --verdict pass --builder codex/gpt-6.1-sol --verifier codex/gpt-6.1-sol
fleet-evidence gate --base origin/main
```

These identities record a builder self-check. Medium risk work still needs an
independent verifier from another family and `gate --require-independent`.
Never put personal data or credentials in fixtures or evidence.

## Cleanup

The helper removes only the temporary HOME directories it created, even on failure.
There is no background process to stop. Evidence remains under `.verify/` after
cleanup. Confirm `test -s .verify/installer-transcript.txt` after the drive.
The repository and the user's installed skills are never cleanup targets.

## Helpers

`npm run verify` runs the executable drive helper above.
`npm run quality` runs the deterministic gate described in `docs/quality.md`.
