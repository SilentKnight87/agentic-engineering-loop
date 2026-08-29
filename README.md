# Agentic Engineering Loop -> Software Factory

Reusable agent skills for shipping software with an explicit loop, now grown
into a small software factory:

```text
idea -> triage -> brainstorm? -> plan -> sign-off -> implement (1 take or N variations)
     -> cross-vendor review -> fix -> loop -> merge -> compound
```

Four skills:

| Skill | What it does |
|---|---|
| [`agentic-engineering-loop`](skills/agentic-engineering-loop/SKILL.md) | The core loop: triage, brainstorm, plan, sign-off, implement, adversarial review, bounded fix loop, merge, compound. v2 routes by **harness roles** (plan/task/smol/advisor/vision/slow), never concrete models, and adds a variations mode (N parallel takes in separate worktrees, user picks or combines). |
| [`software-factory`](skills/software-factory/SKILL.md) | Orchestration: one pod per project (cmux workspaces or supervised processes), worktree isolation, operator-in-the-loop or headless (Hermes/cron) invocation, quota-aware concurrency, failure handling. |
| [`factory-review`](skills/factory-review/SKILL.md) | The review phase: risk-driven persona roster (correctness, security/STRIDE, performance, plan-vs-diff, evidence audit, blast radius, unslop, doubt pass), cross-vendor invariant, P0/P1/P2 output contract. |
| [`factory-frontend`](skills/factory-frontend/SKILL.md) | Anti-slop frontend lane: taste capture + reference-driven DESIGN.md, build pass calibrated against known AI-look clusters, dual review gate (visual taste + measurable web quality). |

## Design principles

- **Roles, not models.** Concrete model names live in ONE file:
  [`references/model-routing.md`](skills/agentic-engineering-loop/references/model-routing.md).
  Subscriptions change; skills don't.
- **Redundancy.** Every role has a fallback chain crossing at least two
  subscriptions; the harness rotates on quota errors.
- **Cross-vendor review.** The reviewer never shares the implementer's vendor.
- **Nuggets, not frameworks.** Vetted imports from Compound Engineering,
  superpowers, gstack, pstack, and Addy Osmani's skills — decisions recorded in
  [`references/skill-map.md`](skills/agentic-engineering-loop/references/skill-map.md).
- **Hard loop control.** 5-round review cap, stall detection, explicit
  escalation gates. Never loop forever; never silently accept P1s.
- **Compound.** One learning per run into `docs/solutions/`, read by the next
  run's plan phase.

## Install

### Hermes Agent — direct GitHub install

```bash
hermes skills install SilentKnight87/agentic-engineering-loop/skills/agentic-engineering-loop
```

(Repeat with `software-factory`, `factory-review`, `factory-frontend`.)

### Local installer for Hermes / Claude Code / Codex / OpenCode / OMP

```bash
git clone https://github.com/SilentKnight87/agentic-engineering-loop.git
cd agentic-engineering-loop
./install.sh --agent omp        # or hermes|claude|codex|opencode|all
```

### NPM / npx shape

```bash
npx github:SilentKnight87/agentic-engineering-loop --agent omp
```

## How to use

Single project, you in the loop:

```text
Use the agentic-engineering-loop skill. I have a rough idea for a CLI that
audits my cloud spend and proposes safe cost reductions.
```

Several projects in parallel, orchestrated:

```text
Use the software-factory skill. Pods: coupon-automation, portfolio-site,
solo-leveling. Plans are in each repo's docs/plans/.
```

Headless (invoked by Hermes or cron; plan must already be signed off):

```bash
omp -p --cwd <worktree> "Load the agentic-engineering-loop skill and execute docs/plans/<plan>.md. Headless mode."
```

## Repository shape

```text
skills/
├── agentic-engineering-loop/
│   ├── SKILL.md
│   └── references/
│       ├── model-routing.md            # the ONLY place model names appear
│       ├── skill-map.md                # vetted skill-to-phase decisions
│       ├── research-recipe.md          # research skills + auth prerequisites
│       ├── build-review-loop-control-policy.md
│       └── current-agentic-loop-patterns-2026-06-18.md
├── software-factory/SKILL.md
├── factory-review/SKILL.md
└── factory-frontend/SKILL.md
```

`SKILL.md` at the repo root mirrors the canonical loop skill for convenience.

## Security / privacy guardrails

- GitHub Actions runs Gitleaks on every push/PR and `npm audit` when a
  lockfile exists.
- No private identifiers in guardrail code; verify releases from a fresh clone.

## License

MIT
