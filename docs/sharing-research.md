# Skill Sharing Research

This note captures the distribution options considered for the first public
release of `agentic-engineering-loop`.

## Findings

### Hermes Agent

Hermes supports GitHub-backed skill taps.

Expected public tap structure:

```text
owner/repo
└── skills/
    └── my-skill/
        ├── SKILL.md
        ├── references/
        ├── templates/
        ├── scripts/
        └── assets/
```

Install options:

```bash
hermes skills tap add owner/repo
hermes skills install owner/repo/my-skill

# or direct GitHub skill install
hermes skills install owner/repo/skills/my-skill
```

Hermes can also install a single raw `SKILL.md` URL, but that loses bundled
references/scripts, so a tap is better for this workflow.

### Claude Code

Claude Code skills also use `SKILL.md` directories. Plugin distribution adds a
`.claude-plugin/plugin.json` manifest and can include `skills/`, `commands/`,
`agents/`, `hooks/`, MCP config, and binaries.

A one-skill plugin can be either:

```text
plugin-root/SKILL.md
```

or the growth-friendly shape:

```text
plugin-root/
├── .claude-plugin/plugin.json
└── skills/my-skill/SKILL.md
```

This repo uses the second shape.

### Codex / Open Agent Skills

OpenAI Codex docs describe skills as directories with `SKILL.md` plus optional
references/scripts. Repo-scoped skills are typically under `.agents/skills/`.
For distribution, Codex points toward plugins for reusable packages.

For now, this repo ships a simple installer that copies the skill into common
agent locations rather than pretending to be a full Codex plugin marketplace.

### Community patterns

Public skill repos tend to use one of these shapes:

1. **Simple tap:** `skills/<name>/SKILL.md` + README.
2. **Multi-agent installer:** `skills/` + `install.sh` that copies/symlinks into
   Claude, Codex, OpenCode, Cursor, Hermes, etc.
3. **NPM wrapper:** `package.json` + `bin` installer so users can run `npx ...`.
4. **Claude plugin marketplace:** `.claude-plugin/plugin.json` + `skills/` + optional commands/agents/hooks.
5. **Adapter repo:** canonical skills plus generated adapters for Claude, Codex,
   Cursor, Windsurf, etc.

## Decision for v0.1

Ship the smallest interoperable shape:

- canonical skill: `skills/agentic-engineering-loop/SKILL.md`
- references: `skills/agentic-engineering-loop/references/`
- Hermes tap-compatible layout
- Claude plugin metadata: `.claude-plugin/plugin.json`
- simple `install.sh` for Hermes/Claude/Codex/OpenCode
- minimal `npx github:...` wrapper

Do **not** publish to npm yet. That is only worth doing once the workflow has a
validator/gate script or more skills/adapters.

## Next packaging upgrades

1. Add a validator script that checks `SKILL.md` frontmatter and reference links.
2. Add a real engine gate script for review-loop status: CLEAN / FIX / ESCALATE.
3. Add generated adapters for Claude plugin, Codex `.agents`, OpenCode, and Hermes.
4. Publish to npm only after the installer does more than copy files.
