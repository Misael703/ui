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

[2026-05-17] Context: during the v1.10.0 density/contrast pass, files reported
"modified since read" on almost every Edit, and `package.json`/`CHANGELOG.md`
jumped from 1.9.0 to 1.9.1 mid-session (a concurrent process landed an unrelated
Combobox positioning patch + its test). I almost anchored the CHANGELOG/version
edits to a stale baseline.
→ Rule: treat the repo as a live working tree, not a snapshot. Re-Read a file
immediately before each Edit (the harness requires it anyway), and before
writing release metadata (version bump, CHANGELOG anchor) re-check
`package.json` version + `git status` so you branch off the *current* baseline,
not the one from session start. When the baseline moved under you, say so in the
summary instead of silently overwriting.
