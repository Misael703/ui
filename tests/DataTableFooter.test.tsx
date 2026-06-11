import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DataTable, type Column } from '../src/components/DataTable';

const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

interface Row { id: string; name: string; amount: number }
const ROWS: Row[] = [
  { id: '1', name: 'Martillo', amount: 5000 },
  { id: '2', name: 'Taladro', amount: 45000 },
];
const COLS: Column<Row>[] = [
  { key: 'name', header: 'Producto', footer: 'Total' },
  { key: 'amount', header: 'Monto', numeric: true, footer: '$50.000' },
];

describe('DataTable Column.footer (tfoot de agregados)', () => {
  it('renderiza tfoot cuando alguna columna define footer', () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    const tfoot = container.querySelector('tfoot');
    expect(tfoot).not.toBeNull();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$50.000')).toBeInTheDocument();
  });

  it('sin footer en ninguna columna NO hay tfoot (no breaking)', () => {
    const cols: Column<Row>[] = [
      { key: 'name', header: 'Producto' },
      { key: 'amount', header: 'Monto', numeric: true },
    ];
    const { container } = render(<DataTable columns={cols} rows={ROWS} rowKey={(r) => r.id} />);
    expect(container.querySelector('tfoot')).toBeNull();
  });

  it('celda numérica del footer hereda table__num y alineación derecha', () => {
    const { container } = render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    const tds = container.querySelectorAll('tfoot td');
    expect(tds[1].className).toContain('table__num');
    expect(tds[1].className).toContain('table__align-right');
  });

  it('con selectable agrega la celda líder vacía (geometría de columnas)', () => {
    const { container } = render(
      <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} selectable selectedKeys={new Set()} onSelectionChange={() => {}} />
    );
    expect(container.querySelectorAll('tfoot td')).toHaveLength(3);
  });

  it('NO renderiza tfoot en estados error / loading / empty', () => {
    const base = { columns: COLS, rowKey: (r: Row) => r.id };
    const { container: cErr } = render(<DataTable {...base} rows={ROWS} error="Falló" />);
    expect(cErr.querySelector('tfoot')).toBeNull();
    const { container: cLoad } = render(<DataTable {...base} rows={ROWS} loading />);
    expect(cLoad.querySelector('tfoot')).toBeNull();
    const { container: cEmpty } = render(<DataTable {...base} rows={[]} />);
    expect(cEmpty.querySelector('tfoot')).toBeNull();
  });

  it('CSS: banda gris con separador inset (no border-top, por sticky)', () => {
    const block = css.match(/\.data-table tfoot td\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(block).toMatch(/background:\s*var\(--bg-subtle\)/);
    expect(block).toMatch(/box-shadow:\s*inset 0 1px 0 var\(--border-default\)/);
    expect(block).not.toMatch(/border-top/);
  });

  it('CSS: sticky bottom solo en modo bounded (--scroll)', () => {
    const sticky = css.match(/\.table-wrap--scroll \.data-table tfoot td\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(sticky).toMatch(/position:\s*sticky/);
    expect(sticky).toMatch(/bottom:\s*0/);
  });

  it('CSS: oculto en mobile cards (sin geometría de columnas)', () => {
    expect(css).toMatch(/\.table-wrap--cards \.table tfoot\s*\{\s*display:\s*none/);
  });
});
