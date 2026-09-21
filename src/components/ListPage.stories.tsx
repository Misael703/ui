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
 * **Playground · list page.** The standard structure of a listing and how
 * its pieces behave together: `PageHeader` → `DataTable` with
 * `toolbar={<FilterBar/>}` → rows. The bar carries the fields, the count in
 * `summary`, and in `actions` what operates on the result: "Clear" only with
 * filters applied; "Export" goes in `overflow` — both tertiary (`ghost
 * sm`): the page's only primary action lives in the `PageHeader`; on mobile
 * "Export" hides behind the "⋯" menu and "Filters" is the funnel with the
 * count on top. `layout` walks the "how much you hide" scale (inline →
 * collapse → drawer) and `applied` paints the values as dismissible chips,
 * the only honest way to hide fields. No Card: the table is the surface.
 * Bump `fields` to 7 to see how it wraps the grid and where the count lands.
 * Full rules in DESIGN.md › List-page recipe.
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
 * **Full listing.** The reference composition with fixed values — same
 * render as the playground: `PageHeader` with the single primary action;
 * one surface with `FilterBar` on top (search, status, branch, date; Export
 * in `overflow`, sort on mobile), rows in the middle with actions in a
 * kebab menu, and `TablePagination` at the bottom in `footer`; one divider
 * between each zone. To vary any piece, use the playground.
 */
export const Full: StoryObj = { render: () => <FullListPage /> };
