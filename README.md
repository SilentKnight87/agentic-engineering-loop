# Agentic Engineering Loop

A reusable agent skill for shipping software with an explicit loop:

```text
idea -> triage -> brainstorm? -> plan -> sign-off -> implement -> review -> fix -> loop -> merge -> compound
```

The workflow combines:

- Compound Engineering style `brainstorm -> plan -> work -> review -> compound`
- GLM 5.2 via OpenCode Go for ideation, planning, implementation, and fixes
- GPT-5.5 via Codex OAuth for adversarial review
- hard review-loop caps, stall detection, and explicit escalation gates

This repo is currently published as a portable `SKILL.md`-based agent skill. It is
not yet a heavyweight NPM/plugin package with bundled agents/hooks, but it is laid
out so it can grow into that.

## Install

### Hermes Agent — direct GitHub install

```bash
hermes skills install SilentKnight87/agentic-engineering-loop/skills/agentic-engineering-loop
```

### Hermes Agent — tap install

```bash
hermes skills tap add SilentKnight87/agentic-engineering-loop
hermes skills search agentic-engineering-loop
hermes skills install SilentKnight87/agentic-engineering-loop/agentic-engineering-loop
```

Hermes taps expect skills under `skills/<skill-name>/SKILL.md`, which is this
repo's canonical layout.

### Local installer for Hermes / Claude Code / Codex / OpenCode

```bash
git clone https://github.com/SilentKnight87/agentic-engineering-loop.git
cd agentic-engineering-loop
./install.sh --agent hermes
# or: ./install.sh --agent claude
# or: ./install.sh --agent codex
# or: ./install.sh --agent opencode
```

Install all supported targets:

```bash
./install.sh --agent all
```

### NPM / npx shape

This repo includes a tiny `package.json` + `bin/install.js` wrapper so it can be
used directly from GitHub with npx:

```bash
npx github:SilentKnight87/agentic-engineering-loop --agent hermes
```

This is intentionally lightweight. If this becomes a broader marketplace/plugin,
the next step is publishing an official npm package and adding richer adapters.

## Repository Shape

```text
agentic-engineering-loop/
├── README.md
├── SKILL.md                                  # convenience mirror
├── skills/
│   └── agentic-engineering-loop/
│       ├── SKILL.md                          # canonical skill
│       └── references/
│           ├── build-review-loop-control-policy.md
│           ├── current-agentic-loop-patterns-2026-06-18.md
│           └── opencode-go-routing.md
├── docs/
│   └── sharing-research.md
├── .claude-plugin/
│   └── plugin.json                           # Claude Code plugin-compatible metadata
├── install.sh                                # multi-agent installer
├── package.json                              # npx wrapper metadata
└── bin/
    └── install.js
```

## How to Use

In a Hermes/Claude/Codex/OpenCode session, ask the agent to load or follow the
`agentic-engineering-loop` skill before starting a software build.

Example:

```text
Use the agentic-engineering-loop skill. I have a rough idea for a CLI that audits
my cloud spend and proposes safe cost reductions.
```

The skill will route the task based on how formed the idea is:

| Input shape | Entry point |
|---|---|
| No direction / "what should I build?" | Ideate |
| Vague but directed idea | Brainstorm -> Plan |
| Defined bug, feature, or requirements doc | Plan |
| Ambiguous scope | Ask for a decision |

## Model Policy

| Phase | Model | Effort |
|---|---|---|
| Ideate | GLM 5.2 via OpenCode Go | xhigh |
| Brainstorm | GLM 5.2 via OpenCode Go | xhigh; max only for novel architecture |
| Plan | GLM 5.2 via OpenCode Go | xhigh; max only for novel architecture |
| Implement | GLM 5.2 via OpenCode Go | high |
| First review | GPT-5.5 via Codex OAuth | xhigh |
| Re-review | GPT-5.5 via Codex OAuth | high |
| Fix | GLM 5.2 via OpenCode Go | high cycles 1-3; medium cycles 4-5 |
| Compound | GLM 5.2 via OpenCode Go | high |

## Loop Control

- Hard cap: 5 review rounds
- Soft escalation: after round 3 if P0/P1 remain
- Stall detection: escalate if P0/P1 count stops decreasing
- P2/P3: log/defer; do not loop
- P0/P1: fix or explicitly escalate

## Why This Shape

Current agent ecosystems are converging on a shared structure:

- **Hermes Agent:** GitHub taps with `skills/<name>/SKILL.md` plus optional `references/`, `templates/`, `scripts/`, `assets/`
- **Claude Code:** `skills/<name>/SKILL.md`, or plugin repos with `.claude-plugin/plugin.json`
- **Codex / Open Agent Skills:** `SKILL.md` directories, often under `.agents/skills/` for repo scope
- **Community repos:** usually combine `skills/`, optional install scripts, and sometimes npm/npx wrappers

So this repo uses the smallest interoperable core: a canonical `SKILL.md` folder
with references, plus simple installers/adapters.

See [`docs/sharing-research.md`](docs/sharing-research.md) for the research notes.


## Security / Privacy Guardrails

This repo intentionally does **not** track a custom PII denylist scanner. Public
repos should not commit private identifiers into guardrail code.

Current repo guardrails:

- GitHub Actions runs Gitleaks on every push/PR.
- GitHub Actions runs `npm audit` when a lockfile exists.
- `.gitignore` blocks local privacy scanner files from being committed.
- Before publishing, run an external local scan from outside the repo and verify
  git metadata with `git log --format='%h %an <%ae> | %cn <%ce> | %s' --all`.
- Public releases should be verified from a fresh clone, not only the local checkout.

## License

MIT
