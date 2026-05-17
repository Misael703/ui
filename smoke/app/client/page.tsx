'use client';
import * as React from 'react';
import { LocaleProvider, ToastProvider, useToast, Button, Modal, Combobox } from '@misael703/ui';

function Interactive() {
  const { push } = useToast();
  const [open, setOpen] = React.useState(false);
  const [v, setV] = React.useState<string | null>(null);
  return (
    <main style={{ padding: 24, display: 'grid', gap: 12 }}>
      <h1>kit smoke · client route</h1>
      <Button onClick={() => push({ title: 'Hola', variant: 'success' })}>Toast</Button>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modal">
        <Combobox value={v} onChange={setV} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />
      </Modal>
    </main>
  );
}

export default function ClientPage() {
  return (
    <LocaleProvider>
      <ToastProvider>
        <Interactive />
      </ToastProvider>
    </LocaleProvider>
  );
}
