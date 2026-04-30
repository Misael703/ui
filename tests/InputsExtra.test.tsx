import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Slider, Progress, ProgressCircle, TagInput, MoneyInput, PhoneInput,
  TimePicker, RadioGroup, CheckboxGroup,
} from '../src/components/InputsExtra';

describe('Slider', () => {
  it('emits numeric value', () => {
    const onChange = vi.fn();
    render(<Slider value={20} onChange={onChange} min={0} max={100} />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledWith(55);
  });
});

describe('Progress', () => {
  it('renders progressbar with value', () => {
    render(<Progress value={42} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
  });
});

describe('ProgressCircle', () => {
  it('shows label', () => {
    render(<ProgressCircle value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});

describe('TagInput', () => {
  it('adds a tag on Enter', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'foo' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['foo']);
    rerender(<TagInput value={['foo']} onChange={onChange} />);
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  it('removes a tag on click of ×', () => {
    const onChange = vi.fn();
    render(<TagInput value={['a', 'b']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Quitar a'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });
});

describe('MoneyInput', () => {
  it('parses a number on input', () => {
    const onChange = vi.fn();
    render(<MoneyInput value={null} onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '12345' } });
    expect(onChange).toHaveBeenCalledWith(12345);
  });
});

describe('PhoneInput', () => {
  it('strips letters', () => {
    const onChange = vi.fn();
    render(<PhoneInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '9abc1234' } });
    expect(onChange).toHaveBeenCalledWith('91234');
  });
});

describe('TimePicker', () => {
  it('emits time string', () => {
    const onChange = vi.fn();
    render(<TimePicker value="09:00" onChange={onChange} />);
    const input = screen.getByDisplayValue('09:00') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '14:30' } });
    expect(onChange).toHaveBeenCalledWith('14:30');
  });
});

describe('RadioGroup', () => {
  it('selects an option', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        name="t"
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />
    );
    fireEvent.click(screen.getByLabelText('B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('CheckboxGroup', () => {
  it('toggles items', () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup
        value={['a']}
        onChange={onChange}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />
    );
    fireEvent.click(screen.getByLabelText('B'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    fireEvent.click(screen.getByLabelText('A'));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
