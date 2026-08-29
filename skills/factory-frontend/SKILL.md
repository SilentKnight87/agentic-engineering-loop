---
name: factory-frontend
description: "Use for frontend slices inside the agentic-engineering-loop: a three-gate anti-slop lane — design direction from the user's taste and reference sites, a build pass calibrated against known AI-look clusters, and a dual review gate (visual taste + measurable web quality) before merge."
version: 1.0.0
author: SilentKnight87
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [frontend, design, anti-slop, ui, web-quality]
    category: software-development
    related_skills: [agentic-engineering-loop, factory-review]
---

# Factory Frontend Lane

AI's default frontend output is slop: the same three looks, template spacing,
filler copy. This lane makes slop structurally hard: taste is captured before
building, the builder self-critiques against known failure modes, and nothing
merges without passing a taste gate AND a numbers gate.

## Gate 1 — Design direction (before any code)

1. Where gstack is installed, run `design-consultation`: it writes DESIGN.md
   and maintains a persistent taste profile (approved/rejected fonts, colors,
   layouts). This is where the user's style lives across projects.
2. Reference-driven briefs: the user drops URLs or screenshots of sites they
   like; extract concrete attributes (type scale, palette, density, motion)
   into DESIGN.md. Never accept "make it modern" — ask for references or infer
   three candidate directions and let the user pick (variations mode pairs
   well here: N visual takes, user chooses).
3. DESIGN.md is the control plane: OKLCH palette, type rules, spacing scale,
   one signature element. Downstream passes cite it; deviation is a finding.

## Gate 2 — Build pass (during implement)

Apply the frontend-design posture (Anthropic skill, adopt where installed;
its rules inline here as fallback):

- Work like a design lead: brainstorm -> plan -> build -> self-critique -> refine.
- Calibrate against the current AI-look clusters and steer AWAY unless DESIGN.md
  explicitly chose one: (a) warm-cream + serif + terracotta, (b) near-black +
  acid accent, (c) broadsheet hairlines. Recognizing the cluster is the check.
- Spend boldness in ONE place (the signature element); keep the rest quiet.
- Copy is design material: real microcopy, no lorem, no "Unlock the power of".

Mechanical guardrails (taste-skill nuggets):

- Three dials inferred from the brief: VARIANCE (how far from convention),
  MOTION, DENSITY. State them before building.
- Use the official design system package when the brief matches one
  (Fluent/Carbon/Primer/govuk); honesty beats reinvention.
- Hard checks: no CTA text wrap, no duplicate-intent CTAs, eyebrow count
  limits, button contrast audits, italic descender clearance.

## Gate 3 — Dual review (before merge)

Runs as part of the loop's review phase, frontend personas added:

1. **Taste gate** — gstack `design-review` where installed: screenshots as
   evidence, AI-slop blacklist, hard-rejection criteria, before/after fix loop.
   Fallback: vision-role pass over screenshots against DESIGN.md + the cluster
   list, findings as P1s.
2. **Numbers gate** — Addy web-quality rubric: LCP/INP/CLS thresholds,
   accessibility (WCAG 2.2 contrast, focus, labels), bundle budget. Lab
   measurements via the harness browser; field data only when available.

Both gates emit findings into the loop's standard P0/P1/P2 table. A page that
passes taste but ships 8MB of JS fails; a fast page that looks like cluster (b)
without DESIGN.md saying so fails.

## Pitfalls

- Skipping Gate 1 because "it's just a small UI": small UIs define the taste
  profile the next project inherits.
- Letting the builder review its own screenshots: Gate 3 taste pass runs on
  the vision/reviewer role, not the implementer.
- Blacklist-only thinking: absence of slop is not presence of direction;
  DESIGN.md must name what the design IS, not only what it avoids.
- Reference-site cloning: extract attributes, never copy layouts wholesale.
