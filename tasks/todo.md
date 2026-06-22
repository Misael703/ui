# DateRangePicker report-grade (2026-06-22)

## Decisión de diseño (confirmada)

Progressive disclosure: **props opt-in en el MISMO `DateRangePicker`**, no un
componente aparte. El band continuo es polish → **always-on** (lo ven todos).
Inputs + dropdown → opt-in (reportes). Filtro simple queda lean.

## Alcance: Completo opt-in

1. **Band continuo (always-on)** — el resaltado de rango pasa de celdas planas con
   gap (se corta) a un band conectado por fila, con extremos redondeados (pill).
   Endpoints (`from`/`to`) = círculo sólido encima del band. Cubre hover-preview.
2. **`showInputs` (opt-in)** — inputs "Desde"/"Hasta" tipeables arriba del
   calendario; parseo (`parseDate`) + sync con el rango; saltan la vista al mes.
3. **`monthDropdown` (opt-in)** — reemplaza el título estático por un botón
   "MMMM de YYYY ▾" que abre un panel año‹ ›+ grilla de 12 meses para saltar.
4. **`months?: 1 | 2`** (default 2) — layout mono-mes compacto (lo del screenshot).

## Checklist

- [ ] Locale: `daterange.from`/`daterange.to`/`daterange.jumpMonth` en messages.ts + es.ts
- [ ] Props: `showInputs`, `monthDropdown`, `months` en la interface
- [ ] Helpers: `setRange(next)` (split apply/legacy), `spanBounds()`, `commitInput`
- [ ] renderMonth: flags `is-band`/`is-band-start`/`is-band-end`; título condicional
- [ ] JSX: fila de inputs; trigger+menú del dropdown; render condicional de meses
- [ ] CSS: band (::before bridge + ::after círculo endpoint), inputs, month menu
- [ ] Tests: band classes por posición, input parse→rango, dropdown jump, defaults sin cambio
- [ ] Story "report" (showInputs + monthDropdown + months=1) en Advanced Pickers
- [ ] `npm test` + `npm run smoke:ci` verde
- [ ] Visual headless (band continuo, inputs, dropdown abierto)
- [ ] CHANGELOG + bump MINOR — esperar release como veníamos

## Review

Shipeado en `Metrics.tsx`… digo, `AdvancedPickers.tsx`. v1.60.0. 13 tests nuevos
(8 report + 5 daterange band/divider previos), suite 748 verde, smoke 64 verde,
build/lint/tsc limpios. Visual headless confirmó: report config = réplica fiel
del screenshot (inputs + dropdown 1-línea + band continuo), menú año/mes, y el fix
del wrap del trigger (`.daterange__nav > button` directo, no descendiente — la
regla width:28px aplastaba el trigger anidado).

## Notas técnicas

- Band continuity: solo HORIZONTAL dentro de la fila (cada semana es su propia
  pill, como el screenshot). `::before` con `inset: 0 -1px` bridgea el gap 2px.
- Columna del cell = `i % 7` (header son 7 cells → offset múltiplo de 7).
- band-start = endpoint `a` OR col 0 (lunes); band-end = endpoint `b` OR col 6 (dom).
- Sin nuevos exports del barrel → no toca ICON_NAMES/ENTRIES.
