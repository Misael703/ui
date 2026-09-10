import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField } from '../src/components/Filters';
import { Combobox, DatePicker } from '../src/components/Pickers';
import { DateRangePicker } from '../src/components/AdvancedPickers';
import { Select } from '../src/components/Form';

describe('FilterPanel', () => {
  it('shows count badge and clear button when active', () => {
    const onClearAll = vi.fn();
    render(<FilterPanel activeCount={3} onClearAll={onClearAll}>filtros aquí</FilterPanel>);
    expect(screen.getByText('3')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Limpiar'));
    expect(onClearAll).toHaveBeenCalled();
  });

  it('hides clear button when count is 0', () => {
    render(<FilterPanel activeCount={0} onClearAll={() => {}}>x</FilterPanel>);
    expect(screen.queryByText('Limpiar')).toBeNull();
  });
});

describe('FilterSection', () => {
  it('toggles open/close', () => {
    render(<FilterSection title="Estado">contenido</FilterSection>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Estado'));
    expect(screen.queryByText('contenido')).toBeNull();
  });
});

describe('BulkActionBar', () => {
  it('does not render when selectedCount is 0', () => {
    const { container } = render(<BulkActionBar selectedCount={0}>x</BulkActionBar>);
    expect(container.firstChild).toBeNull();
  });

  it('renders count and actions', () => {
    render(<BulkActionBar selectedCount={5}><button>Eliminar</button></BulkActionBar>);
    expect(screen.getByText(/5 seleccionados/)).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('uses singular for selectedCount=1', () => {
    render(<BulkActionBar selectedCount={1}>x</BulkActionBar>);
    expect(screen.getByText(/1 seleccionado$/)).toBeInTheDocument();
  });

  it('triggers onClear', () => {
    const onClear = vi.fn();
    render(<BulkActionBar selectedCount={2} onClear={onClear}>x</BulkActionBar>);
    fireEvent.click(screen.getByLabelText('Deseleccionar todo'));
    expect(onClear).toHaveBeenCalled();
  });
});

describe('SortDropdown', () => {
  it('changes value on select', () => {
    const onChange = vi.fn();
    render(
      <SortDropdown
        value="recent"
        onChange={onChange}
        options={[
          { value: 'recent', label: 'Recientes' },
          { value: 'old', label: 'Antiguos' },
        ]}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'old' } });
    expect(onChange).toHaveBeenCalledWith('old');
  });
});

describe('FilterField', () => {
  it('wires the label to the control so it is reachable by accessible name', () => {
    render(
      <FilterField label="Camión">
        <input type="text" />
      </FilterField>
    );
    // The real a11y guarantee: getByLabelText resolves the control.
    expect(screen.getByLabelText('Camión')).toBe(screen.getByRole('textbox'));
  });

  it('respects a consumer-set id instead of overwriting it', () => {
    render(
      <FilterField label="Chofer">
        <input type="text" id="mine" />
      </FilterField>
    );
    const input = screen.getByRole('textbox');
    expect(input.id).toBe('mine');
    expect(screen.getByText('Chofer')).toHaveAttribute('for', 'mine');
  });
});

describe('FilterBar', () => {
  it('applies the kit-owned dense register and grids the fields', () => {
    const { container } = render(
      <FilterBar>
        <FilterField label="Estado"><input /></FilterField>
      </FilterBar>
    );
    const bar = container.querySelector('.filter-bar');
    expect(bar).toHaveClass('fields--dense');
    expect(container.querySelector('.filter-bar__fields .filter-field')).toBeInTheDocument();
  });

  // `summary` (v3.7.0): the result count is not an action. Consumers used to
  // park it in a separate toolbar row, orphaned from the filters; the rule is
  // "a datum lives next to what produces it", so the count sits in the bar,
  // right-aligned, at the fields' baseline — even when the fields grid wraps.
  it('renders the summary only when provided, grouped with the actions in one trailing item after the fields', () => {
    const { container, rerender } = render(
      <FilterBar summary="12 órdenes" actions={<button type="button">Limpiar</button>}>
        <FilterField label="Estado"><input /></FilterField>
      </FilterBar>
    );
    const bar = container.querySelector('.filter-bar')!;
    expect([...bar.children].map((c) => c.className)).toEqual(['filter-bar__fields', 'filter-bar__end']);
    const end = bar.querySelector('.filter-bar__end')!;
    // Summary before actions inside the group: readout, then what acts on it.
    expect([...end.children].map((c) => c.className)).toEqual(['filter-bar__summary', 'filter-bar__actions']);
    expect(end.querySelector('.filter-bar__summary')).toHaveTextContent('12 órdenes');
    rerender(<FilterBar><FilterField label="Estado"><input /></FilterField></FilterBar>);
    expect(container.querySelector('.filter-bar__summary')).toBeNull();
    // No summary and no actions → no empty trailing group either.
    expect(container.querySelector('.filter-bar__end')).toBeNull();
  });
  it('CSS: the trailing group is pushed to the end of the row and the summary centres on the dense control height', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const end = css.match(/\.filter-bar__end\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(end).toMatch(/margin-left:\s*auto/);
    const rule = css.match(/\.filter-bar__summary\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/min-height:\s*var\(--field-min-h/);
    // Inside a DataTable `toolbar` slot the bar gets its own padding (the slot
    // has none; TableToolbar brings its own).
    expect(css).toMatch(/\.table-surface__bar\s*>\s*\.filter-bar\s*\{[^}]*padding/);
  });
  it('renders the actions slot only when provided', () => {
    const { container, rerender } = render(
      <FilterBar><span>f</span></FilterBar>
    );
    expect(container.querySelector('.filter-bar__actions')).toBeNull();
    rerender(
      <FilterBar actions={<button>Limpiar</button>}><span>f</span></FilterBar>
    );
    expect(screen.getByText('Limpiar').closest('.filter-bar__actions')).toBeInTheDocument();
  });

  it('switches to fixed columns when `columns` is set', () => {
    const { container } = render(
      <FilterBar columns={4}><span>f</span></FilterBar>
    );
    const bar = container.querySelector('.filter-bar') as HTMLElement;
    expect(bar).toHaveClass('filter-bar--fixed-cols');
    expect(bar.style.getPropertyValue('--filter-cols')).toBe('4');
  });
});

/**
 * FilterField injects an id into its child via cloneElement and points the
 * <label for> at it. That only names the control if the child forwards the id
 * to its FOCUSABLE element (input / button). A composite picker that drops it
 * leaves the label pointing at nothing — a filter with no accessible name.
 * Pinned for every control the list-page recipe puts in a filter cell.
 */
describe('FilterField names composite controls (label → focusable element)', () => {
  it('Select', () => {
    render(<FilterField label="Estado"><Select defaultValue="a"><option value="a">A</option></Select></FilterField>);
    expect(screen.getByLabelText('Estado').tagName).toBe('SELECT');
  });
  it('Combobox', () => {
    render(<FilterField label="Vendedor"><Combobox value={null} onChange={() => {}} options={[{ value: 'a', label: 'A' }]} /></FilterField>);
    const el = screen.getByLabelText('Vendedor');
    expect(['INPUT', 'BUTTON']).toContain(el.tagName);
  });
  it('DatePicker', () => {
    render(<FilterField label="Fecha"><DatePicker value={null} onChange={() => {}} /></FilterField>);
    expect(screen.getByLabelText('Fecha').tagName).toBe('INPUT');
  });
  it('DateRangePicker', () => {
    render(<FilterField label="Periodo"><DateRangePicker onApply={() => {}} /></FilterField>);
    const el = screen.getByLabelText('Periodo');
    expect(['INPUT', 'BUTTON']).toContain(el.tagName);
  });
});

describe('FilterBar summary is a status message (v3.7.0)', () => {
  it('announces politely: role="status" on the summary', () => {
    const { container } = render(<FilterBar summary="12 pedidos"><span>f</span></FilterBar>);
    const s = container.querySelector('.filter-bar__summary')!;
    expect(s).toHaveAttribute('role', 'status');
    expect(s).toHaveTextContent('12 pedidos');
  });
});

/**
 * v3.7.0 — two layout behaviours of the bar with MANY fields:
 *  1. Rows fill. The fields box is a flex-wrap row (not an equal-column grid),
 *     so a wrapped second line of two fields stretches across the bar instead
 *     of leaving three empty grid cells. `columns` keeps the deterministic grid.
 *  2. `visibleCount` collapses the rest behind a "Más filtros" toggle.
 */
describe('FilterBar fills rows and collapses extra fields', () => {
  const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  it('CSS: fields join the bar\'s flex-wrap flow (display: contents) and grow from the column minimum', () => {
    const fields = css.match(/(^|\})\s*\.filter-bar__fields\s*\{([^}]*)\}/)?.[2] ?? '';
    expect(fields).toMatch(/display:\s*contents/);
    const bar = css.match(/(^|\})\s*\.filter-bar\s*\{([^}]*)\}/)?.[2] ?? '';
    expect(bar).toMatch(/flex-wrap:\s*wrap/);
    const field = css.match(/(^|\})\s*\.filter-field\s*\{([^}]*)\}/)?.[2] ?? '';
    expect(field).toMatch(/flex:\s*1 1 var\(--filter-col-min/);
    // fixed `columns` mode stays a grid
    expect(css).toMatch(/\.filter-bar--fixed-cols\s+\.filter-bar__fields\s*\{[^}]*display:\s*grid/);
  });
  const four = [
    <FilterField key="a" label="A"><input /></FilterField>,
    <FilterField key="b" label="B"><input /></FilterField>,
    <FilterField key="c" label="C"><input /></FilterField>,
    <FilterField key="d" label="D"><input /></FilterField>,
  ];
  // jsdom lays nothing out: fake the bar's inner width (clientWidth) and the
  // trailing group's width (offsetWidth). Capacity = floor((bar − end + gap) / (160 + gap)), gap 16.
  const widths = (bar: number, end = 0) => {
    const cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    const ow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return (this as HTMLElement).classList.contains('filter-bar') ? bar : 0; } });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { return (this as HTMLElement).classList.contains('filter-bar__end') ? end : 0; } });
    return () => { if (cw) Object.defineProperty(HTMLElement.prototype, 'clientWidth', cw); if (ow) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', ow); };
  };
  it('layout="inline": every field renders and there is no toggle', () => {
    const { container } = render(<FilterBar layout="inline">{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(container.querySelector('.filter-bar__toggle')).toBeNull();
    expect(container.querySelector('.filter-bar')).toHaveAttribute('data-layout', 'inline');
  });
  it('the default layout is collapse (v4.0.0): the trailing group shares the line; a set that fits still shows whole', () => {
    const restore = widths(1200, 120);
    const { container } = render(<FilterBar>{four}</FilterBar>);
    expect(container.querySelector('.filter-bar')).toHaveAttribute('data-layout', 'collapse');
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(container.querySelector('.filter-bar__toggle')).toBeNull();
    restore();
  });
  it('collapse only folds when the set does NOT fit one line: 1200px fits four fields → all shown, no toggle', () => {
    const restore = widths(1200, 120);
    const { container } = render(<FilterBar layout="collapse" visibleCount={2}>{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(container.querySelector('.filter-bar__toggle')).toBeNull();
    restore();
  });
  it('collapse with a number: 640px holds three, the cap of 2 wins → first 2, toggle expands and collapses (aria-expanded)', () => {
    const restore = widths(640, 120);
    const { container } = render(<FilterBar layout="collapse" visibleCount={2}>{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(2);
    const toggle = container.querySelector('.filter-bar__toggle') as HTMLButtonElement;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('Más filtros');
    fireEvent.click(toggle);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Menos filtros');
    fireEvent.click(toggle);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(2);
    restore();
  });
  it('collapse "auto" (default): shows as many as fit next to the trailing group — 640px → 3 of 4', () => {
    const restore = widths(640, 120);
    const { container } = render(<FilterBar layout="collapse">{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(3);
    expect(container.querySelector('.filter-bar__toggle')).not.toBeNull();
    restore();
  });
  it('collapse "auto" floors at two fields even when only one fits — 360px → 2 of 4', () => {
    const restore = widths(360, 200);
    const { container } = render(<FilterBar layout="collapse">{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(2);
    restore();
  });
  it('re-measures on resize: the ResizeObserver callback re-derives the visible count', () => {
    let cb: (() => void) | null = null;
    const RO = class { constructor(fn: () => void) { cb = fn; } observe() {} disconnect() {} };
    const prev = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = RO;
    let restore = widths(640, 120);
    const { container } = render(<FilterBar layout="collapse">{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(3);
    restore();
    restore = widths(1200, 120);
    act(() => { cb?.(); });
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(container.querySelector('.filter-bar__toggle')).toBeNull();
    restore();
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = prev;
  });
  it('unmeasured (server / first paint): everything shows, nothing folds', () => {
    const { container } = render(<FilterBar layout="collapse" visibleCount={2}>{four}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(4);
    expect(container.querySelector('.filter-bar__toggle')).toBeNull();
  });
  it('3.7.0 compat: visibleCount alone means layout="collapse"; hiddenActiveCount still badges the toggle', () => {
    const restore = widths(640, 120);
    const { container } = render(<FilterBar visibleCount={2} hiddenActiveCount={2}>{four}</FilterBar>);
    expect(container.querySelector('.filter-bar')).toHaveAttribute('data-layout', 'collapse');
    expect(container.querySelector('.filter-bar__toggle')).toHaveTextContent('2');
    restore();
  });
  it('the toggle badge derives from `applied`: only chips whose key is hidden count', () => {
    const restore = widths(640, 120);
    const applied = [{ key: 'a', label: 'A', value: '1' }, { key: 'c', label: 'C', value: '3' }, { key: 'd', label: 'D', value: '4' }];
    const { container } = render(<FilterBar layout="collapse" visibleCount={2} applied={applied}>{four}</FilterBar>);
    expect(container.querySelector('.filter-bar__toggle')).toHaveTextContent('2');
    restore();
  });
});

describe('FilterBar applied chips (v3.8.0)', () => {
  it('renders one removable chip per applied filter ("Label: value ×"), full-width under the fields', () => {
    const onRemove = vi.fn();
    const applied = [{ key: 'a', label: 'Estado', value: 'Pendiente', onRemove }, { key: 'b', label: 'Zona', value: 'Norte' }];
    const { container } = render(<FilterBar applied={applied}><FilterField key="a" label="Estado"><input /></FilterField></FilterBar>);
    const row = container.querySelector('.filter-bar__applied') as HTMLElement;
    expect(row).toHaveAttribute('aria-label', 'Filtros aplicados');
    const chips = row.querySelectorAll('.chip');
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent('Estado: Pendiente');
    fireEvent.click(chips[0].querySelector('button')!);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(chips[1].querySelector('button')).toBeNull();
  });
  it('onClearAll: a "Limpiar" at the end of the chips (only while something is applied) and in the drawer footer', () => {
    const onClearAll = vi.fn();
    const applied = [{ key: 'a', label: 'Estado', value: 'Pendiente' }];
    const { container, unmount } = render(<FilterBar applied={applied} onClearAll={onClearAll}><div /></FilterBar>);
    const clear = container.querySelector('.filter-bar__applied .filter-bar__clear') as HTMLButtonElement;
    expect(clear).toHaveTextContent('Limpiar');
    fireEvent.click(clear);
    expect(onClearAll).toHaveBeenCalledTimes(1);
    unmount();
    const r = render(<FilterBar applied={[]} onClearAll={onClearAll}><div /></FilterBar>);
    expect(r.container.querySelector('.filter-bar__clear')).toBeNull();
  });
  it('no chips row when nothing is applied', () => {
    const { container } = render(<FilterBar applied={[]}><div /></FilterBar>);
    expect(container.querySelector('.filter-bar__applied')).toBeNull();
  });
  it('CSS: the chips row takes the full width and wraps', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8');
    expect(css).toMatch(/\.filter-bar__applied \{[^}]*flex:\s*1 1 100%/);
    // micro register: the chips are a readout, smaller than the controls
    expect(css).toMatch(/\.filter-bar__applied \.chip \{[^}]*font-size:\s*var\(--text-xs\)/);
  });
});

describe('FilterBar layout="drawer" on a desk (v3.8.0)', () => {
  const stubMedia = (matches: boolean) => Object.defineProperty(window, 'matchMedia', {
    configurable: true, writable: true,
    value: (media: string) => ({ matches, media, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }),
  });
  it('pinned fields stay in the bar; the rest open behind the funnel, badged from `applied`', () => {
    stubMedia(false);
    const { container, baseElement } = render(
      <FilterBar layout="drawer" applied={[{ key: 'b', label: 'Zona', value: 'Norte' }]} onClearAll={() => {}} pinned={<FilterField key="q" label="Buscar"><input /></FilterField>}>
        <FilterField key="a" label="Estado"><input /></FilterField>
        <FilterField key="b" label="Zona"><input /></FilterField>
      </FilterBar>
    );
    expect(container.querySelectorAll('.filter-bar__pinned .filter-field')).toHaveLength(1);
    expect(container.querySelectorAll('.filter-bar > .filter-bar__fields:not(.filter-bar__pinned)')).toHaveLength(0);
    // the funnel sits in the trailing group with the other actions (right side)
    const btn = container.querySelector('.filter-bar__end .filter-bar__actions .filter-bar__drawer-toggle button') as HTMLButtonElement;
    expect(btn).toHaveAttribute('aria-label', 'Filtros (1)');
    fireEvent.click(btn);
    expect(baseElement.querySelector('.drawer')!.querySelectorAll('.filter-field')).toHaveLength(2);
    expect(container.querySelector('.filter-bar__applied')).toHaveTextContent('Zona: Norte');
    // the drawer footer carries Limpiar next to Listo
    const footerBtns = [...baseElement.querySelectorAll('.drawer__footer button')].map((b) => b.textContent?.trim());
    expect(footerBtns).toEqual(['Limpiar', 'Listo']);
  });
  it('warns once when drawer hides the state with no `applied`', () => {
    stubMedia(false);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<FilterBar layout="drawer"><div /></FilterBar>);
    render(<FilterBar layout="drawer"><div /></FilterBar>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/applied/);
    warn.mockRestore();
  });
});

describe('FilterBar mobile mode', () => {
  const stubMedia = (matches: boolean) => {
    const listeners = new Set<() => void>();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true, writable: true,
      value: (query: string) => ({
        matches, media: query, onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
        addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
      }),
    });
  };
  const fields = [
    <FilterField key="a" label="Estado"><input /></FilterField>,
    <FilterField key="b" label="Zona"><input /></FilterField>,
  ];
  it('wide viewport: inline fields, no mobile toggle', () => {
    stubMedia(false);
    const { container } = render(<FilterBar summary="3">{fields}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(2);
    expect(container.querySelector('.filter-bar__drawer-toggle')).toBeNull();
  });
  it('narrow viewport: a badged "Filtros" button replaces the fields and opens a Drawer with them', () => {
    stubMedia(true);
    const { container, baseElement } = render(<FilterBar summary="3" activeCount={2} actions={<button type="button">Limpiar</button>}>{fields}</FilterBar>);
    expect(container.querySelectorAll('.filter-bar .filter-field')).toHaveLength(0);
    // v3.7.0: a tertiary icon button (funnel) named "Filtros"; the applied
    // count overhangs it as a badge (aria-hidden) and is folded into the name.
    const wrap = container.querySelector('.filter-bar__drawer-toggle') as HTMLElement;
    const toggle = wrap.querySelector('button') as HTMLButtonElement;
    expect(toggle).toHaveAttribute('aria-label', 'Filtros (2)');
    expect(toggle.querySelector('svg')).not.toBeNull();
    expect(toggle.textContent).toBe('');
    expect(wrap.querySelector('.filter-bar__toggle-badge')).toHaveTextContent('2');
    // summary and actions stay in the bar
    expect(container.querySelector('.filter-bar__summary')).toHaveTextContent('3');
    expect(screen.getByText('Limpiar')).toBeInTheDocument();
    fireEvent.click(toggle);
    const drawer = baseElement.querySelector('.drawer');
    expect(drawer).not.toBeNull();
    expect(drawer!.querySelectorAll('.filter-field')).toHaveLength(2);
    expect(screen.getByLabelText('Zona')).toBeInTheDocument();
  });
  it('mobileLayout="inline" keeps the fields inline on a narrow viewport (and the 3.7.0 `mobile` prop still maps)', () => {
    stubMedia(true);
    const { container, unmount } = render(<FilterBar mobileLayout="inline">{fields}</FilterBar>);
    expect(container.querySelectorAll('.filter-field')).toHaveLength(2);
    expect(container.querySelector('.filter-bar__drawer-toggle')).toBeNull();
    unmount();
    const r = render(<FilterBar mobile="inline">{fields}</FilterBar>);
    expect(r.container.querySelectorAll('.filter-field')).toHaveLength(2);
  });
});
