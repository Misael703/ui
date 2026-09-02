# Registro compact como default del kit (v3.0.0)

**Fecha:** 2026-09-02 · **Estado:** aprobado (diseño validado visualmente en
`Explorations/Densidad (desechable)`, stories A vs B)

## Problema

Los elementos de contenido del kit son grandes de base (inputs 44px/16px,
título de página hasta 30px, controles de menú 44px). Usuarios reales operan
el navegador al 110–125% (necesitan texto más grande), y con ese zoom la UI
se infla de forma desproporcionada. El chrome (AppShell) está bien; el
problema es el **registro tipográfico y dimensional del contenido**.

Referencia de industria: las herramientas de trabajo densas (Linear, Stripe
Dashboard, Gmail) usan 13–14px en controles y datos; 16px es registro de
formularios de marketing/producto.

## Decisión

**Estrategia C — default + tokens.** Compact pasa a ser el ÚNICO default del
kit (breaking visual → v3.0.0), y en el camino las medidas se tokenizan como
"size sets" completos. No se shipea ningún modo alternativo de densidad; los
tokens dejan la infraestructura lista si algún día una superficie lo pide.

Principio rector (validado con el botón del borrador): al escalar un control
se escalan **todas** sus medidas juntas — altura, font, padding y radio —
manteniendo la relación interna (~3:1 altura:font). Nunca una altura suelta.

## 1 · Tokens nuevos (`_root.css`)

- `--control-h-sm: 28px`, `--control-h-md: 38px`, `--control-h-lg: 44px` —
  altura de todo control interactivo (botones, inputs, selects, items de
  menú/combobox, triggers de picker).
- `--control-font-sm: var(--text-xs)` (12), `--control-font-md: var(--text-sm)`
  (14, para campos e items de menú), `--control-font-lg: var(--text-sm)` (14).
  Excepción deliberada: Button `md` usa 13px (`--text-data`) — su texto es
  uppercase + bold + tracking wide, ópticamente más grande que el mismo
  cuerpo en sentence case; 14px uppercase desequilibraba la caja de 38px
  (validado visualmente en el borrador).
- `--control-pad-x-{sm,md,lg}` y `--control-radius-{sm,md}` completan el set.
- `--text-data: 0.8125rem` (13px) — stop semántico nuevo para celdas de tabla
  y superficies de datos densas (no existía nada entre 12 y 14).
- `--field-min-h` / `--field-pad-y` / `--field-pad-x` (existentes desde
  v1.10.0) pasan a leer de `--control-*` en vez de duplicar px.
- El type scale `--text-*` (rem) NO se toca; cambia qué token consume cada
  componente.

## 2 · Registro aplicado (valores aprobados visualmente)

| Componente | Antes | Después |
|---|---|---|
| Inputs / selects / textarea / combobox | 44px / 16px | 38px / 14px (pad 7·12) |
| Labels de campo (`.field__label`) | 14px bold | 12px bold |
| Button `md` | 44px / 14px / radio 8 / pad 10·18 | 38px / 13px / radio 6 / pad 0·16 (centrado flex) |
| Button `lg` | 52px / 16px | 44px / 14px |
| Button `xl` | 60px / 18px | 52px / 16px |
| Button `xs`/`sm` | 28 / 36px | sin cambio (ya compactos; `sm` puede bajar a 32px si el set lo pide) |
| Toggle / SegmentedControl `md` | 36px / 14px | 32px / 12px |
| Tabla (`.table td`) | 14px / pad 8·12 | `--text-data` 13px / pad 7·10 |
| PageHeader título | clamp hasta 30px | clamp hasta 24px (`--text-2xl`) |
| Card body/header | 20·24px | 16·20px |
| Items de menú / combobox / command palette / usermenu | 44px | 38px (`--control-h-md`) |

**No cambia:** AppShell completo (header 64, nav, rail), badges y `cell-meta`
(ya micro), iconografía (16/18), focus rings, colores, `--text-*` en rem,
sombras, motion.

La barrida es mecánica pero total: todo size set de `index.css` (~30 sitios
con 44/40px o `--text-md` de control) baja un paso con la proporción 3:1.
Sitios que son *contenido* y no control (avatares, testimonial, precios,
resumen de orden) se evalúan uno a uno y por defecto NO cambian.

## 3 · Guard táctil (accesibilidad)

Un único bloque:

```css
@media (pointer: coarse) {
  :root { --control-h-md: 44px; /* + pads acordes */ }
}
```

Como todos los controles leen tokens, los dispositivos táctiles restauran el
touch target de 44px (WCAG 2.5.5) sin tocar componentes. Los operarios de
despachos en móvil no sufren regresión. El font NO se re-agranda (el texto de
14px es legible; solo el área táctil crece).

## 4 · Compatibilidad

- `.fields--dense` (36px) y `table--comfortable` / `density` de DataTable
  quedan funcionando igual: desvíos chicos desde un default ya denso.
- Sin cambios de API, props ni markup. Breaking **solo visual** → v3.0.0.
- Blocks (`src/blocks/`, fuera de dist) heredan gratis por clase.

## 5 · Verificación

- Tests de guardia con px actualizados a los valores del registro (pinnean el
  nuevo default). Suite completa + `npm run build` + `smoke:ci`.
- Barrido headless de stories clave: preset genérico y El Alba × light y dark.
- Comparación visual contra screenshots pre-cambio (mismo viewport 1440×900).
- Entrega vía rama + PR; release/npm los gatilla el usuario (nunca push sin OK).

## 6 · Limpieza

- `src/components/DensityCompare.stories.tsx` (scratch) se borra al mergear.
- `tasks/todo.md` histórico se archiva; el plan de esta feature lo reemplaza.
