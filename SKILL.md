---
name: agentic-engineering-loop
description: "Use when turning a software idea, feature, or bug into shipped code through a structured agentic loop: triage, brainstorm or plan, implement, GPT-5.5 review, fix, merge, and compound."
version: 1.1.0
author: SilentKnight87
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [development, workflow, compound-engineering, agentic, codex, review]
    category: software-development
    related_skills: [github-operations, autonomous-coding-agents, writing-plans, subagent-driven-development]
---

# Agentic Engineering Loop

## When to Use

Load this skill when the user drops a raw build idea and says "let's build something,"
"I have an idea for a project," "can you build this," or any variant of "take my
idea and turn it into working, reviewed, pushed code."

This is the user's default software development workflow. It replaces ad-hoc
build-then-debug with a structured agentic engineering pipeline built on the
Compound Engineering (CE) core loop: **brainstorm -> plan -> work -> review -> compound**.

## Entry Triage (route before step 1)

Not every idea needs brainstorming. CE `/ce-plan` can start from a requirements
doc, a bug report, a feature idea, or a rough description. Pick the entry point
by idea shape:

| Signal | Entry point | Why |
|---|---|---|
| the user has no direction ("what should I build?") | **[0] IDEATE** (optional) | CE `ce-ideate` is for "not sure what to work on" |
| Idea is vague but directed ("build something around X") | **[1] BRAINSTORM** | `ce-brainstorm` defines WHAT |
| Defined problem: bug report, requirements doc, precise feature request, or rough-but-complete description | **SKIP to [2] PLAN** | `ce-plan` defines HOW; brainstorm would re-litigate settled decisions |
| Ambiguous between two reasonable interpretations | **ESCALATION gate** to the user | Don't guess; the choice changes the approach |

Rule of thumb: if you can write a one-paragraph Problem Frame without asking
the user a clarifying question, skip brainstorm. If you would need to ask "what do
you actually want this to do?", brainstorm first.

## The Loop

```
the user's Idea
    |
    v
[0] IDEATE       (optional, only when no direction)
    |               CE /ce-ideate
    v
[1] BRAINSTORM   --  GLM 5.2 xhigh (max for novel architecture)
    |               CE /ce-brainstorm methodology
    |               Output: requirements doc (PRD) with R-IDs
    v
[2] PLAN         --  GLM 5.2 xhigh (max for novel architecture)
    |               CE /ce-plan methodology
    |               Output: implementation plan with U-IDs, KTDs
    v
[3] SIGN-OFF     --  ESCALATION gate: show plan to the user, get approval
    |
    v
[4] IMPLEMENT    --  GLM 5.2 high reasoning
    |               Break plan into tasks
    |               Dispatch subagents for parallel units
    |               Output: working code, tests passing, pushed
    v
[5] REVIEW       --  GPT-5.5 xhigh first pass; high re-reviews via Codex OAuth
    |               CE /ce-code-review methodology
    |               Output: findings table (P0/P1/P2)
    v
[6] FIX          --  GLM 5.2 high (cycles 1-3), medium if the user approves cycles 4-5
    |               Fix all P0 and P1 findings
    |               Commit and push fixes
    v
[7] LOOP         --  Return to [5]. Hard cap: 5 review rounds.
    |               Stall detection: if P0/P1 count does not decrease
    |               between consecutive rounds, escalate early.
    |               Exit CLEAN: "No P0/P1 findings remain"
    |               Exit ESCALATE: cap reached -> ask the user (force-merge
    |               with P1s documented, rewrite, or abandon)
    v
[8] MERGE & PUSH --  Merge to main, push to GitHub
    |               Write README with instructions
    |               Summarize review history
    v
[9] COMPOUND     --  CE /ce-compound: capture learnings
    |               Update memory/vault, record what worked,
    |               feed back into next loop
    v
DONE
```

## Model Routing

| Phase | Model | Reasoning | Provider | Why |
|---|---|---|---|---|
| Ideate | GLM 5.2 | xhigh | OpenCode Go (`opencode-go`) | Divergent thinking, cheap for long sessions |
| Brainstorm | GLM 5.2 | xhigh (max for novel architecture / high uncertainty) | OpenCode Go (`opencode-go`) | Cheap for long sessions, strong for architecture |
| Plan | GLM 5.2 | xhigh (max for novel architecture / high uncertainty) | OpenCode Go (`opencode-go`) | Same model keeps context coherent |
| Implement | GLM 5.2 | high | OpenCode Go (`opencode-go`) | Cheaper reasoning for bulk work |
| Review | GPT-5.5 | xhigh first pass; high re-reviews | Codex OAuth | Most adversarial review, subscription/quota constrained |
| Fix | GLM 5.2 | high cycles 1-3; medium cycles 4-5 | OpenCode Go (`opencode-go`) | Same model that wrote the code; taper late cycles |
| Compound | GLM 5.2 | high | OpenCode Go (`opencode-go`) | Summary/synthesis, not adversarial |

