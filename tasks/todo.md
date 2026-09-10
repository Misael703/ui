# 4.0.0 — registro producto

Rama `feat/product-register`. Cambio visual global (major): menos tinta, no menos
tamaño. Decisiones cerradas 2026-09-09: controles se quedan en 38px; hairlines se
quedan; borde de controles 3:1 se queda (relleno tonal diferido); título de página
pasa a fuente de cuerpo; `--tt-action` para que un preset pueda volver a caps.

## Plan
- [x] Tests de contrato `tests/ProductRegister.test.tsx` (rojo primero)
- [x] Tokens `_root.css`: `--tt-action: none`, `--tracking-action: 0`, `--radius-lg` 12 → 8
- [x] Button: frase (`--tt-action`), sin tracking, 600, md a `--control-font-md` (14px, cae la excepción `--text-data`), radio `--control-radius-md` en todos los tamaños, íconos 16px (18 en lg/xl)
- [x] Inputs/select/textarea/combobox/pickers: radio `--control-radius-md` (6px), igual que el botón
- [x] Badge: 20px (padding 1px 8px, line-height 18px), 500, sin tracking
- [x] Tabla: celda 6px 10px; pie de tabla padding-block 4; barra de filtros padding 8px 16px; `FilterBar layout` default `collapse`
- [x] PageHeader: margen inferior 8px; título fuente de cuerpo 600 20px sin tracking
- [x] Card: divisor del header opt-in (`CardHeader divider`)
- [x] Actualizar tests pinneados (ControlRegister, GoldStandard) con la intención nueva
- [x] Story Foundations/Registro: dejar solo las perillas diferidas (36px, divisores tonales, borde de controles)
- [x] DESIGN.md (registro producto, tokens, excepción del botón eliminada), CHANGELOG 4.0.0 con guía de migración, package.json 4.0.0
- [x] Verificación: suite, tsc, lint, build; capturas en Storybook (listado, formulario, card) antes/después

## Fuera de 4.0.0 (anotado)
- Placeholder por contexto del Combobox ("Seleccionar…" / "Todos") y trigger no buscable que dice "Buscar…" → minor aparte
- Guard global de `prefers-reduced-motion` → aparte
- Relleno tonal de controles con borde 3:1 → explorar después ("si lo pulimos puede quedar bien")

## Revisión (2026-09-10)
- Rama `feat/product-register`, un commit sobre main 3.9.5 más la story.
- 18 tests de contrato nuevos (`tests/ProductRegister.test.tsx`), 5 tests pinneados actualizados con la intención nueva (ControlRegister ×2, GoldStandard, Filters, DatePickerDisabled). Suite 1253 verde, tsc 0, lint 0 errores.
- Medido en Storybook: botón 38px / 14px / 600 / sin caps ni tracking / radio 6; badge 500 sin tracking, 22px con hairline (igual que shadcn: 16 + 2·2 + 1·1).
- Capturas: listado, superficies (card sin divisor), formulario, badges.
- Radio de controles: cambió en input/select/textarea, input-group, combobox, datepicker, daterange, timepicker, phone, tag, qty y gridpicker (estaba en 4px). Modal/drawer/card/tabla siguen `--radius-lg` (ahora 8).
