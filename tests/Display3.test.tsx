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
});

describe('Tree', () => {
  const nodes = [
    { id: 'a', label: 'Cat A', children: [{ id: 'a1', label: 'Sub A1' }] },
    { id: 'b', label: 'Cat B' },
  ];

  it('expands and collapses on chevron click', () => {
    render(<Tree nodes={nodes} />);
    expect(screen.queryByText('Sub A1')).toBeNull();
    fireEvent.click(screen.getByLabelText('Expandir'));
    expect(screen.getByText('Sub A1')).toBeInTheDocument();
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
