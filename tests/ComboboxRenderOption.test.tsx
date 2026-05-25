import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Combobox } from '../src/components/Pickers';

/**
 * `renderOption` prop (v1.19.0). Customizes each listbox row's content;
 * falls back to `label` (+ `description`) when omitted. The searchable input
 * still shows `label` as text — only the listbox rows are customized.
 *
 * Must FAIL before the fix: prop doesn't exist; rows always render the
 * default label span.
 */
const options = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
];

describe('Combobox `renderOption` prop', () => {
  it('renders custom content for each listbox row', () => {
    render(
      <Combobox
        value={null}
        onChange={() => {}}
        options={options}
        searchable={false}
        renderOption={(o) => <span>{`#${String(o.value)} ${o.label}`}</span>}
      />,
    );
    fireEvent.click(screen.getByRole('combobox'));
    const items = screen.getAllByRole('option');
    expect(items.map((el) => el.textContent)).toEqual(['#a Apple', '#b Banana']);
  });

  it('falls back to label when renderOption is omitted', () => {
    render(<Combobox value={null} onChange={() => {}} options={options} searchable={false} />);
    fireEvent.click(screen.getByRole('combobox'));
    const items = screen.getAllByRole('option');
    expect(items.map((el) => el.textContent)).toEqual(['Apple', 'Banana']);
  });
});
