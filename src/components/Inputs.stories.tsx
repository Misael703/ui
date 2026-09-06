import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { NumberInput, Pagination, EmptyState, Kpi } from './Inputs';

export default { title: 'Forms/Inputs', tags: ['autodocs'] } as Meta;

export const NumberInputBasico: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(1);
    return <NumberInput value={v} onChange={setV} min={0} max={99} suffix="u" />;
  },
};

export const NumberInputFullWidth: StoryObj = {
  render: () => {
    const [v, setV] = React.useState<number | null>(1200);
    return (
      <div style={{ width: 320 }}>
        <NumberInput value={v} onChange={setV} min={0} fullWidth suffix="kg" />
      </div>
    );
  },
};

/**
 * **`size`** (v3.5.0): `sm` para un contador dentro de una fila de tabla o una
 * toolbar densa; `md` (default) es el registro de campo de formulario. El piso
 * del campo en `md` bajó de 80 a 64px: un contador de unidades no necesita más.
 */
export const NumberInputTamanos: StoryObj = {
  name: 'NumberInput · size sm vs md',
  render: () => {
    const [a, setA] = React.useState<number | null>(1);
    const [b, setB] = React.useState<number | null>(1);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>size="sm" · en una celda</span>
          <NumberInput size="sm" value={a} onChange={setA} min={0} max={99} suffix="u" />
        </div>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>size="md" (default) · en un formulario</span>
          <NumberInput value={b} onChange={setB} min={0} max={99} suffix="u" />
        </div>
      </div>
    );
  },
};

export const PaginationBasico: StoryObj = {
  render: () => {
    const [p, setP] = React.useState(3);
    return <Pagination page={p} pageSize={20} total={234} onPageChange={setP} />;
  },
};

export const EmptyBasico: StoryObj = {
  render: () => <EmptyState title="Sin pedidos aún" description="Cuando hagas tu primer pedido aparecerá acá." />,
};

export const KpiBasico: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <Kpi label="Ventas hoy" value="$2.4M" delta={{ value: '12%', trend: 'up' }} hint="vs ayer" />
      <Kpi label="Pedidos" value="184" delta={{ value: '3%', trend: 'down' }} />
      <Kpi label="Ticket prom." value="$13.8K" delta={{ value: '0%', trend: 'flat' }} />
    </div>
  ),
};

/** Playground interactivo: usa Controls para `min`/`max`/`step`/`prefix`/`suffix`. */
export const NumberInputPlayground: StoryObj<typeof NumberInput> = {
  args: { min: 0, max: 99, step: 1, suffix: 'u', disabled: false, size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  render: (args) => {
    const [v, setV] = React.useState<number | null>(1);
    return <NumberInput {...args} value={v} onChange={setV} />;
  },
};
