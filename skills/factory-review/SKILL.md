---
name: factory-review
description: "Use for an explicit code-review request or the loop's review phase: choose risk-driven reviewers, audit evidence, and report findings."
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

Use for an explicit review request or the selected loop's review phase. Prefer a
fresh reviewer, ideally from another vendor when available. If provider matching
is unavailable, use the best available reviewer and report the limitation;
ordinary work must not stop solely on that basis. The implementer should not
self-review when another reviewer is available. Use an approved route; do not
send private context to another provider or enable paid routing solely to meet
a vendor preference.

## Inputs and roster

Give reviewers the diff and a concise intent summary. Use the plan's intent when
one exists; otherwise use the user's request or issue. Include prior findings and
fix claims on later rounds. Select the smallest useful roster: Correctness is
always included, then add only risk-triggered personas:

- Security for auth, secrets, user input, network, file writes, or generated
  commands.
- Performance for hot paths, queries, bundles, loops over I/O, or measured
  regressions.
- Plan/intent verification for explicit requirements or a formal plan.
- Evidence for later rounds and any done/fixed/passing claim.
- Blast radius for migrations, deletes, irreversible actions, or public APIs.
- Prose/slop for docs or user-facing copy; doubt pass for novel decisions.

Run separate passes only when risk and capacity justify them. Merge and dedupe
findings, then classify them:

- **P0** breaks correctness, security, data, or real usage: must fix.
- **P1** is an important realistic bug, broken contract, or unproven claim:
  fix or explicitly document acceptance when the selected mode permits it.
- **P2/P3** is polish or a deferred idea: report without looping on it.

The skill reports; it never edits code. A direct review may use ordinary prose.
When an orchestrator consumes the parser contract, keep these exact final lines:

```
REVIEW ROUND <n>
Roster: <personas + trigger reasons>
| # | Sev | File:line | Finding | Fix direction |
...
P0: <count> P1: <count> P2: <count>
VERDICT: CLEAN | FIX-REQUIRED
```

## Evidence

Every finding needs a file/line or screenshot anchor and a one-line direction.
Later rounds must verify fix claims through observable tests, output, or visual
evidence. Do not elevate style preferences to P1, and do not claim CLEAN while
P0/P1 findings remain unaddressed or unproven.
