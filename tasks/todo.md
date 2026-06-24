# MoneyInput: live formatting while typing (2026-06-24)

## Problema
Hoy `MoneyInput` muestra `String(value)` mientras está enfocado y solo aplica
`Intl.NumberFormat(currency)` en blur → al tipear se ve el número crudo (123123)
y agrupa recién al salir (salto de reformateo).

## Objetivo
Mostrar SIEMPRE formateado (agrupado por miles del locale + símbolo), idéntico
enfocado y en blur. API pública SIN cambios. Núcleo = manejo del caret.

## Diseño
- `liveFormat?: boolean` default `true` (nuevo, opt-out al comportamiento legacy
  focus-raw/blur-formatted como escape hatch backward-compat).
- Helpers: `countDigits(s)`, `caretPosAfterDigits(formatted, n)`.
- Ref merge (forwardRef + innerRef) para `setSelectionRange`.
- `caretRef` (dígitos a la izq del caret) + layout effect ([value], guard
  activeElement + SSR-safe) que reposiciona tras el re-render controlado.
- `onKeyDown` Backspace/Delete (path live): opera sobre el string de DÍGITOS,
  así backspace SIEMPRE borra un dígito (no se traba en el separador). Maneja
  selección (select-all + delete → null).
- `onChange` (path live): lee selectionStart, cuenta dígitos a la izq, extrae
  raw (`/\d/` + signo), `onChange(Number(raw)|null)`, agenda caret.
- `type="text" inputMode="numeric"`, `maximumFractionDigits: 0`, separadores
  derivados del Intl resuelto (no hardcode).

## Checklist
- [ ] `MoneyInputProps.liveFormat?: boolean`
- [ ] Helpers countDigits / caretPosAfterDigits
- [ ] Ref merge + caretRef + isomorphic layout effect
- [ ] onChange (live) + onKeyDown (live Backspace/Delete + selección)
- [ ] Legacy path detrás de `liveFormat={false}` (focus state)
- [ ] Story InputsExtra: demo de tipeo en vivo
- [ ] smoke registry MoneyInput sigue cubierto (gate)
- [ ] Tests unit: tipear→agrupa, insertar al medio (caret), backspace tras
      separador, pegar 1.234.567 y 1234567, borrar todo→null
- [ ] .d.ts/barrel: liveFormat aparece (export * ya lo trae)
- [ ] full test + build + smoke
- [ ] CHANGELOG + bump MINOR; release solo vía GitHub Release

## Review
Shipeado v1.67.0. `MoneyInput` formatea en vivo (agrupado + símbolo) mientras se
escribe, idéntico focus/blur. `liveFormat?: boolean` default true (legacy detrás
de false). Caret manejado vía countDigits + caretPosAfterDigits + isomorphic
layout effect ([value], guard activeElement). Backspace/Delete por onKeyDown
operan sobre el string de dígitos → no se traban en separadores; selección →
borra rango; onChange para typing/paste. 8 tests unit nuevos (suite 804 verde).
Build OK, liveFormat en dist d.ts, smoke:ci exit 0. Headless real-keyboard:
tipear 123123→$123.123 (caret end), mid-insert caret tras el dígito, backspace
tras separador borra el dígito, paste 1.234.567→$1.234.567. Story con 3 demos
(CLP live, USD en-US, legacy). API pública sin cambios.

Pendiente: release vía GitHub Release (autorizado por el spec del task).
