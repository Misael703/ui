import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader, Stack, Grid } from './Layout';
import { Button } from './Button';

const meta = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  args: { title: 'Pedidos recientes' },
  argTypes: {
    level: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
  },
} satisfies Meta<typeof SectionHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Two sections in context, each with its own header actions and body. */
export const Examples: Story = {
  render: () => (
    <Stack gap={6}>
      <section aria-labelledby="sh-1">
        <SectionHeader
          title="Pedidos recientes"
          titleId="sh-1"
          actions={<a href="/orders" className="caption">Ver todos</a>}
        />
        <Grid minColWidth={140} gap={3}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8 }}>Pedido {n}</div>
          ))}
        </Grid>
      </section>
      <section aria-labelledby="sh-2">
        <SectionHeader
          title="Inventario"
          description="Stock por bodega, actualizado hoy"
          titleId="sh-2"
          actions={<Button variant="ghost" size="sm">Exportar</Button>}
        />
        <div style={{ padding: 16, background: 'var(--bg-subtle)', borderRadius: 8 }}>Tabla…</div>
      </section>
    </Stack>
  ),
};
