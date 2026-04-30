import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HoverCard } from '../src/components/HoverCard';

describe('HoverCard', () => {
  afterEach(() => vi.useRealTimers());

  it('opens after hover delay and closes on leave', () => {
    vi.useFakeTimers();
    render(
      <HoverCard openDelay={100} closeDelay={50} trigger={<span>Trigger</span>}>
        <div>Card content</div>
      </HoverCard>
    );
    const trigger = screen.getByText('Trigger').parentElement!.parentElement!;
    expect(screen.queryByText('Card content')).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(150); });
    expect(screen.getByText('Card content')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(80); });
    expect(screen.queryByText('Card content')).not.toBeInTheDocument();
  });
});
