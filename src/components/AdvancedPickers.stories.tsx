import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiCombobox, DateRangePicker, CommandPalette } from './AdvancedPickers';
import { Button } from './Button';
import type { DateRange } from './AdvancedPickers';

export default { title: 'Forms/Pickers Avanzados', tags: ['autodocs'] } as Meta;

export const MultiSeleccion: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<string[]>(['cobre']);
    return (
      <div style={{ maxWidth: 400 }}>
        <MultiCombobox
          value={v}
          onChange={setV}
          options={[
            { value: 'cobre', label: 'Cobre' },
            { value: 'aluminio', label: 'Aluminio' },
            { value: 'pvc', label: 'PVC' },
            { value: 'acero', label: 'Acero galvanizado' },
            { value: 'madera', label: 'Madera pino' },
          ]}
          placeholder="Selecciona materiales…"
        />
      </div>
    );
  },
};

export const RangoDeFechas: StoryObj = {
  render: () => {
    const [r, setR] = React.useState<DateRange>({ from: null, to: null });
    return (
      <DateRangePicker
        value={r}
        onChange={setR}
        presets={[
          { label: 'Últimos 7 días', range: () => ({ from: addDays(-6), to: new Date() }) },
          { label: 'Últimos 30 días', range: () => ({ from: addDays(-29), to: new Date() }) },
          { label: 'Este mes', range: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
        ]}
      />
    );
  },
};

export const PaletaDeComandos: StoryObj = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir paleta (⌘K)</Button>
        <CommandPalette
          open={open}
          onClose={() => setOpen(false)}
          items={[
            { id: '1', label: 'Crear pedido', group: 'Acciones', shortcut: '⌘N', onRun: () => alert('Crear') },
            { id: '2', label: 'Buscar producto', group: 'Acciones', shortcut: '⌘P', onRun: () => alert('Buscar') },
            { id: '3', label: 'Ir a clientes', group: 'Navegación', onRun: () => alert('Clientes') },
            { id: '4', label: 'Ir a despachos', group: 'Navegación', onRun: () => alert('Despachos') },
          ]}
        />
      </>
    );
  },
};

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
