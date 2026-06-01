import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Display2';
import { Popover } from './Popover';
import { AppShell } from './AppShell';
import { NavigationMenu } from './NavigationMenu';
import { Menubar } from './Menubar';
import { DatePicker } from './Pickers';
import { DateRangePicker } from './AdvancedPickers';

export default {
  title: 'Internal/Regression/Floating in overflow',
  tags: ['autodocs'],
} as Meta;

const scroller: React.CSSProperties = {
  height: 160,
  overflow: 'auto',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  padding: 16,
  background: 'var(--bg-surface)',
};

/**
 * Bug 1: a Menu inside an `overflow: auto` container (think DataTable in a
 * Card). The panel must NOT be clipped — it is portaled to <body> and
 * repositions on scroll. Scroll the box with the menu open.
 */
export const MenuInsideOverflow: StoryObj = {
  render: () => (
    <div style={scroller}>
      <div style={{ height: 320, paddingTop: 24 }}>
        <Menu
          trigger={<button className="btn btn--secondary">Acciones ▾</button>}
          items={[
            { label: 'Editar' },
            { label: 'Duplicar' },
            { type: 'separator' },
            { label: 'Eliminar', destructive: true },
          ]}
        />
      </div>
    </div>
  ),
};

export const PopoverInsideOverflow: StoryObj = {
  render: () => (
    <div style={scroller}>
      <div style={{ height: 320, paddingTop: 24 }}>
        <Popover
          trigger={<button className="btn btn--secondary">Detalles</button>}
          placement="bottom"
        >
          <div style={{ padding: 12, maxWidth: 220 }}>
            El panel se renderiza en el body: no lo recorta el contenedor con
            overflow y se reubica al hacer scroll.
          </div>
        </Popover>
      </div>
    </div>
  ),
};

/**
 * v1.2.0: NavigationMenu mega-panel inside an overflow container — portaled
 * to <body>, repositions on scroll, full keyboard nav (ArrowDown opens,
 * arrows move, Escape closes to trigger).
 */
export const NavigationMenuInsideOverflow: StoryObj = {
  render: () => (
    <div style={scroller}>
      <div style={{ height: 320 }}>
        <NavigationMenu
          items={[
            { id: 'home', label: 'Inicio', href: '#' },
            {
              id: 'cat',
              label: 'Catálogo',
              featured: { id: 'f', label: 'Novedades', description: 'Lo último de la temporada' },
              links: [
                { id: 'a', label: 'Herramientas', href: '#', description: 'Manuales y eléctricas' },
                { id: 'b', label: 'Fijaciones', href: '#' },
                { id: 'c', label: 'Pinturas', href: '#' },
              ],
            },
          ]}
        />
      </div>
    </div>
  ),
};

export const MenubarInsideOverflow: StoryObj = {
  render: () => (
    <div style={scroller}>
      <div style={{ height: 320 }}>
        <Menubar
          menus={[
            { id: 'file', label: 'Archivo', items: [
              { id: 'n', label: 'Nuevo', shortcut: '⌘N' },
              { id: 'o', label: 'Abrir', shortcut: '⌘O' },
              { id: 's1', separator: true },
              { id: 'q', label: 'Salir' },
            ] },
            { id: 'edit', label: 'Editar', items: [
              { id: 'u', label: 'Deshacer', shortcut: '⌘Z' },
              { id: 'r', label: 'Rehacer', shortcut: '⇧⌘Z' },
            ] },
          ]}
        />
      </div>
    </div>
  ),
};

export const DatePickerInsideOverflow: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<Date | null>(null);
    return (
      <div style={scroller}>
        <div style={{ height: 320 }}>
          <DatePicker value={v} onChange={setV} />
        </div>
      </div>
    );
  },
};

export const DateRangePickerInsideOverflow: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
    return (
      <div style={scroller}>
        <div style={{ height: 320 }}>
          <DateRangePicker value={v} onChange={setV} />
        </div>
      </div>
    );
  },
};

/**
 * Bug 2 (legacy): collapsed AppShell. Pre-1.31 the `side` layout exposed a
 * brand block + a built-in collapse chevron — both removed in 1.31 (the
 * kit is now top-only). The original story documented the 72px rail
 * behaviour for those slots; with side gone, the equivalent now lives in
 * `headerLayout="top"` with `collapsedRail=true` (see the AppShell
 * stories). This story stays as a reference test of the brand header band
 * + collapsed rail rendering through a portal overflow.
 */
export const AppShellCollapsed: StoryObj = {
  render: () => (
    <div style={{ height: 420, border: '1px solid var(--border-default)' }}>
      <AppShell
        theme="brand"
        defaultCollapsed
        collapsedRail
        footer={<span style={{ fontSize: 12 }}>v1.1.0 · soporte</span>}
        header={{ center: <span>FERRETERÍA EL ALBA</span> }}
        sections={[
          { items: [
            { id: 'h', label: 'Inicio', href: '#', active: true },
            { id: 'p', label: 'Productos', href: '#' },
          ] },
        ]}
      >
        <div style={{ padding: 24 }}>Contenido</div>
      </AppShell>
    </div>
  ),
};
