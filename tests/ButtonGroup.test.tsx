import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, ButtonGroup } from '../src/components/Button';

describe('ButtonGroup', () => {
  it('renders children inside group container', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>
    );
    expect(container.querySelector('.btn-group')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('Button success/warning variants', () => {
  it('renders success class', () => {
    const { container } = render(<Button variant="success">OK</Button>);
    expect(container.querySelector('.btn--success')).toBeInTheDocument();
  });

  it('renders warning class', () => {
    const { container } = render(<Button variant="warning">!</Button>);
    expect(container.querySelector('.btn--warning')).toBeInTheDocument();
  });
});
