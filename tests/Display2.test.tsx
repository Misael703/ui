import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar, AvatarGroup, Menu, Stat } from '../src/components/Display2';

describe('Avatar', () => {
  it('renders initials when no src', () => {
    render(<Avatar name="Patricio Rojas" />);
    expect(screen.getByText('PR')).toBeInTheDocument();
  });
  it('renders image when src is provided', () => {
    render(<Avatar src="/foo.png" alt="Patricio" />);
    expect(screen.getByRole('img', { name: 'Patricio' })).toBeInTheDocument();
  });
  it('uses first two letters when name is a single word', () => {
    render(<Avatar name="JN" />);
    expect(screen.getByText('JN')).toBeInTheDocument();
  });
  it('falls back to ? when name is empty/whitespace', () => {
    render(<Avatar name="   " />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
  it('scales font-size proportional to size', () => {
    const { container } = render(<Avatar name="EA" size={64} />);
    const avatar = container.querySelector('.avatar') as HTMLElement;
    expect(avatar.style.fontSize).toBe(`${64 * 0.42}px`);
    expect(avatar.style.width).toBe('64px');
  });
});

describe('AvatarGroup', () => {
  it('shows overflow count', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Ana" />
        <Avatar name="Beto" />
        <Avatar name="Carla" />
        <Avatar name="Dani" />
      </AvatarGroup>
    );
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});

describe('Menu', () => {
  it('opens on trigger click and runs onSelect', () => {
    const run = vi.fn();
    render(
      <Menu
        trigger={<button type="button">Open</button>}
        items={[
          { type: 'label', label: 'Section' },
          { label: 'Editar', onSelect: run },
          { type: 'separator' },
          { label: 'Borrar', destructive: true, onSelect: () => {} },
        ]}
      />
    );
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Section')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Editar'));
    expect(run).toHaveBeenCalled();
  });
});

describe('Stat', () => {
  it('renders label, value and trend', () => {
    render(<Stat label="Ventas" value="$1.2M" trend={{ dir: 'up', value: '+12%' }} hint="vs sem. ant." />);
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getByText('$1.2M')).toBeInTheDocument();
    expect(screen.getByText(/\+12%/)).toBeInTheDocument();
  });
});
