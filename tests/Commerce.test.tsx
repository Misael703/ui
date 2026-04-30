import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Rating, PriceDisplay, QuantitySelector, VariantSelector,
  WishlistButton, PromoCodeInput, FreeShippingProgress,
  CartDrawer, OrderSummary, AddressForm, CompareTable,
} from '../src/components/Commerce';

describe('Rating', () => {
  it('renders correct number of stars', () => {
    render(<Rating value={3} max={5} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('triggers onChange when interactive', () => {
    const onChange = vi.fn();
    render(<Rating value={0} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('4 estrellas'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables stars when not interactive', () => {
    render(<Rating value={3} />);
    screen.getAllByRole('button').forEach((s) => expect(s).toBeDisabled());
  });
});

describe('PriceDisplay', () => {
  it('renders amount in CLP by default', () => {
    render(<PriceDisplay amount={5490} />);
    expect(screen.getByText(/5\.490/)).toBeInTheDocument();
  });

  it('shows compareAt and discount when provided', () => {
    render(<PriceDisplay amount={8000} compareAt={10000} />);
    expect(screen.getByText(/10\.000/)).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('hides discount when showDiscount is false', () => {
    render(<PriceDisplay amount={8000} compareAt={10000} showDiscount={false} />);
    expect(screen.queryByText('-20%')).toBeNull();
  });
});

describe('QuantitySelector', () => {
  it('triggers onChange on increment', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} max={10} />);
    fireEvent.click(screen.getByLabelText('Aumentar cantidad'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('clamps to min', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} min={1} />);
    expect(screen.getByLabelText('Disminuir cantidad')).toBeDisabled();
  });

  it('clamps to max', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={5} onChange={onChange} max={5} />);
    expect(screen.getByLabelText('Aumentar cantidad')).toBeDisabled();
  });
});

describe('VariantSelector', () => {
  const opts = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large', disabled: true },
  ];

  it('renders chips and triggers onChange', () => {
    const onChange = vi.fn();
    render(<VariantSelector options={opts} value="sm" onChange={onChange} />);
    fireEvent.click(screen.getByText('Medium'));
    expect(onChange).toHaveBeenCalledWith('md');
  });

  it('marks selected with aria-checked', () => {
    render(<VariantSelector options={opts} value="md" onChange={() => {}} />);
    expect(screen.getByText('Medium').closest('button')).toHaveAttribute('aria-checked', 'true');
  });

  it('disables disabled options', () => {
    render(<VariantSelector options={opts} value="sm" onChange={() => {}} />);
    expect(screen.getByText('Large').closest('button')).toBeDisabled();
  });
});

describe('WishlistButton', () => {
  it('toggles state on click', () => {
    const onToggle = vi.fn();
    render(<WishlistButton active={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText('Agregar a favoritos'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('shows correct aria-label when active', () => {
    render(<WishlistButton active={true} />);
    expect(screen.getByLabelText('Quitar de favoritos')).toBeInTheDocument();
  });
});

describe('PromoCodeInput', () => {
  it('shows success message when onApply resolves', async () => {
    const onApply = vi.fn().mockResolvedValue('10% off!');
    render(<PromoCodeInput onApply={onApply} />);
    fireEvent.change(screen.getByPlaceholderText(/Código/), { target: { value: 'PROMO' } });
    fireEvent.click(screen.getByText('Aplicar'));
    await waitFor(() => expect(screen.getByText('10% off!')).toBeInTheDocument());
  });

  it('shows error message when onApply throws', async () => {
    const onApply = vi.fn().mockRejectedValue(new Error('Inválido'));
    render(<PromoCodeInput onApply={onApply} />);
    fireEvent.change(screen.getByPlaceholderText(/Código/), { target: { value: 'X' } });
    fireEvent.click(screen.getByText('Aplicar'));
    await waitFor(() => expect(screen.getByText('Inválido')).toBeInTheDocument());
  });

  it('uppercases input automatically', () => {
    render(<PromoCodeInput onApply={() => Promise.resolve('')} />);
    const input = screen.getByPlaceholderText(/Código/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'promo' } });
    expect(input.value).toBe('PROMO');
  });
});

describe('FreeShippingProgress', () => {
  it('shows remaining when below threshold', () => {
    render(<FreeShippingProgress current={20000} threshold={50000} />);
    expect(screen.getByText(/Te falta/)).toBeInTheDocument();
  });

  it('shows achieved message when at or above threshold', () => {
    render(<FreeShippingProgress current={50000} threshold={50000} />);
    expect(screen.getByText(/envío gratis/i)).toBeInTheDocument();
  });
});

describe('CartDrawer', () => {
  const items = [
    { id: '1', name: 'Cemento', unitPrice: 5000, quantity: 2 },
    { id: '2', name: 'Fierro', unitPrice: 3000, quantity: 1 },
  ];

  it('renders items and subtotal', () => {
    render(<CartDrawer open onClose={() => {}} items={items} />);
    expect(screen.getByText('Cemento')).toBeInTheDocument();
    expect(screen.getByText('Fierro')).toBeInTheDocument();
    // 5000*2 + 3000*1 = 13000
    expect(screen.getByText(/13\.000/)).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<CartDrawer open onClose={() => {}} items={[]} />);
    expect(screen.getByText(/vacío/)).toBeInTheDocument();
  });

  it('disables checkout when empty', () => {
    render(<CartDrawer open onClose={() => {}} items={[]} onCheckout={() => {}} />);
    expect(screen.getByText(/Ir a pagar/)).toBeDisabled();
  });

  it('triggers onRemove', () => {
    const onRemove = vi.fn();
    render(<CartDrawer open onClose={() => {}} items={items} onRemove={onRemove} />);
    const removeButtons = screen.getAllByLabelText('Quitar del carro');
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});

describe('OrderSummary', () => {
  it('renders rows and emphasizes total', () => {
    const { container } = render(
      <OrderSummary rows={[
        { label: 'Subtotal', value: '$100' },
        { label: 'Total', value: '$120', emphasis: true },
      ]} />
    );
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(container.querySelector('.is-emphasis')).toBeInTheDocument();
  });
});

describe('AddressForm', () => {
  it('renders fields and triggers onChange', () => {
    const onChange = vi.fn();
    render(<AddressForm value={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Misael' } });
    expect(onChange).toHaveBeenCalledWith({ fullName: 'Misael' });
  });

  it('hides RUT when showRut is false', () => {
    render(<AddressForm value={{}} onChange={() => {}} showRut={false} />);
    expect(screen.queryByLabelText('RUT')).toBeNull();
  });
});

describe('CompareTable', () => {
  const items = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ];
  const attrs = [
    { key: 'k1', label: 'Marca', values: { a: 'X', b: 'Y' } },
  ];

  it('renders items as columns and attrs as rows', () => {
    render(<CompareTable items={items} attributes={attrs} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });

  it('triggers onRemove', () => {
    const onRemove = vi.fn();
    render(<CompareTable items={items} attributes={attrs} onRemove={onRemove} />);
    fireEvent.click(screen.getByLabelText('Quitar A'));
    expect(onRemove).toHaveBeenCalledWith('a');
  });
});
