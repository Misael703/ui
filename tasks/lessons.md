# Lessons

[2026-05-17] Context: while fixing Tree a11y I removed the `useLocale` import from
`Display3.tsx` after an `rg` for `useLocale` returned 0 matches, concluding it
was a dead import. It was not — `Calendar` (same file) uses it. The grep was
unreliable (rtk rewrite / pattern issue), and I trusted it instead of the
compiler. Two tests + tsc went red.
→ Rule: never delete an import (or declare code "unused") based on a grep alone.
Confirm with `npx tsc --noEmit` (or the build) BEFORE concluding, and always run
`tsc` + the test suite after touching a shared file, not just the targeted test.
Grep proves presence, never absence.
