import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  UserCell, StatusIndicator, Timeline, TimelineItem,
  Tree, Calendar,
} from '../src/components/Display3';

describe('UserCell', () => {
  it('renders name and meta', () => {
    render(<UserCell name="Misael Ocas" meta="admin" />);
    expect(screen.getByText('Misael Ocas')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });
});

describe('StatusIndicator', () => {
  it('renders with label and tone', () => {
    const { container } = render(<StatusIndicator tone="success" label="Activo" />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(container.querySelector('.status-indicator__dot--success')).toBeInTheDocument();
  });
});

describe('Timeline', () => {
  it('renders items in order', () => {
    render(
      <Timeline>
        <TimelineItem title="Paso 1" />
        <TimelineItem title="Paso 2" />
      </Timeline>
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Paso 1');
  });

  // v1.28.0: progress states + density + right slot. All orthogonal and opt-in;
  // existing usage (no state / no density / no right) must render byte-equivalent.
  it('state="done|current|pending" emits the matching modifier class', () => {
    const { container } = render(
      <Timeline>
        <TimelineItem state="done"    title="A" />
        <TimelineItem state="current" title="B" />
        <TimelineItem state="pending" title="C" />
        <TimelineItem title="D" />
      </Timeline>
    );
    const lis = container.querySelectorAll('.timeline__item');
    expect(lis[0]).toHaveClass('timeline__item--done');
    expect(lis[1]).toHaveClass('timeline__item--current');
    expect(lis[2]).toHaveClass('timeline__item--pending');
    // No state → no progress modifier (back-compat).
    expect(lis[3].className).not.toMatch(/timeline__item--(done|current|pending)/);
  });

  it('density="compact" adds the modifier to the list (semantically identical)', () => {
    const { container } = render(
      <Timeline density="compact">
        <TimelineItem title="A" />
      </Timeline>
    );
    expect(container.querySelector('.timeline')).toHaveClass('timeline--compact');
  });

  it('`right` renders the trailing slot only when provided; DOM is unchanged otherwise', () => {
    const { container, rerender } = render(
      <Timeline>
        <TimelineItem title="A" />
      </Timeline>
    );
    // Without `right`: no title-row wrapper (DOM is byte-identical with 1.x).
    expect(container.querySelector('.timeline__title-row')).toBeNull();
    expect(container.querySelector('.timeline__right')).toBeNull();

    rerender(
      <Timeline>
        <TimelineItem title="A" right={<span data-testid="chip">envío</span>} />
      </Timeline>
    );
    // With `right`: wrapper appears and the trailing node renders inside it.
    expect(container.querySelector('.timeline__title-row')).toBeInTheDocument();
    expect(container.querySelector('.timeline__right [data-testid="chip"]')).toBeInTheDocument();
  });
});

describe('Tree', () => {
  const nodes = [
    { id: 'a', label: 'Cat A', children: [{ id: 'a1', label: 'Sub A1' }] },
    { id: 'b', label: 'Cat B' },
  ];

  it('expands and collapses on chevron click and exposes aria-expanded', () => {
    const { container } = render(<Tree nodes={nodes} />);
    expect(screen.queryByText('Sub A1')).toBeNull();
    // The disclosure twistie is decorative (aria-hidden) per the WAI-ARIA
    // TreeView pattern; state is exposed on the treeitem via aria-expanded.
    const item = screen.getByRole('treeitem', { name: 'Cat A' });
    expect(item).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(container.querySelector('.tree__chev') as HTMLElement);
    expect(screen.getByText('Sub A1')).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Cat A' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(container.querySelector('.tree__chev') as HTMLElement);
    expect(screen.queryByText('Sub A1')).toBeNull();
  });

  it('calls onSelect with node id', () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Cat B'));
    expect(onSelect).toHaveBeenCalledWith('b');
  });
});

describe('Calendar', () => {
  it('renders current month and weekday headers', () => {
    render(<Calendar month={new Date(2026, 3, 1)} />);
    expect(screen.getByText(/Abril 2026/)).toBeInTheDocument();
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    const onMonthChange = vi.fn();
    render(<Calendar month={new Date(2026, 3, 1)} onMonthChange={onMonthChange} />);
    fireEvent.click(screen.getByLabelText('Mes siguiente'));
    expect(onMonthChange).toHaveBeenCalled();
    const next = onMonthChange.mock.calls[0][0] as Date;
    expect(next.getMonth()).toBe(4); // mayo
  });

  it('renders events on matching days', () => {
    const date = new Date(2026, 3, 15);
    render(
      <Calendar
        month={new Date(2026, 3, 1)}
        events={[{ date, label: 'Despacho' }]}
      />
    );
    expect(screen.getByText('Despacho')).toBeInTheDocument();
  });
});
