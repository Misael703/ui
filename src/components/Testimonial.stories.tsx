import type { Meta, StoryObj } from '@storybook/react';
import { Testimonial } from './Marketing';

const meta = {
  title: 'Components/Testimonial',
  component: Testimonial,
  tags: ['autodocs'],
  args: {
    quote: 'Llevo 3 años comprándoles. Despachan rápido y los precios son honestos. Recomendado para constructoras chicas.',
    author: 'Patricio Rojas',
    role: 'Gerente de obra',
    company: 'Northwind Builders',
    rating: 5,
  },
} satisfies Meta<typeof Testimonial>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (a) => (
    <div style={{ maxWidth: 480 }}>
      <Testimonial {...a} />
    </div>
  ),
};
