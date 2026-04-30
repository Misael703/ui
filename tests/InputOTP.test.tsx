import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { InputOTP } from '../src/components/InputOTP';

function Controlled({ onComplete }: { onComplete?: (v: string) => void }) {
  const [v, setV] = React.useState('');
  return <InputOTP value={v} onChange={setV} length={4} onComplete={onComplete} />;
}

describe('InputOTP', () => {
  it('renders the requested number of slots', () => {
    render(<Controlled />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('advances focus on input and calls onComplete when full', () => {
    const onComplete = vi.fn();
    render(<Controlled onComplete={onComplete} />);
    const slots = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(slots[0], { target: { value: '1' } });
    fireEvent.change(slots[1], { target: { value: '2' } });
    fireEvent.change(slots[2], { target: { value: '3' } });
    fireEvent.change(slots[3], { target: { value: '4' } });
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('paste fills all slots', () => {
    const onComplete = vi.fn();
    render(<Controlled onComplete={onComplete} />);
    const first = screen.getAllByRole('textbox')[0];
    fireEvent.paste(first, { clipboardData: { getData: () => '5678' } });
    expect(onComplete).toHaveBeenCalledWith('5678');
  });

  it('rejects non-numeric in numeric mode', () => {
    render(<Controlled />);
    const slots = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(slots[0], { target: { value: 'a' } });
    expect(slots[0].value).toBe('');
  });
});
