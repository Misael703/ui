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

[2026-05-18] Context: local-linking the kit into a consumer (despachos mock) via
a `file:` tarball to verify v1.10.0 before publish. After fixing a kit defect and
re-`npm pack`+`npm install`, the consumer kept serving the OLD CSS. Two stacked
causes: (1) a stale `next dev` from a previous session still held :3009
(`EADDRINUSE` swallowed my new server → Playwright tested 1.8.0); (2) npm caches a
`file:` tarball dep by the lockfile integrity, so a same-version tarball with new
content is NOT re-extracted (even `rm -rf node_modules/@misael703` + reinstall
restored the cached old copy).
→ Rule: for a same-version local tarball link, a content change needs
`rm -rf node_modules/<pkg> package-lock.json && npm install` (regenerate the
lockfile so npm re-reads the tarball) — bumping the file or `.next` clear is not
enough. And before trusting any browser verification, confirm the dev server is
*yours*: free the port first (`lsof -ti tcp:PORT | xargs kill`) and check the
dev log started clean, or you're QA-ing a ghost. Assert the change in the
*served* CSS/DOM (computed style), not just in `node_modules` on disk.

[2026-05-29] Context: I shipped the AppShell mobile drawer (PR #47) with
`tests green + smoke green + CI green` and reported "ready for merge". The
user replied "qué hiciste para revisarlo y qué falta" — and the answer was
*not enough*. Self-review surfaced three real issues I'd introduced in the
same PR: (A) `aria-hidden` was dead code because `isMobile` was a ref, so
React never re-rendered and the attribute never landed; (B) no focus trap
inside the drawer despite having diagnosed "P1 #6 focus trap mobile no
existe" for the side layout in the same session; (C) no body scroll lock
despite the kit already shipping `useScrollLock` for Modal/Drawer. All three
fixable, all three would have been bugs in production.
→ Rule: before presenting a PR as "ready", run a self-review pass that asks
three specific questions, in this order: (1) what bugs did I introduce in
THIS PR (state vs ref, listeners without re-render, missing aria-hidden /
focus / scroll-lock)? (2) what cases from the recent audit does this PR
perpetuate? (3) which combinations of props are NOT covered by my tests
(theme × headerTheme × rail × persistKey × breakpoint)? If you can't answer
all three with evidence, the PR is not ready — write the answers down before
asking for merge approval.

[2026-06-11] Context: cadena background de merge quedó colgada en `until gh pr
checks N | grep "Passed:"` — dentro de scripts multilínea el hook de rtk NO
reescribe `gh pr checks`, así que el output es la tabla cruda de gh (sin el
summary "Passed: N" que rtk sintetiza); el grep nunca matchea. → Rule: en
loops de espera de CI dentro de scripts background, no parsear texto de
formato variable; usar salida estructurada estable: `gh pr checks N --json
bucket --jq '[.[] | select(.bucket=="pending")] | length'` y comparar contra
"0". Mismo principio para cualquier comando que rtk reescriba en foreground.

[2026-06-11] Context: PR #76 mergeó con CI verde pero el workflow de publish
falló en su step de Lint — el CI de PRs no corre eslint, solo publish.yml lo
hace; mi pre-check local linteaba solo los archivos tocados y con `| tail -1`
que tragó el error real (ternario-como-statement en una story). → Rule: antes
de pushear CUALQUIER PR del kit, correr `npm run lint` completo y verificar
exit code 0 — es el gate exacto del publish. Nunca filtrar la salida de un
gate con tail/grep sin verificar también el exit code.

[2026-07-08] Context: al publicar v1.79.0, publish.yml falló en "Upgrade npm"
(`npm install -g npm@latest` → npm@12, que dropeó Node 20 con EBADENGINE; el job
pinnea Node 20). Arreglé el step (pin `npm@^11`) y lo pusheé a main, pero el
re-intento SIGUIÓ corriendo el workflow viejo: los eventos `release` ejecutan el
workflow DEL COMMIT AL QUE APUNTA EL TAG, no de HEAD de main. El tag v1.79.0
seguía en el commit pre-fix, así que recrear el release no bastaba. → Rule: (1) un
commit de fix a un workflow disparado por `release` NO aplica hasta que el TAG lo
incluya — mover el tag (`git tag -f vX && git push -f origin vX`, seguro si nunca
se publicó) y recrear el release, no solo pushear a main. (2) `npm install -g
npm@latest` en runners con Node pinneado es una bomba de tiempo: pin al major
compatible (npm@^11 para Node 20; Trusted Publishing solo exige >=11.5.1), no
@latest. (3) Verificar el fix leyendo el LOG del step, no solo el exit del watch:
el run puede "completar" y aun así haber corrido el archivo viejo.
