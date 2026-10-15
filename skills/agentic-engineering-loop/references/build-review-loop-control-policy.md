# Build-Review Loop Control Policy

Session source: Ops Margin Agent review loop and follow-up control audit.

## Purpose

Keep an explicitly selected agentic loop useful without burning model capacity
chasing diminishing returns.

## Severity handling

| Severity | Meaning | Loop behavior |
|---|---|---|
| P0 | Correctness/security/data-loss/crash issue that breaks real usage | Must fix; loop continues |
| P1 | Important bug or broken contract under realistic conditions | Must fix; loop continues |
| P2 | Minor edge case, non-critical missing test, style issue | Defer; never loop solely for P2 |
| P3 | Cosmetic/bikeshed/micro-optimization | Defer or omit unless the user asks |

Hard rule: only P0/P1 findings continue the loop.

## Reasoning defaults

| Phase | Cycle 1 | Cycle 2 | Cycle 3 | Cycles 4-5 |
|---|---|---|---|---|
| Brainstorm/plan | `plan` xhigh; max only for novel/high-uncertainty architecture | — | — | — |
| Build/fix | `task` high | `task` high | `task` high | `task` medium when continuing remains useful |
| Review | `advisor` xhigh | `advisor` high | `advisor` high | `advisor` high |

These are proportional defaults, not required model or effort pins. The only default xhigh calls in the build/review loop are: initial planning and initial adversarial review. Replans and re-reviews should be high unless the user explicitly asks for max effort.

## Recovery from repeated rounds

After five review/fix rounds, or when the same findings or test failures recur
without progress, checkpoint evidence and change the approach. Use a focused
diagnosis, smaller fix, or fresh independent review when useful. This bounds a
repeated strategy, not the user's authorized task. Continue independent work;
ask only for a necessary scope or authority decision or a real external blocker.
For OAuth/rate/quota failures, use an already authorized fallback or checkpoint;
do not retry blindly or bypass an access denial.

## State machine

```text
START
  -> TRIAGE idea shape
  -> BRAINSTORM if vague / PLAN if defined
  -> SIGN-OFF when explicit factory mode or consequential scope requires it
  -> BUILD/FIX
  -> TEST
  -> REVIEW
  -> CLASSIFY findings
     - P0/P1 open and cycle < 3: fix again
     - P0/P1 open at cycle 3: attempt a bounded fix/replan; ask only for a material scope or authority decision
     - P0/P1 open at cycle 5: checkpoint, change approach, continue authorized repair; never force-merge
     - only P2/P3: defer and finish
     - clean: finish with merge/push/compound only when applicable and authorized
```

## Cost/safety notes

- Track approximate cumulative cost/quota pressure per task.
- Adapt the route or scope if cost looks high relative to task value; do not stop
  solely because a stale estimate is high.
- Do not route private LifeOS, finance, health, legal, or employer/client
  confidential material through non-sensitive worker models without explicit
  user approval.
- Commit/push/PR/deploy remain approval-gated unless the user explicitly delegates that authority for the task.
