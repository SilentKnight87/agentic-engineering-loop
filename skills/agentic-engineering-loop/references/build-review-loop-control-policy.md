# Build-Review Loop Control Policy

Session source: Ops Margin Agent review loop and follow-up control audit.

## Purpose

Keep the agentic engineering loop useful without burning time, GLM budget, or Codex quota chasing diminishing returns.

## Severity handling

| Severity | Meaning | Loop behavior |
|---|---|---|
| P0 | Correctness/security/data-loss/crash issue that breaks real usage | Must fix; loop continues |
| P1 | Important bug or broken contract under realistic conditions | Must fix; loop continues |
| P2 | Minor edge case, non-critical missing test, style issue | Defer; never loop solely for P2 |
| P3 | Cosmetic/bikeshed/micro-optimization | Defer or omit unless Peter asks |

Hard rule: only P0/P1 findings continue the loop.

## Reasoning budget

| Phase | Cycle 1 | Cycle 2 | Cycle 3 | Cycles 4-5 |
|---|---|---|---|---|
| Brainstorm/plan | GLM 5.2 xhigh; max only for novel/high-uncertainty architecture | — | — | — |
| Build/fix | GLM 5.2 high | GLM 5.2 high | GLM 5.2 high | GLM 5.2 medium, only after Peter approves continuation |
| Review | GPT-5.5 xhigh | GPT-5.5 high | GPT-5.5 high | GPT-5.5 high |

The only default xhigh calls in the build/review loop are: initial planning and initial adversarial review. Replans and re-reviews should be high unless Peter explicitly asks for max effort.

## Loop limits

- Hard cap: 5 build-review cycles.
- Soft escalation: after cycle 3 if P0/P1 remain.
- Stall detection: if the P0/P1 count does not decrease between consecutive rounds, escalate early.
- Same issue persists across two review cycles: escalate.
- New P0/P1 introduced while fixing old ones: escalate.
- Tests fail for the same reason across two build cycles: escalate.
- Codex OAuth/rate/quota failure: abort and checkpoint, do not retry blindly.

## State machine

```text
START
  -> TRIAGE idea shape
  -> BRAINSTORM if vague / PLAN if defined
  -> SIGN-OFF from Peter
  -> BUILD/FIX
  -> TEST
  -> REVIEW
  -> CLASSIFY findings
     - P0/P1 open and cycle < 3: fix again
     - P0/P1 open at cycle 3: ask Peter
     - P0/P1 open at cycle 5: hard stop and report
     - only P2/P3: defer and finish
     - clean: merge/push/compound
```

## Cost/safety notes

- Track approximate cumulative cost/quota pressure per task.
- Pause if cost looks high relative to task value.
- Do not route private LifeOS, finance, health, legal, or employer/client confidential material through non-sensitive worker models without explicit Peter approval.
- Commit/push/PR/deploy remain approval-gated unless Peter explicitly delegates that authority for the task.
