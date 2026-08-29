---
name: agentic-engineering-loop
description: "Use when turning a software idea, feature, or bug into shipped code through a structured agentic loop: triage, brainstorm or plan, sign-off, implement (optionally as N parallel variations), cross-vendor adversarial review, fix, merge, and compound."
version: 2.0.0
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

## When to Use

Load this skill when the user drops a raw build idea and says "let's build something,"
"I have an idea for a project," "can you build this," or any variant of "take my
idea and turn it into working, reviewed, pushed code."

This is the user's default software development workflow. It replaces ad-hoc
build-then-debug with a structured pipeline: **brainstorm -> plan -> work -> review -> compound**.

## Model Routing (roles, not models)

This skill never names concrete models. It names **harness roles**. The harness
config maps roles to whatever models the user's subscriptions currently provide,
with fallback chains for redundancy. See `references/model-routing.md` for the
current mapping and the rules for updating it.

| Phase | Role | Effort |
|---|---|---|
| Ideate / Brainstorm | `plan` | xhigh (max for novel architecture) |
| Plan | `plan` | xhigh (max for novel architecture) |
| Implement | `task` (workers), `smol` (fan-out) | high |
| Review | `advisor` or cross-vendor vs implementer | xhigh first pass; high re-reviews |
| Fix | `task` (same lineage as implementer) | high cycles 1-3; medium 4-5 |
| Vision / UI verification | `vision` | high |
| Deep-reasoning fallback | `slow` | max |
| Compound | `default` | high |

**Invariant: the reviewer role must resolve to a different vendor than the
implementer role.** If the harness maps them to the same vendor, the loop must
swap the reviewer to the next cross-vendor entry in the fallback chain before
the first review round.

**Reasoning effort selection:**
- `max`: novel architecture, high-uncertainty brainstorm, or a plan where a wrong foundation compounds.
- `xhigh`: default for brainstorm, plan, and first review.
- `high`: implementation, fix cycles 1-3, re-reviews, compound.
- `medium`: fix cycles 4-5 only if the user approves continuing past cycle 3.

Never route implementation to a metered API when a subscription-backed role
covers it. Never let the implementer self-review.

## Entry Triage (route before step 1)

| Signal | Entry point | Why |
|---|---|---|
| The user has no direction ("what should I build?") | **[0] IDEATE** (optional) | Divergent search before convergent work |
| Idea is vague but directed ("build something around X") | **[1] BRAINSTORM** | Defines WHAT |
| Defined problem: bug report, requirements doc, precise feature request, or rough-but-complete description | **SKIP to [2] PLAN** | Plan defines HOW; brainstorm would re-litigate settled decisions |
| Ambiguous between two reasonable interpretations | **ESCALATION gate** to the user | Don't guess; the choice changes the approach |

Rule of thumb: if you can write a one-paragraph Problem Frame without asking
the user a clarifying question, skip brainstorm. If you would need to ask "what do
you actually want this to do?", brainstorm first.

A plan file is *earned*, not automatic: a decision that needs a stable ID gets a
file; a lightweight change ends in chat with a one-line record.

## The Loop

```
User's Idea
    |
    v
[0] IDEATE       (optional, only when no direction)
    v
[1] BRAINSTORM   -- role: plan, xhigh
    |               Pre-step: community pulse (references/research-recipe.md)
    |               Method: superpowers brainstorming + 95%-confidence stop rule
    |               Output: requirements doc (PRD) with R-IDs
    v
[2] PLAN         -- role: plan, xhigh
    |               Method: superpowers writing-plans
    |               WHAT tier (requirements-only) vs HOW tier (implementation-ready);
    |               auto-escalate to HOW on risk surfaces: auth, payments,
    |               migrations, external contracts
    |               Output: implementation plan with U-IDs, KTDs
    v
[3] SIGN-OFF     -- ESCALATION gate: present plan, wait for approval
    |               Optional: gstack plan-eng/ceo/design/devex review lenses
    v
[4] IMPLEMENT    -- role: task, high
    |               Single-take (default) or VARIATIONS mode (below)
    |               Subagents for parallel units (max 3 concurrent)
    |               Method: superpowers TDD
    |               Output: working code, tests passing, pushed
    v
[5] REVIEW       -- cross-vendor adversarial; see factory-review skill
    |               Persona roster picked by diff risk profile
    |               Output: findings table (P0/P1/P2)
    v
[6] FIX          -- role: task, high
    |               Fix all P0 and P1 findings; commit `fix:` and push
    v
[7] LOOP         -- Return to [5]. Hard cap: 5 review rounds.
    |               Stall detection: P0/P1 count not decreasing -> escalate early
    v
[8] MERGE & PUSH -- gstack ship choreography where installed, else:
    |               merge to main, README, review-history summary, push
    v
[9] COMPOUND     -- ONE learning per run (never batched)
    |               docs/solutions/ = durable store the NEXT plan reads
    v
DONE
```