**Reasoning effort selection:**
- `max`: reserve for novel architecture, high-uncertainty brainstorm, or plan
  where a wrong foundation compounds. Slow and expensive.
- `xhigh`: default for brainstorm and plan.
- `high`: implementation/fix cycles 1-3, review re-checks, and compound.
- `medium`: implementation/fix cycles 4-5 only if the user approves continuing past cycle 3.
- Review rule: first GPT-5.5 review is xhigh; re-reviews are high because they verify targeted fixes, not full rediscovery.

Never use GPT-5.5 for implementation (API billing, not subscription).
Never use GLM 5.2 for adversarial review (GPT-5.5 is the stronger reviewer).

## Gates

Every checkpoint is named by gate type (see `subagent-driven-development/references/gates-taxonomy.md`).
For each gate: what triggers it, what happens on failure, who resumes and from where.

| # | Gate type | Trigger | On fail | Resume |
|---|---|---|---|---|
| G1 | Pre-flight | Requirements doc (if brainstorm ran) or plan file missing before IMPLEMENT | Block, bail before code changes | Run brainstorm/plan, then retry |
| G2 | Pre-flight | `codex login status` not OK before REVIEW | Block | `codex login`, then retry |
| G3 | Pre-flight | Feature branch missing / tests failing after a FIX round | Block | Create branch or fix tests, retry |
| G4 | Escalation | SIGN-OFF: plan ready | Pause, present plan, wait for the user | the user approves or revises scope |
| G5 | Revision | REVIEW finds P0/P1 | Loop back to FIX with findings | Fix, re-review (bounded by G6) |
| G6 | Revision (cap) | 5 review rounds reached OR P0/P1 count did not decrease between consecutive rounds | Escalate to the user | Force-merge with P1s documented, rewrite, or abandon |
| G7 | Escalation | Ambiguous requirement with two reasonable interpretations | Pause, present options | the user picks |
| G8 | Abort | Context pressure >70% during loop, or Codex OAuth fails mid-loop, or tests unrecoverable after a FIX | Stop, checkpoint progress, report | the user investigates, restart from checkpoint |
| G9 | Compound | Merge/push complete | If retro cannot be written, report and continue | Save retro/memory/skill update before final summary |

## Phase Details

### [0] Ideate (optional)

Only when the user has no direction. Load `ideation` skill. Produce 3-5 candidate
directions with one-line value hypotheses. the user picks one, then proceed to [1].
Do not ideate if the user already named a target.

### [1] Brainstorm

1. Load `obsidian` skill. Search LifeOS vault for related notes.
2. Apply CE `/ce-brainstorm` methodology. If the CE skill is not installed in this profile, use the public CE docs/methodology manually:
   - Assess scope (Lightweight, Standard, Deep)
   - One question per turn, prefer single-select multiple choice
   - Resolve product decisions before implementation decisions
   - Produce requirements doc with R-IDs and scope boundaries
3. Save to `docs/brainstorms/YYYY-MM-DD-slug-requirements.md`.
4. Commit and push.

### [2] Plan

1. Read requirements doc (or bug report / feature request / rough description)
   as source of truth.
2. Apply CE `/ce-plan` methodology. If the CE skill is not installed in this profile, use the public CE docs/methodology manually:
   - Hard floor: Summary, Problem Frame, Requirements, KTDs, Implementation Units
   - Each unit: U-ID, Goal, Files, Patterns, Test Scenarios, Verification
   - Resolve all open questions into KTDs
3. Save to `docs/plans/YYYY-MM-DD-NNN-type-slug-plan.md`.
4. Commit and push.

### [3] Sign-off (Escalation gate G4)

Present plan summary to the user. If approved, switch model for implementation.
If the user revises scope, return to [1] or [2] as appropriate. Do not implement
before approval.

### [4] Implement

1. Pre-flight gate G1: confirm plan file exists and is non-empty.
2. Create feature branch: `git checkout -b feat/slug`.
3. Break plan units into todo items.
4. Dispatch parallel subagents for independent units (max 3 concurrent).
5. Serial subagents for dependent chains.
6. Pull between batches to avoid collisions.
7. Run full test suite after all units.
8. Commit and push.

### [5] Review

