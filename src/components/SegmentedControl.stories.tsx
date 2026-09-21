import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { SegmentedControl, SegmentedControlItem } from './Toggle';
import { Rows3, CalendarDays, Map, LayoutGrid, Columns3 } from './Icons';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  subcomponents: { SegmentedControlItem },
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>;
export default meta;

// Hoisted: array holds React elements.
const VIEWS = [
  { value: 'list', label: 'Lista', icon: <Rows3 size={16} /> },
  { value: 'calendar', label: 'Calendario', icon: <CalendarDays size={16} /> },
  { value: 'map', label: 'Mapa', icon: <Map size={16} /> },
  { value: 'grid', label: 'Grilla', icon: <LayoutGrid size={16} /> },
  { value: 'board', label: 'Tablero', icon: <Columns3 size={16} /> },
];

/**
 * **SegmentedControl** — single-select with equal-width segments, the
 * view-switcher case. No `type` to forget (it's always single), so no
 * cryptic union error. `SegmentedControlItem` aliases `ToggleGroupItem`.
 */
export const Default: StoryObj = {
  render: () => {
    const [view, setView] = React.useState<string | null>('list');
    return (
      <div style={{ maxWidth: 320 }}>
        <SegmentedControl value={view} onChange={setView} ariaLabel="Vista">
          <SegmentedControlItem value="list">Lista</SegmentedControlItem>
          <SegmentedControlItem value="grid">Tarjetas</SegmentedControlItem>
          <SegmentedControlItem value="board">Tablero</SegmentedControlItem>
        </SegmentedControl>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-muted)' }}>Vista actual: {view}</p>
      </div>
    );
  },
};

/**
 * **View switcher with icons** — `SegmentedControlItem` accepts `icon`. Five
 * views of the same resource (List / Calendar / Map / Grid / Board). Top row
 * with icon + label; bottom row icon-only (each segment carries an
 * `aria-label` for the accessible name, since the icon is decorative).
 */
export const ViewSwitcherIcons: StoryObj = {
  name: 'View switcher (icons)',
  render: () => {
    const [view, setView] = React.useState<string | null>('list');
    return (
      <div style={{ display: 'grid', gap: 20, maxWidth: 560 }}>
        <SegmentedControl value={view} onChange={setView} ariaLabel="Vista">
          {VIEWS.map((v) => (
            <SegmentedControlItem key={v.value} value={v.value} icon={v.icon}>{v.label}</SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl value={view} onChange={setView} ariaLabel="Vista (compacta)">
          {VIEWS.map((v) => (
            <SegmentedControlItem key={v.value} value={v.value} icon={v.icon} aria-label={v.label} />
          ))}
        </SegmentedControl>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Vista actual: {view}</p>
      </div>
    );
  },
};
