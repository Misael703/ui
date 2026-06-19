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

  describe('granularity', () => {
    it("default 'minute' allows any minute (native step 60, not the old 900)", () => {
      const onChange = vi.fn();
      const { container } = render(<TimePicker value="09:00" onChange={onChange} />);
      const input = container.querySelector('input') as HTMLInputElement;
      // step=60s → 1-minute increments → an off-grid minute like 14:37 is valid.
      expect(input.getAttribute('step')).toBe('60');
      fireEvent.change(input, { target: { value: '14:37' } });
      expect(onChange).toHaveBeenCalledWith('14:37');
    });

    it("explicit step is preserved for back-compat (step=15 → native 900)", () => {
      const { container } = render(<TimePicker value="09:00" onChange={() => {}} step={15} />);
      expect((container.querySelector('input') as HTMLInputElement).getAttribute('step')).toBe('900');
    });

    it("'second' shows seconds (native step 1) and emits HH:mm:ss", () => {
      const onChange = vi.fn();
      const { container } = render(<TimePicker value="14:37:09" onChange={onChange} granularity="second" />);
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.getAttribute('step')).toBe('1');
      fireEvent.change(input, { target: { value: '14:37:42' } });
      expect(onChange).toHaveBeenCalledWith('14:37:42');
    });

    it("'second' with step in seconds multiplies through (step=5 → native 5)", () => {
      const { container } = render(<TimePicker value="14:00:00" onChange={() => {}} granularity="second" step={5} />);
      expect((container.querySelector('input') as HTMLInputElement).getAttribute('step')).toBe('5');
    });

    it("'hour' renders a minute-less select and emits HH:00", () => {
      const onChange = vi.fn();
      render(<TimePicker value="14:00" onChange={onChange} granularity="hour" />);
      // No time input — minutes are genuinely hidden.
      expect(document.querySelector('input[type="time"]')).toBeNull();
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options).toHaveLength(24);
      expect(select.options[0].value).toBe('00:00');
      fireEvent.change(select, { target: { value: '15:00' } });
      expect(onChange).toHaveBeenCalledWith('15:00');
    });

    it("'hour' with step thins the option list (step=2 → 12 hours)", () => {
      render(<TimePicker value="00:00" onChange={() => {}} granularity="hour" step={2} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.options).toHaveLength(12);
      expect(Array.from(select.options).map((o) => o.value)).toEqual(
        ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
      );
    });
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
