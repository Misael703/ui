# Kit Cleanup 2026-09 — Master Plan

> **For agentic workers:** This is the index. Execute the phase plans in order, each with superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Do not start a phase before the previous one is merged and released.

**Goal:** Take `@misael703/ui` from "El Alba's internal kit on npm" to a clean internal multi-app kit with real gates, English docs, a Storybook that documents, and a neutral core, in three releases: `4.4.0` → `4.5.0` → `5.0.0`.

**Architecture:** Three phases, each a release, each independently valuable. Fase 1 is mechanical hygiene with no consumer-visible change. Fase 2 touches only stories, docs and Storybook config. Fase 3 is the single major that carries every breaking change, with `MIGRATION.md`.

**Spec:** `docs/superpowers/specs/2026-09-16-kit-cleanup-design.md` (decisions D1–D10). Targets: `docs/superpowers/specs/2026-09-16-kit-cleanup-inventory.md`. Audit: https://claude.ai/artifact/6YYA6Vn8tGS7x5xrGWyT19

## Phase plans

| Phase | Plan | Release | Branch | Tasks |
|---|---|---|---|---|
| 1 Hygiene | `2026-09-16-fase1-hygiene.md` | 4.4.0 | `chore/hygiene-4.4` | 13 |
| 2 Storybook | `2026-09-16-fase2-storybook.md` | 4.5.0 | `docs/storybook-4.5` | see file |
| 3 Major | `2026-09-16-fase3-major-5.md` | 5.0.0 | `release/5.0.0` | see file |

## Global constraints (copied into every phase plan)

- Never `prettier --write`; compact hand-written style (D6).
- Conventional Commits, English, lowercase subject, no attribution lines.
- No push / PR / merge / release / publish without the owner's explicit go for that step.
- Gates judged by exit code, never through a pipe: `npm run lint`, `npm run typecheck`, `npx vitest run > log; echo $?`, and `npm run smoke:ci` whenever exports or `dist/` layout change.
- New barrel export ⇒ update `smoke/gallery/registry.tsx` + `smoke/gallery/icon-names.ts`.
- Generic fixtures only (Northwind Builders, Taladro, Pedido #1042, Satoru Gojo).

## Dependencies between phases

- Fase 2 assumes Fase 1 Task 5 (domain blocks deleted) and Task 2 (`ci.yml` exists; Fase 2 appends a `storybook` job).
- Fase 3 assumes Fase 2's story files (one per component) because the per-component folder move carries the story along; and Fase 1 Task 1 (`tsconfig.build.json`) because the tsup glob change edits that config.
- The consumer bumps are NOT in any phase: after 5.0.0, each app follows the checklist in `MIGRATION.md` when it next bumps.

## Done criteria per phase

**Fase 1 (4.4.0):** `ci.yml` green on the PR with lint (0 errors, 0 warnings), typecheck (src+tests+storybook), tests, build; `grep -rn elalba-ui src README.md` empty; no app names in shipped comments; every `aria-label` default in `UiKitMessages`; 11 domain blocks gone; README in English; smoke green.

**Fase 2 (4.5.0):** every exported component has a story file with `component:` and a `Default` story with `args` (guard test `tests/StoriesMeta.test.tsx`); Docs/Foundations/Components/Patterns/Blocks/Internal tree in English; MDX Introduction, Getting started, Theming, Accessibility, Hooks; `build-storybook` in CI; Storybook URL in README and `package.json.homepage`; preview without the nested-iframe bridge; `play` tests on Combobox, Menu, DataTable, Modal.

**Fase 3 (5.0.0):** `@layer ui`; `BRAND_DEFAULTS` neutral; `es-CL` fallback gone; deprecated API removed; `@misael703/ui/commerce` subpath; one folder per component with co-located story and test; `src/styles/index.css` is a list of `@import … layer(ui)`; 12 duplicated selectors resolved; 42 CSS-pinning tests pass through `readKitCss`; `MIGRATION.md` complete; smoke green.

## Decision points that remain open (ask the owner when reached)

1. **Fase 1 Task 3 vs "format once":** the plan removes Prettier (D6). If the owner prefers a one-time format + `.git-blame-ignore-revs` + `format:check` in CI, replace Task 3 with that (about the same effort, a ~11k-line diff once).
2. **Fase 2 last task (Storybook 9):** changes 30+ devDependencies; confirm before running the upgrade.
3. **Fase 3 `UiProvider`:** optional (D9). Recommendation: skip unless a second brand or a test-isolation need appears.
4. **Fase 3 Commerce subpath:** breaking for any consumer importing Commerce components from the barrel; the plan's grep step decides whether the MIGRATION entry is needed. If no consumer uses them, still do it (keeps the barrel honest).

## Deferred, with reasons

- `react/no-array-index-key` (25 hits): review needs per-component context; fold into the Fase 3 folder split, one component at a time.
- Node 22 in `publish.yml`: only a real release verifies the npm bootstrap; do it as the first step of the 4.5.0 release, watching the run log (lesson 2026-07-08: a workflow fix applies only when the tag includes it).
- Visual regression (Chromatic / Playwright screenshots): reconsider after Fase 2, when stories are per-component and stable.
- Second npm package for the El Alba preset (D5: no).
- `en.ts` locale (D2: no).

## Execution

Recommended: subagent-driven, one fresh subagent per task, the controller reviews the diff and runs the gates between tasks. Each phase plan is self-contained; a task's implementer needs the phase plan and the spec, nothing else from this conversation.
