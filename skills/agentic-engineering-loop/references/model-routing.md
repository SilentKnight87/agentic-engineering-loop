# Model Routing — role to model mapping

Last verified: 2026-09-01. Subscriptions evolve; this file is the ONLY place
concrete model names appear. The loop skill and factory skills reference roles.

## Current mapping (OMP `~/.omp/agent/config.yml`)

| Role | Primary | Fallback chain | Subscription |
|---|---|---|---|
| plan | anthropic/claude-fable-5-1 | openai-codex/gpt-5.6-sol | Claude Max |
| default | openai-codex/gpt-5.6-sol:high | claude-sonnet-5 -> gemini-3.7-flash | Codex |
| task (workers) | opencode-go/glm-5.3 | kimi-k2.7-code -> grok-4.6 (both opencode-go) | OpenCode Go |
| smol (fan-out) | google-antigravity/gemini-3.7-flash | gpt-5.3-codex-spark -> glm-5.3-flash | Antigravity free daily |
| slow | opencode-go/kimi-k3 | deepseek-v4-pro | OpenCode Go |
| vision | google-antigravity/gemini-3.7-flash | claude-sonnet-5 | Antigravity free daily |
| advisor / reviewer | anthropic/claude-fable-5-1 | openai-codex/gpt-5.6-terra | Claude Max / Codex |

## Cross-vendor review invariant

Reviewer vendor MUST differ from implementer vendor. Current default satisfies
it: implementer = Z.AI GLM (OpenCode Go), reviewer = Anthropic (fallback
OpenAI). If the implementer chain rotates to grok-4.6, the reviewer stays
cross-vendor automatically.

## Quota pressure notes

- Claude Max: 5-hour and 7-day windows shared with Claude Code and the advisor
  role. The advisor reads every turn — heaviest drain. Swap advisor to
  claude-sonnet-5 if 5h limits pinch.
- Codex (prolite): small 5h spark window — spark exhausted mid-session on
  2026-08-28; that is why smol is Gemini-primary.
- Antigravity: daily reset, historically idle. Cheapest real capacity.
- OpenCode Go: monthly cap, ~13% used at last check. Bulk implementation lane.
- OpenRouter API key: metered. Emergency lane only; never route bulk work here.

## Optional capacity (wire via `/login` when wanted)

- Cursor subscription: grok/kimi/opus variants as third-line worker capacity.
- SuperGrok: grok models direct; redundant while grok-4.6 rides OpenCode Go.
- Gemini AI Pro API credits (GOOGLE_API_KEY): powers agent-deep-research jobs.

## Update rules

1. Re-verify this table when a subscription changes or a provider 429s
   persistently despite fallbacks.
2. Research latest-model consensus before repointing a role; recency beats
   familiarity (a "known good" model one generation old is a silent downgrade).
3. Change config.yml roles and this file in the same commit.
4. Never hardcode a model name in a skill; add a role instead.
