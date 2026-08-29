# Skill Map — vetted skill-to-phase assignments

Vetting date: 2026-08-28 (four parallel research passes over primary sources).
Principle: import nuggets, not frameworks. Anything that owns the whole
pipeline is disqualified as a base but may donate components.

## Phase assignments (winners after dedupe)

| Loop phase | Skill | Source |
|---|---|---|
| Pulse (pre-brainstorm) | last30days | mvanhorn/last30days-skill |
| Pulse (X channel) | xurl CLI (official X API v2, OAuth2) | github.com/xdevplatform/xurl |
| Brainstorm | superpowers brainstorming + 95%-confidence stop rule (Addy interview-me) | obra/superpowers; addyosmani/agent-skills |
| Plan | superpowers writing-plans + CE WHAT/HOW tiering nugget | obra/superpowers; EveryInc/compound-engineering-plugin |
| Plan (tech deep-dive) | context7 + ref MCP (harness-owned); optional 24601/agent-deep-research (async Gemini, repo-grounded) | mounted; github.com/24601/agent-deep-research |
| Sign-off | gstack plan-eng/ceo/design/devex-review | gstack suite (local install) |
| Implement | superpowers test-driven-development | obra/superpowers |
| Implement (frontend) | factory-frontend lane (this repo) | see skills/factory-frontend |
| Review | factory-review (this repo): gstack review engine + CE persona catalog + Addy rubrics + pstack rubrics | see skills/factory-review |
| Fix | harness diagnose orchestrator + superpowers systematic-debugging method | OMP built-in; obra/superpowers |
| Merge | gstack ship | gstack suite |
| Compound | gstack learn + retro; CE one-learning-per-run rule | gstack; CE nugget |

## Dedupe decisions

1. TDD: superpowers beats pstack tdd (stricter enforcement). KEEP superpowers.
2. Debugging: OMP diagnose orchestrates; superpowers systematic-debugging is
   the method body; DROP gstack investigate (same discipline, heavier preamble).
3. Brainstorm vs spec: superpowers brainstorming (elicitation) + gstack spec
   (issue filing + worktree spawn) compose; keep both.
4. Plan review: gstack plan-*-review beats superpowers document-review. KEEP gstack.
5. Code review: gstack review is the engine; pstack show-me-your-work grafts on
   as a required evidence-audit pass.
6. Ship: gstack ship; DROP land-and-deploy and superpowers
   finishing-a-development-branch for this pipeline.
7. Compound: gstack learn/retro store; pstack encode-lessons-in-structure is
   the how-to-write-a-learning rubric.
8. QA: gstack qa (browser-driven, tiered); harness already enforces
   verification-before-completion natively.
9. Worktrees: cmux pods own orchestration; superpowers worktree hygiene rules
   are conventions only.

## Framework verdicts

- Compound Engineering plugin (EveryInc): INSPIRATION, not dependency. 33-skill
  monolith that owns the pipeline. Stolen: review persona catalog + intent
  summary; one-learning-per-run + docs/solutions store; WHAT/HOW plan tiering.
- pstack (Lauren Tan / @poteto, Cursor plugin): principles largely already
  baked into the OMP harness prompt. Import ONLY: unslop, show-me-your-work,
  blast-radius as reviewer rubrics. Portable mirror: pasevin/pstack-portable-skills.
- superpowers (obra): full methodology as a framework; individual skills are
  clean and dependency-free. Import per-skill.
- gstack: adopt named skills; skip as base. WARNING: each skill carries a
  ~110-line interactive preamble (telemetry, onboarding prompts) — set
  proactive/telemetry off for headless pods or they stall.
- Agent-Reach (Panniantong): patterns only (doctor --json health check,
  per-platform retry chains). DO NOT install as-is: its "MUST USE for any
  research" trigger hijacks routing from last30days and harness built-ins.
- Addy Osmani agent-skills: ADOPT code-review-and-quality,
  security-and-hardening, performance-optimization. Fold interview-me and
  doubt-driven-development in as rules, not skills.
