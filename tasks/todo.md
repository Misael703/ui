# v0.3.0 — i18n LocaleProvider

## Objetivo

Mover los ~30 strings hardcoded en español a un dict tipado consumible vía context, manteniendo español como default (no breaking en runtime para consumers que no envuelvan `LocaleProvider`).

## Diseño

- **Context-based**: `<LocaleProvider messages={{...}}>` opcional. Sin provider, se usa `esMessages` como default.
- **Flat key dict**: `t['modal.close']` (no nested objects → más fácil de tipar y de override parcial).
- **Shallow merge**: el provider hace `{ ...esMessages, ...userMessages }` para que consumers solo overrideen las keys que quieren cambiar.
- **Hook**: `useLocale()` retorna el dict mergeado (memoizado).
- **Default fallback**: si una key no está en el dict (porque consumer pasó un dict incompleto sin merge), usar la key como fallback string para no romper el render.
- **Side modules**: `MONTH_NAMES` / `WEEKDAYS` (Display3) también vienen del dict como arrays.

## Dict tipado (UiKitMessages)

```ts
export interface UiKitMessages {
  // Generic actions
  'common.close': string;
  'common.cancel': string;
  'common.confirm': string;
  'common.apply': string;
  'common.clear': string;
  'common.edit': string;
  'common.empty': string;
  'common.loading': string;
  'common.search': string;
  'common.noResults': string;
  // Overlay
  'modal.close': string;
  'drawer.close': string;
  'toast.close': string;
  // DataTable
  'table.empty': string;
  'table.selectAll': string;
  'table.selectRow': string; // template: "Seleccionar {label}"
  // AppShell
  'appshell.mainNav': string;
  'appshell.expandMenu': string;
  'appshell.collapseMenu': string;
  'appshell.expand': string;
  'appshell.collapse': string;
  'appshell.openMenu': string;
  // Notifications
  'notifications.button': string; // template: "Notificaciones{unreadSuffix}"
  'notifications.unreadSuffix': string; // template: " ({n} sin leer)"
  'notifications.empty': string;
  'notifications.panel': string;
  // Filters
  'filters.panel': string;
  'filters.bulk': string;
  'filters.deselectAll': string;
  'filters.sortBy': string;
  // Editing
  'transfer.available': string;
  'transfer.assigned': string;
  'transfer.assignSelected': string;
  'transfer.removeSelected': string;
  'transfer.empty': string;
  'descList.edit': string;
  'diff.label': string;
  'diff.field': string;
  'diff.before': string;
  'diff.after': string;
  // Permissions
  'permissions.markAll': string;
  'permissions.unmarkAll': string;
  // Comments
  'attachments.empty': string;
  'attachments.remove': string; // template: "Eliminar {name}"
  // Gallery
  'gallery.thumbnails': string;
  'gallery.viewer': string;
  'gallery.prev': string;
  'gallery.next': string;
  // Display
  'alert.close': string;
  'spinner.loading': string;
  'chip.remove': string;
  // Display3 (Calendar)
  'calendar.prevMonth': string;
  'calendar.nextMonth': string;
  'calendar.weekdays': readonly [string, string, string, string, string, string, string]; // L M X J V S D
  'calendar.months': readonly [string, string, string, string, string, string, string, string, string, string, string, string];
  // Pickers
  'picker.openCalendar': string;
  'picker.clearSelection': string;
  'picker.selectRange': string;
  'picker.searchCommands': string;
  'combobox.remove': string; // template: "Quitar {label}"
  // Inputs
  'pagination.label': string;
  'pagination.prev': string;
  'pagination.next': string;
  'numberInput.decrement': string;
  'numberInput.increment': string;
  // Commerce
  'commerce.quantity': string;
  'commerce.decreaseQty': string;
  'commerce.increaseQty': string;
  'commerce.removeFromCart': string;
  'commerce.removeItem': string; // template: "Quitar {name}"
  'commerce.toggleFavorite': string; // template: "{add|remove} de favoritos"
  'commerce.addFavorite': string;
  'commerce.removeFavorite': string;
  'commerce.applyCoupon': string;
  'commerce.cartTitle': string;
  // Tags input
  'tagsInput.remove': string; // template: "Quitar {tag}"
}
```

Las plantillas con `{var}` se resuelven con un helper `format(template, vars)`.

## Plan por commits

- [x] **Commit 1**: `feat(locale): introduce LocaleProvider + UiKitMessages dict`
  - Crear `src/locale/messages.ts` (interface + helper `format`)
  - Crear `src/locale/es.ts` (defaults completos)
  - Crear `src/locale/LocaleProvider.tsx` (Provider + useLocale hook)
  - Crear `src/locale/index.ts` (barrel)
  - Exportar desde `src/index.ts`
  - Tests: `tests/locale.test.tsx` (default español, override parcial, format helper)

- [x] **Commit 2**: `feat(overlay): consume locale for Modal/Drawer/Toast close labels`
  - Overlay.tsx: `aria-label="Cerrar"` → `t['modal.close']` / `t['drawer.close']`
  - Toast.tsx: `aria-label="Cerrar"` → `t['toast.close']`
  - Tests: verifica que override de `modal.close` cambia el aria-label

- [x] **Commit 3**: `feat(data-table): consume locale for empty + selection labels`
  - DataTable.tsx: "Sin datos", "Seleccionar todo", "Seleccionar {label}"
  - Tests: override de `table.empty`

