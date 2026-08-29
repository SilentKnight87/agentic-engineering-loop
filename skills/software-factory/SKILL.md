---
name: software-factory
description: "Use when orchestrating one or more agentic-engineering-loop runs as observable pods: spawning a workspace per project, assigning pod leaders and workers, monitoring and steering them, and reporting consolidated results. Supports operator-in-the-loop (cmux) and headless (Hermes/cron) invocation."
version: 1.0.0
author: SilentKnight87
license: MIT
platforms: [macos, linux]
metadata:
  hermes:
    tags: [orchestration, software-factory, cmux, pods, agentic]
    category: software-development
    related_skills: [agentic-engineering-loop, factory-review, factory-frontend]
---

# Software Factory

One orchestrator, many pods. Each pod is one project running the
`agentic-engineering-loop` end to end. The orchestrator never implements; it
spawns, monitors, steers, arbitrates, and reports.

## Substrate is swappable

The orchestrator drives pods through a small verb set: SPAWN, READ, SEND,
STATUS, CLOSE. Bind them to whatever terminal substrate is present:

| Verb | cmux binding | plain-terminal binding |
|---|---|---|
| SPAWN | `cmux new-workspace --cwd <worktree> --command "<agent cmd>"` then `cmux rename-workspace "pod: <name>"` | `hub start` a supervised process |
| READ | `cmux read-screen --workspace <id> --lines 40` | `hub logs` |
| SEND | `cmux send --workspace <id> "<text>"` | `hub send --name <pod> --text` |
| STATUS | `cmux sidebar-state --workspace <id>` | `hub ps` |
| CLOSE | `cmux close-workspace` | `hub stop` |

Never bake substrate commands into project docs; only this skill knows them.

## Pod contract

1. **One pod = one project = one git worktree/checkout.** Parallel pods on one
   repo MUST use separate worktrees. No exceptions.
2. Naming: `pod: <lane>[-<job>]`, lowercase (`pod: coupon-automation`,
   `pod: solo-leveling`). Variant workers append role: `pod: x (worker-b)`.
3. Every spawn: SPAWN -> rename per convention -> pod reports status/progress
   if the substrate supports it -> register the pod in the session's active
   work list so other sessions know it exists.
4. Pod leader runs the harness agent with the `agentic-engineering-loop` skill
   and the project's plan. Workers are the loop's own subagents (max 3).
5. Pods inherit project law: spawn with `--cwd` at the repo whose rules govern.

## Operator-in-the-loop mode (default)

1. Intake: the user names projects and priorities. One pod each.
2. The loop's escalation gates (sign-off G4, ambiguity G7, review cap G6)
   surface to the user THROUGH the orchestrator: poll pods with READ; when a
   pod waits at a gate, relay the question, return the answer with SEND.
3. Steering: the user can address any pod directly in its workspace; the
   orchestrator must tolerate state it did not cause (re-READ before SEND).
4. Report: when a pod reaches DONE, collect its summary (merge commit, review
   history, compound learning) into a consolidated status for the user.

## Headless mode (Hermes / cron invocation)

Precondition: a signed-off plan already exists — headless runs NEVER start
from a raw idea. Sign-off happens with the user, always.

1. Invoker calls the pod leader non-interactively:
   `omp -p --cwd <worktree> "<load agentic-engineering-loop; execute docs/plans/<plan>.md>"`.
2. Gates that need a human (G4, G6 cap, G7) cannot pause a headless run:
   G4 must be pre-satisfied; G6/G7 abort with a checkpoint report instead of
   waiting. The invoker relays the report to the user.
3. Headless pods disable interactive skill preambles (gstack telemetry/
   onboarding) or the pod stalls on a prompt nobody will answer.
4. Every headless run ends with a parseable last line:
   `FACTORY: done <merge-sha>` | `FACTORY: escalate <gate> <reason>` |
   `FACTORY: failed <reason>`.

## Concurrency rules

- Max concurrent pods: what the quota table in
  `agentic-engineering-loop/references/model-routing.md` supports; check usage
  before spawning a burst. Default ceiling: 4-5 pods.
- Stagger review phases: reviews burn the scarcest quota (Claude Max windows).
  Two pods entering review simultaneously should serialize via the orchestrator.
- Cross-pod contracts (shared API schema, types) live in a file both pods
  read (`CONTRACTS.md`); the orchestrator arbitrates conflicts. Pod leaders
  never edit another pod's worktree.
- Integration across pods is its own final pod after subsystem pods report done.

## Failure handling

- Pod silent > 20 min with no output growth: READ; if wedged, SEND one nudge;
  if still wedged, kill and restart from the last checkpoint (loop G8 wrote it).
- Substrate death (cmux quit, ssh drop): pods are terminal processes — on
  restart, re-attach by reading each worktree's git state + docs/reviews to
  locate the phase, then respawn the leader with a resume instruction.
- Quota exhaustion mid-run: the harness fallback chains rotate models
  automatically; the orchestrator only intervenes when a pod reports G2/G8.

## Verification

- [ ] Every pod has its own worktree and convention-compliant name
- [ ] Escalation gates relayed to the user (interactive) or converted to
      checkpoint-abort (headless)
- [ ] No orchestrator turn edits project code directly
- [ ] Review phases serialized when Max-window pressure is high
- [ ] Consolidated report delivered: per-pod outcome, merge sha, one learning
