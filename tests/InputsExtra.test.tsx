import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

describe('TimePicker (custom popover)', () => {
  it('trigger shows the composed value and toggles the popover', () => {
    render(<TimePicker value="09:30" onChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: /09:30/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('input[type="time"]')).toBeNull(); // no native control
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  describe('granularity', () => {
    it("default 'minute' shows hour + minute columns; any minute is selectable", () => {
      const onChange = vi.fn();
      render(<TimePicker value="09:00" onChange={onChange} />);
      fireEvent.click(screen.getByRole('button', { name: /09:00/ }));
      expect(screen.getAllByRole('listbox')).toHaveLength(2);
      const minutes = screen.getByRole('listbox', { name: 'Minutos' });
      // 60 options → an off-grid minute like 37 is present and selectable.
      expect(within(minutes).getAllByRole('option')).toHaveLength(60);
      fireEvent.click(within(minutes).getByText('37'));
      expect(onChange).toHaveBeenCalledWith('09:37');
    });

    it('step thins the minute column (step=15 → 00 15 30 45)', () => {
      render(<TimePicker value="09:00" onChange={() => {}} step={15} />);
      fireEvent.click(screen.getByRole('button'));
      const minutes = screen.getByRole('listbox', { name: 'Minutos' });
      expect(within(minutes).getAllByRole('option').map((o) => o.textContent)).toEqual(['00', '15', '30', '45']);
    });

    it("'second' adds a third column and emits HH:mm:ss", () => {
      const onChange = vi.fn();
      render(<TimePicker value="09:30:00" onChange={onChange} granularity="second" />);
      fireEvent.click(screen.getByRole('button', { name: /09:30:00/ }));
      expect(screen.getAllByRole('listbox')).toHaveLength(3);
      const seconds = screen.getByRole('listbox', { name: 'Segundos' });
      fireEvent.click(within(seconds).getByText('09'));
      expect(onChange).toHaveBeenCalledWith('09:30:09');
    });

    it("'second' step thins the second column (step=5 → 12 options)", () => {
      render(<TimePicker value="09:00:00" onChange={() => {}} granularity="second" step={5} />);
      fireEvent.click(screen.getByRole('button'));
      expect(within(screen.getByRole('listbox', { name: 'Segundos' })).getAllByRole('option')).toHaveLength(12);
    });

    it("'hour' shows a single minute-less column and emits HH:00", () => {
      const onChange = vi.fn();
      render(<TimePicker value="14:00" onChange={onChange} granularity="hour" />);
      fireEvent.click(screen.getByRole('button', { name: /14:00/ }));
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
      const hours = screen.getByRole('listbox', { name: 'Horas' });
      expect(within(hours).getAllByRole('option')).toHaveLength(24);
      fireEvent.click(within(hours).getByText('06'));
      expect(onChange).toHaveBeenCalledWith('06:00');
    });

    it("'hour' step thins the column (step=2 → 12 hours)", () => {
      render(<TimePicker value="00:00" onChange={() => {}} granularity="hour" step={2} />);
      fireEvent.click(screen.getByRole('button'));
      expect(within(screen.getByRole('listbox', { name: 'Horas' })).getAllByRole('option')).toHaveLength(12);
    });
  });

  it('keyboard: ArrowDown on a column commits the next value', () => {
    const onChange = vi.fn();
    render(<TimePicker value="09:30" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Horas' }), { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith('10:30');
  });

  it('keyboard: ArrowUp wraps from the first option to the last', () => {
    const onChange = vi.fn();
    render(<TimePicker value="00:30" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('listbox', { name: 'Horas' }), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith('23:30');
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
