import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Card, CardHeader, CardBody, CardFooter,
  Badge, Alert, Skeleton, Spinner,
  Chip, ChipGroup, ProductCard,
} from '../src/components/Display';

describe('Card', () => {
  it('renders header, body and footer', () => {
    render(
      <Card>
        <CardHeader>Head</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Foot</CardFooter>
      </Card>
    );
    expect(screen.getByText('Head')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });

  it('applies accent class', () => {
    const { container } = render(<Card accent="success">x</Card>);
    expect(container.querySelector('.card--accent-success')).toBeInTheDocument();
  });

  it('applies interactive class', () => {
    const { container } = render(<Card interactive>x</Card>);
    expect(container.querySelector('.card--interactive')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders with variant class', () => {
    const { container } = render(<Badge variant="success">Activo</Badge>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(container.querySelector('.badge--success')).toBeInTheDocument();
  });
});

describe('Alert', () => {
  it('renders title and children', () => {
    render(<Alert title="Aviso">Cuerpo</Alert>);
    expect(screen.getByText('Aviso')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
  });

  it('triggers onClose', () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>x</Alert>);
    fireEvent.click(screen.getByLabelText('Cerrar alerta'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Skeleton', () => {
  it('renders with skel class', () => {
    const { container } = render(<Skeleton width={120} height={20} />);
    expect(container.querySelector('.skel')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('renders with role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('renders content', () => {
    render(<Chip>Filter</Chip>);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('triggers onRemove', () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>x</Chip>);
    fireEvent.click(screen.getByLabelText('Quitar'));
    expect(onRemove).toHaveBeenCalled();
  });

  it('applies active class', () => {
    const { container } = render(<Chip active>x</Chip>);
    expect(container.querySelector('.chip--active')).toBeInTheDocument();
  });
});

describe('ChipGroup', () => {
  it('renders children', () => {
    render(<ChipGroup><Chip>A</Chip><Chip>B</Chip></ChipGroup>);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('ProductCard', () => {
  it('renders name, sku, price, tag', () => {
    render(<ProductCard sku="SKU1" name="Cemento" price="$5.000" tag="Oferta" />);
    expect(screen.getByText('Cemento')).toBeInTheDocument();
    expect(screen.getByText('SKU1')).toBeInTheDocument();
    expect(screen.getByText('$5.000')).toBeInTheDocument();
    expect(screen.getByText('Oferta')).toBeInTheDocument();
  });

  it('renders image when provided', () => {
    render(<ProductCard name="X" image="/foo.jpg" imageAlt="foo" />);
    expect(screen.getByAltText('foo')).toBeInTheDocument();
  });

  it('renders placeholder when no image', () => {
    const { container } = render(<ProductCard name="X" sku="ABC" />);
    expect(container.querySelector('.product-card__placeholder')).toHaveTextContent('[ ABC ]');
  });
});
