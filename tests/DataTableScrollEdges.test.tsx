import * as React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataTable, type Column } from '../src/components/DataTable';

/**
 * Scroll-edge hints (v3.2.0). The pre-3.2.0 "scroll shadows" were pure CSS
 * (background-attachment: local on `.table-wrap`), which only works when the
 * wrap ITSELF scrolls. In bounded (`maxHeight` / `fillHeight`) and overlay
 * modes the scroll lives in `.table-wrap__scroll`, so the masks never moved
 * and the shadow never showed — a 16-column report gave no hint that nine
 * columns were hidden to the right. The hint is now state: the real scroller
 * is measured (scroll + resize) and the wrap gets `has-more-{left,right,down}`
 * classes that CSS paints as edge shadows. These tests pin the toggling,
 * which IS the bug: jsdom does no layout, so the scroll metrics are mocked on
 * the scroller element and a `scroll` event triggers the re-measure.
 */

interface Row { id: string; name: string }
const rows: Row[] = Array.from({ length: 5 }, (_, i) => ({ id: String(i), name: `Fila ${i}` }));
const cols: Column<Row>[] = [{ key: 'name', header: 'Nombre' }];

interface Metrics {
  scrollWidth?: number; clientWidth?: number; scrollLeft?: number;
  scrollHeight?: number; clientHeight?: number; scrollTop?: number;
}
function setMetrics(el: HTMLElement, m: Metrics) {
  for (const [k, v] of Object.entries(m)) {
    Object.defineProperty(el, k, { configurable: true, writable: true, value: v });
  }
}

beforeAll(() => {
  // jsdom ships no ResizeObserver; the hook must degrade to scroll-only.
  if (typeof ResizeObserver === 'undefined') {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {} unobserve() {} disconnect() {}
    };
  }
});
afterEach(() => vi.restoreAllMocks());

function renderBounded(extra: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  const utils = render(
    <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} maxHeight={200} {...extra} />
  );
  const wrap = utils.container.querySelector('.table-wrap') as HTMLElement;
  const scroller = utils.container.querySelector('.table-wrap__scroll') as HTMLElement;
  return { ...utils, wrap, scroller };
}

describe('DataTable scroll-edge hints', () => {
  it('no hint classes when nothing overflows', () => {
    const { wrap, scroller } = renderBounded();
    setMetrics(scroller, { scrollWidth: 500, clientWidth: 500, scrollHeight: 200, clientHeight: 200 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap.className).not.toMatch(/has-more-/);
  });

  it('bounded mode: right hint at scroll start, left hint once scrolled, both in the middle', () => {
    const { wrap, scroller } = renderBounded();
    setMetrics(scroller, { scrollWidth: 1600, clientWidth: 800, scrollLeft: 0, scrollHeight: 200, clientHeight: 200 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).toHaveClass('has-more-right');
    expect(wrap).not.toHaveClass('has-more-left');

    setMetrics(scroller, { scrollLeft: 400 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).toHaveClass('has-more-right');
    expect(wrap).toHaveClass('has-more-left');

    setMetrics(scroller, { scrollLeft: 800 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).toHaveClass('has-more-left');
    expect(wrap).not.toHaveClass('has-more-right');
  });

  it('bounded mode: bottom hint while rows remain below the box, gone at the end', () => {
    const { wrap, scroller } = renderBounded();
    setMetrics(scroller, { scrollWidth: 500, clientWidth: 500, scrollHeight: 1000, clientHeight: 200, scrollTop: 0 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).toHaveClass('has-more-down');

    setMetrics(scroller, { scrollTop: 800 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).not.toHaveClass('has-more-down');
  });

  it('sub-pixel remainder does not keep the hint on (1px tolerance)', () => {
    const { wrap, scroller } = renderBounded();
    setMetrics(scroller, { scrollWidth: 1600, clientWidth: 800, scrollLeft: 799.5, scrollHeight: 200, clientHeight: 200 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).not.toHaveClass('has-more-right');
  });

  it('unbounded mode: the wrap itself is the horizontal scroller and still gets the hints', () => {
    const { container } = render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
    const wrap = container.querySelector('.table-wrap') as HTMLElement;
    expect(container.querySelector('.table-wrap__scroll')).toBeNull();
    setMetrics(wrap, { scrollWidth: 1600, clientWidth: 800, scrollLeft: 0, scrollHeight: 300, clientHeight: 300 });
    act(() => { fireEvent.scroll(wrap); });
    expect(wrap).toHaveClass('has-more-right');
  });

  it('overlay mode (empty rows): the inner scroll div is measured', () => {
    const { container } = render(<DataTable columns={cols} rows={[]} rowKey={(r) => r.id} empty="Nada" />);
    const wrap = container.querySelector('.table-wrap') as HTMLElement;
    const scroller = container.querySelector('.table-wrap__scroll') as HTMLElement;
    setMetrics(scroller, { scrollWidth: 1600, clientWidth: 800, scrollLeft: 0, scrollHeight: 50, clientHeight: 50 });
    act(() => { fireEvent.scroll(scroller); });
    expect(wrap).toHaveClass('has-more-right');
  });
});
