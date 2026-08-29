# Research Recipe — which research skill fires at which loop step

| Loop step | Skill / tool | Auth that must exist FIRST |
|---|---|---|
| Triage | none (repo/local context) | — |
| Brainstorm: community pulse | `last30days "<domain> tools complaints"` (DISCOVERY/GENERAL) | Keyless minimum (HN, Polymarket, YouTube). Better: SCRAPECREATORS_API_KEY. X: xurl OAuth OR AUTH_TOKEN/CT0 cookies OR XAI_API_KEY |
| Brainstorm: X inspiration, agent-swarm patterns | last30days X source, or xurl directly for account timelines | One X backend (above). Missing -> X column silently degrades |
| Plan: library choice, API docs | context7 (query-docs / resolve-library-id), ref, `read` | Already mounted, no keys |
| Plan: architecture/ADR deep-dive | 24601/agent-deep-research async job (`--context ./src --depth standard`), fired in a pod, polled before sign-off | GOOGLE_API_KEY (Gemini AI Pro credits) + `uv` |
| Sign-off .. Compound | no research skills fire | — |

Run `last30days` doctor/preflight once at factory setup to verify source health.

## Rules

1. One X substrate only: xurl (cookie-free OAuth2) preferred. Do not stack
   twitterapi.io MCP or Agent-Reach twitter-cli beside it.
2. Research results feed the requirements doc; never paste raw dumps into
   plans. Summarize with citations.
3. Deep-research jobs are async: fire at plan start, poll before sign-off;
   never block the loop waiting.
4. Patterns adopted without installs: Agent-Reach `doctor --json` health-check
   shape; Weizhena Deep-Research outline -> human edit -> parallel per-item
   agents -> report (mirrors plan -> sign-off).
