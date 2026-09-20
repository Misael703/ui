# Kit cleanup 2026-09 (4.4.0 → 4.5.0 → 5.0.0)

Master: `docs/superpowers/plans/2026-09-16-kit-cleanup-master.md`
Spec: `docs/superpowers/specs/2026-09-16-kit-cleanup-design.md`

## Fase 0 — decisions (closed 2026-09-16)
- [x] Internal multi-app kit, not OSS (D1)
- [x] English for docs, commits, JSDoc, Storybook (D2)
- [x] Major 5.0.0 allowed with MIGRATION.md (D3)
- [x] Preset El Alba stays in the package (D5); Prettier removed (D6); domain blocks deleted (D8)

## Fase 1 — hygiene, 4.4.0 (`docs/superpowers/plans/2026-09-16-fase1-hygiene.md`)
- [x] T1 typecheck covers tests + .storybook, `npm run typecheck`
- [x] T2 `ci.yml` on PR (lint, typecheck, test, build), `.nvmrc`, `engines`
- [x] T3 remove Prettier
- [x] T4 commitlint + husky (commit-msg, pre-push)
- [x] T5 blocks: delete 11 domain, neutralize 7 generic, one README
- [x] T6 stale `elalba-ui` name + consumer names in comments
- [x] T7 hardcoded aria labels → `UiKitMessages` (+ test); dateRange keys dropped in the final fix wave
- [x] T8 eslint-plugin-react, correctness rules to error (26 fixes)
- [x] T9 jsx-a11y to error, 3 batches (labels, interactions, roles/anchors)
- [x] T10 English JSDoc/comments (21 files)
- [x] T11 README English, CHANGELOG 4.4.0, PRODUCT/DESIGN sync
- [x] T12 `scripts/build.mjs`, narrower `'use client'`, smoke
- [x] T13 version 4.4.0, full gates
- [x] Final whole-branch review + fix wave (TransferList tab stop, NavigationMenu aria, fonts filter, CHANGELOG)

## Fase 2 — Storybook as docs, 4.5.0 (`docs/superpowers/plans/2026-09-16-fase2-storybook.md`)
- [ ] see the phase plan task list (22 tasks); starts after 4.4.0 is merged and released

## Fase 3 — major 5.0.0 (`docs/superpowers/plans/2026-09-16-fase3-major-5.md`)
- [ ] see the phase plan task list (16 tasks); starts after 4.5.0

## Review — Fase 1 (2026-09-17)
- Branch `chore/hygiene-4.4`, 26 commits over `main` (ff55f66), not pushed. Gates at HEAD: lint 0 errors / 0 warnings, typecheck 0, vitest 1329 passed, build 0, smoke 0, build-storybook 0.
- Executed with one fresh subagent per task plus a task review each; 4 tasks needed one fix round (blocks fixtures, Charts `any`, Resizable lint, build script paths); final whole-branch review found 5 Important items, all fixed and re-reviewed.
- Rulings taken on the owner's behalf are listed in the session summary and in `.superpowers/sdd/2026-09-16-fase1-hygiene/progress.md` (local, git-ignored).
- Deferred to Fase 2/3: `react/no-array-index-key` (25 hits), Node 22 in `publish.yml`, Lightbox backdrop styling on the dialog element, TimeColumn dead `onKeyDown`, `CheckoutSummary` `iva` variable name, Spanish comments inside README code snippets.
- Consumer-visible in 4.4.0 (documented in CHANGELOG `### Changed`/`### Fixed`): Breadcrumbs default aria-label now Spanish; PhoneInput has no default placeholder; Chart generics default to `Record<string, unknown>`; a11y markup changes in CommandPalette, Lightbox, Carousel, TransferList, Menu, Tree, Modal/Drawer backdrops.
