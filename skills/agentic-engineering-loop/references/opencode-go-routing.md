# OpenCode Go routing checklist for GLM52 workflows

Use this when the user says GLM 5.2 should move from OpenRouter to OpenCode Go, or any similar provider swap affects the agentic engineering loop.

## Goal

All GLM 5.2 work in the GLM52 loop should route through OpenCode Go:

- Brainstorm: GLM 5.2 xhigh/max via `opencode-go`
- Plan: GLM 5.2 xhigh/max via `opencode-go`
- Implementation: GLM 5.2 high via `opencode-go`
- Fix loop: GLM 5.2 high via `opencode-go`
- Review remains GPT-5.5 xhigh via Codex OAuth

## Config fields to check

In the active Hermes profile config:

```yaml
model:
  provider: opencode-go
  default: glm-5.2

providers:
  opencode-go:
    base_url: https://opencode.ai/zen/go/v1
    model: glm-5.2

delegation:
  provider: opencode-go
  model: glm-5.2
  reasoning_effort: high
```

The important pitfall: updating `model.provider` is not enough. Subagents use `delegation.provider` and `delegation.model`; if those stay pinned to OpenRouter, the implementation phase silently uses the old route.

## Verification shape

Do not print API keys. Verify only provider/model names:

```bash
hermes --profile glm52 status --all | grep -E 'Model:|Provider:'
python3 - <<'PY'
from pathlib import Path
import yaml
cfg = yaml.safe_load(Path('/Users/aiserver/.hermes/profiles/glm52/config.yaml').read_text())
print('model.provider=', cfg['model'].get('provider'))
print('model.default=', cfg['model'].get('default'))
print('providers.opencode-go.model=', cfg['providers']['opencode-go'].get('model'))
print('delegation.provider=', cfg['delegation'].get('provider'))
print('delegation.model=', cfg['delegation'].get('model'))
PY
```

Expected:

```text
Model: glm-5.2
Provider: OpenCode Go
model.provider= opencode-go
model.default= glm-5.2
providers.opencode-go.model= glm-5.2
delegation.provider= opencode-go
delegation.model= glm-5.2
```

## Skill-library pitfall

If this workflow skill was created while running a named profile, make sure the skill is available to that profile. A shared/default skill file may exist but still not resolve via `skill_view` inside the active profile.

For GLM52, the profile-local path is:

```text
~/.hermes/profiles/glm52/skills/software-development/agentic-engineering-loop/SKILL.md
```

Keep the shared and profile-local copies aligned until the skill is promoted/curated into the common library.
