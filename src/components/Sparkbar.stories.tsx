import type { Meta, StoryObj } from '@storybook/react';
import { Sparkbar } from './Metrics';

const TREND_DATA = [12, 18, 14, 22, 19, 28, 24, 31, 27, 35];

const meta = {
  title: 'Components/Sparkbar',
  component: Sparkbar,
  tags: ['autodocs'],
  args: { data: TREND_DATA, ariaLabel: 'tendencia ventas', highlightLast: false, height: 32 },
} satisfies Meta<typeof Sparkbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Three sparkbars: plain, highlighted-last with a custom color, and taller. */
export const Examples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      <Sparkbar data={TREND_DATA} ariaLabel="tendencia ventas" />
      <Sparkbar data={TREND_DATA} highlightLast color="var(--cat-2)" />
      <div style={{ width: 200 }}>
        <Sparkbar data={[4, 8, 6, 10, 7, 12, 9, 14]} highlightLast height={48} />
      </div>
    </div>
  ),
};
