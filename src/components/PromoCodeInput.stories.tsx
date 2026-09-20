import type { Meta, StoryObj } from '@storybook/react';
import { PromoCodeInput } from './Commerce';

const meta = {
  title: 'Components/PromoCodeInput',
  component: PromoCodeInput,
  tags: ['autodocs'],
  args: {
    onApply: async (code: string) => {
      await new Promise((r) => setTimeout(r, 600));
      if (code === 'BIENVENIDO') return '10% de descuento aplicado';
      throw new Error('Código no válido');
    },
  },
} satisfies Meta<typeof PromoCodeInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 360 }}>
      <PromoCodeInput {...a} />
    </div>
  ),
};
