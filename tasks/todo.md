# UserMenu component (consumer-driven: despachos mobile overflow) — 2026-06-23

## Root cause
El patrón "user pill → avatar en mobile" vivía en CSS local de la story
(`@media (max-width:900px) .user-pill__text{display:none}`). Despachos copió
el trigger pero no la media query → nombre+rol+chevron desbordan en mobile.
Footgun repetido → baja al kit como componente.

## Tasks
- [ ] `src/components/UserMenu.tsx` — Popover + Avatar + ChevronDown
- [ ] `src/styles/index.css` — clases `.usermenu__*` + media query 900px
- [ ] `src/index.ts` — export barrel
- [ ] `smoke/gallery/registry.tsx` — ENTRIES (gate anti-rot)
- [ ] story `TopbarUserMenu` → usar `<UserMenu>` (borra CSS inline)
- [ ] `tests/UserMenu.test.tsx`
- [ ] build + test + smoke

## API
UserMenuItem { label, icon?, onSelect?, href?, danger? }
UserMenuProps { name, role?, items: (UserMenuItem|'separator')[], avatar?,
  align='end', placement='bottom', linkAs?, className?, contentClassName?, ariaLabel? }
Breakpoint 900px fijo (= mobile drawer del AppShell). open manejado interno.

## Review
Shipeado v1.66.0. `src/components/UserMenu.tsx` (Popover + Avatar + ChevronDown),
clases `.usermenu__*` + media query 900px en index.css, export en barrel, ENTRIES
en registry, story reescrita a `<UserMenu>` (borró CSS inline + imports muertos
Popover/ChevronDown). 6 tests nuevos (incl. guard de la media query), suite 795
verde, build OK (UserMenu + tipos en dist), publint hard-gate verde, smoke real
Next consumer 64 e2e verde (incl. gate anti-rot + no-overflow @375px). Visual
headless: desktop pill 173px, mobile colapsa a avatar 32px (texto+chevron hidden),
popover con header + Perfil + Salir(danger).

Extra: `SMOKE_PORT` env-override (default 3100) en playwright.config + start script
→ smoke local ya no choca con infra ajena en 3100.

Pendiente: release (espera OK del user, no publico sin confirmación).
