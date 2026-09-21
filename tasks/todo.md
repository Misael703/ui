# Kit cleanup 2026-09 (4.4.0 → 4.5.0 → 5.0.0)

Master: `docs/superpowers/plans/2026-09-16-kit-cleanup-master.md`
Spec: `docs/superpowers/specs/2026-09-16-kit-cleanup-design.md`

## Fase 0 — decisions (closed 2026-09-16)
- [x] Internal multi-app kit, not OSS (D1)
- [x] English for docs, commits, JSDoc, Storybook (D2)
- [x] Major 5.0.0 allowed with MIGRATION.md (D3)
- [x] Preset El Alba stays in the package (D5); Prettier removed (D6); domain blocks deleted (D8)

## Fase 1 — hygiene, 4.4.0 (`docs/superpowers/plans/2026-09-16-fase1-hygiene.md`)
- [x] T1–T13 complete; final review + fix wave clean; squash-merged to `main` as `chore(release): 4.4.0` (b4aa929) on 2026-09-19. Not pushed/released yet.

## Fase 2 — Storybook as docs, 4.5.0 (`docs/superpowers/plans/2026-09-16-fase2-storybook.md`)
- [x] T1 Storybook 8.6 infra, iframe bridge removed, `public/` logos removed
- [x] T2 `docs/STORYBOOK.md` + guard `tests/StoriesMeta.test.tsx`
- [x] T3 list-page fixture; Patterns/List page; Internal/Register
- [x] T4–T16 one story file per component (≈100 files), plays on Menu/Combobox/DataTable/Modal
- [x] T17 single-component files retitled, Spanish names gone, Portal/Slot/Slottable/PageHeader/SegmentedControl stories
- [x] T18 blocks retitled with descriptions
- [x] T19 Foundations split by topic with Doc Blocks (ThemeProvider fix); guard green
- [x] T20 MDX guides (Introduction, Getting started, Theming, Accessibility, Hooks)
- [x] T21 Storybook CI job; README and `homepage` link the Railway deploy (https://ui-production-8958.up.railway.app/)
- [ ] T22 Storybook 9 migration — owner-gated, not started
- [x] Final whole-branch review + fix wave (hoisting, dead viewports, Hooks.mdx, README path, args-driven Defaults, guard hardening, CHANGELOG 4.5.0)

## Fase 3 — major 5.0.0 (`docs/superpowers/plans/2026-09-16-fase3-major-5.md`)
- [ ] see the phase plan task list (16 tasks); starts after 4.5.0

## Review — Fase 2 (2026-09-21)
- Branch `docs/storybook-4.5`, 32 commits over `main` (b4aa929), not pushed. Gates at HEAD: lint 0/0, typecheck 0, vitest 1934 passed (98 files, guard 605/605), build-storybook 0.
- Executed with one fresh subagent per task plus a task review each; 6 tasks needed one fix round; one agent stalled once (T19) and was resumed. Final review found 6 Important items, all fixed and re-reviewed.
- No change to the published package (`src/index.ts`, component sources, styles untouched).
- Rulings on the owner's behalf are in `.superpowers/sdd/2026-09-16-fase2-storybook/progress.md` (local) and in the session summary.
- Pending for the owner: whether to run T22 (Storybook 9). Storybook URL linked on 2026-09-21.
- Deferred: external image URLs in stories (picsum/pravatar), `() => {}` vs `fn()` on a few inert callbacks, Motion keyframes redeclared per row.
