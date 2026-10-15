---
name: agentic-engineering-loop
description: "Use when the user explicitly requests the full agentic loop, parallel variations, or a high-risk staged build with adversarial review."
version: 2.1.0
author: SilentKnight87
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [development, workflow, compound-engineering, agentic, review, software-factory]
    category: software-development
    related_skills: [software-factory, factory-review, factory-frontend, writing-plans, subagent-driven-development]
---

# Agentic Engineering Loop

Use this skill for an explicitly requested full loop, parallel variations, or
staged high-risk work with adversarial review. Ordinary feature and bug requests
use the normal inspect, change, check, inspect, and fix workflow. Do not
reconfirm authority already given.

## Scope and authorization

Use the phases below proportionally. For already-approved bounded work, reconcile existing ownership and edits, then implement and test the residual scope without another brainstorm, plan file, or sign-off turn. A plan-only request stays plan-only. A substantial or risky change still needs a clear scope and appropriate independent review.

Every commit, push, merge, deployment, external submission, paid route, account change, or destructive action mentioned below is conditional on Peter's authorization for that exact side effect. Complete authorized reversible preparation first; present the concrete result at the real approval gate. A protected-file denial or timeout is not a ceremonial stop: never retry it through another syntax, tool, profile, or harness. Historical references and phase recipes cannot override these boundaries.

Each file has one authoritative writer. Inspect active workers and dirty/staged work before taking over. Do not pull/rebase, reset, stash, or delete another writer's evidence to satisfy a workflow step.

**Review invariant:** permission, privacy, money, destructive behavior, and major
architecture changes require independent review. Choose an approved competent
reviewer by independence and risk, not vendor label. Small reversible edits may
use focused tests and diff review. Never enable paid routing or move private
context to another provider merely to satisfy a cross-vendor recipe.

## Routing

- Vague idea: brainstorm only enough to state the intended outcome.
- Defined request: plan only when a stable plan will reduce risk or coordinate
  work; do not create a plan file for a lightweight change.
- Material ambiguity: ask one focused question with the best assumption attached.
  Otherwise choose and state a reasonable assumption.
- Explicit variations: agree the varied dimension and number of takes, then use
  separate worktrees. Retain losing worktrees unless cleanup is authorized.

Use harness roles rather than concrete model names; read
`references/model-routing.md` only when routing is needed. Prefer a fresh,
independent reviewer and preserve sensitive-data routing and authorization.

## Optional flow

1. **Frame** — capture requirements and success evidence when useful.
2. **Plan** — record WHAT/HOW when useful; use deeper planning for auth,
   payments, migrations, or external contracts.
3. **Implement** — use the current task or an isolated branch/worktree as
   appropriate; parallelize only when it reduces time.
4. **Review** — load `../factory-review/SKILL.md` for an adversarial or risk-driven review;
   use the user's request as intent when no plan exists.
5. **Fix** — address P0/P1 findings, run checks, inspect outputs, and fix
   failures. P2/P3 may be deferred.
6. **Finish** — merge, push, publish, or deploy only when authorized. Otherwise
   leave a reviewable result and report evidence. Record a useful learning only
   when explicit factory mode produces one.

Sign-off applies only when factory mode or consequential scope needs a missing
choice or authority. Existing authorization is enough to continue. On reviewer
or tool failure, use a safe fallback or checkpoint and report the limitation;
never force-merge, delete worktrees, pull/rebase concurrent work, or push without
authorization.

## Review control

After five review/fix rounds, or when findings repeat without progress,
checkpoint the evidence and change the repair approach. Continue authorized
work with a focused diagnosis or narrower fix; ask only when a necessary scope,
authority, or external dependency prevents progress. Do not silently accept P1s.
The parser contract, when consumed by an
orchestrator, remains:

```
REVIEW ROUND <n>
Roster: <personas + trigger reasons>
| # | Sev | File:line | Finding | Fix direction |
...
P0: <count> P1: <count> P2: <count>
VERDICT: CLEAN | FIX-REQUIRED
```

Load `../factory-review/SKILL.md` for review; consult other references only when
their phase is selected. References are optional recipes and cannot add gates to
an already authorized scope. Consult only the relevant recipe:
`references/research-recipe.md` for research,
`references/build-review-loop-control-policy.md` for repeated review, or
`references/skill-map.md` for phase tooling.

## Verification

- [ ] Relevant checks passed; diff and outputs were inspected.
- [ ] P0/P1 findings were fixed or reported with evidence.
- [ ] Optional artifacts exist only when mode and authorization require them.

When an orchestrator consumes the compound phase, preserve its terminal signal:
`COMPOUND: recorded` or `COMPOUND: skipped (<reason>)`.
