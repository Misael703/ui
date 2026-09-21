import type { Meta, StoryObj } from '@storybook/react';
import { PriceDisplay } from './Commerce';

const meta = {
  title: 'Components/PriceDisplay',
  component: PriceDisplay,
  tags: ['autodocs'],
  args: { amount: 89990, compareAt: 129990, size: 'md', showDiscount: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof PriceDisplay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
