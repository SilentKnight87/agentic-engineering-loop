---
name: factory-review
description: "Use for the adversarial review phase of the agentic-engineering-loop: pick a risk-driven reviewer persona roster, run cross-vendor review with the plan's intent attached, audit evidence, and emit a P0/P1/P2 findings table."
version: 1.0.0
author: SilentKnight87
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [code-review, adversarial, security, performance, agentic]
    category: software-development
    related_skills: [agentic-engineering-loop, software-factory]
---

# Factory Review

Adversarial, cross-vendor, persona-driven. The implementer never reviews its
own work, and the reviewer model never shares the implementer's vendor
(invariant enforced by the loop's G2 gate).

## Inputs

1. The diff (feature branch vs base).
2. The plan's **intent summary** — every reviewer receives WHAT the change is
   supposed to achieve and the requirements it claims to satisfy, not just the
   diff. A diff-only review cannot catch "correct code, wrong feature".
3. Prior round findings + fix claims (rounds 2+).

## Persona roster (pick by diff risk profile)

Select 2-4 personas. Every roster includes Correctness. Risk triggers add the rest:

| Persona | Rubric source | Trigger |
|---|---|---|
| Correctness & quality | Addy code-review-and-quality: five axes (correctness, readability, architecture, security, performance); approve when the change definitely improves code health; don't block on style | always |
| Security | Addy security-and-hardening: trust boundaries, assets, STRIDE, abuse cases beside use cases; LLM output is an untrusted boundary | auth, secrets, user input, network, file writes, LLM-generated commands |
| Performance | Addy performance-optimization: measure -> identify -> fix -> verify -> guard; CWV targets; N+1 patterns | hot paths, queries, frontend bundles, loops over IO |
| Plan-vs-diff verifier | CE stage-6 pattern: walk the plan's R-IDs/U-IDs; every requirement either satisfied in the diff or explicitly deferred | always on round 1 |
| Evidence auditor | pstack show-me-your-work: every "done/fixed/passing" claim must cite observable evidence (test run, output, screenshot); unproven claims are P1 findings | rounds 2+ (fix verification) |
| Blast radius | pstack blast-radius: what breaks if this is wrong; irreversible actions, migrations, deletes get doubt-first treatment | migrations, deletes, public API changes |
| Prose/slop | pstack unslop: READMEs, comments, user-facing copy free of filler and LLM-tells | docs or user-facing text in diff |
| Doubt pass | Addy doubt-driven-development: fresh-context reviewer biased to DISPROVE the central non-trivial decision | novel architecture or unverifiable invariants |

## Procedure

1. Build the roster from the diff's risk profile. State the roster and why.
2. Run each persona as its own pass (subagent per persona where the harness
   allows; sequential otherwise). Each pass gets: diff, intent summary, its
   rubric, prior findings.
3. Merge findings; dedupe; classify:
   - **P0**: breaks correctness, security, or data. Must fix.
   - **P1**: wrong-but-working, unproven claim, requirement gap. Must fix or
     the user explicitly accepts at the loop's G6 gate.
   - **P2/P3**: style, polish, deferred ideas. Log; never loop on these.
4. Emit the findings table with file:line anchors and a one-line fix direction
   per finding. Report-only: this skill never edits code.
5. Rounds 2+: verify each prior finding's fix claim through the evidence
   auditor before accepting it as resolved. Fixed-without-evidence = still open.

## Output contract

```
REVIEW ROUND <n>
Roster: <personas + trigger reasons>
| # | Sev | File:line | Finding | Fix direction |
...
P0: <count> P1: <count> P2: <count>
VERDICT: CLEAN | FIX-REQUIRED
```

The loop parses the last two lines; keep them exact.

## Pitfalls

- Persona sprawl: >4 personas dilutes findings and burns review quota.
- Style nitpicks escalated to P1: the approval standard is "definitely improves
  code health", not "matches my taste".
- Accepting fix claims without evidence: the #1 cause of review-loop stalls.
- Losing the intent summary on re-review rounds: re-attach it every round.
