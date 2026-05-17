# PRODUCT.md

> Context file for the `impeccable` design skill and for humans. Grounded in
> the codebase, README, and how the kit is actually consumed. Sections marked
> _(refine)_ are inferred and the owner should sharpen them; nothing here is a
> placeholder.

register: product

## What this is

`@misael703/ui` is an internal React + TypeScript component library, optimized
for Next.js (App Router, RSC-ready: every component carries `'use client'`).
It is **not** a public OSS project competing for external adoption. Its job is
to give the owner's own applications one consistent, accessible, versioned UI
foundation.

## Users

- **Primary:** the owner (solo dev) building and maintaining several apps that
  consume the kit via npm + SemVer — barritas (Next.js, in prod), marginapp,
  and other El Alba / hardware-retail tools.
- **End users of those apps:** Spanish-speaking operators of hardware-retail /
  POS / admin software (Ferretería El Alba domain). They are in a task, on
  desktop and mobile, and value speed and clarity over novelty.

The kit serves the product; it should disappear into the task. Familiarity and
consistency are features here, not weaknesses.

## Brand & tone

- Two identities from one codebase via the preset architecture:
  - **Generic default:** warm-earth, premium, anti-corporate (espresso + sand
    on cream paper). Deliberately not the generic AI/Bootstrap/Material look.
  - **El Alba preset:** the real brand — Pantone 287 C blue + Pantone 165 C
    orange, white canvas. Used by barritas and El Alba apps.
- Voice of UI copy: neutral Spanish, `tú` (never `vos`), no accented
  imperatives, no Chilean/Argentine slang. Professional, plain, precise.
- Built-in i18n (`LocaleProvider`, Spanish defaults) and runtime brand config
  (`configureBrand()` for name/currency/locale).

## Anti-references

- Generic AI-generated dashboards: indigo/violet gradients, glassmorphism,
  gradient text, hero-metric templates, identical icon+heading+text card grids.
- Default Material / Bootstrap / Tailwind-UI sameness.
- "Strangeness without purpose": over-decorated buttons, mismatched form
  controls, gratuitous motion, display fonts in labels, reinvented affordances
  for standard tasks. The bar is earned familiarity.

## Strategic principles

- **Accessibility is owned, not delegated.** No Radix; the kit implements
  semantic roles, ARIA wiring, keyboard nav and focus management itself, and is
  responsible for getting WAI-ARIA patterns right (verified by tests + the
  Storybook a11y addon).
- **Zero runtime dependencies.** React/react-dom are peers; recharts is opt-in.
  Dual ESM/CJS, per-component tree-shaking.
- **Theming by token cascade.** Brand changes are preset overrides, never
  component edits. CSS-vars only (no Tailwind coupling), `@layer` isolation.
- **Conservative for consumers.** No breaking changes without a clear reason;
  the public barrel (`src/index.ts`) is the contract. SemVer + CHANGELOG +
  Trusted Publishing discipline.
- **Distinct but quiet.** A recognizable warm identity, but delight lives in
  moments, not on every surface. Consistency screen-to-screen is the virtue.

## Known constraints _(refine)_

- Light theme only today; global dark mode is deferred (revisit when a
  consuming app actually needs it).
- Single CSS stylesheet (~19 KB gzip); no per-component CSS split (documented
  tradeoff, acceptable for internal multi-app use).
