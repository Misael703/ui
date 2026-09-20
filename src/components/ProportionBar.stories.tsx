import type { Meta, StoryObj } from '@storybook/react';
import { ProportionBar } from './Metrics';

const SEGMENTS = [
  { label: 'Pagado', value: 62 },
  { label: 'Pendiente', value: 28 },
  { label: 'Vencido', value: 10 },
];

const meta = {
  title: 'Components/ProportionBar',
  component: ProportionBar,
  tags: ['autodocs'],
  args: { segments: SEGMENTS },
  argTypes: {
    showLegend: { control: 'boolean' },
    showPercent: { control: 'boolean' },
  },
} satisfies Meta<typeof ProportionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <ProportionBar {...a} ariaLabel="estado de pedidos" />
      <ProportionBar
        height={14}
        segments={[
          { label: 'Cemento', value: 40 },
          { label: 'Fierro', value: 25 },
          { label: 'Áridos', value: 20 },
          { label: 'Otros', value: 15 },
        ]}
      />
    </div>
  ),
};
