# v0.3.0 — Exit animations + DataTable features + misc cleanups

## Bloque 1 — Exit animations Modal/Drawer/Toast

### Problema

Hoy `if (!open) return null` → unmount instantáneo. No hay fade-out aunque el CSS quisiera animar la salida.

### Diseño

Hook compartido `useDelayedUnmount(open, durationMs)`:

```tsx
export function useDelayedUnmount(open: boolean, durationMs: number) {
  const [mounted, setMounted] = React.useState(open);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, durationMs);
      return () => clearTimeout(t);
    }
  }, [open, durationMs, mounted]);

  return { mounted, closing };
}
```

Componentes consumidores agregan clase `is-closing` durante el fade-out window. CSS define `@keyframes` para la entrada y la salida.

### Aplicación

- **Modal**: backdrop fade + content scale-up entrando, fade + scale-down saliendo.
- **Drawer**: backdrop fade + slide-in lateral. Al cerrar: fade-out + slide-out.
- **Toast**: ya tenía animación de entrada; agregar slide-out + fade-out al dismiss.

Duración: 200ms para Modal/Drawer (igual a CSS transitions estándar). 300ms para Toast (más lento, da feedback de "se está yendo").

### Archivos a tocar

- `src/hooks/useDelayedUnmount.ts` (nuevo) + barrel
- `src/components/Overlay.tsx` — Modal + Drawer
- `src/components/Toast.tsx`
- `src/styles/index.css` — `@keyframes` + `.is-closing`

### Plan por commits

- [ ] **Commit B1.1**: `feat(overlay): exit animations for Modal/Drawer via useDelayedUnmount`
  - Crear hook + tests
  - Aplicar a Modal y Drawer
  - CSS: keyframes + `.is-closing` rules
  - Tests: verificar que el component permanece montado durante `durationMs` después de `open=false`

- [ ] **Commit B1.2**: `feat(toast): exit animations on dismiss + auto-dismiss`
  - Aplicar pattern al Toast individual (no al ToastProvider)
  - El timer de auto-dismiss ya existe; solo reusarlo con la animación

## Bloque 2 — DataTable features

Cinco features pendientes según audit. Las hago en este orden por impacto vs esfuerzo:

### 2.1 — `error` prop (más simple)

```tsx
<DataTable error="Error al cargar datos" ... />
```

Si `error` está set, reemplaza el body con un mensaje de error (igual que `empty` pero distinto). Render: `<tr><td colSpan={...}>{error}</td></tr>` con clase `data-table__error`.

### 2.2 — Sticky header (CSS-only)

```tsx
<DataTable stickyHeader ... />
```

Agrega clase `data-table--sticky-header` al wrapper. CSS usa `position: sticky; top: 0` en el `<thead>`. El consumer es responsable de tener un wrapper con `overflow-y: auto` y altura máxima.

### 2.3 — Card layout mobile opt-in

```tsx
<DataTable mobileLayout="cards" ... />
```

En `<600px`, cada row se renderiza como una tarjeta (label + value pares verticales en lugar de columnas horizontales). El `<table>` se mantiene para desktop, CSS oculta/muestra según viewport.

Implementación: agregar clase `data-table--mobile-cards` al wrapper. CSS @media query reorganiza display.

### 2.4 — `<TablePagination>` component

Componente conveniente que envuelve `<Pagination>` con defaults razonables para contextos de tabla:
- Layout horizontal con info de "Mostrando X-Y de Z"
- Botones prev/next + números de página
- Selector de pageSize (opcional)

```tsx
<TablePagination
  page={page}
  pageSize={pageSize}
  total={total}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

### 2.5 — Virtualization (deferred)

No lo construyo. En su lugar, agrego sección al README con guía de cómo envolver DataTable con `react-window` o `@tanstack/react-virtual`. Es un caso de uso avanzado y los wrappers estándar funcionan.

### Plan por commits

- [ ] **Commit B2.1**: `feat(data-table): error prop for fetch failures`
- [ ] **Commit B2.2**: `feat(data-table): sticky header opt-in`
- [ ] **Commit B2.3**: `feat(data-table): mobile card layout opt-in`
- [ ] **Commit B2.4**: `feat(data-table): TablePagination component`
- [ ] **Commit B2.5**: `docs(data-table): virtualization recipe in README`

## Bloque 3 — Misc cleanups

Items menores del audit:

### 3.1 — AppShell `renderItem` memo recursivo

`renderItem` es una función definida dentro del componente que se reconstruye en cada render. Con muchos navItems, eso causa re-renders innecesarios.

Solución: extraer a un componente memoizado `<NavItem>` que recibe el item como prop.

### 3.2 — Carousel `next`/`prev` con useCallback

Los handlers se reconstruyen en cada render. `useCallback` los estabiliza para que children memoizados no re-rendericen.

### 3.3 — Drawer mobile bottom-sheet

En `<600px`, el Drawer entra por abajo en lugar de por la derecha. Patrón nativo móvil.

CSS: `.drawer--right` se vuelve `transform: translateY(100%)` por defecto en mobile, anima desde abajo.

### 3.4 — CategoryNav mega-menu touch

El mega-menu actual abre con hover. En touch devices, hover no funciona — debería abrir con click.

### 3.5 — `.desc-list` / `.diff` stacked mobile

En `<600px`, las DescriptionList y DiffViewer dejan de ser grid horizontal y stackean cada item verticalmente.

### Plan por commits

- [ ] **Commit B3.1**: `perf(app-shell): memo'd recursive nav item`
- [ ] **Commit B3.2**: `perf(carousel): useCallback for next/prev`
- [ ] **Commit B3.3**: `feat(drawer): bottom-sheet pattern on mobile`
- [ ] **Commit B3.4**: `fix(category-nav): mega-menu touch strategy`
- [ ] **Commit B3.5**: `feat(display): stacked mobile layout for desc-list/diff`

## Estimación total

- Bloque 1: ~1.5h (3 componentes + hook + tests + CSS)
- Bloque 2: ~3h (4 features pequeñas + TablePagination es la más grande)
- Bloque 3: ~2h (5 fixes pequeños)

**Total**: ~6.5h, 13-15 commits.

## Estrategia

- Todos no-breaking (excepto si algún cleanup descubre algo).
- Cada commit verde por sí solo (tests pasan, build limpio).
- Después de cada bloque verifico suite + build + smoke visual donde aplique.
- Al final del Bloque 3, summary general en CHANGELOG bajo `[Unreleased]`.

## Review

Pendiente — se va llenando incrementalmente con notas de cada bloque.
