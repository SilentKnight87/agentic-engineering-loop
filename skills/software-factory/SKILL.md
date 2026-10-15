---
name: software-factory
description: "Use when the user explicitly requests multi-project or parallel factory orchestration with observable pods and consolidated results."
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

Use only when the user explicitly requests multi-project or parallel factory
orchestration. Each pod owns one project and worktree. In selected factory mode,
the orchestrator spawns, monitors, steers, arbitrates, and reports; pod leaders
and workers implement their own project. A normal single-project request stays
in the ordinary implementation workflow.

## Pod contract

- One pod = one project = one isolated worktree or checkout. Parallel pods for
  one repository require separate worktrees.
- Name pods `pod: <lane>[-<job>]`, lowercase; workers may append their role.
- Register each pod, read before steering, and preserve state the orchestrator
  did not create. Never edit another pod's worktree from the orchestrator.
- Load `agentic-engineering-loop` for each pod. Use parallel workers only when
  independent work justifies them.

The substrate is replaceable. Bind SPAWN, READ, SEND, STATUS, and CLOSE to the
available cmux or supervised-process interface; keep substrate commands in this
skill rather than project docs.

## Interactive and headless modes

Interactive factory mode relays only material plan, review-cap, or ambiguity
decisions through the orchestrator. Do not reconfirm authority already given. A
headless run requires a signed-off plan because no user is available for a
material scope or authority question; it must never start from a raw idea.
Headless pods checkpoint when such a decision is needed and must end with one
exact line:

`FACTORY: done <merge-sha>` | `FACTORY: escalate <gate> <reason>` | `FACTORY: failed <reason>`

## Capacity and recovery

Use actual platform capacity and limits; `../agentic-engineering-loop/references/model-routing.md` is
advisory, not a preflight blocker. Serialize scarce review capacity when useful.
If a pod is silent, read it and send one nudge before recovery. On substrate
death, reattach from worktree state and review artifacts. Do not automatically
kill, delete, pull, rebase, overwrite, merge, or push; perform those actions only
with explicit task authorization.

## Verification

- [ ] Every pod has an isolated worktree and a convention-compliant name.
- [ ] Material gates were relayed interactively or checkpointed headlessly.
- [ ] Each pod reports run/inspect/fix evidence and its outcome.
- [ ] Merge SHA, push, or deployment is reported only when applicable and
      authorized; otherwise the result remains reviewable in its worktree.
