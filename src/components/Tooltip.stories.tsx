import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Layout';
import { Button } from './Button';

// Hoisted: args hold a React element.
const TRIGGER = <Button variant="ghost">Pasa el mouse</Button>;

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { label: 'Esto es un tooltip', side: 'top', disabled: false, children: TRIGGER },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Long label: the bubble is width-capped (`max-width`) and WRAPS instead of
 * stretching across the screen. Short labels still stay on one line
 * (shrink-to-fit). Overridable with `--tooltip-max-width`.
 */
export const LongContent: Story = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 24px' }}>
      <Tooltip
        label="Por cada vendedor en el rango (por fecha de cierre): ventas concretadas y tiempo promedio hasta el cierre, desde el primer contacto hasta la venta. Solo oportunidades con vendedor asignado; ordenado por volumen, de mayor a menor."
        side="bottom"
      >
        <Button variant="ghost">Operación de entrega</Button>
      </Tooltip>
    </div>
  ),
};

/**
 * Tooltip inside a table with a sticky `<thead>`. The bubble portals to
 * `document.body`, so it sits above the fixed header instead of clipping
 * behind it. Hover "Editar" on any row.
 */
export const InStickyContext: Story = {
  render: () => (
    <div style={{ height: 220, overflowY: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
      <table className="table" style={{ width: '100%' }}>
        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 60 }}>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">SKU</th>
            <th scope="col" style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: '1', name: 'Taladro percutor', sku: 'TLD-700' },
            { id: '2', name: 'Sierra circular', sku: 'SRR-7' },
            { id: '3', name: 'Lijadora orbital', sku: 'LIJ-300' },
            { id: '4', name: 'Atornillador', sku: 'ATR-450' },
            { id: '5', name: 'Pulidora', sku: 'PUL-180' },
            { id: '6', name: 'Compresor', sku: 'CMP-50L' },
          ].map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.sku}</td>
              <td style={{ textAlign: 'right' }}>
                <Tooltip label={`Editar ${r.name}`}>
                  <Button variant="ghost" size="sm">Editar</Button>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