## [4b] Variations Mode

When the user does not know which direction they want, or asks for options:

1. At SIGN-OFF, agree the number of takes N (2-4) and what varies (visual
   style, architecture, UX shape). Everything else stays fixed by the plan.
2. Spawn N implementers in **separate git worktrees** (`variant/<slug>-a` ...),
   one subagent each, same plan, one varied dimension.
3. Each take must reach runnable state; a take that cannot run is disqualified,
   not debugged past its budget.
4. Present all takes side by side (screenshots or run links). The user picks
   one, or names aspects to combine.
5. Combination is a new short plan (WHAT tier) merging the named aspects into
   the winning take's worktree. Losing worktrees are deleted after merge; their
   one-line lessons go to the compound step.
6. Review [5] runs on the final combined take only.

## Gates

| # | Gate type | Trigger | On fail | Resume |
|---|---|---|---|---|
| G1 | Pre-flight | Requirements doc (if brainstorm ran) or plan file missing before IMPLEMENT | Block, bail before code changes | Run brainstorm/plan, then retry |
| G2 | Pre-flight | Reviewer role has no live credentials before REVIEW | Block | Re-auth provider or rotate fallback chain, then retry |
| G3 | Pre-flight | Feature branch missing / tests failing after a FIX round | Block | Create branch or fix tests, retry |
| G4 | Escalation | SIGN-OFF: plan ready | Pause, present plan, wait for the user | User approves or revises scope |
| G5 | Revision | REVIEW finds P0/P1 | Loop back to FIX with findings | Fix, re-review (bounded by G6) |
| G6 | Revision (cap) | 5 review rounds reached OR P0/P1 count did not decrease between consecutive rounds | Escalate to the user | Force-merge with P1s documented, rewrite, or abandon |
| G7 | Escalation | Ambiguous requirement with two reasonable interpretations | Pause, present options | User picks |
| G8 | Abort | Context pressure >70% during loop, or reviewer credentials fail mid-loop, or tests unrecoverable after a FIX | Stop, checkpoint progress, report | User investigates, restart from checkpoint |
| G9 | Compound | Merge/push complete | If retro cannot be written, report and continue | Save retro/memory/skill update before final summary |
| G10 | Escalation | VARIATIONS: no take reaches runnable state within budget | Stop, present partial takes | User narrows scope or picks a direction |

## Phase Details

### [1] Brainstorm

1. Community pulse first when the idea is market-facing: follow
   `references/research-recipe.md` (last30days for pulse, xurl for X
   inspiration, context7/ref for technical docs).
2. Elicit requirements: one question per turn, single-select preferred,
   product decisions before implementation decisions. Stop when you could
   state the user's intent with ~95% confidence; attach your best guess to
   every question.
3. Save to `docs/brainstorms/YYYY-MM-DD-slug-requirements.md`. Commit and push.

### [2] Plan

1. Read the requirements doc (or bug report / feature request) as source of truth.
2. Hard floor: Summary, Problem Frame, Requirements, KTDs, Implementation Units.
   Each unit: U-ID, Goal, Files, Patterns, Test Scenarios, Verification.
3. WHAT tier suffices for low-risk work; risk surfaces (auth, payments,
   migrations, external contracts) force the HOW tier before sign-off.
4. Save to `docs/plans/YYYY-MM-DD-NNN-type-slug-plan.md`. Commit and push.

### [3] Sign-off (G4)

