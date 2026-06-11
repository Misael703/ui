import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataTable, type Column } from '../src/components/DataTable';
import { useVirtualRows } from '../src/hooks/useVirtualRows';

interface Row { id: string; name: string }
const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: String(i), name: `Fila ${i}` }));
const COLS: Column<Row>[] = [{ key: 'name', header: 'Nombre' }];

// jsdom no hace layout: clientHeight se mockea en el prototipo para que el
// hook "vea" un viewport. scrollTop sí es asignable en jsdom.
const mockClientHeight = (px: number) => {
  const spy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(px);
  return () => spy.mockRestore();
};

describe('useVirtualRows (hook)', () => {
  function Harness({ count, rowHeight, overscan }: { count: number; rowHeight: number; overscan?: number }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const v = useVirtualRows(ref, { count, rowHeight, overscan });
    return (
      <div ref={ref} data-testid="scroller">
        <output data-testid="range">{JSON.stringify(v)}</output>
      </div>
    );
  }
  const read = (el: HTMLElement) => JSON.parse(el.querySelector('output')!.textContent!);

  it('ventana inicial: desde 0, viewport + overscan, padding inferior exacto', () => {
    const restore = mockClientHeight(320); // 10 filas de 32px
    const { getByTestId } = render(<Harness count={1000} rowHeight={32} overscan={5} />);
    const v = read(getByTestId('scroller'));
    expect(v.start).toBe(0);
    expect(v.end).toBe(15); // 10 visibles + 5 overscan
    expect(v.padTop).toBe(0);
    expect(v.padBottom).toBe((1000 - 15) * 32);
    restore();
  });

  it('al scrollear, la ventana sigue al viewport con overscan simétrico', () => {
    const restore = mockClientHeight(320);
    const { getByTestId } = render(<Harness count={1000} rowHeight={32} overscan={5} />);
    const scroller = getByTestId('scroller');
    act(() => {
      scroller.scrollTop = 32 * 500; // fila 500 arriba
      fireEvent.scroll(scroller);
    });
    const v = read(getByTestId('scroller'));
    expect(v.start).toBe(495);       // 500 - overscan
    expect(v.end).toBe(515);         // 500 + 10 visibles + 5 overscan
    expect(v.padTop).toBe(495 * 32);
    expect(v.padBottom).toBe((1000 - 515) * 32);
    restore();
  });

  it('el final del dataset clampa la ventana', () => {
    const restore = mockClientHeight(320);
    const { getByTestId } = render(<Harness count={100} rowHeight={32} overscan={5} />);
    const scroller = getByTestId('scroller');
    act(() => {
      scroller.scrollTop = 32 * 95;
      fireEvent.scroll(scroller);
    });
    const v = read(getByTestId('scroller'));
    expect(v.end).toBe(100);
    expect(v.padBottom).toBe(0);
    restore();
  });

  it('enabled=false: rango completo sin padding (camino de render uniforme)', () => {
    function Off() {
      const ref = React.useRef<HTMLDivElement>(null);
      const v = useVirtualRows(ref, { count: 500, rowHeight: 32, enabled: false });
      return <output>{JSON.stringify(v)}</output>;
    }
    const { container } = render(<Off />);
    expect(JSON.parse(container.querySelector('output')!.textContent!)).toEqual({
      start: 0, end: 500, padTop: 0, padBottom: 0,
    });
  });
});

describe('DataTable virtualizeRows (integración)', () => {
  it('renderiza una fracción del dataset con spacers pixel-exactos', () => {
    const restore = mockClientHeight(320);
    const { container } = render(
      <DataTable
        columns={COLS}
        rows={makeRows(5000)}
        rowKey={(r) => r.id}
        maxHeight={320}
        virtualizeRows={{ rowHeight: 32, overscan: 5 }}
      />
    );
    const dataRows = container.querySelectorAll('tbody tr:not(.data-table__spacer)');
    expect(dataRows.length).toBeLessThan(50);
    const spacer = container.querySelector('.data-table__spacer td') as HTMLElement;
    expect(spacer).not.toBeNull();
    expect(container.querySelector('table')).toHaveAttribute('aria-rowcount', '5001');
    restore();
  });

  it('select-all opera sobre el dataset COMPLETO, no la ventana', () => {
    const restore = mockClientHeight(320);
    const onSelectionChange = vi.fn();
    const { container } = render(
      <DataTable
        columns={COLS}
        rows={makeRows(5000)}
        rowKey={(r) => r.id}
        maxHeight={320}
        virtualizeRows={{ rowHeight: 32 }}
        selectable
        selectedKeys={new Set()}
        onSelectionChange={onSelectionChange}
      />
    );
    fireEvent.click(container.querySelector('thead input[type="checkbox"]')!);
    expect(onSelectionChange.mock.calls[0][0].size).toBe(5000);
    restore();
  });

  it('sin maxHeight la virtualización se desactiva (render completo)', () => {
    const restore = mockClientHeight(320);
    const { container } = render(
      <DataTable columns={COLS} rows={makeRows(200)} rowKey={(r) => r.id} virtualizeRows={{ rowHeight: 32 }} />
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(200);
    expect(container.querySelector('.data-table__spacer')).toBeNull();
    restore();
  });

  it('renderExpanded desactiva la virtualización (alturas no uniformes)', () => {
    const restore = mockClientHeight(320);
    const { container } = render(
      <DataTable
        columns={COLS}
        rows={makeRows(200)}
        rowKey={(r) => r.id}
        maxHeight={320}
        virtualizeRows={{ rowHeight: 32 }}
        renderExpanded={() => <div>detalle</div>}
        expandedKeys={new Set()}
        onExpandedChange={() => {}}
      />
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(200);
    restore();
  });

  it('mobileLayout="cards" desactiva la virtualización', () => {
    const restore = mockClientHeight(320);
    const { container } = render(
      <DataTable
        columns={COLS}
        rows={makeRows(200)}
        rowKey={(r) => r.id}
        maxHeight={320}
        virtualizeRows={{ rowHeight: 32 }}
        mobileLayout="cards"
      />
    );
    expect(container.querySelectorAll('tbody tr')).toHaveLength(200);
    restore();
  });
});
