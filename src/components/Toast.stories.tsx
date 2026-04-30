import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import { Button } from './Button';

export default {
  title: 'Feedback/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} as Meta;

function Demo() {
  const { push } = useToast();
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="success" onClick={() => push({ title: 'Listo', description: 'Pedido guardado.', variant: 'success' })}>
        Success
      </Button>
      <Button variant="warning" onClick={() => push({ title: 'Aviso', description: 'Stock bajo en SKU ELT-12.', variant: 'warning' })}>
        Warning
      </Button>
      <Button variant="danger" onClick={() => push({ title: 'Error', description: 'No pudimos procesar el pago.', variant: 'danger' })}>
        Danger
      </Button>
      <Button variant="outline" onClick={() => push({ title: 'Sincronizado', variant: 'info' })}>
        Info
      </Button>
    </div>
  );
}

export const Demo_: StoryObj = { render: () => <Demo />, name: 'Demo' };
