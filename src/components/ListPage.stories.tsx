import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from './Filters';
import { ListPagePlayground, FullListPage, type ListPageArgs } from './__fixtures__/listPage';

const meta = {
  title: 'Patterns/List page',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FilterBar>;
export default meta;

/**
 * **Playground · página de listado.** La estructura estándar de un listado y
 * cómo se comportan sus piezas al juntarse: `PageHeader` → `DataTable` con
 * `toolbar={<FilterBar/>}` → filas. La barra lleva los campos, el conteo en
 * `summary` y en `actions` lo que opera sobre el resultado: "Limpiar" solo con
 * filtros aplicados; "Exportar" va en `overflow` — ambas terciarias (`ghost
 * sm`): la única primaria de la página vive en el `PageHeader`; en móvil
 * "Exportar" se esconde tras el menú "⋯" y "Filtros" es el embudo con el
 * conteo encima. `layout` recorre la escala "cuánto escondes" (inline →
 * collapse → drawer) y `applied` pinta los valores como chips descartables,
 * la única forma honesta de esconder campos. Sin Card: la tabla es la
 * superficie. Sube `fields` a 7 para ver cómo envuelve la grilla y dónde queda
 * el conteo. Reglas completas en DESIGN.md › List-page recipe.
 */
export const Playground: StoryObj<ListPageArgs> = {
  args: { fields: 7, layout: 'inline', visibleCount: 'auto', barMobile: 'drawer', mobileLayout: 'cards', summary: true, filtersApplied: false, exportAction: true, sort: true, rowActions: 'inline', pagination: 'inside' },
  argTypes: {
    fields: { control: { type: 'range', min: 2, max: 7, step: 1 } },
    layout: { control: 'inline-radio', options: ['inline', 'collapse', 'drawer'], description: 'How much to hide: inline (all, wraps) · collapse (first N, only when the set does not fit one line) · drawer (all behind the funnel; search pinned; applied values as chips)' },
    visibleCount: { control: 'inline-radio', options: ['auto', 1, 2, 3, 4, 5], description: 'With collapse: auto = however many fit next to the final group; N = cap' },
    barMobile: { control: 'inline-radio', options: ['drawer', 'inline', 'collapse'], description: 'The same choice under 600px (FilterBar mobileLayout). Narrow the canvas to see it.' },
    mobileLayout: { control: 'inline-radio', options: ['cards', 'table'], description: 'Under 600px: cards per row (default, `Column.mobile` splits title/status/fields) or a table with priority columns (`mobile: "hidden"`).' },
    summary: { control: 'boolean' },
    filtersApplied: { control: 'boolean' },
    exportAction: { control: 'boolean' },
    sort: { control: 'boolean', description: '`FilterBar sort`: SortDropdown in the bar, by default only under 600px (no thead in cards)' },
    rowActions: { control: 'inline-radio', options: ['inline', 'menu', 'none'], description: 'Up to 2 actions: pencil and bin inline · 3 or more: kebab menu' },
    pagination: { control: 'inline-radio', options: ['inside', 'outside', 'none'], description: 'inside = `DataTable footer` (same surface) · outside = TablePagination below' },
  },
  render: (args) => <ListPagePlayground {...args} />,
};

/**
 * **Listado completo.** La composición de referencia con valores fijos —
 * mismo render que el playground: `PageHeader` con la única primaria; una
 * sola superficie con `FilterBar` arriba (búsqueda, estado, sucursal, fecha;
 * Exportar en `overflow`, orden en móvil), filas en el medio con acciones
 * en kebab, y `TablePagination` abajo en `footer`; un divisor entre cada
 * zona. Para variar cualquier pieza, usa el playground.
 */
export const Full: StoryObj = { render: () => <FullListPage /> };
