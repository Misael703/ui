# UI Kit v3.9.0 — `CalendarView`: un calendario para los tres pickers

**Origen:** tres calendarios sin código común (DatePicker, DateRangePicker con `monthDropdown` opcional, MonthPicker/YearPicker). Referencia del usuario: cabecera con prev/next cuadrados + título "Mes Año" con chevron que abre la grilla de meses; hoy con punto; seleccionado en círculo relleno; meses 3×4 con píldora.
**Branch:** `feat/calendar-view` desde main (3.8.1). Push/PR/release con OK explícito.

## Tareas
- [x] T1 — `CalendarView` interno (`src/components/CalendarView.tsx`): `view: 'days'|'months'|'years'`, cabecera (prev/next ghost 32px + título-botón con chevron), grilla de días (dow, outside subtle, today dot, selected círculo, banda de rango opcional vía `rangeOf(d)`), grilla de meses y de años (3×4, píldora, actual en marca). Teclado: flechas/Home/End/PageUp/PageDown en días, flechas en meses/años, Enter selecciona, Escape vuelve a días. Roving tabindex, `role="grid"`.
- [x] T2 — CSS `.calview*` con tokens; retirar `.datepicker__nav/title/grid/dow/day`, `.gridpicker__nav/title/grid/cell`, `.daterange__nav/title/grid/dow/day/monthjump/menu*` (mantener trigger/popover/presets/inputs/actions).
- [x] T3 — `DatePicker` usa `CalendarView` (días; selector de mes/año siempre).
- [x] T4 — `DateRangePicker` usa `CalendarView` ×1/×2 con `rangeOf`; `monthDropdown` deprecado (no-op, siempre hay selector); presets/inputs/Aplicar intactos.
- [x] T5 — `MonthPicker`/`YearPicker` usan las grillas de meses/años de `CalendarView`.
- [x] T6 — Tests: navegación de vistas, teclado, selección, rango, hoy; re-apuntar tests que pinean clases viejas. Stories: playground de calendario (Forms/Pickers) con controls vista · rango · hoy · disabled; stories de los 3 pickers.
- [x] T7 — DESIGN.md (familia calendario), CHANGELOG 3.9.0, bump, tsc/lint/build, Chromium light/dark.

## Review
1220 tests (CalendarView: cabecera, vistas, hoy/seleccionado/disabled, teclado con RePág por día del mes, focusCalendar; 15 tests re-apuntados), tsc 0, lint 0 errores, build OK. Chromium light/dark: DatePicker, DateRangePicker (2 paneles, banda con extremos redondos), MonthPicker, YearPicker, playground de calendario; teclado real: ArrowDown entra al calendario, flechas, AvPág, Enter selecciona y cierra. Pendiente OK para push/PR/release 3.9.0.
