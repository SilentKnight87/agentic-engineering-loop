---
name: factory-frontend
description: "Use when the user requests anti-slop frontend/design review or a high-visibility UI needs proportionate visual and web-quality checks."
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

Use this lane when the user asks for anti-slop or design review, requests visual
variations, or a high-visibility UI justifies dedicated visual and web-quality
checks. For a small or ordinary frontend change, apply only the relevant design,
accessibility, and performance checks; do not make this lane a prerequisite for
implementation.

## Design direction

When the choice will be reused or materially affects the result, capture a short
direction in `DESIGN.md`: type scale, palette, spacing/density, motion, and one
signature element. Use `design-consultation` or supplied references when useful.
Without references, infer a reasonable direction and continue; ask only when a
missing visual choice changes the outcome. Extract attributes from reference
sites rather than cloning layouts.

During implementation, use real microcopy, spend boldness in one place, and use
an official design system when the brief clearly matches it. Check for common
failure modes such as wrapped CTA text, duplicate-intent CTAs, poor contrast,
missing focus/labels, and copy that says nothing.

## Proportionate review

When visual risk warrants it, use screenshots and a fresh reviewer or vision role
for a taste check against the stated direction. When web-quality risk warrants
it, measure relevant LCP/INP/CLS, accessibility, and bundle behavior with the
available tooling. Use field data only when available. Report findings in the
loop's normal P0/P1/P2 format; do not invent thresholds when the app or tooling
cannot measure them.

Skipping a dedicated design file or one of these checks is valid for a small,
low-risk change. If both checks run, a visual pass does not excuse a serious
performance/accessibility finding, and a fast page does not excuse a clear
violation of an explicitly chosen design direction.

## Verification

- [ ] Direction and references were used when material to the result.
- [ ] Relevant visual, accessibility, and performance evidence was inspected.
- [ ] Findings were fixed or reported with file/line or screenshot evidence.
