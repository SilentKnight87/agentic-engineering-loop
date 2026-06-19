# Current Agentic Engineering Loop Patterns — 2026-06-18

Session source: Ops Margin Agent build/review workflow plus follow-up audit of public agentic engineering systems.

## Systems reviewed

- `nexu-io/looper`: GitHub labels as state machine; planner/reviewer/fixer/worker roles; isolated worktrees.
- `TheRealClodius/fram-loop`: Builder + Reviewer, phase gates, numeric 1-5 rubric with file:line evidence.
- `hamelsmu/claude-review-loop`: Claude implements, Codex review loop, parallel review agents by project shape.
- `pablomarin/claude-codex-forge`: PRD-to-PR flow, dual review, engineering council, human PR gate.
- `0xagentkitchen/kitchenloop`: UAT gate, regression oracle, drift control, fresh weak-model verification.
- `kayoslab/karl`: many-agent ticket pipeline; useful roles but expensive without strict budgets.
- `cactus-tim/.claude`: spec -> plan -> plan-review -> approval -> parallel worktrees -> integration tests -> two-tier review -> smoke -> PR.
- `stone16/harness-engineering-skills`: engine-enforced gates, cross-vendor peer review, fresh evaluator sessions.
- `sorinc03/agent-peer-review`: portable builder/reviewer workflow with explicit permissions and structured handoff.
- `foundry` / `lifeline`: issue/backlog-driven autonomous loops with PR/review/fix gates.

## Patterns to adopt

1. **Entry triage before workflow start**
   - No direction -> ideate.
   - Vague but pointed idea -> brainstorm.
   - Defined bug/problem/feature -> skip brainstorm and plan directly.
   - Ambiguous shape -> ask the user because the entry route changes cost and artifacts.

2. **Cross-model review**
   - Builder and reviewer should be different roles and preferably different vendors/models.
   - Current default: GLM 5.2 builds/fixes; GPT-5.5 via Codex reviews.

3. **Engine/gate-enforced stop conditions**
   - Do not let the same agent self-certify completion.
   - Track round count, P0/P1 count, tests, and review verdicts explicitly.

4. **Hard iteration budget**
   - Cap build-review cycles at 5.
   - Escalate after 3 cycles if P0/P1 remain.
   - Stop early if the P0/P1 count does not decrease between consecutive rounds.
   - Never loop on P2/P3; defer them.

5. **Reasoning taper**
   - Brainstorm/plan: GLM 5.2 xhigh, max only for novel/high-uncertainty architecture.
   - Implement/fix cycles 1-3: GLM 5.2 high.
   - Fix cycles 4-5: GLM 5.2 medium, only after the user approves continuation.
   - First GPT-5.5 review: xhigh.
   - Re-reviews: high.

6. **Phase 0 baseline**
   - Capture pre-existing test/lint/typecheck state before implementation.
   - Fail on regressions/new debt, not old repo debt.

7. **Smoke/UAT gate**
   - After tests pass, run the deliverable in its real shape: CLI command, browser flow, HTTP endpoint, etc.
   - Unit tests are not enough; they can be green while the user-facing artifact is broken.

8. **Fresh final review**
   - After iterative repair converges, run a fresh-context final review so the reviewer is not biased by the repair thread.

9. **Compound step**
   - Always write a short retro/learning note after merge/push.
   - Promote repeated finding classes into checklist items, tests, lint rules, or skill updates.

## Patterns to avoid

- Many-agent pipelines without budgets; they burn tokens quickly.
- Same-model self-review as the final gate.
- Open-ended review/fix loops.
- Re-brainstorming defined problems.
- Trusting unit tests as the only proof.
- Letting review context accumulate until the reviewer becomes lenient.
- Scope drift without touched-file and objective checks.

## Near-term v1.2 upgrades for this skill

- Add a small deterministic review-output parser script that returns CLEAN / FIX / ESCALATE.
- Add a Phase 0 baseline command template.
- Add deliverable-shape smoke-test prompts: CLI, API, web UI, library, data pipeline.
- Add optional numeric review rubric template requiring severity, confidence, file:line evidence, and category.
