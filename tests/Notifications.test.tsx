import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from '../src/components/Notifications';

const items = [
  { id: '1', title: 'Pedido nuevo', tone: 'success' as const, read: false },
  { id: '2', title: 'Stock bajo', tone: 'warning' as const, read: false },
  { id: '3', title: 'Cliente registrado', tone: 'info' as const, read: true },
];

describe('NotificationCenter', () => {
  it('shows unread count badge', () => {
    render(<NotificationCenter notifications={items} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens panel and lists notifications', () => {
    render(<NotificationCenter notifications={items} />);
    fireEvent.click(screen.getByLabelText(/Notificaciones/));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Pedido nuevo')).toBeInTheDocument();
    expect(screen.getByText('Stock bajo')).toBeInTheDocument();
  });

  it('shows empty message when no notifications', () => {
    render(<NotificationCenter notifications={[]} emptyMessage="Sin alertas" />);
    fireEvent.click(screen.getByLabelText(/Notificaciones/));
    expect(screen.getByText('Sin alertas')).toBeInTheDocument();
  });

  it('triggers notification click handler', () => {
    const onClick = vi.fn();
    render(<NotificationCenter notifications={[{ id: '1', title: 'A', read: false, onClick }]} />);
    fireEvent.click(screen.getByLabelText(/Notificaciones/));
    fireEvent.click(screen.getByText('A'));
    expect(onClick).toHaveBeenCalled();
  });

  it('triggers mark all read', () => {
    const onMarkAllRead = vi.fn();
    render(<NotificationCenter notifications={items} onMarkAllRead={onMarkAllRead} />);
    fireEvent.click(screen.getByLabelText(/Notificaciones/));
    fireEvent.click(screen.getByText(/Marcar todas/));
    expect(onMarkAllRead).toHaveBeenCalled();
  });
});
