# Kit cleanup 2026-09 — design spec

Source: audit of `@misael703/ui` 4.3.0 run on 2026-09-16 (four parallel auditors:
coupling, architecture, Storybook, tooling). Full report:
https://claude.ai/artifact/6YYA6Vn8tGS7x5xrGWyT19. Machine-usable inventories with
exact `file:line` targets: `2026-09-16-kit-cleanup-inventory.md` (same folder).

## Decisions (Fase 0, closed 2026-09-16 by the owner)

| # | Decision | Value |
|---|---|---|
| D1 | Positioning | **Internal multi-app kit**, published on npm for the owner's apps. NOT an OSS/community project. No CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / issue templates / badges. |
| D2 | Public language | **English** for README, CHANGELOG (new entries), commit subjects, JSDoc, code comments, Storybook titles and story names. UI copy stays Spanish through the locale dictionary. No `en.ts` (YAGNI under D1). |
| D3 | Breaking changes | **Allowed**, as one major `5.0.0` with `MIGRATION.md`. Consumers: despachos `^4.3.0` (108 names), cobros `^3.1.0` (63), barritas `^1.22.0` (30), rentools `^1.51.0` (2), mocks `^1.24.0` (46). |
| D4 | Storybook | Becomes the kit's documentation: one title per component, `component:` + `args` on every meta, MDX for Introduction / Getting started / Theming / Accessibility / Hooks, deployed and linked. |
| D5 | El Alba preset | **Stays inside the package** as opt-in subpath (`./presets/elalba`). Splitting into a second package doubles the release friction that is the owner's main pain. Core defaults become neutral; the preset carries the brand. |
| D6 | Formatting | The repo keeps its **compact hand-written style**. Prettier is removed (config, scripts, devDependency) instead of applied. Reversible: if the owner prefers "format once + `.git-blame-ignore-revs` + `format:check`", swap Fase 1 Task 3. |
| D7 | Workflow artifacts | `tasks/` and `docs/superpowers/` stay tracked (internal repo, D1). |
| D8 | Domain blocks | The 11 blocks that are screens of despachos/rentools are **deleted from the kit** (git history keeps them; CHANGELOG names the last SHA). The 16 generic blocks stay with neutral fixtures. |
| D9 | Brand singleton | `configureBrand()` stays (module-level config is acceptable for mono-brand apps; utils like `formatCurrency` need a non-React source). 5.0.0 makes its defaults neutral and requires consumers to call it. A `UiProvider` that wraps `LocaleProvider` + brand is an optional last task in Fase 3. |
| D10 | `@layer elalba` | Renamed to `@layer ui` in 5.0.0. No alias: no consumer declares the layer (only comments in despachos and mocks). |

## Global constraints (apply to every task in every phase)

- Never run `prettier --write`. Write edits by hand in the file's compact style.
- Commits: Conventional Commits, English, lowercase subject, no Claude attribution lines.
- No push / PR / merge / release / publish without the owner's explicit go for that change.
- Every task ends with `npm run lint` (exit 0), `npm run typecheck` (exit 0 once Task 1.1 exists), `npx vitest run > /tmp/vitest.log 2>&1; echo $?` (exit 0). Never judge a gate through a pipe (`| grep`, `| tail`).
- Any new export from `src/index.ts` requires updating `smoke/gallery/registry.tsx` and `smoke/gallery/icon-names.ts`, then `npm run smoke:ci` locally.
- Stories are generic: sample domain is "Northwind Builders", products like "Taladro", orders like "Pedido #1042", persona "Satoru Gojo". Never a real company, RUT, phone, address, tax rate, or copy lifted from an app.
- Tests that pin design tokens by reading CSS files (42 of them) must keep passing; if a task moves CSS, it updates the test's path list in the same commit.
- Release squash-merge PR titles use `chore(release): X.Y.Z` (Conventional), not `X.Y.Z: descripción`.

## Scope by phase

### Fase 1 — hygiene, no breaking (ships as 4.4.0)
CI on PR (lint, typecheck, test, build-storybook); typecheck covers `tests/` and `.storybook/`; Prettier removed (D6); commitlint + husky; `eslint-plugin-react`; jsx-a11y and `no-explicit-any`/`no-unused-vars` raised to `error` with the 134 warnings paid; stale `@misael703/elalba-ui` name removed; consumer names removed from comments; hardcoded UI strings moved to the dictionary; JSDoc/comments in English; domain blocks deleted and generic blocks neutralized; README rewritten in English; PRODUCT.md/DESIGN.md synced; `engines`; build script moved into tsup config.

### Fase 2 — Storybook as documentation (ships as 4.5.0, stories only)
New title tree (`Foundations/*`, `Components/<Name>`, `Patterns/*`, `Blocks/*`, `Internal/*`); one story file per component with `component:`, `args`, `argTypes`, `Default` + state stories; English story names; neutral fixtures; `addon-interactions` + `play` on Combobox, Menu, DataTable; MDX pages; preview simplified (AppShell out of autodocs, iframe bridge deleted, fonts alias); toolbar preset labelled "Example preset (El Alba)"; `build-storybook` in CI; Storybook URL in README and `homepage`. Storybook 9 migration is its own last task.

### Fase 3 — major 5.0.0
`@layer ui`; neutral `BRAND_DEFAULTS`; `es-CL` fallback removed; deprecated removals (Kpi, Divider alias, Stat.trend string, Tree no-op prop, FilterBar 3.8.0 props, DateRangePicker 3.9.0 prop, `Tool` icon alias, legacy `.table-toolbar + .table-wrap` seam); Commerce to `@misael703/ui/commerce` subpath without total computation; one folder per component (tsup glob change, tests co-located, CSS split per component under `@import layer(ui)`, 12 duplicated selectors resolved, CSS-parsing tests repointed); `MIGRATION.md`; optional `UiProvider`.

## Out of scope
- Second npm package for the preset (D5).
- `en.ts` locale (D2).
- Visual regression (Chromatic / Playwright screenshots) — reconsider after Fase 2.
- Changesets / release automation — the release flow stays manual (`npm version` + tag + GitHub Release → publish.yml).
- Any change to component behaviour or visuals except what deprecation removal implies.