1. Pre-flight gate G2: run `codex login status`; bail if not authenticated.
2. Write review prompt to `.ce-review-prompt.md` (repo root; gitignore it).
3. Run:
```bash
REVIEW_EFFORT="xhigh"  # round 1; use "high" for rounds 2-5

codex exec -m gpt-5.5 -c model_reasoning_effort="$REVIEW_EFFORT" \
  -c approval_policy="never" --skip-git-repo-check \
  -o .ce-review-output-rN.md "$(cat .ce-review-prompt.md)"
```
4. Parse findings into P0/P1/P2 table.
5. If "CLEAN" with no P0/P1, proceed to [8].
6. Otherwise proceed to [6]. Track round number N and the P0/P1 count for G6.

Output files (`.ce-review-output-rN.md`) are review artifacts; commit the final
round's output under `docs/reviews/` for history, gitignore intermediate ones.

### [6] Fix

1. Pre-flight gate G3: confirm feature branch is current and tests are runnable.
2. Fix all P0/P1 findings. Run tests. Commit with `fix:` prefix. Push.
3. Record the new P0/P1 count for stall detection (G6).

### [7] Loop

Return to [5]. Include prior round fix status in the review prompt.
- Hard cap: **5 review rounds total.**
- Stall detection: if the P0/P1 count does not decrease between two consecutive
  rounds, stop early and escalate (do not burn remaining rounds on a stuck issue).
- On CLEAN exit: proceed to [8].
- On cap/stall: escalation gate G6 — present the user with: (a) force-merge with
  remaining P1s documented in README, (b) rewrite the offending unit, (c) abandon.
  Never loop forever and never silently accept P1s.

### [8] Merge and Push

1. Merge feature branch to main.
2. Write README with run/test/iterate instructions.
3. Summarize review history (rounds run, findings resolved, any P1s accepted at G6).
4. Push to GitHub.

### [9] Compound

CE `/ce-compound`: capture learnings so the next loop is sharper.
1. Record what worked and what didn't (architecture choices, review findings
   patterns, subagent collisions hit).
2. Update memory / LifeOS vault with reusable decisions and gotchas.
3. If a review finding recurs across projects, propose a lint rule, test guard,
   or plan checklist item to prevent it next time.
4. Commit a short `docs/retro/YYYY-MM-DD-slug-retro.md` note.

## Pitfalls

1. **Don't skip sign-off.** the user should see the plan before implementation (G4).
2. **Don't brainstorm a defined problem.** If the user handed you a bug report or a
   precise feature request, go straight to PLAN. Brainstorm re-litigates settled
   decisions and wastes a long GLM session.
3. **Parallel subagent limits.** Max 3 concurrent. Batch if more.
4. **Subagent collisions.** Always `git pull --rebase` between batches.
5. **Review loop must converge.** Hard cap 5 rounds with stall detection (G6).
   After the cap, escalate to the user — do not soft-accept P1s and do not loop
   forever. P2/P3 findings are deferred by default; P0/P1 require a fix or
   explicit the user decision.
6. **Savings double-counting.** Add per-entity caps when multiple scanners find waste in the same source.
7. **Codex OAuth.** Pre-flight gate G2 checks `codex login status` before review.
   If OAuth fails mid-loop, abort (G8) and checkpoint rather than retry blindly.
8. **Skipping compound.** Without [9], learnings don't compound — the whole point
   of CE. Even a 3-line retro note is worth it.

## Supporting References

- `references/opencode-go-routing.md` — tested provider-routing checklist for GLM 5.2 via OpenCode Go.
- `references/current-agentic-loop-patterns-2026-06-18.md` — condensed research on public agentic engineering loop patterns and what to adopt/avoid.
- `references/build-review-loop-control-policy.md` — cost/control/safety policy for loop caps, severity handling, effort tapering, and escalation.

## Verification

- [ ] Entry triage picked the right entry point (ideate / brainstorm / direct to plan)
- [ ] Requirements doc saved under docs/brainstorms/ (if brainstorm ran)
- [ ] Plan saved under docs/plans/ with U-IDs
- [ ] the user approved plan before implementation (G4)
- [ ] Feature branch created (G1 passed)
- [ ] All implementation units have passing tests
- [ ] Codex login verified before each review round (G2)
- [ ] Review ran; review rounds counted; hard cap 5 enforced (G6)
- [ ] Stall detection triggered escalation if P0/P1 count plateaued
- [ ] Merged to main and pushed to GitHub
- [ ] README written with run/test/iterate instructions
- [ ] Compound step ran: retro note saved, memory/vault updated (G9)
