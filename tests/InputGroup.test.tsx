import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputGroup, InputGroupAddon, Input } from '../src/components/Form';

describe('InputGroup', () => {
  it('renders input with addons', () => {
    render(
      <InputGroup>
        <InputGroupAddon>$</InputGroupAddon>
        <Input placeholder="Monto" />
        <InputGroupAddon>CLP</InputGroupAddon>
      </InputGroup>
    );
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('CLP')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Monto')).toBeInTheDocument();
  });
});
