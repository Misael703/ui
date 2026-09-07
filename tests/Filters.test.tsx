import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel, FilterSection, BulkActionBar, SortDropdown, FilterBar, FilterField } from '../src/components/Filters';

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

  // `summary` (v3.7.0): the result count is not an action. It used to end up
  // orphaned in a separate toolbar row (despachos: "12 órdenes" next to the
  // view switcher); the rule is "a datum lives next to what produces it", so
  // the count sits in the bar, right-aligned, at the fields' baseline — even
  // when the fields grid wraps.
  it('renders the summary slot only when provided, after the fields and before the actions', () => {
    const { container, rerender } = render(
      <FilterBar summary="12 órdenes" actions={<button type="button">Limpiar</button>}>
        <FilterField label="Estado"><input /></FilterField>
      </FilterBar>
    );
    const bar = container.querySelector('.filter-bar')!;
    const kids = [...bar.children].map((c) => c.className);
    expect(kids).toEqual(['filter-bar__fields', 'filter-bar__summary', 'filter-bar__actions']);
    expect(bar.querySelector('.filter-bar__summary')).toHaveTextContent('12 órdenes');
    rerender(<FilterBar><FilterField label="Estado"><input /></FilterField></FilterBar>);
    expect(container.querySelector('.filter-bar__summary')).toBeNull();
  });
  it('CSS: the summary is pushed to the end of the row and centred on the dense control height', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const rule = css.match(/\.filter-bar__summary\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/margin-left:\s*auto/);
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
