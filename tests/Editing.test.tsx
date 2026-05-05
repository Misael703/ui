import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ConfirmDialog, DescriptionList, DescriptionListItem,
  DiffViewer, TransferList, type TransferItem,
} from '../src/components/Editing';
import { LocaleProvider } from '../src/locale';

describe('ConfirmDialog', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="x" />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders title and description', () => {
    render(
      <ConfirmDialog
        open onClose={() => {}} onConfirm={() => {}}
        title="¿Eliminar?"
        description="Acción irreversible"
      />
    );
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument();
    expect(screen.getByText('Acción irreversible')).toBeInTheDocument();
  });

  it('triggers onConfirm and onClose on confirm', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    render(<ConfirmDialog open onClose={onClose} onConfirm={onConfirm} title="x" confirmLabel="Sí" />);
    fireEvent.click(screen.getByText('Sí'));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});

describe('DescriptionList', () => {
  it('renders label and value pairs', () => {
    render(
      <DescriptionList>
        <DescriptionListItem label="Cliente" value="Norte SpA" />
        <DescriptionListItem label="Total" value="$100" />
      </DescriptionList>
    );
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('Norte SpA')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('shows edit button when editable + onEdit provided', () => {
    const onEdit = vi.fn();
    render(
      <DescriptionList>
        <DescriptionListItem label="RUT" value="12345" editable onEdit={onEdit} />
      </DescriptionList>
    );
    fireEvent.click(screen.getByText('Editar'));
    expect(onEdit).toHaveBeenCalled();
  });
});

describe('DiffViewer', () => {
  it('renders all entries with before/after', () => {
    render(
      <DiffViewer entries={[
        { field: 'Cliente', before: 'A', after: 'B' },
        { field: 'Total', before: '100', after: '200' },
      ]} />
    );
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });
});

describe('TransferList', () => {
  const items: TransferItem[] = [
    { id: 'a', label: 'Item A' },
    { id: 'b', label: 'Item B' },
    { id: 'c', label: 'Item C' },
  ];

  it('renders source items in left column', () => {
    render(<TransferList source={items} selected={[]} onChange={() => {}} />);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
  });

  it('moves checked item to selected on right arrow click', () => {
    const onChange = vi.fn();
    render(<TransferList source={items} selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Item A'));
    fireEvent.click(screen.getByLabelText('Asignar seleccionados'));
    expect(onChange).toHaveBeenCalledWith([{ id: 'a', label: 'Item A' }]);
  });

  it('disables arrows when nothing checked', () => {
    render(<TransferList source={items} selected={[]} onChange={() => {}} />);
    expect(screen.getByLabelText('Asignar seleccionados')).toBeDisabled();
    expect(screen.getByLabelText('Quitar seleccionados')).toBeDisabled();
  });

  it('uses styled Checkbox component (not raw input)', () => {
    const { container } = render(<TransferList source={items} selected={[]} onChange={() => {}} />);
    const checks = container.querySelectorAll('label.check');
    expect(checks.length).toBeGreaterThan(0);
    expect(checks[0].querySelector('.check__box')).not.toBeNull();
  });

  it('respects LocaleProvider override for default titles', () => {
    render(
      <LocaleProvider
        messages={{ 'transfer.available': 'Available', 'transfer.assigned': 'Assigned' }}
      >
        <TransferList source={[]} selected={[]} onChange={() => {}} />
      </LocaleProvider>
    );
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
  });
});

describe('DiffViewer locale', () => {
  it('respects LocaleProvider override for headers', () => {
    render(
      <LocaleProvider
        messages={{ 'diff.field': 'Field', 'diff.before': 'Before', 'diff.after': 'After' }}
      >
        <DiffViewer entries={[{ field: 'x', before: 'a', after: 'b' }]} />
      </LocaleProvider>
    );
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });
});