Present the plan summary. If variations were requested, agree N and the varied
dimension here. Do not implement before approval.

### [4] Implement

1. G1: confirm plan file exists and is non-empty.
2. Create feature branch `feat/slug` (or variant worktrees in variations mode).
3. Break plan units into todo items; dispatch parallel subagents for
   independent units (max 3 concurrent); serial for dependent chains;
   pull between batches.
4. TDD for every unit with an observable contract.
5. Run the full test suite after all units. Commit and push.

### [5] Review

1. G2: verify the reviewer role resolves to live credentials on a different
   vendor than the implementer.
2. Load the `factory-review` skill: risk-driven persona roster, plan-vs-diff
   verification, evidence audit. Every reviewer receives the plan's intent
   summary, not just the diff.
3. Parse findings into a P0/P1/P2 table. CLEAN -> [8]; else [6]. Track round
   number and P0/P1 count for G6.
4. Commit the final round's findings under `docs/reviews/`; gitignore
   intermediate round artifacts.

### [6] Fix

1. G3: feature branch current, tests runnable.
2. Fix all P0/P1. Run tests. Commit `fix:`-prefixed. Push.
3. Record the new P0/P1 count for stall detection.

### [7] Loop

Return to [5] with prior round fix status in the review prompt. Hard cap 5
rounds; stall detection escalates early; on cap/stall present: force-merge with
P1s documented, rewrite the offending unit, or abandon. Never loop forever and
never silently accept P1s.

### [8] Merge and Push

Use gstack `ship` where installed (base-branch detect, tests, diff review,
version bump, changelog, PR). Otherwise: merge to main, write README with
run/test/iterate instructions, summarize review history, push.

### [9] Compound

1. Capture exactly ONE learning per run — the single highest-leverage lesson.
   Never batch learnings; a grab-bag is never re-read.
2. Store it discoverably: `docs/solutions/YYYY-MM-DD-slug.md`. The next loop's
   brainstorm/plan phases MUST read `docs/solutions/` as grounding.
3. New domain vocabulary goes to `CONTEXT.md`.
4. If a review finding recurs across projects, propose a lint rule, test
   guard, or plan checklist item.
5. Emit a parseable terminal signal for orchestrators: `COMPOUND: recorded`
   or `COMPOUND: skipped (<reason>)`.

## Pitfalls

1. **Don't skip sign-off** (G4).
2. **Don't brainstorm a defined problem** — go straight to PLAN.
3. **Parallel subagent limit**: max 3 concurrent; batch if more.
4. **Subagent collisions**: `git pull --rebase` between batches.
5. **Review must converge**: hard cap 5 rounds with stall detection (G6).
6. **Same-vendor review is not review**: enforce the cross-vendor invariant.
7. **Reviewer auth**: G2 before every review round; abort (G8) on mid-loop
   credential failure rather than blind retry.
8. **Skipping compound**: without [9] learnings don't compound. One line beats
   nothing.
9. **Variations sprawl**: N>4 takes burn budget without adding signal; vary one
   dimension at a time.

## Supporting References

- `references/model-routing.md` — current role -> model -> fallback mapping and update rules.
- `references/skill-map.md` — vetted skill-to-phase map with dedupe decisions.
- `references/research-recipe.md` — research-phase recipe with auth prerequisites.
- `references/build-review-loop-control-policy.md` — loop caps, severity handling, effort tapering, escalation.
- `references/current-agentic-loop-patterns-2026-06-18.md` — condensed pattern research (historical).

## Verification

- [ ] Entry triage picked the right entry point
- [ ] Requirements doc saved under docs/brainstorms/ (if brainstorm ran)
- [ ] Plan saved under docs/plans/ with U-IDs
- [ ] User approved plan before implementation (G4)
- [ ] Feature branch / variant worktrees created (G1)
- [ ] Implementer and reviewer resolved to different vendors
- [ ] All implementation units have passing tests
- [ ] Review rounds counted; hard cap 5 enforced; stall detection live (G6)
- [ ] Merged to main and pushed to GitHub
- [ ] README written with run/test/iterate instructions
- [ ] Compound step recorded exactly one learning (G9)