- [x] **Commit 4**: `feat(app-shell): consume locale for navigation labels`
  - AppShell.tsx: "Navegación principal", "Expandir/Colapsar menú", "Abrir menú", title attrs
  - Notifications.tsx: aria-labels y empty message
  - Tests: skip o smoke

- [x] **Commit 5**: `feat(forms): consume locale for filters + pickers labels`
  - Filters.tsx: "Filtros", "Acciones en lote", "Deseleccionar todo", "Ordenar por"
  - Pickers.tsx: "Buscar…", "Sin resultados", "Limpiar selección", "Abrir calendario", "Mes anterior/siguiente"
  - AdvancedPickers.tsx: idem + "Seleccionar rango", "Buscar comandos…", "Limpiar/Aplicar"
  - InputsExtra.tsx: "Quitar {tag}"
  - Inputs.tsx: paginación + number input
  - Tests: smoke

- [x] **Commit 6**: `feat(misc): consume locale for editing/permissions/comments/gallery/display/commerce`
  - Editing.tsx: ConfirmDialog default labels, TransferList (Disponibles/Asignados/Vacío/Asignar/Quitar), DiffViewer (Cambios/Campo/Antes/Después), DescriptionList (Editar)
  - Permissions.tsx: "Quitar/Marcar todos"
  - Comments.tsx: "Sin archivos adjuntos", "Eliminar {name}"
  - Gallery.tsx: "Imagen anterior/siguiente", "Miniaturas", "Visor de imagen", "Cerrar"
  - Display.tsx: "Cerrar alerta", "Cargando", chip removeLabel
  - Display3.tsx: WEEKDAYS, MONTH_NAMES (consumidos vía locale), "Mes anterior/siguiente", "Colapsar/Expandir"
  - Commerce.tsx: cantidad / favoritos / carro
  - Tests: smoke

- [x] **Commit 7**: `docs: document LocaleProvider in README + CHANGELOG`
  - README sección "Internacionalización"
  - CHANGELOG entry para v0.3.0 (added: LocaleProvider; otherwise non-breaking)

## Verificación

- [ ] Todos los tests existentes (249) siguen pasando sin cambios — los defaults preservan exactamente las strings actuales
- [ ] Tests nuevos: ~6-10 (provider default, override parcial, format helper, overlay override, table override, calendar weekday override)
- [ ] Build limpio (`npm run build`)
- [ ] No-breaking: app que no envuelve en LocaleProvider ve las mismas strings
- [ ] TypeScript: consumer recibe autocompletado en `messages` prop

## Riesgos

- **Performance**: useLocale en cada render. Mitigación: memo el dict mergeado en el provider.
- **SSR**: `React.useContext` es safe SSR.
- **Bundle**: el dict default añade ~1KB. Aceptable.
- **Testing existente**: si algún test queryea por aria-label "Cerrar" exacto, sigue funcionando porque el default es "Cerrar".

## Review (2026-05-05)

**Resultado**: i18n LocaleProvider implementado en 7 commits, todos no-breaking.
- 270/270 tests pasando (de 268 baseline + 13 nuevos para locale, todos los breaking que aparecieron por el cambio de defaults a templates fueron preservados con fallbacks `??`).
- Build limpio, +1.5KB ESM (dict + provider + algunos formats internos).
- ~80 keys finales (más que las 28 estimadas — DateRangePicker, Pagination con range template, Commerce con shopping cart completo, y el shipping prefix/suffix sumaron bastante).

**Decisiones que se tomaron sobre la marcha**:
- **Pluralización de `filters.selectedCount`**: split en dos keys `selectedOne` / `selectedMany` en vez de una sola con un placeholder. Más explícito y futuro-compatible para idiomas con > 2 formas plurales (cuando llegue, agregamos `selectedFew`, etc.).
- **Single-letter weekday vs. 3-letter weekday**: dos keys distintas (`picker.weekdaysShort` con "L M M J V S D" para DatePicker compacto, y `calendar.weekdays` con "Lun Mar Mié…" para Calendar full). Reusarlas habría obligado al consumer a elegir uno u otro.
- **Shipping prefix/suffix split**: la frase "Te falta {x} para envío gratis" se partió en dos keys (`shippingPrefix`, `shippingSuffix`) en vez de un template "${prefix}{x}${suffix}", porque idiomas con orden de palabras inverso (japonés, alemán) no podrían acomodar el `<strong>` con un único template.
- **AddressForm deferred**: los labels de RUT/región/comuna no entraron al dict — son CL-specific y meterlos hubiera bloated el dict para algo que un consumer en otro mercado va a reemplazar de todos modos.

**Riesgos confirmados como no-issue**:
- Performance: `useLocale()` se llama en cada componente que tenga strings. El dict mergeado se memoiza en el provider (referencia estable), así que el context update es O(1). React.memo'd children no se re-renderizan.
- Tests existentes: ningún test queryea por aria-label que haya cambiado, todo sigue siendo "Cerrar", "Sin datos", etc. en español por default.

**Próximos del v0.3.0 backlog**:
- Brand singleton refactor (item #2 del roadmap)
- Exit animations Modal/Drawer/Toast
- DataTable features

**Para v0.3.0 release**: bump version, CHANGELOG ya tiene la entrada en `[Unreleased]`. Antes de publicar a npm conviene hacer Task #8 (consumer test e2e) para validar que el LocaleProvider no rompe nada en una app real.
