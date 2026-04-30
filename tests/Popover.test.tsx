import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover } from '../src/components/Popover';

describe('Popover', () => {
  it('opens on trigger click', () => {
    render(
      <Popover trigger={<button>Abrir</button>}>
        <div>Contenido del popover</div>
      </Popover>
    );
    expect(screen.queryByText('Contenido del popover')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Abrir'));
    expect(screen.getByText('Contenido del popover')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(
      <Popover defaultOpen trigger={<button>Trigger</button>}>
        <div>Body</div>
      </Popover>
    );
    expect(screen.getByText('Body')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('respects controlled open prop', () => {
    const { rerender } = render(
      <Popover open={false} trigger={<button>T</button>}>
        <div>X</div>
      </Popover>
    );
    expect(screen.queryByText('X')).not.toBeInTheDocument();
    rerender(
      <Popover open={true} trigger={<button>T</button>}>
        <div>X</div>
      </Popover>
    );
    expect(screen.getByText('X')).toBeInTheDocument();
  });
});
